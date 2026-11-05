# adapters/prior: fusion's Prior module, the executable side

The Go sources of the executable in fusion's Prior module bundle, the script
that builds and tests them, and the pin of the Prior revision they are built
against. The role texts, workflow definitions and schemas the executable
interprets live in `catalog/`; this directory holds only what runs. Nothing
here reaches a Claude Code install: `install.sh` copies a fixed list of
entries and `adapters/` is not on it.

The contract is Prior's answer 67, to fusion's request 67 and its two
follow-ups of 2026-10-11, for the bundle and the explorer
(`Prior: docs/design/fusion-module-bundle-prior-response.md`), and the
common contract of answer 69 for the host services the entry workflow calls
(`Prior: docs/design/fusion-repair-contract-prior-response.md`). Both sit on
top of the module API (`Prior: docs/design/prior-module-api-v1.md`) and the
installed-bundle contract (`Prior: docs/design/prior-installed-module-bundles.md`).
The entry workflow, `fusion.entry.v2`, has no Prior answer yet: its
definition and result schema are fusion's proposal in request 77, written
against Prior's step-17 delivery model and ruling
`261024-0807-how-does-an-entry-run-deliver-its-result-into-the-users-repository.md`,
and `### The entry workflow` names where it reaches past the wire at the pin.
The explorer's host side, read from Prior at `PRIOR_PIN`, is
`Prior: internal/fusionhost/external_explorer.go`.

The repair workflow was withdrawn in 13.4.1 (`fusion.repair.v1` withdrawn under decision `261027-1833-does-fusion-keep-the-repair-route-on-prior-beside-the-step-17-entry-model.md`, E4):
the module no longer serves it, and its sources stand at the tag `v13.1.0`,
whose `adapters/prior/README.md` describes them.

## Layout

