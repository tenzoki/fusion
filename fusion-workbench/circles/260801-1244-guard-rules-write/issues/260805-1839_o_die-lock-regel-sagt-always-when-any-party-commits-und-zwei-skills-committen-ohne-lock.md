Die Lock-Regel sagt „Always, when any party is about to commit" — und zwei Skills committen ohne Lock
---
`rules/workbench-stash-and-lock.md:107`: „When it activates: Always, when any party is about to commit."

Aber:
- `skills/commit/SKILL.md` Schritt 6 führt `git commit -m "<message>"` direkt aus — kein `fusion-commit-lock`, keine Erwähnung der Regel (grep über die Datei: null Treffer).
- `skills/cleanup/SKILL.md` committet in Schritt 2 und Schritt 6 ebenso ohne Lock (grep: null Treffer).

Die „Who acquires"-Liste des Shards nennt nur orchestrator/coder/ontocoder/bugfixer. Entweder überclaimt die Regel („any party"), oder den beiden Skills fehlt die Akquise. Der Fall, den der Lock abdecken soll — eine parallele Session committet, während der Orchestrator committet — ist genau die Situation, in der ein Nutzer `/fusion:commit` oder `/fusion:cleanup` in einem zweiten Fenster aufruft.
---
Schweregrad: Medium. Befund des Prompt-Kohärenz-Workstreams (Analyst), von coderev nachgemessen (Zitat Z.107, greps über beide Skills leer). Fix-Richtung: die beiden Skill-Commit-Schritte in `"$FUSION_PLUGIN_ROOT/bin/fusion-commit-lock" with <skill-name> -- …` einwickeln — oder die Regel ehrlich auf die vier Agenten-Parteien einschränken und den Grenzfall benennen.
