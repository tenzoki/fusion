# Fusion in Kürze — eine kompakte Einführung

Fusion ist ein Claude-Code-Plugin, das eine Arbeitssitzung als Team von elf spezialisierten Agenten fährt: ein Orchestrator verteilt, Coder, Reviewer, Planer und Analysten arbeiten, und der Mensch entscheidet an den Stellen, die zählen. Koordination läuft über Dateien im Projekt (`fusion-workbench/`), nicht über gemeinsamen Speicher. Diese Seite ist der Schnelleinstieg. Die Tiefe steht in `docs/philosophy.md` (warum), `docs/working-model.md` (wie eine Sitzung abläuft) und `README.md` (Installation, Konfiguration).

## 1. Installation, Start, Setup

**Installieren** (empfohlener Weg, kein git, kein Marketplace-Cache):

```bash
curl -fsSL https://raw.githubusercontent.com/tenzoki/fusion/main/install.sh | bash
```

Das legt das Plugin nach `~/.fusion` und einen Launcher `fusion` nach `~/.local/bin`. Voraussetzungen: Claude Code v2.1.63+, Node.js 18+ (für die Hooks), Python 3 (für den Monitor).

**Starten:**

```bash
fusion              # Orchestrator-Sitzung (Standard)
fusion coder        # einen bestimmten Agenten direkt starten
fusion --yolo       # ohne Freigabe-Prompts; nur für Wegwerf-Schleifen
```

**Setup, einmal pro Projekt, in der gerade gestarteten Sitzung:**

```
/fusion:setup
```

Setup ist die einzige Stelle, die eine Workbench anlegt. Es erzeugt `fusion-workbench/`, kopiert den Monitor und die vier Stilprofile hinein, legt `fusion.json` im Projekt-Root an (git-getrackt, bitte committen) und schreibt den Marker `fusion-workbench/.fusion-setup`. Jeder Agent und jeder Hook sucht diesen Marker von seinem Arbeitsverzeichnis aufwärts. Ohne Marker halten Agenten mit „no fusion workbench found“ an; die Hooks tun nichts.

Setup läuft bei jedem Sitzungsstart erneut (der Orchestrator führt es als seine Setup-Prozedur aus) und erledigt dabei mehr als das erste Anlegen: es prüft auf eine parallel laufende Sitzung (Schritt 0c), vergleicht die kopierten Stilprofile mit den ausgelieferten (0e), bietet einmalig an, eine Berechtigungsdatei `.claude/settings.local.json` zu schreiben (0g; „ja“ ist die bessere Wahl als `--yolo`), trägt den Merge-Treiber für das Event-Log in `.gitattributes` ein (0h) und liest die Identität dieses Checkouts (0i). Auf einem normalen Lauf stellt Setup genau eine Frage (0g).

**Wichtig: immer im Projekt-Root starten.** Startet die Sitzung in einem Unterverzeichnis, warnt der SessionStart-Hook („restart this session at the project root“). Die Warnung ändert nichts am Verhalten; einfach neu starten.

## 2. Monitor

In einem zweiten Terminal im Projekt-Root:

```bash
./fusion-workbench/monitor "Meine Sitzung" 8099
```

Das serviert ein Live-Dashboard unter `http://localhost:8099`. Es liest `orchestrator-events.jsonl` und zeigt Dispatches, Commits, Gates und die Schreibspur der Hooks. Optionen: `-n <N>` maximale Event-Zeilen (Standard 100), `-i <sec>` Refresh-Intervall (Standard 2). Bei mehreren Checkouts zeigt der Monitor nur die Sitzungen des eigenen Checkouts (siehe Abschnitt 8).

## 3. Hilfe und Selbstauskunft

```
/fusion:help                 # Übersicht plus der tägliche Ablauf
/fusion:help <topic>         # topic: philosophy | daily | install | update | configure
```

Der Help-Skill liest die ausgelieferten Docs und zitiert sie mit Pfad, statt aus dem Gedächtnis zu antworten. Für Fragen zum eigenen Projekt (Architektur, zweite Meinung, Projektgesundheit) gibt es den `consultant`: `fusion consultant`.

## 4. Fusion beim Coden: die Begriffe

**Der tägliche Ablauf, in der Reihenfolge, in der er tatsächlich passiert:**

