# Analysis: FJ04 step 12, re-run on fresh copies after steps 12a to 12e

**Date:** 2026-10-04 15:16
**Type:** Feasibility (the proof run of plan step 12, resumed as amended)
**Status:** Complete. Step 12's acceptance is met. One new finding (F1) is filed as an issue.
**Requested by:** orchestrator, work package 260928-1338-json-control-data-and-markdown-artefacts
**Cross-references:** 261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md (step 12, its resumption lines, and the amendments of 2026-10-03 and 2026-10-04); 261003-1004-fj04-step12-proof-on-copies-of-real-workbenches.md (the first run, stopped on N1); 261004-1001_*_the-first-add-pass-reads-every-file-the-rename-pass-just-moved-as-untracked.md; 261004-1516_*_a-refused-rollback-after-activation-leaves-its-fence-standing-and-no-helper-ends-it.md (filed by this run)

## Question

Step 12 was stopped on 2026-10-03 (`261003-1004-…`, N1): no copy could migrate, because every one of 362 blocking findings asked for a value nobody had recorded. Steps 12a to 12e rebuilt the migration so that the helper derives what it can, carries the rest as unknown, and asks only genuine questions. This report answers whether that rebuilt migration, installed from step 12e's commit with no Prior runtime present, migrates fresh copies of the three real workbenches. It also checks whether every figure the plan's step 12 and its resumption lines name is now taken.

Labels follow the plan's amendment of 2026-10-03. They read fusion / second / third. The second copy is the one with 277 findings in the first run, and the third the one with 60. The first report lists the two in the other order.

## Scope

**Repository.** fusion, branch `fj-json-workbench`. The dispatch named HEAD `0b1e1b58` (committed 2026-10-04T10:10:30+02:00), and the install and fusion's copy were taken from that commit. During the run, another session committed `8e4ef9a0`, the fix of issue 261004-1001, which touches only `hooks/migrate.ts`, `hooks/dist/migrate.{js,d.ts}`, two tests and the issue record. The codec bundle is unchanged at that commit. At the end of the run the branch is 209 commits ahead of `origin/fj-json-workbench` and 0 behind. The working tree has ` M fusion-workbench/orchestrator-events.jsonl` from other sessions, plus this report, the step note and the issue this run filed. No copy was taken from the working tree.

**Install.** The install was built as in step 11 and the first run, by `build-install.sh` in the new scratch directory:

1. `git archive 0b1e1b58`, with the working tree's `install.sh`, `bin/fusion-record` and `.gitignore` copied over it. All three are equal to HEAD (`git diff --quiet HEAD --` over those paths).
2. `install.sh` ran under `env -i`, with stub `curl` and `claude` on its PATH.

| Item | Value |
|---|---|
| Installer | `fusion 13.0.0 installed.`, exit 0 |
| Installed `plugin.json` | `13.0.0` |
| Installed bundle `codec/dist/fusion-record.js` | 686 858 bytes, `sha256:575aec476cb9ce0fa06dd245e41825afc84dc3944a5b2faf938bc7c8a3ff260c`, equal to step 12d4's note and to the blob at `0b1e1b58` |
| Machine | Apple M2 Max, 64 GiB, macOS 26.6.2 |
| Node | v25.7.0 (`/opt/homebrew/bin/node`) |
| git | 2.53.0 |

**Environment of every helper call (Prior absent).** Every call ran through `fm.sh`, `fx.sh` or `skillblk.sh` under `env -i` with exactly three variables: `PATH`, `HOME` and `FUSION_PLUGIN_ROOT`. `fx.sh … /usr/bin/env` prints exactly these three.

- `PATH` is the install's three tool directories: node, bash, core tools and the two stubs; then git, grep, ls, od, sort, tr and wc; then awk, basename, date, mv and rmdir.
- `HOME` is a fresh directory per copy and purpose under `fj04-step12r/homes/`.
- `FUSION_PLUGIN_ROOT` is the install, or its kill stand-in copy (below).

