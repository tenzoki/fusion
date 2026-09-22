# Pre-tag review: the orchestrator's reach opens, and three statements say it did not

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `c2a12973..9783a5e6`
**Not-opened:** none
**Carried forward:** nothing. The previous pass (`260913-0824-reviewer-prerequisites-confirmed-once-order-computed.md`, range `1208ceb6..c2a12973`) recorded `**Not-opened:** none` and `carried=none`, and `bin/fusion-review-coverage` confirms `carried-from` resolves to that file with an empty list.

**Review domain:** code.

## Summary

`e422bf99` implements its ruling correctly in the mechanical half: the `tools:` line is gone, the
frontmatter is `name` and `description` like the other ten, the four prose bans are deleted, the
positive rule is stated once in the always-on corpus, and both surviving exclusions now say in
their own text that nothing enforces them. `claude plugin validate` and the smoke run cover the
loading question that v2.8.1 failed; I did not re-run them and take the release commit's word,
which is the one claim in this report I have not checked myself.

The text half has three defects and they run in one direction: the rule as written says more than
the ruling ruled, and the sweep that corrected the statements the ruling made false found five and
left three. Two of the three missed statements sit where they will be read first — the
orchestrator's own Role paragraph, and the doc `/fusion:help` points at.

Five findings. Two measurement claims spot-checked against the tree; both exact.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 3 |
| Medium | 2 |
| Low | 0 |

## The four questions the dispatch asked

**1. Does the new always-on section say what the ruling ruled?** On the grant and the ban, yes,
faithfully. On the gate, one clause was widened. The ruling's prohibition is on an agent that
"leaves a `gate_response` in the log with nobody having been asked"; the rule at
`rules/fusion-workbench-conventions.md:234` reads "**no agent writes a `gate_response` event**"
with no scope. That is Theme 2. One smaller divergence, not filed: the ruling says the filing bound
is "restated with it" and names the `/fusion:memo idee` route; the rule points at
`## Backlog entries — work items` instead of restating. The pointed-at section does carry the
bound and the memo route, so nothing is lost, and pointing rather than copying is this project's
own convention.

