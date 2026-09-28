# Textreste im Produktivcode und die drei Versionsoberflächen auf 6.0.0

**Agent:** coder
**Circle:** `260807-0923-guard-misst-statt-orakelt`
**Auftrag:** Freigabe-Vorbereitung, zwei Teile, ohne Commit und ohne Push
**Status:** Complete

---

## Teil 1 — sieben Textstellen, nicht drei

Drei waren benannt. Die mechanische Nachsuche fand vier weitere derselben Klasse, alle in
ausgeliefertem `hooks/`-Code, alle reine Kommentarprosa ohne Importkante.

| Datei | Was dort stand | Was jetzt dort steht |
|---|---|---|
| `hooks/lib/rules-write-exemption.ts` (benannt) | „the conventions of `isProtected` in `bash-mutation-guard.ts` and of `matchesAnyFolded`" | Beide Konventionen mit ihren lebenden Trägern: `matchesAnyFolded` in `paths.ts` faltet die Groß-/Kleinschreibung, `shouldDescend` in `protected-snapshot.ts` wiederholt den abschließenden Trenner |
| `hooks/lib/protected-snapshot.ts:20` (benannt) | `circles/260804-1205-…/260807-0825_*_….md`, „option 3" | Der Inhalt der Entscheidung: vom Nutzer am 2026-08-07 aus vier Optionen gewählt, nachträglich feststellen statt vorherzusagen |
| `hooks/guard.ts:35` (benannt) | derselbe Entscheidungspfad, über zwei Zeilen umgebrochen | „Decided by the user on 2026-08-07: detect afterwards instead of predicting." |
| `hooks/guard.ts:325` | `circles/260807-0923-…/260807-1026_*_verlust-des-bash-halts-….md` | Der Inhalt: der Nutzer nahm den Verlust des Bash-Halts als Preis für den Wegfall des Klassifizierers ausdrücklich an |
| `hooks/lib/protected-snapshot.ts:37` | „Closed by this: `circles/…/260807-1026_*_rueckrollen-auf-head-….md`" | Ein Halbsatz im Absatz selbst: der `HEAD`-Rückroller wurde während der Entstehung als Befund erfasst und durch das Mitführen des Inhalts geschlossen |
| `hooks/lib/paths.ts:74` | `circles/260801-1244-…/260804-1632_*_should-findrelevantdecisions-fold-case….md` | Ersatzlos gestrichen. Der Absatz nennt die Vertagung, ihr Datum und ihre Bedingung bereits vollständig; der Pfad trug nichts hinzu |
| `hooks/lib/paths.ts:121` | „The user's decision, recorded at `circles/…/260803-1419_*_….md`" | Der Inhalt: am 2026-08-03 entschieden, dass die Prüfung auf jeder Plattform faltet, nicht nur wo das Dateisystem es tut |
| `hooks/lib/config.ts:103` | „Decided by the user at the plan gate — see `circles/…/260802-1912_*_….md`" | Der Inhalt: am 2026-08-02 am Plan-Gate entschieden, dass der Selbstschutz erst greift, sobald die Konfigurationsdatei existiert |

### Ein achter Fund, andere Gattung

`rules-write-exemption.ts` nannte `isProtected` ein zweites Mal, im Abschnitt
`## What the flag reaches, measured` — und dort war nicht nur der Name tot, sondern die
Aussage falsch: „`rm -rf rules` und `rm -rf rules/` stay denied". Nichts verweigert das
noch. Die Operanden-Absätze sind durch eine Aussage über den Mechanismus ersetzt, die aus
dem Code gelesen ist (die Frage wird pro Datei gestellt, nie über einen Verzeichnisknoten,
weil `enumerateProtected` nur `entry.isFile()` aufnimmt und CHECK 2 das Ziel eines
Schreibwerkzeugs bekommt). Der Abschnitt heißt nicht mehr „measured", weil er es nicht mehr
ist. Befund dazu:
`260807-1427_*_reichweite-der-regel-ausnahme-ist-nach-dem-mechanismuswechsel-nicht-neu-gemessen.md`.

### Die mechanische Nachprüfung

`grep -rn --include='*.ts' -E 'fusion-workbench/|circles/' hooks/` ohne Tests und ohne
`dist`: **null** `circles/`-Treffer. Zwölf `fusion-workbench/`-Treffer stehen, alle geprüft
und alle einer anderen Klasse: sie benennen Laufzeitpfade in der Workbench des
**konsumierenden** Projekts (`tracker.ts` Rauschliste, `.guard-state/`-Zustandsdateien in
`churn.ts`, `cross-file.ts`, `escalation.ts`, `protected-snapshot.ts`, der `.fusion-setup`-
Marker in `workbench-root.ts`, das Symlink-Beispiel in `fs-locator.ts`). Diese Pfade lösen
beim Leser auf, das ist gerade ihr Zweck.

Eine zweite Suche nach Namen des gelöschten Moduls (`mutation.?guard`, `shell-reach`,
`isProtected`, `Joiner`) im selben Bereich: **null** Treffer.

