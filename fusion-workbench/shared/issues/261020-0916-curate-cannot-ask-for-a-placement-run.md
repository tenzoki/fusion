/fusion:curate cannot ask for a placement run
---
The skill passes no `**Placement:** on` line, so no command can propose moving content out of a consumer's CLAUDE.md; ruling `260916-1006_*_` option 1 (check = trigger, curator = tool) is unrealised because `260916-1326_*_` was resolved by refusing it on the skill-body growth bound.
---
**Filed by:** orchestrator (on the user's instruction), Kai Stalmann <ks@qantr.com>

In krk both curator runs (260917-1450, 260925-2312) carry `**Placement:** off`; the 124 KB section `Was man nicht sieht` was never proposed for relocation.

Evidence: `261020-0835-why-a-consumers-claude-md-grows-unchecked.md`

**Acceptance:** `/fusion:curate` has a documented way (e.g. `--placement`) that sends `**Placement:** on` on survey and apply dispatches, and `npm test` stays green under the growth bounds (by a cut or a head-room ruling).

---
Resolved: `/fusion:curate` takes a third optional argument, `--placement`, which sends `**Placement:** on` on both the survey and the apply dispatch (`skills/curate/SKILL.md` argument paragraph, Step 2 and Step 6); `agents/policy-curator.md` `## Dispatch parameters` and the `README-agents.md` `**Placement:**` row say so, and a plain run still proposes no relocation. Fits the growth bounds with no head-room or baseline edited (skills +410 of +450). Plan step 4 of `261020-0927-plan-consumer-claude-md-stays-lean.md`.
