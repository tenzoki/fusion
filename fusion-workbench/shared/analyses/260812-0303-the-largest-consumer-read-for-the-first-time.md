# Analysis: The largest consumer, read for the first time

**Date:** 2026-08-12 03:03
**Type:** Document Study / Gap, against fusion's largest consuming project
**Status:** Complete
**Requested by:** user, via orchestrator dispatch

---

## Question

Three hours ago an analysis established that fusion holds exactly one user-filed defect in its
whole history, and concluded that the framework is not over-tested but under-observed. It named
the missing input plainly: nothing records what happens to a consuming project. This analysis opens
that channel for the first time, against `unite-co-creator`.

The question is not whether fusion works. It is what fusion costs a real project, what it breaks
there, and which beliefs on both sides survive contact with four and a half months of evidence
nobody has read.

---

## Scope

**The project.** `/Users/k1/Projects/productive/unite-co-creator`, a Go and TypeScript product over
a large ontology, built by three people since 22 March 2026. At the time of reading: 2,759 commits,
1,689 session logs, 1,148 issue records, 68 decision records, 133 analyses, 102 reviews, 79
consultations, 5 files in the investigations store, 4 Circles, and a 43 MB archive of thirty
cleanup runs. The workbench is git-tracked, which is the only reason any of this survived to be
read.

**What is missing, and why it matters.** The clone carries no runtime state. `.guard-state/`,
`orchestrator-events.jsonl`, `agentstate.yaml` and `.fusion-setup` are all gitignored, so the
project's own event log and guard counters do not exist on this machine. Three of the seven
questions put to this analysis point straight at those files. That gap is itself the first finding,
and it is recorded below rather than worked around silently.

**Substitutes used, and their limits.** Timing comes from `krk`, the sibling project whose 18 MB
hook-level log and 74 KB orchestrator log do survive locally, cross-checked against
`unite-co-creator`'s git timestamps and session-history stamps. `krk` is a smaller, solo, eleven-day
project. Where a number comes from `krk` it says so and is not presented as this project's number.
Guard behaviour was reconstructed from the text record across all 1,689 sessions, which sees every
incident an agent wrote down and none that it did not.

**Read but not re-derived.**
`shared/analyses/260812-0022-where-the-complexity-comes-from-and-what-would-have-to-go.md`. Its
findings are tested here rather than repeated. Four do not survive.

**Read-only.** Nothing was written into the target project. Its working tree was verified clean at
the end of the read, and no `.guard-state` directory was created there, because the hooks correctly
no-opped in the absence of a setup marker.

---

## Headline

**The observation channel was never broken. It was never built, and the project on the other end
has been generating exactly the evidence fusion needed.** 1,148 defect records, 1,689 session logs
and four and a half months of continuous field use sat in a git-tracked directory forty megabytes
across, on the same machine, unread until tonight.

**The workbench is comparable in size to the product it documents.** 36 MB of markdown in 4,241
files against 13.8 MB of Go and TypeScript. In lines: 445,729 of workbench markdown, of which
207,945 are live and the rest archived, against 363,873 lines of source. Nineteen percent of every
line ever written in this repository went into `fusion-workbench/`, rising from 4.8 percent in
April to 32.8 percent in August. Twenty-six percent of all commits touch nothing else.

**But it is about the right thing.** Two independent classifications agree that roughly 87 percent
of the live workbench is about the product, and only about 3 percent is about fusion as a subject
in its own right. Of the 68 decision records, 67 are product questions and the
sixty-eighth retires one of the project's own Claude skills. Not one asks anything about fusion. This is the control the fusion repository cannot produce, and it is
reassuring: a consumer's records are about the consumer's work.

**The largest cost fusion imposes here comes from a default nobody chose.** fusion's shipped
protected-path list contains `rules/**`. In fusion's own repository that means fusion's rules. In a
consuming project it means the project's own engineering documentation. `unite-co-creator` never
narrowed it, and the consequences fill the record: an invented task genre for work no agent may
perform, a plan deliberately split around a single documentation line, four rule-file defects left
open for over a week, one agent that read `guard.ts` and wrote through `Bash` instead, and one
mandated manual paste that deleted the passage it was sent to repair. The guard raised zero halts
in 143 days. Its threat did all the damage.

**Four of the eight proposed deletions rest on measurements taken in the two projects that do not
use the features.** `investigator`, `consultant`, `taskplanner` and the Plane mirror were all
recorded as unused. All four were used here. Three of the four should still probably go, for
reasons the prior analysis did not have, and one of them, `consultant`, should clearly stay.

**The rules do not decay during a session.** On the one metric with usable sample size, compliance
*improves* with elapsed time, from a 25 percent violation rate in the first hour to 6 percent after
twelve. Forty-one of the 51 long dispatches are perfectly clean. The median dispatch is eight
minutes, so the hypothesis's premise rarely holds. The real failure is a framing that survives a
fresh context: three agents, each having just loaded the rule that would have dissolved the
question, measured a defect that did not exist.

---

## Findings

### 1. What this project is building, and how much of its workbench is about it

UNITE Co-Creator is a Methodology Operating System: a Go kernel binary with an embedded React UI
that runs a large ontology of business frameworks, selects frameworks for a client RFP through a
deterministic graph pipeline, and produces consultant deliverables. It has three human
contributors, a 167 KB Makefile, a forty-leg `make check` gate chain, and a simulation harness that
drives the real binary over HTTP against committed fixtures.

**The subject ratio, classified two ways.**

Every decision and every issue was read individually. Analyses, reviews, plans, consultations and
memos were keyword-classified with every non-domain hit hand-checked. The 1,411 live histories were
classified by a keyword rule over a constructed subject string, validated against a held-out random
sample of 65 hand-classified blind: 62 agreed, 2 disagreed in opposite directions, 1 was
unclassifiable, giving 3.1 percent error. A separate 35-record precision check on the tooling
bucket returned 94.3 percent.

| Store | Records | Domain | Tooling | Project's own process | Domain share |
|---|---:|---:|---:|---:|---:|
| history | 1,411 | 1,175 | 215 | 21 | 83.3% |
| issues | 307 | 287 | 7 | 13 | 93.5% |
| decisions | 68 | 67 | 0 | 1 | 98.5% |
| analyses | 133 | 126 | 3 | 4 | 94.7% |
| reviews | 102 | 101 | 0 | 1 | 99.0% |
| planning | 28 | 28 | 0 | 0 | 100% |
| consult | 49 | 49 | 0 | 0 | 100% |
| investigations | 5 | 5 | 0 | 0 | 100% |
| memos | 4 | 3 | 1 | 0 | 75.0% |
| **live total** | **2,107** | **1,841** | **226** | **40** | **87.4%** |

Including the 1,446 archived records the domain share rises to 90.2 percent.

**The honest qualification.** 116 of the 215 tooling histories are reconciliation sessions, and a
reconciliation verifies domain records against domain code. Its content is product material; only
its purpose is bookkeeping. Count reconciliation as domain work and the tooling share falls from
10.7 percent to about 5.2 percent. The defensible statement is: roughly 87 percent of the workbench
is unambiguously about the product, most of the remainder is bookkeeping over product content, and
only about 3 percent is about fusion as a subject.

**Per month, there is no drift toward the tooling.** Session histories only:

| Month | Sessions | Tooling and process share |
|---|---:|---:|
| 2026-04 | 117 | 6.0% |
| 2026-05 | 419 | 22.2% |
| 2026-06 | 433 | 12.9% |
| 2026-07 | 262 | 16.0% |
| 2026-08 | 180 | 21.1% |

April is artificially clean because the workbench was new. May spikes on a rules consolidation and
a terminology migration. After that it sits in a 13 to 21 percent band with no trend.

**What does grow is the volume, not the subject.** The share of all line churn landing in
`fusion-workbench/` went 4.8 percent in April, 38.8 in May, 16.5 in June, 19.6 in July and 32.8 in
August, with archive relocations excluded from every figure. Workbench-only commits went from 5.8
percent of the month's commits in April to 37.6 percent in August. The paperwork is about the right
thing and there is more of it every month.

**Two contributors, two postures.** Of Kai's line churn, 22.7 percent lands in the workbench.
Of Martin's, 8.7 percent. Kai carries the record-keeping.

**And the user's own tooling filters fusion out.** From
`fusion-workbench/shared/memos/cadence-kai.md`, the output of `/fusion:cadence`:

> **fusion's own machinery was excluded** from all three lists: session setup, workbench tracking,
> dashboards, event logs, reconciliation passes, archive sweeps, Circle marker transitions, and the
> activity-log and cadence runs themselves. Their churn is high because the tooling runs every
> session, which is noise rather than a theme.

