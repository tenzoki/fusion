# Session: Konventionsdatei partitionieren (Plan-Schritt 4a, nachgezogen)

**Status:** Complete
**Agent:** coder
**Circle:** `circles/260801-1244-guard-rules-write`
**Plan:** `planning/260804-2356_o_plan-ausstieg-kontextsteuer-und-auslieferung.md` → Schritt 4a
**Auftrag:** Orchestrator-Dispatch, vom Nutzer am 2026-08-05 angeordnet. Der Schritt ist C9
Schritt 3 der Spec und stand ausdrücklich **nicht** im Ausstiegsplan.

---

## Ergebnis in drei Sätzen

`rules/fusion-workbench-conventions.md` geht von 51 416 auf 34 671 Byte, aufgeteilt nach
Adressat in drei Shards. **Dreizehn der sechzehn Agenten liegen jetzt unter dem
Release-Deckel von 105 354 Byte** — fünf einfache bei 89 913, fünf Diagramm-Agenten bei
95 586, `playmaker` bei 99 215, `shaper` bei 104 888; darüber bleiben
`coder`/`coderev`/`bugfixer` bei 111 810 und der `orchestrator` bei 108 465. Die
Verkettungsprüfung geht auf: von 408 nicht-leeren Zeilen ist keine verloren und keine
verdoppelt, vier fehlen und alle vier sind erklärt.

## Was gemacht wurde

### Der Schnitt

Kriterium war wie in Schritt 2 der **Adressat**, nicht Größe und nicht Thema.

| Shard | Byte | `bin/fusion-rules` emittiert an | Wer es anwendet |
|---|---|---|---|
| `rules/workbench-path-resolution.md` | 8 962 | keinen Agenten | wer einen Konsumenten-Prompt oder `bin/fusion-paths` schreibt |
| `rules/circle-records.md` | 9 302 | `orchestrator`, `playmaker`, `shaper` | wer einen Circle anlegt, überführt oder rankt |
| `rules/rule-file-provenance.md` | 5 745 | keinen Agenten | wer eine Regeldatei schreibt |

**`workbench-path-resolution.md`** nimmt aus `## Path Resolution` den `<name>`-Namensraum,
die 25-zeilige Schlüsseltabelle und `### Emission is per-consumer`. Im Kern bleibt die
operative Hälfte: der Resolver ist die einzige Auflösungsstelle, der Aufruf gehört in
Setup-Schritt 2, Signatur, Exit-Code-Tabelle, die zwei Invarianten, das Fehlverhalten. Die
Trennlinie ist scharf: ein Agent *benutzt* den Resolver und liest `KEY=value`; er *wählt*
nie einen Schlüssel, weil sein Schlüsselsatz aus seinem eigenen Prompt abgeleitet wird.
Die verschobenen 8 000 Byte sind ausnahmslos Begründungsprosa für Autoren — genau die
Kern-Referenz-Trennung, die der Auftrag dort vermutet hat.

**`circle-records.md`** nimmt `## State Markers — circles` und `## Circle record template`
samt Portfolio-Template. Die Zielgruppe ist **abgeleitet, nicht geraten**: `bin/fusion-paths`
baut jeden Schlüsselsatz durch Grep über den Prompt des Konsumenten, und genau drei Agenten
nennen einen Circle-Schlüssel — `orchestrator` (`$SCAN_CIRCLES`, `$PORTFOLIO`), `playmaker`
(`$OUT_CIRCLE`, `$SCAN_CIRCLES`, `$PORTFOLIO`), `shaper` (`$OUT_CIRCLE`, `$SCAN_CIRCLES`).
Ein Agent ohne Circle-Schlüssel kann keinen Circle überführen; für ihn ist das Vokabular
Text ohne zugehörige Handlung. Dieselbe Begründungsform wie beim Guard-Internals-Schnitt.

