Die Warteschlange ist wieder veraltet, weil aus dem Vorgängerbefund nur die Neuerzeugung gebaut wurde und nicht die Vorbeugung

---

**Severity:** Medium
**Domain:** code
**Filed by:** reconciler, Abschluss-Pass zu `circles/260807-0923-guard-misst-statt-orakelt`, 260807-1515
**Affects:** `agents/orchestrator.md` (Phase 4), `skills/setup/SKILL.md`, `skills/next/SKILL.md`
**Cross-references:**
`shared/issues/260801-2038_c_tasklist-holds-a-fully-closed-queue-from-a-circle-closed-two-weeks-ago.md` (der Vorgängerbefund, dessen Abschlussnotiz genau diesen Befund angefordert hat),
`shared/issues/260801-2038_o_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md` (dieselbe Klasse: Schreibvorgänge am Turn- und Circle-Rand, die eine Sitzung überspringen kann, ohne dass etwas bricht)

---

## Der Zustand

`fusion-workbench/tasklist.md` trägt im Kopf, gemessen am 260807-1515:

```
**Generated:** 2026-08-07 00:02
**Active Circle:** `circles/260804-1205-shell-reachability-model` (`_t_`)
**Source plan:**   `circles/260804-1205-shell-reachability-model/planning/260806-2353_*_plan-shell-reachability-model.md`
**Open tasks:** 44 (11 in the active Circle, 33 unaffiliated backlog)
```

Der genannte Circle trägt seit 260807-0923 den Marker `_s_` (abgelöst). `.active-circle` zeigt
auf `260807-0923-guard-misst-statt-orakelt`. Der genannte Plan gehört zu dem abgelösten Circle
und ist mit dem Mechanismuswechsel gegenstandslos geworden: seine Schritte 3 bis 11 bauen den
Klassifizierer aus, den `ba7ccda` gelöscht hat.

Die elf Einträge des Abschnitts A beschreiben damit Arbeit, die nicht nur unerledigt, sondern
**nicht mehr zu tun** ist. Mehrere Agenten haben die Datei im Lauf der Sitzung als veraltet
gemeldet; keiner konnte sie anfassen, weil `tasklist.md` allein dem taskplanner gehört.

## Warum das ein eigener Befund ist und keine Wiederholung

Der Vorgängerbefund `260801-2038_c_*` beschrieb denselben Zustand und ist am 260807-00:02
geschlossen worden — durch eine Neuerzeugung. Seine Abschlussnotiz sagt wörtlich, was dabei
nicht mitkam:

> **The preventive half is not carried by this closure.** Whoever wants it should file it as its
> own item against the orchestrator's Phase 4 and the two skills; it is a change to three
> prompts, not to the queue.

Genau das ist hiermit getan. Der Vorgänger ist zu Recht `_c_`: sein Gegenstand, die damals
konkret veraltete Datei, war beseitigt. Dass sie **sieben Stunden später** wieder veraltet war,
ist die Bestätigung seiner Diagnose und nicht deren Widerlegung.

## Warum die Neuerzeugung allein nicht trägt, gemessen an diesem Fall

Der Vorgänger nannte als Ursache, dass ein taskplanner-Lauf bei `_a_ → _t_` heute freiwillig
ist. Dieser Fall zeigt einen zweiten Weg in denselben Zustand, den der Vorgänger nicht kannte:

**Die Warteschlange kann veralten, ohne dass ein Circle schließt.** Hier wurde der aktive Circle
mitten in der Sitzung *abgelöst* (`_t_ → _s_`), nicht abgeschlossen. Option 2 des Vorgängers
("der Orchestrator löscht `tasklist.md` bei `_t_ → _c_/_b_`") hätte hier nicht gegriffen, weil
`_s_` in ihrer Aufzählung nicht vorkommt. Eine Vorbeugung, die nur am Abschluss hängt, hat für
den Ablösungsfall kein Ereignis.

## Was zu tun wäre

Die drei Optionen des Vorgängers, mit dem hier gemessenen Zusatz:

1. **Neuerzeugung verbindlich machen** bei jedem Wechsel des aktiven Circles — nicht nur bei
   `_a_ → _t_`, sondern auch bei einer Ablösung, die einen neuen Circle aktiv setzt.
2. **Löschen am Rand.** Der Orchestrator entfernt `tasklist.md`, wenn `.active-circle` gelöscht
   oder umgeschrieben wird. Die Kopplung an `.active-circle` statt an eine Marker-Liste deckt
   alle Übergänge ab, auch die, an die beim Schreiben der Regel niemand gedacht hat — genau die
   Lücke, die dieser Fall aufgedeckt hat.
3. **Stempeln und warnen.** `/fusion:setup` und `/fusion:next` vergleichen `**Generated:**` und
   `**Active Circle:**` gegen `.active-circle` und warnen bei Abweichung. Erkennt statt zu
   verhindern, kostet aber fast nichts und wirkt auch dann, wenn 1 und 2 einmal übersprungen
   werden.