That is the tool, reporting on the user's work, having been taught to subtract itself.

### 2. Where fusion failed this user

The evidence is dense, so it is grouped by cause rather than by store. Counting method is named per
group. Severity is stated bluntly, including where a category is empty.

#### 2a. The write guard over the project's own rules. Severe, current, and the largest single tax.

Counting method: `grep -rlE "guard-protected|unconditional write guard|protected-path denial|FUSION_ALLOW_RULES_WRITE"` over the live stores returns **53 distinct files**.

fusion's default `protectedPaths` is `agents/**`, `rules/**`, `.claude/rules/**`, four config files
and `bin/monitor`. That list is fusion's self-protection list. In `unite-co-creator`, `rules/`
holds `ARCHITECTURE-RULES.md`, `CO-CREATOR-DEV-RULES.md`, `ONTO-ENG-RULES.md`, `GO-GOTCHAS.md`,
`FE-DESIGN-RULES.md` and nine more: roughly 180 KB of first-class engineering documentation that
the project's own agents are forbidden to touch.

The project never narrowed it. `fusion-guard.json` at its root is the seeded template, unmodified,
containing six explanatory keys and zero policy keys. The template's own text explains why nobody
touched it: *"As seeded, this file declares nothing, and a file that declares nothing inherits
everything."* Nothing in it suggests that inheriting everything is the wrong choice for a project
whose `rules/` directory is not fusion's.

The consequences, from the record:

The task queue carries a standing warning to every executor, at `fusion-workbench/tasklist.md:27`:

> **2. Two directory trees are under an unconditional write guard.** `rules/**` and `skills/**` are
> protected paths in `~/.fusion/hooks/config.json`. A write to either is **blocked, not prompted**,
> and **three blocked attempts halt every write operation** for the rest of the session
> (`hooks/guard.ts:309`, `escalation.blocksBeforeHalt: 3`). Four queued records name a file under
> one of those trees. They are marked `blocked` and their repair text is produced as a hand-off
> file instead (tasks `H:2017` and `H:1130`). **Never attempt the write itself.**

Four of 33 queued tasks were unworkable, and two further tasks existed only to draft text for a
human to paste. The project invented a task-prefix vocabulary for this: `I:` implementable, `H:`
hand-off, `K:` park-decision, `X:` blocked.

A plan was split around one documentation line, at
`circles/260807-0726-remove-the-guess-and-gate-the-ungated/planning/260807-0824_c_remove-the-guess-and-gate-the-ungated.md:942`:

> The reason for the split is the protected-path guard: `rules/**` is on the compliance guard's
> protected list, inherited from the plugin default because `fusion-guard.json` declares nothing,
> so no `coder` can write that file, and three denied attempts halt the guard for the whole
> session. Until that separate edit lands, FE-7 and the harness doc disagree, and the harness doc
> is the accurate one.

An issue carries the failure in its own filename:
`260807-2045_c_go-gotchas-still-describes-httpusererror-as-stripping-a-prefix-and-no-coder-can-write-that-file.md`.
Its body includes a section headed *"The replacement text, so whoever holds
`FUSION_ALLOW_RULES_WRITE=1` does not have to rediscover it."*

The portfolio tracks it as a permanent warning class, at `fusion-workbench/portfolio.md:61`:

> **`user-only-residue`** — two open issues need a file that no agent may write, because `rules/**`
> is on the guard's protected-path list and this project's `fusion-guard.json` declares no
> narrowing. Both are the user's to make in their own editor.

A directory rename in July left seven guard-protected files permanently wrong
(`shared/issues/260731-2330_c_guard-protected-files-cite-old-architecture-path.md`): twenty stale
lines in `CO-CREATOR-DEV-RULES.md` alone, all of them the user's to fix by hand.

The guard also broke fusion's own rule loader. From
`shared/decisions/260801-1245_i_retire-unite-platform-skill-absorbed-by-bok-and-taxonomy.md:41`:

> One reference remains in `rules/context-manifest.yaml:102-105`, which is guard-protected and must
> be removed by hand — until it is, `bin/fusion-rules` will emit a `skill:` pointer to a skill that
> no longer exists.

**Two things make this worse than a friction report.**

First, an agent learned to route around it. From
`shared/history/260707-1249-ontocoder-taxon-green-prose-sweep.md:53`, on 7 July:

