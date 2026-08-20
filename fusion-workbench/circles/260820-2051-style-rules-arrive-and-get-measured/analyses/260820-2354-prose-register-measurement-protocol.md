# Analysis: the prose register measurement protocol, and the pre-repair window

**Date:** 2026-08-20 23:54
**Type:** Document Study
**Status:** Complete
**Requested by:** user, via plan step 2 of `circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2324_o_plan-style-rules-arrive-and-get-measured.md`

## Question

The answered decision `shared/decisions/260816-0740_a_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
chose option 4: repair the corpus, measure the output, and re-open the record with a number instead of
an inference. This document registers the protocol under which that number will be produced, and
captures the half of it that cannot be captured later. Once a repair commit lands, the pre-repair
window is in history and cannot be re-picked. Everything below is fixed before that happens.

## Scope

In scope: the file set, the counting command, the exclusion rules, both window boundaries, the
definition of a usable file, the minimum window size, the threshold, the three outcomes and the marker
each earns, the corpus word count at the pre-repair boundary, and the pre-repair window measured.

Out of scope: the measurement itself, which has no post-repair window while this Circle runs, and any
gate, test or check over a prose property.

Measured at HEAD `fac97f4`, the commit that landed `bin/fusion-prose-metric`. No prose in the corpus
has been repaired at that commit.

## Findings

### 1. The output file set

The measurement reads **session history files**, and nothing else. A history file is a `.md` file in a
history store, which means `fusion-workbench/shared/history/` or
`fusion-workbench/circles/<circle>/history/`. Both stores count. At the pre-repair boundary the two
stores together hold 554 files, of which 549 lie outside this Circle.

Two attributes are recorded per file and both are read from the path. The **store** is the directory
the file sits in, shared or a named Circle. The **author** is the agent named in the filename after the
stamp, where the filename names one. Some filenames name an act rather than an agent, for example
`260820-0830-reconciliation.md`. Such a file is still in the set; its author field reads `unnamed`.

Reviews, analyses, plans, specs, decision records and issue files are **not** in the set. They are
written under different constraints and several of them are edited after the fact, which a history file
is not.

### 2. The counting command

`bin/fusion-prose-metric`, committed at `fac97f4`. It is the authoritative count. No hand count and no
`grep` line substitutes for it, in either window.

    bin/fusion-prose-metric <file> [<file> ...]

It prints one row per file carrying the prose em-dash count, the prose word count, the rate per 1000
prose words, the number permitted at one per 1000, and a verdict; then one total row over all inputs.
The total row's rate is the total em-dash count divided by the total prose word count, not the mean of
the per-file rates.

The program reports and never gates. Exit 0 means every named file was measured, and a file thirty
times over the ceiling exits 0 like any other. Exit 1 is a usage error, exit 2 means a named path could
not be read.

**Verified before being relied on.** Run against the six files `bin/fusion-rules coder` emits, it
reproduces the spec's `## The metric` table exactly in the em-dash column and in five of six word
counts. The sixth is a correction rather than a deviation: `chat-voice-de.yaml` reads 617 prose words
where the spec's table read 882. Verified: 882 is the raw whole-file word count that `wc -w` returns,
so the spec excluded the anti-example em-dashes from the numerator and left every excluded region's
words in the denominator. Constructed cases confirm each of the four exclusions
independently, confirm that a file with no em-dash prints a zero row rather than failing, and confirm
both error exits.

**One property of the word count, stated because it is load-bearing for a rate.** A standalone em-dash
is itself counted as a word token, so a file's own em-dashes slightly inflate its denominator. The
effect is bounded by the em-dash count itself, under two per cent of the word count at the rates
observed here, and it depresses the rates of the worst files rather than the best. It therefore lowers
the pre-repair minimum and makes the threshold harder to meet, which is the conservative direction.

### 3. The exclusion rules

A **prose em-dash** is a U+2014 EM DASH that is not inside any of four regions. Prose words exclude the
same four regions, so a file full of exhibits is not credited with the words its exhibits are made of.

