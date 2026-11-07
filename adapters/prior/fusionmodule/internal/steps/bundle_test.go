package steps

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/fixture"
	api "github.com/kai/prior/moduleapi/v1"
)

func TestOpenBundleServesDeclaredDataOnly(t *testing.T) {
	root := fixture.Bundle(t, fixture.CatalogDir(t))
	declared := fixture.DataFiles(t, fixture.CatalogDir(t))
	if err := os.WriteFile(filepath.Join(root, "extra.json"), []byte("{}"), 0o644); err != nil {
		t.Fatal(err)
	}
	b, err := OpenBundle(root)
	if err != nil {
		t.Fatal(err)
	}
	if b.Manifest.ID != "fusion" || b.Manifest.Executable != "bin/fusion-module" || len(b.Manifest.Data) != len(declared) {
		t.Fatalf("manifest %+v", b.Manifest)
	}
	for _, p := range declared {
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
	// Every published schema the payload carries compiles.
	for _, p := range fixture.Schemas(t, fixture.CatalogDir(t)) {
		if _, err := b.Schema(p); err != nil {
			t.Errorf("%s: %v", p, err)
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
	catalogDir := fixture.CatalogDir(t)
	b, err := OpenBundle(fixture.Bundle(t, catalogDir))
	if err != nil {
		t.Fatal(err)
	}
	c, err := LoadCatalog(b)
	if err != nil {
		t.Fatal(err)
	}
	// Each role of the bundle's catalog, by its id and through each alias
	// with its domain, resolves exactly when it is supported on prior; the
	// expectation is read from the catalog, so a support state the catalog
	// changes moves it with the data.
	body, err := b.Asset("catalog.json")
	if err != nil {
		t.Fatal(err)
	}
	var doc struct {
		Roles []Role `json:"roles"`
	}
	if err := json.Unmarshal(body, &doc); err != nil {
		t.Fatal(err)
	}
	supported := 0
	for _, r := range doc.Roles {
		names := map[string]string{r.ID: ""}
		for _, a := range r.Aliases {
			names[a.ID] = a.Domain
		}
		for name, domain := range names {
			role, got, err := c.Resolve(name)
			if r.Support["prior"] != "supported" {
				if err == nil {
					t.Errorf("%s resolved, its role %s being %s on prior", name, r.ID, r.Support["prior"])
				}
				continue
			}
			if err != nil || role.ID != r.ID || got != domain {
				t.Errorf("%s: %+v %q %v", name, role, got, err)
			}
		}
		if r.Support["prior"] == "supported" {
			supported++
		}
	}
	if supported == 0 {
		t.Fatal("no role of the catalog is supported on prior: the explorer workflow has no role")
	}
	if _, _, err := c.Resolve("nobody"); err == nil {
		t.Error("a name outside the catalog resolved")
	}
	// Each profile the payload carries loads, and the input and result
	// schemas it names resolve inside the payload.
	for _, id := range fixture.PayloadProfiles(t, catalogDir) {
		p, err := LoadProfile(b, id)
		if err != nil {
			t.Errorf("%s: %v", id, err)
			continue
		}
		for _, schema := range []string{p.InputSchema, p.ResultSchema} {
			if _, err := b.Schema(schema); err != nil {
				t.Errorf("profile %s names %s, which the payload does not resolve: %v", id, schema, err)
			}
		}
	}
	// The commit and migrate skills are held unsupported on Prior and each is
	// the only referrer of its profile, so no referrer ships either.
	for _, held := range []string{"skill-commit", "skill-migrate"} {
		if _, err := LoadProfile(b, held); err == nil {
			t.Errorf("an unsupported entry's absent profile %s loaded", held)
		}
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
