Archive's marker cut cites a list of markerless kinds that does not carry the forum entry

---

`skills/archive/SKILL.md` `## Marker vocabulary` now reads "Authored in `rules/fusion-workbench-conventions.md` `## State Markers — issues and planning` and `## State Markers — decisions`, and `rules/circle-records.md` `## State Markers — circles`; the markerless kinds are enumerated there too." The only one of those three sections that enumerates them is `## State Markers — issues and planning`, whose last line reads "History, review, analysis, investigation, consultation, memo, and cadence files do NOT carry state markers." The table the cut replaced listed "History, review, analysis, investigation, consultation, memo, forum entry". The forum entry left the list and the backlog entry was never in either.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

The terminal-state half of the cut is correct and was verified: `_c_`/`_b_`/`_s_`/`_d_` for a Circle, `_c_` alone for a defect or spec/plan, `_i_` and `_s_` for a decision all match the cited sections, and "terminal is not archive-class: `_d_` is terminal in two of the three" is a sharper statement than the table's "in both the Circle and the defect vocabularies". The defect is one member of one list.

Archive's behaviour does not depend on the citation, which is why this is not higher. Its own tier table states the fact locally — "`$SCAN_FORUM` | `*.md` whose `YYMMDD` filename prefix is older than the threshold | a message is read once and soon and **carries no marker**, so age is the only signal that can select it" — so the age-based tier-1 bucket rests on a claim archive still makes for itself.

Two ways to close it, and they are not equivalent. Adding "forum entry" and "backlog entry" to the conventions line makes the citation true and costs a rule file a few bytes, which the Circle's Directive forbade during the cut and does not forbid afterwards. Alternatively `rules/fusion-workbench-conventions.md` `## Filename Patterns` already answers per kind in its fourth column — the `Forum entry` row reads `no` — so archive could cite that heading for the markerless half instead of the State Markers sections. The second is free and points at the enumeration that is actually complete.

Worth noting for whoever takes it: the same conventions line is also the authority for the backlog entry, which does carry markers (`_o_`/`_p_`), so the line is a list of markerless kinds and not a partition. Do not add the backlog entry to it.

**Acceptance test:** the section `skills/archive/SKILL.md` `## Marker vocabulary` cites a heading that actually enumerates every markerless kind archive can meet, the forum entry included, and the enumeration is in one place.
