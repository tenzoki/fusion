# Reconciliation — 260731-2324-reconciliation.md

**Domain:** code
**Scope:** final pass for orchestrator session `260731-2208-orchestrator-session.md` — the cadence skill port and the v5.7.0 release. One Turn, five tasks, converged.
**Session anchor:** `git_head_at_start` `47c4398`; walk `47c4398..HEAD` = 3 commits in this repo, plus `96d2d65` in the marketplace clone.
**Active Circle:** none. Every store resolves to `shared/` (invariant 1).

## Coverage

- **Plans reviewed:** 3 in `shared/planning/` — **1 updated** (`260722-1943` spec closed `_o_`→`_c_`, Status Draft→Complete, Reconciliation Log added).
- **Issues reviewed:** 31 in `shared/issues/`, of which 10 open at the start of this pass — **6 updated** with reconciliation evidence, **0 closed**, **0 reclassified**.
- **Decisions reviewed:** 6 in `shared/decisions/` plus 11 inside the five closed Circles — **4 updated**, of which **3 promoted `_a_`→`_i_`**.
- **Reviews:** 5 in `shared/reviews/` — **1 annotated** (this session's coderev pass).
- **New issues filed:** none. Everything found was either already on file or inside reconciler write scope.
- **Coherence:** three-edge verdict appended to `260731-2208-orchestrator-session.md`.

## Ground-truth verification — this session's claims

All PASS. Each row checked against the tree, not against a header.

| Claim | Result |
|---|---|
| `a4c37b2` — new `skills/cadence/SKILL.md` ported from flight | ✓ 213 lines added, single new file |
| `8c1c9f8` — registration across four doc surfaces | ✓ `CLAUDE.md:14`, `README.md:150`, `README-agents.md:203`, `rules/fusion-workbench-conventions.md` (+3 lines / −1) |
| `17730b8` — version bump | ✓ `.claude-plugin/plugin.json` 5.6.0→5.7.0; `install.sh:27` pin example `tags/v5.7.0` |
| `96d2d65` — marketplace entry | ✓ present in the `tenzoki-plugins` clone, HEAD of that repo |
| Tag `v5.7.0` | ✓ `git tag -l` returns it |
| Diff scope = 7 files | ✓ matches `git diff 47c4398..HEAD --stat`; nothing under `agents/` or `hooks/` touched |
| `bin/fusion-paths cadence` resolves | ✓ `WORKBENCH`, `OUT_MEMO`, `SCAN_HISTORY`, exit 0 (repo-local binary) |
| Path-literal lint + full hooks suite | ✓ 316 passed, 12 files |
| Working tree clean | ✓ only `?? fusion-workbench/` (expected — the workbench is gitignored) |
| The three coderev issues are real, stored right, marked right | ✓ all three re-verified line by line; `shared/issues/`, `_o_`, correct filename pattern |

### The three documentation statements, verified against the skill

The brief asked specifically whether `rules/fusion-workbench-conventions.md` now says true things about the skill. It does — all three:

1. **`Cadence digest` table row** — `$OUT_MEMO`, `cadence-<username>.md`, no state marker. Skill writes `$WORKBENCH/$OUT_MEMO/cadence-$USER.md` (`skills/cadence/SKILL.md:144`) and never renames it. ✓
2. **Append-vs-overwrite paragraph** — "the memo and task files are **append** logs … while the cadence digest is **overwritten** on each run". Skill `:150`: "Overwrite the file each run — it is a fresh snapshot, not an append log … `memos-$USER.md` and `tasks-$USER.md` written by `/fusion:memo` *are* append logs." ✓ The two texts agree on both halves, including which file is which.
3. **Widened no-marker sentence** — "History, review, analysis, investigation, consultation, memo, and cadence files do NOT carry state markers." Consistent with the row and with the skill. ✓

## Tracking drift found

### Fixed — within reconciler scope

**1. `260722-1943_*_spec-plane-spec-comment.md` was open with everything in it shipped.**
All five deliverables plus the template update landed in v5.6.0 (`4d95a91`, `bf5dc5e`, `d75afed`, `dd6b092`, later `47c4398`); the `--closure` placeholder comment the spec asked to reconcile now reads correctly at `bin/fusion-plane:1021-1027`; the decision record it required exists as `260722-2230_*_`. Closed `_o_`→`_c_`, Status Draft→Complete, evidence table appended. The `260723-0712-reconciliation.md` pass closed the *plan* and left the *spec* — a tracking miss with no implementation gap behind it.

**2–4. Three Plane decisions sat at `_a_` after their answers had shipped.**
`_a_` is Grounding-*Stand* — "answered, awaiting realisation". Leaving realised decisions there overstates the live decision surface, which is exactly the reading the brief asked for. Each promoted `_a_`→`_i_` with a cited `Implemented:` line:

| Decision | Realisation |
|---|---|
| `260716-1847_*_plane-rolle-source-of-truth.md` (D1 — mirror, push-only) | `982336f`; `bin/fusion-plane:2`, subcommand set `:1501-1544`, no read-back path |
| `260716-1847_*_offline-verhalten-bei-plane-ausfall.md` (D3 — keep working, never silent) | `982336f`; `defer()` `:629-632` → `outbox_append()` `:561` → `.plane-outbox.jsonl`, `EXIT_DEFERRED=10` `:108`, drain at `:920-923` |
| `260719-2141_*_plane-rolle-push-only-vs-bounded-readback-martin.md` (the bounded bridge) | `bd62bf1`; `fusion-plane seed` `:1511`, `cmd_seed` `:1544`, `skills/seed-from-plane/SKILL.md`; write-safety hardened in `a7eccbe` |

**5. `260716-1847_*_offline-verhalten-bei-plane-ausfall.md` header said `**Status:** open`** while the filename marker was `_a_` and the body carried an `Answered:` line — a three-way contradiction inside one file. Header corrected to `implemented` alongside the promotion. The other two promoted files had correct `answered` headers and were updated to `implemented`.

**6. Four dangling decision cross-references** created or exposed by the renames, all repointed: two inside `260719-2141_*_plane-rolle-push-only…` (`_a_`→`_i_` for D1 and D3 in its header, and a `_o_` reference to the concurrency sibling that had been `_a_` since 260719), one in its `Answered:` body line, one in `260719-2141_*_concurrency…`'s header. Same class of drift the `260723-0712-reconciliation.md` pass fixed on `260722-2230_*_thin-mirror-vs-comment-borne-full-spec.md`; it recurs whenever a marker advances.

### Flagged, not fixed

**7. `260719-2141_*_concurrency-worktree-slots-vs-single-active-circle.md` — left `_a_` on purpose; a judgement call for the user.**
Its answer was Option 3, *"fusion does not support concurrency"*. A non-feature has no commit to cite, and `_i_` requires a hash or `path:line`. The surfaces that express the answer (`bin/fusion-session-mark`, `/fusion:setup` Step 0d's running/stale warning, the advisory paragraph in `CLAUDE.md`) all predate the decision. Two defensible outcomes — promote citing those surfaces, or leave `_a_` permanently — and `_i_` is terminal, so the reconciler did not choose. Reasoning recorded in the file. Nothing downstream is blocked.

**8. `agentstate.yaml` is stale** — `turn: 1`, `tasks_done: 0`, `commits: 0`, all five work-queue statuses `queued`, `current_task` still T1 — against five completed tasks and three commits. Orchestrator's to clear on clean exit. This is the second consecutive session with the same finding (`260723-0712-reconciliation.md` item 4).

**9. Session history header is stale** — `**Directive:** (none yet — Setup only; awaiting user task)`, `**Status:** Setup complete, idle`. Expected: the orchestrator writes its final report after this pass. Recorded so the state is not mistaken for drift. The reconciler is append-only in that file and appended only `## Coherence`.

**10. The installed plugin is three versions behind the repo.** `$FUSION_PLUGIN_ROOT=/Users/kai/.fusion` is at 5.5.1, so `"$FUSION_PLUGIN_ROOT/bin/fusion-paths" cadence` exits **2** (`unknown name 'cadence'`) while the repo-local `./bin/fusion-paths cadence` exits 0. `/fusion:cadence` is released but not yet runnable in this session's own environment. Release-process step 6 (pull the marketplace clone, reinstall, `/reload-plugins`) is the user's action. Not a defect and not filed.

**11. Four session-history filenames carry an underscore-delimited token where the convention allows none** — `260731-2235_coder_cadence-skill-registration.md_coder_cadence-skill-registration.md`, `260722-2211_coder_plane-spec-comment-step1.md_coder_…`, `260722-2217_coder_plane-spec-comment-step2.md_coder_…`, `260722-2225_coder_plane-spec-comment-step3.md_coder_…`. The pattern for history is `YYMMDD-HHMM-<topic>.md` with no state marker, and `_coder_` sits in the marker position. Harmless in practice (no marker glob matches `_coder_`) and pre-existing across two sessions. Noted rather than filed: fixing it means renaming written history, which buys nothing. Raised here so the convention question is on the record if a third session repeats it.

### Not drift — checked and correct

- **The three new coderev issues are defects, not misfiled decisions.** Each resolves to "go fix it" and is verifiable from a diff: a shell-robustness fix, a one-line metric disambiguation, a frontmatter trim. M2 carries a recommendation between two units, but the contradiction is a defect whichever unit wins. No reclassification.
- **Placement is correct.** No Circle was active, so `shared/` is where the Origin Rule and invariant 1 both send them.
- **Dangling `_o_`/`_a_` references in `shared/history/` and `shared/analyses/`** (four files) were left untouched deliberately. Those are point-in-time records — "Decision (open): …" was true when written. Rule 6: preserve content. Only live tracking files get their cross-references repointed.

## Open-decision surface

**0 open (`_o_`) decisions — confirmed, and true across every store, not just the shared one.** Scanned all six records in `shared/decisions/` and all eleven inside the five closed Circles.

| Layer | Count | Records |
|---|---|---|
| Grounding-Stand — `_o_` open | **0** | — |
| Grounding-Stand — `_a_` answered, awaiting realisation | **2** | `260719-2141_*_concurrency-worktree-slots-vs-single-active-circle.md` (item 7 above); `260716-1847_*_zuschnitt-umbau-und-plane-ein-oder-zwei-circles.md` |
| Grounding-Historie — `_i_` implemented | **15** | 5 shared (3 promoted this pass) + 10 in Circles |
| `_d_` / `_s_` | **0** | — |

Down from 5 `_a_` at the start of this pass. The second remaining `_a_` — "one Circle or two for the umbau and Plane work" — sits inside a closed Circle and is arguably realised (both Circles exist and both closed `_c_`). It is outside this pass's resolved scan (`$SCAN_DECISIONS` collapses to `shared/` with no Circle active), so it is reported rather than changed.

### Should either of this session's two gate choices have been a decision record?

**Neither. Stated plainly, as asked.**

**The digest's location — shared memo store rather than the workbench root.** This reads like a fork and is not one: the answer was already determined by written convention before the question was put. `$OUT_MEMO` resolves unconditionally to the shared memo store — memos are one of the three kinds that cannot originate in a Circle — and the root-anchored surfaces are an explicitly exhaustive list in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`, closed on purpose against exactly this kind of addition. Putting a per-user digest at the root would have required amending that list, which is the decision that was never on the table. A decision record whose Options section has one admissible entry documents nothing. What the choice *did* need was a convention entry saying where cadence digests live and how they are written — and that is precisely what `8c1c9f8` added, in the file that owns the layout. The right artifact was produced.

**Running the full two-repo release rather than a repo-local one.** Not an architectural choice at all — an invocation of a procedure `CLAUDE.md` `## Release process` already prescribes in six numbered steps, including the marketplace bump and the tag. The user chose to follow the documented process. Recording "we did the thing the manual says" as a decision record would fill the decision store with process compliance and dilute the signal the store exists to carry. The session history is the correct home, and it has it.

Both are properly captured where they are.

## Coherence verdict

**coherent** — all three edges OK; Rebalance recommendation: **none**. Full text appended to `260731-2208-orchestrator-session.md` `## Coherence`.

The drift this pass found and fixed was pre-existing tracking staleness in the Plane work, not divergence between this session's artifact and its grounding. This session's own artifact matched its Directive exactly and left nothing stale behind it.
