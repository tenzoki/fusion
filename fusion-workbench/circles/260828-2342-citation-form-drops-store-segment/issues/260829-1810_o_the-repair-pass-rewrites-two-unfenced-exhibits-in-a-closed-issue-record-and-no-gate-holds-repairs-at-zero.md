The repair pass rewrites two unfenced exhibits in a closed issue record, and no gate holds `repairs=0` over fusion's own tree
---
`bin/fusion-citation-sweep --repair --dry-run` over the committed workbench at `a60d1fea` reports `files=1 repairs=2 date-field=0 chained-tail=1 doubled=1`. Both hits are the example tokens in `260829-1346_*_the-committed-sweep-rewrote-29-date-head-fields-into-filenames-and-left-181-chained-tails-in-the-tree.md`, lines 24 and 26, written in inline backticks rather than a fence, so the scanner's fence exemption does not reach them. A `--repair --write --yes` on a clean checkout would rewrite the evidence the issue exists to preserve. The sweep leg is pinned (`citation-sweep.test.ts`, the own-tree case asserts `rewrites=0`); the repair leg has no such case, which is why this stands at HEAD.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>
**Severity:** Medium
**Affects:** `hooks/citation-sweep.ts` (`repairsOn`, the exhibit case), `hooks/lib/__tests__/citation-sweep.test.ts` (the own-tree describe block), the issue record named above
**Cross-references:** `260829-1623_*_the-sweep-starred-both-markers-of-a-shell-illustration-in-a-terminal-circle-record.md` (the same class on the sweep side: a marker that is the statement, not a pointer)

Measured 2026-08-29 over `git archive a60d1fea fusion-workbench`, so the two hits are the committed tree's and not this session's working-tree bookkeeping. The two tokens, verbatim:

```
260826-0136_*_the-absent-rather-than-empty-rule-has-no-expression-in-any-of-the-three-emit-templates.md_*
260731-2235_coder_cadence-skill-registration.md_coder_cadence-skill-regist…
```

The rule the repair pass follows is the scanner's: fenced and blockquoted lines are exhibits, everything else is a pointer. The issue record's two examples are inline-code spans, which that rule does not exempt.

## Acceptance

- The two exhibit lines in the issue record sit in a fenced block, so `--repair --dry-run` over the committed tree prints `files=0 repairs=0`.
- The own-tree describe block in `citation-sweep.test.ts` carries a second case asserting `repairs=0` for `--repair --dry-run`, beside the `rewrites=0` case, so the repair leg cannot drift back.
