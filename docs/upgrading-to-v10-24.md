# Upgrading to v10.24 (from v10.23)

Nothing in your project is rewritten by this release. No marker moves, no configuration key
changes, no file at your project root is touched, and no agent, skill or slash command arrived or
left.

One new thing speaks by itself, without your having to run anything: when an agent writes a record
into your workbench, the form of the citations in it is now checked at that moment and reported
back to the writer. It reports and never blocks. The rest of the release is a figure added to a
report you already run by hand, two options on the monitor, a temporary path that stops colliding,
and one defect that ships open and gets a section of its own below.

Upgrading is the ordinary update: `fusion --update`, or the uninstall/install/reload sequence on
the marketplace path. The release is tagged `v10.24.0`, and `FUSION_REF=tags/v10.24.0` pins exactly
this version.

## A citation in a retired form is reported at the write

Since v10.20 a record cites another record by its storeless basename with the marker wildcarded,
and a citation carrying a store segment is a violation. Until this release that violation was found
only by a later gate run or by a hand-run check, which means it was found by somebody else, often
in another agent's session, sometimes with the release gate already red.

Now the PostToolUse hook measures it at the write. When a `.md` file lands under your workbench,
the file is handed to the same citation grammar every other citation consumer uses, and any
citation spelled in a retired form comes back to the agent that just wrote it, naming the file, the
line, the token, the problem and the correct spelling.

**It cannot fail a tool call and it rewrites nothing.** A PostToolUse hook has no verdict to give:
the write has already happened, the sentence is handed to the model as text, and no file is
modified, staged or reverted by it. What it changes is who finds out, and when.

Three narrowings keep it from becoming noise, and each is a place it could have become noise.

- **Which files.** Any `.md` under the workbench, with the frozen stores excluded. The kinds that
  carry no state marker are deliberately in: two of the three instances that filed the defect were
  a session history and an analysis, and the release gate's own corpus excludes both.
- **Which lines.** Only what this tool call wrote: the whole file for a `Write`, the located
  replacement text for an `Edit` or `MultiEdit`. You are never handed a violation somebody else
  left in the same file. The whole file is still read, because a fragment read alone carries no
  fenced block and a quoted exhibit would then be judged as a pointer.
- **Which verdicts.** A store segment in the token, and a marker spelled literally where the
  wildcard belongs. A citation that simply does not resolve is never reported here: a failed lookup
  is what a dead pointer, a probe fixture quoted in prose, an unqualified citation of another
  project's record and a record about to be written all produce alike, so reporting it would make
  the check loudest on exactly the records that discuss citation form.

**Measured over this repository's own workbench: of 1 863 records that pass the file test, 17 would
report anything at all.** The same signature is not repeated at you twice in a row, and each report
also lands as a `citation_form` row in your event log, so how often it fires is a `grep`.

## `bin/fusion-citation-check` names the violations nobody is allowed to repair

**This is the item most likely to be the reason you upgrade.**

The checker's output gains one figure, `unrewritable-violations=`, and every violation row gains a
column reading `unrewritable` or `rewritable`.

The gap it closes was reported by a consuming project whose build gate sat red at every commit with
no remedy available inside the project, and the logical core of that report is what this acts on:
the tool was saying "this is a violation" and "nothing may touch this" about the same characters,
and its output gave a reader no way to tell that half from the half a human can act on. A verbatim
exhibit is the case. A quoted transcript, a worked example, a record whose whole subject is that
some other file spells a citation wrongly: respelling the token there deletes what the record was
filed to show, so `bin/fusion-citation-sweep` declines to rewrite it, and no human may repair it by
respelling either.

**The predicate is the sweep's own.** A row counts as unrewritable when the grammar attached an
exemption reason to it, which is the exact test the sweep applies to decline a rewrite. The figure
therefore counts precisely the rows the sweep refuses, and a third exemption reason added later
arrives counted with no edit at that site.

**What the other column value does not claim.** `rewritable` says only that no exemption forbids
respelling that token. It does not say a correct rewrite exists for it, and both the helper's
header and this note say so rather than leaving it to be assumed.

**Nothing else moved, and the restraint is deliberate.** `verdict=` keeps its expression: it is
`violations` when `edited-violations` is above zero, and reads nothing else, so the new figure
cannot flip a verdict. The exit code is still 0 on a violation. No existing key is renamed or
recomputed, and no token changes which class it is judged into. A project that recorded its figures
under v10.23 gets the same ones back. Nothing here goes silently green.

