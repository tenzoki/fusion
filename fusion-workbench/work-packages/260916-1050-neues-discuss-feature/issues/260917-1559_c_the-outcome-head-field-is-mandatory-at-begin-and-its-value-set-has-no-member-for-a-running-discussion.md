The `**Outcome:**` head field is mandatory at `--begin` and its value set has no member for a running discussion

---
`skills/discuss/SKILL.md:93` requires the record to carry "every head field it will ever carry" before round one. `:106` gives `**Outcome:**` three values, all of them terminal. The gap falls exactly on the interrupted record the store exists to preserve.

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**The two lines.**

`skills/discuss/SKILL.md:93`:

> **Write it before round one's result reaches the chat**, carrying every head field it will ever carry, an empty register and `**Rounds:** 0`.

`skills/discuss/SKILL.md:106`, inside the template:

> `**Outcome:** converged | did not converge after <N> rounds | nothing to check`

`--close` is the only step that writes the field (`:182`, "set `**Outcome:**` to the one the stopping rule produced"). So between `--begin` and `--close` the body mandates a field whose enumerated values are all false, and names no value for the state the record is actually in. Whoever writes the file invents one, blanks it, or drops it against the instruction — three different records for one state, and nothing says which.

**Why it is not cosmetic.** The whole argument for writing the record from round one is the interrupted session (`:44`, `:93`; spec C6 acceptance "Killing the session after round three leaves a record in the open state carrying three rounds"). The interrupted record is precisely the one a reader opens to learn what happened, and the field that answers that question is the one with no legal value. The filename marker carries `_o_`, and `rules/fusion-workbench-conventions.md:281` tells the reader to read an `_o_` discussion as interrupted — so the information exists and the head field contradicts or duplicates it.

**A case split that is neither disjoint nor complete** (`rules/critical-stance.md` §4): the three values partition the ways a discussion *finishes*, and the record spends most of its life not finished.

**The spec has the same hole**, so this is inherited rather than a deviation: C6's acceptance criterion reads "carrying every head field it will ever carry" and C6's file format lists the same three values. Fixing the body without the spec leaves the two disagreeing.

**Acceptance test.** A record written at `--begin` and never closed carries an `**Outcome:**` whose value is named in the body, or the body says the field is absent until `--close` and the "every head field" sentence is scoped to exclude it. One reading, not three. The `skills/` surface stands at zero margin after the fourth `SKILL_HEAD_ROOM` raise (`README-hooks.md` `#### The head-room raises …`), so a repair that adds bytes turns the suite red and must be paid inside the same body.

**Cross-references:** `260917-1119_*_spec-fusion-discuss-a-two-agent-discussion-loop.md` `### C6`

---
Resolved: `skills/discuss/SKILL.md` gains a fourth `**Outcome:**` value, `still running`. Step 4 now mandates it in the head written at `--begin`, the template lists it first, and Step 8 replaces it with the one the stopping rule produced. The four values are disjoint and complete over the states a record can be in: one non-terminal, the three terminal ones unchanged. The spec's identical gap is recorded in `260917-1119_*_spec-fusion-discuss-a-two-agent-discussion-loop.md` `## Corrections after approval`; the spec body stays as approved. The repair was paid inside the same body — the file is 4 bytes smaller than before.