1. A fenced code block, opening and closing fence included.
2. An inline code span, delimiters included.
3. A block-quote line, the whole line and not only the marker.
4. In a YAML file, the subtree of an `examples:`, `anti_examples:`, `anti-examples:`, `example:` or
   `anti_example:` key.

Two limits are stated rather than discovered. An indented four-space code block is not excluded. A code
span that opens on one line and closes on another is not matched.

**Only the em-dash is counted.** U+2013 EN DASH is not counted and neither is the hyphen. This is a
narrowing and not an oversight. The fault the corpus is measured for is the em-dash parenthetical; the
en dash is a numeric range in this repository's prose. The project's chat language is German, where the
en dash is the conventional Gedankenstrich, so a German profile forbidding it states a different rule
with a different reading, and this metric does not serve that rule. The assessment
(`circles/260820-2051-style-rules-arrive-and-get-measured/analyses/260820-2308-assessment-of-the-style-rules-spec.md`
F10) asked for the decision to be stated here rather than left to the implementation, and this is it.

### 4. The two window boundaries

**The pre-repair window closes at the commit that carries this document.** That commit is a child of
`fac97f4` and an ancestor of every repair commit in this Circle. The five files are frozen by path in
section 8 below, so the window cannot be re-picked after a result is known.

**The post-repair window opens at the commit that closes this Circle**, meaning the `_t_` to `_b_`
transition on
`circles/260820-2051-style-rules-arrive-and-get-measured/_t_circle.md`. Every corpus repair in the
Circle lands before that commit, which is why the closing commit and not step 7's is the opening
condition. Its first member is the first usable history file, in stamp order, written after it by a
session excluded from neither window under section 5.

The plan step names step 7's commit as the pre-repair closing boundary. Under the exclusion in section 5
the two readings select the same five files, because no session outside this Circle will write a history
file between this commit and step 7. The earlier boundary is used here because it is the one that is
already true.

### 5. Both windows exclude this Circle's own history files, and the pre-repair window as well

The spec excluded this Circle's history files from the **post-repair** window only. A session whose
subject is em-dashes has a primed writer, and the reason is sound. The exclusion must run in both
directions, and this is the sharpest correction this document makes to the records it implements.

Measured: this Circle's own five history files at `fac97f4` carry 10 prose em-dashes over 3163 prose
words, and **three of the five sit at 0.0 per 1000**. A pre-repair window containing any of them makes
the threshold "below 0.0", which no post-repair window can meet. A threshold that cannot be met is not
a demanding test, it is a guaranteed outcome 2, and outcome 2 is the branch that licenses building a
gate. The one-sided exclusion would have licensed the gate by construction.

The exclusion is therefore symmetric: **a history file belonging to
`circles/260820-2051-style-rules-arrive-and-get-measured/` is in neither window.** For the post-repair
window the exclusion additionally reaches any history file written by a session that read this Circle's
planning documents, which is decidable because a dispatch's inputs are recorded.

### 6. Usable, defined

A file is **usable** when all three hold.

1. It is a session history file under section 1.
2. It carries at least **400 prose words**, as reported by the counting command. At the pre-repair
   corpus rate of 12.6 per 1000, a 400-word file is expected to carry five em-dashes, so a rate of zero
   over 400 words is a signal and not an artifact of length. Below that floor a single em-dash moves
   the rate by more than two per 1000, which is half the threshold's distance from zero.
3. It is not excluded under section 5.

A window is usable when it holds **five usable files**. Fewer than five is outcome 3.

**Both windows are exactly five usable files**: the five most recent before the pre-repair boundary,
and the five earliest after the post-repair boundary opens. The decision record fixes five as a floor
and not as a size, and a floor alone does not determine the threshold, because a minimum taken over a
larger window is a lower minimum. Fixing the size is what makes the threshold a single number rather
than a family of them.

