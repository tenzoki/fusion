package conformance

// The hook-layout conformance of plan step 21 (H8, H9): every command the
// bundle's hooks/hooks.json registers is run from the unpacked bundle payload
// and from the plugin tree, on fusion's own payloads under
// adapters/prior/testdata/hook-payloads/ (step 20), and the two runs must be
// indistinguishable: per command, the same exit code, stdout and stderr, and
// the same files under the run directory afterwards, once the paths that name
// the run and the plugin root, the checkout identifier minted in the run and
// the wall-clock stamps are normalised. Every reply observed is also measured
// against the manifest's lifecycle_hooks.protocol_subset, in both directions:
// no reply falls outside it, and nothing in it goes unobserved, so the
// declaration is the measurement and not a copy of the hook sources.
//
// How a command runs, as Prior's analysis of fusion's hook surfaces (Prior
// 08c57fb, `### 5. Premise test`) ran them: verbatim from hooks.json through
// /bin/bash -c, its working directory the fixture repository root, the
// payload on stdin, and an environment built from scratch (PATH and TMPDIR
// inherited, HOME, CLAUDE_PLUGIN_ROOT and CLAUDE_ENV_FILE set per run), so
// that no FUSION_* variable of the calling session leaks in. FUSION_PERSON
// and FUSION_CHECKOUT are unset in both runs, so the identity is resolved by
// bin/fusion-identity from the fixture's local git identity and the
// checkout identifier is minted by the first command that asks.
//
// The fixture is one git repository with a fixed identity, one commit at a
// fixed date and fusion-workbench/.fusion-setup, built once and copied fresh
// for each of the two runs, so both start from the same HEAD. The payloads
// run as one session in the order the payload README gives, with the tool
// effects Claude Code would apply between a PreToolUse and its PostToolUse
// (the written file, the edit, one commit) applied identically in both runs.

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"testing"
	"time"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/fixture"
	api "github.com/kai/prior/moduleapi/v1"
)

// hookTimeout bounds one hook command.
const hookTimeout = 60 * time.Second

// hookDirs is hooks.json's registration, command by command in file order,
// each with the payload directory named after it (the payload README's
// `## Command to directory`). The test refuses a hooks.json that registers
// anything else, so a new or moved command fails here until it has payloads.
var hookDirs = []struct{ event, dir string }{
	{"SessionStart", "session-start-env-export"},
	{"SessionStart", "session-start-banner"},
	{"SessionStart", "session-start"},
	{"SessionStart", "session-id"},
	{"SessionStart", "session-start-identity"},
	{"PreToolUse", "guard"},
	{"PostToolUse", "tracker"},
	{"SubagentStop", "subagent-stop"},
}

// hookCommand is one registered command and the payloads it is run with.
type hookCommand struct {
	event, dir, command string
}

// hookStep is one moment of the session: either a command run on one
// payload, or a tool effect applied to the repository before the next run.
type hookStep struct {
	dir, payload string
	effect       func(t *testing.T, repo string)
	label        string
}

// hookResult is what one command run left behind, raw: the run directory
// just before the command (after any tool effect) and just after it.
type hookResult struct {
	label, event, dir string
	exit              int
	stdout, stderr    string
	before, files     map[string]string
}

// written is the paths the command itself created, changed or removed.
func (h hookResult) written() []string {
	var paths []string
	for p, v := range h.files {
		if old, ok := h.before[p]; !ok || old != v {
			paths = append(paths, p)
		}
	}
	for p := range h.before {
		if _, ok := h.files[p]; !ok {
			paths = append(paths, p)
		}
	}
	sort.Strings(paths)
	return paths
}

// hookRun is one pass of the session against one plugin root.
type hookRun struct {
	name     string
	plugin   string
	root     string
	repo     string
	results  []hookResult
	checkout string
}

// The fixed fixture identity and date. The identity is the repository's
// local git config, which bin/fusion-identity reads.
const (
	hookFixtureName  = "Fixture User"
	hookFixtureEmail = "fixture@fusion.invalid"
	hookFixtureDate  = "2026-10-01T09:00:00Z"
	hookCommitDate   = "2026-10-01T09:30:00Z"
)

