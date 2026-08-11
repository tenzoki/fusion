# Seven of sixteen commits in the session range never reached a review pass, and nothing measures the gap

---

**Severity:** Medium — the two review passes that ran were thorough and both found real defects, including a release blocker; the problem is that their coverage of the range was never checked against the range, and the session's own reporting understated the hole by a factor of seven
**Domain:** code
**Filed by:** reconciler (final reconciliation of session `260810-0844`, range `18b6094..ed87d87`)
**Affects:** `agents/orchestrator.md` (the Turn loop's review dispatch), `fusion-workbench/orchestrator-live.md` (`## Notes`), `fusion-workbench/agentstate.yaml` (carries no review-coverage field)
**Cross-references:**
`shared/reviews/260810-0939-coderev-turn-3-range-18b6094-to-a7c2b03.md`;
`shared/reviews/260810-1032-coderev-turn-4-range-7f617b1-to-7ddacbc.md`;
`shared/issues/260808-0030_o_the-coderev-pass-filed-four-issues-and-left-no-review-file.md` (the same accountability gap, from the other side — a pass that ran and left no file)

---

## What is wrong

Sixteen commits landed in `18b6094..ed87d87`. Two `coderev` passes ran. Their two ranges do not tile the session's range, and the untiled part was never noticed.

```
4bf509e 38fe341 bcb0ae8 a7c2b03   Turn 1   reviewed  (0939, range 18b6094..a7c2b03)
ac68437 72b798e 7f617b1           Turn 2   NOT reviewed
c546ef0 e39b3fe 98c8b3f 7ddacbc   Turn 3   reviewed  (1032, range 7f617b1..7ddacbc)
df75004 8796ade 49e5b1d 205ae06   Turn 4   NOT reviewed
ed87d87                           release  NOT reviewed
```

Seven code-bearing commits — `ac68437`, `72b798e`, `df75004`, `8796ade`, `49e5b1d`, `205ae06`, `ed87d87` — reached `HEAD` and a pushed tag with no reviewer having opened them.

**Turn 2's omission is the one worth naming, because it was declared rather than overlooked.** The `0939` pass states in its own header: *"the concurrent edits in `agents/orchestrator.md`, `skills/next/SKILL.md` and `skills/circle-stash/SKILL.md` were not opened."* Those are exactly the files `ac68437` and `72b798e` changed. The reviewer correctly reported the boundary of its scope; nothing downstream read that sentence and re-queued the files once the concurrent tasks finished. The scope note went into a file and stopped there.

That `72b798e` needed a second look is not hypothetical: `260810-0947_c_...` — a real defect in the same change — was filed not by a reviewer but by the T6 executor reporting outside its own scope, and fixed three commits later in `8796ade`, which itself was never reviewed either.

**The reporting understated it.** `orchestrator-live.md` `## Notes` reads *"Turn 5's own commit has had no review pass"* — one commit, when the true figure is seven across three Turns. The session did not hide the gap; it measured it against the last Turn instead of against the range.

## Why nothing caught it

There is no artifact that holds "commits reviewed" against "commits landed". `agentstate.yaml` tracks `commits`, `turn` and `turn_start_head` but no reviewed-through marker. The review filenames carry their ranges (`range-18b6094-to-a7c2b03`) — the data needed to tile the session range is on disk, in the filenames, and nothing reads it.

The release process in `CLAUDE.md` has a validate gate, a smoke test and a guard-testing caution. It has no review-coverage gate, so a range can be tagged and pushed with a third of it unread.

## What should happen — three separable pieces, in increasing cost

1. **Report the gap correctly.** Whatever the session summary says about review coverage should be derived from the review files' own ranges against `git rev-list <session-start>..HEAD`, not from which Turn ran last.
2. **Re-queue a declared out-of-scope file.** When a reviewer names files it did not open because a concurrent task held them, that list is an obligation for the next pass, not a footnote. The next dispatch's scope should be the union of its own Turn and the previous pass's declared exclusions.
3. **Decide whether a release may go out over an unreviewed range at all.** This is a decision, not a defect, and is not filed here — it belongs beside `shared/decisions/260810-0710_o_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`, which asks the same shape of question about lints.

## Acceptance criteria

- [x] The session-end summary's review-coverage statement is computed from the review files' ranges, and a range not covered is named commit by commit.
- [x] A reviewer's declared out-of-scope file list is carried into the next review dispatch's scope.

---

**Resolved:** task `I:260810-1205-review-coverage`, coder, 260811-1058. History:
`shared/history/260811-1058-review-coverage-measured-against-the-range.md`.

Both in-scope pieces landed. Piece 3 — whether a release may go out over an uncovered range
— was **not built**, as the record and the queue entry both required; it remains an unfiled
decision belonging beside `shared/decisions/260810-0710_o_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`.

**One finding the fix had to close before it could start.** This record says the data needed
to tile the range is on disk "in the filenames", and it is — but not in a form a program can
read. Ten `coderev` files carried four spellings of the range (`**Range:**`, `**Scope:**`,
`**Scope reviewed:**`, `**Scope as dispatched:**`), several carried none, and two filenames
ended in `-to-head`, which names a different commit every day it is read. A computation over
a format nobody mandated returns nothing and calls it coverage. So the range is now a
mandated header field — `**Reviewed-range:**` (two resolved short hashes) and
`**Not-opened:**` (a backticked list or the bare word `none`) — in `agents/coderev.md` and
`agents/ontorev.md`, gated by `hooks/lib/__tests__/review-coverage-mandate.test.ts`. The ten
files already on disk stay unusable and are reported by name with the reason; their ranges
are not recoverable from their text.

**What reads it.** `hooks/lib/review-coverage.ts` expands every declared range with
`git rev-list`, unions them, and subtracts from `git rev-list <session-start>..HEAD` — a set
difference over commits, so the gap comes back as commits and not as a count.
`bin/fusion-review-coverage` prints it for `agents/orchestrator.md` Step 3c (which adds the
carried `**Not-opened:**` list to the next dispatch's scope) and Phase 4 (which names the gap
commit by commit in a new `## Review coverage` section). `hooks/tracker.ts` runs the same
measurement unasked when a review file lands, so the carried list arrives at the moment the
next dispatch's scope is decided rather than sitting in a file nobody reopens.

**`agentstate.yaml` deliberately gained no field**, contrary to what this record's *Affects*
line anticipates. A `reviewed_through` marker would be a fifth surface a session can pass a
boundary without writing — the class issue `260801-2038` measured freezing in six sessions
out of six — answering a question the review files already answer unfreezably: writing the
review file *is* the review. The one field the measurement reads,
`session.git_head_at_start`, was already there for the drift check.
