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
byte of this directory and no event hook runs it.

**What ships is one file.** FJ01 (the codec-port decision, option 1: one Node
bundle for both hosts) added `dist/fusion-record.js`: `src/cli/main.ts` and
everything it imports, the seven schemas and the two contract tables inlined,
bundled by esbuild at an exact pinned version and committed. Both hosts run it
with plain `node`; neither needs `node_modules`. Prior spawns it. The Claude
side reaches it two ways. `bin/fusion-record` is the wrapper a person or a
skill sends one request through. The helpers under `bin/` that answer from
control data run the bundle through the record client,
`hooks/lib/record-client.ts`, one process per request and no retry:
`bin/fusion-claimed-package`, the `<item-dir>` check of `bin/fusion-paths`
and `bin/fusion-work-order` (FJ03a), each by way of a compiled entry under
`hooks/dist/` that resolves the bundle relative to itself, so an install and a
work tree each run their own. Each asks `inspect` first and reads on only when
the workbench is `json-control`; a legacy or unsupported one is refused by
name, never read as empty.

**No event hook runs the bundle, by import or by subprocess.** A read may
finish a committed intent (`## The kernel and the journal`), and that is
admitted for a helper somebody called and for nothing else: the SessionStart,
PreToolUse, PostToolUse and SubagentStop commands of `hooks/hooks.json`, and
every `bin/` helper one of them starts, stay off the record client.
`hooks/lib/__tests__/hook-route-exclusion.test.ts` pins that on the configured
commands, and `README-hooks.md` `## Concept` carries the declaration.

## What ships

`install.sh` copies this directory whole into the install, beside `hooks/`
and `bin/`, and drops `codec/node_modules` as it drops `hooks/node_modules`.
What an installed copy runs is the bundle, `dist/fusion-record.js`, and
nothing else in it; what an installed copy carries for a reader or for the
Prior side is `schemas/`, `contract/` and `fixtures/` (the language-neutral
fixture index, the Prior DTO pairs, the scratch workbench, the three recorded
protocol sessions under `fixtures/protocol-session/` (FJ01),
`fixtures/protocol-session-fj02/` (FJ02) and
`fixtures/protocol-session-fj02b/` (FJ02b), and Prior's FJ01 handback under
`fixtures/prior-handback/`). `src/`, `scripts/`,
`package.json` and the tests are copied because the copy is whole, and are
unused at runtime: nothing in an install compiles, tests or imports them.
`node_modules` never ships, and the tarball never carries one. The installer
warns when `codec/dist/fusion-record.js` is absent, in the words it uses for a
missing `hooks/dist/guard.js`; `src/__tests__/install.test.ts` installs a
`git archive` of the tree into a scratch home with an isolated `PATH` and
proves that `bin/fusion-record`, `bin/fusion-claimed-package` and
`bin/fusion-work-order` answer there with `node` the only runtime, the two
helpers over a workbench the installed kernel wrote.

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
branch per operation of spec section 6's table and a second branch of `create`
for `kind: evidence`; the errors are the spec's eight typed classes. `inspect` reports which operations answer
(`operations.implemented`) and which do not yet (`operations.deferred`); an
operation not yet answered is refused `operation-unknown/not-implemented`, with
a detail naming the package that lands it.

**The format gate is the host's obligation** (Prior response 28). Before
deriving JSON scope, work order or dispatch decisions from codec records, the
host calls `inspect` for that workbench and proceeds only on
`state: json-control`. Legacy, unsupported, unknown, refused and unanswered
results stop that consumer; they never mean an empty store or no claim. The
gate sits at the start of a consumer operation, not as a hidden extra request
inside every transport call. A successful inspection is no lock and no
permanent authorisation: later refusals, revision changes and blocked recovery
must still be handled. `inspect` itself, diagnostic inspection of legacy data
and the explicit initialization and migration workflows do not require a
JSON-controlled workbench. `list` answers `{workbench, state, scope,
records}`, `state` being `json-control` or `legacy` as `inspect` reports it (an
unsupported workbench is still refused), and a legacy workbench `ok: true` with
`records: []`. That `state` (Prior response 28, closure (a)) does not waive the
gate: a consumer still calls `inspect` first. Fusion honours it in `gate` in
`hooks/lib/record-client.ts`, which `hooks/lib/scope.ts` and
`hooks/lib/work-graph.ts` call first in each of their consumer operations.

