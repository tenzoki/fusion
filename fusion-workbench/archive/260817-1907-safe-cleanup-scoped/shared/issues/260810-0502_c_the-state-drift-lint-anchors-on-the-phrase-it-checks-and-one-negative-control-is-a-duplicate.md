# The state-drift lint anchors on the phrase it checks, one negative control is a duplicate, and half its "pre-fix" fixture is invented

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, review of `8960e1a..HEAD` (session `260810-0241-orchestrator-session.md`, Turn 1)
**Affects:** `hooks/lib/__tests__/state-drift-detection-lint.test.ts` — `CALL_POINTS[1]` (`:76`), `CALL_POINTS[3]` (`:78`), the fixtures at `:180-196`, the negative control at `:205-211`, the header claim at `:30-39` and `:68-73`
**Cross-references:** commit `9bad4d6`; `260801-2038_*_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md`

---

## The defect

The lint states its own design rule in its header (`:68-73`):

> The anchor is the EMISSION (or, at Setup, the resume step), never the drift check — a check that has
> drifted away from its carrier must fail here, and it cannot do that if the anchor is the check
> itself.

Two of the four anchors break that rule.

- `CALL_POINTS[1]` anchors on `/same command as that \`turn_end\` emission/` (`:76`). The only line in
  `agents/orchestrator.md` matching it is `:465`, which **is** the drift-check sentence. Any line the
  anchor can match necessarily contains "drift check", so the follow-up assertion cannot fail
  independently.
- `CALL_POINTS[3]` anchors on `/^ {2}3\. \*\*Run the drift check\*\*/` (`:78`) — it spells out the very
  phrase it then asserts is present.

The consequence is that removing the check from Step 3e does not produce the intended failure. It
produces `expected exactly one line for Step 3e turn_end emission, found 0` — a missing-anchor error,
not "this call point no longer runs the drift check". Only `CALL_POINTS[0]` and `[2]` are genuine
emission anchors.

## Second defect: a negative control that is a renamed duplicate

`:205-211` is titled *"rejects a check bolted on beside the emission instead of into it"* — the
half-fix the whole design exists to reject. It cannot test that. `preFixCallPoints` (`:183-188`) and
`standaloneObligation` (`:190-196`) both open with the identical line
`"2. Emitting a \`turn_start\` event."`. `assertRidesAnEmission` throws on `CALL_POINTS[0]` and
returns, so the standalone line added at `:192` is never reached. Both tests assert the same throw
from the same cause; the second is the first under a different name.

Verified consequence: an *honest* standalone obligation — the `turn_start` line carrying the check,
plus a separate "run the drift check again as its own step" — is **accepted**. That is precisely the
shape that got skipped four times in `260801-2038`.

## Third defect: fabricated history presented as history

The fixture comment at `:180-182` reads *"The three call points exactly as they stood at HEAD before
this change."* Checked against `git show 9bad4d6^:agents/orchestrator.md`, which contains **no**
occurrence of "drift check" anywhere:

| Fixture line | Status |
|---|---|
| `"2. Emitting a \`turn_start\` event."` (`:184`) | true — pre-fix `:330`, verbatim |
| `"**Run the drift check in the same command as that \`turn_end\` emission** (see below)."` (`:185`) | **invented** — pre-fix `:461` had no drift text |
| `"- Emit \`session_end\` event"` (`:186`) | true — pre-fix `:565`, verbatim |
| `"  3. **Run the drift check** (see Persistent State File)."` (`:187`) | **invented** — pre-fix Setup Step 1 item 3 was `3. Present the saved state to the user as a summary:` |

The invented lines do not change the pass/fail outcome, but they manufacture the appearance of a
complete pre-fix reproduction, and they are the reason the duplicated negative control above is not
obvious on reading.

## Fourth, smaller: a licence to skip passes

The assertions are `toMatch(/drift check/i)` against the anchored line. A prompt reading
*"Emitting a `turn_start` event — the drift check is deferred to Cleanup"* satisfies every one of
them. The lint cannot distinguish an instruction from a permission to skip it.

Relatedly, the condition-table test (`:138-150`) asserts only that a row **mentions** each surface, so
a row with an empty `Drift when` cell passes — the "bare printout" the test's own comment at `:146-147`
says it prevents.

## Why it matters

The header at `:30-39` claims the lint "buys that the check cannot lose a call point". That holds for
two call points, not four. This is not an argument for deleting the lint — the mechanism it guards is
sound and worth guarding — it is an argument for the claim being brought down to what the code does,
which is `rules/critical-stance.md` §3 applied to a test's own docstring.

## Fix direction

