# Pre-release review of the 13.3.9 fix (3e8e4c2e)

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Review domain:** code
**Reviewed-range:** `fd535452..3e8e4c2e`
**Not-opened:** `fusion-workbench/orchestrator-events.jsonl`, `261024-1005-reviewer-post-release-pass-over-v13-3-4-and-v13-3-5.md`, `fusion-workbench/work-packages/` records of the H1/H6/H7 hand-over package (carried from earlier passes; records, not code)
**Verdict:** accept: M1 is fixed as its issue asked; one Low comment drift, not a release blocker

## Summary

3e8e4c2e closes M1 from `261024-1650-reviewer-post-release-pass-over-v13-3-8.md`. A retried `rollback` refused by its own begin's fence now keeps its record and names `rollback --end-fence`. That command ends the fence, and afterwards `run`, `rollback` and `status` tell the truth. Rows A to J are unchanged from 13.3.8. The new test is red on fd535452's build. The tracked dist equals a fresh build, and the full suite passes. One Low finding: the doc comment on `endLeftFence` no longer covers every fence the function ends.

## Totals

Critical 0 / High 0 / Medium 0 / Low 1.

## Findings

### L1. The `endLeftFence` doc comment names only one of the two fences it now ends

- `hooks/migrate.ts:674-675`: "`rollback --end-fence`: ends the fence a refused first rollback chunk left standing, and nothing else."
- `hooks/migrate.ts:763` now also routes the row-K fence there: this record's own begin fence, answer lost, no chunk sent. The JSON-control branch at `:714-717` ends it (row K below).
- The wrapper header (`bin/fusion-migrate:62-73`) and `README-hooks.md:238`, `:363` already say "the fence this session's / the record's own rollback began and left standing", which covers both. Only the function comment is narrow. The comment reaches `hooks/dist/migrate.js`, so a fix rebuilds dist.
- Scope: one comment. No behaviour.
- Filed: `261024-1748-migrate-endleftfence-doc-comment-still-says-it-ends-only-a-fence-a-refused-first-rollback-chunk-left.md`.

## The commit's codec facts, checked against `codec/src`

| Claim | Source | Holds? |
|---|---|---|
| a fence is `{operation_id, since}` (store.ts:962) | `store.ts:962` `export interface Fence { operation_id; since }` | yes |
| raised with the begin's operation_id (cli/ops.ts:641) | `:641` opens the `begin` branch; `:646` returns `fence: { operation_id: req.operation_id, since }` | yes; the line is the branch, the raise is 5 lines on |
| inspect reports it as `result.maintenance` (cli/ops.ts:269) | `:269` is `function inspect`; `:283` `maintenance: fence.value` | yes; same offset pattern |
| mutate replays before the fence check and raises the fence before storing the answer (kernel.ts:346-364) | `:346` `replayAnswer`, `:350-352` `fenceRefusal`, `:361-364` `writeFence` then `writeAnswer` | yes |
| a rollback chunk needs the fence of a stored begin (migration.ts:2130) | `:2130-2135` under `activated`: `fenceOk` only when the standing fence's id has a stored `maintenance begin` answer | yes; so under row K a chunk cannot run and only ending the fence helps |

Also read: `kernel.ts:432-443` `fenceRefusal` lets only an `end` naming the fence through, and an unreadable fence is itself refused `maintenance-active`. `journal.ts:438-442` `writeAnswer` writes only `ops/<id>.json`, so removing that file is exactly the state a crash between fence and answer leaves.

## The fix, line by line (`hooks/migrate.ts:720-766`)

- `standingFence` returns `null` for no fence, the id for a well-formed fence, and `undefined` when `inspect` throws or the field has no string id. An `inspect` that goes unanswered is exit 7 from `send`, caught as `undefined`, so it never becomes a second exit 7.
- On exit 8 only: `now !== undefined && now !== begin` nulls the record. `now === begin` throws the new exit-8 message. `undefined` falls through to `throw e` with the record kept.
- An unreadable fence file makes the begin's refusal `maintenance-active` (`kernel.ts:434`) and `inspect` refuse `maintenance-unreadable` (`cli/ops.ts:272-273`). That gives `undefined`, so the record is kept. That is the safe side.

## The state table at 3e8e4c2e

The probe is the previous pass's file plus a race extension, appended to `migrate.test.ts` in a scratch worktree at 3e8e4c2e and run with `-t PROBE` (16 passed). The worktree's file was restored before the full suite. Same order per row as before: `run` with `op: inspect` killed, plain `run`, then the command the exit 7 named.

