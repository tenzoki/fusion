# Release v8.2.0 — the two FUSION_REF pin examples

**Status:** Complete
**Agent:** `coder`
**Dispatched by:** orchestrator, session `260814-2225-orchestrator-release`
**Date:** 2026-08-14 22:50

---

## What the task was

Refresh the two version surfaces `CLAUDE.md` `## Release process` names as this repository's own,
out of the four it lists. `.claude-plugin/plugin.json` already read `8.2.0` and the marketplace
entry lives in another repository, so only the two pin examples were in scope.

## What changed

| File | Line | Before | After |
|---|---|---|---|
| `install.sh` | 27 | `— e.g. FUSION_REF=tags/v8.1.0 for the current release.` | `…tags/v8.2.0…` |
| `README.md` | 26 | `` `FUSION_REF=tags/v8.1.0` to pin a release `` | `…tags/v8.2.0…` |

Both are header/overview examples of a pin a user copies. Nothing else in either file moved.

## The sweep for missed surfaces

The dispatch asked for an independent sweep rather than trust of the dispatching grep, because these
two examples are on the release checklist precisely for having drifted unnoticed for months. The
search ran over every git-tracked file except `fusion-workbench/`, in four passes: any `8.x.y`
string, any `v8.x` string, the phrases *current release* / *latest release* / *current version*, and
any badge or shields.io reference.

**Nothing else needs changing.** What the sweep found, and why each is correct as it stands:

- `CLAUDE.md:33` — "Since v8.1.0 the signature is `fusion-paths <name> [<circle-dir>]`". Historical:
  it dates a signature change. Correct, and the dispatch already ruled it out.
- `CLAUDE.md:56` — "`backlog/` since v8.1.0 holds ideas that are not yet units of work". Also
  historical, dating when the backlog store gained that meaning. **This one was not in the
  dispatching agent's three-occurrence count**, which is the reason the sweep was asked for; it
  needs no change for the same reason as the row above.
- `CLAUDE.md:16` — "`curator` (added v8.2.0)". Historical, and already naming this release.
- `CLAUDE.md:90`, `CLAUDE.md:111`, `install.sh:25-26` — all use the placeholder form `v<version>`,
  which never goes stale.
- `install.sh:71` and `skills/setup/SKILL.md:94-97` — both *derive* the version by parsing
  `.claude-plugin/plugin.json` at run time. Self-updating, so no release step touches them.
- `bin/fusion-plane:363` and `hooks/lib/__tests__/fusion-plane.test.ts:1784` — `8.3.0` and `8.7.1`
  are **curl** versions, not fusion's.
- `hooks/package.json` carries no `version` field, and no test pins a plugin version, so the bump
  in `plugin.json` needed no companion edit.
- There is no CHANGELOG, no release-notes file, and no version badge anywhere in the tree.

So the four-surface count in `CLAUDE.md` `## Release process` is still exactly right: no fifth
surface names a current fusion version.

## Verification

Three full runs of `cd hooks && npm test`, and the middle one is the interesting record.

| Run | Result | Note |
|---|---|---|
| 1 | 49/49 files, 1030/1030 tests green — **exit code not captured** | The invocation ended `echo "EXIT=${PIPESTATUS[0]}"`, a bash idiom; this shell is zsh, where the array is `$pipestatus`. The counts were green but no exit code was read, so this run proves nothing on its own. |
| 2 | **exit 1** — 1 failed file, `reference-resolution-lint.test.ts` | Not the known flakiness. Cause below. |
| 3 | **exit 0** — 49/49 files, 1030/1030 tests | After the repair below. |

Run 2's failure was **not** one of the non-deterministic lock/halt-reaping failures recorded in
`shared/issues/260814-2118_o_the-hooks-suite-fails-differently-on-repeated-full-runs-and-does-so-on-clean-head.md`,
and it would have been wrong to re-run past it. It was the reference-resolution lint reporting six
dangling references, all of them `CLAUDE.md` naming `install.sh` — because **`install.sh` had been
deleted from the working tree**, mid-task, after run 1 had already passed the same lint.

## The deletion, and what is and is not established about it

**Verified:** `git status` reported ` D install.sh`, and `ls` confirmed the file absent. My own
edit to it went with it. `README.md` kept its modification, so this was not a revert of the working
tree.

**Ruled out by measurement, not by argument:**

- Not a git operation — `git stash list` was empty and the reflog showed only ordinary commits.
  A stash or checkout would in any case have taken the `README.md` edit with it, and did not.
- Not the test suite. After restoring the file I ran the full suite (run 3) with a polling watcher
  on `install.sh` for the whole 90 seconds. The watcher never fired and the file survived, at its
  original 7313 bytes with the `+x` bit intact. Reading the sources agrees: every `rmSync` and
  `unlinkSync` in `hooks/lib/__tests__/` is scoped to a `mkdtemp` root, and the only two files
  mentioning `install.sh` at all read it or merely name it in a comment.

**Not established: what did delete it.** `ps` showed three older `claude --plugin-dir ~/.fusion`
sessions alive against this same project alongside this one, which is the concurrency hazard
`CLAUDE.md` already carries as an advisory ("Single orchestrator per project" — fusion has no
lock). That is the obvious suspect and it is **speculation**: nothing was measured that ties the
deletion to any of them, and I did not narrow it further.

**Repair:** `git checkout -- install.sh`, then the line-27 substitution re-applied. The file is
back at 7313 bytes with its executable bit, which matters — `install.sh` shipping without `+x` is
one of the invariants the tarball install depends on.

Worth a defect record if the orchestrator judges it so; I did not file one, because a record whose
whole content is "a tracked file vanished once and the cause is unknown" is weak, and the call
belongs upstream of me.

## Notes

- `fusion-workbench/tasklist.md` was **not** updated. It was generated on 260811 as a
  defect-cleanup queue and carries no entry for this release dispatch.
- Nothing was committed. The orchestrator commits.
