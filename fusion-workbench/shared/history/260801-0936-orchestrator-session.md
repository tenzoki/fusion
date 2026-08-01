# Orchestrator Session — 260801-0936

**Directive:** Tackle drift and bloat across decision records, rule files and `CLAUDE.md`, which accumulate contradictions and consume context budget as a project proceeds. Design a capability to handle it; build the prerequisite the design identifies.
**Mode:** custom → shaped to spec → plan (Circle `260801-1244-guard-bash-inspection`)
**Status:** Complete — Coherence verdict `coherent`

## Budget

| Metric | Count |
|--------|-------|
| Turns | 3 |
| Tasks resolved | 14 |
| Tasks skipped/deferred | 0 |
| Issues created | 17 (15 in the Circle, 2 shared by the reconciler) |
| Issues resolved | 16 (14 in the Circle, 2 shared) |
| Decisions answered (`_o_`→`_a_`) | 3 |
| Decisions implemented (`_a_`→`_i_`) | 0 — see below |
| Commits | 16 |
| Agent errors | 0 |
| Human gates hit | 12 |

No decision was promoted to implemented, and the reconciler was right to refuse. `_i_` is terminal, and this Circle built the prerequisite that *unblocks* D2 rather than the exemption D2 records. `FUSION_ALLOW_RULES_WRITE` appears nowhere in the source; what shipped is the seam it will attach to. What changed for D2 is worth more than the marker anyway: the objection that a flag on the `Edit` path is worthless while `mv` is unguarded no longer holds.

## Per-Turn Log

### Turn 1 — the plan, and everything the plan uncovered
Eleven tasks against eight planned steps. Commits `56a41c4..e31c0f3`. The three extra tasks each came from a gate the work itself opened: the verb-table review widened the deny surface three ways, a backslash line continuation was found splitting commands in the *shipped* git classifier, and the git override was found short-circuiting the new check. Shipped v5.8.0 with a rebuilt `hooks/dist/` that the integration harness proved had been stale since 2026-07-19 — meaning until that commit, no consuming project was running any of this. Coherence `ok`. `coderev` filed seven findings, two High.

### Turn 2 — the review findings, and a self-inflicted regression
Two tasks, commits `5d9bbcc` and `18e2e4f`. Both High findings closed by one change rather than two patches, on the argument that they are the same defect in two spellings; the shared `hooks/lib/command-word.ts` that resulted closed four bypasses of the git branch policy as a side effect. All five Medium findings closed, three of them false positives. `coderev` returned **not ready to close**: the flag-truncation fix had regressed `perl -lpi`, the canonical one-liner, from deny to allow.

### Turn 3 — the regression, measured rather than reasoned about
One task, commit `9ab5a2a`. Flag grammar measured against perl 5.34.1, BSD sed, GNU sed and git 2.53.0, which established that the filed issue was itself wrong on three letters — restoring their denies would have been false positives, not protection. `coderev` confirmed with a 14,317-command differential grid, zero unexplained changes. 753 tests green.

## Remaining Work

Three anticipated Circles carry the actual Directive; the one that closed was the prerequisite.

| Circle | State | Blocked by |
|---|---|---|
| `260801-1244-rule-provenance-header` | anticipated | nothing — **playmaker's recommendation for next** |
| `260801-1244-guard-rules-write` | anticipated | nothing (unblocked by this Circle) |
| `260801-1244-curator` | anticipated | `-rule-provenance-header` |

Open issues: the Low review finding (`260801-1904`), parts 1 and 3 of the ontocoder-edit issue (`260801-1410`), the stale `tasklist.md`, and the session-bookkeeping freeze. The spec stays `_o_` — three of its four Circles are unbuilt.

Release actions outstanding: no `v5.8.0` tag, `install.sh:27` still names v5.7.0, and the marketplace entry is unbumped.

## Commits

