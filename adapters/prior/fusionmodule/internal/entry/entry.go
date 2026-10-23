// Package entry interprets the bundle's generic entry workflow definition,
// workflows/entry.v1.json, over the step executor of internal/steps and the
// host service client of internal/hostsvc, and serves it as the module
// capability fusion.entry.v1: one run of any catalog entry, an agent or a
// skill, a user starts.
//
// The definition is fusion's proposal in request 76 (plan step 3 of the H1-H9
// hand-over). Seven steps run in order: compose, workspace, run, capture,
// integrate, snapshot and workbench. The run step takes its role from the
// invocation: the module resolves entry.id through the catalog's entries,
// checks kind and profile against the entry, and refuses an entry whose prior
// support is not supported before any host call. The definition's two schemas
// bind the run whatever the entry's profile declares (decision D5): the
// invocation and the frozen role input are validated against
// entry-request.v1.json, the settled answer and the envelope against
// entry-result.v1.json.
//
// The three entry services, host.question.v1, host.exec.v1 and
// host.dispatch.v1, are model tools of the role run, bound by Prior
// (internal/supervisor/general_tools.go). The module calls none of them: the
// definition's requires names them so that Prior grants them to the run, and
// load checks that every entry's requires is among them. The run's questions
// reach the envelope as the settled answer carries them.
//
// Restart is repair's (69.3): the role is read before it is run, through
// steps.Execute, so a run at settled is reused without a model call, one at
// answered is completed with the invocation's audit_ref on that completion
// alone, one at accepted is recovery-required and never rerun. A host
// service with a completed receipt replays its frozen request on the same
// operation id, so a restart after any persisted boundary reproduces the
// envelope with no second effect and no second role run.
package entry

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"regexp"
	"strings"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/hostsvc"
	"github.com/kai/prior/integrationbuild/fusionmodule/internal/steps"
	api "github.com/kai/prior/moduleapi/v1"
)

// WorkflowAsset is where the definition lives in the payload.
const WorkflowAsset = "workflows/entry.v1.json"

// WorkbenchPrefix is the workbench's place in the repository: a changed path
// below it ending in .json is a control record, read by its path relative to
// the workbench, as the codec names it.
const WorkbenchPrefix = "fusion-workbench/"

// ErrDefinition is returned when the definition is not one this executor can
// interpret: a shape it does not know is refused at load, never run on a
// guess.
var ErrDefinition = errors.New("entry definition not interpretable")

// expected is the step list this executor runs, in order.
var expected = []struct{ id, service string }{
	{"compose", api.RoleComposeCapability},
	{"workspace", api.WorkspaceCapability},
	{"run", api.RoleRunCapability},
	{"capture", api.CaptureCapability},
	{"integrate", api.IntegrateCapability},
	{"snapshot", api.SnapshotCapability},
	{"workbench", api.WorkbenchCapability},
}

// services are the twelve the definition must declare: the three role
// services, the six of request 69 and the three entry services. The module
// makes no preflight against the host; this is the definition's own
// consistency.
var services = append(append(append([]string(nil), steps.RoleCapabilities...), api.RoleComposeCapability, api.WorkspaceCapability, api.CaptureCapability, api.IntegrateCapability, api.SnapshotCapability, api.WorkbenchCapability), steps.EntryServices...)

type composeFrom struct {
	InvocationSchema string `json:"invocation_schema"`
	Slot             string `json:"slot"`
}

type runFrom struct {
	Role            string `json:"role"`
	Run             string `json:"run"`
	RoleInputSchema string `json:"role_input_schema"`
	Forwarded       string `json:"forwarded"`
	RecoveryRef     string `json:"recovery_ref"`
}

type runCompletion struct {
	RoleState    string `json:"role_state"`
	ResultSchema string `json:"result_schema"`
}

type workbenchCompletion struct {
	EnvelopeSchema string `json:"envelope_schema"`
}

// Definition is the entry workflow with its schemas compiled and the
// catalog's entries resolved.
type Definition struct {
	Capability string
	entries    map[string]steps.Entry
	request    *steps.Schema
	roleInput  *steps.Schema
	result     *steps.Schema
	envelope   *steps.Schema
}

