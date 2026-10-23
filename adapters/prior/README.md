# adapters/prior: fusion's Prior module, the executable side

The Go sources of the executable in fusion's Prior module bundle, the script
that builds and tests them, and the pin of the Prior revision they are built
against. The role texts, workflow definitions and schemas the executable
interprets live in `catalog/`; this directory holds only what runs. Nothing
here reaches a Claude Code install: `install.sh` copies a fixed list of
entries and `adapters/` is not on it.

The contract is two of Prior's answers: answer 67, to fusion's request 67
and its two follow-ups of 2026-10-11, for the bundle and the explorer
(`Prior: docs/design/fusion-module-bundle-prior-response.md`), and answer
69, for the repair workflow and its six host services
(`Prior: docs/design/fusion-repair-contract-prior-response.md`). Both sit on
top of the module API (`Prior: docs/design/prior-module-api-v1.md`) and the
installed-bundle contract (`Prior: docs/design/prior-installed-module-bundles.md`).
The host side, read from Prior at `PRIOR_PIN`, is two files:
`Prior: internal/fusionhost/external_explorer.go` calls the explorer, and
`Prior: internal/fusionhost/repair_journal.go` holds the repair host's
preparation record and the receipt journal its services are guarded by. At
the pin that file advertises no service yet.

## Layout

| Path | What it is |
|---|---|
| `PRIOR_PIN` | One line: the full hash of the Prior revision the adapter is built and tested against, `08c57fb4ec91df6b1e1e311fa2d063eb5ff08076`. It moved there from `10ad78be` at step 16 of the H1-H9 hand-over plan, when Prior added `moduleapi/v1/entry_wire.go` (the `host.question.v1`, `host.exec.v1` and `host.dispatch.v1` constants, `EntryBinding`, `EntryOperationID`, the three call types and their decoders, `EntryResponse`, `DecodeEntryResponse`) and `moduleapi/v1/manifest.go` (`Manifest`, `HandlerSpec`, `LifecycleHooks`), which the entry support uses instead of re-implementing; nothing else in `moduleapi/v1`, `go.mod` or `go.sum` changed, and the adapter passed `stage.sh test` at the new pin with no source change. Before that it moved from `6080ba76` to `10ad78be` for `moduleapi/v1/repair_wire.go`, the repair wire types. The explorer bundle Prior accepted at request 68 stays the one built against `6080ba76`. |
| `stage.sh` | Clones Prior at the pin into a scratch directory, stages the sources there and runs a Go command. The only way these sources are ever compiled. |
| `build.sh` | The reproducible build, its verification with Prior's own inspector and its delivery; see `## Building the bundle`. |
| `check-imports.sh` | The import discipline, checked with `find`, `grep` and `awk`: no `go.mod`, `go.work`, `go.sum` or `vendor/` under this directory; no import under Prior's `internal/` or `modules/`; every non-standard import is the SDK or an own package. |
| `launcher/fusion-module.sh` | The `/bin/sh` launcher shipped as the bundle's `executable`, `bin/fusion-module`: maps `/usr/bin/uname -s -m` to one of the three binaries beside it and execs it, nothing through `PATH`, nothing on stdout; exit 4 for a host it has no binary for. |
| `fusionmodule/cmd/fusion-module/` | The executable: identity and secret from the two environment variables, the payload located above its own path, the explorer and the repair workflow served over stdin and stdout. |
| `fusionmodule/cmd/fusion-bundle/` | The assembler `build.sh` builds and runs inside the staged clone, never shipped: the three target builds, the payload, its identity by Prior's index algorithm, the deterministic tarball, the sidecar and `handover.json`. |
| `fusionmodule/internal/steps/` | The floor: bundle reader, catalog, profile and workflow decoders with exactly Prior's key sets, a strict JSON parser, a JSON Schema validator over the keyword subset the shipped schemas use, the observe-then-act executor over one durable role, and the frame-bound check. |
| `fusionmodule/internal/explorer/` | The explorer workflow: interprets `workflows/explorer.v1.json` on the step executor and serves `fusion.explorer.v1`. |
| `fusionmodule/internal/hostsvc/` | The client of the six repair host services of Prior's answer 69 (`host.role.compose.v1`, `host.workspace.v1`, `host.capture.v1`, `host.integrate.v1`, `host.snapshot.v1`, `host.workbench.v1`), one method each over the workflow's `HostCaller`, every request an `api.RepairCall` marshalled once per slot so a replay sends the same bytes. |
| `fusionmodule/internal/repair/` | The repair workflow: interprets `workflows/repair.v1.json` over the step executor and the host service client and serves `fusion.repair.v1`; ten steps, the attempt map validated before any role call, every role read before it is run on restart. |
| `fusionmodule/internal/fixture/` | Test support only: a payload built from `catalog/`, and a fake host with in-memory durable `host.role.*` services and the six repair services. Not linked into the executable. |
| `fusionmodule/conformance/` | The conformance suite: starts the launcher from a bundle `build.sh` wrote and drives both workflows through `moduleapi/v1` against the fake host; see `### Conformance against a built bundle`. |
| `testdata/repair-fixture/` | The repair conformance's toy repository and `task.json`; see the same section. |

