The campaign skill sends the user to "the overview's package rows" for a control path, and the overview prints none
---
`skills/campaign/SKILL.md` `## Step 5: lanes`, after the user answers 1 to the autonomy question, says `<control path>` is "its package's control path (the `path` of the overview's package rows, or of the codec's `list`)". `bin/fusion-campaign overview` prints no package row and no path: its `held=` and `lane=` rows carry container names (`bin/fusion-campaign` `## Output of overview`). The one route the sentence leaves is "the codec's `list`", which the body does not spell as a command; a reader following the first half looks for a row that is not there, and `set-mode --record <control path>` is the write that makes every lane member autonomous, so a wrong path there is a refused write per member.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Executor:** code-implementer (the part is under `catalog/profiles/skill-campaign/parts/`, rendered into `skills/campaign/SKILL.md`)

**Evidence.** `skills/campaign/SKILL.md` `## Step 5: lanes`, the paragraph beginning "On 1, per lane member"; `bin/fusion-campaign` `## Output of overview, one KEY=value per line` (`held=<checkout>\t<alias|->\t<package>\t…`, `lane=…\t<held|none>\t<next|none>\t…`: container names, no path); `rules/fusion-workbench-conventions.md` `## Work packages` (the control file is `work-packages/<container>/package.json`).

**Acceptance.** The sentence names a path the reader can form from what is on the page: `work-packages/<container name>/package.json`, the container name being the lane member as the `lane=` row and the proposal file spell it, and drops "the overview's package rows". The skills surface stands at 5 bytes of head-room (`README-hooks.md` `### Growth bounds on the shipped text`): the edit is byte-neutral or shorter, or a raise the user rules on. `cd catalog && npm run render -- claude && npm test` and `cd hooks && npm test` green.

**Cross-references:** `261108-2301-plan-campaign-the-frame-for-work-spread-over-several-checkouts.md` (step 20)

Resolved: fixed by code-implementer in `catalog/profiles/skill-campaign/parts/06-claude.md`, rendered into `skills/campaign/SKILL.md` Step 5: `<control path>` is `$OUT_PACKAGES/<container name>/package.json`, the name as the `lane=` row and the proposal file spell it; "the overview's package rows" and the unspelled `list` route are dropped. The path is spelled through `$OUT_PACKAGES` rather than the acceptance's `work-packages/…` because `path-literal-lint.test.ts` admits a type-folder literal in no skill body, and the skill's Step 1 already holds `bin/fusion-paths campaign`'s keys. +9 bytes, the skills surface at 245 877 of 245 985; no head-room moved.
