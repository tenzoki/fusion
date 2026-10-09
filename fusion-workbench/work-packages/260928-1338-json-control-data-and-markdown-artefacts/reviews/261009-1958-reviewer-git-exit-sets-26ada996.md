# Review: per-question git exit sets in the sweep and migrate, `26ada996`, release candidate for 13.0.0

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `78680a11..26ada996`
**Not-opened:** `fusion-workbench/orchestrator-events.jsonl`

What the Not-opened line covers. I opened every shipped file `26ada996` changes and both issue records it closes (narrative and `Resolved:` note). The event log it also touches was not opened. The dispatch scoped out the three other commits in the range, `e6a5dfc5`, `035f7c1d` and `5511c509`, which change only `fusion-workbench/`. I read the review `5511c509` adds, `261009-1855-reviewer-citation-sweep-buffer-fix-78680a11.md`, as input, not as a subject. F2 of that review (`261009-1855-migrate-step-6-writes-the-sweep-beside-staged-renames-which-guard-a-refuses-as-dirty-tree.md`) is deferred past 13.0.0 by the dispatch and is not re-reported.

**Review domain:** code
**Work-item:** 260928-1338-json-control-data-and-markdown-artefacts

## Summary

Verdict: **revise**. The sweep half of `26ada996` is correct and closes F1: every caller of its git wrapper refuses unless git answered the question asked. The migrate half closes F3 (the 1 MB listing), but it draws the line between "no repository" and "fault" in the wrong place. A repository git refuses to open (dubious ownership) still migrates as "no repository". A machine without git, which `78680a11` migrated in plain mode, now stops with exit 3, against the entry's own "Plugin and Node only" contract. A second, smaller defect turns a signal-killed git into a `TypeError`. Both are filed. Whether the first blocks 13.0.0 is the user's call.

## Totals

| Critical | High | Medium | Low |
|---|---|---|---|
| 0 | 0 | 1 | 1 |

## What was verified

- **Tests fail on the old build.** I ran both new cases against a `git archive` extract of `78680a11`, using the new test files and the work tree's `node_modules`. Both fail. The sweep case fails on its first damage (stderr `workbench-untracked`, not `git-failed`). With the damage order reversed, the missing-HEAD-tree case exits 0 and prints `rewrites=1`: the uncommitted edit was overwritten. The migrate case fails on the `ignored=` count. On `26ada996`, `citation-sweep.test.ts`, `migrate.test.ts` and `committed-dist.test.ts` pass 39 of 39, and `surface-growth-bound.test.ts` passes 12 of 12.
- **`hooks/dist` matches the source.** `npx tsc -p hooks/tsconfig.json --outDir <scratch>` reproduces `citation-sweep.js`, `citation-sweep.d.ts`, `migrate.js` and `migrate.d.ts` byte for byte (`cmp`).
- **The golden is a size record only.** It changes `citation-sweep.test.ts 709 → 734`, `migrate.test.ts 231 → 245` and `total 24870 → 24909`. `wc -l` at `26ada996` gives 734 and 245. No baseline moved.
- **Test robustness.** Locale: the sweep regex matches `exit 128: .+` and nothing of git's message text. This machine's git speaks German ("Schwerwiegend: …") and the case passes. Cleanup: the sweep case removes each scratch repo in `finally`, and the migrate case lives under the `base` directory `afterAll` removes. Timing: the migrate case took 2.1 s against `2 * CASE_TIMEOUT`. Its 1 400 paths reach about 900 bytes under macOS `TMPDIR`, below `PATH_MAX` 1 024, with the same margin the previous review recorded for the sweep fixture. The missing-tree damage removes a loose object, which holds because the scratch repo has two fresh commits and no pack.

### The sweep's exit sets (`hooks/citation-sweep.ts`)

- **The wrapper** (`:543-549`): `failed` is set for a spawn error, a null status (signal), and any status outside `answers`, with git's first stderr line. Its three callers each refuse when `failed !== null`: `isTracked` (`:558-561`), `porcelainPaths` (`:579-582`) and `refusal` (`:620-628`). No other git spawn exists in the file (`grep spawnSync`). No caller reads a failure as an answer.
- **`ls-files --error-unmatch`, {0, 1}.** It exits 1 on no match (the `Resolved:` note checked this under git 2.53.0). The status comes from `error()` returning 1 in `ls-files`' pathspec report, which as far as I know has not changed across git 2.x. *Inference*: I ran only 2.53.0. fusion documents no minimum git version (`grep` over the READMEs, `docs/`, `rules/` and `bin/` finds none). An extra path inside a submodule makes git exit 128. That is now `git-failed` where it used to be `path-untracked`; both refuse, so this is harmless.
- **`status --porcelain -z`, {0}.** Correct: status has no "no" answer.
- **`rev-parse --show-toplevel`, {0, 128}.** 128 stays `not-a-git-work-tree`. That status also covers dubious ownership: I confirmed exit 128 under `GIT_TEST_ASSUME_DIFFERENT_OWNER=1`. In the sweep this only names the wrong reason, because the guard refuses either way. The previous review noted this and did not file it, and I leave it at that. Separately, `top.status === null` gives `no-git` for a spawn error and for a signal alike, so a killed `rev-parse` reads "git could not be run". The wording is imprecise, but the outcome is still a refusal.

### Migrate's single helper (`hooks/migrate.ts`)

