# Should the latching churn and cross-file criticals get a reset boundary, lose their total-level thresholds, or go?

---
**Domain:** code
**Status:** implemented (marker `_i_`; header corrected by the reconciler 260809-2252 — it still read `open` two commits after `c353196` landed the answer)
**Filed by:** coder
**Cross-references:** `shared/issues/260809-1101_c_churn-and-cross-file-criticals-latch-permanently-and-never-reset.md` (the defect this decision blocked; closed by the same commit — marker corrected from `_o_` by the reconciler 260809-2252); `shared/analyses/260809-1101-guard-support-layer.md` (finding 1, targets C1/C3, and the open question at its end); `circles/260801-1244-guard-rules-write/issues/260805-1859_o_das-guard-event-log-waechst-unbegrenzt-und-sein-groesster-schreiber-liefert-null-information.md` (log volume, treats the symptom); `circles/260801-1244-guard-rules-write/issues/260802-2232_c_advisory-rows-share-the-30-row-warnings-panel-and-can-bury-blocks.md` (the panel budget); `circles/260804-1205-shell-reachability-model/decisions/260807-0825_i_should-the-guard-predict-shell-writes-or-enforce-them.md` (binding on how a commit checkpoint may be detected); `README-hooks.md` (Churn Detection); `fusion-workbench/tasklist.md` task 9.

---

## Question

`totalChanges` in `churn.json` and `pingBackCount` in `cross-file.json` are monotonic for the life of a project. Once any single file crosses `totalChangesCritical` or `pingBackCritical`, `churn_critical` and `cross_file_critical` fire on every subsequent write to any file, permanently. Nothing in the tree resets either counter. The question is what to do about it, and it has to be answered before the fix, because the three available answers differ in what they delete: one adds machinery, one removes two threshold comparisons, and one removes a shipped observation surface. Removing an observation surface is not an executor's call.

It has to be answered now because task 9 in the work queue is blocked on it, and because the three tasks ahead of it (1, 7, 8) touch the same two state modules, the same emit loop in `hooks/tracker.ts`, and the same `hooks/config.json` threshold blocks. Whatever is chosen lands in that neighbourhood, and knowing which of the three it is changes what those tasks should leave standing.

## What was checked at HEAD

Everything below was read or measured at HEAD on 2026-08-09, after the three commits that touched this neighbourhood this session (`9bf7ca1` the shared state-file seam, `5f2cd56` escalation onto that seam, `b2e3d12` `.claude/rules/**` added to the protected list). Neither module's counting logic is in those diffs; the line numbers here are HEAD's and supersede the ones in the source issue.

**1. Neither counter steers a branch. Confirmed.** `analyzeChurn` is called once, at `hooks/tracker.ts:654`, and its result is consumed only by the loop at `:657-673`, where every branch is an `emitEvent` call. `analyzeCrossFile` is called at `:682` and consumed only by the loop at `:683-699`, of the same shape. `trackChurn` returns `void` (`hooks/tracker.ts:607`), and the hook's reply is written once in `main` as `respond(measured ?? undefined)` (`:754`), where `measured` comes from `measureProtectedPaths` and from nothing else. The only `raiseHalt` in the tracker is at `:558`, inside the protected-path measurement. So the option set is not changed by this check: both counters are observation-only, exactly as `README-hooks.md:23` and `:200` state.

**2. `resetCrossFile` still has no caller. Confirmed.** The only occurrences in the tree are its own definition at `hooks/lib/cross-file.ts:218-222` and the compiled output at `hooks/dist/lib/cross-file.js:152` and `hooks/dist/lib/cross-file.d.ts:88`. Not in `hooks/`, not in `bin/`, not in `skills/`, not in the tests. Its docstring still calls it a checkpoint "after a commit indicates progress". A second dead export sits beside it: `getTopChurnFiles` (`hooks/lib/churn.ts:262-267`) has no caller outside `hooks/lib/__tests__/churn.test.ts`.

**3. The log cost, re-measured.** `fusion-workbench/.guard-state/events.jsonl` now holds **15,248 lines / 7,351,194 bytes**, spanning 2026-07-06T16:49Z to 2026-08-09T18:00Z.

