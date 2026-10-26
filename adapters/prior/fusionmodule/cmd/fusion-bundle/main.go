// fusion-bundle assembles fusion's Prior module bundle: the payload directory,
// its identity by Prior's documented index algorithm, the deterministic
// tarball, the sha256 sidecar and the hand-over record (Prior answers 67.4,
// 67.8, 67.9; plan step 8).
//
// It is built and run natively inside the staged Prior clone by
// adapters/prior/build.sh and never shipped: nothing in the payload names or
// carries it. Running in the clone is what lets it execute the three target
// builds in Prior's exact form against Prior's root go.mod and record the
// toolchain that did it.
//
// Inputs are the rendered catalog assets (`render prior`), fusion's catalog
// for the workflow and schema files, the install tree from fusion's git
// index, the launcher, the adapter sources for the inventory, and the two
// revisions.
//
// The install tree is every file git lists under the entries of install.sh's
// copy loop, at the payload root in the plugin's own layout, so the helpers,
// hooks and skills find under Prior the tree a Claude Code install holds
// (decision 261023-1854, which plugin tree the bundle payload carries, option
// 2). None of it is a manifest data file: the module never reads it. The
// manifest's lifecycle_hooks pins the carried hooks/hooks.json.
//
// Output is one directory outside both repositories:
//
//	<out>/payload/                  the bundle, as Prior inspects it
//	<out>/fusion-<version>.tar      the payload, uncompressed, normalized
//	<out>/fusion-<version>.tar.sha256
//	<out>/handover.json
//
// The last three never enter the payload; the payload's own
// build-identity.json inventories every other payload file and excludes
// itself, while the bundle digest covers all of them (67.8).
package main

import (
	"archive/tar"
	"bufio"
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"io/fs"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"runtime"
	"sort"
	"strconv"
	"strings"
	"time"

	api "github.com/kai/prior/moduleapi/v1"
)

// ModuleID is the module id Prior accepted for fusion (67.3).
const ModuleID = "fusion"

// manifestPath is the manifest name Prior's CLI defaults to.
const manifestPath = "module.json"

// launcherPath is the manifest's executable; the binaries sit beside it.
const launcherPath = "bin/fusion-module"

// entryPoint is the staged package the targets are built from (67.4).
const entryPoint = "./integrationbuild/fusionmodule/cmd/fusion-module"

// identityPath is the build record inside the payload.
const identityPath = "build-identity.json"

// installEntries restates the entries of install.sh's copy loop, in its
// order. install.sh is the one authority for what an install holds;
// TestInstallEntriesAreTheInstallLoop fails when the two differ.
var installEntries = []string{
	".claude-plugin", "agents", "skills", "rules", "hooks", "codec", "bin", "stilwerk", "templates", "docs",
	"README.md", "README-agents.md", "README-hooks.md", "LICENSE",
}

// hooksPath is the hook registration the manifest's lifecycle_hooks pins.
const hooksPath = "hooks/hooks.json"

// hookSubset is the part of Claude Code's hook protocol the carried hooks
// rely on, in Prior's vocabulary (moduleapi/v1 HookEvents, HookReplyForms,
// HookReplyFields). Read from hooks/hooks.json and the hook sources: the
// events are hooks.json's four keys; "empty" is the CLAUDE_ENV_FILE commands
// and subagent-stop.js, "text" is session-id.js's plain line, "json" the
// SessionStart printf, session-start.js, identity-notice.js, guard.js's `{}`
// and tracker.js; the fields are hookEventName and systemMessage (SessionStart)
// and additionalContext (tracker.js, PostToolUse). The hook-layout
// conformance measures every observed reply against this declaration.
func hookSubset() api.HookProtocolSubset {
	return api.HookProtocolSubset{
		Events:      []string{"SessionStart", "PreToolUse", "PostToolUse", "SubagentStop"},
		ReplyForms:  []string{"empty", "text", "json"},
		ReplyFields: []string{"hookSpecificOutput.hookEventName", "hookSpecificOutput.systemMessage", "hookSpecificOutput.additionalContext"},
	}
}

