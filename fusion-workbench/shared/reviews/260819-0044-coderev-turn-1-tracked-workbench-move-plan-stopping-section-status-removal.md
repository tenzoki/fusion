# Code review — session 260818-2301, Turn 1

**Reviewed-range:** `52b1d95..b54ace5`
**Not-opened:** `hooks/dist/lib/staging-drift.js`, `hooks/dist/lib/staging-drift.d.ts`, `hooks/lib/__tests__/fixtures/rules-emission.golden`, `hooks/lib/__tests__/fixtures/surface-growth.golden`

The first two are build output of `hooks/lib/staging-drift.ts`, which was opened; the two goldens
were opened as diffs against the range's base commit rather than in full. Every other file in the
range was opened.
**Date:** 2026-08-19
**Reviewer:** coderev
**Test state:** `npm test` in `hooks/` green at `b54ace5` — 36 files, 672 tests

## Summary

Three answered decisions were realised across two commits, and all three realisations are
substantively correct: the tracked-workbench split moved cleanly with its heading kept behind as a
pointer, the plan-stopping section and its Phase-4 reader are honest about binding nobody, and the
`**Status:**` removal held exactly to its stated two-file change surface and hand-corrected nothing.
Eleven findings, one High. The High one is that the positive reason decision `260816-1707` was
answered on — that the archive skill *reads* the new rule and says so — is asserted in the skill's
prose and implemented by no step of it. The dominant pattern in the rest is the same one twice: a
change made precisely inside a declared change surface, with the surfaces just outside it that state
the same fact left standing.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 7 |
| Low | 3 |

All eleven are filed under `shared/issues/`; ten are new files, one is an `Also seen:` line on a
record a concurrent task had already filed.

## Findings by theme

### The move's citation surface

**M1 — `.gitignore` still says the conventions file states the split.** `.gitignore:65-66` asserts
"The split and its two consequences … are stated in `rules/fusion-workbench-conventions.md`". After
the move that heading holds two sentences of pointer. The citation does not dangle, because the
heading was deliberately kept, and that is precisely why no gate saw it: `reference-resolution-lint`
asks whether an anchor exists, not whether it still holds the definition. This repository's
`.gitignore` is the worked instance of the first of the two consumers the decision names.
`260819-0038_o_the-gitignore-comment-still-says-…`

**M2 — two shipped surfaces still say "four topics".** The conventions file's own lead-in was
correctly changed to five topics / six files. `CLAUDE.md:44` and `README-agents.md:271` were not, and
the README copy enumerates the four by name, so the new file is absent from the one user-facing list
of the partitioned rule files — and that sentence's closing clause, "each emitted only to the agents
that apply it", is now false as a universal. No `derivable-enumerations-lint` case covers the
partition table. `260819-0038_o_two-shipped-surfaces-still-say-four-topics-…`

**Everything else repointed correctly.** A tree-wide grep for the old anchor string returns only the
retained heading itself, one test comment quoting it, and workbench records describing past state.
Both `skills/archive/SKILL.md` citations and both `hooks/lib/staging-drift.ts` comments were moved.

### The no-agent emission, and whether its justification holds

**H1 — the archive skill says it reads the new rule and no step reads it.**
`skills/archive/SKILL.md:11` states "**This skill reads `rules/workbench-tracking.md`**". Step 1
runs `bin/fusion-paths archive` and nothing else; Process steps 1-9 never name the file; a skill
receives no rule emission, which is the premise the decision itself opens with. Nor does any
behaviour depend on it — safety filter 1 enumerates the reserved surfaces in the skill's own words
and cites the *layout tree*, and the guard-log roll states the evidence classification in full before
citing the file. Delete the rule file and the skill behaves identically. The decision's own Cons
column had named this risk; the realisation answered it with a claim rather than a mechanism. Two
fix shapes, and they are not equivalent — one makes the sentence true, the other makes it accurate
and weakens the distinction `260816-1707` drew against the two existing no-agent files.
`260819-0039_o_the-archive-skill-says-it-reads-the-new-rule-…`