// Load reads the definition, checks its seven steps against the ones this
// executor runs and the hand-over and completion members it reads, compiles
// the four schemas, and resolves the catalog's entries: every entry's
// requires must be among the definition's, and every entry supported on
// prior must have its profile in the payload.
func Load(b *steps.Bundle) (*Definition, error) {
	w, err := steps.LoadWorkflow(b, WorkflowAsset)
	if err != nil {
		return nil, err
	}
	if len(w.Steps) != len(expected) {
		return nil, fmt.Errorf("%w: %d steps, %d expected", ErrDefinition, len(w.Steps), len(expected))
	}
	for i, e := range expected {
		s := w.Steps[i]
		if s.ID != e.id || s.Role != "" || s.HostService != e.service {
			return nil, fmt.Errorf("%w: step %d is %q, expected %q", ErrDefinition, i, s.ID, e.id)
		}
	}
	if w.ReviseBound != 0 {
		return nil, fmt.Errorf("%w: revise_bound %d, this executor runs one attempt", ErrDefinition, w.ReviseBound)
	}
	if !w.Declares(services...) {
		return nil, fmt.Errorf("%w: requires must name the twelve host services", ErrDefinition)
	}
	var compose composeFrom
	if json.Unmarshal(w.Steps[0].InputFrom, &compose) != nil || compose.InvocationSchema == "" || compose.Slot != "run_id" {
		return nil, fmt.Errorf("%w: compose must name the invocation schema and slot run_id", ErrDefinition)
	}
	var from runFrom
	var done runCompletion
	if json.Unmarshal(w.Steps[2].InputFrom, &from) != nil || json.Unmarshal(w.Steps[2].Completion, &done) != nil {
		return nil, fmt.Errorf("%w: run step", ErrDefinition)
	}
	if from.Role == "" || from.Run == "" || from.RoleInputSchema == "" || from.Forwarded != "verbatim" || from.RecoveryRef != "audit_ref" {
		return nil, fmt.Errorf("%w: run must take its role from the invocation and forward verbatim under audit_ref", ErrDefinition)
	}
	if done.RoleState != "settled" || done.ResultSchema == "" {
		return nil, fmt.Errorf("%w: run completion must be a settled role with a result schema", ErrDefinition)
	}
	var closing workbenchCompletion
	if json.Unmarshal(w.Steps[len(w.Steps)-1].Completion, &closing) != nil || closing.EnvelopeSchema == "" {
		return nil, fmt.Errorf("%w: workbench must name the envelope schema", ErrDefinition)
	}
	d := &Definition{Capability: w.Capability, entries: map[string]steps.Entry{}}
	for _, s := range []struct {
		target **steps.Schema
		path   string
	}{{&d.request, compose.InvocationSchema}, {&d.roleInput, from.RoleInputSchema}, {&d.result, done.ResultSchema}, {&d.envelope, closing.EnvelopeSchema}} {
		if *s.target, err = b.Schema(s.path); err != nil {
			return nil, err
		}
	}
	catalog, err := steps.LoadCatalog(b)
	if err != nil {
		return nil, err
	}
	for _, e := range catalog.Entries() {
		if !w.Declares(e.Requires...) {
			return nil, fmt.Errorf("%w: entry %q requires a service the definition does not", ErrDefinition, e.ID)
		}
		if e.Support["prior"] == "supported" {
			if _, err := steps.LoadProfile(b, e.Profile); err != nil {
				return nil, err
			}
		}
		d.entries[e.ID] = e
	}
	return d, nil
}

// Ending is how the run ended, in the class and reason form of Prior's
// fusion-surface comparison.
type Ending struct {
	Class  string `json:"class"`
	Reason string `json:"reason"`
}

// Violation is one reason an invocation did not complete.
type Violation struct {
	Code   string `json:"code"`
	Detail string `json:"detail"`
}

// Commit is one commit the integrate step put on the accepted reference.
type Commit struct {
	Commit    string   `json:"commit"`
	Reference string   `json:"reference"`
	Subject   string   `json:"subject"`
	Changes   []string `json:"changes"`
}

// Envelope is the answer to a fusion.entry.v1 invocation,
// schemas/entry-result.v1.json.
type Envelope struct {
	Status     string            `json:"status"`
	Ending     *Ending           `json:"ending"`
	Questions  []json.RawMessage `json:"questions"`
	Commits    []Commit          `json:"commits"`
	Violations []Violation       `json:"violations"`
}

