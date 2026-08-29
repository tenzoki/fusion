The portfolio generator spelled a marker again, and the citation died at the next transition

---

**Severity:** Medium. It reddens `workbench-citation-lint`, which recomputes from the tree on every run and carries no baseline, so it blocks any commit until the file is regenerated. It is also a regression of a defect that was closed.
**Domain:** code
**Filed by:** orchestrator, on the activation that killed the citation
**Affects:** `agents/playmaker.md`, its portfolio generation; `fusion-workbench/portfolio.md:46`
**Cross-references:**
`260810-1730_*_die-erzeugung-von-portfolio-md-schreibt-den-zustandsmarker-aus-und-macht-jede-handkorrektur-zunichte.md`
(the same defect, closed);
`rules/circle-records.md` `### Citation form in the portfolio` (the rule it breaks, and the rule the
closed record produced)

---

## What happened

The playmaker regenerated `portfolio.md` at 260822-2040-playmaker-direct-dispatch.md. Line 46 reads:

> A proposal block was appended to `circles/260822-1921-measure-what-two-checkouts-share/_a_circle.md`.
> The marker is unchanged; activation is the user's act.

Twelve minutes later the user activated that Circle, the record became `_t_circle.md`, and the
citation resolved to nothing. `workbench-citation-lint` went red on the next `npm test`.

**The rule the generator broke is its own.** `rules/circle-records.md` `### Citation form in the
portfolio` requires every path citation in the portfolio to carry `_*_` at the marker position,
for exactly this reason: the file is regenerated wholesale on every run, its targets transition
between runs, and a spelled marker is a pointer that dies at its target's first transition.

**It is a pointer, not a statement about a marker.** The rule's own test is what a star would cost.
Starring this one costs nothing — "a proposal block was appended to `…/_*_circle.md`" reads exactly
as well, and the sentence that follows states the marker's state in words of its own. The letter
here is noise that ages, which is the case the rule assigns to the star.

Exactly one citation in the whole file carries a spelled marker, so the generator gets this right
almost everywhere and wrong once.

## Why this is a new record rather than a note on the old one

`260810-1730_*_die-erzeugung-von-portfolio-md-schreibt-den-zustandsmarker-aus-und-macht-jede-handkorrektur-zunichte.md` is closed. Its own measurement was five citations in one generated portfolio, two
already dead on the day of filing and a third two hours later, and the rule now in
`rules/circle-records.md` is what closed it. A recurrence after the rule exists is a different fact
from the original: the first said the rule was missing, this one says the rule is present and was
not applied. Appending to the closed record would file that second fact under the first's
reasoning.

## What is not the fix

Correcting `portfolio.md` by hand. The closed record's title says why in so many words: the file is
regenerated in full on every run, so a hand correction is overwritten by the next one. The
orchestrator does not own that file either — the playmaker writes it, and this record is addressed
to the agent that generates the citation rather than to the file that carries it.

## What to consider

1. **The generator applies the rule at write time**, which is what it already does everywhere else
   in the same file. What is missing is not a rule but its application in one branch: the proposal
   block sentence, which was written by the code path that appends an activation proposal rather
   than by the one that renders a ranked entry. That asymmetry is worth checking directly.
2. **The gate that exists has a structural blind spot, and this citation fell into it.**
   `hooks/lib/__tests__/portfolio-citation-form-lint.test.ts` already holds the generating prompt to
   the rule. Its detection pattern is

   ```
   ([0-9]{6}-[0-9]{4})(_[oatcibspd]_)
   ```

   a stamp immediately followed by a marker, and its header states why: the stamp is what makes the
   token a pointer to a file rather than a marker being named, so `_a_ → _t_` and
   `## Recently closed (_c_ / _b_)` pass untouched. That reasoning holds for a decision, an issue or
   a plan, whose filename is `YYMMDD-HHMM_S_<slug>.md`.

   **It does not hold for a Circle record.** Its filename is `_S_circle.md` and the stamp lives one
   path segment earlier, in the directory name, so a Circle-record citation never presents a stamp
   in front of its marker. Measured against the pattern at HEAD:

   ```
   caught   shared/decisions/260510-0930_o_token-format.md
   missed   circles/260822-1921-measure-what-two-checkouts-share/_a_circle.md
   missed   circles/260716-1847-workbench-umbau/_t_circle.md
   ```

   These three are **exhibits, not pointers**: their whole content is which spellings the pattern
   does and does not match, so they are fenced rather than written as addresses. The citation gate
   exempts a fenced block for exactly this case, and it caught them when they were not fenced,
   which is the mechanism working on the record that describes it.

   The second line is the citation that died today. The gate is blind to the whole class of
   Circle-record pointers, by construction rather than by oversight, and that class is the one the
   portfolio cites most.

   Widening the pattern is not free, and the gate's own header says why in advance: it warns that a
   broader pattern would fire on the naming of a marker, which is a statement whose content starring
   would delete. A `<dir>/_S_circle.md` shape has to be recognised as a pointer without recognising
   `_t_circle.md` in a sentence about a transition, and those two differ by whether a directory
   segment precedes them, not by anything in the token itself.

3. **Two smaller things in the prompt, found while diagnosing.** `agents/playmaker.md:168` cites the
   rule as `## Citation form in the portfolio` where the heading in `rules/circle-records.md:250` is
   `###`. And the rule is stated inside `## Output — the portfolio`, scoped as "every path you cite
   **here**", while the sentence that failed was written under
   `## Activation proposals — never auto-rename`, a section that also causes portfolio text to be
   written and carries no pointer back to the rule. A pointer there, not a second copy of the rule,
   is the shape that would not drift.

---
Resolved: fixed — the activation-proposal branch now points at the citation paragraph and names the record it cites as starred, and the rule citation reads `###`; the gate's Circle-record blind spot (point 2) is a hook-test matter outside this edit; `agents/playmaker.md:176`, `:168`
