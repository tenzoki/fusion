# Coder — plan step 6: all sixteen agent rows, and the dispatch-parameter roster

**Date:** 2026-08-13 20:43
**Agent:** coder
**Circle:** `circles/260813-0910-documentation-matches-shipped-plugin`
**Plan:** `planning/260813-1820_p_documentation-matches-shipped-plugin.md`, step 6
**Status:** Complete

## What was done

Three halves of one reading. Every one of the sixteen agent prompts was opened at its Setup, Scope and Output sections and run through `bin/fusion-paths <name>`; the row in `README-agents.md` was then checked against both. `agents/orchestrator.md` was taken first, per the plan's own risk note, and read at `:27-45` (Setup), `:230-259` (Scope), `:656-720` (the Phase 4 report template) and `:1405-1417` (Output Style) rather than in full.

## The sixteen rows, each with what it was read against

Twelve rows were corrected; four stand as they were after a reading.

| Row | Read against | Outcome |
|-----|--------------|---------|
| `shaper` | `agents/shaper.md:18-105`, `fusion-paths shaper` (`OUT_CIRCLE`, `SCAN_BACKLOG`) | corrected — the portfolio-activation write list named two of three in-place record edits (the `**Active spec/plan:**` head field was missing, `:53`), and the backlog promotion was stated unconditionally where `:96-105` gives two branches |
| `planner` | `agents/planner.md:15-23`, `:47-55`, `fusion-paths planner` | corrected — Reads did not name the defect store, which `SCAN_ISSUES` values and `:57-66` reads |
| `coder` | `agents/coder.md` `## Scope`, `fusion-paths coder` | corrected — Writes omitted code-level documentation (architecture notes, API docs, code READMEs), which the Scope's fourth bullet owns |
| `ontocoder` | `agents/ontocoder.md` `## Scope`, `fusion-paths ontocoder` | corrected — Writes named five data extensions where the Scope names eight (`.tsv`, `.xml`, `.ndjson` missing) |
| `coderev` | `agents/coderev.md:3`, `:27-33`, `:69`, `fusion-paths coderev` | corrected — Role said "Go / TS / Python code" against "application code, prompts, build/packaging, and tooling"; Writes claimed `history/`, which the prompt refuses at `:69` and the resolver values with no `OUT_HISTORY` key |
| `ontorev` | `agents/ontorev.md:33-39`, `:62`, `fusion-paths ontorev` | corrected — same phantom `history/` write |
| `conceptrev` | `agents/conceptrev.md:3`, `:26-32`, `fusion-paths conceptrev` | corrected — Role named three document kinds against five (tasklists and investigations missing, both valued as resolver keys); same phantom `history/` write |
| `reconciler` | `agents/reconciler.md:28-30`, `## Scope`, `fusion-paths reconciler` | corrected — Writes said "status markers, reconciliation logs only" and omitted the new issues, the decision records, and the `## Coherence` append to the orchestrator's session-history file |
| `taskplanner` | `agents/taskplanner.md:19-21`, `## Scope`, `:61`, `:87-90`, `fusion-paths taskplanner` | corrected — Role named three queue sources against four; answered (`_a_`) decisions yield tasks |
| `bugfixer` | `agents/bugfixer.md:23-38`, `fusion-paths bugfixer` | no change needed — Role, Reads, Writes and Output all hold, and the ontology human gate is already stated in the Hard-rule paragraph under the table |
| `consultant` | `agents/consultant.md:34-52`, `fusion-paths consultant` | corrected — Writes omitted the decision store (`OUT_DECISION`), and the history write is conditional on being asked |
| `investigator` | `agents/investigator.md:33-47`, `fusion-paths investigator` | corrected — Writes omitted the decision store |
| `analyst` | `agents/analyst.md:23-37`, the report `**Type:**` list, `fusion-paths analyst` | corrected — Writes omitted the decision store; Role named five analysis types against the prompt's eight |
| `editor` | `agents/editor.md:18-30`, `## Scope`, `## Output Placement`, `fusion-paths editor` (`OUT_HISTORY` only) | corrected only by subtraction — the dispatch-parameter clause moved into the new table so the roster has one authoring home; the produce-only bound was added in its place |
| `orchestrator` | `agents/orchestrator.md:230-259`, `:111`, `:842`, `:983-984`, `fusion-paths orchestrator` | corrected — Writes named three of its write targets ("dispatches agents, creates commits, writes `history/`") against ten; Reads said "Anything" where `:235` says "any file except `.secret`" |
| `playmaker` | `agents/playmaker.md:40-72`, `:154-176`, `fusion-paths playmaker` (`OUT_BACKLOG`) | corrected — Role said the agent "names duplicates" where `:57` has it merge them under confirmation; Reads claimed all of `fusion-workbench/` where `:63` forbids the three frozen stores; Writes omitted the backlog store entirely and named `_a_circle.md` where the appends land on a record of any marker |

