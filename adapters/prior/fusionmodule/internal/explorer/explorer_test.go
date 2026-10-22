package explorer

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"io"
	"strings"
	"testing"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/fixture"
	"github.com/kai/prior/integrationbuild/fusionmodule/internal/steps"
	api "github.com/kai/prior/moduleapi/v1"
)

// These are unit tests of the workflow over a fake durable host, in-process.
// They prove the explorer's observe-then-act behaviour and its envelope, not
// the installed process: plan step 9 starts the launcher from a built bundle.

type harness struct {
	t       *testing.T
	dir     string
	def     *Definition
	host    *fixture.Host
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
	host := fixture.NewHost()
	roles := func(h api.HostCaller) steps.RoleClient { return api.RemoteRoles{Host: h, Identity: fixture.Identity} }
	return &harness{t: t, dir: dir, def: def, host: host, handler: def.Handler(fixture.Identity, roles)}
}

func (h *harness) invoke(operation string, input json.RawMessage) Envelope {
	h.t.Helper()
	out, err := h.handler(context.Background(), api.Invocation{OperationID: operation, Capability: h.def.Capability, Input: input}, h.host.Caller())
	if err != nil {
		h.t.Fatalf("invoke: %v", err)
	}
	var env Envelope
	if err := api.Decode(out, &env); err != nil {
		h.t.Fatalf("envelope %s: %v", out, err)
	}
	return env
}

func (h *harness) roleInput(limit int) json.RawMessage { return fixture.RoleInput(h.t, h.dir, limit) }

func code(env Envelope) string {
	if len(env.Domain.Violations) == 0 {
		return ""
	}
	return env.Domain.Violations[0].Code
}

func TestLoadReadsTheDefinition(t *testing.T) {
	h := load(t)
	if h.def.Capability != "fusion.explorer.v1" || h.def.Role != "explorer" || h.def.roleInputKey != "role_input" || h.def.recoveryKey != "audit_ref" || h.def.findingsLimitKey != "findings_limit" {
		t.Fatalf("definition %+v", h.def)
	}
}

func TestValidAnswerCompletes(t *testing.T) {
	h := load(t)
	input := h.roleInput(4)
	env := h.invoke("op-1", fixture.Invocation(t, "run-1", input, ""))
	if env.Domain.Status != "completed" || len(env.Domain.Violations) != 0 || env.HostEvidence == nil {
		t.Fatalf("envelope %+v", env)
	}
	if env.HostEvidence.RunID != "run-1" || env.HostEvidence.PrincipalID != "principal:explorer" || env.HostEvidence.RoleState != "settled" || !env.HostEvidence.ObservedAt.Equal(h.host.Runs["run-1"].Answer.ObservedAt) {
		t.Fatalf("evidence %+v", env.HostEvidence)
	}
	if string(env.Domain.Result) != string(fixture.Answer(1)) {
		t.Fatalf("result %s", env.Domain.Result)
	}
	if h.host.ModelCalls != 1 || h.host.Count(api.RoleRunCapability) != 1 || h.host.Count(api.RoleCompleteCapability) != 1 || h.host.Count(api.RoleReadCapability) != 3 {
		t.Fatalf("calls %+v", h.host.Calls)
	}
	inputs := h.host.Inputs()
	if len(inputs) != 1 || inputs[0] != string(input) {
		t.Fatalf("role input not forwarded byte for byte: %q", inputs)
	}
	if len(h.host.Audits()) != 0 {
		t.Fatalf("an audit reference was sent without one in the invocation: %v", h.host.Audits())
	}
}

func TestRestartReusesTheStoredAnswerWithoutARun(t *testing.T) {
	h := load(t)
	input := h.roleInput(4)
	// The first process persisted the answer and lost its reply before completion.
	h.host.Seed("run-1", "answered", input, fixture.Answer(2))
	env := h.invoke("op-2", fixture.Invocation(t, "run-1", input, ""))
	if env.Domain.Status != "completed" || h.host.ModelCalls != 0 || h.host.Count(api.RoleRunCapability) != 0 {
		t.Fatalf("envelope %+v, model calls %d", env, h.host.ModelCalls)
	}
	// A further invocation of the settled run: one read, nothing else.
	before := len(h.host.Calls)
	env = h.invoke("op-3", fixture.Invocation(t, "run-1", input, ""))
	if env.Domain.Status != "completed" || len(h.host.Calls)-before != 1 || h.host.Calls[before].Capability != api.RoleReadCapability {
		t.Fatalf("settled reuse made %d calls", len(h.host.Calls)-before)
	}
}

