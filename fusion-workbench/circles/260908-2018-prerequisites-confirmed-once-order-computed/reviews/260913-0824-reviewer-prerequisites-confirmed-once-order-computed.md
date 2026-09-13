# Closing review: prerequisites confirmed once, every ordering figure computed from them

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `1208ceb6..c2a12973`
**Not-opened:** none
**Carried forward:** nothing. The coverage helper reports `carried=(not recorded)` over this range: no earlier review declared the field, so there was no list to fold into this pass, and all 26 commits reach a reviewer here for the first time.

The dispatch asked for that absence to be stated inside `**Not-opened:**` rather than as a bare `none`. It is stated on its own line instead, and deliberately: the helper parses the rest of that line as a comma-separated file list and propagates it as the next dispatch's `carried=` scope, so prose written there arrives downstream as two files nobody failed to open. The field is machine-read and stays machine-clean; the fact it was meant to carry is one line lower and loses nothing.

**Review domain:** code.

## Summary

The ordering mechanism is built the way the rulings say it should be. All five rulings the
dispatch named hold in the code: a terminal item is not a node and its entries go unread,
resolution is a node-map lookup and `archive/**` is never read, an entry asserts one relation,
no exit code carries the verdict, and the `note=` line fires whenever an item carries no
`**Depends-on:**` field. I ran the helper against the live store and against the fixture and
found no computation defect: the topological order, the depth on the condensation, the transitive
blocking count and the cycle detection are each correct on the fixture and I re-derived all four
by hand.

Six findings, none of them in the graph algorithm. One is cross-cutting and is the one worth
acting on first: the grammar change landed in four surfaces and missed the one consumer that
reads the new field mechanically. The rest are precision and coverage: two shipped claims stated
with more certainty than the code has, two test gaps, one false justification clause.

Four measurement claims spot-checked against the tree. All four are exact.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 3 |
| Low | 2 |

## Findings by theme

### Theme 1 — the new head field reached four surfaces and missed a fifth

**High.** `260913-0818_*_the-new-cross-references-field-has-two-unswept-consumers-and-one-is-a-safety-filter.md`

