# Closing pre-tag code review: the N1/N2 fixes and the 13.4.0 release commit

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `5c7a1487..928d3ac7`
**Not-opened:** none
**Review domain:** code
**Work package:** 261027-2242-intermediate-files-in-project-tmp
**Cross-references:** 261029-0647-reviewer-intermediate-files-fix-followup.md, 261028-2204-reviewer-intermediate-files-pre-release.md

Scope: every file changed in `628b1d9d`, `469e480e` and `928d3ac7`. The nine `.record.json` files and `orchestrator-events.jsonl` were read only as state changes. Run: `fusion-tmp.test.ts`, `temp-paths.test.ts`, `reference-resolution-lint.test.ts` and `surface-growth-bound.test.ts`, under the default `TMPDIR` (`/var/folders/…/T/`) and the real `HOME`, unchanged. 79 of 79 passed. The sha1 of this repository's `.claude/settings.local.json` was the same before and after the run. The full suite was not run.

## Summary

N2 is fixed: the fixtures of `fusion-tmp.test.ts` and `install.test.ts` no longer depend on `TMPDIR`, and a work tree above them stops the file before any grant. N1 is mostly fixed. One surface is still off, and it is the one where the user gives consent: the permissions question recommends `bypassPermissions` and says the Bash deny holds "by mode", without saying that this mode is the one where a redirect was seen passing. The release surfaces are coherent at 13.4.0, and the help rotation follows the rule. Verdict: **revise**, for one sentence in the check skill and two in the docs.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 1 |

Plus one existing open issue, cross-referenced and not refiled (Q4 below).

## The five questions

**Q1. Do the N2 guards hold under any `TMPDIR`?** For the two files that run `bin/fusion-tmp` or the launcher, yes.
- `fusion-tmp.test.ts` no longer imports `tmpdir`. `TEMP_BASE` is `realpathSync("/tmp")` and `OUTSIDE_BASE` is `realpathSync("/var/tmp")`, so `TMPDIR` cannot move them. At load, the file asserts which side of the temp prefixes each base is on, and runs `assertNoEnclosingRepo` on both. `mk` runs the guard again on every fixture, before `git init`, so a fixture built inside a foreign work tree throws before any subcommand runs. The new "the fixture guard" case pins that the guard really refuses.
- The guard and the script read the same directory with the same environment: `cleanEnv()` strips the six `GIT_*` locators in both, `env()` builds on `cleanEnv()`, and `settings_file`/`in_git` in `bin/fusion-tmp` ask git the same question. Any git failure the guard reads as "no repository" (git missing, dubious ownership), `in_git` reads the same way, so the two cannot disagree about where the settings file goes. Not filed: `GIT_CONFIG_COUNT`/`GIT_CONFIG_PARAMETERS` are not stripped, and only a `core.worktree` passed by a parent `git -c` could use them.
- `install.test.ts` builds under `realpathSync("/tmp")`. `assertOutsideRepoAndWorkbench` checks for a work tree (with `env: { PATH }` only) and for a `fusion-workbench/.fusion-setup` on every ancestor. The `/tmp` filter now replaces `install.tmp` before it matches, so the install's own paths no longer read as fixed temp paths.
- `temp-paths.test.ts` still builds under `tmpdir()`, except the `/var/folders` case, which now uses `getconf DARWIN_USER_TEMP_DIR` and asserts the `/private/var/folders/` prefix on darwin. Nothing in this file runs `bin/fusion-tmp` or writes a settings file. The hooks it spawns write only into the workbench they find, which is the fixture's own marker (`withProject`). Inference, not run: a `TMPDIR` inside a git work tree changes nothing this file writes. Elsewhere than darwin, `VAR_FOLDERS` falls back to `tmpdir()`, so the case's name overstates what it checks there. Not filed.

**Q2. Does any test still use the real HOME or the real `~/.fusion-tmp`?** No file in the range does. `fusion-tmp.test.ts` passes a scratch `HOME` on every `bin/fusion-tmp` run (`env(h)`), or none (`HOME: undefined`, which spawn drops). The real `HOME` reaches only the read-only `git rev-parse` of `assertNoEnclosingRepo`. `install.test.ts` sets `HOME` on every spawn that runs shipped code; the three spawns without `env` are `git archive`, `tar` and `test`. Outside the range, `store-name-migration.test.ts` still builds `FRESH_ENV` with `HOME: process.env.HOME`. That is the open issue `261028-2204-tests-that-run-shipped-blocks-still-pass-the-real-home.md`. Today `~/.fusion-tmp` does not exist on this machine, so the stray `98fc420e` directory that issue names is gone.

**Q3. Are the N1 coverage statements consistent?** Three of the four surfaces are.
- The `bin/fusion-tmp` header (`# The deny entries`, the new table) has every element: `Write`/`Edit`, the five Bash commands in default and acceptEdits, `python3 -c` not stopped, `bypassPermissions` not measured *here*, and the narrative's observed redirect under it.
- `README.md` (the launcher section) and `docs/upgrading-to-v13.md` (13.4.0, **Programs.**) match the dispatch's wording. Both shorten the `bypassPermissions` clause to "was not measured", which drops the one result on record for that mode. The upgrade note's **Sessions without the launcher** bullet still names only `Write` and `Edit`.
- `skills/check/SKILL.md` `## permissions` §1 is the outlier: "denied its `Write`, `Edit` and, by mode, Bash file commands". It names no mode, leaves out the script case, and this is the question whose default answer writes `bypassPermissions`. Finding C1.

