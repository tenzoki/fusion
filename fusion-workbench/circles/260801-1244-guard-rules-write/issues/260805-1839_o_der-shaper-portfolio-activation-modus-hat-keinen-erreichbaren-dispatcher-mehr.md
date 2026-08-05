Der shaper-Modus portfolio-activation hat keinen erreichbaren Dispatcher mehr
---
`agents/shaper.md:3,47` nennt als Dispatcher des portfolio-activation-Modus: „dispatched by playmaker or the user via `/fusion:next` interactive confirm". Beide Wege existieren nicht:

- `agents/playmaker.md:3,10`: „Never dispatches another agent … never dispatch another agent, never invoke a skill".
- `skills/next/SKILL.md:4`: `allowed-tools: [Bash, Read, Write, AskUserQuestion, Agent(fusion:playmaker)]` — kein shaper; Schritt 6 macht Umbenennung und Zeiger selbst; das Wort „shaper" kommt im Skill nicht vor.
- Der Orchestrator erwähnt den Modus nirgends.

Damit ist der gesamte Modus — samt der Scope-Ausnahme `shaper.md:28` (Directive/Grounding-Abschnitte des Circle-Records in-place editieren) und dem Konventions-Versprechen „Grounding snapshot: Filled at `_a_ → _t_` activation by shaper portfolio-activation mode" (`rules/circle-records.md`, Circle-record-Template) — von keiner Stelle im System erreichbar. Praktische Folge: Bei einer Aktivierung über `/fusion:next` wird der Grounding-Snapshot NICHT befüllt und die Directive NICHT verfeinert; das Template verspricht einen Schritt, den niemand ausführt.
---
Schweregrad: Medium. Befund des Prompt-Kohärenz-Workstreams (Analyst), von coderev nachgemessen (Zitate shaper.md:3/47, playmaker.md:3/10, next-Frontmatter Z.4, mv/printf in next Schritt 6). Fix-Richtung gemeinsam mit dem Schwester-Issue zur Circle-Aktivierung (gleicher Zeitstempel): entweder /fusion:next dispatcht shaper im portfolio-activation-Modus, oder der Modus wird aus shaper/circle-records gestrichen und die Grounding-Befüllung wandert explizit in den Skill.
