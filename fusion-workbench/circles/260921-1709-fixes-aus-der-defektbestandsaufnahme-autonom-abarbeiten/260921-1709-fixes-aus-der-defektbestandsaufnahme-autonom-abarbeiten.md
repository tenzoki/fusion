# Die Fixes aus der Defektbestandsaufnahme 260921-1653 als Paket autonom abarbeiten

---
**Domain:** code
**Status:** claimed
**Claim:** 5e8248d7 — Kai Stalmann <ks@qantr.com>, 260921-1709
**Mode:** autonomous
**Active spec/plan:** 260921-1726_*_the-33-open-defects-of-the-11-9-1-survey-worked-autonomously-as-one-package.md (the plan; no spec, planned from the directive)
**Cross-references:** 260921-1653-open-defect-survey-at-11-9-1.md, 260920-2151-sieben-neue-defekte-selbstaendig-abarbeiten.md
**Filed by:** user, Kai Stalmann <ks@qantr.com>

---

## Directive

Plane die Fixes als neues Paket zur autonomen Ausführung und starte es. Ich meine alle. Die Fixes sind die, die die Bestandsaufnahme 260921-1653-open-defect-survey-at-11-9-1.md über die 33 offenen Fehlerberichte an HEAD `3d02c7fd` (fusion 11.9.1) ausweist: alle 26 noch bestehenden; das Schließen der 6 bereits behobenen und des 1 gegenstandslosen Eintrags; und der Nebenfund in `hooks/vitest.config.mjs`. Wo ein Eintrag an einer offenen Entscheidungsfrage hängt, nimmt der Plan die Empfehlung des Entscheidungsdatensatzes (oder, wo keiner existiert, die vom Planer abgelegte Frage samt Empfehlung) als Arbeitsantwort; der Datensatz bleibt offen, bis der Nutzer mit der Umsetzung vor Augen entscheidet. Erreicht ist das Ziel, wenn jeder dieser Einträge geschlossen ist, mit Beleg im Commit, und jede dabei getroffene Arbeitsantwort in einem Entscheidungsdatensatz benannt ist.
