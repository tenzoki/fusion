The answered non-Markdown decision carries a store-prefixed token that reddens the citation gate

---

`260830-1844_*_does-the-citation-helper-read-non-markdown-surfaces-with-the-stamp-as-the-anchor.md` carries a store-prefixed citation token in its own prose. It is a live decision record, so it is inside `hooks/lib/__tests__/workbench-citation-lint.test.ts`'s corpus, and the gate fails on it. The record is uncommitted working-tree state at the time of filing (the `_o_` name is deleted and the `_a_` name is untracked), so committing it as it stands turns `npm test` red for everyone who pulls.

---
**Filed by:** planner, Kai Stalmann <ks@qantr.com>

**Evidence.** `cd hooks && npx vitest run lib/__tests__/workbench-citation-lint.test.ts` at 260831-0031 reports:

```
file:    shared/decisions/260830-1844_a_does-the-citation-helper-read-non-markdown-surfaces-with-the-stamp-as-the-anchor.md
line:    93
token:   shared/analyses/260716-1600
problem: the citation carries the store segment 'shared/analyses/', which an archive sweep moves
```

The token sits inside an inline code span, in the sentence "Where a store-prefixed token's storeless form would be a bare stamp (…), the guard leaves the token wrong rather than making it undecidable." It is an **exhibit** of the shape the sweep's visibility guard declines, not a pointer at a record. The grammar exempts a fenced block and a blockquote line and does not exempt an inline code span, so the exhibit is read as an instance of the fault it illustrates — the same class as the measurement that produced `bin/fusion-prose-metric`, where a whole-file `grep -o` counted a rule's exhibits of the em-dash fault as instances of it.

**Acceptance test.** `cd hooks && npx vitest run lib/__tests__/workbench-citation-lint.test.ts` exits 0 with that record present in the tree, and the record still says what it says: the sentence must keep naming the shape the guard declines. Restating the exhibit so it is not a resolvable-looking token — a fenced line, or a description of the shape rather than a spelling of it — satisfies both. Do not delete the sentence.

---
Resolved: the token was restated as a description of the shape rather than spelled, in the same working tree before either file was committed, so no commit ever carried the red gate. A second token found in the same pass, a literal `_o_` marker in the planner history log citing its own plan, was corrected to the wildcard form. Both gates green afterwards: 806 tests, `rewrites=0`, `store-prefixed=0`.

This is the fifth instance in one session of the pattern filed as `260830-2235_*_the-fabricated-name-exemption-keys-on-the-literal-foo-so-every-realistic-probe-fixture-is-read-as-a-real-citation.md`, and the second by the orchestrator. Four of the five were exhibits quoted in prose; this one was a real pointer used as an exhibit, which is the harder half of the same shape. That record stays open and carries the general question.
