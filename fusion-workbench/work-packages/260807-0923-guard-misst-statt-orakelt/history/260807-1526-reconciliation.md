# Reconciliation — Abschluss-Pass zum Circle `260807-0923-guard-misst-statt-orakelt`

**Datum:** 2026-08-07 15:26
**Domain:** code
**HEAD:** `e684eae` (Tag `v6.0.0`), Sitzungsanker `bf48802`
**Ausgelöst durch:** Orchestrator, Phase 3, nach Auslieferung von v6.0.0
**Kohärenzurteil:** `review-needed` — angehängt an `260806-2158-orchestrator-session.md`, Abschnitt `## Coherence`

---

## Was der Nutzer wissen muss

Die Umsetzung ist vollständig und stimmt mit dem Plan überein. Alle elf Schritte sind am Baum
nachgeprüft, nicht der Statuszeile geglaubt, und die Suite ist in diesem Pass neu gefahren:
**1002 Tests in 30 Dateien, alle grün**.

Drei Dinge stehen noch an, keines davon blockiert den Abschluss:

1. **Der Circle-Datensatz ist leer, wo er tragen müsste** — `## Turn log` und `## Closure note`
   sind unbeschrieben, `**Active spec/plan:**` sagt „(noch keiner)". Das gehört dem Orchestrator,
   nicht dem Reconciler.
2. **Die Warteschlange nennt den abgelösten Circle** und beschreibt Arbeit, die es nicht mehr gibt.
3. **Ein sachlicher Befund ist stärker geworden statt schwächer** — dazu unten Abschnitt IV.

## I. Umfang

| Speicher | Gelesen | Geändert |
|---|---|---|
| Pläne (2 Circles + `shared/`) | 5 | 2 (beide auf `_c_`) |
| Befunde (alle Circles + `shared/`) | 68 offen bei Beginn | 9 auf `_c_`, 4 mit Prüfvermerk ergänzt, 2 neu |
| Entscheidungssätze | 13 | 1 auf `_i_`, 1 mit Prüfvermerk, 1 neu |
| Reviews | 8 | 2 mit Anmerkung |
| Protokolle | 15 | 1 (`## Coherence` angehängt) |

## II. Die vier Fragen des Auftrags

### 1. Stimmen die Marker?

**Der abgelöste Circle trägt `_s_`, der aktive `_t_`** — beides stimmt.
`260804-1205-shell-reachability-model` und
`260807-0923-guard-misst-statt-orakelt`, `.active-circle` zeigt auf den
zweiten.

**Der Entscheidungssatz `260807-0825_*_should-the-guard-predict-shell-writes-or-enforce-them.md` steht auf `_i_`** — stimmt, mit einer
Implementierungsnotiz, die fünf Commits einzeln benennt und die beiden Randbedingungen der
Antwort ausdrücklich abhakt.

**Die im Plan genannten drei Befunde tragen `_c_`** — stimmt. `260807-0251_*_the-corpus-cannot-generate-the-operand-shape-where-the-worst-holes-were-measured.md`, `260807-0252_*_joinerfacts-claims-a-pessimism-for-the-pipe-row-that-the-row-itself-does-not-carry.md` und
`260807-0930_*_zwei-fehlalarme-des-klassifizierers-in-der-sitzung-die-ihn-abschafft.md`, jeder mit einer Belegzeile, die am Baum nachgeprüfte Löschungen zitiert.

**Zwei Marker standen falsch, beide korrigiert:**

- Der **Plan** `260807-0931` trug `_o_`, obwohl alle elf Schritte `[DONE]` sind. Auf `_c_`,
  `**Status:** Complete`, mit einer Schritt-für-Schritt-Prüftabelle gegen den Baum.
- Der **Entscheidungssatz** `260807-1026_*_verlust-des-bash-halts-auf-der-shell` trug `_a_`,
  obwohl seine eigene `Answered:`-Zeile die Umsetzung beschrieb. Auf `_i_`, mit
  `Implemented: ba7ccda` und drei nachgeprüften Belegen: der Commit, der `mutation.mutates`
  entfernte, die Notiz an der Stelle im Quelltext, und die beiden Testfälle in
  `hooks/lib/__tests__/protected-snapshot-integration.test.ts:481` und `:507`.

