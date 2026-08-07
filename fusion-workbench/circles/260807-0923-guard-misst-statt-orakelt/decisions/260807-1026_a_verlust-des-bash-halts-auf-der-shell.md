# Soll der Halt weiterhin dateiverändernde Shell-Befehle blockieren, wenn der Klassifizierer fällt?

---
**Domain:** code
**Status:** answered
**Filed by:** coder (Umsetzung von Schritt 2; die Antwort gab der Nutzer am 260807-0945)
**Cross-references:**
- `circles/260807-0923-guard-misst-statt-orakelt/planning/260807-0931_o_plan-guard-misst-statt-orakelt.md` — Entscheidung 3 und Schritt 2
- `circles/260804-1205-shell-reachability-model/decisions/260807-0825_a_should-the-guard-predict-shell-writes-or-enforce-them.md` — die bindende Entscheidung, Option 3
- `hooks/guard.ts` — die Stelle, an der der Zweig stand, trägt den Verweis auf diesen Satz
- `rules/protected-path-discipline.md` §`### What a halt costs you` — die Textstelle, die den alten Zustand beschreibt und in Schritt 6 nachzuziehen ist

---

## Frage

Der Halt hatte zwei Oberflächen. Auf den vier Schreibwerkzeugen blockierte er jeden
Aufruf; auf der Shell blockierte er jeden Befehl, den der Klassifizierer als
dateiverändernd erkannte. Die zweite Hälfte fragte `mutation.mutates` — "schreibt dieser
Befehl überhaupt eine Datei?".

Das ist dieselbe Frage, für die der Klassifizierer abgeschafft wird, nur kleiner. Sie ist
aus dem Text eines Shell-Befehls ebenso wenig entscheidbar wie die größere Frage nach dem
konkreten Pfad: ein Befehl kann seinen Schreibvorgang über `eval`, einen Alias, eine
Funktion oder ein Programm hinter einer Variablen erreichen, das der Erkenner nie sieht.

Zu entscheiden war, ob ein Rest-Erkenner allein für den Halt stehen bleibt.

## Optionen

1. **Den Zweig streichen.** Ein Halt blockiert künftig die vier Schreibwerkzeuge und
   sonst nichts.
   - Pro: Der Klassifizierer verschwindet vollständig. Kein Setzling bleibt stehen, aus
     dem das Orakel nachwächst, sobald jemand einen Befehl bemerkt, den der Rest-Erkenner
     nicht erkennt.
   - Contra: Unter einem Halt läuft `rm notes.txt` künftig durch. Der Halt verliert die
     Oberfläche, auf der ein Agent mit Shell-Zugang ohnehin am ehesten weiterarbeitet.
2. **Einen Rest-Erkenner nur für den Halt behalten.**
   - Pro: Der Halt bleibt auf beiden Oberflächen wirksam.
   - Contra: Er beantwortet weiter eine unentscheidbare Frage, trägt deren Fehlalarme und
     deren Pflegeaufwand, und jede Lücke in ihm ist wieder ein Anlass, ihn zu erweitern.

## Randbedingungen

- Die geschützten Pfade selbst hängen nicht am Halt. Sie werden nach jedem Werkzeugaufruf
  gemessen und wiederhergestellt, ob ein Halt aktiv ist oder nicht. Der Verlust betrifft
  ausschließlich Dateien, die *nicht* geschützt sind.
- Der Halt bleibt ein echter Stopp auf den vier Schreibwerkzeugen.
- Lesende Befehle liefen auch bisher unter einem Halt weiter; daran ändert sich nichts.

## Was verloren geht, ausdrücklich benannt

Unter einem Halt sind `rm notes.txt`, `echo hi > out.txt`, `sed -i` und jede andere
Veränderung einer ungeschützten Datei künftig erlaubt. Der Halt sagt damit nicht mehr
"dieser Agent schreibt nichts mehr", sondern "dieser Agent benutzt kein Schreibwerkzeug
mehr und kann keine geschützte Datei dauerhaft verändern".

---
Answered: Der Nutzer hat den Verlust am 260807-0945 bei der Planfreigabe ausdrücklich
bestätigt, in Kenntnis der Folge (Plankopf, Zeile `**Status:**`, und Entscheidung 3 des
Plans). Gewählt ist Option 1. Umgesetzt in Schritt 2: der `mutation.mutates`-Zweig in
`hooks/guard.ts` ist entfernt und durch eine Notiz an derselben Stelle ersetzt; zwei
Testfälle in `hooks/lib/__tests__/protected-snapshot-integration.test.ts` halten beide
Hälften fest (Shell-Mutation läuft unter Halt durch, Schreibwerkzeug bleibt blockiert).
Implemented:
Deferred:
Superseded by:
