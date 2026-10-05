# Implementation Plan: FJ03d. Rules, prompts, live predicates and the complete consumer classification, switched with this workbench and its installed client in one window

**Date:** 2026-10-04
**Status:** Approved 2026-10-04 (plan approval answered by **Mode:** autonomous). The user ruled 2026-10-05: decision 261004-2212 (byte bound) option 1, cut-only; decision 261004-2212 (client) option 1 with the install home `~/.fp`; and, binding on every step: **`~/.fusion` is never changed** — no step installs, updates, reinstalls or writes there, because a consumer project is worked on productively from it. Step 13 proves before the install that neither the window launcher nor `fusion --update` from it can write `~/.fusion` (the risk row on `fusion --update` reinstalling `heads/main` into `~/.fusion` is a blocker until so proven), and FJ05 does not change `~/.fusion` either without the user's own act.
**Spec:** none as a requirements-designer spec. Prior's `concept/fusion-json-workbench-spec.md` at Prior `5609ff1` (main): §1, §3 (layout, tracking classes), §7 (the consumer table and its closing classification paragraph), §8.1 and §8.3 (preconditions, application, read-back), §9 (the FJ03d and FJ05 rows, the order paragraph, the mandatory checks). Prior's release boundary: `Prior: docs/design/fusion-fj04-correction-prior-response.md` `## Validation and release boundary` ("Plugin activation and use evidence belong to the remaining FJ03d/FJ05 release work").
**Cross-references:** 260928-1338-json-control-data-and-markdown-artefacts.md, 261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md (closed; its `## Where this work stops` carries this plan's preconditions), 260929-1810_*_plan-fj03a-the-record-client-the-format-gate-and-scope-and-order-on-json.md (`## The cut of FJ03`), 260930-1451_*_plan-fj03b-observers-checkers-citations-and-the-monitor-on-json.md, 260930-2305_*_plan-fj03c-the-write-client-setup-and-the-skills-on-json.md, 260929-1810_*_in-which-order-do-the-parts-of-fj03-and-fj04-land-while-fusions-own-workbench-is-still-in-the-v12-form.md, 260929-1810_*_does-the-2026-09-27-ruling-on-the-growth-bound-reach-the-hook-tests-and-shipped-text-fj03-changes.md, 261004-2212_*_how-does-fj03ds-rewrite-of-rules-and-prompts-meet-the-dispatch-path-bound-at-zero-head-room.md, 261004-2212_*_where-is-the-fj03d-windows-client-installed-from-which-ref-and-what-may-13-0-0-change-after-it.md, 261004-1721_*_how-is-a-later-partial-override-of-a-decision-recorded.md, 260927-2319_*_may-an-agent-originate-a-work-package-on-its-own-initiative.md, 261003-1004-fj04-step12-proof-on-copies-of-real-workbenches.md
**Planned against:** fusion `9c74070b`, `plugin.json` 13.0.0; bundle 689 747 bytes, `sha256:c76bbce9cc86634f5e9c227e8496511dc71eb845768704f43e68200ab841e52e` (qualified, Prior `d6abeb8`). `origin/main` (`48f0c9ff`, 12.2.3) is an ancestor of HEAD (`git merge-base --is-ancestor origin/main HEAD` exit 0). Installed client `~/.fusion` 12.2.1.
**Growth bound:** room measured at `9c74070b` as baseline sum plus head-room minus the surface's current size: `agents/` 4 226 bytes, `skills/` 3 370 bytes, hook tests 4 681 lines. The dispatch-path bound stands at 0 head-room with 620 to 1 189 bytes of margin per path (inference: summed by hand, the test's own report governs). Rule and prompt edits follow decision 261004-2212 (dispatch path), recommended option 1, cut-only; surface bounds follow the answered record 260929-1810 on the growth bound (replace first, raise the measured remainder, log it). No baseline moves.
**Confidentiality:** this plan touches fusion's own workbench only. No other project is copied, measured or named.
**Decidability:** Four questions. **(1) Is the consumer classification complete?** Decidable relative to a fixed pattern set: §7 names the patterns (the five control head fields, marker scans, marker renames, inline progress parsers), so one recorded search command at one commit enumerates every textual hit, and each hit gets exactly one of four disjoint classes (step 2). Not decidable by text search: a reader that builds a marker pattern at run time matches no pattern. The mechanism therefore adds a behavioural check: the rehearsal (step 11) runs every shipped helper, lint and skill block over a migrated copy of this workbench, where a surviving Markdown control reader shows up as a refusal, a wrong count or a red lint. **(2) Do rules, data and the installed client switch together?** Decidable by order: the side branch carries every text change, nothing of it reaches the work tree this repository's sessions read until the merge in step 13, and steps 13 to 15 run in one window with each step checking the previous one's result. Whether another checkout writes during the window is not decidable from inside this checkout (no lock spans checkouts, Prior §6). The mechanism is FJ04's: source hashes frozen in the migration plan detect a write during the run, and quiescence is a stated precondition the user confirms. A v12 client writing after activation is detected by nothing; the upgrade document states it as a limit (step 9). **(3) Do the text changes fit the bounds?** Decidable per commit by the bound tests. **(4) Which records are live after migration?** Decidable from each control file's `status` and the `terminal` sets of `codec/contract/transitions.json`, the table the kernel reads. No predicate reads a marker letter for live state after step 8.

## Directive

