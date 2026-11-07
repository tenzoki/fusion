package entry

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/fixture"
	"github.com/kai/prior/integrationbuild/fusionmodule/internal/hostsvc"
	"github.com/kai/prior/integrationbuild/fusionmodule/internal/steps"
	api "github.com/kai/prior/moduleapi/v1"
)

// These are unit tests of the entry workflow over the fake durable host of
// internal/fixture, in-process, over a fixture payload in which help,
// reconcile and memo are supported on prior: one entry per class, plain,
// dispatches and asks. Each role run is scripted and makes its class's
// entry service calls inside the run, as Prior's model loop would; the
// module makes none of them. The fake integrates by the step-17 model: the
// run's commits as made and its uncommitted paths as the delta. They prove
// the interpreter's step order, its composition, its routing, its receipt
// checks and its restart behaviour, not the installed process: the
// conformance suite drives a built bundle.

const (
	workflowID = "wf-entry"
	runID      = "run-entry"
)

// supported are the entries the fixture payload supports on prior.
var supported = []string{"help", "reconcile", "memo"}

// entryCase is one entry the tests drive, with its scripted run.
type entryCase struct {
	name, id, kind, profile, class string
	arguments                      []map[string]string
	script                         fixture.Script
	pageBytes                      int
}

const (
	packageRecord = "work-packages/261023-1846-prior-full-surface-handover-h1-to-h9/package.json"
	memoPath      = "fusion-workbench/shared/memos/notes-kai.md"
)

func help() entryCase {
	return entryCase{name: "help", id: "help", kind: "skill", profile: "skill-help", class: "plain",
		arguments: []map[string]string{{"name": "topic", "value": "daily"}},
		script: fixture.Script{Calls: []fixture.ScriptCall{
			{Capability: api.ExecCapability, CallID: "x-1", Argv: []string{"bin/fusion-workbench-root"}},
		}}}
}

func reconcile() entryCase {
	return entryCase{name: "reconcile", id: "reconcile", kind: "skill", profile: "skill-reconcile", class: "dispatches",
		arguments: []map[string]string{{"name": "--force", "value": ""}},
		script: fixture.Script{Calls: []fixture.ScriptCall{
			{Capability: api.ExecCapability, CallID: "x-1", Argv: []string{"bin/fusion-work-order"}},
			{Capability: api.DispatchCapability, CallID: "d-1", Entry: "state-auditor", Writes: []string{fixture.WorkbenchPrefix + packageRecord}},
		}},
		pageBytes: 40}
}

func memo() entryCase {
	return entryCase{name: "memo", id: "memo", kind: "skill", profile: "skill-memo", class: "asks",
		arguments: []map[string]string{{"name": "content", "value": "buy milk"}},
		script: fixture.Script{Calls: []fixture.ScriptCall{
			{Capability: api.QuestionCapability, CallID: "q-1", Question: "Note or task?", Options: []string{"note", "task"}, Channel: api.QuestionChannelAskUser, Answer: api.QuestionResult{Outcome: api.QuestionAnswered, Selected: []string{"note"}}},
			{Capability: api.ExecCapability, CallID: "x-1", Argv: []string{"bin/fusion-memo", "note", "buy milk"}, Writes: []string{memoPath}},
		}}}
}

// twoCommits is help driven by a script whose first command commits twice,
// the second commit taking a control record, and whose second command leaves
// a path uncommitted: delivery case (i).
func twoCommits() entryCase {
	c := help()
	c.name = "two commits"
	c.script = fixture.Script{Calls: []fixture.ScriptCall{
		{Capability: api.ExecCapability, CallID: "x-1", Argv: []string{"make", "fix"}, Writes: []string{"pkg/a/a.go", fixture.WorkbenchPrefix + packageRecord},
			Commits: []fixture.ScriptCommit{{Subject: "Fix the failing test in pkg/a", Paths: []string{"pkg/a/a.go"}}, {Subject: "Record the fix in the package", Paths: []string{fixture.WorkbenchPrefix + packageRecord}}}},
		{Capability: api.ExecCapability, CallID: "x-2", Argv: []string{"make", "notes"}, Writes: []string{"docs/notes.md"}},
	}}
	return c
}

type harness struct {
	t       *testing.T
	c       entryCase
	def     *Definition
	host    *fixture.EntryHost
	handler api.WorkflowHandler
}

func definition(t *testing.T) *Definition {
	t.Helper()
	bundle, err := steps.OpenBundle(fixture.EntryBundle(t, fixture.CatalogDir(t), supported...))
	if err != nil {
		t.Fatal(err)
	}
	def, err := Load(bundle)
	if err != nil {
		t.Fatal(err)
	}
	return def
}

func load(t *testing.T, c entryCase) *harness {
	t.Helper()
	def := definition(t)
	host := fixture.NewEntryHost(workflowID, runID, c.profile)
	host.Scripts[c.profile] = c.script
	host.PageBytes = c.pageBytes
	roles := func(h api.HostCaller) steps.RoleClient { return api.RemoteRoles{Host: h, Identity: fixture.Identity} }
	return &harness{t: t, c: c, def: def, host: host, handler: def.Handler(fixture.Identity, roles)}
}

func (h *harness) input(auditRef string) json.RawMessage {
	obj := map[string]any{
		"workflow_id":     workflowID,
		"run_id":          runID,
		"entry":           map[string]string{"id": h.c.id, "kind": h.c.kind, "profile": h.c.profile},
		"arguments":       h.c.arguments,
		"project_context": map[string]any{"instructions": []any{}},
	}
	if auditRef != "" {
		obj["audit_ref"] = auditRef
	}
	body, err := json.Marshal(obj)
	if err != nil {
		h.t.Fatal(err)
	}
	return body
}

func (h *harness) raw(caller api.HostCaller, operation string, input json.RawMessage) (json.RawMessage, error) {
	h.t.Helper()
	return h.handler(context.Background(), api.Invocation{OperationID: operation, Capability: h.def.Capability, Input: input}, caller)
}

func (h *harness) invoke(operation string, input json.RawMessage) Envelope {
	h.t.Helper()
	return h.invokeWith(h.host.Caller(), operation, input)
}

func (h *harness) invokeWith(caller api.HostCaller, operation string, input json.RawMessage) Envelope {
	h.t.Helper()
	out, err := h.raw(caller, operation, input)
	if err != nil {
		h.t.Fatalf("invoke: %v", err)
	}
	return decode(h.t, out)
}

func decode(t *testing.T, out json.RawMessage) Envelope {
	t.Helper()
	var env Envelope
	if err := api.Decode(out, &env); err != nil {
		t.Fatalf("envelope %s: %v", out, err)
	}
	return env
}

func code(env Envelope) string {
	if len(env.Violations) == 0 {
		return ""
	}
	return env.Violations[0].Code
}

func (h *harness) effect(capability string) int {
	n := 0
	for key, count := range h.host.Effects {
		if strings.HasPrefix(key, capability+"/") {
			n += count
		}
	}
	return n
}

const integrate = hostsvc.EntryIntegrateCapability

