The v11 upgrade note is maintained as live in one commit of this range and frozen in the other
---
`docs/upgrading-to-v11.md` is the note a project on v10.26 reads to reach any v11.x, this release included. One commit in the range rewrote its migration description to match current behaviour; the other declined to touch it on the ground that it records what v11 did. The result is one file stating the migration as it behaves today and the status set as it stood at `v11.0.0`.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260915-2028_*_a-fifth-status-value-for-work-items.md, 260915-1922_*_the-v11-upgrade-note-describes-the-migration-as-moves-only-while-step-4b-rewrites-a-live-records-head.md

**Evidence.**

- `docs/upgrading-to-v11.md:25`, the **What left** table: the work item's "state a `**Status:**` head field taking `open`, `claimed`, `done` or `dropped`". Four values; the set is five at HEAD.
- `950a606e` edited `:54-70` and `:153-158` of the same file to describe the migration's rename-and-re-head behaviour and the head fields it carries across — current behaviour, not `v11.0.0` behaviour.
- `55be2491`'s plan, `260915-2028_*_a-fifth-status-value-for-work-items.md` step 6: "**`docs/upgrading-to-v11.md` is not edited.** It describes correctly what v11 did, and rewriting it would edit history rather than document a change."

Both positions are defensible; holding both in one release is not, and the reader who meets the cost is the one this note is written for — a project arriving from v10.26, who is told the field takes four values by the same page that tells them what the migration will do to their workbench.

**Acceptance.** One position is taken for the whole file and stated in it: either the note tracks current v11 behaviour, and `:25` names five values, or it is frozen at `v11.0.0`, and `950a606e`'s edits are re-framed as such or moved to a release-specific note. The file says which it is, where a reader will meet it.
