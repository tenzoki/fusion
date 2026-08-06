# Reconciliation — 260806-1152 (intensive, workbench-wide)

**Reconciler, domain `code`. Status:** Complete.
**Ground truth:** HEAD `cde5319` (pushed). Suite re-run by this pass: **1611 tests / 30 files, all green** (`npx vitest run`, 159 s). No active Circle, `.active-circle` absent, `agentstate.yaml` absent (normal post-session). Dispatch: user-requested deep pass beyond the two closure reconciliations (`circles/260801-1244-guard-rules-write/history/260805-2334-reconciliation.md`, `circles/260805-2005-textschicht-gegen-code-nachziehen/history/260806-1057-reconciliation.md`); both read first, checks below go beyond them. Per dispatch: nothing committed, nothing appended to any orchestrator session history (the Coherence verdict is recorded here instead).

## Counts

- **Circle records: 11 reviewed, 8 updated.** 3 body-Status corrections, 1 duplicate heading removed, ~20 marker-decayed citations converted, 1 closure-note annotation appended.
- **Plans/specs: 20 reviewed, 4 updated** (3 retroactively closed `_o_`→`_c_` with reconciliation logs, 1 body-Status Draft→Complete). The shared spec verified and left `_o_` deliberately.
- **Issues: 20 recently-closed sampled and verified against HEAD (all 20 hold); 51 open reviewed; 6 closed by this pass with evidence footers; 2 annotated and left open; 43 verified genuinely open.** 3 new opens appeared mid-pass from a concurrent session (not touched, see below).
- **Decisions: 40 reviewed, 21 updated** (1 walked `_a_`→`_i_`, ~45 marker-decayed citations in 20 records converted to resolving form), **1 new decision filed** (`shared/decisions/260806-1152_o_stash-manifest-dirname-and-pointer-content-duplicate.md`, extracted from a question embedded in issue 260717-0032 since July). Zero `_o_` decisions before this pass; all 7 `Implemented:` commit hashes verified to exist (`6d4a88d`, `f261a6a`, `f82ac02`, `dd6b092`, `98c9363`, `2eaee31`, `a1b7872`).

## Scope item 1 — Circle records (11)

Marker vs body-Status disagreed on **4 of 11**; 3 fixed, 1 preserved:

- `260718-1924-v5x-overhaul`: `active` under `_c_` since 2026-07-19, plus a stale duplicate `## Closure note` heading reading "(offen ...)". Both fixed.
- `260801-1244-guard-rules-write`: `active` under `_c_`; the `_t_`→`_c_` closure renamed the record and skipped the field. Fixed.
- `260805-2005-textschicht-gegen-code-nachziehen`: `active` under `_c_`; the reconciler had corrected the field 8 minutes before closure, the closure skipped it again. Fixed.
- `260801-1244-rule-provenance-header`: `anticipated` + `(none yet)` under `_c_`, **deliberately preserved** per its own closure note as the live specimen of `shared/issues/260802-0920_*`. Left as is; only its spec-pointer citation was repaired.

Closure notes present on all 9 terminal records. Turn logs plausible on 8 of 9; `260719-1536-plane-mirror-integration` still carries the "(none yet — anticipated ...)" placeholder under `_c_`, already tracked by `shared/issues/260801-1020_o_plane-mirror-circle-closed-with-empty-turn-log.md` (reported, not reconstructed here). All `Active spec/plan` / `Active session history` paths now resolve; before this pass ~20 citations in records pointed at expired markers (converted to wildcard form per D1 `.../260806-0015_i_zitierform-fuer-workbench-records.md`).

## Scope item 2 — Issues

**Sample of recently-closed records (target ≥15, done 20), every claim verified against HEAD:** agent-setup silent-skip (`bin/fusion-rules:242-249`), awk `\047` (`:505-506`), archive `shared_of` command-substitution split + non-silent halt (`skills/archive/SKILL.md:48-56`), internals scoping gate (`bin/fusion-rules:164` via `fusion-plugin-cwd`), `MONITOR_BIND` (`bin/monitor:25-26,1153`), IPv6-loopback wording (`:1161`), commit-skill stage+commit pair under lock (`skills/commit/SKILL.md:76-88`), cleanup step-7 lock (`skills/cleanup/SKILL.md:91,140`), seed-from-plane listing (`CLAUDE.md:14`), stash-manifest ten-fields (`rules/workbench-stash-and-lock.md:32,54,71`), stash-lock dead citations removed, README pin `v5.9.2` + existing tag, conventions `.active-circle` writer enumeration (`rules/fusion-workbench-conventions.md:75`), shaper portfolio-activation dispatcher honesty (`agents/shaper.md:3,47`), README-agents always-on list (`:155`), the two lint hardenings (conditional-emission parsing; `e.g.` same-clause bound), holderless-lock aging + noclobber holder write (`bin/fusion-commit-lock:16-25`), emission golden current (suite green), CLAUDE.md dead workbench refs gone, CLAUDE.md four version surfaces (`:94`). **0 false closures found.**