func TestLoadReadsTheDefinition(t *testing.T) {
	def := definition(t)
	if def.Capability != "fusion.entry.v2" || def.request == nil || def.roleInput == nil || def.result == nil || def.envelope == nil {
		t.Fatalf("definition %+v", def)
	}
	for _, id := range supported {
		if def.entries[id].Support["prior"] != "supported" {
			t.Fatalf("%s: %+v", id, def.entries[id])
		}
	}
	// Every catalog entry is resolved, supported or not: an unsupported one
	// is refused per invocation, by name.
	bundle, err := steps.OpenBundle(fixture.Bundle(t, fixture.CatalogDir(t)))
	if err != nil {
		t.Fatal(err)
	}
	live, err := Load(bundle)
	if err != nil {
		t.Fatalf("the live catalog: %v", err)
	}
	catalog, err := steps.LoadCatalog(bundle)
	if err != nil {
		t.Fatal(err)
	}
	if len(live.entries) != len(catalog.Entries()) {
		t.Fatalf("%d entries resolved of %d", len(live.entries), len(catalog.Entries()))
	}
}

// loadEdited loads the fixture payload with workflows/entry.v2.json edited.
func loadEdited(t *testing.T, edit func(w map[string]any)) error {
	t.Helper()
	root := fixture.EntryBundle(t, fixture.CatalogDir(t), supported...)
	path := filepath.Join(root, filepath.FromSlash(WorkflowAsset))
	body, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	var w map[string]any
	if err := json.Unmarshal(body, &w); err != nil {
		t.Fatal(err)
	}
	edit(w)
	if body, err = json.Marshal(w); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, body, 0o644); err != nil {
		t.Fatal(err)
	}
	bundle, err := steps.OpenBundle(root)
	if err != nil {
		t.Fatal(err)
	}
	_, err = Load(bundle)
	return err
}

func step(w map[string]any, i int) map[string]any { return w["steps"].([]any)[i].(map[string]any) }

func member(w map[string]any, i int, part string) map[string]any {
	return step(w, i)[part].(map[string]any)
}

// One row per refusal Load makes: each edit breaks exactly one check, so a
// row loads when its check is removed and the test turns red.
func TestLoadRefusesEveryOtherShape(t *testing.T) {
	if err := loadEdited(t, func(map[string]any) {}); err != nil {
		t.Fatalf("the unedited definition: %v", err)
	}
	rows := []struct {
		name string
		edit func(w map[string]any)
		want error
	}{
		{"a step fewer", func(w map[string]any) { w["steps"] = w["steps"].([]any)[:4] }, ErrDefinition},
		{"integrate on host.integrate.v1", func(w map[string]any) { step(w, 3)["host_service"] = api.IntegrateCapability }, ErrDefinition},
		{"a step renamed", func(w map[string]any) { step(w, 4)["id"] = "observe" }, ErrDefinition},
		{"a step with a role", func(w map[string]any) { delete(step(w, 0), "host_service"); step(w, 0)["role"] = "explorer" }, ErrDefinition},
		{"revise_bound 1", func(w map[string]any) { w["revise_bound"] = 1 }, ErrDefinition},
		{"requires nine", func(w map[string]any) {
			var kept []any
			for _, s := range w["requires"].([]any) {
				if s != integrate {
					kept = append(kept, s)
				}
			}
			w["requires"] = kept
		}, ErrDefinition},
		{"requires eleven", func(w map[string]any) { w["requires"] = append(w["requires"].([]any), api.CaptureCapability) }, ErrDefinition},
		{"compose without an invocation schema", func(w map[string]any) { delete(member(w, 0, "input_from"), "invocation_schema") }, ErrDefinition},
		{"compose under another slot", func(w map[string]any) { member(w, 0, "input_from")["slot"] = "profile" }, ErrDefinition},
		{"run fixing its role", func(w map[string]any) { member(w, 2, "input_from")["role"] = "" }, ErrDefinition},
		{"run without a run", func(w map[string]any) { delete(member(w, 2, "input_from"), "run") }, ErrDefinition},
		{"run without a role input schema", func(w map[string]any) { delete(member(w, 2, "input_from"), "role_input_schema") }, ErrDefinition},
		{"run not forwarded verbatim", func(w map[string]any) { member(w, 2, "input_from")["forwarded"] = "rebuilt" }, ErrDefinition},
		{"run recovering under another reference", func(w map[string]any) { member(w, 2, "input_from")["recovery_ref"] = "run_id" }, ErrDefinition},
		{"run step not an object", func(w map[string]any) { step(w, 2)["completion"] = []any{"settled"} }, ErrDefinition},
		{"run completing answered", func(w map[string]any) { member(w, 2, "completion")["role_state"] = "answered" }, ErrDefinition},
		{"run without a result schema", func(w map[string]any) { delete(member(w, 2, "completion"), "result_schema") }, ErrDefinition},
		{"success not integrated", func(w map[string]any) {
			member(w, 2, "completion")["on_ending"].(map[string]any)["success"] = "workbench"
		}, ErrDefinition},
		{"stop not integrated", func(w map[string]any) { member(w, 2, "completion")["on_ending"].(map[string]any)["stop"] = "end" }, ErrDefinition},
		{"refusal integrated", func(w map[string]any) {
			member(w, 2, "completion")["on_ending"].(map[string]any)["refusal"] = "integrate"
		}, ErrDefinition},
		{"integrate under another slot", func(w map[string]any) { member(w, 3, "input_from")["slot"] = "post-integration" }, ErrDefinition},
		{"workbench under another slot", func(w map[string]any) { member(w, 4, "input_from")["slot"] = "record" }, ErrDefinition},
		{"workbench without an envelope schema", func(w map[string]any) { delete(member(w, 4, "completion"), "envelope_schema") }, ErrDefinition},
		{"a schema the payload does not carry", func(w map[string]any) { member(w, 2, "completion")["result_schema"] = "schemas/entry-result.v9.json" }, steps.ErrBundle},
	}
	for _, row := range rows {
		t.Run(row.name, func(t *testing.T) {
			if err := loadEdited(t, row.edit); !errors.Is(err, row.want) {
				t.Fatalf("loaded: %v, want %v", err, row.want)
			}
		})
	}
}

// An entry supported on prior whose profile the payload does not carry is a
// refused payload, not a refusal at run time.
func TestLoadRefusesASupportedEntryWithoutItsProfile(t *testing.T) {
	root := fixture.EntryBundle(t, fixture.CatalogDir(t), "help")
	path := filepath.Join(root, "module.json")
	body, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	var manifest map[string]any
	if err := json.Unmarshal(body, &manifest); err != nil {
		t.Fatal(err)
	}
	var data []any
	for _, p := range manifest["data"].([]any) {
		if !strings.HasPrefix(p.(string), "profiles/skill-help.") {
			data = append(data, p)
		}
	}
	manifest["data"] = data
	body, _ = json.Marshal(manifest)
	if err := os.WriteFile(path, body, 0o644); err != nil {
		t.Fatal(err)
	}
	bundle, err := steps.OpenBundle(root)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := Load(bundle); !errors.Is(err, steps.ErrBundle) {
		t.Fatalf("loaded without skill-help's profile: %v", err)
	}
}

