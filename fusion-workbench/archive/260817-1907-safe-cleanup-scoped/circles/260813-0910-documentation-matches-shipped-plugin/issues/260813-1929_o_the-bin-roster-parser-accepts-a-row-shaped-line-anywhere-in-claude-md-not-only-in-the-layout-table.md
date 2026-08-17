The bin/ roster parser accepts a row-shaped line anywhere in CLAUDE.md, not only in the Layout table

---
`documentedRows()` in the new lint block scans the whole of `CLAUDE.md` for lines matching `` | `bin/<name>` | ``. Its test name, its assertion messages and its comments all say "Layout table", but nothing anchors it to that table. A helper documented in the wrong table — or in a stray row appended anywhere in the file — reads as documented, and the resulting failure message would name a table the row is not in.
---

## Both sides read

**Artifact side**, `hooks/lib/__tests__/derivable-enumerations-lint.test.ts:445-448`:

```ts
function documentedRows(text: string): string[] {
  return [...text.matchAll(/^\| `bin\/([A-Za-z0-9._-]+)` \|/gm)].map((m) => m[1]);
}
```

Called as `documentedRows(read("CLAUDE.md"))` — the whole file, no section slice. The block's comment at `:441-444` says "Anchored to the table's row shape", which is accurate and is the narrower claim; the test name at `:432` and the assertion messages at `:470-486` say "Layout table", which is not what is checked.

## Verified by mutation

In a scratch copy of the tree, the `bin/fusion-plane` row was deleted from the Layout table and a same-shaped line appended to the very end of `CLAUDE.md`, past the troubleshooting table:

```
| `bin/fusion-plane` | a row in the troubleshooting table |
```

`npx vitest run lib/__tests__/derivable-enumerations-lint.test.ts` → **21 passed, 0 failed.**

## What the block does get right, checked the same way

Three mutations were run against the same scratch copy and each failed loudly, so the gap above is the only silent pass found:

- **Table reshaped** (`| `bin/x` |` → `` |`bin/x`| ``): the non-vacuity assertion fires with its own message, and the "mutation check" fixture passing alongside it is harmless, because the corpus test is the one that carries the floor.
- **A `bin/` file deleted with its row left**: reported as "CLAUDE.md's Layout table has a row for bin/fusion-turn-budget but that file does not exist".
- **A row duplicated**: reported as "CLAUDE.md's Layout table has 2 rows for bin/fusion-plane".

So the deliberate coupling to the row shape works as documented; only the section scope is looser than every message claims.

## Scope

`hooks/lib/__tests__/derivable-enumerations-lint.test.ts` only. Low severity: the mutation is contrived, and any realistic drift (a helper added, a helper removed, the table reworded) is caught.

## Recommended fix direction

Slice `CLAUDE.md` to the `## Layout` section before matching — from the `## Layout` heading to the next `^## ` — and assert the slice is non-empty, so a renamed or moved heading fails loudly the way a reshaped row already does. Alternatively, drop "Layout" from the test name and messages and say "CLAUDE.md" instead, which makes the messages true without changing the check.

Filed by: coderev (review of Circle Turn 1, range `6590cd5..79ec7bb`, commit `79ec7bb`).

---
Reconciled: 260813-2258 — Still open, re-verified at HEAD `c0e4219`: `derivable-enumerations-lint.test.ts:453` matches `^| \`bin/…\` |` over the whole file and is called as `documentedRows(read("CLAUDE.md"))` at `:482` and `:493` — no `## Layout` slice. The check itself is sound: `ls bin | wc -l` = 15 and the parser finds 15 rows, both directions agreeing.
