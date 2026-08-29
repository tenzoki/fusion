# coder — step 4 of the documentation plan, plus five Turn-1 review findings

**Date:** 2026-08-13
**Agent:** coder
**Circle:** `260813-0910-documentation-matches-shipped-plugin`
**Plan:** `260813-1820_*_documentation-matches-shipped-plugin.md` step 4 (now `[DONE]`)
**Status:** Complete

## What was implemented

Step 4 of the plan and five of the seven findings coderev filed against Turn 1. Two findings
(`hooks/staging-drift.ts` missing from the README-hooks table, and the `bin/` roster parser
accepting a row-shaped line outside the Layout table) were explicitly out of scope and were not
touched.

### Step 4 — `README-agents.md`

**The `shaper` row.** Read `agents/shaper.md` in full and ran `bin/fusion-paths shaper`. Three
defects, each checked against a named line:

- The Writes column omitted the decision store, while `agents/shaper.md:156` requires deferred
  behavioral, scope and UX decisions to be filed at `$OUT_DECISION`, and `bin/fusion-paths shaper`
  emits `OUT_DECISION`.
- It omitted the anticipated-circle mode's own artifact entirely. `agents/shaper.md:28` and `:79`
  have that mode *create* a Circle directory holding `_a_circle.md` and the six artifact
  subdirectories, which is why the key set carries `OUT_CIRCLE=circles`; `:64` makes that Circle
  the mode's first write.
- It omitted both the portfolio-activation in-place record edit (`agents/shaper.md:53`, the
  `## Directive` and `## Grounding snapshot` sections and nothing else) and the backlog entry's
  closing rename plus `Promoted:` line (`:86-91`), which is the whole of the shaper's reach into
  the store `SCAN_BACKLOG` names — read access plus that one closure, no write key.

The Role column now names the four modes from `agents/shaper.md:39-104`; the Output column says
the anticipated-circle mode produces a Circle record *instead of* a spec (`:62`).

**The `planner` row.** Read `agents/planner.md` and ran `bin/fusion-paths planner`. Two defects:

- The Writes column omitted the decision store. `agents/planner.md:57` ("You also file them")
  makes filing mandatory for a choice that binds work beyond the plan, with the plan's
  `## Open Questions` citing the record rather than holding it; `bin/fusion-paths planner` emits
  `OUT_DECISION`.
- The Reads column said "Anything" where the prompt names three specific stores it must read:
  `$SCAN_PLANS`, `$SCAN_ANALYSES` and `$SCAN_DECISIONS` (`agents/planner.md:88` Planning Process
  step 2, and `:57` for the open and answered records).

The Output column now names the mandatory `**Decidability:**` head line and the four fields every
step declares, both from the plan output format at `agents/planner.md:97-129`.

**Dispatch parameters were deliberately left out of both rows**, per the step: the roster is
step 6's table. Neither row names `**Mode:**`, `**Draft:**`, `**Executors:**` or `**Circle:**`.

**The Turn-budget diagram at `:110`.** The box read `Turn loop (max 5 Turns)`. It now reads
`Turn loop` with the side annotation `← Turn budget (see below)`, carrying no digit, and the box
still aligns column for column with the rest of the drawing. A paragraph after the fenced block
states where the number comes from, checked on both sides:

- `bin/fusion-turn-budget` header (`:1-46`): resolved once at Setup, from `fusion-guard.json`
  `{"orchestrator": {"maxTurns": N}}`, merged per leaf over the plugin's `hooks/config.json` and
  then the defaults.
- `hooks/lib/config.ts:277` — `maxTurns: 5` in `DEFAULTS`, the one place the number is defined.
- `agents/orchestrator.md:129-130`, `:1049` and `:1204` — the unresolved case: `progress.max_turns`
  omitted from `agentstate.yaml`, the dashboard's Turn field shown as `<current>/--`, no circuit
  breaker to evaluate, and the user asked at every Turn boundary instead.

`README-agents.md:110` was the last digit claim about the budget in the shipped docs;
`README-hooks.md:164` describes the resolver without stating a number.

### The five findings

