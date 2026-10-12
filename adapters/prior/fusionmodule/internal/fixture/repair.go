package fixture

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"testing"

	api "github.com/kai/prior/moduleapi/v1"
)

// RepairCapabilities are the six services of Prior's answer 69.
var RepairCapabilities = []string{api.RoleComposeCapability, api.WorkspaceCapability, api.CaptureCapability, api.IntegrateCapability, api.SnapshotCapability, api.WorkbenchCapability}

// BaseRevision is the commit the fake repository is detached at.
const BaseRevision = "0123456789abcdef0123456789abcdef01234567"

// RecordPath is the workbench record the fake repair resolves.
const RecordPath = "issues/261012-1200-one-failing-test.record.json"

// PolicyVersion is the binding's policy_version, the workflow capability.
const PolicyVersion = "fusion.repair.v1"

// RepairRuns is an attempt map: the explorer, the ordered implementer and
// reviewer pairs, and the auditor.
type RepairRuns struct {
	Explorer string
	Attempts [][2]string
	Auditor  string
}

// DefaultRuns is the six-run map most cases send.
func DefaultRuns() RepairRuns {
	return RepairRuns{Explorer: "run-explore", Attempts: [][2]string{{"run-impl-0", "run-review-0"}, {"run-impl-1", "run-review-1"}}, Auditor: "run-audit"}
}

// RepairTask is the fixed task every fake invocation carries, as compact
// JSON in the key order of schemas/repair-request.v1.json.
func RepairTask() json.RawMessage {
	return json.RawMessage(`{"summary":"Make the failing test in pkg/a pass","criteria":["go test ./... exits 0","no file outside pkg/a changes"],"context_paths":["pkg/a","pkg/b"],"write_paths":["pkg/a"],"checks":[{"name":"test","argv":["go","test","./..."],"required":true,"baseline_failure":false}],"base_revision":"` + BaseRevision + `","findings_limit":4}`)
}

// TaskSHA256 is the host-minted identity of RepairTask.
func TaskSHA256() string { return "sha256:" + Sha256Hex(RepairTask()) }

// RepairInvocation composes the outer invocation input of fusion.repair.v1.
func RepairInvocation(t *testing.T, workflowID string, runs RepairRuns, auditRef string) json.RawMessage {
	t.Helper()
	return repairInvocation(t, workflowID, RepairTask(), RecordPath, "issue", runs, auditRef)
}

func repairInvocation(t *testing.T, workflowID string, task json.RawMessage, recordPath, recordKind string, runs RepairRuns, auditRef string) json.RawMessage {
	t.Helper()
	attempts := make([]map[string]string, 0, len(runs.Attempts))
	for _, pair := range runs.Attempts {
		attempts = append(attempts, map[string]string{"code-implementer": pair[0], "reviewer": pair[1]})
	}
	obj := map[string]any{
		"workflow_id": workflowID,
		"task":        task,
		"task_sha256": "sha256:" + Sha256Hex(task),
		"record":      map[string]string{"path": recordPath, "kind": recordKind},
		"runs":        map[string]any{"explorer": runs.Explorer, "attempts": attempts, "state-auditor": runs.Auditor},
	}
	if auditRef != "" {
		obj["audit_ref"] = auditRef
	}
	return mustJSON(t, obj)
}

// RepairCall is one recorded repair service call.
type RepairCall struct {
	Capability  string
	Slot        string
	OperationID string
	Input       []byte
}

// Receipt is a completed call's frozen request and its reply, replayed on
// the same operation id with the same bytes.
type Receipt struct {
	Input []byte
	Reply []byte
}

type capture struct {
	tree        string
	binding     json.RawMessage
	validations json.RawMessage
}

type integration struct {
	implementer, reviewer, tree, commit, reference string
}

