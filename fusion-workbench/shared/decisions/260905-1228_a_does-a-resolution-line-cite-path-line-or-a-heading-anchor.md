# Does a resolution line cite `path:line`, or a heading anchor?

---
**Domain:** code
**Filed by:** consultant, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260828-0904_*_does-the-mandated-citation-form-include-the-store-segment.md, 260824-2151_*_twenty-four-closure-notes-and-two-annotation-rows-cite-rule-files-by-line-number-in-the-commit-that-forbids-it.md, 260905-1228_*_the-worked-example-teaches-a-store-prefixed-citation-and-a-section-suffix-the-rule-rejects.md

---

## Question

`rules/fusion-workbench-conventions.md` `## Filename Patterns` mandates `path:line` on a `Resolved:`, `Answered:` or `Implemented:` line, and states the reason: such a line is a point-in-time citation carried by its commit, unlike living text, which must use a heading anchor because an edit above a line moves it silently.

This project does not write that form. Measured over `fusion-workbench/**/*_a_*.md` excluding `archive/` on 2026-09-05, 30 records carry an `Answered:` line. One uses `path:line`. Eleven cite a heading anchor in the form `` <basename>.md `## Heading` ``. Eleven use a third form and seven carry the keyword with the citation on the following line.

The question must be answered before `rules/decision-record-examples.md:53` can be corrected, because the correction has to write one of the two forms. It is also the last open half of the consumer report of 2026-09-05, whose other half was repaired in `505ac4df`.

## Options

1. **The heading anchor becomes the mandated form.** `## Filename Patterns` changes to require `` <basename> `## Heading` `` on a resolution line, matching the anchor rule it already states for living text.
   - Pros: 11 of 30 records already comply and 1 does not, so the rule moves toward practice rather than against it. The stated argument for anchors applies with full force to the most common target: a session history that a session keeps appending to, whose line numbers move after the citation is written. No existing record has to be rewritten to become compliant, only reclassified.
   - Cons: an anchor is coarser than a line, and a heading that is renamed dangles the same way a line that moves does, with no gate resolving either. The commit-carries-the-line argument is real for a target that never changes again, such as a commit-pinned analysis.
2. **`path:line` stays mandated and the corpus is swept.** The rule is unchanged and 29 of 30 records are corrected.
   - Pros: keeps one rule for the resolution line and preserves the point-in-time reading the paragraph argues for. No rule text moves.
   - Cons: a sweep of 29 records against a form that seven passes of agents did not produce on their own is evidence the form is not writable in practice. The `:line` values would be correct at the moment of the sweep and wrong for every history file still being appended to.
3. **Either form is permitted, the choice left to the target's stability.** An anchor for a file still being written, a line for a frozen one.
   - Pros: matches the stated reasoning, which distinguishes living text from point-in-time text and does not distinguish targets.
   - Cons: the judgment "is this target still being written" is made by the agent at write time and is not checkable afterwards, so the rule cannot be enforced and drifts back to whatever each agent prefers. Two permitted forms is what `rules/critical-stance.md` §4 calls a cut that resists being made disjoint.

## Constraints

- The path half is settled and none of these options reopens it: a record is cited by its storeless basename, per `260828-0904_*_does-the-mandated-citation-form-include-the-store-segment.md`, implemented in `f1099c5f`.
- No gate resolves a locator of either kind. `hooks/lib/citation-scan.ts` judges the path half only, so whichever form is chosen is unenforced and rests on the prompt text.
- The answer determines the correction to `rules/decision-record-examples.md:53`, which is blocked on this record.
- Records written before the answer stay as they stand. `rules/fusion-workbench-conventions.md` treats a drifted header as evidence rather than as debt, and the same reading applies here.

## Recommendation

Option 1. The measurement is one-sided: 1 record in 30 writes the mandated form after seven months of passes, and the mandate has no gate behind it, so nothing but the rule text has ever pushed toward it. The paragraph's own argument against line numbers, that an edit above the line moves it silently, applies hardest to the target these lines most often name, and a session history is appended to for the rest of the session after the citation is written. Option 2 buys consistency at the cost of a 29-record sweep whose output starts decaying immediately.

The one thing option 1 costs is the point-in-time reading, and the commit already carries that: the resolution line is committed with the transition, so a reader who needs the state at the moment of the ruling has the commit. Losing the line number loses precision within a file, not the timestamp.

---
Answered: 260904-1050-orchestrator-session.md `## Turn 4 — the two consumer findings` — option 1, the heading anchor becomes the mandated form on a resolution line; ruled by user, Kai Stalmann <ks@qantr.com>.

**Written in the form it answers**, deliberately: this line carries an anchor rather than a line number, and the ruler per the sibling decision answered in the same exchange. Whoever normalises the format may normalise this line with the rest.

**Existing records are not swept.** Records are not rewritten in this project, and option 1's own pros rest on that: eleven of thirty already comply and become compliant by reclassification rather than by edit. The nineteen that use a line number, a third form or a following-line citation stand as they are. The rule binds what is written from here.
