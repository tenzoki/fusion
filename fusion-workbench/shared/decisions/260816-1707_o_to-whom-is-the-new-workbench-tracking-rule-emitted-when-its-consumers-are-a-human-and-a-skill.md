# To whom is the new workbench-tracking rule emitted, when its consumers are a human and a skill?

---
**Domain:** code
**Status:** open
**Filed by:** orchestrator (raised by the user's answer to `260816-0711`)
**Cross-references:** `shared/decisions/260816-0711_a_where-does-the-tracked-workbench-split-live-now-that-the-home-it-was-meant-to-move-to-is-gone.md` (the answer that raised this); `rules/fusion-workbench-conventions.md` `### Which of them a tracked workbench tracks` (the text being moved); `bin/fusion-rules`; `rules/workbench-path-resolution.md` and `rules/rule-file-provenance.md` (the two files emitted to no agent by design)

---

## Question

The user answered `260816-0711` with option 2: move the tracked-workbench subsection into its own
`rules/workbench-tracking.md` and leave a pointer in the conventions file. That record names one
condition on option 2 which the answer does not settle, and which blocks the move rather than
following it: **the derived audience has to be derivable.**

`bin/fusion-rules` serves agents only and exits 2 on any other name. The two parties that actually
apply this rule are a human writing a project's `.gitignore`, who reads a file rather than
receiving an emission, and the archive step of `/fusion:cleanup`, which is a skill and therefore
outside the helper's namespace. No executor agent applies it at all.

So the move as approved has no obvious emission target, and the record's own constraint says a
third file emitted to nobody needs a positive reason rather than an inherited pattern.

## Options

1. **Emitted to no agent, reached by citation.** The same shape as `rules/workbench-path-resolution.md`
   and `rules/rule-file-provenance.md`: the file exists, the conventions pointer names it, and
   `/fusion:cleanup` cites it directly the way every skill reaches rule text.
   - Pros: takes the bytes off all fifteen dispatches, which is the whole point of the move. The
     precedent exists twice and both cases are deliberate.
   - Cons: a third such file, and the record warns against inheriting that pattern without a
     positive reason. Nothing then guarantees the archive step actually reads it.
2. **Emitted to the agents that touch archived or tracked state.** Pick a derived audience the way
   `rules/circle-records.md` derives one, from a mechanical property of the prompts.
   - Pros: keeps the emission mechanism as the audience definition, which is this project's stated
     preference over a hand-picked list.
   - Cons: there may be no such property to derive from. No agent applies the rule, so a derivation
     would be constructed to justify an emission rather than discovered.
3. **Do not move it; revisit `260816-0711`.** If the emission question has no good answer, option 2
   of that record was the wrong choice and option 3 (cut the reasoning, keep the rule) deserves
   another look.
   - Pros: honest if the move turns out to be unimplementable as approved.
   - Cons: reopens a decision the user just made, and the byte case that motivated it is unchanged.

## Constraints

- The split must stay reachable by a human writing a `.gitignore`. That reader is not served by any
  emission mechanism, so no option may depend on emission alone to make the text findable.
- `hooks/lib/__tests__/rules-emission-golden.test.ts` bounds the always-on set. Every option here
  removes bytes from it or leaves it unchanged; none adds.
- Whatever is chosen must not leave the conventions file pointing at a file nobody can be shown to read.

## Recommendation

Option 1, at low confidence. It is the only option that delivers what the approved move was for,
and the "positive reason" the record asks for is available: unlike the other two no-agent files,
this one has a named non-agent consumer in `/fusion:cleanup`'s archive step, which can cite it
explicitly in its own body. That turns "emitted to nobody" into "read by a skill that says so",
which is a different claim.

---
Answered:
Implemented:
Deferred:
Superseded by:
Retired:
