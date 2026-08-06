"_i_ → _s_ ist die eine erlaubte Terminal-zu-Terminal-Transition" steht nur in der Beispieldatei — die normative Konventionsdatei kennt sie nicht
---
Schweregrad: mittel. rules/decision-record-examples.md:87 erlaubt _i_→_s_; die Datei erklärt sich selbst für nachrangig ("the conventions file is normative", Zeile 5). Die normative Transitionsliste rules/fusion-workbench-conventions.md (Worked transitions, _i_/_s_ terminal) kennt nur _o_→_a_, _a_→_i_, _o_→_d_, _a_→_s_, _o_→_s_ und verbietet bei Terminalzuständen nur die Rückbenennung nach _o_/_a_. Die "optional reading"-Datei erweitert damit das Vokabular der normativen Quelle im Alleingang.
---
Betroffen vor allem der Reconciler (führt Decision-Marker). Entweder gehört _i_→_s_ in die Konventionsdatei oder aus der Beispieldatei heraus. Klasse 4, abgeleitet-falsch (beide Texte gelesen; welcher gewinnt, ist Auslegung). Analyse: circles/260801-1244-guard-rules-write/analyses/260805-1840-doku-gesamtpruefung-gegen-code.md
---
Resolved: 2026-08-06 — `_i_→_s_` als die eine erlaubte Terminal-zu-Terminal-Transition in der normativen Terminal-Regel der Konventionen verankert (`rules/fusion-workbench-conventions.md:250`); die Beispieldatei verweist auf die Norm statt allein zu normieren (`rules/decision-record-examples.md:87`). Commit fae818b, Circle 260805-2005-textschicht-gegen-code-nachziehen (Plan-Schritt 10, Batch A).
