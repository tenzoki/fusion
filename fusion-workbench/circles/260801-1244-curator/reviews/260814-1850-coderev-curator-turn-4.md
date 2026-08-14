# Code review — Turn 4 of Circle `260801-1244-curator`: the shaper's second route, and the caller that can reach it

**Date:** 2026-08-14 18:50
**Sender:** coderev
**Circle:** `260801-1244-curator`
**Reviewed-range:** `0301909..d5b71f1`
**Not-opened:** `fusion-workbench/circles/260801-1244-curator/history/260814-1332-curator-run.md` (2 633 lines; unchanged in this range; opened structurally — every heading; the 28-row ledger table; the ledger entry headings L01-L23 and the candidate list; not read end to end), `fusion-workbench/orchestrator-events.jsonl` (1 431 lines; the 19 lines this range adds read in full; plus every event from 2026-08-14T11:00 and every historical reconciliation / rebalance / shaper line; the remaining ~1 380 lines not read), `fusion-workbench/circles/260801-1244-curator/history/260814-1457-reconciliation.md` (lines 61-196; the head; the two closed planning files; the decision-record section and the Coherence output were read; the per-defect-record middle not read end to end)

Everything else in the range was opened in full, including all eight files carried forward as
not-opened by the Turn-3 review. Three of the eight are cleared with nothing to add: the three
`260814-1128_c_` records are complete and their `Resolved:` footers match the tree.

---

## Summary

The commit that matters, `bf9553f`, meets all three of its decision's constraints and does so in one
commit, which is what constraint 2 required. The `_a_`→`_t_` rename and the `.active-circle` write
stayed where they were, both absolute sentences in `agents/shaper.md` moved together, and the
permitted dispatcher now exists at both ends — the shaper names the orchestrator, the orchestrator
carries the contract. No unreachable dispatcher claim was reintroduced.

Six findings, none in behaviour. The two that matter are both about surfaces the commit did not
reach: the dispatch-parameter roster in `README-agents.md` still states the prohibition the commit
lifted and has no row for the parameter the whole permission rests on, and the halt that enforces
that parameter is triggered by a self-test which `README-agents.md`'s own inheritance model says will
give the wrong answer in exactly the dispatched case.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 2 |
| Medium | 3 |
| Low | 1 |

Five filed under `circles/260801-1244-curator/issues/`, one under `shared/issues/`, all at stamp
`260814-1850`. The split is the Origin Rule: the shared one is a pre-existing orchestrator/shaper
defect this Turn's work made visible rather than caused.

## What was verified, and how

- **The suite.** `cd hooks && npm test` — exit 0, 49 files, 1 030 tests. Re-run rather than taken on
  report.
- **The growth-bound fixture did not move.** `git diff --stat 0301909..HEAD -- hooks/ rules/ bin/
  skills/` is empty. Neither prompt is in the always-on corpus, so nothing could have moved it; the
  absence of any diff under those four trees is the direct evidence, not an inference from the green
  suite.
- **Constraint 1 — the activation writes stayed put.** `agents/shaper.md:47` still reads "the shaper
  never renames the record and never writes the pointer"; `agents/orchestrator.md:359-361` restates
  the same and cites `260806-0015_*_wem-gehoert-die-circle-aktivierung.md`. `skills/next/SKILL.md`
  §6.2 still performs the rename itself. Nothing drifted.
- **Constraint 2 — both absolutes moved together.** Frontmatter (`agents/shaper.md:3`) and mode 3
  (`:47`) are both conditional, in the one commit. Neither still reads absolutely; both keep the two
  clauses that are still true (playmaker cannot dispatch, `/fusion:next` does the writes itself).
- **Constraint 3 — the loop closes from both ends.** Read against the closed defect
  `circles/260801-1244-guard-rules-write/issues/260805-1839_c_der-shaper-portfolio-activation-modus-hat-keinen-erreichbaren-dispatcher-mehr.md`.
  The dispatcher named is the orchestrator, which holds `Agent(fusion:shaper)` and `AskUserQuestion`
  in its allowlist (`agents/orchestrator.md:4`) and now carries a contract naming the condition, the
  three parameter lines and the relay. The inverse failure — a contract with no permission, or a
  permission with no contract — is avoided by both files landing together.
