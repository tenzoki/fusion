The closing coverage read anchors a migrated package at the migration commit, and an empty `--since` falls back to the session anchor in silence
---
`agents/orchestrator.md` `## Closing a work package` step 2 (added at `ee3a3c19`) takes the closing coverage read "with `--since` the commit that filed the item (`git log --diff-filter=A --format=%h -- <container>/package.json`)". Two defects meet in that one command. (1) On a workbench converted by `/fusion:migrate`, every package that existed before the migration got its `package.json` in the migration commit, so the command answers the migration commit and not the filing: the work done on the package before the migration is outside the closing review, which is the gap `ee3a3c19` set out to close. (2) When the command prints nothing (a workbench-relative `<container>`, a package not yet committed), the call becomes `--since ""`, and `bin/fusion-review-coverage` takes an empty value as "no value" and uses the session anchor, exit 0, nothing said. That is the pre-fix behaviour, reached without a word. Medium: every v12 project that migrates with a live package reaches (1); (2) is a silent fallback (`HYG-NO-SILENT-FAIL`).
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Evidence:**
- `git log --diff-filter=A --format='%h %s' -- fusion-workbench/work-packages/260928-1338-json-control-data-and-markdown-artefacts/package.json` prints `95720e4c … the workbench is on JSON control (migration-20261006-v12)`; the package's narrative was added at `d84b8dfd` on 2026-09-28.
- The same command with the workbench-relative path `work-packages/260928-1338-…/package.json`, run from the project root, prints nothing.
- `bin/fusion-review-coverage --since ""` prints `since=d398ced1…` (this checkout's session anchor), exit 0. `hooks/review-coverage.ts` `main` refuses only a missing value or one starting with `--`; `hooks/lib/review-coverage.ts` `measureReviewCoverage` reads `since === ""` as "use `sessionAnchor`".

**Fix direction:** anchor on what the filing wrote and the migration did not rewrite (the narrative's first add, with `--follow` across the v12 container rename, or a filing stamp the control file carries), and spell the path relative to the git root. Make the helper refuse an empty `--since` as a usage error (exit 1) rather than reading it as absent.

**Acceptance:** (a) on a fixture where a package's narrative is committed, then a migration commit adds its `package.json`, the anchor the prompt's command yields is the narrative's commit; (b) `bin/fusion-review-coverage --since ""` exits 1 with the usage line and nothing on stdout, pinned by a case in `hooks/lib/__tests__/review-coverage.test.ts`; (c) hooks suite green.

Cross-references: 261009-1037-reviewer-g-a-pre-release-review-of-13-0-0.md

Resolved: agents/orchestrator.md `## Closing a work package` step 2 anchors the closing read at the narrative's first add (`git -C "$WORKBENCH" log --follow --diff-filter=A --format=%h -- <step 1's narrative.path> | tail -n 1`), which the migration does not add and `--follow` carries across the v12 store rename; hooks/review-coverage.ts `main` refuses an empty `--since`/`--head` as a usage error (exit 1, nothing on stdout), hooks/dist rebuilt. Pinned in hooks/lib/__tests__/review-coverage.test.ts: "refuses an empty --since with exit 1 rather than falling back to the session anchor" and "anchors a migrated package at its narrative's filing, not at the migration that added package.json", the second running the command read off the prompt.