| Row | Record | Plain `run` | Killed, names | Named then | vs 13.3.8 |
|---|---|---|---|---|---|
| A | none | 0 `json-control` | `run` | (= plain) | same |
| B | F/null/F | 5, `resume`, `rollback` | `resume` | 0 `json-control` | same |
| C | T/null/F | 0 `no-op` | `run` | 0 `no-op` | same |
| D | T/set/T | 0 `json-control` | `run` | (= plain) | same |
| E | T/set/F | 5 "is being rolled back", `rollback` | `rollback` | 0 `legacy`, `rolled_back=true` | same |
| F | F/set/F | 5 "is being rolled back", `rollback` | `rollback` | 0 `legacy`, `rolled_back=true` | same |
| G | F/set/T | 0 `json-control` | `run` | (= plain) | same |
| H | T/set/F, own fence after refused chunk | 5 "is being rolled back", `rollback` | `rollback` | 8, names `rollback`, `rollback --end-fence`, fence kept | same |
| I | T/null/F | 0 `no-op` | `run` | 0 `no-op` | same |
| J | T/null/F | 0 `no-op` | `run` | 0 `no-op` | same |
| K | **T/set/F**, own begin fence, answer lost | **5 "is being rolled back", `rollback`** | **`rollback`** | **8, names `rollback`, `rollback --end-fence`; record and fence kept** | **fixed** |

### Row K, every command a message names

Measured in order on one fixture:

1. `status`: `fence=<begin_id>`, `record=current`, record `T/set/F`.
2. `run` killed at `inspect`: 7, names `rollback`. Plain `run`: 5, names `rollback`. `resume`: 5, names `rollback`. `set-aside --consent`: 5, record current, names `resume` or `rollback`. All true. The `resume` that `set-aside` names refuses and names `rollback`, so the chain leads to the same place.
3. `rollback`: 8. The message quotes the codec's refusal ("set by operation `<begin_id>`"), says the fence is this rollback's own, and names `rollback` and `rollback --end-fence`. Record and fence kept. `rollback` again: the same 8, which the message predicted ("is refused again"). True.
4. `rollback --end-fence`: 0, `result=json-control`, `fence=-`, record `T/null/F`.
5. Afterwards: `run` 0 `no-op`. `run` killed at `inspect`: 7, names `run`. `resume`: 0 `no-op`. `rollback`: 8. The codec's audit refuses chunk 2 on the stored `maintenance end`, the host ends the fence it just raised, and the message says so. `fence=-` after. The `--end-fence` note, "the codec refuses every later rollback of this migration", is therefore true. A second `rollback` does the same again and leaves `fence=-`. `rollback --end-fence`: 5, "no fence ... stands", true.

No step leaves a standing fence that no named command ends.

## Races and orderings

What decides is the fence id read by the `inspect` after the refusal. Begin ids are fresh `randomUUID`s kept only in this session's `state.json`. So a fence with `operation_id === begin` can only come from a `maintenance begin` sent under this session's record. I simulated each ordering with a stand-in that runs a script, or dies, at the first `inspect` after the refused begin.

| Case | What happens between refusal and `inspect` | Result | True? |
|---|---|---|---|
| KU | row K, `inspect` unanswered | 8, the codec refusal only, no command named; record and fence kept. The next `rollback` names `--end-fence`, which ends it (0, `fence=-`). | yes. See note 1. |
| R1 | row K, then the same session's `--end-fence` ends the own fence | record nulled, `fence=-`; `run` 0 `no-op`; later `rollback` refused by the audit, fence ended, `fence=-` | yes: no fence stands, and `--end-fence` itself nulls the record too |
| R3 | row K, then the own fence ends and a foreign fence is raised | record nulled, foreign fence stands; `run` 0 `no-op` | yes: this is row J. The foreign fence is its owner's to end. |
| R2 | foreign fence refuses the begin, then it ends and the **same session's** begin lands, answer stored | record kept; 8 says "this rollback's own ... its answer was lost". The named `rollback` skips the stored begin, runs, and in this fixture the audit refuses on the foreign begin/end. The host ends the fence, `fence=-`. | the end state is right; the message is not. See note 2. |

**Foreign mistaken for own (R2).** This needs a second `bin/fusion-migrate rollback` on the same session running at the same time. The worst outcome is a kept record (the safe side) and an exit-8 message that is wrong twice. It quotes the foreign fence's id from the refusal next to "That fence is this rollback's own", and it says the answer was lost when it is stored. Both named commands still end truthfully. I did not file it, because the precondition is outside the advisory one-orchestrator invariant. If it is ever wanted, a `stored(wb, begin)` check after `inspect` would separate the two cases.

