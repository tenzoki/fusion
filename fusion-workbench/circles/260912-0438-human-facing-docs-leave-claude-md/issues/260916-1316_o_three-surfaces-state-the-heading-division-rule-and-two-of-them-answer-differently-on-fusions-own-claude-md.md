Three surfaces state the heading-division rule, and two of them answer differently on fusion's own `CLAUDE.md`

---
The passage is the unit everything in this work is judged on, and `rules/context-lean-claude-md.md`
`### Step 1 — divide the file by heading, before judging anything` (line 146) says why it is fixed
first: *"Two readers who divide a file differently are not disagreeing about the criterion; they are
answering different questions, and their two answers cannot be compared at all."* Three shipped
surfaces now state how to divide, in three different terms.

**1. The rule** (`rules/context-lean-claude-md.md:148`):

> Split the file at its headings. Use `## ` where that is the file's top heading level, `### ` where
> the file's headings start one level deeper: pick the file's top level once, and use that one level
> for the whole file.

It offers two levels and no third, and it does not say what a `# ` document title is. fusion's own
`CLAUDE.md` opens with `# CLAUDE.md — fusion plugin source`, so its top heading level is `#` and
neither of the rule's two branches names it — while both worked examples further down that same
section are *taken from that file*.

**2. The helper** (`bin/fusion-claude-md-weight`, lines 81-87 and 164-170):

> By ONE heading level, picked once for the whole file: the shallowest level with at least two
> headings, falling back to the shallowest present where no level has two. That is what skips a
> document title — an H1 that appears once — without naming it as a special case.

A different algorithm, and the header claims at line 88-91 that the unit it produces is *"the unit
`rules/context-lean-claude-md.md` `### Step 1 …` fixes"*. On a file with one `## ` heading and three
`### ` ones the two answer differently outright: the rule says "the file's top level", which is `##`;
the helper takes the shallowest level with **two** headings, which is `###`. Run against a scratch
file of that shape the helper prints `heading-level=3`.

**3. The curator** (`agents/curator.md:287`): *"One line per top-level heading of the surface a
passage is leaving"* — a third spelling, with no pointer to either of the other two.

The consequence is the one Step 1 names: the helper reports weight per section, the curator
classifies per section, and a human applies the criterion per section, and the three may not be
looking at the same sections.

**Acceptance test:** one statement of the division rule covers a file whose top heading is a single
`#`, the helper's header cites it without restating a different algorithm, and `agents/curator.md`
names the same unit rather than "top-level heading".

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
Cross-references: `260916-1157_*_nothing-tells-the-curator-where-the-placement-criterion-is-authored.md` (the curator's route to the rule; this is what the rule says once reached).