| Hash | What it did |
|---|---|
| `56a41c4` | Extract the shell parser; add quoted-word capture mode |
| `a342e9b` | ontocoder scope exclusion; remove a false claim about orchestrator behaviour |
| `9a35b8e` | The mutation classifier |
| `7105f21` | See through wrappers, deny ancestors, resolve substitutions |
| `50d7f00` | 177-case suite, 413 assertions |
| `1b4e828` | Splice backslash line continuations |
| `5b8430c` | Wire the classifier into the guard |
| `59a1cd9` | Virtual working-directory tracking |
| `3177e65` | An override waives only what it names |
| `2a29c90` | Two pre-existing holes in the git classifier |
| `85c043c` | Integration harness proving denial outside this repo |
| `3806a49` | Documentation; five false claims corrected |
| `e31c0f3` | v5.8.0, rebuild `dist`, make `npm test` build first |
| `5d9bbcc` | One answer to which word names the program |
| `18e2e4f` | Five Medium findings, mostly false positives |
| `9ab5a2a` | Flag grammar per tool; git stash subcommands |

## What this session says about its own Directive

The session set out to address normative drift and produced, in passing, eight verified instances of it — four in always-loaded files (`CLAUDE.md` citing decision records at a pre-v4 path that exist nowhere; `CLAUDE.md` calling the workbench gitignored when it is untracked; zero superseded decision records through a layout restructure and a protocol removal; a gap analysis reporting hardcoded protection that is configuration), and four more in the guard's own documentation and comments, including the same "complete choke-point" overclaim in two files.

The sharpest instance is the one the session created. `rules/protected-path-discipline.md` was authored hours after the decision requiring provenance headers was answered, inside the session that answered it, without a provenance header. Playmaker verified the rate independently: ten rule files, one provenance line. That is not an argument the curator is needed; it is a measurement of how fast the surfaces decay unaided.

## Session Flow

```mermaid
sequenceDiagram
    participant U as User
    participant O as Orchestrator
    participant A as Analyst
    participant S as Shaper
    participant P as Planner
    participant CV as Conceptrev
    participant C as Coder
    participant OC as Ontocoder
    participant CR as Coderev
    participant R as Reconciler
    participant PM as Playmaker

    U->>O: normative drift — new agent?
    O->>A: gap analysis across 3 surfaces
    A-->>O: extend, don't build; guard blocks it
    O->>U: GATE writing agent vs detector
    U-->>O: writing agent
    O->>U: GATE how are write permissions set?
    U-->>O: add the flag
    O->>S: shape the capability
    S-->>O: spec, 8 decisions pending
    O->>U: GATE D-a..D-h
    U-->>O: 8 answers, 3 off-default
    O->>S: revise (x2)
    S-->>O: 4 Circles, scale: not one session
    O->>U: GATE how much now?
    U-->>O: guard shell fix alone
    O->>S: file 4 anticipated Circles
    S-->>O: filed
    O->>P: plan C5c
    P-->>O: 8 steps
    O->>CV: 3 diagrams
    CV-->>O: acceptable, missing edge
    O->>U: GATE plan
    U-->>O: approve

    Note over O: Turn 1
    O->>C: S1 shell-parse
    C-->>O: 56a41c4
    O->>C: S2 classifier
    C-->>O: 9a35b8e
    O->>U: GATE verb table
    U-->>O: 3 widenings
    O->>C: S2b..S6 (6 tasks)
    C-->>O: 7105f21..85c043c
    O->>C: S7 docs
    C-->>O: 3806a49
    O->>OC: S8 v5.8.0 + dist
    OC-->>O: e31c0f3 (dist was stale)
    O->>CR: review 11 commits
    CR-->>O: sound; 7 issues, 2 High

    Note over O: Turn 2
    O->>C: T2-1 two High
    C-->>O: 5d9bbcc
    O->>C: T2-2 five Medium
    C-->>O: 18e2e4f
    O->>CR: review
    CR-->>O: NOT ready — perl -lpi regressed

    Note over O: Turn 3
    O->>C: T3-1 regression + stash
    C-->>O: 9ab5a2a
    O->>CR: targeted review
    CR-->>O: yes, no new regression

    Note over O: Converged
    O->>R: final reconciliation
    R-->>O: coherent; counts were under
    O->>PM: portfolio refresh
    PM-->>O: activate rule-provenance-header next
```


## Setup snapshot

