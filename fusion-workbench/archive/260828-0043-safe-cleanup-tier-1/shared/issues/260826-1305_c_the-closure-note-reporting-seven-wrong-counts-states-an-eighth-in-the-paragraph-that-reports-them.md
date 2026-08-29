The closure note reporting seven wrong counts states an eighth, in the paragraph that reports them

---
A Circle closed on the finding that a cardinality stated in prose does not stay true. Its
closure note states one that was already false when written, inside the paragraph making
that argument. The orchestrator wrote it.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Severity:** Low as a defect, high as evidence.

**Cross-references:**
`260825-2023-presence-travels-monitor-filters-own-checkout` `## Closure note`;
`260826-1252_*_how-does-this-project-keep-a-cardinality-stated-in-prose-true-when-seven-passes-could-not.md`;
`260826-1301-playmaker-orchestrator-phase4.md`

## What was measured

The closure note of Circle `260825-2023-presence-travels-monitor-filters-own-checkout`,
written at commit `8d06759`, opens a paragraph:

> **Sixteen defect records stay open and are the follow-on Circle's inheritance.**

Fourteen are open. Measured at that same commit and in the working tree:

```
$ ls .../issues/*_o_*.md | wc -l        →  14
$ ls .../issues/*_c_*.md | wc -l        →  18
$ git ls-tree --name-only 8d06759 .../issues/ | grep -c '_o_'  →  14
```

The two it is over by are `260826-0136_*_the-absent-rather-than-empty-rule-has-no-expression-in-any-of-the-three-emit-templates.md_*` and `260826-0140_*_the-new-setup-step-2-identity-call-moves-a-halt-from-first-filing-to-setup-and-nothing-says-so.md_*`, closed at `753932b`, eight
commits before the note was written.

**The note's own three-way split is arithmetically consistent with fourteen and not with
sixteen.** It says five need hook-test lines, two await a user direction call, and the rest
are the Turn 3 findings plus the seventh count plus the resumption record. That remainder is
seven, and 5 + 2 + 7 = 14. So the sentence contradicts the sentences under it, which is the
cheapest possible way to catch this class of error and is how the playmaker caught it.

## Why this is filed rather than corrected

Two reasons, and the first is binding.

**The record is terminal.** `rules/circle-records.md` `## State Markers — circles` holds that
`_c_`, `_b_`, `_s_` and `_d_` are terminal and that a terminal record is never edited, because
a contradiction preserved in it is evidence. Editing this one would remove the specimen and
leave only a report about it.

**And the route was already chosen.** The user answered the Rebalance gate on the seventh
instance by filing the question rather than correcting the number, on the reasoning that a
ninth pass finds a ninth. Correcting the eighth by hand while the seventh stands filed would
apply two different rules to one pattern within an hour.

## What it adds to the open question

The decision record
`260826-1252_*_how-does-this-project-keep-a-cardinality-stated-in-prose-true-when-seven-passes-could-not.md`
argues from seven instances that the pattern is a property of stating cardinalities in prose
rather than carelessness in one Circle. This is the eighth, and it sharpens the argument in
three ways the seven did not.

**It was written by the party stating the argument, in the act of stating it.** The seven were
written by executors and found by later passes. This one was written by the orchestrator, in
the sentence explaining that this exact thing keeps happening, with all seven prior instances
in front of it. Awareness of the pattern is demonstrably not a defence against the pattern.

**It was catchable from inside the text.** No tree read was needed: the paragraph's own
following sentences enumerate 5, 2 and 7. That is a different detector from the two the
decision record's options contemplate, and it is cheap: a stated total against an enumeration
in the same paragraph.

**Its referent moves without any prose being touched.** Every closure or filing changes the
number, so it was true at no commit and false at every one. Options 1 and 2 of the decision
record both reach it, and option 3 reaches it best, since the count is mechanically enumerable
by the very `ls` above.

## What is not claimed

Not that the closure note's argument is weakened. The opposite: the eighth instance is the
strongest evidence in it, and it arrived too late to be cited by it.

Not that the follow-on inheritance is misdescribed in substance. The three-way split, the five
needing hook-test lines, the two direction calls and the seven others are all correct. Only
the total is wrong.

Not that the playmaker's fourteen should be taken on trust either. It is restated above with
the commands, and a reader should run them.

## Fix direction

None here, deliberately. The number lives in a terminal record that may not be edited, and the
question of how this project keeps such a number true is open in the decision cited above.
This record exists to be the eighth data point when that decision is answered.

**Scope.** No shipped file. One workbench record, unedited by design.

---
Resolved: no change, as the record's own `## Fix direction` foresaw. The terminal record `260825-2023-presence-travels-monitor-filters-own-checkout` stays unedited as the specimen. The decision this record was filed to inform is answered: `260826-1252_*_how-does-this-project-keep-a-cardinality-stated-in-prose-true-when-seven-passes-could-not.md` `## Answer`, options 2 and 3, realised as `rules/critical-stance.md` §5 in commit `ae00e84`. Plan `260827-1756_*`, step 14.
