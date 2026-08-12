# Analysis: The largest consumer, read for the first time

**Date:** 2026-08-12 03:03
**Type:** Document Study / Gap, against fusion's largest consuming project
**Status:** Draft
**Requested by:** user, via orchestrator dispatch

---

## Question

Three hours ago an analysis established that fusion holds exactly one user-filed defect in its
entire history, and concluded that the framework is not over-tested but under-observed. It named
the missing input plainly: nothing records what happens to a consuming project. This analysis opens
that channel for the first time, against `unite-co-creator`.

The question is not whether fusion works. It is what fusion costs a real project, what it breaks
there, and which of the beliefs on both sides survive contact with four and a half months of
evidence nobody has read.

---

## Scope

**The project.** `/Users/k1/Projects/productive/unite-co-creator`, a Go and TypeScript product over
a large ontology, built by three people since 22 March 2026. At the time of reading: 2,759 commits,
1,318 session histories in the shared store and 1,707 across all stores, 1,148 issue records, 68
decision records, 133 analyses, 123 review files, 49 consultations, 5 investigations, 4 Circles,
and a 43 MB archive of thirty cleanup runs. The workbench is git-tracked, which is why any of this
survived to be read.

**What is missing, and why it matters.** The clone carries no runtime state. `.guard-state/`,
`orchestrator-events.jsonl`, `agentstate.yaml` and `.fusion-setup` are all gitignored, so the
project's own event log and guard counters do not exist on this machine. Three of the seven
questions asked of this analysis point directly at those files. The gap is itself the first
finding, and it is recorded as such below rather than worked around silently.

**Substitutes used, and their limits.** Timing comes from `krk`, the sibling project whose 18 MB
hook-level event log and 74 KB orchestrator log do survive locally, cross-checked against
`unite-co-creator`'s git commit timestamps and session-history stamps. `krk` is a smaller, solo,
eleven-day project. Where a number comes from `krk` it says so, and it is not presented as this
project's number.

**Read but not re-derived.** `shared/analyses/260812-0022-where-the-complexity-comes-from-and-what-would-have-to-go.md`.
Its findings are tested against this project rather than repeated. Four of them do not survive.

**Read-only.** Nothing was written into the target project. Its working tree was verified clean at
the end of the read, and no `.guard-state` directory was created there, because the hooks correctly
no-opped in the absence of a setup marker.

---

## Headline

**The paperwork is bigger than the product.** `unite-co-creator` carries 36 MB of workbench prose
in 4,241 files against 13.8 MB of Go and TypeScript source. Excluding the archive it is still 16.3
MB against 13.8 MB. Nineteen percent of every line ever written in this repository went into
`fusion-workbench/`, and that share rose from 4.8 percent in April to 32.8 percent in August.
Twenty-six percent of all commits touch nothing but the workbench.

**The tooling is not what the project thinks about.** Every one of the 68 decision records is about
the product. Not one asks a question about fusion. The user's own cadence tool explicitly filters
fusion out of his work summary as noise. The ratio the fusion repository cannot produce, a consumer
does: the records are about the subject, and the tool is invisible in them by design and loud in
them by accident.

**The single largest cost fusion imposes here is a default nobody chose.** fusion's shipped
protected-path list contains `rules/**`. In fusion's own repository that means fusion's rules. In a
consuming project it means the project's own documentation. `unite-co-creator` never narrowed it,
because the seeded configuration file tells a project that declaring nothing inherits everything
and never suggests that inheriting everything is wrong here. The result is 53 live records that
exist only because agents cannot write the project's own rule files, a hand-off workflow invented
to route around it, one agent that learned to write through `Bash` instead, and one mandated manual
paste that deleted the thing it was repairing.

PLACEHOLDER_HEADLINE_4

---

## Findings

### 1. What this project is building, and how much of the workbench is about it

PLACEHOLDER_F1

### 2. Where fusion failed this user

PLACEHOLDER_F2

### 3. How long things take, and where the time actually goes

The user's report is that operations take unbearably long and that Setup in particular takes far
too long. The log supports the first claim, and contradicts the second in a way that matters more
than the claim itself.