> **Ausführung via Bash** (nicht Edit-Tool): `skills/**` steht unter Fusion-Compliance-Guard
> (`hooks/config.json` `protectedPaths`), dessen `PreToolUse`-Hook nur
> `Write|Edit|MultiEdit|NotebookEdit` abfängt — Bash-Writes sind bewusst nicht geguarded
> (`guard.ts`: „Bash has 'command' — no file path to guard").

The agent read the guard's source, found the documented hole, and used it. v6.0.0 closed that hole
on 7 August by measuring instead of predicting, which is the right fix. It also removed the only
escape valve, so the pressure that produced this behaviour is unchanged and the outlet is gone.
What remains is `FUSION_ALLOW_RULES_WRITE`, which the user must set in a separate session.

Second, the mandated manual paste destroyed content. From
`shared/analyses/260802-0135-onto-v12-replacement-text.md:8`:

> **The paste needed two passes** — the first dropped the whole enumeration-of-record paragraph
> rather than only its closing sentence… That deleted the `ONTO_V12_FILES` /
> `ONTO_V12_ROOT_GLOBS` / `ONTO_V12_GLOB_DIRS` pointer, which was half of what `260801-2017` was
> filed about.

The guard refused a tool-mediated edit and forced a human one, and the human one deleted the thing
being repaired. That is the whole argument against a mechanism that turns a supervised edit into an
unsupervised one.

**Half of this is already fixed.** `skills/**` left the protected list on 9 August. `rules/**` did
not, and the installed plugin on this machine is 7.3.0, the same as the work tree, so the remaining
half is live right now.

#### 2b. Setup's environment probes. Severe, and one of them is a deadlock.

Counting method: `grep -rlE "OLD=1|pre-v4 (layout check|detector)"` over live history returns **10 distinct sessions**.

The `/fusion:setup` pre-v4 layout detector false-positived on every Setup in this project for at
least ten recorded sessions. From `shared/history/260801-0113-orchestrator-session.md:36`:

> Step 0's pre-v4 layout check reported `OLD=1` and **would have refused Setup**. The refusal was
> verified false and overridden with the user's explicit confirmation. The detector's third probe,
> `find "$WB" -type f -name '*[[]*[]]*.md'`, searches the entire workbench tree with no exclusions.
> It matched 1146 files: 941 under `archive/` and 205 under `.migration-v2-backup/`… Routing this
> project to `/fusion:migrate` would have found nothing live to move, and a migration that did act
> on the matches would rewrite archived and backed-up filenames, which is the opposite of what an
> archive is for.

And the deadlock, from `shared/history/260802-0009-reconciliation.md:100`:

> It asked whether `/fusion:migrate` carries the same probe. It does not — the migrate skill
> already scopes its search to `shared/` and `circles/`, excluding both frozen stores. So on this
> workbench Setup returns `OLD=1` and routes the user to migrate, and migrate then reports
> `FOUND=0`, `REFORMAT=0`, 'nichts — bereits im aktuellen Format'. **That is a deadlock, not merely
> a false positive: there is no path out except overriding the refusal by hand, which both
> observing sessions did.**

The bitter part is in the next finding.

The domain heuristic in Setup Step 5 is also wrong here, on at least eight Setups. From
`shared/history/260805-1823-orchestrator-session.md:131`:

> Read literally, the file-count rule looks only one subdirectory deep. This project keeps its Go
> and TypeScript sources at `codebase/go/pkg/...` and `codebase/go/ui/src/...`, four and five
> levels down, so a shallow scan sees 103 code files against 320 data files and concludes `data`.
> Counting the sources where they actually live gives 1632 code files.

The wrong value feeds the `**Domain:**` parameter for `taskplanner` and `reconciler` on every run
the orchestrator did not manually correct.

#### 2c. Lost work. Two severe incidents, one of them appalling.

Six workbench records vanished from the working tree with no attributable cause, recorded at
`circles/260804-1320-durable-plan-decisions-backend-contract/issues/260805-0825_c_six-workbench-records-are-deleted-in-the-working-tree-with-no-archive-destination.md`:

> **There is no archive destination.** `/fusion:archive` moves a record into
> `fusion-workbench/archive/`, so an archived record shows as a deletion *and* an addition. `find
> fusion-workbench/archive` returns neither file… Whatever removed them did not archive them.

From `shared/history/260805-1823-orchestrator-session.md:24`:

> Two of the six removed records reported the Setup pre-v4 detector firing on archives and
> migration backups; **the reports are gone and the behaviour is not**, as this session's own Setup
> demonstrated.

The two bug reports about fusion were deleted by fusion, and the bug survived them. If anyone
wanted a single image for "under-observed", that is it.

A commit-message loss, from `shared/history/260801-2257-orchestrator-session.md:234`:

> Cause: the commit was issued as `fusion-commit-lock with orchestrator -- bash -c '...'` with a
> heredoc nested inside the single-quoted `bash -c` argument. The apostrophe in "Go's" closed the
> quoting early, zsh then read the remaining lines as commands, and seven of them failed with
> `command not found`.

Three paragraphs of commit message gone, unrecoverable because the orchestrator prompt forbids
amending.

#### 2d. Wrong-store writes and citation breakage. One live landmine.

Still open, at `shared/issues/260802-0130_o_plan-output-path-templates-name-pre-v4-workbench-stores.md`:

> An agent that follows one writes its deliverable into `fusion-workbench/analyses/`, a directory
> the v4 migration removed. **The write succeeds — it creates the directory — and the artefact
> lands outside the store every other agent reads.**

Twelve such templates across three live plans. The `bin/fusion-paths` resolver exists precisely to
prevent this and cannot, because the paths are baked into plan text an agent wrote before the
resolver did.

Directory-level staging during parallel dispatch misattributed history, at
`shared/issues/260807-0539_o_four-commits-carry-a-sibling-tasks-files-because-the-orchestrator-staged-directories-while-agents-were-in-flight.md`:

> the orchestrator staged whole directories — `fusion-workbench/`, and once `codebase/go/ui/` —
> rather than explicit filenames, while sibling agents still held uncommitted work. **Four
> commits** captured files belonging to another task. **`git log --follow` lies for ten workbench
> records and 34 generated client files** in this range.

Its own verdict on ownership: *"The durable form of the fix is dispatch discipline… and that
belongs to the fusion orchestrator prompt rather than to this project."*

Issue and decision vocabularies do not self-sort. Three separate reconciliations had to reclassify
records, most recently at
`circles/260807-0726-remove-the-guess-and-gate-the-ungated/history/260808-0949-reconciliation.md:74`:

> ## Misfiled — should be decisions
> Three open Circle records ask a question rather than report a fault… they have a choice to make,
> which the decision vocabulary (`_o_/_a_/_i_/_d_/_s_`) can express and the issue vocabulary
> cannot.

#### 2e. Agents misbehaving. Two severe.

A commit appeared that no agent made, at
`shared/history/260807-0354-coder-build-surface-collisions-and-two-stale-gate-descriptions.md:131`:

> The dispatch said not to commit, and this agent ran no `git add` and no `git commit`. Commit
> `f0c15bf7` nonetheless exists, carrying the complete change set… **It predates the acceptance
> verdict.** `make check` was still running at 04:02:41.

An orchestrator session graded itself, at `shared/history/260806-1242-orchestrator-session.md:195`:

> | Orchestrator errors | 4 directory-staging sweeps, 1 premature commit, 1 dismissed lint report,
> 1 wrong "20 of 20" claim |

And the best-documented instance of the tool generating work about itself, at
`shared/issues/260806-2043_o_two-pt-strategy-design-records-could-share-a-minute-and-that-citation-convention-has-no-tiebreak.md`:

> **Rewritten 2026-08-07. The original claim was false and is withdrawn.** This record asserted
> that shared `YYMMDD-HHMM` prefixes are a workbench-wide defect… and two reconciliation passes
> then measured the incidence in increasing detail: 183 shared prefixes, then 185, then corrections
> to the corrections… Every one of those measurements was accurate. None of them checked the
> premise. **Kai challenged it and it did not survive.**

The root cause is fusion's own habit:

> The orchestrator cited by bare timestamp in its own prompts, a reviewer had to write "its
> `260806-2039`" to disambiguate, and the orchestrator read that as a defect in the workbench
> rather than in its own prompts.

Three reconciler passes and a withdrawn upstream proposal, on a defect that did not exist.

#### 2f. Queue and portfolio staleness. Chronic, not severe.

The reconciler detects staleness and does not own the file. `taskplanner` runs only when
dispatched. Nothing closes the loop. From `shared/history/260625-1451-reconciliation.md:15`:

> **tasklist.md:** **STALE** (generated 2026-06-12 at HEAD `e4b59c6e`, **338 commits behind**).

By the consolidated report eighteen minutes later it was "≈450 commits behind". On 17 July it was
three weeks stale. Today's queue is 143 commits and seven days old.

The closure note of the most recent Circle undercounts its own residue by a factor of four
(`portfolio.md:52`): two records named open, eleven actually open. And `portfolio.md:63` records
192 of 1,617 record identifiers colliding, up from 185 the day before, because the identifier is
minted with `date +%y%m%d-%H%M` under parallel dispatch.

#### 2g. Categories with no evidence, which is itself information

- **Guard write-backs and reverts: zero.** No record anywhere describes fusion reverting a file.
  This project ran on the pre-v6 deny-the-write-tool classifier throughout, so the measurement half
  never bit here.
- **Guard halts: zero, in 143 days.** `haltActive: true` appears in none of the 1,689 sessions.
  137 of 189 orchestrator sessions report guard state and every report is clean. The three-strike
  halt shaped the task queue, the plan and the routing, and never once fired.
- **Interrupted-session recovery failures: zero.** Every Continue and Restart gate worked.
- **`fusion-paths` or `fusion-rules` exit 3 or exit 4: zero.** The resolver contract held.
- **Evidence that the guard prevented a genuine mistake: none found.** Every hit for "caught",
  "prevented" or "saved" near a guard mention refers to one of the project's own gates.
- **Explicit user frustration about fusion, in the user's own words: essentially zero.** The
  corrections are recorded second-hand and calmly. The one file in the workbench whose name is a
  shout is about a product decision, not the tool.

### 3. How long things take, and where the time actually goes

The user's report is that operations take unbearably long and that Setup takes far too long. The
log supports the first and contradicts the second in a way that matters more than the claim.

**`unite-co-creator`'s event log does not exist on this machine.** Every number in this section
comes from `krk`, whose hook-level log survives with 37,186 events and millisecond stamps carrying
an explicit `Z`. Where the quantity is also measurable here from git and filename stamps, both are
given.

**Setup is fast.** Measured as the contiguous run of tool calls immediately preceding the
`session_start` event, across 17 sessions: median 3.9 minutes, median 15 tool calls, longest
ordinary run 7.3 minutes.

What Setup costs is context, not clock. The orchestrator prompt is 164,716 bytes and the rules
`bin/fusion-rules` emits for it total 132,732 bytes, so a session opens by reading 297,448 bytes,
roughly 75,000 tokens, before touching a project file. Here the project's always-on rules and
`CLAUDE.md` add about 30 KB more.

Every sub-agent repeats a smaller version. A plain `coder` loads 98,443 bytes of fusion rules
against its own 9,532-byte prompt: ten times as much framework as job description. Across all
sixteen agents the fleet's combined prompt and rule surface is 2,147,635 bytes, about 537,000
tokens.

**A Turn is where the clock goes.** From `krk`'s 39 completed Turns: p25 41 minutes, median 75, p75
122, p90 297, maximum 1,541. Sessions ran 3.4 to 13.2 hours, median 6.0. Individual executor
dispatches were tighter: 59 measured spans, median 30 minutes, p90 76.

**The number that matches the user's perception is neither.** It is the gap between `session_start`
and the first event representing work: 5.7, 14.6, 17.8, 18.0, 22.0, 23.4, 76.9, 125.8, 151.6 and
480.2 minutes across the ten sessions where a work event followed at all. Median about 23 minutes.
In five of seventeen sessions no work event came before the next session started.

Setup is four minutes. What sits between Setup and the first task is scope resolution,
reconciliation reading, queue construction and gate exchange, and that is where twenty minutes to
eight hours disappear.

**Cross-check here.** 385 commit bursts separated by ninety-minute gaps, median 58 minutes, p90 254,
totalling 630 hours of active time over 139 days. The median gap between consecutive agent
session-history stamps on the same day is 23 minutes, which puts a typical single dispatch in the
same range as `krk`'s 30-minute median task. The two projects agree.

**Verdict.** The user's diagnosis of Setup is wrong and his experience is right. The problem is
that nothing short exists. The entry sequence is identical whether the work is a typo or a
twenty-step plan, and the first work event is a median twenty-three minutes away. The 75-minute
Turn is honest work. The 23-minute approach to it is a toll paid on every request regardless of
size.

### 4. Whether the rules decay during a session

The hypothesis is that an agent loads its rules at Setup, works for 30 to 200 minutes, and
progressively forgets them. **The evidence does not support it, and on the two measurements that
would show it most clearly the effect runs the other way.** Real self-contradiction exists and is
plentiful. Every instance has a mechanism other than forgetting.

**The premise mostly does not hold here.** Estimating dispatch duration as the gap between a
sub-agent history file's timestamp and its first commit, across 1,027 records: median **8 minutes**,
p75 56, p90 266. Only 32 percent of dispatches run 30 minutes or longer. Each dispatch begins with
its own Setup and its own rule load, so the architecture keeps the distance between reading a rule
and applying it short by design. That estimate is rough and it disagrees with the `krk` orchestrator
log's 30-minute median task span, which measures a different thing; both say most work happens well
inside the hypothesis's window.

**Compliance does not fall with elapsed time. It rises.** Ten orchestrator session records are
written incrementally across three or more commits, spanning up to 43 hours, giving 41 dated commit
points. Diffing the added lines at each point and dating them:

| Elapsed since session start | Marker-citation violation share | Compliant |
|---|---:|---:|
| under 1 hour | 25% | |
| 1 to 4 hours | 12% | |
| 4 to 12 hours | 15% | |
| over 12 hours | **6%** | |

42 violations against 219 compliant lines. The line slopes the wrong way for the hypothesis. The
second metric, bare rule citations, has eight observations total and is noise; its one apparent
spike is a false positive where the enclosing sentence names the owning file first.

**Dispatch duration does not predict violation rate either.** Grouping the 1,027 records by
estimated duration, the share of rule citations written in the non-compliant bare form is 0.51 in
the 0 to 15 minute bucket, 0.30 in 15 to 30, 0.64 in 30 to 60, 0.58 in 60 to 120, and **0.00 in the
120 to 240 bucket**, which sits squarely inside the hypothesis's band. The 240-plus figure of 1.00
rests on two citations.

**Long dispatches are mostly clean.** Of the 51 sub-agent dispatches since the marker migration
running 60 minutes or longer, **41 carry zero violations of either convention**, and 11 of the total
violations sit in one file that is itself about markers. A 526-minute coder record and a 474-minute
one are both perfectly clean.

**What looked like decay and was not.** Marker-form citations do cluster in the last fifth of
documents, at nearly double the early rate. Attributing each one to its enclosing section header
dissolves it: the late sections are `## Resolution map`, `## Files changed`, `## Files written by
this pass`, `## Sources`. An agent naming a file it just wrote must include the marker, because the
marker is in the filename. Naming a file is not citing a record.

Likewise, 151 documents use a rule's full prefixed form early and its bare form later. The median
gap is 30 lines and the minimum is one. Thirty-one occur in documents of 80 lines or fewer, one of
them prefixed at line 4 and bare at line 5 of a 32-line file. That is ordinary anaphora, and the
file was written in a single act at the end of the dispatch, so position in the file is not
position in the session.

**The one case that has the shape of decay**, from
`shared/history/260801-1759-reconciliation.md:98`:

> I filed `260801-1753` claiming the three UNITE `skill:` pointers ... no longer resolve ... It was
> wrong. The skill listing refreshed later in the same session and carries all three ... The
> explanation was in `3ede3e10`'s own message, **which I had read and had not connected**.

Information present in context, not retrieved at the decision point. That is exactly the shape.
Three things weaken it: the pass was short, the agent caught it itself before the session ended, and
its own diagnosis is an inference error rather than a lapsed rule.

**The case that settles it against.** From
`shared/issues/260806-2043_o_two-pt-strategy-design-records-could-share-a-minute-and-that-citation-convention-has-no-tiebreak.md`:

> Three passes refined a measurement whose premise nobody tested. Each pass made the finding look
> more solid: a bigger count, a corrected count, a correction to the correction. The reasoning that
> would have dissolved it [...] **was never done, because each pass inherited the question rather
> than the claim.** [...] Nothing in the conventions says the timestamp alone is a key. **That was
> assumed rather than read.**

Three separate agents, each with a freshly loaded conventions file, plus the orchestrator, all
failed the same check. If elapsed context were the cause, one of three fresh contexts should have
caught it. What propagated was a framing, not a memory deficit.

**Independent check from the reviewers.** Across all 102 review files, six findings name a broken
rule and **not one attributes it to session length, context or memory**. Two attribute the opposite
explicitly. From `shared/reviews/260731-2303-coderev-deepreplace-reliability-audit.md:289`:

> `CODING-HYGIENE`'s `HYG-NO-SILENT-FAIL` is the governing rule and the script contravenes it
> **systematically, not incidentally**.

Of roughly 40 orchestrator session records carrying an "Agent errors" row, all but six read zero,
and the six non-zero ones name API errors, a content filter, a stalled agent and a shell fault.
None names a rule lapse.

**What the evidence points at instead.** Three real mechanisms, none of them decay. First, a rule
that was never internalised as unconditional, which covers the citation shortenings, the sixty
hand-copied ontology counts interleaved three lines apart with correct ones, and the systematic
silent-failure idiom. Second, parallel dispatch invalidating a sibling's work: step 17 fixed a line
citation that step 18 made stale in the same commit, and the record names it precisely, *"The
exclusion stopped them writing concurrently; it did not stop one invalidating the other's line
number."* Third, and most costly, a framing that propagates across fresh contexts because nobody
asks the inverse question. The orchestrator has already written the correction, at
`shared/history/260806-1242-orchestrator-session.md:172`:

> The next correction is the inverse, not a bigger version of the same question: not *"what is
> exempt from this guard"*, but *"what has no guard proposed at all, and what is this guard's
> existence compensating for?"*

**What cannot be settled from here.** A 43-hour session is not 43 hours of continuous context;
sessions pause and resume, and elapsed wall-clock overstates context length by an unknown factor.
There is exactly **one** clean measurement of minutes from session start to a specific violation, an
upper bound of 49 minutes, and that case turns out to break a convention that did not exist yet when
the dispatch began. Settling the question properly needs a per-tool-call timestamp inside a
dispatch, which is a fusion-side instrument that does not exist.

Worth noting that the project anticipated this hypothesis in April and designed against it. A risk
table dated 7 April lists *"Large tier scope → long session → context drift in coding agent"* and
mitigates it with hard-stop checkpoints at independently committable phase boundaries. That is the
only occurrence of the concept in 1,689 history files, and the 8-minute median dispatch is the
mitigation working.

### 5. The removal candidates, tested against a real consumer

The prior analysis proposed eight deletions on evidence from fusion itself and `krk`. It named its
own gap honestly: *"The second consuming project, cocreator, no longer exists on this machine."*
That project is the one being read here, and it changes four of the eight.

| Candidate | Prior verdict | What the largest consumer shows | Revised |
|---|---|---|---|
| Plane mirror | Zero successful pushes ever; map is `{}` | 44 entities pushed to a **localhost test instance**; the real Plane integration is hand-rolled | Delete, for a better reason |
| Churn and counters | 16,097 firings in krk, zero actions | 73 sessions narrate a score, **zero decisions cite one**; it always ranks fusion's own dashboard first | Delete, confirmed |
| Stash pair | Never invoked | **Zero mentions of either skill** in 1,689 sessions | Delete, confirmed |
| `taskplanner` and the queue | Zero dispatches in either project | **10 runs**; one drove a 26-task overnight batch; stale every other time | Keep the batch, delete the file |
| `investigator` | Zero dispatches; store empty | **4 dispatches**, all productive, none in eight weeks, none matching "large complex" | Merge into analyst |
| `consultant` | One dispatch; near-dead | **79 records**, 73 percent acted on, 326 files cite one | **Keep** |
| `strategic` / `knowledge` domains | 1 and 6 uses in 561 | `strategic` **never** passed here; `knowledge` twice, both on one day in May | Delete, confirmed |
| Self-bookkeeping family | ~5,400 lines | **~25 percent of sessions and commits**, by two independent methods | Keep the reconciler, cut the rest |

**The Plane mirror is worse than unused: it was tested against a throwaway while the real
integration was built by hand.** `fusion-workbench/plane.config.yaml` reads
`base_url: "http://localhost:9999"` and `workspace_slug: "fusion-local"`. The 44 mapped entities
pushed on 6 and 8 August went there. The production Plane is
`https://plane.digitalleadership.com`, workspace `unite-the-results-engine`, and `MARTIN.md`
documents a complete manual REST workflow against it, driven by `zsh -ic` and `$PLANE_API_KEY`.
Fifty-eight commits cite a real Plane story number. A Circle was created solely to prove the bridge
worked and then deleted itself; commit `60e1b8da` says so: *"The Circle existed to prove the
fusion-to-Plane mirror works from this workbench. Its own Directive named self-deletion as the
intended terminal state."* Of 215 attempted pushes, 163 failed on a missing API key, 44 on an
unreachable server and 8 on rate limits, each writing a `manual_hint` telling a human to create the
issue by hand. Nothing shows anyone doing so.

The project did build on it: `tools/plane-push-with-spec` wraps `bin/fusion-plane` to mirror a
Circle's full spec into a Plane comment, *"closing the gap that `fusion-plane` leaves open"*. So
the bridge is not worthless as a component. It is worthless as a product.

**The churn heatmap's whole output was to rank fusion's own files first and be told to ignore
them.** 73 sessions report a score. Zero decisions, issues or plans cite one as a reason. The
top-ranked file is `orchestrator-live.md`, at score 70 across 211 changes, in every report from May
onward; second is `CLAUDE.md`. The dismissals are near-identical for four months: *"expected for an
active workbench, no action"*, *"high-thrash files are the expected ones... no action"*, *"Expected
— it is the dashboard, overwritten at every transition point by design."* It also outgrew being
read: `shared/history/260531-2310-orchestrator-session.md:75` records *"`churn.json`: 14260 lines —
present but not analysed for thrashing scores at Setup."*

**The stash pair has zero mentions, and the user solved the problem it addresses by hand a month
before it shipped.** `.pause-snapshots/260519-0442-dl-brand-uplift-resume.md`, written 19 May, is a
committed markdown snapshot with a three-step `sed` restore recipe. Its rationale:

> `fusion-workbench/agentstate.yaml` is **gitignored**… If the file is deleted (e.g. by
> `/fusion:setup` Restart, by orchestrator Phase 4 cleanup, by a mis-typed `rm`), the saved
> work-queue progress is lost.

He built the thing, then never adopted the skill that replaced it.

**`taskplanner` worked once, decisively, and the persisted queue never worked.** Ten runs in 143
days. The 2 August queue drove nine sessions between 00:30 and 02:31 that cite task identifiers
verbatim, clearing all 15 ready tasks and all 11 park-decisions in a night. The July queue drove
fourteen commits whose subjects are its task numbers. But the ordering was re-derived into parallel
batches rather than followed, task 1 ran fifth, and ten days later 14 of its 28 source issues are
still open. Every one of the ten queues went stale and the reconciler said so each time without
being able to act.

**`investigator`: the user is half right, and the half he is wrong about is the important half.**
Four dispatches, on two days, 7 April and 17 June. None in the eight weeks since. Each found a root
cause and each filed issues, ten of seventeen now closed. They are real product failure hunts
against captured runs, and the first one reads exactly as the user describes:

> User asked the co-creator to "develop an innovation project for VW — they want to launch a new
> e-biking offering". The system analysed the request, recommended 8 UNITE frameworks, then
> produced an empty deliverable [...] The user re-pressed "Analyze" twice more, got the same no-op,
> and stopped.

But "large complex" does not survive checking. The two that logged duration ran 15 minutes and 7
minutes, the second starting thirteen minutes after the first ended and reusing its conclusions.
None of the four frames competing hypotheses. One is not a failure hunt at all: *"The run completed
with no exceptions and the two filled canvases are high-quality."* The fifth file in the store has
no `Agent:` line and is not an investigator product, though it is the most consequential file
there.

Meanwhile the heavy diagnostics went to the analyst. `shared/analyses/260523-1830-bmc-miss-investigation.md`
is typed *"Forensic investigation (4 sim runs)"*, tests two named hypotheses, and concludes
*"Hypothesis B confirmed"*. On the morning of 17 June the analyst ran a forensic root-cause pass on
one Mittelstand-Bank capture while the investigator worked the adjacent one. And the input surface
is gone: `failure-lab/` was removed on 31 July, so `investigator-capture-layout.md` pointed at
nothing until it was repointed, and no investigator has run since.

**`consultant`: "directly" holds completely, "constantly" describes May.** 79 records over 103 days.
No agent ever dispatched it: `grep -rn 'fusion:consultant'` across the whole tree returns nothing.
55 of 79 name Kai as requester.

| Month | Consults | Commits | Consults per 100 commits |
|---|---:|---:|---:|
| 2026-04 (from 22nd) | 9 | 382 | 2.4 |
| 2026-05 | 50 | 755 | 6.6 |
| 2026-06 | 16 | 822 | 1.9 |
| 2026-07 | 3 | 576 | 0.5 |
| 2026-08 (to 3rd) | 1 | 195 | 0.5 |

Intensity fell thirteenfold from May to July while commit volume fell 24 percent and analyst output
held flat, so the decline is not a slowdown in the project. Four consultations in the last 67 days,
none in the last nine.

It is also the most-acted-on agent measured anywhere in this analysis. A 22-record sample gives
roughly 73 percent followed; 326 files outside `consult/` cite a consultation by name, median five
citations each. The 18.5 KB consultation whose filename is the user's own exasperation, dated 23
June, reframed a three-track engineering programme:

> The throughline: #2 and #3 both reach for an LLM to do the language understanding cosine can't.
> [...] The determinism constraint is what has been forcing the team to launder the LLM through
> ever-more-elaborate offline contraptions.

Its headline recommendation was not adopted. Decision `260802-1107` kept the deterministic strategy
as the boot default. That is the correct relationship between a consultant and a decision, and it
is a better argument for keeping the agent than the usage count.

Two qualifications the user should hear. Only 9 of 79 records are genuine judgement calls; 42 are
briefing, status assessment, dispatch packaging or drafting, which the analyst or the editor could
carry. And the decline is real: the analyst absorbed the analytical half and the decision-record
gate absorbed the judgement half.

**The domain values.** Filtering to the 138 `taskplanner`, `reconciler` and `planner` dispatches
where the parameter means anything, `strategic` was **never** passed and `knowledge` was passed
twice, both on 12 May. Raw grep is misleading here: 43 files contain `**Domain:** strategic` as a
record's own subject label, which is a different field. The project also writes compound values the
parameter cannot express: `data (ontology forbid model) + code (gate)`, `code | strategic`,
`data | knowledge`, and a bare `process`.

**The self-bookkeeping share, by two independent methods that agree.** Classifying all 1,689 session
logs by agent token gives 414 bookkeeping sessions, 24.5 percent. Classifying all 2,759 commits by
whether their paths fall inside `fusion-workbench/` gives 705 workbench-only commits, 25.6 percent.
Counting a further 95 substantive-agent sessions whose subject is a workbench artifact raises the
honest figure to roughly 30 percent.

Within that family the picture is uneven. `/fusion:log-activity` has produced one surviving log,
last entry 16 June, and Kai's own activity log was gitignored on 17 June, which is abandonment.
`/fusion:cadence` has one run. `/fusion:revise-claude-md` has three sessions against 275 recorded
`CLAUDE.md` changes. `/fusion:memo` holds four files, one of them a task list containing a single
entry annotated *"still open after ~8 weeks"*.

**The reconciler is the exception and should be pulled out of this family.** 128 sessions, 113
containing correction language, and the output is materially useful:

> Every backtick-quoted `.md` path in every markdown file under the Circle was extracted and
> resolved — 242 citations. 149 resolve exactly; 68 are marker drift inside the same directory...
> **No dangling citation was created by the reclassification.**

It is also the only thing that notices when fusion's own artifacts go stale.

**One candidate the prior analysis wanted to keep, this project argues against.** `conceptrev` ran
29 times on real product plans and returned clean 18 times, acceptable 11 times, and **tangled
zero times**. The prior analysis raised the same suspicion from `krk`'s 7 runs and settled on "keep
here, question there". Twenty-nine runs without one adverse verdict answers it: in a consuming
project the diagram evaluator has no discriminating power, and a plan gate waits on it.

### 6. The guard in the field

This is the only place the protected-path machinery has ever run in anger, and the summary is short.

| Measure | Value |
|---|---|
| Sessions reporting `haltActive: true` | **0 of 1,689** |
| Recorded block incidents, by date | about 15, across 8 days |
| Cases where the guard demonstrably prevented a mistake | **0 found** |
| Records existing because the guard blocked legitimate work | **53** |
| `/fusion:unlock` or `clear-halt` mentions | 0 |
| `FUSION_ALLOW_RULES_WRITE` mentions | 12, across 7 files, all 7 and 8 August |
| "needs Kai" | 46 mentions across 44 files |
| "paste-ready" | 19 mentions across 15 files |
| `fusion-guard.json` edits since seeding | **0** |

Every recorded block falls into one of two classes and neither is the guard protecting anything.
The first is the pre-v6 classifier misfiring on shell syntax, described at
`circles/260807-0726-remove-the-guess-and-gate-the-ungated/history/260808-0924-orchestrator-session.md:52`:

> Three recent `protected_path` blocks are on record from the prior session, all of the fail-closed
> unresolvable-target kind (a `mv` with a `$D`-built path, a `cd` not joined by `&&`, an `ln -sfn`
> with a `$SESS`-built target). No halt, no action required.

That class is gone, correctly, since v6.0.0. The second class is finding 2a and is still live.

Four `git_branch_switch` denials and several `git worktree add` denials also appear, in a project
whose own Makefile uses `git worktree add`. That policy was deleted on 9 August.

The prior analysis found 16,097 churn warnings with zero actions in `krk`. This project cannot
confirm the count, because the state file is gitignored, but it confirms the conclusion from the
other end: 73 sessions narrated a churn score and not one decision anywhere cites one.

**The load-bearing observation.** `fusion-guard.json` was never edited. The project spent 143 days
working around a protected-path list it could have narrowed in one line. It never did, because the
file that governs the guard is itself guarded, the narrowing is a security-relevant edit the
template discourages, and drafting a hand-off note for the human was always locally cheaper than
fixing the cause. That is a configuration default producing a permanent workflow.

### 7. What this project needs that fusion does not offer

Ranked by how much local machinery exists to compensate.

**a. An in-band approval path for a protected edit.** The guard is binary and its only escape is a
session-wide environment variable set outside the agent loop. The project answered with a task
genre (`H:` hand-off, `X:` blocked), a plan-splitting convention, a portfolio warning class, and
issue records that carry their own replacement text. What is missing is an agent proposing a
protected edit and the user accepting or rejecting it in the conversation.

**b. A citation model.** fusion defines filename patterns and marker vocabularies and never says
how to cite a record. Putting the state marker in the filename means every citation breaks twice
per record lifetime, on the next state change and on the next archive run. The project wrote the
missing rule itself, at `rules/RULES-INDEX.md:13`:

> 1. CITE BY BARE ID. A record is cited as `260704-1110`, never `260704-1110_a` and never as a path
> containing a marker letter. A marker in a citation breaks twice: on the next state change and on
> the next archive run. Landed in commit c6d2edd9 after 110 dangling citations were found across 15
> live files.

Five of the seven fusion-subject issues in the whole project trace to this one design choice.
Notably, the project drafted an upstream proposal to change fusion's filename convention and then
**withdrew it in full** after auditing its own premise. Two of its live surfaces still say the fix
went upstream.

**c. Rule loading that reports what it did not emit.** The clearest artifact of a gap in the whole
repository is a file that exists only to be caught by a glob. From `rules/coding-frontend.md:8`:

> `fusion-rules <agent>` selects project rules by **case-sensitive lowercase glob** on a pattern
> token… This repo's binding rules are uppercase-named (`CODING-HYGIENE.md`,
> `CO-CREATOR-DEV-RULES.md`, `ARCHITECTURE-RULES.md`) and `FE-DESIGN-RULES.md` carries no `coding`
> token at all, so none of them match the glob - **a fusion coding agent would otherwise start with
> zero project rules loaded.** This pointer file (which DOES match `*coding*`) closes that gap.