Two prose notes were added under the table for facts that are true of groups rather than rows: what "Anything" in the Reads column means (the project tree minus `.secret`, stated in ten of the sixteen prompts and in neither direction by the other six), and that the three reviewers write no session history by design.

## The dispatch-parameter roster

`README-agents.md` `## Dispatch parameters` is new and is the roster's single authoring home. Eleven parameters across six agents, each row carrying the agent, the parameter line, its accepted values, what happens when it is absent, who passes it, and the prompt line it was read against:

- `**Domain:**` — `taskplanner` (`:19`, `:34-36`), `reconciler` (`:28-30`, `:45-47`), `playmaker` (`:25-27`, `:36-38`), each defaulting to `code`. `shaper` (`:57`, `:80`) accepts the same line in anticipated-circle mode as a pass-through into the record's frontmatter.
- `**Executors:**` and `**Circle:**` — `planner` (`:47-55`).
- `**Mode:**`, `**Circle file:**`, `**Draft:**`, `**Parent task:**` — `shaper` (`:45`, `:47`, `:55`, `:57`, `:104`). Two of those halt when their mode is named and they are absent.
- `**Deliverable language:**` — `editor` (`:18-30`), the one parameter with no default and no fallback.

Neither the survey's count of five nor `CLAUDE.md`'s count of four was carried forward; both were replaced by the reading. The editor's halt is set apart from the defaults by its own paragraph under the table rather than by a uniform cell. One dispatch instruction that is *not* a parameter is named and excluded: the orchestrator's freeform "ontology edits pre-approved" pre-authorisation of the bugfixer's ontology gate (`agents/bugfixer.md:42`, `:146`).

## The planner reconciliation

Confirmed on the prompt rather than carried forward: `agents/planner.md` declares exactly two parameters and contains no `**Domain:**` line. Its three case-insensitive "domain" hits (`:27`, `:33`, `:89`) are prose about strategic-domain work.

Corrected: `CLAUDE.md:14` (membership now `reconciler`, `taskplanner`, `playmaker`, with the planner's exclusion stated), the `CLAUDE.md` dispatch-parameter bullet (rewritten to cite the README table instead of restating a third copy of the roster), and `docs/philosophy.md:19`.

**Read and deliberately not edited:** `.claude-plugin/plugin.json:3`. Its claim is a bare count — "3 parameterised by domain" — naming no member, and the count is still exactly right once the membership is corrected (`taskplanner`, `reconciler`, `playmaker`). Editing it would have changed 3 to 3. This is not a knowingly-false copy left standing; it is a true sentence that survived a membership change because it never named the members. The plugin version was left at 8.1.0: the file was not changed, and the four version surfaces stay coherent.

**A fifth carrier was found and is out of scope.** `agents/orchestrator.md:153` names `planner` among the agents receiving the `domain` parameter and omits `playmaker`, contradicting its own `:200` and `:850`. Agent prompts are not in this step's file scope, so it is filed as `issues/260813-2045_o_the-orchestrator-prompt-names-the-planner-among-the-domain-parameterised-agents-and-omits-the-playmaker.md` for a later step.

## Issues closed in passing

Two reviewer findings against the step-4 `shaper` row were resolved by this pass's independent reading of the same row and closed with `Resolved:` notes: `260813-2009_c_the-shaper-writes-cell-enumerates-two-of-three-in-place-record-edits.md` and `260813-2009_c_the-shaper-writes-cell-states-the-backlog-promotion-unconditionally-while-the-prompt-conditions-it.md`.

## Verification

- `cd hooks && npx vitest run lib/__tests__/derivable-enumerations-lint.test.ts` — exit 0, 21 tests. Run after the row rewrites and again after the table insertion. No parser needed fixing: the file's `README-agents.md` parsers key on the skill table, the `of the 16 prompts` claim, the "Always-on core" bullet and the conditional-rule co-mentions, none of which this step's edits touch.
- `cd hooks && npx vitest run` — exit 0, 49 files, 1022 tests. Above the 48/1010 baseline recorded in `shared/issues/260813-0828_c_…`, which is the two new spec files landing between that note and this run, not a change from this step.

## Files changed

- `README-agents.md` — twelve rows corrected, two group notes added, `## Dispatch parameters` section added
- `CLAUDE.md` — the agent-listing parenthetical and the dispatch-parameter bullet
- `docs/philosophy.md` — §5
- the plan file (step 6 marked `[DONE]` with a completion note), one new issue, two issues closed