**Q4. Are the release surfaces coherent, and does the help rotation follow the rule?** Yes on both.
- Version surfaces in this repository: `.claude-plugin/plugin.json` 13.4.0, the `install.sh` header pin `tags/v13.4.0`, and the `README.md` pin `tags/v13.4.0`. No `13.3.9` is left in shipped text except the help labels, where it belongs. The description is unchanged, so its marketplace twin needs no rewrite. `marketplace.json` and the tag are release acts outside the package (`## Where this work stops`).
- The help rotation (`README-agents.md` `## Releasing`, step 0): the new paragraph comes first, and the oldest, the 13.1.x one, is dropped. Three install-from paragraphs remain, which is what the "Older than that" sentence says. **The implementer's view on the lower labels is correct.** Each label's lower bound is 13.0.0, and its upper bound is the newest install that still needs the paragraph, which is the version before the oldest release it describes. Adding a paragraph changes neither bound. Only folding a patch into an existing paragraph moves one, as 13.3.9 did. "Coming from 13.0.0 to 13.3.8" (describes 13.3.0 to 13.3.9) and "Coming from 13.0.0 to 13.1.12" (describes 13.2.0) are still true. The new label, "13.0.0 to 13.3.9", follows the same scheme. Its steps match `docs/upgrading-to-v13.md` 13.4.0 steps 1 to 3.
- Not met: step 0's "state its result in the release commit or the session log". `928d3ac7` carries no `bin/fusion-review-coverage` result, and the session log is closed to writes. This is the open issue `261017-1747-releasing-step-0-names-the-closed-session-log-for-the-review-coverage-result-and-four-release-commits-omit-it.md` (another package's), so it is not refiled. Measured now: `--since v13.3.9` gives `commits=17`, `uncovered=6`, `verdict=uncovered`. Once this review lands, `628b1d9d`, `469e480e` and `928d3ac7` are covered. Three workbench-only commits remain uncovered: `a43c0829`, `ff8b56a2` and `5c7a1487`. The tag annotation is where that can still be stated.

**Q5. Did any baseline move, and was 2124 justified?** No growth-bound baseline, no head-room constant and no `dispatch-path.baseline` row changed. `surface-growth-bound.test.ts` and `fixtures/dispatch-path.baseline` are not in the range. `surface-growth.golden` is a regenerated record (skills 228 022 to 228 023 to 226 779, hook-test lines 26 552 to 26 591), and the bound test passes against it. The `BASELINE` assertion is exact equality, and 2124/382/12 passes. The 2123 to 2124 step is correctly attributed: the help paragraph's `$FUSION_SRC/docs/upgrading-to-v13.md` is new, and the dropped 13.1.x paragraph cited nothing. The 2122 to 2123 step is the right number with the wrong reason. Finding C2.

## Findings

**C1 (Medium). The consent question proposes the one mode where the Bash deny is not shown to hold.** `skills/check/SKILL.md` `## permissions` §1: "That setting is `bypassPermissions` … denied its `Write`, `Edit` and, by mode, Bash file commands". "Yes" is the default answer. The narrative's `## Measured before filing`, third bullet, records that under `bypassPermissions` and `--dangerously-skip-permissions` an `Edit` deny did not stop `echo hi > /tmp/…`. So a user who says yes ends up in the mode where the protection that sentence offers was seen to fail. `README.md` and the upgrade note's "not measured" leave that record out too, and neither names the launcher's `--yolo`. Fix: one clause per surface, stating what is on record for `bypassPermissions` (Write/Edit denied, a redirect passed, the rest unmeasured); the skills bound has 1 249 bytes of slack (`928d3ac7` message). Scope: the check skill, `README.md`, `docs/upgrading-to-v13.md`. Issue `261029-1255-the-permissions-question-recommends-bypasspermissions-and-hides-that-the-bash-deny-was-not-shown-there.md`.

**C2 (Low). The 2123 re-approval credits the path to the wrong token.** The comment on `BASELINE` in `hooks/lib/__tests__/reference-resolution-lint.test.ts` says the `bin/fusion-tmp` header's narrative citation is the +1. Counted with that file's `PLUGIN_PATH_RE` body at `5c7a1487` and `628b1d9d`: `bin/fusion-tmp` 3 to 3, `docs/upgrading-to-v13.md` 43 to 44, `skills/check/SKILL.md` 19 to 19. The narrative basename counts toward `records`, which the assertion does not compare. The new path is "the header of `bin/fusion-tmp`" in the upgrade note. Scope: the audit text only. Issue `261029-1255-the-2123-reference-re-approval-credits-the-path-to-the-wrong-citation.md`.

## Cross-cutting observations

- **The modes that were measured are not the mode the product recommends.** The 48 probes cover default and acceptEdits. fusion's permissions check defaults to `bypassPermissions`, and the launcher offers `--yolo`. Every deny claim should name the mode it holds in, against the mode a fusion project actually runs in. C1 is where that gap reaches a user's decision.
- **The header has the full statement, and the shorter copies drop the inconvenient half.** This is the third pass in a row where `bin/fusion-tmp`'s header is right and a copy elsewhere is not: A1 in the first review, N1 in the second, C1 here.
- **Hand-written re-approval reasons are not checked.** The number is pinned, its reason is not. "Attributed by reading the added citation" without a measurement got C2 wrong. The older entries that say "measured by overlaying" did not.

## Recommended sequencing

- **Before the 13.4.0 tag:** C1 (three short text edits, then `npm test` for the bounds). State the review-coverage result in the tag annotation, per the open `261017-1747` issue.
- **After the tag:** C2, together with the next re-approval, and the open Low issues of the two earlier reviews (`N3`, `N4`, and the six from `261028-2204`).
