# Messages between checkouts

Two clones of one project, and only git between them. A session ends, commits, pushes. Somewhere else, on another machine or in a second checkout on the same one, a person types `git pull` and receives the work without knowing what it was, what it changed, or what they can now stop doing themselves. Fusion writes a note across that gap: the session that pushes offers to leave one short message, and the side that is about to pull reads it first.

The note is a file in the repository, like everything else fusion writes. It travels by push and pull, needs no server between the two checkouts, and is legible with `cat` when the tooling is not to hand.

**Before the first use, update and restart.** A session reads its command roster from the installed copy of fusion when it starts, and never re-reads it. On an install that predates this feature, neither half exists: run `fusion --update`, then restart the session, once. The reading command then resolves and the writing step appears in the cleanup pipeline.

## Reading: the `news` command

`/fusion:news` takes no argument. It fetches, works out for itself which entries in the store this checkout has not been shown, renders each one by reading it out of the fetched ref, advances the read mark, and then asks once whether to pull.

Fetching changes no file, so the render happens with your working tree untouched and nothing merged. Pulling is a separate decision and always yours: the command offers `git pull --ff-only` and nothing stronger, and it does not offer even that when the tree is dirty or a merge or rebase is already in progress. It says so instead and leaves the situation to you.

When there is nothing new it says so in words rather than printing an empty result.

## Writing: inside the end-of-session cleanup

The writing half is a part of `/fusion:cleanup`, not a command of its own. `/fusion:cleanup` holds you exactly once, at the end, so that a run you type and walk away from completes everything but one answer. The message draft rides in that one stop as a second question: the draft is printed, and you approve it in the same breath as the `CLAUDE.md` gate.

Three consequences follow from folding it into that stop, and the pipeline states each aloud rather than leaving it to be discovered:

- `--skip claude-md` skips the gate, and therefore leaves no message at all.
- `--dry-run` puts no draft and writes nothing.
- `--only forum` runs the half alone. It asks its own single confirmation, writes the file, touches git not at all, and tells you to carry the new file in your next commit.

Nothing is offered when the project is not a git repository, or when the run has nothing to say: no commits in the range and no records filed.

One ordering cost is accepted rather than repaired. The entry is written after the pipeline has already pushed the real work and is carried by the later housekeeping push, so whoever pulls between the two gets the work without its message.

## Two names, chosen separately

You type `news`; the files live in `shared/forum/`. The two names differ, both are the user's own, and neither ruling was made in ignorance of the other. The Circle record notes the divergence as a live inconsistency left standing rather than a subtlety, so read it as a known state of the project and not as a hint that one of the two is a typo.

## What a message looks like

Twenty lines in the file: a subject, a blank line, up to eight lines addressed to a person, a blank line, up to nine lines of pointer block.

The two halves are written for different readers and follow different languages. The person's part follows the project's chat language and reads plainly to somebody who never saw the session: no state markers, no fusion nouns, no agent name as the subject of a sentence, no bare identifiers. The pointer block follows the artifact language and carries the machine-checkable facts: the commit range, the session history file's basename, the records the session filed as storeless wildcard citations, and a sentence or two on what the receiving side need not redo.

Each entry is one file per session, named `YYMMDD-HHMM-<checkout>-<slug>.md`, with a single writer. Nothing appends to a shared log, so there is no merge driver and no ordering to lose.

The shape, with the person's half in English for the sake of the example:

```
A new command: see what arrived before you pull

The project now has a command that shows you what came in from the
other checkout before you pull anything. It only fetches, leaves your
working copy alone, and asks once afterwards whether to pull.

Range abcaa823..ec07e1b0 on main; session log 260907-1659-orchestrator-session.md.
New: the message store, its reader, and the writing step in cleanup.
Nothing to redo on your side: the store path and the fetch belong to the
helper, whose header is the contract.
```

## How long a message lives

Fourteen days. An aged entry is moved out of the live store by the archive step at tier 1, which is the tier the ordinary end-of-session cleanup runs autonomously, so pruning happens without anybody asking for it. It is archived, not deleted.

A message is the first thing tier 1 selects by age rather than by a marker, and the reason is that a message carries no marker at all: it is read once and soon, and age is the only signal available. The cost is accepted and stated rather than engineered around. A checkout left dormant for longer than fourteen days can lose an entry unread.

## What it does not do

Three limits, and none of them is a rough edge that a later release will quietly file off.

**A project that does not track its workbench in git gets nothing, and is told nothing.** The delta is taken from two git tree listings. Where `fusion-workbench/` is untracked, the store appears in no tree, both listings are empty, and the answer is `new=0` on a successful exit, permanently. Measured against a scratch project with the workbench in `.gitignore`, with an entry sitting in the author's store; the same project tracked returns the entries. Whether a project commits its workbench is that project's own decision and fusion ships no rule either way, so the untracked configuration is supported and the whole feature is inert and silent inside it. Filed as `260908-0848_*_an-untracked-workbench-answers-new-equals-zero-forever-and-no-state-names-it.md`.

**A message is shown once.** The read mark advances when an entry has been rendered, so a message you glanced at and then abandoned does not come back on the next run. The file is still in the store, and whoever wants it a second time opens it there.

**There is no thread.** The command reads a store; it has no reply, no addressing and no notion of a conversation. A message that needs an answer gets one through the other person's own next message, written on their side, at the end of their next session.

## Two output states

Running the reading command produces one of two shapes, depending on whether the fetch turned up anything. Both are the shape the skill prescribes rather than a captured transcript.

Nothing new:

```
Nothing new on origin/main since the last time you looked.
```

One entry:

```
1 new message on origin/main.

From Kai Stalmann (checkout 1d05b0e4), 260907-2354:

  A new command: see what arrived before you pull

  The project now has a command that shows you what came in from the
  other checkout before you pull anything.
  [...]

These entries will not be shown again. The files stay in the store.
```

Where the writing checkout has registered itself, its name is rendered; where it has not, the eight hex characters of its identifier are rendered instead, which is the ordinary case and not a fault.

Any answer, including a successful one, can carry a note about a degradation that changed it: this checkout's own entries could not be filtered out, the read mark does not resolve so the whole store reads as new, or the branch tracks a local ref so no fetch was owed. A note is part of the answer and is repeated to you rather than swallowed.

## Where the mechanism is written down

`bin/fusion-forum`'s own header is the authoritative documentation for the fetch, the two-tree set difference the delta comes from, the state vocabulary, and the exit codes. None of it is copied here, deliberately: a second copy drifts from the first, and the first is the one the program obeys. Open the header when you need to know how an answer was produced.

The flow on each side lives in `skills/news/SKILL.md` and in the message half of `skills/cleanup/SKILL.md`; the retention rule and its accepted cost are in `skills/archive/SKILL.md` under tier 1.