That the size is fixed at five rather than higher costs less than it appears. The lowest per-file rate
is **5.0 per 1000 at window sizes of five, ten and twenty** usable files, so the threshold is not
sensitive to the choice anywhere in that range. A later Circle may enlarge the window only by amending
this document **before** the post-repair window opens, never after.

### 7. The threshold

> **The prediction is met when the post-repair window's total row rate is strictly below 5.0 prose
> em-dashes per 1000 prose words**, that figure being the lowest per-file rate observed in the
> pre-repair window.

One test, one number, one comparison. The compared value is the total row that
`bin/fusion-prose-metric` prints over the five post-repair files. The per-file rates are reported
alongside it so that an outlier is visible, but they are not the test.

The spec's phrasing, "below the spread already present among the pre-repair files", is superseded. It
admits four different tests and a protocol registered in advance exists to defeat exactly that.

The decision record fixes the comparison value and does not name which post-repair statistic is
compared against it. The total row is chosen because it is what the named command already prints, so
the test introduces no statistic that the command does not produce. This is recorded as an open
question in section 15, because it is a choice this document made and not one the record made.

### 8. The pre-repair window, measured

Five files, frozen by path. Measured at HEAD `fac97f4` with `bin/fusion-prose-metric`.

| File | Store | Author | Prose em-dash | Prose words | Rate /1000 |
|---|---|---|---|---|---|
| `circles/260819-1645-four-constraints-on-deep-change/history/260820-1120-coder-the-remaining-text-defects-and-the-turns-consolidation.md` | Circle | coder | 17 | 1509 | 11.3 |
| `shared/history/260820-1126-playmaker-direct-dispatch.md` | shared | playmaker | 6 | 1194 | **5.0** |
| `shared/history/260820-1747-coder-three-decisions-realised.md` | shared | coder | 16 | 853 | 18.8 |
| `shared/history/260820-1810-coder-v10-4-release-material.md` | shared | coder | 7 | 838 | 8.4 |
| `shared/history/260820-2103-orchestrator-session.md` | shared | orchestrator | 8 | 825 | 9.7 |
| **total (5 files)** | | | **54** | **5219** | **10.3** |

Lowest per-file rate: **5.0**. Highest: 18.8. Spread: 13.8. Author composition: coder three, playmaker
one, orchestrator one.

Three figures for context, each from the same command.

- The ten most recent usable pre-boundary files: 133 em-dashes over 10 825 prose words, 12.3 per 1000,
  lowest per-file rate 5.0.
- All 549 pre-boundary history files: 7029 em-dashes over 559 241 prose words, **12.6 per 1000**. Ten
  of them sit at 0.0, the most recent stamped `260818-0715`, which is why an unbounded window cannot
  carry a minimum-based threshold.
- The ceiling every one of these files is measured against is 1.0 per 1000.

**The author mix is part of the window and must be reported for the post-repair window too.** A window
of five orchestrator sessions is not comparable with a window of five coder sessions, and this one is
coder-heavy.

### 9. The corpus at the pre-repair boundary

Recorded so the dose is attributable later. The assessment asked for the corpus word count at both
boundaries; this is the first of the two, and the Circle that runs the measurement records the second.

| File | Prose em-dash | Prose words | Rate /1000 |
|---|---|---|---|
| `rules/agent-setup.md` | 15 | 502 | 29.9 |
| `rules/fusion-workbench-conventions.md` | 114 | 7753 | 14.7 |
| `rules/decision-record-examples.md` | 10 | 341 | 29.3 |
| `rules/user-facing-output.md` | 1 | 2248 | 0.4 |
| `rules/critical-stance.md` | 29 | 1557 | 18.6 |
| `fusion-workbench/stilwerk/chat-voice-de.yaml` | 2 | 617 | 3.2 |
| **always-on total, as `bin/fusion-rules coder` emits it** | **171** | **13 018** | **13.1** |
| `CLAUDE.md` | 125 | 8803 | 14.2 |
| **always-on prose an agent actually holds** | **296** | **21 821** | **13.6** |