1. Im Projekt-Root `fusion` eingeben. Das öffnet eine Claude-Code-Sitzung mit dem Orchestrator. Alle `/fusion:`-Kommandos werden in dieser Sitzung getippt.
2. Beim allerersten Mal im Projekt `/fusion:setup` ausführen. Danach nicht mehr nötig: der Orchestrator führt Setup selbst aus, sobald er die erste Aufgabe bekommt.
3. `/fusion:cadence`: was habe ich zuletzt getan. Braucht keinen laufenden Orchestrator, nur die Sitzung und die Workbench.
4. Arbeiten: dem Orchestrator sagen, was man will.
5. Ideen unterwegs mit `/fusion:memo` ablegen, ohne die laufende Arbeit zu stören.
6. Fertig: `/fusion:cleanup` — committen und pushen, sonst nichts. Aufräumen, Reconcile, Aktivitätslog, `CLAUDE.md` und die Nachricht an das nächste Checkout sind je ein eigenes Kommando.

### Direktmodus: einfach sagen, was man will

Dem laufenden Orchestrator die Aufgabe nennen („implementiere den Plan in planning und reviewe ihn“, „fix den fehlschlagenden Test im Parser“). Der Orchestrator klärt den Umfang und arbeitet eine Aufgabe nach der anderen ab. Ist die Anfrage vage, geht sie erst durch den `shaper` (ergibt eine Spec, mit **Spec-Gate**), dann durch den `planner` (ergibt einen Plan, mit **Plan-Gate**). Ist sie klar, wird der Shaper übersprungen.

### Die Dispatch-Schleife

Fünf Schritte, je Aufgabe wiederholt: Aufgabe lesen, dispatchen (`coder` für Code, `ontocoder` für Daten/Ontologie), die Rückgabe lesen, committen (unter dem Commit-Lock), berichten und fragen, was als Nächstes kommt. **Es gibt keine Warteschlange und keinen Zähler:** genau eine Aufgabe ist unterwegs, und die nächste kommt von dir, aus dem Plan oder Issue, an dem die Sitzung arbeitet, oder aus dem, was die letzte Rückgabe aufgedeckt hat. Begrenzt wird die Schleife von dem Menschen, der nach jedem Commit antwortet, und von sonst nichts. Bis v11 lief die Arbeit stattdessen in **Turns** — Batches von Tasks, mit einem automatischen Kohärenz-Check am Ende jedes Turns und einem Turn-Budget in `fusion.json`; beides ist am 2026-09-10 entfallen.

### Kohärenz-Check und Rebalance-Gate

Von selbst prüft nichts mehr die Kohärenz. Was bleibt, ist die **Reconciliation, um die du bittest** (`/fusion:reconcile`): der `reconciler` gleicht die Tracking-Dateien mit dem Code ab und liefert ein Verdikt aus drei Fragen — passt die Arbeit noch zu den Annahmen (Grounding), führt sie zum Ziel (Directive), ist das Ziel noch erreichbar? Ist das Verdikt nicht `coherent`, öffnet das **Rebalance-Gate** mit vier Optionen (Arbeit nachbessern, Ziel ändern, Annahmen ändern, begrenzt abschließen). Das ist sein einziger Auslöser: wer keine Reconciliation anstößt, sieht das Gate nie.

In `fusion.json` steht genau ein aktives Setting: `citations.extraPaths`, die Nicht-Markdown-Dateien, in denen dieses Projekt Record-Zitate führt. `orchestrator.maxTurns` und `orchestrator.dispatchMinutes` sind zurückgezogen; ein Projekt, das eines davon noch deklariert, bekommt je eine Advisory pro Tool-Call.

### Gates

Fusion ist absichtlich nicht autonom. Es hält an und fragt vor: Spec-Freigabe, Plan-Freigabe, jeder Ontologie- oder Strukturdaten-Änderung, destruktiven Operationen (löschen, Features entfernen) und bei mehrdeutigen Aufgaben. Die Antworten an den Gates sind die Steuerung.

### Work Item

Ein Work Item ist eine abgegrenzte Arbeitseinheit, definiert durch **Directive** (Ziel), **Grounding** (Annahmen) und **Artifact** (Ergebnis). Es ist *ein Verzeichnis*, `fusion-workbench/circles/<stamp>-<slug>/`, mit einem Record gleichen Namens darin, `circles/<stamp>-<slug>/<stamp>-<slug>.md`, **ohne Marker an beiden Namen**. Alles, was das Item hervorbringt, liegt im selben Verzeichnis. Der Zustand steht als Kopffeld `**Status:**` im Record:

