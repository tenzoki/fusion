README-hooks.md zeigt als "effective hook configuration" einen SessionStart-Block, der nicht dem ausgelieferten hooks.json entspricht
---
Schweregrad: niedrig. README-hooks.md:60-88: SessionStart mit einem einzigen, ungeschützten export-Kommando. hooks/hooks.json hat zwei SessionStart-Hooks: den mit [ -n "${CLAUDE_PLUGIN_ROOT}" ] ... || true geschützten Export und einen zweiten printf-Hook mit der systemMessage-Banner-JSON. Das Architektur-Diagramm (:30-32) erwähnt den Banner, der JSON-Block nicht.
---
Klasse 5/4, verifiziert (direkter Vergleich). Analyse: circles/260801-1244-guard-rules-write/analyses/260805-1840-doku-gesamtpruefung-gegen-code.md
---
Resolved: 2026-08-06 — der Effective-Hook-Configuration-Block entspricht dem ausgelieferten `hooks.json` (gated `FUSION_PLUGIN_ROOT`-Export plus Banner-Hook in SessionStart; `README-hooks.md:58`). Commit 9a96466, Circle 260805-2005-textschicht-gegen-code-nachziehen (Plan-Schritt 11, Batch B).