`ls` over the three PATH directories finds nothing matching `/prior/i`. No Prior checkout, binary or variable was present, and the Prior repository was not touched.

**Sources and copies.** Everything is under the scratchpad's `fj04-step12r/`, which is new. The first run's harness (`fm.sh`, `t.mjs`, `treehash.mjs`, `build-install.sh`, `skillblk.sh`) was copied with its paths changed and nothing else. The tree hash is the first run's: SHA-256 over sorted `path, kind, sha256` lines of the workbench directory.

| Copy | Source | Copied by | Source workbench tree hash, before | After (15:15) |
|---|---|---|---|---|
| fusion | commit `0b1e1b58`, `fusion-workbench` git tree `7221a215` | `git clone --no-hardlinks`, `checkout -B step12r 0b1e1b58`, remote removed | `0975e25c…a78a1` (3 132 files, 312 dirs), from `git archive 0b1e1b58 fusion-workbench` | `0975e25c…a78a1`, re-extracted |
| second | its `main`, the same head commit as the first run (read from `.git/refs`, no git command on the source) | `cp -a` of `.git`, the root `.gitignore` and `fusion-workbench/` | `afe10941…38a5` (8 022 files, 973 dirs) | `afe10941…38a5` |
| third | the same, also unchanged since the first run | the same | `21105877…d329` (2 228 files, 198 dirs) | `21105877…d329` |

Each source was hashed before the copy, right after it, and at the end. The three hashes agree for each source. The second and third hashes also equal the first run's, so both projects are at the state the first report measured. Each copy hashed equal to its source before any helper ran. Each copy got a repo-local `user.name 'Step12r Scratch'`, because `bin/fusion-identity` refuses a repository without one. No record value comes from that identity.

**The third copy still carried the v11 store names.** The dispatch expected v12 names on every copy. The third source still has `circles/` and `planning/`. It was renamed as in the first run, by the installed `skills/migrate/SKILL.md` Steps 1, 2 and 4, run verbatim (`skillblk.sh`, blocks extracted from the installed file):

- the guard printed `INSTALLED=13.0.0 WINDOW=open`;
- the survey printed `FOUND=1 LEGACY=0 COLLISIONS=0 DIRTY=0 UNKNOWN=0`;
- the apply printed `moved=72 mv-fallbacks=0 collisions=0 left=0 mode=git`.

The staged renames were then committed in the copy, as Step 5 of the skill says, before any `bin/fusion-migrate` call. The re-survey printed `FOUND=0 DIRTY=0`. fusion and the second copy printed `FOUND=0` without a rename.

**Issue 261004-1001 does not bear on any figure here.** It concerns a migration run while the rename pass's `git mv` is still staged. Here the rename was committed first, so `firstAdds` follows it as a committed rename. The cross-check below confirms this: 56 of 56 person halves on the third copy agree with `git log --follow`. The issue's fix landed during the run as `8e4ef9a0`. It was not in this install, and nothing here needed it.

**Working copies.** Each base was cloned (`cp -c -R -p`) into an `A` copy and a `K` copy. Each clone hashed equal to its base before use.

- The `A` copy ran the migration, the measurements, the no-op and the full rollback.
- The `K` copy ran the kill and the resume, then the `create` and the refused rollback.
- `thi-nogit` is the third base's `fusion-workbench/` alone, with no `.git` and no `.checkout-id`.

**Load.** The 1-minute load was 2.0 to 4.1 for the three `A` runs, the reads and fusion's rollback. From about the second copy's rollback onward, a process outside this run drove it to 30 to 70. These series ran under that load: the second and third rollbacks, all three `K` resumes, and `thi-nogit`. Each figure below gives its load.

## Findings

### Questions: 0 / 0 / 0 repair questions, one question per copy

