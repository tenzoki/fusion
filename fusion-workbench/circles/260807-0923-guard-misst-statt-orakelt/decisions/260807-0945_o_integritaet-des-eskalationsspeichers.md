# Wie wird die Integrität des Eskalationsspeichers gesichert, nachdem `.guard-state/` von der Schutzliste gefallen ist?

---
**Domain:** code
**Status:** open
**Filed by:** ontocoder
**Cross-references:** `fusion-workbench/circles/260807-0923-guard-misst-statt-orakelt/planning/260807-0931_o_plan-guard-misst-statt-orakelt.md` (Entscheidung 1, Schritt 1, offene Frage 2); `fusion-workbench/circles/260804-1205-shell-reachability-model/decisions/260807-0825_a_should-the-guard-predict-shell-writes-or-enforce-them.md` (die bindende Entscheidung, die den Umbau auslöst); `hooks/config.json`, `hooks/config.example.json` (die geänderte Schutzliste); `hooks/lib/escalation.ts` (der Speicher); `hooks/guard.ts` (Leser und Schreiber des Halts)

---

## Question

Der Guard hält einen Agenten an, wenn dieser mehrfach hintereinander blockiert wurde. Der Zustand dieses Halts liegt in einer einzigen Datei: `fusion-workbench/.guard-state/escalation.json`. Sie trägt zwei Felder, `consecutiveBlocks` (der Zähler) und `haltActive` (der Halt selbst); gelesen und geschrieben wird sie in `hooks/lib/escalation.ts` (`loadEscalation`, `saveEscalation`, `recordBlock`, `clearHalt`). Fehlt die Datei, beginnt der Zustand bei null und ohne Halt — Löschen ist also gleichbedeutend mit Halt aufheben.

Bis zum 260807 war das Verzeichnis durch den Eintrag `"fusion-workbench/.guard-state/**"` in `guard.protectedPaths` gedeckt: ein Agent, der die Datei löschen oder überschreiben wollte, wurde abgelehnt. Der Eintrag ist mit diesem Datum aus `hooks/config.json` und `hooks/config.example.json` entfernt worden, und zwar aus einem Grund, der mit der Halt-Integrität nichts zu tun hat: der Guard sagt künftig nicht mehr vorher, welche Dateien ein Shell-Befehl schreiben wird, sondern misst nach dem Werkzeugaufruf, welche geschützte Datei sich verändert hat, und rollt sie zurück. Diese Messung schreibt ihren eigenen Fingerabdruck, ihre Ereignisse und eben diesen Eskalationszähler nach `.guard-state/`. Bliebe das Verzeichnis geschützt, meldete jeder einzelne Werkzeugaufruf seine eigene Buchführung als Verletzung. Dazu kommt, dass die Workbench in einem Konsumprojekt ein Laufzeit-Artefakt und in der Regel nicht versioniert ist — das Zurückrollen per `git checkout HEAD -- <pfad>` hätte dort ohnehin keinen Gegenstand.

Damit steht offen: ein Agent kann `fusion-workbench/.guard-state/escalation.json` löschen und seinen eigenen Halt aufheben. Der Nutzer hat diesen Verzicht am 260807-0945 ausdrücklich bestätigt, in Kenntnis genau dieser Folge, und den Umbau davon nicht abhängig gemacht. Die Frage bleibt trotzdem zu beantworten, nur nicht in diesem Circle: der Halt ist die letzte Stufe des Guards, und eine letzte Stufe, die ihr eigener Adressat abräumen kann, trägt nur so weit, wie der Adressat nicht auf die Idee kommt.

Die Frage lautet daher nicht "soll `.guard-state/` zurück auf die Schutzliste" — dieser Weg ist durch den Selbstbezug der Messung versperrt — sondern: **woran erkennt der Guard, dass der Eskalationszustand, den er liest, derselbe ist, den er zuletzt geschrieben hat?**

## Options

1. **Den Eskalationszustand außerhalb des beschreibbaren Bereichs ablegen.** Der Halt zieht aus der Projekt-Workbench heraus, etwa in ein Verzeichnis unter dem Benutzerprofil, das der Agent im Rahmen seiner Arbeit nicht anfasst, mit dem Projektpfad als Schlüssel.
   - Pro: Der Zustand liegt nicht mehr dort, wo der Agent ohnehin schreibt; die Trennung ist strukturell und braucht keine Prüfung zur Laufzeit.
   - Contra: Zwei Zustandsorte statt einem — die Ereignisse und der Fingerabdruck blieben in der Workbench, der Halt nicht mehr, und der Monitor liest heute alles an einer Stelle. Verschiebt das Problem außerdem nur so weit, wie der Agent auf jenes Verzeichnis keinen Zugriff hat; ein Agent mit Shell hat ihn.