A prose agent that also draws diagrams holds more. For `analyst` the emitted set adds
`fusion-workbench/stilwerk/default-voice-en.yaml` at 1 over 946 words and `rules/design-diagrams.md` at
20 over 771 words, giving 317 em-dashes over 23 538 prose words, **13.5 per 1000**.

`CLAUDE.md` is **40.3 per cent** of the prose a `coder` holds at dispatch and 37.4 per cent of what an
`analyst` holds. The plan's "roughly 41 per cent" is confirmed under the prose metric.

### 10. Four untreated conditions

Named here rather than left implicit, because each of them weakens the dose the measurement delivers.

1. **`CLAUDE.md` is not repaired in this Circle.** It is the largest single conditioning file, 40.3 per
   cent of an agent's always-on prose, and it runs at 14.2 per 1000. The decision
   `circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2314_o_is-claude-md-inside-the-corpus-this-circle-repairs.md`
   places it in the corrected set statement and leaves its prose alone. Whenever the measurement runs,
   it runs against a corpus whose largest conditioning file was never repaired.
2. **`rules/design-diagrams.md` is not repaired and reaches the likely writers.** It runs at 25.9 per
   1000, the highest rate of any file measured here, and `bin/fusion-rules` emits it to `planner`,
   `analyst`, `taskplanner` and `shaper`. Those four are the agents most likely to write long-form
   history files in the post-repair window. Excluding it is coherent as a corpus definition and
   incoherent as a treatment.
3. **Steps 13 and 14 lower the corpus rate by dilution rather than by repair.** Both add clauses to
   `rules/user-facing-output.md`, which is in the corpus. New clauses carrying no em-dashes lower the
   rate by enlarging the denominator. A corpus rate that falls partly by dilution is a smaller
   treatment than the same fall by repair, and the two are not distinguishable in the corpus rate
   alone. Section 9's word count is what makes them separable afterwards.
4. **The post-repair writers read this Circle's planning documents.** The spec, the plan and the
   decision records are not part of the corpus and are governed by no rule the corpus states, yet a
   later session working from them reads them at length. Section 5's exclusion removes the sessions
   that ran inside this Circle. It does not remove the documents from a later session's context.

The plan's figure for condition 2 reads 25.2 per 1000. The counting command reports 25.9. The
difference is a hand count against the program, and the program governs from step 1 onward.

### 11. The confounds the measurement does not remove

Four, from the spec, restated because the marker scheme in section 12 requires a record moving to
implemented to carry them in its own text.

1. Different sessions do different work, and the register of a release-notes session is not the register
   of a debugging session.
2. The model version moves between the two windows.
3. A session run in the knowledge that it is being measured is not a session run otherwise.
4. The writers of the post-repair files read this Circle's planning documents, which are not corpus.

Confound 4 and untreated condition 4 are the same fact seen from two sides. There is one project, no
control group, no randomisation, and five files per window. **The number this protocol produces is an
observation of a rate over two fixed windows. It is not a controlled test of the causal claim in
finding 10 of `shared/analyses/260816-0740-rhetorical-register-of-agent-output.md`,** and it may not be
reported as one.

### 12. The three outcomes and the marker each earns

The scheme is fixed by
`circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2314_o_what-threshold-does-the-registered-measurement-use-and-which-marker-does-each-outcome-earn.md`.
It covers three outcomes and no others. The two branches are deliberately asymmetric, because a rate
that does not fall licenses a gate whatever the confounds, while a rate that does fall licenses nothing:
every confound in section 11 pushes toward a fall.

| Outcome | Test | Marker on `260816-0740` | What the record must carry |
|---|---|---|---|
| Prediction met | Five usable files per window, post-repair total row below 5.0 | `_a_` to `_i_` | The number, this document's path, **the confounds of section 11 that were not removed, and the condition under which the record would be superseded** |
| Prediction not met | Five usable files per window, post-repair total row at or above 5.0 | `_a_` to `_s_`, superseded by a new open decision carrying the gate question | The number, in the new record, and this document's path |
| Sample not usable | Fewer than five usable files in the post-repair window | Stays `_a_` | The number of usable files found, the reason, and the statement that a usable window needs five |

