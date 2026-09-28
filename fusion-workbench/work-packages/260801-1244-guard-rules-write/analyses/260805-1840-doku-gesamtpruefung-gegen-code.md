# Analysis: Gesamtprüfung der fusion-Doku gegen den ausgelieferten Code

**Date:** 2026-08-05 18:40
**Type:** Document Study (systematische Doku-Verifikation)
**Status:** Complete
**Requested by:** orchestrator (Circle 260801-1244-guard-rules-write)

## Question

Stimmt die gesamte Dokumentation des fusion-Plugins (READMEs, CLAUDE.md, docs/, alle 15 Regeldateien, bin-Header, install.sh, templates/) mit dem Code überein, der heute (v5.9.1) ausgeliefert ist? Anlass: Fünf ausgelieferte Sätze wurden in vier Tagen einzeln als sachlich falsch gefunden, jeder erst durch Ausführung. Die Doku war bisher stichprobenartig widerlegt, nie systematisch geprüft.

## Scope

Geprüft wurden: `README.md`, `README-agents.md`, `README-hooks.md`, `CLAUDE.md`, `docs/philosophy.md`, `docs/working-model.md`, `docs/plane-setup.md`, alle 15 Dateien unter `rules/`, die Kopfkommentare aller 7 Skripte unter `bin/` sowie `install.sh`, und die 3 Dateien unter `templates/` — jeweils gegen `hooks/lib/`, `hooks/guard.ts`, `hooks/hooks.json`, `hooks/config.json`, `bin/`, `agents/*.md`, `skills/*/SKILL.md` und die Testsuiten unter `hooks/lib/__tests__/`.

**Methode:** Vier parallele Prüfstränge. (1) Verhaltensbehauptungen des Guards wurden **ausgeführt**, nicht gelesen: 229 dokumentierte Erlaubt/Verboten-Fälle aus `README-hooks.md`, `protected-path-discipline.md`, `protected-path-internals.md` und `git-branch-discipline.md` liefen über das Harness (`hooks/lib/__tests__/helpers/guard-harness.ts`) als echte Guard-Subprozesse gegen Wegwerf-Projekte — inklusive Case-Folding, Hardlink-Refusal, Halt-Eskalation über drei Blocks, CDPATH-Umgebung, Override-Events und Plugin-Stand-down. (2) Das Workbench-Regelwerk (conventions + 3 Shards + agent-setup) gegen `bin/fusion-paths`, `bin/fusion-rules`, `bin/fusion-commit-lock` mit Exit-Code-Provokation. (3) READMEs, docs/, CLAUDE.md gegen Verzeichnisbestand, Frontmatter, Tags, `bin/fusion-plane`. (4) bin-Header, install.sh, Rest-Regeln, Templates mit Manifest-Ausführung im Scratch. Das Repo blieb unberührt; alle Schreibzugriffe erfolgten in Wegwerf-Verzeichnissen.

## Findings

### Bilanz

| Strang | geprüfte Aussagen (ca.) | falsch / verdächtig |
|---|---|---|
| Guard-Verhalten (ausgeführt) | 240 | 4 |
| Workbench-Regelwerk | 75 | 13 |
| READMEs, docs/, CLAUDE.md | 98 | 17 |
| bin-Header, install.sh, Rest-Regeln, Templates | 120 | 12 |
| **Gesamt** | **~530** | **46** |

46 Einzelbefunde (36 verifiziert-falsch, 6 abgeleitet-falsch, 4 verdächtig), gefiled als **40 Issue-Records** in diesem Circle (`260805-1840…` bis `260805-1842…`; gleichwurzelige Mehrfach-Fundstellen je ein Record). Fehlerquote rund 9 % der geprüften Aussagen.

### Schweregrad hoch (8 Records)

| Record | Kern |
|---|---|
| `260805-1840_*_ppd-leere-liste-steht-den-check-nicht-ab` | `protected-path-discipline.md:37-39` verspricht: leere deklarierte Liste steht den ganzen Check ab, "fail-closed included". Gemessen: Floor (`fusion-guard.json` selbst) und Fail-closed bleiben aktiv. In allen 16 Agenten jedes Konsumentenprojekts geladen. |
| `…_o_agent-setup-fehlende-regeldatei-bricht-emission-ab` | `agent-setup.md:26` verspricht "missing files are skipped silently" — `bin/fusion-rules` bricht unter `set -e` bei fehlender Always-on-Datei mitten in der Emission ab (rc=1, ohne Meldung, mit Teilausgabe). Ausgeführt belegt. |
| `…_o_readme-fusion-ref-beispiel-zeigt-auf-ungetaggte-version` | `README.md:26` nennt `FUSION_REF=tags/v5.3.0` — Tags beginnen bei v5.5.0; das Beispiel führt in einen 404. Einziger Befund, der eine Nutzer-Anleitung direkt bricht. |
| `…_o_stash-manifest-neun-felder-bei-zehn` | `workbench-stash-and-lock.md` sagt dreimal "nine fields"; das eigene Schema im selben Dokument listet zehn. Wiederholung des bereits einmal korrigierten Fehlertyps. |
| `…_o_konventionen-active-circle-nothing-else-touches-it` | "Nothing else touches it" für `.active-circle` — circle-stash, circle-pop und migrate schreiben oder löschen den Pointer. |
| `…_o_konventionen-012-shape-verschweigt-fusion-rules-exit-3` | "same 0/1/2 exit shape" — `fusion-rules` hat selbst Exit 3 (malformes Manifest) mit anderer Bedeutung als `fusion-paths` Exit 3. |
| `…_o_fusion-guard-template-beschreibt-top-level-merge-statt-leaf-merge` | Das an jede Konsumenten-Projektwurzel kopierte Template beschreibt die durch Entscheidung 260804-1630_*_what-does-a-project-guard-object-inherit-for-a-key-it-does-not-supply.md ersetzte Merge-Semantik. |
| `…_o_readme-hooks-residual-walk-out-and-back-ist-geschlossen` | Die Residual-Liste führt `cd .. && cd project && rm rules/x.md` als offene Lücke — der Guard verweigert den Fall heute exakt. Auch der Forensik-Katalog trägt den stale Eintrag. |

