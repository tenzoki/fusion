# Der Forensik-Zeiger im ausgelieferten Regeltext zeigt auf eine Datei, die der Installer nie mitnimmt

---

**Severity:** Medium
**Domain:** code
**Filed by:** coder, während Schritt 6 des Ausstiegsplans (Release-Vorbereitung 5.9.0)
**Affects:** `rules/protected-path-discipline.md` (Zeilen 22 und 325), `rules/protected-path-internals.md` (Zeile 13), `README-hooks.md` (Zeilen 208 und 226), `install.sh` (Kopierliste, Zeilen 80–82)
**Cross-references:**
`260804-2356_*_plan-ausstieg-kontextsteuer-und-auslieferung.md` Schritt 2 und Schritt 3,
`260805-0709_*_wohin-gehoert-die-forensik-aus-protected-path-discipline.md`

---

## Was falsch ist

Der Dreischichtenschnitt aus Schritt 2 hat die Forensik bewusst aus `rules/` heraus in den
Analysespeicher des Circles gelegt. Fünf Stellen in ausgelieferten Dateien nennen sie
seitdem bei vollem Pfad:

```
fusion-workbench/circles/260801-1244-guard-rules-write/analyses/260805-0717-protected-path-forensics.md
```

`install.sh` kopiert `.claude-plugin agents skills rules hooks bin stilwerk templates docs
settings.json README*.md LICENSE`. **`fusion-workbench` steht nicht auf der Liste und darf
auch nicht darauf** — es ist das Laufzeitartefakt des konsumierenden Projekts, nicht ein
Plugin-Asset. Die Datei erreicht ein konsumierendes Projekt also nie.

Der Pfad ist zusätzlich relativ und trägt den Namen **dieses** Circles. Selbst wenn er
mitkopiert würde, löste er sich beim Konsumenten gegen dessen eigene Workbench auf, in der
`260801-1244-guard-rules-write` nicht existiert und nie existieren wird.

## Warum das zählt

Es ist genau die Fehlerklasse, gegen die Schritt 3 geschrieben wurde: *ein Befund, der einen
ausgelieferten Satz falsch macht, wird im Text korrigiert.* Der Satz in
`rules/protected-path-discipline.md` lautet:

> `fusion-workbench/circles/…/260805-0717-protected-path-forensics.md` holds the measured
> residual catalogue and the measured illustration set

Beim Konsumenten hält diese Datei gar nichts, weil es sie nicht gibt. Die Kerndatei
verspricht Auffindbarkeit als Gegenleistung für den Zuschnitt — das war die S4-Zusage der
Spec — und löst sie beim einzigen Leser, für den der Zuschnitt gemacht wurde, nicht ein.

`README-hooks.md:226` führt die Datei sogar in einer Tabelle der Fundorte auf, also an der
Stelle, an der ein Nutzer nachschlägt.

## Gemessen

Simulierter Installationspfad, dieselbe Kopierliste wie `install.sh`, in ein
Wegwerfverzeichnis:

- `rules/` kommt vollständig an: 15 von 15 Dateien.
- `hooks/dist` kommt vollständig an: 36 von 36 Dateien.
- `fusion-workbench/` kommt nicht an, und die installierte Kopie unter `~/.fusion` hat es
  auch heute nicht (`ls ~/.fusion` zeigt zwölf Einträge, keiner davon `fusion-workbench`).

Die Analysedatei selbst ist im Plugin-Repo **verfolgt** (`.gitignore` Zeile 50 hat
`## fusion-workbench/` auskommentiert), sie ist also im Tarball. Sie wird nur nicht kopiert.

## Was zu tun wäre — nicht entschieden

Drei Wege, alle mit Preis, keiner hier gewählt:

1. **Den Zeiger als repo-intern kennzeichnen.** Ein Halbsatz in jeder der fünf Stellen:
   die Forensik liegt im Entwicklungs-Repo, nicht in der Installation. Billigste Lösung,
   ehrlich, aber sie bestätigt, dass der Konsument den Katalog nicht bekommt.
