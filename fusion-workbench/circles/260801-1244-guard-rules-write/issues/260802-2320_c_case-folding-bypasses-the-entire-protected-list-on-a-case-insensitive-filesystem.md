Case folding bypasses the entire protected list on a case-insensitive filesystem

---

**Domain:** code
**Severity:** High
**Filed by:** orchestrator, from a residual the Turn 2 coder measured and could not close in scope
**Cross-references:** `hooks/guard.ts` CHECK 2, `hooks/lib/paths.ts` (`collapseSegments`,
`matchesAny`), `hooks/lib/bash-mutation-guard.ts`,
`260802-2230_*_check-2-matches-the-protected-list-un-canonicalised-so-dot-slash-agents-coder-md-is-not-protected.md`
(the same class, textual side, closed by `49bb4da`), `rules/protected-path-discipline.md`,
`README-hooks.md`

---

## What was measured

On a case-insensitive filesystem, a protected path spelled in a different case writes the same file
and is allowed. Measured by the Turn 2 coder against the real guard subprocess in a throwaway
project:

```
Edit agents/coder.md        DENY
Edit AGENTS/coder.md        allow      -> writes agents/coder.md
Edit HOOKS/config.json      allow      -> writes hooks/config.json
Edit Rules/x.md             allow
rm AGENTS/coder.md          allow
```

The premise was verified independently: this machine's root filesystem is APFS in its default
case-insensitive configuration, so `agents/` and `AGENTS/` are one directory.

This is a **complete bypass of `guard.protectedPaths`** on both write surfaces, for any developer on
a default macOS install or a case-insensitive Windows volume. It predates this Circle and is
independent of `FUSION_ALLOW_RULES_WRITE`.

**The grant side is already closed.** `isProjectRulePath` resolves through `realpathSync.native`
after `49bb4da`, which folds case, so the exemption cannot be widened this way. Only the protection
side is open.

## Why the Turn 2 coder left it, and why that judgement was right

Closing it means making the protection check filesystem-dependent on both surfaces. Three shipped
documents describe that check as purely textual: `rules/protected-path-discipline.md`,
`README-hooks.md`, and the module docstrings. Changing the contract mid-Turn, inside a Circle whose
Directive is about something else, is the kind of scope drift the reviewer would rightly file.

Worse, a partial fix is actively harmful here. Fixing only the write-tool path would leave the shell
path open and teach an agent that the way past a deny is to reach for Bash, which is the precise
failure `rules/protected-path-discipline.md` exists to prevent.

## Candidate directions, not decided here

1. **Case-fold both sides of the match when the filesystem is case-insensitive**, detected once at
   load. Correct where it applies, and it makes the check platform-dependent: the same repository
   would protect differently on Linux and macOS, which is a property that has to be documented
   rather than discovered.
2. **Case-fold unconditionally.** Simpler and platform-independent. Over-protects on a
   case-sensitive filesystem, where `AGENTS/coder.md` is genuinely a different file. Over-blocking
   is the direction the guard already chooses elsewhere (the fail-closed rule).
3. **Resolve the protected path through the filesystem**, the way the grant now does. Most accurate
   and the most expensive: it makes every guarded call do filesystem work, and it changes behaviour
   for a path that does not exist yet, which is the common case for a `Write`.

Option 2 is probably right and is cheap, but it is a contract change to a security control and
wants a decision record rather than a patch.

## Note on scope

This does not block the current Circle's Directive: the flag's grant is closed against it. It does
block any claim that `protectedPaths` is enforced, which `rules/protected-path-discipline.md`
already qualifies for unrecognised programs and does not qualify for this.

