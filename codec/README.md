# codec

The JSON contract for fusion's workbench control data: the schemas, the
contract tables, the fixtures both hosts validate, and the TypeScript that
reads and checks them. It realises Prior's `concept/fusion-json-workbench-spec.md`
(held in the Prior repository), package by package, starting with FJ00.

## What this package is, and is not

`codec/` is a sibling of `hooks/` with its own `package.json`, `tsc` and
`vitest`. Its home was ruled at the FJ00 plan approval on 2026-09-28 in the
decision record
`260928-1341_*_does-the-json-codec-live-in-its-own-package-or-under-hooks.md`:
a separate package, so that the growth bounds on the shipped text and on the
hook suite keep measuring what they were derived for. No agent prompt reads a
byte of this directory and no hook runs it.

**What ships is one file.** FJ01 (the codec-port decision, option 1: one Node
bundle for both hosts) added `dist/fusion-record.js`: `src/cli/main.ts` and
everything it imports, the seven schemas and the two contract tables inlined,
bundled by esbuild at an exact pinned version and committed. Both hosts run it
with plain `node`; neither needs `node_modules`. The Claude side reaches it
through `bin/fusion-record` and Prior spawns it.

## What ships

`install.sh` copies this directory whole into the install, beside `hooks/`
and `bin/`, and drops `codec/node_modules` as it drops `hooks/node_modules`.
What an installed copy runs is the bundle, `dist/fusion-record.js`, and
nothing else in it; what an installed copy carries for a reader or for the
Prior side is `schemas/`, `contract/` and `fixtures/` (the language-neutral
fixture index, the Prior DTO pairs, the scratch workbench, the two recorded
protocol sessions under `fixtures/protocol-session/` (FJ01) and
`fixtures/protocol-session-fj02/` (FJ02), and Prior's FJ01 handback under
`fixtures/prior-handback/`). `src/`, `scripts/`,
`package.json` and the tests are copied because the copy is whole, and are
unused at runtime: nothing in an install compiles, tests or imports them.
`node_modules` never ships, and the tarball never carries one. The installer
warns when `codec/dist/fusion-record.js` is absent, in the words it uses for a
missing `hooks/dist/guard.js`; `src/__tests__/install.test.ts` installs a
`git archive` of the tree into a scratch home with an isolated `PATH` and
proves `bin/fusion-record` answers there with `node` the only runtime.

## The CLI

One JSON request on stdin (or `--file <path>`), one JSON response on stdout:

```
echo '{"op":"show","workbench":"/abs/fusion-workbench","record":{"path":"work-packages/<d>/package.json"}}' | node codec/dist/fusion-record.js
{"ok":true,"result":{"path":"…","kind":"package","control":{…},"revision":"sha256:…","narrative":{"path":"…","sha256":"sha256:…"}}}
```

Exit 0 for an answered request whatever its `ok`, 2 on usage, 3 when the
inlined schemas do not compile; nothing on stderr except on 2 and 3. A
`workbench` the request leaves out is taken from `FUSION_WORKBENCH`. The
request shapes are `schemas/protocol.schema.json` (`fusion.protocol/v1`), one
branch per operation of spec section 6's table; the errors are the spec's
eight typed classes. `inspect` reports which operations answer
(`operations.implemented`) and which do not yet (`operations.deferred`); an
operation not yet answered is refused `operation-unknown/not-implemented`, with
a detail naming the package that lands it.

FJ01 answered `inspect`, `list`, `show`, `validate` and `transition` on a
package. FJ02 answers the rest of the table but one: `create` (with
`narrative.content` it writes both halves of the pair, without it the
narrative must already exist), `transition` on every record kind, `claim`,
`release`, `set-mode`, `set-dependencies`, `adopt-plan` (`role: plan`, the
default, or `role: spec`), `attach-evidence` and `reconcile`. `migration` is
the one operation still deferred: it lands in FJ04 and is refused
`operation-unknown/not-implemented` until then. Every mutation runs through
the kernel below, and `claim` and `release` are `transition` with defaults and
clearer refusals, never a second route to the files.

