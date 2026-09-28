# A project can permit rule-file writes deliberately, per session, and never silently

---
**Domain:** code
**Status:** closed (coherent)
**Filed by:** shaper (anticipated-circle mode)
**Active spec/plan:** 260801-1122_*_spec-normative-consolidation.md (spec, covers all four Circles of this body of work) · 260804-1633_*_plan-c5b-remediation-and-ship.md (C5b remediation and ship) · 260804-2356_*_plan-ausstieg-kontextsteuer-und-auslieferung.md (Ausstiegsplan) · predecessor 260802-1856_*_plan-guard-rules-write.md (steps 1–8 complete, 9/10 superseded)
**Active session history:** 260805-2117-orchestrator-session.md (latest; 11 orchestrator sessions total under history/)

*Status, plan and history fields corrected retroactively by the reconciler on 260805-2323 — the record had never been updated after activation (issue `260805-1830_*_der-circle-datensatz-dieses-circles-widerspricht-seinem-eigenen-marker-und-fuehrt-keinen-turn-log.md`, closed by this correction). The Turn log below is likewise reconstructed from the orchestrator session histories rather than appended live.*

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

- Spec: `260801-1122_*_spec-normative-consolidation.md`. C5a, C5b, the constraints block, and `## Circle structure`.
- Gap analysis: `260801-1020-normative-surface-drift-gap-analysis.md`.
- **D1** — `260801-1020_*_where-does-normative-consistency-live.md`. A writing consolidation agent rather than a report-only detector. The reason a fusion agent needs to touch rule files at all.
- **D2** — `260801-1020_*_may-any-fusion-writer-touch-rules.md`. The direct input to this Circle: both the exemption and the project-level configuration come from it.
- **D3** — `260801-1020_*_provenance-header-on-rule-files.md`. Answered by the spec's D-e and realised in Circle `260801-1244-rule-provenance-header`. Unrelated to this Circle's work; cited so the three open normative decisions are visible from every record in the set.

Two filed issues sit adjacent and are not part of this Circle: `260801-1020_*_guard-protects-rules-but-not-claude-rules.md` and `archive/260817-1907-safe-cleanup-scoped/260801-1156_*_bash-bypasses-the-protected-path-check-entirely.md`. The second is closed by the Circle this one depends on.

## Dependencies

**`archive/260817-1907-safe-cleanup-scoped/260801-1244-guard-bash-inspection`** — must land first. The dependency is not a compile dependency; the flag builds and runs fine on today's guard. It is a correctness-of-claim dependency. `FUSION_ALLOW_RULES_WRITE` sits on the `Edit` path, and while `mv`, `rm`, `sed -i` and shell redirection reach the same file unguarded, the flag controls the polite route to a door standing open. Shipping this Circle first delivers the appearance of a control, which is worse than an acknowledged absence because it stops anyone looking.

Depended on by `260801-1244-curator`, but weakly: the curator is buildable and testable in this repository without the exemption, and needs it only for its rule-file writes to be exercisable in a consuming project.

## Turn log

*Reconstructed by the reconciler on 260805-2323 from the orchestrator session histories in `history/`; commit ranges cited where recoverable. The record was not maintained live — see the correction note in the header.*

