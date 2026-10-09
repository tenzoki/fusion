# Review: the documentation-only release candidate `5f7398c9` for 13.0.0

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `f8203e70..5f7398c9`
**Not-opened:** `fusion-workbench/orchestrator-events.jsonl`

**Review domain:** code
**Work-item:** 260928-1338-json-control-data-and-markdown-artefacts

What the Not-opened line covers. The dispatch scoped the review to the two commits that change shipped files, `f2cc68f0` and `5f7398c9`. The other five commits in the range (`7c19cd02`, `97b87e73`, `66c41da0`, `8f980329`, `33f8cfbf`) change only `fusion-workbench/`, measured with `git diff --name-only f8203e70..5f7398c9`: of the 66 paths only five lie outside it. Of the workbench files I opened as input the observation analysis `261009-2101-agent-dispatch-observation-at-f2cc68f0.md`, the previous review `261009-2028-reviewer-repo-top-by-filesystem-f8203e70.md` and the narratives of the three issues the range closes or files. I did not open the step-13 and step-15 analyses and their log directories, the observation transcripts, the decision and plan narratives `8f980329` touched, or any control file but one issue's; they are workbench content the dispatch scoped out, named here in words because a store-prefixed path on the Not-opened line is a citation the lint refuses. All five shipped files were opened, and their whole diff was read.

## Summary

Verdict **revise**, with no release blocker; I would ship 13.0.0 at `5f7398c9`. The dist change is comments only. The `bin/fusion-migrate` exit-3 statement and the observation claims are true of the code and of the analysis. Three Low defects: one header sentence overgeneralises a measured case, two shipped copies of "Node only" were left behind, and the `.DS_Store` workaround is safe but covers only the top-level case.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 3 (R-1, R-2, R-3) |

## What was verified true

- **The dist change is comments only.** `git diff f8203e70..5f7398c9 -- hooks/dist` shows one hunk pair per file, each inside the leading `/** … */` block, and byte-identical to the `hooks/migrate.ts` hunks. No code line moved. The step-16 analysis also ran `npm test` in a clone of `f2cc68f0` with `git status --porcelain` empty afterwards, so the committed dist is the build of the committed source.
- **`bin/fusion-migrate` exit 3 for git.** `git()` in `hooks/migrate.ts` throws `Stop(EXIT.fault)` (3) on a spawn error (`ENOENT`: not installed; `ETIMEDOUT`), on `status === null` (`killed by <signal>`), and on any unexpected exit (128: dubious ownership), with the message `git <args> over <cwd> failed: <why>`. No catch in the file rewrites a git `Stop`. The wrapper `exec`s node, so the code passes through. "Naming the call and the reason" holds.
- **"Plugin and Node only outside a git repository."** `repoTop` returns `null` without spawning git when no `.git` stands at or above the workbench; `gitLists` and `firstAdds` then call no git.
- **`GIT_DIR` and `GIT_WORK_TREE` with no `.git` above: migrated as if there were no repository.** True by the same early `null`.
- **A `.git` hidden by `GIT_CEILING_DIRECTORIES` stops with exit 3.** Measured: ceiling at the enclosing repository, `rev-parse` exits 128.
- **The observation claims** in `docs/upgrading-to-v13.md` `## Documented limits`: cases (a)-(e) passed at `495aca7d` (`261007-2348-agent-dispatch-and-skill-block-observation-at-495aca7d.md`, 9 of 9) and at `f2cc68f0` (`261009-2101-agent-dispatch-observation-at-f2cc68f0.md`, 14 of 14); (f)-(j) passed once, at `f2cc68f0`. (i) and (j) match the test titles in `hooks/lib/__tests__/agent-dispatch-observation.test.ts`. The five remaining bullets match rows 1-5 of the analysis' table, and the repetition bullet matches row 6. No shipped prompt or skill changed between `f2cc68f0` and `5f7398c9` (`git diff --stat` over `agents skills hooks/lib codec rules` is empty).
- **The `circles/` paragraph's mechanism.** `move_one` refuses an existing destination, `fold_store` leaves a non-empty source, and `preconditions` refuses with exit 5 while `legacyNames` finds `circles`. All as stated.
- **Is the `.DS_Store` advice safe?** Yes. A `.DS_Store` is Finder metadata, untracked, and not read by the codec. A non-`.DS_Store` leftover is deleted only after the user has checked that the `work-packages/` copy is the one to keep. Data can be lost only if that check is done wrongly, and with no git history the delete cannot be undone. R-3 asks for the check to be concrete.

## Findings

### R-1, Low: the header's "empty or non-git `.git` entry stops with exit 3" is false inside an enclosing repository

