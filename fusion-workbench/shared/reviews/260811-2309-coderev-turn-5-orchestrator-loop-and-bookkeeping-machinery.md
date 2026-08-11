# coderev — Turn 5: the orchestrator's own loop and its own bookkeeping

**Sender:** coderev
**Reviewed-range:** `e3da397..a6b4928`
**Not-opened:** none
**Date:** 260811-2309
**Scope as dispatched:** the whole of Turn 5, four commits, with six named checks

---

## Recommendation on shipping

**This range is safe to ship. Nothing in it should block a version bump.**

Every finding below is in prose inside `agents/orchestrator.md`. The executable changes — the drift anchor, the record-counts split, the regenerated golden — were each checked against their own claims and each held: the anchor is stronger in the direction claimed and weaker in none, the split is disjoint and complete, the golden moved by exactly the five bytes the conventions edit added and by nothing else. The suite is 1349/1349 and `hooks/dist` rebuilds byte-identical to the committed build.

The two Medium findings worth fixing in the next Turn, in this order, are `260811-2304` (the Revise Artifact path never reaches the gate that is said to bound it) and `260811-2305_o_continue-without-check-ins-…` (the third gate answer falsifies two nearby bounding claims). Both are the same class of defect as the High finding this range repaired: the mechanism is honest, and a sentence one paragraph away is not. Neither is a runaway — on both paths the user is still asked something at every Turn boundary and still has a terminating choice — which is why neither blocks a release.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 3 |
| Low | 5 |

All eight are filed under `shared/issues/` as `_o_` records, stamps `260811-2304` to `260811-2307`.

---

## The six checks, answered

### 1. The unresolved-budget gate terminates or asks — with two defects at its edges

**Stop here** does produce the *Max Turns reached* exit: `agents/orchestrator.md:628` names it by reference, emits `circuit_breaker`, and proceeds to Phase 4, which is what the table's *Normal exit, report remaining work* recovery and the shared "when a circuit breaker trips" sentence at `:606` prescribe. Nothing missing there.

**Continue** and **Continue without check-ins** each leave a problem.

- The gate is placed "after the circuit-breaker table has been evaluated and **before Step 3e**" (`:625`). Step 3e is the convergence check (`:635`). So on the Turn that empties the queue the user is asked "run another Turn?", answers Continue, and Step 3e exits to Phase 4 anyway. One spurious gate per session, and one answer collected and discarded. Filed: `260811-2305_o_the-unresolved-budget-check-in-fires-before-the-convergence-test-…`. Medium.
- **Continue without check-ins** is recorded only in the session history (`:629`), not in `agentstate.yaml`. `e61e24a` — in this same range — defines a resume as *the same session* and enumerates the fields that survive it (`:100`). This one does not. A resumed session re-asks. The direction is safe; the two commits disagreeing about where session-scoped state lives is the finding. Filed: `260811-2306_o_the-check-in-opt-out-is-session-scoped-…`. Low.

The sentence-level check the predecessor's finding asked for was applied to the new sentences, and two of them fail it. Both are in the Rebalance-bounding section and both were touched by `500f51f` itself:

- `:974` — "every Turn boundary in such a session runs the **Unresolved-budget check-in** (Step 3d)". It does not. `:450` lists three ways a Turn ends and only one is Step 3d; `:591` says a Coherence-gate Rebalance "exits without emitting `turn_end`" and Revise Artifact re-enters Phase 2 directly. Step 3c-bis sits *before* Step 3d, so the whole Revise Artifact cycle skips the gate. Filed: `260811-2304`. Medium.
- `:972` — "No option is allowed to loop unboundedly", and `:974` again — "that is what bounds the retries". Both are false the moment the user answers **Continue without check-ins**. The check-in bullet at `:629` states that residual correctly; the Rebalance section was not qualified with it. Filed: `260811-2305_o_continue-without-check-ins-…`. Medium.

### 2. The gate's placement in the Human Gate Rules table — correct, and it is the only by-position reference

