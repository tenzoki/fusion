package conformance

// The repair cases of plan step 18, each its own test, against the process
// started from the extracted bundle (see host_test.go for what that is and
// is not): the fake host of internal/fixture serves the three role services
// and the six repair services of Prior's answer 69, with its records read
// from adapters/prior/testdata/repair-fixture, a toy repository the test
// initialises as a Git repository under a temporary directory, so that the
// task's base_revision is a real commit and no .git enters fusion's tree.
// No missing-service case: that preflight is Prior's (67.6).

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/fixture"
	"github.com/kai/prior/integrationbuild/fusionmodule/internal/steps"
	api "github.com/kai/prior/moduleapi/v1"
)

// RepairCapability is the second workflow the bundle advertises.
const RepairCapability = "fusion.repair.v1"

// frozenAt is the commit whose explorer schemas the installed ones must
// equal byte for byte (plan step 9's contract, kept under step 15's freeze).
const frozenAt = "d52223a9"

// repairWorkflowID is the host-minted workflow identity every case uses.
const repairWorkflowID = "wf-conformance-18"

var commitPattern = regexp.MustCompile(`^[0-9a-f]{40}$`)

// repairFixture is the toy repository and its workbench records, loaded
// from adapters/prior/testdata/repair-fixture and committed under a
// temporary directory.
type repairFixture struct {
	// base is HEAD of the committed copy, the task's base_revision.
	base string
	// task is the compact task object in the request schema's key order.
	task json.RawMessage
	// record is the workbench object the fake host serves for the package:
	// its control file and its narrative. revision is sha256 over the
	// control file's bytes, the codec's revision of a record.
	record     json.RawMessage
	recordPath string
	revision   string
	// context is the repository's CLAUDE.md, the host's project_context.
	context string
	// checks are the task's check names, in order.
	checks []string
}

const fixturePackage = "work-packages/261012-1200-one-failing-test"

// loadRepairFixture copies testdata/repair-fixture/repo under t.TempDir(),
// commits it there with a fixed identity and date, and reads the task and
// the records. The fixture is located through FUSION_CATALOG_DIR, which
// stage.sh exports: the fusion tree is that directory's parent.
func loadRepairFixture(t *testing.T) *repairFixture {
	t.Helper()
	root := filepath.Join(filepath.Dir(fixture.CatalogDir(t)), "adapters", "prior", "testdata", "repair-fixture")
	repo := filepath.Join(t.TempDir(), "repo")
	copyTree(t, filepath.Join(root, "repo"), repo)
	git := func(args ...string) string {
		cmd := exec.Command("git", append([]string{"-C", repo, "-c", "commit.gpgsign=false"}, args...)...)
		cmd.Env = append(os.Environ(),
			"GIT_CONFIG_NOSYSTEM=1", "GIT_CONFIG_GLOBAL=/dev/null",
			"GIT_AUTHOR_NAME=Toy Owner", "GIT_AUTHOR_EMAIL=owner@toy.example",
			"GIT_COMMITTER_NAME=Toy Owner", "GIT_COMMITTER_EMAIL=owner@toy.example",
			"GIT_AUTHOR_DATE=2026-10-12T12:00:00Z", "GIT_COMMITTER_DATE=2026-10-12T12:00:00Z")
		out, err := cmd.CombinedOutput()
		if err != nil {
			t.Fatalf("git %s: %v: %s", strings.Join(args, " "), err, out)
		}
		return strings.TrimSpace(string(out))
	}
	git("init", "-q", "-b", "main")
	git("add", "-A")
	git("commit", "-q", "-m", "toy repository with one failing test")
	f := &repairFixture{base: git("rev-parse", "HEAD"), recordPath: fixturePackage + "/package.json"}
	if !commitPattern.MatchString(f.base) {
		t.Fatalf("HEAD of the committed fixture is %q", f.base)
	}
	var task struct {
		Summary       string          `json:"summary"`
		Criteria      []string        `json:"criteria"`
		ContextPaths  []string        `json:"context_paths"`
		WritePaths    []string        `json:"write_paths"`
		Checks        json.RawMessage `json:"checks"`
		BaseRevision  string          `json:"base_revision"`
		FindingsLimit int             `json:"findings_limit"`
	}
	if err := json.Unmarshal(readFixture(t, root, "task.json"), &task); err != nil {
		t.Fatalf("task.json: %v", err)
	}
	task.BaseRevision = f.base
	body, err := json.Marshal(task)
	if err != nil {
		t.Fatal(err)
	}
	f.task = body
	var checks []struct {
		Name string `json:"name"`
	}
	if err := json.Unmarshal(task.Checks, &checks); err != nil || len(checks) == 0 {
		t.Fatalf("task.json checks: %v", err)
	}
	for _, c := range checks {
		f.checks = append(f.checks, c.Name)
	}
	// Record paths are workbench-relative, as the codec names them.
	workbench := filepath.Join(repo, "fusion-workbench")
	control := readFixture(t, workbench, f.recordPath)
	narrative := readFixture(t, workbench, fixturePackage+"/261012-1200-one-failing-test.md")
	var compact bytes.Buffer
	if err := json.Compact(&compact, control); err != nil {
		t.Fatalf("package.json: %v", err)
	}
	if f.record, err = json.Marshal(map[string]json.RawMessage{"control": compact.Bytes(), "narrative": mustMarshal(t, string(narrative))}); err != nil {
		t.Fatal(err)
	}
	f.revision = "sha256:" + fixture.Sha256Hex(control)
	f.context = string(readFixture(t, repo, "CLAUDE.md"))
	return f
}

