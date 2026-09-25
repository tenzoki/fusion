# Reconciliation — Circle `260801-1244-curator`, final pass

**Date:** 2026-08-14 14:57
**Agent:** reconciler
**Domain:** `code`
**Session:** `260813-2345-orchestrator-session.md`
**Verified against:** the working tree at HEAD `18173e1`, 18 commits since the session anchor `d7786eb`
**Scope:** `SCAN_PLANS`, `SCAN_ISSUES`, `SCAN_DECISIONS`, `SCAN_REVIEWS` and `SCAN_HISTORY`, each across both the Circle's store and `shared/`

---

## What was reviewed and what moved

| Store | Read | Changed by this pass |
|---|---|---|
| Planning | 10 files (2 Circle, 8 shared) | 3 — the Circle's spec and plan both closed; one citation starred in the shared spec |
| Defect records | 308 files (24 Circle, 284 shared) | 3 annotated, 3 newly filed |
| Decision records | 47 files in scope (3 Circle, 44 shared) | 2 — one walked to implemented, one annotated |
| Reviews | 26 files (4 Circle, 22 shared) | 1 annotated |
| Session histories | 4 Circle, and the session's own | 1 — the `## Coherence` section appended |

Nothing was trusted to a header. Every claim below was re-derived from the tree or from the commit
that carries it, and the test suite was re-run rather than taken on report: `cd hooks && npm test`
gives 49 files and 1 030 tests, all passing, with no `RULE-TEXT BUDGET` report for any role.

---

## The two planning files closed

**`260814-0845_*_plan-curator.md` → `_c_`, Status Draft → Complete.** All five
implementation steps carried `[DONE]` and all five were verified independently:

| Step | Evidence on disk | Commit |
|---|---|---|
| 1 Author the curator prompt | `agents/curator.md`, 32 356 bytes, frontmatter `name` + `description` only | `6ba9d77` |
| 2 Register the seventeenth agent | `bin/fusion-rules:174` and `:185` carry `curator`; `rules-emission.golden:66` holds its block; `ls agents/*.md` = 17 | `6ba9d77` |
| 3 The `/fusion:curate` skill | `skills/curate/SKILL.md`, `allowed-tools: [Bash, Read, AskUserQuestion, Agent(fusion:curator)]` | `44b9967` |
| 4 The cleanup staleness line | `skills/cleanup/SKILL.md:197-206` | `5b81f5a` |
| 5 Arm the growth bound | `rules-emission-golden.test.ts:651` defines `growth()`; `:470-479` the five re-set core entries with their `2026-08-14 arming` comments; `:482` the untouched role entries | `5c843e6` |

**`260814-0738_*_spec-curator.md` → `_c_`, Status Draft → Complete.** All seven
capabilities (C1, C2, C3, C6, C7, C10, C11) verified present. C7 was the one worth re-checking,
because Turn 1 found the curator missing from the orchestrator's dispatch allowlist: all three
invocation shapes are reachable today — top level, `/fusion:curate` (`skills/curate/SKILL.md:3`) and
orchestrator dispatch (`agents/orchestrator.md:4`, `:236`, `:1399-1401`).

The spec's `## User Decisions Pending` box was ticked with the answer and its record cited. That is
one of the three surfaces named in
`260814-0828_*_the-grounding-and-the-spec-still-call-the-growth-bound-decision-open-after-it-was-answered.md`;
the other two are outside this agent's write set, so the record stays open.

---

## The Circle's decision records

**Both `_i_` records were verified against the commits, not against the Turn log.**

- `260814-0738_*_how-is-the-always-on-growth-bound-armed-…` — `5c843e6` re-set exactly the
  five core entries in `RULE_BASELINE`, each carrying an inline `2026-08-14 arming` comment, and
  left the three role entries at their 2026-08-05 figures. The cut log carries the arming entry and
  reproduces the overshoot as text. `RELEASE_CAP` and `DRIFT_CEILING` untouched. Claim holds.
