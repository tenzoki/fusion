# Zustandsmarker auf ein Format ohne Glob-Metazeichen umstellen

---
**Domain:** code
**Status:** closed (coherent)
**Filed by:** orchestrator (auf Entscheidung des Nutzers, 2026-07-17)
**Aktiviert:** 2026-07-17 (nach Abschluss von Circle 1; Nutzer-Auftrag „passe den Marker und folglich das migrate an")
**Geschlossen:** 2026-07-17 (coherent-Verdikt; 7/7 Schritte, v5.0.0)
**Active spec/plan:** circles/260717-1638-marker-format-ohne-glob-metazeichen/planning/260717-1959_c_plan-marker-format-underscore.md
**Active session history:** shared/history/260717-1832-orchestrator-session.md

---

## Directive

Die Zustandsmarker in Dateinamen tragen kein Glob-Metazeichen mehr. Aus `260716-1847[o]-topic.md` wird `260716-1847_o_topic.md`, aus `[t]-circle.md` wird `_t_circle.md`. Das Marker-Vokabular selbst (`o a t c i b s d p`) bleibt unverändert — nur seine Klammern verschwinden. Danach kann kein Muster über einem Marker mehr versehentlich eine Zeichenklasse sein.

## Grounding snapshot

**Der Anlass ist gemessen, nicht vermutet.** Die eckige Klammer ist ein Shell-Glob-Metazeichen. Wer einen Marker in ein Muster schreibt, schreibt versehentlich eine Zeichenklasse — und zwar still, in beide Richtungen:

```
circles/*/[t]-circle.md   → sucht t-circle.md   → leere Menge, kein Fehler
*[o]*.md                  → sucht "enthält o"   → matcht [p], [c], [d] mit
find -name '[t]-circle.md' → derselbe Bug: find globt das Muster selbst
```

Beide Richtungen sind stumm. Bei der leeren Menge expandiert das Muster zu sich selbst, die übliche `[ -e "$f" ] || continue`-Wache verwirft es, und die Zählung meldet null auf einer vollen workbench. Bei der zu lockeren Variante sieht das Ergebnis plausibel aus und enthält Falsches.

**In der Sitzung 260716-1800 hat diese Klasse fünfmal getroffen**, an fünf Stellen, von drei Agenten und dem Orchestrator:

1. Die P-1-Dispatch-Anweisung des Orchestrators schrieb `circles/*/[t]-circle.md`.
2. Der Umbau-Plan schrieb dieselbe Form in Schritt 4 als Vorschrift an P-4.
3. Die Marker-Entscheidung `260716-1910[a]` wiederholte sie.
4. `skills/cleanup/SKILL.md` trug `planning/*[o]*.md` — die zu lockere Richtung.
5. `find -name` wurde als Ausweg vorgeschlagen und hat denselben Bug.

Gefunden wurden sie von `coderev` (Befund `260716-1956`), nicht von den Autoren. Fünf Treffer in einer Sitzung sind kein Konzentrationsproblem, sondern ein Formatproblem.

**Der Vorschlag ist geprüft:**

| Prüfung | Ergebnis |
|---|---|
| Nutzt irgendein bestehender Slug `_`? | nein — Slugs sind durchgehend bindestrich-getrennt, also kollisionsfrei |
| Findet `*_o_*.md` die offenen Dateien? | ja, beide, inklusive einer mit `o` im Slug |
| Matcht `*_o_*.md` versehentlich `_p_` oder `_c_`? | nein |

Der Unterstrich ist weder Shell-Glob- noch Regex-Metazeichen.

**Verworfene Alternativen:**
- `-o-` — metazeichenfrei, aber Slugs *sind* bindestrich-getrennt; `add-o-ring-seal` würde matchen.
- `.o.` oder `topic.o.md` — der Punkt ist im Glob harmlos, im Regex aber „beliebiges Zeichen": tauscht einen Shell-Bug gegen einen Grep-Bug. Zusätzlich kollidiert jeder Marker mit einer echten Dateiendung (`.o` `.a` `.c` `.i` `.s` `.d`).

**Blast-Radius, gemessen am 2026-07-17:** 554 Marker-Nennungen in `agents/`, `skills/` und `rules/`; 31 Dateien mit Marker im Namen in dieser workbench allein. Die Umbenennung selbst ist eine reine Zeichenkettenersetzung (`[x]` → `_x_`); die Arbeit steckt in den 554 Nennungen und in der Migration bestehender Workbenches.

**Was unberührt bleibt:** das Marker-Vokabular, die Bedeutung jedes Markers, die Zustandsübergänge, die Unterscheidung zwischen Defekt, Entscheidung und Circle, die Sortierung (das Datum führt weiter), die Lesbarkeit in `ls` (der Marker steht weiter vorn).

**Offen, gehört in die Spec:** ob eine Migration bestehender Workbenches nötig ist oder ob beide Formate übergangsweise gelesen werden; ob `/fusion:migrate` (aus Circle 1) diese Umbenennung mitträgt; ob der Pfad-Lint aus Circle 1 um eine Bracket-Marker-Prüfung erweitert wird, damit die alte Form nicht zurückkriecht.

## Dependencies

- `fusion-workbench/circles/` (dieser Ordner) — Circle 1 (Container-Umbau, Plan `planning/260716-1910[p]`) sollte geschlossen sein. Begründung: Circle 1 fasst gerade alle 26 Prompts und Skills an; beide Umbauten gleichzeitig verdoppeln den Radius ohne Not. Die Marker-Änderung trifft Dateinamen und Glob-Formen, Circle 1 trifft Pfade — verschiedene Zeilen, also kostet die Reihenfolge nichts außer einem zweiten Durchgang, den die Zuschnitt-Entscheidung `260716-1847[a]` für Prompts ohnehin akzeptiert hat.
- Berührt, aber blockiert nicht: `/fusion:migrate` (Circle 1, T3-B) und der Pfad-Lint (Circle 1, P-8) sind die zwei Stellen, an denen diese Umstellung später andocken würde.

## Turn log

### Turn 1 (Umsetzung, 260717-1832)
Aktiviert nach Abschluss von Circle 1. Sieben Schritte, `coder` (Dogfood durch den Orchestrator), sechs Commits `b95da8d`..`79845f5`:
1. `b95da8d` Definitionsheimat (`rules/`). 2. `2b93123` 12 Agenten + 7 Skills (~365 Tokens, absorb-Globs). 3. `bd53355` Docs. 4. `312c045` migrate+setup erweitert (Reformat-Pass, M1). 5. Dogfood: 38 Workbench-Dateien reformatiert, 0 verloren, Resolver OK. 6. `0da0482` path-lint. 7. `79845f5` v5.0.0.
Gate-Entscheidungen: Scope A (überall), M1 (migrate erweitern), strikter Lint, Hyphen absorb (`_t_circle.md`). Ein Design-Fork unterwegs geklärt: absorb + lockstep-Globs, damit kein `*-circle.md` still ins Leere greift. conceptrev auf den Plan: clean.

## Closure note

**Geschlossen 2026-07-17 als `_c_` (coherent).** reconciler-Verdikt (Protokoll `history/260717-2258-reconciliation.md`, Coherence-Abschnitt in `shared/history/260717-1832-orchestrator-session.md`): alle drei Kanten OK, Directive erreicht, Rebalance none.

- **Artifact↔Directive:** Klammern aus Dateinamen, Globs und Parsern verschwunden; Vokabular/Semantik unverändert; die Glob-Metazeichen-Falle beseitigt und per Lint gegen Rückfall gesichert. v5.0.0, `79845f5`.
- **Verifiziert:** 190 hooks-Tests grün, `plugin validate` passed, Smoke OK, repo-weiter grep = 0, Workbench 0 Klammer-Marker (38 dogfood-reformatiert).
- **Plan** `260717-1959` auf `_c_`; keine Circle-lokalen Decisions.

**Folgearbeit (blockierte den Abschluss nicht):**
- Der zsh-Glob-Fix (Issue `shared/issues/260717-1903_o_...`, Plan `shared/planning/260717-1918_o_...`) ist jetzt entsperrt UND vereinfacht: Stelle 12 (cleanup escaped-bracket) hat sich durch diese Umstellung aufgelöst. Der Plan braucht ein Re-Grounding (Stelle-12-Notiz und Bracket-Preservation-Caveat streichen), bevor er läuft.
- `marketplace.json` auf 5.0.0 beim Release (separates Repo).

## Activation proposal

**Empfohlen als nächster Circle — playmaker-Lauf 260717-1949 (Trigger: orchestrator-phase4).**

Der einzige anticipated Circle, und seine Abhängigkeit ist geklärt: Circle 1 (`260716-1847-workbench-umbau`) ist am 2026-07-17 als `[c]` (coherent) geschlossen. Die `## Dependencies` dieses Circles machten die Marker-Umstellung ausdrücklich davon abhängig, dass Circle 1 zuerst schließt (beide fassen Prompts und Skills an); mit dem Abschluss ist diese Bedingung erfüllt. Alle Abhängigkeiten dieses Circles lösen auf einen geschlossenen (`[c]`) Circle auf — dependencies-closed ist sauber. Die `## Grounding snapshot` zitiert keine offenen (`[o]`) Entscheidungsakten, was ihn unter der code-Domänen-Gewichtung nach vorn schiebt.

**Vorgeschlagener Aktivierungs-Zeitpunkt:** 260717-1949 (oder wann der Nutzer aktiviert).

**Koordinationshinweis, der die Empfehlung nicht aufhebt:** Diese Umstellung teilt sich ihren Blast-Radius (die Skill-/Agent-Globs) mit dem offenen zsh-Glob-Fix-Plan `shared/planning/260717-1918[o]-skill-glob-nomatch-zsh-hardening.md`. Es sind zwei verschiedene Defektklassen (no-match-Abbruch unter zsh vs. Klammer-als-Metazeichen), aber sie berühren dieselben Zeilen — insbesondere Stelle 12 (`skills/cleanup/SKILL.md`, der escaped-bracket-Glob `*\[o\]*.md`, der nur existiert, weil Marker Klammern tragen) und den Pfad-Lint aus Circle 1. Welche Arbeit zweitens landet, muss Stelle 12 und den Lint nachziehen. Die Spec dieses Circles sollte diese Reihenfolge ausdrücklich aufnehmen (die „Offen, gehört in die Spec"-Liste nennt den Lint-Punkt bereits).

*Kein `mv` und kein `.active-circle`-Schreiben durch playmaker — der Nutzer bestätigt via `/fusion:next` (oder der Orchestrator aktiviert). Vorschlag, nicht Vollzug.*
