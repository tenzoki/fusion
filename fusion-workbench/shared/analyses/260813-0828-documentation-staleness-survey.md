# Analysis: documentation staleness across the fusion plugin source

**Date:** 2026-08-13 08:28
**Type:** Gap
**Status:** Complete
**Requested by:** user (via orchestrator dispatch), as the Grounding snapshot for a documentation Circle

## Verdict

The drift is **narrow and shallow, not broad**. The two changes a survey would expect to have
broken the docs did not break them: all four version surfaces read `8.1.0`, and the removal of
the guard's protected-path half on 2026-08-12 is described accurately and in detail in every
place that describes the guard. What is actually stale is the **v8.1.0 feature set**, and it is
stale unevenly. The release's documentation step (commit `0978e9a`) touched `CLAUDE.md`,
`README.md` and `README-agents.md` and stopped there, so `docs/working-model.md`,
`docs/philosophy.md` and `skills/help/SKILL.md` describe a system with no backlog store, no
`/fusion:direct`, and a shaper that produces a spec rather than a Circle.

**The worst surface is `README-agents.md`.** It was touched by the release sweep and still
carries four separate defects: the shaper and planner rows describe write scopes both agents
outgrew in the same release, the Turn-loop diagram hardcodes a number that became
project-configurable two days earlier, and the closing paragraph cites a workbench directory
that the v4.0.0 layout deleted. It is the file a reader goes to for the authoritative agent
reference, and it is the file most out of step with the agent prompts.

Second worst is **`CLAUDE.md`**, on a different axis: it is accurate about behaviour and
incomplete about inventory. Its Layout table enumerates ten of the fifteen `bin/` helpers, and
one of the five it omits (`bin/fusion-count-sources`) is documented in no markdown file
anywhere in the repository.

## Scope

Surveyed: `README.md`, `README-agents.md`, `README-hooks.md`, `docs/philosophy.md`,
`docs/working-model.md`, `docs/plane-setup.md`, `install.sh` header comment, `CLAUDE.md`,
`skills/help/SKILL.md`.

Method: `git log` per document against `git log` per subsystem, then direct reading of both
sides of every candidate. Because every document except `docs/plane-setup.md` was last touched
on 2026-08-12, the commit-recency signal was almost worthless here and nearly all of the work
was reading. Machine checks run: the citation lint (`reference-resolution-lint.test.ts`), the
enumeration lint (`derivable-enumerations-lint.test.ts`), and the full 48-file hooks suite.

## What the existing machine checks already cover

The repository ships two lint gates that make several of the requested leads answerable
mechanically rather than by reading.

`hooks/lib/__tests__/reference-resolution-lint.test.ts` resolves three classes of citation:
plugin-file paths, section-heading anchors, and workbench-record citations. Its scanned surface
(`reference-resolution-lint.test.ts:136-172`) includes `rules/**`, `agents/**`, `docs/**`,
`templates/**`, every `skills/*/SKILL.md`, every root `README*.md`, `CLAUDE.md`, the comment
lines of every `bin/` shell script, and `install.sh`. **Every surface in this survey's scope is
inside that coverage**, and the gate passes at HEAD (33 tests green). So lead 6, dead citations,
is answered: there are no dangling plugin-path, section-anchor or workbench-record citations in
any of these documents.

Two gaps in that coverage produced findings below. The gate does not resolve **workbench
directory paths** written as prose (`fusion-workbench/history/`), because class (a) matches only
paths under a plugin directory and class (c) matches only record filenames. And a `./rules/…`
spelling is skipped by design as the consuming project's directory.

`hooks/lib/__tests__/derivable-enumerations-lint.test.ts` re-derives the skill roster, the agent
count, the always-on rule list and the `hooks/lib` file table from the tree. It passes, which
answers lead 4: **the agent and skill inventories are correct everywhere they are stated.**
Sixteen agents in `agents/*.md`, sixteen skills in `skills/*/SKILL.md`, and the lists in
`README.md:3`, `README-agents.md:200-215`, `CLAUDE.md:14` and `docs/philosophy.md:11` all agree
with the tree. The `bin/` helper inventory is **not** covered by either gate, which is why the
gap below survived.

## Findings

