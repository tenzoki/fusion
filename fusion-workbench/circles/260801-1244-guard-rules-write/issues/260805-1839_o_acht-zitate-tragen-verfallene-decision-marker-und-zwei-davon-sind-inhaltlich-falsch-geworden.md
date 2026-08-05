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
