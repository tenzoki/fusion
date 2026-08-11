# The record-counts block still gates both halves together when `session.started` is missing, and a test pins it

---

**Severity:** Low — narrow input, but it is the mirror of the defect the same commit fixed, and its test asserts the surviving half of it is correct
**Domain:** code
**Filed by:** coderev (Turn 4 review, range `b261d83..951c809`)
**Affects:** `agents/orchestrator.md:704-728`, `agents/orchestrator.md:734-740` (the cause list), `hooks/lib/__tests__/record-counts-measurement.test.ts:322-327`
**Cross-references:**
`shared/issues/260811-1610_c_the-unmeasured-branches-discard-the-filed-count-which-needs-no-git-and-a-test-now-pins-the-discard.md` (the half that was fixed);
`shared/issues/260811-1616_c_the-unmeasured-cause-list-assigns-a-project-outside-git-to-the-branch-that-cannot-reach-it.md`

---

## What is wrong

`29d62e2` split the record-counts block's two halves so each is gated on what that half needs, and states the property at `agents/orchestrator.md:734`:

> **The two halves fail separately, so they are gated separately.** `filed <kind>` compares a record's own filename stamp against `session.started` — filenames and `T`, no git at all — while `now_<marker> <kind>` asks git whether a name existed at the anchor. A usable anchor is required for the second half only, so the block gates each half on what that half needs instead of on one combined test.

The block does this in one direction only. `agents/orchestrator.md:704-712`:

```bash
if [ -z "$A" ]; then
  WHY=no-anchor-in-agentstate
elif ! git -C "$WORKBENCH" cat-file -e "$A:./" 2>/dev/null; then
  WHY=workbench-not-in-anchor-commit
else
  WHY=
fi
if [ -z "$T" ]; then
  echo "records=unmeasured why=no-anchor-in-agentstate anchor=${A:-none} start=none"
else
  … both halves computed here …
fi
```

`A` missing or unusable → `records=partial`, and the `filed` half is still taken. Correct, and the fix.

`T` missing → the whole `else` is skipped, so the `now_` half is discarded **even when `A` is present and the anchor probe passes**. The `now_` half needs only `A`: it asks git whether a filename existed at the anchor commit, a question `session.started` plays no part in. So the half that is measurable is thrown away, which is the exact shape `260811-1610` was filed against, arriving from the other side.

`records=partial` exists and would be the right header here (`Issues resolved`, `Decisions answered`, `Decisions implemented` measured; `Issues created` unmeasured) — the branch is simply not written.

## The test pins the asymmetry as correct

`hooks/lib/__tests__/record-counts-measurement.test.ts:322-327`:

```ts
// No `session.started`, so not even the filed half has a bound to compare
…
expect(v.unmeasured).toBe("no-anchor-in-agentstate");
```

The comment is true about the *filed* half and silent about the other one. So the case reads as a considered decision when it is the untouched leg of the old combined gate, and a later reader has a green test telling them the branch is right.

## A second, smaller point on the same branch

The `why=` value for this branch is `no-anchor-in-agentstate`. When `A` is present and only `T` is missing, that name is false about the record: the anchor *is* in `agentstate.yaml`. The prose at `agents/orchestrator.md:739` covers it by defining the cause name as "missing either `git_head_at_start` or `started`", so it is documented rather than wrong — but a cause list whose name contradicts the state it names is what `260811-1616` was filed about, and the same commit fixed the other instance of it.

## Fix direction

Gate each half on its own input, symmetrically, and let the header report which halves were taken:

- `A` usable, `T` present → `records` (both).
- `A` unusable, `T` present → `records=partial why=<A's cause>` (filed only).
- `A` usable, `T` missing → `records=partial why=no-session-start` (now_ only).
- Neither → `records=unmeasured why=<both causes>`.

Four cases, disjoint and complete, which is what `rules/critical-stance.md` §4 asks and what the two-input structure actually has. The reachability of the third is narrow — it needs an `agentstate.yaml` carrying `git_head_at_start` and no `started` — so this is worth taking as a small correctness edit rather than urgently.

## Acceptance criteria

- The four-case split above is what the block computes and what the prose lists.
- `record-counts-measurement.test.ts` gains a case for `A` present, `T` absent, asserting the `now_` counts are taken.
- The existing `:322` case keeps its assertion or is replaced deliberately, with its comment stating which half is discarded and why.