| # | Surface | What it claims | What is true | Evidence (claim → reality) | Severity |
|---|---|---|---|---|---|
| 1 | `README-agents.md` | The shaper writes `planning/` (spec files), `issues/`, `history/`. | Since v8.1.0 the shaper's anticipated-circle mode creates a Circle directory as its **first** write, and reads the backlog store to close the entry a draft came from. Its resolver key set carries `OUT_CIRCLE` and `SCAN_BACKLOG`. | `README-agents.md:25` → `agents/shaper.md:28`, `agents/shaper.md:64`, `agents/shaper.md:79`; `bin/fusion-paths shaper` emits `OUT_CIRCLE=circles` and `SCAN_BACKLOG=shared/backlog` | wrong |
| 2 | `README-agents.md` | The planner writes `planning/`, `issues/`, `history/`, and takes no dispatch parameter. | The planner accepts `**Circle:** <directory-name>`, passed to the resolver as a second argument, which places the plan and every record it files inside a named Circle instead of the active one. | `README-agents.md:26` → `agents/planner.md:13`, `agents/planner.md:53-55` | missing |
| 3 | `README-agents.md` | The Turn loop runs `max 5 Turns`, drawn as a constant in the pipeline diagram. | The budget is project-settable via `{"orchestrator": {"maxTurns": N}}` in `fusion-guard.json`, resolved once per session by `bin/fusion-turn-budget`. 5 is the built-in default, defined in one place. The turn-budget lint scans only `agents/orchestrator.md` and `skills/setup/SKILL.md`, so this surface is unguarded. | `README-agents.md:110` → `hooks/lib/config.ts:277`, `templates/fusion-guard.json` `_turnBudget`, `hooks/lib/__tests__/turn-budget-lint.test.ts:44-45` | stale |
| 4 | `README-agents.md` | "Historical session logs in `fusion-workbench/history/`". | That directory has not existed since the v4.0.0 Circle-container restructure. History lives in `shared/history/` and `circles/<dir>/history/`. Verified absent on disk. | `README-agents.md:268` → `rules/fusion-workbench-conventions.md` layout; `README-agents.md:225-236` states the correct layout 40 lines earlier | wrong |
| 5 | `README-agents.md` | "Adding a new agent" step 5 says register in the "`CLAUDE.md` folder structure block" and the "`CLAUDE.md` key-documentation table". | `CLAUDE.md` has neither. It has one `## Layout` table, and agents are listed in a prose bullet under `## What this is`. | `README-agents.md:262-265` → `CLAUDE.md:14`, `CLAUDE.md:25` | stale |
| 6 | `CLAUDE.md` | The `## Layout` table enumerates the `bin/` helpers. | It carries rows for ten of the fifteen files in `bin/`. Missing: `fusion-commit-lock`, `fusion-count-sources`, `fusion-review-coverage`, `fusion-staging-drift`, `fusion-state-drift`. Three of the five are documented in `README-hooks.md`; `fusion-commit-lock` is documented in `rules/workbench-stash-and-lock.md:128`; **`fusion-count-sources` is documented in no markdown file in the repository.** | `CLAUDE.md:29-40` (rows) → `ls bin/` (15 files); `README-hooks.md:177-179`; `rules/workbench-stash-and-lock.md:128` | missing |
| 7 | `CLAUDE.md` | The workbench in this repo is git-tracked, "612 files since `e8988d9` (260801)". | `git ls-files fusion-workbench` returns 1023. The count is 40% low. | `CLAUDE.md:51` → `git ls-files fusion-workbench \| wc -l` = 1023 | stale |
| 8 | `CLAUDE.md` | "four agents accept run-time parameters passed via the dispatch prompt", enumerating Domain, Executors and Deliverable language. | Five parameters exist across four agents. The planner's `**Circle:**` parameter, added in `994fe05`, is absent from the bullet. | `CLAUDE.md:56-60` → `agents/planner.md:53` | missing |
| 9 | `README.md` | The plugin's `hooks/config.json` "defines the defaults: decision-to-path mappings and sensitivity levels, escalation thresholds and per-session churn thresholds", and `hooks/config.example.json` "documents the full key shape". | `hooks/config.json` ships `categoryPaths: {}`, `categorySensitivity: {}` and `decisions: []`, so it defines no mappings and no sensitivities. There are three layers, not two: project, plugin, then built-in `DEFAULTS` in `hooks/lib/config.ts`. And `config.example.json` documents neither `orchestrator.maxTurns` nor the retired `guard.protectedPaths`; `templates/fusion-guard.json` documents both and is the file a project actually edits. | `README.md:100` → `hooks/config.json:1-24`, `hooks/lib/config.ts:265-279`, `templates/fusion-guard.json` | wrong |
| 10 | `README.md` | The guard configuration section and the tuning table list every knob worth changing. | Two knobs are absent. `orchestrator.maxTurns` is settable in `fusion-guard.json` and appears nowhere in `README.md` (zero matches). The retired `guard.protectedPaths` key emits an advisory on **every guarded tool call** until the line is deleted, which is what an upgrading project will actually see, and only `README-hooks.md:268` says so. | `README.md:100-113` → `templates/fusion-guard.json` `_turnBudget` and `_override`; `README-hooks.md:268` | missing |
| 11 | `docs/working-model.md` | §2 "Spec-driven flow": "shaper takes an ambiguous request and produces a **spec**". | Under the v8.1.0 Circle-first placement rule the shaper's anticipated-circle mode produces a Circle, not a spec, and creates it before anything else it writes. The doc's flow diagram has no branch for it. | `docs/working-model.md:31-35` → `agents/shaper.md:64`, `agents/shaper.md:79`; commit `406ec0d` | missing |
| 12 | `docs/working-model.md` | §1 describes the Circle lifecycle and how a Circle comes into existence; §5's walkthrough runs a session end to end. | Neither mentions the backlog store, `/fusion:direct`, or the idea-to-Circle path. The file was not touched by the v8.1.0 documentation sweep. | `docs/working-model.md:7-24`, `:87-103` → `README.md:131`, `README-agents.md:233`; `git show --stat 0978e9a` (touches `CLAUDE.md`, `README.md`, `README-agents.md` only) | missing |
| 13 | `docs/philosophy.md` | §3 Traceability: "`/fusion:memo` captures personal notes; `/fusion:log-activity` scans commits and the workbench into a per-day activity log." | Since v8.1.0 `/fusion:memo` is also the one user surface that files a backlog entry, and `/fusion:cadence` is a third traceability surface that the paragraph omits entirely. | `docs/philosophy.md:15` → `skills/memo/SKILL.md`, `README.md:149`, `README-agents.md:204` | missing |
| 14 | `skills/help/SKILL.md` | Topic 2 item 2, "Pick the right entry point", routes ten kinds of request to an agent or skill. | There is no route for capturing an idea (`/fusion:memo` to the backlog) and no route for drafting a Directive without starting work (`/fusion:direct`). Both are v8.1.0 user surfaces, and this skill is fusion's only in-session documentation. | `skills/help/SKILL.md:55-65` → `skills/direct/SKILL.md`, `skills/memo/SKILL.md`, `README.md:93` | missing |
| 15 | `skills/help/SKILL.md` | Topic 2 item 3 describes the workbench: circles, `shared/`, `tasklist.md`, and the artifact kinds "plans, defects in issues, open questions in decisions". | The list omits `shared/backlog/` and `portfolio.md`. The file was not touched by the v8.1.0 documentation sweep. | `skills/help/SKILL.md:67-69` → `README.md:129-136`, `rules/fusion-workbench-conventions.md` layout | missing |

