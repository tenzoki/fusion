# A `cd` skipped by an earlier `||` is still modelled as made, so the `&&` guarantee leaks

---

**Severity:** High
**Domain:** code (security control)
**Filed by:** coderev, Turn 7 review of `260801-1244-guard-rules-write` (`048f3db..c9c44a3`)
**Affects:** `hooks/lib/bash-mutation-guard.ts` (Bash surface only); `rules/protected-path-discipline.md` and `README-hooks.md`, which now state the leaking premise as a guarantee
**Kind:** PRE-EXISTING — identical verdicts at `048f3db` and at HEAD. It is not a regression of this Turn. It is the class this Turn was written to close, surviving in a shape the new condition does not reach.
**Cross-references:**
`hooks/lib/bash-mutation-guard.ts:2465` (the degrade condition), `:1990` (`state.moved`),
`260803-2338_*_should-the-guard-degrade-its-directory-model-after-a-cd-it-cannot-prove-succeeded.md`,
`260803-2238_*_…` (the closed sibling: a `cd` that FAILS),
`260804-0837_*_…pipeline…` (the same root cause through `|`).

---

## What is wrong

The degrade asks whether the segment **that writes** is `&&`-joined. It never asks
whether the segment **that carried the `cd`** was guaranteed to run.

```ts
// bash-mutation-guard.ts:2465
if (segment.joiner !== "&&" && segment.joiner !== "start" && state.moved) {
  degradeUnprovenCd(state);
}
```

`state.moved` is set the moment a directory builtin is *seen* (`:1990`), whatever
joiner brought its segment into reach. In a flat and-or list bash evaluates left to
right, and `&&` guarantees that the **preceding and-or list** returned zero — not that
the immediately preceding command ran. When the `cd` sits on a `||`-joined segment and
the left operand succeeded, the `cd` never runs, the shell stays where it was, and the
`&&`-joined write that follows is reached anyway.

## Measured

Real guard subprocess, one fresh throwaway project per row, then the same command run
in each shell against the seeded protected file. No deny read `[HALTED]`.

```
  guard   bash          zsh           command
  allow   GONE          GONE          true || cd build && rm rules/x.md
  allow   OVERWRITTEN   OVERWRITTEN   true || cd build && echo pwned > rules/x.md
  allow   GONE          GONE          true || cd build && rm -rf rules
  allow   GONE          GONE          true || cd build && mv rules/x.md /tmp/
  allow   OVERWRITTEN   OVERWRITTEN   true || cd build && sed -i '' s/a/b/ rules/x.md
  allow   GONE          GONE          true || cd build && rm agents/coder.md
  allow   OVERWRITTEN   OVERWRITTEN   true || cd build && echo pwned > skills/demo/SKILL.md
  allow   GONE          GONE          mkdir -p build || cd build && rm rules/x.md
```

Three of the four protected roots (`rules/**`, `agents/**`, `skills/**`) reached, by
`rm`, `mv`, `sed -i` and by redirection. No flag, no wrapper, no env variable.

**The discriminating control**, which shows the mechanism rather than a coincidence:

```
  allow   intact        intact        [ -d nope ] || cd build && rm rules/x.md
```

Identical shape; the left operand *fails*, so the `cd` really does run and the model
is right. The verdict is the same in both rows — the guard cannot tell them apart,
because the difference is a run-time exit status.

**Before/after, pure classifier, `048f3db` vs HEAD:** every row above is `allow → allow`.
This Turn did not open it and did not close it.

## Why it matters here specifically

`rules/protected-path-discipline.md:152-158` now tells every agent in every consuming
project:

> After `&&` it does not need to: bash will not run what follows unless the `cd`
> returned zero.

That sentence is false as written. Bash will not run what follows unless the **and-or
list to the left** returned zero, which is a weaker fact, and the gap between the two
is exactly this issue. The same claim is in `README-hooks.md`, in the module docstring
(`bash-mutation-guard.ts:82-92`) and in `ShellState.moved`'s own doc comment.

## Recommended fix

Do not trust a `cd` whose own segment was not guaranteed to run. The cheapest correct
form is a second monotone bit alongside `moved`: a segment is *reached-unconditionally-
from-a-proven-prefix* only when its joiner is `start`, `;` or `newline`, or when it is
`&&` and the previous segment was itself proven. A `cd` on a segment that is not proven
must call `unmodelled` rather than set a directory.

That over-denies `false || cd build && rm out.js` (where the `cd` does run). Over-deny
is the direction this module has chosen everywhere else.

## Anti-vacuity

