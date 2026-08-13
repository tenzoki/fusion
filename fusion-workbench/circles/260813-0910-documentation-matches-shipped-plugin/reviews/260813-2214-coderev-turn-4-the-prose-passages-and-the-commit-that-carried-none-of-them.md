# Code review — Turn 4: the prose passages, and the commit that carried none of them

**Date:** 2026-08-13
**Sender:** coderev
**Reviewed-range:** `93388bc..c663a1f`
**Not-opened:** none
**Circle:** `circles/260813-0910-documentation-matches-shipped-plugin`
**Files as dispatched:** `docs/working-model.md`, `docs/philosophy.md`, `skills/help/SKILL.md`, `README-agents.md`

## Summary

The three Turn 3 closures hold, including the high one: the two playmaker rows exist, their
`Declared at` citations are exact, and the reading behind the `Passed by` column reached the skill
bodies as claimed. The commit split is clean — `27af85a` and `c663a1f` together carry everything
both messages describe, and nothing was lost between them. Six new findings, all in the prose
written this Turn and none in what the closures fixed: three in the newly authored `§1`/`§5b` of
`docs/working-model.md`, including one entrance that no shipped prompt performs; two in the
`README-agents.md` rows added by the closure itself; one citation. `docs/philosophy.md` and
`skills/help/SKILL.md` are clean — every claim in both was re-read against the skill body it names.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 3 |
| Low | 2 |

## The three Turn 3 closures — verified independently

Each was re-checked against the artifacts, not against the `Resolved:` note.

**`…roster-omits-the-two-lines-the-playmaker-relay-carries` (High) — holds.** `README-agents.md:61-62`
carry `**Confirmed operations:**` and `**Proposal source:**`. Their citations are exact:
`agents/playmaker.md:207` is the declaring prose, `:209-217` the block form, `:216` the
`**Proposal source:**` line, `:219` the stamp check. The closure corrected the *issue's own*
citation in passing — the issue cited `:217` for the stamp check, which is the block's closing
fence; `:219` is the paragraph. The `If absent` cell for `**Proposal source:**` is the most careful
work in the table: it names the three refusals `:219` defines and says an omitted line is not among
them, which is true and is not something the prompt states for you. The relay note at `:72` matches
`agents/playmaker.md:205` and `:219` sentence for sentence. Two defects were introduced inside the
fix — see findings 4 and 6.

**`…passed-by-column-was-read-against-the-agent-prompts-only` — holds.** Every citation added to
that column resolves to the line it claims: `agents/orchestrator.md:377`, `:392`, `:438`, `:649`,
`:850`, `:1397`; `skills/cleanup/SKILL.md:147`; `skills/next/SKILL.md:103`;
`skills/direct/SKILL.md:70-72`; `skills/seed-from-plane/SKILL.md:92-94`, `:97`. The two missing
skills are in. One incompleteness left standing, below the filing bar: `skills/next/SKILL.md:168`
passes `**Domain:**` in the Step 5b block as well, so that parameter has two passing sites in the
skill the cell names once. It is noted inside finding 4, whose fix touches the same three cells.

**`…planner-circle-row-names-the-orchestrator-as-a-passer` — holds.** Re-run rather than trusted:
`grep -rn '\*\*Circle:\*\*' agents/*.md skills/*/SKILL.md` returns `agents/planner.md:13`, `:53`,
`:55` and `skills/circle-stash/SKILL.md:170`, `:446` (a report field). `agents/orchestrator.md`
contains the string zero times. The cell now says so and cites `:377` as the orchestrator's only
planner dispatch, which passes `**Executors:**` alone. Nothing was added to the orchestrator
prompt, per the issue's own fix direction.

## The commit split — nothing lost, and the tree matches both messages

`27af85a` staged the three issue renames (`_o_`→`_c_`, `R100`, content unchanged) and the new
history file, and no content. `c663a1f` carries `README-agents.md`, `docs/philosophy.md`,
`skills/help/SKILL.md`, the three `Resolved:` bodies, the plan's step 8 and 9 completion notes, and
the event log. The union is exactly what the two messages describe together, and the second message
says so in its own first paragraph. Working tree at HEAD: `fusion-workbench/orchestrator-events.jsonl`
(runtime append) plus `stilwerk/chat-voice-de.yaml` and `-en.yaml`, both modified before this session
started and unrelated to this Turn's files.

