# Closing review: request 82, the record of 81 question 1, and Select's fourth name

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `7469e742..ed472e4b`
**Not-opened:** `fusion-workbench/orchestrator-events.jsonl`, `fusion-workbench/shared/consultations/261114-0713-fusion-prior-two-strands-towards-an-open-weight-run.md`, `fusion-workbench/work-packages/261114-1550-request-82-the-candidate-13-5-0-prepared-for-prior/analyses/261114-1704-request-82-delta-for-a-prior-run-and-campaign-material.md`, `fusion-workbench/work-packages/261114-1550-request-82-the-candidate-13-5-0-prepared-for-prior/analyses/261114-1711-request-82-hook-rows-on-the-13-5-0-payload.md`, `fusion-workbench/work-packages/261114-1550-request-82-the-candidate-13-5-0-prepared-for-prior/discussions/261114-1608-which-commit-request-82-candidate-built-from.md`, `fusion-workbench/work-packages/261114-1550-request-82-the-candidate-13-5-0-prepared-for-prior/discussions/261114-1608-which-commit-request-82-candidate-built-from.record.json`
**Review domain:** code
**Work package:** `261114-1550-request-82-the-candidate-13-5-0-prepared-for-prior.md`

## Summary

The Go change of `2fe7baba` copies Prior's `entryControlRecord` at `bf6bb42` exactly, its header's reasoning holds, and its tests are tight. Both appended sections of `REQUESTS.md` are insertions only with intact prefix hashes, and every figure spot-checked against the delivered bundle, the repository and Prior's committed objects matches. Two statements in the appended text are wrong: a test-row count and a stale "Select still names three" line. Both are fixed by one appended correction passage, not by a rebuild.

## Totals

Critical 0, High 0, Medium 0, Low 2.

## Verification run

- `TMPDIR=/Users/kai/.fusion-tmp/114caf11/review-82/tmp PRIOR_REPO=/projects/productive/F09-Prior adapters/prior/stage.sh test`: every package `ok`, `internal/controlrecord` among them; Prior clone at `08c57fb4…`.
- `cd catalog && npx vitest run src/__tests__/prior-commands.test.ts`: 53 of 53 passed.

## The Go copy, `2fe7baba`

**Exactness against Prior `bf6bb42`.** `git show bf6bb42:internal/fusionhost/entry_workspace.go`, function at line 296, comment from line 288, return at line 311. The fourth-name clause `name == "campaign.json"` is the only change to the function between `52a2703` and `bf6bb42` (`git diff 52a2703 bf6bb42 -- internal/fusionhost/entry_workspace.go`), and `controlrecord.go:56` adds the same bare-name test. Dot-segment refusal and first-segment `archive` refusal are the same loops in both. The prefix check differs in form, not in effect: Prior's `api.EntryRelativePath` (`moduleapi/v1/entry_service_wire.go:240`) plus `assetPath` (`internal/fusionhost/external_catalog.go:138`) reject `.`, `\x00\t\r\n`, `\\` and `:`; fusion's `fs.ValidPath` plus `ContainsAny("\\:\x00\t\r\n")` rejects the same set, and `.` falls to the dot-segment loop. That part predates the range and is unchanged.

**The header's reasoning.** `codecShaped` (`internal/qualification/fusionsurface/classify.go`, lines 203 to 206 at `bf6bb42`) takes `campaign.json` only as `campaigns/<id>/campaign.json`, and takes `package.json` only under `work-packages/` too, so fusion already followed the entry check rather than `codecShaped` for `package.json`; following it for the fourth name is consistent. The claim that the codec's `isControlFile` names four is true (`codec/src/store.ts:460`).

**Test rows.** Selected: the canonical path, depth one under `campaigns/`, and a deeper path. Refused: root `archive/`, a dot directory, a dot store, a dot file, `.bak`, `campaigns.json`, `x.campaign.json` (separates exact name from suffix match) and `campaign.JSON` (case). The rows pin every branch the clause can take. Prior's own rows at `bf6bb42` (`internal/fusionhost/entry_services_test.go:458`, `:459`, `:462`) are a subset.

## The appended sections of `REQUESTS.md`

**Append-only.** `git diff --numstat 7469e742 HEAD` prints `453 0`; `7469e742..c8241452` `128 0`, `c8241452..f7c6f14e` `325 0`. The first 1 484 219 bytes at `ed472e4b` hash to `5346572d…02f5`, the file at `7469e742`; the first 1 509 933 bytes at `f7c6f14e` hash to `0a90b2e8…b939`, the file at `c8241452`.

