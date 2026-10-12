package steps

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/fixture"
	api "github.com/kai/prior/moduleapi/v1"
)

func TestOpenBundleServesDeclaredDataOnly(t *testing.T) {
	root := fixture.Bundle(t, fixture.CatalogDir(t))
	if err := os.WriteFile(filepath.Join(root, "extra.json"), []byte("{}"), 0o644); err != nil {
		t.Fatal(err)
	}
	b, err := OpenBundle(root)
	if err != nil {
		t.Fatal(err)
	}
	if b.Manifest.ID != "fusion" || b.Manifest.Executable != "bin/fusion-module" || len(b.Manifest.Data) != len(fixture.DataFiles) {
		t.Fatalf("manifest %+v", b.Manifest)
	}
	for _, p := range fixture.DataFiles {
		if _, err := b.Asset(p); err != nil {
			t.Errorf("%s: %v", p, err)
		}
	}
	if _, err := b.Asset("extra.json"); err == nil {
		t.Error("an undeclared file was served")
	}
	if _, err := b.Asset("module.json"); err == nil {
		t.Error("the manifest was served as data")
	}
	if _, err := b.Schema("catalog.json"); err == nil {
		t.Error("a non-schema asset compiled as a schema")
	}
	for _, name := range []string{"explorer-request", "explorer-role-input", "explorer-envelope", "explorer-result"} {
		if _, err := b.Schema("schemas/" + name + ".v1.json"); err != nil {
			t.Errorf("%s: %v", name, err)
		}
	}
	if _, err := OpenBundle("relative/path"); err == nil {
		t.Error("a relative root was accepted")
	}
}

func TestOpenBundleRefusesMissingAndOversizeData(t *testing.T) {
	root := fixture.Bundle(t, fixture.CatalogDir(t))
	if err := os.Remove(filepath.Join(root, "profiles", "explorer.md")); err != nil {
		t.Fatal(err)
	}
	if _, err := OpenBundle(root); err == nil {
		t.Error("a missing declared file was accepted")
	}
	if err := os.WriteFile(filepath.Join(root, "profiles", "explorer.md"), make([]byte, MaxAssetBytes+1), 0o644); err != nil {
		t.Fatal(err)
	}
	if _, err := OpenBundle(root); err == nil {
		t.Error("an oversize declared file was accepted")
	}
}

func TestLocateRoot(t *testing.T) {
	root := fixture.Bundle(t, fixture.CatalogDir(t))
	bin := filepath.Join(root, "bin", "darwin-arm64")
	if err := os.MkdirAll(bin, 0o755); err != nil {
		t.Fatal(err)
	}
	exe := filepath.Join(bin, "fusion-module")
	if err := os.WriteFile(exe, []byte("#!/bin/sh\n"), 0o755); err != nil {
		t.Fatal(err)
	}
	got, err := LocateRoot(exe)
	if err != nil {
		t.Fatal(err)
	}
	want, _ := filepath.EvalSymlinks(root)
	if got != want {
		t.Fatalf("root %s, want %s", got, want)
	}
	stray := filepath.Join(t.TempDir(), "a", "b", "c", "d", "e", "fusion-module")
	if err := os.MkdirAll(filepath.Dir(stray), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(stray, nil, 0o755); err != nil {
		t.Fatal(err)
	}
	if _, err := LocateRoot(stray); err == nil {
		t.Error("an executable outside any bundle located a root")
	}
}

func TestCatalogResolvesSupportedRolesOnly(t *testing.T) {
	b, err := OpenBundle(fixture.Bundle(t, fixture.CatalogDir(t)))
	if err != nil {
		t.Fatal(err)
	}
	c, err := LoadCatalog(b)
	if err != nil {
		t.Fatal(err)
	}
	// The four roles the catalog supports on Prior since plan step 16
	// resolve, the reviewer through its two aliases with their domains;
	// every other role, and a name outside the catalog, refuses.
	for name, want := range map[string]struct{ id, domain string }{"explorer": {"explorer", ""}, "code-implementer": {"code-implementer", ""}, "reviewer": {"reviewer", ""}, "code-reviewer": {"reviewer", "code"}, "data-reviewer": {"reviewer", "ontology"}, "state-auditor": {"state-auditor", ""}} {
		role, domain, err := c.Resolve(name)
		if err != nil || role.ID != want.id || domain != want.domain {
			t.Errorf("%s: %+v %q %v", name, role, domain, err)
		}
	}
	for _, name := range []string{"defect-fixer", "orchestrator", "data-implementer", "plan-reviewer", "analyst", "nobody"} {
		if _, _, err := c.Resolve(name); err == nil {
			t.Errorf("%s resolved", name)
		}
	}
	p, err := LoadProfile(b, "explorer")
	if err != nil {
		t.Fatal(err)
	}
	if p.InputSchema != "schemas/explorer-role-input.v1.json" || p.ResultSchema != "schemas/explorer-result.v1.json" || p.MayDelegate || p.WritesWorkbench["prior"] {
		t.Fatalf("profile %+v", p)
	}
	if p, err := LoadProfile(b, "reviewer"); err != nil || p.InputSchema != "schemas/review-request.v1.json" || p.ResultSchema != "schemas/review-response.v1.json" || p.MayDelegate || p.WritesWorkbench["prior"] {
		t.Errorf("reviewer profile %+v: %v", p, err)
	}
	if _, err := LoadProfile(b, "analyst"); err == nil {
		t.Error("an unsupported role's absent profile loaded")
	}
	w, err := LoadWorkflow(b, "workflows/explorer.v1.json")
	if err != nil {
		t.Fatal(err)
	}
	if w.Capability != "fusion.explorer.v1" || len(w.Steps) != 1 || w.Steps[0].Role != "explorer" || w.ReviseBound != 0 || !w.Declares(RoleCapabilities...) {
		t.Fatalf("workflow %+v", w)
	}
}

func TestDecodeExactMirrorsPrior(t *testing.T) {
	var out struct {
		A string  `json:"a"`
		B *string `json:"claude_name"`
	}
	if err := decodeExact([]byte(`{"a":"x","claude_name":null}`), &out, "a", "claude_name"); err != nil {
		t.Error(err)
	}
	for _, body := range []string{`{"a":null,"claude_name":"y"}`, `{"a":"x"}`, `{"a":"x","claude_name":"y","c":1}`, `{"a":"x","a":"y","claude_name":null}`, `[]`} {
		if err := decodeExact([]byte(body), &out, "a", "claude_name"); err == nil {
			t.Errorf("accepted %s", body)
		}
	}
}

func TestCheckFrame(t *testing.T) {
	small := api.Invocation{OperationID: "op", Capability: "x", Input: []byte(`{}`)}
	if err := CheckFrame("host.invoke", small); err != nil {
		t.Fatal(err)
	}
	big := api.Invocation{OperationID: "op", Capability: "x", Input: []byte(`"` + strings.Repeat("a", api.DefaultMaxFrame) + `"`)}
	if err := CheckFrame("host.invoke", big); err == nil {
		t.Fatal("an oversize payload passed")
	}
}
