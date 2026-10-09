# protocol-session-takeover

The administrative takeover of a standing claim run through
`bin/fusion-record` and recorded byte for byte (FJ05 plan step 6): request
62 of `codec/fixtures/prior/REQUESTS.md`, as Prior's answer to 62 corrects
it. `claim` carrying `takeover: {previous_claim, source}` replaces the claim
of a claimed package and appends one entry to `provenance.claim_transfers`.
Thirty-seven exchanges over a fresh copy of `base/`, in this order. Nothing
is seeded and the host moves no file between exchanges.

## The workbench

`base/` is one workbench under JSON control, workbench id
`7a6e0000-0000-4000-8000-000000000000`, with thirteen control files:

| Name | Control file | What it is |
|---|---|---|
| P | `work-packages/260928-0900-taken-over-once/package.json` | claimed by `deadbeef`, a checkout that is gone |
| Q | `work-packages/260928-1000-taken-over-twice/package.json` | claimed by `aaaa0001` (A) |
| U | `work-packages/260928-1100-released-between-takeovers/package.json` | claimed by A |
| N | `work-packages/260918-0900-imported-claim/package.json` | imported, its claim `deadbeef` with `person` and `claimed_at` null; its `provenance.backup` under `archive/migrations/migration-20260918-session/` |
| O | `work-packages/260928-1200-open-package/package.json` | open |
| Z | `work-packages/260928-1300-paused-package/package.json` | paused |
| T | `work-packages/260920-0900-dropped-package/package.json` | dropped |
| I | `shared/issues/260928-1400-an-issue.record.json` | an open issue |
| X1 to X5 | `<package>/decisions/261009-<hhmm>-may-<new>-take-over-<package>-from-<previous>.record.json` | five open decision records, each narrative holding the user's word for one transfer verbatim: X1 in P, X2 and X3 in Q, X4 in U, X5 in N |

`<U>/memos/261009-1620-take-over-u-from-c.md`, M, holds the user's word for
U's second transfer, cited as an artefact. The checkouts are `deadbeef` (gone),
`aaaa0001` (A), `bbbb0002` (B), `cccc0003` (C) and `dddd0004` (D); every
claim names `Kai Stalmann <ks@qantr.com>` except N's imported one.

## The exchanges

Prior's case numbers are those of the addendum's part 9.

| Files | What it is | Answer |
|---|---|---|
| `01-inspect` | `inspect` | `ok`: `json-control` |
| `02-validate` | `validate`, unscoped | `ok`: thirteen checked, `valid: true` |
| `03-reconcile` | `reconcile`, unscoped | `ok`: no transfer site |
| `04-claim` | P from `deadbeef` to B, the user's word in X1 | `ok`: `from` and `to` `claimed`, `previous_checkout_id` `deadbeef`, `checkout_id` `bbbb0002`; P carries B's claim and one entry |
| `05-claim` | 04 again | 04's bytes (case 5) |
| `06-claim` | 04's id, the source a bare record | `conflict/operation-id-reused` (case 5) |
| `07-claim` | 04's takeover under a fresh id, at the revision 04 inspected | `conflict/revision-mismatch` (case 5) |
| `08-claim` | 07 at P's current revision | `conflict/takeover-holder-mismatch` (case 5); 05 to 08 write nothing |
| `09-claim` | Q, `previous_claim` A at another `claimed_at` | `conflict/takeover-holder-mismatch` (case 2) |
| `10-claim` | Q, `previous_claim` another checkout | `conflict/takeover-holder-mismatch` (case 2) |
| `11-claim` | Q, the user's word in a record that is not there | `unresolved-reference/record-not-found` (case 1, evidence validation) |
| `12-claim` | Q, the user's word in a record of another workbench | `unresolved-reference/foreign-workbench` (case 1) |
| `13-claim` | Q, the user's word in M at another hash | `missing-evidence/artefact-changed` (case 1) |
| `14-claim` | Q, `takeover` without `source` | `schema-invalid/request` (case 4) |
| `15-claim` | Q, `source: null` | `schema-invalid/request` (case 4) |
| `16-claim` | Q at a revision that never was | `conflict/revision-mismatch` (case 3); Q stands at its base bytes through 09 to 16 |
| `17-release` | P by B | `ok`: `claimed` to `open` (case 6) |
| `18-show` | P | `ok`: `open`, `claim: null`, the entry 04 wrote unchanged (case 6) |
| `19-claim` | 04 again, after P moved on | 04's bytes (case 5) |
| `20-claim` | Q from A to B, the user's word in X2 | `ok` (case 7) |
| `21-claim` | Q from B to C, X3 as a bare record | `ok`: Q's second entry, its `previous_claim` B's claim (case 7) |
| `22-claim` | U from A to B, the user's word in X4 | `ok` (case 7) |
| `23-release` | U by B | `ok` |
| `24-claim` | U, an ordinary claim by C | `ok`: the claim answer, no entry appended |
| `25-claim` | U from C to D, the user's word in M | `ok`: U's second entry starts at C's claim, not B's (case 7) |
| `26-transition` | Q to `claimed`, payload `claim` D | `conflict/transition-refused` (case 8) |
| `27-transition` | the same, the payload carrying `takeover` too | `schema-invalid/request` (case 8) |
| `28-claim` | Q, `claim` D without `takeover` | `conflict/already-claimed` (case 8) |
| `29-claim` | a takeover of O | `conflict/takeover-not-claimed` |
| `30-claim` | a takeover of Z | `conflict/takeover-not-claimed` |
| `31-claim` | a takeover of T | `conflict/package-terminal` |
| `32-claim` | a takeover of I | `schema-invalid/not-a-package` |
| `33-claim` | Q from C to C | `schema-invalid/takeover-same-checkout` |
| `34-claim` | Q from C to D, `claimed_at` null | `schema-invalid/claimed-at-required`; 26 to 34 write nothing |
| `35-claim` | N from its imported claim, named as stored with both nulls, to B; the user's word in X5 | `ok` |
| `36-reconcile` | `reconcile`, unscoped | `ok`: six transfer sites, each `resolved`: `/provenance/claim_transfers/<i>/source/ref` for the user's word, `/provenance/claim_transfers/<i>/source` for Q's bare record |
| `37-validate` | `validate`, unscoped | `ok`: thirteen checked, `valid: true` |

