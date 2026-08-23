The portfolio corpus assertion passes the constant to itself, so it no longer pins the name

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 2
**Affects:** `hooks/lib/__tests__/workbench-citation-lint.test.ts:286`
**Cross-references:** `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1110_*_the-untracked-portfolio-turns-npm-test-red-in-every-fresh-clone-of-this-repository.md`, the record this line repaired

---

## What is wrong

`e7454e3` replaced a tree assertion with a predicate assertion, which was the right move and is not what this record is about. The replacement passes the module's own constant:

```ts
const PORTFOLIO = "portfolio.md";
export function inCorpus(rel: string): boolean {
  …
  if (rel === PORTFOLIO) return true;
  …
}
…
expect(inCorpus(PORTFOLIO), "the corpus predicate admits portfolio.md").toBe(true);
```

`inCorpus(PORTFOLIO)` reduces to `PORTFOLIO === PORTFOLIO`. The assertion is therefore invariant under any change to what `PORTFOLIO` names. Change the constant to `"portfolio-briefing.md"` and the gate silently stops judging the real `portfolio.md` while this line stays green.

The line it replaced, `expect(rels.has("portfolio.md"))`, used a literal and did pin the name. That half of its coverage was lost with the half that had to go.

The commit message states the surviving property accurately: the assertion "breaks only when the portfolio leaves the corpus, which is the one failure the line exists to catch". It does catch a deleted clause, because the fall-through regexes match no bare `portfolio.md`. It does not catch a wrong clause, and the message does not claim it does. The repair is sound; it is one token short of what was available.

## Verified

Read at HEAD `b8a4c1a`. `PORTFOLIO` is declared at `:98` and read in `inCorpus` at `:168` and in the assertion at `:286`, and nowhere else in the file. `npm test` from `hooks/` is green at HEAD, 41 files, 724 tests, so nothing else pins the string.

## Direction, not a prescription

One token: assert `inCorpus("portfolio.md")` with the literal instead of the constant. That keeps every property the repair argued for, holds in a checkout with no portfolio on disk, and additionally fails when the constant stops naming the file the workbench actually writes.