## The kernel and the journal

`src/kernel.ts` is the one writer of fusion JSON. `mutate` runs every
operation in one order: the workbench state (a legacy or unsupported
workbench refuses); the workbench write lock; a sweep of the transient entries
in `.json-state/journal/` and `.json-state/ops/`; the recovery of every pending
intent; the replay lookup, which consults a pending intent under the request's
`operation_id` before the stored answer; the operation's own plan function,
which reads what it needs, checks the caller's `expected_revision` against the
stored bytes, applies the operation's rules and validates every record it
would write, and returns the writes and the result without writing; the
durable intent; each write by temp file, fsync and atomic rename; the stored
answer; the intent's removal. A refusal before the intent writes nothing and
stores nothing, so a retry is an ordinary first attempt.

**The intent is the commit point.** It is a directory,
`.json-state/journal/<operation_id>/`, holding `intent.json`
(`{operation_id, op, request_digest, writes, response, created_at}`, each write
`{path, before, after}` with `before: null` for a file the operation creates)
and one staged file per distinct post-bytes, named by the hex of its hash. It
is built under a dot name and committed by one rename. Once
`journal/<id>/` exists under its own name the operation lands, on this attempt
or through recovery on any later request, so a caller whose process died after
the commit point (an unknown outcome) sees either the landed state or the
stored answer on its next request. No file under `.json-state/` carries a
request body: `request_digest` is `sha256:` over the key-sorted rendering of
the request, the comparison FJ01's replay made, and a staged control record
over the strict reader's 1 MiB cap is refused `schema-invalid/too-large`
before anything is written.

**The stored answer** is `.json-state/ops/<operation_id>.json`,
`{operation_id, op, request_digest, response}`. An answer the FJ01 bundle
stored, `{operation_id, request, response}`, is still read, by digesting its
`request`. An identical retry returns the stored response byte for byte; the
same id with a different request is `conflict/operation-id-reused`; a fresh id
against the old revision is `conflict/revision-mismatch`, so nothing runs
twice. `ops/` is not pruned in FJ02 (Prior's request 21 asks whether it should
be bounded).

