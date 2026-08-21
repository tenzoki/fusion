# The whole reply is bounded, and it answers the question that was asked

---
**Domain:** code
**Filed by:** shaper (anticipated-circle mode)
**Active spec/plan:** (none yet)
**Active session history:** circles/260821-1042-reply-bounded-whole-question-answered/history/260821-1642-orchestrator-session.md

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
`shared/analyses/260816-0740-rhetorical-register-of-agent-output.md` finding 10 measured.

## Grounding snapshot

Everything below was measured on 2026-08-21 at HEAD `472134c` with a clean working tree. The
command is given wherever a figure is. Figures carried in from another document are marked as
such and are not restated as this Circle's own measurements.

### What the previous Circle settled, and what it left standing

`circles/260820-2051-style-rules-arrive-and-get-measured` closed in Bounded Closure. It brought
the always-on rule corpus to its stated em-dash ceiling and gave the fact-first requirement in
`rules/user-facing-output.md` `## Self-review before sending: the readability gate` a failure
condition. Its own final measurement,
`circles/260820-2051-style-rules-arrive-and-get-measured/history/260821-0350-coder-the-final-state-is-measured.md`,
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
`shared/issues/260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`.
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
`shared/history/260820-2103-orchestrator-session.md` `## What this session got wrong` was cited
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
`shared/decisions/260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
is answered at option 4, chosen by the user: repair the corpus, then measure, then re-open the
gate question with a number. Its reconciliation of 2026-08-19 states the consequence directly,
that no gate is authorised until the measurement runs. That measurement is registered and
deferred, with the threshold fixed at 5.0 prose em-dashes per 1000 prose words and the pre-repair
window frozen by path in
`circles/260820-2051-style-rules-arrive-and-get-measured/analyses/260820-2354-prose-register-measurement-protocol.md`.

**This Circle does not deliver that measurement either, and the reason is its subject.** The
protocol excludes from both windows any history file written by a session primed on the subject
being measured. A Circle about prose register primes every writer it dispatches, so its own
history files would be as unusable as the previous Circle's, and section 5 of the protocol
already had to make that exclusion symmetric to keep the threshold meetable. The protocol may be
read and must not be amended, and its post-repair window is opened by the commit that closed the
previous Circle rather than by anything this one does.

### The decision this Circle overturns

`circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2314_*_does-this-circle-take-the-structural-half-of-the-verbosity-record.md`
answered option 2, leave the verbosity record whole and record the reason. It was filed open and
answered by the orchestrator during an unattended run, and its own closing paragraph says it is
not the user's answer. **The user has now overturned it.** This Circle takes both halves of that
record together with the register patterns underneath them. A later reader meeting that decision
should read it as reversed rather than as forgotten, and the reversal is dated 2026-08-21.

The reconciliation appended to
`shared/issues/260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`
on 2026-08-21 anticipated exactly this branch: it kept the record open rather than deferred,
naming the two outcomes as the user confirming the deferral or overturning it. The second
happened.

## Dependencies

No other Circle. Every one of the thirteen Circle records on disk carries a terminal marker,
verified by reading the marker off each `circles/*/*_circle.md`.

Artifacts in other Circles and in `shared/` that bind this one, cited rather than copied per the
Origin Rule:

- `shared/issues/260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`
  is the record this Circle closes. Both halves.
- `shared/decisions/260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
  forbids a prose gate until its measurement runs.
- `circles/260820-2051-style-rules-arrive-and-get-measured/analyses/260820-2354-prose-register-measurement-protocol.md`
  is read and never amended.
- `circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260821-0414_*_does-a-corpus-repair-circle-carry-a-budget-for-what-its-own-new-clauses-may-spend.md`
  is open and asks precisely what this Circle's own new clauses may spend. It is question 1 of
  the batch this Circle was filed with, and its answer sets the arithmetic the Directive states
  only as a shape.
- `circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2314_*_is-claude-md-inside-the-corpus-this-circle-repairs.md`
  parked the register repair of `CLAUDE.md` for the Circle that runs the measurement. This Circle
  does not run it, so whether that repair belongs here is open and is question 3 of the batch.
- `shared/analyses/260816-0740-rhetorical-register-of-agent-output.md` is the inventory of the
  thirteen figures and the source of the imitation mechanism the Directive rests on.
- `shared/issues/260812-0253_*_rules-lose-their-effect-during-a-long-dispatch.md` is adjacent and
  is not taken here. A rule that decays over a long dispatch and a rule that was never stated are
  different faults with different fixes.

## Turn log

## Activation proposal

**Proposed by playmaker run `260821-1536-playmaker-direct-dispatch`, 260821-1536, domain bias
`code`.** Proposed activation timestamp: 260821-1536. This is a proposal and nothing more. The
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
Circle: `circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2314_*_does-this-circle-take-the-structural-half-of-the-verbosity-record.md`,
`circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2314_*_is-claude-md-inside-the-corpus-this-circle-repairs.md` and
`circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260821-0414_*_does-a-corpus-repair-circle-carry-a-budget-for-what-its-own-new-clauses-may-spend.md`.
This Circle's own answered records settle the substance of the second and the third, and its
Grounding states that the user overturned the first. The records themselves were never transitioned,
so a later reader meets three open questions that are answered elsewhere. Recorded here as an
observation; moving a decision marker is not this agent's act.
