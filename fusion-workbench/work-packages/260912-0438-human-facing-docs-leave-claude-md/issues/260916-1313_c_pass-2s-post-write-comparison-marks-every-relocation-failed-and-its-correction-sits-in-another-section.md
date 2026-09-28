Pass 2's post-write comparison marks every relocation `failed`, and its correction sits in another section

---
`agents/curator.md` `### Pass 2 — apply` (line 212) is the authoring home of the apply procedure:

> **After writing an entry, re-read the region and compare it byte for byte against the ledger's
> After block.** … A mismatch is `failed`, naming both texts.

`4c41d693` redefined what the After block holds for a relocation (line 317):

> **The After block is the text the destination must carry** … the pointer line is what replaces the
> passage where it stood.

Read together as authored, the apply pass writes a **pointer** at the source and then compares the
source region against the **destination's** text. They never match, so every relocation that applies
correctly is recorded `failed`.

The correction exists and is in the wrong place: the last sentence of the out-of-remit bullet in
`## Reporting work you may not do` (line 238) — *"The post-write comparison the apply pass performs
is at the **source**, against the pointer line."* That bullet's subject is a relocation whose
destination is a file the curator may not write, so a reader applying an in-remit relocation has no
reason to be in that section at all. The sentence can be read as a general statement about the apply
pass; nothing in it says so, and nothing in `### Pass 2 — apply` points at it.

This is the same authoring-home discipline the rest of the project holds: the rule that governs
Pass 2 belongs in Pass 2, and a second statement of it inside a section about work the agent may not
do is how the two come apart.

**Acceptance test:** `### Pass 2 — apply` states what the post-write comparison reads for a
relocation entry, so that applying one correctly yields `applied` for a reader who never opens
`## Reporting work you may not do`.

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
Cross-references: `260916-1312_*_an-in-remit-relocation-is-stale-by-its-own-rule-and-nothing-sequences-the-destination-write.md`.

---
Resolved: the post-write comparison is stated in `### Pass 2 — apply` and nowhere else. Two changes
there. The general sentence no longer presumes one text — it reads "re-read the region you wrote and
compare it byte for byte against **the text the ledger says that region must carry**" — and the
relocation procedure below it says which text that is for each of the two regions: the After block
is what the destination must carry, the `Pointer left behind:` line is what the source must carry.
Step 5 is explicit that the source comparison is against the pointer line and never against the
After block, "which belongs to the destination", so a relocation applied correctly yields `applied`
for a reader who never opens `## Reporting work you may not do`.

The stranded sentence in that section is removed rather than duplicated; the bullet now cites step 3
of the apply pass for the ordering and keeps only what is about the exclusion itself — that the
destination is refused, who owns it, and that the entry stays `stale` until that executor writes it.
One statement, one authoring home.
