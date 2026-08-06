Acht Zitate tragen verfallene Decision-Marker, und zwei davon sind inhaltlich falsch geworden
---
Zitierte Records existieren, aber unter anderem Marker — ein grep auf den zitierten Namen findet nichts (alle per `ls` der Stores gemessen):

| Fundstelle | zitiert | tatsächlich |
|---|---|---|
| `hooks/lib/config.ts:103` | `260802-1912_a_…` | `_i_` |
| `hooks/lib/paths.ts:119` | `260803-1419_a_…` | `_i_` |
| `hooks/lib/paths.ts:72` | `260804-1632_o_…` | `_d_` |
| `hooks/lib/bash-mutation-guard.ts:171,1194,2092` | `260803-1803_a_…cdpath…` | `_i_` |
| `README-hooks.md:206` | `260803-1803_a_…` | `_i_` |
| `README-hooks.md:214` | `260804-0841_p_…` | `_c_` |
| `rules/rule-file-provenance.md:32,48` | `260801-1020_a_provenance-header…` | `_i_` |
| `bin/fusion-plane:721` | `260719-2313_o_…` | `_i_` |

Zwei sind mehr als tote Pfade:
1. `hooks/lib/paths.ts:72` sagt wörtlich „Whether it should therefore fold is an open decision, deliberately not taken here" — die Entscheidung ist inzwischen gefallen (`_d_`, abgelehnt). Der Docstring ist inhaltlich falsch, nicht nur der Dateiname.
2. `rules/rule-file-provenance.md:48` ist die `Binding decision:`-Zeile der Datei, die die Zitierformen selbst definiert — sie zitiert ihre eigene bindende Entscheidung unter einem Namen, den es nicht mehr gibt. Ihre Begründung für Form 1 (Marker-Wechsel macht die Regel als „retirement candidate" sichtbar) deckt den `_a_`→`_i_`-Übergang erkennbar nicht: schon der Normalfall „implementiert" bricht jeden Marker-tragenden Verweis.
---
Schweregrad: Low (Sammel-Issue, mechanischer Fix), mit den zwei benannten inhaltlichen Korrekturen. Befund des Verweis-Workstreams (Analyst), Stichproben von coderev nachgemessen (paths.ts:72 + Store-ls, rule-file-provenance:48 + Store-ls). Fix-Richtung: Marker mechanisch auffrischen; paths.ts:72 inhaltlich auf „declined" umformulieren; in rule-file-provenance zusätzlich erwägen, die empfohlene Zitierform marker-los zu machen (z.B. `260801-1020_*_slug`), damit `_o_→_a_→_i_`-Übergänge Zitate nicht mehr brechen.
---
Progress: 2026-08-06 (Circle 260805-2005-textschicht-gegen-code-nachziehen) — teilweise behoben, bleibt offen. Behoben: `README-hooks.md:206,214` und `rules/rule-file-provenance.md:32,48` in Wildcard-Form, `bin/fusion-plane:721` in Wildcard-Form, und die inhaltliche Korrektur an `hooks/lib/paths.ts:72` (Docstring sagt jetzt die Deferral-Entscheidung, zitiert Wildcard-Form) — Commits fae818b und a1b7872. Offen bleiben die übrigen hooks/lib-Quellen: `hooks/lib/config.ts:103` (`260802-1912_a_`, real `_i_`), `hooks/lib/paths.ts:121` (`260803-1419_a_`, real `_i_`) und `hooks/lib/bash-mutation-guard.ts:171,1194,2092` (`260803-1803_a_`, real `_i_`) — sie liegen außerhalb des Dateisatzes des Referenz-Lints (der prüft rules/, agents/, skills/, READMEs, CLAUDE.md, docs/, templates/ und bin-Kommentare, nicht hooks/lib). Kein Circle trägt den Rest derzeit; er verbleibt bei diesem Record.
---
Resolved: 2026-08-06 (Circle 260805-2005-textschicht-gegen-code-nachziehen, Turn 4) — der Rest ist geschlossen. Die fünf verbliebenen hooks/lib-Zitate stehen in Wildcard-Form: `hooks/lib/config.ts:103`, `hooks/lib/paths.ts:121`, `hooks/lib/bash-mutation-guard.ts:171,1194,2092`. Der Referenz-Lint (`hooks/lib/__tests__/reference-resolution-lint.test.ts`) deckt hooks/lib-Kommentarzeilen jetzt ab — nur Klasse (c), Record-Zitate: Klasse (a) würde für die fabrizierten Pfad-Operanden der Guard-Doku (`rules/retired`, `rules/link`, `rules/up/x`, …) eine stetig wachsende EXAMPLE_PATHS-Allowlist erzwingen, genau die Art Ausnahmeliste, vor der der Test-Header selbst warnt; Begründung steht am `recordsOnly`-Feld im Test. Die Erweiterung fand sofort ein sechstes verfallenes Zitat: `hooks/lib/shell-parse.ts:131` zitierte `260804-0947_o_` (real `_i_`) und behauptete dazu „both are open" — Marker auf Wildcard, Formulierung korrigiert. hooks/dist neu gebaut (die Kommentare stehen auch in den kompilierten .js/.d.ts); kein `_a_`-/`_o_`-Altmarker der Tabelle mehr in dist. Suite grün (1608).