### Ausserhalb des Auftrags gefunden, nicht angefasst

`README-hooks.md:188` nennt `lib/bash-mutation-guard.ts` und einen `circles/`-Pfad. Der Satz
ist als **Historie** formuliert („Until 2026-08-07 this section described a classifier") und
damit richtig; der Pfad darin ist beim Konsumenten allerdings dieselbe tote Referenz. Der
Auftrag war auf `hooks/**/*.ts` begrenzt, also blieb die Stelle stehen.

## Teil 2 — die Versionsoberflächen

Drei von vier liegen in diesem Repository; die vierte (Marktplatz) ist ausdrücklich nicht
angefasst.

| Oberfläche | Vorher | Jetzt |
|---|---|---|
| `.claude-plugin/plugin.json`, `version` | `5.10.0` | `6.0.0` |
| `install.sh`, Kopfkommentar Zeile 27 | `FUSION_REF=tags/v5.10.0` | `FUSION_REF=tags/v6.0.0` |
| `README.md` Zeile 26 | `FUSION_REF=tags/v5.9.2` | `FUSION_REF=tags/v6.0.0` |

Das README-Beispiel war bereits **zwei** Versionen alt — genau die Drift, vor der der
Abschnitt „Release process" warnt.

### Was der Hauptversionssprung sonst falsch macht

Kandidatensuche über `CLAUDE.md`, `README.md`, `README-hooks.md`, `README-agents.md` nach
`v5`, `5.x.y`. Vierzehn Fundstellen, zwei davon falsch:

1. `CLAUDE.md:5` — „Since v5.x that stand-down covers **both** halves of the write
   protection — the four write tools and the protected-path measurement in
   `hooks/tracker.ts`". Der Zwei-Flächen-Abgleich stammt aus v5.x, die **Messung** aber
   erscheint erst mit dieser Freigabe. Jetzt getrennt datiert: die zweite Hälfte ist seit
   6.0.0 die Messung statt der Shell-Prüfung, die sie ablöste.
2. `CLAUDE.md:55` — „Since the classifier fell (v5.x, …)". Der Klassifizierer fällt in
   6.0.0. Geändert.

Zwölf weitere Nennungen bleiben unangetastet, weil sie **Historie** sind und nach der
Freigabe genauso richtig bleiben: `since v1.11.0` (Domänenparameter), `added v3.24.0`
(conceptrev), `added v5.2.0` (editor), sechsmal `Added v5.x` für Helfer und Regeldateien,
die tatsächlich in der 5er-Reihe erschienen sind, `Bus protocol removed (v3.15.0)`,
`Tagging started at v5.5.0` und `every release since v5.5.0 is tagged` im README.

### Eine Präzisierung zum Freigabetext

Die Begründung des Nutzers lautet, ein Schreibvorgang auf einen geschützten Pfad werde nicht
mehr vor der Ausführung verweigert, sondern ausgeführt und zurückgeschrieben. Das gilt für
die **Shell** und für jeden Weg, den die Werkzeugprüfung nicht sieht. Für die vier
Schreibwerkzeuge verweigert `guard.ts` CHECK 2 weiter **vor** der Ausführung
(`hooks/guard.ts:608`); die Messung ist dort der zweite Gurt, nicht der Ersatz. Der
Freigabetext sollte das so trennen, sonst liest ein konsumierendes Projekt heraus, dass
`Edit agents/coder.md` jetzt erst schreibt und dann zurückrollt — was nicht stimmt.

## Prüfung

`npm run build` in `hooks/` (das Skript ist `rm -rf dist && tsc`) ohne Ausgabe, also ohne
Fehler. `npm test`: **30 Testdateien, 1002 Zusicherungen, alle grün**, Laufzeit 77 s.

Der Neubau hat `hooks/dist/` frisch erzeugt. Geändert haben sich genau die fünf betroffenen
Module und ihre `.d.ts`-Partner; kein anderes `dist`-Artefakt hat sich bewegt, was
zusätzlich zeigt, dass `dist` vorher mit den Quellen synchron war. Klassifizierer-Waisen
sind in `dist/lib/` keine mehr vorhanden.

## Geänderte Dateien

- `hooks/lib/rules-write-exemption.ts`
- `hooks/lib/protected-snapshot.ts`
- `hooks/guard.ts`
- `hooks/lib/paths.ts`
- `hooks/lib/config.ts`
- `hooks/dist/**` (Neubau: `guard`, `lib/config`, `lib/paths`, `lib/protected-snapshot`,
  `lib/rules-write-exemption`, je `.js` und `.d.ts`)
- `.claude-plugin/plugin.json`
- `install.sh`
- `README.md`
- `CLAUDE.md`

Neu angelegt:
`260807-1427_*_reichweite-der-regel-ausnahme-ist-nach-dem-mechanismuswechsel-nicht-neu-gemessen.md`

Nicht committet und nicht gepusht, wie beauftragt.
