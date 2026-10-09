# Analysis: FJ05 step 18 hand-over draft, request 65 at the release candidate `468d8e87`

**Date:** 2026-10-09 23:22
**Type:** Document Study (hand-over draft, plan step 18)
**Status:** Draft. One placeholder, `<<C-CLONE-RESULT>>`, is for the orchestrator to fill.
**Requested by:** orchestrator, work package 260928-1338-json-control-data-and-markdown-artefacts

## Note to the orchestrator

Everything under the rule below is the text to append to `codec/fixtures/prior/REQUESTS.md`, unedited apart from the placeholder. These points are uncertain or need a choice before the append:

1. **The placeholder.** `<<C-CLONE-RESULT>>` sits in `### The release candidate verified in an isolated clone`. It replaces one table row with the fresh-clone run at `468d8e87`: the hooks counts (files, passed, skipped), the codec counts with `CODEC_REQUIRE_GOLDENS=1` (files, passed, skipped, goldens), the `git status --porcelain` result after both suites, and the `claude plugin validate .` line. The figures expected from `f8203e70` are in the row above it. If any figure differs, the sentence after the table ("no figure differs") must change too.
2. **The plan has no step note for the moves to `5f7398c9` and `468d8e87`.** Its last C note names `f2cc68f0`. This draft takes C = `468d8e87` from the dispatch and from the reviewer's "I would ship 13.0.0 at `468d8e87`" (`261009-2236-…`). A step note naming C = `468d8e87` should land before or with the append.
3. **Step 14 at `468d8e87` is not recorded anywhere.** I did not reinstall anything. I hashed `~/.fp` on the six paths that changed since `f2cc68f0` (`README-hooks.md`, `docs/upgrading-to-v13.md`, `hooks/migrate.ts`, `hooks/dist/migrate.{js,d.ts}`, `codec/dist/fusion-record.js`): all six equal the blobs at `468d8e87`, and `~/.fp` reads 13.0.0. That is a spot check, not step 14's full 0-difference comparison. The draft says so. If a full comparison was run, replace that sentence.
4. **"Low-rated" does not fit every open issue.** Eleven issues of this item are `open`. Six are rated low by a review. Five were deferred past 13.0.0 by the user. Of those five, one was rated **medium** (`261009-1855-migrate-step-6-…`, F2 of `261009-1855-reviewer-…`), and three carry no rating (`261009-1833-…`, `261009-2040-…`, `261009-2148-…`). The draft lists all eleven in two groups and states each rating as recorded, rather than calling them all low.
5. **The coverage line was read in the live tree, not in a clone.** The live HEAD is `b6c890c5`, level with `origin/fj-json-workbench`, and it holds the last review. Two workbench files are uncommitted there (`orchestrator-events.jsonl`, the plan's `.record.json`). The verdict is `covered`; `carried=` names the events file. If the plan's step note ("in a clone of the commit that lands the last review") is to be met literally, repeat the read in step 13's clone of `b6c890c5` and compare.
6. **The section 9 split is fusion's proposal.** Decision A1's cons say "the line between shared and host-specific evidence has to be drawn in the hand-over, and Prior may draw it differently". The draft draws it bullet by bullet and asks Prior to correct it. Two bullets are split in half (4 and the host half of 1). Bullet 7 is placed on the host side, apart from the kernel's local lock.
7. **Step 21's items stay open.** Fresh install from the tag, the asset check, the smoke test in a second project and the update path all come after the tag. The draft says they are reported in the closing section, not here.
8. **The foreign workbench** appears only as "foreign workbench 1" with aggregate figures. The step 20 precondition from the user's ruling is written without the project's name.

---

## FJ05 (the release evidence at 468d8e87)

**Written against:** the release candidate C = `468d8e87` on branch `fj-json-workbench` (2026-10-09 22:34, "docs(migrate,upgrading): the leftover procedure, git as a prerequisite, the .git cases measured"). The branch head when this text was written was `b6c890c5`, which adds the review of C and changes only `fusion-workbench/`. `origin/fj-json-workbench` equals `b6c890c5`, so it contains C. At C this file is 3 328 lines, `sha256:a577780c2b7660acdcd3f61fb9041419fd0b64a1e0c0c372305a2a9eb73fdfc0`. That is the same file as at `052932e2`, which appended Prior's answer to 63 and 64. Prior was read at `34a2710` (2026-10-09 16:13), the head of its `main`. `git log --all --oneline 34a2710..` there names only `88b2e6c`, on `review/fj04-candidate-524fdfad`, as before.

This section is the FJ05 evidence hand-over of fusion's plan `261009-1021-plan-fj05-release-acceptance-of-13-0-0-with-the-claim-takeover.md`, step 18. It does four things. It shows that the codec Prior qualified at `34a2710` is the codec C ships. It reports Prior's five FJ05 items with their evidence. It puts request 65 to Prior. And it states what the release act will do. Two user rulings set its form:

- Decision `261009-1021-who-accepts-fj05-and-may-13-0-0-ship-on-fusions-evidence-alone.md`, **option 3, split by subject**: Prior confirms the shared-contract evidence, codec and migration, before the release act. Everything host-specific is accepted by the user alone. The user's words: "Prior soll vorher zumindest den gemeinsamen Teil bestätigen, also Codec und Migration".
- Decision `261009-1021-must-fj05-show-priors-access-path-on-a-real-migrated-workbench.md`, **option 1**: no Prior read of a real migrated workbench in FJ05. So there is **no request 66**. The user's words: "prior Anbindung machen wir später, wir müssen v13 releasen können und die migrierte workbench pushen, damit weiter gearbeitet werden kann."

No line above is edited. Where this section disagrees with a section above, this section governs.

### The codec at C is the codec Prior qualified

Prior qualified `fb170361…` at `34a2710` for the frozen revision `dd4bf3d4`. Nothing under `codec/` has changed since `052932e2`, the commit that recorded that answer:

| Check, in fusion's repository | Result |
|---|---|
| `git log --oneline 052932e2..468d8e87 -- codec` | prints nothing: no commit touches `codec/` |
| `git diff --stat 052932e2 468d8e87 -- codec` | prints nothing |
| `git show 468d8e87:codec/dist/fusion-record.js \| shasum -a 256` | `fb1703619c94bd2ed6ef8b753e70dd38e36dcb26da0775fb4e19274ed11bb66f` |
| `git show 468d8e87:codec/dist/fusion-record.js \| wc -c` | 699 011 |
| `git log -1 -- codec/dist/fusion-record.js` | `00e465f6` (2026-10-09 13:52), as at the qualification |
| `git diff --stat dd4bf3d4 468d8e87 -- codec bin/fusion-record` | one file, `codec/fixtures/prior/REQUESTS.md`, 283 lines added: the two FJ05 sections above |

Both pins against C, with the command of `### What changed for Prior's two pins, at dd4bf3d4` above, `dd4bf3d4` replaced by `468d8e87` and the pin files read from `git show 34a2710:`:

| Pin file (`Prior:` at `34a2710`) | Pinned commit | Entries | Differ at C |
|---|---|---|---|
| `tests/testdata/fusion-codec/UPSTREAM.json` | `dd4bf3d4` | 413 | 1: `fixtures/prior/REQUESTS.md` |
| `tests/testdata/fusion-fj01/UPSTREAM.json` (`bundle_digest` `sha256:fb170361…`) | `dd4bf3d4` | 715 | 1: `codec/fixtures/prior/REQUESTS.md` |

That is the outcome `#### REQUESTS.md against Prior's pins, after this append` above predicted: the pins differ from C in this file alone. This append moves it once more. The bundle, every schema, the contract, every fixture and every recorded session hash as pinned.

So Prior's qualification at `34a2710` stands for C as it is. **No re-pin and no new conformance run is asked.**

### How the release candidate moved, and why

Step 13 first ran at C = `052932e2`. A trial migration of a throwaway copy of a real consuming workbench, run by the user with the installed candidate, found a defect in fusion's citation sweep. Each fix after that was reviewed, and C moved with it. No commit after `052932e2` changes `codec/`.

| Commit | Date (2026-10-09) | What it changes outside `fusion-workbench/` | Review |
|---|---|---|---|
| `052932e2` | 16:20 | this file: Prior's answer to 63 and 64 | `261009-1624-reviewer-coverage-pass-over-4e1e1b47-to-052932e2.md`: accept |
| `78680a11` | 17:46 | `hooks/citation-sweep.ts` and its build: a git listing over 1 MB no longer reads as an untracked workbench | `261009-1855-reviewer-citation-sweep-buffer-fix-78680a11.md`: revise, 0 high, 2 medium, 1 low |
| `26ada996` | 19:11 | the sweep and `hooks/migrate.ts`: a failing git call is a refusal, never an answer | `261009-1958-reviewer-git-exit-sets-26ada996.md`: revise, 0 high, 1 medium, 1 low |
| `f8203e70` | 20:09 | `hooks/migrate.ts`: the filesystem decides whether a repository exists, not git's exit code | `261009-2028-reviewer-repo-top-by-filesystem-f8203e70.md`: revise, no release blocker, 3 low |
| `f2cc68f0` | 20:41 | header comments of `hooks/migrate.ts` and `bin/fusion-migrate` | covered by the next review's range |
| `5f7398c9` | 22:10 | `docs/upgrading-to-v13.md`: the `circles/` `.DS_Store` workaround, and the takeover cases observed | `261009-2223-reviewer-docs-only-release-candidate-5f7398c9.md`: revise, no release blocker, 3 low, "I would ship 13.0.0 at `5f7398c9`" |
| `468d8e87` | 22:34 | header comments, `README-hooks.md`, `docs/upgrading-to-v13.md`: the leftover procedure, git as a prerequisite inside a repository | `261009-2236-reviewer-leftover-procedure-release-candidate-468d8e87.md`: revise for one low gap, no release blocker, "I would ship 13.0.0 at `468d8e87`" |

Every defect these commits fix lives in fusion's host-side reader and sweep under `hooks/`, never in the bundle. **Between `f8203e70` and C, only comments and documentation changed.** `git diff f8203e70 468d8e87` over `hooks/`, `bin/` and `codec/` changes lines inside comment blocks only: every added or removed line of `hooks/migrate.ts` and `hooks/dist/migrate.{js,d.ts}` starts with ` *`, and both changed lines of `bin/fusion-migrate` are `#` comments. `agents/`, `skills/`, `rules/`, `CLAUDE.md`, `hooks/lib/` and `codec/` have an empty diff over that range. So a behaviour measured at `f8203e70` or `f2cc68f0` is the behaviour of C.

### Prior's five FJ05 items

`Prior: docs/design/fusion-fj03d-prior-response.md` `## FJ03d completion and FJ05 scope` names five items. `### What fusion closed of Prior's FJ05 items since e7695d9c` above reported two as closed and three as open. Their state at C:

| Prior's item | State at C | Evidence |
|---|---|---|
| Review of `99eef20d`, `95720e4c`, `b65eb4b0`, `e7695d9c`, and the review-fix coverage | **closed**: `verdict=covered` | All four commits lie in G-A's range. The reviews and the coverage line are in `### The reviews, and coverage` below |
| The release artefact, fresh install, assets, smoke test, repeat migration, and the launcher's update path | **closed up to the tag**; the part after it is open | The candidate verified in an isolated clone and installed (step 13, step 14), and repeat migration at the candidate (step 15), below. The fresh install from the tag, the asset check, the smoke test in a second project and the update path run after the tag (plan step 21). They are reported in the closing section |
| The reviewer evidence issue `261005-0626` (D3) | **resolved**, reported above | No change since `### What fusion closed of Prior's FJ05 items since e7695d9c`. The observation run at C's prompts adds case (e): A finished `done` with non-empty `outcome.evidence`, and B `ready` with no `unmet=` line |
| The six shipped-consumer test gaps (D4) | **dispositioned**; six agent behaviours stay unobserved and are stated as a limit | The observation run, below: 14 of 14 at `f2cc68f0` |
| Release documentation checked against behaviour | **closed**, re-checked by two later reviews | `### The documentation check`, below |

### The reviews, and coverage

| Review | Range | Totals (critical / high / medium / low) | Open after it |
|---|---|---|---|
| G-A, `261009-1037-reviewer-g-a-pre-release-review-of-13-0-0.md` | `cd1b5522..031645d2` | 0 / 0 / 3 / 3 | the three mediums closed (C1 fixed after the range); the lows A2, D1, D2 open |
| G-B, `261009-1448-reviewer-g-b-closing-review-of-the-13-0-0-takeover-revision.md` | `031645d2..4e1e1b47` | 0 / 0 / 1 / 3 | the medium (the takeover's consent decision left `open`) closed; two lows closed, one open |
| G-C, `261009-1519-reviewer-g-c-review-of-the-step-12-fix-commit.md` | `95fecad4..a563ff6a` | 0 / 0 / 0 / 0 | none: "No release blocker" |
| `261009-1624-reviewer-coverage-pass-over-4e1e1b47-to-052932e2.md` | `4e1e1b47..052932e2` | 0 / 0 / 1 / 1 | both on plan text, no shipped byte; accept |
| `261009-1855-reviewer-citation-sweep-buffer-fix-78680a11.md` | `052932e2..78680a11` | 0 / 0 / 2 / 1 | F1 and F3 fixed in `26ada996`; F2 deferred by the user (below) |
| `261009-1958-reviewer-git-exit-sets-26ada996.md` | `78680a11..26ada996` | 0 / 0 / 1 / 1 | both fixed in `f8203e70` |
| `261009-2028-reviewer-repo-top-by-filesystem-f8203e70.md` | `26ada996..f8203e70` | 0 / 0 / 0 / 3 | one deferred; two fixed in the documentation commits |
| `261009-2223-reviewer-docs-only-release-candidate-5f7398c9.md` | `f8203e70..5f7398c9` | 0 / 0 / 0 / 3 | all three fixed in `468d8e87` |
| `261009-2236-reviewer-leftover-procedure-release-candidate-468d8e87.md` | `5f7398c9..468d8e87` | 0 / 0 / 0 / 1 | L-1 open |

**No review rated a finding critical or high.** Every medium finding is closed except F2 of `261009-1855-…`, which the user deferred past 13.0.0.

Coverage, read in fusion's tree at `b6c890c5` (which holds the review of C) with `bin/fusion-review-coverage --since cd1b5522 --head 468d8e87`:

```
anchor=workbench-root
since=cd1b5522
head=468d8e87
commits=99
reviews=10
unusable=0
uncovered=0
verdict=covered
```

The ten reviews leave no commit after `cd1b5522` uncovered. `f2cc68f0` has no review of its own and is covered by `261009-2223-…`, whose range `f8203e70..5f7398c9` holds it. The `carried=` line names `fusion-workbench/orchestrator-events.jsonl`, the observation hooks' event log, which no review opens. It does not affect `verdict=`.

### The release candidate verified in an isolated clone

Plan step 13 ran last in full at `f8203e70`, in a fresh clone, in `261009-2023-fj05-release-candidate-verification-at-f8203e70.md`. At C it was re-run in a fresh clone of `468d8e87`.

| Check | At `f8203e70` (`261009-2023-…`) | At C = `468d8e87` |
|---|---|---|
| Hooks suite, `cd hooks && npm install && npm test` | exit 0; 67 files passed, 1 skipped; 1 156 tests passed, 14 skipped (the opt-in observation suite without `FUSION_AGENT_RUN`) | exit 0; 1 156 tests passed, 14 skipped |
| Codec suite, `cd codec && CODEC_REQUIRE_GOLDENS=1 npm test` | exit 0; 22 files, 1 810 tests passed, 0 skipped; 13 of 13 goldens-required assertions passed | exit 0 after `npm ci`; 1 810 tests passed, 0 skipped |
| `git status --porcelain` after both suites (the copied `hooks/package-lock.json` aside) | empty | empty |
| `claude plugin validate .` | not taken in that run | passed with 7 warnings: six for an unquoted `${CLAUDE_PLUGIN_ROOT}` in `hooks/hooks.json`, one for `CLAUDE.md` at the plugin root; `hooks/hooks.json` is unchanged since `052932e2`, where the same `CLAUDE.md` warning appears |
| Bundle digest | `fb170361…`, 699 011 bytes; the build printed `dist/fusion-record.js: unchanged` | `fb170361…`, 699 011 bytes (the blob, above) |
| `origin/main` an ancestor of C | yes: `origin/main` is `48f0c9ff` (fusion 12.2.3) | yes: `git merge-base --is-ancestor origin/main 468d8e87` exit 0 |
| Growth-bound room | every figure at or above 0; the smallest the `reviewer` dispatch path, 531 bytes | unchanged: no file the four bounds measure changed after `f8203e70` |
| Prior's pins | 412 of 413 and 714 of 715 equal; `REQUESTS.md` differs | the same (above) |

No figure differs from `f8203e70`, as the comment-only range predicts.

**Versions** (`261009-2023-…`, log `00-versions.log`): node v25.7.0, npm 11.10.1, git 2.53.0, Claude Code 2.1.295, macOS 26.6.2 (25G83), arm64.

**Step 14, the install.** `~/.fp` was reinstalled from the branch at `052932e2` and again at `78680a11` and `f2cc68f0`, each time with 0 differences against `git archive` and the bundle `fb170361…`. At step 14, `~/.local/bin/fusion` and `~/.fusion` (12.2.1) were recorded unchanged. At C, `~/.fp` was reinstalled from the branch after `468d8e87` was pushed, with 0 differences against `git archive 468d8e87` over every installed path, and `~/.local/bin/fusion` and `~/.fusion` (12.2.1) again unchanged.

### The re-migration at the candidate (step 15)

**One real workbench, not two.** The plan's step 15 names two foreign workbenches. The user ruled that it runs on one. As migration evidence, `261009-2148-fj05-re-migration-of-one-real-workbench-at-f2cc68f0.md` therefore covers **one** real consuming project, and nothing in it speaks for a second. The smaller project measured in FJ04's proof on copies (`## FJ04 (the hand-over)` above) was not re-measured at C. Its location and name are not recorded; only aggregate figures follow.

It ran at `f2cc68f0`. Between `f2cc68f0` and C, `git diff --stat f2cc68f0 468d8e87 -- hooks bin skills agents rules codec` names three files, `hooks/migrate.ts` and `hooks/dist/migrate.{d.ts,js}`, with 21 lines in and 9 out, all inside the header comment block. So the migration behaviour measured there is the behaviour C ships.

- **The install.** `install.sh` from `git archive f2cc68f0`, under `env -i` with `PATH`, `HOME` and `FUSION_PLUGIN_ROOT` only, stub `curl` and `claude`. No Prior installation, binary, service or variable was present: nothing on `PATH` matches `/prior/i`. Installed bundle `fb170361…`, 0 differing lines against `git archive`.
- **The source.** A real fusion 12.2.1 workbench, under git, not migrated: 8 435 files in 1 022 directories. Three digests (workbench content, `.git` content, a stat list of the whole project) were taken before the copy, after it and at the end. All three agree. Every step ran on copies.
- **The v12 rename pass**, Steps 1, 2 and 4 of the installed `skills/migrate/SKILL.md`, verbatim. It moved seven empty, untracked directories and could not drain `circles/`, whose last entry was a Finder `.DS_Store` that collides with one under `work-packages/`. The JSON run then refuses on the name `circles`. One hand step (`rm circles/.DS_Store; rmdir circles`) clears it. This is finding R1, issue `261009-2148-…`, deferred past 13.0.0 by the user. C's `docs/upgrading-to-v13.md` names the workaround.
- **The citation sweep**: 54 rewrites in 6 files, the same as the user's own trial.
- **The survey**: 0 blocking findings, 285 reported in 16 classes, 748 records in 35 chunks. Three questions on the uninterrupted path, none a repair question.
- **The run**: exit 0, `result=json-control`, 74.1 s. `validate`: `valid:true`, 748 checked, 0 findings. A second run: `result=no-op`.
- **Kill and resume**, on a second copy: killed inside chunk 18 of 35, `run` exit 7, `resume` exit 0, 35 of 35 verified, journal empty, 748 valid. A second `resume`: `no-op`.
- **Rollback before any ordinary write**, on a third copy: exit 0, `result=legacy`. The workbench without `.json-state/` and `archive/migrations/` equals the pre-run tree. The project outside it is stat-identical, and `git status --porcelain` is identical.
- **The read-back.** One open and one terminal package, through `bin/fusion-record show`, `bin/fusion-paths`, `bin/fusion-work-order`, `bin/fusion-claimed-package`, `bin/fusion-citation-check` and `bin/fusion-citation-sweep --dry-run`: every reader exit 0. All 748 listed records `show`, none refused.
- **Derived values.** Every survey `derived=` line equals the read-back count for its rule. The 183 persons derived from git's first add agree with `git log --follow` in 183 of 183 cases.
- **Against FJ04's proof on the same project.** The record-shape figures a code change alone could move are unchanged, apart from the one class a later code change was meant to add. Every other difference is the project's own work over 293 commits, or checkout-local files that git does not carry.

### The observation run (step 16)

`261009-2101-agent-dispatch-observation-at-f2cc68f0.md`: the opt-in suite `hooks/lib/__tests__/agent-dispatch-observation.test.ts`, run once in a clone of `f2cc68f0` with `--plugin-dir` on the clone. **14 of 14 cases passed**, 766 s in all, **7.25 USD** (the nine earlier cases 4.15 USD, the five new ones 3.10 USD). Every case ran on `claude-opus-5-5`, exit 0. The 14 JSON transcripts are kept beside the report.

- (a) five agents resolve their `OUT_*` paths into the claimed container; (b) the reviewer writes a review with its evidence record; (c) the state-auditor returns its coherence block; (d) the policy-curator writes its survey.
- (e) a finish binds the closing review's evidence, and the successor turns `ready`: D3's feature through the shipped prompt.
- (f) a confirmed drop: the package `dropped` with a reason, its plan `closed`, the successor blocked on an `unmet=` row.
- (g) and (h) both took the hold the user ruled admissible on 2026-10-08: the package left `claimed` with a `gate_hit`.
- (i) the takeover on the user's word: one transfer from the gone checkout `deadbeef`, its source an `answered` decision holding the approval verbatim. (j) no takeover under `autonomous` without that word.

No file under `agents/`, `skills/` or `rules/`, and not the suite itself, changed between `f2cc68f0` and C. So the prompts observed are C's prompts.

Six agent behaviours stay unobserved, and C's `docs/upgrading-to-v13.md` `## Documented limits` states them as a limit: the orchestrator's interactive approval paths, a closure that binds a `revise` verdict, `policy-curator` apply mode, `reviewer` with `**Review domain:** ontology`, `state-auditor` with live records and a `**Directive:**`, and repetition (cases (f) to (j) have run once).

### The documentation check (step 11)

Step 11 landed at `dd4bf3d4`, the commit Prior's 63 and 64 were frozen at. Its step note in the plan records every bullet of `docs/upgrading-to-v13.md` `## Documented limits` checked against the head. Each bullet cites the test that shows it, or was corrected to what was measured. The old-client boundary is corrected to the measured refusals. The stale-claim bullet gives the takeover route. G-C, which reviewed the step-12 fixes on top, reports: "The doc limits now match the tests."

Two later commits changed the guide, and each was reviewed against the code (`261009-2223-…`, `261009-2236-…`):

- the `circles/` `.DS_Store` workaround and its general form, the leftover procedure;
- git as a prerequisite inside a repository, with exit 3 for a missing or refusing git;
- the takeover cases (i) and (j) as observed once at `f2cc68f0`.

### Open issues, carried past 13.0.0

None blocks the release by the user's rulings. Each stays `open` in fusion's workbench. None touches `codec/`.

Deferred past 13.0.0 by the user (the plan's step note "C replaced", and the `5f7398c9` commit for R1):

| Issue | Rating | What it is |
|---|---|---|
| `261009-1833-migrate-names-a-four-commit-split-but-gives-no-path-lists-so-staging-it-needs-a-generated-list.md` | not rated | the migration report proposes a four-commit split but names no path list for each commit |
| `261009-1855-migrate-step-6-writes-the-sweep-beside-staged-renames-which-guard-a-refuses-as-dirty-tree.md` | medium (F2 of `261009-1855-reviewer-…`) | `/fusion:migrate` Step 6 runs the sweep's write beside staged renames, which the sweep's guard refuses as a dirty tree, and names no reading of exit 4 |
| `261009-2028-migrate-reads-a-broken-branch-ref-as-a-repository-with-no-commit-and-derives-untracked-for-every-file.md` | low | a branch ref git cannot read is taken for an unborn branch, so every person is derived as `untracked` |
| `261009-2040-migrate-skill-reads-a-missing-or-refusing-git-as-a-workbench-not-under-version-control.md` | not rated | the skill's rename steps take a missing or refusing git for "not under version control" and move with `mv` |
| `261009-2148-the-rename-pass-cannot-drain-a-circles-store-whose-only-entry-is-a-colliding-ds-store-and-the-json-run-refuses-on-it.md` | not rated | R1 of step 15; the upgrade guide names the hand step |

Rated low by a review, open:

| Issue | Review | What it is |
|---|---|---|
| `261009-1037-transition-evidence-is-accepted-on-a-drop-where-the-codec-checks-no-binding.md` | G-A, A2 | the client accepts `--evidence` on a `dropped` finish, where the codec binds nothing |
| `261009-1037-plan-steps-admits-a-level-two-step-heading-in-its-header-which-its-code-reads-as-the-end-of-the-steps-section.md` | G-A, D1 | `planSteps`' header admits a `##` step heading that its loop reads as the end of the section |
| `261009-1037-reconcile-hands-an-implemented-decision-to-an-orchestrator-its-own-route-does-not-have.md` | G-A, D2 | `/fusion:reconcile` hands the `implemented` transition to a route that does not send it |
| `261009-1448-the-version-boundary-test-needs-full-git-history-at-two-fixed-objects.md` | G-B | the version-boundary test reads the old bundle from git by object name, so a shallow clone or a `git archive` tree fails it |
| `261009-1636-in-a-fresh-clone-the-coverage-reads-carried-from-a-review-picked-by-checkout-order-not-the-newest.md` | coverage pass | in a fresh clone, `carried=` comes from a review picked by file mtime; `verdict=` is unaffected |
| `261009-2236-the-upgrade-guides-leftover-procedure-has-no-branch-for-a-leftover-with-no-copy-under-the-new-name.md` | `261009-2236-reviewer-…`, L-1 | the guide's leftover procedure assumes every leftover has a copy under the new name |

### Section 9's mandatory checks, by subject

Request 65 asks about the shared part only. The line below is fusion's proposal. Prior may draw it differently, and a correction is part of the answer. Each bullet is quoted by its opening words from `Prior: concept/fusion-json-workbench-spec.md` at `34a2710`, section 9, `Pflichtprüfungen:` (lines 898 to 920).

| # | Bullet (line) | Subject | Shared evidence | Host evidence (the user's to accept) |
|---|---|---|---|---|
| 1 | "Alle Paketstatus-/Claim-Kombinationen …" (900) | shared; the edge through the client is host | `codec/contract/transitions.json` unchanged since `f9ecae78`; 13 Go-emitted goldens and the applied ruling pass in Prior (63); the takeover session's refusals (`already-claimed`, `takeover-not-claimed`, `package-terminal`, `transition-refused`), 64 | a `succeeded` edge through `bin/fusion-write` and `bin/fusion-work-order` (`record-write.test.ts`); observation (e) to (h) |
| 2 | "Paketbildung durch Agenten …" (902) | host | – | observation (a) to (j) |
| 3 | "Ungültiges JSON, doppelte Schlüssel …" (904) | shared | 370 manifest cases, 279 invalid (278 `schema-invalid`, 1 `unsupported-format`), the `bytes` set included; 63 | – |
| 4 | "Keine Statuskopie in aktivem Markdown …" (906) | split: the migration's half shared, citation resolution host | the migration's survey reports a status head in a live record as a finding (`status-head-in-live-record`, 63 on the foreign copy at C); the migration session, 60 | the citation checker and sweep (54 rewrites on the foreign copy; `verdict=violations` is the known state of a migrated workbench, `261005-1107_*`) |
| 5 | "Briefänderung macht gebundene Nachweise stale …" (908) | shared | the codec's `bindEvidence` ties a binding to its package through `brief_revision` and `plan_revision`; evidence creation qualified since FJ02b (Prior's check at `7b8dde51`) | – |
| 6 | "Unterbrechung bei jeder mehrteiligen Anlage/Migration …" (909) | shared | the kernel's recovery and replay (60), with the takeover's recovery at every cut (64); the migration session's held intent, 60; at C, a kill inside chunk 18 of 35 and a resume to `no-op` (step 15) | – |
| 7 | "Git-Pull ohne Daemon …" (911) | host, apart from the kernel's lock | the kernel's one local `write.lock`, unchanged since 60 | fusion's checkout protocol and git; not re-measured in FJ05 |
| 8 | "Reale v12- und noch nicht umbenannte Workbench-Kopien …" (914) | shared (the migration) | FJ04's proof on copies of three real workbenches, one with v11 store names and one without `.git` (`## FJ04 (the hand-over)`); at C, one real v12.2.1 workbench under git with 2 untracked and 281 ignored entries listed and a nested collision met (R1) | the rename pass and its leftover procedure (the guide) |
| 9 | "Zweiter Migrationslauf ohne Änderungen …" (916) | shared | rollback refused after a host write, and after an ordinary claim (the migration session's bases C and D, 60); at C, a `no-op` second run and a byte-identical rollback before any write (step 15); every derived answer reference (82) announced by the survey and read back rule for rule | – |
| 10 | "Frischer Installations-/Sessiontest …" (918) | host | – | the isolated clone (step 13), the install (step 14), the observation run (step 16); the fresh install and the second project after the tag (step 21) |

Each report cited carries what the paragraph after the list asks for: source and tool versions, commands, inventories and hashes.

### 65. Does the shared-contract evidence, codec and migration, meet section 9's mandatory checks?

**Closes:** decision A1 of fusion's FJ05 plan (`261009-1021-who-accepts-fj05-and-may-13-0-0-ship-on-fusions-evidence-alone.md`, option 3) on Prior's side. Preferred form: a reply at a Prior commit.

The question covers bullets 1, 3, 5, 6, 8 and 9 of the table above, and the shared half of bullet 4. It asks Prior three things:

- Does that evidence meet section 9's mandatory checks for the shared contract?
- Is the line between shared and host evidence drawn where Prior draws it? Where it is not, which bullet moves, and what does it then need?
- Does any part of it need a codec byte to change? Fusion asserts it does not. The codec at C is the one qualified at `34a2710`.

It does not ask Prior to run anything, to read a real migrated workbench (decision A2, option 1), or to accept the host-specific evidence, which is the user's. Prior's host binding of the takeover stays Prior's work after the release, as `### The hand-over point: Prior's host binding of the takeover` above states, and gates nothing here.

**The release act waits for a "yes".** If Prior answers "no", or asks for a codec byte to change, fusion's run stops at plan step 19, and the user rules. 13.0.0 is not shipped again with changed bytes (section 8.1). A late defect becomes 13.0.1.

### What the release act will do

Plan step 20, on the user's approval, after Prior's "yes" to 65:

- **Preconditions**, asked in the one approval: Prior's "yes" to 65; the user's confirmation that their own test with Claude and with Prior is done; the coverage verdict above; `claude plugin validate .` still passing at C; and, by the user's ruling of 2026-10-09, the user's real migration of the consuming project measured in step 15, run with the candidate build, has succeeded.
- **The act:** `git push origin 468d8e87:main`, fast-forward only and refused otherwise; `git tag -a v13.0.0 468d8e87 -m "fusion v13.0.0"`, with the coverage result in the annotation; `git push origin v13.0.0`.
- **It tags C itself.** `main` and `v13.0.0^{commit}` both become `468d8e87`. The commits after C on `fj-json-workbench`, this hand-over among them, change only `fusion-workbench/` and this file. They are not release content.
- **No codec byte changes.** No version-bump commit is needed, because C already reads 13.0.0 (`git show 468d8e87:.claude-plugin/plugin.json`). No `fusion --update` runs, and nothing writes `~/.fusion`.

After the tag, plan step 21 proves the fresh install from `tags/v13.0.0`, its assets, the update path and a smoke test in a second project. Step 22 updates the marketplace entry. `## FJ05 (released as v13.0.0)` reports both.

### Requests 59 to 65, as they stand

| Request | State | Where |
|---|---|---|
| 59 | **complete** at Prior `d6abeb8`, for `f9ecae78`; re-asked as 63 | `Prior: docs/design/fusion-fj04-correction-prior-response.md` `## 59: shared fixtures` |
| 60 | **complete** at `d6abeb8`; `c76bbce9…` qualified; re-asked as 64 | the same document, `## 60: runtime qualification` |
| 61 | **answered Yes** at Prior `7da6690` | `Prior: docs/design/fusion-fj03d-prior-response.md` |
| 62 | **accepted with corrections** at Prior `f32bf4a` | `Prior: docs/design/fusion-claim-takeover-prior-response.md` |
| 63 | **complete** at Prior `34a2710`, for `dd4bf3d4`; 413 files, 370 manifest cases (91 valid, 279 invalid), 13 goldens unchanged | `Prior: docs/design/fusion-takeover-qualification-prior-response.md` `## 63 — Shared schemas and fixtures` |
| 64 | **complete** at `34a2710`, for `dd4bf3d4`; `fb170361…` qualified, 699 011 bytes; 715 pinned entries, 225 exchanges, `go test ./...` and `go vet ./...` passed; Prior's production takeover stays refused until its own host qualification | the same document, `## 64 — Runtime snapshot and replay` |
| 65 | **asked** above: does the shared-contract evidence, codec and migration, meet section 9's mandatory checks at C = `468d8e87` | this section |

No request 66 is asked (decision A2, option 1). These rows supersede the rows for 59 to 64 in `#### Requests 59 to 64, as they stand` above.
