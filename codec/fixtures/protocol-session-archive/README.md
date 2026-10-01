# protocol-session-archive

The archive revision run through `bin/fusion-record` and recorded byte for
byte (the archive revision plan's step 9): `archive/` outside the current
record store (Prior `b912302` `## 36`), the refusal of a transition field
foreign to the record's kind (`## 37`), the maintenance fence (request 39),
the complete binding enumeration in `reconcile` (request 40), and `inspect`
over a journal that is a file. Fifty-one exchanges over a fresh copy of
`base/`, in this order. The states between exchanges are built by the host,
as the recorder moves, copies and links files; the codec moves no file.

## The workbench

`base/` is one workbench under JSON control, workbench id
`a4c1be00-0000-4000-8000-000000000000`, with fifteen control files:

| Name | Control file | What it is |
|---|---|---|
| A | `shared/issues/260920-1000-chain-head-open.record.json` | a live issue naming B by id |
| B | `shared/issues/260919-1000-chain-middle.record.json` | closed, naming C by id |
| C | `shared/issues/260918-1000-chain-tail-legacy.record.json` | closed, `legacy-terminal`, its `provenance.backup` under `archive/migrations/migration-20260918-session/` |
| T | `shared/issues/260917-1000-terminal-issue.record.json` | closed, archived in this session |
| I | `shared/issues/260921-1000-incoming-reference.record.json` | closed, naming T by id |
| F | `shared/issues/260916-1000-failed-move-unit.record.json` | closed, named by nothing: the unit of failed moves 1 and 2 |
| L | `shared/plans/260922-1000-open-plan.record.json` | an open plan |
| X | `shared/decisions/260922-1100-open-decision.record.json` | an open decision |
| Y | `shared/discussions/260922-1200-open-discussion.record.json` | an open discussion |
| P | `work-packages/260922-0900-open-package/package.json` | an open package |
| D | `work-packages/260915-0900-done-package/package.json` | a done package bound to E; inside its container a closed issue and its evidence group: the report R `reviews/260915-1500-review.md` and the evidence record E beside it |
| D2 | `work-packages/260914-0900-second-done-package/package.json` | a second done package with its own evidence group, R2 and E2: the unit of failed move 3 |

Every record has its narrative beside it; C's backup is the one file under
`archive/` in `base/`. H, `shared/issues/261001-1000-created-then-archived`,
is created by exchange 04.

## The exchanges

| Files | What it is | Answer |
|---|---|---|
| `01-inspect` | `inspect` | `ok`: `json-control`, `pending: null`, `maintenance: null` |
| `02-validate` | `validate`, unscoped | `ok`: fifteen checked, `valid: true` |
| `03-reconcile` | `reconcile`, unscoped | `ok`: every binding the remaining records make, resolved: C's backup, B to C, A to B (the chain), I to T, D2 and D to their evidence (`/evidence/0/ref`, `/outcome/evidence/0/ref`) and each evidence record to its report (`/report`); four fresh evidence bindings |
| `04-create` | `create` H with its narrative | `ok` |
| `05-transition` | H `open` to `closed` | `ok` |
| `06-transition` | P to `paused`, the payload carrying `disposition` | `schema-invalid/payload-field-not-admitted` |
| `07-transition` | A to `in_progress`, carrying `claim: null` | the same: a present `null` included |
| `08-transition` | L to `in_progress`, carrying `answer_ref` | the same |
| `09-transition` | X to `answered`, carrying `steps` | the same |
| `10-transition` | Y to `closed`, carrying `outcome: null` | the same: a discussion admits no field; 06 to 10 write nothing and store nothing |
| `11-maintenance` | `begin`, over the seeded intent on L with L diverged | `operation-unknown/recovery-blocked`, naming the intent and L; no fence |
| `12-maintenance` | 11's request again, after L was restored | `ok`: the intent rolls forward first (L lands at its post-bytes), then the fence is set |
| `13-inspect` | `inspect` | `ok`: `maintenance` names 12's fence |
| `14-transition` | the request the seeded intent was cut from | the intent's stored answer, under the fence: the replay lookup comes before the fence |
| `15-transition` | A to `in_progress`, a fresh request | `conflict/maintenance-active`, the detail naming 12's fence |
| `16-validate` | `validate`, after the sweep below | `ok`: eleven checked, `valid: true` |
| `17-reconcile` | `reconcile` | `ok`: I to T `unresolved-reference/record-not-found`; A to B resolved to the current B, its older copy under `archive/` no second carrier; C's backup still resolved; no entry for T, H, D or anything inside D |
| `18-list` | `list`, unscoped | `ok`: the eleven current records, nothing under `archive/` |
| `19-list` | `list`, scope `archive` | `unknown-scope/archived-path` |
| `20-reconcile` | `reconcile`, scope `archive/261001-1200-sweep/work-packages` | `unknown-scope/archived-path` |
| `21-show` | `show` T's archived path | `unresolved-reference/record-not-found` |
| `22-validate` | `validate` D's archived `package.json` | `ok`: one finding, `unresolved-reference/record-not-found` |
| `23-show` | `show` T through the link, `shared/old/260917-1000-terminal-issue.record.json` | `unresolved-reference/record-not-found` |
| `24-list` | `list`, scope `shared/old` | `unknown-scope/archived-path` |
| `25-create` | 04 repeated | 04's bytes; neither of H's files is recreated |
| `26-maintenance` | `end` naming 12's fence | `ok`, `since` 12's |
| `27-inspect` | `inspect` | `ok`: `maintenance: null` |
| `28-transition` | T's archived path to `closed` | `unresolved-reference/record-not-found` |
| `29-create` | `create` an issue into D's archived container | `unknown-scope/archived-path` |
| `30-maintenance` to `36-validate` | failed move 1: `begin`; F's control file moved without its narrative; `inspect`; `validate`; `reconcile`; A to `in_progress`; F restored; `end`; `validate` | the fence named; `validate` `valid: true` with ten checked, and `reconcile` names nothing: neither sees a narrative left behind; `maintenance-active`; `end` `ok`; eleven checked, `valid: true` |
| `37-maintenance` to `43-validate` | failed move 2: the same, F's narrative moved without its control file | as above, except that `validate` and `reconcile`'s `records` both name F `unresolved-reference/narrative-missing` |
| `44-maintenance` to `50-validate` | failed move 3: the same, D2's `package.json` and narrative moved, its evidence group left behind | as failed move 1: `validate` `valid: true` with ten checked, E2 among them; `reconcile` has E2's `/report` resolved and nothing else of D2, `evidence: []`; neither sees an evidence group without its package |
| `51-inspect` | `inspect`, `.json-state/journal` a file | `operation-unknown/pending-initialize-unreadable`, the detail naming `.json-state/journal` and `ENOTDIR` |

`<nn>-<op>.request.json` is exactly what was written to the wrapper's stdin,
`<nn>-<op>.response.json` exactly what it wrote to stdout after the
substitutions below: one JSON object each, one line, a trailing newline.
`codec/src/__tests__/round-trip-cli-archive.test.ts` runs the fifty-one
against a fresh copy of `base/` on every test run and fails when a fresh
exchange, `base/` or a seed differs from the recorded one; everything here is
regenerated only under `UPDATE_PROTOCOL_SESSION_ARCHIVE=1`. It shares its
machinery with the FJ02, FJ02b and `initialize` recorders through
`codec/src/__tests__/helpers/session.ts`.

**Two of the failed moves are invisible to the codec, measured.** A control
file moved away leaves its narrative as a Markdown file no control file names,
and `validate` and `reconcile` read control files only. An evidence record
names no package (`## 36`: "Do not invent an evidence-to-package ID edge"),
so one left behind its package is a valid record whose report resolves. Only
failed move 2 is a finding. A host learns that the other two are incomplete
from its own inventory: pair completeness and the moved files' hashes, which
`## 36` lists beside `validate` and `reconcile`.

## The host's actions

Immediately before the exchange named, every path relative to the workbench
root; a move makes its destination's directory first.

| Before | Action |
|---|---|
| `16-validate` | move T's pair, H's pair and the directory `work-packages/260915-0900-done-package/` to the same paths under `archive/261001-1200-sweep/`; copy B's control file to the same path under `archive/260925-0900-sweep/`; make `shared/old` a symbolic link to `../archive/261001-1200-sweep/shared/issues` |
| `31-inspect` | move F's control file to the same path under `archive/261001-1300-failed/` |
| `35-maintenance` | move it back |
| `38-inspect` | move F's narrative to the same path under `archive/261001-1300-failed/` |
| `42-maintenance` | move it back |
| `45-inspect` | move D2's `package.json` and narrative to the same paths under `archive/261001-1300-failed/`, leaving `reviews/` where it is |
| `49-maintenance` | move both back |
| `51-inspect` | remove the directory `.json-state/journal` and write a file there, `The journal is a file here, not a directory.` and a newline |

The link and the older copy of B stay to the end.

## The substitutions

**`<workbench>`.** The workbench is a temp directory, so its absolute path is
recorded as the literal `<workbench>`, as in every session. It stands in the
`workbench` field of every request and in every answer that echoes the root:
`inspect`, `list`, `validate` and `reconcile` name it, and so does every
`archived-path` and `record-not-found` detail of the boundary.

**`<request-digest:14-transition>`.** No operation of the protocol leaves a
committed intent standing, so the one this session needs is a seed:
`seed/11-maintenance/` holds the intent of exchange 14's request (L `open` to
`in_progress`), cut in process after its commit point with a fixed clock
(`created_at` `2026-10-01T11:00:00.000Z`), the journal directory alone, and L
as a hand left it, its bytes followed by one newline, at neither the intent's
pre- nor its post-bytes. `seed/12-maintenance/` holds L at its pre-bytes, the
restore. The intent records the digest of its request, and the request names
the workbench by absolute path, so the seed carries the placeholder in that
one field. This is the `initialize` session's rule: after copying the seed,
replace the placeholder with `sha256:` followed by the lowercase hex SHA-256 of
exchange 14's request line, with `<workbench>` replaced by the root, without
its trailing newline. The request is recorded in sorted key order, so that line
is its canonical rendering. With any other digest, 12 still lands the intent
and sets the fence, but 14 answers `conflict/operation-id-reused` instead of
the stored answer.