**Closed by this pass (fix verified at HEAD, footer + rename):**
1. `circles/260801-1244-guard-rules-write/issues/260805-1150_*_readme-nennt-als-pin-beispiel...` (both halves done: README pin + four-surfaces count).
2. `.../260805-1548_*_der-plane-testfixture...` (test harness rewrites `project_id`, `fusion-plane.test.ts:78-98`, `1babb48`).
3. `shared/issues/260717-0032_*_stash-manifest-field-count...` (fixed via the 1840 batch; embedded schema question extracted to a new decision record).
4. `shared/issues/260801-1215_*_conventions-file-cites-three-records...` (all three citations gone/resolving after partition + batches; repro grep clean at HEAD).
5. `shared/issues/260802-1740_*_a-citation-path-carrying-a-state-marker...` (its asked-for decision was taken as D1 and implemented: wildcard form + reference-resolution lint `a1b7872`).
6. `circles/260801-1244-rule-provenance-header/issues/260802-1252_*_binding-decision-formalised...` (both instances now resolve in wildcard form).

**Remaining opens, all verified genuinely open at HEAD:**
- **6 routed corpus findings** (3× `260805-1830_*`, 2× `260805-1839_*`, `260805-1859_*` event-log): each re-checked (no Rust in `agents/coder.md`; no Cargo in the domain heuristic; `install.sh:81` copies a LICENSE the repo does not have; `hooks/lib/self-detect.ts` still exact-cwd so the tracker noise stands, sibling of `260804-2100_*`; no event-log rotation anywhere). Routes named in each record are real (reachability Circle, user decision, same-cut-as-2100).
- **9 shell-classifier records** (`260804-0839/-0842/-1027/-1221/-1222/-1332/-1350/-1351/-2100`): routed via the C5b plan's deferral table; the reachability Circle's record cites `0839` and the 17-false-alarm balance directly; `2100` states its route in its own tail. Still open by design.
- **1 setup/migrate scope residual** `circles/260805-2005-.../issues/260806-0022_*`: verified at the code-identical tree by the 260806-1057 pass (`cde5319` is workbench-only on top of it); unowned, portfolio warns.
- **1 unowned deferral** `260803-1352_*` (advisory clamp): re-verified live at `hooks/guard.ts:565,593` (both advisory emissions bypass the `forEvent()` clamp defined at `:235,246`); annotated as unowned since its pricing Circle closed.
- **1 framework observation** `260805-1548_*_beim-filen...` and **1 user-side measurement** `260805-2323_*` (unite emission): open, correctly so.
- **22 pre-existing shared opens** (was 25; 3 closed above): spot-verified where a recent fix could have landed incidentally: `.gitignore:23,53` still carry `bin/fu`; `settings.json` still has no `Agent(...)` entries; `hooks/config.json` still lacks `.claude/rules`; `clear-halt` still exits 0 with a benign message when no workbench exists; `tasklist.md` still holds the fully-closed 260716 queue (with a pre-v4 bracket citation); cadence skill untouched since its three findings. `260802-0920` re-surveyed and annotated (three new closure-direction instances found and corrected by this pass, source still unfixed: `skills/next/SKILL.md` Step 6 and orchestrator Phase 4 never touch `**Status:**`).
- **1 guard-bash-inspection coverage record** (`260801-1904_*` deletable behaviours) and **3 rule-provenance opens minus the one closed** (`1255`, `1256`, both left open by recorded user decision) and **1 plane-mirror go-live** (`260719-2304_*`): open, plausibly so; no targeted fix in the log.
- **3 brand-new opens appeared mid-pass** (`shared/issues/260806-1153_o_*` ×2, `260806-1154_o_*`), filed by a concurrent session while this pass ran. Not verified, not touched; the single-orchestrator advisory applies.

## Scope item 3 — Decisions