- **The orchestrator's cross-references resolve.** `## Circle head fields` does carry the
  "does not already cite it" test the new section relies on (`agents/orchestrator.md:283`).
  `agents/shaper.md` `## Tool Discipline` exists and says what the new section says it says.
- **Marker footers on the four renames.** `260813-0027` `_a_`→`_i_` carries `Implemented: bf9553f`
  with a per-constraint account; `260801-1020` `_a_`→`_i_` carries `Implemented:` citing `6ba9d77`
  and `1a36fe4`; `260814-1012` `_o_`→`_c_` carries `Resolved: duplicate` naming the surviving record;
  `260811-0826` `_o_`→`_c_` carries the `Split:` line naming its three successors. All four
  conform to `rules/fusion-workbench-conventions.md:332-333` and `:403`.
- **The backlog split matches the portfolio.** `portfolio.md:81-91` `**Performed this run:**` names
  three entries by slug and one-line description; the three files exist under those slugs with those
  titles, each carrying `**Filed by:** user (hand-written, 260811-0826), split out by playmaker
  260814-1733`, and the original carries the retirement line. Nothing else was created, renamed,
  merged, closed or deferred, as the portfolio claims.
- **The five live citations the rename broke are repaired.** See *On the open records* below.

## Findings by theme

### The permission reached two prompts and stopped there

**F1 — High. The dispatch-parameter roster still forbids the dispatch, and has no row for the new
parameter.** `README-agents.md:67`. The `Passed by` cell reads "the user running shaper top-level —
no skill and no agent dispatches this mode (`agents/shaper.md:47`)", and the line it cites now says
the opposite. `**Initiated by:**` — a parameter whose absence **halts** a dispatched run — has no row
at all, while every other halting parameter in the corpus has one. `CLAUDE.md` `## Conventions` names
this table the roster's single authoring home and warns in as many words against the drift that
produced this. Six line-number citations in the same table also moved by two, because `bf9553f`
inserted two lines into `agents/shaper.md` above them; `:55` now lands on a different parameter's
definition. Nothing catches that: `reference-resolution-lint.test.ts` resolves file paths, heading
anchors and workbench records, and reads no line numbers anywhere.
Filed: `circles/260801-1244-curator/issues/260814-1850_o_the-dispatch-parameter-roster-still-forbids-the-dispatch-and-has-no-row-for-the-new-parameter.md`.

**F2 — High. The halt that guards the audit trail rests on a self-test the inheritance model denies.**
`agents/shaper.md:55` decides whether `**Initiated by:**` is required by asking whether the run holds
`AskUserQuestion`. `README-agents.md:97` — "Every sub-agent gets the same tool set the parent Claude
Code invocation has" — and `CLAUDE.md:28` say a dispatched shaper inherits the orchestrator's set,
which includes `AskUserQuestion` (`agents/orchestrator.md:4`). On the documented model the test
returns "top-level" in the dispatched case, waives the line, and the record is edited with no audit
trail.

The seven prompts asserting "a dispatched sub-agent does not receive `AskUserQuestion`" are almost
certainly right and the inheritance sentence over-broad — three observations support it, including
this review's own dispatch, which holds no such tool. **That is inference, not verification**: none
of the three is a controlled run of the shaper in mode 3, and none rules out the tool being present
but unusable, which the self-test would read as top-level.

What `bf9553f` changed is the cost of being wrong. The same claim used to be self-correcting: an
agent that misjudged simply asked, or returned its questions, and either way finished. It is now the
trigger of a halt, and it fails silently in the dangerous direction.
Filed: `circles/260801-1244-curator/issues/260814-1850_o_the-halt-that-guards-the-audit-trail-rests-on-a-self-test-the-inheritance-model-denies.md`.

