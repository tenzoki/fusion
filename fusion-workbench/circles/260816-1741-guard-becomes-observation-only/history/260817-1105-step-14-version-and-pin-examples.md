# Step 14 — the version and the pin examples

**Agent:** coder
**Date:** 2026-08-17
**Circle:** `260816-1741-guard-becomes-observation-only`
**Plan:** `260816-1915_*_the-compliance-guard-becomes-observation-only.md` step 14
**Status:** Complete
**Base:** `e489133`

## What changed

Three files, three changes.

**`.claude-plugin/plugin.json` — version `9.0.0` to `10.0.0`.** A major bump because the release
removes a file every consuming project has at its root. `docs/upgrading-to-v10.md:16-17` already
names `v10.0.0` and the `FUSION_REF=tags/v10.0.0` pin, and the string written here matches it
exactly.

**`install.sh:27` and `README.md:26` — both pin examples to `v10.0.0`.** These are two of the four
version surfaces `CLAUDE.md`'s release section names, and the two that drift, because neither is
read by anything that would fail on a stale value.

**`.claude-plugin/plugin.json` — the `description`'s guard clause.** It read "with a compliance
guard", which implies a mechanism that decides something. Nothing in the hook decides anything
(`hooks/guard.ts:1-21`). The clause now names the hook's two products, the write trace and the
configuration advisory, and says it decides nothing. The rest of the sentence is unchanged: the
agent count, the domain parameterisation, decision-record tracking, the curator, the monitor and
the `/fusion:help` pointer all carry over word for word.

## The exact new `description` string, for the marketplace entry

The fifth surface `CLAUDE.md:111` names is the pair of prose descriptions: this manifest's, and the
fusion entry's in `tenzoki/claude-plugins`'s `marketplace.json`. That second repository is outside
this tree and this Circle stops at the work tree, so the string is recorded here to be carried
across by hand at the release gate. It is the same failure `CLAUDE.md` says v9.0.0 committed in the
other direction, the marketplace copy updated and the manifest left behind.

```
Multi-domain AI agent orchestration framework. 15 project-agnostic specialized agents (three of them parameterised by domain: code or data) with an observation-only PreToolUse hook that decides nothing and writes a trace of every write-tool call plus an advisory when the project's configuration is broken or retired, decision-record tracking, a curator that reconciles decision records, rule files and CLAUDE.md against the project's recorded history, and a real-time browser-based monitor with session-scoped ETA estimation. /fusion:help inside Claude Code for self-explainer.
```

## Verification

| Command | Exit |
|---|---|
| `claude plugin validate .` | 0 — "Validation passed with warnings" |
| `cd hooks && npm test` | 0 — 35 files, 653 tests |

The one validator warning is the standing `CLAUDE.md`-at-the-plugin-root notice, unrelated to this
change and present before it. Both lint tests the dispatch flagged as version-sensitive stayed
green: `turn-budget-lint.test.ts` and `reference-resolution-lint.test.ts`.

## The sweep, and what it found

`grep -rn "9\.0\.0"` over the tree, excluding `fusion-workbench/` and `docs/upgrading-to-v9.md`,
returns exactly one hit: `CLAUDE.md:111`, the release section recounting what the v9.0.0 release
did to the description pair. That is history and is correct as written. A wider sweep for `v9`
returns only migration prose in `README.md`, `skills/help/SKILL.md`, `CLAUDE.md:50`,
`docs/upgrading-to-v10.md` and a comment in `reference-resolution-lint.test.ts`, all of it
deliberately naming the previous release. No `9.0.0` sits in `hooks/dist/`, in `hooks/config.json`
or in any `package.json` — `hooks/package.json` carries no `version` field at all.

So `CLAUDE.md`'s list of four version surfaces is complete for this release.

**One thing the sweep turned up that is not a version string.** `README.md:67` still says
`/fusion:setup` "seeds `fusion-guard.json` at the **project root** (the per-project guard
configuration — git-tracked, so commit it)". Setup seeds `fusion.json`
(`skills/setup/SKILL.md:185`, `templates/` holds `fusion.json` alone), and there is no per-project
guard configuration left to seed. The line sits 37 lines above `README.md:104`, which states the
current shape correctly, and 44 above `:111`, which tells the reader the old file is retired and to
delete it. It is invisible to `reference-resolution-lint`, because a bare filename with no
directory is not a path — the same limit issue `260816-2321_*_step-11s-line-scoped-changes-text-misses-two-stale-lines-in-files-it-already-opens.md` records in two other places.

Filed as
`260817-1105_*_readmes-setup-paragraph-still-says-setup-seeds-the-retired-fusion-guard-json.md`
rather than fixed in passing: it is outside this step's task, even though the file is in this step's
Files list.

## Not done, deliberately

No tag, no push, no marketplace edit. The plan's `## Where this Circle stops` puts all three behind
a user gate after step 15 and after the review pass, on this project's own precedent
(`260810-1618_*_a-release-was-tagged-and-pushed-while-its-own-review-pass-was-still-running.md`).
Nothing was committed; the orchestrator commits.