- `260814-0845_*_are-the-sixteen-agent-claims-corrected-or-derived-away.md` — `6ba9d77`.
  Re-measured rather than read: `grep -rn 'sixteen'` over `agents/ rules/ skills/ hooks/lib/
  CLAUDE.md README*.md docs/ .claude-plugin/` returns eight hits. Five are the cut log's historical
  measurements in `rules-emission-golden.test.ts` (lines 308, 360, 369, 377, 395), which the
  record's own constraints forbid touching; three are unrelated "sixteen commits" prose in the
  review-coverage module and its test. No live "sixteen agents" claim survives. Claim holds.
- `260814-1332_*_what-marks-an-implemented-decision-…` — genuinely open. Filed by the
  curator's own run rather than answered by it, which is what `agents/curator.md` `## Contradictions`
  requires when both positions are defensible. Left as filed.

**One decision elsewhere in scope was walked forward.**
`260801-1020_*_where-does-normative-consistency-live.md` → `_i_`. This is D1, the
record the Circle's own Grounding names as binding: option 3, a writing consolidation agent rather
than a report-only detector. That agent now exists and has run end to end. Two earlier reconciliation
passes held it at `_a_` for the stated reason that `agents/curator.md` did not exist
(`260801-2038-reconciliation.md:79`,
`260802-1413-reconciliation.md:62`). It does now.

**Two answered records were checked and deliberately left at `_a_`.**
`260810-2145_*_should-a-repeated-skill-body-snippet-become-a-bin-helper-…` states in
its own body that the marker stays `_a_` because it bundles two questions and only the first is
answered — verified: `bin/fusion-source-root` exists and four skill bodies call it, and the domain
capture is still open. `260811-1522_*_should-the-readme-hooks-lib-table-pin-its-prose-…`
has no generating mechanism in `hooks/lib/__tests__/`, so it is unrealised.

A full `_a_`→`_i_` audit of the remaining 10 answered records in scope was **not** performed and is
named here so its absence is not read as a clean bill.

---

## Defect records: what stands and what changed

**13 open in the Circle, 11 closed.** The 11 closures were spot-checked against the tree and hold.
Of the 13 open, three were annotated with reconciliation evidence and three are new.

**Annotated, all three still open:**

- `260814-0813_*_the-circle-records-title-and-dependencies-still-describe-the-conventions-file-as-the-validation-case.md` — the Circle record's title and `## Dependencies` still name the conventions file
  as the validation case. Unchanged, and now sharper: the validation case has since actually run
  against the decision corpus.
- `260814-0828_*_the-grounding-and-the-spec-still-call-the-growth-bound-decision-open-after-it-was-answered.md` — half-resolved, as above.
- `260814-1200_*_the-proof-run-cannot-be-dispatched-from-the-session-that-built-the-agent.md` — the instance is cleared (`~/.fusion` holds 17 prompts including `curator.md`,
  both manifests read `8.2.0`, and T7 completed), the structural gap is not. Any Circle whose
  Directive is "build an agent and prove it by running it" still cannot finish in one session.

**`260810-0410_o`** was annotated: ledger entry L24 added all three Plane files to the
layout tree at `1a36fe4`, so question 1 half-landed, while questions 2 and 3 are untouched. Its
successor record `260814-1419_*_three-plane-files-entered-…` says "do not refile it, this record is
the new state" — the two describe one job and should close together.

**Newly filed by this pass (3):**

1. `260814-1450_*_renaming-the-spec-and-plan-to-closed-broke-twenty-citations-that-spelled-the-open-marker.md`
   — the direct cost of the two renames above, enumerated by file with a repair recommendation per
   row. Ten of the twenty should stay as they are.
2. `260814-1450_*_the-turn-3-review-states-five-findings-and-a-three-two-split-while-carrying-six-and-a-four-two-split.md`
   — a hand-written count wrong inside the review whose own cross-cutting observation is that
   hand-written counts need a gate.
3. `260814-1450_*_the-turn-3-bookkeeping-says-no-review-ran-in-the-commit-that-landed-the-review.md`
   — four bookkeeping surfaces, including a Turn-log citation to a stamp (`260814-1210`) that has
   never existed on disk.

