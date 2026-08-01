# coder — two pre-existing classifier holes closed (paren subshell, cross-class override)

**Date:** 2026-08-01 18:20
**Circle:** `circles/260801-1244-guard-bash-inspection`
**Issues:**
`issues/260801-1745_c_one-git-override-lifts-the-deny-for-the-other-git-class.md`,
`issues/260801-1610_c_paren-subshell-glues-its-parentheses-to-the-command-word-and-the-last-operand.md`
**Status:** Complete

Neither hole was introduced by this Circle. Both were found while closing adjacent ones
(plan steps 4 and 6), filed rather than fixed because each widened deny and belonged at a
gate. The gate passed.

## Hole 1 — one override lifted the deny for the other class

`classifyGitCommand` returned on the **first deny-case segment**. With an override active
for that class it returned an allow verdict there and every later segment went
unclassified, including a deny-case of the class the user had *not* authorised:

```
FUSION_ALLOW_WORKTREE=1       git worktree add ../wt f && git switch main   -> allowed
FUSION_ALLOW_BRANCH_SWITCH=1  git switch main && git worktree add ../wt f   -> allowed
```

**Fix** (`hooks/lib/git-branch-guard.ts`, `classifyGitCommand` only — no hook change): the
scan now stops at the first **un-overridden** deny-case, not the first deny-case. An
overridden segment is remembered in a local and the walk continues; the override verdict
is returned only after the segment list is exhausted with no un-overridden deny. A later
deny therefore **wins** over an earlier override — it is the more restrictive verdict and
the one the user did not waive.

The two details the issue asked the fix to settle:

1. **Which segment the override note names** when several were overridden — the first, as
   before.
2. **Both classes overridden in one command** — allows, and should: each op was granted
   explicitly.

**The verdict shape is unchanged, deliberately.** `guard.ts` reads `verdict.deny`,
`verdict.overrideUsed` and `verdict.overrideKind`, and since step 6 it runs the mutation
check on the override-allowed route too. `overrideUsed` still means *"a normally-denied op
was ALLOWED"*, so it is set only on the allow return. A deny verdict does not carry it even
when an earlier segment was overridden — on that call nothing was let through, and
`guard.ts` step 3 would otherwise write an override-used note for a blocked command. (It
would not, in fact: step 1 returns on `deny`. But the field would have become a lie, and
the note is the only surface that tells a user their override was exercised.)

## Hole 2 — a `(…)` subshell hid its command word and its last operand

`(rm rules/x.md)` tokenized to `["(rm", "rules/x.md)"]`. `(rm` is not a recognised verb and
`rules/x.md)` is not the operand — a one-character bypass of the whole verb table. The git
classifier had the same hole (`(git switch main)` → command word `(git`), and older.

