# Upgrading to fusion v13 (from v12.2.3)

v13 moves every record's **state** out of Markdown and into JSON control files that one codec
writes. The text of every record stays Markdown. Nothing you type changes, and no agent was
renamed. What changes is where a status lives and who may write it: a status is no longer a head
line or a letter in a filename, and nothing renames a file or edits a control file by hand to
change one. Every change goes through `bin/fusion-write`, which sends one operation to the codec.

**One thing reaches every project the day you update.** A workbench set up under v12 is *legacy*
to v13, and every agent stops at Setup on it until `/fusion:migrate` has converted it. A new
workbench made by `/fusion:setup` under v13 is JSON from the start and needs no migration.

**What v13 needs on the machine:** Node `>=20.12.0`, the `engines` floor of `codec/package.json`
and `hooks/package.json`. The migration checks it before its first codec call and stops with a
`REFUSED` line when `node` is missing or older.

## What becomes JSON and what stays Markdown

| Surface | v12 | v13 |
|---|---|---|
| A work package's state, holder, mode, edges and adopted plan | head lines `**Status:**`, `**Claim:**`, `**Mode:**`, `**Depends-on:**`, `**Active spec/plan:**` in the record | the fields `status`, `claim`, `mode`, `depends_on`, `active_documents` of `package.json`, beside the narrative in the container |
| An issue's, plan's, discussion's or decision's state | the marker in its filename (`_o_`, `_a_`, …) | `control.state` of `<stem>.record.json`, beside the narrative |
| A plan's step progress | `[IN PROGRESS]` and `[DONE]` on the numbered step | `steps` in the plan's control file; the step's number is its anchor |
| A reviewer's verdict on a package | prose in the review | an evidence record, `<stem>[.<n>].evidence.json`, beside the review |
| The workbench as a whole | `.fusion-setup` alone | `workbench.json`, the manifest, beside it; `.json-state/` holds the codec's lock and journal and never travels |
| Every narrative: a package's brief, a plan's text, an issue's description, a decision's body, the `Resolved:` and `Answered:` lines | Markdown | Markdown, unchanged |
| Reviews, analyses, consultations, memos, forum entries, history, the archive | Markdown, no state | Markdown, no state, unchanged |

**A controlled record is a pair**: its narrative and its control file. Both halves move, archive
and commit together; `bin/fusion-staging-drift` names a pair whose halves are staged apart
(`PAIR-SPLIT`). A record filed under v13 has a marker-free name, `YYMMDD-HHMM-<topic>.md`. A name
written before the migration keeps its marker, and that letter is history: it says where the
record stood at the migration and is never read for state. Every citation you have still resolves,
because the citation grammar is unchanged. The definitions are
`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`, `## Work packages` and
`## Inline State Tracking`.

## What a legacy workbench meets

- **Every agent stops at Setup.** `bin/fusion-paths` cannot resolve the item in scope on a legacy
  workbench and exits 3, and the agent stops and tells you to run `/fusion:migrate`. That is the
  whole of the stop: nothing is written, nothing is half-done.
- **`/fusion:wp`, `/fusion:discuss` and `/fusion:archive` refuse it by name**, and so do
  `bin/fusion-citation-check`, `bin/fusion-plan-size` and `bin/fusion-work-order`, each pointing
  at `/fusion:migrate`.
- **`bin/fusion-citation-sweep` still rewrites it**, as a rewriter only, because `/fusion:migrate`
  runs the sweep before it converts anything.
- **`/fusion:setup` still runs on it**, and refuses one that still carries a v11 store name.

## Migrating your workbench

One checkout does this, once, for the whole project. Read `## More than one checkout` below first
if the project has more than one.

1. Update the installation (`## Two installations on one machine` below says how, if other
   projects on the machine are not migrating yet), then start a fresh session.
2. Commit or stash what is in flight. The store rename stops on uncommitted changes under a store
   it renames, and a clean tree keeps the migration's commits apart from other work.
3. Run `/fusion:migrate`. In order:
   - **Store names.** A workbench still on the v11 names is renamed first, as under v12, after one
     question. A workbench already on `work-packages/`, `plans/` and `consultations/` skips this.
   - **Citation repairs.** The sweep lists citations that spell a renamed store and asks whether to
     write the repairs.
   - **The JSON migration** (`skills/migrate/SKILL.md` `## Step 7 — Repair, then migrate to JSON control`).
     Node is checked, then `bin/fusion-migrate survey` reads the workbench and writes nothing. It
     shows what it found and the values the Markdown never recorded and the migration derives
     instead (below, under the limits). Only a *blocking* finding asks a question, one at a time.
     Then it asks once: migrate now, or not now.
