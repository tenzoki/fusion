# Analyst session: preventing fusion's own identifiers from reaching a consuming project

**Date:** 2026-08-18 07:15
**Agent:** analyst
**Type:** Feasibility analysis
**Requested by:** user
**Status:** Complete
**Tree at:** `1dc062d`, clean

---

## What was asked

Establish the real surface by which fusion-internal identifiers can reach a consuming project,
weigh the options for holding it, state the distinguishing criterion between a legitimate
provenance citation and a harmful one or say plainly that none exists, and close with a
recommendation and its residual. No source file to be edited.

## What was done

1. Read the open record `260817-2131_*_nothing-stops-a-fusion-workbench-id-returning-to-an-emitted-hook-sentence-because-the-lint-reads-comment-lines-only.md` including the reconciliation note of 260817-2207, and the
   closed incident record `260817-2110_*_the-hook-sentences-cite-fusions-own-workbench-ids-and-a-fusion-commit-hash-into-a-consuming-projects-session.md`.
2. Enumerated ten channels by which text authored here reaches a consuming session or user, and
   measured each for fusion identifiers at HEAD.
3. Verified the record's out-of-scope claim for `hooks/lib/domain-cascade.ts`: its only importers
   are two test files.
4. Read `reference-resolution-lint.test.ts` and `helpers/citation-scan.ts` to judge whether the
   existing gate can be extended. It cannot; it answers the opposite question.
5. Verified that `260810-1205` resolves in this workbench (three files), which is what proves the
   existing gate would have passed all four incident identifiers.
6. **Prototyped the proposed gate in its containment form** against the compiled builders, once at
   HEAD and once at `82a860d`, across all six branches. It caught 4 of 4 incident identifiers and
   produced no false positive on the branch that legitimately emits consumer hashes. This is the
   load-bearing measurement of the report.
7. Measured the remaining head-room on all four growth bounds by replaying their baseline maps.

## What was written

- `260818-0715-preventing-fusion-internal-identifiers-from-reaching-a-consuming-project.md`
- `260818-0715_*_the-orchestrator-prompt-names-a-fusion-record-inside-the-instruction-for-what-to-report-to-the-user.md`
- `260818-0715_*_four-shipped-surfaces-use-a-real-fusion-circle-directory-name-as-the-format-example.md`
- this file

Nothing outside `fusion-workbench/` was touched.

## The conclusion in one paragraph

The identifier's shape does not decide whether a citation is legitimate, and neither does whether
it resolves. The rhetorical role does, and it is not decidable from the text. The delivery channel
is a decidable proxy for it: statically shipped text carries fusion's frame, run-time-composed text
carries the consumer's. Gate the composed side with a containment assertion over the enumerated
sentence builders, gate the static side not at all, and name the class in a rule emitted to no
agent so it costs no dispatch bytes and reaches the channels no test watches.

## What we corrected in the open record

`260817-2131_*_nothing-stops-a-fusion-workbench-id-returning-to-an-emitted-hook-sentence-because-the-lint-reads-comment-lines-only.md` recommends asserting that the output carries no short hash. That contradicts its own
second requirement to drive every branch, because `coverageSentence`'s uncovered branch is full of
the consuming project's own hashes by design. The reconciler found the contradiction; this analysis
supplies the replacement formulation and shows it measured on both sides.

## What we did not do

We surveyed no consuming project and instrumented no session. The channel inventory is derived from
reading the hook entrypoints and the `bin/` scripts, so a composed channel we did not think to look
for would not appear in it. The severity assessments on both filed records are exposure judgements,
not observed failures.