`**Cross-references:**` became a defined work-item head field in this range, and every
non-ordering citation was routed into it: `rules/fusion-workbench-conventions.md:103` (the Origin
Rule's second corollary, which named both fields before the range and names one after it),
`rules/fusion-workbench-conventions.md:221` (the exclusive meaning), and `skills/migrate/SKILL.md:157`
(the converted head block, which wrote into `**Depends-on:**` before the range).

`skills/archive/SKILL.md` reads one field. Its safety filter 2 prose at line 78, its Step 3
instruction at line 143 and the walk itself at line 146 all name `**Depends-on:**` and nothing
else. Filter 3 does not cover the gap: its corpus is the shipped text and the project's rule
files (line 80), never workbench records, which is exactly why filter 2's last clause exists.

So a `done` item that a live item names in `**Cross-references:**` is now archivable, container
and all, and the migration is the shortest path into that state. Second occurrence, cheaper:
`agents/orchestrator.md:397` enumerates the item head fields the orchestrator maintains and omits
the new one.

This is the finding that only becomes visible when the four changed surfaces are read together;
each of them is correct alone.

### Theme 2 — two figures stated with more precision than the computation has

**Medium.** `260913-0819_*_ready-is-claimed-to-be-optimistic-by-exactly-one-count-and-a-dangling-entry-inflates-it-too.md`

`hooks/lib/work-graph.ts:415` derives readiness from resolved out-edges alone. For a terminal
target that is the G1 ruling and correct. For a misspelt entry, a container name without `.md`,
or an archived target, the item has an unmet prerequisite and reads `ready`. The module's own
resolution comment at line 295 names those cases.

Two claims are then wrong as written: `hooks/lib/work-graph.ts:72` says readiness is optimistic
"by exactly that count", naming `noDependsOnField` alone, and `hooks/order.ts:32` says `ready=`
"counts the items with no unmet prerequisite". The `note=` line carries the same single count.
The `unresolved=` rows are printed, so the evidence is on the page; the `ready` word contradicts
it. `rules/critical-stance.md` section 3 reaches this directly.

**Medium, second half of the same theme.** `260913-0821_*_an-item-record-whose-head-the-parser-cannot-read-vanishes-from-the-order-with-no-report.md`

`hooks/lib/work-graph.ts:273` collapses three conditions into one `continue`: a terminal item, a
record whose status is outside the four values, and a record whose head could not be parsed. The
module header at line 250 says the third is outside "for the same reason a terminal one is". It is
not. A terminal item is outside by a user's ruling; an unparseable one is outside because a parse
failed, and nothing in the report says so.

`skills/archive/SKILL.md:150` reaches the same condition and is explicit the other way round:
report it, exclude it, do not guess. Two consumers of one field, one reporting the fault and one
swallowing it, in a program whose stated principle (`bin/fusion-work-order:44`) is a degradation
named rather than hidden.

The same record carries the head-block bound. `headBlock` at `hooks/lib/work-graph.ts:163` breaks
at the closing `---` or at the first `##` heading, and the heading half is never exercised: every
fixture record closes its head with `---` before any `##` line, so deleting that test leaves the
suite green. Two shapes reach it, both malformed against the template at
`rules/fusion-workbench-conventions.md:184`, and both end in the silent drop rather than in a
report. That is what makes the reporting gap worth closing rather than the parser.

**On the dispatch's question about the bound:** it is correct for every record shape the
conventions permit. The template mandates `---` on both sides of the head, so the heading test is
belt-and-braces. I applied the parse to all three live item records and read the exact shape each
uses; all three parse correctly, including one with a blank line before the closing `---`.

### Theme 3 — coverage, and where this range spent its budget

**Medium.** `260913-0820_*_the-order-entry-point-ships-with-no-test-so-both-of-its-rulings-are-unpinned.md`

`hooks/order.ts` and `bin/fusion-work-order` are the only files this range added that no test
opens. Nothing pins that a cycle exits 0 (ruling 4) and nothing pins that the `note=` line fires
(ruling 5). Both hold today, verified by running the helper; neither is protected.

The adjacent precedent is exact. `hooks/lib/__tests__/plan-size.test.ts:5` opens with the same
report-only ruling and its first case asserts exit 0 over a finding. Of the five stdout-verdict
helpers, `fusion-work-order` is the only one whose entry point no test runs. The gap follows from
the sequencing: step C3 spent the whole 144-line budget on the computation and the plan named no
test for step C2.

**Low.** `260913-0823_*_the-fixture-test-carries-one-tautological-assertion-and-leaves-three-branches-unexercised.md`

The fixture meets its plan step's case list in full, including the two extra assertions the spec
asked for, and the archive assertion is properly guarded against vacuity by the `opened.length`
check. Against the implementation it landed with: line 106 asserts that a counter incremented once
per row produces `1..9`, which cannot fail; and the resolved-edge dedup
(`hooks/lib/work-graph.ts:316`), the self-edge cycle branch (line 404) and `verdict=empty`
(line 421) are each removable without reddening the suite.

### Theme 4 — one sentence that replaced four

**Low.** `260913-0822_*_the-migrations-new-drop-rule-justifies-itself-with-a-claim-that-is-false-on-a-re-run.md`

Answering the dispatch's question directly: the replacement **does** subsume all four drop
conditions. The keep half is a whitelist, so `(none)`, prose, an entry naming no directory and an
entry naming a container that stayed terminal are each dropped by it. No case falls through the
rule.

The reason attached to the rule does. "Every other entry names no such record" is false for an
entry naming a container an earlier run of the same skill already converted, and that state is
reachable from the skill's own partial-run instruction at `skills/migrate/SKILL.md:170` and from
any workbench where a user filed items through `/fusion:memo` beside surviving Circles.

## Cross-cutting observations

**One field, two mechanical readers, one swept.** Theme 1 and the first half of theme 2 are the
same shape at different scales: a change to the item head reached the surfaces that *define* it
and missed the surfaces that *read* it. The readers are `hooks/lib/work-graph.ts` (swept, it is
the point of the work) and `skills/archive/SKILL.md` (not swept). Worth a standing habit: a change
to the work-item head grammar has exactly two mechanical consumers today, and
`grep -rn 'Status:\|Depends-on:\|Cross-references:' skills/ hooks/lib/` finds both.

**The report-only family is now five and its conventions are four-fifths applied.**
`bin/fusion-work-order` carries the stdout-verdict rule in its header and in the library header,
correctly. It is the only one of the five without an entry-point test asserting that rule. The
family's other conventions (the `KEY=value` block, the indented row shape borrowed from
`renderPlanRow`, the `note=` line kind borrowed from `bin/fusion-forum`, the relative-path
resolution of `hooks/dist/`) are all followed.

