## FJ05 (the takeover revision, requests 63 and 64)

**Written against:** fusion commit `dd4bf3d4` on branch `fj-json-workbench` (2026-10-09 14:37), the head of the branch when this text was written. It differs from `29c6c0ff` (2026-10-09 14:29), the commit the takeover work closed with, outside both Prior pins only: `git diff --stat 29c6c0ff dd4bf3d4 -- codec bin` prints nothing, and the pin comparison below gives the same counts at either commit. The test figures below were taken at `29c6c0ff`. The branch is 18 commits ahead of `origin/fj-json-workbench`; the branch is pushed at FJ05 step 14. The last commit that moved a byte under `codec/dist/` is `00e465f6` (2026-10-09 13:52, `git log -1 -- codec/dist/fusion-record.js`). The sections above are unchanged since `e9c411b5`, which appended Prior's answer to 62: at `dd4bf3d4` this file is 3 045 lines, `sha256:44cad87dcd55a54081e46f5cd8c49a665dc8ec30b3ca95976e1c9b1fa5a35f44`. Prior was read at `f32bf4a` (2026-10-09 13:13), the head of its `main`. `git log --all --oneline 7da6690..` there names `f32bf4a` and `88b2e6c`, the second on `review/fj04-candidate-524fdfad`, as before.

**The bundle:** `codec/dist/fusion-record.js` is 699 011 bytes, `sha256:fb1703619c94bd2ed6ef8b753e70dd38e36dcb26da0775fb4e19274ed11bb66f`. It replaces the qualified `c76bbce9cc86634f5e9c227e8496511dc71eb845768704f43e68200ab841e52e`, 689 747 bytes, which Prior qualified at `d6abeb8` and which stays Prior's pin until 64 is answered. A scratch clone of `29c6c0ff` ran `npm test` in `codec/`, whose build step reported `dist/fusion-record.js: unchanged`. The file hashed as above before the suite and after it, and `shasum -a 256 codec/dist/fusion-record.js` in the working tree at `dd4bf3d4` prints the same digest. Only `fb170361…` is asked to be pinned.

This section is the conformance hand-over that part 10 of `## FJ05 (the takeover addendum, request 62, …)` announced and that Prior's answer to 62, part 10, names: request 63 for the shared schemas, fixtures and manifest, request 64 for the frozen bundle, the takeover session and the replay and conformance run. It also states the hand-over point of Prior's host binding. No line above is edited. Where this section disagrees with a section above, this section governs.

### Prior's answer to 62, now at a Prior commit

The section above pins Prior's answer to working-tree bytes, `sha256:f1fc4de6…`, 12 382 bytes, uncommitted at `7da6690`. Prior has since committed it. `f32bf4a` (2026-10-09 13:13, "docs: accept Fusion claim takeover contract request 62") adds `docs/design/fusion-claim-takeover-prior-response.md` and the twelve lines of `concept/fusion-json-workbench-spec.md`, and nothing else. `git show f32bf4a:docs/design/fusion-claim-takeover-prior-response.md | shasum -a 256` prints `f1fc4de6ac2143f680be25d61d208f3e4776830b6cc6d290b0b8af3769ea065b`, the hash the section above read. So the answer was not changed, and its reading above stands. From here on it is cited as `Prior: docs/design/fusion-claim-takeover-prior-response.md` at `f32bf4a`.

Prior's answer to 63 and 64 (FJ05 step 10) still needs its own Prior commit. The conformance run qualifies an exact revision, so that answer is not read from working-tree bytes.

### What landed, and at which commits

