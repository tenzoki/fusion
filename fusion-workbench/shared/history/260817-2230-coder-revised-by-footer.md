# Coder — the `Revised by:` footer on closed defect records

**Status:** Complete
**Task:** T4 — realise decision `260817-2215_*_how-does-a-closed-defect-record-point-at-a-later-reversal-of-the-judgement-in-its-resolution-note.md` option 1 in the conventions, annotate the measured instance, close the reconciler's defect.
**Agent:** coder
**Started:** 2026-08-17 22:23
**Finished:** 2026-08-17 22:29

---

## What was implemented

Decision `260817-2215_*_how-does-a-closed-defect-record-point-at-a-later-reversal-of-the-judgement-in-its-resolution-note.md`
was answered option 1 at a user gate: the issue vocabulary gains a footer for the case where a
later commit or record reverses the reasoning in a closed record's `Resolved:` note. The label is
`Revised by:` and nothing renames, following the `Retired:` precedent on decision records.

Three edits plus the decision-record update:

1. `rules/fusion-workbench-conventions.md` — `### Issue files` under `## Inline State Tracking`
   gains the footer block and its rule, immediately after the `Resolved:` block it qualifies.
   `## State Markers — issues and planning` gains a pointer in the `_c_` row, so a reader looking
   up the marker meets the footer there rather than only in the tracking section. `Superseded by:`
   is stated to keep its decision-record meaning and never to be used on an issue file, which is a
   constraint of the decision.
2. `260817-2130_*_…` — the measured instance. Footer appended citing `307a696` and
   `260817-2147_*_…`, the record that carried the counter-argument. The `Resolved:`
   note is unedited and the filename unchanged, per the decision.
3. `260817-2207_*_…` → `_c_` with a resolution note.
4. The decision record: `Implemented:` line appended, `**Status:**` moved to `implemented`,
   `_a_` → `_i_`. Its `Cross-references:` carried `260817-2207` with an exact `_o_` marker that my
   own rename made stale; that one citation was rewritten to the `_*_` wildcard form.

## Measurement

`rules/fusion-workbench-conventions.md` grew 56 102 → 56 810 bytes, +708. It is an always-on rule
file, so the universal-core growth bound in `hooks/lib/__tests__/rules-emission-golden.test.ts`
applies: the core stood at 91 288 before the edit against a `RULE_BASELINE` of 86 573, so the
delta went 4 715 → 5 423 of the 12 000 bytes of head-room. The bound never went red and no
baseline was touched.

The golden fixture `hooks/lib/__tests__/fixtures/rules-emission.golden` did fail, because it pins
each file's exact size. Regenerated with the documented one command
(`UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts`, which rewrites
the fixture and then fails on purpose), and the diff reviewed: exactly one file's size moves, by
+708, across all sixteen agents. No path entered or left any agent's set and the emission order is
unchanged. Regenerating the fixture does not move `RULE_BASELINE` and absolves no growth.

## What was deliberately not done

`260817-2138-coder-staging-sentence-per-shape-justification.md` §1 carries the same
withdrawn paragraph, and `260817-2207`'s acceptance criteria asked for it to be reachable too. It
is not annotated. History files carry no state vocabulary and are not maintained, and the footer
this decision defines is for issue files. That leg of the criteria is recorded as unmet in the
closed record rather than quietly dropped; closing that entrance needs its own decision about
whether history files gain forward pointers at all.

Four inbound citations elsewhere in the workbench still name `260817-2207` with its old `_o_`
marker — two in `260817-2207-reconciliation.md`, one each in the two coderev review
files. Out of this task's scope and left alone. No lint gate reads them: the reference-resolution
gate's surface is the shipped text, not the workbench.

## Verification

`npm test` in `hooks/` — exit 0, 653 tests in 35 files. Baseline before the edits was the same 653.
