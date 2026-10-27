package conformance

// The entry cases of plan step 5 of 261027-1612-plan-fusion-13-4-1-entry-delivery-on-the-step-17-model:
// fusion.entry.v2 driven against the process started from the extracted
// bundle (see host_test.go for what that is and is not), over the fake host
// of internal/fixture, which serves the three role services, the request-69
// services compose, workspace and workbench, the integrate service
// host.entry.integrate.v1 fusion proposes in request 77, and the three entry
// services. The module calls none of the entry services; each role run is
// scripted and makes its class's calls inside the run, as Prior's model loop
// would: host.exec.v1 for plain, host.dispatch.v1 for dispatches,
// host.question.v1 for asks. The fake integrates by Prior's step-17 model:
// the run's commits as made, fast-forwarded onto the user's branch, and its
// uncommitted paths as the delta. The unit-level version over a fixture
// payload is internal/entry's; here the catalog, the profiles, the
// definition and both schemas are the installed payload's, and the entries
// driven must be supported on prior in it.

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"slices"
	"strings"
	"testing"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/fixture"
	"github.com/kai/prior/integrationbuild/fusionmodule/internal/steps"
	api "github.com/kai/prior/moduleapi/v1"
)

// EntryCapability is the entry workflow the bundle advertises beside the
// explorer.
const EntryCapability = "fusion.entry.v2"

const (
	entryWorkflowID = "wf-conformance-entry"
	entryRunID      = "run-conformance-entry"
	// entryPackageRecord is the control record the dispatched child of the
	// dispatches case changes, workbench-relative as the codec names it.
	entryPackageRecord = "work-packages/261023-1200-fixture-package/package.json"
	entryMemoPath      = "fusion-workbench/shared/memos/notes-fixture.md"
)

// classCall is the entry service that marks each class: a run of that class
// that never made the call has not exercised it.
var classCall = map[string]string{
	"plain":      api.ExecCapability,
	"dispatches": api.DispatchCapability,
	"asks":       api.QuestionCapability,
}

// entryDrive is one entry the cases drive, with its scripted run.
type entryDrive struct {
	id, kind, profile, class string
	arguments                []map[string]string
	script                   fixture.Script
	pageBytes                int
	// childHeld is what the run holds for its dispatched child, by the
	// child's declared argument name; the dispatch input is built from it
	// against the child's declaration in the bundle's catalog.json.
	childHeld map[string]string
}

// reconcileTask is the one-sentence task the reconcile body gives the
// state-auditor after its parameter lines (skill-reconcile part 16).
const reconcileTask = "Reconcile every tracking file against ground truth and return the three-edge Coherence audit result."

// entryDrives are help (plain), reconcile (dispatches) and memo (asks). Each
// script makes its class's call; the dispatches and asks runs also change
// the workspace and leave the change uncommitted, so their envelopes carry
// it in delta, and the dispatched child changes a control record, which the
// workbench step reads in more than one page.
func entryDrives() []entryDrive {
	return []entryDrive{
		{id: "help", kind: "skill", profile: "skill-help", class: "plain",
			arguments: []map[string]string{{"name": "topic", "value": "daily"}},
			script: fixture.Script{Calls: []fixture.ScriptCall{
				{Capability: api.ExecCapability, CallID: "x-1", Argv: []string{"bin/fusion-workbench-root"}},
			}}},
		{id: "reconcile", kind: "skill", profile: "skill-reconcile", class: "dispatches",
			arguments: []map[string]string{{"name": "--domain", "value": "code"}, {"name": "brief", "value": "check package F"}},
			script: fixture.Script{Calls: []fixture.ScriptCall{
				{Capability: api.ExecCapability, CallID: "x-1", Argv: []string{"bin/fusion-work-order"}},
				{Capability: api.DispatchCapability, CallID: "d-1", Entry: "state-auditor", Writes: []string{fixture.WorkbenchPrefix + entryPackageRecord}},
			}},
			pageBytes: 40,
			// Domain and Directive from the run's arguments, no Since, which
			// the run does not hold and so omits; the task last.
			childHeld: map[string]string{"**Domain:**": "code", "**Directive:**": "check package F", "task": reconcileTask}},
		{id: "memo", kind: "skill", profile: "skill-memo", class: "asks",
			arguments: []map[string]string{{"name": "content", "value": "buy milk"}},
			script: fixture.Script{Calls: []fixture.ScriptCall{
				{Capability: api.QuestionCapability, CallID: "q-1", Question: "Note or task?", Options: []string{"note", "task"}, Channel: api.QuestionChannelAskUser, Answer: api.QuestionResult{Outcome: api.QuestionAnswered, Selected: []string{"note"}}},
				{Capability: api.ExecCapability, CallID: "x-2", Argv: []string{"bin/fusion-memo", "note", "buy milk"}, Writes: []string{entryMemoPath}},
			}}},
	}
}

