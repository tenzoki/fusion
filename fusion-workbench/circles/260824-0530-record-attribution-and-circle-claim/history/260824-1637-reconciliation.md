# Reconciliation — 260824-1637

**Agent:** reconciler
**Domain:** `code`
**Phase:** 3 of orchestrator session `260824-0539`
**Circle:** `circles/260824-0530-record-attribution-and-circle-claim`
**Range:** `e209011..cf7a5b0`, 18 commits
**HEAD:** `cf7a5b0`
**Filed by:** reconciler
**Attribution backfilled 260825 (not written by the filing agent):** `reconciler` filed this record; the person half of `**Filed by:**` is absent because the installed plugin at `$FUSION_PLUGIN_ROOT` carried no `bin/fusion-identity` at that time. See `shared/issues/260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`.

**Attribution was dropped and the reason is not the usual one.** `[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-identity" ]` is false in this checkout, because `$FUSION_PLUGIN_ROOT` is `/Users/k1/.fusion` and the installed plugin predates the helper this Circle built. Under `rules/fusion-workbench-conventions.md` `### Who filed it`, that is the absent-helper branch: file with the person half absent, and say so. Every record this pass wrote carries `**Filed by:** reconciler` and no person, while `./bin/fusion-identity` in the work tree exits 0 and prints one.

## Counts

| | Reviewed | Changed |
|---|---|---|
| Plans | 1 in the Circle store read in full, 6 in `shared/` listed | 1 |
| Defect records | 14 in the Circle store, 277 in `shared/` of which 126 open | 14 annotated, 2 filed |
| Decision records | 1 in the Circle store, 63 in `shared/` of which 22 active | 1 marker moved, 3 annotated |
| Review files | 2 | 2 annotated |
| Session histories | 20 in the Circle store | 1 appended (`## Coherence`) |

The `shared/` defect and decision figures are store totals, not a claim that this pass read all of them. What it read in full is the Circle store, the active (`_o_` and `_a_`) decisions across both stores, and the `shared/` records this Circle's own commits or reviews named.

## The one marker that moved

`circles/260824-0530-record-attribution-and-circle-claim/decisions/260824-0613_*_does-a-filing-agent-halt-in-a-tree-that-is-not-a-git-work-tree-at-all.md`, **`_a_` → `_i_`**, with `Implemented: 3ba7a46, 2b055a0`.

The analyst that closed the other three decisions at step 12 flagged this one as looking realised and outside its dispatch scope. It is realised, in both halves, and the move was made on live probes rather than on the commits alone.

- The mechanism half, `3ba7a46`: `bin/fusion-identity` splits the two states the decision distinguishes into two exit codes. Probed inside a git work tree with `user.name` and `user.email` unset — nothing on stdout, both missing values named on stderr, exit 1. Probed outside a work tree — exit 5, which is exit 4's person-half branch plus an unresolved checkout half, and no halt.
- The rule half, `2b055a0`: `rules/fusion-workbench-conventions.md:496` states exits 1 and 4 as opposite instructions to every filing agent, in the single place the rule is authored.
- The test half, `b7f8326`: `hooks/lib/__tests__/fusion-identity.test.ts:148` pins exit 4 as "prints CHECKOUT alone outside a git work tree, and does not halt".

Option 2 is what is on disk. Nothing approximates the answer and nothing restates it per caller.

## Markers considered and deliberately not moved

**The plan stays `_o_` and cannot yet close.** `circles/260824-0530-record-attribution-and-circle-claim/planning/260824-0613_*_c3-attribution-on-records-and-a-claim-on-the-circle.md` has eleven of twelve steps verified complete against the tree. Step 12's decision half landed at `0f5889e` and its Turn-log half is unwritten: `_t_circle.md` `## Turn log` still holds only the template placeholder. `**Status:**` moved from `Ready for Review` to `Partially Complete` and step 12 is marked `[IN PROGRESS]`; the marker itself is left for the orchestrator's Phase 4, which writes the Turn log and closes the plan in one act. Renaming to `_p_` here would stale the record's `**Active spec/plan:**` literal and `agentstate.yaml`'s `source_file` for the length of one phase and buy nothing.

**The twelve open reviewer findings stay open.** Nine from review pass 1 and three from pass 2, left open by the user's explicit decision to fix only the two high-severity ones. Each was re-checked against the tree by this pass and each is still open on its own evidence, which is appended to the record. This is not drift and is not reported as drift.

**The Circle record's `**Claim:**` field is absent and stays absent.** `_t_circle.md` carries `**Filed by:**`, `**Active spec/plan:**` and `**Active session history:**` and no claim, because it was created and activated before `rules/circle-records.md` defined the field. That file states the rule directly: a record written before the field existed carries no field at all and is read as `Unclaimed`. Records are not rewritten, so there is no migration and this is not a defect.

## The eight properties of `## Where this Circle stops`

Seven hold, four of those with a named exception; one is false as written. The full reading, property by property with its evidence, is in the plan's own `## Reconciliation Log` and is not duplicated here. The short form:

| # | Subject | Verdict |
|---|---|---|
| 1 | three templates name the person, form defined once | holds; the corpus's only worked example composes an address the helper does not print |
| 2 | claim field, both routes, one authoring home | holds; the authoring home names the helper bare, unrooted and unguarded |
| 3 | `/fusion:next` refuses, names the holder, offers an override | holds; the override gate is an `AskUserQuestion` whose permissibility is an unrecorded fork |
| 4 | the collision is detected, not prevented | holds, unconditionally |
| 5 | no git identity halts, nothing is substituted | holds; no halt outside a git tree, by the answered decision, and no halt reachable here at all while the installed helper is missing |
| 6 | the three decisions answered, the third's condition met | holds |
| 7 | four bounds pass, one cut | **false on the second clause**: two cuts landed, and the second is what the plan's own risk table prescribes |
| 8 | no pre-Circle record rewritten, no filename pattern changed | holds; two pre-Circle records were touched, one to keep a citation from staling and one by the mandated `Also seen:` append |

The review's summary reached the same seven-of-eight and the same false property, and counted two exceptions where this pass counts four. The difference is in what is counted as an exception, not in what was found.

## What this pass verified for itself

- `cd hooks && npm test` at HEAD: **42 files, 732 tests, exit 0.**
- `git diff e209011..HEAD` over `hooks/lib/__tests__/surface-growth-bound.test.ts` and `hooks/lib/__tests__/rules-emission-golden.test.ts`: **empty.** No baseline map moved. Both files' tests run alone and pass.
- `"$FUSION_PLUGIN_ROOT/bin/fusion-review-coverage" --since e209011`: `commits=18 reviews=2 unusable=0 uncovered=1 verdict=uncovered`.
- `bin/fusion-identity` driven by hand for exit 0 in this repository, exit 1 in a git tree with the identity unset, exit 5 outside both a work tree and a workbench, the exit-4 cause claim inside this repository with `git` removed from `PATH`, and the refusal to overwrite a `.checkout-id` it cannot parse.
- `rules/fusion-workbench-conventions.md`, `rules/circle-records.md`, `agents/orchestrator.md`, `agents/shaper.md`, `skills/next/SKILL.md`, `skills/setup/SKILL.md` read at the lines each property turns on.

## Two records filed

**`circles/260824-0530-record-attribution-and-circle-claim/issues/260824-1637_*_the-circles-release-precondition-is-written-against-a-measurement-that-cannot-read-zero-at-closure.md`.** The plan requires that `bin/fusion-review-coverage` name no uncovered commit before a tag. At HEAD it names one, and it is `cf7a5b0`, the second review's own commit, which touches four files, all under `fusion-workbench/`. A review pass landing in its own commit cannot cover itself, so the clause is unsatisfiable at the moment it is meant to be read. `cf7a5b0`'s message quotes `uncovered=0 verdict=covered`, true when measured and false the moment the commit landed. The governing answer, `shared/decisions/260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md` option 1, had already made coverage advisory eight days before the clause was written.

**`shared/issues/260824-1637_*_an-always-loaded-prompt-states-that-the-uncovered-range-decision-is-unfiled-eight-days-after-it-was-answered.md`.** `agents/orchestrator.md` Step 3c still asserts that "whether a release may go out over an uncovered range is a decision nobody has filed". It was filed on 2026-08-15 and answered on 2026-08-16. The falsity was noticed on 2026-08-19 and recorded inside another record's reconciliation note, where nothing owns it and nothing schedules it. Filed to `shared/` under the Origin Rule: the subject is release policy in an agent prompt, not attribution.

## Records annotated without moving

Eleven open defects in the Circle store and two in `shared/`, each with the measurement this pass took. Three active decisions gained a reconciliation note:

- `shared/decisions/260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md` — fifth consecutive check, option 1 applied, option 3 still absent from `hooks/lib/review-coverage.ts`. First time in the five that the hand-performed shipped-file split empties the uncovered set entirely.
- `shared/decisions/260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md` — part (c) is now load-bearing for a shipped capability, and this is the first time it has changed what a record *contains* rather than which copy of a rule file an agent reads.
- `shared/decisions/260816-0119_*_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md` — a worked instance landed in this Circle and was carried by hand, one commit ahead of the rename that would have staled it. The new rule text makes the form normative and still names no carrier.

## Misfiled — should be a decision

None. Every open record in scope is a defect with a fix direction, not a question awaiting an answer. The two questions this pass met were already decisions on disk (`260815-2109`, `260810-1544`), and the one new question it raised, whether a plan-stated precondition may assert a measurement the project has answered is advisory, is carried inside the defect it filed rather than split off, because that defect names both candidate answers and neither is the project's to pick without the plan's author.

## Coherence verdict

`coherent`. The three edges and their evidence are in `circles/260824-0530-record-attribution-and-circle-claim/history/260824-0539-orchestrator-session.md` `## Coherence`.

## One correction to own

An append in this pass used an unquoted shell heredoc, so a backticked fragment in the text was executed instead of written. It mangled one sentence of the reconciliation note on `260824-1512_*_one-of-the-seven-citation-pin-moves-in-this-circle-carries-no-re-approval-comment.md`, which was repaired, and it left a zero-byte file named `1304` in the Circle's issue store, which was deleted. Both were this pass's debris and neither is a project defect. Nothing else was written by that mechanism: every other append in this pass escaped its backticks, and each was spot-checked after writing.
