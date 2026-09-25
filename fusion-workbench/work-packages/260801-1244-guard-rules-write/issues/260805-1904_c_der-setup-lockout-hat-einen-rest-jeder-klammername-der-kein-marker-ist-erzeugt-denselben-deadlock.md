Der Setup-Lockout hat einen Rest: jeder Klammername, der kein Marker ist, erzeugt denselben Deadlock
---
Der v5.9.1-Fix (Commit ec0561a, Issue 260805-1435_*_setup-sperrt-sich-selbst-aus-weil-die-klammer-sonde-eingefrorene-stores-mitliest.md) hat die eingefrorenen Stores von der Sonde ausgenommen. Die Sonde matcht aber weiterhin JEDES Klammerpaar, nicht nur einen Marker:

- `skills/setup/SKILL.md:41` — `find "$WB" -type f -name '*[[]*[]]*.md' …` → bei Treffer `OLD=1`, Setup verweigert und verweist auf `/fusion:migrate`.
- `skills/migrate/SKILL.md:52` — dieselbe lose Form zählt in `REFORMAT` → `FOUND=1`, die Migrationsfrage wird gestellt.
- `skills/migrate/SKILL.md:85` — der Executor benennt aber nur `\[([oatcibspd])\]-` um.

Gemessen (Scratchpad-Workbench mit einer einzigen Datei `shared/memos/notes [draft].md`):

    setup-Sonde:  ./fusion-workbench/shared/memos/notes [draft].md      → OLD=1
    migrate-sed:  alt=[notes [draft].md] neu=[notes [draft].md] geaendert=NEIN

Der Ablauf für den Nutzer ist geschlossen: Setup verweigert → `/fusion:migrate` fragt und verschiebt nichts → meldet bei 0 Kollisionen „Migration vollständig, führe `/fusion:setup` aus" → Setup verweigert erneut. Das ist exakt die Deadlock-Form aus 260805-1435_*_setup-sperrt-sich-selbst-aus-weil-die-klammer-sonde-eingefrorene-stores-mitliest.md, nur mit lebendem statt eingefrorenem Auslöser. Betroffen ist jeder Dateiname mit Klammerpaar, dessen Inhalt nicht genau `[oatcibspd]-` ist — auch `260101-0903[x]-foo.md`.

Migrate bricht damit seine eigene, in Schritt 2 notierte Regel: „the detector must only look for things the executor can remove."
---
Schweregrad: Medium. Verifiziert (Messung oben). Befund des Skill-Workstreams (Analyst), von coderev nachgemessen. Rest von 260805-1435_*_setup-sperrt-sich-selbst-aus-weil-die-klammer-sonde-eingefrorene-stores-mitliest.md — dort wurde der Geltungsbereich der Sonde eingeschränkt, ihre Form aber nicht. Fix-Richtung: beide Sonden auf die Marker-Form verengen, wie es die Circle-Datei-Sonde mit `^[0-9]{6}-[0-9]{4}\[[a-z]\]` bereits tut — oder besser, den Executor-sed als gemeinsames Kriterium beider Seiten nehmen, damit Detektor und Executor gar nicht erst auseinanderlaufen können.
---
Resolved: 2026-08-06 — die Setup-Sonde filtert jetzt auf migrates exakte Executor-Menge `\[[oatcibspd]\]-` (`skills/setup/SKILL.md:43`, Prosa-Regel :38); dieselbe Probe-Konsistenz in migrates Survey und Kandidatenliste. `notes [draft].md` erzeugt keinen Lockout mehr (im Scratch-Workbench unter zsh und bash gemessen). Scope-Residual separat gefiled: `260806-0022_*_setup-klammer-probe-und-migrate-reformat-decken-verschiedene-baeume.md`. Commit 7ef2715, Circle 260805-2005-textschicht-gegen-code-nachziehen (Plan-Schritt 6).
