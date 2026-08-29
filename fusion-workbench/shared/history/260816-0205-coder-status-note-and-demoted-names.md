# coder — the activation note follows the write, and two demoted names leave README-agents

**Status:** Complete
**Date:** 2026-08-16
**Dispatched by:** orchestrator
**Files changed:** `skills/next/SKILL.md`, `README-agents.md`

---

## Task 1 — `skills/next/SKILL.md` Step 6.2 (issue `260816-0132_o_*`)

The block decided its note from `grep -qE '^\*\*Status:\*\* active$' "$REC"`, a file-wide test of
the output, while the prose beside it claimed the note came from the write's result. Three defects
followed, all three named in the record and all three now closed by one `awk` pass:

```
awk 'BEGIN{h=1} /^## /{h=0} h&&!n&&/^\*\*Status:\*\*/{print "**Status:** active";n=1;next} {print} END{exit n?0:9}'
```

- **Defect 1 (verification read the wrong thing).** The pass is bounded to the head block — it
  stops at the first `## ` heading, which every Circle record carries as `## Directive`. A
  `**Status:**` line quoted at column 0 inside a template fence further down is neither read nor
  rewritten. The bound is a heading rather than a fence because the block is itself inside a
  fenced `bash` block in the skill body, and a literal fence in the awk program would close it.
- **Defect 2 (note asserted an untested cause).** `case $?` branches on the pass's own status:
  0 the field was set, 9 the head block carried no `**Status:**` line, anything else the pass or
  its redirect failed. A failed write now reports a failed write.
- **Defect 3 (every matching line rewritten).** `!n` addresses the first match only.

The record's instruction to keep no `grep` guard in front of the rewrite is honoured: there is now
no separate test at all, in front or behind.

**Measured on nine fixtures** (scratchpad, commands verbatim from the edited block):
head field present → rewritten, no note; valueless `**Status:**` → rewritten, no note (the fix the
previous change made, preserved); metacharacters in the value → rewritten, no note; no head field
→ note, no write; no head field plus a column-0 `**Status:** active` inside a later section → note
fires and the quoted line is untouched; two head `**Status:**` lines → only the first moves;
read-only directory (redirect fails) → "rewrite failed", field unchanged, no `.tmp` left;
unreadable input → same. Also run against all 15 real `*_circle.md` records in this workbench:
each came back with exactly one `**Status:** active` line and no note.

The prose was rewritten to describe what the block does rather than what it was meant to do.

## Task 2 — `README-agents.md` (issue `260816-0139_o_*`)

`README-agents.md:71` and `:72` presented `/fusion:curate` as the acting surface. Both now read
`/fusion:cleanup --only claude-md`, the selector the cleanup skill actually accepts
(`skills/cleanup/SKILL.md:55`) and the form the same file already used at `:246`. The
`skills/curate/SKILL.md` section citations were kept — they still resolve.

Rows `:239`, `:240` and `:246` were left alone: they are slash-command table rows, each already
labelled with its pipeline step and selector, and the record names them as deliberately correct.

## Not done, and deliberately

The tracking record `260815-1633_*_eight-shipped-surfaces-still-present-the-three-demoted-skill-names-as-user-commands.md`
was not touched. Its residual table is fully done, but it never surveyed `README-agents.md:71-72`
and it still does not survey the three code-comment sites (`hooks/lib/events.ts:70`,
`hooks/lib/__tests__/monitor-warnings-panel.test.ts:508`, `.gitignore:69`). It is a reconciler
question, per the fix direction in `260816-0139_o_*` step 2.

## Verification

`cd hooks && npm test` — exit 1. Sole failure: `surface-growth-bound.test.ts > matches the
checked-in golden`, whose diff is entirely `agents/orchestrator.md` (+12) and
`agents/playmaker.md` (+90), a concurrent task's edit. Neither file is mine. All growth-*bound*
assertions passed; 763 of 764 tests passed.