| Session | Turns | Commits (range or key) | Outcome |
|---|---|---|---|
| `260802-1827-orchestrator-session.md` | 1–2 | from `c7f117b`: `768242c`, `6b3aa5c`, `0f341e0`, `45f53d4`, `bf75941` (plan steps 1–5), Turn-2 boundary hardening incl. `aff7486` | Plan A steps 1–5 built; flag live on both surfaces |
| `260803-1038-orchestrator-session.md` | 3 | from `c9bf59e`, incl. `ce7a125`, reconciliation 260803-1516 | Turn-2 review findings worked; Coherence `review-needed`, user stopped, Circle stayed active |
| `260803-1737-orchestrator-session.md` | 4–8 | `6c447eb`..`cc012fc` incl. `86a437a` (case folding), `a79ff1a` (gate-0 `cd -P`) | Max-Turns circuit breaker (5/5); Coherence `review-needed`, Directive judged still reachable |
| `260804-1138-orchestrator-session.md` | — | from `c43a6a2`, incl. `b93dda4` | Decision `260804-0947_*_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md` answered option 4; shell reachability model spun out as `260804-1205-shell-reachability-model` |
| `260804-1243-orchestrator-session.md` | 9–10 | from `d2962f3`: `4f1007f`, `613d6fd`, `1187bfd` | The two git routes into the protected list closed |
| `260804-1407-orchestrator-session.md` | — | `46d8333`, `557340d`, `7f3d789` (plan A steps 6–8); `53b3765` (assessment: do not ship); `eae2cb7`, `70e769e` (C5b remediation plan); `f82ac02`, `64e0837`, `9c01f34`, `98c9363`, `ac20f7d`, `f0c3d65`, `49a1c48` (remediation steps 1–5) | C5b built, independently assessed, remediated |
| `260805-0638-orchestrator-session.md` | — | `658653a` (emission golden), `b67a386`, `c920463`, `96ad1db`, `0fead5e` (Ausstiegsplan steps 2–4a), `f41c1f6`+`2eaee31` (role-cap gate + release v5.9.0), `199ef22` (dist), `ec0561a` (v5.9.1), `1babb48`, `3163281`, `a1002cc` (Gesamtreview, 66 findings), `b5a9039` (Textschicht Circle filed) | Context-tax cut shipped as v5.9.0/v5.9.1; plugin-wide review filed |
| `260805-2035-orchestrator-session.md` | — | `8586ba3` | Monitor LAN bind fix |
| `260805-2117-orchestrator-session.md` | 1–2 (close-out) | `4a8fea0` + tag `v5.9.2` (release); `21a72b7` (C5b plan step 6, template), `373f5ed` (step 7 remainder + release-checklist line), `b9b350f`, `def351e` (issue closures) | v5.9.2 released; C5b plan steps 6+7 landed; Circle reconciled for closure |

## Activation proposal

**Recommended as the next Circle — playmaker run 260802-1736-playmaker-direct-dispatch.md (trigger: direct-dispatch, domain
bias `code`), and this is a change from the previous three runs, which ranked this Circle second.**

The Circle ranked ahead of it, `260801-1244-rule-provenance-header`, closed coherent at commit
`060859b`, so the field is now two anticipated Circles rather than three. Both pass the
code-domain criteria without argument. This Circle's one dependency,
`archive/260817-1907-safe-cleanup-scoped/260801-1244-guard-bash-inspection`, carries the closed marker. The rival's hard dependency also
closed this run, and neither Circle's `## Grounding snapshot` cites an open decision record: the
shared decision store holds no open record at all, and the three this Circle cites are two
answered (`260801-1020_*_where-does-normative-consistency-live.md`,
`260801-1020_*_may-any-fusion-writer-touch-rules.md`) and one now implemented
(`260801-1020_*_provenance-header-on-rule-files.md`, which moved from answered
to implemented at the closure). Zero open decisions and zero unmet dependencies on both sides, so
the ranking turns on unblock value, and there the position reversed.

**Why this now outranks the curator.** Closing `archive/260817-1907-safe-cleanup-scoped/260801-1244-guard-bash-inspection` sealed the
shell route into `rules/`, which was the last unguarded way in. `hooks/config.json` lists
`rules/**` under `guard.protectedPaths`, and the guard now checks that list on file-mutating
shell commands as well as on the four write tools. In a consuming project there is therefore no
route by which a curator can write or retire a rule file, and the flag that is supposed to open
one, `FUSION_ALLOW_RULES_WRITE`, is exactly what this Circle builds. The spec's own reconciler
recorded the same state on 260801-2029: the retirement requirement is "enforceable in principle
(the shell route is guarded) but not enforced in fact (the flag and the advisory do not exist)".
The curator record calls its dependency here soft, and that label is right for building and
testing the agent in this repository, where the write guard stands down. It understates the
position for a consuming project, where a curator shipped before this Circle cannot perform its
rule-file half at all.

