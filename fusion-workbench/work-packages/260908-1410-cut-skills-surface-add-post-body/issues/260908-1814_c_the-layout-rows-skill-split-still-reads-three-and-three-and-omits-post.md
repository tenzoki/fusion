The layout row's skill split still reads three and three, and omits `post` from both groups

---

`CLAUDE.md`'s `skills/<name>/SKILL.md` row in `## Layout` reads "Three are the administrative surface (`setup`, `cleanup`, `cadence`), three are cleanup pipeline steps (`archive`, `curate`, `log-activity`), and the rest are situational (`commit`, `direct`, `help`, `memo`, `migrate`, `news`, `next`)". That enumerates thirteen names against fourteen directories on disk, and `post` is in neither group. It is the same claim the Circle corrected twice elsewhere, in a third place in the same file.

---
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>

**Evidence.** `ls -1d skills/*/` returns fourteen directories at HEAD `ee99a578`; the row's three groups sum to thirteen and name no `post`. Step 11 of `260908-1612_*_cut-the-skills-surface-and-add-the-post-step-body.md` corrected the two sites its inputs named — the skill-roster bullet in `CLAUDE.md` `## What this is`, which now reads "Four further bodies" and "Two of those four selectors", and `README-agents.md`'s "Four more bodies in the table" — and this third site was in no input.

**Why no gate sees it.** `hooks/lib/__tests__/derivable-enumerations-lint.test.ts` matches `/fusion:<name>` tokens against `skills/*/`, and the token for `post` is present in the bullet above, so the file passes. This row names bare skill names rather than slash-command tokens, so nothing resolves them and nothing counts them. That is the same hole the `templates/` and `docs/` rows in the same table record for their own inventories, and both of those responded by deleting the inventory rather than maintaining it.

**Why it matters more than a stale count.** `rules/critical-stance.md` §5 requires a cardinality to be enumerated, derived or commit-stamped rather than asserted, and this one is asserted three ways in one sentence: two group counts and a closed list. A reader taking the row at face value learns that fusion has three pipeline steps, which the bullet twenty rows above contradicts in the same file.

**Acceptance test.** The row and the roster bullet agree on how many bodies are cleanup pipeline steps and on which they are, or the row stops enumerating and says how to derive the split — the answer the `templates/` and `docs/` rows already took for their own inventories.

---
Resolved: the row stops enumerating. `CLAUDE.md` `## Layout`, the `skills/<name>/SKILL.md` row, now points at
the skill-bodies bullet under `## What this is` as the one enumeration and names `ls -1d skills/*/` as the
set, which is the answer the `templates/` and `docs/` rows in the same table already took for their own
inventories. That satisfies the second branch of the acceptance test rather than the first: making the copy
agree would have left three statements of one split in one file, and the lint hole the record names — bare
skill names resolve to nothing, so `derivable-enumerations-lint` cannot see them — would still be open on the
next change. The row keeps the reason it drifted, so a later reader does not restore an inventory.
