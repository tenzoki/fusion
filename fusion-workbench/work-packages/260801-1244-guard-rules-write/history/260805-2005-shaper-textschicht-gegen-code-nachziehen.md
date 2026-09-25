# Shaper — anticipated-circle: Textschicht gegen Code nachziehen

**Datum:** 2026-08-05 20:05
**Agent:** shaper (anticipated-circle mode)
**Status:** Complete
**Angefordert von:** Nutzer, dispatcht über den Orchestrator im Circle `260801-1244-guard-rules-write`

---

## Auftrag

Einen neuen `_a_`-Circle anlegen, der die 66 Befunde der drei Prüfdurchgänge vom 5. August abdeckt. Ausdrückliche Vorgabe: **keine Rückfragen** — der Nutzer beendet die Sitzung, macht `fusion --update` und will danach über `/fusion:next` hier weitermachen. Offenes wird als offene Frage in den Record geschrieben statt gefragt. Keine Aufwandsschätzung.

## Ergebnis

Circle-Verzeichnis: `260805-2005-textschicht-gegen-code-nachziehen`
Record: `260805-2005-textschicht-gegen-code-nachziehen`
Sechs Artefakt-Unterverzeichnisse angelegt (`planning/`, `issues/`, `decisions/`, `history/`, `reviews/`, `analyses/`).

Kein Spec geschrieben — im anticipated-circle-Modus ist der Record das Artefakt.

## Grounding

Vollständig gelesen: die drei Berichte (`260805-1830-zweck-nutzung-und-stand-des-plugins.md`, `260805-1840-doku-gesamtpruefung-gegen-code.md`, `260805-1905-coderev-gesamtreview-plugin-v5-9-1.md`), der zu korrigierende High-Befund-Record `260805-1859_*_im-eigenen-repo-…`, die Dateinamen aller 66 Issue-Records, und die Records der beiden anderen `_a_`-Circles (`260804-1205-shell-reachability-model`, `260801-1244-curator`).

## In dieser Sitzung selbst nachgemessen

Drei Behauptungen aus den Berichten wurden nicht übernommen, sondern nachgeprüft, weil sie den Zuschnitt tragen:

1. **`shared_of` unter zsh.** `zsh → []`, `bash → [shared/planning]`. Bestätigt.
2. **`bin/fusion-rules` unter `set -eu`.** `set -eu` in Zeile 131; `emit_if_exists()` in 215–217 ist `[ -f "$1" ] && printf …` und liefert bei fehlender Datei Status 1; sieben Always-on-Aufrufe in 328–334. Mechanismus bestätigt.
3. **`/fusion:next` kann shaper nicht dispatchen.** `allowed-tools: [Bash, Read, Write, AskUserQuestion, Agent(fusion:playmaker)]` — kein shaper, keine Erwähnung im Body. Bestätigt.

**Die veraltete Regelkopie hat sich in dieser Sitzung reproduziert.** `bin/fusion-rules shaper` emittierte Pfade unter `/Users/k1/.fusion/rules/`; `agent-setup.md`, `fusion-workbench-conventions.md`, `user-facing-output.md` und `critical-stance.md` unterscheiden sich dort von der Quelle, und `circle-records.md` fehlt der installierten Kopie ganz — ausgerechnet die Datei, die das Circle-Record-Template definiert. Dieser Circle wurde deshalb gegen die Quelldateien unter `/Users/k1/Projects/productive/fusion/rules/` geschrieben. Der Effekt ist im Record als Grounding festgehalten.

## Abweichungen vom vorgeschlagenen Zuschnitt

Die vier vorgeschlagenen Gruppen tragen. Drei Ergänzungen, alle aus den Berichten belegt:

1. **Die Zitierform ist Vorbedingung, nicht Nacharbeit.** Der Review sagt es ausdrücklich („sonst wird zweimal angefasst"), und der Verweis-Lint kann ohne die Entscheidung nicht wissen, welche Form gültig ist.
2. **Vier Code-Fehler statt zwei.** Der Doku-Durchgang nennt zwei mutmaßliche Code-Fehler: den `set -e`-Abbruch **und** die verstümmelte awk-Meldung. `shared_of` kommt aus dem Review, nicht aus dem Doku-Durchgang. Dazu der Setup-Lockout-Rest, im Review als Nummer 3 der empfohlenen Reihenfolge und damit nach Wegfall des High-Befunds an zweiter Stelle.
3. **Eigentum am Übergang `_a_→_t_` als eigene Gruppe.** Zwei Medium-Befunde beschreiben dieselbe Lücke von zwei Seiten; der Review will sie zusammen entschieden haben, weil vier Dateien der Antwort folgen. Einer davon betrifft den unmittelbar nächsten Schritt des Nutzers, weshalb der Grounding-Snapshot dieses Circles vollständig geschrieben und nicht als Stub gelassen wurde.

## Offene Fragen, im Record vermerkt statt gefragt

- Bleibt es bei der Verhaltensregel „vor Regelarbeit updaten und neu starten", oder kommt eine Meldung dazu (SessionStart-Warnung vs. Helfer bevorzugen Repo-eigene `rules/`)?
- Welche markerlose Zitierform für Workbench-Records?
- Wem gehört der Übergang `_a_→_t_`?

## Sprache

`CLAUDE.md` trägt keine `**Language:**`-Zeile, die Voreinstellung ist damit `en`, und `bin/fusion-rules` emittierte die `-en`-Profile. Record und Bericht sind auf ausdrückliche Anweisung des Nutzers auf Deutsch geschrieben.
