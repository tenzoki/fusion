# In welcher Form zitieren ausgelieferte Texte einen Workbench-Record?

---
**Domain:** code
**Status:** open
**Filed by:** coder
**Cross-references:** circles/260805-2005-textschicht-gegen-code-nachziehen/planning/260805-2353_p_plan-textschicht-gegen-code.md (Track 2, Schritt 1; Schritte 10–14 hängen an der Antwort); circles/260801-1244-guard-rules-write/issues/260805-1839_o_ausgelieferte-texte-zitieren-acht-workbench-records-die-nirgends-existieren.md; circles/260801-1244-guard-rules-write/issues/260805-1839_o_acht-zitate-tragen-verfallene-decision-marker-und-zwei-davon-sind-inhaltlich-falsch-geworden.md; rules/rule-file-provenance.md (Z. 48 — die `Binding decision:`-Zeile der Datei, die die Zitierformen selbst definiert, zitiert ihre eigene bindende Entscheidung unter einem Namen, den es nicht mehr gibt)

---

## Question

Ausgelieferte Texte (Regel-Dateien, Agenten-Prompts, READMEs, bin-Header) zitieren Workbench-Records mit vollem Dateinamen inklusive Zustandsmarker. Der Marker wandert aber per `mv` bei jedem Übergang (`_o_→_a_→_i_`), und schon der Normalfall „implementiert" bricht damit jeden Marker-tragenden Verweis. Gemessen: 16 tote Referenzen in zwei Klassen — 8 zitierte Records existieren nirgends (auch nicht unter `shared/` oder `archive/`), 8 existieren unter anderem Marker als zitiert; zwei der letzteren sind darüber hinaus inhaltlich falsch geworden. Die Frage muss jetzt beantwortet werden, weil jede Zitat-Korrektur der Batches A–C (Plan-Schritte 10–13) und die Grammatik des Referenz-Lints (Schritt 14) der gewählten Form folgen — ohne Antwort wird alles doppelt angefasst.

## Options

1. **Markerlose Wildcard-Form `YYMMDD-HHMM_*_<slug>`** — der Stern steht an der Markerstelle.
   - Pros: Übersteht jeden Marker-Übergang; als grep-/find-Muster direkt auflösbar (der Unterstrich ist in Glob und Regex inert, der `*` matcht den jeweils aktuellen Marker); eliminiert die Klasse der 8 Marker-Verfalls-Referenzen strukturell statt instanzweise; der Referenz-Lint kann die Form mechanisch gegen die Stores auflösen.
   - Cons: Das Zitat sagt nicht mehr, in welchem Zustand der Record beim Zitieren war (wo das trägt, muss der Satz es sagen); die Rationale von `rule-file-provenance.md` Form 1 (Marker-Wechsel macht eine Regel als „retirement candidate" sichtbar) entfällt und muss umgeschrieben werden; Bestandszitate müssen einmalig umgestellt werden.
2. **Voller Dateiname beibehalten, Lint erzwingt Aktualisierung** — Zitate tragen weiter den Marker; der neue Referenz-Lint (Plan-Schritt 14) schlägt bei jedem Marker-Übergang fehl, bis alle zitierenden Stellen nachgezogen sind.
   - Pros: Das Zitat bleibt exakt (Zustand zum Zitierzeitpunkt ablesbar, sofern gepflegt); keine Umstellung der Zitier-Konvention.
   - Cons: Jeder `mv` eines zitierten Records erzeugt Pflege-Arbeit an n Fundstellen; der Lint kann nur im Plugin-Repo prüfen, wo die Workbench liegt — in konsumierenden Projekten bleibt die Klasse offen; behandelt das Symptom, nicht die Ursache (der Name ist instabil by design).
3. **Markerfreie Form `YYMMDD-HHMM-<slug>`** — ohne Stern, ohne Marker; der Lint löst über die Marker hinweg auf.
   - Pros: Ebenfalls übergangs-stabil; liest sich als gewöhnlicher Name ohne Glob-Syntax.
   - Cons: Ist kein gültiger Dateiname und kein direkt verwendbares Suchmuster — jeder Leser (Mensch wie Lint) braucht die Zusatzregel „setze `_?_` zwischen Stempel und Slug ein"; kollidiert formal mit dem markerlosen Namensmuster echter Artefakte (History, Reviews: `YYMMDD-HHMM-<topic>.md`), ein Zitat ist nicht mehr von einem History-Verweis unterscheidbar.

## Constraints

- Der Referenz-Lint (Plan-Schritt 14) kann vor dieser Antwort nicht geschrieben werden: seine akzeptierte Zitier-Grammatik ist genau diese Entscheidung.
- Die gewählte Form muss den Falsifier des Lints bestehen: gegen den Vor-Korrektur-Stand angewandt muss die Grammatik alle 16 bekannten toten Referenzen finden.
- `rules/rule-file-provenance.md` definiert die Zitierformen normativ; die Antwort muss dort eingearbeitet werden (Plan-Schritt 13), inklusive einer Rationale, die Marker-Übergänge abdeckt — die bestehende deckt den `_a_→_i_`-Normalfall erkennbar nicht.
- Für die 8 nirgends existierenden Records gilt unabhängig von der Form die Regel aus Entscheidung 260805-0709 (zitiert im Befund): Beleg-Substanz in den Text ziehen, toten Pfad streichen — eine Zitierform repariert kein gelöschtes Ziel.

## Recommendation

Option (a), wie vom Gesamtreview empfohlen. Verifiziert vor dem Filing: Die 8 Marker-Verfalls-Referenzen brachen genau durch `_o_→_a_→_i_`-Übergänge, nicht aus einem anderen Grund; die Rationale in `rule-file-provenance.md` deckt diese Übergänge nicht ab — die Frage ist also richtig gerahmt. Der zweite Befund schlägt die markerlose Form selbst vor („z. B. `260801-1020_*_slug`, damit `_o_→_a_→_i_`-Übergänge Zitate nicht mehr brechen"). Option (c) scheidet aus meiner Sicht aus, weil sie mit dem Namensmuster markerloser Artefakte kollidiert; Option (b) verlagert die Instabilität in Dauerpflege und schützt konsumierende Projekte nicht.

---
Answered: <set when status moves to _a_>
Implemented: <set when status moves to _i_>
Deferred: <set when status moves to _d_>
Superseded by: <set when status moves to _s_>

---
Answered: circles/260805-2005-textschicht-gegen-code-nachziehen/history/260805-2350-orchestrator-session.md — User wählt Option (a): Wildcard-Form `YYMMDD-HHMM_*_<slug>`; überlebt jeden Marker-Übergang, Empfehlung von Review und Planner. (Gate 260806-0027)

---
Implemented: a1b7872 — hooks/lib/__tests__/reference-resolution-lint.test.ts erzwingt die Wildcard-Grammatik `YYMMDD-HHMM_*_<slug>` über alle ausgelieferten Textflächen; die Batches (9a96466, fae818b) haben die Bestandszitate umgestellt.
