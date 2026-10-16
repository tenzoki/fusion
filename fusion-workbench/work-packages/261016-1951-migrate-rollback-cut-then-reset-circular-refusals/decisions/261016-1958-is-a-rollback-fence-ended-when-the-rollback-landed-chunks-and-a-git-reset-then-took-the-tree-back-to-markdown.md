# Is a rollback fence ended when the rollback landed chunks and a git reset then took the tree back to Markdown, and by whom?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261016-1807-a-rollback-cut-after-its-first-chunk-then-reset-with-git-gets-refusals-that-point-at-each-other.md`, `261016-1436-how-is-a-rollback-fence-ended-that-a-git-reset-left-standing-over-a-legacy-tree.md`, `261016-1807-reviewer-closing-pass-over-the-migrate-rollback-fence-after-reset-package.md`, `261016-1951-migrate-rollback-cut-then-reset-circular-refusals.md`

---

## Question

A migration is committed. A `rollback` of it lands at least one rollback chunk after activation and is then cut, by a kill or a crash. Then `git reset --hard` takes the tree back to the commit before the migration. `.json-state/` ignores itself, so the reset keeps the rollback's fence in `.json-state/maintenance.json` and the stored answer of every rollback chunk that landed. The plan index leaves with the reset, so `stale()` reads the record as stale. `idleFence` refuses this fence because a scheduled rollback chunk is stored. That check is what decision 261016-1436 used to tell its cell C apart from a real rollback in flight. So `rollback --end-fence` refuses, `set-aside --consent` refuses while the fence stands, and `run` refuses while any fence stands. The issue cited above reproduced it. The messages point at each other, and no message names a step that works.

The choice is whether this fence may be ended at all, and if so by whom and on what evidence. The messages are fixed under every option. What is left to decide is the way out, if there is one. That decision is the user's, so it is a record and not a plan bullet.

**Measured: a round trip through git is not a way out.** The probe ran against a scratch copy of `d3c9eeae`, with the real bundle and the kill stand-in `killPlugin()` from `hooks/lib/__tests__/migrate.test.ts`. The sequence was the issue's. After `git reset -q --hard <the migrated commit>`, `status` printed `state=json-control` and `record=current`, with the fence standing. `rollback` then exited 8 with `migration rollback chunk 1 refused: migration-incomplete/chunk-out-of-order: after activation every chunk of migration-… is landed; rollback starts at chunk 2`. The fence was kept, `workbench.json` was back, and the tree held 32 control files. Rollback chunk 2's answer is stored, so the helper skips that chunk and the codec refuses the next one. `rollback --end-fence` on that tree refuses too, because its JSON-control branch requires the last rollback chunk not to be stored. The tree as it stood at the cut, the migrated commit plus chunk 2's rollback writes, was never committed, and no command rebuilds it. So the issue's example way out ("check out the commit that carries the migration and run `rollback` there") is refused by the codec today. It is not offered below.

**Measured: what this fence still guards.** After the reset, `git status` showed only one untracked file of the migration, `archive/migrations/<id>/rollback.json`. No control file of the migration stood, and no manifest. The same probe then removed the fence file by hand. `set-aside --consent` exited 0, and `run` exited 0 with `result=json-control`, migrating the tree under a new id (`<id>-2`). The stored rollback answer of the old migration did not stop the new plan. So with no control state of the migration left in the tree, the fence guards no half-done rollback: what a complete rollback would have brought back, git brought back. The probe also showed what changes when the tree still carries such state. In the tree at the cut, before the reset, chunk 1's control files were still standing. A tree like that, made stale by hand (say the plan index deleted), carries half a rollback. Its fence must stay.

**The evidence the helper holds.** The proposal `.json-state/migration/<id>.json` lies under `.json-state/`, so it survives the reset. The session records its hash (`s.proposal.sha256`). For every record the migration touched, the proposal lists `control_path`, and for a rewritten narrative `rewrite.after_sha256` as well. So "the tree carries none of this migration's control state" is a question the helper can decide from inputs it already has:
- no `control_path` of the proposal stands;
- no rewritten narrative is at its `after_sha256`;
- the store is legacy, so no manifest stands.

If the proposal is missing or at other bytes, the question is undecided, and undecided never reads as "none".

## Options

1. **Messages only: name the situation, and build no way out.** `current()`, `setAside()`, `rollback --end-fence`'s refusal and `run`'s fence refusal for a record set aside beside it all say the same thing in words. A rollback of this record landed rollback chunks N, then the tree was reset to Markdown, so the plan index is gone. They also say that no command of this helper ends the fence that rollback left, and that nothing was written or lost. None of them names `set-aside --consent` or "the tool that set it".
   - Pros: the smallest change, and no write path is added. It meets the issue's acceptance except the optional last sentence ("if a way out is decided").
   - Cons: the dead end stays. The workbench is legacy, so since 13.0.0 every agent refuses it until `/fusion:migrate` converts it. In this cell `/fusion:migrate` cannot, and the project stays unusable for fusion until a later release or a hand deletion that no message names.
   - Risk to a real rollback: none. No fence is ended that is not ended today.
   - Test: the extended case asserts the wording and that `maintenance.json` stays byte-identical. It ends on the refusal, with no `result=` line.

