
# Migrate a workbench to the current format

This workflow brings a workbench to the **v12 store names** (Steps 1 to 6), then to **JSON control** (Step 7). Three stores were renamed at `12.0.0`:

| From | To |
|---|---|
| `circles/` | `work-packages/` |
| `shared/planning/`, and `planning/` inside every container | `plans/` in the same place |
| `shared/consult/` | `shared/consultations/` |

**Directories move; no file changes.** Every file keeps its basename and its bytes, so every storeless citation resolves after the move exactly as before (`rules/fusion-workbench-conventions.md` `## Filename Patterns`), and the migration commit is renames only. `archive/`, the frozen stores, the Review-class stores, `stilwerk/` and every root file stay where they stand; the survey names each one, with the decision record that holds its question where one does.

Run it once after updating to `12.0.0` or later. It is idempotent and resumable: on a workbench already in the v12 format it renames nothing and asks only about citations the sweep still counts; after an interruption the next run continues from what the filesystem holds.

