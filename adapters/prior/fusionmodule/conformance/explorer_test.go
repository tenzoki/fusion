package conformance

// The explorer cases of plan step 9, each its own test, against the process
// started from the extracted bundle: conformance on macOS arm64 over the
// fake host of internal/fixture, not Prior's acceptance; the Linux binaries
// are never started (see host_test.go).

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"strings"
	"testing"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/fixture"
	api "github.com/kai/prior/moduleapi/v1"
)

func TestHandshakeAdvertisesTheExplorer(t *testing.T) {
	b := openBundle(t)
	host := fixture.NewHost()
	// Requiring the capability in the handshake is the SDK's check that the
	// module advertised it; the connection is then live for an invocation.
	s := connect(t, b, host, nil)
	defer s.close()
	env := s.mustInvoke("op-1", invocation(t, "run-1", b.roleInput(t, defaultTask()), ""))
	if env.Domain.Status != "completed" {
		t.Fatalf("envelope after the handshake: %+v", env)
	}
	if stderr := s.proc.stderr.String(); stderr != "" {
		t.Fatalf("the module wrote to stderr during a clean session: %q", stderr)
	}
}

func TestValidAnswerCompletesWithTheHostEvidence(t *testing.T) {
	b := openBundle(t)
	host := fixture.NewHost()
	s := connect(t, b, host, nil)
	defer s.close()
	input := b.roleInput(t, defaultTask())
	env := s.mustInvoke("op-1", invocation(t, "run-1", input, ""))
	if env.Domain.Status != "completed" || len(env.Domain.Violations) != 0 || env.HostEvidence == nil {
		t.Fatalf("envelope %+v", env)
	}
	if string(env.Domain.Result) != string(fixture.Answer(1)) {
		t.Fatalf("result is not the stored answer's bytes: %s", env.Domain.Result)
	}
	stored := host.Runs["run-1"].Answer
	e := env.HostEvidence
	if e.RunID != stored.RunID || e.PrincipalID != stored.PrincipalID || !e.ObservedAt.Equal(stored.ObservedAt) || e.RoleState != "settled" {
		t.Fatalf("host_evidence %+v is not copied from the fake answer %+v", e, stored)
	}
	if host.ModelCalls != 1 || host.Count(api.RoleRunCapability) != 1 || host.Count(api.RoleCompleteCapability) != 1 || host.Count(api.RoleReadCapability) != 3 {
		t.Fatalf("calls %+v", host.Calls)
	}
	if inputs := host.Inputs(); len(inputs) != 1 || inputs[0] != string(input) {
		t.Fatalf("role input not forwarded byte for byte on every call: %q", inputs)
	}
	if audits := host.Audits(); len(audits) != 0 {
		t.Fatalf("an audit reference was sent without one in the invocation: %v", audits)
	}
	// Every call carried the bundle's identity: the fake host refuses any
	// other with permission-denied, which would have shown above.
	for _, c := range host.Calls {
		if c.Call.Identity != b.identity {
			t.Fatalf("call %s carried identity %+v", c.Capability, c.Call.Identity)
		}
	}
}

func TestSchemaInvalidAnswerIsRefusedNotCompleted(t *testing.T) {
	b := openBundle(t)
	host := fixture.NewHost()
	host.Model = func(json.RawMessage) json.RawMessage {
		// answer violates minLength 1 of schemas/explorer-result.v1.json.
		return json.RawMessage(`{"answer":"","findings":[],"uncertainties":[]}`)
	}
	s := connect(t, b, host, nil)
	defer s.close()
	env := s.mustInvoke("op-1", invocation(t, "run-1", b.roleInput(t, defaultTask()), ""))
	if env.Domain.Status != "refused" || env.code() != "result.invalid" || string(env.Domain.Result) != "null" || env.HostEvidence == nil {
		t.Fatalf("envelope %+v", env)
	}
}