func readFixture(t *testing.T, root, rel string) []byte {
	t.Helper()
	body, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(rel)))
	if err != nil {
		t.Fatal(err)
	}
	return body
}

func mustMarshal(t *testing.T, v any) json.RawMessage {
	t.Helper()
	body, err := json.Marshal(v)
	if err != nil {
		t.Fatal(err)
	}
	return body
}

// copyTree copies the regular files under from to to, creating directories.
func copyTree(t *testing.T, from, to string) {
	t.Helper()
	err := filepath.WalkDir(from, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		rel, err := filepath.Rel(from, path)
		if err != nil {
			return err
		}
		target := filepath.Join(to, rel)
		if d.IsDir() {
			return os.MkdirAll(target, 0o755)
		}
		if !d.Type().IsRegular() {
			return errors.New(path + " is not a regular file")
		}
		body, err := os.ReadFile(path)
		if err != nil {
			return err
		}
		return os.WriteFile(target, body, 0o644)
	})
	if err != nil {
		t.Fatalf("copy %s: %v", from, err)
	}
}

// host is a fake host bound to this fixture: the installed payload's
// result schemas as output contracts, the fixture's task, base, record and
// project context, the package as the record the repair closes.
func (f *repairFixture) host(t *testing.T, b *bundle) *fixture.RepairHost {
	t.Helper()
	h := fixture.NewRepairHostFromPayload(t, b.dir, repairWorkflowID, fixture.DefaultRuns())
	h.Task = f.task
	h.Base = f.base
	h.RecordPath = f.recordPath
	h.RecordKind = "package"
	h.Record = f.record
	h.Revision = f.revision
	h.ContextText = f.context
	return h
}

// connectRepair is connect for the repair capability over the repair host's
// nine services (or the given ones).
func connectRepair(t *testing.T, b *bundle, host *fixture.RepairHost, services map[string]api.Handler) *session {
	t.Helper()
	if services == nil {
		services = host.Services()
	}
	s, err := tryConnect(t, b, host.Host, services, []string{RepairCapability})
	if err != nil {
		t.Fatalf("handshake: %v; module stderr: %q", err, s.proc.stderr.String())
	}
	return s
}

// repairEnvelope is the wire shape of schemas/repair-result.v1.json,
// decoded strictly.
type repairEnvelope struct {
	Domain struct {
		Status     string          `json:"status"`
		Result     json.RawMessage `json:"result"`
		Violations []struct {
			Code   string `json:"code"`
			Detail string `json:"detail"`
		} `json:"violations"`
	} `json:"domain"`
	HostEvidence []struct {
		Step        string    `json:"step"`
		Attempt     *int      `json:"attempt"`
		RunID       string    `json:"run_id"`
		PrincipalID string    `json:"principal_id"`
		ObservedAt  time.Time `json:"observed_at"`
		RoleState   string    `json:"role_state"`
	} `json:"host_evidence"`
}

