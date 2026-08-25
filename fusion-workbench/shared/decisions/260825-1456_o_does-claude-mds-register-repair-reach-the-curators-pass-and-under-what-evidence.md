# Does `CLAUDE.md`'s register repair reach the curator's pass, and under what evidence?

---
**Domain:** code
**Filed by:** curator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `circles/260821-1042-reply-bounded-whole-question-answered/decisions/260821-1108_*_is-claude-mds-register-repair-inside-this-circle.md` (the answer that routes the repair here); `circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2314_*_is-the-em-dash-ceiling-read-per-file-or-across-the-always-on-corpus.md` (the ceiling's scope, still open and answered by an orchestrator rather than by the user); `shared/decisions/260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`; `rules/user-facing-output.md` `## Self-review before sending: the readability gate`; `shared/history/260825-1453-curator-run.md` `## 6` candidate C01 (the survey that surfaced this)

---

## Question

On 260821 the user answered, at a gate, that `CLAUDE.md`'s register repair does not happen inside the Circle that was then active. It "goes through `/fusion:cleanup --only claude-md`, which dispatches the curator with a user gate", and the answer gives its reason: "the curator is the sanctioned writer of normative text and its pass carries an evidence tier and a citation per change, behind a gate."

That routing has now been exercised. The `CLAUDE.md` step of `/fusion:cleanup` ran on 260825 and the curator surveyed all three surfaces. It did not repair the register, and it could not have, because the very property the answer relied on is what forbids it.

`agents/curator.md` `## Remit` admits exactly two grounds for changing a normative statement: a cross-surface contradiction, or history-grounded obsolescence with a citation of the kind its tier requires. It then names the excluded case in almost these words: "Anything else that could be said about those files — that it reads long, that it duplicates a neighbour, that its session is over — belongs to somebody else." A register edit has no tier. There is no command whose output makes an em-dash false, no record retiring a punctuation mark, and no trajectory that stops applying. Repunctuating a paragraph is a change justified by re-reading the current text, which the same prompt names as the one ground that is never sufficient.

So the answer routed the work to the one writer whose discipline excludes it, and neither half is wrong on its own. This must be settled because the repair is not small and is not shrinking. Measured at HEAD `3d4b181` with `bin/fusion-prose-metric`: `CLAUDE.md` carries **126 prose em-dashes over 9 646 prose words, 13.1 per 1000 against a permit of 9**, verdict `over`. It is also, by the earlier record's own figure, about 40 per cent of the always-on prose an agent reads.

## Options

1. **The curator gains a register tier.** A fourth ground beside the three, scoped to punctuation and register only, whose citation is a `bin/fusion-prose-metric` reading and whose After block must preserve every constraint in the Before block verbatim in meaning.
   - Pros: keeps the routing the user chose, and keeps the property that made them choose it: a gate, an entry per change, a revert path. The measurement already exists and already reports per file.
   - Cons: a register pass touches nearly every paragraph of a 72 018-byte file, which is a blast radius unlike anything the gate has been asked to carry. The gate prompt shows counts, not the ledger, so a user approving "126 entries, tier register" is approving something they have not read. And a rewrite that preserves meaning is a judgement no citation check backs, which is exactly the step the curator's own output rules already flag as the one nothing verifies.
2. **A different writer does it, and the routing answer is superseded.** The `editor` is the produce-only agent for prose, and `coder` owns the shipped text surfaces generally.
   - Pros: puts a prose rewrite with a prose writer, and leaves the curator's two-reason discipline intact, which is the property that makes its ledger worth reading.
   - Cons: overturns a user's recorded answer, and gives up the thing that answer was buying. Neither `editor` nor `coder` files an evidence-tiered ledger or stops at a gate, so the change would land with no per-paragraph record of what was altered, in the single largest text every agent reads.
3. **Split it: the curator gates it, another agent writes it.** The curator measures, proposes the scope and holds the gate; the approved pass is executed by whoever the answer to option 2 would have named.
   - Pros: keeps the gate and the record where the user put them, and keeps the rewrite with a writer. It is the shape `/fusion:cleanup` already uses for its other steps.
   - Cons: a second agent in one step, and the curator's apply pass currently re-reads before-text and compares after-text byte for byte, which it cannot do for work another agent performed. Somebody has to decide what the ledger entry means when the executor is not the author.
4. **Do not repair it, and say so once.** Record that `CLAUDE.md` is exempt from the per-file ceiling, with the reason.
   - Pros: costs nothing, and there is a real argument for it. `rules/user-facing-output.md` governs output the **user** reads; `CLAUDE.md` is agent-conditioning text, and the ceiling's own scope question is still open in `260820-2314_o_*`, answered there by an orchestrator during an unattended run and deliberately filed open so the user could overrule it.
   - Cons: the largest single conditioning text an agent reads goes on teaching the register every other surface was repaired to stop teaching. The preceding Circle's own foreclosure note says as much: "the Circle's own writers work under prose it did not fix."

## Constraints

- **Whatever is chosen must not weaken the curator's two-reason rule for the other cases.** That rule is what makes its ledger auditable, and an exception that widens into a general licence to rewrite normative text on judgement is the failure the whole agent was built against.
- **A register edit may not remove a constraint.** `CLAUDE.md` carries passages describing mechanisms that were deliberately removed and that read oddly without their history; those are precisely what a register pass would be tempted to cut, and `agents/curator.md` forbids removing them on that ground.
- **The per-file reading of the ceiling is not settled.** `260820-2314_o_*` chose per file, but by an orchestrator standing in for an absent user, and the record was filed open so it could be overruled without unpicking the work. Any option that treats 13.1 per 1000 as a breach inherits that unsettledness.
- **The project declares `**Language:** de` with `**Artifact language:** en`.** `CLAUDE.md` and every rule file stay English whatever is chosen here.

## Recommendation

None strong enough to name a winner, and the reason is stated rather than hedged.

`verified:` the routing answer exists and says what is quoted above. `verified:` the measurement is 126 over 9 646 words. `verified:` `agents/curator.md` admits no tier that covers it.

`inference:` option 3 is the only one that keeps both things the 260821 answer was buying, a gate and a record, without asking the curator to certify a rewrite it has no evidence for. Its cost is real and is the one this record cannot resolve: nothing in the apply pass knows what to do with an entry another agent executed.

`speculation:` option 4 may be the honest answer if the user, meeting `260820-2314_o_*` as the live question it was filed to be, reads the ceiling as governing output rather than conditioning text. That would dissolve this record rather than answer it, and it is worth putting the two questions to the user together for exactly that reason.
