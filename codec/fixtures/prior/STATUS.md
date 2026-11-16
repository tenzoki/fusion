# Status of fusion's requests to Prior

**This file is the current state of fusion's requests to the Prior side. It is maintained in place and is not a log.** A row is edited when a request's state changes; nothing is appended for history's sake, and an earlier wording of a row is in git, not here.

- **Never pinned, never placed in a bundle.** Its digest moves on every edit, so nothing may pin it. Prior leaves it out of every pin (Prior `ed81134`, `foreign:F09-Prior:261116-0930-how-prior-answers-fusions-brief-on-the-request-log-restructure.md`, `## Ruling`, point 2).
- **Cited by request number, never by line.**
- **The history is elsewhere.** Requests 1 to 82 are in `REQUESTS.md`, frozen at fusion `40f3f32f` (`sha256:0d9f2530f4e603bafaeb7e12f6726b511418893c369cd4eb10e86cda9b952d1a`, its final digest). From 83 on, each request is in `requests/NNN-<slug>.md`, append-only once relayed to Prior. A follow-up on 82 goes to `requests/082-<slug>.md` (decision `261116-1234-where-does-priors-hook-replay-follow-up-on-request-82-go-now-that-the-log-is-frozen.md`).
- **Corrections.** A correction gets a passage, in the file of the request it corrects, only when it changes what Prior is asked to run, check or answer, or what Prior is to do in response to an answer. One that changes only consequences on fusion's side is a one-line note in that request's row here; any other is recorded in fusion's workbench issue and the commit message (decision `261115-2310-how-does-the-prior-request-log-stop-growing-once-request-82-is-answered.md`, question 5).

**Columns.** *Request*: the number. *State*: one term from the vocabulary below. *Prior commit*: the Prior commit the state names (`—` where none). *Bundle*: the bundle or codec digest the state was given on (`—` where none). *File* and *Heading*: where the request is settled; for 1 to 82 the heading is quoted verbatim from `REQUESTS.md`, its `#` marks included. *Note*: optional, one line.

**State vocabulary**, taken from the status tables of `REQUESTS.md`: `answered`, `answered Yes`, `accepted`, `accepted with corrections`, `corrected`, `complete`, `rejected`, `ruled`, `ruled out of this revision`, `bundle replaced by 79's`, `reserved, not sent`, `never asked`. Where a request was asked and has no answer yet, its state is `asked`.

**How rows 1 to 82 were transcribed.** Each row is taken from the last status table of `REQUESTS.md` that covers it, the newest being `### Requests 64 and 67 to 82, as they stand`, followed through its "as in … above" pointers. Where a later section records an answer the last table covering a request does not show, the row follows that section and its note says so. Requests 1 to 25, 34, 35 and 42 to 44 appear in no status table; their rows follow the section that records Prior's answer, and their notes say so.

