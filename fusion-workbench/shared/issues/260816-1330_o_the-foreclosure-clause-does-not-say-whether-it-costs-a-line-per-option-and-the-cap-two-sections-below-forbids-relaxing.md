The foreclosure clause does not say whether it costs a line per option, and the cap two sections below forbids relaxing itself

---
Commit `52b8665` added to `rules/user-facing-output.md:95`: "Carry it in the `AskUserQuestion` option `description` field, or on the option's own line when the gate is plain chat text."

"On the option's own line" reads two ways. Either the foreclosure is appended to the line that already carries the option, costing no lines, or it takes a line of its own for that option, costing one line per option. Six lines below, `:101` caps a gate prompt at "≤ 8 lines **including the question and the option list**", and `:107` closes the escape: "If a cap is exceeded, move material to Details. Do not relax the cap." Under the second reading a four-option chat-text gate needs one question line, four option lines and four foreclosure lines, which is nine, and the prescribed remedy does not apply because the option list cannot be moved out of the prompt it is the option list of.

The defect is the ambiguity, not the arithmetic. A clause that determines a line count sits two sections above a clause that caps line counts and refuses to be relaxed, and neither says which reading is meant.

---
**Found by:** coderev, review of `b18a8cf..6049d3e`, review file `shared/reviews/260816-1330-coderev-repunctuation-and-gate-contract.md`.
**Owner:** `curator`. The change is to normative text and goes through the rule-file gate.
**Severity:** Medium. Both surfaces are always-on for every agent, and an agent writing a four-option chat gate today cannot tell whether it is over the cap.
**Filed in the shared store** per the Origin Rule: no Circle is active.
**Cross-references:** `shared/issues/260816-0740_c_the-gate-contract-never-requires-an-option-to-state-what-it-forecloses.md` (the record this clause closes); `shared/history/260816-1251-curator-run.md` section 9 (the user was shown a cost of "roughly one line per option" before approving, so the second reading is the one the approval was given against, and the text does not say it); `shared/issues/260814-1419_o_the-tightened-chat-profile-caps-contradict-the-length-section-of-the-rule-that-owns-them.md` (a different cap dispute on the same section, still open); `shared/issues/260812-0253_o_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`.

**Verified at HEAD `6049d3e`** by reading `rules/user-facing-output.md:95`, `:101`, `:103` and `:107`.

**A second gap in the same clause, recorded here rather than filed separately.** The clause's preferred branch puts the foreclosure in the `AskUserQuestion` option `description` field. `## Length` caps the option **label** at "≤ 4 lines per option label" (`:103`) and says nothing about `description`. So the branch the clause prefers writes mandatory content into the one field on that surface no cap governs, while the fallback branch writes into the field a cap does govern. That is not a contradiction, it is a hole, and it is on the side the clause steers agents towards.

**What would settle both.** One sentence stating whether the foreclosure occupies its own line, and one entry in `## Length` giving `description` a cap. Which numbers is a judgement the curator's evidence tiers do not reach, the same ground on which section 9 of the run file records the original two bullets as a user override; if a number is needed it needs the same gate.

**What must not be done instead.** Relaxing `:101` to make the arithmetic work. `:107` forbids exactly that, and removing a constraint to accommodate a new requirement is the move `circles/260801-1244-curator/issues/260814-1332_o_the-curator-prompt-is-the-one-prose-agent-that-does-not-enumerate-its-long-form-outputs.md` declined for the analogous case.
