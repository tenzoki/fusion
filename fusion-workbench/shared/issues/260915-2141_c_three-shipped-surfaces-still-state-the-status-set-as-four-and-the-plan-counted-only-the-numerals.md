Three shipped surfaces still state the status set as four, and the plan counted only the numerals
---
`**Status:**` gained a fifth value. Three surfaces that state the set were not moved with it: two spell the four values as an enumeration and one states the numeral. The plan's risk row asserted the cardinality stood in three places, named those three, and moved them; the assertion was itself an unenumerated count and it was short.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260915-2028_*_a-fifth-status-value-for-work-items.md

**Evidence.** Derived by grepping every shipped `.md`, `.ts` and `bin/` file for a line naming `claimed` beside `open` without `paused`:

- `skills/memo/SKILL.md:112` — "defines the kind, **its four statuses** and this floor". A numeral, in a file the same commit edited fifteen lines lower (`:127`, which gained `**Active spec/plan:**`).
- `CLAUDE.md:35` — the Layout row for the conventions: "its state the `**Status:**` head field (`open`/`claimed`/`done`/`dropped`)". `CLAUDE.md:65` was moved to five in the same commit; this row was not, so `CLAUDE.md` now states the set two ways.
- `README.md:166` — "Its state is the `**Status:**` head field — `open`, `claimed`, `done`, `dropped`". The plan's step 6 named `CLAUDE.md`, `docs/working-model.md` and `docs/fusion-intro.md` and did not reach `README.md` at all.

`README.md` and `CLAUDE.md` are both charged to a bound, so the correction is measured, not free: `CLAUDE.md` sits at zero head-room against all eleven dispatch paths and this row is two characters longer at five values.

**What the plan asserted.** `260915-2028_*_a-fifth-status-value-for-work-items.md` `## Risks & Mitigations`: "Three sites state it as a numeral, in the conventions, in `CLAUDE.md` and in the orchestrator prompt. All three are named in steps 1, 4 and 6." `skills/memo/SKILL.md:112` is a fourth numeral site, and the two enumeration sites were outside the count's criterion entirely. `rules/critical-stance.md` §5.

**Acceptance.** A grep over `agents/`, `skills/`, `rules/`, `bin/`, `docs/`, `CLAUDE.md` and the three READMEs for a line naming `open` and `claimed` together returns no line missing `paused` except the deliberate historical one in `docs/upgrading-to-v11.md` (filed separately), and no shipped line reads "four statuses" of a work item.

Resolved, and the grep found one site neither the plan nor the review named. `skills/memo/SKILL.md` no longer states a cardinality at all — "defines the kind, its statuses and this floor" — which is what `rules/critical-stance.md` §5 asks of a numeral nobody needs there, and it returned 5 bytes to a surface with 320. `CLAUDE.md`'s Layout row and `README.md`'s work-item paragraph both name all five values rather than a count. **The fourth site:** `README.md`'s "Upgrading from v10.26?" paragraph stated the same set as four; it is a live product surface rather than a frozen note, so it names five now. `docs/upgrading-to-v11.md:25` is the one line deliberately left, being the subject of `260915-2145_*_the-v11-upgrade-note-is-maintained-as-live-in-one-commit-of-this-range-and-frozen-in-the-other.md`. `docs/working-model.md` and `docs/fusion-intro.md` were already at five and needed nothing. The acceptance grep now returns no other line.
