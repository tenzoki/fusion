package fixture

import (
	"bytes"
	"context"
	"encoding/json"
	"io/fs"
	"regexp"
	"strings"
	"sync"

	api "github.com/kai/prior/moduleapi/v1"
)

// EntryCapabilities are the three entry services of Prior's
// moduleapi/v1/entry_wire.go. Prior binds them as model tools of a role run
// (internal/supervisor/general_tools.go): the module calls none of them, so
// this fake serves them to the scripted role run and refuses them to the
// module.
var EntryCapabilities = []string{api.QuestionCapability, api.ExecCapability, api.DispatchCapability}

// EntryReference is the accepted reference the fake integration advances.
const EntryReference = "refs/prior/accepted/fusion-entry"

// WorkbenchPrefix is where the workbench sits in the fake repository: a
// changed path below it ending in .json is a control record, which the
// workbench step reads by its workbench-relative path.
const WorkbenchPrefix = "fusion-workbench/"

// ScriptCall is one call a scripted role run makes to an entry service, in
// the run's own order.
type ScriptCall struct {
	Capability string
	CallID     string
	// Question, Options, MultiSelect and Channel are a question's; Answer is
	// what the fake terminal answers it.
	Question    string
	Options     []string
	MultiSelect bool
	Channel     string
	Answer      api.QuestionResult
	// Argv is a command's.
	Argv []string
	// Entry is the child a dispatch runs.
	Entry string
	// Writes are the repository paths a command or a dispatched child changes
	// in the run's workspace.
	Writes []string
}

// Script is a scripted role run: the service calls it makes, then its answer,
// an entry-result object. A question answered ended stops the run there with
// ending stop; a refused service call ends it refused; Refuse, when set, ends
// it refused with that reason after its calls.
type Script struct {
	Calls  []ScriptCall
	Refuse string
}

// EntryHost is a fake durable host for the entry workflow: the role services
// of Host, the six request-69 services with a receipt journal as RepairHost
// keeps it, and the three entry services, which only the scripted role run
// reaches. A completed receipt replays without a second effect; a changed
// request under the same operation id is a conflict.
type EntryHost struct {
	*Host
	mu sync.Mutex
	// WorkflowID and RunID are the invocation's identity and its one run.
	WorkflowID string
	RunID      string
	// Base is the commit the fake repository is detached at.
	Base string
	// ContextText is the one instruction file compose adds as project_context;
	// empty is a short CLAUDE.md.
	ContextText string
	// PageBytes is the page size a read is cut into; zero is the 65536 bound.
	PageBytes int
	// Scripts are the role runs by profile.
	Scripts map[string]Script
	// Refuse answers a refusal with the code at a "<capability>/<slot>" key;
	// Recover answers recovery-required there. Neither is journalled.
	Refuse  map[string]string
	Recover map[string]bool
	// Calls lists every request-69 call the module sent, in order.
	Calls []RepairCall
	// Sent lists the capability of every call the module sent, role and
	// entry services included, in order.
	Sent []string
	// Receipts is the journal of the request-69 services by operation id.
	Receipts map[string]*Receipt
	// Effects counts the effects performed per "<capability>/<slot>" key,
	// replays excluded.
	Effects map[string]int

	composed   map[string][]byte
	workspace  bool
	captured   *capture
	integrated *integration
	objects    map[string][]byte

	// runMu guards what the role run touches from inside the model, which
	// holds the role store's lock: the entry services' journal and the paths
	// the run changed. Lock order: mu, then Host.mu, then runMu.
	runMu         sync.Mutex
	entryCalls    []RepairCall
	entryReceipts map[string]*Receipt
	writes        []string
}