| Commit | Plan step | What it carries |
|---|---|---|
| `00e465f6` | 5 and 6 | The schemas (`common`, `protocol`, `record`, `campaign`), 23 new fixtures and the manifest (347 to 370 entries); `claimPlan` branching to `takeoverPlan` in `codec/src/cli/ops.ts`, the request types in `codec/src/cli/protocol.ts`; each transfer source as a `reconcile` site; the recorded session `codec/fixtures/protocol-session-takeover/`; the bundle `fb170361…`; the `claim` row of `codec/README.md` |
| `e34642a6` | 7 | The Claude client: `bin/fusion-write claim --take-over-from <checkout> --source <JSON>`, the `record_change` row, the archive's binding pass over transfer sources, the installed-tree cases in `codec/src/__tests__/install.test.ts`, `hooks/dist/` rebuilt |
| `8bb82215` | 7 (fix) | `e34642a6` ran the two takeover flag checks for every subcommand, so `set-mode --value autonomous --source <JSON>` failed with the takeover usage error. Both checks now apply to `claim` alone. `record-write.test.ts` sends `set-mode autonomous` with a source and fails against `e34642a6` |
| `0a0d6148` | 8 | The shipped text: `rules/fusion-workbench-conventions.md` `## Work packages`, the **Take over** row of `agents/orchestrator.md`, `docs/upgrading-to-v13.md`, the `bin/fusion-write` row of `README-hooks.md`; the opt-in observation suite's cases (i) and (j) |
| `29c6c0ff` | 8 | Decision `260930-2305_*_how-is-a-claim-held-by-a-checkout-that-no-longer-exists-released-under-response-22.md` is `implemented`. Workbench files only |
| `dd4bf3d4` | 11 | The release surfaces at 13.0.0 (`install.sh`, `README.md`, `README-agents.md`, `skills/help/SKILL.md`, `docs/upgrading-to-v13.md`, `docs/working-model.md`). No path either Prior pin holds |

`git diff --stat f9ecae78 dd4bf3d4` over `codec/src/kernel.ts`, `codec/src/journal.ts`, `codec/src/store.ts`, `codec/src/references.ts`, `codec/contract/`, `codec/package.json` and `bin/fusion-record` prints nothing. Under `codec/src/`, outside the tests, only `cli/ops.ts` and `cli/protocol.ts` changed, 140 lines in and 2 out. The journal, the lock, recovery and the replay lookup are the kernel Prior qualified. The takeover is one more mutation plan inside it.

### What changed for Prior's two pins, at `dd4bf3d4`

Both pin files name fusion `f9ecae78`. The counts below come from this command, run at the root of fusion's repository, with `PRIOR` set to Prior's checkout:

```
for pin in fusion-codec:codec/ fusion-fj01:; do n=0; m=0; while read p h; do n=$((n+1)); [ "$(git show "dd4bf3d4:${pin#*:}$p" 2>/dev/null | shasum -a 256 | cut -c1-64)" = "$h" ] || { m=$((m+1)); echo "  moved ${pin%%:*} $p"; }; done < <(jq -r '.files|to_entries[]|"\(.key) \(.value)"' "$PRIOR/tests/testdata/${pin%%:*}/UPSTREAM.json"); echo "${pin%%:*}: $m of $n moved"; done
```

It hashes each pinned path's blob at `dd4bf3d4` and compares it with the pin. A path missing at `dd4bf3d4` would hash as empty input and count as moved; none is missing. It prints `fusion-codec: 6 of 390 moved` and `fusion-fj01: 2 of 611 moved`.

`Prior: tests/testdata/fusion-codec/UPSTREAM.json` (390 files, fusion `f9ecae78`): six differ.

| Path | `sha256` at `dd4bf3d4` | Change |
|---|---|---|
| `schemas/common.schema.json` | `c6f6005fb8e72a2d558106a7163d0cfa52db70309370f14ab57f460cef36cb1a` | `$defs/claim`, `$defs/claim_transfer`; `$defs/provenance` gains the optional `claim_transfers` |
| `schemas/protocol.schema.json` | `91f1d25895cd0491461fc6abeadd7300aefe4d3a3350d4dcae32faf1bad812c9` | `claim` gains the optional, closed `takeover`; `null` refused |
| `schemas/record.schema.json` | `b125fd605aebbf45fed8c82813e45f9b768f4e33446ccdfc2d9e1b964df40051` | `provenance` refuses `claim_transfers` |
| `schemas/campaign.schema.json` | `080a5b5c0b6fd38c12c285319d5887c8d88d0c5075a82d36de6ae3cd43d4e69f` | `provenance` refuses `claim_transfers` |
| `fixtures/manifest.json` | `801b0e128d06c928b11de904f491693583326751c07da6baec4db0467d4dfa3a` | 347 to 370 entries |
| `fixtures/prior/REQUESTS.md` | `44cad87dcd55a54081e46f5cd8c49a665dc8ec30b3ca95976e1c9b1fa5a35f44` | the addendum and Prior's answer to 62; this section changes it again |