**`rule-file-provenance.md`** nimmt `## Provenance headers on rule files` vollständig. Kein
Agent hat das Schreiben normativen Regeltextes als Routineaufgabe; der Auslöser ist
„du legst gleich eine Datei unter `rules/` an", und den trägt der Zeiger im Kern.

### Was bewusst im Kern blieb

**Die Glob-Disziplin.** Sie lag historisch im Circles-Abschnitt, sagt aber in ihrem eigenen
Schlusssatz, dass sie „für jedes Marker-Vokabular in jedem Agent-Prompt und Skill-Body" gilt.
Sie steht jetzt als eigener Abschnitt `## Marker globs` im Kern. Der Nachweis, dass das die
richtige Zuordnung ist, kam aus der Zitatanalyse: **acht der zehn Zitate**, die auf
`## State Markers — circles` zeigten, griffen nach der Glob-Regel und nicht nach dem
Circle-Vokabular — darunter `agents/orchestrator.md:110`, das offene *Issues* zählt. Hätte
ich den Abschnitt komplett verschoben, hätten dreizehn Agenten eine Regel verloren, die für
sie geschrieben ist.

**`## State Markers — decisions` und `## Decision Record Template`.** Der Auftrag verlangte
eine Prüfung, ob wirklich alle Agenten Decisions filen. Die abgeleitete Antwort ist **nein**:
sechs von sechzehn nennen `$OUT_DECISION` (analyst, consultant, investigator, orchestrator,
reconciler, shaper). `coder`, `coderev` und `bugfixer` sind nicht darunter — sie *lesen* und
*aktualisieren* Decisions, legen aber keine an. Der Schnitt wurde trotzdem nicht gemacht,
und das ist eine Entscheidung gegen die Zahl: das Template wiegt 1 127 Byte, ein vierter
Shard kostet einen ~700-Byte-Kopf, und das Resultat wären drei Dateien (Kern,
`decision-record-examples.md`, neuer Shard), die das Decision-Thema zu je einem Drittel
definieren. Das ist die Aufsplitterung, die Randbedingung 2 des Auftrags verbietet.

### Zitate: 21 Stellen umgelenkt

Die Zählung nach Backtick-Ankern ergab 12. Es waren 21. Die neun zusätzlichen nannten die
Datei ohne unmittelbar folgenden Anker und wären bei einer reinen Ankersuche durchgerutscht:

- `agents/shaper.md:28` und `:64` — „following the Circle record template in
  `fusion-workbench-conventions.md`"
- `agents/playmaker.md:21` und `:136` — die **„Circle record template"**-Sektion und das
  Portfolio-Template an ihrem Ende
- `skills/direct/SKILL.md:81` — „Read the conventions and load the Circle record template"
- `skills/migrate/SKILL.md:94` — „per the Circle record template", ohne Datei
- `docs/working-model.md:112`, `docs/philosophy.md:50`, `README.md:148` — Umfangsaussagen,
  die nach dem Schnitt falsch geworden wären
- `README-agents.md:234` — dieselbe Klasse, beim Schlussdurchgang gefunden

Dazu zwei Zeigerstellen in `hooks/lib/__tests__/provenance-header-lint.test.ts`: der
Kopfkommentar und der Text der Fehlermeldung, die dem Leser sagt, wo die Konvention steht.

### Der Path-Literal-Lint, bewusst geregelt

Randbedingung 3 des Auftrags. Der Lint liest weiterhin nur `agents/` und `skills/`; die
Shards kommen durch, weil das Gate nicht hinsieht. Statt das der Blindstelle zu überlassen:

- `DEFINITION_SITES` in `hooks/lib/__tests__/path-literal-lint.test.ts` zählt die fünf
  Dateien auf, die einen Store definieren dürfen — inklusive
  `rules/workbench-stash-and-lock.md`, das **Schritt 4 unbemerkt als drittes
  Definitionsverzeichnis geschaffen** hat.
