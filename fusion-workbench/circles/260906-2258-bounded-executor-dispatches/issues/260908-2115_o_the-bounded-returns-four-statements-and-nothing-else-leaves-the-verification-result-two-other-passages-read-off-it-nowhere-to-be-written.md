# The bounded return's "four statements and nothing else" leaves the verification result two other passages read off it nowhere to be written

**Filed by:** coderev, Kai Stalmann <kai@qantr.com>
**Severity:** High
**Found in:** `260908-2110-coderev-bounded-dispatch-closure.md`, finding H1
**Range:** `637d0b04..20796615`

## What is wrong

`rules/bounded-dispatch.md:70-78` mandates the bounded return's shape:

> When the stopping time has been reached, return four statements **and nothing else**, in
> this shape:

followed by `**Bounded return:**`, `**Completed:**`, `**Unfinished:**` and `**Next step:**`.
None of the four is a verification result, and "nothing else" excludes one.

Two passages landed in the same range read a verification result off exactly that return.

**`agents/orchestrator.md:488`**, the Step 3a item 4 guard:

> The two tests are orthogonal, not exclusive: an agent stopped at its bound may have run a
> passing verification on the part it finished, so `exit 0` and "stopped at the bound" can
> both be true of one return, which a fifth value of one line cannot express and a question
> asked above it can.

The orchestrator is told to expect `exit 0` on a bounded return. The rule gives the agent
no field to write it in and instructs it to write nothing else.

**`rules/bounded-dispatch.md:133-135`**, the first of the four cross-site rules:

> Where a bounded return also carries a failed verification, the failure travels into the
> continuation dispatch as the first thing the continuing agent is asked to address.

Same presupposition, in the rule that forbids it, eight lines of prose apart.

## Why it matters rather than reads as a nuance

The conflict sits on a routing decision, not on wording. `agents/coder.md:79-81` and
`agents/ontocoder.md:92-97` both mandate a `Verification:` line in one of exactly three
forms, "the field is never left out", and `executor-verification-report-lint.test.ts` pins
that contract across both prompts. A bounded `coder` return obeying "nothing else" omits
the field the lint pins and the orchestrator's own guard reads. A bounded `coder` return
carrying the field disobeys the rule it was emitted at Setup.

The agent cannot satisfy both, and which way it resolves the conflict changes what
`agents/orchestrator.md:488` sees. Read as "no verification reported", a partial return
that did pass its checks is indistinguishable from one that ran none.

## What was checked

- `rules/bounded-dispatch.md:52-60`, the seven-row unit table: all seven cited anchors
  resolve (`agents/coder.md:62`, `agents/ontocoder.md:74`, `agents/bugfixer.md:65` and
  `:89`, `agents/reconciler.md:117`, `agents/curator.md:206`, `rules/review-contract.md:57`).
  The drift is not in the anchors.
- The `coder` row names step 3 (`Implement`) as the unit. Steps 4 to 6 — Verify, Log,
  Report — are **not** per-file, so a unit boundary between two files falls before any
  verification has run. That is the mechanism by which the contradiction is reached in
  ordinary operation, not an edge case.

## Fix direction, offered as options rather than a recommendation

This is a specification question and I do not think a reviewer should settle it.

1. Add a fifth optional line to the bounded return for the verification result, and amend
   "and nothing else" to name it. Costs bytes in `rules/bounded-dispatch.md`, which is
   emitted to seven agents.
2. Say explicitly in `rules/bounded-dispatch.md` that a bounded return carries no
   verification result, and correct `agents/orchestrator.md:488` and the rule's own
   cross-site rule 1 to match. Costs nothing on the always-on floor and loses the
   information.
3. Rule that the executor report contract survives the bound, and that "nothing else"
   governs only the handoff's own content. Requires the lint's expectations to be checked
   against a bounded return.

Whichever is chosen, `agents/orchestrator.md:488` and `rules/bounded-dispatch.md:133-135`
have to move with it. Note the `agents/` head-room constraint: option 2 is the only one
that does not add prose to `agents/orchestrator.md`, which finished this Circle at 698
bytes of head-room.

## Scope

`rules/bounded-dispatch.md`, `agents/orchestrator.md`, and by consequence the report
contract in `agents/coder.md` and `agents/ontocoder.md` that
`executor-verification-report-lint.test.ts` pins. `bugfixer` inherits the same shape via
its Phase 6 report, so the Step 3b self-healing site at
`rules/bounded-dispatch.md:122` is reached by this too.
