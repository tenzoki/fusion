# Coder session — Plan-Schritte 10 (Batch A: rules/) und 13 (Inhaltskorrekturen)

**Status:** Complete
**Plan:** 260805-2353_*_plan-textschicht-gegen-code.md (Schritte 10, 13)
**Zitierform:** D1, Option (a) — Wildcard `YYMMDD-HHMM_*_<slug>` (260806-0015_*_zitierform-fuer-workbench-records.md)

## Schritt 10 — Batch A, Korrekturen in rules/

Jede Korrektur gegen den Code am HEAD verifiziert, nicht gegen den Befund-Snapshot:

- `rules/fusion-workbench-conventions.md` — (1) „auto-loaded by the plugin system" ersetzt durch den realen Mechanismus (Emission durch `bin/fusion-rules` in Setup Schritt 2); (2) Exit-Code-Abschnitt: die „same 0/1/2 shape"-Behauptung korrigiert — `bin/fusion-rules` hat selbst Exit 3 (malformes `context-manifest.yaml`, Zeile 592), Tabellenzeile 3 sagt jetzt „code collides" und der Folgetext warnt vor Fehldeutung; (3) `_i_→_s_` als die eine erlaubte Terminal-zu-Terminal-Transition in der normativen Terminal-Regel verankert.
- `rules/decision-record-examples.md` — zwei Prä-v4-Beispielpfade auf `shared/decisions/` umgestellt; Überschrift Example 2 von `_a_ → _s_` auf `_i_ → _s_` korrigiert (der Körper führte immer `_i_→_s_` vor); der Norm-Satz verweist jetzt auf die Konventionsdatei statt allein zu normieren.
- `rules/user-facing-output.md` — Prä-v4-Beispielpfad `fusion-workbench/history/…` → `fusion-workbench/shared/history/…`.
- `rules/protected-path-discipline.md` — die Leere-Liste-Behauptung korrigiert: eine deklarierte leere Liste leert die Plugin-Defaults, steht den Check aber NICHT ab — der Floor (`fusion-guard.json` selbst) hält Mutation-Check und Fail-closed am Leben (gemessen im Befund, Ursache `hooks/lib/config.ts` Floor).
- `rules/circle-records.md` — (1) Skill-Zitierliste auf den gemessenen Bestand korrigiert (`next`, `direct`, `migrate` zitieren; cleanup/archive/circle-stash/setup nicht — per grep am HEAD erneut verifiziert); (2) Binding-Decision-Pfad vollqualifiziert und in Wildcard-Form: `260716-1910_*_circle-marker-am-verzeichnis-oder-an-der-circle-datei.md`.
- `rules/workbench-path-resolution.md` — (1) „cited directly by bin/fusion-paths" gestrichen (fusion-paths zitiert nur die Konventionsdatei; CLAUDE.md zitiert wpr); (2) das tote log-activity-Beispiel durch ein lebendes ersetzt (`/fusion:cadence` schreibt `$OUT_MEMO`, das kein Agenten-Prompt nennt — verifiziert per grep über agents/); (3) Pre-v4-Pointer-Ablehnung: Mechanismus ehrlich beschrieben (Orphan-Check, nicht Format-Erkennung) mit korrigierter Zeilenzitation `bin/fusion-paths:245-248`.
- `rules/workbench-stash-and-lock.md` — „nine fields" dreimal auf zehn korrigiert (Schema-Block und `skills/circle-stash` schreiben zehn; Historie 10→9→10 im Text nachgezogen); drei tote Record-Zitate nach der Regel aus `260805-0709_*_wohin-gehoert-die-forensik-aus-protected-path-discipline.md` behandelt: Beleg-Substanz in den Text, toter Pfad gestrichen (Multi-Stash-Design, Cross-references-Sektion, Staging-Race-Issue).
- `rules/agent-setup.md` — **keine Textänderung nötig**: der Skip-silently-Satz ist seit Schritt 5 (`emit_if_exists` return 0) wahr; am HEAD verifiziert.

Nicht angefasst, mit Grund: `konventionen-active-circle-nothing-else-touches-it` war durch Schritt 9 (Commit 81d4154) bereits realisiert; die migrate-Hälfte von `wpr-und-migrate-…` (wortgleicher Satz in `skills/migrate/SKILL.md:16`) gehört zu Batch C (Schritt 12) — Dateibindung dieses Tasks war rules/ only.

