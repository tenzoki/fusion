The holder-naming section documents a command, a consumer and a field shape that are all gone

---

`bin/fusion-checkout-name` `## Naming a holder, and why the name never enters a comparison` states a rule in the present tense and offers a worked case a reader cannot open. The command it names was deleted, the render it describes exists nowhere, and the field shape it says is parsed is not the shape the work-item record writes.

---

**Filed by:** consultant, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260916-2145_*_a-gates-remediation-text-names-two-commands-that-do-not-exist-and-no-gate-resolves-a-command-token.md, 260904-1058_*_is-the-checkout-alias-the-identifier-or-an-attribute-of-the-minted-one.md

## The defect

Three statements in that section are false against the tree, and each fails differently.

**The worked case cannot be opened.** `bin/fusion-checkout-name:216` reads "`/fusion:next` Step 6.1 is the worked case". `skills/next/` was deleted in `git:2a785ba2` (the v11 agent and skill cut). The live roster is `ls -1 skills/`, thirteen directories, and `next` is not among them.

**The render it describes has no site.** The section says a site that refuses because another checkout holds something renders that holder through `resolve` and through nothing else, and prints `held by <person> on <alias>` (`bin/fusion-checkout-name:220`). No shipped file carries that string outside this header. Of the four `resolve` call sites, three pass this checkout's own hex (`skills/cadence/SKILL.md:37`, `skills/check/SKILL.md:242`, the SessionStart command in `hooks/hooks.json`) and one passes a foreign hex for a message byline (`skills/news/SKILL.md:96`). None of them refuses anything, so the rule binds nobody.

**The field shape is wrong.** The section says the site "reads the claim's `<person>, checkout <id>`". A work item's claim is `**Claim:** <8 hex> — <person>, YYMMDD-HHMM` (`rules/fusion-workbench-conventions.md` `## Backlog entries — work items`, the record template). The hex leads and the literal `checkout ` does not appear, so the described parse would not find the identifier in a record written today.

## Why a pointer repair is not enough

Re-pointing `/fusion:next` at a surviving file closes nothing here: there is no surviving file that does what the sentence says, and the parse it describes is against a superseded shape. What the section still carries and no other text does is the bound in its own title, that the name never enters a comparison, which `bin/fusion-paths` and `bin/fusion-claimed-item` both depend on. That bound is worth keeping; the consumer narrative around it is what has no referent.

## Acceptance test

Every `/fusion:<name>` token in `bin/fusion-checkout-name` names a directory under `skills/`. Every render the header describes in the present tense is produced by a file in the tree, or the header states it as retired. Every field shape the header says is parsed matches the record template in `rules/fusion-workbench-conventions.md` `## Backlog entries — work items`. The bound that the alias never enters a comparison survives the edit in some form.

---
Resolved: `bin/fusion-checkout-name` `## Naming a holder, and why the name never enters a comparison` keeps its heading and its bound (the comparison runs on the hex, and no caller routes one through `resolve`) and replaces the worked case with the general rule in the present tense: a site rendering another checkout's holder reads the hex off `**Claim:** <8 hex> — <person>, YYMMDD-HHMM` (the template in `rules/fusion-workbench-conventions.md` `## Backlog entries — work items`), calls `resolve <hex>` behind `[ -x ]`, and renders the `person=` and `alias=` lines it gets, each absent when the entry lacks it. The section states that no refusing site ships today and names the four `resolve` callers that do (`skills/cadence/SKILL.md`, `skills/check/SKILL.md`, `hooks/hooks.json`, `skills/news/SKILL.md`). The `/fusion:next` sentence, the `held by` render and the `checkout <id>` parse are gone; the file carries no `/fusion:<name>` token that names no directory under `skills/`. Plan `260921-1726_*_the-33-open-defects-of-the-11-9-1-survey-worked-autonomously-as-one-package.md` step 8, fixed in the commit that carries this line.
