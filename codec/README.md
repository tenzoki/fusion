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
fixture index, the Prior DTO pairs, the scratch workbench, the five recorded
protocol sessions under `fixtures/protocol-session/` (FJ01),
`fixtures/protocol-session-fj02/` (FJ02),
`fixtures/protocol-session-fj02b/` (FJ02b),
`fixtures/protocol-session-initialize/` (`initialize`) and
`fixtures/protocol-session-archive/` (the archive revision), and Prior's FJ01 handback under
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
branch per operation of spec section 6's table, a second branch of `create`
for `kind: evidence`, and `maintenance` (request 39) after `reconcile`, one
branch for `begin` and one for `end`; the errors are the spec's eight typed classes. `inspect` reports which operations answer
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
default, or `role: spec`), `attach-evidence` and `reconcile`. `migration` lands
in FJ04: its `survey` and `plan` phases are answered (below, "`migration`"),
and `apply`, `verify` and `rollback` are refused
`operation-unknown/not-implemented`, naming the phase, until FJ04's step 6.
No operation is deferred any more. `initialize` joined the table
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
`schema-invalid/payload-field-not-admitted`, not ignored: since the archive
revision that is the plan row of the general rule below. `acceptance` and the
record's `references` are never written by progress, and the answer has the
shape of every `transition`.

**Foreign payload fields** (Prior's FJ03c response 37, the archive revision).
A `transition` payload admits, per target kind, the fields of one row of
`TRANSITION_PAYLOAD_FIELDS` (`src/cli/ops.ts`): a package `claim` and
`outcome`, an issue `disposition`, a plan `steps` and `criteria`, a decision
`answer_ref`, `implementation_ref`, `superseded_by` and `deferral`, a
discussion none. A present key outside the row, `null` included, is
`schema-invalid/payload-field-not-admitted`, checked after the caller's
revision and the record's kind are read and before any rule, intent or write;
it was dropped in silence before. Within the row the target state's rules
decide, as before. `ops.test.ts` derives the table from the schema positions
the Claude client's `PAYLOAD_FIELDS` test reads and pins it to Prior's table.
The check is the `transition` entry's own: `claim` and `release` compose their
payload and keep their answers.

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
directory is an entry like any other. When `.json-state` is not a directory,
or its `journal` or `ops` stands and is not one, the check runs before the
lock, so a refused target keeps its bytes and gains no `.json-state/`; a
`journal` or `ops` that is a file is `conflict/target-not-empty` naming
`.json-state/journal` or `.json-state/ops`. `/fusion:setup` does not call it
yet (FJ03d).

**`inspect.pending`** is `null`, or `{operation_id, id, blocked}` naming the
committed `initialize` in `.json-state/journal/`, until its intent leaves the
journal, whatever else the root holds and whatever `workbench.json` is
(absent, other bytes, not a file). `id` is the workbench UUID the staged
manifest carries, read after it validates, so a host that lost its request
rebuilds it from the target and this field alone: `{op: "initialize",
workbench: <target>, operation_id, id}`. `blocked` is the kernel's recovery
classification: `true` when the manifest stands at neither its pre- nor its
post-bytes. The field reports the operation and grants nothing: `state` stays
the one the manifest's bytes give, and a blocked intent is to be corrected by
hand first (`## The kernel and the journal`, Recovery). No read finishes the
intent; an `initialize` request does, under the lock: the same request answers
the committed result, another lands it first and is then
`conflict/manifest-present`, and the same request over a copy of the directory
(another path, so another request digest) is `conflict/operation-id-reused`
(decision
`260930-1654_*_does-a-read-finish-a-committed-initialize-whose-manifest-has-not-landed-or-report-the-target-as-legacy.md`,
option 3; Prior item 33, corrected at Prior `ae1ad78`). Journal data `inspect`
cannot read is never answered `null`: a committed entry that does not read
(its `op` is then unknown, whatever the state), an `initialize` whose writes are
not exactly the manifest, and a staged manifest that does not validate or
carries another id than the intent's recorded answer are refused
`operation-unknown/pending-initialize-unreadable`; more than one committed
`initialize` is `operation-unknown/pending-initialize-ambiguous`. Both details
name the intent directories. A journal that cannot be listed for any reason but
its absence (a `.json-state` or a `journal` that is a file, a denied read) is
`pending-initialize-unreadable` as well, the detail naming
`.json-state/journal` and the error code; `inspect` never throws on it. A caller deciding between `initialize` and FJ04
reads this field and does not re-derive the exemption. A successful replay is
no proof of the manifest's present bytes (it answers after `workbench.json` was
deleted), so a caller inspects again after it.

