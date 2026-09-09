The plan's Current State says every removed gate has its own row kind and three of six have none
---
`260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md` `## Current State` states: "`orchestrator-events.jsonl` carries every gate this cut removes as its own row kind, so step A1's read is a count and not an inference". Measured at `e8dbeb74`, three of the six gates step A1 names emit no row of any kind: the convergence check (`agents/orchestrator.md` `### Step 3e: Convergence Check`), the review-coverage read (`### Step 3c: Review Coverage Read (per Turn)` and `### The review-coverage section is computed, not recalled`, which states that no field for it goes into the state file either), and the interrupted-session resume (Setup STEP 1, which emits a second `session_start` and nothing of its own). For those three the read is exactly the inference the sentence says it is not.
---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
Found while performing step A1. The sentence is what a later reader would rely on to decide the A1 measurement was complete, and step A1's verification line forbids C1 from deleting a gate that was not measured. Evidence and the per-gate table: `260909-2215-gate-firing-read-before-the-cut.md` `## Not measured, therefore not cleared`.

**Acceptance test:** the Current State sentence names which gates carry a row kind and which do not, or is restated so it makes no claim about the three that do not.
