# How is a rollback fence ended that a git reset left standing over a tree that is legacy again?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261016-1052-a-rollback-fence-left-in-json-state-survives-a-git-reset-and-set-aside-then-leads-to-a-run-that-refuses-for-good.md`, `261016-1052-reviewer-closing-pass-over-the-migrate-step-7-stale-session-package.md`, `261016-0246-how-does-a-migration-session-whose-record-the-tree-no-longer-carries-get-out-of-the-way.md`, `261016-1431-migrate-rollback-fence-after-reset-and-set-aside-messages.md`

---

## Question

A `rollback` whose first chunk the codec refuses, with no work stored since the plan, leaves its fence standing in `.json-state/maintenance.json` (`hooks/migrate.ts` `refusedFirstChunk`). The message names two ways out, `rollback` again or `rollback --end-fence`, and both need a store under JSON control. `.json-state/` ignores itself, so a `git reset` back to Markdown keeps the fence. After that the store is legacy, and on a legacy store the codec admits `maintenance end` only with rollback chunk 0's evidence (`codec/README.md` `## migration`, the paragraph on `maintenance end` on a legacy store; `codec/src/migration.ts` `cleanupEvidence`). This cell has none, because no rollback chunk ever landed. `endLeftFence` requires `state=json-control`. `run`'s preconditions refuse while any fence stands. So `set-aside` succeeds, and every later `run` refuses for good. The only way out is deleting the fence file by hand, and nothing says so. The issue cited above reproduced this.

The choice is which party may end this fence, and on what evidence. Every option either adds a write path to a file the codec owns, changes the codec's contract, or sends the user through git. Whichever is chosen, it must never discard a fence that guards a real half-done rollback. That is the user's decision, so it is a record and not a plan bullet. The planner recommends an option below and does not answer the question.

**Which fences stand over a legacy tree.** The cases are disjoint, and they are complete for a fence whose id this session's record names:

| Cell | Fence | Evidence in `.json-state/` and the tree | Who ends it today |
|---|---|---|---|
| A. A real rollback in flight, after its first chunk and before chunk 0 | `s.rollback.begin_id` | At least one of the record's scheduled rollback chunks is stored under `ops/` or pending under `journal/`. The plan index stands, so `record=current` | `rollback`, which resumes |
| B. A real rollback after chunk 0, before its `end` | `s.rollback.begin_id` | Chunk 0's answer is stored or pending in its intent. `record=current` | `rollback`. The codec admits the `end` on the legacy store |
| C. **The idle fence (this issue)** | `s.rollback.begin_id` | None of the record's scheduled rollback chunks is stored or pending, and no other intent is pending. The plan index is gone, so `record=stale` | nobody |
| D. A fence this record did not begin (the archive helper's, the apply fence of a run before activation, another session's) | any other id | not this record's to judge | its owner, on the tree it set it on |

A and B differ from C by the presence of a rollback chunk answer, stored or pending. Rollback chunk 0 puts its answer in its intent before any plan file goes, and the first chunk after activation is what removes `workbench.json`. So a real rollback reaches a legacy tree only by landing a chunk the record names (`codec/README.md` `## migration`, the rollback bullets). Only C is in question here. A and B keep their ways out unchanged, and D is never this helper's to end.

**What ending C discards.** No codec write landed under the fence. A refusal before the intent writes nothing and stores nothing (`codec/README.md` `## The kernel and the journal`). The migrate host moves no file by hand under its rollback fence. Its one direct file write, `.fusion-setup` from `setup_before`, comes after the last chunk. So the tree is whatever git put back, and the fence guards nothing that a later run could break. The codec's own text admits removing a fence once "a known complete state [is] verified, under the fence" (`codec/src/store.ts` `readFence`, the refusal detail). Every option below rests on that verification. They differ only in who performs it and who performs the removal.

## Options