Complete FJ03 by its last part: the rule text, the agent prompts, the remaining skill text, the docs, the live-record predicates and the lints that read this repository's own workbench move from the Markdown control grammar to the JSON records and the `bin/fusion-write` operations. A repository-wide classification shows every hit of §7's patterns converted, legacy import or archive only, or another record type. All of it reaches this repository in one maintenance window together with the real migration of its workbench and an installed client built from the branch (Prior §9's FJ03d row; the order record 260929-1810, option 2). No codec byte moves.

**Why one plan for FJ03d and not one for FJ03d and FJ05 together.** They share the window's outcome but not its work. FJ03d is text and predicates proven on a rehearsal, then one window on this repository. FJ05 is the release act (`main`, tag, marketplace, the version surfaces) and evidence from a fresh install of the released tarball on a project other than this one. FJ05 cannot start before this window has activated a real workbench, because merging to `main` ships to every HTTPS install (`install.sh` defaults to `heads/main`). The one entanglement, the installed client in the window, is decision 261004-2212 (client), which this plan settles for FJ03d and hands to FJ05. `## Where this work stops` names which of FJ05's acceptance this plan claims.

## Current State

Verified at `9c74070b` unless marked otherwise.

- **What is already on JSON** (FJ03a to FJ03c, FJ04): scope, the two resolvers and order read `package.json` through the codec and refuse a legacy workbench by name (`bin/fusion-claimed-package`, `bin/fusion-paths`, `bin/fusion-work-order`). Staging drift classifies `workbench.json`, `.json-state/` and pairs (`JSON_LIVE_STATE`, `hooks/lib/staging-drift.ts`). The explicit checkers (`bin/fusion-citation-check`, `bin/fusion-citation-sweep`, `bin/fusion-plan-size`) read JSON through `hooks/lib/record-index.ts` and keep a legacy branch that prints `format=legacy`. `bin/fusion-write` performs every control change (its header lists the subcommands). The executable blocks of `/fusion:setup`, `/fusion:wp`, `/fusion:discuss`, `/fusion:check` and `/fusion:archive` are on JSON; `/fusion:migrate` drives the FJ04 migration. `plugin.json` reads 13.0.0 and the v12 window is closed (FJ04 step 10a).
- **What still states the Markdown grammar.** `grep -rEc` over the pattern `\*\*(Status|Claim|Mode|Depends-on|Active spec/plan):\*\*|_o_|_a_|_p_|_c_\b|_i_|_d_|\[IN PROGRESS\]|\[DONE\]`, tests and `dist/` excluded, counts: `agents/` 95 hits in 10 files (`orchestrator.md` 37, `policy-curator.md` 20, `state-auditor.md` 13), `rules/` 88 in 8 (`fusion-workbench-conventions.md` 59, `decision-record-examples.md` 17), `skills/` 26 in 7 (`archive` 14), `docs/` 50 in 7, `hooks/lib` 46 in 8, `bin/` 10 in 6, `codec/src` 4 in 3, the three READMEs 26. Hits are not defects (the legacy reader must read the grammar); step 2 classifies them.
- **The live predicates and own-tree lints** decide liveness by the marker letter: `isLiveRecord`, `OPEN_ISSUE_RE`, `LIVE_DECISION_RE`, `LIVE_PLAN_RE` in `hooks/lib/citation-corpus.ts`; `LIVE_MARKERS` in `hooks/lib/plan-size.ts`; the lints `workbench-citation-lint`, `plan-stopping-section-lint`, `reference-resolution-lint`, `fenced-code-exemption` and the own-tree case of `citation-sweep.test.ts` read this repository's legacy workbench directly (FJ03b plan, `## Current State`).
- **Four open issues name FJ03d as owner:** 260929-1810 (prompts disagree on who moves which marker, `_b_`), 260929-2025 (`task_start` row still names byte measurements), 260930-1219 (claim criterion and exit 3 causes in rule text), 260930-1640 (layout tree, tracking rule and ignore hints name no JSON surface; rows 4 and 5 are partly done in `skills/check/SKILL.md` lines 267 and 275).
- **Why the text cannot land on this branch before the window.** `bin/fusion-rules` prefers the work tree in this repository, so a rewritten rule file reaches every session here at its commit, while the workbench is legacy and the installed 12.2.1 helpers read Markdown. The own-tree lints switched to JSON predicates go red on the legacy workbench. Agent prompts and skill bodies come from the install, but the reference lint resolves their anchors into the rules, so prompts and rules move together.
- **The decisions this plan meets.** 260927-2319 (agents may originate packages) is answered and unrealised: `rules/fusion-workbench-conventions.md` `## Work packages` still says no agent originates one, while Prior §1.6 and `create --origin <package control path>` admit it. 261004-1721 (C9, partial override of a decision) is open; the rule rewrite of `### Decision files` is where its answer would land. Request 38 is ruled out of every qualified revision, so no takeover route exists.
- **Plan steps after import.** `hooks/lib/legacy-import.ts` `scanPlan` takes every numbered line under `## Implementation Steps` as a step, its number the anchor (decision 261001-1804 on step anchors). After this workbench migrates, this plan's steps are tracked through `bin/fusion-write transition --steps`, and no step can be added or renumbered (requests 18 to 22).

## Approach

**One side branch, one rehearsal, one window.** Every shipped-text and predicate change is written on a side branch `fj03d` in its own worktree outside this checkout, so nothing a session here reads changes before the window. The side branch is proven by a rehearsal: a fresh copy of this workbench, migrated inside the worktree by the branch's own `bin/fusion-migrate`, with the whole suite and the shipped helpers run over it. The window then does four things in order on the user's word: merge the side branch, install the window build into a separate home (decision 261004-2212, client, option 1), migrate this workbench through `/fusion:migrate`, and verify. The first productive JSON write comes last, because it ends the rollback that the migration otherwise keeps open.

The rule rewrite replaces procedures with operations. A rename becomes `transition`, an annotation line becomes a payload ref, a head field becomes a control field written by one named subcommand. The marker vocabularies stay described only as what the legacy reader and the archive read. That replacement is also where the dispatch-path bytes come from (decision 261004-2212, bound).

```mermaid
flowchart TD
  subgraph A["Part A: side branch fj03d, no effect on this repository's sessions"]
    S1[1 worktree and baseline figures]
    S2[2 classification at the base]
    S3[3 conventions rule]
    S4[4 other rules and staging-drift list]
    S5[5 orchestrator prompt]
    S6[6 the other ten prompts]
    S7[7 skills and help]
    S8[8 live predicates and own-tree lints]
    S9[9 docs, READMEs, upgrade document]
    S10[10 classification re-run: nothing left to convert]
    S11[11 rehearsal on a migrated copy]
  end
  subgraph B["Part B: the window, every step on the user's word"]
    S12[12 window checklist agreed]
    S13[13 merge, push, install the window build]
    S14[14 migrate this workbench]
    S15[15 read-back, no-op, suite, assets]
    S16[16 first productive write ends rollback]
  end
  S17[17 hand-over to Prior]
  S1 -->|base commit| S2
  S2 -->|work list| S3
  S2 --> S4
  S3 -->|anchors| S4
  S2 --> S5
  S3 --> S5
  S4 --> S5
  S2 --> S6
  S3 --> S6
  S4 --> S6
  S2 --> S7
  S3 --> S7
  S4 --> S7
  S2 --> S8
  S4 -->|tracking rows| S8
  S3 --> S9
  S4 --> S9
  S7 --> S9
  S8 --> S9
  S3 --> S10
  S4 --> S10
  S5 --> S10
  S6 --> S10
  S7 --> S10
  S8 --> S10
  S9 --> S10
  S10 -->|zero to convert| S11
  S11 -->|green rehearsal| S12
  S12 -->|agreed| S13
  S13 -->|window build installed| S14
  S14 -->|json-control| S15
  S15 -->|verified| S16
  S16 --> S17
```

## Implementation Steps

### Part A: on the side branch, before the window

Rules for every step of Part A. Work happens in the worktree of step 1; no commit on `fj03d` touches `fusion-workbench/`, and no step writes a record into the worktree's copy of the workbench. Records (step notes, issues, analyses) go to this checkout's workbench as usual. Each step reports the dispatch-path figures from `rules-emission-golden.test.ts` and the surface figures from `surface-growth-bound.test.ts` in its note.

1. **The worktree and the baseline figures**
   - Executor: `code-implementer`
   - Files: none in the tree. A git worktree of the new branch `fj03d`, cut from `fj-json-workbench` HEAD, at a path outside this checkout that the orchestrator names in the dispatch (for example a sibling directory of the repository).
   - Changes: create branch and worktree; install the dev dependencies of `hooks/` and `codec/` in the worktree; run the hook and codec suites there on its tracked legacy workbench copy and record the result as the baseline; record the per-path dispatch figures and the three surface rooms.
   - Dependencies: none.
   - Acceptance: both suites at the worktree's base commit give the same result as in this checkout (the monitor's wildcard-bind loopback case is the one known red); the note states the base commit and every figure.
   - [DONE] 2026-10-05. Worktree `/Users/kai/Projects/productive/F04-FUSION/fusion-fj03d`, branch `fj03d`, base `84047ad7`, no commit on it. `hooks/package-lock.json` (git-ignored) copied from this checkout before `npm ci`; `codec/` by `npm ci`. Codec 1 681 passed, 13 skipped, in both trees. Hooks 1 139 of 1 140 in the worktree, 1 140 of 1 140 here; the one red is the monitor wildcard-bind case, which also failed in this checkout when run alone. Dispatch-path room (bytes, baseline minus total, head-room 0): analyst 1 113, code-implementer 1 168, consultant 1 003, data-implementer 1 146, document-editor 999, implementation-planner 801, orchestrator 959, policy-curator 813, requirements-designer 620, reviewer 1 169, state-auditor 1 189. On every path the prompt is above its row and the rules and `CLAUDE.md` below. Surface rooms: `agents/` 4 226 B, `skills/` 3 370 B, hook tests 4 681 lines.

