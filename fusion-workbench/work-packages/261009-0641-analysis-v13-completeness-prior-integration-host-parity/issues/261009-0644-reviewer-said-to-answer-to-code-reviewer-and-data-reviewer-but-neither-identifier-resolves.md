The reviewer is said to answer to `code-reviewer` and `data-reviewer`, but neither identifier resolves on the Claude side
---
`docs/upgrading-to-v12.md` `### Agents` ("The reviewer now also answers to the two profile identifiers `code-reviewer` and `data-reviewer`") and `README-agents.md` `## The agents` (the `reviewer` row, "serving both profile identifiers") read as an instruction that the Prior profile names are usable on Claude. They are not: no `agents/code-reviewer.md` or `agents/data-reviewer.md` exists, and the resolvers refuse both names.
---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>

Evidence, measured 2026-10-09 at fusion `0ffee3c4`: `bin/fusion-paths code-reviewer` exits 2; `bin/fusion-rules explorer` exits 2 as well (Prior's `explorer` profile has no Claude counterpart). The same observation was recorded unfiled in `260927-2304-fusion-dual-host-design-review.md` `## Filed Issues`; Prior's own boundary document states "prose aliases are not executable registrations". The mismatch matters for host parity: a Prior role name handed to the Claude side fails at Setup.

Acceptance: either both sentences say the identifiers are Prior catalog names that map to `reviewer` plus a `**Review domain:**` line and are not dispatchable names on Claude, or `bin/fusion-paths` and `bin/fusion-rules` resolve both identifiers to the reviewer's key set. Context: `261009-0644-host-parity-claude-and-prior.md`.

Resolved: 2026-10-09, FJ05 plan step 3, first acceptance branch taken. `docs/upgrading-to-v12.md` `### Agents` and the `reviewer` row of `README-agents.md` `## The agents` now say that `code-reviewer` and `data-reviewer` are Prior catalog names, that on Claude they map to `reviewer` with a `**Review domain:**` line, and that they are not dispatchable names. The resolvers are unchanged.
