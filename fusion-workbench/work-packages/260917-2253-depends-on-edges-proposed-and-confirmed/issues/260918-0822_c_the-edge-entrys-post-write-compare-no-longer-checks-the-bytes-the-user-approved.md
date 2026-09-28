The edge entry's post-write compare no longer checks the bytes the user approved

---

The post-write compare exists because approved text and written text once differed by two characters nobody saw. On the two edge fields it has been weakened from a byte-for-byte comparison against the After block to a membership test over basenames, and the After block has become a picture of a line that the apply pass is not required to produce. The two entries the first run wrote demonstrate the gap: both insert a basename mid-list, and the rule appends.

---

**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260918-0738-curator-run.md, 260918-0821_*_the-edge-exception-removed-the-apply-passs-staleness-check-and-put-nothing-in-its-place.md, 260815-1943_*_the-curators-applied-text-carries-two-characters-the-approved-text-did-not.md

## The defect

`agents/curator.md` `### Pass 2 — apply` states the general obligation and its reason:

> **After writing an entry, re-read the region you wrote and compare it byte for byte against the text the ledger says that region must carry.** The user approved those bytes; the before-text check cannot see what landed, and a doubled period once got through it.

The edge exception replaces it for these two fields with:

> **The post-write compare reads the line back** and requires this entry's basename plus every basename the line carried before the write. That is the byte-for-byte check in the only form this shape admits.

The last clause is not true. A membership test over a basename set passes a line carrying `a.md,,b.md`, `a.md , b.md`, a trailing comma, a lost space, a CRLF, or the whole field duplicated on two lines — every defect of exactly the class the 2026-08-15 record was filed for. The shape admits a byte-exact check: the line after the write must equal the line as found with `, <basename>` appended, and every byte of both sides is known at write time. That test is byte-for-byte, survives per-id approval, and rules out the whole class. It was not taken.

## The After block now shows something the apply pass need not write

`### Ledger entry schema` says **After** is "that line with this entry's basename added". `### Pass 2 — apply` says applying "**appends** that basename to the line as found". Those are different operations whenever the After block puts the basename anywhere but last, and the ledger the first run produced does exactly that: `L10` and `L11` each insert their target in second position, before `260909-1020_*_…`.

So the bytes the user reads at the gate are not the bytes the apply pass will write, and nothing compares the two. The gate's contract — the user approves an After block, the post-write check verifies it landed — holds on every other surface and holds on neither half here.

The consequence is small in isolation and structural in kind: the reason the whole two-pass design is safe is that the user approves bytes and a mechanism confirms those bytes. On these two fields the user approves a picture.

## Acceptance test

The apply pass's post-write check for an edge entry compares the line on disk byte for byte against a text it computes from the line as found plus this entry's basename, and a whitespace or separator defect in that line is `failed` rather than `applied`. The schema says which of the two the After block is — the exact line the record must carry, in which case the write produces it, or an illustration, in which case it says so and the compare is defined against the computed text instead. `L10` and `L11` are rewritten to whichever the answer is before either is offered at a gate.

Resolved: the post-write compare is byte-for-byte again. `agents/curator.md` `### Pass 2 — apply` now requires re-reading the line and comparing it against a text **computed at write time** — the line as found plus `, <basename>`, or the whole new field line where the write created it — with any difference `failed` naming both texts, and states in the same bullet that a membership test over basenames is not this check and does not replace it, naming the class it passes. The append position is decided and stated: **last**, after every basename the line already carries, so the write and the ledger's After are the same bytes, and a run whose After shows the basename elsewhere is a ledger defect rather than a licence to write it there. `### Ledger entry schema` says which of the two the After block is: the exact line the record must carry **when this entry is the only one of its run applied into that field**, computed the same way, and it names the one case where it falls short of what lands — a second entry into the same line — which is why the compare is against the computed text and not against the block.

Residual, named rather than left for the next read: the first run's `L10` and `L11` still show a mid-list insert, and this dispatch forbade touching the run files. They are inconsistent with the rule above and must be rewritten or re-derived before either is offered at a gate. That is one edit to `260918-0738-curator-run.md` and no edit to any prompt.