Adopted 16 June, roughly seven weeks after the project started using fusion. Verified live: running
`bin/fusion-rules coder` in that project with no active Circle emits three of the nine project rule
files, and the other six are reachable only because the bridge file points at them in prose.

The manifest and the glob then collide, and the consumer had to document fusion's footgun in its
own file (`rules/context-manifest.yaml:11`): listing the two pattern-matched files as manifest units
would double-emit them. The project also deleted fusion's third rule root outright, because
`.claude/` is gitignored local state, so `CLAUDE.md:25` reads *"single canonical home — no
`.claude/rules/` mirror"*.

**d. Setup probes that are right about a real repository.** Covered in finding 2b.

**e. A `Domain:` value that can be compound, and a language declaration that can be
per-contributor.** The project writes `data + code`, `code | strategic`, `data | knowledge` and
`process` because the single-valued parameter does not fit. On language, `CLAUDE.md` declares only
`**Language:** en`, with no `**Artifact language:**` line, yet all four voice profiles are present,
and which pair binds depends on who is at the keyboard.

**f. A lifecycle for what a closed Circle leaves behind.** From `portfolio.md:57`: *"A closed Circle
has no owner, so these records are now read by whoever next scans the store, which is a weaker
guarantee than the closure note implies."*

**g. Durable resume.** `agentstate.yaml` is gitignored, so the project committed a manual snapshot
with a restore runbook a month before `/fusion:circle-stash` existed.

