// Package repair interprets the bundle's repair workflow definition,
// workflows/repair.v1.json, over the step executor of internal/steps and the
// host service client of internal/hostsvc, and serves it as the module
// capability fusion.repair.v1.
//
// The contract is Prior's answer to request 69
// (docs/design/fusion-repair-contract-prior-response.md at 10ad78b) and the
// definition frozen on it at plan step 15. Ten steps run in order: explore,
// then per attempt workspace, implement, capture and review, then integrate,
// snapshot, read-record, audit and close. The module composes each role's
// task from the invocation and the preceding answers as the definition's
// input_from states, has the host freeze it through host.role.compose.v1,
// forwards the frozen bytes as RoleCall.input on every role call, and
// validates each settled answer against the role's result schema. It
// performs no service preflight (67.6): the definition's requires list is
// Prior's input. Before any role call it validates the attempt map: exactly
// revise_bound + 1 attempts, six distinct host-provisioned run ids; attempt
// i runs on the pair the map holds at i, and nothing creates a run.
//
// Restart (69.3): every role is read before it is run; a run at settled is
// reused without a model call, one at answered is completed with the
// invocation's audit_ref on that completion alone, one at accepted is
// recovery-required. A host service with a completed receipt replays its
// frozen request on the same operation id, so a restart never starts a
// second workspace, check, integration or closure because this process
// received no answer: the host answers from its journal or asks for
// recovery, and the module never infers.
package repair

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"regexp"
	"strings"
	"time"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/hostsvc"
	"github.com/kai/prior/integrationbuild/fusionmodule/internal/steps"
	api "github.com/kai/prior/moduleapi/v1"
)

// WorkflowAsset is where the definition lives in the payload.
const WorkflowAsset = "workflows/repair.v1.json"

// ErrDefinition is returned when the definition is not one this executor
// can interpret: a shape it does not know is refused at load, never run on
// a guess.
var ErrDefinition = errors.New("repair definition not interpretable")

// token bounds a workflow id and a run id (69.1, 69.2).
var token = regexp.MustCompile(`^[a-zA-Z0-9_-]{1,64}$`)

// expected is the step list this executor runs, in order; a definition
// whose steps differ is refused at load.
var expected = []struct{ id, role, service string }{
	{"explore", "explorer", ""},
	{"workspace", "", api.WorkspaceCapability},
	{"implement", "code-implementer", ""},
	{"capture", "", api.CaptureCapability},
	{"review", "reviewer", ""},
	{"integrate", "", api.IntegrateCapability},
	{"snapshot", "", api.SnapshotCapability},
	{"read-record", "", api.WorkbenchCapability},
	{"audit", "state-auditor", ""},
	{"close", "", api.WorkbenchCapability},
}

// services are the nine the definition must declare: the module makes no
// preflight against the host; this is the definition's own consistency.
var services = append(append([]string(nil), steps.RoleCapabilities...), api.RoleComposeCapability, api.WorkspaceCapability, api.CaptureCapability, api.IntegrateCapability, api.SnapshotCapability, api.WorkbenchCapability)

// escalations are the refusal codes under which a host service stops the
// workflow as escalated at its step rather than refusing the invocation
// (69.1): any other code is a refusal of the invocation.
var escalations = map[string]map[string]bool{
	"capture":   {"validation-failed": true, "scope-violation": true, "frame.oversize": true, "context.limit": true},
	"integrate": {"correction-required": true},
	"close":     {"record-conflict": true},
}

// roleInputFrom is the part of a role step's hand-over this executor reads;
// the prose members beside them are the definition's own documentation.
type roleInputFrom struct {
	InvocationSchema string `json:"invocation_schema"`
	Run              string `json:"run"`
	Compose          struct {
		Service string `json:"service"`
		Request struct {
			Profile string `json:"profile"`
		} `json:"request"`
	} `json:"compose"`
	RoleInputSchema string `json:"role_input_schema"`
	Forwarded       string `json:"forwarded"`
	RecoveryRef     string `json:"recovery_ref"`
}

type roleCompletion struct {
	RoleState     string `json:"role_state"`
	ResultSchema  string `json:"result_schema"`
	FindingsLimit string `json:"findings_limit"`
}

type closeCompletion struct {
	EnvelopeSchema string `json:"envelope_schema"`
}

