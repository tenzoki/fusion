# Closing review: the stale condition in the landed-cell docs (13.1.10, before the tag)

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `f95c0b28..2615df08`
**Not-opened:** none
**Domain:** code
**Work-item:** 261017-1605-migrate-landed-cell-docs-stale-condition
**Cross-references:** `261017-1610-plan-migrate-landed-cell-docs-stale-condition.md`, `261017-1049-migrate-landed-cell-docs-drop-the-stale-condition-so-an-interrupted-rollback-meets-their-premise.md`, `261017-1049-reviewer-closing-pass-over-the-migrate-landed-cell-docs-reset-wording-package.md`, `261017-1637-migrate-end-fence-landed-clause-promises-the-message-for-a-session-recorded-for-another-workbench-path.md`, `261017-1637-migrate-undo-note-names-end-fence-for-an-undo-cut-mid-chunk-where-an-intent-pending-makes-it-refuse.md`

## Summary

Verdict: **accept**. Nothing blocks the tag. The plan's five-condition set is exactly what all four `landedFence` callers check inside their own function, and all three new clauses state it. The three cells named in the dispatch are excluded. Two Low findings remain, both reproduced in a scratch clone. First, `rollback`'s `recorded` check runs before `endLeftFence`, so a session recorded for another workbench path meets all five conditions and gets a different refusal. Second, the sentence right before the reworded Undo clause still lacks the no-intent condition that this release added to the clause itself.

## Totals

Critical 0, High 0, Medium 0, Low 2.

## What was checked

All probes ran in a scratch clone at `2615df08` (absolute `cd`, `pwd` checked), with the live repo's `node_modules` symlinked in. No whole-tree git command ran in the live repository. The marketplace clone was read with a path-limited `git diff` only.

### The landed message, caller by caller (`hooks/migrate.ts`)

`landedThenReset` is reached only through a non-null `landedFence`. `landedFence` is non-null iff `ownFence` holds (`i.state === "legacy"`, `s.rollback !== null`, `i.maintenance?.operation_id === s.rollback.begin_id`), its `landed` list (rollback chunks whose answer is under `ops/`) is non-empty, and `intentStands` is false (`i.pending === null` and no non-dot entry under `journal/`).

| Caller | Gate in front of `landedFence` | Five conditions, as read |
|---|---|---|
| `endLeftFence` (`rollback --end-fence`) | idle branch first (needs `landed` empty, so disjoint); then `shows = legacy ? stale : null`, `landedFence` only if `shows !== null` | legacy, stale, own fence, chunks stored, no intent. **But `rollback` calls `recorded` first**, which refuses `s.workbench !== wb`, one of `stale`'s reasons: Low finding 1 |
| `current` (`run` with a previous record, `resume`, `rollback`) | returns when `stale` is null | the same five; `resume` and `rollback` are behind `recorded` too, but the texts do not attribute the clause to them |
| `setAside` | `shows !== null && standing(i)`; `standing` is implied by an own fence | the same five, no `recorded` |
| `preconditions` (`run`) | legacy, `standing`, a set-aside record whose `begin_id` is the fence, `stale` of that record | the same five, on the set-aside record |

Nothing else gates the message. `landedWay` only chooses whether a deletion is named, and its reads are caught. So inside these functions the plan's set is exact. The one extra condition sits in `rollback`, outside the function the plan read.

### The dispatched cells

- **Interrupted rollback, record current.** `stale` is null, so `shows` is null, so no landed message. Each text names the stale record. Excluded. `migrate.test.ts` "cell A: … --end-fence leaves its fence" passes unedited.
- **Cut mid-chunk, then reset, intent pending.** Reproduced: rollback chunk 2 failed mid-write (`EACCES`), then `git reset --hard HEAD~1`. `status` read legacy, own fence, `record=stale`, no rollback chunk stored, the chunk 2 intent in `journal/`. `--end-fence` gave the generic refusal and `set-aside` gave "the tool that set it closes it". No landed message, and each text's "no intent is pending" excludes the cell. The same cell breaks the idle sentence in the Undo note: Low finding 2.
- **A fence of another record.** `ownFence` fails on the id. Each text names "the fence is the one its rollback began", "the one the record's own rollback began", or "that fence" = "a fence the undo left". Excluded. `migrate.test.ts` cell D passes.

### The three texts against the set

- `bin/fusion-migrate` header: stale, own fence, chunks stored, no intent, legacy. Nothing more: no write lock, no proposal, no re-read. A reset is named only as "one way there". "them" became "those chunks". The rest of the hand-deletion clause is word-identical, only re-wrapped. Every changed line begins with `#`.
- `README-hooks.md` line 235: the same five. This line is the only change in the file. The quiet-cell clause before it and the deletion clause after it are byte-identical.
- `docs/upgrading-to-v13.md` `**Undo.**`: "that fence" (the fence the undo left: condition 2), "a stale record", "chunks of the undo had landed", "no intent is pending", "legacy Markdown". Here "the helper says so" falls in the set-aside context, and `setAside` prints the message under exactly these five, with no `recorded` check. True.
- `grep -c "before the reset"` prints 0 for all three. No backticked token was added or changed.