// The common checks of every run that reaches its end: one model call, the
// module calling none of the entry services, the run's calls each under the
// run as actor, every role call forwarding the frozen bytes with no audit
// reference, and one integration.
func (h *harness) checkRun(env Envelope) {
	t := h.t
	t.Helper()
	if h.host.ModelCalls != 1 {
		t.Fatalf("%d model calls", h.host.ModelCalls)
	}
	for _, capability := range fixture.EntryCapabilities {
		if n := h.host.CountSent(capability); n != 0 {
			t.Fatalf("the module called %s %d times", capability, n)
		}
	}
	var made, want []string
	for _, call := range h.host.EntryCalls() {
		made = append(made, call.Capability)
		var binding struct{ Actor, WorkflowID string }
		mustDecode(t, call.Input, &binding)
		if binding.Actor != runID || call.OperationID != api.EntryOperationID(call.Capability, workflowID, runID, call.Slot) {
			t.Fatalf("entry call %+v", call)
		}
	}
	for _, step := range h.c.script.Calls {
		want = append(want, step.Capability)
	}
	if strings.Join(made, " ") != strings.Join(want, " ") {
		t.Fatalf("entry calls %v, want %v", made, want)
	}
	for _, call := range h.host.Host.Calls {
		if string(call.Call.Input) != string(h.host.Composed(runID)) || call.Call.Profile != h.c.profile || call.Call.AuditRef != "" {
			t.Fatalf("role call %+v", call)
		}
	}
	var input struct {
		WorkflowID string `json:"workflow_id"`
		RunID      string `json:"run_id"`
		Entry      entryRef
		Arguments  []argument
	}
	mustDecode(t, h.host.Composed(runID), &input)
	if input.WorkflowID != workflowID || input.RunID != runID || input.Entry != (entryRef{h.c.id, h.c.kind, h.c.profile}) || len(input.Arguments) != len(h.c.arguments) {
		t.Fatalf("role input %s", h.host.Composed(runID))
	}
	if h.effect(integrate) != 1 || h.host.CountSent(api.CaptureCapability)+h.host.CountSent(api.IntegrateCapability)+h.host.CountSent(api.SnapshotCapability) != 0 {
		t.Fatalf("effects %v, sent %v", h.host.Effects, h.host.Sent)
	}
}

// One entry per class runs to a completed envelope against the fake host:
// help changes nothing and its integration is empty, reconcile dispatches a
// child that changes a control record which the workbench step reads, memo
// asks a question and leaves a memo uncommitted (delivery case (ii), which
// the v1 module refused for want of a commit).
func TestOneEntryPerClassRunsAgainstTheFakeHost(t *testing.T) {
	for _, c := range []entryCase{help(), reconcile(), memo()} {
		t.Run(c.class+" "+c.id, func(t *testing.T) {
			h := load(t, c)
			env := h.invoke("op-1", h.input(""))
			if env.Status != "completed" || env.Ending == nil || *env.Ending != (Ending{"success", "answered"}) || len(env.Violations) != 0 || len(env.Commits) != 0 {
				t.Fatalf("envelope %+v", env)
			}
			h.checkRun(env)
			switch c.id {
			case "help":
				if len(env.Delta) != 0 || len(env.Questions) != 0 || h.effect(api.WorkbenchCapability) != 0 {
					t.Fatalf("envelope %+v, effects %v", env, h.host.Effects)
				}
			case "reconcile":
				if strings.Join(env.Delta, ",") != "M\t"+fixture.WorkbenchPrefix+packageRecord {
					t.Fatalf("delta %q", env.Delta)
				}
				if h.host.Effects[api.WorkbenchCapability+"/record:"+packageRecord] != 1 {
					t.Fatalf("the control record was not read: %v", h.host.Effects)
				}
				pages := 0
				for _, call := range h.host.Calls {
					if strings.HasPrefix(call.Slot, "page:") {
						pages++
					}
				}
				if pages < 2 {
					t.Fatalf("%d page calls", pages)
				}
			case "memo":
				var q struct {
					CallID   string `json:"call_id"`
					Outcome  string
					Selected []string
				}
				if len(env.Questions) != 1 || json.Unmarshal(env.Questions[0], &q) != nil || q.CallID != "q-1" || q.Outcome != "answered" || strings.Join(q.Selected, ",") != "note" {
					t.Fatalf("questions %s", env.Questions)
				}
				if strings.Join(env.Delta, ",") != "M\t"+memoPath || h.effect(api.WorkbenchCapability) != 0 {
					t.Fatalf("delta %q, effects %v", env.Delta, h.host.Effects)
				}
			}
		})
	}
}

func mustDecode(t *testing.T, body []byte, target any) {
	t.Helper()
	if err := json.Unmarshal(body, target); err != nil {
		t.Fatalf("%s: %v", body, err)
	}
}

// Delivery case (i): a run that commits twice and leaves a path uncommitted
// carries both commits in order, each with its own subject, the user's
// branch and its changes, and the path in delta; the control record the
// second commit changed is read.
func TestARunsCommitsAndItsDeltaReachTheEnvelope(t *testing.T) {
	h := load(t, twoCommits())
	env := h.invoke("op-1", h.input(""))
	if env.Status != "completed" || len(env.Violations) != 0 {
		t.Fatalf("envelope %+v", env)
	}
	h.checkRun(env)
	if len(env.Commits) != 2 {
		t.Fatalf("commits %+v", env.Commits)
	}
	for i, want := range []struct{ subject, change string }{{"Fix the failing test in pkg/a", "M\tpkg/a/a.go"}, {"Record the fix in the package", "M\t" + fixture.WorkbenchPrefix + packageRecord}} {
		c := env.Commits[i]
		if c.Subject != want.subject || c.Reference != fixture.UserReference || strings.Join(c.Changes, ",") != want.change || len(c.Commit) != 40 {
			t.Fatalf("commit %d %+v", i, c)
		}
	}
	if env.Commits[0].Commit == env.Commits[1].Commit {
		t.Fatalf("one commit twice: %+v", env.Commits)
	}
	if strings.Join(env.Delta, ",") != "M\tdocs/notes.md" {
		t.Fatalf("delta %q", env.Delta)
	}
	if h.host.Effects[api.WorkbenchCapability+"/record:"+packageRecord] != 1 {
		t.Fatalf("the committed control record was not read: %v", h.host.Effects)
	}
}

// Delivery case (iii): the host refuses the integration with a conflict, a
// path changed in the user's tree during the run. Nothing is integrated, so
// commits and delta are empty and no record is read.
func TestAConflictRefusesTheIntegrationAndWritesNothing(t *testing.T) {
	h := load(t, twoCommits())
	h.host.Refuse[integrate+"/"+hostsvc.IntegrationSlot] = "conflict"
	env := h.invoke("op-1", h.input(""))
	if env.Status != "refused" || code(env) != "integration.refused" || !strings.Contains(env.Violations[0].Detail, "conflict") || env.Ending == nil || env.Ending.Reason != "integration-refused" {
		t.Fatalf("envelope %+v", env)
	}
	if len(env.Commits) != 0 || len(env.Delta) != 0 || h.host.CountSent(api.WorkbenchCapability) != 0 {
		t.Fatalf("envelope %+v, sent %v", env, h.host.Sent)
	}
}

