# Coder session — Step 3, provenance-header lint gate

**Date:** 2026-08-02 12:34
**Agent:** coder
**Status:** Complete
**Circle:** `circles/260801-1244-rule-provenance-header`
**Plan:** `circles/260801-1244-rule-provenance-header/planning/260802-1131_o_plan-rule-provenance-header.md` — Step 3, now `[DONE]`
**HEAD at start:** `c2c2a04` (Step 2)

## What was implemented

One new file, `hooks/lib/__tests__/provenance-header-lint.test.ts`, the fourth corpus-lint
gate in the suite. Nothing else changed: no rule file, no production module under
`hooks/lib/`, and none of the three sibling gates.

The gate follows the sibling shape (`path-literal-lint`, `marker-format-lint`,
`glob-nomatch-lint`): a `pluginRoot` from `import.meta.url`, a long header comment stating
what is protected and what is deliberately not, pure functions over strings so every fixture
is in memory, a `report()` producing the actionable message, and a `gatedFiles()` deriving
the corpus from `readdirSync` so a new rule file is in scope automatically.

Three declarations, none exported, exactly as the plan's Data Structures table specifies:

| Name | Value / type |
|---|---|
| `HEADER_WINDOW` | `10` |
| `HEADER` | `/^ {0,3}(?:> ?)?(?:\*\*)?Provenance:(?:\*\*)?(?=\s\|$)/` — copied verbatim from the plan, not re-derived |
| `headerLine(text)` | `(string) => number \| null` — the 1-based line number, not a boolean |

No exemption list, and the header comment says so and says why: every file in `rules/` is in
scope and the fix for a new file is a header, not an exemption. The comment also contrasts
this with the two sibling gates whose exemptions exist only because `setup` and `migrate`
must name a retired form in order to migrate away from it.

## Tests written — 24, all from the plan's list

*Corpus (2).* The whole corpus passes, with `report(missing)` as the failure message; plus
the non-vacuity assertion that `gatedFiles().length > 0`.

*Window (4).* Header at line 1, at line 3, and at line 10 accepted, each asserting the
returned line number rather than truthiness; at line 11 rejected. The line-11 fixture first
asserts the header really is the 11th element of the split, so the fixture cannot drift.

*Pattern (13).* Accepted: bold canonical, unbolded, blockquote with and without the space
after `>`, three-space indent, and the admission line verbatim. Rejected: four-space indent,
lowercase keyword, no colon, no separator after the keyword, the keyword mid-sentence, and
the real corpus prose carrying `pending-stefan provenance markers`. One further test reads
`rules/user-facing-output.md` and asserts that line is at 180, past the window — so the
rejection is shown on all three grounds the plan names (case, colon, position) rather than
only the two a standalone fixture can show. That test fails loudly if the corpus string ever
changes, which is deliberate: it keeps the fixture honest about being a real corpus line.

*The three negative fixtures (3).* No header at all; the only header at line 11; and
provenance-adjacent vocabulary (`**Cross-references:**`, `Binding decision:`) in the first
ten lines with no `Provenance:`. Each asserts `report(...)` output, not only the `null`.

*Real-file (2).* `rules/critical-stance.md` with its header line spliced out returns `null`,
and `report()` carries the filename, `first 10 lines`, and the verbatim admission wording.
Then the conventions file, with the plan's three ordered assertions: it passes on a line
inside the window; with that line removed the documentation of the rule is still present
below line 10 (the non-vacuity guard); and with that one line removed the file fails. That
last is the position rule earning its keep — a keyword-anywhere gate would have passed the
conventions file on its own documentation.

No fixture file was written to disk and no file was added to `rules/`.

## Verification

1. **`npx vitest run lib/__tests__/provenance-header-lint.test.ts --reporter=verbose`** —
   24 tests, 24 passed, 480ms. Landed green on the first run, as the plan predicted for an
   already-conforming corpus.
2. **`cd hooks && npm test`** — 17 test files, 777 tests passed, 20.05s. `tsc` ran first and
   succeeded (vitest only runs on `&&`). The suite grew by exactly one file and 24 tests
   against Step 1's recorded 16 files / 753 tests.
3. **Criterion 3 is about the message.** Six assertion sites call `report(...)`: the corpus
   test's failure message, the window-boundary test, all three negative fixtures, and the
   `critical-stance.md` injection test. Every failing-direction test asserts on the report
   text, not merely on a boolean.
4. **Scope.** `git status --porcelain` outside `fusion-workbench/` shows exactly one path,
   `?? hooks/lib/__tests__/provenance-header-lint.test.ts`. Nothing under `rules/`, `bin/`,
   `agents/`, `skills/`, or `hooks/lib/` outside `__tests__`.
5. **Sanity check from the plan:** `grep -c 'rules/'` on the new file returns 26 — the gate
   names its corpus repeatedly, in the comment, the file set, and the message.

## Not done

No commit. The user commits after verifying. Step 4, the acceptance sweep, is untouched.