**Befunde, die offen standen, obwohl ihr Gegenstand verschwunden ist: neun gefunden, neun
geschlossen.** Sie lagen sämtlich in den beiden bereits abgeschlossenen Guard-Circles und waren
deshalb aus dem aktiven Circle heraus nicht sichtbar. Jeder ist gegen HEAD geprüft, nicht aus dem
Dateinamen geschlossen:

| Befund | Gegenstand | Prüfung |
|---|---|---|
| `260801-1904_*_four-classifier-behaviours-are-deletable-with-a-green-suite.md` (guard-bash-inspection) | vier untestbare Verhalten | alle vier in `bash-mutation-guard.ts`, mit `ba7ccda` gelöscht |
| `260804-0839_*_the-flat-joiner-model-ignores-shell-precedence-so-a-pipeline-and-an-if-body-degrade-a-cd-the-shell-guarantees.md` | das flache Joiner-Modell | Datei gelöscht; `SegmentJoiner` in `shell-parse.ts` nicht mehr vorhanden |
| `260804-1027_*_the-replacement-audit-recipe-went-stale-in-the-turn-after-it-was-written-and-omits-moved.md` | `unmodelled`-Docstring | Datei gelöscht; `unmodelled` nur noch in `rules-write-exemption.ts:94`, anderer Gegenstand |
| `260804-1221_*_the-one-fact-about-a-joiner-guarantee-is-asserted-over-one-file-and-a-second-file-already-holds-the-same-fact.md` | `JoinerFacts` an zwei Orten | beide Orte gelöscht bzw. zurückgeschnitten |
| `260804-1222_*_the-segmentjoiner-docstring-says-both-shapes-are-open-and-cites-the-decision-by-a-filename-that-no-longer-exists.md` | `SegmentJoiner`-Docstring | Symbol nicht mehr vorhanden |
| `260804-1332_*_git-work-tree-in-the-environment-relocates-the-write-and-the-classifier-reads-no-variable.md` | `GIT_WORK_TREE=` ungelesen | Erkenner gelöscht; die Messung sieht die Datei nach der Änderung, gleich auf welchem Weg |
| `260804-1350_*_the-dirstack-docstring-claims-the-compiler-enforces-a-depth-invariant-it-does-not-enforce.md` | `DirStack`-Docstring | Symbol nicht mehr vorhanden |
| `260804-1351_*_dir-builtins-carries-a-shell-dependent-fact-about-chdir-justified-by-the-wrong-reason.md` | `DIR_BUILTINS` | Symbol nicht mehr vorhanden |
| `260805-1830` (17 Fehlalarme) | die Fail-Closed-Regel | `guardBashCommand` hat noch zwei Ausgänge, beide zur Branch-Politik |

Der letzte ist der einzige mit einer Besonderheit: er war kein Defekt, sondern die Messung, auf
der der Mechanismuswechsel ruht. Die Schließnotiz sagt ausdrücklich, dass er geschlossen wird,
weil sein Gegenstand verschwunden ist, und nicht weil die Zahlen widerlegt wären — sie stehen
weiter in der Entscheidung und im Grounding des aktiven Circles.

**Ein zehnter Kandidat war eine Teilmenge und bleibt offen**, siehe Abschnitt IV.

**Ein elfter Kandidat sah so aus und war es nicht:** `260804-0842_*_the-git-gold-fixture-carries-no-double-pipe-pipe-or-ampersand-joiner-and-no-allow-only-row.md` (die git-Goldfixture trägt
keine `||`/`|`/`&`-Verbindung). Die Fixture `hooks/lib/__tests__/fixtures/git-verdicts-head.json`
liegt unverändert da, 144 kB, Datum 4. August. Die Branch-Politik war vom Rückbau ausgenommen und
ist es geblieben. Der Befund ist zu Recht offen.