func (e repairEnvelope) code() string {
	if len(e.Domain.Violations) == 0 {
		return ""
	}
	return e.Domain.Violations[0].Code
}

// evidence renders host_evidence as "step[attempt]:run:state" entries, the
// attempt as one i per index plus one, "-" for none.
func (e repairEnvelope) evidence() string {
	var parts []string
	for _, entry := range e.HostEvidence {
		attempt := "-"
		if entry.Attempt != nil {
			attempt = strings.Repeat("i", *entry.Attempt+1)
		}
		parts = append(parts, entry.Step+"["+attempt+"]:"+entry.RunID+":"+entry.RoleState)
	}
	return strings.Join(parts, " ")
}

// repairResult is the result member of a completed or escalated envelope.
type repairResult struct {
	Exploration json.RawMessage `json:"exploration"`
	Attempts    []struct {
		Attempt        int             `json:"attempt"`
		Implementation json.RawMessage `json:"implementation"`
		Capture        json.RawMessage `json:"capture"`
		Review         json.RawMessage `json:"review"`
	} `json:"attempts"`
	Integration json.RawMessage `json:"integration"`
	Audit       json.RawMessage `json:"audit"`
	Closure     json.RawMessage `json:"closure"`
	StoppedAt   *string         `json:"stopped_at"`
}

func (e repairEnvelope) result(t *testing.T) repairResult {
	t.Helper()
	var r repairResult
	if err := api.Decode(e.Domain.Result, &r); err != nil {
		t.Fatalf("result %s: %v", e.Domain.Result, err)
	}
	return r
}

// invokeRepair sends one repair invocation and decodes the envelope,
// returning the bytes as well.
func (s *session) invokeRepair(operationID string, input json.RawMessage) (repairEnvelope, json.RawMessage, error) {
	s.t.Helper()
	var env repairEnvelope
	out, err := s.client.Invoke(s.ctx, api.Invocation{OperationID: operationID, Capability: RepairCapability, Input: input})
	if err != nil {
		return env, nil, err
	}
	if err := api.Decode(out, &env); err != nil {
		return env, out, errors.Join(err, errors.New("envelope: "+string(out)))
	}
	return env, out, nil
}

func (s *session) mustInvokeRepair(operationID string, input json.RawMessage) (repairEnvelope, json.RawMessage) {
	s.t.Helper()
	env, out, err := s.invokeRepair(operationID, input)
	if err != nil {
		s.t.Fatalf("invoke %s: %v; module stderr: %q", operationID, err, s.proc.stderr.String())
	}
	return env, out
}

// composed decodes the frozen role input of a run into target.
func composed(t *testing.T, host *fixture.RepairHost, runID string, target any) {
	t.Helper()
	body := host.Composed(runID)
	if body == nil {
		t.Fatalf("%s was never composed", runID)
	}
	if err := json.Unmarshal(body, target); err != nil {
		t.Fatalf("%s role input %s: %v", runID, body, err)
	}
}

