The help update topic carries six install-from paragraphs against the release rule of three
---
`README-agents.md` `## Releasing` step 0 says the update topic "carries the last three install-from paragraphs and no more". It held three at `928d3ac7` and at `2713cbe1` and holds six at `dd24b2d4`.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Binds:** both hosts: `catalog/profiles/skill-help/parts/21-claude.md` and `21-prior.md`.

**Evidence.** `git show <commit>:skills/help/SKILL.md | grep -c '^\*\*Coming from'` gives 3, 3, 6. The merge `464dc7a2` added two paragraphs and `1f5b45a2` one, and nothing was dropped. A patch "joins its predecessor's paragraph" under ruling `261015-1559-does-the-help-update-topic-at-13-1-3-drop-the-v13-migration-paragraph-or-fold-the-patch-into-the-13-1-2-paragraph.md`, option 2.

**Fix.** Fold to three on the next release that touches the file, or amend the rule if the two-line history needs more. Not worth a rebuild alone.

**Acceptance.** The count above is 3, or `## Releasing` states the new bound.
