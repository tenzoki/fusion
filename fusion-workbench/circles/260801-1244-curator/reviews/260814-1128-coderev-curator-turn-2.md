# Code review — Turn 2 of Circle `260801-1244-curator`: the seven closures, and the arming of the growth bound

**Date:** 2026-08-14 11:28
**Sender:** coderev
**Circle:** `260801-1244-curator`
**Reviewed-range:** `5b81f5a..5c843e6`
**Not-opened:** `fusion-workbench/orchestrator-events.jsonl`, `fusion-workbench/portfolio.md`, `fusion-workbench/circles/260801-1244-curator/history/260814-0738-shaper-curator.md`, `fusion-workbench/circles/260801-1244-curator/history/260814-0845-planner-curator.md`, `fusion-workbench/circles/260801-1244-curator/reviews/260814-0857-conceptrev-plan-curator.md`, `fusion-workbench/shared/history/260813-2345-orchestrator-session.md`, `fusion-workbench/shared/history/260813-2346-playmaker-direct-dispatch.md`, `fusion-workbench/shared/history/260814-0823-playmaker-direct-dispatch.md`, `fusion-workbench/shared/issues/260814-1001_o_the-skills-array-in-fusion-paths-test-is-hand-written-and-omits-two-skills.md`, `fusion-workbench/shared/issues/260814-1001_o_three-skill-bodies-embed-german-while-skill-bodies-are-an-english-surface.md`

**On the range, and on Turn 1's carried list.** The dispatch named `249e606..HEAD`, three commits. The range recorded above starts one commit earlier, at `5b81f5a`, so that it tiles with Turn 1's `d7786eb..5b81f5a` and leaves `249e606` covered rather than in the gap between two reviews. That commit carries workbench records only — Turn 1's own review file, the seven defects it filed, the Circle record's Turn-log entry, the session history and one shared defect — and I opened its substantive content: the Turn 1 review in full, all seven of its now-closed defect records in full, `_t_circle.md` in full, and the shared record about the coverage helper counting a conceptrev review unusable.

Every shipped file changed in the four commits was opened: `agents/curator.md`, `agents/orchestrator.md` and `rules/circle-records.md` as their complete diffs plus the sections around them, `hooks/lib/__tests__/rules-emission-golden.test.ts` end to end at HEAD and as its complete diff over the range, and `hooks/lib/__tests__/fixtures/rules-emission.golden` as its complete diff.

Turn 1's `**Not-opened:**` list was carried into this pass as the dispatch directed. Confirmed by inspection rather than by re-derivation: every entry on it is a workbench record and none is shipped source. Of its eighteen entries I opened eight in full — the Circle record `_t_circle.md`, the growth-bound decision `260814-0738`, and the three open Circle defects `260814-0813`, `260814-0828`, `260814-0920` — plus the spec `260814-0738_o_spec-curator.md` by section (C10, C11, `## User Decisions Pending`, header) rather than end to end. `_a_circle.md` no longer exists; it was the deleted half of Turn 1's activation rename. The ten entries still unopened are the ones listed above, and none of them changed in this range.

---

## Summary

The arming follows its binding decision exactly, and I could not find a place where it does not. The five core baseline entries were re-set once to the live file sizes, the three role-specific entries were left at their 2026-08-05 figures, `RELEASE_CAP` and `DRIFT_CEILING` were not touched, and the overshoot the re-baseline absolved is reproduced in the file as a table whose every cell I re-derived and found correct. The seven Turn-1 defects are closed as filed, the severe one by four mutually consistent registrations in `agents/orchestrator.md`, and no fifth site in that file enumerates the old set.

Three findings, all in comment and description prose, none in behaviour. The load-bearing one is that the file's own account of when the release-cap justification duty fires describes a path the code does not have.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 2 |

All three are filed under `circles/260801-1244-curator/issues/` with the stamp `260814-1128`.

## What was verified, and how

