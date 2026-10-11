// Package explorer interprets the bundle's explorer workflow definition,
// workflows/explorer.v1.json, over the step executor of internal/steps and
// serves it as the module capability fusion.explorer.v1.
//
// What the module does and does not do here is Prior's answer to request 67
// (docs/design/fusion-module-bundle-prior-response.md at 6080ba76, 67.5 to
// 67.7 and the two 2026-10-11 follow-ups). The host provisions the run,
// composes the role input (the caller's question, path scope and findings
// limit plus the host's own project_context and output_contract), freezes it
// and places it in the invocation as role_input; the module forwards those
// bytes on every role call and adds or strips nothing. The module performs
// no service preflight: the host compares the definition's requires with its
// service map before the process starts. The invocation's top-level audit_ref
// is the host's recovery overlay, sent only as the completion's audit
// reference. The answer is validated against the result schema and the
// findings limit separately, because the result schema has no maxItems.
package explorer

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/steps"
	api "github.com/kai/prior/moduleapi/v1"
)

// WorkflowAsset is where the definition lives in the payload.
const WorkflowAsset = "workflows/explorer.v1.json"

// ErrDefinition is returned when the definition is not one this executor
// can interpret: a shape it does not know is refused at load, never run on
// a guess.
var ErrDefinition = errors.New("explorer definition not interpretable")

// inputFrom is the explorer step's hand-over as the definition states it.
type inputFrom struct {
	InvocationSchema string `json:"invocation_schema"`
	RoleInput        string `json:"role_input"`
	RoleInputSchema  string `json:"role_input_schema"`
	Forwarded        string `json:"forwarded"`
	RecoveryRef      string `json:"recovery_ref"`
}

// completion is the explorer step's completion condition.
type completion struct {
	RoleState      string `json:"role_state"`
	ResultSchema   string `json:"result_schema"`
	FindingsLimit  string `json:"findings_limit"`
	EnvelopeSchema string `json:"envelope_schema"`
	Status         string `json:"status"`
}

// Definition is the explorer workflow with its schemas compiled from the
// data files the catalog declares.
type Definition struct {
	Capability string
	Role       string
	// The keys of the invocation input the definition names.
	roleInputKey string
	recoveryKey  string
	// The role-input member that carries the findings limit.
	findingsLimitKey string
	request          *steps.Schema
	roleInput        *steps.Schema
	result           *steps.Schema
	envelope         *steps.Schema
}