1. **The helper ends its own idle fence on a legacy store: `rollback --end-fence` widened.** `endLeftFence` keeps its JSON-control branch unchanged and gains a second branch. When the store is legacy, it removes `.json-state/maintenance.json` itself, because the codec refuses every request that could. It does so only when all of these hold, each checked in code:
   - the record is stale;
   - `inspect` names a fence whose id is `s.rollback.begin_id`;
   - `inspect.pending` is null;
   - no scheduled rollback chunk of the record is stored or has a journal directory;
   - `.json-state/write.lock` is absent;
   - the fence file's bytes read as exactly that fence immediately before the unlink.

   It then sets `s.rollback = null` in the session it was called with and prints `fence-ended=<id>` and `result=legacy`. `set-aside` over a stale record refuses while that fence stands and names `rollback --end-fence` first, adding `--session` when the session is not the default. `run`'s fence refusal names `rollback --end-fence --session <dir>` when a sibling `<session>.stale-*` record began that fence. That covers a record a 13.1.4 user already set aside.
   - Changes in `hooks/migrate.ts`: `endLeftFence` (one branch), `setAside` (one refusal), `preconditions` (the sibling lookup in the fence message), `current()` (the way out it names when a fence stands), and the header's account of `--end-fence`. Also `bin/fusion-migrate`'s header lines for `rollback --end-fence`, `set-aside` and exit 5, and the two `README-hooks.md` rows.
   - Pros: no new subcommand and no codec change. `--end-fence` already means "end the fence a refused first rollback chunk left", and this is that fence. Only the helper knows the fence is its own: the session record names `begin_id`, and nothing in `.json-state/` ties a fence to an owner. So the ownership check sits with the party that holds the evidence. The race on the lock is harmless. On a legacy store the codec refuses every mutation, apart from a `plan` (which this fence blocks) and the chunk-0 `end` (which this guard excludes). A request racing the unlink is therefore refused either way.
   - Cons: a second writer of one file under `.json-state/`. The codec writes and removes the fence under its lock, and the helper's removal is not under that lock. The helper already writes `.json-state/migration/<id>.json`, so it is not the first host write there, but it is the first removal of codec-owned state. `bin/fusion-record`'s header and `bin/fusion-archive`'s header say that deleting the fence file is no recovery. Both are written for a lost move inventory, and `readFence`'s detail admits removal after verification. Even so, a reader meets an apparent contradiction unless the helper's header names the verification it performs.
   - Risk to a real rollback: cells A and B fail the "no chunk stored or pending" check, and D fails the id check. Each is pinned by a negative test (below), so a misfire shows up as a red test, not as a lost fence.
   - Test: in `hooks/lib/__tests__/migrate.test.ts`, the issue's steps 1 to 4 (run, commit, edit a narrative, refused `rollback`, `git reset --hard HEAD~1`). Then `set-aside --consent` exits 5 and names `rollback --end-fence`; `rollback --end-fence` exits 0 with `fence-ended=`; `status` prints `fence=-`; `set-aside --consent`, then `run`, exits 0 with `result=json-control`. A second row sets the record aside first, as 13.1.4 allowed, and runs `rollback --end-fence --session <stale dir>` named by `run`'s refusal. Negative rows:
     - (A) a rollback cut after its first chunk, built with the existing kill stand-in on `{phase: "rollback", chunk: 2}`. The tree is legacy and the plan index stands; `rollback --end-fence` exits 5, `maintenance.json` is byte-identical, and `rollback` then finishes with `result=legacy`.
     - (D) a fence begun through `bin/fusion-record` under a fresh id on the migrated tree, then the reset. `rollback --end-fence` exits 5 and the file is byte-identical.

2. **The codec admits the end: a second branch of `maintenance end` on a legacy store.** The codec admits a fresh `end` for the standing fence when the fence's own `begin` answer is stored, no intent is pending, and every stored migration rollback answer is listed in a stored chunk 0's `progress` (no rollback is incomplete anywhere in the store). The helper keeps option 1's ownership check and sends the `end` through the codec. The write stays the codec's, under its lock.
   - Changes: `codec/src/migration.ts` `cleanupEvidence` and its caller; `codec/README.md` `## migration`; `codec/dist/fusion-record.js` (committed); the recorded session `codec/fixtures/protocol-session-migration/`, regenerated under `UPDATE_PROTOCOL_SESSION_MIGRATION=1`, with a new base; `codec/fixtures/prior/REQUESTS.md`, because the current legacy-store rule is "question 51, as Prior answered it", so a change is a request to Prior, which answers in that file. In `hooks/migrate.ts`, `endLeftFence` sends the `end` on a legacy store instead of removing a file, and the `set-aside` and `run` messages change as under option 1.
   - Pros: one writer of `.json-state/` stays one writer. No header has to explain a host removal.
   - Cons: the codec cannot verify ownership. On a reset tree an archive fence looks exactly like an idle rollback fence, so the codec would end either on request. The ownership guard is still the helper's, and the codec branch adds a contract surface without adding a check. It is also the largest change: a codec contract revision, a Prior round-trip, and a regenerated recorded session. The package cannot close until Prior answers.
   - Risk to a real rollback: cells A and B have a stored rollback chunk that no chunk 0 lists (A), or a chunk 0 whose existing branch already admits the `end` (B). A fence of cell D that a caller names is admitted. Only the helper's guard stops that.
   - Test: option 1's rows, plus a codec unit case and a recorded-session exchange for each admitted and refused shape.

