# Do the rare orchestrator flows stay in every session's context?

---
**Domain:** code
**Filed by:** claude-code (conditioning-load work, the orchestrator partition round), Kai Stalmann <ks@qantr.com>
**Cross-references:** `agents/orchestrator.md` (the prompt the flows leave; the stubs and the retained invariants) · `rules/orchestrator-resume.md` and `rules/orchestrator-rebalance.md` (the authoring homes) · `shared/decisions/260827-1056_*_which-parts-of-the-language-and-backlog-rules-does-every-dispatch-still-carry.md` (the partition criterion's rule-side precedent)

---

## Question

`agents/orchestrator.md` stood at 162,440 bytes, 39 % of the whole `agents/` surface, resident in every session's context for the session's whole life. Measured over the event log's 83 sessions: the interrupted-session resume ran in 7, the Rebalance mechanics in fewer than a third (13 Revise-Artifact, 8 Revise-Grounding, 1 Revise-Directive, 4 Bounded-Closure events), and the shaper re-sharpening loop is a branch of those. Do procedures most sessions never enter stay resident?

## Answer (260827, user: "weiter" on the announced partition)

**No — the procedure moves, the trigger and the invariants stay.** Three blocks leave for `rules/` (read on their trigger through `$FUSION_PLUGIN_ROOT`, the same path the curator reads `rule-file-provenance.md` by): the resume *procedure* (the inherits-invariants and the no-second-`turn_start` rule stay in the prompt, because the live loop reads them), the Rebalance gate mechanics with **Rebalance bounding** (the four option names stay, user-facing), and the re-sharpening contract. Each stub states that the text is NOT in context, forbids acting from memory, and halts toward `fusion --update` when the file is absent on an older install. 162,440 → 145,733 bytes resident per session.

The risk this shape carries, named: a stub is an instruction to fetch, and an orchestrator under task pressure has ignored instructions before (the project's own worked case). The mitigation is the stub's phrasing — the mechanics it would need are genuinely absent from context, so improvising fails loudly rather than plausibly — and the first live session after this lands should confirm a resume actually reads the file.