**If your build gate is red on this class**, you can now wire it on the actionable half, and two
things are worth checking in your own wiring before you wait on any further release. The helper
exits 0 on a violation by design and says so in its own header, so a red build leg is coming from
the wiring rather than from the verdict. And the verdict scope already narrows by editedness, so a
violation sitting in a closed record is outside it.

**The measurement is the more interesting half.** This repository reports 395 store-prefixed
tokens, and every one of them is unrewritable: 42 in archived records, 353 in the live tree, 240 of
those inside two Circles' records and planning files. Its `verdict=` reads `clean` for one reason,
that none of them sits in a record anybody still edits, which is what the verdict scope covers. So
fusion is not clean of this class. It is clean of it where the verdict looks.

**What this does not settle**, stated because the mitigation is easy to mistake for the closure: a
project can widen the corpus the checker reads and cannot narrow it, so there is still no way for a
project to declare that a particular record is an exhibit. Making the class visible is not making
it declarable (`260906-0416_*_a-project-may-widen-the-citation-corpus-and-never-narrow-it-so-an-exhibit-has-no-declarable-form.md`,
and the open question `260906-0416_*_should-a-project-be-able-to-declare-a-record-an-exhibit-and-what-does-that-declaration-cover.md`).

## The monitor takes port 0, and can publish the port it got

Two additions for anyone who starts `bin/monitor` from a script rather than by hand.

**Port 0 asks the kernel for a free port**, and with it the monitor skips its takeover step. On a
named port the monitor terminates whatever is already listening there, which is correct for
replacing your own stale dashboard and is how one caller's monitor kills another's when two callers
predict the same number. On port 0 there is no number to have predicted and nothing to clear.

**`MONITOR_URL_FILE` names a file the server writes its URL to**, once it has bound and before it
starts serving. It is the only channel to the bind's own answer for a caller that is not reading
the banner: with port 0 it carries the port that was actually chosen, and on any port it carries
which loopback families answer. The file is the caller's to create and to remove; the monitor's own
cleanup deletes only what it made itself.

If you start the monitor the way `/fusion:setup` does, on a fixed port, nothing about this reaches
you.

## The orchestrator's commit-message file is per session

The temporary file the orchestrator writes a commit message to is now
`/tmp/fusion-commit-msg-<session-id>-<task-id>.txt`. It was `/tmp/fusion-commit-msg-<task-id>.txt`,
and `/tmp` is machine-global while the work is per project. Task ids are short and conventional
(`T1`, `REC`, `CLOSE`), and macOS folds filename case by default, so two sessions with even
differently-cased ids wrote one file.

This was observed rather than reasoned about: one project's message overwrote another's
mid-session, and only a commit that had already run kept the wrong prose out of the tree. Reversed,
`git commit` exits 0 on the wrong message. The commit lock does not cover it, because the lock is
anchored at the workbench and two sessions in different projects hold different locks by design
(`260905-2213_*_two-concurrent-sessions-share-one-tmp-commit-message-path-so-one-can-commit-the-others-message.md`).

There is nothing for you to do. The path stays outside your workbench, and the message still never
reaches a command line.

## One defect ships open: git under load reads as "no git here"

`hooks/lib/git.ts` runs git under a fixed 5-second budget inside the PostToolUse hook, and it
returns the same value for a timeout as for "this is not a git repository". The two are
indistinguishable to every caller.

**Measured on a six-commit repository over 600 samples:** `git log` takes 23 ms with nothing else
running, and up to 7 580 ms with two test suites running, with no spawn ever failing. The budget is
5 000 ms, so the loaded tail crosses it. A busy machine is an ordinary machine, not a pathological
one.

**So on a loaded machine your project can be told that git declined to answer when git was merely
slow.** What that looks like: the review-coverage measurement comes back empty, reporting that git
could not list the commit range, and the staging check reads HEAD as unnameable, which it treats as
"no commit for a staging list to have missed" and reports nothing. Neither sentence is a finding
about your repository, and neither says which of the two conditions produced it, because the
information does not survive as far as the caller.

