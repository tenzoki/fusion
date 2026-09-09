# Analysis: adversarial review of the "cut fusion to a working minimum" specification

**Date:** 2026-09-09 16:28
**Type:** Document Study (adversarial specification review)
**Status:** Complete
**Requested by:** user
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>

## Question

Is `260909-1615_*_spec-cut-fusion-to-a-working-minimum.md` a sound basis for planning the cut it describes? Specifically: does it behave as a specification rather than an implementation sketch, does it survive its own evidence, does the byte table it offers as the zero-sum bound's baseline reproduce, is that bound decidable by the carrier it names, does the roster cut survive the test it argues from, and what does the cut break that the spec does not notice?

## Scope

The spec read in full (381 lines). Its two ancestor analyses read in full. Re-derivation against the working tree at `bb341360`, 2026-09-09 13:06:14 +0200, branch `main`, 5 ahead of `origin/main`, with `fusion-workbench/orchestrator-events.jsonl` modified and twelve untracked workbench records including the spec itself. Every present-tense claim below is dated by that tree.

Read directly: all fifteen `agents/*.md`, all nineteen `rules/*.md`, `bin/fusion-rules`, `bin/fusion-paths`, `bin/fusion-commit-lock`, `bin/fusion-session-domain`, `bin/fusion-cadence-anchor`, `bin/monitor`, `bin/fusion-staging-drift`, `hooks/guard.ts`, `hooks/lib/orchestrator-events.ts`, `hooks/lib/state-file.ts`, `hooks/lib/staging-drift.ts`, `hooks/lib/review-coverage.ts`, `hooks/events-query.ts`, `hooks/lib/__tests__/helpers/growth-bound.ts`, `skills/setup/SKILL.md`, `skills/cleanup/SKILL.md`, `skills/cadence/SKILL.md`, `CLAUDE.md`.

**Method.** Every byte figure was measured, not quoted. The roster analysis in section 5 was run as an independent pass that was not shown my conclusions; its rule-set arithmetic was then re-derived by me from component file sizes and reconstructs each emitted set exactly.

**Nothing was edited.** The spec is untouched.

## Findings

### 1. Does it behave as a specification

Mostly yes, and better than most. The nine capabilities are stated as properties of the finished system. The Directive is one sentence and is testable. The Evidence basis section is an unusual and correct thing to put in a spec: it lets a reviewer check the document against its sources rather than against its confidence.

Six acceptance criteria are not checkable by someone who was not in the conversation.

| Id | Criterion | Why it is not checkable |
|---|---|---|
| C1-1 | "A session can be started, can dispatch an executor, can commit, and can end, with no file named `agentstate.yaml`" | Checkable, but see finding 6.1: satisfying it silences the event log, so the criterion is checkable and self-defeating rather than unchecked |
| C1-6 | "A gate that fired in a majority of sessions returns to the user before removal" | "Majority of sessions" is undefined over which population. The event logs carry sessions with and without identifiers, across three checkouts and a union-merged log. C10 of the verification found the session count itself moves from 43 to about 53 under re-derivation. The denominator is the disputed quantity and the criterion does not fix it |
| C2-1 | "reaches its first dispatch having performed at most the two prerequisites plus one marker read" | Contradicted by C1, which requires a `session_start` row carrying three values, and by Setup Steps 2, 3 and 5, which C2 does not mention. See finding 6.2 |
| C5-2 | "Each of the five surviving record kinds carries a stated condition for when it is filed, and the conditions do not overlap" | The five kinds are not enumerated anywhere in the spec. C5's prose names "a defect found, a choice made, a plan that outlives one dispatch, a review's findings, an analysis", which is five, but the mapping to store names is left implicit and the backlog item of C6 is a sixth writable kind not counted |
| C5-5 | "Records per source-touching commit ... is below the current rate" | Measures compliance with the change, not its value. Removing an obligation to file records lowers the count of records filed by construction. The criterion cannot fail if the capability is implemented at all |
| C7-2 | "Each surviving prompt states its write surface, and the six surfaces do not overlap" | False at the moment of writing and not exempted. `$OUT_ISSUE` is a declared write target of five of the six proposed survivors: `agents/orchestrator.md:101`, `agents/coder.md:24`, `agents/ontocoder.md:45`, `agents/planner.md:23`, `agents/analyst.md:35`. `$OUT_DECISION` likewise. Unless issue and decision filing are declared a shared surface, no roster can pass |
| C8-2 | "Applied retroactively to the window from 2026-08-27 to 2026-09-09, the bound goes red" | Cannot discriminate. A zero-head-room bound goes red over any window containing one additive commit. See finding 4.4 |

### 2. Does it survive its own evidence

**Verified: the five corrected figures do not reappear.** `grep` over the spec for "eightfold", "108 KiB", "24 KiB", "12 percentage", "12.3" and "ordered by size" returns exactly one line, the Evidence basis sentence that forbids them. This is correct handling and worth saying plainly.

**Verified: no argument rests on the refused causal claim.** I read every capability's justification. None asserts, implies or requires that cutting conditioning bytes lowers the error rate. C8's justification is entirely that the existing instrument failed to catch a measured regrowth.

**But obeying that prohibition left C8 with no stated benefit at all.** The spec never says why a per-dispatch byte total matters. It says the old instrument measured the wrong quantity, and it stops. The only benefits either ancestor document ever attributed to smaller conditioning text are the refused error-rate claim and a token cost the verification marked unchecked (U4, "on the order of 19 million tokens ... was not checked"). So C8 is a mechanism with a measured cost and an unstated purpose, in a document whose own Constraints say "Nothing that has a demonstrated reader is removed on the grounds that it is large". The converse discipline is not applied to the thing being added.

**One figure is presented as established that its own source marked unverifiable.** Evidence basis: "Session ceremony is 13 to 17 percent of attributed wall clock". That is finding 7 of the original analysis (`260909-1047-...:259`). The verification's U1 states that "Every figure in findings 1, 3, 4, 5, 7, 14, 15 and 16 depends on all three" unstated classifiers and is "reproducible in direction and not in value". F10 confirmed the wall-clock model in aggregate; it did not confirm finding 7's ceremony split. The figure belongs under a caveat, not under "Established, and this spec rests on it".

**One range blends a governed source with a superseded one.** Evidence basis: "Dedicated bookkeeping agents are 3 to 10 percent of dispatch time (finding 8)". Verification F13 re-derived 10.0 / 2.3 / 7.6 against the report's 9.8 / 3.1 / 7.6. The spec's lower bound is the report's, its upper bound is the verification's. Under the spec's own "the verification governs" rule the range is 2.3 to 10.0. Small in magnitude, but it is exactly the failure mode the Evidence basis section exists to prevent.

**One count is an overreach of its source.** The risks section: "the corpus is 950 files in this repository alone". M5 measured 950 history records *in the 2026-08-01 to 2026-09-09 window*, not the corpus. C9 of the verification puts fusion's lifetime stamped-record corpus at 2607 files. C4's own "Decisions made" bullet is correct ("950 history records in this repository alone" in the window sense is at least ambiguous rather than wrong); the risks sentence is not.

**One measured claim is simply false.** C8, Decisions made: "`CLAUDE.md` is the median 47 percent of what a dispatch reads and the largest single item in fourteen of the fifteen paths". Measured at `bb341360` across all fifteen paths: the median share is **47.00 percent**, exact. `CLAUDE.md` is the largest single item in **ten** of fifteen paths, not fourteen. It is not the largest on `orchestrator`, `curator`, `editor`, `playmaker` or `shaper`, on each of which the emitted rule set or the prompt is larger. The half of the claim that carries the user's reasoning is right; the half stated with a cardinality is wrong, which is `critical-stance.md` §5 arriving exactly where that rule predicts.

### 3. Re-derivation of the byte table

**Every row reproduces to the byte.** Measured at `bb341360` as `wc -c agents/<a>.md`, `bin/fusion-rules <a> | xargs wc -c`, and `wc -c CLAUDE.md` = 93 432.

| Path | prompt | emitted rules | `CLAUDE.md` | total | spec's total | delta |
|---|---|---|---|---|---|---|
| orchestrator | 155 302 | 131 331 | 93 432 | 380 065 | 380 065 | 0 |
| curator | 34 554 | 99 080 | 93 432 | 227 066 | 227 066 | 0 |
| reconciler | 22 825 | 90 127 | 93 432 | 206 384 | 206 384 | 0 |
| editor | 13 635 | 95 672 | 93 432 | 202 739 | 202 739 | 0 |
| planner | 19 725 | 89 271 | 93 432 | 202 428 | 202 428 | 0 |
| analyst | 21 038 | 84 319 | 93 432 | 198 789 | 198 789 | 0 |
| ontocoder | 13 262 | 85 175 | 93 432 | 191 869 | 191 869 | 0 |
| coder | 9 649 | 85 175 | 93 432 | 188 256 | 188 256 | 0 |

188 256 / 1024 = 183.84 KiB, so the claim that the coder row reproduces the verification's F4 figure for one coder dispatch is **verified**. The seven rows the spec omits also reproduce: playmaker 262 061 (255.92 KiB), shaper 250 768, taskplanner 188 800, consultant 197 679, coderev 193 568 (189.03 KiB), ontorev 192 521, bugfixer 190 116. F4's `reconciler` 201.5, `curator` 221.7, `review` 189.0 and `portfolio` 255.9 all land.

**The arithmetic is right and the table's framing is wrong in three ways.**

**3.1 The stated omission rule is not the rule applied.** The caption says the seven omitted rows are omitted "because those paths do not survive C7". True of all seven. Also true of `curator` and `reconciler`, which are shown. C7 removes nine roles: playmaker, reconciler, bugfixer, shaper, taskplanner, coderev, ontorev, consultant, curator. Six survive. The table shows eight. The partition it declares is neither the one it performed nor a disjoint one.

**3.2 Three cardinalities disagree inside one capability.** The prose introducing the table says "for the fifteen paths that exist now"; the table has eight rows; the Evidence basis says "the six per-dispatch-path totals in C8 were measured for this spec and reproduce the verification's F4 to the byte"; C8's baseline paragraph says "the six totals measured at the moment the cut lands". Of the table's eight rows, three have an F4 counterpart, not six. "Six" is the count of surviving roles, borrowed into a sentence about a table of eight measured under fifteen.

**3.3 The baseline is measured in the wrong place for its own carrier.** Two of the three components are the project's, and one of those varies by 40 percent between projects. Verification M6 measured `bin/fusion-rules coder` at 85 175 bytes in fusion and krk and **126 656** in unite-co-creator, which ships four project-side rule files. A baseline armed on fusion's eight paths says nothing about a consuming project's totals, and C8's acceptance criterion asks the event reader to name "the movement since the baseline" in a consuming project. No per-project arming is specified.

### 4. The zero-sum bound as a mechanism

**4.1 Who is refused, and does that party have a way forward.** Inside this repository, a fusion developer who grows `CLAUDE.md` is refused by a red test. The only way forward the spec offers is the reused three-event re-baselining rule (`hooks/lib/__tests__/helpers/growth-bound.ts:26-86`), whose three events are: after a cleanup, at an arming, at a merge of two lines each inside the bound. None of the three covers "the project legitimately needs a larger `CLAUDE.md`". The rule was written for a surface fusion owns and is being applied to a quantity two thirds of which fusion does not own. The spec says the rule is "reused rather than rewritten"; reading it shows it does not fit the new quantity without a fourth event or an explicit statement that no fourth event exists and the offset must come from elsewhere.

Outside this repository nobody is refused, by explicit decision. So the honest reading is: the bound refuses only fusion's own developers, and the party the user named as needing to grow its documentation is exactly the party the mechanism cannot serve without a rewrite of the rule it claims to reuse.

**4.2 The offset is per path, and the spec never says what that costs.** `CLAUDE.md` sits on every path. An addition of N bytes to it fails all six paths at once. Offsetting it requires either N bytes cut from `CLAUDE.md` itself, or N bytes cut from an always-on rule, or six separate per-prompt cuts of N bytes each. The spec's rule sentence ("An addition of N bytes to any component requires a removal of at least N bytes from the same path's total") is correct and does not tell the reader that a shared component's addition therefore costs six offsets or one shared one. Its own acceptance criterion C8-3 states the asymmetry for conditionally emitted rules and not for `CLAUDE.md`.

