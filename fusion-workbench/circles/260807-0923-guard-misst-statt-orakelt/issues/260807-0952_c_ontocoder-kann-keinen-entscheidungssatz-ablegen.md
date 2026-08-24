`bin/fusion-paths ontocoder` liefert kein `OUT_DECISION`, obwohl Pläne dem Agenten Entscheidungssätze zuweisen
---
`bin/fusion-paths` leitet die Schlüsselmenge eines Konsumenten daraus ab, welche Schlüssel dessen eigener Prompt nennt. `agents/ontocoder.md` nennt nur `$OUT_ISSUE` (Zeile 45) und `$OUT_HISTORY` (Zeile 86), nicht `$OUT_DECISION`. Der Aufruf `bin/fusion-paths ontocoder` gibt daher `OUT_HISTORY`, `OUT_ISSUE`, die vier `SCAN_*` und `TASKLIST` aus, aber keinen Schreibpfad für Entscheidungssätze — auch keinen Fehler, weil der Resolver nur meckert, wenn ein Prompt einen Schlüssel nennt, den er nicht bewerten kann (Exit 4), nicht umgekehrt.
---
Aufgefallen bei Schritt 1 des Plans `circles/260807-0923-guard-misst-statt-orakelt/planning/260807-0931_*_plan-guard-misst-statt-orakelt.md`. Dort ist ontocoder der Ausführer, und der Schritt verlangt ausdrücklich einen Entscheidungssatz "in `$OUT_DECISION`". Der Auftrag an den Agenten wiederholte diese Formulierung wörtlich.

Der Agent hat den Satz in diesem Fall nach `circles/260807-0923-guard-misst-statt-orakelt/decisions/` geschrieben — abgeleitet aus der Circle-Hälfte von `SCAN_DECISIONS` und aus der Herkunftsregel, die den Satz dem aktiven Circle zuweist. Das ist mit hoher Wahrscheinlichkeit der richtige Ort, aber es ist eine Ableitung des Agenten und nicht die Antwort des Resolvers. Genau diese Ableitung soll die Pfadauflösung ersetzen: `rules/fusion-workbench-conventions.md` `## Path Resolution` nennt `bin/fusion-paths` den einzigen Auflösungspunkt und verbietet, dass ein Prompt eine konkurrierende Ortsangabe trägt.

Die verpflichtende Ablageregel derselben Datei (`## Issue and Decision Filing — MANDATORY`) richtet sich an jeden Agenten, nicht nur an die, deren Prompt `$OUT_DECISION` erwähnt. Ein ontocoder, der beim Bearbeiten von Daten eine offene Frage findet, steht damit heute vor demselben Problem, unabhängig von diesem Plan.

Zwei denkbare Auflösungen, beide nicht in diesem Circle zu entscheiden:
1. `agents/ontocoder.md` nennt `$OUT_DECISION` an der Stelle, an der es heute `$OUT_ISSUE` nennt; der Resolver gibt den Schlüssel dann von selbst aus.
2. Entscheidungssätze werden ontocoder gar nicht zugewiesen, und der Plan-Schritt wechselt den Ausführer.

Die Lücke ist nicht auf ontocoder beschränkt. Gemessen mit `grep -l OUT_DECISION agents/*.md`: den Schlüssel nennen sechs Prompts (`analyst`, `investigator`, `reconciler`, `consultant`, `shaper`, `orchestrator`). Die übrigen zehn nennen ihn nicht — darunter `coder`, `ontocoder`, `planner`, `bugfixer`, `coderev` und `ontorev`, also gerade die Agenten, die beim Umsetzen und Prüfen auf offene Fragen stoßen. Für sie alle gilt die verpflichtende Ablageregel, und für keinen von ihnen gibt der Resolver einen Zielpfad aus.

---

**Reconciliation 260807-1515 (reconciler, Domain `code`) — bleibt `_o_`, und dieser Befund ist der vierte offene Punkt des Circles, der bei der Abschluss-Bilanz nicht genannt war.**

Nachgemessen, nicht der Aktenlage geglaubt. `bin/fusion-paths ontocoder` gibt gegen HEAD
`e684eae` acht Zeilen aus — `WORKBENCH`, `CIRCLE`, `OUT_HISTORY`, `OUT_ISSUE`, vier `SCAN_*`
und `TASKLIST`. `OUT_DECISION` ist nicht darunter. Der Befund steht damit unverändert.