**`260814-1430_o`, the net-negative breaker, was checked at the dispatcher's request
and the claim holds.** `agents/orchestrator.md:1014` defines `issues_created` as reviewer findings,
one file each; `:1011` defines `tasks_resolved` as queue entries. Nothing constrains the fan-in
between them, so the ratio is not biased but **undefined** — the same real progress reads 7-against-1
or 1-against-1 depending only on how a batch was enqueued. That is a stronger statement than the
record makes and it supports the record's conclusion. One correction was offered in an annotation
rather than edited in: the record folds two defects into one sentence. The cross-unit comparison is
a design fault in the prompt; the check not running at Turns 2 and 3 is an execution fault of this
session, of the same shape as new issue 3 above, and fixing the metric will not make the check run.

---

## Reviews

The four Circle review files were read; findings were not rewritten. One annotation was added to
`260814-1419-coderev-curator-turn-3.md`: all six of its findings were re-checked against the
tree and all six still stand — finding 3 was re-measured, and `stilwerk/chat-voice-de.yaml` and
`chat-voice-en.yaml` both still differ from the workbench copies while both `default-voice-*.yaml`
are identical. The same note records the finding-count contradiction filed as new issue 2.

---

## Open-decision surface

Eight open decision records sit in `$SCAN_DECISIONS` — one in this Circle, seven shared — and two
more sit in a closed Circle no key reaches. Each is a question for the user, not work for an agent.
Ranked by what it blocks.

**HIGH — bears on closing this Circle or on the next one**

1. `260814-1332_*_what-marks-an-implemented-decision-whose-implementation-was-later-deleted.md`
   — filed by the curator's own run. Four options, recommendation option 3 at moderate confidence.
   It decides what the curator does on every future run in any project, and roughly eleven affected
   records sit in closed Circles that no single pass can repair.
2. `260813-0027_*_should-the-orchestrator-be-able-to-dispatch-the-shapers-portfolio-activation-mode.md`
   — no longer hypothetical. This session took the path `agents/shaper.md:3` and `:47` forbid: the
   orchestrator dispatched the shaper in portfolio-activation mode, and the result is commit
   `f273b9a`, the re-sharpened Grounding this whole Circle then ran against. Annotated with that
   evidence this pass. Two shipped prompts and the practice now disagree.

**MEDIUM — shapes work already queued**

3. `260812-1232_*_does-the-escalation-counter-survive-a-block-source-that-ships-inert.md`
4. `260812-1232_*_does-the-write-guards-fusion-repo-stand-down-survive-the-loss-of-its-subject.md`
   — both are successor questions the protected-path removal left open on 2026-08-12, and both are
   named in the HIGH item 1 record as the reason no decision record authorised that retirement.
5. `260812-0254_*_how-does-a-consuming-project-file-a-defect-against-the-plugin.md`

**LOW — open by choice or unscoped**

6. `260811-2009_*_is-the-hooks-suite-meant-to-be-run-concurrently-with-itself-and-if-not-who-serialises-it.md`
7. `260812-0254_*_should-a-cited-artifact-path-be-absolute-so-an-editor-can-open-it.md`
8. `260812-0254_*_should-the-investigator-get-case-folders-with-a-status-per-case.md`

**Out of reach from this Circle**, listed so the count is honest: two open records in
`circles/260813-0910-documentation-matches-shipped-plugin/decisions/`, both stamped `260813-1820`.
`$SCAN_DECISIONS` reaches the Circle in scope and `shared/` only, so no run with this Circle active
can see them.

---

## Two things left for the orchestrator, because they are outside this agent's write set

1. **Three live pointers broken by the two renames.** `agentstate.yaml`
   (`plan_context.plan_file`, `current_task.source_file`) and `_t_circle.md`
   (`**Active spec/plan:**`) still spell `260814-0845_*_plan-curator.md`. Phase 4 already writes
   both surfaces.
2. **The Circle record's title, `## Dependencies` and `## Grounding snapshot`** carry the three
   contradictions named in `260814-0813_*_the-circle-records-title-and-dependencies-still-describe-the-conventions-file-as-the-validation-case.md`, `260814-0828_*_the-grounding-and-the-spec-still-call-the-growth-bound-decision-open-after-it-was-answered.md` and the `260814-1210` stamp error.

`260801-1122_*_spec-normative-consolidation.md`, the earlier four-Circle spec, is a
candidate for closure once this Circle closes — three of its four Circles were already closed and
the fourth is delivered. It is left open here rather than closed on an anticipated event.
