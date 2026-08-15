The /fusion:direct relay landed in the body and not in the Tone section or the dispatch-parameter roster

---
`9e14f93` made `/fusion:direct` relay the shaper's clarification questions instead of promising a dialogue the sub-agent cannot hold. The mechanism works: `skills/direct/SKILL.md:4` grants the skill `AskUserQuestion`, `agents/shaper.md:121` names this dispatch and its relay, and the `**Answers:**` block parses correctly against shaper's `**Draft:**` terminator at `agents/shaper.md:59`. Two things did not land. `skills/direct/SKILL.md:145` still tells the reader *"Shaper handles the clarification dialogue; this skill is the entry point and the post-write confirmation"* — the exact claim Step 4b overturns, in the same file. And `**Answers:**`, the parameter the relay passes, appears in no roster: not in `agents/shaper.md`, not in `README-agents.md` `## Dispatch parameters`.

---

## Part 1 — the fourth passage

`skills/direct/SKILL.md:145`, last line of `## Tone`:

> Concise. The user invoked this to capture a Directive, not to read meta-commentary. Shaper handles the clarification dialogue; this skill is the entry point and the post-write confirmation.

It contradicts `:9` and `:95-115` of the same file, where the skill holds the gate and proxies each round. The commit's history record enumerates three passages corrected — the header, the Step 4 bullets and the Step 4 close — and this one is outside that set.

**Fix:** rewrite the clause to describe the relay, e.g. *"Shaper composes the clarification rounds; this skill puts each round to you and carries your answers back."* Net zero to a few bytes on a bounded surface.

## Part 2 — an undeclared dispatch parameter

`skills/direct/SKILL.md:109` passes `**Answers:**` on the re-dispatch. Grepped at `3a0408a`: that string appears in that one file and nowhere else in the repository.

CLAUDE.md names `README-agents.md` `## Dispatch parameters` as the single authoring home for the roster — *"that table carries the agent, the line, its values, what happens when it is absent, and who passes it, each row cited to the prompt line it was read against"* — and records that a second copy is how `planner` came to be listed as domain-parameterised in four places while its prompt parsed nothing. This is the mirror case: a parameter that is passed and parsed by nobody's declaration.

The comparison the commit drew on makes the gap sharper. `/fusion:next` Step 5b, whose relay shape this copies, **is** declared on both sides: `agents/playmaker.md:202,206,211` and `README-agents.md:60,61`. Shaper's five rows at `README-agents.md:65-70` carry `**Mode:**`, `**Draft:**`, `**Domain:**`, `**Parent task:**` — and no `**Answers:**`.

**Fix:** add the row to `README-agents.md` `## Dispatch parameters` and the parse instruction to `agents/shaper.md` beside its siblings. The row needs: value shape (the answer block), what happens when absent (a first-round dispatch, which is the ordinary case, so absence is not an error), and who passes it (`skills/direct/SKILL.md:109`).

## Part 3 — a citation that gained a second site

`README-agents.md:70` cites `skills/direct/SKILL.md:72` as the site that passes `**Domain:**` to shaper. The relay at `:108` now passes it too. One-token fix while the table is open.

**Found by:** coderev, reviewing `f4f01b0..3a0408a` (commit `9e14f93`), with the corpus greps run by a supporting analyst pass and re-verified against the worktree.
