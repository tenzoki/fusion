# The citation form drops the store segment, and every gate, helper and shipped line reads the storeless form

---
**Domain:** code
**Filed by:** shaper (anticipated-circle mode), Kai Stalmann <ks@qantr.com>
**Claim:** Claimed 260829-1132: Kai Stalmann <ks@qantr.com>, checkout 5e8248d7.
**Active spec/plan:** 260829-1226_*_citation-form-drops-store-segment.md
**Active session history:** 260829-1133-orchestrator-session.md

---

## Directive

See `**Active spec/plan:**` above. The cited spec or plan states the Directive in force.

## Grounding snapshot

### The five answered decisions this Circle implements

All five are `_a_` in `shared/decisions/`, answered by the user on 2026-08-28, and this Circle is their implementation; none is reopened here.

1. `260828-0904_*_does-the-mandated-citation-form-include-the-store-segment.md`, option 1: storeless basename, marker wildcarded. Rests on (stamp, slug) uniqueness, which held at 863/863 live and 1249/1249 with archive when the record was filed.
2. `260828-0904_*_is-an-archived-record-a-citation-target.md`, option 3: moot under the storeless form. The gates' `unsweep()` resolution into `archive/` (shape 1, 260819) has no citation left to serve.
3. `260828-0904_*_should-the-uniqueness-claim-state-its-scope.md`, option 1: the sentence names live tree plus archive and the commit; a test pins it.
4. `260828-0904_*_are-shipped-record-citations-provenance-or-pointers-for-a-consuming-agent.md`, option 1: provenance. Shipped lines name fusion's own workbench, never a consumer resolver key; a lint forbids `$SCAN_*` beside a record stamp.
5. `260828-0904_*_does-fusion-ship-a-citation-checker-to-consuming-projects.md`, option 1: `bin/fusion-citation-check`, wrapping `hooks/lib/__tests__/helpers/citation-scan.ts`, stdout verdict, never a gate, in the shape of `bin/fusion-staging-drift`.

### The four clarifications made in this shaping

- **Sweep reach.** The old citation form is rewritten everywhere in the workbench, `archive/` included. The user chose this over live-only and over live-plus-terminal-Circles. Note the tension with `rules/circle-records.md` `### Worked transitions`, which says a terminal Circle's spec and plan are history and never reconciled in place: the sweep is a form rewrite of citation tokens, not a reconciliation of content, and the user's choice covers it. The planner should keep that distinction visible in the plan.
- **Store-prefixed form after the sweep.** A violation. The three gates and the helper report a citation with a store segment as an error. No transition period, no accept-either mode.
- **Bare stamps in shipped text.** Rewritten to the full form in `rules/`, `agents/`, `skills/`, `README*`, `CLAUDE.md`, `docs/`, so the reference-resolution gate judges them instead of classing them `stamp-bare` and skipping. The analysis counted 55 bare stamps in the shipped text at HEAD `19b58eef`; the count is re-measured at planning, not carried over.
- **Helper coverage in a consumer.** `bin/fusion-citation-check` reads the workbench plus the project's own `CLAUDE.md`, `rules/`, `.claude/rules/` and `docs/`. `/fusion:cleanup` prints the helper's verdict line in its report. The user chose this over workbench-only and over workbench-plus-CLAUDE.md-and-rules.

### What the corpus looks like now

- Four citation forms in the shipped text, measured in `260828-0859-citation-bookkeeping-defect-report-measured-against-fusions-own-corpus.md` (Instance 1): 55 bare stamp, 44 storeless, 57 store-prefixed, 5 without extension. The rule's own example is storeless while its prose says "full filename".
- 142 of 783 path citations in the gate corpus resolve only into `archive/` today (analysis, Finding 5). Under the storeless form these become valid once the store segment is dropped, which is what makes the sweep a rewrite rather than a repair.
- The `$SCAN_*` self-citations: **twenty-one lines in seven files** at HEAD `7bc0e78e`, per the 260828-1001-reconciliation.md reconciliation of `260828-0907_*_the-scan-store-self-citation-count-is-sixteen-at-head-and-the-acceptance-grep-matches-neither-the-list-nor-the-tree.md`. The count was twelve, then sixteen, then twenty-one across three passes; the acceptance grep for `260828-0900_*_twelve-shipped-lines-tell-a-consuming-agent-that-one-of-fusions-own-records-sits-in-its-scan-store.md` is the widened form (`.{0,160}`), and its empty result, not any number, is the criterion.
- The archive safety filter (`skills/archive/SKILL.md`, filter 3, around line 198) greps the literal basename with `-F` and cannot see the wildcard form: 75 of 863 live records are cited only in wildcard form and would be swept (`260828-0901_*_the-archive-safety-filter-greps-the-literal-basename-and-cannot-match-the-wildcard-citation-form-the-rule-mandates.md`, simulation, not verified by running the skill).
- The three gates: `hooks/lib/__tests__/workbench-citation-lint.test.ts` (no approvable baseline; recomputes its corpus on every run), `reference-resolution-lint.test.ts` (baseline at its tail, `stamp-bare` unjudged), `portfolio-citation-form-lint.test.ts`. The grammar they share is `hooks/lib/__tests__/helpers/citation-scan.ts`; `basenameMatcher`, `anchoredUnder`, `unsweep` and `findRecord` are the functions the storeless form touches.
- The consumer's original report is `260828-0828_*_fusion-citation-bookkeeping-defect-report.md`; its detector (`citation_form.py`) is offered but not shipped here.

