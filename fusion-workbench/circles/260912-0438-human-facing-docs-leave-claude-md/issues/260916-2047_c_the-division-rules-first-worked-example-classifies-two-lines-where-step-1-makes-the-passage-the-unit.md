The division rule's first worked example classifies two lines, where Step 1 makes the passage the unit

---
`rules/context-lean-claude-md.md` `### Step 1 — divide the file by heading, before judging anything`
fixes the unit before anything is judged, and `611658de` made that unit explicit: one heading level
picked once for the whole file, plus whatever stands above the first heading of that level as a
passage of its own, so the passages sum to the file with nothing left over.

The section's own first worked example does not use that unit. It classifies
`CLAUDE.md`'s two language declarations — `**Language:** de` and `**Artifact language:** en` — as the
thing that stays. Under the division the same section states, `CLAUDE.md` divides at `## `, so those
two lines are not a passage: they sit inside the preamble, together with the identity paragraph and
the rest of the text above the first `## `. The example judges a fragment of a passage and calls the
result a classification.

The second example does not have the problem: the release procedure was a `## ` heading at the chosen
level, so it was a passage under any reading.

**Why this is worth fixing rather than reading past.** The whole argument for fixing the unit first is
that two readers who divide differently cannot compare their answers at all. A section that states
that argument and then demonstrates the criterion on something that is not one of its own units
teaches the reading it exists to prevent — and it is the example a first-time reader meets first.

Three ways out, and the choice is not made here:

1. Restate the example at the preamble's granularity: the preamble stays, and the language
   declarations are the reason it stays. Cheapest, and it keeps the example's evidence — the
   declarations really are read on every dispatch.
2. Keep the example on the two lines and say explicitly that a passage may stay for the sake of part
   of what it holds, which is a real property of the criterion and is currently unstated anywhere.
3. Pick a first example from a file where the thing that stays is a passage in its own right.

**Acceptance test:** both worked examples classify units the section's own Step 1 produces, or the
section states in so many words that a passage can be judged by part of its content and names which
part.

---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

Found while bringing the second example up to date under
`260916-1732_*_the-division-rules-worked-example-describes-a-claude-md-section-that-has-since-moved.md`,
whose acceptance test covers currency and not the unit. Reported rather than folded into that fix,
because the answer changes what the section teaches rather than what it reports.

---
Resolved: this record's option 1 taken together with the property its option 2 names, as one change,
because neither is complete alone. Raising the example to the preamble without stating the property
leaves a reader asking how a passage stays for the sake of two lines inside it; stating the property
without the example is an abstraction with nothing under it.

`### Step 2` now says that a passage is judged whole and the question is answered yes when **any**
part of it is needed every session, so a passage can stay on the strength of a couple of lines and
everything else it holds stays with them. It says in the same place what that costs and why the cost
is accepted: a passage that stays carries text no session needs, and the cut that would save those
bytes is a cut below the passage, which is exactly what Step 1 fixed the unit to prevent. The
executor checked before writing that nothing in the section already said this — Step 1 asserts the
unit but says nothing about judging it on part of its content — so the record missed nothing.

The first example is now the preamble: measured at HEAD, `CLAUDE.md` carries one `#` and six `##`, so
it divides at `##`, and everything above the first one is seven lines and 414 bytes holding the
title, both language declarations and the identity paragraph. The declarations are 43 of those bytes,
which puts the new property in view rather than in the abstract — the passage stays for a tenth of
itself. The evidence was verified rather than taken: `bin/fusion-rules` reads both declarations out
of `CLAUDE.md` unconditionally at the start of every dispatch, above the emission of the chat profile
every agent receives.

The second example was checked against the same test and held. At `72911b86^` the file divided at
`##` as it does now, so the release procedure was a passage in its own right; one clause was added
making that visible instead of inferable.
