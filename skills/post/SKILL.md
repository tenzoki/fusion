---
description: The message step of /fusion:cleanup (its Step 6 half, reachable alone as `/fusion:cleanup --only forum`), kept as its own body rather than a command. Composes a short note for whoever pulls this work next, carrying the commit range, the session history file and the records this session filed, and writes it into the workbench's message store.
allowed-tools: [Bash, Read, Write, AskUserQuestion]
---

# Fusion post (leave a message for the other checkout)

This is the message half of `/fusion:cleanup` Step 6, and the procedure below is what that step reads and performs inline. It is not one of fusion's three commands. It composes one entry addressed to whoever pulls this work next and writes it into the message store. The read side is `/fusion:news` on the other checkout, and `bin/fusion-forum`'s own header is the authoritative text for how an entry gets from the store to a reader; nothing here restates it.

Every user-facing sentence below is rendered in the project's chat language (`rules/fusion-workbench-conventions.md` `## Project language`).

## Step 1: roots and paths

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root"
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" post
```

If the first exits non-zero, halt: there is no workbench to write into, and this body creates none. Hold the resolver's `KEY=value` output. `$WORKBENCH` is absolute, `$OUT_FORUM` is relative to it, and that pair is the only correct spelling of the message store in this body. On a non-zero exit read the code before acting: exit 3 is an orphaned or corrupt `.active-circle` and the user's to fix, exit 4 is a fusion bug and their workbench is fine. The full table is in `rules/fusion-workbench-conventions.md` `## Path Resolution` under Exit codes.

## Step 2: compose the draft

The entry is **twenty lines in the file**, in this order and no other:

1. one subject line,
2. one blank line,
3. at most **eight** lines addressed to the person, in the project's chat language,
4. one blank line,
5. at most **nine** lines of pointer block, in the project's artifact language.

The pointer block carries the commit range (`session.git_head_at_start` from `agentstate.yaml`, to `HEAD`), the basename of this session's history file, this session's filed records as **storeless wildcard citations** in the form `rules/fusion-workbench-conventions.md` `## Filename Patterns` defines, and one sentence on what the other side need not redo.

**The person's part reads plainly to somebody who never saw this session.** No state marker, no fusion noun, no agent name as the subject of a sentence, no bare identifier. That obligation is authored here rather than cited: `rules/user-facing-output.md` `## Vocabulary` exempts workbench records, and a message is one.

**Count the lines with `wc -l` before the draft is put**, never after:

```bash
printf '%s\n' "$DRAFT" | wc -l
```

Over the cap, cut and recount. Putting a long draft and trimming it in front of the user is a different procedure and does not satisfy this step.

## Step 3: nothing to say is an answer

**Compose nothing** when the project is not a git repository, or when the run has nothing to report: no commits in the range, and no records filed. Say that in one line and stop. An empty entry costs the other side a read and tells them nothing.

## Step 4: the two invocation shapes

**Inline, as `/fusion:cleanup` Step 6.** Print the draft as ordinary output just before the pipeline's gate, then ask for it as a **second question in the same `AskUserQuestion` call**. Printing is not stopping, so the caller's one stop stays one and its walk-away property holds. This body asks nothing of its own on that path.

**Standalone, under `--only forum` or invoked by name.** The user came to leave a message, so ask: one `AskUserQuestion` with three options, write it, change it, cancel. That is the branch `skills/archive/SKILL.md` `## Process` step 6 takes outside its own pipeline. Write on the first, change nothing on the other two, and **touch git not at all**: no staging, no commit, no push. Close by telling the user to carry the file in their next commit, because an entry nobody pushed reaches nobody.

## Step 5: write the entry

On yes, and only then. The stamp comes from `date`, and the writing checkout from the guarded identity call:

```bash
STAMP="$(date +%y%m%d-%H%M)"
CHECKOUT=""
if [ -x "$FUSION_PLUGIN_ROOT/bin/fusion-identity" ]; then
  CHECKOUT="$("$FUSION_PLUGIN_ROOT/bin/fusion-identity" | sed -n 's/^CHECKOUT=//p')"
fi
echo "stamp=$STAMP checkout=${CHECKOUT:-UNRESOLVED}"
```

`UNRESOLVED` stops the write. The identifier is the filename's third field and the only thing that tells a reader who wrote the entry, so nothing is substituted for it: say which half could not be read and write no file. `bin/fusion-identity`'s own header carries the exit codes and what each one means.

Otherwise `mkdir -p "$WORKBENCH/$OUT_FORUM"` and write one file:

```
$WORKBENCH/$OUT_FORUM/<STAMP>-<CHECKOUT>-<slug>.md
```

`<slug>` is a short kebab-case label, lowercase, alphanumerics and dashes, at most 40 characters.

**The entry carries no `**Filed by:**` field.** The filename already names the writing checkout, and a second answer to a question the name has answered is what that field would be here (`260827-1756_*_which-record-kinds-owe-the-person-half-of-filed-by.md`).

## Step 6: report

Two lines at most: the path written, or that nothing was written and which of Step 3's two conditions or Step 5's unresolved identity is why. On a standalone run, add the one sentence about carrying the file in the next commit.

## Boundaries

- Writes **exactly one file** and nothing else. No workbench state, no tracking file, no `agentstate.yaml`.
- **Dispatches no agent.**
- **Commits nothing** and pushes nothing. Inline, Step 7 of the pipeline carries the entry; standalone, the user does.
- **Composes nothing when there is nothing to say** (Step 3), and writes nothing without the yes that Step 4's shape puts.
- Holds no thread. There are no replies here, and an answer to this entry is the other person's own next message, written on their side.
