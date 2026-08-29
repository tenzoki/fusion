# Schritt 6 — die Textschicht gegen die Messung nachgezogen

**Datum:** 2026-08-07
**Agent:** coder
**Status:** Complete
**Plan:** `260807-0931_*_plan-guard-misst-statt-orakelt.md`, Schritt 6
**Bindende Entscheidung:** `260807-0825_*_should-the-guard-predict-shell-writes-or-enforce-them.md`, Option 3

## Was umgesetzt wurde

**`rules/protected-path-discipline.md` neu geschrieben.** 348 → 53 Zeilen, 21 063 → 5 919 Bytes. Aufbau und Ton an der Schwesterdatei `rules/git-branch-discipline.md` (55 Zeilen, 6 299 Bytes) ausgerichtet: Kopf mit Durchsetzungsmechanismus, `## The rule`, die Sache selbst, die Ausnahme, `## What to do instead`, Halt-Kosten. Englisch, damit das Regelkorpus einheitlich bleibt. Der `**Provenance:**`-Kopf (`260801-1244-guard-bash-inspection`) steht unverändert an Zeile 3.

Ersatzlos gestrichen, wie beauftragt: Vier-Fragen-Prozedur, Joiner-Tabelle, Fail-Closed-Klausel, `cd`-Verfolgung, Ancestor-Regel in beide Richtungen, Residuen-Katalog, der ganze Abschnitt "Where this check does not reach", die Verweise auf die Referenz- und die Forensik-Schicht.

Neu und inhaltlich tragend: der Abschnitt `## The route to the file does not matter` sagt ausdrücklich, dass die Vorgängerfassung 21 dokumentierte Löcher einräumen musste und diese Fassung das nicht mehr muss, weil das Ergebnis geprüft wird und nicht die Absicht — und nennt im selben Atemzug den Preis: die Änderung geschieht, bevor sie gesehen wird, und wird danach zurückgenommen; ein Befehl, der eine geschützte Datei liest und ihren Inhalt anderswohin trägt, wird von einer Schutzliste keiner Bauart erfasst. Dazu eine Folge, die kein Auftragspunkt war, aber aus dem Code folgt: `git checkout HEAD -- <geschützter Pfad>` ist keine Ausnahme mehr, sondern wird ebenso zurückgeschrieben.

**`rules/protected-path-internals.md` gelöscht** (21 870 Bytes). In `bin/fusion-rules` die gesamte Zielgruppen-Mechanik entfernt: `IS_GUARD_INTERNALS_AGENT`-Block, Emissionsblock 1d, der Kommentar im Repo-Kontext-Block (ehemals Zeile 162) und der Kopfkommentar zur Referenzhälfte (ehemals Zeile 61). Der verbliebene Kopfkommentar zu `protected-path-discipline.md` beschreibt jetzt die Messung. Der Block `1da.` heißt wieder `1d.`, weil die Lücke keinen Zweck mehr hat.

**`README-hooks.md`.** Über den Auftrag hinaus (siehe unten): das Konzept-Lede, der Churn-Absatz, das Architekturdiagramm, fünf Zeilen der Modultabelle, drei Zeilen der Tuning-Tabelle, die Block-Aufzählung, der Halt-Abschnitt und der Selbstschutz-Boden. Der Abschnitt `### Shell writes to protected paths` (62 Zeilen Klassifizierer-Beschreibung samt Verbtabellen, `cd`-Modell, Fail-Closed-Bound, Residuenliste und Drei-Schichten-Tabelle) ist durch `### Protected paths are measured, not predicted` ersetzt (23 Zeilen): die zwei Fingerabdrücke, warum der Vorher-Abdruck die Zulässigkeitsbedingung ist, Inhalt statt Digest, die Regel-Ausnahme auf der Messseite, die beiden eigenen Residuen (parallele Werkzeugaufrufe, symlink-Verzeichnis) und die Stilllegung im eigenen Repo.

**`CLAUDE.md`.** Der `hooks/`-Eintrag der Layouttabelle, der Absatz "Die zwei Bash-Regeln" (jetzt "Die zwei Guard-Regeln"), die zwei Erwähnungen im Selbstentdeckungs-Absatz und im `bin/fusion-plugin-cwd`-Eintrag, der Guard-Aufzählungspunkt unter "What this is". Die beiden Symptomzeilen zu den Guard-Denies sind durch **eine** Zeile über das Zurückschreiben ersetzt. Der einleitende Absatz über die Stilllegung nennt weiterhin beide Schreiboberflächen, jetzt korrekt: die vier Schreibwerkzeuge und die Messung in `hooks/tracker.ts`, mit dem zusätzlichen Grund, dass eine hier laufende Messung die Arbeit des Entwicklers zurückrollen würde.