- `open` — niemand arbeitet daran
- `claimed` — ein Checkout arbeitet gerade daran; `**Claim:**` nennt welcher
- `done` — die Arbeit ist gelandet; der Claim bleibt stehen und nennt, wer sie getan hat
- `dropped` — nicht mehr aktuell; der Text sagt warum

`done` und `dropped` sind terminal; ein abgeschlossenes Item wird nie wieder geöffnet, sondern durch ein neues ersetzt, das es zitiert. Zwei Entwurfsentscheidungen tragen den Rest: ein Record je Item statt einer Listendatei, damit zwei Checkouts konfliktfrei mergen; und der Zustand im Feld statt im Namen, damit ein Zustandswechsel den Record ändert statt ihn umzubenennen und jede Zitierung ein Leben lang gültig bleibt.

Kleine Projekte brauchen den Backlog kaum: eine Anfrage an den Orchestrator ohne Item läuft einfach ohne, und die Artefakte landen in ihrem jeweiligen Store.

Bis v11 hieß die Arbeitseinheit *Circle*: ein Verzeichnis unter `circles/` mit eigenem Record, sechs Zustandsmarkern, einer eigenen Kopie jedes Stores und einer Rangfolge darüber. Entfallen sind die sechs Zustände und die Rangfolge, nicht das Verzeichnis: der Container bleibt und trägt jetzt das Work Item. `/fusion:migrate` wandelt eine Workbench um, die noch einen lebenden Circle-Record hat.

### Backlog, Memo und der Weg zur Arbeit

```
/fusion:memo idea: <eine Zeile>   Idee als Work Item ablegen (Status: open)
Store lesen, eines auswählen      nichts rankt sie; die Reihenfolge ist deine
Orchestrator claimed es           Status: open → claimed, Claim: <dein Checkout>
Item-Pfad an den shaper           er liest es als Anfrage und schreibt kein Byte hinein
```

`/fusion:memo` kennt drei Ziele: ein persönliches Memo (`shared/memos/memos-<checkout>.md`), eine Aufgabe (`task:`/`todo:` nach `tasks-<checkout>.md`) oder eine Idee (`idea:`/`idee:`/`backlog:` als eigenes Verzeichnis unter `circles/`). Kein Agent legt ein Work Item an; das ist Sache des Menschen. Der Orchestrator pflegt den Store — claimen, freigeben, abschließen, verwerfen, teilen, zusammenlegen — und zwar je Operation und je Item nur auf dein Wort hin. Gerankt wird nichts: der Agent, der das tat, ist mit v11 entfallen.

### Issues und Decisions

Faustregel: „geh es fixen“ ist ein **Issue** (`issues/`, Marker `_o_` offen, `_p_` in Arbeit, `_c_` geschlossen, `_d_` verschoben). „Entscheiden und festhalten“ ist eine **Decision** (`decisions/`, Marker `_o_` offen, `_a_` beantwortet, `_i_` umgesetzt, `_d_` verschoben, `_s_` abgelöst). Der Reviewer legt seine Befunde als Issues ab; bei Sitzungsende legt niemand welche an. Was eine Sitzung offen lässt, gehört in die Commit-Nachricht oder in einen Record, den du selbst schreibst.

## 5. Abschluss von Arbeitseinheit und Sitzung

**Item-Ende:** Ein Work Item kann mehrere Sitzungen dauern; Sitzungsende und Item-Ende sind zwei verschiedene Dinge. Der `reconciler` gleicht die Tracking-Dateien mit dem Code ab, wenn du ihn darum bittest. Der Reviewer läuft **einmal je Item, beim Abschluss**, über alle Commits, die noch kein Review abgedeckt hat (`bin/fusion-review-coverage`). Der Orchestrator liest die Abbruchklauseln des Plans vor und fragt, ob jede hält. Dann geht `**Status:**` auf `done` oder `dropped`, der Claim bleibt stehen und nennt, wer die Arbeit getan hat, und eine Abschlussnotiz mit dem Commit-Bereich wird angehängt.

**Sitzungsende:**

```
/fusion:cleanup
```

**Committen und pushen, sonst nichts** — in sinnvollen Splits, unter dem Commit-Lock. Es dispatcht keinen Agenten, legt keine Issues an, archiviert nichts, schreibt kein Aktivitätslog und fasst keine normative Fläche an. Optionen: `--dry-run`, `--no-push`.

