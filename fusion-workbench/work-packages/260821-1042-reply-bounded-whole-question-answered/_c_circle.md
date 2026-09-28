# The whole reply is bounded, and it answers the question that was asked

---
**Domain:** code
**Filed by:** shaper (anticipated-circle mode)
**Active spec/plan:** (none yet)
**Active session history:** 260822-0019-orchestrator-session.md

---

## Directive

An agent's answer is bounded as a whole and it answers the question that was put. After this
Circle the rules and prompts every agent reads at dispatch state a budget for a complete reply,
so material that will not fit is dropped rather than relocated to a trailing Details block, and
they require the answer to address the question asked, so a lookup returns the location the user
wanted and whatever the agent noticed alongside it reaches them as a filed record rather than as
more of the reply. The three register habits that make a reply long are named where an agent
reads them, each with its shorter form beside it: an enumeration written for rhythm rather than
for a count that is real, one statement given again in a second and a third formulation, and an
agent's account of its own work delivered at the length of the work. All of it arrives by
rewriting what the corpus already says rather than by adding to it, because a text that says
"say less" in more words teaches the register it forbids, which is the mechanism
`260816-0740-rhetorical-register-of-agent-output.md` finding 10 measured.

## Grounding snapshot

Everything below was measured on 2026-08-21 at HEAD `472134c` with a clean working tree. The
command is given wherever a figure is. Figures carried in from another document are marked as
such and are not restated as this Circle's own measurements.

### What the previous Circle settled, and what it left standing

`260820-2051-style-rules-arrive-and-get-measured` closed in Bounded Closure. It brought
the always-on rule corpus to its stated em-dash ceiling and gave the fact-first requirement in
`rules/user-facing-output.md` `## Self-review before sending: the readability gate` a failure
condition. Its own final measurement,
`260821-0350-coder-the-final-state-is-measured.md`,
reports the six emitted files at 8 prose em-dashes over 13 292 prose words, a rate of 0.6 per
1000 against a ceiling of 1.0.

The em-dash was one figure of thirteen. The register analysis inventories twelve more, and nine
of the thirteen describe how a sentence is built rather than how it is punctuated: correctio
(a term stated and then withdrawn), prosopopoeia with the agentless passive, the verbless
fragment, the parallel refrain, concessio with reported speech, the unglossed metaphor,
sententia as a closing aphorism, and the evaluative opener. None of them is treated by a
repunctuation pass, and the analysis says so in its own implications: a text built from these
figures cannot be concise, because concision would remove the figures.

### The two rule gaps this Circle closes

**No rule bounds a reply as a whole.** `rules/user-facing-output.md` `## Length` caps each
surface separately and then instructs the writer to move what exceeds a cap into a Details
block. Relocation is not removal, so a reply can satisfy every cap in that section and still run
to any length.

**No rule requires the answer to match the question.** `## Questions and gates` governs what an
agent asks the user. `## Information architecture` orders the parts of a reply. `## Length` caps
its pieces. Nothing states that the reply answers what was asked, which is the structural half of
`260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`.
That record carries a worked specimen in which every sentence of a sixty-line reply is true and
the reply is still the wrong answer to a two-line lookup.

### Where the three register patterns already stand

| Pattern the user named | What names it today | What is missing |
|---|---|---|
| Enumeration rhythm | AI04 in both chat profiles and in both writing profiles, as the mechanical tricolon | The rule reaches a three-item list inside a sentence. It does not reach a reply whose default shape is an enumeration. |
| The same statement in three formulations | Nothing | `## Vocabulary` `One name per thing` governs synonyms for one entity, not restatements of one claim. The writing profile's AI09 governs parallel syntax, not repeated content. |
| An agent reporting on its own work at length | `## Length` caps a session summary header at 10 lines | Nothing bounds an agent's chat account of what it just did, which is the surface the specimens below are made of. |

### A reproducible specimen source exists, and it is outside the repository

Chat replies persist nowhere in the workbench, which is why neither `## Length` nor the
question-scope defect has ever been measured. They do persist in the Claude Code session
transcripts at `~/.claude/projects/<project-slug>/*.jsonl`, one JSON record per line. A
user-facing reply is an `assistant` record that is not a sidechain and carries a `text` content
block.

Measured over the 69 transcripts this project holds, 2231 such replies, of which 398 exceed the
12-line cap in `## Length`. That is 17.8 per cent, and it is a floor rather than an estimate:
the denominator counts every top-level text block including the one-line narration an executor
writes between tool calls, so the share of substantive replies over the cap is higher than the
figure and this measurement does not say by how much.

