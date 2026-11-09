---
description: Show which checkout holds which work package at the commit the remote stands at, when it last pushed and what the package waits for, read out of a fetched ref. Use when the user asks who is working on what across checkouts, or how a campaign stands.
argument-hint: "[overview] [--window <hours>]"
allowed-tools: [Bash, Read, AskUserQuestion]
---

# Fusion campaign (the view above the checkouts)

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

## Step 3: render the overview

Whole sentences in the user's terms (`rules/user-facing-output.md`): no `key=` token and no state word of the helper. A package is called by its name and never "work package" or "claim"; a checkout by its alias, or by its eight hex characters where the alias is `-`; a time as an age in words ("3 hours ago"). In this order:

1. **What the user can do now.** A held package that waits on a decision: name the decision as the thing to answer. With none, say that nothing needs doing.
2. **Where the picture comes from**: the ref, the commit's short hash, and `age_minutes` in words as the last push by any checkout, e.g. *`origin/main` at `eab05b1`: the last push by any checkout was 3 hours ago.* Nothing below is newer than that.
3. **One sentence per `held=` line**: who holds what, when that checkout last pushed, and what the package waits for. `edge:<name>` is other work that has to finish first and `decision:<name>` a decision still open, each named; `none` is said as waiting for nothing. A `last_push` of `none` means no push of that checkout can be read at the commit, never that it has not pushed. Where a time is shown, say once that it is the earliest the last push can have been, so a newer push may not show yet. No `held=` line is an answer: nobody holds anything at that commit.
4. **Campaigns.** `campaigns=0`: no campaign is running. Above 0, where `note=campaigns-not-evaluated` follows: that many campaign records stand at the commit, and this version does not read them yet.
5. **Every other `note=` line in a sentence of its own**, because each is a degradation that changed the answer: `commit-rows-unmatched` (that many newer commits of that checkout were not found on the ref, the newest at that time, so its last push may be later than shown), `no-commit-rows` (no commit of that checkout is on record at the commit), `event-log-untracked` (the project does not track its event log there, so no last push can be read for anybody), `log-lines-unreadable` (that many lines of the event log were left out), `registry-unreadable` (the name of that checkout could not be looked up), `package-unreadable` (that package's record could not be read, so if somebody holds it, it is missing above), `local-ref` (the ref is local, nothing was fetched, and the picture is as current as that ref).
6. **The window.** `window_hours` is named in every sentence that depends on it. None does at this version: when the user gave one, say so once.