// killing passes every call to the host and, after the host has answered
// the call at index at (counting from 0), loses the reply: the process dies
// with the host's effect persisted and unseen.
type killing struct {
	base api.HostCaller
	at   int
	n    int
}

func (k *killing) CallHost(ctx context.Context, inv api.Invocation) (json.RawMessage, error) {
	out, err := k.base.CallHost(ctx, inv)
	k.n++
	if k.n == k.at+1 {
		return nil, api.ErrOutcomeUnknown
	}
	return out, err
}

// A kill after each persisted boundary, and a resume under a fresh outer
// operation, reproduce the envelope of an uninterrupted invocation with no
// further role run and no second effect. A boundary is every call the module
// sends except a role read, which persists nothing: each compose, workspace,
// run, completion, integration, read and page.
func TestAKillAfterEachPersistedBoundaryResumesToTheSameEnvelope(t *testing.T) {
	for _, c := range []entryCase{help(), reconcile(), memo(), twoCommits()} {
		t.Run(c.name, func(t *testing.T) {
			reference := load(t, c)
			want, err := reference.raw(reference.host.Caller(), "op-1", reference.input(""))
			if err != nil {
				t.Fatal(err)
			}
			var boundaries []int
			for i, capability := range reference.host.Sent {
				if capability != api.RoleReadCapability {
					boundaries = append(boundaries, i)
				}
			}
			if len(boundaries) < 5 || reference.host.CountSent(integrate) != 1 {
				t.Fatalf("boundaries %v of %v", boundaries, reference.host.Sent)
			}
			var named []string
			for _, at := range boundaries {
				named = append(named, reference.host.Sent[at])
			}
			t.Logf("%d boundaries: %s", len(boundaries), strings.Join(named, " "))
			for _, at := range boundaries {
				h := load(t, c)
				if _, err := h.raw(&killing{base: h.host.Caller(), at: at}, "op-1", h.input("")); !errors.Is(err, api.ErrOutcomeUnknown) {
					t.Fatalf("kill after %s (call %d): %v", reference.host.Sent[at], at, err)
				}
				got, err := h.raw(h.host.Caller(), "op-2", h.input(""))
				if err != nil {
					t.Fatalf("resume after %s (call %d): %v", reference.host.Sent[at], at, err)
				}
				if string(got) != string(want) {
					t.Fatalf("resume after %s (call %d):\n%s\nwant\n%s", reference.host.Sent[at], at, got, want)
				}
				if h.host.ModelCalls != 1 {
					t.Fatalf("resume after %s (call %d): %d model calls", reference.host.Sent[at], at, h.host.ModelCalls)
				}
				if len(h.host.Effects) != len(reference.host.Effects) {
					t.Fatalf("resume after %s: effects %v, want %v", reference.host.Sent[at], h.host.Effects, reference.host.Effects)
				}
				for key, n := range reference.host.Effects {
					if h.host.Effects[key] != n {
						t.Fatalf("resume after %s: effect %s ran %d times, want %d", reference.host.Sent[at], key, h.host.Effects[key], n)
					}
				}
				if len(h.host.EntryCalls()) != len(c.script.Calls) {
					t.Fatalf("resume after %s: the run's service calls were made again", reference.host.Sent[at])
				}
			}
		})
	}
}

// A run left answered by a lost reply settles on the resume under the
// invocation's audit reference, on its completion alone, with no second
// model call; without the reference the host keeps it answered.
func TestALostRunReplyCompletesUnderTheAuditReference(t *testing.T) {
	h := load(t, memo())
	h.host.RequireAudit, h.host.RequireAuditRun = "audit:recovery-1", runID
	// The calls run compose, workspace, the first read, then the run: the
	// fourth call's reply is lost.
	if _, err := h.raw(&killing{base: h.host.Caller(), at: 3}, "op-1", h.input("")); !errors.Is(err, api.ErrOutcomeUnknown) {
		t.Fatalf("the lost reply was answered: %v", err)
	}
	if r := h.host.Runs[runID]; r == nil || r.State != "answered" {
		t.Fatalf("run %+v", h.host.Runs[runID])
	}
	env := h.invoke("op-2", h.input(""))
	if env.Status != "recovery-required" || code(env) != "host.recovery-required" || env.Ending != nil {
		t.Fatalf("without the reference: %+v", env)
	}
	env = h.invoke("op-3", h.input("audit:recovery-1"))
	if env.Status != "completed" || h.host.ModelCalls != 1 {
		t.Fatalf("with the reference: %+v, %d model calls", env, h.host.ModelCalls)
	}
	var audited []string
	for _, call := range h.host.Host.Calls {
		if call.Call.AuditRef != "" {
			audited = append(audited, call.Capability+"="+call.Call.AuditRef)
		}
	}
	if strings.Join(audited, " ") != "host.role.complete.v1=audit:recovery-1" {
		t.Fatalf("audit references sent: %v", audited)
	}
}

func TestAnAcceptedRunIsRecoveryRequiredAndNeverRerun(t *testing.T) {
	h := load(t, memo())
	// A first process composed and provisioned, then died at its first read.
	if _, err := h.raw(&killing{base: h.host.Caller(), at: 2}, "op-1", h.input("")); !errors.Is(err, api.ErrOutcomeUnknown) {
		t.Fatal(err)
	}
	h.host.SeedRole(runID, "skill-memo", "accepted", h.host.Composed(runID), nil)
	calls := len(h.host.Host.Calls)
	env := h.invoke("op-2", h.input(""))
	if env.Status != "recovery-required" || code(env) != "role.accepted" || env.Ending != nil || h.host.ModelCalls != 0 {
		t.Fatalf("envelope %+v", env)
	}
	for _, call := range h.host.Host.Calls[calls:] {
		if call.Capability != api.RoleReadCapability {
			t.Fatalf("the accepted run was acted on: %+v", call)
		}
	}
}

// A question answered ended stops the run before it changed anything: the
// envelope is ended with the run's stop and its question, and the
// integration it is still given is empty.
func TestAQuestionAnsweredEndedEndsTheRun(t *testing.T) {
	c := memo()
	c.script.Calls[0].Answer = api.QuestionResult{Outcome: api.QuestionEnded}
	h := load(t, c)
	env := h.invoke("op-1", h.input(""))
	if env.Status != "ended" || env.Ending == nil || *env.Ending != (Ending{"stop", "ended-by-question"}) || len(env.Questions) != 1 || len(env.Commits) != 0 || len(env.Delta) != 0 {
		t.Fatalf("envelope %+v", env)
	}
	if h.effect(integrate) != 1 || len(h.host.EntryCalls()) != 1 {
		t.Fatalf("effects %v, entry calls %d", h.host.Effects, len(h.host.EntryCalls()))
	}
}

