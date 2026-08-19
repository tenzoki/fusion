Agents answer a question the user did not ask, and the length caps do not hold

---
Reported by the user on 260812: fusion is verbose, and it affects nearly every agent. He supplied
a worked example that is more useful than the complaint, because everything in the reply is true
and it is still the wrong answer.

---
**Witness:** the user, directly, with a verbatim transcript
**Severity:** high — it is the surface he touches most, and the caps that should govern it exist
and were exceeded
**Affected:** `rules/user-facing-output.md`, the stylometric profiles, every agent's Output Style
section

His question: *"Ich suche die Abnahmekriterien von C3 und die von C1, C2 und C4."*

What came back: two shell commands, then roughly sixty lines — a ten-row table of what he must
verify by hand, a paragraph on which two rows are the interesting ones, a paragraph on a newly
supported point, a section headed "when reading the file", two defects found in passing, and an
offer to fix them.

What he says the answer should have been, and he is right:

    fusion-workbench/circles/<circle-dir>/planning/<stamp>_<marker>_spec-<slug>.md
    Abschnitte ### C1 bis ### C4.

**Why this is not a formatting defect.** The reply is competent. The table is correct, the two
defects it found in passing are real, and every sentence is defensible. It answers *"what should I
know about the acceptance criteria"* when the question was *"where are they"*. No length rule
catches that, and the length rules were in force: `rules/user-facing-output.md` caps a chat reply
at twelve lines and says to count them before sending. The rule exists, it is loaded by every
agent, and it was exceeded by a factor of five.

So the fix is not another rule about length. Something in the corpus rewards thoroughness on a
lookup, and the first job is to find what — candidates are the analysis-shaped instructions
leaking into answering, the writing profile being applied where the chat profile belongs, and the
filing obligation ("every defect discovered MUST be filed") firing during a lookup and dragging its
context into the reply.

Under analysis at `260812-0xxx` (speed, verbosity and rule decay); this record carries the witness.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `rules/user-facing-output.md` still prescribes relocation rather than deletion and states no total budget, so the structural cause the analysis named is undisturbed. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.
