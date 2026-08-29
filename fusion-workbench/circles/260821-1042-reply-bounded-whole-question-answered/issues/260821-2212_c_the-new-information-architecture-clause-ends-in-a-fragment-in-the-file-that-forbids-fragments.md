The new `## Information architecture` clause ends in a fragment, in the file that forbids fragments

---

`rules/user-facing-output.md:53` is the clause step 3 added. Its third sentence has no subject and no finite verb, and point 3 of the same file's readability gate (`:133`) requires that "each point is a grammatical sentence with a subject and a verb". Its second sentence garden-paths on a conjunction that attaches to the wrong subject. The dispatch asked for prose judged against the rules it is itself imposing; this is that.

---

**Affects:** `rules/user-facing-output.md:53`. Shipped rule text, loaded by every agent at dispatch.

**Severity:** Medium. The clause states its rule correctly and an agent will act on it. The defect is that the file's most-read new sentence is an exhibit of the register the file forbids, which is the mechanism the Circle's own Directive rests on (`260821-1042-reply-bounded-whole-question-answered:22-24`: a text that teaches by imitation).

**The text, in full.**

> The reply answers the question that was asked. What you noticed on the way is filed per `rules/fusion-workbench-conventions.md` `## Issue and Decision Filing`, which already forbids carrying it in chat, and gets one line of the reply naming the record. Asked where the acceptance criteria are: the path and the section names, plus one line for each of the two defects you filed.

**Fault 1, the fragment.** "Asked where the acceptance criteria are: the path and the section names, plus one line for each of the two defects you filed." There is no subject and no finite verb. It is an elliptical worked contrast, compressed from `260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`. The file's own gate, `rules/user-facing-output.md:133`:

> **Whole sentences, not fragments.** Each point is a grammatical sentence with a subject and a verb. "Recall top, Precision leck" is a fragment; "S1 hat hohen Recall, aber leckende Precision" is a sentence.

The chat profiles carry the same prohibition as the verbless-fragment habit, and `260816-0740-rhetorical-register-of-agent-output.md` inventories it as one of the thirteen figures this Circle's Directive names.

**Fault 2, the attachment.** In sentence 2 the finite verbs are "is filed" and "gets". Their shared subject is "What you noticed on the way", but the relative clause "which already forbids carrying it in chat" sits between them, so "and gets one line of the reply naming the record" attaches on first read to "which", making the conventions section the thing that gets a line. The intended reading is recoverable on a second pass. `rules/user-facing-output.md:128` says to run the five-point check on the draft and rewrite anything that fails; a sentence that needs a second pass is what that gate exists to catch.

**Fault 3, minor: a definite count with no antecedent.** "the two defects you filed" introduces two defects that the sentence never introduced. `rules/user-facing-output.md:135` requires counts to be named ("8 of the 13 open items", not "8 of 13"). Here the count is named and its referent is not.

**What a fix has to respect.** The rule file's byte budget is net zero or less against HEAD `e764637` (`260821-1108_*_what-may-the-circles-own-new-clauses-cost.md`), and the file currently stands 84 bytes under. A rewrite has 84 bytes of room and no more. The executor already measured two wordings against each other for this clause and chose the shorter (`260821-2120-coder-the-reply-answers-the-question-that-was-put.md:37-39`), so the compression is deliberate and the fix is a third wording rather than an expansion. A sketch of one, at +9 bytes:

> If the question was where the acceptance criteria are, the answer is the path and the section names, and each defect you filed on the way gets one line.

That form also removes fault 3, because it stops asserting a count the reader has not met.

**Cross-references:** `260821-1805_*_plan-reply-bounded-whole-question-answered.md:123` (step 3, which asked for "the shortest form that states the rule and its one worked contrast"); `260821-1108_*_what-may-the-circles-own-new-clauses-cost.md`.

---
Resolved: Turn 2, `rules/user-facing-output.md:53`, rewritten as a third wording rather than an expansion. All three faults are addressed:

> The reply answers the question that was asked. What you noticed on the way is filed per `rules/fusion-workbench-conventions.md` `## Issue and Decision Filing`, which already forbids carrying it in chat, and the reply names each record in one line. If the question was where the acceptance criteria are, the answer is the path and the section names, plus that one line for each defect you filed.

- **Fault 1, the fragment.** Sentence 3 now has a subject and a finite verb ("the answer is the path and the section names"), so it passes the file's own gate at `:133`.
- **Fault 2, the attachment.** The second finite clause carries its own explicit subject, "the reply names each record in one line", so the conjunction can no longer attach to the intervening relative clause. The sentence reads correctly on the first pass.
- **Fault 3, the count with no antecedent.** "the two defects you filed" is gone. "that one line for each defect you filed" refers back to the line sentence 2 just introduced and asserts no count the reader has not met.

Cost: +16 bytes on this line, paid inside the same file by the gate-entry merge that closed `260821-2203_*_a-fourth-route-out-of-the-length-cap-stands-and-the-file-names-it-as-the-remedy.md`. The file stands at 20 062 against the anchor's 20 144. The citation `` `rules/fusion-workbench-conventions.md` `## Issue and Decision Filing` `` is kept byte-for-byte, so the reference-resolution pin did not move and no attribution comment was owed.