**F3 — Medium. Phase 0b.1 still tells the orchestrator not to intercept a dialogue the same file now
mandates it relays.** `agents/orchestrator.md:422` against `:350`. One prompt, two protocols, for two
dispatches of one agent — and `agents/shaper.md:121` classifies the Phase 0b.1 dispatch as the
non-interactive kind, siding against the phase step. Pre-existing, but a contradiction between two
documents is a lookup problem while a contradiction inside one prompt gets read as two rules for two
situations.

Worth noting alongside it: `bf9553f` edited `agents/shaper.md:121` — the exact line that open record
`shared/issues/260813-1334_o_fusion-direct-documents-a-shaper-clarification-flow-that-a-dispatched-sub-agent-cannot-run.md`
names as half of its gap — to add portfolio-activation, and left `/fusion:direct` out. The
enumeration is now three of four dispatched shapes, and that record stays open at a line this range
rewrote.
Filed: `shared/issues/260814-1850_o_phase-0b-1-still-tells-the-orchestrator-not-to-intercept-a-dialogue-the-same-file-now-mandates-it-relays.md`.

### The gate that answered the decision left half its trace

**F4 — Medium. The `Answered:` footer cites a location that does not hold the answer, and a trigger
that postdates the gate.** The footer on `260813-0027_i_…` sends a reader to
`shared/history/260813-2345-orchestrator-session.md` `## Coherence`, which is reconciler-owned and
records a verdict and a recommendation, not a user answer; the session's
`## User decisions recorded this session` has no entry for it either. The answer exists only at
`orchestrator-events.jsonl:1424-1425`. The footer also says the gate "followed the reconciler's
`review-needed` verdict" — the gate is stamped 13:13:35 and that pass ran at 14:57, verified against
a commit made at 14:26:43 and counting defect records stamped 14:50.

The irony is load-bearing rather than decorative: the contract this very gate authorised now says
"record the same gate answer in your session history … a permission that lives only in the prompt
leaves no trace at all" (`agents/orchestrator.md:355-358`).
Filed: `circles/260801-1244-curator/issues/260814-1850_o_the-answered-footer-cites-a-location-that-does-not-hold-the-answer-and-a-trigger-that-postdates-the-gate.md`.

**F5 — Medium. The final reconciliation emitted no `reconciliation` event, and the gate it is
recorded as triggering fired first.** `reconciliation` is a defined event type
(`agents/orchestrator.md:1374`) and the log carries earlier instances at `:951` and `:1068`. This
session has none, while a pass ran, changed ten files and appended the `## Coherence` section. The
Rebalance gate at 13:13:35 sits after a per-Turn `coherence_review` recorded as `verdict ok`, a
`circuit_breaker` and a `turn_end` — none of the three Rebalance triggers in `## Human Gate Rules` is
on record at that moment.

No work was lost and no wrong decision followed; what is damaged is reconstructability. Nothing in
the log says a reconciliation happened, and the only artifact that dates it is a history file a
reader has to know to open.
Filed: `circles/260801-1244-curator/issues/260814-1850_o_the-final-reconciliation-emitted-no-reconciliation-event-and-the-gate-it-is-recorded-as-triggering-fired-first.md`.

### The contract exists and nothing routes to it

**F6 — Low. The new section is reachable from no flow step, and no surface offers the choice it waits
for.** `agents/orchestrator.md:310` is cross-referenced from the event table (`:1339-1340`), the
dispatch table (`:1443`) and the shaper — and from no phase step, no `## Human Gate Rules` row and
nothing in `skills/next/SKILL.md`. `/fusion:next` Step 6, the surface where the measured case arose,
prompts with activate / choose another / just look.

**On the judgement asked for:** the distinguishing rule is applicable as written. "Can you quote the
user's own words choosing it?" is answerable on a free-form request as well as on a formal gate, and
the section says "You ask, they choose it, you dispatch" — so the orchestrator may construct the
question itself. The section is usable. What it lacks is a route: the duty it states most emphatically
is a duty to *ask*, and it lives behind two tables an orchestrator consults when dispatching, not when
deciding whether to.
Filed: `circles/260801-1244-curator/issues/260814-1850_o_the-new-dispatch-contract-is-reachable-from-no-flow-step-and-no-surface-offers-the-choice-it-waits-for.md`.