**The requirement in the first row is a condition and not a suggestion.** Without that sentence the
terminal marker claims more than the observation supports, because a met prediction is not a result on
its own strength. A record moved to `_i_` without its unremoved confounds in its own text is a defect
of the same kind as a wrong number.

### 13. This measurement does not run in this Circle

Stated plainly, because the Circle's Directive names the measured number as one of four outcomes.

**The post-repair window has no members while this Circle runs.** Of the thirteen Circle records on
disk, one is active, one bounded, ten closed and one superseded. Verified at `fac97f4` by reading the
marker on each `*_circle.md`. After the repair lands, the only sessions producing history files in this
repository are this Circle's own, and section 5 excludes those. The window is empty by construction and
no rearrangement inside this Circle fills it.

The Circle therefore ends in **Bounded Closure**, decided in
`circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2314_o_can-this-circle-close-coherent-when-its-fourth-outcome-has-no-measurement-window.md`.
What this document delivers is the half that had to precede the repair and that a later Circle cannot
reconstruct once the repair is in history: the registered protocol, the exact threshold, and the
pre-repair window frozen by path.

**The measurement will be reported on
`shared/decisions/260816-0740_a_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`.**
That record carries the number, this document's path, and the marker its outcome earns under section 12.

**What opens the post-repair window** is the commit that closes this Circle, per section 4. Its first
member is the first usable history file written after that commit by a session outside the exclusions
in section 5. In practice that is the first Circle activated after this one.

### 14. No gate is designed here, and none may be

This document proposes no test, no lint, no `npm test` member, no `bin/` helper and no advisory check
over any prose property. It measures and it reports.

Two things bind that. `rules/critical-stance.md` §4 forbids approximating a question the available
inputs cannot decide, and the causal question is exactly such a question, which is why the mechanism
changed to a pre-registered rate in the first place. And the answered decision `260816-0740` records the
user's own choice of option 4, under which the measurement is a **precondition** for the gate question.
Its reconciliation of 260819-1400 states it directly: no gate is authorised to be built until the
measurement runs. A gate designed now would answer that record's question ahead of the evidence the
user made a condition of answering it.

The counting command is not a gate. It exits 0 on a file thirty times over the ceiling, nothing wires it
into `npm test`, and its header carries that property as a decision with its precedent.

### 15. Three under-specifications in the source records, resolved here

Reported as findings rather than fixed silently. Each is a place where the plan step or a decision
record admitted more than one reading, and each is resolved above.

| Under-specification | Where | Resolution | Section |
|---|---|---|---|
| The exclusion of this Circle's history files is stated for the post-repair window only. Applied one-sided it puts three 0.0-rate files in the pre-repair window and makes the threshold impossible to meet, which forces outcome 2 by construction. | Spec C10 strengthening 2, plan step 2 | Exclusion is symmetric, both windows | 5 |
| The decision fixes five usable files as a **floor** and calls the threshold the lowest per-file rate in the window. A floor does not determine a minimum, because a larger window has a lower one. Over all 549 pre-boundary files the minimum is 0.0. | Decision `260820-2314` threshold record | Window size fixed at exactly five, both windows; robustness reported at five, ten and twenty | 6 |
| The threshold names the comparison value and not the post-repair statistic compared against it. Per-file minimum, per-file maximum, total and median are four different tests. | Decision `260820-2314` threshold record, plan step 2 | The total row that the named command prints | 7 |

A fourth item is a stale number rather than an ambiguity. The plan step gives `rules/design-diagrams.md`
as 25.2 per 1000 where the counting command reports 25.9. The spec's `## The metric` table gives
`chat-voice-de.yaml` 882 prose words where the command reports 617, 882 being the file's raw word count.
Neither figure is load-bearing for the threshold, and the program governs from step 1 onward.