4. On "migrate now" it backs the workbench up outside itself, freezes a plan, writes the control
   files in chunks, verifies every pair, reference and hash, and only then writes `workbench.json`.
   The receipt lands under `archive/migrations/<id>/`. Live narratives lose their status head lines,
   which the control files now carry; terminal records are not rewritten.
5. Commit in the split the report names: the repairs, if any; the originals and the record pairs;
   the rewritten records; the manifest. Push.

**What it asked, measured.** The migration was run on three copies of real workbenches, fusion's
own and two others, between roughly 140 and 750 records each, on 2026-10-04 and on a build before
the release. On each copy the JSON step asked **one question**, whether to migrate now: no
finding was blocking, so no repair was asked. The run took between about 12 and 70 seconds. A second run on
each copy answered `result=no-op` and sent nothing. A run killed inside a chunk resumed and
finished. Every value the Markdown never recorded was derived or carried as unknown, marked as such
in its record, and not asked about.

**If it is interrupted**, run `/fusion:migrate` again: it asks whether to continue or undo, and a
re-run never starts a second plan.

**Undo.** `bin/fusion-migrate rollback` restores the workbench from the migration's own journal
while no ordinary write has followed it. The first ordinary write, such as a claim, a filed issue
or a transition, ends that: the rollback is refused from then on, and the way forward is a fix
rather than a return. `bin/fusion-migrate status` says where a workbench stands.

## More than one checkout

The migration is one act for the project, and the other checkouts take it over by git. The order
matters, because nothing in a v12 installation can read what the migration writes.

1. **Quiesce.** End every other fusion session that writes this workbench, on every machine. Each
   other checkout commits and pushes what it has, so the migrating checkout pulls it in and the
   migration converts it.
2. **One checkout migrates**, as above, and pushes.
3. **Every other checkout, before its next write:**
   1. lists its untracked records: `git status --porcelain --untracked-files=all fusion-workbench`;
   2. updates its installation to v13 and restarts;
   3. pulls.

   A record that was untracked at the pull has no control file, so the codec does not know it.
   Rename it to its marker-free name and file it with `bin/fusion-write create`; it starts in its
   kind's initial state, and a later `transition` puts it where it stood. Nothing migrates it for you.
4. Do not migrate a second time in another checkout: the project would have two migrations and
   two receipts for one workbench.

**Every installation that writes the workbench must be on v13 before it writes again.** A v12
installation cannot see `workbench.json` and keeps writing Markdown status lines that v13 does
not read. Nothing detects this; only the order above prevents it (see the first limit below).

## Two installations on one machine

Until 13.0.0 is released, a v13 build runs from an install home of its own, `~/.fp`, through a
launcher of its own, and your existing install in `~/.fusion` stays as it is for every other
project until you replace it yourself:

```bash
FUSION_REF=heads/<branch> FUSION_HOME=~/.fp FUSION_BIN=<a directory of its own> bash install.sh
```

Both launchers are named `fusion`, so start the v13 one by its full path, and open a migrated
project only through it.

**Never run `fusion --update` from the v13 launcher.** It downloads `install.sh` from `main` and
runs it with no variables, which reinstalls `heads/main` into `~/.fusion`. To refresh the v13
install, run the installer again with the same three variables.

The same arrangement serves after the release, for a machine whose projects do not all migrate on
the same day: pin the release with `FUSION_REF=tags/v13.0.0` into a separate home, migrate one
project at a time, and keep the old launcher only for the projects not yet migrated.

## Documented limits

Each of these is known, stated, and not handled by anything shipped.

- **A v12 installation writing after the migration is detected by nothing.** A new manifest cannot
  lock an old program out. If a session started through a v12 launcher edits a migrated workbench,
  its Markdown status lines are written beside control files that say otherwise, and no hook,
  helper or check reports it. The procedure under `## More than one checkout` is the only guard.