| Item | Value |
|---|---|
| Workbench | `/Users/kai/Projects/productive/F04-FUSION/codebase/fusion/fusion-workbench` |
| Plugin version | 5.7.0 |
| Git HEAD at start | `17730b8` |
| Active Circle | none (`.active-circle` absent) |
| Open issues (`_o_`, shared store) | 10 |
| In-progress issues (`_p_`) | 0 |
| Open plan steps (shared/planning) | 0 |
| Open decisions (`_o_`, shared store) | 0 |
| Analyses (shared) | 6 |
| Circles | 5, all closed-coherent (`_c_`) |
| Guard | OK — `haltActive: false`, 0 consecutive blocks |
| Churn | no file above thrashing score 0 |
| Interrupted session | none (`agentstate.yaml` absent) |
| Concurrent session marker | none found; fresh marker written for this session |

## Domain detection

Heuristic inputs (orchestrator Setup Step 5):

- `commits` (against `fusion-workbench/`) = 0 — the workbench directory is untracked in this repo, so it has no commit history
- `analyses_count` = 6
- `issues_count` = 10
- `decisions_count` = 0
- `code_files` (top level + 1 subdir) = 3 (`hooks/guard.ts`, `hooks/tracker.ts`, `hooks/clear-halt.ts`; 18 at depth 3)
- `data_files` = 0

Literal heuristic output: **strategic**, via the branch `analyses_count > 0 and commits == 0`.

That branch misfires here. It reads "workbench never committed" as "this project does not execute code work", but in this repo the workbench is untracked rather than absent from a code project. The repository is the fusion plugin source: TypeScript hooks, bash helpers under `bin/`, agent prompts, a test suite run by `npm test`. The working default for this session is **code**; the user can override at any individual dispatch.

## Portfolio hint

No anticipated (`_a_`) or active (`_t_`) Circles exist, so no `/fusion:next` hint was printed. All 5 Circles are closed-coherent.

## Open issues at session start

Ten open defects in the shared store:

1. `260707-1006_o_pin-bash-allow-path-no-writeguard-side-effects-with-test.md`
2. `260716-1940_o_stale-bin-fu-exception-in-gitignore.md`
3. `260717-0030_o_git-stash-include-untracked-can-sweep-the-stash-directory.md`
4. `260717-0031_o_p8-lint-gate-scope-open-questions-from-conversions.md`
5. `260717-0032_o_stash-manifest-field-count-says-nine-lists-ten.md`
6. `260717-0107_o_prompt-gaps-surfaced-by-fusion-paths-key-set-derivation.md`
7. `260717-0115_o_live-workbench-split-across-two-layouts-during-conversion.md`
8. `260731-2246_o_cadence-churn-session-defined-two-ways-for-git-commits.md`
9. `260731-2246_o_cadence-empty-key-expansion-writes-a-silently-empty-digest.md`
10. `260731-2246_o_cadence-frontmatter-unused-tools-and-oversized-description.md`

## Notes

- Monitor binary refreshed from the installed plugin at `/Users/kai/.fusion/bin/monitor`.
- Stylometric profiles present (all four already in place, none re-copied).
- Plane config present at `fusion-workbench/plane.config.yaml`.
- Project language: `CLAUDE.md` carries no `**Language:**` line, so the `en` default applies. `chat-voice-en.yaml` and `default-voice-en.yaml` loaded.

## Design decisions (session, 260801)

The user raised the normative-surface drift problem: decision records, rule files and `CLAUDE.md` accumulate contradictions and bulk as a project proceeds, and the always-loaded ones consume context budget. An analyst gap analysis was run (`shared/analyses/260801-1020-normative-surface-drift-gap-analysis.md`), which filed three decision records. Two are answered here.

### D1 — Where the normative-consistency capability lives

**Answer: Option 3, a writing consolidation agent.** One new agent reads decision records, rule files and `CLAUDE.md` together plus the retained project history, and edits all three.

The user chose this over the analyst's recommendation of Option 2 (a report-only detector). The analyst's case for Option 2 rested on the permission constraint, which the user resolved separately in D2 rather than designing around.

### D2 — May a fusion writer touch `rules/**`

**Answer: Option 2, an environment-gated exemption**, plus a project-level guard config so `findConfigPath()` no longer resolves only to the plugin's own `hooks/config.json`.

Two parts to build:

