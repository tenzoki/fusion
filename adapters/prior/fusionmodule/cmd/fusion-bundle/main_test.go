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
	tree, omitted, err := installTree(root, 0)
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

// priorListing is an install-tree listing holding the Prior request side:
// the status file, the frozen log, three request files and a neighbour that
// is carried.
var priorListing = []string{
	"bin/fusion-paths",
	"codec/fixtures/prior/REQUESTS.md",
	"codec/fixtures/prior/STATUS.md",
	"codec/fixtures/prior/campaign/x/fusion.json",
	"codec/fixtures/prior/requests/082-hook-replay.md",
	"codec/fixtures/prior/requests/083-first.md",
	"codec/fixtures/prior/requests/084-second.md",
}

// A bundle never carries STATUS.md or the frozen REQUESTS.md, and without
// -request no file under requests/.
func TestBundlePathsDropStatusLogAndRequests(t *testing.T) {
	got, err := bundlePaths(priorListing, 0)
	if err != nil {
		t.Fatal(err)
	}
	want := []string{"bin/fusion-paths", "codec/fixtures/prior/campaign/x/fusion.json"}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("bundle paths %v, want %v", got, want)
	}
}

// With -request the bundle carries that request's file and no other.
func TestBundlePathsCarryOnlyTheNamedRequest(t *testing.T) {
	got, err := bundlePaths(priorListing, 83)
	if err != nil {
		t.Fatal(err)
	}
	want := []string{"bin/fusion-paths", "codec/fixtures/prior/campaign/x/fusion.json", "codec/fixtures/prior/requests/083-first.md"}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("bundle paths %v, want %v", got, want)
	}
}

func TestBundlePathsRefuseZeroOrManyRequestFiles(t *testing.T) {
	if _, err := bundlePaths(priorListing, 85); err == nil {
		t.Error("-request 85 matches no file and was accepted")
	}
	// A file in a subdirectory or with another extension is not a match.
	odd := append(append([]string(nil), priorListing...), "codec/fixtures/prior/requests/085-x/a.md", "codec/fixtures/prior/requests/085-x.txt")
	if _, err := bundlePaths(odd, 85); err == nil {
		t.Error("-request 85 matched a file in a subdirectory or a non-.md file")
	}
	twice := append(append([]string(nil), priorListing...), "codec/fixtures/prior/requests/083-again.md")
	if _, err := bundlePaths(twice, 83); err == nil {
		t.Error("-request 83 matches two files and was accepted")
	}
}

// The filter reaches the tree installTree reads from git's index.
func TestInstallTreeLeavesThePriorRequestSideOut(t *testing.T) {
	root := t.TempDir()
	for _, p := range priorListing {
		full := filepath.Join(root, filepath.FromSlash(p))
		if err := os.MkdirAll(filepath.Dir(full), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(full, []byte("body of "+p+"\n"), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	for _, args := range [][]string{{"init", "-q"}, {"add", "-A"}} {
		if out, err := exec.Command("git", append([]string{"-C", root}, args...)...).CombinedOutput(); err != nil {
			t.Fatalf("git %v: %v: %s", args, err, out)
		}
	}
	for request, want := range map[int][]string{
		0:  {"bin/fusion-paths", "codec/fixtures/prior/campaign/x/fusion.json"},
		84: {"bin/fusion-paths", "codec/fixtures/prior/campaign/x/fusion.json", "codec/fixtures/prior/requests/084-second.md"},
	} {
		tree, _, err := installTree(root, request)
		if err != nil {
			t.Fatal(err)
		}
		var got []string
		for _, f := range tree {
			got = append(got, f.Path)
		}
		sort.Strings(got)
		if !reflect.DeepEqual(got, want) {
			t.Errorf("request %d: tree %v, want %v", request, got, want)
		}
	}
	if _, _, err := installTree(root, 85); err == nil {
		t.Error("installTree accepted -request 85, which matches no file")
	}
}

func TestRequestFlagMustBePositive(t *testing.T) {
	for _, v := range []string{"0", "-3"} {
		err := run([]string{"-request", v})
		if err == nil || !strings.Contains(err.Error(), "-request must be a positive integer") {
			t.Errorf("-request %s: %v", v, err)
		}
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
	tree, _, err := installTree(fusionRoot(t), 0)
	if err != nil {
		t.Fatal(err)
	}
	modes := map[string]os.FileMode{}
	for _, f := range tree {
		modes[f.Path] = f.Mode
		if contains(bundleExcluded, f.Path) || strings.HasPrefix(f.Path, priorRequestsDir) {
			t.Errorf("%s is in the install tree; a bundle never carries it", f.Path)
		}
	}
	for p, mode := range map[string]os.FileMode{"bin/fusion-paths": 0o500, "bin/fusion-rules": 0o500, hooksPath: 0o400, "agents/orchestrator.md": 0o400, ".claude-plugin/plugin.json": 0o400, "codec/dist/fusion-record.js": 0o400, "hooks/package.json": 0o400, "codec/package.json": 0o400} {
		if modes[p] != mode {
			t.Errorf("%s: mode %o, want %o", p, modes[p], mode)
		}
	}
	data := fixture.DataFiles(t, fixture.CatalogDir(t))
	if err := checkCollisions(tree, moduleReserved(data)); err != nil {
		t.Fatal(err)
	}
}

// The data selection takes every version of a published asset, directly under
// schemas/ and workflows/, and leaves the meta-schemas, the freeze lists,
// a v0 name and anything in a subdirectory at home: a v2 beside a v1 lands in
// the payload's data files.
func TestCopyTreeTakesEveryPublishedVersion(t *testing.T) {
	catalog := t.TempDir()
	files := []string{
		"schemas/entry-request.v1.json",
		"schemas/entry-result.v1.json",
		"schemas/entry-result.v2.json",
		"schemas/x.v10.json",
		"schemas/workflow.schema.json",
		"schemas/FROZEN",
		"schemas/WITHDRAWN",
		"schemas/x.v0.json",
		"schemas/x.v01.json",
		"schemas/old/y.v1.json",
		"workflows/explorer.v1.json",
		"workflows/entry.v2.json",
		"workflows/notes.md",
	}
	for _, p := range files {
		full := filepath.Join(catalog, filepath.FromSlash(p))
		if err := os.MkdirAll(filepath.Dir(full), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(full, []byte("{}\n"), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	w := writer{root: t.TempDir()}
	for _, dir := range []string{"workflows", "schemas"} {
		if err := w.copyTree(filepath.Join(catalog, dir), dir, isPublishedAsset); err != nil {
			t.Fatal(err)
		}
	}
	got := append([]string(nil), w.written...)
	sort.Strings(got)
	want := []string{
		"schemas/entry-request.v1.json",
		"schemas/entry-result.v1.json",
		"schemas/entry-result.v2.json",
		"schemas/x.v10.json",
		"workflows/entry.v2.json",
		"workflows/explorer.v1.json",
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("data files %v, want %v", got, want)
	}
	for _, p := range want {
		if _, err := os.Stat(filepath.Join(w.root, filepath.FromSlash(p))); err != nil {
			t.Errorf("%s not written to the payload: %v", p, err)
		}
	}
}