One consequence of the split worth knowing rather than fixing: at `27af85a` the three records
carried the closed marker with no `Resolved:` line and no fix in the tree. A reader stopping at that
commit sees three defects closed and nothing done about them. The condition lasted one commit and is
gone at HEAD.

## Findings by theme

### Passages describing a mechanism the prompts do not have

**1. High — the first of three entrances says the orchestrator creates the Circle.**
`docs/working-model.md:30`. `agents/orchestrator.md` `## Scope` (`:234-249`) enumerates its Circle
writes: a Phase 4 record rename, three record sections, the `.active-circle` pointer. Creation is
not among them, and `## Circle head fields` (`:260`) lists the acts that move the head fields
without one either. The only creation site in the plugin is `agents/shaper.md:79`, inside
anticipated-circle mode, which the orchestrator never dispatches (`agents/shaper.md:43`: mode 1 is
"what the orchestrator dispatches in Phase 0b.1 today"). The document contradicts itself two lines
above — `:24`, "Most sessions run a single Circle **implicitly**" — and so does `docs/philosophy.md:35`.
The step's own history record wrote the entrance as "implicit from a request"
(`history/260813-2150-coder-…:44-45`); the shipped prose promoted *implicit* to *created*. It is
also the one entrance of the three for which that record names no artifact read, in a step that
opens by promising one per claim.
Filed: `260813-2214_o_the-first-of-three-entrances-says-the-orchestrator-creates-the-circle-and-no-shipped-prompt-creates-one.md`.

**2. Medium — the entrance count is three and `/fusion:seed-from-plane` is a fourth.**
`docs/working-model.md:28` and `:76`. That skill dispatches the same shaper mode with the same three
parameter lines (`skills/seed-from-plane/SKILL.md:85-94`) and produces the same artifact (`:101`,
`:141`). §1 counts a variant of entrance 2 as an entrance while omitting a distinct one; §2 names
`/fusion:direct` as the mode's dispatcher where there are two. `README-agents.md:247` already lists
the skill, and `README-agents.md:65`, `:67`, `:68` — written in the next commit — name it as the
passer of exactly those three parameter lines.
Filed: `260813-2214_o_the-entrance-count-is-three-and-seed-from-plane-is-a-fourth-dispatching-the-same-shaper-mode.md`.

### A true conclusion on a false premise

**3. Medium — walkthrough 5b's closing sentence.** `docs/working-model.md:156` says steps 1 to 4
"write nothing outside the backlog store and the new Circle's own directory". Step 2 is a playmaker
run, and `agents/playmaker.md:10` gives its four writes; resolved with this Circle active,
`bin/fusion-paths playmaker` puts `PORTFOLIO=portfolio.md` at the workbench root and
`OUT_HISTORY=circles/<active>/history` — inside the active Circle, which is the directory the
sentence is reassuring the reader about. The conclusion is right and `skills/next/SKILL.md:297`
carries the argument that makes it right: the active Turn loop writes none of the playmaker's four.
Filed: `260813-2214_o_the-portfolio-walkthrough-says-steps-1-to-4-write-nothing-outside-two-stores-and-the-playmaker-writes-three-more.md`.

### Defects introduced by the closure that fixed the roster

**4. Medium — the two new rows name the wrong step.** `README-agents.md:61` and `:62` say
"`/fusion:next` Step 3's second dispatch". The cited lines are right and sit under `## Step 5b`
(`skills/next/SKILL.md:153`); Step 3 (`:96-108`) makes one dispatch and says "No other parameters"
at `:106`. The same column uses "Step 3" in its skill-step sense at `:60`, so both readings live in
one table.
Filed: `260813-2214_o_the-two-new-playmaker-rows-name-step-3-for-a-dispatch-that-step-5b-makes.md`.

