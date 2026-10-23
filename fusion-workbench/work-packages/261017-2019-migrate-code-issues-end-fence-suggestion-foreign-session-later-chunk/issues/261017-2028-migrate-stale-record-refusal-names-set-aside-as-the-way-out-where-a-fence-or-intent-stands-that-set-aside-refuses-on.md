# migrate: the stale-record refusal of `run`, `resume` and `rollback` names `set-aside --consent` as the way out where a fence or an intent stands that `set-aside` then refuses on

---
`current` in `hooks/migrate.ts` refuses a stale record and names the way out: "first, `rollback --end-fence` ends it; then `set-aside --consent` …" where `idleFence` holds, and `set-aside --consent` alone otherwise. `setAside` refuses whenever the record is stale and `standing(i)` holds (a fence or an intent `inspect` reports). So wherever a fence or an intent stands that `idleFence` does not name, the way out `current` prints is a command that then refuses. Cells: a fence this record did not begin over a tree reset with git (cell D of `261016-1436-how-is-a-rollback-fence-ended-that-a-git-reset-left-standing-over-a-legacy-tree.md`), an intent pending, and this record's own idle fence where the session records another workbench path (`idleFence` holds there, but `rollback --end-fence` refuses at `recorded`).
---
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** `261017-1708-migrate-messages-name-end-fence-as-ending-a-fence-it-then-refuses-to-end.md`, `261016-0246-how-does-a-migration-session-whose-record-the-tree-no-longer-carries-get-out-of-the-way.md`

**Evidence (read at `ef64ae79`, inference from the code, not reproduced).**
- `hooks/migrate.ts` `current`: after the `landedFence` branch, `fence = idleFence(wb, s, i)`, and the message is "The way out: " followed by the end-fence step only where `fence !== null`, then `set-aside --consent` in every case.
- `hooks/migrate.ts` `setAside`: `if (shows !== null && standing(i))` throws in every branch, so no rename happens while `inspect` reports a fence or an intent.
- Cell D: `stale` is non-null ("the plan index … is missing or at other bytes"), `ownFence` is null because the fence id is not `s.rollback.begin_id`, so `current` names `set-aside --consent` alone, and `setAside` then refuses with "the tool that set it closes it".
- `hooks/lib/__tests__/migrate.test.ts`, the cell D case, checks only `rollback --end-fence`, not the text `run`, `resume` or `rollback` print.

**Reach.** Each refusal is accurate and writes nothing; only the way out named is wrong. Cell D needs a foreign fence begun after a migration, then a reset.

**Acceptance.** No refusal from `current` names `set-aside --consent` while `standing(i)` holds, unless the same message first names a step that ends what stands, and that step's own checks pass on the record it names. Cell D's `run` refusal is pinned by a test.

---
Resolved: 2026-10-23 by code-implementer (plan 261017-2030-plan-migrate-code-issues-end-fence-suggestion-foreign-session-later-chunk.md, steps 5 and 6). `current` in `hooks/migrate.ts` names `set-aside --consent` only where nothing stands, or after an end-fence step that `endFenceEnds` admits; for a fence this record did not begin it says that set-aside refuses while the fence stands and points to `status`. Cell D reproduced red before the fix and is pinned in `hooks/lib/__tests__/migrate.test.ts` by "cell D: run, resume and rollback name no set-aside --consent while the fence stands, and set-aside refuses".
