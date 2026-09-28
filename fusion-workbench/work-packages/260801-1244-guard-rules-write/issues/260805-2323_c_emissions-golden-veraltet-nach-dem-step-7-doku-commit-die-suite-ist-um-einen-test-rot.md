# Das Emissions-Golden ist nach dem Step-7-Doku-Commit veraltet — die Suite ist um einen Test rot

---

**Severity:** Low (mechanisch, aber die Suite ist rot)
**Domain:** code
**Filed by:** reconciler, Abschluss-Reconciliation 260805-2323
**Affects:** `hooks/lib/__tests__/fixtures/rules-emission.golden`, verursacht durch `373f5ed`

---

`npx vitest run` an HEAD `def351e`: **1 550 von 1 551 grün, 1 rot** —
`rules-emission-golden.test.ts > matches the checked-in golden, agent by agent`.

Ursache, gemessen: das Golden pinnt `protected-path-discipline.md` auf **19 943** Byte;
Commit `373f5ed` (C5b-Plan Schritt 7, Obligationen 10/12/13 — Floor-Residuum in gemessener
Reichweite, `guard.enabled`-Ausnahme, `260803-1314`-Option-2-Grenze) hat die Datei auf
**20 925** Byte wachsen lassen (+982), ohne das Golden absichtlich zu regenerieren. Die
Budget- und Deckel-Zusicherungen desselben Tests bestehen weiter — das Wachstum liegt im
12 000-Byte-Budget und kein Agent überschreitet seinen Rollendeckel. Es ist also reine
Fixture-Veralterung, kein Deckelriss.

Behebung (coder): den im Test-Header beschriebenen absichtlichen Regenerationsweg gehen
(`REGENERATE_RULES_EMISSION_GOLDEN=1`-Mechanismus bzw. die im Header dokumentierte
Prozedur), die neuen Zahlen prüfen, committen. Der Text-Zuwachs selbst ist gewollt und
bleibt.

Kontext: gefunden bei der Abschluss-Reconciliation dieses Circles; der Befund gehört
diesem Circle (der verursachende Commit ist dessen Schritt-7-Arbeit) und sollte vor oder
mit der Schließung behoben werden, damit kein Circle mit roter Suite schließt.

---

**Resolved:** 260805, coder. Das Golden wurde auf dem im Test-Header dokumentierten Weg
regeneriert (`UPDATE_RULES_GOLDEN=1`-Lauf, der absichtlich rot endet, dann Diff-Review,
dann Bestätigungslauf ohne Flag). Der Fixture-Diff ist exakt der gewollte Zuwachs aus
`373f5ed` und nichts sonst: `protected-path-discipline.md` 19 943 → 20 925 (+982) in
allen 16 Blöcken, jede Agenten-Summe um dieselben 982 Byte höher — Kern-Rolle
89 896 → 90 878, Diagramm-Rolle 95 569 → 96 551, playmaker 99 198 → 100 180, shaper
104 871 → 105 853, orchestrator 108 448 → 109 430, Guard-Internals 111 766 → 112 748.
Keine Budget- oder Deckel-Zusicherung berührt: der Zuwachs liegt bei +982 von 12 000
Budget, das Maximum (112 748) weit unter dem Drift-Deckel (145 144), und die
Justification-Pflicht misst am unveränderten `RULE_BASELINE`-Floor. `RULE_BASELINE`
bleibt absichtlich stehen — der Test-Header re-baselined nur nach einem Cleanup, nie
nach einem Zuwachs. Volle Suite an diesem Stand: **1 551 von 1 551 grün** (27 Dateien).