`hooks/migrate.ts` `## The git pass` (and both dist files): "an empty or non-git `.git` entry and a `.git` hidden by `GIT_CEILING_DIRECTORIES` stop the run with exit 3".

Measured with git 2.53.0, the exact `repoTop` call `git -C <proj>/fusion-workbench rev-parse --show-toplevel`:

- an empty `.git` *directory* in `<proj>`, `<proj>` inside a committed repository: **exit 0**, the enclosing toplevel. `repoTop` returns it and the run proceeds.
- an empty `.git` file, or one reading `hello`: exit 128, "invalid gitfile format", so exit 3.
- an empty `.git` directory with no repository above: exit 128, so exit 3.

The previous review measured only the last setup. The behaviour in the first case is git's own and correct; the sentence is not. Fix: name the two cases the sentence covers. Filed: `261009-2223-migrate-header-says-an-empty-git-entry-stops-the-run-but-an-empty-git-directory-inside-another-repository-does-not.md`.

### R-2, Low: two shipped copies still say Node is the only prerequisite

- `README-hooks.md` `### The bin/ helper roster`, row `bin/fusion-migrate`: "Plugin and Node only." and the exit-table gloss "3 install incomplete".
- `docs/upgrading-to-v13.md`, the opening paragraphs: "**What v13 needs on the machine:** Node `>=20.12.0`".

Both contradict the corrected `bin/fusion-migrate` header. The closed issue's acceptance named only the two headers, so these were outside it; the previous review's G-3 did not name them either. The skill's copy is the deferred `261009-2040-migrate-skill-reads-a-missing-or-refusing-git-as-a-workbench-not-under-version-control.md` and is not re-reported. Filed: `261009-2223-readme-hooks-and-the-upgrade-guide-still-name-node-as-fusion-migrates-only-prerequisite.md`.

### R-3, Low: the `circles/` workaround covers only a top-level `.DS_Store` under `circles/`

`docs/upgrading-to-v13.md`, "**If `circles/` will not empty.**": "Delete `fusion-workbench/circles/.DS_Store` by hand ..., remove the then-empty `circles/`".

- Finder writes `.DS_Store` into every folder it opens, and `fold_store` descends into a container present under both stores. Running Step 4's functions verbatim on `circles/pkgA/.DS_Store` beside `work-packages/pkgA/.DS_Store` leaves `circles/pkgA/.DS_Store` and both `circles/pkgA` and `circles` "not empty and stays". The file the paragraph names does not exist, and `circles/` is not empty after the named steps.
- `legacyNames` refuses on `planning` and `consult` too, in `shared/` and in every container. A colliding `.DS_Store` there gives the same exit 5 under a heading that names `circles/` only.
- The non-`.DS_Store` branch gives no comparison (`cmp`) and no route when the old copy is the one to keep.

Filed: `261009-2223-the-upgrade-guides-circles-workaround-names-only-a-top-level-ds-store-and-only-circles.md`. The underlying rename-pass defect stays with the deferred `261009-2148-the-rename-pass-cannot-drain-a-circles-store-whose-only-entry-is-a-colliding-ds-store-and-the-json-run-refuses-on-it.md`.

## Cross-cutting observations

- **A documentation fix inherits the reach of its acceptance text.** R-1 generalises the one setup the issue measured. R-2 is the copies the acceptance did not list. In both, the commit did what the acceptance asked, and no grep for the old wording ran across the shipped text. Fix direction: on a wording correction, grep the shipped tree for the old phrase (`Node only`, `nothing else`) before closing.
- **The repetition bullet sits under "were never observed ... reached none of them"** while saying (a)-(e) passed twice. It is not false: the limit is that one or two runs prove those runs. But the lead sentence reads oddly over it. Also, (e)'s first pass at `495aca7d` predates the orchestrator change `ee3a3c19`, so "passed twice" is true of the test and not of one prompt text. Not filed.

## Recommended sequencing

1. None of R-1 to R-3 blocks 13.0.0. All three are wording.
2. R-2 and R-3 are user-facing, in the upgrade guide a v12 user reads first. Fix them in the first point release, R-3 together with or replaced by the fix for the deferred rename-pass record.
3. R-1 is a header sentence; fix it with R-2 in one documentation pass.

Verification: `git diff f8203e70..5f7398c9 -- bin hooks docs` read in full; `git diff --name-only f8203e70..5f7398c9` (66 paths, 5 outside the workbench); four `git rev-parse --show-toplevel` setups and one `GIT_CEILING_DIRECTORIES` setup in a scratch tree, git 2.53.0; `fold_store`/`move_one` from `skills/migrate/SKILL.md` Step 4 run on a scratch nested `.DS_Store` collision; `git diff --stat f2cc68f0 5f7398c9 -- agents skills hooks/lib codec rules` empty.
