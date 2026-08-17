# Code review — the compliance guard becomes observation-only, Turn 1

**Date:** 2026-08-16
**Sender:** coderev
**Reviewed-range:** `3d41d4a..3c2e1c6`
**Not-opened:** none
**Circle:** `260816-1741-guard-becomes-observation-only`
**Plan under review:** `circles/260816-1741-guard-becomes-observation-only/planning/260816-1915_p_the-compliance-guard-becomes-observation-only.md`, steps 1 to 6

## Summary

The guard is genuinely incapable of denying: every path through `hooks/guard.ts` writes `{}`, and
that was verified by reading the file, by running the compiled hook against five payload classes,
and by the five test cases that now receive `undefined` where they asserted `"block"`. The
deletions are clean — `hooks/dist/` matches a fresh build byte for byte with no orphan, and no
importer of any deleted module survives. Six new defects come out of the pass. Two of them are
release blockers in the sense that they make `npm test` unable to go green inside this Circle as
scoped; four are documentation surfaces that no step's Files list reaches.

The dominant pattern is one this Circle has now met five times: **a step reasons about a symbol's
or a file's last consumer, and the consumer is somewhere the step never grepped.** Two instances
were already filed by the executors (`260816-2032_c_*`, `260816-2108_o_*`); this pass found a
third in step 9, and the four documentation findings are the same failure applied to prose.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 2 |
| Medium | 3 |
| Low | 1 |

All six are filed in this Circle's issue store under the Origin Rule; every one arose from
executing this Directive. Nothing went to the shared store.

## What was verified and holds

These are stated because a review that only lists defects leaves the reader unable to tell a
checked claim from an unchecked one.

**1. `hooks/guard.ts` cannot deny.** Four leaves, all `allow()`, which writes `{}` and nothing
else: empty stdin (`:123`), unparseable JSON (`:131`), a non-guarded tool (`:144`), Bash (`:192`).
The fifth is the write-tool path, `answer("guard", allow, …)` at `:202`, and `answer` calls the
verdict first (`lib/fail-open.ts:155`). `failOpen` does the same (`:176`). There is no `block`
function, no `"decision"` key, no `permissionDecision` and no non-zero exit anywhere in the file.
Run against the compiled `hooks/dist/guard.js` in a throwaway project, all five payload classes
returned `{}` at exit 0.

**2. The Bash zero-side-effect property survives.** The same probe: a Bash call in a project with
a valid configuration writes nothing; with a broken one it writes exactly one `guard_advisory`,
which is the documented departure. Write tools write one `guard_allow` each.

**3. `hooks/dist/` carries no orphan and is not stale.** The tree was rebuilt into a scratch copy
and `diff -rq` against the committed `dist/` reports identical. Eighteen sources, eighteen `.js`
and eighteen `.d.ts`, one-to-one, with no compiled output whose source is gone. The four pruned at
step 3+6 are the whole of it — checked against the whole tree rather than against those four.

**4. The historical accounts written this Turn are accurate.** `hooks/guard.ts`'s header,
`hooks/lib/events.ts`'s union comment, `hooks/session-start.ts`'s justification,
`hooks/tracker.ts`'s two corrected comments, `hooks/lib/self-detect.ts`'s new header and the four
`bin/` headers were each checked against the tree. Every claim in them holds, including the two
that are easy to get wrong: `bin/monitor` does style `guard_block` and `guard_halt` and does not
style `halt_cleared` (`bin/monitor:591-592`, `:612`), and `bin/fusion-rules`'s `IN_PLUGIN_REPO` does
have exactly the two use sites the corrected consumer list implies (`:358`, `:460`), neither of
them a guard-internals gate. One header that was *not* written this Turn has gone stale, and it is
finding D below.

