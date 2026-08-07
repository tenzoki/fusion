# Portfolio

**Generated:** 260807-1646 (by playmaker session 260807-1646-playmaker-direct-dispatch)
**Domain bias:** code

## Active (_t_)

(keiner). Kein Circle-Datensatz trägt den aktiven Marker, und der Zeiger `.active-circle` fehlt.
Das ist der reguläre Zustand zwischen zwei Turns und keine Störung. Zuletzt geschlossen wurde
`260807-0923-guard-misst-statt-orakelt` am 260807, ausgeliefert als v6.0.0 und v6.0.1. Die
Aktivierung des nächsten Circles läuft über `/fusion:next`.

## Anticipated (_a_) — ranked

Recommended next: 260801-1244-curator — der einzige geplante Circle, alle Abhängigkeiten
geschlossen, aber vor der Aktivierung steht eine Neu-Schärfung durch den shaper, und vor der
Neu-Schärfung gehört eine offene Entscheidung beantwortet.

1. **260801-1244-curator** — „The curator reconciles the three normative surfaces, and proves it
   on fusion's own conventions file".

   Der Rang ist unstrittig und aussagearm: es ist der einzige geplante Circle. Nach der
   Code-Heuristik steht er sauber da, denn seine Grounding zitiert keine offene Entscheidung
   (D1 ist beantwortet, D2 und D3 sind umgesetzt), und alle drei Abhängigkeiten sind kohärent
   geschlossen. Aktivierbar ist er trotzdem nicht, und der Grund ist seit dem letzten Lauf
   gewachsen. Bisher fehlte ihm sein Validierungsfall, weil coder die Schritte 3 und 4 seiner
   Abschlussarbeit C9 von Hand erledigt hat, festgehalten in
   `circles/260805-2005-textschicht-gegen-code-nachziehen/_c_circle.md` `## Dependencies`.
   Inzwischen sind auch die Messwerte hinfällig, auf denen seine Grounding ruht. Heute am Baum
   nachgemessen: die Konventionsdatei `rules/fusion-workbench-conventions.md` hat 35 668 Bytes,
   die Grounding führt 54 401; sie hat 23 Überschriften zweiter Ebene, die Grounding führt 32;
   die Scherben, die C9 erst erzeugen sollte, liegen bereits im Regelverzeichnis
   (`rules/circle-records.md`, `rules/workbench-path-resolution.md`,
   `rules/rule-file-provenance.md`, `rules/workbench-stash-and-lock.md`). Der eine lebende
   Defekt, den die Grounding als „the strongest available argument that the reconcile step is
   worth doing" anführt, trägt seit dem 260801 den Marker `_c_`:
   `shared/issues/260801-1215_c_conventions-file-cites-three-records-that-do-not-resolve.md`.
   Und die Aussage, die Workbench sei hier weder versioniert noch ignoriert, weshalb Änderungen
   an Entscheidungssätzen kein git-Rückgängig hätten, stimmt nicht mehr: sie ist seit `e8988d9`
   mit 612 Dateien versioniert. Das ist der Shaper-Arbeit von damals nicht anzulasten, denn sie
   hat am 260801 geprüft und der Commit fiel auf denselben Tag. Was inhaltlich Bestand hat,
   sind die Fähigkeiten C1 bis C3, C6 und C7 als zusammenhängender Rest, und der Bedarf ist
   belegt statt behauptet: im beobachteten Konsumprojekt cocreator stehen 65 offene Befunde,
   rund 25 offene Entscheidungen und drei Monate Drift
   (`circles/260801-1244-guard-rules-write/analyses/260805-1830-zweck-nutzung-und-stand-des-plugins.md`).
   Die Empfehlung lautet daher: neu schärfen, nicht aktivieren. Und die Neu-Schärfung sollte
   nicht vor der offenen Entscheidung
   `shared/decisions/260807-1515_o_wie-weit-reicht-die-projektsprache-in-den-regelkorpus.md`
   laufen, weil deren Gegenstand — Regeldateien und `CLAUDE.md` — genau der Gegenstand des
   Curators ist. Ein Zuschnitt vor der Antwort müsste danach ein zweites Mal gemacht werden.

   Abhängigkeiten: `260801-1244-rule-provenance-header` (geschlossen, hart),
   `260801-1244-guard-rules-write` (geschlossen, weich), transitiv
   `260801-1244-guard-bash-inspection` (geschlossen). Sauber, kein Zyklus.

