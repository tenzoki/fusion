# Review: the release candidate `468d8e87` for 13.0.0, the fixes to R-1, R-2 and R-3

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `5f7398c9..468d8e87`
**Not-opened:** `fusion-workbench/orchestrator-events.jsonl`

**Review domain:** code
**Work-item:** 260928-1338-json-control-data-and-markdown-artefacts

What the Not-opened line covers. The range has two commits. `ec4ba35f` changes only `fusion-workbench/`: the previous review, its evidence record, the three issues it filed and the event log. I opened the review and the three issue narratives as input. I did not open their three control files or the evidence record, which are workbench content; they are named in words because a store-prefixed path on the Not-opened line is a citation the lint refuses. `468d8e87` changes five shipped files and the event log. All five shipped files were opened and their whole diff was read.

## Summary

Verdict **revise**, for L-1 alone, with no release blocker; I would ship 13.0.0 at `468d8e87`. All three findings of `261009-2223-reviewer-docs-only-release-candidate-5f7398c9.md` are fixed as their acceptance asked, every changed sentence is true of the code, and the dist diff is comments only. One Low gap is filed: the leftover procedure has no branch for a leftover that has no copy under the new name.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 1 (L-1) |

## What was verified true

- **The dist diff is comments only.** `git diff 5f7398c9 468d8e87 -- hooks/dist` has one hunk per file. Every added or removed line starts with ` *`, inside the leading `/** … */` block, and both hunks match the `hooks/migrate.ts` hunk. The work tree's `hooks/` equals `468d8e87`.
- **`codec/` is untouched.** `git diff --stat 5f7398c9 468d8e87 -- codec` is empty.
- **R-1, the `## The git pass` header sentence.** `repoTop` (`hooks/migrate.ts`) walks up to the first `.git` name, returns `null` without git when there is none, and otherwise takes `git -C <wb> rev-parse --show-toplevel` as the answer. `git()` throws `Stop(EXIT.fault)`, which is 3, on any non-zero status. Re-measured with git 2.53.0 and that exact call:

  | Setup | git's answer | Run |
  |---|---|---|
  | empty `.git` directory in `proj/`, `proj/` inside a committed repository | exit 0, the enclosing toplevel | proceeds over the enclosing repository |
  | the same `.git` directory holding a junk `HEAD`, inside that repository | exit 0, the enclosing toplevel | proceeds |
  | empty `.git` file, inside a repository | exit 128, invalid gitfile format | exit 3 |
  | `.git` file reading `hello`, inside a repository | exit 128, invalid gitfile format | exit 3 |
  | empty `.git` directory, no repository above | exit 128, not a git repository | exit 3 |

  The new sentence names exactly these cases.
- **R-2, git as a prerequisite.** `README-hooks.md`'s roster row and the guide's requirements paragraph now match `bin/fusion-migrate`'s header ("Plugin and Node only outside a git repository. Inside one (a `.git` entry at or above the workbench) git is required too", and exit 3 "Inside a git repository, a git that is missing or refuses … is an exit 3 naming the call and the reason"). The `Stop` message is `git <args> over <cwd> failed: <why>`, so "naming the call and the reason" holds. A grep of `README.md`, `README-agents.md`, `README-hooks.md`, `docs/`, `skills/`, `agents/`, `rules/` and `bin/` for "Node only", "empty or non-git" and "will not empty" finds no stale copy. The skill's own copy stays with the deferred `261009-2040-…`.
- **R-3, the store names and the refusal.** `V11_STORE_NAMES` in `hooks/lib/stores.ts` is `circles`, `planning`, `consult`. `legacyNames` in `hooks/migrate.ts` tests each at the top, under `shared/` and as `work-packages/<dir>/<name>`. `preconditions` throws `Stop(EXIT.precondition)`, which is 5, with "the v11 store names stand (<each path>)". The guide's "at the top, under `shared/` or in a package" and "Its refusal names each one" are both true; it names each standing store directory, not each file, and the guide then has the user list the files with `find`.
- **The procedure is safe, and it works.** In a scratch tree I ran Step 4's block from `skills/migrate/SKILL.md` verbatim (plain mode) over four collisions: `circles/pkgA/.DS_Store`, a differing `circles/pkgA/issues/x.md`, an identical `shared/planning/p.md`, and a differing `circles/pkgA/planning/q.md`. The pass left `circles/`, `shared/planning/` and `work-packages/pkgA/planning/` standing; the last is a container-level `planning/` collision that the container fold carried under `work-packages/`, and its copy under the new name is `work-packages/pkgA/plans/q.md`. Following the paragraph: `.DS_Store` deleted, `cmp` identical then delete, `cmp` differ then `mv` old over new, then `rmdir` innermost first (`circles/pkgA/issues`, `circles/pkgA`, `circles`, `shared/planning`, `work-packages/pkgA/planning`). Every `rmdir` succeeded, the kept files hold the old content, and a re-check of the nine `legacyNames` paths found none standing.
  - No step deletes a record without the user's `cmp` and choice. `mv` over the new copy is a file-on-file replace because `find -type f` lists only files. Inside git the replaced content stays in history when it was tracked. In plain mode the replaced or deleted copy is gone, and that is the user's stated choice.

