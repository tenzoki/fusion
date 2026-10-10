# Closing review: the uncovered FJ00 to FJ05 commits behind 13.0.0

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `d84b8dfd..9ac8222c`
**Not-opened:** `fusion-workbench/orchestrator-events.jsonl`, `fusion-workbench/`, `codec/fixtures/`, `codec/dist/fusion-record.js`, `hooks/dist/`, `codec/src/__tests__/`, `hooks/lib/__tests__/`, `codec/src/prior/blocks.ts`, `codec/src/prior/candidates.ts`, `codec/src/prior/packages.ts`, `codec/src/prior/campaign.ts`, `codec/src/prior/common.ts`, `codec/src/prior/types.ts`, `codec/schemas/record.schema.json`, `codec/schemas/package.schema.json`, `codec/schemas/evidence.schema.json`, `codec/schemas/workbench.schema.json`, `codec/schemas/campaign.schema.json`, `codec/schemas/migration-plan.schema.json`, `codec/schemas/migration-proposal.schema.json`, `codec/schemas/migration-receipt.schema.json`, `codec/contract/dependencies.json`, `codec/contract/prior-mapping.json`, `hooks/lib/work-graph.ts`, `hooks/scope.ts`, `bin/fusion-citation-sweep`, `skills/help/SKILL.md`, `skills/wp-order/SKILL.md`, `skills/migrate/SKILL.md`, `skills/setup/SKILL.md`, `README.md`
**Review domain:** code
**Work-item:** 260928-1338-json-control-data-and-markdown-artefacts
**Verdict:** revise. Nothing is High or Critical; 13.0.0 stands, and the findings go to 13.0.1 or later.

The range is the span from the package's filing to HEAD. The coverage tool reads 147 commits in it as covered by no earlier review, and they are interleaved with covered ones. The 83 that change a shipped file were reviewed against the tree they shipped in, `468d8e87` (`v13.0.0`). `git diff 468d8e87 9ac8222c` outside the workbench touches only `codec/fixtures/prior/REQUESTS.md`. The other 64 change only workbench records. They are declared here and were not opened.

## Summary

The codec core, its operations and migration, and the host helpers that 13.0.0 ships hold up on every path that Prior's qualification and the test suites exercise. The defects sit outside those recorded exchanges, in three places. The first is the filesystem shapes the codec meets on disk: a directory where a file should be, a path alias, a symlinked store. The second is two host recovery paths: archive `resume`, and the retry of the migration backup. The third is text that still describes code removed earlier. Ten issues were filed: 5 Medium, 5 Low.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 5 |
| Low | 5 |

## What was already qualified, and not re-derived

Prior qualified the codec bundle at its commit `34a2710`, recorded in `codec/fixtures/prior/REQUESTS.md` `### Prior's answer to 63 and 64 at 34a2710`. It covers:

- the shared fixture manifest: 370 cases, ten schemas compiling, the applied mapping ruling and the 13 Go-emitted goldens;
- 225 recorded exchanges, byte for byte, through Prior's `CodecProcess`: FJ01 6, FJ02 15, FJ02b 20, `initialize` 26, archive 51, migration 70, takeover 37;
- kernel recovery after the intent, after the control write and after the answer, including replay;
- the version boundary of the old bundle over the takeover workbench;
- fusion's codec suite, run independently.

Its digest `fb170361…` is the bundle that 13.0.0 ships. This pass therefore did not re-check schema conformance, recorded-session bytes or recovery replay. It probed inputs and paths that no recorded exchange reaches.

## Test runs on this pass

- `cd codec && CODEC_REQUIRE_GOLDENS=1 npm test`: 22 files, 1 810 tests passed, none skipped.
- `cd hooks && npm test`: 67 files passed and 1 skipped; 1 156 tests passed and 14 skipped.
- `codec/src/__tests__/committed-bundle.test.ts` already pins `codec/dist/fusion-record.js` to a fresh build of `git archive HEAD`.
- A `tsc --outDir` build of `hooks/` into the scratchpad was diffed against `hooks/dist/` and showed no difference.
- Fixture sample: all 361 files under `codec/fixtures/valid` and `invalid` are listed in `codec/fixtures/manifest.json`, and every manifest path exists.

