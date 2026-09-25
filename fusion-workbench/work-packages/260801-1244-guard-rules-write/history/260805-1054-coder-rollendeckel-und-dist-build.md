# Session: Rollendeckel und dist-Build (Aufgaben A5a und A5)

**Status:** Complete
**Agent:** coder
**Circle:** `260801-1244-guard-rules-write`
**Plan:** `260804-2356_*_plan-ausstieg-kontextsteuer-und-auslieferung.md` → Schritt 5
(A5) sowie eine Nacharbeit an Schritt 1 (A5a)
**Commits:** `f41c1f6` (A5a, 2026-08-05 10:53), `199ef22` (A5, 2026-08-05 10:54)

> **Nachgetragen am 2026-08-05 von `coder` im Dispatch zu Schritt 6.** Der ausführende
> Vorgänger konnte dieses Protokoll nicht mehr schreiben: der Guard hatte sich zu diesem
> Zeitpunkt gesperrt (Halt), und die Session endete vor dem Eintrag. Die Arbeit selbst ist
> vollständig committet — die beiden Commits oben sind unberührt.
>
> **Was diese Datei ist und was nicht.** Sie ist aus den zwei Commit-Nachrichten und aus
> dem Zustand rekonstruiert, den der Code heute zeigt. Die dort behaupteten Messungen sind
> **nicht** neu ausgeführt worden, mit einer Ausnahme: die sechzehn Emissionszahlen sind im
> Schritt-6-Dispatch gegen einen simulierten Installationspfad nachgemessen worden und
> stimmen. Alles andere ist referiert, nicht verifiziert, und als solches gekennzeichnet.

---

## Ergebnis in drei Sätzen

`A5a` ersetzt den einen fleet-weiten Deckel durch **sechs Rollendeckel**, wobei die Rolle
aus der Messung abgeleitet und nirgends als Agentenname hingeschrieben wird. `A5` baut
`hooks/dist` aus leerem Verzeichnis neu und checkt es ein — der eingecheckte Stand lag seit
dem 1. August hinter der Quelle, und der Unterschied war Verhalten, nicht Formatierung.
Zusammen stellen die beiden das Gate scharf, das Schritt 6 prüft: Text und Hook stimmen
wieder überein, und der Deckel misst, was ein Agent wirklich trägt.

---

## A5a — der Deckel misst pro Rolle (`f41c1f6`)

**Dateien:** `hooks/lib/__tests__/rules-emission-golden.test.ts` (+310/−48),
`hooks/lib/__tests__/fixtures/rules-emission.golden` (nur Kopfkommentar)

### Das Problem

Eine Zahl für alle sechzehn Agenten war nach dem Zuschnitt die falsche Messlatte.
`origin/main` gibt allen dieselbe undifferenzierte Last; nach den Schritten 2, 4 und 4a
trägt jeder das, was er anwendet. Ein einziger Höchststand hätte ab jetzt dreizehn Agenten
an der Last der drei teuersten gemessen.

### Wie die Rolle abgeleitet wird

Der Test bildet den **Durchschnitt aller sechzehn Dateimengen** als universellen Kern und
nimmt die sortierte Restmenge als Rollenschlüssel. Kein Agentenname steht als Schlüssel im
Quelltext; die Mitgliedschaft wird gemessen und in den Fehlermeldungen ausgedruckt. Die
Absicht ist benannt: die Zuordnung soll beim nächsten Zuschnitt nicht auseinanderdriften,
und genau das war die Fehlerklasse dieses Circles.

Sechs Rollen, Stand 2026-08-05 (im Schritt-6-Dispatch nachgemessen, siehe unten):

| Byte | Rolle (Zusatzdateien über dem Kern) | Agenten |
|---|---|---|
| 89 913 | — (nur Kern) | 5 |
| 95 586 | `design-diagrams.md` | 5 |
| 99 215 | `circle-records.md` | 1 (`playmaker`) |
| 104 888 | `circle-records.md + design-diagrams.md` | 1 (`shaper`) |
| 108 465 | `circle-records.md + workbench-stash-and-lock.md` | 1 (`orchestrator`) |
| 111 810 | `protected-path-internals.md` | 3 (`coder`, `coderev`, `bugfixer`) |

### Die Begründungspflicht, mechanisch erzwungen

Jeder Deckel über dem alten Release-Wert von 105 354 trägt seine Begründung neben sich, und
das ist kein Vorsatz, sondern eine Zusicherung: ein Eintrag ohne `overRelease` lässt den
Test fallen, und der Begründungstext **muss jede Zusatzdatei der Rolle beim Dateinamen
nennen** (`key.split(" + ")` gegen `reason.includes(...)`). Ein späterer Schnitt macht die
Begründung damit sichtbar falsch statt still veraltet.