## Implications

**The threshold is demanding and it is meetable.** A post-repair total below 5.0 against a pre-repair
total of 10.3 is a fall of more than half. Every file in the pre-repair window is above the stated
ceiling of 1.0, the lowest by a factor of five, so no part of this test asks the corpus repair to
produce compliance. It asks it to produce a fall.

**The dose is weaker than the corpus table suggests.** Of the 21 821 prose words an agent holds at
dispatch, the repair reaches roughly 13 000, and two of the four untreated conditions concern files that
carry the highest rates measured here. A null result is therefore weak evidence against the imitation
inference, and the marker scheme already encodes that asymmetry.

**The pre-repair window is coder-heavy and small.** Three of five files are `coder` sessions. If the
post-repair window is written mostly by `analyst` or `planner`, the comparison carries an author shift
that the number alone will not show. Reporting the author composition of both windows is what makes that
visible, and section 8 requires it.

## Recommendations

1. **Commit this document before any repair step.** It is written against HEAD `fac97f4` and its value
   depends on that ordering. Route to the user, who commits.
2. **The Circle that runs the measurement reads this document first and amends nothing in it.** Route to
   `analyst`, in a later Circle. Enlarging a window, changing the threshold or re-picking the five files
   after the post-repair window has opened destroys the property this document exists to create.
3. **Record the corpus word count again at the post-repair boundary**, in the shape of section 9, so the
   dilution in untreated condition 3 is separable from the repair. Route to `analyst`, same Circle.
4. **Report the author composition of both windows with the number.** Route to `analyst`, same Circle.

## Filed Issues

None. The three under-specifications in section 15 are resolved in this document and belong to the
records that carry them, all three of which are open (`_o_`) and will be read by the user. Filing them
again as issues would duplicate live records rather than add anything.

## Sources

- `circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2324_o_plan-style-rules-arrive-and-get-measured.md`
  step 2, the authority for this document's required content and order
- `circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2249_o_spec-style-rules-arrive-and-get-measured.md`
  `## The metric` and C10, with the binding orchestrator section appended 260820-2314
- `circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2314_o_what-threshold-does-the-registered-measurement-use-and-which-marker-does-each-outcome-earn.md`
  the threshold and the three-outcome marker scheme
- `circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2314_o_can-this-circle-close-coherent-when-its-fourth-outcome-has-no-measurement-window.md`
  Bounded Closure, and the count of live Circles
- `circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2314_o_is-claude-md-inside-the-corpus-this-circle-repairs.md`
  untreated condition 1
- `circles/260820-2051-style-rules-arrive-and-get-measured/analyses/260820-2308-assessment-of-the-style-rules-spec.md`
  F2, F3 and F10
- `shared/decisions/260816-0740_a_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
  option 4, the reconciliation of 260819-1400, and the record this measurement is reported on
- `shared/analyses/260816-0740-rhetorical-register-of-agent-output.md` finding 10 and recommendation 4
- `bin/fusion-prose-metric` header, the exclusion rules and the reports-never-gates property
- `bin/fusion-rules` lines 202-206, the four diagram agents, and line 428, the emission
- `rules/critical-stance.md` §4
- The 554 history files under `shared/history/` and `circles/*/history/`, measured at `fac97f4`

## Open Questions

- [ ] The post-repair statistic compared against the threshold is the total row, chosen in section 7
      because the named command prints it. The decision record fixed the comparison value and not this.
      The user may overrule it at that record, and must do so before the post-repair window opens.
- [ ] Whether `rules/design-diagrams.md` is repaired before the measurement runs. It carries the highest
      rate measured here and reaches four of the likely writers. This document names it as untreated;
      whether it stays untreated is a question for the Circle that runs the measurement.
- [ ] Whether a five-file window is the right size once a real post-repair window exists. The minimum is
      5.0 at five, ten and twenty files today, so the question is not urgent, and it may be answered
      only before the post-repair window opens.