// entryEnvelope is the wire shape of schemas/entry-result.v2.json, decoded
// strictly so a member the schema does not allow is a failure.
type entryEnvelope struct {
	Status string `json:"status"`
	Ending *struct {
		Class  string `json:"class"`
		Reason string `json:"reason"`
	} `json:"ending"`
	Questions []struct {
		CallID   string   `json:"call_id"`
		Question string   `json:"question"`
		Options  []string `json:"options"`
		Channel  string   `json:"channel"`
		Outcome  string   `json:"outcome"`
		Selected []string `json:"selected"`
		Text     string   `json:"text"`
	} `json:"questions"`
	Commits []struct {
		Commit    string   `json:"commit"`
		Reference string   `json:"reference"`
		Subject   string   `json:"subject"`
		Changes   []string `json:"changes"`
	} `json:"commits"`
	Delta      []string `json:"delta"`
	Violations []struct {
		Code   string `json:"code"`
		Detail string `json:"detail"`
	} `json:"violations"`
}

// entryInput is the invocation, valid against the payload's
// entry-request.v1.json.
func entryInput(t *testing.T, d entryDrive) json.RawMessage {
	t.Helper()
	return mustMarshal(t, map[string]any{
		"workflow_id":     entryWorkflowID,
		"run_id":          entryRunID,
		"entry":           map[string]string{"id": d.id, "kind": d.kind, "profile": d.profile},
		"arguments":       d.arguments,
		"project_context": map[string]any{"instructions": []any{}},
	})
}

// validates checks body against one of the payload's schemas.
func validates(t *testing.T, payload *steps.Bundle, schema string, body []byte) {
	t.Helper()
	s, err := payload.Schema(schema)
	if err != nil {
		t.Fatal(err)
	}
	v, err := steps.Parse(body)
	if err != nil {
		t.Fatalf("%s: %v", body, err)
	}
	if err := s.Validate(v); err != nil {
		t.Fatalf("%s does not validate against %s: %v", body, schema, err)
	}
}

// dispatchArgument is one item of a dispatch input's arguments.
type dispatchArgument struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

// childInput builds a host.dispatch.v1 input in the shape fusion proposes in
// request 76 (the dispatch rule of every prior part that dispatches, e.g.
// skill-reconcile part 01 and orchestrator part 33): {"arguments": [{name,
// value}, ...]}, one item per argument the child entry declares in the
// bundle's catalog.json that the run holds a value for, in declared order. A
// held value under a name the child does not declare fails the test.
func childInput(t *testing.T, catalog *steps.Catalog, child string, held map[string]string) json.RawMessage {
	t.Helper()
	e, ok := catalog.Entry(child)
	if !ok {
		t.Fatalf("the bundle's catalog has no entry %s to dispatch", child)
	}
	declared := map[string]bool{}
	items := []dispatchArgument{}
	for _, a := range e.Arguments.Items {
		declared[a.Name] = true
		if v, ok := held[a.Name]; ok {
			items = append(items, dispatchArgument{a.Name, v})
		}
	}
	for name := range held {
		if !declared[name] {
			t.Fatalf("%s declares no argument %q", child, name)
		}
	}
	return mustMarshal(t, map[string][]dispatchArgument{"arguments": items})
}

