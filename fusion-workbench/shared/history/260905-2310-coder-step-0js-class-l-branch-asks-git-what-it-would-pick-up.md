# Step 0j's class L branch asks git what it would pick up

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Agent:** coder
**Date:** 2026-09-05 23:10
**Task:** Repair the regression loop 1 introduced into `skills/setup/SKILL.md` Step 0j, filed as
issue
`260905-2234_*_step-0js-new-unignored-branch-fires-on-a-directory-whose-contents-are-ignored-by-the-dir-star-form.md`,
and correct the counterfactual the same pass names.

## The branch

Before, in the class L loop:

```
elif [ -e "fusion-workbench/$p" ] && ! git check-ignore -q "fusion-workbench/$p"; then
```

After:

```
elif [ -n "$(git ls-files --others --exclude-standard -- "fusion-workbench/$p")" ]; then
```

`ls-files --others --exclude-standard` is the question the report already claimed to be asking:
what git would pick up under this path. It honours the same exclude sources `check-ignore` reads
(`.gitignore`, `.git/info/exclude`, the global file), so nothing about the ignore semantics
changes; what changes is that the answer is taken over the entry's **contents** as well as its own
path, which is where the `dir/*` form lives.

Two consequences beyond the fix itself, both intended:

- **The `[ -e ]` guard is gone**, because the new question needs none. `check-ignore` answers for a
  path that does not exist, so it required a guard; `ls-files --others` lists nothing for a path
  that is not there. One test removed rather than one added.
- **An empty untracked directory with no ignore rule is now silent** where the old branch printed.
  That is the correct answer: git cannot stage an empty directory, so there is nothing it would
  pick up and no departure to report. It is the one behaviour difference that is not a false
  positive being removed, and it is named here rather than left to be discovered.

## The counterfactual

The verification pass found the resolved record's counterfactual understated, and it is understated
in the other direction too. Without the existence test a fresh workbench reported **all nine**
roster entries, not "its own lock and marker directories" — and of the nine, **seven are files**
(`agentstate.yaml`, `orchestrator-live.md`, `.session-marker`, `.active-circle`, `.cadence-anchors`,
`monitor`, `portfolio.md`) and two are directories (`.commit-lock`, `.guard-state`). The
reconciliation note at `260905-2238-reconciliation.md:119` says four are files; the count is seven.
`monitor` is a copied executable, not a directory, which is what that count appears to have missed.

The sentence itself is **not in `skills/setup/SKILL.md`** and never was. It lives in the `Resolved:`
note of `260828-0853_*_setup-step-0j-misses-a-class-l-entry-that-is-untracked-but-not-ignored.md`
and in the message of commit `ea819262`, both outside this task's scope. What I did instead was
state the true version in the step's prose, where the dispatch expected to find it, so the file now
carries the corrected figure. The two out-of-scope copies stand uncorrected and are the
orchestrator's to route.

## Verification

The block was extracted verbatim from the edited file (`awk` over the fenced `bash` region of Step
0j) and run, not read. Seven scratch git roots plus two more plus this repository:

| Root | Shape | Old branch | New branch |
|---|---|---|---|
| `orig` | `.cadence-anchors`, untracked, no rule | prints | **prints** |
| `dirstar` | `.guard-state/*`, directory holds a file | prints (false) | **silent** |
| `trailslash` | `.commit-lock/`, directory holds a file | silent | **silent** |
| `tracked` | `agentstate.yaml` tracked | "is tracked" | **"is tracked"** |
| `absent` | none of the nine exist | silent | **silent** |
| `unigdir` | `.guard-state` holds a file, no rule at all | prints | **prints** |
| `emptydir` | empty `.guard-state`, no rule at all | prints | **silent** (see above) |
| `trackeddir` | `.guard-state` holds a tracked file | "is tracked" | **"is tracked"** |
| `repogitignore` | this repo's `.gitignore` verbatim, **all nine present** | prints 2 (false) | **silent** |
| this repository | as it stands | prints 1 (false) | **silent** |

`repogitignore` is the decisive one: it holds `.commit-lock/holder`, so it is this repository with a
commit in flight, and the old branch printed a departure for both directories there. In the same
root `git status --porcelain --untracked-files=all` prints nothing, which is what the new branch now
agrees with. The whole block, not only the loop, was run in every scratch root; `.gitignore` came out
unmodified in each, so the R2/R3 repair loop above the class L loop is unaffected by the change.

Ran, exit read: `cd hooks && npx vitest run lib/__tests__/workbench-citation-lint.test.ts
lib/__tests__/path-literal-lint.test.ts` — exit 0. The new defect citation resolves under the
storeless grammar and no store literal entered the skill body.

**The growth-bound fixture was not touched.** The edit adds 1017 bytes to `skills/setup/SKILL.md`
(50 954 → 51 971), so `hooks/lib/__tests__/fixtures/surface-growth.golden` will mismatch until the
orchestrator regenerates it once for the batch. No baseline number was edited.