**Fix location: `hooks/lib/shell-parse.ts` `tokenize`.** The issue offered a narrow fix in
`bash-mutation-guard.ts` and a broad one in `scanSegments`. This is the parser half
(option 2's *location*) with the tokenizer's mechanism (option 1's *cheapness*), and it was
chosen over both:

- **Not in either classifier.** Both had the hole and both consume this tokenizer. One
  change closes both; two changes would have drifted.
- **Not in `scanSegments`.** Teaching the segmenter that `(` opens a subshell would change
  segment *text* — and with it blank mode, the 84-case git suite's segmentation, the
  blank-mode equivalence assertion, and the step-4 paren counter's input. It would also not
  have fixed the git classifier, which runs on the *flat* `extractCommandSegments`, so that
  segmenter would have had to change too, forfeiting its "provably behaviour-neutral"
  property.

Stripping in `tokenize` leaves segment text byte-identical, so **the two fixes do not
interact and neither disturbs step 4**: `parenCounts` reads `segment.text`, not the tokens,
and still sees every parenthesis it has to balance. `(cd rules && ls) && rm x.md` still
allows.

Two carve-outs in the strip:

- **The `$(…)` filler is exempt.** Its balanced pair is not shell grammar (its own docstring
  says so, and `parenCounts` already removes it for the same reason). Peeling it changes no
  verdict — the token stays unresolved either way — but would put an unbalanced `$(…` in
  front of a human in the deny reason. The peel stops at the filler's close, so
  `(echo $(pwd))` sheds the real subshell's paren and keeps the substitution's.
- **A word that was nothing but parentheses disappears.** That is what the spaced form
  `( rm x )` should leave behind; today the trailing `)` was reaching `rm` as a positional.

The now-redundant `^\(+` strip in `applyDirEffect` was removed and its comment rewritten to
point at the tokenizer. `GRAMMAR_PREFIXES`'s `(` entry is left as a backstop.

## Verdicts that changed

Every one is a **widening of deny**, and each is the hole itself:

| Command | Old | New | Why the new one is correct |
|---|---|---|---|
| `FUSION_ALLOW_WORKTREE=1` + `git worktree add … && git switch main` | allow | **deny** (`branch-switch`) | The branch switch was never authorised; only worktrees were. |
| `FUSION_ALLOW_BRANCH_SWITCH=1` + `git switch main && git worktree add …` | allow | **deny** (`worktree-add`) | Mirror image. Least privilege is the whole point of two variables. |
| `(rm rules/x.md)`, `(rm rules/x.md )` | allow | **deny** | `rm rules/x.md` runs. The parenthesis is grammar, not part of the verb. |
| `(git switch main)` | allow | **deny** | Same, one classifier down. |
| `(cd hooks && rm config.json)` | allow | **deny** | The operand was `config.json)`, which missed the non-glob pattern `hooks/config.json` outright. |

Only one existing assertion was adjusted: the `bash-mutation-guard.test.ts` describe block
*"virtual cwd — the residuals, asserted so they stay visible"* pinned `(rm rules/x.md)` and
`(rm rules/x.md )` as **allowing**, citing this issue and stating that fixing it should make
those cases fail. It did; they were replaced by a block asserting the deny. Its third case,
`( rm rules/x.md )`, denied before and denies now. No other assertion in either suite moved.

## Verification

- `npm test` in `hooks/` — **green**. 656 tests across 16 files (the run includes the
  concurrent integration harness; the classifier suites went 613 → 631 on their own,
  +18 cases).
- `npx tsc --noEmit` — clean.
- **The 72-command must-never-deny corpus passes in full**, `(cd hooks && rm -rf dist)`
  included.
- Acceptance matrix probed directly against source with `tsx`, not inferred: both orders
  under each single override deny; both orders under both overrides allow with the note;
  `git switch main` alone still allows under `FUSION_ALLOW_BRANCH_SWITCH` and still emits
  its advisory (pinned end-to-end by `guard-bash-wiring.test.ts`); `(cd /tmp && rm -rf x)`
  allows.

## Residual left standing

A backslash-escaped closing paren in a filename (`rm x\)`) loses the paren here. It can only
ever SHORTEN a word, and a shorter word cannot match a protected pattern a longer one did
not, so it costs no allow and buys no false deny — but the classifier still processes no
backslash escape anywhere, and this is one more place where that shows. Documented in the
`stripSubshellParens` docstring rather than handled, because a half-correct lookbehind here
would be the only escape-aware code in the module.

## Files changed

- `hooks/lib/shell-parse.ts` — `stripSubshellParens` (new), `tokenize`
- `hooks/lib/git-branch-guard.ts` — `classifyGitCommand`
- `hooks/lib/bash-mutation-guard.ts` — `applyDirEffect` (redundant strip removed)
- `hooks/lib/__tests__/git-branch-guard.test.ts` — 2 describe blocks, 10 cases
- `hooks/lib/__tests__/bash-mutation-guard.test.ts` — residual block replaced, 4 cases
- `hooks/lib/__tests__/shell-parse.test.ts` — `tokenize` describe block, 5 cases

`hooks/guard.ts` (concurrent edit), `hooks/dist/` and the version were not touched.
