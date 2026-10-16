# How does a migration session whose record the tree no longer carries get out of the way?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261016-0246-plan-migrate-step-7-a-way-out-of-a-stale-session-and-the-helper-path.md`, `261015-2223-migrate-step-7-routes-a-stale-done-session-over-a-legacy-tree-to-interrupted-where-neither-option-gets-out.md`, `261015-2223-reviewer-closing-pass-over-the-migrate-step-7-package.md`, `261016-0236-migrate-step-7-stale-session-and-helper-path.md`

---

## Question

`bin/fusion-migrate` keeps its session under `$HOME/.fusion-migrate/<12 hex of the workbench path>`. The session is keyed by machine and path, not by tree. When git puts the tree back to before a migration, the session still records the migration as done. `resume` then reports a no-op that is false about the tree, `rollback` is refused with exit 8 on every try, and `run` no-ops. The only way out is to remove the session directory or pass `--session`, and nothing says so.

The plan cited above makes the helper decide whether the session's record describes the tree, from tree evidence of the record's last write. `status` prints the answer, and `run`, `resume` and `rollback` refuse a stale record before they write anything. That part needs no ruling. What needs one is what then gets the stale record out of the way. Every option below either widens the helper's public contract or lets an agent move a directory the helper owns. That is a choice for the user, so it is a record and not a plan bullet. The reviewer's closing pass said the same thing: decide first whether the helper contract may widen.

Measured by the planner on 2026-10-16 in a scratch git repository over a copy of `codec/fixtures/legacy-v12/workbench`, with a private `HOME`: `run`, commit, `git reset --hard HEAD~1`. `status` printed `state=legacy`, `done=true` and `rolled_back=false`. `resume` printed `result=no-op`, `rollback` exited 8 with `conflict/plan-file-changed`, and `run` printed `result=no-op`. **The refused `rollback` had written `rollback: {begin_id, end_id}` into `state.json`.** After a single undo attempt, then, the stale cell has the same session fields as a rollback that was really interrupted. The reviewer's suggested discriminator (`status` prints whether a rollback is in flight) cannot tell the two apart once the user has tried undo. That is why the plan decides from the tree. **A fresh session gets out:** `run --session <new dir>` over the same reset tree exited 0 with `result=json-control`, reusing the migration id `migration-20261016-v12`. So moving the record aside is enough, and nothing in the tree needs repair.

## Options

1. **A helper subcommand moves the record aside.** `bin/fusion-migrate set-aside --consent` refuses unless `status` would print `record=stale`. It renames the session directory to `<dir>.stale-<UTC stamp>` beside it, so nothing is deleted and the backup and repair log stay readable. `run`, `resume` and `rollback` refuse a stale record with exit 5 and name this subcommand. Step 7 gets a `ROUTE=stale` line that says what the record claims and what the tree shows, and asks the user. On a yes it runs `set-aside --consent` and then the survey block again.
   - Pros: the helper owns the session layout and the guard. The move cannot happen to a record that is current, so an in-flight run's operation ids cannot be thrown away by misreading `status`. It is tested in the helper's own test file, like every other subcommand. It follows the existing pattern, where an exit's stderr names the way out (`rollback --end-fence`).
   - Cons: the helper's contract widens by one subcommand. Its header, its usage range (`sed -n '3,13p'`), the `case` list, `TAKES` in `hooks/migrate.ts`, and two rows of `README-hooks.md` all move.
2. **The skill names the move and the agent makes it.** The helper changes as in option 1, except for the subcommand: `status` prints `record=`, and `run`, `resume` and `rollback` refuse a stale record, naming the session directory and `--session`. Step 7's `ROUTE=stale` line asks the user, and on a yes the agent runs `mv "<session>" "<session>.stale-<stamp>"` with the path taken from `session=`.
   - Pros: no new subcommand. The helper's contract grows by one `status` line and one refusal.
   - Cons: a skill agent moves a directory under `$HOME` that only the helper should know the shape of. The guard (move only a stale record) is prose the agent has to obey, not code. A misread puts an in-flight run's ids out of reach, and the next `run` then starts a second plan, which `**Interrupted.**` forbids. It needs more skill bytes than option 1, because the command and its conditions are spelled out in `skills/migrate/SKILL.md`, which is under its growth bound.
3. **`run` sets a stale record aside itself.** `run` over a stale record renames the session directory as in option 1, without asking, and migrates. `resume` and `rollback` refuse and name `run`.
   - Pros: no new subcommand and no question. A re-run of `/fusion:migrate` simply works.
   - Cons: `run` changes its documented "A second run sends nothing" and acts on session state with no explicit consent. A user who reset the tree in order to stay on Markdown is still asked by Step 7's question to migrate, but the old record has already been moved by then. It mixes two acts in one subcommand, so a refusal later in `run` leaves the move done and the migration not.

## Constraints

- `skills/migrate/SKILL.md` stands at 28 530 bytes under the skills growth bound. A red bound is answered by a cut, never by a baseline or head-room edit (`README-hooks.md` `### Growth bounds on the shipped text`).
- Step 7's guardrail says "Move only; never copy, never delete". Every option moves and none deletes.
- Plan steps 1 and 2 (reproduce, then the helper's stale-record check) do not wait on this answer. Steps 3 onward do, because the refusal text, the skill route and the documentation name the way out.

## Recommendation

Option 1. The question "may this record be moved?" is decided by the same code that prints `record=stale`, so it cannot drift from it, and an agent never has to obey a guard on a path it only reads. The widening is one subcommand with one precondition. Option 2 is the alternative if the user wants the helper contract to grow by a single `status` line only, at the cost of an unguarded move in prose. Option 3 drops the consent this skill asks for everywhere else.

Answered: this record `## Options` — option 1: a new guarded helper subcommand, `bin/fusion-migrate set-aside --consent`, refuses unless the record is stale and renames the session directory aside, deleting nothing; Step 7 asks the user before calling it. A consultant pass weighed option 3 against it: a predicate misfire would silently set aside a real rollback in flight; ruled by user, Kai Stalmann <ks@qantr.com>

Implemented: option 1 — `hooks/migrate.ts` `setAside()` and `current()`, the `set-aside` subcommand in `bin/fusion-migrate`, the exit-5 refusals in `run`, `resume` and `rollback`, and the `ROUTE=stale` line in `skills/migrate/SKILL.md` `## Step 7 — Repair, then migrate to JSON control`, `**Survey.**`, which asks the user before calling it; regression cases in `hooks/lib/__tests__/migrate.test.ts` and `hooks/lib/__tests__/store-name-migration.test.ts`.
