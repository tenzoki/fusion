Migrate's citation step bundles 302 rename repairs with 9,705 marker respellings, code and archive in one yes
---
`/fusion:migrate` Step 6 (`skills/migrate/SKILL.md:154–156`) runs `bin/fusion-citation-sweep --dry-run` and asks one yes/no before `--write --yes`. The sweep rewrites every kind at once: `record`, `package-record`, `package-dir` and `bare-record` (`hooks/dist/citation-sweep.js:154–172`). Its corpus is every `.md` under the workbench, `archive/` included, plus the project's `citations.extraPaths` (`bin/fusion-citation-sweep` header, "Corpus"). The sweep has no option to restrict it by kind or by subtree. So the user must accept the whole corpus-wide respelling, application code and ontology included, to repair the handful of citations the rename actually broke, or accept none of it. The step also does not show which part of the census is due to the migration.
---
**Filed by:** consultant, Kai Stalmann <ks@qantr.com>

**Evidence (consuming project axibra, plugin 12.0.0, dry-run census reported by the user 2026-09-28):**

```
files=2204 rewrites=10007 residual=24664 record=275 package-record=22 package-dir=5 bare-record=9705 stamp-bare=0 mode=dry-run
```

- Only `record` + `package-record` + `package-dir` = 302 rewrites touch a store segment, the thing the v12 rename changes. The 9,705 `bare-record` rewrites only respell a status marker to `_*_` and are unrelated to v12.
- The touched files included `codebase/go` (599 hits), `codebase/python` (27), `simulation/` (23), `tools/` (11), ontology YAML and the root `Makefile`, all reached through `citations.extraPaths`, plus `archive/` (909).
- `bare-record` respells pre-v4 bracket markers too. The migration leaves bracket-named files in frozen stores, so those respelled citations then resolve to nothing. The sweep's own header states this consequence and that decision `260830-1842_*_may-the-grammar-resolve-a-bracket-marked-record-that-a-frozen-store-keeps-permanently.md` is still open.
- The user was offered three improvised scopes by the running agent, one of which ("only `work-packages/` and `shared/`") the sweep cannot express.

**Where the fix should go (inference, for `code-implementer`, not a plan):** either a `--kinds` filter on the sweep, so Step 6 can offer the store-segment repairs (`record,package-record,package-dir`) on their own, or Step 6 asks only about those and names the marker respelling as a separate, later choice. In both cases Step 6 should split the census by workbench-internal vs `extraPaths` files and by `archive/` vs the rest before asking.

**Acceptance test:** on a fixture with store-prefixed and bare-marker citations, Step 6's offered write changes only store-prefixed tokens. The census shown before the question names the `extraPaths` and `archive/` shares separately. `npm test` stays green.

---
Resolved: bin/fusion-citation-sweep takes --kinds (census and write alike) and splits the census into scope=workbench, scope=archive and scope=extra-paths lines; /fusion:migrate Step 6 dry-runs, asks about and writes only record,package-record,package-dir, and names the bare-record respelling as a separate later choice. Fixture test in hooks/lib/__tests__/citation-sweep.test.ts.
