# Upgrading to fusion v10.6

**Nothing in your project is rewritten by this release, there is no migration step, and no
configuration key changes meaning.** One thing behaves differently where it used to only describe
itself, and the rest is text your agents read, most of it text that left.

Upgrading is the ordinary update: `fusion --update`, or the uninstall/install/reload sequence on the
marketplace path. The release is tagged `v10.6.0`, and `FUSION_REF=tags/v10.6.0` pins exactly this
version.

## The one you will notice: activating a Circle now starts the session

`/fusion:next` ends by activating the Circle you picked, and its last step used to print a sentence
saying that a fresh orchestrator session begins, runs Setup, and proceeds. The sentence described
somebody else doing it. There was nobody else: the skill body runs inside the orchestrator's own
session, so the text was an instruction addressed to a parent thread that is the same thread, and
what happened next depended on whether the model read its own output as a directive.

The step now acts on the message in the same turn, and who is running decides how. When the
orchestrator activates a Circle, it runs its own Setup and continues into Phase 0, which is what the
printed sentence always claimed. When any other agent runs the skill, it stops there and the printed
message stands as your next step.

**What this changes for you:** after `/fusion:next` activates a Circle, the work begins. Before, it
sometimes did and sometimes waited for you to say "go", and nothing on screen distinguished the two
cases. If you want the briefing without the session starting, decline the activation offer.

## The orchestrator may now have a Directive captured

The orchestrator cannot create a Circle and still cannot. What it gains is permission to invoke
`/fusion:direct` on your behalf, the skill that runs the clarification rounds and writes an
anticipated Circle record.

**The permission carries one condition: your own words asked for it.** The orchestrator applies the
same test it already applies before re-sharpening an anticipated Circle. A specification it just
wrote that names five follow-on Circles is a reason to ask you whether to capture them, never a
reason to invoke the skill on its own initiative. The bound is why the permission could be granted
at all.

**It still authors no Directive prose.** What it gained is the ability to have prose written, not to
write it. The only thing the orchestrator ever puts into a `## Directive` section remains the fixed
pointer literal.

## `/fusion:help`'s update advice is capped at three releases

The update topic of `/fusion:help` carried one paragraph per release, growing by one at every
release, on a surface with a fixed byte ceiling. It now carries the last three and a standing line
for everything older, which tells you to list `docs/` and read every `upgrading-to` note above your
own version.

That standing line names the actions that fail silently when they are skipped, because those are the
ones a pointer alone would lose. Two qualify today, both from releases now outside the three: v10
retired the project-root `fusion-guard.json`, and a Turn budget left inside it is not read, so it has
to be copied into `fusion.json` before the old file is deleted; v9 retired the `strategic` and
`knowledge` domain values, and a record still carrying one runs as `code` without saying so.

The paragraph that rolled out of the window with this release is v10.3, and it adds nothing to that
line. What v10.3 asked of you was to stop hand-writing a `**Status:**` field into new decision
records and to expect one more question at a Circle closure. Skipping either is visible on the spot:
a field nothing reads, or a question you were not asked. Neither leaves a project holding a setting
that is quietly not applied, which is the property the standing line exists to preserve.

## `/fusion:setup` Step 0e reports when it cannot compare your profiles

Step 0e, new in v10.5, compares the four voice profiles in your workbench against the shipped ones.
It resolves the plugin's source root in each of its own blocks, and two of those blocks did not check
the result before using it. With `FUSION_PLUGIN_ROOT` unset they would have copied from a path
resolving at the filesystem root, finding nothing and saying nothing about why.

All three blocks now guard, emit `source-root-unresolved`, and stop. The Done report says the assets
were not compared at all, instead of passing over the step in the silence that a run with nothing to
report is supposed to mean.

## The reviewer contract has one home

What a review file contains, its two mandated header fields, its per-topic working files and its
final consolidated form, stood twice: once in `agents/coderev.md` and once in `agents/ontorev.md`,
with no pointer between the copies. It is now `rules/review-contract.md`, and `bin/fusion-rules`
emits it to those two agents and to no other. Both reviewers read the same text at run time, and
each prompt keeps only its own domain-specific analysis steps.

**No user action.** Review files are written exactly as before, and existing ones are untouched.

## Four bounded surfaces gave bytes back

fusion bounds the growth of its own shipped text on four surfaces, each with its own budget. This
release spent a Circle cutting rather than adding. Five claims that had been restated across the
fifteen agent prompts were reduced to one authoring home each, two more left eight skill bodies, and
a 421-line log of re-approvals moved out of a hook test file, which is measured by the line, into a
workbench record. A test for `bin/fusion-prose-metric` landed in the room that made.

**No user action**, and nothing you can observe. It is named here because the removals are large
enough to show in a diff, and a reader comparing two versions should know that removed prose was
restatement rather than a retired rule.

## What you have to do

**Nothing.** No workbench file is rewritten, no marker moves, no configuration key changes, and no
agent, skill or slash command arrived or left.

One habit is worth adjusting, and it is not required: if you have been running `/fusion:next`,
reading the briefing, and then typing "go", expect the session to have started already.

## What did not change

The workbench layout, the state marker vocabularies and their transitions, the directory structure,
and the portfolio. Configuration is untouched: `fusion.json`, its one live setting and the two v10
migration advisories behave exactly as they did. The hook layer is unchanged, still decides nothing,
and no file under `hooks/` outside its own tests was touched by this release. The roster stands at
fifteen agents.

## Where to read more

- `skills/next/SKILL.md` `### 6.5 — Chain into a fresh orchestrator session` — the activation step
  and the split by who is running it.
- `agents/orchestrator.md` `## Capturing a Directive as an anticipated Circle` — the permission, its
  one condition, and why the bound is what makes it grantable.
- `skills/help/SKILL.md` — the update topic, its three paragraphs and the standing line.
- `skills/setup/SKILL.md` `## Step 0e` — the guarded blocks and what the Done report says.
- `rules/review-contract.md` — the review file's contract, in the one place that now defines it.
- `README-hooks.md` `### Growth bounds on the shipped text` — the four surfaces, their budgets, and
  what no bound covers.
- `docs/upgrading-to-v10-5.md` and `docs/upgrading-to-v10-4.md` — the two previous notes, if you are
  coming from further back and skipped one.
- `/fusion:help` — install, update and configure, answered from your live installation.

The records behind every change here, with the measurements and the options weighed against each
other, are in fusion's own workbench in the source repo.
