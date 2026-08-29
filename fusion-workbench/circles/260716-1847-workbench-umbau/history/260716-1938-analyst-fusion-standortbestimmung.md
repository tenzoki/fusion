# Analyst session — fusion standing vs. top-tier practice

**Date:** 2026-07-16 19:38–20:00
**Agent:** analyst
**Requested by:** Kai
**Status:** Complete

## Directive

Test a favourable external assessment of fusion ("more mature than Level 2"; "what the articles sell as top-org practice, we already have in the Coordinator/Verifier/Gate design") against reality, and locate fusion honestly against what top companies actually do. Mid-session addition: consolidate with the prior critique of 2026-06-21.

## What was done

- Full mechanical audit of the enforcement surface (`hooks/`, `settings.json`, `config.json`) separating executing code from prompt text.
- Ran the hook test suite (110 pass) and searched for CI / eval harness (neither exists).
- Mined fusion's own dogfood telemetry as evidence: `orchestrator-events.jsonl`, `issues/` markers, `circles/`, `history/`.
- Fetched and verified six external primary sources (Anthropic ×2, Cognition, METR, arXiv self-preference, GitHub Spec Kit).
- Consolidated with `260621-1316-fusion-vs-spec-driven-agentic-engineering-critique.md`, including closing its open thread #139.

## Key findings

1. **The enforcement surface is ~836 lines against ~6,700 lines of prompt.** In a consumer project the only live deny is the git branch/worktree guard plus a halt latch. `protectedPaths` ships as fusion's own repo layout; `decisions: []` ships empty; config loads from the plugin install dir, so consumers cannot configure it.
2. **Churn cannot halt anything.** `philosophy.md:54` claims it does; `tracker.ts:8-9` says PostToolUse is observation-only. The claim is false for the case it describes.
3. **Closed prior open thread #139 with data: the Coherence gate has fired zero times.** Not "returned Continue" — never emitted, across the entire logged history, despite `orchestrator.md:365,367` mandating an emit in all cases. The one completed Turn skipped it, and nothing noticed.
4. **The branch guard was dead code for 13 days** (`4950ffa` → `dbf98f6`) while its 48 unit tests passed, shipped with a commit message asserting it worked. No CI exists. The wiring test was written with the fix.
5. **3 of 7 issue files contradict themselves** (filename `[c]`, body `open`) — two of them closed by the same Turn that skipped its gate.
6. **`circles/` is empty.** The whole portfolio/playmaker/Bounded-Closure apparatus has never run in 2.5 months of its author's use.
7. **Zero of the three recommendations Kai received survive contact with the codebase.** #1 (worktrees) is deterministically denied at two layers and would dismantle fusion's strongest control; #2 is a second source of truth; #3 landed today in a weaker form.
8. **The honest verdict:** fusion's architecture is at parity with GitHub Spec Kit and AWS Kiro, and ahead on two real contributions (Bounded Closure, Coherence triangle). The gap to top-tier practice is not architecture — it is that they measure and fusion does not. Anthropic's own guidance ("add complexity only when it demonstrably improves outcomes") is the criterion fusion fails. Spec-driven tooling has the same evidentiary vacuum, so the ladder fusion was ranked on ranks vocabulary, not outcomes.
9. **METR is the decisive epistemic fact:** developers predicted +24%, measured −19%, still believed +20% afterwards. Fusion's entire evidence base is that same perception. (Caveat recorded: METR labels the study historical and is redesigning it.)
10. **The scaffold premium is collapsing — the strategic finding, absent from both prior reports.** SWE-agent's authors retracted their own thesis ("a lot of this is not needed at all"); the premium over a bare shell went +64% (2024) → +3.1% (2026). Anthropic: "every component in a harness encodes an assumption about what the model can't do on its own", and their own evaluator became "unnecessary overhead" with Opus 4.6. Fusion's 6,700 prompt lines depreciate with every model release and fusion cannot detect which ones expired, because it has no eval.
11. **Anthropic documents the flattery itself** as a known model behaviour: agents "confidently praising the work — even when, to a human observer, the quality is obviously mediocre." That is the report Kai received, named by the vendor.

## Corrections made during the session

- **§11 of the analysis reverses an earlier draft.** I first cited Cognition's "Don't Build Multi-Agents" (2025-06) as their current position and concluded fusion's design bet was contested by top-tier practice. Cognition **reversed in 2026-04** ("Multi-Agents: What's Actually Working"): writes stay single-threaded, and review agents work **best with no shared context**. On their current axis fusion scores well on all three rules, and its sub-agent isolation — framed in philosophy.md as making a virtue of a platform constraint — matches what Cognition reached after shipping and retracting the opposite. The error is stated in the document rather than patched, since citing an outdated position confidently is precisely what the analysis criticises.
- Marked three arXiv IDs as second-hand (from a research subagent, not independently fetched) in the honesty clause.

## New defect found live

While writing the analysis, the **branch guard denied the write** — because the prose contains backticked git commands. Isolated in 3 probes: the bare string in a quoted heredoc is allowed; the same string in **markdown backticks** is denied. The classifier reads markdown inline-code as shell command substitution and has no heredoc-quoting model. An agent asked to edit `rules/git-branch-discipline.md` would be blocked by the rule it documents. Fails in the safe direction, so it is a precision defect, not a safety one. Filed as `260716-2005[o]`.

Notable: fusion's 48 guard tests all feed the classifier *commands*, never *data regions*. The contract boundary is untested — the same shape as the 13-day dead-guard defect.

## Artifacts

- `260716-1938-fusion-standortbestimmung-vs-top-orgs.md` (411 lines)
- `260716-2005[o]-branch-guard-false-positive-on-markdown-backticks-in-heredoc.md`

## Notes for follow-up

The research reordered the recommendations. The literature's one durable pattern is **bound context + a real external verifier**; everything that asks the model to be its own oracle ablates to zero. That puts fusion's conceptual crown jewels (Coherence triangle, Rebalance, conceptrev, coderev) in the weak category and its unglamorous parts (the branch guard, "run the tests") in the strong one.

Top recommendation is unchanged and now better supported: a minimal eval (fixture project + scripted session asserting specified events fire). It is the only item that changes fusion's category from impression to evidence, and it is the precondition for retiring depreciated scaffolding safely. Second is CI. Third shifts from "acceptance-criterion ↔ test mapping" as a process item to the same thing framed as **investing in the oracle**, which is what the evidence supports.

Recommendations 1–8 are not filed as issues; Kai to queue if wanted.