**4.3 "In the same change" is not what the carrier measures.** A test run measures a tree, not a commit. Neither carrier can see "the same change". The clause is unenforceable and unnecessary: the tree-versus-baseline comparison already produces the intended behaviour.

**4.4 The criterion the spec calls decisive cannot fail.** C8-2 and the first Stops-when bullet both rest on "replayed over 2026-08-27 to 2026-09-09, the bound goes red". Replayed by me: the coder path total was **154 440** at `265a86fb` (9 649 + 65 944 + 78 847) and is **188 256** now, a rise of **33 816 bytes, 21.9 percent**. So it goes red. But a bound with zero head-room goes red over that window for any component set that grew by one byte, including the always-on core the existing instrument already measures. The test distinguishes nothing. The discriminating replay would be: does the *existing* instrument stay green over the window while the *new* one goes red, and does the new one stay green over a window in which nothing grew. Only the first half is stated, and it is stated as the whole test.

Two useful facts fall out of that replay and are not in the spec. Of the 33 816 bytes, `CLAUDE.md` contributed **14 585, or 43 percent**, and the emitted rules 19 231. That is the strongest available evidence for the user's instruction to include `CLAUDE.md`, and it is a figure the spec could have had.

**4.5 Testing the "this one is different" argument.** The spec argues the hook's four removed deciding mechanisms answered undecidable questions about a command's text, while this one "counts the bytes of three named files. It is decidable, it is exact". Two of the three are named files. The third is not a file: it is the output of a program.

`bin/fusion-rules <agent>` emits a set that depends on the agent name, on an optional topic argument, and on the presence of a project-side `rules/context-manifest.yaml`. Topic derivation reads `.active-circle` and the Circle record (`bin/fusion-rules:436-445`) — which C6 deletes. So after C6 there is no automatic topic source, and the hook can only run the helper with no topic. What the agent then reads may differ from what the hook counted if any caller passes a topic explicitly.

Second, the hook fires before the dispatch runs, so what it counts is what the agent *would* read if it performs Setup. `CLAUDE.md`'s own symptom table records the case where the orchestrator skipped Setup under task pressure. The counted figure is an upper bound on what was read.

Third, the quantity is narrower than the capability's title. "Everything a dispatch loads" does not include the user's memory file, nested `CLAUDE.md` files below the root, skill bodies, or the dispatch prompt itself. My own dispatch in this session received `CLAUDE.md` **and** a separate `MEMORY.md` as system reminders. A project can grow the unbounded ones freely.

**The honest verdict on the argument:** this is not the undecidable class fusion removed. It is a *prediction of a program's output under arguments the hook does not have*, plus two exactly-named files. That is much closer to decidable than a shell-command classifier, and the spec's conclusion (report, never refuse) is right. But the argument as written overstates the case by calling all three components named files, and the one component that is not is the one that carries the growth the capability exists to catch.

**4.6 Cost on the dispatch path.** `hooks/guard.ts:162-165` currently allows a dispatch and emits the row with no config load and no subprocess. C8 adds a `bin/fusion-rules` subprocess plus file stats to that path, synchronously, on every dispatch. In a consuming project the helper walks up for the workbench root and scans three rule directories. The spec's "Open for Planner" names this ("How the hook computes the three byte counts cheaply enough"), which is correct scoping. It is worth saying that this is the first thing fusion would have put back on a hot path after spending a year taking things off it.

### 5. The roster cut

**5.1 The test as applied.** The test is: a role exists when it owns a distinct write surface, or when it must be structurally forbidden from writing at all. Applied by me to all fifteen prompts, with each write surface read out of the prompt rather than out of the spec's table, it supports removing **three** of the nine: `taskplanner`, one of `coderev`/`ontorev`, and `shaper`'s plan-store half. It does not support removing `reconciler`, `playmaker`, `curator`, `consultant` or `bugfixer`, each of which owns a surface no surviving role owns.

| Role | Surface no survivor owns | Cite |
|---|---|---|
| reconciler | in-place edits to *existing* plan, issue and review files; the `## Coherence` append onto another agent's history | `agents/reconciler.md:48-52` |
| playmaker | full overwrite of `portfolio.md`; the four gated backlog operations and the autonomous ranking rename | `agents/playmaker.md:10,:56` |
| curator | gated writes to `CLAUDE.md` and the project's `./rules/` and `.claude/rules/`, deletion included | `agents/curator.md:327-329` |
| consultant | `$OUT_CONSULT`, plus an open-ended "modify other files inside `fusion-workbench/` when explicitly asked" | `agents/consultant.md:38,:42` |
| bugfixer | the union of coder's and ontocoder's surfaces plus prompts, under a human gate for ontology | `agents/bugfixer.md:20,:22-25` |

**5.2 The sharpest defect in the spec, and it is internal to C7.** The table row reads `analyst | findings in the workbench; writes nothing in the project | coderev, ontorev, consultant, curator`. The decision bullet reads "The curator's subject matter survives as an analyst dispatch behind the on-call `CLAUDE.md` command of C3, and its user gate survives with it." Curator's whole point is that it writes `CLAUDE.md` and the project's rule files after a gate. C3's acceptance criterion keeps that gate and calls it "the one gate that must survive". A gate on a change no agent may make is not a gate. Either the analyst row is false of the merged role, or the `CLAUDE.md` command of C3 cannot be performed. Two capabilities and one table row are mutually unsatisfiable.

**5.3 The same shape once more.** "the remainder becoming the on-call reconciliation pass of C3 performed by the analyst". Reconciliation is in-place editing of existing plan, issue and review files (`agents/reconciler.md:48-50`). `agents/analyst.md:27` forbids editing "any existing document outside your own write targets". The absorbing role's defining prohibition is the absorbed role's defining capability, again.

**5.4 Where the test is applied inconsistently.** `coderev` and `ontorev` have *identical* write surfaces, distinguished only by the sender segment in the review filename (`agents/coderev.md:69`, `agents/ontorev.md:62`). The test compels merging them into each other. `coder` and `ontocoder` are separated by the file's *role*, not its path, which is why `package.json` needs a written carve-out. The spec keeps that pair on grounds it names itself as non-test grounds ("a merged executor would carry the union of both conditioning bodies on every dispatch"). So the test is treated as decisive where it removes and as one input among several where it keeps. The keep may still be right; the argument for it is not the argument the capability claims to be running.

