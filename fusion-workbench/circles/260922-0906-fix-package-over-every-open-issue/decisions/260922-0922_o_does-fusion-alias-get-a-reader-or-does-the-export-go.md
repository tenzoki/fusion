# Does `FUSION_ALIAS` get a reader, or does the export and its wiring assertion go?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260905-0933_*_fusion-alias-is-exported-and-read-by-nothing-while-the-release-note-names-it-a-rendering-site.md, 260922-0922_*_the-51-open-issues-at-451bb312-worked-autonomously-as-one-package.md

---

## Question

`hooks/hooks.json` line 24 exports `FUSION_ALIAS` at SessionStart, `hooks/lib/__tests__/hooks-wiring.test.ts` pins the export (lines 151, 175, 178), and no agent prompt, skill body, `bin/` helper or hook reads it (measured at `451bb312`: the only hits outside the writer and its test are two sentences in `docs/upgrading-to-v10-23.md`). The defect record offers two closures and neither can be taken without a ruling: giving the variable a reader adds a surface, and removing the export is a feature removal, which under `**Mode:** autonomous` is a file-and-skip gate (`agents/orchestrator.md` `## Human Gate Rules`, *Destructive operations*). The package this plan runs cannot pick either on its own.

## Options

1. **Remove the export, the three wiring assertions and the sentence in the v10.23 note**: the tree stops claiming a capability nothing uses.
   - Pros: no dead surface; the note's count becomes true by subtraction; one commit.
   - Cons: a feature removal; a consuming project's own shell aliases or prompts may read the variable without fusion knowing (nothing measured says so).
2. **Give it one reader**: the most plausible is `bin/fusion-events presence`, which already reads `FUSION_PERSON` and `FUSION_CHECKOUT` from the environment for the reader's own party line (`bin/fusion-events` around line 282) and could take the reader's alias from `FUSION_ALIAS` rather than a registry lookup.
   - Pros: the note's claim stands; the export is load-bearing.
   - Cons: a reader added to justify an export, not because the reader needed it; the export is resolved once at SessionStart, so in the session where a checkout first registers the variable is unset (the record's second property) and the reader must fall back to the registry anyway.
3. **Keep the export, drop the "renders" claim**: the note says the variable is exported for the user's own shell, not that fusion renders it.
   - Pros: no code moves.
   - Cons: keeps a variable read by nothing, which is the title of the defect.

## Constraints

- `hooks/lib/__tests__/hooks-wiring.test.ts` sits on the hook-test growth bound; option 2's fallback test costs lines, option 1 frees three.
- The v10.23 note is a release note and describes what v10.23 did; whichever option lands, the note's sentence is edited to describe the tree as it now stands, with the change dated.

## Recommendation

Option 1. The measurement is three weeks old and unchanged: nothing reads it. Option 2 would add a reader whose only justification is the export, and the SessionStart-only resolution makes it an unreliable one.
