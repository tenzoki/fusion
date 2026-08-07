Die Domänenerkennung entscheidet vor der Codezählung, deshalb kann ein Codeprojekt als `strategic` herauskommen

---

**Severity:** Medium
**Domain:** code
**Filed by:** consultant, nach einer Meldung aus dem konsumierenden Projekt KRK
**Affects:** `agents/orchestrator.md:115-133` (Setup Schritt 5, Block "Detect workbench domain"), von dort weiter `agents/taskplanner.md`, `agents/reconciler.md`, `agents/planner.md`
**Cross-references:** `fusion-workbench/shared/issues/260807-1943_*_die-routing-tabelle-und-das-review-routing-kennen-rs-nicht.md` — der zweite Defekt aus derselben Prüfung, andere Fläche

---

## Die gemeldete Ursache trifft nicht zu

KRK meldet, die Dateiliste der Domänenerkennung kenne `.go`, `.ts`, `.py` und `.js`, aber
nicht `.rs`, und zähle deshalb 90 Rust-Dateien als null. Die Liste kennt `.rs`:

```
agents/orchestrator.md:123
  code_files = count of project files matching *.go, *.ts, *.tsx, *.py, *.js, *.rs
               (top-level + 1 subdir deep, capped at 1000)
```

Das steht so in der installierten Kopie unter `~/.fusion/agents/orchestrator.md` und im
Arbeitsbaum, und es steht dort seit `b05b423`, dem ersten öffentlichen Release v2.3.0. Eine
fusion-Version ohne `.rs` an dieser Stelle hat es nie gegeben.

Der gemeldete Ausgang bleibt trotzdem ein echter Defekt, nur an anderer Stelle: `code_files`
wird gar nicht abgefragt, bevor `strategic` feststeht.

## Der Defekt

Die Entscheidungskaskade (`agents/orchestrator.md:125-129`) läuft in dieser Reihenfolge:

```
if decisions_count > 0 and decisions_count >= issues_count: domain = "strategic"
elif analyses_count > 0 and commits == 0:                   domain = "strategic"
elif analyses_count > 0 and code_files == 0:                domain = "knowledge"
elif data_files > code_files * 2:                           domain = "data"
else:                                                       domain = "code"
```

Die beiden Zweige, die `strategic` liefern, lesen `code_files` nicht. Erst der dritte Zweig
fragt danach. Sobald einer der ersten beiden greift, ist die Codemenge des Projekts ohne jeden
Einfluss auf das Ergebnis, ob dort 0 oder 90 oder 9000 Dateien liegen.

Beide Zweige greifen bei einem gewöhnlichen Codeprojekt leicht:

- **Zweig 1.** `decisions_count` und `issues_count` zählen nur die offenen Akten
  (`*_o_*.md`, `agents/orchestrator.md:120-121`). Zwei offene Entscheidungen und eine offene
  Defektakte genügen. Wer Defekte zügig schließt und Entscheidungen offen liegen lässt, kippt
  damit in `strategic`, und zwar von Woche zu Woche unterschiedlich.
- **Zweig 2.** `commits` zählt nicht die Commits des Projekts, sondern die Commits, die die
  Workbench berühren: `git rev-list --count HEAD -- fusion-workbench/`
  (`agents/orchestrator.md:118`). Eine Workbench, die noch nie mitcommittet wurde, steht auf 0.
  Ein einziges Analysedokument reicht dann für `strategic`, unabhängig vom Alter und Umfang
  des Repositories.

## Was das kostet

Die Domäne ist keine Anzeige, sie steuert die Nacharbeit. Sie geht als Default an
`taskplanner` (Phase 1), an `reconciler` (Phase 3) und als Executor-Auswahl an `planner`
(`agents/orchestrator.md:133`, `:253`). Zwei Folgen sind wörtlich belegt:

```
agents/reconciler.md:38   strategic → "Claim-vs-disk consistency … No code-test runs."
agents/reconciler.md:169  strategic → issue-Marker _o_→_c_ werden NICHT umbenannt
```

Für ein Codeprojekt heißt das: die Abgleichrunde prüft die Behauptungen gegen die Dokumente
statt gegen den Code, führt keine Tests aus, und schließt keine behobene Defektakte. Das
Ergebnis sieht nach fehlendem Fortschritt aus, obwohl der Code stimmt.

## Zweiter, kleinerer Befund an derselben Zeile

`code_files` zählt "top-level + 1 subdir deep" (`agents/orchestrator.md:123`). Ein Rust-Projekt
legt seinen Code unter `src/`, und alles ab `src/<modul>/<datei>.rs` liegt zwei Ebenen tief und
wird nicht mitgezählt. Dieselbe Kappung trifft `internal/<pkg>/<pkg>/*.go` in Go und
`src/components/<x>/*.tsx` in typischen Frontends. Die Kappung ist nicht falsch gemeint, sie
soll den Scan begrenzen; das Limit dafür liefert aber schon `capped at 1000`. Die Tiefenschranke
macht `code_files` zu einer Stichprobe, deren Verhältnis zu `data_files` in Zweig 4 dann nicht
mehr trägt.

Ob dieser zweite Befund im gemeldeten Fall überhaupt zum Tragen kam, ist offen: sobald Zweig 1
oder 2 greift, wird `code_files` ohnehin nie gelesen.

## Reproduktion

In einem beliebigen Codeprojekt mit fusion-Workbench:

```
# Zweig 2 auslösen: Workbench nie mitcommittet, eine Analyse vorhanden
git rev-list --count HEAD -- fusion-workbench/      # -> 0
ls fusion-workbench/shared/analyses/*.md            # -> mindestens eine Datei
# Orchestrator starten; Setup Schritt 5 meldet domain = strategic
```

Für den gemeldeten Fall selbst gibt es einen direkten Nachweis, ohne Rateschritt: der
Orchestrator schreibt die Eingangswerte und die gewählte Domäne in die Setup-Zusammenfassung
und in den Snapshot der Sessionakte (`agents/orchestrator.md:133`). In der Historie der KRK-Session
steht also, welcher der beiden Zweige gegriffen hat.

## Was zu entscheiden ist, aber nicht hier

Die naheliegende Korrektur ist, die Codemenge vor die Artefaktzählung zu ziehen: ein Projekt
mit substanziellem Code ist ein Codeprojekt, auch wenn gerade drei Entscheidungen offen stehen.
Ob das die richtige Form ist, oder ob die Domäne überhaupt automatisch bestimmt werden sollte
statt einmal pro Projekt erklärt zu werden, ist eine Entscheidung und keine Fehlerbehebung. Sie
gehört in eine Entscheidungsakte, sobald jemand sie angeht.

## Herkunft dieses Befunds

Gemeldet aus dem konsumierenden Projekt KRK mit einer benannten, nachprüfbaren Ursache. Die
Ursache hielt der Prüfung nicht stand, der gemeldete Ausgang aber schon. KRK selbst konnte
hier nicht geprüft werden; die Aussagen oben beziehen sich ausschließlich auf die zitierten
Zeilen in fusion.