**Recovery** decides each file a pending intent names by three hashes,
tested post first so that a write that changes nothing reads as landed: at its
post-bytes it has landed; at its pre-bytes (or absent where `before` is null)
it has not, and recovery writes the staged post-bytes; at neither, a hand edit
or a pull intervened. A live writer's files are only ever at pre or post,
because every write is a rename. When every file is at post the answer is
written if missing and the intent removed. A file at neither **blocks** the
intent: the kernel leaves the file and the intent exactly as they stand and
never overwrites either. A request reusing a blocked intent's id is
`operation-unknown/recovery-blocked` when it is the same request (answering
the intent's response would report a state the files do not hold) and
`conflict/operation-id-reused` when it is not. An operation that reads or
writes a path a blocked intent names is `recovery-blocked` naming the intent
and the diverged path; `show` answers the same, `list` gives such a pair as a
problem entry, `validate` as a finding, and `reconcile` lists the intent with
each file's state. A blocked intent admits two hand corrections, and the
kernel performs neither: restore the diverged file to its pre-bytes, after
which the next request rolls the intent forward; or delete the intent
directory from `.json-state/journal/` and accept the subset of its writes that
had landed.

**The state directory** `.json-state/` is class L and ignores itself:

| Entry | What it is |
|---|---|
| `write.lock` | The one workbench write lock, present while held: `pid`, `host`, `nonce` and `acquired_at`, one per line |
| `write.lock.takeover.<hash>` | A transient claim on a stale lock instance, named by the hash of the stale bytes, in the same content form |
| `journal/<operation_id>/` | A pending intent, as above |
| `ops/<operation_id>.json` | A stored answer, as above |
| `.gitignore` | `*`, written whenever it is missing or holds other bytes, before every lock, so a tracked workbench never lists the directory whatever the root `.gitignore` says, and a clone never carries a foreign lock or intent |

A dot-named entry in `journal/` or `ops/` is transient (an intent still being
built, one being removed, a temp file) and belongs to no operation; the lock
holder deletes it.

**The lock** is one file for the whole workbench. A writer creates it by
linking a complete file to the name, so every lock this codec writes records
its PID. A holder is judged by what the lock records: a lock of another host is
never reaped, and the waiter answers `conflict/lock-timeout` naming the holder
and its host (remove such a lock by hand once its holder is known to be gone);
a lock of this host, or one recording no host (FJ01's format), is stale the
moment its PID is dead, with no age condition, and live while the PID answers;
only a lock recording no PID at all is stale by age, after 60 s. A stale lock
is never unlinked: the one waiter that creates the takeover claim for that
instance renames its own lock over the name, after checking the name still
holds the stale bytes, so no waiter ever removes a lock it did not judge. A
waiter gives up after 65 s by default. One limit is known and not measured: a
holder in another PID namespace under the same hostname would be judged by a
PID this host cannot see; no host runs the codec that way today.

**Reads take no lock** unless a writer may be mid-flight. A read lists
`journal/` and then `ops/`, ignoring dot-named entries, runs, and lists both
again in the same order; equal id sets mean no operation started or landed
meanwhile, and a difference is a retry. The order is load-bearing in the
second listing: a writer stores its answer in `ops/` before its intent leaves
`journal/`, so an operation that finishes between the two listings is still
seen. A pending intent the first listing finds is classified without the lock
by hashing the files it names: a blocked one is stable and an ordinary member
of both listings, so it never sends later reads through the lock; only an
intent whose files are all at pre or post, which may belong to a live writer,
makes the reader take the lock, recover and read again.

## Evidence records on disk

An evidence record (`fusion.evidence/v1`) is `<basename>.evidence.json` beside
its report `<basename>.md`, in a `reviews/` store (`<container>/reviews/` or
`shared/reviews/`), and its `report.path` must name exactly that neighbour
(`unknown-scope/report-not-neighbour` otherwise). A record is immutable once
accepted, so a correction over an unchanged report is
`<basename>.<n>.evidence.json`, `n` a decimal from 2 without a leading zero,
naming the same report; any other trailing segment is part of the basename.
`attach-evidence`, and a package's `transition` to `done` for every evidence
entry of its outcome, bind a record only when it resolves by id at the bound
revision, names its neighbouring report and that report is on disk at the
named hash, belongs to this workbench, carries the binding's execution policy,
and was produced against the package narrative as it stands and against the
plan in force (`missing-evidence/brief-changed`, `plan-changed`,
`no-active-plan`). No FJ02 operation writes an evidence record; Prior's request
19 asks how a reviewer will.

## What `reconcile` reports

`reconcile` repairs nothing. It reads under the read protocol and reports, over
the whole workbench or a scope as `list` takes one, in these sections:
`intents` (each pending intent left blocked, with each file's
`post | pre | diverged`); `records` (every `validate` finding, and an evidence
record outside a `reviews/` store); `references` (every reference site in
packages and records: `resolved`, `unresolved`, `ambiguous`, `foreign`, or
`unchecked` for a legacy citation string); `evidence` (every binding: `fresh`,
or the reason it would be refused); `dependencies` (every `depends_on` edge
against the target's live control data: `satisfied`, `unmet` with the reason,
and every cycle through a package in scope); `narratives` (a `**Status:**`,
`**Claim:**`, `**Mode:**`, `**Depends-on:**` or `**Active spec/plan:**` head
line in the narrative of a non-terminal record, and a narrative carrying merge
conflict markers). A terminal record's narrative is not read: its markers are
history. The report carries no clock value and no absolute path but the echoed
`workbench` root.

## The two closed vocabularies

Two token sets that FJ00 left open were closed at FJ01b, as the decision
record
`260928-1420_*_which-closed-vocabularies-do-artefact-kind-and-issue-disposition-kind-take.md`
rules (option 3, Prior's FJ00 response 6a): an artefact reference's
`artefact_ref.kind` is an enum of 20 tokens in `schemas/common.schema.json`,
and an issue's `disposition.kind` an enum of 7 in `schemas/record.schema.json`.
Both are additive-only from here: no token is removed or redefined, an
addition is adopted explicitly, and a token a reader does not know is a
refusal, never a silent fallback. A kind labels an artefact by what it is,
never by its file format.

## Layout

| Path | Holds |
|---|---|
| `schemas/*.schema.json` | JSON Schema (draft 2020-12), one file per contract, each keyed by its `$id` |
| `contract/` | The transition, dependency and Prior-mapping tables as data; `prior-mapping.json` is the contract as the Prior side ruled it (Prior `c512c4c`, reviewing `dbd1aa1`), every row confirmed |
| `fixtures/manifest.json` | The language-neutral fixture index: every fixture outside `fixtures/prior/`, `fixtures/workbench/`, `fixtures/protocol-session/`, `fixtures/prior-handback/` and `fixtures/protocol-session-fj02/` (the five `fixtures.test.ts` exempts), with the schema it is checked against and the outcome expected. Prior's Go side reads this same file and asserts the same outcomes; its shape is `fixtures/manifest.schema.json` |
| `fixtures/valid/`, `fixtures/invalid/`, `fixtures/bytes/` | The fixtures the manifest indexes |
| `fixtures/prior/` | Round-trip fixtures for the Prior DTO mapping; not indexed by the manifest. The 13 `prior.json` are Go-emitted goldens (`go-golden@dbd1aa1`, taken at Prior `c512c4c`), copied byte for byte and never edited here; each `fusion.json` beside one is the codec's import of it, and `UPDATE_PRIOR_FIXTURES=1 npm test` regenerates it when the mapping changes on purpose |
| `fixtures/prior-handback/` | Prior's FJ01 handback: the five files after Prior's own `claimed → paused` transition through the pinned bundle (the record, its revision, the `show` response, the `transition` request and response), counterchecked by `prior-handback.test.ts`; not indexed by the manifest |
| `fixtures/protocol-session/` | The FJ01 recorded session: six request/response pairs through `bin/fusion-record` over a copy of the scratch workbench, byte for byte, gated by `round-trip-cli.test.ts` and regenerated only under `UPDATE_PROTOCOL_SESSION=1`; its `README.md` is the replay procedure for the Prior side; not indexed by the manifest |
| `fixtures/protocol-session-fj02/` | The FJ02 recorded session: fifteen pairs covering every operation FJ02 answers, the replay of a `create`, a divergent replay and a read that recovers a pending intent, with the files no operation writes under `seed/<nn>-<op>/` (a memo, an evidence pair, a pending intent directory), each copied onto the workbench just before its exchange; gated by `round-trip-cli-fj02.test.ts`, regenerated only under `UPDATE_PROTOCOL_SESSION_FJ02=1`, replay procedure in its `README.md`; not indexed by the manifest |
| `fixtures/workbench/` | A minimal v12-shaped scratch workbench (`workbench.json`, `.fusion-setup`, two package pairs, one shared issue pair) the store and CLI suites copy to a temp directory before every case; not indexed by the manifest |
| `dist/fusion-record.js` | The shipped bundle, committed; `scripts/build.mjs` writes it and `src/__tests__/committed-bundle.test.ts` proves it is the build of the committed source |
| `scripts/build.mjs` | esbuild, pinned exactly, `--bundle --platform=node --format=esm --target=node20`, JSON inlined, staging path then atomic rename into `dist/`; a second run writes nothing |
| `src/cli/protocol.ts` | The request union over the fourteen operations, the response envelope and the eight error classes; `src/cli/schemas.ts` inlines the contract for the bundle |
| `src/cli/ops.ts` | `dispatch(request)`: validates against the protocol schema, then the operations it answers, reads under the kernel's read protocol and every mutation through the kernel (`src/kernel.ts`) |
| `src/cli/main.ts` | The entry point: stdin or `--file` in, stdout out, the exit codes above |
| `src/store.ts` | `openWorkbench` (spec 4.1: json-control, legacy, unsupported), `readPair` (control, `sha256:` revision of the stored bytes, narrative hash; for an evidence record the report's path and hashes instead), the walk over every control file (`package.json`, `*.record.json`, `*.evidence.json`), the evidence naming rule, `serialise` (deterministic, in the schemas' `properties` order), the one workbench write lock `.json-state/write.lock` with its takeover and the self-ignore, and `replaceAtomically` (temp file, fsync, atomic rename); it writes no record itself |
| `src/kernel.ts` | `mutate` (the one mutation sequence every operation runs through), `read` (the lock-free read protocol), the plan context an operation's plan function reads through (`readPair`, `cas`, `resolveRecordId`, `resolveArtefact`, `validateResult`), and the fault cuts `CUTS` the tests drive; see `## The kernel and the journal` |
| `src/journal.ts` | The intent (`commitIntent`, `readIntents`, `removeIntent`, `sweep`), the three-way file state and `recover`, the request digest, and the stored answer in both readable forms |
| `src/strict-json.ts` | The strict reader: bytes in, one JSON object or a typed refusal out (spec §4 limits) |
| `src/validate.ts` | Loads every schema under `schemas/` (or the inlined set) into one Ajv instance and validates a value against a schema `$id` |
| `src/transitions.ts` | `allowed(kind, from, to, payload)` and `dependencySatisfied(condition, target)` over `contract/transitions.json` and `contract/dependencies.json`; a typed refusal, never a state change |
| `src/references.ts` | Parses the three prose citation forms and the structured `record_ref`, `artefact_ref` and `foreign_ref` shapes into one union and renders them back; resolves nothing against a file system |
| `src/prior/` | The Prior DTO mapping, both directions, row by row from `contract/prior-mapping.json`: `candidates.ts`, `packages.ts`, `campaign.ts`; `gojson.ts` reproduces Go's `encoding/json` bytes so that `computePriorRevision` equals Prior's stored revision |
| `src/__tests__/` | One suite per module, plus `fixtures.test.ts` over the manifest, the two recorded-session gates and `prior-handback.test.ts` |
| `src/__tests__/helpers/seed.ts` | Seeds a temp workbench with a deterministic evidence record and its report (and a correction beside it on request), through the kernel's `mutate`: the only writer of an evidence record in FJ02, used by the evidence and `reconcile` cases and by the FJ02 recorder, which checks its `seed/09-attach-evidence/` against it |

## Working in it

```
cd codec && npm install && npm test          # builds dist/, then the package's own gate, beside hooks/'s
cd codec && npm run build                    # the bundle alone; idempotent
cd codec && npm run typecheck                # tsc --noEmit over src/
```

`npm test` in `codec/` is this package's gate and stands beside `npm test` in
`hooks/`; neither runs the other. It builds `dist/` first, because the CLI
cases spawn the bundle, and it schedules `committed-bundle.test.ts` last: that
suite compares the bundle committed at HEAD with a fresh build of the source
committed at HEAD, so it is red between a source change and the commit that
carries its rebuilt bundle, and its message says to run `npm run build` and
commit the result. The lock file is committed, as `hooks/`'s is, and `esbuild`
is pinned to an exact version in `package.json` because the bundle's bytes are
a function of it.

Prose in this repository is British English (`CLAUDE.md`).
