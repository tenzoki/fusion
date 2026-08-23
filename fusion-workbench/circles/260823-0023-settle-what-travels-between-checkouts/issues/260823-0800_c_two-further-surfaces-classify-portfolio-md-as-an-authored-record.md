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

---
Resolved: Both named sites now agree with `rules/workbench-tracking.md` class L, in this Circle (`260823-0023-settle-what-travels-between-checkouts`), as a scope widening the user granted at the plan gate rather than a numbered plan step.

`hooks/lib/staging-drift.ts`: the `portfolio.md` entry moved from `ROOT_RECORDS` to `LIVE_STATE`, with the reason `regenerated in full by every playmaker run`, so `classify` returns `in-flight` for it and it can never enter `faults`, the signature or the sentence handed to the model. `ROOT_RECORDS` is kept, empty, together with its branch in `classify`: the dispatch chose that over the removal this record proposed, because the workbench root is where a new surface arrives and the next authored one there should cost a line rather than a design decision taken twice. The doc comment carrying `not machine-refreshed` is gone; that phrase now appears nowhere under `hooks/`, `agents/`, `rules/` or `skills/`. The header's `record` bullet and the `LIVE_STATE` comment (`the first five` -> `the first six`, now naming class L) were corrected with it.

`agents/orchestrator.md`: the staging-check class table's `record` row drops `portfolio.md` from its examples and keeps `a Circle record, or anything under an artifact store`. No reasoning was restated there; the rule holds it.

**The behavioural consequence, measured before the change and not as this record predicted it.** `measureStagingDrift` runs `git status --porcelain --untracked-files=all -- <workbench>` with no `--ignored`, and `00ce4f0` both untracked `fusion-workbench/portfolio.md` and gave it an ignore rule, so git omits the path from that output entirely: verified at HEAD `3ee8eaf` that the command returns only `orchestrator-events.jsonl`, and that adding `--ignored` is what makes `!! fusion-workbench/portfolio.md` appear. No `record` row was reaching a Turn boundary or a Cleanup in this checkout, and none was going to. `classify` is a pure function on a path and did still answer `record`, which is what made the change worth taking: the reachable case is a consuming project that tracks its own workbench, where fusion ships no ignore rule, and there the classification was advice against fusion's own rule.

Estimate corrected: this record put the test cost at three assertions. `portfolio.md` was the suite's stand-in for an authored record in nine cases across two files, so the fixture moved to a Circle record (`CIRCLE_RECORD`), which also gives the `*_circle.md` branch of `classify` its first coverage. `portfolio.md` stays in the fixture and is now pinned as `in-flight` in the do-not-cry-wolf case.

Files: `hooks/lib/staging-drift.ts`, `agents/orchestrator.md`, `hooks/lib/__tests__/staging-drift.test.ts`, `hooks/lib/__tests__/commit-message-path.test.ts`, `hooks/lib/__tests__/fixtures/surface-growth.golden`, `hooks/dist/lib/staging-drift.{js,d.ts}`.

Left standing, and outside this dispatch's file list: `hooks/staging-drift.ts:23`, the CLI header's worked output example, still renders `record M portfolio.md UNSTAGED (the Circle portfolio briefing - ...)`, which is output the classifier can no longer produce. It is documentary, it is a third site this record did not name, and it wants the same one-line correction.