// NewEntryHost builds a fake host for one invocation's run, serving the
// given profiles, each run's principal distinct, each profile's model its
// script in Scripts.
func NewEntryHost(workflowID, runID string, profiles ...string) *EntryHost {
	h := &EntryHost{
		Host:          NewHost(),
		WorkflowID:    workflowID,
		RunID:         runID,
		Base:          BaseRevision,
		Scripts:       map[string]Script{},
		Refuse:        map[string]string{},
		Recover:       map[string]bool{},
		Receipts:      map[string]*Receipt{},
		Effects:       map[string]int{},
		composed:      map[string][]byte{},
		objects:       map[string][]byte{},
		entryReceipts: map[string]*Receipt{},
	}
	h.Host.Profiles = profiles
	h.Host.Principal = func(profile, runID string) string { return "principal:" + profile + ":" + runID }
	h.Host.Models = map[string]func(string, json.RawMessage) json.RawMessage{}
	for _, profile := range profiles {
		h.Host.Models[profile] = h.scripted(profile)
	}
	return h
}

// EntryCalls returns the entry service calls the role run made, in order;
// Slot holds the call_id.
func (h *EntryHost) EntryCalls() []RepairCall {
	h.runMu.Lock()
	defer h.runMu.Unlock()
	return append([]RepairCall(nil), h.entryCalls...)
}

// Changed returns the paths the run changed, in the order first written.
func (h *EntryHost) Changed() []string {
	h.runMu.Lock()
	defer h.runMu.Unlock()
	return append([]string(nil), h.writes...)
}

// Tree is the workspace's fingerprint: the base and the paths changed.
func (h *EntryHost) Tree() string {
	h.runMu.Lock()
	defer h.runMu.Unlock()
	return h.tree()
}

func (h *EntryHost) tree() string {
	return "sha256:" + Sha256Hex([]byte(h.Base+"\n"+strings.Join(h.writes, "\n")))
}

func (h *EntryHost) write(paths []string) {
	for _, p := range paths {
		seen := false
		for _, w := range h.writes {
			seen = seen || w == p
		}
		if !seen {
			h.writes = append(h.writes, p)
		}
	}
}

// scripted is a profile's model: it makes the script's calls through the
// entry services as Prior's model loop would, each under the run as actor,
// and answers an entry-result object whose questions are copied from the
// question replies.
func (h *EntryHost) scripted(profile string) func(string, json.RawMessage) json.RawMessage {
	return func(runID string, input json.RawMessage) json.RawMessage {
		var in struct {
			WorkflowID string `json:"workflow_id"`
		}
		_ = json.Unmarshal(input, &in)
		script := h.Scripts[profile]
		status, ending := "completed", map[string]string{"class": "success", "reason": "answered"}
		questions := []map[string]any{}
		violations := []map[string]string{}
		refuse := func(reason, detail string) {
			status, ending = "refused", map[string]string{"class": "refusal", "reason": reason}
			violations = append(violations, map[string]string{"code": reason, "detail": detail})
		}
	calls:
		for _, step := range script.Calls {
			binding := api.EntryBinding{Identity: Identity, WorkflowID: in.WorkflowID, Actor: runID, CallID: step.CallID}
			var body []byte
			switch step.Capability {
			case api.QuestionCapability:
				body, _ = json.Marshal(api.QuestionCall{EntryBinding: binding, Question: step.Question, Options: step.Options, MultiSelect: step.MultiSelect, Channel: step.Channel})
			case api.ExecCapability:
				body, _ = json.Marshal(api.ExecCall{EntryBinding: binding, Argv: step.Argv, Directory: ".", TimeoutMS: 60000, ExpectedWorkspace: h.Tree()})
			case api.DispatchCapability:
				body, _ = json.Marshal(api.DispatchCall{EntryBinding: binding, Entry: step.Entry, Description: "run " + step.Entry, Input: json.RawMessage(`{"task":"scripted"}`), ExpectedWorkspace: h.Tree()})
			}
			inv := api.Invocation{OperationID: api.EntryOperationID(step.Capability, in.WorkflowID, runID, step.CallID), Capability: step.Capability, Input: body}
			response, err := api.DecodeEntryResponse(step.Capability, h.serveEntry(inv, step))
			if err != nil || response.State != "completed" {
				refuse("service-refused", step.Capability+" "+step.CallID+" "+response.Code)
				break calls
			}
			if step.Capability != api.QuestionCapability {
				continue
			}
			call, _ := api.DecodeQuestionCall(inv)
			answer, err := call.DecodeResult(response.Result)
			if err != nil {
				refuse("service-refused", step.CallID+" answer")
				break calls
			}
			options := step.Options
			if options == nil {
				options = []string{}
			}
			selected := answer.Selected
			if selected == nil {
				selected = []string{}
			}
			questions = append(questions, map[string]any{"call_id": step.CallID, "question": step.Question, "options": options, "channel": step.Channel, "outcome": answer.Outcome, "selected": selected, "text": answer.Text})
			if answer.Outcome == api.QuestionEnded {
				status, ending = "ended", map[string]string{"class": "stop", "reason": "ended-by-question"}
				break calls
			}
		}
		if script.Refuse != "" && status == "completed" {
			refuse(script.Refuse, "the run refused")
		}
		return marshal(map[string]any{"status": status, "ending": ending, "questions": questions, "commits": []any{}, "violations": violations})
	}
}

