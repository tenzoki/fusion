# Code review: C0, the cut-only Circle

**Reviewed-range:** `370bfc5..c2ad89c`
**Not-opened:** `260822-1154_*_does-the-hook-test-line-budget-cover-comment-prose.md`, `260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md`, `260822-1136_*_which-identity-does-an-attributed-record-carry-when-the-transport-is-git.md`, `260822-1136_*_how-does-the-tracked-event-log-behave-when-two-checkouts-both-appended-to-it.md`, `260822-1102_*_what-happens-when-a-planned-circles-required-work-exceeds-the-remaining-head-room.md`, `260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`, `260822-1136-shaper-multi-user-fusion.md`, `260822-1154-planner-c0-cut-only-circle.md`, `260822-1226-analyst-cut-ledger.md`, `260822-1318-coder-cut-the-hook-test-suite-by-500-lines.md`, `260822-1350-coder-cut-agents-surface-step3.md`, `260822-1420-coder-cut-skills-surface-step4.md`, `260822-1226_*_the-executor-report-contract-cites-bugfixer-as-its-author-and-bugfixer-defines-a-different-shape.md`, `260822-1227_*_plan-step-4-names-a-duplication-record-whose-own-fix-direction-forbids-the-cut-the-step-asks-for.md`, `260822-1228_*_plan-step-8-asks-for-a-closure-that-was-already-made-and-the-record-already-carries-the-note.md`

Every shipped file in the range was opened. The unopened set is workbench records: the step
history logs (the reports whose claims this review checked against the code instead), the
multi-user spec, and the decision and issue records the ledger filed. The plan and the cut ledger
were read in full, and the two decision records that govern cuts made in this range are quoted
from where the code cites them.

## Summary

Six commits, three of them shipped-code cuts. Every removed passage was checked against the file
the ledger named as its authoring home, and against the tree rather than against the step reports.
One cut removed a claim its cited home does not carry. Nothing removed a mechanism, no baseline
moved, the always-on rule core did not grow, and no subject lost a test assertion.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 0 |
| Low | 1 |

## Verdict on the question this review exists to answer

**No cut removed a mechanism.** One cut removed a rationale into a home that does not hold it,
which the plan's own stopping clause names as a Circle-stopping condition. It is filed as
`260822-1421_*_two-skill-bodies-lost-the-x-guard-rationale-to-a-header-that-does-not-carry-it.md`.

## Findings

### High — a cited authoring home that does not carry the claim

`skills/cleanup/SKILL.md:29` and `skills/help/SKILL.md:31`, row S1.

The removed paragraph in those two bodies ended with the `[ -x ]` guard's rationale: *"a helper
added between releases is absent from an older install and a bare call is exit 127."*
`skills/setup/SKILL.md:32` and `skills/next/SKILL.md:33` keep that claim in a **second** paragraph
the cut did not touch. `cleanup` and `help` have no second paragraph, and
`bin/fusion-source-root`'s header — the replacement pointer's target — does not author the claim.
Its only mention of the guard, at lines 76-79, assumes it in order to make a different point about
branch ordering.

Row S1's own claim column named three things the paragraph states. Two are authored at the
destination; the third is not, in two of the four files. Behaviour is unchanged — the guard is
still in both shell blocks. Filed with two fix directions; the cheaper and more correct one adds
the sentence to the helper's header, which is unbounded, and would let `setup` and `next` drop
their surviving paragraph too.

### Low — a stranded doc comment in the new shared helper

`hooks/lib/__tests__/helpers/citation-scan.ts:815-829`. The block describing `shippedPrompts` sits
above `agentNames`, which has its own one-liner directly beneath it. `shippedPrompts`, the function
four gates now depend on, carries none. Filed.

## What was verified and holds

### Every `agents/` deletion is genuinely authored elsewhere

