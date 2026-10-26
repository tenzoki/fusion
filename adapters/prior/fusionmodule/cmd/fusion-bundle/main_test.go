package main

import (
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"reflect"
	"sort"
	"strings"
	"testing"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/fixture"
	api "github.com/kai/prior/moduleapi/v1"
)

// fusionRoot is the fusion checkout stage.sh staged from: the parent of the
// catalog directory it exports. Outside stage.sh the test skips.
func fusionRoot(t *testing.T) string {
	t.Helper()
	return filepath.Dir(fixture.CatalogDir(t))
}

// installLoop reads the entries of install.sh's copy loop: the words between
// `for item in` and `; do`, across backslash-continued lines.
func installLoop(t *testing.T, script string) []string {
	t.Helper()
	start := strings.Index(script, "\nfor item in ")
	if start < 0 {
		t.Fatal("install.sh has no `for item in` loop")
	}
	rest := script[start+len("\nfor item in "):]
	end := strings.Index(rest, "; do")
	if end < 0 {
		t.Fatal("install.sh's copy loop has no `; do`")
	}
	return strings.Fields(strings.ReplaceAll(rest[:end], "\\\n", " "))
}

func TestInstallEntriesAreTheInstallLoop(t *testing.T) {
	body, err := os.ReadFile(filepath.Join(fusionRoot(t), "install.sh"))
	if err != nil {
		t.Fatal(err)
	}
	if loop := installLoop(t, string(body)); !reflect.DeepEqual(loop, installEntries) {
		t.Fatalf("installEntries %v differ from install.sh's copy loop %v", installEntries, loop)
	}
}

func TestInstallLoopParsesContinuations(t *testing.T) {
	script := "#!/bin/sh\nfor item in a b \\\n            c; do\n  cp -R x y\ndone\n"
	if got := installLoop(t, script); !reflect.DeepEqual(got, []string{"a", "b", "c"}) {
		t.Fatalf("got %v", got)
	}
}

// gitRepo makes a repository with an index holding the given files, a link
// and an untracked file.
func gitRepo(t *testing.T) string {
	t.Helper()
	root := t.TempDir()
	files := map[string]os.FileMode{
		"bin/fusion-paths":           0o755,
		"rules/a.md":                 0o644,
		"hooks/hooks.json":           0o644,
		"README.md":                  0o644,
		"catalog/not-installed.json": 0o644,
	}
	for p, mode := range files {
		full := filepath.Join(root, filepath.FromSlash(p))
		if err := os.MkdirAll(filepath.Dir(full), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(full, []byte("body of "+p+"\n"), mode); err != nil {
			t.Fatal(err)
		}
	}
	if err := os.Symlink("a.md", filepath.Join(root, "rules", "link.md")); err != nil {
		t.Fatal(err)
	}
	for _, args := range [][]string{{"init", "-q"}, {"add", "-A"}} {
		if out, err := exec.Command("git", append([]string{"-C", root}, args...)...).CombinedOutput(); err != nil {
			t.Fatalf("git %v: %v: %s", args, err, out)
		}
	}
	if err := os.WriteFile(filepath.Join(root, "rules", "untracked.md"), []byte("x"), 0o644); err != nil {
		t.Fatal(err)
	}
	return root
}

func TestInstallTreeReadsTheIndex(t *testing.T) {
	root := gitRepo(t)
	tree, omitted, err := installTree(root)
	if err != nil {
		t.Fatal(err)
	}
	got := map[string]os.FileMode{}
	for _, f := range tree {
		got[f.Path] = f.Mode
		if want := "body of " + f.Path + "\n"; string(f.Body) != want {
			t.Errorf("%s: body %q, want %q", f.Path, f.Body, want)
		}
	}
	want := map[string]os.FileMode{"bin/fusion-paths": 0o500, "rules/a.md": 0o400, "hooks/hooks.json": 0o400, "README.md": 0o400}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("tree %v, want %v (the untracked file and catalog/ stay out)", got, want)
	}
	if !reflect.DeepEqual(omitted, []omittedLink{{"rules/link.md", "a.md"}}) {
		t.Fatalf("omitted %v", omitted)
	}
}