---
Direction decided, not yet implemented: `260803-1419_*_how-should-the-protected-path-check-treat-the-case-of-a-path.md` — the user chose unconditional case folding (option 2 of this issue's candidate list) at the Turn 3 closing gate, 2026-08-03. The issue stays open because the bypass is still live: the decision records the direction, and the code change plus the correction of the three documents that state the "purely textual" premise belong to a later Circle.

---

**Reconciliation 260803-1516 (reconciler, domain `code`) — stays `_o_`, deliberately. The bypass is live at HEAD `fa81589`.**

Verified in code rather than inferred from the decision: `hooks/lib/paths.ts:37-38` (`matchesAny`) and `:77-79` (`collapseSegments`) contain no case handling of any kind, and `hooks/guard.ts` CHECK 2 (`:712`) matches against that pair. Neither write surface folds case. The measurement in `## What was measured` therefore still reproduces.

**The decision and this issue point at each other, checked both ways.** This issue's `Direction decided` footer names `260803-1419_*_how-should-the-protected-path-check-treat-the-case-of-a-path.md`, which exists. That record's `**Cross-references:**` names this issue back, by its full current path including the `_o_` marker, which is correct while the marker stands. The record's `## Answer` chooses option 2 of this issue's candidate list, and its `## Realisation` says "Not implemented. The change belongs to a later Circle." Nothing in the pair claims the code has moved.

**Why the marker stays `_o_` and not `_c_`.** An issue closes when the defect is gone, not when the direction is chosen. `rules/fusion-workbench-conventions.md` `## Issues vs Decisions` draws exactly this line: the decision record's answer event and its implementation event are distinct, and the defect this file names is the implementation side. Closing it here would leave a live protected-list bypass with no open record anywhere.

**What a later Circle inherits from this.** The code change is the smaller half. The larger half is that three shipped documents describe the protection check as purely textual — `rules/protected-path-discipline.md`, `README-hooks.md`, and the module docstrings — and one of them loads into every agent's context on every dispatch in every consuming project. `rules/protected-path-discipline.md` was rewritten this same Turn (`ce7a125`) on that premise, so the correction has to land with the code or the document is wrong from the commit that fixes it.

---

## Resolved — reconstructed by reconciliation 260804-1021-reconciliation.md, because the closing commit left no note

This issue was renamed `_o_` → `_c_` in `86a437a` with **zero content change** (`git log -M --find-renames=50% 6c447eb..HEAD` reports it as `R100`). The closure is substantively correct, but nothing in the file said so, and the file's own trailing sections still argued the opposite. The evidence is recorded here rather than left to the filename.

**The fix, verified at HEAD `cc012fc` rather than read off the commit message.** `hooks/lib/paths.ts:89-90` defines `foldCase(path) => path.toLowerCase()`, and `:148-149` applies it to both sides of the match inside `matchesAnyFolded`. The classifier consumes it at `hooks/lib/bash-mutation-guard.ts:261` (import), `:1307` and `:1311` (`ancestorOfProtected`, which folds its literal prefix by hand because it is a `startsWith` rather than a glob). Both write surfaces therefore fold. The measurement in `## What was measured` no longer reproduces.

**Two statements above this line are now false and are struck by this note rather than deleted, so the audit trail survives.**

1. The `Direction decided, not yet implemented` footer says the code change "belong[s] to a later Circle". It landed in this Circle, at `86a437a`.
2. The `Reconciliation 260803-1516` block says "stays `_o_`, deliberately. The bypass is live at HEAD `fa81589`." That was true at `fa81589` and is false at `cc012fc`.

**The documentation half this issue insisted on, checked separately, because it is the half that was easy to lose.** The issue's closing paragraph argued that the correction must land *with* the code or the shipped documents are wrong from the commit that fixes them. It did land: `rules/protected-path-discipline.md:33` is now the heading "### The match is textual, **and case-insensitive**" with the fold and its cost at `:36-49`, and `README-hooks.md:142` carries the same. That half is genuinely done.

**One thing the correction brought with it that nobody asked for.** `rules/protected-path-discipline.md:49` now names `FUSION_ALLOW_RULES_WRITE` in order to say the exemption does not fold. The same file still asserts at `:421` that "There is no override for a protected-path shell write." The flag is wired on the Bash surface at `hooks/guard.ts:410-412`, so the second sentence is false and the file now contradicts itself. That is not this issue's defect; it is tracked on `260803-1402_*_`, annotated by the same reconciliation.
