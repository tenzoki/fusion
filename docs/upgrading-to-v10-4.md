# Upgrading to fusion v10.4

v10.4 arms three blocking gates over text that nobody compiles — citations between workbench
records, the stopping section of a live plan, and the committed `hooks/dist/`. **All three run in
fusion's own test suite, over fusion's own repository. None of them can fire in your project**, and
the first section below says exactly why, because that is the sentence most likely to be got wrong
about this release.

What *can* reach you is smaller and is the rest of this note: one halt that used to be waived, one
new place a project-local rule file is picked up, and three conventions the agents now follow when
they write records.

Nothing in your workbench is rewritten, no marker moves, and no configuration key changes.

Upgrading is the ordinary update — `fusion --update`, or the uninstall/install/reload sequence on
the marketplace path. The release is tagged `v10.4.0`, and `FUSION_REF=tags/v10.4.0` pins exactly
this version.

## The three gates are fusion's own suite, not yours

`npm test` is fusion's development command. It is not something a consuming project runs, and after
this release it still is not. Three facts settle it, and each is checkable:

- The two workbench gates read `hooks/lib/__tests__/helpers/citation-scan.ts` `workbenchRoot`, which
  is the **plugin's own** `fusion-workbench/` — four levels up from the helper, inside the plugin
  tree. Your project's workbench is never the corpus.
- `install.sh` copies `.claude-plugin agents skills rules hooks bin stilwerk templates docs` and the
  READMEs. It copies no `fusion-workbench/`, no `.git`, and it deletes `hooks/node_modules`. An
  installed `~/.fusion` therefore has no workbench to scan, no git objects to compare against, and
  no test runner to run.
- Both workbench gates fail loudly rather than passing vacuously when the workbench is absent, so
  even a deliberate run in an install copy reports "scanned nothing" instead of a green tick.

The audience for the three gates is whoever works **in a checkout of the fusion source** — a fork, a
contribution, a vendored copy with its `.git` intact. If that is you, read the rest of this section.
If it is not, skip to *One halt that used to be waived*.

### `workbench-citation-lint.test.ts` — the one that surprises

Every citation a live workbench record makes of another record must resolve. The corpus is
recomputed from the tree on every run: the Circle records in every state, `portfolio.md`, the open
(`_o_`) issues, the live (`_o_` and `_a_`) decisions, and the live (`_o_` and `_p_`) plans, with
three frozen stores excluded at the workbench root — `archive/`, `stashes/` and
`.migration-v2-backup/`.

**Renaming a record's marker reddens the suite for whoever renames it, and that is the design rather
than a rough edge.** A marker move changes a filename, every citation that spelled the old marker
now points at nothing, and the run that made the move is the run that finds out. So does an archive
sweep, and so does a newly filed record that cites something wrongly — in both cases for somebody
who touched no citation and no code.

The failure names, per finding, the file, the line and the token, plus a `fix` line saying which of
the three repairs applies: spell the marker position as `_*_` so the citation survives the next
transition, name the store the record actually sits in, or give the full path. Two whole remedies
are stated in the message itself:

- **If the citation is a pointer — it exists to be followed — correct it.**
- **If it is a statement *about* a citation** — the record's subject is that some other file spells a
  marker wrongly, and correcting the spelling here would delete the finding — then it must not be
  written as an address at all. Name the file and the line and let the reader open it, or put the
  verbatim form in a fenced code block, which the scanner exempts for exactly this case.

**Adding the file to the example allowlist is not the remedy, and the gate says so in its own
failure text.** That exempts every citation in the file, including the ones that go stale later, and
the records likeliest to trip this gate are the records *about* stale citations — the files where a
new dead citation is likeliest and least visible. For the same reason the gate carries **no baseline
and no approvable count**: there is nothing here to re-approve, so the citation is the only thing an
author can edit to get back to green. Both properties were chosen deliberately at a user gate, with
the cost accepted rather than mitigated.

### `plan-stopping-section-lint.test.ts`

A live plan — `_o_` or `_p_` — must carry `## Where this Circle stops`, filled. Absent, empty, and
still-the-angle-bracket-placeholder are three named failures, each with its own remedy in the
message. Closed and deferred plans are out of the corpus: the section serves the Phase 4 question
that runs *before* a Circle closes, so the window in which it must exist is the window in which the
plan is live.