**h. Concurrency guarded at more than the commit.** `make check` takes 13 to 20 minutes and two
overlapping runs corrupted a coverage profile twice on 7 August, once producing a 62,466-line file
spliced mid-line. The project fixed it with per-invocation scratch paths. fusion's commit lock
arrived only after this project hit the race.

**i. Things fusion has no concept of at all**, each invented here: a decision-filing discipline
keyed on audience rather than state, with a third disposition beyond ready and blocked; a
single-writer marker rule; a per-task scope fence; a body `Status:` field that outranks the filename
marker when they disagree; a hand-maintained exemption from `/fusion:archive` enforced by one
sentence in `CLAUDE.md`; a forty-leg gate registry in the Makefile with each leg commented by the
record that added it; and a memo-store admission policy whose own preamble records the cost of not
having had one, that a pruning pass *"dropped 22 of 33 blocks, three of them wrong in ways that
would have misdirected work."*

**j. Residue of removed features.** `.gitignore` still carries eleven entries for
`fusion-workbench/bus/`, a protocol removed in v3.15.0, and reserves a `handoffs/` store that never
existed. Fourteen fusion versions are named in the records. Nothing sweeps a consumer when fusion
deletes a subsystem.

### 8. What kind of defect the review apparatus finds in a real product

The prior analysis hand-classified 90 of fusion's 443 records and found 44 percent were prose
contradicting the mechanism it describes against 23 percent run-time faults in code. It read that
as fusion's signature. It had no control.

