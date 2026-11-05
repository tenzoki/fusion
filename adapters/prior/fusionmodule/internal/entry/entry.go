// Package entry interprets the bundle's generic entry workflow definition,
// workflows/entry.v2.json, over the step executor of internal/steps and the
// host service client of internal/hostsvc, and serves it as the module
// capability fusion.entry.v2: one run of any catalog entry, an agent or a
// skill, a user starts, delivered by Prior's step-17 model.
//
// The definition is fusion's proposal in request 77 (plan step 3 of
// 261027-1612-plan-fusion-13-4-1-entry-delivery-on-the-step-17-model). Five
// steps run in order: compose, workspace, run, integrate and workbench. The
// run step takes its role from the invocation: the module resolves entry.id
// through the catalog's entries, checks kind and profile against the entry,
// and refuses an entry whose prior support is not supported before any host
// call. The definition's two schemas bind the run whatever the entry's
// profile declares (decision D5): the invocation and the frozen role input
// are validated against entry-request.v1.json, the settled answer and the
// envelope against entry-result.v2.json.
//
// A run that ends in success or stop is integrated by one call,
// host.entry.integrate.v1: the host fast-forwards the branch the user's HEAD
// named with the run's commits and applies its uncommitted delta to the
// user's checkout. The module checks the answer against what it knows of the
// run before it copies commits and delta into the envelope; a receipt that
// fails a check is integration.invalid, a host refusal integration.refused.
// The workbench step then reads each control record the integration names,
// as an observation.
//
// The three entry services, host.question.v1, host.exec.v1 and
// host.dispatch.v1, are model tools of the role run, bound by Prior
// (internal/supervisor/general_tools.go). The module calls none of them: the
// definition's requires names them so that Prior grants them to the run, and
// the catalog admits no other service in an entry's requires. The run's
// questions reach the envelope as the settled answer carries them.
//
// Restart is the common contract's (69.3): the role is read before it is
// run, through steps.Execute, so a run at settled is reused without a model
// call, one at answered is completed with the invocation's audit_ref on that
// completion alone, one at accepted is recovery-required and never rerun. A
// host service with a completed receipt replays its frozen request on the
// same operation id, so a restart after any persisted boundary reproduces the
// envelope with no second effect and no second role run.
package entry

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"strings"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/controlrecord"
	"github.com/kai/prior/integrationbuild/fusionmodule/internal/hostsvc"
	"github.com/kai/prior/integrationbuild/fusionmodule/internal/steps"
	api "github.com/kai/prior/moduleapi/v1"
)

// WorkflowAsset is where the definition lives in the payload.
const WorkflowAsset = "workflows/entry.v2.json"

// ErrDefinition is returned when the definition is not one this executor can
// interpret: a shape it does not know is refused at load, never run on a
// guess.
var ErrDefinition = errors.New("entry definition not interpretable")

// expected is the step list this executor runs, in order.
var expected = []struct{ id, service string }{
	{"compose", api.RoleComposeCapability},
	{"workspace", api.WorkspaceCapability},
	{"run", api.RoleRunCapability},
	{"integrate", hostsvc.EntryIntegrateCapability},
	{"workbench", api.WorkbenchCapability},
}

// services are the ten the definition must declare, no more and no fewer:
// the three role services, compose, workspace, the integrate service, the
// workbench and the three entry services (decision E1, option 1). The module
// makes no preflight against the host; this is the definition's own
// consistency.
var services = append(append(append([]string(nil), steps.RoleCapabilities...), api.RoleComposeCapability, api.WorkspaceCapability, hostsvc.EntryIntegrateCapability, api.WorkbenchCapability), steps.EntryServices...)

// recordSlot is the workbench read's slot as the definition names it; the
// module derives record:<control path> from it.
const recordSlot = "record:<control path>"

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
	OnEnding     struct {
		Success string `json:"success"`
		Stop    string `json:"stop"`
		Refusal string `json:"refusal"`
	} `json:"on_ending"`
}

