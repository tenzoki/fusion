# Follow-up code review: the six pre-release fixes for ~/.fusion-tmp (13.4.0)

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `ff8b56a2..70414a29`
**Not-opened:** none
**Review domain:** code
**Work package:** 261027-2242-intermediate-files-in-project-tmp
**Cross-references:** 261028-2204-reviewer-intermediate-files-pre-release.md

Scope: every file changed in `70414a29`. Also the three files the earlier review did not open: `hooks/lib/__tests__/fixtures/rules-emission.golden`, `hooks/lib/__tests__/fixtures/surface-growth.golden` and `hooks/lib/__tests__/temp-paths.test.ts`. The two workbench files in the range, the event log and the decision record pair, were read for content only. The `${T:?…}` guard was run under zsh and bash. `fusion-tmp.test.ts` and `temp-paths.test.ts` were run under a launcher-style `TMPDIR`. The full suite was not rerun.

## Summary

All six findings are fixed in the code, and no fix breaks the paths the dispatch named. Two new findings matter for the tag. First, the F1 rewording now states "not shell redirects", but in this very session Bash `rm`, `mkdir`, a redirect and `touch` into the denied prefixes were refused. Second, `fusion-tmp.test.ts` goes red in any session the 13.4.0 launcher starts in this repository. Verdict: **revise**. Both are small.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 2 |
| Low | 2 |

## The six findings

