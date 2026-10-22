Citation sweep, gojson and migrate repair carry three small checking gaps
---
Three Low defects, reported by the delegated pass over the carried 13.0.0 files and not re-read by the reviewer.

1. `hooks/citation-sweep.ts:900-906` deduplicates declared paths against the corpus but not explicit `<path>` arguments, so a path inside `fusion-workbench/` is counted twice in `files=` and `rewrites=`.
2. `codec/src/prior/gojson.ts`: the `GO_TIME` regex (`:330`) accepts trailing-zero fractions and any `±HH:MM`, where the doc (`:338-339`) says times Go would not write are refused. `goQuote` (`:316-318`) writes a lone surrogate as `\udxxx`, where Go writes U+FFFD.
3. `hooks/migrate.ts` (around line 597) maps any exception from `applyRepair` to exit 9, "backup does not verify", an ordinary I/O error included.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261014-0830-reviewer-closing-pass-over-the-prior-module-bundle-package.md`

Fix direction: deduplicate explicit paths through the same `inCorpus` set; tighten `GO_TIME` to Go's RFC 3339 output and refuse lone surrogates; give exit 9 only to a failed backup verification and another code to other exceptions.

Acceptance: a sweep census with `fusion-workbench/x.md` passed explicitly counts it once; `gojson` tests refuse `…T00:00:00.10Z` and a lone surrogate; a thrown I/O error in `applyRepair` exits with a code other than 9.

---
Progress: 2026-10-22, plan step 5 of `261022-1611-plan-prior-bundle-closing-review-follow-ups.md` closes item 2, the gojson half. Items 1 and 3 stay open for plan step 7, which closes this issue. `GO_TIME` (`codec/src/prior/gojson.ts`) now admits only what Go's RFC3339Nano writes: a fraction whose last digit is not 0, and `Z` or a non-zero offset. `…T00:00:00.10Z`, `…T00:00:00.0Z` and `+00:00` are refused. `goMarshal` refuses a lone UTF-16 surrogate in a string or a map key as a value no Go string holds. `goQuote` writes a lone surrogate as U+FFFD raw, which is what Go writes after its decoder has read the escape. Tests in `codec/src/__tests__/prior-mapping.test.ts` (`gojson reproduces encoding/json`); `cd codec && CODEC_REQUIRE_GOLDENS=1 npm test` exit 0.

Resolved: 2026-10-22. Step 7 of `261022-1611-plan-prior-bundle-closing-review-follow-ups.md` closes items 1 and 3. Step 5 (695e1f84) closed item 2. Item 1: `hooks/citation-sweep.ts` now passes explicit `<path>` arguments, and every file under an explicit directory, through the same real-path set as the declared paths, so a file already in the workbench corpus is not added a second time. Item 3: `ensureBackup` (`hooks/lib/legacy-repair.ts`) throws `BackupUnverified` when the copy does not verify. In `hooks/migrate.ts` `repair`, only that error maps to exit 9. Any other exception from `applyRepair` maps to exit 3, `applying <finding> failed: <message>`. `bin/fusion-migrate`'s exit table already lists exit 3 as an internal fault and needed no edit. At the `repair --apply` call, `skills/migrate/SKILL.md` handles exits 6 and 9, and now names exit 3 as well. Tests: `citation-sweep.test.ts` "an explicit path already in the workbench corpus is counted once" (`fusion-workbench/x.md` passed explicitly, `files=1 rewrites=1`); `migrate.test.ts` "an I/O error inside a repair is exit 3 with its message, never the backup's exit 9" (a read-only target file, EACCES, exit 3). `cd hooks && npm test` exit 0.