// target is one of the three platforms the bundle carries (67.9).
type target struct{ OS, Arch string }

var targets = []target{{"darwin", "arm64"}, {"linux", "amd64"}, {"linux", "arm64"}}

func (t target) name() string { return t.OS + "-" + t.Arch }

// binaryPath is the payload path of a target's binary.
func (t target) binaryPath() string { return "bin/" + t.name() + "/fusion-module" }

// command is Prior's exact build form for a target. The output path is
// recorded with the placeholder <payload> for the payload directory: an
// absolute scratch path would differ between two builds and must stay out of
// reproducible metadata (67.8).
func (t target) command(payload string) string {
	return "GOWORK=off GOTOOLCHAIN=local CGO_ENABLED=0 GOOS=" + t.OS + " GOARCH=" + t.Arch +
		" go build -mod=readonly -trimpath -buildvcs=false -o " + payload + "/" + t.binaryPath() + " " + entryPoint
}

// bundleIndex and bundleFile restate Prior's BundleIndex and BundleFile
// (internal/module/bundle.go at PRIOR_PIN) field for field and tag for tag:
// the bundle digest is sha256 over json.Marshal of this struct, so the bytes
// must be the ones Prior produces. The assembler cannot import Prior's
// internal package (67.4); build.sh verify runs Prior's own InspectBundle
// over the result to prove the two agree.
type bundleIndex struct {
	SchemaVersion int          `json:"schema_version"`
	ManifestPath  string       `json:"manifest_path"`
	Files         []bundleFile `json:"files"`
}

type bundleFile struct {
	Path       string `json:"path"`
	Digest     string `json:"digest"`
	Executable bool   `json:"executable"`
}

// hashedFile is one inventory row of build-identity.json.
type hashedFile struct {
	Path   string `json:"path"`
	SHA256 string `json:"sha256"`
}

// builtTarget is one target row of build-identity.json and handover.json.
type builtTarget struct {
	OS      string `json:"os"`
	Arch    string `json:"arch"`
	Command string `json:"command"`
	SHA256  string `json:"sha256"`
}

// buildIdentity is build-identity.json, the shape of the plan's
// `## Data Structures`: itself absent from `payload`.
type buildIdentity struct {
	FusionRevision string        `json:"fusion_revision"`
	PriorRevision  string        `json:"prior_revision"`
	GoVersion      string        `json:"go_version"`
	AdapterSources []hashedFile  `json:"adapter_sources"`
	Targets        []builtTarget `json:"targets"`
	Payload        []hashedFile  `json:"payload"`
	// InstallTreeOmitted names the install-tree links the payload does not
	// carry: a bundle holds regular files only, and Prior's InspectBundle
	// refuses a link.
	InstallTreeOmitted []omittedLink `json:"install_tree_omitted"`
}

// treeFile is one install-tree file as fusion's git index holds it.
type treeFile struct {
	Path string
	Mode os.FileMode
	Body []byte
}

// omittedLink is an install-tree entry of git mode 120000 and its target.
type omittedLink struct {
	Path   string `json:"path"`
	Target string `json:"target"`
}

// handover is handover.json, the record that travels beside the tarball and
// is what Prior compares its `prior module inspect` output against (67.8).
type handover struct {
	ModuleID       string        `json:"module_id"`
	Version        string        `json:"version"`
	BundleDigest   string        `json:"bundle_digest"`
	Tarball        string        `json:"tarball"`
	TarballSHA256  string        `json:"tarball_sha256"`
	FusionRevision string        `json:"fusion_revision"`
	PriorRevision  string        `json:"prior_revision"`
	GoVersion      string        `json:"go_version"`
	Targets        []builtTarget `json:"targets"`
	Commands       []string      `json:"commands"`
}

type stringList []string

func (l *stringList) String() string     { return strings.Join(*l, " ") }
func (l *stringList) Set(v string) error { *l = append(*l, v); return nil }

func main() {
	if err := run(os.Args[1:]); err != nil {
		fmt.Fprintln(os.Stderr, "fusion-bundle:", err)
		os.Exit(1)
	}
}