- **The suite.** `cd hooks && npm test` — exit 0, 49 files, 1030 tests. `grep` for `RULE-TEXT BUDGET` over the captured run: no match, so the report printed for no role.
- **The manifest.** `claude plugin validate .` — passed, with the one pre-existing `CLAUDE.md` warning. The fourteen-agent `tools:` allowlist parses.
- **The two caps.** `git diff 249e606 HEAD` over the test file shows no `+`/`-` on either `const RELEASE_CAP = 105_354` or `const DRIFT_CEILING = 145_144`. The one `DRIFT_CEILING` line that moved is a comment word ("The one number that still blocks" to "The far blocking number").
- **Which half of the baseline moved.** The five core entries went `2 792 -> 3 513`, `34 671 -> 52 027`, `4 191 -> 4 291`, `16 683 -> 16 784`, `5 317 -> 9 958`; the three role-specific entries did not move. `wc -c` over `rules/` confirms each new core figure equals the file on disk, and confirms the two role-specific files that grew — `circle-records.md` at 11 949 against a 9 302 baseline and `workbench-stash-and-lock.md` at 12 952 against 9 250 — are still unabsolved and still count against the report.
- **The standing-overshoot table** (`rules-emission-golden.test.ts:428-433`), re-derived cell by cell from the old and new baselines. All fifteen numbers hold: `(core only)` 86 573 / 75 654 / 10 919, `design-diagrams.md` 92 246 / 81 327 / 10 919, `circle-records.md` 98 522 / 84 956 / 13 566, the pair 104 195 / 90 629 / 13 566, and the orchestrator's 111 474 / 94 206 / 17 268. The per-file growth line is correct too: 17 356 + 4 641 + 721 + 101 + 100 = 22 919.
- **The 229 bytes, verified independently.** The orchestrator's role floor is `86 573 + 9 302 + 9 250 = 105 125`, and `105 354 - 105 125 = 229`. The "down from 23 148" is right as well: the old floor was `63 654 + 9 302 + 9 250 = 82 206`, and `105 354 - 82 206 = 23 148`.
- **The disclosed drift-ceiling correction.** The removed claim was "33 378 bytes above today's worst-off agent". `145 144 - 111 474 = 33 670`, so it was 292 bytes wrong, exactly as reported.
- **The role derivation, measured rather than read.** `bin/fusion-rules <agent>` for all seventeen agents: nine in `(core only)`, five in `design-diagrams.md`, one each in the three remaining roles. Seventeen total, and the curator sits in `(core only)` as plan step 2 intended.
- **The golden fixture's movement in this range.** Exactly three agents at −9 bytes each (`orchestrator`, `playmaker`, `shaper` — the three that load `circle-records.md`; the diff's hunk headers name the *following* block, which is what makes this easy to misread), matching the nine characters the `thirteen` removal took out. No other line moved.

## Findings by theme

### The release-cap justification duty

**1. The duty's prose describes a firing path the floor-based assertion does not have. (Medium)**

`rules-emission-golden.test.ts:571`, new in `5c843e6`, says the assertion "on this margin is one core-file edit away from firing". It is not. The trigger is `floorOf(...) <= RELEASE_CAP` (`:1045`), `floorOf` sums `RULE_BASELINE` (`:689` into `:636`), and `RULE_BASELINE` is a hand-edited constant. Editing a core rule file moves `wc -c` and not the floor; adding a new always-on file moves it either, since a file with no baseline entry contributes 0 and counts as growth in full against the hard bound instead, which the same file states at `:280`. What can move a role's floor is a hand re-baseline or an audience change in `bin/fusion-rules`. The same claim is repeated in the commit message and in the executor's history file.

The second half of the finding is older and was not introduced here. `:228-233` says a role floor at or below the cap "costs a consuming project nothing it was not already paying". The orchestrator's role floor is 105 125, under the cap, and what that role emits is 111 474 (`fixtures/rules-emission.golden:115`), 6 120 over it. Both halves have one root cause: the duty is floor-based and its prose is written as if the floor were the shipped load.

