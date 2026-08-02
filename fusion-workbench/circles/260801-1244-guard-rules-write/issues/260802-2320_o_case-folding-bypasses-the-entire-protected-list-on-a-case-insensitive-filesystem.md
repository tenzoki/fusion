Case folding bypasses the entire protected list on a case-insensitive filesystem

---

**Domain:** code
**Severity:** High
**Filed by:** orchestrator, from a residual the Turn 2 coder measured and could not close in scope
**Cross-references:** `hooks/guard.ts` CHECK 2, `hooks/lib/paths.ts` (`collapseSegments`,
`matchesAny`), `hooks/lib/bash-mutation-guard.ts`,
`circles/260801-1244-guard-rules-write/issues/260802-2230_p_check-2-matches-the-protected-list-un-canonicalised-so-dot-slash-agents-coder-md-is-not-protected.md`
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
