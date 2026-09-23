---
description: Composes a short note for whoever pulls this work next, carrying the commit range and the records this session filed, and writes it into the workbench's message store.
allowed-tools: [Bash, Read, Write, AskUserQuestion]
---

# Fusion post (leave a message for the other checkout)

The user invoked `/fusion:post`. It composes one entry addressed to whoever pulls this work next and writes it into the message store. **That is the whole of it**: no other pass runs before or after, and this body triggers none. The read side is `/fusion:news` on the other checkout, and `bin/fusion-forum`'s own header is the authoritative text for how an entry gets from the store to a reader; nothing here restates it.

Takes one optional argument, `--since <commit>` — the start of the commit range the pointer block carries.

Every user-facing sentence below is rendered in the project's chat language (`rules/fusion-workbench-conventions.md` `## Project language`).

## Step 1: roots and paths

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root"
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" post
```

If the first exits non-zero, halt: there is no workbench to write into, and this body creates none. Hold the resolver's `KEY=value` output. `$WORKBENCH` is absolute, `$OUT_FORUM` is relative to it, and that pair is the only correct spelling of the message store in this body. On a non-zero exit read the code before acting: exit 4 is a fusion bug and their workbench is fine. The full table is in `rules/fusion-workbench-conventions.md` `## Path Resolution` under Exit codes.

## Step 2: compose the draft

The stamp comes from `date`, and the writing checkout from the guarded identity call; both are held for the rest of the run:

```bash
STAMP="$(date +%y%m%d-%H%M)"
CHECKOUT=""
if [ -x "$FUSION_PLUGIN_ROOT/bin/fusion-identity" ]; then
  CHECKOUT="$("$FUSION_PLUGIN_ROOT/bin/fusion-identity" | sed -n 's/^CHECKOUT=//p')"
fi
echo "stamp=$STAMP checkout=${CHECKOUT:-UNRESOLVED}"
```

`UNRESOLVED` stops the run before anything is composed. The identifier is the filename's third field and the only thing that tells a reader who wrote the entry, so nothing is substituted for it: say which half could not be read and write no file. `bin/fusion-identity`'s own header carries the exit codes and what each one means.

The entry is **at most twenty lines**, a ceiling and not an exact count, in this order and no other:

1. one subject line,
2. one blank line,
3. at most **eight** lines addressed to the person, in the project's chat language,
4. one blank line,
5. at most **nine** lines of pointer block, in the project's artefact language.

The pointer block carries the commit range (the session's start anchor, to `HEAD`), this session's filed records as **storeless wildcard citations** in the form `rules/fusion-workbench-conventions.md` `## Filename Patterns` defines, and one sentence on what the other side need not redo.

**The range's start anchor comes from the `--since` argument and from no file** — no session state file and no session history file exists to hold it (`rules/fusion-workbench-conventions.md` `## Session history`). **An element whose value is unread is left out of the block** and named in Step 6's report: no empty range, no bare `to HEAD`, no invented anchor. The anchor is ordinarily absent, which is a shape the entry is still worth writing in — the records it cites are what the other side reads it for.

**The person's part reads plainly to somebody who never saw this session.** No state marker, no fusion noun, no agent name as the subject of a sentence, no bare identifier. That obligation is authored here rather than cited: `rules/user-facing-output.md` `## Vocabulary` exempts workbench records, and a message is one.

Clear any leftover first, so an interrupted run's draft is removed by the next one instead of surviving at the workbench root, where `bin/fusion-staging-drift` reports it unclassified:

```bash
rm -f "$WORKBENCH/.post-draft-$CHECKOUT"
```

Write the draft with the `Write` tool to `"$WORKBENCH/.post-draft-$CHECKOUT"`, a dotfile at the workbench root that no staging list names and `/fusion:cleanup` does not commit, and count that file, never a rendering of it:

```bash
wc -l < "$WORKBENCH/.post-draft-$CHECKOUT"
```

`wc -l` counts newlines, so the file ends in one. Over the ceiling, cut the file and recount. Putting a long draft and trimming it in front of the user is a different procedure and does not satisfy this step.

## Step 3: nothing to say is an answer

**Compose nothing** when the project is not a git repository, or when the run has nothing to report: no commits in the range, and no records filed. **With no range to read, that second condition reads on the records alone** — an unread anchor is not a third condition and never suppresses an entry on its own. Say that in one line, `rm -f "$WORKBENCH/.post-draft-$CHECKOUT"` where Step 2 wrote one, and stop. An empty entry costs the other side a read and tells them nothing.

## Step 4: put the draft to the user

Show the draft file's content as ordinary output, then ask: one `AskUserQuestion` with three options, write it, change it, cancel. Write on the first, change nothing on the other two.

## Step 5: write the entry

On yes, and only then, the counted file becomes the entry, so the bytes counted are the bytes written:

```bash
mkdir -p "$WORKBENCH/$OUT_FORUM"
mv "$WORKBENCH/.post-draft-$CHECKOUT" "$WORKBENCH/$OUT_FORUM/$STAMP-$CHECKOUT-<slug>.md"
```

On change or cancel, `rm` the draft file and write nothing. `<slug>` is a short kebab-case label, lowercase, alphanumerics and dashes, at most 40 characters.

**The entry carries no `**Filed by:**` field.** The filename already names the writing checkout, and a second answer to a question the name has answered is what that field would be here (`260827-1756_*_which-record-kinds-owe-the-person-half-of-filed-by.md`).

## Step 6: report

Two lines at most: the path written, or that nothing was written and which of Step 3's two conditions or Step 2's unresolved identity is why. Name any pointer element Step 2 left out for an unread value — the omission belongs here, not in the entry. Add one sentence telling the user to carry the file in their next commit, because an entry nobody pushed reaches nobody.

## Boundaries

- Writes **exactly one file** and nothing else. No workbench state and no tracking file.
- **Dispatches no agent**, and runs no other pass.
- **Commits nothing** and pushes nothing. The user carries the entry into their next commit.
- **Composes nothing when there is nothing to say** (Step 3), and writes nothing without the yes that Step 4's shape puts.