## Cross-cutting observations

**One shape produced F1, F3 and F6: a change that is complete inside its two files and incomplete in
the corpus.** `bf9553f` did what its decision's realisation list named, item for item, and the coder's
own history is honest about what it read and did not edit (`skills/next/SKILL.md`,
`agents/playmaker.md`, `rules/circle-records.md` read but not edited). `README-agents.md` was neither
read nor named. The realisation list itself named only the two prompts, so the omission traces back
past the commit to the decision record — which is the same class as its own constraint 2, one step
further out. Constraint 2 said two surfaces state the prohibition; three do.

**A citation form that no gate reads.** F1's second half — six stale line numbers from a two-line
insertion — is the third distinct citation-staleness class this Circle has met, after literal state
markers (`260814-1419_o_`, `260814-1450_o_`) and dead record stamps. Markers and paths have gates
(`reference-resolution-lint.test.ts`, `portfolio-citation-form-lint.test.ts`); `file.md:LINE` has
none, in shipped text or in the workbench. Whether that is worth a gate is a design question this
review does not answer, but the corpus now uses that form heavily — the `## Dispatch parameters`
table alone carries about forty.

**The event log was the surface that stayed honest in Turn 3 and did not in Turn 4.** Record
`260814-1450_o_the-turn-3-bookkeeping-…` reasons explicitly from the log being the reliable one
("the pattern is the one this session already recorded twice as a `state_drift` event"). F5 is that
assumption failing one Turn later, and F4 is the same session's other record pointing at a place the
answer is not. Both are the Turn-3→Turn-4 boundary, and both fixes are cheap now and archaeological
later.

## On the open records

Thirteen open defect records stood in the Circle before this pass; five are added here.

**One is now stale.**
`260814-1450_o_renaming-the-spec-and-plan-to-closed-broke-twenty-citations-that-spelled-the-open-marker.md`
names five live citations to repoint and ten historical ones to leave. All five are repaired at HEAD:
`_t_circle.md`'s `**Active spec/plan:**` and the two decision `**Cross-references:**` in `e02f268`
itself, the two issue records (`260814-0813_o_`, `260814-0828_o_`) in the same commit, and
`agentstate.yaml` (gitignored, checked on disk: both `plan_file` and `source_file` read `_c_`). Its
recommended fix is applied and its "what must not be done instead" was respected. It reads as open
work and is not.

**The other twelve stand.** The six Turn-3 findings were re-checked at the sites they cite and none
has been overtaken; `260814-1419_o_the-layout-trees-consumer-column-…`, named by the previous
reviewer as wanted before closure, is untouched by this range. `260814-1200_o_the-proof-run-cannot-be-dispatched-…`
correctly stays open on its general shape after the reconciler cleared the instance, and its closing
observation — that the installed and source `8.2.0` are no longer the same bytes — has grown by three
more commits since it was written.

**One live consumer of the new contract.** `260814-0828_o_` names its own remaining repair as
"the shaper's in portfolio-activation mode, or the orchestrator's within its three head fields" — a
stale `## Grounding snapshot` on this Circle's own record. That repair became reachable from inside
this session for the first time with `bf9553f`, subject to the gate the contract requires.

**One drift not filed, offered as a judgement.** `rules/circle-records.md:83` describes the Grounding
snapshot as "Filled at `_a_ → _t_` activation by shaper portfolio-activation mode", while
`agents/orchestrator.md:362` now states "**Re-sharpening is not activation**". The two are reconcilable
by reading the rule's phrase as "in the run-up to activation", and the rule is a template annotation
rather than an operative statement. Worth a clause if that file is opened for another reason; not
worth opening it for.

## Recommended sequencing

**Before the next release, not before the next Turn.** F1 is the one with a reader who will be
misled: `README-agents.md` is user-facing documentation and its roster is what a caller outside the
orchestrator consults before dispatching. Its two halves are a five-minute edit each.

