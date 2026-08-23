The README's corpus description omits live plans, the fifth kind the predicate selects

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 2
**Affects:** `README-hooks.md:369`
**Cross-references:** `hooks/lib/__tests__/workbench-citation-lint.test.ts:163-172`, the predicate this row describes

---

## What is wrong

`README-hooks.md:369` describes the workbench citation gate's corpus as "the Circle records, `portfolio.md`, the open issues and the live decisions". The predicate selects five kinds:

```ts
export function inCorpus(rel: string): boolean {
  if (FROZEN_PREFIXES.some((p) => rel.startsWith(p))) return false;
  if (rel === PORTFOLIO) return true;
  return (
    CIRCLE_RECORD_RE.test(rel) ||
    OPEN_ISSUE_RE.test(rel) ||
    LIVE_DECISION_RE.test(rel) ||
    LIVE_PLAN_RE.test(rel)
  );
}
```

`LIVE_PLAN_RE`, a plan or spec carrying `_o_` or `_p_`, is not in the README's list. The omission is not academic: this Circle's own plan is currently the file that clause selects, which is why the plan's marker state has gate consequences, and a reader of the README would not know the plan was judged at all.

**This is pre-existing rather than introduced here.** The README row and `LIVE_PLAN_RE` landed in the same commit, `ac01c90`, outside this range, and the row named four kinds from the start. It is filed against this Turn because `e7454e3` re-authored that exact sentence, adding the class L qualification to `portfolio.md`, and the fifth kind was as absent afterwards as before.

## Verified

Read at HEAD `b8a4c1a`. `git log -S` on both the README sentence and `LIVE_PLAN_RE` returns `ac01c90` for each. The clause's own comment in the test file records that it selected zero files when it was written on 2026-08-20 and was armed for the next plan somebody wrote; that plan now exists, so the clause is live.

## Direction, not a prescription

Add the fifth kind to the row. The test file already carries a one-line statement of it worth reusing: a plan or spec carrying `_o_` or `_p_`, the two states in which an executor is dispatched against the document.
