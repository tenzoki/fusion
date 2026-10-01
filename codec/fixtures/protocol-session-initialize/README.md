# protocol-session-initialize

`initialize`, `list.result.state` and `inspect.pending` run through
`bin/fusion-record` and recorded byte for byte (the initialize plan's step 8,
as amended after step 7a; Prior's request 27, response 28 and item 33 with
the corrections of Prior `ae1ad78` `## 33`). Twenty-six exchanges, in this
order. Unlike the FJ01, FJ02 and FJ02b sessions, `<workbench>` is not one
workbench but a root R holding the targets the requests name, each directly
under R:

| Target | What it is | Where it comes from |
|---|---|---|
| `legacy/` | a v12 store: `.fusion-setup` and one package's Markdown, no `workbench.json` | `base/legacy/` |
| `file` | a regular file | `base/file` |
| `new/` | an empty directory | made by whoever replays: git keeps no empty directory |
| `pending/` | a committed `initialize` intent and nothing else | `seed/16-inspect/` |
| `crowded/` | a committed `initialize` intent beside another root entry, `notes.txt` | `seed/19-inspect/` |
| `diverged/` | a committed `initialize` intent under a `workbench.json` at neither of its bytes: a valid manifest naming another workbench | `seed/22-inspect/` |
| `nonfile/` | a committed `initialize` intent under a `workbench.json` that is a directory (holding `note.txt`, so git keeps it) | `seed/24-inspect/` |
| `unreadable/` | a committed intent whose `intent.json` is cut short | `seed/26-inspect/` |

