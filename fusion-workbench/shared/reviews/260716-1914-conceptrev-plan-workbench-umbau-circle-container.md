# Concept Evaluation: Plan — Umbau der workbench zum Circle-Container (Circle 1)

**Date:** 2026-07-16 19:14
**Target:** `260716-1910[o]-plan-workbench-umbau-circle-container.md`
**Verdict:** clean
**Diagrams evaluated:** 2  |  **Validation:** by-tool (mmdc 11.4.2, both blocks exit 0)

## Verdict

Beide Graphen sind kohärent, und der zweite belegt die Behauptung des Plans über sich selbst. Die Architekturgrafik zeigt vier saubere Ebenen mit einem Fan-out von 2 und ohne Zyklus: die Definition normiert den Resolver, der Resolver versorgt die Konsumenten, die Konsumenten schreiben in den Baum, der Lint hält die Konsumenten frei von Literalen. Die Schrittgrafik ist ein DAG aus 11 Knoten und 13 Kanten, dessen Kanten exakt die transitive Reduktion der `Dependencies:`-Felder der elf Schritte bilden — geprüft, nicht gelesen: kein im Text genannter Vorläufer fehlt im Graphen, keine Kante steht ohne Textbeleg da. Der einzige Befund ist ein Kantentext, der eine Ausnahme mehr behauptet, als der Plan selbst vorsieht; er verdeckt das Design nicht.

## Per-diagram measurements

| # | Typ | Knoten | Kanten | Ratio | Max Fan-out | Max Fan-in | Zyklen | Subgraphs / direction | Waisen | Verdict |
|---|------|-------|-------|-------|-------------|------------|--------|----------|--------|---------|
| 1 | graph TD (Architektur) | 7 | 9 | 1.29 | 2 (`CONV`, `RESOLVER`, `LINT`) | 2 (`RESOLVER`, `TREE`, `AGENTS`, `SKILLS`) | 0 | 4 / TD | 0 | clean |
| 2 | flowchart TD (Schritt-DAG) | 11 | 13 | 1.18 | 3 (`S2`) | 4 (`S8`) | 0 | 0 / TD | 0 | clean |

## Findings

**Diagramm 1 — Typwahl, Ebenen, Beschriftung: passend.** `graph TD` mit vier `subgraph`-Blöcken (`def`, `state`, `consumers`, `guard`) ist der richtige Typ für eine Komponentengrafik, und die Ebenen sind sichtbar statt behauptet. Alle neun Kanten tragen ein Verb (`normiert`, `benennt aktiven Circle`, `OUT_* und SCAN_*`, `schreiben nach`, `verbietet Typ-Ordner-Literale`) — die Grafik trägt damit die Aussage, nicht nur die Topologie. Die gestrichelten Kanten von `LINT` laufen gegen die TD-Richtung zurück auf `AGENTS` und `SKILLS`. Das ist kein Grenzverstoß: `LINT` ist eine Prüfbeziehung, keine Datenflussbeziehung, und die Strichelung trennt die beiden Kantenarten sichtbar. Genau so gehört eine Zusicherung gezeichnet.

**Diagramm 1 — der eine Befund: Kantentext `CONV -.->|"einzige erlaubte Nennung"| LINT` überzeichnet.** Der Plan sagt in Schritt 8 (`:215`) und im Fließtext (`:138`), der Lint nehme **zwei** Stellen aus: `rules/fusion-workbench-conventions.md` **und** `bin/fusion-paths`. Die Kante behauptet `CONV` als einzige. Der Titel des Subgraphen (`Definition — genau eine Stelle je Ebene`) trifft es korrekt und schließt `RESOLVER` ein — der Kantentext widerspricht dem eigenen Container. Kosmetisch, nicht strukturell: das Design hat die Ausnahme, nur die Beschriftung nennt sie nicht. Sauberer wäre eine zweite gestrichelte Kante `RESOLVER -.->|"erlaubte Nennung"| LINT` und ein Kantentext ohne „einzige".

**Diagramm 2 — der DAG deckt sich mit dem Text.** Maschinell gegengeprüft: für jeden der elf Schritte ist jeder im `Dependencies:`-Feld genannte Vorläufer im Graphen erreichbar. Schritt 3 nennt „1, 2" und der Graph zieht nur `S2 --> S3`; die Abhängigkeit von 1 läuft transitiv über `S1 --> S2`. Der Graph ist also die transitive Reduktion, nicht eine unvollständige Zeichnung. Das ist die richtige Form für einen Schritt-DAG.

**Diagramm 2 — Fan-in 4 auf `S8` ist Struktur, kein God-Node.** `S8` (Pfad-Lint-Gate) sammelt die vier unabhängigen Umstellungsstränge (`S4`–`S7`) ein. Das ist ein Join vor einem Gate — die erwartete Form, wenn ein Test alle Zweige absichern soll, und der Plan begründet sie ausdrücklich (`:270`: das Lint-Gate lässt einen halb umgestellten Stand nicht durch). Fan-out 3 auf `S2` spiegelt dieselbe Aussage von der anderen Seite: nach dem Resolver wird die Arbeit breit. Kein Knoten trägt hier zu viel.

**Unbeschriftete Kanten in Diagramm 2 sind hier korrekt.** Die Authoring-Regel verlangt Beschriftung, *wo das Verb Bedeutung trägt*. In einem Schritt-DAG bedeutet jede Kante dasselbe (`geht voraus`); Beschriftungen wären Rauschen. Kein Befund.

**Keine fehlende Grafik.** Der Plan zeigt Architektur (1) und Abhängigkeitsordnung (2) — die beiden strukturellen Gehalte. Die Migration (Schritt 3) ist ein linearer Ablauf und im Text vollständig; ein `sequenceDiagram` dafür wäre Zierde ohne Informationsgewinn. Die Datenstruktur-Änderungen (`.active-circle`, Stash-Manifest) sind zwei Feldänderungen und rechtfertigen kein `erDiagram`.

## Kontinuität zur Spec-Bewertung

Die Spec-Bewertung (`conceptreview/260716-1853-...`, Verdikt `acceptable`) betraf ein anderes Dokument; dieser Plan wird eigenständig bewertet. Auffällig im Vergleich: der Plan verbessert die formale Darstellung gegenüber der Spec, weil er die Auflösungsstelle als Knoten zeichnet statt sie in Prosa zu behaupten. Nichts wird hier neu aufgerollt.

## Was ein sauberer Nachzug erfordern würde

Keiner. Das Verdikt ist `clean`; ein Redraw ist nicht angezeigt. Falls der Autor den Kantentext ohnehin anfasst: `„einzige erlaubte Nennung"` → zwei Kanten (`CONV` und `RESOLVER`) mit `„erlaubte Nennung"`. Das ist ein Ein-Zeilen-Nachzug in der Grafik, kein Designproblem.