**5.5 The second limb of the test admits exactly one instance, and the spec merges it away.** After C4 removes `$OUT_HISTORY`, `taskplanner` writes zero files (`agents/taskplanner.md:47` names `$OUT_HISTORY` as "the only file you write"). It is the one clean case of "must be structurally forbidden from writing at all", and C7 folds it into `planner`, which writes plans. No surviving role is justified by limb two. A clause of a case split with no instances is a clause doing no work, which §4 of `critical-stance.md` asks a spec to notice about its own splits.

**5.6 Playmaker's backlog maintenance lands nowhere.** C6 promotes the backlog store to the primary work store and states only the rule that no agent originates an item. The four confirm-gated operations and the ranking rename (`agents/playmaker.md:56`, `rules/backlog-entries.md`) are assigned to no surviving role in C6 or C7. C7's own criterion says nothing is dropped silently.

**5.7 The roster cut costs per-dispatch bytes on six of the eight paths it touches.** The spec says the cut "buys routing coherence and maintenance rather than bytes". Measured, it is worse than neutral. `bin/fusion-rules` keys its conditional emissions on the agent name, so a merged role inherits the union of every conditional its inputs satisfied.

Component sizes at `bb341360`, verified: always-on floor 76 013 (`agent-setup` 4 181 + `fusion-workbench-conventions` 58 762 + `critical-stance` 10 374 + `chat-voice-de` 2 696). Conditionals: `default-voice-en` 3 021, `design-diagrams` 5 285, `decision-record-examples` 4 952, `user-facing-output` 10 884, `circle-records` 28 124, `review-contract` 6 820, `bounded-dispatch` 9 162. Every measured emission reconstructs exactly from these; `analyst` = 76 013 + 3 021 + 5 285 = 84 319 and `coderev` = 76 013 + 6 820 + 9 162 = 91 995 are two checks of eight.

Merged planner inherits `user-facing-output` and `decision-record-examples`; `circle-records` leaves with C6 independently of C7. Merged rule set **100 155**. At the 22 000-byte prompt target the path is **122 155**, against planner's 108 996 today (+13 159) and taskplanner's 95 368 (+26 787). Against shaper's 157 336 it is 35 181 lower, of which 28 124 is C6's credit; C7's own contribution to that path is −7 057.

Merged analyst inherits `user-facing-output`, `review-contract` and `bounded-dispatch`. Merged rule set **111 185**. At 22 000 the path is **133 185**, against analyst's 105 357 today (+27 828), coderev's 100 136 (+33 049), consultant's 104 247 (+28 938), and curator's 133 634 (−449). Even under the most favourable conditioning, with `review-contract` emitted only on a review topic and the merged analyst kept unbound, the path is 117 203, still +11 846 over today's analyst.

**5.8 The two byte targets are unreachable without dropping stated obligations.** Merged planner inputs sum to 62 852 against a 22 000 target, a 65 percent cut. Merged analyst inputs sum to 85 156 against 22 000, a 74 percent cut, and `agents/analyst.md` is already at 21 038 before absorbing anything. The curator input alone is 57 percent over the target, and almost all of it is the write-safety discipline: three evidence tiers with admission rules, the eight evidence sources, the blast-radius stop, the preserve list, the wrong-prune detection, the revert path, the ledger schema (`agents/curator.md:64-116,:190-229,:289-314`). Those are what make a gated project-file write safe, and C7 commits to keeping the gate.

**5.9 The stop that is supposed to catch all of this cannot.** C7's Stops-when bullet reads: "A merge that grows the per-dispatch total is the failure mode C7 names, and the bound in C8 will catch it, so this stop is measured and not judged." C8 defines its baseline as "the six totals measured at the moment the cut lands". A baseline armed at the moment the cut lands absolves the cut. The bound cannot catch the growth of the change that arms it. This is circular, and it is the one place where the spec's most careful self-criticism is discharged by a mechanism that provably does not discharge it.

### 6. What the cut breaks that the spec does not notice

The spec's Stops-when and risks sections do not discharge this. I traced the readers.

**6.1 `agentstate.yaml` is a sentinel, not only a value carrier, and removing it silences the log C4 makes the only trace.** C1 says "The three values `agentstate.yaml` still carries have live readers" and names `bin/fusion-review-coverage`, `bin/fusion-session-domain` and `bin/fusion-events turns`. The file's *existence* is separately load-bearing:

| Surface | Gate | Effect of removal |
|---|---|---|
| `task_start` / `task_done` per dispatch | `hooks/lib/orchestrator-events.ts:322` | no dispatch rows written at all |
| async dispatch pairing | `hooks/lib/orchestrator-events.ts:235` | no pairing parked |
| `SubagentStop` row | `hooks/lib/orchestrator-events.ts:263` | no row |
| session-marker heartbeat | `hooks/lib/orchestrator-events.ts:108` | Setup Step 0c's concurrency warning goes permanently stale |
| `commit` row per commit | `bin/fusion-commit-lock:299` | no commit rows |

`orchestratorSessionInFlight()` is `existsSync(agentstate.yaml)` (`hooks/lib/orchestrator-events.ts:87-89`). Delete the file and every machine-written row stops. C4's acceptance criterion ("The event log carries enough per dispatch to answer what ran, when, for how long"), C8's ("every dispatch writes a row carrying the three byte counts"), C1's own migration of three values onto `session_start`, and C9's presence and dispatch readers all become unsatisfiable at once.

This is already filed as a defect against the current design: `260909-1454_o_a-dispatch-outside-a-recorded-session-writes-no-event-row-and-nothing-reports-it.md`, filed at 14:54 the same day, naming four of the five surfaces. The spec was filed at 16:15 and does not cite it.

