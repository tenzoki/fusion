The dead Step 3b address survives in seven places outside the file its repair covered

---

`agents/orchestrator.md` has no Step 3b; `grep -c 'Step 3b' agents/orchestrator.md` returns 0 and the prompt's five step headings are Step 1 to Step 5. The repair that removed nine such tokens was scoped to `hooks/lib/staging-drift.ts`. Seven more stand elsewhere, one of them inside an assertion message a failing run prints to a reader.

---
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260911-1332_*_the-staging-drift-header-says-the-history-entry-is-still-written-and-cites-a-step-3b-the-prompt-no-longer-has.md` (terminal; the same subject, scoped to one file and met on its own terms); `260910-1809_*_the-turn-and-phase-vocabulary-survives-in-132-places-across-the-shipped-text.md` (terminal; the sweep these survived)

**The sites, at HEAD `9ceb5cc7`:**

| site | kind |
|---|---|
| `hooks/tracker.ts:395` | doc comment |
| `hooks/dist/tracker.js:347` | the compiled copy of the line above |
| `hooks/lib/__tests__/staging-drift.test.ts:8` | file header, naming the staging rule's address |
| `hooks/lib/__tests__/commit-message-path.test.ts:136` | doc comment on `NAMEABLE_LEFTOVER` |
| `hooks/lib/__tests__/commit-message-path.test.ts:155`, `:189`, `:222` | three test names |
| `hooks/lib/__tests__/commit-message-path.test.ts:160` | the message an assertion prints on failure |

**Nothing executes on the string, and that is the whole of the good news.** The three test names and the assertion message are labels; the parser reads `/tmp` paths out of the prompt text and not a step heading, so the suite is green and stays green. The cost is that a run which fails at `:155` tells whoever reads it to look at a step that does not exist, in a prompt whose actual site is `### Step 4 — commit`.

**Why it is a new record.** Both records that would otherwise carry it are `_c_`, and `rules/fusion-workbench-conventions.md` `## Terminal states are history` disallows an edit back to a live state. The earlier repair's scope was one file and its acceptance test is met inside that file.

**Acceptance test:** `grep -rn 'Step 3b' hooks/ agents/ skills/ rules/` returns nothing, or returns only text whose subject is that the step was renamed. Each repaired site cites `agents/orchestrator.md` `### Step 4 — commit` with the item number where one applies. `hooks/dist/` is rebuilt in the same commit, because `committed-dist.test.ts` compares the two.