// A stopped run that changed the workspace is integrated, as Claude Code
// keeps a stopped session's files, and the envelope stays ended with the
// delta.
func TestAStoppedRunThatChangedTheWorkspaceIsIntegrated(t *testing.T) {
	c := memo()
	c.script.Calls = []fixture.ScriptCall{c.script.Calls[1], c.script.Calls[0]}
	c.script.Calls[1].Answer = api.QuestionResult{Outcome: api.QuestionEnded}
	h := load(t, c)
	env := h.invoke("op-1", h.input(""))
	if env.Status != "ended" || strings.Join(env.Delta, ",") != "M\t"+memoPath || h.effect(integrate) != 1 {
		t.Fatalf("envelope %+v, effects %v", env, h.host.Effects)
	}
}

func TestARunThatRefusesEndsRefusedWithoutIntegration(t *testing.T) {
	c := help()
	c.script.Refuse = "nothing-to-explain"
	h := load(t, c)
	env := h.invoke("op-1", h.input(""))
	if env.Status != "refused" || env.Ending == nil || *env.Ending != (Ending{"refusal", "nothing-to-explain"}) || code(env) != "nothing-to-explain" {
		t.Fatalf("envelope %+v", env)
	}
	if h.host.CountSent(integrate) != 0 {
		t.Fatal("a refused run was integrated")
	}
}

// answering replaces the profile's model with a fixed answer.
func (h *harness) answering(body string) {
	h.host.Models[h.c.profile] = func(string, json.RawMessage) json.RawMessage { return json.RawMessage(body) }
}

// The rule the result schema cannot state: an option selected is among the
// question's options.
func TestASelectedOptionOutsideItsOptionsIsRefused(t *testing.T) {
	h := load(t, memo())
	h.answering(`{"status":"completed","ending":{"class":"success","reason":"answered"},"questions":[{"call_id":"q-1","question":"Note or task?","options":["note","task"],"channel":"ask-user-question","outcome":"answered","selected":["maybe"],"text":""}],"commits":[],"delta":[],"violations":[]}`)
	env := h.invoke("op-1", h.input(""))
	if env.Status != "refused" || code(env) != "result.invalid" || env.Ending.Reason != "result-invalid" || h.host.CountSent(integrate) != 0 {
		t.Fatalf("envelope %+v", env)
	}
}

func TestASchemaInvalidAnswerIsRefused(t *testing.T) {
	h := load(t, help())
	h.answering(`{"status":"completed","ending":{"class":"refusal","reason":"x"},"questions":[],"commits":[],"delta":[],"violations":[]}`)
	env := h.invoke("op-1", h.input(""))
	if env.Status != "refused" || code(env) != "result.invalid" || h.host.CountSent(integrate) != 0 {
		t.Fatalf("envelope %+v", env)
	}
}

// M1: a settled answer of status recovery-required, which the schema admits
// (row er-recovery-required), is no recovery the host could ever resolve: the
// run is settled and every resume would observe it so. It is refused, and
// nothing is integrated.
func TestASettledAnswerOfStatusRecoveryRequiredIsRefused(t *testing.T) {
	h := load(t, memo())
	h.answering(`{"status":"recovery-required","ending":null,"questions":[],"commits":[],"delta":[],"violations":[{"code":"x","detail":""}]}`)
	env := h.invoke("op-1", h.input(""))
	if env.Status != "refused" || code(env) != "result.invalid" || env.Ending == nil || env.Ending.Class != "refusal" || h.host.CountSent(integrate) != 0 {
		t.Fatalf("envelope %+v, sent %v", env, h.host.Sent)
	}
	// A resume observes the settled run and answers the same refusal.
	if again := h.invoke("op-2", h.input("")); again.Status != "refused" || code(again) != "result.invalid" || h.host.ModelCalls != 1 {
		t.Fatalf("resume %+v", again)
	}
}

func TestEntriesThatCannotRunAreRefusedBeforeAnyHostCall(t *testing.T) {
	h := load(t, memo())
	valid := string(h.input(""))
	entry := `"entry":{"id":"memo","kind":"skill","profile":"skill-memo"}`
	cases := map[string]struct {
		input, code string
	}{
		"unknown entry":           {strings.Replace(valid, entry, `"entry":{"id":"nope","kind":"skill","profile":"skill-nope"}`, 1), "entry.unknown"},
		"kind not the entry's":    {strings.Replace(valid, entry, `"entry":{"id":"memo","kind":"agent","profile":"skill-memo"}`, 1), "entry.invalid"},
		"profile not the entry's": {strings.Replace(valid, entry, `"entry":{"id":"memo","kind":"skill","profile":"skill-help"}`, 1), "entry.invalid"},
		"unsupported on prior":    {strings.Replace(valid, entry, `"entry":{"id":"cleanup","kind":"skill","profile":"skill-cleanup"}`, 1), "entry.unsupported"},
		"migrate on prior":        {strings.Replace(valid, entry, `"entry":{"id":"migrate","kind":"skill","profile":"skill-migrate"}`, 1), "entry.unsupported"},
		"no workflow_id":          {strings.Replace(valid, `,"workflow_id":"wf-entry"`, ``, 1), "invocation.invalid"},
		"unknown member":          {strings.Replace(valid, `"run_id"`, `"mode":"x","run_id"`, 1), "invocation.invalid"},
		"empty audit_ref":         {strings.Replace(valid, `"run_id"`, `"audit_ref":"","run_id"`, 1), "invocation.invalid"},
		"duplicate key":           {strings.Replace(valid, `"run_id"`, `"run_id":"a","run_id"`, 1), "invocation.invalid"},
		"not an object":           {`[]`, "invocation.invalid"},
	}
	for name, tc := range cases {
		env := h.invoke("op", json.RawMessage(tc.input))
		if env.Status != "refused" || code(env) != tc.code || env.Ending == nil || env.Ending.Class != "refusal" || env.Ending.Reason != strings.ReplaceAll(tc.code, ".", "-") {
			t.Errorf("%s: %+v", name, env)
		}
	}
	// The refusal names the entry, so a user is told which one this host holds back.
	if env := h.invoke("op", json.RawMessage(cases["migrate on prior"].input)); len(env.Violations) != 1 || env.Violations[0].Detail != "migrate is unsupported on prior" {
		t.Errorf("migrate is not refused by name: %+v", env)
	}
	for _, capability := range []string{"fusion.other.v1", "fusion.entry.v1"} {
		out, err := h.handler(context.Background(), api.Invocation{OperationID: "op", Capability: capability, Input: h.input("")}, h.host.Caller())
		if err != nil || !strings.Contains(string(out), `"invocation.capability"`) {
			t.Errorf("%s: %s %v", capability, out, err)
		}
	}
	if len(h.host.Sent) != 0 {
		t.Fatalf("a refused invocation reached the host: %v", h.host.Sent)
	}
}

