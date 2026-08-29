`**Initiated by:**` carries quoted user dialogue and no surface says where its value ends

---
The `**Initiated by:**` row added by `9f4cdac` defines the value as "the question the user was asked, the option they chose, and the date — quoted, not paraphrased". The roster preamble two lines above it names a closed set of the parameters whose values may run past their own line, and this is not in it. Neither `agents/shaper.md:55`, `agents/orchestrator.md:339` nor the row states a termination rule, and a halt sits behind the parameter.

---
**Found by:** coderev, Turn-5 incremental review of `d5b71f1..41c224c`, review file `260814-2022-coderev-curator-turn-5.md`.
**Owner:** `coder` for the one-line statement; folded into whatever answers the open decision if that comes first.
**Severity:** Low.
**Affects:** `README-agents.md:55` (the preamble) and `:68` (the new row); `agents/shaper.md:55`, `:57`; `agents/orchestrator.md:333-348`.
**Cross-references:** `260814-1915_*_should-mode-3-require-the-audit-line-on-every-run-instead-of-testing-whether-it-was-dispatched.md` (if option 1 is taken, this row is rewritten anyway and the rule lands with it); `archive/260817-1907-safe-cleanup-scoped/260813-2214_*_the-roster-preamble-states-a-value-termination-rule-for-confirmed-operations-that-the-playmaker-…` (the same gap, met once before on `**Confirmed operations:**` and answered by convention rather than by a rule).

**Verified 2026-08-14 at HEAD `41c224c`.**

`README-agents.md:55`:

> plain markdown lines of the form `**<Keyword>:** <value>`, one per line, ahead of the directive body. **A value may run past its own line, and the two that do are bounded differently.** `**Draft:**` ends at the next `**<Keyword>:**` line or at the end of the prompt … `**Confirmed operations:**` is a block of operation lines whose declaring prompt states no termination rule; both sides write it with `**Proposal source:**` on the line after the last operation …

"The two that do" was a complete enumeration when it was written. `9f4cdac` added a third parameter to the table and did not revisit it, so the preamble now asserts by omission that `**Initiated by:**` fits on one line — a constraint stated in no prompt.

`inference:` whether it bites depends on how long a real value is, and no real one exists yet. The one worked example, `agents/orchestrator.md:339`, is the placeholder `<the question you asked, the option the user chose, and the date>`. Against it: `agents/orchestrator.md:344` instructs *"Quote the user rather than paraphrasing their choice into your framing"*, and `rules/user-facing-output.md` `## Length` allows a gate prompt up to 8 lines and an `AskUserQuestion` stem up to 6. A verbatim quotation of a question that long, plus the option text, plus a date, on one line is possible but is not what the instruction reads like. If it does wrap, the shaper's parser has no rule and the value that halts the run is the one that is ambiguous.

`**Draft:**` shows what the fix looks like: its row says "(may span lines)" in the *Accepted values* cell and the preamble gives it a termination rule. `**Initiated by:**` needs one clause of the same kind, in whichever direction is intended — either it must fit on one line, or it ends at the next `**<Keyword>:**` line or the end of the parameter block.

The cheapest moment to do this is whenever `260814-1915_*_should-mode-3-require-the-audit-line-on-every-run-instead-of-testing-whether-it-was-dispatched.md` is answered, because option 1 of that record deletes the self-test and rewrites both the row and `agents/shaper.md:55`. Doing it earlier is one sentence and costs nothing.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). Unchanged on all three surfaces.**

`README-agents.md:53` still bounds exactly two multi-line values by name (`**Draft:**`, `**Confirmed operations:**`) as a closed enumeration; `**Initiated by:**` is not among them and its own row at `:67` states no termination rule and carries no "(may span lines)" marker. `agents/shaper.md:66-68` declares the halt for a missing value and states nothing about where the value ends.

The decision the record hoped would carry the fix — `decisions/260814-1915_*` — is still `_o_`, so the parser question (where does a free-prose parameter value stop) is still unowned.

---
Resolved: fixed — the preamble names three multi-line values and gives `**Initiated by:**` a termination rule (next `**<Keyword>:**` line or end of the parameter block), and its row says may span lines; `README-agents.md:53`, `:67`