- **Maximum buffer and timeout.** Every git call goes through `git` (`:141-147`) with `maxBuffer: 1 << 30` and 600 s. No other spawn is in the file. F3 is closed.
- **`--is-shallow-repository`** (`:168`) now must exit 0. That is right on git ≥ 2.15. On an older git, `rev-parse` echoes the unknown flag with exit 0 and the result reads as not shallow, the same as before. *Inference*: from `rev-parse`'s pass-through of unknown `--` options; not run on such a git.
- **"No repository" is only exit 128 of `rev-parse --show-toplevel`** (`:150`), as the dispatch asked. That rule is what F-A below is about.
- **Exit 3.** `bin/fusion-migrate`'s header gives exit 3 as "install incomplete … or an internal fault". `skills/migrate/SKILL.md` Step 7 says "on any exit other than those named here, show the stderr line and stop". A git fault therefore reaches the user with its reason, and no documented exit code changes meaning.
- **Plain mode with git installed still migrates.** A fixture workbench outside any repository gives `unknown	no-repository` and exits 0 on both builds. The existing case (`migrate.test.ts:103-107`, `.git` removed) still passes.

## Findings by theme

### The repository question in migrate is cut on an exit code that does not decide it

**F-A, Medium.** `repoTop` reads 128 as "no repository", and the helper reads every other outcome, ENOENT included, as a fault (`hooks/migrate.ts:141-150`; header `:26-29`). Run against extracts of both builds:

| Case | `78680a11` | `26ada996` |
|---|---|---|
| repository under dubious ownership | exit 0, `unknown	no-repository` | exit 0, `unknown	no-repository` |
| no repository, no git on `PATH` | exit 0, `unknown	no-repository` | **exit 3**, `… failed: ENOENT` |
| `git init`, no commit | exit 3 (`git log` 128) | exit 3 (`git log` 128) |

- The first row is the F3 class, a failure read as an answer, kept by the one status the fix still treats as an answer. `run` would write `no-repository` as the derivation reason into every migrated control file of a repository that has a history.
- The second row is a regression in `26ada996`. It contradicts `hooks/migrate.ts:14` ("It needs the plugin and Node and nothing else") and `bin/fusion-migrate:20` ("Plugin and Node only"). `skills/migrate/SKILL.md` Step 4 calls the same machine `MODE=plain`. 13.0.0 refuses an unmigrated workbench, so that machine cannot reach 13.0.0 at all. It follows the acceptance text of the issue I wrote in the previous pass ("A spawn error … is reported as a git failure, not as 'not a repository'"). That acceptance did not separate "git missing, no repository either" from "git missing beside a `.git`". The defect starts in that text, not in the implementer's reading of it.
- The third row predates this commit. The header's own "a file git does not track … gives no person" describes it.

Fix direction (*inference*): let the filesystem decide whether a repository exists (a `.git` entry on the ancestor chain), and ask git only what it holds. With no `.git`, git does not run. A `.git` with git missing or 128 is a fault naming git's line. `rev-parse --verify -q HEAD` exiting 1 means no history. Filed: `261009-1958-migrate-reads-git-exit-128-as-no-repository-and-stops-on-a-machine-without-git.md`.

### A defaulted parameter turns a signal into "absent"

**F-B, Low.** `git(cwd, args, absent = null)` returns `null` when `r.status === absent`. A signal without `r.error` has `status === null`, so a killed git is "absent". The four callers use `!` (`:155`, `:168`, `:170`, `:188`), and the run dies with `TypeError: Cannot read properties of null (reading 'split')` under the "a fusion bug or an incomplete install" text. Reproduced with a `git` stub on `PATH` that runs `kill -9 $$` on `ls-files`. The exit is 3 either way, so only the reason is wrong, and the header's promise to name the call is not kept for a signal. Filed: `261009-1958-migrate-git-helper-reads-a-git-killed-by-a-signal-as-absent-and-crashes-on-null.md`.

## Cross-cutting observations

- **The two files cut the same question differently, and in this case the difference is correct.** The sweep gates a write: refusing on any doubt is right, and its 128 → `not-a-git-work-tree` misnames the reason without changing the outcome. Migrate is a reader that writes derived provenance. There a misread "no repository" lands in the records, which makes the 128 cut more costly in migrate than in the sweep.
- **The acceptance in a review issue becomes the specification.** F-A's regression came from an acceptance sentence written without the plain-mode contract in view. For a future issue on a reader with a documented degraded mode, the acceptance names that mode.
- **`hooks/lib/git.ts` keeps the opposite convention**: every decline is `null` and the caller "claims nothing" (`:96-120`, per the previous review). There are now three git-call conventions in `hooks/`. That is not filed. It becomes worth one shared helper if a fourth caller appears.

## Recommended sequencing

1. F-A before 13.0.0 if a git-less machine or a `safe.directory`-guarded checkout is expected among the migrating installations. The no-git row is a lockout under 13.0.0's refusal of unmigrated workbenches. The dubious-ownership row writes wrong provenance that a rerun does not correct. If neither is expected, the release can ship with F-A open and a note in the release text.
2. F-B is cleanup: the exit code is already right.

Not checked: git versions other than 2.53.0. The macOS `/usr/bin/git` shim without Command Line Tools (*inference*: it exits non-zero with an `xcrun` error, which `26ada996` would read as a fault and `78680a11` read as no repository). Windows.
