The citation-rooting commit and its own record both say seven citations, and there are eight

---

Commit `63deec1` states *"all seven citations carry it"* and *"the seven citations dropped out of its
existence check"*. Issue `260810-2029` repeats the number twice. The actual count is **eight**.

---

**Measured.** `ROOT_VAR_RE` (`hooks/lib/__tests__/reference-resolution-lint.test.ts:212-213`)
recognises `$FUSION_PLUGIN_ROOT` and `$CLAUDE_PLUGIN_ROOT` only. Running that regex over both files
at each end of the range, filtered to `agents/*` targets:

| Revision | `skills/setup/SKILL.md` | `skills/next/SKILL.md` |
|---|---|---|
| `da8c9db` | 5 | 3 |
| `b3cc034` | 0 | 0 |

The eight sites at HEAD are `skills/setup/SKILL.md:220,238,239,254,260` and
`skills/next/SKILL.md:115,121,185`. Two of them (`setup:260`, `next:121`) are the `SEC=` shell lines,
which the old spelling covered exactly as the prose ones did.

Seven is not the prose-only count either: that is six.

**Why it matters more than one digit.** This range exists to repair two false claims the Turn-1
review found in commit messages, and `260810-2029`'s own thesis is that a gate's coverage shrank
silently. The size of that shrinkage is the record's only quantitative claim, and it is wrong. A
later reader who adds `FUSION_SRC` to `ROOT_VAR_RE` and then counts the restored sites will find one
more than the record led them to expect, and has no way to tell whether the extra one is a new
citation or a miscount.

**Fix.** Correct the number in `260810-2029` (and note the correction rather than overwriting, since
the record is closed-by-append in this workbench's style). Nothing in the shipped tree changes.

**Cross-references.**
`shared/issues/260810-2029_o_seven-citations-left-the-reference-lints-existence-check-when-they-gained-a-second-root-variable.md`;
`hooks/lib/__tests__/reference-resolution-lint.test.ts:207-213`.

**Filed by:** coderev, review of session `260810-1646` Turn 2, range `da8c9db..b3cc034`.
