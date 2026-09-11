staging-drift still classifies a pointer a rule says nothing creates, and names a Turn-boundary trigger it does not have

---

`hooks/lib/staging-drift.ts` carries a live classification row for `.active-circle`, which `rules/workbench-tracking.md` `## Which of a tracked workbench's root entries git holds` states in as many words that nothing creates and `/fusion:migrate` deletes. It also describes its own trigger as a Turn-boundary read and names two caller sites by addresses the orchestrator prompt does not have, one of them citing an event nothing emits. Two of these sit in executing code, not in comments.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260911-1332_*_the-staging-drift-header-says-the-history-entry-is-still-written-and-cites-a-step-3b-the-prompt-no-longer-has.md` (the same file's header, repaired; this is what that repair left standing and named); `260910-1809_*_the-turn-and-phase-vocabulary-survives-in-132-places-across-the-shipped-text.md` (closed; these are survivors of that sweep)

**In executing code.**

| site | what it does | why it is wrong at HEAD |
|---|---|---|
| `hooks/lib/staging-drift.ts:214` | an `in-flight` classification row, `{ path: ".active-circle", why: "the active-Circle pointer — one line, rewritten on activation" }` | `rules/workbench-tracking.md:32`: *"Nothing creates the file, and `/fusion:migrate` deletes one it finds, so no workbench keeps one and there is nothing left to classify."* The row can never match, and its `why` describes an activation step that no longer exists |
| `hooks/lib/staging-drift.ts:461` | `return { klass: "record", why: "a Circle record" }` | the reason string is handed to a reader. The six-state Circle record went at v11; what the branch actually recognises is a work item's record |

**In comments.**

| site | what it says |
|---|---|
| `:113` | "the Turn-boundary read is deliberate" — the trigger is the HEAD-moved read, as `:128` itself says one line earlier |
| `:130-131` | the CLI is read "at Phase 1 (after a queue rebuild is committed), at Step 3e (in the same command as the `turn_end` emission), and at Cleanup". No Phase 1, no Step 3e, no queue rebuild, and `turn_end` has exactly one occurrence in the shipped tree — this sentence claiming it is emitted |
| `:92`, `:230`, `:421`, `:699` | `Circle` and `queue rebuild at Phase 1` in prose describing what the module does now |
| `hooks/lib/review-coverage.ts:134` | "through `.active-circle` — a review filed before the active Circle existed" |

**Why this is a new record rather than a reopening.** `260910-1809_*_the-turn-and-phase-vocabulary-survives-in-132-places-across-the-shipped-text.md` is `_c_`, and `rules/fusion-workbench-conventions.md` `## Terminal states are history` disallows an edit back to a live state. `260911-1332_*_the-staging-drift-header-says-the-history-entry-is-still-written-and-cites-a-step-3b-the-prompt-no-longer-has.md` is scoped to the file header and its acceptance test is met; this is what its repair pass found beyond that scope and named rather than swept.

**Why the classification row is the sharpest of them.** The other sites mislead a reader. This one makes the module carry a branch for a file no workbench holds, while a rule file states the opposite three directories away. Whichever of the two is stale, the project has a rule and an executable disagreeing about the same file, which is the condition the rule corpus exists to prevent.

**Evidence:** `hooks/lib/staging-drift.ts:92`, `:113`, `:130-131`, `:214`, `:230`, `:421`, `:461`, `:699` and `hooks/lib/review-coverage.ts:134`, read at the working tree of `d050c12d` plus the header repair; `rules/workbench-tracking.md:32`; `grep -rn 'turn_end' agents/ hooks/lib` excluding tests, returning the one comment above and no emitter; `skills/migrate/SKILL.md:164` and `:167`, which delete the pointer and say nothing reads it.

**Acceptance test:** `grep -n 'Circle\|Turn\|Phase 1\|Step 3e\|turn_end\|active-circle' hooks/lib/staging-drift.ts hooks/lib/review-coverage.ts` returns only sentences true at HEAD. The `.active-circle` row is gone, or `rules/workbench-tracking.md` is corrected and the row's `why` says what actually writes the file. The `why` string at `:461` names what the branch recognises. `hooks/dist/` is rebuilt in the same commit.
