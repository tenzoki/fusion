The recursion fix raises the repository's Node floor to 20.12, and no `engines` field anywhere declares a floor
---
`hooks/lib/__tests__/provenance-header-lint.test.ts:109` reads `e.parentPath`, a `fs.Dirent` property added in Node 20.12.0 / 21.4.0. `hooks/package.json` has no `engines` field and there is no root `package.json`, so nothing states a supported Node version. Add `"engines": { "node": ">=20.12" }` to `hooks/package.json`.
---
Verified: `node --version` in this repository is v24.2.0, so the code is correct here and `npm test` is green (17 files, 780 tests). The issue is the undeclared floor, not a present-day failure.

What changed. Before commit `cc004fc` the effective floor was whatever the devDependencies imposed — vitest 2.1 declares `^18.0.0 || >=20.0.0`. `cc004fc` introduced two newer APIs at `:106-109`: `readdirSync(dir, { recursive: true })` (Node 18.17.0) and `dirent.parentPath` (Node 20.12.0). Verified by grep that neither appears anywhere else under `hooks/lib/` — the recursive `mkdirSync` calls throughout the suite are the long-standing option of a different function and impose no such floor. So this Turn is what raised the floor.

Failure mode on an older runtime: on Node 18.17 through 20.11, `Dirent` carries `.path` rather than `.parentPath`, so `e.parentPath` is `undefined` and `join(undefined, e.name)` throws `TypeError [ERR_INVALID_ARG_TYPE]`. Loud rather than silent, which limits the damage, but the error names `join` and not the Node version.

What is not affected. `hooks/tsconfig.json` excludes `lib/__tests__`, so no test file is emitted into `hooks/dist/`, and `install.sh` ships no tests and requires no Node on the end user's machine. The exposure is a contributor running `npm test` on an older Node, nothing more. That is why this is Low rather than Medium.

A secondary observation, pre-existing and not filed separately: because `tsconfig.json` excludes `lib/__tests__` from the `tsc` step of `npm test`, and vitest transpiles without type-checking, no test file in this repository is type-checked. A `parentPath` typo would not be caught by the build even though `@types/node ^25.6.0` knows the property.

Scope: `hooks/package.json`. Node 18 reached end of life in April 2025, so a `>=20.12` floor costs nothing.

---
Resolved: b568ad9 — hooks/package.json declares engines node >=20.12.0, the release that added dirent.parentPath. The prior binding floor was vitest 2.1.9 admitting Node 18, where the property does not exist.