**6.2 C2's step partition covers 11 of 16 steps, and its acceptance criterion contradicts C1.** `skills/setup/SKILL.md` carries sixteen `^#+ Step` headings: eleven pre-flight (Step 0, 0b through 0k) and five numbered (Step 1 interrupted-session check, Step 2 rules check, Step 3 context, Step 4 history file, Step 5 event log and live dashboard). C2 accounts for the eleven and says nothing about the five. Steps 1, 4 and part of 5 go with C1 and C4. Steps 2 and 3 do not, and Step 5 must partly survive because C1 requires a `session_start` row carrying the git head, the domain and the session identifier, and `session_start` is model-written by design (`hooks/lib/orchestrator-events.ts:28-30`). So the criterion "reaches its first dispatch having performed at most the two prerequisites plus one marker read" is falsified by C1's own requirement.

**6.3 `bin/fusion-rules` reads `.active-circle`, which C6 deletes.** `bin/fusion-rules:436-445` derives the context-manifest topic from the active Circle pointer, then from a `Topic:`/`Tags:` line on the Circle record, then from the directory slug. C6's "what goes" list names `bin/fusion-paths`'s Circle branch and not this one. Two consequences the spec does not carry. The topic mechanism (`rules/context-manifest.md`, `rules/context-lean-claude-md.md`) loses its only automatic input, so a consuming project's manifest units stop being emitted unless a caller passes a topic explicitly. And C7's own acceptance criterion, "The review contract ... is emitted to the analyst on a review dispatch. The rule helper already takes a topic argument", names the mechanism C6 has just disconnected.

**6.4 `/fusion:cadence` is one of fusion's three administrative commands and two of its three ranked lists read session histories.** `skills/cadence/SKILL.md:31,:82,:115,:129` read `$SCAN_HISTORY`, iterate both stores, and parse each history's `**Filed by:**` header to build the `**Covers:**` line. C4 stops history production; C6 collapses `SCAN_HISTORY` to one store. The spec names neither the skill nor the command anywhere. C4's criterion "`bin/fusion-paths` ... emits `SCAN_HISTORY` only where a reader of the existing corpus needs it" is the right shape and does not identify this reader.

**6.5 Unnamed helpers and rule files affected.** The spec names 6 of 21 `bin/` helpers and 4 of 19 `rules/` files. Beyond 6.1 and 6.3:

- `bin/monitor` reads `agentstate.yaml` (`:144,:1148`), `orchestrator-live.md` (`:3`) and Circle paths. The spec defers only the dashboard file to a User Decision Pending; the monitor's state panel is a second reader and is not named. The monitor is also a shipped asset that Setup copies, so `/fusion:setup` Step 0b and 0e touch it.
- `bin/fusion-staging-drift` reads `session.history_file` from the state file (`hooks/lib/staging-drift.ts:519-520`) and classifies `agentstate.yaml`, `orchestrator-live.md` and `.active-circle` as the in-flight set (`:194-197`). It degrades safely to over-reporting rather than breaking, which is worth knowing and worth saying.
- `bin/fusion-cadence-anchor` loses two of its consumers: `/fusion:cleanup` Step 3's skip and the reconciler's Step 1 inventory. Its `last_forum_read_commit` key survives with C9's forum. Not named.
- `rules/backlog-entries.md` is emitted to `playmaker` alone. C7 deletes playmaker, so the rule governing the store C6 promotes has no recipient.
- `rules/bounded-dispatch.md` (9 162 bytes) is emitted to seven bound agents, four of which C7 deletes, and the verification named it as one of the two files behind the 29.2 percent regrowth the spec cites as its own evidence. The spec is silent on it.
- `rules/decision-record-examples.md` is emitted to five transition agents, three of which C7 deletes.
- `rules/workbench-tracking.md:24` classifies `agentstate.yaml`, `orchestrator-live.md`, `.active-circle` and `portfolio.md` as class L. Four dead entries after the cut.
- `rules/workbench-path-resolution.md` documents the resolver's Circle branch and is a `DEFINITION_SITES` entry in `hooks/lib/__tests__/path-literal-lint.test.ts`.

**6.6 C6 reuses a rule while overturning the other half of the same sentence.** C6's decision reads: "the store already holds one file per item with a filing rule that forbids agents originating entries, and reuse avoids inventing a vocabulary". `rules/fusion-workbench-conventions.md` `## Backlog entries` states **two** bounds in one sentence: "no agent files a backlog entry ... and **the backlog is not the work queue** (it holds ideas; `taskplanner` builds the queue from the records per session)". C6 makes it the work queue and C7 deletes taskplanner. The reuse claim survives only by reading half a sentence.

**6.7 The Out of Scope declaration on citations collides with C6's migration.** Out of Scope: "The citation grammar, its checker and its sweep." C6 moves every record out of every Circle directory. `hooks/lib/citation-scan.ts:36-39` gives `circle-record` and `circle-dir` their own statuses, and `hooks/lib/__tests__/workbench-citation-lint.test.ts` is a blocking gate that recomputes its corpus from the tree with no approvable baseline. `CLAUDE.md`'s own symptom table records that "an archive sweep or a newly filed record with a bad citation reddens the suite for somebody who touched nothing". The largest record migration in the project's history is exactly that event, declared out of scope.

**6.8 The `skills/` growth budget is the surface C2 and C3 will hit, and it is declared out of scope.** Out of Scope keeps the `agents/`, `skills/` and hook-test budgets as measuring "a different thing". C2 turns nine pre-flight checks into things "reachable by name" and C3 turns five pipeline steps into five commands. Both directions add skill bodies against a 20 000-byte head-room. The orchestrator rewrite is a shrink and never trips a bound; the skills expansion is the opposite.

**6.9 The closing loses a step nobody named.** `skills/cleanup/SKILL.md:40-51` has eight selectable steps. C3 names five as surviving commands and says "Ending a session commits the work and pushes it. Nothing else runs." Step 1, `issues` ("file issues for open tasks, finalise the session surfaces"), is neither in the five nor named as removed. C3 is the only capability with no "what goes" enumeration. Under the new design, unfinished work at session end is recorded nowhere the spec identifies. This interacts with C5, which makes record filing conditional, and with C6, where a work item would be the plausible home.

**6.10 `orchestrator.maxTurns` becomes a live configuration leaf with no reader.** C1 removes `bin/fusion-turn-budget` and the budget. `hooks/lib/config.ts` `DEFAULTS`, `fusion.json`, `templates/fusion.json` and the retirement machinery all carry it, and retirement is scoped to top-level keys (`RETIRED_TOP_LEVEL_KEYS`), not leaves. Removing the reader without a leaf-retirement path leaves a setting a project can set that silently does nothing, which is the exact condition the `fusion-guard.json` advisory exists to prevent.

