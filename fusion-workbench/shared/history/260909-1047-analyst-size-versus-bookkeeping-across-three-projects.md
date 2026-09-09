# Size drives the errors, the method drives the bookkeeping

**Agent:** analyst
**Date:** 2026-09-09
**Status:** Complete
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>

## Task

The user asked whether project size or complexity drives fusion's error rate and slowdown,
and separately what the bookkeeping costs in wall-clock time and where. Three projects were
in scope: this repository, krk, and unite-co-creator. No file outside
`shared/analyses/` and `shared/history/` was written.

## What was measured

Full `git log --no-merges --numstat` for all three trees, 5540 non-merge commits together,
at `a1ecf86e`, `68b76de` and `0cc2214c2`. The stamped record corpus in each workbench,
9526 files and 75.8 MB. The three orchestrator event logs, 9525 lines, of which the
`task_start`/`task_done` pairs carrying `person`/`checkout` were used for dispatch
durations and the rest discarded as model-written. `bin/fusion-rules coder` run with cwd
in each project for the emitted rule bytes.

Wall clock was attributed by charging each commit the interval since the previous commit,
capped at 120 minutes, and classifying the commit by whether it touched a source file.
That makes every workbench figure a lower bound.

## What came out

Two answers, and they are not the same answer.

Size and local complexity drive errors and per-task latency, replicated three times
independently. Median minutes per source commit rise two to three times from the smallest
to the largest quartile of file touched. The fix-commit share of a file's history rises
from 12 to 25 percent in the smallest quartile to 27 to 31 percent in the largest. Per
hundred changed lines the cost does not rise, so what degrades is the latency of one task,
not throughput.

The bookkeeping is a constant of the method at its current version. In the window
2026-08-01 to 2026-09-09, across projects at 19, 0 and 768 KLOC, records filed per
source-touching commit were 4.64, 4.88 and 4.85, and the workbench share of within-session
wall clock 40, 37 and 44 percent. krk was three weeks old with no code and paid the same
as a project forty times its size. Over calendar time the load rose about eightfold in
every project at once: unite-co-creator went from 0.74 records per source commit in April
to 5.80 in September while tripling in size.

Session ceremony, meaning history files, machine state and circle records, took 150 hours
across the three projects in the window, 13 to 17 percent of all attributed time, and
carries no statement about the product. Dedicated bookkeeping agents are 3 to 10 percent of
dispatch time, so cutting one buys almost nothing.

## Two corrections this pass had to make

A first classifier read issue records by keywords in their filename slug and reported that
38 percent of unite-co-creator's issues were about the records rather than the product.
Classifying instead by the file paths each issue body cites, an objective test, gives 11
percent there and 15 percent in krk, with no upward trend. The keyword figure was wrong in
two directions at once, and the report says so rather than carrying it.

The request stated that unite-co-creator is cloned but not worked on. 447 commits landed in
its last three weeks. What holds is that the local copy runs no fusion session: it carries
no `.guard-state/`, no `.checkout-id` and no `agentstate.yaml`.

## Where it went

`260909-1047-size-versus-bookkeeping-across-three-projects.md`, 3667 words,
0 em-dashes against a permitted 3, no citation violation. No issue was filed: every
recommendation in it needs a user gate first, and one of the three says so explicitly.

## The diagram pass

On the user's request the findings were rendered as nine Mermaid diagrams and placed beside
the findings they carry: one flowchart separating the two drivers, five xychart series for
the trends and quartile gradients, one sankey for where a session's wall clock goes, one pie
for the dispatch split, and one bar for the open-issue share. Every block was parsed with
mermaid 11.17.2 through `mermaid.parse` under jsdom before it was written, and all nine pass.
The standalone flowchart the first version carried at the end of the Findings section was
removed, since the sankey states the same split with the hours on it.

Two claims changed in the writing. Finding 2 gained the wall-clock series behind it, 30
percent in May to 68 percent in September in unite-co-creator, with the months before each
project tracked its workbench excluded rather than plotted as zero. Finding 10's heading
claimed size and age; the open share is monotone in size and not in age, since fusion at 18
weeks has the lowest share of the three, so age was dropped from the claim.

## Second pass: the two correlations, run separately

The user asked to correlate fusion's own timeline against efficiency, and consumer growth and
file growth against efficiency, as two distinct questions. Findings 12 to 16 and six further
diagrams were added, and the overview diagram was rewritten because the second pass falsified
its split.

fusion's timeline was measured as bytes rather than named by version: the whole rules
directory, the agents, the skills, the orchestrator prompt and, separately, the always-on set
a coder dispatch actually reads, taken at the last commit of each of the 19 weeks and derived
from the unindented `emit_if_exists` lines at that commit. The rules directory went 45 KB to
226 KB without a reversal. The always-on set is the one figure that reverses: 45 to 108 KB by
late July, cut to 64 KB on 2026-08-24, 72 KB now.