// checkDispatchInput holds the input the fake host received on a dispatch to
// the shape: exactly one member, arguments; each item exactly name and
// value; every name one the child declares, once; no empty value; every
// required argument present; the parameter lines before the first-message
// argument, both in declared order.
func checkDispatchInput(t *testing.T, catalog *steps.Catalog, child string, input json.RawMessage) {
	t.Helper()
	var shape struct {
		Arguments []dispatchArgument `json:"arguments"`
	}
	if err := api.Decode(input, &shape); err != nil || shape.Arguments == nil {
		t.Fatalf("dispatch input %s is not {\"arguments\":[{name,value}]}: %v", input, err)
	}
	var strict struct {
		Arguments []map[string]json.RawMessage `json:"arguments"`
	}
	if err := json.Unmarshal(input, &strict); err != nil {
		t.Fatal(err)
	}
	for _, item := range strict.Arguments {
		if _, n := item["name"]; len(item) != 2 || !n {
			t.Fatalf("dispatch input item %v is not exactly {name, value}", item)
		}
	}
	e, _ := catalog.Entry(child)
	position := map[string]int{}
	for i, a := range e.Arguments.Items {
		position[a.Name] = i
	}
	sent := map[string]bool{}
	last := -1
	for _, a := range shape.Arguments {
		i, ok := position[a.Name]
		if !ok || sent[a.Name] || a.Value == "" || i <= last {
			t.Fatalf("dispatch input %s: item %q is undeclared by %s, repeated, empty or out of declared order", input, a.Name, child)
		}
		sent[a.Name], last = true, i
	}
	for _, a := range e.Arguments.Items {
		if a.Required && !sent[a.Name] {
			t.Fatalf("dispatch input %s lacks %s's required %q", input, child, a.Name)
		}
	}
}

// entryRun is one entry driven against the built bundle: the installed
// payload and its catalog, the fake host after the run, the envelope as
// sent and as decoded, and the capabilities the script calls, in order.
type entryRun struct {
	bundle   *bundle
	payload  *steps.Bundle
	catalog  *steps.Catalog
	host     *fixture.EntryHost
	out      json.RawMessage
	env      entryEnvelope
	scripted []string
}

// driveEntry runs one entry through fusion.entry.v2 against the process
// started from the built bundle. The entry must be the installed catalog's,
// of the class the drive names and supported on prior, and its script must
// call only services within its requires, its class's call among them.
// configure, when not nil, adjusts the fake host before the session opens.
// Both the invocation and the envelope must validate against the installed
// payload's schemas, and a session that writes to stderr fails.
func driveEntry(t *testing.T, d entryDrive, configure func(*fixture.EntryHost)) *entryRun {
	t.Helper()
	b := openBundle(t)
	payload, err := steps.OpenBundle(b.dir)
	if err != nil {
		t.Fatalf("payload: %v", err)
	}
	catalog, err := steps.LoadCatalog(payload)
	if err != nil {
		t.Fatalf("catalog.json: %v", err)
	}
	e, ok := catalog.Entry(d.id)
	if !ok || e.Kind != d.kind || e.Profile != d.profile || e.Class != d.class || e.Support["prior"] != "supported" {
		t.Fatalf("the bundle's catalog has %s as %+v", d.id, e)
	}
	var scripted []string
	for i, c := range d.script.Calls {
		if c.Capability == api.DispatchCapability {
			d.script.Calls[i].Input = childInput(t, catalog, c.Entry, d.childHeld)
		}
		if !slices.Contains(e.Requires, c.Capability) {
			t.Fatalf("the script calls %s, outside %s's requires %v", c.Capability, d.id, e.Requires)
		}
		scripted = append(scripted, c.Capability)
	}
	if !slices.Contains(scripted, classCall[d.class]) {
		t.Fatalf("the %s script never calls %s", d.class, classCall[d.class])
	}

	host := fixture.NewEntryHost(entryWorkflowID, entryRunID, d.profile)
	host.Scripts[d.profile] = d.script
	host.PageBytes = d.pageBytes
	if configure != nil {
		configure(host)
	}
	s, err := tryConnect(t, b, host.Host, host.Services(), []string{EntryCapability})
	if err != nil {
		t.Fatalf("handshake: %v; module stderr: %q", err, s.proc.stderr.String())
	}
	defer s.close()
	input := entryInput(t, d)
	validates(t, payload, "schemas/entry-request.v1.json", input)
	out, err := s.client.Invoke(s.ctx, api.Invocation{OperationID: "op-1", Capability: EntryCapability, Input: input})
	if err != nil {
		t.Fatalf("invoke: %v; module stderr: %q", err, s.proc.stderr.String())
	}
	validates(t, payload, "schemas/entry-result.v2.json", out)
	var env entryEnvelope
	if err := api.Decode(out, &env); err != nil {
		t.Fatalf("envelope %s: %v", out, err)
	}
	if stderr := s.proc.stderr.String(); stderr != "" {
		t.Fatalf("the module wrote to stderr during a clean session: %q", stderr)
	}
	return &entryRun{bundle: b, payload: payload, catalog: catalog, host: host, out: out, env: env, scripted: scripted}
}