A `workbench.json` that is not a regular file, a directory or a dangling link,
is `unsupported` with `schema-invalid/manifest-not-a-file`. Four envelopes
answer it, each on its own path:

- `inspect` answers `ok` with `state: unsupported`, that diagnosis, and
  `pending` when a committed `initialize` stands;
- `list`, `show`, `validate` and `reconcile` refuse with the diagnosis itself,
  `schema-invalid/manifest-not-a-file`;
- every mutation but `initialize` is refused by the kernel's state gate,
  `unsupported-format/manifest-not-a-file`;
- `initialize` keeps its order: a replay under its id answers the stored answer
  or `conflict/operation-id-reused`, a blocked intent is
  `operation-unknown/recovery-blocked`, and only a fresh request reaches the
  content check, which answers `conflict/manifest-present` for a
  `workbench.json` entry of any kind.

Only the dangling link reads as not a file. A `workbench.json` whose kind
cannot be examined, a link loop or a link through a denied directory, is
`unsupported` with `schema-invalid/manifest-unreadable`, the error code in the
detail (`ELOOP`, `EACCES`), through the same four envelopes; it is never
reported as `manifest-not-a-file` and never thrown.

**`archive/` is outside the current record store** (Prior's ruling on request
36; `fixtures/prior/REQUESTS.md`, "The boundary: `archive/` outside the current
record store"). One predicate decides it, `archived` in `src/store.ts`: a
path whose lexically normalised first segment is `archive`, or whose deepest
existing ancestor's real path lies in the real path of the root's `archive/`,
so a link such as `shared/old -> ../archive/x` is refused like the path it
aliases. One gate applies it, `resolveCurrent`, after `resolveInside`'s
traversal and outside-workbench refusals:

| Input | Answer when the path is archived |
|---|---|
| A record path: `show`, `validate`, the `record` of every mutation | `unresolved-reference/record-not-found`, in the operation's existing envelope (a finding for `validate`) |
| A `list` or `reconcile` scope | `unknown-scope/archived-path`, an absent path below `archive/` included |
| A `create` container, narrative path, or an evidence record's report path | `unknown-scope/archived-path`, before the intent |
| A record id (an origin, `adopt-plan`'s plan, `attach-evidence`'s evidence, any reference) | not found: the walk (`controlFiles`) skips every archived directory and both id resolvers walk through it, so an id only in `archive/` is `record-not-found`, never `ambiguous-reference` |
| A hash-bound artefact (`provenance.backup`, a migration receipt) | unchanged: historical reads stay supported |

An unscoped `list`, `validate` or `reconcile` never answers `archived-path`;
it skips `archive/`. A directory named `archive` below the root, such as
`shared/archive/`, is an ordinary store directory. The `create` check runs in
the plan, after the replay lookup, so a create completed before its pair was
archived still answers its stored bytes and recreates nothing. The codec
moves no file into `archive/`; that is the host's maintenance move.

**`maintenance`** (request 39, the archive revision; decision
`261001-1030_*_how-does-the-host-hold-maintenance-exclusivity-over-codec-writers-while-it-moves-pairs.md`,
option 1) is the fence a host holds while it moves pairs. `{op:
"maintenance", workbench?, operation_id, action: "begin"}` writes
`.json-state/maintenance.json`, `{operation_id, since}`; `{op: "maintenance",
workbench?, operation_id, action: "end", fence}`, under an `operation_id` of
its own, removes the fence whose `begin` `fence` names. The answer is
`{operation_id, action, since}`, `since` the fence's, and carries no
`revisions`: the fence writes no record and takes no intent. It runs through
the kernel's sequence (below), which checks the fence after the replay lookup
and before every plan:

| Request | No fence | Fence `F` stands | Fence file does not read |
|---|---|---|---|
| A replay of a completed operation (any op, `F`'s own `begin` included) | its stored answer | its stored answer, nothing written | its stored answer |
| `begin` | sets the fence; `operation-unknown/recovery-blocked` while an intent recovery cannot land stands, and then no fence | `conflict/maintenance-active`, whatever its id | `conflict/maintenance-active` |
| `end` naming `F` | `conflict/maintenance-not-active` | removes `F` | `conflict/maintenance-active` |
| `end` naming another fence | `conflict/maintenance-not-active` | `conflict/maintenance-active` | `conflict/maintenance-active` |
| `end` under the `operation_id` of a stored `begin` | `conflict/operation-id-reused` (the replay lookup) | `conflict/operation-id-reused` | `conflict/operation-id-reused` |
| every other fresh mutation | as before | `conflict/maintenance-active`, before its intent; the detail names `F`'s id and `since` | `conflict/maintenance-active`, the detail naming the file |
| `initialize` | as before | as before: a fenced store has a manifest, so `conflict/manifest-present` | as before |
| `list`, `show`, `validate`, `reconcile` | as before | as before | as before |
| `inspect` | `maintenance: null` | `maintenance: {operation_id, since}` | `operation-unknown/maintenance-unreadable` |

`inspect.maintenance` follows `pending`, and `operations.implemented` ends
with `maintenance`. Only an absent entry is no fence: the entry itself
decides presence, as for `workbench.json`, so a dangling link stands. A file
that does not read is an entry that is not a regular file through its link
(a dangling link, a link loop, a directory or a link to one), cannot be read,
does not parse strictly, or is not exactly `{operation_id, since}` with two
strings; it fences until it is removed (request 39 (d), Prior `39f6fb8`). A
link to a fence file reads as that fence, and its `end` removes the link. `end` with no fence
standing is refused, never answered as success (request 39 (c)). The fence is
set before its answer is stored and removed before the `end`'s answer is: a
process killed between the two leaves the fence it meant to set, which a retry
of its `begin` meets as `maintenance-active` naming its own id, or no fence,
which a retry of its `end` meets as `maintenance-not-active`; `inspect` tells
which. The fence outlives the process and its lock. It is local to one
checkout, since `.json-state/` never travels. A host that set a fence ends it;
if the host's record of the move is lost, deleting the fence file is no
recovery, since a `validate` and a `reconcile` pass a half-moved pair: the
host recovers a trustworthy record, or restores or verifies a known complete
state (every pair and evidence group whole, every file at its recorded hash)
under the fence before removing it, and where neither can be established the
fence stays and normal work stays blocked (`bin/fusion-archive`).

## The kernel and the journal

`src/kernel.ts` is the one writer of fusion JSON. `mutate` runs every
operation in one order: the workbench state, against the states the operation
admits (a legacy or unsupported workbench refuses every operation but
`initialize`, which admits every state and whose plan function judges the
directory itself, under the lock); the workbench write lock; a sweep of the transient entries
in `.json-state/journal/` and `.json-state/ops/`; the recovery of every pending
intent; the replay lookup, which consults a pending intent under the request's
`operation_id` before the stored answer; the maintenance fence, which refuses
every fresh mutation but `initialize` and the `end` naming it while it stands;
the operation's own plan function,
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
| `maintenance.json` | The maintenance fence, `{operation_id, since}`, present from a `maintenance begin` to the `end` naming it; written and removed under the lock, never through the journal |
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
control runs once, without recovery. The intent expected in such a workbench is
a committed `initialize` whose manifest has not landed, or stands at other
bytes, so no read finishes it: `inspect` names it as `pending`, with the
blocked flag from the same classification a lock-free read applies
(`blockedIntent`), and an `initialize` request finishes it under the lock.
Every other committed intent is recovered by reads as described above.

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
record outside a `reviews/` store); `references` (every binding site of every
package, record and evidence record, each entry `{path, at, role?, status,
target?, class?, reason?}`: `resolved`, `unresolved`, `ambiguous`, `foreign`,
or `unchecked` for a legacy citation string); `evidence` (every binding: `fresh`,
or the reason it would be refused); `dependencies` (every `depends_on` edge
against the target's live control data: `satisfied`, `unmet` with the reason,
and every cycle through a package in scope); `narratives` (a `**Status:**`,
`**Claim:**`, `**Mode:**`, `**Depends-on:**` or `**Active spec/plan:**` head
line in the narrative of a non-terminal record, and a narrative carrying merge
conflict markers). A terminal record's narrative is not read: its markers are
history. The report carries no clock value and no absolute path but the echoed
`workbench` root. The walk never enters the root's `archive/`, so an archived
record is in no section, and a reference to one is `unresolved` with
`record-not-found`; a scope in `archive/` is refused `archived-path`.

Record ids resolve through one index per read attempt, built from a single walk
of the control files the first time an id is asked for, so an unscoped
`reconcile` grows with records plus references rather than their product
(issue 260930-1712). The index answers what a mutation's resolver answers over
the same files, the ambiguous detail's order included, and it lives in
`reconcile` alone: mutations still walk the store per id, and a retried read
builds a new index over the view it retries on. `ops.test.ts` counts the walks
and parses of one call at two store sizes.

An entry at `/active_documents/<i>/ref` carries `role`, right after `at`: the
stored `active_documents[i].role` of the package at `path`, `plan` or `spec`,
whatever the entry's `status`. It is taken from the binding at its source,
never from the target's kind, name or position, so an unresolved or ambiguous
binding carries its role and still no `target`. No other entry carries one.
A reader such as the citation sweep learns each binding's role from this one
report, with no `show` per package. This moved two fields of the recorded FJ02
answer `fixtures/protocol-session-fj02/15-reconcile.response.json`; that file
stays as recorded, and `15-reconcile.role-delta.json` beside it names the two
added fields, which the FJ02 gate applies to the recorded bytes (Prior
`a15dfc8`).

**`references` is complete by the schemas** (the archive revision, request
40). Its sites are every position of a control record's schema that reaches a
`record_ref`, an `artefact_ref`, an `evidence_ref` (through its `ref`), a
`reference` or a narrative, with `extensions` and `legacy_fields` opaque and the
record's own narrative left to `records`. So an evidence record names its
report at `/report` and its predecessor at `/predecessor`, and every package
and record names its `provenance.backup` at `/provenance/backup`, after its
other sites in the schema's field order; both are artefact references,
`resolved` at their hash or `unresolved` (`missing-evidence/artefact-changed`,
`unresolved-reference/artefact-missing`), and a backup under `archive/` still
resolves. `ops.test.ts` derives the position set from the schemas per kind and
holds `referenceSites` equal to it, so a schema field without a site fails the
suite. A host decides from this one answer which records a remaining record
binds. This moved one entry of the same recorded FJ02 answer, the evidence
record's `/report`; `15-reconcile.report-delta.json` adds it after the role
delta.

**Reviewed deltas.** A recorded response is never edited once Prior has
replayed it. Where a revision moves its bytes, a delta file beside it,
`<nn>-<op>.<topic>-delta.json`, states exactly what moved, and the session's
gate compares the fresh answer with the recording plus its deltas in order.
The role delta has the first form (fields added to entries picked by `path`
and `at`); later ones carry `"format": "fusion.session-delta/2"`, a list of
`replace` and `add` changes by JSON pointer (an added object member names the
member it follows), and `follows`, the delta files applied before it.
`codec/src/__tests__/helpers/session.ts` is the one implementation. The
archive revision's deltas are `protocol-session-fj02/15-reconcile.report-delta.json`,
`protocol-session-initialize/26-inspect.detail-delta.json` (the
`pending-initialize-unreadable` detail naming the intent's directory once,
where it named it twice), and `protocol-session-initialize/<nn>-inspect.maintenance-delta.json`
for `01`, `08`, `14`, `16`, `18`, `19`, `21`, `22` and `24`, every successful
recorded `inspect`, each adding `maintenance: null` after `pending` and
`maintenance` at the end of `operations.implemented`.

## `migration`

The maintenance run of spec section 8, as `fixtures/prior/REQUESTS.md`
"FJ04 (the contract delta, amended for ab9cb59)" states it, in
`src/migration.ts`. The host reads the v12 Markdown and composes a mapping
proposal; the codec validates it, freezes it and alone writes every byte.

**`survey`** is an observation: `{layout, entries, local_state}`. `entries` is
every entry under the root but `.json-state/`, sorted bytewise by path, each a
file `{path, kind, size, sha256}`, a link `{path, kind, target}` (its own text,
never followed or hashed), a directory `{path, kind}` or `{path, kind:
"other"}`. `local_state` is `{present, intents, maintenance, unreadable}`: the
pending intents by id, op and migration phase, the fence, and what does not
read. It takes no lock, sweeps and recovers nothing, stores no answer and
creates no `.json-state/`; an answer over 16 MiB is refused
`schema-invalid/too-large`.

**`plan`** takes `proposal: {path, sha256}` under `.json-state/migration/`,
read strictly at a 16 MiB cap (`strictParse`'s `cap`, the one caller that
passes one). It runs through the kernel admitting every state, so that its
replay and its own recovery come first, and then decides in the contract's
order, first refusal wins: a manifest that does not read; a held intent
(`conflict/intent-pending`); a manifest, answered as the second-run no-op
when it names a receipt of this migration that holds, else
`migration-incomplete/receipt-unverified` or `conflict/manifest-present`; a
fence (`maintenance-active`); standing plan files (`migration-planned`); the
proposal's form and its hash (`proposal-invalid`, `conflict/source-changed`);
the records (`proposal-invalid`, `duplicate-id`, `record-exists`,
`blocking-finding`, `closure-incomplete` over every `record_ref` site
`referenceSites` names, an acceptance its package does not carry); the
inventory the codec takes under the lock, against every source hash
(`source-changed`) and every rewrite's deletion ranges; the cut and the
operation-id schedule (`proposal-invalid`); and the freeze bound
(`schema-invalid/plan-too-large`). The writes are cut in narrative-path order
into chunks of at most 50, a pair never split, originals first. The plan is
frozen under `archive/migrations/<id>/` as `chunks/<n>.json`,
`parts/{records,inventory,findings,repairs}-<n>.json` and `plan.json`, the
index, which binds every part by hash: in ONE intent, the index its last
write, so no plan is visible before it lands.

**The freeze bound.** Every plan file and `intent.json` under 1 MiB, at most
80 files and 6 MiB. Measured for step 5 through the bundle with process
start, on a store generated at the largest measured copy's size (749 pairs,
1 680 writes, 7 942 files): 41 files, 3 410 844 bytes, 1.26 s, 1.28 s and
1.32 s. A freeze over the bound publishes nothing; a multi-request freeze is
the contract's question 50 and is not built.

