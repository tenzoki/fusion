# Die Reichweite der Regel-Ausnahme ist nach dem Mechanismuswechsel nicht neu gemessen

---

**Severity:** Medium
**Domain:** code
**Filed by:** coder, während der Freigabe-Vorbereitung 6.0.0 (Textreste im Produktivcode)
**Affects:** `hooks/lib/rules-write-exemption.ts`, Abschnitt `## What the flag reaches` im
Dokumentationsblock von `isProjectRulePath`
**Cross-references:**
`260807-0931_*_plan-guard-misst-statt-orakelt.md` Schritt 6 (Textschicht),
`260805-1145_*_der-forensik-zeiger-im-ausgelieferten-regeltext-zeigt-auf-eine-datei-die-der-installer-nie-mitnimmt.md`

---

## Was falsch war

Der Abschnitt hieß `## What the flag reaches, measured` und beschrieb die Reichweite von
`FUSION_ALLOW_RULES_WRITE` in Operanden-Begriffen des abgeschafften Klassifizierers:
welche Schreibweise eines Verzeichnisnamens ihn erreicht, welche nicht, und welche
`rm`-Kommandos deshalb "denied" bleiben. Zwei Sätze waren nach dem Mechanismuswechsel
schlicht unwahr:

- „`rm -rf rules` und `rm -rf rules/` stay denied" — nichts auf der Shell-Seite verweigert
  noch etwas. Der Befehl läuft, und was danach an geschützten Pfaden verändert ist, wird
  gemessen.
- Die Klammer dazu nannte `isProtected` und den „mutation guard's FIRST pass". Beides
  gehört zu `hooks/lib/bash-mutation-guard.ts`, seit `ba7ccda` gelöscht.

Der Abschnitt stand nicht auf der Dateiliste von Schritt 6; deshalb hat ihn die Textschicht
nicht erreicht.

## Was jetzt dort steht, und woher es kommt

Die Operanden-Absätze sind ersetzt durch eine Aussage über den Mechanismus, die aus dem
Code gelesen ist: die Frage wird pro **Datei** gestellt und nie über einen
Verzeichnisknoten, weil beide Aufrufer nur Dateipfade übergeben können —
`guard.ts` CHECK 2 das Ziel des Schreibwerkzeugs, die Messung die Ausgabe von
`enumerateProtected`, das ausschließlich `entry.isFile()` aufnimmt
(`hooks/lib/protected-snapshot.ts`).

## Was offen bleibt

Die alte Fassung trug eine gemessene Grundlage („Measured on the real guard subprocess in a
throwaway project"). Die neue trägt keine. Die Folgerung, dass ein `rm -rf rules` mit
gesetztem Flag den ganzen Regelbaum gelöscht stehen lässt, ist aus dem Code **abgeleitet**
und nicht nachgemessen — sie folgt daraus, dass jede betroffene Datei einzeln als
Regelpfad beantwortet wird. Das ist plausibel und ungeprüft, und genau diese Sorte Satz hat
in diesem Circle schon einmal vier Tage lang falsch dagestanden.

Zu tun wäre: den Fall im Fremdprojekt einmal messen (Flag gesetzt und ungesetzt, `rm -rf
rules`, `rm -rf rules/retired`, `mv rules/retired /tmp/gone`), das Ergebnis in den Abschnitt
schreiben und die gemessene Grundlage wieder benennen. Solange das nicht geschehen ist,
sollte der Abschnitt nicht wieder „measured" heißen.

## Warum nicht in dieser Session behoben

Der Auftrag war auf drei benannte Textreste, eine mechanische Nachsuche nach
`fusion-workbench/`- und `circles/`-Pfaden und die drei Versionsoberflächen begrenzt, mit
ausdrücklichem „committe nicht". Eine Messreihe im Fremdprojekt unmittelbar vor der Freigabe
gehört nicht unangekündigt in denselben Diff.

---

**Reconciliation 260807-1515 (reconciler, Domain `code`) — bleibt `_o_`, zu Recht.**

Der beschriebene Zustand liegt so am Baum, geprüft gegen HEAD `e684eae`:

- Der Abschnitt in `hooks/lib/rules-write-exemption.ts` heißt nicht mehr "measured", und die
  Operanden-Absätze des Klassifizierers sind ersetzt — die Textkorrektur, die der Befund
  beschreibt, ist also erfolgt.
- Die Messung, die der Befund fordert, ist **nicht** erfolgt. Kein Protokoll unter
  `circles/260807-0923-guard-misst-statt-orakelt/history/` nennt einen Lauf mit `rm -rf rules`
  im Fremdprojekt, und `hooks/lib/__tests__/rules-write-exemption*.test.ts` prüft die Ausnahme
  über einzelne Dateipfade, nie über einen Verzeichnisknoten. Die Suite ist grün (1002 Tests),
  ohne dass irgendein Fall die offene Frage beantwortet: grün heißt hier "die geprüften Fälle
  stimmen", nicht "der Verzeichnisfall ist gemessen".
- Die Ableitung des Befunds ist am Code nachvollziehbar: `enumerateProtected` in
  `hooks/lib/protected-snapshot.ts` nimmt ausschließlich `entry.isFile()` auf, und
  `isObservedRulePath` (`hooks/lib/rules-write-exemption.ts:602`) bekommt genau diese Ausgabe.
  Sie bleibt damit **abgeleitet und ungeprüft**, wie der Befund selbst sagt.

Die Vorprüfung in Schritt 10 des Plans hat den Fall nicht abgedeckt; sie fuhr die sieben
Harness-Suiten ein zweites Mal gegen `dist`, nicht eine eigene Messreihe zur Reichweite der
Ausnahme. Der Befund überlebt den Circle unverändert.

---
Resolved: The file the record is about, hooks/lib/rules-write-exemption.ts and its "What the flag reaches" block, was deleted with the FUSION_ALLOW_RULES_WRITE exemption in 60c9cd8; the re-measurement it asks for has no subject.

Closed as part of the Turn-1 housekeeping batch of session 260815-2147-orchestrator-session.md, after a re-verification pass against HEAD confirmed the condition no longer holds.