// Roles builds the role client over the workflow's HostCaller.
type Roles = steps.Roles

// RemoteRoles is the module's Roles: the SDK's client over the host caller.
func RemoteRoles(id api.Identity) Roles { return steps.RemoteRoles(id) }

// Handler serves the definition under the module's identity.
func (d *Definition) Handler(id api.Identity, roles Roles) api.WorkflowHandler {
	return func(ctx context.Context, inv api.Invocation, host api.HostCaller) (json.RawMessage, error) {
		env, err := d.invoke(ctx, id, inv, roles(host), host)
		if err != nil {
			return nil, err
		}
		return d.encode(inv.OperationID, env)
	}
}

type entryRef struct {
	ID      string `json:"id"`
	Kind    string `json:"kind"`
	Profile string `json:"profile"`
}

type argument struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

// invocation is the decoded request, schemas/entry-request.v1.json.
type invocation struct {
	WorkflowID     string          `json:"workflow_id"`
	RunID          string          `json:"run_id"`
	Entry          entryRef        `json:"entry"`
	Arguments      []argument      `json:"arguments"`
	ProjectContext json.RawMessage `json:"project_context"`
	Route          string          `json:"route,omitempty"`
	AuditRef       string          `json:"audit_ref,omitempty"`
}

// task is what the module hands host.role.compose.v1: the invocation's entry,
// arguments and route, in the key order of the schema, without run_id,
// project_context and audit_ref, which the host adds or keeps.
type task struct {
	Entry     entryRef   `json:"entry"`
	Arguments []argument `json:"arguments"`
	Route     string     `json:"route,omitempty"`
}

// hostMembers are the members host.role.compose.v1 adds to the task.
var hostMembers = []string{"workflow_id", "run_id", "project_context"}

// outcome ends the workflow early: the envelope's status and the one
// violation; role marks a refusal the run itself answered, whose ending and
// violations the envelope copies.
type outcome struct {
	status, code, detail string
	role                 bool
}

func refused(code, detail string) *outcome {
	return &outcome{status: "refused", code: code, detail: detail}
}

func recoveryRequired(code, detail string) *outcome {
	return &outcome{status: "recovery-required", code: code, detail: detail}
}

// answer is the part of a settled run's result the envelope copies.
type answer struct {
	Ending     *Ending           `json:"ending"`
	Questions  []json.RawMessage `json:"questions"`
	Violations []Violation       `json:"violations"`
}

// workflow is one invocation in flight.
type workflow struct {
	d      *Definition
	id     api.Identity
	in     invocation
	client steps.RoleClient
	host   hostsvc.Client

	answer  *answer
	commits []Commit
}

func (d *Definition) invoke(ctx context.Context, id api.Identity, inv api.Invocation, client steps.RoleClient, host api.HostCaller) (*Envelope, error) {
	if inv.Capability != d.Capability {
		return (&workflow{}).envelope(refused("invocation.capability", inv.Capability)), nil
	}
	parsed, err := steps.Parse(inv.Input)
	if err != nil {
		return (&workflow{}).envelope(refused("invocation.invalid", err.Error())), nil
	}
	if err := d.request.Validate(parsed); err != nil {
		return (&workflow{}).envelope(refused("invocation.invalid", err.Error())), nil
	}
	var in invocation
	if err := api.Decode(inv.Input, &in); err != nil {
		return (&workflow{}).envelope(refused("invocation.invalid", "not the request object")), nil
	}
	if stop := d.admit(in.Entry); stop != nil {
		return (&workflow{}).envelope(stop), nil
	}
	w := &workflow{d: d, id: id, in: in, client: client, host: hostsvc.Client{Host: host, Identity: id, WorkflowID: in.WorkflowID}}
	stop, err := w.run(ctx)
	if err != nil {
		return nil, err
	}
	return w.envelope(stop), nil
}