// RepairHost is a fake durable host for the repair workflow: the role
// services of Host over the four profiles, and the six repair services with
// a receipt journal. A completed receipt replays without a second effect; a
// changed request under the same operation id is a conflict; an effect's
// precondition not met is a refusal with the code answer 69 names. Every
// request's frozen bytes and operation id are recorded.
type RepairHost struct {
	*Host
	mu         sync.Mutex
	WorkflowID string
	Map        RepairRuns
	// Task is the approved task the host binds the workflow to, RepairTask
	// unless a caller sets another: its digest is the binding's plan_hash,
	// its checks are the ones capture and integrate validate.
	Task json.RawMessage
	// Base is the commit the fake repository is detached at, BaseRevision
	// unless a caller sets the revision of a real repository.
	Base string
	// RecordPath and RecordKind select the workbench record the repair
	// resolves: RecordPath and "issue" unless a caller sets a package.
	RecordPath string
	RecordKind string
	// Record is the workbench object a read serves; Revision its revision.
	Record   json.RawMessage
	Revision string
	// PageBytes is the page size a read is cut into; zero is the 65536 bound.
	PageBytes int
	// ClosePaged answers the closure as a page descriptor instead of inline.
	ClosePaged bool
	// ContextText is the one instruction file the host adds as
	// project_context; empty is a short CLAUDE.md.
	ContextText string
	// Refuse answers a refusal with the code at a "<capability>/<slot>" key;
	// Recover answers recovery-required there. Neither is journalled.
	Refuse  map[string]string
	Recover map[string]bool
	// Calls lists every repair service call received, in order.
	Calls []RepairCall
	// Receipts is the journal by operation id.
	Receipts map[string]*Receipt
	// Effects counts the effects performed per "<capability>/<slot>" key,
	// replays excluded.
	Effects map[string]int

	schemas     map[string]json.RawMessage
	composed    map[string][]byte
	workspaces  map[string]bool
	captures    map[string]*capture
	integration *integration
	snapshot    bool
	objects     map[string][]byte
}

// NewRepairHost builds a fake host serving the four profiles, each run's
// principal distinct, the default model answers (a done implementation, an
// accepting review, a passing audit) and the result schemas of the catalog
// as output contracts.
func NewRepairHost(t *testing.T, catalogDir, workflowID string, runs RepairRuns) *RepairHost {
	t.Helper()
	h := newRepairHost(workflowID, runs)
	h.loadSchemas(t, catalogDir, func(id string) string { return filepath.Join("profiles", id, "profile.json") })
	return h
}

// NewRepairHostFromPayload is NewRepairHost over an installed payload, the
// extracted bundle the conformance starts: the profiles stand at
// profiles/<id>.json and the schemas where those profiles name them.
func NewRepairHostFromPayload(t *testing.T, payloadDir, workflowID string, runs RepairRuns) *RepairHost {
	t.Helper()
	h := newRepairHost(workflowID, runs)
	h.loadSchemas(t, payloadDir, func(id string) string { return filepath.Join("profiles", id+".json") })
	return h
}

func newRepairHost(workflowID string, runs RepairRuns) *RepairHost {
	h := &RepairHost{
		Host:       NewHost(),
		WorkflowID: workflowID,
		Map:        runs,
		Task:       RepairTask(),
		Base:       BaseRevision,
		RecordPath: RecordPath,
		RecordKind: "issue",
		Record:     json.RawMessage(`{"control":{"kind":"issue","state":"open","revision":"7"},"narrative":"# One failing test\n\n---\npkg/a/a_test.go fails since the last refactor.\n"}`),
		Revision:   "7",
		Refuse:     map[string]string{},
		Recover:    map[string]bool{},
		Receipts:   map[string]*Receipt{},
		Effects:    map[string]int{},
		schemas:    map[string]json.RawMessage{},
		composed:   map[string][]byte{},
		workspaces: map[string]bool{},
		captures:   map[string]*capture{},
		objects:    map[string][]byte{},
	}
	h.Host.Profiles = Profiles
	h.Host.Principal = func(profile, runID string) string { return "principal:" + profile + ":" + runID }
	h.Host.Models = map[string]func(string, json.RawMessage) json.RawMessage{
		"explorer":         func(string, json.RawMessage) json.RawMessage { return Answer(1) },
		"code-implementer": ImplementerDone,
		"reviewer":         Review("accept"),
		"state-auditor":    AuditPassed,
	}
	return h
}