The new row went in at `:943`, above the three Coherence rows at `:944`–`:946`. The reference at `:961` — "any of the three bottom rows of the gate-rules table above" — still resolves to the same three rows, and it names all three explicitly in its own parenthesis, so it is anchored twice. I grepped `agents/`, `rules/` and `skills/` for further by-position references into that table (`three bottom rows`, `bottom row`, `rows of the`, `gate-rules table`): there are none. The executor's reasoning here was correct and is recorded in its history file.

One observation, **not** filed because it predates the range: the three Coherence rows carry two cells in a three-column table (verified at `e3da397:908-910`). The new row is correctly three-celled and now sits directly above them, which makes the gap more visible than it was.

### 3. `session_start` gains `history_file` — every consumer tolerates both shapes

Checked each consumer of `orchestrator-events.jsonl` that reads code rather than prose:

| Consumer | Reads | Tolerates the new field |
|---|---|---|
| `bin/monitor` | `ev.event`, `ev.ts`, `ev.task`, `ev.agent`, `ev.detail` (`:663`–`:800`, `:1045`) | yes — `JSON.parse`, unknown keys ignored; the orphan-task boundary keys on `ev.event === 'session_start'` only |
| `hooks/lib/state-drift.ts` | `'"event":"session_start"'` as a substring, then `includes(historyRel)` | yes — the emitted spelling has no space and matches |
| `hooks/lib/staging-drift.ts`, `hooks/lib/churn.ts`, `hooks/lib/events.ts`, `hooks/tracker.ts`, `bin/fusion-staging-drift` | grepped: none reads `session_start` at all | n/a |
| Phase 4 "sequence-diagram generator" | not a program — the orchestrator writes a Mermaid `sequenceDiagram` into the history file from the log (`:218`, and the worked examples under `shared/history/`) | yes, it is LLM-read |

**The pre-field fallback is unambiguous-only, and I tested the claim against this repository's own log.** It carries 1256 lines, and after the last `session_end` at line 1152 there are two `session_start` lines (1153 and 1213, the second being this session's 17:15 resume), neither carrying `history_file`. `agentstate.yaml` names `shared/history/260811-0752-orchestrator-session.md`. Running `bin/fusion-state-drift` here:

```
progress.turn  surface=5  record=?  UNCHECKED (2 session_start lines since the last
session_end and none names shared/history/260811-0752-orchestrator-session.md, so which
of them began this session is not decidable)
```

Case 2 requires `candidates.length === 1` and refuses to guess at two. The claim holds exactly as stated.

Two Low findings came out of this area, both about the identity rather than the fallback: the history filename is minute-resolution and nothing prevents two sessions sharing one (`260811-2307_o_the-history-filename-is-minute-resolution-…`), and Setup step 6 still tells a resumed session to create a history file that step 1 forbids (`260811-2306_o_setup-step-6-…`).

### 4. The drift row is stronger, and it is stronger in the direction claimed

Both halves verified, by reading `sessionAnchor` and by the cases the commit added.

**Catches a post-resume freeze it used to miss.** Old anchor: the last `session_start`, which a resume writes. A session that ran Turns 1–4, resumed, then ran 5–9 with `progress.turn` frozen at 5 emits five `turn_start` events after the resume — so the old count read 5 against a claimed 5 and said *clean*. New anchor: the first `session_start` naming the session's history file, so the count is 9 against 5 and says DRIFT. `hooks/lib/__tests__/state-drift.test.ts` builds exactly that shape ("still reports a surface that froze after the resume", nine against five) and asserts the message.

**No longer reports the resume itself.** Immediately after a resume with no new `turn_start`, the old count was 0 against a claimed 4 — a permanent false DRIFT on every guarded tool call. The new count is 4 against 4. The test for it asserts `trackerSays` is null and the CLI prints `record=4`.

**No shape got weaker.** I walked the four log shapes against `sessionAnchor` by hand — clean restart, crash-then-fresh-session, crash-then-resume, and truncated tail — and each lands where the old code landed or better. The Restart-after-crash case is the one the old positional rule would have got wrong and the identity gets right; the test suite covers it ("counts only this session's Turns when a crashed session left no session_end").

