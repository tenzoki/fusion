# How the frozen migration plan carries an optional repair

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Partners:** orchestrator and consultant
**Rounds:** 2
**Ceiling:** 8
**Outcome:** converged
**Cross-references:** 261003-2045_*_how-does-the-frozen-plan-carry-an-optional-repair-the-migration-plan-schema-admits-only-for-blocking-findings.md, 261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md

---

## Question

Decision 261003-2045 (open), filed by the code-implementer at FJ04 step 12d (commit `e7cb55c0`): since 12d every repairable finding class is `reported`, while `codec/schemas/migration-plan.schema.json` `$defs/repair` pins `finding.severity` to `const: "blocking"`, so an applied optional repair makes the codec refuse the plan. Options: (1) the schema admits `reported` in a repair entry, bundle digest moves again; (2) the host carries only blocking-finding repairs in `repairs`, optional ones stay in the repair log and backup; (3) `repair --apply` refuses a reported finding until option 1 lands. The user invoked `/fusion:discuss` right after the orchestrator put this decision to him in chat.

## What held up

### C1 — Since step 12d every repairable class is `reported`, so the frozen plan's `repairs` part can only be empty or make the codec refuse the plan.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `hooks/lib/legacy-import.ts:396` (severity from `FINDINGS`), `:141-163` (all 10 `REPAIRS` classes `reported`), `hooks/lib/legacy-repair.ts:212` ff., `hooks/migrate.ts:251` (`serialise` copies the finding), `codec/schemas/migration-plan.schema.json:134` (`const: "blocking"`).

### C2 — Under option 2, a control-only answer (e.g. the actor of a terminal record) enters the migrated control with no `derived` entry and no frozen record in the workbench of where it came from.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `hooks/lib/legacy-repair.ts:367` (`actorsFromLog` keeps `control_only`), `hooks/lib/legacy-import.ts:663` (actor returned before any `derived` entry), `:667-670` (`derived` only on the unknown path), `legacy-repair.ts:402` (terminal narrative not edited, pre = post sha256).

### C3 — Option 1 is a schema-only change: no `codec/src` logic branches on a repair entry's `finding.severity`.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `codec/src/migration.ts:977` (the one severity branch reads `p.findings`), `:1024`, `:1713`, `:2098`, `:1237` (repairs only split and read back); `migration-plan.schema.json:113` (base finding already admits both values); `migration-proposal.schema.json:43` (same `$defs/repair`); no test pins the `const` refusal. Also changes: the `repair` description (`:127`) and one valid fixture.

### C4 — Option 1's digest move costs Prior no additional qualification: the current digest is unqualified and Prior qualifies one digest at the hand-over.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `codec/fixtures/prior/REQUESTS.md:2009`, `:2127` (last qualified bundle `e1bafd2f`, later digests unqualified), `:2123`, `:2193` (one digest at the hand-over). Plan step 13's "step-12c digest as the frozen one" needs a text edit, no extra qualification.

### C5 — Option 3 departs from the contract text, which keeps the repairs available to the owner.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `REQUESTS.md:2051` ("Every repair … stays available, with consent per finding"), `:2111` (the `paused` path relies on an optional repair).

### C6 — No repair is needed for any of the three step-12 copies to migrate.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** plan step 12d Done note, "Beyond the acceptance": `run` reaches `result=json-control` on all three copies (142 / 744 / 175 records) without a repair, the copy without `.git` included; commit `e7cb55c0`.

### C7 — Option 1 is the right answer among the three.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** C5 and C8: options 2 and 3 each break a contract sentence; option 1 overturns only the schema description "the blocking finding it cleared", which no codec logic relies on (C3).

### C8 — Option 2 also departs from the contract text; "no codec change" does not mean "no contract departure".

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `REQUESTS.md:1484` (each repair logged in the proposal's repair log, carried by the frozen index and receipt), `:1642` (`parts/repairs-<n>.json` is the repair log), `:1982` (a control-only actor is logged in the repair log), `:2011` ("Everything not named here stands").

### C9 — A fourth option, writing `blocking` into the logged finding so it passes the current schema, is ruled out.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** decision 261003-2045 `## Constraints`: "no record states a finding as blocking that was reported".

### C10 — Prior's own types do not constrain a repair entry's `finding.severity`; option 1 changes nothing on Prior's side today.

- **Advanced by:** consultant (split out of C4)
- **Entered:** round 1
- **Last moved:** round 2
- **Evidence:** Prior (read-only), all 87 revisions in `git log --all`: no Go type or decoder for a migration plan, proposal or repair entry (`"repairs"`, `MigrationPlan`, `migration.plan` absent from `*.go`); `internal/fusionhost/codec_process.go:128-156` checks only the response envelope and returns `result` raw; `internal/fusionhost/codec_process_test.go:252-263` expects `op: "migration"` to be `not-implemented`; `tests/testdata/fusion-codec/UPSTREAM.json` pins fusion `e1bafd2`, whose seven schemas do not include `migration-plan.schema.json` (`tests/fusion_codec_test.go:69-81`). Wording narrowed in round 2: Prior does not read the schema yet; the change reaches it only with the FJ04 re-pin, which happens under every option.

### C11 — Prior's only stated obligation at the FJ04 hand-over is to re-pin the bundle and adjust the reviewed expectations; it runs no logic over repair severity that option 1 could break.

- **Advanced by:** consultant
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** Prior `docs/design/fusion-fj04-contract-prior-response.md`, end of `## Repairs, evidence and next handoff` (about lines 358-362).

## What fell

## What could not be decided

## Recommendation

Option 1: the migration-plan schema admits a `reported` finding in a repair entry (the `const: "blocking"` at `$defs/repair` dropped, its description reworded, one valid fixture added), and the bundle is rebuilt before the hand-over. It is the only option that departs from no contract sentence (C5, C8), it keeps every consented value traceable inside the workbench (C2), it needs no codec logic change (C3), and it costs Prior no additional qualification (C4, C10, C11). The stakes are an owner's optional correction, not the upgrade path (C6). This recommendation is qualified by the register above and binds nothing; the decision record 261003-2045 is where the choice is made.