// Load reads the definition, resolves its role through the catalog and the
// profile, and compiles the four schemas by the paths the definition and the
// profile declare. The definition's hand-over and completion objects must say
// exactly what this executor does; anything else is ErrDefinition.
func Load(b *steps.Bundle) (*Definition, error) {
	w, err := steps.LoadWorkflow(b, WorkflowAsset)
	if err != nil {
		return nil, err
	}
	if len(w.Steps) != 1 || w.Steps[0].Role == "" {
		return nil, fmt.Errorf("%w: one role step expected", ErrDefinition)
	}
	if w.ReviseBound != 0 {
		return nil, fmt.Errorf("%w: revise_bound %d; this executor runs one attempt per invocation", ErrDefinition, w.ReviseBound)
	}
	if !w.Declares(steps.RoleCapabilities...) {
		return nil, fmt.Errorf("%w: requires must name the three host.role services", ErrDefinition)
	}
	step := w.Steps[0]
	catalog, err := steps.LoadCatalog(b)
	if err != nil {
		return nil, err
	}
	role, _, err := catalog.Resolve(step.Role)
	if err != nil {
		return nil, err
	}
	profile, err := steps.LoadProfile(b, role.ID)
	if err != nil {
		return nil, err
	}
	var from inputFrom
	if api.Decode(step.InputFrom, &from) != nil {
		return nil, fmt.Errorf("%w: input_from", ErrDefinition)
	}
	var done completion
	if api.Decode(step.Completion, &done) != nil {
		return nil, fmt.Errorf("%w: completion", ErrDefinition)
	}
	if from.Forwarded != "verbatim" || from.RoleInput == "" || from.RecoveryRef == "" {
		return nil, fmt.Errorf("%w: input_from must forward %q verbatim with a recovery_ref", ErrDefinition, from.RoleInput)
	}
	if done.RoleState != "settled" || done.Status != "completed" {
		return nil, fmt.Errorf("%w: completion must be a settled role reported completed", ErrDefinition)
	}
	prefix := from.RoleInput + "."
	if !strings.HasPrefix(done.FindingsLimit, prefix) || strings.Contains(done.FindingsLimit[len(prefix):], ".") || done.FindingsLimit == prefix {
		return nil, fmt.Errorf("%w: findings_limit %q is not a member of %s", ErrDefinition, done.FindingsLimit, from.RoleInput)
	}
	if from.RoleInputSchema != profile.InputSchema || done.ResultSchema != profile.ResultSchema {
		return nil, fmt.Errorf("%w: the step's schemas differ from the profile's", ErrDefinition)
	}
	d := &Definition{Capability: w.Capability, Role: role.ID, roleInputKey: from.RoleInput, recoveryKey: from.RecoveryRef, findingsLimitKey: done.FindingsLimit[len(prefix):]}
	if d.request, err = b.Schema(from.InvocationSchema); err != nil {
		return nil, err
	}
	if d.roleInput, err = b.Schema(from.RoleInputSchema); err != nil {
		return nil, err
	}
	if d.result, err = b.Schema(done.ResultSchema); err != nil {
		return nil, err
	}
	if d.envelope, err = b.Schema(done.EnvelopeSchema); err != nil {
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

// Evidence is the module's report of the host's own observations, copied
// from the role answer; null when no answer exists (Prior answer 67.6).
type Evidence struct {
	RunID       string    `json:"run_id"`
	PrincipalID string    `json:"principal_id"`
	ObservedAt  time.Time `json:"observed_at"`
	RoleState   string    `json:"role_state"`
}

// Envelope is the answer to a fusion.explorer.v1 invocation,
// schemas/explorer-envelope.v1.json.
type Envelope struct {
	Domain       Domain    `json:"domain"`
	HostEvidence *Evidence `json:"host_evidence"`
}

// Roles builds the step executor's role client over the workflow's
// HostCaller; the module uses api.RemoteRoles, tests substitute a fake.
type Roles func(api.HostCaller) steps.RoleClient

// RemoteRoles is the module's Roles: the SDK's client over the host caller.
func RemoteRoles(id api.Identity) Roles {
	return func(host api.HostCaller) steps.RoleClient {
		return api.RemoteRoles{Host: host, Identity: id}
	}
}

// Handler serves the definition under the module's identity.
func (d *Definition) Handler(id api.Identity, roles Roles) api.WorkflowHandler {
	return func(ctx context.Context, inv api.Invocation, host api.HostCaller) (json.RawMessage, error) {
		env, err := d.invoke(ctx, id, inv, roles(host))
		if err != nil {
			return nil, err
		}
		return d.encode(inv.OperationID, env)
	}
}

func refused(status, code, detail string, evidence *Evidence) *Envelope {
	return &Envelope{Domain: Domain{Status: status, Result: json.RawMessage("null"), Violations: []Violation{{Code: code, Detail: detail}}}, HostEvidence: evidence}
}

func (d *Definition) invoke(ctx context.Context, id api.Identity, inv api.Invocation, client steps.RoleClient) (*Envelope, error) {
	if inv.Capability != d.Capability {
		return refused("refused", "invocation.capability", inv.Capability, nil), nil
	}
	parsed, err := steps.Parse(inv.Input)
	if err != nil {
		return refused("refused", "invocation.invalid", err.Error(), nil), nil
	}
	if err := d.request.Validate(parsed); err != nil {
		return refused("refused", "invocation.invalid", err.Error(), nil), nil
	}
	// The invocation is one object with the keys the request schema allows;
	// role_input is taken as the bytes the host placed there, never re-encoded.
	var members map[string]json.RawMessage
	if json.Unmarshal(inv.Input, &members) != nil {
		return refused("refused", "invocation.invalid", "not an object", nil), nil
	}
	var runID, auditRef string
	if json.Unmarshal(members["run_id"], &runID) != nil || runID == "" {
		return refused("refused", "invocation.invalid", "run_id", nil), nil
	}
	if raw, ok := members[d.recoveryKey]; ok {
		if json.Unmarshal(raw, &auditRef) != nil || auditRef == "" {
			return refused("refused", "invocation.invalid", d.recoveryKey, nil), nil
		}
	}
	roleInput := members[d.roleInputKey]
	roleValue, ok := parsed.(map[string]any)[d.roleInputKey]
	if !ok || len(roleInput) == 0 {
		return refused("refused", "invocation.invalid", d.roleInputKey, nil), nil
	}
	if err := d.roleInput.Validate(roleValue); err != nil {
		return refused("refused", "role_input.invalid", err.Error(), nil), nil
	}
	limit, err := findingsLimit(roleValue, d.findingsLimitKey)
	if err != nil {
		return refused("refused", "role_input.invalid", err.Error(), nil), nil
	}
	request := api.RoleRequest{RunID: runID, ModuleID: id.ModuleID, ModuleVersion: id.Version, Profile: d.Role, Input: roleInput, BundleDigest: id.BundleDigest}
	// Every role call this step can make is checked against the frame bound
	// before the first one is sent, so an oversize input is refused with no
	// effect rather than failing mid-step.
	for _, capability := range steps.RoleCapabilities {
		call := api.RoleCall{Identity: id, RunID: runID, Profile: d.Role, Input: roleInput}
		if capability == api.RoleCompleteCapability {
			call.AuditRef = auditRef
		}
		body, err := json.Marshal(call)
		if err != nil {
			return nil, err
		}
		operation := capability + ":" + runID
		if len(operation) > 128 {
			return refused("refused", "invocation.invalid", "run_id too long for an operation id", nil), nil
		}
		if err := steps.CheckFrame("host.invoke", api.Invocation{OperationID: operation, Capability: capability, Input: body}); err != nil {
			return refused("refused", "frame.oversize", err.Error(), nil), nil
		}
	}
	obs, err := steps.Execute(ctx, client, request, auditRef)
	if err != nil {
		return nil, err
	}
	var evidence *Evidence
	if obs.Answer != nil {
		evidence = &Evidence{RunID: obs.Answer.RunID, PrincipalID: obs.Answer.PrincipalID, ObservedAt: obs.Answer.ObservedAt, RoleState: obs.State}
	}
	if obs.Refusal == "recovery-required" {
		return refused("recovery-required", "host.recovery-required", obs.RefusedCall, evidence), nil
	}
	if obs.Refusal != "" {
		return refused("refused", "host."+obs.Refusal, obs.RefusedCall, evidence), nil
	}
	switch obs.State {
	case "accepted":
		return refused("recovery-required", "role.accepted", "the role operation has no terminal answer; it is never rerun", nil), nil
	case "settled":
		answer, err := steps.Parse(obs.Answer.Output)
		if err != nil {
			return refused("refused", "result.invalid", err.Error(), evidence), nil
		}
		if err := d.result.Validate(answer); err != nil {
			return refused("refused", "result.invalid", err.Error(), evidence), nil
		}
		if n := countFindings(answer); n > limit {
			return refused("refused", "findings.limit", fmt.Sprintf("%d findings, limit %d", n, limit), evidence), nil
		}
		return &Envelope{Domain: Domain{Status: "completed", Result: obs.Answer.Output, Violations: []Violation{}}, HostEvidence: evidence}, nil
	}
	return refused("refused", "role."+obs.State, "the role did not reach a settled answer", evidence), nil
}

// encode marshals the envelope, checks it against its own schema and against
// the frame bound. An envelope that would not fit the wire is replaced by a
// refusal that says so, with the evidence kept and the result dropped.
func (d *Definition) encode(operationID string, env *Envelope) (json.RawMessage, error) {
	body, err := json.Marshal(env)
	if err != nil {
		return nil, err
	}
	if err := steps.CheckFrame("module.result", api.Result{OperationID: operationID, Output: body}); err != nil {
		if body, err = json.Marshal(refused("refused", "frame.oversize", err.Error(), env.HostEvidence)); err != nil {
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

func findingsLimit(roleInput any, key string) (int, error) {
	raw, ok := roleInput.(map[string]any)[key]
	if !ok {
		return 0, fmt.Errorf("%s missing", key)
	}
	n, ok := raw.(json.Number)
	if !ok {
		return 0, fmt.Errorf("%s is not a number", key)
	}
	v, err := n.Int64()
	if err != nil || v < 0 {
		return 0, fmt.Errorf("%s is not a non-negative integer", key)
	}
	return int(v), nil
}

func countFindings(answer any) int {
	obj, ok := answer.(map[string]any)
	if !ok {
		return 0
	}
	findings, _ := obj["findings"].([]any)
	return len(findings)
}