**A migration intent is held.** Only the request that committed it finishes
it. Every other request's recovery, a read's included, leaves an intent whose
`op` is `migration` untouched (a `migration` request also leaves a committed
`initialize`), and the paths it names answer
`operation-unknown/migration-pending` in `list`, `show`, `validate` and
`reconcile` and to any mutation that touches them (`kernel.ts`, `isHeld`).

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
| `fixtures/manifest.json` | The language-neutral fixture index: every fixture outside `fixtures/prior/`, `fixtures/workbench/`, `fixtures/protocol-session/`, `fixtures/prior-handback/`, `fixtures/protocol-session-fj02/`, `fixtures/protocol-session-fj02b/`, `fixtures/protocol-session-initialize/` and `fixtures/protocol-session-archive/` (the eight `fixtures.test.ts` exempts), with the schema it is checked against and the outcome expected. Prior's Go side reads this same file and asserts the same outcomes; its shape is `fixtures/manifest.schema.json` |
| `fixtures/valid/`, `fixtures/invalid/`, `fixtures/bytes/` | The fixtures the manifest indexes |
| `fixtures/prior/` | Round-trip fixtures for the Prior DTO mapping; not indexed by the manifest. The 13 `prior.json` are Go-emitted goldens (`go-golden@dbd1aa1`, taken at Prior `c512c4c`), copied byte for byte and never edited here; each `fusion.json` beside one is the codec's import of it, and `UPDATE_PRIOR_FIXTURES=1 npm test` regenerates it when the mapping changes on purpose |
| `fixtures/prior-handback/` | Prior's FJ01 handback: the five files after Prior's own `claimed → paused` transition through the pinned bundle (the record, its revision, the `show` response, the `transition` request and response), counterchecked by `prior-handback.test.ts`; not indexed by the manifest |
| `fixtures/protocol-session/` | The FJ01 recorded session: six request/response pairs through `bin/fusion-record` over a copy of the scratch workbench, byte for byte, gated by `round-trip-cli.test.ts` and regenerated only under `UPDATE_PROTOCOL_SESSION=1`; its `README.md` is the replay procedure for the Prior side; not indexed by the manifest |
| `fixtures/protocol-session-fj02/` | The FJ02 recorded session: fifteen pairs covering every operation FJ02 answers, the replay of a `create`, a divergent replay and a read that recovers a pending intent, with the files no operation writes under `seed/<nn>-<op>/` (a memo, an evidence pair, a pending intent directory), each copied onto the workbench just before its exchange, and `15-reconcile.role-delta.json` then `15-reconcile.report-delta.json`, the two reviewed fields and the one reviewed entry the current answer adds to the historical `15-reconcile.response.json`; gated by `round-trip-cli-fj02.test.ts`, regenerated only under `UPDATE_PROTOCOL_SESSION_FJ02=1` (15's response never), replay procedure in its `README.md`; not indexed by the manifest |
| `fixtures/protocol-session-fj02b/` | The FJ02b recorded session: twenty pairs covering plan progress through `transition` (with and without a state change, its replay, and the refusals for a stale revision, a forbidden step edge, a repeated id, an unknown id and a closed plan) and `create` of `kind: evidence` (a first record, two corrections, the replay of the first correction after the second landed, and the refusals for a taken name, a report at another hash and a correction over a changed report), with the report no operation writes under `seed/11-create/` and its replacement under `seed/20-create/`, each copied onto the workbench just before its exchange; gated by `round-trip-cli-fj02b.test.ts`, regenerated only under `UPDATE_PROTOCOL_SESSION_FJ02B=1`, replay procedure in its `README.md`; not indexed by the manifest |
| `fixtures/protocol-session-initialize/` | The `initialize` recorded session: twenty-six pairs over a root of targets, not one workbench (`<workbench>/legacy`, `/file`, `/new`, `/pending`, `/crowded`, `/diverged`, `/nonfile`, `/unreadable`). It covers `inspect` and `list` on an empty directory and a v12 store (`state: legacy`); `initialize` refused on the store (`target-not-empty`, byte-identical after) and on a file (`workbench-missing`), landed on the empty directory, replayed before and after a `create` with an `inspect` after each replay, refused under its id with another request (`operation-id-reused`) and under another id (`manifest-present`); then `inspect.pending` (`{operation_id, id, blocked}`) over a committed intent alone and beside another entry, each landed by the request rebuilt from the target and `pending` alone, over a diverged and a non-file manifest (`blocked: true`, the `initialize` `recovery-blocked` with every file kept), and over an unreadable intent (`pending-initialize-unreadable`, whose current detail is the historical `26-inspect.response.json` with `26-inspect.detail-delta.json` applied); each successful `inspect` answers its historical recording with `<nn>-inspect.maintenance-delta.json` applied. `base/` is the root the session starts from; `seed/<nn>-inspect/` holds each intent, the readable ones cut in process from the request their `initialize` exchange sends, with the request digest as the placeholder `<request-digest:<nn>-initialize>` a replayer computes; gated by `round-trip-cli-initialize.test.ts`, regenerated only under `UPDATE_PROTOCOL_SESSION_INITIALIZE=1`, replay procedure and the placeholder rule in its `README.md`; not indexed by the manifest |
| `fixtures/protocol-session-archive/` | The archive revision's recorded session: fifty-one pairs over one workbench under JSON control (`base/`: a live issue, a closed chain it names, a closed issue naming another, the closed unit of two failed moves, an open record of every other kind, and two done packages, each with its evidence group), with the host's moves, copies and one link between exchanges. It covers `reconcile` naming every binding before the sweep; request 37's refusal once per kind; `maintenance` `begin` refused `recovery-blocked` over a seeded intent, then landing it and setting the fence, the intent's request answering its stored bytes under the fence and a fresh one `maintenance-active`; after a sweep into `archive/` of a terminal issue pair, a created pair and a whole package with its evidence group, `validate`, `reconcile` and `list` without them, a reference to the archived issue `record-not-found`, an archive-only copy of a current id no second carrier, scopes into `archive/` and through a link `archived-path`, archived paths `record-not-found`, the pre-archive `create` replayed without recreating its files, `end`; three failed moves under a fence each (a control file without its narrative and a container without its evidence group, which neither `validate` nor `reconcile` sees, and a narrative without its control file, `narrative-missing`), each restored and ended; and `inspect` over a journal that is a file. `base/` is the workbench the session starts from; `seed/11-maintenance/` holds the intent, cut in process from exchange 14's request with its digest as the placeholder `<request-digest:14-transition>`, and L diverged, `seed/12-maintenance/` L restored; each fence's `since`, the clock's, is recorded as `<since:<nn>-maintenance>`; gated by `round-trip-cli-archive.test.ts`, regenerated only under `UPDATE_PROTOCOL_SESSION_ARCHIVE=1`, the host's actions, the placeholder rules and the replay procedure in its `README.md`; not indexed by the manifest |
| `fixtures/workbench/` | A minimal v12-shaped scratch workbench (`workbench.json`, `.fusion-setup`, two package pairs, one shared issue pair) the store and CLI suites copy to a temp directory before every case; not indexed by the manifest |
| `dist/fusion-record.js` | The shipped bundle, committed; `scripts/build.mjs` writes it and `src/__tests__/committed-bundle.test.ts` proves it is the build of the committed source |
| `scripts/build.mjs` | esbuild, pinned exactly, `--bundle --platform=node --format=esm --target=node20`, JSON inlined, staging path then atomic rename into `dist/`; a second run writes nothing |
| `scripts/bench-fixture.mjs` | The scale fixture of the measurement protocol: a JSON-controlled store of packages, each with one adopted plan, built through the bundle beside it with fixed ids and cut into the subsets of 200, 500, 1 000 and 2 500 records, so that the Prior side can rebuild the stores the figures were taken on; a tool, run by nothing in the suite and timing nothing |
| `src/cli/protocol.ts` | The request union over the sixteen operations, the response envelope and the eight error classes; `src/cli/schemas.ts` inlines the contract for the bundle |
| `src/cli/ops.ts` | `dispatch(request)`: validates against the protocol schema, then the operations it answers, reads under the kernel's read protocol and every mutation through the kernel (`src/kernel.ts`) |
| `src/cli/main.ts` | The entry point: stdin or `--file` in, stdout out, the exit codes above |
| `src/store.ts` | `openWorkbench` (spec 4.1: json-control, legacy, unsupported), `readPair` (control, `sha256:` revision of the stored bytes, narrative hash; for an evidence record the report's path and hashes instead), the walk over every control file (`package.json`, `*.record.json`, `*.evidence.json`), the evidence naming rule, `serialise` (deterministic, in the schemas' `properties` order), the one workbench write lock `.json-state/write.lock` with its takeover and the self-ignore, the maintenance fence `.json-state/maintenance.json` (`readFence`, `writeFence`, `removeFence`), and `replaceAtomically` (temp file, fsync, atomic rename); it writes no record itself |
| `src/kernel.ts` | `mutate` (the one mutation sequence every operation runs through), `read` (the lock-free read protocol), the plan context an operation's plan function reads through (`readPair`, `cas`, `resolveRecordId`, `resolveArtefact`, `validateResult`), and the fault cuts `CUTS` the tests drive; see `## The kernel and the journal` |
| `src/journal.ts` | The intent (`commitIntent`, `readIntents`, `removeIntent`, `sweep`), the three-way file state and `recover`, the request digest, and the stored answer in both readable forms |
| `src/strict-json.ts` | The strict reader: bytes in, one JSON object or a typed refusal out (spec §4 limits) |
| `src/validate.ts` | Loads every schema under `schemas/` (or the inlined set) into one Ajv instance and validates a value against a schema `$id` |
| `src/transitions.ts` | `allowed(kind, from, to, payload)` and `dependencySatisfied(condition, target)` over `contract/transitions.json` and `contract/dependencies.json`; a typed refusal, never a state change |
| `src/references.ts` | Parses the three prose citation forms and the structured `record_ref`, `artefact_ref` and `foreign_ref` shapes into one union and renders them back; resolves nothing against a file system |
| `src/prior/` | The Prior DTO mapping, both directions, row by row from `contract/prior-mapping.json`: `candidates.ts`, `packages.ts`, `campaign.ts`; `gojson.ts` reproduces Go's `encoding/json` bytes so that `computePriorRevision` equals Prior's stored revision |
| `src/__tests__/` | One suite per module, plus `fixtures.test.ts` over the manifest, the five recorded-session gates (`round-trip-cli.test.ts`, `round-trip-cli-fj02.test.ts`, `round-trip-cli-fj02b.test.ts`, `round-trip-cli-initialize.test.ts`, `round-trip-cli-archive.test.ts`) and `prior-handback.test.ts` |
| `src/__tests__/helpers/seed.ts` | Seeds a temp workbench with a deterministic evidence record and its report (and a correction on request): the report is written as a plain file and the record is created through `create` with `kind: evidence`, the kernel choosing its path. `placeEvidence` writes a pair by hand, with no check, only for the cases whose record `create` refuses. Used by the evidence and `reconcile` cases and by the FJ02 recorder, which checks its `seed/09-attach-evidence/` against it |
| `src/__tests__/helpers/session.ts` | The machinery the FJ02, FJ02b, `initialize` and archive recorders share: the wrapper spawned once per exchange over a temp copy of the session's `base` (the scratch workbench unless a session names its own, as the `initialize` and archive sessions do), the `<workbench>` substitution, a `seed/<nn>-<op>/` set copied just before its exchange, the file listing and the bytes a comparison reads, and the regeneration switch. It holds no assertion about a session; the FJ01 recorder keeps its own copy |

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