| Path | What it is |
|---|---|
| `PRIOR_PIN` | One line: the full hash of the Prior revision the adapter is built and tested against, `08c57fb4ec91df6b1e1e311fa2d063eb5ff08076`. It moved there from `10ad78be` at step 16 of the H1-H9 hand-over plan, when Prior added `moduleapi/v1/entry_wire.go` (the `host.question.v1`, `host.exec.v1` and `host.dispatch.v1` constants, `EntryBinding`, `EntryOperationID`, the three call types and their decoders, `EntryResponse`, `DecodeEntryResponse`) and `moduleapi/v1/manifest.go` (`Manifest`, `HandlerSpec`, `LifecycleHooks`), which the entry support uses instead of re-implementing; nothing else in `moduleapi/v1`, `go.mod` or `go.sum` changed, and the adapter passed `stage.sh test` at the new pin with no source change. Before that it moved from `6080ba76` to `10ad78be` for `moduleapi/v1/repair_wire.go`, the wire types of the request-69 common contract (`RepairCall`, `RepairOperationID`, `DecodeRepairResponse`), which the entry workflow's host calls still use. The explorer bundle Prior accepted at request 68 stays the one built against `6080ba76`. |
| `stage.sh` | Clones Prior at the pin into a scratch directory, stages the sources there and runs a Go command. The only way these sources are ever compiled. |
| `build.sh` | The reproducible build, its verification with Prior's own inspector and its delivery; see `## Building the bundle`. |
| `check-imports.sh` | The import discipline, checked with `find`, `grep` and `awk`: no `go.mod`, `go.work`, `go.sum` or `vendor/` under this directory; no import under Prior's `internal/` or `modules/`; every non-standard import is the SDK or an own package. |
| `launcher/fusion-module.sh` | The `/bin/sh` launcher shipped as the bundle's `executable`, `bin/fusion-module`: maps `/usr/bin/uname -s -m` to one of the three binaries beside it and execs it, nothing through `PATH`, nothing on stdout; exit 4 for a host it has no binary for. |
| `fusionmodule/cmd/fusion-module/` | The executable: identity and secret from the two environment variables, the payload located above its own path, the explorer and entry workflows served over stdin and stdout as `fusion.explorer.v1` and `fusion.entry.v2`. |
| `fusionmodule/cmd/fusion-bundle/` | The assembler `build.sh` builds and runs inside the staged clone, never shipped: the three target builds, the payload, its identity by Prior's index algorithm, the deterministic tarball, the sidecar and `handover.json`. |
| `fusionmodule/internal/steps/` | The floor: bundle reader, catalog, profile and workflow decoders with exactly Prior's key sets, a strict JSON parser, a JSON Schema validator over the keyword subset the shipped schemas use, the observe-then-act executor over one durable role, and the frame-bound check. |
| `fusionmodule/internal/explorer/` | The explorer workflow: interprets `workflows/explorer.v1.json` on the step executor and serves `fusion.explorer.v1`. |
| `fusionmodule/internal/hostsvc/` | The client of the host services the entry workflow calls under the request-69 common contract: `host.role.compose.v1`, `host.workspace.v1`, the `read` and `page` actions of `host.workbench.v1`, and `host.entry.integrate.v1`, fusion's proposal in request 77, with a closed decoder of its answer. One method each over the workflow's `HostCaller`, every request the SDK's `api.RepairCall` marshalled once per slot so a replay sends the same bytes. No client for the three entry services: they are the role run's tools, not the module's calls. |
| `fusionmodule/internal/entry/` | The entry workflow: interprets `workflows/entry.v2.json` over the step executor and the client and serves `fusion.entry.v2`; five steps, the run's role taken from the invocation's entry through the catalog's entries, the run read before it is run on restart; see `### The entry workflow`. |
| `fusionmodule/internal/controlrecord/` | One pure function, `Select`: which changed path names a workbench control record. The codec's rule and Prior's. The entry workflow selects with it and the fake host admits a read with it. A leaf, because `internal/hostsvc` and `internal/steps` have in-package tests that import `internal/fixture`. |
| `fusionmodule/internal/fixture/` | Test support only: a payload built from `catalog/` (its schema and workflow lists read from `catalog/schemas/FROZEN` and `workflows/*.v<n>.json`, optionally with named entries made supported on prior and given a profile), a fake host with in-memory durable `host.role.*` services, and an entry fake host that serves compose, workspace, the workbench reads and `host.entry.integrate.v1` to the module over the call journal of `journal.go`, and `host.question.v1`, `host.exec.v1` and `host.dispatch.v1` to a scripted role run. Not linked into the executable. |
| `fusionmodule/conformance/` | The conformance suite: starts the launcher from a bundle `build.sh` wrote and drives the two workflows through `moduleapi/v1` against the fake host; see `### Conformance against a built bundle`. |
| `testdata/hook-payloads/` | The hook payloads the hook-layout conformance case feeds the carried hooks; see the same section. |

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

After the data files the assembler copies the **install tree**: every file
`git ls-files -s` lists under the entries of `install.sh`'s copy loop, with
the bytes git's index holds for it, at the payload root in the plugin's own
layout (`agents/`, `skills/`, `rules/`, `bin/`, `hooks/`, `codec/`,
`templates/`, `stilwerk/`, `docs/`, `.claude-plugin/` and the three READMEs),
mode `0500` for git mode `100755` and `0400` otherwise. So a helper, hook or
skill finds under Prior the tree a Claude Code install holds (decision
`261023-1854-which-plugin-tree-does-the-bundle-payload-carry-for-the-helper-runtime.md`,
option 2). None of it is in the manifest's `data`, so the module never reads
it. `TestInstallEntriesAreTheInstallLoop` parses the loop out of `install.sh`
and fails when the assembler's list differs: the loop stays the one
authority. A link (git mode `120000`) is not carried, because a bundle holds
regular files only; the assembler names each one on stderr and in
`build-identity.json` `install_tree_omitted` (as of `b0c068c8`, the test
fixture `codec/fixtures/legacy-v12/workbench/shared/analyses/latest-benchmark.md`).
An unmerged entry or a submodule refuses the build, and so does an
install-tree path that equals, contains or lies below a module path (a data
file, `module.json`, `build-identity.json`, `bin/fusion-module` or a target
binary). Node's floor is the carried `hooks/package.json` and
`codec/package.json` `engines`, `>=20.12.0`.