## How the sources are built

The sources are packages of Prior's module under the import prefix
`github.com/kai/prior/integrationbuild/fusionmodule/`. They import
`github.com/kai/prior/moduleapi/v1`, the standard library and each other, and
nothing else: nothing under Prior's `internal/` or `modules/`, no third-party
module, not even the JSON Schema library Prior's own `go.mod` requires. They
have no `go.mod` and compile nowhere in fusion's tree (Prior answer 67.4,
route a).

```
PRIOR_REPO=<prior-repository> adapters/prior/stage.sh test
PRIOR_REPO=<prior-repository> adapters/prior/stage.sh run -- <command...>
```

`PRIOR_REPO` is required by `stage.sh` and `build.sh` alike and has no
default: it names the local Prior repository to clone, a parameter of the
build machine and never part of any artefact. Unset, either script prints
its usage line naming `PRIOR_REPO` and exits 2. The examples below leave it
out for brevity; every one of them needs it.

`stage.sh` clones that repository with `--no-checkout`, checks out `PRIOR_PIN`
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

## Building the bundle

```
adapters/prior/build.sh build [<out>]
adapters/prior/build.sh verify <out>
adapters/prior/build.sh deliver
```

`build` renders the catalog for Prior (`cd catalog && npm run render -- prior
<work>/rendered`), runs the assembler through `stage.sh run` in the staged
clone, where it builds `cmd/fusion-module` for `darwin-arm64`, `linux-amd64`
and `linux-arm64` in Prior's exact form (`GOWORK=off GOTOOLCHAIN=local
CGO_ENABLED=0`), assembles the payload with the launcher at `bin/fusion-module`
and the binaries at `bin/<os>-<arch>/fusion-module`, and writes
`<out>/payload/`, `<out>/fusion-<version>.tar` (uncompressed, normalized),
its `.sha256` sidecar and `<out>/handover.json`; it prints the bundle digest.
`<out>` must be empty or absent and outside both repositories; the default is
a fresh directory under `TMPDIR`. The version is read from
`.claude-plugin/plugin.json`. The payload's `build-identity.json` names the
fusion revision, the Prior revision (the pin), the toolchain and the commands
that ran, and inventories the adapter sources, the launcher and every other
payload file; the bundle digest covers it, so a build at any other commit
yields another digest. The build refuses a dirty fusion tree outside
`fusion-workbench/`; `FUSION_BUILD_ALLOW_DIRTY=1` builds anyway and marks the
revision `<sha>+dirty`.

`verify` writes a throwaway probe into the clone's `integrationbuild/` and
runs Prior's own `InspectBundle` over `<out>/payload/` and, after
`ExtractBundleArchive`, over the extracted tarball, comparing both identities
with `handover.json`. `deliver` builds, verifies, and copies the tarball, the
sidecar and `handover.json` to
`~/.local/share/prior/incoming/fusion/<version>/<digest-hex>/`, mode `0444`,
refusing a file already there with different bytes, and prints that path,
which the hand-over section in `codec/fixtures/prior/REQUESTS.md` records.

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
4. loads the repair definition, `workflows/repair.v1.json`, the same way,
   with the roles of its ten steps and their schemas (`internal/repair`);
5. serves `fusion.explorer.v1` and `fusion.repair.v1` through `api.Server`,
   which performs the authenticated handshake and advertises both
   capabilities. The rest of this section describes the explorer; the repair
   workflow's contract is Prior's answer 69 and the header of
   `fusionmodule/internal/repair/repair.go`.

Repair shares the explorer's step executor, so the audit placement under
`### One invocation` holds for its roles too. Its last step, the workbench
close, branches on the closure the host answers. With `reconciled: true`
the envelope is `completed` and its result carries the closure. With
`reconciled: false` the host says the post-image, the codec receipts, its
journal and the integration commit do not agree, and that is never a
success: the envelope is `recovery-required` with violation
`closure.unreconciled`, the closure kept in that violation's detail because
the frozen `repair-result.v1.json` admits only a null result under that
status.

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
`audit_ref` is read from the invocation's top level and sent only as a
completion's `RoleCall.audit_ref`, and only to a run whose first read in
this invocation was `answered`: a run a previous invocation left before its
completion (69.3). A run this invocation started on `absent` is completed
without it. The rule is `steps.Execute`'s own, so the explorer and repair
hold it through the same call.

Before the first host call, every role call the step can make is checked
against the 1 MiB frame bound; an input that would not fit is refused with no
effect. Then the step runs, observe then act (67.5):