One Low finding: on the tracker path an `unchecked` row is reported as nothing at all, because `driftSentence` is built from `report.drifted` alone (`hooks/lib/state-drift.ts:661`), and the CLI header prints `drift=0 verdict=clean` with no `unchecked=` count. The module docstring at `:64` says no undecidable row is dropped; on that one caller it is. The population landing there is larger after this change than before. Filed: `260811-2307_o_an-unchecked-drift-row-is-silent-…`.

### 5. The regenerated golden is the five bytes and nothing else

`hooks/lib/__tests__/fixtures/rules-emission.golden` changed in 32 places: `fusion-workbench-conventions.md 46119 → 46124` in each of 16 agent sections, and each section's `total` by the same +5. Confirmed independently:

- `git show e3da397:rules/fusion-workbench-conventions.md | wc -c` → 46119; `wc -c` on the current file → 46124.
- All 16 sections are present before and after: analyst, bugfixer, coder, coderev, conceptrev, consultant, editor, investigator, ontocoder, ontorev, orchestrator, planner, playmaker, reconciler, shaper, taskplanner.
- No path added or removed in any section, no line reordered, no other file's byte count moved. `agent-setup.md`, `decision-record-examples.md`, `user-facing-output.md`, `critical-stance.md`, `protected-path-discipline.md`, `design-diagrams.md`, `circle-records.md` and `workbench-stash-and-lock.md` are all unchanged, and each role keeps exactly the set it had.
- `rules/fusion-workbench-conventions.md` is the only file under `rules/` the range touches, so no other emission could have moved.
- The test recomputes rather than comparing the fixture to itself, and it is green.

Nothing hiding here.

### 6. The four-case split replaces the two pinning assertions, and it is MECE

The two inputs are `WHY_A` (the anchor: absent, or present but resolving to no workbench tree) and `WHY_T` (`session.started` absent). The block at `agents/orchestrator.md:733`–`:746` writes all four:

| `WHY_A` | `WHY_T` | Header | Counts taken |
|---|---|---|---|
| empty | empty | `records anchor=… start=…` | both halves |
| set | empty | `records=partial why=$WHY_A` | `filed` only |
| empty | set | `records=partial why=no-session-start` | `now_` only |
| set | set | `records=unmeasured why=$WHY_A,no-session-start` | none |

Disjoint and complete over the two booleans, with no fifth branch and no fall-through. The `why=$WHY_A$WHY_T` concatenation in the partial branch is safe because the both-set case has already been taken above it. The per-half guards inside the `find` loop match: `[ -n "$WHY_T" ] ||` gates the `filed` line, `[ -n "$WHY_A" ] ||` gates the `now_` line.

**Both replacements assert the new behaviour.** Neither accommodates it:

- The `:322` case ("reports a missing start stamp as unmeasured") became "reports both causes when neither input is present", and now drives the *no `agentstate.yaml` at all* shape and asserts `why=no-anchor-in-agentstate,no-session-start` plus `start=none` plus zero counts. Its comment states what the old assertion had been right about — that a missing start stamp took both halves down under the anchor's name, so the anchor's name was the whole story of that branch.
- "describes the no-anchor branch as the disjunction it is" became "…as reading the anchor field alone", and now asserts both that the old disjunction sentence is *gone* and that `no-session-start` is documented. The comment records that the disjunction was an accurate description of the combined gate.

**The new positive case is derived, not recorded.** `EXPECTED.nowOnly` is `{ now_c issue: 1, now_o issue: 2, now_a decision: 1 }` — exactly `EXPECTED.twoStores` minus its `filed issue: 2`. I checked that against the fixture by hand: the fixture renames one `_o_`→`_c_` issue and one `_o_`→`_a_` decision after the anchor and files one new `_o_` issue into each of the two stores, which is `filed 2 / now_c 1 / now_a 1 / now_o 2`. Removing `session.started` must remove the two `filed` counts and nothing else, and that is what the expectation says. This is the assertion doing work rather than transcribing output.

---

## Cross-cutting observations

