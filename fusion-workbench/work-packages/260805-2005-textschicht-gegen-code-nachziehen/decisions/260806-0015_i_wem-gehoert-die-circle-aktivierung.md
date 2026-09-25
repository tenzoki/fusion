# Wem gehört der `_a_→_t_`-Übergang — und für wen gilt die Commit-Lock-Regel wirklich?

---
**Domain:** code
**Status:** open
**Filed by:** coder
**Cross-references:** 260805-2353_*_plan-textschicht-gegen-code.md (Track 2, Schritt 2; Schritt 9 realisiert die Antwort); 260805-1839_*_die-circle-aktivierung-gehoert-drei-parteien-und-keine-hat-einen-vollstaendigen-ablauf.md; 260805-1839_*_der-shaper-portfolio-activation-modus-hat-keinen-erreichbaren-dispatcher-mehr.md; 260805-1839_*_die-lock-regel-sagt-always-when-any-party-commits-und-zwei-skills-committen-ohne-lock.md; 260805-1840_*_konventionen-active-circle-nothing-else-touches-it.md

---

## Question

Zwei zusammenhängende Widersprüche zwischen normativem Text und tatsächlichen Schreibern, die das Gesamtreview als eine Entscheidung verlangt („decided together, not patched separately"):

**Aktivierung.** `rules/fusion-workbench-conventions.md:75` sagt über `.active-circle`: „the orchestrator **writes** it once on `_a_→_t_` activation … and **deletes** it on … closure. **Nothing else touches it.**" Tatsächlich verifiziert (Stand heute): `skills/next/SKILL.md` benennt in 6.2/6.3 das Record selbst um und schreibt den Zeiger selbst (`printf … > "$WORKBENCH/.active-circle"`, Z. 154); `skills/circle-stash/SKILL.md:259` löscht ihn (`rm -f`), `skills/circle-pop/SKILL.md:228` schreibt ihn zurück, `skills/migrate/SKILL.md` zieht ihn auf die Verzeichnisform nach, `skills/cleanup/SKILL.md:78` löscht ihn bei terminalem Marker. Zusätzlich behauptet `agents/shaper.md:3` einen portfolio-activation-Modus, dispatcht „by playmaker or the user via /fusion:next" — aber `skills/next/SKILL.md:4` erlaubt nur `Agent(fusion:playmaker)`, und playmaker dispatcht per eigener Beschreibung nie einen anderen Agenten. Der Modus hat keinen erreichbaren Dispatcher.

**Lock.** `rules/workbench-stash-and-lock.md:107` sagt zum Commit-Lock: „Always, when any party is about to commit." Tatsächlich: `skills/commit/SKILL.md:65` committet ohne Lock (bare `git commit`), `skills/cleanup/SKILL.md:88` staged und committet direkt; keines der beiden Skill-Bodies erwähnt `fusion-commit-lock`.

Jetzt entscheiden, weil Plan-Schritt 9 (die Realisierung über vier-plus Dateien) und Teile von Batch A an der Antwort hängen und die Konventionszeile sonst zweimal angefasst wird.

## Options

**Aktivierungs-Eigentum:**

1. **Orchestrator-only** — `/fusion:next` schlägt nur vor und übergibt; der Phasenplan des Orchestrators erhält den fehlenden Aktivierungs-Schritt (Umbenennung + Zeiger).
   - Pros: Die Konventionszeile wird wörtlich wahr; ein Schreiber, ein Ort für die Invariante.
   - Cons: `/fusion:next` verliert seine interaktive Aktivierung oder muss eine Orchestrator-Sitzung starten, nur um zwei Dateizugriffe auszuführen; stash/pop/migrate/cleanup brauchen trotzdem Ausnahmen (sie sind Lifecycle, nicht Aktivierung) — die Zeile stimmt also auch dann nur mit Fußnote.
2. **`/fusion:next` besitzt die interaktive Aktivierung; die Konventionszeile benennt den echten Schreiber-Satz** — Orchestrator und `/fusion:next` für den `_a_→_t_`-Weg, stash/pop/migrate/cleanup als benannte Lifecycle-Ausnahmen; der shaper-portfolio-activation-Modus bekommt seinen realen Dispatcher oder die Behauptung wird aus `agents/shaper.md` entfernt.
   - Pros: Beschreibt den Ist-Zustand, der seit v4 funktioniert und user-gated ist; kleinster Eingriff in Verhalten, ehrlichster Text; die shaper-Leiche wird beseitigt.
   - Cons: Die Invariante „ein Schreiber" ist aufgegeben; künftige Schreiber brauchen Disziplin, sich in die Liste einzutragen (eine Enumeration, die Lint 6 prüfen könnte).
3. **Gemeinsamer `bin/`-Helper führt den Übergang aus; jede Partei ruft ihn** — z. B. `fusion-circle-activate <dirname>` (Rename + Zeiger + Platzhalter atomar), Orchestrator und `/fusion:next` rufen ihn.
   - Pros: Ein Codepfad statt n Skript-Schnipsel; die Konventionszeile kann „nur der Helper schreibt den Zeiger" sagen und wahr sein; Verifikation an einer Stelle.
   - Cons: Neuer Mechanismus in einem Text-Nachzieh-Circle (Scope-Frage); stash/pop/migrate bleiben trotzdem eigene Schreiber (Restore/Reformat ist keine Aktivierung), die Zeile braucht weiterhin die Lifecycle-Fußnote.

**Lock-Regel (Unteroptionen, unabhängig wählbar):**

- **(i) Beide Skills erwerben den Lock** — `/fusion:commit` und `/fusion:cleanup` wickeln ihre Commits über `bin/fusion-commit-lock` ab; „Always" wird wahr.
  - Pros: Regel bleibt einfach und wahr; schützt genau den Fall paralleler Sessions, für den der Lock existiert.
  - Cons: Beide Skills laufen typischerweise als einzige Partei; der Lock kostet dort nur dann etwas, wenn er hängt (Stale-Detection greift nach 60 s).
- **(ii) Die Regel ehrlich eingrenzen** — „Always" wird zu „jede Partei innerhalb einer Orchestrator-Sitzung / bei möglichem Parallel-Schreiber"; die beiden Skills werden als benannte Ausnahme geführt.
  - Pros: Kein Verhaltens-Eingriff.
  - Cons: Die Eingrenzung ist gelogen, sobald ein Nutzer `/fusion:commit` neben einer laufenden Orchestrator-Sitzung ausführt — genau die Kollision, die der Lock verhindern soll; eine Regel mit Ausnahmenliste ist schwerer zu prüfen als „always".

## Constraints

- Die umgeschriebene Konventionszeile muss gegen **jeden existierenden Schreiber** wahr sein; Plan-Schritt 9 verifiziert per grep über den Baum (`printf`/`rm`/`mv`-Ziele auf `.active-circle`).
- Der shaper-Widerspruch muss in derselben Antwort aufgelöst werden (Dispatcher schaffen oder Behauptung entfernen) — er ist die dritte Partei derselben Aktivierungs-Story.
- Erwartete Datei-Menge der Realisierung (Plan-Schritt 9): `rules/fusion-workbench-conventions.md` (Z.-75-Bereich), `skills/next/SKILL.md` (6.2/6.3), `agents/shaper.md` (Modus 3), `agents/orchestrator.md` (Phasenmodell), `rules/workbench-stash-and-lock.md` (Lock-Scope), `skills/commit/SKILL.md` und `skills/cleanup/SKILL.md` (Lock erwerben oder als Ausnahme benannt werden).
- Größendisziplin: `fusion-workbench-conventions.md` und `workbench-stash-and-lock.md` sind emittierte Regel-Dateien; jede Größenänderung zieht die dokumentierte Golden-Regeneration nach sich.

## Recommendation

Aktivierung: Option (b), Lock: Unteroption (i). Verifiziert vor dem Filing: `skills/next/SKILL.md:4` führt tatsächlich keinen shaper-Dispatch in `allowed-tools` — die „kein erreichbarer Dispatcher"-Prämisse hält; die Schreiber-Liste oben ist heute gegen den Baum gemessen, nicht aus den Befunden übernommen. (b) macht den Text wahr, ohne funktionierendes, user-gated Verhalten umzubauen; (i) macht die Lock-Regel wahr, statt sie einzugrenzen — die Eingrenzung (ii) würde exakt den Kollisionsfall ausnehmen, den der Lock adressiert. Option (c) ist die sauberste Langform, gehört aber eher in einen eigenen Mechanismus-Circle als in diesen Text-Nachzieh-Circle.

---
Answered: 260805-2350-orchestrator-session.md — User wählt Option (b) + Sub-Option (i): Konventionszeile nennt den echten Schreiber-Kreis (Orchestrator, next, Lifecycle-Skills als benannte Ausnahmen); Shaper-Modus bekommt einen echten Aufrufer oder wird gestrichen; /fusion:commit und /fusion:cleanup holen den Commit-Lock. (Gate 260806-0027)
Implemented: 2026-08-06 (commit follows via orchestrator) — Option (b) + Sub-Option (i) realisiert über fünf Dateien: `rules/fusion-workbench-conventions.md` (die `.active-circle`-Zeile benennt jetzt den geschlossenen Schreiber-Satz: Orchestrator und `/fusion:next` auf dem Aktivierungsweg, `circle-stash`/`circle-pop`/`migrate`/`cleanup` als benannte Lifecycle-Ausnahmen mit je einer Klausel); `agents/shaper.md` (portfolio-activation-Modus ist ehrlich als direkt user-invoked ausgewiesen, die unerreichbare Dispatcher-Behauptung über playmaker/`/fusion:next` ist entfernt — verifiziert: `skills/next/SKILL.md` führt die Aktivierung selbst aus und dispatcht nur playmaker); `skills/commit/SKILL.md` und `skills/cleanup/SKILL.md` (stage+commit läuft über `bin/fusion-commit-lock with <skillname> --`, Tags `commit`/`cleanup`); `rules/workbench-stash-and-lock.md` (die beiden Skills stehen in „Who acquires" und in den Tag-Konventionen; „Always, when any party is about to commit" ist damit wahr). `skills/next/SKILL.md` und `agents/orchestrator.md` brauchten keine Änderung — ihr Ist-Zustand ist unter (b) der Soll-Zustand. Emission-Golden regeneriert (+693 conventions an alle 16, +433 stash-and-lock an orchestrator); Suite grün (1559).

Reconciliation 260806-1057-reconciliation.md: the implementing commit is 81d4154 (fix(skills,rules): der echte Schreiber-Kreis steht in der Regel, der Lock gilt fuer alle Committer) (the footer above was written before the orchestrator commit existed). Verified at HEAD: rules/fusion-workbench-conventions.md .active-circle writer sentence, skills/commit/SKILL.md + skills/cleanup/SKILL.md lock-wrapped via bin/fusion-commit-lock, rules/workbench-stash-and-lock.md acquirer list, agents/shaper.md portfolio-activation honestly user-invoked.
