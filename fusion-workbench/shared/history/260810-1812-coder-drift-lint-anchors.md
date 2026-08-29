# Anchor the drift lint on the act, not on the phrase it checks

**Status:** Complete
**Agent:** coder
**Task:** `I:260810-0502-drift-lint` (tasklist task 7, session `260810-1646-orchestrator-session.md` Turn 1)
**Source:** `260810-0502_*_the-state-drift-lint-anchors-on-the-phrase-it-checks-and-one-negative-control-is-a-duplicate.md`
**Files changed:** `hooks/lib/__tests__/state-drift-detection-lint.test.ts` (only)

---

## What was wrong

`assertRidesAnEmission` anchored two of its four call points on the drift-check
sentence itself, so deleting the check produced `expected exactly one line …,
found 0` instead of a diagnosis. Worse, its follow-up assertion was
`toMatch(/drift check/i)` against the anchored line, so a line that *forbids* the
check satisfied it — all four call points were defeatable, not two. Two negative
controls both tripped `CALL_POINTS[0]` and asserted on the same throw, so the
one named for the bolted-on half-fix never reached it. Two of four "pre-fix"
fixture lines were invented.

## What was built

**Anchors are acts.** Each call point is now `{ act, window, binds }`. The acts
are lines that existed in the prompt *before* the drift check did:

| Call point | act |
|---|---|
| Phase 2 | `^2\. Emitting a \`turn_start\` event` |
| Step 3e | `^Otherwise, emit \`turn_end\` event` (was: the drift sentence) |
| Cleanup | `^- Emit \`session_end\` event` |
| Setup Step 1 | `Present the saved state to the user as a summary` (was: `3. **Run the drift check**`) |

That property is enforced, not documented: the `anchors are acts` control
requires every anchor to match uniquely inside `PRE_FIX`, a fixture asserted to
contain no occurrence of "drift check". An anchor that can only match the check
fails there.

**Three assertions per call point, in diagnosis order** over a window truncated
at the nearest markdown heading on either side: (1) the check is mentioned at
all, (2) no sentence mentioning it carries a skip licence (`SKIP_LICENCES`,
matched against markdown-stripped text), (3) a `binds` phrase ties it to the act
— "in the same command" for the three emissions, "every diverging row" for the
resume summary, which has no command to ride.

**Controls now fail at different call points with different messages.** `BOUND`
is a constructed stub with one heading-isolated block per call point; each
control replaces exactly one block. A positive control asserts the bound form is
accepted, because a gate that rejects everything is as broken as one that
accepts everything.

**Fixture provenance is stated per line.** `PRE_FIX` is verbatim from
`git show 9bad4d6^:agents/orchestrator.md` with the pre-fix line numbers given
and the one elision marked; `BOUND` is labelled constructed, and deliberately
not copied out of the file under test.

**The header claim was brought down to what the code does.** It now names the
three things the gate buys, each demonstrated by a control, and states plainly
that the wording checks read words: `SKIP_LICENCES` is a blacklist, incomplete
by construction, closing the measured hole and not the class.

## Verification

`npm test` from `hooks/` — exit 0, 41 files / 1096 tests passed. The drift lint
file itself went 9 → 13 tests.

The record's own defeat was reproduced against a mutated copy of the real prompt
(scratchpad; `agents/orchestrator.md` untouched), with the four inversions from
the reconciliation table:

- Old lint (`git show HEAD:…`), all four inverted: **10/10 passed** — the defeat
  confirmed, including an appended control showing it accepts an honest
  standalone obligation.
- New lint, each inversion applied alone: fails four times, each naming its own
  call point and quoting the licence that matched.
- New lint, honest standalone obligation: rejected with "nothing binds it".
- Check deleted at Step 3e and Setup: old lint says "expected exactly one line …
  found 0"; new lint says "this act no longer runs the drift check". That is the
  record's primary complaint, closed.

## Not done

Record §4's second paragraph — the condition-table test at the old `:138-150`
accepts a row with an empty `Drift when` cell — is outside this task's
acceptance and outside the line ranges assigned. Untouched; the issue record
stays `_p_` and names it as the remainder.

No prompt change was needed, so `agents/orchestrator.md` was not touched.
