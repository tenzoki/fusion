# Code review: Turn 1 of Circle `260824-1853-close-every-open-defect`

**Sender:** coderev
**Date:** 2026-08-24
**Reviewed-range:** `571f945..d5c34cd`
**Not-opened:** none
**Scope:** every file outside `fusion-workbench/` the 13 commits changed; the four `stilwerk/*.yaml` files are the ontorev's and were not judged here. `hooks/dist/` was rebuilt (`npm run build`) and compared: no diff against the committed files.

## Summary

The range closes about 130 defect records across seven code-bearing commits, and the large majority of the `Resolved:` notes I read against their diffs hold. One shipped helper regressed in the process: the new empty-pointer message in `bin/fusion-paths` is a bash command substitution and prints a syntax error. The reconciler's new verdict vocabulary is disjoint on the verdict side and not on the recommendation side, and the one new recommendation never reaches the user through the orchestrator. The rest is test coverage the new and changed helpers lack, and documentation that step 8 rewrote a second before steps 6, 7 and 10 moved what it cited.

## Totals

Critical 0 / High 1 / Medium 4 / Low 4. Nine records filed under `$OUT_ISSUE`, all with the person half absent because the installed plugin carries no `bin/fusion-identity`.

## Findings by theme

### A fix that regressed the thing it fixed

- **High.** `bin/fusion-paths:262`: backticks inside a double-quoted string; bash runs `<YYMMDD-HHMM>-<slug>` as a command, prints two syntax-error lines and drops the placeholder. Reproduced. The test at `hooks/lib/__tests__/fusion-paths.test.ts:459` pins exit and stdout only. Record: `260824-2056_*_the-new-empty-pointer-message-in-fusion-paths-runs-its-placeholder-as-a-command-substitution.md`.

### The verdict vocabulary and its readers

The four verdicts (`agents/reconciler.md:113-118`) are disjoint and complete, and every reader I found reads them: `agents/orchestrator.md:754` (Phase 3 step 3), `:756` (defensive enum), `:975` (gate-rules row), `:1299` (`bounded_closure_proposed` event). Step 3c-bis keeps its own per-Turn enum (`ok | review-needed | skipped-*`, `:694`, `:1295`) and is unaffected. `bin/monitor` parses no verdict.

- **Medium.** The recommendation mapping (`agents/reconciler.md:175-176`) has two rows that both match a no-Directive session with a clean Artifact↔Grounding edge, and `state Directive` is a recommendation no gate option matches; the orchestrator fires no gate on `coherent` and lists the same four options when it does. Record: `260824-2056_*_the-reconcilers-state-directive-recommendation-overlaps-the-coherent-row-and-the-orchestrator-never-surfaces-it.md`.

### The new helper against its header

`bin/fusion-session-domain` prints what its header says on the paths I ran: `domain=code source=agentstate` here, exit 3 with empty stdout outside a workbench, exit 2 on an argument.

- **Low.** Three header-versus-behaviour gaps: the "scoped to `session:`" claim is not what `^  domain:` does; an uncapturable value garbles the stderr reason; `source=helper-missing`, printed by all three skill call sites, is defined in no header. Record: `260824-2056_*_the-session-domain-helpers-header-claims-a-scope-its-grep-does-not-have-and-its-skill-callers-print-a-source-value-it-never-defines.md`.
- **Medium.** No test drives the helper; its three siblings each have one. Record: `260824-2056_*_the-session-domain-helper-ships-with-no-test-while-every-sibling-helper-added-since-v10-has-one.md`.

### Changed helpers

- **Medium.** `bin/fusion-identity:150-155` no-git branch: exit 1, verified only by a one-off probe; `fusion-identity.test.ts` covers the unset-identity exit 1 alone, and `rules/fusion-workbench-conventions.md:496` plus the `CLAUDE.md` row still define exit 1 narrowly while claiming to be the single statement. Record: `260824-2056_*_fusion-identitys-new-no-git-branch-is-untested-and-two-surfaces-still-define-exit-1-as-the-unset-identity-case-alone.md`.
- `bin/monitor`: the two new warning classes, the guarded `localStorage` read and `markPollFailed()` are consistent with the surrounding code (`POLL_INTERVAL` at `:485`, `.status-dot.error` at `:324`, the `Updated:` slot restored at `:1009` on the next good poll). No finding.
- `bin/fusion-turn-budget` / `hooks/turn-budget.ts`: the header claim "every diagnostic" matches the loop at `hooks/turn-budget.ts:96`. No finding.
- `bin/fusion-rules`: the comment now cites `hooks/lib/__tests__/rules-voice-profile.test.ts`, which exists. No finding.

