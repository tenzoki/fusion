package entry

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"errors"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/fixture"
	"github.com/kai/prior/integrationbuild/fusionmodule/internal/steps"
	api "github.com/kai/prior/moduleapi/v1"
)

// These are unit tests of the entry workflow over the fake durable host of
// internal/fixture, in-process, over a fixture payload in which help,
// reconcile and memo are supported on prior: one entry per class, plain,
// dispatches and asks. Each role run is scripted and makes its class's
// entry service calls inside the run, as Prior's model loop would; the
// module makes none of them. They prove the interpreter's step order, its
// composition, its routing and its restart behaviour, not the installed
// process: plan step 18 drives a built bundle.

const (
	workflowID = "wf-entry"
	runID      = "run-entry"
)

// supported are the entries the fixture payload supports on prior.
var supported = []string{"help", "reconcile", "memo"}

// entryCase is one entry the tests drive, with its scripted run.
type entryCase struct {
	id, kind, profile, class string
	arguments                []map[string]string
	script                   fixture.Script
	pageBytes                int
}

const packageRecord = "work-packages/261023-1846-prior-full-surface-handover-h1-to-h9/package.json"

func help() entryCase {
	return entryCase{id: "help", kind: "skill", profile: "skill-help", class: "plain",
		arguments: []map[string]string{{"name": "topic", "value": "daily"}},
		script: fixture.Script{Calls: []fixture.ScriptCall{
			{Capability: api.ExecCapability, CallID: "x-1", Argv: []string{"bin/fusion-workbench-root"}},
		}}}
}

func reconcile() entryCase {
	return entryCase{id: "reconcile", kind: "skill", profile: "skill-reconcile", class: "dispatches",
		arguments: []map[string]string{{"name": "--force", "value": ""}},
		script: fixture.Script{Calls: []fixture.ScriptCall{
			{Capability: api.ExecCapability, CallID: "x-1", Argv: []string{"bin/fusion-work-order"}},
			{Capability: api.DispatchCapability, CallID: "d-1", Entry: "state-auditor", Writes: []string{fixture.WorkbenchPrefix + packageRecord}},
		}},
		pageBytes: 40}
}