2. **Den Zustand signieren und beim Lesen prüfen.** `saveEscalation` legt neben Zähler und Halt einen Prüfwert ab, der aus dem Inhalt und einem Geheimnis gebildet wird, das nicht in der Workbench liegt. `loadEscalation` verwirft einen Zustand, dessen Prüfwert nicht passt, und behandelt ihn nicht als "kein Halt", sondern als Manipulation.
   - Pro: Der Zustand bleibt, wo er ist; ein verfälschter oder gelöschter Zustand wird als solcher erkannt statt still auf null zurückzufallen.
   - Contra: Braucht ein Geheimnis mit einem eigenen Lebenszyklus, und die Frage, wo es liegt, ist dieselbe Frage wie in Option 1, nur kleiner. Löschen bleibt zudem von Verfälschen zu unterscheiden: eine fehlende Datei kann legitim sein (frisches Projekt) — ohne eine zweite Spur ist "gelöscht" nicht von "noch nie geschrieben" trennbar.

3. **Den Halt nicht aus einer Datei rekonstruieren, sondern aus dem Ereignisstrom.** Der Halt ergibt sich beim Lesen aus `fusion-workbench/.guard-state/events.jsonl` (der nur angehängt wird), statt aus einem eigenen Zähler-Dokument.
   - Pro: Kein zweiter Speicherort, kein Geheimnis; ein Zurücksetzen erfordert das Kürzen einer Anhänge-Datei und ist im Ereignisstrom selbst als Lücke sichtbar.
   - Contra: Löst die Frage nicht, sondern verlagert sie auf eine Datei am selben Ort mit denselben Rechten. Kostet außerdem Lesezeit bei jedem Werkzeugaufruf.

4. **Den Verzicht als dauerhaft annehmen und ausdrücklich dokumentieren.** Der Halt bleibt aufhebbar; die Textschicht sagt das offen, und die Durchsetzung liegt beim Menschen, der die Ereignisse liest.
   - Pro: Kein Mechanismus, keine Kosten, und ehrlich gegenüber dem, was heute gilt.
   - Contra: Die Eskalation verliert ihre Verbindlichkeit gegenüber genau dem Adressaten, für den sie gebaut wurde.

## Constraints

- Jede Antwort muss ohne Rückgriff auf `guard.protectedPaths` für `.guard-state/` auskommen: die Messung schreibt dorthin bei jedem Werkzeugaufruf, ein Schutz des Verzeichnisses meldete sie als Verletzung gegen sich selbst.
- Sie darf nicht voraussetzen, dass die Workbench versioniert ist. In einem Konsumprojekt ist sie ein Laufzeit-Artefakt, `git checkout HEAD --` trägt dort nicht.
- Sie muss ein frisches Projekt ohne jeden Eskalationszustand als normalen Fall behandeln und nicht als Manipulation.
- Sie darf den Guard nicht fehlschlagen lassen, wenn der Zustand unlesbar ist. Der heutige Umgang mit einer defekten Datei (Rückfall auf einen wohlgeformten Vorgabewert, siehe `hooks/lib/escalation.ts`) ist der Bezugspunkt, gegen den eine strengere Behandlung zu begründen wäre.
- Der Monitor liest `.guard-state/` heute an einem festen, wurzel-relativen Pfad. Ein Umzug des Zustands ist ein Eingriff in diesen Vertrag und nicht folgenlos.

## Recommendation

Keine. Die vier Optionen sind hier gesammelt, nicht gewogen: eine belastbare Empfehlung setzte voraus, das Bedrohungsmodell zu klären, das dieser Circle nicht geklärt hat — nämlich ob der Halt gegen einen Agenten wirken soll, der die Umgehung nicht sucht, oder gegen einen, der sie sucht. Gegen den ersten trägt schon die heutige Lage; gegen den zweiten trägt keine der vier Optionen vollständig, solange der Agent eine Shell hat. Wer diese Frage aufnimmt, beantwortet zuerst diese.

---
Answered:
Implemented:
Deferred:
Superseded by:
