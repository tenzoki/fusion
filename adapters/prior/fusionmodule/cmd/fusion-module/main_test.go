package main

import (
	"bytes"
	"encoding/hex"
	"errors"
	"os"
	"os/exec"
	"strings"
	"testing"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/fixture"
	"github.com/kai/prior/integrationbuild/fusionmodule/internal/steps"
	api "github.com/kai/prior/moduleapi/v1"
)

// The test binary re-executes itself as the module so the exit paths before
// the handshake can be observed: nothing on stdout, a code that says why.
func TestMain(m *testing.M) {
	if os.Getenv("FUSION_MODULE_TEST_MAIN") == "1" {
		os.Exit(run())
	}
	os.Exit(m.Run())
}

func exitCode(t *testing.T, env ...string) (int, string) {
	t.Helper()
	cmd := exec.Command(os.Args[0])
	cmd.Env = append([]string{"FUSION_MODULE_TEST_MAIN=1"}, env...)
	cmd.Stdin = strings.NewReader("")
	var stdout, stderr bytes.Buffer
	cmd.Stdout, cmd.Stderr = &stdout, &stderr
	err := cmd.Run()
	var exit *exec.ExitError
	if err != nil && !errors.As(err, &exit) {
		t.Fatal(err)
	}
	return cmd.ProcessState.ExitCode(), stdout.String()
}

func TestExitsBeforeTheHandshakeWithoutIdentity(t *testing.T) {
	code, out := exitCode(t)
	if code != 2 || out != "" {
		t.Fatalf("exit %d, stdout %q", code, out)
	}
	identity := `{"module_id":"fusion","version":"13.1.0","bundle_digest":"sha256:` + strings.Repeat("ab", 32) + `"}`
	code, out = exitCode(t, api.IdentityEnvironment+"="+identity)
	if code != 2 || out != "" {
		t.Fatalf("without a secret: exit %d, stdout %q", code, out)
	}
	code, out = exitCode(t, api.IdentityEnvironment+"="+identity, api.SecretEnvironment+"="+hex.EncodeToString(make([]byte, 32)))
	if code != 3 || out != "" {
		t.Fatalf("outside a bundle: exit %d, stdout %q", code, out)
	}
}

// The payload's two definitions are both registered, each under its own
// capability, from a fixture bundle built off the catalog.
func TestWorkflowsRegisterBothCapabilities(t *testing.T) {
	bundle, err := steps.OpenBundle(fixture.Bundle(t, fixture.CatalogDir(t)))
	if err != nil {
		t.Fatal(err)
	}
	handlers, err := workflows(bundle, fixture.Identity)
	if err != nil {
		t.Fatal(err)
	}
	for _, capability := range []string{"fusion.explorer.v1", "fusion.repair.v1"} {
		if handlers[capability] == nil {
			t.Errorf("%s is not registered", capability)
		}
	}
	if len(handlers) != 2 {
		t.Fatalf("%d workflows registered", len(handlers))
	}
}
