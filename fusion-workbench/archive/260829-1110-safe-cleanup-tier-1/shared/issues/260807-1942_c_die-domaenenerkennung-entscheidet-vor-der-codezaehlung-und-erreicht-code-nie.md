Die Domänenerkennung entscheidet vor der Codezählung, deshalb kann ein Codeprojekt als `strategic` herauskommen

---

**Severity:** Medium
**Domain:** code
**Filed by:** consultant, nach einer Meldung aus dem konsumierenden Projekt KRK
**Affects:** `agents/orchestrator.md:115-133` (Setup Schritt 5, Block "Detect workbench domain"), von dort weiter `agents/taskplanner.md`, `agents/reconciler.md`, `agents/planner.md`
**Cross-references:** `260807-1943_*_die-routing-tabelle-und-das-review-routing-kennen-rs-nicht.md` und `260807-1951_*_die-tiefenschranke-der-codezaehlung-sieht-keinen-cargo-workspace.md` — die beiden anderen Defekte aus derselben Prüfung, jeder mit eigener Korrektur
**Belegquelle:** `/Users/k1/Projects/productive/krk/260807-1934-orchestrator-session.md` `### Erkannte Arbeitsdomäne`

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
fusion-Version ohne `.rs` an dieser Stelle hat es nie gegeben. Die KRK-Sitzung lief auf 6.0.1
(dort protokolliert unter `### Sitzungsvorbereitung`), also auf einer Fassung, die `.rs` führt.

Gegenprobe direkt in KRK, mit `.rs` in der Liste, an der vorgeschriebenen Tiefe:

```
$ cd /Users/k1/Projects/productive/krk
$ find . -maxdepth 2 -type f \( -name '*.go' -o -name '*.ts' -o -name '*.tsx' \
    -o -name '*.py' -o -name '*.js' -o -name '*.rs' \) -not -path './fusion-workbench/*' | wc -l
0
```

Die Zählung bleibt bei null, obwohl `.rs` mitzählt. Die gemeldete Ursache erklärt den Ausgang
also nicht einmal dann, wenn man sie unterstellt. Zwei andere Defekte erklären ihn, und beide
sind hier gemessen: dieser hier, und die Tiefenschranke in der Schwesterakte
`260807-1951_*_die-tiefenschranke-der-codezaehlung-sieht-keinen-cargo-workspace.md`. Dieser Defekt allein hätte gereicht, denn `code_files`
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

**Im gemeldeten Fall hat Zweig 1 gegriffen, gemessen.** Die KRK-Sitzung protokolliert ihre
Eingangswerte:

```
commits=122, analyses_count=0, issues_count=1, decisions_count=3, code_files=0, data_files=0
→ erster Zweig, weil decisions_count > 0 und decisions_count >= issues_count
```

Drei offene Entscheidungen gegen eine offene Defektakte, in einem Repository mit 122 Commits
und 90 Rust-Dateien. Zweig 2 konnte hier gar nicht greifen (`analyses_count=0`); es genügte
Zweig 1. Beide greifen bei einem gewöhnlichen Codeprojekt leicht:

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

## Wie oft das trifft

In KRK ist es kein Einzelfall. Die Heuristik meldet dort seit dem 2. August durchgehend
`strategic`, und die Orchestratoren haben es jedes Mal von Hand überstimmt:

```
orchestrator-events.jsonl:5    2026-08-02  "domain=code (heuristic said strategic, overridden …)"
orchestrator-events.jsonl:282  2026-08-07  "domain default=code (heuristic said strategic)"
circles/260802-0842-…/history/260803-1038-orchestrator-session.md:26
                              "liefert strategic, und das ist hier falsch"
circles/260802-0842-…/history/260806-2257-orchestrator-session.md:31
                              "Der Zählfehler entwertet das Ergebnis, deshalb bleibt es bei code"
```

Ein Messwert, den jeder Anwender bei jedem Lauf verwirft, ist keine Heuristik mehr. Das ist
das eigentliche Gewicht dieses Defekts: nicht dass die Domäne einmal falsch war, sondern dass
sie über fünf Tage und mindestens vier Sitzungen nie richtig war und die Korrektur jedes Mal
am Menschen hing.

## Reproduktion

In einem beliebigen Codeprojekt mit fusion-Workbench, drei offene Entscheidungen gegen eine
offene Defektakte anlegen und den Orchestrator starten. Setup Schritt 5 meldet `strategic`,
unabhängig vom Codebestand.

Der Nachweis für einen bereits gelaufenen Fall braucht keinen Nachbau: der Orchestrator
schreibt die Eingangswerte und die gewählte Domäne in die Setup-Zusammenfassung und in den
Snapshot der Sessionakte (`agents/orchestrator.md:133`). Genau von dort stammen die Zahlen oben.

## Was zu entscheiden ist, aber nicht hier

