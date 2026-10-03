# Analysis: FJ04 step 12, the proof on copies of real workbenches

**Date:** 2026-10-03 10:04
**Type:** Feasibility (the proof run of plan step 12)
**Status:** Complete. The step is stopped short: no copy could migrate, see N1.
**Requested by:** orchestrator, work package 260928-1338-json-control-data-and-markdown-artefacts
**Cross-references:** 261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md (step 12, and the Done notes of steps 2, 6, 8, 9, 10a, 11)

## Question

Plan step 12 asks whether the shipped 13.0.0 helpers, installed as in step 11 and run with no Prior runtime present, migrate copies of three real workbenches. The step names the figures each copy must give.

The dispatch adds a rule. A repair answer is supplied only when somebody recorded it. A finding whose value nobody recorded stays blocking and is counted. If such findings block a copy's migration, that is reported as a named finding for the copy.

## Scope

**Repository.** fusion at HEAD `76ba852fdd629ae409b6f377f8dafd69fab3162d`, committed 2026-10-03T09:56:08+02:00, branch `fj-json-workbench`. Against `origin/fj-json-workbench` it is 195 ahead and 0 behind. The working tree has one change, ` M fusion-workbench/orchestrator-events.jsonl`, and no copy was taken from the working tree.

**The three copies.** All three are in the scratchpad under `fj04-step12/`. Labels follow the plan head's confidentiality line. The two other projects appear in this report as aggregate figures only.

| Copy | Source | How it was copied | Source workbench tree hash, before | After (end of run) |
|---|---|---|---|---|
| fusion | commit `76ba852f` of this branch; `fusion-workbench` git tree `486d2702` | `git clone --no-hardlinks`, then `checkout 76ba852f`, then remote removed | `fa9fe97c…ec8a` (3 126 files, 311 dirs) | `fa9fe97c…ec8a`, re-extracted by `git archive 76ba852f fusion-workbench` |
| krk | `main` at `f87d8c6732a1` (read from `.git/refs`, no git command run) | `cp -a` of `.git`, the root `.gitignore` and `fusion-workbench/` | `21105877…d329` (2 228 files, 198 dirs) | `21105877…d329`, equal |
| axibra-4 | `main` at `0d39459cea8b` (read from `.git/refs`) | the same as krk | `afe10941…38a5` (8 022 files, 973 dirs) | `afe10941…38a5`, equal |

The source hashes were taken three times for each project: before the copy, right after it, and at the end of the run. All three agree for each project. No helper was run against a source path.

The hash is SHA-256 over the sorted lines `path, kind, sha256-or-link-target` of every entry (`treehash.mjs`). The hash names the workbench. It does not cover the `.git` directory or the rest of the project. Before this run, two read-only `git status` calls had been made on each source to read its branch. They change no file in the workbench.

**The copy of krk was renamed first.** Its stores still carried the v11 names. The installed `skills/migrate/SKILL.md` Steps 1, 2 and 4 ran verbatim (`skillblk.sh`), as in step 11:

- the guard printed `INSTALLED=13.0.0 WINDOW=open`;
- the survey printed `FOUND=1 LEGACY=0 COLLISIONS=0 DIRTY=0 UNKNOWN=0`;
- the apply printed `moved=72 mv-fallbacks=0 collisions=0 left=0 mode=git`.

The renames were then committed in the copy as scratch commit `4647f65`, the step Step 5 of the skill names. The re-survey printed `FOUND=0 DIRTY=0`. Step 6's citation sweep was not run, as in step 11, because its write is a separate choice the user makes.

**Install, Node and machine.** The install was built the way step 11 built it (`build-install.sh`):

1. `git archive HEAD` into `src/fusion-head`, with the working tree's `install.sh`, `bin/fusion-record` and `.gitignore` copied over it. All three equal HEAD.
2. The tree was packed into a tarball.
3. `install.sh` was run with `env -i`. `PATH` was one directory holding `node`, the host tools and stub `curl`/`claude`. The run also set `FUSION_HOME`, `FUSION_BIN` and a scratch `HOME`.