**`hooks/lib/__tests__/rules-emission-golden.test.ts`.** Der `RULE_BASELINE`-Eintrag für `protected-path-internals.md` und die beiden Zusicherungen zu seiner Auslieferung sind entfernt; der Test `measures the consuming-project context` behält die Zusicherung, dass das neutrale Arbeitsverzeichnis kein Plugin-Manifest trägt, und sein Kommentar sagt jetzt, dass nur noch die Work-Tree-Präferenz auf den Repo-Kontext gegated ist. Der Rollen-Kommentar zu coder/coderev/bugfixer ist nachgezogen.

## Zwei Schritte über den Auftrag hinaus

Beide fallen in Dateien, die kein anderer Schritt beansprucht, und beide wären sonst als Falschaussage stehen geblieben.

1. **`README-hooks.md`, der ganze Klassifizierer-Abschnitt.** Der Auftrag nannte zwei Modultabellen-Zeilen, den `cd`-Absatz und die Halt-Beschreibung. Die 62 Zeilen dazwischen beschreiben im Präsens ein Modul, das es nicht mehr gibt — genau der Zustand, den dieser Circle abstellt. Ersetzt statt gekürzt.
2. **`rules/git-branch-discipline.md`, ein Satz.** Zeile 7 beschrieb die Schwesterpolitik als "a shell command that writes a path in `guard.protectedPaths` is denied on the same call". Jetzt: Fingerabdruck vorher und nachher, Zurückschreiben.
3. **`README-agents.md`, eine Zeile.** Der "Conditional"-Aufzählungspunkt führte `protected-path-internals.md` samt Zielgruppe. Die Klausel ist gestrichen.

## Prüfung

| Prüfung | Ergebnis |
|---|---|
| `reference-resolution-lint.test.ts` — Haupt-Gate (keine hängende Referenz) | **grün.** Alle fünf gemeldeten Fundstellen erledigt: `rules/protected-path-discipline.md:7`, `rules/protected-path-internals.md:8` und `:20` (Datei gelöscht), `CLAUDE.md:122`, `bin/fusion-rules:204`. |
| `reference-resolution-lint.test.ts` — "no dead weight" | **rot**, neu und erwartet: vier `EXAMPLE_PATHS`-Einträge sind mit ihren Fundstellen gefallen. Nicht behoben, weil der Auftrag `hooks/lib/__tests__/` außer der Goldfixture-Suite sperrt. Als Befund abgelegt: `260807-1133_*_example-paths-im-referenz-lint-sind-nach-der-textschicht-tot.md`. |
| `derivable-enumerations-lint.test.ts` | **grün** (18 Zusicherungen). Die Modultabelle listet wieder genau die vorhandenen `hooks/lib/*.ts`: `protected-snapshot.ts` aufgenommen, `bash-mutation-guard.ts` und `shell-reach.ts` entfernt. |
| `provenance-header-lint.test.ts` | **grün** (27 Zusicherungen). |
| `rules-emission-golden.test.ts` | **rot am Fixture-Vergleich**, wie geplant — das zieht Schritt 7 nach. Die acht übrigen Zusicherungen der Datei sind grün. |
| `bin/fusion-rules coder` | emittiert acht Pfade, keinen Verweis mehr auf die gelöschte Datei. |

## Byte-Zahlen für Schritt 7

Die Goldfixture ändert sich in **allen sechzehn Agentenblöcken um dieselben zwei Zeilen**:

```
-  protected-path-discipline.md 21063
+  protected-path-discipline.md 5919
```

Differenz **−15 144 Bytes je Agent**, dazu die jeweilige `total`-Zeile (Beispiel `analyst`: 101 958 → 86 814).

**Eine Erwartung des Plans trifft nicht zu.** Schritt 7 sagt, `protected-path-internals.md` verschwinde aus den drei Guard-Blöcken. Die Datei steht in der Fixture gar nicht: sie misst den Konsum-Kontext, und dort wurde die Referenzhälfte seit dem 2026-08-06 (Gate auf `bin/fusion-plugin-cwd`) ohnehin nicht mehr ausgeliefert. `grep -c protected-path-internals` auf der Fixture ergibt 0. Schritt 7 hat also nur die eine Zeile je Block nachzuziehen.

## Offen

- Die vier toten `EXAMPLE_PATHS`-Einträge (eigener Befund, siehe oben).
- Die Sprachfrage bleibt unberührt: Projektsprache ist `de`, das Regelkorpus ist englisch. Die neue Fassung ist englisch, damit das Korpus einheitlich bleibt.