func entryReply(state string, result any, code string) []byte {
	return marshal(map[string]any{"state": state, "result": result, "code": code})
}

// serveEntry answers one entry service call of the run, decoded with Prior's
// own decoders, journalled by operation id.
func (h *EntryHost) serveEntry(inv api.Invocation, step ScriptCall) []byte {
	h.runMu.Lock()
	defer h.runMu.Unlock()
	var binding api.EntryBinding
	var expected string
	var err error
	switch inv.Capability {
	case api.QuestionCapability:
		var c api.QuestionCall
		c, err = api.DecodeQuestionCall(inv)
		binding = c.EntryBinding
	case api.ExecCapability:
		var c api.ExecCall
		c, err = api.DecodeExecCall(inv)
		binding, expected = c.EntryBinding, c.ExpectedWorkspace
	case api.DispatchCapability:
		var c api.DispatchCall
		c, err = api.DecodeDispatchCall(inv)
		binding, expected = c.EntryBinding, c.ExpectedWorkspace
	default:
		return entryReply("refused", nil, "invalid-request")
	}
	if err != nil {
		return entryReply("refused", nil, "invalid-request")
	}
	h.entryCalls = append(h.entryCalls, RepairCall{inv.Capability, binding.CallID, inv.OperationID, append([]byte(nil), inv.Input...)})
	if binding.Identity != Identity || binding.WorkflowID != h.WorkflowID || binding.Actor != h.RunID {
		return entryReply("refused", nil, "permission-denied")
	}
	if r := h.entryReceipts[inv.OperationID]; r != nil {
		if !bytes.Equal(r.Input, inv.Input) {
			return entryReply("refused", nil, "conflict")
		}
		return r.Reply
	}
	var result any
	switch inv.Capability {
	case api.QuestionCapability:
		result = step.Answer
	case api.ExecCapability:
		if expected != h.tree() {
			return entryReply("refused", nil, "conflict")
		}
		h.write(step.Writes)
		result = api.ExecResult{ExitStatus: 0, Stdout: "ok\n", TreeBefore: expected, TreeAfter: h.tree()}
	case api.DispatchCapability:
		if expected != h.tree() {
			return entryReply("refused", nil, "conflict")
		}
		h.write(step.Writes)
		result = api.DispatchResult{ChildRunID: binding.Actor + "-" + binding.CallID, Entry: step.Entry, Output: json.RawMessage(`{"status":"completed"}`)}
	}
	reply := entryReply("completed", result, "")
	h.entryReceipts[inv.OperationID] = &Receipt{Input: append([]byte(nil), inv.Input...), Reply: reply}
	return reply
}

