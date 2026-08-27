The open-record exclusion says "any marker above" and counts no deferred record

---
`skills/archive/SKILL.md:116` excludes a terminal Circle "whose own issue, plan or decision store holds any marker above (`_o_`/`_p_` issue or plan, `_o_`/`_a_` decision)". The bullets above include `_d_` defects, plans and backlog entries, which filter 2 protects in the shared store because a deferred idea "can come back". `open_in()` at `:187` counts `_[op]_` and `_[oa]_` only, so a `_d_` defect inside a terminal Circle moves with the directory, which is exactly what the same filter forbids one bullet up. Either the parenthetical is the rule and "any marker above" overstates it, or `_d_` joins the count.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>
**Cross-references:** `shared/issues/260827-1741_*_tier-1-archives-a-terminal-circle-as-one-directory-and-never-reads-the-open-issues-inside-it.md` (its proposed line names `_o_`/`_p_` and `_o_`/`_a_` only); commit `d1489cc`

## Fix direction

Decide which: a `_d_` record inside a terminal Circle is frozen with the Circle (then `:116` reads "holds an `_o_`/`_p_` issue or plan or an `_o_`/`_a_` decision" and nothing more), or it is live (then `open_in()` reads `_[opd]_` for issues and plans and the Circle is excluded). The first is the record's proposal; the second is what filter 2's own `_d_` bullet implies.

## Acceptance

`:116` and `open_in()` name the same marker set, and a `_d_` issue inside a `_c_` Circle behaves the way the chosen sentence says.
