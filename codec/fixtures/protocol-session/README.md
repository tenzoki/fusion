# protocol-session

The first record read and updated through `bin/fusion-record`, recorded byte
for byte (FJ01 step 8). Six exchanges over a fresh copy of
`codec/fixtures/workbench/`, in this order:

| Files | What it is | Answer |
|---|---|---|
| `01-show` | `show` the open package | `ok`, status `open`, its revision R0 |
| `02-transition` | `transition` to `claimed` with `expected_revision` R0, a claim, an actor, a reason, the fixed `operation_id` | `ok`, `from: open`, `to: claimed`, the new revision R1 |
| `03-show` | `show` the same package | `ok`, status `claimed`, revision R1, the claim as sent |
| `04-transition` | the same transition with `expected_revision` R0 (stale) under a second `operation_id` | `conflict/revision-mismatch`, `stored R1 expected R0` |
| `05-transition` | `02-transition` repeated, same `operation_id` and payload | the stored answer: byte-identical to `02-transition.response.json` |
| `06-validate` | `validate` the whole workbench | `ok`, `valid: true`, three pairs checked |

`0<n>-<op>.request.json` is exactly what was written to the wrapper's stdin,
`0<n>-<op>.response.json` exactly what it wrote to stdout: one JSON object
each, one line, a trailing newline. `codec/src/__tests__/round-trip-cli.test.ts`
runs the six against a fresh copy of the scratch workbench on every test run
and fails when a fresh exchange differs from a recorded one; the files are
regenerated only under `UPDATE_PROTOCOL_SESSION=1`.

## The one substitution: `<workbench>`

The workbench is a temp directory, so its absolute path is not recorded. Every
occurrence of it is the literal `<workbench>` in these files: the `workbench`
field of every request, and the `workbench` field of the `validate` answer
(the only one of the six answers that echoes the root). To replay:

1. Copy `codec/fixtures/workbench/` to a directory of your own, W, absolute.
2. For each request in order, replace `<workbench>` with W (as a JSON string
   value; W needs no escaping on a POSIX path) and write the bytes to the
   process's stdin: `bin/fusion-record < request`, or `node
   codec/dist/fusion-record.js < request` from an installed fusion copy.
3. Read stdout, replace W with `<workbench>`, and compare with the recorded
   response, byte for byte. Exit is 0 for all six.

Order matters: 02 writes the record 03 reads and 04 is refused against, and 05
is 02's replay out of `W/.json-state/ops/<operation_id>.json`. A replay on a
copy 02 already ran on answers 02 with the stored answer at once; start from a
fresh copy for the recorded sequence.

Nothing in the six depends on the clock or on a generated id: the claim's
`claimed_at` and the two `operation_id`s are fixed literals, and every
revision is `sha256:` over deterministic bytes, so the same bytes come back on
any machine with the same `codec/dist/fusion-record.js`.
