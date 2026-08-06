# May any fusion writer ever modify rules/**, and by what mechanism?

---
**Domain:** code
**Status:** answered
**Filed by:** analyst
**Cross-references:** `shared/analyses/260801-1020-normative-surface-drift-gap-analysis.md` (Question 3); `shared/decisions/260801-1020_*_where-does-normative-consistency-live.md` (the capability question that raised this); `shared/issues/260801-1020_o_guard-protects-rules-but-not-claude-rules.md` (a defect in the current protection, orthogonal to this choice)

---

## Question

The write guard blocks every write to `rules/**` in a consuming project. The block is unconditional and caller-blind, so no agent and no skill can modify a rule file. Should fusion keep that absolute, or define a mechanism by which some writer may act?

The question is filed separately from the consolidation-capability decision because it outlives that feature. Any future capability that wants to edit a rule file, revise a normative constraint, or migrate a rule between roots runs into the same wall.

## Verified current state

- `hooks/config.json:8-18` lists `agents/**`, `rules/**`, `skills/**`, `hooks/config.json`, `hooks/hooks.json`, `settings.json`, `bin/monitor`, `.claude-plugin/plugin.json`, `fusion-workbench/.guard-state/**` as protected. `CLAUDE.md` is deliberately absent, which is why `/fusion:revise-claude-md` works.
- A protected-path hit is an unconditional block and counts toward escalation (`hooks/guard.ts:309-327`). Three consecutive blocks halt all writes project-wide.
- `interface HookInput` (`hooks/guard.ts:80-85`) carries `session_id`, `hook_event_name`, `tool_name`, `tool_input`. No agent or subagent identity reaches the guard.
- The guard is a `PreToolUse` hook, so a skill's `Edit` call and an agent's `Edit` call are indistinguishable to it. Packaging a capability as a user-invoked skill does not bypass the block.
- `hooks/guard.ts:271-283` stands the write guard down entirely in fusion's own repo, so any such capability would test clean here and fail everywhere else.
- `/fusion:unlock` sets `defaultMode: "bypassPermissions"` (`skills/unlock/SKILL.md:29-34`), which affects Claude Code's permission layer only. The fusion hook blocks independently of it.

## Options

1. **Keep the absolute block.** No fusion writer ever modifies a rule file. Capabilities that identify a needed rule change report it; a human applies it.
   - Pros: preserves the guard's premise intact (`hooks/lib/self-detect.ts:3-9`): agents do not rewrite the constraints they are bound by. Zero implementation. No new bypass axis to reason about later.
   - Cons: every rule-file change stays manual forever. A project with many stale rules gets a report and a chore.

2. **Add an identity signal and an exemption branch.** Set an environment variable at dispatch time, in the shape of the existing `FUSION_ALLOW_BRANCH_SWITCH` and `FUSION_ALLOW_WORKTREE` escape hatches, and let the guard exempt the protected-path check when it is present.
   - Pros: precedent exists in the same codebase, so the mechanism is familiar. Scoped: only the dispatch that sets it is exempt.
   - Cons: an environment variable is not an identity, it is a claim. Anything running in that session inherits it, including a subagent the exempted agent dispatches. Adds a bypass axis to a guard whose value comes from having none. `speculation:` once one exemption exists, the pressure to add a second is much lower-cost to argue.

3. **Let the consuming project remove `rules/**` from `protectedPaths`.** A one-line config edit, already documented as a tuning option (`README-hooks.md:126`, "trim `protectedPaths`").
   - Pros: no code change. The project owner decides, explicitly, and owns the consequence. Reversible.
   - Cons: blunt. Removes the protection for all sixteen agents, not for the one that needs it. A project that wants a consolidation capability gets an unguarded rules directory as the price.

