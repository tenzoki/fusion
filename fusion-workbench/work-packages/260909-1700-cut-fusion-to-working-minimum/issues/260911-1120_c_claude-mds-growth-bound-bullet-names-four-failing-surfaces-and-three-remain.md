CLAUDE.md's growth-bound bullet names four failing surfaces and three remain

---

`CLAUDE.md` `## Conventions` carries the bullet **Four shipped surfaces have a failing growth bound (260815)**. It states "12 000 bytes for the always-on rule set (`hooks/lib/__tests__/rules-emission-golden.test.ts`)" as one of the four, and closes with "They are four budgets, not one: shrinking `skills/` buys `agents/` nothing, by construction."

That assertion is false at HEAD. The universal-core growth bound was retired in this session: the per-dispatch-path bound armed at step A2 charges every core byte to all eleven paths at zero head-room and binds 2 455 bytes earlier, measured at `9ff123c5` (core margin 2 625, tightest path `reviewer` 170). Three surfaces carry a failing bound now, not four, and the bullet's cardinality, its named constant and its worked example are each wrong.

**Evidence:** `README-hooks.md` `### Growth bounds on the shipped text`, which was brought to three rows in the same change; `hooks/lib/__tests__/rules-emission-golden.test.ts`, whose header's asserted list now runs to four entries with no universal-core bound among them.

**Why it was not fixed in the change that caused it.** Two reasons, both stated rather than assumed. `CLAUDE.md` is one of the three normative surfaces the curator reconciles against recorded history, and a release-shaped rewrite of it is owed at step D4 through that agent's user gate. And `CLAUDE.md` is a shared component of all eleven dispatch paths, so any edit there moves every one of them against a bound whose tightest path holds 170 bytes: the repair has to be net negative, which is a sizing decision rather than a correction.

**Acceptance test:** the bullet states a cardinality that matches the surfaces `hooks/lib/__tests__/surface-growth-bound.test.ts` and `hooks/lib/__tests__/rules-emission-golden.test.ts` actually fail on, names no retired constant, and the eleven dispatch-path totals are each at or below their baseline row afterwards.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

Filed at the commit that retires the bound, so the false statement cannot outlive the session that produced it. `rules/critical-stance.md` §5 is what makes this a defect rather than staleness: the bullet asserts a count beside a list, and the list moved.

---
Resolved: the bullet no longer states a cardinality, names no constant and carries no worked example of its own. It points at the one table in `README-hooks.md` `### Growth bounds on the shipped text` and says in as many words not to copy a figure out of it, because every figure has moved. It also names for the first time the bound that actually binds this file, `hooks/lib/__tests__/fixtures/dispatch-path.baseline` at zero head-room across all eleven dispatch paths, which is the sizing constraint the record said made the repair a decision rather than a correction. Applied as candidate L01 of the curator run `260911-1218-curator-run.md`, ruled by user, Kai Stalmann <ks@qantr.com>. The repair ran net negative as the record required: `CLAUDE.md` fell 91 613 to 91 369 bytes and every path gained margin, the tightest from 170 to 499.
