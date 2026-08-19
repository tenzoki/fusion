The new dispatch contract is reachable from no flow step, and no surface offers the choice it waits for

---
`agents/orchestrator.md` `## Re-sharpening an anticipated Circle (shaper portfolio-activation)`
(`:310`) fires on one condition: "the user's answer at a gate named the mode." No gate in the corpus
offers that answer. `/fusion:next` Step 6, the surface where the measured case arose, prompts with
three options — activate, choose another, just look. The orchestrator's `## Human Gate Rules` table
has no row for it. And the section itself is cross-referenced from two reference tables and from no
step of any phase, so a reader following the flow never meets it.

---
**The case the permission was built for.** Decision
`260813-0027_*_should-the-orchestrator-be-able-to-dispatch-the-shapers-portfolio-activation-mode.md`
`## Question`: "Running `/fusion:next` against `260801-1244-curator`, the playmaker reported that the
Circle must be re-sharpened before activation … The user, reading that briefing inside an
orchestrator session, chose 're-sharpen first'." The user volunteered the option. Nothing offered it
then, and nothing offers it now.

**Where the section is referenced, at HEAD `d5b71f1`.**

| Site | Kind |
|---|---|
| `agents/orchestrator.md:1339-1340` | the `shaper_start` / `shaper_done` rows of the event table |
| `agents/orchestrator.md:1443` | the `shaper` row of `## Agents the Orchestrator Invokes` |
| `agents/shaper.md:47`, `:121` | the shaper pointing back at it |

`grep -n -i "re-sharpen\|portfolio-activation" agents/orchestrator.md skills/*/SKILL.md` finds
nothing in any phase step, nothing in `## Human Gate Rules`, and nothing in `skills/next/SKILL.md`
beyond one unrelated line (`:250`) about the `**Active spec/plan:**` field. Phase 4 step 5
(`:907`) is where the orchestrator dispatches playmaker and would hear the recommendation that
prompts the question; it says nothing about re-sharpening.

**What is and is not wrong here.** The contract is applicable **as written**: it says "You ask, they
choose it, you dispatch", so the orchestrator may construct the question itself, and the
distinguishing rule — "can you quote the user's own words choosing it?" — is answerable on a
free-form user request as well as on a formal gate. This record does not claim the section is
unusable. It claims the friction the decision was filed against is only half removed: the
orchestrator may now *act* on the request, and the user must still know to make it unprompted.

**The asymmetry that makes it worth filing.** The section is emphatic about the direction it forbids
— "Noticing that a Grounding snapshot cites falsified measurements is a reason to *ask*, never a
reason to dispatch" — which is a duty to ask. But an orchestrator only reaches the section if it
already knows the mode exists, and the two tables that point at it are consulted when dispatching,
not when deciding whether to. A duty to ask that lives behind a dispatch table is a duty nobody
arrives at.

**A live consumer, already on disk.**
`circles/260801-1244-curator/issues/260814-0828_o_the-grounding-and-the-spec-still-call-the-growth-bound-decision-open-after-it-was-answered.md`
names its own repair path: "Writing it is the shaper's in portfolio-activation mode, or the
orchestrator's within its three head fields." That record's remaining surface is a stale
`## Grounding snapshot` on this Circle's own record — precisely the thing mode 3 is the sanctioned
writer of, on a Circle whose orchestrator session is running right now.

**Candidate fixes, none chosen here.**

- Add a `## Human Gate Rules` row: an anticipated Circle's Grounding snapshot is contradicted by the
  tree, or a playmaker briefing says so → ask whether to re-sharpen before activating. That makes the
  duty to ask reachable from the table an orchestrator reads for gates.
- Add the option to `/fusion:next` Step 6's prompt, as a fourth choice beside activate / choose
  another / just look. Note the constraint this crosses: `skills/next/SKILL.md` `allowed-tools`
  permits only playmaker, so the skill cannot dispatch shaper itself — the honest shape is a fourth
  option that ends the skill and tells the user what to run, not one that dispatches.
- Point Phase 4 step 5 at the section, where the playmaker's output arrives.

**Scope.** `agents/orchestrator.md`, and `skills/next/SKILL.md` if the second candidate is taken.
Executor: `coder`.

**Filed by:** coderev, review `circles/260801-1244-curator/reviews/260814-1850-coderev-curator-turn-4.md`.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). Substantively unchanged; one sub-claim is now partly false and is corrected here.**

Still no gate row for re-sharpening in `agents/orchestrator.md` `## Human Gate Rules`, and `skills/next/SKILL.md` Step 6 still offers exactly three options — Activate, Pick another, Just look. Phase 4 step 5 (`agents/orchestrator.md:881`) still says nothing about re-sharpening.

**Correction to the record:** it states the section is reachable from no flow step. One flow step now cites it — `agents/orchestrator.md:423` (Step 0b.1) points at it for the clarification-relay pattern. That is a citation for a different purpose, not a route into the mode, so the defect stands; the record's absolute wording does not.