type options struct {
	out, clone, fusionRoot, rendered, launcher, adapter string
	fusionRevision, priorRevision                       string
	commands                                            stringList
}

func run(args []string) error {
	var o options
	flags := flag.NewFlagSet("fusion-bundle", flag.ContinueOnError)
	flags.StringVar(&o.out, "out", "", "absolute output directory, empty or absent, outside both repositories")
	flags.StringVar(&o.clone, "clone", "", "absolute root of the staged Prior clone (FUSION_STAGE_CLONE)")
	flags.StringVar(&o.fusionRoot, "fusion-root", "", "absolute root of the fusion checkout")
	flags.StringVar(&o.rendered, "rendered", "", "absolute directory `render prior` wrote")
	flags.StringVar(&o.launcher, "launcher", "", "absolute path of the launcher script")
	flags.StringVar(&o.adapter, "adapter", "", "absolute adapters/prior directory, the source inventory")
	flags.StringVar(&o.fusionRevision, "fusion-revision", "", "fusion revision the build is from")
	flags.StringVar(&o.priorRevision, "prior-revision", "", "Prior revision the clone is at")
	flags.Var(&o.commands, "command", "an outer build command to record in handover.json (repeatable)")
	if err := flags.Parse(args); err != nil {
		return err
	}
	if flags.NArg() != 0 {
		return errors.New("unexpected positional arguments")
	}
	for name, value := range map[string]string{"out": o.out, "clone": o.clone, "fusion-root": o.fusionRoot, "rendered": o.rendered, "launcher": o.launcher, "adapter": o.adapter} {
		if !filepath.IsAbs(value) {
			return fmt.Errorf("-%s must be absolute, got %q", name, value)
		}
	}
	if o.fusionRevision == "" || o.priorRevision == "" {
		return errors.New("-fusion-revision and -prior-revision are required")
	}
	for _, repo := range []string{o.fusionRoot, o.clone} {
		if inside(o.out, repo) {
			return fmt.Errorf("-out %s lies inside %s; the bundle is built outside both repositories", o.out, repo)
		}
	}
	if err := ensureEmptyDir(o.out); err != nil {
		return err
	}
	return assemble(o)
}

func inside(p, root string) bool {
	rel, err := filepath.Rel(root, p)
	return err == nil && rel != ".." && !strings.HasPrefix(rel, "../")
}

func ensureEmptyDir(dir string) error {
	entries, err := os.ReadDir(dir)
	if errors.Is(err, os.ErrNotExist) {
		return os.MkdirAll(dir, 0o755)
	}
	if err != nil {
		return err
	}
	if len(entries) != 0 {
		return fmt.Errorf("%s is not empty", dir)
	}
	return nil
}

