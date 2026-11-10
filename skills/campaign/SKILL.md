---
description: Steer a campaign over the checkouts of one project. Show which checkout holds which work package at the commit the remote stands at, when it last pushed, what the package waits for and how each lane stands, read out of a fetched ref; propose the cut of the live packages into lanes; open, pause, resume or end a campaign, move a package or reassign a lane. Use when the user asks who is working on what across checkouts, or wants to steer a campaign.
argument-hint: "[overview [--window <hours>] | cut --checkouts <N> | lanes | open | pause | resume | move | reassign | end]"
allowed-tools: [Bash, Read, AskUserQuestion]
---

# Fusion campaign (the view above the checkouts)

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

## Step 3: render the overview

Whole sentences in the user's terms (`rules/user-facing-output.md`): no `key=` token and no state word of the helper. A package is called by its name and never "work package" or "claim"; a checkout by its alias, or by its eight hex characters where the alias is `-`; a lane by its id; a time as an age in words ("3 hours ago"). In this order:

1. **What the user can do now.** A held package that waits on a decision: name the decision as the thing to answer. A condition below that names an act (a move, a reassignment, a hand-off to pass on, a checkout to ask): name it here. With none, say that nothing needs doing.
2. **Where the picture comes from**: the ref, the commit's short hash, and `age_minutes` in words as the last push by any checkout, e.g. *`origin/main` at `eab05b1`: the last push by any checkout was 3 hours ago.* Nothing below is newer than that.
3. **One sentence per `held=` line**: who holds what, when that checkout last pushed, and what the package waits for. `edge:<name>` is other work that has to finish first and `decision:<name>` a decision still open, each named; `none` is said as waiting for nothing. A `last_push` of `none` means no push of that checkout can be read at the commit, never that it has not pushed. Where a time is shown, say once that it is the earliest the last push can have been, so a newer push may not show yet. No `held=` line is an answer: nobody holds anything at that commit.
4. **Campaigns.** `campaigns=0`: no campaign is running. One sentence per `campaign=` line: the campaign's name, whether it is running, paused (with its reason) or has ended (with its outcome), and how many lanes it has, or that its lanes are still to be cut. A `campaign-unreadable=` line: that campaign's record could not be read at the commit, the reason in words, so nothing below is said about it.
5. **One sentence per `lane=` line**, for a running or paused campaign: the lane, the checkout it is assigned to (or that none is), what that checkout holds, and the next package in the lane with what it waits for, or that nothing is next.
6. **The seven conditions**, each printed only when it holds, each in a sentence naming the thing in the user's project and what the user can do:
   - `silent=`: that lane's checkout holds nothing and has not pushed within the window, or no push of it can be read: ask that checkout, or reassign its lane.
   - `out-of-lane=`: that checkout holds a package that stands in another lane (the holder's own lane named where it has one): move the package into the holder's lane, or reassign the lane to that checkout.
   - `in-no-lane=`: that checkout holds a package no lane of any running campaign names: move it into a lane, or leave it outside the campaign on purpose.
   - `waits-decision=`: the next package of that lane waits on an open decision: name the decision as the thing to answer.
   - `handoff-possible=`: work in one lane has finished that a package in another lane was waiting for: tell that lane's checkout it can start.
   - `cross-lane=`: a commit by one lane's checkout changed a file inside another lane's area: name the commit, the file and the two lanes; the user decides whether the declared area or the lane is wrong.
   - `unconfirmed=`: that lane's checkout has not yet read the campaign as it now stands; it does so at its next commit. Where its last confirmation is shown and old, ask whether it is still working.
7. **Every other `note=` line in a sentence of its own**, because each is a degradation that changed the answer: `commit-rows-unmatched` (that many newer commits of that checkout were not found on the ref, the newest at that time, so its last push may be later than shown), `no-commit-rows` (no commit of that checkout is on record at the commit), `event-log-untracked` (the project does not track its event log there, so no last push can be read for anybody), `log-lines-unreadable` (that many lines of the event log were left out), `registry-unreadable` (the name of that checkout could not be looked up), `package-unreadable` (that package's record could not be read, so if somebody holds it, it is missing above), `lane-member-unknown` (a lane names a package the workbench does not list, so it was left out of that lane), `commit-unattributed` (a commit that touched a declared area could not be attributed to a checkout, so nothing was said about it under the conditions), `campaign-first-commit-unknown` (no commit adds that campaign's record, so its commits were not checked against the lanes), `local-ref` (the ref is local, nothing was fetched, and the picture is as current as that ref).
8. **The window.** `window_hours` is named in every sentence that depends on it, which is the silence sentence: say once which window applied.

## Step 4: `cut --checkouts <N>`

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-campaign" cut --checkouts <N> <--tolerance and its value, when the user gave one>; echo "exit=$?"
```

The cut reads this checkout's working tree, fetches nothing and writes one proposal file, nothing else. Exit 0 continues. **exit 2**: `<N>` is no whole number above zero, or the tolerance none from zero: say so. **exit 4**: the workbench in the working tree was not read; quote the stderr line. Exits 1 and 3 as in Step 2.

Render the page in the user's terms, in this order:

- **`lane=` rows**: per lane, the packages that go into it, in the order they are worked, prerequisites first. Two packages that work in the same part of the project always land in one lane.
- **`handoff=` rows**: work that passes from one lane to another: the package that has to finish first, the one that waits for it, and the two lanes.
- **`imbalance=` rows**: a lane holding more than the cut allows, because packages whose declared areas overlap are never split: name the lane, its size and the packages. The user accepts it, takes a file several packages share out of a package's declared areas, or changes the number of checkouts.
- **`no-areas=` rows and `no-areas-count=`**: the packages that declare no area of the project, so the cut cannot keep them apart from anybody: name them. An area is declared per package with `"$FUSION_PLUGIN_ROOT/bin/fusion-write" set-resources --record <its control path> --path <path> --actor user`, `--path` repeatable, each a path relative to the project root without a trailing slash and covering everything under it, on the user's confirmation and never from the brief. Say once, here: a package with declared areas is read only by this version of fusion, as a campaign record is, so areas are declared and a campaign is opened only once every checkout of the project runs it; in a workbench a Prior host also reads, only after Prior has re-pinned the codec. An older reader refuses such a package by name, not silently.
- **`delta-plus=` and `delta-minus=` rows**: what one checkout more or fewer would change: which packages change lane, and which hand-offs appear or disappear. At one checkout there is no `delta-minus=`.

End with the `proposal=` path: the proposal stands in that file, a second run with the same parameters replaces it, and **nothing is written to the workbench until the user confirms the proposal in Step 5.**

## Step 5: `lanes`

The user names the proposal to take, the `proposal=` path of a cut they confirmed, and which checkout works which lane, each by its eight hex characters (`"$FUSION_PLUGIN_ROOT/bin/fusion-identity"` prints a checkout's own as `CHECKOUT=`; the overview's `held=` lines name the others). A lane the user assigns nobody keeps no checkout. Say in a sentence which lanes, packages and checkouts will be written and ask once before running:

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-campaign" lanes --from <proposal file> <--assign lane-<n>=<hex>, one per assigned lane> <--campaign <id>, when more than one campaign is live>; echo "exit=$?"
```

Exit 0 prints `path=` and `revision=`: report that the lanes are written. **Then one question, with these three options and no fourth**: put it as a dialog with `AskUserQuestion` where the host renders one, else as a numbered list in the chat, in these words:

> The lanes are written. Shall every package in a lane run autonomously, with the campaign as the recorded source of that word?
> 1. Yes: set `mode` `autonomous` on every lane member now, in one act.
> 2. No: leave every package's mode as it is.
> 3. Stop here.

On 1, per lane member, `<control path>` its package's control path (the `path` of the overview's package rows, or of the codec's `list`), `<path>` the `path=` the write printed and `<revision>` its `revision=` value:

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-write" set-mode --record <control path> --value autonomous --source '{"kind":"user-word","ref":{"kind":"other","path":"<path>","sha256":"<revision>"}}' --actor user; echo "exit=$?"
```

Report the members set, and any the codec refused by name with the `fusion-write:` line. On 2 and 3 nothing more is written. A write that printed `state=` instead of `path=`: Step 7.

End with the two sentences every steering report ends with: the lanes reach a working session at the holding session's next commit, with no time given; and the record travels with your next commit and push, so until then no other checkout sees it.

## Step 6: `open`, `pause`, `resume`, `move`, `reassign`, `end`

Each is one act on the campaign record in this checkout's working tree, confirmed once before it runs: say in a sentence what will be written, ask, then run. The flags are the helper's (`bin/fusion-campaign`, `## The steering writes`); `--campaign <id>` is needed only where more than one campaign is live. Each line is followed by `; echo "exit=$?"`.

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-campaign" open --id "$(date +%y%m%d-%H%M)-<slug>" --objective <text> --authorisation <citation> <--stop <text>, one per stop condition>
"$FUSION_PLUGIN_ROOT/bin/fusion-campaign" pause --reason <text>
"$FUSION_PLUGIN_ROOT/bin/fusion-campaign" resume
"$FUSION_PLUGIN_ROOT/bin/fusion-campaign" move <package> --to <lane>
"$FUSION_PLUGIN_ROOT/bin/fusion-campaign" reassign <lane> --checkout <hex>
"$FUSION_PLUGIN_ROOT/bin/fusion-campaign" end --outcome <completed|bounded|failed|cancelled> <--reason <text>, when the user gave one> <on completed: the evidence flags below>
```

`open` takes the objective, the citation of what authorises the campaign and each stop condition from the user's words; a stop condition the user did not state is not invented. `end` on `completed` asks the user which of the four hold, the objective met, the intake closed, every attempt terminal, the final audit passed, and passes `--objective-met`, `--intake-closed`, `--all-attempts-terminal` and `--final-audit-passed` for each yes, `--watermark` and `--audit-ref` where the user names them.

Exit 0 prints `path=` and `revision=`. Report the act in a sentence (the campaign is open; paused, with the reason; running again; the package stands in that lane; the lane is that checkout's; the campaign has ended with that outcome), then end every such report with two sentences: **the act reaches a working session at the holding session's next commit**, and no time is given for that; and the record travels with your next commit and push, so until then no other checkout sees it.

## Step 7: the two refusals of a write

Read `state=`, not the exit code, and define none. Both mean that nothing was written.

- `state=holds-package`, with `held=`: this checkout is working on a package itself, so it cannot steer. Say which package, and that a steering act runs from a checkout holding none, or after the package is released.
- `state=refused`, with `refused=<class>/<reason>`: say what the reason means in the user's project. `campaign-exists`: a campaign of that name is already there. `campaign-not-running`, `campaign-not-paused`, `campaign-not-live`: the act does not fit the campaign's state; name the state. `campaign-terminal`: that campaign has ended. `package-unknown`, `lane-unknown`: no such package or lane; name what was given. `no-lanes`: the lanes are not cut yet (Steps 4 and 5). `package-already-in-lane`: it stands there already. `duplicate-lane-checkout`: that checkout already works another lane. `revision-moved`: the record changed since it was read; run the overview and try again. `proposal-unreadable`: the file is no proposal. Any other: quote the line and the stderr.

Exits 1, 3 and 4 as in Step 4. **exit 2** is a value outside the helper's grammar, an id that is not `YYMMDD-HHMM-<slug>`, a checkout that is not eight lowercase hex characters, an outcome outside the four, an evidence flag on another outcome, or a usage fault of this body: say which.
