# Review: the discuss command and the discussions store's arrival

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `9084eed6..f7cd6d04`
**Not-opened:** `skills/cadence/SKILL.md`
**Review domain:** code
**Work item:** `260916-1050-neues-discuss-feature.md`
**Carried in:** nothing. No prior review of this work recorded a `**Not-opened:**` field, so the carried list was `(not recorded)` and this pass inherits no scope.

---

## Summary

Three commits, none previously opened by a review. The work lands as specified on its mechanical clauses: the store reaches all twelve surfaces C7 enumerates, the resolver's two answers are pinned by test, the 45-line cut is correct and rescued the one load-bearing line, and the head-room raise is logged with the four facts C8 mandates against tables that read net of it. The full hook suite is green at `f7cd6d04` (56 files, 942 tests).

What the work did not finish is the consultant's release from its dispatch ban. The ban was deleted from the three sentences the spec named and survives in five further places across two shipped files — including the orchestrator's own dispatch roster, which now forbids the one dispatch the new command requires. That is the pass's cross-cutting finding.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 2 |
| Medium | 5 |
| Low | 0 |

Every finding is filed as its own record in this container's `issues/`.

## Findings by theme

### Theme 1 — the dispatch ban was deleted from three places and survives in five

**High. `260917-1555_*_the-orchestrators-dispatch-roster-still-excludes-the-consultant-that-discuss-requires-it-to-dispatch.md`**

`agents/orchestrator.md:170` still lists nine dispatchable agents, the consultant is not among them, and the line closes "Keeping to the nine is yours." The same hunk in `f7cd6d04` deleted the clause "and `consultant` is not among them" from that very line and left the enumeration that says it by omission. `skills/discuss/SKILL.md:9` makes the running agent the first partner "whatever agent that is" and `:140` requires it to dispatch `fusion:consultant` once per round. Spec C2 names the orchestrator as one of the two usual first partners. So two shipped files give opposite instructions on the same act.

Spec C3's acceptance criterion — "carries no sentence excluding the consultant from dispatch" — passed over this because a positive roster is not a sentence of exclusion. The criterion was cut to catch the wording and missed the structure, which is what the dispatch's sixth attention point asked about.

**High. `260917-1556_*_readme-agents-states-the-deleted-consultant-dispatch-ban-as-live-in-four-places-three-with-a-falsified-count.md`**

`README-agents.md:49`, `:92`, `:299` and `:369` each state the ban as live, in a file the same commit edited twice. `CLAUDE.md` names this file as the authoring home for the agent roster, so a reader sent there is told the ban holds. Three of the four also carry a cardinality the deletion falsified — "the two exclusions", "both now prose" — which is `rules/critical-stance.md` §5's failure mode with the list right beside the number.

**Scope of the theme.** Two files, five statements, one shipped README and one agent prompt. The deletion touched `agents/consultant.md` (1 line), `agents/orchestrator.md` (2 places) and stopped. The five below were reachable by `grep -n consultant` over the same three paths.

### Theme 2 — a new kind arrived and three enumerations that govern it did not move

**Medium. `260917-1558_*_three-marker-enumerations-in-the-conventions-were-left-behind-when-the-discussion-kind-joined-the-vocabulary.md`**

`c066bfd3` added discussions to `rules/fusion-workbench-conventions.md:303` (the State Markers header) and `:273` (the Filename Patterns row), and left three enumerations below:

- `:367`, the terminal list, omits a closed discussion — while `skills/discuss/SKILL.md:184` asserts that state is terminal. The assertion has no backing in the rule that authors terminality, so an agent holding only the always-on conventions has no basis to refuse a reopen.
- `:313-317`, the transition rules, now govern discussions by the header at `:303` and mandate a `_p_` step and permit `_d_`, both of which `:273` forbids and `skills/discuss/SKILL.md:91` denies.
- `:361`, the glob scope, still reads "on issues and plans".

Of the three, `:367` is the one that changes behaviour; the other two are contradictions a reader resolves by guessing which statement is newer.

**Medium. `260917-1557_*_the-discuss-row-in-readme-agents-names-the-shared-store-for-a-record-the-resolver-files-in-a-container.md`**

`README-agents.md:253` says the register is written to `fusion-workbench/shared/discussions/`. `OUT_DISCUSSION` is scope-resolved (`rules/workbench-path-resolution.md:109`), and `hooks/lib/__tests__/fusion-paths.test.ts:216-218` pins both answers, the container one included. Spec C6's last acceptance criterion is the container case. The neighbouring `memo` and `cadence` rows spell `shared/` correctly, because those keys are literals — the same spelling is false for this one.

