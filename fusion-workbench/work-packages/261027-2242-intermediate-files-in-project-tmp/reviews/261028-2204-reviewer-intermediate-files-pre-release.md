# Pre-release code review: intermediate files in ~/.fusion-tmp (13.4.0)

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `a43c0829..cc183f1e`
**Not-opened:** `hooks/lib/__tests__/fixtures/rules-emission.golden`, `hooks/lib/__tests__/fixtures/surface-growth.golden`, `hooks/lib/__tests__/temp-paths.test.ts`
**Review domain:** code
**Work package:** 261027-2242-intermediate-files-in-project-tmp

`hooks/dist/` was not read file by file. It was compared mechanically: `npx tsc -p hooks/tsconfig.json --outDir <scratch>` and `diff -rq <scratch> hooks/dist` showed no differences. `temp-paths.test.ts` was grepped, not read whole.

## Summary

The design holds. `grant` only adds and refuses an unparseable file. The commit-message path is coherent across all four surfaces and keeps `<session-id>`. A launcher-started session does not deny its own writes, with one exception: when `$HOME` itself lies under a temp prefix. The one release-relevant gap is doc honesty. The accepted scratchpad denial under bare `claude` and on the marketplace path is documented nowhere a user reads it. Verdict: **revise**.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 5 |
| Low | 6 |

One decision filed (open question 4, unruled).

## Findings by theme

### A. Deny entries (weight item 2)

**A1 (High). The scratchpad denial under bare `claude` is undocumented.** Setup Step 0t (`skills/setup/SKILL.md:97-103`) runs `grant` unconditionally, so every project without a sandbox gets the four deny entries. A bare-`claude` or marketplace-path session keeps its scratchpad under `/private/tmp`, and step 1 (e) measured that `Write` there fails. `docs/upgrading-to-v13.md:300` says only that such sessions "keep their scratchpad … in the system directories". `bin/fusion-tmp:53-69`, the `README.md` marketplace paragraph and `skills/check/SKILL.md:172` say nothing. The plan accepted the risk (open question 1). The dispatch asked whether it is documented, and it is not. Since the marketplace path has no launcher, this hits every marketplace user after setup. Issue `261028-2204-scratchpad-denial-under-bare-claude-is-undocumented.md`.

**A2 (Medium). The deny is written when `$HOME` lies under a temp prefix.** `under_temp` (`bin/fusion-tmp:182-189`) tests only `pwd -P`. With `HOME=/tmp/...` (containers, CI), `Edit(//tmp/**)` covers `~/.fusion-tmp/<id>`. Deny beats allow, so the orchestrator's commit-message `Write` is refused even in a launcher session, and so is the relocated scratchpad. `fusion-tmp.test.ts:197-209` asserts `deny=written` with `home()` under `tmpdir()`. In other words, the suite pins the self-denying case as correct. Issue `261028-2204-grant-writes-the-deny-when-home-itself-lies-under-a-system-temp-prefix.md`.

**A3 (Low). An unparseable settings layer reads as "no sandbox".** `temp-paths.ts:179-187` swallows parse errors, so `grant` can write the deny under a sandbox it could not read. Issue `261028-2204-an-unparseable-settings-layer-reads-as-no-sandbox-and-the-deny-is-written.md`.

Verified clean: with the launcher and an ordinary `$HOME`, the commit-message path, `CLAUDE_CODE_TMPDIR` and `TMPDIR` all lie under `~/.fusion-tmp/<id>`, outside every deny prefix. The sandbox branches (`skipped-sandbox`, `present-under-sandbox`) are written as the header says and are tested.

### B. `grant`'s settings merge (weight item 1)

Verified clean:
- `mergeSettings` (`temp-paths.ts:117-155`) copies every key, only appends missing strings to three lists, and refuses a non-object `permissions` or a non-string list.
- The dry-run call runs first (`bin/fusion-tmp:208-209`), so an unparseable file returns 4 before `.gitignore` is touched. The test at `fusion-tmp.test.ts` "exits 4" pins both bytes.
- Worktree resolution goes through `--git-common-dir`. The tests cover outside-git and worktree resolution.

**B1 (Medium). The `permissions` selector and `grant` write different files in a worktree.** `skills/check/SKILL.md:197` writes the file at `pwd`. `:198` runs `grant`, which writes the main checkout's file. `:201` still says "Never write this file outside `pwd`". Issue `261028-2204-permissions-selector-and-grant-target-different-settings-files-in-a-worktree.md`.

**B2 (Low). A symlinked settings file is replaced by a regular file, and its mode is reset** (`temp-paths.ts:171-173`). Issue `261028-2204-grant-replaces-a-symlinked-settings-file-and-resets-its-mode.md`.

**B3 (Low). `evaluate` runs under `|| rc=$?`, so `set -e` is off inside it.** A failed `.gitignore` append is still reported as `ignored=added` (`bin/fusion-tmp:227-229`, `:256`). Issue `261028-2204-grant-runs-with-set-e-off-and-can-report-ignored-added-after-a-failed-append.md`.

**B4 (Low). Two settings.md:88 branches are untested** (`$HOME`-rooted repo, file not owned by the user; `bin/fusion-tmp:156-162`). The plan promised "each with a test". Issue `261028-2204-the-settings-file-exceptions-for-home-rooted-repos-and-foreign-owned-files-are-untested.md`.

