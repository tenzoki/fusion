Three marker enumerations in the conventions were left behind when the discussion kind joined the vocabulary

---
`c066bfd3` added discussions to `## State Markers — issues and planning`'s opening sentence and to `## Filename Patterns`, and left three enumerations below that now contradict it or omit it. The terminal-state one is load-bearing: `skills/discuss/SKILL.md` asserts a terminality the rule does not carry.

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**1. `rules/fusion-workbench-conventions.md:367` — the terminal list.**

> `_c_` and `_d_` on an issue or a plan, `_i_`, `_s_` and `_d_` on a decision, `done` and `dropped` on a work item: these are **terminal** …

A closed discussion is absent. `skills/discuss/SKILL.md:184` states "The closed state is terminal, so taking the subject up again means beginning a new discussion that cites this one", and spec C6 makes the same claim. So a skill body asserts a property the rule that authors terminal states does not grant, and an agent reading only the always-on conventions has no basis to refuse reopening a `_c_` discussion. This is the one of the three that changes behaviour.

**2. `rules/fusion-workbench-conventions.md:313-317` — the transition rules.**

The section header at `:303` now reads "Defect, spec/plan and discussion files carry a state marker", so the four rules under it govern discussions. They mandate `_o_` → `_p_` → `_c_` and permit `_d_`. `## Filename Patterns`'s new row at `:273` restricts the kind to "`_o_` and `_c_` only", and `skills/discuss/SKILL.md:91` says "with no other state in between". Three statements in two files, one of which disagrees.

**3. `rules/fusion-workbench-conventions.md:361` — the glob scope.**

> This applies to every marker in both vocabularies (`_o_`, `_p_`, `_c_`, `_d_` on issues and plans; …) anywhere a filename carrying one is matched by a glob …

"on issues and plans" is now an incomplete enumeration of the surfaces the issues-and-planning vocabulary reaches. A prompt author writing a glob over `discussions/` reads this line and concludes the rule does not cover the store.

**Acceptance test.** `:367` names a closed discussion among the terminal states, or `skills/discuss/SKILL.md:184` stops asserting terminality. `:313-317` either scopes its `_p_`/`_d_` rules away from discussions or the `## Filename Patterns` row drops its restriction — not both as they stand. `:361` names the discussion surface. Added bytes here are charged to all eleven dispatch paths at zero head-room (`hooks/lib/__tests__/fixtures/dispatch-path.baseline`); the range already spent +817 on this file, so the repair is best made by re-scoping existing words rather than appending.

**Cross-references:** `260917-1119_*_spec-fusion-discuss-a-two-agent-discussion-loop.md` `### C6`, `### C7`, `260917-1115_*_the-claude-md-cut-banked-85-kb-of-slack-into-a-bound-whose-header-says-head-room-is-zero.md`

---
Resolved: All three enumerations in `rules/fusion-workbench-conventions.md` now carry the discussion kind, at +108 bytes net. (1) `## Terminal states are history` names `_c_` on a discussion among the terminal markers, so the terminality `skills/discuss/SKILL.md` asserts is now granted by the rule every agent loads. (2) The `## State Markers — issues and planning` Rules bullets no longer mandate `_p_` or `_d_` for every marker-carrying kind: the `**Rules**` line scopes both steps to "where the kind's `## Filename Patterns` row allows them", and the "when work is done" bullet drops its `_p_` precondition so it covers a discussion's `_o_` → `_c_` close as written. The restriction itself is stated once, in the `## Filename Patterns` row, and the bullets defer to it rather than restating it — no third copy was added. (3) The `## Marker globs` scoping sentence reads "on issues, plans and discussions", so a glob author over `discussions/` finds the store covered. Cardinalities checked in the vicinity and left standing because each is still true: "both vocabularies" on the glob line (two, enumerated inline, and the discussion joins an existing one rather than adding a third); "a discussion is the only one whose record is written unfinished" under `## Filename Patterns` (a plan is written complete and its marker tracks the work; a discussion's body grows round by round); "Two forms are correct" above the glob table (two rows present); "`_i_` and `_s_` are terminal" and "the one allowed terminal-to-terminal transition" in `## State Markers — decisions` (untouched, decisions-only). The markerless-kinds sentence at the end of `## State Markers — issues and planning` was checked too and needs nothing: it does not name discussions, which is correct. Verification: `cd hooks && npm test` — exit 1, 941 of 942 passing, the single failure `rules-emission-golden.test.ts` being the expected staleness from the +108 bytes (`fusion-workbench-conventions.md 65890` → `65998`) and nothing else; the golden was deliberately left for the user to regenerate. `surface-growth-bound` and the dispatch-path bound stayed green — the addition fits the head-room.
