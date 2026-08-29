# Turn 3 — three Turn-2 review follow-ups

**Status:** Complete
**Agent:** coder
**Circle:** `260801-1244-rule-provenance-header`
**Timestamp:** 260802-1408-coder-turn3-review-followups.md

## What was done

Three findings from the Turn 2 review, all introduced by the Turn 2 fix pass. Three files
touched, no behavioural change to shipped code.

### 1 (Medium) — `CLAUDE.md` exclusivity overclaim

Issue: `260802-1343_*_claude-md-parenthetical-claims-provenance-is-the-only-subject-outside-the-workbench.md`

`CLAUDE.md:30` claimed the provenance headers were "the one subject it governs outside
`fusion-workbench/`". Verified the reviewer's four counter-examples by reading
`rules/fusion-workbench-conventions.md` at HEAD, then deleted the parenthetical. No reason
to keep a softened form: the conventions lede (`:5`) already carries the correct
non-exclusive scope, so the two documents now agree without `CLAUDE.md` re-stating it.

Counter-examples confirmed (line numbers as read, not as cited):

| Subject | Line | Governs |
|---|---|---|
| Path-literal rule (lede, para 2) | `:7` | `agents/*.md`, `skills/*/SKILL.md`, `bin/fusion-paths` |
| `## Path Resolution` | `:89` heading, `:91` claim | same surface |
| `## Project language` | `:218` heading, `:220` claim | `CLAUDE.md` itself |
| `## Security` | `:600` heading, `:602` claim | every `.secret` file in the project |

The issue cites the Security text as `:601`; it is at `:602` (`:601` is the blank line
under the heading). The section is real and the point stands.

Enforcement half of the path-literal claim also confirmed:
`hooks/lib/__tests__/path-literal-lint.test.ts:145,150` builds its file set from
`agents/*.md` and `skills/*/SKILL.md`.

### 2 (Low) — stale flat glob in the corpus test

Issue: `260802-1344_*_corpus-test-name-and-vacuity-message-still-say-rules-star-md-after-the-set-became-recursive.md`

`hooks/lib/__tests__/provenance-header-lint.test.ts` `:160` (the vitest runner line) and
`:175` (the vacuity-guard message) said `rules/*.md`; `gatedFilesUnder` has recursed since
`cc004fc`. Both now say `rules/**/*.md`. Chose the glob over prose so the two strings stay
one line each and match how the repo writes globstar patterns elsewhere; the fuller "at ANY
depth" explanation already sits in the file's own header comment at `:21`.

### 3 (Low) — undeclared Node floor

Issue: `260802-1345_*_the-recursion-fix-raises-the-node-floor-to-20-12-and-no-engines-field-declares-it.md`

Added `"engines": { "node": ">=20.12.0" }` to `hooks/package.json`.

Existing floor, read rather than assumed (`node -e` over each installed dependency's
`package.json`): vitest 2.1.9 `^18.0.0 || >=20.0.0`, tsx 4.23.1 `>=18.0.0`, typescript
5.9.3 `>=14.17`, `@types/node` 25.9.5 none. So the binding floor was vitest's, which admits
Node 18. `dirent.parentPath` (test file `:109`) landed in 20.12.0 and does not exist on the
18 branch at all, so `>=20.12.0` is the value the code actually requires. Semantically
identical to the issue's recommended `>=20.12`, written as a full triple to name the exact
release that added the property.

Not raised further (e.g. to `>=22`): the field states what the code needs, and a
contributor on 20.12+ runs the suite fine.

## Verification

- `grep -n 'rules/\*\.md' hooks/lib/__tests__/provenance-header-lint.test.ts` → no match (exit 1)
- `hooks/package.json` parses; `engines` reads `{"node":">=20.12.0"}`
- `cd hooks && npm test` → 17 files, **780 passed**, 20.45s. No npm engine warning or
  failure: there is no `.npmrc` in the repo or under `hooks/`, so `engine-strict` is off,
  and the local runtime (v24.2.0) satisfies the range regardless.
- `git status --porcelain` outside `fusion-workbench/` → exactly three paths:
  `CLAUDE.md`, `hooks/lib/__tests__/provenance-header-lint.test.ts`, `hooks/package.json`

Not committed (per instruction). Issue files left untouched for the orchestrator to close.

## Files changed

- `/Users/k1/Projects/productive/fusion/CLAUDE.md`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/provenance-header-lint.test.ts`
- `/Users/k1/Projects/productive/fusion/hooks/package.json`
