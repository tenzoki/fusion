package repair

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"errors"
	"io"
	"strings"
	"testing"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/fixture"
	"github.com/kai/prior/integrationbuild/fusionmodule/internal/steps"
	api "github.com/kai/prior/moduleapi/v1"
)

// These are unit tests of the repair workflow over the fake durable host of
// internal/fixture, in-process. They prove the interpreter's step order,
// its composition, its routing on every reply and its restart behaviour,
// not the installed process: plan step 18 drives a built bundle.

const workflowID = "wf-1"

type harness struct {
	t       *testing.T
	dir     string
	def     *Definition
	runs    fixture.RepairRuns
	host    *fixture.RepairHost
	handler api.WorkflowHandler
}

func load(t *testing.T) *harness {
	t.Helper()
	dir := fixture.CatalogDir(t)
	bundle, err := steps.OpenBundle(fixture.Bundle(t, dir))
	if err != nil {
		t.Fatal(err)
	}
	def, err := Load(bundle)
	if err != nil {
		t.Fatal(err)
	}
	runs := fixture.DefaultRuns()
	host := fixture.NewRepairHost(t, dir, workflowID, runs)
	roles := func(h api.HostCaller) steps.RoleClient { return api.RemoteRoles{Host: h, Identity: fixture.Identity} }
	return &harness{t: t, dir: dir, def: def, runs: runs, host: host, handler: def.Handler(fixture.Identity, roles)}
}

func (h *harness) input(auditRef string) json.RawMessage {
	return fixture.RepairInvocation(h.t, workflowID, h.runs, auditRef)
}

func (h *harness) invokeWith(caller api.HostCaller, operation string, input json.RawMessage) (Envelope, error) {
	h.t.Helper()
	out, err := h.handler(context.Background(), api.Invocation{OperationID: operation, Capability: h.def.Capability, Input: input}, caller)
	if err != nil {
		return Envelope{}, err
	}
	var env Envelope
	if err := api.Decode(out, &env); err != nil {
		h.t.Fatalf("envelope %s: %v", out, err)
	}
	return env, nil
}

func (h *harness) invoke(operation string, input json.RawMessage) Envelope {
	h.t.Helper()
	env, err := h.invokeWith(h.host.Caller(), operation, input)
	if err != nil {
		h.t.Fatalf("invoke: %v", err)
	}
	return env
}

func (h *harness) result(env Envelope) Result {
	h.t.Helper()
	var r Result
	if err := api.Decode(env.Domain.Result, &r); err != nil {
		h.t.Fatalf("result %s: %v", env.Domain.Result, err)
	}
	return r
}

func code(env Envelope) string {
	if len(env.Domain.Violations) == 0 {
		return ""
	}
	return env.Domain.Violations[0].Code
}

func stoppedAt(r Result) string {
	if r.StoppedAt == nil {
		return "<null>"
	}
	return *r.StoppedAt
}

// evidenceLine renders the evidence as "step[attempt]:run:state" entries.
func evidenceLine(env Envelope) string {
	var parts []string
	for _, e := range env.HostEvidence {
		attempt := "-"
		if e.Attempt != nil {
			attempt = strings.Repeat("i", *e.Attempt+1)
		}
		parts = append(parts, e.Step+"["+attempt+"]:"+e.RunID+":"+e.RoleState)
	}
	return strings.Join(parts, " ")
}

func (h *harness) effects() map[string]int {
	out := map[string]int{}
	for key, n := range h.host.Effects {
		out[key[:strings.Index(key, "/")]] += n
	}
	return out
}

func TestLoadReadsTheDefinition(t *testing.T) {
	h := load(t)
	if h.def.Capability != "fusion.repair.v1" || h.def.ReviseBound != 1 || h.def.recoveryKey != "audit_ref" {
		t.Fatalf("definition %+v", h.def)
	}
	for step, role := range map[string]string{"explore": "explorer", "implement": "code-implementer", "review": "reviewer", "audit": "state-auditor"} {
		if got := h.def.roles[step]; got.Role != role || got.input == nil || got.result == nil {
			t.Fatalf("%s: %+v", step, got)
		}
	}
}

