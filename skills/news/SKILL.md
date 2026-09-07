---
description: Show what other checkouts left for this one, read out of a fetched ref before any pull. Use when the user asks what is new, what someone left, or what arrived since last time.
allowed-tools: [Bash, Read, AskUserQuestion]
---

# Fusion news (read what another checkout left)

The user invoked `/fusion:news`. This skill shows the messages that reached the remote and that this checkout has not been shown yet. They are read out of a fetched ref: nothing in the working tree is touched, and no merge happens in order to see them.

**The mechanism is not in this body.** The fetch, the two-tree set difference, the exit codes and the state vocabulary are documented in `bin/fusion-forum`'s own header, which is the authoritative text for all of it. Open that header when you need to know how an answer was produced. What this body carries is the flow and the sentences the user reads.

**Three things this skill says aloud, because nothing else will.** Each has its own step below; they are collected here so none is silently dropped.

- **The read mark advances on render.** An entry that has been shown is not shown again, so a message seen and then abandoned does not come back. It is still a file in the store, and whoever wants it reads it there.
- **A pull is the user's yes and never automatic.** This skill fetches, which changes no file, and it pulls only after the user answers Step 6.
- **This reads a store and holds no thread.** There are no replies here. A message that needs an answer gets one through the other person's own next message, written on their side.

Every user-facing sentence below is rendered in the project's chat language (`rules/fusion-workbench-conventions.md` `## Project language`).

## Step 0: roots and paths

A path into a file the plugin ships carries the `$FUSION_SRC` root. Resolve it once:

```bash
if [ -x "${FUSION_PLUGIN_ROOT:-}/bin/fusion-source-root" ]; then
  FUSION_SRC="$("$FUSION_PLUGIN_ROOT/bin/fusion-source-root")"
elif [ -n "${FUSION_PLUGIN_ROOT:-}" ]; then
  echo "fusion: no bin/fusion-source-root in the installed plugin at $FUSION_PLUGIN_ROOT — the source root falls back to that install copy" >&2
  FUSION_SRC="$FUSION_PLUGIN_ROOT"
else
  FUSION_SRC=""
fi
echo "source root: ${FUSION_SRC:-UNRESOLVED (FUSION_PLUGIN_ROOT is unset)}"
```

**Why the branch, why it is a call, and why the call is guarded:** `bin/fusion-source-root`'s own header. `UNRESOLVED` is not a path: with it printed, say so rather than reading through an empty value, and do not improvise the content of a file you could not open. A `bin/` helper is always run from `$FUSION_PLUGIN_ROOT`, never from `$FUSION_SRC`.

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root"
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" news
```

If the first exits non-zero, halt with *No fusion workbench found above `$(pwd)`. Run `/fusion:setup` once at the project root first.* Do not create one from here.

Hold the resolver's `KEY=value` output: `$WORKBENCH` is absolute, `$SCAN_FORUM` is relative to it. **`$SCAN_FORUM` is the only correct spelling of the message store in this body**, and it is passed to the helper as the workbench-relative value the resolver printed. On a non-zero exit read the code before acting; the table is in `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes.

## Step 1: the helper has to be there

```bash
[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-forum" ] && echo present || echo missing
```

On `missing`, say this and stop:

> *`/fusion:news` needs `bin/fusion-forum`, and the installed copy of fusion does not carry it yet. Run `fusion --update`, then restart the session.*

**Never improvise the mechanism on that branch.** No hand-rolled fetch, no `git log`, no reading the store out of the working tree. The guard is the standing one every call site carries (`260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`).

