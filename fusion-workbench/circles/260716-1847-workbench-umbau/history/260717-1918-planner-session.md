# Planner session — skill/agent glob zsh-nomatch hardening

**Date:** 2026-07-17 19:18
**Agent:** planner (Executors: coder)
**Circle:** 260716-1847-workbench-umbau (active)
**Input:** defect issue `260717-1903[o]-skill-shell-scripts-assume-bash-glob-abort-under-zsh.md`

## What I did

Planned the fix for the zsh no-match glob abort in skill and agent shell blocks.
Read the issue in full, then ran the research gate:

- Grepped `skills/*` and `agents/*` for the `.[!.]*` dotglob idiom, `for f in <glob>` loops, bare `dir/*.md` loops, and `circles/*` globs. Enumerated **14 vulnerable call sites across 9 files**.
- Verified the shell behavior empirically under the Bash tool (zsh 5.9): no-match glob aborts the eval before the `[ -e "$f" ]` guard; `find -mindepth 1 -maxdepth 1` survives; `ls … 2>/dev/null` still aborts (redirect does not suppress the shell's own nomatch error); `find` output is unsorted vs sorted glob; `find -name '*[o]*'` re-introduces the bracket bug; process substitution `< <(find …)` preserves counters in both zsh and bash where a `find | while` pipe loses them under bash.
- Read the existing path-literal lint (`hooks/lib/__tests__/path-literal-lint.test.ts`) to ground the guardrail recommendation.

## Findings that shaped the plan

1. **Counter-mutation trap.** migrate Step 4's type/review loops increment MOVED/COLLISIONS/FALLBACKS inside the loop. A naive `find | while` zeroes them under bash. The plan mandates process substitution there.
2. **Two bug classes compose at cleanup:67.** The escaped-bracket `*\[o\]*.md` is the correct fix for the bracket-expression bug and must be preserved; it is still no-match-fatal. The nomatch fix must use a `case` literal filter, never `find -name '*[o]*'`.
3. **Ordering audit.** All 14 sites classified; every one is order-independent except cleanup's display listing (cosmetic).

## Decision

Chose the issue's **Option 2** (`find`-driven loop) over Option 1 (`bash -c` wrapper) and Option 3 (document bash requirement): it removes the failure class at the source (`HYG-FIX-DESIGN`), is shell-agnostic, and avoids the quoting hazard of wrapping sed/awk/quote-bearing blocks in `bash -c '…'`. One integral transformation with two documented variants (process-sub for counter loops; case-filter for the literal-bracket site).

Recommended the narrow regression lint (reject raw `.[!.]*`), recommended against a broad `for X in <glob>` lint.

## Output

- Plan: `260717-1918[o]-skill-glob-nomatch-zsh-hardening.md` (6 steps, all coder, dependency-ordered; 2 Mermaid diagrams)
- This history log

## Handoff

Plan is Draft. Six steps, steps 1–5 independent, step 6 (lint) last. Awaiting user approval before any executor dispatch. Planner does not dispatch.
