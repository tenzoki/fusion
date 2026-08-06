# Veraltete Regeln im eigenen Repo: nur dokumentieren, warnen, oder die Quelle bevorzugen?

---
**Domain:** code
**Status:** open
**Filed by:** coder
**Cross-references:** circles/260805-2005-textschicht-gegen-code-nachziehen/planning/260805-2353_p_plan-textschicht-gegen-code.md (Track 2, Schritt 3; Schritt 16 realisiert die Antwort); circles/260801-1244-guard-rules-write/issues/260805-1859_o_im-eigenen-repo-laden-alle-agenten-die-regeln-der-installierten-vorversion-nicht-die-quelle.md (das High-Finding; erhält in Plan-Schritt 13 die Korrektur „kein Defekt, aber realer Rückstand"); hooks/lib/self-detect.ts (`isFusionPluginCwd()` — das existierende Repo-Kriterium)

---

## Question

Der Mechanismus des High-Findings ist verstanden und kein Defekt: `hooks/hooks.json` SessionStart schreibt `export FUSION_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}` einmal pro Sitzung in `$CLAUDE_ENV_FILE`; alle `bin/`-Helper lösen darüber auf. Wer im Plugin-Repo selbst arbeitet, liest deshalb die Regeln der **installierten** Kopie (`~/.fusion`), nicht die der Quelle im Arbeitsbaum — eine viertägige Sitzung las v5.8.0-Regeln, während sie v5.9.1-Quellen editierte. Vor dem Filing gegen `hooks/hooks.json` geprüft: es gibt keinen Hook, der pro Turn neu auflöst; das Staleness-Fenster ist wirklich die ganze Sitzungsdauer, nicht kleiner. Zu entscheiden ist die Folgemaßnahme: reicht eine Verhaltensregel, oder soll fusion den Zustand erkennen und melden — oder im eigenen Repo gleich die eigene Quelle laden?

## Options

1. **Nur Verhaltensregel** — dokumentieren: „vor Regel-Arbeit im Plugin-Repo `fusion --update` ausführen und die Sitzung neu starten"; die Release-Prozedur in `CLAUDE.md` trägt den Check.
   - Pros: Null Code, null Risiko; die Vier-Tage-Sitzung wäre damit vermeidbar gewesen.
   - Cons: Verlässt sich auf Erinnern — genau das hat vier Tage lang nicht funktioniert; niemand meldet den Zustand, wenn die Regel vergessen wird.
2. **SessionStart-Warnung bei Versions-Differenz** — wenn cwd das Plugin-Repo ist (`isFusionPluginCwd()`) und die installierte Version ≠ Quell-Version (`.claude-plugin/plugin.json` beider Seiten), gibt SessionStart eine sichtbare `systemMessage` aus.
   - Pros: Billig, advisory, kein Verhaltens-Eingriff; macht den unsichtbaren Zustand am einzigen Zeitpunkt sichtbar, an dem er entsteht (Sitzungsstart); kompilierte Hooks sind ohnehin committet (Installer-Invariante).
   - Cons: Warnt nur bei Versions-**Sprung** — gleiche Versionsnummer mit geänderten Quell-Regeln (der Normalfall während der Entwicklung vor dem Bump) bleibt stumm; Hook-Änderung + `dist`-Rebuild + Test nötig.
3. **Helper bevorzugen im Plugin-Repo die eigene Quelle** — `bin/fusion-rules`/`bin/fusion-paths` prüfen das Repo-Kriterium (Shell-Äquivalent von `isFusionPluginCwd()`, dieselbe Paarung wie in Plan-Schritt 8) und lesen dann `./rules/` des Arbeitsbaums statt `$FUSION_PLUGIN_ROOT/rules/`.
   - Pros: Beseitigt die Ursache statt sie zu melden — im eigenen Repo ist die Quelle per Definition der gemeinte Stand; das Review nennt es den sauberen Schnitt; konsistent mit dem Muster „der Guard steht im eigenen Repo ebenfalls anders" (self-detect existiert genau dafür).
   - Cons: Größter Eingriff der drei; die Emission im Plugin-Repo weicht dann von der eines konsumierenden Projekts ab, was Golden-Überlegungen braucht (die Golden misst den Consuming-Kontext und muss byte-identisch bleiben — Plan-Schritt 16 verlangt das explizit); Hooks selbst (guard/tracker) liefen weiterhin aus der installierten Kopie, der Schnitt ist also sauber nur für die Regel-/Pfad-Schicht.

## Constraints

- Die Release-Prozedur in `CLAUDE.md` soll den Update-Check in jedem Fall tragen — auch bei (b) oder (c) (Aussage des Plans, Schritt 3).
- Bei (b) und (c): kompilierte Hooks sind committet und self-contained (Installer-Invariante); das Verhalten in konsumierenden Projekten darf sich nicht ändern — die Emissions-Golden ist der Wächter, bei (c) muss sie byte-identisch bleiben.
- Bei (c): das Shell-Repo-Kriterium muss mit `isFusionPluginCwd()` konsistent gehalten werden (ein Kriterium, zwei Implementierungen — die Paarung gehört kommentiert, wie in Plan-Schritt 8).
- Kosten/Nutzen-Linie des Reviews: (b) ist die billige Sichtbarmachung, (c) der saubere Schnitt; (b) schließt die stummen Fälle nicht, die (c) schließt.

## Recommendation

Keine eigene Empfehlung über die Review-Linie hinaus; die Wahl hängt davon ab, wie viel Mechanismus dieser Text-Nachzieh-Circle tragen soll. Festgehalten: (a) ist in jedem Fall Teil der Antwort (die Release-Prozedur trägt den Check), die eigentliche Wahl ist (a)-allein vs. (a)+(b) vs. (a)+(c). Das Blindfeld von (b) — gleiche Version, geänderte Quelle — ist während aktiver Entwicklung der häufigste Zustand; wer (b) wählt, wählt Sichtbarkeit nur für den Nach-Release-Fall.

---
Answered: <set when status moves to _a_>
Implemented: <set when status moves to _i_>
Deferred: <set when status moves to _d_>
Superseded by: <set when status moves to _s_>

---
Answered: circles/260805-2005-textschicht-gegen-code-nachziehen/history/260805-2350-orchestrator-session.md — User wählt Option (c): bin/fusion-rules und bin/fusion-paths bevorzugen im Plugin-Repo die Repo-eigenen rules/ statt der installierten Kopie (Kriterium: isFusionPluginCwd-Äquivalent). Verhaltensregel (a) bleibt als Dokumentation bestehen. (Gate 260806-0027)