2. **Messages plus the hand deletion, named with its conditions.** Option 1's wording, and the message then says the fence is ended by deleting `.json-state/maintenance.json`, once the user has checked three things. First, that `status` shows `record=stale`. Second, that no control file of the migration stands, for which the message names a `find` over the proposal's control paths. Third, that `.json-state/journal/` is empty. The helper itself removes nothing.
   - Pros: the user is told a working step. No code removes a codec-owned file.
   - Cons: a person applies the guard, from prose with several conditions. The previous decision turned this down for cell C (its option 4), for the reason that still holds: the conditions are the ones the code can check. It also contradicts the "deleting the fence file is no recovery" sentence in `bin/fusion-record`'s and `bin/fusion-archive`'s headers more openly than option 3 does.
   - Risk to a real rollback: a person who misreads the check deletes the fence over a half-done tree. Nothing catches that.
   - Test: the case deletes the file after the refusal, then `set-aside --consent` and `run` give `result=json-control`. That proves the deletion is a way out. It does not prove the guard gets applied.

3. **`rollback --end-fence` asks the direct question: the legacy branch ends this record's fence when the tree carries none of this migration's control state.** `idleFence` keeps every condition it has except one:
   - the record is stale;
   - the store is legacy;
   - the fence is `s.rollback.begin_id`;
   - `inspect.pending` is null;
   - `journal/` is empty;
   - `endLeftFence` also checks that no write lock stands and that the file re-reads as that fence.

   The condition that changes is "no scheduled rollback chunk is stored". It is replaced by the residue check above: the proposal is read at its recorded hash, no `control_path` stands, and no rewritten narrative is at its `after_sha256`. The chunks that landed stay in the messages as evidence ("rollback chunks 2 landed, then the tree was reset"), but they no longer decide. The integral reading: the chunk check was a proxy for "no half-done rollback stands in the tree", which was right for cell C and wrong for this cell. The residue check asks that question directly, from evidence the helper already holds, so cell C and this cell pass one guard and no special case is added.
   - Changes in `hooks/migrate.ts`:
     - `idleFence`, renamed if the executor finds a clearer name, takes the residue check;
     - `endFenceWay` and the `note=` line of `endLeftFence` stop saying "no rollback chunk landed under it";
     - the `asideBegan` message in `preconditions` stops saying "once no rollback chunk of that record landed";
     - the header's `## Ending a fence over a legacy tree` changes accordingly.

     Elsewhere: the `rollback --end-fence` lines in `bin/fusion-migrate`'s header, the `migrate.ts` row of `README-hooks.md`, and the last clause of `docs/upgrading-to-v13.md` `**Undo.**`.
   - Pros: the user gets a way out that is checked in code. No new subcommand and no codec change. It is the write path the user already ruled safe for cell C (261016-1436, option 1), widened by evidence rather than by an exception. The guard gets stricter for cell C as well. A tree a git reset left carrying any control file of the migration now keeps its fence, where the chunk check alone would have ended it.
   - Cons:
     - The helper's one removal of codec-owned state now covers a fence under which codec writes did land, namely the rollback chunks that are stored. Those writes are no longer in the tree, because git discarded them.
     - The stored answers of the old migration's rollback stay under `ops/`. The probe shows a new `run` is not stopped by them, and no later rollback of the old migration is possible either way, because its plan is gone.
     - The untracked `archive/migrations/<id>/rollback.json` stays, reported by `run` as untracked. This option does not remove it.
   - Risk to a real rollback:
     - Cell A before any reset is current (the plan index stands), so `stale()` excludes it, and it carries control files besides.
     - Cell B is current through chunk 0's answer.
     - Cell D fails the id.
     - A half-done tree made stale by hand fails the residue check.

     Each is a negative row in the plan: the first three are pinned today, the fourth is new.
   - Test: the extended case takes the way out. `rollback --end-fence` exits 0 with `fence-ended=` and `result=legacy`, then `set-aside --consent` exits 0 and `run` exits 0 with `result=json-control`. Negative rows:
     - the same cut with the plan index deleted by hand and no reset, where `--end-fence` exits 5 and the file stays byte-identical;
     - the proposal at other bytes, where it exits 5, byte-identical.

## Constraints

- Under every option, no fence is removed in this cell until a way out this record rules safe is taken. Until then `.json-state/maintenance.json` stays byte-identical across every subcommand the case runs.
- Under every option, `current()`, `setAside()`, `rollback --end-fence`'s refusal, and `run`'s refusal when a record set aside beside it began the fence stop naming a step that refuses in this cell. They name the situation in words: a rollback of this record landed chunks, then the tree was reset. The plan builds this before the ruling.
- Cells A (not reset), B and D keep the behaviour 261016-1436 gave them. Their tests stay green and unchanged.
- `skills/migrate/SKILL.md` stands at 28 997 bytes against the 29 000 cap. Its `ROUTE=stale` line already shows the helper's stderr on exit 5. The way out therefore lives in the helper's stderr under every option, and the skill does not change.
- The codec-side route, `maintenance end` admitted on a legacy store (261016-1436, option 2), is not offered again. It needs a contract change agreed with Prior, and it cannot check ownership. Both reasons hold here unchanged.

## Recommendation

Option 3. Whether this fence still guards anything is a fact about the tree: does any control state of this migration stand? The helper can decide that from the proposal it already keeps under `.json-state/`. The chunk evidence that 261016-1436 relied on was a stand-in for that fact, and this cell is where the stand-in and the fact come apart. Replacing it closes this cell, and also tightens cell C against a reset that left control files behind. It does so with the write path the user already ruled on and no new branch. Option 1 is the right choice if the user does not want the helper to remove a fence under which codec writes once landed, even after git discarded them. It leaves this project shape at a dead end, and it says so honestly. Option 2 hands a reader a check the code can make.

Answered: this record `## Options` — option 2: the messages name the situation, and name the hand deletion of `.json-state/maintenance.json` with the conditions the user checks first (`status` shows `record=stale`, no control file of the migration stands, `.json-state/journal/` is empty); the helper itself removes nothing; ruled by user, Kai Stalmann <ks@qantr.com>
