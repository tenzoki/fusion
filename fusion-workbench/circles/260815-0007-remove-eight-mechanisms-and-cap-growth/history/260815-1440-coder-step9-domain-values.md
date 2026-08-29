# Step 9 — the `strategic` and `knowledge` domain values leave the plugin

**Status:** Complete
**Agent:** coder
**Date:** 2026-08-15
**Circle:** `260815-0007-remove-eight-mechanisms-and-cap-growth`
**Plan:** `260815-0029_*_plan-remove-eight-mechanisms-and-cap-growth.md` step 9
**HEAD at start:** `7260bbc`
**Verification:** `cd hooks && npm test` — exit 0, 45 files, 831 tests (827 before; the four new
ones are named below). `claude plugin validate .` passed with the one pre-existing CLAUDE.md
warning.

---

## What the step did

The `**Domain:**` dispatch parameter keeps its two useful values and loses the two nobody passed.
`code` and `data` stay, the parameter stays, and every prompt, rule, skill body, README row and
hook that enumerated four values now enumerates two. The three domain-parameterised agents
(`taskplanner`, `reconciler`, `playmaker`) lost the protocol halves only the removed values
selected.

## The cascade was rewritten, not deleted

The Circle record listed `hooks/lib/domain-cascade.ts` under a removal. The plan corrected that and
the correction held: the module parses the cascade out of `agents/orchestrator.md` and runs it, so
deleting it would delete the only executable definition of a decision that is still made. What
changed:

- **`DOMAINS` is `["code", "data"]`.** Two new exported constants carry what left, as data rather
  than prose, because each does a job the prose could not. `RETIRED_DOMAINS` makes `parseCascade`
  refuse a branch assigning `strategic` or `knowledge` with a message that says *retired* instead of
  the generic *not a domain* — re-adding one is a decision about the dispatch parameter, and it now
  fails saying so. `RETIRED_COUNT_NAMES` holds the four counts only the removed branches read
  (`commits`, `analyses_count`, `issues_count`, `decisions_count`); the grammar no longer accepts
  them as inputs, and `inputsNamedIn` still recognises them.
- **The grammar's input set narrowed to the three the cascade reads** — `code_files`, `data_files`,
  `counted_by`. The prompt's fenced block dropped the four definition lines nothing reads any more,
  and the sentence above it about `*_count` values summing across every `SCAN_*` path went with
  them, since no `*_count` is left in the block.
- **`cascadeBlocks()` derives its pair from `DOMAINS`** instead of matching the literals `code` and
  `strategic`, so it moved with the removal rather than staying pinned to a name that is gone.

**What the cascade now decides, in one sentence:** with no count taken it answers `code`; otherwise
it answers `data` when the tree holds source and more than twice as much structured data, `code`
when the tree holds source, `data` for a sourceless tree that still holds data, and `code` as the
no-evidence fallback.

**Why `RETIRED_COUNT_NAMES` is not tidying.** The reach gate's job is finding a second statement of
the cascade in a consumer's text. From here on the likeliest second statement is a **stale** one —
prose restating the four-outcome cascade. Its two surviving domain names still fire, and the counts
it names are precisely the four the live cascade no longer reads. Dropping them from
`inputsNamedIn` would have made exactly that copy invisible. The proof is in the suite: the
`skills/cleanup/SKILL.md` copy from issue `260810-1918` is kept verbatim as a fixture and **still
fires**, now selected by two surviving domains plus `decisions_count` and `analyses_count`.

## What the order lint now pins

The old property was *every branch returning `strategic` or `knowledge` sits below the first branch
reading `code_files`*. Both domains are gone; the property is not, because the cascade still ends in
a bare `data_files > 0` branch of the same shape — it claims the tree governs no build, and the
direct evidence for that claim is `code_files == 0`. It carries no `code_files` conjunct because the
two `code_files` branches above it *are* that conjunct.

So the lint is re-cut on the evidence rather than on a domain name:

> **Every branch whose condition reads `data_files` and not `code_files` sits below the first branch
> that reads `code_files`** — and the `counted_by == "none"` branch still sits above every branch
> that reads a count.

Both asserts carry a non-vacuity guard: if no branch decides on the data count alone, the test says
the gate has stopped measuring anything rather than passing silently.

The negative controls survive, re-expressed in the two-domain vocabulary: the pre-fix **shape** (the
data-alone branch lifted above both `code_files` branches), a count branch above the absent-count
line, and the comment-only token. The historical 2910cf6 text can no longer be a control, because
the grammar rejects it before any order is measured — so it is kept as a control of a different
kind, in both test files: `parseCascade(historicalPreFix)` must throw `/retired/`.

