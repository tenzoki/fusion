// Package conformance starts fusion's built Prior module bundle the way
// Prior's host does and drives the explorer through moduleapi/v1 against a
// fake durable host (plan step 9).
//
// This is conformance on macOS arm64 against a fake host, not Prior's
// acceptance. The launcher bin/fusion-module maps this machine's
// `/usr/bin/uname -s -m` to bin/darwin-arm64/fusion-module, and that is the
// one binary these tests start; the two Linux binaries in the bundle are
// never started here and are delivered built, not qualified (Prior answer
// 67.9). What Prior's host does with the envelope, above all the checks of
// host_evidence against its durable record, is proven only by Prior's own
// run of the delivered bundle (request 68). No missing-service case is
// written: that preflight is Prior's, before the process starts (67.6).
//
// The bundle under test is step 8's output directory, FUSION_BUNDLE_DIR, as
// adapters/prior/build.sh wrote it: handover.json, the tarball and its sha256
// sidecar. Unset, every test skips with that reason. Each test extracts the
// tarball into its own temporary directory and starts the launcher from
// there through os/exec with exactly the two Prior variables in its
// environment and no PATH, its working directory the payload, in its own
// process group, as Prior's internal/module.StartProcess does at 6080ba76.
// The host side is the SDK's ConnectWithServices with the fake durable
// host.role.* services of internal/fixture, and the role input is composed
// as Prior's PrepareExternalExplorer composes it: the caller's task plus the
// host's project_context and output_contract.
package conformance

import (
	"archive/tar"
	"bytes"
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"syscall"
	"testing"
	"time"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/fixture"
	api "github.com/kai/prior/moduleapi/v1"
)

// Capability is the one workflow the bundle advertises.
const Capability = "fusion.explorer.v1"

// sessionTimeout bounds one process's lifetime, as Prior requires a deadline
// on the context that owns a module process.
const sessionTimeout = 60 * time.Second

// bundle is one extracted copy of the built bundle.
type bundle struct {
	// dir is the extracted payload, the directory the process runs in.
	dir string
	// identity is the installed identity Prior would hand the process,
	// read from handover.json.
	identity api.Identity
	// launcher is the absolute path of the manifest's executable.
	launcher string
}

// handover is the part of handover.json the tests read.
type handover struct {
	ModuleID      string `json:"module_id"`
	Version       string `json:"version"`
	BundleDigest  string `json:"bundle_digest"`
	Tarball       string `json:"tarball"`
	TarballSHA256 string `json:"tarball_sha256"`
}

// openBundle reads FUSION_BUNDLE_DIR, checks the tarball against its
// recorded sha256, extracts it into a fresh temporary directory and points
// the fake host at the bundle's identity. It skips with a named reason when
// the variable is unset or the platform is not the one this file is written
// for.
func openBundle(t *testing.T) *bundle {
	t.Helper()
	out := os.Getenv("FUSION_BUNDLE_DIR")
	if out == "" {
		t.Skip("FUSION_BUNDLE_DIR unset: build the bundle with adapters/prior/build.sh build <dir> and pass that directory")
	}
	if runtime.GOOS != "darwin" || runtime.GOARCH != "arm64" {
		t.Skipf("conformance is stated for macOS arm64; this is %s/%s and the launcher would start another binary", runtime.GOOS, runtime.GOARCH)
	}
	body, err := os.ReadFile(filepath.Join(out, "handover.json"))
	if err != nil {
		t.Fatalf("FUSION_BUNDLE_DIR=%s: %v", out, err)
	}
	var h handover
	if err := json.Unmarshal(body, &h); err != nil {
		t.Fatalf("handover.json: %v", err)
	}
	tarPath := filepath.Join(out, h.Tarball)
	tarBytes, err := os.ReadFile(tarPath)
	if err != nil {
		t.Fatal(err)
	}
	sum := sha256.Sum256(tarBytes)
	if hex.EncodeToString(sum[:]) != h.TarballSHA256 {
		t.Fatalf("%s: sha256 %x differs from handover.json's %s", tarPath, sum, h.TarballSHA256)
	}
	sidecar, err := os.ReadFile(tarPath + ".sha256")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(string(sidecar), h.TarballSHA256+"  "+h.Tarball) {
		t.Fatalf("sidecar %q does not name the tarball's sha256", sidecar)
	}
	b := &bundle{dir: t.TempDir(), identity: api.Identity{ModuleID: h.ModuleID, Version: h.Version, BundleDigest: h.BundleDigest}}
	if err := b.identity.Validate(); err != nil {
		t.Fatalf("handover.json identity %+v: %v", b.identity, err)
	}
	extract(t, bytes.NewReader(tarBytes), b.dir)
	manifest, _, err := api.DecodeManifest(b.read(t, "module.json"))
	if err != nil {
		t.Fatalf("module.json: %v", err)
	}
	b.launcher = filepath.Join(b.dir, filepath.FromSlash(manifest.Executable))
	// The fixture's role services accept calls under one pinned identity; the
	// bundle's identity is the one the process runs under, so it is the one
	// the fake host must accept and name in its answers.
	fixture.Identity = b.identity
	return b
}