func TestHookLayoutBundleEqualsPluginTree(t *testing.T) {
	b := openBundle(t)
	tree := filepath.Dir(fixture.CatalogDir(t))
	payloads := filepath.Join(tree, "adapters", "prior", "testdata", "hook-payloads")

	manifest, _, err := api.DecodeManifest(b.read(t, "module.json"))
	if err != nil {
		t.Fatalf("module.json: %v", err)
	}
	declared := manifest.LifecycleHooks
	if declared == nil {
		t.Fatal("module.json declares no lifecycle_hooks")
	}
	bundled := b.read(t, filepath.ToSlash(declared.Path))
	if sum := sha256.Sum256(bundled); hex.EncodeToString(sum[:]) != declared.SHA256 {
		t.Fatalf("payload %s: sha256 %x differs from the declared %s", declared.Path, sum, declared.SHA256)
	}
	plugin, err := os.ReadFile(filepath.Join(tree, filepath.FromSlash(declared.Path)))
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(bundled, plugin) {
		t.Fatalf("%s differs between the bundle payload and the plugin tree", declared.Path)
	}
	commands := parseHookCommands(t, bundled)
	steps := hookSession(t, payloads)

	template := hookFixture(t)
	payloadBefore := treeDigest(t, b.dir)
	runs := []*hookRun{
		runHookSession(t, "bundle", b.dir, template, commands, payloads, steps),
		runHookSession(t, "plugin", tree, template, commands, payloads, steps),
	}
	if after := treeDigest(t, b.dir); after != payloadBefore {
		t.Errorf("the hooks wrote into the bundle payload: its tree digest moved from %s to %s", payloadBefore, after)
	}

	bundle, source := runs[0], runs[1]
	if len(bundle.results) != len(source.results) {
		t.Fatalf("%d command runs from the bundle, %d from the plugin tree", len(bundle.results), len(source.results))
	}
	absorbed := map[string]bool{}
	for i := range bundle.results {
		compareHookResults(t, bundle, source, i, absorbed)
	}
	var names []string
	for n := range absorbed {
		names = append(names, n)
	}
	sort.Strings(names)
	t.Logf("differed before normalisation, equal after: %v", names)
	assertSessionLeftItsTrace(t, source)
	measureReplies(t, declared.ProtocolSubset, runs)
}

// parseHookCommands reads hooks.json's commands in file order and refuses a
// registration other than hookDirs.
func parseHookCommands(t *testing.T, body []byte) []hookCommand {
	t.Helper()
	var doc struct {
		Hooks map[string][]struct {
			Matcher string `json:"matcher"`
			Hooks   []struct {
				Type    string `json:"type"`
				Command string `json:"command"`
			} `json:"hooks"`
		} `json:"hooks"`
	}
	if err := json.Unmarshal(body, &doc); err != nil {
		t.Fatalf("hooks.json: %v", err)
	}
	var commands []hookCommand
	for _, event := range []string{"SessionStart", "PreToolUse", "PostToolUse", "SubagentStop"} {
		for _, group := range doc.Hooks[event] {
			for _, h := range group.Hooks {
				if h.Type != "command" {
					t.Fatalf("hooks.json %s: a %q handler, not a command", event, h.Type)
				}
				commands = append(commands, hookCommand{event: event, command: h.Command})
			}
		}
	}
	if events := len(doc.Hooks); events != 4 || len(commands) != len(hookDirs) {
		t.Fatalf("hooks.json registers %d events and %d commands; this test is written for %d commands on 4 events", len(doc.Hooks), len(commands), len(hookDirs))
	}
	for i := range commands {
		if commands[i].event != hookDirs[i].event {
			t.Fatalf("hooks.json command %d is on %s, the payload table expects %s", i+1, commands[i].event, hookDirs[i].event)
		}
		commands[i].dir = hookDirs[i].dir
	}
	return commands
}

