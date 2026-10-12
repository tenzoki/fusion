// fusion-module is the executable of fusion's Prior module bundle: the process
// Prior's BundleManager starts under the bundle's launcher, bin/fusion-module,
// with exactly two environment variables and nothing else.
//
// It decodes its identity from PRIOR_MODULE_IDENTITY and the connection secret
// from PRIOR_MODULE_CONNECTION_SECRET, finds its payload above its own path,
// reads the data files the manifest declares, loads the explorer and the
// repair definitions, and serves fusion.explorer.v1 and fusion.repair.v1
// over stdin and stdout through the module API v1 server. It writes nothing
// to stdout before the handshake: a failure before Serve exits with a code
// and a line on stderr, which the host discards.
//
// Exit codes: 2 when the identity or the secret is missing or malformed, 3
// when the payload cannot be read or a definition interpreted, 1 when the
// connection ended in an error.
package main

import (
	"context"
	"encoding/hex"
	"fmt"
	"os"

	"github.com/kai/prior/integrationbuild/fusionmodule/internal/explorer"
	"github.com/kai/prior/integrationbuild/fusionmodule/internal/repair"
	"github.com/kai/prior/integrationbuild/fusionmodule/internal/steps"
	api "github.com/kai/prior/moduleapi/v1"
)

func main() {
	os.Exit(run())
}

// workflows loads the two definitions from the payload and binds each to
// its capability under the module's identity; two definitions claiming one
// capability is a refused payload.
func workflows(bundle *steps.Bundle, id api.Identity) (map[string]api.WorkflowHandler, error) {
	explore, err := explorer.Load(bundle)
	if err != nil {
		return nil, err
	}
	fix, err := repair.Load(bundle)
	if err != nil {
		return nil, err
	}
	if explore.Capability == fix.Capability {
		return nil, fmt.Errorf("%w: both definitions claim %s", steps.ErrBundle, fix.Capability)
	}
	return map[string]api.WorkflowHandler{
		explore.Capability: explore.Handler(id, explorer.RemoteRoles(id)),
		fix.Capability:     fix.Handler(id, repair.RemoteRoles(id)),
	}, nil
}

func run() int {
	var id api.Identity
	if api.Decode([]byte(os.Getenv(api.IdentityEnvironment)), &id) != nil || id.Validate() != nil {
		fmt.Fprintln(os.Stderr, "fusion-module: no usable", api.IdentityEnvironment)
		return 2
	}
	secret, err := hex.DecodeString(os.Getenv(api.SecretEnvironment))
	if err != nil || len(secret) < 32 {
		fmt.Fprintln(os.Stderr, "fusion-module: no usable", api.SecretEnvironment)
		return 2
	}
	executable, err := os.Executable()
	if err != nil {
		fmt.Fprintln(os.Stderr, "fusion-module:", err)
		return 3
	}
	root, err := steps.LocateRoot(executable)
	if err != nil {
		fmt.Fprintln(os.Stderr, "fusion-module:", err)
		return 3
	}
	bundle, err := steps.OpenBundle(root)
	if err != nil {
		fmt.Fprintln(os.Stderr, "fusion-module:", err)
		return 3
	}
	// The identity the host supplies names the installed version; the payload
	// it started must be that version's.
	if bundle.Manifest.ID != id.ModuleID || bundle.Manifest.Version != id.Version {
		fmt.Fprintf(os.Stderr, "fusion-module: payload is %s %s, identity is %s %s\n", bundle.Manifest.ID, bundle.Manifest.Version, id.ModuleID, id.Version)
		return 3
	}
	handlers, err := workflows(bundle, id)
	if err != nil {
		fmt.Fprintln(os.Stderr, "fusion-module:", err)
		return 3
	}
	server := api.Server{Identity: id, Secret: secret, Workflows: handlers}
	if err := server.Serve(context.Background(), os.Stdin, os.Stdout); err != nil {
		fmt.Fprintln(os.Stderr, "fusion-module:", err)
		return 1
	}
	return 0
}
