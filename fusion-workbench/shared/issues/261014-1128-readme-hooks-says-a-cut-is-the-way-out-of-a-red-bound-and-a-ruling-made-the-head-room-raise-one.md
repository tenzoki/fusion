README-hooks says a cut is the way out of a red bound, and a ruling made the head-room raise one
---
`README-hooks.md` `### Growth bounds on the shipped text`, the bullet "Shipped text carries failing growth bounds (260815)", states "The way out of a red bound is a cut, never an edit to a baseline or a head-room constant". The user ruled otherwise for the dual-host work, and the instrument already names the move.
---
**Filed by:** policy-curator, Kai Stalmann <ks@qantr.com>

**Evidence.**

- `260927-2319_*_does-the-growth-bound-on-shipped-text-yield-to-the-dual-host-prompt-set.md`, `Answered:` line: "the growth bound does not stop the dual-host work; it is adjusted, first by the head-room raise the instrument names, otherwise by restructuring, and removed only as the last resort". Its `## Question` quotes the `CLAUDE.md` copy of the same sentence as the position being decided.
- `260929-1810_*_does-the-2026-09-27-ruling-on-the-growth-bound-reach-the-hook-tests-and-shipped-text-fj03-changes.md`, `Answered:` line: "the remaining net growth is raised with before and after figures in `README-hooks.md`, the baseline kept, and no further approval is needed for that measured raise".
- `hooks/lib/__tests__/helpers/growth-bound.ts`, header: "THE HEAD-ROOM RAISE. When a ruling lets work land that a bound would otherwise stop, raise `headRoom` and leave every baseline untouched."
- The same README section, two paragraphs up, logs the hook-test head-room raised twenty-six times.

The second clause ("both move only at the events named in `growth-bound.ts`") is consistent with the instrument; the first clause ("The way out of a red bound is a cut") is not.

**Required change.** The sentence names the head-room raise a ruling allows beside the cut as a way out of a red bound, and keeps "never an edit to a baseline". Executor: `code-implementer` (a `README*.md` file).

**Acceptance test.** `grep -n 'The way out of a red bound' README-hooks.md` returns a sentence that names both the cut and the head-room raise on a ruling.

Surfaced by the curator run `261014-1116-curator-run.md`, entry L01, which proposes the same correction for `CLAUDE.md`.
