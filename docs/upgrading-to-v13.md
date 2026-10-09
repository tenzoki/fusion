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

`fusion --update` installs 13.0.0 into `~/.fusion`, and from then on every project on the machine
that it serves is legacy until migrated. For a machine whose projects do not all migrate on the
same day, install the release into a home and launcher of its own, and keep your existing install
in `~/.fusion` for the projects not yet migrated:

```bash
FUSION_REF=tags/v13.0.0 FUSION_HOME=<a home of its own> FUSION_BIN=<a directory of its own> bash install.sh
```

Both launchers are named `fusion`, so start the v13 one by its full path, and open a migrated
project only through it. Migrate one project at a time.

**Never run `fusion --update` from the v13 launcher.** It downloads `install.sh` from `main` and
runs it with no variables, which reinstalls `heads/main` into `~/.fusion`. To refresh the v13
install, run the installer again with the same three variables.

## Documented limits

Each of these is known, stated, and not handled by anything shipped. Each closes on what shows
it: a test that asserts it, or, for an absence, the search that finds no reader, at 13.0.0.

- **A v12 installation writing after the migration is detected by nothing.** A new manifest cannot
  lock an old program out. If a session started through a v12 launcher edits a migrated workbench,
  its Markdown status lines are written beside control files that say otherwise, and no hook,
  helper or check reports it. The procedure under `## More than one checkout` is the only guard.
  Shown by absence: a v12 client predates `workbench.json` and has no code that reads it, and no
  shipped file outside the codec's `reconcile` (next bullet) compares a narrative's `**Status:**`
  line with its control file; `bin/fusion-work-order`, `hooks/lib/scope.ts` and
  `hooks/lib/work-graph.ts` each state in their header that they read none.
