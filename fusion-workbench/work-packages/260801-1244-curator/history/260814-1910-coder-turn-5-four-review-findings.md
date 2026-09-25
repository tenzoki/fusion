# Coder — Turn 5: four review findings, one of which turned into a measurement

**Date:** 2026-08-14
**Agent:** coder
**Circle:** `260801-1244-curator`
**Turn:** 5
**Status:** Complete

## What was asked

Four defect records from the Turn-3 and Turn-4 reviews, all of the shape "a document
states something the mechanism does not do". Three were repairs. The fourth was posed as a
question to settle before touching anything.

## 1. The dispatch roster (`README-agents.md` `## Dispatch parameters`) — HIGH, fixed

Record: `260814-1850_*_the-dispatch-parameter-roster-still-forbids-the-dispatch-and-has-no-row-for-the-new-parameter.md`

Four edits, one more than the record asked for.

- **`**Circle file:**` row, `Passed by`.** Was "the user running shaper top-level — no skill
  and no agent dispatches this mode". Now names both routes and the condition on the second,
  citing `agents/shaper.md:47` and `agents/orchestrator.md:338`.
- **`**Mode:**` row, `Passed by`** — the surface the record did not name, found by the widened
  search it asked for. It read "the user directly for `portfolio-activation`", the same
  prohibition one row up. It now names the orchestrator's permitted dispatch as well.
- **New row for `**Initiated by:**`**, placed between `**Circle file:**` and `**Draft:**`, the
  order the parameter lines travel in. `If absent` states the halt on a dispatched run and the
  waiver on a top-level one, and names the discriminator the waiver rests on — see §4, which is
  why the row cites it rather than asserting it.
