# Coder Session — die drei Textbefunde der Intention-Review geschlossen

**Agent:** coder
**Date:** 2026-08-06
**Status:** Complete
**Grounding:** 260806-1154-coderev-implementation-vs-intention-textschicht-delta.md; die drei Issues 260806-1153/-1154 (jetzt `_c_`)

## What was done

1. **CLAUDE.md hinter D3/S8 nachgezogen** (Issue `260806-1153_*_claude-md-kennt-weder-fusion-plugin-cwd-noch-repo-praeferenz-noch-die-d3-verhaltensregel.md`, Medium):
   - Layout-Tabelle: neue Zeile `bin/fusion-plugin-cwd` (nach `bin/fusion-workbench-root`) — Shell-Hälfte von `isFusionPluginCwd()`, Konsumenten (`fusion-rules`: Work-Tree-Regeln + internals-Emissionsgate; `fusion-paths`: Work-Tree-Prompts), at-cwd-Bindung, Entscheidungszitat in Wildcard-Form.
   - „Rules loading"-Bullet: Work-Tree-Präferenz im eigenen Repo ergänzt, inkl. internals-Emission nur dort, dem Vier-Tage-Stale-Fall als Begründung und der cwd-Wurzel-Grenze.
   - Release-Prozedur: D3-Verhaltensregel (a) als Absatz nach Schritt 6 — `fusion --update` plus Neustart vor Regel-/Guard-Arbeit; Begründung: Guard/Tracker laufen weiterhin aus der installierten Kopie.
2. **cwd-Wurzel-Grenze ausgesprochen** (Issue `260806-1153_*_repo-praeferenz-greift-nur-bei-cwd-gleich-repo-wurzel-und-kein-text-sagt-es.md`, Low): in beiden neuen CLAUDE.md-Stellen plus README-agents.md:156 (Klammersatz nach „own repo only"). README-hooks.md und Regel-Dateien geprüft: beschreiben den Helfer-Mechanismus nicht, keine Änderung — die self-detect-Zeile in README-hooks.md betrifft den Guard-Stand-down, dessen cwd-Wurzel-Geschwister separat offen sind (guard-rules-write Circle, `260805-1839_*_`, `260804-2100_*_`).
3. **Lock-Zitat wortgetreu** (Issue `260806-1154_*_lock-regel-zitiert-die-release-verweigerung-nicht-wortgetreu.md`, Low): `rules/workbench-stash-and-lock.md` Failure-modes-Zeile auf den grep-stabilen Substring `records no holder; refusing to guess` gekürzt (Skript unverändert). Emissions-Golden per dokumentierter Prozedur regeneriert; Fixture-Diff nur `workbench-stash-and-lock.md` 11180→11208 (Orchestrator-Total 112633).

## Verification

- Voller Lauf `cd hooks && npx vitest run`: **1611/1611 grün, 30 Dateien** (Baseline getroffen).
- Der Referenz-Lint hat einen eigenen Slip live gefangen: die Phrase „the rules/paths helpers" im neuen Release-Absatz matchte als Pfad-Token `rules/paths` → umformuliert zu den beiden Skriptnamen; danach grün.

## Changed files

- `CLAUDE.md` (drei Stellen)
- `README-agents.md` (Zeile 156)
- `rules/workbench-stash-and-lock.md` (ein Zitat)
- `hooks/lib/__tests__/fixtures/rules-emission.golden` (regeneriert)
- die drei Issue-Dateien: Resolved-Footer + `_o_`→`_c_`

Nicht committet (Auftrag des Orchestrators).