**5. The `guard.enabled` early-allow removal is defensible and reaches nobody today.** It was not
in step 2's instruction and the coder recorded taking it. Two behaviour changes follow, both
documented in the new header and the step history: a write tool with no file path now writes a
`guard_allow` with no `file` field where it previously wrote nothing, and a `guard.enabled: false`
would no longer suppress the trace. Neither is reachable by a consuming project — the project layer
may not set the key, the plugin layer ships `true`, and step 7a retires it — so the removal is
early rather than wrong. The *documentation* of the switch is false in the meantime
(`README.md:110`, `README-hooks.md:239` promise an off switch that no longer switches anything
off), and step 11 owns both lines.

**6. The suite's red set is exactly what the dispatch predicted, plus nothing.** 11 files, 45
cases. Ten files are owned by steps 9, 10 and 11. The eleventh, `guard-bash-integration.test.ts`,
is owned by no step and was already filed at `260816-2021`; this pass found a second defect behind
that one (finding A).

## Findings by theme

### Theme 1 — the plan's file lists do not reach every consumer (2 findings)

**A. High — step 9's harness reduction deletes four fixtures `guard-bash-integration.test.ts`
imports, and its "five surviving files" count is off by four.**
`circles/260816-1741-guard-becomes-observation-only/issues/260816-2122_o_step-9s-harness-reduction-deletes-four-fixtures-guard-bash-integration-still-imports.md`

This is the **third defect of the shape the dispatch asked me to look for**. Step 9 removes
`GOVERNED_*`, `withGovernedProject`, `governedFiles`, `readEscalation` and `EscalationSnapshot`
from `helpers/guard-harness.ts` on the ground that "the rest of the harness is used by five
surviving files". `guard-bash-integration.test.ts:5-17` imports four of those five symbols and is
in no step's Files list. Nine files import the harness after step 9's deletions, not five, and
`withPluginProject` — unmentioned by the step — keeps four consumers. Executing step 9 as written
turns a file that is red at five cases into a file that cannot be collected.

It is the second half of `260816-2021`, not a duplicate of it: that record asks for the file to be
added to step 9's list; this one says that adding it is not sufficient, because the fixtures the
re-pointed cases would run on are removed by the same step.

**B. Medium — `bin/fusion-turn-budget`'s header documents the configuration file step 7a renames,
and no step opens the file.**
`circles/260816-1741-guard-becomes-observation-only/issues/260816-2124_o_bin-fusion-turn-budgets-header-documents-the-configuration-file-7a-renames-and-no-step-owns-it.md`

`:39` carries the worked example `fusion-guard.json {"orchestrator": {"maxTurns": 12}}` and `:40-41`
describes the three-layer merge "the same walk every guard setting takes". `CLAUDE.md`'s Layout row
nominates this header as the authoritative usage block and deliberately does not restate it, so a
wrong filename here is wrong at the place the project sends people. Every other surface of the same
rename is owned (`README.md`, `README-agents.md:169`, `agents/orchestrator.md:122`, `bin/monitor`,
all step 11, which runs after 7b). This one file is not.

### Theme 2 — the curator boundary was priced as prose and is a gate (1 finding)

**C. High — `CLAUDE.md`'s two dangling citations keep `reference-resolution-lint` red, and no step
in this plan may fix them.**
`circles/260816-1741-guard-becomes-observation-only/issues/260816-2123_o_claude-mds-two-dangling-citations-keep-the-citation-lint-red-and-no-step-in-this-plan-may-fix-them.md`

`CLAUDE.md:29` and `:129` name `hooks/lib/project-relative.ts`, deleted at `3c2e1c6`. The lint
scans `CLAUDE.md`, so the Circle record's accepted residual — "`CLAUDE.md` keeps a false statement
until a `/fusion:curate` pass runs" — is not a stale sentence but a failing test. Step 11's stated
verification is that this lint is green, and step 11 cannot make it green. The two citations became
dangling at the last commit of the Turn, after the step-3/6 history enumerated the dangling set, so
no earlier record names them.

Three answers, all needing a decision rather than an edit: run `/fusion:curate` inside this Circle
before step 15; give step 11 a named two-citation exception in `CLAUDE.md`; or decide in writing
that this release may go out over a red suite. The last is the one this repository has already paid
for once (`shared/issues/260810-1618_o_*`).

Second item in the same record: `BASELINE.paths` is pinned at 1122 and the gate now resolves 1113.
Three records in this Circle predict three different numbers for it (1117, 1118, 1122); it has to
be re-measured at the end, and no step's Changes text currently says who re-approves it.

### Theme 3 — shipped text that still states the removed mechanism as live (2 findings)

**D. Medium — `hooks/lib/guard-state-file.ts` names the deleted `escalation.ts` as one of its three
live callers, and rests a design choice on it.**
`circles/260816-1741-guard-becomes-observation-only/issues/260816-2125_o_guard-state-file-names-the-deleted-escalation-module-as-one-of-its-three-live-callers.md`

Three present-tense claims at `:34`, `:79` and `:103`. The third is the load-bearing one: it is the
stated reason the `root` parameter is optional, and its only cited subject is the deleted module,
while the very next paragraph says both surviving callers pass a root explicitly. The module now
documents a default whose justification contradicts the paragraph beneath it. No step names the
file.

This is the one place where question 5's answer is "no" — of every header this Turn touched, all
are accurate; the one it did not touch is not.

**E. Medium — `docs/upgrading-to-v9.md` tells a consuming project that a halt still blocks and
still clears, under the heading `## What needs no action`.**
`circles/260816-1741-guard-becomes-observation-only/issues/260816-2126_o_the-v9-upgrade-note-tells-a-project-a-halt-still-blocks-and-still-clears-and-no-step-owns-it.md`

`:133-135`. All three clauses are false at HEAD: nothing blocks, `clear-halt.js` is deleted, and
there is no block message to name the command. The file is shipped, pointed at from `README.md`
`## Install` and from `/fusion:help`'s update topic, and is the surface a project upgrading over
exactly these removals reads first — the population the sentence is most wrong for is the one it
was written for. It falls inside the Directive's stated scope by property and is in no step's list.
A second, smaller omission rides with it: `docs/working-model.md:162`, in a file step 11 does open
but at a line it does not name.

### Theme 4 — two shipped accounts of one artifact disagree (1 finding)

**F. Low — the Setup deletion offer attributes the legacy halt flag to the protected-path check
alone, where `hooks/guard.ts` says either mechanism.**
`circles/260816-1741-guard-becomes-observation-only/issues/260816-2127_o_the-setup-deletion-offer-names-one-of-the-two-mechanisms-that-could-have-raised-the-flag.md`

`skills/setup/SKILL.md:308-310` names one cause and one date; `hooks/guard.ts:44-47`, written one
step later, says "by either mechanism". CHECK 3 raised the same halt through the same counter
(`recordBlock(…, "decision_governed", …)` at `hooks/guard.ts:417` before deletion), so a project
that armed it holds a flag with a different trigger and a different date. The paragraph's
conclusion is unaffected — nothing reads the flag whichever wrote it — which is why this is low.
Filed rather than waved through because it is user-facing text and because the migration's own
test pins only the two protected-path triggers, so nothing would catch it.

## Cross-cutting observations

**1. The "last caller" failure is a class, and it has now cost five records.** `260816-2032_c_*`
(`clear-halt.ts` imports `escalation.ts`), `260816-2108_o_*` (`matchesAny`'s caller is in
`config.ts`, not `guard.ts`), `260816-2021_o_*` and finding A (`guard-bash-integration.test.ts`),
and findings B and E in prose. Every one is a step asserting "this loses its last caller" against a
caller the step did not grep for. Three of the five were caught only when an executor tried to run
the step. **Worth a plan-wide check rather than a sixth point fix:** before any remaining step
deletes an exported symbol, a fixture or a file, grep it across `hooks/**` *including* `__tests__/`
and across the shipped text, and add every file that comes back to that step's Files list. Steps 7a
and 9 are the two with the most surface left to get this wrong on.

