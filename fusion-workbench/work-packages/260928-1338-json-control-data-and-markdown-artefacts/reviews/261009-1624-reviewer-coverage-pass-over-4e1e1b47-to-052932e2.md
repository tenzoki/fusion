# Review: coverage pass over `4e1e1b47..052932e2`, ahead of FJ05 step 13

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `4e1e1b47..052932e2`
**Not-opened:** none

What the Not-opened line covers:
- `a563ff6a` lies inside the range and was reviewed by G-C (`261009-1519-reviewer-g-c-review-of-the-step-12-fix-commit.md`). It was not re-reviewed here. Its effect on the G-B issue records was read: three are `closed`/`fixed` with a `Resolved:` line each.
- `fusion-workbench/orchestrator-events.jsonl` was read as the rows each of the three commits appends, not as a whole file.
- The G-B and G-C review bodies were read for their headers, verdicts and issue counts. Their findings on code were not re-derived.

**Review domain:** code (the dispatch's; the range carries one fixture-text file and workbench records)
**Work-item:** 260928-1338-json-control-data-and-markdown-artefacts
**Plan:** 261009-1021-plan-fj05-release-acceptance-of-13-0-0-with-the-claim-takeover.md (coverage ahead of step 13)

## Summary

Verdict: **accept**. `REQUESTS.md` is a pure append, and every figure and digest in it was checked against fusion's tree and Prior's commit `34a2710`. All of them match. The workbench records agree with their narratives. Two findings concern the plan text, not the range's content: step 13's coverage acceptance cannot hold as written (medium), and the axibra ruling is missing from step 20's precondition list (low). Neither touches a shipped byte.

## Totals

Critical 0 / High 0 / Medium 1 / Low 1.

## `codec/fixtures/prior/REQUESTS.md` in `052932e2`

**Pure append, verified.** `git diff --numstat 4e1e1b47 052932e2` gives 81 added and 0 deleted lines. The first 629 572 bytes of the file at `052932e2` are byte-equal (`cmp`) to the whole file at `4e1e1b47`. The appended section equals the analyst draft `261009-1619-fj05-step10-prior-answer-to-63-64-draft.md` verbatim, apart from the trailing newline, as the commit message says.

**Figures and digests, each checked:**

| Claim in the section | Checked by | Result |
|---|---|---|
| bundle `fb170361…`, 699 011 bytes | `shasum -a 256` and `wc -c` on `codec/dist/fusion-record.js` (working tree), `git show <r>:…` at `00e465f6`, `073ae793`, `052932e2` | equal |
| last bundle change `00e465f6` | `git log -1 -- codec/dist/fusion-record.js` | equal |
| `git diff --stat dd4bf3d4 073ae793 -- codec bin`: one file, 202 added | the same command | equal |
| `REQUESTS.md` at `dd4bf3d4`: 3 045 lines, `44cad87d…`; at `4e1e1b47` and `073ae793`: 3 247 lines, `e0dddcd7…` | `git show … \| wc -l`, `shasum` | equal |
| `073ae793` 15:20; 22 ahead of `origin/fj-json-workbench` | `git log -1`, `git rev-list --count` | equal |
| Prior `34a2710`: 16:13, the subject, parent `f32bf4a`, head of `main` | `git log -1 --format='%h %ci %P %s'`, `git rev-parse --short main` | equal |
| `git log --all --oneline f32bf4a..` names `34a2710` and `88b2e6c` on `review/fj04-candidate-524fdfad` | the same, plus `git branch -a --contains 88b2e6c` | equal |
| Prior's answer: 5 822 bytes, `1c5f9805…` | `git show 34a2710:<path> \| wc -c`, `\| shasum -a 256` | equal |
| `codecBundleDigest`, `codec_process_test.go` line 22; `QualifiedCodecDigest` in `workbench.go`, was `c76bbce9…` | `git show 34a2710:…` and `f32bf4a:…` | equal |
| pins: `fusion-codec` 413 entries (390 at `f32bf4a`, commit `f9ecae78`); `fusion-fj01` 715 (611), `bundle_digest` `fb170361…`; both `commit` `dd4bf3d4…` | Python over both `UPSTREAM.json` at `34a2710` and `f32bf4a` | equal |
| "Of 413 … one differs, `REQUESTS.md`. Of 715 … one differs" | every pinned entry hashed against `git show 073ae793:<path>` and again against `052932e2` | equal at both: `REQUESTS.md` alone; the bundle matches |
| every quotation attributed to Prior | read against the full answer at `34a2710` | verbatim; the paraphrases are not in quotation marks |
| cited Prior headings (`## 59: shared fixtures`, `## 60: runtime qualification`, `## 63 — Shared schemas and fixtures`, `## 64 — Runtime snapshot and replay`) and the 61 and 62 documents | `git show 34a2710:…`, grep | present |
| `### Requests 59 to 64, as they stand` "above" | grep in the file | line 3187 |
| per-test counts 18, 39, 49, 91, 107, 110 and 59 | lines 2556 and 3185 of the file | equal |

The section's forward claim, "At C, both pins should differ from fusion in `REQUESTS.md` alone", holds at `052932e2` as measured above.

Step 10's acceptance (plan lines 363-365) is met: Prior's qualified digest equals step 6's, and Prior asks for no codec byte to change.

## Workbench records

- **`95fecad4`.** Four issue records are created at `open`, with one `create` event each, then the evidence record (`revise`). The `review_done` event reads "4 issues (1 medium, 3 low)", which matches the four narratives' `**Severity:**` lines and the commit message. The evidence `report.sha256` (`66c87383…`) equals the review file's bytes at `95fecad4`. The plan gains only the ruling paragraph (line 658).
- **`073ae793`.** The evidence `report.sha256` (`5ea0d551…`) equals the review file's bytes at `073ae793`. Verdict `accept`, "0 issues", matching the review. The `Also seen:` line on issue `261009-1037` is an append, and its claim matches the G-B consent issue's `Resolved:` line ("sends `transition --to answered`").
- **`052932e2`.** The plan record moves step 10 `open` → `done` and step 13 `open` → `in_progress`. Steps 1-12 are `done` and 14-23 `open` at the head. The file's sha256 equals the `revision` of the last `record_change` row (`492e9eae…`).
- **G-B issues at the head.** The consent, upgrade-limits and parser issues are `closed`/`fixed`, each with a `Resolved:` line. The version-boundary issue is `open`, with no `Resolved:` line. Control and narrative agree.
- The evidence records' `plan_revision` `02ec99b6…` is the revision pinned in `package.json` `active_documents`, not the live plan file. This is consistent with how the codec binds it (`codec/src/cli/ops.ts` 2047-2050).

## Findings

### M1. Step 13's coverage acceptance cannot hold for any single C (medium)

Plan step 13 (lines 393-413) runs `bin/fusion-review-coverage --since cd1b5522 --head C` in a scratch clone of C, and requires `verdict=covered`. `hooks/lib/review-coverage.ts` reads review files from the clone's filesystem (lines 414-428, 587) and counts every commit, including workbench-only ones. This pass's file lands in a commit R after `052932e2`:
- a clone of `052932e2` lacks it;
- `--head R` makes R itself uncovered.

Only a clone of R with `--head 052932e2` passes. That is this dispatch's command, but it does not match the plan's wording. Step 20 tags `<C>`, so the choice also decides what ships.

Issue: `261009-1624-step-13-cannot-read-covered-in-a-clone-of-c-because-the-commit-that-lands-the-last-review-is-never-covered-by-it.md`.

### L1. The axibra precondition is not in step 20's list (low)

The ruling at plan line 658 makes a successful axibra migration a precondition of step 20. Step 20's "**Preconditions**, each asked in the one approval" list does not name it.

Issue: `261009-1624-the-axibra-ruling-makes-a-migration-a-release-precondition-but-step-20-does-not-list-it.md`.

## Cross-cutting observations

Both findings have one shape: a fact settled after the plan was written (the commits that land after "the head after step 12 and G-C", and the user's ruling) sits outside the step that will execute on it. A step note on 13 and on 20 closes both.

## Recommended sequencing

M1 before step 13 runs: name C and the clone's commit. L1 before step 20's approval is asked. Neither blocks step 13's suites or the digest check.