### Theme 3 — the skill body's own gaps

**Medium. `260917-1559_*_the-outcome-head-field-is-mandatory-at-begin-and-its-value-set-has-no-member-for-a-running-discussion.md`**

`skills/discuss/SKILL.md:93` requires every head field at `--begin`; `:106` gives `**Outcome:**` three values, all terminal; `:182` writes it only at `--close`. Between the two the field is mandated present with no legal value, and the state it cannot express is exactly the interrupted record the store exists for. The spec carries the same hole, so this is inherited rather than a deviation, and fixing one without the other leaves them disagreeing.

**Medium. `260917-1601_*_the-consultants-startup-procedure-is-written-for-an-interactive-session-and-the-discuss-dispatch-does-not-override-it.md`**

`agents/consultant.md:62` tells the agent to acknowledge readiness, list open items and "Stop and wait for the actual question". A sub-agent has no second turn. `skills/discuss/SKILL.md:153-156` closes its dispatch with two overrides stated "rather than left to be inferred" — write no file, no `AskUserQuestion` — and does not name this third one. Spec C3's "Nothing has to be added to the prompt" holds for the Reliability Mandate it cites and not for `## Primary Mode`, which is written throughout for a chat the sub-agent does not hold. *inference:* a competent run will read a `**Round:**` dispatch as the question and answer it; the defect is that nothing says so on a path the spec declared needed no prompt change.

### Theme 4 — a criterion applied three times in one direction and once in the other

**Medium. `260917-1600_*_the-new-scan-discussions-absence-loop-is-the-pattern-the-same-commit-cut-three-instances-of-as-subsumed.md`**

`f7cd6d04` removed three "emits no `<key>` to anyone" loops as subsumed by the parameterised set-equality case, and added a fourth of the same shape at `hooks/lib/__tests__/fusion-paths.test.ts:228-232`. `SCAN_DISCUSSIONS` has no `ORDER` entry and no `value_for()` arm, so it falls in exactly the class the cut analysis labels **B2** and whose members it lists. Eight lines on a surface the cut left with 22.

## What I checked and found sound

Recorded so the next pass does not re-open it.