func assemble(o options) error {
	version, err := fusionVersion(o.fusionRoot)
	if err != nil {
		return err
	}
	payload := filepath.Join(o.out, "payload")
	if err := os.Mkdir(payload, 0o755); err != nil {
		return err
	}
	w := writer{root: payload}

	// Data: the render's profiles and catalog.json, then the workflow and
	// schema files straight from the catalog. Only files that exist are
	// copied, so a planned role's absent schemas never get a manifest entry
	// (Prior's follow-up of 2026-10-11).
	if err := w.copyTree(o.rendered, "", isRegularJSONOrMarkdown); err != nil {
		return fmt.Errorf("rendered assets: %w", err)
	}
	for _, dir := range []string{"workflows", "schemas"} {
		if err := w.copyTree(filepath.Join(o.fusionRoot, "catalog", dir), dir, isV1JSON); err != nil {
			return fmt.Errorf("catalog %s: %w", dir, err)
		}
	}
	data := append([]string(nil), w.written...)
	sort.Strings(data)
	for _, must := range []string{"catalog.json", "profiles/explorer.json", "profiles/explorer.md", "workflows/explorer.v1.json"} {
		if !contains(data, must) {
			return fmt.Errorf("payload lacks %s", must)
		}
	}

	// The install tree, beside the data and outside it. Every path is checked
	// against the module's own before any is written.
	tree, omitted, err := installTree(o.fusionRoot)
	if err != nil {
		return fmt.Errorf("install tree: %w", err)
	}
	if err := checkCollisions(tree, moduleReserved(data)); err != nil {
		return err
	}
	for _, f := range tree {
		if err := w.write(f.Path, f.Body, f.Mode); err != nil {
			return fmt.Errorf("install tree: %w", err)
		}
	}
	for _, l := range omitted {
		fmt.Fprintf(os.Stderr, "fusion-bundle: install tree: %s is a link to %s, not carried\n", l.Path, l.Target)
	}
	hooks, err := lifecycleHooks(tree)
	if err != nil {
		return err
	}

	// The launcher, then one native build per target in Prior's exact form.
	if err := w.copyFile(o.launcher, launcherPath, 0o500); err != nil {
		return err
	}
	var built []builtTarget
	for _, t := range targets {
		digest, err := buildTarget(o.clone, payload, t)
		if err != nil {
			return err
		}
		built = append(built, builtTarget{t.OS, t.Arch, t.command("<payload>"), digest})
	}

	manifest := api.Manifest{SchemaVersion: 1, ID: ModuleID, Version: version, RuntimeAPI: "1", Executable: launcherPath, Data: data, LifecycleHooks: hooks}
	manifestBytes, err := json.Marshal(manifest)
	if err != nil {
		return err
	}
	if _, _, err := api.DecodeManifest(manifestBytes); err != nil {
		return fmt.Errorf("module.json would not decode: %w", err)
	}
	if err := w.write(manifestPath, manifestBytes, 0o400); err != nil {
		return err
	}

	sources, err := inventory(o.adapter, []string{"fusionmodule", "launcher"})
	if err != nil {
		return fmt.Errorf("adapter sources: %w", err)
	}
	payloadFiles, err := inventory(payload, nil)
	if err != nil {
		return err
	}
	identity := buildIdentity{FusionRevision: o.fusionRevision, PriorRevision: o.priorRevision, GoVersion: runtime.Version(), AdapterSources: sources, Targets: built, Payload: payloadFiles, InstallTreeOmitted: omitted}
	identityBytes, err := prettyJSON(identity)
	if err != nil {
		return err
	}
	if err := w.write(identityPath, identityBytes, 0o400); err != nil {
		return err
	}

	index, err := indexPayload(payload)
	if err != nil {
		return err
	}
	if err := checkAgainstManifest(index, manifest); err != nil {
		return err
	}
	indexBytes, err := json.Marshal(index)
	if err != nil {
		return err
	}
	bundleDigest := "sha256:" + hexSum(indexBytes)
	id := api.Identity{ModuleID: ModuleID, Version: version, BundleDigest: bundleDigest}
	if err := id.Validate(); err != nil {
		return fmt.Errorf("identity %+v: %w", id, err)
	}

	tarName := "fusion-" + version + ".tar"
	tarPath := filepath.Join(o.out, tarName)
	tarSum, err := writeTarball(tarPath, payload, index)
	if err != nil {
		return err
	}
	if err := os.WriteFile(tarPath+".sha256", []byte(tarSum+"  "+tarName+"\n"), 0o444); err != nil {
		return err
	}
	var commands []string
	commands = append(commands, o.commands...)
	for _, b := range built {
		commands = append(commands, b.Command)
	}
	h := handover{ModuleID: ModuleID, Version: version, BundleDigest: bundleDigest, Tarball: tarName, TarballSHA256: tarSum, FusionRevision: o.fusionRevision, PriorRevision: o.priorRevision, GoVersion: runtime.Version(), Targets: built, Commands: commands}
	handoverBytes, err := prettyJSON(h)
	if err != nil {
		return err
	}
	if err := os.WriteFile(filepath.Join(o.out, "handover.json"), handoverBytes, 0o444); err != nil {
		return err
	}

	fmt.Printf("module_id %s\nversion %s\nbundle_digest %s\npayload %s\ntarball %s\ntarball_sha256 %s\nfiles %d\ninstall_tree_files %d\ninstall_tree_omitted %d\nlifecycle_hooks %s sha256:%s\n", ModuleID, version, bundleDigest, payload, tarPath, tarSum, len(index.Files), len(tree), len(omitted), hooks.Path, hooks.SHA256)
	return nil
}

