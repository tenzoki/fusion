The citation pin's re-approval note says `hooks/dist/` is scanned for records only, and it is not scanned at all

---

The `260826-1330` re-approval comment on `hooks/lib/__tests__/reference-resolution-lint.test.ts`
explains why `hooks/dist/` contributed zero to the pin by giving a reason that describes a different
set of files. `hooks/dist/**` is outside the gate's scanned surface entirely. The number the note
re-approves is correct; the reason it hands the next re-approver is not.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Low. Nothing behaves wrongly and the pinned number is right — it was re-derived
independently in review `circles/260825-2023-presence-travels-monitor-filters-own-checkout/reviews/260826-1330-coderev-the-last-uncovered-commit.md`.
What is wrong is a sentence written expressly so the next re-approver would not have to re-derive it,
and it over-claims what the gate covers.

**Cross-references:**
`circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-0154_*_the-reference-pin-shaped-a-comment-away-from-naming-a-path-and-the-vagueness-is-the-gates-doing.md`
(the same pin, the other direction: there the pin distorted a comment, here a note about the pin
misdescribes the pin).

## The claim

`hooks/lib/__tests__/reference-resolution-lint.test.ts:479`, in the `2026-08-26 (C4 Turn 3 task Z-2)`
entry:

> And `hooks/dist/` contributes nothing even though `hooks/lib/events-query.ts`'s docstring, from
> which the two compiled copies are generated, was rewritten in the same edit — `hooks/**.ts` is
> scanned for class (c) record citations only, and that docstring's one record citation was left
> untouched.

The same sentence stands in
`circles/260825-2023-presence-travels-monitor-filters-own-checkout/history/260826-1200-coder-z2-the-three-remaining-counts.md`,
under `## The citation pin`.

## What the surface actually is

`surface()` in that same file builds the scanned set. Its two hook loops are
`readdirSync(join(pluginRoot, "hooks", "lib"))` and `readdirSync(join(pluginRoot, "hooks"))`, each
filtered by `statSync(abs).isFile()`. Both are non-recursive, and `hooks/dist` is a directory, so it
is skipped by the `isFile()` filter and never descended into. Nothing under `hooks/dist/` is read by
this gate — not the `.js`, and not the `.d.ts`.

The reason the note gives is the reason `hooks/lib/*.ts` contributes no *paths*: those files carry
`recordsOnly: true`. That reason is true of the source and is offered as the reason for the compiled
output, where it does not apply.

## Why the shorthand makes it worse rather than merely loose

`hooks/**.ts` reads as recursive, and `hooks/dist/lib/events-query.d.ts` matches it literally. A
reader who takes the sentence at face value concludes that a `.d.ts` under `hooks/dist/` is in scope
and merely limited to class (c) — that a stale record citation in a committed compiled file would be
caught. It would not be. The shorthand was harmless in the `2026-08-25 (C4 step 2)` entry further
down the same line, where it described `hooks/lib/events-query.ts` and `hooks/events-query.ts`, both
genuinely in the surface. Reused for `hooks/dist/`, it becomes load-bearing and false.

## Measured

Against a copy of the tree at `69e7e5a` in a scratch directory, with the gate run by
`npx vitest run lib/__tests__/reference-resolution-lint.test.ts`:

- Probe: a dangling record citation inserted into a comment in `hooks/dist/lib/events-query.d.ts`.
  The token was fabricated for the probe and names no record:

  ```
  shared/decisions/990101-0101_o_this-record-does-not-exist-anywhere.md
  ```

  The gate stays **green**, 37/37.
- Control: the identical probe in `hooks/lib/events-query.ts`. The gate **fails**, naming
  `hooks/lib/events-query.ts:373` and the token.

So the probe method detects what is scanned, and `hooks/dist/` is not.

**Fix direction.** Replace the reason with the one that holds: `hooks/dist/` contributes nothing
because it is not in the scanned surface at all — `surface()`'s two hook loops are non-recursive and
`isFile()`-filtered, so no compiled artifact is ever read. Keep the `hooks/lib/*.ts` records-only
reason where it belongs, as the reason the rewritten `hooks/lib/events-query.ts` docstring moved no
count. The two facts are separate and the note currently states one and uses it for both. Correcting
the sentence adds no path or heading token, so the pin does not move.

**Scope.** `hooks/lib/__tests__/reference-resolution-lint.test.ts:479`, comment only. The history
record above is a session record and is left as written. No behaviour, no number.