### 7. The self-reference

The spec names its own self-reference and does so well. Two places show the pressure anyway.

**7.1 The removals are argued at three different depths, and the depth tracks distance from the author.** `bugfixer` gets two reasons, `reconciler` three clauses, `playmaker` one. `curator` gets a decision bullet. `shaper` and `taskplanner` get a table cell each and no sentence. `consultant` appears exactly twice in the whole document, both times inside a list, and its removal is argued zero times. The shaper wrote this document. Its own merge is the least argued of the nine, and the one role whose absorbing target already contradicts it (5.2, curator) is the one whose gate the spec is most careful to preserve.

**7.2 The two artifact kinds the shaper writes are the two that survive C4's cut.** C4 removes the history file, written by every agent, and names the decision record as the catcher for what matters. The spec artifact survives in C7's planner row. Both are shaper outputs. That is defensible on the merits and it is not argued on the merits; the decision bullet argues from reuse alone. I record this as an observation, not a defect: the reasoning may be right and the asymmetry is worth the shaper seeing.

**7.3 One cost is understated, measurably.** "the roster reduction itself buys routing coherence and maintenance rather than bytes" understates a measured per-path cost of +13 159 to +34 096 bytes on six of the eight affected paths (5.7). The sentence is in the paragraph headed "stated plainly because it is the most likely place this spec is wrong", which is the right instinct reaching the wrong figure.

### 8. Honesty about what it does not know

Carried through better than most specs and not evenly.

**Where it holds.** The Evidence basis "honest shape of the case" paragraph is the strongest passage in the document. The risks section repeats it rather than filing it away. C7's "stated plainly because it is the most likely place this spec is wrong" is honesty inside a capability, which is what the brief asked for. C4 names the loss it does not mitigate and refuses to invent an artifact to catch it. C3 corrects a false premise in its own dispatch on evidence, and the correction is right: `reconcile` is in the selector vocabulary at `skills/cleanup/SKILL.md:44`, so `--only reconcile` does work today. C6 names the claim field as a re-implementation rather than a deletion. Stops-when states four antecedents and does not pre-judge any result.

**Where it does not hold.** C5's success measurement is tautological (section 1). C8's success measurement cannot fail (4.4). C7's stop is discharged by a mechanism that cannot discharge it (5.9). C8 has no stated benefit (section 2). Three of the nine capabilities therefore carry a confidence in their acceptance criteria that the risks section's honesty does not reach.

## Implications

The document is a good specification with three defects that are structural rather than editorial and one that is arithmetic.

The structural three are: a capability whose acceptance criteria cannot all be true at once (C7's analyst row against C3's `CLAUDE.md` gate); a bound whose baseline is armed at the moment that absolves the change it was built to measure (C8 against C7's stop); and a deletion whose object is a sentinel for the surviving trace (C1's `agentstate.yaml` against C4, C8 and C9). Each is fixable in the spec, none requires new evidence, and all three would have been found by a planner at the cost of a wasted planning pass.

The arithmetic one is the byte table's framing. Its numbers reproduce exactly. Its cardinalities do not agree with each other, its omission rule is not the rule it applied, and it is measured in the one repository whose totals are least representative of the population the bound must serve.

The roster cut is where the spec's own test is least reliable. Applied honestly, the test supports three of nine removals. That does not make the other six wrong; it means the argument offered is not the argument doing the work, and the spec should either widen the test or state the additional grounds it is actually using. The measured byte cost of the merges is the part most likely to change the user's mind, because it runs against the direction the whole cut is aimed.

## Recommendations

Route to **shaper**, to revise the spec. Nothing here needs a planner until the must-fix items are settled, and nothing needs new measurement: every figure a revision needs is in this report.

### Must fix before this is buildable