`schemas/package.schema.json`, the other five pinned schemas, all three files of `contract/` and the 13 goldens are unchanged. No schema id was added. New in the shared set are the 23 fixtures below, so the pin grows to 413 files. They are counted by this command, over the directories the pin covers:

```
git ls-tree -r --name-only dd4bf3d4 codec/schemas codec/contract codec/fixtures/valid codec/fixtures/invalid codec/fixtures/prior codec/fixtures/bytes codec/fixtures/manifest.json codec/fixtures/manifest.schema.json | sed 's#^codec/##' | grep -vxFf <(jq -r '.files|keys[]' "$PRIOR/tests/testdata/fusion-codec/UPSTREAM.json") | wc -l
```

It prints 23. No pinned path is gone.

| Fixture | Expect | `sha256` |
|---|---|---|
| `valid/protocol/claim-takeover.json` | valid | `8538aa379c5f6b1b15f0ece232980143fdcd383593d9d06451259d94fe285bcb` |
| `valid/package/claimed-one-transfer.json` | valid | `6bfd0da7d68e440028ccf351c518337ca30c07651019e431b87b3d82c0ca1f76` |
| `valid/package/claimed-two-transfers.json` | valid | `45516859270baf4b0434104a33c80f0d4475f8b957e4c38c9cd4d744755b1cbb` |
| `valid/package/claimed-two-transfers-unchained.json` | valid | `50d019f2fc3d3520379b8455d75350effe41b5471d73027081d9e054f9b2a57f` |
| `valid/package/imported-claimed-transfer-null-previous-claimed-at.json` | valid | `8c710feaf0873b35498825a572126c5e6c0fc8911d4a70d7427d3948133c6a02` |
| `invalid/protocol/claim-takeover-null.json` | `schema-invalid` | `a165a74c5042adc8cdf93a6bcca9948f93b6ffa4eb263be79ce60787900f424f` |
| `invalid/protocol/claim-takeover-without-source.json` | `schema-invalid` | `cd1805d4054a8d69aebece3811db9286680ba7967d4fd28ff296f3672e6a27c9` |
| `invalid/protocol/claim-takeover-without-previous-claim.json` | `schema-invalid` | `d011701fb2dec31f68b11b89d7fa5a17b9bcc363a50755e9b035e956651b272e` |
| `invalid/protocol/claim-takeover-source-null.json` | `schema-invalid` | `80d35a44c24cd8db7ef2e0c4c7d82c72c0fc00c8be56241c24631558c07f1aa9` |
| `invalid/protocol/claim-takeover-source-legacy.json` | `schema-invalid` | `04a78b8241990ca07882ede78a5df75f971a062ce78b20c1a3d9c62d9327ab12` |
| `invalid/protocol/claim-takeover-previous-claim-incomplete.json` | `schema-invalid` | `7491acfeb0afc43c03df27838409ea4dd956e9f9f022919359d79a9a2a7dcd7b` |
| `invalid/protocol/claim-takeover-unknown-key.json` | `schema-invalid` | `83d01e8f6d0c4600d8b8d91884b368c951992a2c5905ba9e077445dff6f48733` |
| `invalid/protocol/transition-payload-takeover.json` | `schema-invalid` | `24f2784b84cc38917e19d66265c06747d2b322540ed74a9082498fe8f4019f5f` |
| `invalid/package/claim-transfers-empty.json` | `schema-invalid` | `1ec46df9c033798adf78fd6555809eb2c4bde268a646c11d5816fb3f460975d9` |
| `invalid/package/claim-transfer-unknown-member.json` | `schema-invalid` | `752470eaa61069bed8b83ff63ff10d7aa9ba13fc47c82226be97aff3a7801724` |
| `invalid/package/claim-transfer-member-missing.json` | `schema-invalid` | `b9ed90addbe5d849c736d6537c5540afba1f7e4fd92b6bc5f279a68e86f637c6` |
| `invalid/package/claim-transfer-new-claimed-at-null.json` | `schema-invalid` | `ad1bf074e758bb5c5a02b44181aaa2bf50bf364ed49f4aa88727cd9c4042ffb9` |
| `invalid/package/claim-transfer-previous-claim-unknown-member.json` | `schema-invalid` | `db5deb3a4c5d480a2f801249c0b3342b7329fc72accfc9bcf488ec7d77416a58` |
| `invalid/package/claim-transfer-source-null.json` | `schema-invalid` | `c3763ac0517579a597a0e0e4cc50356977742d5ca48c940703a6d166e64ba870` |
| `invalid/package/claim-transfer-actor-legacy-unknown-imported.json` | `schema-invalid` | `d8eee9c428883961bc83d4da561797abb1c7cfb734697ce22ce4d2beae7ba7a6` |
| `invalid/record/issue-with-claim-transfers.json` | `schema-invalid` | `a8e73b92d2d21bde7e63642a3d80ad888c8e402617640ca4df0b97e7b9b08b21` |
| `invalid/campaign/claim-transfers.json` | `schema-invalid` | `314b1421ecbc5c9c058fcaf664989b9bf9fefbc92601fb1647b54bfe402704bd` |
| `invalid/evidence/claim-transfers.json` | `schema-invalid` | `ec51a6422052aac77309a93317add5cb90ea4c138882ab7b5ef717748199f123` |