// Services are the handlers the module is offered: the role services gated
// on composition, the six request-69 services, and the three entry services,
// which refuse the module with permission-denied, being the run's tools.
// Every call is recorded in Sent.
func (h *EntryHost) Services() map[string]api.Handler {
	out := map[string]api.Handler{}
	record := func(capability string, handler api.Handler) api.Handler {
		return func(ctx context.Context, inv api.Invocation) (json.RawMessage, error) {
			h.mu.Lock()
			h.Sent = append(h.Sent, capability)
			h.mu.Unlock()
			return handler(ctx, inv)
		}
	}
	for capability, handler := range h.Host.Services() {
		out[capability] = record(capability, h.gate(capability, handler))
	}
	for _, capability := range RepairCapabilities {
		out[capability] = record(capability, func(_ context.Context, inv api.Invocation) (json.RawMessage, error) {
			return h.serve(capability, inv), nil
		})
	}
	for _, capability := range EntryCapabilities {
		out[capability] = record(capability, func(context.Context, api.Invocation) (json.RawMessage, error) {
			return entryReply("refused", nil, "permission-denied"), nil
		})
	}
	return out
}

// gate refuses a run of a role whose input the host did not compose
// (69.1: role.run requires prior composition).
func (h *EntryHost) gate(capability string, handler api.Handler) api.Handler {
	if capability != api.RoleRunCapability {
		return handler
	}
	return func(ctx context.Context, inv api.Invocation) (json.RawMessage, error) {
		var call api.RoleCall
		if api.Decode(inv.Input, &call) == nil {
			h.mu.Lock()
			frozen := h.composed[call.RunID]
			h.mu.Unlock()
			if frozen == nil || !bytes.Equal(frozen, call.Input) {
				return json.RawMessage(`{"state":"refused","code":"permission-denied"}`), nil
			}
		}
		return handler(ctx, inv)
	}
}

// Caller is an in-process HostCaller over the fake services.
func (h *EntryHost) Caller() api.HostCaller {
	services := h.Services()
	return callerFunc(func(ctx context.Context, inv api.Invocation) (json.RawMessage, error) {
		handler := services[inv.Capability]
		if handler == nil {
			return nil, api.ErrCapability
		}
		return handler(ctx, inv)
	})
}

// Composed returns the frozen role input of a run, nil when none.
func (h *EntryHost) Composed(runID string) []byte {
	h.mu.Lock()
	defer h.mu.Unlock()
	return h.composed[runID]
}

// CountSent returns how many calls the module sent to a capability.
func (h *EntryHost) CountSent(capability string) int {
	h.mu.Lock()
	defer h.mu.Unlock()
	n := 0
	for _, c := range h.Sent {
		if c == capability {
			n++
		}
	}
	return n
}

var (
	entryToken   = regexp.MustCompile(`^[a-zA-Z0-9_-]{1,64}$`)
	entryProfile = regexp.MustCompile(`^[a-z][a-z0-9-]*$`)
)

// decodeProposedRepairCall is api.DecodeRepairCall widened by the two request
// forms entry.v1 proposes in request 76, which Prior's decoder at the build
// pin refuses: a compose for an entry profile (the pinned decoder admits the
// four repair roles alone), and a read under slot record:<control path> (the
// pinned decoder derives every read's operation id from slot record). Every
// other request is the pinned decoder's verdict.
func decodeProposedRepairCall(inv api.Invocation) (api.RepairCall, string, error) {
	call, slot, err := api.DecodeRepairCall(inv)
	if err == nil {
		return call, slot, nil
	}
	if api.Decode(inv.Input, &call) != nil {
		return call, "", err
	}
	var fields []string
	switch {
	case inv.Capability == api.RoleComposeCapability:
		var task map[string]json.RawMessage
		if api.Decode(call.Task, &task) != nil || !entryProfile.MatchString(call.Profile) || !entryToken.MatchString(call.RunID) {
			return call, "", err
		}
		for _, member := range []string{"project_context", "output_contract"} {
			if _, exists := task[member]; exists {
				return call, "", err
			}
		}
		fields, slot = []string{"identity", "workflow_id", "run_id", "profile", "task"}, call.RunID
	case inv.Capability == api.WorkbenchCapability && call.Action == "read":
		if !fs.ValidPath(call.Record) || strings.ContainsAny(call.Record, "\\:\x00\r\n") || !strings.HasSuffix(call.Record, ".json") {
			return call, "", err
		}
		fields, slot = []string{"identity", "workflow_id", "action", "record"}, "record:"+call.Record
	default:
		return call, "", err
	}
	var object map[string]json.RawMessage
	if json.Unmarshal(inv.Input, &object) != nil || len(object) != len(fields) {
		return call, "", err
	}
	for _, name := range fields {
		if value, ok := object[name]; !ok || bytes.Equal(bytes.TrimSpace(value), []byte("null")) {
			return call, "", err
		}
	}
	if !entryToken.MatchString(call.WorkflowID) || call.Identity.Validate() != nil || inv.OperationID != api.RepairOperationID(inv.Capability, call.WorkflowID, slot) {
		return call, "", err
	}
	return call, slot, nil
}