func TestHostRefusalsRefuseTheInvocation(t *testing.T) {
	cases := []struct {
		c     entryCase
		key   string
		code  string
		delta int
	}{
		{reconcile(), api.WorkbenchCapability + "/record:" + packageRecord, "record-conflict", 1},
		{help(), api.WorkspaceCapability + "/" + runID, "invalid-request", 0},
		{help(), api.RoleComposeCapability + "/" + runID, "permission-denied", 0},
	}
	for _, tc := range cases {
		t.Run(tc.key+" "+tc.code, func(t *testing.T) {
			h := load(t, tc.c)
			h.host.Refuse[tc.key] = tc.code
			env := h.invoke("op-1", h.input(""))
			if env.Status != "refused" || code(env) != "host."+tc.code || env.Ending == nil || env.Ending.Reason != "host-"+tc.code || len(env.Delta) != tc.delta {
				t.Fatalf("envelope %+v", env)
			}
		})
	}
	// An integration whose effect is uncertain is recovery-required with
	// nothing integrated; a read whose effect is uncertain keeps the
	// integration, which stands.
	for _, tc := range []struct {
		c     entryCase
		key   string
		delta int
	}{
		{memo(), integrate + "/" + hostsvc.IntegrationSlot, 0},
		{reconcile(), api.WorkbenchCapability + "/record:" + packageRecord, 1},
	} {
		h := load(t, tc.c)
		h.host.Recover[tc.key] = true
		env := h.invoke("op-1", h.input(""))
		if env.Status != "recovery-required" || env.Ending != nil || code(env) != "host.recovery-required" || len(env.Delta) != tc.delta || len(env.Questions) != countQuestions(tc.c) {
			t.Fatalf("%s: envelope %+v", tc.key, env)
		}
	}
}

func countQuestions(c entryCase) int {
	n := 0
	for _, s := range c.script.Calls {
		if s.Capability == api.QuestionCapability {
			n++
		}
	}
	return n
}

type callerFunc func(context.Context, api.Invocation) (json.RawMessage, error)

func (f callerFunc) CallHost(ctx context.Context, inv api.Invocation) (json.RawMessage, error) {
	return f(ctx, inv)
}

// replying wraps the fake host and rewrites the completed result of every
// reply of one capability before the module reads it.
func (h *harness) replying(capability string, edit func(result map[string]any)) api.HostCaller {
	caller := h.host.Caller()
	return callerFunc(func(ctx context.Context, inv api.Invocation) (json.RawMessage, error) {
		out, err := caller.CallHost(ctx, inv)
		if err != nil || inv.Capability != capability {
			return out, err
		}
		var reply struct {
			State  string         `json:"state"`
			Result map[string]any `json:"result"`
			Code   string         `json:"code"`
		}
		mustDecode(h.t, out, &reply)
		edit(reply.Result)
		return json.Marshal(reply)
	})
}

// The host freezes a schema-valid input whose digest covers it but that is
// not the run the module asked for: each of verify's checks refuses it
// before any role call.
func TestAFrozenInputThatIsNotTheRunIsRefused(t *testing.T) {
	rows := map[string]func(result map[string]any){
		"another run":     func(r map[string]any) { r["run_id"] = "run-other"; editRoleInput(r, "", "") },
		"another profile": func(r map[string]any) { r["profile"] = "skill-help"; editRoleInput(r, "", "") },
		// A host member the task does not carry, so only the schema sees it.
		"not the input schema": func(r map[string]any) {
			r["role_input"].(map[string]any)["project_context"] = map[string]any{"instructions": []any{}, "extra": true}
			editRoleInput(r, "", "")
		},
		"not the task":     func(r map[string]any) { editRoleInput(r, `"buy milk"`, `"buy bread"`) },
		"another workflow": func(r map[string]any) { editRoleInput(r, `"workflow_id":"wf-entry"`, `"workflow_id":"wf-other"`) },
	}
	for name, edit := range rows {
		t.Run(name, func(t *testing.T) {
			h := load(t, memo())
			env := h.invokeWith(h.replying(api.RoleComposeCapability, edit), "op-1", h.input(""))
			if env.Status != "refused" || code(env) != "role_input.invalid" || len(h.host.Host.Calls) != 0 {
				t.Fatalf("envelope %+v, role calls %d", env, len(h.host.Host.Calls))
			}
		})
	}
}

// editRoleInput replaces old by new in a compose result's role_input, none
// when old is empty, and recomputes the digest over the bytes the reply then
// carries, so the reply stays well-formed whatever the edit.
func editRoleInput(r map[string]any, old, new string) {
	body, _ := json.Marshal(r["role_input"])
	edited := string(body)
	if old != "" {
		edited = strings.Replace(edited, old, new, 1)
	}
	var v any
	_ = json.Unmarshal([]byte(edited), &v)
	compact, _ := json.Marshal(v)
	r["role_input"] = json.RawMessage(compact)
	r["role_input_sha256"] = "sha256:" + fixture.Sha256Hex(compact)
}

// The role step's own refusals: a role input that would not fit the frame
// of a role call, a host refusal of the run, and a run that never reached a
// settled answer.
func TestTheRoleStepRefusesWhatItCannotRun(t *testing.T) {
	t.Run("oversize role input", func(t *testing.T) {
		h := load(t, memo())
		h.host.ContextText = strings.Repeat("x", api.DefaultMaxFrame)
		env := h.invoke("op-1", h.input(""))
		if env.Status != "refused" || code(env) != "frame.oversize" || len(h.host.Host.Calls) != 0 {
			t.Fatalf("envelope %+v", env)
		}
	})
	t.Run("run refused", func(t *testing.T) {
		h := load(t, memo())
		caller := h.host.Caller()
		refusing := callerFunc(func(ctx context.Context, inv api.Invocation) (json.RawMessage, error) {
			if inv.Capability == api.RoleRunCapability {
				return json.RawMessage(`{"state":"refused","code":"permission-denied"}`), nil
			}
			return caller.CallHost(ctx, inv)
		})
		env := h.invokeWith(refusing, "op-1", h.input(""))
		if env.Status != "refused" || code(env) != "host.permission-denied" || h.host.ModelCalls != 0 {
			t.Fatalf("envelope %+v", env)
		}
	})
	t.Run("never settled", func(t *testing.T) {
		h := load(t, memo())
		caller := h.host.Caller()
		reads := 0
		unsettled := callerFunc(func(ctx context.Context, inv api.Invocation) (json.RawMessage, error) {
			out, err := caller.CallHost(ctx, inv)
			if err == nil && inv.Capability == api.RoleReadCapability {
				if reads++; reads == 3 {
					return json.RawMessage(strings.Replace(string(out), `"state":"settled"`, `"state":"answered"`, 1)), nil
				}
			}
			return out, err
		})
		env := h.invokeWith(unsettled, "op-1", h.input(""))
		if env.Status != "refused" || code(env) != "role.answered" || h.host.CountSent(integrate) != 0 {
			t.Fatalf("envelope %+v", env)
		}
	})
}

