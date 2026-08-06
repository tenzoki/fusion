# Incremental review — Turn 2 of the Textschicht Circle, commits `c45fb44..81d4154`

**Reviewer:** coderev
**Scope:** exactly the non-workbench files in `git diff d3222a5..HEAD` — repo-detection gate (`bin/fusion-plugin-cwd`, `bin/fusion-rules`, `bin/fusion-paths`, `.gitignore`), MONITOR_BIND (`bin/monitor`, `monitor-warnings-panel.test.ts`), shaper mode-3 rewrite (`agents/shaper.md`), the `.active-circle` writer-set paragraph (`rules/fusion-workbench-conventions.md`), the lock retrofit (`rules/workbench-stash-and-lock.md`, `skills/commit/SKILL.md`, `skills/cleanup/SKILL.md`), the zsh iteration fix (`skills/cadence/SKILL.md`, `skills/circle-stash/SKILL.md`), and the three test files + golden fixture.
**Plan context:** `planning/260805-2353_p_plan-textschicht-gegen-code.md`
**Verdict:** the three commits are sound in their core mechanics — the repo gate is real and tested in both directions, the writer-set paragraph is complete against a tree-wide grep, MONITOR_BIND is wired correctly, the zsh fix matches the archive precedent verbatim. Four issues filed: one Medium (the `/fusion:commit` lock retrofit does not actually hold the stage+commit pair on its primary path) and three Low.

---

## 1. Repo-detection gate (`c45fb44`) — correct in bound, one criterion divergence filed

- **Gate is real, both directions:** the new golden test (`rules-emission-golden.test.ts:629-666`) asserts protected-path-internals emission from the plugin repo AND its absence from the neutral cwd; the work-tree preference test pins that with `FUSION_PLUGIN_ROOT` pointed at an empty dir, every emitted rule path comes from `$PWD/rules`. All 109 tests across the three changed helper suites pass (run this session).
- **False negative (subdirectory cwd):** `fusion-plugin-cwd` probes cwd only — measured: repo root → 0, `hooks/` → 1. This exactly matches `hooks/lib/self-detect.ts` (also cwd-only), so it is a shared, pre-existing limitation, not a divergence. Agents are insulated: every Setup `cd`s to the `fusion-workbench-root` result, which here is the repo root.
- **False positive (consuming project named "fusion"):** requires a `.claude-plugin/plugin.json` at cwd whose name matches — i.e. another plugin repo publishing as "fusion". Same exposure the TS guard stand-down has carried since v2.x; not new in this diff.
- **Criterion divergence (new, filed Low, `260806-0854`):** the grep matches `"name": "fusion"` at any JSON depth; measured, a manifest with a nested `{"author": {"name": "fusion"}, "name": "other"}` flips the bash half while the TS half correctly refuses. The header's "keep them consistent" contract is broken exactly where the existing test (`fusion-paths.test.ts:607`, top-level `not-fusion` only) cannot see it.
- **`fusion-paths` override bound holds:** grepped — `PLUGIN_ROOT` is consumed only at `bin/fusion-paths:177-178` (`AGENT_PROMPT`/`SKILL_PROMPT`), so the comment's claim "the prompt files are the ONLY plugin-root-relative resources" is true; nothing downstream reads the installed copy inconsistently. In `fusion-rules`, the in-repo branch redirects `PLUGIN_RULES_DIR` to `$PWD/rules` (absolute — survives cwd resets), skips the now-identical `PROJECT_RULES_DIR` pass (no double emission), and leaves `.claude/rules` and the workbench stilwerk paths untouched.
- **Missing-sibling degradation:** `if "$SCRIPT_DIR/fusion-plugin-cwd"` on a copy lacking the helper yields command-not-found → condition false → consuming-project behavior, no `set -e` abort (if-condition). Only stderr noise, and only in mixed-version installs that the release process does not produce. The `context-manifest.test.ts` stripped-plugin fixture now stages the sibling, correctly.
- **Golden/baseline arithmetic:** `RULE_BASELINE` still carries the pre-growth sizes for `fusion-workbench-conventions.md` (34,671 vs 35,364 actual) and `workbench-stash-and-lock.md` (9,250 vs 9,683). Verified against the test's own contract: baselines are "what this emission weighed at the last cleanup" and growth is budgeted via `DRIFT_CEILING`, not re-baselined per edit — by design (commit `3163281`), not a defect. Role-comment arithmetic is declared non-authoritative in the file itself.

## 2. Lock retrofit (`81d4154`) — tags and deadlock clean, pair atomicity not achieved on the main path

