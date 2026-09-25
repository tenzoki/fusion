# Planner session: the checkout registry names each instance

**Status:** Complete
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Circle:** 260904-1619-tracked-checkout-registry-names-each-instance
**Measured at:** HEAD `8437e365`

## What was read

The Circle record in full, `260904-1058-identity-per-instance-and-the-checkout-registry.md`, the four `260904-1058_*` decision records, the `git clean` issue, `rules/workbench-tracking.md`, `rules/design-diagrams.md`, `rules/critical-stance.md`, the layout tree and `### Who filed it` in the conventions, and the code at every site the Grounding names: `bin/fusion-identity`, `bin/fusion-events`, `hooks/lib/events-query.ts`, `hooks/hooks.json`, `bin/monitor`, `skills/setup/SKILL.md` Steps 0c and 0i, `skills/next/SKILL.md` Step 6.1.

## What was produced

`260904-1651_*_the-checkout-registry-names-each-instance-and-joins-one-persons-identities.md`, 15 steps, in this Circle's planning store.

One decision filed: `260904-1651_*_may-a-project-declare-that-it-does-not-want-a-checkout-registry.md`. The analysis named the question and left it unfiled because it arises only under option 1, which is the answer now in force.

## What the plan settles that the Directive left to the plan

**The join column for person aggregation is the git identity, not the hex.** Joining on the hex would leave an unregistered checkout of the reading person classifying as another person, where today it classifies as a further checkout of your own. That is a regression the constraint set rules out, and it is why the entry's `**Git identity:**` field is load-bearing while the hex stays the key of the entry and of every display lookup.

**One helper, `bin/fusion-checkout-name`, is the store's only writer and principal reader.** Four subcommands, five exit codes. The alternative measured in the analysis is five parsers of one file format. `bin/monitor` is the one concession, reading one field directly because it is a standalone copy with no plugin root at poll time, exactly as it reads `.checkout-id` today.

**The `git clean` defect gets a change of mechanism, not a detection.** Whether a mint is a re-mint is not decidable after the sweep, and the plan says so in its `**Decidability:**` line rather than asserting a weaker mechanism as an answer.

**Setup asks once per checkout and writes an entry whatever the answer.** The entry is what records that the question was asked, which is what makes the question ask-once without new class L state, and its default content reproduces today's behaviour exactly.

## Measurements taken

Growth bounds at HEAD, by the instrument's own arithmetic: always-on rule core 19 115 bytes free, `agents/` 9 202, `skills/` **606**, hook tests **448 lines**. `skills/setup/SKILL.md` is +11 254 against its baseline, the largest grown file on that surface and the file this Circle grows, so the budget is an acceptance criterion on step 5 rather than a note.

## Left standing

`fusion-workbench/portfolio.md:107` carries a store-prefixed Circle citation and fails `workbench-citation-lint`. It is playmaker-generated, predates this session, and is not this plan's to repair.
