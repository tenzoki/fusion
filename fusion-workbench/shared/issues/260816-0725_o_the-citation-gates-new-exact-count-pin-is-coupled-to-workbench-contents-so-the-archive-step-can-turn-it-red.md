The citation gate's new exact count pin is coupled to workbench contents, so the archive step can turn it red
---
`68d6838` replaced the reference lint's three floors with an exact-equality `BASELINE`. One of the three
classes counts citations that resolve **against the workbench**, and the workbench is rewritten by
`/fusion:cleanup`'s archive step in the ordinary course of a session.
---
**Severity:** Medium — the pin is the right mechanism and the failure it produces is loud, not silent. What
is unbudgeted is that a *housekeeping* step, not a text edit, can produce it, and the failure text tells the
reader to re-approve the baseline, which is the correct response for a text edit and the wrong one here.
**Domain:** code
**Filed by:** coderev, session `260816-0713`, reviewing range `3a0408a..f77633f`
**Owner:** coder
**Affects:** `hooks/lib/__tests__/reference-resolution-lint.test.ts` (`BASELINE`, `BASELINE_MESSAGE`),
`hooks/lib/__tests__/helpers/citation-scan.ts` (`findRecord`), `skills/archive/SKILL.md`

## What is verified

- `BASELINE = { paths: 1122, anchors: 139, records: 95 }` and the assertion is `toEqual`, not a floor.
- `records` is the class of workbench-record citations, counted only when `WORKBENCH_PRESENT`; without a
  workbench the test substitutes the baseline, so that arm is vacuous rather than failing.
- `findRecord` matches a `shared/`-prefixed citation with
  `e.relDir.startsWith("shared/" + store)` — an exact store-path prefix, not a search.
- `workbenchIndex()` walks the whole workbench recursively, `archive/` included.
- Shipped text carries `shared/`-prefixed citations: `CLAUDE.md` names
  `fusion-workbench/shared/issues/260810-0326_*_…` and `fusion-workbench/shared/issues/260717-0030_*_…`,
  both to records eligible for archiving.

## What is inferred, and not measured

Moving such a record from `shared/issues/` into `archive/…` makes its `relDir` stop starting with
`shared/issues`, so the citation should both (a) be reported dangling by the existing check and (b) drop
`records` below 95 and fail the new pin. I did **not** run the archive step to confirm this; it is read off
the two code paths above.

If it holds, this session's own `/fusion:cleanup` can turn `npm test` red for a reason that is not a text
edit — and `BASELINE_MESSAGE` will tell whoever meets it to write the new number in, which would bake an
unresolved citation into the pin.

## Fix directions

Settle whether an archived record still satisfies a `shared/`-prefixed citation (arguably it should — the
record did not stop existing), or exclude `archive/` from `workbenchIndex()` and treat the dangle as real.
Either way `BASELINE_MESSAGE` should name this third cause beside its two.

## Related

- `shared/decisions/260816-0711_*_is-count-pinning-the-convention-for-every-gate-that-reports-what-it-examined.md`
- `shared/issues/260812-1720_*_the-reference-resolution-lint-does-not-scan-the-workbench-where-citations-are-densest.md`

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `hooks/lib/__tests__/helpers/citation-scan.ts:148-158` still walks the whole workbench with no archive exclusion and still requires an exact shared-store prefix. The baseline at `reference-resolution-lint.test.ts:536` moved from 1122/139/95 to 1120/139/94, so the pin was re-approved rather than decoupled. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.

---
**Reconciliation 260819-1400** (reconciler, domain `code`, HEAD `e435f03`; log
`shared/history/260819-1400-reconciliation-shared-issues.md`). Reproduces, and the event it predicted
has now happened once without tripping the gate. The mechanism is unchanged:
`hooks/lib/__tests__/helpers/citation-scan.ts` still carries no `archive` exclusion (`grep -n archive`
empty) and `findRecord` still requires `e.relDir.startsWith("shared/" + store)`, so a record moved into
`archive/` stops resolving. `BASELINE` has moved again since filing, to
`{ paths: 1178, anchors: 155, records: 102 }` (`reference-resolution-lint.test.ts:702`).

**What is new is that the archive step fired.** `e59dea2` (260817-1912) moved records out of
`shared/issues/` into `archive/260817-1907-safe-cleanup-scoped/shared/issues/`, which is precisely the
housekeeping-turns-the-suite-red scenario this record describes. It did not turn red, and the reason is
narrow rather than reassuring: the one surviving citation to a moved record sits in
`shared/decisions/260811-1146_i_*.md:7`, a workbench record, and the lint's scanned surface stops at
`rules/`, `agents/`, `docs/`, `templates/`, `skills/*/SKILL.md`, the READMEs, `CLAUDE.md`, `bin/` and
`hooks/lib`. Had that same citation been written into any shipped surface, the archive pass alone would
have moved the count and failed `npm test` with no text edit behind it.

So the coupling is confirmed by a real trigger, and the gap between "did not fire" and "cannot fire" is
one citation's location. That raises the confidence in the record rather than lowering its urgency, and
it pairs with `260812-1720_*_the-reference-resolution-lint-does-not-scan-the-workbench-where-citations-are-densest.md`:
the corpus that shields the gate here is the same corpus no gate reads. Marker stays open.