// extract writes the tarball's entries under dir: regular files only, at
// bundle paths, with the modes the archive carries, never over an existing
// file.
func extract(t *testing.T, r io.Reader, dir string) {
	t.Helper()
	tr := tar.NewReader(r)
	for {
		h, err := tr.Next()
		if err == io.EOF {
			return
		}
		if err != nil {
			t.Fatalf("tar: %v", err)
		}
		if h.Typeflag != tar.TypeReg {
			t.Fatalf("tar entry %s is not a regular file", h.Name)
		}
		if !fs.ValidPath(h.Name) || h.Name == "." || strings.ContainsAny(h.Name, "\\:\x00") {
			t.Fatalf("tar entry %q is not a bundle path", h.Name)
		}
		target := filepath.Join(dir, filepath.FromSlash(h.Name))
		if err := os.MkdirAll(filepath.Dir(target), 0o755); err != nil {
			t.Fatal(err)
		}
		f, err := os.OpenFile(target, os.O_CREATE|os.O_EXCL|os.O_WRONLY, os.FileMode(h.Mode)&0o777)
		if err != nil {
			t.Fatal(err)
		}
		_, copyErr := io.CopyN(f, tr, h.Size)
		if err := errors.Join(copyErr, f.Close()); err != nil {
			t.Fatalf("tar entry %s: %v", h.Name, err)
		}
	}
}

// read returns one payload file.
func (b *bundle) read(t *testing.T, rel string) []byte {
	t.Helper()
	body, err := os.ReadFile(filepath.Join(b.dir, filepath.FromSlash(rel)))
	if err != nil {
		t.Fatal(err)
	}
	return body
}

// task is the caller's part of the explorer's role input.
type task struct {
	Question      string
	PathScope     []string
	FindingsLimit int
}

// roleInput composes the role input as Prior's PrepareExternalExplorer does
// at 6080ba76: the caller's task, which must not carry project_context or
// output_contract, gains the host's project_context and, as output_contract,
// the parsed object of the explorer profile's result_schema asset read from
// the installed payload; the whole is marshalled once and then frozen. The
// module must forward these bytes on every role call.
func (b *bundle) roleInput(t *testing.T, task task) json.RawMessage {
	t.Helper()
	var profile struct {
		ResultSchema string `json:"result_schema"`
	}
	if err := json.Unmarshal(b.read(t, "profiles/explorer.json"), &profile); err != nil {
		t.Fatalf("profiles/explorer.json: %v", err)
	}
	var schema any
	if err := json.Unmarshal(b.read(t, profile.ResultSchema), &schema); err != nil {
		t.Fatalf("%s: %v", profile.ResultSchema, err)
	}
	text := "# CLAUDE.md\n\nRun make test.\n"
	digest := sha256.Sum256([]byte(text))
	composed := map[string]any{
		"question":       task.Question,
		"path_scope":     task.PathScope,
		"findings_limit": task.FindingsLimit,
		"project_context": map[string]any{"instructions": []map[string]any{{
			"path":   "CLAUDE.md",
			"sha256": "sha256:" + hex.EncodeToString(digest[:]),
			"text":   text,
		}}},
		"output_contract": schema,
	}
	body, err := json.Marshal(composed)
	if err != nil {
		t.Fatal(err)
	}
	return body
}

// defaultTask is the task most cases send: a limit of four.
func defaultTask() task {
	return task{Question: "Where is the frame bound enforced?", PathScope: []string{"moduleapi/v1"}, FindingsLimit: 4}
}

// process is the module process behind the launcher and the duplex
// connection to it, the shape Prior's processConnection has.
type process struct {
	cmd    *exec.Cmd
	stdin  io.WriteCloser
	stdout io.ReadCloser
	stderr bytes.Buffer
	once   sync.Once
	done   chan struct{}
}

// start runs the launcher with exactly the two Prior variables and no PATH,
// from the payload directory, in its own process group.
func (b *bundle) start(t *testing.T, secret []byte) *process {
	t.Helper()
	identity, err := json.Marshal(b.identity)
	if err != nil {
		t.Fatal(err)
	}
	cmd := exec.Command(b.launcher)
	cmd.Dir = b.dir
	cmd.Env = []string{api.IdentityEnvironment + "=" + string(identity), api.SecretEnvironment + "=" + hex.EncodeToString(secret)}
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	p := &process{cmd: cmd, done: make(chan struct{})}
	cmd.Stderr = &p.stderr
	if p.stdin, err = cmd.StdinPipe(); err != nil {
		t.Fatal(err)
	}
	if p.stdout, err = cmd.StdoutPipe(); err != nil {
		t.Fatal(err)
	}
	if err := cmd.Start(); err != nil {
		t.Fatalf("start %s: %v", b.launcher, err)
	}
	t.Cleanup(func() { p.Close() })
	return p
}

