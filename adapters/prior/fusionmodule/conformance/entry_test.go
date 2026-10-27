package conformance

// The entry cases of plan step 18 (H7): fusion.entry.v1 driven against the
// process started from the extracted bundle (see host_test.go for what that
// is and is not), one supported entry per class, over the fake host of
// internal/fixture, which serves the three role services, the six services of
// Prior's answer 69 and the three entry services. The module calls none of
// the entry services; each role run is scripted and makes its class's calls
// inside the run, as Prior's model loop would: host.exec.v1 for plain,
// host.dispatch.v1 for dispatches, host.question.v1 for asks. The unit-level
// version over a fixture payload is internal/entry's (step 17); here the
// catalog, the profiles, the definition and both schemas are the installed
// payload's, and the entries driven must be supported on prior in it.

import (
	"encoding/json"
	"slices"
	"strings"
	"testing"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/fixture"
	"github.com/kai/prior/integrationbuild/fusionmodule/internal/steps"
	api "github.com/kai/prior/moduleapi/v1"
)

// EntryCapability is the third workflow the bundle advertises.
const EntryCapability = "fusion.entry.v1"

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

// entryDrives are help (plain), reconcile (dispatches) and memo (asks), the
// three step 17 proposed. Each script makes its class's call; the
// dispatches and asks runs also change the workspace, so their envelopes
// carry a commit, and the dispatched child changes a control record, which
// the workbench step reads in more than one page.
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

// entryEnvelope is the wire shape of schemas/entry-result.v1.json, decoded
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

// One entry per class runs through fusion.entry.v1 to a completed envelope
// against the process started from the built bundle, and each run made its
// class's service call.
func TestOneEntryPerClassRunsAgainstTheBuiltBundle(t *testing.T) {
	for _, d := range entryDrives() {
		t.Run(d.class+" "+d.id, func(t *testing.T) {
			b := openBundle(t)
			payload, err := steps.OpenBundle(b.dir)
			if err != nil {
				t.Fatalf("payload: %v", err)
			}
			catalog, err := steps.LoadCatalog(payload)
			if err != nil {
				t.Fatalf("catalog.json: %v", err)
			}
			// The entry is the installed catalog's, of the class this case
			// drives, supported on prior; the run's calls are within its
			// requires and include its class's call.
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
			validates(t, payload, "schemas/entry-result.v1.json", out)
			var env entryEnvelope
			if err := api.Decode(out, &env); err != nil {
				t.Fatalf("envelope %s: %v", out, err)
			}
			if env.Status != "completed" || env.Ending == nil || env.Ending.Class != "success" || env.Ending.Reason != "answered" || len(env.Violations) != 0 {
				t.Fatalf("envelope %s", out)
			}
			if stderr := s.proc.stderr.String(); stderr != "" {
				t.Fatalf("the module wrote to stderr during a clean session: %q", stderr)
			}

			// One role run, under the profile the entry names, forwarding the
			// bytes the host froze on every role call, with no audit
			// reference; the frozen input is the payload's request shape.
			if host.ModelCalls != 1 || host.CountSent(api.RoleRunCapability) != 1 {
				t.Fatalf("%d model calls, %d role runs sent", host.ModelCalls, host.CountSent(api.RoleRunCapability))
			}
			frozen := host.Composed(entryRunID)
			if frozen == nil {
				t.Fatal("the role input was never composed")
			}
			validates(t, payload, "schemas/entry-request.v1.json", frozen)
			for _, call := range host.Host.Calls {
				if string(call.Call.Input) != string(frozen) || call.Call.Profile != d.profile || call.Call.AuditRef != "" {
					t.Fatalf("role call %+v", call)
				}
			}

			// The module called none of the entry services; the run made
			// exactly the scripted calls, its class's among them, each under
			// the run as actor and the operation id Prior derives.
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
					checkDispatchInput(t, catalog, dispatch.Entry, dispatch.Input)
					if dispatch.Entry != want.Entry || dispatch.Description == "" || strings.ContainsAny(dispatch.Description, "\n") || string(dispatch.Input) != string(want.Input) {
						t.Fatalf("dispatch call %s, want entry %s and input %s", call.Input, want.Entry, want.Input)
					}
					t.Logf("dispatched %s with %s", dispatch.Entry, dispatch.Input)
				}
				if binding.Identity != b.identity || binding.WorkflowID != entryWorkflowID || binding.Actor != entryRunID || call.OperationID != api.EntryOperationID(call.Capability, entryWorkflowID, entryRunID, call.Slot) {
					t.Fatalf("entry call %+v", call)
				}
			}
			if strings.Join(made, " ") != strings.Join(scripted, " ") {
				t.Fatalf("the run made %v, the script %v", made, scripted)
			}

			effect := func(capability string) int {
				n := 0
				for key, count := range host.Effects {
					if strings.HasPrefix(key, capability+"/") {
						n += count
					}
				}
				return n
			}
			if effect(api.RoleComposeCapability) != 1 || effect(api.WorkspaceCapability) != 1 || effect(api.CaptureCapability) != 1 {
				t.Fatalf("effects %v", host.Effects)
			}
			switch d.class {
			case "plain":
				// help changes nothing: captured, never integrated.
				if len(env.Commits) != 0 || len(env.Questions) != 0 || effect(api.IntegrateCapability) != 0 || effect(api.SnapshotCapability) != 0 || effect(api.WorkbenchCapability) != 0 {
					t.Fatalf("envelope %s, effects %v", out, host.Effects)
				}
			case "dispatches":
				// The child changed a control record: integrated, snapshotted,
				// and the record read in more than one page.
				if len(env.Questions) != 0 || len(env.Commits) != 1 || env.Commits[0].Reference != fixture.UserReference || strings.Join(env.Commits[0].Changes, ",") != fixture.WorkbenchPrefix+entryPackageRecord {
					t.Fatalf("envelope %s", out)
				}
				if effect(api.IntegrateCapability) != 1 || effect(api.SnapshotCapability) != 1 || host.Effects[api.WorkbenchCapability+"/record:"+entryPackageRecord] != 1 {
					t.Fatalf("effects %v", host.Effects)
				}
				pages := 0
				for _, call := range host.Calls {
					if strings.HasPrefix(call.Slot, "page:") {
						pages++
					}
				}
				if pages < 2 {
					t.Fatalf("the record was read in %d page calls", pages)
				}
			case "asks":
				// The question and its answer are copied into the envelope; the
				// memo is integrated, and no control record is read.
				q := env.Questions
				if len(q) != 1 || q[0].CallID != "q-1" || q[0].Question != "Note or task?" || q[0].Channel != api.QuestionChannelAskUser || q[0].Outcome != "answered" || strings.Join(q[0].Options, ",") != "note,task" || strings.Join(q[0].Selected, ",") != "note" {
					t.Fatalf("questions in %s", out)
				}
				if len(env.Commits) != 1 || strings.Join(env.Commits[0].Changes, ",") != entryMemoPath || effect(api.IntegrateCapability) != 1 || effect(api.WorkbenchCapability) != 0 {
					t.Fatalf("envelope %s, effects %v", out, host.Effects)
				}
			}
		})
	}
}
