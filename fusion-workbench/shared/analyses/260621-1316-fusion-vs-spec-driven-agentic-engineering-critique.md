# fusion vs. Spec-Driven / Agentic Engineering — kritische Prozess-Analyse

**Erstellt:** 2026-06-21
**Typ:** Comparative / critique analysis
**Auslöser:** Martins Report „fusion vs. Spec-Driven / Agentic Engineering" (2026-06-20) plus zwei Methodik-Artikel von @pramodchandrayan (Predict/Medium). Aufgabe: Annahmen, Behauptungen und Empfehlungen kritisch prüfen.
**Status:** Abgeschlossen (v2 — auf Basis der Artikel-Volltexte)

---

## Quellen

1. **SDD** — *Spec-Driven Development with AI Coding Agents: The Definitive Guide* (@pramodchandrayan, Predict/Medium, 2026-05-03). Volltext vorliegend.
2. **Beyond-SDD** — *Beyond Spec-Driven Development: The Agentic Engineering Playbook* (@pramodchandrayan, Predict/Medium, 2026-05-31). Volltext vorliegend.
3. **Martins Report** (2026-06-20) — interner Abgleich des fusion-Prozesses gegen (1) und (2).
4. fusion-Faktenbasis: `agents/orchestrator.md`, `CLAUDE.md` (fusion-Plugin + UNITE-Projekt), Agent-Beschreibungen — direkt verifizierbar.

## Verifikationsstatus (Ehrlichkeits-Klausel)

- **Verifiziert** gegen fusion-Quellen: Coherence Gate (3 Kanten), Rebalance Gate (4 Auswege), Bounded Closure, serieller Turn-Loop, Commit-Lock-Begründung, Mermaid in Phase 4, Human Gates, coderev/ontorev-„fixen-nie", decisions-Lifecycle, Event-Log-Schema (ts/event/turn/task/agent/detail — **kein** Token-/Modell-Feld).
- **Verifiziert** gegen die Artikel: Reifegrad-Leiter (Level 1–3), Verifier-Definition (§4.2), Diagramm-Doktrin (Part V), L1–L5 (Beyond-SDD), Orchestrator-Code mit `conflicts_with`, Spec-Template mit messbaren Kriterien, ROI-Metriken (§7.3).
- **Nicht verifizierbar:** empirische Außenbehauptungen der Artikel (Stripe „1.000 PRs/Woche", „Team 3 = 12", die 40–60%-Rework-Zahlen). Diese werden als *Behauptungen der Artikel* behandelt, nicht als Fakten.
- **Eingebauter Bias:** Martins Report wurde aus fusion heraus geschrieben und stellt fusion günstig dar (Home-Team-Drall).

## Analytische Vorgeschichte (zwei Selbstkorrekturen)

Eine erste Fassung dieser Kritik (ohne Artikel-Volltexte) enthielt zwei Fehler, die mit den Originalen korrigiert wurden — hier dokumentiert, weil die Korrektur selbst Teil des Befunds ist:

1. **Adversarial Verifier.** Zunächst als „Kategorienfehler" kritisiert (mit importierter spieltheoretischer Definition). Falsch: SDD §4.2 setzt die Latte niedriger — *separater* Agent + *Fehler-Finden*-Orientierung statt Selbst-Review. coderev/ontorev erfüllen das. **Martins Mapping ist korrekt; die Kritik war es nicht.**
2. **ASCII vs. Mermaid.** Zunächst wurde ASCII-upstream als richtiges Kontrollformat verteidigt. Mit SDD Part V umgedreht: die Forcing-Function hängt am Auto-Layout deklarierter Relationen, das ASCII nicht leisten kann (Details §6).

---

## 1. Zentraler Einwand: Feature-Inventar statt Outcome

Martins Report vergleicht durchgehend **Mechanik gegen Mechanik** und nennt für fusion **keine** der Wirkungs-Metriken, die *beide Artikel selbst liefern*:

- SDD §7.3 „Measuring SDD ROI": time-to-production, rework %, context-recovery time, defect escape rate.
- Beyond-SDD L1-Template: context recall >0.85, faithfulness >0.90, cost/query <$0.15, latency p95 <2s, plus Failure-Signals.

