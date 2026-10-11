// Package fixture serves the adapter's tests: a payload directory built from
// fusion's catalog, and a fake host whose three host.role.* services are
// durable in memory. Nothing here is linked into the module executable.
package fixture

import (
	"context"
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
	"time"

	api "github.com/kai/prior/moduleapi/v1"
)

// Identity is the pinned identity the tests run under.
var Identity = api.Identity{ModuleID: "fusion", Version: "13.1.0", BundleDigest: "sha256:" + strings.Repeat("ab", 32)}

// CatalogDir is fusion's catalog/ as stage.sh exports it, or "" when the
// tests run outside stage.sh; callers skip with that reason.
func CatalogDir(t *testing.T) string {
	t.Helper()
	dir := os.Getenv("FUSION_CATALOG_DIR")
	if dir == "" {
		t.Skip("FUSION_CATALOG_DIR unset: run through adapters/prior/stage.sh")
	}
	return dir
}

// DataFiles are the payload entries the fixture declares, in manifest order.
var DataFiles = []string{
	"catalog.json",
	"profiles/explorer.json",
	"profiles/explorer.md",
	"workflows/explorer.v1.json",
	"schemas/explorer-request.v1.json",
	"schemas/explorer-role-input.v1.json",
	"schemas/explorer-envelope.v1.json",
	"schemas/explorer-result.v1.json",
}

// Bundle writes a payload under a fresh temp directory from the catalog:
// catalog.json, the workflow and the four schemas copied unchanged, the
// explorer profile reduced to the seven keys Prior reads (as render.ts's
// priorProfileJson does), a placeholder profile text and a module.json that
// declares them. The executable the manifest names is not written: the tests
// never start a process.
func Bundle(t *testing.T, catalogDir string) string {
	t.Helper()
	root := t.TempDir()
	write := func(rel string, body []byte) {
		path := filepath.Join(root, filepath.FromSlash(rel))
		if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(path, body, 0o644); err != nil {
			t.Fatal(err)
		}
	}
	copyFile := func(rel, from string) {
		body, err := os.ReadFile(filepath.Join(catalogDir, filepath.FromSlash(from)))
		if err != nil {
			t.Fatal(err)
		}
		write(rel, body)
	}
	copyFile("catalog.json", "catalog.json")
	copyFile("workflows/explorer.v1.json", "workflows/explorer.v1.json")
	for _, name := range []string{"explorer-request", "explorer-role-input", "explorer-envelope", "explorer-result"} {
		copyFile("schemas/"+name+".v1.json", "schemas/"+name+".v1.json")
	}
	profileBytes, err := os.ReadFile(filepath.Join(catalogDir, "profiles", "explorer", "profile.json"))
	if err != nil {
		t.Fatal(err)
	}
	var profile map[string]json.RawMessage
	if err := json.Unmarshal(profileBytes, &profile); err != nil {
		t.Fatal(err)
	}
	delete(profile, "parts")
	reduced, err := json.Marshal(profile)
	if err != nil {
		t.Fatal(err)
	}
	write("profiles/explorer.json", reduced)
	write("profiles/explorer.md", []byte("fixture profile text\n"))
	manifest := map[string]any{"schema_version": 1, "module_id": Identity.ModuleID, "version": Identity.Version, "runtime_api": "1", "executable": "bin/fusion-module", "data": DataFiles}
	manifestBytes, err := json.Marshal(manifest)
	if err != nil {
		t.Fatal(err)
	}
	write("module.json", manifestBytes)
	return root
}

