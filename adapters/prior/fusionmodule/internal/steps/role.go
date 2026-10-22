package steps

import (
	"context"
	"errors"

	api "github.com/kai/prior/moduleapi/v1"
)

// RoleClient is the durable role service as the SDK exposes it in-process:
// api.RemoteRoles over a HostCaller in the module, a fake in tests.
type RoleClient interface {
	ReadRole(context.Context, api.RoleRequest) (api.RoleResponse, error)
	RunRole(context.Context, api.RoleRequest) (api.RoleResult, error)
	CompleteRole(context.Context, api.RoleRequest, string) (api.RoleResult, error)
}

// Roles builds a workflow's role client over its HostCaller; the module uses
// RemoteRoles, tests substitute a fake. Both workflows take one.
type Roles func(api.HostCaller) RoleClient

// RemoteRoles is the module's Roles: the SDK's client over the host caller.
func RemoteRoles(id api.Identity) Roles {
	return func(host api.HostCaller) RoleClient {
		return api.RemoteRoles{Host: host, Identity: id}
	}
}

// Observation is what the last read of the durable role reported, plus the
// host's refusal code when the step's last call was refused. State and Answer
// always come from a read; the executor never reports a state it inferred.
type Observation struct {
	// State is absent, accepted, answered, settled or refused.
	State string
	// Answer is the stored role answer on answered and settled, else nil.
	Answer *api.RoleAnswer
	// Refusal is the host's code when a run, read or completion was refused:
	// permission-denied, conflict, recovery-required, operation-unknown or
	// invalid-request. Empty when every call was accepted.
	Refusal string
	// RefusedCall names the capability the refusal came from.
	RefusedCall string
	// AuditRefConsumed is true when the first read found the run answered,
	// so the completion this call sent carried the audit reference. A caller
	// that holds one reference for several runs drops it once consumed.
	AuditRefConsumed bool
}

// Execute runs one step over one durable role, observe then act (Prior
// answer 67.5): read first; run only on absent; complete only on answered;
// reuse the stored answer on settled; never rerun accepted. The request,
// its Input included, is passed to every call unchanged. The observation
// returned is always a read's result, so after an action the role is read
// again rather than its state assumed.
//
// auditRef goes only to the completion of a run whose first read was
// answered, a run a previous invocation left before its completion (Prior
// answer 69.3). A run this call started on absent is completed without it,
// and the observation reports whether the reference was consumed.
//
// A refusal by the host ends the step with the refusal recorded; it is a
// known outcome. Any other error, a lost reply above all, is returned as is:
// the outcome is unknown and only the host's durable record can say what
// happened, which the next invocation's read will do.
func Execute(ctx context.Context, client RoleClient, request api.RoleRequest, auditRef string) (Observation, error) {
	obs, err := read(ctx, client, request)
	if err != nil || obs.Refusal != "" {
		return obs, err
	}
	completionAudit := ""
	consumed := obs.State == "answered"
	if consumed {
		completionAudit = auditRef
	}
	if obs.State == "absent" {
		if _, err := client.RunRole(ctx, request); err != nil {
			return refusalOf(obs, api.RoleRunCapability, err)
		}
		if obs, err = read(ctx, client, request); err != nil || obs.Refusal != "" {
			return obs, err
		}
	}
	if obs.State == "answered" {
		if _, err := client.CompleteRole(ctx, request, completionAudit); err != nil {
			obs.AuditRefConsumed = consumed
			return refusalOf(obs, api.RoleCompleteCapability, err)
		}
		obs, err = read(ctx, client, request)
		obs.AuditRefConsumed = consumed
		return obs, err
	}
	return obs, nil
}

func read(ctx context.Context, client RoleClient, request api.RoleRequest) (Observation, error) {
	response, err := client.ReadRole(ctx, request)
	if err != nil {
		return refusalOf(Observation{State: "refused"}, api.RoleReadCapability, err)
	}
	return Observation{State: response.State, Answer: response.Result}, nil
}

// refusalOf keeps the last observation and records the host's code when err
// is a role refusal; any other error is passed through.
func refusalOf(last Observation, capability string, err error) (Observation, error) {
	var refusal *api.RoleError
	if errors.As(err, &refusal) {
		last.Refusal = refusal.Code
		last.RefusedCall = capability
		return last, nil
	}
	return last, err
}
