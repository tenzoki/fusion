Three surfaces enumerate fusion's configuration leaves as two, and the plan that added the third names none of them

---

`orchestrator.dispatchMinutes` joined `hooks/lib/config.ts` in `e1e625ae` as a project-settable leaf (`hooks/lib/config.ts:187`, `hooks/lib/config.ts:251`, `hooks/lib/config.ts:429`, `hooks/lib/config.ts:629`). Three shipped surfaces still state that there are two leaves and are now false, and the plan that landed the leaf names none of the three in any step's `**Files:**`.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

The three:

- `skills/help/SKILL.md:117` — "It sets the orchestrator's Turn budget (`orchestrator.maxTurns`) and `citations.extraPaths`, a project's citation-bearing non-Markdown paths."
- `docs/working-model.md:125` — "The one thing left to configure is not the guard: `orchestrator.maxTurns`".
- `docs/fusion-intro.md:73` — "Die Zahl der Turns pro Sitzung ist das einzige Setting in `fusion.json`". This one was already false before the leaf landed: `citations.extraPaths` has been a leaf since 260831.

Derived, not asserted: `grep -rn "maxTurns" agents/ skills/ rules/ README*.md docs/` over the tree at `07ca022d` returns eleven sites. Eight of them are covered by a step of `260907-1450_*_plan-bounded-executor-dispatches.md` — Step 6 takes `templates/fusion.json` and `fusion.json`, Step 9 `agents/orchestrator.md`, Step 14 `skills/setup/SKILL.md`, Step 16 `CLAUDE.md` and `README-hooks.md`. `grep -n "skills/help\|docs/" ` over that plan returns no `**Files:**` entry for any of the three above.

This is filed **shared** rather than into either Circle: the leaf originates in `260906-2258-bounded-executor-dispatches`, and these are precisely the surfaces its plan leaves out, so it belongs to neither Directive. It is not a request to re-scope that plan — the other eight sites are its work and this record does not touch them.

`rules/critical-stance.md` §5: each of the three states a cardinality in prose without enumerating or deriving it, which is exactly the drift the norm was written from.

**Acceptance test:** no shipped surface states the number of configuration leaves without naming them; `docs/fusion-intro.md:73` no longer says `einzige`.