### Constraints the planner inherits

- Four growth bounds: the always-on rule set, `agents/`, `skills/`, the hook-test line count (`hooks/lib/__tests__/helpers/growth-bound.ts`). The uniqueness test, the new lint and the gate changes all cost hook-test lines; the rule text costs always-on bytes; the twenty-one rewritten prompt lines cost `agents/` and `skills/` bytes. The way out of a red bound is a cut, not a baseline edit.
- A new `bin/` helper is one release behind: every `[ -x ]` call site takes its miss branch in the session that adds it, and the proof run belongs to the next session after `fusion --update` (`260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`).
- The `.cadence-anchors` file at the workbench root is untracked at HEAD `b6f5630a` and unrelated to this Circle; it is noted so a sweep over the workbench does not touch it.
- `workbench-citation-lint` has no baseline: the sweep and the gate change must land together or the suite is red in between. The planner decides the order; it is a technical decision and not made here.
- The citation of a rule file by heading anchor (`file.md` `## Section`) and the `path:line` form on `Resolved:`/`Answered:`/`Implemented:` lines are unchanged by the storeless form (`rules/fusion-workbench-conventions.md` `## Filename Patterns`, last paragraph). Only record citations are in scope.

### Out of scope

- Whether `curator` joins the `circle-records.md` emission list, and the open neighbours `260816-0119_*_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md` and `260823-1414_*_does-the-workbench-citation-gates-corpus-cover-review-files.md`. Neither is answered here.
- Shipping the consumer's `citation_form.py`. The helper is fusion's own, on the shared grammar.
- Restating or deciding the growth-bound baselines.

## Dependencies

(none)

Binding artifacts cited, not copied: the five `shared/decisions/260828-0904_*` records; `260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md` (the gate-corpus definition this Circle changes the reading of); `260818-0715-preventing-fusion-internal-identifiers-from-reaching-a-consuming-project.md` (the prior verdict that shipped stamps are provenance).

## Turn log


## Activation proposal

Playmaker session `260829-1128-playmaker-direct-dispatch.md` (`260829-1128-playmaker-direct-dispatch.md`), proposed activation 260829-1128-playmaker-direct-dispatch.md, domain bias `code`.

Recommended as the next Circle to activate, and the only candidate: no other record carries the anticipated marker and none is active. `## Dependencies` lists none, so nothing waits on another Circle. The Grounding cites one unresolved decision, `260823-1414_*_does-the-workbench-citation-gates-corpus-cover-review-files.md`, and the record names it as out of scope rather than as an input. Of the twelve marker-carrying records the Grounding cites, one is terminal (`260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`, closed; it is cited as a constraint, which a closed record still states); the other eleven are the five answered `260828-0904_*` decisions, four open defect records (`260828-0828_*_fusion-citation-bookkeeping-defect-report.md_*`, `260828-0900_*_twelve-shipped-lines-tell-a-consuming-agent-that-one-of-fusions-own-records-sits-in-its-scan-store.md_*`, `260828-0901_*_the-archive-safety-filter-greps-the-literal-basename-and-cannot-match-the-wildcard-citation-form-the-rule-mandates.md_*`, `260828-0907_*`), one answered decision (`260816-0119_*`) and the open decision above, all read off their filenames this run. HEAD `f659b04b` stands 7 commits past `b6f5630a`, the latest commit the snapshot records; none of those commits touched an agent, skill, rule or hook source (`260829-1109-reconciliation.md`, delta bound). One Grounding line has aged: `.cadence-anchors` is no longer untracked, `.gitignore:91` ignores it since commit `19b58eef`; it changes nothing the Circle does.