| Event | Count | Share |
|---|---:|---:|
| `tracker_record` | 5,079 | 33.3% |
| `guard_allow` | 3,977 | 26.1% |
| `churn_warning` | 1,549 | 10.2% |
| `churn_critical` | 1,533 | 10.1% |
| `cross_file_critical` | 1,531 | 10.0% |
| `cross_file_warning` | 1,506 | 9.9% |
| `guard_block` | 53 | 0.3% |
| `guard_halt` | 19 | 0.1% |
| `halt_cleared` | 1 | — |

The two critical types are **3,064 lines, 20.1%** (the issue recorded 2,330 of 11,142, 20.9%). All four churn and cross-file types together are **6,119 lines, 40.1%**. Of the 5,079 `tracker_record` rows, 1,596 are real tracked writes and 3,483 are the bare "Bash command observed" row.

**4. The latch is total, and it is 21 days old.** The first `cross_file_critical` was written on 2026-07-19T18:58Z. From that line to the end of the log there are 1,531 tracked writes and 1,531 `cross_file_critical` rows: a **100.0%** duty cycle. The first `churn_critical` was 2026-07-19T18:51Z; from there, 1,533 rows against 1,544 tracked writes, **99.3%**. In the last 1,000 log lines the pattern is exactly one `churn_critical`, one `churn_warning`, one `cross_file_critical` and one `cross_file_warning` per tracked write: **four latched rows per write**.

**5. The current state says the latch is entirely at the total level.** Both state files hold 535 file entries. In `churn.json`, 17 files are at or over `totalChangesCritical` (15) and 36 at or over `totalChangesWarning` (8) — while **0 files are at or over `changesPerSessionCritical` (10)** and only 4 at or over `changesPerSessionWarning` (5). Both churn events currently fired on every write therefore come from the lifetime totals alone; the session level, which does reset, is silent. In `cross-file.json`, 17 files are at or over `pingBackCritical` (5) and 33 at or over `pingBackWarning` (3), and there is no session level at all to be silent.

**6. The dashboard consequence, confirmed and sharper than filed.** `bin/monitor:156` sets `MAX_WARNINGS_RETURNED = 30`, and `churn_warning`, `churn_critical`, `cross_file_warning` and `cross_file_critical` are charged to the same class as `guard_block` and `guard_halt` (`bin/monitor:104-107`; only advisories and fail-opens get their own carve-outs in `SUBSET_BUDGETS`). `_read_warnings` returns `warnings[-30:]` in file order. At four latched rows per write, the 30-row window holds roughly **seven writes**, and a `guard_block` older than that is dropped server-side. The browser's duplicate collapsing (`bin/monitor:490-499`) runs *after* that cut, so it cannot recover an evicted block; what it does is make the panel *look* quiet, showing about four distinct latched rows while all thirty slots were spent on them. In the whole log there are 53 blocks and 19 halts against 6,119 warning-class rows.

**7. The Setup read is degraded, and not only by the latch.** `agents/orchestrator.md:113` and `skills/setup/SKILL.md:226` both read `churn.json` at Setup "to note high-thrash files". `thrashingScore` is `rapidChangePenalty + floor(totalChanges / 3)` (`hooks/lib/churn.ts:188-195`), so the ranking is lifetime-dominated too. Today's top entry is `hooks/lib/bash-mutation-guard.ts` at 147 total changes and 0 this session — **a file deleted in the v6.0.0 classifier removal**. Nothing prunes the map, so the surface the orchestrator consults about the current session ranks a file that no longer exists first, second-ranked being `rules/protected-path-discipline.md` at 65. That is the same missing boundary seen from the reader's side rather than a separate defect.

**8. The two counters differ in who reads the state.** `churn.json` has the out-of-process reader named above. `cross-file.json` has none: no agent prompt names it, no skill reads it, and `bin/monitor` reads only `events.jsonl`. Its derived events do reach the dashboard, so the signal is consumed while the file is written for nobody.

## Options

**1. Give the counters a reset boundary.** Session start, a commit, or an explicit checkpoint that finally calls `resetCrossFile`.

