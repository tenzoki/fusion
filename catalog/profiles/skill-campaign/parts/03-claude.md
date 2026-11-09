The user invoked `/fusion:campaign`. This workflow shows which checkout of this project holds which work package at the commit the remote stands at, when that checkout last pushed and what the package waits for. It reads a fetched ref: nothing in the working tree is touched and nothing is merged.

**The mechanism is not in this body.** The fetch, the read at the commit, the `last_push` rule, the notes, the state vocabulary and the exit codes are documented in `bin/fusion-campaign`'s own header, the authoritative text for all of it. What this body carries is the flow and the sentences the user reads.

**`overview` is the sub-command, also when none is named.** `cut`, `open`, `lanes`, `pause`, `resume`, `move`, `reassign` and `end` arrive with a later version: asked for one of them, say in one sentence that this version shows the overview only, and stop, running nothing. Any other word is no sub-command: say so and stop.

Every user-facing sentence below is rendered in the project's chat language (`rules/fusion-workbench-conventions.md` `## Project language`).

## Step 0: roots and paths

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root"
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" campaign
```

If the first exits non-zero, halt with *No fusion workbench found above `$(pwd)`. Run `/fusion:setup` once at the project root first.* Do not create one from here.

Hold the resolver's `KEY=value` output: `$SCAN_CAMPAIGNS` and `$OUT_CAMPAIGN` are the only correct spelling of the campaign store in this body. The overview passes neither on, because the helper reads the store at the commit itself. On a non-zero exit read the code before acting; the table is in `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes.

## Step 1: the helper has to be there

```bash
[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-campaign" ] && echo present || echo missing
```

On `missing`, say this and stop:

> *`/fusion:campaign` needs `bin/fusion-campaign`, and the installed copy of fusion does not carry it yet. Run `fusion --update`, then restart the session.*

**Never improvise the mechanism on that branch.** No hand-rolled fetch, no `git log`, no reading a store out of the working tree.

## Step 2: run the overview

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-campaign" overview <--window and its value, when the user gave one>; echo "exit=$?"
```

The window is passed through unchecked; the helper is its only validator. Exit 0 is the only case that continues. For every other, say one plain sentence naming what could not be done, and stop. A read that failed is never reported as "nobody holds anything".

- **exit 1**: the helper itself could not run; quote its stderr line. Where that names a missing file of the install, the remedy is `fusion --update` and a restart.
- **exit 2**: with a window given, it is no whole number of hours above zero: say so. With none, a usage fault in this body: report it as a fusion defect, not as the user's problem.
- **exit 3**: no workbench above here. Run `/fusion:setup`.
- **exit 4**: the workbench as that commit holds it was not read; quote the stderr line.
- **exit 5**: there is nothing to read against, and `state=` says which: `no-work-tree` (this project is not a git repository), `no-branch` (detached HEAD, which has no upstream), `no-upstream` (this branch tracks no remote branch, so there is no remote commit to read for it), `upstream-unresolved` (the upstream names no commit even after the fetch), `workbench-untracked` (this project does not track its workbench at that commit, so what another checkout holds cannot arrive by fetch). Name the one that came back, not the list, with the `branch=` or `ref=` printed under it.
- **exit 6**: the fetch did not complete. Pass git's own stderr through to the user unchanged.
- **exit 7**: the workbench lies outside this repository, so no commit holds it.
