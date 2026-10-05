Prose in three prompts, two skills and one rule still speaks of markers, and of a second mode, where the range left one
---
The step-10 classification searched for the control grammar's patterns and found nothing left to convert. The passages below carry no such pattern, so that search could not see them. Each describes state as a marker, or keeps a sentence or heading written for the time a skill had a legacy half. None instructs a rename.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md, 261005-1016-fj03d-step10-classification-re-run-at-the-side-branch-head.md

Severity: Low. Scope: the files named below, on `fj03d` at `cd1b5522`.

**Evidence.**

1. `agents/policy-curator.md`: "everything under `$SCAN_DECISIONS`, all five markers" (the list of surfaces at the top); "Advancing decision markers on ground-truth verification" and "Mechanical workbench shrinking by marker and date" (the eight exclusions); "Decision records, all five markers" (the evidence-source table, row 2). The table that closes the same prompt was converted in `693a29bc` and says "Decision states moved on ground-truth verification" and "by state and date", so the file states one thing in two vocabularies.
2. `agents/state-auditor.md`: the `description:` line of its frontmatter, "Updates status markers and progress notes", which is the text an agent listing shows; and the opening paragraph, "You never trust file headers or status markers at face value".
3. `skills/reconcile/SKILL.md`, the report list, item 1: "the tracking files the agent updated, by kind and count, and every marker it moved". The file is unchanged in the range; the agent it reports on now moves states through `transition`.
4. `rules/agent-setup.md` `## What fusion-rules emits`: the conventions file is described as carrying "marker vocabularies".
5. `skills/discuss/SKILL.md` `## Step 4`: "Take the stamp, the person and the domain, each guarded", and the block still runs `bin/fusion-identity`. Since `5bffedff` the body reads `domain=` only: the template has no `**Filed by:**` line and `bin/fusion-write` reads the identity itself.
6. `skills/wp/SKILL.md` and `skills/archive/SKILL.md` keep the heading `## On a JSON-controlled workbench` for what is now the only mode; in `skills/wp/SKILL.md` the `## Process` list ends "file it as below" and the filing block sits under that heading.
7. `skills/check/SKILL.md`, the section on the ignore hints, its closing paragraph: "`workbench.json` (R3) and `.json-state` (class L), a JSON-controlled workbench's, are classed by `JSON_LIVE_STATE` in `hooks/lib/staging-drift.ts` until the rule names them." `8a6100fc` removed that constant and merged its entries into `LIVE_STATE` and `LIVE_PREFIXES`, and `rules/workbench-tracking.md` names both surfaces since the same commit. This one names a symbol that no longer exists, so it is the item to take first.

**Acceptance.** Items 1 to 4 name states where they mean states. Item 7 names the two lists the code has, or cites the tracking rule alone. Item 5 drops the unused read and its word in the sentence, or says what the output is for. Item 6 is renamed or left by an explicit note in the closing line of this record; a heading rename takes every anchor citing it with it (`reference-resolution-lint` green). The surface and dispatch-path bounds stay green with no baseline moved.

Executor: `code-implementer`.
