# Task 17 — `boundedList` stops claiming a truncation that did not happen

**Status:** Complete
**Agent:** coder
**Domain:** code
**Task:** `I:260811-1615`, tasklist entry 17
**Source record:** `shared/issues/260811-1615_c_boundedlist-emits-plus-zero-more-for-a-single-over-long-path-against-its-own-stated-invariant.md`
**Circle:** none active — every store resolved into `shared/`

---

## What was wrong

`boundedList` in `hooks/lib/rules-write-exemption.ts` carried a comment asserting that `dropped`
can never be 0, and returned the `(+N more)` suffix unconditionally on that basis. The assertion
was proved over the loop, which is true of the loop and not of the floor on the line above it. A
list of exactly one path, longer than the budget, breaks the loop at `i = 0` with `kept = 0`; the
floor puts `kept` back to 1; `dropped` is `1 - 1 = 0`. The reader of `events.jsonl` then sees a
complete list of one followed by a suffix whose whole purpose is to say the list is short.

The over-length itself is correct and deliberate: a path is bounded by `PATH_MAX`, a list is
bounded by nothing, and the finding the bound closes was about the list. Only the suffix was wrong.

## What changed

`hooks/lib/rules-write-exemption.ts` — the return is now conditional:

```ts
const dropped = paths.length - kept;
const shown = paths.slice(0, kept).join(", ");
return dropped > 0 ? `${shown} (+${dropped} more)` : shown;
```

The comment above it was rewritten rather than softened. It keeps the part of the old proof that
holds (the loop cannot keep every entry, because the whole list overran the budget at the top),
then names the floor as the branch that reading only the loop misses, walks the one-path case
through it, and states the resulting rule: `(+N more)` says a short list is not the whole one, so
it is written only when something was dropped.

`hooks/lib/__tests__/rules-write-exemption.test.ts` — one case added inside `describe("the length
bound")`, immediately after the existing over-long-path case. The two sit together on purpose and
the new one's doc comment says why: the old case keeps a second path beside the over-long one, so
`dropped` is 1 and the suffix is honest; alone, the over-long path is the whole list. The new case
asserts the complete expected string, including the singular `a protected rule path` label that a
one-path list selects, and then that the detail contains no `" more)"`.

`hooks/dist/` was rebuilt. `npm test` runs `npm run build` first (`rm -rf dist && tsc`), so the
whole tree was regenerated; `dist/lib/rules-write-exemption.js` is the only file whose bytes moved.
That matters here because the installed hooks run from `dist/`, and the record's measurement was
taken against `dist/`, not the source.

## Verification

The record's own reproduction, re-run against the rebuilt build:

```
$ node -e 'const m=require("./dist/lib/rules-write-exemption.js");
           const long="rules/"+"deep/".repeat(30)+"rule.md";
           console.log(JSON.stringify(m.rulesWriteDetail([long])))'

"Override FUSION_ALLOW_RULES_WRITE allowed a normally-denied write to a protected rule path:
 rules/deep/…/rule.md"
```

No `(+0 more)`.

`cd hooks && npm test` — **exit 0**, 50 files, 1301 tests passed. Baseline at HEAD `9f84254` was
1293; this task adds 1 and three concurrent executors added the rest during the session.

**Three earlier full runs were red, none of it from this file set**, and the detail is worth
keeping because it will recur while executors run in parallel:

- Run 2 — 2 failures in `record-counts-measurement.test.ts`. That suite extracts its bash snippet
  from `agents/orchestrator.md`, which another executor was editing at that moment. Passed alone
  three minutes later, unchanged.
- Run 3 — `clear-halt-concurrent-halt.test.ts` and `fusion-commit-lock.test.ts`. Both are
  poll-until-condition concurrency tests; the run took 263s wall for 1329s of test CPU. Both passed
  in isolation.
- Run 4 — `fusion-commit-lock.test.ts` alone, the same 10s poll for a transient holder-less lock
  directory, missed under load.

Every one of them is a timing race that widens with machine load, and the green run is the same
command with no narrowing. Nothing was scoped down to make it pass.

## Notes for later

The measurement in the source record is against `dist/`, and this is the second task this session
where that distinction was load-bearing. `hooks/dist/` being committed means a source fix is not a
shipped fix until the build runs, and `npm test` happens to run it — a bare `vitest` would not.