Three recent sessions, read the same way, show the pattern undiluted. The session ending
2026-08-20 20:40 wrote six replies of 23, 26, 38, 36, 31 and 45 lines, every one over the cap.
The session ending 2026-08-20 21:01 wrote three, one of them 19 lines. The session that filed
this Circle wrote three, of 44, 15 and 17 lines. Every substantive reply in all three exceeds the
cap that is loaded into the agent writing it.

**One correction to the record that prompted this Circle.**
`260820-2103-orchestrator-session.md` `## What this session got wrong` was cited
as recording the over-length pattern. It does not. It records four faults of a different kind,
all of them claims that came apart from what they described. The length pattern is real and the
transcripts above are its evidence; that history file is not.

### The four growth budgets, measured

Computed at HEAD `472134c` against the baseline maps declared in the two test files that bound
these surfaces, by summing the current files the same way each test does.

| Surface | Unit | Now | Floor | Head-room | Budget | **Remaining** |
|---|---|---|---|---|---|---|
| Always-on rule set | bytes | 95 007 | 86 573 | 12 000 | 98 573 | **3 566** |
| `agents/*.md` | bytes | 416 205 | 399 843 | 18 000 | 417 843 | **1 638** |
| `skills/*/SKILL.md` | bytes | 240 409 | 220 439 | 20 000 | 240 439 | **30** |
| Hook test suite | lines | 20 343 | 17 875 | 2 500 | 20 375 | **32** |

The four are independent by construction, so a cut in one buys nothing in another. Two are
effectively exhausted. Any capability that adds a clause to a skill body needs a cut budgeted in
the same plan, and so does any capability that adds a test file.

The always-on figure reproduces with `for f in agent-setup fusion-workbench-conventions
decision-record-examples user-facing-output critical-stance; do wc -c < rules/$f.md; done`
summed against the floor of 86 573 declared in
`hooks/lib/__tests__/rules-emission-golden.test.ts`.

### The trap this Circle has to walk past

The previous Circle spent more on new rule prose than its repair returned, and both figures come
from its own final measurement note. The repunctuation returned **470 bytes** across four rule
files. Its two new style clauses, the fact-first condition and the foreclosure clauses, spent
**1 939 bytes**, which is 4.1 times the return. A third addition, the asset-provenance layout row
in the conventions file, spent a further 669 bytes on an unrelated subject, and the three
together give the 5.5 ratio that appears in the record that filed this Circle. The ratio that
bears on a style Circle is **4.1**, because the layout row was not style prose.

A Circle whose subject is concision and whose method is adding clauses is its own counter-example,
and the register analysis says the same thing from the other side: a sixth prohibition added to
`rules/user-facing-output.md` adds sixth-prohibition-shaped prose to the corpus every agent
imitates.

### Two constraints that bind before the work starts

