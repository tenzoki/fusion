# Fusion in Kürze — eine kompakte Einführung

Fusion ist ein Claude-Code-Plugin, das eine Arbeitssitzung als Team von 15 spezialisierten Agenten fährt: ein Orchestrator verteilt, Coder, Reviewer, Planer und Analysten arbeiten, und der Mensch entscheidet an den Stellen, die zählen. Koordination läuft über Dateien im Projekt (`fusion-workbench/`), nicht über gemeinsamen Speicher. Diese Seite ist der Schnelleinstieg. Die Tiefe steht in `docs/philosophy.md` (warum), `docs/working-model.md` (wie eine Sitzung abläuft) und `README.md` (Installation, Konfiguration).

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

Das serviert ein Live-Dashboard unter `http://localhost:8099`. Es liest `orchestrator-live.md` und `orchestrator-events.jsonl` und zeigt Turn-Fortschritt, Dispatches, Commits und die Schreibspur der Hooks. Optionen: `-n <N>` maximale Event-Zeilen (Standard 100), `-i <sec>` Refresh-Intervall (Standard 2). Bei mehreren Checkouts zeigt der Monitor nur die Sitzungen des eigenen Checkouts (siehe Abschnitt 8).

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
4. Arbeiten: dem Orchestrator sagen, was man will, oder `/fusion:next` fragen, welcher Circle dran ist.
5. Ideen unterwegs mit `/fusion:memo` ablegen, ohne die laufende Arbeit zu stören.
6. Fertig: `/fusion:cleanup`. Man kann weggehen; eine Frage wartet auf die Rückkehr.

### Direktmodus: einfach sagen, was man will

Dem laufenden Orchestrator die Aufgabe nennen („implementiere den Plan in planning und reviewe ihn“, „fix den fehlschlagenden Test im Parser“). Der Orchestrator klärt den Umfang, baut eine Arbeitsliste (`taskplanner`) und läuft die **Turn-Schleife**. Ist die Anfrage vage, geht sie erst durch den `shaper` (ergibt eine Spec, mit **Spec-Gate**), dann durch den `planner` (ergibt einen Plan, mit **Plan-Gate**). Ist sie klar, wird der Shaper übersprungen.

### Turn

Ein Turn ist ein Batch von Tasks. Pro Turn: Ausführer werden dispatcht (`coder` für Code, `ontocoder` für Daten/Ontologie), die Arbeit wird committet (unter dem Commit-Lock), und am Ende steht der **Kohärenz-Check** mit drei Fragen: passt die Arbeit noch zu den Annahmen (Grounding), führt sie zum Ziel (Directive), ist das Ziel noch erreichbar? Alles gut: eine Statuszeile, weiter. Etwas driftet: das **Rebalance-Gate** öffnet mit vier Optionen (Arbeit nachbessern, Ziel ändern, Annahmen ändern, begrenzt abschließen).

Die Zahl der Turns pro Sitzung ist das einzige Setting in `fusion.json`: `{"orchestrator": {"maxTurns": <n>}}`.

### Gates

Fusion ist absichtlich nicht autonom. Es hält an und fragt vor: Spec-Freigabe, Plan-Freigabe, jeder Ontologie- oder Strukturdaten-Änderung, destruktiven Operationen (löschen, Features entfernen) und bei mehrdeutigen Aufgaben. Die Antworten an den Gates sind die Steuerung.

### Circle

Ein Circle ist eine abgegrenzte Arbeitseinheit, definiert durch **Directive** (Ziel), **Grounding** (Annahmen) und **Artifact** (Ergebnis). Ein Circle ist ein *Verzeichnis* `fusion-workbench/circles/<stamp>-<slug>/` mit eigener Datei `_t_circle.md` und eigenen Unterordnern. Der Zustand steht als Buchstabe im Dateinamen des Records:

- `_a_` anticipated (erfasst, nicht begonnen)
- `_t_` active (genau einer zur Zeit; `.active-circle` zeigt darauf)
- `_c_` closed-coherent, `_b_` bounded (Ziel nicht erreichbar, das Gelernte ist das Ergebnis), `_s_` superseded, `_d_` deferred

Die letzten vier sind terminal; ein geschlossener Circle wird nie wieder geöffnet. Kleine Projekte brauchen Circles kaum: eine Anfrage an den Orchestrator ohne aktiven Circle läuft einfach ohne, und die Artefakte landen in `shared/`.

### Backlog, Memo und der Weg zum Circle

```
/fusion:memo idea: <eine Zeile>      Idee als Backlog-Eintrag ablegen (_o_)
/fusion:next                          Portfolio: playmaker rankt Circles und Backlog
/fusion:direct <Entwurf | Backlog-Pfad>   shaper schärft den Entwurf, schreibt einen _a_-Circle
/fusion:next <circle-dir>             aktiviert ihn (_a_ → _t_) und startet die Sitzung
```