- **The codec's `narratives` findings reach no reader.** `reconcile` reports a status head line kept
  in a live narrative in its `narratives` section (described in `codec/README.md`), which is the
  one trace such a v12 write leaves. No shipped prompt, helper or hook reads that section.
- **There is no takeover of a stale claim.** A package another checkout holds stays claimed until
  that checkout releases or transitions it; `bin/fusion-write` refuses everyone else, and no flag
  overrides it. A takeover needs a codec revision that does not exist yet.
- **A `succeeded` dependency is met only by a finish that binds an accepted review.** `depends_on`
  takes two conditions: `terminal` (the target is `done` or `dropped`) and `succeeded` (`done` with
  an accepted evidence binding in its outcome). The orchestrator's closure finishes a package with
  `--evidence` naming its closing review's evidence record, so the edge is met when that review
  recorded `accept`. A closure with no review, or a verdict of `revise` or `escalate`, leaves it
  unmet. A binding made with `bin/fusion-write attach-evidence` alone never meets it, because it is
  not the outcome's. A package you finish by hand needs `transition --to done --outcome <value>
  --evidence <evidence control path>`, sent before anything is appended to its narrative. Every edge
  the migration converts is `terminal`, and an imported `done` package carries the outcome
  `legacy-completed`, which never meets `succeeded`.
- **Unknown filers stay unknown, and the person is taken from git.** Where a record never said who
  filed it, the migration writes the actor `legacy-unknown` and takes the person from the author of
  the commit that first added the file, following renames. Both are marked as derived in the
  record's provenance, and neither is asked. Without a git repository the person is unknown too.
- **A plan step's number is its anchor.** Step progress binds to the number of a step under
  `## Implementation Steps`. Renumbering steps, or inserting one, after the plan is filed breaks
  that binding: `transition --steps` updates only the anchors the plan already has. A step mark
  the migration found outside a numbered step is kept in the record's import provenance as
  unanchored, and tracks nothing.
- **`bin/fusion-citation-check` reports an ambiguous citation as a `conflict`, and the blocking
  lint does not.** On a JSON-controlled workbench a citation token that matches more than one
  record is a `conflict` row. In a file the checker counts as edited it makes
  `verdict=violations`; anywhere else it is counted and printed and leaves the verdict alone. The
  usual sources are a bare package name that exists both live and inside an archive sweep, and a
  stamp cited without its slug. The repair is to spell the citation out until it names one
  record. The blocking citation lint (`hooks/lib/__tests__/workbench-citation-lint.test.ts`) still
  counts such a token as resolved, so the two readers differ on this point.
- **Prior's qualification is a release fact, not a runtime dependency.** The codec bundle shipped
  in `codec/dist/` is the one Prior qualified, by digest. fusion runs in Claude Code with no Prior
  installation, binary, service or variable, and nothing at run time checks that qualification.
- **Six agent behaviours on a JSON workbench were never observed.** The opt-in suite that
  dispatches agents headless does not reach them, as
  `261007-2348-agent-dispatch-and-skill-block-observation-at-495aca7d.md` records:
  - the orchestrator's interactive approval paths: a `-p` run answers no question;
  - a closure whose review returns `revise`, so a finish binding that verdict. Under `autonomous`
    the orchestrator may instead hold a closure whose work is visibly not done on disk (a
    `gate_hit`, the package left `claimed`), and that hold is all the suite has seen;
  - `policy-curator` apply mode, which waits on the user's approval of a ledger;
  - `reviewer` with `**Review domain:** ontology`;
  - `state-auditor` with live records to reconcile and a stated `**Directive:**`;
  - repetition: each case ran once, and one run proves one run.

## What needs no action

- **Your citations.** The grammar is unchanged, and a marked basename cited with its marker
  wildcarded resolves as before.
- **`fusion.json`, your `.claude/` settings, your commit lock and your voice profiles.** Unchanged.
- **The archive.** Nothing in `archive/` is rewritten; the migration adds its receipt there.

## Where to read more

- `rules/fusion-workbench-conventions.md` `## Work packages`: every control field and the one
  `bin/fusion-write` subcommand that writes it.
- `skills/migrate/SKILL.md`: the migration's own steps, questions and refusals.
- `bin/fusion-write` and `bin/fusion-migrate`: each header is the authoritative documentation of its
  subcommands and exit codes.
- `docs/upgrading-to-v12.md`: the store renames, if you are coming from v11.