| Item | fusion | second | third | Command |
|---|---|---|---|---|
| Step 7 Node block | `NODE=v25.7.0` | same | same | installed Step 7 block, `skillblk.sh` |
| `status` before | `state=legacy run=none` | same | same | `fm.sh … fusion-migrate status` |
| `repair --list` | `blocking=0`, 0 `ask=`, 0 `unrepairable=` | same | same | `fm.sh … fusion-migrate repair --list` |
| `repair --list --optional` (not walked, per Step 7) | `optional=27` | `optional=277` | `optional=60` | `… repair --list --optional` |
| Repairs applied | 0 | 0 | 0 | none supplied, per the resumption |
| Workbench after survey and both listings | byte-identical | byte-identical | byte-identical | `treehash.mjs` before and after |

The ceiling holds at 1 question per copy. With `blocking=0` and no `unrepairable=`, installed Step 7 puts only "Migrate now?". This run answered 1, "Migrate now", on the scratch copies, as the dispatch directs. No other answer was supplied. A run that is interrupted adds Step 7's *Interrupted* question (continue or undo). That question is outside the uninterrupted path the ceiling counts.

fusion's copy is a moved copy, at a newer commit than step 12's `76ba852f`. It holds 27 reclassified findings, against 25 at step 12. The 2 extra findings are `answered-without-answer-line` (4, against 2). Both are in a reclassified class. No finding is blocking, so the moved-copy rule names nothing.

### Survey: the cut, the classes and the derived values

| Item | fusion | second | third |
|---|---|---|---|
| `eligible_sha256` | `4c4c467b…c6bc` | `eaf0161b…6e7f` (equal to the first run) | `b62689d8…4973` (equal to the first run) |
| Cut: package live / terminal | 2 / 41 | 70 / 46 | 1 / 26 |
| Cut: record live / closure | 101 / 0 | 627 / 1 | 148 / 0 |
| Cut: plain terminal / empty container | 1 149 / 0 | 988 / 0 | 1 005 / 0 |
| Blocking findings | 0 | 0 | 0 |
| Helper `survey` time, median / max of 3 (load 2.2) | 0.79 / 0.80 s | 1.66 / 1.72 s | 0.65 / 0.68 s |
| Codec `migration survey` answer bytes (against 16 777 216) | 814 827 | 2 048 186 (12.2 %) | 585 337 |
| Codec `survey` time, median / max of 3 | 0.35 / 0.35 s | 0.55 / 0.55 s | 0.32 / 0.32 s |

The third copy's terminal package count rose from 24 to 26 against the first run. Its two `_d_` Circles are now `dropped` (`circle-deferred-dropped`), so their live records count as `live-record-in-terminal-container`: 52, against 50.

**Reclassified classes against step 12's blocking counts, and the `derived` entries read back.** The column "read back" counts `provenance.legacy_fields.derived` entries per rule over every activated control. Each control was read through the installed `bin/fusion-record` with `list`, then `show` per record (`showall.mjs`): 144 / 744 / 175 shown, 0 refused.