**Ein Plan stand ebenfalls falsch:** `260806-2353_*_plan-shell-reachability-model.md`
war weiter `_o_`, obwohl seine Schritte 3 bis 11 den mit `ba7ccda` gelöschten Klassifizierer
bearbeiten. Auf `_c_` mit `**Status:** Superseded`. Das Planungs-Vokabular kennt keinen
Ablösungs-Marker; das Wort steht deshalb im Statuskopf.

### 2. Was steht noch offen, und zu Recht?

**Die drei bekannten sind alle geprüft und stehen zu Recht.** Dazu kommt ein vierter.

| Offener Punkt | Ort | Prüfung |
|---|---|---|
| Integrität des Eskalationsspeichers | `circles/260807-0923-.../decisions/260807-0945_o_*` | `.guard-state/**` steht nicht mehr in `guard.protectedPaths`; keine der vier Optionen gebaut. Der Verzicht ist seit `ba7ccda` sogar größer, weil ein Halt die Shell gar nicht mehr blockiert. |
| Reichweite der Regel-Ausnahme | `circles/260807-0923-.../issues/260807-1427_o_*` | Die Textkorrektur ist erfolgt, die Messung nicht. Kein Protokoll nennt einen Lauf mit `rm -rf rules` im Fremdprojekt; die Suite prüft die Ausnahme ausschließlich über einzelne Dateipfade. |
| Sprachbruch `de` gegen englischen Regelkorpus | **war nirgends abgelegt** | Neu abgelegt als `260807-1515_*_wie-weit-reicht-die-projektsprache-in-den-regelkorpus.md` |
| **Vierter, nicht genannt:** ontocoder bekommt kein `OUT_DECISION` | `circles/260807-0923-.../issues/260807-0952_o_*` | Nachgemessen: `bin/fusion-paths ontocoder` gibt acht Zeilen aus, `OUT_DECISION` ist nicht darunter. Zehn der sechzehn Agenten-Prompts nennen den Schlüssel nicht. |

Zum Sprachbruch: er war **nicht** abgelegt, und die Prüfung hat ihn zugleich präzisiert. Nach dem
Buchstaben von `rules/fusion-workbench-conventions.md` `## Project language` gibt es gar keinen
Bruch — die Deklaration steuert nur die stilometrischen Profile, und `bin/fusion-rules` ist ihr
einziger Leser. Beobachtbar ist er trotzdem an drei Stellen, die keine Regel abdeckt: die
Doppelrolle dieses Repositories (Quelle des ausgelieferten Regeltexts **und** `de`-Projekt), vier
zweisprachige Regeldateien, und die Aussage über die Sprache *aller* Kopf-Label, die nur als
Nebensatz im MECE-Abschnitt existiert. Als Entscheidungssatz abgelegt statt als Defekt, weil es
eine Festlegung braucht und keine Reparatur.

### 3. Steht ein taskplanner-Lauf an?

**Ja, aber nicht wegen dieses Circles — und die Queue wäre nach dem Abschluss nicht leer.**

`tasklist.md` ist am 260807-00:02 gegen den **abgelösten** Circle erzeugt worden. Ihr Kopf nennt
`260804-1205-shell-reachability-model` als aktiv und dessen Plan als Quelle. Die elf
Einträge des Abschnitts A beschreiben Arbeit, die nicht unerledigt, sondern **nicht mehr zu tun**
ist.

Die Queue wäre nach dem Abschluss aber nicht leer. Gezählt nach diesem Pass:

- **23 offene Befunde** in `shared/issues/` (einer davon neu aus diesem Pass),
- **16 offene Befunde** in bereits geschlossenen Circles, davon zehn im Circle
  `260801-1244-guard-rules-write`,
- **2 offene Befunde** im aktiven Circle,
- **4 offene Entscheidungssätze** und **2 beantwortete, aber nicht umgesetzte** über alle Speicher.