| Directory | Copy before | Placeholder |
|---|---|---|
| `seed/11-maintenance/` | `11-maintenance` | `<request-digest:14-transition>` |
| `seed/12-maintenance/` | `12-maintenance` | none |

**`<since:<nn>-maintenance>`.** A fence's `since` is the clock when its
`begin` lands, and the wrapper passes the codec no clock, so it is the one
value of this session a replay cannot fix. Each landed `begin` (12, 30, 37 and
44) answers it. The recording writes it as `<since:<nn>-maintenance>`, naming
that `begin`, wherever it stands: the `begin` answer, the `inspect` answers
under the fence, a `maintenance-active` detail and the `end` answer, which
answers its `begin`'s `since`. A replayer reads the value from the fresh
`begin` answer and substitutes it the same way. The gate holds each value to be
an RFC 3339 timestamp of the run, the four distinct.

## Replaying

1. Make a directory of your own, the root, absolute. Copy `base/` into it
   (`cp -R base/. <root>/`).
2. For each exchange in order: first the host's actions above, when the table
   names the exchange; then, when a `seed/<nn>-<op>/` directory exists for it,
   copy its contents onto the root (`cp -R seed/<nn>-<op>/. <root>/`) and
   replace the digest placeholder as above. Then replace `<workbench>` in the
   request with the root (as a JSON string value; a POSIX path needs no
   escaping unless it holds `"` or `\`) and write the bytes to the process's
   stdin: `bin/fusion-record < request`, or `node codec/dist/fusion-record.js
   < request` from an installed fusion copy.
3. Read stdout. When the exchange is a `begin` that answered `ok`, note its
   `result.since`. Replace the root with `<workbench>` and every noted `since`
   with its placeholder, and compare with the recorded response, byte for byte.
   Exit is 0 for all fifty-one.

Order matters: the host's moves set up 16 to 29 and the failed moves, 12 lands
the intent 11 found blocked, 14 replays what 12 landed, and 25 replays what 04
answered. Start from a fresh root for the recorded sequence.

Nothing else depends on the clock, the host or a generated id: the record ids,
the workbench id and the operation ids are fixed literals, every revision is
`sha256:` over deterministic bytes, and no answer carries a lock's host, PID or
nonce. The same bytes come back on any machine with the same
`codec/dist/fusion-record.js`.
