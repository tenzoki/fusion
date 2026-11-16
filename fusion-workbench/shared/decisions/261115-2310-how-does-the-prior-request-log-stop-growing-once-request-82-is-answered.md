# How does the Prior request log stop growing once request 82 is answered: freeze it, split the state into a status file, and file each new request on its own?

---
**Domain:** code
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:** `codec/fixtures/prior/REQUESTS.md`; `261114-2106-request-82-counts-ten-select-test-rows-where-2fe7baba-adds-eleven.md`; `261114-2106-the-81-question-1-section-states-select-has-three-names-at-a-commit-where-it-has-four.md`; `261114-2106-reviewer-closing-pass-over-request-82-and-the-select-fourth-name.md`; `261114-1651-what-does-request-82-say-an-accepted-answer-releases-given-that-the-tag-v13-5-0-already-exists.md`; work package `261114-1550-request-82-the-candidate-13-5-0-prepared-for-prior`

---

All measurements below were taken on 2026-11-15 in fusion's repository at HEAD `535fefe5` (`535fefe5fbbe54ded2ef04be9b5a0de29581d71e`, committed 2026-11-15 12:49 +0100), branch `main`, `git status -sb` printing `## main...origin/main` (level with its remote). The file was read with `git show HEAD:codec/fixtures/prior/REQUESTS.md`. Prior's repository was not read; what is said about Prior's pins is quoted from the log's own measured passages.

## Question

`codec/fixtures/prior/REQUESTS.md` is the append-only log of fusion's requests to the Prior side. It also carries Prior's answers, fusion's corrections, and the current state of every request. It is now large enough that each small correction costs a full passage, a new digest and a hand relay to Prior. The question is how the log stops growing without breaking anything that already points into it: the digests Prior and the bundles pin, the line numbers passages cite, and the headings code comments cite. It must be settled before request 83, because whichever structure 83 is filed under is the one the next correction follows.

### The problem, as measured

| Claim in the brief | Measured | Holds? |
|---|---|---|
| 9 063 lines, about 1.58 MB | 9 063 lines, 1 585 694 bytes, `sha256:ded3bc25…` | yes |
| 72 commits since 2026-09-28 | `git log --format=%h -- <file>` prints 72; the first is `008da4d2`, 2026-09-28 15:09. All 72 are since that date, because that is the file's creation | yes |
| Four commits since 2026-11-14 | `c8241452` (+128), `f7c6f14e` (+325), `7ff7b391` (+37), `2a164617` (+22), insertions only | yes |
| Two of them add only corrections | `7ff7b391` `### Requests 81 and 82, corrected in two statements`; `2a164617` `### Request 82, the version a correction takes`. The other two record Prior's answer to question 1 of 81 and file request 82 | yes |
| `7ff7b391` fixes ten → eleven test rows | point 1 of that passage: `2fe7baba` adds eleven rows to `TestSelectIsTheCodecsRule`, three selected and eight refused, not ten with seven refused | yes |
| `2a164617` moves the correction version 13.5.1 → next free patch | yes: 13.5.1 was released on 2026-11-15 (tag `v13.5.1` at `f428ecde`) before any answer to 82 | yes |
| Both say they change nothing Prior is asked to run or check | `7ff7b391`: "changes nothing Prior is asked to run", and "Neither statement is one Prior is asked to check in a run". `2a164617`: "changes nothing Prior is asked to run" | yes, with a limit: `2a164617` does change what follows from a "no" to question 1 of 82 (see the worked examples) |
| About 76 headings match `^#{2,4} .*(correct\|as they stand)` | 76 | yes |
| About 35 are copies of the status table | 40 headings match `as they stand`. One of them, `#### The commits and the evidence, as Prior states them and as they stand`, is not a status table. **39** are status tables, the first `### Items 26 to 30, as they stand`, the last `### Requests 64 and 67 to 82, as they stand` | count corrected: 39, not about 35 |
| The status ledger inside an append-only log is the structural cause of the growth | The 39 status sections together are 508 lines and 62 921 bytes, **4.0 %** of the file. Sections under a heading containing "correct" are about 1 153 lines and 192 050 bytes, about 12 %. The rest is request bodies and recorded answers: the largest single section, `## The re-pin to the codec of branch campaign (request 81)`, is 192 567 bytes on its own | **partly.** The embedded ledger is the structural cause of the *supersession chains*: the newest table (`### Requests 64 and 67 to 82, as they stand`) states rows 64 to 78 and 80 only by pointing back to older tables ("as in `### Requests 64 and 67 to 81, as they stand` above"), so reading one request's state means following up to three tables. It is not the main cause of the byte growth. That is the measured prose of each request, and it is per request, which matters for option 3 below |
| Every passage moves the sha256, so commit and digest are relayed by hand | the last paragraph of both correction passages: "This passage changes the file again and so cannot state its own digest. The commit that carries it, and the file's `shasum -a 256` at that commit, are reported to fusion's user, who names them to Prior." | yes |

