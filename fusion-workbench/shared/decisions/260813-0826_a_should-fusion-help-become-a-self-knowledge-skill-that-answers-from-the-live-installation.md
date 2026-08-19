# Should `/fusion:help` become a self-knowledge skill that answers from the live installation?

---
**Domain:** code
**Status:** answered
**Filed by:** orchestrator (raised by the user)
**Cross-references:** `skills/help/SKILL.md`; a defect record about the user-facing documentation lagging two releases and still describing a removed guard, cited here at the stamp `260813-0825` — no file with that slug has ever existed and the intended target is not recoverable, measured in `circles/260801-1244-curator/history/260814-1332-curator-run.md` and re-filed as a defect on 2026-08-19; `bin/fusion-source-root`; `bin/fusion-paths`; `bin/fusion-rules`

---

## Question

`/fusion:help` today is a **router into shipped prose**. Its 119-line body picks one of five topics
from the user's argument, resolves the plugin source root, reads the matching `docs/`, `README*`
or `rules/` file, and synthesises an answer from it. Everything it can say is therefore a
restatement of text somebody wrote by hand and has to keep current.

The user asks whether it should instead be a **self-knowledge skill**: one that answers questions
about fusion by interrogating the installation it is running in — the agent prompts actually
present, the skills actually registered, the keys `bin/fusion-paths` actually emits for a given
consumer, the rules `bin/fusion-rules` actually emits for a given agent, the workbench that
actually exists, the version actually installed.

The question is live now for two reasons. First, the documentation-staleness record filed in this
same session measures the cost of the current design: `skills/help/SKILL.md` mentions neither the
backlog store nor `/fusion:direct`, both shipped in v8.1.0, so the in-session help surface is a
release behind while the mechanisms it would have to read are correct by construction. Second,
fusion already ships the interrogation primitives. `bin/fusion-paths`, `bin/fusion-rules`,
`bin/fusion-source-root`, `bin/fusion-workbench-root` and `bin/fusion-turn-budget` each answer a
question about the live installation, and every one of them exists because a prompt needed the
answer rather than a restatement of it. A help surface built on them would be the same move applied
to the user's questions.

## Options

1. **Keep the router, fix the prose.** `/fusion:help` stays as it is; the documentation Circle
   brings its five topics current and a release step keeps them there.
   - Pros: no new mechanism, no new failure mode. The prose is where the *reasoning* lives, and
     reasoning is exactly what an installation cannot be interrogated for — no helper can answer
     "why does the Origin Rule use origin rather than durability".
   - Cons: leaves the staleness mechanism untouched. The measured drift recurs at the next release
     unless a discipline nobody has built holds it.

2. **Replace the router with an interrogating skill.** `/fusion:help` derives its answers from the
   installation: enumerate `agents/*.md` and `skills/*/SKILL.md` for inventories, call
   `bin/fusion-paths <name>` to answer "where does X get written", call `bin/fusion-rules <agent>`
   to answer "what does agent X read", read `.claude-plugin/plugin.json` for the version, read the
   workbench for what this project actually has.
   - Pros: an inventory answer cannot go stale, because it is a measurement. Kills the whole class
     of defect the documentation record describes, for the mechanical half of what help answers.
   - Cons: the conceptual half has no measurable source. A skill that only measures can tell the
     user there are 16 agents and not what a Circle is *for*. Answering "how do I work with fusion
     day to day" from an installation is the undecidable-question shape that
     `rules/critical-stance.md` §4 warns about: the inputs do not carry it.

3. **Split by question kind: measure the inventory, cite the prose.** One skill, two answer paths.
   Anything with a countable or resolvable answer — inventories, key sets, rule emissions, version,
   workbench state, "which store does this land in" — is measured live. Anything conceptual —
   philosophy, the working model, why a rule is shaped the way it is — is read from `docs/` and
   cited as today.
   - Pros: each half is served by the surface that can actually answer it, and the split is by a
     property of the question rather than by taste. The staleness class dies where it is killable
     and stays where it is not, which is the honest boundary.
   - Cons: two paths in one skill body is more to specify, and the seam has to be stated or the next
     editor blurs it. Needs a rule for the ambiguous middle: "what does the playmaker do" is
     partly measurable (its emitted keys, its prompt's scope section) and partly not (why the
     boundary is drawn there).