func TestReviewedRepairRunsToAuditedClose(t *testing.T) {
	b := openBundle(t)
	f := loadRepairFixture(t)
	host := f.host(t, b)
	// The record is read in more than one page.
	host.PageBytes = 96
	s := connectRepair(t, b, host, nil)
	defer s.close()
	env, _ := s.mustInvokeRepair("op-1", host.Invocation(t, ""))
	if env.Domain.Status != "completed" || len(env.Domain.Violations) != 0 {
		t.Fatalf("envelope %+v; module stderr %q", env, s.proc.stderr.String())
	}
	if got := env.evidence(); got != "explore[-]:run-explore:settled implement[i]:run-impl-0:settled review[i]:run-review-0:settled audit[-]:run-audit:settled" {
		t.Fatalf("evidence %s", got)
	}
	for _, e := range env.HostEvidence {
		stored := host.Runs[e.RunID].Answer
		if e.PrincipalID != stored.PrincipalID || !e.ObservedAt.Equal(stored.ObservedAt) {
			t.Fatalf("evidence %+v is not copied from the stored answer %+v", e, stored)
		}
	}
	r := env.result(t)
	if r.StoppedAt != nil || len(r.Attempts) != 1 || r.Attempts[0].Attempt != 0 || string(r.Exploration) != string(fixture.Answer(1)) {
		t.Fatalf("result %s", env.Domain.Result)
	}
	// The implementer reported done with every check run to exit 0.
	var implementation struct {
		Result       string `json:"result"`
		Verification []struct {
			Check    string `json:"check"`
			Status   string `json:"status"`
			ExitCode int    `json:"exit_code"`
		} `json:"verification"`
	}
	if err := json.Unmarshal(r.Attempts[0].Implementation, &implementation); err != nil || implementation.Result != "done" || len(implementation.Verification) != len(f.checks) {
		t.Fatalf("implementation %s: %v", r.Attempts[0].Implementation, err)
	}
	for i, v := range implementation.Verification {
		if v.Check != f.checks[i] || v.Status != "exit" || v.ExitCode != 0 {
			t.Fatalf("verification %+v", v)
		}
	}
	var review struct {
		Decision string `json:"decision"`
		PlanHash string `json:"plan_hash"`
	}
	if err := json.Unmarshal(r.Attempts[0].Review, &review); err != nil || review.Decision != "accept" || review.PlanHash != "sha256:"+fixture.Sha256Hex(f.task) {
		t.Fatalf("review %s", r.Attempts[0].Review)
	}
	// The integration is projected to the three members, from a receipt of
	// thirteen that the auditor received whole.
	var integration map[string]string
	if err := json.Unmarshal(r.Integration, &integration); err != nil || len(integration) != 3 || integration["tree"] != "tree:run-impl-0" || integration["reference"] != "refs/prior/accepted/fusion-repair" || integration["commit"] != fixture.Sha256Hex([]byte("tree:run-impl-0")) {
		t.Fatalf("integration %s", r.Integration)
	}
	var audit struct {
		Integration       map[string]json.RawMessage `json:"integration"`
		Workbench         json.RawMessage            `json:"workbench"`
		WorkbenchRevision string                     `json:"workbench_revision"`
		Runtime           map[string]json.RawMessage `json:"runtime"`
		Since             string                     `json:"since"`
		ProposedOutcome   string                     `json:"proposed_outcome"`
	}
	composed(t, host, "run-audit", &audit)
	if len(audit.Integration) != 13 || len(audit.Runtime) != 11 || audit.Since != f.base || audit.ProposedOutcome != "completed" || audit.WorkbenchRevision != f.revision {
		t.Fatalf("audit task: %d integration members, %d runtime members, since %s, revision %s", len(audit.Integration), len(audit.Runtime), audit.Since, audit.WorkbenchRevision)
	}
	if string(audit.Integration["base"]) != `"`+f.base+`"` || string(audit.Integration["record_name"]) != `"`+f.recordPath+`"` {
		t.Fatalf("integration receipt base %s, record %s", audit.Integration["base"], audit.Integration["record_name"])
	}
	want, _ := steps.Parse(f.record)
	got, err := steps.Parse(audit.Workbench)
	if err != nil || !steps.Equal(got, want) {
		t.Fatalf("the auditor's workbench record is not the fixture's: %s", audit.Workbench)
	}
	pages := 0
	for _, c := range host.Calls {
		if strings.HasPrefix(c.Slot, "page:") {
			pages++
		}
	}
	if pages < 2 {
		t.Fatalf("the record was read in %d page calls", pages+1)
	}
	var closure struct {
		Record     string `json:"record"`
		Before     string `json:"before"`
		After      string `json:"after"`
		Reconciled bool   `json:"reconciled"`
	}
	if err := json.Unmarshal(r.Closure, &closure); err != nil || closure.Record != f.recordPath || closure.Before != f.revision || closure.After == f.revision || !closure.Reconciled {
		t.Fatalf("closure %s", r.Closure)
	}
	// Every repair request carried the operation id of its slot and the
	// bundle's identity; every role call forwarded the frozen bytes.
	for _, c := range host.Calls {
		if c.OperationID != api.RepairOperationID(c.Capability, repairWorkflowID, c.Slot) {
			t.Fatalf("call %s %s under operation %s", c.Capability, c.Slot, c.OperationID)
		}
		call, slot, err := api.DecodeRepairCall(api.Invocation{OperationID: c.OperationID, Capability: c.Capability, Input: c.Input})
		if err != nil || slot != c.Slot || call.Identity != b.identity || call.WorkflowID != repairWorkflowID {
			t.Fatalf("call %s %s: %v", c.Capability, c.Slot, err)
		}
	}
	for _, c := range host.Host.Calls {
		if c.Call.Identity != b.identity || string(c.Call.Input) != string(host.Composed(c.Call.RunID)) {
			t.Fatalf("%s %s did not forward the frozen input under the bundle's identity", c.Capability, c.Call.RunID)
		}
		if c.Call.RunID == "run-impl-1" || c.Call.RunID == "run-review-1" {
			t.Fatalf("the second pair was dispatched: %+v", c)
		}
	}
	if host.ModelCalls != 4 || host.Runs["run-impl-1"] != nil || host.Runs["run-review-1"] != nil || host.Effects[api.WorkspaceCapability+"/run-impl-1"] != 0 {
		t.Fatalf("%d model calls, runs %v", host.ModelCalls, host.Runs)
	}
	for key, n := range map[string]int{api.WorkspaceCapability + "/run-impl-0": 1, api.CaptureCapability + "/run-impl-0": 1, api.IntegrateCapability + "/integration": 1, api.SnapshotCapability + "/post-integration": 1, api.WorkbenchCapability + "/record": 1, api.WorkbenchCapability + "/close": 1} {
		if host.Effects[key] != n {
			t.Fatalf("effects %v", host.Effects)
		}
	}
	if stderr := s.proc.stderr.String(); stderr != "" {
		t.Fatalf("the module wrote to stderr during a clean repair: %q", stderr)
	}
}

