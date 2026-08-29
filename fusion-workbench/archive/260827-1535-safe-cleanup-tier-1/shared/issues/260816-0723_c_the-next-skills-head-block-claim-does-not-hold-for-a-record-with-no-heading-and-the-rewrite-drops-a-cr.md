The next skill's head-block claim does not hold for a record with no heading, and the rewrite drops a CR
---
`f77633f` replaced the `sed` + `grep` pair in `/fusion:next`'s activation block with one `awk` pass. The
prose beside it states a bound the program does not have in one input shape, and the pass has a small
line-ending side effect neither the prose nor the commit message mentions.
---
**Severity:** Low — both are bounded. All fifteen Circle records in this workbench carry a `## ` heading,
and the `!n` first-match guard limits the damage even without one. Filed because the sentence is the only
statement of the bound a reader gets.
**Domain:** code
**Filed by:** coderev, session `260816-0713-coderev-turn-5-6-range-3a0408a-f77633f.md`, reviewing range `3a0408a..f77633f`
**Owner:** coder
**Affects:** `skills/next/SKILL.md` (the activation block and the paragraph under it)

## Measured on fixtures with the shipped command

| input | exit | result |
|---|---|---|
| Status in head block, `## ` heading below | 0 | field set — correct |
| Status is the last line, no trailing newline | 0 | field set, newline added — correct |
| CRLF file | 0 | field set, **the rewritten line alone loses its CR** |
| no Status anywhere | 9 | note, `.tmp` removed — correct |
| Status only after the first `## ` | 9 | note — correct |
| empty file | 9 | note — correct |
| **no `## ` heading at all**, two Status lines | 0 | first set, second untouched |

The last row is the one the prose overstates. `skills/next/SKILL.md`:

> The pass **stops at the first `## ` heading** and rewrites only the first match before it, so a
> `**Status:**` line quoted in a template block further down is neither read nor touched.

With no `## ` heading in the file, `h` never leaves 1 and the whole file is the head block. What actually
protects the template line is the `!n` guard, not the bound the sentence names. The bound is also literal
`^## ` — a record whose first heading is `# ` or `### ` does not close the head block either.

Verified against the real input: all 15 `*circle.md` records in this workbench carry `**Status:**` at line
5 and their first `## ` at line 12-14, so the shipped path is safe today. `f77633f`'s commit message says
so; the skill body does not.

## The CR

On a CRLF record the rewritten line is emitted as `**Status:** active\n` while every other line keeps its
`\r\n`, producing a mixed-ending file. Harmless to every consumer named in the tree, and worth one clause.

## Fix

State the guard that actually holds ("the first match in the file, and never past the first `## `
heading"), or bound the head block on `^#` so a record with any heading closes it.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `skills/next/SKILL.md:218` and `:226` still carry the same one-liner and the same prose. Both halves reproduce on a CRLF fixture with no heading: the protection comes from the line guard rather than a heading stop, and the rewritten line loses its carriage return. Marker stays open. Log: `260817-1836-reconciliation.md`.

---
Resolved: The subject was deleted rather than corrected. `95bebe1` ("feat(circles): the record's
Directive is a pointer once a spec exists, and prose gains a writer") removed the `**Status:**` head
field from the Circle-record template, and with it the entire `awk` pass in `/fusion:next`'s activation
block that both halves of this record are about. At HEAD `e435f03` `skills/next/SKILL.md` contains no
`awk` at all; section 6.2 is a bare `mv`, and `:224` now states positively that there is no
`**Status:**` field to set. Neither the overstated heading bound nor the dropped CR has a code path
left to occur in. Verified by `grep -n awk skills/next/SKILL.md` (no match) and by reading `:215-232`.
Closed by reconciliation 260819-1400.
