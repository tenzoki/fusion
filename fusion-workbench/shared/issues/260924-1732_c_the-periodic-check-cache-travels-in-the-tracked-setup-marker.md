The periodic-check cache travels in the tracked setup marker
---
`/fusion:setup` records per selector when each periodic check last ran, in the `checks` object of `fusion-workbench/.fusion-setup`, and that file is tracked, so it travels between checkouts. Most checks are about the checkout itself (the monitor copy, the registry entry, the distance to the remote); a checkout that pulls another's stamps skips checks it never ran and cannot tell. The user ruled on 260924 that the cache moves into a local, untracked file of its own, after the `.cadence-anchors` model, and that it is fixed on `main` as well as on the v12 line.
---
**Filed by:** user, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260910-1600_*_does-the-periodic-check-cache-belong-in-a-file-that-travels-between-checkouts.md

Evidence: `skills/setup/SKILL.md` Step 0 (the marker block writing `checks`) and `skills/check/SKILL.md` `## Stamp what you ran`; `git ls-files fusion-workbench/.fusion-setup` lists it; `rules/workbench-tracking.md` names the question open. This repository has two registered checkouts.

Acceptance: setup and `/fusion:check` read and write the stamps in a local file that `.gitignore` excludes (class L in `rules/workbench-tracking.md`), `.fusion-setup` carries no `checks` object any more (an existing one is ignored or dropped on the next write), the tracking rule lists the new file, and a test proves a pulled marker from another checkout makes no selector count as done.

---
Resolved: setup and `/fusion:check` keep the per-selector stamps in `fusion-workbench/.check-stamps`, a local, gitignored class L file after the `.cadence-anchors` model; `.fusion-setup` no longer carries `checks` (an existing object is dropped on the next write); the layout tree, the tracking rule, staging drift, archive, migrate, the cadence anchor pathspec and the READMEs list the new file; `live-circle-record-detection.test.ts` proves a pulled marker makes no selector count as done.
