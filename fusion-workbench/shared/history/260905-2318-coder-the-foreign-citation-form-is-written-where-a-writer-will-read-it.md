# The foreign-record citation form is written where a writer will read it

**Date:** 2026-09-05 23:18
**Agent:** coder
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Status:** Complete
**Read at:** HEAD `4db7dddb`, two sibling coders holding `skills/setup/SKILL.md` and
`hooks/citation-sweep.ts` concurrently
**Cross-references:** `260905-2305-coder-a-foreign-record-citation-gets-a-form-that-expresses-it.md`
(the implementation this documents, and the authority for what the form does) ·
`260830-2254_*_a-record-citing-another-projects-workbench-record-is-reported-dangling-forever-and-no-citation-form-expresses-it.md`

## What landed

One edit, in `rules/fusion-workbench-conventions.md` `## Filename Patterns`, inside the
paragraph that already teaches citation form. Three sentences, placed after the
workbench-wide lookup sentence so that the "any of the three" it contains still names the
three local forms and is not silently made false.

The note states the form `foreign:<project>:<citation>` with both leading segments
literal and required, gives one filled-in example, says the qualifier is read before any
lookup so the token is reported neither dangling nor store-prefixed, and states the
honest limit: it is supplied by the writer and never inferred, nothing separates a
genuine foreign record from a local one mislabelled, so the form is the writer's claim
rather than something a gate checked.

Deliberately absent, per the dispatch: any account of how the exemption is implemented,
any second example, and the 214-token measurement that decided the second segment. Those
are in the sibling's history entry and in the source docstring, where a reader who needs
them is already standing.

## Cost against the always-on bound

**+491 bytes** (`rules/fusion-workbench-conventions.md`, 57 954 → 58 445).

Head-room left in the hard bound: **4 498 bytes** of `GROWTH_BUDGET = 12_000`. Derived,
not asserted: the bound sums the measured universal core (`agent-setup.md` 4 181,
`fusion-workbench-conventions.md` 58 445, `critical-stance.md` 10 374 = 73 000) against
the same files' `RULE_BASELINE` entries (3 513 + 52 027 + 9 958 = 65 498), leaving a
delta of 7 502. `holds the always-on rule set — what every agent loads — inside its
budget` passes.

No baseline number was edited. The golden fixture `lib/__tests__/fixtures/rules-emission.golden`
now mismatches by this session's two edits to this file together (+343 earlier, +491
here); it was left untouched, for the orchestrator to regenerate once for the batch.

## Verification

`cd hooks && npx vitest run lib/__tests__/rules-emission-golden.test.ts
lib/__tests__/workbench-citation-lint.test.ts` — **exit 1**, 24 passed, 1 failed. The one
failure is `matches the checked-in golden, agent by agent`, which is the anticipated
fixture mismatch above and nothing else; every other test in both files passes, the
budget test among them.

`npx vitest run lib/__tests__/workbench-citation-lint.test.ts` alone — exit 0. That is
the check worth naming separately: this file is inside the citation gate's own corpus,
the note is *about* citation form, and the filled-in example carries the new
`foreign:` qualifier. The gate read it and reported nothing, which is the first
end-to-end evidence that the exemption works on a live citation outside its own test
fixtures.

`bin/fusion-prose-metric` reads this file at 27 em-dashes over 7 808 prose words against
a permit of 7 — already over before this edit and unchanged by it, because the note adds
none. No em-dash was used where a semicolon or a colon carries the same clause.
