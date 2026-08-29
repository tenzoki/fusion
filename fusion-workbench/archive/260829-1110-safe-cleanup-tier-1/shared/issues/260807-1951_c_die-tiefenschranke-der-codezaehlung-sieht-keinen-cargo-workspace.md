Die Tiefenschranke der Codezählung sieht keinen Cargo-Workspace, kein `internal/`-Go und kein übliches Frontend

---

**Severity:** Medium
**Domain:** code
**Filed by:** consultant, gemessen in `/Users/k1/Projects/productive/krk` nach einer Meldung von dort
**Affects:** `agents/orchestrator.md:123` (Setup Schritt 5, Variable `code_files`), mittelbar `:128` (Zweig `data_files > code_files * 2`)
**Cross-references:** `260807-1942_*_die-domaenenerkennung-entscheidet-vor-der-codezaehlung-und-erreicht-code-nie.md` — die Zweigreihenfolge, wegen der `code_files` im gemeldeten Fall ohnehin nie gelesen wurde. Beide zusammen ergaben den gemeldeten Ausgang, jeder für sich hätte gereicht

---

## Der Defekt

`code_files` zählt nur zwei Ebenen tief:

```
agents/orchestrator.md:123
  code_files = count of project files matching *.go, *.ts, *.tsx, *.py, *.js, *.rs
               (top-level + 1 subdir deep, capped at 1000)
```

Ein Cargo-Workspace legt seinen Code unter `crates/<name>/src/<datei>.rs`. Das sind drei
Ebenen. Kein einziger Treffer liegt innerhalb der Schranke. Die Zählung ist damit nicht
ungenau, sie ist strukturell null.

## Gemessen

In KRK, 90 Rust-Dateien, `.rs` in der Suchliste enthalten:

```
$ cd /Users/k1/Projects/productive/krk

$ find . -maxdepth 2 -type f \( -name '*.go' -o -name '*.ts' -o -name '*.tsx' \
    -o -name '*.py' -o -name '*.js' -o -name '*.rs' \) -not -path './fusion-workbench/*' | wc -l
0

$ find . -type f -name '*.rs' -not -path './target/*' -not -path './fusion-workbench/*' | wc -l
90

$ find . -type f -name '*.rs' -not -path './target/*' | sed -E 's|/[^/]+$||' | sort -u | head -4
./crates/krk-bench/src
./crates/krk-core/src
./crates/krk-core/src/ablage
./crates/krk-core/src/operation
```

Null gegen neunzig. Die Sitzungsakte von KRK hält denselben Wert fest
(`260807-1934-orchestrator-session.md`: `code_files=0`).

## Nicht rustspezifisch

Die Schranke trifft jedes Projekt, das seinen Code in benannte Einheiten gliedert:

```
Cargo-Workspace   crates/<krate>/src/<datei>.rs          3 Ebenen   nicht gezählt
Go                internal/<paket>/<datei>.go            3 Ebenen   nicht gezählt
Frontend          src/components/<ding>/<datei>.tsx      4 Ebenen   nicht gezählt
Python            src/<paket>/<modul>/<datei>.py         4 Ebenen   nicht gezählt
```

Gezählt wird verlässlich nur ein flaches Repository, das seine Quellen direkt unter `./` oder
`./src/` ablegt. Das ist die Ausnahme, nicht der Normalfall.

## Die Begrenzung ist schon anderweitig geregelt

Die Tiefenschranke soll ersichtlich den Scan bezahlbar halten. Dieselbe Zeile trägt dafür aber
bereits eine zweite, wirksamere Vorkehrung: `capped at 1000`. Eine Obergrenze auf der Trefferzahl
begrenzt die Kosten unabhängig von der Verzeichnistiefe und verfälscht das Ergebnis nicht, solange
die Frage "viel Code oder wenig" lautet und nicht "wie viel genau". Die Tiefenschranke liefert
keinen zusätzlichen Schutz, den die Trefferobergrenze nicht schon gibt, und kostet dafür die
Aussagekraft der Zahl.