Die naheliegende Korrektur ist, die Codemenge vor die Artefaktzählung zu ziehen: ein Projekt
mit substanziellem Code ist ein Codeprojekt, auch wenn gerade drei Entscheidungen offen stehen.
Ob das die richtige Form ist, oder ob die Domäne überhaupt automatisch bestimmt werden sollte
statt einmal pro Projekt erklärt zu werden, ist eine Entscheidung und keine Fehlerbehebung. Sie
gehört in eine Entscheidungsakte, sobald jemand sie angeht.

## Herkunft dieses Befunds

Gemeldet aus dem konsumierenden Projekt KRK mit einer benannten, nachprüfbaren Ursache. Die
Ursache hielt der Prüfung nicht stand, der gemeldete Ausgang aber schon.

Die erste Fassung dieser Akte schloss mit dem Satz, KRK selbst habe nicht geprüft werden
können. Das war falsch, und zwar ungeprüft falsch: das Repository liegt unter
`/Users/k1/Projects/productive/krk` und ist lesbar. Aufgefallen ist es, als eine
Parallelsitzung beiläufig aus demselben Verzeichnis berichtete. Alle Messwerte oben stammen
aus der anschließenden Prüfung. Der Unterschied ist nicht kosmetisch: ohne sie stünde hier
immer noch, Zweig 1 oder Zweig 2 könne gegriffen haben, und die Tiefenschranke sei ein
Nebenbefund von offener Wirkung. Gemessen hat Zweig 1 gegriffen, und die Tiefenschranke ist
ein eigener Defekt mit eigener Akte.

---

Resolved: the code count is read first, and `strategic`/`knowledge` now sit below it.

The cascade in `agents/orchestrator.md` Setup Step 5 was reordered into three regions. `counted_by == "none"` stands at the top, so no branch ever reads a number that was never taken. Then the project tree: `code_files > 0 and data_files > code_files * 2 → data`, `code_files > 0 → code`. Only below those, where `code_files == 0` already holds, do the artifact counts decide between `strategic`, `knowledge` and a sourceless `data`.

The record's own closing section said the obvious correction might not be the right *form*. What it is, in the end, is not a new rule but the removal of a duplicated one: `strategic` and `knowledge` are both claims that the workbench governs no build, and the `knowledge` branch already carried `and code_files == 0` as a conjunct. Hoisting that conjunct into a region guard states it once, for both claims, and the `knowledge` branch no longer repeats it.

Measured against the values `bin/fusion-count-sources` returns since `2910cf6`, old cascade against new:

| project | inputs | before | after |
|---|---|---|---|
| KRK, the reported case | commits 0, analyses 0, issues 1, decisions 3, code 108, data 11 | `strategic` | **`code`** |
| this repository | commits 158, analyses 9, issues 29, decisions 3, code 88, data 21 | `code` | `code` |
| ontology tree | code 2, data 30, no open decisions | `data` | `data` |
| ontology tree with 2 open decisions against 0 open issues | code 2, data 30 | `strategic` | **`data`** |
| no git repository | `counted_by=none` | `code` | `code` |
| strategy workbench | code 0, data 0, decisions 6, issues 0 | `strategic` | `strategic` |
| knowledge project | code 0, data 0, analyses 9, issues 4, decisions 1, commits 12 | `knowledge` | `knowledge` |

Two rows change and both are the defect. All four domains stay reachable, and each is now reachable on evidence a project of a different shape cannot trip incidentally.

Two things settled while fixing it, written into the prompt rather than left here:

- **`data_files > code_files * 2` carries no information when its denominator is zero** — it degenerates to `data_files > 0`. So the sourceless case gets its own `data_files > 0` line at the *bottom* of the cascade rather than reusing the ratio at the top, where a single CI `.yml` in a documents-only repository would have claimed it for `data`. That residual is named in the prompt; it is a deliberate choice of which false positive to keep, not an oversight.
- **The absent count resolves to `code` and does not fall through to the artifact branches.** Falling through would hand a `strategic` verdict to a project whose code volume is precisely what nobody could measure — this defect with the evidence removed. `code` is also the cascade's own no-evidence fallback, so an unmeasurable project takes the same default as an unremarkable one rather than a verdict of its own, and the orchestrator says out loud that the count could not be taken.

A gate holds the order: `hooks/lib/__tests__/domain-cascade-order-lint.test.ts` parses the cascade out of the prompt and fails if any `strategic`/`knowledge` branch rises above the first branch reading `code_files`, or if the `counted_by == "none"` branch sinks below one that reads a count. It is fed the pre-fix cascade as a negative case, so it is shown to fail on the defect rather than only to pass on the fix.

Session: `260810-0241-orchestrator-session.md` (task T3). Executor log: `260810-0349-coder-domain-cascade-branch-order.md`.