func TestCollisionsAreRefused(t *testing.T) {
	reserved := moduleReserved([]string{"catalog.json", "profiles/explorer.md"})
	for _, p := range []string{"bin/fusion-module", "module.json", "build-identity.json", "catalog.json", "profiles", "profiles/explorer.md/x", "bin/darwin-arm64", "bin/linux-amd64/fusion-module"} {
		if err := checkCollisions([]treeFile{{Path: p}}, reserved); err == nil {
			t.Errorf("%s: no collision reported", p)
		}
	}
	for _, p := range []string{"bin/fusion-paths", "hooks/hooks.json", "profiles.md", "bin/fusion-module-x"} {
		if err := checkCollisions([]treeFile{{Path: p}}, reserved); err != nil {
			t.Errorf("%s: %v", p, err)
		}
	}
}

func TestLifecycleHooksDeclaration(t *testing.T) {
	if _, err := lifecycleHooks([]treeFile{{Path: "rules/a.md"}}); err == nil {
		t.Fatal("a tree without hooks/hooks.json was declared")
	}
	body := []byte(`{"hooks":{}}`)
	hooks, err := lifecycleHooks([]treeFile{{Path: hooksPath, Body: body}})
	if err != nil {
		t.Fatal(err)
	}
	manifest := api.Manifest{SchemaVersion: 1, ID: ModuleID, Version: "13.4.0", RuntimeAPI: "1", Executable: launcherPath, Data: []string{"catalog.json"}, LifecycleHooks: hooks}
	encoded, err := json.Marshal(manifest)
	if err != nil {
		t.Fatal(err)
	}
	decoded, _, err := api.DecodeManifest(encoded)
	if err != nil {
		t.Fatalf("Prior's decoder refuses the declaration: %v", err)
	}
	if err := decoded.LifecycleHooks.VerifyFile("sha256:" + hexSum(body)); err != nil {
		t.Fatal(err)
	}
	index := bundleIndex{Files: []bundleFile{{launcherPath, "sha256:" + hexSum(nil), true}, {"catalog.json", "sha256:" + hexSum(nil), false}, {hooksPath, "sha256:" + hexSum([]byte("other")), false}}}
	if err := checkAgainstManifest(index, decoded); err == nil {
		t.Fatal("a hooks.json whose digest differs from the declaration passed")
	}
}

// The declared events are exactly the events fusion's hooks.json registers.
func TestDeclaredEventsAreTheRegisteredOnes(t *testing.T) {
	body, err := os.ReadFile(filepath.Join(fusionRoot(t), filepath.FromSlash(hooksPath)))
	if err != nil {
		t.Fatal(err)
	}
	var registration struct {
		Hooks map[string]json.RawMessage `json:"hooks"`
	}
	if err := json.Unmarshal(body, &registration); err != nil {
		t.Fatal(err)
	}
	var registered []string
	for event := range registration.Hooks {
		registered = append(registered, event)
	}
	declared := append([]string(nil), hookSubset().Events...)
	sort.Strings(registered)
	sort.Strings(declared)
	if !reflect.DeepEqual(registered, declared) {
		t.Fatalf("hooks.json registers %v, the manifest declares %v", registered, declared)
	}
}

// fusion's own install tree carries what the plan names, and none of it
// collides with the module's paths.
func TestFusionInstallTree(t *testing.T) {
	tree, _, err := installTree(fusionRoot(t))
	if err != nil {
		t.Fatal(err)
	}
	modes := map[string]os.FileMode{}
	for _, f := range tree {
		modes[f.Path] = f.Mode
	}
	for p, mode := range map[string]os.FileMode{"bin/fusion-paths": 0o500, "bin/fusion-rules": 0o500, hooksPath: 0o400, "agents/orchestrator.md": 0o400, ".claude-plugin/plugin.json": 0o400, "codec/dist/fusion-record.js": 0o400, "hooks/package.json": 0o400, "codec/package.json": 0o400} {
		if modes[p] != mode {
			t.Errorf("%s: mode %o, want %o", p, modes[p], mode)
		}
	}
	data := append([]string(nil), fixture.DataFiles...)
	if err := checkCollisions(tree, moduleReserved(data)); err != nil {
		t.Fatal(err)
	}
}
