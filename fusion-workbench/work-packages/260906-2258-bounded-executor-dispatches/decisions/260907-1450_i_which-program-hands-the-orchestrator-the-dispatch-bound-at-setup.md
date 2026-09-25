# Which program hands the orchestrator the dispatch bound at Setup: a second line from `bin/fusion-turn-budget`, or a new helper beside it?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260907-0820_*_spec-bounded-executor-dispatches.md` (C1, the project-settable value); `260907-1450_*_plan-bounded-executor-dispatches.md` (Steps 3 and 8, which are written against option B); `260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md` (the `[ -x ]` guard both options carry); `260816-1915_*_how-much-of-the-configuration-loader-survives-when-its-only-leaf-is-the-turn-budget.md` (the two-layer loader both options read through)

---

## Question

C1 of the specification requires the stopping time to derive from one project-settable value, defaulting to 20 minutes. A prompt cannot merge configuration layers, so the orchestrator has to **read** the resolved value at Setup, exactly as it reads `orchestrator.maxTurns` through `bin/fusion-turn-budget`. The question is which program performs that read.

It has to be answered now because it is the one place the plan would otherwise be written on a preference. Both options work, both degrade to today's behaviour on an installed copy that predates them, and they differ in two currencies the plan is measured in: bytes added to `agents/orchestrator.md`, where 4 618 remain before `npm test` fails (`surface-growth-bound.test.ts`, measured 2026-09-07 over `abcaa823`), and whether the configuration loader's diagnostics reach the user once or twice.

## Options

1. **Option A, a new `bin/fusion-dispatch-bound`, with `hooks/dispatch-bound.ts` behind it.**
   - Pros: the helper's name says what it reads. It is the established one-question-one-helper shape, of which `bin/fusion-turn-budget`, `bin/fusion-count-sources` and `bin/fusion-session-domain` are three instances. `bin/fusion-turn-budget` is not touched at all, so no existing capability can regress. `install.sh` copies `bin/` and `hooks/` by directory, so nothing there changes.
   - Cons: costs a second `[ -x ]` guarded call block in `agents/orchestrator.md` Setup Step 2. Measured against the existing block, that is about 700 bytes, or 15 percent of the whole remaining head-room, spent on a naming improvement. Duplicates `findWorkbenchRoot` + `loadConfig` + the diagnostics loop in a second entry point. And **the loader's diagnostics then arrive twice**: `bin/fusion-turn-budget`'s own header makes it "the one call that reads the budget, so it is where the loader's advice is heard", and `agents/orchestrator.md` Setup Step 2 requires every diagnostic line to be repeated to the user in the Setup-complete summary. Two processes, two identical streams, one summary that says each advisory twice, unless the new helper suppresses its own, which is a silence the loader's `## Diagnostics rather than silence` section argues against.

2. **Option B, `bin/fusion-turn-budget` prints a second `KEY=value` line, `dispatch_minutes=<n>`.**
   - Pros: cheapest against the binding constraint, since the orchestrator already runs this block at Setup Step 2, so the addition is a sentence naming the second line and its unresolved branch, about 250 bytes rather than 700. One process, so the diagnostics are emitted once and repeated once. No new entry point, no second copy of the workbench-root-and-load shape. `turn-budget-lint.test.ts` asserts nothing about the number of output lines: it pins that no Turn-budget literal returns to the two prompts, that `<max-turns>` is still named, and that the helper is called behind `[ -x ]`. All three survive.
   - Cons: the helper's **name** then under-describes it. This project treats that seriously: `fusion-guard.json` was renamed to `fusion.json` on 260816 for exactly the reason that a name outliving its subject misleads. The mitigation is prose rather than a rename: the helper's own header is its authoritative documentation, and it would be rewritten to say it resolves the orchestrator's configured values, with `CLAUDE.md`'s Layout row following in the same commit.

3. **Option C, rename `bin/fusion-turn-budget` to something that covers both settings.**
   - Pros: name and behaviour agree.
   - Cons: rejected before reaching the pros and cons above, and recorded here so it is not re-proposed. An installed copy one release behind carries only the old name, so the `[ -x ]` guard takes its miss branch and the **Turn budget** goes unresolved for a release. That is a regression to a capability this work does not touch, imposed on every consuming project, to fix a name. It also moves five surfaces (`CLAUDE.md`, `README-hooks.md`, `agents/orchestrator.md`, `skills/setup/SKILL.md`, `turn-budget-lint.test.ts`).

## Constraints

- Whatever is chosen must degrade to **today's behaviour** when the value does not resolve: no stopping time travels in the dispatch prompt and every dispatch runs to its natural end. C1's last criterion requires it, and it is what makes an absent value harmless where an absent Turn budget is not.
- The call site carries `[ -x ]`, per `260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`.
- The default lives in exactly one place, `DEFAULTS` in `hooks/lib/config.ts`, and is restated in no shipped JSON file and in no agent prompt.
- Whichever is chosen, the byte cost lands on `agents/orchestrator.md`, which is the plan's governing constraint.

## Recommendation

**Option B.** The plan is written against it, at Steps 3 and 8.

Two reasons, in order of weight. The diagnostics argument is the substantive one and it favours B outright: option A either says every advisory twice or introduces a silence, and neither is better than one process printing two lines. The byte argument is the governing one: 450 bytes of the 4 618 is a real fraction of a constraint the specification already calls the shape-determining one, and the plan's own arithmetic (Step 14) leaves under 900 bytes of margin.

Against that stands one honest cost, and it is a naming cost rather than a behavioural one. It is answerable in prose and the plan spends that prose (Step 3 rewrites the helper's header, Step 15 the `CLAUDE.md` row).

**If the user rules for option A**, exactly two steps of the plan change and nothing else does. Step 3 creates `bin/fusion-dispatch-bound` and `hooks/dispatch-bound.ts` instead of editing `bin/fusion-turn-budget`, and Step 8 adds a second guarded call block to Setup Step 2 instead of a sentence. Step 14's arithmetic then has about 450 fewer bytes of margin, which is why that step re-measures rather than trusting this record's figure.

---
Answered: 260907-0657-orchestrator-session.md `### Which program hands the orchestrator the dispatch bound` — Option B, `bin/fusion-turn-budget` prints a second `KEY=value` line; chosen over a new helper on byte cost against the `agents/` growth bound and on emitting the loader diagnostics once; ruled by user, Kai Stalmann <ks@qantr.com>

---
Implemented: e1e625ae and 7e7708cf — option B is realised in both halves. `hooks/lib/config.ts` gains the `orchestrator.dispatchMinutes` leaf (interface, `DEFAULTS`, `CONTAINER_LEAF_RULES`, `loadConfig`), and `bin/fusion-turn-budget` prints `dispatch_minutes=20` as its second `KEY=value` line from the one existing process, with the helper's header and the module docstring rewritten to describe both lines. No second helper and no second guarded call block were added.