## Findings

### L-1, Low: no branch for a leftover with no copy under the new name

`docs/upgrading-to-v13.md` `## Migrating your workbench`, "If an old store name will not empty": "The store rename never overwrites, so a file that already exists under the new name stays under the old one … Compare any other leftover with its copy under the new name … using `cmp`."

The rename pass also leaves files with no copy under the new name (`skills/migrate/SKILL.md` `## Step 4 — Apply`):

- "Tracked entries only" (`TRACKED_ONLY=1`): `LEFT: $e is untracked and stays.` An untracked package stays whole as `circles/pkgB/`, and `work-packages/pkgB/` does not exist.
- A failed move (`ERROR: $1 -> $2 failed.`) and an interrupted pass.

Each leaves `circles/` or a `planning/` standing, so `run` exits 5 and the user reaches this paragraph. Then `cmp` has nothing to compare, `mv` over the new copy fails on a missing parent, and `rmdir` fails on the directory. Nothing is lost; the user is stuck. The fix is one sentence: such a file is no collision, and re-running `/fusion:migrate` with "Convert" moves it. Filed: `261009-2236-the-upgrade-guides-leftover-procedure-has-no-branch-for-a-leftover-with-no-copy-under-the-new-name.md`.

## Cross-cutting observations

- **Both copies may hold content the user wants.** The paragraph offers keep-old or keep-new. A user whose two copies diverged (`cmp` differs) and who wants parts of both should merge by hand before deleting. Nothing says so, and plain `cmp` does not show which copy is newer. Not filed: the text forbids nothing, and choosing one copy is not something a step does without the user.
- **A top-level `planning/` or `consult/`, and a container's `consult/`**, are refused by `legacyNames`, but Step 4 never renames them. Such a directory is not a collision leftover, and the guide's "its copy under the new name" has no target for it. I did not establish that any v12 workbench carries one; pre-v4 layouts are refused before this point. Not filed.
- **Symlinks** under an old store name are left by a collision like files, but `find -type f` does not list them, so `rmdir` fails with no named cause. Not measured; not filed.
- **The R-1 to R-3 pattern did not recur.** The previous review's cross-cutting note asked for a grep of the old wording across the shipped tree. This time it comes back clean.

## Recommended sequencing

1. Nothing blocks 13.0.0. Ship at `468d8e87`.
2. L-1 is one sentence in the upgrade guide. Fix it in the first point release, or drop the paragraph with the fix for the deferred `261009-2148-the-rename-pass-cannot-drain-a-circles-store-whose-only-entry-is-a-colliding-ds-store-and-the-json-run-refuses-on-it.md`.

Verification: `git diff 5f7398c9 468d8e87 -- README-hooks.md docs hooks` read in full; the dist diff's changed lines all ` *`; `git diff --stat 5f7398c9 468d8e87 -- codec` empty; five `rev-parse --show-toplevel` setups in a scratch tree, git 2.53.0; Step 4's block run verbatim on four nested collisions, the guide's procedure followed to an empty `legacyNames`; the grep for the three stale phrases over the shipped docs, skills, agents, rules and `bin/`.
