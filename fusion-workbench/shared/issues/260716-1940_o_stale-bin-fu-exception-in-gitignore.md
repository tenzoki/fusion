Stale `!bin/fu` exception in .gitignore

---
`.gitignore:23` carries `!bin/fu`, an un-ignore exception for a file that no longer exists. `bin/fu` was the project-local launcher; it was removed in v3.20.0 when it was folded into the `fusion` launcher (commit `2736d07`, "fu folded into fusion launcher"). The exception has been dead since.

Verified 2026-07-16: `bin/fu` is absent from the tree; `bin/` holds only `fusion-commit-lock`, `fusion-paths`, `fusion-rules`, `fusion-session-mark`, `fusion-workbench-root`, `monitor`.

Related, same file: `.gitignore:51` has a comment describing "the project-local `fu` launcher copied from bin/fu at Setup". That comment is stale for the same reason and should be checked in the same pass.

---
Cosmetic, no functional impact — a negation for a non-existent path is a no-op. Filed rather than fixed inline because it is unrelated to the Circle's Directive (workbench restructure): per the origin rule now in `rules/fusion-workbench-conventions.md`, a defect found next to the work rather than arising from it belongs to the shared store, not to the Circle.

Found by `coder` during task P-2 (`bin/fusion-paths`), while adding the `!bin/fusion-paths` exception two lines below.
Source: fusion-workbench/planning/260716-1910[p]-plan-workbench-umbau-circle-container.md

---
Reconciliation 260731-2324 (reconciler, domain `code`) — **confirmed still live, stays `_o_`.** `.gitignore:23` still carries `!bin/fu`, and `bin/` holds no such file: `fusion-commit-lock`, `fusion-paths`, `fusion-plane`, `fusion-rules`, `fusion-session-mark`, `fusion-workbench-root`, `monitor`. The launcher was removed in v3.20.0 and the un-ignore rule outlived it. Untouched by the v5.7.0 release, which changed no packaging file except `install.sh`'s pin-example comment.
