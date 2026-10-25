
**A `work-packages/` container holding work-package directories is the CURRENT layout and is never a finding.** That is what a workbench looks like now: one directory per work package, holding that package's own stores, beside the `shared/` stores for everything with no item to belong to (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`). Setup creates `work-packages/` itself, below. A probe that refused a container would refuse the ordinary shape and route every user to a migration that must not run.