**2. The plan's own instruments caught the code and missed the prose.** The build's orphan prune,
the `dist` set-equality, the enumeration lint and the citation lint between them made every code
deletion verifiable, and the Turn's code is clean. Every one of the six findings is about a
*sentence* — a file list, a header, a migration note, a user-facing offer. The one lint that reads
prose, `reference-resolution-lint`, resolves paths only, so a header that names a live module in
prose without a path (finding D) and a promise about behaviour (findings E and F) are invisible to
it. That is a real limit of the gate set, not a failure of this Turn.

**3. The curator boundary is drawn on a false premise, and only in one place.** The Circle record
prices `CLAUDE.md`'s staleness as "a false statement until a `/fusion:curate` pass runs", and for
`CLAUDE.md:8` and `:36`, which name `isFusionPluginCwd()` without a path, that pricing is exactly
right — nothing reads them and nothing breaks. For `:29` and `:129`, which name a path, the same
pricing is wrong, because a gate reads them. The boundary is not wrong in principle; it was drawn
without knowing which side of it the lint's surface falls on.

## What can and cannot wait, on the dispatch's question 6

- **`README-hooks.md` and `README.md` can wait.** They are step 11's, step 11 runs before step 14's
  version bump, and their citations break only a lint the same step is verified against.
- **`CLAUDE.md:8` and `:36` can wait** for the curator. They are prose, no gate reads them, and the
  step-4 history already records them as knowingly out of scope.
- **`CLAUDE.md:29` and `:129` cannot wait**, and they are the only thing in the deferred set that
  cannot. They hold `npm test` red for a reason no step in this plan is permitted to remove, and
  step 15's release readiness sits behind that suite. Finding C.
- **`docs/upgrading-to-v9.md` should not wait past step 12.** It is not in the deferred set at all —
  nobody deferred it, it was simply never listed — and the v10 note step 12 writes will point at a
  v9 note that contradicts it. Finding E.

## Recommended sequencing

1. **Before step 7a runs:** add `bin/fusion-turn-budget` to step 7a's Files list (finding B). It is
   the cheapest fix in the set and it belongs in the same diff as the rename.
2. **Before step 9 runs:** merge finding A into `260816-2021`'s fix. Step 9 needs
   `guard-bash-integration.test.ts` in its list *and* a corrected account of which harness fixtures
   may go, plus `lib/__tests__/paths.test.ts` per `260816-2108`. Three records now amend one step;
   they should be read together once rather than applied in three passes.
3. **Before step 11 runs:** add `docs/upgrading-to-v9.md`, `docs/working-model.md:162` and
   `hooks/lib/guard-state-file.ts` to its Files list (findings D and E), and give the
   `reference-resolution-lint` pin an owner.
4. **Before step 15 and the release gate:** settle finding C. It is a decision, not an edit, and it
   is the only finding here that can stop the release.
5. **Any time:** finding F, in whichever step next opens `skills/setup/SKILL.md`.

Nothing in this review asks for a change to the Turn's code. The removal is correct, the deletions
are complete, and the compiled tree is clean.

---

## Reconciliation annotation — 2026-08-17

Findings not rewritten. Their disposition at HEAD, each verified against the tree rather than
against the step that claimed it:

**All six defects this pass filed are closed.** `260816-2021`, `260816-2032`, `260816-2108`,
`260816-2115`, `260816-2122` and `260816-2123` each carry a `Resolved:` footer and a `_c_` marker.
The last of them, the one this review called a release blocker, closed on the remedy this review
recommended: `/fusion:curate` ran inside the Circle as step 16 (`5763550`) rather than step 11
being given an exception, so the curator boundary held.

**The two release blockers named in `## Summary` are both cleared.** `cd hooks && npm test` at
HEAD is green whole — 35 files, 653 tests — and the citation lint is green on its own (34 cases),
which is the gate this review measured as red at `3c2e1c6`.

**Theme 1's dominant pattern was confirmed twice more after this pass**, in `260816-2315` and
`260816-2316`, both since closed. Both were the same shape this review named: a step reasoned about
a symbol's or a record's last consumer and the consumer was somewhere the step never grepped.
