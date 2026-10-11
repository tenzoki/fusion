# adapters/prior: fusion's Prior module, the executable side

The Go sources of the executable in fusion's Prior module bundle, the script
that builds and tests them, and the pin of the Prior revision they are built
against. The role texts, workflow definitions and schemas the executable
interprets live in `catalog/`; this directory holds only what runs. Nothing
here reaches a Claude Code install: `install.sh` copies a fixed list of
entries and `adapters/` is not on it.

The contract is Prior's answer to fusion's request 67 and its two follow-ups
of 2026-10-11 (`Prior: docs/design/fusion-module-bundle-prior-response.md`),
on top of the module API (`Prior: docs/design/prior-module-api-v1.md`) and
the installed-bundle contract (`Prior: docs/design/prior-installed-module-bundles.md`).
The host side that calls this module is `Prior: internal/fusionhost/external_explorer.go`.

## Layout

| Path | What it is |
|---|---|
| `PRIOR_PIN` | One line: the full hash of the Prior revision the adapter is built and tested against. |
| `stage.sh` | Clones Prior at the pin into a scratch directory, stages the sources there and runs a Go command. The only way these sources are ever compiled. |
| `check-imports.sh` | The import discipline, checked with `find`, `grep` and `awk`: no `go.mod`, `go.work`, `go.sum` or `vendor/` under this directory; no import under Prior's `internal/` or `modules/`; every non-standard import is the SDK or an own package. |
| `fusionmodule/cmd/fusion-module/` | The executable: identity and secret from the two environment variables, the payload located above its own path, the explorer served over stdin and stdout. |
| `fusionmodule/internal/steps/` | The floor: bundle reader, catalog, profile and workflow decoders with exactly Prior's key sets, a strict JSON parser, a JSON Schema validator over the keyword subset the shipped schemas use, the observe-then-act executor over one durable role, and the frame-bound check. |
| `fusionmodule/internal/explorer/` | The explorer workflow: interprets `workflows/explorer.v1.json` on the step executor and serves `fusion.explorer.v1`. |
| `fusionmodule/internal/fixture/` | Test support only: a payload built from `catalog/`, and a fake host with in-memory durable `host.role.*` services. Not linked into the executable. |

Plan step 8 adds `build.sh`, the launcher `launcher/fusion-module.sh` and the
assembler `fusionmodule/cmd/fusion-bundle/`; step 9 adds
`fusionmodule/conformance/`, which starts the launcher from a built bundle.

## How the sources are built

The sources are packages of Prior's module under the import prefix
`github.com/kai/prior/integrationbuild/fusionmodule/`. They import
`github.com/kai/prior/moduleapi/v1`, the standard library and each other, and
nothing else: nothing under Prior's `internal/` or `modules/`, no third-party
module, not even the JSON Schema library Prior's own `go.mod` requires. They
have no `go.mod` and compile nowhere in fusion's tree (Prior answer 67.4,
route a).

```
adapters/prior/stage.sh test
adapters/prior/stage.sh run -- <command...>
```

`stage.sh` clones the local Prior repository (`PRIOR_REPO`, default
`/Users/kai/Projects/productive/F09-Prior`; a parameter of the build machine,
never part of any artefact) with `--no-checkout`, checks out `PRIOR_PIN`
detached, prints the clone's `git rev-parse HEAD` and refuses a HEAD that is
not the pin or a clone that is not clean. It copies `fusionmodule/` to
`integrationbuild/fusionmodule/` in the clone, refuses if that staging holds a
`go.mod` or `go.work`, runs `go mod download` once, and runs the command from
the clone's root with `GOWORK=off GOTOOLCHAIN=local GOFLAGS=-mod=readonly`.
`test` is `go vet` and `go test` over `./integrationbuild/fusionmodule/...`;
`run` is any command, with `FUSION_STAGE_CLONE` naming the clone, which step
8's build uses. The clone is under `TMPDIR` and removed on exit unless
`FUSION_STAGE_KEEP=1`. Nothing is ever written into the Prior checkout.

The tests that need the catalog read it through `FUSION_CATALOG_DIR`, which
`stage.sh` exports as the absolute path of `catalog/`; run outside `stage.sh`
they skip with that reason. Prior's `go.mod` says `go 1.26.0`; the toolchain
must be at least that, and `GOTOOLCHAIN=local` means it is the one installed,
never one downloaded.

### Moving the pin

Edit `PRIOR_PIN`, run `stage.sh test`, and read Prior's
`git diff <old> <new> -- moduleapi/v1 go.mod go.sum`: a change there is a
wire or build change the adapter has to follow. The pin is the revision Prior
runs the explorer proof on; the bundle's build identity names it.

## What the executable does

Prior's `BundleManager.Start` runs the bundle's launcher with exactly two
environment variables, `PRIOR_MODULE_IDENTITY` (the installed identity as
compact JSON) and `PRIOR_MODULE_CONNECTION_SECRET` (32 random bytes as hex),
and no `PATH`. The executable:

1. decodes the identity with `api.Decode` and validates it, decodes the
   secret; exits 2 with nothing on stdout when either is missing or malformed;