// roleStep is one of the four role steps with its schemas compiled.
type roleStep struct {
	ID    string
	Role  string
	input *steps.Schema
	// result is the role's result schema, which the host places in the role
	// input as output_contract and the module validates the answer against.
	result *steps.Schema
}

// Definition is the repair workflow with its schemas compiled from the data
// files the catalog declares.
type Definition struct {
	Capability  string
	ReviseBound int
	roles       map[string]roleStep
	recoveryKey string
	request     *steps.Schema
	envelope    *steps.Schema
}

// Load reads the definition, checks its ten steps against the ones this
// executor runs, resolves the four roles through the catalog and the
// profiles, and compiles the request and envelope schemas and each role's
// input and result schemas. A hand-over or completion that says something
// this executor does not do is ErrDefinition.
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
		if s.ID != e.id || s.Role != e.role || s.HostService != e.service {
			return nil, fmt.Errorf("%w: step %d is %q, expected %q", ErrDefinition, i, s.ID, e.id)
		}
	}
	if !w.Declares(services...) {
		return nil, fmt.Errorf("%w: requires must name the nine host services", ErrDefinition)
	}
	catalog, err := steps.LoadCatalog(b)
	if err != nil {
		return nil, err
	}
	d := &Definition{Capability: w.Capability, ReviseBound: w.ReviseBound, roles: map[string]roleStep{}}
	for _, step := range w.Steps {
		if step.Role == "" {
			continue
		}
		role, _, err := catalog.Resolve(step.Role)
		if err != nil {
			return nil, err
		}
		profile, err := steps.LoadProfile(b, role.ID)
		if err != nil {
			return nil, err
		}
		var from roleInputFrom
		if json.Unmarshal(step.InputFrom, &from) != nil {
			return nil, fmt.Errorf("%w: %s input_from", ErrDefinition, step.ID)
		}
		var done roleCompletion
		if json.Unmarshal(step.Completion, &done) != nil {
			return nil, fmt.Errorf("%w: %s completion", ErrDefinition, step.ID)
		}
		if from.Compose.Service != api.RoleComposeCapability || from.Compose.Request.Profile != role.ID || from.Forwarded != "verbatim" || from.RecoveryRef != "audit_ref" || from.Run == "" {
			return nil, fmt.Errorf("%w: %s must compose %s through %s and forward verbatim under audit_ref", ErrDefinition, step.ID, role.ID, api.RoleComposeCapability)
		}
		if done.RoleState != "settled" {
			return nil, fmt.Errorf("%w: %s completion must be a settled role", ErrDefinition, step.ID)
		}
		if from.RoleInputSchema != profile.InputSchema || done.ResultSchema != profile.ResultSchema {
			return nil, fmt.Errorf("%w: %s schemas differ from the profile's", ErrDefinition, step.ID)
		}
		if step.ID == "explore" {
			if from.InvocationSchema == "" || done.FindingsLimit != "task.findings_limit" {
				return nil, fmt.Errorf("%w: explore must name the invocation schema and bound findings by task.findings_limit", ErrDefinition)
			}
			if d.request, err = b.Schema(from.InvocationSchema); err != nil {
				return nil, err
			}
		}
		d.recoveryKey = from.RecoveryRef
		rs := roleStep{ID: step.ID, Role: role.ID}
		if rs.input, err = b.Schema(from.RoleInputSchema); err != nil {
			return nil, err
		}
		if rs.result, err = b.Schema(done.ResultSchema); err != nil {
			return nil, err
		}
		d.roles[step.ID] = rs
	}
	var closing closeCompletion
	if json.Unmarshal(w.Steps[len(w.Steps)-1].Completion, &closing) != nil || closing.EnvelopeSchema == "" {
		return nil, fmt.Errorf("%w: close must name the envelope schema", ErrDefinition)
	}
	if d.envelope, err = b.Schema(closing.EnvelopeSchema); err != nil {
		return nil, err
	}
	return d, nil
}

// Violation is one reason an invocation did not complete.
type Violation struct {
	Code   string `json:"code"`
	Detail string `json:"detail"`
}

// Domain is the module's own verdict.
type Domain struct {
	Status     string          `json:"status"`
	Result     json.RawMessage `json:"result"`
	Violations []Violation     `json:"violations"`
}