// effect counts the effects the fake host performed under one capability,
// replays excluded.
func (r *entryRun) effect(capability string) int {
	n := 0
	for key, count := range r.host.Effects {
		if strings.HasPrefix(key, capability+"/") {
			n += count
		}
	}
	return n
}

// checkRun holds what every run that reached the integrate step shares: one
// role run under the profile the entry names, forwarding the bytes the host
// froze on every role call with no audit reference, the frozen input the
// payload's request shape; the module calling none of the entry services
// and the run making exactly the scripted calls, each under the run as actor
// and the operation id Prior derives; one compose, one workspace and one
// integrate call; and none of the retired request-69 services capture,
// integrate or snapshot sent.
func (r *entryRun) checkRun(t *testing.T, d entryDrive) {
	t.Helper()
	host := r.host
	if host.ModelCalls != 1 || host.CountSent(api.RoleRunCapability) != 1 {
		t.Fatalf("%d model calls, %d role runs sent", host.ModelCalls, host.CountSent(api.RoleRunCapability))
	}
	frozen := host.Composed(entryRunID)
	if frozen == nil {
		t.Fatal("the role input was never composed")
	}
	validates(t, r.payload, "schemas/entry-request.v1.json", frozen)
	for _, call := range host.Host.Calls {
		if string(call.Call.Input) != string(frozen) || call.Call.Profile != d.profile || call.Call.AuditRef != "" {
			t.Fatalf("role call %+v", call)
		}
	}

	for _, capability := range fixture.EntryCapabilities {
		if n := host.CountSent(capability); n != 0 {
			t.Fatalf("the module called %s %d times", capability, n)
		}
	}
	var made []string
	for _, call := range host.EntryCalls() {
		made = append(made, call.Capability)
		var binding struct {
			Identity   api.Identity `json:"identity"`
			WorkflowID string       `json:"workflow_id"`
			Actor      string       `json:"actor"`
		}
		if err := json.Unmarshal(call.Input, &binding); err != nil {
			t.Fatalf("entry call %s: %v", call.Input, err)
		}
		if call.Capability == api.DispatchCapability {
			var dispatch struct {
				Entry       string          `json:"entry"`
				Description string          `json:"description"`
				Input       json.RawMessage `json:"input"`
			}
			if err := json.Unmarshal(call.Input, &dispatch); err != nil {
				t.Fatalf("dispatch call %s: %v", call.Input, err)
			}
			if len(made) > len(d.script.Calls) {
				t.Fatalf("the run made %v, more calls than the script's %d", made, len(d.script.Calls))
			}
			want := d.script.Calls[len(made)-1]
			checkDispatchInput(t, r.catalog, dispatch.Entry, dispatch.Input)
			wantInput := childInput(t, r.catalog, want.Entry, d.childHeld)
			if dispatch.Entry != want.Entry || dispatch.Description == "" || strings.ContainsAny(dispatch.Description, "\n") || string(dispatch.Input) != string(wantInput) {
				t.Fatalf("dispatch call %s, want entry %s and input %s", call.Input, want.Entry, wantInput)
			}
			t.Logf("dispatched %s with %s", dispatch.Entry, dispatch.Input)
		}
		if binding.Identity != r.bundle.identity || binding.WorkflowID != entryWorkflowID || binding.Actor != entryRunID || call.OperationID != api.EntryOperationID(call.Capability, entryWorkflowID, entryRunID, call.Slot) {
			t.Fatalf("entry call %+v", call)
		}
	}
	if strings.Join(made, " ") != strings.Join(r.scripted, " ") {
		t.Fatalf("the run made %v, the script %v", made, r.scripted)
	}

	if r.effect(api.RoleComposeCapability) != 1 || r.effect(api.WorkspaceCapability) != 1 || host.CountSent(fixture.EntryIntegrateCapability) != 1 {
		t.Fatalf("effects %v, sent %v", host.Effects, host.Sent)
	}
	if n := host.CountSent(api.CaptureCapability) + host.CountSent(api.IntegrateCapability) + host.CountSent(api.SnapshotCapability); n != 0 {
		t.Fatalf("the module sent %d calls to a retired request-69 service: %v", n, host.Sent)
	}
}

