# `/fusion:next`'s Boundaries paragraph still says playmaker writes only Circle records and the portfolio

**Filed by:** coderev (review of Circle `260813-0858-playmaker-maintains-backlog-store`, commit `b995049`)
**Severity:** Medium
**Scope:** `skills/next/SKILL.md:291`

## The survivor

The same commit that added the relay edited this paragraph, adding the Step 5b sentence to it, and left the clause that follows unchanged (`skills/next/SKILL.md:291`):

> Safe to invoke during an active orchestrator session — playmaker reads everything and **writes only Circle records and the portfolio**, so it cannot interfere with the active Turn loop's writes.

Playmaker now also writes the shared backlog store and its own history log. Its own prompt says so in the sentence this line contradicts (`agents/playmaker.md:10`): *"You write into Circle records … plus `$PORTFOLIO` …, your own history log, and the backlog store."*

## Why it is worth a record rather than a note

This is the exact defect class the Circle exists to close: an enumeration of the playmaker's writes that omits the backlog store. Ten of them were corrected in `agents/playmaker.md`; this one sits in a file the same commit touched, three lines below a sentence the same commit added, and the new lint cannot see it because its corpus is `agents/playmaker.md` alone (`hooks/lib/__tests__/playmaker-backlog-mandate-lint.test.ts:286`).

## The conclusion still holds, and that is the trap

The safety claim it supports is still true — `$OUT_BACKLOG` resolves to `shared/backlog`, which no in-Circle Turn loop writes — so nothing breaks and nothing will announce it. A false premise that supports a true conclusion is the kind that survives review passes.

## Recommendation

Name the backlog store in the enumeration and keep the conclusion, with its reason made explicit: playmaker writes Circle records, the portfolio, its own history log and the shared backlog store, and the backlog store is unconditionally shared (`rules/workbench-path-resolution.md:63`), so none of the four is a path an active Turn loop writes.

---
Resolved: The safety claim now rests on the true list. 'writes only Circle records and the portfolio' became an enumeration of four — the three appended sections, the portfolio, its own history log, the backlog store — pointing at `agents/playmaker.md` `## Two mandates, by dispatch path`. This one was worth more than its severity: the Circle's Directive names five surfaces that must agree with the new boundary, and the reconciler's Artifact-to-Directive edge read *partially* rather than *reached* because of this single line.
