The wildcard record's claim that every other Circle record spells a hard marker in the field is false — nearly half already star it

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 4 (`a2a18f9..2ec2bc2`)
**Affects:** `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1408_*_the-plan-field-now-carries-a-wildcard-and-no-rule-authorises-one-in-a-circle-record-head-field.md`, `## What is wrong`
**Cross-references:** `rules/circle-records.md:274` (`### Citation form in a Circle record's head field`), the rule that record produced and which stands correct

---

## What is wrong

`260823-1408_*` argues for the new rule partly from this:

> Every other Circle record in the live tree spells a hard marker in that field, so the next writer follows the template and re-creates the fault

Measured at HEAD over `fusion-workbench/circles/*/_*_circle.md`, excluding `archive/`: **seven** records spell a hard marker, **six** already carry `_*_`, and two read `(none yet)`.

Starred already, before this Circle: `260718-1924-v5x-overhaul`, `260801-1244-guard-rules-write`, `260801-1244-rule-provenance-header`, `260804-1205-shell-reachability-model`, `260805-2005-textschicht-gegen-code-nachziehen`, `260819-1645-four-constraints-on-deep-change`.

Hard marker: `260716-1847-workbench-umbau`, `260801-1244-curator`, `260807-0923-guard-misst-statt-orakelt`, `260813-0858-playmaker-maintains-backlog-store`, `260815-0007-remove-eight-mechanisms-and-cap-growth`, `260816-1741-guard-becomes-observation-only`, `260820-2051-style-rules-arrive-and-get-measured`.

There is no reading of "the live tree" that rescues the claim. Under "the tree at HEAD outside `archive/`" it is false by six counter-examples. Under "non-terminal Circles" the set of *other* Circles is empty, since C2 is the only one, and the claim is vacuous rather than supporting.

## Why it is worth a record and not a shrug

The record is closed and the rule it produced is right — I verified the new section independently and it authorises the field's form without contradicting the template at `:135` or the worked example at `:164`. So nothing has to change in shipped text.

What is wrong is the evidence the argument was carried on, and it inverts the finding's character. Told that *every* other record spells a hard marker, a reader concludes the project had a uniform practice that the template was enforcing and that this Circle broke first. Told that six of thirteen already starred it, the same reader concludes the practice was already split, the template was already being ignored by nearly half the writers, and the new section is ratifying a majority-adjacent convention rather than inventing one. The second is what happened, and it is the stronger case for the rule.

The record's `## Verified` section does not list this claim among what was checked, which is at least honest about its provenance. It sits in `## What is wrong` as a bare assertion of fact.

## Verified

```
$ grep -h "^\*\*Active spec/plan:\*\*" fusion-workbench/circles/*/_*_circle.md
```
at HEAD `2ec2bc2`, classified by hand: 7 hard marker, 6 `_*_`, 2 `(none yet)`, plus C2's own starred field. `fusion-workbench/archive/` is not under `circles/` and is excluded by the glob. Separately read `rules/circle-records.md:130-170` and `:274-291` in full and confirmed the new section states no rule the template contradicts.

## Direction, not a prescription

The record is `_c_` and its rule shipped, so the cheapest correct action is to leave it and let this record stand as the correction beside it.

If it is amended: replace the sentence with the count, not with a hedge. "Seven of the thirteen Circle records that cite a plan spell a hard marker" says the same thing about the template's pull and is checkable.