**Presence only, never substance.** Nothing judges whether a clause is good, complete or true. A
plan satisfies the gate with one clause of any quality. Whether the clauses hold is still the
question the orchestrator puts to a human at Phase 4, and it did not move here. That split is the
whole licence for building this: whether a heading carries a body is settled by reading the file,
and whether a stopping condition is correct is not.

`agents/planner.md` was reworded to say so. In v10.3 it read "nothing reads it mechanically"; it now
says a gate reads it for presence and never for substance.

### `committed-dist.test.ts`

`hooks/dist/*.js` is the artifact `install.sh` ships, and `install.sh` defaults to `heads/main`, so
every commit is installable. This gate extracts the committed source at `HEAD`, compiles it, and
fails when the result differs from the committed `hooks/dist/` — printing the differing files and
`npm run build` as the remedy.

It has a second, separate failure with a different cause and a different fix: the installed
TypeScript is not the exact version `hooks/package.json` pins. That pin moved from `^5.6.0` to
`5.9.3` in this release, because a compile is a function of its compiler and a range is not a pin.
The failure names this as a **toolchain mismatch and explicitly not an artifact defect**, so the
remedy is the install and never a rebuild — rebuilding under the wrong compiler commits a worse tree
than the one it repaired.

## One halt that used to be waived

**This is the only run-time behaviour in this release that can stop something you do.**

The shaper's portfolio-activation mode (mode 3) takes an audit line —
`**Initiated by:** <the question the user was asked, the option they chose, and the date>`. In v10.3
that line was required on a *dispatched* run and optional on a top-level one, and the shaper decided
which it was by testing whether it held `AskUserQuestion`.

**That self-test is gone, and the line is now required on every portfolio-activation run**,
dispatched or top-level, with no case exempt. Two headless probes on Claude Code 2.1.232 measured a
top-level `--agent fusion:shaper` run holding no `AskUserQuestion` either, so the tool separated
nothing and the waiver rested on a case that does not distinguish.

**What this means in practice.** If you run the shaper yourself with `**Mode:** portfolio-activation`
and no `**Initiated by:**` line, the run now halts and reports the contract violation where it
previously proceeded. Add the line. Every orchestrator dispatch already carries it, and `/fusion:next`
performs its activation writes without dispatching the shaper at all, so neither of those paths
changes.

The line is a claim, not a proof — an audit line is written by the party being audited, so it records
what the dispatcher says and cannot corroborate it. What it buys is that the claim is on the record,
legible to a later reader, and conspicuous by its absence.

## A project-local rule file now reaches `analyst`

`analyst` matches the filename pattern `*analyst*` in `./rules/` and `.claude/rules/`. Drop a
`./rules/analyst-capture-layout.md` into your project and it loads on every `analyst` run, with
nothing else to configure.

It is deliberately the one bare token `analyst` and not also `analysis`: `*analysis*.md` would sweep
up a project's own gap-analysis or impact-analysis documents, which are subject matter rather than
agent configuration.

**The two routes split by size, not by agent.** A small rule file loads by filename pattern; the
context manifest (`./rules/context-manifest.yaml`) carries anything large or topic-scoped, and stays
the documented route for both. Nothing here duplicates the manifest.

**If you upgraded from v9 and still hold an orphaned `./rules/investigator-capture-layout.md`,** this
is the cheap fix that did not exist when you read that note: rename it to
`./rules/analyst-capture-layout.md`. `*investigator*` matches no agent's pattern any more, so under
its current name it is loaded by nothing. `docs/upgrading-to-v9.md` §4 was rewritten in this release
to say so and to name the manifest as the other route.

## Also in this release

**`Retired:` now annotates an answered decision as well as an implemented one.** The footer line
already existed for the case where an implementation was deleted with no later decision overriding
it — `Superseded by:` stays reserved for that. It now covers `_a_` too: where the thing an answer
would have been realised against was removed before anyone built it, the body gains a `Retired:`
line and **the marker does not move**. The marker itself says which case a reader is in — on `_i_`
the citation names what removed the implementation, on `_a_` what removed the subject the answer
would have applied to. Nothing renames, so no glob, filter or count changes behaviour, and the
filename still reads as implemented or answered. A history pass has to open the body to learn
otherwise. Your existing records are untouched.