- **The stopping rule is mechanically checkable.** Condition A at `skills/discuss/SKILL.md:164` decides from the file alone: `## What could not be decided` empty, and `## What fell` holding no entry whose `**Entered:**` or `**Last moved:**` is the round just run. A before B (`:162`) matches spec C5's precedence clause. The empty-register clause at `:170` is correct as an *outcome* rule — an empty register already satisfies condition A, so what the clause adds is the label `nothing to check`, which is what spec C5 says it is for. Claims never leave the register, so "empty after round one" is the only reachable empty state.
- **The register really is the record file.** Step 3 (`:42-44`) and Step 5 (`:158`) put the rewrite before the stopping check every round and hold no second representation. Under interruption the three cut points each leave a consistent file: after `--begin`, round 0 with an empty register; mid-round, the previous round's file; after the rewrite, N rounds. C6's acceptance criterion holds by construction, with the `**Outcome:**` exception filed above.
- **The 45-line cut.** All four removed blocks were negative key-absence loops. `CIRCLE` and `PORTFOLIO` cannot enter a key set at all (`bin/fusion-paths:248`'s regex requires an `OUT_`/`SCAN_` prefix) and are not in `ORDER` (`:415-418`); the six prefixed keys exit 4 against the `ORDER` check at `:442-450`, which the set-equality case at `:460-474` catches on its status assertion. The one value assertion in the 46 lines, `OUT_CONSULT`, was rescued into `:439`. Nothing else in the block asserted a value, and no other coverage was lost.
- **The four cardinality repairs.** `rules/fusion-workbench-conventions.md:466` "seventh branch" — six table rows plus the no-condition branch, correct. `rules/workbench-path-resolution.md:144` "Three kinds have a write key and no read key" — `OUT_MEMO`, `OUT_CONSULT`, `OUT_DISCUSSION` carry `—` in the read column, correct. `README-agents.md:239` and `:263`, the situational list, both gained `discuss`. `hooks/lib/citation-corpus.ts:43-46`, "TWO CLASSES … WITH NO MARKER TO READ" — the added qualifier is what bounds the pair, and the discussion kind has a marker, so the repair is a real distinguisher rather than a re-labelling.
- **The corpus claim is true.** `citation-corpus.ts:81` says the predicate already answered false for both discussion states. `isLiveRecord` at `:266-276` matches on `issues/`, `decisions/`, `planning/` and the two container-record forms; no `discussions/` path reaches any of them.
- **The head-room log.** `README-hooks.md` carries the figure before and after (24 911 → 39 260), what it bought (`skills/discuss/SKILL.md` at 14 350), the cut searched for first with its measurement, and that no baseline moved. The tables read net: head-room row 39 260, standing raise +19 260 = 866+1 045+3 000+14 349, "eight raises" = 3+4+1. The restore-target column correctly does not move. `228 028 = 188 768 + 39 260` — zero margin as stated, and the golden agrees.
- **The compiled output.** The four `hooks/dist/` files were not read; `committed-dist.test.ts` passes in the green suite, which is the check the dispatch asked for.
- **`--continue`** appears nowhere in the shipped body (C1's last criterion), and the `allowed-tools` frontmatter names the sub-agent in `<plugin>:<name>` form as `CLAUDE.md` requires.

## Observations that are not findings

- **`bin/fusion-paths` is in the dispatched scope list and is not in the range.** Its `OUT_DISCUSSION` arm landed in `9084eed6`, one commit before `031d9c30~1..f7cd6d04` begins. I read it as context; it has never been reviewed and belongs in whatever range covers `9084eed6`.
- **`skills/discuss/SKILL.md:37` mandates an `AskUserQuestion`**, which `agents/orchestrator.md:29` bans absolutely for the orchestrator. This is the deferred question `260824-2013_*_do-the-nine-skill-bodies-that-present-dialogs-follow-the-dialog-ban.md`, whose option 2 is the status quo and whose constraint says the count is recounted rather than copied. The new body adds an instance and changes nothing about the question. Not refiled.
- **`hooks/lib/citation-scan.ts` and `hooks/lib/staging-drift.ts` both omit `forum` from their store lists.** Already filed as `260917-1308_*_the-staging-classifiers-store-list-omits-forum-and-its-comment-states-a-relation-that-is-false-by-that-element.md`. Not refiled.
- **The dispatch-path arithmetic still rests on the banked `CLAUDE.md` slack.** The conventions file grew +817 bytes, charged to all eleven paths, and the bound is green. Spec C8 says so explicitly and filed it as `260917-1115_*_the-claude-md-cut-banked-85-kb-of-slack-into-a-bound-whose-header-says-head-room-is-zero.md`. Not refiled.
- **The consultant carries `user-facing-output.md` on every dispatch** (10 866 bytes, `hooks/lib/__tests__/fixtures/rules-emission.golden`, `[consultant]`), because it is in the five-name fallback list and the `**Audience:**` parameter can only widen. A discussion pays that on every round. A cost, not a defect.

## Cross-cutting observation

Four of the seven findings share one shape: **the work edited a statement and left its neighbours.** The ban sentence went and the roster stayed; the marker header gained the kind and the three enumerations under it did not; the skills table gained a row and the four ban statements elsewhere in the same file did not; the key table gained a row and the terminal list did not. Each executor checked the surface its own step named, and C7's twelve-surface list is what made that work — but C7 enumerated the surfaces the *store* touches, and nothing enumerated the surfaces the *ban deletion* touches. The one-line repair in each case is cheap; what is not cheap is that a reader of any of the five stale statements gets a confident wrong answer.

## Recommended sequencing

1. **Before the work item closes:** `260917-1555` (the orchestrator roster) and `260917-1601` (the consultant startup). Both are reachable from a `/fusion:discuss` run on day one, and the first makes the command's own dispatch a rule violation.
2. **Before the next release tag:** `260917-1556` (README-agents), `260917-1558` (the three enumerations) and `260917-1557` (the store row). All three are shipped text a user or an agent reads as normative.
3. **Cleanup, at the next touch of either file:** `260917-1559` (the `**Outcome:**` value set, which needs the spec moved with it) and `260917-1600` (the eight redundant test lines).

## Scope of this pass

Opened in full: `skills/discuss/SKILL.md`, `agents/consultant.md`, `rules/fusion-workbench-conventions.md`, `hooks/lib/citation-corpus.ts`, both planning records, the cut analysis. Opened by diff plus targeted sections: `agents/orchestrator.md` (§Scope, §How you ask, the Never-invokes block), `README-agents.md`, `README-hooks.md` (§Growth bounds), `rules/workbench-path-resolution.md`, `hooks/lib/__tests__/fusion-paths.test.ts`, `hooks/lib/citation-scan.ts`, `hooks/lib/staging-drift.ts`, the three other test files and both fixtures. Verified by suite rather than read: the four `hooks/dist/` files. Not opened: `skills/cadence/SKILL.md` beyond its one changed line — its body has not been reviewed here and carries forward.