FJ01 answered `inspect`, `list`, `show`, `validate` and `transition` on a
package. FJ02 answers the rest of the table as it then stood but one: `create` (with
`narrative.content` it writes both halves of the pair, without it the
narrative must already exist), `transition` on every record kind, `claim`,
`release`, `set-mode`, `set-dependencies`, `adopt-plan` (`role: plan`, the
default, or `role: spec`), `attach-evidence` and `reconcile`. `migration` is
the one operation still deferred: it lands in FJ04 and is refused
`operation-unknown/not-implemented` until then. `initialize` joined the table
later, after `validate`; it is described below. Every mutation runs through
the kernel below, and `claim` and `release` are `transition` with defaults and
clearer refusals, never a second route to the files.

FJ02b added the two extensions Prior approved in its FJ02 response, both as
plan functions over the same kernel, so replay, the compare-and-swap, the
journal and recovery apply to them unchanged.

**Plan progress** is `transition` on a plan record with `payload.steps` and
`payload.criteria` (response 18). Each entry is an update keyed by the `id` of
a step or criterion the stored plan already has: the named entries are
replaced in place, an entry left out keeps its value and its position, and no
entry is added, removed or reordered. `to` may equal the plan's current state
when the plan is live and an entry changes a value, so progress needs no
state change; a terminal plan takes none, and a move to the stored state that
changes nothing is refused (`conflict/transition-refused` for both). A step
moves along the step edges of `contract/transitions.json` (`done` back to
`open` is `conflict/transition-refused`, the detail naming the step); a
criterion takes any `met` the schema admits, `null` again included. An id named
twice, in the payload or in the stored array the payload updates, is
`schema-invalid/duplicate-step-id` or `duplicate-criterion-id`, and `create`
refuses a new plan that repeats one; an id the plan lacks is
`unresolved-reference/unknown-step-id` or `unknown-criterion-id`. `steps` or
`criteria` sent for a record that is not a plan is
`schema-invalid/payload-field-not-admitted`, not ignored, because the two
fields write data. `acceptance` and the record's `references` are never
written by progress, and the answer has the shape of every `transition`.

**Evidence creation** is `create` with `kind: evidence` (response 19), the
sole write route for a new evidence record; `## Evidence records on disk`
below describes it.

**`initialize`** (Prior request 27) writes `workbench.json`, the manifest of a
new workbench, into an existing directory that holds nothing:
`{op: "initialize", workbench, operation_id, id}`, `workbench` required on this
branch, `id` the new workbench's UUID. The codec composes the manifest
(`fusion.workbench/v1`, the caller's `id`, `required_features:
["json-control-v1"]`, `migration: null`, `extensions: {}`), so a request
carrying one is `schema-invalid/request`. The answer is `{operation_id, id,
path: "workbench.json", revision}` with `revisions`, and a replay of the same
request answers those bytes, after later writes too. It runs through the kernel
below like every mutation and refuses every other target by name: a target
that is absent or no directory is `unknown-scope/workbench-missing`; a
`workbench.json` entry of any kind, valid, unsupported or a directory, is
`conflict/manifest-present`; any other entry is `conflict/target-not-empty`,
the detail naming the first entries, sorted. The one exempt entry is a
`.json-state/` holding only what the lock protocol owns (the lock, takeover
claims, the self-ignore holding `*`, and their temp files) and a `journal/` and
`ops/` with no entry but the sweep's dot-named ones; a stored answer of another
operation is an entry. `.DS_Store`, `.gitkeep`, a marker or an empty store
directory is an entry like any other. When `.json-state` is not a directory
the check runs before the lock, so a refused target keeps its bytes and gains
no `.json-state/`. `/fusion:setup` does not call it yet (FJ03d).

**`inspect.pending`** is `null`, or `{operation_id, blocked}` naming a committed
`initialize` whose manifest has not landed: the state is then `legacy`, and the
intent is the target's only entry but the exemption. No read finishes that
intent; an `initialize` request does, under the lock: the same request answers
the committed result, another lands it first and is then
`conflict/manifest-present` (decision
`260930-1654_*_does-a-read-finish-a-committed-initialize-whose-manifest-has-not-landed-or-report-the-target-as-legacy.md`,
option 3; Prior item 33). A caller deciding between `initialize` and FJ04 reads
this field and does not re-derive the exemption.

A `workbench.json` that is not a regular file, a directory or a dangling link,
is `unsupported` with `schema-invalid/manifest-not-a-file`: `inspect` shows it,
every other read and mutation refuses with it, and `initialize` answers
`manifest-present`.

## The kernel and the journal

`src/kernel.ts` is the one writer of fusion JSON. `mutate` runs every
operation in one order: the workbench state, against the states the operation
admits (a legacy or unsupported workbench refuses every operation but
`initialize`, which admits every state and whose plan function judges the
directory itself, under the lock); the workbench write lock; a sweep of the transient entries
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
twice. `ops/` is never pruned. A revision is the hash of the stored bytes, so
a record can return to bytes it held before: a `claim` followed by a `release`
leaves a package at the revision it had before the claim. A replayed old
operation whose answer had been deleted would then pass the CAS and land a
second time. `src/__tests__/kernel.test.ts` pins this through the bundle
(`stored answers are never pruned: content revisions return`), and Prior's
`TestCodecFJ02RetainedAnswerPreventsABAReplay` pins it on the Prior side. Any
future pruning needs two things first: durable protection against old
operation ids, for which Prior names retained request-digest tombstones or a
retired id namespace, and a revised read protocol, because the one described
below relies on `ops/` only growing.

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
makes the reader take the lock, recover and read again. A read may therefore
finish a committed intent, a multi-file one included, and is not a promise of
zero physical writes. The operation name confers no authority: a host
authorises that recovery on its own, apart from a read-only role, which must
not receive it because the request it sends is a read (Prior's FJ02 response,
`## Recovery and rollout consequences`).

**One intent no read finishes.** A read of a workbench that is not under JSON
control runs once, without recovery. The one intent that can stand in such a
workbench is a committed `initialize` whose manifest has not landed, so no read
finishes it: `inspect` names it as `pending`, and an `initialize` request
finishes it under the lock. Every other committed intent is recovered by reads
as described above.

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
`no-active-plan`).