func TestAcceptedFirstAttemptRunsToClose(t *testing.T) {
	h := load(t)
	env := h.invoke("op-1", h.input(""))
	if env.Domain.Status != "completed" || len(env.Domain.Violations) != 0 {
		t.Fatalf("envelope %+v", env)
	}
	r := h.result(env)
	if len(r.Attempts) != 1 || r.Attempts[0].Attempt != 0 || string(r.Attempts[0].Implementation) == "null" || string(r.Attempts[0].Capture) == "null" || string(r.Attempts[0].Review) == "null" || stoppedAt(r) != "<null>" {
		t.Fatalf("result %s", env.Domain.Result)
	}
	var integration struct{ Commit, Reference, Tree string }
	if err := json.Unmarshal(r.Integration, &integration); err != nil || integration.Tree != "tree:run-impl-0" || integration.Reference != "refs/prior/accepted/fusion-repair" || integration.Commit != fixture.Sha256Hex([]byte("tree:run-impl-0")) {
		t.Fatalf("integration %s", r.Integration)
	}
	var closure struct {
		Record, Before, After string
		Reconciled            bool
	}
	if err := json.Unmarshal(r.Closure, &closure); err != nil || closure.Record != fixture.RecordPath || closure.Before != "7" || closure.After != "8" || !closure.Reconciled {
		t.Fatalf("closure %s", r.Closure)
	}
	if string(r.Audit) == "null" || string(r.Exploration) != string(fixture.Answer(1)) {
		t.Fatalf("audit %s, exploration %s", r.Audit, r.Exploration)
	}
	if got := evidenceLine(env); got != "explore[-]:run-explore:settled implement[i]:run-impl-0:settled review[i]:run-review-0:settled audit[-]:run-audit:settled" {
		t.Fatalf("evidence %s", got)
	}
	for _, e := range env.HostEvidence {
		if e.PrincipalID != h.host.Runs[e.RunID].Answer.PrincipalID || !e.ObservedAt.Equal(h.host.Runs[e.RunID].Answer.ObservedAt) {
			t.Fatalf("evidence %+v is not copied from the answer", e)
		}
	}
	if h.host.ModelCalls != 4 {
		t.Fatalf("%d model calls", h.host.ModelCalls)
	}
	want := map[string]int{api.RoleComposeCapability: 4, api.WorkspaceCapability: 1, api.CaptureCapability: 1, api.IntegrateCapability: 1, api.SnapshotCapability: 1, api.WorkbenchCapability: 2}
	if got := h.effects(); len(got) != len(want) || got[api.RoleComposeCapability] != 4 || got[api.WorkspaceCapability] != 1 || got[api.CaptureCapability] != 1 || got[api.IntegrateCapability] != 1 || got[api.SnapshotCapability] != 1 || got[api.WorkbenchCapability] != 2 {
		t.Fatalf("effects %v, want %v", got, want)
	}
	if _, used := h.host.Runs["run-impl-1"]; used || h.host.Effects[api.WorkspaceCapability+"/run-impl-1"] != 0 {
		t.Fatal("the second pair was dispatched after an accept")
	}
	// Every repair call carries the operation id of its slot and a task
	// without the host's two members; every role call forwards the frozen
	// bytes the host composed.
	for _, c := range h.host.Calls {
		if c.OperationID != api.RepairOperationID(c.Capability, workflowID, c.Slot) {
			t.Fatalf("call %+v", c)
		}
		call, slot, err := api.DecodeRepairCall(api.Invocation{OperationID: c.OperationID, Capability: c.Capability, Input: c.Input})
		if err != nil || slot != c.Slot || call.WorkflowID != workflowID || call.Identity != fixture.Identity {
			t.Fatalf("call %s %s: %v", c.Capability, c.Slot, err)
		}
	}
	for _, c := range h.host.Host.Calls {
		if frozen := h.host.Composed(c.Call.RunID); string(c.Call.Input) != string(frozen) {
			t.Fatalf("%s %s did not forward the frozen input", c.Capability, c.Call.RunID)
		}
		if c.Call.AuditRef != "" {
			t.Fatalf("an audit reference was sent without one in the invocation: %+v", c)
		}
	}
	// The tasks composed: the explorer's question is the summary and the
	// criteria one line each; the implementer's attempt is 0 with no
	// previous review; the reviewer's binding is the capture's; the auditor
	// holds the thirteen-field receipt, the record and the snapshot.
	var explore struct{ Question string }
	var implement struct {
		Attempt struct {
			Index          int
			PreviousReview json.RawMessage `json:"previous_review"`
		}
		Workspace struct{ Root string }
	}
	var audit struct {
		Integration       map[string]json.RawMessage
		Workbench         json.RawMessage
		WorkbenchRevision string `json:"workbench_revision"`
		Runtime           map[string]json.RawMessage
		Directive         string
		Since             string
	}
	mustDecode(t, h.host.Composed("run-explore"), &explore)
	mustDecode(t, h.host.Composed("run-impl-0"), &implement)
	mustDecode(t, h.host.Composed("run-audit"), &audit)
	if explore.Question != "Make the failing test in pkg/a pass\ngo test ./... exits 0\nno file outside pkg/a changes" {
		t.Fatalf("question %q", explore.Question)
	}
	if implement.Attempt.Index != 0 || string(implement.Attempt.PreviousReview) != "null" || implement.Workspace.Root != "workspace:run-impl-0" {
		t.Fatalf("implement task %+v", implement)
	}
	if len(audit.Integration) != 13 || len(audit.Runtime) != 11 || string(audit.Workbench) != string(h.host.Record) || audit.WorkbenchRevision != "7" || audit.Since != fixture.BaseRevision || audit.Directive != explore.Question {
		t.Fatalf("audit task %+v", audit)
	}
}