// installTree reads the install tree from fusion's git index: every path
// `git ls-files -s` lists under installEntries, with the bytes of its blob,
// mode 0500 for git mode 100755 and 0400 for 100644. Reading the index, not
// the work tree, keeps an untracked file out by construction; a clean tree,
// which build.sh requires, makes the index HEAD. A link (120000) is returned
// as omitted; an unmerged entry or any other mode (a submodule) refuses the
// build.
func installTree(fusionRoot string) ([]treeFile, []omittedLink, error) {
	args := append([]string{"--literal-pathspecs", "-C", fusionRoot, "ls-files", "-s", "-z", "--"}, installEntries...)
	listing, err := gitOutput(nil, args...)
	if err != nil {
		return nil, nil, err
	}
	type entry struct{ mode, object, path string }
	var entries []entry
	for _, record := range strings.Split(string(listing), "\x00") {
		if record == "" {
			continue
		}
		meta, p, ok := strings.Cut(record, "\t")
		fields := strings.Fields(meta)
		if !ok || len(fields) != 3 {
			return nil, nil, fmt.Errorf("unreadable ls-files record %q", record)
		}
		if fields[2] != "0" {
			return nil, nil, fmt.Errorf("%s is unmerged (stage %s)", p, fields[2])
		}
		entries = append(entries, entry{fields[0], fields[1], p})
	}
	if len(entries) == 0 {
		return nil, nil, fmt.Errorf("git lists no file under %s in %s", strings.Join(installEntries, " "), fusionRoot)
	}
	objects := make([]string, len(entries))
	for i, e := range entries {
		objects[i] = e.object
	}
	bodies, err := readBlobs(fusionRoot, objects)
	if err != nil {
		return nil, nil, err
	}
	files := []treeFile{}
	omitted := []omittedLink{}
	for i, e := range entries {
		switch e.mode {
		case "100644":
			files = append(files, treeFile{e.path, 0o400, bodies[i]})
		case "100755":
			files = append(files, treeFile{e.path, 0o500, bodies[i]})
		case "120000":
			omitted = append(omitted, omittedLink{e.path, string(bodies[i])})
		default:
			return nil, nil, fmt.Errorf("%s has git mode %s; the install tree carries files and links only", e.path, e.mode)
		}
	}
	return files, omitted, nil
}

// readBlobs returns the bytes of each named blob, in order, through one
// `git cat-file --batch`.
func readBlobs(root string, objects []string) ([][]byte, error) {
	out, err := gitOutput(strings.NewReader(strings.Join(objects, "\n")+"\n"), "-C", root, "cat-file", "--batch")
	if err != nil {
		return nil, err
	}
	r := bufio.NewReader(bytes.NewReader(out))
	bodies := make([][]byte, len(objects))
	for i, object := range objects {
		header, err := r.ReadString('\n')
		if err != nil {
			return nil, fmt.Errorf("cat-file %s: %w", object, err)
		}
		fields := strings.Fields(header)
		if len(fields) != 3 || fields[0] != object || fields[1] != "blob" {
			return nil, fmt.Errorf("cat-file %s answered %q", object, strings.TrimSpace(header))
		}
		size, err := strconv.Atoi(fields[2])
		if err != nil || size < 0 {
			return nil, fmt.Errorf("cat-file %s: size %q", object, fields[2])
		}
		body := make([]byte, size)
		if _, err := io.ReadFull(r, body); err != nil {
			return nil, fmt.Errorf("cat-file %s: %w", object, err)
		}
		if b, err := r.ReadByte(); err != nil || b != '\n' {
			return nil, fmt.Errorf("cat-file %s: no record terminator", object)
		}
		bodies[i] = body
	}
	return bodies, nil
}

