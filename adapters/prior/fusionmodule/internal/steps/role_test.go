package steps

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
	"time"

	api "github.com/kai/prior/moduleapi/v1"
)

// script is a RoleClient that answers reads from a queue of states and
// records every call. A refusal is a *api.RoleError; a lost reply is
// api.ErrOutcomeUnknown.
type script struct {
	reads      []string
	runErr     error
	completeEr error
	calls      []string
	audits     []string
	inputs     []string
}

var answer = &api.RoleAnswer{RunID: "run-1", ModuleID: "fusion", ModuleVersion: "13.1.0", Profile: "explorer", PrincipalID: "p", Output: json.RawMessage(`{"answer":"x","findings":[],"uncertainties":[]}`), ObservedAt: time.Now()}

func (s *script) ReadRole(_ context.Context, r api.RoleRequest) (api.RoleResponse, error) {
	s.calls = append(s.calls, "read")
	s.inputs = append(s.inputs, string(r.Input))
	if len(s.reads) == 0 {
		return api.RoleResponse{}, errors.New("script exhausted")
	}
	state := s.reads[0]
	s.reads = s.reads[1:]
	switch state {
	case "answered", "settled":
		return api.RoleResponse{State: state, Result: answer}, nil
	case "lost":
		return api.RoleResponse{}, api.ErrOutcomeUnknown
	}
	if len(state) > 8 && state[:8] == "refused:" {
		return api.RoleResponse{State: "refused", Code: state[8:]}, &api.RoleError{Code: state[8:]}
	}
	return api.RoleResponse{State: state}, nil
}

func (s *script) RunRole(_ context.Context, r api.RoleRequest) (api.RoleResult, error) {
	s.calls = append(s.calls, "run")
	s.inputs = append(s.inputs, string(r.Input))
	if s.runErr != nil {
		return api.RoleResult{}, s.runErr
	}
	return api.RoleResult{}, nil
}

func (s *script) CompleteRole(_ context.Context, r api.RoleRequest, audit string) (api.RoleResult, error) {
	s.calls = append(s.calls, "complete")
	s.inputs = append(s.inputs, string(r.Input))
	s.audits = append(s.audits, audit)
	if s.completeEr != nil {
		return api.RoleResult{}, s.completeEr
	}
	return api.RoleResult{}, nil
}

var request = api.RoleRequest{RunID: "run-1", ModuleID: "fusion", ModuleVersion: "13.1.0", Profile: "explorer", Input: json.RawMessage(`{"question":"q"}`)}

func join(parts []string) string {
	out := ""
	for i, p := range parts {
		if i > 0 {
			out += ","
		}
		out += p
	}
	return out
}

func TestExecuteObservesThenActs(t *testing.T) {
	cases := []struct {
		name       string
		client     *script
		audit      string
		wantCalls  string
		wantState  string
		wantRefuse string
		wantAudits string
		wantErr    bool
	}{
		{"absent runs then completes", &script{reads: []string{"absent", "answered", "settled"}}, "", "read,run,read,complete,read", "settled", "", "", false},
		{"settled is reused", &script{reads: []string{"settled"}}, "", "read", "settled", "", "", false},
		{"answered completes with the audit", &script{reads: []string{"answered", "settled"}}, "audit-7", "read,complete,read", "settled", "", "audit-7", false},
		{"accepted is never rerun", &script{reads: []string{"accepted"}}, "", "read", "accepted", "", "", false},
		{"completion refused", &script{reads: []string{"answered"}, completeEr: &api.RoleError{Code: "recovery-required"}}, "", "read,complete", "answered", "recovery-required", "", false},
		{"run refused", &script{reads: []string{"absent"}, runErr: &api.RoleError{Code: "permission-denied"}}, "", "read,run", "absent", "permission-denied", "", false},
		{"read refused", &script{reads: []string{"refused:conflict"}}, "", "read", "refused", "conflict", "", false},
		{"lost reply on read is an error", &script{reads: []string{"lost"}}, "", "read", "", "", "", true},
		{"lost reply on run is an error", &script{reads: []string{"absent"}, runErr: api.ErrOutcomeUnknown}, "", "read,run", "", "", "", true},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			obs, err := Execute(context.Background(), c.client, request, c.audit)
			if (err != nil) != c.wantErr {
				t.Fatalf("err %v", err)
			}
			if got := join(c.client.calls); got != c.wantCalls {
				t.Errorf("calls %s, want %s", got, c.wantCalls)
			}
			if err != nil {
				return
			}
			if obs.State != c.wantState || obs.Refusal != c.wantRefuse {
				t.Errorf("observation %+v", obs)
			}
			if got := join(c.client.audits); got != c.wantAudits {
				t.Errorf("audits %q, want %q", got, c.wantAudits)
			}
			for _, in := range c.client.inputs {
				if in != string(request.Input) {
					t.Errorf("input changed across calls: %s", in)
				}
			}
			if (obs.Answer != nil) != (obs.State == "answered" || obs.State == "settled") {
				t.Errorf("answer presence does not match state %s", obs.State)
			}
		})
	}
}
