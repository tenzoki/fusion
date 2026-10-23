// Package fixture serves the adapter's tests: a payload directory built from
// fusion's catalog, a fake host whose three host.role.* services are durable
// in memory, in repair.go a fake host that adds the six repair services of
// Prior's answer 69 over it, and in entry.go a fake host for entry.v1 that
// serves those six to the module and the three entry services to a scripted
// role run. Nothing here is linked into the module executable.
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

// Profiles are the four roles the bundle serves on Prior, each with its
// rendered profile in the payload.
var Profiles = []string{"explorer", "code-implementer", "reviewer", "state-auditor"}

// Workflows are the definitions the payload carries.
var Workflows = []string{"explorer", "repair", "entry"}

// Schemas are the published schemas, as catalog/schemas/FROZEN lists them.
var Schemas = []string{
	"explorer-request", "explorer-role-input", "explorer-envelope", "explorer-result",
	"repair-request", "repair-result",
	"implementer-request", "implementer-result",
	"review-request", "review-response",
	"audit-request", "audit-result",
	"entry-request", "entry-result",
}

// DataFiles are the payload entries the fixture declares, in manifest order:
// the catalog, then each profile's pair, each workflow and each schema.
var DataFiles = dataFiles()

func dataFiles() []string {
	out := []string{"catalog.json"}
	for _, id := range Profiles {
		out = append(out, "profiles/"+id+".json", "profiles/"+id+".md")
	}
	for _, id := range Workflows {
		out = append(out, "workflows/"+id+".v1.json")
	}
	for _, name := range Schemas {
		out = append(out, "schemas/"+name+".v1.json")
	}
	return out
}

// Bundle writes a payload under a fresh temp directory from the catalog:
// catalog.json, the workflows and the schemas copied unchanged, each
// supported profile reduced to the seven keys Prior reads (as render.ts's
// priorProfileJson does), a placeholder profile text and a module.json that
// declares them. The executable the manifest names is not written: the tests
// never start a process.
func Bundle(t *testing.T, catalogDir string) string {
	t.Helper()
	return EntryBundle(t, catalogDir)
}

// EntryBundle is Bundle with the named catalog entries made supported on prior
// and, for each whose profile the payload does not carry yet, a profile that
// names the two entry schemas (decision D5 of the H1-H9 hand-over), with a
// placeholder text. It stands in for what plan steps 6 to 15 deliver, profiles
// for the entries and their support on prior, so the module's entry.v1 support
// is driven before they land; the live catalog is read, never written.
func EntryBundle(t *testing.T, catalogDir string, supported ...string) string {
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
	catalog, entryProfiles := supportEntries(t, catalogDir, supported)
	write("catalog.json", catalog)
	data := append([]string(nil), DataFiles...)
	for _, id := range entryProfiles {
		write("profiles/"+id+".json", EntryProfile(id))
		write("profiles/"+id+".md", []byte("fixture entry profile text\n"))
		data = append(data, "profiles/"+id+".json", "profiles/"+id+".md")
	}
	for _, id := range Workflows {
		copyFile("workflows/"+id+".v1.json", "workflows/"+id+".v1.json")
	}
	for _, name := range Schemas {
		copyFile("schemas/"+name+".v1.json", "schemas/"+name+".v1.json")
	}
	for _, id := range Profiles {
		profileBytes, err := os.ReadFile(filepath.Join(catalogDir, "profiles", id, "profile.json"))
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
		write("profiles/"+id+".json", reduced)
		write("profiles/"+id+".md", []byte("fixture profile text\n"))
	}
	manifest := map[string]any{"schema_version": 1, "module_id": Identity.ModuleID, "version": Identity.Version, "runtime_api": "1", "executable": "bin/fusion-module", "data": data}
	manifestBytes, err := json.Marshal(manifest)
	if err != nil {
		t.Fatal(err)
	}
	write("module.json", manifestBytes)
	return root
}

// supportEntries reads the live catalog.json and returns it with each named
// entry's prior support set to supported, unchanged when none is named, and
// the profiles of those entries that are not among Profiles, each once.
func supportEntries(t *testing.T, catalogDir string, supported []string) ([]byte, []string) {
	t.Helper()
	body, err := os.ReadFile(filepath.Join(catalogDir, "catalog.json"))
	if err != nil {
		t.Fatal(err)
	}
	if len(supported) == 0 {
		return body, nil
	}
	var doc map[string]json.RawMessage
	var entries []map[string]json.RawMessage
	if err := json.Unmarshal(body, &doc); err != nil {
		t.Fatal(err)
	}
	if err := json.Unmarshal(doc["entries"], &entries); err != nil {
		t.Fatal(err)
	}
	carried := map[string]bool{}
	for _, id := range Profiles {
		carried[id] = true
	}
	var profiles []string
	for _, want := range supported {
		found := false
		for _, e := range entries {
			var id, profile string
			_ = json.Unmarshal(e["id"], &id)
			_ = json.Unmarshal(e["profile"], &profile)
			if id != want {
				continue
			}
			found = true
			e["support"] = json.RawMessage(`{"claude-code":"supported","prior":"supported"}`)
			if !carried[profile] {
				carried[profile] = true
				profiles = append(profiles, profile)
			}
		}
		if !found {
			t.Fatalf("catalog.json has no entry %q", want)
		}
	}
	doc["entries"] = mustJSON(t, entries)
	return mustJSON(t, doc), profiles
}