func TestReviseWithinTheBoundThenEscalate(t *testing.T) {
	b := openBundle(t)
	f := loadRepairFixture(t)
	host := f.host(t, b)
	host.Models["reviewer"] = func(runID string, input json.RawMessage) json.RawMessage {
		if runID == "run-review-0" {
			return fixture.Review("revise", "TestDouble still fails")(runID, input)
		}
		return fixture.Review("escalate", "the fix needs a design decision on pkg/b")(runID, input)
	}
	s := connectRepair(t, b, host, nil)
	defer s.close()
	env, _ := s.mustInvokeRepair("op-1", host.Invocation(t, ""))
	r := env.result(t)
	if env.Domain.Status != "escalated" || env.code() != "review.escalate" || r.StoppedAt == nil || *r.StoppedAt != "review" || env.Domain.Violations[0].Detail != "the fix needs a design decision on pkg/b" {
		t.Fatalf("envelope %+v", env)
	}
	if got := env.evidence(); got != "explore[-]:run-explore:settled implement[i]:run-impl-0:settled review[i]:run-review-0:settled implement[ii]:run-impl-1:settled review[ii]:run-review-1:settled" {
		t.Fatalf("evidence %s", got)
	}
	if len(r.Attempts) != 2 || r.Attempts[0].Attempt != 0 || r.Attempts[1].Attempt != 1 || string(r.Integration) != "null" || string(r.Audit) != "null" || string(r.Closure) != "null" {
		t.Fatalf("result %s", env.Domain.Result)
	}
	decisions := []string{}
	for _, a := range r.Attempts {
		var review struct {
			Decision string `json:"decision"`
		}
		if err := json.Unmarshal(a.Review, &review); err != nil {
			t.Fatalf("review %s", a.Review)
		}
		decisions = append(decisions, review.Decision)
	}
	if strings.Join(decisions, " ") != "revise escalate" {
		t.Fatalf("decisions %v", decisions)
	}
	// Attempt 1 ran on the second pair with the exact prior review in its
	// task.
	var second struct {
		Attempt struct {
			Index          int             `json:"index"`
			PreviousReview json.RawMessage `json:"previous_review"`
		} `json:"attempt"`
		Workspace struct {
			Root string `json:"root"`
		} `json:"workspace"`
	}
	composed(t, host, "run-impl-1", &second)
	previous, _ := steps.Parse(second.Attempt.PreviousReview)
	first, _ := steps.Parse(r.Attempts[0].Review)
	if second.Attempt.Index != 1 || !steps.Equal(previous, first) || second.Workspace.Root != "workspace:run-impl-1" {
		t.Fatalf("attempt 1 task %+v", second)
	}
	// Five runs modelled: the explorer and both pairs; the auditor never.
	if host.Effects[api.WorkspaceCapability+"/run-impl-0"] != 1 || host.Effects[api.WorkspaceCapability+"/run-impl-1"] != 1 || host.ModelCalls != 5 {
		t.Fatalf("effects %v, model calls %d", host.Effects, host.ModelCalls)
	}
	if host.CountRepair(api.IntegrateCapability) != 0 || host.CountRepair(api.SnapshotCapability) != 0 || host.Runs["run-audit"] != nil {
		t.Fatalf("a step after review ran: %+v", host.Calls)
	}
}

