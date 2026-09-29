# protocol-session-fj02b

The two kernel extensions of FJ02b, run through `bin/fusion-record` and
recorded byte for byte (FJ02b step 5): plan progress through `transition`
(Prior's FJ02 response 18) and `create` of an evidence record (response 19).
Twenty exchanges over a fresh copy of `codec/fixtures/workbench/`, in this
order. P is the new package
`work-packages/260929-1500-fj02b-session/package.json`, L its plan record
`work-packages/260929-1500-fj02b-session/plans/260929-1510-fj02b-session-plan.record.json`,
R the report
`work-packages/260929-1500-fj02b-session/reviews/260929-1600-fj02b-session-review.md`,
and E1 to E6 the evidence records the session sends, all naming R.

| Files | What it is | Answer |
|---|---|---|
| `01-create` | `create` P with its Markdown body | `ok`, P's revision and the narrative's hash |
| `02-create` | `create` L with its body, into P's container, with steps `s1`, `s2`, `s3` (each `open`) and criteria `c1`, `c2` (each `null`) | `ok`, L's revision and the narrative's hash |
| `03-transition` | `transition` L to `in_progress`, the payload moving `s1` to `in_progress` | `ok`, `open → in_progress`: the state change and the progress land in one operation |
| `04-transition` | `transition` L to `in_progress`, the state it already has, the payload moving `s1` to `done`, `s2` to `in_progress` and `c1` to `true` | `ok`, `in_progress → in_progress`, a new revision |
| `05-transition` | `04-transition` repeated, same `operation_id` and payload | the stored answer: byte-identical to `04-transition.response.json` |
| `06-show` | `show` L | `ok`: `s1` `done`, `s2` `in_progress`, `s3` still `open`, `c1` `true`, `c2` still `null`, in the stored order, at the revision 04 returned |
| `07-transition` | progress only (`s3` to `in_progress`) against the revision 03 returned, which L has left | `conflict/revision-mismatch`, nothing written |
| `08-transition` | progress only, `s1` back to `open` | `conflict/transition-refused`, the detail naming step `s1` and the missing edge `done -> open` |
| `09-transition` | progress only, the payload naming `s2` twice | `schema-invalid/duplicate-step-id` |
| `10-transition` | progress only, the payload naming `s9`, which L lacks | `unresolved-reference/unknown-step-id` |
| `11-create` | `create` of `kind: evidence`, E1 for P over R, which is seeded before 11; `predecessor: null` | `ok`: the first-record path `260929-1600-fj02b-session-review.evidence.json` beside R, the record's revision, R's path and hash |
| `12-create` | `create` E2, a correction naming E1 as predecessor at the revision 11 returned, over the unchanged R | `ok`: the path `260929-1600-fj02b-session-review.2.evidence.json` |
| `13-create` | `create` E3, a second correction naming E1 | `ok`: the path `260929-1600-fj02b-session-review.3.evidence.json` |
| `14-create` | `12-create` repeated, same `operation_id` and payload, after 13 landed | the stored answer: byte-identical to `12-create.response.json`, so counter 2 and not 4 |
| `15-show` | `show` E1 | `ok`: E1 at the revision 11 returned, unchanged by the two corrections; `report.stored` is R's hash on disk |
| `16-create` | `create` E4 over R with `predecessor: null` | `conflict/record-exists`: a record without a predecessor meets E1's name and is never read as a correction |
| `17-create` | `create` E5 with `predecessor: null`, its `report.sha256` a hash R does not have | `missing-evidence/report-changed`, the detail naming both hashes |
| `18-transition` | `transition` L to `closed` | `ok`, `in_progress → closed`; the steps and criteria stay as 04 left them |
| `19-transition` | progress only on the closed L (`to: closed`, `s3` to `in_progress`) | `conflict/transition-refused`: a terminal plan takes no progress |
| `20-create` | `create` E6, a correction naming E1, after the seed before 20 replaced R with other bytes; the payload names R's new hash | `conflict/predecessor-report-changed`: E1 recorded R at another hash, and a changed report takes a new basename |

`<nn>-<op>.request.json` is exactly what was written to the wrapper's stdin,
`<nn>-<op>.response.json` exactly what it wrote to stdout: one JSON object
each, one line, a trailing newline.
`codec/src/__tests__/round-trip-cli-fj02b.test.ts` runs the twenty against a
fresh copy of the scratch workbench on every test run and fails when a fresh
exchange, or a seed file, differs from the recorded one; the files are
regenerated only under `UPDATE_PROTOCOL_SESSION_FJ02B=1`. It shares its
machinery with the FJ02 recorder through
`codec/src/__tests__/helpers/session.ts`.

## The one substitution: `<workbench>`

As in `codec/fixtures/protocol-session/` and
`codec/fixtures/protocol-session-fj02/`: the workbench is a temp directory, so
its absolute path is recorded as the literal `<workbench>`. It stands in the
`workbench` field of every request. No answer of the twenty echoes the root,
so no response file carries the placeholder.

## The seed files: `seed/<nn>-<op>/`

Two exchanges need a file that no operation of the protocol writes: the
report. A reviewer writes Markdown, and the kernel is the one writer of fusion
JSON, not of reports. `create` of `kind: evidence` writes the record alone,
beside a report that is already on disk at the hash the payload names. Each
set sits under `seed/<nn>-<op>/`, laid out exactly as the workbench is, and is
copied onto the workbench root, byte for byte and path for path,
**immediately before** exchange `<nn>` and not earlier:

| Directory | Copy before | What it holds |
|---|---|---|
| `seed/11-create/` | `11-create` | R as the reviewer wrote it, 119 bytes, `sha256:9c3bb53658871186f4a4e74a5da93ee88cecfa716f9672b0d03cc19ff64b9554` |
| `seed/20-create/` | `20-create` | R at the same path with other bytes, 165 bytes, `sha256:cbcdf898be49e6224bfd7298d6f679690a3f7c116497e5bb2355615ae06ab8d5`; the copy overwrites the file 11 seeded |

The timing matters for both. P's directory does not exist before 01, and R's
hash is what 11 to 17 are judged against: `seed/20-create/` copied earlier
would turn 11 to 16 into `missing-evidence/report-changed` and let 17 pass its
report check. That is why 20 is the last exchange. The hash E5 names in 17 is
the hash of the `seed/20-create/` bytes: the same payload hash is refused in 17
because R is not at it yet, and passes the report check in 20, where the
refusal is the predecessor's.

Unlike the FJ02 session, no evidence record is seeded. The three records that
land (E1, E2, E3) are written by the kernel through 11, 12 and 13, and their
bytes are the payload in the schema's property order, two-space indented, with
a trailing newline.

## What the session leaves on disk

After 20 the `reviews/` store of P holds four files: R at the
`seed/20-create/` bytes, E1 at `260929-1600-fj02b-session-review.evidence.json`,
E2 at `.2.evidence.json` and E3 at `.3.evidence.json`, each record at the
revision its `create` returned. E4, E5 and E6 were refused and wrote nothing.
L is `closed` with `s1` `done`, `s2` `in_progress`, `s3` `open`, `c1` `true`
and `c2` `null`. `.json-state/ops/` holds one stored answer per operation that
landed (01, 02, 03, 04, 11, 12, 13, 18) and none for a refusal or a read.

E1, E2 and E3 then name R at a hash R no longer has, which `validate` and
`reconcile` would report. The session ends at 20 and sends neither.

## Replaying

1. Copy `codec/fixtures/workbench/` to a directory of your own, W, absolute.
2. For each exchange in order: when a `seed/<nn>-<op>/` directory exists for
   it, copy its contents onto W first (`cp -R seed/<nn>-<op>/. W/`); then
   replace `<workbench>` in the request with W (as a JSON string value; W needs
   no escaping on a POSIX path) and write the bytes to the process's stdin:
   `bin/fusion-record < request`, or `node codec/dist/fusion-record.js <
   request` from an installed fusion copy.
3. Read stdout, replace W with `<workbench>` (a replacement that finds nothing
   in this session), and compare with the recorded response, byte for byte.
   Exit is 0 for all twenty.

Order matters: every mutation names the revision the exchange before it left;
05 is 04's replay and 14 is 12's, each out of
`W/.json-state/ops/<operation_id>.json`; 12, 13 and 20 name E1 at the revision
11 returned; the counter 13 receives is read from the directory as 12 left
it. Start from a fresh copy for the recorded sequence.

Nothing in the twenty depends on the clock, the host or a generated id: the
record ids, the operation ids and every `accepted_at` are fixed literals, every
revision is `sha256:` over deterministic bytes, and no answer carries a lock's
host, PID or nonce. The same bytes come back on any machine with the same
`codec/dist/fusion-record.js`.