func TestFiveFindingsAgainstALimitOfFourAreRefused(t *testing.T) {
	b := openBundle(t)
	host := fixture.NewHost()
	host.Model = func(json.RawMessage) json.RawMessage { return fixture.Answer(5) }
	s := connect(t, b, host, nil)
	defer s.close()
	env := s.mustInvoke("op-1", invocation(t, "run-1", b.roleInput(t, defaultTask()), ""))
	if env.Domain.Status != "refused" || env.code() != "findings.limit" || string(env.Domain.Result) != "null" || env.HostEvidence == nil {
		t.Fatalf("envelope %+v", env)
	}
	// The bound is exact: four against four completes, on a second run.
	host.Model = func(json.RawMessage) json.RawMessage { return fixture.Answer(4) }
	if env := s.mustInvoke("op-2", invocation(t, "run-2", b.roleInput(t, defaultTask()), "")); env.Domain.Status != "completed" {
		t.Fatalf("four findings against a limit of four refused: %+v", env)
	}
}

func TestKillAfterThePersistedAnswerThenRestartRunsNoModel(t *testing.T) {
	b := openBundle(t)
	host := fixture.NewHost()
	input := b.roleInput(t, defaultTask())
	// The first process: the fake host persists the answer on run, then the
	// process is killed before it can read the reply, as a crash between the
	// model's effect and the completion would leave things.
	var first *session
	services := host.Services()
	run := services[api.RoleRunCapability]
	services[api.RoleRunCapability] = func(ctx context.Context, inv api.Invocation) (json.RawMessage, error) {
		out, err := run(ctx, inv)
		first.proc.kill()
		return out, err
	}
	first = connect(t, b, host, services)
	if _, err := first.invoke("op-1", invocation(t, "run-1", input, "")); err == nil {
		t.Fatal("the invocation of a killed process returned an envelope")
	}
	first.close()
	if run := host.Runs["run-1"]; run == nil || run.State != "answered" || host.ModelCalls != 1 {
		t.Fatalf("the host did not persist the answer before the kill: %+v, model calls %d", host.Runs["run-1"], host.ModelCalls)
	}
	// A fresh process, the same operation id and an identical role input.
	second := connect(t, b, host, nil)
	defer second.close()
	env := second.mustInvoke("op-1", invocation(t, "run-1", input, ""))
	if env.Domain.Status != "completed" || env.HostEvidence == nil || env.HostEvidence.RoleState != "settled" {
		t.Fatalf("envelope after the restart %+v", env)
	}
	if host.ModelCalls != 1 || host.Count(api.RoleRunCapability) != 1 {
		t.Fatalf("the restart ran the model again: %d model calls, %d runs", host.ModelCalls, host.Count(api.RoleRunCapability))
	}
	if inputs := host.Inputs(); len(inputs) != 1 || inputs[0] != string(input) {
		t.Fatalf("the restarted process sent a different role input: %q", inputs)
	}
}

func TestSettledIsReusedWithoutARun(t *testing.T) {
	b := openBundle(t)
	host := fixture.NewHost()
	input := b.roleInput(t, defaultTask())
	host.Seed("run-1", "settled", input, fixture.Answer(2))
	s := connect(t, b, host, nil)
	defer s.close()
	env := s.mustInvoke("op-1", invocation(t, "run-1", input, ""))
	if env.Domain.Status != "completed" || string(env.Domain.Result) != string(fixture.Answer(2)) || env.HostEvidence == nil || env.HostEvidence.RoleState != "settled" {
		t.Fatalf("envelope %+v", env)
	}
	if host.ModelCalls != 0 || len(host.Calls) != 1 || host.Calls[0].Capability != api.RoleReadCapability {
		t.Fatalf("settled reuse made calls %+v", host.Calls)
	}
}

