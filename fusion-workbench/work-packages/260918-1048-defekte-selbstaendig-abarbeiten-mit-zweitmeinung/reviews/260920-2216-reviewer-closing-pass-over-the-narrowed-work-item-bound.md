# Closing review: the work-item bound narrowed to the agent's own initiative

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `f7545a4c..b30ec2ea`
**Not-opened:** none
**Review domain:** code
**Work-item:** 260918-1048-defekte-selbstaendig-abarbeiten-mit-zweitmeinung
**Decision under review:** `260920-2157_*_may-the-orchestrator-file-a-work-item-when-the-user-instructs-it.md`

The range holds three commits. `47980df0` and `598ebe1e` change workbench records and the event log only (`git show --stat`), so no file of theirs was opened as shipped text; `b30ec2ea` is the one commit with shipped files, and all seven of them were opened.

## Summary

The shipped text says what the decision's `Answered:` line rules and adds no scope of its own: on every one of the nine edited hunks the bound reads "on its own initiative", the three filing routes are named, the Directive is the user's words, provenance is `**Filed by:** user`, and a finding stays an issue or a decision record. The four surfaces agree with each other. Both goldens moved by exactly the two files' byte deltas and nothing else, the reference-lint pin moved for exactly the one token the README added, and the attribution in its re-approval entry re-derives in a scratch tree. Two Low text defects were found beside the edits: the orchestrator prompt's Scope bullet now excludes in one sentence what it permits in the next, and the conventions' `### Who filed it` enumeration omits the kind this commit gives a second writer.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 2 |

## The dispatch's four asks, answered

1. **The text says what the decision ruled, and nothing more.** The `Answered:` line rules: the orchestrator may file whenever the user instructs it, the user's words as the Directive, `**Filed by:** user`, and an agent's own finding stays an issue or a decision record. Checked hunk by hunk at `b30ec2ea`:
   - `rules/fusion-workbench-conventions.md:232` — all four elements present, plus the decision citation in the storeless wildcarded form; `:238` — the bound reworded to "on its own initiative".
   - `agents/orchestrator.md:175` — instruction-only, user's words, no filing from findings; `:398` — adds `**Filed by:** user` and the other two routes; `:414` — the consequence sentence reworded to "on your own initiative".
   - `README-agents.md:290` — three routes, "on its own initiative"; `:300` — the full statement with the conventions anchor.
   - `docs/working-model.md:51` — "no agent ever does on its own initiative", the chat route "with your words as the Directive, and the item is yours"; `:53` — the consequence sentence reworded.
   Nothing beyond the ruling was added: the option-1 con ("the rule text must say the words are the user's") is met on all four surfaces. The commit message counts "eight statements"; the diff carries nine hunks that restate the bound (listed above). A commit message is not shipped text, so this is noted and not filed.

2. **The four surfaces agree.** The same three routes, the same provenance, the same exclusion of an agent's findings, on all four. The one internal disagreement is inside a single surface, not between two: `agents/orchestrator.md:175` (finding 1 below).

3. **The goldens moved for exactly this change.**
   - `rules-emission.golden`: 44 changed lines, which is the `fusion-workbench-conventions.md` row and the `total` row for each of the eleven agents, each row +255. `git show f7545a4c:rules/fusion-workbench-conventions.md | wc -c` = 66 109, at `b30ec2ea` 66 364, working tree 66 364.
   - `surface-growth.golden`: 4 changed lines, `orchestrator.md 89241 → 89393` and `total 311931 → 312083`, +152. Same measurement on `agents/orchestrator.md`: 89 241 → 89 393. `AGENT_BASELINE`, `AGENT_HEAD_ROOM`, `SKILL_HEAD_ROOM` and `TEST_LINE_HEAD_ROOM` in `hooks/lib/__tests__/surface-growth-bound.test.ts` are untouched in the range.
   - `npx vitest run` over `reference-resolution-lint`, `rules-emission-golden` and `surface-growth-bound` at HEAD: 72 tests, all green.

4. **The one test edit is sound.** `hooks/lib/__tests__/reference-resolution-lint.test.ts:464` moves `BASELINE` 1679/289 → 1680/290 and appends a thirtieth entry on the same line, after the twenty-ninth, in the form the twenty-seventh to twenty-ninth use. Its attribution was re-derived rather than trusted: `git archive b30ec2ea` into the scratchpad, `README-agents.md` replaced by the `f7545a4c` copy, every other edit standing, the gate resolves `paths: 1679, anchors: 289, stampBare: 11` and fails only on the pin. So the whole delta is the README bullet's new `rules/fusion-workbench-conventions.md` `## Backlog entries — work items` pair. The entry's "four other edited files" are `agents/orchestrator.md`, `docs/working-model.md` and the two goldens; `docs/` is in `surface()` (`:100`) and the working-model hunk adds no path token. The decision citation in the conventions is class (c) and the test passed with it, so it resolves.

## Findings by theme

### Theme: the narrowing landed on the permission and not on the operation list

**Low.** `agents/orchestrator.md:175`: "the operations under **Work items**, each on the user's word, and nothing else. **You file one only when the user instructs it**". The table at `:402-410` lists seven operations and filing is not one, so the first sentence excludes what the second permits. `:414` ("Each is confirmed for that operation, on that item") reaches the table only, so the prompt states no confirmation rule for a filing. Issue: `260920-2216_*_the-scope-bullet-says-the-work-item-operations-and-nothing-else-then-permits-a-filing-the-operations-table-does-not-list.md`.

### Theme: a second writer of a field whose owing kinds are enumerated without it

**Low.** `rules/fusion-workbench-conventions.md:500` enumerates the kinds that owe `**Filed by:**` as defects, decisions and reviews, by the criterion "every kind whose template carries the line"; the work-item template at `:195` carries it. Pre-existing, but until this commit the field's one writer on a work item was `skills/memo/SKILL.md:119`, which spells `user, <person>`. `agents/orchestrator.md:398` now writes "`**Filed by:** user`" with no person half named, and the two rule locations answer opposite ways whether one is owed. Issue: `260920-2217_*_the-who-filed-it-enumeration-omits-the-work-item-whose-template-carries-filed-by-and-now-has-a-second-writer.md`.

## Cross-cutting observations

- **The bound's other citations still hold.** `README.md:123`, `skills/help/SKILL.md:57` and `skills/memo/SKILL.md:156` name `/fusion:memo` as a route without calling it the only one, so none is made false. `skills/memo/SKILL.md:156` ("this skill is that surface") reads as a definite article over what is now one of three routes; not false, not filed.
- **Both findings are the same shape.** A permission was added at the sentence level and the enumerations the sentence sits beside (the operations table, the owing-kinds list) were not re-read. It is the pattern `rules/critical-stance.md` §5 names, and the previous closing pass filed two of the same kind (`260918-1409_*`, `260918-1410_*`).

## Recommended sequencing

Nothing blocks closing the work item. Both issues are follow-on cleanup for `coder`; the second touches the always-on rule and should carry its golden regeneration in the same commit.