// admit resolves the run step's role from the invocation: the entry must be
// the catalog's, with its kind and profile, and supported on prior.
func (d *Definition) admit(ref entryRef) *outcome {
	e, ok := d.entries[ref.ID]
	if !ok {
		return refused("entry.unknown", ref.ID)
	}
	if e.Kind != ref.Kind || e.Profile != ref.Profile {
		return refused("entry.invalid", fmt.Sprintf("%s is a %s under profile %s", e.ID, e.Kind, e.Profile))
	}
	if e.Support["prior"] != "supported" {
		return refused("entry.unsupported", fmt.Sprintf("%s is %s on prior", e.ID, e.Support["prior"]))
	}
	return nil
}

// run executes the seven steps and returns how the workflow stopped early,
// nil when it ran to its end. An error is an unknown outcome and is returned
// as is.
func (w *workflow) run(ctx context.Context) (*outcome, error) {
	runID, profile := w.in.RunID, w.in.Entry.Profile
	taskBytes := marshal(task{Entry: w.in.Entry, Arguments: w.in.Arguments, Route: w.in.Route})
	reply, err := w.host.Compose(ctx, runID, profile, taskBytes)
	if stop, err := w.service(reply, err); err != nil || stop != nil {
		return stop, err
	}
	composed, err := reply.Composed()
	if err != nil {
		return nil, err
	}
	if stop := w.verify(composed, taskBytes); stop != nil {
		return stop, nil
	}

	reply, err = w.host.Workspace(ctx, runID)
	if stop, err := w.service(reply, err); err != nil || stop != nil {
		return stop, err
	}
	ws, err := reply.Workspace()
	if err != nil {
		return nil, err
	}

	if stop, err := w.role(ctx, composed.RoleInput); err != nil || stop != nil {
		return stop, err
	}
	switch w.answer.Ending.Class {
	case "refusal":
		return &outcome{status: "refused", role: true}, nil
	case "success", "stop":
		// A stopped run may have changed the workspace; only the capture
		// can say, so both go on to it (completion.on_ending).
	default:
		return refused("result.invalid", "ending class "+w.answer.Ending.Class), nil
	}

	reply, err = w.host.Capture(ctx, runID)
	if stop, err := w.service(reply, err); err != nil || stop != nil {
		return stop, err
	}
	captured, err := reply.UnboundCapture()
	if err != nil {
		return nil, err
	}
	if captured.BaseRevision != ws.BaseRevision {
		return refused("capture.invalid", "base_revision is not the workspace's"), nil
	}
	if captured.Diff == "" {
		return nil, nil
	}

	reply, err = w.host.Integrate(ctx, runID)
	if stop, err := w.service(reply, err); err != nil || stop != nil {
		return stop, err
	}
	integrated, err := reply.UnreviewedIntegration()
	if err != nil {
		return nil, err
	}
	if integrated.State != "integrated" || integrated.Correction != "" || integrated.Base != ws.BaseRevision || integrated.Tree != captured.Tree {
		return refused("integration.invalid", "the receipt is not an integration of the captured tree from the workspace's base"), nil
	}
	// The integration stands from here on: a later refusal keeps the commit.
	// The receipt carries no commit subject, so the subject names the
	// integration the host recorded (request 76 asks for the subject).
	w.commits = []Commit{{Commit: integrated.Commit, Reference: integrated.Reference, Subject: "integration " + integrated.ID, Changes: []string{}}}

	reply, err = w.host.Snapshot(ctx)
	if stop, err := w.service(reply, err); err != nil || stop != nil {
		return stop, err
	}
	raw, err := reply.Snapshot()
	if err != nil {
		return nil, err
	}
	var snapshot api.RepairSnapshot
	if err := json.Unmarshal(raw, &snapshot); err != nil {
		return nil, err
	}
	if snapshot.Commit != integrated.Commit || snapshot.Reference != integrated.Reference || snapshot.Tree != integrated.Tree {
		return refused("snapshot.invalid", "the snapshot is not of the integration"), nil
	}
	w.commits[0].Changes = append(w.commits[0].Changes, snapshot.ChangedPaths...)

	for _, record := range controlRecords(snapshot.ChangedPaths) {
		reply, err := w.host.ReadRecordAt(ctx, "record:"+record, record)
		if stop, err := w.service(reply, err); err != nil || stop != nil {
			return stop, err
		}
		if _, err := reply.Record(); err != nil {
			return nil, err
		}
	}
	return nil, nil
}

