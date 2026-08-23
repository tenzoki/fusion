Two further surfaces classify portfolio.md as an authored record, and C2 retires only the third

---

C2 moves `fusion-workbench/portfolio.md` from the records group to class L, live state that never leaves the checkout, and closes `shared/issues/260816-1049_*_the-split-calls-portfolio-md-not-machine-refreshed-and-the-playmaker-regenerates-it-in-full.md` on that ground. That defect names one location, `rules/workbench-tracking.md`. Two other surfaces carry the same retired classification and are outside C2's acceptance criteria, so the closure leaves them standing.

---

**1. `hooks/lib/staging-drift.ts`, the `ROOT_RECORDS` constant.**

```
/** The root-anchored records: authored text, not machine-refreshed. */
const ROOT_RECORDS: { path: string; why: string }[] = [
  { path: "portfolio.md", why: "the Circle portfolio briefing" },
];
```

The doc comment repeats the exact clause C2 removes from the rule, and the classification has a behavioural consequence rather than being decorative. `classify` returns `record` for that path, and `record` is one of the two fault classes, so a workbench in which `portfolio.md` is modified and unstaged is reported as an unstaged record and the model is told to stage it. After C2 the file is machine-regenerated live state, which the same module already classifies as `in-flight` and never as a fault. The correct home for the entry is `LIVE_STATE`, whose comment block explicitly cites `rules/workbench-tracking.md` as the split it applies.

In this repository the entry becomes unreachable once C2 ignores the path, because the measurement runs `git status --porcelain --untracked-files=all` without `--ignored`. It stays reachable in any consuming project that tracks its own `portfolio.md`, which fusion ships no rule against.

`ROOT_RECORDS` holds one entry. Moving it empties the constant, which then wants removing along with its branch in `classify` and the four comment passages that name it, rather than being left as a dead array.

**2. `agents/orchestrator.md:1138`, the staging-drift class table.**

> | `record` | an authored artifact no commit carries — `portfolio.md`, a Circle record, or anything under an artifact store | add it to the next Step 3b staging list, written out in full and absolute |

The table documents the module above, so the two move together or they disagree. It is one phrase in a prompt that C2 opens anyway for the sequence-diagram repair.

---

## Why this is filed rather than folded into C2

The dispatch that produced C2's plan bounded the plan's scope explicitly and this is outside it. The scope decision is the user's: widening C2 to cover both surfaces is a small, coherent addition, and closing `260816-1049` without them leaves one claim retired in one place and live in two.

## Cost of the fix, so the scope decision has a number

`hooks/lib/staging-drift.ts` is a hooks source file, so the change requires `npm run build` and the committed `hooks/dist/` to match, which `hooks/lib/__tests__/committed-dist.test.ts` enforces. Three assertions in `hooks/lib/__tests__/staging-drift.test.ts` expect `portfolio.md` to come back as `record` and would move with it. The `agents/orchestrator.md` edit is one table cell. Net effect on the hook-test line budget is roughly neutral; the `agents/` budget change is negligible.

## Verified

Read at HEAD `3ee8eaf`: `hooks/lib/staging-drift.ts` `ROOT_RECORDS` and its use in `classify`, the `LIVE_STATE` comment block naming `rules/workbench-tracking.md`, `agents/orchestrator.md:1138`, and the three `portfolio.md` assertions in `hooks/lib/__tests__/staging-drift.test.ts`.

**Found by:** planner, while planning C2.