// hookSession is the order the payload README gives: SessionStart for a fresh
// and a resumed session, then PreToolUse/PostToolUse pairs with the tool
// effects between them, the SubagentStop payloads where the README places
// them. It fails when a payload file exists that the session does not run.
func hookSession(t *testing.T, payloads string) []hookStep {
	t.Helper()
	sessionDirs := []string{}
	for _, d := range hookDirs {
		if d.event == "SessionStart" {
			sessionDirs = append(sessionDirs, d.dir)
		}
	}
	var steps []hookStep
	run := func(dir, payload string) { steps = append(steps, hookStep{dir: dir, payload: payload}) }
	apply := func(label string, effect func(t *testing.T, repo string)) {
		steps = append(steps, hookStep{label: label, effect: effect})
	}
	for _, p := range []string{"01-startup.json", "02-resume.json"} {
		for _, d := range sessionDirs {
			run(d, p)
		}
	}
	note := "docs/fixture-note.md"
	run("guard", "01-write.json")
	apply("write "+note, writeFrom(payloads, "tracker/01-write.json"))
	run("tracker", "01-write.json")
	run("guard", "02-edit.json")
	apply("edit "+note, editFrom(payloads, "tracker/02-edit.json"))
	run("tracker", "02-edit.json")
	run("guard", "04-agent.json")
	// A sync dispatch's SubagentStop fires before its PostToolUse.
	run("subagent-stop", "02-sync-completed.json")
	run("tracker", "04-agent.json")
	run("guard", "05-agent-background.json")
	run("tracker", "05-agent-background.json")
	run("subagent-stop", "01-background-completed.json")
	// 03 needs a parked entry that 01 has not consumed.
	run("tracker", "05-agent-background.json")
	run("subagent-stop", "03-background-no-session-id.json")
	run("guard", "06-agent-no-session-id.json")
	apply("write the citation note", writeFrom(payloads, "tracker/06-write-workbench-citation.json"))
	run("tracker", "06-write-workbench-citation.json")
	// The Bash pair comes here, out of filename order, because the staging
	// drift it exists to measure needs a workbench record that is still
	// uncommitted when HEAD moves; the citation note is the first one. The
	// commit, after session start, is also the one tracker/08 finds no
	// review covering.
	apply("commit "+note, func(t *testing.T, repo string) {
		hookGit(t, repo, hookCommitDate, "add", "--", note)
		hookGit(t, repo, hookCommitDate, "commit", "-q", "-m", "fixture: the note")
	})
	run("guard", "03-bash.json")
	run("tracker", "03-bash.json")
	apply("edit the citation note", editFrom(payloads, "tracker/07-edit-workbench-citation.json"))
	run("tracker", "07-edit-workbench-citation.json")
	apply("write the review", writeFrom(payloads, "tracker/08-write-review.json"))
	run("tracker", "08-write-review.json")

	used := map[string]bool{}
	for _, s := range steps {
		if s.effect == nil {
			used[s.dir+"/"+s.payload] = true
		}
	}
	found, err := filepath.Glob(filepath.Join(payloads, "*", "*.json"))
	if err != nil {
		t.Fatal(err)
	}
	if len(found) == 0 {
		t.Fatalf("no payloads under %s", payloads)
	}
	for _, f := range found {
		rel := filepath.Base(filepath.Dir(f)) + "/" + filepath.Base(f)
		if !used[rel] {
			t.Errorf("payload %s is not run by the session; place it in hookSession", rel)
		}
	}
	for rel := range used {
		if _, err := os.Stat(filepath.Join(payloads, filepath.FromSlash(rel))); err != nil {
			t.Errorf("the session runs %s: %v", rel, err)
		}
	}
	return steps
}

// toolInput reads one payload's tool_input.
func toolInput(t *testing.T, payloads, rel string) map[string]any {
	t.Helper()
	var p struct {
		ToolInput map[string]any `json:"tool_input"`
	}
	if err := json.Unmarshal(readFixture(t, payloads, rel), &p); err != nil {
		t.Fatalf("%s: %v", rel, err)
	}
	return p.ToolInput
}