**`create` with `kind: evidence` is the sole write route for a new evidence
record** (FJ02b, Prior's FJ02 response 19). The request is a branch of its
own: `{op, workbench?, operation_id, id, kind: "evidence", scope: {container,
store: "reviews"}, payload}`, where `payload` is the complete
`fusion.evidence/v1` record. The report is the reviewer's file and is already
on disk; the kernel writes the record alone, the payload serialised, and adds
nothing to it. The checks run in this order, and each refuses with nothing
written:

| Check | Refusal |
|---|---|
| The payload's `id` is the envelope's `id` | `schema-invalid/id-mismatch` |
| The payload's `workbench_id` is this workbench's | `unknown-scope/foreign-workbench-id` |
| The report's directory is the scope's `reviews/` store | `unknown-scope/store-kind-mismatch` |
| The scope's container is a package directory | `unknown-scope/container-missing` |
| The report's basename is marker-free, ends in `.md`, and `<basename>.evidence.json` reads back as a first record of that basename (a basename ending in `.2` would read as a correction counter) | `schema-invalid/report-name` |
| The report is on disk, at the hash the payload names | `unresolved-reference/report-missing`, `missing-evidence/report-changed` |
| The `id` is carried by no record of the workbench | `conflict/id-in-use` |
| The predecessor, when set, resolves to an evidence record of this workbench, at its pinned revision when one is given | `unresolved-reference/…`, `unresolved-reference/not-evidence`, `missing-evidence/evidence-revision-mismatch` |
| A predecessor naming the same `report.path` names the same `report.sha256` as the payload | `conflict/predecessor-report-changed` |
| No file stands at the chosen path | `conflict/record-exists` |

**The kernel chooses the path.** A record without a predecessor, or whose
predecessor names another report, is the report's first record,
`<basename>.evidence.json`; a file already standing there is
`conflict/record-exists` and is never read as a correction. A predecessor
naming the same report makes a correction, `<basename>.<n>.evidence.json`. A
correction under the same basename is admitted only over an unchanged report:
the same path does not mean the same bytes, so the predecessor's
`report.sha256` must equal the payload's, and a changed report takes a new
basename.

**The counter `n` is one above the highest counter present in the directory
as it stands, and 2 when none is.** It is read under the write lock and frozen
in the intent and the stored answer, so an identical retry answers the same
path even after a later correction has landed, and it never collides with a
file that stands. That is the whole guarantee. No durable counter is kept: a
suffix freed by a hand deletion of the highest file can be chosen again, while
a gap below the highest is not refilled.

The answer is `{operation_id, path, kind: "evidence", revision, report: {path,
sha256}}`: `create`'s shape with the report in place of the narrative, and
`path` the file the kernel chose. Nothing in creation reads `host`,
`execution_policy` or `verdict`. The kernel receives no caller identity it may
authorise on, so a label a caller writes confers nothing and is stored as
sent; `attach-evidence` and a package's move to `done` check policy agreement
and freshness on their own.

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

Record ids resolve through one index per read attempt, built from a single walk
of the control files the first time an id is asked for, so an unscoped
`reconcile` grows with records plus references rather than their product
(issue 260930-1712). The index answers what a mutation's resolver answers over
the same files, the ambiguous detail's order included, and it lives in
`reconcile` alone: mutations still walk the store per id, and a retried read
builds a new index over the view it retries on. `ops.test.ts` counts the walks
and parses of one call at two store sizes.

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
| `fixtures/manifest.json` | The language-neutral fixture index: every fixture outside `fixtures/prior/`, `fixtures/workbench/`, `fixtures/protocol-session/`, `fixtures/prior-handback/`, `fixtures/protocol-session-fj02/` and `fixtures/protocol-session-fj02b/` (the six `fixtures.test.ts` exempts), with the schema it is checked against and the outcome expected. Prior's Go side reads this same file and asserts the same outcomes; its shape is `fixtures/manifest.schema.json` |
| `fixtures/valid/`, `fixtures/invalid/`, `fixtures/bytes/` | The fixtures the manifest indexes |
| `fixtures/prior/` | Round-trip fixtures for the Prior DTO mapping; not indexed by the manifest. The 13 `prior.json` are Go-emitted goldens (`go-golden@dbd1aa1`, taken at Prior `c512c4c`), copied byte for byte and never edited here; each `fusion.json` beside one is the codec's import of it, and `UPDATE_PRIOR_FIXTURES=1 npm test` regenerates it when the mapping changes on purpose |
| `fixtures/prior-handback/` | Prior's FJ01 handback: the five files after Prior's own `claimed → paused` transition through the pinned bundle (the record, its revision, the `show` response, the `transition` request and response), counterchecked by `prior-handback.test.ts`; not indexed by the manifest |
| `fixtures/protocol-session/` | The FJ01 recorded session: six request/response pairs through `bin/fusion-record` over a copy of the scratch workbench, byte for byte, gated by `round-trip-cli.test.ts` and regenerated only under `UPDATE_PROTOCOL_SESSION=1`; its `README.md` is the replay procedure for the Prior side; not indexed by the manifest |
| `fixtures/protocol-session-fj02/` | The FJ02 recorded session: fifteen pairs covering every operation FJ02 answers, the replay of a `create`, a divergent replay and a read that recovers a pending intent, with the files no operation writes under `seed/<nn>-<op>/` (a memo, an evidence pair, a pending intent directory), each copied onto the workbench just before its exchange; gated by `round-trip-cli-fj02.test.ts`, regenerated only under `UPDATE_PROTOCOL_SESSION_FJ02=1`, replay procedure in its `README.md`; not indexed by the manifest |
| `fixtures/protocol-session-fj02b/` | The FJ02b recorded session: twenty pairs covering plan progress through `transition` (with and without a state change, its replay, and the refusals for a stale revision, a forbidden step edge, a repeated id, an unknown id and a closed plan) and `create` of `kind: evidence` (a first record, two corrections, the replay of the first correction after the second landed, and the refusals for a taken name, a report at another hash and a correction over a changed report), with the report no operation writes under `seed/11-create/` and its replacement under `seed/20-create/`, each copied onto the workbench just before its exchange; gated by `round-trip-cli-fj02b.test.ts`, regenerated only under `UPDATE_PROTOCOL_SESSION_FJ02B=1`, replay procedure in its `README.md`; not indexed by the manifest |
| `fixtures/workbench/` | A minimal v12-shaped scratch workbench (`workbench.json`, `.fusion-setup`, two package pairs, one shared issue pair) the store and CLI suites copy to a temp directory before every case; not indexed by the manifest |
| `dist/fusion-record.js` | The shipped bundle, committed; `scripts/build.mjs` writes it and `src/__tests__/committed-bundle.test.ts` proves it is the build of the committed source |
| `scripts/build.mjs` | esbuild, pinned exactly, `--bundle --platform=node --format=esm --target=node20`, JSON inlined, staging path then atomic rename into `dist/`; a second run writes nothing |
| `src/cli/protocol.ts` | The request union over the fifteen operations, the response envelope and the eight error classes; `src/cli/schemas.ts` inlines the contract for the bundle |
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
| `src/__tests__/` | One suite per module, plus `fixtures.test.ts` over the manifest, the three recorded-session gates (`round-trip-cli.test.ts`, `round-trip-cli-fj02.test.ts`, `round-trip-cli-fj02b.test.ts`) and `prior-handback.test.ts` |
| `src/__tests__/helpers/seed.ts` | Seeds a temp workbench with a deterministic evidence record and its report (and a correction on request): the report is written as a plain file and the record is created through `create` with `kind: evidence`, the kernel choosing its path. `placeEvidence` writes a pair by hand, with no check, only for the cases whose record `create` refuses. Used by the evidence and `reconcile` cases and by the FJ02 recorder, which checks its `seed/09-attach-evidence/` against it |
| `src/__tests__/helpers/session.ts` | The machinery the FJ02 and FJ02b recorders share: the wrapper spawned once per exchange over a temp copy of the scratch workbench, the `<workbench>` substitution, a `seed/<nn>-<op>/` set copied just before its exchange, the file listing and the bytes a comparison reads, and the regeneration switch. It holds no assertion about a session; the FJ01 recorder keeps its own copy |

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
