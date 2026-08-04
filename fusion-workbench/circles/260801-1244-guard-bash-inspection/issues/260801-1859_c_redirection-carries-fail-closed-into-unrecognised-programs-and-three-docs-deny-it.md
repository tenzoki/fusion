Redirection carries the fail-closed rule into unrecognised programs, and three documents state the opposite

---

**Severity: Medium.** A false positive on a shape agents write constantly, plus a false claim in
the three places an agent or a developer would go to understand the deny.

The fail-closed rule is documented as reaching only recognised verbs. `rules/protected-path-discipline.md:106-109`:

> The bound is exactly this: **an unrecognised program is allowed however unparseable its
> arguments are.** `curl -o $OUT https://x`, `make $TARGET` and `npm run $SCRIPT` are untouched.
> The fail-closed rule never applies to ordinary shell work; it applies only once a table verb has
> been recognised.

`hooks/lib/bash-mutation-guard.ts:69-71` and `README-hooks.md` (the "Fail-closed, and its bound"
paragraph) say the same thing.

It is not true, because redirection is scanned position-independently and its targets are appended
to the written set before the resolution pass (`bash-mutation-guard.ts:1045`):

```ts
const written = [...verbOperands(words, literals), ...redirectTargets];
```

`verbOperands` returns `[]` for an unrecognised program, but a redirect target still lands in
`written`, still fails to resolve, and still reaches pass 3.

Verified against the shipped `hooks/dist/` with the shipped `protectedPaths`:

```
DENY  | "npm test > \"$TMPDIR/test.log\""      -> "$TMPDIR/test.log"
DENY  | "npm test 2>&1 | tee \"$LOG\""         -> "$LOG"
DENY  | "echo hi >> ~/notes.md"                -> ~/notes.md
DENY  | "cat report.md > ~/backup.md"          -> ~/backup.md
allow | "curl -sL https://x -o \"$OUT\""       <- the doc's own example, correct
allow | "make \"$TARGET\""                     <- the doc's own example, correct
allow | "go build -o \"$BIN\" ./cmd/x"
```

The two examples the documentation names are both flag-value forms, which is why the claim reads
as true. The redirect form is the one that breaks it, and it is the more common of the two in
agent work: "run the thing, put the output somewhere I control" is a per-session idiom.

---

**Two separable questions, and they should not be answered together.**

1. **Is the behaviour right?** Arguably yes. `bash-mutation-guard.ts:30-31` states the design
   intent plainly — "a redirection binds to the whole simple command wherever it appears — `>`
   makes ANY program a mutation" — and `> $F` genuinely can land on a protected path. Fail-closed
   is the consistent answer. If that is the decision, the fix is documentation only.
2. **Is the cost acceptable?** `> "$TMPDIR/x"` and `| tee "$LOG"` are not exotic; this repo's own
   agents write them. The narrowing worth considering is to require, for a redirect target on an
   *unrecognised* program, that the unresolved token could plausibly be project-relative — a token
   beginning `/`, `~/` or a `$VAR` that cannot be proven relative is a different risk from a bare
   `$F`. That is a real design decision with a real soundness cost, not a tidy-up, and it belongs
   at a gate rather than in a patch.

**Whichever is chosen, the documentation must change.** Three files currently promise a bound the
code does not honour, and this Circle's own commit `3806a49` (`docs(hooks): … correct five false
claims`) established that such a claim is treated as a defect here.

Minimum correction: state that redirection is the exception — an unresolvable redirect target is
denied whatever the program is — and give `npm test > "$LOG"` as the worked example next to the
`curl -o $OUT` one, so the two forms are visibly different rather than silently so.

**Related.** The must-never-deny corpus cannot catch a widening of this family; see
`260801-1900_o_the-must-never-deny-corpus-omits-the-largest-false-positive-family.md`.

**Found by** coderev on the `17730b8..e31c0f3` review, by testing the documented bound against the
compiled classifier rather than reading it.

---
Resolved: the code was changed to match the documentation, not the other way round. `classifyWords` (`hooks/lib/bash-mutation-guard.ts`) now runs pass 3 only when the segment names a recognised verb, so a redirect target on an unrecognised program is still matched literally (`sort /tmp/a > rules/x.md` denies) but no longer fails closed. The deciding argument for narrowing rather than documenting: the table already allows `curl -o rules/x.md` — a LITERAL protected path with an unrecognised program — so denying the invisible case while allowing the visible one was an inconsistency, not a stricter rule. Given up: `echo x > "$F"`, `echo x > "rules/$F"` and `cd $D && echo x > y.md` now allow; all three are pinned as allows and their discriminating neighbours (`npm test > rules/x.md`, `cd rules && echo x > y.md`, `rm /tmp/a > "$F"`) as denies. Docs corrected in `rules/protected-path-discipline.md`, `README-hooks.md` and the module docstring; the residual list gained the unresolvable-redirect-target entry.

---
**Half of this resolution was superseded on 2026-08-04 (task T7-1 of
`circles/260801-1244-guard-rules-write`).** The record that carries the argument
is
`circles/260801-1244-guard-rules-write/decisions/260804-0106_i_should-the-fail-closed-bound-be-drawn-around-the-program-or-around-the-cause.md`.

What stands: the defect this issue found was real, and the documented sentence —
*an unrecognised program is allowed however unparseable its ARGUMENTS are* — is
now true. `npm test > "$LOG"`, `npm test > "$TMPDIR/test.log"`,
`cat report.md > ~/backup.md`, `echo hi >> ~/notes.md`, `echo x > "$F"`,
`echo x > "rules/$F"`, `curl -o $OUT https://x` and `make $TARGET` all allow, and
are pinned as allows. So does the consistency argument that decided it: a rule
must not be looser on the visible case (`curl -o rules/x.md`, which still denies
on pass 1) than on the invisible one.

What was superseded: the bound was drawn around the **program**, and it should
have been drawn around the **cause**. The three rows this resolution gave up —
`cd $D && echo x > y.md`, `cd $D && echo x > out.log` and
`cd "$(pwd)" && npm test > out.log` — are not the promised case. Their argument
is an ordinary literal relative path; what cannot be resolved is the guard's own
working directory. That gap was measured overwriting `agents/coder.md` with no
flag (`260803-1835`), and every later give-up on a directory added another
entrance to it. Those three now deny; nothing else moved, in either direction.

This note is here because the reversal must be findable from the record it
overrides. The two tests that pinned this resolution were inverted, with a
comment naming what they replaced, rather than deleted.