- **Six line-number citations** moved by the two lines `bf9553f` inserted above them:
  `:55`→`:57` (`**Circle file:**`), `:57`→`:59` (`**Mode:**`, `**Draft:**`, `**Domain:**`, and
  the section's intro paragraph), `:60`→`:62` and `:104`→`:106` (`**Draft:**`), `:80`→`:82`
  (`**Domain:**`). The record's table omitted `:104`; it slid by the same two and was corrected
  with the rest.

**The widened search, so the next reader need not repeat it.**
`grep -rn "portfolio-activation"` over every `.md`, `.ts` and `.json` outside the workbench
returns, besides the two rows above: `README-agents.md:25` (the shaper's agent row — enumerates
the modes, claims nothing about who invokes them), `agents/orchestrator.md` (the permitting
section itself, plus the event and routing tables), `agents/shaper.md` (corrected by `bf9553f`),
`rules/circle-records.md:83`, `skills/next/SKILL.md:250` and `docs/working-model.md:78` — none of
which states who may dispatch the mode. `.claude-plugin/plugin.json` contains no agent
description. The two roster cells were the whole of the residue.

## 2. Phase 0b.1 step 3 (`agents/orchestrator.md`) — MEDIUM, fixed

Record: `260814-1850_*_phase-0b-1-still-tells-the-orchestrator-not-to-intercept-a-dialogue-the-same-file-now-mandates-it-relays.md`

The step told the orchestrator that the shaper reaches the user through `AskUserQuestion` and
not to intercept. It now states the relay and points at
`## Re-sharpening an anticipated Circle (shaper portfolio-activation)`, which already carries
the mechanics once — the batch return, the relay, the cold-start re-dispatch. No second copy of
them was written into the phase step. The sentence worth keeping was kept: the orchestrator
does not answer a round on the user's behalf.

The record's other observation — that `bf9553f` edited `agents/shaper.md:121` and left
`/fusion:direct` out of the enumeration, so open record `260813-1334` stays open at a line this
range rewrote — was **not** acted on. It is that record's scope, not this task's.

## 3. The layout tree's consumer column (`rules/fusion-workbench-conventions.md`) — MEDIUM, fixed

Record: `260814-1419_*_the-layout-trees-consumer-column-now-names-only-bin-monitor-for-three-surfaces-that-four-hooks-modules-read.md`

Three rows restored to the file-only citation form the same ledger entry chose for
`.guard-state/`. Verified at HEAD by `grep -rn` over `hooks/lib/*.ts` excluding tests:
`agentstate.yaml` at `state-drift.ts:97`, `review-coverage.ts:125`, `churn.ts:125`,
`staging-drift.ts:175`; `orchestrator-live.md` at `churn.ts:123`, `staging-drift.ts:176`;
`orchestrator-events.jsonl` at `state-drift.ts:98`, `churn.ts:124`, `staging-drift.ts:180`.

**The judgement the record asked to be made explicitly, made in the prose rather than left
implicit.** `churn.ts` and `staging-drift.ts` name these paths in exclusion and classification
lists rather than reading their contents. They are in the column, and the paragraph under the
tree now says why: what breaks on a move is the same fixed-path dependency either way.

Growth: `fusion-workbench-conventions.md` 52 549 → 52 964 bytes (+415). The always-on core is
87 510 against a floor of 86 573 and a budget of 98 573, so the hard bound has 11 063 bytes of
head-room left. Golden regenerated; the regeneration run failed deliberately (the update flag
fails by design), the fixture diff was read — only the conventions file and the per-agent totals
moved — and the re-run without the flag is green.

## 4. The halt's discriminator — HIGH, **not fixed**, and the reason is a measurement

Record: `260814-1850_*_the-halt-that-guards-the-audit-trail-rests-on-a-self-test-the-inheritance-model-denies.md`

The task said to establish the fact before editing, and to leave the code alone if it could not
be settled. Half of it settled, and it is not the half the record expected.

**What was run.** Two headless probes against the work tree, from an empty scratch directory:

```
claude --plugin-dir <repo> --agent fusion:orchestrator --dangerously-skip-permissions -p '<probe>'
claude --plugin-dir <repo> --agent fusion:shaper       --dangerously-skip-permissions -p '<probe>'
```

The first asked the top-level orchestrator whether it holds `AskUserQuestion`, then had it
dispatch `fusion:shaper` with the same question. The second asked a top-level shaper directly.
Claude Code 2.1.232.

**What came back.**

```
PARENT_HAS_ASKUSERQUESTION=no
CHILD_HAS_ASKUSERQUESTION=no
TOPLEVEL_SHAPER_HAS_ASKUSERQUESTION=no
```

**What that decides, and what it does not.**

- **Decided: the discriminator is unsound.** `agents/shaper.md:55` reads "if you do not hold it
  you were dispatched". A top-level `--agent fusion:shaper` run does not hold it. That is a
  direct counterexample: the tool's absence does not mean dispatch, it means the session has no
  interactive channel, which a headless top-level run also lacks. The self-test conflates "can I
  ask the user?" with "did a user start this run?", and those are different questions.
- **Not decided: whether a sub-agent dispatched from an *interactive* session inherits the
  tool.** Both probes ran headless, where the top level holds no `AskUserQuestion` either, so
  the dispatch inside the first probe is confounded — the child's `no` is explained by the
  parent's `no` and says nothing about inheritance. This is the direction the halt actually
  depends on, and it stays unmeasured.
- **Consequence for the inheritance sentence.** `README-agents.md:97` and `CLAUDE.md:28` were
  **not** edited. The measurement gives no evidence against them: parent and child agreed in the
  one run that tested inheritance. Editing them would have been the guess the task forbade.

**The failure mode the measurement exposes is the safe one, and the dangerous one is still
open.** A top-level headless run misreads itself as dispatched and halts for a missing
`**Initiated by:**` on a run the user personally started — noisy, not silent. The silent
direction, a dispatched run that holds the tool and waives the audit line, was not reachable
from here.

**Proposed discriminator: none, because the sound fix is to have none.** Both routes into mode 3
already carry the mode contract — `agents/shaper.md:47` says the top-level user runs it "with
the mode contract below", so a top-level run already types `**Mode:**` and `**Circle file:**`.
Requiring `**Initiated by:**` on every mode-3 run costs that user one more line and removes the
self-test entirely. That is candidate 2 in the record, and it changes the contract rather than
repairing it, so it is the user's call at a gate. Left for the orchestrator to file.

## Files changed

- `/Users/k1/Projects/productive/fusion/README-agents.md`
- `/Users/k1/Projects/productive/fusion/agents/orchestrator.md`
- `/Users/k1/Projects/productive/fusion/rules/fusion-workbench-conventions.md`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/rules-emission.golden`

Not changed, deliberately: `agents/shaper.md`, `CLAUDE.md`.

## Verification

`cd hooks && npm test` — exit 0. 49 files, 1 030 tests, all passing.
