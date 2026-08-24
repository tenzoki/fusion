A bare stamp citation is ambiguous when two records share it, and one Turn log resolves to the wrong record

---

Records are routinely cited by their `YYMMDD-HHMM` stamp alone. The stamp is not unique: two records
can be filed in the same minute in the same store, and then a bare-stamp citation names both.

---

**The measured instance.** `circles/260816-1741-guard-becomes-observation-only/issues/` holds two
records at stamp `260817-1417` — one closed, one open. That Circle's `_b_circle.md` `## Turn log`,
Turn 3, cites the bare stamp. A reader following it lands on the closed one and concludes the point is
settled; the open one is the live obligation.

This is worse than an unresolvable citation, which announces itself. A citation that resolves to the
wrong record of the right shape reads as correct.

**Severity:** Low as measured — one instance found across eleven Circle records. The class is not low:
collisions become likelier as stores grow, and the failure mode is silent misdirection rather than a
dangling pointer.

**Scope:** the citation grammar in `rules/fusion-workbench-conventions.md`, and
`hooks/lib/__tests__/helpers/citation-scan.ts` if the grammar is to be enforced. The obvious remedies
are a stamp plus a slug fragment, or a rule that a citation carries the marker wildcard form
`YYMMDD-HHMM_*_<slug>` already used in `$PORTFOLIO`. Neither is chosen here.

Found by the Circle-store reconciliation of session `260818-2301`, which could not file it at the time:
its write scope was `circles/*/` and a sibling reconciler held `shared/issues/`.

---
Resolved: fixed — `rules/fusion-workbench-conventions.md` `## Filename Patterns` now states that a bare stamp is not a citation, and the Turn-log instance sits in a terminal record and stays; `grep -n "A bare stamp is not a citation" rules/fusion-workbench-conventions.md` at HEAD 260824 prints line 291.
