# Plugin manifest description brought to v9

**Status:** Complete
**Agent:** ontocoder
**Domain:** data
**Date:** 2026-08-16
**Source record:** `260816-0141_*_the-plugin-manifests-own-description-was-not-brought-to-v9-when-the-marketplace-entry-was.md`

## What changed

One file, one line: the `description` value in `.claude-plugin/plugin.json`. It now reads
byte-identical to the fusion entry's `description` in the marketplace repository, which
commit `25af51d` had already rewritten for v9 while this manifest was left behind.

Before:

> Multi-domain AI agent orchestration framework. Project-agnostic specialized agents (3
> parameterised by domain — code/data) with a compliance guard, decision-record tracking, a
> real-time browser-based monitor with session-scoped ETA estimation. /fusion:help inside
> Claude Code for self-explainer.

After:

> Multi-domain AI agent orchestration framework. 15 project-agnostic specialized agents
> (three of them parameterised by domain: code or data) with a compliance guard,
> decision-record tracking, a curator that reconciles decision records, rule files and
> CLAUDE.md against the project's recorded history, and a real-time browser-based monitor
> with session-scoped ETA estimation. /fusion:help inside Claude Code for self-explainer.

## Claim-by-claim verification

Every field of the manifest was checked against ground truth in the tree, not against the
old string. Nothing was removed by recognition.

| Claim | Checked against | Verdict |
|---|---|---|
| 15 specialized agents | `ls agents/` — 15 `.md` files; `README.md:3` says "15 specialized agents" | true, and newly stated (the old string carried no count) |
| three parameterised by domain, `code` \| `data` | `README-agents.md` `## Dispatch parameters` — `taskplanner`, `reconciler`, `playmaker` read `**Domain:**`; the same section states that `planner` is not one of them | true |
| compliance guard | `hooks/guard.ts`, `hooks/dist/guard.js` present; CLAUDE.md `## What this is` | true |
| decision-record tracking | `rules/fusion-workbench-conventions.md` decision vocabulary; `fusion-workbench/shared/decisions/` | true |
| curator reconciling decision records, rule files and CLAUDE.md against recorded history | `agents/curator.md` frontmatter `description` | true, and newly stated (curator arrived at v8.2.0 and was never in this string) |
| real-time browser-based monitor, session-scoped ETA | `bin/monitor` `computeETA()` — pairs `task_start`/`task_done`, rejects orphans predating the latest `session_start`, drains on `session_end` | true, and the "session-scoped" qualifier is exact |
| `/fusion:help` | `skills/help/` exists | true |
| `version` `9.0.0` | matches `marketplace.json`, the `v9.0.0` tag, and the `install.sh` / `README.md` pins | already correct, untouched |
| `repository` `https://github.com/tenzoki/fusion` | `git remote -v` → `git@github.com:tenzoki/fusion.git` | true |
| `author.name` `Kai / qantr GmbH` | matches the marketplace entry | true |
| `license` `MIT` | matches the marketplace entry; **no `LICENSE` file exists in the tree and `README.md` states no licence** | consistent across both manifests but unverifiable from this repository — left as found, noted below |

**No prose field described a mechanism v9 removed.** Each of the ten removals was searched
for in the string and none appeared: the two dropped domain values, the investigator agent,
churn detection, the work-queue mirror, the protected-path guard half, the session-state
counters, the persisted task list, the git branch policy, the two stash skills, the Plane
mirror. The record itself had already reached that finding ("Nothing in it is **false** …
It is incomplete rather than wrong"), and re-verification confirmed it. What was fixed is
the incompleteness the record names as its fix direction 1: two shipped descriptions of the
same plugin said different things, and the one fewer users see was the stale one.

## Verification

- `python3 -c "import json; json.load(...)"` — exit 0; keys unchanged
  (`author`, `description`, `license`, `name`, `repository`, `version`).
- `git diff` — one line changed, one added, one removed. Indentation, key order and the
  surrounding bytes are untouched.
- `python3` string comparison against the marketplace entry — `description` identical,
  `version` identical.
- `claude plugin validate .` — **passed with warnings**, exit 0. The one warning is the
  pre-existing note that a plugin-root `CLAUDE.md` is not loaded as project context.
- `cd hooks && npm test` — exit 1, 761 passed, 3 failed, **none of them this change**
  (see below).

## The three test failures are not this change

| Failing gate | What moved | Whose |
|---|---|---|
| `surface-growth-bound.test.ts` | `agents/orchestrator.md` 144820 → 144832 | another task's edit |
| `rules-emission-golden.test.ts` | `rules/fusion-workbench-conventions.md` 55113 → 55385 | another task's edit |
| `reference-resolution-lint.test.ts` | `paths` 1122 → 1121 | another task's edit |

`git status` shows `agents/orchestrator.md`, `agents/playmaker.md`,
`rules/fusion-workbench-conventions.md`, `bin/monitor` and the golden fixture itself
modified concurrently. Each failure was traced to a file this task did not touch, and the
attribution was made structurally rather than by assumption: `surface()` in
`reference-resolution-lint.test.ts:142-190` enumerates `rules/`, `agents/`, `docs/`,
`templates/`, `skills/*/SKILL.md`, root `README*.md` and `CLAUDE.md`, shebang scripts under
`bin/`, `install.sh`, and the `.ts` files under `hooks/` — `.claude-plugin/plugin.json` is
in none of those sets. `surface-growth-bound.test.ts` names no manifest path at all. The
only test in the suite that reads this manifest is
`rules-emission-golden.test.ts:1053-1056`, which reads the `version` field, which this
change did not touch, and which **passed**.

The golden fixture was not regenerated, per the dispatch.

## Not done, and why

- **The record's fix direction 2** — a line in CLAUDE.md `## Release process` naming the two
  descriptions as a pair that moves together, beside the four version surfaces. That is the
  durable half of the fix and it is outside this task's allowed file set
  (`.claude-plugin/plugin.json` only). Without it the two descriptions can drift again at
  the next release, exactly as they did at this one.
- **The record was not closed.** It is still `_o_` and its filename was not touched, for the
  same scope reason.
- **The `license` field** was left as found. No `LICENSE` file exists in the repository and
  no README states a licence, so the `MIT` declaration is consistent with the marketplace
  entry but unsupported by anything in the tree. Changing or removing a licence declaration
  is not an ontocoder call.