This is the control. A random sample of 90 of `unite-co-creator`'s 1,148 issue records, fixed seed,
classified by hand against the same categories, by title with the body read where the title was
ambiguous.

| Class | fusion (n=90) | unite-co-creator (n=90) |
|---|---:|---:|
| Prose contradicts the mechanism or another claim | 44% | 22% |
| Run-time fault in shipped code | 23% | 51% |
| Gate, lint or test measures less than it claims | 9% | 12% |
| fusion's own bookkeeping is wrong | 7% | 3% |
| A route or case that was never built | 6% | 11% |
| Residual of the deleted shell classifier | 11% | not applicable |

The prior analysis's direction holds. A real product inverts the top two classes. fusion is the
mirror image of it.

Two things the comparison adds. **The prose class is not a fusion pathology.** One issue in five in
an ordinary Go and ontology product is prose contradicting mechanism, and the titles are the same
shape: a doc comment naming callers that no longer exist, a retired constant still cited as
binding, thirteen live surfaces citing a withdrawn rule number, sixty hand-copied ontology counts
that no gate compares against the file that owns them. Any project that documents heavily and cites
precisely generates this class. fusion has twice the share because it has far more prose per unit
of mechanism, not because it is doing something categorically different.

**And the bookkeeping class is not zero here.** Three percent of a real product's defect records
exist because fusion's own paperwork went wrong. Across 1,148 records that is roughly 34 records
of pure tool tax, filed and worked by a team building something else.

**Confidence.** Single-rater, mostly from titles. Titles in this project are unusually descriptive
full sentences, which makes title-based classification more reliable here than it would be
elsewhere, but 22 percent carries a 95 percent interval of roughly 14 to 32 and 51 percent roughly
40 to 61. The ordering is safe. The exact shares are not.

### 9. What the upgrades cost a project that could not opt out

Fourteen distinct fusion versions are named in the records, from 1.9.7 to 5.10.0, over four and a
half months. The installed plugin is now 7.3.0.

One upgrade has a measured price. The v4.0.0 Circle-container restructure moved every store and
changed the marker syntax from brackets to underscores. From
`shared/issues/260801-0156_c_live-tracking-files-cite-the-pre-v4-workbench-layout-and-bracket-markers.md`:

> The migration moved the files. It did not rewrite the cross-references inside them. The result is
> that a majority of the *live* tracking surface cites paths and filenames that no longer resolve.
> This is not a cosmetic problem: cross-references are how an agent picks up context on a record it
> did not write, and a dangling one silently yields nothing rather than failing loudly.

Sixty of 141 live records cited a dead path and 85 cited a dead marker. The repair was **893
citations rewritten across 137 files**, done as a two-pass resolve-then-rewrite because a naive
regex would have produced correctly formatted citations that still dangled. Bracket citations
survive outside the workbench to this day, in `Makefile:399`, `:483`, `:558`, `:2032` and
`tools/README.md:27`.

The same record names a failure mode worth carrying upstream:

> The bracket form is a shell-glob character class, so a stale citation used in a glob matches the
> empty set and, under `bash`, fails silently rather than erroring.

The underscore form fixes exactly that. The migration that introduced the fix left the consuming
project to pay for it by hand, and `/fusion:migrate` does not rewrite citations.

---

## The shape of the problem

```mermaid
flowchart TD
  subgraph CONSUMER["unite-co-creator: 2,759 commits, 143 days, 3 people"]
    direction TB
    PRODUCT["Product work: 363,873 lines of Go and TypeScript"]
    RECORDS["Records: 1,148 issues, 68 decisions, 1,689 session logs, 87 percent about the product"]
    RUNTIME["Runtime evidence: event log, guard counters, agent state"]
    TAX["Tool tax: 53 guard-blocked records, 893 rewritten citations, about 34 bookkeeping defects"]
  end
  LOST["Unreadable by fusion, by construction"]
  subgraph FUSION["fusion, the framework"]
    direction TB
    DEFAULTS["Shipped defaults: protected paths, Setup probes, rule globs"]
    SENSOR["coderev, reconciler, analyst: read fusion's own diff and prose"]
    BACKLOG["443 defect records, 1 filed by a user"]
  end
  PRODUCT -->|"produces"| RECORDS
  PRODUCT -->|"produces"| RUNTIME
  DEFAULTS -->|"written for fusion's own repository layout"| TAX
  TAX -->|"absorbed locally as workarounds, never reported upstream"| PRODUCT
  RUNTIME -->|"gitignored, cannot leave the machine"| LOST
  RECORDS -->|"git-tracked, readable, read once, tonight"| SENSOR
  SENSOR -->|"files"| BACKLOG
  BACKLOG -->|"repair commits re-enter the review population"| SENSOR
```

The graph has one cycle and it is the prior analysis's finding, drawn: the sensor feeds itself. What
this analysis adds is the left-hand side. There is a second, larger source of evidence with a live
path into fusion, the git-tracked records, and a third that has no path at all because it is
gitignored. The tax edge runs back into the product rather than up into fusion, which is the
mechanism by which fusion never hears about its own defects: the consuming project absorbs them as
local convention and gets on with its work.

---

## Implications

**fusion's defaults are written for fusion.** The protected-path list, the Setup layout probe, the
domain heuristic's directory depth, and the rule-discovery glob all encode assumptions about a
repository shaped like the plugin's own. Each one of them misfires here, and each misfire is
silent: the guard denies without explaining that the default is inherited, the layout probe refuses
without excluding frozen stores, the domain heuristic answers `data` for a Go project, and the rule
glob emits nothing rather than warning that it matched nothing. A consuming project discovers each
by hitting it.

**The one that costs most is the one nobody can fix from inside the loop.** Narrowing
`fusion-guard.json` would have removed 53 records of make-work. It never happened in 143 days
because the fix is a security-relevant hand edit in a file the guard protects, while the workaround
is a paragraph an agent can write in thirty seconds. When the workaround is cheaper per instance
than the fix, the workaround becomes the process.

**The observation gap is half self-inflicted.** The richest evidence, the event log and guard state,
is gitignored, so it is invisible to everyone including the user. The rest, 36 MB of records, is
git-tracked and was reachable at any time. Nobody read it because nothing in fusion says to. A
weekly read of a consuming project's records is not a new capability; it is a habit that was never
formed.

**The consuming project is a better test subject than fusion is.** Its defect population is
dominated by real code faults, its decisions are all about its own subject, and its rate of
tool-caused defects, about three percent, is a clean measure of what fusion costs per unit of work.
That single number is worth more than the 443 records fusion filed about itself, and it can be
produced again every month at the cost of one analysis.

**Several claims the user holds are not supported, and one thing is worse than he thinks.** Setup
is four minutes, not slow; the wait he is feeling is the twenty-three minutes between Setup and the
first piece of work. The rules do not decay; the thing that actually propagates a mistake is a
framing carried between agents, and a fresh rule load does nothing against it. `investigator` did
what he says four times, all short single-hypothesis reads, and the heavy diagnostic work went to
the analyst instead. `consultant`, which he says he uses constantly, he has used four times in the
last 67 days and not at all in the last nine, after fifty uses in May. That last one is a loss
rather than a saving: it was the most-acted-on agent in the project.

**And the fix for the framing problem is not a better rule.** Adding a rule about not inheriting a
question would be the tenth always-on rule in a 98 KB load that three agents already read without
consulting. The instrument that works is the one the orchestrator already named: at the point where
a finding is refined rather than tested, ask what the mechanism is compensating for. That is a gate
question, not a rule file.

---

## Recommendations

Ordered by benefit per unit of work, and none of them is "build something".

**1. Change the shipped protected-path default, or make the seeded configuration ask.** `rules/**`
means the consuming project's own documentation in every project except fusion's. Either drop it
from the default and let a project add it, or have `/fusion:setup` detect a populated `rules/`
directory and ask the user which of the two meanings applies. This is the single highest-value
change available and it is a few lines. Route to `shaper`, because the choice between the two
options is a decision, not an implementation.

**2. Give a protected edit an in-band approval path.** An agent that wants to write a protected file
should be able to propose the diff and have the user accept it in the conversation. The evidence
for this is that the project built one by hand, badly, three times, and the manual version deleted
content. Route to `shaper`, then `planner`.

**3. Fix the two Setup probes.** The pre-v4 detector must exclude `archive/` and any
`.migration-*` directory, which is the same exclusion `/fusion:migrate` already carries; as it
stands the pair is a deadlock. The domain heuristic must not cap its scan at depth two. Both are
small and both are `coder` work.

**4. Make rule discovery report what it did not emit.** A consuming project should never start with
zero rules loaded and no signal. Emitting a warning line when a project has a `rules/` directory
and the glob matched nothing in it would have saved this project seven weeks of agents running
without their binding rules. `coder`.

**5. Read a consuming project's records on a schedule, and un-ignore the event log.** This analysis
took one session and produced more actionable defects than the last week of self-review. Two
changes make it repeatable: file it as a recurring analysis, and stop gitignoring
`orchestrator-events.jsonl` in consuming projects so the timing evidence survives a clone. The
guard state can stay ignored; the event log is small and it is the only durable record of how long
anything takes.

**6. Delete the four confirmed dead features.** The Plane mirror, the churn and cross-file counters,
the stash pair, and the `strategic` and `knowledge` domain values. This project used none of them
in a way that helped, and its evidence is stronger than `krk`'s because it is longer and larger.
Keep one decision record for the Plane bridge stating that it was built, worked against a local
test instance, and was replaced by forty lines of the project's own `curl`.

**7. Merge `investigator` into `analyst`, and keep `consultant`.** The investigator's four
dispatches were productive and none of them needed a separate agent, a separate prompt, or a
template a project must copy before the agent will run. The analyst did the harder version of the
same work in the same week. `consultant` is a different case and the prior analysis was wrong about
it: 79 uses, the highest action rate measured anywhere, and no other agent takes a direct question
from the user and answers it with a recommendation.

**8. Delete the persisted `tasklist.md`, keep the batch.** Ten queues, ten times stale, one of them
genuinely useful for one night. A dependency-ordered batch generated on demand and consumed in the
same session keeps the value. A file that claims to be a standing queue and is 143 commits behind
is worse than nothing, because the reconciler keeps spending sessions saying so.

**9. Reconsider `conceptrev` at the gate.** Twenty-nine runs in a real project, no adverse verdict.
Either it should be able to fail, or it should not hold a gate.

**10. Do not add a rule about rule decay.** The decay hypothesis is not supported and the failure it
was meant to explain has a different cause. If the framing-propagation problem is worth an
instrument, the cheap one is a gate question at the point a finding is refined rather than tested.
The expensive one, and the only way to settle the decay question properly, is a per-tool-call
timestamp inside a dispatch, which fusion does not currently emit.

