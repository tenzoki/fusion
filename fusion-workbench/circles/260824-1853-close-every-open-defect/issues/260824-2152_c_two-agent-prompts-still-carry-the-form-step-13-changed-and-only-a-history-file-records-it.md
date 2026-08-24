Two agent prompts still carry the form step 13 changed, and only a history file records it
---
`rules/circle-records.md` now defines three claim openings and the header form of `split`; `agents/orchestrator.md:266` still says "the claim's two literal openings" and `agents/playmaker.md:207` still emits the single-line `split <entry path> into: …; …` form. Step 13's report names both residuals; no issue record does, and `## Issue and Decision Filing` forbids carrying a defect in a history log.
---
**Filed by:** coderev
**Severity:** Low
**Affects:** `agents/orchestrator.md` `## Circle head fields`, `agents/playmaker.md` (the confirmed-operations block of the report format). `agents/` is under a concurrent coder's edit at the time of filing; verify at HEAD before acting.

**Evidence.**

- `rules/circle-records.md` `### The claim field` (commit `01964e4`): "The field takes one of exactly three literal openings", the third being `Claimed YYMMDD-HHMM, identity partial: …`. `agents/orchestrator.md:266` at HEAD: "its `### The claim field` for the claim's two literal openings." The section it points at now contradicts the count it gives, and the orchestrator is the agent that writes the claim on `_a_ → _t_`.
- `rules/circle-records.md` `## Backlog — ranked` (same commit): "A split is the exception in shape … a header line, then one indented line per produced entry", `split <entry path>:` / `  - <slug> — <title>`. `skills/next/SKILL.md:131-140` already relays the header form. `agents/playmaker.md:207` at HEAD: `- split <entry path> into: <slug> — <title>; <slug> — <title>`, the single-line form the rule replaced. The playmaker is the agent that writes the line `/fusion:next` relays, so the two ends of that relay now disagree on shape.
- Both residuals are stated in `circles/260824-1853-close-every-open-defect/history/260824-2059-coder-step-13-rules.md` `## Departures from the records' proposals` and in the `Resolved:` lines of `…260813-1545_c_…` and `…260824-1538_c_the-claim-has-no-defined-value…`. A `grep -rl 'literal opening\|playmaker.md:207'` over this Circle's `issues/` and `shared/issues/` finds no record. `rules/fusion-workbench-conventions.md` `## Issue and Decision Filing`: "NEVER put issues or decisions inside … history logs".

**Proposed fix.** `agents/orchestrator.md:266`: "three literal openings". `agents/playmaker.md:207`: the header form with two indented produced-entry lines, matching `rules/circle-records.md` and `skills/next/SKILL.md:140`. Both are inside the `agents/` growth bound; the second adds one line.

---
Resolved: fixed — the orchestrator says three literal openings and the playmaker emits the `split <entry path>:` header form with indented produced-entry lines; agents/orchestrator.md:266, agents/playmaker.md:207-209
