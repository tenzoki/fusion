# `conceptrev` review files are scanned and trigger the coverage report, though no mandate covers them

---
**Severity:** Medium
**Domain:** code
**Filed by:** coderev, review of `7785330..cac41ef` (Turn 1)
**Affects:** `hooks/tracker.ts:892-926` (the trigger), `hooks/lib/review-coverage.ts:277-309` (the scan); `agents/conceptrev.md:75`
**Cross-references:** issue `260810-1205`; commit `afd7c2e`; `hooks/lib/__tests__/review-coverage-mandate.test.ts:68`

---

## The defect

Three agents write into `$OUT_REVIEW`. `agents/coderev.md` and `agents/ontorev.md` gained the
`**Reviewed-range:**` / `**Not-opened:**` mandate in `afd7c2e`. `agents/conceptrev.md` did not — it
writes `YYMMDD-HHMM-conceptrev-<doc-slug>.md` into the same store (`conceptrev.md:75`) and carries no
range at all, correctly: it evaluates a document's Mermaid diagrams, not a commit range.

Both halves of the new mechanism nonetheless treat it as a range reviewer.

**The scan.** `reviewFiles()` takes every `*.md` under every reviews store with no sender filter, so
a `conceptrev` assessment written during the session is read, found to carry no
`**Reviewed-range:**` line, and reported:

```
review shared/reviews/…-conceptrev-….md range=(none recorded) not-opened=(not recorded) UNUSABLE (no **Reviewed-range:** line)
```

**The trigger.** `measureReviewCoverageForModel` fires on any `.md` written under a path containing
`/reviews/` (`tracker.ts:905-907`). So a `conceptrev` verdict landing at the plan gate — which is
Phase 0b, before any Turn has run — fires the whole coverage measurement and can hand the model a
sentence about uncovered *code* commits at a moment when an uncovered range is the normal state.

## Why it matters

The module's own header (`review-coverage.ts:92-100`) argues the trigger has to be narrow precisely
so the check does not fire on its commonest path: "a check that cries wolf on its commonest path
teaches its reader to ignore it". A permanent `UNUSABLE` row for a sender that structurally cannot
carry a range normalises `UNUSABLE` as an ordinary output, which is the same erosion one level down —
a reader who sees it every session stops reading it when a `coderev` file lands there.

`review-coverage-mandate.test.ts:68` fixes `REVIEWER_PROMPTS` to two names, so the gate agrees the
mandate is a two-prompt fact. Nothing carries that fact into the scan or the trigger.

## Fix direction

Make the sender segment the discriminator on both sides — it is mandatory in the filename by
`rules/fusion-workbench-conventions.md` `## Filename Patterns`, so it is available and does not have
to be inferred:

- `reviewFiles()`: keep only names whose `<sender>` segment is `coderev` or `ontorev`. A file with no
  recognisable sender segment is still reported by name with the reason — that case is a genuine
  unreadable review and must not be dropped.
- `measureReviewCoverageForModel`: same test on the written path before measuring.

Put the sender set in one exported constant that `review-coverage-mandate.test.ts` asserts against,
so adding a fourth review sender is a decision somebody makes rather than a silent widening.

---

**Reconciliation 260815-1913 (reconciler, HEAD `9306f0a`) — still open, and re-measured rather than
inferred from the agent's removal.**

`agents/conceptrev.md` was deleted in `a17cc8c` (Circle `260815-0007-remove-eight-mechanisms-and-cap-growth`,
step 7). The plan's step 7 asserted that this record "is retired by this step and should be
transitioned `_o_` → `_c_`". **That assertion is false and the executor was right not to act on it**,
which it recorded at `circles/260815-0007-.../history/260815-1339-coder-remove-conceptrev.md`
§ *Two findings filed rather than executed* and filed as
`circles/260815-0007-.../issues/260815-1339_o_step-7-named-a-review-coverage-sender-set-that-does-not-exist-and-orphaned-scan-investigations.md`.

Both halves of the defect survive the agent. Neither `reviewFiles()` nor
`measureReviewCoverageForModel` gained a sender filter — `grep -rn conceptrev hooks/lib/review-coverage.ts`
returns nothing because there was never a sender set to remove from, which is the defect. Running
`./bin/fusion-review-coverage` from the project root at HEAD reproduces it on this Circle's own file:

```
reviews=9
unusable=1
  review circles/260815-0007-…/reviews/260815-0044-conceptrev-plan-remove-eight-mechanisms-and-cap-growth.md
    range=(none recorded) not-opened=(not recorded) UNUSABLE (no **Reviewed-range:** line)
```

What the removal changed is the arrival rate, not the fault: no new `conceptrev` file will be
written, so the population is now closed at whatever each workbench already holds. The permanent
`UNUSABLE` row remains, and the fix direction in `## Fix direction` above is unchanged — the sender
segment is still the discriminator, and the recognised set is now two names rather than three.