**`unite-co-creator`'s own event log does not exist on this machine.** It is gitignored. Every
number in this section comes from `krk`, the sibling project, whose hook-level log survives with
37,186 events and millisecond stamps carrying an explicit `Z`. Where the same quantity can be
measured in `unite-co-creator` from git and filename stamps, both are given.

**Setup is fast. That is the surprise.** Measured as the contiguous run of tool calls immediately
preceding the `session_start` event, across 17 sessions:

| Measure | Value |
|---|---|
| Median Setup duration | 3.9 minutes |
| Mean, excluding one 168-minute outlier | 3.8 minutes |
| Median tool calls in Setup | 15 |
| Longest ordinary Setup | 7.3 minutes |

Four minutes is not the complaint. What Setup actually costs is context, not clock. The
orchestrator's own prompt is 164,716 bytes and the rules `bin/fusion-rules` emits for it total
132,732 bytes, so a session begins by reading 297,448 bytes, roughly 75,000 tokens, before it has
looked at a single project file. In `unite-co-creator` the project's own always-on rules and
`CLAUDE.md` add about 30 KB on top of that.

Every sub-agent repeats a smaller version of the same read. A plain `coder` loads 98,443 bytes of
fusion rules against a 9,532-byte prompt of its own: ten times as much framework as job
description. Across all sixteen agents the fleet's combined prompt and rule surface is 2,147,635
bytes, about 537,000 tokens.

**A Turn is where the time goes.** From `krk`'s 39 completed Turns:

| Percentile | Turn duration |
|---|---|
| p25 | 41 minutes |
| median | 75 minutes |
| p75 | 122 minutes |
| p90 | 297 minutes |
| max | 1,541 minutes |

Sessions ran 3.4 to 13.2 hours, median 6.0 hours. Individual executor dispatches were shorter and
tighter: 59 measured task spans, median 30 minutes, p90 76 minutes.

**The number that matches the user's perception is neither of those.** It is the gap between
`session_start` and the first event that represents work:

| Session | Time to first work event |
|---|---|
| 06-10 00:45 | 5.7 min |
| 08-02 08:14 | 14.6 min |
| 06-10 14:48 | 18.0 min |
| 08-06 20:58 | 17.8 min |
| 08-05 19:29 | 22.0 min |
| 08-10 06:45 | 23.4 min |
| 08-03 08:39 | 76.9 min |
| 08-07 17:34 | 125.8 min |
| 08-11 12:55 | 151.6 min |
| 08-10 23:08 | 480.2 min |

Median about 23 minutes, and a long tail. Five of the seventeen sessions reached no work event at
all before the next session started, which means Setup ran and the session then produced nothing
the log recognises as work. Setup itself is four minutes. What sits between Setup and the first
task is scope resolution, reconciliation reading, queue construction and gate exchanges, and that
is where twenty minutes to eight hours disappear.

**Cross-check in `unite-co-creator`.** 385 commit bursts separated by gaps of ninety minutes or
more, median 58 minutes and p90 254 minutes, totalling 630 hours of active time over 139 days. The
median gap between consecutive agent session-history stamps on the same day is 23 minutes, which
puts a typical single agent dispatch in the same range as `krk`'s 30-minute median task. The two
projects agree.

**Verdict.** Setup is not the problem and the user's diagnosis of it is wrong. The problem is that
nothing short exists. There is no path from "I have a small thing to do" to doing it, because the
entry sequence is the same whether the work is a typo or a twenty-step plan, and the first work
event is a median twenty-three minutes away. The 75-minute median Turn is honest work; the
23-minute median approach to it is overhead the user is paying on every request regardless of size.

### 4. Whether the rules decay during a session

PLACEHOLDER_F4

### 5. The removal candidates, tested against a real consumer

PLACEHOLDER_F5

### 6. The guard in the field

PLACEHOLDER_F6

### 7. What this project needs that fusion does not offer

PLACEHOLDER_F7

### 8. What kind of defect fusion's review apparatus finds in a real product