**Own mistaken for foreign (R1, R3).** The own fence has to be gone by the time of the `inspect`, and an end that names it is the only way the codec takes it away (`fenceRefusal`). So nulling is true in every such case. There is no ordering where the own fence still stands and is read as foreign.

Note 1, not filed: on KU the exit-8 message names no command. The commit chose this ("inspect unanswered -> record kept, rethrow"). The refusal it prints is true. `run`, `resume` and `rollback` all name the way on. This is the same "names no way out" gap the previous review recorded as pre-existing, now limited to an unanswered `inspect`.

## The new test

- `migrate.test.ts:651-669`. The stand-in lets the real codec answer the begin, which raises the fence and stores the answer, and then dies, giving exit 7. The test then removes `ops/<begin>.json`. `writeAnswer` writes only that file (`journal.ts:438-442`), so this is exactly the crash state "fence raised, answer missing". `status` showing `fence=<begin_id>` confirms it.
- Copied into an fd535452 worktree, `-t 261024-1650`: 1 failed, `expected [ 8, undefined, false ]`. That is the M1 state: record nulled, `--end-fence` not named.
- It pins acceptance 1 and 3 of the issue. Acceptance 2 is the 261024-1425 foreign-fence test, which is green in the full suite.

## dist, suite, golden

- `node scripts/build.mjs` in a clean 3e8e4c2e worktree: exit 0, and `git status` shows no tracked change. The tracked `hooks/dist/migrate.js` is the build of `hooks/migrate.ts`.
- `npm test` in that worktree, probe removed: exit 0, 67 files passed and 1 skipped, 1216 tests passed and 14 skipped. This matches the commit message.
- `wc -l migrate.test.ts` is 938, which matches the regenerated `surface-growth.golden` line. Total 25976. No bound moved.

## The help paragraph (`skills/help/SKILL.md:89`), at 3e8e4c2e

The range does not touch the paragraph. Each sentence checked against the behaviour measured above:

- "Coming from 13.0.0 to 13.3.7", "13.3.0 to 13.3.8 need no migration": still true. The range changes no store.
- "13.3.8: a rollback the store refuses to start no longer leaves the session looking as though a rollback were running": true of 13.3.8 and still true at 3e8e4c2e for row J and for every refusal that leaves no fence of this begin. Row K is not covered by that sentence: there the store did start this rollback's fence, and the session correctly shows a rollback in flight.
- "... an unknown outcome at `survey` or `repair` stays a retry even when the session file is damaged": not touched by the range.
- "13.3.7: ... refuses and names `rollback`, and so does the retry after an unknown outcome at `run`": true, and now also true of row K (plain and killed `run` both name `rollback`).
- 13.3.6 to 13.3.0: unchanged, and outside this range's code.

**For the release, not written here:**

- The label moves to "Coming from 13.0.0 to 13.3.8", and the clause to "13.3.0 to 13.3.9 need no migration".
- A 13.3.9 sentence is needed. For example: "13.3.9: a retried rollback that its own earlier begin's fence refuses keeps its record and names `rollback --end-fence`, which ends that fence; 13.3.8 dropped the record and left a fence no command ended." Without it, a reader coming from 13.3.8 does not learn that a store that was stuck after that state is now recoverable.
- `skills/help/SKILL.md` is under the growth bounds (`README-hooks.md` `### Growth bounds on the shipped text`). The sentence will move its golden. Size it before the release run.

## Measured, not taken from the commit message

- The new test at fd535452: 1 failed. At 3e8e4c2e the full suite passed (1216).
- Rows A to K at 3e8e4c2e as tabled. A to J are identical to the 13.3.8 table.
- dist equals a fresh build.

## Observations not filed

- R2's message (above): wrong only under two concurrent same-session `rollback`s; the end state is right.
- KU's exit 8 names no command (note 1).
- The commit's codec line numbers 641 and 269 point at the enclosing branch and function, not the cited line. The facts hold.
- The commit moves the 261024-1650 issue record to `in_progress`. Closing it after release is for the state auditor.

## Recommended sequencing

Nothing blocks 13.3.9. L1 is a one-comment cleanup with a dist rebuild. It can ride with the release or go into the next patch. The release needs the help-paragraph update above and the usual five surfaces.