### The three leads that came back clean

Stating these explicitly, because a survey that reports only defects invites the reader to assume
everything unmentioned is broken.

**Version-surface coherence (lead 1) is clean.** All four surfaces read `8.1.0`:
`.claude-plugin/plugin.json:3`, the marketplace entry at
`/Users/k1/Projects/productive/F03-CLAUDE-plugin-marketplace/claude-plugins/.claude-plugin/marketplace.json:42`,
`install.sh:27` (`FUSION_REF=tags/v8.1.0`) and `README.md:26` (same pin). The `v8.1.0` tag exists.
The marketplace working clone is clean at `4955ed1 chore: fusion 8.1.0`. The cache clone at
`~/.claude/plugins/marketplaces/tenzoki-plugins` does not exist, which `CLAUDE.md` already
documents as a known state rather than a fault.

**The v8.0.0 removal (lead 2) is clean, and `README-hooks.md` is the best-maintained document in
the set.** It describes the removal in a dedicated section (`README-hooks.md:272-282`) naming
every module that went, states the two remaining block sources
(`README-hooks.md:238`), documents the retired-key advisory (`README-hooks.md:268`), explains
what a legacy halt still does (`README-hooks.md:282`), and records that the shell is no longer
read at all (`README-hooks.md:18`). It carries no residual claim about the write-back, the
fingerprint, `FUSION_ALLOW_RULES_WRITE`, or the deleted git branch-switch policy.
`README.md:113` and `docs/working-model.md:81-83` carry matching, accurate summaries.