## Findings by theme

### 1. The codec trusts the filesystem shape it reads

The codec checks that a path exists or stays inside the workbench by its text alone. It does not check what is actually at the path.

- **Medium. A narrative that is a directory or unreadable makes the bundle throw** (`261010-1045-a-narrative-that-is-a-directory-or-unreadable-makes-the-codec-throw-and-exit-1-for-every-workbench-wide-read.md`).
  - `codec/src/store.ts` `narrativeOf` guards only with `existsSync` and then calls `readFileSync`. Four lines above it, `storedHash` does guard with `isFile()`.
  - The run against the shipped bundle: `list`, `validate`, `reconcile`, `show`, and `set-dependencies` on any package each exit 1 with an `EISDIR` stack and no JSON.
  - Through `hooks/lib/scope.ts` the answer becomes `unanswered`, so `bin/fusion-paths` exits 3 and every agent's Setup halts. That is the widest impact of anything in this pass. It stays at Medium because the trigger needs an abnormal file on disk.
  - It is the third site of a class the closed fixes for `workbench.json` and `.json-state/` already met.
- **Medium. A `./` or `//` path alias passes the recovery-blocked gate** (`261010-1045-a-path-spelled-with-a-dot-or-empty-segment-passes-the-recovery-blocked-gate-and-overwrites-a-diverged-file.md`).
  - The `workbench_path` pattern admits `.` segments and empty segments.
  - `blockedOn` in `codec/src/kernel.ts` compares the path as a string, so the alias does not match the blocked entry.
  - In the run, the alias wrote over a diverged file. The canonical spelling of the same path was refused.
- **Medium. Containment is checked on the path text alone** (`261010-1045-containment-is-lexical-so-a-symlinked-store-sends-codec-writes-outside-the-workbench-and-list-never-sees-them.md`).
  - When a store is a symlink, `create` writes outside the root.
  - `list` and id resolution never see that record afterwards, but `show` by path still reads it.
- **Low. `scopeDir` reports every stat error as `scope-missing`** (`261010-1045-scopedir-reports-every-stat-error-as-scope-missing.md`).
- **Low. A `__proto__` key under `extensions` is lost on reserialisation**, through the object literal in `order()` (`261010-1045-a-proto-key-in-extensions-is-dropped-when-the-codec-reserialises-a-record.md`).
- **Low. A dead holder's lock stays live after a hostname change or PID reuse** (`261010-1045-a-crashed-holders-lock-is-never-judged-stale-after-a-hostname-change-or-pid-reuse.md`). The hostname case is inference and was not reproduced.

### 2. Host recovery paths that report or retry wrongly

- **Medium. Archive `resume` reports restored units as moved** (`261010-1045-archive-resume-reports-units-a-fallback-restored-as-moved-and-closes-the-inventory-moved.md`).
  - In `hooks/lib/record-archive.ts`, `carryOut` moves only the units still `planned`.
  - It then prints `moved=` for every unit and closes the inventory `moved`.
  - `/fusion:archive` copies those lines into the archive manifest. A probe test on a scratch export of 468d8e87 reproduced it.
- **Medium. One failed backup verification blocks every later migration run** (`261010-1045-a-migration-backup-that-fails-to-verify-once-blocks-every-later-run-and-no-message-names-the-way-out.md`).
  - `hooks/lib/legacy-repair.ts` `ensureBackup` copies over a stale `backup/` and fails the check again.
  - No message tells the user to remove the stale copy. Reproduced twice in a row.