Bis v11 war das eine Pipeline aus acht Schritten mit einem Gate. Die übrigen Schritte sind jetzt je ein eigenes Kommando, das man tippt, wenn man es will: `/fusion:reconcile`, `/fusion:archive`, `/fusion:log-activity`, `/fusion:curate`, `/fusion:post` (Abschnitt 10).

## 6. Zeitkosten und Aufräumarbeiten

**Was Zeit kostet:**

- **Erster Setup-Lauf in einem Projekt:** legt die Workbench an, kopiert Assets, erzeugt Identität und Marker. Spätere Setups sind idempotent (bestehende Profile werden nicht überschrieben; der Marker wird nur bei Versionswechsel neu geschrieben).
- **Erstes `/fusion:reconcile` in einem Checkout:** ohne Anker in `fusion-workbench/.cadence-anchors` läuft der Reconciler über die ganze Workbench. Ab dem zweiten Lauf liest er nur die Delta seit seiner letzten Marke; `--force` erzwingt den vollen Lauf. `/fusion:cleanup` selbst dispatcht niemanden mehr und kostet nur, was Commit und Push kosten.
- **Die Regel-Last pro Dispatch:** jeder Agent lädt bei seinem Setup den immer geladenen Regelsatz plus das Chat-Stilprofil des Projekts (`bin/fusion-rules <agent>`), aktuell rund 66 KB für einen Coder-Dispatch. Das ist der Preis, den man bei jedem Sub-Agenten zahlt; darum sind Regeln bewusst knapp und teils nur an die Agenten emittiert, die sie brauchen.
- **Review beim Item-Abschluss:** ein Durchlauf über alle nicht abgedeckten Commits; bei einem Item über mehrere Sitzungen entsprechend länger.
- **Curator-Gate in `/fusion:curate`:** wartet auf eine Antwort; der Survey-Lauf davor läuft ohne Aufsicht durch.

**Aufräumarbeiten, die dazugehören:**

- **Archivierung:** `/fusion:archive` verschiebt terminale Work Items und terminale Marker aus `shared/` nach `fusion-workbench/archive/` und rollt das Guard-Event-Log unter datiertem Namen dorthin. Tier 2 nimmt gealterte Reviews dazu, Tier 3 gealterte History (Standardalter 14 Tage, z. B. `tier-3 21d`). Archivieren verschiebt, löscht nie.
- **`/fusion:cadence`:** liest Aktivitätslog, Session-Histories und git und schreibt eine Übersicht (gestern, letzte 7 Tage, wiederkehrende Themen) nach `shared/memos/cadence-<checkout>.md`. Wer das zugrundeliegende Log frisch will, lässt vorher `/fusion:log-activity` laufen.

Ein Hinweis zur Einordnung, als Beobachtung und nicht als Messung dieses Dokuments: die Buchhaltung (Setup, Reconcile, Reviews, Cleanup) macht einen großen Teil der Sitzungszeit aus. Die inkrementellen Mechanismen seit v10.8.1 sind die Antwort darauf.

## 7. Die Workbench: eine Art, zwei mögliche Stores

```
fusion-workbench/
├── circles/                      # ein Verzeichnis je Work Item
│   └── <stamp>-<slug>/           # der Record des Items, dazu was das Item erzeugt hat
│       ├── <stamp>-<slug>.md
│       └── planning/ issues/ decisions/ reviews/ analyses/ history/
├── shared/                       # dieselben Arten, für Arbeit ohne Item
│   ├── planning/ issues/ decisions/ reviews/ analyses/
│   ├── history/ investigations/ consult/ memos/ forum/ checkouts/
├── archive/  stilwerk/  monitor
└── (Zustand am Wurzelverzeichnis: orchestrator-events.jsonl, .guard-state/,
     .commit-lock/, .session-marker, .checkout-id, .cadence-anchors)
```

**Die Herkunftsregel trifft die Ablageentscheidung:** ein Artefakt gehört zu dem Work Item, aus dessen Direktive es entstanden ist, und nach `shared/`, wenn kein Item im Zugriff ist. Querbezüge werden zitiert, nicht durch Ablage abgebildet. Agenten schreiben keine Pfade fest; sie lösen sie zur Laufzeit über `bin/fusion-paths <agent>` auf — das nennt den Container des Items, das dieser Checkout geclaimt hat, sonst den gemeinsamen Store. Mit v11 entfallen sind der sechszustandsbehaftete Circle-Record und die Rangfolge darüber, nicht der Container; `/fusion:migrate` wandelt eine Workbench um, die noch einen lebenden Circle-Record hat.

