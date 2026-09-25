Step 0i points at "both bullets" of orchestrator Setup step 2, and one bullet defines the fragment

---
`skills/setup/SKILL.md:342`: "Hold the identity fragment `<ID>` as `$FUSION_SRC/agents/orchestrator.md` Setup step 2 defines it, both bullets: the second extends it with the `session_id` a SessionStart hook printed into your context". At `e9dc9b2` one bullet defines `<ID>` (`agents/orchestrator.md:103`, "Who, which checkout, which session"), and it already carries `session_id`; the next bullet (`:104`) is the Turn budget. There is no second bullet to extend it, so "both" counts two where one stands, and the `Resolved:` note of C4 record `260826-1113_*_the-setup-skill-calls-the-id-fragment-the-pair-in-the-commit-that-removed-that-word-elsewhere.md` restates the same two-bullet shape as the fix.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260826-1113_*_the-setup-skill-calls-the-id-fragment-the-pair-in-the-commit-that-removed-that-word-elsewhere.md` (its `Resolved:` note, line 61); `rules/critical-stance.md` §5; commit `abb0238`

## Evidence

`grep -n '<ID>' agents/orchestrator.md` inside Setup step 2 returns line 103 only; `sed -n 104p` is the Turn-budget bullet.

## Fix direction

"Hold the identity fragment `<ID>` as `$FUSION_SRC/agents/orchestrator.md` Setup step 2 defines it (the bullet 'Who, which checkout, which session'): three keys, `session_id` from the line a SessionStart hook printed into your context, and no line means no key." Then a `Revised by:` line on record 1113 pointing at the fixing commit.

## Acceptance

`grep -c "both bullets" skills/setup/SKILL.md` is 0, and the sentence names the one bullet by its lead phrase.

---
Resolved: 260827-2103 by coder. Step 0i now reads "as `$FUSION_SRC/agents/orchestrator.md` Setup step 2 defines it (the bullet \"Who, which checkout, which session\"): three keys, `session_id` from the line a SessionStart hook printed into your context, and no line means no key". `grep -c "both bullets"` is 0. C4 record `260826-1113_*_the-setup-skill-calls-the-id-fragment-the-pair-in-the-commit-that-removed-that-word-elsewhere.md` carries one appended dated line correcting its Resolved note.