2. **The repository-wide classification at the base commit**
   - Executor: `analyst`
   - Files: one analysis report in `$OUT_ANALYSIS`.
   - Changes: run one recorded search command at the base commit over `agents/`, `skills/`, `rules/`, `docs/`, `templates/`, the three READMEs, `CLAUDE.md`, `install.sh`, `bin/`, `hooks/*.ts`, `hooks/lib/*.ts`, `hooks/lib/__tests__/`, `codec/src/` and `codec/README.md`. The pattern set is §7's: the five control head fields, marker scans (`_o_` and the other letters in globs and regexes), marker renames (`mv` of a marked name), inline progress parsers and progress marks. Each hit gets exactly one class: **converted** (already reads or writes JSON); **convert** (with the step of this plan that converts it); **legacy-only** (the legacy reader, the repair, archive read mode, the historical upgrade notes, `/fusion:migrate`); **other kind** (reviews, history, memos, analyses, the codec's own contract). The report also maps each of the four open FJ03d issues, row by row, to the step that carries it, and lists each consumer §7 names with the test that exercises its shipped block or helper (§7: "Tests müssen die tatsächlich ausgelieferten Skill-Blöcke/Helper prüfen").
   - Dependencies: 1.
   - Acceptance: every hit of the command's output appears in exactly one class; the command and the commit are in the report, so the count can be re-taken.
   - [DONE] 2026-10-05, analysis `261005-0504-fj03d-step2-classification-at-the-base-commit.md` with its per-hit table. 723 hits in 96 files at `84047ad7`: converted 105, convert 366, legacy-only 119, other kind 133; convert per step 3: 62, 4: 27, 5: 38, 6: 52, 7: 33, 8: 116, 9: 35, none: 3. The command widens this step's pattern set (`_s_`, `_b_`, `_t_`, class forms, escaped and quoted head-field readers). **Amended 2026-10-05 from the report:** step 4 also converts `bin/fusion-rules:598`, `rules-emission-golden.test.ts:281`, `bin/fusion-checkout-name:244` and `rules/context-manifest.md:120-121`, and carries issue 260930-1640 row 5 (`.gitignore`) with a `git check-ignore` case on a scratch workbench; step 8's expected reds include the legacy-fixture cases of `citation-sweep.test.ts`, `fusion-citation-check.test.ts`, `plan-size.test.ts` and `declared-citation-paths.test.ts:79-82`. Open before step 7: whether `/fusion:wp`, `/fusion:discuss` and `/fusion:archive` refuse a legacy workbench like step 8's checkers (31 hits as convert) or keep their legacy halves (legacy-only). Open before step 10: whether the 90 grammar hits read as converted and the 15 homonyms as other kind, or take a fifth class.