**M3 — the root-entry enumeration is now a cross-file duplicate.** The new rule re-lists the ten
root entries the layout tree owns. They tile exactly at HEAD — checked — but the second landing site
for a new root-anchored surface is now a different file, emitted to nobody, that a coder adding one
has no reason to open. Closed defect `260810-0504` part 2 objected to this duplication when the two
sat ten lines apart; `260814-1419` is the recorded instance of the pair drifting. The move answers
that record's audience objection and worsens its duplication objection. Filed with three fix shapes
because the choice is a decision, not an edit.
`260819-0042_o_the-move-turned-an-adjacent-duplicate-enumeration-…`

### The plan-stopping section and its Phase-4 reader

The step is correctly placed — after the marker is determined at step 2, before the rename at step 3
— it says outright that it is a question and not a check, it reuses `gate_hit`/`gate_response`
rather than inventing an event type, it carries a failed clause into the `## Closure note` so the gap
outlives the chat, and it states plainly what it cannot cover: a release tagged mid-Circle has
already gone out. All four of the things asked about check out.

**M4 — the section is neither mandatory nor guarded against its own stub.** Its sibling
`**Decidability:**` is declared "mandatory and never left empty"; this one is declared nothing.
Step 2b routes three cases — no plan, no section, section with clauses — and the fourth is unrouted:
section present, holding only the angle-bracket placeholder, which falls to *Otherwise* and is read
aloud to the user as a clause. A MECE gap in the sense `rules/critical-stance.md` §4 makes a defect
of. The failure mode is measured in this repository: the defect closed in the same range is titled
for twelve records keeping the unfilled template stub. A secondary scope question rides along — the
heading says "this Circle" and the format is used for plans written with no Circle active.
`260819-0039_o_the-new-plan-section-is-neither-mandatory-…`

**M5 — `gate_hit` is emitted with no fixed reason.** The step says "with the reason" and names no
string; the orchestrator's other explicit `gate_hit` names its reason verbatim. The consequence is
not cosmetic: `260817-1613` closes "Option 3 stays available if option 2 is measured and misses", and
a free-text reason in the one durable cross-session log makes that miss rate uncomputable. The
per-clause answers also fall outside the documented `gate_response` vocabulary, which is the same
class as open issue `260811-2306`.
`260819-0040_o_phase-4-step-2b-emits-gate-hit-with-no-fixed-reason-…`

**Not a defect, but worth recording.** The user chose fork 1 of `260818-2343` — add the section so
every plan carries it — and step 2b nevertheless keeps fork 2's conditional for a plan that carries
no such section. That is the right call for plans written before this commit, and it makes the
decision's sentence "the Phase-4 step always has something to read" true only going forward. The
prompt is more careful than the record; no change wanted in the prompt.

### The `**Status:**` removal

The position on existing records is stated in the shipped text, at
`rules/fusion-workbench-conventions.md:524-530`, and it was honoured: a diff of every workbench
record in the range for added or removed `**Status:**` lines returns nothing. Four decision records
were transitioned to `_i_` in this range and all four still carry `**Status:** open`, which is the
behaviour the position prescribes. `rules/decision-record-examples.md` carries a pointer rather than
a second copy of the reasoning, which is the right shape.

**L1 — the position carves an exception it never defines.** "Leave it exactly as it stands" is
unconditional; its justification is scoped to "a record you are **not** transitioning", which invites
the reading that a record you are transitioning may be corrected — the only case an agent ever meets.
`skills/next/SKILL.md:224` states the same rule without the clause and is unambiguous; the clause is
inherited from `agents/orchestrator.md:298-303`. Three shipped places, two of them always-on rule
text, and dropping the qualifier shrinks two of them.
`260819-0041_o_the-status-position-carves-an-exception-…`

**M6 — no migration surface, while the identical Circle-record removal got three.**
`docs/upgrading-to-v10-2.md`, `README.md:28` and `skills/help/SKILL.md:101` all announce the Circle
record's `**Status:**` removal and all three are scoped to the Circle record. v10.2.0 is already
tagged at `e14b6ca`, an ancestor of this range, so this change lands in a version an installed base
upgrades into with nothing telling it. The answering decision was right to state its change surface
as two rule files; the gap is that nothing carries the release-time obligation forward, and it has no
gate because it is triggered by a property of the diff rather than by a step.
`260819-0041_o_the-decision-record-status-removal-got-none-of-the-three-…`