Then the correlations, and the first answer is that they do not answer anything. fusion's
shipped rules bytes and the consuming project's own source size have a weekly rank correlation
of +0.99 in unite-co-creator and +1.00 in the other two. They are one variable over calendar
time, and every outcome correlates identically with both. That result is printed in the report
rather than hidden, because a reader who sees only the +0.89 against records per source commit
would conclude something the data cannot support.

Two designs do identify. Per-file line counts were reconstructed at every commit by
accumulating numstat from each file's first appearance, and all 3353 source-touching commits
were then cut by fusion load and by the size of the largest file touched at once. Both
gradients survive the other's control, at about x2.0 to x2.3 for size inside every fusion band
and x1.6 to x1.9 for fusion load inside every size band, and they multiply to x3.9 from the
lightest cell to the heaviest. For the fix share the fusion gradient is the cleaner one,
monotone in all three size columns. The second design is the 2026-08-24 cut, the only event
where fusion's load fell while the calendar and the projects went on growing: pooled fix share
37.6 to 26.2 percent and median minutes 22.1 to 13.4 with file size held, and krk holding flat
while the files it touched grew by half.

The first pass gave errors and latency to project size alone and gave fusion the bookkeeping
alone. That was too clean, and the report now says so where the old diagram stood. What
changed in the recommendations is one addition: cut the always-on set again and measure around
the cut, since finding 15 prices the last one at eleven percentage points of fix share.

## Third pass: a correction I owed, and the quantity nobody measured

The user asked whether the volume of rules and decisions is counterproductive. Answering it
turned up a defect in my own second pass. I had dated the conditioning-load cut to 2026-08-24,
read off a weekly sample of `bin/fusion-rules` rather than off its commits. The cut is
2026-08-27, in two commits ninety minutes apart: `8ac9a533` at 08:45 took the decision-record
worked examples off the always-on floor and `9c056b6c` at 09:25 took the user-facing style
contract, 96.4 KB down to 72.5 KB, a quarter of what every dispatch carried. Three days of the
old regime had been sitting in the new bucket. Redone at the right time the direction holds and
the fix-share effect is slightly larger: pooled 36.6 to 24.3 percent, and down in all three
size strata rather than two. Latency is the weaker half and now reads non-monotone, down in the
smallest and largest bands and up slightly in the middle, so finding 15 says not to quote it
alone.

Then the question's own answer, which needed a measurement that did not exist. Decision records
are not in the always-on set at all, so nothing in findings 12 to 16 says anything about them.
What thirteen of the fifteen agent prompts do is name `$SCAN_DECISIONS`, mostly beside
`$SCAN_ISSUES` and `$SCAN_PLANS`. Resolving those pointers gives 952 KB here, 838 KB in krk and
4365 KB in unite-co-creator, which is 12 to 60 times the rule set, and it is the only one of
the four texts aimed at a dispatch that grows with the project: 223 KB in May to 4177 KB in
September in unite-co-creator. Finding 17 states the quantity and states plainly that no effect
is attributable to it, that skim is not read, and that the cross-section runs the wrong way for
a simple story, since this repository has the smallest store and the worst fix-to-feature ratio.
Three diagrams were added with it, one replacing the chart that carried the wrong date.

## Fourth pass: the two phases the users experience as worst

The user reported, with a second person on the same projects, that the overhead is friction
throughout and disproportionate in two phases: starting after a restart, and closing. Finding
18 tests that against four measurements, none of them a correlation.

The phases were priced in instruction text against one coder dispatch as the productive unit,
183.8 KB in this repository. A ramp-up carries 381.8 KB, the orchestrator prompt and the setup
body on top of the same floor, which is 2.1 units. A minimum cleanup carries 498 KB and a full
closing with a review and a portfolio pass 940 KB, 5.1 units, for no artifact the user asked
for. The step counts were read off the skill bodies: setup carries 19 numbered steps of which
twelve are pre-flight that runs before any project context, cleanup 9 of which four are whole
passes with their own bodies.

Two behavioural figures completed it. Of 279 gate events in the 43 sessions carrying a session
identifier, 94 fall after the last production dispatch and 45 before the first, so half the
questions put to a person sit outside the productive stretch. And the ramp-up runs a median 72
minutes to the first production dispatch, mean 236.

The closing does not shrink with the session: 0.28 minutes of closing per productive minute at
1 to 10 production dispatches against 0.12 above 10, and 17 of the 43 sessions ran no production
dispatch at all. That is why a short session feels worst.

Three recommendations were added and the list renumbered to nine: a precondition on cleanup
Steps 3 to 6 so an empty delta skips the pass, the twelve installation pre-flight checks off the
critical path behind one cached marker, and the questions moved into the work rather than left
at the end. The guard event log was tried first as the instrument and dropped: it carries
machine timestamps and file paths, which is exactly right, but only eleven days and nine usable
sessions, so the event log and the skill bodies carried the finding instead.