The corrections of Prior's answer to 62 that these carry: `takeover: null` refused (part 1); a null previous `claimed_at` admitted on an imported package and a null new one refused, every entry member required, entry and claim closed, `legacy-unknown` refused as a transfer's actor on an imported package too (part 3b); the history refused on record, campaign and evidence shapes (part 3b); and two transfers that do not chain, A to B, release, an ordinary claim by C, C to D (`claimed-two-transfers-unchained.json`, part 3c). No schema rule ties one entry to the next.

`Prior: tests/testdata/fusion-fj01/UPSTREAM.json` (611 files, fusion `f9ecae78`, bundle `c76bbce9…`): two differ.

| Path | `sha256` at `dd4bf3d4` | Change |
|---|---|---|
| `codec/dist/fusion-record.js` | `fb1703619c94bd2ed6ef8b753e70dd38e36dcb26da0775fb4e19274ed11bb66f` | the takeover |
| `codec/fixtures/prior/REQUESTS.md` | `44cad87dcd55a54081e46f5cd8c49a665dc8ec30b3ca95976e1c9b1fa5a35f44` | as above |

`bin/fusion-record` (`f76bb99b…cc51c`) and `codec/package.json` (`a43fb2df…d6af`) are unchanged. **No response delta.** Every recorded request and response of the six older sessions, every delta file, the migration session's 232 files, `codec/fixtures/legacy-v12/` and `codec/fixtures/workbench/` hash equal to the pin at `dd4bf3d4`. No delta file was added. New is the takeover session, 104 files:

```
git ls-tree -r --name-only dd4bf3d4 codec/fixtures/protocol-session-takeover | grep -vxFf <(jq -r '.files|keys[]' "$PRIOR/tests/testdata/fusion-fj01/UPSTREAM.json") | wc -l
```

prints 104: 37 request and response pairs, its `README.md`, and the 29 files of `base/`.

### The recorded session `protocol-session-takeover`

Thirty-seven exchanges through `bin/fusion-record`, over a fresh copy of `base/`, a workbench under JSON control with thirteen control files. Nothing is seeded, and the host moves no file between exchanges. One substitution, the workbench root as `<workbench>`. Every time is a literal of the requests, `transferred_at` included, so nothing depends on the clock, the host or a generated id. `UPDATE_PROTOCOL_SESSION_TAKEOVER=1` rewrites it. `codec/fixtures/protocol-session-takeover/README.md` lists every exchange with its expected answer. In outline:

