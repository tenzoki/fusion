---
description: Reconcile the workbench's tracking files against ground truth. Dispatches the reconciler once, reports what it changed and the three-edge Coherence verdict it returned, and advances this checkout's reconcile mark. Writes no record and commits nothing.
argument-hint: "[<directive text>] [--since <commit>] [--domain code|data] [--force]"
allowed-tools: [Bash, Read, Agent(fusion:reconciler)]
---

# Fusion — reconcile (tracking files against ground truth)

The user invoked `/fusion:reconcile`. This body performs one procedure: it dispatches `fusion:reconciler` once, reads what comes back, and reports it. **It runs no other pass, reads no other skill body, and dispatches nothing else.**

**It writes one thing and no more**: this checkout's reconcile mark, after the pass returns. Every change to a plan, a defect record or a review is the agent's, made under `agents/reconciler.md` `## Scope`, and every one of them is left in the working tree — this body commits nothing and pushes nothing. `/fusion:cleanup` is what commits, when the user runs it.

**It holds no gate.** The reconciler returns a Coherence verdict; this body prints it. Deciding what to do about a verdict that is not `coherent` is the Rebalance gate, which belongs to a session that has a Directive to rebalance (`rules/orchestrator-rebalance.md`). A command that reports cannot also rule.

## Arguments

All four are optional, and a bare `/fusion:reconcile` is the ordinary invocation.

- `<directive text>` — the session Directive, in the user's own words. It is what the reconciler's two Directive edges are evaluated against.
- `--since <commit>` — the anchor the ground-truth walk starts from. Absent, this body reads the checkout's own reconcile mark; absent that too, the reconciler falls back to the stamp on the work item this checkout claimed and says so.
- `--domain code|data` — overrides the detected domain.
- `--force` — dispatch even when nothing has moved since the last pass (Step 3).

## Step 1 — Workbench root

```bash
ROOT="$("$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root")" || { echo "No fusion workbench above $(pwd). Run /fusion:setup first."; exit 1; }
cd "$ROOT"
```

Halt on a non-zero exit and tell the user to run `/fusion:setup` at the project root. Bootstrap nothing from here.

**No store path is resolved.** This body names no workbench record, and the reconciler resolves its own write and search targets at its own Setup.

## Step 2 — The three values the dispatch carries

**Domain.** The `--domain` argument when one was given, else the helper, guarded — its own header carries the contract and the meaning of every `source=`:

```bash
if [ -x "$FUSION_PLUGIN_ROOT/bin/fusion-session-domain" ]; then "$FUSION_PLUGIN_ROOT/bin/fusion-session-domain"; else printf 'domain=code\nsource=helper-missing\n'; fi
```

Hold `domain=` and `source=`. **Report the source beside the value, never the value alone**: a defaulted domain and a read one are different facts, and this body decides neither — it obtains one.

**Directive.** The argument text, verbatim, or nothing. **Invent none.** With no Directive on the dispatch the reconciler's two Directive edges read `not evaluable: no Directive stated` and its recommendation is `state Directive` — that is a complete run with a narrower verdict, not a failure, and Step 5 says so in one line rather than hiding it.

**Since.** The `--since` argument when one was given, else this checkout's mark:

```bash
[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-cadence-anchor" ] && "$FUSION_PLUGIN_ROOT/bin/fusion-cadence-anchor" get last_reconcile_commit
```

Exit 1 with nothing printed means no mark is held. Then pass no `**Since:**` line at all — an empty one is worse than an absent one, because the agent's own fallback never runs.

## Step 3 — Has anything moved?

```bash
[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-cadence-anchor" ] && "$FUSION_PLUGIN_ROOT/bin/fusion-cadence-anchor" changed-since last_reconcile_commit
```

A proven `changed=no` is the one answer that skips the dispatch: report that nothing under the tracking corpus has moved since the last pass, name `--force` as the way to run anyway, and stop. `changed=yes`, `changed=unknown` and a missing helper all dispatch — a skipped pass rests on a proven bound and on nothing weaker. `--force` dispatches whatever the line said.

## Step 4 — Dispatch the reconciler

Use the `Agent` tool with target `fusion:reconciler`. The parameter lines come first, in this order, each on its own line, and a value this run does not hold is **omitted rather than emptied**:

```
**Domain:** <code|data>
**Directive:** <the user's text>
**Since:** <commit>
```

Then the task in one sentence: reconcile every tracking file against ground truth and return the three-edge Coherence verdict. `agents/reconciler.md` `## Domain Parameter` defines how the first is read and `## Setup` step 6 the other two; do not restate either here, and do not re-decide any part of them.

Wait for the agent. When it returns, and only then, advance the mark:

```bash
[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-cadence-anchor" ] && "$FUSION_PLUGIN_ROOT/bin/fusion-cadence-anchor" set last_reconcile_commit "$(git rev-parse HEAD)"
```

A pass that halted or returned nothing usable advances no mark: the mark claims coverage, and coverage that was not performed is the one thing it must never claim.

## Step 5 — Report

Action-first, per `rules/user-facing-output.md`:

1. **What the pass changed** — the tracking files the agent updated, by kind and count, and every marker it moved.
2. **What it flagged and did not change** — discrepancies it reported, and every record it filed.
3. **The Coherence verdict** — the aggregate word and the three edge lines, as the agent wrote them (`agents/reconciler.md` `## Coherence`). An edge reading `not evaluable: <reason>` is reported with its reason, never as a pass.
4. **What this run stood on** — the domain and where it came from, whether a Directive was passed, and the anchor the walk used or that none was held.

Close with the one line that says the edits are uncommitted and `/fusion:cleanup` is what commits them.

## Boundaries

- **Dispatches `fusion:reconciler`, once.** No second dispatch, no other agent, no fallback pass of its own when the agent returns badly — an unusable return is reported as one.
- **Writes the reconcile mark and nothing else.** No record, no tracking file, no session state.
- **Commits nothing and pushes nothing.**
- **Opens no gate and asks nothing.** A run typed and walked away from finishes.