// pageCalls counts the workbench page calls the module sent.
func (r *entryRun) pageCalls() int {
	pages := 0
	for _, call := range r.host.Calls {
		if strings.HasPrefix(call.Slot, "page:") {
			pages++
		}
	}
	return pages
}

// One entry per class runs through fusion.entry.v2 to a completed envelope
// against the process started from the built bundle, each run made its
// class's service call, and each was integrated once: help changes nothing,
// so its integration is empty; reconcile's dispatched child leaves a control
// record uncommitted, which reaches delta and is read in more than one page;
// memo leaves its memo uncommitted, which reaches delta and is not read.
func TestOneEntryPerClassRunsAgainstTheBuiltBundle(t *testing.T) {
	for _, d := range entryDrives() {
		t.Run(d.class+" "+d.id, func(t *testing.T) {
			r := driveEntry(t, d, nil)
			env := r.env
			if env.Status != "completed" || env.Ending == nil || env.Ending.Class != "success" || env.Ending.Reason != "answered" || len(env.Violations) != 0 || len(env.Commits) != 0 {
				t.Fatalf("envelope %s", r.out)
			}
			r.checkRun(t, d)
			if r.effect(fixture.EntryIntegrateCapability) != 1 {
				t.Fatalf("effects %v", r.host.Effects)
			}
			switch d.class {
			case "plain":
				if len(env.Delta) != 0 || len(env.Questions) != 0 || r.effect(api.WorkbenchCapability) != 0 {
					t.Fatalf("envelope %s, effects %v", r.out, r.host.Effects)
				}
			case "dispatches":
				if len(env.Questions) != 0 || strings.Join(env.Delta, ",") != "M\t"+fixture.WorkbenchPrefix+entryPackageRecord {
					t.Fatalf("envelope %s", r.out)
				}
				if r.host.Effects[api.WorkbenchCapability+"/record:"+entryPackageRecord] != 1 {
					t.Fatalf("the control record was not read: %v", r.host.Effects)
				}
				if pages := r.pageCalls(); pages < 2 {
					t.Fatalf("the record was read in %d page calls", pages)
				}
			case "asks":
				// The question and its answer are copied into the envelope; the
				// memo reaches delta, and no control record is read.
				q := env.Questions
				if len(q) != 1 || q[0].CallID != "q-1" || q[0].Question != "Note or task?" || q[0].Channel != api.QuestionChannelAskUser || q[0].Outcome != "answered" || strings.Join(q[0].Options, ",") != "note,task" || strings.Join(q[0].Selected, ",") != "note" {
					t.Fatalf("questions in %s", r.out)
				}
				if strings.Join(env.Delta, ",") != "M\t"+entryMemoPath || r.effect(api.WorkbenchCapability) != 0 {
					t.Fatalf("envelope %s, effects %v", r.out, r.host.Effects)
				}
			}
		})
	}
}

// twoCommitsDrive is help driven by a script whose first command commits
// twice, the second commit taking a control record, and whose second command
// leaves a path uncommitted.
func twoCommitsDrive() entryDrive {
	d := entryDrives()[0]
	d.script = fixture.Script{Calls: []fixture.ScriptCall{
		{Capability: api.ExecCapability, CallID: "x-1", Argv: []string{"make", "fix"}, Writes: []string{"pkg/a/a.go", fixture.WorkbenchPrefix + entryPackageRecord},
			Commits: []fixture.ScriptCommit{{Subject: "Fix the failing test in pkg/a", Paths: []string{"pkg/a/a.go"}}, {Subject: "Record the fix in the package", Paths: []string{fixture.WorkbenchPrefix + entryPackageRecord}}}},
		{Capability: api.ExecCapability, CallID: "x-2", Argv: []string{"make", "notes"}, Writes: []string{"docs/notes.md"}},
	}}
	return d
}