**Figures checked and equal.** On the delivered directory: sidecar `OK`; tarball 29 156 352 bytes, `85393802…dfc`; sidecar `60a10c62…`; `handover.json` 2 403 bytes, `b88896a0…`; 1 684 entries, 37 at `r-x` and 1 647 at `r--`; `module.json` `13.5.0` with 59 `data`; `build-identity.json` `fusion_revision` `60639346…` without `+dirty`, `prior_revision` `08c57fb4…`; codec `36570a7c…`; tarball `REQUESTS.md` 7 997 lines, 1 359 919 bytes, `8ece771d…`; `hooks/hooks.json` `d7f4d7ab…`; `catalog.json` `21aa3a5e…`; the three binaries' sha256; 50 profile files; `skill-help.md:97` the stale sentence. In the repository: catalog at `v13.5.0` 28 entries, 24 Prior-supported, `commit`, `cleanup`, `migrate`, `campaign` unsupported; `git diff --numstat v13.5.0 f7b3b5fe -- adapters codec` the eight rows of the table at `### Where main differs from the candidate`; `PRIOR_PIN` unchanged against the tag. In Prior: the response at `7dbcf57` 593 lines, 60 765 bytes, `886118c5…`, first 314 lines `f622b226…`; `workbench.go:22` the qualified digest; `fusion-fj01/UPSTREAM.json:48` `e21ef887…`.

**Against the answered decisions.** `261114-1554-…` (option 1) requires three statements; request 82 carries them as points 1 to 3 of `### Where main differs from the candidate`. `261114-1651-…` (option 1) is quoted in `### What fusion does with the answer`, and the recommendation's contingency, the marketplace entry reading `13.5.0`, is measured there.

### Finding 1 (Low): ten test rows stated, eleven added

Request 82 point 2 of `### Where main differs from the candidate` says `controlrecord_test.go` "gains ten rows, three selected and seven refused". `2fe7baba` adds eleven: three selected, eight refused (`grep -c '^+\s*{"fusion-workbench'` over the commit's test diff prints `11`). The figure is copied from the commit message, which has the same error. Labelled "read", so Prior can check and will find it wrong. Issue: `261114-2106-request-82-counts-ten-select-test-rows-where-2fe7baba-adds-eleven.md`.

### Finding 2 (Low): the question 1 section says Select still has three names

`### Prior's answer to question 1 of 81 at bf6bb42`, `#### What is open on fusion's side`, first bullet, says `Select` "still names three control-file names" at `HEAD` line 45. The section was measured at `5f7d962c` and committed as `c8241452`, after `2fe7baba` (17:43) had added the fourth name. The plan ordered step 5 before step 6; they landed reversed, and the section was not re-measured at its parent. Its legend calling `5f7d962c` "the head of `main`" was also stale at commit. Request 82 states the opposite correctly, so the log now holds two readings of one fact with no passage tying them. Issue: `261114-2106-the-81-question-1-section-states-select-has-three-names-at-a-commit-where-it-has-four.md`.

## Cross-cutting observations

- Both findings come from one cause: text written against an earlier commit was committed after the tree moved, and the step's acceptance did not re-measure the moving value at the parent. Request 82 did re-measure at `f7b3b5fe` and is right on the same fact; the question 1 section did not. The row count is copied from a commit message rather than measured.
- The two decision records stand at `implemented` in the working tree only. `git status` shows both `.md` and `.record.json` modified and uncommitted, and request 82 itself records that the `1651` answer was uncommitted at its parent. Not a defect of the reviewed commits; the bookkeeping commit is still owed.

## Against the plan's `## Where this work stops`

Met where checkable: request 82 is on `main` and on `origin/main` (`git ls-remote` prints `ed472e4b`), names `bf6bb42`; filed after the question 1 section and `2fe7baba`; the `QualifiedCodecDigest` condition holds; the bundle is the tag's tree; insertions only with intact prefix hashes; `PRIOR_PIN` unchanged; no tag points at `HEAD`. Not checkable from the tree: that the user was told the commit and sha256, and that nothing was written in Prior's repository (Prior's working tree was not read, as instructed).

## Recommended sequencing

Neither finding touches the bundle, the digest or the Go code. Both close with one correction passage appended after request 82, as its own `### What fusion does with the answer` provides, ideally before Prior answers 82. The passage moves the file's digest once more, and that is reported to the user as before.