Das ist der Vorrat, aus dem der nächste Circle geschöpft wird. Ein taskplanner-Lauf lohnt also —
aber sinnvollerweise **erst nach** dem Circle-Abschluss und der nächsten Aktivierung, weil die
Reihenfolge sonst wieder gegen einen Circle gebaut wird, der nicht mehr der aktive ist.

Die wiederkehrende Ursache ist als eigener Befund abgelegt:
`260807-1515_*_die-warteschlange-veraltet-wieder-weil-nur-die-neuerzeugung-gebaut-wurde-nicht-die-vorbeugung.md`.
Der Vorgängerbefund `260801-2038_c_*` hatte diesen Nachfolger in seiner eigenen Abschlussnotiz
ausdrücklich angefordert. Neu gemessen ist dabei ein zweiter Weg in denselben Zustand, den der
Vorgänger nicht kannte: hier wurde der aktive Circle **abgelöst** (`_t_ → _s_`), nicht
abgeschlossen — und die vorgeschlagene Vorbeugung „löschen bei `_t_ → _c_/_b_`" hätte für diesen
Übergang kein Ereignis gehabt. Eine Kopplung an `.active-circle` statt an eine Marker-Liste deckt
beide Wege ab.

### 4. Lösen die Verweise zwischen den Circles und dem Protokoll auf?

**Die Verweise lösen auf. Die Inhalte, auf die sie zeigen, stimmen teilweise nicht mehr.**

Geprüft, jeder Pfad einzeln:

- `_s_circle.md` → `260806-2158-orchestrator-session.md`: existiert. ✔
- `_t_circle.md` → dasselbe Protokoll: existiert. ✔
- `_t_circle.md` → `260804-1205-shell-reachability-model`: existiert. ✔
- `_s_circle.md` Closure note → der Nachfolge-Circle: existiert. ✔
- Elf Sitzungsprotokolle unter `circles/260807-0923-.../history/`: alle vorhanden.

**Was nicht auflöst**, und das ist die ernstere Hälfte:

`agentstate.yaml` nennt als `session.history_file`
`260807-0945-orchestrator-session.md`.
**Diese Datei existiert nicht.** Das Verzeichnis enthält elf Unteragenten-Protokolle und kein
Orchestrator-Protokoll; das tatsächliche Protokoll blieb unter dem abgelösten Circle liegen. Der
Wiederaufnahme-Anker zeigt damit ins Leere — schlechter als ein veralteter Wert.

Der Grund ist strukturell und wird wiederkommen: **nichts im Ablauf verschiebt oder gabelt das
Sitzungsprotokoll, wenn ein Circle mitten in der Sitzung abgelöst wird.** Der Anker wurde für
eine Datei geschrieben, die die Sitzung nie angelegt hat.

**Der Inhalt des Hauptprotokolls ist an drei Stellen überholt** (nur berichtet, nicht geändert —
der Reconciler darf dort ausschließlich `## Coherence` anhängen):

| Zeile | Sagt | Ist |
|---|---|---|
| `**Directive:**` | die Directive des *abgelösten* Circles | die Sitzung lief unter der Nachfolge-Directive weiter |
| `**Status:**` | „Stopped by the user mid-Turn-1. The Circle is parked, not closed" | der Circle trägt `_s_`, die Sitzung hat v6.0.0 ausgeliefert |
| `**Status:**` | „`.active-circle` still points at it" | `.active-circle` zeigt auf den Nachfolger |

## III. Die Buchführung der Sitzung ist zum dritten Mal eingefroren

Drei der vier Sitzungsflächen stehen still, im bekannten Muster. Als dritte Instanz an
`260801-2038_*_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md`
angehängt, mit der Abweichungsrechnung, die dieser Befund selbst vorschlägt:
`agentstate.yaml` sagt `commits: 0`, `git rev-list --count bf48802..HEAD` sagt `8`. Schwelle laut
Befund: „mehr als eins". Der Check kostet einen Befehl und wird von nichts in der Werkzeugkette
ausgeführt.