func (h *EntryHost) serve(capability string, inv api.Invocation) json.RawMessage {
	call, slot, err := decodeProposedRepairCall(inv)
	if err != nil {
		return refusal("refused", "invalid-request")
	}
	h.mu.Lock()
	defer h.mu.Unlock()
	h.Calls = append(h.Calls, RepairCall{capability, slot, inv.OperationID, append([]byte(nil), inv.Input...)})
	if call.Identity != Identity || call.WorkflowID != h.WorkflowID {
		return refusal("refused", "permission-denied")
	}
	key := capability + "/" + slot
	if r := h.Receipts[inv.OperationID]; r != nil {
		if !bytes.Equal(r.Input, inv.Input) {
			return refusal("refused", "conflict")
		}
		return r.Reply
	}
	if code := h.Refuse[key]; code != "" {
		return refusal("refused", code)
	}
	if h.Recover[key] {
		return refusal("recovery-required", "operation-unknown")
	}
	result, code := h.effect(capability, call)
	if code != "" {
		return refusal("refused", code)
	}
	h.Effects[key]++
	reply, _ := json.Marshal(map[string]any{"state": "completed", "result": result, "code": ""})
	h.Receipts[inv.OperationID] = &Receipt{Input: append([]byte(nil), inv.Input...), Reply: reply}
	return reply
}

func (h *EntryHost) effect(capability string, call api.RepairCall) (json.RawMessage, string) {
	switch capability {
	case api.RoleComposeCapability:
		return h.compose(call)
	case api.WorkspaceCapability:
		if call.RunID != h.RunID {
			return nil, "invalid-request"
		}
		h.workspace = true
		return marshal(map[string]any{"root": "workspace:" + call.RunID, "base_revision": h.Base}), ""
	case api.CaptureCapability:
		return h.capture(call)
	case api.IntegrateCapability:
		return h.integrate(call)
	case api.SnapshotCapability:
		return h.snapshotResult()
	case api.WorkbenchCapability:
		return h.workbench(call)
	}
	return nil, "operation-unknown"
}

// compose freezes the role input: the host's workflow_id and run_id, the
// module's task, and the project context; no output_contract, which
// entry-request.v1.json does not admit.
func (h *EntryHost) compose(call api.RepairCall) (json.RawMessage, string) {
	if !h.Host.serves(call.Profile) {
		return nil, "permission-denied"
	}
	if call.RunID != h.RunID {
		return nil, "invalid-request"
	}
	var task bytes.Buffer
	if json.Compact(&task, call.Task) != nil {
		return nil, "invalid-request"
	}
	text := h.ContextText
	if text == "" {
		text = "# CLAUDE.md\n\nRun make test.\n"
	}
	context := marshal(map[string]any{"instructions": []map[string]any{{"path": "CLAUDE.md", "sha256": "sha256:" + Sha256Hex([]byte(text)), "text": text}}})
	inner := strings.TrimSuffix(strings.TrimPrefix(task.String(), "{"), "}")
	if inner != "" {
		inner += ","
	}
	roleInput, err := json.Marshal(json.RawMessage(`{"workflow_id":` + string(marshal(h.WorkflowID)) + `,"run_id":` + string(marshal(call.RunID)) + "," + inner + `"project_context":` + string(context) + "}"))
	if err != nil {
		return nil, "invalid-request"
	}
	h.composed[call.RunID] = roleInput
	return marshal(map[string]any{"run_id": call.RunID, "profile": call.Profile, "role_input": json.RawMessage(roleInput), "role_input_sha256": "sha256:" + Sha256Hex(roleInput)}), ""
}