// boundary is one persisted step boundary: the host call after whose
// completed effect the process is killed, before the reply reaches it. A
// role call is named by its run id, a repair service call by its slot.
type boundary struct {
	name, capability, slot string
}

// slotOf is the slot a service call addresses: the run id of a role call,
// the slot DecodeRepairCall derives for a repair call.
func slotOf(capability string, inv api.Invocation) string {
	switch capability {
	case api.RoleReadCapability, api.RoleRunCapability, api.RoleCompleteCapability:
		var call api.RoleCall
		if api.Decode(inv.Input, &call) != nil {
			return ""
		}
		return call.RunID
	}
	_, slot, err := api.DecodeRepairCall(inv)
	if err != nil {
		return ""
	}
	return slot
}

// killingAt wraps the host's services so that the first call matching the
// boundary kills the process after the fake host has performed and
// journalled the effect: the host's record stands, the module's reply is
// lost. fired reports whether it happened.
func killingAt(host *fixture.RepairHost, at boundary, proc **session, fired *atomic.Bool) map[string]api.Handler {
	wrapped := map[string]api.Handler{}
	for capability, handler := range host.Services() {
		capability, handler := capability, handler
		wrapped[capability] = func(ctx context.Context, inv api.Invocation) (json.RawMessage, error) {
			out, err := handler(ctx, inv)
			if capability == at.capability && slotOf(capability, inv) == at.slot && fired.CompareAndSwap(false, true) {
				(*proc).proc.kill()
			}
			return out, err
		}
	}
	return wrapped
}

