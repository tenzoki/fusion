# The commit-message path gate stops reading prose and compares one path

**Agent:** coder
**Date:** 260811 20:10
**Status:** Complete
**Tasks:** 14 (`I:260811-1149_*_the-commit-message-path-lints-exemption-regex-is-broad-and-case-inconsistent.md`), 15 (`I:260811-1611_*_the-positive-control-documents-the-keyword-exemption-dependency-in-a-comment-and-asserts-something-else.md`) — one dispatch, in that order
**Files changed:** `hooks/lib/__tests__/commit-message-path.test.ts` (test only; no production change was needed)

---

## What the two tasks were, and why they were dispatched together

Task 14 is filed against a keyword exemption in `it("finds none")`:

```ts
if (/Never inside|never inside|leftover|Measured|improvised|fault/.test(line)) continue;
```

Task 15 is filed against the assertion that was supposed to pin that exemption as a dependency and
pins something else instead. The dispatch flagged that doing 14 as filed might close 15 outright.
It did not, and the reason is worth stating: task 14 **replaced** the sparing rather than deleting
it, so the dependency task 15 is about survived into the new mechanism under a different name. 15
was built, adapted to the allow-list.

## Task 14 — the allow-list

`NAMEABLE_LEFTOVER = "fusion-workbench/.commit-msg-tmp"`, a module-level constant with the
reasoning in its doc comment. `it("finds none")` subtracts that one literal path from each line's
hits. Every other workbench-internal commit-message path is an offence, with no reading of the
prose around it.

All three of the record's defects go at once, because they were three symptoms of one thing: the
gate was trying to decide "does this line name the path as a defect or prescribe it?", which is
prose classification and not decidable from a word list (`rules/critical-stance.md` §4, and the
same shape as the write-path classifier this codebase already retired). `fault` is an ordinary
word in `agents/orchestrator.md`'s Staging check section, so a genuine prescription that also said
"fault" was exempt in the one prompt the gate exists to watch. The hand-spelled cases
(`Never inside` twice, `Measured` capital-only, three others lowercase-only) were a symptom of the
same thing: a word list with no rule behind it accretes cases.

**Line numbers re-measured before use, as the dispatch asked.** The record cites
`agents/orchestrator.md:418`; it is `:420` now, moved by another executor working that file today.
`skills/commit/SKILL.md:88` is unchanged. Both name exactly `fusion-workbench/.commit-msg-tmp` and
nothing else. Measured by running the real `workbenchMessagePaths` (via `hasCommitMessageName` from
`lib/staging-drift.ts`) over every `agents/*.md` and `skills/*/SKILL.md`, not by grep approximation.

**What the allow-list gives up, written into the code rather than left implicit.** A prompt that
*prescribed* writing to `.commit-msg-tmp` would now pass this gate. The keyword form did not really
cover that case either: whether such a line carried the word "leftover" was the author's whim, not
a property of the instruction. And the run-time half catches the resulting file by location,
whatever a prompt says about it.

## Task 15 — the dependency, asserted over the shipped lines

The scan is lifted into `flaggedLines()` in the describe block: every shipped prompt line the name
test flags, with `file:line` and the paths hit. One loop, two callers composing it differently,
which is the shape `workbenchMessagePaths` and `classify` already have in this file.

- `it("finds none")` subtracts the allow-list and expects nothing left. Its failure message now
  names `NAMEABLE_LEFTOVER` and the offending `file:line`.
- The new positive control asserts, over the same single scan, that it is **non-empty** (so a
  reword of the two lines cannot leave a gate that passes while measuring nothing) and that the
  distinct set of flagged paths is exactly `[NAMEABLE_LEFTOVER]` (so the allow-list is provably the
  only thing sparing them).

Part (3) of the record's filed direction — "the flagged-and-not-exempted count is 0" — was not
added as a fourth assertion. That is `it("finds none")`, and its message names the mechanism, so
the acceptance criterion is met there rather than duplicated. The assertion the record objected to
(a fixture string asserting what the test above it already asserted) is gone, replaced by a comment
pointing at the control that measures the same thing for real.

Anchors are found by scanning rather than hard-coded, deliberately: `agents/orchestrator.md` moved
by two lines while the record was open, and three executors were editing prompts during this task.

## A claim I withdrew after measuring it

The control's first draft said in a comment that its non-emptiness assertion guards against the
helper narrowing back from `hasCommitMessageName` to `classify` (the `260811-1410_*_the-commit-message-path-gate-narrowed-with-the-classifier-it-reuses-and-no-longer-catches-a-prescription-inside-a-store.md` regression).
Mutation-tested: it does **not**. Both shipped lines name a root-anchored path no artifact store
owns, so `classify` still calls it a `commit-message` and the scan stays non-empty. What catches
that narrowing is the existing store-prescription negative control. The comment now states the
division of labour and states that it was measured, rather than overselling the new assertion.

## Verification

Mutation testing, because a green suite proves nothing about a gate whose failure mode is passing
vacuously:

| Mutation | Result |
|---|---|
| `NAMEABLE_LEFTOVER` value changed to a bogus path | `it("finds none")` **and** the new control both fail, each naming the constant and the two `file:line` locations |
| `workbenchMessagePaths` narrowed back to `classify` | the store-prescription negative control fails; the new control correctly does not (see above) |
| no mutation | 10/10 pass |

Full suite: `cd hooks && npm test` — **exit 0**, `50 passed (50)`, `1301 passed (1301)`, 112s.

Three earlier runs of the same command exited 1, all on the same single test:
`lib/__tests__/fusion-commit-lock.test.ts > … a creator reaped between mkdir and its holder write
loses the acquisition …`. It polls for a transient window between `mkdir` and a holder write and
loses that race under load; three other executors were running concurrently and those runs took
180–260s against the green run's 112s.

**Diagnosed rather than assumed**, in three steps. It passes in isolation
(`npx vitest run lib/__tests__/fusion-commit-lock.test.ts`, exit 0, 10/10). It fails the full suite
with my file reverted to its `HEAD` content (`git show HEAD:… > …`, exit 1, same single failure,
`1299 passed`), which rules my change out. And it passes the full suite once the machine quiets,
which is the last run above. Recorded here because a future reader of a red run on that test should
check the load before hunting for a defect.