**Dead citations (lead 6) are clean**, by the machine check described above rather than by
reading. The two findings that look like dead citations (rows 4 and 5) are not in the lint's
grammar: row 4 is a workbench directory in prose, row 5 is an English description of a document
section rather than a citation of one.

**`docs/plane-setup.md` is not confirmed stale.** It lags `bin/fusion-plane` by one commit
(`1d5eed6`, 2026-08-11), but that commit's change to the helper was a test-seam comment in the
helper's own header (`--comments-fixture`), not user-visible behaviour, so the install doc needs
nothing from it. I did not audit the rest of that 466-line document against the tool.

## Implications

Three things follow for the Circle.

**The version and citation machinery is working, so the Circle should not spend steps
re-verifying it.** The two lint gates cover exactly the classes that rot silently. The defects
that survived are the classes no gate derives: prose descriptions of agent scope, an inventory
table nobody diffs against `ls`, and a count written by hand.

**The v8.1.0 release shipped its documentation half-done, and the boundary is visible in one
`git show`.** Nine of the fifteen findings (rows 1, 2, 8, 11, 12, 13, 14, 15, and half of 3) are
the same omission: the release's documentation step reached three files and the feature reached
seven surfaces. That is a process observation as much as a content one, and it is worth naming in
the Circle's Grounding.

**Two findings are cheap gates rather than prose.** Row 6, the `bin/` inventory, and row 7, the
workbench file count, are both mechanically derivable from the tree, in exactly the sense
`derivable-enumerations-lint.test.ts` already means by that word. Adding them to that gate is a
smaller and more durable fix than correcting the two lines, and it fits the existing abstraction
rather than introducing a new one.

## Proposed step split

Ordered so the mechanical work is separable from the judgement-heavy work, and so no step depends
on a later one.

**Group A — mechanical corrections. Each is a single-line or single-row edit with a verified
target value. No design judgement, no user gate.**

1. `README-agents.md:268` — replace `fusion-workbench/history/` with the v4.0.0 spelling.
   (Finding 4.)
2. `README-agents.md:262-265` — correct the two `CLAUDE.md` section names in "Adding a new
   agent". (Finding 5.)
3. `CLAUDE.md:51` — correct 612 to the measured count. (Finding 7.)
4. `CLAUDE.md:29-40` — add Layout rows for the five missing `bin/` helpers, each pointing at
   wherever it is already authored rather than restating it. `fusion-count-sources` needs a real
   row, since it has no authoring home. (Finding 6.)
5. `CLAUDE.md:56-60` — add the planner's `**Circle:**` parameter to the dispatch-parameters
   bullet. (Finding 8.)

**Group B — gate work, so groups A3 and A4 cannot rot again.** Extend
`derivable-enumerations-lint.test.ts` to derive the `bin/` roster from the tree and diff it
against `CLAUDE.md`'s Layout table, and to check the workbench file count against
`git ls-files`. This is one file, follows the gate's existing shape, and is independently
testable. Run it after Group A so the first run is green.

**Group C — reference corrections with a verified target but more than one line of prose.**

6. `README-agents.md:25-26` — rewrite the shaper and planner rows against the current prompts and
   resolver key sets. (Findings 1 and 2.)
7. `README-agents.md:110` — replace the hardcoded `max 5 Turns` in the diagram with the
   configurable budget, and decide whether the turn-budget lint should scan this surface too.
   (Finding 3.)
8. `README.md:100` and the tuning table — correct the configuration-layer description, point the
   reader at `templates/fusion-guard.json` for the per-project shape, and add `maxTurns` and the
   retired-key advisory. (Findings 9 and 10.)

**Group D — prose rewrites. These need judgement about what a reader needs and how much to say,
and each touches a document's argument rather than a fact in it. Slowest, and last.**

9. `docs/working-model.md` §2 — fold the Circle-first placement rule into the spec-driven flow,
   including the diagram. (Finding 11.)
10. `docs/working-model.md` §1 and §5 — introduce the backlog store and the idea-to-Circle path,
    and decide whether the walkthrough gains a step or a second walkthrough. (Finding 12.)
11. `docs/philosophy.md:15` — extend the traceability paragraph to the current three surfaces.
    (Finding 13.)
12. `skills/help/SKILL.md` topic 2 — add the two missing entry points and the backlog to the
    workbench description. (Findings 14 and 15.)

Groups A and B can run in one Turn without a user gate. Group C wants a reader. Group D is where
the Circle will actually spend its time, and where a reviewer is worth dispatching.

## Filed issues