func TestKillAtEveryPersistedBoundaryThenResumeRunsNoModel(t *testing.T) {
	b := openBundle(t)
	f := loadRepairFixture(t)
	// The envelope a clean run answers; every resumed run must answer the
	// same bytes.
	reference := f.host(t, b)
	clean := connectRepair(t, b, reference, nil)
	env, want := clean.mustInvokeRepair("op-1", reference.Invocation(t, ""))
	clean.close()
	if env.Domain.Status != "completed" {
		t.Fatalf("the clean run did not complete: %+v", env)
	}
	boundaries := []boundary{
		{"after the explorer was composed", api.RoleComposeCapability, "run-explore"},
		{"after the explorer answered", api.RoleRunCapability, "run-explore"},
		{"after the explorer settled", api.RoleCompleteCapability, "run-explore"},
		{"after the workspace receipt", api.WorkspaceCapability, "run-impl-0"},
		{"after the implementer was composed", api.RoleComposeCapability, "run-impl-0"},
		{"after the implementer answered", api.RoleRunCapability, "run-impl-0"},
		{"after the implementer settled", api.RoleCompleteCapability, "run-impl-0"},
		{"after the capture receipt", api.CaptureCapability, "run-impl-0"},
		{"after the reviewer answered", api.RoleRunCapability, "run-review-0"},
		{"after the review settled", api.RoleCompleteCapability, "run-review-0"},
		{"after the integrate receipt", api.IntegrateCapability, "integration"},
		{"after the snapshot receipt", api.SnapshotCapability, "post-integration"},
		{"after the record was read", api.WorkbenchCapability, "record"},
		{"after the auditor answered", api.RoleRunCapability, "run-audit"},
		{"before close, the audit settled", api.RoleCompleteCapability, "run-audit"},
		{"after the close receipt", api.WorkbenchCapability, "close"},
	}
	for _, at := range boundaries {
		t.Run(at.name, func(t *testing.T) {
			host := f.host(t, b)
			var first *session
			var fired atomic.Bool
			first = connectRepair(t, b, host, killingAt(host, at, &first, &fired))
			if _, _, err := first.invokeRepair("op-1", host.Invocation(t, "")); err == nil {
				t.Fatal("the invocation of a killed process returned an envelope")
			}
			first.close()
			if !fired.Load() {
				t.Fatalf("the boundary never fired; calls %+v", host.Calls)
			}
			// What the host had performed before the kill: the resumed run
			// must add what is missing and repeat none of it. The fake host
			// models a run on absent alone, so a model count equal to the
			// clean run's is one model call per run.
			modelCalls := host.ModelCalls
			effects := map[string]int{}
			for key, n := range host.Effects {
				effects[key] = n
			}
			// At most one run stands at answered after a kill; its completion
			// takes the audit reference the host records for the recovery.
			var answered []string
			for runID, run := range host.Runs {
				if run.State == "answered" {
					answered = append(answered, runID)
				}
			}
			if len(answered) > 1 {
				t.Fatalf("%d runs at answered: %v", len(answered), answered)
			}
			auditRef := ""
			if len(answered) == 1 {
				auditRef = "audit:recovery-" + answered[0]
				host.RequireAudit, host.RequireAuditRun = auditRef, answered[0]
			}
			second := connectRepair(t, b, host, nil)
			defer second.close()
			env, got := second.mustInvokeRepair("op-2", host.Invocation(t, auditRef))
			if env.Domain.Status != "completed" || !bytes.Equal(got, want) {
				t.Fatalf("the resumed run answered\n%s\nwhere the clean run answered\n%s", got, want)
			}
			if host.ModelCalls != reference.ModelCalls || host.ModelCalls < modelCalls {
				t.Fatalf("model calls %d after the resume, %d before the kill, %d in the clean run", host.ModelCalls, modelCalls, reference.ModelCalls)
			}
			for key, n := range effects {
				if host.Effects[key] != n {
					t.Fatalf("effect %s ran again on resume: %d, %d before the kill", key, host.Effects[key], n)
				}
			}
			if len(host.Effects) != len(reference.Effects) {
				t.Fatalf("effects after the resume %v, in the clean run %v", host.Effects, reference.Effects)
			}
			for key, n := range reference.Effects {
				if host.Effects[key] != n || n != 1 {
					t.Fatalf("effect %s performed %d times after the resume, %d in the clean run", key, host.Effects[key], n)
				}
			}
			for _, key := range []string{api.WorkspaceCapability + "/run-impl-0", api.CaptureCapability + "/run-impl-0", api.IntegrateCapability + "/integration", api.WorkbenchCapability + "/close"} {
				if host.Effects[key] != 1 {
					t.Fatalf("%s performed %d times", key, host.Effects[key])
				}
			}
			if host.Effects[api.WorkspaceCapability+"/run-impl-1"] != 0 || host.Runs["run-impl-1"] != nil {
				t.Fatalf("the second pair was dispatched on resume: %v", host.Effects)
			}
			audits := host.Audits()
			if auditRef == "" && len(audits) != 0 || auditRef != "" && strings.Join(audits, " ") != api.RoleCompleteCapability+"="+auditRef {
				t.Fatalf("audit references sent: %v, recovery for %v", audits, answered)
			}
		})
	}
}

func TestCorruptedReviewBindingIsRefused(t *testing.T) {
	b := openBundle(t)
	f := loadRepairFixture(t)
	host := f.host(t, b)
	host.Models["reviewer"] = func(runID string, input json.RawMessage) json.RawMessage {
		body := fixture.Review("accept")(runID, input)
		var review map[string]any
		if err := json.Unmarshal(body, &review); err != nil {
			t.Fatal(err)
		}
		review["plan_hash"] = "sha256:" + fixture.Sha256Hex([]byte("another task"))
		return mustMarshal(t, review)
	}
	s := connectRepair(t, b, host, nil)
	defer s.close()
	env, _ := s.mustInvokeRepair("op-1", host.Invocation(t, ""))
	if env.Domain.Status != "refused" || env.code() != "review.binding" || string(env.Domain.Result) != "null" {
		t.Fatalf("envelope %+v", env)
	}
	if got := env.evidence(); got != "explore[-]:run-explore:settled implement[i]:run-impl-0:settled review[i]:run-review-0:settled" {
		t.Fatalf("evidence %s", got)
	}
	if host.CountRepair(api.IntegrateCapability) != 0 || host.Effects[api.WorkspaceCapability+"/run-impl-1"] != 0 || host.ModelCalls != 3 {
		t.Fatalf("after the refusal: calls %+v, model calls %d", host.Calls, host.ModelCalls)
	}
}

