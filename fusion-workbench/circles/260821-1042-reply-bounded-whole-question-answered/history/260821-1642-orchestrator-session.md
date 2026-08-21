# Orchestrator Session — 260821-1642

**Directive:** An agent's answer is bounded as a whole and it answers the question that was put.
Taken from the Circle record's `## Directive`, which holds prose because `**Active spec/plan:**`
reads `(none yet)`.
**Mode:** (not yet resolved — Phase 0 pending)
**Status:** Setup complete, awaiting scope resolution

## Setup snapshot

**Circle:** `circles/260821-1042-reply-bounded-whole-question-answered`, activated this session
from anticipated to active via `/fusion:next`.
**Workbench:** `/Users/k1/Projects/productive/fusion/fusion-workbench`
**Git HEAD at start:** `e764637`
**Turn budget:** 12
**Domain:** code

This is the second session in this chat. The first ran with no Circle active and resolved every
store to `shared/`; it is recorded at `shared/history/260821-1219-orchestrator-session.md` and
did the curator pass on the normative surfaces. This session begins where that one left the tree,
with the Circle now active, so every `OUT_*` resolves into the Circle and every `SCAN_*` carries
the Circle store and the shared one.

### Open state at start

Across both stores: 170 open defects (94 shared, 76 in Circles), 11 open decisions in Circles,
1 plan in progress. The Circle's own stores hold 4 answered decisions and no open ones — its four
scoping questions were settled before it started.

### What the portfolio flagged before activation

Four items, carried here because they bear on how this Circle may work rather than on whether it
should start.

1. **Two of four growth budgets are effectively spent**, and this Circle's stated method writes
   into all four. Measured at `e764637`: `skills/*/SKILL.md` 30 bytes of head-room, the hook test
   suite 21 lines, `agents/*.md` 1 638 bytes, the always-on rule set 3 507 bytes. Two moved down
   during the previous session's work. The Circle's Directive already answers this in principle,
   by requiring the work to arrive as a rewrite of what the corpus says rather than as an
   addition.
2. **Four open defects write into surfaces with no room** and have not moved in eleven hours.
   They are filed and unfixable until somebody takes the cut.
3. **Three decisions this Circle cites still read as open**, all in the closed style-rules Circle,
   and two of them are answered by this Circle's own records. Nobody has moved the markers.
4. **The Circle record carries no `## Closure note` heading.** The closing agent has to add it
   before a closure note can land.

Two further items are portfolio-wide and unrelated to this Circle: three decision records exist
twice because an unexpanded wildcard entered a filename (filed `260821-0430`, open), and
`portfolio.md` cannot meet the em-dash ceiling because four of its em-dashes are forms other
shipped surfaces mandate.

## Commit rhythm: a deviation from the plan's Testing Strategy, decided by the user

The plan regenerates the rules golden once, at step 6. Step 2 landed and left `npm test` at
exit 1 on two size-recording fixtures, which collided with the orchestrator's rule never to
commit over a red tree.

Put to the user as a conflict between those two rules, which was the wrong cut, and answered
"green at each step". The user then asked whether that had been hasty. It had, and the framing
was the reason: the substantive question is not which rule wins but whether it helps to pin
numbers that are transient by construction. Step 5 takes a cut sized to what steps 2 and 3 spend,
so `rules/user-facing-output.md` is expected to return to about its starting size; pinning 20 787
now, something else after step 3 and something else again after step 5 is three approvals for a
net effect near zero, each needing to be read. The hook-test line golden is the exception and
moves genuinely: the attribution comments are permanent.

Re-put, and answered: **collect, and commit once when green.** That gives a green HEAD at every
commit and a single fixture diff, which the first framing had presented as mutually exclusive.
Its real cost is that steps 2 to 6 sit uncommitted until the end, and that a run abandoned midway
leaves work whose grouping has to be reconstructed. The loss risk stated in the first gate was
overstated: files are files, and every executor dispatch in this Circle forbids whole-tree git
commands.

Consequence for the remaining steps: P2 is not committed on its own. P3 to P6 run, step 6
regenerates both goldens over whatever the superseded regeneration left, and the whole of steps
2 to 6 is committed at the end in splits by concern, with the suite green.