func TestAcceptedIsRecoveryRequiredWithNullEvidence(t *testing.T) {
	h := load(t)
	input := h.roleInput(4)
	h.host.Seed("run-1", "accepted", input, nil)
	env := h.invoke("op-1", fixture.Invocation(t, "run-1", input, ""))
	if env.Domain.Status != "recovery-required" || env.HostEvidence != nil || string(env.Domain.Result) != "null" || code(env) != "role.accepted" {
		t.Fatalf("envelope %+v", env)
	}
	if h.host.ModelCalls != 0 || len(h.host.Calls) != 1 {
		t.Fatalf("accepted was acted on: %+v", h.host.Calls)
	}
}

func TestMissingRequiredAuditIsRecoveryRequired(t *testing.T) {
	h := load(t)
	h.host.RequireAudit = "audit:close-1"
	input := h.roleInput(4)
	h.host.Seed("run-1", "answered", input, fixture.Answer(1))
	env := h.invoke("op-1", fixture.Invocation(t, "run-1", input, ""))
	if env.Domain.Status != "recovery-required" || code(env) != "host.recovery-required" || env.HostEvidence == nil || env.HostEvidence.RoleState != "answered" || string(env.Domain.Result) != "null" {
		t.Fatalf("envelope %+v", env)
	}
	env = h.invoke("op-2", fixture.Invocation(t, "run-1", input, "audit:wrong"))
	if env.Domain.Status != "recovery-required" {
		t.Fatalf("an invalid audit completed: %+v", env)
	}
	env = h.invoke("op-3", fixture.Invocation(t, "run-1", input, "audit:close-1"))
	if env.Domain.Status != "completed" {
		t.Fatalf("the recorded audit did not complete: %+v", env)
	}
	audits := h.host.Audits()
	if strings.Join(audits, " ") != "host.role.complete.v1=audit:wrong host.role.complete.v1=audit:close-1" {
		t.Fatalf("audit references sent: %v", audits)
	}
	if h.host.ModelCalls != 0 {
		t.Fatal("recovery ran the model")
	}
}

// A run this invocation started is completed without the invocation's
// audit_ref: the reference belongs to a run a previous process left at
// answered, never to one first read at absent (Prior answer 69.3).
func TestAuditRefIsNotSentToARunThisInvocationStarted(t *testing.T) {
	h := load(t)
	input := h.roleInput(4)
	env := h.invoke("op-1", fixture.Invocation(t, "run-1", input, "audit:close-1"))
	if env.Domain.Status != "completed" || h.host.ModelCalls != 1 || h.host.Count(api.RoleRunCapability) != 1 || h.host.Count(api.RoleCompleteCapability) != 1 {
		t.Fatalf("envelope %+v, calls %+v", env, h.host.Calls)
	}
	if len(h.host.Audits()) != 0 {
		t.Fatalf("an audit reference was sent to a run this invocation started: %v", h.host.Audits())
	}
}

func TestSchemaInvalidAnswerIsRefusedNotCompleted(t *testing.T) {
	h := load(t)
	h.host.Model = func(json.RawMessage) json.RawMessage {
		return json.RawMessage(`{"answer":"","findings":[],"uncertainties":[]}`)
	}
	input := h.roleInput(4)
	env := h.invoke("op-1", fixture.Invocation(t, "run-1", input, ""))
	if env.Domain.Status != "refused" || code(env) != "result.invalid" || string(env.Domain.Result) != "null" || env.HostEvidence == nil {
		t.Fatalf("envelope %+v", env)
	}
}

func TestFindingsAboveTheLimitAreRefused(t *testing.T) {
	h := load(t)
	h.host.Model = func(json.RawMessage) json.RawMessage { return fixture.Answer(5) }
	env := h.invoke("op-1", fixture.Invocation(t, "run-1", h.roleInput(4), ""))
	if env.Domain.Status != "refused" || code(env) != "findings.limit" || string(env.Domain.Result) != "null" {
		t.Fatalf("envelope %+v", env)
	}
	h2 := load(t)
	h2.host.Model = func(json.RawMessage) json.RawMessage { return fixture.Answer(4) }
	if env := h2.invoke("op-1", fixture.Invocation(t, "run-1", h2.roleInput(4), "")); env.Domain.Status != "completed" {
		t.Fatalf("four findings against a limit of four refused: %+v", env)
	}
}