**No prose gate may be built.**
`260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
is answered at option 4, chosen by the user: repair the corpus, then measure, then re-open the
gate question with a number. Its reconciliation of 2026-08-19 states the consequence directly,
that no gate is authorised until the measurement runs. That measurement is registered and
deferred, with the threshold fixed at 5.0 prose em-dashes per 1000 prose words and the pre-repair
window frozen by path in
`260820-2354-prose-register-measurement-protocol.md`.

**This Circle does not deliver that measurement either, and the reason is its subject.** The
protocol excludes from both windows any history file written by a session primed on the subject
being measured. A Circle about prose register primes every writer it dispatches, so its own
history files would be as unusable as the previous Circle's, and section 5 of the protocol
already had to make that exclusion symmetric to keep the threshold meetable. The protocol may be
read and must not be amended, and its post-repair window is opened by the commit that closed the
previous Circle rather than by anything this one does.

### The decision this Circle overturns

`260820-2314_*_does-this-circle-take-the-structural-half-of-the-verbosity-record.md`
answered option 2, leave the verbosity record whole and record the reason. It was filed open and
answered by the orchestrator during an unattended run, and its own closing paragraph says it is
not the user's answer. **The user has now overturned it.** This Circle takes both halves of that
record together with the register patterns underneath them. A later reader meeting that decision
should read it as reversed rather than as forgotten, and the reversal is dated 2026-08-21.

The reconciliation appended to
`260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`
on 2026-08-21 anticipated exactly this branch: it kept the record open rather than deferred,
naming the two outcomes as the user confirming the deferral or overturning it. The second
happened.

## Dependencies

No other Circle. Every one of the thirteen Circle records on disk carries a terminal marker,
verified by reading the marker off each `circles/*/*_circle.md`.

Artifacts in other Circles and in `shared/` that bind this one, cited rather than copied per the
Origin Rule:

- `260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`
  is the record this Circle closes. Both halves.
- `260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
  forbids a prose gate until its measurement runs.
- `260820-2354-prose-register-measurement-protocol.md`
  is read and never amended.
- `260821-0414_*_does-a-corpus-repair-circle-carry-a-budget-for-what-its-own-new-clauses-may-spend.md`
  is open and asks precisely what this Circle's own new clauses may spend. It is question 1 of
  the batch this Circle was filed with, and its answer sets the arithmetic the Directive states
  only as a shape.
- `260820-2314_*_is-claude-md-inside-the-corpus-this-circle-repairs.md`
  parked the register repair of `CLAUDE.md` for the Circle that runs the measurement. This Circle
  does not run it, so whether that repair belongs here is open and is question 3 of the batch.
- `260816-0740-rhetorical-register-of-agent-output.md` is the inventory of the
  thirteen figures and the source of the imitation mechanism the Directive rests on.
- `260812-0253_*_rules-lose-their-effect-during-a-long-dispatch.md` is adjacent and
  is not taken here. A rule that decays over a long dispatch and a rule that was never stated are
  different faults with different fixes.

## Turn log

Seven Turns across two sessions. The first session's entries are aggregate: it recorded no per-Turn
commit boundaries at the time, and inventing them now from the log would be a reconstruction dressed
as a record.

- Turns 1-3 (session 260821-1642-orchestrator-session.md): commits `2907907`..`084c626`, 15 in all, beginning with this
  Circle's own activation. Coherence verdict `review-needed` with a Bounded-Closure recommendation,
  on the ground that one stopping criterion was unmet and unmeetable. That recommendation was not
  acted on and is superseded by the second session's verdict. Session history:
  `260821-1642-orchestrator-session.md`
- Turn 1 (session 260822-0019-orchestrator-session.md): commits `e202016`..`63e5ad5`, six. The commissioned measurement, two
  defect closures, the unreleased-manifest filing, and two reviews returning twelve findings.
  Coherence gate not run separately; the Turn ended into the review pass.
- Turn 2 (session 260822-0019-orchestrator-session.md): commit `53ff99f`. Nineteen marker-literal citations repaired and the
  plan closed.
- Turn 3 (session 260822-0019-orchestrator-session.md): commits `c964062`, `746ae4d`, `055585f`. Five of the twelve review
  findings closed, including the one rated High.
- Turn 4 (session 260822-0019-orchestrator-session.md): commit `05b46f2`. The briefing's broken contamination test warned
  off, a scratch directory cleared.
- Final reconciliation (session 260822-0019-orchestrator-session.md): verdict `coherent` with residuals named, superseding
  the first session's Bounded-Closure recommendation. Session history:
  `260822-0019-orchestrator-session.md`

## Activation proposal

**Proposed by playmaker run `260821-1536-playmaker-direct-dispatch`, 260821-1536-playmaker-direct-dispatch.md, domain bias
`code`.** Proposed activation timestamp: 260821-1536-playmaker-direct-dispatch.md. This is a proposal and nothing more. The
record's marker is untouched, and `.active-circle` is untouched. The rename is the user's, through
`/fusion:next`, or the orchestrator's.

**Why this Circle, and it is the only candidate.** It is the sole anticipated Circle on disk. Every
other Circle record carries a terminal marker, so the ranking has one entry and the recommendation
carries no comparison behind it. What follows is a readiness reading rather than a ranking.

**It is ready on all three readiness signals this run measures.** Its `## Dependencies` section names
no Circle, so nothing is waiting on a predecessor and no dependency flag applies. Its own decisions
directory holds four records at answered (`_a_`) and none at open (`_o_`): the four scoping questions
were put and settled before the Circle starts, which is the condition the ranking heuristic looks
for. Its Grounding snapshot is measured rather than asserted, and it names the command behind each
figure.

**One qualification, and it is about the surfaces rather than the Circle.** The Grounding's own
growth table was measured at `472134c`. This run re-measured it at `e764637` and three of the four
budgets moved down: the always-on rule set now has 3 507 bytes of head-room rather than 3 566, the
hook test suite 21 lines rather than 32, and `skills/*/SKILL.md` is unchanged at 30 bytes.
`agents/*.md` is unchanged at 1 638. Two of the four are effectively spent, and this Circle's stated
method writes into all four. Whoever activates it should read those four figures as current rather
than reading the table in the Grounding, which is nine hours old and was correct when written.

**Three decisions its Grounding cites still read as open.** All three sit in the closed style-rules
Circle: `260820-2314_*_does-this-circle-take-the-structural-half-of-the-verbosity-record.md`,
`260820-2314_*_is-claude-md-inside-the-corpus-this-circle-repairs.md` and
`260821-0414_*_does-a-corpus-repair-circle-carry-a-budget-for-what-its-own-new-clauses-may-spend.md`.
This Circle's own answered records settle the substance of the second and the third, and its
Grounding states that the user overturned the first. The records themselves were never transitioned,
so a later reader meets three open questions that are answered elsewhere. Recorded here as an
observation; moving a decision marker is not this agent's act.

## Closure note

**Closed coherent on 2026-08-22**, after seven Turns across two sessions. Session history:
`260822-0019-orchestrator-session.md`.
Final reconciliation:
`260822-0234-reconciliation.md`,
verdict `review-needed` on the Circle's account of itself rather than on its work, with the four
writes it prescribed made before this note was written.

**The plan this Circle ran on** is
`260821-1805_*_plan-reply-bounded-whole-question-answered.md`.
It is named here because the record's `**Active spec/plan:**` field could not carry it: the decision
governing that field, `260821-2004_*_what-happens-to-the-directive-when-the-plan-a-circle-runs-on-deliberately-does-not-state-one.md`, is deliberately left open, so the field stays at `(none yet)`
and this note is where a reader finds the plan.

**Why closed-coherent and not Bounded Closure.** The first session's reconciliation recommended
Bounded Closure because one stopping criterion was unmet. That recommendation is superseded. Bounded
Closure means the Directive was judged unreachable, and it was reached: the rule corpus now bounds a
whole reply, requires the answer to address the question put, and names all three register habits
with their shorter forms, each verified line by line at HEAD. Spending `_b_` on a self-imposed budget
condition is the reading
`260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`
rejected as devaluing the marker, and option 1 of that record says what to do with a residual of this
kind: name it here.

**Three residuals, named rather than resolved.**

1. **One of six stopping criteria does not hold and cannot.** The plan required that no growth bound
   stand closer to failing than at HEAD `e764637`. The hook-test surface has 15 lines of head-room
   against 21 at that anchor. No commit in either session touched a file under `hooks/`; the six
   lines went to an attribution comment the pinning file's own convention asks for, and a note
   costing zero lines is no note. Recorded in
   `260821-2204_*_a-growth-bound-lost-half-its-head-room-against-a-stated-stopping-criterion-and-the-finding-lives-only-in-a-history-log.md`,
   which stays open because what it now holds is a judgement for a later Circle, not an unapplied fix.
2. **One commit in the range carries no review, and structurally cannot.** It is the commit that adds
   the last review file; a review cannot cover the commit that introduces it. Every other commit in
   `084c626..HEAD` is tiled by four review files that declare their ranges.
3. **The Directive was reached and its effect is unobserved.** The rule text landed and nobody has
   seen whether a reply changed. That is why
   `260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`
   stays open, and why the after-measurement defined in
   `260822-0035-three-before-figures-and-the-after-measurement-defined.md`
   is defined and deliberately not run. It needs twenty unprimed sessions before a difference means
   anything. **A later reader should not mistake a landed clause for a changed reply.**

**What this Circle produced that its Directive did not ask for.** The measurement its own Grounding
said it could not deliver is delivered: three before-figures with their commands, an after-measurement
specified to the point of being mechanical, and a stated count for when its result would mean
something. The before-state is uncomfortable and is the point of having taken it. Agent replies in
this project run at 10.0 prose em-dashes per 1000 words against a ceiling of 1.0 that the corpus
states for itself, and 17.9 per cent of replies exceed a cap that is loaded into the agent writing
them.

**Two questions left for the user, both recorded rather than answered in an unattended run.**
Decision `260821-2004_*_what-happens-to-the-directive-when-the-plan-a-circle-runs-on-deliberately-does-not-state-one.md` binds every future Circle and was not answered here, because a decision of
exactly this class was answered by an orchestrator in an unattended run and overturned by the user on
2026-08-21; that reversal is in this record's own Grounding snapshot. And whether the verbosity record
above may be called closed at all is the user's, on the same reasoning the first session gave.