1. `FUSION_ALLOW_RULES_WRITE`, extending `overridesFromEnv`, following the existing `FUSION_ALLOW_BRANCH_SWITCH` / `FUSION_ALLOW_WORKTREE` precedent at `hooks/guard.ts:155-178`, including the `guard_advisory` event and escalation entry so the override is never silent.
2. Project-level config resolution, so a consuming project can declare its own `protectedPaths` rather than sharing one list across every project on the install (`hooks/lib/config.ts:15,21-32`).

Chosen over the analyst's recommendation of Option 1 (keep the block absolute). The accepted residual risk is stated in the record: an environment variable is a claim rather than an identity, and everything in the session inherits it, including any subagent the exempted agent dispatches.

### D3 — Provenance header on rule files

**Answered as D-e below: full adoption now.** Rule files carry a provenance header, all nine plugin rule files are backfilled, and a lint gate fails a rule file that lacks one. Record walked to `_a_` at `shared/decisions/260801-1020_a_provenance-header-on-rule-files.md`.

## Spec decisions (D-a through D-h)

A shaper produced `shared/planning/260801-1122_o_spec-normative-consolidation.md` (seven capabilities) with eight decisions pending, having had no interactive channel on its run. All eight are now answered. The agent is named **`curator`**.

| | Decision | Answer |
|---|---|---|
| D-a | Boundary against the two existing appliers | Split by reason for the edit. The curator edits any surface only when the reason is cross-surface consistency; `/fusion:revise-claude-md` and the reconciler keep their existing jobs. |
| D-b | Rule-file lifecycle | Retire by relocation to **`rules/retired/`**. |
| D-c | Project guard config location | **Project root, git-tracked.** |
| D-d | Review gate | Survey, gate, apply, in one dispatch. |
| D-e | Provenance header | **Full adoption**, backfill and lint included. |
| D-f | Cadence | User-invoked skill, plus a staleness line in `/fusion:cleanup`. |
| D-g | The 54 kB conventions file | **In scope** as a final capability. |
| D-h | Name | `curator`. |

Three answers departed from the shaper's proposed defaults: D-b's destination, D-e, and D-g.

### Two findings that changed answers mid-discussion

**A filename state marker on rule files does not work.** `emit_pattern_in_dir` at `bin/fusion-rules:161` globs `"$dir"/*"$pat"*.md` and never reads file content, so a retired `_s_coding-hygiene.md` still matches `*coding*` and still loads. A marker would make a rule look retired while it stayed binding. The same glob is non-recursive, which is what makes retirement by relocation work with no helper change: any subdirectory of `rules/` already stops loading.

**The workbench archive is not a safe retirement destination.** The user's first answer to D-b was "move to archive". Two verified problems: `fusion-workbench/` is untracked (`.gitignore:50` is the commented-out `## fusion-workbench/`), and `CLAUDE.md` documents the workbench as "Runtime artifact, gitignored. Safe to delete." Archiving a rule file there means git does not hold the bytes and a documented-safe operation destroys it. The user revised to `rules/retired/`, which stops loading for the same reason and stays in version control. The same reasoning moved D-c out of the workbench and out of `.claude/`, which is gitignored outright here (`.gitignore:2`).

### Follow-up decisions after the first spec revision

The revised spec raised four further questions. Three were put to the user; the fourth (where a `.claude/rules/` file retires to) was accepted as the shaper specified it, namely retire in place with a version-control precondition that stops and asks.

| | Question | Answer |
|---|---|---|
| Q1 | The `Bash` bypass of the protected-path check | **Fix the guard properly, as its own Circle.** Widen the guard's `Bash` inspection to check file-mutating commands against `protectedPaths`, in the shape `classifyGitCommand` already uses. |
| Q2 | The conventions file, given that splitting alone saves no context | **"Reconcile and compact first, then partition and scope in this session."** A four-step ordering, all in scope. |
| Q3 | What the seeded project guard config contains | **Inherit by default.** The project adds or removes entries explicitly, and picks up later fusion defaults automatically. |

Q2's answer was not among the options offered and is better than all of them. Reconciling and compacting before partitioning means the split boundaries are drawn on content already verified correct, rather than partitioning stale text. Steps 1 and 2 also exercise the exact capability being built, on the largest target available.

