# Coder-Session: Plan-Schritte 8 und 16 (Emission-Gate + D3-Realisierung)

**Agent:** coder
**Datum:** 2026-08-06
**Auftrag:** Plan `260805-2353_*_plan-textschicht-gegen-code.md`, Schritte 8 ("Independent scoping change") und 16 (D3, Option c)
**Status:** Complete

## Was implementiert wurde

### Gemeinsames Fundament (einmal implementiert, zweimal genutzt)

- **Neu: `bin/fusion-plugin-cwd`** — Shell-Hälfte von `hooks/lib/self-detect.ts` `isFusionPluginCwd()`: Exit 0 wenn `./.claude-plugin/plugin.json` am cwd existiert und `"name": "fusion"` trägt, sonst 1. Paarung mit der TS-Implementierung im Header kommentiert (ein Kriterium, zwei Implementierungen).

### Schritt 8 — Guard-Internals-Emission nur noch im Plugin-Repo

- `bin/fusion-rules`: Block 1d zusätzlich auf `IN_PLUGIN_REPO` gegated. In einem konsumierenden Projekt ist die Adressatenschaft ("wer den Classifier ändert oder reviewt") leer per Konstruktion — die Classifier-Quellen liegen in der installierten Kopie außerhalb des Projektbaums. Header-Kommentare (Suchorte, Guard-Internals-Absatz, Flag-Block) nachgezogen.
- Golden regeneriert per dokumentierter Prozedur (`UPDATE_RULES_GOLDEN=1`, dann Lauf ohne Flag). Diff: exakt coder/coderev/bugfixer verlieren `protected-path-internals.md` (21 870), 112 748 → 90 878; sonst nichts.
- `rules-emission-golden.test.ts`: Rolleneintrag `protected-path-internals.md` samt `overRelease` entfernt (kein Agent misst mehr in diese Rolle — die Prozedur verlangt Entfernen statt Hinzufügen); Rollen-Kommentar 6→5 Rollen aktualisiert; `RULE_BASELINE`-Eintrag mit Begründung behalten; Historienzeile 90 878 (2026-08-06) angehängt.
- Falsifier des Plans adressiert: neuer Test "measures the consuming-project context" — asserted, dass der neutrale cwd das Repo-Kriterium NICHT erfüllt, und dass das Gate real ist (im Repo emittiert coder die Referenz, im neutralen cwd nicht).

### Schritt 16 — D3 Option (c): Repo-eigene Quelle bevorzugen

- `bin/fusion-rules`: `PLUGIN_RULES_DIR` = `$PWD/rules` wenn cwd das Plugin-Repo ist, sonst wie bisher `$FUSION_PLUGIN_ROOT/rules`. Doppel-Emission im Pattern-Durchlauf abgefangen (im Repo sind Plugin- und Projekt-Rules-Verzeichnis identisch).
- `bin/fusion-paths`: **Änderung ist warranted** — das Skript liest plugin-root-relative Ressourcen (die Prompt-Dateien `agents/<name>.md` / `skills/<name>/SKILL.md`, aufgelöst über den eigenen Installationsort). Im Plugin-Repo wird `PLUGIN_ROOT=$PWD` gesetzt, damit Key-Sets aus den Arbeitsbaum-Prompts statt aus der Install-Kopie abgeleitet werden. Die Prompt-Dateien sind die einzige solche Ressource; die Präferenz ist eine Zuweisung.
- Neuer Test in `rules-emission-golden.test.ts` ("prefers the work tree's rules..."): aus dem Repo, mit `FUSION_PLUGIN_ROOT` auf ein leeres Verzeichnis gezeigt, kommt die Emission vollständig aus dem Arbeitsbaum.
- Neue Tests in `fusion-paths.test.ts` (describe "plugin-repo preference"): Fake-Repo mit eigenem Prompt wird aufgelöst (Präferenz), Fake-Repo mit fremdem Plugin-Namen nicht (Bound = Name, nicht Manifest-Existenz). Staging-Listen in `fusion-paths.test.ts` und `context-manifest.test.ts` um den neuen Sibling-Helper erweitert.
- D3-Record: `Implemented:`-Footer angehängt, `_a_` → `_i_` umbenannt (`260806-0015_*_veraltete-regeln-im-eigenen-repo-melden-oder-umgehen.md`). Verhaltensregel (a) bleibt Dokumentation (Release-Prozedur in CLAUDE.md; Textabgleich gehört Plan-Schritt 11).

## Verifikation

- Repo-Root: `bin/fusion-rules coder` emittiert Repo-Pfade inkl. `protected-path-internals.md`; `bin/fusion-rules orchestrator` emittiert 9 Repo-Regelpfade, null Pfade der installierten Kopie — beide Läufe mit `FUSION_PLUGIN_ROOT=~/.fusion`.
- Temp-Verzeichnis (konsumierendes Projekt): `protected-path-internals.md` fehlt; Emission sonst unverändert (Golden byte-genau).
- Suite: 26 von 27 Test-Dateien grün (1550 Tests), darunter alle drei angefassten. **Rot (vorbestehend, HEAD-Defekt):** `monitor-warnings-panel.test.ts`, 9 Tests — Commit `8586ba3` (Bind `0.0.0.0`) bricht auf dieser Maschine Loopback-Verbindungen anderer Prozesse. Per Zwei-Prozess-Experiment isoliert, mit und ohne Sandbox reproduziert, von diesem Task unabhängig (kein Input-File gemeinsam). Als Issue gefiled: `260806-0820_*_monitor-bind-0000-bricht-loopback-verbindungen-neun-tests-rot.md`.

## Zahlen (Consuming-Kontext, Golden)

| Rolle | vorher | nachher | RELEASE_CAP 105 354 |
|---|---|---|---|
| coder/coderev/bugfixer | 112 748 | 90 878 | jetzt darunter (−21 870) |
| shaper | 105 853 | 105 853 | unverändert, 499 drüber (Floor darunter) |
| orchestrator | 109 430 | 109 430 | unverändert drüber (Floor 108 448, `overRelease` bleibt) |
| übrige Rollen | unverändert | unverändert | darunter |

## Geänderte Dateien

- `bin/fusion-plugin-cwd` (neu)
- `.gitignore` (`!bin/fusion-plugin-cwd` — ohne die Ausnahme wäre der Helper still aus der Distribution gefallen und beide Skripte hätten in installierten Kopien bei jedem Aufruf ein command-not-found gestreut)
- `bin/fusion-rules`
- `bin/fusion-paths`
- `hooks/lib/__tests__/fixtures/rules-emission.golden` (regeneriert)
- `hooks/lib/__tests__/rules-emission-golden.test.ts`
- `hooks/lib/__tests__/fusion-paths.test.ts`
- `hooks/lib/__tests__/context-manifest.test.ts` (Staging-Liste)
- Workbench: D3-Record (`_a_`→`_i_` + Footer), Plan-Schritte 8/16 `[DONE]`, neues Issue (Monitor-Bind)