// loadSchemas reads each profile's result schema under root, the profile at
// the path profileOf gives, and keeps it compact as the output contract.
func (h *RepairHost) loadSchemas(t *testing.T, root string, profileOf func(id string) string) {
	t.Helper()
	for _, id := range Profiles {
		var profile struct {
			ResultSchema string `json:"result_schema"`
		}
		body, err := os.ReadFile(filepath.Join(root, profileOf(id)))
		if err != nil {
			t.Fatal(err)
		}
		if err := json.Unmarshal(body, &profile); err != nil {
			t.Fatal(err)
		}
		schema, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(profile.ResultSchema)))
		if err != nil {
			t.Fatal(err)
		}
		var compact bytes.Buffer
		if err := json.Compact(&compact, schema); err != nil {
			t.Fatal(err)
		}
		h.schemas[id] = compact.Bytes()
	}
}

// Invocation composes the outer invocation input of fusion.repair.v1 for
// this host's workflow: its task, its record and its attempt map.
func (h *RepairHost) Invocation(t *testing.T, auditRef string) json.RawMessage {
	t.Helper()
	return repairInvocation(t, h.WorkflowID, h.Task, h.RecordPath, h.RecordKind, h.Map, auditRef)
}

// taskSHA256 is the host-minted identity of the bound task.
func (h *RepairHost) taskSHA256() string { return "sha256:" + Sha256Hex(h.Task) }

// after is the revision the close writes: the numeric successor of a
// numeric revision, else a digest over the revision and the record.
func (h *RepairHost) after() string {
	if before, err := strconv.Atoi(h.Revision); err == nil {
		return strconv.Itoa(before + 1)
	}
	return "sha256:" + Sha256Hex([]byte(h.Revision+"\nclosed\n"+string(h.Record)))
}

// ImplementerDone is a done implementer result over the frozen input: one
// exit entry per check, exit code 0, the first write path changed.
func ImplementerDone(_ string, input json.RawMessage) json.RawMessage {
	in := implementerInput(input)
	verification := make([]map[string]any, 0, len(in.Checks))
	for _, c := range in.Checks {
		verification = append(verification, map[string]any{"check": c.Name, "status": "exit", "command": strings.Join(c.Argv, " "), "exit_code": 0})
	}
	files := []string{}
	if len(in.WritePaths) > 0 {
		files = append(files, in.Workspace.Root+"/"+in.WritePaths[0]+"/a.go")
	}
	body, _ := json.Marshal(map[string]any{"files_changed": files, "verification": verification, "result": "done"})
	return body
}

// ImplementerBlocked is a blocked implementer result: nothing ran.
func ImplementerBlocked(_ string, input json.RawMessage) json.RawMessage {
	in := implementerInput(input)
	verification := make([]map[string]any, 0, len(in.Checks))
	for _, c := range in.Checks {
		verification = append(verification, map[string]any{"check": c.Name, "status": "none", "detail": "no process grant in this attempt"})
	}
	body, _ := json.Marshal(map[string]any{"files_changed": []string{}, "verification": verification, "result": "blocked"})
	return body
}

type implementerIn struct {
	WritePaths []string `json:"write_paths"`
	Checks     []struct {
		Name string   `json:"name"`
		Argv []string `json:"argv"`
	} `json:"checks"`
	Workspace struct {
		Root string `json:"root"`
	} `json:"workspace"`
}

func implementerInput(input json.RawMessage) implementerIn {
	var in implementerIn
	_ = json.Unmarshal(input, &in)
	return in
}