40 records: 36 `_i_`/1 `_d_`/4 `_a_` before the pass, **zero `_o_`**. Every `_i_` carries a real `Answered:`+`Implemented:` footer (one legitimate direct `_o_`→`_i_`). All 7 commit-hash citations exist in git. Walked `circles/260716-1847-workbench-umbau/decisions/260716-1847_a_zuschnitt...` to `_i_` (its Option 1, "two Circles", is realised: both Circle directories exist and closed coherent). The ~45 marker-decayed citations inside decision records were converted to wildcard form mechanically (script kept in the pass's scratchpad; every conversion checked that the target exists under exactly one current name). The remaining 3 `_a_` records (worktree-slots, where-does-normative-consistency-live, wie-soll-ein-circle-verschwinden) are consistent with the current state: none conflicts, none is implemented yet.

## Scope item 4 — Plans and specs

All 16 `_c_` plans verified Complete against their evidence chains; one contradiction found and fixed: `shared/planning/260717-1918_c_skill-glob-nomatch-zsh-hardening.md` said Draft with no step markers under a `_c_` name; execution verified (driving issue's Resolved footer + `find`/process-substitution forms present at HEAD + the glob-nomatch lint in the green suite), Status set Complete with a log. Three `_o_` planning files in closed Circles were retroactively closed with reconciliation logs: `260718-0437` spec and `260718-1001` master plan (v5x, all five packages attested by the closure and the 260719-1455 reconciliation) and `260716-1847` spec plane-integration+struktur (all four decisions long since decided, both successor Circles closed; the plane half realised in the deliberately reshaped bounded-bridge form). **The shared spec `260801-1122_o_spec-normative-consolidation.md` stays `_o_` and its rationale still holds:** C5a/C5b/C5c, C8 and C9 are done and verified; C1–C3, C6, C7 (curator capabilities) and C4 await the curator Circle, which is `_a_` and needs a shaper re-shape first (recorded in the Textschicht record's Dependencies and the portfolio warning). Its Status line ("Final", forks resolved) matches an open spec awaiting its remaining executor.

## Scope item 5 — Root surfaces

- `portfolio.md`: current (playmaker run 260806-1103; 2 anticipated / 0 active / 9 closed matches disk exactly; zero dangling citations).
- `tasklist.md`: stale by three weeks (issue `260801-2038_*` covers it; left for the next taskplanner run).
- `.active-circle`: absent, correct.
- No orphaned files at the workbench root (`plane.config.yaml` and `monitor` are expected residents).
- **Uncommitted git state, reported and left alone per "commit nothing":** deletions of `agentstate.yaml` and `.commit-lock/holder` (normal session-teardown), modified `.fusion-setup`, `.session-marker`, `monitor`, `orchestrator-live.md`, `orchestrator-events.jsonl`, `.guard-state/events.jsonl`, this pass's tracking-file edits, and one **untracked orchestrator session history** `circles/260801-1244-guard-rules-write/history/260805-2035-orchestrator-session.md` that was never committed.

## Scope item 6 — Cross-checks the closure passes skipped

- **Dangling cross-references:** a systematic sweep over all Circle records, all decision stores and `portfolio.md` found ~65 marker-decayed citations (the two closure passes had converted shipped text and `hooks/lib` only). All converted to resolving form; the sweep now returns empty. Historical surfaces (reviews, closed-plan prose, guard-state logs, the outbox) keep their period citations deliberately.
- **guard-rules-write closure-note claims:** the "79 open" count was right, its breakdown enumerated only 76 (omitted `260804-2100_*` and `260805-1150_*`, corpus counted one low). Annotated on the record with the current per-category state (18 open in that Circle after this pass).
- **Duplicates:** two cross-store duplicate pairs found and resolved consistently (`260717-0032` ↔ `260805-1840` stash-manifest; `260805-1150` ↔ `260805-1840` README pin): in both, the corpus copy was closed by Textschicht and the older copy is now closed with a cross-citing footer. `260804-2100` ↔ `260805-1839` tracker-cwd are siblings, not duplicates (cross-cited, one cut fixes both). No contradictory issue pairs found.

## Coherence (recorded here per dispatch; not appended to any orchestrator session history)

**Verdict: coherent.**

- **Artifact↔Grounding:** 20 closed-issue claims verified true at HEAD, 0 false closures; suite 1611/30 green; the drift found was tracking-file bookkeeping (4 record-Status lags, 4 stale plan files, ~65 decayed citations), all corrected in place; open reviewer-issue surface after the pass: 18 (guard-rules-write, all routed/priced) + 22 pre-existing shared + 3 unverified concurrent + 7 across other Circles.
- **Artifact↔Directive:** no session Directive is active (agentstate absent, pointer absent); measured against the dispatch directive (workbench-wide reconciliation, commit nothing), the pass produced tracking-file corrections only and zero commits.
- **Grounding↔Directive:** zero open decisions before the pass; one new `_o_` filed (stash-manifest schema question, low stakes); the three `_a_` records are consistent with the portfolio's next steps (reachability first, curator after re-shape). No conflicting decision found.

**Rebalance recommendation: none.**

## Follow-ups surfaced (no new defect issues needed beyond the one decision record)

1. The two unowned residuals (`260803-1352_*`, `260806-0022_*`) want a home in the next Circle or a follow-up batch; both are annotated and the portfolio warns about the second.
2. The record-lag defect (`260802-0920_*`) keeps reproducing at every closure; candidate fix 2 (drop the `**Status:**` field) has accumulating evidence, annotated on the issue.
3. The untracked 260805-2035 orchestrator session file should ride along with the next workbench commit.
4. The three fresh concurrent-session issues (260806-1153/-1154) need a normal triage in their filing session.