Er unterscheidet sich von den drei anderen offenen Punkten des Circles dadurch, dass sein
Gegenstand den Mechanismuswechsel gar nicht berührt: er hängt an der Ableitung der
Schlüsselmenge aus dem Prompt-Text, nicht am Guard. Er wäre auch offen, wenn dieser Circle nie
stattgefunden hätte, und er bleibt offen, wenn der Circle schließt.

Herkunft, für den Fall dass jemand ihn verschieben will: aufgefallen ist er in Schritt 1 dieses
Circles, verursacht hat ihn dessen Directive nicht. Nach der Herkunftsregel wäre `shared/issues/`
der richtige Ort. Verschoben wird er hier trotzdem nicht — die Regel verlangt keine nachträgliche
Umverteilung, und ein Umzug bräche die Verweise aus dem Plan und aus dem Sitzungsprotokoll. Wer
ihn aufnimmt, findet ihn über die Verweise; wer den Circle archiviert, sollte wissen, dass hier
ein nicht-Circle-eigener Befund mitarchiviert wird.

---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03`; the gap is unchanged and the record's own count of it is now stale in the direction that makes it look smaller than it is.**

```
bin/fusion-paths ontocoder
  WORKBENCH=…/fusion-workbench
  OUT_HISTORY=shared/history
  OUT_ISSUE=shared/issues
  SCAN_PLANS=shared/planning
  SCAN_ISSUES=shared/issues
  SCAN_DECISIONS=shared/decisions
  SCAN_HISTORY=shared/history
  exit 0
```

Seven lines, no `OUT_DECISION`, exit 0 — no error, because the resolver only refuses a key a prompt *names* and cannot value, never a key a prompt fails to name. Two years of releases have not touched this: the defect is in the derivation, not in any one prompt.

**The record's population figure has moved and the shape has not.** It measured six prompts naming `$OUT_DECISION` and ten not. At HEAD:

```
grep -l 'OUT_DECISION' agents/*.md
  analyst  consultant  curator  planner  reconciler  orchestrator  shaper
```

Seven of fifteen. `investigator` left the roster with its fold on 2026-08-15; `curator` and `planner` gained the key. **The eight that still do not name it are `coder`, `ontocoder`, `bugfixer`, `coderev`, `ontorev`, `taskplanner`, `playmaker` and `editor`** — and the record's point survives the arithmetic intact, because that list is still exactly the implementing and reviewing agents, the ones that meet an open question while doing the work. `rules/fusion-workbench-conventions.md` `## Issue and Decision Filing — MANDATORY` binds every one of them and the resolver hands none of them a target.

**Two of the record's own framings need correcting for whoever picks this up.** Its `TASKLIST` key is gone — the persisted work queue was retired on 2026-08-15 — so the emitted set is smaller than the record describes for reasons unrelated to it. And the plan it was found in, `circles/260807-0923-guard-misst-statt-orakelt/planning/260807-0931_*`, has since closed, so option 2 of its two suggested resolutions ("the plan step changes executor") no longer has a plan step to change. Option 1 — `agents/ontocoder.md` names `$OUT_DECISION` where it today names `$OUT_ISSUE`, and the resolver emits the key by itself — is the only one of the two still available, and it is one line per prompt.

**Origin, restated because it still holds and a reader should not have to re-derive it.** This finding did not arise from this Circle's Directive; it was found beside it. Under the Origin Rule its home is `shared/issues/`. It is deliberately not moved: the rule requires no retrospective redistribution, and a move would break the citations from the plan and the session history. Whoever archives this Circle should know a non-Circle finding is archived with it.

---
Resolved: fixed — Option 1, auf fünf Prompts ausgeweitet: coder, ontocoder, bugfixer, coderev und ontorev nennen `$OUT_DECISION` neben `$OUT_ISSUE`, und `bin/fusion-paths <agent>` gibt den Schlüssel für alle fünf aus (`fusion-paths.test.ts` hält die Menge); `agents/coder.md:24`, `agents/ontocoder.md:45`, `agents/bugfixer.md:35`, `agents/coderev.md:33`, `agents/ontorev.md:39`