func (h *EntryHost) capture(call api.RepairCall) (json.RawMessage, string) {
	if call.RunID != h.RunID {
		return nil, "invalid-request"
	}
	if !h.workspace || h.settled(call.RunID) == nil {
		return nil, "conflict"
	}
	h.runMu.Lock()
	tree, writes := h.tree(), append([]string(nil), h.writes...)
	h.runMu.Unlock()
	diff := ""
	for _, p := range writes {
		diff += "diff --git a/" + p + " b/" + p + "\n--- a/" + p + "\n+++ b/" + p + "\n@@ -0,0 +1 @@\n+fixture\n"
	}
	h.captured = &capture{tree: tree}
	return marshal(map[string]any{"base_revision": h.Base, "tree": tree, "diff": diff, "diff_sha256": "sha256:" + Sha256Hex([]byte(diff)), "validations": []any{}}), ""
}

func (h *EntryHost) integrate(call api.RepairCall) (json.RawMessage, string) {
	if call.RunID != h.RunID {
		return nil, "invalid-request"
	}
	if h.captured == nil || len(h.Changed()) == 0 {
		return nil, "conflict"
	}
	tree := h.captured.tree
	h.integrated = &integration{implementer: call.RunID, tree: tree, commit: Sha256Hex([]byte(tree)), reference: EntryReference}
	return marshal(map[string]any{
		"id": "integration-1", "state": "integrated", "reference": EntryReference, "base": h.Base, "tree": tree, "commit": h.integrated.commit,
		"record_name": "runs/" + call.RunID, "record_revision": "1", "author": h.Host.principal(h.answeredProfile(call.RunID), call.RunID), "reviewer": "",
		"checks": []any{}, "validations": []any{}, "correction": "",
	}), ""
}

func (h *EntryHost) answeredProfile(runID string) string {
	if answer := h.settled(runID); answer != nil {
		return answer.Profile
	}
	return ""
}

func (h *EntryHost) snapshotResult() (json.RawMessage, string) {
	if h.integrated == nil {
		return nil, "conflict"
	}
	answer := h.settled(h.RunID)
	runs := []map[string]any{{"run_id": h.RunID, "state": "settled", "profile": answer.Profile, "principal_id": answer.PrincipalID, "receipt_sha256": "sha256:" + Sha256Hex(answer.Output)}}
	return marshal(map[string]any{
		"snapshot_id": "snapshot-1", "integration_id": "integration-1", "reference": h.integrated.reference, "commit": h.integrated.commit, "tree": h.integrated.tree,
		"changed_paths":     h.Changed(),
		"file_observations": []map[string]any{},
		"runs":              runs,
		"unused_runs":       []map[string]any{},
		"accounting":        map[string]any{"accounts": []map[string]any{{"account": "fake", "runs": 1, "settled": true}}},
		"limitations":       []string{},
	}), ""
}

func (h *EntryHost) workbench(call api.RepairCall) (json.RawMessage, string) {
	switch call.Action {
	case "read":
		changed := false
		for _, p := range h.Changed() {
			changed = changed || p == WorkbenchPrefix+call.Record
		}
		if h.integrated == nil || !changed {
			return nil, "permission-denied"
		}
		object := []byte(`{"record":{"control":{"kind":"package","state":"active","revision":"3"},"narrative":"# Fixture package\n"},"revision":"3"}`)
		handle := Sha256Hex([]byte(h.WorkflowID + ":read:" + call.Record))
		h.objects[handle] = object
		return pageDescriptor(h.PageBytes, handle, object, 0), ""
	case "page":
		object := h.objects[call.Handle]
		if object == nil || call.Offset == nil || *call.Offset >= int64(len(object)) {
			return nil, "invalid-request"
		}
		return pageDescriptor(h.PageBytes, call.Handle, object, int(*call.Offset)), ""
	}
	return nil, "invalid-request"
}