**One defect class accounts for all three Medium findings, and it is the class the range set out to fix.** `260811-2142` was "a sentence claims a bound the mechanism lacks". Two of the three Mediums here are the same sentence-versus-mechanism gap, in the section immediately below the one that was repaired, and both were touched by the repairing commit. The pattern is not carelessness — it is that the *fix* was written where the false claim was, and the neighbouring paragraph that repeats the claim in different words was read as already covered. `hooks/lib/__tests__/turn-budget-lint.test.ts`'s `CLAIM` regex (`/\bloop is (?:still |…)?bounded\b/i`) is precisely this narrow: it catches the phrasing that was there and not the two phrasings one section down (`bounded post-action mechanics`, `bounds the retries`). Widening that one regex is the cheapest thing in this review.

**A second, smaller pattern: state added in one commit outside the state model another commit wrote in the same range.** `500f51f` puts the check-in opt-out in the session history; `e61e24a` writes the definitive list of what a session carries across a resume into `agentstate.yaml`. Neither is wrong on its own. Together they leave two precedents for where the next session-scoped fact goes.

**What the range got right, and it is the substance rather than the polish.** Both `500f51f` and `e61e24a` faced a question that could not be answered from the inputs at hand — what the interval should be when the mechanism that would supply it has failed, and which `session_start` began this session in a log carrying no session identity — and both changed the mechanism instead of picking the approximation with the rarer counter-example. The interval is asked of the user rather than invented; the identity is put into the log rather than inferred from line positions. Both records name the rejected alternatives and say what is wrong with each, and the `session.started`-versus-`date -u` two-hour measurement is a real measurement rather than an assertion. That is `rules/critical-stance.md` §4 applied correctly, twice, and it is the reason the executable half of this range came out clean under six checks.

---

## Recommended sequencing

**Release blocker:** none.

**Next Turn, in order:**

1. `260811-2304` — the Revise Artifact path and the gate it is said to meet. Fixing it by moving the check-in to the Turn-*start* obligation also closes `260811-2305_o_the-unresolved-budget-check-in-fires-before-the-convergence-test-…`, so consider them together rather than separately.
2. `260811-2305_o_continue-without-check-ins-…` — qualify the two Rebalance claims, and widen the lint's `CLAIM` scan to reach that section while you are there.

**Cleanup, any time:** `260811-2306` ×3 (the `gate_response` vocabulary, Setup step 6's unqualified creation, the opt-out's persistence) and `260811-2307` ×2 (the minute-resolution identity, the silent `unchecked` row).

---

## Verification performed

- `cd hooks && npm test` — 52 files, 1349 tests, exit 0.
- `npm run build` then a full `diff -r` against the committed `hooks/dist` — identical, so the compiled artifact in `e61e24a` is the build of the source beside it.
- `./bin/fusion-state-drift` against this repository — output quoted under check 3.
- `wc -c` on both revisions of `rules/fusion-workbench-conventions.md` — 46119 / 46124.
- `"$FUSION_PLUGIN_ROOT/bin/fusion-rules" coderev` and `bin/fusion-paths coderev` at Setup — exit 0 both, no active Circle, so every record in this pass went to `shared/`.

---

## Reconciliation 260811-2330 — disposition of the eight findings

All eight are open, and none has been worked: the Phase 2 loop exited on the Max-Turns circuit
breaker in the same commit that filed them (`31746d1`), so no Turn followed this review. Confirmed
on disk at HEAD `31746d1` — `shared/issues/260811-2304`, `260811-2305` (×2), `260811-2306` (×3),
`260811-2307` (×2), each still `_o_`.

Two things this pass confirmed rather than took on trust:

- **The release recommendation holds.** `cd hooks && npm test` at HEAD: 52 files, 1349 tests,
  exit 0. A first run of the same command aborted one worker (`Error: Worker exited unexpectedly`,
  51/52 files) and the re-run was clean — the load-sensitive class already recorded as
  `260810-1135`, `260811-1409` and `260810-0918`, not a new failure.
- **The findings are the largest single contribution to this session's open-record count.** Filing
  them took the workbench from 66 open defect records to 74. That is the honest arithmetic and it
  is not an argument against the review; it is recorded in this session's Coherence verdict.

Reconciled by `reconciler`, `shared/history/260811-2330-reconciliation.md`.
