The prior-commands watch list passes watch-listed commands in the form prior parts use most
---
`catalog/src/__tests__/prior-commands.test.ts` passes a literal watch-listed command inside `["bash", "-c", "..."]`, at a line start when a pipe or `;` follows it directly, and anywhere in a file that holds an exemption for that word. Severity: Medium; no live violation found, so this is what the guard would miss next.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer
**Cross-references:** 261105-1023-plan-fusion-13-4-2-corrected-candidate.md

**Evidence.** `POSITION`, `WATCH_RE` and `ARGV_RE`, copied verbatim into a scratch script and run on these strings. Every one returns no hit:

| Input | What it shows |
|---|---|
| `["bash", "-c", "mv a b"]` | `"` is no position, and `bash` passes as the first element. 97 spans in the `prior` parts have this `"bash", "-c"` form |
| `ls\|x`, `x; ls;` | The lookahead admits only space, tab, end of line, backtick and `)`, so a claimed position is missed when `\|`, `;`, `<`, `>` or `&` follows directly |
| `(cut -c1 x)`, `x <(sort y)`, `a & sort y`, `case x in a) sort y ;; esac` | `(`, `&` and a case arm are no positions |
| `elif grep -q x y`, `while grep -q x y`, `until grep -q x y` | `POSITION` names `if`, `then`, `do`, `else` only |
| `LC_ALL=C sort x`, `env sort x`, `command sort x`, `/usr/bin/sort x` | A prefix or a path hides the name |
| `[ "cat", "x" ]` | `ARGV_RE` needs `["` with no space |

Two more by reading the code:

- `exempted(file, hit)` compares a file and a word. A real `mv a b` inserted in `skill-archive/parts/37-prior.md` or `state-auditor/parts/18-prior.md`, or a real `shasum` in `skill-setup/parts/25-prior.md`, passes, and the row "every exemption still names something the file says" passes too.
- `withoutSanctioned` drops an `{{include ...}}` line without expanding it, so a rule included later with a fence is not read. Today's includes are `rules/user-facing-output.md`, which the measurement reports has no `bash` fence.

The inserted-violation rows cover only forms the regex already matches. The header's limit names a command outside the list or built at run time, and none of the above is either.

**Live state.** A looser scan of mine over the 357 non-held `*-prior.md` found only the exempt words, the binding sentence's `date` and `curl` in `skill-help/parts/19-prior.md`. That scan is a text scan too, so this is a floor.

**Fix direction.** Read the body of a `["bash", "-c", "..."]` span as commands. Widen the lookahead and the position list. Key an exemption on the exact span. Add a row per form above. Keep the header's statement that a text scan proves nothing about a built command.

**Acceptance.**

- Each input in the table is a hit, by a row in the test.
- A real command inserted in an exempted file is a hit, by a row in the test.
- The suite stays green on the current parts: `FUSION-CATALOG` exits 0.