func TestAcceptedIsRecoveryRequiredWithNullEvidence(t *testing.T) {
	b := openBundle(t)
	host := fixture.NewHost()
	input := b.roleInput(t, defaultTask())
	host.Seed("run-1", "accepted", input, nil)
	s := connect(t, b, host, nil)
	defer s.close()
	env := s.mustInvoke("op-1", invocation(t, "run-1", input, ""))
	if env.Domain.Status != "recovery-required" || env.HostEvidence != nil || string(env.Domain.Result) != "null" || env.code() != "role.accepted" {
		t.Fatalf("envelope %+v", env)
	}
	if host.ModelCalls != 0 || len(host.Calls) != 1 || host.Calls[0].Capability != api.RoleReadCapability {
		t.Fatalf("accepted was acted on: %+v", host.Calls)
	}
}

func TestAnsweredWithoutTheRequiredAuditIsRecoveryRequired(t *testing.T) {
	b := openBundle(t)
	host := fixture.NewHost()
	host.RequireAudit = "audit:close-1"
	input := b.roleInput(t, defaultTask())
	host.Seed("run-1", "answered", input, fixture.Answer(1))
	s := connect(t, b, host, nil)
	defer s.close()
	env := s.mustInvoke("op-1", invocation(t, "run-1", input, ""))
	if env.Domain.Status != "recovery-required" || env.code() != "host.recovery-required" || string(env.Domain.Result) != "null" || env.HostEvidence == nil || env.HostEvidence.RoleState != "answered" {
		t.Fatalf("envelope %+v", env)
	}
	if host.Runs["run-1"].State != "answered" {
		t.Fatalf("the role was settled without the audit: %s", host.Runs["run-1"].State)
	}
	// The recorded audit, on a fresh outer operation, completes it; the
	// reference travels on the completion call alone.
	env = s.mustInvoke("op-2", invocation(t, "run-1", input, "audit:close-1"))
	if env.Domain.Status != "completed" {
		t.Fatalf("the recorded audit did not complete: %+v", env)
	}
	if audits := host.Audits(); strings.Join(audits, " ") != api.RoleCompleteCapability+"=audit:close-1" {
		t.Fatalf("audit references sent: %v", audits)
	}
	if host.ModelCalls != 0 {
		t.Fatal("recovery ran the model")
	}
}

func TestAFreshOperationIDWithTheSameRunIsAccepted(t *testing.T) {
	b := openBundle(t)
	host := fixture.NewHost()
	s := connect(t, b, host, nil)
	defer s.close()
	input := b.roleInput(t, defaultTask())
	if env := s.mustInvoke("op-1", invocation(t, "run-1", input, "")); env.Domain.Status != "completed" {
		t.Fatalf("first envelope %+v", env)
	}
	before := len(host.Calls)
	env := s.mustInvoke("op-2", invocation(t, "run-1", input, ""))
	if env.Domain.Status != "completed" || string(env.Domain.Result) != string(fixture.Answer(1)) {
		t.Fatalf("second envelope %+v", env)
	}
	if host.ModelCalls != 1 || len(host.Calls)-before != 1 || host.Calls[before].Capability != api.RoleReadCapability {
		t.Fatalf("the fresh operation made calls %+v", host.Calls[before:])
	}
}