func TestInvalidInvocationsAreRefusedBeforeAnyHostCall(t *testing.T) {
	h := load(t)
	input := h.roleInput(4)
	cases := map[string]json.RawMessage{
		"unknown capability":    nil,
		"missing run_id":        json.RawMessage(`{"role_input":` + string(input) + `}`),
		"extra member":          json.RawMessage(`{"run_id":"r","role_input":` + string(input) + `,"mode":"x"}`),
		"duplicate key":         json.RawMessage(`{"run_id":"r","run_id":"s","role_input":` + string(input) + `}`),
		"empty audit":           json.RawMessage(`{"run_id":"r","role_input":` + string(input) + `,"audit_ref":""}`),
		"role input off-schema": fixture.Invocation(t, "r", h.roleInput(9), ""),
		"role input bare":       json.RawMessage(`{"run_id":"r","role_input":{"question":"q"}}`),
		"not an object":         json.RawMessage(`[]`),
	}
	for name, body := range cases {
		capability := h.def.Capability
		if body == nil {
			capability, body = "fusion.other.v1", fixture.Invocation(t, "r", input, "")
		}
		out, err := h.handler(context.Background(), api.Invocation{OperationID: "op", Capability: capability, Input: body}, h.host.Caller())
		if err != nil {
			t.Fatalf("%s: %v", name, err)
		}
		var env Envelope
		if err := api.Decode(out, &env); err != nil {
			t.Fatalf("%s: %v", name, err)
		}
		if env.Domain.Status != "refused" || env.HostEvidence != nil || string(env.Domain.Result) != "null" {
			t.Errorf("%s: %+v", name, env)
		}
	}
	if len(h.host.Calls) != 0 {
		t.Fatalf("a refused invocation reached the host: %+v", h.host.Calls)
	}
}

func TestOversizeRoleInputIsRefusedBeforeAnyHostCall(t *testing.T) {
	h := load(t)
	var obj map[string]any
	if err := json.Unmarshal(h.roleInput(4), &obj); err != nil {
		t.Fatal(err)
	}
	obj["question"] = strings.Repeat("q", api.DefaultMaxFrame)
	input, _ := json.Marshal(obj)
	env := h.invoke("op-1", fixture.Invocation(t, "run-1", input, ""))
	if env.Domain.Status != "refused" || code(env) != "frame.oversize" || len(h.host.Calls) != 0 {
		t.Fatalf("envelope %+v, calls %d", env, len(h.host.Calls))
	}
}

func TestOversizeAnswerIsRefusedWithinTheFrame(t *testing.T) {
	h := load(t)
	h.host.Model = func(json.RawMessage) json.RawMessage {
		body, _ := json.Marshal(map[string]any{"answer": strings.Repeat("a", api.DefaultMaxFrame), "findings": []any{}, "uncertainties": []any{}})
		return body
	}
	env := h.invoke("op-1", fixture.Invocation(t, "run-1", h.roleInput(4), ""))
	if env.Domain.Status != "refused" || code(env) != "frame.oversize" || env.HostEvidence == nil {
		t.Fatalf("envelope %+v", env)
	}
}

func TestHostRefusalsAreReported(t *testing.T) {
	h := load(t)
	input := h.roleInput(4)
	h.host.Seed("run-1", "answered", json.RawMessage(`{"other":true}`), fixture.Answer(1))
	env := h.invoke("op-1", fixture.Invocation(t, "run-1", input, ""))
	if env.Domain.Status != "refused" || code(env) != "host.conflict" {
		t.Fatalf("envelope %+v", env)
	}
}

func TestLostReplyIsAnErrorNotAnEnvelope(t *testing.T) {
	h := load(t)
	lost := callerFunc(func(context.Context, api.Invocation) (json.RawMessage, error) { return nil, api.ErrOutcomeUnknown })
	_, err := h.handler(context.Background(), api.Invocation{OperationID: "op", Capability: h.def.Capability, Input: fixture.Invocation(t, "run-1", h.roleInput(4), "")}, lost)
	if err == nil {
		t.Fatal("an unknown outcome was answered")
	}
}

type callerFunc func(context.Context, api.Invocation) (json.RawMessage, error)

func (f callerFunc) CallHost(ctx context.Context, inv api.Invocation) (json.RawMessage, error) {
	return f(ctx, inv)
}

// The handler behind the SDK server, over pipes, against the SDK client with
// the fake services offered: the handshake, the advertised capability, the
// reverse calls and the result correlation, all in-process.
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
	client, err := api.ConnectWithServices(context.Background(), conn, fixture.Identity, secret, []string{"fusion.explorer.v1"}, h.host.Services())
	if err != nil {
		t.Fatal(err)
	}
	out, err := client.Invoke(context.Background(), api.Invocation{OperationID: "op-1", Capability: "fusion.explorer.v1", Input: fixture.Invocation(t, "run-1", h.roleInput(4), "")})
	if err != nil {
		t.Fatal(err)
	}
	var env Envelope
	if err := api.Decode(out, &env); err != nil {
		t.Fatal(err)
	}
	if env.Domain.Status != "completed" || h.host.ModelCalls != 1 {
		t.Fatalf("envelope %+v", env)
	}
	if _, err := client.Invoke(context.Background(), api.Invocation{OperationID: "op-2", Capability: "fusion.other.v1", Input: []byte(`{}`)}); err != api.ErrCapability {
		t.Fatalf("an unadvertised capability was sent: %v", err)
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