The manifest declares the carried hooks in `lifecycle_hooks`: `path`
`hooks/hooks.json`, `sha256` of the bytes the payload holds, and
`protocol_subset` with events `SessionStart`, `PreToolUse`, `PostToolUse`,
`SubagentStop`, reply forms `empty`, `text`, `json` and reply fields
`hookSpecificOutput.hookEventName`, `hookSpecificOutput.systemMessage`,
`hookSpecificOutput.additionalContext`, read from `hooks/hooks.json` and the
hook sources (`hookSubset` in `cmd/fusion-bundle/main.go` names the source of
each). The assembler checks the declaration against the payload as Prior's
`InspectBundle` does through `LifecycleHooks.VerifyFile`.

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
4. loads the entry definition, `workflows/entry.v2.json`, its four schema
   paths, and the catalog's entries: every entry's `requires` must be among
   the definition's, and every entry supported on prior must have its
   profile in the payload (`internal/entry`);
5. serves `fusion.explorer.v1` and `fusion.entry.v2` through `api.Server`,
   which performs the authenticated handshake and advertises the two
   capabilities, and no other. The rest of this section describes the
   explorer; the entry workflow's is `### The entry workflow` below.

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
without it. The rule is `steps.Execute`'s own, so the explorer and the entry
workflow hold it through the same call.

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

### The entry workflow

The invocation is `schemas/entry-request.v1.json`: `{workflow_id, run_id,
entry: {id, kind, profile}, arguments, project_context, route?, audit_ref?}`.
Before any host call the module resolves the run step's role from it: the
entry must be the catalog's (`entry.unknown`), with its kind and profile
(`entry.invalid`), and supported on prior (`entry.unsupported`). Argument
admission is the host's and is not repeated. Then, in order:

1. `compose`: the task `{entry, arguments, route?}` through
   `host.role.compose.v1` under the entry's profile; the frozen input must
   validate against the definition's role input schema and be the task with
   only `workflow_id`, `run_id` and `project_context` added, the first two the
   invocation's (`role_input.invalid`);
2. `workspace`: the run's one workspace, on Prior's step-17 model a copy of
   the user's checkout with `HEAD` detached at the commit the user's `HEAD`
   named and every file of the working tree carried, uncommitted changes
   included; its `base_revision` is what the integration is checked against;
3. `run`: `steps.Execute` over the run with the frozen bytes, observe then
   act, the audit reference on a completion of a run first read `answered`
   only; the settled answer must validate against
   `schemas/entry-result.v2.json` whatever the profile declares (decision
   D5), and every option a question's `selected` names must be among its
   `options`, the one rule that schema cannot state (`result.invalid`). A
   settled answer of status `recovery-required` or with a null ending is
   `result.invalid` too, and nothing is integrated. An ending of class
   `refusal` ends the envelope `refused` with the run's ending and
   violations, and nothing is integrated. **The stop rule:** `success` and
   `stop` both go on to the integration, because a stopped run keeps what it
   changed, as Claude Code keeps a stopped session's files; whether Prior
   integrates a stopped run is a question of request 77;
4. `integrate`: one `host.entry.integrate.v1` call, request `{run_id}` under
   slot `integration`. The host fast-forwards the branch the user's `HEAD`
   named over the run's own commits and applies the run's uncommitted
   changes to the user's checkout, and answers
   `{run_id, base, reference, head, commits, delta}`: `commits` the run's
   commits as made, oldest first, each `{commit, subject, changes}`, and
   `delta` the uncommitted changes, both in git's name-status form. A run
   that changed nothing is an answer with two empty arrays. Before its first
   effect the host checks every changed workbench control record with its
   qualified codec; the definition names that check as Prior's duty;
