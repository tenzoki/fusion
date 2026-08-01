# A project can permit rule-file writes deliberately, per session, and never silently

---
**Domain:** code
**Status:** anticipated
**Filed by:** shaper (anticipated-circle mode)
**Active spec/plan:** shared/planning/260801-1122_o_spec-normative-consolidation.md (the spec covers all four Circles of this body of work; the per-Circle implementation plan is produced by the planner at activation)
**Active session history:** (none yet)

---

## Directive

A consuming project can permit rule-file writes on purpose, for one session, and see every write that happened only because it did. With `FUSION_ALLOW_RULES_WRITE` set, the protected-path check exempts the project's rule directories and the `retired/` destination inside them, and nothing else: `agents/**`, `skills/**`, `hooks/config.json`, `hooks/hooks.json`, `settings.json`, `bin/monitor`, `.claude-plugin/plugin.json`, and the guard's own state directory stay blocked. Setting the variable does not turn the guard off and does not clear an active halt. Each exempted write emits a `guard_advisory` event and pushes a `clear`-level entry onto the escalation record, in the same shape the branch-switch override already uses, so the user reads the exempted writes in `.guard-state/events.jsonl` and on the monitor dashboard. With the variable unset, behaviour is exactly as today. Alongside the flag, the guard stops sharing one protected-path list across every project on an install: it reads a git-tracked `fusion-guard.json` at the project root first, then the plugin's `hooks/config.json`, then the in-code defaults, merging per top-level key so a project can narrow the list as well as widen it. A hardcoded floor keeps the configuration file itself protected regardless of what the file says, and a missing or unparseable project file falls back to the plugin's with one advisory event naming the failure rather than failing open in silence. `/fusion:setup` seeds a template that declares inheritance and lists no paths, so a project set up today still receives any path fusion protects in a later version.

**Capabilities carried:** C5a and C5b. The spec holds the exemption's exact boundary, the merge semantics, the self-protection floor, the seeding rationale, and the twelve acceptance criteria under `### C5: Guard changes` and its `*C5a and C5b:*` criteria block. They are not restated here, so the spec stays the single source of detail.

## Grounding snapshot

Two settled decisions are inputs rather than options. D2 asked for both halves: an environment-gated exemption and project-level guard configuration. The spec's D-c fixed the configuration's location at the project root, git-tracked, over the workbench and over `.claude/`, because a setting whose disappearance silently reverts `protectedPaths` to the plugin default is treated as source and belongs in a diff. The spec's D-k fixed the seeded template as inherit-by-default, with the cost accepted: a reader cannot see the effective list without opening the plugin's `hooks/config.json`, and a commented-out copy of the defaults was rejected because it documents itself once and then goes stale silently.

**Why the loader cannot reach a project today, verified.** `findConfigPath()` walks up from the compiled hook's own directory (`hooks/lib/config.ts:21-32`), which sits inside the fusion install, so it always resolves to the plugin's `hooks/config.json`. The project root is locatable from the same anchor `hooks/lib/workbench-root.ts` already computes; how to reach that module from `hooks/lib/config.ts` without a circular import is one of the questions the spec leaves to the planner, along with the file format, the resolution order, and how `loadConfig`'s cache interacts with two sources.

**Verification cannot happen in this repository.** The write guard stands down in the plugin's own source tree (`hooks/lib/self-detect.ts:18-33`), so an `Edit` to `rules/` here succeeds with or without the flag. The exemption and the block both need a consuming project or a fixture that is not the plugin repo. Whether `/fusion:setup` should seed `fusion-guard.json` here at all, where the guard has no effect, is an open question for the planner.

**The accepted residual, recorded in D2 and restated so it is not rediscovered:** an environment variable is a claim, not an identity. Everything in the session inherits it, including any subagent the exempted agent dispatches.

**Spec and its prior decisions** (cited where they live, per the Origin Rule, not copied):

- Spec: `shared/planning/260801-1122_o_spec-normative-consolidation.md`. C5a, C5b, the constraints block, and `## Circle structure`.
- Gap analysis: `shared/analyses/260801-1020-normative-surface-drift-gap-analysis.md`.
- **D1** — `shared/decisions/260801-1020_a_where-does-normative-consistency-live.md`. A writing consolidation agent rather than a report-only detector. The reason a fusion agent needs to touch rule files at all.
- **D2** — `shared/decisions/260801-1020_a_may-any-fusion-writer-touch-rules.md`. The direct input to this Circle: both the exemption and the project-level configuration come from it.
- **D3** — `shared/decisions/260801-1020_a_provenance-header-on-rule-files.md`. Answered by the spec's D-e and realised in Circle `260801-1244-rule-provenance-header`. Unrelated to this Circle's work; cited so the three open normative decisions are visible from every record in the set.

Two filed issues sit adjacent and are not part of this Circle: `shared/issues/260801-1020_o_guard-protects-rules-but-not-claude-rules.md` and `shared/issues/260801-1156_o_bash-bypasses-the-protected-path-check-entirely.md`. The second is closed by the Circle this one depends on.

## Dependencies

**`260801-1244-guard-bash-inspection`** — must land first. The dependency is not a compile dependency; the flag builds and runs fine on today's guard. It is a correctness-of-claim dependency. `FUSION_ALLOW_RULES_WRITE` sits on the `Edit` path, and while `mv`, `rm`, `sed -i` and shell redirection reach the same file unguarded, the flag controls the polite route to a door standing open. Shipping this Circle first delivers the appearance of a control, which is worse than an acknowledged absence because it stops anyone looking.

Depended on by `260801-1244-curator`, but weakly: the curator is buildable and testable in this repository without the exemption, and needs it only for its rule-file writes to be exercisable in a consuming project.

## Turn log