- `01` to `03`: `inspect` (`json-control`; no operation and no feature added), `validate` (thirteen checked, valid), `reconcile` (no transfer site).
- `04` to `19`: package P from the gone checkout `deadbeef` to B, its identical replay, a divergent replay (`conflict/operation-id-reused`), the same takeover under a fresh id at the inspected revision (`conflict/revision-mismatch`) and at P's current one (`conflict/takeover-holder-mismatch`); on Q, a wrong `claimed_at` and a wrong checkout (`conflict/takeover-holder-mismatch`), three unresolvable sources (`unresolved-reference/record-not-found`, `unresolved-reference/foreign-workbench`, `missing-evidence/artefact-changed`), `takeover` without `source` and with `source: null` (`schema-invalid/request`), a stale revision (`conflict/revision-mismatch`); P released by B, shown with its entry, and `04` replayed once more after P moved on, answering `04`'s bytes.
- `20` to `25`: Q from A to B to C; U from A to B, released, claimed ordinarily by C, then C to D, whose entry starts at C's claim and not B's.
- `26` to `34`: the general-transition bypass (`conflict/transition-refused`; `takeover` in a `transition` payload, `schema-invalid/request`; `claim` without `takeover`, `conflict/already-claimed`), and the four further refusals (`conflict/takeover-not-claimed` twice, `conflict/package-terminal`, `schema-invalid/not-a-package`), `schema-invalid/takeover-same-checkout` and `schema-invalid/claimed-at-required`.
- `35` to `37`: the imported package N, its claim named as stored with `person` and `claimed_at` null, taken over to B; `reconcile`, six transfer sites, each `resolved`, at `/provenance/claim_transfers/<i>/source/ref` for a user's word and `/provenance/claim_transfers/<i>/source` for a bare record; `validate`, thirteen checked, valid.

Source resolution in exchanges `11` to `13` is evidence validation, not authority, as Prior's answer to 62 part 2b says. `codec/src/__tests__/round-trip-cli-takeover.test.ts` replays the thirty-seven byte for byte (59 tests).

### The version boundary, measured

The addendum's part 7 argued from the closed definition, "not run", that both older readers "answer `schema-invalid` for that package alone". Prior's answer to 62 part 7 asks for executable evidence. The second half of `round-trip-cli-takeover.test.ts` extracts `c76bbce9…` from git by its blob (`6ecde063…`), checks its digest, and runs it over the workbench the session leaves. Measured:

- **`show` returns a transferred package as stored**, `claim_transfers` included, because `show` reads by the strict reader and no schema. The old bundle neither strips the history nor refuses the read.
- **`validate` of each of the four transferred packages** answers `valid: false` with a `schema-invalid` finding.
- **`release` and `transition`** of a transferred package are refused, `schema-invalid`.
- **A takeover request** is refused by the old protocol schema, `schema-invalid/request`.
- **An unscoped `validate`** answers, `valid: false`, and its findings name exactly the four transferred packages. The workbench is not readable whole by the old client, and Prior's sentence "aggregate operations may fail when they encounter that package" stands as the rule.
- **No byte moves.** The tree after these requests equals the tree before them, file for file.

And every record that the manifest at `031645d2` expects valid, 86 entries, validates in the schema set the new bundle inlines.

So an old client is excluded by refusal on validation and on every mutation, not on reading. Fusion's release procedure keeps Prior's exclusion: no mixed codecs on one workbench, and no takeover is written before every client of the workbench runs the new bundle. `docs/upgrading-to-v13.md` states both since `0a0d6148`, and fusion's plan reinstalls `~/.fp` from the release candidate before anyone tests it.

### The Claude route, as built