// controlRecords are the workbench control records among the changed paths,
// relative to the workbench and in the shape the host's read accepts, each
// once, in the snapshot's order. A path in git's name-status form is read
// after its tab.
func controlRecords(changed []string) []string {
	var out []string
	seen := map[string]bool{}
	for _, p := range changed {
		if i := strings.LastIndexByte(p, '\t'); i >= 0 {
			p = p[i+1:]
		}
		record, ok := strings.CutPrefix(p, WorkbenchPrefix)
		if !ok || !strings.HasSuffix(record, ".json") || !fs.ValidPath(record) || strings.ContainsAny(record, "\\:\x00\r\n") || seen[record] {
			continue
		}
		seen[record] = true
		out = append(out, record)
	}
	return out
}

// verify checks the frozen role input: the run and profile asked for, valid
// against the definition's role input schema, the module's task with only
// the host's members added, and those naming this invocation.
func (w *workflow) verify(composed hostsvc.Composed, taskBytes []byte) *outcome {
	if composed.RunID != w.in.RunID || composed.Profile != w.in.Entry.Profile {
		return refused("role_input.invalid", "the host composed another run or profile")
	}
	parsed, err := steps.Parse(composed.RoleInput)
	if err != nil {
		return refused("role_input.invalid", err.Error())
	}
	if err := w.d.roleInput.Validate(parsed); err != nil {
		return refused("role_input.invalid", err.Error())
	}
	if err := steps.Carries(parsed, taskBytes, hostMembers...); err != nil {
		return refused("role_input.invalid", err.Error())
	}
	members := parsed.(map[string]any)
	if members["workflow_id"] != w.in.WorkflowID || members["run_id"] != w.in.RunID {
		return refused("role_input.invalid", "workflow_id or run_id is not the invocation's")
	}
	return nil
}

// role runs the run step over the host-provisioned run: observe, act,
// validate, and keep the answer.
func (w *workflow) role(ctx context.Context, roleInput json.RawMessage) (*outcome, error) {
	runID, profile := w.in.RunID, w.in.Entry.Profile
	if err := steps.CheckRoleCalls(w.id, runID, profile, roleInput, w.in.AuditRef); err != nil {
		return refused("frame.oversize", err.Error()), nil
	}
	request := api.RoleRequest{RunID: runID, ModuleID: w.id.ModuleID, ModuleVersion: w.id.Version, Profile: profile, Input: roleInput, BundleDigest: w.id.BundleDigest}
	obs, err := steps.Execute(ctx, w.client, request, w.in.AuditRef)
	if err != nil {
		return nil, err
	}
	if obs.Refusal == "recovery-required" {
		return recoveryRequired("host.recovery-required", obs.RefusedCall+" "+runID), nil
	}
	if obs.Refusal != "" {
		return refused("host."+obs.Refusal, obs.RefusedCall+" "+runID), nil
	}
	switch obs.State {
	case "accepted":
		return recoveryRequired("role.accepted", runID+" has no terminal answer; it is never rerun"), nil
	case "settled":
	default:
		return refused("role."+obs.State, runID+" did not reach a settled answer"), nil
	}
	parsed, err := steps.Parse(obs.Answer.Output)
	if err != nil {
		return refused("result.invalid", err.Error()), nil
	}
	if err := w.d.result.Validate(parsed); err != nil {
		return refused("result.invalid", err.Error()), nil
	}
	var a answer
	if err := json.Unmarshal(obs.Answer.Output, &a); err != nil {
		return refused("result.invalid", err.Error()), nil
	}
	if err := selectedAmongOptions(a.Questions); err != nil {
		return refused("result.invalid", err.Error()), nil
	}
	w.answer = &a
	if a.Ending == nil {
		return &outcome{status: "recovery-required", role: true}, nil
	}
	return nil, nil
}

// selectedAmongOptions is the rule entry-result.v1.json cannot state: on the
// ask-user-question channel every option selected is one the question
// offered, each once.
func selectedAmongOptions(questions []json.RawMessage) error {
	for i, raw := range questions {
		var q struct {
			Channel  string   `json:"channel"`
			Options  []string `json:"options"`
			Selected []string `json:"selected"`
		}
		if err := json.Unmarshal(raw, &q); err != nil {
			return err
		}
		offered := map[string]bool{}
		for _, o := range q.Options {
			offered[o] = true
		}
		for _, s := range q.Selected {
			if !offered[s] {
				return fmt.Errorf("question %d: %q is not among its options", i, s)
			}
			offered[s] = false
		}
	}
	return nil
}

