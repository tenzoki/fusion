# The supersession inverts the fact the original argument rested on — `curl -o rules/x.md` allows

---

**Severity:** High (record integrity; the decision's own constraint 3 is unmet)
**Domain:** code
**Filed by:** coderev, Turn 7 review of `circles/260801-1244-guard-rules-write` (`048f3db..c9c44a3`)
**Affects:**
`hooks/lib/bash-mutation-guard.ts:167` and `:2350` (module docstring and `classifyWords`
pass 3 comment),
`decisions/260804-0106_i_should-the-fail-closed-bound-be-drawn-around-the-program-or-around-the-cause.md`
lines 100-101 (option 2's Pro) and 136-138 (constraint 3),
`circles/260801-1244-guard-bash-inspection/issues/260801-1859_c_…` (the supersession note),
`history/260804-0140-turn7-…:192`
**Kind:** REGRESSION of accuracy introduced by `c9c44a3`. The pre-change comment at
`048f3db` stated the fact correctly.

---

## What is wrong

Four shipped or recorded places now assert:

> `curl -o rules/x.md` still denies on pass 1 — so the rule is not looser on the visible
> case than on the invisible one.

It does not deny. Measured through the real guard subprocess, fresh throwaway project,
shipped `protectedPaths`:

```
  allow   curl -o rules/x.md https://x
  allow   curl -o rules/x.md
  allow   curl --output rules/x.md https://x
  DENY    curl -s https://x > rules/x.md      (the redirection sibling, correctly denied)
```

`curl` is not in `MUTATION_VERBS`, `-o` is not a redirection operator, and no pass
inspects it. Both `048f3db` and HEAD agree.

**The same docstring contradicts itself seven lines apart.** `bash-mutation-guard.ts:167`
says it denies; `:174`, inside the "accepted residual" paragraph of the same comment
block, lists `curl -o rules/x.md …` as a program that "writes a protected path [and]
still writes it".

**The supersession note inverts the record it is attached to.** `260801-1859`'s own
`Resolved:` line reads:

> The deciding argument for narrowing rather than documenting: the table already
> **allows** `curl -o rules/x.md` — a LITERAL protected path with an unrecognised
> program — so denying the invisible case while allowing the visible one was an
> inconsistency, not a stricter rule.

The note appended below it on 2026-08-04 reads:

> So does the consistency argument that decided it: a rule must not be looser on the
> visible case (`curl -o rules/x.md`, which **still denies on pass 1**) than on the
> invisible one.

Same file, same example, opposite fact. `260801-1859` was right.

## The consequence for the decision

`decisions/260804-0106` lists as **constraint 3**: "The visible/invisible consistency
must hold. `curl -o rules/x.md` denies, so a rule that allowed its invisible sibling
would be the inconsistency `260801-1859` named." That constraint is not met by the
implementation, and it could not have been — it is unmet at `048f3db` too.

After the change the guard is looser on the visible case than on the invisible one in
exactly the direction `260801-1859` complained about, and by a wider margin than before:

```
  allow   curl -o rules/x.md https://x            # visible, literal, PROTECTED path
  DENY    pushd -n docs && echo hi > notes.txt    # invisible, and the target is harmless
```

This does **not** by itself overturn the decision. The defect it was taken against
(`260803-1835` — `pushd -n docs && echo pwned > agents/coder.md` overwriting an agent
prompt with no flag) is real, measured, and now closed, and that is sufficient grounds on
its own. What is wrong is that a load-bearing constraint and a Pro were argued from a
fact that is false and checkable in one command.

## Recommended fix

1. Correct `bash-mutation-guard.ts:167` and `:2350`. The honest sentence is the narrow
   one `README-hooks.md` already uses: *a redirect target that resolves is checked
   whatever the program is*. Drop the `curl -o` clause from the consistency claim.
2. Amend `decisions/260804-0106`: mark constraint 3 as stated on a false premise, keep
   the record `_i_`, and re-anchor the answer on `260803-1835` alone — which it can
   carry.
3. Correct the supersession note on `260801-1859` so it does not contradict the
   `Resolved:` line three paragraphs above it.
4. Either accept `curl -o <protected>` as a residual and say so once, in one place (the
   residual lists in `rules/protected-path-discipline.md:435` and `README-hooks.md`
   already do), or file the widening separately. Do not leave two answers in one comment
   block.