func mustDecode(t *testing.T, body []byte, target any) {
	t.Helper()
	if err := json.Unmarshal(body, target); err != nil {
		t.Fatalf("%s: %v", body, err)
	}
}

func TestReviseThenAcceptRunsTheSecondPair(t *testing.T) {
	h := load(t)
	h.host.Models["reviewer"] = func(runID string, input json.RawMessage) json.RawMessage {
		if runID == "run-review-0" {
			return fixture.Review("revise", "the second case is still failing")(runID, input)
		}
		return fixture.Review("accept")(runID, input)
	}
	env := h.invoke("op-1", h.input(""))
	if env.Domain.Status != "completed" {
		t.Fatalf("envelope %+v", env)
	}
	r := h.result(env)
	if len(r.Attempts) != 2 || r.Attempts[1].Attempt != 1 || string(r.Attempts[1].Review) == "null" {
		t.Fatalf("result %s", env.Domain.Result)
	}
	if got := evidenceLine(env); got != "explore[-]:run-explore:settled implement[i]:run-impl-0:settled review[i]:run-review-0:settled implement[ii]:run-impl-1:settled review[ii]:run-review-1:settled audit[-]:run-audit:settled" {
		t.Fatalf("evidence %s", got)
	}
	var second struct {
		Attempt struct {
			Index          int
			PreviousReview json.RawMessage `json:"previous_review"`
		}
		Workspace struct{ Root string }
	}
	mustDecode(t, h.host.Composed("run-impl-1"), &second)
	previous, _ := steps.Parse(second.Attempt.PreviousReview)
	first, _ := steps.Parse(r.Attempts[0].Review)
	if second.Attempt.Index != 1 || !steps.Equal(previous, first) || second.Workspace.Root != "workspace:run-impl-1" {
		t.Fatalf("second attempt task %+v", second)
	}
	if h.host.Effects[api.WorkspaceCapability+"/run-impl-0"] != 1 || h.host.Effects[api.WorkspaceCapability+"/run-impl-1"] != 1 || h.host.ModelCalls != 6 {
		t.Fatalf("effects %v, model calls %d", h.host.Effects, h.host.ModelCalls)
	}
	var integrate api.RepairCall
	for _, c := range h.host.Calls {
		if c.Capability == api.IntegrateCapability {
			mustDecode(t, c.Input, &integrate)
		}
	}
	if integrate.RunID != "run-review-1" {
		t.Fatalf("integrated on %q", integrate.RunID)
	}
}

func TestReviseAtTheBoundEscalatesAtReview(t *testing.T) {
	h := load(t)
	h.host.Models["reviewer"] = fixture.Review("revise", "still failing")
	env := h.invoke("op-1", h.input(""))
	r := h.result(env)
	if env.Domain.Status != "escalated" || code(env) != "review.revise-bound" || stoppedAt(r) != "review" || len(r.Attempts) != 2 || string(r.Integration) != "null" || string(r.Closure) != "null" {
		t.Fatalf("envelope %+v, result %s", env, env.Domain.Result)
	}
	if h.host.CountRepair(api.IntegrateCapability) != 0 || len(env.HostEvidence) != 5 {
		t.Fatalf("integrate called, or evidence %s", evidenceLine(env))
	}
}

