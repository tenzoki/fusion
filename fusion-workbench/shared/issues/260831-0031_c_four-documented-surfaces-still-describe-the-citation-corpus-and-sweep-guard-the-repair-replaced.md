Four documented surfaces still describe the citation corpus and the sweep guard that plan 260830-1841 replaced

---

Plan `260830-1841_*_citation-mechanism-four-defect-repair.md` moved two shipped behaviours and left four documented surfaces stating the behaviour that is gone. Each of the four is an authoritative surface by this repository's own rule — a `bin/` helper's header, `CLAUDE.md`'s Layout row, and two `README-hooks.md` table rows — so a reader who reaches one of them is told the wrong thing by the document that is supposed to settle it.

---
**Filed by:** planner, Kai Stalmann <ks@qantr.com>

**The two behaviours that moved.**

- Step 4 (`32fe0d49`) deleted `FROZEN_PREFIXES` from `hooks/citation-check.ts`, so the checker reads `archive/`, `stashes/` and `.migration-v2-backup/` like the live tree.
- Step 1 (`d2e90ba9`) replaced the sweep's clean-tree test with the corpus question, so guard (a) refuses only when an uncommitted change names a file the run will read.

**The four sites, read at `7be624e7`.**

| site | what it still says | which behaviour |
|---|---|---|
| `bin/fusion-citation-check:24` | "Corpus: every .md under fusion-workbench/ except archive/, stashes/ and .migration-v2-backup/" | the checker's corpus |
| `CLAUDE.md:49` | "the live workbench (`archive/`, `stashes/` and `.migration-v2-backup/` excluded)" | the checker's corpus |
| `README-hooks.md:211` | "the live workbench plus `CLAUDE.md`, `rules/`, …" | the checker's corpus, read as the same exclusion; ambiguous rather than plainly false |
| `README-hooks.md:212` | "three guards named in its header: a tracked workbench in a clean git work tree (exit 4)" | the sweep's guard (a) |

The plan's own step 4 rewrote the `## Corpus` block inside `hooks/citation-check.ts` and step 1 rewrote the guard block inside `hooks/citation-sweep.ts`. Neither step named the wrapper header, the `CLAUDE.md` row or the two README rows, and no gate reads a prose claim against the code it describes.

**Acceptance test.** At the fixing commit, `grep -n 'migration-v2-backup' bin/fusion-citation-check` returns nothing; `CLAUDE.md`'s `bin/fusion-citation-check` row states that the frozen stores are read like the live tree; `README-hooks.md`'s `citation-check.ts` row names the corpus without the word "live"; `README-hooks.md`'s `citation-sweep.ts` row states guard (a) as the corpus question rather than as a clean tree. `cd hooks && npm test` exits 0.

---

Resolved: all four sites corrected in step 5 of `260831-0024_*_a-project-declares-its-citation-bearing-paths.md`, together with the declared corpus this plan added.

- `bin/fusion-citation-check`'s corpus block now states the frozen stores as read exactly like the live tree, names the declared corpus, and adds `declared-patterns=` and `declared-files=` to its sample `KEY=value` output, the second reading `unavailable` where git will not answer. `grep -n 'migration-v2-backup' bin/fusion-citation-check` returns nothing.
- `CLAUDE.md`'s `bin/fusion-citation-check` row says the same, cites `32fe0d49` for the deletion, and states the shared-corpus rule and the gate that deliberately does not read the declaration.
- `README-hooks.md`'s `citation-check.ts` row names the corpus without the word "live".
- `README-hooks.md`'s `citation-sweep.ts` row states guard (a) as the corpus question — a tracked workbench, no uncommitted change naming a file the run will read, and every extra `<path>` inside the work tree and tracked by it — rather than as a clean tree.

Two things beyond the four, and both are named rather than left implicit. `bin/fusion-citation-sweep`'s own header carried the same clean-tree claim the README row did; it was corrected in the same pass, since an authoritative header stating a guard that no longer exists is the defect this record is about. And `CLAUDE.md`'s `bin/fusion-citation-sweep` row still says "the workbench is tracked in a clean git work tree": it was left standing because step 5's dispatch bounds the `CLAUDE.md` edit to two named rows, and it is reported to the user as a residual rather than fixed here.

`cd hooks && npm test` exits 0 at the fixing change (47 files, 818 tests), with the `surface-growth.golden` fixture regenerated and the `reference-resolution-lint.test.ts` baseline re-approved 1552 -> 1563 paths.