- Pros: keeps both observation surfaces intact and makes both levels mean "this session" again. A SessionStart hook already exists to hang it on (`hooks/hooks.json` SessionStart runs `hooks/dist/session-start.js`), so the boundary needs no new hook registration.
- Cons: for churn it is close to self-defeating. Resetting `totalChanges` turns it into a second copy of `changesThisSession`, which already resets after two hours (`hooks/lib/churn.ts:152`, `:158-161`, `:273-278`), and it removes the only long-horizon input the orchestrator's Setup read has. For cross-file it means giving `pingBackCount` a session scope it was never designed to have, plus new state and new wiring.
- Constraint on the commit variant: a commit checkpoint must be detected by **measuring** (compare `git rev-parse HEAD` across the tool call), never by reading the Bash command's text. Reading it from the text is the predict-from-command-text pattern that decision `260807-0825` closed for the guard, and re-introducing it in the tracker would reopen the same undecidable question one module over.
- Cost: the largest of the three. It keeps 443 lines of accumulator and adds to them, for a surface with one narrative reader.

**2. Drop the total-level thresholds and keep only the session-level ones.** Delete the total-level comparison at `hooks/lib/churn.ts:224-231`, the two keys from `hooks/config.json:34-35`, the `GuardSettings` fields at `hooks/lib/config.ts:194-195`, the defaults at `:295-296`, the leaf rules at `:505-506` and the two `pickChurn` lines at `:737-738`.

- Pros: the smallest change that removes the churn latch completely, and measurement 5 says it removes it *entirely* — with 0 files currently at session-critical, the level goes quiet and starts carrying information about the current session again. `totalChanges` and `thrashingScore` survive as data, so the orchestrator's Setup read keeps its input.
- Cons: the "this file has been rewritten 15 times over the project's life" alarm is gone. It does nothing for cross-file, which has no session level to fall back on: applied there it would mean dropping both thresholds, which emits nothing, which is option 3 without the deletion.
- Cost: low. What is lost is an alarm at 100% duty cycle, which carries no information today; a session-scoped or rate-based version could be added later if wanted.

**3. Remove cross-file outright.** Delete `hooks/lib/cross-file.ts` (226 lines) and `hooks/lib/__tests__/cross-file.test.ts` (197 lines), the state file, the recording and emit block at `hooks/tracker.ts:678-699`, the two event types in `bin/monitor:104-105` and `:512-513`, the `crossFile` block in `hooks/config.json:38-41` and its three counterparts in `hooks/lib/config.ts` (`:197-200`, `:299-300`, `:509-510`, `:741-742`), and the README rows.

- Pros: removes 3,037 of 15,248 log lines and the half of the latch that has no reader at all. Per the analysis, removal is a smaller change than repair.
- Cons: the rotation detector goes, and it is the only thing that would see an A,B,A,B loop in which no single file crosses its own churn threshold. Re-adding it later is a rewrite, not a revert.
- Cost: moderate and irreversible-ish. It does nothing for churn's latch.

**The three options do not partition the problem.** Options 2 and 3 each address one counter and leave the other latched; only option 1 addresses both, and it is the one whose cost is highest for churn. Stating it plainly rather than choosing between three answers that answer different questions: a complete answer names what happens to **each** counter.

## Constraints

- Both counters must stay observation-only (`README-hooks.md:23`, `:200`). No option may route either result into `block`, `recordBlock`, `raiseHalt` or the hook response.
- The orchestrator's Setup read of `churn.json` is a shipped surface (`agents/orchestrator.md:113`, `skills/setup/SKILL.md:226`). Any option that removes the data behind it changes those two lines in the same commit.
- Threshold keys are merged per leaf (`hooks/lib/config.ts:667-677`). A key removed from the plugin's `hooks/config.json` must also leave `DEFAULTS`, the `GuardSettings` type and the leaf-rule table, or a project's own `fusion-guard.json` can still declare it and the loader will keep honouring a threshold the code no longer reads.
- `hooks/config.json` is on `guard.protectedPaths`, so in a consuming project the change ships with the plugin rather than being edited locally. In this repository the measurement stands down, which is why the edit is possible here at all.
- Task 9 depends on tasks 1, 7 and 8, which touch the same two state modules, the tracker emit loop and `hooks/config.json`. The chosen option lands after them.
- Existing state is not cleared by any of the three. Both files hold 535 entries accumulated under the current rule, 17 of them latched in each, and `churn.json`'s top entry names a deleted file. Whether existing state is cleared, pruned or left standing is part of the answer, not a follow-up.