// The three delivery cases of the step-17 model, from the launcher started
// as Prior's host starts it: (i) a run that commits twice and leaves a path
// uncommitted carries both commits in order, each with its own subject, the
// user's branch and its changes, and the path in delta, and the committed
// control record is read; (ii) memo, with no commit and one uncommitted
// path, completes with empty commits and one delta item; (iii) a conflict
// refusal of the integration ends refused integration.refused with empty
// commits and delta and no workbench read.
func TestTheThreeDeliveryCasesRunAgainstTheBuiltBundle(t *testing.T) {
	t.Run("two commits and a delta", func(t *testing.T) {
		d := twoCommitsDrive()
		r := driveEntry(t, d, nil)
		env := r.env
		if env.Status != "completed" || len(env.Violations) != 0 || len(env.Questions) != 0 {
			t.Fatalf("envelope %s", r.out)
		}
		r.checkRun(t, d)
		if len(env.Commits) != 2 {
			t.Fatalf("commits in %s", r.out)
		}
		for i, want := range []struct{ subject, change string }{{"Fix the failing test in pkg/a", "M\tpkg/a/a.go"}, {"Record the fix in the package", "M\t" + fixture.WorkbenchPrefix + entryPackageRecord}} {
			c := env.Commits[i]
			if c.Subject != want.subject || c.Reference != fixture.UserReference || strings.Join(c.Changes, ",") != want.change || len(c.Commit) != 40 {
				t.Fatalf("commit %d in %s", i, r.out)
			}
		}
		if env.Commits[0].Commit == env.Commits[1].Commit {
			t.Fatalf("one commit twice in %s", r.out)
		}
		if strings.Join(env.Delta, ",") != "M\tdocs/notes.md" {
			t.Fatalf("delta %q", env.Delta)
		}
		if r.effect(fixture.EntryIntegrateCapability) != 1 || r.host.Effects[api.WorkbenchCapability+"/record:"+entryPackageRecord] != 1 {
			t.Fatalf("effects %v", r.host.Effects)
		}
	})
	t.Run("a delta and no commit", func(t *testing.T) {
		d := entryDrives()[2]
		r := driveEntry(t, d, nil)
		env := r.env
		if env.Status != "completed" || env.Ending == nil || env.Ending.Class != "success" || len(env.Violations) != 0 || len(env.Commits) != 0 || len(env.Delta) != 1 || env.Delta[0] != "M\t"+entryMemoPath {
			t.Fatalf("envelope %s", r.out)
		}
		r.checkRun(t, d)
		if r.effect(fixture.EntryIntegrateCapability) != 1 {
			t.Fatalf("effects %v", r.host.Effects)
		}
	})
	t.Run("a conflict refusal", func(t *testing.T) {
		d := twoCommitsDrive()
		r := driveEntry(t, d, func(h *fixture.EntryHost) {
			h.Refuse[fixture.EntryIntegrateCapability+"/"+fixture.IntegrationSlot] = "conflict"
		})
		env := r.env
		if env.Status != "refused" || len(env.Violations) == 0 || env.Violations[0].Code != "integration.refused" || !strings.Contains(env.Violations[0].Detail, "conflict") || env.Ending == nil || env.Ending.Reason != "integration-refused" {
			t.Fatalf("envelope %s", r.out)
		}
		r.checkRun(t, d)
		if len(env.Commits) != 0 || len(env.Delta) != 0 || r.effect(fixture.EntryIntegrateCapability) != 0 || r.host.CountSent(api.WorkbenchCapability) != 0 {
			t.Fatalf("envelope %s, sent %v", r.out, r.host.Sent)
		}
	})
}

// assetLines parses one file in FROZEN's line form, <sha256>  <path> with
// comment and blank lines skipped, into its hash by path.
func assetLines(t *testing.T, name string, body []byte) map[string]string {
	t.Helper()
	out := map[string]string{}
	for _, line := range strings.Split(string(body), "\n") {
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		hash, path, ok := strings.Cut(line, "  ")
		if !ok || len(hash) != 64 || path == "" {
			t.Fatalf("%s line %q is not <sha256>  <path>", name, line)
		}
		out[path] = hash
	}
	return out
}

