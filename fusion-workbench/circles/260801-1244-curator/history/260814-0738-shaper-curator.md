# Shaper session — re-sharpening the curator Circle for activation

**Date:** 2026-08-14
**Agent:** shaper, portfolio-activation mode
**Status:** Complete
**Circle:** `circles/260801-1244-curator`
**HEAD at start:** `d7786eb`

---

## What this run was for

Three playmaker runs (2026-08-07, 2026-08-13 morning, 2026-08-13 evening) ranked this Circle first and declined to propose it for activation, each time for the same reasons: the Grounding snapshot's measurements were falsified, the Circle's validation case had been performed by hand in another Circle, and nobody had answered whether the Directive needed a component that bounds the rate the rule corpus grows. This run answered all three.

The run spanned two dispatches. Round one surveyed the tree and returned four clarification questions, writing nothing. Round two, recorded here, received the user's answers and produced the artifacts.

## The four questions and the answers

1. **Rate-bounding.** Yes, into the Directive. The existing budget report in `hooks/lib/__tests__/rules-emission-golden.test.ts` becomes a test that fails, on the always-on rule set.
2. **Derive rather than correct.** Yes, as a preference rule inside the evidence-tier capability. Where a falsified claim is a measurement a command could produce, the curator proposes the derivation instead of the corrected number. Implementing the derivation stays coder work.
3. **Validation case.** The project's own decision corpus, with the defect corpus as a cross-check. The consuming-project witness is out of scope for this Circle.
4. **Rule-file retirement.** The capability retires. A dead rule file is deleted and git holds the bytes. The relocation directory, the tombstone and the version-control check are dropped.

## What was written

- **Spec:** `circles/260801-1244-curator/planning/260814-0738_o_spec-curator.md`. Seven capabilities: C1, C2, C3, C6 and C7 carried from the earlier spec with their original numbers, plus C10 (the growth bound) and C11 (the validation case). Carrying the original numbers rather than renumbering keeps every existing citation of them in the workbench resolving.
- **Decision record:** `circles/260801-1244-curator/decisions/260814-0738_o_how-is-the-always-on-growth-bound-armed-when-the-corpus-is-already-over-budget.md`. One open question the run could not derive away, filed with three options and a recommendation.
- **Circle record:** `## Directive` and `## Grounding snapshot` replaced in place, and `**Active spec/plan:**` re-pointed at the new spec. No other section touched.

## Measurements taken this run

All against HEAD `d7786eb` on 2026-08-14, by running the commands rather than inferring:

- `rules/fusion-workbench-conventions.md`: 51 920 bytes, 24 second-level headings.
- Always-on emission: 93 819 bytes at the leanest agent, 121 888 at the shaper, 129 172 at the orchestrator. 86 466 is plugin rule text; 7 353 is this project's chat voice profile.
- Citations of the conventions file: 207 lines in 63 files across nine surfaces, 106 naming a section, none naming a line number.
- Decision corpus: 82 records, 55 implemented, 14 answered, 9 open, 4 deferred, 0 superseded, spanning 2026-07-06 to 2026-08-13.
- Defect corpus: 510 records, 278 shared and 232 in Circles, 117 open.
- Workbench tracked: 1 130 files.
- Archive store: 0 files.
- `hooks/lib/__tests__/rules-emission-golden.test.ts` run in full: 9 tests pass, and the budget report names all five roles as over budget, by 10 812 to 17 175 bytes.
- `FUSION_ALLOW_RULES_WRITE`: 11 references in `hooks/` TypeScript, every one a comment, a test fixture string or a historical note. No live code reads it.

## Two claims corrected rather than carried

The dispatch handed this run two figures that did not survive checking, and both are corrected in the Grounding snapshot rather than reproduced:

- **"Over three months and 82 records."** The corpus spans 39 days, from 2026-07-06 to 2026-08-13. The three-month figure belonged to an earlier, smaller corpus. The corrected span makes the zero-superseded finding denser rather than weaker.
- **"278 defect records."** That is the shared store alone. The full corpus is 510 records once the Circles' own defect stores are counted, of which 117 are open.

## What the run did not do, and why

- **The Circle record's title line is now wrong.** It reads "and proves it on fusion's own conventions file", and the validation case is the decision corpus. The portfolio-activation mode permits editing two sections and one field, and the title is none of them, so it stands.
- **The `## Dependencies` section is stale** in the same way. It describes the conventions-file partition as this Circle's closing work and names three dependencies that have all closed coherently. Out of scope for the same reason.
- **The earlier spec `shared/planning/260801-1122_o_spec-normative-consolidation.md` was left alone.** It covers four Circles and remains the record of the three that closed. Retiring it is not this run's act.

## One question left open

Arming the growth bound on a corpus already over budget requires either a one-time re-baseline at the moment of arming, or a cut of roughly 11 KB that reintroduces the compaction work the user removed from scope. The spec specifies the re-baseline and states the argument for overriding the position recorded in the test file, which says the baseline moves only after a cleanup. The argument is that the recorded position was written for a reporting instrument and does not reach the case of a blocking gate, where the baseline acquires a second job. That reading is inference rather than a stated user position, which is why the question is filed rather than closed.

Nothing else in the spec depends on the answer.
