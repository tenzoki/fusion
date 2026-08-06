# Coder session — Plan-Schritt 17: Bookkeeping, Befunde am Ort schließen

**Date:** 2026-08-06
**Agent:** coder
**Plan:** `circles/260805-2005-textschicht-gegen-code-nachziehen/planning/260805-2353_*_plan-textschicht-gegen-code.md`, Schritt 17 (jetzt [DONE]; Plan Status Complete, `_p_`→`_c_`)
**Status:** Complete

## Was getan wurde

Der 66-Record-Korpus in `circles/260801-1244-guard-rules-write/issues/` (Zeitstempel `260805-18*`/`19*`) wurde vollständig gegen die sechs Evidenz-Histories dieses Circles und gegen HEAD abgeglichen. Jeder Schließungskandidat wurde vor dem Schließen per grep am HEAD verifiziert — nicht aus den Histories übernommen. Die Verifikation hat sich gelohnt: fünf Records, die die Histories implizit als erledigt führten, sind es nicht oder nur zur Hälfte.

## Endabrechnung (66 = 51 + 3 + 6 + 6)

- **51 geschlossen** (`Resolved:`-Footer mit Commit-Zitat, `_o_`→`_c_`), nach auflösendem Commit:
  - 7ef2715 (Track 1): agent-setup-fehlende-regeldatei, fusion-rules-awk-hex, setup-lockout-rest, shared-of-zsh — 4
  - c45fb44 (S8): protected-path-internals-erreicht — 1
  - 81d4154 (S9/D2): shaper-portfolio-activation, circle-aktivierung-drei-parteien, lock-regel-always, konventionen-active-circle — 4
  - fae818b (S10/S13): beispielpfade, konventionen-012, konventionen-auto-loaded, decision-examples ×2, circle-records ×2, stash-manifest, stash-lock-drei-tote (Header-Teil 9a96466), ppd-leere-liste, wpr-cited, wpr-log-activity, provenance-binding — 13
  - 9a96466 (S11/S12): claude-md ×5 (vier-veraltete, zwei-tote, symptomzeile, templates, wrapper-programs, docs-zeile = 6), seed-from-plane, readme-fusion-ref, readme-hooks ×3 (residual, effective, files-tabelle) + dateitabelle-1839, readme-agents ×4, readme-config-example, readme-setup-kopierliste, cleanup-modellname, selbstbeschreibung-orchestrator, kommentar-drift, commit-lock-header, circle-pop, plane-config-header, header-kleinbefunde (Punkt 3 → Schwester-Record), sechs-kleinbefunde, help-verweist, log-activity-scannt — 28
  - fae818b+a1b7872 gemeinsam: ausgelieferte-texte-acht-records — 1
- **3 vor diesem Schritt geschlossen:** der-circle-datensatz (`_c_`), fusion-guard-template (`_c_`), im-eigenen-repo-laden (`_c_`, S13).
- **6 explizit offen per Plan:** alle-17-guard-blocks (→ Reachability-Circle), coder-beschreibung-rust, domaenenheuristik, guard-event-log, tracker-cwd (paart mit 260804-2100), install-sh-license (User-Entscheidung). Unberührt gelassen; der Plan verlangt keine Routing-Notiz am Record.
- **6 Residuen, die die Plan-Partition nicht vorsah:**
  - 3 halb gelöst, Progress-Note angehängt, offen gelassen: **acht-zitate** (README-hooks/provenance/fusion-plane/paths.ts:72 behoben; `config.ts:103`, `paths.ts:121`, `bash-mutation-guard.ts:171,1194,2092` tragen weiter `_a_`-Marker realer `_i_`-Records — hooks/lib liegt außerhalb des Referenz-Lint-Dateisatzes); **wpr-und-migrate** (wpr behoben; `skills/migrate/SKILL.md:16` weiter falsch — von Batch C nicht erfasst); **fusion-paths-header** (Helper behoben; `skills/migrate/SKILL.md:14` Zwei-Orte-Zuschreibung bleibt).
  - 3 ungelöst, unberührt: **holderloses-lock-verzeichnis** (`is_stale_lock` beginnt am HEAD weiter mit `[ ! -f "$HOLDER_FILE" ] && return 1` — kein Commit dieses Circles fasst es an), **playmakers-setup** (`agents/playmaker.md` Bullet 1 zitiert "State Markers — circles" weiter gegen die Konventionsdatei, Schlusssatz unverändert), **context-manifest-stops** (`rules/context-manifest.md:144-148` unverändert; Batch C verwies an Batch A, Batch A hat rules/context-manifest.md nicht angefasst).

## Plan-Nacharbeit

- Schritt 17 [DONE] mit der Endabrechnung als Annotation (die drei nur-namentlich genannten Nicht-Korpus-Records `beim-filen`/`plane-testfixture`/`2323-emissionsmessung` dort klargestellt).
- Status Draft → Complete; `_p_` → `_c_` umbenannt.
- Open-Questions-Box 1 (D1/D2/D3) abgehakt — alle drei beantwortet und realisiert.

## Beobachtung für den Orchestrator

D1 (`decisions/260806-0015_a_zitierform-fuer-workbench-records.md`) steht noch auf `_a_`, obwohl seine Antwort realisiert ist (der Referenz-Lint a1b7872 erzwingt die Wildcard-Grammatik und zitiert D1). Der `_a_`→`_i_`-Übergang gehörte dem realisierenden Schritt (S14) und wurde dort nicht vollzogen; dieser Task hat die Realisierung nicht produziert und den Marker deshalb nicht angefasst. Ein Einzeiler beim Circle-Closure (Implemented-Footer mit a1b7872) schließt die Lücke.

## Verifikation

- Alle 51 `_c_`-Renames tragen einen Footer mit mindestens einem Commit-Hash (Konstruktion: Footer und Rename im selben Block, Pfade literal per Plan-Anweisung).
- Verbleibende `_o_` im 18*/19*-Korpus: 12 (= 6 explizit + 3 halb + 3 ungelöst) — per `ls` gezählt.
- Kein Commit erzeugt (per Auftrag; der Orchestrator committet).
