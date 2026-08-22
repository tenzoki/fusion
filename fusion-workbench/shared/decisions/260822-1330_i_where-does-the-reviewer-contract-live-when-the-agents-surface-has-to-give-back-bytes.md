# Where does the reviewer contract live, when the `agents/` surface has to give back bytes?

---
**Domain:** code
**Filed by:** coder
**Cross-references:** `shared/planning/260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md` (step 3 and Gate A); `shared/analyses/260822-1226-cut-ledger-for-three-bounded-surfaces.md` (row R1 and the relocation-is-not-removal section)

---

## Question

Step 3 of the C0 plan has to take at least 10 362 bytes out of `agents/*.md`. The cut ledger
measured 6 665 bytes of genuine restatement across the fifteen prompts and reported a shortfall of
3 697. The only candidate large enough to close it is the reviewer contract: about 8 500 bytes
standing twice, in `agents/coderev.md` and `agents/ontorev.md`, with no pointer between the copies.

Moving it into a rule file emitted to those two agents satisfies the bound. It does not reduce what
either reviewer loads: the text arrives at Setup instead of arriving in the prompt, byte for byte.
The `agents/` bound exists because every byte in a prompt is context an agent loads on every
dispatch, so a row that satisfies the bound without reducing context has to be accepted for what it
is before it is taken.

## Options

1. **Relocate the contract to `rules/review-contract.md`, emitted to `coderev` and `ontorev`.**
   - Pros: closes the shortfall with room to spare; gives the contract one authoring home, which is
     what the two copies never had; the drift check that held them equal is replaced by a pointer
     check plus an emission check.
   - Cons: the reviewers' per-dispatch context does not fall. Three files outside step 3's stated
     Files list have to move with it: the emission arm in `bin/fusion-rules`, the `ROLES` map in
     `hooks/lib/__tests__/rules-emission-golden.test.ts`, and the gate in
     `hooks/lib/__tests__/review-coverage-mandate.test.ts`, which pinned the mandate in the prompts
     themselves.
2. **Take the two smaller relocations instead** — the `**Domain:**` parsing block and the
   sub-agent `AskUserQuestion` note.
   - Pros: no new rule file.
   - Cons: together with the deletions they reach 9 265 bytes and still fall short, and the second
     of them is already the subject of an open defect that should be settled first.
3. **Cut `agents/orchestrator.md` `## Setup`,** which `skills/setup/SKILL.md` inlines.
   - Pros: clears the target more than twice over out of one file.
   - Cons: the two copies exist because the prompt instruction lost to task urgency once. Cutting
     the prompt's copy returns the state before that repair. Nothing has asked for it.

## Constraints

- No baseline map moves. The way out of a red bound is a cut, never an edit to a baseline.
- Whatever moves has to keep `bin/fusion-review-coverage` able to read the header a reviewer writes.
- The relocation is reported as a relocation. Calling it a cut would put a byte figure in the
  closure note that nobody could reproduce from what the reviewers load.

---
Answered: 2026-08-22 by the user at Gate A — option 1. The bytes move to a surface that is not
bounded, the two reviewers still load the same text at run time, and what falls is the measured
surface rather than the reviewers' context. Accepted on that statement.
Implemented: 181dd8a — `rules/review-contract.md` created carrying 8 894 bytes lifted from
`agents/coderev.md` and `agents/ontorev.md`, and `bin/fusion-rules` emits it to those two agents
alone behind `IS_REVIEWER_AGENT`, so both reviewers load the same text at run time while the
measured `agents/*.md` surface falls. Verified at closure: the generated emission golden shows the
file under `[coderev]` and `[ontorev]` and under no other agent, and the always-on rule core is
unchanged at 3 509 bytes of head-room.
