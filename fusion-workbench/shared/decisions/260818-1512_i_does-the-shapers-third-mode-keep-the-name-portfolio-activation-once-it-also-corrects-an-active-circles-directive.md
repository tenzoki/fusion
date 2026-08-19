# Does the shaper's third mode keep the name `portfolio-activation` once it also corrects an active Circle's Directive?

---
**Domain:** code
**Status:** open
**Filed by:** planner
**Cross-references:** `shared/decisions/260818-1504_*_how-does-a-circle-record-carry-its-directive-once-a-spec-exists-and-who-may-correct-it-before-one-does.md` (the answered decision this plan realises), `shared/planning/260818-1512_*_the-circle-records-directive-becomes-a-pointer-and-gains-a-writer.md` (the plan that widens the mode), `agents/shaper.md` `## Four invocation modes` (mode 3), `agents/orchestrator.md` `## Re-sharpening an anticipated Circle (shaper portfolio-activation)`, `README-agents.md` `## Dispatch parameters`

---

## Question

Decision `260818-1504` widens the shaper's third mode. Today the mode re-clarifies an
**anticipated** Circle's Directive ahead of activation, which is the occasion its name describes.
After the widening it also corrects an **active** Circle's Directive while the record is still the
only place that Directive is written, and activation is then nowhere in the picture. The name
`portfolio-activation` describes an occasion the mode no longer requires.

The name is not only prose. It is the value of the `**Mode:**` dispatch parameter, matched by the
shaper's own detection contract, so renaming it changes a wire format. The plan that widens the
mode has to spell the value one way or the other, which is why the question has to be settled now
rather than noticed later.

Six sites carry the string today: `agents/shaper.md` mode 3 and its frontmatter description,
`agents/orchestrator.md` `## Re-sharpening an anticipated Circle (shaper portfolio-activation)`
and two further mentions of that heading, and two rows plus the roster description in
`README-agents.md`. The section heading is cited from `agents/shaper.md` in the adjacent
`` `file.md` `## Section` `` form, which `hooks/lib/__tests__/reference-resolution-lint.test.ts`
class (b) resolves, so a rename that misses one citation fails the suite rather than passing
quietly.

## Options

1. **Keep `portfolio-activation` as the wire value, and widen the prose around it.** The parameter
   value is treated as an identifier rather than a description.
   - Pros: no compatibility break, no citation churn, no rename across six sites. Costs the fewest
     bytes on two surfaces whose growth bounds are close.
   - Cons: the name misdescribes the mode. A reader meeting `**Mode:** portfolio-activation` on a
     dispatch that corrects a typo in an active Circle has to be told the name is historical, and
     an explanation of a misleading name is a recurring cost paid by every later reader.
2. **Rename the mode to something that names what it does**, for example `directive-refinement`,
   at every one of the six sites plus the orchestrator's section heading.
   - Pros: the name states the mode. The orchestrator's section heading stops promising activation.
   - Cons: seven edits, one of them a heading whose citations the lint resolves. A dispatch written
     against the old value falls through to the mode-detection heuristic and returns a spec where a
     record edit was asked for, which `agents/orchestrator.md` already names as the failure of a
     dropped `**Mode:**` line. Nothing in fusion versions a parameter value, so there is no
     transition period.
3. **Accept both values**, the old one as a deprecated alias.
   - Pros: no break, and new dispatches read correctly.
   - Cons: two names for one mode is the duplication this project's own records keep concluding
     against, and an alias with no removal date is permanent.

## Constraints

- Whatever is chosen, `agents/shaper.md` and `README-agents.md` must spell the same value, and
  `README-agents.md` `## Dispatch parameters` stays the single authoring home for the roster.
- The orchestrator's section heading is cited in the adjacent form from `agents/shaper.md`, so a
  heading change and its citations move in one commit or the suite goes red.
- `agents/` has roughly 12 300 bytes of head-room against its growth baseline at the time of
  filing. A rename is close to byte-neutral; the prose explaining a retained misnomer is not.

## Recommendation

Option 1, and the argument is narrow rather than enthusiastic. The value is matched, not read, and
the cost of a wrong match is the failure the orchestrator already documents. What tips it is that
the misnomer can be retired for free later, in any Circle that touches these files for another
reason, while a rename landed now spends citation churn and a compatibility break on a plan whose
subject is something else.

The plan proceeds on option 1 and states the residual rather than describing it away. If the user
prefers option 2 at the plan gate, the rename is one additional step in the same plan and no other
step changes.

---
Answered: <set when status moves to _a_>
Implemented: <set when status moves to _i_>
Deferred: <set when status moves to _d_>
Superseded by: <set when status moves to _s_>
Retired: <set when the implementation is removed; the marker stays _i_>

---
Answered: user gate, orchestrator session `shared/history/260818-1452-orchestrator-session.md`, 2026-08-18 — keep `portfolio-activation`. The rename would break every citation of the value, in the shaper's own detection contract, in the orchestrator's dispatch permission and in the dispatch-parameter roster, and a mode-detection value that no longer matches its citations fails silently by falling back to the heuristic. The accepted residual is named rather than argued away: after the widening the name describes half of what the mode does, and a reader meeting it for the first time expects it to have to do with activation.

---
Implemented: `95bebe1` — option 1. The wire value `portfolio-activation` is kept and the prose
around it widened, which is exactly what the answer chose and what the plan
`shared/planning/260818-1512_c_the-circle-records-directive-becomes-a-pointer-and-gains-a-writer.md`
(`**Status:** Complete`) carried out.

The value survives unchanged at every site the record enumerated: `agents/shaper.md:3`
(frontmatter description), `:15`, `:28`, `:47` (the detection contract), `:132`;
`agents/orchestrator.md:305` (the section heading), `:309`, `:315`, `:342` (the dispatch literal),
`:1218-1219`; `README-agents.md:25`, `:64`, `:65`, `:67`. The mode is widened in the same commit —
`agents/shaper.md:3` and `README-agents.md:25` now read "an anticipated **or active** Circle's
Directive", and `agents/shaper.md:47` admits an `_a_` or a `_t_` record while refusing a terminal
one.

The accepted residual is not merely tolerated but written down where a reader meets it:
`agents/orchestrator.md:322` states that the heading still says "anticipated" because the mode's
wire name does, and cites this record by name for the reason. That is the record's own condition —
"states the residual rather than describing it away" — realised on the shipped surface rather than
only here.

---
**Reconciliation 260819-1400 (reconciler, domain `code`, HEAD `e435f03` / `v10.3.0`) — `_a_` → `_i_`.**

The realisation and the answer landed in the same session, one day apart from this pass, and no
step of that session's plan owned the marker transition: the plan's subject was the Directive
pointer, and this record was a side question the plan had to settle before it could spell a
parameter value. Verified at HEAD by reading all fourteen sites above; no citation of the value
dangles, which `hooks/lib/__tests__/reference-resolution-lint.test.ts` class (b) would have caught
for the section heading in any case.

The `**Status:** open` head field is left exactly as it stands, per
`260818-2212_i_should-the-decision-records-status-field-exist-at-all-...`: a record written before
the field left the template keeps it.
