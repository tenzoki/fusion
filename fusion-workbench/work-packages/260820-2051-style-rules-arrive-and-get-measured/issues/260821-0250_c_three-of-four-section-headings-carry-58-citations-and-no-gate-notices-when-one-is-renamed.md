Three of four section headings carry 58 citations, and no gate notices when one is renamed

---
`rules/fusion-workbench-conventions.md` has four section headings that other files cite by their
exact spelling, 61 citations across 49 files. The coder repunctuating that file probed each heading
by breaking it and re-running the gates. **Only one is protected.** Changing the other three left
the suite green, and their 58 citations would have gone silently dead.

---

**Domain:** code
**Filed by:** orchestrator
**Cross-references:** `260821-0242-coder-the-conventions-file-reaches-its-em-dash-ceiling.md`

## How it surfaced

Step 12 of this Circle repunctuated that file. Four of the six marks it kept are inside those
headings, kept because 61 citations depend on the spelling. The coder did not stop at that reasoning:
it broke each of the four in turn and re-ran the gates to find out which were actually defended. One
was, caught by `reference-resolution-lint` through a citation in `agents/curator.md`. Three were not.

That is the difference between a belief about a safety net and a measurement of one, and it is the
kind of check this project's own rules ask for. It also means the marks were kept for a good reason
that turns out to be a better reason than the one given.

## Why the exposure is larger than this Circle

Nothing in this repository stops a future edit from renaming one of those three headings. The
citations do not resolve to a line, they resolve to a heading's text, and the gate that reads
anchors saw only one of the four. A rename would be a one-word edit with 58 dead pointers behind it
and a green suite.

This is the same class as
`260808-0030_*_line-number-citations-into-rule-files-go-stale-and-no-gate-reads-them.md`,
approached from the anchor side rather than the line-number side.

## Acceptance

- A rename of any of the four headings is caught by a gate, or the citation form used for them does
  not depend on the heading text.
- Which headings are load-bearing is derived rather than listed by hand, since a hand list is the
  thing that goes stale next.
- The measurement that produced this record is repeatable: breaking a heading and running the gates
  is cheap, and whatever is built should be checkable the same way.

---
Resolved: referred (decision) — shipped anchors are gated by `reference-resolution-lint`, and workbench anchors are the decision's corpus question; 260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md