4. **Add a second skill and leave `/fusion:help` alone.** `/fusion:whoami` or similar answers
   installation questions; `/fusion:help` keeps explaining concepts.
   - Pros: no change to a working surface, and each skill has one job.
   - Cons: the user has to know which to ask, and the two will answer overlapping questions
     differently. Splitting a user-facing entry point by implementation kind pushes an internal
     distinction onto the user.

## Constraints

- **The conceptual half is not measurable.** No enumeration of the installation yields the
  reasoning in `docs/philosophy.md`. Any option that claims to replace prose wholesale is
  answering a question the mechanism cannot decide.
- **The measured half must not become a second definition.** `rules/fusion-workbench-conventions.md`
  is the single authoring home for the workbench layout, and `bin/fusion-paths` is the single
  resolution point for store paths. A help skill that restates either in its own words re-creates
  the drift it exists to remove; it must call the helper and report, never paraphrase.
- **A `bin/` helper may be absent from an installed copy.** Every prompt-called helper is guarded
  with `[ -x ]` and reports rather than failing (decision
  `shared/decisions/260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention…`,
  part b). A measuring help skill multiplies those call sites and inherits that obligation at each.
- **`allowed-tools` is currently `[Read, Bash, Glob]`.** Options 2 and 3 stay inside it; nothing
  here needs a write tool, and the skill must not acquire one.

## Recommendation

Option 3, with option 1's prose work happening anyway inside the documentation Circle — the two are
complements, not alternatives. The measured half removes a defect class that has already been
measured once in this repository; the cited half keeps the only surface that can carry reasoning.
Option 2 is rejected on the constraint above: it would leave the conceptual questions unanswered or,
worse, answered by inference from file listings. Option 4 is rejected because it asks the user to
classify their own question before asking it.

The open sub-question, and the reason this is filed rather than decided: **where the seam falls for
a question that is partly measurable.** Deciding that needs the analyst pass this record is filed
alongside, not an argument here.

---
Answered: shared/analyses/260813-0831-the-seam-between-a-measured-answer-and-a-cited-one.md `## Verdict` — the seam is statable and option 3 is implementable, but this record cut it at the wrong granularity. Classified by *question*, 17 of 47 land in the middle and the split fails `rules/critical-stance.md` §4; classified by *the assertion an answer is made of*, all 17 decompose, the middle is empty, and three named residuals each carry a one-sentence rule. The analysis adds a third tier this record was missing — text quoted from the artifact whose own behaviour it describes — which is what makes "what does the playmaker do" look mixed when it is not. It also parts company with this record's motivation: staleness is the weaker argument and one of its two measurements is a false positive, while the stronger argument, coverage, is one this record never made — 20 of the 47 questions are about the user's own installation, which shipped prose cannot answer at any freshness. Cost: four new guarded call sites, about 72 lines, taking the help body from 119 to roughly 191. Implementation is not yet planned; no Circle carries this.

---
**Reconciliation 260819-1400 (reconciler, domain `code`, HEAD `e435f03` / `v10.3.0`) — marker
unchanged at `_a_`. Read the answer, not the record: the standing answer is the analysis's re-cut
seam, not this record's option 3 as worded.**

`skills/help/SKILL.md` is **131 lines** at HEAD, against the 119 the record measured and the ~191 the
analysis costed. It is still a router into shipped prose. One sentence points the other way —
`:70` tells the skill to run `bin/fusion-paths <name>` and show the user the result rather than
guessing from the layout — and that is the whole of the measured half. The four guarded call sites
the analysis costed are not there: nothing enumerates `agents/*.md` or `skills/*/SKILL.md` for an
inventory, nothing calls `bin/fusion-rules <agent>` to answer what an agent reads, and nothing reads
`.claude-plugin/plugin.json` for the version.

The `Answered:` line above is doing more work than a footer usually does and should be read in full
before this is planned. It records that the analysis **re-cut the seam** this record proposed —
classify by the assertion an answer is made of, not by the question — and that it **parts company
with this record's motivation**: staleness is the weaker argument and one of its two measurements is
a false positive, while the stronger argument is coverage, which this record never made. 20 of 47
inventoried questions are about the user's own installation and no shipped prose can answer them at
any freshness.

**What binds a deep change.** `/fusion:help` will describe whatever fusion was at the last time
someone edited its prose. A deep change that alters the agent roster, the skill surface, the store
layout or the resolver's keys leaves the in-session help surface wrong until a human rewrites it,
and there is no gate that notices. The record's own evidence for this is that the skill shipped a
release behind twice.