Four tests added, and they are the whole of 827 → 831: the retirement refusal in each of the two
files, a retired-*input* refusal, and a split of the "accepts the pre-fix absent-count position"
control so it demonstrates the two asserts disagreeing about one cascade.

## The answered decision, implemented

`260815-0029_*_what-triggers-the-analyst-executor-set-once-strategic-and-knowledge-are-gone.md`,
option 1, answered by the user at the plan gate. Transitioned `_a_` → `_i_` with `git mv`.

- `agents/orchestrator.md:396` — the condition is gone. Every planner dispatch carries
  `**Executors:** coder, ontocoder, analyst`, and the prompt says why: the orchestrator does not
  hold the input for that judgement at Phase 0b.
- `agents/orchestrator.md:453` — the `analyst` routing row dropped `and the active executor set
  includes analyst`, which can no longer be false under the orchestrator.
- `agents/orchestrator.md:1402` — the planner row of the dispatch table says *unconditionally*.
- `agents/planner.md` `## Executor Agents` — states that the orchestrator always passes all three
  and that whether a step needs `analyst` is this document's judgement. The routing rule at `:38`
  is unchanged in substance, and keeps its executor-set clause, because a non-orchestrator caller
  may still omit the parameter.
- `README-agents.md` `## Dispatch parameters`, the `planner` / `**Executors:**` row — its "Passed
  by" cell quoted the deleted condition verbatim and now reads *on every planner dispatch, with no
  condition in front of it*.

**The `Implemented:` line carries a placeholder, not a hash.** The orchestrator commits this task,
so no hash exists while the record is being written. The line names this history file instead, which
is a citation that resolves now.

## The sequenced plugin-description edit

Two records asked for the `.claude-plugin/plugin.json` description to be rewritten once here rather
than twice: `260815-1206_*_three-churn-references-…` (item 2) and
`260815-1251_*_the-three-churn-references-record-lists-three-and-two-remain.md`. Done in one
edit — the `churn detection` clause and the four-value domain list left together. The version was
**not** bumped; step 15 owns that.

**`260815-1206_o_` does not close, and that was checked rather than assumed.** Item 1,
`.gitignore:39`'s `!bin/fusion-churn-rank`, is still live. It stays out of step 9's scope on
purpose: that block now carries two stale re-inclusion exceptions and step 11 adds a third, so it is
one sweep rather than three edits in three steps. The record was appended to and keeps `_o_`.
`260815-1251_o_` **did** close (`git mv` to `_c_`) — its whole ask was the append, and the append is
made.

## Judgements — where a statement my change made false had no gate to catch it

1. **`agents/reconciler.md` Step 1.5 was deleted entirely, not just its switch.** Step 1.5 detected
   a workbench shape and switched to *strategic reconciliation mode*, whose output is the
   `strategic` protocol's. With that protocol gone the switch had nothing to switch to. It was the
   removed protocol's second entrance, so it went with it. The prompt's own line saying Step 1.5
   "still applies as a safety net if the orchestrator passes the wrong domain" went too.