`/fusion:memo` kennt drei Ziele: ein persönliches Memo (`shared/memos/memos-<user>.md`), eine Aufgabe (`task:`/`todo:` nach `tasks-<user>.md`) oder eine Idee (`idea:`/`idee:`/`backlog:` als eigene Datei in `shared/backlog/`). Kein Agent legt Backlog-Einträge an; das ist Sache des Menschen. Der `playmaker` rankt sie und benennt einen Eintrag eigenständig von `_o_` nach `_p_` (empfohlen) um; teilen, zusammenlegen, schließen und verschieben tut er nur mit Bestätigung.

### Issues und Decisions

Faustregel: „geh es fixen“ ist ein **Issue** (`issues/`, Marker `_o_` offen, `_p_` in Arbeit, `_c_` geschlossen, `_d_` verschoben). „Entscheiden und festhalten“ ist eine **Decision** (`decisions/`, Marker `_o_` offen, `_a_` beantwortet, `_i_` umgesetzt, `_d_` verschoben, `_s_` abgelöst). Reviewer (`coderev`, `ontorev`) legen ihre Befunde als Issues ab; der Orchestrator legt bei Sitzungsende Issues für offene Tasks an.

## 5. Abschluss von Turn, Circle und Sitzung

**Turn-Ende:** Commit, Kohärenz-Check, weiter oder Rebalance-Gate (Abschnitt 4).

**Circle-Ende:** Ein Circle kann mehrere Sitzungen dauern; Sitzungsende und Circle-Ende sind zwei verschiedene Dinge. Wenn die Arbeitsliste des Circles leer ist, läuft die Abschlussprüfung. Der `reconciler` gleicht die Tracking-Dateien mit dem Code ab. Seit v10.14 laufen die Reviewer **einmal pro Circle, beim Abschluss**, über alle Commits, die noch kein Review abgedeckt hat (`bin/fusion-review-coverage`). Der Orchestrator liest die Klauseln aus `## Where this Circle stops` des Plans vor und fragt, ob jede hält. Dann geht der Record auf `_c_` oder `_b_`, `.active-circle` wird gelöscht und der `playmaker` regeneriert das Portfolio.

**Sitzungsende:**

```
/fusion:cleanup
```

Eine Pipeline aus acht Schritten: Issues für offene Tasks anlegen, die eigentliche Arbeit in sinnvollen Splits committen und pushen, reconcilen, archivieren (Tier 1, ohne Rückfrage), Aktivitätslog schreiben, `CLAUDE.md` mit dem `curator` abgleichen (das eine Gate; es steht absichtlich zuletzt, damit ein unbeaufsichtigter Lauf alles andere fertigstellt), die Housekeeping-Artefakte committen und pushen, Bericht. Optionen: `--dry-run`, `--no-push`, `--only <steps>`, `--skip <steps>`. Einzelne Schritte allein: `--only archive`, `--only log-activity`, `--only claude-md`.

## 6. Zeitkosten und Aufräumarbeiten

**Was Zeit kostet:**

- **Erster Setup-Lauf in einem Projekt:** legt die Workbench an, kopiert Assets, erzeugt Identität und Marker. Spätere Setups sind idempotent (bestehende Profile werden nicht überschrieben; der Marker wird nur bei Versionswechsel neu geschrieben).
- **Erstes `/fusion:cleanup` in einem Checkout:** ohne Anker in `fusion-workbench/.cadence-anchors` läuft der Reconciler über die ganze Workbench. Ab dem zweiten Lauf ist Cleanup inkrementell (v10.8.1): der Reconciler wird übersprungen, wenn seit dem letzten Lauf nichts im Tracking-Korpus geändert wurde, und der Curator prüft nur die Evidenz seit seinem letzten Durchgang (`--full` erzwingt den vollen Lauf).
- **Die Regel-Last pro Dispatch:** jeder Agent lädt bei seinem Setup den immer geladenen Regelsatz plus das Chat-Stilprofil des Projekts (`bin/fusion-rules <agent>`), aktuell rund 66 KB für einen Coder-Dispatch. Das ist der Preis, den man bei jedem Sub-Agenten zahlt; darum sind Regeln bewusst knapp und teils nur an die Agenten emittiert, die sie brauchen.
- **Review beim Circle-Abschluss:** ein Durchlauf über alle nicht abgedeckten Commits; bei einem Circle über mehrere Sitzungen entsprechend länger.
- **Curator-Gate in Cleanup:** wartet auf eine Antwort; alles davor läuft ohne Aufsicht durch.

