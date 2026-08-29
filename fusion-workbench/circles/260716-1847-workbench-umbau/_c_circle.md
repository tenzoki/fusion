# Umbau der workbench zum Circle-Container

---
**Domain:** code
**Status:** closed (coherent)
**Filed by:** orchestrator (Circle 1; aktiviert 2026-07-17 im End-to-End-Lauf, Schritt 9; geschlossen 2026-07-17 nach coherent-Verdikt)
**Active spec/plan:** 260716-1910_*_plan-workbench-umbau-circle-container.md
**Active session history:** 260717-1832-orchestrator-session.md

---

## Directive

fusion legt alles, was zu einem Vorhaben gehört, in einem Verzeichnis ab, definiert diese Ablage an genau einer ausführbaren Stelle und stellt alle 15 Agenten und 11 Skills darauf um, ohne Hooks, Marker-Vokabulare oder die Prüfbarkeit über Git anzutasten.

## Grounding snapshot

Circle 1 war quellseitig fertig (Schritte 1–8, 11 committet, `6d4a88d`..`cb5fa80`, Version 4.0.0), als der Plan die Schritte 9 (Migration dieser workbench) und 10 (End-to-End-Lauf) auf die nächste Sitzung zurückstellte — die Entscheidung fiel am Gate 2026-07-17: `/fusion:migrate` beim Start gegen eine ruhende workbench statt mitten in der laufenden Sitzung.

Diese Sitzung (260717-1832-orchestrator-session.md) führt beides aus:

- **Schritt 9 (Migration + Circle-Anlage):** Die pre-v4-workbench wurde per `/fusion:migrate` migriert (45 Artefakte nach `shared/`, 3 Review-Ordner zu `shared/reviews/` zusammengeführt, die eine Circle-Datei zu einem Circle-Verzeichnis; 0 Kollisionen). Anschließend wurde dieser Circle angelegt und aktiviert und die umbau-eigenen Artefakte per Herkunftsregel hineingezogen: Spec, Plan, fünf Decisions (D2 Struktur, D4 Zuschnitt, Marker-Ort, fusion-paths-Namespace, Key-Set-Ableitung) und die vier Juli-16-Protokolle (Orchestrator, Shaper, Planner, Analyst).
- **Was in `shared/` blieb:** die Plane-Decisions (D1 Plane-Rolle, Offline-Verhalten — Herkunft Circle 2) und ältere, unbezogene Protokolle. Herkunft, nicht Haltbarkeit.

## Dependencies

- Circle 2 (Plane-Push) — anticipated, durch D4 zurückgestellt, braucht D3. Die Plane-Decisions liegen bis dahin in `shared/`.
- Circle `archive/260817-1907-safe-cleanup-scoped/260717-1638-marker-format-ohne-glob-metazeichen` (anticipated) hängt am Abschluss dieses Circles: beide fassen Prompts und Skills an; erst schließen, dann die Marker-Umstellung.

## Turn log

### Turn 1 (End-to-End-Lauf, 260717-1832-orchestrator-session.md) — C2-Abnahme
- **Beob. 6** (kein aktiver Circle → `shared/`): analyst-Verifikation → `260717-1910-v4-migration-verification.md`. **PASS.**
- **Schritt 9:** dieser Circle angelegt und aktiviert, 11 Artefakte hineingezogen (Spec, Plan, 5 Decisions, 4 Protokolle), `.active-circle` gesetzt. `fusion-paths orchestrator` löst `OUT_*` jetzt in den Circle auf, `SCAN_*` nennt Circle + `shared/`. **PASS.**
- **Beob. 5** (aktiver Circle → Circle-Ablage): planner plante die zsh-Glob-Härtung (Issue `260717-1903_*_skill-shell-scripts-assume-bash-glob-abort-under-zsh.md`) → `260717-1918[o]-skill-glob-nomatch-zsh-hardening.md` + `260717-1918-planner-session.md`, beide im Circle. Nebenbefund: 14 verwundbare Glob-Stellen in 9 Dateien (Issue nannte 2). **PASS.**
- **Beob. 1** Dashboard zeigt Sitzungszustand: **PASS.** **Beob. 2** `orchestrator-events.jsonl` wächst (107 Zeilen): **PASS.** **Beob. 4** Commit-Sperre greift (acquire→halten→release, sauber): **PASS.**
- **Beob. 3** `.guard-state/` zählt: `events.jsonl` wuchs live mit Guard-Entscheidungen je Write (Write-Guard steht in fusions Repo bestimmungsgemäß still, jede Entscheidung protokolliert) — **PASS**. Nebenbefund: ein absichtlicher `git switch` wurde NICHT abgefangen (kein `git_branch_switch`-Event heute); der Branch-Guard feuerte in dieser Sitzung nicht. Offen zur Klärung.
- **Ergebnis: C2 abgenommen** — alle sechs Beobachtungen durch Lauf belegt, nicht durch Lesen. Ein Nebenbefund (Branch-Guard) offen.

## Closure note

**Geschlossen 2026-07-17 als `[c]` (coherent).** Verdikt des reconcilers (Protokoll `260717-1945-reconciliation.md`, Coherence-Abschnitt in `260717-1832-orchestrator-session.md`): alle drei Kanten OK, Directive erreicht, Rebalance none.

- **Artifact↔Directive:** ein Verzeichnis je Vorhaben (Container), genau eine ausführbare Definitionsstelle (`bin/fusion-paths`, lint-erzwungen), alle 15 Agenten + Skills umgestellt, Hooks/Marker-Vokabular/Git-Prüfbarkeit unberührt. v4.0.0, `cb5fa80`.
- **C2 abgenommen** durch den End-to-End-Lauf dieser Sitzung (sechs Beobachtungen belegt), nicht durch Lesen.
- **Plan** `260716-1910` auf `[c]`; vier Grounding-Decisions auf `[i]` (realisiert); D4 bleibt `[a]` (Circle 2/Plane steht aus).

**Folgearbeit, die den Abschluss nicht blockierte:**
- Der zsh-Glob-Fix-Plan `260717-1918[o]` (14 Stellen) wurde beim Abschluss nach `shared/planning/` gehoben — er deklariert eine eigene Directive und ist eigenständige Folgearbeit, nicht Teil dieses geschlossenen Circles.
- Issues `260717-1903_*_skill-shell-scripts-assume-bash-glob-abort-under-zsh.md` (zsh-Glob) und `260717-1938_*_branch-switch-guard-not-invoked-live-harness-pretooluse-bash.md` (Branch-Guard-Harness-Lücke) bleiben in `shared/issues/` offen.

**Nachgelagert:** Circle 3 (`archive/260817-1907-safe-cleanup-scoped/260717-1638-marker-format-ohne-glob-metazeichen`) war hinter diesem Abschluss gegated und ist jetzt entsperrt.