Option 2 in der `.active-circle`-Fassung ist die billigste vollständige, weil sie an einer
Bedingung hängt statt an einer Ereignisliste. 1 und 3 ergänzen sie, sie konkurrieren nicht.

## Warum im geteilten Speicher

Aufgefallen beim Abschluss von `circles/260807-0923-guard-misst-statt-orakelt`, verursacht von
dessen Directive nicht: der Mangel ist eine Eigenschaft davon, wie der Orchestrator und die
beiden Skills eine Warteschlange am Circle-Rand behandeln, nicht der Guard-Arbeit, neben der er
gefunden wurde. Herkunftsregel, wie schon bei beiden `260801-2038`-Befunden.

---

## Abschlussnotiz — 260810-0431, coder, Aufgabe T7

Gebaut wurde der Abschnitt `### The queue's ground` in `agents/orchestrator.md` (Phase 4).
Er ist die einzige Definition; `/fusion:setup` Schritt 3 und `/fusion:next` Schritt 5 zitieren
ihn, statt die Verzweigungen ein zweites Mal hinzuschreiben. Keine dritte Neuerzeugung.

**Option 2, in abgewandelter Form.** Die Warteschlange wird beim Löschen des Zeigers in
Phase 4 Schritt 4 zurückgezogen, im selben Befehl wie das `rm -f` — das Löschen des Zeigers
ist das, was einen Abschluss zum Abschluss macht, also der eine Schritt dort, den eine
Sitzung nicht überspringen kann und trotzdem einen geschlossenen Circle hinterlässt. Zwei
Abweichungen von der empfohlenen Fassung, beide gemessen statt vermutet:

1. **Verschoben, nicht gelöscht** (`mv`, nie `rm`). Seit `65f7c3b` ist `tasklist.md` in einem
   versionierten Workbench nachverfolgt, mit der Begründung, sie sei geschriebener Text mit
   Begründung und Abnahmekriterien. Die Einträge sind aus den Datensätzen neu ableitbar, die
   Prosa nicht. Sie landet im `planning/`-Speicher des schließenden Circles (Herkunftsregel).
2. **Nur, wenn ihr eigener Kopf den schließenden Circle nennt.** Ein pauschales Löschen an
   der Circle-Grenze hätte die Warteschlange vom 260810 vernichtet: 34 Einträge, alle aus
   `shared/issues/`, keiner an einen Circle gebunden, vollständig gültig. Option 2 wörtlich
   angewandt wäre an genau diesem Fall ein Datenverlust gewesen.

**Option 3, vollständig**, an beiden Leseflächen: eine Vier-Zeilen-Tabelle, eine Zeile je
Kombination aus "nennt der Kopf einen Circle" und "zeigt `.active-circle` auf einen". Gegen
die Warteschlange vom 260807 (die gemessene) und die vom 260810 geprüft, mit vier
Zeigerzuständen: der 260807-Fall wird in beiden Ausprägungen als veraltet gemeldet, der
260810-Fall als unaffiliierter Rückstand, also gültig.

**Option 1 wurde nicht gebaut**, absichtlich: verbindliche Neuerzeugung ist die Antwort, die
dieser Befund als bereits zweimal versucht beschreibt.

**Was nicht getragen wird.** Die genaue Hälfte — Zeilen 1 und 2 der Tabelle und das
Zurückziehen — greift nur bei einer Warteschlange, deren Kopf `**Active Circle:**` führt.
`agents/taskplanner.md` Schritt 4 schreibt dieses Feld nicht vor: der 260807-Lauf hat es aus
eigenem Antrieb gesetzt, der 260810-Lauf nicht, und beide waren gegenüber dem Prompt korrekt.
Für welchen Circle eine Warteschlange *gebaut* wurde, ist aus ihrem Text nicht entscheidbar,
wenn sie es nicht selbst festgehalten hat (`rules/critical-stance.md` §4). Das ist eine Zeile
in einem Erzeuger, der außerhalb der Dateiliste dieser Aufgabe lag, und liegt als eigener
Befund vor: `260810-0431_o_the-work-queue-does-not-record-the-ground-it-was-built-on.md`.
Bis der landet, tragen die Zeilen 3 und 4 den kopflosen Fall mit dem schwächeren
Zeitstempelvergleich, und der Abschnitt sagt das selbst, statt sich als Deckung zu lesen.

**Was das ist, ehrlich.** Konvention, keine Erzwingung. Nichts führt die beiden Tabellen aus;
es ist Prompt-Text. Erzwungen wird nur, dass der Text vorhanden und an die Akte gebunden
bleibt, die ihn tragen — `hooks/lib/__tests__/queue-ground-lint.test.ts`, neun Prüfungen,
darunter drei Gegenproben gegen die Vorzustände. Das Zurückziehen ist Vorbeugung in der
Wirkung, aber nur, sofern der Schritt überhaupt läuft.

Prüflauf: `cd hooks && npm test` — 961 von 962 grün. Der eine Fehlschlag ist
`rules-emission-golden`, dessen Fixtur nach `65f7c3b` bewusst am Sitzungsende neu erzeugt
wird; keine Regel-Datei wurde hier angefasst.