| Row | Claim | Authoring home, checked | Verdict |
|---|---|---|---|
| A1 | chat profile path; long-form profile does not apply to chat; structured artifacts follow the rule only | `rules/user-facing-output.md:16`, `:28`, `:30` — all three stated | holds |
| A2 | what the readability gate catches | `rules/user-facing-output.md:124-138` — points 2 and 4 carry the em-dash chains and the same three example codes (`S1`, `gate.go`, `must_not`) verbatim | holds |
| A3 | no unsolicited effort estimate; locked phrasing on request | `rules/user-facing-output.md:110-118`, first bullet, in stronger form | holds |
| A4 | action-first; plain English; no undefined jargon; trailing details/references | `rules/user-facing-output.md:51-60` points 1 and 4, and `## Vocabulary` | holds |
| A5 | the long-form profile is the one loaded at Setup | `rules/agent-setup.md` `## Voice profiles` | holds |

All five are emitted to every agent by the always-on set, so every prompt reaching its Output Style
section has already read the replacement. The bytes leave the dispatch rather than moving inside it.

**The row taken wider is the same claim.** `agents/editor.md:98` carried a shortened A2 variant
(*"dense prose with em-dash chains and unexpanded project codes."*, without the three worked
examples). The seventh cut removed that variant and nothing else on the line.

### The reviewer contract reaches both reviewers and only them, and the core did not grow

`hooks/lib/__tests__/fixtures/rules-emission.golden` is the mechanism, and it is generated by
running `bin/fusion-rules` per agent rather than transcribed. `review-contract.md` appears in
exactly two blocks, `[coderev]` and `[ontorev]`, at `total 101342` = 95 064 + 6 278. The other
thirteen agents still read `total 95064`. The always-on core is unchanged.

The emission arm in `bin/fusion-rules:503-509` is **indented** inside its `if`, so
`derivable-enumerations-lint.test.ts:174` — whose parser is anchored with `^emit_if_exists` at
column 0 — correctly excludes it from the always-on list. An accidental unindenting would move the
golden for all fifteen agents and fail both gates.

`IS_REVIEWER_AGENT` is `coderev|ontorev`, matching `REVIEW_SENDERS` in
`hooks/lib/review-coverage.ts:183`. The comment in `bin/fusion-rules:233-239` cites that constant as
the bounding mechanism, and it is the right one.

`rules/review-contract.md` carries the `**Provenance:**` header the rule-file convention requires.

### Nothing lost access at run time

`agents/coderev.md:69` and `agents/ontorev.md:62` each cite the contract and name their own sender
segment. The two consolidated-review filename patterns the prompts used to spell differently
(`YYMMDD-HHMM-coderev-…` versus `YYMMDD-ontorev-…`, the second missing `-HHMM-`) are now one
citation of `rules/fusion-workbench-conventions.md:278`, which gives `YYMMDD-HHMM-<sender>-<topic>.md`.
That silently corrects `ontorev`'s pattern rather than losing it. `ontorev` additionally gains the
**Cross-cutting observations** section it never had; the only thing it loses is the wording
*"Recommended sequencing — what to fix first"*, replaced by *"release blocker versus cleanup"*.

Each prompt keeps what the contract leaves to it: `coderev` its call-chain and sibling-application
cross-reference, `ontorev` its ontology and normative-source cross-reference.

### No subject lost a test assertion

718 → 715 is exactly three, and every one is a loop that ran per prompt against two copies of one
claim:

- `mandateGaps` × 2 prompts → × 1 contract
- `parseRange` over every worked range line × 2 → × 1
- `parseNotOpened` over every not-opened line × 2 → × 1

The drift check that held the two prompt copies equal (`fieldLines(a) === fieldLines(b)`) is
replaced, not dropped: the new case asserts each prompt still cites the contract **and** that
`bin/fusion-rules` still names exactly `coderev|ontorev`. With one authoring home there are no
copies left to drift.

The suite is green: 40 files, 715 tests, exit 0.

