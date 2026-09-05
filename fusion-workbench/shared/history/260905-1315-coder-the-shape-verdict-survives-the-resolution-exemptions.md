# The shape verdict survives the resolution exemptions

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Domain:** code

---

## What was dispatched

Repair `260905-1228_*_the-record-example-exemption-silences-a-verdict-that-does-not-depend-on-resolution.md`: a whole-file exemption granted on an argument about resolution was also silencing `store-prefixed`, which is decided from a token's shape before any lookup, so the one file whose job is to teach the citation form was the file where a wrong form could not be detected. The record named three routes and required that both the file exemption and the fenced-code exemption be decided together.

## What changed

**The record's own line 11, first, because it was blocking two gates.** It spelled `analyses/…-vector-store-comparative.md` inline while making a statement about that citation, and `workbench-citation-lint.test.ts` and `citation-sweep.test.ts` both failed on it and on nothing else. Rewritten in the prose form the conventions prescribe: it names the file and the heading, says the segment in words, and is in the past tense because the sibling repair had already removed the token from `rules/decision-record-examples.md`. The finding is kept — it is now stated as what the hole hid, not as what the file still carries.

**`hooks/lib/citation-scan.ts`.** Two new exported constants and one new private set:

- `SHAPE_DECIDED_KINDS` = `record`, `circle-record`, `circle-dir` — the three whose `check()` reads nothing off disk.
- `RESOLUTION_PREMISED_EXEMPTIONS` = `record-example-file`, `fenced-code` — the two whose premise is "do not look this token up".
- `RETIRED_LAYOUT_FILES` = `skills/migrate/SKILL.md`, split out of `RECORD_EXAMPLE_FILES` because its premise is different in kind: the store segment is what that skill converts, and a gate telling it to drop the segment would be telling it to stop describing the migration. `CLAUDE.md` already states that licence.

A token of a shape-decided kind under one of the two resolution-premised exemptions is now judged **and keeps its exemption reason**. The two facts answer different questions: the status says the spelling is one the project retired, the reason says nobody may rewrite it in place.

**`hooks/citation-sweep.ts`.** `rewriteOf()` now refuses on `hit.reason`, not on `hit.status === "exempt"`. That is what keeps the sweep off a verbatim exhibit whose whole content is a wrong spelling somebody filed on purpose.

**`rules/decision-record-examples.md`.** The two store-prefixed prose citations at the head of Examples 1 and 2 are rewritten to the storeless basename with the store named in words (-11 bytes). The file's fabricated basenames stay exempt, which is what the exemption is legitimately for.

**Tests.** `fenced-code-exemption.test.ts` gains three cases and a storeless `DEAD` fixture (its old fixture was store-prefixed, which is why three of its cases went red on the first cut); `workbench-citation-lint.test.ts`'s failure message gains the one verdict the fence does not cover, and the remedy for it.

## Why route 3, against the other two

**Route 1 (the fence yields outright) was rejected on measurement.** The sweep shares this grammar and walks the whole workbench, `archive/` included. With the fence un-silenced for the shape verdict and nothing holding the rewriter off, `bin/fusion-citation-sweep --dry-run` went from `files=0 rewrites=0` to `files=64 rewrites=370` — most of it archived records and fenced exhibits. Rewriting those deletes the findings, and `citation-sweep.test.ts` is a release gate that reads `rewrites=0` over this repository's committed workbench.

**Route 2 (the teaching example leaves the fence) was rejected for two reasons.** The worked examples are decision-record bodies: un-fenced, their own `---` and headings render as the rule file's structure, which is a cost to the reader and not a technicality. And it fixes one file while the next teaching file with a fenced example reopens the hole.

**Route 3 is what landed**, in the record's own words — the store-prefix check runs on a pass no file-level exemption gates, while the exemptions go on governing what may be written.

## What it cost, measured before it was written

Over the shipped markdown surface the only store-shaped exempt tokens were six: four in `skills/migrate/SKILL.md` (now `retired-layout-file`, unchanged in effect) and two in `rules/decision-record-examples.md` (repaired). Over the live workbench corpus there were none under either narrowed exemption — 29 `glob` and 1 `blockquote`, both of which keep full cover, because their premise is that the token is not this file's own spelling of a citation at all.

**The residual, stated rather than left to be found.** The same argument reaches `announced-illustration`, `footer-template` and `fabricated-name`. Each measures zero store-shaped tokens over both corpora today, each has fixtures that would have to be rewritten to decide it, and the record names none of them. They were left alone and the residual is written into `SHAPE_DECIDED_KINDS`.

## Verification

`cd hooks && npm test` — exit 1, 827 of 828 passing. The one failure is `rules-emission-golden.test.ts`, which was already red at the start of this task from the sibling dispatch's edit to `rules/fusion-workbench-conventions.md` (52 613 -> 54 973) and was left for the committing step. This task adds -11 bytes on `decision-record-examples.md` to that same stale golden, so the golden is stale for two reasons now and both are named. `fixtures/surface-growth.golden` was regenerated in this edit, which moves no baseline; the hook-test surface stands at 20 245 lines against its 20 375 budget.

The acceptance was also run against the real file rather than only asserted in a fixture: re-introducing the exact token this record was filed about, inside Example 1's fence, turns `npm test` red and names it at `rules/decision-record-examples.md:55`; reverted afterwards.