**6. Low — the preamble's new termination clause.** `README-agents.md:54` states that
`**Draft:**` and `**Confirmed operations:**` "both end at the next `**<Keyword>:**` line or at the
end of the prompt". `agents/shaper.md:57` states it for the first; nothing in `agents/playmaker.md`
states it for the second, and its "or at the end of the prompt" branch is unreachable for a block
that `**Proposal source:**` always follows.
Filed: `260813-2214_o_the-roster-preamble-states-a-value-termination-rule-for-confirmed-operations-that-the-playmaker-prompt-does-not-state.md`.

### Citation

**5. Low — the Origin Rule cited to `## Path Resolution`.** `docs/working-model.md:78` writes the
Origin Rule near-verbatim and points at the section next door. `rules/fusion-workbench-conventions.md:97-99`
is the rule's authoring home; `:134` carries the sentence's other half. `skills/help/SKILL.md:71`,
edited the same Turn, cites the pair correctly. The citation lint resolves the section and cannot
see that the section does not contain the claim.
Filed: `260813-2214_o_the-origin-rule-sentence-in-working-model-is-cited-to-path-resolution-and-the-rule-is-authored-one-section-earlier.md`.

## What was checked and found correct

Recorded because a documentation review that reports only defects leaves the reader unable to tell
a verified passage from an unread one.

- **`docs/philosophy.md:15`** — all four new claims re-read against their skills. `/fusion:memo`'s
  three captures (`skills/memo/SKILL.md:11-13`), one file per idea rather than an append (`:37`,
  `:110`), "the one surface a user files such an entry from" (`:153`, and
  `rules/fusion-workbench-conventions.md` `## Backlog entries`, which allows by hand as the
  non-surface alternative). `/fusion:cadence`'s three ranked lists are `skills/cadence/SKILL.md:9-13`
  and its three sources `:76-82`. No finding.
- **`skills/help/SKILL.md:58`, `:63`, `:69`** — the `/fusion:direct` route against
  `skills/direct/SKILL.md:9` and `agents/shaper.md:60` (a backlog entry is a valid draft), the
  `/fusion:memo` route against `skills/memo/SKILL.md:13`, and the workbench paragraph's backlog
  and `portfolio.md` additions against `## Backlog entries` and `agents/playmaker.md:154`. The
  file's cite-don't-recite discipline held. No finding.
- **`docs/working-model.md` §5b steps 1-5** — every playmaker and shaper claim checked against
  `agents/playmaker.md:66`, `:114`, `:117`, `:121`, `:160`, `:194-195` and `agents/shaper.md:86-100`.
  The autonomous-rename claim, the four confirmed operations, "splitting first, never for shaping",
  the `Promoted:` line and the multi-idea branch are all exact. Only the closing sentence fails
  (finding 3).
- **§5a step 5, the contradiction the executor found outside its passages** — correctly fixed. The
  new wording matches §4's own summary at `:122`, which names a high-sensitivity decision-governed
  path and an active halt as the two remaining blockers.
- **The `Declared at` column** — spot-read at nine sites: `agents/taskplanner.md:19`, `:34-36`;
  `agents/reconciler.md:28-30`, `:45-47`; `agents/planner.md:47-51`, `:53-55`; `agents/shaper.md:45`,
  `:47`, `:55`, `:57`, `:60`, `:80`, `:104`; `agents/editor.md:18-30`; `agents/playmaker.md:25-27`,
  `:36-38`. All exact.

## The two residuals, judged

**The shaper's `**Parent task:**` cell — right to leave unfiled, and the gap deserves a decision
record rather than an issue.** Verified: `grep -n "Parent task" agents/orchestrator.md skills/*/SKILL.md`
returns nothing, and `agents/shaper.md:45` does say the orchestrator's dispatch "MAY include an
optional `**Parent task:**` parameter line". The distinction drawn from the `**Circle:**` case is
real — there no artifact named the orchestrator at all, so the cell was simply wrong; here the
declaring prompt names it, and the cell now cites that source and states the gap. Nothing is broken
either way: the parameter is optional and the cell itself says "the spec output is the same either
way". What the record does not yet hold is the condition underneath — a declared optional parameter
that no shipped dispatcher passes, so in the shipped configuration it is never exercised. That is a
choice point, not a defect, and its home is `$OUT_DECISION` (`rules/fusion-workbench-conventions.md`
`## Issue and Decision Filing`), not an issue file. Right now it lives in a README cell and a commit
message.