type slotFrom struct {
	Slot string `json:"slot"`
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

// Load reads the definition, checks its five steps against the ones this
// executor runs and the hand-over and completion members it reads, compiles
// the four schemas, and resolves the catalog's entries: every entry supported
// on prior must have its profile in the payload.
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
	if len(w.Requires) != len(services) || !w.Declares(services...) {
		return nil, fmt.Errorf("%w: requires must name exactly the ten host services", ErrDefinition)
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
	// The endings this executor routes: success and stop integrate, a
	// refusal ends the envelope with nothing integrated.
	if done.OnEnding.Success != "integrate" || !strings.HasPrefix(done.OnEnding.Stop, "integrate") || !strings.HasPrefix(done.OnEnding.Refusal, "end") {
		return nil, fmt.Errorf("%w: run must integrate on success and stop and end on refusal", ErrDefinition)
	}
	var integrate, read slotFrom
	if json.Unmarshal(w.Steps[3].InputFrom, &integrate) != nil || integrate.Slot != hostsvc.IntegrationSlot {
		return nil, fmt.Errorf("%w: integrate must name slot %s", ErrDefinition, hostsvc.IntegrationSlot)
	}
	if json.Unmarshal(w.Steps[4].InputFrom, &read) != nil || read.Slot != recordSlot {
		return nil, fmt.Errorf("%w: workbench must name slot %s", ErrDefinition, recordSlot)
	}
	var closing workbenchCompletion
	if json.Unmarshal(w.Steps[4].Completion, &closing) != nil || closing.EnvelopeSchema == "" {
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
	// Every entry's requires is among the definition's without a check here:
	// LoadCatalog admits only the three entry services in an entry's
	// requires, and the requires check above holds all three.
	for _, e := range catalog.Entries() {
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

// Commit is one of the run's own commits the integration fast-forwarded onto
// the user's branch, with that branch's reference.
type Commit struct {
	Commit    string   `json:"commit"`
	Reference string   `json:"reference"`
	Subject   string   `json:"subject"`
	Changes   []string `json:"changes"`
}

// Envelope is the answer to a fusion.entry.v2 invocation,
// schemas/entry-result.v2.json.
type Envelope struct {
	Status     string            `json:"status"`
	Ending     *Ending           `json:"ending"`
	Questions  []json.RawMessage `json:"questions"`
	Commits    []Commit          `json:"commits"`
	Delta      []string          `json:"delta"`
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

// answer is the part of a settled run's result the module reads: its status,
// and what the envelope copies.
type answer struct {
	Status     string            `json:"status"`
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
	delta   []string
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

// run executes the five steps and returns how the workflow stopped early,
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
		// A stopped run keeps what it changed, as Claude Code keeps a
		// stopped session's files, so both integrate (completion.on_ending).
	default:
		return refused("result.invalid", "ending class "+w.answer.Ending.Class), nil
	}

	reply, err = w.host.EntryIntegrate(ctx, runID)
	if errors.Is(err, hostsvc.ErrOversize) {
		return refused("frame.oversize", err.Error()), nil
	}
	if err != nil {
		return nil, err
	}
	switch reply.State {
	case "completed":
	case "recovery-required":
		return recoveryRequired("host.recovery-required", reply.Capability+" "+reply.Slot+": "+reply.Code), nil
	default:
		// Nothing was integrated: the host refuses before any effect.
		return refused("integration.refused", reply.Capability+" "+reply.Slot+": "+reply.Code), nil
	}
	integrated, err := reply.EntryIntegration()
	if err != nil {
		return nil, err
	}
	if err := checkReceipt(integrated, runID, ws.BaseRevision); err != nil {
		return refused("integration.invalid", err.Error()), nil
	}
	// The integration stands from here on: a later refusal keeps its commits
	// and its delta in the envelope.
	w.commits = make([]Commit, 0, len(integrated.Commits))
	for _, c := range integrated.Commits {
		w.commits = append(w.commits, Commit{Commit: c.Commit, Reference: integrated.Reference, Subject: c.Subject, Changes: c.Changes})
	}
	w.delta = integrated.Delta

	for _, record := range controlRecords(w.commits, w.delta) {
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

// nameStatus is one line of git's name-status form as entry-result.v2.json's
// $defs/name_status states it: a status of A, D, M or T and one path, or C or
// R with a similarity score and two paths; no path empty, absolute or
// carrying a tab or a newline. It stays the frozen schema's own text, so a
// receipt the check admits is an envelope the schema admits. The receipt check
// is this pattern plus validPaths, v2's own "valid relative path" from the
// definition's receipt text, which the pattern does not state.
var nameStatus = regexp.MustCompile(`^(?:[ADMT]\t[^\t\n/][^\t\n]*|[CR][0-9]{1,3}\t[^\t\n/][^\t\n]*\t[^\t\n/][^\t\n]*)$`)

// commitHash is a commit hash as entry-result.v2.json admits it.
var commitHash = regexp.MustCompile(`^([0-9a-f]{40}|[0-9a-f]{64})$`)

// checkReceipt checks an integration answer against what the module knows of
// the run: it is this run's, from the workspace's base, onto a named
// reference; its commits are empty exactly when head is base and otherwise end
// at head, each a commit hash with a subject; and every path line is in
// name-status form with valid relative paths. The first failure is returned.
func checkReceipt(r hostsvc.EntryIntegration, runID, base string) error {
	switch {
	case r.RunID != runID:
		return errors.New("run_id is not the run's")
	case r.Base != base:
		return errors.New("base is not the workspace's base_revision")
	case r.Reference == "":
		return errors.New("reference is empty")
	case len(r.Commits) == 0 && r.Head != base:
		return errors.New("no commit, but head is not base")
	case len(r.Commits) > 0 && r.Head == base:
		return errors.New("commits, but head is base")
	case len(r.Commits) > 0 && r.Commits[len(r.Commits)-1].Commit != r.Head:
		return errors.New("the last commit is not head")
	}
	for i, c := range r.Commits {
		if !commitHash.MatchString(c.Commit) || c.Subject == "" {
			return fmt.Errorf("commits[%d] is not a commit hash with a subject", i)
		}
		for _, line := range c.Changes {
			if !nameStatus.MatchString(line) {
				return fmt.Errorf("commits[%d].changes item %q is not in name-status form", i, line)
			}
			if !validPaths(line) {
				return fmt.Errorf("commits[%d].changes item %q has an empty, . or .. path segment", i, line)
			}
		}
	}
	for _, line := range r.Delta {
		if !nameStatus.MatchString(line) {
			return fmt.Errorf("delta item %q is not in name-status form", line)
		}
		if !validPaths(line) {
			return fmt.Errorf("delta item %q has an empty, . or .. path segment", line)
		}
	}
	return nil
}

// validPaths reports whether no path of a name-status line has an empty, .
// or .. segment. Prior's own answer validator refuses the same paths first,
// so its host cannot trigger this; the check holds the definition's text on
// the module's side.
func validPaths(line string) bool {
	for _, p := range strings.Split(line, "\t")[1:] {
		for _, segment := range strings.Split(p, "/") {
			if segment == "" || segment == "." || segment == ".." {
				return false
			}
		}
	}
	return true
}

// controlRecords are the control records among the paths the integration
// names, each once, relative to the workbench, in the order each first
// appears. controlrecord.Select decides what is a control record. A record is
// read when its last status, in commit order and then in the delta, is not D:
// the host's read admission selects the same way (Prior's
// entryControlRecords, request 77 question 12 (a)), so a record deleted after
// it was changed is one the host refuses. A line's path is its last field, the
// new path of a C or R line; an R line also leaves its old path deleted, and a
// C line leaves its old path as it was.
func controlRecords(commits []Commit, delta []string) []string {
	var lines []string
	for _, c := range commits {
		lines = append(lines, c.Changes...)
	}
	lines = append(lines, delta...)
	last := map[string]string{}
	var order []string
	note := func(path, status string) {
		record, ok := controlrecord.Select(path)
		if !ok {
			return
		}
		if _, seen := last[record]; !seen {
			order = append(order, record)
		}
		last[record] = status
	}
	for _, line := range lines {
		fields := strings.Split(line, "\t")
		status := fields[0]
		if strings.HasPrefix(status, "R") && len(fields) == 3 {
			note(fields[1], "D")
		}
		note(fields[len(fields)-1], status)
	}
	var out []string
	for _, record := range order {
		if last[record] != "D" {
			out = append(out, record)
		}
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
	// The schema admits a recovery-required answer, but a settled answer is
	// terminal: recovery-required means an effect unknown or in flight, which
	// a settled answer never is, and every resume would observe it settled
	// again. It is refused, and nothing is integrated.
	if a.Status == "recovery-required" || a.Ending == nil {
		return refused("result.invalid", "a settled answer of status recovery-required"), nil
	}
	w.answer = &a
	return nil, nil
}

// selectedAmongOptions is the rule entry-result.v2.json cannot state: on the
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
// invocation (the entry workflow escalates nowhere: it has no review).
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
// whenever there is one; commits and delta are the integration's whenever it
// stands, a later stop included.
func (w *workflow) envelope(stop *outcome) *Envelope {
	env := &Envelope{Questions: []json.RawMessage{}, Commits: []Commit{}, Delta: []string{}, Violations: []Violation{}}
	if w.commits != nil {
		env.Commits = w.commits
	}
	if w.delta != nil {
		env.Delta = w.delta
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
// replaced by a refusal that says so and still carries the integration's
// commits and delta, which stand whatever the envelope says, with the
// questions emptied, being what can grow without bound; only if that still
// does not fit is it the bare refusal.
func (d *Definition) encode(operationID string, env *Envelope) (json.RawMessage, error) {
	body, err := json.Marshal(env)
	if err != nil {
		return nil, err
	}
	if err := steps.CheckFrame("module.result", api.Result{OperationID: operationID, Output: body}); err != nil {
		stop := refused("frame.oversize", err.Error())
		if body, err = json.Marshal((&workflow{commits: env.Commits, delta: env.Delta}).envelope(stop)); err != nil {
			return nil, err
		}
		if steps.CheckFrame("module.result", api.Result{OperationID: operationID, Output: body}) != nil {
			if body, err = json.Marshal((&workflow{}).envelope(stop)); err != nil {
				return nil, err
			}
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