// Review is a reviewer model: the request's binding and domain echoed, the
// decision given, the objections as material_objections.
func Review(decision string, objections ...string) func(string, json.RawMessage) json.RawMessage {
	return func(_ string, input json.RawMessage) json.RawMessage {
		var in struct {
			Domain  string `json:"domain"`
			Binding struct {
				Participant    string   `json:"participant"`
				PlanHash       string   `json:"plan_hash"`
				InputRevisions []string `json:"input_revisions"`
				PolicyVersion  string   `json:"policy_version"`
			} `json:"binding"`
		}
		_ = json.Unmarshal(input, &in)
		if objections == nil {
			objections = []string{}
		}
		body, _ := json.Marshal(map[string]any{
			"participant": in.Binding.Participant, "plan_hash": in.Binding.PlanHash, "input_revisions": in.Binding.InputRevisions, "policy_version": in.Binding.PolicyVersion,
			"domain": in.Domain, "decision": decision, "material_objections": objections, "evidence": []string{"every host check passed on the captured tree"}, "findings": []any{},
		})
		return body
	}
}

// ReviewWrongBinding is an accepting review whose participant is not the
// request's.
func ReviewWrongBinding(runID string, input json.RawMessage) json.RawMessage {
	body := Review("accept")(runID, input)
	var obj map[string]any
	_ = json.Unmarshal(body, &obj)
	obj["participant"] = "principal:somebody-else"
	out, _ := json.Marshal(obj)
	return out
}

func auditResult(passed bool) json.RawMessage {
	result := map[string]any{
		"agreements":    []string{"integration.commit is the head of the accepted reference"},
		"discrepancies": []any{},
		"unknowns":      []string{},
		"limitations":   []string{},
		"coherence": map[string]any{
			"audit_result":             "coherent",
			"edges":                    map[string]string{"artefact_evidence_base": "the diff matches the brief: pkg/a/a.go", "artefact_brief": "criteria met: go test ./... exit 0", "evidence_base_brief": "the record names the failing test the diff fixes"},
			"rebalance_recommendation": "none",
		},
		"report":           map[string]any{"plans_reviewed": 1, "plans_updated": 0, "issues_reviewed": 1, "issues_updated": 0, "key_findings": []string{}, "issues": []any{}, "decisions": []any{}},
		"tracking_changes": []any{},
	}
	if !passed {
		result["discrepancies"] = []map[string]string{{"surface": "workbench", "owner": "code-implementer", "detail": "the record names a second failing test the diff does not touch"}}
		result["coherence"].(map[string]any)["audit_result"] = "review-needed"
		result["coherence"].(map[string]any)["rebalance_recommendation"] = "revise artefact"
	}
	body, _ := json.Marshal(result)
	return body
}

// AuditPassed is a passing audit result.
func AuditPassed(string, json.RawMessage) json.RawMessage { return auditResult(true) }

// AuditFailed is an audit result with a discrepancy.
func AuditFailed(string, json.RawMessage) json.RawMessage { return auditResult(false) }

func (h *RepairHost) attemptOf(runID string) (int, bool) {
	for i, pair := range h.Map.Attempts {
		if pair[0] == runID {
			return i, true
		}
		if pair[1] == runID {
			return i, false
		}
	}
	return -1, false
}

// Services are the nine handlers: the role services gated on composition,
// and the six repair services.
func (h *RepairHost) Services() map[string]api.Handler {
	out := map[string]api.Handler{}
	for capability, handler := range h.Host.Services() {
		out[capability] = h.gate(capability, handler)
	}
	for _, capability := range RepairCapabilities {
		out[capability] = func(_ context.Context, inv api.Invocation) (json.RawMessage, error) {
			return h.serve(capability, inv), nil
		}
	}
	return out
}

