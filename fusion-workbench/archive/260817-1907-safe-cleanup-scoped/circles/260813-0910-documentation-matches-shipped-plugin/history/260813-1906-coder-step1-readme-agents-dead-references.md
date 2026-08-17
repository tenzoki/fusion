# Step 1 — README-agents.md: the two dead references

**Date:** 2026-08-13 19:06
**Agent:** coder
**Status:** Complete
**Circle:** `circles/260813-0910-documentation-matches-shipped-plugin`
**Plan:** `circles/260813-0910-documentation-matches-shipped-plugin/planning/260813-1820_o_documentation-matches-shipped-plugin.md` step 1
**Files changed:** `README-agents.md`

## What was corrected

Two lines in `README-agents.md`, each confirmed by reading the documentation line and the
artifact it describes. No correction rests on a match count.

### 1. The pre-v4.0.0 history path (`README-agents.md:268`, Migration note)

The line named `fusion-workbench/history/` as the home of historical session logs.

Read on the artifact side, three ways, all agreeing:

- `ls fusion-workbench/` at HEAD — no `history/` entry exists. The workbench root holds
  `agentstate.yaml`, `archive`, `circles`, `monitor`, `orchestrator-events.jsonl`,
  `orchestrator-live.md`, `plane.config.yaml`, `portfolio.md`, `shared`, `stilwerk`,
  `tasklist.md`, and nothing else.
- `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`, the layout tree at
  lines 24–58: `history/` appears twice, as `circles/<stamp>-<slug>/history/` and as
  `shared/history/`. There is no root-level `history/`, and the root-anchored surfaces the
  same tree enumerates do not include one.
- `README-agents.md:225-236`, the file's own layout tree forty lines earlier: `history/`
  at `:226` inside `circles/<stamp>-<slug>/` and at `:229` inside `shared/`.

The measured state matches: `fusion-workbench/shared/history/` holds 204 files, and every
Circle directory carries its own `history/`.

Corrected to name both stores. The sentence's point (old logs cite legacy prompt paths and
are immutable records) is untouched.

### 2. Two `CLAUDE.md` surfaces that do not exist (`README-agents.md:261-264`, step 5 of "Adding a new agent")

The step told the reader to register a new agent in a "`CLAUDE.md` folder structure block"
and a "`CLAUDE.md` key-documentation table".

Read on the artifact side:

- A grep for a line-initial triple backtick in `CLAUDE.md` returns **nothing**. The file carries no fenced code block
  at all, so there is no folder-structure block to register anything in. The workbench
  layout's authoring home has been `rules/fusion-workbench-conventions.md` since v4.0.0.
- `CLAUDE.md` holds exactly two tables: `## Layout` (heading at `:23`, header row
  `| Path | Purpose |` at `:25`) and the troubleshooting table under
  `## Where to look when something breaks` (header row `| Symptom | Likely cause |` at
  `:118`). Neither is a "key-documentation table"; that name matches no surface in the file.

The two surfaces a new agent actually has to reach, both read:

- `CLAUDE.md:16` — the agent listing bullet under `## What this is` (`:12`). It names all
  sixteen agents and opens with the count.
- `CLAUDE.md:28` — the `agents/*.md` row of the `## Layout` table, which states
  "The 16 agent prompts" and "the other 15 inherit tools and model from the parent session".

Both counts are machine-checked against the tree. `hooks/lib/__tests__/derivable-enumerations-lint.test.ts:149-155`
derives `n` from `agents/*.md` and asserts three claims in `CLAUDE.md`:
`\b(\d+) specialized agents\b` = n, `\bThe (\d+) agent prompts\b` = n, and
`\bthe other (\d+) inherit\b` = n − 1. A sentence saying so was added under the list, since
it is the reason a forgotten registration is caught rather than shipped.

The third bullet ("The agent table at the top of this README") was correct and is unchanged.

## Verification

`cd hooks && npx vitest run lib/__tests__/derivable-enumerations-lint.test.ts` — exit 0,
18 tests passed. The lint's `README-agents.md` parsers key on the skill table, the
"Always-on core" bullet, the `of the 16 prompts` claim and the conditional-rule
co-mention lines; none of them touches `:261-268`, so no parser needed fixing.

The full suite was run as well, because the step added a new path citation:
`cd hooks && npx vitest run` — exit 0, 49 files, 1019 tests passed.

## Out of scope, not touched

The `coderev` row at `:29` ("Go / TS / Python code") and the `playmaker` row at `:40`
("names duplicates") are known defects and belong to step 6. The `shaper` and `planner`
rows and the Turn-budget diagram belong to step 4.