- `260813-0828_*_three-tests-fail-at-head-in-two-files-and-no-open-record-names-them.md`
  — three test failures reproduce at HEAD in `circle-stash-git-exclusion.test.ts` and
  `fusion-plane.test.ts`. A code defect, out of scope for a documentation Circle, and not covered
  by the one open record about that suite.

No issue was filed for any documentation defect. Those are the fifteen rows above, and the Circle
carries them.

## Sources

Documents read in full: `README.md`, `README-agents.md`, `docs/philosophy.md`,
`docs/working-model.md`, `skills/help/SKILL.md`, `CLAUDE.md`. Read in part: `README-hooks.md`
(lines 1-60 and every line matching the removal and inventory greps), `install.sh` (header),
`docs/plane-setup.md` (grep only).

Code and prompts read for the reality side of each row: `agents/shaper.md`, `agents/planner.md`,
`hooks/config.json`, `hooks/config.example.json`, `hooks/lib/config.ts`,
`templates/fusion-guard.json`, `bin/fusion-count-sources` (header),
`bin/fusion-commit-lock` (header), `rules/workbench-stash-and-lock.md`.

Tests read and run: `hooks/lib/__tests__/reference-resolution-lint.test.ts`,
`hooks/lib/__tests__/helpers/citation-scan.ts`,
`hooks/lib/__tests__/derivable-enumerations-lint.test.ts`,
`hooks/lib/__tests__/turn-budget-lint.test.ts`, and the full suite
(`cd hooks && npx vitest run`: 46 of 48 files green, 1007 of 1010 tests green).

Commands run for measured values: `git ls-files fusion-workbench | wc -l`,
`ls bin/ agents/ skills/ docs/ rules/ templates/`, `bin/fusion-paths shaper`,
`bin/fusion-paths planner`, `git show --stat` on `0978e9a`, `994fe05`, `406ec0d`, `dec40bb`,
`1c2d555`, `1d5eed6`.

## What I did not check

Read this list before treating anything unmentioned as verified.

- **`docs/plane-setup.md` was not audited.** It is 466 lines and the largest document in scope. I
  checked only its commit recency against `bin/fusion-plane` and one specific claim. Every
  command form, config field, state mapping and troubleshooting step in it is unverified.
- **`README-hooks.md` was not read line by line.** I read lines 1-60 and every line matching the
  protected-path, branch-policy and helper-inventory greps, which is enough to clear lead 2. Its
  remaining ~300 lines, including the configuration reference and the event-table, are
  unverified beyond what the two lint gates cover.
- **`install.sh` beyond its header comment.** I verified the `FUSION_REF` pin example and read
  nothing else. The installer's claims in `CLAUDE.md` about what it copies and what
  `settings.json` does were not re-measured.
- **No rule file under `rules/` was audited for staleness.** They were out of the stated scope,
  and several of them are the authoring homes the doc surfaces cite. A doc row can be correct
  while the rule it points at is stale, and this survey would not see that.
- **Agent prompts were read only where a finding required the reality side.** Twelve of the
  sixteen prompts were not opened. `README-agents.md`'s table rows for those twelve are
  unverified: I confirmed the shaper, planner, playmaker and editor rows and nothing else.
- **The German-language question was not examined.** `CLAUDE.md` declares `**Language:** de` and
  `**Artifact language:** en`. Whether the shipped English documentation is complete against
  anything authored in German is outside what I looked at.
- **No claim about a consuming project was tested.** Everything here was measured against this
  repository. The documents describe behaviour in a consuming project, and the plugin's own
  self-detect stand-downs make this repository unrepresentative by construction for anything
  guard-related.
- **The three failing tests were not diagnosed.** I confirmed they reproduce and that no open
  record names them. Whether they are environment-dependent, a regression, or a stale fixture is
  the filed issue's question, not this survey's.

## Open questions

- [ ] Should the `bin/` inventory and the workbench file count become lint-derived (Group B), or
      is a hand-corrected line acceptable for both? The gate is more work now and less work
      forever, and the existing gate file makes it small.
- [ ] Should `README-agents.md` gain a dispatch-parameter table? Five parameters now exist across
      four agents, documented in a `CLAUDE.md` bullet that consuming-project readers never see,
      and one of them (`editor`'s deliverable language) halts the agent when omitted.
- [ ] Does the turn-budget lint's scanned surface want extending to `README-agents.md`, or is the
      diagram's `5` acceptable as an illustration of the default? Extending it means the lint
      follows a picture, which is a different kind of anchor than the prose it follows today.
