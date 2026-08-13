# Coder — CLAUDE.md: the `bin/` inventory, the deleted count, the playmaker clause, the byte claim

**Status:** Complete
**Date:** 260813-1915
**Agent:** coder
**Circle:** `circles/260813-0910-documentation-matches-shipped-plugin`
**Plan:** `planning/260813-1820_o_documentation-matches-shipped-plugin.md`, step 2 (now `[DONE]`)
**Files changed:** `CLAUDE.md` only, four edits.

## What each correction was checked against

The plan's method constraint binds this step: a documentation defect is confirmed by reading
both sides. Each edit below names the artifact its correction was read against. No edit rests
on a match count.

### (a) Five missing `bin/` Layout rows

**Both sides read.** Ground truth `ls bin/` — fifteen entries. The Layout table carried ten
rows in the form `` | `bin/<name>` | … | `` (`monitor`, `fusion-rules`, `fusion-paths`,
`fusion-workbench-root`, `fusion-plugin-cwd`, `fusion-source-root`, `fusion-churn-rank`,
`fusion-turn-budget`, `fusion-session-mark`, `fusion-plane`). The five absent were exactly the
set the plan names. Rows added; the table now holds fifteen, matching `ls bin/`.

Each row points at an authoring home rather than restating one:

| Row | Read against | Authoring home cited |
|---|---|---|
| `bin/fusion-commit-lock` | the script's own header (`:1-56`) | `rules/workbench-stash-and-lock.md` `### Mechanism` / `### Helper` / `### Who acquires` |
| `bin/fusion-count-sources` | the script's own header (`:1-60`) | its own header — see below |
| `bin/fusion-state-drift` | the script's own header (`:1-28`) | `hooks/lib/state-drift.ts`, `README-hooks.md:177` |
| `bin/fusion-staging-drift` | the script's own header (`:1-36`) | `hooks/lib/staging-drift.ts`, `README-hooks.md:178` |
| `bin/fusion-review-coverage` | the script's own header (`:1-38`) | `hooks/lib/review-coverage.ts`, `README-hooks.md:179` |

**`fusion-count-sources` confirmed undocumented, and the claim was checked rather than
assumed.** `grep -rn "fusion-count-sources" --include='*.md'` outside `fusion-workbench/`
returns nothing; inside the workbench it appears only in records (decisions `260809-1731`,
`260810-0921`, `260810-1010`, `260810-1544`, the tasklist, three history files) and in this
Circle's own plan. No shipped markdown describes it. Its row is therefore written from the
header itself and says so, carrying the four things a reader needs: what it counts and for
whom, the `KEY=value` output shape, the one-mechanism-no-fallback rule (`git ls-files`), and
why an absent count is `unavailable` and never `0`.

The row shape `` | `bin/<name>` | … | `` is preserved exactly — step 3's parser keys on it.

### (b) The tracked-file count is deleted, not corrected

`— 612 files since e8988d9 (260801) —` is gone from the `fusion-workbench/` row. No number
replaces it and no gate was added, per the Directive point that supersedes the survey's step
A3. The surrounding sentence still carries its point: the workbench is git-tracked in this
repository, and that tracked state is what
`shared/issues/260717-0030_*_git-stash-include-untracked-can-sweep-the-stash-directory.md`
reasoned from.

The deletion is made legible so the next reader does not restore it. One added sentence names
what stood there, when it went, and why it was deleted rather than re-measured: a hand-written
inventory of a directory every session writes to is wrong the day after it is written.

### (c) The playmaker parenthetical — first clause corrected, second clause verified and kept

**Read against `agents/playmaker.md` at HEAD and `skills/memo/SKILL.md`.**

The old clause "the playmaker consolidates and ranks them, no agent files one" understated the
agent on its first half. `agents/playmaker.md:60` (Scope, write targets) and `:108-130`
(Step 2b) describe a **maintenance** mandate, not consolidation-and-ranking: the `_o_`↔`_p_`
rename is autonomous and is the only autonomous backlog write, while splitting, merging,
closing and deferring are four operations, each needing a user confirmation the run holds for
that operation (`:194`, `## Two mandates, by dispatch path`, binding record
`260813-0858_*_does-a-non-interactive-playmaker-run-perform-the-confirm-gated-backlog-operations.md`).

**The second clause survives verification and stays.** Three readings support it:
`agents/playmaker.md:66` forbids originating an entry outright ("Filing is the user's act, by
hand or through `/fusion:memo`"); `rules/fusion-workbench-conventions.md` `## Backlog entries`
states the bound in its own words ("No agent files a backlog entry … The user files, by hand or
through `/fusion:memo`; the playmaker maintains; nobody else writes here"); and
`skills/memo/SKILL.md:37,110,130-132` is the user surface that creates the file. The one other
agent that writes into the store, the shaper, renames `_o_`/`_p_` to `_c_` and appends
`Promoted:` when an entry becomes a Circle (`agents/shaper.md:86-92`) — a promotion, not a
filing. `bin/fusion-paths shaper` emits no `OUT_BACKLOG` key. The clause is now spelled out as
"no agent originates an entry" and cites the conventions file as the authoring home for the
filing/maintenance line.

### (d) The always-on rule budget — re-measured, then rewritten as a stamped history

**Re-measured with `wc -c` over the six paths `bin/fusion-rules coder` emits:**

```
    3513 rules/agent-setup.md
   51920 rules/fusion-workbench-conventions.md
    4291 rules/decision-record-examples.md
   16784 rules/user-facing-output.md
    9958 rules/critical-stance.md
    7353 fusion-workbench/stilwerk/chat-voice-de.yaml
   93819 total
```

**93 819 bytes total, 86 466 of shipped rule text.** Both figures confirm the planner's
measurement exactly. The line's two present-tense numbers (88 023 and 80 670) were each low by
5 796 bytes.

The treatment was fixed by the plan, so no choice was made here. The two decaying numbers are
gone. The removal's delta survives as a stamped historical measurement: the rule was 10 541
bytes per dispatch; measured on 260812, the day it went, the floor stood at 98 443 bytes
(91 090 of shipped rule text plus this project's 7 353-byte chat voice profile); the step took
10 420 off rather than the full 10 541, because it also added 121 bytes correcting a
present-tense claim in `rules/critical-stance.md`. The line now states plainly that the current
floor is deliberately not given, why (it moves with every rule edit), by how much the removed
numbers had drifted, and how to measure it: `wc -c` over the always-on set, which is the
`emit_if_exists` list in `bin/fusion-rules` plus the project's chat voice profile.

## Verification

- `cd hooks && npx vitest run lib/__tests__/derivable-enumerations-lint.test.ts` — exit 0, 18 tests passed.
- `cd hooks && npx vitest run` — exit 0, 49 files, 1019 tests passed.

No lint parser broke. The regexes this file's existing checks anchor on (the skill listing, the
`16 specialized agents` / `16 agent prompts` / `other 15 inherit` counts, the `DEFINITION_SITES`
echo) sit in passages no edit touched.

## Not done here, deliberately

- No `bin/` roster lint. That is step 3, and it depends on this step landing first.
- No commit. The orchestrator commits.