5. `workbench`: one `host.workbench.v1` `read`, paged, per control record
   among the paths of `commits[].changes` and `delta` (a path under
   `fusion-workbench/` whose last segment is `package.json` or ends
   `.record.json` or `.evidence.json`, with no segment starting with a dot
   and a first segment that is not `archive`: the codec's `isControlFile`
   and `controlFiles`, Prior's `entryControlRecord`; read relative to the
   workbench), each under slot `record:<path>`, as an observation. A record
   is read when its last status, in commit order and then in the delta, is
   not `D`, as Prior's read admission selects, so a record changed and then
   deleted is not read; an `R` line leaves its old path deleted. A read the
   host refuses ends the envelope refused, and the integration stands.

The module checks the integrate answer before it copies anything:
`run_id` is the run's; `base` is the workspace's `base_revision`;
`reference` is not empty; `commits` is empty exactly when `head` equals
`base`, and otherwise its last commit is `head`; every commit is a commit
hash with a subject; and every `changes` and `delta` line is in name-status
form, the pattern of `entry-result.v2.json`'s `$defs/name_status`, with no
path holding an empty, `.` or `..` segment, the definition's own "valid
relative path", which that frozen pattern does not state. A receipt
that fails a check ends the envelope refused `integration.invalid`. A host
refusal ends it refused `integration.refused`, the host's capability, slot
and code in the detail, with nothing integrated; `recovery-required` stays
so. Once a receipt is admitted the integration stands: the envelope copies
`commits`, each with the answer's `reference`, and `delta`, and a later
refusal keeps them. An envelope that would not fit the frame is replaced by
a `frame.oversize` refusal that keeps `commits` and `delta` and empties the
questions; only if that still does not fit is it the bare refusal. No step
pushes: a push step comes with a later definition version and its service
(ruling `261024-0807`, condition (c)).

Every other host refusal refuses the invocation with `host.<code>`;
`recovery-required` stays so, with a null ending. A module refusal carries
an ending of class `refusal` whose reason is the violation code hyphenated
(`host.scope-violation` is `host-scope-violation`). The questions are the
settled answer's; the module holds no client for `host.question.v1`,
`host.exec.v1` or `host.dispatch.v1`.

Where the module reaches past the wire at the pin, each a point for request
77:

- `api.DecodeRepairCall` at `08c57fb` admits a compose for the explorer and
  three other role profiles only; an entry profile such as `skill-memo` is
  refused there (request 76, question 17);
- the same decoder derives every workbench read's operation id from slot
  `record`, so a second read in one workflow would conflict; entry.v2 reads
  under `record:<path>` (the same question);
- the SDK at the pin knows no `host.entry.integrate.v1`: its request
  `{run_id}` under slot `integration`, its answer and its refusals are
  fusion's proposal in request 77.

The fake host of `internal/fixture` accepts these request forms through
`decodeProposedEntryCall`, which falls back to them only where the pinned
decoder refuses, and serves the integrate call from the scripted run: the
commits each scripted command makes, with its subject and paths, and the
run's uncommitted paths as the delta, or a conflict refusal when a test
asks for one. Its workbench read answers `permission-denied` for a path
`controlrecord.Select` refuses, as Prior's read admission does, so a module
that reads anything but a control record ends refused here as well.

## Testing

`stage.sh test` runs, inside the clone:

- `internal/steps`: the strict parser against what Prior refuses; every
  keyword of the validator, and the refusal of every keyword it does not
  implement; the four explorer schemas compiled and exercised on the
  contract's cases; the entry schemas exercised by the shared case table
  `catalog/testdata/entry-schema-cases.v2.json` (`TestSharedSchemaCases`,
  read through `FUSION_CATALOG_DIR`, each schema compiled with
  `CompileSchema`), whose every row's verdict the catalog's ajv test
  (`catalog/src/__tests__/schema-cases.test.ts`) asserts too, so the two
  validators are held to one table; the bundle reader serving declared files
  only, refusing a missing or oversize one, and locating the root above the
  executable; the catalog resolving exactly the roles supported on Prior,
  read from the catalog (the explorer), and refusing every other role and a
  name outside the catalog, with each payload profile's input and result
  schema resolving inside the payload; the step executor's call sequence,
  audit placement (the reference sent only to a run first read `answered`)
  and immutable input on ten scripted hosts;
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
- `cmd/fusion-module`: the exits before the handshake, nothing on stdout,
  and exactly the two capabilities `fusion.explorer.v1` and
  `fusion.entry.v2` registered;
- `internal/hostsvc`: the service clients over scripted hosts, each request
  closed under its slot, the paged read assembled and checked, and the
  integrate answer decoded as a closed object;
- `internal/entry`: the entry workflow over a fixture payload in which
  `help` (plain), `reconcile` (dispatches) and `memo` (asks) are supported on
  prior, each run scripted to make its class's entry service calls inside
  the run against the fake host, which decodes them with Prior's own
  decoders, all three driven to `completed`; the module sends none of the
  three services. Three delivery cases: a run whose script commits twice and
  leaves an uncommitted path, whose `commits` hold both in order with their
  subjects and whose `delta` holds the path; `memo` with no commit and one
  uncommitted path, which completes with empty `commits` and one `delta`
  item; and a conflict refusal, which ends `integration.refused` with empty
  `commits` and `delta` and no workbench read. A kill after each persisted
  boundary and a resume under a fresh operation reproduce the byte-equal
  envelope with zero further role runs. One test for each receipt check, one
  row for each `Load` refusal, a settled answer of status
  `recovery-required` refused, and an oversize envelope that keeps the
  integration. Also: a lost run reply settled under the audit reference on
  its completion alone, an `accepted` run never rerun, a question answered
  `ended`, a stopped run that changed the workspace integrated, a refusing
  run never integrated, a selected option outside its options, entries
  unknown, mismatched or unsupported refused before any host call, host
  refusals and recovery, a frozen input naming another workflow, and the
  handler over pipes.

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
durable `host.role.*` services, the request-69 services and
`host.entry.integrate.v1` the entry workflow calls, and the three entry
services, which the fake host refuses to the module and serves to a
scripted role run. The cases:

- eleven explorer cases (`explorer_test.go`, plan step 9): the handshake
  advertises the explorer; a valid answer completes with the host evidence
  copied; a schema-invalid answer and five findings against a limit of four
  are refused, not completed; a kill after the persisted answer and a restart
  run no model; `settled` is reused without a run; `accepted` is
  `recovery-required` with null evidence; `answered` without the required
  audit is `recovery-required`; a fresh operation id with the same run is
  accepted; an oversize input and an unknown capability are refused;
- the entry cases (`entry_test.go`, 13.4.1 plan step 5) against
  `fusion.entry.v2`: one subtest per class, `help` (`plain`), `reconcile`
  (`dispatches`) and `memo` (`asks`), each read from the bundle's own
  `catalog.json` and required to be of that class and supported on `prior`
  there, with the script's calls inside the entry's `requires`. Each runs
  one scripted role run that makes its class's service call: `host.exec.v1`
  for `help`; `host.exec.v1` then `host.dispatch.v1` for `reconcile`,
  invoked with `--domain code` and a brief, whose child `state-auditor`
  changes a work-package control record, the dispatch's `input` being the
  shape fusion proposes in request 76, `{"arguments": [{"name", "value"},
  …]}`, built from the child's declared arguments; `host.question.v1`,
  answered, then `host.exec.v1` writing a memo for `memo`. The invocation,
  the frozen role input and the envelope must validate against the
  payload's `entry-request.v1.json` and `entry-result.v2.json`. The three
  delivery cases of `internal/entry` run again from the launcher started as
  Prior's host starts it, with a fourth: a guard-state file and a control
  record both in `delta`, of which only the record is read. A payload check confirms that the installed
  payload's `workflows/` holds exactly `explorer.v1.json` and
  `entry.v2.json`, that its schemas are exactly `FROZEN`'s at the build
  commit, that no path `catalog/schemas/WITHDRAWN` names is in it, and that
  the module refuses `fusion.entry.v1` and the withdrawn repair capability
  as unknown. The kills at each boundary are proven at unit level in
  `internal/entry` and are not repeated here.