What the install reported:

- the installer printed `fusion 13.0.0 installed.` and exited 0;
- the installed `plugin.json` reads `13.0.0`;
- the installed bundle `codec/dist/fusion-record.js` is 678 774 bytes, `sha256:c71e219efde6ec59f4f268ed820ba8bdd48067cb48fbe2521d7934e087e02fa6`, which is step 6's digest.

The machine is an Apple M2 Max with 64 GiB, macOS 26.6.2, Node v25.7.0 (`/opt/homebrew/bin/node`). An unrelated Go test run was using about 7 cores during the timed series, so every timed series below gives its load.

**Environment of every helper call (Prior absent).** `fm.sh` and `skillblk.sh` run each call under `env -i` with three variables and nothing else:

- `PATH=<install>/path:<install>/path-identity:<install>/path-skill`. These are step 11's three directories: node, bash and core tools, and the two stubs; then git, od, tr, grep, sort, wc and ls; then date, awk, basename, mv and rmdir.
- `HOME`, a fresh directory per copy and purpose under `fj04-step12/homes/`.
- `FUSION_PLUGIN_ROOT=<install>/home`.

`env -i … /usr/bin/env` printed exactly these three. `ls` over the three PATH directories finds nothing matching `/prior/i`. Every HOME was created empty for this run. No Prior checkout, binary or variable was present.

**Git identity in the copies.** `bin/fusion-identity`, which the readers call, refuses a repository with no `user.name`. Each copy therefore got a repo-local `user.name 'Step12 Scratch'` and `user.email step12@example.invalid`. No record value was taken from this identity.

## Findings

### Per copy: what the plan asks, and what was measured

`n/a (N1)` means the figure needs a migrated store, and N1 says why no copy migrated.

| Plan item | fusion | krk | axibra-4 | Command |
|---|---|---|---|---|
| Digests, Node, machine | see Scope | see Scope | see Scope | `treehash.mjs`, `build-install.sh` |
| `eligible_sha256` (survey) | `875fd7e3…daab` | `b62689d8…4973` | `eaf0161b…7e6f` | `fm.sh <copy> <home> fusion-migrate survey` |
| Cut: package live / terminal | 2 / 41 | 1 / 24 | 70 / 46 | same |
| Cut: record live / closure | 99 / 0 | 148 / 0 | 627 / 1 | same |
| Cut: plain terminal / empty container | 1 146 / 0 | 1 005 / 0 | 988 / 0 | same |
| Blocking findings, before repair | 25 | 60 | 277 | `fusion-migrate survey`, `repair --list` |
| Repairs applied | 0 | 0 | 0 | N1 |
| Blocking findings, after repair | 25 | 60 | 277 | `fusion-migrate run` (stderr count) |
| Questions `repair --list` puts (all / unconditional) | 54 / 49 | 122 / 122 | 636 / 569 | `grep -c '^ask='` over `repair --list` |
| `run` | exit 6, "25 blocking findings remain" | exit 6, 60 | exit 6, 277 | `fm.sh … fusion-migrate run` |
| `run` time (backup, then refusal), median / max of 3, fresh HOME each | 1.56 / 1.63 s | 1.33 / 1.37 s | 3.42 / 3.43 s | `t.mjs 1 - fm.sh … run` ×3 |
| Workbench after `run` | byte-identical | byte-identical | byte-identical | `treehash.mjs` before and after |
| Helper `survey` time, median / max of 3 | 0.69 / 0.70 s | 0.54 / 0.56 s | 1.08 / 1.09 s | `t.mjs 3 - fm.sh … survey` |
| Codec `migration survey` answer bytes (against 16 MiB = 16 777 216) | 813 005 | 585 337 | 2 048 186 (12.2 %) | `t.mjs 3 <req> fm.sh … fusion-record` |
| Codec `survey` time, median / max | 0.38 / 0.40 s | 0.35 / 0.35 s | 0.62 / 0.62 s | same |
| Unscoped `list` answer bytes and time, on the **legacy** store | 241 B, `state:legacy`, `records:[]`; 0.29 / 0.29 s | 241 B; 0.28 / 0.28 s | 241 B; 0.31 / 0.32 s | same, `{"op":"list"}` |
| `reconcile` answer bytes and time, on the **legacy** store (against 5 s) | 330 B, `checked:0`; 0.31 / 0.32 s | 330 B; 0.31 / 0.31 s | 330 B; 0.35 / 0.37 s | same, `{"op":"reconcile"}` |
| `list` and `reconcile` over the migrated store | n/a (N1) | n/a (N1) | n/a (N1) | none |
| Chunk count, time per chunk and per phase | n/a (N1) | n/a (N1) | n/a (N1) | none |
| Index and receipt hashes | n/a (N1) | n/a (N1) | n/a (N1) | none |
| Second run's no-op | n/a (N1) | n/a (N1) | n/a (N1) | none |
| Kill inside a chunk, resumed | n/a (N1) | n/a (N1) | n/a (N1) | none |
| Full rollback to the tree hash | n/a (N1) | n/a (N1) | n/a (N1) | none |
| First rollback after activation with baseline; chunk-0 cleanup, timed | n/a (N1) | n/a (N1) | n/a (N1) | none |
| Rollback refused after one `create` | n/a (N1) | n/a (N1) | n/a (N1) | none |
| One open and one terminal record read back through each shipped reader | n/a (N1); on the legacy store see N2 | n/a (N1); N2 | n/a (N1); N2 | `fm.sh … <reader>` |