### Growth-bound cuts

Every deleted non-comment line in `hooks/lib/__tests__/` (commit `e31a73d`) was replaced rather than dropped: the three-key loop became four keys, the `domains` assertion gained the two retired names, the hand-written `SKILLS` list became a derived one, the `turn-budget-lint` assertion that the orchestrator uses `AskUserQuestion` went with the ban it contradicted. The README-hooks claim that `CLAUDE.md` now "fires" is stated, not asserted; I ran `findCascadeStatements` over `CLAUDE.md` and it fires at line 16 on the agent-roster line, so the claim is true. No finding.

### `hooks/dist/`

`npm run build` then `git diff --stat -- hooks/dist/`: empty. The four changed `dist/` files are the compilation of their sources.

### `[ -x ]`-guarded call sites in the skill bodies

`skills/archive/SKILL.md:39-44` (now an `if`, with a stderr line on the miss), `skills/setup/SKILL.md:237` and `:252`, `skills/next/SKILL.md:80`, `skills/direct/SKILL.md:53`, `skills/cleanup/SKILL.md:105`: each guards, each has a defined miss branch. The Step 0e replace block's provenance rewrite (`skills/setup/SKILL.md:240-245`) stamps the destination after a successful `cp` and names a failed one; correct. One consistency point, not filed: `archive` writes `${FUSION_PLUGIN_ROOT:-}` and the three domain sites write `$FUSION_PLUGIN_ROOT` bare; both work under the skill's shell.

### Documentation that moved a second too early

- **Low.** `CLAUDE.md` names three retired keys in two rows; `config.ts` carries four since `e31a73d`. Record: `260824-2056_*_claude-md-names-three-retired-top-level-keys-in-two-rows-and-config-ts-now-carries-four.md`.
- **Low.** `README-agents.md:53,60-61` cite `skills/next/SKILL.md:147-153`; the block is at `:139-146` after `8140cf3`. Record: `260824-2056_*_readme-agents-still-cites-skills-next-at-line-147-153-after-step-10-moved-the-block-to-139-146.md`.

### The orchestrator prompt

- **Low.** The resume paragraph (`:103`) gives two re-entry points for a Continue and states one of three cases. Record: `260824-2056_*_the-orchestrators-resume-paragraph-names-two-re-entry-points-for-a-continue-and-does-not-say-which-case-takes-which.md`.
- **Low.** The new index comparison and `git restore --staged` (`:621`) run before the commit lock is entered. Record: `260824-2056_*_the-new-index-comparison-unstages-a-siblings-paths-outside-the-commit-lock-it-was-added-to-protect.md`.

## `Resolved:` notes read against their diffs

Sampled every note in `b0fd2f0`, `1ea8fed`, `8140cf3`, `d5c34cd` and the code-bearing notes in `e31a73d` and `f3f7895`. Two claims do not hold as written and are the High and the first Medium above (row 72's pointer-message half, and the no-Directive routing under `260817-1836`/`260823-1446`). The rest match the diff they cite.

## Cross-cutting observations

1. **Line-number citations into shipped files drifted inside one Turn** (`README-agents.md` → `skills/next/SKILL.md`), because the docs step and the skills step ran in parallel against each other's in-flight edits. `shared/issues/260818-1637_o_*` already names the class; this Turn is one more instance.
2. **A helper's header is treated as its test** in two places (`fusion-session-domain`, the `fusion-identity` no-git branch): both were "probed" once in a history file and pinned by nothing. The hook-test line budget (10 lines of head-room after step 7) is the stated reason, and the growth-bound rule says the way out is a cut, not a skipped test.
3. **Case splits stated in prose without their third branch**: the reconciler mapping, the resume paragraph. Both are `rules/critical-stance.md` §4 findings and both were introduced by fixes that closed a record about the previous incompleteness.

## Recommended sequencing

1. `bin/fusion-paths` backticks (High): one-line fix plus one assertion; before anything else in this Circle ships.
2. The `state Directive` routing (Medium): needs the reconciler and orchestrator edited together.
3. The two missing tests (Medium): budgeted against a cut in the same step.
4. The four Low records: documentation, same Turn or the closing one.

---
Reconciled: 260824-2159-reconciliation.md (reconciler) — all nine findings closed in `011cc92` (records `260824-2056_c_*`); no `_o_` record remains in this Circle's `issues/` at `5ad6185`.