| Id | Where | What is wrong | Fix |
|---|---|---|---|
| MF-1 | C1, "What goes" | `agentstate.yaml` is the existence sentinel for five machine-written surfaces (`hooks/lib/orchestrator-events.ts:87,:108,:235,:263,:322`; `bin/fusion-commit-lock:299`). Deleting it silences the log C4, C8 and C9 all depend on | Name the sentinel role. Specify what replaces it, and cite `260909-1454_o_a-dispatch-outside-a-recorded-session-writes-no-event-row-and-nothing-reports-it.md`, which measured the same condition |
| MF-2 | C7 table row `analyst`, against C7 decision 3 and C3 criterion 3 | "writes nothing in the project" is unsatisfiable together with "the curator's ... user gate survives" and C3's `CLAUDE.md` gate. Curator writes `CLAUDE.md` and project rule files (`agents/curator.md:327-329`) | Decide which is true. Either the analyst gains a gated project-write surface and the table row changes, or curator survives as a role, or the `CLAUDE.md` command is dropped and C3 loses its gate |
| MF-3 | C7 removal of reconciler | The remainder is assigned to the analyst, whose prompt forbids editing existing documents outside its own targets (`agents/analyst.md:27`) against `agents/reconciler.md:48-50` | Same shape as MF-2. Name the surface the merged role gains, or keep the role |
| MF-4 | C8 baseline, against C7 Stops-when | A baseline "measured at the moment the cut lands" cannot catch the cut's own growth, so C7's stop is discharged by a mechanism that provably does not discharge it | Arm the baseline at the pre-cut totals (this report's table) and require the cut to land inside it, or state a different stop for C7 that is measured before the arming |
| MF-5 | C2 criterion 1, against C1 | "at most the two prerequisites plus one marker read" contradicts C1's requirement that a `session_start` row carry three values, and C2's partition covers 11 of `skills/setup/SKILL.md`'s 16 steps | Extend the partition to all sixteen and restate the criterion in terms of what the critical path may contain, not a count |
| MF-6 | C7 criterion 2 | "the six surfaces do not overlap" is already false: `$OUT_ISSUE` and `$OUT_DECISION` are declared write targets of five of the six survivors | Declare issue and decision filing a shared surface, or restate the criterion over exclusive surfaces only |
| MF-7 | C6 and C7 | Playmaker's four gated backlog operations and its ranking rename (`agents/playmaker.md:56`) are assigned to nobody, against C7's own "nothing is dropped silently" | Assign them or list them in Out of Scope as deliberately dropped |
| MF-8 | C6 "what goes" | `bin/fusion-rules:436-445` derives the context-manifest topic from `.active-circle` and the Circle record. C7 criterion 6 then names that topic mechanism as the carrier for the review contract | Name the reader in C6, and either re-source the topic or change C7's criterion 6 |
| MF-9 | C8, Decisions made | "the largest single item in fourteen of the fifteen paths" is false. Measured: ten of fifteen. The median 47 percent is exact | Correct to ten, or drop the cardinality and keep the median, which is the half that carries the argument |

### Should fix

| Id | Where | What is wrong | Fix |
|---|---|---|---|
| SF-1 | C8 table caption and Evidence basis | Three disagreeing cardinalities (fifteen / eight / six) and an omission rule that is true of two shown rows | State the table's rule as what it is: all fifteen measured, eight shown. Or show all fifteen; they are in this report |
| SF-2 | C8 baseline | Measured only in fusion, where two of three components are unrepresentative. Verification M6 measured a consuming project's rule emission 49 percent higher | Specify a per-project arming for the reporting carrier, or state that the reported figure is a series with no baseline outside this repository |
| SF-3 | C8, re-baselining | The reused three-event rule (`hooks/lib/__tests__/helpers/growth-bound.ts:26-86`) has no event for a project legitimately growing `CLAUDE.md` | Either add the event or state that no fourth event exists and the offset must come from another component, naming which |
| SF-4 | C8 criterion 2 and Stops-when 1 | The replay test cannot fail for a zero-head-room bound. Verified: the coder path rose 154 440 to 188 256 over the window, 21.9 percent | Add the second half: the new bound must stay green over a window in which nothing grew, and the existing instrument must stay green over the failing window |
| SF-5 | C8, throughout | The capability has no stated benefit. Its only justification is that the previous instrument measured the wrong quantity | State the benefit, and label its evidence. Token cost is the honest candidate and the verification marked it unchecked (U4) |
| SF-6 | C8, "Why a report here is not the thing fusion deleted" | Two of three components are named files; the third is a program's output under arguments the hook does not have | Restate the argument at the strength the evidence carries. The conclusion (report, never refuse) does not change |
| SF-7 | C7, throughout | The merges cost bytes on six of the eight paths they touch: +13 159 to +34 096 at the stated targets. The two targets are unreachable without dropping stated obligations (5.7, 5.8) | Replace "buys routing coherence and maintenance rather than bytes" with the measured figures. Reconsider the targets or the merges |
| SF-8 | C7 | Consultant's removal is argued nowhere. Shaper's and taskplanner's get a table cell each | One sentence per removed role, at the depth bugfixer and reconciler already get |
| SF-9 | C3 | The pipeline's Step 1, `issues` (`skills/cleanup/SKILL.md:44`), is neither among the five surviving commands nor named as removed. C3 is the only capability with no "what goes" list | Add one, covering all eight selectable steps |
| SF-10 | Out of Scope | The citation grammar is out of scope while C6 performs the record migration that `CLAUDE.md`'s symptom table names as the event that reddens the blocking citation gate | Bring the gate's corpus recomputation into C6's migration criteria, or state the red run as accepted |
| SF-11 | Out of Scope | The `skills/` growth budget is out of scope while C2 and C3 are the two capabilities most likely to expand `skills/` | Either bring it in or state the expected cost against the 20 000-byte head-room |
| SF-12 | C6, Decisions made | The reuse claim reads half a sentence. The same rule states "the backlog is not the work queue" | Say the bound is being overturned and why, rather than citing the store's rules as unchanged |
| SF-13 | Evidence basis | "13 to 17 percent" is a finding-7 figure that verification U1 marked reproducible in direction and not in value; "3 to 10 percent" blends the governed range with the superseded one | Move the first under a caveat; correct the second to 2.3 to 10.0 |
| SF-14 | Risks | "the corpus is 950 files" reports a window count as a corpus count. Verification C9 puts fusion's lifetime stamped corpus at 2607 | State the window |
| SF-15 | C5 criterion 5, C7 criterion 3 | The success measurement is tautological; the "nothing is dropped silently" criterion is a promise the spec does not itself discharge | Replace C5-5 with a measurement of the thing the change is for. For C7-3, list the nine roles' capabilities in the spec |
| SF-16 | C5 criterion 2 | The five surviving record kinds are never enumerated, and C6's work item is a sixth writable kind | Enumerate them |
| SF-17 | C1 criterion 6, Stops-when 2 | "a majority of sessions" fixes no denominator, and the verification found the session count itself disputed (C10: 43 against about 53) | Name the population and the log-merge handling |
| SF-18 | C1 criterion 5 | `bin/fusion-events turns` counts `turn_start` rows. C1 removes Turns. The criterion redefines the quantity as dispatches while presenting it as a port | Say the quantity changes, and rename it |
| SF-19 | C1, C6 | Ten `bin/` helpers and six `rules/` files are affected and unnamed (6.5) | Add a coverage list, or state that the planner derives it and how |
| SF-20 | C1 | `orchestrator.maxTurns` becomes a configuration leaf with no reader, and fusion's retirement machinery is scoped to top-level keys | Name the leaf's retirement path |

### Noted, no change needed

- The byte table's eight rows reproduce to the byte, and the claim that the coder row reproduces the verification's F4 figure is verified.
- The five corrected figures appear only in the sentence that forbids them.
- No argument rests on the refused conditioning-load claim, directly or by implication.
- C3's correction of its own dispatch premise is right: `reconcile` is a valid `--only` selector today (`skills/cleanup/SKILL.md:44`).
- The spec's "three events" for re-baselining is correct against `hooks/lib/__tests__/helpers/growth-bound.ts:26`. `CLAUDE.md` says two and is the stale surface; already filed as `260908-0104_o_a-doc-comment-cites-two-re-baselining-events-while-the-helper-defines-three.md`.
- C7's "the guard that used to enforce a path boundary was removed on 2026-08-12, so the dispatcher's choice of role is now the only thing standing between an agent and a file it should not touch" is verified true.
- Verification C14's two prerequisites are correctly carried into C2, including the correction they made to the original analysis.
- `bin/fusion-staging-drift`'s dependency on `session.history_file` degrades to over-reporting rather than breaking (`hooks/lib/staging-drift.ts:514-520`). Worth a line in the plan, not a spec change.
- C9's criterion that the presence reader stop depending on a Circle name in a history path correctly names a real reader (`bin/fusion-events:28,:95`). It is the one deleted-surface reader the spec found.

### Two facts for the revision that the spec does not have

Replaying the coder path across the window C8 names: the total was **154 440** bytes at `265a86fb` and is **188 256** now, a rise of **33 816** bytes. `CLAUDE.md` contributed **14 585 of that, 43 percent**. That is the strongest available support for the user's instruction to include `CLAUDE.md` in the bound, and it belongs in C8.

The always-on floor is **76 013** bytes and the seven conditional emissions are `default-voice-en` 3 021, `design-diagrams` 5 285, `decision-record-examples` 4 952, `user-facing-output` 10 884, `circle-records` 28 124, `review-contract` 6 820, `bounded-dispatch` 9 162. Every one of the fifteen measured emissions reconstructs exactly from these, so a planner can compute any hypothetical merged path without running anything.

## Judgement

**This is not yet a sound basis for planning, and it is close.** Its evidence discipline is better than its ancestors', its figures reproduce, and its central case survives audit. What it cannot yet carry into a plan is three contradictions between capabilities that are individually well argued, one bound that absolves the change it exists to measure, and one deletion whose object turns out to be load-bearing for the trace the rest of the document depends on.

**The shortest path to making it one is four edits and no new measurement.**

1. Settle MF-2 and MF-3 by deciding whether the merged analyst gains a project-write surface. Everything else in C7 follows from that one answer.
2. Arm C8's baseline at the pre-cut totals in this report's table rather than at the moment the cut lands, which fixes MF-4 and makes C7's stop real.
3. Add the sentinel role of `agentstate.yaml` to C1 and say what replaces it, which fixes MF-1 and unblocks C4, C8 and C9.
4. Extend C2's partition to all sixteen setup steps and restate its criterion, which fixes MF-5.

MF-6 through MF-9 are one sentence each. The twenty should-fix items can be taken in the same pass or handed to the planner with this report attached. None of the four edits requires re-opening a question with the user, and none of them touches the five answers he already gave.

## Filed Issues

- `260909-1631_*_the-cut-spec-removes-agentstate-yaml-whose-existence-gates-every-machine-written-event-row.md` (MF-1)
- `260909-1632_*_the-cut-specs-analyst-row-forbids-the-project-writes-its-own-claude-md-gate-requires.md` (MF-2, MF-3)
- `260909-1633_*_the-zero-sum-bounds-baseline-is-armed-at-the-moment-that-absolves-the-cut-it-must-measure.md` (MF-4, and C7's stop)

Cited rather than refiled, per the no-duplication rule:

- `260909-1454_*_a-dispatch-outside-a-recorded-session-writes-no-event-row-and-nothing-reports-it.md` measured the sentinel condition in MF-1 against the current design.
- `260908-0104_*_a-doc-comment-cites-two-re-baselining-events-while-the-helper-defines-three.md` covers the `CLAUDE.md` drift noted above.
- `260909-1346_*_the-rule-growth-bound-covers-the-core-while-the-hottest-path-grew-29-percent-back.md` is the standing issue C8 answers.

## Sources

- `260909-1615_*_spec-cut-fusion-to-a-working-minimum.md`, read in full, not edited.
- `260909-1345-verification-of-the-size-versus-bookkeeping-analysis.md`, read in full. Governs.
- `260909-1047-size-versus-bookkeeping-across-three-projects.md`, read for findings 7 and 8 and for the figures the verification corrected.
- Byte measurements at `bb341360`: `wc -c agents/*.md`, `bin/fusion-rules <agent> | xargs wc -c` for all fifteen agents, `wc -c CLAUDE.md`, `wc -c rules/*.md`, and `git cat-file -s 265a86fb:CLAUDE.md` / `265a86fb:agents/coder.md` for the window replay.
- `hooks/lib/orchestrator-events.ts:28-30,:87-89,:108,:235,:263,:322`; `hooks/guard.ts:162-165`; `hooks/lib/state-file.ts:50,:60`; `hooks/lib/staging-drift.ts:194-197,:514-520`; `hooks/lib/review-coverage.ts:131-137,:451-458`; `hooks/events-query.ts:19,:409-421`; `hooks/lib/citation-scan.ts:36-39`; `hooks/lib/__tests__/helpers/growth-bound.ts:26-86`.
- `bin/fusion-rules:436-457`; `bin/fusion-paths:255-314`; `bin/fusion-commit-lock:286-299`; `bin/fusion-session-domain:70-80`; `bin/fusion-cadence-anchor:132,:141`; `bin/monitor:3,:144,:1148`; `bin/fusion-events:28,:95`.
- `skills/setup/SKILL.md` (16 `^#+ Step` headings); `skills/cleanup/SKILL.md:40-53`; `skills/cadence/SKILL.md:31,:82,:115,:129`.
- All fifteen `agents/*.md`; `rules/fusion-workbench-conventions.md` `## Backlog entries`; `rules/backlog-entries.md`; `rules/workbench-tracking.md:24`; `rules/critical-stance.md` §3, §4, §5.
- `CLAUDE.md` at `bb341360`, 93 432 bytes.

## Open Questions

- [ ] Whether the merged analyst gains a gated project-write surface. Everything in C7 turns on this and it is a user-level choice about how much write authority one role may hold, not a shaping detail.
- [ ] Whether the roster cut survives its measured per-dispatch cost of +13 159 to +34 096 bytes on six of eight paths. The user asked for the deepest cumulative tier; he was not shown a figure saying the roster half of it runs against the byte half.
- [ ] What the zero-sum bound is for. Answering this settles SF-5, SF-4 and the shape of the reporting carrier at once.
- [ ] Whether a consuming project arms its own baseline, and if not, what "movement since the baseline" means in a project whose rule emission is 49 percent larger than fusion's.
