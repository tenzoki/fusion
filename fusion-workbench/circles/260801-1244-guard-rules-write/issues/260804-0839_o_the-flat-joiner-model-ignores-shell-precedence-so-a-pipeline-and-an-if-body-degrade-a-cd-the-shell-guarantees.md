# The flat joiner model ignores shell precedence, so a pipeline and an `if` body degrade a `cd` the shell guarantees

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, Turn 7 review of `circles/260801-1244-guard-rules-write` (`048f3db..c9c44a3`)
**Affects:** `hooks/lib/bash-mutation-guard.ts:2465`; `hooks/lib/shell-parse.ts` (`SegmentJoiner`)
**Kind:** REGRESSION introduced by `c9c44a3` — all rows allowed at `048f3db`.
**Cross-references:**
`260804-0837_o_…pipeline…` (the *under*-deny half of the same precedence gap — both must
be fixed together or `cd hooks && npx tsc | tee log` cannot come out right),
`260804-0838_o_…newline…`, `260804-0840_o_…cost-table…`.

---

## What is wrong

`SegmentJoiner` is a flat list of separators. The shell's reachability rules are not
flat: `|` binds tighter than `&&`, and a compound command's body is reached on a
condition the separator does not express. The degrade fires for any joiner that is not
literally `&&`, so it fires for constructs where the shell **does** guarantee the `cd`
succeeded.

Three families, all `allow → DENY`:

**A pipeline inside an `&&` chain.** `A && B | C` is `A && (B | C)`. The `&&` guarantees
`A`; the `|` does not reach past it.

```
  allow -> DENY   cd hooks && npx tsc | tee typecheck.log
  allow -> DENY   cd hooks && cat a | tee b.log
```

Verified in both shells that the write lands where the model originally said:

```
$ mkdir -p hooks
$ bash -c 'cd hooks && echo hi | tee out.log >/dev/null'   # creates hooks/out.log
$ zsh  -c 'cd hooks && echo hi | tee out.log >/dev/null'   # creates hooks/out.log
```

**A conditional body.** `then` and `do` are reached only when the condition succeeded.

```
  allow -> DENY   if cd build; then rm out.js; fi
  allow -> DENY   while cd build; do rm out.js; done
```

(`until cd build; do rm out.js; done` degrades **correctly** — the body runs when the
`cd` failed — so the family is not uniform and a blanket exemption for grammar words
would be wrong.)

**A brace group.** `{ cd build; } && rm out.js` — the group runs in the current shell
and the `&&` guarantees it.

```
  allow -> DENY   { cd build; } && rm out.js
```

The deny reason in each case names `&&` as the way through, which is not available
inside an `if` body and is already present in the pipeline rows. Same unactionable-remedy
problem as `260804-0838`, at lower frequency.

## Recommended fix

Two separable steps; the first is small and closes most of the cost.

1. **`|` inherits the previous segment's conditionality rather than resetting it.** A
   `|`-joined segment is part of the same pipeline as the segment before it, so for the
   purpose of "was this reached unconditionally" it should carry the previous segment's
   joiner. Paired with `260804-0837` (a `cd` in a pipeline does not move the shell), the
   pair gives the right answer on both sides.
2. **`then` / `do` after a directory builtin in the condition.** Lower value and more
   parsing. `until` is the counterexample that makes a blanket rule wrong. Consider
   leaving this one as a stated cost instead — but state it, which is `260804-0840`.

## Anti-vacuity

Pin `cd hooks && npx tsc | tee typecheck.log` as an allow and `cd hooks; npx tsc | tee
typecheck.log` as a deny in the same test, so the fix cannot be a blanket exemption for
`|`. Keep `until cd build; do rm out.js; done` pinned as a deny.

---
**Costed in a design record (T8-1, 2026-08-04), not implemented.** Measured: 84 of 84
generated `if cd X; then W; fi` / `while cd X; do W; done` / `{ cd X; } && W` /
`cd X && Y | tee log` rows deny today. `until cd X; do W; done` is the counter-example that
keeps an implementation honest — its body runs when the `cd` FAILED, so its 12 generated
rows must keep denying. Only option 2 of
`decisions/260804-0947_o_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md`
(model the and-or list) closes this; the cheap option 1 does not, measured identically
before and after. Three of these shapes are now named in the cost illustrations of
`rules/protected-path-discipline.md` as over-denies, so an agent meeting one knows it is a
cost rather than a hazard.