1. **The lint-guarantee sentence** (`README-agents.md`, step 5 of "Adding a new agent").
   Turn 1 introduced it. It promised that a forgotten registration fails the suite; the gate
   compares digit counts. Checked against `hooks/lib/__tests__/derivable-enumerations-lint.test.ts:146-152`
   (the `CLAIMS` array: five digit regexes, three of them over `CLAUDE.md`) and against every
   `agentNames()` call site in that file (`:145`, `:169`, `:263`) — the one outside the count block
   checks that a derived agent set names real agents, not that an agent is registered anywhere.
   The sentence now states what is checked (the counts, and which three claims), and states
   plainly that names are not.
2. **The `fusion-count-sources` row** (`CLAUDE.md:43`) claimed no markdown describes the helper
   while being that markdown. Reworded to the sibling form used by the four rows added beside it:
   the header is authoritative, the row summarises it. A second reason the absolute could not
   stand: `agents/orchestrator.md` names the helper at five lines (`:158`, `:159`, `:162`, `:175`,
   `:196`).
3. **The `fusion-commit-lock` row** (`CLAUDE.md:42`) listed two of the four acquirers in its
   opening clause while its closing sentence said it restates none. The clause was dropped;
   the pointer to `rules/workbench-stash-and-lock.md` `### Who acquires` (read in full: four
   entries, the two committing skills being the one a reader is least likely to guess) carries it.
4. **The measurement instruction** (`CLAUDE.md`, the always-on rule budget bullet) named the whole
   `emit_if_exists` list. Measured here rather than carried over: `grep -n 'emit_if_exists'
   bin/fusion-rules` gives five unindented lines (`:391-395`) and three indented (`:421`, `:439`,
   `:454`); `wc -c` over the three conditional files is **30 588** bytes; `bin/fusion-rules coder |
   xargs wc -c` and `wc -c` over the five plus this project's 7 353-byte chat profile both total
   **93 819**. The instruction now says *unindented*, names the 30 588-byte gap, and offers the
   one-command form.
5. **The plan file's marker** was `_o_` with `**Status:** Draft` while three steps were `[DONE]`.
   Renamed to `_p_`, status set to `In progress`, and step 4 marked `[DONE]` in the same edit.

## Files changed

Shipped:
- `/Users/k1/Projects/productive/fusion/README-agents.md`
- `/Users/k1/Projects/productive/fusion/CLAUDE.md`

Workbench (five issue closures and the plan, all renames):
- `260813-1929_*_readme-agents-claims-the-lint-catches-a-forgotten-registration-when-it-only-checks-counts.md` → `..._c_...`
- `260813-1929_*_the-count-sources-layout-row-says-no-markdown-describes-it-while-being-that-markdown.md` → `..._c_...`
- `260813-1929_*_the-commit-lock-row-restates-two-of-four-acquirers-while-saying-it-restates-none.md` → `..._c_...`
- `260813-1929_*_the-measure-it-yourself-instruction-names-the-emit-if-exists-list-which-includes-three-conditional-rules.md` → `..._c_...`
- `260813-1929_*_the-plan-file-carries-the-open-marker-and-status-draft-while-three-of-ten-steps-are-done.md` → `..._c_...`
- `260813-1820_*_documentation-matches-shipped-plugin.md` → `260813-1820_*_documentation-matches-shipped-plugin.md`

## Verification

- `cd hooks && npx vitest run lib/__tests__/derivable-enumerations-lint.test.ts` — exit 0, 21 tests passed.
- `cd hooks && npx vitest run` — exit 0, 49 files, 1022 tests passed, 73.89s.
- `cd hooks && npx vitest run` again after a one-word wording fix in `CLAUDE.md` ("are not part of
  the floor") — exit 0, 49 files, 1022 tests passed, 72.10s.

All three runs followed every edit to a shipped file. The workbench edits after them touch no file any
test reads.

## Method

Every correction was checked by reading the documentation line and the artifact line it describes,
never by a match count. The artifact line is named for each correction above. No commit was made;
staging and committing are the orchestrator's.

## Notes

`bin/fusion-rules coder` emitted six paths: the five always-on rules and
`fusion-workbench/stilwerk/chat-voice-de.yaml`. No long-form writing profile is emitted for this
agent, which is expected — `coder` is not one of the prose agents. The artifact language for this
file is `en` per `CLAUDE.md`.
