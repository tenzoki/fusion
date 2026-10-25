```

A pass that halted or returned nothing usable advances no mark: the mark claims coverage, and coverage that was not performed is the one thing it must never claim.

## Step 5 — Report

Action-first, per `rules/user-facing-output.md`:

1. **What the pass changed** — the tracking files the agent updated, by kind and count, and every state it moved.
2. **What it flagged and did not change** — discrepancies it reported, every record it filed, and each decision it found implemented on disk, by record and commit: the orchestrator sends that transition, this body none.
3. **The Coherence audit result** — the aggregate word and the three edge lines, as the agent wrote them (`agents/state-auditor.md` `## Coherence`). An edge reading `not evaluable: <reason>` is reported with its reason, never as a pass.
4. **What this run stood on** — the domain and where it came from, whether a brief was passed, and the anchor the walk used or that none was held.

