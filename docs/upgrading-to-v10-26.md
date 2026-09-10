# Upgrading to v10.26 (from v10.25)

**Read this note as history.** The mechanism it describes was retired after v10.26: no dispatch
carries a stopping time any more, every dispatch runs to its natural end, and the configuration leaf
below is retired too — a project still declaring it gets one advisory naming the leaf and nothing
else. Nothing here needs undoing; the note is kept as the record of what v10.26 shipped.

v10.26 gives a dispatched agent a wall-clock stopping time. Seven of the agents the orchestrator
sends work to now receive one line on the dispatch prompt saying when to stop where they stand, and
an agent that reaches it hands back what it finished together with what it did not. The orchestrator
reads that hand-back and continues the work in a fresh dispatch, at the same place.

Nothing in your project is rewritten by this release. No marker moves, no file at your project root
is touched, and there is nothing to migrate. One configuration leaf that shipped inert in v10.25 is
now read, and one v10.25 defect is fixed; each gets a section below.

Upgrading is the ordinary update: `fusion --update`, or the uninstall/install/reload sequence on the
marketplace path. The release is tagged `v10.26.0`, and `FUSION_REF=tags/v10.26.0` pins exactly this
version.

## The bound is requested, never enforced

The seven agents are `coder`, `ontocoder`, `bugfixer`, `reconciler`, `coderev`, `ontorev` and
`curator`. Every other agent is unbound and receives no stopping time at all.

Nothing kills a dispatch when the clock runs out. The stopping time is a line in the prompt and the
agent decides what to do with it: finish the unit of work it is inside, then stop and say so. That
is why the release can ship it without a risk of truncated edits. An agent that ignores the line
behaves exactly as it did in v10.25.

What comes back on a bounded return is a four-line block naming what was finished, what was not, and
where to resume. The orchestrator reads it before anything else, so a half-finished run is continued
rather than judged as a failure — in particular a bounded return from the `bugfixer` never triggers
the revert that a reported failure would, which is what keeps the partial work.

## `orchestrator.dispatchMinutes` is now read

The leaf joined the configuration loader in v10.25 and nothing consumed it. In v10.26 it is the
number that becomes the stopping time. Default 20 minutes. Set your own in `fusion.json` at the
project root:

```json
{ "orchestrator": { "dispatchMinutes": 30 } }
```

The `fusion-turn-budget` helper — removed since this release — prints it as its second line, beside
`max_turns`, and both are resolved once at the orchestrator's Setup. A value that does not resolve
is not substituted: no stopping time reaches any dispatch prompt, every dispatch runs to its natural
end as it did before, and the session says so once in its Setup report.

## `bin/fusion-events dispatches` says what actually happened

New subcommand on the events reader. It pairs each dispatch's start row with its completion row and
prints one line per pair, carrying how long that dispatch ran and whether it ran past the configured
bound:

```
fusion-events dispatches --since 2026-09-01
fusion-events dispatches --minutes 20
```

Three counts partition every pair it looked at: `counted`, `unattributable` and `unpaired`. A figure
it could not take is named rather than printed as a zero. The helper's own header is the
documentation.

## One v10.25 defect is fixed

The message half of `/fusion:cleanup` did not write the message on its default path. It worked under
the `--only forum` selector, which is the shape the feature had been tested in, and the two findings
bit only on the pipeline path. Both are closed: the pipeline now captures the commit range and the
session history name before the step that deletes the state file, and the draft rides the first
question the pipeline already puts.

An element the pipeline could not read travels as unread, is left out of the pointer block and is
named in the report, so an absent commit anchor can no longer be mistaken for a hash.

The message contract itself moved into its own step body. `/fusion:cleanup --only forum` reaches it
alone, as before; the pipeline's one stop is still one stop.

## What you have to do

Nothing, unless you want a stopping time other than 20 minutes — then set `orchestrator.dispatchMinutes`
in `fusion.json`.

As always, run `fusion --update` and restart the session once. A session reads its helper set at
start and never re-reads it, so `bin/fusion-events dispatches` is absent until you do.

## What did not change

No agent gained or lost a capability, no record format moved, no marker vocabulary changed, and no
gate became blocking. The Turn budget, the commit lock, the citation grammar and the four growth
bounds are all as they were in v10.25.

## Where to read more

The authoring home for the stopping time was a rule file the plugin shipped and emitted to those
seven agents at Setup. It was deleted with the mechanism, so there is nothing left to read: the
retirement is what this note's opening paragraph says.