func TestEscalateVerdictStopsWithoutTheSecondPair(t *testing.T) {
	h := load(t)
	h.host.Models["reviewer"] = fixture.Review("escalate", "the change needs a design decision")
	env := h.invoke("op-1", h.input(""))
	r := h.result(env)
	if env.Domain.Status != "escalated" || code(env) != "review.escalate" || stoppedAt(r) != "review" || len(r.Attempts) != 1 || env.Domain.Violations[0].Detail != "the change needs a design decision" {
		t.Fatalf("envelope %+v", env)
	}
	if _, used := h.host.Runs["run-impl-1"]; used || h.host.CountRepair(api.WorkspaceCapability) != 1 {
		t.Fatal("the second pair was dispatched after an escalate")
	}
}

func TestBlockedImplementerEscalatesAtImplement(t *testing.T) {
	h := load(t)
	h.host.Models["code-implementer"] = fixture.ImplementerBlocked
	env := h.invoke("op-1", h.input(""))
	r := h.result(env)
	if env.Domain.Status != "escalated" || code(env) != "implementer.blocked" || stoppedAt(r) != "implement" || string(r.Attempts[0].Implementation) == "null" || string(r.Attempts[0].Capture) != "null" || string(r.Attempts[0].Review) != "null" {
		t.Fatalf("envelope %+v, result %s", env, env.Domain.Result)
	}
	if h.host.CountRepair(api.CaptureCapability) != 0 || evidenceLine(env) != "explore[-]:run-explore:settled implement[i]:run-impl-0:settled" {
		t.Fatalf("capture called, or evidence %s", evidenceLine(env))
	}
}

func TestHostRefusalsEscalateWhereAnswer69SaysAndRefuseElsewhere(t *testing.T) {
	cases := []struct {
		key, code string
		status    string
		stopped   string
		violation string
	}{
		{api.CaptureCapability + "/run-impl-0", "validation-failed", "escalated", "capture", "validation-failed"},
		{api.CaptureCapability + "/run-impl-0", "scope-violation", "escalated", "capture", "scope-violation"},
		{api.CaptureCapability + "/run-impl-0", "frame.oversize", "escalated", "capture", "frame.oversize"},
		{api.CaptureCapability + "/run-impl-0", "context.limit", "escalated", "capture", "context.limit"},
		{api.CaptureCapability + "/run-impl-0", "permission-denied", "refused", "", "host.permission-denied"},
		{api.IntegrateCapability + "/integration", "correction-required", "escalated", "integrate", "correction-required"},
		{api.IntegrateCapability + "/integration", "conflict", "refused", "", "host.conflict"},
		{api.WorkbenchCapability + "/close", "record-conflict", "escalated", "close", "record-conflict"},
		{api.WorkbenchCapability + "/record", "record-conflict", "refused", "", "host.record-conflict"},
		{api.WorkspaceCapability + "/run-impl-0", "invalid-request", "refused", "", "host.invalid-request"},
		{api.SnapshotCapability + "/post-integration", "frame.oversize", "refused", "", "host.frame.oversize"},
		{api.RoleComposeCapability + "/run-review-0", "conflict", "refused", "", "host.conflict"},
	}
	for _, tc := range cases {
		t.Run(tc.key+" "+tc.code, func(t *testing.T) {
			h := load(t)
			h.host.Refuse[tc.key] = tc.code
			env := h.invoke("op-1", h.input(""))
			if env.Domain.Status != tc.status || code(env) != tc.violation {
				t.Fatalf("envelope %+v", env)
			}
			if tc.status == "escalated" {
				if r := h.result(env); stoppedAt(r) != tc.stopped {
					t.Fatalf("stopped at %s", stoppedAt(r))
				}
			} else if string(env.Domain.Result) != "null" {
				t.Fatalf("a refusal carried a result: %s", env.Domain.Result)
			}
		})
	}
	// After an escalation at capture the attempt's capture and review are
	// null and the reviewer was never composed; after one at integrate the
	// snapshot was never taken; after one at close the closure is null and
	// the audit stands.
	h := load(t)
	h.host.Refuse[api.CaptureCapability+"/run-impl-0"] = "validation-failed"
	r := h.result(h.invoke("op-1", h.input("")))
	if string(r.Attempts[0].Capture) != "null" || string(r.Attempts[0].Review) != "null" || h.host.Composed("run-review-0") != nil {
		t.Fatalf("after a capture escalation: %+v", r.Attempts[0])
	}
	h = load(t)
	h.host.Refuse[api.IntegrateCapability+"/integration"] = "correction-required"
	r = h.result(h.invoke("op-1", h.input("")))
	if string(r.Integration) != "null" || h.host.CountRepair(api.SnapshotCapability) != 0 {
		t.Fatal("after an integrate escalation the snapshot was taken")
	}
	h = load(t)
	h.host.Refuse[api.WorkbenchCapability+"/close"] = "record-conflict"
	r = h.result(h.invoke("op-1", h.input("")))
	if string(r.Closure) != "null" || string(r.Audit) == "null" || string(r.Integration) == "null" {
		t.Fatalf("after a close escalation: %s", r.Closure)
	}
}

