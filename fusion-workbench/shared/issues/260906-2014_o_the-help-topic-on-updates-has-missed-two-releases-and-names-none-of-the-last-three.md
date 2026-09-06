The help topic on updates has missed two releases and names none of the last three

---
`skills/help/SKILL.md`'s update topic is meant to carry the last three releases, with anything
older reached through `docs/`. It carries v10.20, v10.14 and v10.7. It was not advanced for
v10.23 and is not advanced for v10.24, so a user who runs it while installing the current
release is told about three releases, none of them recent.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Found by** the agent that filled the missing upgrade paragraph in `README.md` during the
v10.24 release, and named rather than quietly fixed, because the topic is a shipped surface
with its own growth bound and the release was waiting on a consuming project.

**Why it matters more than a stale line usually would.** This topic is what a user runs to
find out what an update brings. Every other release surface was checked and corrected in this
release: the version in the manifest, the pin example in the installer's header, the pin
example in `README.md`, the upgrade note, and the `README.md` paragraph pointing at it. This
one was missed by the same release process twice running, which says the process has no step
that reaches it.

**Two related observations from the same reading**, neither of them a defect on its own and
both worth having in one place. `README.md` `## Install` now carries ten upgrade paragraphs
reaching back to v8 while `docs/` holds thirteen notes, so "one paragraph per shipped note"
does not describe that section: `upgrading-to-v10-5.md` and `upgrading-to-v10-6.md` have no
paragraph, and `upgrading-to-v10-8.md` is named only inside another. Whether that tail should
be cut is a separate question and nothing in the rules requires it today. The three-release cap
is stated in `CLAUDE.md` about this help topic and about nothing else.

**Acceptance.** The update topic names the three most recent releases. And the release process
in `CLAUDE.md` names this surface among the ones a release checks, so the next release cannot
miss it the way the last two did — a fix that only advances the text leaves the process gap
that produced it.