- one hook-layout case (`hooks_test.go`, plan step 21), which starts no
  module process. The `hooks/hooks.json` the manifest's `lifecycle_hooks`
  pins must match its declared sha256 and equal the plugin tree's file byte
  for byte, and it must register exactly the eight commands that
  `testdata/hook-payloads/README.md` maps to payload directories. One fixture
  repository (`git init`, a fixed local identity, one commit at a fixed date,
  `fusion-workbench/.fusion-setup`) is copied fresh for two runs of one
  session, once with `CLAUDE_PLUGIN_ROOT` at the unpacked payload and once at
  the plugin tree (the parent of `FUSION_CATALOG_DIR`). Each command runs
  verbatim through `/bin/bash -c` with its payload on stdin, the repository as
  its working directory, and an environment built from scratch: `PATH` and
  `TMPDIR` inherited; `HOME`, `CLAUDE_PLUGIN_ROOT` and `CLAUDE_ENV_FILE` set
  per run; no `FUSION_*` variable, so `bin/fusion-identity` mints the
  checkout identifier. The session runs SessionStart fresh, then resumed,
  then the PreToolUse/PostToolUse pairs with the tool effects applied between
  them. The SubagentStop payloads go where the payload README places them.
  The Bash pair runs after the first workbench record is written and one
  commit, as that README's `## Order` states, so that the staging drift and
  the review-coverage gap are both reached. After every command, the exit code, stdout, stderr, the set
  of paths the command wrote and every file under the run directory (outside
  `.git`) must be equal between the two runs. Before the comparison, four
  things are normalised: the run directory, the plugin root, the minted
  checkout identifier, and the stamps (ISO-8601 date-times and epoch
  milliseconds). The payload must not change. Eight event rows
  (`session_start` to `review_coverage`) and the four env exports must be
  in the plugin-tree run's final files, so the equality is not vacuous. In
  both runs the session must leave `.guard-state/staging-drift.json`, and
  `controlrecord.Select` must refuse every `.json` it left under the
  workbench, which measures on fusion's side what limit G4 of Prior's answer
  to requests 76 and 77 left as an inference. Every reply is then classified as Prior reads
  it, as `empty`, `text` or one JSON object with its field paths. It has to
  lie inside `protocol_subset`: `text` on SessionStart only,
  `additionalContext` on PostToolUse only, and `hookEventName` naming the
  event. Every declared event, form and field also has to be observed, so
  the declaration is a measurement in both directions. Measured at
  `ec3d9597`: the env export and `subagent-stop.js` reply `empty`;
  `session-id.js` replies `text`; the banner and `session-start.js` reply
  `json` with `hookEventName` and `systemMessage`; `identity-notice.js` (its
  checkout already minted by `session-start.js`) and `guard.js` reply `{}`;
  `tracker.js` replies `{}` or `json` with `hookEventName` and
  `additionalContext`. That is exactly the declared subset.

The launcher maps this machine's `/usr/bin/uname -s -m` to one binary, so the
suite starts `bin/darwin-arm64/fusion-module` on the build machine and never
the two Linux binaries, which are delivered built, not qualified (67.9). No
missing-service case is written: that preflight is Prior's (67.6).

This is conformance on the build machine against a fake host, not Prior's
acceptance. What Prior's host does with the envelope, the checks of
`host_evidence` against its durable record above all, is proven only by
Prior's run of the delivered bundle (requests 68 and 70).