4. **Move rule-file writes behind a git-mediated proposal.** The capability writes a patch or a branch rather than the file; the human reviews and merges.
   - Pros: keeps the block absolute and still automates the drafting. The review step is the real safeguard, and git already provides it.
   - Cons: no such mechanism exists in fusion today, and the branch-switch policy (`rules/git-branch-discipline.md`) constrains what an agent may do with branches. Would need designing from scratch.

## Constraints

- Whatever is chosen must behave the same in fusion's own repo and in a consuming project, or it will ship broken. The self-detect stand-down makes local testing unrepresentative by construction.
- The guard's escalation counter means a capability that repeatedly attempts a blocked write halts the whole project after three tries. Any option that leaves the block in place must also ensure the capability never attempts the write.
- `.claude/rules/**` is currently unprotected (see the linked issue). That defect should be fixed independently, and its fix narrows option 3's appeal, since trimming `protectedPaths` would then expose more.

## Recommendation

Option 1, held at moderate-to-high confidence, with option 4 as the successor if the manual burden proves real.

The guard exists for one reason, stated plainly in `hooks/lib/self-detect.ts:3-9`: an agent must not rewrite the rules that bind it. That is not a configuration preference; it is the property that makes the rest of the compliance machinery meaningful. Granting an exemption trades a structural guarantee for convenience, and options 2 and 3 both do so in ways that are hard to scope back down.

Option 4 is the interesting one if option 1 becomes painful, because it keeps the block absolute and moves the safeguard to where safeguards belong. It is not recommended now only because it does not exist and nobody has yet shown the manual step is a burden.

---
Answered:
Implemented:
Deferred:
Superseded by:
Answered: shared/history/260801-0936-orchestrator-session.md '## Design decisions (session, 260801)' D2 — Option 2 selected: an environment-gated exemption (FUSION_ALLOW_RULES_WRITE) following the FUSION_ALLOW_BRANCH_SWITCH precedent at hooks/guard.ts:155-178, plus project-level config resolution so a consuming project can declare its own protectedPaths (hooks/lib/config.ts:15,21-32). User chose against the recommended Option 1 (absolute block), accepting the stated residual risk that the flag is session-wide and inherited by any subagent.

**Reconciliation 260801-2029 (reconciler) — NOT promoted to `_i_`. Marker stays `_a_`.**

Circle `circles/260801-1244-guard-bash-inspection` closed this session, and the promotion question is live because that Circle is what makes this decision's answer meaningful. It does not realise it.

What exists at HEAD `9ab5a2a`: the `exempt` seam the answer's mechanism plugs into — `MutationOptions.exempt` at `hooks/lib/bash-mutation-guard.ts:168`, consulted at `:1243` and `:1252` after a protected match and before the deny. What does not exist: `FUSION_ALLOW_RULES_WRITE` (grep across `hooks/`, `bin/`, `agents/`, `rules/`, `skills/`, `README-hooks.md` — no match), the `guard_advisory` event on an exempted write, the escalation entry, and the project-level configuration resolution (`hooks/lib/config.ts:21-34` still walks up from the compiled hook's own directory, so it still always resolves to the plugin's `hooks/config.json`).

Both halves of what D2 answered — the exemption AND the project-level configuration — are unbuilt. The deferral is deliberate and recorded: `circles/260801-1244-guard-bash-inspection/planning/260801-1253_c_plan-guard-bash-inspection.md` Q1 defers the `FUSION_ALLOW_RULES_WRITE` acceptance criterion to `circles/260801-1244-guard-rules-write`, which carries C5a and C5b and is `_a_`.

`_i_` is terminal by the conventions, so a promotion on a seam would be unrecoverable without filing a superseding decision. A seam is preparation, not realisation.

**What did change for this decision, and it is the point of the Circle:** the objection recorded in `shared/issues/260801-1156` — that a flag on the `Edit` path is worth little while `mv` is unguarded — no longer holds. That issue is now `_c_`. This decision's answer is unblocked rather than undercut.

---

