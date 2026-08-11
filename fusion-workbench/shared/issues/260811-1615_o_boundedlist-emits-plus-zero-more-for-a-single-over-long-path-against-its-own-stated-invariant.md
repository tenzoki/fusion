# `boundedList` emits `(+0 more)` for a single over-long path, against its own stated invariant

---

**Severity:** Low — a self-contradicting advisory line in `events.jsonl` and the escalation entry, in the one case the bound deliberately does not cover
**Domain:** code
**Filed by:** coderev (Turn 3 review, range `7d9efc8..adaa545`)
**Affects:** `hooks/lib/rules-write-exemption.ts:790-792` (the comment and the return), `hooks/lib/__tests__/rules-write-exemption.test.ts:1117-1124` (the case that does not reach it)
**Cross-references:**
`circles/260801-1244-guard-rules-write/issues/260803-1352_c_two-guard-advisory-details-skip-the-200-char-clamp-and-render-a-row-nine-times-normal-height.md` (the finding the bound closes)

---

## What is wrong

`boundedList` states an invariant and then violates it in the case it deliberately exempts:

```ts
  // At least one path, whatever it costs — see the note above. The loop keeps
  // none only when the first path alone overruns the budget.
  if (kept === 0) kept = 1;
  // `dropped` is never 0: the whole list overran the budget at the top, so the
  // loop cannot have kept every entry, and the `(+N more)` below always applies.
  const dropped = paths.length - kept;
  return `${paths.slice(0, kept).join(", ")} (+${dropped} more)`;
```

The proof in the comment holds for the loop, and not for the line above it. When `paths.length === 1`
and that one path overruns the budget, the loop breaks at `i = 0` with `kept = 0`, the floor sets
`kept = 1`, and `dropped = 1 - 1 = 0`. The reader gets a list of one entry followed by a suffix
saying nothing was dropped.

## Measured

Against the shipped build, not the source:

```
$ node -e 'const m=require("./dist/lib/rules-write-exemption.js");
           const long="rules/"+"deep/".repeat(30)+"rule.md";
           console.log(m.rulesWriteDetail([long]))'

Override FUSION_ALLOW_RULES_WRITE allowed a normally-denied write to a protected rule path:
rules/deep/deep/…/rule.md (+0 more)
```

163-character path, 265-character detail. The over-length is the documented exception and is correct.
The `(+0 more)` is not: `(+N more)` exists to say *"a short list is never mistaken for the complete
one"*, and here the list **is** complete while the suffix implies a truncation happened.

Both call sites can reach it. `hooks/guard.ts:586` passes exactly one path
(`rulesWriteDetail([filePath])`, a project-relative path), and `hooks/tracker.ts:526` passes the
exempted set, which is a single path whenever one file changed. A project-relative rule path over
~109 characters is unusual in this repository and unremarkable in a consuming project with a deep
`rules/` or `.claude/rules/` tree.

## Why the suite does not catch it

`rules-write-exemption.test.ts:1117` covers the over-long path with a second path beside it:

```ts
const long = `rules/${"deep/".repeat(60)}rule.md`;
const detail = rulesWriteDetail([long, "rules/y.md"]);
expect(detail).toContain("(+1 more)");
```

Two paths, so `dropped = 1`. The one-path shape is untested, and the integration case in
`guard-rules-write-integration.test.ts` uses thirty.

## Suggested direction

Emit the suffix only when something was dropped:

```ts
const dropped = paths.length - kept;
const shown = paths.slice(0, kept).join(", ");
return dropped > 0 ? `${shown} (+${dropped} more)` : shown;
```

and correct the comment to say what is actually true — the floor at `kept = 1` is the branch that can
produce `dropped === 0`, and the exception it serves is a list of one.

## Acceptance criteria

- [ ] `rulesWriteDetail([<path longer than the budget>])` returns the path with no `(+N more)`
      suffix.
- [ ] A case asserts that shape, beside the existing two-path one.
- [ ] The comment no longer claims `dropped` cannot be 0.
- [ ] `cd hooks && npm test` exits 0.