Anchor `CALL_POINTS[1]` and `[3]` on the acts (`turn_end` emission text; Setup Step 1's resume step)
rather than on the drift sentence. Give `standaloneObligation` a first line that satisfies
`CALL_POINTS[0]` so the test reaches the case it is named for. Correct or drop the two invented fixture
lines, and say plainly in the comment which lines are historical and which are constructed.

---

## Reconciliation — `260810-0819`, session `260810-0241-orchestrator-session.md` Phase 3

**Still accurate, and understated.** `hooks/lib/__tests__/state-drift-detection-lint.test.ts` has not
been touched since `9bad4d6`; every line number cited above still lands on the text it describes.
Each of the six claims was re-checked and each holds, including the duplicate negative control
(`:205-211` and the test above it both trip `CALL_POINTS[0]` first, so the standalone line at `:192`
is never reached) and the invented fixture lines (`git show 9bad4d6^:agents/orchestrator.md` contains
zero occurrences of "drift check").

The one correction is in this record's own framing, which grants `CALL_POINTS[0]` and `[2]` as
genuine. **All four call points are defeatable.** The follow-up assertion is `toMatch(/drift check/i)`
against the anchored line, so a line that mentions the check *while forbidding it* satisfies the gate.
Verified by running `assertRidesAnEmission` against a copy of the prompt with all four inverted — it
passed:

| Line | Mutation the lint does not catch |
|---|---|
| `agents/orchestrator.md:335` | `2. Emitting a \`turn_start\` event. The drift check is NOT run here; it is deferred to Cleanup.` |
| `:468` | `**Do not run the drift check in the same command as that \`turn_end\` emission** — run it once, at Cleanup.` |
| `:652` | `- Emit \`session_end\` event — the drift check is optional and may be skipped under time pressure.` |
| `:86` | `  3. **Run the drift check** only if you have time; otherwise present the saved state as fact.` |

The other five tests read only `### Drift check` (`:837-891`) and the event table (`:1009`), and all
four mutated lines sit outside both. So `npm test` stays green with the check disabled at every call
point it exists to hold.

Add to the fix direction: the assertion has to be about the *act*, not about the phrase — and the
negative controls must assert on distinct messages, which `:201` does and `:209` then discards by
matching a bare prefix.

---

## Resolved in part — `260810-1812-coder-drift-lint-anchors.md`, session `260810-1646-orchestrator-session.md` Turn 1 (coder, task `I:260810-0502-drift-lint`)

`hooks/lib/__tests__/state-drift-detection-lint.test.ts` rewritten; no other file touched. History:
`260810-1812-coder-drift-lint-anchors.md`.

Five of the six claims are closed:

1. **Anchors** — all four call points now anchor on the act, not the check: Step 3e on
   `^Otherwise, emit \`turn_end\` event` and Setup Step 1 on `Present the saved state to the user as a
   summary`. The design rule is enforced rather than documented: a control requires every anchor to
   match uniquely inside `PRE_FIX`, a fixture asserted to contain no occurrence of "drift check".
   Deleting the check at Step 3e now reports *"this act no longer runs the drift check"* where the old
   lint reported *"expected exactly one line …, found 0"* — verified by running both versions against
   a mutated copy of the prompt.
2. **Act, not phrase** — the single `toMatch(/drift check/i)` is replaced by three assertions in
   diagnosis order: mentioned at all, no skip licence in any sentence mentioning it, and a `binds`
   phrase tying it to the act. The four inversions in the reconciliation table above were re-run
   against the real prompt: the old lint passed 10/10, the new one fails four times, each naming its
   own call point and quoting the licence that matched.
3. **Duplicate negative control** — every control is `BOUND` with exactly one heading-isolated block
   replaced, so each fails at a call point of its own with a message of its own. An honest standalone
   obligation is now rejected (*"nothing binds it into it"*); the old lint accepted it, shown by an
   appended control on the `HEAD` source.
4. **Fabricated history** — `PRE_FIX` is verbatim from `git show 9bad4d6^:agents/orchestrator.md` with
   pre-fix line numbers per line and the one elision marked; the constructed fixture is labelled
   constructed.
5. **The header claim** — reduced to what the code does: three things bought, each demonstrated by a
   control, plus a plain statement that the wording checks read words and `SKIP_LICENCES` is a
   blacklist that closes the measured hole, not the class.

**Still open — the reason this record stays `_p_`:** §4's second paragraph, the condition-table test
that accepts a row with an empty `Drift when` cell. It was outside the task's acceptance and outside
the assigned line ranges, and the test is unchanged.

`npm test` from `hooks/` — exit 0 (41 files, 1096 tests).

---
Resolved: three of the four claims. Each call point is now `{ act, window, binds }`, where every
`act` regex matches a line that existed before the drift check did — Step 3e anchors on
`^Otherwise, emit \`turn_end\` event`, Setup Step 1 on `Present the saved state to the user as a
summary`. That property is enforced rather than asserted in a comment: a control requires every
anchor to match uniquely inside a `PRE_FIX` fixture which the same test asserts contains no
occurrence of "drift check", so an anchor that can only match the check fails there. The single
`toMatch(/drift check/i)` became three assertions over a window truncated at the nearest heading on
either side: mentioned at all, then no skip licence in any sentence mentioning it, then a binding
phrase tying it to the act. The duplicated negative control was separated and the invented fixture
lines were corrected, with the comment now saying which lines are historical and which constructed.

Demonstrated against mutated copies, the real prompt untouched: the old lint passed all four
inversions 10/10 and also accepted an honest standalone obligation, reproducing the record's claim
exactly. The new lint fails each inversion separately, naming its call point and quoting the licence
it found, rejects the honest standalone obligation, and reports a deleted check as "this act no
longer runs the drift check" rather than as a missing anchor.

One limit is recorded in the lint's own header rather than papered over: the skip-licence check is a
blacklist and cannot be otherwise, since whether prose instructs or forbids is not decidable by
regex. It closes the four measured inversions, which are kept as a verbatim regression control, and
does not close the class.

Remainder, filed separately as `260810-1813_*_the-condition-table-test-accepts-a-row-whose-drift-when-cell-is-empty.md`:
§4's second claim, that the condition-table test accepts a row with an empty `Drift when` cell, was
outside this task's acceptance and outside the executor's assigned line ranges.

Verification: `npm test` from `hooks/` — exit 0, 41 files, 1096 tests; this lint file went 9 to 13.