3. **Back through git: the helper refuses and names the round trip, and nothing new removes a fence.** `set-aside` over a stale record refuses while the record's own fence stands. Its message, and `run`'s fence refusal when a set-aside sibling began the fence, name the way out:
   1. Check out the commit that carries the migration (`git reflog` shows it).
   2. Run `rollback --end-fence` there (or `rollback` again, once what it named is put back).
   3. Reset back to Markdown, then `set-aside --consent`, then `run`.
   - Changes in `hooks/migrate.ts`: `setAside` (one refusal), `preconditions` (the sibling lookup), `current()` (the message). `endLeftFence` is unchanged. Also the header lines and the README rows as under option 1.
   - Pros: no new write path and no contract change. The fence is ended by the codec on the store it was set on, which is the path that exists and is tested.
   - Cons: the user does a three-part git round trip by hand. It needs the migration commit to still be reachable. A reflog expires, and a migration someone else committed may never have been in this clone's history. In that case the message has nothing to offer but the hand deletion it avoids naming. A user who reset in order to stay on Markdown has to go back to JSON control for a moment. The skill can only point at the stderr, since spelling the round trip out costs bytes `skills/migrate/SKILL.md` does not have.
   - Risk to a real rollback: none. Nothing ends a fence that does not end one today.
   - Test: the issue's steps 1 to 4. `set-aside --consent` exits 5 and names the round trip. The test performs it (`git reset --hard <migrated commit>`, `rollback --end-fence`, `git reset --hard HEAD~1`, `set-aside --consent`, `run`) and `run` exits 0 with `result=json-control`.

4. **Honesty only: refuse, and name the hand deletion with its conditions.** `set-aside` refuses while a fence stands that the record cannot close, and `run`'s fence refusal says that this fence is closed by deleting `.json-state/maintenance.json` once the user has checked that `status` shows `record=stale`, that no rollback chunk is stored, and that no intent is pending. The helper performs nothing.
   - Changes in `hooks/migrate.ts`: `setAside` (one refusal) and the two messages. Nothing else.
   - Pros: the smallest change. It meets the issue's second acceptance branch ("Step 7 does not promise that and names what the user does instead").
   - Cons: the guard is prose a person has to apply, and its conditions are the ones option 1 checks in code. It contradicts the two helper headers' "deleting the fence file is no recovery" more openly than option 1, because it leaves the verification to the reader.
   - Risk to a real rollback: a person who misreads `status` deletes the fence of cell A. Nothing catches that.
   - Test: steps 1 to 4. `set-aside --consent` exits 5 naming the file and its conditions. The test deletes the file and `run` exits 0 with `result=json-control`, which proves the deletion is a way out but not that the guard is applied.

## Constraints

- Never end a fence of cells A, B or D through this path. Each option above names its negative test, and the plan carries them whichever option is chosen.
- `skills/migrate/SKILL.md` stands at 28 998 bytes against the 29 000 cap this line of packages works under. A red growth bound is answered by a cut, never by a baseline or head-room edit (`README-hooks.md` `### Growth bounds on the shipped text`). Every option therefore puts the way out into the helper's stderr. The skill only stops promising and shows that stderr.
- Option-independent, and planned without waiting on this answer: the `ROUTE=stale` line and `docs/upgrading-to-v13.md` stop promising that a re-run continues, and `set-aside` stops moving a record aside while a fence or a pending intent stands that `run` would refuse on. Only the way out each refusal names depends on the answer.
- A pending intent that survives a reset belongs to the same class, according to the issue (an inference it did not reproduce). This record does not decide it. Under every option the refusal names the intent and does not offer to remove it.

## Recommendation

Option 1. Whether this fence may go is answered by the same code that knows the fence is its own and that sees whether any rollback chunk landed, and it is answered from evidence the session and `.json-state/` already hold. It needs no new subcommand: `--end-fence` keeps its meaning and gains the store state it was missing. Option 2 moves the write into the codec but cannot move the ownership check, so it buys lock discipline at the cost of a Prior round trip and a contract branch that guards nothing on its own. Option 3 is the safest and the clumsiest, and it fails whenever the migration commit is gone. It is the right choice if the user wants no fusion code to remove a codec-owned file under any condition. Option 4 leaves to a reader a check that option 1 performs in code.

Answered: this record `## Options` — option 1: `rollback --end-fence` gains a branch for a legacy store and removes `.json-state/maintenance.json` itself, only when the checks in code hold (record stale, fence id matches the record's begin_id, no chunk and no intent stored or pending, no write.lock, bytes re-read first); no new subcommand, no codec change; ruled by user, Kai Stalmann <ks@qantr.com>
