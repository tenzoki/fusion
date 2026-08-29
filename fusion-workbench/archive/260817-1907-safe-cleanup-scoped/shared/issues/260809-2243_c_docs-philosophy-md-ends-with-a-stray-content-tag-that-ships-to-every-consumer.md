# docs/philosophy.md ends with a stray `</content>` tag that ships to every consumer

---

**Severity:** Low — a stray markup token in a shipped document `/fusion:help` routes users to; it renders as raw HTML rather than as text, so most viewers show nothing and the file merely carries a line that means nothing
**Domain:** code
**Filed by:** coder (found while fixing the ping-back drift in the same file)
**Affects:** `docs/philosophy.md:52`
**Cross-references:** `43ee3b5` (the rewrite that introduced it), `260809-2047_*_three-shipped-documents-still-describe-ping-back-detection-as-a-live-guard-feature.md` (the ping-back drift in the same file, fixed without touching this line)

---

## What is wrong

The last line of `docs/philosophy.md` is `</content>`, with no opening tag anywhere
in the file. It is the closing half of a wrapper that was never meant to reach disk;
`git log -S` puts it in `43ee3b5`, the commit that rewrote the document, so it has
shipped in every release since.

It was left in place rather than removed with the ping-back correction, because that
change was scoped to three named lines in three documents and an unrelated edit in the
same commit would have hidden inside it.

## Suggested direction

Delete the line. Nothing else in the file refers to it.

## Acceptance criteria

- [x] `docs/philosophy.md` ends with the `/fusion:help` bullet and no markup token
      after it.
- [x] `grep -rn "</content>" docs/ skills/ agents/ rules/ README*.md` finds nothing.

---
**Reconciliation 260809-2252 (reconciler, domain `code`) — stays `_o_`, and the scope is one
site wider than the record's own body says.**

The defect is confirmed at HEAD: `docs/philosophy.md:52` is `</content>`, with no opening tag
in the file. But it is not the only one. `README.md:151` carries the identical stray tag, from
the identical commit — `git log -S'</content>' -- README.md` and the same query against
`docs/philosophy.md` both return `43ee3b5` and nothing else, so one wrapper leaked into both
documents the commit rewrote.

The record's `## What is wrong` names only `docs/philosophy.md`; its second acceptance
criterion already covers the wider case (`grep -rn "</content>" docs/ skills/ agents/ rules/
README*.md finds nothing`), so the criterion is satisfiable only by two edits, not one.
`README.md` is the more consequential of the two: it is the first surface a user reads.

Whole-tree check: those two lines are the only occurrences outside `fusion-workbench/`.

---
Resolved: deleted the stray `</content>` line from both documents — `docs/philosophy.md:52` and
`README.md:150`, the two sites the reconciliation note above names, and the only two in the tree
outside `fusion-workbench/`. The diff is exactly one deleted line per file (`git diff --stat`:
`2 files changed, 2 deletions(-)`); nothing else in either document was touched, and both still end
with a trailing newline after their own final content line. All three acceptance criteria re-checked
after the edit: `docs/philosophy.md` now ends with the `/fusion:help` bullet, `README.md` with its
`/fusion:cadence` paragraph, and `grep -rn "</content>" docs/ skills/ agents/ rules/ README*.md`
returns nothing (exit 1). Verification: `cd hooks && npm test` — exit 0, 39 files / 1040 tests, the
`430d73a` baseline unchanged, as expected for a change that touches no code.
Session `260810-1402`, task `I:260809-2243-stray-tag`; history at
`260810-1508-stray-content-tag-removal.md`.
