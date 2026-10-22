hooks/package-lock.json is ignored and untracked, so npm ci cannot run in a clone, and codec/.gitignore says otherwise
---
`cd hooks && npm ci` in a fresh clone at `c8d5a6f1fa9633796a9b9cc0df83fd5fe1eec14c` exits 1: `npm error The npm ci command can only install with an existing package-lock.json`. The root `.gitignore` line 7 ignores every `package-lock.json`; `codec/.gitignore` negates it for the codec with the comment "This package commits its lock, as `hooks/` does (whose lock was force-added)". That comment is false: `git ls-tree v13.0.0 hooks/package-lock.json` and the same at C are empty, and `git log --diff-filter=ADR -- hooks/package-lock.json` is empty, so the file was never committed. Plan step 19's acceptance (`cd hooks && npm test` green) and step 20's measurement are reproducible from a clone only through `npm install`, which resolves versions the repository does not pin.
---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261012-2126-candidate-c-verification.md`

Evidence: `261012-2126-candidate-c-verification.md` finding 6, the procedural deviation; the `hooks-npm-ci.log` quoted there. The work tree holds an untracked lock pinning typescript 5.9.3 and vitest 2.1.9; `npm install` in the clone resolved the same two, so the suite ran on the same runner and compiler this time, by coincidence of the semver ranges rather than by a pin.

Fix, one of two: commit the lock through a `hooks/.gitignore` negation as `codec/` does, or correct the `codec/.gitignore` comment and document `npm install` for `hooks/`. The first is what the comment already claims.

Acceptance: `git clone <repo> t && cd t/hooks && npm ci` exits 0, or the comment in `codec/.gitignore` no longer claims the hooks lock is committed and the README that names `npm ci` for `hooks/` (if any) names `npm install`.

Resolved: 261022, plan `261022-1611-plan-prior-bundle-closing-review-follow-ups` step 14, by the first fix in a broader form: the root `.gitignore` no longer ignores `package-lock.json`, so every Node package's lock is tracked by one rule, and `codec/.gitignore` loses its negation and the false force-added comment rather than `hooks/` gaining one. `hooks/package-lock.json` (sha1 `421a8faf`) is unchanged and was shown consistent with `hooks/package.json` by `cd hooks && npm ci`, exit 0; `npm test` exit 0 in the work tree. It is untracked until the dispatcher commits it; the clean-clone `npm ci` acceptance is checked after that commit. `install.sh` copies `hooks/` whole, so installs gain the lock, which nothing reads at runtime.