### Schweregrad mittel (17 Records, Auswahl)

- `fusion-rules`-awk-Meldung verstümmelt ("is missing zgents:'" — Hex-Escape-Gier in `bin/fusion-rules:452`), gegen das Versprechen "clear error".
- `decision-record-examples.md`: Überschrift `_a_→_s_` über einem `_i_→_s_`-Beispiel; `_i_→_s_` ist zudem nur dort erlaubt, nicht in der normativen Konventionsdatei.
- Prä-v4-Beispielpfade (`fusion-workbench/decisions/`, `/history/`) in zwei Always-on-Regeldateien.
- `circle-records.md`: vier der sechs angeblich zitierenden Skills zitieren die Datei nicht; Binding-Decision-Pfad löst nicht auf.
- `workbench-path-resolution.md`: "cited directly by bin/fusion-paths" (0 Treffer); Pre-v4-Pointer-Ablehnung mit falschem Mechanismus und falscher Zeilenzitation (auch in `migrate`); Kern-Beispiel (log-activity) vom heutigen Skill überholt.
- `workbench-stash-and-lock.md`: drei tote Record-Zitate ("now under shared/" — nirgends vorhanden).
- CLAUDE.md: Symptomzeile "nur zwei Rule-Dateien shippen" (es sind 15); templates/- und docs/-Zeilen unvollständig bzw. mit falschem Kopierziel; Skill-Liste ohne `seed-from-plane` (auch in README-agents).
- README-agents.md: "kein Agent deklariert tools:" (der Orchestrator tut es); Always-on-Liste ohne `protected-path-discipline.md`; drei bedingte Emissionen fehlen — während Zeile 234 derselben Datei die Partition korrekt beschreibt.
- README.md: Setup-Kopierliste ohne `fusion-guard.json`/`plane.config.yaml`; `fusion-guard.json`-Mechanismus im README nirgends erwähnt.

### Schweregrad niedrig (15 Records)

Tote Workbench-Verweise in CLAUDE.md, `WRAPPER_PROGRAMS` falscher Datei zugeschrieben, README-hooks "effective hook configuration" ohne den systemMessage-Hook, Files-Tabelle ohne drei lib-Module, fusion-paths-Header (zwei-Orte-Behauptung vs. fünf `DEFINITION_SITES`, stale Zählungen), commit-lock-Header (release-Regel, deps-Liste), plane.config-Header, context-manifest-"stops"-Nuance, Provenance-Binding-Decision nach `_i_` gewandert, Relozierungs-Artefakte in README-agents, monitor/fusion-rules/install.sh-Header-Kleinkram, circle-pop-Phantomfeld.

### Was der Ausführungstest bestätigt hat

Die Guard-Doku ist in ihrer Substanz **präzise**: 226 von 229 ausgeführten Erlaubt/Verboten-Behauptungen stimmen exakt — einschließlich der kontraintuitiven Fälle (Case-Folding unconditional, Exemption foldet nicht, Hardlink-Refusal mit benanntem Grund, `git -C`-Union, `git clean` schreibt "THROUGH", checkout/restore-Asymmetrie inkl. der HEAD-Ausnahme, Joiner-Tabelle, CDPATH-Degradierung mit benannter Ursache, Fail-closed-Bound um die Ursache statt ums Programm, Halt über beide Surfaces mit drei unterscheidbaren Event-Meldungen, `guard_advisory` bei beiden Overrides, Stand-down im Plugin-Repo bei aktiver Branch-Policy). Auch die "21 Residuals"-Zählung stimmt (Katalog ausgezählt). Ebenso bestätigt: fusion-paths-Exit-Kontrakt 0/1/2/3 samt Schlüsseltabelle und Invarianten, commit-lock-Timings (60 s, 200 ms/2 s), Manifest-Mechanik von fusion-rules inklusive Byte-Identität ohne Manifest, plane-setup.md vollständig deckungsgleich mit `bin/fusion-plane`, Provenance-Lint wie beschrieben, install.sh-Header korrekt (v5.9.1). `docs/philosophy.md`, `docs/working-model.md`, `docs/plane-setup.md`: null Befunde.

