# Shaper session — normative-surface consolidation, third and final pass

**Date:** 2026-08-01 12:15
**Agent:** shaper (user-direct mode, third revision of a prior shaper output)
**Output:** `shared/planning/260801-1122_o_spec-normative-consolidation.md` (revised in place)
**Also filed:** `shared/issues/260801-1215_o_conventions-file-cites-three-records-that-do-not-resolve.md`
**Prior runs:** `shared/history/260801-1122-shaper-normative-consolidation.md`, `shared/history/260801-1154-shaper-normative-consolidation-revision.md`

## Request

Write in the user's answers to the four questions the second pass raised (Q1 through Q4), re-assess the Circle structure, specify a safety standard for the scoping step, and give an honest read on whether the whole thing fits in one session.

## What was read

- The spec and both prior shaper histories in full.
- `shared/issues/260801-1156_o_bash-bypasses-the-protected-path-check-entirely.md` in full.
- `hooks/guard.ts:180-340` (the Bash branch, the self-detect stand-down, the protected-path check), `hooks/lib/git-branch-guard.ts:1-260` plus its export list, `hooks/lib/paths.ts`.
- `bin/fusion-rules:1-150` (the pattern table and the header contract) and `:245-310` (the emission block).
- `rules/context-manifest.md` in full.
- `rules/fusion-workbench-conventions.md:155-200` (`### Emission is per-consumer, and derived from the prompt`).

## Verifications performed during this pass

Everything below was run, not inferred.

- **The manifest cannot scope a plugin-shipped rule file.** Two independent reasons. It never ships in the plugin (`rules/context-manifest.md` `## Where the manifest lives (locked)` fixes it at `./rules/context-manifest.yaml` in the consuming project). And its emission is purely additive — `bin/fusion-rules` emits the conventions file through `emit_if_exists` in section 1, and the manifest block is section 3, gated on the file existing so the no-manifest path stays byte-identical. Nothing in the mechanism suppresses an emission. This invalidated the mechanism the user named for C9 step 4; the working lever is the `case "$AGENT"` PATTERNS table.
- **`bin/fusion-rules` is agent-only.** Exits 2 on an unknown name; only `/fusion:setup` invokes it, as `orchestrator`. So per-agent scoping does not reach skill bodies, which cite rule content by path.
- **The derivation trick does not transfer, and the conventions file says so in its own text.** `### Emission is per-consumer, and derived from the prompt` states that `bin/fusion-rules`'s agent-to-pattern mapping is deliberately hand-maintained because "an agent's prompt does not name the rule files that apply to it... A key set is not a fact; it is a restatement of the prompt."
- **Measured the residual.** 71 `##`-section citations of the conventions file across 29 agent and skill files, naming 9 distinct sections. But four sections carrying binding rules are named by **zero** prompt or skill body: `## Issues vs Decisions — when to use which`, `## Issue and Decision Filing — MANDATORY`, `## Decision Record Template`, `## Inline State Tracking`. A citation-derived floor would place all four at zero and license scoping them away from every agent. This is what made the derived floor a catch rather than a standard.
- **32 second-level headings, 18 document sections.** 14 headings are template body under `## Circle record template`, the embedded `portfolio.md` template, and `## Decision Record Template`. A partition driven off `^## ` would shred all three templates. This corrects the second pass's acceptance criterion, which said "all 32 second-level headings" without the distinction.
- **Section byte sizes** measured for the seam discussion: Path Resolution 12 193, Layout 6 205, Stashes 5 745, circle markers 5 272, decision markers 3 373, Commit lock 2 739, Origin Rule 2 670.
- **Always-on rule total is 87 387 bytes per agent**, of which the conventions file is 54 401 — 62 percent.
- **Three dangling or stale citations inside the conventions file**, found with one command and filed as their own issue. Two records exist nowhere; one is cited at a pre-v4 root-relative path while the file lives inside a Circle. The archive is empty, so "not found" means gone.
- **The Bash branch sits above the plugin-repo stand-down** (`hooks/guard.ts:265-268` precedes `:274-283`), deliberately, so the branch policy stays live in this repo. A Bash *path* check is a write-guard concern and must stand down here instead — a design detail easy to get backwards, now an acceptance criterion.
- **The shell parsing C5c needs already exists** and is fail-closed: `stripDataRegions` (line 169), `extractCommandSegments` (line 335), `tokenize` (line 409) in `hooks/lib/git-branch-guard.ts`.
- **Scale calibration:** the git branch classifier is 649 lines with an 84-case, 512-line suite, for one command family with two verbs. Mid-size agent prompts run 17-24 kB.

## What changed in the spec

- Status: final, twelve decisions, nothing pending on the user.
- Directive extended to the four-step chain and the guard repair.
- Shape diagram: C5c added, C9 shown as four steps. Fixed a node-ID collision I introduced (`S1`-`S3` clashed with the surfaces subgraph).
- C4: the guard-bypass paragraph no longer leaves the mechanism to the planner; it cites C5c.
- C5 retitled and reordered. **C5c added** — the Bash file-mutation classifier, with the reuse surface, the three mutation classes, the fail-closed bound and its accepted residual, the self-detect interaction, the preserved bookkeeping, and ten acceptance criteria.
- C5b seeding: inherit-by-default with the cost stated as accepted, and the commented-defaults alternative explicitly rejected.
- **C9 rewritten** as reconcile → compact → partition → scope, with the ordering rationale, an explicit warning that step 2 will not deliver the saving, the three verified reconcile instances, the past-statement adjudication rule, the template-shredding correction, the mechanism correction for step 4, and the six-part safety standard S1-S6 with its residual stated.
- Constraints: ten new verified entries.
- Out of Scope, Open for Planner: updated.
- `## Decisions taken`: D-i through D-l added.
- `## Circle structure` added — four Circles with dependency directions and a diagram.
- `## Questions raised by the answers` became `## Questions raised by the second pass, and their answers`.

## Position taken against the request

Two places where I did not simply write the answer in.

1. **Q1's named mechanism was wrong** and the spec says so with the evidence. The user's ordering is adopted unchanged; the tool named for its last step is replaced, and the consequence — step 4 is `bin/` work handed to a coder, not curator work — is carried into C1's remit boundary and C9's acceptance criteria.
2. **The scoping safety standard does not claim to prevent loss.** The user asked what "no agent loses a rule it relies on" is checked against. The honest answer is that nothing checks it, because nothing states which rules an agent relies on. The standard delivers no *silent* loss instead, and the spec says that plainly rather than dressing six mitigations as a guarantee.

## Circle recommendation

Four, up from three. The guard work splits: `guard-bash-inspection` (C5c) then `guard-rules-write` (C5a, C5b). Different blast radii, the first independently valuable and revertable, and the dependency runs one way.

## Scale assessment

Reported to the user in chat rather than written into the spec, since it is a judgement about session planning rather than a requirement. Summary: four Circles is not one session's work, and the smallest coherent first session is `guard-bash-inspection` alone.

## Filed

One issue: `shared/issues/260801-1215_o_conventions-file-cites-three-records-that-do-not-resolve.md`. It is a live defect independent of whether the curator is ever built, and C9 step 1 — which would otherwise cover it — is the closing work of the last of four Circles.

No decision records. Every decision was answered by the user in this round.
