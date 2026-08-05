# The replacement audit recipe went stale in the Turn after it was written, and omits `moved`

---

**Severity:** Low
**Domain:** code (record integrity of a security control)
**Filed by:** reconciler, closing pass of session `history/260803-1737-orchestrator-session.md`
**Affects:** `hooks/lib/bash-mutation-guard.ts:1960` and `:1963` (the `unmodelled` docstring), contradicted by `:1521-1522` (the `ShellState` docstring)
**Kind:** NEW in `c9c44a3`, which added the sixth field without updating the enumeration written one Turn earlier in `048f3db`.
**Cross-references:**
`260803-2237_c_unmodelled-zeroes-the-stack-values-but-not-its-depth-…` (the issue whose closure replaced the recipe with this enumeration, on the argument that a type-level statement cannot go stale the way a hand-written recipe did),
`hooks/lib/bash-mutation-guard.ts:1596` (`moved: boolean`, the field added by `c9c44a3`).

---

## What is wrong

`260803-2237` closed on the observation that the `applyDirEffect` audit recipe had been wrong **twice**, both times because it enumerated writes to fields while the invariant is a property of the state. The closure replaced it with a statement about the types:

> Each field of `ShellState` has an "I don't know" value that covers the whole field rather
> than its contents, so a give-up is a total assignment and cannot leave a residue

followed by a per-field enumeration and the claim that a reviewer checks it by reading a fixed number of type declarations. The argument for the replacement was that types are checked by the compiler on every build, so the statement cannot drift the way the recipe did.

It drifted in the next Turn. `c9c44a3` added `ShellState.moved` (`:1596`), the sixth field. The enumeration at `:1960` still reads:

```
 *   - `physical`, `cdpath` — monotone booleans, set and never cleared, where
 *     `true` IS the don't-know: it can only make a later `cwd` less certain.
```

`moved` is absent. And `:1963` still says:

> A reviewer checks this by reading four type declarations, not by running a command over a
> function that grows.

There are now five distinct declarations across six fields.

The `ShellState` docstring in the same module gets it right — `:1521-1522` reads "`physical`, `cdpath` **and `moved`** are monotone booleans, set and never cleared". So two docstrings in one module disagree, and the one that disagrees is the one whose entire stated purpose is to be the checkable enumeration.

## Why this is worth a file rather than a silent fix

The recipe has now been wrong three times, and the third time is the one that was supposed to be structurally incapable of going wrong. That is the finding. The premise "types cannot go stale" was correct about the *compiler's* view and wrong about the *prose enumerating them*, which is an ordinary comment and drifts like any other. The same docstring predicted this at `:1522-1525`: "A future field must arrive with the same property, or `unmodelled` silently stops being a give-up for it." A future field arrived one Turn later and the sentence warning about it was not updated.

Whoever fixes this should decide whether the enumeration should exist at all, or whether the `ShellState` declaration plus its own docstring is the single place the property belongs. Two copies of one list is what produced all three failures.

## Is there a live escape behind it?

**Not verified either way, and stated as unverified rather than guessed.** `unmodelled` (`:1654-1658`) assigns `cwd`, `prev` and `dirStack` and does **not** assign `moved`. Since `moved = true` is the don't-know value — it *causes* the degrade rather than suppressing it — not assigning it is the looser direction on its face. But `unmodelled` already sets `cwd` to the unknown arm, which is at least as strict as anything `moved` would trigger, so no bypass could be constructed from it. Recorded as an open question for whoever takes this, not as a claim.

## Recommended fix

Add `moved` to the enumeration at `:1960`, correct "four" to "five" at `:1963`, or delete the enumeration and point at `:1516-1525`, which already carries the property correctly and sits on the declaration it describes. The third option is the one that removes the defect class rather than its third instance.

## Test coverage this needs

None that is worth having. A lint asserting that the docstring names every field of `ShellState` would be a fourth recipe. If the enumeration is deleted in favour of the single copy at `:1516-1525`, nothing needs pinning; if it is kept, the honest position is that it will drift again.

## Origin

Found during the reconciler's verification of the Turn 5 regression closure, while checking whether any docstring at HEAD asserts more than the measurements support. It was the only overclaim found in fifteen assertions spot-checked across `bash-mutation-guard.ts`, `README-hooks.md` and `rules/protected-path-discipline.md`.

---

**Step 3 disposition (coder, 2026-08-05) — A-shaped, foreign file. STAYS `_o_`.**

The defect is real and is branch A in kind: a delivered sentence is false. Branch A's
remedy is unavailable, because the sentence is a docstring in
`hooks/lib/bash-mutation-guard.ts` and step 3's scope is the two rule layers, the forensics
analysis, `README-hooks.md` and the issue files. **This step changes no code and no source
comment**, on the standing instruction that the classifier is not reopened.

Reported to the orchestrator as a gap in the plan's three-branch rule rather than as a
special case for this issue: **six of the eighteen findings have this shape**, and the rule
as written has no branch whose remedy reaches them.

**Where it is answered.** `circles/260804-1205-shell-reachability-model` restructures the
directory model by its own Directive, and this enumeration is that model's. This issue's
§ Recommended fix already names the option that removes the defect class rather than its
third instance — delete the enumeration and point at `:1516-1525`, which carries the
property correctly and sits on the declaration it describes. Cited there, not moved: the
finding arose from this Circle's Directive and its record stays in this Circle's store.

The open question at § "Is there a live escape behind it?" is untouched and still
unverified.
