# Orchestrator Session — 260804-1407

**Directive:** Build C5b — plan Steps 6, 7 and 8. The project-level `fusion-guard.json` loader, the template and this repository's own copy, and the `/fusion:setup` seeding. This is the half of the Circle's Directive that has never been started.
**Mode:** plan
**Status:** In progress
**Predecessor session:** `circles/260801-1244-guard-rules-write/history/260804-1243-orchestrator-session.md`

## Why this, now

Eleven sessions have gone into hardening the guard's shell classifier, which the Circle kept
meeting while working near its Directive. The Turn-10 review's ledger put this at the top and
said plainly what the record showed: C5b appears in no issue store, is visible only in one
line of the plan file, and a Coherence verdict cannot be clean against a Directive whose
second half was never built. The user chose to build it.

Deliberately not in this session: `260804-1344` and `260804-1345`, the two High fail-opens
still open in the shell classifier. They gate plan Step 10, the ship, and not this work.

## What makes these three steps awkward

**Eleven of the Circle's twelve acceptance criteria describe behaviour in a *consuming*
project**, and the write guard stands down in this repository. Nothing here can be verified by
editing a file and seeing what happens; every check has to run through the integration harness
against a throwaway project root. The Circle's own record named this at activation as the most
likely way the work ships broken.

**Step 7 routes to `ontocoder`** and is therefore a human gate by project convention.

**Three decision records have waited on Step 6 since the Circle began.** Step 6's design
answers at least one of them by construction (the self-protection floor), and the others may
turn out to be genuinely open. Surfacing which is part of the step, not a follow-up.

## Per-Turn Log

(Turn in progress.)
