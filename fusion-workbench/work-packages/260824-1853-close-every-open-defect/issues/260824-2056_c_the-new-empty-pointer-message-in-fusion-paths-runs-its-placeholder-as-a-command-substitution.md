The new empty-pointer message in `bin/fusion-paths` runs its placeholder as a command substitution
---
`bin/fusion-paths:262` (commit `1ea8fed`, step 7) replaced a live Circle name in the stderr text with the placeholder `` `<YYMMDD-HHMM>-<slug>` ``, but the whole message sits inside a double-quoted bash string, where backticks are command substitution. Bash tries to execute `<YYMMDD-HHMM>-<slug>`, prints `command substitution: line 262: syntax error near unexpected token 'newline'`, and the placeholder vanishes from the message: the user reads `It must hold the active Circle's directory name (, one line, no trailing path)`. Exit stays 3, so `fusion-paths.test.ts` "rejects an empty pointer file" (`hooks/lib/__tests__/fusion-paths.test.ts:459`) passes: it asserts non-zero exit and empty stdout, never the stderr text.
---
**Filed by:** coderev (person half absent: the installed plugin at `$FUSION_PLUGIN_ROOT` carries no `bin/fusion-identity`, so attribution was dropped rather than composed)

Reproduced on 260824 in a scratch workbench with an empty `.active-circle`: `fusion-paths coder` prints the two syntax-error lines and the truncated message, exit 3.

Fix direction: escape the backticks (`\``) or drop them and write the placeholder bare; and give the empty-pointer test one `expect(r.stderr).toContain("<YYMMDD-HHMM>-<slug>")` so the message is pinned. The `Resolved:` note the step wrote for row 72 (`260818-0715_*_four-shipped-surfaces-use-a-real-fusion-circle-directory-name-as-the-format-example.md`) says only that the pointer message shows the placeholder; it does not, and that record is still open for steps 10 and 13, so this is filed beside it rather than appended.

Severity: High. A shipped helper's only stderr for a user-fixable fault now leads with a bash syntax error.
---
Resolved: fixed — the placeholder is written bare inside the double-quoted string, and the empty-pointer test now asserts the stderr text carries `<YYMMDD-HHMM>-<slug>`; `bin/fusion-paths:262`, `hooks/lib/__tests__/fusion-paths.test.ts` "rejects an empty pointer file"