The prior analysis hand-classified 90 of fusion's 443 issue records and found that 44 percent were
prose contradicting the mechanism it describes, against 23 percent ordinary run-time faults in
code. It read that as fusion's signature, on the grounds that fusion's dominant artifact is
executable specification written in English. It had no control.

This is the control. A random sample of 90 of `unite-co-creator`'s 1,148 issue records, seed fixed,
classified by hand against the same six categories, by title with the body read wherever the title
was ambiguous.

| Class | fusion (n=90) | unite-co-creator (n=90) |
|---|---|---|
| Prose contradicts the mechanism or another claim | 44% | 22% |
| Run-time fault in shipped code | 23% | 51% |
| Gate, lint or test measures less than it claims | 9% | 12% |
| Fusion's own bookkeeping is wrong | 7% | 3% |
| A route or case that was never built | 6% | 11% |
| Residual of the deleted shell classifier | 11% | not applicable |

The prior analysis's direction holds and its explanation is confirmed. A real product inverts the
top two classes: half its defects are code that misbehaves, a fifth are prose that lies. fusion is
the mirror image.

**Two things the comparison shows that the prior analysis did not.**

The prose class is not a fusion pathology. It is one issue in five in an ordinary Go and ontology
product, and the titles are the same shape: a doc comment naming callers that no longer exist, a
retired constant still cited by a rule, thirteen live surfaces citing a rule number that was
withdrawn, sixty hand-copied ontology counts that no gate compares against the file that owns them.
Any project that documents heavily and cites precisely generates this class. fusion has twice the
share because it has ten times the prose per unit of mechanism, not because it is doing something
categorically different.

The bookkeeping class is not zero here. Three percent of a real product's defect records exist
because fusion's own paperwork went wrong. Extrapolated across 1,148 records that is roughly 34
records of pure tool tax, filed and worked by a team building something else.

**Confidence.** Single-rater classification, mostly from titles. Titles in this project are unusually
descriptive full sentences, which makes title-based classification more reliable here than it would
be elsewhere, but the 22 percent figure carries a 95 percent interval of roughly 14 to 32 percent
and the 51 percent figure roughly 40 to 61 percent. The ordering is safe. The exact shares are not.

### 9. What the upgrades cost, in a project that could not opt out

Fourteen distinct fusion versions are named in this project's records, from 1.9.7 to 5.10.0, across
four and a half months. The plugin installed on this machine right now is 7.3.0, so the project has
lived through more versions than its records name.

One upgrade has a measured price. The v4.0.0 Circle-container restructure moved every store and
changed the state-marker syntax from brackets to underscores. It moved the files and did not
rewrite the cross-references inside them. From
`fusion-workbench/shared/issues/260801-0156_c_live-tracking-files-cite-the-pre-v4-workbench-layout-and-bracket-markers.md`:

> The migration moved the files. It did not rewrite the cross-references inside them. The result is
> that a majority of the *live* tracking surface cites paths and filenames that no longer resolve.
> This is not a cosmetic problem: cross-references are how an agent picks up context on a record it
> did not write, and a dangling one silently yields nothing rather than failing loudly.

Sixty of 141 live records cited a dead path and 85 cited a dead marker. The repair, recorded in the
same file's closure note, was **893 citations rewritten across 137 files**, done as a two-pass
resolve-then-rewrite because a naive regex would have produced correctly formatted citations that
still dangled.

The record also names a failure mode fusion should carry upstream:

> The bracket form is a shell-glob character class, so a stale citation used in a glob matches the
> empty set and, under `bash`, fails silently rather than erroring.

The underscore form fusion adopted fixes exactly that. The migration that introduced the fix left
the consuming project to pay for it by hand, and fusion's own `/fusion:migrate` skill does not
rewrite citations.

---

## Implications

PLACEHOLDER_IMPL

---

## Recommendations

PLACEHOLDER_REC

---

## Where this contradicts the prior analysis, and where it contradicts the user

PLACEHOLDER_CONTRA

---

## Confidence and counter-evidence

PLACEHOLDER_CONF

---

## Sources

PLACEHOLDER_SOURCES