2. **Die Forensik nach `docs/` verschieben.** `docs` steht auf der Kopierliste. Der
   Zuschnitt bliebe erhalten (`bin/fusion-rules` emittiert `docs/` an niemanden), und der
   Zeiger würde beim Konsumenten auflösen. Widerspricht der Entscheidung `260805-0709_*_wohin-gehoert-die-forensik-aus-protected-path-discipline.md`
   nicht im Kern — die entschied *nicht in `rules/`*, nicht *nicht ausgeliefert*.
3. **Nichts tun.** Vertretbar nur, wenn der Katalog wirklich reines Review-Material für
   dieses Repo ist. Dann müssen aber die zwei `README-hooks.md`-Stellen weg, denn das
   README richtet sich an Nutzer.

Weg 2 sieht nach der Lösung aus, die die Zusage einlöst. **Das ist eine Ableitung aus der
Kopierliste, keine geprüfte Empfehlung**, und die Entscheidung gehört zum Nutzer, weil sie
die Entscheidung `260805-0709_*_wohin-gehoert-die-forensik-aus-protected-path-discipline.md` berührt.

## Warum nicht in dieser Session behoben

Der Dispatch für Schritt 6 ist auf Version, `install.sh`, Validierung und Smoke-Test
begrenzt und schließt ausdrücklich mit „committe nichts". Eine Textänderung an fünf
ausgelieferten Stellen unmittelbar vor einem Release, das der Nutzer selbst pusht, gehört
nicht unangekündigt in dessen Diff.

---

## Resolved — 2026-08-05, Weg 1 in der Fassung, die der Nutzer entschied

Nicht Weg 1 („Halbsatz, Zeiger bleibt") und nicht Weg 2 („nach `docs/` verschieben"),
sondern die vierte Möglichkeit, die der Nutzer am Gate wählte: **Zeiger entfernen, Herkunft
nennen.** Kein Pfad ist besser als ein toter Pfad. Entscheidung `260805-0709_*_wohin-gehoert-die-forensik-aus-protected-path-discipline.md` bleibt
unberührt — die Forensik liegt weiterhin im Analysespeicher dieses Circles.

Fünf Stellen geändert, genau die fünf aus `Affects:`; eine sechste Suche über alle
verfolgten Nicht-Workbench-Dateien fand keine weitere Instanz dieses Zeigers:

| Datei | Zeile (vorher) | Jetzt |
|---|---|---|
| `rules/protected-path-discipline.md` | 22 | „they live in fusion's own development repository and no installation carries them" |
| `rules/protected-path-discipline.md` | 325 | „in the measured forensics — which lives in fusion's own development repository and is not part of an installation" |
| `rules/protected-path-internals.md` | 13 | „They live in fusion's own development repository; no installation carries them" |
| `README-hooks.md` | 208 | „in the measured residual catalogue, which left the rule files for fusion's own development repository" |
| `README-hooks.md` | 226 | Tabellenzelle nennt die Schicht statt eines Pfades |

Eine Folgestelle musste mit: `README-hooks.md` sagte unter der Tabelle „The other two are
reference and evidence, **cited by path from the first**". Das war nach der Änderung falsch
und nennt jetzt den Unterschied — Referenz mit Pfad, Evidenz ohne, mit dem Grund.

`install.sh` bleibt unverändert. Seine Kopierliste war nie der Fehler.

**Gemessen:** `rules/protected-path-discipline.md` 19 960 → 19 943, `rules/protected-path-internals.md`
21 897 → 21 870. Golden bewusst mit `UPDATE_RULES_GOLDEN=1` neu erzeugt; der Diff berührt
ausschließlich diese zwei Größen und die Summen, keine Pfadmenge. Alle sechs Rollendeckel
entsprechend **gesenkt**.

**Nicht behoben, weil außerhalb dieser Entscheidung:** dieselbe Nichtauflösbarkeit trifft
die Zitate von Entscheidungs- und Issue-Records im ausgelieferten Text — vier in den beiden
Regeldateien (`protected-path-internals.md` Zeilen 70, 133, 332; `protected-path-discipline.md`
Zeile 129) und rund sieben in `README-hooks.md`. Sie sind eine andere Gattung: sie belegen
eine Behauptung, statt eine Fundstelle zu versprechen, und drei der vier sind ohnehin mit `…`
abgeschnitten. Ob sie ebenso weichen sollen, ist eine eigene Entscheidung.