3. **The conventions rule on JSON control**
   - Executor: `code-implementer`
   - Files: `rules/fusion-workbench-conventions.md`.
   - Changes:
     - `## fusion-workbench Layout`: the tree names `workbench.json` (with its consumers: the codec, `/fusion:setup` through `initialize`, `hooks/lib/staging-drift.ts`), `.json-state/`, and the control file beside each narrative (`package.json`, `<stem>.record.json`, `<stem>[.<n>].evidence.json`); a pair is one artefact and travels in one commit (issue 260930-1640, row 1).
     - `### Contract` and `#### Exit codes`: the claim criterion is `status` and `claim.checkout_id` of the package's control file; row 3 cites the header of `bin/fusion-claimed-package` as the list of causes, `legacy` among them (issue 260930-1219, passage 1).
     - `## Work packages`: the head template becomes the narrative plus `package.json`; each control field is named with the one subcommand that writes it (`claim`, `release`, `transition`, `set-mode`, `set-dependencies`, `adopt-plan`); `**Domain:**`, `**Filed by:**` and `**Cross-references:**` prose is informational and the JSON governs (FJ04 hand-over, packages 46 c and 47); a takeover is stated as absent until a qualified revision provides one (request 38). Whether an agent may originate a package within the commissioned work follows the answer to `## Open Questions` item 1.
     - `## Filename Patterns`, both `## State Markers` sections, `## Marker globs`, `## Terminal states are history`: a new record has a marker-free name and is created by `create`; old names keep their markers, which encode no current state; the citation forms stay; the marker vocabularies are described as what the legacy reader maps and what `archive/` holds; terminality is the kernel's `terminal` set.
     - `## Inline State Tracking`: plan steps through `transition --steps`, criteria through `--criteria`, an issue's resolution through `--disposition`, a decision's answer, implementation, deferral and supersession through the payload refs; a step number is its anchor and is never renumbered (decision 261001-1804, step anchors). `### Decision files` carries the answer to decision 261004-1721 if the user has given one before this step is dispatched; otherwise the existing forms, translated.
     - `## Record filing` and `## Decision Record Template`: filename marker-free, the record created by `create` after its narrative is written.
   - Dependencies: 2.
   - Acceptance: `reference-resolution-lint`, `path-literal-lint`, `provenance-header-lint` and `rules-emission-golden` green in the worktree, every dispatch path at or under its baseline row (decision 261004-2212, bound; a shortfall stops the step and returns its figure); the other suites unchanged against step 1's baseline.
   - [DONE] 2026-10-05, `fj03d` `7fe0a7fe`. All 62 convert hits rewritten; the step-2 search now finds 3 lines in the file, each legacy-only. Decision 260927-2319 realised (an agent may originate a package with `--origin`); C9 still open, so the decision lines keep their forms paired with operations. The rule shrank 169 bytes; room per path now 789 (requirements-designer) to 1 358. `reference-resolution-lint`'s path count re-approved 1 926 → 1 936 as its failure text asks (all ten new references in the rule file). Suites as step 1. Gap filed: issue 261005-0527 (a plan filed by `create` has no step anchors), for step 6.

