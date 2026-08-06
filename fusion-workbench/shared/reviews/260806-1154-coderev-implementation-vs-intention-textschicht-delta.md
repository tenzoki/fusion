# Code Review: Implementation vs. Intention — das Delta `4a8fea0..cde5319` (Guard-Doku-Korrekturen + Textschicht-Circle)

**Sender:** coderev
**Date:** 2026-08-06
**Scope:** die 20 Commits seit dem v5.9.2-Release: `21a72b7..cde5319` (vier Guard-Template/Doku-Commits aus dem Vorgänger-Circle-Rest, dann der vollständige Circle `260805-2005-textschicht-gegen-code-nachziehen`)
**Intentionsquellen:** Circle-Record `circles/260805-2005-…/_c_circle.md`; Entscheidungen D1–D3 (`decisions/260806-0015_*_zitierform…`, `…_*_wem-gehoert-die-circle-aktivierung`, `…_*_veraltete-regeln…`); Plan `planning/260805-2353_*_plan-textschicht-gegen-code.md`; Vorgänger-Plan Schritte 6–8 (`circles/260801-1244-guard-rules-write/planning/260804-1633_*_plan-c5b-remediation-and-ship.md`)
**Methode:** empirisch, nicht berichtsgläubig — jede Kernbehauptung nachgemessen (Kommandos unten je Punkt). Mutation-Checks der Lints per In-Tree-Pflanzung mit sofortigem `git checkout HEAD --`-Revert (Pflanzdatei war vorher git-sauber; Revert verifiziert).

## Verdict

**Die Implementierung deckt die Intention.** Alle vier Code-Fixes reproduzieren gemessen das gewollte Verhalten; die drei Entscheidungen sind so realisiert, wie der Nutzer sie beantwortet hat; die zwei Lints fangen live gepflanzte Defekte beider Klassen; Suite 1611/30 grün; `hooks/dist` byte-identisch zu einem frischen Out-of-tree-`tsc`; der Lock hält unter 16 parallelen Erwerbern. Kein Scope-Creep gefunden — jeder Diff-Hunk ist auf einen Plan-Schritt, eine Entscheidung, einen gefilten Befund oder die Vorgänger-Schritte 6/7 rückführbar. **Drei Lücken bleiben**, alle Text, alle als Issues gefilt (unten): CLAUDE.md kennt die D3/S8-Änderungen nicht (inkl. der nie gelandeten D3-Verhaltensregel a), die cwd-Wurzel-Bindung der Repo-Präferenz ist nirgends ausgesprochen, und ein Meldungs-Zitat der Lock-Regel ist kein Substring der echten Meldung.

## Totals

Critical 0 · High 0 · Medium 1 (CLAUDE.md/D3-Lücke) · Low 2 (cwd-Wurzel-Grenze unausgesprochen; Lock-Zitat nicht wortgetreu)

## Per-Item-Evidenz

### 1. Die vier Code-Fixes — alle nachgemessen, alle korrekt

