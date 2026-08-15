# The three-churn-references record lists three and two remain

---

`260815-1206_o_three-churn-references-survive-step-4-in-files-the-step-does-not-name.md` is open and
names three surviving churn references. Its third, `skills/help/SKILL.md:106`, was struck by
`04ea182` eleven minutes after the record was filed. The record was not annotated, so a reader
acting on it goes looking for a line that is not there and, more importantly, cannot tell from the
record which of the three are still work.

---

**Severity:** Low — one append to one record.
**Domain:** code
**Filed by:** `coderev`, reviewing `7c12d6a..5d29b6d` (`reviews/260815-1251-coderev-turn-2-build-churn-and-stash.md`)
**Owner:** whoever next touches the record; the fix is an append, not a transition
**Affects:** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1206_o_three-churn-references-survive-step-4-in-files-the-step-does-not-name.md`
**Cross-references:** `issues/260815-0803_o_gitignore-still-carries-the-ship-exception-for-the-deleted-bin-fusion-plane.md` — the same `.gitignore` block now carries two stale exceptions

**Verified 2026-08-15 at HEAD `5d29b6d`.** `grep -rniI churn skills/help/SKILL.md` returns nothing.

## Verified at HEAD

```
$ grep -rniI churn skills/help/SKILL.md
$   # no output
```

`04ea182` changed the compliance-guard pointer at `skills/help/SKILL.md:106` from
*"Decision categories and their sensitivities, churn thresholds, escalation behavior"* to
*"Decision categories and their sensitivities, escalation behavior"*. Its commit message states the
reason and states that the other two were deliberately left:

> *"the help skill's pointer, which told users to read the example config for 'churn thresholds',
> was struck. … Two of the three references step 4 filed are deliberately still standing."*

The two that stand are `.gitignore:39` (`!bin/fusion-churn-rank`) and `.claude-plugin/plugin.json:4`
(the description still advertising "churn detection"). Both confirmed present.

## Why this is worth a line rather than shrugging off

The record's **title** stays true: three references did survive step 4, in files step 4's list did
not name. What has gone stale is its body — the numbered list and the `## What it would take`
section, which prescribes three edits. `rules/fusion-workbench-conventions.md` `### Issue files`
gives the mechanism for exactly this: append below the existing content. This record needs a partial
note rather than a `Resolved:` footer and a `_c_` rename, since two thirds of it is live.

It is also the third time in two Turns that this Circle has produced a record whose subject moved
under it, which is the class `shared/issues/260810-0819` tracks and which the two Turn-1 reviews
both named as the Circle's dominant defect shape.

## What it would take

Append to `260815-1206_o_…`:

```
---
Item 3 (`skills/help/SKILL.md:106`) resolved in `04ea182`, the step-5 commit, which named the
edit and its reason. Items 1 and 2 stand: `.gitignore:39` and `.claude-plugin/plugin.json:4`.
```

Leave the marker `_o_`.

## Related

- `260815-1206_o_three-churn-references-survive-step-4-in-files-the-step-does-not-name.md`
- `260815-0803_o_gitignore-still-carries-the-ship-exception-for-the-deleted-bin-fusion-plane.md` —
  the same `.gitignore` block, filed by `ontorev` in Turn 1; it now carries **two** stale
  exceptions, and step 11 adds a third when `bin/fusion-state-drift` goes
- `history/260815-1217-ontocoder-step5-churn-configuration-leaves.md`
