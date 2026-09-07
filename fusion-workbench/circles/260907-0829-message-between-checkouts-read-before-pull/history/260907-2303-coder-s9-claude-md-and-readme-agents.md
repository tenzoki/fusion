# S9 — `CLAUDE.md` and `README-agents.md` learn `/fusion:news`

**Date:** 2026-09-07 23:03
**Agent:** coder
**Checkout:** 1d05b0e4
**Filed by:** Kai Stalmann <ks@qantr.com>
**Status:** Complete
**Plan:** `260907-1942_o_message-between-checkouts-read-before-pull.md` step 9
**Dependency:** step 8 (`skills/news/SKILL.md`), present in the work tree and read before editing

## What was done

Two files, three edit sites, no other file touched.

`CLAUDE.md`:
- `## What this is`, the `skills/<name>/SKILL.md` bullet: `/fusion:news` added to the situational list, with one clause saying what it does (reads what another checkout left, out of a fetched ref and before any pull, through `bin/fusion-forum`). This is the site the enumeration gate reads: it scans every `/fusion:<name>` token in the whole file and asserts both directions against `skills/*/`.
- The `skills/<name>/SKILL.md` Layout row: its closing clause said "the rest are situational" and now names them — `commit`, `direct`, `help`, `memo`, `migrate`, `news`, `next`. The row already named the administrative three and the pipeline three, so enumerating the third set is symmetric with what the row already carried rather than a new kind of inventory.

`README-agents.md`:
- One table row in the shape the gate's regular expression parses, `` | `/fusion:news` | `skills/news/SKILL.md` | <description> | ``, placed between the `/fusion:direct` and `/fusion:curate` rows. The description was written from `skills/news/SKILL.md` itself, not assumed: fetch, read the new entries out of the fetched ref without touching the working tree, render each with its writer resolved to a name, advance the read mark on render, then offer `git pull --ff-only` once — and the property the body says aloud, that it reads a store and holds no thread.
- The sentence above the table that lists the situational skills gained `news`.

Neither file is a bounded surface, so neither spends a growth budget.

## Verification

`cd hooks && npx vitest run lib/__tests__/derivable-enumerations-lint.test.ts`

- **Before:** exit 1 — 2 tests failed of 20. `CLAUDE.md's skill list covers every skill directory, and cites no phantom skill` reported `skills/news/ exists but CLAUDE.md never mentions /fusion:news`; `README-agents' skill table has exactly one row per skill directory` reported the parsed row set missing `news`.
- **After:** exit 0 — 20 passed.

The gate was red at the start of this task because step 8 had landed `skills/news/` and neither doc named it; this change is what made it green.

## The known-red gate, not repaired

`reference-resolution-lint.test.ts` is red on its pinned token counts and stays that way: it is plan step 12's to re-approve, and no baseline was edited here.

- Working tree with this task's edits: `paths: 1683, anchors: 231`.
- Same tree with only this task's three edit sites reverted (measured by writing the pre-edit text back, running the gate, then restoring — not read off a diff): `paths: 1680, anchors: 231`.
- **This task's own contribution: +3 paths, +0 anchors.** The three are the plugin-file paths the new text names: `skills/news/SKILL.md` in the README row's file column, and `bin/fusion-forum` in the `CLAUDE.md` clause and in the README row's description.

Committed baseline is `paths: 1646, anchors: 227`, so 34 of the 37 paths and all 4 anchors of the standing drift are the four earlier tasks'.

## Notes

No commit was made; the orchestrator commits. No whole-tree git command was run.
