# A `cd` inside a pipeline runs in a subshell in bash, and the model follows it anyway

---

**Severity:** High
**Domain:** code (security control)
**Filed by:** coderev, Turn 7 review of `circles/260801-1244-guard-rules-write` (`048f3db..c9c44a3`)
**Affects:** `hooks/lib/bash-mutation-guard.ts` (Bash surface only)
**Kind:** PRE-EXISTING — identical at `048f3db` and HEAD. Sibling of `260804-0836`; same root cause, different shell mechanic, different fix.
**Cross-references:**
`hooks/lib/bash-mutation-guard.ts:2465`, `:1990`;
`hooks/lib/shell-parse.ts` (`SegmentJoiner`, which treats `|` as an ordinary separator);
`260804-0836_o_…` (the `||` half), `260804-0839_o_…precedence…` (the over-deny half of
the same precedence gap).

---

## What is wrong

The lexer segments on `|` exactly as it segments on `;`, and the classifier carries the
directory model across the boundary. But a pipeline element is not an ordinary segment:
bash runs **every** element of a pipeline in a subshell, so a `cd` in one of them does
not move the calling shell at all. The guard models the move, relocates every later
relative operand into a directory the shell never entered, and a write that lands on the
protected list is allowed because the model has moved it off.

This is the same defect shape as `260803-2236` (a modelled move the shell did not make),
and it is bidirectional for the same reason: an asserted move denies when it lands *on*
the list and allows when it lands *off* it.

## Measured

Real guard subprocess, one fresh project per row, then the same command in each shell.

```
  guard   bash          zsh        command
  allow   GONE          intact     echo hi | cd build && rm rules/x.md
  allow   GONE          intact     true | cd build && rm rules/x.md
  allow   OVERWRITTEN   intact     ls | cd build && echo pwned > rules/x.md
  allow   GONE          intact     ls | cd build && rm -rf agents
```

`zsh: intact` is not a reprieve — it is the two shells disagreeing. zsh runs the **last**
element of a pipeline in the current shell, so there the `cd` really does move and the
model happens to be right. bash subshells it, and bash is where the write lands on the
protected file. The model asserts one answer for both.

**Before/after:** every row is `allow → allow` at `048f3db` and HEAD.

## Recommended fix

A `cd` on a segment whose joiner is `|`, or on a segment followed by a `|`-joined
segment at the same depth, must not set a directory — it must call `unmodelled`. That is
faithful to bash and over-denies for zsh, which is the direction the module has taken
everywhere a shell disagreement was found (`260803-2236`'s resolution is the precedent:
give up rather than model a fact that is a property of the running shell).

Note the interaction with `260804-0839`: `|` must stop being read as "reached
unconditionally" for the WRITE at the same time as it starts being read as "does not
move the shell" for the `cd`. `cd hooks && npx tsc | tee log` needs both halves to come
out right — the `cd` is proven, and `tee`'s operand is in `hooks/`.

## Anti-vacuity

All four rows allow today. When closed, pin the zsh row separately (`echo hi | cd build
&& rm rules/x.md` must deny even though zsh's own behaviour makes the model correct
there) — otherwise a future edit that special-cases the last pipeline element would pass
the suite and re-open bash.

---
**Design record filed (T8-1, 2026-08-04), not implemented.** This finding and its sibling
are one fact — the joiner is consulted for the segment that writes and never for the one
that moves — and one decision closes both:
`decisions/260804-0947_o_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md`.
It costs three options by measurement (option 1: 0 rows on the suite corpus, 0 on the
30-row ordinary corpus, 940 on a 25,200-row generated cross-product, all carrying the `||`
or `|` it targets, 0 newly allowing; option 2 also closes `260804-0839`), reproduces the
leak in both shells, and recommends taking the ten-line give-up now and the reachability
model as its own Circle. Both leaks are also stated as live residuals in
`rules/protected-path-discipline.md` so nothing ships claiming the model is exact.

---

**Reconciliation 260804-1021 (reconciler, domain `code`) — stays `_o_`. Reproduced independently at HEAD.**

`echo hi | cd build && rm rules/x.md` **allows** at HEAD `cc012fc`, measured through `classifyBashMutation` with the shipped protected list rather than taken from the review.

**The duplicate question the session raised about this pair, checked and answered: these two are not duplicates.** `260804-0836` is a short-circuit defect — the `cd` is on a `||`-joined segment whose left operand succeeded, so bash skips it. This one is a scoping defect — bash runs every pipeline element in a subshell, so the `cd` runs and does not move the calling shell. They share a root cause in the tracker's sense (the joiner is consulted for the segment that writes and never for the one that moves) and one decision closes both, but the shells behave differently: zsh runs the last pipeline element in the current shell, so this defect's rows are bash-only while `260804-0836`'s reproduce in both. A fix that special-cased the last pipeline element would close this one in zsh's terms and leave bash open, which is exactly why the issue's own `## Anti-vacuity` asks for the zsh row to be pinned separately. The distinction survives; keep both files.