## 8. Mehrere Personen, gemeinsame Workbench, und die Rolle von git

**Git ist der einzige Transport.** Zwei Personen arbeiten in zwei Clones, und zwei Clones teilen genau das, was git zwischen ihnen trägt: kein gemeinsames Dateisystem, kein Server. Deshalb gilt: **wer zu mehreren arbeitet, trackt die Workbench in git.** Eine ungetrackte Workbench ist eine private Notizsammlung je Rechner; die Work Items, Decisions, Issues und Pläne wären dann keine gemeinsame Fläche mehr. Fusion liefert keine `.gitignore`-Regel dafür; ein Einzelner darf ignorieren, ein Team muss tracken.

**Nicht alles wird getrackt.** `rules/workbench-tracking.md` teilt jeden Eintrag der Workbench in vier Klassen:

| Klasse | Einträge | git |
|---|---|---|
| R1 viele Dateien, je ein Schreiber | `shared/`, `archive/`, `stilwerk/` | tracken |
| R2 eine Datei, viele Anhänger | `orchestrator-events.jsonl` | tracken, mit `merge=union` |
| R3 einmal geschrieben | `.fusion-setup`, `.asset-provenance` | tracken |
| L bleibt im Checkout | `.session-marker`, `.checkout-id`, `.cadence-anchors`, `.commit-lock/`, `.guard-state/`, `monitor` | ignorieren |

Klasse L beschreibt *jetzt* (Sitzungszustand) oder *dieses Checkout* (`.checkout-id`, `.cadence-anchors`) und würde im Diff nur rauschen oder, aus einem fremden Checkout gezogen, lügen. Dieses Repository wendet genau diese Partition an; seine `.gitignore` ist die Vorlage für eine eigene.

**Das Event-Log braucht einen Merge-Treiber.** `orchestrator-events.jsonl` ist die eine Datei, an die jedes Checkout anhängt. Git's Standard-Textmerge macht daraus einen Konflikt. Die Lösung ist eine Zeile in `.gitattributes` im Projekt-Root:

```
fusion-workbench/orchestrator-events.jsonl merge=union
```

`/fusion:setup` Schritt 0h fragt git (`git check-attr`), ob ein Treiber gilt, und schreibt die Zeile nur, wenn keiner gilt. Der Preis: nach einem Merge steht die Datei nicht mehr chronologisch. Jede Zeile trägt seit v10.8 `person`, `checkout` und `session_id`, und jeder Leser filtert erst nach Checkout und sortiert dann nach `ts`.

**Identität.** `bin/fusion-identity` liest die Person aus `git config user.name/user.email` (nie geschrieben) und prägt beim ersten Aufruf eine Checkout-Kennung in `fusion-workbench/.checkout-id`. Fehlen `user.name` oder `user.email` in einem git-Arbeitsbaum, hält der Agent an: ohne Identität wird nichts abgelegt. Außerhalb eines git-Arbeitsbaums ist keine Identität geschuldet; der Record trägt dann nur den Agenten.

**Wer arbeitet gerade woran.** Setup Schritt 0c warnt vor einer zweiten Orchestrator-Sitzung auf demselben Checkout (`.session-marker`, Heartbeat vom PostToolUse-Hook, `running` bis 10 Minuten, danach `stale`). Für andere Checkouts meldet `bin/fusion-events presence` bei Setup, welche anderen Personen und weiteren eigenen Checkouts im Fenster (Standard 7 Tage) eine Sitzung gestartet haben. Der Blick reicht nur so weit wie der letzte Pull (`scope=pulled`): eine Sitzung, die seit dem letzten Fetch anderswo begann, ist unsichtbar, nicht abwesend.

**Ein Work Item sagt, wer es fährt.** Es trägt ein Feld `**Claim:**` mit den acht Hex-Zeichen des Checkouts, dann der Person, dann dem Zeitstempel; fehlt das Feld, ist niemand dran. Verglichen wird auf den acht Zeichen und nie auf der Person: zwei Checkouts einer Person tragen eine git-Identität, also kann die Person allein die Frage nicht beantworten. Das Feld reist mit der Datei, also sieht jedes Checkout dasselbe. Claimen zwei Personen dasselbe Item, bevor die jeweils andere Änderung gepullt wurde, kollidiert genau diese eine Zeile beim Merge; wer den Merge verliert, sieht den fremden Claim und wählt ein anderes Item. Die Kollision wird erkannt und nicht verhindert — reserviert wird nichts im Voraus.