Nicht repariert, aus dem Grund, den der Befund selbst als Kandidat 3 nennt: der Reconciler ist
von `agentstate.yaml` und den Circle-Datensätzen ausgenommen, und eine Ausweitung setzte zwei
Schreiber auf dieselbe Fläche.

## IV. Der eine sachliche Befund, der stärker geworden ist

`260804-2100_*_from-a-subdirectory-cwd-the-protected-list-matches-nothing-while-fail-closed-still-denies.md`
hatte zwei Hälften. Die zweite ist verschwunden, die erste ist geblieben — und trägt jetzt den
gesamten Schutz.

Am Baum gelesen gegen HEAD `e684eae`:

- `hooks/guard.ts:501` — `saveSnapshot(takeSnapshot(process.cwd(), config.guard.protectedPaths))`
- `hooks/tracker.ts:272-275` — `const root = process.cwd(); takeSnapshot(root, …)`
- `enumerateProtected` (`hooks/lib/protected-snapshot.ts:198-223`) läuft von dieser Wurzel und
  prüft die Muster gegen wurzel-relative Pfade.

Läuft der Hook mit cwd in einem Unterverzeichnis, findet die Aufzählung unter `rules/**` nichts,
der Fingerabdruck ist leer, die Differenz ist leer, es wird nichts zurückgeschrieben. Vorher fiel
dieselbe Schwäche wenigstens auf die Fail-Closed-Seite zurück und verweigerte; jetzt fällt sie
auf nichts zurück.

**Die Asymmetrie ist die Ursache und sie liegt an einer Stelle.** `hooks/lib/escalation.ts` und
`hooks/lib/events.ts` importieren beide `findWorkbenchRoot` und laufen aufwärts;
`guard.ts` und `tracker.ts` nehmen für die Messwurzel `process.cwd()` ohne Aufwärtslauf.

**Beweisstand, ehrlich:** *inference*, nicht gemessen. Aus dem Quelltext abgeleitet. Der Befund
selbst hat seine Erreichbarkeit schon 260804 als „inference, not measured" ausgewiesen, und das
gilt unverändert. Gesucht und nicht gefunden: kein Fall unter
`hooks/lib/__tests__/protected-snapshot*.ts` startet aus einem Unterverzeichnis. Der einzige
Unterverzeichnis-Block der Suite (`guard-rules-write-integration.test.ts:1389`) prüft die
Konfigurationsauflösung und ausdrücklich nicht die Messung.

**Warum das die Kohärenz berührt.** Das Grounding des Circles sagt, der Schutz werde „von einer
21-Löcher-Näherung zu einer **vollständigen Aussage**". Solange die Messwurzel an cwd hängt und
niemand den Unterverzeichnis-Fall gemessen hat, ist diese Vollständigkeit nicht belegt. Das ist
die eine Stelle, an der Artefakt und Grounding auseinandergehen, und sie ist der Grund für das
Urteil `review-needed`.

---

**Nachtrag 260807-1601-coder-messwurzel-aus-dem-unterverzeichnis.md (coder): nachgemessen, Ableitung bestätigt, behoben.**

Der oben als *inference* ausgewiesene Absatz ist jetzt eine Messung. Sie fällt genauso aus, wie
er sie beschrieben hat, und sie hat eine zweite Hälfte gefunden, die er nicht hatte.

Gemessen durch die echten Hooks als Unterprozesse gegen ein echtes Fremdprojekt, cwd
`<projekt>/sub`, ausgelieferte Schutzliste. Eine Shell überschrieb `<projekt>/rules/x.md`: die
Datei blieb überschrieben, kein Rollback, kein Halt, kein `guard_block`, kein Satz an das
Modell — der Fingerabdruck trug `cwd: <projekt>/sub` und keinen Eintrag für `rules/x.md`,
während die Zustandsschreibung in `<projekt>/fusion-workbench/` landete. Genau die Asymmetrie
aus § oben, sichtbar in einem einzigen Aufruf. **Die zweite Hälfte:** aus demselben
Arbeitsverzeichnis wurde ein `sub/rules/y.md` *zurückgeschrieben* und ein Halt ausgelöst, obwohl
dieser Pfad auf der Schutzliste des Projekts unter keiner Schreibweise steht. Es fehlte also
nicht nur etwas — an seiner Stelle geschah etwas Falsches.