// gate refuses a run of a role whose input the host did not compose
// (69.1: role.run requires prior composition).
func (h *RepairHost) gate(capability string, handler api.Handler) api.Handler {
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
func (h *RepairHost) Caller() api.HostCaller {
	services := h.Services()
	return callerFunc(func(ctx context.Context, inv api.Invocation) (json.RawMessage, error) {
		handler := services[inv.Capability]
		if handler == nil {
			return nil, api.ErrCapability
		}
		return handler(ctx, inv)
	})
}

func refusal(state, code string) json.RawMessage {
	body, _ := json.Marshal(map[string]any{"state": state, "result": nil, "code": code})
	return body
}

func (h *RepairHost) serve(capability string, inv api.Invocation) json.RawMessage {
	call, slot, err := api.DecodeRepairCall(inv)
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

// CountRepair returns how many recorded repair calls used a capability.
func (h *RepairHost) CountRepair(capability string) int {
	h.mu.Lock()
	defer h.mu.Unlock()
	n := 0
	for _, c := range h.Calls {
		if c.Capability == capability {
			n++
		}
	}
	return n
}

// Composed returns the frozen role input of a run, nil when none.
func (h *RepairHost) Composed(runID string) []byte {
	h.mu.Lock()
	defer h.mu.Unlock()
	return h.composed[runID]
}

func (h *RepairHost) effect(capability string, call api.RepairCall) (json.RawMessage, string) {
	switch capability {
	case api.RoleComposeCapability:
		return h.compose(call)
	case api.WorkspaceCapability:
		if _, implementer := h.attemptOf(call.RunID); !implementer {
			return nil, "invalid-request"
		}
		h.workspaces[call.RunID] = true
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

func marshal(v any) json.RawMessage {
	body, _ := json.Marshal(v)
	return body
}

func (h *RepairHost) compose(call api.RepairCall) (json.RawMessage, string) {
	if !h.Host.serves(call.Profile) {
		return nil, "permission-denied"
	}
	switch call.Profile {
	case "code-implementer":
		if !h.workspaces[call.RunID] {
			return nil, "conflict"
		}
	case "reviewer":
		i, implementer := h.attemptOf(call.RunID)
		if i < 0 || implementer || h.captures[h.Map.Attempts[i][0]] == nil {
			return nil, "conflict"
		}
	case "state-auditor":
		if !h.snapshot {
			return nil, "conflict"
		}
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
	head := strings.TrimSuffix(task.String(), "}")
	if head != "{" {
		head += ","
	}
	// The digest covers the bytes as the reply carries them, which is the
	// encoder's representation (HTML-escaped where a schema description
	// holds a `<`), not the concatenation above.
	roleInput, err := json.Marshal(json.RawMessage(head + `"project_context":` + string(context) + `,"output_contract":` + string(h.schemas[call.Profile]) + "}"))
	if err != nil {
		return nil, "invalid-request"
	}
	h.composed[call.RunID] = roleInput
	return marshal(map[string]any{"run_id": call.RunID, "profile": call.Profile, "role_input": json.RawMessage(roleInput), "role_input_sha256": "sha256:" + Sha256Hex(roleInput)}), ""
}

func (h *RepairHost) settled(runID string) *api.RoleAnswer {
	h.Host.mu.Lock()
	defer h.Host.mu.Unlock()
	run := h.Host.Runs[runID]
	if run == nil || run.State != "settled" || run.Answer == nil {
		return nil
	}
	return run.Answer
}

func (h *RepairHost) checkNames() []string {
	var checks []struct {
		Name string `json:"name"`
	}
	_ = json.Unmarshal(h.taskChecks(), &checks)
	names := make([]string, 0, len(checks))
	for _, c := range checks {
		names = append(names, c.Name)
	}
	return names
}

func (h *RepairHost) validations(tree string) json.RawMessage {
	entries := []map[string]any{}
	for _, name := range h.checkNames() {
		entries = append(entries, map[string]any{"name": name, "status": "passed", "detail": "", "tree": tree, "contained": true, "required": true})
	}
	return marshal(entries)
}

func (h *RepairHost) capture(call api.RepairCall) (json.RawMessage, string) {
	i, implementer := h.attemptOf(call.RunID)
	if i < 0 || !implementer {
		return nil, "invalid-request"
	}
	if !h.workspaces[call.RunID] {
		return nil, "conflict"
	}
	answer := h.settled(call.RunID)
	var result struct {
		Result string `json:"result"`
	}
	if answer == nil || json.Unmarshal(answer.Output, &result) != nil || result.Result != "done" {
		return nil, "conflict"
	}
	tree := "tree:" + call.RunID
	diff := "diff --git a/pkg/a/a.go b/pkg/a/a.go\n--- a/pkg/a/a.go\n+++ b/pkg/a/a.go\n@@ -1 +1 @@\n-return 1\n+return 2\n"
	reviewer := h.Map.Attempts[i][1]
	binding := marshal(map[string]any{"participant": h.Host.principal("reviewer", reviewer), "plan_hash": h.taskSHA256(), "input_revisions": []string{h.Base, tree}, "policy_version": PolicyVersion})
	validations := h.validations(tree)
	h.captures[call.RunID] = &capture{tree: tree, binding: binding, validations: validations}
	return marshal(map[string]any{
		"base_revision": h.Base, "tree": tree, "diff": diff, "diff_sha256": "sha256:" + Sha256Hex([]byte(diff)),
		"validations": validations, "criteria_sha256": "sha256:" + Sha256Hex([]byte("criteria")), "inputs_sha256": "sha256:" + Sha256Hex([]byte("inputs")),
		"binding": binding,
	}), ""
}

func (h *RepairHost) integrate(call api.RepairCall) (json.RawMessage, string) {
	i, implementer := h.attemptOf(call.RunID)
	if i < 0 || implementer {
		return nil, "invalid-request"
	}
	implementerRun := h.Map.Attempts[i][0]
	captured := h.captures[implementerRun]
	answer := h.settled(call.RunID)
	if captured == nil || answer == nil {
		return nil, "conflict"
	}
	var review struct {
		Participant        string   `json:"participant"`
		PlanHash           string   `json:"plan_hash"`
		InputRevisions     []string `json:"input_revisions"`
		PolicyVersion      string   `json:"policy_version"`
		Domain             string   `json:"domain"`
		Decision           string   `json:"decision"`
		MaterialObjections []string `json:"material_objections"`
	}
	var binding struct {
		Participant    string   `json:"participant"`
		PlanHash       string   `json:"plan_hash"`
		InputRevisions []string `json:"input_revisions"`
		PolicyVersion  string   `json:"policy_version"`
	}
	_ = json.Unmarshal(answer.Output, &review)
	_ = json.Unmarshal(captured.binding, &binding)
	echoed := review.Participant == binding.Participant && review.PlanHash == binding.PlanHash && review.PolicyVersion == binding.PolicyVersion && strings.Join(review.InputRevisions, ",") == strings.Join(binding.InputRevisions, ",")
	if !echoed || review.Domain != "code" || review.Decision != "accept" || len(review.MaterialObjections) != 0 {
		return nil, "correction-required"
	}
	h.integration = &integration{implementer: implementerRun, reviewer: call.RunID, tree: captured.tree, commit: Sha256Hex([]byte(captured.tree)), reference: "refs/prior/accepted/fusion-repair"}
	return marshal(map[string]any{
		"id": "integration-1", "state": "integrated", "reference": h.integration.reference, "base": h.Base, "tree": captured.tree, "commit": h.integration.commit,
		"record_name": h.RecordPath, "record_revision": h.Revision, "author": h.Host.principal("code-implementer", implementerRun), "reviewer": h.Host.principal("reviewer", call.RunID),
		"checks": h.taskChecks(), "validations": h.validations(captured.tree), "correction": "",
	}), ""
}

func (h *RepairHost) taskChecks() json.RawMessage {
	var task struct {
		Checks json.RawMessage `json:"checks"`
	}
	_ = json.Unmarshal(h.Task, &task)
	return task.Checks
}

func (h *RepairHost) snapshotResult() (json.RawMessage, string) {
	if h.integration == nil {
		return nil, "conflict"
	}
	h.snapshot = true
	runs := []map[string]any{}
	unused := []map[string]any{}
	h.Host.mu.Lock()
	ids := []string{h.Map.Explorer}
	for _, pair := range h.Map.Attempts {
		ids = append(ids, pair[0], pair[1])
	}
	for _, id := range ids {
		run := h.Host.Runs[id]
		if run == nil {
			unused = append(unused, map[string]any{"run_id": id, "state": "absent", "proof": "no role operation, no reservation, no model call"})
			continue
		}
		entry := map[string]any{"run_id": id, "state": run.State}
		if run.Answer != nil {
			entry["profile"] = run.Answer.Profile
			entry["principal_id"] = run.Answer.PrincipalID
			entry["receipt_sha256"] = "sha256:" + Sha256Hex(run.Answer.Output)
		}
		runs = append(runs, entry)
	}
	h.Host.mu.Unlock()
	return marshal(map[string]any{
		"snapshot_id": "snapshot-1", "integration_id": "integration-1", "reference": h.integration.reference, "commit": h.integration.commit, "tree": h.integration.tree,
		"changed_paths":     []string{"pkg/a/a.go"},
		"file_observations": []map[string]any{{"path": "pkg/a/a.go", "expected_blob": "blob:" + h.integration.tree, "observed_sha256": "sha256:" + Sha256Hex([]byte("return 2")), "match": true}},
		"runs":              runs,
		"unused_runs":       unused,
		"accounting":        map[string]any{"accounts": []map[string]any{{"account": "fake", "runs": len(runs), "settled": true}}},
		"limitations":       []string{},
	}), ""
}

func (h *RepairHost) descriptor(handle string, object []byte, offset int) json.RawMessage {
	size := h.PageBytes
	if size <= 0 {
		size = 65536
	}
	n := len(object) - offset
	if n > size {
		n = size
	}
	var next any
	if offset+n < len(object) {
		next = offset + n
	}
	return marshal(map[string]any{
		"handle": handle, "sha256": "sha256:" + Sha256Hex(object), "total_bytes": len(object), "offset": offset, "page_bytes": n,
		"data_base64": base64.StdEncoding.EncodeToString(object[offset : offset+n]), "next_offset": next,
	})
}

func (h *RepairHost) workbench(call api.RepairCall) (json.RawMessage, string) {
	switch call.Action {
	case "read":
		if call.Record != h.RecordPath {
			return nil, "permission-denied"
		}
		object := []byte(`{"record":` + string(bytes.TrimSpace(h.Record)) + `,"revision":"` + h.Revision + `"}`)
		handle := Sha256Hex([]byte(h.WorkflowID + ":read:" + call.Record))
		h.objects[handle] = object
		return h.descriptor(handle, object, 0), ""
	case "page":
		object := h.objects[call.Handle]
		if object == nil || call.Offset == nil || *call.Offset >= int64(len(object)) {
			return nil, "invalid-request"
		}
		return h.descriptor(call.Handle, object, int(*call.Offset)), ""
	case "close":
		if call.AuditRunID != h.Map.Auditor || h.integration == nil {
			return nil, "conflict"
		}
		answer := h.settled(call.AuditRunID)
		var audit struct {
			Agreements    []string `json:"agreements"`
			Discrepancies []any    `json:"discrepancies"`
			Unknowns      []any    `json:"unknowns"`
			Coherence     struct {
				AuditResult string `json:"audit_result"`
				Rebalance   string `json:"rebalance_recommendation"`
			} `json:"coherence"`
		}
		if answer == nil || json.Unmarshal(answer.Output, &audit) != nil || len(audit.Agreements) == 0 || len(audit.Discrepancies) != 0 || len(audit.Unknowns) != 0 || audit.Coherence.AuditResult != "coherent" || audit.Coherence.Rebalance != "none" {
			return nil, "conflict"
		}
		closure := marshal(map[string]any{"record": h.RecordPath, "before": h.Revision, "after": h.after(), "reconciled": true})
		if !h.ClosePaged {
			return closure, ""
		}
		handle := Sha256Hex([]byte(h.WorkflowID + ":close"))
		h.objects[handle] = closure
		return h.descriptor(handle, closure, 0), ""
	}
	return nil, "invalid-request"
}
