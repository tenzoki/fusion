# A decision record's cross-reference points at an `_a_circle.md` that activation renamed

---

The cleanup-gate decision cites this Circle's own record at the address named under **Affects:**
below, by the `_a_circle.md` name it carried before activation. The Circle was activated in the
same range and the record is now `_t_circle.md`, so the citation resolves to nothing.

---

**Severity:** Low — one dangling citation in one record; the target is unambiguous.
**Domain:** code
**Filed by:** `coderev`, reviewing `9a7da8e..7c12d6a` (`260815-0804-coderev-plane-mirror-removal.md`)
**Owner:** `coder`
**Affects:** `260815-0007_*_does-fusion-cleanup-block-at-the-claude-md-gate-or-leave-the-ledger.md:7`

**Verified 2026-08-15 at HEAD `7c12d6a`.** The Circle directory holds `_t_circle.md` and no
`_a_circle.md`.

## The line

> **Cross-references:** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/_a_circle.md`
> § Grounding snapshot → The administrative surface; …

The record was filed by `shaper` in anticipated-circle mode, when `_a_circle.md` was the correct
name, and the orchestrator's `_a_`→`_t_` activation renamed the file underneath it.

## Not the same as the shaper's history entry

`260815-0007-shaper-remove-eight-mechanisms-and-cap-growth.md:83` also names `_a_circle.md`,
in its `## Files written` list. That one is correct and must not be edited: it is a statement about
what that run wrote, at the name it wrote it under, and it stays true. The distinction is the one
step 2 drew for the two test comments that keep the word "Plane" — a historical statement survives
its subject, a live pointer does not.

## Why the marker-on-the-record design does not prevent this

`rules/circle-records.md:30` argues the marker sits on the record rather than the directory precisely
so *"every reference into a Circle … stays valid for the Circle's whole life."* That guarantee covers
references **into** the directory. It does not cover a reference **to the record file itself**, which
is the one path in a Circle that changes at every transition. Nothing in the rule says which form a
citation should take.

## What the fix has to establish

Re-point the line to `_t_circle.md`, or to the directory plus the section name, which survives every
further transition. The second is the durable form and is what a subsequent `_t_`→`_c_` rename will
otherwise break again in a few Turns. Whether the citation convention for a Circle record should say
so belongs in `rules/circle-records.md` and is a decision, not this fix.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). Worse than filed: the citation is now two renames stale, not one.**

`260815-0007_*_does-fusion-cleanup-block-…:7` still cites `circles/260815-0007-…/_a_circle.md`. The Circle record is `_c_circle.md` at HEAD, so the citation names a marker two transitions behind (`_a_` → `_t_` → `_c_`), and the citing record itself moved `_a_` → `_i_` since filing.

This is the decision-store half of a class with three live carriers in this store (with `260815-1247_*_the-implemented-decision-records-two-cross-references-…` and, until this pass closed it as moot, the backlog `**Related:**` line). **The correct form is the wildcard**, `_*_circle.md` — `rules/circle-records.md` states both correct globs and `rules/fusion-workbench-conventions.md` `## Marker globs` explains why the underscore makes it safe. No gate reads workbench-to-workbench citations, which is why every instance of this class is found by hand.

---
Resolved: fixed — the citation at line 7 of the cleanup-gate decision record now takes the wildcard form _*_circle.md, which resolves at the Circle's current _c_ marker and after any later transition; cd hooks && npx vitest run lib/__tests__/workbench-citation-lint.test.ts
