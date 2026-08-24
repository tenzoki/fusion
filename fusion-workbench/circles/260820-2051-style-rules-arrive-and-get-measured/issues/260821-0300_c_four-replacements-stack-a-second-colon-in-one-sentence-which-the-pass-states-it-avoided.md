Four replacements stack a second colon in one sentence, which the pass states it avoided

---

`c226949`'s record gives the reason 11 replacements took a full stop rather than a colon: "where a
colon would have been the second colon in one clause". Three replacements in that commit and one in
its sibling do exactly that instead.

| Site | The sentence, with both colons |
|---|---|
| `rules/fusion-workbench-conventions.md:84` | `…records what /fusion:setup copied into the workbench: one line per asset in the shape shasum -a 256 prints: the checksum taken at the moment of copying, then the asset's path…` |
| `rules/fusion-workbench-conventions.md:343` | `[ and ] are shell-glob metacharacters: a marker written in bracket form … and under bash fails silently: the unmatched pattern expands to itself…` |
| `rules/critical-stance.md:34` | `…"simplest solution, no premature abstractions" lines: simplest does not mean fastest to type: it means the cleanest integral design…` |
| `rules/agent-setup.md:40` | `…(full table in … → Exit codes): **exit 3**: .active-circle is orphaned or corrupt;` |

In each the first colon was already there and the second replaced an em-dash. `:84` and `:34` are
the clearest: the second colon governs a clause the first colon's own clause is still open over, so
the reader has to decide which colon the tail belongs to. `:343` is one 90-word sentence with two
colons and a parenthesis. `:40` puts two colons four words apart.

**Why this is filed against a stated rule rather than as taste.** The pass wrote the rule down and
counted 11 sites where it applied it. Four sites where the same condition holds took the colon
anyway, and the record's replacement table does not distinguish them. A reader taking that table as
the pass's method will not reproduce these four.

---
**Found by:** coderev, review gate R1 of `circles/260820-2051-style-rules-arrive-and-get-measured`,
review file `circles/260820-2051-style-rules-arrive-and-get-measured/reviews/260821-0257-coderev-turn-2-the-repunctuation-and-the-repaired-step-0e.md`.
**Owner:** `coder`. Each is a one-character change plus, at three of the four, one capital.
**Severity:** Low. Nothing is ambiguous to the point of being wrong. The cost is legibility on
always-on text, on the same surface whose legibility is the Circle's subject.
**Filed in the Circle store** per the Origin Rule.
**Cross-references:**
`circles/260820-2051-style-rules-arrive-and-get-measured/history/260821-0242-coder-the-conventions-file-reaches-its-em-dash-ceiling.md`
("What each mark became", the Full stop row);
`circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0301_*_the-decision-marker-table-loses-its-parallelism-at-one-of-five-rows.md`
(the same choice made the other way, with its own cost).

**Verified at HEAD `c226949`** by extracting every sentence-level unit carrying two or more colons
from each file before and after its repunctuating commit and taking the set difference. These four
are the only newly created ones across the four files. `rules/fusion-workbench-conventions.md:129`
and `rules/critical-stance.md:57` and `:67` also gained a colon in a paragraph that already had one,
but in a different sentence each time, and are not part of this finding.

**The fix.** `:84`, `:343` and `:34` take a full stop and a capital, which is what the pass did at
its other 11 split sites and costs no word. `:40` takes a full stop after `Exit codes)`, or nothing,
since the reading is not actually at risk there and the site was listed for completeness.

---
Resolved: fixed — full stop and capital at the asset-provenance sentence (rules/fusion-workbench-conventions.md:87), the marker-globs sentence (rules/fusion-workbench-conventions.md:348) and the simplest-solution line (rules/critical-stance.md:42); the agent-setup site left as is