func gitOutput(stdin io.Reader, args ...string) ([]byte, error) {
	cmd := exec.Command("git", args...)
	cmd.Stdin = stdin
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	out, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("git %s: %w: %s", strings.Join(args, " "), err, strings.TrimSpace(stderr.String()))
	}
	return out, nil
}

// moduleReserved is every payload path the module's own files take: the data
// files, the manifest, the build record, the launcher and the three binaries.
func moduleReserved(data []string) []string {
	reserved := append([]string{manifestPath, identityPath, launcherPath}, data...)
	for _, t := range targets {
		reserved = append(reserved, t.binaryPath())
	}
	return reserved
}

// checkCollisions refuses an install-tree path that is a module path, or a
// directory of one, or lies below one: the two sets share the payload root
// and neither may shadow the other.
func checkCollisions(tree []treeFile, reserved []string) error {
	for _, f := range tree {
		for _, r := range reserved {
			if f.Path == r || strings.HasPrefix(r, f.Path+"/") || strings.HasPrefix(f.Path, r+"/") {
				return fmt.Errorf("install-tree path %s collides with the module's %s", f.Path, r)
			}
		}
	}
	return nil
}

// lifecycleHooks is the manifest's declaration of the carried hooks.json:
// its path, the sha256 of the bytes the payload holds, and hookSubset.
func lifecycleHooks(tree []treeFile) (*api.LifecycleHooks, error) {
	for _, f := range tree {
		if f.Path == hooksPath {
			hooks := &api.LifecycleHooks{Path: hooksPath, SHA256: hexSum(f.Body), ProtocolSubset: hookSubset()}
			if err := hooks.Validate(); err != nil {
				return nil, err
			}
			return hooks, nil
		}
	}
	return nil, fmt.Errorf("install tree lacks %s", hooksPath)
}

// fusionVersion reads the release version from .claude-plugin/plugin.json:
// the module's version is fusion's release version (67.3), never bumped here.
func fusionVersion(fusionRoot string) (string, error) {
	body, err := os.ReadFile(filepath.Join(fusionRoot, ".claude-plugin", "plugin.json"))
	if err != nil {
		return "", err
	}
	var plugin struct {
		Version string `json:"version"`
	}
	if err := json.Unmarshal(body, &plugin); err != nil {
		return "", fmt.Errorf("plugin.json: %w", err)
	}
	if plugin.Version == "" {
		return "", errors.New("plugin.json has no version")
	}
	return plugin.Version, nil
}

// writer writes payload files: always a new regular file with an explicit
// mode, never a link, and remembers what it wrote under data paths.
type writer struct {
	root    string
	written []string
}

func (w *writer) write(rel string, body []byte, mode os.FileMode) error {
	if !fs.ValidPath(rel) || strings.ContainsAny(rel, "\\:\x00") {
		return fmt.Errorf("payload path %q is not a bundle path", rel)
	}
	full := filepath.Join(w.root, filepath.FromSlash(rel))
	if err := os.MkdirAll(filepath.Dir(full), 0o755); err != nil {
		return err
	}
	f, err := os.OpenFile(full, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0o600)
	if err != nil {
		return err
	}
	_, writeErr := f.Write(body)
	modeErr := f.Chmod(mode)
	closeErr := f.Close()
	return errors.Join(writeErr, modeErr, closeErr)
}

func (w *writer) copyFile(from, rel string, mode os.FileMode) error {
	info, err := os.Lstat(from)
	if err != nil {
		return err
	}
	if !info.Mode().IsRegular() {
		return fmt.Errorf("%s is not a regular file", from)
	}
	body, err := os.ReadFile(from)
	if err != nil {
		return err
	}
	return w.write(rel, body, mode)
}

// copyTree copies the regular files under dir that accept allows into the
// payload under prefix, mode 0400, and records them as data files.
func (w *writer) copyTree(dir, prefix string, accept func(string) bool) error {
	return filepath.WalkDir(dir, func(p string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.Type()&os.ModeSymlink != 0 {
			return fmt.Errorf("%s is a symlink", p)
		}
		if d.IsDir() {
			return nil
		}
		rel, err := filepath.Rel(dir, p)
		if err != nil {
			return err
		}
		rel = filepath.ToSlash(rel)
		if !accept(rel) {
			return nil
		}
		target := path.Join(prefix, rel)
		if err := w.copyFile(p, target, 0o400); err != nil {
			return err
		}
		w.written = append(w.written, target)
		return nil
	})
}

