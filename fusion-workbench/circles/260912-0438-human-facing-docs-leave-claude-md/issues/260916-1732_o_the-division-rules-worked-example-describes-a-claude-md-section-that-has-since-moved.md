The division rule's worked example describes a `CLAUDE.md` section that has since moved

---
`rules/context-lean-claude-md.md` `### Step 1 — divide the file by heading, before judging anything`
carries two worked classifications, both taken from this repository's own `CLAUDE.md`: the language
declaration, which stays, and the release procedure, which moves. The second is written in the
present tense about a file that no longer carries that section. `72911b86` moved it to
`README-agents.md` `## Releasing`, and `## Release process` in `CLAUDE.md` is now a 261-byte pointer.

The classification itself is still correct and is still the right example — a release procedure binds
only where the work is a release, which is exactly what the criterion separates. What is stale is its
account of the source file: a reader who opens `CLAUDE.md` to check the example against the text
finds a pointer where the example describes a section.

This is the awkward case the rule's own examples were chosen for. They were written from a file the
work then changed, so the example that demonstrates a move is now describing a move that happened.
Two ways out, and the choice is not made here:

1. Put the example in the past tense and cite the commit that performed the move, so it reads as a
   worked case rather than a prediction. Costs nothing and makes the example stronger — it is no
   longer hypothetical.
2. Replace it with an example from a file that has not moved, so the section stops depending on a
   file this project keeps editing.

**Acceptance test:** a reader following the release-procedure example to `CLAUDE.md` finds text that
matches what the example says about it, or the example names the commit that moved it.

---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

Found while rewriting Step 1's division rule under
`260916-1316_*_three-surfaces-state-the-heading-division-rule-and-two-of-them-answer-differently-on-fusions-own-claude-md.md`,
whose acceptance test covers the rule's wording and not its examples' currency. Reported rather than
fixed for that reason.