**2. Is the prose that replaces the allowlist sufficient, and does it admit it is not enforced?**
It admits it, plainly and in both places — `agents/orchestrator.md:170` ("**Nothing enforces that
list.** … Keeping to the nine is yours.") and `:598` ("**Never invokes — and this prose is the
whole of the rule** …"), with `:600` adding "You can now reach both; do not." That is the honest
form and it is the right one. It is **not sufficient**, for a reason the honesty does not cover:
both entries are written as the orchestrator's alone, and the rule that replaced the ban now tells
every other agent it may dispatch. Theme 3.

**3. Is the gate instruction followable?** No, in three separate ways, and the middle one is the
one that matters: the analyst the determination is delegated to holds no more of the gate list than
the agent that delegated. Theme 4.

**4. Is there a sixth surviving false statement?** There are three. Theme 1.

## Findings by theme

### Theme 1 — the sweep found five and left three, and one is in the orchestrator's own Role line

**High.** `260913-1108_*_three-statements-that-the-reach-ruling-made-false-survive-and-one-is-in-the-orchestrators-own-role-line.md`

`agents/orchestrator.md:22` — "You are the only agent that dispatches other agents." The Role
paragraph, in the file the commit edited. The orchestrator loads
`rules/fusion-workbench-conventions.md` `## Dispatching another agent` on the same dispatch, so it
holds both statements at once.

`README-agents.md:45` — "**Dispatch is the orchestrator's monopoly.** Only `orchestrator` invokes
other agents via the `Agent` tool. The constraint is **prose-enforced** in each non-orchestrator
agent's prompt …". False three ways: the monopoly is dropped; the constraint was prose in four
prompts of ten and this commit deleted all four, so it is prose in none; and the same file says the
opposite at `:264` and `:85`. Only the parenthetical about the v2.8.1 `disallowedTools` rollback
survives.

`docs/philosophy.md:27` — "The **orchestrator** is the only agent that dispatches others." The doc
`/fusion:help` points at.

Cross-cutting: the commit's own message enumerates the corrected five, which is what makes the
three visible as a miss rather than a judgement. The pattern is the one `CLAUDE.md` already records
for the `templates/` and `docs/` rows — a claim about the tree, restated in several surfaces, with
no gate that resolves it. `derivable-enumerations-lint.test.ts` reaches the *counts* in these files
and was correctly updated here; it reads no claim of this kind.

### Theme 2 — the always-on `gate_response` ban is absolute, and the orchestrator is mandated to write that event

**High.** `260913-1108_*_the-always-on-gate-response-ban-is-absolute-and-the-orchestrator-is-mandated-to-write-that-event.md`

`rules/fusion-workbench-conventions.md:234` bans the event over every agent, with no clause
narrowing it to a nested one. `agents/orchestrator.md:238` mandates it, `:435` mandates two per
gate with literal strings, and `:564` documents it in the event table. The conventions file is
always-on for all eleven agents, the orchestrator included.

This is not only prose. `agents/orchestrator.md:435` pins its two strings because
`260817-1613_*_does-a-plan-stated-precondition-get-any-mechanism-or-is-it-read-by-a-human-or-not-at-all.md`
reserves a future measurement over them and says a renamed string splits the corpus; and
`skills/cadence/SKILL.md:184` reads gate answers per session off the same event. An orchestrator
that resolves the contradiction in favour of the always-on rule empties both readings silently,
which is precisely the "an absent input is reported absent, never as 0" property that skill states
one line later.

### Theme 3 — the positive rule turns on an undefined word, and both exclusions bind the orchestrator alone

**Medium.** `260913-1108_*_the-positive-dispatch-rule-turns-on-an-undefined-word-and-leaves-both-exclusions-bound-to-the-orchestrator-alone.md`

"operative agent" is written at `rules/fusion-workbench-conventions.md:230`,
`README-agents.md:264` and `skills/help/SKILL.md:96` — those three lines are the whole of it, and
none defines the term. Both exclusions are stated in the second person to the orchestrator
(`agents/orchestrator.md:598`–`:600`) or from the consultant's side naming only the orchestrator
(`agents/consultant.md:150`). So a `coder` dispatching `consultant`, or dispatching `orchestrator`,
is forbidden by nothing.

What changed is not the reachability — all ten could always dispatch — but that the rule now tells
every agent positively that it may. Before, an agent reaching the consultant was doing something no
prompt described; now it is following an always-on instruction with an undefined qualifier on it.
The ruling accepted prose for the orchestrator's two exclusions; it did not say the exclusions stop
at the orchestrator.

### Theme 4 — the gate delegation does not obtain the input it exists to obtain

**High.** `260913-1108_*_the-gate-determination-is-delegated-to-an-analyst-that-holds-no-more-of-the-gate-list-than-the-caller.md`

Three parts of `rules/fusion-workbench-conventions.md:232`:

(a) The trigger names a list nobody in scope holds. The conditions live only in
`agents/orchestrator.md` `## Human Gate Rules` (lines 359–393), and `bin/fusion-rules` emits no
agent prompt to anybody — I ran it for `coder`, `analyst` and `reviewer` and each returns rule
paths and voice profiles only. The concrete case: `Task involves ontocoder` is a gate condition,
and under the new rule a `coder` may dispatch `ontocoder` directly.

(b) The delegate is in the same position as the delegator. `agents/analyst.md` `## Analysis Types`
carries nine types and none is a gate-condition determination; the analyst receives the same
always-on corpus and no gate table either. The delegation moves a blind question one dispatch
further at 198 789 bytes (`hooks/lib/__tests__/fixtures/dispatch-path.baseline`, `[analyst]`).

(c) The actor is unnamed. "halts and does not proceed" and "An `analyst` determines" are
consecutive sentences with no subject joining them, and the two readings — return to the
dispatcher, or dispatch the analyst yourself — differ in behaviour.

This is `rules/critical-stance.md` §4's second statement arriving from the procedural side: the
question is decidable, but not from the inputs the mechanism hands the agent that must answer it.

### Theme 5 — the orchestrator prompt still calls the `AskUserQuestion` grant an open question, and calls it "your" grant

**Medium.** `260913-1108_*_the-orchestrator-prompt-still-calls-the-askuserquestion-grant-an-open-question-and-calls-it-yours.md`

`agents/orchestrator.md:34` presents two questions as "filed rather than answered", the first being
"whether **your** `tools:` grant of the tool goes". The grant is gone (same file, `:170`, `:598`)
and the ruling settles the question by name in its `Answered:` block. The second half, on the skill
bodies, is untouched and stands. The cited record
(`260824-2013_*_does-the-orchestrators-tools-grant-of-askuserquestion-go-now-that-the-orchestrator-may-not-call-it.md`)
is still `_d_` with an empty `Superseded by:`; `rules/fusion-workbench-conventions.md:356` makes
`_d_` terminal and sanctions only `_i_` → `_s_`, so what that record is owed is the user's to rule,
not a reviewer's to assume.

## The release commit

**The four version surfaces agree, and so do the two descriptions.** `.claude-plugin/plugin.json`
`11.1.0`; `<marketplace>/.claude-plugin/marketplace.json` fusion entry `11.1.0`; `install.sh:27`
`FUSION_REF=tags/v11.1.0`; `README.md:26` the same. All four equal the tag about to be cut. The two
product descriptions are byte-identical, 982 bytes each, compared by reading both JSON values and
testing equality rather than by eye — this is the fifth surface `CLAUDE.md` names as the one that
slips, and it did not slip here.

**One release step is not finished.** The marketplace working clone at
`/Users/k1/Projects/productive/claude-plugins` has the bump in the working tree and **not
committed**: `git status` shows ` M .claude-plugin/marketplace.json` and its newest commit is
`fusion 11.0.1`. Release step 4 is "Commit and push **both** repos". Not a defect in this
repository and not filed; named so the tag is not cut against a half-finished step.

**The help topic.** `skills/help/SKILL.md:96` carries the 11.1.0 paragraph, three release
paragraphs stand, and the labels below were deliberately left in place — which is right, since each
names the install a reader is coming from. This is the pre-tag step `260906-2014_*_the-help-topic-on-updates-has-missed-two-releases-and-names-none-of-the-last-three.md` was filed
about and it was performed.

## Measurements spot-checked

Both exact.

**The skills surface holds 82 bytes.** Re-derived independently of the test: `SKILL_BASELINE` and
`SKILL_HEAD_ROOM` (21 911) read out of `surface-growth-bound.test.ts`, the fourteen present
`skills/*/SKILL.md` sizes `stat`-ed from the tree, floor summed over present files only as
`growth()` does. total 224 226, floor 202 397, budget 224 308, **margin 82**. The per-file sizes
also equal `fixtures/surface-growth.golden` line for line.

**The reference-resolution path count is unchanged by the help-topic edit.** The pin is an
equality, not a floor — `expect({paths, anchors, stampBare}).toEqual(BASELINE)` at
`reference-resolution-lint.test.ts:537` — and the release commit did not touch that file. The test
is green at HEAD, which is what makes "unchanged" a checked claim rather than an asserted one.

## Two observations, neither filed

**`1208ceb6` is covered by no review pass, by construction.** The previous pass ran
`1208ceb6..c2a12973`, which excludes its own `from`; this dispatch's range begins after it.
`bin/fusion-review-coverage --since v11.0.1` lists it among the nine uncovered. Its content is one
work item's claim fields. Named so the gap is recorded rather than assumed closed.

**`npm test` is red on a full run and green on a re-run of the two files alone.** `guard-state-shape.test.ts` and `review-coverage.test.ts`, 2 failed / 924 passed; both pass when run
together by themselves (37/37). That is the known load sensitivity, open at
`260908-0032_*_two-hook-tests-are-load-sensitive-and-fail-only-in-the-parallel-full-run.md` and
described at length in the closed `260814-2118_*_the-hooks-suite-fails-differently-on-repeated-full-runs-and-does-so-on-clean-head.md` record. It matches what the release commit
reported and is not this range's.

## Recommended sequencing

Before the tag, if anything: Theme 1 and Theme 2. Both are single-sentence text edits inside this
release's own change, and both are statements a reader — or the orchestrator itself — acts on.
Theme 2 additionally risks a behavioural change in a measured event stream.

After the tag: Theme 3 and Theme 4, which want a ruling rather than an edit, and Theme 5, which is
one stale sentence plus a marker question for the user.

---
**Reconciliation 260921-2230 (reconciler, domain `code`, HEAD `cb8776f3`) — every defect this pass filed or cited is closed.** `260913-1108_*_three-statements-that-the-reach-ruling-made-false-survive-and-one-is-in-the-orchestrators-own-role-line.md` closed at `da8c4cb2`; `260906-2014_*_the-help-topic-on-updates-has-missed-two-releases-and-names-none-of-the-last-three.md` at `02533218`; `260908-0032_*_two-hook-tests-are-load-sensitive-and-fail-only-in-the-parallel-full-run.md` at `42bed688` (the ten-pair experiment read 0 red of 20). Findings themselves are not rewritten.