| Finding | Fixed | Where |
|---|---|---|
| A1 (High), scratchpad denial undocumented | yes | `bin/fusion-tmp:66-72` (header paragraph), `README.md:87`, `docs/upgrading-to-v13.md:300-303`, `skills/check/SKILL.md:172` |
| A2 (Medium), deny written with `HOME` under a temp prefix | yes | `bin/fusion-tmp:197-206` (`under_temp` resolves its argument's real path), `:234-235`; test `fusion-tmp.test.ts:240-249`; deny-written cases moved to `homeOutside()` (`:71`, `:220`, `:235`) |
| F1 (Medium), the question and README-agents claim too much | yes, with N1 below | `skills/check/SKILL.md:172` ("Setup has also granted …"), `README-agents.md:364` (sandbox caveat) |
| C1 (Medium), mint notice swallowed | yes | `bin/fusion-tmp:130-132`, `install.sh:168-171`; tests `fusion-tmp.test.ts:113-123`, `codec/src/__tests__/install.test.ts:1170-1179` |
| E1 (Medium), unchecked `fusion-tmp path` | yes | `skills/archive/SKILL.md:247`, `:257`, `:262-263`, `:274`; "(stop if it fails)" at `agents/orchestrator.md:271`, `skills/cleanup/SKILL.md:59`, `skills/commit/SKILL.md:86` |
| B1 (Medium), selector and `grant` target different files | yes | `skills/check/SKILL.md:180` (target is the `settings=` of `check`), `:198`, `:200`; test `fusion-tmp.test.ts:185-186` pins that `check` names the main checkout's file |

The six issue records are still `open`. Closing them is the state-auditor's job.

## Regression checks the dispatch named

**`under_temp` (`bin/fusion-tmp:197-206`).** The loop climbs to the nearest existing ancestor, so it ends at `/` at the latest. It resolves symlinks with `pwd -P` and adds back the missing tail, so a `~/.fusion-tmp` symlinked into `/tmp` is caught. `under_temp "$(pwd)"` is equivalent to the old `pwd -P`. One edge case: if `cd` into the ancestor fails, `real` degrades to the tail alone, which matches no prefix, so the deny is written. Not filed, because it needs an ancestor without the execute bit.

**stderr filtering.** In both places, `2>&1 >&3 3>&-` is applied left to right. stderr goes to the grep pipe and stdout goes to fd 3, which is the `sed` input (fusion-tmp) or the substitution (launcher). Every pipeline ends in `|| true`, so neither `set -e` nor `pipefail` can abort. The grep exits 1 on no match, and its own `|| true` catches that. grep keeps fd 3 open only until fusion-identity closes its stderr, so nothing deadlocks. The launcher heredoc escapes every runtime `$` (`install.sh:171`). The line that is dropped and that the user needs: N3.

**`${T:?…}` (`skills/archive/SKILL.md:247`, `:262`).** With `T` empty, zsh exits 1 and bash exits 127. Both print `T: fusion-tmp path failed`, which contains the text `:257` tells the model to halt on. In both blocks the abort happens before `: > "$C.candidates"`, the survey and the move. The new `survey=absent` branch (`:263`) is also the normal no-candidate path, since `:247` removes `$C.survey` and `:254` writes it only when there are candidates. The table row at `:274` reads correctly for both.

**The selector's target (`skills/check/SKILL.md:180-200`).** It is now `settings_file`'s answer (`bin/fusion-tmp:160-179`), the same file `grant` writes, with the same exceptions. The removed step 5 (gitignore) is covered: `grant` appends the ignore line through `check-ignore` (`:245-248`), which also accepts `.claude/`. One trade-off: `check` exits 1 when `fusion-identity` prints no `CHECKOUT=`, so a project with an unset git identity can no longer have the permissions file written (`:180`, "A non-zero exit: report it, write nothing"). That project cannot file records either, so this is noted, not filed.

**Previously unopened files.** `rules-emission.golden` is unchanged in the range and consistent with the emitted set. `surface-growth.golden` records the movement (skills 227 652 to 228 022, agents 324 659 to 324 646, hook tests 26 521 to 26 552). No baseline or head-room constant moved. `temp-paths.test.ts` keeps HOME in scratch and restores `process.env` in `finally` (`:111-123`). Its `/var/folders` case is weakened by N2.

## New findings

**N1 (Medium). The deny entries reach Bash, and the new texts say they do not.** In this session, which has no launcher and runs under auto mode on Claude Code 2.1.312, with the repository's four deny entries in place:
- `rm -rf` on a scratchpad path under `/private/tmp` was "blocked by a deny rule";
- `mkdir -p`, `echo x >` and `touch /var/folders/…/T/<probe>` were each "denied". The deny rule versus the auto-mode classifier was not established for these three.

`skills/check/SKILL.md:172` ("not shell redirects") and `docs/upgrading-to-v13.md:297-298` ("not a shell redirect") rest on the narrative's measurement under `bypassPermissions` or `--dangerously-skip-permissions` alone (`261027-2242-intermediate-files-in-project-tmp.md`, line 13). So A1's consequence is wider than `Write`/`Edit`: a session without the launcher also loses Bash writes that name its scratchpad or its `TMPDIR`. Issue `261029-0647-the-deny-entries-reach-bash-path-checks-that-the-docs-say-they-do-not.md`.

**N2 (Medium). `fusion-tmp.test.ts` is red under the launcher's `TMPDIR`.** With `TMPDIR=$HOME/.fusion-tmp/<id>/`, which 13.4.0's launcher exports in this repository, 2 of 17 cases fail: `:147` from before the range, and the new `:240` from `70414a29`. The fixtures build under `tmpdir()` and assume it lies under a system temp prefix (`:16-20`, `:56`, `:67`). With the default `TMPDIR`, 17 of 17 pass. Issue `261029-0647-fusion-tmp-test-fails-when-tmpdir-is-the-launchers-fusion-tmp-directory.md`.

**N3 (Low). The reason for an empty `CHECKOUT=` is dropped twice.** The `bin/fusion-tmp:132` filter keeps only the mint lines. `install.sh:171` keeps only `fusion-identity:` lines, so fusion-tmp's own `die` line goes as well. A `fusion` start in a project with an unset `user.email` then exports nothing and says nothing. This runs against `rules/fusion-workbench-conventions.md` `## Filename Patterns` ("the helper's stderr is not discarded"). Issue `261029-0647-fusion-tmp-drops-the-reason-fusion-identity-gave-for-no-checkout.md`.

**N4 (Low). Deny entries already present are reported as skipped.** Both temp branches come before the `deny_missing` test (`bin/fusion-tmp:232-237`). The sandbox branch has `present-under-sandbox` for this case, and the temp branches have no equivalent. Issue `261029-0647-deny-entries-already-present-are-reported-as-skipped-under-a-temp-prefix.md`.

Not filed: the §1 question (`skills/check/SKILL.md:172`) says Setup "denied" without naming the skip cases (`skipped-under-temp`, `skipped-home-under-temp`, `skipped-tracked`). It is accurate in the common case.

## Cross-cutting observations

- **Measured in one permission mode, stated for all.** N1 is the second deny claim to rest on a `-p` measurement. The first, the scratchpad denial (A1), held. This one does not hold in auto mode. Claims about the deny's reach should name the mode they were measured in.
- **The release changes the environment its own tests run in.** N2 exists because the launcher now moves `TMPDIR` for this repository. Any test that relies on `tmpdir()` lying under `/var/folders` or `/tmp` has the same dependency. `temp-paths.test.ts:49` is the other one found.
- **Silenced stderr, the earlier review's pattern, is narrowed but not gone** (N3). The filters now let the success-side notice through and still drop the failure-side reason.

## Recommended sequencing

- **Before the 13.4.0 tag:** N1 (reword the two "not shell redirects" sentences to what was measured, or measure `default` mode first) and N2 (build the temp-prefix fixtures under `/tmp` explicitly). Both are small. N1 corrects a claim the release makes, and N2 keeps `npm test` green in the sessions the release creates.
- **After the tag:** N3, N4, and the six Low issues of the earlier review.
