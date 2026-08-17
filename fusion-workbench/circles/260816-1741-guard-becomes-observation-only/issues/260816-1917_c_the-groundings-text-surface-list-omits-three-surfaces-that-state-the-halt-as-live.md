The Circle's Grounding lists the text surfaces in scope and omits three that state the removed mechanism as a live property

---

`circles/260816-1741-guard-becomes-observation-only/_t_circle.md` `### The text surfaces in scope` enumerates `docs/philosophy.md`, `agents/orchestrator.md`, `skills/setup/SKILL.md`, `skills/help/SKILL.md`, `skills/archive/SKILL.md`, `README-hooks.md` and `README.md`. Three further shipped surfaces say the same false thing after this Circle lands and are absent from the list.

- `docs/working-model.md:116-124` describes the guard's blocking behaviour at more length than `docs/philosophy.md` does, including the sentence "only two things ever block a write: a high-sensitivity decision-governed path, and an active halt", the escalation-to-halt bullet at `:119`, and a walked example at `:136` in which a write passes the guard. `docs/philosophy.md:46` points at this file as the place where the guard is "walked end to end", so the two cannot be corrected apart.
- `README-agents.md:169` names the Turn budget's home as the project's `fusion-guard.json`, merged over the plugin's `hooks/config.json`. Both filenames change in this Circle.
- `hooks/session-start.ts:12-14` justifies its warning by two cwd-anchored resolutions, "the PreToolUse write-tool checks (`lib/project-relative.ts`)" and "`isFusionPluginCwd()`". This Circle deletes both, so the stated reason for a warning that keeps a real subject becomes false.

---

The Directive states the scope by property rather than by list: "the shipped text that presents a blocking, halting guard as a live property says what the guard now is". All three surfaces fall inside that property, so the Grounding's enumeration reads as an incomplete instance of the rule rather than as a narrowing of it, and the plan treats it that way. Step 11 of `circles/260816-1741-guard-becomes-observation-only/planning/260816-1915_o_the-compliance-guard-becomes-observation-only.md` covers `docs/working-model.md` and `README-agents.md`; step 4 covers `hooks/session-start.ts` beside the deletion that makes its header false.

The record is filed because the omission is a property of the Circle's Grounding rather than of the plan, and because the same reading question will arise again: an enumeration written under a stated rule is checked against the rule, not treated as the rule's replacement. `docs/working-model.md` is the surface most likely to be missed a second time, since it lives one pointer away from the file the user named by hand.

---
Reconciliation 2026-08-17, Phase 3. **Left OPEN, and for the same reason as its sibling: the
work is done and the Grounding still says otherwise.**

All three omitted surfaces were corrected, and each was read at HEAD rather than taken from a
step's claim:

- `docs/working-model.md:116-125` no longer describes a blocking guard. It now opens "It runs on
  every edit an agent attempts, and it blocks none of them", names the two products, and states
  at `:123` that four mechanisms once blocked or warned and all four are gone, each with its
  date. The sentence this record quoted — "only two things ever block a write" — is gone.
- `README-agents.md:169` names `fusion.json`, states "Two layers and no third", and says this is
  the only setting fusion still resolves.
- `hooks/session-start.ts:1-30` justifies its warning by one surviving resolution, the work-tree
  preference of the three `bin/` helpers, and puts both `lib/project-relative.ts` and
  `isFusionPluginCwd()` in a past-tense paragraph naming 2026-08-16 as the date they went.

What has not moved: `_t_circle.md:106-115` `### The text surfaces in scope` still enumerates seven
surfaces and still omits these three. Editing the Circle record is outside the reconciler's write
scope. Due at the `_t_` → `_c_`/`_b_` transition, together with
`260816-1917_o_the-groundings-test-list-names-a-test-whose-subject-survives-the-removal.md`.

The reading this record was filed to establish held in practice, which is worth recording: the
Directive stated its scope by property and the plan treated the Grounding's list as an incomplete
instance of that property rather than as a narrowing of it. All three surfaces were fixed on that
reading alone.

---

**Resolved 2026-08-17, Turn 4.** `docs/working-model.md`, `README-agents.md:169` and
`hooks/session-start.ts` are now enumerated in `### The text surfaces in scope`, each with the
claim it carried at the anchor `3d41d4a`. A second paragraph records that the omission was one of
enumeration rather than of scope: the Directive states the scope by property, and all three fall
inside it, which is how the plan in fact treated them. Written by shaper in portfolio-activation
mode, dispatched at the Phase-3 Rebalance gate on the user's explicit naming of that mode.
