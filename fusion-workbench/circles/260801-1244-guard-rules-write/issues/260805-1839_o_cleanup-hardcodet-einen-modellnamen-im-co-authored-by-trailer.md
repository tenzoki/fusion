/fusion:cleanup hardcodet einen Modellnamen im Co-Authored-By-Trailer
---
`skills/cleanup/SKILL.md:94`: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` — hartkodierter Modellname. Alle anderen Commit-Stellen schreiben modellneutral `Co-Authored-By: Claude <noreply@anthropic.com>` (`skills/commit/SKILL.md:38,81,92`; `agents/orchestrator.md:366`).
---
Schweregrad: Low. Befund des Prompt-Kohärenz-Workstreams (Analyst), von coderev nachgemessen (grep über beide Skills). Fix: die eine Zeile auf die modellneutrale Form angleichen.
