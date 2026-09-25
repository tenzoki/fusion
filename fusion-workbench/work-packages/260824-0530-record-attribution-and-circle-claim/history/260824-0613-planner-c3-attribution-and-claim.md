# Planner session: C3, attribution on records and a claim on the Circle

**Date:** 2026-08-24
**Agent:** planner (dispatched, non-interactive)
**Circle in scope:** `260824-0530-record-attribution-and-circle-claim` (passed as the resolver's second argument)
**Status:** Complete

## What was asked

Produce the implementation plan for capability `### C3` of
`260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`, reading the Circle
record's `## Grounding snapshot` as binding over the spec where the two disagree, and landing the
plan inside the named Circle rather than wherever `.active-circle` points.

## What was produced

- `260824-0613_*_c3-attribution-on-records-and-a-claim-on-the-circle.md`,
  twelve steps, each routed to one executor and each carrying its own acceptance criterion.
- `260824-0613_*_does-a-filing-agent-halt-in-a-tree-that-is-not-a-git-work-tree-at-all.md`,
  the one choice point planning surfaced whose reach goes beyond this plan.

## What the plan turns on

**The spec's third acceptance criterion is superseded and the plan says so.** Attribution is the git
identity; the claim is the git identity plus a locally minted checkout identifier. Both are obtained
from one new helper, `bin/fusion-identity`, so no second identity mechanism spreads through the
prompts.

**The identifier is minted rather than derived, and the rejected alternative is named.** Hostname
plus workbench path would need no new file, no layout entry and no Setup bytes, all of which matter
against the measured budgets, and it was rejected on the one property the field exists for: it is
not unique by construction, because default hostnames repeat.

**Two of the four growth bounds are effectively spent, and that shaped the step order.** Measured on
260824: the always-on rule core has 3 321 bytes left, `agents/` has 13 706, `skills/` has **202**,
and the hook-test surface has **188 lines**. The `skills/` overage is concentrated in
`skills/setup/SKILL.md` at +13 860 bytes over its baseline, which is the same file the work has to
write into, so the plan opens the skill work with a cut of at least 2 000 bytes in a commit that
names it. No baseline moves anywhere in the plan.

**Almost nothing restates `**Filed by:**`, which shrank the `agents/` edit to two files.** A sweep of
`agents/*.md` and `skills/*/SKILL.md` found exactly two write instructions, `agents/shaper.md:93`
and `skills/memo/SKILL.md:117`. Every other filing agent takes the field from the template it
already loads, so putting the person into the templates is the instruction to all fifteen.

**The defect record has no author field at all today**, so one of the three record kinds gains a
field that does not exist rather than a value inside one that does. The spec places that format in
`rules/circle-records.md`; it is in `rules/fusion-workbench-conventions.md`, and the plan corrects
the placement.

**The claim does not inherit the activation-route divergence, for a structural reason.**
`260822-2045_*_a-circles-head-fields-end-up-in-different-states-depending-on-which-of-the-two-activation-routes-ran.md`
is used in its narrowed 260823 form. The orchestrator's `**Active spec/plan:**` row carries a
condition the skill cannot evaluate; the claim's value is one command's output that either performer
can run, so the plan writes it as an unconditional row in the one authoring home both routes cite.

**The filename question is answered as option 2**, write the citation form down as normative and
leave every filename alone, and approving the plan is the answer. That also meets the condition
`260807-0158_*_how-is-a-unique-record-filename-obtained.md` set for itself on
2026-08-07 and has been waiting on since.

## Checks run before finishing

- `hooks/lib/__tests__/workbench-citation-lint.test.ts` and
  `hooks/lib/__tests__/plan-stopping-section-lint.test.ts`: both green with the new plan and decision
  in the corpus.
- `bin/fusion-prose-metric` over both new files: zero em-dashes in 6 313 prose words.
- The four growth-bound figures were measured from `hooks/lib/__tests__/surface-growth-bound.test.ts`
  baselines and `hooks/lib/__tests__/fixtures/surface-growth.golden`, and from the five always-on
  rule files against `RULE_BASELINE` in `hooks/lib/__tests__/rules-emission-golden.test.ts`.

## What stops the plan proceeding past step 6

The open decision filed this session. Its rule text is the answer written down, so it is answerable
at the plan gate and the plan does not guess it.