- `bin/fusion-write claim --record <control path> --take-over-from <checkout> --source <JSON> --actor <actor>` reads `show`, refuses with exit 5 and sends nothing when the standing holder is not `<checkout>`, and composes `takeover.previous_claim` and `expected_revision` from that `show`. The kernel's check 6 still compares all three fields of the claim. The client's comparison of the checkout alone is a pre-check, not the kernel's.
- **The re-send after an unknown outcome** repeats the frozen request and reads no `show`. The unknown outcome prints `expected_revision=`, `claimed_at=` and `previous_claim=`. The re-send passes them back as `--operation-id <id> --expected-revision <sha256> --claimed-at <time> --previous-claim <JSON>`, with the same `--take-over-from` and `--source`. So time, source, both claims, revision and id are those of the first send (Prior's answer to 62, part 5). `record-write.test.ts` asserts the re-sent request byte for byte and that no `show` was read for it.
- The `record_change` row is `op: claim`, `change: {from: "claimed", to: "claimed", previous_checkout_id, checkout_id}`. The monitor renders it as `claimed -> claimed`. The two checkout ids are in `change` and are not rendered.
- `release` and `transition` keep their ownership refusal and gain no flag.
- The orchestrator sends a takeover only on the user's explicit word in the conversation for this package, its previous holder and this checkout as the new holder, after the user confirms the former checkout is gone or stopped. It files a decision record holding those words verbatim first, and `--source` cites it as a `record_ref`. `autonomous` never answers it. The confirmation is a guided procedure, not fencing of copied identities.
- The opt-in observation suite `hooks/lib/__tests__/agent-dispatch-observation.test.ts` gained case (i), a takeover with consent, and case (j), a resolving decision record but no word for this transfer under `autonomous`, where no takeover is dispatched. Both run at FJ05 step 16; they were not run for this section.
- The installed-tree cases in `codec/src/__tests__/install.test.ts` run three takeover sequences with no Prior installation, binary, service or variable present, the second with a release and an ordinary re-claim between the takeovers.

### The figures at `29c6c0ff`

Re-taken on 2026-10-09 in a scratch clone of `29c6c0ff`, Node 25.7.0. `cd codec && CODEC_REQUIRE_GOLDENS=1 npm test` exits 0 with 22 test files and 1 810 tests, all passed, none skipped, `fixtures: 370 manifest entries`, `0 derived-from-source, 13 Go-emitted golden(s)` and `163 of 163 prior_keys exercised`. Changed from `f9ecae78`: `fixtures.test.ts` 373 (was 350), `ops.test.ts` 228 (209), `kernel.test.ts` 62 (59), `install.test.ts` 20 (13); new: `round-trip-cli-takeover.test.ts` 59. Unchanged: `round-trip-cli.test.ts` 18, `prior-handback.test.ts` 6, `round-trip-cli-fj02.test.ts` 39, `round-trip-cli-fj02b.test.ts` 49, `round-trip-cli-initialize.test.ts` 91, `round-trip-cli-archive.test.ts` 107, `round-trip-cli-migration.test.ts` 110, `committed-bundle.test.ts` 4 and `migration.test.ts` 96. `cd hooks && npm test`, run after the codec suite and not beside it, collects 68 test files and 1 166 tests: 1 152 passed and 14 skipped, the opt-in observation suite without `FUSION_AGENT_RUN`. In the fresh clone, `committed-dist.test.ts` first failed its three toolchain-dependent cases because the clone had no `hooks/package-lock.json`, which is gitignored, and the test names that as an install fault and not an artefact defect. With the lockfile in place it passed 4 of 4. `git status --porcelain -- codec bin hooks` in the clone was empty after both runs.

### Requests 59 to 64, as they stand

| Request | State | Where |
|---|---|---|
| 59 | **complete** at Prior `d6abeb8`, for `f9ecae78`; request 63 below re-asks it at `dd4bf3d4` | `Prior: docs/design/fusion-fj04-correction-prior-response.md` `## 59: shared fixtures` |
| 60 | **complete** at `d6abeb8`; `c76bbce9…` qualified; request 64 below re-asks it with `fb170361…` | the same document, `## 60: runtime qualification` |
| 61 | **answered Yes** at Prior `7da6690` | `Prior: docs/design/fusion-fj03d-prior-response.md` |
| 62 | **accepted with corrections** at Prior `f32bf4a` (the bytes read above at `sha256:f1fc4de6…`) | `Prior: docs/design/fusion-claim-takeover-prior-response.md` |
| 63 | **asked** below | this section |
| 64 | **asked** below | this section |

### 63. Re-snapshot the shared fixture set at `dd4bf3d4` and re-run the Go harness

**Closes:** `Prior: tests/testdata/fusion-codec/UPSTREAM.json`, today fusion `f9ecae78`, 390 files: its `commit` to `dd4bf3d4`, the six paths above, and the 23 new fixtures, so the pin holds 413 files. `REQUESTS.md` with this section stands at the commit that appends it, after `dd4bf3d4`, and pinning it there is Prior's choice, as at requests 44 and 60. Preferred form: the re-snapshot and the test run in the Prior repository, plus a reply with the counts at a Prior commit.

`TestFusionCodecSharedManifest` should pass 370 of the 370 manifest entries, 91 valid and 279 invalid (278 `schema-invalid`, 1 `unsupported-format`):

| Schema | Valid / invalid | At `f9ecae78` |
|---|---|---|
| protocol | 31 / 62 | 30 / 54 |
| package | 15 / 43 | 11 / 36 |
| record | 19 / 48 | 19 / 47 |
| campaign | 4 / 22 | 4 / 21 |
| evidence | 3 / 19 | 3 / 18 |
| migration-plan, migration-proposal, migration-receipt, workbench, workbench/v2, bytes | unchanged: 11 / 37, 3 / 16, 1 / 8, 4 / 15, 0 / 1, 0 / 8 | |

`TestFusionAppliedRulingAndGoldens` should pass unchanged. `codec/contract/` and the 13 goldens did not move: an ordinary `claim` still refuses `claimed` to `claimed`, and the takeover is the separately specified holder-replacement branch, as Prior's answer to 62 part 10 says. A differing count is a finding to report, not something to reconcile by editing either side.

### 64. Re-pin the bundle `fb170361…`, replay every recorded session through its deltas, the takeover session included, re-qualify the kernel, with Prior's conformance run

**Closes:** in `Prior: tests/testdata/fusion-fj01/UPSTREAM.json`, `commit` (to `dd4bf3d4`), `bundle_digest` (to `sha256:fb1703619c94bd2ed6ef8b753e70dd38e36dcb26da0775fb4e19274ed11bb66f`), the entries for the two paths above, and the takeover session's 104 files, in this pin or in a pin of their own, as Prior chooses. In `Prior: tests/testdata/fusion-codec/UPSTREAM.json`, request 63's re-snapshot. `codecBundleDigest` in `Prior: internal/fusionhost/codec_process_test.go` (line 22 at `f32bf4a`). `REQUESTS.md` as request 63 states. Preferred form: the re-pin, the runs below in the Prior repository, and a reply at a Prior commit saying they are green against `sha256:fb1703619c94bd2ed6ef8b753e70dd38e36dcb26da0775fb4e19274ed11bb66f`.

What it asks Prior to run, and what fusion asserts at `dd4bf3d4`:

- **Every older session, as at request 60.** The six FJ01 pairs and the handback (18 and 6 green); the FJ02 and FJ02b exchanges (39 and 49); the twenty-six `initialize` exchanges (91); the fifty-one archive exchanges (107); the seventy migration exchanges (110), each through the delta files request 60 names. No recorded exchange and no delta file changed since `f9ecae78`, so Prior's replay preparation applies as it stands.
- **The thirty-seven takeover exchanges, byte for byte** (59 green), per the session README, with the one substitution `<workbench>`.
- **The kernel.** `kernel.ts`, the journal and the store are byte-unchanged since `f9ecae78`, so the five items of request 60 stand as qualified. What is new is one mutation plan, `takeoverPlan` in `codec/src/cli/ops.ts`, inside the existing sequence: check 1 in `dispatch`, then sweep and recovery, the replay lookup and the maintenance fence, then checks 2 to 10 in the order Prior fixed, CAS before the holder comparison, with no fallback to an ordinary claim. `kernel.test.ts` adds the recovery of a committed takeover intent at every cut: one claim replacement and one history entry, and the replay bytes unchanged. Prior's existing recovery and replay tests run unchanged over exchanges that did not move.
- **The version boundary** above: Prior may run `c76bbce9…` over the workbench exchange `37` leaves and observe the same refusals and the unmoved tree.
- **The shared manifest** as request 63 states it.
- **Prior's conformance run:** `go test ./...` and `go vet ./...` green.

The re-pin should change the digest, the two moved pin entries, the takeover replay added, and nothing else in Prior's assertions. If Prior's replay differs anywhere else, the differing exchange and its stdout are the finding. Prior's answer to 62 part 10 notes that "the codec conformance harness may exercise the branch without advertising production host support". That is what 64 asks.

If Prior does not qualify `fb170361…`, or asks for a codec byte to change, fusion's FJ05 run stops at step 10, and steps 5 to 10 are re-planned. 13.0.0 is not tagged without the takeover.

### The hand-over point: Prior's host binding of the takeover

**This is Prior's work, and it gates no fusion release.** The Claude route works with Claude Code alone, through the shipped bundle, `bin/fusion-record` and `bin/fusion-write`, with no Prior installation, binary, service or variable. Prior's answer to 62 says the same: "Prior host implementation is separate and does not block standalone Fusion's release." What fusion hands over at this point, in Prior's own terms:

- **Authority.** Source resolution is evidence validation, never authorisation (part 2b). Prior's administrative authority, revocation and generation checks, and the quiescing of a Prior worker are Prior's obligations (part 8). Prior owns its authority tests (part 9).
- **Blocking the branch until then.** "Until qualified, Prior must explicitly reject the takeover branch through its ordinary workbench service, including `prior fusion call`/`resume`. That rejection must accompany any production pin upgrade" (part 10). So the re-pin of 64 carries that rejection with it, and the conformance harness exercises the branch without advertising host support. Lifting the rejection later takes "authority, revocation/generation, quiescence, exact-request recovery and event-projection tests, rather than merely lifting the refusal after a digest update".
- **The event projection.** Prior's projection copies only `from` and `to` for `claim` today. Adding `previous_checkout_id` and `checkout_id` is "part of Prior's host work before enabling takeover" (part 4).
- **Archive retention is a contract, not a shipped Prior command.** Part 6 of the addendum said "Prior's host applies the same rule". Prior's answer to 62 part 6c corrects that: it "describes the required contract, not a shipped Prior archive command: the ordinary Prior workbench service does not expose maintenance/archive operations." The contract fusion's host implements is the conservative hold of part 6b: `targetsOf` in `hooks/lib/record-archive.ts` reads the source pointer of unresolved, ambiguous and foreign references and holds matching local ids or paths, transfer-source sites included, and an unreadable record holds all candidates. `record-archive.test.ts` covers a resolved source, an unresolved but present source, and a package and its consent decision moving together (`e34642a6`). No archive exemption was added.
- **The version boundary in Prior's install procedure.** No old and new codec on one workbench; replace or quiesce active clients before the first takeover; settle pending work with the version that wrote it (part 7).

### Corrections, by line

- **Line 2878**, part 7 point 1: "Both readers that predate the field … meet `claim_transfers` under a closed `$defs/provenance` and answer `schema-invalid` for that package alone. That is read from the closed definition, not run." Measured, it holds for `validate` and every mutation, not for reading. `show` of the old bundle returns the transferred package as stored, and an unscoped `validate` answers with findings for exactly the transferred packages (`### The version boundary, measured`, above). Point 1's conclusion, that an older reader fails closed and needs no `required_features` value, stands with that boundary.
- **Line 2982**, "It is uncommitted in Prior's working tree at HEAD `7da6690` … So no Prior commit can be named here." True when written. Prior committed the same bytes at `f32bf4a` (`### Prior's answer to 62, now at a Prior commit`, above). **Line 3035**'s condition is met: this section names that commit, and the hash equals `f1fc4de6…`, so the answer was not re-read. **Line 3045**, the 62 row, reads "accepted with corrections" at `f32bf4a`.
- **Line 2859**, "the client prints the previous claim beside `expected_revision` and `claimed_at`, and the re-send repeats the request it printed". As built, the print is `previous_claim=` on stdout and the re-send's flag is `--previous-claim <JSON>` (`### The Claude route, as built`, above).
- **Line 2931**, "The new digest and byte size are stated in the conformance hand-over (requests 63 and 64)". They are stated at the head of this section.
