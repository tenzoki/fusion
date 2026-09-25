# Which citation corpus does the archive safety filter protect?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260825-1440_*_the-archive-safety-filter-checks-only-claude-md-while-the-citation-lint-guards-a-corpus-thirty-one-files-wider.md` (the measurement: 14 Circles, 31 citing files); `skills/archive/SKILL.md` `## Safety filters` item 3 and Step 4; `hooks/lib/__tests__/workbench-citation-lint.test.ts` (the gate that goes red); `260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md` (the accepted cost of a red sweep, for a sweep somebody chose); `260823-1414_*_does-the-workbench-citation-gates-corpus-cover-review-files.md` (the neighbouring open question on the gate's own corpus)

---

## Question

Filter 3 keeps a candidate when `CLAUDE.md` cites it, on the ground that a loaded file's references must resolve. Rule files, agent prompts, skill bodies, tests and `**Provenance:**` headers are loaded or checked by the same argument and are not consulted, so an unattended tier-1 run breaks 31 citations and reddens `npm test` in this repository. The repair plan needs to know which corpus the filter reads before the skill body is edited.

## Options

1. **Widen filter 3 to the shipped corpus.** The grep runs over the same file set `workbench-citation-lint.test.ts` scans (`CLAUDE.md`, `README*.md`, `rules/`, `agents/`, `skills/`, `hooks/lib/`, `hooks/*.ts`, `bin/`, `docs/`), so the filter and the gate agree by construction. In a consuming project without those directories the set collapses to `CLAUDE.md` and the project's own `rules/` and `.claude/rules/`.
   - Pros: the sweep that turns the suite red becomes impossible; one enumeration, authored once, named in both places.
   - Cons: the filter's file set becomes a second copy of the gate's corpus unless the skill body reads it from the test, which a skill cannot; more Circles stay unarchived in this repository (14 of 18 today).
2. **Keep the filter narrow and take tier-1 off the unattended path.** `/fusion:cleanup` Step 4 runs a dry survey and asks at the Step 6 gate; the move is always a choice with the list in front of the user.
   - Pros: no corpus to keep in step; the accepted-cost decision `260819-1645` was about a chosen sweep and this makes every sweep chosen.
   - Cons: a second stop in a pipeline that was just reduced to one (decision `260827-1311_*_where-in-the-cleanup-pipeline-does-the-one-gate-stand.md`); consuming projects with no shipped corpus pay a prompt for a hazard they do not have.
3. **Sweep, then rewrite the citations the sweep broke.** The archive destination is derivable from the source path, so the step rewrites every citation in the shipped corpus.
   - Pros: nothing stays unarchived on account of a citation.
   - Cons: an unattended step editing shipped text; and whether an archived Circle's citations should be rewritten at all is open.

## Constraints

- `skills/archive/SKILL.md` and `skills/cleanup/SKILL.md` are on the `skills/` bound, 88 bytes free at `0fb5085`; every option spends bytes there and waits for the plan's one cut.
- The tier modes treat safety filters as hard guardrails; whatever is chosen is a filter, not a prompt.

## Recommendation

Option 1, with the corpus written as a positive enumeration in the skill body and the test's `inCorpus` comment naming the skill as its twin, so a change to either is a change to both by citation. Option 2 is the safer fallback if the enumeration proves too costly on `skills/`.

## Answer

Option 1: the filter's corpus is a positive enumeration in the skill body, the test's `inCorpus` comment names the skill as its twin. Option 2 remains the fallback if the enumeration proves too costly on `skills/`. Realised by plan step 12.

Answered: 260827-1830, Kai Stalmann <ks@qantr.com> at the orchestrator gate of session 260827-1749-orchestrator-session.md; the recommendation is adopted as written.

Implemented: `skills/archive/SKILL.md:118` (filter 3) and `skills/archive/SKILL.md:193` (Step 4's grep), commit pending (the orchestrator commits plan step 12 after this task) — the filter's corpus is the positive enumeration; `hooks/lib/__tests__/workbench-citation-lint.test.ts` names the filter as its twin at the `inCorpus` comment. 260827-2022-coder-session.md, coder, Kai Stalmann <ks@qantr.com>.

Reconciled 260827-2034-reconciliation.md: the `Implemented:` line above was written before the commit; it landed in `d1489cc1` (this file and the shipped edit in the same commit).