func TestRecoveryRequiredFromAServiceStaysRecoveryRequired(t *testing.T) {
	h := load(t)
	h.host.Recover[api.SnapshotCapability+"/post-integration"] = true
	env := h.invoke("op-1", h.input(""))
	if env.Domain.Status != "recovery-required" || code(env) != "host.recovery-required" || string(env.Domain.Result) != "null" || len(env.HostEvidence) != 3 {
		t.Fatalf("envelope %+v", env)
	}
	if h.host.CountRepair(api.WorkbenchCapability) != 0 {
		t.Fatal("the workbench was read after an unknown snapshot")
	}
}

func TestAuditThatDoesNotPassEscalatesBeforeClose(t *testing.T) {
	h := load(t)
	h.host.Models["state-auditor"] = fixture.AuditFailed
	env := h.invoke("op-1", h.input(""))
	r := h.result(env)
	if env.Domain.Status != "escalated" || code(env) != "audit.failed" || stoppedAt(r) != "audit" || string(r.Audit) == "null" || string(r.Closure) != "null" {
		t.Fatalf("envelope %+v", env)
	}
	for _, c := range h.host.Calls {
		if c.Slot == "close" {
			t.Fatal("close was called after a failed audit")
		}
	}
}

func TestInvalidInvocationsAreRefusedBeforeAnyHostCall(t *testing.T) {
	h := load(t)
	valid := string(h.input(""))
	short := h.runs
	short.Attempts = short.Attempts[:1]
	long := h.runs
	long.Attempts = append(append([][2]string(nil), long.Attempts...), [2]string{"run-impl-2", "run-review-2"})
	duplicate := h.runs
	duplicate.Attempts = [][2]string{{"run-impl-0", "run-review-0"}, {"run-impl-0", "run-review-1"}}
	reused := h.runs
	reused.Auditor = reused.Explorer
	cases := map[string]struct {
		input json.RawMessage
		code  string
	}{
		"attempt map short of the bound":  {fixture.RepairInvocation(t, workflowID, short, ""), "invocation.invalid"},
		"attempt map past the bound":      {fixture.RepairInvocation(t, workflowID, long, ""), "invocation.invalid"},
		"implementer run id twice":        {fixture.RepairInvocation(t, workflowID, duplicate, ""), "runs.invalid"},
		"explorer run reused as auditor":  {fixture.RepairInvocation(t, workflowID, reused, ""), "runs.invalid"},
		"write path outside the context":  {json.RawMessage(strings.Replace(valid, `"write_paths":["pkg/a"]`, `"write_paths":["pkg/c"]`, 1)), "invocation.invalid"},
		"check named twice":               {json.RawMessage(strings.Replace(valid, `"checks":[`, `"checks":[{"name":"test","argv":["go","vet"],"required":true,"baseline_failure":false},`, 1)), "invocation.invalid"},
		"unknown member":                  {json.RawMessage(strings.Replace(valid, `"workflow_id"`, `"mode":"x","workflow_id"`, 1)), "invocation.invalid"},
		"null member":                     {json.RawMessage(strings.Replace(valid, `"task_sha256":"`, `"task_sha256":null,"x":"`, 1)), "invocation.invalid"},
		"workflow id off the pattern":     {json.RawMessage(strings.Replace(valid, `"workflow_id":"wf-1"`, `"workflow_id":"wf 1"`, 1)), "invocation.invalid"},
		"record path without .json":       {json.RawMessage(strings.Replace(valid, `.record.json"`, `.record.md"`, 1)), "invocation.invalid"},
		"record path with a colon":        {json.RawMessage(strings.Replace(valid, `"issues/`, `"issues:/`, 1)), "invocation.invalid"},
		"empty audit_ref":                 {json.RawMessage(strings.Replace(valid, `"workflow_id"`, `"audit_ref":"","workflow_id"`, 1)), "invocation.invalid"},
		"duplicate key":                   {json.RawMessage(strings.Replace(valid, `"workflow_id"`, `"workflow_id":"a","workflow_id"`, 1)), "invocation.invalid"},
		"not an object":                   {json.RawMessage(`[]`), "invocation.invalid"},
		"findings limit above the bound":  {json.RawMessage(strings.Replace(valid, `"findings_limit":4`, `"findings_limit":5`, 1)), "invocation.invalid"},
		"base revision not a commit":      {json.RawMessage(strings.Replace(valid, fixture.BaseRevision, "HEAD", 1)), "invocation.invalid"},
	}
	for name, tc := range cases {
		env := h.invoke("op", tc.input)
		if env.Domain.Status != "refused" || code(env) != tc.code || env.HostEvidence != nil || string(env.Domain.Result) != "null" {
			t.Errorf("%s: %+v", name, env)
		}
	}
	env := h.invoke("op", json.RawMessage(strings.Replace(valid, `"attempts":[`, `"attempts":[{"code-implementer":"run-impl-0","reviewer":"run-review-0"},`, 1)))
	if env.Domain.Status != "refused" || code(env) != "invocation.invalid" {
		t.Errorf("three attempts: %+v", env)
	}
	out, err := h.handler(context.Background(), api.Invocation{OperationID: "op", Capability: "fusion.other.v1", Input: h.input("")}, h.host.Caller())
	if err != nil || !strings.Contains(string(out), `"invocation.capability"`) {
		t.Errorf("unknown capability: %s %v", out, err)
	}
	if len(h.host.Calls) != 0 || len(h.host.Host.Calls) != 0 {
		t.Fatalf("a refused invocation reached the host: %+v %+v", h.host.Calls, h.host.Host.Calls)
	}
}