The scoping step (4) carries the sharpest residual risk in the whole spec. Partition drops a constraint visibly and is caught by the zero-removals check; scoping drops a constraint for one agent only, silently, and no existing test would catch an agent that stops receiving a rule it needed. The shaper was asked to specify a safety standard for it.

### Guard defect found during specification

`shared/issues/260801-1156_o_bash-bypasses-the-protected-path-check-entirely.md`, filed this session. In any consuming project, every path in `guard.protectedPaths` is writable through `Bash`. Verified at `hooks/guard.ts:265-268`: a `Bash` call is sent to the git branch check and returns unconditionally, never reaching the protected-path check at line 309. `guardBashCommand` ends in `allow()` at line 214 for anything that is not a branch or worktree operation.

This affects all nine protected entries at `hooks/config.json:8-18`, including `fusion-workbench/.guard-state/**`, so an agent can edit the escalation counter meant to halt it. The early return appears deliberate (`hooks/guard.ts:201-213` documents sound reasons about not resetting the block counter and not flooding the event log), but the consequence of skipping the path check alongside the bookkeeping was seemingly not traced.

It directly undercuts decision D2 taken earlier this session: gating rule writes behind `FUSION_ALLOW_RULES_WRITE` on the `Edit` path achieves little while `mv` is unguarded. Not reproducible in this repo, since the write guard stands down here (`hooks/lib/self-detect.ts:18-33`); any test needs a consuming project or a fixture.

### Drift instances found while discussing the drift problem

Four falsified claims in the always-loaded normative surfaces, all Tier 1 by the spec's own prune standard, all found incidentally:

1. `CLAUDE.md` cites `fusion-workbench/decisions/260516-*-bus-*.md` as superseded records. That is a pre-v4 path, the files exist nowhere in the workbench, and the archive is empty.
2. `CLAUDE.md` describes `fusion-workbench/` as gitignored. It is untracked but not ignored.
3. The gap analysis reported the guard hardcodes `rules/**` protection. It is configuration (`hooks/lib/config.ts:52`, values at `hooks/config.json:8-18`).
4. Zero decision records carry the superseded marker across a v4 layout restructure and a protocol removal.

### Scope correction made during the discussion

The analyst reported that the guard hardcodes `rules/**` protection. It does not: the list is configuration (`hooks/lib/config.ts:52`, values at `hooks/config.json:8-18`). Establishing that changed the scope materially. The plugin's own nine rule files, totalling 108 kB with `fusion-workbench-conventions.md` alone at 54 kB, are edited in the plugin source repo where the guard already stands down (`hooks/lib/self-detect.ts:18-33`). Decision records and `CLAUDE.md` are unprotected everywhere. The new flag therefore covers only a consuming project's own `./rules/` directory.

Confirmed with the user: `.claude/rules/` is expected to be empty by convention, since rules are read agent-specifically from `<project-root>/rules/`. It does not exist in this repo. Nothing in this design touches `~/.claude`.

## Per-Turn Log

(no Turns yet)

---

## Coherence

<!-- RECONCILER-OWNED -->

**Verdict:** coherent

**Edges:**

- **Artifact↔Grounding:** 31 claims verified against the code and the suite (8 plan steps, 9 of 10 C5c spec criteria, 14 issue resolution notes spot-checked for the claim each makes) — 8 drift items, every one of them in a tracking marker rather than in the work, 6 corrected and 2 filed as issues — 1 open reviewer issue, Low severity, `circles/260801-1244-guard-bash-inspection/issues/260801-1904_o_four-classifier-behaviours-are-deletable-with-a-green-suite.md`, re-verified as genuinely open rather than trusted. Every one of the sixteen commits traces to a plan step, a filed issue, or a recorded user gate; none is ungrounded. `npm test` 753 passed, `git status --short hooks/dist` empty after the build.
- **Artifact↔Directive:** the commits move **toward** the Directive along the path the Grounding itself specified, and do not reach it. `17730b8..9ab5a2a` delivers the Directive's second clause ("build the guard shell-inspection fix first") in full and its first clause ("tackle drift and bloat across decision records, rule files and `CLAUDE.md`") only incidentally — four falsified claims were corrected in always-loaded surfaces along the way (`3806a49` in `CLAUDE.md`, `README-hooks.md` and `rules/git-branch-discipline.md`; `a342e9b` in `agents/ontocoder.md`). Not orthogonal: the spec's own dependency graph places C5c upstream of the curator, and C5c is what turns `FUSION_ALLOW_RULES_WRITE` from a decoration into a control. Not away: nothing built contradicts the Directive or forecloses any of it.
- **Grounding↔Directive:** 4 active decisions consistent, 0 conflicting. `shared/decisions/260801-1020_a_where-does-normative-consistency-live` (a writing curator), `_a_may-any-fusion-writer-touch-rules` (the permission it needs), and `_a_provenance-header-on-rule-files` (the evidence surface it prunes on) form one coherent chain aimed at the Directive — D2's answer departs from its own recommendation *because* D1 chose an editing agent, which is dependency, not contradiction. The fourth, `260719-2141_a_concurrency-worktree-slots-vs-single-active-circle`, concerns concurrency and neither supports nor conflicts with this Directive. No `_o_` decision exists in either store.