// service routes a host service's reply: completed continues,
// recovery-required stays recovery-required, any refusal refuses the
// invocation (entry.v1 escalates nowhere: it has no review to escalate to).
// A module-side frame refusal is a refusal; any other error is an unknown
// outcome.
func (w *workflow) service(reply hostsvc.Reply, err error) (*outcome, error) {
	if errors.Is(err, hostsvc.ErrOversize) {
		return refused("frame.oversize", err.Error()), nil
	}
	if err != nil {
		return nil, err
	}
	where := reply.Capability + " " + reply.Slot
	switch reply.State {
	case "completed":
		return nil, nil
	case "recovery-required":
		return recoveryRequired("host.recovery-required", where+": "+reply.Code), nil
	}
	return refused("host."+reply.Code, where), nil
}

func marshal(v any) json.RawMessage {
	body, err := json.Marshal(v)
	if err != nil {
		// The values marshalled here are strings and raw JSON the host
		// already answered; a failure is a programming error.
		panic(err)
	}
	return body
}

var reasonText = regexp.MustCompile(`[^a-z0-9-]+`)

// reasonOf is a violation code in the ending's reason form: lowercase and
// hyphenated, so host.scope-violation is host-scope-violation.
func reasonOf(code string) string {
	reason := strings.Trim(reasonText.ReplaceAllString(strings.ToLower(code), "-"), "-")
	if len(reason) > 64 {
		reason = reason[:64]
	}
	if reason == "" || reason[0] < 'a' || reason[0] > 'z' {
		reason = "refused-" + reason
	}
	return reason
}

// envelope builds the answer. With no early stop the run's ending decides:
// success is completed, stop is ended with the run's violations. A refusal
// the run answered copies its ending and violations; any other refusal is the
// module's, with an ending of class refusal named after its code;
// recovery-required has no ending. The questions are the settled answer's
// whenever there is one; the commits are whatever the integration put on the
// reference before the stop.
func (w *workflow) envelope(stop *outcome) *Envelope {
	env := &Envelope{Questions: []json.RawMessage{}, Commits: []Commit{}, Violations: []Violation{}}
	if w.commits != nil {
		env.Commits = w.commits
	}
	if w.answer != nil && w.answer.Questions != nil {
		env.Questions = w.answer.Questions
	}
	switch {
	case stop == nil && w.answer.Ending.Class == "success":
		env.Status, env.Ending = "completed", w.answer.Ending
	case stop == nil:
		env.Status, env.Ending = "ended", w.answer.Ending
		env.Violations = append(env.Violations, w.answer.Violations...)
	case stop.role:
		env.Status, env.Ending = stop.status, w.answer.Ending
		env.Violations = append(env.Violations, w.answer.Violations...)
	case stop.status == "recovery-required":
		env.Status = stop.status
		env.Violations = []Violation{{Code: stop.code, Detail: stop.detail}}
	default:
		env.Status, env.Ending = stop.status, &Ending{Class: "refusal", Reason: reasonOf(stop.code)}
		env.Violations = []Violation{{Code: stop.code, Detail: stop.detail}}
	}
	return env
}

// encode marshals the envelope, checks it against the frame bound and
// against its own schema. An envelope that would not fit the wire is
// replaced by a refusal that says so.
func (d *Definition) encode(operationID string, env *Envelope) (json.RawMessage, error) {
	body, err := json.Marshal(env)
	if err != nil {
		return nil, err
	}
	if err := steps.CheckFrame("module.result", api.Result{OperationID: operationID, Output: body}); err != nil {
		if body, err = json.Marshal((&workflow{}).envelope(refused("frame.oversize", err.Error()))); err != nil {
			return nil, err
		}
	}
	parsed, err := steps.Parse(body)
	if err != nil {
		return nil, err
	}
	if err := d.envelope.Validate(parsed); err != nil {
		return nil, fmt.Errorf("envelope does not match its schema: %w", err)
	}
	return body, nil
}
