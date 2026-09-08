The reference-count re-approval for the post commit names a "from" that was never the pin, and omits the file carrying the whole movement

---

`hooks/lib/__tests__/reference-resolution-lint.test.ts`, the `BASELINE` comment, carries an entry reading "Re-approved 2026-09-08 (steps 10 and 11 of the same Circle …): paths 1703 -> 1702, anchors 242 -> 240". The pin it replaced was neither figure: the committed value at `3175f39e` and at `b0705cc4` is `{ paths: 1692, anchors: 237, stampBare: 14 }` and at `22d6f839` it is `{ paths: 1702, anchors: 240, stampBare: 14 }`. So the pin moved 1692 → 1702 and 237 → 240 while the entry accounts for −1 and −2, and the chain has an unexplained +11 paths and +5 anchors in it.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

The cause is that steps 8, 10 and 11 are one commit by design (the plan requires it, so no intermediate commit fails a lint), and the entry was written against the tree *after* step 8 rather than against the pin the commit replaces. Its three named shares — the cleanup body −2 paths and −2 anchors, the agents README +1, the instructions file 0 — sum to the −1/−2 it claims and describe three of the four shipped files the commit touches. The fourth, `skills/post/SKILL.md`, is 6 137 new bytes and is not mentioned anywhere in the entry.

The missing share is attributable and reconciles exactly. Enumerating the plugin-path tokens in `skills/post/SKILL.md`: the forum helper once, the conventions file three times, the workbench-root helper, the paths helper, the user-facing-output rule, the archive body, and the identity helper three times (twice inside the shell block, once in the prose beneath it) — eleven. Its heading anchors are `## Project language`, `## Path Resolution`, `## Filename Patterns`, `## Vocabulary` and `## Process` — five. That is 1692 + 11 = 1703 and 237 + 5 = 242, which is precisely the "from" the entry states and calls a starting point rather than a share.

Why this is worth a record rather than a shrug. The attribution convention exists so a later reader can reconstruct which file moved a number, one revert at a time; four of the five entries in this Circle do that correctly. This one is the single link where the chain does not join, and the failure mode it introduces is specific: a reader tracing backwards from 1702 lands on 1703, finds no commit at which the pin held that value, and cannot tell whether a measurement was wrong or an entry was lost. The reconciliation pass at `260908-1814` checked the byte arithmetic of the `skills/` surface independently and did not check this chain.

Nothing is wrong with the pinned number itself. `npm test` is green at `a98e763b` (925 tests, 53 files), so 1702/243 is what the gate reads. Only the account of how it got there is broken.

**Acceptance test:** the entry for `22d6f839` states the pin it replaced (1692/237), names `skills/post/SKILL.md` with its share, and the four shares sum to the observed move; a reader can walk the chain from `1713` to `1702` with no step whose "from" is a figure the pin never held.