## Die Folge reicht über die Domäne hinaus

`code_files` steht auch im vierten Zweig der Kaskade:

```
agents/orchestrator.md:128
  elif data_files > code_files * 2: domain = "data"
```

Mit `code_files=0` ist die rechte Seite null. Jedes Projekt, das überhaupt eine Datendatei in
`ontology/`, `manifests/`, `schemas/` oder `data/` liegen hat, erfüllt dann `data_files > 0` und
kippt nach `data`. Ein Rust-Projekt mit einer einzigen `schemas/*.json` und ohne offene
Entscheidung bekommt so `data` statt `code`, ganz ohne Zutun der Zweigreihenfolge aus der
Schwesterakte.

## Reproduktion

```
# in einem beliebigen Cargo-Workspace
find . -maxdepth 2 -name '*.rs' -not -path './target/*' | wc -l   # 0
find . -name '*.rs' -not -path './target/*' | wc -l               # die wahre Zahl
```

## Was zu entscheiden ist, aber nicht hier

Die Schranke ganz zu streichen und sich auf `capped at 1000` zu verlassen, ist die kleinste
Korrektur. Ob stattdessen eine größere feste Tiefe gewählt wird, ob die üblichen Fremdverzeichnisse
(`target/`, `node_modules/`, `vendor/`, `.git/`) ausdrücklich ausgenommen werden, und ob die
Zählung überhaupt in Prosa im Prompt stehen sollte statt in einem `bin/`-Helfer, ist eine
Entwurfsfrage. Sie gehört in eine Entscheidungsakte, wenn jemand sie angeht.

## Nachtrag 260809: die Breite fehlt genauso wie die Tiefe

Aus einer zweiten Meldung eines konsumierenden Projekts, dessen Quellen unter `codebase/go/`
und `codebase/viewer/` liegen: gezählt wurden 13 Dateien, vorhanden sind rund 17 500. Derselbe
Tiefendefekt, ein zweites Mal von außen gemeldet.

Beim Nachfassen kam eine zweite, davon unabhängige Lücke hinzu. Die Endungsliste `*.go`,
`*.ts`, `*.tsx`, `*.py`, `*.js`, `*.rs`, `*.java` lässt ganze Sprachen aus. Ein Kotlin-,
Swift-, C-, C++-, C#-, Ruby-, PHP-, Scala- oder Elixir-Projekt zählt in **jeder** Tiefe null,
und die Einzeldatei-Komponentenformate (`.vue`, `.svelte`) fehlen mit. Tiefe und Breite sind
getrennte Defekte mit derselben Folge: wer nur einen behebt, meldet weiter falsch.

`data_files` trägt den spiegelbildlichen Fehler. Fünf Endungen unter vier festen
Verzeichnisnamen, dafür ganz ohne Tiefenschranke. Wird nur `code_files` korrigiert,
verschiebt sich das Verhältnis in `data_files > code_files * 2`, statt zu stimmen.

**Gemessen im Plugin-Repo selbst** (260809-1725-orchestrator-session.md, Setup-Domänenerkennung): die Suche mit
Tiefenschranke 2 lieferte `code_files=4`; die TypeScript-Quellen unter `hooks/lib/` und
`hooks/lib/__tests__/` liegen drei und vier Ebenen tief. `git ls-files` zählt an derselben
Stelle 95 Dateien und braucht dafür nicht länger (0,011s gegen 0,015s). Hier kippte kein
Zweig, der Rückfallwert `code` stimmt ohnehin — der Defekt ist im eigenen Repo also stumm
und fällt nur dort auf, wo die Zahlen tragen.

`git ls-files` ist deshalb erwähnenswert, weil es die im Abschnitt davor offengelassene
Ausnahmeliste (`target/`, `node_modules/`, `vendor/`) überflüssig macht: was `.gitignore`
ausschließt, taucht gar nicht erst auf.

