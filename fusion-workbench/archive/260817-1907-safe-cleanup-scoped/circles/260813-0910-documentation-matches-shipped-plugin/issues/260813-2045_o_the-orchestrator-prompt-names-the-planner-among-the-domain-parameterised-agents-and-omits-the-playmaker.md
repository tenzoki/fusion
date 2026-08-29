# The orchestrator prompt names the planner among the domain-parameterised agents, and omits the playmaker

**Filed:** 2026-08-13 20:45
**Filed by:** coder (Circle `260813-0910-documentation-matches-shipped-plugin`, plan step 6)
**For:** coder
**Status:** open

## What is wrong

`agents/orchestrator.md:153` says the detected workbench domain is "used as the default `domain` parameter for `taskplanner`, `reconciler`, and `planner` dispatches in this session". Two things in that sentence disagree with the prompts:

- **`planner` parses no `**Domain:**` line.** `agents/planner.md` `## Parameter parsing` (`:47-55`) declares exactly two parameters, `**Executors:**` and `**Circle:**`. The string "Domain" appears nowhere in the file as a parameter; its three occurrences (`:27`, `:33`, `:89`) are prose about strategic-domain work.
- **`playmaker` does take it and is not named.** `agents/playmaker.md:25-27` and `:36-38` declare the `**Domain:**` parameter with the same four values and the same `code` default as `taskplanner` and `reconciler`, and the orchestrator itself passes it at `:850` ("Use `Agent(fusion:playmaker)` with the prompt prefix `**Domain:** …`") and documents that pass at `:1398`.

The same prompt contradicts its own line 153 forty-seven lines later: `:200` says to "pass it as the `executors` selection cue to `planner`", which is what `:377` then actually does.

## Why it is filed rather than fixed

Plan step 6 corrected the identical claim on the four surfaces in its file scope — `CLAUDE.md:14`, the `CLAUDE.md` dispatch-parameter bullet, `docs/philosophy.md:19`, and the new `README-agents.md` `## Dispatch parameters` table. `agents/orchestrator.md` is a fifth carrier of it and is outside that step's scope, so correcting it here would have been an unreviewed edit to an agent prompt during a documentation pass.

## What the fix is

Rewrite `agents/orchestrator.md:153`'s parenthetical to name `taskplanner`, `reconciler` and `playmaker`, and to say that the planner receives the domain as an `**Executors:**` cue rather than as a `domain` parameter — which is what `:200` already says. One line; no behaviour changes.

## Not to be confused with the design question

Whether `agents/planner.md` *should* accept a `**Domain:**` parameter is open and filed separately as `260813-1820_*_should-the-planner-accept-a-domain-parameter-that-three-documented-surfaces-already-promise.md`. This issue is only that the orchestrator prompt describes a mechanism the prompts do not have.

---
Reconciled: 260813-2258-reconciliation.md — Still open, re-verified at HEAD `c0e4219`: `agents/orchestrator.md` still names "`taskplanner`, `reconciler`, and `planner`" in its detect-workbench-domain step. The four in-scope surfaces were corrected — `CLAUDE.md:16` and `docs/philosophy.md:19` both now read `taskplanner, reconciler, playmaker` — so this prompt is the last carrier of the old membership.