## Recently closed (_c_ / _b_)

- **260807-0923-guard-misst-statt-orakelt** — kohärent geschlossen (`_c_`) am 260807: der
  statische Klassifizierer ist ersatzlos verschwunden, an seiner Stelle misst der Guard nach
  jedem Werkzeugaufruf, ob sich eine geschützte Datei verändert hat, und schreibt sie zurück;
  34 793 Zeilen gelöscht, 4 441 hinzugefügt, ausgeliefert als v6.0.0 und v6.0.1.
- **260805-2005-textschicht-gegen-code-nachziehen** — kohärent geschlossen (`_c_`) am 260806:
  vier Code-Korrekturen, zwei neue Lint-Prüfungen, 60 von 66 Korpus-Befunden geschlossen.
- **260801-1244-guard-rules-write** — kohärent geschlossen (`_c_`) am 260805: bewusste
  Regeldatei-Schreibvorgänge pro Sitzung, zwölf Abnahmekriterien geprüft, ausgeliefert als
  v5.9.0 bis v5.9.2.
- **260801-1244-rule-provenance-header** — kohärent geschlossen (`_c_`) am 260802: die
  Herkunftszeile auf Regeldateien plus die Lint-Prüfung, acht Abnahmekriterien geprüft.
- **260801-1244-guard-bash-inspection** — kohärent geschlossen (`_c_`) am 260801: die
  Schutzliste bindet seither auch dateiverändernde Shell-Befehle, nicht nur die vier
  Schreibwerkzeuge.

Fünf ältere geschlossene Circles fallen aus dem Fünfer-Fenster:
`260719-1536-plane-mirror-integration`, `260719-1536-brest-unite-co-creator-conversion`,
`260718-1924-v5x-overhaul`, `260717-1638-marker-format-ohne-glob-metazeichen`,
`260716-1847-workbench-umbau`.

## Archived (_s_ / _d_)

- **260804-1205-shell-reachability-model** (`_s_`, abgelöst am 260807-0923 durch
  `260807-0923-guard-misst-statt-orakelt`). Er wurde weder erreicht noch für unerreichbar
  erklärt: der Nutzer hat mitten im ersten Turn den Mechanismus gewechselt, womit der Gegenstand
  der Directive entfiel. Bestand haben laut Schließnotiz der Nachweis, dass die Näherung als
  Sicherheitsmechanismus nicht trägt (fünf Löcher im genehmigten Entwurf, das schwerste in
  `bash` und `zsh` ausgeführt), und die Erkenntnis, warum das keine Frage der Sorgfalt war —
  daraus wurde das MECE-Prinzip als vierter Abschnitt in `rules/critical-stance.md`.

Kein Circle trägt den Marker `_d_` (zurückgestellt).

## Warnings

- **Der Curator ist nicht aktivierbar, und die Neu-Schärfung ist mehr als eine Nachbesserung.**
  Fünf Aussagen seiner Grounding sind heute am Baum widerlegt (Größe und Gliederung der
  Konventionsdatei, die bereits existierenden Scherben, der geschlossene Motivations-Defekt, die
  Versionierung der Workbench). Der shaper braucht dafür eine frische Messung, nicht eine
  Durchsicht. Niemand besitzt diese Arbeit bisher.
- **Der `GIT_WORK_TREE=`-Befund ist geschlossen, nicht offen.** Er ist kein Kandidat für einen
  eigenen Circle. Der Mechanismuswechsel hat ihn sachlich gelöst und nicht bloß weggeräumt:
  `GIT_WORK_TREE=` verlagert den Schreibvorgang weiterhin, aber die Messung sieht die veränderte
  Datei danach, gleich auf welchem Weg sie verändert wurde. Der Erkenner, der die Umgebung nie
  las, ist mit `ba7ccda` gelöscht. Beleg: die Schließnotiz in
  `circles/260801-1244-guard-rules-write/issues/260804-1332_c_git-work-tree-in-the-environment-relocates-the-write-and-the-classifier-reads-no-variable.md`
  und Abschnitt II der Reconciliation
  `circles/260807-0923-guard-misst-statt-orakelt/history/260807-1526-reconciliation.md`.
