- **exit 5**: there is nothing to read against, and `state=` says which: `no-work-tree` (this project is not a git repository), `no-branch` (detached HEAD, which has no upstream at all), `no-upstream` (this branch tracks nothing, so nobody's messages can reach it), `upstream-unresolved` (an upstream is configured and its ref still does not resolve after the fetch), `workbench-untracked` (this project does not track its workbench, so nothing another checkout wrote can arrive by `git fetch`; whether to track it is the project's own decision, and until it does this command has nothing to read). Name the one that came back, not the list.
- **exit 6**: the fetch did not complete. Pass git's own stderr through to the user unchanged; the causes are git's to explain and a paraphrase loses what the user needs.
- **exit 7**: the workbench is not inside this repository, so no path into it can be derived.
- **exit 2**: a usage fault in this body. Report it as a fusion defect, not as the user's problem.

A `note=` line can accompany any answer, exit 0 included, and it is a degradation that changed the answer rather than a warning to skip. Four occur: this checkout's own entries could not be filtered out, or the mark does not resolve so the whole store reads as new, or the branch tracks a local ref so no fetch was owed and the answer is as local as that ref, or the mark helper is not installed beside the reading one so no mark could be read. Repeat whichever came back to the user in its own sentence.

## Step 3: when nothing is new

**`new=0` is a real answer and never an error.** Say it in words, naming the ref, and stop. Write no mark and ask no pull question.

> *Nothing new on `<ref>` since the last time you looked.*

## Step 4: render every entry

Iterate the `entry=` lines from Step 2, in the order they were printed, which is oldest first; the listing comes from the helper's own output, never a glob (`rules/fusion-workbench-conventions.md` `## Marker globs`).

```bash
