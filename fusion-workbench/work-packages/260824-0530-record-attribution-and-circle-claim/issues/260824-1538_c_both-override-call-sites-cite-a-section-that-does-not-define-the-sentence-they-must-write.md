Both override call sites cite a section that does not define the sentence they must write
---
`skills/next/SKILL.md:207` and `skills/setup/SKILL.md:351` each instruct the run to write the claim field's `Overridden ` sentence "per `agents/orchestrator.md` `## Circle head fields`". That section defines two claim rows and neither is the override. The `Overridden ` form is authored in `rules/circle-records.md:191-199`. The two paths that cite the wrong home are the only paths on which two identities ever land in one record.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

Found reviewing `e209011..0f5889e`, the C3 Circle's full range.

`agents/orchestrator.md:258-305` is the authoring home the two skills cite. Its table carries exactly two rows for `**Claim:**`:

| Act | Value |
|---|---|
| `_a_`→`_t_` activation, with the record rename | the `Claimed ` form |
| `_t_`→terminal, with the `.active-circle` clear | `Unclaimed` |

The paragraph beneath the table closes the set explicitly: "**The two rows and this paragraph are the authoring home for both performers.**" The word `Overridden` does not appear anywhere in `agents/orchestrator.md` — `grep -rn Overridden agents/ skills/ rules/` returns five hits and three of them are the two skills' citations plus one inventory line at `skills/next/SKILL.md:262`; the only two that define anything are `rules/circle-records.md:193` and `:199`.

So an agent that follows the citation opens the section, finds the two rows, finds no override, and has to either improvise the sentence or write nothing. Improvising it loses the exact form the field's reader test depends on: `rules/circle-records.md:206-209` says a reader classifies the field by its literal opening, and the worked example at `:199` is what fixes `Overridden YYMMDD-HHMM by <person>, checkout <id>.` as that form.

**Why no gate catches it.** `hooks/lib/__tests__/reference-resolution-lint.test.ts` resolves the file token and the heading token, and both exist. A citation that resolves to a real section which does not carry the cited content is outside what that gate can see. Its own re-approval comment for step 10 records the two citations being counted, with no check on what they point at.

Fix direction: point both call sites at `rules/circle-records.md` `### The claim field` for the `Overridden ` sentence, which is where it is authored, and leave their citation of `agents/orchestrator.md` `## Circle head fields` for the activation value alone. The alternative — adding an override row to the orchestrator's table — moves the definition away from the file that owns the field's form and splits it across two homes, which is the duplication `rules/critical-stance.md` §2 rules out.

Adjacent, not the same: `260822-2045_*_a-circles-head-fields-end-up-in-different-states-depending-on-which-of-the-two-activation-routes-ran.md`, which the orchestrator section already cites, is about the two routes producing different *values*. This is about one value having no definition at the address both routes are sent to.

---
Resolved: Both call sites now cite the section that authors the sentence. `skills/next/SKILL.md` Step 6.1 and `skills/setup/SKILL.md` Step 0i take the `Overridden ` form from `rules/circle-records.md` `### The claim field`; `agents/orchestrator.md` `## Circle head fields` stays cited where it is correct, for the activation value and the act that writes it, so the definition moved nowhere and no third copy of the sentence was written. Each step's trailing duplicate citation of the same section went with the repair, being redundant one sentence after the new one. `hooks/lib/__tests__/reference-resolution-lint.test.ts` re-approved with the accounting note: paths 1319 -> 1318, anchors 186 -> 185, records unmoved.