- **No deadlock path:** the lock is held only for the duration of one Bash call (`with` releases on any exit via trap, `bin/fusion-commit-lock` header); neither skill dispatches an agent while holding it; cleanup's reconciler dispatch (Step 3) happens between locked commits, never inside one. Nested acquisition cannot occur: skills run in the main session, and the orchestrator's own Phase 2 Step 3b `with` is a single Bash call that completes before any skill could be invoked.
- **Tags correct:** `with commit --` / `with cleanup --` match the rule's extended tag conventions (`rules/workbench-stash-and-lock.md:132`).
- **Shell-correct:** the retrofit lines add no iteration constructs; `bash -c '…'` pairs are shell-neutral.
- **Filed Medium (`260806-0852`):** `/fusion:commit` stages at Step 2, waits through an interactive confirmation (Steps 3–5), then locks only the bare `git commit` at Step 6 (`skills/commit/SKILL.md:20,68`). The held-pair form (`:71-74`) applies only when "nothing was staged yet" — the rare case. During the unlocked window, a parallel locked committer absorbs this session's staged files: the exact "commit absorption" race the lock's header names. The rule's new bullet ("wraps every stage+commit pair", `workbench-stash-and-lock.md:128`) overstates the skill as shipped.
- **Filed Low (`260806-0853`):** cleanup Step 7 (`skills/cleanup/SKILL.md:140`) restates Step 2's discipline as a four-item enumeration that omits the lock and still says "HEREDOC" where Step 2 moved to scratch-file + `-F`.

## 3. Shaper mode-3 rewrite — consistent tree-wide

- The new claim "`/fusion:next`'s `allowed-tools` permits only playmaker" verified: `skills/next/SKILL.md:5` lists `Agent(fusion:playmaker)` as the only Agent entry. Playmaker's own prompt forbids dispatching agents and writing the pointer (`agents/playmaker.md:64,154`). The retained `--write-activation` back-compat alias is consistent at all three mention sites (shaper:72, playmaker:201, next:20). The scope exception (`agents/shaper.md:28`) already restricted mode 3 to Directive/Grounding sections, so the "never renames, never writes the pointer" line contradicts nothing in the body.

## 4. `.active-circle` writer-set paragraph — complete and true

Tree-wide grep over `agents/`, `skills/`, `bin/`, `hooks/lib`: the six enumerated writers are exactly the six that exist — orchestrator (write `agents/orchestrator.md:175`, delete `:529` at Phase 4), `/fusion:next` (Step 6.3, gated by the confirm both entry forms pass through, so "user-confirmed interactive-activation branch" covers the explicit form too), `/fusion:circle-stash` (`:262` `rm -f`), `/fusion:circle-pop` (restore from manifest), `/fusion:migrate` (re-point, executor block verified: only rewrites when the target directory exists), `/fusion:cleanup` (`:81`, conditional clear on terminal marker). No hook writes it (`hooks/lib` hits are tests reading it); `bin/fusion-paths`/`bin/fusion-rules` read only; `/fusion:archive` explicitly excludes it (`skills/archive/SKILL.md:90`); setup never touches it. Playmaker's quotation of the paragraph (`agents/playmaker.md:158`) still matches the rewritten text verbatim in the quoted span.

## 5. MONITOR_BIND (`b90d1c8`) — wiring correct, one dead tuple entry filed

- argv wiring correct: `BIND = sys.argv[6]` (`bin/monitor:74`) ↔ 7th positional `"${MONITOR_BIND:-0.0.0.0}"` at the launcher line. Default preserved for every production spawn (setup's copied monitor gets no env var — the LAN dashboard of `8586ba3` stands). Usage text documents both advertised values. LAN-line gating correct for `127.0.0.1`/`localhost`; test spawn pins `127.0.0.1` with an accurate macOS-TCC rationale.
- **Filed Low (`260806-0855`):** `LOOPBACK_BINDS` (`bin/monitor:1159`) lists `"::1"`, but the AF_INET server crashes at bind (measured: `gaierror`) before the tuple is ever consulted — a dead entry implying support that does not exist.

## 6. zsh iteration fix (`b90d1c8` half) — closes issue `260806-0709` as specified

`skills/cadence/SKILL.md:87-91` and `skills/circle-stash/SKILL.md:228-231` now use the archive-precedent construct `for d in $(printf '%s\n' "$SCAN_*")` with the same explanatory comment; `skills/cleanup/SKILL.md:67-70` likewise. Mechanism was verified empirically in the 260806-01 review session (both shells, two-path values); the issue is marked `_c_` with a matching resolution note.

## Totals

Critical 0 / High 0 / Medium 1 / Low 3 — all four filed under this Circle's `issues/`. Not re-reported: `260806-0022` (setup-probe vs migrate scope), the 260805 Gesamtreview corpus, and the two `_c_` issues this diff resolves (`260806-0709`, `260806-0820`).
