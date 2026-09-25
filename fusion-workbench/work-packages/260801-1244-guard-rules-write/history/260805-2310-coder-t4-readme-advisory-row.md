# Coder session — T4: README Advisory-only row vs the floor

Status: Complete

## Task

Resolve `260805-2248_*_readme-advisory-zeile-behauptet-fail-closed-steht-ab-obwohl-der-floor-ihn-am-leben-haelt.md`: `README-hooks.md:138` claimed a declared empty `protectedPaths` list stands the shell protected-path check down "fail-closed rule included", contradicted by the floor added in the same sentence.

## What was done

- Verified the evidence before editing: `hooks/lib/config.ts:687-692` keeps `fusion-guard.json` in both spellings (bare name + absolute path) on the effective list whenever the file exists — and it must exist to declare the empty list; `hooks/lib/bash-mutation-guard.ts:3112` gates the fail-closed pass on `opts.protectedPaths.length > 0`, so it stays live against the two floor entries. Review record `reviews/260805-01-coderev-inkrementalreview-step7-doku-durchgang.md` carries the measurement (`mv $A $B` denies with floor-only list, allows with truly empty list).
- Rewrote the row — label and body both, since "warns, never blocks" carried the same false claim. New text states the narrowing-not-standing-down semantics, points at the Per-project-configuration section for the floor, and names the measured fail-closed deny.
- Grepped all ten `fail-closed` mentions in `README-hooks.md`: no other sentence ties the empty list to disabling it. Line 179 (the floor paragraph) already states the truth and needed no change.
- Issue: appended `Resolved:` footer, renamed `_o_` → `_c_`.

## Deliberately not touched

`rules/protected-path-discipline.md:41` — same false half-sentence, but it belongs to Circle 260805-2005-textschicht's issue `260805-1840_*_ppd-leere-liste-steht-den-check-nicht-ab.md`, already filed.

## Changed files

- `README-hooks.md` (line 138, one table row)
- `260805-2248_*_readme-advisory-zeile-…` (footer + rename)

Not committed, per task instruction.