Issue: `260814-1128_o_the-justification-dutys-prose-describes-a-firing-path-…`

**On the dispatch's second question — does anything make the 229-byte condition visible?** No, and the honest answer is more useful than the literal one. The margin is recorded in two comment blocks (`:504-505` and `:563-571`) and nowhere executable, and because of finding 1 it is not a margin an always-on rule edit can consume at all. What the next editor of an always-on rule actually meets is the hard bound at +12 000 bytes of core growth, which fails loudly and names the file and the delta. The 229 is a fact about a dormant assertion, and stating it as a live tripwire is what makes it misleading rather than merely quiet.

### Prose left behind by two correct fixes

**2. The curator's frontmatter description still carries the unqualified gate absolute. (Low)**

`5a1ec16` qualified the gate rule at `agents/curator.md:16` and `:168` so both speak of changing an existing statement. `agents/curator.md:3`, the `description` field, still reads "nothing is written before a user gate", which `## Scope` (`:322`) contradicts with three ungated writes. It is the one sentence about the curator a caller sees without opening the prompt. `CLAUDE.md:16` and `README-agents.md:41` carry the looser "nothing lands before a user gate"; whether those move too is a judgement, not a defect. Any fix is a frontmatter edit in the repository that broke its fleet once on one, so it must avoid an unquoted colon and be re-validated.

Issue: `260814-1128_o_the-curators-frontmatter-description-still-carries-…`

**3. Three byte figures and one agent count beside the arming were left stale while a fourth was removed. (Low)**

`rules-emission-golden.test.ts:136-142` and `:154-157` carry, in present tense, a leanest role of 89 896 (it is 86 573), a fleet range topping out at 111 766 (it is 111 474), 21 870 bytes of silent head-room (it is 24 901), and "the five leanest agents" (there are nine). The last of those went stale inside this Circle when the curator joined the `(core only)` role. The finding is the inconsistency rather than the figures: the same commit applied the `260814-0845` decision to a stale number four lines below and not to these. In fairness the removed one said "today's" and these open with "after the cut", which is a defensible line to have drawn.

Issue: `260814-1128_o_three-byte-figures-and-one-agent-count-beside-the-arming-…`

## The three things the dispatch asked to be judged

**The arming against its decision — clean on all five constraints.** Baseline re-set once and only for the five core entries; three role-specific entries untouched and now visibly diverging from what those files weigh; the overshoot written into the file as a table plus a per-file breakdown; `RELEASE_CAP` and `DRIFT_CEILING` unmoved. The arming is also not the silent raise the file's own doctrine warns against, and the reason is mechanical rather than rhetorical: `## Re-baselining` now names two events instead of one, the second is stated as having happened once, the cut-log entry is headed as an arming and says in its first line that no byte was removed, and the failure message the bound prints (`:658-687`) names the section and says that regenerating the golden never clears the bound. All eight of C10's acceptance criteria are met, including the two the plan proved by experiment rather than assertion — the live falsification against `agent-setup.md` and `design-diagrams.md` — which I did not repeat but whose unit-level equivalents are in the file at `:1134-1184` and pass.

**The four registration sites — mutually consistent, and no fifth.** `agents/orchestrator.md:3` (description), `:4` (`tools:`), `:236` (Scope) and `:1399` plus the paragraph under it (invocation table) all name the curator, and the three that carry a list carry the same fourteen names in three different orders. `grep` over the whole file for every other sub-agent name turns up no further enumeration. The deliberate absences are argued rather than assumed: the routing table maps queue tasks to executors by the file they touch and a curator run is not a queue task; the never-invokes list is for agents whose only caller is the user. The proxy paragraph's four return values match `agents/curator.md:235` exactly. One thing worth naming as consistent-with-the-fleet rather than as verified: the curator's "you do not receive `AskUserQuestion` when dispatched" is the same sentence `agents/analyst.md:45` and `agents/bugfixer.md:42` carry, so it is the fleet's convention and not a new claim this Circle made.