**Step 7's non-divergence — right, and recorded in the right place.** The absence is explicit:
`history/260813-2150-coder-working-model-circle-first-flow-and-backlog.md:81`, "**Nothing in step
6's reading was found wrong**, so there is nothing to report as a divergence", with the specific
lines that were re-used named at `:73-80`. A recorded absence is what this project asks for
elsewhere (`**Not-opened:** none`, `**Active Circle:** none`), and this is one. Filing anything would
have been noise.

## Cross-cutting observation

**The Turn 3 diagnosis recurred in a different file while its instance was being closed.** That
finding's cause was named precisely: "the `Passed by` column is the one column whose ground truth
lives outside the agent prompts, and it was populated from the prompts anyway". Finding 2 is the
same mistake one document over. `docs/working-model.md` §2 was written against `agents/shaper.md`
`## Four invocation modes`, and `agents/shaper.md:57` names one dispatcher of anticipated-circle
mode where there are two — so the doc inherited the prompt's under-naming, exactly as the README
cells had. The step's own history record shows the caution was held for §5b, where two skill bodies
were read in full and the facts that exist only there were called out (`:83-87`); §1 and §2 did not
get the same treatment. **Where a document states who dispatches, who passes, or who invokes, the
agent prompt is not the ground truth** — that fact lives in the skill bodies, and the roster's new
preamble at `README-agents.md:54` is now the one place that says so. It is worth saying in the
plan's method note as well, since it has now produced findings in two consecutive Turns.

A second, smaller pattern: three of the six findings are closed counts or closed lists — "three
entrances", "writes nothing outside these two", "both end at". Every one of them was written this
Turn, and every one is falsified by one item. The Circle already carries the same shape from Turn 3
(`…twelve-rows-corrected-and-names-three-that-changed`). A closed count in prose has to be re-derived
by hand every time the thing it counts changes; the table treatment `README-agents.md` uses for the
parameter roster is the alternative, and where a table is too heavy, naming the members without a
digit costs nothing.

## Recommended sequencing

- **Before the Circle closes:** findings 1, 2 and 3. All three are in `docs/working-model.md`, all
  three are in passages authored this Turn, and finding 1 is a reader-facing claim about the most
  common path through the tool. One pass over §1, §2 and the last line of §5b closes all three.
- **Same pass, different file:** findings 4 and 6 are two cells and one clause in
  `README-agents.md`, both introduced by the Turn 3 closure. Cheapest to fix while the reading is
  fresh, and finding 4 should re-check the `**Domain:**` cell for the Step 5b passing site noted
  above.
- **Cleanup:** finding 5, one citation.
- **Not this Circle:** whether `agents/orchestrator.md` should carry a `**Parent task:**` line, and
  whether `agents/shaper.md:57` should name both dispatchers of anticipated-circle mode. Both are
  prompt changes; both are worth a decision record.

## References

- Range reviewed: `93388bc..c663a1f` — `a489966`, `27af85a`, `c663a1f`.
- Issues filed: six, all `260813-2214_o_*` under this Circle's issue store.
- Out of scope by dispatch and not re-filed: the two Turn 1, three Turn 2 and three Turn 3 findings
  still open.

---

**Reconciled 260813-2258.** Six findings filed, all six closed in Turn 5's commit `c0e4219`, and each closure re-checked against the artifact at HEAD rather than against its note: `docs/working-model.md:28` (no entrance count, `/fusion:seed-from-plane` as item 3, and the orchestrator entrance replaced by "A request you hand the orchestrator creates no Circle"), `:80` (the Origin Rule cited to `## Origin Rule`, `## Path Resolution` kept only for the mid-run resolution), `:158` (the disjointness premise replacing the two-store one), `README-agents.md:54` (the two termination bounds stated separately) and `:61-62` (Step 5b, not Step 3). All six hold. **The commit that closed them is itself unreviewed** — `bin/fusion-review-coverage` reports `c0e4219` uncovered, and it is the only uncovered commit in the range that touches shipped files.