- Zwei Tests halten die Liste ehrlich: jeder Eintrag existiert und nennt wirklich einen
  Store (ein veralteter Eintrag fällt auf), und kein Eintrag liegt im Dateisatz des Gates
  (die „außerhalb per Konstruktion"-Behauptung ist geprüft statt behauptet).
- Was die Liste **nicht** kann: eine neue Definitionsstelle erkennen. Eine Datei, die einen
  Beispielpfad zitiert (`decision-record-examples.md`, `user-facing-output.md`,
  `protected-path-*.md`), ist formgleich mit einer, die einen Store definiert. Ein
  Formgate trennt das nicht, und ein exakter Mengenabgleich über `rules/` wäre Rauschen.
  Die Liste macht die Menge abzählbar, nicht selbstprüfend — und der Kommentar sagt das.
- `CLAUDE.md` und der Kopf der Konventionsdatei nennen dieselben fünf.

### Randbedingung 4

`rules/agent-setup.md` verweist auf `fusion-workbench-conventions.md` und auf
`## Path Resolution` → Exit codes. Der Kern behält Namen *und* Anker; der Setup-Vertrag
bleibt ohne Änderung gültig.

## Verkettungsprüfung

Multimengenvergleich über alle nicht-leeren Zeilen, Original gegen Kern + drei Shards.

- 408 nicht-leere Zeilen im Original, 368 verschieden.
- **Keine Zeile verdoppelt.** Eine einzige echte Dopplung trat beim Zwischenstand auf — die
  Überschrift `## Provenance headers on rule files` stand in Kern und Shard. Der Kern-Zeiger
  heißt jetzt `## Rule-file provenance`, der Shard behält die Originalzeile.
- **Vier Zeilen fehlen, alle vier erklärt:**
  1. Das Lede („Single source of truth for …") zählte die Themen der Datei auf. Vier sind
     ausgezogen; es hätte sonst gelogen.
  2. „**This document is the definition.** Layout, origin rule, and path resolution are
     defined here completely." — dieselbe Lage, plus die inzwischen falsche
     „exactly two places"-Aussage über Store-Literale.
  3. `### The name namespace` → im Shard `## The name namespace` (Ebenenwechsel, weil es dort
     oberster Abschnitt ist).
  4. `### Emission is per-consumer, and derived from the prompt` → dasselbe.
- 88 Zeilen hinzugekommen: drei Provenance-Header, drei Ledes, vier Zeigerblöcke, die
  Kopftabelle. Eine davon ist ein `|---|---|---|` (die neue dreispaltige Kopftabelle) — die
  einzige Zeile, deren Zähler sich erhöht hat.

## Prüfung

`npx vitest run` in `hooks/`: **27 Dateien, 1 545 Tests, grün.** 1 543 wie zuvor plus die
zwei neuen `DEFINITION_SITES`-Tests.

Golden mit `UPDATE_RULES_GOLDEN=1` bewusst neu erzeugt, Diff gelesen: `circle-records.md`
erscheint in genau drei Agentenblöcken, `workbench-path-resolution.md` und
`rule-file-provenance.md` in keinem. `CEILING` von 128 555 auf **111 810 gesenkt**, mit
Historienabsatz.

## Was mir als falsch aufgefallen ist, ohne dass ich es angefasst habe

1. **`decision-record-examples.md` (4 191 Byte) ist immer-an für alle sechzehn und nennt sich
   selbst „Optional reading; the conventions file is normative."** Eine als optional
   deklarierte Datei, die jeder Agent bei jedem Dispatch bedingungslos lädt, ist genau die
   Steuer, die dieser Circle senken soll. Ihr abgeleiteter Adressat ist enger als sechzehn:
   `$OUT_DECISION` haben sechs, `$SCAN_DECISIONS` dreizehn (nicht `bugfixer`, `conceptrev`,
   `editor`). Nicht meine Datei; der Plan klammert die kleinen Regeln aus.
2. **Der Provenance-Zitatpfad im Text zeigt auf einen Marker, der weitergewandert ist.** Der
   Abschnitt zitiert zweimal `shared/decisions/260801-1020_a_provenance-header-on-rule-files.md`;
   auf der Platte liegt `…_i_…`. Bekannt als
   `shared/issues/260802-1740_o_a-citation-path-carrying-a-state-marker-dies-on-ordinary-progress.md`.
   Der Text ist unverändert mitgewandert.
3. **Der letzte `describe`-Block in `provenance-header-lint.test.ts` prüft an der falschen
   Datei.** Seine Prämisse lautet „die Datei, die diese Konvention dokumentiert, enthält
   `Provenance:` zwangsläufig im Rumpf" — das ist seit diesem Schnitt
   `rules/rule-file-provenance.md`. Der Test läuft weiterhin grün, weil der Kern-Zeiger den
   String ebenfalls unterhalb des Zehn-Zeilen-Fensters führt; er beweist also noch, was er
   behauptet, aber am zufälligen statt am gemeinten Objekt.
4. **Der Kopfkommentar desselben Tests nennt den falschen Circle.** Er schreibt
   „`circles/260801-1244-curator` plans to partition
   `rules/fusion-workbench-conventions.md`" — der Circle heißt
   `260801-1244-rule-provenance-header`, und partitioniert hat am Ende dieser hier.
   Die Voraussicht war richtig: die Rekursion des Gates hat alle drei Shards erfasst.
5. **`hooks/config.example.json`** behauptet, „the plugin only ships
   `fusion-workbench-conventions.md`". Das war schon vor diesem Schnitt falsch (zwölf
   Regeldateien), jetzt sind es fünfzehn.

## Was der Nutzer entscheiden muss

Der Release-Deckel ist eine harte Schwelle **pro Agent**, und drei Agenten liegen darüber.
Beide Überschreitungen stammen aus Dateien, die dieser Schritt nicht besitzt:

- `coder`/`coderev`/`bugfixer` bei 111 810 (6 456 darüber) tragen als einzige
  `protected-path-internals.md` mit 21 897 Byte — das Ergebnis von Schritt 2.
- Der `orchestrator` bei 108 465 (3 111 darüber) trägt `workbench-stash-and-lock.md` (9 250)
  **und** `circle-records.md` (9 302), zusammen 18 552 Byte, weil er der Agent mit den
  meisten verschiedenen Aufgaben ist. Dass er mehr liest als andere, ist keine Anomalie.

Jedes Byte, das im Kern verblieben ist, wenden alle sechzehn an. Wer den Deckel für alle
sechzehn will, muss an `protected-path-internals.md` oder an die immer-an-Dateien heran, die
der Plan unter *Die Regeln, die klein sind* ausklammert. Schritt 6 bleibt bis dahin gesperrt.

## Geänderte Dateien

**Neu:** `rules/workbench-path-resolution.md`, `rules/circle-records.md`,
`rules/rule-file-provenance.md`

**Geändert:** `rules/fusion-workbench-conventions.md`, `bin/fusion-rules`, `CLAUDE.md`,
`README.md`, `README-agents.md`, `docs/philosophy.md`, `docs/working-model.md`,
`agents/orchestrator.md`, `agents/playmaker.md`, `agents/shaper.md`,
`skills/next/SKILL.md`, `skills/direct/SKILL.md`, `skills/archive/SKILL.md`,
`skills/cleanup/SKILL.md`, `skills/setup/SKILL.md`, `skills/migrate/SKILL.md`,
`skills/circle-stash/SKILL.md`, `hooks/lib/__tests__/path-literal-lint.test.ts`,
`hooks/lib/__tests__/provenance-header-lint.test.ts`,
`hooks/lib/__tests__/rules-emission-golden.test.ts`,
`hooks/lib/__tests__/fixtures/rules-emission.golden`,
`fusion-workbench/circles/260801-1244-guard-rules-write/planning/260804-2356_o_plan-ausstieg-kontextsteuer-und-auslieferung.md`

**Nicht committet** — der Orchestrator committet.
