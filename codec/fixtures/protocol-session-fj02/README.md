# protocol-session-fj02

The operations FJ02 answers, run through `bin/fusion-record` and recorded byte
for byte (FJ02 step 9). Fifteen exchanges over a fresh copy of
`codec/fixtures/workbench/`, in this order. P is the new package
`work-packages/260929-0900-fj02-session/package.json`, L its plan record
`work-packages/260929-0900-fj02-session/plans/260929-0930-fj02-session-plan.record.json`.

| Files | What it is | Answer |
|---|---|---|
| `01-create` | `create` P with its Markdown body (`narrative.content`) | `ok`: both halves written in one operation, P's revision and the narrative's hash |
| `02-claim` | `claim` P under the revision 01 returned | `ok`, `open → claimed` |
| `03-release` | `release` P | `ok`, `claimed → open`; the revision is 01's again, since the record's bytes are |
| `04-claim` | `claim` P again, under a later `claimed_at` | `ok`, `open → claimed` |
| `05-set-mode` | `set-mode` P `autonomous`, the source a `user-word` artefact reference to the memo seeded before 05 | `ok`, the mode as sent |
| `06-create` | `create` L with its body, into P's container, origin P | `ok`, L's revision and the narrative's hash |
| `07-adopt-plan` | `adopt-plan` L on P at the hash of L's narrative | `ok`: P and L written in one operation (L's `acceptance` now names P) |
| `08-set-dependencies` | `set-dependencies` on the scratch open package `260928-1200-parser-fix`: it depends on P, condition `succeeded` | `ok`, the list as stored |
| `09-attach-evidence` | `attach-evidence` on P: the evidence record seeded before 09, at the revision of its stored bytes | `ok`, the binding and the evidence file's path |
| `10-transition` | `transition` L to `in_progress` | `ok`, `open → in_progress` |
| `11-transition` | `transition` P to `done`, the outcome binding the evidence of 09 | `ok`, `claimed → done` |
| `12-create` | `01-create` repeated, same `operation_id` and payload | the stored answer: byte-identical to `01-create.response.json` |
| `13-create` | `01-create`'s `operation_id` with another body | `conflict/operation-id-reused`, nothing written |
| `14-show` | `show` the shared issue, after the pending intent seeded before 14 | `ok`: the read found the intent, recovered it, and shows the issue `in_progress` |
| `15-reconcile` | `reconcile` the whole workbench | `ok`: no pending intent, no record finding, and the deviations the scratch workbench carries on purpose (below) |

`<nn>-<op>.request.json` is exactly what was written to the wrapper's stdin,
`<nn>-<op>.response.json` exactly what it wrote to stdout: one JSON object
each, one line, a trailing newline. `codec/src/__tests__/round-trip-cli-fj02.test.ts`
runs the fifteen against a fresh copy of the scratch workbench on every test
run and fails when a fresh exchange, or a seed file, differs from the recorded
one; the files are regenerated only under `UPDATE_PROTOCOL_SESSION_FJ02=1`,
except `15-reconcile.response.json`, which is never regenerated (below).

## The one substitution: `<workbench>`

As in `fixtures/protocol-session/`: the workbench is a temp directory, so its
absolute path is recorded as the literal `<workbench>`. It stands in the
`workbench` field of every request and of the `reconcile` answer, the only one
of the fifteen answers that echoes the root.

## The seed files: `seed/<nn>-<op>/`

Three exchanges need a file that no operation of the protocol writes. Each
such set sits under `seed/<nn>-<op>/`, laid out exactly as the workbench is,
and is copied onto the workbench root, byte for byte and path for path,
**immediately before** exchange `<nn>` and not earlier:

| Directory | Copy before | What it holds |
|---|---|---|
| `seed/05-set-mode/` | `05-set-mode` | `shared/memos/260929-0905-fj02-autonomy.md`, the user's word the mode cites; a plain file |
| `seed/09-attach-evidence/` | `09-attach-evidence` | the evidence record `work-packages/260929-0900-fj02-session/reviews/260929-1200-review.evidence.json` and its report `260929-1200-review.md` beside it; no FJ02 operation writes an evidence record (Prior's request 19 asks how a reviewer will), so the pair arrives as files |
| `seed/14-show/` | `14-show` | one pending intent: the directory `.json-state/journal/f02000ff-0000-4000-8000-0000000000ff/` with its `intent.json` and the one staged file, named by the hex of its hash |

The timing matters most for the intent: copied earlier, the next mutation
would recover it first, and the exchanges between would answer against a
workbench the recording never saw. The evidence record's bytes are what a
reviewer would write at its point in the sequence: `brief_revision` the hash
of P's narrative, `plan_revision` the revision of the plan 07 adopted. The
intent is in the journal's own format (a
directory, committed; never a single file): it records the scratch issue's
move `open → in_progress`, its `before` is the hash of the issue as
`codec/fixtures/workbench/` holds it (no earlier exchange touches the issue),
its `after` the hash of the staged bytes, its `response` what the codec
answers for that transition, and its `created_at` a fixed literal. The test
builds it from a real transition on a fresh scratch copy and fails if the
committed seed differs; the evidence pair likewise against
`src/__tests__/helpers/seed.ts` run on a copy of the workbench as it stands
before 09.

`.json-state/` needs no `.gitignore` of its own in the seed: by 14 the codec
has written one at its first lock.

## What `15-reconcile` shows

The report lists what the scratch workbench carries on purpose, not a
defect of the session: the `done` package `260927-0900-strict-reader` binds a
plan and an evidence record that exist nowhere in it (three `references`
unresolved, two `evidence` entries stale), and the narrative of the open
package `260928-1200-parser-fix` carries a `**Status:** open` head line
(`narratives`, `conflict/status-copy-in-narrative`). Everything the session
wrote resolves; the dependency of 08 is `satisfied` because P ended `done` with
outcome `completed`; `checked` is 6 (the three scratch pairs, P, L and the
evidence record).

## The one reviewed delta: `15-reconcile.role-delta.json`

`15-reconcile.response.json` is the answer as recorded before `reconcile`
reported the role of each active-document binding. The current codec adds
`"role":"plan"` right after `at` to exactly two of its ten reference entries,
the two at `/active_documents/0/ref`: the unresolved plan binding of
`260927-0900-strict-reader` (it names a record the scratch workbench does not
hold) and the resolved one of P (the plan 07 adopted). Both stored bindings
are `role: plan`. The role is copied from the binding and never inferred from
the target, so the unresolved entry carries it too, still with no `target`.

Prior asked for the two changes of this revision to be kept apart
(`Prior: docs/design/fusion-initialize-reconcile-plan-amendment.md` at
`a15dfc8`): the `reconcile` index changed no byte of any recorded answer,
while the role changes only these reviewed fields. So the recorded file stays
the historical expectation and is not edited, and the delta file beside it
names each added field by entry (`path` and `at` within
`/result/references`), the field it follows and its value. The gate applies
exactly that delta to the recorded bytes and compares the fresh answer with
the result, byte for byte; an answer with one field more or one less fails
it. The update variable rewrites every other recorded file but never this
response: a later change to the answer is a reviewed change to the delta
file, and Prior compares it at the re-pin.

To replay 15 by hand, apply the delta to the recorded response (insert each
field after the one it names, in the one entry its `path` and `at` pick out,
and serialise without whitespace) and compare with that.

## Replaying

1. Copy `codec/fixtures/workbench/` to a directory of your own, W, absolute.
2. For each exchange in order: when a `seed/<nn>-<op>/` directory exists for
   it, copy its contents onto W first (`cp -R seed/<nn>-<op>/. W/`); then
   replace `<workbench>` in the request with W (as a JSON string value; W needs
   no escaping on a POSIX path) and write the bytes to the process's stdin:
   `bin/fusion-record < request`, or `node codec/dist/fusion-record.js <
   request` from an installed fusion copy.
3. Read stdout, replace W with `<workbench>`, and compare with the recorded
   response, byte for byte; for 15, with the recorded response plus the delta
   above. Exit is 0 for all fifteen.

Order matters: every mutation names the revision the exchange before it left;
12 is 01's replay out of `W/.json-state/ops/<operation_id>.json` and 13 is
refused against that same answer; 14's read recovers the intent copied just
before it. Start from a fresh copy for the recorded sequence.

Nothing in the fifteen depends on the clock, the host or a generated id: the
record ids, the operation ids, the claim times and the intent's `created_at`
are fixed literals, every revision is `sha256:` over deterministic bytes, and
no answer carries a lock's host, PID or nonce. The same bytes come back on any
machine with the same `codec/dist/fusion-record.js`.
