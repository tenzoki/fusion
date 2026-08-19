# The Phase 4 mandate is stated a third time in the prompt, and the new lint holds only two of the three surfaces

**Filed by:** coderev (review of Circle `260813-0858-playmaker-maintains-backlog-store`, commit `b995049`)
**Severity:** Medium
**Scope:** `agents/playmaker.md`; `hooks/lib/__tests__/playmaker-backlog-mandate-lint.test.ts`

## The three surfaces

The Phase 4 mandate sentence appears verbatim three times, not twice:

- `agents/playmaker.md:3` — the frontmatter description
- `agents/playmaker.md:194` — `## Two mandates, by dispatch path`, bullet 1
- `agents/playmaker.md:229` — `## Dispatch sources`, third bullet

All three carry the identical string *"A non-interactive Phase 4 dispatch from the orchestrator ranks, regenerates the portfolio and renames backlog markers, and nothing more."*

## What the lint holds

The lint's case 2 (`hooks/lib/__tests__/playmaker-backlog-mandate-lint.test.ts:219`) extracts the canonical clauses from the mandate section (`:136`, `findMandateClauses`, restricted to that section's prose) and requires them verbatim in the frontmatter description (`:262`). That is **two** of the three surfaces. `## Dispatch sources` is never read by any case in the file.

## The failure this leaves open is the one the lint was built for

The lint's own header states its design (`:45`–`:50`):

> Rewording both surfaces together is what a maintainer is supposed to do, and it stays green. Rewording one is the drift, and it fails.

A maintainer rewording the description and the mandate section together — the motion the lint deliberately permits — leaves `## Dispatch sources:229` behind, and the suite is green. The drift is then between two body sections of one prompt, and the header's own words describe exactly what that costs: *"the prompt reads fine, the agent behaves as one of the two statements says, and nobody learns which until a run does the wrong thing."*

This is not a hypothetical shape. `## Dispatch sources` is where the reader who wants to know what a Phase 4 dispatch may do will actually look, because it is indexed by dispatcher.

## What else the lint does not reach, for completeness

Stated so the boundary is a decision rather than an oversight:

- Case 3's retired-prohibition corpus (`:286`) is `agents/playmaker.md` alone. A retired boundary surviving in a *different* shipped file is invisible to it — and two such survivors exist right now (`skills/next/SKILL.md:291`, `README-agents.md:40`), each filed separately.
- The `RETIRED` pattern set (`:163`–`:176`) is three exact pre-change wordings. A *newly written* blanket prohibition ("the playmaker writes nothing into the backlog store") matches none of them. That is inherent to a mutation-proven detector and is acceptable; it is worth knowing the gate reads reverts, not new contradictions.

## Recommendation

The cheapest fix is to stop restating. Replace the sentence at `agents/playmaker.md:229` with a pointer to `## Two mandates, by dispatch path`, which the prompt already does for the other two dispatch sources (`:225`, `:227`, both of which say "Full mandate" and point outward). One statement, one place, nothing for the lint to hold.

If the restatement is wanted for readability, extend case 2 to require the extracted clauses in the dispatch-sources section as well, and add a `must()`-guarded parser for that section so a rename fails loudly rather than vacuously.

---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Both halves re-measured at HEAD `e435f03`; nothing moved but the line numbers.**

The mandate sentence still appears three times, verbatim:

```
grep -n 'ranks, regenerates the portfolio and renames backlog markers' agents/playmaker.md
  3:   (the frontmatter description)
  189: ## Two mandates, by dispatch path
  230: ## Dispatch sources
```

The record cited `:3`, `:194` and `:229`; the third surface has drifted one line and is otherwise untouched.

The lint still holds two of them:

```
grep -n 'Dispatch sources' hooks/lib/__tests__/playmaker-backlog-mandate-lint.test.ts
  (no output)
```

No case in that file reads `## Dispatch sources`, so the permitted motion the lint's own header describes — rewording the description and the mandate section together — still leaves the third statement behind and still shows green.

**Neither of the record's two remedies was taken.** `:230` is still a restatement rather than a pointer, and case 2 was not extended. Both are still available and the cheaper one is unchanged: `agents/playmaker.md` already points outward for its other two dispatch sources, so replacing the sentence with a pointer costs a line and removes the surface the lint cannot see.

**One thing worth knowing before someone picks the second remedy.** `agents/playmaker.md` sits under the `agents/` growth bound armed on 2026-08-15 (18 000 bytes of head-room, `hooks/lib/__tests__/surface-growth-bound.test.ts`), and the hook-test surface under its own. The pointer remedy *shrinks* the first and touches neither; the extend-the-lint remedy spends from the second. That asymmetry did not exist when this record was written and it argues for the pointer.