**B5 (decision). Open question 4 shipped unruled.** From a worktree, `grant` appends to the main checkout's tracked `.gitignore` (`bin/fusion-tmp:227-229`, pinned at `fusion-tmp.test.ts:169`). Decision `261028-2204-which-gitignore-takes-the-settings-line-when-grant-runs-in-a-worktree.md`.

### C. `install.sh` and the launcher (weight item 3)

Verified clean:
- The heredoc is unquoted (`<<EOF`, `install.sh:105`). Every runtime `$` in the new lines is escaped (`install.sh:169-173`), and `$REPO` expands at install time as before.
- `|| true` inside the substitution keeps `set -euo pipefail` from aborting outside a project.
- `--update` piping `curl | bash` is safe: `install.sh` reads nothing from stdin, and a curl failure exits non-zero under `pipefail` and `set -e`.
- `install.test.ts` covers the inside, outside and subdirectory cases under a scratch HOME.

**C1 (Medium). The mint notice is swallowed.** `bin/fusion-tmp:117` discards `fusion-identity`'s stderr, and the launcher discards `fusion-tmp path`'s stderr (`install.sh:169`). The launcher is now the first reader after `git clean -xdf`, so the re-mint notice from issue `260904-1058` is lost. The plan's re-mint risk row relies on that notice. Issue `261028-2204-fusion-tmp-and-the-launcher-swallow-the-checkout-id-mint-notice.md`.

### D. Hazards to the real `$HOME` (weight item 4)

- No shipped block that a test executes calls `bin/fusion-tmp` today. `install.test.ts` runs the launcher and the `## Step 0 —` blocks under a scratch HOME, and its section parser stops at `## Step 0t —`. `fusion-tmp.test.ts` scratches HOME on every run.
- **D1 (Low).** `store-name-migration.test.ts:21` and `:125` still hand the real HOME to lifted setup and migrate blocks. Step 0t is safe only because of where its heading sits, and nothing pins that. Issue `261028-2204-tests-that-run-shipped-blocks-still-pass-the-real-home.md`.
- The step-7 leftover still exists: `~/.fusion-tmp/98fc420e/`, whose `.origin` points at `/private/var/folders/…/T/store-name-aK9aWH`. Removing it is the user's job, since nothing in fusion deletes there.

### E. Commit-message path (weight item 5)

Coherent. `agents/orchestrator.md:271`, `:293` and `:463`, `skills/cleanup/SKILL.md:59`, `skills/commit/SKILL.md:84` and `PRESCRIBED_MESSAGE_PATH` (`staging-drift.ts:193-194`) all name `~/.fusion-tmp/<checkout-id>/fusion-commit-msg-…`. The orchestrator and cleanup texts keep `<session-id>` and restate why. `commit-message-path.test.ts` pins location, discriminator and reason for the orchestrator and the commit skill.

**E1 (Medium). Unchecked `path` failure.** `skills/archive/SKILL.md:247` and `:262` use `fusion-tmp path` unchecked. When `fusion-identity` prints no `CHECKOUT=` (git identity unset, `bin/fusion-identity:212-216`), `C` becomes `/fusion-archive-…`, and Step 7 silently skips the move. None of the three commit-message texts says what to do on a failed `path` either. Issue `261028-2204-archive-skill-does-not-check-fusion-tmp-path-before-using-it.md`.

**E2 (Low). Stale wording.** `staging-drift.ts:14` still says "under `/tmp`". The comment at `commit-message-path.test.ts:249-250` says cleanup "defers" to the commit skill, but cleanup spells its own path and no case pins it. Issue `261028-2204-stale-tmp-wording-left-in-staging-drift-and-commit-message-path-test.md`.

### F. Doc honesty (weight item 6)

- A1 above.
- **F1 (Medium).** The permissions question (`skills/check/SKILL.md:172`) asks consent for grants and denies that Setup already wrote without asking, and it says "kept out" where only `Write`/`Edit` are denied. `README-agents.md:364` says "every child's `tempfile`" survives, which is false under the sandbox. Issue `261028-2204-permissions-question-and-launcher-docs-claim-more-than-the-code-does.md`.
- Honest as written: the 13.4.0 "What stays unenforced" list (`docs/upgrading-to-v13.md:294-302`) on programs, redirects, the sandbox and `/var/tmp`. Also honest: the tracker 0d and session-start headers, which claim observation only.

## Cross-cutting observations

- **Silenced stderr and unchecked substitution.** The helper and its callers repeat one pattern. They suppress stderr (`fusion-tmp:116-117`, `install.sh:169`) or use the substitution's output unchecked (`archive:247,262`). A1, C1 and E1 are three faces of it: the failure or the side effect happens and nobody sees it.
- **Two writers, two target rules for `settings.local.json`.** The selector prose resolves at `pwd`, the helper at the main checkout (B1). Moving the selector's merge into the helper, as the plan's `## Approach` intended for the grant half, removes the split.
- **Setup writes without asking what a later question offers** (A1, F1). Either Setup asks, or the question stops implying that the user decides it.

## Recommended sequencing

- **Before the 13.4.0 tag:** A1 (doc sentences), A2 (one more prefix test on `$HOME`), F1 (wording). They are small and touch the claims the release makes.
- **Before or right after the tag:** C1, E1 and B1. Each is a contained fix, and each touches the skills or launcher bounds.
- **Cleanup:** A3, B2, B3, B4, D1, E2, plus the decision on open question 4.