Zwei Rollen liegen darüber, beide mit Begründung im Quelltext: der `orchestrator` bei
108 465, weil er Stash-Shard und Circle-Records trägt; `coder`, `coderev` und `bugfixer` bei
111 810, weil sie als einzige die Klassifizierer-Referenz anwenden.

### Fünf Falsifikationen

Auf einer Wegwerfkopie ausgeführt, jede trifft laut Commit-Nachricht ihre Zusicherung:
Eintrag entfernt, Deckel gesenkt, Begründung geleert, Begründung ohne Dateinamen, verwaister
Eintrag. **Referiert, nicht nachgeprüft.**

Die Golden-Fixture hat sich nur im Kopfkommentar bewegt, kein gemessener Block — ein
unabhängiger Beleg dafür, dass die Rollenarbeit keine Emission verschoben hat. **Das ist am
Diff `f41c1f6` überprüfbar und wurde beim Nachtragen am Commit-Stat bestätigt** (4 geänderte
Zeilen in der Fixture).

Tests: 1 545 → 1 547.

---

## A5 — `hooks/dist` aus leerem Verzeichnis (`199ef22`)

**Dateien:** 19 Dateien unter `hooks/dist/` (+4 069/−325), davon 4 neu

### Das war kein Aufräumen

Der eingecheckte Stand lag seit dem 1. August hinter der Quelle. Gemessen statt abgeleitet,
laut Commit-Nachricht:

- die eingecheckte Fassung **erlaubte** `git --work-tree=rules clean -fdx`, der frische
  Build verweigert es;
- ihr fehlte die Projektkonfiguration `fusion-guard.json` vollständig;
- ihr fehlte das `rules-write`-Exemption-Modul vollständig;
- ihr fehlte die Halt-Prüfung auf der Bash-Fläche — unter aktivem Halt gab sie die
  gewöhnliche Protected-Path-Meldung zurück statt des Halts.

Damit war der ausgelieferte Hook vier Tage lang schwächer als der Regeltext, der ihn
beschreibt. Ohne diesen Build wäre die Auslieferung eine ausgelieferte Falschaussage über
das Schutzniveau gewesen — und der Regeltext war in Schritt 3 gerade erst korrigiert worden.

### Vier Module, die nie eingecheckt waren

`lib/project-relative.{js,d.ts}` und `lib/fs-locator.{js,d.ts}` erscheinen im Diff gegen
`origin/main` als **A**, nicht als **M**. Für den Installer ist das der schwerwiegende Teil:
`install.sh` kopiert `hooks` als ganzes Verzeichnis, liefert also aus, was eingecheckt ist —
ein unvollständiges `dist` wäre ein Hook, der beim Start an einem fehlenden relativen Import
scheitert.

### Beide Falsifikate des Schritts

Referiert aus der Commit-Nachricht: der saubere Build wich von den eingecheckten Dateien ab,
der Index war also nicht reproduzierbar. Und `dist` ist ohne `node_modules` lauffähig — alle
Importspezifizierer relativ oder `node:`-Builtins, jedes relative Ziel innerhalb von `dist`
vorhanden.

**Beim Nachtragen unabhängig nachgemessen:** über alle 36 eingecheckten `dist`-Dateien
findet sich kein einziger Importspezifizierer, der nicht mit `.` beginnt oder `node:` ist.
Die Commit-Nachricht spricht von 37 geprüften Dateien, auf der Platte und im Index stehen
36 — die Differenz ist nicht aufgeklärt und für die Aussage ohne Belang.

---

## Was beim Nachtragen zusätzlich gemessen wurde

Gegen einen simulierten Installationspfad (dieselbe Kopierliste wie `install.sh`, in ein
Wegwerfverzeichnis, `FUSION_PLUGIN_ROOT` darauf gerichtet):

- Die sechzehn Emissionszahlen stimmen **exakt** mit der Tabelle oben überein. Der Zuschnitt
  kommt im Installationspfad an — das ist die Hälfte des Schritt-6-Falsifikats, die vor dem
  Push prüfbar ist.
- `rules/` erreicht den Installationspfad mit allen 15 Dateien, `hooks/dist` mit allen 36.
- Index und Arbeitsverzeichnis stimmen für `hooks/dist` überein: 36 verfolgte Dateien,
  36 auf der Platte, keine unverfolgte und keine fehlende.

---

## Offen geblieben

Nichts aus A5a oder A5. Der Deckel-Test selbst schlägt seit dem Versionssprung auf `5.9.0`
im Schritt-6-Dispatch fehl — das ist sein Zweck und keine Regression dieser beiden
Aufgaben; er ist bei `5.8.0` grün. Die Einordnung steht im Protokoll zu Schritt 6.