**L2 — the `## Project language` example is now the worst available one.** It offers "a record's
`**Status:**`" as an example of a label defined in a shipped template; after this range no record
kind carries the field. Already filed by a concurrent task as `260819-0028_o_…`; I reached it
independently and appended an `Also seen:` line adding only that the passage is in an always-on rule
file, so it ships on every dispatch.

### Measurement honesty

**M7 — the always-on byte figures are mislabelled.** `260816-1707`'s `Implemented:` footer says "The
always-on rule set falls 98 874 -> 95 458 bytes per dispatch". Both figures are the `[analyst]` block
of `rules-emission.golden`, which includes the conditional `design-diagrams.md` (4 834) and excludes
the chat voice profile (7 353) — a fixed 2 519-byte offset, and the exact substitution `CLAUDE.md`
warns against by name. Measured over the five unindented `emit_if_exists` files plus the chat
profile:

```
52b1d95   101 393     claimed  98 874
b200902    97 977     claimed  95 458
b54ace5    98 796     claimed  96 277
```

`./bin/fusion-rules coder | xargs wc -c` gives 98 796 at HEAD in one command. The deltas are right;
the movement is −3 416 then **+819** — the second commit raised the floor — netting −2 597 off a base
2 519 bytes higher than claimed. Same class as open issue `260816-1345`, with the same two
memberships wrong in the same two directions, which makes it a property of the golden rather than of
either author. `260819-0040_o_the-implemented-note-labels-the-analyst-dispatch-total-…`

**The `reference-resolution-lint` baseline moves are sound.** Both re-approval notes follow the
file's own convention — date, what changed, per-component movement, how measured — and both were
committed together with the constant they justify, in `b200902` and `b54ace5` respectively; the
committed history shows no bump standing without a note. The first pins its measurement worktree to
`52b1d95` by hash, names the `agents/*.md` concurrency it excluded, and explains both the +16-against-+10
interaction and the two negative contributions rather than leaving them to be re-derived. The second
explains two zero contributions that would otherwise read as errors. `{1152, 149, 102}` is verified
by the suite being green at HEAD.

**L3 — the staging-drift comment repoint left two ragged lines** (`:85-88`, `:165-169`), four and
three words wide in a file that otherwise runs to the column, and it reached the committed
`dist/`. Content correct, purely cosmetic.
`260819-0042_o_the-staging-drift-comment-repoint-left-two-ragged-lines-…`

## Cross-cutting observations

**One cause produced four findings.** M1, M2, M6 and L2 are all the same shape: a change realised
precisely inside a declared change surface, with a surface *outside* it that states the same fact
left standing. In three of the four the outside surface still resolves — the heading was kept, the
example is not strictly false, the migration notes are correctly scoped to what they described — so
no gate reports anything and `npm test` is green through all of them. This is the class open issue
`260811-1734` names, and the range gives it four fresh instances in two commits. The discipline that
would have caught it is not a lint: it is asking, at the end of a realisation, which surfaces outside
the stated change surface describe the thing that just changed.

**Two findings are the same gap in a decision's own escape hatch.** H1 and M5 both concern a decision
that named the condition under which it would be revisited — "nothing then guarantees the archive step
reads it" and "option 3 stays available if option 2 is measured and misses" — and a realisation that
did not build what makes the condition observable. Neither is a wrong answer; both are answers whose
falsification route was left unbuilt.

**The move's arithmetic is honest and its labelling is not.** The per-file contribution figures in
both baseline notes are careful to the point of explaining their own interaction terms, while the
headline byte figure in the decision footer names the wrong set entirely. Precision in the gate's
comment block and imprecision in the record a human reads is the wrong way round.

## Recommended sequencing

**Before the next release** — M6, because it is a release-time obligation with no carrier and the
precedent is fresh enough to be visible today. M2, because `README-agents.md` ships and its
enumeration is missing a file.

**Next Turn, cheap and self-contained** — M1 and the already-open `260816-1051` together, one edit to
the same two `.gitignore` lines. L1, one clause across three files, shrinking two. L3.

**Wants a decision, not a fix** — H1 (make the sentence true or make it accurate, and if the latter,
re-read `260816-1707`), M3 (three fix shapes, option 1 recommended at low confidence).

**Wants one small clause each** — M4 and M5, both in the two prompts this range already touched, both
adding no mechanism.

**Not a release blocker.** Nothing in this range breaks a flow, loses data, or changes what any hook
decides. The suite is green and the three realisations do what their decisions approved.