func (p *process) Read(b []byte) (int, error)  { return p.stdout.Read(b) }
func (p *process) Write(b []byte) (int, error) { return p.stdin.Write(b) }

// Close closes both pipes, kills the process group and reaps the process,
// as Prior's host does; it is idempotent.
func (p *process) Close() error {
	p.once.Do(func() {
		_ = p.stdin.Close()
		_ = p.stdout.Close()
		p.kill()
		_ = p.cmd.Wait()
		close(p.done)
	})
	return nil
}

// kill sends SIGKILL to the process group: the launcher execs the binary,
// so the group holds whatever is running under the launcher's pid.
func (p *process) kill() {
	_ = syscall.Kill(-p.cmd.Process.Pid, syscall.SIGKILL)
}

// session is one process with one authenticated connection to it, over a
// fake host whose durable store the caller may share across sessions.
type session struct {
	t      *testing.T
	bundle *bundle
	host   *fixture.Host
	proc   *process
	client *api.Client
	ctx    context.Context
}

// connect starts a process under a fresh connection secret and performs the
// handshake, requiring the explorer capability and offering the given
// services (the fake host's own when nil). A handshake failure is fatal.
func connect(t *testing.T, b *bundle, host *fixture.Host, services map[string]api.Handler) *session {
	t.Helper()
	s, err := tryConnect(t, b, host, services, []string{Capability})
	if err != nil {
		t.Fatalf("handshake: %v; module stderr: %q", err, s.proc.stderr.String())
	}
	return s
}

// tryConnect is connect with the required capabilities chosen and the
// handshake's error returned; the process is already closed on an error.
func tryConnect(t *testing.T, b *bundle, host *fixture.Host, services map[string]api.Handler, required []string) (*session, error) {
	t.Helper()
	secret := make([]byte, 32)
	if _, err := rand.Read(secret); err != nil {
		t.Fatal(err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), sessionTimeout)
	t.Cleanup(cancel)
	if services == nil {
		services = host.Services()
	}
	proc := b.start(t, secret)
	s := &session{t: t, bundle: b, host: host, proc: proc, ctx: ctx}
	client, err := api.ConnectWithServices(ctx, proc, b.identity, secret, required, services)
	if err != nil {
		return s, err
	}
	s.client = client
	t.Cleanup(func() { client.Close() })
	return s, nil
}

// close ends the session: the connection, then the process.
func (s *session) close() {
	if s.client != nil {
		s.client.Close()
	}
	s.proc.Close()
}

// envelope is the wire shape of schemas/explorer-envelope.v1.json, decoded
// strictly so a member the schema does not allow is a failure.
type envelope struct {
	Domain struct {
		Status     string          `json:"status"`
		Result     json.RawMessage `json:"result"`
		Violations []struct {
			Code   string `json:"code"`
			Detail string `json:"detail"`
		} `json:"violations"`
	} `json:"domain"`
	HostEvidence *struct {
		RunID       string    `json:"run_id"`
		PrincipalID string    `json:"principal_id"`
		ObservedAt  time.Time `json:"observed_at"`
		RoleState   string    `json:"role_state"`
	} `json:"host_evidence"`
}

// code is the first violation's code, or "".
func (e envelope) code() string {
	if len(e.Domain.Violations) == 0 {
		return ""
	}
	return e.Domain.Violations[0].Code
}

// invoke sends one explorer invocation and decodes the envelope.
func (s *session) invoke(operationID string, input json.RawMessage) (envelope, error) {
	s.t.Helper()
	var env envelope
	out, err := s.client.Invoke(s.ctx, api.Invocation{OperationID: operationID, Capability: Capability, Input: input})
	if err != nil {
		return env, err
	}
	if err := api.Decode(out, &env); err != nil {
		return env, errors.Join(err, errors.New("envelope: "+string(out)))
	}
	return env, nil
}

// mustInvoke is invoke with an error fatal.
func (s *session) mustInvoke(operationID string, input json.RawMessage) envelope {
	s.t.Helper()
	env, err := s.invoke(operationID, input)
	if err != nil {
		s.t.Fatalf("invoke %s: %v; module stderr: %q", operationID, err, s.proc.stderr.String())
	}
	return env
}

// invocation composes the outer invocation {run_id, role_input, audit_ref?}.
func invocation(t *testing.T, runID string, roleInput json.RawMessage, auditRef string) json.RawMessage {
	t.Helper()
	return fixture.Invocation(t, runID, roleInput, auditRef)
}
