`fusion-write create --kind plan` files a plan with step anchors missing, and reports nothing, when a step number recurs or a tagged numbered line sits outside the steps section
---
Since `fj03d` `ac60df2b` a plan filed by `create` takes its step anchors from `scanPlan` in `hooks/lib/legacy-import.ts`. That reader was written for the import of legacy plans. Used for a new plan it does two things the caller is not told about: a number that occurs twice anchors no step, and a numbered line carrying a bracket tag counts as a step wherever it stands in the file. The run answers `result=landed`, exit 0, with nothing on stderr. A step without an anchor can never be tracked afterwards, because `transition --steps` refuses an id the plan lacks and no operation adds one.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md, 261005-0527_*_a-plan-filed-by-fusion-write-create-carries-no-step-anchors-so-its-steps-cannot-be-tracked.md

Severity: Medium. Scope: `hooks/lib/record-write.ts` (`creation`, the `kind === "plan"` branch), `hooks/lib/legacy-import.ts` (`scanPlan`), `bin/fusion-write` (header, the `create` row), `agents/implementation-planner.md` (step 5 of its process), all on `fj03d` at `cd1b5522`.

**Evidence.** Read at `cd1b5522`, and run on a scratch JSON workbench built from `git archive cd1b5522` outside both trees.

- `hooks/lib/record-write.ts`, `creation`: `const ids = scanPlan(text.split("\n")).steps.map((s) => s.id); payload.steps = ids.filter((id) => ids.indexOf(id) === ids.lastIndexOf(id)).map(...)`. A duplicated id is filtered out and no line is written about it.
- `hooks/lib/legacy-import.ts`, `scanPlan`: `if (step && (step[3] !== undefined || inSteps)) steps.push(...)`. `step[3]` is a bracket tag of capitals, so a numbered line with such a tag is a step outside `## Implementation Steps` too.
- Run 1: a plan whose `## Implementation Steps` holds `### Part A` with steps 1 and 2 and `### Part B` with steps 1 and 3. `create` printed `result=landed`, exit 0. `show` answered `steps: [{"id":"2"}, {"id":"3"}]`. A later `transition --steps '[{"id":"1","state":"done"}]'` was refused: `unresolved-reference/unknown-step-id`.
- Run 2: a plan with steps 1 and 2 under `## Implementation Steps` and the line `1. [HIGH] the bound is tight` under `## Risks & Mitigations`. `create` printed `result=landed`, exit 0. `show` answered `steps: [{"id":"2"}]`.
- The header of `bin/fusion-write` says "a plan's numbered steps become its step anchors", and `agents/implementation-planner.md` says `create` "anchors each numbered step under `## Implementation Steps`". Neither names the two exceptions.
- The one test, `hooks/lib/__tests__/record-write.test.ts` ("a plan filed by create anchors each numbered step ..."), has untagged numbered lines outside the section and no repeated number, so it passes with both behaviours in place.

**Fix direction.** `create` reads only numbered lines under `## Implementation Steps` (a bracket tag has no meaning in a new plan). On a repeated number it either refuses with a usage or `unread` line that names the number, or lands and prints one stderr line per number left without an anchor. The first is the safer one: an anchor lost at filing cannot be added later. The step grammar a live writer needs then no longer has to live in the legacy import module.

**Acceptance.**

1. A plan with `1. [HIGH] ...` under a section other than `## Implementation Steps` is filed with an anchor for step 1 of the steps section. A case in `record-write.test.ts` pins it and fails on the code at `cd1b5522`.
2. A plan whose steps section repeats a number is refused, or filed with a stderr line naming each such number. A case pins the chosen behaviour and fails on the code at `cd1b5522`.
3. The header of `bin/fusion-write` and step 5 of `agents/implementation-planner.md` state the uniqueness requirement in one clause each, inside the dispatch-path bound.
4. No byte under `codec/dist/` changes.

Executor: `code-implementer`.