- **Der höchstbewertete offene Befund ist jetzt ein anderer, und er hat sich verschärft.**
  `shared/issues/260717-0030_o_git-stash-include-untracked-can-sweep-the-stash-directory.md`
  beschreibt, dass `/fusion:circle-stash` in Schritt 7.11 das Stash-Verzeichnis wegfegen kann,
  das Schritt 7.5 gerade angelegt hat — das Rettungswerkzeug zerstört genau das, wofür es
  angerufen wurde. Der Befund hielt fest, fusions eigene Workbench sei ignoriert und damit in der
  einen sicheren Konfiguration. Das gilt seit `e8988d9` (260801) nicht mehr: die Workbench ist
  versioniert, und das ist eine der beiden verlierenden Konfigurationen. `CLAUDE.md` nennt sie in
  der Layout-Tabelle weiterhin „gitignored". Ob das ein eigener Circle wird, ist deine
  Entscheidung; der Befund selbst sagt, die Behebung brauche zuerst eine Entscheidung darüber,
  ob die Workbench überhaupt je im git-Stash mitreisen soll.
- **Zwei offene Entscheidungen warten auf dich und sind keine Ausführerarbeit.**
  `circles/260807-0923-guard-misst-statt-orakelt/decisions/260807-0945_o_integritaet-des-eskalationsspeichers.md`
  fragt, woran der Guard erkennt, dass der Eskalationszustand, den er liest, derselbe ist, den er
  zuletzt geschrieben hat — ein Agent kann seinen eigenen Halt löschen, seit das
  Zustandsverzeichnis nicht mehr geschützt ist. Vier Optionen liegen ausgearbeitet vor.
  `shared/decisions/260807-1515_o_wie-weit-reicht-die-projektsprache-in-den-regelkorpus.md` fragt,
  wie weit die Projektsprache `de` in das durchgehend englische Regelkorpus reicht. Diese zweite
  gehört vor die Neu-Schärfung des Curators, siehe oben.
- **39 offene Befunde liegen in keinem aktiven Circle.** 23 im geteilten Speicher, 16 in
  Issue-Speichern geschlossener Circles. Sie sind damit unbesessen, nicht verloren: die
  geschlossenen Circles behalten ihre Artefakte, aber niemand arbeitet sie ab. Der größte
  Einzelposten sind elf Befunde in `circles/260801-1244-guard-rules-write/issues/`, und mehrere
  davon beschreiben Code, den der Mechanismuswechsel entfernt hat. Ein Reconciler-Lauf über diesen
  Speicher würde vermutlich einen Teil davon schließen. Das ist eine Vermutung aus dem Muster der
  neun bereits geschlossenen, keine Messung.
- **Ein Befund im geteilten Speicher könnte durch dieselbe Änderung hinfällig sein.**
  `shared/issues/260801-1020_o_workbench-untracked-breaks-archive-durability-premise.md` ruht auf
  der Annahme, die Workbench sei nicht versioniert. Sie ist es seit `e8988d9`. Ungeprüft, ob damit
  die ganze Prämisse fällt oder nur die Hälfte.
- **Die Warteschlange `tasklist.md` existiert nicht mehr.** Sie wurde gelöscht, weil sie den
  abgelösten Circle nannte. Gebaut wurde bisher nur ihre Neuerzeugung, nicht die Vorbeugung gegen
  das erneute Veralten; festgehalten in
  `shared/issues/260807-1515_o_die-warteschlange-veraltet-wieder-weil-nur-die-neuerzeugung-gebaut-wurde-nicht-die-vorbeugung.md`.
  Playmaker liest und schreibt diese Datei nicht.
- **Buchführung am Rande:** `fusion-workbench/.active-circle` ist in git versioniert und auf der
  Platte gelöscht, erscheint also bis zum nächsten Commit in jedem `git status`. Kein
  Portfolio-Problem, aber eine Zeile, die sonst jemand sucht.

Es wurden keine Abhängigkeitszyklen gefunden. Kein Circle trägt den Marker `_b_`, also ist keine
Eltern-Grounding veraltet. Der Zeigerzustand ist stimmig: `.active-circle` fehlt, und kein Circle
trägt den aktiven Marker.
