Die Tiefenschranke der Codezählung sieht keinen Cargo-Workspace, kein `internal/`-Go und kein übliches Frontend

---

**Severity:** Medium
**Domain:** code
**Filed by:** consultant, gemessen in `/Users/k1/Projects/productive/krk` nach einer Meldung von dort
**Affects:** `agents/orchestrator.md:123` (Setup Schritt 5, Variable `code_files`), mittelbar `:128` (Zweig `data_files > code_files * 2`)
**Cross-references:** `fusion-workbench/shared/issues/260807-1942_*_die-domaenenerkennung-entscheidet-vor-der-codezaehlung-und-erreicht-code-nie.md` — die Zweigreihenfolge, wegen der `code_files` im gemeldeten Fall ohnehin nie gelesen wurde. Beide zusammen ergaben den gemeldeten Ausgang, jeder für sich hätte gereicht

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
(`fusion-workbench/shared/history/260807-1934-orchestrator-session.md`: `code_files=0`).

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

## Herkunft dieses Befunds

Aus der KRK-Meldung, die eine fehlende Endung `.rs` als Ursache nannte. Die Endung ist vorhanden.
Der Zählausfall ist es auch, nur verursacht ihn die Tiefenschranke. Eine frühere KRK-Sitzung hatte
den Mechanismus bereits richtig benannt
(`circles/260802-0842-krk-mac-dateimanager-editor-git/history/260806-2257-orchestrator-session.md:31`:
"weil sie höchstens eine Unterverzeichnisebene tief sieht und die Rust-Quellen unter `crates/*/src/`
liegen"); die spätere Sitzung ersetzte diese Erklärung durch die falsche und meldete sie so weiter.
