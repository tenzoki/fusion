# The `Status:` qualifier leaves the orchestrator prompt

**Status:** Complete
**Agent:** coder
**Circle:** none active (shared store, Origin Rule)
**Issue:** `260819-0821_*_the-status-qualifier-closure-names-one-remaining-site-and-a-shipped-agent-prompt-still-carries-it.md`

## What changed

`agents/orchestrator.md:301-303`, the `**There is no `Status:` head field**` paragraph about the
Circle record. The closing clause was conditional — it justified leaving the field alone on a
record you are *not* transitioning, which is the one case an agent never meets. It is now
unconditional and names the transition case, mirroring the construction
`rules/fusion-workbench-conventions.md:522-527` took for the decision record in Turn 2 of this
session.

Before:

> The marker is the state. A record written before the removal still carries the field; leave it
> exactly as it stands — nothing writes it, nothing reads it, and hand-correcting it on a record you
> are not transitioning destroys the evidence the removal was decided on.

After:

> The marker is the state. A record written before the removal still carries the field; leave it
> exactly as it stands, including when you transition it — nothing writes it, nothing reads it, and
> those drifted headers are the evidence the removal was decided on.

The marker-is-the-state sentence, the "nothing writes it, nothing reads it" clause and the citation
of decision `260815-2312_*_should-the-circle-records-status-field-exist-at-all-now-that-both-transitions-maintain-it.md` are untouched. The two paragraphs stay separate: they govern different
record kinds (Circle vs decision) for different readers, and neither became a pointer at the other.

## The third site, named and not edited

`grep -rn "not transitioning"` over the shipped tree (`agents/`, `skills/`, `rules/`, `docs/`,
`hooks/`) returns exactly one remaining hit outside `fusion-workbench/`:
`docs/upgrading-to-v10-2.md:88`. It is already recorded as
`260819-0756_*_the-v10-2-migration-note-still-states-the-status-position-with-the-qualifier-the-rule-just-dropped.md`
and was out of scope for this task. Left as it stands.

## Growth bound

`agents/` measured against `AGENT_BASELINE` in `hooks/lib/__tests__/surface-growth-bound.test.ts`
(399 843 bytes, head-room 18 000):

| | bytes | growth | head-room |
|---|---|---|---|
| before | 414 540 | 14 697 | 3 303 |
| after | 414 534 | 14 691 | 3 309 |

Delta **-6 bytes**; a shrink, so no bound moves and no baseline was touched.
`hooks/lib/__tests__/fixtures/surface-growth.golden` went stale on that shrink and was regenerated
with the documented flag (`UPDATE_SURFACE_GOLDEN=1 npx vitest run
lib/__tests__/surface-growth-bound.test.ts`). Two lines moved and nothing else:
`orchestrator.md 150309 -> 150303` and `total 414540 -> 414534`.

`reference-resolution-lint`'s `BASELINE` did not move — the edit adds and removes no reference —
so no re-approval note was required.

## Verification

`cd hooks && npx vitest run` — exit 0, 36 files, 672 tests passed.

Files changed:

- `/Users/k1/Projects/productive/fusion/agents/orchestrator.md`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/surface-growth.golden`

Not committed; the marker transition on `260819-0821_o_*` is the orchestrator's.
