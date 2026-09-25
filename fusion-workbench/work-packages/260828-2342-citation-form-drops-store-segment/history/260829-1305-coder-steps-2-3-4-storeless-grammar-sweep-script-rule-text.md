# coder: plan steps 2, 3 and 4 of `260829-1226_*_citation-form-drops-store-segment.md`

**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Date:** 2026-08-29
**Status:** Complete
**Commit:** none (the orchestrator commits; these steps land in commit B with steps 5 to 8 and 10)

## What was done

**Step 2, the grammar resolves storelessly.** `hooks/lib/citation-scan.ts`: `findRecord(citedBase)` is one basename lookup over the whole index, `archive/` included; `anchoredUnder`, `unsweep`, `anchoredAt` and `ARCHIVE_SWEEP_RE` are deleted (a one-line `SWEEP_DIR_RE` remains for `circleDirs()` to find swept `circles/` containers). A `record`, `circle-record` or `circle-dir` token gets status `store-prefixed`, `problem` naming the segment, `fix` spelling the storeless form; `CitationStatus` gains `store-prefixed` and loses `wrong-store`; `scanRecordCitations` and `partition` count it as a violation. `STAMP_RE` admits an optional `.md`, and a `stamp-name` ending in `.md` matches the basename exactly. A `stamp-bare` now also counts Circle directories among its matches, so the sweep's "exactly one match" reads artifacts and directories together, as step 3 specifies. `CitationHit` gains `col`, the 0-based column, which is what a rewriter splices at. Decision `260829-1225` option 1: no line-shape exemption. Header rewritten to the storeless grammar. Tests: the wrong-store case and the archived-Circle-directory case are gone; three new cases (store-prefixed in each of the three shapes with the storeless fix; a `bare-record` whose only copy sits under `archive/` resolves with no path arithmetic; `stamp-name` with `.md` exact, without it by prefix). `fenced-code-exemption.test.ts` cites the Circle by its bare directory name now that `circles/<dir>` is a violation. `workbench-citation-lint.test.ts` header names the lib module and the new status.

**Step 3, the sweep script.** `hooks/scripts/citation-sweep.mjs`, driven by `dist/lib/citation-scan.js` (`FUSION_TEST_DIST` when the test run sets it). Dry-run by default, `--write` applies, `--root`, extra paths. Rewrites per kind as the plan states, right to left within a line, skipping every exempt token and every `.ts` under `lib/__tests__`. Summary line carries per-kind counts. `hooks/lib/__tests__/citation-sweep.test.ts` (45 lines) drives it over a scratch workbench: three rewrites, two exempt tokens untouched, one residual line. **Not run with `--write`** (step 10 does).

**Step 4, the rule text.** `rules/fusion-workbench-conventions.md` `## Filename Patterns` states the storeless form, the store-segment violation, the markerless-artifact and Circle forms, the workbench-wide lookup, the uniqueness scope (live tree and `archive/`, 2 235 basenames, 0 collisions, measured at commit `4b8f769d`, pinned by `workbench-citation-lint.test.ts` once step 6 lands), and the annotation-line clause. `rules/circle-records.md`: head-field paragraph, template lines, the portfolio and head-field citation-form sections. `rules/decision-record-examples.md`: the two examples take the storeless form. `rules/orchestrator-resume.md`, `agents/shaper.md`, `agents/orchestrator.md` (`## Circle head fields`, Step 0b.2 step 3), `skills/next/SKILL.md`, `skills/migrate/SKILL.md`: one clause each.

## Measurements

- Reference-resolution pin re-approved 1517/213 -> 1520/215; shares by single-file revert: conventions +1 path, circle-records +1/+1, migrate +1/+1, all others 0/0.
- Both goldens regenerated; no baseline map edited.
- `skills/` bytes: migrate 26 630 -> 26 620, next 27 593 -> 27 616, net +13 of the 93 free.
- Sweep dry-run over the workbench (`archive/` included): `files=2115 rewrites=16283 residual=3161 record=9584 circle-record=341 circle-dir=603 bare-record=992 stamp-bare=4763`; of those, 565 files and 3 475 rewrites under `archive/`. With the shipped surface named as well: `files=2165 rewrites=16487 residual=3229 record=9671 circle-record=341 circle-dir=616 bare-record=992 stamp-bare=4867`.

## Verification

`cd hooks && npm test` — exit 1. Two red, both expected until step 10's sweep: `workbench-citation-lint` (821 violations, every one `store-prefixed`) and `reference-resolution-lint` "passes on the whole surface" (112 `store-prefixed` in the shipped text). Everything else green: 784 of 786.