2. **The reconciler's "do not close an issue whose answer lives in an analysis" rule was widened,
   not deleted.** It was conditioned on `domain=strategic` or `domain=knowledge`. Deleting it would
   have removed a safeguard; its own last sentence already states the general criterion (*"closing
   an issue only happens when its answer has been implemented in code or data"*), which is the same
   criterion the `code` protocol uses. So the condition went and the rule stayed, now unconditioned.
3. **`README-agents.md` `## Dispatch parameters` line citations were recomputed — 14 of them.** The
   table's whole value is that every cell is cited to the line it was read against. My edits shifted
   `taskplanner`, `reconciler`, `playmaker`, `planner` and `orchestrator`. Measured while fixing
   them: **six of the citations were already wrong at HEAD `7260bbc`** and are not mine —
   `agents/orchestrator.md:449`, `:706`, `:907`, `:337`, `:338`, `:339`, `:495` and `:1454` all
   pointed at blank lines, the wrong row, or past the end of the file, victims of the seven earlier
   steps that shrank that prompt. I corrected all of them rather than fixing the four I broke and
   leaving the rest, because the measurement was already in hand and a half-corrected citation table
   is worse than a uniformly stale one. No gate reads these numbers.
4. **`hooks/lib/domain-cascade.ts`'s `BLOCK_START` comment** named the two tree lines an
   unconditional two-line window would select (`agents/playmaker.md:111`,
   `agents/reconciler.md:135`). Both moved. Re-measured: `agents/playmaker.md:31-32` (two rows of
   the per-domain ranking table) and `agents/reconciler.md:107-108` (two bullets of the edge list).
   Both are now the `MUST_NOT_FIRE` window fixtures as well, so the comment and the test measure the
   same two places.
5. **`REACH.excluded`'s `docs/*.md` entry flipped from `fires` to `clean`.** It was excluded on a
   measured cost: `docs/philosophy.md:19` said what each of four domains prioritised, in a shape
   identical to a paraphrase. With two domains that line names no count and the directory measures
   clean. The note now says the reason for the exclusion has expired and the exclusion is an
   uncovered directory rather than a justified one. The suite asserts the new measurement, so this
   could not have been left stale.
6. **`REACH.holes[0].cost` re-measured: 13/13 → 12/12.** The bare-word widening now selects twelve
   lines of honest prose on single lines and twelve with the continuation window.
7. **All five `MUST_NOT_FIRE` fixtures and both window fixtures were re-derived from the edited
   tree**, not adjusted by hand. Every one is a real current line.
8. **`README-hooks.md`'s generated reach block** was regenerated from `describeReach()` and is
   byte-compared by the suite.

## What the step's file list missed

Four files carried a reference the step's list did not name, and one it named needed nothing.

- **`agents/shaper.md:59`** — the anticipated-circle detection contract spells the four accepted
  `**Domain:**` values. Not in the list. Reduced to two.
- **`skills/help/SKILL.md:43`** — the philosophy pointer names the four values as what "the same
  plumbing" serves. The list named `skills/help/SKILL.md`, so this one is a hit rather than a miss;
  worth recording that the file carried exactly one domain-value mention and not more.
- **`README-hooks.md`** — the list names it, and it changed for a reason the list does not give: the
  generated reach block, not a domain-value enumeration.
- **`rules/context-manifest.md` and `rules/context-lean-claude-md.md`** were in the list and needed
  **no edit**. All five occurrences in each are the ordinary English word *knowledge* ("knowledge
  bodies", "body-of-knowledge"), never a domain value.
- **`agents/consultant.md`** was in the list and needed **no edit** for the same reason: "strategic
  advice" twice, and one match inside the word *acknowledge*.
- **`skills/cleanup/SKILL.md` and `skills/archive/SKILL.md`** were in the list. `cleanup` carries no
  domain-value enumeration at all any more; `archive`'s single hit is "strategic deliverables", the
  analyst-routing sense, and stays.

## Files changed

Shipped: `agents/orchestrator.md`, `agents/reconciler.md`, `agents/taskplanner.md`,
`agents/playmaker.md`, `agents/planner.md`, `agents/shaper.md`; `skills/next/SKILL.md`,
`skills/direct/SKILL.md`, `skills/help/SKILL.md`; `rules/fusion-workbench-conventions.md`,
`rules/circle-records.md`; `README-agents.md`, `README-hooks.md`, `docs/philosophy.md`;
`.claude-plugin/plugin.json`; `hooks/lib/domain-cascade.ts`,
`hooks/lib/__tests__/domain-cascade.test.ts`,
`hooks/lib/__tests__/domain-cascade-order-lint.test.ts`,
`hooks/lib/__tests__/fixtures/rules-emission.golden` (regenerated by the documented command;
`RULE_BASELINE` untouched, and the only movement is the two rule files shrinking),
`hooks/dist/lib/domain-cascade.{js,d.ts}` (build output, committed by convention).

Workbench: the plan (step 9 `[DONE]`, two `_a_`-exact citations of the transitioned decision moved
to the wildcard form), the decision record (`_a_` → `_i_`, `git mv`),
`260815-1206_*_…` (appended, stays open), `260815-1251_…` (appended, `git mv` to
`_c_`), one new issue
(`260815-1447_*_claude-mds-dispatch-parameter-bullet-asserts-orchestrator-behaviour-step-9-inverted-not-just-a-value-list.md`),
and this file.

`CLAUDE.md` was **not** edited, per the step's own instruction. The new issue records why the plan's
description of what waits there is too narrow: `CLAUDE.md:59` asserts that the orchestrator derives
the executor set from the detected domain, which is now false about behaviour and not merely a value
list two entries long.