**The precision norm is applied to the store and not to the program's own claims.** The work
carries `rules/critical-stance.md` section 5 rigorously in its records and commit messages, where
every cardinality is measured. The two claims in theme 2 are the mirror image: the program's own
headers state an error term and a figure's meaning with a certainty the code does not have. Both
are one sentence to fix.

## Verification of the range's own measurements

The dispatch asked for at least two claims spot-checked. Four were, all exact:

| Claim | Where | Check | Result |
|---|---|---|---|
| `CLAUDE.md` loses 29 352 bytes, every dispatch path drops by that | `4ba42bd8` message | `wc -c` at `1208ceb6` and at HEAD: 91 277 and 61 925 | exact |
| 144 lines of section dividers freed, fixture test is 144 lines | `df3f0a27` message | `git diff --numstat`: eight files, zero insertions, 144 deletions; `work-graph.test.ts` is 144 lines | exact |
| the four-token move on the reference-resolution pin | `4ba42bd8` message and the in-file entry | baseline 1522/232 to 1525/233, and the entry itemises three paths plus one anchor | exact, and the in-file entry is the more precise of the two statements |
| every path gained 28 548 and not 29 352, the 804 being step B1's conventions edit | `9e0c4bcb` message | rules emitted to `reviewer` grew 84 307 to 85 111 between `1208ceb6` and HEAD, and the conventions file is the only emitted rule this range changed | exact; the correction of the earlier figure is itself correct |

One further figure checked because it was reported rather than fixed: the three files phase C
added measure 6.3, 8.1 and 6.3 em-dashes per 1000 prose words through `bin/fusion-prose-metric`,
exactly as `9e0c4bcb` states. All three are over the ceiling of one. That helper gates nothing and
the ceiling's scope is an open question
(`260820-2314_*_is-the-em-dash-ceiling-read-per-file-or-across-the-always-on-corpus.md`), so this
is noted and not filed.

**On `roots=`.** Verified rather than assumed. `hooks/order.ts:135` counts rows at depth 0 and the
header at line 32 claims exactly that, so the definition matches its documentation. The header's
further claim, that `ready=` and `roots=` are equal in an acyclic store and part only where a
cycle sits at depth 0, is correct: in an acyclic store every component is one node and depth 0 is
equivalent to having no out-edge, while a cycle member always carries an out-edge inside its own
component and so is never `ready`. `ready` is a subset of `roots` in every store. The chosen
definition is the useful one for what the figure is for, which is saying where the printed order
starts.

## Recommended sequencing

1. **Before the next archive run, and before the next `/fusion:migrate` run:**
   `260913-0818_*_…-unswept-consumers-…`. It is the only finding that can lose something, and both
   of the commands that trigger it are ordinary session commands.
2. **Before the release tag:** the two precision records,
   `260913-0819_*_ready-is-claimed-…` and `260913-0821_*_an-item-record-whose-head-…`. Each is a
   sentence and a small report line; both are shipped text making a claim that is not true.
3. **Cleanup, in any order:** `260913-0820_*_the-order-entry-point-ships-with-no-test-…`,
   `260913-0823_*_the-fixture-test-carries-one-tautological-assertion-…` and
   `260913-0822_*_the-migrations-new-drop-rule-…`. The first two both need room on a bounded test
   surface that stands at zero margin, so they are one cut's worth of work and are cheapest taken
   together.

Nothing here blocks a release. No finding is a defect in the ordering computation, which is what
this work was for.

## What I did not check, stated rather than left to inference

The 26 commits' workbench records were read as context and not reviewed, per the dispatch. I ran
the full hook suite once (55 files, 926 tests, exit 0) and did not attempt to reproduce the eight
intermittently failing files the range's own records name. I read `hooks/dist/lib/work-graph.js`
and `hooks/dist/order.js` only through `committed-dist.test.ts` passing, not line by line.
