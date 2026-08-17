# The README's Setup paragraph names `fusion.json`

**Agent:** coder
**Date:** 2026-08-17
**Circle:** `circles/260816-1741-guard-becomes-observation-only`
**Issue:** `circles/260816-1741-guard-becomes-observation-only/issues/260817-1105_c_readmes-setup-paragraph-still-says-setup-seeds-the-retired-fusion-guard-json.md`
**Status:** Complete
**Base:** `a7f70b9`

## What changed

One file, one clause. `README.md:67`, the paragraph a new reader meets under `## Setup`, said
`/fusion:setup` "seeds `fusion-guard.json` at the **project root** (the per-project guard
configuration — git-tracked, so commit it)". It now reads "seeds `fusion.json` at the **project
root** (your project's own fusion settings, git-tracked, so commit it)".

Both halves of the old clause were false. Setup seeds `fusion.json` from `templates/fusion.json`
(`skills/setup/SKILL.md:185`; `ls templates/` returns that one file), and there is no per-project
guard configuration to seed at all — the one live leaf is `orchestrator.maxTurns`. The wording is
lifted from `README.md:104`, which states the current shape correctly 37 lines below, so the
document no longer contradicts itself on its own first screen.

The git-tracked instruction stayed, because the file still belongs in version control and
`templates/fusion.json`'s own `_gitTracked` note still argues for it. So did the rest of the
sentence.

## What was checked and left alone

The dispatch asked for the paragraph and its neighbours rather than the named clause alone, because
`reference-resolution-lint` cannot see a bare filename and any sibling naming a retired file would
be equally invisible. Four further claims were read against their sources:

- `.guard-state/` is still pre-created by Setup — `skills/setup/SKILL.md:82`, and `:89` states that
  it is the only root-anchored surface pre-created there.
- The monitor binary is still re-copied on every Setup — `skills/setup/SKILL.md:124`.
- The four stylometric voice profiles are still seeded — `skills/setup/SKILL.md:159-162`.
- `README.md:5` points at `docs/working-model.md` for "the Circle flow, the gates, and the guard".
  That document still carries a guard section describing the observation-only hook layer
  (`docs/working-model.md:118-125`), so the pointer resolves to live text.

`README.md:69` ("hooks no-op silently" without a workbench marker) was read as part of the same
pass. `hooks/tracker.ts:300`, `:380` return early on a null workbench root, and
`skills/setup/SKILL.md:38` states the same contract, so nothing there is stale. No second fix was
needed.

## Verification

`cd hooks && npm test` — exit 0, 35 files, 653 tests. The counts the dispatch pinned did not move,
so no baseline needed re-approving. Nothing was committed; the tree is a release candidate and the
tag and the push are gated elsewhere.