The eight rows deny nothing today, so they cannot pass vacuously. When they are closed,
the discriminating control `[ -d nope ] || cd build && rm rules/x.md` must be pinned as
a deny too — under the recommended fix it denies, and a test that only pinned the
succeeding-left-operand rows would not distinguish a fix from a coincidence.

---
**Design record filed (T8-1, 2026-08-04), not implemented.** This finding and its sibling
are one fact — the joiner is consulted for the segment that writes and never for the one
that moves — and one decision closes both:
`260804-0947_*_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md`.
It costs three options by measurement (option 1: 0 rows on the suite corpus, 0 on the
30-row ordinary corpus, 940 on a 25,200-row generated cross-product, all carrying the `||`
or `|` it targets, 0 newly allowing; option 2 also closes `260804-0839_*_the-flat-joiner-model-ignores-shell-precedence-so-a-pipeline-and-an-if-body-degrade-a-cd-the-shell-guarantees.md`), reproduces the
leak in both shells, and recommends taking the ten-line give-up now and the reachability
model as its own Circle. Both leaks are also stated as live residuals in
`rules/protected-path-discipline.md` so nothing ships claiming the model is exact.

---

**Reconciliation 260804-1021-reconciliation.md (reconciler, domain `code`) — stays `_o_`. Reproduced independently at HEAD; the decision it waits on is filed and unanswered.**

Re-measured through `classifyBashMutation` at HEAD `cc012fc` with the shipped protected list, rather than read off the review: `true || cd build && rm rules/x.md` **allows**. So does `echo hi | cd build && rm rules/x.md` (the sibling, `260804-0837_*_a-cd-inside-a-pipeline-runs-in-a-subshell-in-bash-and-the-model-follows-it-anyway.md`). The discriminating control the review names, `false && cd build && rm rules/x.md`, also allows — correctly, because bash short-circuits the whole and-or list and the `rm` never runs, so it is not an escape and must not be pinned as one.

`260804-0947_*_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md` is filed, carries three costed options, and is **unanswered**. Nothing in the workbench answers it: searched both planning stores, both decision stores, both analysis stores and the Circle's `history/`.

**One correction to the release-blocker framing, which matters for what the next session scopes.** The Turn 7 review calls this pair "the release blocker for any claim about the boundary", and the Turn 8 handover repeats it. Answering `260804-0947_*_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md` in any of its three options leaves `260804-1024_*_git-c-supplies-a-directory-the-model-skips-so-a-relative-operand-resolves-off-the-protected-list.md` (`git -C rules rm x.md` allows and deletes the file) open, because that defect has no joiner in it — the directory is in the command text and the model never reads it. This pair is necessary for that claim and is not sufficient for it.

---

**Resolved (T9-1, Turn 9, 2026-08-04) — closed together with its sibling `260804-0837_*_a-cd-inside-a-pipeline-runs-in-a-subshell-in-bash-and-the-model-follows-it-anyway.md`, which is the same fact met through `|`.**

`260804-0947…` was answered option 4: the joiner is now consulted for the segment that MOVES as well as for the one that writes. All eight rows of the table above deny through the real guard subprocess, one fresh throwaway project per row, with the real-shell effect re-measured in both bash and zsh. No deny read `[HALTED]`.

The discriminating control the `## Anti-vacuity` section asks for is pinned as a deny: `[ -d nope ] || cd build && rm rules/x.md` denies although its `cd` genuinely runs and the file survives in both shells. That over-deny is the accepted cost and it is stated in `rules/protected-path-discipline.md` and `README-hooks.md`, where both leaks have come off the residual lists.

The implementation departs from the recommended fix in one way, and it is a strengthening rather than a narrowing. The recommendation proposed a second monotone bit alongside `moved`; what shipped is one condition at the existing call site reading the same one-row-per-joiner table the write-side give-up reads, so the module holds one fact about a joiner and not two — checkable with `grep -c '\.joiner' hooks/lib/bash-mutation-guard.ts` (returns 1) and pinned by a source assertion in the suite. Stating it over `state.moved` rather than over "a builtin new in this segment" also closes a sibling neither issue lists: `cd rules && true || cd /tmp && rm x.md` deletes `rules/x.md` in both shells and used to allow, because an absolute `cd` re-proved a directory from a segment bash skipped.

Measured cost, both directions: 0 newly allowing on all three corpora plus a 41,656-row generated cross-product; 1,420 newly denying there, every one carrying a `||` or `|` in front of the directory builtin; 0 newly denying on the 30-row ordinary-agent corpus and 0 on the suite's own HEAD harvest.

Not committed by the implementing agent — the orchestrator commits after validation, so no hash is cited here rather than a guessed one. See `260804-1200-turn9-t9-1-the-joiner-for-the-segment-that-moves.md`.