## Options

1. **Freeze the log, add an in-place status file, file each new request on its own (chosen).**
   - **1a. Freeze.** Once Prior has answered request 82 and that answer is recorded, `REQUESTS.md` takes one last passage. That passage names the successor files and declares that nothing is appended after it. No existing line is edited.
   - **1b. Status file.** One file, maintained in place, that explicitly says it is not a log. It has one row per request: number, current state, the Prior commit and bundle digest it was answered on, the file that holds it, and an optional one-line note. It replaces the re-appended "as they stand" tables. It holds rows for 1 to 82 too, each pointing at the heading in the frozen log that settles it, so the chains end in one place.
   - **1c. One file per request, append-only once it is relayed to Prior** (chosen over a single new log; reasons below). Prior's answer to request N and every correction to N are appended to N's file. A passage that spans several requests goes into the file of the newest one it touches, and the status rows of the others point at it.
   - **1d. Correction rule.** A correction gets its own passage only if it changes something Prior is asked to run, check or answer, or what follows from Prior's answer. Every other correction is recorded in the workbench issue and the commit message. Where it matters, it also gets a one-line note in the status file's row for that request.
   - **1e. Notice to Prior** in a separate brief, drafted after this record.
   - Pros: nothing that already points into `REQUESTS.md` breaks (see Constraints). The state of a request is read in one row, not by chasing a chain. Each new file is bounded by its own request. A correction to request N moves only N's digest. Small fixes stop costing a passage and a relay.
   - Cons: the state now lives in two places (the status row and the request file's answer section), so they can drift. One more path for Prior to learn. The status file's digest moves on every edit, so nothing may pin it.

2. **Keep appending to `REQUESTS.md`, and only stop re-appending the status tables.**
   - Pros: no new paths; no notice to Prior.
   - Cons: removes 4 % of the growth and none of the rest. A status table in a log still needs supersession, or moves to the head, which is an in-place edit of an append-only file. Every passage still moves the one digest Prior relays.

3. **Rewrite `REQUESTS.md` in place**: compact it, drop the old status tables, keep one current table.
   - Pros: the smallest result.
   - Cons: ruled out by every constraint below. It contradicts 22 self-declarations of "append-only". It invalidates each passage's stated digest and the line numbers passages cite. The bundle's copy would diverge silently from the copy in the tree.

4. **Freeze and status file as in option 1, but new requests go to one new append-only log** (`REQUESTS-2.md` or similar) without status tables.
   - Pros: one new path instead of one per request; reading order stays chronological in one file.
   - Cons: the measurements above show the status tables are only 4 % of the bytes. Inference: a second log would therefore grow at about the same rate as the first, which reached 1.5 MB in 82 requests. Every passage in it still moves the one shared digest, so a correction to request 90 moves the digest a pin for request 85 names. The problem returns at a later request number.

### 1c: why one file per request and not a new log

- **Growth is per request, so the bound must be per request.** Over 95 % of the bytes are request bodies, answers and corrections, not status. A new single log would inherit that rate (option 4). One file per request caps each file at one request's history. Request 81 alone is 192 567 bytes.
- **A digest then names one request.** Request 82's bundle pins one file. A correction to request 83 does not move the file Prior holds for 82. The hand relay shrinks to the one file that changed.
- **Line citations stay short-lived and local.** Inside a file of a few hundred lines, a line number is checkable. In the frozen log it already needs four digits.
- **The chronology is in the status file and in git**, so a single log adds nothing a reader cannot get from those.
- Cost: an answer covering several requests has to be split or homed in one file. The rule in 1c (the newest request's file, with the other rows pointing at it) handles it. Inference from the headings, not counted: Prior's answers have mostly been per request (`### Prior's answer to 80 at 557011a`, `### Prior's answer to 79 at 10e07d2`).

### The correction rule applied to the two worked examples

| Commit | Statement corrected | Does it change what Prior is asked to run, check or answer? | Does it change what follows from Prior's answer? | Under the rule |
|---|---|---|---|---|
| `7ff7b391` point 1 | request 82, point 2 of `### Where main differs from the candidate`: ten test rows → eleven | no. The passage: "Neither statement is one Prior is asked to check in a run" | no. Bundle, digest, 82.1 to 82.4 and question 1 are unaffected | **no passage.** It is recorded in `261114-2106-request-82-counts-ten-select-test-rows-where-2fe7baba-adds-eleven.md` and in the commit message. No status note: the request's state does not change |
| `7ff7b391` point 2 | the section recording Prior's answer to question 1 of 81: `Select` has three names → four at the commit that carries it | no | no. Request 82 already stated the fact correctly | **no passage.** It is recorded in `261114-2106-the-81-question-1-section-states-select-has-three-names-at-a-commit-where-it-has-four.md` and in the commit message |
| `2a164617` | request 82, in four places: a correction or refusal is 13.5.1 → the next free patch version | no. "changes nothing Prior is asked to run" holds | **yes.** Under question 1 of 82, "On a no", request 82 tells Prior what follows a "no": 13.5.1 with its own bundle and request. That outcome is no longer possible | **a passage, read literally**, in request 82's file. On a narrower reading, under which only consequences Prior acts on count, it is a one-line note in row 82 of the status file: "a correction takes the next free patch version, not 13.5.1 (`2a164617`)". Which reading holds is open question 5 |

So the rule would have saved `7ff7b391`'s 37 lines entirely. Whether it saves `2a164617`'s 22 lines depends on how "what follows from Prior's answer" is read.

## Constraints

Each constraint that rules out rewriting the file in place was verified at `535fefe5`:

| Constraint | Measured |
|---|---|
| The file declares itself append-only | `grep -c -i 'append-only'` prints 22 (22 lines, 22 occurrences) |
| Copies are inside delivered bundles and pinned by digest | request 82's bundle `sha256:2ba70dbeba8662212ef8312801da1c8103e90bfe42cf6a1ac8e34b71352ad643` (13.5.0, tag `v13.5.0` = `60639346`) carries the tag's copy of the file, 7 997 lines, `sha256:8ece771d…`, as stated under `### REQUESTS.md's digest moved` in request 82. Request 82 is **asked** in the newest status table, so it is still open with Prior. Prior's own two pins (`Prior: tests/testdata/fusion-codec/UPSTREAM.json:304` and `Prior: tests/testdata/fusion-fj01/UPSTREAM.json:48`) stand at `e21ef887…`, the version at fusion `d3ad786d` (7 824 lines). This is quoted from the log's passage measured at Prior `bf6bb42`, not re-measured here |
| Passages cite line numbers inside the file | `grep -o -E '\blines? [0-9]{3,4}\b'` prints 161 occurrences on 122 lines. Examples: `### The observed inventory (R2; corrects lines 1716, 1725 and 1788)`, and "line 8730" in `7ff7b391`'s passage |
| Code cites the file's headings | `grep -rn 'REQUESTS\.md' codec/src codec/scripts adapters hooks/lib bin` prints 23 hits in 17 files. 21 of the hits are code comments; 2 are in `adapters/prior/README.md`. The brief's grep does not find two more dependants: **`catalog/src/__tests__/prior-commands.test.ts`** reads the file at test time (`readFileSync(... "codec/fixtures/prior/REQUESTS.md")`) and slices a table between the text markers `**The inventory, a text scan and so a floor.**` and `Neutral shell fences use`; and 22 JSON fixtures under `codec/fixtures/protocol-session-*` name the path (`git grep -n 'REQUESTS\.md'`) |

Any answer must also leave request 82's answer path working as request 82 states it (`### What fusion does with the answer`: the answer "is recorded here, as `### Prior's answer to 82 at <Prior commit>`").

## Recommendation

Option 1 is chosen; the user accepted it. Within it, new requests go one file per request (1c), for the reasons above.

### What happens to the pins and citations under option 1

| Pointer | After the freeze |
|---|---|
| The bundle's copy (`8ece771d…` inside `2ba70dbe…`) and earlier bundles | unaffected. A bundle is a frozen asset, and its copy was already older than the tree's |
| Prior's `UPSTREAM.json` pins (`e21ef887…`) | unaffected. They pin a historical version that git keeps. After the freeze, the head digest of `REQUESTS.md` moves **once more**, through the pointer passage, and then never again. If Prior re-pins to it, that pin is final |
| Line-number citations inside the file (161 occurrences) | stay valid. The pointer passage is appended after line 9 063 and no earlier line moves |
| Heading citations in code, docs and fixtures, and the catalog test's text markers | stay valid, because no frozen text is edited. The catalog test needs no change |
| New citations | a request file plus its heading, as now. The status file is cited by **request number**, never by line, because it is edited in place |
| New digests | each request file's digest is relayed when it is filed and when a passage is appended to it. **The status file is never pinned and never placed in a bundle as evidence**, and it says so in its head. Prior has committed to this from its side at `ed81134`. It pins a whole commit's snapshot, so it will leave `STATUS.md` out of every pin explicitly |

### Open questions for the user

- [x] **1. File names.** A suggestion only: `codec/fixtures/prior/STATUS.md` and `codec/fixtures/prior/requests/083-<slug>.md`, with numbering continuing at 83. Prior's pins use two path spellings (`fixtures/prior/REQUESTS.md` and `codec/fixtures/prior/REQUESTS.md`), so whichever names are chosen, both of Prior's roots will see them.
  - **Ruled 2026-11-16 by the user:** `codec/fixtures/prior/STATUS.md` and `codec/fixtures/prior/requests/083-<slug>.md`, numbering continuing at 83.
- [x] **2. Timing of the freeze.** Does the freeze wait for Prior's answer to 82, as option 1a states? Waiting keeps 82's answer where request 82 says it will be recorded. Freezing earlier requires a passage telling Prior that the answer goes to a successor file, which is itself a change to "what follows from Prior's answer" and so needs its own passage under the rule.
  - **Ruled 2026-11-16 by the user:** the freeze comes after Prior's answer to 82 has been recorded in `REQUESTS.md`, as option 1a states.
- [x] **3. Prior's agreement.** Does Prior have to agree before request 83 is filed in the new structure, or is the brief a notice? Prior's pins and its habit of reading the log at a fusion commit are Prior's to change.
  - **Ruled 2026-11-16 by the user:** agreement is required. The brief to Prior asks for agreement and is not a notice. Request 83 is not filed in the new structure until Prior has agreed. The decision is taken; its execution waits for Prior's agreement.
  - **Answered 2026-11-16 by Prior, relayed by the user:** Prior agrees at Prior `ed81134` ("docs(decision): Prior agrees to fusion's per-request files from request 83 on"), in its decision `foreign:F09-Prior:261116-0930-how-prior-answers-fusions-brief-on-the-request-log-restructure.md` `## Ruling`. Request 83 is the first request filed under the new structure. Request 82, its bundle and Prior's existing pins are unaffected. The decision is now agreed with Prior. Its execution waits on Prior's answer to 82, then the freeze.
  - Prior's readers need no change (re-checked in the Prior checkout at `ed81134`). `git grep -l 'REQUESTS\.md' ed81134 -- '*.go' '*.sh' '*.ts'` prints nothing. Both pins are path-to-sha256 maps that the tests walk. `tests/testdata/fusion-fj01/UPSTREAM.json:48` names `codec/fixtures/prior/REQUESTS.md`, and that pin is rooted at fusion's repository root. `tests/testdata/fusion-codec/UPSTREAM.json:304` names `fixtures/prior/REQUESTS.md`, and that pin is rooted at fusion's `codec/` (`"commit": "d3ad786d…"`). Both pin the file at `e21ef8871a2f…`. So the two spellings are one file under two snapshot roots, and a `requests/` file becomes one more entry in each map at the next re-pin.
- [x] **4. What a bundle carries.** Does a future bundle carry only its own request file, that file plus the frozen log, or nothing from the request side?
  - **Answered 2026-11-16 by Prior at `ed81134`, relayed by the user:** a future bundle carries its own request file only, not the frozen log.
- [x] **5. How far the correction rule reaches.** Does "what follows from Prior's answer" include consequences on fusion's side only, such as the version number `2a164617` corrected? Read literally, yes, and that correction keeps its own passage. If the user means only consequences Prior acts on, it becomes a status-row note.
  - **Ruled 2026-11-16 by the user:** the narrow reading. A correction that changes only consequences on fusion's side, such as the version number in `2a164617`, becomes a one-line note in that request's `STATUS.md` row and gets no passage. A passage is needed only when the correction changes what Prior is asked to run, check or answer, or what Prior is to do in response to an answer.
- [x] **6. The status file's rows for 1 to 82.** Are they written in full at the freeze, each pointing at the frozen heading that settles it? Or does row 1 to 82 stay a single pointer to the last table in the frozen log? Writing them in full ends the supersession chains, but it is a one-time transcription that has to be checked against those tables.
  - **Ruled 2026-11-16 by the user:** `STATUS.md` writes out rows 1 to 82 in full at the freeze. Each row points at the heading in the frozen log that settles it, which ends the supersession chains. The transcription is checked against the last status tables.
- [x] **7. Drift between a status row and its request file.** Should a test check that each status row's state matches the newest answer heading in its request file? There is no such check today, and the status tables in the log never had one either.
  - **Ruled 2026-11-16 by the user:** yes. A test checks that each `STATUS.md` row's state matches the newest answer heading in its request file, for requests from 83 on. Rows 1 to 82 are checked against the frozen log's settling heading wherever that can be done mechanically.
  - **The limit, measured at `535fefe5`:** the frozen log has a uniform answer heading, `^#{2,4} Prior's answer to <N>`, only from request 62 on. The heading exists for 62 to 65, 67 to 77 and 79 to 81 (17 headings, `grep -n -E "^#{2,4} Prior's answer to [0-9]+"`). For those rows the test can match the state against the heading. For rows 1 to 61, 66 and 78, and for 82 until its answer is recorded, the test can only check that the cited heading exists verbatim in the frozen log, not that the state matches it.
- [x] **8. Where Prior's answer to the brief is recorded in fusion's protocol.** Proposal: in the freeze passage of `REQUESTS.md`, written after the answer to 82, and in the preamble of row 83 in `STATUS.md`.
  - **Ruled 2026-11-16 by the user:** Prior's agreement at `ed81134` is recorded in the freeze passage of `REQUESTS.md`, which is written after Prior's answer to 82. The preamble of row 83 in `STATUS.md` also notes it.

### Execution order

Every question is settled. Execution waits on Prior's answer to 82 being recorded in `REQUESTS.md`. The steps run in this order:

| Step | What | Who |
|---|---|---|
| 1 | The freeze passage in `REQUESTS.md`. It names the successor files, records Prior's agreement at `ed81134`, and states that nothing is appended after it | document-editor |
| 2 | `codec/fixtures/prior/STATUS.md`: the head saying it is not a log and is never pinned or bundled, rows 1 to 82 written out and checked against the last status tables, and row 83's preamble | document-editor |
| 3 | The test from question 7 | code-implementer |
| 4 | Request 83 as `codec/fixtures/prior/requests/083-<slug>.md` | document-editor |

---
Answered: this record, option 1 — freeze REQUESTS.md after the answer to 82 is recorded, STATUS.md maintained in place, one append-only file per request from 83 on, the narrow correction rule; questions 1 to 8 ruled 2026-11-16 as recorded above, Prior agreed at ed81134; ruled by user, Kai Stalmann <ks@qantr.com>
