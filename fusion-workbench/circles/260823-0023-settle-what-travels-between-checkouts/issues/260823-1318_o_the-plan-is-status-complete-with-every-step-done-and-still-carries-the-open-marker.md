The plan is `Status: Complete` with every step `[DONE]` and still carries the `_o_` marker

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 2
**Affects:** `circles/260823-0023-settle-what-travels-between-checkouts/planning/260823-0800_o_c2-what-travels-between-checkouts-is-settled.md:4`
**Cross-references:** `rules/fusion-workbench-conventions.md:387`, which states both halves of the transition

---

## What is wrong

`rules/fusion-workbench-conventions.md:387` states one instruction with two parts: "When all steps are `[DONE]`: set `**Status:** Complete` in the header and rename the filename marker to `_c_`."

`b8a4c1a` marked step 9 `[DONE]`, which made all nine steps `[DONE]`, and set `**Status:** Complete` in the same commit. The filename still reads `260823-0800_o_…`.

## Why it may be deliberate, which is why this is Low and carries a question

Renaming the plan changes which gates cover it, in both directions and in the direction that loses coverage. `hooks/lib/__tests__/workbench-citation-lint.test.ts` admits a plan carrying `_o_` or `_p_` and no other marker, so `_c_` takes the file out of the citation gate's corpus. `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` judges live plans on the same two markers. Leaving the marker at `_o_` is therefore the state under which the plan's own citations stay judged, and this Circle has already recorded once, in `a76ee8f`'s commit message, that a rename out of a corpus makes a green suite mean less than it looks.

It is also possible the rename is simply owed at Circle closure rather than at the last step, in which case the rule sentence is what is wrong rather than the file.

## Verified

Read at HEAD `b8a4c1a`. All nine steps carry `[DONE]` at `:122`, `:130`, `:137`, `:145`, `:153`, `:161`, `:168`, `:176`, `:183`. The header reads `**Status:** Complete` at `:4`. `git show b8a4c1a` shows both edits in one commit and no rename.

## Direction, not a prescription

Answer one question and act on the answer. If the marker is meant to move when the last step lands, rename it here and accept that the plan leaves both gate corpora. If it is meant to move at Circle closure, say so at `rules/fusion-workbench-conventions.md:387`, which currently says otherwise and is the file every agent loads.