- **The codec's `narratives` findings reach no reader.** `reconcile` reports a status head line kept
  in a live narrative in its `narratives` section (described in `codec/README.md`), which is the
  one trace such a v12 write leaves. No shipped prompt, helper or hook reads that section. Shown by
  `codec/src/__tests__/ops.test.ts` ("narratives: every status line in the head of a live
  narrative…", and the case after the recorded `02-transition`) for the report, and by absence for
  the reader: `narratives` appears in no shipped caller of `reconcile`.
- **A stale claim is taken over on your word, and nothing checks that the old checkout stopped.**
  A package another checkout holds stays claimed until that checkout releases or transitions it,
  or until `bin/fusion-write claim --record <package> --take-over-from <checkout> --source <JSON>`
  gives the claim to this checkout and appends one entry to the package's
  `provenance.claim_transfers`; `release` and `transition` by anyone but the holder are still
  refused. The orchestrator sends a takeover only on your explicit word in the conversation that
  names the package, its holder and this checkout as the new holder, after you say the former
  checkout is gone or has stopped writing. It files your words verbatim in a decision record in the
  package's container, moves that record to `answered` as ruled by you, and cites it as `--source`. `mode` `autonomous` never answers it,
  and a second transfer asks again. Your statement that the former checkout is gone is a
  procedure, not fencing: a copy of its checkout identity, or a session that is disconnected but
  still running, is not stopped by it. That the cited record resolves shows that the record
  exists, not that you consented. Shown by `codec/src/__tests__/round-trip-cli-takeover.test.ts`
  (Prior's eight cases over thirty-seven recorded exchanges), `hooks/lib/__tests__/record-write.test.ts`
  (`describe("takeover, request 62")`, and the owner-only release case) and, for the procedure,
  `agents/orchestrator.md`'s **Take over** row and its `autonomous` sorting, which lists take over
  among the operations that ask as written. No input to the codec or the client says whether a
  checkout has stopped, so nothing can test that it did.
- **A client older than the takeover's codec revision must not share a workbench with one that
  writes takeovers.** Run no old and new codecs on one workbench, and write no takeover before every
  client of that workbench runs the new codec: replace or quiesce the others first, as under
  `## More than one checkout`. Measured with the old bundle (`sha256:c76bbce9…`) in
  `codec/src/__tests__/round-trip-cli-takeover.test.ts` ("the version boundary"): on a package that
  carries a transfer, `validate`, `release` and `transition` are refused `schema-invalid` and a
  takeover request is refused by its protocol, and no byte moves, but `show` returns it as stored,
  because `show` does not validate. An unscoped `validate`, the one aggregate operation measured,
  answers that the workbench is not valid, its findings naming exactly the packages that carry a
  transfer. Other operations were not measured, the aggregates `list`, `reconcile` and `inspect`
  among them, so treat a workbench holding such a package as not readable by old clients as a whole.
- **A `succeeded` dependency is met only by a finish that binds an accepted review.** `depends_on`
  takes two conditions: `terminal` (the target is `done` or `dropped`) and `succeeded` (`done` with
  an accepted evidence binding in its outcome). The orchestrator's closure finishes a package with
  `--evidence` naming its closing review's evidence record, so the edge is met when that review
  recorded `accept`. A closure with no review, or a verdict of `revise` or `escalate`, leaves it
  unmet. A binding made with `bin/fusion-write attach-evidence` alone never meets it, because it is
  not the outcome's. A package you finish by hand needs `transition --to done --outcome <value>
  --evidence <evidence control path>`, sent before anything is appended to its narrative. Every edge
  the migration converts is `terminal`, and an imported `done` package carries the outcome
  `legacy-completed`, which never meets `succeeded`. Shown by `codec/src/__tests__/transitions.test.ts`
  (the four `succeeded:` cases) and `hooks/lib/__tests__/record-write.test.ts` (a finish with
  `--evidence` naming an accepted review makes the waiting package ready; one without leaves it
  blocked).
- **Unknown filers stay unknown, and the person is taken from git.** Where a record never said who
  filed it, the migration writes the actor `legacy-unknown` and takes the person from the author of
  the commit that first added the file, following renames. Both are marked as derived in the
  record's provenance, and neither is asked. Without a git repository the person is unknown too.
  Shown by `hooks/lib/__tests__/migrate.test.ts` ("takes the person from git's first add, through a
  staged rename too, else carries it unknown with the reason…") and the `describe` on the reserved
  actor in `codec/src/__tests__/migration.test.ts`.
- **A plan step's number is its anchor.** Step progress binds to the number of a step under
  `## Implementation Steps`. Renumbering steps, or inserting one, after the plan is filed breaks
  that binding: `transition --steps` updates only the anchors the plan already has. A step mark
  the migration found outside a numbered step is kept in the record's import provenance as
  unanchored, and tracks nothing. Shown by `hooks/lib/__tests__/record-write.test.ts` (a plan filed
  by `create` anchors each numbered step), `codec/src/__tests__/ops.test.ts` (an id the plan lacks is
  `unknown-step-id`, nothing written) and the `mark-outside-numbered-step` case of
  `hooks/lib/__tests__/legacy-import.test.ts`.
- **`bin/fusion-citation-check` reports an ambiguous citation as a `conflict`, and the blocking
  lint does not.** On a JSON-controlled workbench a citation token that matches more than one
  record is a `conflict` row. In a file the checker counts as edited it makes
  `verdict=violations`; anywhere else it is counted and printed and leaves the verdict alone. The
  usual sources are a bare package name that exists both live and inside an archive sweep, and a
  stamp cited without its slug. The repair is to spell the citation out until it names one
  record. The blocking citation lint (`hooks/lib/__tests__/workbench-citation-lint.test.ts`) still
  counts such a token as resolved, so the two readers differ on this point. Shown by
  `hooks/lib/__tests__/fusion-citation-check.test.ts` ("…reports a conflict and an unresolved UUID")
  for the checker, and for the lint by `hooks/lib/citation-scan.ts`, whose `scanRecordCitations()`
  counts an `ambiguous` token as resolved; no test asserts that side.
- **Prior's qualification is a release fact, not a runtime dependency.** The codec bundle shipped
  in `codec/dist/` is meant to be the one Prior qualified, by digest; the record of that
  qualification is Prior's answer in `codec/fixtures/prior/REQUESTS.md`, and the release states the
  digest it ships. fusion runs in Claude Code with no Prior installation, binary, service or
  variable, and nothing at run time checks that qualification: `bin/fusion-record` runs the bundle
  with `node` and compares no digest. `codec/src/__tests__/committed-bundle.test.ts` shows only
  that the committed bundle is the build of the committed source.
- **Eight agent behaviours on a JSON workbench were never observed.** The opt-in suite that
  dispatches agents headless did not reach the first six, as
  `261007-2348-agent-dispatch-and-skill-block-observation-at-495aca7d.md` records; the last two were
  added to it later:
  - the orchestrator's interactive approval paths: a `-p` run answers no question;
  - a closure whose review returns `revise`, so a finish binding that verdict. Under `autonomous`
    the orchestrator may instead hold a closure whose work is visibly not done on disk (a
    `gate_hit`, the package left `claimed`), and that hold is all the suite has seen;
  - `policy-curator` apply mode, which waits on the user's approval of a ledger;
  - `reviewer` with `**Review domain:** ontology`;
  - `state-auditor` with live records to reconcile and a stated `**Directive:**`;
  - repetition: each case ran once, and one run proves one run;
  - the orchestrator's takeover on your word, case (i) of
    `hooks/lib/__tests__/agent-dispatch-observation.test.ts`;
  - the orchestrator sending no takeover under `autonomous` without your word for it, case (j) of
    the same file. Both cases were written after that run and have not been run.

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