func TestARestartReplaysCompletedReceiptsWithoutEffects(t *testing.T) {
	h := load(t)
	first := h.invoke("op-1", h.input(""))
	if first.Domain.Status != "completed" {
		t.Fatalf("first %+v", first)
	}
	effects := h.effects()
	calls := len(h.host.Calls)
	second := h.invoke("op-2", h.input(""))
	if second.Domain.Status != "completed" || h.host.ModelCalls != 4 {
		t.Fatalf("second %+v, model calls %d", second, h.host.ModelCalls)
	}
	for key, n := range h.effects() {
		if n != effects[key] {
			t.Fatalf("effect %s ran again: %d, was %d", key, n, effects[key])
		}
	}
	if len(h.host.Calls) <= calls {
		t.Fatal("the restart made no host call")
	}
	a, _ := json.Marshal(first)
	b, _ := json.Marshal(second)
	if string(a) != string(b) {
		t.Fatalf("the restart answered differently:\n%s\n%s", a, b)
	}
	// Every replayed request carried the same frozen bytes under the same
	// operation id: a differing one would have been a conflict.
	seen := map[string]string{}
	for _, c := range h.host.Calls {
		if prior, ok := seen[c.OperationID]; ok && prior != string(c.Input) {
			t.Fatalf("operation %s sent two request bodies", c.OperationID)
		}
		seen[c.OperationID] = string(c.Input)
	}
}

// losing wraps a caller and loses the reply of one role run after the host
// performed it, as a crash between the model's effect and the module's
// read would.
type losing struct {
	base  api.HostCaller
	runID string
	lost  bool
}

func (l *losing) CallHost(ctx context.Context, inv api.Invocation) (json.RawMessage, error) {
	out, err := l.base.CallHost(ctx, inv)
	if inv.Capability == api.RoleRunCapability && !l.lost {
		var call api.RoleCall
		if api.Decode(inv.Input, &call) == nil && call.RunID == l.runID {
			l.lost = true
			return nil, api.ErrOutcomeUnknown
		}
	}
	return out, err
}