2. locates its payload: the nearest ancestor of its own resolved path that
   holds `module.json`, at most four levels up (the binary sits at
   `bin/<os>-<arch>/fusion-module`); reads `module.json` through
   `api.DecodeManifest` and every file its `data` list names, each confined
   to the payload and bounded by 1 MiB; refuses a payload whose module id or
   version is not the identity's; exits 3 on any of these;
3. loads the explorer definition: `workflows/explorer.v1.json`, the role it
   names resolved through `catalog.json` (only `support.prior = supported`
   resolves, aliases included), the role's `profiles/<id>.json`, and the four
   schemas by the paths the definition and the profile declare
   (`invocation_schema`, `role_input_schema`, `result_schema`,
   `envelope_schema`). A definition whose hand-over or completion says
   something this executor does not do is refused at load;
4. serves `fusion.explorer.v1` through `api.Server`, which performs the
   authenticated handshake and advertises the capability.

No service preflight is performed: the SDK's `HostCaller` exposes `CallHost`
only, and Prior compares the definition's `requires` with its service map
before the process starts (67.6).

### One invocation

The invocation input is `{run_id, role_input, audit_ref?}`, validated against
`schemas/explorer-request.v1.json` after a strict parse (duplicate keys and
trailing data refused). `role_input` is the role input the host composed and
froze, the caller's `question`, `path_scope` and `findings_limit` with the
host's `project_context` and `output_contract`; it is validated against
`schemas/explorer-role-input.v1.json` and then forwarded as `RoleCall.input`
on every role call as the bytes the host placed there, never re-encoded, with
nothing added and nothing stripped. The host refuses a role call whose input
differs from the frozen one, so the immutability is checked on both sides.
`audit_ref` is read from the invocation's top level and sent only as the
completion's `RoleCall.audit_ref`.

Before the first host call, every role call the step can make is checked
against the 1 MiB frame bound; an input that would not fit is refused with no
effect. Then the step runs, observe then act (67.5):

| Read reports | The module |
|---|---|
| `absent` | calls `host.role.run.v1`, then reads again |
| `answered` | calls `host.role.complete.v1` with the invocation's `audit_ref` (empty when absent), then reads again |
| `settled` | reuses the stored answer; no run, no completion |
| `accepted` | answers `recovery-required` with `host_evidence: null`; never reruns |
| `refused` | answers `recovery-required` on code `recovery-required`, else `refused` with the host's code |

A host refusal of the run or the completion ends the step the same way: the
observation stays what the last read reported, the code is carried in the
envelope's `violations`. A missing or invalid required audit is the host's
`recovery-required` on completion, reported as such; the module never
fabricates an audit or a completion. A lost reply (`ErrOutcomeUnknown`) is
returned as an error, which the SDK reports as `handler-failed`: the outcome
is unknown, and only the next invocation's read can say what happened.

The envelope, `schemas/explorer-envelope.v1.json`, is `{domain, host_evidence}`.
`host_evidence` is `{run_id, principal_id, observed_at, role_state}` copied
from the role answer the last read returned, with the state that read
reported, or `null` when no answer exists. `domain.status` is `completed`
only for a settled role whose stored answer is valid against
`schemas/explorer-result.v1.json` and carries at most `findings_limit`
findings, the two checked separately because the result schema has no
`maxItems`; the result is the stored answer's bytes. Otherwise `result` is
`null` and `violations` says why, with these codes: `invocation.capability`,
`invocation.invalid`, `role_input.invalid`, `frame.oversize`,
`host.<code>` (`host.recovery-required` under status `recovery-required`),
`role.accepted` (status `recovery-required`), `role.<state>`,
`result.invalid`, `findings.limit`. The envelope is validated against its own
schema and checked against the frame bound before it is returned; one that
would not fit is replaced by a `frame.oversize` refusal that keeps the
evidence.

## Testing

`stage.sh test` runs, inside the clone:

- `internal/steps`: the strict parser against what Prior refuses; every
  keyword of the validator, and the refusal of every keyword it does not
  implement; the four shipped schemas compiled and exercised on the
  contract's cases; the bundle reader serving declared files only, refusing a
  missing or oversize one, and locating the root above the executable; the
  catalog resolving the explorer and refusing every planned, unsupported and
  aliased name; the step executor's call sequence, audit placement and
  immutable input on nine scripted hosts;
- `internal/explorer`: the workflow over the fake durable host: a valid answer
  completed with the evidence copied; a restart that reuses the persisted
  answer with zero model calls; `settled` reused on one read; `accepted` as
  `recovery-required` with null evidence; a required audit missing, wrong and
  right; a schema-invalid answer and five findings against four refused and
  not completed; invalid invocations and an oversize input refused before any
  host call; an oversize answer refused within the frame; a host conflict
  reported; a lost reply returned as an error; and the handler behind
  `api.Server` over pipes against `api.ConnectWithServices`;
- `cmd/fusion-module`: the exits before the handshake, nothing on stdout.

This is conformance on the build machine against a fake host, not Prior's
acceptance. What Prior's host does with the envelope, the checks of
`host_evidence` against its durable record above all, is proven only by
Prior's run of the delivered bundle (request 68).