## Recommendation

**Option 2 for churn, option 3 for cross-file.** They are the two smallest changes that between them remove the whole latch, and each is chosen on what its own counter is actually used for.

Churn keeps its data and loses only the comparison that latches. The counter has a named reader (`agents/orchestrator.md:113`), the reader wants the lifetime number, and the lifetime number is not the problem — comparing it against a threshold on every write is. Removing that comparison is six small deletions across two files and leaves the session level, which resets and which measurement 5 shows to be at zero criticals right now, as the only thing that can fire. That is a level whose next `churn_critical` would mean something.

Cross-file has no reader for its state, and its signal has been saturated since its thirteenth day of life. Giving it a session boundary would be new machinery built to keep a detector that has never yet reported a fact anyone consumed. Deleting it removes a fifth of the log and 423 lines, and the failure mode it was built for is real but unobserved: if it is wanted back, it should come back as a session-scoped or windowed measure rather than as a lifetime accumulator, which is a rewrite either way.

What I would not do is option 1 for churn. Resetting `totalChanges` gives the project two session counters and no lifetime one, which is a worse state than today for the one consumer that exists.

**If the rotation detector should survive** — a defensible position, since nothing else watches for it — then the right shape is option 1 restricted to cross-file: reset at SessionStart via the hook that already runs, calling the `resetCrossFile` that has waited for a caller since it was written. Pair it with option 2 for churn regardless. Do not implement the commit-triggered variant by reading the Bash command's text.

Two things belong with whichever option wins, and neither is a separate task: prune or clear the accumulated state (535 entries, top-ranked one a deleted file), and decide whether `getTopChurnFiles` and `CROSS_FILE_DEFAULT_THRESHOLDS`, both dead, go out with it. The analysis holds `resetCrossFile` back from its dead-code sweep (target C3) precisely because this decision might want it; if option 3 wins, that hold is released.

---
Answered:
Implemented:
Deferred:
Superseded by:

---
Answered: `shared/history/260809-1725-orchestrator-session.md` (Turn 1, Rebalance-free human
gate) — user chose the recommendation, and chose it as the two-part answer the record argued
for rather than as one of the three original options. For **churn**: drop the threshold
comparison on the lifetime counter only. The lifetime number itself stays, because the
orchestrator's Setup reads it. For **cross-file**: remove it outright, on the measured ground
that nothing consumes its verdict and its reset function has never had a caller.

---
Implemented: c353196 — churn keeps `totalChanges` and lost the lifetime threshold comparison
together with `totalChangesWarning` / `totalChangesCritical` on every configuration surface, so
a project cannot declare a value no code reads. The per-session threshold is untouched and
still fires, with three new cases in `churn.test.ts` proving it rather than assuming it.
Cross-file is removed outright: the module, its test, the tracker emit block that was its only
consumer, its two event types, its configuration type and defaults, both JSON files, the
monitor's render branches, its row in the lint-checked file table, prose in three documents,
three other test files, and the workbench's own 535-entry state file. Three deliberate
backward references survive in comments. `resetCrossFile` and `getTopChurnFiles` went with it,
both callerless. 1127 tests green.

One part of the question turned out to have a second cause the decision had not seen, and it is
filed rather than absorbed: `shared/issues/260809-2023_o_the-churn-map-is-keyed-by-the-sessions-cwd-and-never-pruned-so-setups-thrashing-read-ranks-dead-paths.md`.
Of 535 churn keys, 297 resolve to no file under any reading, because the tracker normalises an
absolute path against the working directory and otherwise stores it raw. Dropping the lifetime
threshold does not touch that.