func TestALostReplyIsAnErrorAndTheRestartCompletesTheAnsweredRun(t *testing.T) {
	h := load(t)
	// The host's recovery record names the implementer run: its completion
	// needs the reference, and a reference on any other run's completion is
	// refused.
	h.host.RequireAudit, h.host.RequireAuditRun = "audit:recovery-1", "run-impl-0"
	if _, err := h.invokeWith(&losing{base: h.host.Caller(), runID: "run-impl-0"}, "op-1", h.input("")); !errors.Is(err, api.ErrOutcomeUnknown) {
		t.Fatalf("the lost reply was answered: %v", err)
	}
	if run := h.host.Runs["run-impl-0"]; run == nil || run.State != "answered" || h.host.ModelCalls != 2 {
		t.Fatalf("the host did not persist the answer: %+v", h.host.Runs["run-impl-0"])
	}
	// Without the recorded audit, the answered run cannot settle: the
	// evidence carries it as answered, nothing after it runs.
	env := h.invoke("op-2", h.input(""))
	if env.Domain.Status != "recovery-required" || code(env) != "host.recovery-required" || evidenceLine(env) != "explore[-]:run-explore:settled implement[i]:run-impl-0:answered" {
		t.Fatalf("envelope %+v, evidence %s", env, evidenceLine(env))
	}
	// With it, the run settles under the reference on its completion
	// alone, and the workflow runs to close with no second model call for
	// that run.
	env = h.invoke("op-3", h.input("audit:recovery-1"))
	if env.Domain.Status != "completed" || h.host.ModelCalls != 4 {
		t.Fatalf("envelope %+v, model calls %d", env, h.host.ModelCalls)
	}
	var audited []string
	for _, c := range h.host.Host.Calls {
		if c.Call.AuditRef != "" {
			audited = append(audited, c.Capability+"="+c.Call.RunID+"="+c.Call.AuditRef)
		}
	}
	if strings.Join(audited, " ") != "host.role.complete.v1=run-impl-0=audit:recovery-1" {
		t.Fatalf("audit references sent: %v", audited)
	}
	if h.host.Effects[api.WorkspaceCapability+"/run-impl-0"] != 1 {
		t.Fatal("the restart provisioned a second workspace")
	}
}

func TestAnAcceptedRunIsRecoveryRequiredAndNeverRerun(t *testing.T) {
	h := load(t)
	// A first process composed the implementer and lost the run's reply
	// before the host had an answer.
	losingAll := &losing{base: h.host.Caller(), runID: "run-impl-0"}
	if _, err := h.invokeWith(losingAll, "op-1", h.input("")); err == nil {
		t.Fatal("the lost reply was answered")
	}
	h.host.SeedRole("run-impl-0", "code-implementer", "accepted", h.host.Composed("run-impl-0"), nil)
	calls := len(h.host.Host.Calls)
	env := h.invoke("op-2", h.input(""))
	if env.Domain.Status != "recovery-required" || code(env) != "role.accepted" || evidenceLine(env) != "explore[-]:run-explore:settled" || string(env.Domain.Result) != "null" {
		t.Fatalf("envelope %+v, evidence %s", env, evidenceLine(env))
	}
	for _, c := range h.host.Host.Calls[calls:] {
		if c.Call.RunID == "run-impl-0" && c.Capability != api.RoleReadCapability {
			t.Fatalf("the accepted run was acted on: %+v", c)
		}
	}
}

func TestPagedWorkbenchReadReachesTheAuditor(t *testing.T) {
	h := load(t)
	h.host.PageBytes = 40
	env := h.invoke("op-1", h.input(""))
	if env.Domain.Status != "completed" {
		t.Fatalf("envelope %+v", env)
	}
	pages := 0
	for _, c := range h.host.Calls {
		if strings.HasPrefix(c.Slot, "page:") {
			pages++
		}
	}
	if pages < 2 {
		t.Fatalf("%d page calls", pages)
	}
	var audit struct {
		Workbench         json.RawMessage
		WorkbenchRevision string `json:"workbench_revision"`
	}
	mustDecode(t, h.host.Composed("run-audit"), &audit)
	want, _ := steps.Parse(h.host.Record)
	got, _ := steps.Parse(audit.Workbench)
	if !steps.Equal(got, want) || audit.WorkbenchRevision != "7" {
		t.Fatalf("the auditor got %s", audit.Workbench)
	}
}

func TestPagedCloseIsAssembled(t *testing.T) {
	h := load(t)
	h.host.ClosePaged = true
	h.host.PageBytes = 16
	env := h.invoke("op-1", h.input(""))
	r := h.result(env)
	var closure struct{ After string }
	if env.Domain.Status != "completed" || json.Unmarshal(r.Closure, &closure) != nil || closure.After != "8" {
		t.Fatalf("envelope %+v, closure %s", env, r.Closure)
	}
}

func TestASharedPrincipalIsRefused(t *testing.T) {
	h := load(t)
	h.host.Principal = func(string, string) string { return "principal:one" }
	env := h.invoke("op-1", h.input(""))
	if env.Domain.Status != "refused" || code(env) != "principal.shared" || h.host.CountRepair(api.IntegrateCapability) != 0 {
		t.Fatalf("envelope %+v", env)
	}
}

