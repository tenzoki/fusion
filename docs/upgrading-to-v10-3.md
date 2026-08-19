# Upgrading to fusion v10.3

v10.3 changes two things you will meet, and rewrites nothing. The `**Status:**` head field leaves
the decision-record template, the way it left the Circle-record template in v10.2. And a Circle now
asks one more question before it closes: the orchestrator reads the plan's stopping conditions back
to you, clause by clause, and asks whether each of them holds.

Nothing in your workbench stops working when you upgrade, and no file is rewritten for you. The
`## What you have to do` section below asks you to touch no file, because there is none to touch;
what it carries is one habit to drop and one new prompt to expect.

Upgrading is the ordinary update — `fusion --update`, or the uninstall/install/reload sequence on
the marketplace path. The release is tagged `v10.3.0`, and `FUSION_REF=tags/v10.3.0` pins exactly
this version.

## The `**Status:**` field leaves the decision-record template

A decision record used to carry its state twice: as the marker on its filename (`_o_` open, `_a_`
answered, `_i_` implemented, `_d_` deferred, `_s_` superseded) and as a `**Status:**` line in its
head. The marker was always the normative one, because the transition *is* the rename, and the
header was a hand-maintained second copy. It is out of the template now, in both shipped places that
defined it: `rules/fusion-workbench-conventions.md` `## Decision Record Template` and the worked
example in `rules/decision-record-examples.md`.

This finishes what v10.2 began. That release took the same field off the Circle record; the same
question for the decision record was held open behind a defect and is now answered the same way.

**The measurement it was decided on**, taken across fusion's own two decision stores: 39 of 94
records carried a header naming a state their marker did not. Fourteen implemented records said
"answered" and thirteen more said "open"; eight answered records said "open"; three deferred and one
superseded said the same. The ratio had not improved in six days, across three hand corrections.

**Your existing records keep the field, untouched, including when you transition one.** The upgrade
rewrites no workbench file, nothing reads the field, nothing writes it, and nothing breaks. The
reason to leave a drifted header alone rather than tidy it on the way past is that those drifted
headers are the evidence the removal was decided on — correcting one by hand deletes a data point
from the population that settled the question.

That position holds without qualification, and it is broader than the sentence
`docs/upgrading-to-v10-2.md` carries about the same field. The v10.2 note says to leave a record *you
are not transitioning* exactly as it stands, which excluded the only moment an agent ever meets one.
The exclusion was dropped after v10.2.0 shipped; the wording in
`rules/fusion-workbench-conventions.md` `## Decision Record Template` is the current one.

**Four other artifact kinds share the field name** — session histories, plans, analyses and
consultations — and this release touches none of them. Tooling that greps for a `Status:` head field
has to scope itself by artifact kind rather than by the string, which was already true before this
release.

## A Circle answers its own stopping conditions before it closes

**This is the one you will notice**, because it is a question that was not there in v10.2.

The plan output format gains a section, `## Where this Circle stops`: the conditions under which the
Circle is finished, and any precondition a later act — a release, a tag, a closure — has to satisfy
first. One clause per condition, each answerable yes or no. Every plan written from here carries it.

Phase 4 of `agents/orchestrator.md` gains step 2b to read it. Before the Circle record is renamed to
closed, the orchestrator resolves the plan in scope, reads that section's clauses back to you one at
a time, and asks whether each holds. Any clause you say does not hold is carried into the Circle's
closure note, so the gap outlives the chat.

**It is a question, not a checker.** Nothing parses the clauses, judges them, or decides from their
wording whether a condition is met. That is deliberate, and it is the same shape the plan head's
`**Decidability:**` line already uses: put the question where somebody looks, rather than build a
checker for something mostly undecidable. Most preconditions a plan states — "verified against a
real consuming project" is a fair sample — are not mechanically decidable at all.

**What it does not cover, stated plainly.** A release tagged in the middle of a Circle has already
gone out by the time this step runs. That is the measured case the whole change came from: a plan
made its Circle's review pass a precondition of the tag, v10.0.0 was tagged and pushed without the
pass, and a reconciliation after the release was what noticed. The step records such a gap; it
cannot prevent one.

**Plans you already have carry no such section**, and none is added to them. When no plan is in
scope, when the plan has no `## Where this Circle stops`, or when the section is empty or still
holds only its placeholder, the step does nothing and no question is put to you. So the first
Circles you close after the upgrade may pass through it in silence; the ones planned under this
version will not.

**If you read your event log**, the step emits the event types that already exist rather than a new
one: one `gate_hit` carrying the reason string `Circle stop conditions`, and one `gate_response` per
clause carrying `holds` or `does not hold`. Those two strings are fixed so that how often the gate
fires, and how often a clause comes back not holding, are both a `grep` over
`orchestrator-events.jsonl`, which is append-only across sessions.

## Also in this release

**`rules/workbench-tracking.md` is new, and purely additive.** The split of which workbench root
entries a project that tracks its workbench should commit, which it should not, and what preserves
the evidence in the ones it does not, moved out of `rules/fusion-workbench-conventions.md` into its
own file, with a pointer left behind. The text is the same text. `bin/fusion-rules` emits it to no
agent, because no executor applies it: its two readers are a human writing a project's `.gitignore`,
and the archive step of `/fusion:cleanup`, which now reads the file at its first step and says so if
it cannot find it. If you have never needed to decide what your `.gitignore` does with
`fusion-workbench/`, nothing here asks you to start.

## What you have to do

**Nothing.** No workbench file is rewritten, no marker moves, no configuration key changes, and no
agent, skill or slash command left in this release.

Two things change what you do rather than what you have:

- **Stop hand-writing a `Status:` head field into new decision records**, if you were. The agents
  already have, and the template no longer offers the line.
- **Expect one more question at a Circle closure**, once you are closing Circles whose plans were
  written under this version. Answering it is the whole of the enforcement. There is no second
  mechanism behind it that catches a clause you wave through.

## What did not change

The workbench layout, the state marker vocabularies and their transitions, the directory structure,
and the portfolio. The Circle record is as v10.2 left it, `## Directive` invariant included.
Configuration is untouched: `fusion.json`, its one live setting and the two v10 migration advisories
behave exactly as they did. The hook layer is unchanged and still decides nothing. The agent, skill
and slash-command roster is unchanged — `agents/planner.md` and `agents/orchestrator.md` gained the
section and the step described above, and no prompt arrived or left.

## Where to read more

- `rules/fusion-workbench-conventions.md` `## Decision Record Template` — the template without the
  field, the measurement, and the position on records that still carry it.
- `rules/decision-record-examples.md` — the worked example, and its pointer back to that paragraph.
- `agents/planner.md` `## Where this Circle stops` — the section, and the paragraph beside the
  `**Decidability:**` one saying what does and does not read it.
- `agents/orchestrator.md` `### Phase 4 — Portfolio sync` — step 2b, and its row in the table of
  gates that stop for a human.
- `rules/workbench-tracking.md` — the record-versus-live-state split, if you track your workbench.
- `docs/upgrading-to-v10-2.md` and `docs/upgrading-to-v10.md` — the two previous notes, if you are
  coming from further back and skipped one.
- `/fusion:help` — install, update and configure, answered from your live installation.

The records behind both changes, with the figures and the options weighed against each other, are in
fusion's own workbench in the source repo.