// RoleInput is a role input as the host composes it: the three caller
// fields, a project context and the result schema as output_contract.
func RoleInput(t *testing.T, catalogDir string, findingsLimit int) json.RawMessage {
	t.Helper()
	schemaBytes, err := os.ReadFile(filepath.Join(catalogDir, "schemas", "explorer-result.v1.json"))
	if err != nil {
		t.Fatal(err)
	}
	var schema any
	if err := json.Unmarshal(schemaBytes, &schema); err != nil {
		t.Fatal(err)
	}
	text := "# CLAUDE.md\n\nRun make test.\n"
	input := map[string]any{
		"question":       "Where is the frame bound enforced?",
		"path_scope":     []string{"moduleapi/v1"},
		"findings_limit": findingsLimit,
		"project_context": map[string]any{"instructions": []map[string]any{{
			"path":   "CLAUDE.md",
			"sha256": "sha256:" + Sha256Hex([]byte(text)),
			"text":   text,
		}}},
		"output_contract": schema,
	}
	body, err := json.Marshal(input)
	if err != nil {
		t.Fatal(err)
	}
	return body
}

// Invocation composes the outer invocation input the host sends.
func Invocation(t *testing.T, runID string, roleInput json.RawMessage, auditRef string) json.RawMessage {
	t.Helper()
	obj := map[string]json.RawMessage{"run_id": mustJSON(t, runID), "role_input": roleInput}
	if auditRef != "" {
		obj["audit_ref"] = mustJSON(t, auditRef)
	}
	return mustJSON(t, obj)
}

func mustJSON(t *testing.T, v any) json.RawMessage {
	t.Helper()
	body, err := json.Marshal(v)
	if err != nil {
		t.Fatal(err)
	}
	return body
}

// Answer is a result the fake model returns: n findings, schema-valid.
func Answer(n int) json.RawMessage {
	findings := make([]map[string]string, 0, n)
	for i := 0; i < n; i++ {
		findings = append(findings, map[string]string{"location": "moduleapi/v1/frame.go", "observation": "WriteFrame compares the body length with maxBytes"})
	}
	body, _ := json.Marshal(map[string]any{"answer": "In WriteFrame and ReadFrame.", "findings": findings, "uncertainties": []string{}})
	return body
}

// Run is one durable role operation of the fake host.
type Run struct {
	State  string
	Input  []byte
	Answer *api.RoleAnswer
}

// Host is a fake durable host: the three role services over an in-memory
// store, with the knobs the explorer cases need. Every call is recorded.
type Host struct {
	mu sync.Mutex
	// Model is called once per run on absent; nil answers Answer(1).
	Model func(input json.RawMessage) json.RawMessage
	// RequireAudit, when set, is the audit reference completion needs; any
	// other value, the empty one included, is refused recovery-required.
	RequireAudit string
	// ModelCalls counts fake model invocations.
	ModelCalls int
	// Runs is the durable store by run id.
	Runs map[string]*Run
	// Calls lists every RoleCall received, in order, with its capability.
	Calls []Call
}

// Call is one recorded host service call.
type Call struct {
	Capability string
	Call       api.RoleCall
}

// NewHost returns an empty fake host.
func NewHost() *Host {
	return &Host{Runs: map[string]*Run{}}
}

// Seed places a run in a state before any call: accepted (no answer),
// answered or settled with the given output.
func (h *Host) Seed(runID, state string, input, output json.RawMessage) {
	h.mu.Lock()
	defer h.mu.Unlock()
	r := &Run{State: state, Input: append([]byte(nil), input...)}
	if output != nil {
		r.Answer = h.answer(runID, output)
	}
	h.Runs[runID] = r
}

func (h *Host) answer(runID string, output json.RawMessage) *api.RoleAnswer {
	return &api.RoleAnswer{RunID: runID, ModuleID: Identity.ModuleID, ModuleVersion: Identity.Version, Profile: "explorer", PrincipalID: "principal:explorer", Output: output, ObservedAt: time.Date(2026, 10, 11, 9, 30, 0, 123456789, time.UTC)}
}

// Services are the handlers ConnectWithServices offers, or a HostCaller
// dispatches to in-process.
func (h *Host) Services() map[string]api.Handler {
	out := map[string]api.Handler{}
	for _, capability := range []string{api.RoleReadCapability, api.RoleRunCapability, api.RoleCompleteCapability} {
		out[capability] = func(ctx context.Context, inv api.Invocation) (json.RawMessage, error) {
			return json.Marshal(h.serve(capability, inv))
		}
	}
	return out
}

