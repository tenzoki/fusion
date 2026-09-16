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