| Request | State | Prior commit | Bundle | File | Heading | Note |
|---|---|---|---|---|---|---|
| 1 | answered | `c512c4c` | — | `REQUESTS.md` | `## FJ01b (the FJ00 follow-up)` | in no status table; Prior's ruling, read at `c512c4c`, applied at FJ01b |
| 2 | answered | `c512c4c` | — | `REQUESTS.md` | `## FJ01b (the FJ00 follow-up)` | in no status table; Prior's ruling, read at `c512c4c`, applied at FJ01b |
| 3 | answered | `c512c4c` | — | `REQUESTS.md` | `## FJ01b (the FJ00 follow-up)` | in no status table; Prior's ruling, read at `c512c4c`, applied at FJ01b |
| 4 | answered | `c512c4c` | — | `REQUESTS.md` | `## FJ01b (the FJ00 follow-up)` | in no status table; Prior's ruling, read at `c512c4c`, applied at FJ01b |
| 5 | answered | `c512c4c` | — | `REQUESTS.md` | `## FJ01b (the FJ00 follow-up)` | in no status table; Prior's ruling, read at `c512c4c`, applied at FJ01b |
| 6 | answered | `c512c4c` | — | `REQUESTS.md` | `## FJ01b (the FJ00 follow-up)` | in no status table; Prior's ruling, read at `c512c4c`, applied at FJ01b |
| 7 | answered | `c512c4c` | — | `REQUESTS.md` | `## FJ01b (the FJ00 follow-up)` | in no status table; Prior's ruling, read at `c512c4c`, applied at FJ01b |
| 8 | answered | `c512c4c` | — | `REQUESTS.md` | `## FJ01b (the FJ00 follow-up)` | in no status table; Prior's ruling, read at `c512c4c`, applied at FJ01b |
| 9 | answered | `c512c4c` | — | `REQUESTS.md` | `## FJ01b (the FJ00 follow-up)` | in no status table; Prior's ruling, read at `c512c4c`, applied at FJ01b |
| 10 | answered | `c512c4c` | — | `REQUESTS.md` | `## FJ01b (the FJ00 follow-up)` | in no status table; Prior's ruling, read at `c512c4c`, applied at FJ01b; its reading revised by fusion in `## FJ02 (the operation kernel)` |
| 11 | complete | `f18481c` | — | `REQUESTS.md` | `## FJ02 (the operation kernel)` | in no status table; FJ02 builds on the FJ01b contract Prior accepted; request 16 names the codec pin at `dc798133` |
| 12 | complete | `f18481c` | `sha256:f82aa558444a85e6ddf99ed8ba16346832a27e27207e00930d002c74a1727230` | `REQUESTS.md` | `## FJ02 (the operation kernel)` | in no status table; request 17 names the FJ01 pin at this digest |
| 13 | accepted | `f18481c` | — | `REQUESTS.md` | `## FJ02 (the operation kernel)` | in no status table; the deferral shape "Prior confirmed" (FJ02, item 3) |
| 14 | accepted | `f18481c` | — | `REQUESTS.md` | `## FJ02 (the operation kernel)` | in no status table; asked nothing; covered by the FJ01b contract Prior accepted |
| 15 | accepted | `f18481c` | — | `REQUESTS.md` | `## FJ02 (the operation kernel)` | in no status table; asked nothing; covered by the FJ01b contract Prior accepted |
| 16 | complete | `38acd95` | — | `REQUESTS.md` | `## FJ02b (the two approved kernel extensions)` | in no status table; request 23 cites "response 16's statement that the 218-case pass is evidence" |
| 17 | complete | `38acd95` | `sha256:9048e883e1a522597f782224cff7c1d444cc21ec5348c26dd9916fed68f3cc02` | `REQUESTS.md` | `## FJ02b (the two approved kernel extensions)` | in no status table; request 24 names the FJ01 pin at this digest |
| 18 | accepted | `38acd95` | — | `REQUESTS.md` | `## FJ02b (the two approved kernel extensions)` | in no status table; plan progress through `transition`, approved (response 18) |
| 19 | accepted | `38acd95` | — | `REQUESTS.md` | `## FJ02b (the two approved kernel extensions)` | in no status table; `create` of an evidence record, approved (response 19) |
| 20 | answered | `38acd95` | — | `REQUESTS.md` | `## FJ02b (the two approved kernel extensions)` | in no status table; this file states no verdict; Prior's is `## 20. Adopt-plan role and decision payloads` of its FJ02 response |
| 21 | corrected | `38acd95` | — | `REQUESTS.md` | `## FJ02b (the two approved kernel extensions)` | in no status table; response 21 refuted fusion's retention claim, which FJ02b corrects |
| 22 | answered | `38acd95` | — | `REQUESTS.md` | `## FJ02b (the two approved kernel extensions)` | in no status table; response 22, option (a): the host decides ownership; a takeover became 38, then 62 |
| 23 | complete | `e3bc25b` | — | `REQUESTS.md` | `## FJ03 (questions before the consumers)` | in no status table; "the Prior side's acceptance of requests 23 and 24" |
| 24 | complete | `e3bc25b` | `sha256:5f116c6436175a6b8e1cb08aa2625d2e2f68ef193657b00eb1891ea8d3b965bd` | `REQUESTS.md` | `## FJ03 (questions before the consumers)` | in no status table; request 35 names the FJ01 pin at this digest |
| 25 | accepted | — | — | `REQUESTS.md` | `### 25. The four choices and the two review corrections, as settled` | in no status table; asked nothing; records what Prior accepted in its review of the FJ02b plan; its open question went to 37 |
| 26 | ruled | `ddd4973` | — | `REQUESTS.md` | `### Items 26 to 30, as they stand` | the two-phase option |
| 27 | ruled | `ddd4973` | — | `REQUESTS.md` | `### Items 26 to 30, as they stand` | a codec-owned `initialize` |
| 28 | answered | `ad21e58` | — | `REQUESTS.md` | `### Items 26 to 30, as they stand` | closure (b) now, (a) with `initialize` |
| 29 | answered | `ad21e58` | — | `REQUESTS.md` | `### Items 26 to 30, as they stand` | confirmed for FJ03a |
| 30 | answered | `ad21e58` | — | `REQUESTS.md` | `### Items 26 to 30, as they stand` | the landed recovery declaration confirmed |
| 31 | answered | `ae1ad78` | — | `REQUESTS.md` | `### Items 31 to 33, as they stand` | codec responses up to 16 MiB; records and requests keep 1 MiB |
| 32 | accepted | `ae1ad78` | — | `REQUESTS.md` | `### Items 31 to 33, as they stand` | for both hosts, with details for FJ03c |
| 33 | accepted | `ae1ad78` | — | `REQUESTS.md` | `### Items 31 to 33, as they stand` | in principle, with three corrections; the lock-temp-file exemption at `7909838` |
| 34 | complete | `930eb26` | — | `REQUESTS.md` | `## FJ03c (questions before the write paths)` | in no status table; "Prior closes requests 34 and 35 against that digest" |
| 35 | complete | `930eb26` | `sha256:bde8f3c952bd111695dbac510d3c0802566080e07c2ba3b6396d9c2c807844d1` | `REQUESTS.md` | `## FJ03c (questions before the write paths)` | in no status table; the qualification FJ03c depends on |
| 36 | accepted | `b912302` | — | `REQUESTS.md` | `## The archive revision (the contract delta)` | option 2, in a separate codec revision; the last table covering it, `### Items 36 to 38, as they stand`, reads open |
| 37 | answered | `b912302` | — | `REQUESTS.md` | ``### Request 37: `transition` refuses a payload field foreign to the target's kind`` | the refusal goes into the archive revision; the last table covering it, `### Items 36 to 38, as they stand`, reads open |
| 38 | ruled out of this revision | `b912302` | — | `REQUESTS.md` | `### Request 38 is not in this revision` | as `### Requests 38 to 41, as they stand`; the takeover came back as request 62 |
| 39 | answered | `39f6fb8` | — | `REQUESTS.md` | `### Prior's rulings and how the host meets them` | (a), (b), (c) accepted, (d) fail-open rejected and fixed; the last table covering it, `### Requests 38 to 41, as they stand`, reads open |
| 40 | rejected | `39f6fb8` | — | `REQUESTS.md` | `### Prior's rulings and how the host meets them` | the intentional break rejected; citation targets held; the last table covering it reads "notice, unobjected" |
| 41 | accepted | `39f6fb8` | — | `REQUESTS.md` | `### Prior's rulings and how the host meets them` | the last table covering it reads "unobjected" |
| 42 | complete | `39f6fb8` | — | `REQUESTS.md` | `## The archive revision (the corrected fence reader)` | in no status table; the verdict is not stated in this file; Prior's response at `39f6fb8` is titled "request 42 complete, request 43 blocked" |
| 43 | rejected | `39f6fb8` | `sha256:ea902c01c4a9b41a94a101d48ef80b4d6456f954353ae96489c3dee0d1548021` | `REQUESTS.md` | `## The archive revision (the corrected fence reader)` | in no status table; "Prior's response blocked" the candidate on 39 (d); replaced by 44 |
| 44 | complete | `590465d` | `sha256:6b26faf2b0f9389fcbb4df1a3dd23881d2ff76cb2cab4c918f2bf969a597b0bf` | `REQUESTS.md` | `## FJ04 (the contract delta)` | in no status table; "the bundle request 44 qualified" |
| 45 | answered | `ab9cb59` | — | `REQUESTS.md` | `## FJ04 (the contract delta, amended for ab9cb59)` | as `### Requests 45 to 58, as they stand` |
| 46 | answered | `ab9cb59` | — | `REQUESTS.md` | `## FJ04 (the contract delta, amended for ab9cb59)` | the record cut (46 a) |
| 47 | answered | `ab9cb59` | — | `REQUESTS.md` | `## FJ04 (the contract delta, amended for ab9cb59)` | the Circle map |
| 48 | answered | `ab9cb59` | — | `REQUESTS.md` | `## FJ04 (the contract delta, amended for ab9cb59)` | anchors |
| 49 | answered | `ab9cb59` | — | `REQUESTS.md` | `## FJ04 (the contract delta, amended for ab9cb59)` | answer references (49 a, b) |
| 50 | answered | `a1fb17a` | — | `REQUESTS.md` | `## FJ04 (addendum for a1fb17a)` | yes, only if one intent does not fit; not used |
| 51 | answered | `a1fb17a` | — | `REQUESTS.md` | `## FJ04 (addendum for a1fb17a)` | the stored chunk-0 answer with its exact `progress` list |
| 52 | answered | `a1fb17a` | — | `REQUESTS.md` | `## FJ04 (addendum for a1fb17a)` | extended at `d0fce6c` by the proven no-ops |
| 53 | reserved, not sent | — | — | `REQUESTS.md` | `### Requests 45 to 60, as they stand` | |
| 54 | accepted | `7758bfa` | — | `REQUESTS.md` | ``### Prior's answer at `7758bfa` `` | with the limits quoted there |
| 55 | accepted | `7758bfa` | — | `REQUESTS.md` | ``### Prior's answer at `7758bfa` `` | with the limits quoted there; asks for the `derived` entry B1 writes |
| 56 | accepted | `7758bfa` | — | `REQUESTS.md` | ``### Prior's answer at `7758bfa` `` | with the limits quoted there |
| 57 | accepted | `7758bfa` | — | `REQUESTS.md` | ``### Prior's answer at `7758bfa` `` | with the limits quoted there |
| 58 | accepted | `7758bfa` | — | `REQUESTS.md` | ``### Prior's answer at `7758bfa` `` | with the limits quoted there |
| 59 | complete | `d6abeb8` | — | `REQUESTS.md` | `### Requests 59 to 61, as they stand` | for `f9ecae78`; re-asked as 63 |
| 60 | complete | `d6abeb8` | `sha256:c76bbce9cc86634f5e9c227e8496511dc71eb845768704f43e68200ab841e52e` | `REQUESTS.md` | `### Requests 59 to 61, as they stand` | rejected for `575aec47…` at `7758bfa` first; re-asked as 64 |
| 61 | answered Yes | `7da6690` | — | `REQUESTS.md` | `### Requests 59 to 62, as they stand` | FJ03d complete |
| 62 | accepted with corrections | `f32bf4a` | — | `REQUESTS.md` | `### Prior's answer to 62, now at a Prior commit` | first read uncommitted at `7da6690`, `sha256:f1fc4de6…` |
| 63 | complete | `34a2710` | — | `REQUESTS.md` | `### Prior's answer to 63 and 64 at 34a2710` | for `dd4bf3d4` |
| 64 | complete | `34a2710` | `sha256:fb1703619c94bd2ed6ef8b753e70dd38e36dcb26da0775fb4e19274ed11bb66f` | `REQUESTS.md` | `### Prior's answer to 63 and 64 at 34a2710` | for `dd4bf3d4`; replaced as `QualifiedCodecDigest` by `dfab3f21…` at `d372bc0` |
| 65 | complete | `167c605` | — | `REQUESTS.md` | `### Prior's answer to 65 at 167c605` | "Yes", for C = `468d8e87`, now `v13.0.0` |
| 66 | never asked | — | — | `REQUESTS.md` | `## FJ05 (the release evidence at 468d8e87)` | not a request; decision A2, option 1 |
| 67 | accepted with corrections | `da02626` | — | `REQUESTS.md` | `### Prior's answer to 67 at da02626` | P67-1 and P67-2 landed at `8bab88a`, corrected by `5199cf1` |
| 68 | accepted | `b20edb6` | `sha256:cd37dac7f3593b37ded744f969f9b38ad49515b66710fb5e5974647ff6d3b2dd` | `REQUESTS.md` | `### Prior's answer to 68 at b20edb6` | macOS arm64 only; Linux built, not qualified |
| 69 | accepted with corrections | `a4f463f` | — | `REQUESTS.md` | `### Prior's answer to 69 at a4f463f` | the contract for P67-4; P69-1 to P69-6 qualified under 70 |
| 70 | accepted | `f0b57b6` | `sha256:56ac4c576833152b740e5304af88649a9a4f063289ec799a7bacecdc0770cd94` | `REQUESTS.md` | `### Prior's answer to 70 at f0b57b6` | host `f36ac32`; macOS arm64 only; Linux built, not qualified |
| 71 | accepted | `8f59121` | — | `REQUESTS.md` | `### Prior's answer to 71, and how this revision meets it` | 71(a), (b), (c), no correction |
| 72 | complete | `01cf2fd` | — | `REQUESTS.md` | `### Prior's answer to 72 and 73 at 3c29dcf` | for `ec76d4fd`; answered at `3c29dcf` |
| 73 | complete | `d372bc0` | `sha256:dfab3f21542716037cb6aeec3be01f7d972928faeb2964081a575f91c32ac55f` | `REQUESTS.md` | `### Prior's answer to 72 and 73 at 3c29dcf` | answered at `3c29dcf`; replaced as `QualifiedCodecDigest` by `b4047458…` at `08c57fb` |
| 74 | accepted | `b711b62` | — | `REQUESTS.md` | `### Prior's answer to 74 at b711b62` | for `9ec788e1`; delta to `d6fc9da0…` never replayed; its re-pin and replay taken up by 75(b) |
| 75 | complete | `08c57fb` | `sha256:b404745831dd921bfbae78f52df49604d22f4f78b7c07bce067cc9078e262e2d` | `REQUESTS.md` | `### Prior's answer to 75(b) at 08c57fb` | 75(a) accepted at `8b505a8` (`### Prior's answer to 75(a) at 8b505a8`) |
| 76 | corrected | `52a2703` | — | `REQUESTS.md` | `### Prior's answer to 76 and 77 at 52a2703` | answered with 77; question 6 corrected, question 4 deferred on Prior issue `261023-0835-…`; bundle `90961e04…` replaced by 77's |
| 77 | corrected | `52a2703` | `sha256:c61f9033485a5389a05c87ac3eda9eec01324a1df4ef9324a3528a46d45a064f` | `REQUESTS.md` | `### Prior's answer to 76 and 77 at 52a2703` | no tag at C′; its bundle replaced by 78's |
| 78 | bundle replaced by 79's | `cb1138b` | — | `REQUESTS.md` | `### The rulings on 78's questions` | questions 1 to 3 accepted, corrected, corrected, on Prior's host; no verdict on `439142d7…`. 13.4.3 is no request (`### Why 78 moved, and fusion's own error`) |
| 79 | answered | `10e07d2` | `sha256:64bc6df15435a973590a560bbcd1572034434f62178b79283c671f6f0d9f97ed` | `REQUESTS.md` | `### Prior's answer to 79 at 10e07d2` | 79.1 to 79.4 accepted; hook replay never repeated on this digest; tag `v13.4.4` on `bcb7133d` stands |
| 80 | corrected | `557011a` | — | `REQUESTS.md` | `### Prior's answer to 80 at 557011a` | its one condition, on question 4, confirmed by 81 |
| 81 | answered | `bd3c1bf` | — | `REQUESTS.md` | `### Prior's answer to question 1 of 81 at bf6bb42` | questions 1, 2, 4 accepted (1 at `7dbcf57`, pin `bf6bb42`), 3 and 5 corrected; codec `36570a7c…` qualified from `bf6bb42` on |
| 82 | answered | `90b5758` | `sha256:2ba70dbeba8662212ef8312801da1c8103e90bfe42cf6a1ac8e34b71352ad643` | `REQUESTS.md` | `### Prior's answer to 82 at 90b5758` | 82.1 to 82.4 and question 1 accepted; hook replay deferred (Prior plan steps 107 to 110 and 76, follow-up step 111), the follow-up goes to `requests/082-<slug>.md`; a correction takes the next free patch version, not 13.5.1 (`2a164617`); `90b5758` not on Prior's remote on 2026-11-16 |

**Request 83** is the first request filed under the per-request structure, by Prior's agreement at `ed81134` ("docs(decision): Prior agrees to fusion's per-request files from request 83 on"). It is not yet filed, and no row stands for it.