**The two edits beyond the plan — both in the spirit, neither scope creep.** The drift-ceiling figure was a present-tense claim the file made falsely, in a paragraph step 5 was rewriting anyway; removing rather than refreshing it is what `CLAUDE.md`'s own always-on-floor paragraph does with the same class of number, so the extension of decision `260814-0845` from agent counts to byte figures is a reasonable reading rather than a stretch. The two extra gate-absolute sites had to move or the overlap fix would have left the contradiction standing in the same file it was closing, which makes them part of the fix rather than beyond it. Both were disclosed in the commit message and in the executor's history file. A third edit was less visible: the ROLES doc block lost its per-role agent counts ("8 agents", "5 agents", …) in the same rewrite. It is the right call — those counts were falsified when the curator landed — but the commit message's "one edit beyond the plan's four" does not cover it. Not filed; noted so the count is honest.

## Cross-cutting observation

**All three findings are the same shape, and it is the shape this Circle exists to attack.** A claim about a number or a rule, written in prose, checked by nothing. Finding 1 is a claim about when a gate fires, findings 2 and 3 are claims about what an agent does and what a fleet weighs. The Circle's two decisions both concluded that a figure nothing asserts should be derived or removed rather than restated, and the curator is the agent being built to find exactly these. It is worth saying plainly that the mechanical gates carried most of this Turn: the suite proved the arming's behaviour in both directions, the golden pinned the fixture movement to nine bytes across three agents, the enumeration lint held the five asserted counts at seventeen, and `claude plugin validate` held the frontmatter. What is left over is what no parser reads, which is precisely the residue the Circle predicted.

## Is the Directive met?

**The building half is met. The proving half has not started.**

The Directive names its own two halves and is explicit about the second: "The finished agent's first real job is this project's own decision corpus … That is both the deliverable and the proof, because a curator that cannot reconcile its own framework's decision history is not finished." C1, C2, C3, C6, C7 and C10 have landed and are reviewed. **C11 has not been run.** No curator run file exists anywhere under `$SCAN_HISTORY` — the Circle's history directory holds seven files, five coder logs plus the shaper's and the planner's — so all eight of C11's acceptance criteria stand unticked, including the one the Directive turns on: the verdict on the zero-superseded question over the project's decision corpus.

C11 is not an executor step by the plan's own design (`plan-curator.md` `## Validation Run (C11)`): it is a `/fusion:curate` run the user invokes. So this is not work the Circle failed to do; it is the last thing the Circle needs and the one thing no agent can start on its own.

## What I would want fixed before it closes

1. **Run C11.** Everything Turn 1 flagged as blocking it is now closed — the dispatch allowlist, the provenance-path citation, the gate-rule overlap and the fixture-staleness reporting path. It is the Directive's stated proof, and closing without it means closing on the build alone.
2. **Finding 1.** It is one comment paragraph, and it is a false statement about a gate sitting in the file whose subject is false statements about gates.
3. **The three Circle issues still open from activation** — `260814-0813` (the Circle record's own title still advertises the retired conventions-file validation case, which is what `portfolio.md` and `/fusion:next` render), `260814-0828` (the spec's `## User Decisions Pending` still calls the growth-bound decision open, and cites it at its `_o_` name, after it reached `_i_` in this Turn), `260814-0920` (the Turn-log drift row, a plugin defect rather than a Circle defect). The first two are records contradicting themselves inside the Circle that is about to be reconciled; the third is fine to carry out of the Circle.
4. **Findings 2 and 3**, ordinary cleanup, any time.

One thing I am not filing but will name, because it belongs to the same class and the reconciler will read it: the Directive itself says "the always-on rule text every one of the sixteen agents loads". It is seventeen. Issue `260814-0813` already covers the record contradicting itself; a Directive is the shaper's to edit, not a coder's.
