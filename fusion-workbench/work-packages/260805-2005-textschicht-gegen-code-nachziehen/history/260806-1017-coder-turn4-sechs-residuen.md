# Coder session — Turn 4: die sechs Residuen aus der S17-Endabrechnung

**Date:** 2026-08-06
**Agent:** coder
**Task:** Orchestrator-Dispatch (Turn 4, Circle 260805-2005-textschicht-gegen-code-nachziehen) — die sechs Residuen schließen, die `260806-1015-coder-s17-bookkeeping-befundschliessung.md` benannt hat: drei halb gelöste (Progress-Note), drei ungelöste.
**Status:** Complete

## Was getan wurde

Alle sechs Records in `circles/260801-1244-guard-rules-write/issues/` sind behoben, mit `Resolved:`-Footer geschlossen und `_o_`→`_c_` umbenannt. Im 18*/19*-Korpus verbleiben genau die 6 explizit-offen-per-Plan (per `ls` gezählt).

1. **acht-zitate (halb)** — die fünf verbliebenen `_a_`-Zitate in Wildcard-Form gebracht: `hooks/lib/config.ts:103`, `hooks/lib/paths.ts:121`, `hooks/lib/bash-mutation-guard.ts:171,1194,2092`. Referenz-Lint auf hooks/lib-Kommentarzeilen erweitert (`reference-resolution-lint.test.ts`, neues `recordsOnly`-Feld): **nur Klasse (c)** — ein Probelauf mit allen drei Klassen produzierte ~30 Klasse-(a)-Fehlalarme aus fabrizierten Guard-Doku-Operanden (`rules/retired`, `rules/link`, `rules/up/x`, …), die je einen EXAMPLE_PATHS-Eintrag gebraucht hätten; Begründung steht im Test am Feld. Die Erweiterung fand sofort ein sechstes verfallenes Zitat: `hooks/lib/shell-parse.ts:131` (`260804-0947_*_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md`, real `_i_`, dazu die inhaltlich falsche „both are open"-Behauptung) — mitkorrigiert. `hooks/dist` neu gebaut: die Kommentare stehen in den kompilierten `.js`/`.d.ts` (geprüft per grep vor/nach Build); kein Altmarker der Tabelle mehr in dist.
2. **fusion-paths-header-Rest** — `skills/migrate/SKILL.md:14` zitiert statt der Zwei-Orte-Zuschreibung jetzt das Literal-Verbot der Konventionsdatei plus die `DEFINITION_SITES`-Aufzählung in `path-literal-lint.test.ts`.
3. **wpr-und-migrate-Rest** — `skills/migrate/SKILL.md:16` trägt den ehrlichen Mechanismus (Orphan-Check, nicht Format-Erkennung) mit Zitation `bin/fusion-paths:245-248`; Zeilennummern am Stand verifiziert.
4. **holderloses-lock-verzeichnis (Code-Fix)** — `bin/fusion-commit-lock`: `is_stale_lock` altert ein holderloses Lock-Verzeichnis über dessen eigenes mtime (neuer portabler Helfer `mtime_epoch`, BSD/GNU-stat-Fallback analog `ts_to_epoch`); jünger als 60s → blockiert weiter, älter → force-released beim nächsten acquire. `waiting`-Meldung nennt im `?`-Fall den holderlosen Zustand, `check`, das manuelle Entfernen und die Frist; `release` verweigert holderlos jetzt mit ehrlicher Meldung. Neu: `hooks/lib/__tests__/fusion-commit-lock.test.ts` (spawnSync-bash-treibend, 9 Tests: acquire/release/with/check, holderlos jung/alt, toter-PID-Reap, lebender Halter blockiert).
5. **playmakers-setup** — `agents/playmaker.md` Setup-Punkt 4: Einleitung zeigt auf `rules/circle-records.md` (beide zitierten Abschnitte leben dort), redundanter Einschub im Template-Bullet entfernt, die zwei Glob-Formen einzeln gegen `rules/fusion-workbench-conventions.md` `## Marker globs` zitiert, Schlusssatz nennt circle-records als kanonische Quelle.
6. **context-manifest-stops** — `rules/context-manifest.md` `## Fail-closed on a malformed manifest` sagt jetzt: laut, nicht still, aber nicht ausgabefrei — das Always-on-Set steht beim Manifest-Read bereits auf stdout; der Exit-Code ist der Schutz. **Golden nicht regeneriert:** `context-manifest.md` steht nicht im Dateisatz von `fixtures/rules-emission.golden` (per grep geprüft — sie wird keinem Agenten always-on emittiert).

## Verifikation

- Volle Suite grün: **30 Dateien, 1608 Tests** (Baseline 1599 + 9 neue Lock-Tests), inkl. Referenz-Lint mit der hooks/lib-Erweiterung, path-literal-lint und rules-emission-golden.
- `bash -n bin/fusion-commit-lock` sauber; die 9 Lock-Tests treiben das echte Skript gegen eine Wegwerf-Workbench.
- Kein Commit erzeugt (per Auftrag; der Orchestrator committet).

## Geänderte Dateien

- `hooks/lib/config.ts`, `hooks/lib/paths.ts`, `hooks/lib/bash-mutation-guard.ts`, `hooks/lib/shell-parse.ts` (Zitate → Wildcard; shell-parse auch inhaltlich)
- `hooks/dist/lib/*` (Rebuild)
- `hooks/lib/__tests__/reference-resolution-lint.test.ts` (hooks/lib-Abdeckung, Klasse c)
- `hooks/lib/__tests__/fusion-commit-lock.test.ts` (neu)
- `bin/fusion-commit-lock` (Stale-Fix + Meldungen)
- `skills/migrate/SKILL.md` (:14, :16)
- `agents/playmaker.md` (Setup-Punkt 4)
- `rules/context-manifest.md` (Fail-closed-Absatz)
- 6 Issue-Records geschlossen in `circles/260801-1244-guard-rules-write/issues/`
