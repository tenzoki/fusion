# Session: Steps 2 and 3 of the five-guard-defects plan — the two argument forms the branch classifier did not know

**Date:** 2026-08-09 15:52
**Agent:** coder
**Status:** Complete

## What was asked

Implement Steps 2 and 3 of `260809-1229_*_plan-five-severe-guard-defects.md`, closing `260809-1105_*_a-trailing-separator-lifts-the-branch-deny-so-git-checkout-b-name-runs.md` (a trailing `--` lifts the branch deny) and `260809-1106_*_the-unknown-global-option-fix-was-deleted-with-the-mutation-classifier-and-the-branch-guard-never-had-it.md` (an unrecognised global option's separated value hides the subcommand). Both live in `hooks/lib/git-branch-guard.ts`, in two different functions, and the plan's Approach is explicit that they share a safety property but no code, so they are two steps rather than one.

Constraints carried by the dispatch: never type a bypass form into a shell in this repository (the defects mean it would run and move fusion's own HEAD), keep fail-closed as the direction and name any new false denies, open nothing, leave `hooks/lib/protected-snapshot.ts` and `hooks/tracker.ts` to the parallel `coder`, do not commit, and take the recorded remedy for `260809-1106_*_the-unknown-global-option-fix-was-deleted-with-the-mutation-classifier-and-the-branch-guard-never-had-it.md` from the closed sibling records rather than re-deriving one.

## What was done

### Step 2 — the flag scan moves above the separator check

`classifyCheckout` returned allow the moment a `--` appeared anywhere in the argument list, and looked at `-b` / `-B` / `--detach` / `--orphan` / `-` only afterwards. Two characters therefore lifted the policy's primary case. The five-flag scan now runs first; the separator check follows unchanged.

The docblock was rewritten to state the invariant both steps rest on — evidence that HEAD moves is unconditional, no later token withdraws it and no earlier token may hide it — and the module header's claim that the separator is "the primary, unambiguous discriminator" was corrected, since that sentence is exactly the reading the defect came from.

### Step 3 — the global-option walk resumes

The walk in `classifySegment` consumed the value of the four options it knows and treated every other `-`-prefixed token as valueless, so an option taking a separated value left that value standing in subcommand position, where it matched none of the three rows and the call allowed.

The remedy is `260804-1344_*_the-git-option-walk-stops-at-an-unknown-options-value-so-a-c-behind-it-is-invisible.md`'s, ported rather than invented. The deleted `resolveGit` in `hooks/lib/bash-mutation-guard.ts` was read out of `ba7ccda^` and its structure carried over: a bare word is tested against a new `BRANCH_SUBCOMMANDS` set; a match ends the walk; no match with an unrecognised option in front means the word is that option's value and the walk continues from the next index, recording any `-C` and `--work-tree` it then meets; no match with no unrecognised option in front means the word is git's real subcommand and the walk stops, which keeps it out of the subcommand's own arguments where `-C` means something else (`git commit -C HEAD~1`).

The docblock carries the ported reasoning, both sibling record names, the class bound (`260804-1344_*_the-git-option-walk-stops-at-an-unknown-options-value-so-a-c-behind-it-is-invisible.md`'s wording: closed for options taking at most one separated value; not closed and not claimed for two separated values or a second bare word between value and subcommand), and the one respect in which the fix behaves differently in its new home — three subcommand rows against the mutation classifier's many, so a smaller false-deny surface.

### What was NOT done, and why

`260809-1106_*_the-unknown-global-option-fix-was-deleted-with-the-mutation-classifier-and-the-branch-guard-never-had-it.md`'s and `260809-1105_*_a-trailing-separator-lifts-the-branch-deny-so-git-checkout-b-name-runs.md`'s acceptance criteria include rule text in `rules/git-branch-discipline.md`. That is Step 6 of the plan, bundled there deliberately so it collides once with the concurrent rules-file work instead of three times. Both issues therefore stay `_o_`, as the plan states.

## Verification

Nothing was run by hand. Every verdict comes from the classifier, and every real-git effect from a throwaway repository the harness builds outside this repository.

**Red before, green after.** With `hooks/lib/git-branch-guard.ts` swapped back to its `451a07e` content and the new cases left in place:

| Suite | Red at `451a07e` |
|---|---|
| `git-branch-guard.test.ts` | 9 of the new cases fail (5 in the trailing-separator block, 3 in the unrecognised-option block, 1 corpus anti-vacuity case) |
| `guard-bash-integration.test.ts` | the 4 verdict rows fail; the 8 real-git effect rows and the revert control pass |

The effect rows passing on both sides is the point: they assert that `git checkout -b bar --`, `git checkout -B bar --`, `git --namespace ns switch other` and `git --attr-source HEAD switch t1` really do move HEAD, in `bash` and `zsh`, against git 2.49.0. A deny asserted against a command that turns out to be a no-op proves nothing, and at `451a07e` all four both allowed and moved HEAD.

**One test names the sibling records.** `describe("an unrecognised global option no longer hides the subcommand (260804-1333_*_an-unrecognised-git-global-option-swallows-the-subcommand-and-the-invocation-reads-as-an-unrecognised-program.md, 260804-1344_*_the-git-option-walk-stops-at-an-unknown-options-value-so-a-c-behind-it-is-invisible.md)")`, with the loss itself written into the block comment: two modules had the identical eight lines, the fix went to one of them, nothing pinned the other, and v6.0.0 deleted the one that had it. That is `260809-1106_*_the-unknown-global-option-fix-was-deleted-with-the-mutation-classifier-and-the-branch-guard-never-had-it.md`'s own acceptance criterion, and the only mechanism that would surface a shared fix the next time one of two classifiers is retired.

**The bounded no-new-allow corpus**, in place of the 181,115-command cross-product that went with the mutation classifier. `lib/__tests__/helpers/git-corpus.ts` builds 108 commands (9 global-option forms × 12 subcommand tails) and classifies each under all four override combinations, with and without a resolver — 864 verdicts. `lib/__tests__/fixtures/git-corpus-451a07e.json` holds one deny bit per verdict, generated against the unmodified classifier before either edit, so the comparison is a real before/after.

**A correction to the plan's wording, stated rather than silently followed.** Step 3 asks the corpus to assert that "every command allowed at HEAD `451a07e` is still allowed". That is the inverse of the property the fix has, and it contradicts the same step's own acceptance criteria — `git --namespace ns switch main` allowed at `451a07e` and must deny now. The property implemented is the one `260804-1344_*_the-git-option-walk-stops-at-an-unknown-options-value-so-a-c-behind-it-is-invisible.md` measured and the one the structural argument supports: **every verdict that DENIED at the baseline still denies**, checked in that direction only. Its anti-vacuity is asserted from both sides — the corpus must hold more than 100 baseline denies, and at least one verdict must have moved, every mover in the denying direction.

**The false-deny surface, measured rather than argued.** A 1143-command sweep (17 global-option forms × 67 tails, covering everyday agent git work) classified under both versions:

- **newly allowed: 0.**
- newly denied: 145, of which 135 are `checkout`/`switch`/`worktree add` forms that move HEAD and were the defect.

The remaining 10 are the accepted cost, and one of them is realistic enough to name in the report and in `rules/git-branch-discipline.md` at Step 6:

```
git --no-pager grep switch          now DENIES (was allow)
git --exec-path=/x grep switch      now DENIES (was allow)
git --paginate grep worktree add    now DENIES (was allow)
git grep switch                     still allows  (the bound)
```

The shape is `git <unknown-option> <non-subcommand> <switch|worktree|checkout>` — the same rule `260804-1333_*_an-unrecognised-git-global-option-swallows-the-subcommand-and-the-invocation-reads-as-an-unrecognised-program.md` settled on, one word wider because the walk resumes. `git --no-pager grep switch` is the only one an agent would plausibly type: searching the tree for the word "switch" with the pager off. Pinned in the suite as a stated cost with an open example set, and the bound pinned alongside it.

**A refinement considered and not taken.** An unrecognised option written with an attached value (`--exec-path=/x`) cannot also consume the next word, so skipping the `unknownOption` flag for any token containing `=` would remove three of the ten false denies at no cost in allows. It is not in the plan and not in the recorded remedy, and adding an unmeasured case split to a security control as a side effect of a bug fix is the shape `rules/critical-stance.md` §2 warns about. Named here so it can be taken up on its own merits.

**Full suite:** `npm test` in `hooks/` — 33 test files, 1067 tests, 0 failures, 79 s. The baseline was 33 files / 1030 tests; 30 of the 37 additional tests are mine and 7 belong to the parallel `coder` in `protected-snapshot.ts`, whose edits were in the tree during the run. No existing test was edited: `git-branch-guard.test.ts` gained one import and three describe blocks, `guard-bash-integration.test.ts` gained two helpers and one describe block. The gold-file compatibility check (`git-verdicts-head.json`, 98 rows × 4 override combinations) reproduces every recorded verdict byte for byte, so nothing in the established surface moved.

## Files changed

- `hooks/lib/git-branch-guard.ts` — `classifyCheckout` reorder, `classifySegment` resumed walk, new `BRANCH_SUBCOMMANDS`, three docblocks rewritten
- `hooks/lib/__tests__/git-branch-guard.test.ts` — three new describe blocks (17 cases), one new import
- `hooks/lib/__tests__/guard-bash-integration.test.ts` — one new describe block (13 cases), `addBranches` and `currentBranch` helpers
- `hooks/lib/__tests__/helpers/git-corpus.ts` — new
- `hooks/lib/__tests__/fixtures/git-corpus-451a07e.json` — new
- `260809-1229_*_plan-five-severe-guard-defects.md` — Steps 2 and 3 marked `[DONE]`

`hooks/dist/` was rebuilt by `npm test` (it runs `npm run build` first) and carries the parallel coder's compiled output as well as mine.

## Open for the orchestrator

- `260809-1105_*_a-trailing-separator-lifts-the-branch-deny-so-git-checkout-b-name-runs.md` and `260809-1106_*_the-unknown-global-option-fix-was-deleted-with-the-mutation-classifier-and-the-branch-guard-never-had-it.md` stay `_o_`: their rule-text criteria belong to Step 6.
- The plan's Step 3 corpus wording should be corrected to the direction actually implemented, or a reader will later take the file to be checking something it is not.
- Not committed, per the dispatch.
