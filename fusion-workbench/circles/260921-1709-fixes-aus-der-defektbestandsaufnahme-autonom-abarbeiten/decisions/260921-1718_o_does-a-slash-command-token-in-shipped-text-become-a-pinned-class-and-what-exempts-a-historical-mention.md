# Does a slash-command token in shipped text become a pinned class, and what exempts a historical mention?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260916-2145_*_a-gates-remediation-text-names-two-commands-that-do-not-exist-and-no-gate-resolves-a-command-token.md (the defect this answers, its gate half), 260916-2144_*_the-holder-naming-section-documents-a-command-a-consumer-and-a-field-shape-that-are-all-gone.md (the other live pointer), 260921-1653-open-defect-survey-at-11-9-1.md (row 32), 260921-1709-fixes-aus-der-defektbestandsaufnahme-autonom-abarbeiten.md

---

## Question

`hooks/lib/__tests__/reference-resolution-lint.test.ts` resolves plugin paths, heading anchors and record citations over the shipped text and nothing else; a `/fusion:<name>` token is "a command token of no pinned class", its own log says so six times. Two skill bodies were deleted at v11 and two live pointers to them survived because nothing reads the class. Measured at HEAD over `rules agents skills bin hooks docs templates *.md install.sh`: the fourteen live names under `skills/`, and six names matching no directory, of which the two live pointers are being repaired in this package and four are historical mentions (`agents/shaper.md` names `/fusion:direct` as removed; `rules/fusion-workbench-conventions.md` and `hooks/lib/citation-corpus.ts` name `/fusion:migrate-workbench-v2` as retired; two test files quote past commit subjects, outside the scanned surface anyway). Whether the class is pinned, and in what form a historical mention stays green, binds every future skill deletion, so it is a record.

## Options

1. **Pin the class, with an enumerated set of retired names.** Every `/fusion:<name>` token on the lint's existing surface (the Markdown surfaces and the `bin/` and `install.sh` comment lines; the `hooks/` TypeScript comment lines stay records-only as they are) must name a directory under `skills/`, or be in `RETIRED_COMMANDS`, a map of name to the commit that removed it. A guard case asserts every entry in the map names no directory, so the enumeration cannot go stale in the other direction (the shape `EXAMPLE_PATHS` and `RECORD_EXAMPLE_FILES` already use). No count is pinned: the check is existence, like class (a), so no `BASELINE` re-approval is owed.
   - Pros: deleting a skill turns the gate red on every live pointer, which is the defect's acceptance; the exemption is decidable from the token's text plus a list somebody edits knowingly, with a guard against dead entries; a dozen lines on the test surface.
   - Cons: a historical mention of a command not yet in the map fails the gate until the map gains it, which is the strict-failure direction this project prefers; a name mentioned in prose without the `/fusion:` prefix (a bare `next`) is not a token and is not read, the same bound the record's own pin log names.
2. **Do not pin; state in the lint's header that a command token is unchecked**, and repair the two live pointers by hand.
   - Pros: no test lines on a surface at 14.
   - Cons: the next deletion leaves the next pointer, which the two measured instances show is the ordinary outcome, not the exception.
3. **Pin the class and exempt any mention carrying the word "removed", "retired" or "deleted" within the clause.** Reads intent from context.
   - Cons: the undecidable shape `rules/critical-stance.md` §4 forbids; the same argument that rejected a wider placeholder list in `260830-2235_*`.

## Constraints

- The scanned surface for this class is the one the lint already walks; the test bodies stay outside it (the record's own instance sits in one and is repaired by hand).
- A historical mention that names its removal stays green without being rewritten.
- The hook-test surface is bounded; the case's lines are funded in the same package.

## Recommendation

Option 1. The two other pinned existence classes already take exactly this shape, an enumerated exemption with a reason per entry and a guard that the entries are load-bearing, so the class arrives with no new mechanism. The map's first entries are the four historical names measured above plus the two this package repairs, each with the removing commit.

---
Working answer (plan 260921-1726): option 1 — a pinned existence class (d) in `hooks/lib/__tests__/reference-resolution-lint.test.ts` over the lint's Markdown surfaces and the `bin/` and `install.sh` comment lines, with `RETIRED_COMMANDS` enumerated and guarded twice (no key names a directory; every key is still cited on the class's lines), so the map seeds with the two names the surface cites rather than the six this record's recommendation lists, the load-bearing guard the same recommendation asks for deciding it; implemented in the commit that carries this line.