// The installed payload carries no repair: its workflows/ holds exactly
// explorer.v1.json and entry.v2.json, its workflows/ and schemas/ hold
// exactly the assets FROZEN names at the build commit, each at its frozen
// hash, no path WITHDRAWN names at that commit is in the payload, and the
// module refuses fusion.repair.v1 and fusion.entry.v1 as unknown
// capabilities while it serves the explorer and fusion.entry.v2.
func TestThePayloadCarriesTheFrozenAssetsAndNoRepair(t *testing.T) {
	b := openBundle(t)
	body, err := os.ReadFile(filepath.Join(os.Getenv("FUSION_BUNDLE_DIR"), "handover.json"))
	if err != nil {
		t.Fatal(err)
	}
	var h struct {
		FusionRevision string `json:"fusion_revision"`
	}
	if err := json.Unmarshal(body, &h); err != nil || h.FusionRevision == "" {
		t.Fatalf("handover.json names no fusion_revision: %v", err)
	}
	if strings.HasSuffix(h.FusionRevision, "+dirty") {
		t.Fatalf("the bundle was built from a dirty tree (%s): it has no build commit to conform against", h.FusionRevision)
	}
	fusionRoot := filepath.Dir(fixture.CatalogDir(t))
	atBuild := func(rel string) []byte {
		t.Helper()
		out, err := exec.Command("git", "-C", fusionRoot, "show", h.FusionRevision+":catalog/"+rel).Output()
		if err != nil {
			t.Fatalf("git show %s:catalog/%s: %v", h.FusionRevision, rel, err)
		}
		return out
	}
	frozen := assetLines(t, "FROZEN", atBuild("schemas/FROZEN"))
	withdrawn := assetLines(t, "WITHDRAWN", atBuild("schemas/WITHDRAWN"))

	installed := map[string]string{}
	var workflows []string
	for _, dir := range []string{"workflows", "schemas"} {
		entries, err := os.ReadDir(filepath.Join(b.dir, dir))
		if err != nil {
			t.Fatal(err)
		}
		for _, e := range entries {
			rel := dir + "/" + e.Name()
			if !e.Type().IsRegular() {
				t.Fatalf("payload %s is not a regular file", rel)
			}
			sum := sha256.Sum256(b.read(t, rel))
			installed[rel] = hex.EncodeToString(sum[:])
			if dir == "workflows" {
				workflows = append(workflows, e.Name())
			}
		}
	}
	slices.Sort(workflows)
	if strings.Join(workflows, " ") != "entry.v2.json explorer.v1.json" {
		t.Fatalf("the payload's workflows/ holds %v", workflows)
	}
	for rel, hash := range frozen {
		if installed[rel] != hash {
			t.Fatalf("FROZEN names %s at %s; the payload holds it at %q", rel, hash, installed[rel])
		}
	}
	for rel := range installed {
		if _, ok := frozen[rel]; !ok {
			t.Fatalf("the payload holds %s, which FROZEN at %s does not name", rel, h.FusionRevision)
		}
	}
	if len(withdrawn) == 0 {
		t.Fatalf("WITHDRAWN at %s names no asset", h.FusionRevision)
	}
	for rel := range withdrawn {
		if _, err := os.Stat(filepath.Join(b.dir, filepath.FromSlash(rel))); !errors.Is(err, fs.ErrNotExist) {
			t.Fatalf("the payload holds the withdrawn %s: %v", rel, err)
		}
	}

	host := fixture.NewHost()
	for _, retired := range []string{"fusion.repair.v1", "fusion.entry.v1"} {
		s, err := tryConnect(t, b, host, nil, []string{retired})
		var remote *api.RemoteError
		if !errors.As(err, &remote) || remote.Code != "unsupported-capability" {
			t.Fatalf("a handshake requiring %s returned %v", retired, err)
		}
		if s.client != nil {
			t.Fatalf("a connection opened requiring %s", retired)
		}
	}
	s, err := tryConnect(t, b, host, nil, []string{Capability, EntryCapability})
	if err != nil {
		t.Fatalf("a handshake requiring %s and %s: %v; module stderr: %q", Capability, EntryCapability, err, s.proc.stderr.String())
	}
	s.close()
}
