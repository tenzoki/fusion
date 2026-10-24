## Staging check

Every record this session authors lands under `fusion-workbench/`, and a record survives the session only if a commit carries it. Step 4's staging rule is a **shape** — every path passed to `git add` is one you wrote out yourself — and that shape is what makes over-staging impossible. It is also what makes under-staging invisible: **a file nobody names is a file nobody commits.**

Measured here. A queue rebuild and its history entry sat in the working tree for eighteen commits. Nothing lost them, and nothing would have noticed if something had: `git checkout -- fusion-workbench/` restores an older file over a newer one, `git clean -xdf` takes an untracked history file, and both are ordinary commands. It predated the range's first commit, so no staging list named it: a gap in the mechanism, not carelessness. The record is fusion's own `260811-0114_*_the-queue-rebuild-and-its-history-file-never-entered-a-commit-and-survive-only-in-the-working-tree.md`.

**Do not answer it by widening `git add`.** The opposite defect is measured here too: a `git add -u` given the directory a batch of records had just been renamed inside staged three deletions and added nothing, and three `_o_` records left HEAD until the repair commit `f38f37d`. The shape stays exactly as Step 4 states it — no `-A`, no `-u`, no directory argument, no glob, no `.`. What changes is that the **result** is now measured.

**Run the helper at two points** — at Step 4 item 7, and at the end of the session before the report:

```bash
if [ -x "$FUSION_PLUGIN_ROOT/bin/fusion-staging-drift" ]; then
  "$FUSION_PLUGIN_ROOT/bin/fusion-staging-drift"
else
  echo "fusion: no bin/fusion-staging-drift in the installed plugin at $FUSION_PLUGIN_ROOT — no staging read taken" >&2
fi
```

The `[ -x ]` guard is the one the coverage read carries, for the same reason.

It prints `anchor=`, `head=`, `rows=`, `unstaged=` and `verdict=`, then **one line per entry under the workbench, in four classes**. Two of them are yours to act on and two are deliberately not:

| Class | What it is | What you do |
|---|---|---|
| `record` | an artefact no commit carries — a work package, anything under an artefact store, or a control file the codec wrote beside one | add it to the next staging list, written out in full and absolute. `PAIR-SPLIT` in place of `UNSTAGED` names a pair whose other half is staged: stage this half in the same commit |
| `commit-message` | a commit-message-shaped **name** that no artefact store owns — the class the improvised `.commit-msg-tmp` lands in | read the file first. A leftover commit message: delete it, and write the next one to the `/tmp` path Step 4 item 3 names. Anything a session authored: name the file to the user and stage it. **Do not delete on the class alone** — this is the one class decided by a name rather than a location, so a false positive can enter it, and a deletion is not recoverable (issue `260811-1141_*_any-workbench-file-whose-name-contains-commit-message-is-classified-as-a-commit-message-and-the-model-is-told-to-delete-it.md`) |
| `in-flight` | live state and the machine-written surfaces — the event log, `.guard-state/`, `.json-state/`, `workbench.json`, the setup marker | **nothing.** These are in flight by construction; a report about them would fire on every commit and mean nothing |
| `unclassified` | anything else under the workbench — a user's own note file, a frozen snapshot | **nothing, and do not file an issue about it.** The helper names it and says in the same line that it is not a record store and nothing is claimed about it |

The complete listing and the narrow alarm are one design, not a compromise. A check silent about a file leaves you to discover it some other way, which is the shape of the defect; a check that shouts about every file is one you learn to read past, which is issue `260810-0710_*_the-drift-checks-last-line-makes-the-whole-block-exit-non-zero-when-no-circle-is-active.md` arriving here. Only `record` and `commit-message` rows reach `verdict=`.

**`verdict=unstaged` is a line of output, never an exit code and never a blocker** — exit 0 means the check ran, exit 2 means there is no workbench, exit 3 means the installed plugin has no compiled hooks.

**When a `record` row appears, name it to the user in one line and carry it into the next commit's staging list.** A record left over from an *earlier* commit appearing here is a miss, not old news — the eighteen-commit case looked exactly like this at every one of the eighteen, and the reason it was never acted on is that nobody was looking.

**What runs whether or not you read this section.** `hooks/tracker.ts` runs the same measurement on the tool call where **HEAD moved** — the commit itself — names the missed records back to you in the tool result, and records a `staging_drift` event under `.guard-state/`, which you do not need to emit a second time. The trigger is read out of the repository with `git rev-parse`, never out of the command's text: deciding from a shell string whether it will move HEAD is the undecidable question the write-path classifier answered until v6.0.0 and the git branch policy answered wrong 24 consecutive times before it was deleted.

**What this is, honestly.** The measurement is executed and the staging is not, and that split is deliberate rather than unfinished. Nothing here adds a path to the index on your behalf, because a mechanism that did would be a second author of the staging list — and the shape's whole value is that every path in it was written out by the party who knows why it belongs there. So this makes a missed record impossible not to notice; it cannot commit it. That step is yours, and skipping it now leaves a `staging_drift` event in a log that outlives your session.