// EntryProfile is the profile an entry runs under in the fixture payload: the
// seven keys Prior reads, the two entry schemas, and execution_policy as every
// profile has it.
func EntryProfile(id string) []byte {
	body, _ := json.Marshal(map[string]any{
		"id":               id,
		"input_schema":     "schemas/entry-request.v1.json",
		"result_schema":    "schemas/entry-result.v1.json",
		"tools_ceiling":    []string{"read", "list", "search", "create", "write", "process"},
		"may_delegate":     false,
		"writes_workbench": map[string]bool{"claude-code": true, "prior": true},
		"execution_policy": map[string]string{"claude-code": "claude-guided", "prior": "prior-enforced"},
	})
	return body
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
	// Model is called once per run on absent, whatever the profile; nil
	// consults Models by profile, and with no entry there answers Answer(1).
	Model func(input json.RawMessage) json.RawMessage
	// Models answers per profile when Model is nil, each given the run id and
	// the frozen input.
	Models map[string]func(runID string, input json.RawMessage) json.RawMessage
	// Profiles are the profiles the host serves; nil serves the explorer
	// alone, which is what the explorer cases expect.
	Profiles []string
	// Principal names the principal of a run's answer; nil names
	// principal:<profile>, one per profile.
	Principal func(profile, runID string) string
	// RequireAudit, when set, is the audit reference completion needs; any
	// other value, the empty one included, is refused recovery-required.
	RequireAudit string
	// RequireAuditRun, when set, confines RequireAudit to that run: its
	// completion needs the reference, and a completion of any other run
	// that carries a reference is refused invalid-request, since the
	// reference names one run and is never sent blindly to another.
	RequireAuditRun string
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

// Seed places an explorer run in a state before any call: accepted (no
// answer), answered or settled with the given output.
func (h *Host) Seed(runID, state string, input, output json.RawMessage) {
	h.SeedRole(runID, "explorer", state, input, output)
}

// SeedRole is Seed for a run of any profile.
func (h *Host) SeedRole(runID, profile, state string, input, output json.RawMessage) {
	h.mu.Lock()
	defer h.mu.Unlock()
	r := &Run{State: state, Input: append([]byte(nil), input...)}
	if output != nil {
		r.Answer = h.answer(runID, profile, output)
	}
	h.Runs[runID] = r
}

func (h *Host) answer(runID, profile string, output json.RawMessage) *api.RoleAnswer {
	return &api.RoleAnswer{RunID: runID, ModuleID: Identity.ModuleID, ModuleVersion: Identity.Version, Profile: profile, PrincipalID: h.principal(profile, runID), Output: output, ObservedAt: time.Date(2026, 10, 11, 9, 30, 0, 123456789, time.UTC)}
}

func (h *Host) principal(profile, runID string) string {
	if h.Principal != nil {
		return h.Principal(profile, runID)
	}
	return "principal:" + profile
}

func (h *Host) serves(profile string) bool {
	if h.Profiles == nil {
		return profile == "explorer"
	}
	for _, p := range h.Profiles {
		if p == profile {
			return true
		}
	}
	return false
}

func (h *Host) model(profile, runID string, input json.RawMessage) json.RawMessage {
	h.ModelCalls++
	if h.Model != nil {
		return h.Model(input)
	}
	if m := h.Models[profile]; m != nil {
		return m(runID, input)
	}
	return Answer(1)
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
	if call.Identity != Identity || !h.serves(call.Profile) {
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
			output := h.model(call.Profile, call.RunID, call.Input)
			run = &Run{State: "answered", Input: append([]byte(nil), call.Input...), Answer: h.answer(call.RunID, call.Profile, output)}
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
		if h.RequireAuditRun != "" && call.RunID != h.RequireAuditRun {
			if call.AuditRef != "" {
				return api.RoleResponse{State: "refused", Code: "invalid-request"}
			}
		} else if h.RequireAudit != "" && call.AuditRef != h.RequireAudit {
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
