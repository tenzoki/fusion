The corrected Grounding undercounts Setup's writes outside the workbench, and omits the step the shipped text names beside Step 0g

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 4 (`a2a18f9..2ec2bc2`)
**Affects:** `circles/260823-0023-settle-what-travels-between-checkouts/_t_circle.md:30` (`## Grounding snapshot`), and the same undercount in three further places listed below
**Cross-references:** `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-0800_*_the-groundings-first-write-outside-the-workbench-claim-was-already-false-when-it-was-written.md`, the record this correction closes; `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1405_*_the-window-to-correct-the-groundings-false-claim-closes-with-the-circle-and-nothing-says-so.md`, the deadline this record inherits; `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1455_*_the-shapers-mode-3-has-no-scope-value-for-a-grounding-only-correction-and-halts-on-the-only-case-that-needs-one.md`, why no agent may perform the repair

---

## What is wrong

`2ec2bc2` replaced a false claim in the Grounding with a corrected one. The correction is itself wrong, by one, and it omits the step that the Circle's own shipped-text edit names one line above the step being added.

The corrected sentence, at `_t_circle.md:30`:

```
/fusion:setup already writes outside fusion-workbench/, and this is the third such write rather
than the first. Step 0g writes .claude/settings.local.json and appends a line to .gitignore, both
at the project root and both older than this Circle.
```

**Step 0f writes `./fusion.json` at the project root and is not counted.** `skills/setup/SKILL.md:245-248`:

> `## Step 0f — Ensure the project configuration file is present locally`
> […]
> It lands at the project root, beside `fusion-workbench/` rather than inside it, in the directory `pwd` reported in Step 0.

So the files `/fusion:setup` may write outside `fusion-workbench/` are four, not three: `fusion.json` (Step 0f), `.claude/settings.local.json` and the `.gitignore` append (Step 0g), and `.gitattributes` (Step 0h). The merge driver is the **fourth** such write.

**The Circle's own source edit already says so.** `skills/setup/SKILL.md:319`, written in this Circle by `c9eba48`:

> Like Steps 0f and 0g, the write lands at the project root: `./.gitattributes` in the directory `pwd` reported in Step 0, outside `fusion-workbench/` and never in a subfolder.

The shipped text names two prior steps; the Grounding names one.

**Step 0f is older than the Circle**, on the same test the Grounding applies to Step 0g. `git log -S'## Step 0f' -- skills/setup/SKILL.md` gives `7f3d789`, 2026-08-04 15:13:18 +0200. The Circle record was created by `fff1291`, 2026-08-23 00:31:06 +0200 — nineteen days later.

## The same undercount stands in three more places

This is not one sentence. It originates in the planner's `## Current State` and was carried forward by every pass that read it:

1. `circles/260823-0023-settle-what-travels-between-checkouts/planning/260823-0800_*_c2-what-travels-between-checkouts-is-settled.md:43` — "Step 0g already writes two files at the project root".
2. The same plan, `:224` — "`## Current State` records that Step 0g already had two."
3. `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-0800_*_the-groundings-first-write-outside-the-workbench-claim-was-already-false-when-it-was-written.md`, the `Resolved:` note added by `2ec2bc2` — "so the merge driver is the third such write rather than the first".
4. `shared/issues/260823-1446_*_the-rebalance-recommendation-maps-from-the-flagged-edge-and-has-no-case-for-a-grounding-that-states-a-false-fact.md` — "Step 0g already wrote two files at the project root before the Circle was shaped, and `skills/setup/SKILL.md:319`, written during this Circle, now says so in the shipped text." That record cites `:319` as its evidence, and `:319` names Step 0f.

## Why this is worth stopping the closure for

Not because anything is broken. Nothing was built on either the false claim or the corrected one, and the merge-driver step is correct.

Because the window closes. `## Grounding snapshot` is Grounding-Stand only while the record carries `_a_` or `_t_` (`rules/circle-records.md:65`), `agents/shaper.md:28` makes mode 3 its only writer, and `260823-1455_*` records that mode 3 halts on exactly this case. The rename to `_c_` makes the sentence permanent, which is the argument `2ec2bc2`'s own commit message makes for having done the correction by hand at all. A correction that arrives one commit before the deadline and is wrong by one is the same deadline, unmet.

## Verified

Read `skills/setup/SKILL.md` Steps 0f (`:245-268`), 0g (`:270-313`) and 0h (`:315-345`) in full at HEAD `2ec2bc2`. Confirmed Step 0f is present at `3ee8eaf`, the commit before this Circle's first, at line 244 with the same project-root sentence. Dated Step 0f's arrival and the Circle record's creation with `git log --format='%h %ci %s'`. Grepped the four carrying sites named above and read each in context.

## Direction, not a prescription

Correct the count to four and name Step 0f beside Step 0g in `_t_circle.md:30`, before the closure rename. That is one sentence and it is the only edit with a deadline.

The plan and the two issue records are history the moment the Circle closes, so leave them; a reader who follows the Grounding to `skills/setup/SKILL.md:319` finds the right answer there. If any of them is corrected anyway, correct all three together rather than one, which is how this Circle's own citation defects were made.

Whether the Grounding's paragraph should still be introducing this as the second of "two costs accepted" is a separate question and is filed separately.
