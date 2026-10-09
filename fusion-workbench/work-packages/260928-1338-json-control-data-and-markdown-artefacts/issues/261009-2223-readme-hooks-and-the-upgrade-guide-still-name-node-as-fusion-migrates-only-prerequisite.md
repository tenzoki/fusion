README-hooks.md and the v13 upgrade guide still name Node as fusion-migrate's only prerequisite
---
`f2cc68f0` corrected `bin/fusion-migrate`'s header and `hooks/migrate.ts`'s: inside a git repository git is required, and a missing or refusing git is an exit 3. Two shipped copies of the old statement were not corrected. `README-hooks.md`'s roster row for `bin/fusion-migrate` still says "Plugin and Node only." and gives exit 3 as "install incomplete". `docs/upgrading-to-v13.md`'s machine-requirements line names Node alone.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Review domain:** code
**Severity:** Low
**Cross-references:** `261009-2223-reviewer-docs-only-release-candidate-5f7398c9.md`, `261009-2028-migrate-says-plugin-and-node-only-but-needs-git-inside-a-repository.md`, `261009-2040-migrate-skill-reads-a-missing-or-refusing-git-as-a-workbench-not-under-version-control.md`

**Evidence at `5f7398c9`.**

- `README-hooks.md` `### The bin/ helper roster`, the `bin/fusion-migrate` row: "It refuses with exit 4 before any read when `node` is missing or older than `codec/package.json`'s engines. Plugin and Node only. ... the exit table (0 done, 1 no workbench, 2 usage, 3 install incomplete, ...)".
- `docs/upgrading-to-v13.md`, the paragraph above `## What becomes JSON and what stays Markdown`: "**What v13 needs on the machine:** Node `>=20.12.0`, the `engines` floor ...".
- Against `bin/fusion-migrate` header: "Plugin and Node only outside a git repository. Inside one (a `.git` entry at or above the workbench) git is required too, and is asked." and exit 3: "Inside a git repository, a git that is missing or refuses (not installed, dubious ownership, killed) is an exit 3 naming the call and the reason."

The resolved issue's acceptance named only the two headers and the exit-3 row, so the README row and the guide were outside it. The skill's copy of the same omission is the cross-referenced skill issue's and is not repeated here.

**Acceptance.** The roster row and the guide's requirements line name git as needed when the workbench lies inside a git repository, and the roster's exit-3 gloss covers a missing or refusing git. `npm test` in `hooks/` exit 0 (growth bounds).