Behoben: die Messwurzel ist `measurementRoot()` (`hooks/lib/protected-snapshot.ts`), also
`findWorkbenchRoot()`. Die Stilllegung im Plugin-Repo musste mitziehen, sonst hätte der Guard
aus `<fusion-repo>/fusion-workbench` heraus die Arbeit eines fusion-Entwicklers
zurückgeschrieben; auch das ist gemessen, nicht angenommen. Alles vier Fälle in
`hooks/lib/__tests__/protected-snapshot-subdirectory.test.ts`.

**Was das für das Urteil bedeutet.** Die Divergenz zwischen Artefakt und Grounding, die zu
`review-needed` geführt hat, ist geschlossen. Die Vollständigkeitsaussage ruht jetzt auf einer
Messung; `rules/protected-path-discipline.md` benennt das Koordinatensystem, das es vorher gar
nicht erwähnte. Ein Rest bleibt und ist im Befund `260804-2100` festgehalten, der deswegen `_o_`
bleibt: die Vorab-Verweigerung der Schreibwerkzeuge löst weiter gegen cwd auf und lässt aus einem
Unterverzeichnis durch, was erst die Messung abfängt.

## V. Neu abgelegt

| Datei | Art |
|---|---|
| `260807-1515_*_die-warteschlange-veraltet-wieder-weil-nur-die-neuerzeugung-gebaut-wurde-nicht-die-vorbeugung.md` | Defekt — die Vorbeugung, die der Vorgängerbefund angefordert hat |
| `260807-1515_*_wie-weit-reicht-die-projektsprache-in-den-regelkorpus.md` | Offene Frage — vier Optionen, keine gewogene Empfehlung |

Beide im geteilten Speicher, nach der Herkunftsregel: neben der Arbeit dieses Circles gefunden,
von seiner Directive nicht verursacht.

## VI. Falsch abgelegt — Anmerkung ohne Handlung

`260807-0952_*_ontocoder-kann-keinen-entscheidungssatz-ablegen.md`
gehört nach der Herkunftsregel in `shared/issues/`: aufgefallen ist er in Schritt 1 dieses
Circles, verursacht hat ihn dessen Directive nicht. **Nicht verschoben** — die Regel verlangt
keine nachträgliche Umverteilung, und ein Umzug bräche die Verweise aus dem Plan und aus dem
Sitzungsprotokoll. Wer den Circle archiviert, sollte wissen, dass hier ein nicht-Circle-eigener
Befund mitwandert.

## VII. Was der Orchestrator noch tun muss

1. **Den Circle-Datensatz füllen und schließen.** `_t_circle.md` hat einen leeren `## Turn log`,
   eine leere `## Closure note` und `**Active spec/plan:** (noch keiner)`, obwohl der Plan seit
   260807-0931 existiert und vollständig ist. Danach `_t_ → _c_` und `.active-circle` löschen.
   Circle-Übergänge gehören nicht dem Reconciler.
2. **Das Kohärenzurteil `review-needed` behandeln** — Rebalance-Gate, Empfehlung „Artefakt
   nachziehen", siehe `## Coherence` in `260806-2158-orchestrator-session.md`.
3. **`tasklist.md`** entweder löschen (mit `.active-circle`) oder nach der nächsten Aktivierung
   neu erzeugen lassen. Der jetzige Inhalt ist irreführend.
4. **`agentstate.yaml`** ist eingefroren und sein `history_file` zeigt auf eine nicht existierende
   Datei. Beim sauberen Sitzungsende wird die Datei ohnehin gelöscht; falls nicht, sollte sie
   nicht als Wiederaufnahme-Anker stehen bleiben.