**Reconciliation 260802-1413 (reconciler, domain `code`) — re-checked, stays `_a_`.**

`FUSION_ALLOW_RULES_WRITE` still matches nothing across `hooks/`, `bin/`, `agents/`, `rules/`, `skills/` and `README-hooks.md` at `b568ad9`. The project-level guard configuration is likewise unbuilt. Realisation still belongs to `circles/260801-1244-guard-rules-write` (`_a_`).

This session edited ten files under `rules/` without the flag and without an exemption, which is not a counter-example: the write guard stands down entirely in the plugin's own tree (`hooks/lib/self-detect.ts:18-33`), so the decision's mechanism was never on this Circle's path. Both the spec and the plan record that explicitly.

---

**Reconciliation 260803-1516 (reconciler, domain `code`) — stays `_a_`. Half of the answer is now real, which is exactly why the marker cannot move.**

The first change since this record was filed. `FUSION_ALLOW_RULES_WRITE` exists at HEAD `fa81589` and works on both guarded surfaces:

- the predicate — `hooks/lib/rules-write-exemption.ts` (511 lines), `RULES_WRITE_ENV`, `RULE_DIR_PATTERNS`, `isProjectRulePath`, three refusal gates and their notes (`6b3aa5c`, hardened through `3b0f9e7` and `245b8b7`)
- the write-tool path — `hooks/guard.ts:786`, inside CHECK 2 (`0f341e0`)
- the Bash path — `hooks/guard.ts:519` via `MutationOptions.exempt` (`45f53d4`)
- the advisory the answer promised — `guard_advisory` plus a `clear`-level escalation entry, rendered on the dashboard at `bin/monitor:91-95` and given its own row budget at `:98-109` (`bf75941`, `aff7486`)

**The second half is untouched.** `hooks/lib/config.ts:34` still resolves `CONFIG_PATH` at module load by walking up from the compiled hook's own directory, and `:108` is still `loadConfig(configPath?: string)`. There is no `fusion-guard.json`, no template for one, and no seeding step in `/fusion:setup`. A consuming project still cannot declare its own `protectedPaths`. That is plan Steps 6 to 8 of `circles/260801-1244-guard-rules-write/planning/260802-1856_*_plan-guard-rules-write.md`, all unstarted.

**And the flag is invisible to the people it is for.** `FUSION_ALLOW_RULES_WRITE` appears in no shipped document — `README-hooks.md` and `rules/protected-path-discipline.md` both still state that no override for a protected-path shell write exists (`:187` and `:171` respectively). Plan Step 9 owns that; `circles/260801-1244-guard-rules-write/issues/260803-1402_o_…` lists what it must say.

`_i_` is terminal, and half a mechanism with a documentation surface that denies its own existence is not a realisation. Stays `_a_`.

---
Implemented: 2eaee31 (release v5.9.0; current v5.9.2) — both halves the previous reconciliations found missing are now shipped. The second half: `hooks/lib/config.ts` reads a git-tracked `fusion-guard.json` at the project root, merged per leaf over the plugin's `hooks/config.json` and the in-code defaults, with the self-protection floor (loader landed `46d8333`, boundary remediated `f82ac02`/`ac20f7d`; template + repo copy `557340d`, rewritten `21a72b7`; `/fusion:setup` seeding `7f3d789`). The visibility half: `FUSION_ALLOW_RULES_WRITE` is named in the shipped documents, the three "no override exists" sentences are corrected, and `fusion-guard.json` is described for users (`373f5ed`; `README-hooks.md` § "Per-project configuration", `rules/protected-path-discipline.md`, `CLAUDE.md`). The twelve C5a/C5b/C5c acceptance criteria are verified with per-criterion test evidence at `shared/planning/260801-1122_o_spec-normative-consolidation.md:309-332`. Walked `_a_` → `_i_` by the reconciler at the final reconciliation of `circles/260801-1244-guard-rules-write`, 260805-2323.