func TestAttemptMapShortOfTheBoundIsRefusedBeforeAnyRoleCall(t *testing.T) {
	b := openBundle(t)
	f := loadRepairFixture(t)
	host := f.host(t, b)
	s := connectRepair(t, b, host, nil)
	defer s.close()
	short := host.Map
	short.Attempts = short.Attempts[:1]
	duplicated := host.Map
	duplicated.Attempts = [][2]string{{"run-impl-0", "run-review-0"}, {"run-impl-0", "run-review-1"}}
	for name, tc := range map[string]struct {
		runs fixture.RepairRuns
		code string
	}{
		"one attempt":          {short, "invocation.invalid"},
		"implementer id twice": {duplicated, "runs.invalid"},
	} {
		host.Map = tc.runs
		env, _ := s.mustInvokeRepair("op-"+strings.ReplaceAll(name, " ", "-"), host.Invocation(t, ""))
		if env.Domain.Status != "refused" || env.code() != tc.code || string(env.Domain.Result) != "null" || env.HostEvidence != nil {
			t.Fatalf("%s: envelope %+v", name, env)
		}
	}
	if len(host.Calls) != 0 || len(host.Host.Calls) != 0 || host.ModelCalls != 0 {
		t.Fatalf("a refused invocation reached the host: %+v %+v", host.Calls, host.Host.Calls)
	}
	// The process is still serving: the full map completes.
	host.Map = fixture.DefaultRuns()
	if env, _ := s.mustInvokeRepair("op-full", host.Invocation(t, "")); env.Domain.Status != "completed" {
		t.Fatalf("envelope after the refusals %+v", env)
	}
}

func TestExplorerResultsStillDecodeUnderTheFrozenSchemas(t *testing.T) {
	b := openBundle(t)
	host := fixture.NewHost()
	s := connect(t, b, host, nil)
	defer s.close()
	input := b.roleInput(t, defaultTask())
	out, err := s.client.Invoke(s.ctx, api.Invocation{OperationID: "op-1", Capability: Capability, Input: invocation(t, "run-1", input, "")})
	if err != nil {
		t.Fatalf("invoke: %v; module stderr: %q", err, s.proc.stderr.String())
	}
	// Decoded by the schemas as installed in the bundle.
	payload, err := steps.OpenBundle(b.dir)
	if err != nil {
		t.Fatalf("installed payload: %v", err)
	}
	envelopeSchema, err := payload.Schema("schemas/explorer-envelope.v1.json")
	if err != nil {
		t.Fatal(err)
	}
	resultSchema, err := payload.Schema("schemas/explorer-result.v1.json")
	if err != nil {
		t.Fatal(err)
	}
	parsed, err := steps.Parse(out)
	if err != nil {
		t.Fatalf("envelope %s: %v", out, err)
	}
	if err := envelopeSchema.Validate(parsed); err != nil {
		t.Fatalf("envelope does not decode under the installed schema: %v", err)
	}
	var env envelope
	if err := api.Decode(out, &env); err != nil {
		t.Fatal(err)
	}
	if env.Domain.Status != "completed" {
		t.Fatalf("envelope %+v", env)
	}
	result, err := steps.Parse(env.Domain.Result)
	if err != nil {
		t.Fatal(err)
	}
	if err := resultSchema.Validate(result); err != nil {
		t.Fatalf("result does not decode under the installed schema: %v", err)
	}
	// The installed explorer schemas are the ones frozen at step 9's commit.
	fusionRoot := filepath.Dir(fixture.CatalogDir(t))
	for _, name := range []string{"explorer-request", "explorer-role-input", "explorer-envelope", "explorer-result"} {
		rel := "schemas/" + name + ".v1.json"
		cmd := exec.Command("git", "-C", fusionRoot, "show", frozenAt+":catalog/"+rel)
		committed, err := cmd.Output()
		if err != nil {
			t.Fatalf("git show %s:catalog/%s: %v", frozenAt, rel, err)
		}
		if installed := b.read(t, rel); !bytes.Equal(installed, committed) {
			t.Fatalf("%s as installed differs from %s", rel, frozenAt)
		}
	}
}
