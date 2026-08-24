An always-loaded prompt states that the uncovered-range decision is unfiled, eight days after it was answered

---
`agents/orchestrator.md` Step 3c asserts, as a statement of fact about the project's own records, that "whether a release may go out over an uncovered range is a decision nobody has filed, and this step does not pre-empt it". That decision was filed on 2026-08-15 and answered by the user on 2026-08-16 as options 3 then 1. The sentence has been false for eight days in the one prompt that runs at the start of every session.

---
**Filed by:** reconciler

**Found by:** Phase 3 reconciliation of session `260824-0539`, while establishing which rule governs this Circle's uncovered commit.

**Severity:** Medium. It does not change what the orchestrator does — the step's instruction to name uncovered commits is correct either way — but it tells the reader the question is open when the answer is on disk, and it is the reader's only pointer at that moment.

## What is true

`shared/decisions/260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md` stands `_a_`, answered as option 1: coverage is advisory, the Circle closes on its other evidence, and the closure note carries the gap as a named residual. Its own body records four consecutive reconciliations applying that answer, and this pass is the fifth. Option 3, filtering the uncovered set to commits touching a shipped file, remains absent from `hooks/lib/review-coverage.ts`.

## Where it was already noticed and not filed

`circles/260801-1244-curator/issues/260814-2153_*_the-commit-that-closes-the-last-reviews-own-high-finding-is-the-one-commit-no-review-opens.md` records in its 260819-1453 reconciliation note that the sentence "was true when written and is false now". That note is a reconciliation annotation on a record about a different subject, so nothing owns the repair and nothing schedules it. Five days later the sentence is unchanged. This is the shape the reviewer of this session's Circle named twice: a fact established and then filed where the next reader is not looking.

## What the same file says two sections later

`bin/fusion-review-coverage`'s own header carries the same sentence, which is where Step 3c took it from. Both want the same repair, and the header is outside every growth bound while the prompt is not.

## Fix direction

Replace the clause with what the record now says: a Circle may close over an uncovered range, coverage is advisory and never a blocker, and the closure note names the gap. Cite `260815-2109` rather than restating its reasoning. The `never a blocker` half of the sentence is correct as it stands and should survive the edit; only the claim about the decision being unfiled is false. `agents/*.md` head-room should be re-measured afterwards, though the edit is expected to be net negative.
