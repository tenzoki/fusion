The exhibit fencing blockquoted single list items and split nine Markdown lists
---
**Domain:** code
**Status:** open
**Severity:** Low
**Executor:** coder
**Filed by:** reviewer (closing pass `49ab50e4..e41e333f`, checkout `5e8248d7`, Kai Stalmann <ks@qantr.com>)
**Cross-references:** commit `78328863` (the fencing); `260922-1628_*_the-grammar-reads-the-bracket-marker-and-the-tree-is-swept-once.md` step 5 (the instrument it sanctioned)

---

## What is wrong

Step 5 of the bracket-citation package marked 28 exhibits so each would carry a `reason` before `bin/fusion-citation-sweep --write` ran. The mechanism works and the gates are green — `blockquoted = /^\s*>/.test(text)` (`hooks/lib/citation-scan.ts:1219`) accepts even the indented continuation lines, so every marked token is exempt and `rewrites=0`.

In **nine** records the instrument chosen was a `> ` prefix on **one item in the middle of a Markdown list**. A blockquote ends the list at that item and starts a new list after it, so a list that read as one block now renders as list / quotation / list.

The clearest case, `260717-1945-reconciliation.md:33-40`: a six-item list, five items inside a fence and the sixth left outside it, because only the five carried a bracket token.

The eight `> `-on-one-item cases, each in a list that continues on both sides:

| Record | Line | Shape broken |
|---|---|---|
| `260717-1959_*_plan-marker-format-underscore.md` | 33 | bullet 2 of a 2-item list |
| `260717-1959_*_plan-marker-format-underscore.md` | 119 | a `- Changes:` bullet between `- Files:` and `- Dependencies:` |
| `260717-1959_*_plan-marker-format-underscore.md` | 149 | the same, in step 5 |
| `260812-2136_*_the-citation-grammar-reads-one-ellipsis-and-one-marker-syntax-and-the-workbench-uses-two-of-each.md` | 24-31 | one blockquote split into two by the blank line between its paragraph and its list |
| `260812-1720_*_circle-first-placement-and-the-backlog-store.md` | 684 | ordered item 3 of 3, pulled out below items 1 and 2 |
| `260805-1839_*_kommentar-drift-in-den-beiden-bin-helfern-klammer-marker-und-veraltete-zaehlungen.md` | 6 | ordered item 2 of 3 |
| `260806-0022-coder-track1-vier-code-fixes.md` | 32 | bullet 4 of 5 |
| `260805-2353_*_plan-textschicht-gegen-code.md` | 151 | a `- Verification:` bullet between `- Dependencies:` and `- Falsifier:` |
| `260812-1720_*_the-reference-resolution-lint-does-not-scan-the-workbench-where-citations-are-densest.md` | 34 | bullet 3 of 6 |
| `260806-1154-coderev-implementation-vs-intention-textschicht-delta.md` | 23 | bullet 3 of 4 |

## What is NOT wrong

Nothing was deleted and no sentence was reworded, which is what `78328863`'s message claims and what holds under inspection. Where the exhibit sits in a **standalone paragraph** the blockquote is clean and should be left alone: the archived container record of `260717-1638-marker-format-ohne-glob-metazeichen` line 16, `260717-1959_*_plan-marker-format-underscore.md:9`, `260801-2038_*_tasklist-holds-a-fully-closed-queue-from-a-circle-closed-two-weeks-ago.md:5`, `260805-1841_*_wpr-und-migrate-falscher-mechanismus-fuer-prae-v4-pointer-ablehnung.md:3`, `260830-1842_*_may-the-grammar-resolve-a-bracket-marked-record-that-a-frozen-store-keeps-permanently.md:12`, and the whole-table case at `260816-0058-coder-setup-resume-bullet-and-probe-scope.md:76` (a table inside a blockquote renders as a table).

This is workbench content, not shipped material. It costs no gate and no information. It is filed because the package's whole mitigation was "no sentence is reworded" and the structure moved without being named.

## Secondary note, same cause

`hooks/lib/citation-scan.ts:980` documents the `blockquote` reason as **"another author's text"**. Five of the fenced sites are the record's own prose, including the `## Question` body of a deferred decision (`260830-1842_*_may-the-grammar-resolve-a-bracket-marked-record-that-a-frozen-store-keeps-permanently.md:12`), which now reads as a quotation of someone else. The plan sanctioned the instrument, so this is not a deviation from it — but the reason's stated meaning and its sanctioned use have drifted apart, and one of the two should move.

## Fix direction

For each of the eight one-item cases, replace the `> ` with an in-line announcement, which changes no block structure: the same commit already used one at `260812-1720_*_circle-first-placement-and-the-backlog-store.md:14` (`the pre-v4 bracket form (e.g. \`260717-1918[o]\`, thirteen times)`), and `announced-illustration` is a reason `hooks/lib/citation-scan.ts` already reports. For `260717-1945-reconciliation.md:33-40`, extend the fence to the sixth bullet so the list is one block again — the sixth line carries no bracket token, so fencing it changes nothing a gate reads.

Verify after each edit rather than at the end: an `e.g.` that the grammar does not read as an announcement turns the token back into a rewrite candidate and reddens the `rewrites=0` release gate.

## Acceptance

- No record in the table above carries a `> ` on a single item of a list whose neighbours are unquoted.
- `bin/fusion-citation-sweep --dry-run` still prints a summary beginning `files=0 rewrites=0`.
- `node hooks/dist/citation-check.js` still reads `verdict=clean` with `edited-violations=0`.
- `cd hooks && npm test` exits 0.
