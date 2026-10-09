### Prior's answer to 63 and 64 at 34a2710

**Read at:** Prior commit `34a2710` (2026-10-09 16:13, "Qualify Fusion claim takeover revision and close requests 63 and 64"), the head of Prior's `main`, parent `f32bf4a`. `git log --all --oneline f32bf4a..` there names `34a2710` and `88b2e6c`, the second on `review/fj04-candidate-524fdfad`, as before. The answer is `Prior: docs/design/fusion-takeover-qualification-prior-response.md`, 5 822 bytes, `sha256:1c5f98053fad95dde22d19ee8143cf55e89d8518618d9d487da0f7f19238331b` as `git show 34a2710:<path> | shasum -a 256` prints it. It was read from the commit, not from a working tree, as `### Prior's answer to 62, now at a Prior commit` asked. From here on it is cited as `Prior: docs/design/fusion-takeover-qualification-prior-response.md` at `34a2710`. Fusion was read at `073ae793` (2026-10-09 15:20) on `fj-json-workbench`, 22 commits ahead of `origin/fj-json-workbench`.

**Prior's verdict, quoted:** "63 and 64: complete. The claim-takeover codec revision is qualified by Prior." The accepted bundle is "699,011 bytes: `sha256:fb1703619c94bd2ed6ef8b753e70dd38e36dcb26da0775fb4e19274ed11bb66f`". "No recorded response, refusal expectation or delta was weakened to make the revision pass." Prior names its handoff as fusion `4e1e1b47`, read at `073ae793`, and both snapshots as taken "from committed objects at the requested frozen revision `dd4bf3d49602c75ba5c52c4caddce5e32216847b`".

**Prior asks for no codec byte to change.** The answer requests nothing of fusion's codec, schemas, fixtures or recorded sessions. So the run continues past step 10.

#### The qualified digest, compared

| Where | Digest |
|---|---|
| Fusion step 6, at `00e465f6`, and this section's head at `dd4bf3d4` | `fb1703619c94bd2ed6ef8b753e70dd38e36dcb26da0775fb4e19274ed11bb66f`, 699 011 bytes |
| `shasum -a 256 codec/dist/fusion-record.js` in fusion's working tree at `073ae793` | `fb1703619c94bd2ed6ef8b753e70dd38e36dcb26da0775fb4e19274ed11bb66f`, 699 011 bytes (`wc -c`) |
| `git show 073ae793:codec/dist/fusion-record.js \| shasum -a 256` | the same |
| Prior's answer | `sha256:fb1703619c94bd2ed6ef8b753e70dd38e36dcb26da0775fb4e19274ed11bb66f`, 699,011 bytes |
| `Prior: tests/testdata/fusion-fj01/UPSTREAM.json` at `34a2710`, `bundle_digest` and the `codec/dist/fusion-record.js` entry | the same |
| `codecBundleDigest`, `Prior: internal/fusionhost/codec_process_test.go` line 22 at `34a2710` | the same |
| `QualifiedCodecDigest`, `Prior: internal/fusionhost/workbench.go` at `34a2710` (was `c76bbce9…`) | the same |

All seven agree. The last commit that moved a byte under `codec/dist/` is still `00e465f6` (`git log -1 -- codec/dist/fusion-record.js`). `git diff --stat dd4bf3d4 073ae793 -- codec bin` names one file, `codec/fixtures/prior/REQUESTS.md`, 202 lines added, which is the section above.

#### 63. The shared fixture set: **complete**

| Figure | Asked | Prior's answer |
|---|---|---|
| Files in `Prior: tests/testdata/fusion-codec/UPSTREAM.json` | 413 (390 plus 23) | "413 files: six existing files changed and 23 fixtures were added, exactly as handed over"; `commit` is `dd4bf3d4…`, 413 entries (390 at `f32bf4a`, `commit` `f9ecae78`) |
| `TestFusionCodecSharedManifest` | 370 of 370; 91 valid, 279 invalid (278 `schema-invalid`, 1 `unsupported-format`) | "370 manifest cases: 91 valid and 279 invalid, of which 278 are `schema-invalid` and one is `unsupported-format`" |
| Schemas | ten | "All ten schemas compile" |
| `TestFusionAppliedRulingAndGoldens` | unchanged; 13 goldens | "The applied mapping ruling and all thirteen Go-emitted goldens pass unchanged. No contract table or schema ID changed." |

No differing count is reported.

#### 64. The runtime snapshot, replay and kernel: **complete**

| Figure | Asked | Prior's answer |
|---|---|---|
| `Prior: tests/testdata/fusion-fj01/UPSTREAM.json` | `commit` to `dd4bf3d4`, `bundle_digest` to `fb170361…`, two moved entries, the takeover session's 104 files | "715 pinned entries: two existing files changed (the bundle and REQUESTS.md), and the takeover session contributes 104 files"; 611 entries at `f32bf4a`, so 611 plus 104 |
| Recorded exchanges | every older session through its deltas, and the 37 takeover exchanges byte for byte | "All 225 recorded exchanges, plus Prior's handback, pass through the actual `CodecProcess` adapter": FJ01 6, FJ02 15, FJ02b 20, `initialize` 26, archive 51, migration 70, takeover 37 |
| Takeover session | exact bytes, one substitution | "Exact recorded bytes; only `<workbench>` substituted"; from the committed `base/`, no seed or host edit; every refused exchange checked to leave "the complete tree unchanged" |
| Older sessions and deltas | unchanged since `f9ecae78` | "All older session and delta bytes are unchanged." |
| The kernel | five items of request 60 stand; `takeoverPlan` added | Prior's retained recovery and replay regressions, plus fusion's suite run independently in a separate checkout of `dd4bf3d4` under `CODEC_REQUIRE_GOLDENS=1`: recovery after intent, after the control write and after the answer "yields exactly one replacement and one history entry with the frozen timestamp, and replay returns the uncut response". "The existing kernel, journal and store are unchanged." |
| The version boundary | old bundle over exchange `37`'s workbench | "The correction to the earlier old-reader claim is accepted": old `show` returns the stored record with its history; old validation reports all four transferred packages invalid; release and transition refuse them; the old protocol refuses a takeover request; no call changes the tree. "All 86 previously valid manifest cases still validate in the new schema set." |
| `go test ./...` | green | "passed, including shared fixtures, mapping/goldens, all codec replays, existing actor/recovery regressions and the service/CLI refusal tests" |
| `go vet ./...` | green | "passed" |
| Fusion's codec suite | 22 files, 1 810 tests, 0 skipped (at `29c6c0ff`) | "22 files, 1,810 tests passed, none skipped" |
| Environment | | macOS arm64, Go 1.26.0, Node 25.7.0 |

The 225 are exchanges, not fusion's test counts: fusion's request 64 listed the tests that replay them (18, 39, 49, 91, 107, 110 and 59). 6 + 15 + 20 + 26 + 51 + 70 + 37 is 225.

#### Prior's stated limits

- **Production takeover stays blocked in Prior.** The new digest is installed "together with an explicit service-level refusal of any request containing `takeover`, including `null`", before authorisation, codec preflight and recovery, retained answers and dispatch. Tests cover call and explicit resume, and `prior fusion call` and `resume` "cannot enable takeover". Ordinary claim and release still pass.
- **Enabling it is Prior's host work.** It waits for "administrative authority, revocation/generation, worker quiescence, exact-request recovery and both checkout IDs in `record_change`". "Consent-reference resolution is not authority." This "does not block Fusion's standalone Claude Code release, as agreed in response 62".
- **No mixed versions.** "There is no new required feature. This does not allow simultaneous old and new clients on a workbench: finish pending operations under their matching version and quiesce old clients before takeover writes."
- **No rebinding.** "Old runtime receipts and bundle pins are not rebound to the new version." `fb170361…` replaces `c76bbce9…` "for new Prior workbench installations".
- **What stays with fusion.** "The installed Claude consent observations, Fusion's remaining code-review coverage, final release artifact, installation/migration smoke tests and publication remain FJ05 responsibilities." The qualification "closes the Prior 63/64 gate, not FJ05 as a whole".
- **No integration claim.** It "does not claim that the external Fusion role/workflow module is already integrated into Prior".
- **Nothing outside Prior was touched.** "The upstream checkout and live workbenches were not modified."

#### `REQUESTS.md` against Prior's pins, after this append

**Prior pins this file at `dd4bf3d4`'s bytes, and it already differs from that pin.** Both pins hold it at `44cad87dcd55a54081e46f5cd8c49a665dc8ec30b3ca95976e1c9b1fa5a35f44`, in `Prior: tests/testdata/fusion-codec/UPSTREAM.json` as `fixtures/prior/REQUESTS.md` and in `Prior: tests/testdata/fusion-fj01/UPSTREAM.json` as `codec/fixtures/prior/REQUESTS.md`. That is the file at `dd4bf3d4`, 3 045 lines. At `4e1e1b47` and at `073ae793` it is 3 247 lines, `sha256:e0dddcd7e0d52fbbfddd47aae42df50f637f6de13cafe737e65d3b7d08ce7f31`. This subsection moves it again, and so will every later append. The release candidate C will not match the pin for this one file.

**That does not matter for the qualification.** The file is fixture text, not codec behaviour. Prior's tests check their own committed snapshot against their own pin, and never read fusion's tree. Prior pinned the frozen revision on purpose: "Their REQUESTS.md retains that revision's exact bytes; the later handoff is read separately." Request 63 left that choice to Prior. Every other pinned entry is unchanged at `073ae793`. Each entry of both pins at `34a2710` was hashed against `git show 073ae793:<path>`. Of 413 entries in `fusion-codec`, one differs, `REQUESTS.md`. Of 715 in `fusion-fj01`, one differs, `REQUESTS.md`. The bundle is not among them.

**So step 13 can name it.** At C, both pins should differ from fusion in `REQUESTS.md` alone. Any other differing entry is a finding. A differing `codec/dist/fusion-record.js` stops the release.

#### Requests 59 to 64, as they stand

| Request | State | Where |
|---|---|---|
| 59 | **complete** at Prior `d6abeb8`, for `f9ecae78`; re-asked as 63 | `Prior: docs/design/fusion-fj04-correction-prior-response.md` `## 59: shared fixtures` |
| 60 | **complete** at `d6abeb8`; `c76bbce9…` qualified; re-asked as 64 | the same document, `## 60: runtime qualification` |
| 61 | **answered Yes** at Prior `7da6690` | `Prior: docs/design/fusion-fj03d-prior-response.md` |
| 62 | **accepted with corrections** at Prior `f32bf4a` | `Prior: docs/design/fusion-claim-takeover-prior-response.md` |
| 63 | **complete** at Prior `34a2710`, for `dd4bf3d4`; 413 files, 370 manifest cases (91 valid, 279 invalid), 13 goldens unchanged | `Prior: docs/design/fusion-takeover-qualification-prior-response.md` `## 63 — Shared schemas and fixtures` |
| 64 | **complete** at `34a2710`, for `dd4bf3d4`; `fb170361…` qualified, 699 011 bytes; 715 pinned entries, 225 exchanges, `go test ./...` and `go vet ./...` passed; Prior's production takeover stays refused until its own host qualification | the same document, `## 64 — Runtime snapshot and replay` |

These rows supersede the rows for 59 to 64 in `### Requests 59 to 64, as they stand` above.
