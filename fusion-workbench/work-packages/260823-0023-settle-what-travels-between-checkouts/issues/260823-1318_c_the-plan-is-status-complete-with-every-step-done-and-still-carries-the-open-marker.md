The plan is `Status: Complete` with every step `[DONE]` and still carries the `_o_` marker

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 2
**Affects:** `260823-0800_*_c2-what-travels-between-checkouts-is-settled.md:4`
**Cross-references:** `rules/fusion-workbench-conventions.md:387`, which states both halves of the transition

---

## What is wrong

`rules/fusion-workbench-conventions.md:387` states one instruction with two parts: "When all steps are `[DONE]`: set `**Status:** Complete` in the header and rename the filename marker to `_c_`."

`b8a4c1a` marked step 9 `[DONE]`, which made all nine steps `[DONE]`, and set `**Status:** Complete` in the same commit. The filename still reads `260823-0800_*_…`.

## Why it may be deliberate, which is why this is Low and carries a question

Renaming the plan changes which gates cover it, in both directions and in the direction that loses coverage. `hooks/lib/__tests__/workbench-citation-lint.test.ts` admits a plan carrying `_o_` or `_p_` and no other marker, so `_c_` takes the file out of the citation gate's corpus. `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` judges live plans on the same two markers. Leaving the marker at `_o_` is therefore the state under which the plan's own citations stay judged, and this Circle has already recorded once, in `a76ee8f`'s commit message, that a rename out of a corpus makes a green suite mean less than it looks.

It is also possible the rename is simply owed at Circle closure rather than at the last step, in which case the rule sentence is what is wrong rather than the file.

## Verified

Read at HEAD `b8a4c1a`. All nine steps carry `[DONE]` at `:122`, `:130`, `:137`, `:145`, `:153`, `:161`, `:168`, `:176`, `:183`. The header reads `**Status:** Complete` at `:4`. `git show b8a4c1a` shows both edits in one commit and no rename.

## Direction, not a prescription

Answer one question and act on the answer. If the marker is meant to move when the last step lands, rename it here and accept that the plan leaves both gate corpora. If it is meant to move at Circle closure, say so at `rules/fusion-workbench-conventions.md:387`, which currently says otherwise and is the file every agent loads.
---

Resolved: 2026-08-23 by coder. The plan's filename marker was moved from `_o_` to `_c_` with `mv`:
`260823-0800_*_c2-what-travels-between-checkouts-is-settled.md`.

**The question this record asks was answered the first way, and the rule text was not touched.** The
marker moves when the last step lands, which is what `rules/fusion-workbench-conventions.md`
`### Planning files` already says in one instruction with two parts. The second reading, that the
rename is owed at Circle closure instead, would have required editing an always-on rule; it was not
taken, and the accepted cost is the one this record names. The plan now sits outside the workbench
citation gate's corpus and outside the stopping-section lint's, both of which admit `_o_` and `_p_`
only, so its own citations stop being judged from here on.

**Every hard-marker citation of the plan was rewritten to `_*_` before the rename**, twenty of them
across seventeen files: the Circle record's `**Active spec/plan:**` field, six history files, eight
issue records including this one, and both review files. Two further elided citations naming the
neighbouring `260823-0800_*_two-further-surfaces-classify-portfolio-md-as-an-authored-record.md` were
rewritten in the same pass on the same ground, one of them in a ninth issue record. An elided form
ending in an ellipsis is what a plain slug search misses and the citation parser still reads as a
pointer, so renaming first and searching after would have produced exactly the fault the High finding
beside this one records.

One citation was deliberately left alone: the `planner_done` row in
`fusion-workbench/orchestrator-events.jsonl`. It is a machine-written append-only record of what was
true at 06:08 on 2026-08-23, no gate reads it, and editing it would falsify a log rather than repair a
pointer.

**Measured.** Plans and workbench records sit on no bounded surface. Nothing in `agents/`, `skills/`,
the hook tests or the always-on rules moved for this item.

**Files:** the plan (renamed), and the eighteen files carrying a citation of it or of its neighbour.
Uncommitted at the time of writing; the orchestrator commits.
