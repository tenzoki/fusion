# Does the help update topic at 13.1.3 drop the v13 migration paragraph, or fold the patch release into the 13.1.2 paragraph?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261015-1559-plan-migrate-step-7-recognises-json-control-without-a-local-session.md`, `260906-2014_*_the-help-topic-on-updates-has-missed-two-releases-and-names-none-of-the-last-three.md`, `261015-1549-migrate-step-7-recognises-json-control-without-session.md`

---

## Question

`README-agents.md` `## Releasing`, step 0, says the update topic in `skills/help/SKILL.md` `### 4. Update` "carries the last three releases and no more, so a release adds its own paragraph, relabels the ones below it and drops the oldest". The topic now holds three release paragraphs: "Coming from 13.1.1 or earlier" (13.1.2), "Coming from 13.0.0 or 13.1.0" (13.1.0 and 13.1.1 in one paragraph), and "Coming from a 12.2.3 install" (13.0.0, the JSON-control migration that halts every agent until `/fusion:migrate` has run). The rule and the precedent disagree. Read literally, 13.1.3 adds a paragraph and drops the 13.0.0 one. The 13.1.0/13.1.1 paragraph shows the other reading: patch releases that need no migration share one paragraph. The plan's release step has to pick one, and whichever it picks becomes the reading every later 13.x patch release follows. That is why this is a record and not a plan bullet.

## Options

1. **The rule as written.** Add "Coming from 13.1.2" for 13.1.3, relabel the 13.1.2 and 13.1.0/13.1.1 paragraphs, and drop "Coming from a 12.2.3 install".
   - Pros: no special case. The ceiling stays a count of releases. "Older than that" already sends an older install to `docs/upgrading-to-v13.md`, and every agent halts with "run /fusion:migrate" on an unmigrated workbench anyway.
   - Cons: the topic no longer tells a 12.x reader in one paragraph that 13.0.0 stops every project on the machine until it is migrated, and that per-project installs exist. Two citations leave (`$FUSION_SRC/docs/upgrading-to-v13.md` and its `## More than one checkout` anchor), so `reference-resolution-lint`'s `BASELINE` moves down and needs re-approval.
2. **Fold the patch into its predecessor's paragraph.** Relabel "Coming from 13.1.1 or earlier" so it covers 13.1.2 and 13.1.3, add one sentence for 13.1.3, and keep the other two paragraphs. The unit of three becomes a paragraph keyed by the install a reader comes from, and a patch release that needs no migration joins the paragraph above it.
   - Pros: follows the 13.1.0/13.1.1 precedent. The v13 migration paragraph stays while 13.x patches ship. Net growth is about one sentence, and no citation moves.
   - Cons: the wording of `## Releasing` no longer matches practice until it is reworded ("the last three install-from paragraphs"). That rewording is a `README-agents.md` edit, outside any growth bound, and belongs in the same release.
3. **Pin the major-version migration paragraph.** Follow option 1 for every other paragraph, but keep the paragraph of the last migration-bearing release however old it gets.
   - Pros: the one paragraph that matters most to a reader who skipped a major never drops.
   - Cons: a standing special case in a rule that a lint does not check, and the topic grows to four paragraphs.

## Constraints

- `skills/` is under its growth bound. A red is answered by a cut, never by a baseline or head-room edit (`README-hooks.md` `### Growth bounds on the shipped text`).
- Any move of `reference-resolution-lint`'s `BASELINE` is re-approved by the user with its attribution entry above the constant, as on 2026-10-15.
- The release itself waits on this answer, and plan steps 1 to 5 do not.

## Recommendation

Option 2. The precedent already treats patch releases with no migration as one paragraph, and the paragraph it would otherwise drop is the one a 12.x reader cannot afford to miss. Option 1 is the coherent alternative if the user prefers the rule's literal count, since "Older than that" still routes such a reader to the v13 note. Option 3 is the special case critical stance §2 warns against.

Answered: this record `## Options` — option 2: a patch release that needs no migration joins the paragraph above it; 13.1.3 is folded into the "Coming from 13.1.1 or earlier" paragraph, which is relabelled to cover it, and the release rule is reworded to match; ruled by user, Kai Stalmann <ks@qantr.com>