**That collapse, and not the budget, is the defect.** A caller receiving the collapsed value cannot
tell a project without git from a machine under load, so no caller can retry, degrade, or say which
happened, and none of them reports a timeout today because none of them can see one.

**It is not fixed in this release, and it was not left out by neglect.** What the budget should be,
and whether a timeout is retried, is an open question waiting on a ruling; the defect record states
the fault and deliberately does not choose the shape
(`260906-0035_*_the-git-helper-reports-a-timeout-as-not-a-repository-in-every-consuming-project.md`,
`260906-0035_*_what-should-the-git-helpers-budget-be-and-is-a-timeout-retried.md`). Until it is
ruled on, read a quiet review-coverage or staging line on a busy machine as unmeasured, not as
measured and clean.

## Also in this release

**A citation of another project's record has a form.** `foreign:<project>:<citation>`, both leading
segments literal and required, read before any lookup, so such a token is reported neither dangling
nor carrying a store segment. It is supplied by the writer and never inferred: nothing separates a
genuine foreign record from a local one mislabelled, so the qualifier is a claim you are making
rather than a fact a gate checked. The keyword is not decoration either, since a bare project
prefix already occurs 214 times in this corpus as a legacy task-id spelling, every one of them
naming a local record.

**Four repairs inside the citation instrument**, which can move your own figures slightly if you
run it: a citation ending a sentence no longer has the full stop swallowed into the basename it
offers you as the fix, a Circle-record citation at a sentence end produces a token where it
produced none, the sweep's residual rows are collected per file so its output really is in file
order, and the checker no longer reads a declared-paths corpus as a silent zero when git names a
pattern whose files are not on disk.

**Development-side only, and here so a maintainer is not surprised:** the default per-case deadline
in fusion's own test suite moved from 5 000 ms to 30 000 ms. It reaches 581 of 702 case
declarations and introduces no second number, since 30 000 is what the 121 cases that already set
their own budget chose. A fixed 5-second deadline sitting inside a loaded latency distribution is a
speed assumption rather than a test. Nothing in a consuming project runs that suite.

## What you have to do

**Nothing.** No workbench file is rewritten, no marker moves, no configuration key changes, and
nothing at your project root is touched.

Two things worth knowing rather than doing:

- **Expect a sentence about citation form** when an agent writes a record whose citations spell a
  store segment or a literal marker. Repairing it in the file you are in is the whole point of the
  timing.
- **If a build gate of yours reads `bin/fusion-citation-check`**, you can now separate the
  violations a human may repair from the ones nothing is allowed to touch. Check first that the
  gate is not reading the exit code as a verdict, which it never was.

The usual one-release-behind cost applies as it always does: the new figure and the new grammar
arrive with `fusion --update` and a session restart, because the installed copy is pinned for the
whole session.

## What did not change

The workbench layout, the state marker vocabularies and their transitions, the directory structure,
and the portfolio. The decision-record, issue and Circle-record templates are as v10.23 left them,
including the resolution lines that cite a heading and the two that name who ruled. The checkout
registry, the four personal log filenames and everything else v10.23 introduced behave exactly as
that note describes. Configuration is untouched: `fusion.json`, its two live settings and the two
v10 migration advisories are as they were. The hook layer still decides nothing, and the guard
still allows every call it sees; the write-time check described above reports and has no verdict to
give. The agent, skill and slash-command roster is unchanged.

## Where to read more

- `bin/fusion-citation-check` header: the full `KEY=value` block, what `unrewritable-violations=`
  counts, and what the `rewritable` column does not claim.
- `bin/fusion-citation-sweep` header: the rewrite table and the guards, if you ever run the sweep
  by hand.
- `README-hooks.md` `## Files`: the row for the write-time citation-form measurement, with its
  three narrowings and the reason a failed lookup is excluded.
- `rules/fusion-workbench-conventions.md` `## Filename Patterns`: the citation form itself,
  including the form for another project's record.
- `bin/monitor` usage block: port 0, `MONITOR_URL_FILE`, and the takeover step that is skipped.
- `docs/upgrading-to-v10-23.md` and `docs/upgrading-to-v10-20.md`: the two rungs below this one, if
  you are coming from further back.
- `/fusion:help`: install, update and configure, answered from your live installation.

The records behind every change here, with the measurements and the options weighed against each
other, are in fusion's own workbench in the source repo.
