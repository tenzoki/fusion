# Coder session — T4-3, fold case on the protected-path check

**Date:** 2026-08-03 19:02
**Agent:** coder
**Circle:** `260801-1244-guard-rules-write` (Turn 1 of this session, the Circle's fourth)
**Task:** T4-3 — close the High protected-path bypass filed at
`260802-2320`, implementing the direction the user chose at
`260803-1419_*_how-should-the-protected-path-check-treat-the-case-of-a-path.md`
**Status:** Complete

---

## What was implemented

Unconditional case folding on the protected-path check, on both write surfaces. Option 1
of the decision record, taken as written: fold on every platform rather than only where the
filesystem folds, because a boundary that differs by platform has to be re-stated in every
document that describes it.

### Functions touched

| File | Change |
|---|---|
| `hooks/lib/paths.ts` | New `foldCase` (`toLowerCase`, not `toLocaleLowerCase`) and `matchesAnyFolded` (`matchesAny` with case folded on the path AND on every pattern). `matchesAny`, `collapseSegments` and `canonicalise` are unchanged in behaviour. |
| `hooks/guard.ts` | CHECK 2 calls `matchesAnyFolded` instead of `matchesAny`. One identifier; the import line changed with it. |
| `hooks/lib/bash-mutation-guard.ts` | `isProtected` calls `matchesAnyFolded` for both its passes. `ancestorOfProtected` folds `base` and each pattern's `literalPrefix` by hand — it is a raw `startsWith`, not a glob match, so it needed the fold applied explicitly or `rm -rf RULES` would have walked past a check `rm -rf rules` fails. The pattern is returned unfolded so the deny reason still names it as `hooks/config.json` writes it. |

### Why the grant side is unaffected

Three separate reasons, and the first is the load-bearing one.

1. **The fold lives at the MATCH, not at the normalisation.** `paths.ts` already carried one
   deliberate asymmetry: `collapseSegments` (protection) versus `canonicalise` (grant), where
   the trailing-separator strip belongs to the grant alone. `canonicalise` is *built on*
   `collapseSegments`, so folding inside either normaliser would have folded the grant too and
   lost that asymmetry in the opposite direction. The two sides already call different match
   functions, so that is where the second asymmetry was added: `matchesAnyFolded` for the
   protected set, plain `matchesAny` for `RULE_DIR_PATTERNS`. The trailing-separator behaviour
   is untouched, and a new unit case pins that neither normaliser folds.
2. **The exemption's only match site was not edited.** `rules-write-exemption.ts:379` still
   reads `matchesAny(canonical, RULE_DIR_PATTERNS)`. The classifier asks `opts.exempt` about
   `target.path` and `target.spelled`, both unfolded.
3. **Case was never the grant's question.** Gate 2 resolves through `realpathSync.native`,
   which applies the platform's own folding, so where the filesystem is case-insensitive the
   kernel has already settled it — and where it is case-sensitive, `RULES/x.md` is a different
   file and the grant should not cover it.

The visible consequence, measured rather than inferred: with the flag set, `Edit RULES/x.md`
now denies while `Edit rules/x.md` allows, on a filesystem where both name one file. The
protected set widened and the exempt set did not. It is written into
`rules-write-exemption.ts`, `paths.ts`, `README-hooks.md` and
`rules/protected-path-discipline.md` rather than left to be discovered.

---

## Before / after, real guard subprocess, one fresh project per row

`FUSION_GUARD_ENTRY` default (`tsx guard.ts`). Every row is its own throwaway project —
three denials halt the guard and every later row would then deny as `[HALTED]` for the
wrong reason.

### The issue's table

| Case | Before | After |
|---|---|---|
| `Edit agents/coder.md` | DENY | DENY |
| `Edit AGENTS/coder.md` | allow | **DENY** |
| `Edit HOOKS/config.json` | allow | **DENY** |
| `Edit Rules/x.md` | allow | **DENY** |
| `rm AGENTS/coder.md` | allow | **DENY** |

### The rest of the list, and the shell

| Case | Before | After |
|---|---|---|
| `Edit Agents/Coder.md` | allow | **DENY** |
| `Edit SKILLS/demo/SKILL.md` | allow | **DENY** |
| `Edit Settings.json` | allow | **DENY** |
| `Edit BIN/Monitor` | allow | **DENY** |
| `Edit .Claude-Plugin/Plugin.json` | allow | **DENY** |
| `Edit fusion-workbench/.GUARD-STATE/escalation.json` | allow | **DENY** |
| `mv RULES/x.md /tmp/gone` | allow | **DENY** |
| `rm -rf RULES` (first pass, trailing-separator retry) | allow | **DENY** |
| `rm -rf HOOKS` (ancestor pass) | allow | **DENY** ("CONTAINS a protected path") |
| `cp /tmp/x HOOKS/` (ancestor, writing into) | allow | **DENY** |
| `echo x > Agents/coder.md` (redirection) | allow | **DENY** |
| `cd AGENTS && rm coder.md` (tracked cwd) | allow | **DENY** |

### Controls — nothing moved that should not have

| Case | Before | After |
|---|---|---|
| `Edit rules/x.md`, `Edit agents/`, `Edit rules/`, `Edit skills/` | DENY | DENY |
| `rm -rf rules/` (no flag) | DENY | DENY |
| `Edit notes.txt`, `NOTES.txt`, `build/out.js`, `BUILD/OUT.JS` | allow | allow |
| `rm -rf node_modules`, `NODE_MODULES`, `hooks/dist`, `docs` | allow | allow |
| `Edit rulesdraft/x.md`, `RULESDRAFT/x.md` | allow | allow |
| `mv rules/x.md rules/retired/` **[flag]** | allow | allow |
| `Edit rules/x.md` **[flag]**, `Edit rules/new.md` **[flag]** | allow | allow |
| `rm -rf rules/` **[flag]**, `rm -rf rules` **[flag]** | DENY | DENY |
| `Edit agents/coder.md` **[flag]** | DENY | DENY |
| `Edit rules/a/../x.md` **[flag]** (gate 0) | DENY | DENY |
| `Edit RULES/x.md` **[flag]** | allow | **DENY** — the grant did not widen |

---

## What the fold costs, measured on a case-sensitive filesystem

Not reasoned about. A 200 MB case-sensitive APFS disk image was created with
`hdiutil create -fs "Case-sensitive APFS"`, every throwaway project was built on it, and the
probe asserted from inside a project that `agents/coder.md` and `AGENTS/coder.md` both exist
with different contents before running a single row. (The image was detached and deleted
afterwards.)

```
filesystem is case-sensitive (both files distinct): true

Edit agents/coder.md                       DENY    correct deny
Edit AGENTS/coder.md                       DENY    OVER-BLOCK: a real second file
Edit rules/x.md                            DENY    correct deny
Edit RULES/x.md                            DENY    OVER-BLOCK: a real second file
Bash rm -rf RULES                          DENY    OVER-BLOCK: a real second directory
Bash rm RULES/x.md                         DENY    OVER-BLOCK: a real second file
Edit notes.txt                             allow   untouched
Edit NOTES.txt                             allow   untouched
Bash rm -rf BUILD                          allow   untouched
Edit RULESDRAFT/x.md                       allow   untouched
GRANT Edit rules/x.md [flag]               allow   grant unchanged
GRANT Edit RULES/x.md [flag]               DENY    grant does NOT widen
GRANT mv rules/x.md rules/retired/ [flag]  allow   grant unchanged
```

So the accepted cost is exactly four denials in a project that deliberately keeps both
spellings of a protected path, and nothing else moves. That is the trade the decision record
took.

---

## Documentation

Three shipped surfaces described the check as purely textual. All three corrected in this
change, none of them with a completeness claim.

- **`rules/protected-path-discipline.md`** — new subsection `### The match is textual, and
  case-insensitive` under `## The rule`, placed before the verb families so it is read as a
  property of the list rather than of any one verb. States the fold, that it is
  unconditional, the over-block cost with the case-sensitive measurement, and that the
  exemption does not fold. The file was read at its current state (`ce7a125` + `a79ff1a`),
  not at any earlier version. The installed copy at `~/.fusion/rules/` is stale by both
  commits and was not used.
- **`README-hooks.md`** — new `**How a path is matched.**` pair of paragraphs in the
  configuration section, above the halt paragraph, so it covers both surfaces at once rather
  than living inside the shell-specific section.
- **Module docstrings** — `paths.ts` (module header rewritten around the now-two
  asymmetries; a `## CASE is not folded here` section on `collapseSegments` saying why the
  fold is not in the normaliser; a full `matchesAnyFolded` docstring citing the decision
  record), `guard.ts` (header item 2 and an inline note at CHECK 2),
  `bash-mutation-guard.ts` (a `## The match folds case` section and a docstring on
  `isProtected`), `rules-write-exemption.ts` (a `### The same asymmetry, in the second
  dimension: CASE` section beside the existing trailing-separator argument).

---

## Tests

`npm test` green: **1146 passed, 24 files** (`tsc` + vitest). Baseline before this task was
1098; **48 cases added**.

| File | Added | What |
|---|---|---|
| `lib/__tests__/paths.test.ts` | 14 | `foldCase` (4), `matchesAnyFolded` (7), `matchesAny` stays case-sensitive (1), neither normaliser folds (2) |
| `lib/__tests__/guard-case-folding.test.ts` (new) | 33 | Both surfaces end-to-end against the real guard subprocess, one fresh project per case, every deny asserted NOT to be `[HALTED]` |
| `lib/__tests__/guard-bash-wiring.test.ts` | 1 | Source-level pin that CHECK 2 calls `matchesAnyFolded`, and that the plain `matchesAny` is not what reads `config.guard.protectedPaths` |

One existing case was updated rather than added: the wiring test's ordering assertion
searched for the literal `matchesAny(filePath` and now searches for `matchesAnyFolded(filePath`.

**Anti-vacuity check.** With `foldCase` stubbed to the identity function and nothing else
changed, **36 of the 48 new cases fail** (30 of the 33 in `guard-case-folding.test.ts`, 6 of
the 14 in `paths.test.ts`). The 12 that still pass are the controls — ordinary work still
allowed, the grant still granted, the trailing-separator asymmetry still held — which is what
they are for, plus the one wiring case, which is a source grep and cannot fail on a runtime
stub.

One bound is pinned as its own case rather than left implicit: `agents/**` compiles to
`^agents/.*$` and `.*` is case-blind, so `agents/CODER.MD` was **already** denied at HEAD.
Only the literal segments of a pattern ever missed. Every row in the new integration table
allowed before the change; `agents/CODER.MD` was deliberately excluded from it.

---

## Residuals

- **`config.ts findRelevantDecisions` (`guard.categoryPaths`) and `tracker.ts` noise
  filtering still match case-sensitively.** Both call the unfolded `matchesAny`. Deliberate
  and stated in the `matchesAny` docstring rather than silently left. It is **unreachable at
  HEAD**, not fixed: the shipped `hooks/config.json` has `categoryPaths: {}`, and no
  per-project config loader exists yet (that is this Circle's plan Step 6, unbuilt — I
  grepped for a `fusion-guard.json` reader in `hooks/lib/config.ts` and there is none). When
  Step 6 lands, a differently-cased path would escape a decision-governed escalation the way
  it used to escape protection. It wants a decision rather than a copied line: both sides of
  a `categoryPaths` match are authored by the same project, which is not the situation
  `protectedPaths` is in.
- **Unicode folding is `toLowerCase`, which is not the same table APFS uses.** `toLowerCase`
  is the Unicode default mapping; APFS folds with its own table and HFS+ folded with another.
  The two agree on ASCII, and every pattern in `guard.protectedPaths` is ASCII, so no shipped
  pattern can diverge. A consuming project that put a non-ASCII path on its protected list
  could in principle find a spelling that the filesystem folds together and `toLowerCase`
  does not. Not measured — I have no case-folding-divergent pair to hand — so this is stated
  as an argument from the two folding definitions, not as a measurement.
  `toLocaleLowerCase` was rejected deliberately: under a Turkish locale it maps `I` to a
  dotless `ı`, which would make the boundary move with `LANG`.
- **The symlink residual is untouched and still true.** The protection side is textual, so
  `ln -s ../agents/coder.md build/alias` followed by a write through the alias still allows.
  Folding case does not narrow that, and the residual list in both documents still says so.

---

## Scope kept

Not touched, as the task directed: `hooks/lib/fs-locator.ts` (issue `260803-1251`, task
T4-4), the working-directory model rewritten in `a79ff1a`, the redirection residual
`260803-1835`.

`hooks/dist/` tracked files restored to HEAD after the final run (`npm test` runs `tsc` and
rebuilds them). Four untracked `dist` files that predate this session — `fs-locator.*`,
`rules-write-exemption.*` — were left as they were. No rebuild, no version bump: plan Step 10
owns both. No commit.

## Left for the orchestrator

- `260802-2320_*_…` — the bypass is closed; the marker flip to `_c_` and the
  `Resolved:` note want the commit hash this session does not have yet.
- `260803-1419_*_…` — `## Realisation` still says "Not implemented". The `_a_` →
  `_i_` transition and its `Implemented: <hash>` line need the same hash. Deliberately not
  written here rather than written with a citation that would not resolve — this Circle has
  already produced one of those.
