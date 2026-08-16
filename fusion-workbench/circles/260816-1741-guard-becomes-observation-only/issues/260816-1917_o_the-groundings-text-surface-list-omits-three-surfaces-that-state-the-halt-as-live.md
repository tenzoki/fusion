The Circle's Grounding lists the text surfaces in scope and omits three that state the removed mechanism as a live property

---

`circles/260816-1741-guard-becomes-observation-only/_t_circle.md` `### The text surfaces in scope` enumerates `docs/philosophy.md`, `agents/orchestrator.md`, `skills/setup/SKILL.md`, `skills/help/SKILL.md`, `skills/archive/SKILL.md`, `README-hooks.md` and `README.md`. Three further shipped surfaces say the same false thing after this Circle lands and are absent from the list.

- `docs/working-model.md:116-124` describes the guard's blocking behaviour at more length than `docs/philosophy.md` does, including the sentence "only two things ever block a write: a high-sensitivity decision-governed path, and an active halt", the escalation-to-halt bullet at `:119`, and a walked example at `:136` in which a write passes the guard. `docs/philosophy.md:46` points at this file as the place where the guard is "walked end to end", so the two cannot be corrected apart.
- `README-agents.md:169` names the Turn budget's home as the project's `fusion-guard.json`, merged over the plugin's `hooks/config.json`. Both filenames change in this Circle.
- `hooks/session-start.ts:12-14` justifies its warning by two cwd-anchored resolutions, "the PreToolUse write-tool checks (`lib/project-relative.ts`)" and "`isFusionPluginCwd()`". This Circle deletes both, so the stated reason for a warning that keeps a real subject becomes false.

---

The Directive states the scope by property rather than by list: "the shipped text that presents a blocking, halting guard as a live property says what the guard now is". All three surfaces fall inside that property, so the Grounding's enumeration reads as an incomplete instance of the rule rather than as a narrowing of it, and the plan treats it that way. Step 11 of `circles/260816-1741-guard-becomes-observation-only/planning/260816-1915_o_the-compliance-guard-becomes-observation-only.md` covers `docs/working-model.md` and `README-agents.md`; step 4 covers `hooks/session-start.ts` beside the deletion that makes its header false.

The record is filed because the omission is a property of the Circle's Grounding rather than of the plan, and because the same reading question will arise again: an enumeration written under a stated rule is checked against the rule, not treated as the rule's replacement. `docs/working-model.md` is the surface most likely to be missed a second time, since it lives one pointer away from the file the user named by hand.
