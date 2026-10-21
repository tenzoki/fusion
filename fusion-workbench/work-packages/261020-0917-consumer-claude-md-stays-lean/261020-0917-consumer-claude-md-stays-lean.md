# A consuming project's CLAUDE.md stays a pointer file: no agent grows it unchecked, and a grown one can be relocated

## Directive

Filed on the user's word of 2026-10-20 in chat. The user asked: "wie geht fusion mit CLAUDE.md um? Eigentlich sollten da nur Pointer gespeichert sein. Und es sollte eine bei curate oder cleanup überprüft und bereinigt werden. […] Ich will nicht, dass du die Datei verkleinerst, sondern prüfst, warum so etwas passiert und was bei fusion falsch läuft." After the analysis `261020-0835-why-a-consumers-claude-md-grows-unchecked.md` and the eight issues filed from it, offered "Die acht Issues als ein Arbeitspaket bündeln, claimen und den Planner einen Plan machen lassen", the user answered "1". Mode ordinary: the plan is put to the user for approval.

The work is the eight open issues stamped `261020-0916-` in the shared issue store:

- `261020-0916-lean-claude-md-rule-reaches-no-agent-that-writes-claude-md.md` (the main cause, prevention)
- `261020-0916-plan-steps-write-claude-md-past-every-approval.md`
- `261020-0916-reviewer-claude-md-drift-findings-always-route-to-a-text-fix.md`
- `261020-0916-curate-cannot-ask-for-a-placement-run.md` (relocation route)
- `261020-0916-claude-md-weight-helper-points-at-a-command-that-cannot-act.md`
- `261020-0916-claude-md-check-never-runs-in-orchestrator-sessions.md`
- `261020-0916-claude-md-over-threshold-finding-persists-nowhere.md`
- `261020-0916-curator-corrections-carry-no-byte-delta.md`

Reached when: an agent that writes a consumer's CLAUDE.md is told what may go there and where topic-bound content goes instead; a weight finding over threshold reaches the user in an ordinary session and leads to a command that can relocate content; each of the eight issues is closed against its acceptance line or recorded as declined. krk's own CLAUDE.md is not edited by this work; its relocation stays the user's decision. Where a fix collides with fusion's growth bounds, the plan names the cut or the head-room ruling it needs and the user decides at plan review.

---
Closed 2026-10-21: done, outcome completed. Commit range 74bc9661..4b238e90 (plan steps 1-8: 93d28b29, 65ca17d9, 91395e02, 006c73cd, 6c49365d, e985638c, 7e081eb6, 8c3e046e; review follow-on 4b238e90). The closing review `reviews/261021-0829-reviewer-consumer-claude-md-stays-lean-closing.md` returned revise; its four findings were fixed in 4b238e90 and closed, but no second review read that commit, so the evidence record still carries revise and a `succeeded` edge on this item stays unmet. Commits no review opened: 74bc9661, 4f17492a, 8c486ede, c7f7f971 (workbench records only), and 4b238e90. Not opened by the review: the two golden fixtures. The pin BASELINE attribution for steps 5 and 7 was inferred, not measured. All eight stop-condition clauses confirmed as holding by the user. Follow-on: package `261021-0832-curate-placement-gets-a-measured-trigger` (decision 261021-0821, deferred). Release 13.3.0 is separate work.