**Rebalance recommendation:** none

### What remains between here and the Directive

Stated plainly, because the second edge is where a `coherent` verdict could be mistaken for a finished one. It is not.

**One of the Directive's four Circles has closed. It is the prerequisite, not the substance.** The Directive's first clause is carried by three Circles that are all still `_a_` and all still empty: `260801-1244-guard-rules-write` (C5a/C5b — the flag and the project-level guard config), `260801-1244-rule-provenance-header` (the header convention, the backfill, the lint gate), `260801-1244-curator` (the agent that actually reads and edits the three normative surfaces together). Nothing about drift in decision records, nothing about the 54 kB conventions file, nothing about `CLAUDE.md` bulk has been built.

**Their dependency graph survives this Circle intact and is now one link shorter.** `-guard-rules-write` named this Circle as the one that had to land first, on a correctness-of-claim basis rather than a compile basis; that dependency is satisfied, so it is the next activatable of the three. `-rule-provenance-header` correctly declares no dependencies and can run in parallel. `-curator` still waits on both. No wording in any of the three was invalidated by what was built — one number moved: the provenance backfill target is now ten plugin rule files rather than nine, because this Circle shipped `rules/protected-path-discipline.md`.

**Two honest observations that do not flag the edge but should not be lost.**

First, the prerequisite consumed the session. Three Turns, sixteen commits where eight were planned, two self-inflicted regressions found and closed by review — for a Circle whose own Directive calls itself a fix to a defect found while specifying something else. Six of the eight unplanned commits were defect fixes, and four of those closed pre-existing holes in the *shipped git branch classifier* the Circle was only supposed to borrow a parser from. That is depth, and the Artifact is verifiably sound, but the distance to the Directive did not shrink by three Turns' worth.

Second, the first rule file authored after `_a_provenance-header-on-rule-files` was answered shipped without a provenance header. That is the decay this whole Directive exists to attack, occurring inside the session that named it, four hours after the decision. It is not an incoherence — no Circle was tasked with the header yet — but it is the sharpest available evidence that the Directive's first clause is real and unaddressed.

**Why `coherent` rather than `review-needed`.** The remaining distance is *planned* distance, held in three Circles with correct Directives and correct dependencies. There is no drift here for a Rebalance to resolve: the Directive is right, the Grounding supports it, and the Artifact is a faithful piece of it. Firing the gate would offer "revise Directive" against a Directive that needs no revision.

### Two things the orchestrator must not carry into Phase 4 unnoticed

- `circles/260801-1244-guard-bash-inspection/_t_circle.md` still reads `**Status:** anticipated`, with `**Active session history:** (none yet)` and an empty `## Turn log`. These are outside the reconciler's write scope. **If the record is renamed `_c_` in this state, the Circle's Turn log is permanently blank** — three Turns and sixteen commits with no durable record on the Circle itself.
- `agentstate.yaml` is frozen at `turn: 1 / tasks_done: 4 / commits: 4` and this file's own header still reads `**Directive:** (not yet set)` with `(no Turns yet)`. Filed as `shared/issues/260801-2038_o_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md`.

Full evidence: `circles/260801-1244-guard-bash-inspection/history/260801-2038-reconciliation.md`.
