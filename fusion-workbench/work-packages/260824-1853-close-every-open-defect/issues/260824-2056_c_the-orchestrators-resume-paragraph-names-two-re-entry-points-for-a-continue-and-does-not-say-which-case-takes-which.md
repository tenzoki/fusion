The orchestrator's resume paragraph names two re-entry points for a Continue and does not say which case takes which
---
`agents/orchestrator.md:103` (commit `d5c34cd`, step 12) now reads, in one paragraph: "You re-enter it mid-flight, at the dashboard refresh (Phase 2 step 4)" and, three sentences later, "an `uncovered` count above zero over the interrupted Turn's commits means that Turn's review never ran, and a **Continue** then re-enters at Step 3c rather than at Phase 3." The first sentence gives Phase 2 step 4 as the re-entry point for every Continue. The second contrasts Step 3c with Phase 3, which implies a Continue that would otherwise re-enter at Phase 3, a case the paragraph never states (it is, presumably, the interrupted Turn whose `work_queue` holds no unfinished task). The split is left to the reader: a Continue with unfinished tasks and `uncovered > 0`, a Continue with none and `uncovered = 0`, a Continue with none and `uncovered > 0`. The `Resolved:` note on the record this closed (`…whether-the-turn-it-skips-past-was-reviewed.md`) says the coverage read now decides the re-entry; it decides one of the three.
---
**Filed by:** coderev (person half absent: the installed plugin at `$FUSION_PLUGIN_ROOT` carries no `bin/fusion-identity`, so attribution was dropped rather than composed)

Fix direction: three lines, one per case: unfinished tasks remain → Phase 2 step 4, whatever the coverage read says (Step 3c runs at the Turn's end as usual); none remain and `uncovered = 0` → Phase 3; none remain and `uncovered > 0` → Step 3c. State the case split as disjoint and complete, per `rules/critical-stance.md` §4.

Severity: Low.
---
Resolved: fixed — the paragraph states the three cases as disjoint and complete: an unfinished task remains → Phase 2 step 4 whatever the count says; none and `uncovered` 0 → Phase 3; none and `uncovered` above 0 → Step 3c, then Phase 3; `agents/orchestrator.md:119`
