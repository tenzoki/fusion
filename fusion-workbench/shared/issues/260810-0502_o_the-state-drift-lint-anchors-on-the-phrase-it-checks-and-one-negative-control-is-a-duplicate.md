# The state-drift lint anchors on the phrase it checks, one negative control is a duplicate, and half its "pre-fix" fixture is invented

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, review of `8960e1a..HEAD` (session `260810-0241`, Turn 1)
**Affects:** `hooks/lib/__tests__/state-drift-detection-lint.test.ts` — `CALL_POINTS[1]` (`:76`), `CALL_POINTS[3]` (`:78`), the fixtures at `:180-196`, the negative control at `:205-211`, the header claim at `:30-39` and `:68-73`
**Cross-references:** commit `9bad4d6`; `shared/issues/260801-2038_o_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md`

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