func memo() entryCase {
	return entryCase{id: "memo", kind: "skill", profile: "skill-memo", class: "asks",
		arguments: []map[string]string{{"name": "content", "value": "buy milk"}},
		script: fixture.Script{Calls: []fixture.ScriptCall{
			{Capability: api.QuestionCapability, CallID: "q-1", Question: "Note or task?", Options: []string{"note", "task"}, Channel: api.QuestionChannelAskUser, Answer: api.QuestionResult{Outcome: api.QuestionAnswered, Selected: []string{"note"}}},
			{Capability: api.ExecCapability, CallID: "x-1", Argv: []string{"bin/fusion-memo", "note", "buy milk"}, Writes: []string{"fusion-workbench/shared/memos/notes-kai.md"}},
		}}}
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
	out, err := h.raw(h.host.Caller(), operation, input)
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

func TestLoadReadsTheDefinition(t *testing.T) {
	def := definition(t)
	if def.Capability != "fusion.entry.v1" || def.request == nil || def.roleInput == nil || def.result == nil || def.envelope == nil {
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
		t.Fatalf("the live catalog, no entry supported: %v", err)
	}
	catalog, err := steps.LoadCatalog(bundle)
	if err != nil {
		t.Fatal(err)
	}
	if len(live.entries) != len(catalog.Entries()) {
		t.Fatalf("%d entries resolved of %d", len(live.entries), len(catalog.Entries()))
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

// One entry per class runs to its envelope against the fake host: help
// changes nothing and integrates nothing, reconcile dispatches a child that
// changes a control record which the workbench step reads, memo asks a
// question and writes a memo.
func TestOneEntryPerClassRunsAgainstTheFakeHost(t *testing.T) {
	for _, c := range []entryCase{help(), reconcile(), memo()} {
		t.Run(c.class+" "+c.id, func(t *testing.T) {
			h := load(t, c)
			env := h.invoke("op-1", h.input(""))
			if env.Status != "completed" || env.Ending == nil || *env.Ending != (Ending{"success", "answered"}) || len(env.Violations) != 0 {
				t.Fatalf("envelope %+v", env)
			}
			if h.host.ModelCalls != 1 {
				t.Fatalf("%d model calls", h.host.ModelCalls)
			}
			// The module called none of the three entry services; the run made
			// its class's calls, each under the run as actor.
			for _, capability := range fixture.EntryCapabilities {
				if n := h.host.CountSent(capability); n != 0 {
					t.Fatalf("the module called %s %d times", capability, n)
				}
			}
			var made []string
			for _, call := range h.host.EntryCalls() {
				made = append(made, call.Capability)
				var binding struct{ Actor, WorkflowID string }
				mustDecode(t, call.Input, &binding)
				if binding.Actor != runID || call.OperationID != api.EntryOperationID(call.Capability, workflowID, runID, call.Slot) {
					t.Fatalf("entry call %+v", call)
				}
			}
			var want []string
			for _, step := range c.script.Calls {
				want = append(want, step.Capability)
			}
			if strings.Join(made, " ") != strings.Join(want, " ") {
				t.Fatalf("entry calls %v, want %v", made, want)
			}
			// Every role call forwarded the bytes the host froze; no audit
			// reference was sent without one in the invocation.
			for _, call := range h.host.Host.Calls {
				if string(call.Call.Input) != string(h.host.Composed(runID)) || call.Call.Profile != c.profile || call.Call.AuditRef != "" {
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
			if input.WorkflowID != workflowID || input.RunID != runID || input.Entry != (entryRef{c.id, c.kind, c.profile}) || len(input.Arguments) != len(c.arguments) {
				t.Fatalf("role input %s", h.host.Composed(runID))
			}

			switch c.id {
			case "help":
				if len(env.Commits) != 0 || len(env.Questions) != 0 || h.effect(api.CaptureCapability) != 1 || h.effect(api.IntegrateCapability) != 0 || h.effect(api.SnapshotCapability) != 0 {
					t.Fatalf("envelope %+v, effects %v", env, h.host.Effects)
				}
			case "reconcile":
				commit := env.Commits
				if len(commit) != 1 || commit[0].Reference != fixture.EntryReference || commit[0].Subject != "integration integration-1" || strings.Join(commit[0].Changes, ",") != fixture.WorkbenchPrefix+packageRecord {
					t.Fatalf("commits %+v", env.Commits)
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
				if len(env.Commits) != 1 || strings.Join(env.Commits[0].Changes, ",") != "fusion-workbench/shared/memos/notes-kai.md" || h.effect(api.WorkbenchCapability) != 0 {
					t.Fatalf("commits %+v, effects %v", env.Commits, h.host.Effects)
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
// run, completion, capture, integration, snapshot, read and page.
func TestAKillAfterEachPersistedBoundaryResumesToTheSameEnvelope(t *testing.T) {
	for _, c := range []entryCase{help(), reconcile(), memo()} {
		t.Run(c.id, func(t *testing.T) {
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
			if len(boundaries) < 5 {
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

// A question answered ended stops the run: the envelope is ended with the
// run's stop and its question, the capture finds nothing and nothing is
// integrated.
func TestAQuestionAnsweredEndedEndsTheRun(t *testing.T) {
	c := memo()
	c.script.Calls[0].Answer = api.QuestionResult{Outcome: api.QuestionEnded}
	h := load(t, c)
	env := h.invoke("op-1", h.input(""))
	if env.Status != "ended" || env.Ending == nil || *env.Ending != (Ending{"stop", "ended-by-question"}) || len(env.Questions) != 1 || len(env.Commits) != 0 {
		t.Fatalf("envelope %+v", env)
	}
	if h.effect(api.CaptureCapability) != 1 || h.effect(api.IntegrateCapability) != 0 || len(h.host.EntryCalls()) != 1 {
		t.Fatalf("effects %v, entry calls %d", h.host.Effects, len(h.host.EntryCalls()))
	}
}

// A stopped run that changed the workspace is captured and integrated, and
// the envelope stays ended with the commit.
func TestAStoppedRunThatChangedTheWorkspaceIsIntegrated(t *testing.T) {
	c := memo()
	c.script.Calls = []fixture.ScriptCall{c.script.Calls[1], c.script.Calls[0]}
	c.script.Calls[1].Answer = api.QuestionResult{Outcome: api.QuestionEnded}
	h := load(t, c)
	env := h.invoke("op-1", h.input(""))
	if env.Status != "ended" || len(env.Commits) != 1 || h.effect(api.IntegrateCapability) != 1 {
		t.Fatalf("envelope %+v, effects %v", env, h.host.Effects)
	}
}

func TestARunThatRefusesEndsRefusedWithoutCapture(t *testing.T) {
	c := help()
	c.script.Refuse = "nothing-to-explain"
	h := load(t, c)
	env := h.invoke("op-1", h.input(""))
	if env.Status != "refused" || env.Ending == nil || *env.Ending != (Ending{"refusal", "nothing-to-explain"}) || code(env) != "nothing-to-explain" {
		t.Fatalf("envelope %+v", env)
	}
	if h.effect(api.CaptureCapability) != 0 {
		t.Fatal("a refused run was captured")
	}
}

// The rule the result schema cannot state: an option selected is among the
// question's options.
func TestASelectedOptionOutsideItsOptionsIsRefused(t *testing.T) {
	h := load(t, memo())
	h.host.Models["skill-memo"] = func(string, json.RawMessage) json.RawMessage {
		return json.RawMessage(`{"status":"completed","ending":{"class":"success","reason":"answered"},"questions":[{"call_id":"q-1","question":"Note or task?","options":["note","task"],"channel":"ask-user-question","outcome":"answered","selected":["maybe"],"text":""}],"commits":[],"violations":[]}`)
	}
	env := h.invoke("op-1", h.input(""))
	if env.Status != "refused" || code(env) != "result.invalid" || env.Ending.Reason != "result-invalid" || h.effect(api.CaptureCapability) != 0 {
		t.Fatalf("envelope %+v", env)
	}
}

func TestASchemaInvalidAnswerIsRefused(t *testing.T) {
	h := load(t, help())
	h.host.Models["skill-help"] = func(string, json.RawMessage) json.RawMessage {
		return json.RawMessage(`{"status":"completed","ending":{"class":"refusal","reason":"x"},"questions":[],"commits":[],"violations":[]}`)
	}
	env := h.invoke("op-1", h.input(""))
	if env.Status != "refused" || code(env) != "result.invalid" {
		t.Fatalf("envelope %+v", env)
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
		"unsupported on prior":    {strings.Replace(valid, entry, `"entry":{"id":"wp","kind":"skill","profile":"skill-wp"}`, 1), "entry.unsupported"},
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
	out, err := h.handler(context.Background(), api.Invocation{OperationID: "op", Capability: "fusion.other.v1", Input: h.input("")}, h.host.Caller())
	if err != nil || !strings.Contains(string(out), `"invocation.capability"`) {
		t.Errorf("unknown capability: %s %v", out, err)
	}
	if len(h.host.Sent) != 0 {
		t.Fatalf("a refused invocation reached the host: %v", h.host.Sent)
	}
}

func TestHostRefusalsRefuseTheInvocation(t *testing.T) {
	cases := []struct {
		c       entryCase
		key     string
		code    string
		commits int
	}{
		{memo(), api.CaptureCapability + "/" + runID, "scope-violation", 0},
		{memo(), api.IntegrateCapability + "/integration", "correction-required", 0},
		{reconcile(), api.WorkbenchCapability + "/record:" + packageRecord, "record-conflict", 1},
		{help(), api.WorkspaceCapability + "/" + runID, "invalid-request", 0},
		{help(), api.RoleComposeCapability + "/" + runID, "permission-denied", 0},
	}
	for _, tc := range cases {
		t.Run(tc.key+" "+tc.code, func(t *testing.T) {
			h := load(t, tc.c)
			h.host.Refuse[tc.key] = tc.code
			env := h.invoke("op-1", h.input(""))
			if env.Status != "refused" || code(env) != "host."+tc.code || env.Ending == nil || env.Ending.Reason != "host-"+tc.code || len(env.Commits) != tc.commits {
				t.Fatalf("envelope %+v", env)
			}
		})
	}
	h := load(t, memo())
	h.host.Recover[api.SnapshotCapability+"/post-integration"] = true
	env := h.invoke("op-1", h.input(""))
	if env.Status != "recovery-required" || env.Ending != nil || code(env) != "host.recovery-required" || len(env.Commits) != 1 || len(env.Questions) != 1 {
		t.Fatalf("envelope %+v", env)
	}
}

type callerFunc func(context.Context, api.Invocation) (json.RawMessage, error)

func (f callerFunc) CallHost(ctx context.Context, inv api.Invocation) (json.RawMessage, error) {
	return f(ctx, inv)
}

// The host freezes a schema-valid input that names another workflow, with a
// digest that covers it: the module forwards only what names its own.
func TestAFrozenInputNamingAnotherWorkflowIsRefused(t *testing.T) {
	h := load(t, memo())
	caller := h.host.Caller()
	tampered := callerFunc(func(ctx context.Context, inv api.Invocation) (json.RawMessage, error) {
		out, err := caller.CallHost(ctx, inv)
		if err != nil || inv.Capability != api.RoleComposeCapability {
			return out, err
		}
		var reply struct {
			State  string `json:"state"`
			Result struct {
				RunID           string          `json:"run_id"`
				Profile         string          `json:"profile"`
				RoleInput       json.RawMessage `json:"role_input"`
				RoleInputSHA256 string          `json:"role_input_sha256"`
			} `json:"result"`
			Code string `json:"code"`
		}
		mustDecode(t, out, &reply)
		reply.Result.RoleInput = json.RawMessage(strings.Replace(string(reply.Result.RoleInput), `"workflow_id":"wf-entry"`, `"workflow_id":"wf-other"`, 1))
		reply.Result.RoleInputSHA256 = "sha256:" + fixture.Sha256Hex(reply.Result.RoleInput)
		return json.Marshal(reply)
	})
	out, err := h.raw(tampered, "op-1", h.input(""))
	if err != nil {
		t.Fatal(err)
	}
	if env := decode(t, out); env.Status != "refused" || code(env) != "role_input.invalid" || len(h.host.Host.Calls) != 0 {
		t.Fatalf("envelope %+v, role calls %d", env, len(h.host.Host.Calls))
	}
}

func TestControlRecordsAreTheWorkbenchJSONPaths(t *testing.T) {
	got := controlRecords([]string{
		"pkg/a/a.go",
		"fusion-workbench/shared/memos/notes-kai.md",
		"fusion-workbench/" + packageRecord,
		"M\tfusion-workbench/issues/x.record.json",
		"fusion-workbench/" + packageRecord,
		"fusion-workbench/a:b.json",
		"fusion-workbench/orchestrator-events.jsonl",
	})
	if strings.Join(got, " ") != packageRecord+" issues/x.record.json" {
		t.Fatalf("records %v", got)
	}
}

func TestReasonOf(t *testing.T) {
	for code, want := range map[string]string{"host.scope-violation": "host-scope-violation", "entry.unknown": "entry-unknown", "frame.oversize": "frame-oversize", "1x": "refused-1x"} {
		if got := reasonOf(code); got != want {
			t.Errorf("reasonOf(%q) = %q, want %q", code, got, want)
		}
	}
}

// The handler behind the SDK server, over pipes, against the SDK client with
// the twelve fake services offered: every host call framed as Prior frames
// it.
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
	client, err := api.ConnectWithServices(context.Background(), duplex{hostReads, hostWrites}, fixture.Identity, secret, []string{"fusion.entry.v1"}, h.host.Services())
	if err != nil {
		t.Fatal(err)
	}
	out, err := client.Invoke(context.Background(), api.Invocation{OperationID: "op-1", Capability: "fusion.entry.v1", Input: h.input("")})
	if err != nil {
		t.Fatal(err)
	}
	if env := decode(t, out); env.Status != "completed" || len(env.Commits) != 1 || h.host.ModelCalls != 1 {
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
