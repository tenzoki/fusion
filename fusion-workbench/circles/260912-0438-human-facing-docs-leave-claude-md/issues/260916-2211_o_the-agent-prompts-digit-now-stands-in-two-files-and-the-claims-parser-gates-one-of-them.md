The "agent prompts" digit now stands in two files and the CLAIMS parser gates one of them

---

`L05` moved the `agents/*.md` layout row into `README-agents.md` and left a pointer carrying the same phrase in `CLAUDE.md`. The `CLAIMS` row for `\bThe (\d+) agent prompts\b` names `CLAUDE.md`, so the occurrence at `README-agents.md:49` is asserted by nothing.

---

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Evidence.** At `7ea6e40b`, `grep -nE 'The [0-9]+ agent prompts'`:

- `CLAUDE.md:24` — *"The 11 agent prompts; none declares a `tools:` line."* — gated by `CLAIMS` row 2, `{ rel: "CLAUDE.md", re: /\bThe (\d+) agent prompts\b/g }`.
- `README-agents.md:49` — *"The 11 agent prompts. **No agent declares a `tools:` line**; all 11 inherit …"* — the moved sentence. Its **second** digit is gated by row 3, retargeted to `README-agents.md` in this range; its **first** is gated by no row.

Before the move the phrase existed once, in `CLAUDE.md`, gated. The relocation created a second live occurrence and no row followed it. The comment above `CLAIMS` states the reason row 2 stayed on `CLAUDE.md` — the pointer sentence still carries the digit — which is correct and is not the gap; the gap is that nothing was added for the sentence that left.

`derivable-enumerations-lint.test.ts` asserts over *every* match in a named file, so the repair is one array entry. Eleven is correct in both places today (`ls agents/*.md | wc -l` = 11), so nothing is currently false.

**Scope.** `hooks/lib/__tests__/derivable-enumerations-lint.test.ts`, the `CLAIMS` array. The other four counts moved by the relocation are historical figures (`15 agents`, `12 agents`, `Five prompts`) that name no present cardinality, and `11 specialized agents` at `README-agents.md:47` is gated by row 1.

**Acceptance test.** Deleting an `agents/*.md` file and running the suite fails on `README-agents.md`'s *agent-prompts* claim as well as on its *inheriting-agents* claim.

**Cross-references:** 260916-1315_*_the-retired-gates-redundancy-argument-covers-one-direction-and-claude-md-still-claims-the-other.md