**Aufräumarbeiten, die dazugehören:**

- **Archivierung:** `/fusion:cleanup --only archive` (oder Step 4 der Pipeline) verschiebt terminale Circles und terminale Marker aus `shared/` nach `fusion-workbench/archive/` und rollt das Guard-Event-Log unter datiertem Namen dorthin. Tier 2 nimmt gealterte Reviews dazu, Tier 3 gealterte History (Standardalter 14 Tage, z. B. `tier-3 21d`). Archivieren verschiebt, löscht nie.
- **`/fusion:cadence`:** liest Aktivitätslog, Session-Histories und git und schreibt eine Übersicht (gestern, letzte 7 Tage, wiederkehrende Themen) nach `shared/memos/cadence-<user>.md`. Wer das zugrundeliegende Log frisch will, lässt vorher `/fusion:cleanup --only log-activity` laufen.

Ein Hinweis zur Einordnung, als Beobachtung und nicht als Messung dieses Dokuments: die Buchhaltung (Setup, Reconcile, Reviews, Cleanup) macht einen großen Teil der Sitzungszeit aus. Die inkrementellen Mechanismen seit v10.8.1 sind die Antwort darauf.

## 7. Die Workbench: Circle vs. shared

```
fusion-workbench/
├── circles/<stamp>-<slug>/     # ein Verzeichnis je Arbeitseinheit, Name stabil
│   ├── _t_circle.md            #   der Record, trägt den Zustandsmarker
│   ├── planning/ issues/ decisions/ history/ reviews/ analyses/
├── shared/                     # alles ohne Circle-Zugehörigkeit
│   ├── planning/ issues/ decisions/ history/ reviews/ analyses/
│   ├── investigations/ consult/ memos/ backlog/     # nur in shared
├── archive/                    # Ziel der Archivierung
├── stilwerk/                   # die vier Stilprofile (projektlokal editierbar)
├── portfolio.md                # vom playmaker regeneriert
├── .active-circle              # Zeiger auf den aktiven Circle
└── agentstate.yaml, orchestrator-live.md, orchestrator-events.jsonl,
    .guard-state/, .commit-lock/, .session-marker, .checkout-id,
    .cadence-anchors, .fusion-setup, .asset-provenance, monitor
```

**Origin Rule:** ein Artefakt gehört zu dem Circle, dessen Directive es verursacht hat. Ohne aktiven Circle landet es in `shared/`. Querbezüge werden zitiert, nicht durch Ablage abgebildet. Agenten schreiben keine Pfade fest; sie lösen sie zur Laufzeit über `bin/fusion-paths <agent>` auf.

## 8. Mehrere Personen, gemeinsame Workbench, und die Rolle von git

**Git ist der einzige Transport.** Zwei Personen arbeiten in zwei Clones, und zwei Clones teilen genau das, was git zwischen ihnen trägt: kein gemeinsames Dateisystem, kein Server. Deshalb gilt: **wer zu mehreren arbeitet, trackt die Workbench in git.** Eine ungetrackte Workbench ist eine private Notizsammlung je Rechner; die Circle-Records, Decisions, Issues und Pläne wären dann keine gemeinsame Fläche mehr. Fusion liefert keine `.gitignore`-Regel dafür; ein Einzelner darf ignorieren, ein Team muss tracken.

**Nicht alles wird getrackt.** `rules/workbench-tracking.md` teilt jeden Eintrag der Workbench in vier Klassen:

| Klasse | Einträge | git |
|---|---|---|
| R1 viele Dateien, je ein Schreiber | `circles/`, `shared/`, `archive/`, `stilwerk/` | tracken |
| R2 eine Datei, viele Anhänger | `orchestrator-events.jsonl` | tracken, mit `merge=union` |
| R3 einmal geschrieben | `.fusion-setup`, `.asset-provenance` | tracken |
| L bleibt im Checkout | `agentstate.yaml`, `orchestrator-live.md`, `.session-marker`, `.active-circle`, `.checkout-id`, `.cadence-anchors`, `.commit-lock/`, `.guard-state/`, `monitor`, `portfolio.md` | ignorieren |

Klasse L beschreibt *jetzt* (Sitzungszustand) oder *dieses Checkout* (`.checkout-id`, `.cadence-anchors`) und würde im Diff nur rauschen oder, aus einem fremden Checkout gezogen, lügen. Dieses Repository wendet genau diese Partition an; seine `.gitignore` ist die Vorlage für eine eigene.

**Das Event-Log braucht einen Merge-Treiber.** `orchestrator-events.jsonl` ist die eine Datei, an die jedes Checkout anhängt. Git's Standard-Textmerge macht daraus einen Konflikt. Die Lösung ist eine Zeile in `.gitattributes` im Projekt-Root:

```
fusion-workbench/orchestrator-events.jsonl merge=union
```

`/fusion:setup` Schritt 0h fragt git (`git check-attr`), ob ein Treiber gilt, und schreibt die Zeile nur, wenn keiner gilt. Der Preis: nach einem Merge steht die Datei nicht mehr chronologisch. Jede Zeile trägt seit v10.8 `person`, `checkout` und `session_id`, und jeder Leser filtert erst nach Checkout und sortiert dann nach `ts`.

**Identität.** `bin/fusion-identity` liest die Person aus `git config user.name/user.email` (nie geschrieben) und prägt beim ersten Aufruf eine Checkout-Kennung in `fusion-workbench/.checkout-id`. Fehlen `user.name` oder `user.email` in einem git-Arbeitsbaum, hält der Agent an: ohne Identität wird nichts abgelegt. Außerhalb eines git-Arbeitsbaums ist keine Identität geschuldet; der Record trägt dann nur den Agenten.

**Wer arbeitet gerade woran.** Setup Schritt 0c warnt vor einer zweiten Orchestrator-Sitzung auf demselben Checkout (`.session-marker`, Heartbeat vom PostToolUse-Hook, `running` bis 10 Minuten, danach `stale`). Für andere Checkouts meldet `bin/fusion-events presence` bei Setup, welche anderen Personen und weiteren eigenen Checkouts im Fenster (Standard 7 Tage) eine Sitzung gestartet haben und auf welchem Circle. Der Blick reicht nur so weit wie der letzte Pull (`scope=pulled`): eine Sitzung, die seit dem letzten Fetch anderswo begann, ist unsichtbar, nicht abwesend.

**Ein Circle sagt, wer ihn fährt.** Der Circle-Record trägt ein Feld `**Claim:**`: `Unclaimed` oder `Claimed <stamp>: <person>, checkout <id>.` Es wird beim Aktivieren (`_a_ → _t_`) geschrieben und beim Verlassen von `_t_` zurückgesetzt. Ein Clone, der mitten in einem Circle gezogen wird, hat den `_t_`-Record, aber keinen `.active-circle`-Zeiger (Klasse L). Setup Schritt 0i erkennt das, nennt den Halter des Claims und bietet an, den Circle hier zu aktivieren oder inaktiv zu lassen. Aktivieren zwei Personen denselben Circle, bevor die jeweils andere Aktivierung gepullt wurde, kollidiert der Record beim Merge; wer den Merge verliert, sieht den fremden Claim und wählt einen anderen Circle.

**Der Commit-Lock** (`bin/fusion-commit-lock`) ist ein Mutex um `git add` + `git commit` *innerhalb eines Checkouts*: er schützt den git-Index vor parallelen Agenten derselben Sitzung. Zwischen Checkouts gibt es keinen Lock, und das ist Absicht: dort gilt die normale Git-Disziplin, pullen, mergen, pushen.

**Praktisch heißt das für ein Team:**

1. Workbench tracken, `.gitignore` nach der Vier-Klassen-Partition, `.gitattributes` mit `merge=union` (Setup schreibt sie).
2. `git config user.name` und `user.email` in jedem Checkout gesetzt.
3. Vor Sitzungsbeginn pullen, damit Presence und Claims aktuell sind; `/fusion:cleanup` pusht am Ende.
4. Im Projekt ist ein Circle aktiv. Wer ihn in einem zweiten Checkout aufnimmt, überschreibt bewusst den Claim; mehrere `_t_`-Records meldet Setup als `MULTIPLE-ACTIVE` und verweist auf `/fusion:next`.
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
| `/fusion:cleanup` | Sitzungsende, Pipeline mit einem Gate |
| `/fusion:cadence` | Was ist passiert (gestern, 7 Tage, wiederkehrend) |
| `/fusion:next` | Portfolio-Briefing, Circle aktivieren |
| `/fusion:direct <Entwurf>` | Directive erfassen, `_a_`-Circle anlegen |
| `/fusion:memo` | Memo, Aufgabe oder Idee ablegen |
| `/fusion:help [topic]` | Selbstauskunft |
| `/fusion:commit` | Commit mit generierter Nachricht, unter dem Lock |
| `/fusion:migrate` | Alte Workbench-Layouts auf das aktuelle Format bringen |

Quellen: `README.md`, `docs/working-model.md`, `skills/*/SKILL.md`, `rules/workbench-tracking.md`, `rules/commit-lock.md`, `rules/circle-records.md` `### The claim field`, `bin/fusion-events`, `bin/fusion-identity`, `bin/fusion-cadence-anchor`, `docs/upgrading-to-v10-8.md`, `docs/upgrading-to-v10-14.md`.