Load for the timed series: the 1-minute load was 8.0 to 8.7 and the 5-minute load 12.2 to 12.7 throughout, recorded by `t.mjs` before and after each series. The first single `run` per copy ran at a 1-minute load of 9.5. The three-run `run` series printed only its per-run line and no load figure. It ran between the survey series, whose loads were 8.0 to 8.7.

### Findings by class (before repair = after repair, since no repair was applied)

Blocking classes, with the value each one asks for (fusion / krk / axibra-4):

| Class | fusion | krk | axibra-4 | Value `repair --list` asks |
|---|---|---|---|---|
| `filed-by-missing` | 0 | 56 | 128 | actor and person |
| `filed-by-not-owed` | 18 | 0 | 48 | actor and person |
| `filed-by-unreadable` | 0 | 0 | 6 | actor and person |
| `answered-without-answer-line` | 2 | 2 | 19 | section, summary, the ruler's actor and person |
| `mark-outside-numbered-step` | 5 | 0 | 65 | a ruling: move or remove, and which step |
| `unknown-step-mark` | 0 | 0 | 3 | a ruling: which mark |
| `duplicate-step-number` | 0 | 0 | 5 | a ruling per known citation, 7 to 19 citations each |
| `unresolvable-active-document` | 0 | 0 | 2 | a ruling: which document, or move the binding to cross-references |
| `active-document-role-unclear` | 0 | 0 | 1 | a ruling: spec or plan |
| `circle-deferred` | 0 | 2 | 0 | a ruling: `paused` or `dropped` |
| **Total** | **25** | **60** | **277** | |
| of which need an actor or person | 20 | 58 | 201 | |
| of which need a ruling | 5 | 2 | 76 | |

`unrepairable=` is 0 in all three. **Every one of the 362 blocking findings asks at least one value, and none can be applied with consent alone.**

Reported classes:

| Class | fusion | krk | axibra-4 |
|---|---|---|---|
| `live-record-in-terminal-container` | 49 | 50 | 174 |
| `reference-not-a-citation` | 45 | 55 | 161 |
| `answer-ref-self` | 21 | 9 | 67 |
| `decision-line-disagrees-with-marker` | 33 | 40 | 43 |
| `status-head-in-live-record` | 14 | 17 | 63 |
| `circle-head-disagrees-with-marker` | 15 | 10 | 12 |
| `terminal-value-without-v1-state` | 0 | 0 | 5 |