**Die Entwurfsfrage aus dem vorigen Abschnitt ist jetzt abgelegt:**
`260809-1731_*_how-should-the-domain-heuristic-count-a-projects-source-files.md`.
Sie hält Tiefe und Breite als gesetzt fest (Nutzerrichtung) und lässt den Mechanismus offen.

## Herkunft dieses Befunds

Aus der KRK-Meldung, die eine fehlende Endung `.rs` als Ursache nannte. Die Endung ist vorhanden.
Der Zählausfall ist es auch, nur verursacht ihn die Tiefenschranke. Eine frühere KRK-Sitzung hatte
den Mechanismus bereits richtig benannt
(`260806-2257-orchestrator-session.md:31`:
"weil sie höchstens eine Unterverzeichnisebene tief sieht und die Rust-Quellen unter `crates/*/src/`
liegen"); die spätere Sitzung ersetzte diese Erklärung durch die falsche und meldete sie so weiter.

---
Resolved: both axes fixed by one mechanism, in a helper of its own — `bin/fusion-count-sources`.

Counting is now `git ls-files --others --exclude-standard`, per the answered decision `260809-1731_*_how-should-the-domain-heuristic-count-a-projects-source-files.md`. There is no depth bound left to get wrong and no prune list to maintain, because `.gitignore` already excludes build output and vendored dependencies. Breadth moved with it: `code_files` from 7 extensions to 61, `data_files` from 5 under four fixed directory names to 19 across the whole tree, the RDF family included. Both sides now come from one list under one set of rules, which is what the record's second half asked for.

Measured, not inferred:

| Fixture | Old depth-2 walk | Helper |
|---|---|---|
| Cargo workspace, `crates/<c>/src/{,ablage/,operation/}*.rs`, 500 `.rs` under `target/` | 0 | 27 |
| Go, `internal/<pkg>/handler/*.go`, 300 `.go` under `vendor/` | 0 | 19 |
| Frontend, `src/components/<C>/*.tsx` plus `.vue`/`.svelte`, 400 `.js` under `node_modules/`, 50 under `dist/` | 50 | 11 |
| this repository | 4 | 88 |
| the consuming project KRK | 0 | 108 |

The frontend row is the sharper finding and was not what the record predicted. The old walk did not merely undercount there: it returned 50, and every one of them was `dist/` build output counted as project source. So the ratio branch was being fed inverted values, not just small ones.

Cost: 0.143s on a synthetic 10 000-file repository, 0.047s here.

**The no-git case is audible, as the decision required.** Exit 2, both values `unavailable`, and a new `counted_by == "none"` branch keeps that missing number out of the cascade rather than letting a zero flow through it as though it had been measured.

**The open question the decision handed forward is answered with evidence: the `data_files > code_files * 2` branch stays.** It fires, and it fires correctly — an ontology tree (2 source files, 30 data files) trips it, this repository (88/21) and KRK (108/11) do not. It looked unreachable only because of the asymmetry underneath it: no depth bound on the left but four fixed directory names, depth 2 on the right. With both sides on the same list the branch is dimensionally sound and worth keeping.

Three choices inside the answer, each argued in the helper's own header rather than left implicit: `--others --exclude-standard` (picks up a source tree not yet `git add`ed, which the decision named as a Con, without introducing a second mechanism); the `capped at 1000` limit is gone (it was a cost ceiling for the `find` walk, and keeping it would now distort the very ratio branch the same decision wants sound); and `fusion-workbench/` is excluded from both counts.

`skills/setup/SKILL.md` needed no edit: it points at Setup Step 5 rather than repeating the heuristic, so there was no duplicate to keep in step.

Session: `260810-0241-orchestrator-session.md` (task T2). Executor log: `260810-0337-coder-count-source-files-by-depth-and-breadth.md`.
