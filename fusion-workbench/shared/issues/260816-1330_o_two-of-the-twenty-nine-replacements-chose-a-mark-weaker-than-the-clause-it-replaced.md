Two of the twenty-nine replacements chose a mark weaker than the clause it replaced

---
Commit `6049d3e` made 29 replacements in `rules/user-facing-output.md` and preserved the token stream exactly. Two of the 29 changed how strongly the clause binds, in a file where that is the whole content.

**`:112`, the locked phrasing.** Before: "an explicit unit — `min`, `h`, or `day`." After: "an explicit unit (`min`, `h`, or `day`)." The em-dash introduced an appositive, which restates the noun and is definitional: the unit *is* one of those three. Parentheses are conventionally removable, so the list now reads as illustration. The clause it sits in is the one that says "The phrasing is locked", and it is the only place the closed set of units is written down. A colon preserves the appositive force and is on the file's own list of four permitted replacements at `:130`.

**`:121`, the exemplar boundary.** Before: "After: `Bundle A: 6 steps` — followed, only if the user asked, by a separate trailing line …". After: "After: `Bundle A: 6 steps`, followed, only if the user asked, by a separate trailing line …". The em-dash marked where the exemplar ended and the commentary began. The comma that replaced it now sits in a run of four commas on one line, and a reader can carry the commentary into the exemplar. This is the demonstration block of the section it demonstrates.

---
**Found by:** coderev, review of `b18a8cf..6049d3e`, review file `shared/reviews/260816-1330-coderev-repunctuation-and-gate-contract.md`.
**Owner:** `coder`. Both are one-character changes of the same class the original pass performed, and neither touches a word.
**Severity:** Low. `:112` is the substantive one: it is the single site in the change where the logical force of a clause moved, and it moved on the clause that says its own phrasing may not move.
**Filed in the shared store** per the Origin Rule: no Circle is active.
**Cross-references:** `shared/issues/260816-0740_o_the-always-on-rule-corpus-runs-at-sixteen-times-the-em-dash-ceiling-it-states.md` (the parent register defect); `shared/issues/260816-1330_o_the-repunctuation-replaced-three-em-dashes-with-three-vague-pronoun-openers-the-same-blacklist-bans.md` (the other mark-choice finding from the same pass).

**Verified at HEAD `6049d3e`** by reading `rules/user-facing-output.md:112` and `:121` against `git show 52b8665:rules/user-facing-output.md`.

**Proposed marks.** `:112` takes a colon: "and an explicit unit: `min`, `h`, or `day`." `:121` takes parentheses: "After: `Bundle A: 6 steps` (followed, only if the user asked, by a separate trailing line `estimated effort (ai-based): about 45 min`)." Both are on the prescribed list, neither restores an em-dash, and neither changes a word.

**The other 27 hold.** Every remaining replacement is a comma, a colon, parentheses or a sentence split where the subordination it carried is recoverable from the juxtaposition. The three sentence splits that create a pronoun opener are filed separately; they are a register fault, not a force change.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `rules/user-facing-output.md:112` and `:121` both still carry the weaker mark; neither one-character correction landed. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.

---
**Reconciliation 260821-0412** (reconciler, domain `code`, HEAD `247abfe`; log `circles/260820-2051-style-rules-arrive-and-get-measured/history/260821-0416-reconciliation.md`).
**STAYS `_o_`. Both one-character corrections are still unmade, and both line numbers have moved.**

- `rules/user-facing-output.md:122` (filed as `:112`) — "and an explicit unit (`min`, `h`, or
  `day`)." The parentheses still read as illustration on the clause that says its own phrasing is
  locked. The record's proposed mark is a colon.
- `:131` (filed as `:121`) — "After: `Bundle A: 6 steps`, followed, only if the user asked, by a
  separate trailing line …". The comma still sits in a run of four on one line. The record's
  proposed mark is a parenthesis pair.

`circles/260820-2051-style-rules-arrive-and-get-measured` did not touch this file's marks. Its own
review gate R1 asked exactly this question of the four files it did repair and answered it: mark
strength held at 152 of 155 sites. The two sites here are from the earlier pass and were not in
scope. Both proposed marks are on the four-mark list at `:140` and neither changes a word.
