The prior-commands watch list still passes env with an assignment, timeout, sh -c, bash -lc, eval and a quoted assignment
---
The rewritten test meets its issue's whole table. Other literal forms still return no hit, and the header's limit does not name them. Severity: Low; no live use, and the test is not in the payload.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer, in the next candidate
**Cross-references:** 261105-1113-the-prior-commands-watch-list-passes-watch-listed-commands-in-the-form-prior-parts-use-most.md; 261105-1023-plan-fusion-13-4-2-corrected-candidate.md

**Bundle bytes:** no. `catalog/src/__tests__/prior-commands.test.ts` is not in the tarball. The plan's step 8 still counts `catalog` as a path that holds still after C″, so this waits for the next candidate.

**Evidence.** `POSITION`, `PREFIX`, `WATCH_RE`, `ARGV_RE` and `BASH_C_RE` read out of the test at C″ and run. Each returns no `commandHits` hit:

| Input | What hides the name |
|---|---|
| `env FOO=1 sort x`, `env -i sort x`, `command -p sort x` | `PREFIX` takes assignments before a wrapper and no option or assignment after it |
| `VAR="a b" sort x` | the assignment's value stops at the first space |
| `timeout 5 mv a b` | `timeout` is no wrapper. The image analysis' own scan does list it |
| `sh -c 'mv a b'`, `bash -lc 'mv a b'` | only a literal `bash -c` is a position, though `["bash", "-lc", "…"]` is read |
| `eval "mv a b"` | a quoted command is no position |
| `["env", "mv"]`, `["/usr/bin/mv", "a"]` | caught by `argvHits`, so no gap: listed so that nobody adds them here |

**Live state.** A scan of the code spans and fences of the 357 non-held `*-prior.md` for `eval`, `sh -c`, `timeout`, `env -`, `env X=`, `command -p` and the other forms found none. The `bash -c` hits are the sanctioned form, and `curl` is `skill-help/parts/19-prior.md`. That scan is a text scan too.

**Fix direction.** Allow options and assignments after a wrapper, add `timeout`, read `sh -c` and `bash -<flags>c` strings as commands, treat `eval` as a position, and accept a quoted assignment value. Add a row per form. Or name these forms in the header's limit.

**Acceptance.** Each input above is a hit by a row in the test, or the header names it as unread. `FUSION-CATALOG` exits 0.