func isRegularJSONOrMarkdown(rel string) bool {
	return strings.HasSuffix(rel, ".json") || strings.HasSuffix(rel, ".md")
}

// isV1JSON selects the published definitions and schemas; the catalog's own
// `*.schema.json` meta-schemas describe fusion's source files and stay home.
func isV1JSON(rel string) bool {
	return !strings.Contains(rel, "/") && strings.HasSuffix(rel, ".v1.json")
}

func contains(list []string, s string) bool {
	for _, v := range list {
		if v == s {
			return true
		}
	}
	return false
}

// buildTarget runs Prior's exact build form for one target from the clone
// root and returns the binary's sha256.
func buildTarget(clone, payload string, t target) (string, error) {
	out := filepath.Join(payload, filepath.FromSlash(t.binaryPath()))
	if err := os.MkdirAll(filepath.Dir(out), 0o755); err != nil {
		return "", err
	}
	cmd := exec.Command("go", "build", "-mod=readonly", "-trimpath", "-buildvcs=false", "-o", out, entryPoint)
	cmd.Dir = clone
	cmd.Env = append(os.Environ(), "GOWORK=off", "GOTOOLCHAIN=local", "CGO_ENABLED=0", "GOOS="+t.OS, "GOARCH="+t.Arch)
	cmd.Stdout = os.Stderr
	cmd.Stderr = os.Stderr
	fmt.Fprintln(os.Stderr, "fusion-bundle:", t.command(payload))
	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("build %s: %w", t.name(), err)
	}
	if err := os.Chmod(out, 0o500); err != nil {
		return "", err
	}
	return fileSum(out)
}

// inventory lists the regular files under root (or under the named
// subdirectories of it) in lexical walk order with their sha256, as
// build-identity.json records them; build-identity.json itself is skipped so
// the file never inventories itself.
func inventory(root string, subdirs []string) ([]hashedFile, error) {
	rows := []hashedFile{}
	walk := func(sub string) error {
		return fs.WalkDir(os.DirFS(root), sub, func(p string, d fs.DirEntry, err error) error {
			if err != nil {
				return err
			}
			if d.Type()&os.ModeSymlink != 0 {
				return fmt.Errorf("%s/%s is a symlink", root, p)
			}
			if d.IsDir() || p == "build-identity.json" {
				return nil
			}
			if !d.Type().IsRegular() {
				return fmt.Errorf("%s/%s is not a regular file", root, p)
			}
			sum, err := fileSum(filepath.Join(root, filepath.FromSlash(p)))
			if err != nil {
				return err
			}
			rows = append(rows, hashedFile{p, sum})
			return nil
		})
	}
	if subdirs == nil {
		return rows, walk(".")
	}
	for _, sub := range subdirs {
		if err := walk(sub); err != nil {
			return nil, err
		}
	}
	return rows, nil
}

// indexPayload is Prior's InspectBundle inventory: every regular file in
// lexical depth-first fs.WalkDir order, slash-relative, `sha256:` over the
// bytes, executable when any execute bit is set; a link or special file
// refuses the bundle.
func indexPayload(payload string) (bundleIndex, error) {
	index := bundleIndex{SchemaVersion: 1, ManifestPath: manifestPath, Files: []bundleFile{}}
	err := fs.WalkDir(os.DirFS(payload), ".", func(p string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if p == "." {
			return nil
		}
		if !fs.ValidPath(p) || strings.ContainsAny(p, "\\:\x00") {
			return fmt.Errorf("%s is not a bundle path", p)
		}
		info, err := os.Lstat(filepath.Join(payload, filepath.FromSlash(p)))
		if err != nil {
			return err
		}
		if info.Mode()&(os.ModeSymlink|os.ModeSetuid|os.ModeSetgid|os.ModeSticky) != 0 {
			return fmt.Errorf("%s has a link or privileged mode", p)
		}
		if info.IsDir() {
			return nil
		}
		if !info.Mode().IsRegular() {
			return fmt.Errorf("%s is not a regular file", p)
		}
		sum, err := fileSum(filepath.Join(payload, filepath.FromSlash(p)))
		if err != nil {
			return err
		}
		index.Files = append(index.Files, bundleFile{p, "sha256:" + sum, info.Mode().Perm()&0o111 != 0})
		return nil
	})
	return index, err
}