// One row per receipt check: each edit of the integration answer breaks
// exactly one check, so with that check removed the receipt passes and the
// row turns red. A failed check refuses with integration.invalid, keeps
// nothing of the receipt and reads no record.
func TestEveryReceiptCheckRefusesAnIntegrationThatIsNotTheRuns(t *testing.T) {
	other := strings.Repeat("e", 40)
	rows := []struct {
		name, detail string
		edit         func(r map[string]any)
	}{
		{"another run", "run_id", func(r map[string]any) { r["run_id"] = "run-other" }},
		{"another base", "base is not", func(r map[string]any) { r["base"] = other }},
		{"no reference", "reference is empty", func(r map[string]any) { r["reference"] = "" }},
		{"head moved without a commit", "no commit", func(r map[string]any) { r["commits"] = []any{}; r["head"] = other }},
		{"commits that leave head at base", "head is base", func(r map[string]any) {
			commits := r["commits"].([]any)
			commits[len(commits)-1].(map[string]any)["commit"] = fixture.BaseRevision
			r["head"] = fixture.BaseRevision
		}},
		{"head not the last commit", "last commit", func(r map[string]any) { r["head"] = other }},
		{"a commit that is no hash", "commit hash", func(r map[string]any) {
			commits := r["commits"].([]any)
			commits[len(commits)-1].(map[string]any)["commit"] = "HEAD"
			r["head"] = "HEAD"
		}},
		{"a commit without a subject", "commit hash with a subject", func(r map[string]any) {
			r["commits"].([]any)[0].(map[string]any)["subject"] = ""
		}},
		{"a change outside name-status form", "changes item", func(r map[string]any) {
			r["commits"].([]any)[0].(map[string]any)["changes"] = []any{"Q\tpkg/a/a.go"}
		}},
		{"a delta item outside name-status form", "delta item", func(r map[string]any) { r["delta"] = []any{"M\t/etc/passwd"} }},
		{"a change with a dot-dot segment", "path segment", func(r map[string]any) {
			r["commits"].([]any)[0].(map[string]any)["changes"] = []any{"M\ta/../b"}
		}},
		{"a delta item with a leading dot-dot segment", "path segment", func(r map[string]any) { r["delta"] = []any{"M\t../a"} }},
		{"a renamed path with a dot segment", "path segment", func(r map[string]any) { r["delta"] = []any{"R100\ta\t./b"} }},
		{"a delta item with an empty segment", "path segment", func(r map[string]any) { r["delta"] = []any{"M\ta//b"} }},
	}
	for _, row := range rows {
		t.Run(row.name, func(t *testing.T) {
			h := load(t, twoCommits())
			env := h.invokeWith(h.replying(integrate, row.edit), "op-1", h.input(""))
			if env.Status != "refused" || code(env) != "integration.invalid" || !strings.Contains(env.Violations[0].Detail, row.detail) {
				t.Fatalf("envelope %+v", env)
			}
			if len(env.Commits) != 0 || len(env.Delta) != 0 || h.host.CountSent(api.WorkbenchCapability) != 0 {
				t.Fatalf("envelope %+v, sent %v", env, h.host.Sent)
			}
		})
	}
}

// The module's pattern is the result schema's own text, so a receipt the
// check admits is an envelope the schema admits. The dot segments the pattern
// admits, such as M\ta/../b, are refused by the check's other half, validPaths.
func TestTheNameStatusCheckIsTheSchemasPattern(t *testing.T) {
	body, err := os.ReadFile(filepath.Join(fixture.CatalogDir(t), "schemas", "entry-result.v2.json"))
	if err != nil {
		t.Fatal(err)
	}
	var schema struct {
		Defs struct {
			NameStatus struct {
				Pattern string `json:"pattern"`
			} `json:"name_status"`
		} `json:"$defs"`
	}
	mustDecode(t, body, &schema)
	if schema.Defs.NameStatus.Pattern == "" || nameStatus.String() != schema.Defs.NameStatus.Pattern {
		t.Fatalf("module pattern %q, schema pattern %q", nameStatus.String(), schema.Defs.NameStatus.Pattern)
	}
	for line, want := range map[string]bool{
		"A\ta": true, "M\tpkg/a.go": true, "D\tx": true, "T\tx": true, "R100\told\tnew": true, "C75\ta\tb": true,
		"Q\tx": false, "M\t": false, "M\t/abs": false, "R100\tone": false, "M x": false, "M\ta\tb": false, "R1000\ta\tb": false, "M\ta\nb": false,
	} {
		if got := nameStatus.MatchString(line); got != want {
			t.Errorf("%q: %v, want %v", line, got, want)
		}
	}
}

