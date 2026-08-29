# Die Textschicht des Plugins sagt wieder, was der Code tut, und zwei Lints halten sie dort

---
**Domain:** code
**Status:** closed (coherent)
**Filed by:** shaper (anticipated-circle mode)
**Active spec/plan:** 260805-2353_*_plan-textschicht-gegen-code.md (the record's own `## Directive` and `## Grounding snapshot` are the spec; no separate spec file exists)
**Active session history:** 260805-2350-orchestrator-session.md (sole orchestrator session; 5 Turns)

*Status, plan and history fields corrected by the reconciler on 260806-1057-reconciliation.md at the final reconciliation before closure — the body still said "anticipated" under the `_t_` marker (the known record-lag pattern, shared issue `archive/260817-1907-safe-cleanup-scoped/260802-0920_*_next-skill-activates-a-circle-without-updating-its-status-field.md`). The Turn log below is reconstructed from `orchestrator-events.jsonl` and the history files rather than appended live.*

---

## Directive

Die Dokumentation, die Regeldateien und die Skill-Bodies des Plugins sagen wieder das, was der ausgelieferte Code tut. Die vier Befunde, die keine Textfehler sind, sondern Code, sind behoben: `bin/fusion-rules` überspringt eine fehlende Regeldatei still, statt unter `set -eu` mitten in der Emission abzubrechen; `shared_of` im Archive-Skill liefert unter zsh dieselben Shared-Stores wie unter bash, und ein leeres Ergebnis ist von einem legitim leeren unterscheidbar; die Klammer-Sonde in Setup sperrt kein Projekt mehr aus, dessen Dateiname ein Klammerpaar ohne Marker trägt; die awk-Fehlermeldung in `bin/fusion-rules` ist wieder lesbar. Vor jeder mechanischen Verweiskorrektur ist entschieden, wie ein Workbench-Record zitiert wird, damit ein Marker-Übergang den Verweis nicht mehr bricht. Ein fünfter Lint-Test löst danach jeden Verweis auf Regeldateien, Abschnittsüberschriften und Workbench-Records auf und lässt die Suite fehlschlagen, wenn einer ins Leere zeigt; ein sechster prüft die Aufzählungen, die aus dem Bestand ableitbar sind, gegen den Bestand. `protected-path-internals.md` erreicht in einem konsumierenden Projekt keinen `coder` mehr. Und wem der Übergang `_a_→_t_` gehört, ist einmal entschieden, statt von drei Parteien unterschiedlich beschrieben zu werden.

## Grounding snapshot

### Woher die Befunde kommen

Am 5. August 2026 haben drei unabhängige Durchgänge das gesamte Plugin auf dem Stand v5.9.1 geprüft und zusammen **66 Befunde** hinterlassen. Sie liegen alle als Issue-Records im Nachbar-Circle `260801-1244-guard-rules-write` unter `issues/`, mit den Zeitstempeln `260805-18*` und `260805-19*`. Sie werden hier zitiert und nicht aufgezählt; sie bleiben, wo sie sind.

| Durchgang | Bericht | Befunde |
|---|---|---|
| Zweck und tatsächlicher Einsatz | `260805-1830-zweck-nutzung-und-stand-des-plugins.md` | 5 |
| Doku gegen Code, 530 Aussagen geprüft, 46 falsch | `260805-1840-doku-gesamtpruefung-gegen-code.md` | 40 |
| Gesamtreview des Plugins | `260805-1905-coderev-gesamtreview-plugin-v5-9-1.md` | 21 |

Die drei widersprechen sich nicht, sie gewichten unterschiedlich. Der Doku-Durchgang zählt die Fehlerdichte; der Review ordnet nach Schadensfolge; der Zweck-Durchgang misst, was ein Benutzer davon merkt. Wo die Reihenfolgen auseinandergehen, hat der Review Vorrang, weil er als einziger die stillen Ausfälle gewichtet hat.

**Kein Release-Blocker.** v5.9.1 ist ausgeliefert und funktionsfähig. Von den 66 Befunden ist keiner Critical, und der einzige High ist unten korrigiert.

### Die Korrektur am High-Befund, und was von ihm bleibt

Der einzige High-Befund des Reviews (`260805-1859_*_im-eigenen-repo-laden-alle-agenten-die-regeln-der-installierten-vorversion-nicht-die-quelle.md`) sagt, `FUSION_PLUGIN_ROOT` zeige im Plugin-Repo auf `~/.fusion` statt auf die Quelle, und nennt das einen Defekt.

**Es ist keiner.** Die Ursache ist inzwischen geklärt: die Variable wird beim Session-Start aus dem installierten Plugin gesetzt. Die prüfende Sitzung lief vier Tage ohne Neustart, also stand sie auf dem Stand, der bei ihrem Start installiert war (v5.8.0). Ein `fusion --update` plus Neustart der Sitzung löst es vollständig. **Der Issue-Record braucht eine Korrektur seines Befundtexts** — die gehört zur Arbeit dieses Circles und ist hier vermerkt, nicht ausgeführt.

Was bleibt, ist nicht der Defekt, sondern seine Folge, und die ist unbequem genug, um Grounding zu sein: **vier Tage Selbstprüfung liefen gegen eine veraltete Kopie.** Jeder Agent, der in diesen vier Tagen die Regeln dieses Repos änderte, las beim Setup die Regeln der Vorversion — einschließlich der fünf Shards, die dieser Zeitraum überhaupt erst erzeugt hat und die der installierten Kopie vollständig fehlten. Ein Agent, der eine Regel unter dem alten Stand liest und den neuen Stand editiert, produziert genau die Extraschleifen, die diese Prüfung ausgelöst haben. Diese Sitzung hat den Effekt erneut gemessen: `bin/fusion-rules shaper` emittierte Pfade unter `/Users/k1/.fusion/rules/`, und `agent-setup.md`, `fusion-workbench-conventions.md`, `user-facing-output.md` und `critical-stance.md` unterscheiden sich dort alle von der Quelle. Dieser Circle wurde deshalb gegen die Quelldateien geschrieben, nicht gegen die emittierten.

Offen und in diesem Circle zu entscheiden: ob es bei der Verhaltensregel „vor Regelarbeit updaten und neu starten" bleibt oder ob eine Meldung dazukommt. Die Maschinerie dafür existiert schon — `hooks/lib/self-detect.ts` beantwortet „ist cwd das Plugin-Repo". Der Review schlägt zwei Höhen vor: eine SessionStart-Warnung bei Abweichung, oder die Helfer die Repo-eigenen `rules/` bevorzugen zu lassen. Das ist eine Entscheidung, kein Fix.

### Das dominante Fehlermuster, und warum daraus zwei Lints folgen

Über dreißig der 46 Doku-Befunde folgen **einem** Muster: abschließend formulierte Aufzählungen („Currently: …", „only X and Y", „nine fields", „two places", Skill-Listen), die stehen blieben, während darunter Dateien dazukamen, aufgeteilt oder verschoben wurden. Die drei jüngsten Dokumente unter `docs/` sind sauber; die ältesten Abschnitte der ältesten Dokumente sind am dichtesten befallen.

Sechzehn weitere tote Verweise folgen aus **einer** Entscheidung: einen Workbench-Record mit vollem Dateinamen zu zitieren, obwohl der Dateiname den Zustand trägt. Jeder Übergang `_o_→_a_→_i_` bricht jeden Verweis auf den Record, und zwar lautlos. Der Beweis am lebenden Objekt steht in `rules/rule-file-provenance.md:48`: ausgerechnet die Datei, die die Zitierformen definiert, zitiert ihre eigene bindende Entscheidung unter einem Namen, den es nicht mehr gibt.

Vier Lint-Tests für andere Texteigenschaften existieren bereits (`path-literal-lint`, `marker-format-lint`, `glob-nomatch-lint`, `provenance-header-lint`) und haben ihre Bereiche sauber gehalten. Keiner prüft Auflösbarkeit. Der Review nennt einen fünften „die billigste Struktur-Investition in dieser Liste": er hätte alle 16 Verweis-Befunde gefunden, bevor sie ausgeliefert wurden. Der Doku-Durchgang empfiehlt unabhängig davon einen Test für ableitbare Aufzählungen. Beide sind mechanisch prüfbar, und der Text ist heute ungetestet, wo der Code mit 1551 Tests geprüft ist.

### Die vier Code-Fehler, in dieser Sitzung nachgemessen

Zwei davon tauchten als Doku-Befunde auf, weil das dokumentierte Verhalten erkennbar das gewollte ist:

- **`bin/fusion-rules` bricht unter `set -eu` ab, wo `rules/agent-setup.md:26` „missing files are skipped silently" verspricht.** `emit_if_exists()` ist `[ -f "$1" ] && printf …` und liefert damit bei fehlender Datei den Status 1; als einfaches Kommando unter `set -eu` (Zeile 131) beendet das das Skript mitten in der Emission — ohne Meldung, mit Teilausgabe. Sieben Always-on-Dateien werden so aufgerufen (Zeilen 328–334).
- **Die awk-Fehlermeldung in `bin/fusion-rules:452` ist durch Hex-Escape-Gier verstümmelt** („is missing zgents:'"), gegen das eigene Versprechen einer klaren Fehlermeldung.

Zwei kommen aus dem Review und sind die zwei obersten der empfohlenen Reihenfolge, nachdem der High-Befund entfällt:

- **`shared_of` im Archive-Skill verliert unter zsh alle Shared-Stores, sobald ein Circle aktiv ist.** `skills/archive/SKILL.md:48` nutzt `for p in $1` und setzt Wortteilung voraus, die zsh nicht macht. In dieser Sitzung erneut gemessen: `zsh → []`, `bash → [shared/planning]`. Die Bash-Tool-Umgebung ist zsh. Folge: Tier 1 bis 3 archivieren nur noch terminale Circles und überspringen jede geschlossene Shared-Datei — still, weil ein leerer Bucket von „nichts zu archivieren" nicht zu unterscheiden ist. **`/fusion:cleanup` Schritt 4 führt tier-1 autonom und ohne Gate aus und erbt das.** Der einzige Befund mit stillem Datenverlust-Charakter.
- **Der Setup-Lockout hat einen Rest.** Der v5.9.1-Fix hat den Geltungsbereich der Klammer-Sonde eingeschränkt, ihre Form nicht. Jeder Dateiname mit Klammerpaar, dessen Inhalt kein Marker ist, erzeugt denselben geschlossenen Kreis: Setup verweigert → migrate fragt und verschiebt nichts → meldet „Migration vollständig" → Setup verweigert erneut. Gemessen an `notes [draft].md`. Dieselbe Deadlock-Form hat vier Tage lang ein Konsumprojekt ausgesperrt und kam damals als Meldung von außen.

Die letzten beiden teilen eine Wurzel, die die Konventionen bereits benennen und im Guard konsequent anwenden, in den Skills aber nicht: `HYG-NO-SILENT-FAIL`. Beide scheitern mit einem leeren Ergebnis, das von einem legitimen leeren Ergebnis nicht zu unterscheiden ist.

### Die Zitierform ist Vorbedingung, nicht Nacharbeit

Der Review ist an dieser Stelle ausdrücklich: „Vorher die Entscheidung zur Zitierform, sonst wird zweimal angefasst." Eine markerlose Form (`260801-1020_*_<slug>`) würde die ganze Klasse eliminieren. Solange sie nicht gefallen ist, kann der Verweis-Lint auch nicht wissen, welche Form er als gültig akzeptiert. Die Entscheidung steht also **vor** dem Lint und **vor** den 16 mechanischen Korrekturen.

Zwei der acht verfallenen Zitate sind mehr als tote Pfade: `hooks/lib/paths.ts:72` behauptet wörtlich, eine Entscheidung sei „deliberately not taken" — sie ist inzwischen gefallen. Diese beiden sind Inhaltskorrekturen, nicht Pfadkorrekturen, und dürfen nicht mit dem mechanischen Rest zusammengeworfen werden.

### Warum `protected-path-internals.md`

Die Datei adressiert laut eigener Aussage, wer den Mutationsklassifizierer ändert oder prüft. In einem konsumierenden Projekt tut das niemand: die Guard-Quellen liegen dort außerhalb des Projektbaums und sind obendrein geschützt. Ihre Zielgruppe ist nach Agentennamen geschnitten (`coder`, `coderev`, `bugfixer`), nicht nach Repository-Kontext — im Plugin-Repo ist das die richtige Adresse, in jedem Konsumprojekt eine leere, und die 21,9 kB laden trotzdem.

Das ist kein Schönheitsfehler. Gemessen am tatsächlich installierten Stand v5.8.0 spart das Update zwölf Agenten bis zu 14,7 % Regellast, aber `coder`, `coderev` und `bugfixer` werden um 6,1 % **schwerer** — und `coder` ist mit 37 Dispatches in vier Tagen der meistgenutzte Agent des beobachteten Konsumprojekts. Der Zuschnitt wirkt beim wichtigsten Agenten in die falsche Richtung. Das mechanisch begrenzbare Kriterium existiert bereits im System (`hooks/lib/self-detect.ts`), `bin/fusion-rules` konsultiert es nur nicht. Die Änderung bringt zusätzlich drei der vier über dem Release-Deckel liegenden Rollen darunter.

### Wem der Übergang `_a_→_t_` gehört

Diese Gruppe stand nicht im ursprünglichen Zuschnitt und ist hier zugefügt, weil zwei Medium-Befunde dieselbe Lücke von zwei Seiten beschreiben und der Review sie ausdrücklich zusammen entschieden haben will:

- `rules/fusion-workbench-conventions.md:75` sagt für `.active-circle`: „the orchestrator writes it … Nothing else touches it". `skills/next/SKILL.md` Schritte 6.2/6.3 führen `mv` und `printf > .active-circle` selbst aus; circle-stash, circle-pop und migrate schreiben oder löschen den Pointer ebenfalls. Der einzige ausformulierte Aktivierungspfad läuft nicht durch den Orchestrator. Der Orchestrator wiederum beansprucht die Aktivierung in seiner Selbstbeschreibung, hat aber in seinem Phasenmodell keinen Schritt, der sie ausführt.
- Der shaper-Modus `portfolio-activation` hat keinen erreichbaren Dispatcher mehr. `agents/shaper.md:3,47` nennt playmaker und `/fusion:next`. Playmaker dispatcht per Selbstbeschreibung nie einen Agenten; `/fusion:next` führt in seiner `allowed-tools`-Zeile nur `Agent(fusion:playmaker)` und erwähnt shaper an keiner Stelle (in dieser Sitzung nachgesehen). Praktische Folge: bei einer Aktivierung wird der Grounding-Snapshot nicht befüllt und die Directive nicht verfeinert — das Circle-Record-Template verspricht einen Schritt, den niemand ausführt.

**Für diesen Circle selbst ist das folgenlos**, und das ist Absicht: der Grounding-Snapshot ist hier vollständig geschrieben, nicht als Stub gelassen. Die Aktivierung über `/fusion:next` wird ihn nicht verfeinern, muss es aber auch nicht. Vier Dateien folgen der Antwort auf die Eigentumsfrage, und deshalb ist sie eine Entscheidung, kein Patch.

Im selben Zug gehört die Lock-Regel dazu: sie sagt „Always, when any party is about to commit", und `/fusion:commit` wie `/fusion:cleanup` committen ohne Lock — genau der Fall, den der Lock abdecken soll.

### Was diese Prüfung bestätigt hat

Der Vollständigkeit halber, damit der Zuschnitt nicht wie ein Scherbenhaufen aussieht: die Guard-Doku ist in ihrer Substanz präzise. 226 von 229 ausgeführten Erlaubt/Verboten-Behauptungen stimmen exakt, einschließlich der kontraintuitiven Fälle. `hooks/dist` ist byte-identisch zu einem frischen `tsc`-Lauf. 1551 Tests grün. `docs/philosophy.md`, `docs/working-model.md` und `docs/plane-setup.md`: null Befunde. Der Guard hält, was er behauptet. Was auseinandergerissen wurde, liegt eine Ebene darüber — in den Texten, die niemand kompiliert, und in dem Mechanismus, der sie an die Agenten ausliefert.

### Zitiert, nicht kopiert (nach der Herkunftsregel)

- Die drei Berichte: siehe Tabelle oben.
- Der zu korrigierende Befund: `260805-1859_*_im-eigenen-repo-laden-alle-agenten-die-regeln-der-installierten-vorversion-nicht-die-quelle.md`
- Alle 66 Issue-Records: `circles/260801-1244-guard-rules-write/issues/`, Zeitstempel `260805-18*` und `260805-19*`.
- Die Spec, aus der die Konsolidierungs-Kapazitäten stammen: `260801-1122_*_spec-normative-consolidation.md`

## Dependencies

**`260801-1244-guard-rules-write` — muss schließen, bevor dieser Circle aktiviert wird.** Er trägt aktuell den `_t_`-Marker, und fusion führt einen aktiven Circle zur Zeit. Alle 66 Befunde liegen in seinem Issue-Store und bleiben dort; dieser Circle arbeitet sie ab, ohne sie zu verschieben. Sein eigener Circle-Datensatz ist außerdem einer der Befunde (`260805-1830_*_der-circle-datensatz-dieses-circles-widerspricht-seinem-eigenen-marker-und-fuehrt-keinen-turn-log.md`) und gehört zu seiner Schließung, nicht hierher.

**`260804-1205-shell-reachability-model` — trägt die Fortsetzung am Shell-Klassifizierer, und ein Befund gehört als Grounding dorthin statt hierher.** Der Klassifizierer ist in diesem Circle ausdrücklich außen vor. Die zugehörige Empirie aus dem Zweck-Durchgang gehört aber in die Grounding jenes Circles, weil sie seine Beweislast verschiebt: **in krk gab es in vier Tagen 17 Bash-Blockierungen und null echte Treffer.** Alle 17 tragen als Operand eine Variable, eine Tilde oder einen Glob; kein einziger Block nennt einen tatsächlich geschützten Pfad. Es sind durchweg Fail-closed-Fehlalarme auf harmlosen Zielen. Der häufigste Fall ist fusions eigene Marker-Umbenennung in Schleifenform (`mv "260803-1536_o_$f.md" "260803-1536_c_$f.md"`) — der Guard verweigert die eigene Konvention des Rahmens, wenn ein Agent sie idiomatisch ausführt. Einordnend: kein Block führte zu einem Halt, und die Deny-Botschaft hat funktioniert (Grund genannt, Ausweg genannt, kein Herumrouten). Die Reibung ist begrenzt, ihr Nutzen war im Beobachtungszeitraum null. Der Reachability-Circle adressiert die Joiner-Fälle, aber nicht diese Klasse: `mv "$f"` bleibt auch unter einem Reachability-Modell unauflösbar. Quelle: `260805-1830-zweck-nutzung-und-stand-des-plugins.md` §3, Befund `260805-1830_*_alle-17-guard-blocks-im-beobachteten-konsumprojekt-waren-fail-closed-fehlalarme.md`. **Wer den Reachability-Circle aktiviert, nimmt diese Bilanz in seine Grounding auf.**

**`260801-1244-curator` — braucht vor Aktivierung einen neuen Zuschnitt, und der wird hier nicht gemacht.** Der Zweck-Durchgang hält fest: C9 Schritt 3 und 4 (Partition und Zuschnitt der Konventionsdatei) wurden von Hand durch coder erledigt, nicht durch den Curator. Damit fehlt dem Curator-Circle sowohl sein erster echter Auftrag als auch sein Validierungsfall; D-g der Spec ist hinfällig. C1 bis C3, C6 und C7 bleiben als zusammenhängender Rest sinnvoll, und der Bedarf ist real (cocreator: 65 offene Issues, rund 25 offene Entscheidungen, drei Monate Drift). Die Neuformung ist eine eigene Shaper-Arbeit vor der Aktivierung jenes Circles. Berührungspunkt zu diesem Circle: die Doku-Korrekturen hier fassen Dateien an, die der Curator später als Beispielmaterial bräuchte — das ist ein Argument, diesen Circle zuerst laufen zu lassen, nicht dagegen.

## Turn log

*Reconstructed by the reconciler on 260806-1057-reconciliation.md from `orchestrator-events.jsonl` (session_start 2026-08-05T21:50Z, head `66e4a69`) and the 15 history files under `history/`. One orchestrator session, 5 Turns, 12 commits, suite 1551 → 1611.*

| Turn | Commits | Outcome |
|---|---|---|
| 1 | `7ef2715`, `d3222a5` | Plan written and gated (`260805-2353_*_plan-textschicht-gegen-code.md`); Track 1 code fixes S4–S7; decisions D1–D3 filed and all three answered at one user gate (D1 wildcard citation form, D2 real writer set + lock retrofit, D3 helpers prefer repo rules); 1 issue filed (`260806-0022_*_setup-klammer-probe-und-migrate-reformat-decken-verschiedene-baeume.md`) |
| 2 | `c45fb44`, `b90d1c8`, `81d4154` | S8 internals scoping + S16/D3 repo-preference (`bin/fusion-plugin-cwd`); mid-Turn bugfix of the inherited monitor bind regression (`MONITOR_BIND`, 9 red tests → green); S9/D2 writer-set + lock realisation; coderev filed 4 issues (1 medium, 3 low) |
| 3 | `36d9a30`, `9a96466`, `fae818b`, `a1b7872`, `843239c` | Turn-2 review findings closed; Batches B+C then A (+S13 content corrections); the two lints S14+S15 landed (39 new tests, suite 1599); S17 bookkeeping: 51 findings closed in the neighbour Circle, plan Complete |
| 4 | `b37f13e` | The six residuals S17's partition surfaced (holderless-lock aging + 9 lock tests, remaining hooks/lib citations in wildcard form, migrate half-fixes); coderev final pass filed 4 low issues |
| 5 | `fbd8c4d` | The four low findings fixed (noclobber lock race, lock-rule doc, two lint hardenings); suite 1611; converged |

## Activation proposal

**Recommended as the next Circle — playmaker run 260805-2128-playmaker-direct-dispatch.md (trigger: direct-dispatch, domain bias `code`).**

All three anticipated Circles wait on the closure of the active Circle `260801-1244-guard-rules-write`, so none passes the dependencies-closed check yet; this proposal names the first activation after that closure. Under the code-domain heuristic this Circle and `260804-1205-shell-reachability-model` tie at zero open decision records cited in their Grounding snapshots (the workbench holds zero open decision records anywhere, per the orchestrator session `260805-2117-orchestrator-session.md`). The tie breaks three ways in this Circle's favour. First, its evidence is complete and on disk: three review reports and all 66 finding records are filed under the active Circle, so the work starts with no analysis phase. Second, it carries the only finding with silent-data-loss character (the archive skill's `shared_of` losing every shared store under zsh, inherited ungated by `/fusion:cleanup` step 4). Third, both rival Circles benefit from this one running first: `260801-1244-curator` needs re-shaping before activation because its closing work C9 was already done by hand (recorded in this Circle's `## Dependencies`), and `260804-1205-shell-reachability-model` must absorb the 17-false-alarm balance this Circle's source reports measured. Proposed activation: after `260801-1244-guard-rules-write` reaches closure, via `/fusion:next`.

## Closure note

Closed coherent (`_t_` → `_c_`) on 260806-1105. Phase-3 verdict: **coherent** — all Directive
clauses reached with evidence: four code fixes (`7ef2715`), citation-form decision D1 before the
mechanical batches, two new lints landed green (`a1b7872`, hardened `fbd8c4d`), internals scoping
measured at 0 emissions from a consuming cwd (`c45fb44`), activation ownership decided once via
D2 across five files (`81d4154`). 60 of 66 corpus findings closed with commit-citing footers; the
6 open ones each carry a route outside this Circle. Suite 1611 tests / 30 files green.

Session history: `260805-2350-orchestrator-session.md` (Turns 1–5, 13 commits
`7ef2715..9ee21c0`). Reconciliation: `260806-1057-reconciliation.md`.
Open residual in this Circle: `260806-0022_*_setup-klammer-probe-und-migrate-reformat-decken-verschiedene-baeume.md` (unowned, candidate for a follow-up batch).
