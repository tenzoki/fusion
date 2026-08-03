# How should the protected-path check treat the case of a path?

---
**Domain:** code
**Status:** answered
**Filed by:** orchestrator, at the user gate closing Turn 3 of `circles/260801-1244-guard-rules-write`
**Cross-references:** `circles/260801-1244-guard-rules-write/issues/260802-2320_o_case-folding-bypasses-the-entire-protected-list-on-a-case-insensitive-filesystem.md` (the measurement that raised this), `hooks/guard.ts` CHECK 2, `hooks/lib/paths.ts` (`collapseSegments`, `matchesAny`), `hooks/lib/bash-mutation-guard.ts`, `rules/protected-path-discipline.md`, `README-hooks.md`

---

## Question

On a case-insensitive filesystem, a protected path spelled in a different case writes the
same file and is allowed. Measured against the real guard subprocess in a throwaway project,
on a machine whose root filesystem is APFS in its default case-insensitive configuration:

```
Edit agents/coder.md        DENY
Edit AGENTS/coder.md        allow      -> writes agents/coder.md
Edit HOOKS/config.json      allow      -> writes hooks/config.json
Edit Rules/x.md             allow
rm AGENTS/coder.md          allow
```

That is a complete bypass of `guard.protectedPaths` on both write surfaces, for any
developer on a default macOS install or a case-insensitive Windows volume. It predates this
Circle and is independent of `FUSION_ALLOW_RULES_WRITE`. The grant side is already closed:
`isProjectRulePath` resolves through `realpathSync.native`, which folds case. Only the
protection side is open.

The choice had to be made rather than patched because three shipped documents describe the
protection check as purely textual, and one of them, `rules/protected-path-discipline.md`,
is loaded into every agent's context on every dispatch in every consuming project. It was
rewritten in this same Turn on exactly that premise (`ce7a125`). A change here is a change
to a stated security contract, not an implementation detail.

## Options

1. **Fold case unconditionally.** Match the protected list case-insensitively on every
   platform.
   - Pros: platform-independent, no filesystem work, one line on each side of the match.
     Over-blocking is the direction the guard already chooses elsewhere, in the fail-closed
     rule for an unresolvable operand of a recognised verb.
   - Cons: over-protects on a case-sensitive filesystem, where `AGENTS/coder.md` is
     genuinely a different file and a project that deliberately keeps both would find one of
     them unwritable.
2. **Fold only where the filesystem does**, detected once at load.
   - Pros: correct exactly where it applies, no over-blocking anywhere.
   - Cons: the same repository protects differently on Linux and on macOS. A platform-
     dependent security boundary has to be documented in every place the boundary is
     described, or it is discovered rather than known.
3. **Resolve every guarded path through the filesystem**, the way the grant side now does.
   - Pros: most accurate, and it closes the planted-alias residual
     (`260802-2335`, documented in `ce7a125`) and the symlink escape along with this.
   - Cons: filesystem work on every guarded call, and behaviour changes for a path that does
     not exist yet, which is the common case for a `Write`. The "purely textual" premise
     disappears from all three documents.

## Constraints

- Whatever is chosen must hold on **both** write surfaces. A fix on the write tools alone
  would leave the shell open and teach an agent that the way past a deny is to reach for
  Bash, which is the precise failure `rules/protected-path-discipline.md` exists to prevent.
- The stated contract in `rules/protected-path-discipline.md`, `README-hooks.md` and the
  module docstrings must be corrected in the same change. A guard whose documented premise
  is false is the defect this Circle has now hit twice.

## Answer

**Option 1: fold case unconditionally.**

Chosen by the user at the Turn 3 closing gate, 2026-08-03. The reasoning that carried it:
over-blocking on a case-sensitive filesystem is the safe direction and matches the choice
the guard already makes elsewhere, whereas a boundary that differs by platform (option 2)
has to be re-stated in every document that describes it and is discovered rather than known.
Option 3 is a larger change with a real per-call cost, and it can still be taken later — it
subsumes this answer rather than conflicting with it.

The documented premise becomes "the check is textual, and case-insensitive".

## Realisation

Not implemented. The change belongs to a later Circle, together with the correction of the
three documents that state the premise. This record moves to `_i_` when that lands.

---
Answered: `circles/260801-1244-guard-rules-write/history/260803-1038-orchestrator-session.md` — user chose unconditional case folding at the Turn 3 closing gate; over-blocking is the safe direction and a platform-dependent boundary is not.
