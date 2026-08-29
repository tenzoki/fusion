# Step 2: the filename answer is recorded, and the re-measurement moves

**Date:** 2026-08-24 09:20
**Agent:** coder
**Circle:** 260824-0530-record-attribution-and-circle-claim
**Plan:** `260824-0613_*_c3-attribution-on-records-and-a-claim-on-the-circle.md` step 2
**Status:** Complete

## What was done

Appended an `Answered:` annotation and an `## Answer (user, 260824)` section to
`260822-1556_*_does-the-record-filename-convention-hold-when-several-checkouts-file-into-one-store.md`,
then renamed the marker `_o_` to `_a_` with `mv`. Marked step 2 `[DONE]` in the plan.

The answer takes option 2: the stamp-plus-slug-plus-wildcard citation form becomes normative rule
text in `rules/fusion-workbench-conventions.md` `## Filename Patterns`, a bare stamp is stated there
not to be a citation, and no filename pattern changes anywhere. The rule text itself lands at step 6;
this record carries the answer only.

Four things the appended section carries beyond the choice.

**Why the repair attaches to the citation and not to the name.** Several checkouts raise the rate at
which two records share a stamp; they do not create the sharing, which exists today under one
writer. What breaks is a citation naming a record by the stamp alone, so the defect is in the
citation grammar and the repair belongs there.

**Option 3 is foreclosed, not judged.** The identifier goes in the record body and never in a
filename, a condition the user attached at the round-3 gate and stated in
`260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md:173` `### C3`. The section
records that the option was weighed and excluded by that condition, and that its stated advantage is
unrefuted, so a later reader does not reopen it as an oversight.

**Option 1 is what the project does today and is defensible.** It fails only on the argument its own
Cons row makes. Option 2 takes nothing away from it.

**Why writing it down is not a dodge.** `hooks/lib/__tests__/helpers/citation-scan.ts` already
parses `<stamp>_*_<slug>.md` and its prefixed forms and reports both what a token matched and how
many things it matched. A bare stamp produces no token in that grammar, so the gate is silent over
exactly the citations that mislead. Writing the form down moves a citation inside the reach of a
gate that exists.

## The re-measurement

The `84` the record's own Question carries is `260807-0158`'s figure over 579 files. Re-measured
today over the same corpus definition it is **111**, and the difference is stated plainly in the
record rather than reconciled away. The corpus has grown to 876 record files; 545 distinct stamps;
442 files sit on a multiply-occupied stamp; **0** files share a full basename with the state marker
normalised, which is the row that keeps `260807-0158`'s measurement intact. The naming convention is
not failing. What is ambiguous is a citation, never a file.

Command, run from the workbench root:

```
find circles shared -type f -name '*.md' \
  | grep -vE '/(archive|stashes|\.migration-v2-backup)/' \
  | xargs -n1 basename | grep -E '^[0-9]{6}-[0-9]{4}_' \
  | sed -E 's/^([0-9]{6}-[0-9]{4}).*/\1/' | sort | uniq -c | awk '$1>1' | wc -l
```

## Marker choice

`_a_`, not `_i_`. The rule `rules/fusion-workbench-conventions.md` `## Filename Patterns` at HEAD
(line 266) still carries no citation rule, so nothing realises this answer in normative text. Step 6
writes the sentence and the record moves to `_i_` at step 12, which is also where
`260807-0158_*_how-is-a-unique-record-filename-obtained.md` meets the condition it
set for itself three reconciliations running.

## Verification

`npm test` from `hooks/`, exit 0 (41 files, 724 tests).

One observation worth recording rather than hiding. The first full run of the suite failed one test,
`lib/__tests__/guard-state-shape.test.ts` "still reports the gap, and repairs the file instead of
failing again", on an empty string where a coverage sentence was expected. Run alone it passes, and
two subsequent full runs pass with every test green. The test spawns its own temporary project and
reads nothing this step wrote, so the failure is timing-sensitive under parallel load rather than
caused here. Reported, not investigated: it is outside this step's file scope.

`bin/fusion-prose-metric` reports the file at 4 em-dashes over 1 683 words against a permit of 1,
verdict `over`. Three of the four are pre-existing, in the Question and Options sections that the
no-existing-line constraint forbids editing. The fourth is mine and is the `Answered:` line, whose
form `rules/fusion-workbench-conventions.md` `## Inline State Tracking` spells with an em-dash.
Reported, not gated.

## Constraint held

No existing line of the record was edited. The file's first 4 831 bytes are byte-identical to the
committed version, verified by `diff` against `git show HEAD:` rather than asserted.