### Other clauses in the same entry, row and paragraph

The header's idle sentence ("only when …") is a necessary-condition claim and stays true. The `set-aside` entry is true. In the README row, the other clauses were not changed in this range. The idle-fence clause ("a fence its own refused rollback left …, `rollback --end-fence` removes that fence itself") is a sufficient-condition claim that the `recorded` check also undercuts. It is named in finding 1 and is ruling-owned. In the Undo paragraph, every sentence before "Where a fence the undo left" is true. That sentence is finding 2.

### No code line moved

`git diff --stat f95c0b28..2615df08` names, outside `fusion-workbench/`, only `bin/fusion-migrate` (comment lines), `README-hooks.md`, `docs/upgrading-to-v13.md`, `skills/help/SKILL.md`, the surface golden, `plugin.json`, `install.sh` (a comment line) and `README.md`. `hooks/migrate.ts`, `hooks/dist/` and `migrate.test.ts` are not in the range.

### Help paragraph and release surfaces

- `skills/help/SKILL.md`: "Coming from 13.1.9 or earlier", "13.1.2 to 13.1.10 need no migration", "13.1.2 to 13.1.7 each change only `/fusion:migrate`" unchanged. "13.1.10 changes nothing that runs; it corrects three descriptions of an undo." is true: three undo descriptions changed and nothing that runs did. Folding a no-migration patch into its predecessor's paragraph follows `README-agents.md` `## Releasing` step 0. The file is 16526 bytes, equal to the golden; total 225192.
- `plugin.json` `version`, the `install.sh` pin, the `README.md` pin and the marketplace clone's fusion entry all read 13.1.10. The marketplace diff is that one line, still uncommitted. The two `description` strings compare equal.
- `claude plugin validate .` in the clone: passed with warnings. The smoke run was not repeated; the release commit says it answered SMOKE-OK.
- `bin/fusion-review-coverage --since v13.1.9` ends `carried=none`. The release commit message does not state this result, which step 0 asks of "the release commit or the session log". Not filed: the tag has not been cut, and this review records the result.

### Tests

`npm test` in `hooks/` (the clone, with the live `package-lock.json` copied in): 1182 passed, 14 skipped, one red, `workbench-citation-lint`. Its findings sit only in the two pre-existing 261010-1045 issue files; no third file. `reference-resolution-lint`, `surface-growth-bound` and `migrate.test.ts` pass, 70 of 70, with `BASELINE` unedited.

## Findings

### Low 1: `rollback --end-fence`'s landed clause covers a session recorded for another workbench path, which `recorded` refuses first

Header and README row: "Where the record is stale, …, it names those chunks". `stale` reads a record kept for another workbench as stale. `rollback` runs `recorded` before `endLeftFence`, and `recorded` refuses that record with "<session> records <old>, not <new>". Reproduced: the "cell A reset with git" setup, project directory renamed, `--session` pointed at the moved session. All five conditions held, and `--end-fence` exited 5 with the `recorded` refusal and no chunk named. `set-aside` printed the landed message, so the Undo note is unaffected. Reach: only an explicit `--session` after a path change. Scope: the header and the README row. Fix direction: bound the clause to a record kept for this workbench. Filed as `261017-1637-migrate-end-fence-landed-clause-promises-the-message-for-a-session-recorded-for-another-workbench-path.md`.

### Low 2: the Undo note's idle sentence still lacks the no-intent condition

"Where a fence the undo left still stands, the helper refuses to set the record aside and names how that fence is ended: a `rollback --end-fence` of the same record, once no rollback chunk landed under it." Reproduced over an undo cut mid-chunk and then reset: no chunk stored and an intent pending. `set-aside` names "the tool that set it" and `--end-fence` gives the generic refusal. The sentence predates this range (`0be7ecbd`), but it sits in the paragraph this release reworded for the same missing condition. The ruling `261016-1436-how-is-a-rollback-fence-ended-that-a-git-reset-left-standing-over-a-legacy-tree.md` leaves the behaviour in this cell undecided. The finding asks only that the note stop promising `--end-fence` there. Filed as `261017-1637-migrate-undo-note-names-end-fence-for-an-undo-cut-mid-chunk-where-an-intent-pending-makes-it-refuse.md`.

## Cross-cutting observations

Each round has derived the cell from one more layer: `landedFence` (13.1.9), then the callers' `stale` gate (this round). Both findings here come from the next layer out: the subcommand's own entry check (`recorded`) and a neighbouring sentence that paraphrases the sibling branch (`idleFence`). The texts describe each branch from the inside, as a conjunction, and every round has found a conjunct sitting outside the function it read. Inference: a text phrased as "only when" (necessary), like the header's idle sentence, survives this kind of gap. A text phrased as "where …, it names" (sufficient) does not. Rewording the remaining sufficient clauses as necessary ones, or quoting the message's own conditions, would end the series without another enumeration.

## Recommended sequencing

Tag `v13.1.10` as planned. Neither Low issue needs a patch of its own. Both can ride the next migrate-touching release, and they share one fix shape: one bounded clause each, no code.