// writeFrom applies a Write payload's effect: the file with its content.
func writeFrom(payloads, rel string) func(t *testing.T, repo string) {
	return func(t *testing.T, repo string) {
		t.Helper()
		in := toolInput(t, payloads, rel)
		path, _ := in["file_path"].(string)
		content, ok := in["content"].(string)
		if path == "" || !ok {
			t.Fatalf("%s: a Write payload without file_path and content", rel)
		}
		target := filepath.Join(repo, filepath.FromSlash(path))
		if err := os.MkdirAll(filepath.Dir(target), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(target, []byte(content), 0o644); err != nil {
			t.Fatal(err)
		}
	}
}

// editFrom applies an Edit payload's effect: old_string replaced once by
// new_string in the file as the preceding Write left it.
func editFrom(payloads, rel string) func(t *testing.T, repo string) {
	return func(t *testing.T, repo string) {
		t.Helper()
		in := toolInput(t, payloads, rel)
		path, _ := in["file_path"].(string)
		oldS, _ := in["old_string"].(string)
		newS, _ := in["new_string"].(string)
		target := filepath.Join(repo, filepath.FromSlash(path))
		body, err := os.ReadFile(target)
		if err != nil {
			t.Fatalf("%s: %v", rel, err)
		}
		if oldS == "" || strings.Count(string(body), oldS) != 1 {
			t.Fatalf("%s: old_string %q is not found exactly once in %s", rel, oldS, path)
		}
		if err := os.WriteFile(target, []byte(strings.Replace(string(body), oldS, newS, 1)), 0o644); err != nil {
			t.Fatal(err)
		}
	}
}

// hookGit runs git in repo with the fixture's identity and a fixed date, so
// both runs mint the same commit.
func hookGit(t *testing.T, repo, date string, args ...string) string {
	t.Helper()
	cmd := exec.Command("git", append([]string{"-C", repo, "-c", "commit.gpgsign=false"}, args...)...)
	cmd.Env = append(os.Environ(),
		"GIT_CONFIG_NOSYSTEM=1", "GIT_CONFIG_GLOBAL=/dev/null",
		"GIT_AUTHOR_DATE="+date, "GIT_COMMITTER_DATE="+date)
	out, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("git %s: %v: %s", strings.Join(args, " "), err, out)
	}
	return strings.TrimSpace(string(out))
}