| Read reports | The module |
|---|---|
| `absent` | calls `host.role.run.v1`, then reads again |
| `answered` | calls `host.role.complete.v1`, then reads again; the completion carries the invocation's `audit_ref` (empty when absent) only when this was the first read, never after a run this invocation started |
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
  implement; the four explorer schemas compiled and exercised on the
  contract's cases; the repair schemas exercised by the shared case table
  `catalog/testdata/repair-schema-cases.v1.json` (`TestSharedSchemaCases`,
  read through `FUSION_CATALOG_DIR`, each schema compiled with
  `CompileSchema`), whose every row's verdict the catalog's ajv test
  (`catalog/src/__tests__/schema-cases.test.ts`) asserts too, so the two
  validators are held to one table; the bundle reader serving declared files
  only, refusing a missing or oversize one, and locating the root above the
  executable; the catalog resolving the four roles supported on Prior
  (explorer, code-implementer, reviewer and state-auditor), the reviewer
  also through its two aliases `code-reviewer` and `data-reviewer` with
  their domains, and refusing every other role and a name outside the
  catalog; the step executor's call sequence, audit placement (the
  reference sent only to a run first read `answered`) and immutable input on
  ten scripted hosts;
- `internal/explorer`: the workflow over the fake durable host: a valid answer
  completed with the evidence copied; a restart that reuses the persisted
  answer with zero model calls; `settled` reused on one read; `accepted` as
  `recovery-required` with null evidence; a required audit missing, wrong and
  right; an invocation's `audit_ref` not sent to a run that invocation
  started; a schema-invalid answer and five findings against four refused and
  not completed; invalid invocations and an oversize input refused before any
  host call; an oversize answer refused within the frame; a host conflict
  reported; a lost reply returned as an error; and the handler behind
  `api.Server` over pipes against `api.ConnectWithServices`;
- `cmd/fusion-module`: the exits before the handshake, nothing on stdout;
- `internal/hostsvc` and `internal/repair`: the six service clients and the
  repair workflow over scripted hosts, among them a close answering
  `reconciled: false` that ends `recovery-required`, not `completed`.

### Conformance against a built bundle

```
adapters/prior/build.sh build <out>
FUSION_BUNDLE_DIR=<out> adapters/prior/stage.sh test
```

`fusionmodule/conformance/` reads `FUSION_BUNDLE_DIR`, the directory
`build.sh build` wrote; unset, every case skips with that reason. Each case
extracts the tarball into its own temporary directory and starts the
launcher from there through `os/exec` with exactly the two Prior variables
and no `PATH`, its working directory the payload, in its own process group,
as Prior's `internal/module.StartProcess` does. The host side is the SDK's
`ConnectWithServices` with the fake host of `internal/fixture`: in-memory
durable `host.role.*` services and the six repair services. Seventeen cases:

- eleven explorer cases (`explorer_test.go`, plan step 9): the handshake
  advertises the explorer; a valid answer completes with the host evidence
  copied; a schema-invalid answer and five findings against a limit of four
  are refused, not completed; a kill after the persisted answer and a restart
  run no model; `settled` is reused without a run; `accepted` is
  `recovery-required` with null evidence; `answered` without the required
  audit is `recovery-required`; a fresh operation id with the same run is
  accepted; an oversize input and an unknown capability are refused;
- six repair cases (`repair_test.go`, plan step 18) over
  `testdata/repair-fixture/`, a toy repository (`pkg/a` with one failing
  test, `pkg/b` as read-only context, a `CLAUDE.md` that becomes the project
  context, one work package with a bound plan in the codec shapes) and
  `task.json` with two criteria, two checks and a write scope of `pkg/a`;
  the test copies it, runs `git init` and one fixed commit, and takes `HEAD`
  as `base_revision`, so no `.git` enters fusion's tree. A reviewed repair
  runs to audited close; a `revise` verdict loops once within the bound on
  distinct run ids, then `escalate` stops at review; a kill at each
  persisted boundary, then a resume under a fresh operation id, reproduces
  the byte-equal envelope with zero further model calls. Every run in that
  test, the clean reference included, reads the record in 96-byte pages, and
  the boundaries are nineteen: after the explorer was composed, answered and
  settled; after the workspace receipt; after the implementer was composed,
  answered and settled; after the capture receipt; after the reviewer was
  composed and answered, and after the review settled; after the integrate
  and the snapshot receipts; after the record was read and after a page of
  it was read; after the auditor was composed and answered, and before close
  with the audit settled; and after the close receipt. A corrupted review binding is
  refused with `review.binding`; an attempt map short of the bound is refused
  before any role call; and the explorer's results still decode under the
  frozen schemas.

The launcher maps this machine's `/usr/bin/uname -s -m` to one binary, so the
suite starts `bin/darwin-arm64/fusion-module` on the build machine and never
the two Linux binaries, which are delivered built, not qualified (67.9). No
missing-service case is written: that preflight is Prior's (67.6).

This is conformance on the build machine against a fake host, not Prior's
acceptance. What Prior's host does with the envelope, the checks of
`host_evidence` against its durable record above all, is proven only by
Prior's run of the delivered bundle (requests 68 and 70).