**Decide before fixing:** F2. The cheap half (correct the inheritance sentence) removes the
contradiction and leaves the halt resting on self-introspection. The other half (make
`**Initiated by:**` unconditional in mode 3, and drop the discriminator) changes a contract the user
just set at a gate, so it belongs to the user, not to a coder. A single headless dispatch would
settle empirically what the prompt currently asserts, and that is worth doing first either way.

**Cleanup:** F3, F4, F5, F6. None blocks anything. F4 and F5 get materially harder to write
truthfully the further the session runs from the moments they describe.

**Not a release blocker anywhere.** Nothing in this range changes behaviour of any shipped
executable, no test moved, and the always-on rule corpus is untouched.

---

## Reconciliation annotation

**2026-08-14, reconciler, `code` domain, verified against the working tree at HEAD `41c224c`.**
Findings are annotated, not rewritten. Three of the six are resolved and the evidence was
re-derived from the tree rather than taken from the closing commit's message.

- **F1 — resolved.** `README-agents.md:66` now names the orchestrator as a permitted dispatcher of
  `**Mode:** portfolio-activation` and cites `agents/orchestrator.md:337`; `:67` carries the same for
  `**Circle file:**`; `:68` is the new `**Initiated by:**` row the finding said was missing, with its
  halt condition and its dispatcher. Landed in `9f4cdac`; record renamed at `41c224c`
  (`circles/260801-1244-curator/issues/260814-1850_c_the-dispatch-parameter-roster-still-forbids-the-dispatch-and-has-no-row-for-the-new-parameter.md`).
- **F2 — not resolved, and correctly so.** The finding's own recommendation was to settle the
  question empirically before editing. Two headless probes were run; they establish that the
  discriminator is unsound and could not reach the direction the halt depends on, so `agents/shaper.md`
  was deliberately left untouched. The remedy is a contract change and is filed as
  `circles/260801-1244-curator/decisions/260814-1915_o_should-mode-3-require-the-audit-line-on-every-run-instead-of-testing-whether-it-was-dispatched.md`.
  The defect record stays open and cites that decision as its closing condition.
- **F3 — resolved.** `agents/orchestrator.md:421` (Step 0b.1, item 3) now mandates the relay and
  points at the `## Re-sharpening an anticipated Circle` contract for the mechanics instead of
  carrying a second copy. Record closed in the shared store
  (`shared/issues/260814-1850_c_phase-0b-1-still-tells-the-orchestrator-not-to-intercept-a-dialogue-the-same-file-now-mandates-it-relays.md`).
- **F4 — open.** `circles/260801-1244-curator/issues/260814-1850_o_the-answered-footer-cites-a-location-that-does-not-hold-the-answer-and-a-trigger-that-postdates-the-gate.md`
  stands; nothing in `9f4cdac` or `41c224c` touches the footer it names.
- **F5 — open.** `circles/260801-1244-curator/issues/260814-1850_o_the-final-reconciliation-emitted-no-reconciliation-event-and-the-gate-it-is-recorded-as-triggering-fired-first.md`
  stands.
- **F6 — open.** `circles/260801-1244-curator/issues/260814-1850_o_the-new-dispatch-contract-is-reachable-from-no-flow-step-and-no-surface-offers-the-choice-it-waits-for.md`
  stands. `grep -n 'portfolio-activation' agents/orchestrator.md` still returns no hit inside a
  numbered flow step.

**One thing this review could not have covered, recorded here so the range is honest.** The
`**Reviewed-range:**` above ends at `d5b71f1`. Three commits followed it — `6d433c2`, `9f4cdac`,
`41c224c` — and `bin/fusion-review-coverage` reports them `uncovered`. `9f4cdac` is the commit that
resolved F1 and F3 above, and it edits an always-on rule file. No review pass has opened it. Filed
as `circles/260801-1244-curator/issues/260814-2017_o_turn-5-edited-three-shipped-surfaces-including-an-always-on-rule-file-and-no-review-pass-ever-opened-them.md`.