// hookFixture builds the template repository once: git init, the fixture
// identity in the local config, a README and the setup marker, one commit.
func hookFixture(t *testing.T) string {
	t.Helper()
	repo := filepath.Join(t.TempDir(), "repo")
	files := map[string]string{
		"README.md":                      "# Hook fixture\n",
		"fusion-workbench/.fusion-setup": `{"setup_at":"` + hookFixtureDate + `","plugin_version":"fixture"}` + "\n",
	}
	for rel, body := range files {
		target := filepath.Join(repo, filepath.FromSlash(rel))
		if err := os.MkdirAll(filepath.Dir(target), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(target, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	hookGit(t, repo, hookFixtureDate, "init", "-q", "-b", "main")
	hookGit(t, repo, hookFixtureDate, "config", "user.name", hookFixtureName)
	hookGit(t, repo, hookFixtureDate, "config", "user.email", hookFixtureEmail)
	hookGit(t, repo, hookFixtureDate, "add", "-A")
	hookGit(t, repo, hookFixtureDate, "commit", "-q", "-m", "hook fixture")
	return repo
}

// runHookSession runs the whole session against one plugin root in a fresh
// copy of the template.
func runHookSession(t *testing.T, name, plugin, template string, commands []hookCommand, payloads string, steps []hookStep) *hookRun {
	t.Helper()
	root, err := filepath.EvalSymlinks(t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	r := &hookRun{name: name, plugin: plugin, root: root, repo: filepath.Join(root, "repo")}
	copyTree(t, template, r.repo)
	home := filepath.Join(root, "home")
	if err := os.MkdirAll(home, 0o755); err != nil {
		t.Fatal(err)
	}
	envFile := filepath.Join(root, "claude-env")
	if err := os.WriteFile(envFile, nil, 0o644); err != nil {
		t.Fatal(err)
	}
	env := []string{
		"PATH=" + os.Getenv("PATH"),
		"HOME=" + home,
		"CLAUDE_PLUGIN_ROOT=" + plugin,
		"CLAUDE_ENV_FILE=" + envFile,
		"GIT_CONFIG_NOSYSTEM=1",
	}
	if tmp := os.Getenv("TMPDIR"); tmp != "" {
		env = append(env, "TMPDIR="+tmp)
	}
	byDir := map[string]hookCommand{}
	for _, c := range commands {
		byDir[c.dir] = c
	}
	for _, s := range steps {
		if s.effect != nil {
			s.effect(t, r.repo)
			continue
		}
		c := byDir[s.dir]
		stdin := readFixture(t, payloads, s.dir+"/"+s.payload)
		before := snapshot(t, root)
		ctx, cancel := context.WithTimeout(context.Background(), hookTimeout)
		cmd := exec.CommandContext(ctx, "/bin/bash", "-c", c.command)
		cmd.Dir = r.repo
		cmd.Env = env
		cmd.Stdin = bytes.NewReader(stdin)
		var stdout, stderr bytes.Buffer
		cmd.Stdout, cmd.Stderr = &stdout, &stderr
		runErr := cmd.Run()
		cancel()
		exit := 0
		if runErr != nil {
			var ee *exec.ExitError
			if !errors.As(runErr, &ee) {
				t.Fatalf("%s: %s/%s: %v", name, s.dir, s.payload, runErr)
			}
			exit = ee.ExitCode()
		}
		r.results = append(r.results, hookResult{
			label: s.dir + "/" + s.payload, event: c.event, dir: s.dir,
			exit: exit, stdout: stdout.String(), stderr: stderr.String(),
			before: before, files: snapshot(t, root),
		})
	}
	if body, err := os.ReadFile(filepath.Join(r.repo, "fusion-workbench", ".checkout-id")); err == nil {
		r.checkout = strings.TrimSpace(string(body))
	}
	return r
}

// snapshot is every regular file under root but the repository's .git,
// keyed by its slash path relative to root.
func snapshot(t *testing.T, root string) map[string]string {
	t.Helper()
	files := map[string]string{}
	err := filepath.WalkDir(root, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		rel, err := filepath.Rel(root, path)
		if err != nil {
			return err
		}
		rel = filepath.ToSlash(rel)
		if d.IsDir() {
			if rel == "repo/.git" {
				return filepath.SkipDir
			}
			return nil
		}
		if !d.Type().IsRegular() {
			return fmt.Errorf("%s is not a regular file", path)
		}
		body, err := os.ReadFile(path)
		if err != nil {
			return err
		}
		files[rel] = string(body)
		return nil
	})
	if err != nil {
		t.Fatalf("snapshot %s: %v", root, err)
	}
	return files
}

// treeDigest is one sha256 over every path and its bytes under dir.
func treeDigest(t *testing.T, dir string) string {
	t.Helper()
	files := snapshot(t, dir)
	paths := make([]string, 0, len(files))
	for p := range files {
		paths = append(paths, p)
	}
	sort.Strings(paths)
	h := sha256.New()
	for _, p := range paths {
		fmt.Fprintf(h, "%s\x00%d\x00%s", p, len(files[p]), files[p])
	}
	return hex.EncodeToString(h.Sum(nil))
}

// The wall-clock stamps the hooks write: ISO-8601 date-times with or
// without fraction and zone, and epoch milliseconds (dispatch-map.json).
var (
	isoStamp   = regexp.MustCompile(`\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?`)
	epochMilli = regexp.MustCompile(`\b1\d{12}\b`)
)

// normalise rewrites what legitimately differs between the two runs: the
// run directory, the plugin root, the checkout identifier minted in the run,
// and the stamps. Nothing else is touched.
func (r *hookRun) normalise(s string) string {
	pairs := []struct{ from, to string }{
		{r.root, "<RUN>"},
		{r.plugin, "<PLUGIN_ROOT>"},
	}
	if real, err := filepath.EvalSymlinks(r.plugin); err == nil && real != r.plugin {
		pairs = append(pairs, struct{ from, to string }{real, "<PLUGIN_ROOT>"})
	}
	sort.Slice(pairs, func(i, j int) bool { return len(pairs[i].from) > len(pairs[j].from) })
	for _, p := range pairs {
		s = strings.ReplaceAll(s, p.from, p.to)
	}
	if r.checkout != "" {
		s = strings.ReplaceAll(s, r.checkout, "<CHECKOUT>")
	}
	s = isoStamp.ReplaceAllString(s, "<TS>")
	return epochMilli.ReplaceAllString(s, "<EPOCH_MS>")
}

// compareHookResults holds one command run from the bundle against the same
// run from the plugin tree.
// absorbed collects what differed raw and was equal once normalised.
func compareHookResults(t *testing.T, bundle, source *hookRun, i int, absorbed map[string]bool) {
	t.Helper()
	b, s := bundle.results[i], source.results[i]
	at := fmt.Sprintf("run %d, %s", i+1, b.label)
	if b.label != s.label {
		t.Fatalf("%s: the plugin tree ran %s at this position", at, s.label)
	}
	written := s.written()
	t.Logf("%s: stdout %q, written %v", at, source.normalise(s.stdout), written)
	if got := b.written(); strings.Join(got, "\n") != strings.Join(written, "\n") {
		t.Errorf("%s: the bundle run wrote %v, the plugin-tree run %v", at, got, written)
	}
	if b.stdout != s.stdout {
		absorbed["stdout of "+b.dir] = true
	}
	if b.stderr != s.stderr {
		absorbed["stderr of "+b.dir] = true
	}
	for p, v := range b.files {
		if sv, ok := s.files[p]; ok && sv != v {
			absorbed[p] = true
		}
	}
	if b.exit != s.exit {
		t.Errorf("%s: exit %d from the bundle, %d from the plugin tree", at, b.exit, s.exit)
	}
	if b.exit != 0 {
		t.Errorf("%s: exit %d; stderr %q", at, b.exit, b.stderr)
	}
	if got, want := bundle.normalise(b.stdout), source.normalise(s.stdout); got != want {
		t.Errorf("%s: stdout differs\nbundle: %q\nplugin: %q", at, got, want)
	}
	if got, want := bundle.normalise(b.stderr), source.normalise(s.stderr); got != want {
		t.Errorf("%s: stderr differs\nbundle: %q\nplugin: %q", at, got, want)
	}
	for _, out := range []string{b.stdout, b.stderr} {
		if strings.Contains(out, "] Error:") {
			t.Errorf("%s: a hook failed open: %q", at, out)
		}
	}
	paths := map[string]bool{}
	for p := range b.files {
		paths[p] = true
	}
	for p := range s.files {
		paths[p] = true
	}
	for p := range paths {
		bv, bok := b.files[p]
		sv, sok := s.files[p]
		switch {
		case !bok:
			t.Errorf("%s: %s exists only after the plugin-tree run", at, p)
		case !sok:
			t.Errorf("%s: %s exists only after the bundle run", at, p)
		case bundle.normalise(bv) != source.normalise(sv):
			t.Errorf("%s: %s differs\nbundle: %q\nplugin: %q", at, p, bundle.normalise(bv), source.normalise(sv))
		}
	}
}

// assertSessionLeftItsTrace keeps the equality from being vacuous: the
// session must have reached the branches the payloads are there for.
func assertSessionLeftItsTrace(t *testing.T, r *hookRun) {
	t.Helper()
	final := r.results[len(r.results)-1].files
	var all strings.Builder
	for _, body := range final {
		all.WriteString(body)
	}
	for _, want := range []string{
		`"event":"session_start"`, `"event":"guard_allow"`, `"event":"task_start"`,
		`"event":"task_done"`, `"event":"guard_advisory"`, `"event":"staging_drift"`,
		`"event":"citation_form"`, `"event":"review_coverage"`,
		"export FUSION_PLUGIN_ROOT=", "export FUSION_SESSION_ID=", "export FUSION_PERSON=", "export FUSION_CHECKOUT=",
	} {
		if !strings.Contains(all.String(), want) {
			t.Errorf("%s run: no file holds %s after the session", r.name, want)
		}
	}
	if r.checkout == "" {
		t.Errorf("%s run: no checkout identifier was minted", r.name)
	}
}

// reply is one observed reply in Prior's vocabulary.
type reply struct {
	form      string
	fields    []string
	eventName string
}

// classifyReply reads stdout as Prior's lifecycle runtime would: empty,
// one JSON object, or plain text. Output that opens like JSON and is not
// one object is none of the three and fails.
func classifyReply(t *testing.T, at, stdout string) reply {
	t.Helper()
	trimmed := strings.TrimSpace(stdout)
	if trimmed == "" {
		return reply{form: "empty"}
	}
	if !strings.HasPrefix(trimmed, "{") {
		return reply{form: "text"}
	}
	var top map[string]json.RawMessage
	if err := json.Unmarshal([]byte(trimmed), &top); err != nil {
		t.Errorf("%s: stdout opens as JSON and is not one object: %v: %q", at, err, stdout)
		return reply{form: "invalid"}
	}
	r := reply{form: "json"}
	for k, v := range top {
		if k != "hookSpecificOutput" {
			r.fields = append(r.fields, k)
			continue
		}
		var inner map[string]json.RawMessage
		if err := json.Unmarshal(v, &inner); err != nil {
			t.Errorf("%s: hookSpecificOutput is not an object: %q", at, v)
			continue
		}
		for kk, vv := range inner {
			r.fields = append(r.fields, "hookSpecificOutput."+kk)
			if kk == "hookEventName" {
				if err := json.Unmarshal(vv, &r.eventName); err != nil {
					t.Errorf("%s: hookEventName is not a string: %q", at, vv)
				}
			}
		}
	}
	sort.Strings(r.fields)
	return r
}

// measureReplies asserts that every reply observed in either run lies inside
// the declared subset, under the constraints Prior's moduleapi/v1 states for
// it (text on SessionStart only, additionalContext on PostToolUse only, a
// hookEventName naming the event it answers), and that every declared event,
// form and field was observed, so the declaration is neither narrower nor
// wider than what the hooks do on these payloads.
func measureReplies(t *testing.T, declared api.HookProtocolSubset, runs []*hookRun) {
	t.Helper()
	inside := func(list []string) map[string]bool {
		m := map[string]bool{}
		for _, v := range list {
			m[v] = true
		}
		return m
	}
	events, forms, fields := inside(declared.Events), inside(declared.ReplyForms), inside(declared.ReplyFields)
	seen := map[string]bool{}
	perDir := map[string]map[string]bool{}
	for _, r := range runs {
		for i, res := range r.results {
			at := fmt.Sprintf("%s run %d, %s", r.name, i+1, res.label)
			rep := classifyReply(t, at, res.stdout)
			if !events[res.event] {
				t.Errorf("%s: event %s is outside the declared events %v", at, res.event, declared.Events)
			}
			seen["event:"+res.event] = true
			if !forms[rep.form] {
				t.Errorf("%s: reply form %s is outside the declared forms %v: %q", at, rep.form, declared.ReplyForms, res.stdout)
			}
			seen["form:"+rep.form] = true
			if rep.form == "text" && res.event != "SessionStart" {
				t.Errorf("%s: a text reply on %s; Prior reads text on SessionStart only", at, res.event)
			}
			if rep.eventName != "" && rep.eventName != res.event {
				t.Errorf("%s: hookEventName %q answers %s", at, rep.eventName, res.event)
			}
			for _, f := range rep.fields {
				if !fields[f] {
					t.Errorf("%s: reply field %s is outside the declared fields %v", at, f, declared.ReplyFields)
				}
				if f == "hookSpecificOutput.additionalContext" && res.event != "PostToolUse" {
					t.Errorf("%s: additionalContext on %s; Prior delivers it on PostToolUse only", at, res.event)
				}
				seen["field:"+f] = true
			}
			if perDir[res.dir] == nil {
				perDir[res.dir] = map[string]bool{}
			}
			perDir[res.dir][rep.form+" "+strings.Join(rep.fields, ",")] = true
		}
	}
	for _, d := range hookDirs {
		var shapes []string
		for s := range perDir[d.dir] {
			shapes = append(shapes, strings.TrimSpace(s))
		}
		sort.Strings(shapes)
		t.Logf("measured %s %s: %s", d.event, d.dir, strings.Join(shapes, " | "))
	}
	for _, kind := range []struct {
		prefix string
		list   []string
	}{{"event:", declared.Events}, {"form:", declared.ReplyForms}, {"field:", declared.ReplyFields}} {
		for _, v := range kind.list {
			if !seen[kind.prefix+v] {
				t.Errorf("declared %s%s is observed in no reply: the declaration is wider than the measurement", kind.prefix, v)
			}
		}
	}
}