**The second reason is that this Circle is the last one that unblocks anything.** With it closed,
the curator activates with no unmet dependency of either kind, and the remaining work is a single
sequence rather than a choice.

**Suggested activation timestamp:** 260802-1736-playmaker-direct-dispatch.md (or whenever the user activates).

**Activation notes, which do not change the ranking.** Two sizing cautions carry forward and are
now better evidenced than when they were first written. This Circle touches the same guard code as
the Circle that overran (`archive/260817-1907-safe-cleanup-scoped/260801-1244-guard-bash-inspection`: sixteen commits and three Turns
against eight planned steps), and its own acceptance criteria cannot be verified here, because the
write guard stands down in the plugin's own tree (`hooks/lib/self-detect.ts:18-33`). The Circle
that closed this run was forecast as the small, bounded, in-repo-verifiable case and still ran
three Turns and eight commits against a four-step plan, filing ten review findings and delivering
fourteen non-workbench paths against a plan that bounded itself to eleven. Two overruns in a row,
the second on the case chosen for its boundedness, argue that the plan for this Circle should
budget the consuming-project fixture work as its own step rather than treating verification as a
final sweep. The record's open questions for the planner are unchanged: how `hooks/lib/config.ts`
reaches the project root without a circular import, the configuration file format and resolution
order, how `loadConfig`'s cache interacts with two sources, and whether `/fusion:setup` should
seed `fusion-guard.json` in this repository at all.

*No `mv` and no `.active-circle` write by playmaker — the user confirms via `/fusion:next`, or the
orchestrator activates. Proposal, not commitment.*

## Closure note

Closed coherent (`_t_` → `_c_`) on 260805-2359-conceptrev-plan-textschicht-gegen-code.md. Phase-3 verdict: **coherent** — the reconciler's
review-needed flag (stale emission golden after the Step-7 documentation commit) was resolved via
Rebalance/Revise-Artifact in Turn 3 (commit `24186a4`); with it, all three Coherence edges are
clean. All twelve spec acceptance criteria verified with per-criterion test citations
(`260801-1122_*_spec-normative-consolidation.md:309-332`), suite 1551/1551 green
against source and against the shipped `dist` artifact. All three plans closed; shipped as
v5.9.0–v5.9.2 (tags pushed).

Session history: `260805-2117-orchestrator-session.md` (Turns 1–3, commits
`21a72b7`, `373f5ed`, `b9b350f`, `def351e`, `24186a4`, `89f2c58`).
Reconciliation: `260805-2334-reconciliation.md`.
Open issues remaining in this Circle at closure: 79, all claimed by other Circles' scope
(64 Textschicht, 8 shell-reachability, 2 plane/framework, 1 priced deferral) plus the
user-side unite-cocreator emission measurement (`260805-2323_*_die-emissionsmessung…`).

*Reconciliation 260806-1152 (reconciler, workbench-wide pass): the closure note's count of 79 open issues was right, but its breakdown enumerates only 76 — it omitted `issues/260804-2100_*` (a ninth shell-classifier record) and `issues/260805-1150_*` (README pin, then still open) and counted the corpus one low. Current state at HEAD `cde5319`: **18 open** in this Circle — 6 routed corpus findings (3× `260805-1830_*`, 2× `260805-1839_*`, `260805-1859_*_das-guard-event-log…`), 9 shell-classifier records routed to `260804-1205-shell-reachability-model` (8× `260804-*` plus `260804-2100_*`), the unowned advisory-clamp deferral `260803-1352_*`, the framework observation `260805-1548_*_beim-filen…`, and the user-side unite measurement `260805-2323_*`. Closed since the Circle closed: 60 corpus findings (Textschicht Circle), plus `260805-1150_*_readme-nennt-als-pin-beispiel-eine-version-die-nie-getaggt-wurde.md` and `260805-1548_*_der-plane-testfixture…` (this pass, fixes verified at HEAD).*
