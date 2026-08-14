# Coder — Turn 6: the template drift check stops asking a question it cannot decide

**Date:** 2026-08-14
**Agent:** coder
**Circle:** `circles/260801-1244-curator`
**Turn:** 6
**Status:** Complete

## What was asked

Task T11, from `shared/issues/260814-2022_o_this-repository-cannot-set-its-own-turn-budget-because-a-test-pins-fusion-guard-json-to-the-template.md`,
option 1 of the three that record offers: compare this repository's root `fusion-guard.json`
with `templates/fusion-guard.json` with the project-configurable keys stripped from both
sides, so the drift check keeps the prose and the structure and admits the one key the file
exists to let a project set.

The other two options were not implemented and are not affected: option 2 (drop the
repository copy from the assertion) and option 3 (revert `maxTurns` to the default of 5).

## What changed

One file: `hooks/lib/__tests__/config.test.ts`.

**The exemption list**, `PROJECT_SET_KEYS`, holds the top-level keys a project is documented
to set for itself. Today it is `["orchestrator"]`. It is the single place the exemption is
stated: a key that becomes project-configurable later is admitted by adding it there and
nowhere else.

**The cut**, `withoutProjectSetKeys(text)`, removes those entries from the *source text* and
leaves every other byte where it was. It is a small JSON-aware scanner —
`findTopLevelKey` / `endOfEntryValue` / `cutTopLevelEntry` — rather than
`JSON.parse` + `JSON.stringify`, because the round trip would normalise away the
indentation, the blank lines and the key order, which are three of the four kinds of drift
the case exists to catch. The scan tracks string and nesting state, so the word
`orchestrator` inside the `_turnBudget` note is not mistaken for a declaration of it.

**The case** now reads:

1. `withoutProjectSetKeys(templateText)` must equal `templateText` — the cut is a no-op on
   the template, which declares no setting. This is the anti-vacuity half, and it is why the
   right-hand side of the real comparison can be the template's untouched text: a cut that
   silently ate shared prose would have to eat it here first.
2. The stripped copy must equal that untouched template text, as text (a readable diff on
   failure) and then as bytes against the template as read from disk (so the case still
   says something about bytes, not only about what decoded from them).

The comment above the case now states what is compared, what is deliberately not compared,
and why byte identity could not answer the question it was being asked — a documented change
and a stray edit are the same bytes. The `it(...)` description no longer claims byte
identity.

## Verification

Both directions, from `/Users/k1/Projects/productive/fusion/hooks`.

**Green, with the working tree's `fusion-guard.json` in place (carrying `"maxTurns": 12`):**

```
npm test   → exit 0    Test Files 49 passed (49)   Tests 1030 passed (1030)
```

**Red, with one character changed inside a shared prose note** (`compliance-guard
configuration` → `compliance-guarD configuration` in `_what`), the root copy restored
byte-identically afterwards:

```
npm test   → exit 1    Tests 1 failed | 1029 passed (1030)
                       FAIL lib/__tests__/config.test.ts > … > is what this repository's own
                       fusion-guard.json is, apart from the keys this repository sets for itself
```

Four perturbation classes were run against the targeted case
(`npx vitest run lib/__tests__/config.test.ts`), each restored afterwards. All four fail,
which is the whole point of the check surviving:

| Perturbation of the root copy | exit |
|---|---|
| one character changed inside the `_what` note | 1 |
| the `_guardEnabled` note removed | 1 |
| `_what` and `_override` reordered | 1 |
| one blank line removed between `_what` and `_override` | 1 |

Two shapes of the admitted key were also checked, both green, so the cut is not tied to the
one line this repository happens to have written:

| Shape of the `orchestrator` entry | exit |
|---|---|
| written across three lines | 0 |
| written as the last entry, after `_gitTracked` | 0 |

## Found, not anticipated by the record

**`lib/__tests__/fusion-commit-lock.test.ts` fails under full-suite load, and it is not
this change.** Measured at baseline: with the working tree's `config.test.ts` reverted to
HEAD, `npm test` reported **2** failures — the config case the record describes, and
`fusion-commit-lock.test.ts > … > a creator reaped between mkdir and its holder write loses
the acquisition`. That second one passes in isolation
(`npx vitest run lib/__tests__/fusion-commit-lock.test.ts` → exit 0) and failed in three of
six full runs here. Its poll window is 10 s for a 4 s stall, so a loaded machine can close
the window before the first observation. Several agents were writing to this repository
concurrently during those runs. Not filed as a defect: it is a timing assumption in a test,
and the evidence for it is a load condition I cannot yet characterise.

**A sibling agent's edits landed mid-verification.** `rules/fusion-workbench-conventions.md`
grew 160 bytes and `hooks/lib/__tests__/fixtures/rules-emission.golden` was regenerated
against it while these runs were happening; both appeared in `git status` between two of my
own commands. Neither is mine, and neither is part of this task's diff.
