# Reconciliation — 260806-1057

**Scope:** Final reconciliation of Circle `260805-2005-textschicht-gegen-code-nachziehen` (domain `code`), approved for closure after this pass. Session under reconciliation: 1 orchestrator session (`history/260805-2350-orchestrator-session.md`), 5 Turns, 12 commits `7ef2715`…`fbd8c4d` from anchor `66e4a69`, suite verified green at 1611 tests / 30 files (`npx vitest run`, 260806-1055).

## Plans

1 reviewed, 1 updated. `planning/260805-2353_*_plan-textschicht-gegen-code.md`: Status Complete, marker `_c_`, all 17 steps `[DONE]` — verified consistent against source and commits; `## Reconciliation Log` appended with per-track evidence. No drift between planned approach and implementation beyond what the plan's own step annotations already record (step 6 executed against its falsifier's finding; step 12's ontocoder item done by coder, comment-lines only).

## Issues

- **This Circle:** 11 reviewed, 1 updated. 10 `_c_` (Turn-2 and Turn-4 review findings plus the monitor bind regression), all with resolution footers. 1 open: `issues/260806-0022_*_setup-klammer-probe-und-migrate-reformat-decken-verschiedene-baeume.md` — re-verified at HEAD as a genuine residual (setup probes the whole tree, migrate reformats only `shared/` + `circles/` depth ≥ 2; the shape halves are unified, the scope halves are not). Reconciliation note appended; left open deliberately, not closed silently.
- **The 66-finding corpus** (`circles/260801-1244-guard-rules-write/issues/260805-18*/19*`): counts reconcile exactly — 60 `_c_` + 6 `_o_` = 66. All 60 closed records carry `Resolved:` footers (the Turn-4/5 closes cite "Turn 4" + named files rather than a bare hash; traceable to `b37f13e`/`fbd8c4d`). The 6 open ones match the deliberate list (alle-17-guard-blocks → reachability-Circle Grounding; coder-rust; domaenenheuristik; guard-event-log; tracker-cwd → pairs with guard issue `260804-2100`; install-sh-license → user decision), each with a stated route in its record. Note: step 17's footnote partition (51+3+6+6) describes that step's snapshot; Turns 4–5 subsequently closed the 6 residuals it listed, giving the final 60/6.
- **Shared:** 25 open shared issues, all pre-existing and outside this Circle's Directive; not processed by this pass.

## Decisions

3 reviewed (this Circle), 2 updated. D1 `zitierform` `_i_` with Implemented citing `a1b7872`; D2 `wem-gehoert-die-circle-aktivierung` and D3 `veraltete-regeln` both `_i_` but their footers predated the orchestrator commit ("kein Hash zum Schreibzeitpunkt") — implementing hashes appended by this pass (`81d4154`, `c45fb44`), realisations spot-verified at HEAD. Shared store: 2 records at `_a_` (`260719-2141` worktree-slots, `260801-1020` normative-consistency), both pre-existing, neither conflicts with this Circle's Directive; 0 `_o_` anywhere.

## Circle record

`_t_circle.md` corrected to ground truth (the known record-lag: body said "anticipated" under the `_t_` marker, plan/history fields empty, no Turn log — same class as `shared/issues/260802-0920_*_next-skill-activates-a-circle-without-updating-its-status-field.md`). Now: Status active, Active spec/plan + Active session history filled, Turn log reconstructed from `orchestrator-events.jsonl` (5 Turns with commit ranges). Marker transition `_t_`→`_c_` is the orchestrator's, not done here.

## Directive walk (clause by clause)

| Clause | Verdict | Evidence |
|---|---|---|
| Four code fixes (fusion-rules silent skip, shared_of zsh, bracket probe shape, awk message) | Done | `bin/fusion-rules:242-246` explicit `return 0`; `skills/archive/SKILL.md:51-54` shell-neutral split + `HYG-NO-SILENT-FAIL` halt; `skills/setup/SKILL.md:43` `\[[oatcibspd]\]-` filter; `bin/fusion-rules:505-506` `\047` octal — all in `7ef2715`, suite-covered |
| Citation form decided before mechanical correction | Done, order held | D1 filed+answered Turn 1 (gate 260806-0027, event log 05:03Z); batches `fae818b`/`9a96466` Turn 3 (07:16Z) |
| Lint 5 (reference resolution) + Lint 6 (derivable enumerations) landed and green | Done | `hooks/lib/__tests__/reference-resolution-lint.test.ts`, `derivable-enumerations-lint.test.ts` (`a1b7872`, hardened `fbd8c4d`); falsifier run vs pre-fix tree caught all remaining defects (step-14 note); green in 1611 |
| `protected-path-internals.md` reaches no coder in a consuming project | Done, measured | `bin/fusion-rules coder` from scratch consuming cwd → 0 emissions; from repo root → 1 (260806-1100); gate at `bin/fusion-rules:162-167` via `bin/fusion-plugin-cwd` |
| `_a_→_t_` ownership decided once | Done | D2 `_i_` (option b + lock sub-option i), realised `81d4154` across conventions writer sentence, shaper honesty, commit+cleanup lock-wrap, stash-and-lock rule |
| Text layer says what the code does (the corpus) | Done to its stated bound | 60/66 findings closed with footers; 6 open each carry an explicit route outside this Circle's scope |

## Discrepancies found → fixed

1. Circle record body stale (anticipated/empty fields/no Turn log) → corrected (above).
2. D2/D3 Implemented footers without commit hashes → hashes appended.
3. Open issue `260806-0022` cites the plan under its stale `_p_` marker → noted in the appended reconciliation note (record content preserved; wildcard form stated).

No new issues filed: the only unexpected findings were bookkeeping-level and are fixed in place per reconciler scope.

## Coherence

Verdict **coherent** — three-edge computation appended to `history/260805-2350-orchestrator-session.md` `## Coherence`.
