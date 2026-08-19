The `**Status:**` closure answers one of the defect's two halves, and the template's footer stub stands

---

`shared/issues/260811-2146_c_half-the-decision-records-carry-a-status-that-disagrees-with-their-marker-and-twelve-keep-the-unfilled-template-stub.md`
was closed in `b54ace5` on the removal of the `**Status:**` head field. That record states two
defects, and its own body gives the second one a heading: `## The second half: the template stub is
left standing beside its own answer`. The `Resolved:` note addresses only the first.

---

## What is wrong

The second half is about a different block of the same template. The record quotes it:

```
---
Answered: <set when status moves to _a_>
Implemented: <set when status moves to _i_>
Deferred: <set when status moves to _d_>
Superseded by: <set when status moves to _s_>
```

and states the failure: a writer is meant to fill those lines, twelve non-open records instead kept
them verbatim and appended the real annotation below as a second block, so the record states both a
placeholder and an answer.

Removing `**Status:**` does nothing to that block. At HEAD `83488e9` the template at
`rules/fusion-workbench-conventions.md` `## Decision Record Template` still prescribes it, now at
five lines rather than four, `Retired:` having been added since the record was filed:

```
Answered: <set when status moves to _a_>
Implemented: <set when status moves to _i_>
Deferred: <set when status moves to _d_>
Superseded by: <set when status moves to _s_>
Retired: <set when the implementation is removed; the marker stays _i_>
```

Three live records still carry that block verbatim, measured across `shared/decisions/` and
`circles/*/decisions/` by grepping for the first placeholder line:

| Marker | Record |
|---|---|
| `_i_` | `shared/decisions/260818-0814_i_what-covers-the-plugin-repo-shaped-exempt-surface-record-now-that-the-convention-rule-was-not-chosen.md` |
| `_a_` | `shared/decisions/260818-1512_a_does-the-shapers-third-mode-keep-the-name-portfolio-activation-once-it-also-corrects-an-active-circles-directive.md` |
| `_i_` | `shared/decisions/260818-2212_i_should-the-decision-records-status-field-exist-at-all-now-that-the-circle-records-has-been-removed.md` |

Twelve became three because the population moved, not because the mechanism did. The third entry is
the decision record that authorised the closure, and it carries the stub at lines 146-150 while its
real `Answered:` and `Implemented:` annotations sit at 167 and 170.

## Why this is filed rather than reopened

The marker stays `_c_` on `260811-2146`: the first half is genuinely settled, and the conventions
rule for a closure whose reasoning is later found narrower than stated is a `Revised by:` line and no
rename. This record carries the unresolved half forward so it is not lost with the closed one.

The distinction the closure blurred is the same one the record itself drew: the `**Status:**` head
field is a *duplicate of a fact the filename already carries*, which is why deleting it is the whole
fix. The footer block is a *prompt to write something*, and the failure is that a writer copies the
prompt instead of answering it. Deleting the head field does not touch that.

## Fix direction

Two shapes, and this is a choice rather than an obvious edit, which is why the fix direction stops
here rather than prescribing one:

1. **Drop the placeholder block from the template** the way `**Status:**` was dropped, and let a
   record grow its `Answered:` / `Implemented:` line when the transition happens. The inline-tracking
   section already specifies the append form for each marker move independently of the template, so
   nothing loses its definition. Existing records keep whatever they carry, on the same reasoning the
   `**Status:**` answer used.
2. **Keep the block and state that it is filled or deleted, never left**, which is a rule with no
   enforcement and is the shape that produced twelve instances of the failure already.

Whichever is taken, the always-on rule set moves, so both goldens regenerate.

**Found by:** reconciler, final reconciliation of session `260818-2301`, verified at HEAD `83488e9`.
No Circle is active, so it is filed in the shared store under the Origin Rule.