Damit sind die Artikel an dieser Stelle **outcome-orientierter** als der fusion-Vergleich. „fusion *hat* einen Coherence Gate" bleibt eine Feature-Aussage, solange niemand misst, wie oft der Gate zu etwas anderem als „Continue" geführt hat. Für UNITE sind die Metriken nicht abstrakt: `faithfulness` / `context recall` mappen direkt auf die READER-„no-bytes-lost"-Doktrin und die Citation-Trace-Anforderungen — anwendbar, aber nicht angewandt.

## 2. „Über Level 2" ist ein Kategorienfehler

Die Reifegrad-Leiter misst genau **eine** Achse: Spec-Zentralität.

- **Level 1 (Spec-First):** Spec als *temporäres* Artefakt, danach weggelegt (~60% des Werts).
- **Level 2 (Spec-Anchored, empfohlen):** Spec = gleichberechtigter, *dauerhaft gepflegter* Partner zum Code.
- **Level 3 (Spec-as-Source, experimentell):** Spec ist das *einzige* primäre Artefakt; Code = kompilierter Output, nie von Hand geändert.

fusion ehrlich einsortiert: Shaper-Specs sind **Zeitpunkt-Dokumente** (zu einem Topic entstehen nacheinander mehrere Doks). Das ist auf dieser Achse die **Level-1-Definition** („treated as a temporary artifact"). fusion ist sicher **nicht Level 3** (Code ist das reale, committete Artefakt). Folglich:

> Auf der Achse, die die Leiter misst, ist fusion eher **Level 1 mit umverteilter Living-Funktion** (decisions/ + reconciler statt einer lebenden SPEC.md) — nicht „über Level 2".

Das ist **keine** Abwertung. fusions echte Stärken (Coherence/Rebalance/Bounded Closure/playmaker) liegen auf Achsen, die diese Leiter gar nicht misst (Orchestrierungs-Kohärenz, Drift-Behandlung). Man steht auf einer Spec-Zentralitäts-Leiter nicht höher, indem man auf einer anderen Achse stark ist. Korrekte Aussage: **fusion ist orthogonal zur Leiter — voraus bei dem, was die Artikel kaum abdecken, und Level-1-nah bei dem, was die Leiter rankt.**

## 3. Die „1:1"-Tabelle: L5 ist die größte Überzeichnung (+ neuer Befund)

Beyond-SDD L5 hat drei Bestandteile: (1) jeder Task → strukturierter Trace, (2) jeder Output *gegen die Spec* evaluiert (nicht nur Tests), (3) jede Session fließt in die Rules zurück. Der Trace (AgentTrace) enthält explizit `model_version` und `tokens_consumed`.

Abgleich:
- (1) Trace: fusion hat `orchestrator-events.jsonl`, aber **ohne Modell-Version und ohne Token-/Kostenzählung**. **Neuer Befund (von Martin übersehen):** fusions Observability ist reich beim *Fluss*, dünn bei *Kosten/Modell-Accounting*. Für UNITE relevant (`cost/query` ist Spec-Kriterium).
- (2) Eval *gegen die Spec*: nur teilweise (coderev/reconciler prüfen gegen Rules/Plan/Realität, nicht gegen *messbare* Kriterien) → Gap 5.3.
- (3) Feedback → Rules: ad hoc → Gap 5.5.

**Zwei-von-drei L5-Bestandteilen sind partiell/fehlen, der Trace ist gröber als das Ideal.** „1:1" ist hier am stärksten überzeichnet. L1 ebenso (vgl. §2): die Tabelle behauptet 1:1 für L1, §3 des Reports gibt die Living-Spec-Lücke dort selbst zu — interne Inkonsistenz.

## 4. „fusion ist voraus" — revidiert

| Claim | Urteil |
|---|---|
| Coherence/Rebalance Gate > „update the spec now" | Hält als Design; Wirkung unbelegt (§1). |
| **Bounded Closure** | **Stärkster Punkt** — kein Pendant in beiden Texten. Hält voll. |
| Reconciler statt Disziplin-Appell | Hält — aber SDD §2.2 will Updates *sofort*; fusions Reconciler ist *periodisch*. fusion tauscht Sofortigkeit gegen Automatisierung. Verteidigbar, kein reiner Gewinn. |
| coderev/ontorev = adversarial verifier | Hält (Kritik zurückgenommen, s. Selbstkorrektur 1). |
| Circle-Portfolio + playmaker | Halb — Ebene höher als beide Artikel, aber überlappt mit Linear/Plane. |
| L3 Codified Rules „voraus" | Achsen-Verwechslung: fusion filtert *pro Agent-Rolle* (Artikel nicht); Artikel kaskadiert *pro Ort* bis `src/auth/.ai-rules.md` (fusion nicht — keine Verzeichnis-Granularität). Verschieden, nicht voraus. |

## 5. Die Gaps — mit Artikel-Belegen, neu gewichtet

### 5.1 Worktrees — der Artikel-Code widerlegt „Infra ist da, also billig"
Der `AgenticOrchestrator` (Beyond-SDD L2) hat ein `verify()` mit `conflicts_with(result, results)` — **Konflikterkennung zwischen parallelen Modulen.** Genau dieses Teil fehlt fusion: der per-Turn Coherence Gate und der Reconciler sind für eine **lineare Erzählung** gebaut (turn-start-HEAD-Anker, sequenzielle Commits, ein aktiver Circle), nicht für „N parallele Module reconcilen". Der Artikel selbst zeigt das fehlende Stück.

Entkräftung der Throughput-Rhetorik (jetzt belegbar):
- „Team von 3 = 12" steht unter **„What Comes Next → Near-certain"** — eine **Prognose, kein Ergebnis.** Martin importiert einen Forecast als Evidenz.
- „Stripe → 1.000 PRs/Woche" ohne Inline-Citation und ohne Nenner — rhetorisch geladen, analytisch leer.
- Der Artikel nennt als Worktree-Nutzen „race-prevention + reviewable output" — **beides hat fusion schon** (Commit-Lock; serielles Review). Worktrees fügen für fusion **nur Throughput** hinzu — und der ist durch serielles Review/Human-Gate gedeckelt (Amdahl).

**Wichtige Faktenkorrektur zu Martin:** Seine Aussage „der Commit-Lock existiert wegen der seriellen Annahme" ist umgekehrt. Der Lock adressiert die *cross-agent staging race* — er ist das Primitive, das man *für parallele Committer* braucht (`orchestrator.md`: „two parallel committers race on git add"). Der Lock ist concurrency-aware und macht Parallelität eher *machbar*; er ist kein Beleg für Serie.

