# The style rules every agent loads are the ones fusion ships, and their effect on agent output is measured

---
**Domain:** code
**Filed by:** shaper (anticipated-circle mode)
**Active spec/plan:** 260820-2324_*_plan-style-rules-arrive-and-get-measured.md
**Active session history:** 260820-2103-orchestrator-session.md

---

## Directive

See `**Active spec/plan:**` above. The cited spec or plan states the Directive in force.

## Grounding snapshot

All figures below were measured at HEAD `7135a19` during shaping on 2026-08-20.

### The reported symptom is a first-sentence defect, not a punctuation defect

The user's two samples, "Schritt 8 hat etwas gefunden, das mehr wert ist als seine eigene
Arbeit" and "Zwei Türen, die niemand bewacht hätte", both state a judgement or an image where a
number was available. The factual form of the first is "Schritt 8 fand neun Prosastellen, der
Plan führte vier." Neither sample carries an em-dash. `rules/user-facing-output.md` already
requires the factual form, as point 1 of its readability gate, and nothing checks it. That is
the same condition
`260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
opens with: the style rules are the only normative surface in this project that is stated and
never gated.

### The profile agents load here is not the profile fusion ships

Four stations carry a profile, and the update stops at the third.

| Station | Path | Written by |
|---|---|---|
| Source | `stilwerk/*.yaml` in the plugin repo | development |
| Shipped | `$FUSION_PLUGIN_ROOT/stilwerk/` | `install.sh`, in its copy loop |
| Project copy | `./fusion-workbench/stilwerk/` | `/fusion:setup`, Step 0d |
| Read | `./fusion-workbench/stilwerk/` | `bin/fusion-rules`, `emit_voice_profile` |

Agents read station 4 only. `emit_voice_profile` hard-codes `local
stilwerk_dir="./fusion-workbench/stilwerk"` and offers no alternative and no fallback onto the
plugin.

Measured today, the two chat profiles diverge and the two long-form profiles do not:
`chat-voice-de.yaml` is 7 358 bytes shipped against 7 353 in the workbench, `chat-voice-en.yaml`
6 800 against 6 801, `default-voice-de.yaml` and `default-voice-en.yaml` byte-identical. The
loaded German profile says gate prompts up to 8 lines and chat replies up to 12; the shipped one
says 6 and 8, and adds the clause "Klare Formulierungen, kein Jargon", which no agent in this
repository has ever loaded. The condition is open as
`260814-1419_*_the-shipped-chat-voice-profiles-changed-and-the-workbench-copies-agents-actually-load-did-not.md`,
unchanged since 2026-08-14 and re-verified by the reconciler on 2026-08-17.

Three independent causes hold it in place.

1. **The Setup copy is conditional on absence.** Step 0d of `skills/setup/SKILL.md` reads `[ -f
   ./fusion-workbench/stilwerk/chat-voice-de.yaml ] || cp …`. Where the file exists, nothing
   happens, and re-running `/fusion:setup` never changes that. The behaviour is intended: a
   project may adapt its own voice, and an unconditional copy would destroy the adaptation. No
   update path was provided beside it.
2. **The work-tree preference covers `rules/` only.** `bin/fusion-rules` sets `IN_PLUGIN_REPO`,
   then sets `PLUGIN_RULES_DIR="$PWD/rules"`. `emit_voice_profile` does not consult that branch,
   so an edit to `stilwerk/` in the work tree is invisible even from the repository root.
3. **The commit that tightened the caps did not touch the project copy.** `ae21c87` (2026-08-14)
   changed `stilwerk/chat-voice-*.yaml` alone. `fusion-workbench/stilwerk/chat-voice-de.yaml` has
   stood at `b6bca62` (2026-08-07) since.

### One claim in the open record has expired and must be annotated rather than repeated

`260814-1419_*_the-shipped-chat-voice-profiles-changed-and-the-workbench-copies-agents-actually-load-did-not.md`
states that even a forced copy would not help, because `$FUSION_PLUGIN_ROOT` points at the
installed 8.2.0 tarball rather than the work tree. That was accurate on 2026-08-14. It is not
accurate today: all four files under `~/.fusion/stilwerk/` are byte-identical with the work
tree, so a copy from `$FUSION_PLUGIN_ROOT` resolves the divergence now. The record needs the
correction appended, or the next reader plans around an obstacle that has gone.

### The corpus as it stands

Two of the three parts of this Circle act on the same text, so its current state is the baseline
both work from. Measured at HEAD `7135a19`, with the em-dash ceiling at 1 per 1000 words:

```
rules/agent-setup.md                       533 words    15 em-dash   28.1 /1000
rules/fusion-workbench-conventions.md     8679 words   137 em-dash   15.8 /1000
rules/decision-record-examples.md          591 words    17 em-dash   28.8 /1000
rules/user-facing-output.md               2799 words     6 em-dash    2.1 /1000
rules/critical-stance.md                  1587 words    29 em-dash   18.3 /1000
fusion-workbench/stilwerk/chat-voice-de.yaml  882 words   6 em-dash    6.8 /1000
------------------------------------------------------------------------------
CLAUDE.md                                 9155 words   125 em-dash   13.7 /1000
rules/design-diagrams.md                   794 words    20 em-dash   25.2 /1000
rules/circle-records.md                   2812 words    50 em-dash   17.8 /1000
```

**The line in that table matters and is itself an open defect.** The six entries above the rule
are the always-on set for every agent: the five unindented `emit_if_exists` calls in
`bin/fusion-rules` plus this project's chat voice profile. `CLAUDE.md` is not emitted by
`bin/fusion-rules` at all, and `design-diagrams.md` and `circle-records.md` are conditional
emissions reaching a derived audience. The seven-file table in the analysis is labelled
always-on and is not the always-on set, which is filed as
`260816-1345_*_the-register-defects-corpus-table-is-labelled-always-on-and-is-not-the-always-on-set.md`.
Whichever files the repunctuation pass covers, the corpus it covers has to be named correctly
first, because the measurement's surface is defined by that name.

The single repaired file is `rules/user-facing-output.md`, taken from 38 em-dashes to 6 in
`6049d3e`. At 2.1 per 1000 it still sits above its own ceiling.

**Correction appended 260821-0322-coder-records-state-the-always-on-set-as-a-derivation.md** (coder, plan step 15). *The set above is right and is stated as
a list; state it as its derivation, and name `CLAUDE.md` inside the always-on prose.* The always-on
set is the unindented `emit_if_exists` calls in `bin/fusion-rules` plus the unconditional
`emit_voice_profile "chat-voice" "$CHAT_LANG"` call, resolved against the project's chat language.
At HEAD `86edaac` that is `bin/fusion-rules:418-422` and `:431`. Derive it from the program rather
than copy the six filenames forward: every hand-written copy of this set in this project has gone
stale, which is the root cause this Circle was opened on.

`CLAUDE.md` is always-on prose an agent holds and is outside the derivation. No helper emits it;
Claude Code loads it as project instructions, so no change to `bin/fusion-rules` adds or removes
it. Its prose is not repaired in this Circle, by
`260820-2314_*_is-claude-md-inside-the-corpus-this-circle-repairs.md`
option 3. Measured at HEAD `86edaac` with `bin/fusion-prose-metric`, the authoritative counter
since plan step 1, which excludes fenced code, inline code spans, block quotes and YAML example
values from both counts: the six emitted files carry 8 prose em-dashes over 13 292 prose words,
0.6 per 1000; `CLAUDE.md` carries 126 over 8 892, 14.2 per 1000. It is 40 per cent of the 22 184
prose words an agent holds and 94 per cent of the em-dashes left in them. The table above is a raw
`wc -w` and `grep -o` count taken at `7135a19` and is not comparable term for term with these.

### The first pass left four open defects in the text the second pass will rewrite

Three concern the repunctuation itself and one concerns the record of it:

- `260816-1330_*_the-repunctuation-replaced-three-em-dashes-with-three-vague-pronoun-openers-the-same-blacklist-bans.md`
- `260816-1330_*_two-of-the-twenty-nine-replacements-chose-a-mark-weaker-than-the-clause-it-replaced.md`
- `260816-1330_*_the-repunctuations-evidence-paragraph-carries-a-token-count-nobody-can-reproduce-and-an-inverted-capitalisation-claim.md`
- `260816-1330_*_the-override-record-names-the-shipped-chat-profiles-cap-and-the-copy-every-agent-loads-says-otherwise.md`

The last of these is settled by the user's line-cap decision below, and its correction belongs as
an appended note on a history file rather than a rewrite of it.

### What the measurement is, and what it is not

Recommendation 4 of `260816-0740-rhetorical-register-of-agent-output.md` defines
it: after the corpus repair lands, re-run the Sources measurement against the next session's
history files. Finding 10 predicts that the output rate falls with the corpus rate. The answer recorded on
`260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
warns that a weak dose does not test the inference, and that warning has grown stronger rather than weaker: 2 563 repaired words inside a
corpus of 22 763 was already weak, and `rules/workbench-tracking.md` has been added to the
emitted set since. The whole-corpus scope the user chose is what makes the measurement able to
carry a result.

**Correction appended 260821-0322-coder-records-state-the-always-on-set-as-a-derivation.md** (coder, plan step 15). *The clause "`rules/workbench-tracking.md`
has been added to the emitted set since" is inverted, and the caution it supports still stands on
its other half.* That file is emitted to no agent. `grep -c workbench-tracking bin/fusion-rules`
returns 0 at HEAD `86edaac`, and `b200902` moved text **out** of the emitted set rather than into
it: its own commit message records the always-on set falling from 98 874 to 95 458 bytes per
dispatch. The audience was settled by
`260816-1707_*_to-whom-is-the-new-workbench-tracking-rule-emitted-when-its-consumers-are-a-human-and-a-skill.md`,
whose answer is no agent, and the condition is filed as
`260820-2249_*_the-always-on-corpus-is-said-to-have-grown-by-a-file-that-is-emitted-to-no-agent.md`.
The corpus did not grow. What keeps the dose caution alive is `CLAUDE.md`, which no helper emits
and which this Circle does not repair, so the whole-corpus scope named in the next sentence covers
the emitted six and not the largest single conditioning file.

### The user's decisions, taken during shaping on 2026-08-20

1. **All three parts are in scope**: repair the distribution path, revise the register, and run
   the measurement.
2. **The register revision covers the whole always-on corpus** plus the four stylometric
   profiles, not the narrow scope of the first pass.
3. **The location question is settled rather than filed.** The project copy stays, so a project
   can adapt its own voice. `/fusion:setup` compares the project copy against the shipped one and
   offers a refresh where they differ. A checksum is recorded when the copy is made, because
   without one Setup cannot distinguish a local adaptation from a stale copy. Options 2, 3 and 4
   from the user's draft are not pursued; option 4, a work-tree preference for `stilwerk/`, would
   also require answering part (c) of
   `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md`,
   which is deliberately unanswered.
4. **The refresh path covers every asset `/fusion:setup` copies into the workbench**, not the four
   profiles alone. The class is general, and closing it for `stilwerk/` alone leaves
   `260814-1419_*_the-shipped-chat-voice-profiles-changed-and-the-workbench-copies-agents-actually-load-did-not.md`
   half closed.
5. **The line-cap conflict resolves in favour of the rule, at 8 and 12.** The chat profiles stop
   restating the numbers and cite `rules/user-facing-output.md` `## Length` instead. One number,
   one surface. This closes
   `260814-1419_*_the-tightened-chat-profile-caps-contradict-the-length-section-of-the-rule-that-owns-them.md`,
   whose part 2 (the German profile diverged from the English beyond translation, and left
   trailing whitespace) is repaired in the same pass.
6. **`rules/user-facing-output.md` gains a checkable test for the opening sentence**, in the
   shape of recommendation 3's correctio test: one sentence stating when an opening sentence
   fails, rather than a further prohibition.
7. **The four defects from the first pass are repaired inside this Circle.**
8. **A null measurement does not build a gate inside this Circle.** Where the output rate does
   not fall with the corpus rate, the Circle records the number on
   `260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
   and re-opens the gate question with a result rather than an inference. Option 1 of that record,
   a blocking test over the shipped prose, is a later Circle's work in either branch.

### Constraints

**Two write locations are needed until the refresh path exists, and that is the defect.** The
profiles are revised in `stilwerk/`, or the work does not survive the next release. The project
copy is then refreshed, or the revision has no effect in this repository. Whoever plans this
should sequence the refresh mechanism early enough that the second write becomes the mechanism's
own output rather than a manual step repeated at every profile edit.

**The corpus repair precedes the measurement.** A measurement taken against a partly repaired
corpus reproduces the weak-dose problem the answered decision already warns about.

**The always-on growth bound has roughly 5 700 bytes of head-room.** The five always-on rule
files weigh 92 869 bytes against a baseline of 86 573 and a budget of 12 000
(`hooks/lib/__tests__/rules-emission-golden.test.ts`). A repunctuation shrinks the surface, since
an em-dash costs three bytes and a comma one, so the corpus pass buys head-room rather than
spending it. The opening-sentence test spends some. A red bound is cleared by a cut and never by
editing a baseline, which is authored in `hooks/lib/__tests__/helpers/growth-bound.ts`.

**Existing artifacts are not rewritten.** `rules/fusion-workbench-conventions.md`
`## Project language` settles the analogous case, and the answered decision carries it forward.
Session histories, reviews and closed records keep the register they were written in. The
correction to
`260816-1330_*_the-override-record-names-the-shipped-chat-profiles-cap-and-the-copy-every-agent-loads-says-otherwise.md`
is an appended note for the same reason.

**A gate for prose is not authorised yet.** The answered decision makes the measurement a
precondition for that question, and building one now would answer it ahead of the evidence the
user's own choice made binding.

### Executor mix, noted for the planner rather than decided here

The four stylometric profiles are YAML and belong to `ontocoder`. `bin/fusion-rules`,
`skills/setup/SKILL.md` and the setup marker belong to `coder`. The rule and `CLAUDE.md` prose is
normative text, which is `curator` territory where a clause is reworded and `coder` territory
where it is repunctuated, a split the corpus issue already makes. The measurement is `analyst`
work. Which executors a plan step gets is the planner's `**Executors:**` decision.

## Dependencies

No Circle blocks this one. `260819-1645-four-constraints-on-deep-change` is active and
independent in subject, and it is cited here for one shared constraint rather than as a
precondition: both Circles spend from the same four growth budgets, and that Circle's own
Grounding measures `agents/*.md` at roughly 3 300 bytes of head-room. Where the two run close
together, the second one to write pays the tighter bill.

## Turn log

- Turn 1 (session 260820-2103-orchestrator-session.md): commits `fac97f4`..`d66763b`; eight plan steps, the counting program,
  the registered protocol with its pre-repair window, Setup's provenance stamp and comparison, the
  fallback made detectable, and the four profiles revised, repunctuated and refreshed through the
  mechanism. Coherence verdict: review-needed. The review of all thirteen commits found the mechanism
  carrying the first Directive outcome did not run as written. Session history:
  `260820-2103-orchestrator-session.md`
- Turn 2 (session 260820-2103-orchestrator-session.md): commits `3464575`..`HEAD`; the two High findings repaired and verified
  under the condition that produced them, four rule files brought to their per-file ceiling, the
  fact-first test and the gate-clause arithmetic written into the rule, seven records corrected by
  appended note, the curator prompt's enumeration, and the final measurement. Review gate R1 confirmed
  the repunctuation did not reproduce the earlier pass's two content defects and did reproduce its
  evidence defect. Coherence verdict: bounded-closure-proposed. Session history:
  `260820-2103-orchestrator-session.md`

## Closure note

**Bounded Closure**, 260821. Session history:
`260820-2103-orchestrator-session.md`. Reconciliation:
`260821-0416-reconciliation.md`.
Verdict reached independently by the reconciler, not adopted from the orchestrator's proposal.

**What the Circle reached.** Three of the Directive's four outcomes. A change to a stylometric profile
in the plugin's source now reaches a project set up before the change, demonstrated by running the
mechanism rather than by copying files. The always-on rule corpus fell from 171 prose em-dashes over
13 018 words to 8 over 13 292, with every file at or under one per 1000 individually, and only 0.12 per
cent of that fall is dilution. `rules/user-facing-output.md` states the condition under which an opening
sentence fails its fact-first requirement, so the requirement can be applied rather than interpreted.

**What it could not reach, and why that is structural.** The fourth outcome is a measured number on
`260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`.
Its post-repair window opens only once a Circle conditioned by the repaired corpus has written session
prose, and no such Circle can exist while this is the only active one of thirteen. The Circle did the
half that had to happen first and could never be reconstructed afterwards: it registered the protocol,
fixed the threshold at 5.0 per 1000, and captured the pre-repair window **before** the first repair
commit. That ordering is verifiable, not asserted.

**The Bounded-Closure Artifact** is therefore the pre-registration itself. A later Circle inherits an
exact threshold chosen without knowledge of the outcome, which is worth more than a number this Circle
could have produced by measuring against an empty window.

**What the Circle cost, stated because it was not in the Directive.** It grew the corpus it repaired.
The repunctuation returned 470 bytes; the new clauses spent 2 608, a ratio of 5.5 to 1. Two of four
growth budgets are now all but spent, `skills/` at 30 bytes and the hook tests at 32 lines, and two
filed defects write into the surface that has 30 bytes left. The Circle closes having filed defects
nobody can fix until someone takes a cut. That gap is filed as a decision rather than a defect: what is
missing is any bound on a Circle's own growth, and adding one changes how a Circle is bounded.

**Known contradiction left standing.** This record's `## Dependencies` says the four-constraints Circle
is active. It closed in `5faed26`, before this Circle was shaped. No party may write that section, which
is the subject of an open record filed on the first day of this Circle.