| Class | Step 12 (blocking) | Now (reported) | Treatment | Read back, fusion / second / third |
|---|---|---|---|---|
| `filed-by-missing` | 0 / 128 / 56 | 0 / 128 / 56 | actor unknown, person from git | together with the next two rows: `/filed_by/actor` `unknown` 18 / 182 / 56; `/filed_by/person` `git-first-add` 18 / 182 / 56 |
| `filed-by-not-owed` | 18 / 48 / 0 | 18 / 48 / 0 | as above | (in the row above) |
| `filed-by-unreadable` | 0 / 6 / 0 | 0 / 6 / 0 | as above | (in the row above) |
| `answered-without-answer-line` | 2 / 19 / 2 | 4 / 19 / 2 | `answer-ref-self` | `/control/answer_ref` 4 (3 `no-answer-line`, 1 `empty-answer-line`) / 19 / 2 |
| `mark-outside-numbered-step` | 5 / 65 / 0 | 5 / 65 / 0 | mark removed into `unanchored_marks` | `unanchored_marks` 5 in 1 record / 69 in 11 records (with the duplicated steps' marks) / 0 |
| `unknown-step-mark` | 0 / 3 / 0 | 0 / 3 / 0 | step open | `unrecognised-mark-open` 0 / 3 / 0 |
| `duplicate-step-number` | 0 / 5 / 0 | 0 / 5 / 0 | lines unanchored | `duplicate-numbers-unanchored` 0 / 1 (the one plan) / 0 |
| `unresolvable-active-document` | 0 / 2 / 0 | 0 / 2 / 0 | carried as reference | 0 / 0 / 0: no citation, so the raw head stays in `legacy_fields.head`, as step 12d's note states |
| `active-document-role-unclear` | 0 / 1 / 0 | 0 / 1 / 0 | carried as reference | `binding-carried-as-reference` `role-unclear` 0 / 1 / 0 |
| `circle-deferred` | 0 / 0 / 2 | 0 / 0 / 2 | `dropped` | `circle-deferred-dropped` 0 / 0 / 2 |
| **Total** | **25 / 277 / 60** | **27 / 277 / 60** | | |

Every survey `derived=` line equals the read-back count for its rule. `plan-adopted-twice` and `active-document-role-conflict` are 0 / 0 / 0. 18 / 182 / 56 controls carry the actor `legacy-unknown`, and none of them has a null person on the copies with `.git`.

**The person halves against `git log --follow`.** `follow.mjs` compared each `git-first-add` person and its commit evidence with the last line of `git log --follow --diff-filter=A --no-mailmap --format='%H\t%an <%ae>'` for the record's narrative. Agreement was 18 of 18, 182 of 182 and 56 of 56. There were 0 disagreements in person or commit, and 0 files where `--follow` found nothing.

**Form.** `validate` over each activated store answered `valid:true` with 0 findings, `checked` 144 / 744 / 175. No composed control is schema-invalid: 0 / 0 / 0, against step 2's 21 / 183 / 56.

**One derived record per copy.** On fusion's copy, `bin/fusion-record show` of the control file of `260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` answers:

```json
"filed_by": { "actor": "legacy-unknown", "person": "Kai Stalmann <ks@qantr.com>" },
"provenance": { "source": "imported", "legacy_fields": { "derived": {
  "/filed_by/actor": { "rule": "unknown" },
  "/filed_by/person": { "rule": "git-first-add", "evidence": "faac92145c182148a5828c1f566ebcb439e60fa3" } } } }
```

On the second and third copies, the first such record is a decision of source `imported`. Its fields are present as follows: `filed_by.actor` `legacy-unknown`; `filed_by.person` present in `Name <email>` form; `derived` keys `/filed_by/actor` and `/filed_by/person`; the person rule `git-first-add` with a 40-hex commit as evidence; `provenance.backup` and `legacy_fields.head` present.

### Migration, per copy (the `A` copies)

The phase times come from the mtimes of what each phase writes last. These are the session's `backup.sha256`, the proposal file, each stored answer under `.json-state/ops/`, and `.fusion-setup` (`phases.mjs`). Each interval therefore includes the host's work and one process start. The run's start and exit are wall-clock readings.

| Item | fusion | second | third | Command |
|---|---|---|---|---|
| `run` | exit 0, `result=json-control` | same | same | `fm.sh … fusion-migrate run` |
| `reported=` lines | `monitor` | `monitor` | `monitor` | same |
| `untracked=` / `ignored=` lines | 0 / 0 | 0 / 10 | 0 / 0 | same |
| Records in the proposal | 144 | 744 | 175 | `proposal=` line |
| Chunks | 7 | 34 | 8 | `planned=` line |
| Load at the start | 2.4 | 4.1 | 3.4 | `uptime` |
| Backup | 0.99 s | 2.45 s | 0.89 s | `phases.mjs` |
| Survey and composition | 0.75 s | 2.14 s | 0.59 s | same |
| Plan (freeze) | 0.68 s | 1.81 s | 0.72 s | same |
| Apply, per chunk, median / max | 1.17 / 1.18 s | 1.76 / 1.89 s | 1.25 / 1.29 s | same |
| Apply, all chunks | 7.92 s | 59.88 s | 9.54 s | same |
| Verify | 0.83 s | 1.76 s | 0.75 s | same |
| Setup metadata / `maintenance end` | 0.02 / 0.22 s | 0.02 / 0.24 s | 0.02 / 0.23 s | same |
| Whole `run` | 11.47 s | 68.38 s | 12.81 s | same |
| Index (`plan.json`) hash | `0d9d369d…5394` | `46eb6a28…5756` | `e0a07af1…422d` | `planned=` line |
| Receipt hash | `a041699b…dd2d` | `f4dc9944…9e9b` | `440aeafc…c9c4` | `verified=` line |
| Unscoped `list` answer bytes (16 MiB) / time, median / max of 3 | 79 002 / 0.29 / 0.29 s | 411 702 / 0.39 / 0.40 s | 96 727 / 0.30 / 0.30 s | `t.mjs 3 … fusion-record`, `{"op":"list"}` |
| `reconcile` answer bytes / time against 5 s | 123 237 / 0.40 / 0.40 s | 479 664 / 0.75 / 0.76 s | 81 496 / 0.40 / 0.41 s | same, `{"op":"reconcile"}` |
| `reconcile` result | `checked:144`, 0 intents, 0 records, 423 references, 1 dependency, 0 narratives | `checked:744`, 0 / 0, 1 508 references, 19 dependencies, 0 narratives | `checked:175`, 0 / 0, 232 references, 0 dependencies, 0 narratives | same |
| Tree after the reads | unchanged | unchanged | unchanged | `treehash.mjs` |
| Second `run` | `result=no-op`, `note=nothing was sent…`, 0.11 s, stored answers 10 → 10 | same, 0.24 s, 37 → 37 | same, 0.18 s, 11 → 11 | `fm.sh … fusion-migrate run` |

**Read-back, one open and one terminal record per copy, through each shipped reader.** Records: the open record is a live package of source `imported` (fusion: `paused`, second: `open`, third: `claimed`). The terminal record is a package of source `legacy-terminal` (fusion and second: `done`, third: `dropped`). Script: `readback.mjs`. It prints, per reader, the exit code and whether each record's container is named.

| Reader | fusion | second | third |
|---|---|---|---|
| `fusion-record show` | both `ok` | both `ok` | both `ok` |
| `fusion-record list` | both listed | both listed | both listed |
| `fusion-paths analyst <open dir>` / `<terminal dir>` | exit 0 / 0, each container named | same | same |
| `fusion-paths analyst` (no item) | exit 0 | exit 0 | exit 0 |
| `fusion-claimed-package` | exit 0, no claim for this new checkout | same | same |
| `fusion-work-order --format tsv` | exit 0, open named, terminal not | same | same |
| `fusion-citation-check` | exit 0, `format=json-control`, both named | same | exit 0, `format=json-control`, terminal named, open not cited |
| `fusion-citation-sweep --dry-run` | exit 0, `format=json-control`, both named | same | same |

The readers minted `.checkout-id` on fusion's and the third copy, which carried none. The file is on the codec's exclusion allowlist. With it excluded, each tree equals its state after activation. The second copy carries its own `.checkout-id` from the source.

### The verified no-op on fusion's copy (ruling a1)

Before the first rollback after activation, one `plan` was sent through the installed `bin/fusion-record`. It carried a fresh id `8b4c5563-…`, the session's proposal `{path: .json-state/migration/migration-20261004-v12.json, sha256: b30acd80…c3c7}` and the workbench's real path.

- The answer was `no_op: true`, with the session's receipt (`a041699b…`), `manifest_revision` `277da422…`, and `later_operations` naming the one `maintenance end`. It took 0.29 s. The stored answers went from 10 to 11.
- The rollback then ran to chunk 0 and the legacy `end`, exit 0 (below).
- `rollback.json` was read before chunk 0 removed it. A watcher (`watch.mjs`, 2 ms polling) kept its bytes. It holds `no_ops: [{operation_id: "8b4c5563-…", request_digest: "sha256:8a556a5f…", answer_sha256: "sha256:68c087af…"}]`, three `exempt` entries and the fence. Its sha256 `7789b29f…0882` equals the `binding` that the first rollback chunk's stored answer names.

### Rollback after activation, per copy (the `A` copies)

| Item | fusion | second | third |
|---|---|---|---|
| Load at the start | 2.0 | 40.3 | 30.1 |
| `rollback` | exit 0, `result=legacy`, chunks 7 … 1 and 0 | exit 0, `result=legacy`, 35 rollback chunks | exit 0, `result=legacy`, 9 rollback chunks |
| `maintenance begin` | 0.58 s | 1.01 s | 0.91 s |
| First rollback after activation, with its baseline (the highest chunk) | 0.71 s | 1.76 s | 0.87 s |
| Later rollback chunks, median / max (all reverse chunks) | 0.67 / 0.76 s | 1.23 / 1.76 s | 0.99 / 1.25 s |
| Chunk-0 cleanup | 0.57 s | 1.83 s | 0.85 s |
| Legacy `maintenance end` | 0.46 s | 0.80 s | 0.74 s |
| Whole `rollback` | 6.44 s | 45.84 s | 10.54 s |
| `rollback.json` | 1 423 bytes, `no_ops` 1 | 1 134 bytes, no `no_ops` member | 1 134 bytes, no `no_ops` member |
| Chunk 0's answer (fusion) | `progress` 8 entries, `progress_sha256` `d70c6d01…f571`, fence `591eeb86-…` | | |
| Tree after, without `.json-state/` and `archive/migrations/` | `0975e25c…`, equal to the pre-run tree | `afe10941…`, equal | `7987567…`, equal (excluding the `.checkout-id` the readers minted) |
| `archive/migrations/` | 0 files, 80 empty dirs | 0 files, 184 empty dirs | 0 files, 60 empty dirs |
| `workbench.json` / `.fusion-setup` | absent / restored to its committed bytes | absent / restored | absent / restored |
| `status` after | `state=legacy fence=- rolled_back=true` | same | same |

The empty directories are the ones `codec/README.md` names as permitted after a complete rollback: `archive/migrations/<id>/` with its `chunks/`, `parts/` and `originals/` trees. fusion's input already has `archive/`, so it gains no other directory. The baseline holds no answer, because none of the three stores held a stored answer before the plan. On fusion the stored answers before the no-op were the 10 the run sent, and on the others 37 and 11.

### Kill inside a chunk, then resume (the `K` copies)

**Method.** The kill ran in a copy of the install (`install-kill/home`). Its `codec/dist/fusion-record.js` is a stand-in that spawns the real bundle, polls for `.json-state/journal/<operation id>` of the named chunk's `apply`, and `SIGKILL`s the real process as soon as that entry exists. It then exits 9. This follows step 9's and step 11's method, with the kill moved from after the answer to inside the chunk. `status`, `resume` and everything after them ran through the pristine install.

| Item | fusion | second | third |
|---|---|---|---|
| Chunk killed | 4 of 7 | 17 of 34 | 4 of 8 |
| Killed after (from the request's start) | 0.76 s | 1.92 s | 0.83 s |
| At the kill | journal entry present (49 entries for 48 writes), answer not stored; 0 of 22 originals and 0 of 22 controls landed, 4 rewrites still at source bytes | journal present, answer not stored; 0 of 20 / 0 of 20 landed, 8 rewrites at source bytes | journal present, answer not stored; 0 of 25 / 0 of 25 landed |
| `run` | exit 7, "the outcome of migration apply chunk 4 … is unknown … `resume` … sends the same request again" | exit 7, the same for chunk 17 | exit 7, the same for chunk 4 |
| `status` after the kill | `state=legacy`, a fence, `chunks=3/7`, `verified=no` | `chunks=16/34` | `chunks=3/8` |
| `resume` | exit 0, `result=json-control`, 6.16 s (load 1.6) | exit 0, 57.63 s (load 50 to 70) | exit 0, 8.39 s (load 55 to 63) |
| After the resume | `chunks=7/7`, `verified=yes`, `fence=-`, journal empty, `validate` 144 valid | `chunks=34/34`, the same, 744 valid | `chunks=8/8`, the same, 175 valid |
| A second `resume` | `result=no-op` | `result=no-op` | `result=no-op` |

The kill landed after the chunk's journal entry existed and before any of its writes. The resume sent the same request under its recorded id and finished the chunk.

### Rollback refused after one `create` (the `K` copies)

On each `K` copy, after the resume, `create.sh` wrote a marker-free scratch issue narrative under `shared/issues/`. It then ran `bin/fusion-write create --actor user --kind issue --origin user-request`, which answered `result=landed`, `event=logged`. After that it ran `bin/fusion-migrate rollback`:

| Item | fusion | second | third |
|---|---|---|---|
| `rollback` | exit 8: `migration rollback chunk 7 refused: conflict/after-state-changed: the store differs from the activated tree the receipt names …`, naming the scratch narrative `261004-1300-step12r-scratch-create.md` as added "(and 1 more)" | exit 8, the same class for chunk 34, naming the same scratch file | exit 8, the same for chunk 8 |
| `status` after | `state=json-control`, **`fence=511af6cd-…`** | `fence=5448e422-…` | `fence=fbcef01d-…` |

The refusal is correct and names the ordinary work. It leaves a standing fence, which is finding F1 below.

### The copy without `.git` (third)

| Item | Result |
|---|---|
| `survey` | `eligible_sha256` `b62689d8…4973`, equal to the git copy; `derived=/filed_by/person unknown no-repository 56` |
| `run` | exit 0, `result=json-control`, 8 chunks, 175 records. It printed `reported=git	not a repository: untracked and ignored files are not listed`. N3 is fixed. |
| Times (load 47) | backup 1.50 s, plan 1.12 s, chunks median / max 1.54 / 1.71 s, verify 1.74 s, whole `run` 17.59 s |
| Index / receipt | `28f55835…e132` / `88390d0f…29fc` |
| Read back through `show` | 175 shown; `/filed_by/person` `unknown`/`no-repository` 56; `legacy-unknown` with a null person 56; other rules as on the git copy |
| `list` / `reconcile` / `validate` | 96 731 B / 81 500 B, `checked:175`, 0.71 / 0.81 s median / max; `valid:true` |
| Second `run` / rollback | `result=no-op`; `rollback` exit 0, `result=legacy`, 7.51 s; the tree equals the pre-run tree without `.json-state/` and `archive/migrations/` |

### F1 (all three): a refused rollback after activation leaves its fence standing, and no helper ends it

`hooks/migrate.ts` `rollback` sends `maintenance begin` before the first rollback chunk when the store is activated. When the codec refuses that chunk, the helper exits 8 with the fence still standing. The refusal itself is right.

All of the following was shown on a clone of fusion's `K` copy, taken after the refusal:

- `bin/fusion-write create` was refused with `conflict/maintenance-active`.
- `bin/fusion-write`'s hint names an archive move and points at `bin/fusion-archive resume`/`abandon`, which do not apply here.
- A second `rollback` exited 8 again.
- `resume` exited 5: "is being or was rolled back; `rollback` finishes that".
- `/fusion:migrate` Step 7 reads exit 8 as "show the reason and stop".
- A hand-sent `{"op":"maintenance","action":"end","fence":"511af6cd-…"}` through the installed `bin/fusion-record` answered `ok`, and `status` then showed `fence=-`.

The codec side is as specified: the recorded session's base D ends its refusal with an explicit `end`. The gap is that the host helper and the skill leave a project with a fenced store and no named way out. Every ordinary write then fails until somebody composes a codec request by hand. Filed as `261004-1516_*_a-refused-rollback-after-activation-leaves-its-fence-standing-and-no-helper-ends-it.md`.

## Implications

The rebuilt migration meets step 12's acceptance on real data. All three workbenches migrate with no repair and no question beyond "migrate now?". That ends N1 of the first report. The cost of upgrading a consuming project to 13.0.0 is now one consent and about 12 to 70 seconds of migration on these sizes. N2 (agents halt until the migration runs) still stands as a release-scope question. Its cost has dropped from 49 to 569 unconditional questions to one.

The derived values are as specified and as the survey announced, rule for rule. The person half is checkable against git with no disagreement. The actor stays `legacy-unknown` everywhere it was never recorded, and no record value came from the run's own identity.

All three timed series stay inside the client's 5 s bound per request at the second copy's size, the largest measured. Under a load of about 4, the slowest chunk took 1.89 s, `reconcile` 0.76 s and the plan freeze 1.81 s. The worst request under the external load of 40 to 70 was 1.83 s (chunk 0 on the second copy). No answer exceeds 2.05 MB against 16 MiB.

F1 is the one new defect. It does not stop step 12. It does matter before 13.0.0 ships. A user who works after migrating and then tries `rollback` is left with a store that refuses every write, and the helper's own hints point elsewhere.

## Recommendations

1. **Step 12: mark done** (the step note in the plan). Step 13's hand-over can cite this report for the bundle `575aec47…260c` measured on real copies.
2. **F1, code-implementer**, before the release. Fix it in one place, the host. Either `rollback` ends its own fence when the codec refuses the first chunk after activation, because nothing has moved at that point. Or the helper prints the one command that ends it, and Step 7 names it. `bin/fusion-write`'s fence hint should stop assuming an archive move. Of the two, ending the fence in `rollback` itself is the integral fix. It follows the existing rule that a fence the host set is ended by the same host flow. The issue's acceptance holds either way.
3. **N2, user, through the orchestrator**, unchanged from the first report. It remains open whether 13.0.0 ships with the read helpers refusing an unmigrated workbench. The question is now one consent per project.

## Filed Issues

- `261004-1516_*_a-refused-rollback-after-activation-leaves-its-fence-standing-and-no-helper-ends-it.md`: F1.

## Sources

- Plan `261001-1804_*_plan-fj04-…`: step 12 with its Stopped note and resumption lines (`:772-810`); `## Amendment of 2026-10-03: derive, carry as unknown, ask only what is genuine` (`:263-313`); `## Amendment of 2026-10-03 for rulings a1 and b1` (`:315-369`); `## Amendment of 2026-10-04 for decision 261003-2045` (`:371-377`); the Done notes of steps 11, 12c, 12d and 12d4.
- First report `261003-1004-fj04-step12-proof-on-copies-of-real-workbenches.md`, its Scope (method, labels) and N1 to N3.
- `bin/fusion-migrate` (header, exits); `hooks/migrate.ts:137-180` (`gitLists`, `firstAdds`), `:267-305` (`drive`), `:307-358` (`preconditions`, `run`), `:375-405` (`rollback`); `hooks/lib/__tests__/migrate.test.ts:160-197` (the kill method).
- `codec/README.md`, the `migration` sections: the baseline, the verified no-op, `rollback.json`, chunk 0, and "No directory is removed".
- Installed `skills/migrate/SKILL.md`, Steps 1, 2, 4, 5 and 7.
- Issue `261004-1001_*_…`; commit `8e4ef9a0` (`git diff --stat 0b1e1b58 8e4ef9a0 -- codec hooks bin skills`).
- Scratch, under the scratchpad's `fj04-step12r/`:
  - the scripts `build-install.sh`, `fm.sh`, `fx.sh`, `skillblk.sh`, `blk-1.sh` to `blk-5.sh`, `t.mjs`, `treehash.mjs`, `phases.mjs`, `rbphases.mjs`, `watch.mjs`, `showall.mjs`, `summ.mjs`, `follow.mjs`, `readback.mjs`, `runA.sh`, `rollA.sh`, `killK.sh` and `create.sh`, and the stand-in `install-kill/home/codec/dist/fusion-record.js`;
  - the raw outputs under `out/`, which name files of the other two projects and are not for circulation.

## Open Questions

- [ ] F1: does `rollback` end its own fence on a refusal, or does the helper name the command? This is the implementer's call under the issue's acceptance.
- [ ] N2 (carried from the first report): does 13.0.0 ship with the read helpers refusing an unmigrated workbench?
