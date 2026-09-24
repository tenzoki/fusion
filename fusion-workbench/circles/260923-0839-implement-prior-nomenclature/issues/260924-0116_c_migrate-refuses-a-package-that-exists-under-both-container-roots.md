/fusion:migrate refuses a package that exists under both container roots
---
In a workbench updated to 12.0.0 but not yet migrated, records filed for a package claimed under `circles/<dir>/` land in `work-packages/<dir>/`, because every `OUT_*` writes the new root. `/fusion:migrate` then sees `circles/<dir>` and `work-packages/<dir>` both present and refuses it as a collision (`store-name-migration.test.ts` case (d)); `fold_store` does not merge one container that exists under both roots. The user is left with a manual `git mv`.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260922-1129_*_plan-prior-nomenclature-consumer-migration.md, 260923-0839-implement-prior-nomenclature.md

Evidence: `skills/migrate/SKILL.md` apply block and its fold step; found while writing `docs/upgrading-to-v12.md`, which tells consumers to migrate right after updating and gives the manual fix. This repository's own workbench is exposed too: a session running the work tree's helpers writes this package's new records under the new container root while its record stays under the old one.

Acceptance: `/fusion:migrate` folds a container present under both roots when no file path collides inside it (and still refuses a true file collision), with a test case beside (d).

---
Resolved: `skills/migrate/SKILL.md` `fold_store` and the survey's new `cv` descend into a directory present under both roots and fold it file by file with `git mv`; only a same-path file is refused and named, and the rest moves. Two cases in `store-name-migration.test.ts` replace (d): the fold, and the refusal on a real file collision. `docs/upgrading-to-v12.md` describes the new behaviour. Known limit: a same basename in `circles/<dir>/planning/` and `work-packages/<dir>/plans/` is not predicted by the survey; the apply still refuses and names it.