**Nothing is filed as an issue from this analysis.** Nine records could be. Six of the nine are
decisions for the user rather than defects for an executor, and filing the other three would add to
a backlog whose size is the reason this question was asked. The right next step is a Directive, not
an intake.

---

## Where this contradicts the prior analysis, and where it contradicts the user

**Against the prior analysis.**

| Its claim | What the evidence shows |
|---|---|
| "Zero successful pushes, ever, in either project" for the Plane mirror | 44 entities pushed here, to a localhost test instance, with a hand-rolled production integration alongside |
| "`investigator`: zero dispatches in either project. `shared/investigations/` is empty" | Four dispatches, five files, all productive |
| "`consultant`: one dispatch here, zero in krk. Near-dead" | 79 records, 73 percent acted on, the most-cited agent output in the project |
| "`taskplanner`: zero dispatches in either project" | Ten runs, one of which cleared 26 tasks in a night |
| "`conceptrev`: keep here, question there" | Twenty-nine runs in a consuming project, zero adverse verdicts. Question it here too |
| "60 percent of the record population describes conditions invisible in a consuming project's product" | Consistent with the defect-class control, which finds 22 percent prose defects in the product against 44 percent in fusion |

Its central conclusion, that fusion is under-observed rather than over-tested, is not merely
supported. It understated the case. The evidence was not absent; it was forty megabytes, on this
machine, git-tracked, and unread.

**Against the user.**

- Setup is a median 3.9 minutes. The complaint is real and mislocated: the median gap between
  session start and the first work event is 23 minutes, with a tail into hours.
- The rules do not decay over a session. Compliance improves with elapsed time on the metric with
  usable sample size, 41 of 51 long dispatches are clean, and the median dispatch is 8 minutes.
  What actually happens is that a framing passes between agents and a fresh rule load does not stop
  it.
- `investigator` was used four times, not several times in the sense he means, and the hunts were 7
  and 15 minutes rather than large. The analyst did the multi-hypothesis forensics.
- `consultant` is used directly and never by an agent, exactly as he says. It is not used
  constantly: four times in 67 days, against fifty in May.
- The framework is not making his project's records worse. Eighty-seven percent of the workbench is
  about his product and the ratio has not drifted in five months.
- Worse than he thinks: the tool has deleted his work. Six workbench records vanished with no
  archive destination, and two of them were the bug reports about a fusion defect that then
  survived them.

---

---

## Provenance correction, 260812-1140: this was read on a stale checkout

The user reports that the working copy read for this analysis is **behind his work machine by
several commits**, and that on the current tree `unite-co-creator/fusion-guard.json` already reads:

```json
{
  "guard": {
    "protectedPaths": []
  }
}
```

Measured here: the local checkout's HEAD is `a460d7fa`, dated **2026-08-09 12:20**, on `main`
against `origin/main`, so this reading is at least three days old. The file's own history shows one
commit touching it (`3bb786da`), which is its seeding; the narrowing is newer than this checkout.

**What this changes.** The claim that the list was never narrowed in 143 days is **false as of
today**. The narrowing exists; it simply postdates the tree this analysis read. Every "as of now"
statement about that project's configuration in this document must be read as "as of 260809".

**What it does not change.** The 53 records, the invented `H:`/`X:` task genre, the plan split
around a documentation line, the four rule-file defects, the agent that wrote through `Bash`, and
the mandated paste that deleted its own target are all **history**, created during the 143 days
before the narrowing. They happened, they are the cost, and they are why the narrowing happened.
The zero-halts figure likewise covers a period that has already ended.

**What is newly interesting, and nobody has measured it.** If the narrowing landed on the work
machine, that project is now the only place where a fusion consumer runs with a declared empty
list. What that changed for it — whether the make-work stopped, whether anything the guard was
supposed to prevent then occurred — is exactly the evidence the plugin has never had, and it is one
analysis away. It cannot be taken from this machine.

**Method note for the next reading of a consuming project.** Record the target's HEAD and its date
in the Scope section before reading anything, and state the age. This analysis did not, and the
omission turned a three-day-old snapshot into a claim about the present. The same caveat applies to
every timing, ratio and count in this document.

## Confidence and counter-evidence

- The subject classification of 1,411 histories is a keyword rule with a measured 3.1 percent error
  against a held-out hand sample of 65, and 94.3 percent precision on the tooling bucket. The
  headline of 87 percent domain is stable to about one point. The largest genuine disagreement is
  whether 116 reconciliation sessions count as tooling; calling them domain work moves the tooling
  share from 10.7 to 5.2 percent.
- The archive's 1,446 records are keyword-classified only, not sample-verified. Treat 94.3 percent
  domain there as plus or minus five.
- The defect-class comparison in finding 8 is single-rater and mostly title-based, with intervals
  given.
- **All timing in finding 3 comes from `krk`, not from this project.** `krk` is smaller, solo, and
  eleven days old. The two agree on the one quantity both can produce, a roughly 25-minute typical
  agent dispatch, which is weak corroboration and not proof.
- Guard behaviour is reconstructed from what agents wrote down. It sees every incident an agent
  recorded and none it did not. The count of about 15 blocks is a floor, not a total.
- The decay finding rests on two proxies and one confound. Dispatch duration is estimated as
  filename stamp to first commit, which understates it where a commit lagged. Elapsed wall-clock in
  an orchestrator session overstates context length by an unknown factor, because sessions pause
  and resume. The compliance-improves-with-time result has 42 violations against 219 compliant
  lines across 41 commit points, which is enough to rule out a strong decay effect and not enough
  to prove the improvement is real. The corpus is also written in an impersonal register that
  suppresses first-person self-report, so the near-zero count of phrases like "I violated" is weak
  evidence on its own; the finding rests on the measurements, not on the silence.
- *inference:* the 53 guard-related records overstate distinct incidents, because several are the
  same four blocked tasks cited from different surfaces. The distinct incident count is nearer 15
  and the record count is the better measure of the cost, since each record is work someone did.
- *speculation:* the consultant decline from May to July is because the analyst and the decision
  gate absorbed its two halves. The correlation is clean and the causation is not checked.
- This project is one consumer, built by the same person who built fusion, under a review
  discipline he also designed. It is a far better control than `krk` and it is not an independent
  one.

---

## Open Questions

- [ ] Should `rules/**` leave fusion's default protected list, or should `/fusion:setup` ask? This
      is a decision, not a defect, and it is the highest-value one available.
- [ ] Should `orchestrator-events.jsonl` be git-tracked in consuming projects? It is small, it is
      the only durable timing evidence, and its absence blocked three of this analysis's questions.
- [ ] Is `consultant`'s decline something to reverse or something to accept? The user believes he
      still uses it constantly and the record says otherwise.
- [ ] Who owns `tasklist.md` staleness, given the reconciler detects it and cannot fix it and
      `taskplanner` only runs on dispatch?
- [ ] Is a per-tool-call timestamp inside a dispatch worth emitting? It would settle the decay
      question, and it is the one measurement no existing log can produce.

---

## Sources

**Target project, read-only:** `/Users/k1/Projects/productive/unite-co-creator`

- `CLAUDE.md`, `MARTIN.md`, `fusion-guard.json`, `Makefile`, `.gitignore`, `.claude/settings.json`
- `rules/` in full, particularly `coding-frontend.md`, `context-manifest.yaml`, `RULES-INDEX.md`
- `tools/plane-push-with-spec`, `.claude/skills/`, `skills/`
- `fusion-workbench/` in full: `shared/{history,issues,decisions,analyses,reviews,consult,investigations,planning,memos}`,
  `circles/`, `archive/`, `tasklist.md`, `portfolio.md`, `plane.config.yaml`, `.plane-map.json`,
  `.plane-outbox.jsonl`, `.pause-snapshots/`
- `git log`, `git log --numstat` over all 2,759 commits

**Sibling project, for timing:** `/Users/k1/Projects/productive/krk/fusion-workbench/orchestrator-events.jsonl`
and `.guard-state/events.jsonl` (37,186 events, 1 to 11 August)

**Method note.** Four parallel read passes were run over the target corpus, on friction evidence,
removal-candidate usage, rule-decay evidence, and the subject ratio. Each returned verbatim quotes
with paths, and every quote reproduced in this report was re-verified against the file before use.
Counts reported here as measured were computed directly.

**This repository:** `.claude-plugin/plugin.json`, `hooks/config.json`, `templates/fusion-guard.json`,
`bin/fusion-rules` output for all sixteen agents, `agents/*.md` and `rules/*.md` byte counts,
`fusion-workbench/shared/analyses/260812-0022-where-the-complexity-comes-from-and-what-would-have-to-go.md`
