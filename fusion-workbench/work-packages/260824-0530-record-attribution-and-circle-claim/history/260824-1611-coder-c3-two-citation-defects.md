# coder — the two high-severity C3 citation defects

**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Status:** Complete

Both findings were the same shape: a pointer that resolves and does not carry what was cited.

## Defect 1 — the override call sites cited a section that defines no override

`260824-1538_*_both-override-call-sites-cite-a-section-that-does-not-define-the-sentence-they-must-write.md`

`skills/next/SKILL.md` Step 6.1 and `skills/setup/SKILL.md` Step 0i both sent the run to
`agents/orchestrator.md` `## Circle head fields` for the claim field's `Overridden ` sentence, which
that section does not contain. Both now cite `rules/circle-records.md` `### The claim field`, where
the form is authored. The definition was not moved and no third copy of the sentence was written.

The orchestrator section stays cited where it is the correct home: it owns who writes the claim and
at which act, and `skills/next/SKILL.md` Step 6.2 goes on citing it for the activation value.

Each step carried a second citation of `### The claim field` one sentence later, for the
`Unclaimed`/absent-field branch. With the new citation directly above it that is the same pointer
twice in one paragraph, so both trailing duplicates went.

## Defect 2 — the filing rule named the identity helper bare

`260824-1538_*_the-filing-rule-names-the-identity-helper-with-no-root-no-guard-and-no-branch-for-its-absence.md`

`rules/fusion-workbench-conventions.md` `### Who filed it` now names
`"$FUSION_PLUGIN_ROOT/bin/fusion-identity"`, states the `[ -x ]` guard beside it, and adds a third
paragraph for the branch exit 127 falls into: **file with the person half absent as exit 4 does, and
report that attribution was dropped because the helper was missing.** It is deliberately neither of
the two codes it borrows from. The record shape is exit 4's and the reason is not, because exit 4
means no identity was owed while an absent helper means one was owed and could not be read; halting
is ruled out in the text, since an install one release behind would otherwise stop every filing in
the project.

`skills/next/SKILL.md` Step 6.1, the third disagreeing site in the defect's own table, gained the
same root while it was being edited for defect 1. `skills/setup/SKILL.md` Step 0i already carried
both root and guard and was not touched.

## Budgets

| Surface | Before | After | Head-room |
|---|---|---|---|
| `rules/fusion-workbench-conventions.md` | 59 412 | 60 162 | 1 181 free before, 431 after |
| `skills/next/SKILL.md` | 27 316 | 27 275 | `skills/` surface shrank |
| `skills/setup/SKILL.md` | 45 221 | 45 170 | `skills/` surface shrank |

No growth baseline was moved. The always-on core stands at 98 142 bytes against its 98 573 budget
(baseline 86 573 + 12 000 head-room).

## Gates

`hooks/lib/__tests__/reference-resolution-lint.test.ts` re-approved with a one-line accounting note:
paths 1319 -> 1318, anchors 186 -> 185, records unmoved. Every swap is one token out for one token
in; the two -1 paths and the one -1 anchor are the two removed duplicate citations, and the +1 path
is the bare `bin/fusion-identity` becoming two rooted spellings in the rule.

`hooks/lib/__tests__/fixtures/rules-emission.golden` regenerated with `UPDATE_RULES_GOLDEN=1`. The
diff is one file at +750 bytes across all fifteen agents. Regenerating records the growth; it moves
no baseline, and the hard universal-core bound in that file passed.

## Verification

`cd hooks && npm test` — exit 1. One failure,
`hooks/lib/__tests__/fixtures/surface-growth.golden`, stale on the two skill bodies' byte counts.
That file is out of scope by dispatch and the user regenerates it. 731 of 732 tests pass.