- **Low. `/fusion:check` sends a migration's fence to `bin/fusion-archive` only** (`261010-1045-check-routes-a-migrations-fence-to-the-archive-helper-only.md`). `hooks/write.ts` already names the `bin/fusion-migrate` route.

### 3. Shipped text that outlived its code

- **Low. Several shipped texts state what the code no longer does** (`261010-1045-five-texts-shipped-in-13-0-0-state-what-the-code-no-longer-does.md`). The issue groups them in four points:
  - `circles` in the lost-marker store list, in three texts;
  - the "no skill calls it yet" headers of the archive helper;
  - the `README-hooks.md` row that still calls `reconcile` quadratic;
  - the `record-change.ts` claim that `rules/workbench-tracking.md` does not name its file.

## Cross-cutting observations

- **The same unguarded-read pattern keeps recurring.** `260930-1654_*`, `261001-0841_*_inspect-throws…` and `261001-0841_*_isregularfile-reads-every-stat-error…` fixed it one path at a time. The narrative, record and id walks still carry it, and `scopeDir` has its mirror image: catch everything and give it one meaning. A single guarded reader in `store.ts`, used by every walk, would close the class. A fourth point fix would not.
- **Path identity is decided by text in two places.** The `.`-segment alias and the symlinked store are the same gap. The codec has no canonical form of a path that it uses for containment, for the blocked-intent gate and for the walk alike. One canonicalisation at the entry point would close both issues.
- **The recorded sessions qualify the happy and refused paths that someone thought of.** Every Medium in this pass lies outside them. That is not a gap in Prior's qualification, whose scope is stated. It does mean the fixture corpus would gain most from adversarial filesystem cases.

## Not re-reported

Every finding above was checked against the issue store of this package, open and closed, and against the 17 earlier review files that cover parts of this range. The following candidates were seen and left out because they are documented or already filed:

- the replay of an `apply` after its rollback (documented in `codec/README.md`);
- the kernel taking no claim identity (by design; host side closed under `261001-0841_*_fusion-write-transition-into-claimed-writes-a-claim-for-any-checkout-past-the-ownership-binding.md`);
- evidence accepted on a drop (open, `261009-1037-transition-evidence-is-accepted-on-a-drop-where-the-codec-checks-no-binding.md`).

## What the not-opened list means

- `codec/fixtures/` was sampled and is exercised by the two suites.
- `codec/dist/fusion-record.js` is pinned by test to its source and qualified by Prior.
- `hooks/dist/` was compared by diff to a fresh build and not read.
- The test directories were run, not read.
- `fusion-workbench/` holds the records of the 64 workbench-only commits.
- The source files named in the field were not opened on this pass. Parts of them were reviewed in earlier passes of this package: `261004-1807`, `261005-1353` and `261009-1037`.
- Some files were opened only in part:
  - `codec/src/cli/ops.ts`: lines 1–170, 730–880 and 2140–2200 skimmed or not read;
  - `codec/src/migration.ts`: lines 1–380, 710–1150 and 1601–2080 not read;
  - `codec/src/cli/protocol.ts`: header only;
  - `codec/schemas/protocol.schema.json`: queried branches only;
  - `hooks/lib/legacy-import.ts`: lines 296–795 read;
  - `hooks/lib/legacy-repair.ts`: lines 350–429 read;
  - `hooks/citation-sweep.ts`: lines 540–1052 read;
  - `hooks/order.ts`: `main` read;
  - `bin/fusion-work-order`: exit table read;
  - `skills/check/SKILL.md`: lines 70–80 read;
  - `codec/README.md` and `README-hooks.md`: the rows the commits changed.

## Recommended sequencing

No release blocker. For 13.0.1:

1. The narrative-read throw, because it halts every agent on one bad file.
2. Archive `resume`, because it writes a wrong manifest.
3. The stale backup, because it blocks the migration that 13.0.0 requires.

The two path-identity issues go together as one change. The Low items are cleanup and can ride along.
