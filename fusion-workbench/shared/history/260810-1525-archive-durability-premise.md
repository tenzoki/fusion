# Archive's durability promise gets its condition back

**Agent:** coder
**Session:** dispatched by orchestrator, session `260810-1402`, Turn 1, task `I:260801-1020-archive-premise` (task 22 in `tasklist.md`)
**Status:** Complete
**HEAD at start:** `430d73a` (dispatch). Two other agents were working in this repository concurrently, on `agents/orchestrator.md` and on `hooks/tracker.ts` + `hooks/lib/churn.ts`; neither touched this file set.

---

## What was asked

Close the still-live part of defect record
`260801-1020_*_workbench-untracked-breaks-archive-durability-premise.md`.

Most of that record had already dissolved. It was filed when this repository's workbench was
neither tracked nor gitignored; the workbench is tracked since `e8988d9` (260801) and `CLAUDE.md`
was corrected on 260807 to say so. Its consequences 1–3 (archive's premise fails *here*, the
workbench has no history of its own, a permanently dirty `git status`) therefore no longer hold for
this repository and were not re-argued.

What survived was never about this repository. `skills/archive/SKILL.md:9` promised, without
condition, that archives are "moved, not copied — so the live workbench stays focused while git
preserves the bytes". fusion ships no `.gitignore` rule for consuming projects, so a consumer's
workbench may be tracked, ignored, or neither, and in two of those three states an archive move is
the only copy of the artifact. The skill's collision guard protects against overwrite, not against
that.

## What was changed

One file: `skills/archive/SKILL.md`, the intro at `:9`.

1. **The durability clause left the premise sentence.** It now ends at "so the live workbench stays
   focused" — the part that is true in all three states.

2. **A following paragraph states the condition**, in the form
   `rules/fusion-workbench-conventions.md` `## Which of them a tracked workbench tracks` already
   governs ("no skill may promise that git holds its bytes — that promise is available only for the
   [record] group, and only where the project tracks the workbench"). The paragraph names the
   three possible states, cites that section, and says plainly what follows where the project does
   not track: the archive folder is the **only** copy of every artifact this skill moves, Step 7's
   collision guard prevents an overwrite, and nothing after that prevents a loss.

The wording was reused from the governing rule rather than invented, as dispatched.

## What was deliberately not changed

- **`rules/fusion-workbench-conventions.md`.** Another task in this session's queue owns it.
- **The `CLAUDE.md` correction of 260807.** Untouched.
- **Step 9's report line (`:219`).** It already tells the user archives are local and not committed
  automatically, and that they can `git add` the archive directory. That is conditional in the right
  direction and needed no change.
- **No detection step was added.** The dispatch asked for the sentence to be safe to read, not for
  the skill to probe `git ls-files` at run time. A first draft carried such an instruction and was
  removed as scope creep before verification.

## Verification

| # | Acceptance criterion | How it was checked |
|---|---|---|
| 1 | The premise sentence states its condition or drops the claim | Both: the clause is gone from `:9` and the condition is stated in the paragraph below it. |
| 2 | An untracked-workbench reader is not told the bytes are safe | The new paragraph says the archive folder is the only copy in that state, in bold, before any step runs. |
| 3 | The `CLAUDE.md` correction is not undone | `CLAUDE.md` is not in this task's file set and `git status` shows it unmodified. |
| 4 | Repeat occurrences fixed | Grepped the skill body for `git`, `preserv`, `durab`, `byte`, `recover`, `reversib`, `undo`, `lost`, `loss`, `safe`, `version control`, `track`. `:9` was the only unconditional promise. |
| 5 | `cd hooks && npm test` | **exit 1** — 40 files, 1067 tests, 1 failed, 258s. The single failure is `fusion-commit-lock.test.ts`, "a creator reaped between mkdir and its holder write loses the acquisition instead of overwriting the waiter's holder". See below. |

**The one failing test is task 32, not this change.** It asserts a *transient* state — that a poll observes the lock directory in the window between `mkdir` and the holder write (`fusion-commit-lock.test.ts:196`, `expected false to be true`) — against a wall-clock threshold. Under CPU contention the window closes before the poll sees it. Re-run alone it still failed (21.6s, 9 of 10 passing), so on this machine at this moment it is not a *load* flake in the narrow sense; two other agents were running their own suites and edits concurrently throughout. It cannot be reached from this task's file set: the test drives `bin/fusion-commit-lock` against a project root it builds under `mkdtemp`, and this change touched one skill body and three workbench markdown files. The same case failed for the previous task in this session (`260810-1511-setup-step-5-guarded-helper-call.md-…`) and passed on its clean re-run.

Two earlier full runs in this session also failed tests that were **other agents' work in flight**, and both cleared without any action here: `reference-resolution-lint` flagged two dangling citations in `docs/plane-setup.md` (that agent had put literal record filenames in an illustrative passage and replaced them with `<stamp>` placeholders minutes later), and `clear-halt-concurrent-halt` failed while `hooks/tracker.ts` and `hooks/lib/churn.ts` were mid-edit. Both pass in the run reported above. Reading a full-suite result in this repository right now requires knowing which files are moving under it.

## Files changed

- `/Users/k1/Projects/productive/fusion/skills/archive/SKILL.md`
- `/Users/k1/Projects/productive/fusion/260801-1020_*_workbench-untracked-breaks-archive-durability-premise.md` (`Resolved:` note appended; marker left `_o_` for the orchestrator to rename after the commit)
