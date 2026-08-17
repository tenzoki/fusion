# Wie wird die Integrität des Eskalationsspeichers gesichert, nachdem `.guard-state/` von der Schutzliste gefallen ist?

---
**Domain:** code
**Status:** superseded
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

**Reconciliation 260807-1515 (reconciler, Domain `code`) — bleibt `_o_`, zu Recht.**

Am Baum nachgeprüft gegen HEAD `e684eae`, statt der Aktenlage geglaubt:

- Der Eintrag `fusion-workbench/.guard-state/**` steht nicht mehr in `guard.protectedPaths`. Er
  kommt in `hooks/config.json` nur noch im Feld `_comment` vor, als Beschreibung des
  Laufzeit-Zustands. Die Voraussetzung des Befunds gilt also weiter.
- `hooks/lib/escalation.ts` ist unverändert der einzige Leser und Schreiber von
  `escalation.json`, und ein fehlender Zustand liest sich weiter als "kein Halt". Keine der
  vier Optionen ist gebaut worden.
- Der Verzicht ist zusätzlich größer geworden, seit dieser Satz abgelegt wurde: seit `ba7ccda`
  blockiert ein Halt die Shell überhaupt nicht mehr (Satz
  `circles/260807-0923-guard-misst-statt-orakelt/decisions/260807-1026_*_verlust-des-bash-halts-auf-der-shell.md`,
  seit dieser Reconciliation `_i_`). Ein Agent, der `escalation.json` löschen will, braucht dafür
  also nicht einmal mehr an einem Schreibwerkzeug vorbei. Das ändert keine der vier Optionen,
  aber es verschiebt das Bedrohungsmodell, das die `## Recommendation` als erste zu klärende
  Frage benennt.

Durchsucht nach einer Antwort, ohne Fund: `circles/260807-0923-guard-misst-statt-orakelt/analyses/`
(leer), `circles/260807-0923-guard-misst-statt-orakelt/planning/` (der Plan legt die Frage
ausdrücklich ab, statt sie zu beantworten), `shared/decisions/` und `shared/analyses/`.

Answered:
Implemented:
Deferred:
Superseded by:

---
Answered: user, session 260811-0752 (chat) — **the threat model is settled first, and it decides
the rest: the halt acts against an agent that is not looking for a way around it.**

That answers the record's own precondition. Against an agent that slips — repeated blocks, a task
it cannot complete cleanly, a loop it does not notice — today's arrangement already holds: the halt
raises, the write tools stop, and the agent is told to report to a human. Against an agent that
actively seeks the bypass, the record states plainly that none of the four options holds while the
agent has a shell, so building one would buy the appearance of a guarantee rather than the
guarantee.

**Chosen: option 4.** The exposure is accepted as permanent and written down rather than mitigated.
The halt stays clearable, `.guard-state/` stays off the protected list (the measurement's
self-reference is what closed that route, and that has not changed), and enforcement rests with the
human who reads the events. Options 1, 2 and 3 — relocating the state outside the writable area,
signing it, or reconstructing the halt from the append-only event stream — are not taken and are
not left implied as future work.

To realise: the text layer says openly that an agent can clear its own halt, at the site where the
halt is explained to agents (`rules/protected-path-discipline.md` `### What a halt costs you`) and
in `README-hooks.md` where it is explained to users. It must read as a stated boundary of the
mechanism, not as an oversight, because that is what it now is.

This also removes the last argument for putting `.guard-state/` back on the protected list, and it
should be cited by anything that proposes it again.

---
Superseded by: `shared/decisions/260812-1232_*_does-the-escalation-counter-survive-a-block-source-that-ships-inert.md` — the escalation store whose integrity this record asks about no longer exists, so the answer recorded here can never be realised. That record was answered option 3 by the user on 2026-08-16 and implemented in `9c79202` (plan steps P-3 and P-6): `hooks/lib/escalation.ts` with the counter and the halt, and `hooks/clear-halt.ts`, are deleted, and `guard_block`, `guard_halt` and `halt_cleared` left `GuardEventType`. There is no `fusion-workbench/.guard-state/escalation.json` for a guard to read, write or distrust.

Option 4, chosen here, obliged the text layer to state openly that an agent can clear its own halt, at two named sites. Neither survives: `rules/protected-path-discipline.md` `### What a halt costs you` was deleted with the always-on rule on 2026-08-12 (`fa2f00b`), and `README-hooks.md`'s halt sections went in `1fb3f32` (P-11). The record's closing sentence — that this removes the last argument for putting `.guard-state/` back on the protected list — is moot from the other side as well: the protected list itself was removed on 2026-08-12 in `60c9cd8`.

`Superseded by:` rather than an unrealisable-answer annotation, because a later decision genuinely overrides this one: the successor asks what happens to the escalation apparatus and answers it. The neighbouring class, an `_a_` record whose answer is unrealisable with no successor, is open at `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/decisions/260815-2056_*_what-marks-an-answered-decision-whose-answer-can-no-longer-be-realised.md` and this record is not one of its instances.