`<nn>-<op>.request.json` is exactly what was written to the wrapper's stdin,
`<nn>-<op>.response.json` exactly what it wrote to stdout with the workbench
root replaced: one JSON object each, one line, a trailing newline.
`codec/src/__tests__/round-trip-cli-takeover.test.ts` runs the thirty-seven
against a fresh copy of `base/` on every test run and fails when a fresh
exchange or `base/` differs from the recorded one; everything here is
regenerated only under `UPDATE_PROTOCOL_SESSION_TAKEOVER=1`. It shares its
machinery with the other recorders through
`codec/src/__tests__/helpers/session.ts`.

Case 1 is evidence validation. A source that resolves is evidence of the
user's consent, not an authorisation, and the codec decides no authority.
`transferred_at` in every entry is the new claim's `claimed_at`, the time the
request carries; it is no commit time, and 05 and 19 replay the stored
answer without refreshing it.

The same file then runs the bundle Prior qualified before the takeover,
`sha256:c76bbce9…`, extracted from git by its blob, over a copy of the
workbench exchange 37 leaves. That bundle answers `validate`, `release` and
`transition` of a transferred package `schema-invalid` and refuses a takeover
request by its protocol, and it rewrites no byte of the tree. Its `show`,
which reads a pair without a schema, answers the record as stored, with its
history whole. That is the old reader at the version boundary, not part of
this recording.

## The substitution

**`<workbench>`.** The workbench is a temp directory, so its absolute path is
recorded as the literal `<workbench>`, as in every session. It stands in the
`workbench` field of every request and in every answer that echoes the root:
`validate` and `reconcile` name it.

## Replaying

1. Make a directory of your own, the root, absolute. Copy `base/` into it
   (`cp -R base/. <root>/`).
2. For each exchange in order, replace `<workbench>` in the request with the
   root (as a JSON string value; a POSIX path needs no escaping unless it
   holds `"` or `\`) and write the bytes to the process's stdin:
   `bin/fusion-record < request`, or `node codec/dist/fusion-record.js <
   request` from an installed fusion copy.
3. Read stdout, replace the root with `<workbench>`, and compare with the
   recorded response, byte for byte. Exit is 0 for all thirty-seven.

Order matters: 05 to 08 and 19 replay or re-read what 04 landed, 21 takes
over what 20 landed, 23 to 25 build U's second sequence, and 26 to 34 read
Q as 21 left it. Start from a fresh root for the recorded sequence.

Nothing depends on the clock, the host or a generated id: the record ids, the
workbench id and the operation ids are fixed literals, every time is a
literal of the requests, every revision is `sha256:` over deterministic
bytes, and no answer carries a lock's host, PID or nonce. The same bytes come
back on any machine with the same `codec/dist/fusion-record.js`.