**Der Commit-Lock** (`bin/fusion-commit-lock`) ist ein Mutex um `git add` + `git commit` *innerhalb eines Checkouts*: er schützt den git-Index vor parallelen Agenten derselben Sitzung. Zwischen Checkouts gibt es keinen Lock, und das ist Absicht: dort gilt die normale Git-Disziplin, pullen, mergen, pushen.

**Praktisch heißt das für ein Team:**

1. Workbench tracken, `.gitignore` nach der Vier-Klassen-Partition, `.gitattributes` mit `merge=union` (Setup schreibt sie).
2. `git config user.name` und `user.email` in jedem Checkout gesetzt.
3. Vor Sitzungsbeginn pullen, damit Presence und Claims aktuell sind; `/fusion:cleanup` pusht am Ende.
4. Ein Item gehört dem Checkout, dessen Kennung im Claim steht. Wer es in einem zweiten Checkout aufnimmt, überschreibt bewusst den Claim; wer es vorher hielt, steht im Commit, der ihn genommen hat.
5. Sauberer Arbeitsbaum beim Start; Hand-Edits nicht in eine laufende Sitzung mischen.

## 9. Update und Stilprofile

```bash
fusion --update     # lädt die neueste Version nach ~/.fusion, dann Sitzung neu starten
```

Die Hooks laufen aus der installierten Kopie und sind für die ganze Sitzung festgepinnt; ein Update wirkt erst nach Neustart. Die Release-Notes je Version liegen in `docs/upgrading-to-v*.md`; `/fusion:help update` nennt die letzten drei. Beim Marketplace-Pfad gibt es keinen `fusion`-Launcher und kein `/plugin update`: dort erst den Marketplace-Clone pullen, dann `uninstall`, `install`, `/reload-plugins`.

**Stilprofile.** Setup kopiert vier Profile nach `fusion-workbench/stilwerk/`: `default-voice-{en,de}.yaml` (Langform, für Berichte und Specs) und `chat-voice-{en,de}.yaml` (Kurzform, für jede Chat-Zeile jedes Agenten). Die Sprache wählt `CLAUDE.md`: `**Language:** de` für den Chat, optional `**Artifact language:** en` für die geschriebenen Artefakte. Die Kopien sind projektlokal editierbar und werden bei späteren Setups nicht überschrieben. Ändert sich ein ausgeliefertes Profil, vergleicht Setup Schritt 0e die Prüfsumme und fragt einmal: **„Replace them“** oder **„Keep mine“**. Bei einer Kopie, die vor der Prüfsummen-Aufzeichnung existierte, kann Fusion Anpassung und veraltete Kopie nicht unterscheiden und sagt das.

## 10. Die Kommandos auf einen Blick

| Kommando | Zweck |
|---|---|
| `/fusion:setup` | Einmal pro Projekt die Workbench anlegen; danach führt der Orchestrator Setup selbst aus |
| `/fusion:cleanup` | Sitzungsende: committen und pushen, sonst nichts |
| `/fusion:reconcile` | Tracking-Dateien gegen den Code abgleichen; liefert das Coherence-Verdikt |
| `/fusion:archive` | Terminale Artefakte nach `archive/` verschieben |
| `/fusion:log-activity` | Das Aktivitätslog dieses Checkouts schreiben |
| `/fusion:curate` | `CLAUDE.md` und die Regeldateien abgleichen — das eine Gate |
| `/fusion:post` | Eine Nachricht für das nächste Checkout hinterlassen |
| `/fusion:cadence` | Was ist passiert (gestern, 7 Tage, wiederkehrend) |
| `/fusion:news` | Was ein anderes Checkout hinterlassen hat, gelesen vor dem Pull |
| `/fusion:memo` | Memo, Aufgabe oder Idee ablegen |
| `/fusion:help [topic]` | Selbstauskunft |
| `/fusion:commit` | Commit mit generierter Nachricht, unter dem Lock |
| `/fusion:migrate` | Alte Workbench-Layouts auf das aktuelle Format bringen |

Quellen: `README.md`, `docs/working-model.md`, `skills/*/SKILL.md`, `rules/workbench-tracking.md`, `rules/commit-lock.md`, `rules/fusion-workbench-conventions.md` `## Backlog entries — work items`, `bin/fusion-events`, `bin/fusion-identity`, `bin/fusion-cadence-anchor`, `docs/upgrading-to-v10-8.md`, `docs/upgrading-to-v10-14.md`.
