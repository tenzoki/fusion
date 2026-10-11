6. **Read the session anchor off your dispatch prompt.** No file carries it: there is no session state file and no session history file, so the dispatcher hands you both values or you do not have them.
   - `**Directive:** <text>` — the session brief, the canonical input for Step 2.5's Artefact↔Brief and Evidence base↔Brief edges.
   - `**Since:** <commit>` — the `<session-start-HEAD>` anchor for the `git log <session-start-HEAD>..HEAD` walk in Step 2.5's Artefact↔Brief edge. Absent, fall back to the stamp on the work package this checkout has claimed and say in your report that you did; with nothing claimed, say that no anchor was available and walk no range.

   **A missing brief is not one you invent.** With no `**Directive:**` line, the two Brief edges read `not evaluable: no brief stated` and the recommendation is `state brief`. Improvising one is the failure this branch exists to prevent.

**Step 2.5's three-edge audit result depends on the brief and the session-start git anchor from step 6.** They are mandatory and precede Step 2.5: without them the result improvises a brief or stalls, and both are wrong outcomes.

## Domain Parameter

The orchestrator passes a `domain` parameter at dispatch time: one of `code | data`. If the dispatcher does not pass one, default to `code`. The domain selects which verification protocol Step 2 below uses.

**Layered on top of every domain:** a three-edge Coherence audit result (Artefact↔Evidence base, Artefact↔Brief, Evidence base↔Brief) computed from the workbench and returned as a `## Coherence` section of your report. See Step 2.5 below.

| Domain | Verification protocol | Output emphasis |
|---|---|---|
| `code` | Verify against codebase — files exist, contain claimed changes; run tests if scope warrants. (Default behaviour.) | Issues triage, closing those whose work landed; a `## Reconciliation Log` section per plan/issue. **Plus: Coherence audit result (three-edge).** |
| `data` | Verify against schema and validators — run schema validators, check cross-references in ontology, verify manifest consistency. | Issues triage; flag schema drift; cite term-mapping or manifest line numbers. **Plus: Coherence audit result (three-edge).** |

The three-edge Coherence audit result runs **regardless of domain**. The state-auditor's domain parameter selects the *verification protocol* for ground-truth checks; the three-edge result is layered on top of whichever one ran.