// checkAgainstManifest restates InspectBundle's manifest checks: the
// executable is present and executable, every data entry is present, and the
// lifecycle_hooks declaration names a payload file with its digest.
func checkAgainstManifest(index bundleIndex, manifest api.Manifest) error {
	files := map[string]bundleFile{}
	for _, f := range index.Files {
		files[f.Path] = f
	}
	if !files[manifest.Executable].Executable {
		return fmt.Errorf("%s is not an executable payload file", manifest.Executable)
	}
	for _, p := range manifest.Data {
		if files[p].Digest == "" {
			return fmt.Errorf("data file %s is not in the payload", p)
		}
	}
	if hooks := manifest.LifecycleHooks; hooks != nil {
		if err := hooks.VerifyFile(files[hooks.Path].Digest); err != nil {
			return err
		}
	}
	return nil
}

// writeTarball writes the payload as an uncompressed USTAR archive with one
// regular-file entry per index row sorted by path, uid and gid 0, empty user
// and group names, mtime 0, modes 0400 or 0500 and no directory entries
// (67.8). Prior's extractor creates the directories itself. The archive's
// sha256 is returned.
func writeTarball(tarPath, payload string, index bundleIndex) (string, error) {
	paths := make([]string, 0, len(index.Files))
	byPath := map[string]bundleFile{}
	for _, f := range index.Files {
		paths = append(paths, f.Path)
		byPath[f.Path] = f
	}
	sort.Strings(paths)
	var buf bytes.Buffer
	tw := tar.NewWriter(&buf)
	epoch := time.Unix(0, 0).UTC()
	for _, p := range paths {
		body, err := os.ReadFile(filepath.Join(payload, filepath.FromSlash(p)))
		if err != nil {
			return "", err
		}
		mode := int64(0o400)
		if byPath[p].Executable {
			mode = 0o500
		}
		header := &tar.Header{Typeflag: tar.TypeReg, Name: p, Size: int64(len(body)), Mode: mode, Uid: 0, Gid: 0, Uname: "", Gname: "", ModTime: epoch, Format: tar.FormatUSTAR}
		if err := tw.WriteHeader(header); err != nil {
			return "", fmt.Errorf("tar %s: %w", p, err)
		}
		if _, err := tw.Write(body); err != nil {
			return "", err
		}
	}
	if err := tw.Close(); err != nil {
		return "", err
	}
	if err := os.WriteFile(tarPath, buf.Bytes(), 0o444); err != nil {
		return "", err
	}
	return hexSum(buf.Bytes()), nil
}

// prettyJSON writes the two records a person reads, indented and without
// HTML escaping, so `<payload>` stays `<payload>`. The bundle index is not
// written through here: its bytes are json.Marshal's, as Prior computes them.
func prettyJSON(v any) ([]byte, error) {
	var buf bytes.Buffer
	enc := json.NewEncoder(&buf)
	enc.SetEscapeHTML(false)
	enc.SetIndent("", "  ")
	if err := enc.Encode(v); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func hexSum(body []byte) string {
	sum := sha256.Sum256(body)
	return hex.EncodeToString(sum[:])
}

func fileSum(p string) (string, error) {
	f, err := os.Open(p)
	if err != nil {
		return "", err
	}
	defer f.Close()
	h := sha256.New()
	if _, err := io.Copy(h, f); err != nil {
		return "", err
	}
	return hex.EncodeToString(h.Sum(nil)), nil
}
