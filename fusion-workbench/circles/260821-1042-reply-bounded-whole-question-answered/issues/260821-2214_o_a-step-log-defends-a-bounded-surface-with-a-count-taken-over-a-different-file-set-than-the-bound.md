A step log defends a bounded surface with a count taken over a different file set than the bound

---

`circles/260821-1042-reply-bounded-whole-question-answered/history/260821-2145-coder-the-cut-that-pays-for-steps-2-and-3.md:108-110` says the hook-test bound "is untouched: the suite still measures 18 314 lines across `lib/__tests__/*.test.ts`". The bound is not measured over that glob. `hooks/lib/__tests__/surface-growth-bound.test.ts:388` labels the surface `hooks/lib/__tests__/**.ts`, which includes `helpers/`, and it stood at 20 364 lines when that sentence was written.

---

**Affects:** `circles/260821-1042-reply-bounded-whole-question-answered/history/260821-2145-coder-the-cut-that-pays-for-steps-2-and-3.md:108-110`.

**Severity:** Low. The step's substantive claim is true, and only the evidence offered for it is measured against the wrong set.

**The two measurements, both reproduced.**

```
$ cd hooks && cat lib/__tests__/*.test.ts | wc -l
   18314
$ cd hooks && find lib/__tests__ -name '*.ts' | xargs cat | wc -l
   20364
$ tail -1 hooks/lib/__tests__/fixtures/surface-growth.golden
  total 20364
```

The 2 050-line difference is `helpers/citation-scan.ts` (574), `helpers/guard-harness.ts` (972), `helpers/growth-bound.ts` (123), `helpers/prompt-blocks.ts` (28) and the fixture-adjacent entries the golden lists. `TEST_LINE_BASELINE` in `hooks/lib/__tests__/surface-growth-bound.test.ts:310-352` carries the four `helpers/` entries explicitly, so the bound has never been over `*.test.ts`.

**What is true and what is not.** Step 5 added no test lines, so its claim that it left the surface untouched holds. What does not hold is the number offered as proof of it: 18 314 is not the figure the bound compares, and a reader who takes it for one will compute head-room of 2 061 lines where the real figure is 11. That inversion matters here more than usual, because the same Turn spent ten of the surface's twenty-one lines (`circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2204_*_a-growth-bound-lost-half-its-head-room-against-a-stated-stopping-criterion-and-the-finding-lives-only-in-a-history-log.md`).

**Fix.** Replace the clause with the figure the bound reads, which the same Turn already measured correctly twice: `circles/260821-1042-reply-bounded-whole-question-answered/history/260821-2120-coder-the-reply-answers-the-question-that-was-put.md:89-93` and `circles/260821-1042-reply-bounded-whole-question-answered/history/260821-2147-coder-the-corpus-is-measured.md:191` both give 20 364 and 11 lines of head-room. Correcting another agent's log in place has a precedent in this Circle and a stated bound on it: step 6 corrected two figures in step 2's log and touched nothing else (`circles/260821-1042-reply-bounded-whole-question-answered/history/260821-2147-coder-the-corpus-is-measured.md:225-240`).

**Cross-references:** `hooks/lib/__tests__/surface-growth-bound.test.ts:199` ("The hook-test surface counts `.ts` under `hooks/lib/__tests__/`"); `README-hooks.md` `### Growth bounds on the shipped text`.