### The re-approval log moved verbatim, and the pin still reads

`260822-1318-reference-resolution-pin-re-approval-log-entries-1-to-25.md` holds
25 entries. Compared mechanically against `git show 370bfc5:hooks/lib/__tests__/reference-resolution-lint.test.ts`
lines 493-910 with the `// ` prefix stripped and blank lines ignored: **zero differences**. The
26th entry (the v10.5 release) stays in the test file above `const BASELINE`, together with the
pin's rationale paragraph and the issue citation behind it (`260810-2149_*_a-coverage-floor-cannot-see-coverage-leave-and-the-approved-baseline-pin-is-the-general-answer.md`). Two new attribution
blocks were added for steps 3 and 4, one per step as the plan requires, and both explain the
counter-intuitive direction — the counts *rise* on a step that removed 15 000 bytes, because every
removed restatement left a citation behind.

### The narrower row is correctly narrower

Row H2 grouped `surface-growth-bound.test.ts:197-214` with the `RELEASE_CAP`/`DRIFT_CEILING`
paragraph. Only the "What no bound covers" half was cut; the `RELEASE_CAP` paragraph stays.
Verified: `grep RELEASE_CAP\|DRIFT_CEILING README-hooks.md` returns nothing, so that half is
genuinely not restated and correctly kept. The cut half is authored at `README-hooks.md:398`,
which names the same three `.mjs` files and the same uncovered surfaces.

H1 is authored at `README-hooks.md:387` ("The four budgets are independent", naming
`growth-bound.ts`, the no-pool rule and the fails-alone rule). H3 is authored twice — the command
verbatim in `GOLDEN_HEADER` at `surface-growth-bound.test.ts:421`, and the never-clears-a-bound
rule plus the two re-baselining moments at `README-hooks.md:390`.

H4 (`helpers/guard-harness.ts:17-23`) is a compression, not a removal: the stand-down's vacuity
claim is still stated inline in the four lines that replaced the seven, and `CLAUDE.md`'s opening
section carries the removal it cites.

### The four callers of the new helper read the same file sets

`shippedPrompts()` with no argument reproduces the old private walks in
`commit-message-path.test.ts` and `glob-nomatch-lint.test.ts`; `shippedPrompts(EXEMPT_SKILLS)`
reproduces them in `marker-format-lint.test.ts` and `path-literal-lint.test.ts`, including the
`DEFINITION_SITES` overlap assertion at `path-literal-lint.test.ts:286`. The eleven files that
switched to the exported `pluginRoot` resolve to the same directory: `../../..` from `__tests__/`
and `../../../..` from `__tests__/helpers/` are the same path. `agentNames()` replaces two private
copies whose only difference was `.replace(/\.md$/, "")` versus `.slice(0, -3)`, equivalent on
`.md` files. The one behavioural change is sorting, which affects report order and not membership.

### No baseline moved

Compared byte-for-byte against `370bfc5`: `AGENT_BASELINE`, `SKILL_BASELINE` and
`TEST_LINE_BASELINE` in `surface-growth-bound.test.ts`, and `RULE_BASELINE` in
`rules-emission-golden.test.ts`. All four unchanged.

Head-room measured at `c2ad89c` from the baselines and the tree:

| Surface | Before | After |
|---|---|---|
| Hook test suite | 12 lines | 464 lines |
| `agents/*.md` | 1 638 bytes | 16 601 bytes |
| `skills/*/SKILL.md` | 30 bytes | 4 370 bytes |

The `agents/` and `skills/` figures reproduce exactly. The hook-test figure is 302 as the tree
stands right now, because a concurrent task has since added
`hooks/lib/__tests__/fusion-prose-metric.test.ts` (162 lines, untracked, outside this range).

## Cross-cutting observations