func TestOversizeInputIsRefused(t *testing.T) {
	b := openBundle(t)
	host := fixture.NewHost()
	s := connect(t, b, host, nil)
	defer s.close()

	// Over 1 MiB: the SDK client refuses the frame before a byte reaches
	// the process, and the connection stays usable.
	tooLarge := defaultTask()
	tooLarge.Question = strings.Repeat("q", api.DefaultMaxFrame+1)
	if _, err := s.invoke("op-1", invocation(t, "run-1", b.roleInput(t, tooLarge), "")); !errors.Is(err, api.ErrFrameTooLarge) {
		t.Fatalf("an input over the frame bound was sent: %v", err)
	}

	// Within the frame, yet the completion call the module would have to
	// make, with the identity and the audit around the same input, would
	// not fit: the module refuses before any host call (plan step 7).
	fits := func(n int) bool { return completionFits(t, b, "run-2", b.roleInput(t, questionOf(n))) }
	lo, hi := 0, api.DefaultMaxFrame
	if !fits(lo) || fits(hi) {
		t.Fatal("the frame bound is not where this test assumes")
	}
	for hi-lo > 1 {
		mid := (lo + hi) / 2
		if fits(mid) {
			lo = mid
		} else {
			hi = mid
		}
	}
	input := b.roleInput(t, questionOf(hi))
	env, err := s.invoke("op-2", invocation(t, "run-2", input, ""))
	if err != nil {
		t.Fatalf("the invocation that fits the frame was not sent: %v", err)
	}
	if env.Domain.Status != "refused" || env.code() != "frame.oversize" || env.HostEvidence != nil || string(env.Domain.Result) != "null" {
		t.Fatalf("envelope %+v", env)
	}
	if len(host.Calls) != 0 {
		t.Fatalf("a refused input reached the host: %+v", host.Calls)
	}
	// The process is still serving.
	if env := s.mustInvoke("op-3", invocation(t, "run-3", b.roleInput(t, defaultTask()), "")); env.Domain.Status != "completed" {
		t.Fatalf("envelope after the refusals %+v", env)
	}
}

func questionOf(n int) task {
	t := defaultTask()
	t.Question = strings.Repeat("q", n)
	return t
}

// completionFits restates the module's own bound (internal/steps.CheckFrame,
// mirroring Prior's checkFrame): the completion call is the largest role
// call, wrapped in the largest frame the SDK writes.
func completionFits(t *testing.T, b *bundle, runID string, roleInput json.RawMessage) bool {
	t.Helper()
	call, err := json.Marshal(api.RoleCall{Identity: b.identity, RunID: runID, Profile: "explorer", Input: roleInput})
	if err != nil {
		t.Fatal(err)
	}
	payload, err := json.Marshal(api.Invocation{OperationID: api.RoleCompleteCapability + ":" + runID, Capability: api.RoleCompleteCapability, Input: call})
	if err != nil {
		t.Fatal(err)
	}
	frame := api.Frame{SchemaVersion: api.SchemaVersion, MessageID: strings.Repeat("f", 64) + ":reply", CorrelationID: strings.Repeat("f", 64), Kind: "host.invoke", Payload: payload}
	return api.WriteFrame(io.Discard, frame, api.DefaultMaxFrame) == nil
}

func TestUnknownCapabilityIsRefused(t *testing.T) {
	b := openBundle(t)
	host := fixture.NewHost()
	// In the handshake: the module itself rejects a required capability it
	// does not serve, and the connection never opens.
	s, err := tryConnect(t, b, host, nil, []string{"fusion.other.v1"})
	var remote *api.RemoteError
	if !errors.As(err, &remote) || remote.Code != "unsupported-capability" {
		t.Fatalf("a handshake requiring an unknown capability returned %v", err)
	}
	if s.client != nil {
		t.Fatal("a connection opened on an unsupported requirement")
	}
	// On an open connection: the SDK client refuses to send what the module
	// did not advertise, and the process keeps serving.
	s = connect(t, b, host, nil)
	defer s.close()
	if _, err := s.client.Invoke(s.ctx, api.Invocation{OperationID: "op-1", Capability: "fusion.other.v1", Input: []byte(`{}`)}); !errors.Is(err, api.ErrCapability) {
		t.Fatalf("an unadvertised capability was sent: %v", err)
	}
	if env := s.mustInvoke("op-2", invocation(t, "run-1", b.roleInput(t, defaultTask()), "")); env.Domain.Status != "completed" {
		t.Fatalf("envelope after the refusal %+v", env)
	}
	if host.ModelCalls != 1 || len(host.Calls) != 5 {
		t.Fatalf("calls %+v", host.Calls)
	}
}
