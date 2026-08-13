# The corrected sentence in `/fusion:direct` still overclaims, because the shaper also reaches the store

**Filed by:** coderev (review of Circle `260813-0858-playmaker-maintains-backlog-store`, commit `b995049`)
**Severity:** Low
**Scope:** `skills/direct/SKILL.md:77`

## What the correction says now

Plan step 5 corrected the clause that claimed a missing key is what keeps every backlog consumer in scope. The replacement (`skills/direct/SKILL.md:77`):

> This skill resolves no key into that store, so it cannot read or write an entry at all: a mechanical bound rather than a stated one. **That bound holds for every consumer of the backlog except the playmaker**, which does hold the write key and is kept inside its scope instead by the filing-versus-maintenance line …

The universal quantifier is still one exception short. The **shaper** resolves `SCAN_BACKLOG=shared/backlog` (verified by running `bin/fusion-paths shaper`), so it can read an entry, and `agents/shaper.md:86`–`88` has it rename an entry's marker to `_c_` and append a `Promoted:` line — modifying a file in the store. The bound as stated ("cannot read or write an entry at all") is false for the shaper on both halves.

## The two documents now disagree

The conventions table the same commit added names the shaper explicitly as a writer (`rules/fusion-workbench-conventions.md:213`): *"`_c_` | the playmaker, closing an entry or retiring a split's original; **the shaper, promoting an `_o_` or `_p_` entry to a Circle**"*. So one file this commit wrote says the shaper writes `_c_`, and another file this commit wrote says the shaper is covered by a bound that forbids writing at all.

Note that the plan anticipated the underlying mechanic and got it right (`.../planning/260813-1306_p_*.md`, `## Current State`): *"a rename and an append reach an existing entry through the read key alone — the shaper does exactly that when it closes a promoted entry."* The sentence in the skill body did not inherit it.

## Recommendation

Drop the quantifier rather than adding a second exception, since the sentence's real job is to explain **this** skill's own bound. Something like: this skill resolves no key into that store, so it cannot read or write an entry at all — a mechanical bound rather than a stated one. Which agents may touch the store, and under what gate, is the table in `rules/fusion-workbench-conventions.md` `## Backlog entries`. That leaves one authoritative writer list instead of a second, partial one.

---
Resolved: 'except the playmaker' became 'except its two writers', both named: the playmaker holds the write key; the shaper holds only the read key and writes anyway, renaming to `_c_` and appending a `Promoted:` line. Both are bounded by the same filing-versus-maintenance line rather than by the key set. Matches the `_c_` row of the conventions table added by the same commit.
