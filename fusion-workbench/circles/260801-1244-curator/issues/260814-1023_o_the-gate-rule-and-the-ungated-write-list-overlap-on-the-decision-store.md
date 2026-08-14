The curator's gate rule and its ungated-write list overlap on the decision store

---
`agents/curator.md` defines surface 1 as "Decision records — everything under `$SCAN_DECISIONS`,
all five markers", then states without qualification: "You never write to a surface before the user
has approved the entry at the gate." Its `## Scope` section then lists, under **You may write
without a gate**, "An open decision record at `$OUT_DECISION` for an unresolvable contradiction".
`$OUT_DECISION` resolves inside `$SCAN_DECISIONS` — verified: `bin/fusion-paths curator` emits
`OUT_DECISION=circles/260801-1244-curator/decisions` and
`SCAN_DECISIONS=circles/260801-1244-curator/decisions shared/decisions`. So the same file set is
covered by an absolute prohibition and by an exemption, and nothing in the prompt says which governs.

---
**What the author plainly meant** is that *creating* a new open record is ungated while *editing an
existing* record is gated. That reading is consistent with everything else in the file: the gated
list says "Decision records under `$SCAN_DECISIONS` — including the `Superseded by:` annotation and
the marker rename that goes with it", which are edits to records that already exist. But the
distinction is never written down, and the sentence a reader meets first is the unqualified one.

**Why it is worth a fix rather than a shrug.** The curator's single safety property is that nothing
reaches a normative surface without a user approving it, and this is the one place the property is
stated as absolute and then contradicted three sections later. `rules/critical-stance.md` §4 treats
an overlapping case split as a defect of the same kind as a wrong result, and this Circle's own plan
head answers a decidability question in that vocabulary. The practical exposure is small — an open
decision record is a question, not a binding position — which is why this is filed as a precision
defect rather than as a safety one.

**Fix direction, one clause on each side.** In the gate sentence: "You never write to an *existing*
statement on any of the three surfaces before the user has approved the entry at the gate." In
`## Scope`: "An open decision record **you create in this run** at `$OUT_DECISION`". With both, the
split is disjoint and the reading no longer depends on inferring the author's intent.

**Filed by:** coderev, reviewing `d7786eb..5b81f5a`. Circle store per the Origin Rule.