## Schritt 13 — Inhaltskorrekturen

- `hooks/lib/paths.ts` (Kommentar bei `matchesAny`) — Falsifier zuerst geprüft: der Fold-Case-Record steht auf `_d_` (deferred, User 2026-08-04), nicht `_o_`. Kommentar sagt jetzt die Deferral-Entscheidung (case-sensitiv bleibt, Revisit-Trigger benannt) und zitiert in Wildcard-Form. `hooks/dist` per `tsc` neu gebaut (Kommentar landet im kompilierten JS; Installer-Invariante).
- `rules/rule-file-provenance.md` — Form 1 auf die Wildcard-Zitierform umgeschrieben, Rationale deckt jetzt Marker-Übergänge ab (inkl. des Eingeständnisses, dass die eigene Binding-Decision-Zeile genau daran starb); Beispiel Zeile 32 und Binding-Decision-Zeile 48 in Wildcard-Form; D1-Record als bindend zitiert.
- Befund `260805-1859` — Korrektur angehängt (nicht umgeschrieben) per `_t_circle.md` „Die Korrektur am High-Befund": Session-Start-Pinning ist Design, kein Defekt; der reale Rest (Stale-Rules-Fenster) durch D3/Schritt 16 behoben (Commit c45fb44). `Resolved:`-Footer, `_o_`→`_c_`.

## Golden und Tests

- Emissions-Golden absichtlich regeneriert (Flag-Prozedur aus dem Test-Header, zweiter Lauf ohne Flag grün). Bewegung nach Trimm-Pass: user-facing-output +7, protected-path-discipline +138, fusion-workbench-conventions +304, decision-record-examples +100, circle-records +3, workbench-stash-and-lock +164 Bytes; Agent-Totale +549 (Orchestrator +712, jetzt 111 272). Floors (`RULE_BASELINE`) unverändert — keiner kreuzt `RELEASE_CAP`; das Budget meldet, blockiert nicht.
- Volle Suite grün: **1560 Tests, 27 Dateien** (Baseline 1560).

## Für Schritt 17 (Bookkeeping) — durch diesen Task aufgelöste Befunde

Alle in `circles/260801-1244-guard-rules-write/issues/`, offen gelassen bis auf 1859:

1. `260805-1840_*_beispielpfade-in-always-on-rules-zeigen-prae-v4-layout` — behoben (beide Dateien)
2. `260805-1840_*_konventionen-012-shape-verschweigt-fusion-rules-exit-3` — behoben
3. `260805-1841_*_konventionen-auto-loaded-by-the-plugin-system` — behoben
4. `260805-1840_*_decision-examples-i-nach-s-nur-in-beispielen-normiert` — behoben (in Konventionen normiert)
5. `260805-1840_*_decision-examples-ueberschrift-a-s-koerper-i-s` — behoben
6. `260805-1840_*_circle-records-vier-von-sechs-zitierenden-skills-zitieren-nicht` — behoben
7. `260805-1841_*_circle-records-binding-decision-pfad-loest-nicht-auf` — behoben
8. `260805-1840_*_stash-manifest-neun-felder-bei-zehn` — behoben
9. `260805-1841_*_stash-lock-drei-tote-record-zitate` — behoben (nur die rules-Hälfte; `bin/fusion-commit-lock:4-5` gehört zu Batch C)
10. `260805-1841_*_wpr-cited-directly-by-fusion-paths-stimmt-nicht` — behoben
11. `260805-1841_*_wpr-log-activity-beispiel-vom-heutigen-skill-ueberholt` — behoben
12. `260805-1841_*_wpr-und-migrate-falscher-mechanismus-fuer-prae-v4-pointer-ablehnung` — wpr-Hälfte behoben; migrate-Hälfte → Schritt 12
13. `260805-1840_*_ppd-leere-liste-steht-den-check-nicht-ab` — behoben
14. `260805-1842_*_provenance-binding-decision-marker-gewandert` — behoben
15. `260805-1840_*_agent-setup-fehlende-regeldatei-bricht-emission-ab` — durch Schritt 5 behoben (verifiziert, kein Textbedarf)
16. `260805-1859_*_im-eigenen-repo-laden-alle-agenten-…` — korrigiert UND geschlossen (`_c_`, einziger Close dieses Tasks, per expliziter Task-Anweisung)
