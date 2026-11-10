The user invoked `/fusion:campaign`. This workflow is the steering session's view above the checkouts of this project and its hand on the campaign record: it shows which checkout holds which work package at the commit the remote stands at, when that checkout last pushed, what the package waits for and how each lane of a campaign stands; it proposes the cut of the live packages into lanes; and it opens, pauses, resumes or ends a campaign, moves a package or reassigns a lane. The overview reads a fetched ref: nothing in the working tree is touched and nothing is merged. The cut and the steering acts read and write this checkout's own working tree, where the steering session plans on its pulled tree.

**The mechanism is not in this body.** The fetch, the read at the commit, the `last_push` rule, the lane view and its seven conditions, the cut's rules, every steering act with its refusals, the notes, the state vocabulary and the exit codes are documented in `bin/fusion-campaign`'s own header, the authoritative text for all of it. What this body carries is the flow and the sentences the user reads.

**`overview` is the sub-command when none is named** (Steps 2 and 3). The others are `cut --checkouts <N>` (Step 4), `lanes` (Step 5) and the six steering acts `open`, `pause`, `resume`, `move`, `reassign` and `end` (Steps 6 and 7). Any other word is no sub-command: say so and stop. **No sub-command here takes `--ref`**: the overview reads the branch's upstream, the cut and the acts read this checkout's tree, and `sync` is the orchestrator's commit-cycle read and is not run from here.

Every user-facing sentence below is rendered in the project's chat language (`rules/fusion-workbench-conventions.md` `## Project language`).

## Step 0: roots and paths

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root"
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" campaign
```

If the first exits non-zero, halt with *No fusion workbench found above `$(pwd)`. Run `/fusion:setup` once at the project root first.* Do not create one from here.

Hold the resolver's `KEY=value` output: `$SCAN_CAMPAIGNS` and `$OUT_CAMPAIGN` are the only correct spelling of the campaign store in this body. No sub-command passes either on, because the helper finds the store itself, at the commit or in the working tree. On a non-zero exit read the code before acting; the table is in `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes.

## Step 1: the helper has to be there

```bash
[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-campaign" ] && echo present || echo missing
```

On `missing`, say this and stop:

> *`/fusion:campaign` needs `bin/fusion-campaign`, and the installed copy of fusion does not carry it yet. Run `fusion --update`, then restart the session.*

**Never improvise the mechanism on that branch.** No hand-rolled fetch, no `git log`, no reading or editing a record in the working tree.

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