**The relocation the ledger insisted on naming honestly is real, and it is worth carrying into
the closure note.** Row R1 satisfies the `agents/` bound without reducing what either reviewer
loads: the contract left `agents/coderev.md` and `agents/ontorev.md` and arrived in a rule file
those two agents read at Setup, byte for byte. The `agents/` surface is 15 000 bytes lighter and
the two reviewers' per-dispatch context is unchanged. What was bought is a single authoring home
and a gate that can assert against one file instead of holding two copies equal — worth having,
and not a reduction in context.

**Every cut left its citation behind, and the citation counts prove it.** The step-3 attribution
block records paths 1262 → 1277 and anchors 163 → 171 on a step that removed 15 000 bytes. That
direction is the ledger's method working: a restatement removed without a citation would have moved
the counts the other way, and it did not.

**The one class of failure that no gate in this suite can see is the one this review found.** A
pointer to a file that does not carry the claim resolves perfectly — the path exists, so
`reference-resolution-lint` is satisfied, and `workbench-citation-lint` reads the same way. Only
reading both sides catches it. Two of the eleven rows in this range were checked that way and one
of them was wrong, which is a rate worth knowing before the next cut Circle.

## Recommended sequencing

1. **Before this Circle closes:** the High finding. The plan's `## Where this Circle stops` names
   this condition explicitly, so it is a closure question rather than a cleanup one. The fix is one
   paragraph in `bin/fusion-source-root`'s header and costs nothing against any bound.
2. **Cleanup, any time:** the Low finding. Moving one comment block four lines down.
3. **Not a blocker:** nothing else in this range. The suite is green, no baseline moved, and the
   three surfaces cleared their targets.

## References

- Plan: `260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md`
- Ledger: `260822-1226-cut-ledger-for-three-bounded-surfaces.md`
- Moved log: `260822-1318-reference-resolution-pin-re-approval-log-entries-1-to-25.md`
- Filed: `260822-1421_*_two-skill-bodies-lost-the-x-guard-rationale-to-a-header-that-does-not-carry-it.md`, `260822-1422_*_the-doc-comment-for-shippedprompts-is-stranded-above-agentnames.md`

---

**Reconciliation 260822-1556 (reconciler, HEAD `9f65463`).** Findings only; no finding text changed.
The two defects this review filed are both closed and both were verified at their own site rather
than from their notes: `260822-1421_*_two-skill-bodies-lost-the-x-guard-rationale-to-a-header-that-does-not-carry-it.md`
(the rationale now stands at `bin/fusion-source-root:46-56` and the two pointers name three claims),
and `260822-1422_*_the-doc-comment-for-shippedprompts-is-stranded-above-agentnames.md`
(the block sits immediately above `export function shippedPrompts` at
`hooks/lib/__tests__/helpers/citation-scan.ts:830`). The first was later revised by
`260822-1506_*_the-declined-second-order-cut-is-declined-on-a-reason-the-same-commit-made-false.md`,
which the next review found and which is also closed. This review's `**Not-opened:**` field names
five records that do not exist; that is filed as `260822-1510_*_five-of-fifteen-not-opened-entries-name-records-that-do-not-exist-and-no-gate-reads-that-field.md`
and is still open.

---
**Correction appended 260824** (ontocoder, plan step 5 of `260824-1905_*_plan-close-every-open-defect.md`). The first five entries of the `**Not-opened:**` field named records
that do not exist: paraphrases with wrong stamps (`1155`, `1137`, `1138`, `1156`), wrong markers and
reworded slugs. They were corrected in place, in wildcard form, to the five real records they gestured
at, because the field's only reader is the next dispatch and a note beneath it would not reach that
reader. The ten remaining entries were untouched. The class, a field written from recall that no gate
resolves, is `260823-1414_*_does-the-workbench-citation-gates-corpus-cover-review-files.md`.
Filed as
`260822-1510_*_five-of-fifteen-not-opened-entries-name-records-that-do-not-exist-and-no-gate-reads-that-field.md`.