## Step 2: ask what is new

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-forum" new "$SCAN_FORUM"; echo "exit=$?"
```

Hold `ref=`, `head=`, `new=` and every `entry=` line. Exit 0 is the only case that continues. For every other, say one plain sentence naming what could not be done, and stop. Substitute nothing for an answer that could not be taken.

- **exit 3**: no workbench above here. Run `/fusion:setup`.
- **exit 5**: there is nothing to read against, and `state=` says which: `no-work-tree` (this project is not a git repository), `no-branch` (detached HEAD, which has no upstream at all), `no-upstream` (this branch tracks nothing, so nobody's messages can reach it), `upstream-unresolved` (an upstream is configured and its ref still does not resolve after the fetch). Name the one that came back, not the list.
- **exit 6**: the fetch did not complete. Pass git's own stderr through to the user unchanged; the causes are git's to explain and a paraphrase loses what the user needs.
- **exit 7**: the workbench is not inside this repository, so no path into it can be derived.
- **exit 2**: a usage fault in this body. Report it as a fusion defect, not as the user's problem.

A `note=` line can accompany any answer, exit 0 included, and it is a degradation that changed the answer rather than a warning to skip. Three occur: this checkout's own entries could not be filtered out, or the mark does not resolve so the whole store reads as new, or the branch tracks a local ref so no fetch was owed and the answer is as local as that ref. Repeat whichever came back to the user in its own sentence.

## Step 3: when nothing is new

**`new=0` is a real answer and never an error.** Say it in words, naming the ref, and stop. Write no mark and ask no pull question.

> *Nothing new on `<ref>` since the last time you looked.*

## Step 4: render every entry

Iterate the `entry=` lines from Step 2, in the order they were printed, which is oldest first. **Never expand a glob in a shell loop**: the Bash tool runs zsh with `nomatch` on, where an unmatched pattern aborts the whole block before a guard inside it can fire, so a listing comes from a command substitution or `find` and here it comes from the helper's own output (`rules/fusion-workbench-conventions.md` `## Marker globs`).

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-forum" show "$HEAD" "$ENTRY"
```

`$HEAD` is the `head=` value from Step 2, passed back verbatim, which pins every render to the exact tree the delta was computed against. Show the person's part as it was written: do not summarise it, translate it, reorder it or answer it inside the render.

Name the writer. The identifier is the filename's third dash-separated field:

```bash
HEX="$(basename "$ENTRY" | cut -d- -f3)"
if [ -x "$FUSION_PLUGIN_ROOT/bin/fusion-checkout-name" ]; then
  "$FUSION_PLUGIN_ROOT/bin/fusion-checkout-name" resolve "$HEX" || echo "unregistered=$HEX"
fi
```

Exit 3 means no entry exists for that hex, which is the ordinary case for a checkout that never registered and is not a fault. **Render the hex itself then**, exactly as every other display site does; the fallback and the reason for it are in `bin/fusion-checkout-name`'s header.

## Step 5: advance the mark

After rendering and before the pull question. This ordering is settled.

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-forum" seen "$HEAD"
```

Then tell the user, in one sentence, that these entries will not be shown again, and that the files stay in the store for anyone who wants to read them a second time. That is the accepted cost of marking on render: a message seen and then abandoned does not come back.

## Step 6: offer the pull, once

Fetching changed no file. Pulling does, and it is the user's decision.

```bash
GD="$(git rev-parse --git-dir 2>/dev/null)"
DIRTY="$(git status --porcelain 2>/dev/null | head -n 1)"
INPROG=no
[ -n "$GD" ] && { [ -e "$GD/MERGE_HEAD" ] || [ -d "$GD/rebase-merge" ] || [ -d "$GD/rebase-apply" ]; } && INPROG=yes
echo "dirty=${DIRTY:+yes} inprogress=$INPROG"
```

If `dirty=yes` or `inprogress=yes`, **do not ask**. Say what stands in the way (uncommitted changes, or a merge or rebase already running) and leave the pull to the user.

Otherwise ask once with `AskUserQuestion`: pull now, or leave it. On yes:

```bash
git pull --ff-only
```

A non-fast-forward is reported to the user as something for them to resolve, with git's message. Do not merge, rebase or force anything on their behalf.

## Step 7: report

Keep it to a few lines: how many entries were shown and who wrote them, that the mark advanced, and what became of the pull question. Close with the property nobody else states: this skill reads a store and holds no thread, so there is nothing to reply to here. A message that needs an answer gets one through the other person's own next message.