## Implications

1. **Der Verdacht zu CLAUDE.md trägt nur zur Hälfte.** CLAUDE.md hat mit 7 Befunden die höchste absolute Zahl, aber README-agents.md die höchste Dichte (~35 % der geprüften Aussagen; CLAUDE.md ~23 %). Die schwersten Verhaltensfehler liegen weder hier noch dort, sondern in zwei Regeldatei-Shards (`protected-path-discipline.md`, `agent-setup.md`) und im Template `fusion-guard.json` — also genau in den Dateien, die in Konsumentenprojekte ausgeliefert und in Agenten-Kontexte geladen werden.
2. **Das dominante Fehlermuster ist Aufzählungs- und Referenz-Drift**: 30+ der 46 Befunde sind abschließend formulierte Listen ("Currently: …", "only X and Y", "nine fields", "two places", Skill-Listen), die stehen blieben, als darunter Dateien hinzukamen, aufgeteilt oder verschoben wurden. Die drei jüngsten Dokumente (docs/) sind sauber; die ältesten Sektionen der ältesten Dokumente sind am dichtesten befallen.
3. **Zwei Befunde sind mutmaßlich Code-Fehler, nicht Doku-Fehler**: der fusion-rules-Abbruch bei fehlender Regeldatei (das dokumentierte Skip-Verhalten ist erkennbar das gewollte) und die verstümmelte awk-Meldung. Beide brauchen eine Coder-Entscheidung, auf welcher Seite korrigiert wird.
4. **Ein Befund korrigiert die Doku in die günstige Richtung**: das walk-out-and-back-Residual ist geschlossen; Guard-Deckung ist besser als dokumentiert. Residual-Katalog und README-hooks müssen nachgezogen werden, sonst unterschlägt die ehrliche Grenzziehung reale Deckung.

## Recommendations

- **coder**: Die zwei mutmaßlichen Code-Fehler klären (fusion-rules `emit_if_exists` unter `set -e`; awk `\x27a`-Escape). Danach Doku-Korrekturen für die 8 Hoch-Records.
- **editor/coder**: Die Mittel- und Niedrig-Records sind mechanische Textkorrekturen; sinnvoll gebündelt pro Datei abzuarbeiten.
- **Strukturell (an shaper/planner, falls gewünscht)**: Abschließende Aufzählungen sind der Wiederholungstäter. Wo eine Liste aus dem Bestand ableitbar ist (Skills, Rule-Emissionen, Manifest-Felder, DEFINITION_SITES), wäre ein Lint-Test nach dem Muster von `path-literal-lint` der dauerhafte Fix — drei solcher Tests existieren bereits und haben ihre Bereiche sauber gehalten.

## Filed Issues

40 Records unter `260805-1840…`–`260805-1842…` (8 hoch, 17 mittel, 15 niedrig; Dateinamen benennen den Befund).

## Sources

Dokumente: alle unter Scope genannten (Repo-Stand 2026-08-05, HEAD 3163281). Code: `hooks/guard.ts`, `hooks/lib/*.ts` (insb. `bash-mutation-guard.ts`, `config.ts:81-103`, `command-word.ts:141`), `hooks/hooks.json`, `hooks/config.json`, `bin/fusion-rules:131,215-217,328-334,452`, `bin/fusion-paths:18,114,169,220-231,339-344`, `bin/fusion-commit-lock:29-31,87,163,179-184`, `bin/fusion-plane`, `skills/*/SKILL.md`, `hooks/lib/__tests__/` (path-literal-lint, provenance-header-lint, context-manifest, fusion-paths, rules-emission-golden — 119 Tests grün via `npx vitest run`). Messung: 229 Guard-Subprozess-Fälle über `guard-harness.ts` (Skript im Session-Scratchpad, `audit-guard.ts`).

## Open Questions

- [ ] README-hooks.md:136 („`protectedPaths: []` in `hooks/config.json` steht den Shell-Check inkl. Fail-closed ab") blieb ungeprüft — erfordert Modifikation der Plugin-Config; nach Code-Lesung plausibel (Floor greift nur bei existierender `fusion-guard.json`), aber nicht gemessen.
- [ ] Die Korpus-Zahlen in README-hooks.md:201 (41.648 Kommandos, 1.418 newly deny, 0 newly allow; 4.424-String-Harvest; „eleven commands") wurden nicht nachgemessen — sie stammen aus einmaligen Messläufen, deren Reproduktion außerhalb dieses Auftrags lag.
- [ ] Nicht geprüft außerdem: `bin/fusion-plane` gegen eine echte Plane-Instanz (nur Code/Usage), Monitor-HTML/JS-Körper, Claude-Code-Mindestversion (README.md:51), Versionshistorie vor v5.5.0, clear-halt/tracker-Laufzeitverhalten, stilwerk-Profile inhaltlich, die installierte Kopie unter `~/.fusion` (diente nur als Auslöser-Beleg für den fusion-rules-Abbruch).