Against step 8's measurement, fusion fell from 30 to 25 blocking findings: `filed-by-not-owed` went from 21 to 18, `answered-without-answer-line` from 1 to 2, `mark-outside-numbered-step` stayed at 5, and `duplicate-step-number` went from 3 to 0. krk stayed at 60. axibra-4 stayed at 277, on a newer commit than step 8's.

### The helper refuses to guess (shown on each copy)

The first blocking finding of each copy was applied in two ways:

- `repair --apply <id> --consent` with no `--value` exits 6: "not applied: unanswered: action" (fusion and axibra-4) or "unanswered: status" (krk). It adds "Nothing was written."
- `repair --apply <id>` without `--consent` exits 6: "not applied: no-consent: <class>".

The workbench tree hash is equal before and after each copy's calls.

### The run without `.git`

The copy without `.git` is `w/krk-nogit`: the renamed krk workbench, without `.git` and without the minted `.checkout-id`.

- `survey` exits 0. Its output equals the git copy's line for line, the `eligible_sha256` (`b62689d8…4973`) included.
- `run` exits 6 with the same 60 blocking findings.

The run printed no `reported=git` line, for the reason given in N3.

### N1 (fusion, krk, axibra-4): migration blocked on every copy, because no finding's value was recorded

`run` refuses with exit 6 on all three copies, with 25, 60 and 277 blocking findings. Each refusal leaves the workbench byte-identical. Each takes the external backup first, into the session under that copy's HOME.

Every blocking finding asks either an actor and a person or a ruling. No such answer is recorded for any of these 362 findings. The shipped skill forbids filling them from what is at hand: `skills/migrate/SKILL.md` Step 7, "A missing actor or person is asked, never filled: not from git, not from the session, not from a neighbouring record". The dispatch forbids guessing a ruling. So 0 repairs were applied.

On fusion and krk the rulings alone (5 and 2) would still block, even if the actors could be sourced.

This leaves the plan's migration-dependent figures untaken on every copy:

- chunks and the time per chunk and phase;
- `list` and `reconcile` over the migrated store;
- the index and receipt hashes;
- the no-op;
- the kill and resume;
- the full rollback and the first rollback after activation with its baseline;
- the chunk-0 cleanup;
- the `create` refusal;
- the read-back.

As a result, step 12's acceptance clause ("per copy, migration, the resumed kill and the rollback ran with no Prior installation …") is not met. What is shown with Prior absent is the survey, the repair listing and refusals, and the `run` refusal with its backup, on all three copies.

What unblocks it is one of three things:

- the user answers the questions: 54, 122 and 636 of them, one at a time under Step 7;
- the user authorises synthetic answers on scratch copies, labelled as such, as steps 8 and 11 did. The figures would then prove the mechanism at real scale and say nothing about whether the answers are right;
- the step is re-scoped.

### N2 (all three): on 13.0.0 an unmigrated workbench stops every agent's Setup

On every legacy copy, through the installed 13.0.0:

| Helper | Result on each of the three copies |
|---|---|
| `bin/fusion-paths analyst` | exit 3, through `fusion-claimed-package` |
| `bin/fusion-claimed-package` | exit 3: "the workbench … is legacy …, which this version reads only once it has been migrated to JSON" |
| `bin/fusion-work-order` | exit 4, "No order was computed" |
| `bin/fusion-citation-check` | exit 0, `format=legacy` |
| `bin/fusion-citation-sweep --dry-run` | exit 0, `format=legacy` |

Step 10a's note names this for fusion's own tree. These copies show it holds for the two consuming projects too.

Combined with N1, this has a consequence for the release. A project that updates to 13.0.0 cannot complete any agent's Setup until its workbench has migrated. Migrating needs the user's answers first: 49 to 569 unconditional questions on these three.

