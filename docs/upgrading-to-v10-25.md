# Upgrading to v10.25 (from v10.24)

v10.25 puts a message between two checkouts of one project. A session that ends offers to leave one
short note in the repository, and the side that is about to pull reads it first, out of a fetched
ref, with nothing merged and the working tree untouched. `/fusion:news` is the reading half; the
writing half rides the end of `/fusion:cleanup`.

Nothing in your project is rewritten by this release. No marker moves, no file at your project root
is touched, and there is nothing to migrate. One configuration leaf is new and one defect ships
open; each gets a section below.

`docs/messages-between-checkouts.md` is the page for how the thing works, on both sides. This note
says what changed and what you have to do.

Upgrading is the ordinary update: `fusion --update`, or the uninstall/install/reload sequence on the
marketplace path. The release is tagged `v10.25.0`, and `FUSION_REF=tags/v10.25.0` pins exactly this
version.

## Nothing new works until you update and restart

**This is the one that reaches you before you have read anything else.**

A session reads its command roster and its set of `bin/` helpers once, at start, from the installed
copy, and never re-reads either. On an install that predates this release neither half of the
feature exists: `/fusion:news` resolves to nothing, and `bin/fusion-forum` is absent. Run
`fusion --update`, then restart the session, once. Both halves work from there.

If you reach the command before the update it says so rather than improvising. The skill's first
step checks for the helper and, on the miss, tells you to update and restart, and stops: no
hand-rolled fetch, no `git log`, no reading the store out of your working tree.

**One thing this release does not claim.** `/fusion:news` has never been invoked as a slash command
by anybody. The session that built it could not, for exactly the reason this section is about: it
had read its own roster before the command existed. What has been exercised is the layer under it,
by nine tests driving the real `bin/fusion-forum` against scratch repositories, and the writing
half's body, followed by hand once to produce the first entry in this repository's own store. The
command itself is unproven end to end, and this note will not pretend otherwise.

## `/fusion:cleanup` still stops once, and now asks two questions

The pipeline's one stop is the `CLAUDE.md` gate at its last step, and it is still the only stop: a
run you type and walk away from still completes everything but one answer. What changed is that the
answer is now two answers. The draft message is printed as ordinary output just before the gate, and
approving it is a second question inside the same stop. Printing is not stopping, so the walk-away
property is intact. "One stop" no longer means "one question".

Two silences you would otherwise meet only by their effect:

- **`--skip claude-md` leaves no message at all.** It drops that whole step, and the message now
  sits inside what it drops. The flag still runs the pipeline gateless end to end.
- **`--dry-run` puts no draft and writes nothing.** No question is asked and no file appears.

`--only forum` runs the message half alone. It asks its own single confirmation, writes the file,
touches git not at all, and tells you to carry the new file in your next commit.

One ordering cost is accepted rather than repaired: the entry is written after the pipeline has
already pushed the real work, and rides the later housekeeping push, so whoever pulls between the
two gets the work without its message. An entry lives fourteen days and is then moved into the
archive by the ordinary tier-1 archive step rather than deleted, which means a checkout left dormant
longer than that can lose one unread. Both costs are stated in
`docs/messages-between-checkouts.md`.

## `orchestrator.dispatchMinutes` joins the configuration loader

A new leaf in your project's `fusion.json`, `{"orchestrator": {"dispatchMinutes": <n>}}`, from a
concurrent line of work rather than from the message feature. It is a whole number of minutes, 1 or
more, and the default is 20. Anything else (0, a negative, 2.5, the string `"20"`) is dropped with
exactly one diagnostic naming the key and inherits the default, which is how every other leaf in
this loader behaves. Your existing `orchestrator.maxTurns` is untouched.

`bin/fusion-turn-budget` prints the resolved value as a second `KEY=value` line, `dispatch_minutes=`,
after `max_turns=`, unconditionally and in that order. It rides that helper rather than a new one
because the loader's diagnostics are printed once per process, and a second helper would either
repeat every advisory or stay silent about it. The helper's three exit codes are unchanged.

**What it does not do yet, and this is the part to read.** The value is the wall-clock stopping time
the orchestrator is meant to hand a bound agent's dispatch, and in this release nothing hands it: no
agent prompt and no skill reads it. Declaring the key today changes one line of one helper's output
and nothing else about how a session runs.

The default is not a round figure picked for looking sensible. Over the 131 machine-written dispatch
pairs in this repository's own event log, read on 2026-09-07, 15 ran longer than 20 minutes; of four
candidate values checked against the break-even arithmetic, 20 is the one that maximises the
pessimistic case.

## One defect ships open: an untracked workbench answers "nothing new" forever

**If your project does not track `fusion-workbench/` in git, this whole feature is inert, and
nothing tells you so.**

`bin/fusion-forum new` takes its delta from two `git ls-tree` listings of the store path. Where the
workbench is untracked the store appears in no tree, both listings are empty, and the answer is
`state=ok new=0` on a successful exit, permanently, whatever anybody wrote. `/fusion:news` then
reports that nothing is new, every time, in wording indistinguishable from the true version of that
sentence.

Measured, not inferred: a scratch project with `fusion-workbench/` in `.gitignore` and a conforming
entry sitting in its store returns `new=0`; the same project with the workbench tracked returns the
entries.

Whether a project commits its workbench is that project's own decision and fusion ships no rule
either way, so the untracked configuration is supported and this is a defect rather than a misuse.
It is filed and not fixed in this release
(`260908-0848_*_an-untracked-workbench-answers-new-equals-zero-forever-and-no-state-names-it.md`).
Until it is fixed, either track your workbench or read an empty answer on an untracked one as
unmeasured rather than as empty.

## What you have to do

- **Run `fusion --update` and restart the session once.** Until then neither half of the feature
  exists, and the command you would reach for does not resolve.
- **Nothing else.** No workbench file is rewritten, no marker moves, and no existing configuration
  key changes meaning.
- **If your workbench is untracked, know that the reading command will say "nothing new" whatever
  arrives.** See the section above.

## What did not change

The workbench layout, the state marker vocabularies and their transitions, the directory structure,
and the portfolio. The decision-record, issue and Circle-record templates are as v10.24 left them.
`orchestrator.maxTurns` and `citations.extraPaths` behave exactly as they did, and the two v10
migration advisories are unchanged. The hook layer still decides nothing, and the write-time
citation-form check added in v10.24 still reports and never blocks. `/fusion:cleanup` still stops
exactly once. The agent roster is unchanged; the skill roster gains `news`, and nothing left.

## Where to read more

- `docs/messages-between-checkouts.md`: how a message is written and read, what one looks like, how
  long it lives, and the three things the feature deliberately does not do.
- `bin/fusion-forum` header: the fetch, the two-tree set difference the delta comes from, the state
  vocabulary and the exit codes. It is the authoritative text for all of it, and nothing copies it.
- `skills/news/SKILL.md` and the message half of `skills/cleanup/SKILL.md`: the flow on each side.
- `bin/fusion-turn-budget` header: both printed lines, why they come from one process, and the exit
  table.
- `docs/upgrading-to-v10-24.md` and `docs/upgrading-to-v10-23.md`: the two rungs below this one, if
  you are coming from further back.
- `/fusion:help`: install, update and configure, answered from your live installation.

The records behind every change here, with the measurements and the options weighed against each
other, are in fusion's own workbench in the source repo.