4. **The other rule files and the staging-drift list**
   - Executor: `code-implementer`
   - Files: `rules/workbench-tracking.md`, `rules/agent-setup.md`, `rules/decision-record-examples.md`, `rules/orchestrator-rebalance.md`, every other rule file step 2 classes **convert**; `hooks/lib/staging-drift.ts`, `hooks/lib/__tests__/staging-drift.test.ts`, `hooks/dist/` as compiled.
   - Changes:
     - `workbench-tracking.md`: R3 names `workbench.json`, L names `.json-state/` and `.guard-state/record-change-pending.jsonl`; both halves of a pair travel in one commit (issue 260930-1640, row 2; FJ03c's note on the pending file).
     - `agent-setup.md` `## What fusion-paths emits`: exit 3 on a `legacy` or `unsupported` workbench means stop and tell the user to run `/fusion:migrate` (issue 260930-1219, passage 2).
     - `decision-record-examples.md`: the worked transitions as `bin/fusion-write transition` calls.
     - `orchestrator-rebalance.md`: the `_b_` marker and the history `**Status:**` write go (issue 260929-1810, items 2 and 5).
     - `JSON_LIVE_STATE` merges into `LIVE_STATE` and `LIVE_PREFIXES`; the test pins the merged lists to the tracking rule's text (issue 260930-1640, row 3).
   - Dependencies: 2, 3.
   - Acceptance: as step 3, plus `staging-drift.test.ts` and `committed-dist.test.ts` green.
   - [DONE] 2026-10-05, `fj03d` `8a6100fc`. All 27 hits and the step-2 amendment's additions converted, none left. Each decision payload shape in `decision-record-examples.md` was run against the codec first. `--superseded-by` takes the two-id record reference, not a filename. `JSON_LIVE_STATE` is merged into the live lists. `.gitignore` ignores `fusion-workbench/.json-state/*`, with a `git check-ignore` case on a codec-written workbench. Room per path is now 957 bytes (policy-curator) to 1 852; hook tests 4 661 lines. `reference-resolution-lint` re-approved 1 936 → 1 941, all from this step's rule files. Hooks 1 140 of 1 141 (the known monitor case), codec as step 1, bundle unchanged.

5. **The orchestrator prompt**
   - Executor: `code-implementer`
   - Files: `agents/orchestrator.md`.
   - Changes: every **convert** hit of step 2 in the file. Claim, release, pause, done and dropped through `bin/fusion-write`; `**Mode:** autonomous` through `set-mode` with the user's provenance; adopting a spec or plan through `adopt-plan`; the closure step reads the plan from the package's `active_documents` with its role and narrative revision, not from `**Active spec/plan:**` (Prior §7, request 29); decision transitions through `transition` and the payload refs. Issue 260929-1810 items 1 and 2 (who moves which marker; `_b_`), issue 260929-2025 (the `task_start` row says what the hook writes), issue 260930-1640 row 7 (`## Staging check`: a codec-written control file is a `record` row to stage; `PAIR-SPLIT` means stage the other half in the same commit; the `in-flight` examples gain `workbench.json` and `.json-state/`; the routing line no longer sends a work package's `package.json` to an executor).
   - Dependencies: 2, 3, 4.
   - Acceptance: `grep -rn 'byte measurements' agents skills rules` names nothing; reference lint and the dispatch-path bound green, the orchestrator path at or under its row; `agents/` inside its room or the measured remainder logged per the growth record.
   - [DONE] 2026-10-05, `fj03d` `0f57b119`. All 38 hits converted. The step-2 search leaves 5 lines: the kept event-log constants, the `**Mode:** apply` homonym and one historical anecdote. The setup claim walk is replaced by `bin/fusion-claimed-package`, which has its own test, and its executed copy in `archive-filter-key.test.ts` is removed. Two changes go beyond a translation:
     - `adopt-plan` binds at the user's approval, not when the planner returns, so a Modify round binds no discarded revision.
     - Bounded Closure is now `dropped` with outcome class `bounded`.
     The prompt is 2 965 B smaller. Orchestrator path room is 4 647 B, `agents/` room 7 191 B. `reference-resolution-lint` was re-approved at 1 951 paths and 347 anchors, all from this file. Suites as before.

6. **The other ten prompts**
   - Executor: `code-implementer`
   - Files: the **convert** hits of step 2 in `agents/state-auditor.md`, `agents/policy-curator.md`, `agents/analyst.md`, `agents/implementation-planner.md`, `agents/reviewer.md`, `agents/requirements-designer.md`, `agents/consultant.md`, `agents/code-implementer.md`, `agents/data-implementer.md`, `agents/document-editor.md`.
   - Changes: the state-auditor's transitions and reconcile through operations; the policy-curator's edges through `set-dependencies` and its active-document reads through `active_documents`; the analyst's decision filing (issue 260929-1810 item 3) and the consultant's scope (item 4); the planner's plan file marker-free and created by `create`, with numbered steps under `## Implementation Steps` as the anchors; the reviewer's evidence through `bin/fusion-write evidence`; the implementers' step progress through `transition --steps`. No prompt gains a tool restriction it did not have (Prior §7, the reviewer row).
   - Dependencies: 2, 3, 4.
   - Acceptance: as step 5, every path at or under its row.
   - [DONE] 2026-10-05, `fj03d` `693a29bc`. All 52 hits converted, plus issue 260929-1810 items 3 and 4. The step-2 search leaves 7 lines, all other kind (report heads, the `**Mode:** survey|apply` homonym). **Departure from this step's text:** the implementers no longer move plan steps or issue states. They write `Resolved:` / `Implemented:` and the dispatcher transitions after reading `Verification:`, which is one party per 260929-1810 and agrees with step 5. Further changes beyond translation: the consultant writes no decision and loses `OUT_DECISION`; the reviewer records its verdict with `bin/fusion-write evidence`; the state-auditor calls `reconcile`; the analyst files a decision `open`. Room per path is now 777 B (reviewer) to 4 647 B; `agents/` room 5 999 B. `reference-resolution-lint` re-approved 1 963 / 356, per-file deltas shown. Suites as before. Two issues filed: 261005-0626 (README-agents names `decisions/` for the consultant, step 9), and 261005-0626 (no prompt sends `attach-evidence`, so a `succeeded` dependency edge is unreachable; no step owns it).

7. **Skills and help**
   - Executor: `code-implementer`
   - Files: the **convert** hits of step 2 in `skills/*/SKILL.md`, at least `skills/help/SKILL.md` (the monitor line; issue 260930-1640 row 6) and `skills/migrate/SKILL.md` `## Step 6` (stop on the sweep's exit 3 or 6 and name its stderr line; row 8).
   - Changes: as listed; `skills/help/SKILL.md` `### 4. Update` gains the 13.0.0 paragraph (what changes, that every agent halts on an unmigrated workbench until `/fusion:migrate` has run, the two-launcher period of decision 261004-2212, client), relabels and drops the oldest, as `README-agents.md` `## Releasing` asks. The version act stays FJ05's.
   - Dependencies: 2, 3, 4.
   - Acceptance: `skills/` inside 3 370 bytes of room or the measured remainder logged; the tests that run shipped skill blocks green.

8. **The live predicates and the own-tree lints on the record index**
   - Executor: `code-implementer`
   - Files: `hooks/lib/citation-corpus.ts`, `hooks/lib/plan-size.ts`, `hooks/citation-check.ts`, `hooks/citation-sweep.ts`, `hooks/plan-size.ts`, `bin/fusion-citation-check`, `bin/fusion-citation-sweep`, `bin/fusion-plan-size`, the four own-tree lints and the own-tree case of `citation-sweep.test.ts`, their tests, `hooks/dist/`.
   - Changes: liveness comes from `hooks/lib/record-index.ts` (control `status` against the `terminal` sets of `codec/contract/transitions.json`); `isLiveRecord`, the three regexes and `LIVE_MARKERS` are removed from the live path or kept only for `archive/` read mode. The `format=legacy` branch of each explicit checker becomes a refusal by name that points at `/fusion:migrate` (Prior §9's FJ03 row: old control parsers only in import and archive; this closes the N2 question of analysis 261003-1004 as the specification answers it). Retired tests are replaced first; a remaining hook-test growth is raised to the line and logged.
   - Dependencies: 2, 4.
   - Acceptance: in the worktree, on its tracked legacy workbench, the expected reds are exactly the own-tree lints and the own-tree sweep case, each failing on `legacy` by name; any other red stops the step. On a JSON fixture workbench every case of the changed files is green. Step 11 shows all of them green on a migrated copy.

9. **Docs, READMEs, `CLAUDE.md`, `codec/README.md` and the upgrade document**
   - Executor: `code-implementer`
   - Files: `docs/upgrading-to-v13.md` (new), `docs/upgrading-to-v12.md` (one pointer), `docs/working-model.md`, `docs/fusion-intro.md`, `README.md`, `README-agents.md`, `README-hooks.md`, `CLAUDE.md`, `codec/README.md`.
   - Changes:
     - The upgrade document for the JSON contract: what becomes JSON and what stays Markdown; that every agent halts on an unmigrated workbench until `/fusion:migrate` has run, and what that run asks (one question on each measured copy, FJ04 step 12); the multi-checkout procedure of Prior §8.1 (quiesce, one checkout migrates, every other one inventories its untracked records, pulls and updates its client before its next write); Node `>=20.12.0`.
     - Its section of documented limits: a v12 client writing after activation is detected by nothing; no takeover of a stale claim (request 38); the codec's `narratives` findings are not read by a host reader (C26); `legacy-unknown` filers and git-derived attribution; renumbering a step breaks its binding; Prior's qualification is a release fact, not a runtime dependency.
     - `docs/` and the READMEs: the **convert** hits of step 2; the `README-hooks.md` rosters stay equal to the tree.
     - `CLAUDE.md`: net zero bytes or a cut (it is charged to all eleven paths).
     - `codec/README.md`: the sentence "`/fusion:setup` does not call it yet (FJ03d)" goes. No file under `codec/dist/` changes.
   - Dependencies: 3, 4, 7, 8.
   - Acceptance: `derivable-enumerations-lint`, the reference lint and the dispatch-path bound green; `shasum -a 256 codec/dist/fusion-record.js` prints `c76bbce9…`.

10. **The classification re-run: nothing left to convert**
    - Executor: `analyst`
    - Files: a second analysis report in `$OUT_ANALYSIS`.
    - Changes: re-run step 2's command at the side branch head and class every hit; explain each difference from step 2 by the step that made it.
    - Dependencies: 3, 4, 5, 6, 7, 8, 9.
    - Acceptance: no hit in class **convert**; every consumer §7 names has a test that runs its shipped block or helper, or the report names the gap as a finding for the orchestrator to file.

11. **The rehearsal on a migrated copy of this workbench**
    - Executor: `code-implementer`
    - Files: none committed. The worktree's `fusion-workbench/` is replaced by a fresh copy of this checkout's, migrated, measured, and restored to its tracked state afterwards.
    - Changes: take the tree hash of this checkout's `fusion-workbench/`; copy it into the worktree; run the worktree's `/fusion:migrate` blocks verbatim (the store rename finds nothing, the repair list, the run) with "migrate" as the one expected answer; then, all from the worktree: the full hook and codec suites; `bin/fusion-paths`, `bin/fusion-claimed-package`, `bin/fusion-work-order`, the three explicit checkers; `bin/fusion-record show` of this package (open) and of the FJ04 plan pair (terminal, bound by the package); a second run that answers no-op; one headless `claude --plugin-dir <worktree> --agent fusion:analyst -p` from the worktree whose Setup resolves `OUT_PLAN` into this package's container and stops. Restore the worktree's workbench and re-take this checkout's tree hash.
    - Dependencies: 10.
    - Acceptance: both suites green with the own-tree lints reading the migrated copy; the read-back and the no-op as stated; the question count is one, or each further question is named in the note for the user before step 12; both tree hashes of this checkout's workbench equal; the side branch head at which it ran is in the note.

### Part B: the window (each step runs only on the user's word)

12. **The window checklist** (approval: the user agrees the window)
    - Executor: `analyst`
    - Files: none; the checklist goes into the step note.
    - Changes: read back every precondition clause of `## Where this work stops` that gates the window, each answered yes or no with its evidence: step 11 green at the side branch head to be merged; the review pass over the side branch range done and its findings fixed or ruled; no other fusion session writing in this repository; for each other registered checkout of this repository, whether it is quiescent and how it will reach the window build before its next write; the backup location outside the repository; Node version; decision 261004-2212 (client) answered.
    - Dependencies: 11.
    - Acceptance: every clause answered; the orchestrator puts the list to the user and records the answer.

13. **Merge, push, install the window build** (approval: merge, push and install)
    - Executor: `code-implementer`
    - Files: the merge of `fj03d` into `fj-json-workbench`; no new edits.
    - Changes: merge (the orchestrator commits); push `fj-json-workbench`; install per decision 261004-2212 (client), recommended option 1: `FUSION_REF=heads/fj-json-workbench FUSION_HOME=<separate home> FUSION_BIN=<separate launcher directory>` with this repository's `install.sh`. Record the merged commit, the installed `plugin.json` version and the installed bundle's sha256.
    - Dependencies: 12.
    - Acceptance: the installed bundle is `c76bbce9…` and the installed tree equals the pushed commit's for every path the installer copies; at the merge commit the expected reds are exactly step 8's named own-tree cases, which step 15 clears, and any other red stops the window.

14. **Migrate this workbench** (approval: the real migration)
    - Executor: `code-implementer` (evidence and checks; the run itself is the user's `/fusion:migrate` in a fresh session started through the window launcher)
    - Files: this repository's `fusion-workbench/` as the migration writes it; the receipt under `archive/migrations/<id>/`; the external backup.
    - Changes: the user restarts on the window launcher and runs `/fusion:migrate`; afterwards collect the receipt, the backup path with its verified tree hash, `inspect` answering `json-control`, record and package counts, the findings and the number of questions asked.
    - Dependencies: 13.
    - Acceptance: `inspect` answers `json-control`; the receipt names inventory, mapping, source and target hashes, versions and checks (Prior §8.3.6); the question count matches step 11 or the difference is named.

15. **Read-back, no-op, suite and assets on the activated workbench**
    - Executor: `code-implementer`
    - Files: none changed in the tree.
    - Changes: in a fresh session on the window launcher, read one open record (this package) and one terminal record (the FJ04 plan pair) through `bin/fusion-record`, `bin/fusion-paths`, `bin/fusion-claimed-package` and `bin/fusion-work-order` (Prior §8.3.7); a second migration run answers no-op; the full hook and codec suites green in an isolated worktree of the merged commit with this workbench's migrated tree (Prior §9: the suite rewrites compiled hooks); `/fusion:check` asset and gitignore checks pass; `bin/fusion-staging-drift` classifies the migrated pairs with no `unclassified` row. No write to any control file.
    - Dependencies: 14.
    - Acceptance: every check passes, or the step stops and the user rules between `rollback` (still admitted, no later work exists) and a forward fix.

16. **The first productive write** (approval: it ends rollback)
    - Executor: `code-implementer`
    - Files: this plan's control file, through the codec.
    - Changes: `bin/fusion-write transition` records steps 1 to 15 of this plan as done (`--steps`), the first ordinary JSON write on this workbench; then the orchestrator transitions the four FJ03d issues with `--disposition` and the decisions this plan realised (260927-2319 if realised, 261004-2212 bound and client) through their refs. From here on no step of this plan is marked in its Markdown.
    - Dependencies: 15.
    - Acceptance: the write lands with `event=logged`; `bin/fusion-record show` returns the new revision; the staging check names the changed control files and nothing else.

17. **The hand-over to Prior**
    - Executor: `analyst` (drafts; the orchestrator appends and commits)
    - Files: `codec/fixtures/prior/REQUESTS.md`, a new section `## FJ03d (the hand-over)`.
    - Changes: what landed and at which commits; step 10's classification result; the activation evidence on fusion's own workbench (receipt, read-back, no-op, suite, the window build's commit and bundle digest); that no codec byte moved, so no re-qualification is asked; what remains for FJ05.
    - Dependencies: 16.
    - Acceptance: the section is an append; the digest it states equals `shasum -a 256 codec/dist/fusion-record.js`.

## Where this work stops

- Step 2's and step 10's reports exist; step 10 classes no hit as **convert**.
- Each of issues 260929-1810, 260929-2025, 260930-1219 and 260930-1640 is closed with its own acceptance met, or a row is named as left and refiled.
- `codec/dist/fusion-record.js` is `sha256:c76bbce9…` at every commit of this plan, and `REQUESTS.md` asks Prior for no re-qualification.
- No baseline moved; `DISPATCH_HEAD_ROOM` is 0, or the user ruled option 2 of decision 261004-2212 (bound) on a measured shortfall; every surface raise is the measured remainder, logged in `README-hooks.md` `### Growth bounds on the shipped text`.
- Precondition for the window, met before step 13: step 11 ran green on the side branch head being merged.
- Precondition for the window, met before step 13: the orchestrator has dispatched a review over the side branch range, and its findings are fixed or ruled; `bin/fusion-review-coverage` over that range is stated in the step 12 note.
- Precondition for the window, met before step 13: no other fusion session writes to this workbench, and each other registered checkout of this repository is quiescent and reaches the window build before its next write, with its untracked records inventoried before its pull (Prior §8.1). This is the user's statement; nothing verifies it.
- Precondition for the window, met before step 13: decision 261004-2212 (client) is answered.
- This repository's workbench answers `json-control`, its receipt is complete, the read-back of one open and one terminal record passed, and a second run was a no-op.
- The full suites passed in an isolated worktree on the activated workbench, the own-tree lints included.
- The first productive write landed, and it was made only after step 15 passed.
- fusion stayed operable directly in Claude Code: every window step ran with no Prior installation, binary, service or variable.
- `REQUESTS.md` carries step 17's section.
- FJ04's open preconditions after this plan: FJ03d's window agreed (step 12, claimed); `origin/main`'s 12.x merged (met before this plan: `48f0c9ff` is an ancestor of `9c74070b`); the upgrade document (step 9, claimed as text); 13.0.0 shipped with the release surfaces of `README-agents.md` `## Releasing` (not claimed, FJ05); every writing installation of this workbench on the window build before activation (claimed, by the user's statement in step 12).
- FJ05's acceptance, clause by clause:
  - Fresh-installed client: not claimed. The window installs a branch build into a separate home; FJ05 installs the released tag fresh.
  - Complete assets: claimed for the window build only (`/fusion:check` in step 15); not for the release tarball.
  - Project smoke test: claimed for fusion's own project (steps 14 to 16); a consuming project is FJ05's.
  - Repeatable migration: claimed on this workbench (step 15's no-op) and on the rehearsal copy (step 11); FJ05 repeats it on the release.
  - Documented limitations: the text exists (step 9); checking it against the released behaviour is FJ05's.
  - The release act (merge to `main`, tag `v13.0.0`, marketplace, the four version surfaces, the description pair): not claimed.
- No workbench other than this repository's is migrated by this plan.

## Data Structures

None new. The control files, the receipt and the migration plan are FJ04's.

## API Changes

`bin/fusion-citation-check`, `bin/fusion-citation-sweep` and `bin/fusion-plan-size` refuse a legacy workbench by name and point at `/fusion:migrate`, where they printed `format=legacy` and read Markdown (exit codes stay those the FJ03b plan assigned to a refusal). No codec operation and no `bin/fusion-write` subcommand changes.

## Testing Strategy

Text steps are tested by the lints that already read the shipped surface. Predicates are tested on JSON fixtures (step 8), then on a migrated copy of this workbench (step 11), then on the real one (step 15). Tests run the shipped helpers and skill blocks, not a second implementation (Prior §7); step 10 names any consumer without such a test. The full suite runs in an isolated worktree, because it rewrites compiled hooks (Prior §9).

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| The rule or prompt rewrite does not fit the dispatch-path bound | Decision 261004-2212 (bound): cut-only, a shortfall stops the step and goes to the user with its figure |
| `fj-json-workbench` gains shipped-file commits while `fj03d` is open | Shipped files change only on `fj03d`; otherwise rebase and re-run step 11 |
| A session here reads the new rules before the workbench is migrated | The merge happens only inside the window (step 13), with writers quiescent; steps 13 to 15 run back to back |
| The window build halts the user's other projects | Separate install home (decision 261004-2212, client, option 1); `~/.fusion` stays 12.2.1 until FJ05 |
| `fusion --update` from the window launcher reinstalls `heads/main` into `~/.fusion` | Stated in step 13's note and the help paragraph; the window launcher is not updated, it is reinstalled with the same variables |
| **Limit, not mitigated:** this repository is started with the 12.2.1 launcher after activation and writes Markdown control | Nothing detects it. The upgrade document and the step 12 checklist state it; only the procedure prevents it |
| The real migration asks more than the rehearsal did | `/fusion:migrate` surveys and asks before any write; step 14 names the difference |
| A check fails after activation | Step 15 makes no write, so `rollback` is still admitted; step 16 is the point of no return and needs its own approval |
| The classification misses a reader that builds its pattern at run time | Step 11's behavioural run over a migrated copy; step 15 on the real one |

## Open Questions

- [ ] **Item 1. Does FJ03d realise decision 260927-2319 (agents may originate packages) in `## Work packages`?** The decision is answered (option 1) and unrealised; Prior §1.6 and `create --origin <package control path>` already admit it. We recommend realising it in step 3, since the section is rewritten there anyway and leaving the withdrawn bound in new text would restate it. Then the orchestrator moves the decision to `_i_` at step 16. The alternative is to carry the current bound forward and leave the decision `_a_`.
- [ ] **Decision 261004-1721 (C9, partial override).** Not a dependency: step 3 carries the existing forms if it is still open. Answering it before step 3 is dispatched costs nothing extra, because `### Decision files` is rewritten there.
- [ ] **Decision 261004-2212 (bound):** recommended option 1. Needed before step 3.
- [ ] **Decision 261004-2212 (client):** recommended option 1. Needed before step 12.
- [ ] **Which machines hold the two other registered checkouts of this repository (`1d05b0e4`, `5e8248d7`), and are either of them still in use?** Step 12 needs the answer for the quiescence clause.
- [ ] **N2 of analysis 261003-1004** (do read helpers keep a legacy path until migration): step 8 answers it as Prior §9's FJ03 row does (no; refusal by name, pointing at `/fusion:migrate`). The orchestrator records that answer, or the user rules otherwise before step 8.
