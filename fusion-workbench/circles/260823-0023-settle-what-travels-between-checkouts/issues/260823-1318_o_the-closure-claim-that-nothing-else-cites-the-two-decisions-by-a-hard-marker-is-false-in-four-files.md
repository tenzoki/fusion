The claim that nothing else cites the two decisions by a hard marker is false, in four files

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 2
**Affects:** `circles/260823-0023-settle-what-travels-between-checkouts/history/260823-1243-coder-two-decision-records-close-as-implemented.md:53-55`, and the same claim in `a76ee8f`'s commit message
**Cross-references:** `circles/260822-1921-measure-what-two-checkouts-share/decisions/260822-2219_*_what-does-a-second-checkout-do-with-a-circle-record-marked-active-that-it-never-activated.md`; `shared/decisions/260822-1136_*_how-does-the-tracked-event-log-behave-when-two-checkouts-both-appended-to-it.md`

---

## What is wrong

`a76ee8f` renamed two decision records from `_a_` to `_i_` and recorded, as a checked fact, that the rename broke nothing: "Nothing else in the tree cites either record by a hard marker." The history file states it as "Every remaining citation of these two records elsewhere uses the `_*_` marker wildcard, so nothing dangled."

Four files cite those two records by a hard marker:

```
circles/260822-1921-measure-what-two-checkouts-share/history/260822-2239-reconciliation.md:52
  shared/decisions/260822-1136_o_how-does-the-tracked-event-log-behave-when-two-checkouts-both-appended-to-it.md
circles/260822-1921-measure-what-two-checkouts-share/history/260822-2219-analyst-two-checkout-isolation-measurement.md:34
  circles/260822-1921-measure-what-two-checkouts-share/decisions/260822-2219_o_what-does-a-second-checkout-do-…
circles/260822-1921-measure-what-two-checkouts-share/history/260822-2204-orchestrator-session.md:122
  circles/260822-1921-measure-what-two-checkouts-share/decisions/260822-2219_o_what-does-a-second-checkout-do-…
circles/260822-1921-measure-what-two-checkouts-share/analyses/260822-2219-what-two-checkouts-of-one-project-actually-share.md:265
  circles/260822-1921-measure-what-two-checkouts-share/decisions/260822-2219_o_what-does-a-second-checkout-do-…
```

**The rename broke none of them, and that is the point.** All four spell `_o_`, so all four were already dangling before this range opened: both records stood at `_a_` at `e41393e`. The claim is wrong about the tree while being harmless about this Turn's change, which is the shape that survives review, because the false half is invisible to anyone who only checks whether the rename caused a new break.

The likely cause is a search for the marker the rename moved from, `_a_`, rather than for the record.

## Verified

Searched at HEAD `b8a4c1a` for `_o_<slug>` and `_a_<slug>` over the whole tree for both records. Four `_o_` hits, zero `_a_` hits. `git show a76ee8f` confirms the two files were `_a_` before the rename, so no `_o_` citation of either has resolved since their first transition.

## Direction, not a prescription

Correct the four citations to the `_*_` wildcard form, which is what the project's citation form asks for, and correct the sentence in the history file so a later reader does not inherit a checked-sounding claim that is false.

Worth noting for the next pass that does this: none of the four files is in the citation gate's corpus. History files and analyses are outside it as reviews are, which is the same coverage gap filed separately this Turn.