func (h *Host) serve(capability string, inv api.Invocation) api.RoleResponse {
	h.mu.Lock()
	defer h.mu.Unlock()
	var call api.RoleCall
	if api.Decode(inv.Input, &call) != nil || inv.Capability != capability || inv.OperationID != capability+":"+call.RunID || call.RunID == "" || call.Profile == "" || !json.Valid(call.Input) || capability != api.RoleCompleteCapability && call.AuditRef != "" {
		return api.RoleResponse{State: "refused", Code: "invalid-request"}
	}
	h.Calls = append(h.Calls, Call{capability, call})
	if call.Identity != Identity || call.Profile != "explorer" {
		return api.RoleResponse{State: "refused", Code: "permission-denied"}
	}
	run := h.Runs[call.RunID]
	if run != nil && string(run.Input) != string(call.Input) {
		return api.RoleResponse{State: "refused", Code: "conflict"}
	}
	switch capability {
	case api.RoleReadCapability:
		if run == nil {
			return api.RoleResponse{State: "absent"}
		}
		return api.RoleResponse{State: run.State, Result: run.Answer}
	case api.RoleRunCapability:
		if run == nil {
			h.ModelCalls++
			output := Answer(1)
			if h.Model != nil {
				output = h.Model(call.Input)
			}
			run = &Run{State: "answered", Input: append([]byte(nil), call.Input...), Answer: h.answer(call.RunID, output)}
			h.Runs[call.RunID] = run
		}
		if run.Answer == nil {
			return api.RoleResponse{State: "refused", Code: "recovery-required"}
		}
		return api.RoleResponse{State: run.State, Result: run.Answer}
	case api.RoleCompleteCapability:
		if run == nil || run.Answer == nil {
			return api.RoleResponse{State: "refused", Code: "recovery-required"}
		}
		if h.RequireAudit != "" && call.AuditRef != h.RequireAudit {
			return api.RoleResponse{State: "refused", Code: "recovery-required"}
		}
		run.State = "settled"
		return api.RoleResponse{State: "settled", Result: run.Answer}
	}
	return api.RoleResponse{State: "refused", Code: "operation-unknown"}
}

// Caller is an in-process HostCaller over the fake services.
func (h *Host) Caller() api.HostCaller {
	return callerFunc(func(ctx context.Context, inv api.Invocation) (json.RawMessage, error) {
		handler := h.Services()[inv.Capability]
		if handler == nil {
			return nil, api.ErrCapability
		}
		return handler(ctx, inv)
	})
}

type callerFunc func(context.Context, api.Invocation) (json.RawMessage, error)

func (f callerFunc) CallHost(ctx context.Context, inv api.Invocation) (json.RawMessage, error) {
	return f(ctx, inv)
}

// Count returns how many recorded calls used a capability.
func (h *Host) Count(capability string) int {
	h.mu.Lock()
	defer h.mu.Unlock()
	n := 0
	for _, c := range h.Calls {
		if c.Capability == capability {
			n++
		}
	}
	return n
}

// Inputs returns the distinct RoleCall.Input byte strings seen.
func (h *Host) Inputs() []string {
	h.mu.Lock()
	defer h.mu.Unlock()
	seen := map[string]bool{}
	var out []string
	for _, c := range h.Calls {
		s := string(c.Call.Input)
		if !seen[s] {
			seen[s] = true
			out = append(out, s)
		}
	}
	return out
}

// Audits returns the audit references seen, one entry per call that
// carried one.
func (h *Host) Audits() []string {
	h.mu.Lock()
	defer h.mu.Unlock()
	var out []string
	for _, c := range h.Calls {
		if c.Call.AuditRef != "" {
			out = append(out, c.Capability+"="+c.Call.AuditRef)
		}
	}
	return out
}

// ErrLost simulates a lost reply.
var ErrLost = errors.New("fixture: reply lost")
