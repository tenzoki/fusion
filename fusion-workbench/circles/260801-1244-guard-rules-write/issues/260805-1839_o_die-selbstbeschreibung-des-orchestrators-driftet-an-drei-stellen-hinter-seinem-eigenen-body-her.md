Die Selbstbeschreibung des Orchestrators driftet an drei Stellen hinter seinem eigenen Body her
---
1. `agents/orchestrator.md:165` (Scope): „Invoke sub-agents: shaper, planner, taskplanner, coder, ontocoder, bugfixer, coderev, ontorev, reconciler, analyst, playmaker" — es fehlen `conceptrev` (Phase 0b, in der `tools:`-Allowlist vorhanden) und `editor` (Routing-Tabelle, Allowlist).
2. `agents/orchestrator.md:920-932` („Agents the Orchestrator Invokes"-Tabelle): endet bei `analyst`; es fehlen `playmaker` (Phase 4 Schritt 5, Z.531) und `editor`.
3. `agents/orchestrator.md:531`: „(per its Bundle B process step 5)" — `agents/playmaker.md` enthält kein „Bundle B"; der gemeinte Schritt heißt `### Step 5: Detect Bounded-Closure propagation` (playmaker.md:126).
---
Schweregrad: Low. Befund des Prompt-Kohärenz-Workstreams (Analyst), Punkt 1 und 3 von coderev nachgemessen (Zitat Z.165; grep „Bundle B" trifft nur orchestrator.md:531). Reine Listen-/Namens-Drift, kein Verhalten betroffen — aber die Scope-Liste ist genau die Stelle, an der ein Orchestrator entscheidet, was er dispatchen darf. Fix: drei mechanische Einzeiler.