### 5.2 Acceptance-Criterion ↔ Test-Mapping — **Priorität 1**
SDD §8.2: „A requirement with no automated test is a requirement that can drift silently." Beyond-SDD-Template macht es konkret (messbare Kriterien + Failure-Signals). Deterministisch, andockbar an die Kriterien, die shaper/planner schon produzieren; für Onto/Daten mappt „Test" auf die `uif-validate-*`-Validatoren. Höchster Drift-Nutzen, niedrigste Zeremonie, fusion-konform.

### 5.3 Living Spec — der Artikel beweist den Gegen-Punkt
Das Beyond-SDD-„Living Spec" ist wörtlich eine Markdown-Datei mit Checkboxen — genau das rot-anfällige Artefakt, das SDD §2.2 als „specification debt" fürchtet. Ein hand-gepflegtes SPEC.md ist ein schlechterer Issue-Tracker und in fusion zusätzlich eine **zweite Source of Truth** neben decisions/ (verletzt HYG-SOT). Ein lebendes Dok funktioniert besser mit Linear/Plane.
→ **Wertvollen Teil nehmen, Form lassen:** messbare Success-Criteria + „must never"-Liste in die Shaper-Spec/Constraints; die Living-Funktion über decisions/ + einen **generierten, read-only Rollup** (Reconciler-emittiert) oder Linear/Plane-Export — kein neues Quelldokument.

### 5.4 Diagramm-als-Kontrolle — real, aber nicht durch ASCII gelöst (s. §6)

### 5.5 Feedback-Kadenz — Tool-Variante statt Ritual
Beyond-SDD L5 macht es als „Weekly Review (15 min)". Das ist Team-Ritual, nicht Tool-Aufgabe. Verteidigbare fusion-Variante: **Muster-Erkennung über `issues/`** („Finding-Klasse Z trat N-mal auf → Rule-Kandidat"), keine vorgeschriebene Kadenz.

### 5.6 NEU: Kosten-/Modell-Trace (aus L5)
fusions Event-Log kennt weder Token-Verbrauch noch Modell-Version. Der Artikel macht beides zum Kern von L5. Für ein LLM-Produkt mit `cost/query`-Ziel ein realer, deterministischer Nachrüst-Kandidat.

## 6. Diagramme: warum ASCII das falsche Kontrollformat ist

SDD Part V will Mermaid/D2 **upstream** als Forcing-Function: „a messy diagram is a reliable signal of specification problems". Der Mechanismus:

- In Mermaid/D2 **deklariert man Relationen** (`A --> B`), nicht Positionen. Das Layout-Engine *exponiert* einen verhedderten Graphen als sichtbares Spaghetti — man kann ein wirres Design nicht hübsch hinlegen.
- In **ASCII platziert man Boxen von Hand** — ein chaotisches Design lässt sich in ein ordentlich aussehendes Bild zwingen. **ASCII versteckt genau die strukturelle Unordnung, die das Kontrollmuster aufdecken soll.**

Folglich: ASCIIs echte Stärken (null Toolchain, kein Render-Fail, saubere Diffs, LLM-inline-lesbar) machen es zum besseren **Kommunikations-/Persistenz-Format**, aber zum schlechteren **Kontroll-Format**. Der Render-Schmerz (Mermaid-Version-Mismatch) ist beim Kontroll-Gate kleiner: (a) ein Gate ist ein bewusster Checkpoint, kein Inline-Doc — ein Render-Schritt an einer Stelle ist vertretbar; (b) **D2 rendert stabiler** (Artikel nennt D2 gleichwertig). Empfehlung: ASCII für gewöhnliche Illustration; für das *eine* Kontroll-Diagramm im planner ein deklariertes Format (D2 bevorzugt).

Martins Gap 3.4 war faktisch ungenau (fusion macht ASCII upstream, Mermaid downstream — er behauptete „nur retrospektiv"). Der korrekte Restpunkt ist nicht „Diagramme upstream einführen" (vorhanden), sondern „Diagramm als Forcing-Function/Review-Checkpoint" — und der wird durch ASCII-upstream gerade nicht gelöst.

## 7. Empfehlung (neu priorisiert)

1. **Acceptance-Criterion ↔ Test/Validator-Mapping** — deterministisch, höchster Drift-Nutzen, fusion-konform. (Bei Martin nicht in Top 3.)
2. **Diagramm-als-Kontrolle im planner** — als deklariertes Format (D2), *nicht* ASCII; billiger Forcing-Function-Gate vor dem Coding.
3. **Kosten-/Modell-Trace im Event-Log** — kleiner, deterministischer L5-Nachbau; für UNITEs `cost/query` direkt nützlich. (Neu.)
4. **Worktree-Parallelität** — zurückstellen, bis (a) der Engpass nachweislich die Ausführung ist (nicht Review) und (b) ein Conflict-Verifier existiert. Hohes Potenzial, hohes Integrationsrisiko gegen Kohärenz + Observability.
- **Living Spec:** nur den messbaren-Kriterien-Teil übernehmen; Form via decisions/ + generiertem Rollup oder Linear/Plane — keine zweite SoT.
- **Feedback-Kadenz:** als Muster-Erkennung über `issues/`, nicht als Ritual.

## 8. Fazit

Martins Report ist substanziell solide; bei „Diagramm-als-Kontrolle" lag er näher an der Wahrheit als die erste Gegen-Kritik. Seine zwei systematischen Schwächen bestehen:

1. **Features statt Outcomes** — obwohl die Artikel die Metriken mitliefern.
2. **Reifegrad-Kategorienfehler** — „über Level 2" misst fusion an einer Spec-Zentralitäts-Achse, auf der es eher Level 1 ist; voraus ist fusion auf off-Achsen (Orchestrierung, Drift, Portfolio).

Größte faktische Überzeichnung: L5-„1:1" (Kosten/Modell-Trace, Spec-Eval, Feedback-Loop fehlen). Faktenkorrektur: der Commit-Lock belegt Concurrency-Awareness, nicht Serie. Die drei Anwender-Einschätzungen (Living Spec ↔ Linear/Plane, Worktree-Skepsis, Diagramm-Split) sind tragfähig — mit der Einschränkung, dass „ASCII upstream" fürs Kontroll-Ziel das falsche Format optimiert.

---

## Offene Fäden / mögliche Folge-Arbeit

- Umsetzungsskizzen für die Top-3-Empfehlungen (je 1 Plan-Stub für planner).
- Messung: Coherence-Gate-Auslösungsstatistik über die letzten N Sessions (validiert/falsifiziert die „Drift-Kontrolle ist reif"-These).
- Prüfen, ob ein Event-Log-Schema-Zusatz (`model`, `tokens_in/out`, `cost`) abwärtskompatibel einführbar ist.