**A record that states something *about* a citation names file and line, or fences the verbatim
form.** A pointer and a statement about one are the same characters, and no reader — human or gate —
can tell them apart. So a record whose subject is that some other file spells a marker wrongly does
not spell that address itself: it names the citing line and lets the reader open it, or puts the
verbatim form in a fenced code block. This is now in
`rules/fusion-workbench-conventions.md`, which every agent loads, so agents write records this way
from here. Records you already have are not rewritten.

**Deleting a Circle has a written form now, and the obligation sits on the surviving references.**
Deletion and archival stay different operations: `/fusion:archive` *moves* a terminal Circle, so its
record survives and a citation of it is repaired by correcting the path, while deletion preserves
nothing and there is no corrected path to write. The Circle state vocabulary gets no seventh marker
for it, because a marker is carried by the record and the record is deleted with everything else. So
whoever deletes a Circle annotates every citation of it that survives elsewhere — in `portfolio.md`,
in a session history, in another Circle's `## Dependencies` — replacing the dead citation rather than
standing beside it:

```
Deliberately deleted 260805: Circle `260802-2220`, `throwaway-plane-bridge-smoke-test`.
```

The stamp and the slug go in separate spans and no store path is left behind. A reader recognises the
annotation by the literal opening `Deliberately deleted `. **This is a convention for a human, not a
mechanism**: `rules/circle-records.md` is emitted to `orchestrator`, `playmaker` and `shaper`, and a
person deleting a directory by hand reads none of it. Whether a dedicated delete command should find
the surviving references and apply the annotation is an open question the binding decision left open
and this release does not answer.

**A citation may now name a record inside one archive sweep, and a Circle record by path.** Two
additions to the citation grammar the gates share: `archive/<YYMMDD-HHMM>-<slug>/…` is accepted as a
leading segment, so a citation corrected to point at an archived copy scans as correct rather than as
the wrong store; and `circles/<dir>/_<marker>_circle.md` is recognised as a form of its own, since a
Circle record carries neither the stamp nor the slug the other patterns anchor on. Both matter to you
only if you run the instrument yourself.

## What you have to do

**For most projects, nothing.** No workbench file is rewritten, no marker moves, no configuration key
changes, and no agent, skill or slash command arrived or left in this release.

Two things worth doing once, if either applies:

- **Add the `Initiated by:` line to any shaper invocation you run by hand** in portfolio-activation
  mode. Without it the run halts.
- **Rename an orphaned `./rules/investigator-capture-layout.md`** to `analyst-capture-layout.md`, if
  you carried one across from v9 and never registered it in the context manifest.

And one thing not to do: **do not go tidying citations in your own workbench to pre-empt a gate that
does not run there.** The corpus is fusion's own tree.

## What did not change

The workbench layout, the state marker vocabularies and their transitions, the directory structure,
and the portfolio. The decision-record template is as v10.3 left it, `Status:`-less head included,
and the Circle record is as v10.2 left it. Configuration is untouched: `fusion.json`, its one live
setting and the two v10 migration advisories behave exactly as they did. The hook layer is unchanged
and still decides nothing — the guard allows every call it sees, and no gate in this release runs
inside a session. The agent, skill and slash-command roster is unchanged. The Phase 4 stopping-
conditions question, new in v10.3, is unchanged: it still reads the clauses back to you and still
judges none of them.

## Where to read more

- `README-hooks.md` `### Three gates that can fail the suite over text nobody compiled` — the three
  in one table, with what each failure names.
- `hooks/lib/__tests__/workbench-citation-lint.test.ts` — the corpus predicate, the reading it takes
  and the hole it has, all stated at the top of the file.
- `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` — why presence and not substance, and why
  this is not the undecidable question two removed mechanisms asked.
- `hooks/lib/__tests__/committed-dist.test.ts` — the chain of preconditions and the two distinct
  failures.
- `agents/shaper.md` mode 3 — the unconditional `**Initiated by:**` requirement and the four halts it
  sits among; `README-agents.md` `## Dispatch parameters` for the row.
- `rules/fusion-workbench-conventions.md` — the widened `Retired:` line and the statement-versus-
  pointer convention.
- `rules/circle-records.md` `### Deletion is outside the vocabulary` — the annotation form.
- `docs/upgrading-to-v10-3.md`, `docs/upgrading-to-v10-2.md` and `docs/upgrading-to-v10.md` — the
  previous notes, if you are coming from further back and skipped one.
- `/fusion:help` — install, update and configure, answered from your live installation.

The records behind every change here, with the measurements and the options weighed against each
other, are in fusion's own workbench in the source repo.
