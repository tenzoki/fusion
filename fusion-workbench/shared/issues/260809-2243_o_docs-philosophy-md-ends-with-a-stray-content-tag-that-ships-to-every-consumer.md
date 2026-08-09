# docs/philosophy.md ends with a stray `</content>` tag that ships to every consumer

---

**Severity:** Low — a stray markup token in a shipped document `/fusion:help` routes users to; it renders as raw HTML rather than as text, so most viewers show nothing and the file merely carries a line that means nothing
**Domain:** code
**Filed by:** coder (found while fixing the ping-back drift in the same file)
**Affects:** `docs/philosophy.md:52`
**Cross-references:** `43ee3b5` (the rewrite that introduced it), `260809-2047` (the ping-back drift in the same file, fixed without touching this line)

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

- [ ] `docs/philosophy.md` ends with the `/fusion:help` bullet and no markup token
      after it.
- [ ] `grep -rn "</content>" docs/ skills/ agents/ rules/ README*.md` finds nothing.

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
