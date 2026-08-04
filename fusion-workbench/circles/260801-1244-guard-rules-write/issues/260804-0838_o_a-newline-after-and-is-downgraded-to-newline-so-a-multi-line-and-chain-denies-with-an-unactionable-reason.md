# A newline after `&&` is downgraded to `newline`, so a multi-line `&&` chain denies with an unactionable reason

---

**Severity:** High
**Domain:** code
**Filed by:** coderev, Turn 7 review of `circles/260801-1244-guard-rules-write` (`048f3db..c9c44a3`)
**Affects:** `hooks/lib/shell-parse.ts:657-671` (`flush`); consequence in `hooks/lib/bash-mutation-guard.ts:2465`; `rules/protected-path-discipline.md:168-176` and `README-hooks.md:184` (the cost table that omits it)
**Kind:** REGRESSION introduced by `c9c44a3`. `cd hooks &&\n  npm run build &&\n  rm -rf dist` allowed at `048f3db` and denies at HEAD.
**Cross-references:**
`hooks/lib/__tests__/shell-parse.test.ts` ("gives up the && when a second operator also
stands between" — pins `a && ; b` and `a ; && b`, but not `a &&\nb`).

---

## What is wrong

`flush` downgrades a pending `&&` whenever the next operator flushes an empty segment:

```ts
// shell-parse.ts:657-671
const flush = (next: SegmentJoiner): void => {
  const trimmed = cur.trim();
  if (trimmed.length > 0) {
    out.push({ text: trimmed, depth, start: curStart, joiner: pending });
    pending = next;
  } else if (pending === "&&") {
    // The operator flushed nothing, so TWO operators stand between the last
    // emitted segment and the next one (`a && ; b`, or `a &&` at a line end).
```

The comment names the case and gets it wrong. `a && ; b` really is two operators. `a &&`
at a line end is **not** — bash's grammar is

```
and_or : and_or AND_AND newline_list pipeline
```

so a newline (or a run of them) after `&&` is part of the and-or list, not a command
terminator. The `&&` guarantee is fully intact across it.

The downgrade also applies **only to `&&`**, because the `else if` tests `pending === "&&"`.
`||` survives the same newline untouched. The lexer therefore reports:

```
"cd build && rm out.js"       => cd build[start]  rm out.js[&&]
"cd build &&\nrm out.js"      => cd build[start]  rm out.js[newline]     <-- wrong
"cd build && \\\nrm out.js"   => cd build[start]  rm out.js[&&]          (backslash spliced first)
"a || \n b"                   => a[start]         b[||]                  (not downgraded)
```

## Measured

Shell semantics first, so the claim is not an inference:

```
$ mkdir -p build && printf x > build/out.js
$ bash -c 'cd build &&
rm out.js'          # build/out.js is GONE, exit 0
$ zsh  -c 'cd build &&
rm out.js'          # build/out.js is GONE, exit 0
```

Both shells run it as one and-or list. Then the guard, `048f3db` vs HEAD:

```
  allow -> DENY   cd build &&\nrm out.js
  allow -> DENY   cd build &&\n  rm out.js
  allow -> DENY   cd hooks &&\n  npm run build &&\n  rm -rf dist
  allow -> DENY   cd docs\nrm draft.md                    (correct — a bare newline)
  allow -> allow  cd build && \\\n  rm out.js             (backslash continuation, correct)
```

## Why this is High and not a cosmetic over-deny

The deny reason for the three-line build chain reads:

> …the segment `rm -rf dist` writes `dist` at one of two places and the guard cannot
> tell which (fail-closed). **Join the `cd` to what follows it with `&&`** — which is
> also what makes the command correct in the shell — or name the target as an absolute
> path.

The agent already joined it with `&&`. The remedy the deny names has already been
applied, so the instruction is unfollowable. `rules/protected-path-discipline.md` exists
precisely so that "an agent never meets an unexplained deny and works around it"; this
deny is unexplained *and* the rule's own headline advice for the section is "Write `&&`,
not `;`". A multi-line `&&` chain is one of the most common shapes an agent writes into a
`Bash` tool call.

It is also absent from the five-row cost table the same document shows as the complete
price of the change (see `260804-0840`).

## Recommended fix

Downgrade a pending `&&` only for a **real** second operator. A newline that flushes an
empty segment while `pending` is `&&` or `||` should leave `pending` alone: bash's
`newline_list` is grammatically part of the operator. Concretely, pass the newline flush
a marker the `else if` can ignore, or test `next !== "newline"` in the downgrade branch.

`a && ; b` and `a ; && b` must keep their current answers — they are already pinned.

## Anti-vacuity

Add `cd build &&\nrm out.js` and the three-line build chain to the allow side, and keep
`a && ; b` on the downgrade side. Mutating the fix (restoring the unconditional
downgrade) must fail the new allow rows and nothing else.