| Files | What it is | Answer |
|---|---|---|
| `01-inspect` | `inspect` `new/` | `ok`: `state: legacy`, `id` and `manifest` null, `pending: null` |
| `02-list` | `list` `new/` | `ok`: `state: legacy`, `records: []` |
| `03-list` | `list` `legacy/` | `ok`: `state: legacy`, `records: []` |
| `04-initialize` | `initialize` `legacy/` | `conflict/target-not-empty`, the detail naming `.fusion-setup, work-packages`; `legacy/` stays byte-identical and gains no `.json-state/` |
| `05-initialize` | `initialize` `file` | `unknown-scope/workbench-missing` |
| `06-initialize` | `initialize` `new/` | `ok`: `{operation_id, id, path: "workbench.json", revision}` with `revisions`; the manifest lands |
| `07-initialize` | `06-initialize` repeated | the stored answer, byte-identical to `06-initialize.response.json` |
| `08-inspect` | `inspect` `new/`, after the replay | `ok`: `state: json-control`, 06's id and manifest, `pending: null` |
| `09-initialize` | 06's `operation_id` with another workbench `id` | `conflict/operation-id-reused` |
| `10-initialize` | `new/` under another `operation_id` | `conflict/manifest-present` |
| `11-list` | `list` `new/` | `ok`: `state: json-control`, `records: []` |
| `12-create` | `create` a package with its Markdown body in `new/` | `ok`: the first record |
| `13-initialize` | `06-initialize` repeated after 12 landed | the stored answer, byte-identical to `06-initialize.response.json` |
| `14-inspect` | `inspect` `new/`, after the replay | `ok`: `state: json-control`, `pending: null` |
| `15-list` | `list` `new/` | `ok`: `state: json-control`, the one record 12 wrote |
| `16-inspect` | `inspect` `pending/` | `ok`: `state: legacy`, `pending: {operation_id, id, blocked: false}`: no read finishes the intent (item 33) |
| `17-initialize` | `initialize` `pending/`, the request rebuilt from the target and 16's `pending` alone | the committed result: byte-identical to the `response` the seeded intent records; the manifest lands |
| `18-inspect` | `inspect` `pending/` | `ok`: `state: json-control`, `pending: null` |
| `19-inspect` | `inspect` `crowded/` | `ok`: `state: legacy`, `pending` names the intent although another entry stands |
| `20-initialize` | `initialize` `crowded/`, rebuilt from 19's `pending` | the committed result; `notes.txt` stays |
| `21-inspect` | `inspect` `crowded/` | `ok`: `state: json-control`, `pending: null` |
| `22-inspect` | `inspect` `diverged/` | `ok`: `state: json-control` (the hand's manifest reads), `pending` with `blocked: true` |
| `23-initialize` | `initialize` `diverged/`, rebuilt from 22's `pending` | `operation-unknown/recovery-blocked`; every file of `diverged/` stays, the intent stands |
| `24-inspect` | `inspect` `nonfile/` | `ok`: `state: unsupported`, diagnosis `schema-invalid/manifest-not-a-file`, `pending` with `blocked: true` |
| `25-initialize` | `initialize` `nonfile/`, rebuilt from 24's `pending` | `operation-unknown/recovery-blocked`, ahead of any `manifest-present`; every file stays |
| `26-inspect` | `inspect` `unreadable/` | `operation-unknown/pending-initialize-unreadable`, the detail naming the intent directory once: never `pending: null`; the current answer is the recording with `26-inspect.detail-delta.json` applied |

`<nn>-<op>.request.json` is exactly what was written to the wrapper's stdin,
`<nn>-<op>.response.json` exactly what it wrote to stdout: one JSON object
each, one line, a trailing newline.
`codec/src/__tests__/round-trip-cli-initialize.test.ts` runs the twenty-six
against a fresh copy of `base/` on every test run and fails when a fresh
exchange, `base/` or a seed differs from the recorded one; everything here is
regenerated only under `UPDATE_PROTOCOL_SESSION_INITIALIZE=1`, except a
response a reviewed delta moves (below), which is never rewritten. Ten do:
26, and the nine successful `inspect` answers 01, 08, 14, 16, 18, 19, 21, 22
and 24.

## The reviewed delta of 26

`26-inspect.response.json` was recorded when the detail named the intent's
directory twice (`.json-state/journal/<id>: .json-state/journal/<id>:
intent.json: syntax: …`), because `pendingInitialize` prefixed a detail of
`readIntent`'s that already began with it. The archive revision names it once.
The recording stays the historical expectation and is not edited.
`26-inspect.detail-delta.json` beside it, of the form
`fusion.session-delta/2`, carries one `replace` of the JSON pointer
`/error/detail` with the new detail, the rest of the detail unchanged; the gate
applies it to the recorded bytes and compares the fresh answer with the
result, byte for byte, and an answer one field more or one less fails it. To
replay 26 by hand, replace `error.detail` in the recorded response with the
delta's value, serialise without whitespace, and compare with that. It shares its
machinery with the FJ02 and FJ02b recorders through
`codec/src/__tests__/helpers/session.ts`, started from `base/` in place of
the scratch workbench.

## The reviewed deltas of the nine `inspect` answers

The archive revision adds the maintenance fence (request 39). Every
successful `inspect` names it after `pending`, `null` here since no exchange
sets one, and `operations.implemented` gains `maintenance` after `reconcile`.
The nine recordings stay the historical expectation and are not edited.
`<nn>-inspect.maintenance-delta.json` beside each, of the form
`fusion.session-delta/2` with no delta before it, carries exactly two `add`
changes: `/result/maintenance`, value `null`, after `pending`; and
`/result/operations/implemented/14`, value `"maintenance"`, the array's new
last element. The gate applies each to its recording and compares the fresh
answer byte for byte, and an answer one field more or one less fails it; a
case of its own holds the nine to be every successful recorded `inspect` and
each delta to be those two changes. To replay one by hand, insert
`"maintenance":null` after the `pending` member of `result` and append
`"maintenance"` to `result.operations.implemented` in the recorded response,
serialise without whitespace, and compare with that.

The recorder also asserts that each request of 17, 20, 23 and 25, rebuilt
from nothing but the target and the preceding `inspect`'s `pending`
(`operation_id` and `id`), equals the request its intent was cut from. It
asserts too that 23 and 25 leave their target byte-identical, the one
exception being `.json-state/.gitignore`: the lock's self-ignore, which taking
the lock writes and which no seed can carry, since a `*` ignore file would
hide the seed from git.

## The first substitution: `<workbench>`

R is a temp directory, so its absolute path is recorded as the literal
`<workbench>`, and a target as `<workbench>/new`. It stands in the
`workbench` field of every request, and in every answer that echoes the
target: `inspect` and `list` name it, and so do the details of
`target-not-empty`, `workbench-missing`, `manifest-present` and
`pending-initialize-unreadable`.

## The seeds, and the second substitution: `<request-digest:<nn>-<op>>`

No operation of the protocol leaves a committed intent standing, so every
intent is a seed. Each readable one was produced by cutting the very request
the `initialize` exchange after it sends (17's for `pending/`, 20's for
`crowded/`, 23's for `diverged/`, 25's for `nonfile/`) after its commit
point, in process, with a fixed clock (`created_at`
`2026-09-30T18:00:00.000Z`); only `.json-state/journal/` is kept. Beside the
intent the seed holds the target's other entries: `crowded/notes.txt`,
`diverged/workbench.json`, `nonfile/workbench.json/note.txt`. The unreadable
intent is written by hand and carries no digest.

**The rule a replayer adopts.** An intent records the digest of its request,
and an `initialize` request names its target by absolute path, so that one
field depends on R. Each readable seeded `intent.json` therefore carries
`"request_digest": "<request-digest:<nn>-initialize>"`, naming the exchange
that sends the intent's request. After copying the seed, replace the
placeholder with `sha256:` followed by the lowercase hex SHA-256 of the
canonical rendering of that exchange's request as it is sent on R: keys
sorted, no whitespace, each value as `JSON.stringify` writes it. Every
`initialize` request of this session is recorded in sorted key order, so that
rendering is the request line of `<nn>-initialize.request.json`, with
`<workbench>` replaced by R, without its trailing newline. With any other
digest, 17 and 20 answer `conflict/operation-id-reused` instead of the
committed result, and 23 and 25 answer the same instead of
`recovery-blocked`: the kernel compares a blocked intent's digest with the
request under its own operation id first.

| Directory | Copy before | Placeholder |
|---|---|---|
| `seed/16-inspect/` | `16-inspect` | `<request-digest:17-initialize>` |
| `seed/19-inspect/` | `19-inspect` | `<request-digest:20-initialize>` |
| `seed/22-inspect/` | `22-inspect` | `<request-digest:23-initialize>` |
| `seed/24-inspect/` | `24-inspect` | `<request-digest:25-initialize>` |
| `seed/26-inspect/` | `26-inspect` | none |

## Replaying

1. Make a directory of your own, R, absolute. Copy `base/` into it
   (`cp -R base/. R/`) and make `R/new/`, empty.
2. For each exchange in order: when a `seed/<nn>-<op>/` directory exists for
   it, copy its contents onto R first (`cp -R seed/<nn>-<op>/. R/`) and
   replace the digest placeholder as above. Then replace `<workbench>` in the
   request with R (as a JSON string value; a POSIX path needs no escaping
   unless it holds `"` or `\`) and write the bytes to the process's stdin:
   `bin/fusion-record < request`, or `node codec/dist/fusion-record.js <
   request` from an installed fusion copy.
3. Read stdout, replace R with `<workbench>`, and compare with the recorded
   response, byte for byte; for 26 and the nine successful `inspect`
   answers, with the recorded response plus its delta above. Exit is 0 for
   all twenty-six.

Order matters: 07 and 13 are 06's replay out of
`R/new/.json-state/ops/<operation_id>.json`, 09 is refused against that same
answer, 10 finds the manifest 06 wrote, and each seeded intent is landed or
refused by the exchange after its `inspect`. Start from a fresh R for the
recorded sequence.

Nothing in the twenty-six depends on the clock, the host or a generated id:
the record ids, the workbench ids, the operation ids and the intents'
`created_at` are fixed literals, every revision is `sha256:` over
deterministic bytes, and no answer carries a lock's host, PID or nonce. The
same bytes come back on any machine with the same
`codec/dist/fusion-record.js`.