// Evidence is one final observation of a run for which a persisted answer
// exists (69.3), copied from that answer.
type Evidence struct {
	Step        string    `json:"step"`
	Attempt     *int      `json:"attempt"`
	RunID       string    `json:"run_id"`
	PrincipalID string    `json:"principal_id"`
	ObservedAt  time.Time `json:"observed_at"`
	RoleState   string    `json:"role_state"`
}

// Envelope is the answer to a fusion.repair.v1 invocation,
// schemas/repair-result.v1.json. HostEvidence is null when no run has an
// answer.
type Envelope struct {
	Domain       Domain     `json:"domain"`
	HostEvidence []Evidence `json:"host_evidence"`
}

// Result is the record of what ran, the result member of a completed or
// escalated envelope.
type Result struct {
	Exploration json.RawMessage `json:"exploration"`
	Attempts    []Attempt       `json:"attempts"`
	Integration json.RawMessage `json:"integration"`
	Audit       json.RawMessage `json:"audit"`
	Closure     json.RawMessage `json:"closure"`
	StoppedAt   *string         `json:"stopped_at"`
}

// Attempt is one attempt's record; a step not reached is null.
type Attempt struct {
	Attempt        int             `json:"attempt"`
	Implementation json.RawMessage `json:"implementation"`
	Capture        json.RawMessage `json:"capture"`
	Review         json.RawMessage `json:"review"`
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

// invocation is the decoded request, schemas/repair-request.v1.json.
type invocation struct {
	WorkflowID string `json:"workflow_id"`
	Task       struct {
		Summary       string          `json:"summary"`
		Criteria      []string        `json:"criteria"`
		ContextPaths  []string        `json:"context_paths"`
		WritePaths    []string        `json:"write_paths"`
		Checks        json.RawMessage `json:"checks"`
		BaseRevision  string          `json:"base_revision"`
		FindingsLimit int             `json:"findings_limit"`
	} `json:"task"`
	TaskSHA256 string `json:"task_sha256"`
	Record     struct {
		Path string `json:"path"`
		Kind string `json:"kind"`
	} `json:"record"`
	Runs struct {
		Explorer string `json:"explorer"`
		Attempts []struct {
			Implementer string `json:"code-implementer"`
			Reviewer    string `json:"reviewer"`
		} `json:"attempts"`
		Auditor string `json:"state-auditor"`
	} `json:"runs"`
	AuditRef string `json:"audit_ref"`
}

// check is what the schema cannot state: the map's length against the
// bound, six distinct ids, the write scope inside the context, unique check
// names, the record path in the shape the host's decoder accepts.
func (in *invocation) check(reviseBound int) (code string, err error) {
	if !token.MatchString(in.WorkflowID) {
		return "invocation.invalid", errors.New("workflow_id")
	}
	if got, want := len(in.Runs.Attempts), reviseBound+1; got != want {
		return "runs.invalid", fmt.Errorf("attempt map has %d entries, revise_bound %d needs %d", got, reviseBound, want)
	}
	ids := []string{in.Runs.Explorer}
	for _, pair := range in.Runs.Attempts {
		ids = append(ids, pair.Implementer, pair.Reviewer)
	}
	ids = append(ids, in.Runs.Auditor)
	seen := map[string]bool{}
	for _, id := range ids {
		if !token.MatchString(id) {
			return "runs.invalid", fmt.Errorf("run id %q", id)
		}
		if seen[id] {
			return "runs.invalid", fmt.Errorf("run id %q twice", id)
		}
		seen[id] = true
	}
	context := map[string]bool{}
	for _, p := range in.Task.ContextPaths {
		context[p] = true
	}
	for _, p := range in.Task.WritePaths {
		if !context[p] {
			return "invocation.invalid", fmt.Errorf("write path %q is not a context path", p)
		}
	}
	var checks []struct {
		Name string `json:"name"`
	}
	if json.Unmarshal(in.Task.Checks, &checks) != nil {
		return "invocation.invalid", errors.New("checks")
	}
	names := map[string]bool{}
	for _, c := range checks {
		if names[c.Name] {
			return "invocation.invalid", fmt.Errorf("check %q twice", c.Name)
		}
		names[c.Name] = true
	}
	if p := in.Record.Path; !fs.ValidPath(p) || strings.ContainsAny(p, "\\:\x00\r\n") || !strings.HasSuffix(p, ".json") {
		return "invocation.invalid", errors.New("record.path")
	}
	return "", nil
}

// outcome ends the workflow before close: the envelope's status, the one
// violation, and for escalated the step stopped at.
type outcome struct {
	status, code, detail, stoppedAt string
}

func refusal(status, code, detail string) *outcome {
	return &outcome{status: status, code: code, detail: detail}
}

func escalated(step, code, detail string) *outcome {
	return &outcome{status: "escalated", code: code, detail: detail, stoppedAt: step}
}

// workflow is one invocation in flight.
type workflow struct {
	d        *Definition
	id       api.Identity
	in       invocation
	client   steps.RoleClient
	host     hostsvc.Client
	auditRef string

	evidence    []Evidence
	exploration json.RawMessage
	attempts    []*Attempt
	integration json.RawMessage
	audit       json.RawMessage
	closure     json.RawMessage
}

func (d *Definition) invoke(ctx context.Context, id api.Identity, inv api.Invocation, client steps.RoleClient, host api.HostCaller) (*Envelope, error) {
	if inv.Capability != d.Capability {
		return (&workflow{}).envelope(refusal("refused", "invocation.capability", inv.Capability)), nil
	}
	parsed, err := steps.Parse(inv.Input)
	if err != nil {
		return (&workflow{}).envelope(refusal("refused", "invocation.invalid", err.Error())), nil
	}
	if err := d.request.Validate(parsed); err != nil {
		return (&workflow{}).envelope(refusal("refused", "invocation.invalid", err.Error())), nil
	}
	var in invocation
	if err := api.Decode(inv.Input, &in); err != nil {
		return (&workflow{}).envelope(refusal("refused", "invocation.invalid", "not the request object")), nil
	}
	if code, err := in.check(d.ReviseBound); err != nil {
		return (&workflow{}).envelope(refusal("refused", code, err.Error())), nil
	}
	w := &workflow{d: d, id: id, in: in, client: client, host: hostsvc.Client{Host: host, Identity: id, WorkflowID: in.WorkflowID}, auditRef: in.AuditRef}
	stop, err := w.run(ctx)
	if err != nil {
		return nil, err
	}
	return w.envelope(stop), nil
}

// The role tasks, each in the key order its schema lists them and without
// the two host members, which host.role.compose.v1 adds.

type exploreTask struct {
	Question      string   `json:"question"`
	PathScope     []string `json:"path_scope"`
	FindingsLimit int      `json:"findings_limit"`
}

type brief struct {
	Summary      string          `json:"summary"`
	Criteria     []string        `json:"criteria"`
	ContextPaths []string        `json:"context_paths"`
	Exploration  json.RawMessage `json:"exploration"`
}

type attemptInput struct {
	Index          int             `json:"index"`
	PreviousReview json.RawMessage `json:"previous_review"`
}

type implementTask struct {
	Brief      brief             `json:"brief"`
	WritePaths []string          `json:"write_paths"`
	Checks     json.RawMessage   `json:"checks"`
	Workspace  hostsvc.Workspace `json:"workspace"`
	Attempt    attemptInput      `json:"attempt"`
}

type reviewTask struct {
	Domain         string          `json:"domain"`
	Brief          brief           `json:"brief"`
	BaseRevision   string          `json:"base_revision"`
	Tree           string          `json:"tree"`
	Diff           string          `json:"diff"`
	Validations    json.RawMessage `json:"validations"`
	CriteriaSHA256 string          `json:"criteria_sha256"`
	InputsSHA256   string          `json:"inputs_sha256"`
	Binding        json.RawMessage `json:"binding"`
	Attempt        int             `json:"attempt"`
}

type auditTask struct {
	Domain            string          `json:"domain"`
	Directive         string          `json:"directive"`
	Since             string          `json:"since"`
	Integration       json.RawMessage `json:"integration"`
	Workbench         json.RawMessage `json:"workbench"`
	WorkbenchRevision string          `json:"workbench_revision"`
	Runtime           json.RawMessage `json:"runtime"`
	ProposedOutcome   string          `json:"proposed_outcome"`
}

// lines is the brief as the explorer and the auditor read it: the summary
// followed by the criteria, one line each.
func (w *workflow) lines() string {
	return strings.Join(append([]string{w.in.Task.Summary}, w.in.Task.Criteria...), "\n")
}

// run executes the ten steps and returns how the workflow stopped, nil on
// a completed close. An error is an unknown outcome and is returned as is.
func (w *workflow) run(ctx context.Context) (*outcome, error) {
	task := w.in.Task
	answer, stop, err := w.role(ctx, "explore", w.in.Runs.Explorer, nil, exploreTask{Question: w.lines(), PathScope: task.ContextPaths, FindingsLimit: task.FindingsLimit})
	if err != nil || stop != nil {
		return stop, err
	}
	if n := countFindings(answer); n > task.FindingsLimit {
		return refusal("refused", "findings.limit", fmt.Sprintf("%d findings, limit %d", n, task.FindingsLimit)), nil
	}
	w.exploration = answer
	b := brief{Summary: task.Summary, Criteria: task.Criteria, ContextPaths: task.ContextPaths, Exploration: answer}

	var previous json.RawMessage = json.RawMessage("null")
	var accepted struct {
		reviewer string
		tree     string
	}
	for i := 0; i <= w.d.ReviseBound; i++ {
		pair := w.in.Runs.Attempts[i]
		record := &Attempt{Attempt: i, Implementation: null, Capture: null, Review: null}
		w.attempts = append(w.attempts, record)

		reply, err := w.host.Workspace(ctx, pair.Implementer)
		if stop, err := w.service(reply, err, "workspace"); err != nil || stop != nil {
			return stop, err
		}
		ws, err := reply.Workspace()
		if err != nil {
			return nil, err
		}
		if ws.BaseRevision != task.BaseRevision {
			return refusal("refused", "workspace.invalid", "base_revision is not the task's"), nil
		}

		attempt := i
		answer, stop, err := w.role(ctx, "implement", pair.Implementer, &attempt, implementTask{Brief: b, WritePaths: task.WritePaths, Checks: task.Checks, Workspace: ws, Attempt: attemptInput{Index: i, PreviousReview: previous}})
		if err != nil || stop != nil {
			return stop, err
		}
		record.Implementation = answer
		if result := stringMember(answer, "result"); result != "done" {
			return escalated("implement", "implementer."+result, "the implementer reported "+result), nil
		}

		reply, err = w.host.Capture(ctx, pair.Implementer)
		if stop, err := w.service(reply, err, "capture"); err != nil || stop != nil {
			return stop, err
		}
		captured, err := reply.Capture()
		if err != nil {
			return nil, err
		}
		if captured.BaseRevision != task.BaseRevision {
			return refusal("refused", "capture.invalid", "base_revision is not the task's"), nil
		}
		record.Capture = marshal(map[string]any{"tree": captured.Tree, "diff_sha256": captured.DiffSHA256, "validations": captured.Validations})

		answer, stop, err = w.role(ctx, "review", pair.Reviewer, &attempt, reviewTask{Domain: "code", Brief: b, BaseRevision: task.BaseRevision, Tree: captured.Tree, Diff: captured.Diff, Validations: captured.Validations, CriteriaSHA256: captured.CriteriaSHA256, InputsSHA256: captured.InputsSHA256, Binding: captured.Binding, Attempt: i})
		if err != nil || stop != nil {
			return stop, err
		}
		record.Review = answer
		if err := echoes(answer, captured.Binding); err != nil {
			return refusal("refused", "review.binding", err.Error()), nil
		}
		if w.principal(pair.Reviewer) == w.principal(pair.Implementer) {
			return refusal("refused", "principal.shared", "the reviewer's principal is the implementer's"), nil
		}
		switch decision := stringMember(answer, "decision"); decision {
		case "accept":
			accepted.reviewer, accepted.tree = pair.Reviewer, captured.Tree
		case "revise":
			if i == w.d.ReviseBound {
				return escalated("review", "review.revise-bound", fmt.Sprintf("revise at attempt %d, the bound: %s", i, objections(answer))), nil
			}
			previous = answer
			continue
		default:
			return escalated("review", "review."+decision, objections(answer)), nil
		}
		break
	}

	reply, err := w.host.Integrate(ctx, accepted.reviewer)
	if stop, err := w.service(reply, err, "integrate"); err != nil || stop != nil {
		return stop, err
	}
	integrated, err := reply.Integration()
	if err != nil {
		return nil, err
	}
	if integrated.State != "integrated" || integrated.Correction != "" || integrated.Base != task.BaseRevision || integrated.Tree != accepted.tree {
		return refusal("refused", "integration.invalid", "the receipt is not an integration of the accepted tree from the task's base"), nil
	}
	w.integration = marshal(map[string]string{"commit": integrated.Commit, "reference": integrated.Reference, "tree": integrated.Tree})
	receipt := reply.Result

	reply, err = w.host.Snapshot(ctx)
	if stop, err := w.service(reply, err, "snapshot"); err != nil || stop != nil {
		return stop, err
	}
	snapshot, err := reply.Snapshot()
	if err != nil {
		return nil, err
	}

	reply, err = w.host.ReadRecord(ctx, w.in.Record.Path)
	if stop, err := w.service(reply, err, "read-record"); err != nil || stop != nil {
		return stop, err
	}
	read, err := reply.Record()
	if err != nil {
		return nil, err
	}

	answer, stop, err = w.role(ctx, "audit", w.in.Runs.Auditor, nil, auditTask{Domain: "code", Directive: w.lines(), Since: task.BaseRevision, Integration: receipt, Workbench: read.Record, WorkbenchRevision: read.Revision, Runtime: snapshot, ProposedOutcome: "completed"})
	if err != nil || stop != nil {
		return stop, err
	}
	w.audit = answer
	for _, pair := range w.in.Runs.Attempts {
		for _, run := range []string{pair.Implementer, pair.Reviewer} {
			if p := w.principal(run); p != "" && p == w.principal(w.in.Runs.Auditor) {
				return refusal("refused", "principal.shared", "the auditor's principal is "+run+"'s"), nil
			}
		}
	}
	if reason := notPassed(answer); reason != "" {
		return escalated("audit", "audit.failed", reason), nil
	}

	reply, err = w.host.Close(ctx, w.in.Runs.Auditor)
	if stop, err := w.service(reply, err, "close"); err != nil || stop != nil {
		return stop, err
	}
	if _, err := reply.Closure(); err != nil {
		return nil, err
	}
	w.closure = reply.Result
	return nil, nil
}

var null = json.RawMessage("null")

func marshal(v any) json.RawMessage {
	body, err := json.Marshal(v)
	if err != nil {
		// The values marshalled here are strings and raw JSON the host
		// already answered; a failure is a programming error.
		panic(err)
	}
	return body
}

// service routes a host service's reply: completed continues, a refusal
// the step escalates on stops as escalated there, any other refusal refuses
// the invocation, and recovery-required stays recovery-required. A module
// side frame refusal is a refusal of the invocation; any other error is an
// unknown outcome.
func (w *workflow) service(reply hostsvc.Reply, err error, step string) (*outcome, error) {
	if errors.Is(err, hostsvc.ErrOversize) {
		return refusal("refused", "frame.oversize", err.Error()), nil
	}
	if err != nil {
		return nil, err
	}
	where := reply.Capability + " " + reply.Slot
	switch reply.State {
	case "completed":
		return nil, nil
	case "recovery-required":
		return refusal("recovery-required", "host.recovery-required", where+": "+reply.Code), nil
	}
	if escalations[step][reply.Code] {
		return escalated(step, reply.Code, where), nil
	}
	return refusal("refused", "host."+reply.Code, where), nil
}

// role runs one role step over its host-provisioned run: compose, verify
// the frozen input, observe, act, validate.
func (w *workflow) role(ctx context.Context, stepID, runID string, attempt *int, task any) (json.RawMessage, *outcome, error) {
	step := w.d.roles[stepID]
	taskBytes := marshal(task)
	reply, err := w.host.Compose(ctx, runID, step.Role, taskBytes)
	if stop, err := w.service(reply, err, stepID); err != nil || stop != nil {
		return nil, stop, err
	}
	composed, err := reply.Composed()
	if err != nil {
		return nil, nil, err
	}
	if composed.RunID != runID || composed.Profile != step.Role {
		return nil, refusal("refused", "role_input.invalid", "the host composed another run or profile"), nil
	}
	parsed, err := steps.Parse(composed.RoleInput)
	if err != nil {
		return nil, refusal("refused", "role_input.invalid", err.Error()), nil
	}
	if err := step.input.Validate(parsed); err != nil {
		return nil, refusal("refused", "role_input.invalid", err.Error()), nil
	}
	if err := carries(parsed, taskBytes); err != nil {
		return nil, refusal("refused", "role_input.invalid", err.Error()), nil
	}
	request := api.RoleRequest{RunID: runID, ModuleID: w.id.ModuleID, ModuleVersion: w.id.Version, Profile: step.Role, Input: composed.RoleInput, BundleDigest: w.id.BundleDigest}
	// Every role call this step can make is checked against the frame bound
	// before the first one is sent.
	for _, capability := range steps.RoleCapabilities {
		call := api.RoleCall{Identity: w.id, RunID: runID, Profile: step.Role, Input: composed.RoleInput}
		if capability == api.RoleCompleteCapability {
			call.AuditRef = w.auditRef
		}
		if err := steps.CheckFrame("host.invoke", api.Invocation{OperationID: capability + ":" + runID, Capability: capability, Input: marshal(call)}); err != nil {
			return nil, refusal("refused", "frame.oversize", err.Error()), nil
		}
	}
	obs, err := w.execute(ctx, request)
	if err != nil {
		return nil, nil, err
	}
	if obs.Answer != nil {
		w.evidence = append(w.evidence, Evidence{Step: stepID, Attempt: attempt, RunID: obs.Answer.RunID, PrincipalID: obs.Answer.PrincipalID, ObservedAt: obs.Answer.ObservedAt, RoleState: obs.State})
	}
	if obs.Refusal == "recovery-required" {
		return nil, refusal("recovery-required", "host.recovery-required", obs.RefusedCall+" "+runID), nil
	}
	if obs.Refusal != "" {
		return nil, refusal("refused", "host."+obs.Refusal, obs.RefusedCall+" "+runID), nil
	}
	switch obs.State {
	case "accepted":
		return nil, refusal("recovery-required", "role.accepted", runID+" has no terminal answer; it is never rerun"), nil
	case "settled":
		answer, err := steps.Parse(obs.Answer.Output)
		if err != nil {
			return nil, refusal("refused", "result.invalid", err.Error()), nil
		}
		if err := step.result.Validate(answer); err != nil {
			return nil, refusal("refused", "result.invalid", stepID+": "+err.Error()), nil
		}
		return obs.Answer.Output, nil, nil
	}
	return nil, refusal("refused", "role."+obs.State, runID+" did not reach a settled answer"), nil
}

// execute observes the run first and acts on what it reads: settled is
// reused as it stands, accepted is never acted on, answered is completed
// with the invocation's audit_ref on that one completion, absent is run.
// The reference is consumed by the first run found at answered, so it is
// never sent to a run this invocation started (69.3).
func (w *workflow) execute(ctx context.Context, request api.RoleRequest) (steps.Observation, error) {
	response, err := w.client.ReadRole(ctx, request)
	if err != nil {
		var refusedBy *api.RoleError
		if errors.As(err, &refusedBy) {
			return steps.Observation{State: "refused", Refusal: refusedBy.Code, RefusedCall: api.RoleReadCapability}, nil
		}
		return steps.Observation{}, err
	}
	switch response.State {
	case "settled", "accepted":
		return steps.Observation{State: response.State, Answer: response.Result}, nil
	case "answered":
		auditRef := w.auditRef
		w.auditRef = ""
		return steps.Execute(ctx, w.client, request, auditRef)
	}
	return steps.Execute(ctx, w.client, request, "")
}

// principal is the principal the evidence holds for a run, "" when the run
// has no entry.
func (w *workflow) principal(runID string) string {
	for _, e := range w.evidence {
		if e.RunID == runID {
			return e.PrincipalID
		}
	}
	return ""
}

// carries checks that the frozen role input is the module's task with the
// two host members added and nothing else changed (69.1: the host verifies
// the task; the module verifies that what it forwards is what it composed).
func carries(roleInput any, taskBytes []byte) error {
	input, ok := roleInput.(map[string]any)
	if !ok {
		return errors.New("role_input is not an object")
	}
	parsedTask, err := steps.Parse(taskBytes)
	if err != nil {
		return err
	}
	task := parsedTask.(map[string]any)
	for key, value := range task {
		if !steps.Equal(input[key], value) {
			return fmt.Errorf("role_input.%s is not the composed task's", key)
		}
	}
	for key := range input {
		if _, ok := task[key]; ok {
			continue
		}
		if key != "project_context" && key != "output_contract" {
			return fmt.Errorf("role_input.%s is neither the task's nor the host's", key)
		}
	}
	return nil
}

// echoes checks the review's binding echo against the capture's binding and
// the domain against the workflow's (completion.binding_echoed).
func echoes(review, binding json.RawMessage) error {
	var got, want map[string]any
	if json.Unmarshal(review, &got) != nil || json.Unmarshal(binding, &want) != nil {
		return errors.New("review or binding is not an object")
	}
	for _, key := range []string{"participant", "plan_hash", "input_revisions", "policy_version"} {
		if !equalJSON(got[key], want[key]) {
			return fmt.Errorf("%s is not the binding's", key)
		}
	}
	if got["domain"] != "code" {
		return errors.New("domain is not code")
	}
	return nil
}

func equalJSON(a, b any) bool {
	x, errA := json.Marshal(a)
	y, errB := json.Marshal(b)
	return errA == nil && errB == nil && string(x) == string(y)
}

func stringMember(object json.RawMessage, key string) string {
	var members map[string]json.RawMessage
	var value string
	if json.Unmarshal(object, &members) != nil || json.Unmarshal(members[key], &value) != nil {
		return ""
	}
	return value
}

func objections(review json.RawMessage) string {
	var r struct {
		MaterialObjections []string `json:"material_objections"`
	}
	_ = json.Unmarshal(review, &r)
	return strings.Join(r.MaterialObjections, "; ")
}

func countFindings(answer json.RawMessage) int {
	var r struct {
		Findings []json.RawMessage `json:"findings"`
	}
	_ = json.Unmarshal(answer, &r)
	return len(r.Findings)
}

// notPassed is why an audit result does not pass (completion.passed), ""
// when it does.
func notPassed(audit json.RawMessage) string {
	var r struct {
		Agreements    []json.RawMessage `json:"agreements"`
		Discrepancies []json.RawMessage `json:"discrepancies"`
		Unknowns      []json.RawMessage `json:"unknowns"`
		Coherence     struct {
			AuditResult string `json:"audit_result"`
			Rebalance   string `json:"rebalance_recommendation"`
		} `json:"coherence"`
	}
	_ = json.Unmarshal(audit, &r)
	switch {
	case len(r.Agreements) == 0:
		return "no agreements"
	case len(r.Discrepancies) != 0:
		return fmt.Sprintf("%d discrepancies", len(r.Discrepancies))
	case len(r.Unknowns) != 0:
		return fmt.Sprintf("%d unknowns", len(r.Unknowns))
	case r.Coherence.AuditResult != "coherent":
		return "coherence " + r.Coherence.AuditResult
	case r.Coherence.Rebalance != "none":
		return "rebalance recommendation " + r.Coherence.Rebalance
	}
	return ""
}

// envelope builds the answer: completed with the record of what ran when
// stop is nil, escalated with that record and the step stopped at,
// refused and recovery-required with a null result.
func (w *workflow) envelope(stop *outcome) *Envelope {
	env := &Envelope{Domain: Domain{Result: null, Violations: []Violation{}}, HostEvidence: w.evidence}
	if stop == nil {
		env.Domain.Status = "completed"
		env.Domain.Result = w.result(nil)
		return env
	}
	env.Domain.Status = stop.status
	env.Domain.Violations = []Violation{{Code: stop.code, Detail: stop.detail}}
	if stop.status == "escalated" {
		env.Domain.Result = w.result(&stop.stoppedAt)
	}
	return env
}

func (w *workflow) result(stoppedAt *string) json.RawMessage {
	r := Result{Exploration: w.exploration, Attempts: make([]Attempt, 0, len(w.attempts)), Integration: null, Audit: null, Closure: null, StoppedAt: stoppedAt}
	for _, a := range w.attempts {
		r.Attempts = append(r.Attempts, *a)
	}
	if w.integration != nil {
		r.Integration = w.integration
	}
	if w.audit != nil {
		r.Audit = w.audit
	}
	if w.closure != nil {
		r.Closure = w.closure
	}
	return marshal(r)
}

// encode marshals the envelope, checks it against the frame bound and
// against its own schema. An envelope that would not fit the wire is
// replaced by a refusal that says so, with the evidence kept and the result
// dropped.
func (d *Definition) encode(operationID string, env *Envelope) (json.RawMessage, error) {
	body, err := json.Marshal(env)
	if err != nil {
		return nil, err
	}
	if err := steps.CheckFrame("module.result", api.Result{OperationID: operationID, Output: body}); err != nil {
		replaced := &workflow{evidence: env.HostEvidence}
		if body, err = json.Marshal(replaced.envelope(refusal("refused", "frame.oversize", err.Error()))); err != nil {
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
