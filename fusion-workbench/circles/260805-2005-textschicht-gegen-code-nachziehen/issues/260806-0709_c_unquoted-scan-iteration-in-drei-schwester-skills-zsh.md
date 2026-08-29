# Three sibling skills still iterate `$SCAN_*` unquoted — the zsh mode the `shared_of` fix closed in archive stays open in cleanup, cadence and circle-stash

**Filed by:** coderev (incremental review of commit `7ef2715`, Track 1 of `260805-2353_*_plan-textschicht-gegen-code.md`)
**Scope:** `skills/cleanup/SKILL.md`, `skills/cadence/SKILL.md`, `skills/circle-stash/SKILL.md` — cross-cutting, same defect class as the fixed `skills/archive/SKILL.md:51`
**Severity:** Medium — silent under-reporting in an autonomous pipeline (cleanup), contingent on how the running agent realises the interpolation

---

## The defect

Commit `7ef2715` (plan step 4) fixed `shared_of` in `skills/archive/SKILL.md:51` because zsh does not word-split an unquoted parameter expansion: a two-directory `SCAN_*` value held in a shell variable stays one word, and the derivation comes back empty. The fix's own comment states the mechanism. Three sibling sites carry the identical construct and were not hardened:

- `skills/cleanup/SKILL.md:67` — `for d in $SCAN_PLANS; do find "$WORKBENCH/$d" -mindepth 1 -maxdepth 1 \( -name '*_o_*.md' -o -name '*_p_*.md' \) 2>/dev/null | sort; done`
- `skills/cadence/SKILL.md:88` — `for d in $SCAN_HISTORY; do find "$WORKBENCH/$d" -maxdepth 1 -name '*.md' 2>/dev/null; done`
- `skills/circle-stash/SKILL.md:228` — `for d in $SCAN_HISTORY; do while IFS= read -r f; … done < <(find "$WORKBENCH/$d" … 2>/dev/null); done`

When the running agent realises the resolver keys as **actual shell variables** (an assignment in the same Bash call, the natural way to "hold the emitted values"), zsh — the Bash tool's shell in this environment — keeps `$SCAN_PLANS` one word. `find` then receives a single nonexistent path with an embedded space (`…/circles/<x>/planning shared/planning`), errors, and the `2>/dev/null` swallows the error. The loop yields nothing, exit 0.

Consequences per site:
- **cleanup Step 2**: unfinished plans/issues silently missed — the exact harm the step's own prose warns about at `skills/cleanup/SKILL.md:62` ("Skim both, or unfinished work in one of them is silently missed"). Cleanup runs autonomously, without a gate.
- **cadence Step 3**: the digest is built from an empty history set and reads as a quiet week.
- **circle-stash**: the newest-history-file fallback finds nothing; the stash records no history file where one exists.

## The contingency, stated honestly

If the agent instead substitutes the resolved values **textually** into the block before running it (the house pattern per issue `260731-2246_*_cadence-empty-key-expansion-writes-a-silently-empty-digest.md`), the two paths are separate words in the command text and the loop is correct in any shell. The defect fires only in variable-assignment mode. The archive fix chose a shell-neutral construct precisely so both modes work; these three sites work in one mode only. Not reproduced in a live skill run; the mechanism is verified in isolation (`zsh -c 'f(){ for p in $1; do echo "[$p]"; done; }; f "a b"'` → one iteration `[a b]`; measured 260806 during this review, same measurement as Gesamtreview finding `260805-1904`).

## Distinction from the known finding

`260731-2246` covers the **empty-expansion** mode of the same sites (unset key → zero iterations) and recommends a consumer-side non-empty assertion. That assertion does not catch this mode: here the key is non-empty and correctly resolved — it is the word-splitting that fails. Two failure modes, one construct.

## Recommended fix

Apply the archive fix's construct verbatim at all three sites: `for d in $(printf '%s\n' "$SCAN_PLANS")` (respectively `$SCAN_HISTORY`) — both bash and zsh field-split an unquoted command substitution, and store paths carry no whitespace or glob characters. One-line change per site; no behavior change in textual-substitution mode.

---
Resolved: 2026-08-06 — coder applied the archive fix's construct (`for d in $(printf '%s\n' "$SCAN_*")`, with the same explanatory comment) at all three sites: `skills/cleanup/SKILL.md` Step 1.2, `skills/cadence/SKILL.md` Step 3, `skills/circle-stash/SKILL.md` 7.3. Each snippet verified standalone under both `zsh -c` and `bash -c` with a two-path SCAN value (Circle store + shared store): both paths enumerated in both shells at all three sites. Commit follows via the orchestrator (Phase 2 Step 3b).
