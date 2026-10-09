The takeover route leaves its consent decision open, so every Setup surfaces it as an unanswered question
---
The **Take over** row files the user's approval as a decision record and never moves its state, so a takeover the user already approved stays an `open` decision, and the orchestrator lists it to the user as an unanswered question at every later Setup.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** medium (release-blocking under FJ05 step 12)
**Found by:** review G-B, `261009-1448-reviewer-g-b-closing-review-of-the-13-0-0-takeover-revision.md`

**Evidence.**
- `agents/orchestrator.md` `## Work packages`, the **Take over** row (from `0a0d6148`): "First `create --kind decision` in the package's container, its narrative the user's words verbatim and those three names; `--source` is … that record … Later lines append and never restate the approval." The row names no transition. `create` files a decision at `open`.
- `rules/fusion-workbench-conventions.md` `## State Markers — decisions`: `open` means "filed, not yet answered". But this record holds the answer: it is the user's word.
- `agents/orchestrator.md` `## Setup`, "Surface open decisions": "The `decision` rows at `open` under `$SCAN_DECISIONS` are user decisions … List them to the user". So every session after a takeover asks the user again about it. The user may answer it a second time, or defer it.
- The shipped fixtures show the same state. All five consent records under `codec/fixtures/protocol-session-takeover/base/work-packages/*/decisions/` carry `"state": "open"`. Their titles read as questions, for example `# May B take over P from deadbeef?`. The observation case (i) in `hooks/lib/__tests__/agent-dispatch-observation.test.ts` checks the record's kind and text only, not its state.
- The codec accepts any resolving record as the source and does not care about its state. So the fix is in the shipped text alone.

**Fix direction.** In the same turn as the takeover, the row should move the consent decision to `answered`. That means the `Answered:` line ("ruled by user, <person>"), then `transition --to answered --answer-ref` naming the record itself or the landed takeover. The other option is to state why the record stays `open`, and exempt it from "Surface open decisions". Either way, make it one clause in the row. Prior's answer to 62, part 6a, forbids rewriting the approval, and appending a resolution line does not rewrite it. If the self-reference is not admissible as an `answer_ref`, that is a question for the user, and it is filed as a decision.

**Acceptance.**
- The **Take over** row (or a sentence beside it) says what state the consent record ends in, and that state is not `open`. Alternatively, Setup's open-decision listing provably skips it.
- `rules-emission-golden.test.ts`, `surface-growth-bound.test.ts` and `reference-resolution-lint.test.ts` are green.
- Observation case (i) asserts the consent record's state as well as its kind.

---
Resolved: the **Take over** row in `agents/orchestrator.md` `## Work packages` now files the consent decision, appends its `Answered:` line ruled by the user and sends `transition --to answered` before the claim, `--answer-ref` and `--source` both naming that record (the self-reference `rules/fusion-workbench-conventions.md` `## State Markers — decisions` admits: "or the record itself"), so Setup's open-decision listing no longer meets it; the 99 bytes added are cut from the same file (net -3). Observation case (i) in `hooks/lib/__tests__/agent-dispatch-observation.test.ts` asserts the record's state `answered` beside its kind; it was not run (opt-in, FJ05 step 16). `docs/upgrading-to-v13.md` says the record moves to `answered`. The five consent records under `codec/fixtures/protocol-session-takeover/base/` stay `open` and unchanged: the codec does not read the source's state, the session records codec behaviour rather than the orchestrator's route, and changing them would move recorded bytes of the session pinned for Prior's request 63.
