FUSION_ALIAS is exported and read by nothing, while the release note names it a rendering site

---
The SessionStart hook exports `FUSION_ALIAS`. No agent prompt, skill body, `bin/` helper or hook reads it. `docs/upgrading-to-v10-21.md` counts it as one of the four places that now render the alias, so the note describes a capability the tree does not have.

---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Medium. The export costs nothing at runtime; the release note's claim is what makes it a defect rather than a spare part.

## Evidence

- `hooks/hooks.json:24` — the writer: `[ -n "$a" ] && printf 'export FUSION_ALIAS=%q\n' "$a" >> "$CLAUDE_ENV_FILE"`.
- `hooks/lib/__tests__/hooks-wiring.test.ts:182,185` — the export is pinned by test, which makes it look load-bearing.
- Reader search over `agents/`, `skills/`, `bin/`, `hooks/`, `rules/`, `CLAUDE.md`, `README*.md`: the only non-workbench hits are the writer, its test, and prose. `bin/fusion-events:282` reads `FUSION_PERSON` and `FUSION_CHECKOUT` and not this one; `bin/monitor` reads the entry file directly.
- `docs/upgrading-to-v10-21.md:13` — "Four places now render the alias beside or instead of the hex: the monitor header, `/fusion:next`'s refusal …, the `party=` lines …, and `FUSION_ALIAS`, which SessionStart exports where an entry exists." Three of the four render; the fourth is a variable nothing reads.

## A second property worth stating

The export is resolved once, at SessionStart. `/fusion:setup` Step 0i registers the checkout *during* the session, so in the session where a checkout first registers, `FUSION_ALIAS` is never set. Whoever gives the variable a reader has to hold that.

## Acceptance test

Either a consumer names `$FUSION_ALIAS` (an agent prompt's dashboard line or `/fusion:setup`'s Done report are the plausible ones) and the release note's count stands, or the export and its wiring assertion go and the note drops it from the four.