// The control records are the paths controlrecord.Select names, each once in
// the order it first appears, read when the last status, in commit order and
// then the delta, is not D. The rows are D-F1's and the cases of Prior's
// entryControlRecord and entryControlRecords at 52a2703, except the rename and
// copy rows, marked below.
func TestControlRecordsAreTheCodecsNamesByLastStatus(t *testing.T) {
	wb := fixture.WorkbenchPrefix
	one := func(changes ...string) []Commit { return []Commit{{Changes: changes}} }
	rows := []struct {
		name    string
		commits []Commit
		delta   []string
		want    []string
	}{
		{name: "the hooks' guard state, D-F1", delta: []string{"M\t" + wb + ".guard-state/staging-drift.json", "M\t" + wb + ".guard-state/citation-form.json", "M\t" + wb + ".guard-state/dispatch-map.json"}},
		{name: "a JSON file of another name at the root", delta: []string{"M\t" + wb + "workbench.json"}},
		{name: "a JSON file of another name in a store", delta: []string{"M\t" + wb + "shared/x.json"}},
		{name: "a dot directory that begins with json", delta: []string{"M\t" + wb + ".json-state/x.json"}},
		{name: "a record below a dot directory", delta: []string{"M\t" + wb + "shared/.x/y.record.json"}},
		{name: "a package in the root's archive", delta: []string{"M\t" + wb + "archive/a/package.json"}},
		{name: "a colon in a record's name", delta: []string{"M\t" + wb + "a:b.record.json"}},
		{name: "neither code nor a narrative", commits: one("M\tpkg/a/a.go", "A\t"+wb+"shared/memos/notes-kai.md"), delta: []string{"M\t" + wb + "orchestrator-events.jsonl"}},

		{name: "the root's package", delta: []string{"M\t" + wb + "package.json"}, want: []string{"package.json"}},
		{name: "a work package", delta: []string{"M\t" + wb + "work-packages/a/package.json"}, want: []string{"work-packages/a/package.json"}},
		{name: "a record", delta: []string{"A\t" + wb + "shared/issues/x.record.json"}, want: []string{"shared/issues/x.record.json"}},
		{name: "an evidence record", delta: []string{"A\t" + wb + "shared/reviews/x.evidence.json"}, want: []string{"shared/reviews/x.evidence.json"}},
		{name: "a second evidence record", delta: []string{"A\t" + wb + "shared/reviews/x.2.evidence.json"}, want: []string{"shared/reviews/x.2.evidence.json"}},
		{name: "an archive directory below the root", delta: []string{"M\t" + wb + "x/archive/package.json"}, want: []string{"x/archive/package.json"}},

		{name: "M in a commit, then D in the delta", commits: one("M\t" + wb + "a.record.json"), delta: []string{"D\t" + wb + "a.record.json"}},
		{name: "A then D across commits", commits: []Commit{{Changes: []string{"A\t" + wb + "a.record.json"}}, {Changes: []string{"D\t" + wb + "a.record.json"}}}},
		{name: "D then A, read once", commits: []Commit{{Changes: []string{"D\t" + wb + "a.record.json"}}, {Changes: []string{"A\t" + wb + "a.record.json"}}}, want: []string{"a.record.json"}},
		{name: "changed twice, read once", commits: one("M\t" + wb + "a.record.json"), delta: []string{"M\t" + wb + "a.record.json"}, want: []string{"a.record.json"}},
		// The module's own reading of v2's name_status: Prior never emits these
		// lines and its selection would not read them.
		{name: "a rename reads the new path and not the old", commits: one("R100\t" + wb + "old.record.json\t" + wb + "new.record.json"), want: []string{"new.record.json"}},
		{name: "a rename leaves a path changed earlier deleted", commits: []Commit{{Changes: []string{"M\t" + wb + "old.record.json"}}, {Changes: []string{"R100\t" + wb + "old.record.json\t" + wb + "new.record.json"}}}, want: []string{"new.record.json"}},
		{name: "a copy reads the new path and leaves the old as it was", commits: []Commit{{Changes: []string{"M\t" + wb + "old.record.json"}}, {Changes: []string{"C75\t" + wb + "old.record.json\t" + wb + "new.record.json"}}}, want: []string{"old.record.json", "new.record.json"}},
		{
			name: "the order each first appears",
			commits: []Commit{
				{Changes: []string{"A\t" + wb + "gone.record.json", "M\t" + wb + "b/package.json"}},
				{Changes: []string{"A\t" + wb + "r.evidence.json", "M\t" + wb + "b/package.json"}},
			},
			delta: []string{"D\t" + wb + "gone.record.json", "A\t" + wb + "p.record.json"},
			want:  []string{"b/package.json", "r.evidence.json", "p.record.json"},
		},
	}
	for _, row := range rows {
		t.Run(row.name, func(t *testing.T) {
			got := controlRecords(row.commits, row.delta)
			if strings.Join(got, " ") != strings.Join(row.want, " ") {
				t.Fatalf("records %v, want %v", got, row.want)
			}
		})
	}
}

// L1: an envelope over the frame bound on a run that integrated is refused
// frame.oversize and still carries the integration, which stands, with the
// questions emptied; only when the integration alone does not fit is it the
// bare refusal.
func TestAnOversizeEnvelopeKeepsTheIntegrationThatStands(t *testing.T) {
	t.Run("questions over the bound", func(t *testing.T) {
		h := load(t, twoCommits())
		scripted := h.host.Models[h.c.profile]
		h.host.Models[h.c.profile] = func(runID string, input json.RawMessage) json.RawMessage {
			var answer map[string]any
			mustDecode(t, scripted(runID, input), &answer)
			var questions []any
			for i := 0; len(questions)*8192 <= api.DefaultMaxFrame; i++ {
				questions = append(questions, map[string]any{"call_id": fmt.Sprintf("q-%d", i), "question": strings.Repeat("q", 8192), "options": []any{}, "channel": "chat-text", "outcome": "interrupted", "selected": []any{}, "text": ""})
			}
			answer["questions"] = questions
			body, _ := json.Marshal(answer)
			return body
		}
		env := h.invoke("op-1", h.input(""))
		if env.Status != "refused" || code(env) != "frame.oversize" || len(env.Questions) != 0 {
			t.Fatalf("envelope status %s, violations %+v, %d questions", env.Status, env.Violations, len(env.Questions))
		}
		if len(env.Commits) != 2 || env.Commits[1].Subject != "Record the fix in the package" || strings.Join(env.Delta, ",") != "M\tdocs/notes.md" {
			t.Fatalf("the integration was dropped: commits %+v, delta %q", env.Commits, env.Delta)
		}
	})
	t.Run("the integration over the bound", func(t *testing.T) {
		h := load(t, twoCommits())
		var delta []any
		for i := 0; len(delta)*24 <= api.DefaultMaxFrame; i++ {
			delta = append(delta, fmt.Sprintf("M\tpkg/generated/f-%06d.go", i))
		}
		env := h.invokeWith(h.replying(integrate, func(r map[string]any) { r["delta"] = delta }), "op-1", h.input(""))
		if env.Status != "refused" || code(env) != "frame.oversize" || len(env.Commits) != 0 || len(env.Delta) != 0 {
			t.Fatalf("envelope status %s, violations %+v, %d commits, %d delta", env.Status, env.Violations, len(env.Commits), len(env.Delta))
		}
	})
}

func TestReasonOf(t *testing.T) {
	for code, want := range map[string]string{"host.scope-violation": "host-scope-violation", "entry.unknown": "entry-unknown", "frame.oversize": "frame-oversize", "1x": "refused-1x"} {
		if got := reasonOf(code); got != want {
			t.Errorf("reasonOf(%q) = %q, want %q", code, got, want)
		}
	}
}

// The handler behind the SDK server, over pipes, against the SDK client with
// the fake services offered: every host call framed as Prior frames it.
func TestServeOverPipes(t *testing.T) {
	h := load(t, memo())
	secret := make([]byte, 32)
	if _, err := rand.Read(secret); err != nil {
		t.Fatal(err)
	}
	server := api.Server{Identity: fixture.Identity, Secret: secret, Workflows: map[string]api.WorkflowHandler{h.def.Capability: h.def.Handler(fixture.Identity, RemoteRoles(fixture.Identity))}}
	hostReads, moduleWrites := io.Pipe()
	moduleReads, hostWrites := io.Pipe()
	served := make(chan error, 1)
	go func() { served <- server.Serve(context.Background(), moduleReads, moduleWrites) }()
	client, err := api.ConnectWithServices(context.Background(), duplex{hostReads, hostWrites}, fixture.Identity, secret, []string{"fusion.entry.v2"}, h.host.Services())
	if err != nil {
		t.Fatal(err)
	}
	out, err := client.Invoke(context.Background(), api.Invocation{OperationID: "op-1", Capability: "fusion.entry.v2", Input: h.input("")})
	if err != nil {
		t.Fatal(err)
	}
	if env := decode(t, out); env.Status != "completed" || len(env.Delta) != 1 || h.host.ModelCalls != 1 {
		t.Fatalf("envelope %+v", env)
	}
	client.Close()
	if err := <-served; err == nil {
		t.Fatal("serve returned nil after the connection closed")
	}
}

type duplex struct {
	io.Reader
	io.Writer
}

func (d duplex) Close() error {
	d.Reader.(*io.PipeReader).Close()
	return d.Writer.(*io.PipeWriter).Close()
}
