A consumer's context manifest keyed by an old agent name stops loading at v12
---
`bin/fusion-rules` matches a `rules/context-manifest.yaml` unit's `agents:` entries by exact name, so a consumer unit keyed `agents: [coder]` silently stops being emitted to `code-implementer` from 12.0.0, although the transition window reads the old store names and the orchestrator aliases old `Executor:` names. Plan (1) step 16 assumed the window covered it; it does not.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260922-1114_*_plan-prior-nomenclature-plugin-source.md, 260923-0839-implement-prior-nomenclature.md

Evidence: `bin/fusion-rules` compares `agents:` entries by equality with the agent name; found while writing `docs/upgrading-to-v12.md`, which now tells consumers the gap exists and gives a grep for the old names.

Acceptance: either `bin/fusion-rules` maps the seven pre-v12 names to their v12 names in manifest matching until 13.0.0 (with a test), or the gap is accepted by a decision and the upgrade note stays the only remedy.

---
Resolved: `bin/fusion-rules` passes its one rename table `V12_RENAMES` into the manifest matcher, so during the v12 window an `agents:` entry naming a pre-v12 agent matches its v12 name, with a one-line stderr advisory per old name; an unknown name still matches nothing. `context-manifest.test.ts` proves both. `README-agents.md` `## Releasing` step 7 lists the alias among what 13.0.0 deletes, and `docs/upgrading-to-v12.md` §3 says old names match until 13.0.0.