- **`shared_of` (Archive-Skill, `skills/archive/SKILL.md:51`):** Snippet standalone unter `zsh` und `bash` mit `SCAN_PLANS="circles/…/planning shared/planning"` → beide `[shared/planning]`; die alte Form unter zsh → `[]` (Defekt reproduziert). Leere Ableitung → benannter Abbruch, Exit 1 (`HYG-NO-SILENT-FAIL` realisiert). Die drei Schwester-Skills (cleanup Schritt 1, cadence, log-activity) tragen dieselbe Command-Substitution-Form — der Cross-Cutting-Befund `260806-0709` ist wirklich geschlossen.
- **`emit_if_exists` (`bin/fusion-rules:242-249`):** Scratch-`FUSION_PLUGIN_ROOT` minus `critical-stance.md` → Exit 0, die verbleibenden sechs Always-on-Pfade vollständig emittiert, kein Abbruch mitten im Stream. Contract `rules/agent-setup.md` („skipped silently") hält jetzt unter `set -eu`.
- **Klammer-Sonde (`skills/setup/SKILL.md:43`):** vier Fälle gemessen — `notes [draft].md` → `OLD=0` (Deadlock-Form beseitigt); echte Altmarker-Datei `260101-1200[o]-…` in `shared/` → `OLD=1`; Alt-Circle-Datei unter `circles/` → beide Sonden schlagen an; Altmarker nur unter `archive/` → `OLD=0` (Frozen-Store-Ausschlüsse intakt). Filter = exakt Migrates Executor-Set `\[[oatcibspd]\]-`. Der Rest-Scope-Mismatch ist ehrlich offen gefilt (`issues/260806-0022_*_…` im Circle).
- **awk-Meldung (`bin/fusion-rules:505-506`):** auf `/usr/bin/awk` 20200816 (BWK, die Plattform der Verstümmelung) mit fehlerhaftem Manifest → stderr wörtlich `unit 'docs/big-knowledge.md' is missing 'agents:'`, Exit 3. `\047`-Oktal statt `\x27`-Hex.

### 2. D3 / Repo-Präferenz — verhält sich wie entschieden (Option c), mit einer unausgesprochenen Grenze

- Repo-Wurzel: `./bin/fusion-rules orchestrator|coder` emittiert `$PWD/rules/…` (Work-Tree), coder zusätzlich `protected-path-internals.md`. Temp-Verzeichnis: `$FUSION_PLUGIN_ROOT/rules/…`, ohne internals. Doppel-Emission im Pattern-Durchlauf korrekt unterdrückt (`bin/fusion-rules:456-461`).
- `bin/fusion-paths coderev` liefert von der Repo-Wurzel identische Keys wie die installierte Kopie — konsistent; die Work-Tree-Prompt-Präferenz ist in `fusion-paths.test.ts` getestet (grün).
- **Kante Unterverzeichnis:** aus `hooks/` gemessen → `IN_PLUGIN_REPO=0`, installierte Regeln, keine internals. Im Code ehrlich als „at cwd" kommentiert (`bin/fusion-plugin-cwd:7`), die Konsequenz aber in keinem Text ausgesprochen → **Issue gefilt** (Low; Geschwister: die offenen Tracker-/Guard-cwd-Befunde `260805-1839_*_der-tracker…`, `260804-2100_*_from-a-subdirectory…`).

### 3. S8 Scoping — Emission, Golden, RELEASE_CAP

- Emissionszählung coder: Repo-Wurzel 9 Zeilen (7 Always-on + Chat-Profil + internals), Konsumkontext 7 (ohne beide) — internals-Emission 0 im Konsumkontext, wie der Closure-Note behauptet.
- Golden grün in der vollen Suite; die Rollenstruktur des Tests (`rules-emission-golden.test.ts:374-460`) trägt die Behauptung nach: coder/coderev/bugfixer fallen im Konsumkontext in die Core-only-Rolle (89 896 < Cap 105 354), vier von fünf Rollen unter dem Cap, einzig der Orchestrator darüber (3 094) mit der geforderten `overRelease`-Begründung. Das deckt „drei der vier über dem Deckel liegenden Rollen darunter".

### 4. D2 — Schreiber-Satz und Lock, gegen den Baum gegrept

- `.active-circle`-Schreiber im Baum: orchestrator (Schreiben `agents/orchestrator.md:175`, Löschen `:529`), `/fusion:next` (`skills/next/SKILL.md:154`), circle-stash `rm -f` (`:262`), circle-pop restore (`:228`), migrate re-point (`:98`), cleanup clear-bei-terminal (`:81`). **Exakt** die Enumeration in `rules/fusion-workbench-conventions.md:75`; alle übrigen Treffer sind Leser/Exit-Code-Prosa. Shaper-Modus 3 ehrlich „user-invoked directly, and only directly" (`agents/shaper.md:47`).
- Commit-Sites: orchestrator Phase 2 Step 3b (`agents/orchestrator.md:356`, Lock), `/fusion:commit` Schritt 6 (beide Formen lock-wrapped, Stage+Commit als gehaltenes Paar, `skills/commit/SKILL.md:81,88`), `/fusion:cleanup` **beide** Commit-Phasen (Schritt 2.3 `:93` und Schritt 7 `:140` per Verweis „each stage+commit pair under fusion-commit-lock"). Alle anderen Agenten/Skills verbieten sich Commits explizit. „Always, when any party is about to commit" ist damit gegen jeden existierenden Committer wahr.

### 5. D1 / Referenz-Lint — Mutation-Check live bestanden

Baseline grün (23+18 Tests). Gepflanzt in `rules/circle-records.md`: (a) tote Wildcard-Zitierung `…999999-9999_*_…`, (b) Stale-Marker-Zitierung `260806-0015_o_zitierform…` (existiert als `_i_`). Ein Lauf → **beide** gefangen, mit file:line und selbsterklärender Meldung; die Stale-Marker-Meldung nennt den heutigen Dateinamen und verlangt die `_*_`-Umschreibung. Revert per `git checkout HEAD --`, Status sauber. Enumerations-Lint: Scratch-Skill-Verzeichnis gepflanzt → beide Roster-Assertions rot mit benanntem Phantom, nach Entfernen wieder grün. *(Nicht selbst nachvollzogen: der Falsifier-Lauf gegen den Vor-Korrektur-Commit — der Plan dokumentiert 17/17 Treffer; die Grammatik fängt an HEAD beide Klassen, das genügt mir als Beleg zweiter Ordnung.)*

### 6. Lock unter Last und die holderlosen Pfade

- 16 parallele `with`-Erwerber à 80 ms kritischer Sektion → 32 Log-Zeilen, strikte start/end-Paarung, **Mutual Exclusion gehalten**, Lock-Verzeichnis danach sauber weg.
- Holderloses Verzeichnis, mtime 2 min alt → nächster `acquire` reapt („stale lock detected (held by ?/…)") und erwirbt; jünger als 60 s → blockiert korrekt weiter, mit der dokumentierten „held by ?"-Meldung samt Ausweg. `release` auf holderlos → Verweigerung, Exit 1. Verhalten deckt `rules/workbench-stash-and-lock.md:111-142` — bis auf das nicht-wortgetreue Zitat (**Issue gefilt**, Low).

### 7. Suite + dist

`npx vitest run`: **1611 Tests / 30 Dateien, alle grün** (128 s) — identisch zur Closure-Note. `hooks/dist` gegen frischen `tsc`-Build in Scratch-Kopie (node_modules per Symlink): `diff -r` **byte-identisch**. Die vier hooks/lib-Quelldiffs im Fenster sind kommentar-only (mechanisch geprüft: kein Nicht-Kommentar-± im Diff).

### 8. Monitor

Argv-Verkettung konsistent (6 Positionen, `bin/monitor:70-75` ↔ `:1193`); Usage dokumentiert `MONITOR_BIND`. Gemessen: `MONITOR_BIND=127.0.0.1` → Python lauscht `127.0.0.1:8471`, erreichbar. Default `0.0.0.0` → Socket in diesem (sandboxed) Kontext im CLOSED-Zustand geparkt, curl schlägt fehl — exakt das im Code dokumentierte macOS-Local-Network-Verhalten (`bin/monitor:1153-1156`), dessentwegen die Tests auf Loopback festgelegt wurden; kein Widerspruch zur Intention (LAN-Bind v5.9.2, Test-Determinismus `b90d1c8`). IPv6-Loopback aus dem Tupel entfernt und als AF_INET-Grenze begründet (`:1160-1162`) — der gefilte Befund ist real geschlossen.

### 9. Gaps und Scope-Creep

**Gaps (Intention ohne Landung):**
1. **D3-Verhaltensregel (a)** — laut Entscheidung und Plan-Schritt 3/16 „Zuhause: Release-Prozedur in CLAUDE.md"; nicht vorhanden (grep über CLAUDE.md leer). Teil von Issue 1.
2. **CLAUDE.md insgesamt hinter D3/S8:** keine `bin/fusion-plugin-cwd`-Zeile in der bin-Tabelle (alle anderen Helper haben eine), „Rules loading"-Bullet ohne Repo-Präferenz und ohne internals-Bedingung — die vom Circle bekämpfte Aufzählungs-Klasse, im eigenen Haupt-Dokument neu erzeugt. → Issue 1 (Medium).
3. **cwd-Wurzel-Grenze der Repo-Präferenz unausgesprochen** → Issue 2 (Low).

Kein weiterer Plan-Schritt ohne Landung: Schritt 12s „install.sh header" brauchte an HEAD nichts (Pin-Beispiel stand seit dem v5.9.2-Release korrekt; der LICENSE-Punkt ist bewusst offen als `…install-sh-will-eine-license…`); Batch-B-README-Pin auf real existierendes Tag `v5.9.2` verifiziert (`git tag -l`).

**Scope-Creep: keiner.** Geprüft u. a.: `.gitignore` (+`!bin/fusion-plugin-cwd`, von S16 erzwungen), `bin/fusion-plane`/`bin/fusion-workbench-root` (Wildcard-Zitat, Prosa-False-Positive aus Schritt 14), orchestrator-Dispatch-Tabelle (editor-/playmaker-Zeilen = Batch B/C, Commit `9a96466`, Klasse „stale Aufzählung"), playmaker (tote 260511-1031-Zitate ersetzt, Setup-Bullet auf `circle-records.md` umgezogen), Test-Zuwächse (context-manifest +102 = Schritt-5/7-Regression, fusion-paths +64 = D3, fusion-commit-lock +250 = Turn-4-Lock-Tests, monitor-warnings +8 = Bind), Guard-Template + Wurzelkopie byte-identisch (`cmp`) mit Leaf-Merge-Text (Vorgänger Schritt 6), README-hooks Leaf-Merge/`guard.enabled`/Floor-Reichweite (Vorgänger Schritt 7 + `def351e`).

**Bookkeeping nachgezählt:** Neighbour-Corpus an HEAD 60 `_c_` + 6 `_o_` = 66 ✓; `260805-1859_*_im-eigenen-repo…` geschlossen mit korrigiertem Befundtext ✓; die beiden Inhaltskorrekturen real (`hooks/lib/paths.ts:66-75` sagt jetzt „raised and DEFERRED" und zitiert das existierende `_d_`-Record in Wildcard-Form; `rules/rule-file-provenance.md:52` zitiert `shared/decisions/260801-1020_*_provenance-header-on-rule-files.md`, existiert als `_i_`).

## Gefilte Issues (diese Review)

- `shared/issues/260806-1153_*_claude-md-kennt-weder-fusion-plugin-cwd-noch-repo-praeferenz-noch-die-d3-verhaltensregel.md` (Medium)
- `shared/issues/260806-1153_*_repo-praeferenz-greift-nur-bei-cwd-gleich-repo-wurzel-und-kein-text-sagt-es.md` (Low)
- `shared/issues/260806-1154_*_lock-regel-zitiert-die-release-verweigerung-nicht-wortgetreu.md` (Low)

## Empfohlene Reihenfolge

Nichts davon blockiert ein Release: das Medium-Issue betrifft die dev-only CLAUDE.md, die zwei Lows sind Text. Sinnvoll als ein kleiner Doku-Batch vor dem nächsten Release-Tag, zusammen mit dem offenen Circle-Residual `260806-0022_*_setup-klammer-probe…`.