The release preconditions in the plan's `## Where this work stops` cover the opposite direction: every writing installation must be updated before activation. They do not cover this one.

### N3 (minor): `run`'s exit 6 drops the `reported=` lines

`hooks/migrate.ts:286` collects the `reported=` preconditions, among them `reported=git … not a repository` and the session marker. The blocking refusal at `:299-301` throws `Stop` without printing them. So a `run` that ends in exit 6 shows the user no `reported=` line, although Step 7 of the skill says to show them.

This was seen on the copy without `.git`: stdout was empty. The effect is a missing advisory. No data is affected.

## Implications

- **The mechanism has not met real data.** The scale figures in this report are read-path figures on a legacy store: `survey` answers at most 2.05 MB and runs in at most 1.09 s through the helper, and `run` refuses within 3.43 s, backup included. The apply, verify and rollback path on real data has not run. Steps 6 and 11 measured it only on the generated store and on the fixture.
- **On real data, the repair step is the bottleneck.** Every class asks a value. Step 8's table of repairs has no class that a copy can clear with consent alone. Across the three copies, 279 of the 362 blocking findings are about who filed or who ruled. The conventions do not require that line for plans and specs, and the schema requires it.
- **Step 13 depends on step 12's figures.** In aggregate, they cannot be stated beyond what is above until N1 is resolved.

## Recommendations

1. **N1, for the user, through the orchestrator.** Choose one: (a) answer the questions on one copy (fusion's 54 is the smallest); (b) authorise a labelled synthetic-answer run on fresh copies to take the mechanism figures, then re-dispatch the analyst for step 12; or (c) amend step 12's acceptance to what N1 permits. Option (b) gives every missing figure at real scale. Under (b), the report would have to state, as step 8's note did, that the figures say nothing about whether the answers are right.
2. **N2, implementation-planner or the release notes.** Before 13.0.0 ships, state what a consuming project meets: the agents halt until `/fusion:migrate` finishes, and the repairs come first. Alternatively, decide whether the read helpers keep a legacy path until migration. This is a release-scope question for the user, not a code fix this report proposes.
3. **N3, code-implementer.** Print the collected `reported=` lines before the blocking `Stop` in `run`. This is one small change with a test on the copy without `.git`.

No issue files were written: the dispatch asked for one report. N2 and N3 are ready to file on the orchestrator's word.

## Filed Issues

None (see Recommendations).

## Sources

- Plan: 261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md, head (confidentiality line), steps 2, 6, 8, 9, 10, 10a, 11 and 12, `## Where this work stops`.
- `bin/fusion-migrate` header (subcommands, exits); `hooks/migrate.ts:54` (exclusions), `:125-131` (git lists), `:264-301` (`preconditions`, `run`).
- `codec/src/__tests__/install.test.ts:110-252` (install method), `:870-1001` (seventh case); `hooks/lib/__tests__/migrate.test.ts:143-177` (the inside-a-chunk kill).
- Installed `skills/migrate/SKILL.md` Steps 1, 2, 4 and 7, in particular the never-filled sentence of Step 7.
- `codec/src/cli/protocol.ts:124-127, 273-276, 305` (request shapes), `codec/src/cli/ops.ts:200-245`.
- `rules/fusion-workbench-conventions.md`, the analyses row of the filename table.
- Scratch, under `/private/tmp/claude-501/-Users-kai-Projects-productive-F04-FUSION-fusion/4886bc6e-7f7d-4cde-a435-7ab235f64fe1/scratchpad/fj04-step12/`:
  - `build-install.sh`, `fm.sh`, `skillblk.sh`, `t.mjs` and `treehash.mjs`;
  - the raw outputs under `out/`, which name files of the other projects and are not for circulation.

## Open Questions

- [ ] N1: which of (a), (b) or (c) does the user choose for step 12?
- [ ] N2: does 13.0.0 ship with the read helpers refusing an unmigrated workbench, given what the migration asks of the user first?
