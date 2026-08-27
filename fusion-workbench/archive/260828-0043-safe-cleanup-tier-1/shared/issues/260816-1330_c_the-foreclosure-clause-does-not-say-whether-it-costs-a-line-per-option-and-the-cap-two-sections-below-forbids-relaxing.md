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
**Cross-references:** `archive/260817-1907-safe-cleanup-scoped/shared/issues/260816-0740_*_the-gate-contract-never-requires-an-option-to-state-what-it-forecloses.md` (the record this clause closes); `shared/history/260816-1251-curator-run.md` section 9 (the user was shown a cost of "roughly one line per option" before approving, so the second reading is the one the approval was given against, and the text does not say it); `shared/issues/260814-1419_*_the-tightened-chat-profile-caps-contradict-the-length-section-of-the-rule-that-owns-them.md` (a different cap dispute on the same section, still open); `shared/issues/260812-0253_o_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`.

**Verified at HEAD `6049d3e`** by reading `rules/user-facing-output.md:95`, `:101`, `:103` and `:107`.

**A second gap in the same clause, recorded here rather than filed separately.** The clause's preferred branch puts the foreclosure in the `AskUserQuestion` option `description` field. `## Length` caps the option **label** at "≤ 4 lines per option label" (`:103`) and says nothing about `description`. So the branch the clause prefers writes mandatory content into the one field on that surface no cap governs, while the fallback branch writes into the field a cap does govern. That is not a contradiction, it is a hole, and it is on the side the clause steers agents towards.

**What would settle both.** One sentence stating whether the foreclosure occupies its own line, and one entry in `## Length` giving `description` a cap. Which numbers is a judgement the curator's evidence tiers do not reach, the same ground on which section 9 of the run file records the original two bullets as a user override; if a number is needed it needs the same gate.

**What must not be done instead.** Relaxing `:101` to make the arithmetic work. `:107` forbids exactly that, and removing a constraint to accommodate a new requirement is the move `circles/260801-1244-curator/issues/260814-1332_*_the-curator-prompt-is-the-one-prose-agent-that-does-not-enumerate-its-long-form-outputs.md` declined for the analogous case.

**Reconciliation 260816-1345 (reconciler, HEAD `dd560ab`): the finding is confirmed and two of its
four line numbers are wrong.** At HEAD the foreclosure clause is at `rules/user-facing-output.md:96`,
not `:95`, and the option-label cap is at `:102`, not `:103`. The gate-prompt cap at `:101` and the
no-relaxing sentence at `:107` are cited correctly. The ambiguity the record names is real and reads
exactly as described. Same citation drift as
`shared/issues/260808-0030_o_line-number-citations-into-rule-files-go-stale-and-no-gate-reads-them.md`.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `rules/user-facing-output.md:96` still leaves the cost unstated, `:101` and `:102` still cap the gate and the option label, `:107` still forbids relaxing, and the `description` field is still ungoverned. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.

---
Resolved: both halves this record asks for landed in `rules/user-facing-output.md`, and `:118`
("Do not relax the cap") was not touched. The one sentence stating whether the foreclosure occupies
its own line is at `:104`, "A foreclosure takes its own line. It is never folded onto the end of
the option's line to buy a line back against a cap, because a cap satisfied by longer lines is not
satisfied." The `## Length` entry giving `description` a cap is at `:112`, "`AskUserQuestion`
option `description`: ≤ 2 lines", which closes the hole this record names in its second finding,
on the branch the clause steers writers towards. The arithmetic the ambiguity made undecidable is
now written out at `:105`: one question stem line, three option lines and three foreclosure lines,
seven against the eight-line gate cap at `:109`, with a plain-text gate capped at three options and
a fourth sent through `AskUserQuestion` or split. Commits `80d1599` and `86edaac`, plan steps 13
and 14 of `circles/260820-2051-style-rules-arrive-and-get-measured`.

Read against the record's own "What would settle both": one sentence on the own-line question, one
`## Length` entry for `description`. Both present. Read against its "What must not be done
instead": the gate cap is still 8 and the no-relaxing sentence is still there, verified at
`:109` and `:118`.

**The numbers rest on a decision the user has not confirmed.** This record says the numbers "need
the same gate" as the original override. They were chosen by the orchestrator during an unattended
run and are filed as
`circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2314_*_does-a-foreclosure-clause-cost-its-own-line-and-what-caps-the-description-field.md`,
still `_o_`. The defect this record names is the ambiguity and the ungoverned field, and both are
gone whichever numbers stand, so it closes now. If the user overturns the decision, the correction
comes back as a `Revised by:` line here rather than as a reopening.

Closed by reconciler 260821-0410; log
`circles/260820-2051-style-rules-arrive-and-get-measured/history/260821-0416-reconciliation.md`.