func TestAWrongBindingEchoIsRefused(t *testing.T) {
	h := load(t)
	h.host.Models["reviewer"] = fixture.ReviewWrongBinding
	env := h.invoke("op-1", h.input(""))
	if env.Domain.Status != "refused" || code(env) != "review.binding" || h.host.CountRepair(api.IntegrateCapability) != 0 {
		t.Fatalf("envelope %+v", env)
	}
}

func TestFindingsAboveTheLimitAreRefused(t *testing.T) {
	h := load(t)
	h.host.Models["explorer"] = func(string, json.RawMessage) json.RawMessage { return fixture.Answer(5) }
	env := h.invoke("op-1", h.input(""))
	if env.Domain.Status != "refused" || code(env) != "findings.limit" || h.host.CountRepair(api.WorkspaceCapability) != 0 {
		t.Fatalf("envelope %+v", env)
	}
}

func TestASchemaInvalidAnswerIsRefusedWithTheEvidenceKept(t *testing.T) {
	h := load(t)
	h.host.Models["code-implementer"] = func(string, json.RawMessage) json.RawMessage {
		return json.RawMessage(`{"files_changed":[],"verification":[],"result":"done"}`)
	}
	env := h.invoke("op-1", h.input(""))
	if env.Domain.Status != "refused" || code(env) != "result.invalid" || evidenceLine(env) != "explore[-]:run-explore:settled implement[i]:run-impl-0:settled" {
		t.Fatalf("envelope %+v", env)
	}
}

func TestAFrozenInputTheModuleDidNotComposeIsRefused(t *testing.T) {
	h := load(t)
	// The host freezes a schema-valid input whose findings limit is not the
	// task's, with a digest that covers it: the module forwards only what
	// it composed.
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
		reply.Result.RoleInput = json.RawMessage(strings.Replace(string(reply.Result.RoleInput), `"findings_limit":4`, `"findings_limit":3`, 1))
		reply.Result.RoleInputSHA256 = "sha256:" + fixture.Sha256Hex(reply.Result.RoleInput)
		return json.Marshal(reply)
	})
	env, err := h.invokeWith(tampered, "op-1", h.input(""))
	if err != nil || env.Domain.Status != "refused" || code(env) != "role_input.invalid" || len(h.host.Host.Calls) != 0 {
		t.Fatalf("envelope %+v, %v, role calls %d", env, err, len(h.host.Host.Calls))
	}
}

type callerFunc func(context.Context, api.Invocation) (json.RawMessage, error)

func (f callerFunc) CallHost(ctx context.Context, inv api.Invocation) (json.RawMessage, error) {
	return f(ctx, inv)
}

func TestAnOversizeRoleInputIsRefusedBeforeAnyRoleCall(t *testing.T) {
	h := load(t)
	h.host.ContextText = strings.Repeat("c", api.DefaultMaxFrame)
	env := h.invoke("op-1", h.input(""))
	if env.Domain.Status != "refused" || code(env) != "frame.oversize" || len(h.host.Host.Calls) != 0 || h.host.ModelCalls != 0 {
		t.Fatalf("envelope %+v, role calls %d", env, len(h.host.Host.Calls))
	}
}

// The handler behind the SDK server, over pipes, against the SDK client with
// the nine fake services offered: every host call framed as Prior frames it.
func TestServeOverPipes(t *testing.T) {
	h := load(t)
	secret := make([]byte, 32)
	if _, err := rand.Read(secret); err != nil {
		t.Fatal(err)
	}
	server := api.Server{Identity: fixture.Identity, Secret: secret, Workflows: map[string]api.WorkflowHandler{h.def.Capability: h.def.Handler(fixture.Identity, RemoteRoles(fixture.Identity))}}
	hostReads, moduleWrites := io.Pipe()
	moduleReads, hostWrites := io.Pipe()
	served := make(chan error, 1)
	go func() { served <- server.Serve(context.Background(), moduleReads, moduleWrites) }()
	conn := duplex{hostReads, hostWrites}
	client, err := api.ConnectWithServices(context.Background(), conn, fixture.Identity, secret, []string{"fusion.repair.v1"}, h.host.Services())
	if err != nil {
		t.Fatal(err)
	}
	out, err := client.Invoke(context.Background(), api.Invocation{OperationID: "op-1", Capability: "fusion.repair.v1", Input: h.input("")})
	if err != nil {
		t.Fatal(err)
	}
	var env Envelope
	if err := api.Decode(out, &env); err != nil {
		t.Fatal(err)
	}
	if env.Domain.Status != "completed" || h.host.ModelCalls != 4 || len(env.HostEvidence) != 4 {
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
