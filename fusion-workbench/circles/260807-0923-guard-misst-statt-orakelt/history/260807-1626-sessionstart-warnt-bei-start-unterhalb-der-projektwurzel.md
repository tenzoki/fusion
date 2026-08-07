# SessionStart warnt, wenn die Sitzung unterhalb der Projektwurzel startet

**Agent:** coder
**Datum:** 2026-08-07 16:26
**Status:** Complete
**Anlass:** Nutzeranforderung im Chat — „Es macht keinen Sinn, aus einem Unterverzeichnis
heraus zu starten in einem fusion Projekt. Eine deutliche Warnung wäre hilfreich."
**Cross-references:**
`circles/260801-1244-guard-rules-write/issues/260804-2100_*_from-a-subdirectory-cwd-the-protected-list-matches-nothing-while-fail-closed-still-denies.md`
(bleibt `_o_`; diese Arbeit schließt ihn nicht, sie macht seine Klasse hörbar)

---

## Was gebaut wurde

Ein dritter SessionStart-Befehl, `hooks/session-start.ts`, kompiliert nach
`hooks/dist/session-start.js`. Er beantwortet genau eine Frage: liegt die Workbench-Wurzel
**oberhalb** des Arbeitsverzeichnisses statt an ihm? Wenn ja, gibt er eine `systemMessage`
aus, die beide Verzeichnisse benennt. Sonst schweigt er.

Er ändert kein Verhalten und blockiert nichts.

## Die Fallunterscheidung

`findWorkbenchRoot()` läuft von cwd aufwärts, also ist die gefundene Wurzel immer cwd selbst
oder ein echter Vorfahr. Damit ist der Schnitt disjunkt und vollständig — es gibt keinen
vierten Fall, weil eine Wurzel *unterhalb* von cwd nicht zurückgegeben werden kann:

```
keine Wurzel gefunden   → kein fusion-Projekt     → still
Wurzel === cwd          → Start an der Wurzel     → still
Wurzel ist Vorfahr      → Start darunter          → Warnung
```

Kein `realpath`-Vergleich. Die Wurzel wird per `resolve`/`dirname` aus derselben
`process.cwd()`-Zeichenkette gebaut, gegen die verglichen wird, also ist Fall 2 exakt
Zeichenketten-Gleichheit. Ein `realpath` an dieser Stelle würde eine aufgelöste Wurzel gegen
ein nicht aufgelöstes cwd halten und genau die Diskrepanz zurückholen, die das Guard-Gerüst
als macOS-Symlink-Falle dokumentiert.

## Drei Entscheidungen, jede mit ihrem Grund

**Eigener Hook, nicht der bestehende Banner.** Die Prüfung in den `printf`-Banner zu falten
hieße, den Aufwärtslauf in Shell innerhalb eines JSON-String-Literals nachzubauen — eine
zweite Definition der Frage, die `findWorkbenchRoot()` für jeden Hook schon beantwortet. Den
Banner umgekehrt in die neue Datei zu falten, stellte die unbedingte Meldung hinter einen
Node-Prozess: ein kaputter Build nähme den Banner mit. Zwei Befehle, weil es zwei Anliegen
sind, eines unbedingt und statisch, eines bedingt und berechnet.

**Englisch, obwohl die Projektsprache `de` ist.** Jede Zeichenkette, die fusions Hooks
ausgeben, ist englisch — der Schwester-Banner, die Verweigerungsgründe des Guards, die
Halt-Meldung. Die `**Language:**`-Deklaration regelt *Agenten-Prosa* und die Stilprofile
unter `fusion-workbench/stilwerk/`; ein Hook feuert, bevor irgendein Agent `CLAUDE.md`
gelesen hat, und einem SessionStart-Hook für eine Zeichenkette einen CLAUDE.md-Parser
beizubringen wäre ein neuer Mechanismus für einen einzigen Aufrufer. Eine von sechzehn
Betreiber-Meldungen zu lokalisieren ist die Inkonsistenz, nicht die Behebung.

**`systemMessage`, nicht Standardausgabe.** Standardausgabe eines SessionStart-Hooks ist
`additionalContext`: das Modell liest sie, der Nutzer nicht. Eine Warnung, die nur das Modell
liest, ist keine. Als eigener Testfall festgehalten statt angenommen.

## Der Text

```
fusion: restart this session at the project root.

  project root:      /Users/k1/Projects/productive/fusion
  working directory: /Users/k1/Projects/productive/fusion/fusion-workbench

This session started below the project root. Some of fusion's checks
resolve against the working directory instead of the root, so from here
they inspect the wrong directory and let through what they would
otherwise stop. The workbench itself is found by walking up, so your
files and settings are still read from the right place.
```

Aktion zuerst, dann beide Verzeichnisse, dann der Grund. Der letzte Satz steht bewusst da:
ohne ihn liest sich die Warnung, als sei etwas beschädigt. Die Konfiguration läuft aufwärts
(`escalation.ts`, `events.ts`), und die Messwurzel tut es seit `measurementRoot()` auch —
nachgeprüft, nicht aus dem Befund übernommen: `hooks/lib/protected-snapshot.ts:428`,
benutzt in `guard.ts:508` und `tracker.ts:281`.

## Warum eine Warnung und nicht vier Reparaturen

Mindestens vier Stellen tragen dieselbe stillschweigende Annahme, dass cwd die Projektwurzel
ist: die Vorab-Verweigerung der Schreibwerkzeuge (`lib/project-relative.ts`),
`isFusionPluginCwd()` (`lib/self-detect.ts`), `bin/fusion-plugin-cwd` und darüber
`bin/fusion-rules` und `bin/fusion-paths`. Jede einzeln aufwärtslaufen zu lassen wären vier
Sonderfälle mit vier Gelegenheiten, sich zu widersprechen. Eine Meldung an der einen Stelle,
an der das Arbeitsverzeichnis gewählt wird und noch billig zu ändern ist, macht die geteilte
Annahme hörbar. Die Auflösungspfade sind unangetastet.

## Gemessen

Der echte, ausgelieferte Hook (`hooks/dist/session-start.js`) gegen echte Verzeichnisse,
vor der Textschicht:

```
cwd <repo>/fusion-workbench   → Warnung, beide Pfade genannt
cwd <repo>                    → {}   (still)
cwd /tmp                      → {}   (still)
```

Die erste Zeile ist das Arbeitsverzeichnis dieser Sitzung selbst — der Auslöser war nicht
konstruiert.

## Tests

`hooks/lib/__tests__/session-start-subdirectory.test.ts`, sechs Fälle, jeder ein echter
Unterprozess in einem echten Verzeichnis (das ganze Thema *ist* `process.cwd()`; ein
Fall im Prozess könnte nur nach dem Arbeitsverzeichnis der Suite fragen).

| Fall | Erwartung |
|---|---|
| Start an der Wurzel | still |
| Start im Unterverzeichnis | Warnung, **beide** Pfade, erste Zeile sagt „restart" |
| keine Workbench oberhalb | still |
| zwei Ebenen tiefer | Warnung |
| im eigenen Repo des Plugins | Warnung — der als still dokumentierte Fall |
| Kanal | `systemMessage`, `hookEventName` korrekt |

Das Fremdprojekt liefert `helpers/guard-harness.ts` bereits: `withProject` und
`withPluginProject` legen es samt `.fusion-setup`-Marker und Unterverzeichnissen an. Neu
darin sind nur `sessionStartEntry()` und `runSessionStart(dir)`, analog zu `runGuard` /
`runTracker`, inklusive der Fail-Open-Erkennung über die Markerzeile
`[session-start] Error:` — ohne sie erfüllte ein abgestürzter Hook zwei der drei
Kernfälle stillschweigend.

Dazu zwei Verdrahtungsfälle in `hooks-wiring.test.ts`. Ohne sie könnte der Hook vollständig
korrekt und vollständig unerreichbar sein, mit grüner Suite in beiden Fällen — dieselbe
Regressionsform wie beim fehlenden `Bash`-Matcher.

**Falsifiziert, nicht nur grün:** mit ausgehängtem Warnzweig fallen 4 der 6 Fälle, die zwei
Schweige-Fälle bleiben korrekt grün. Danach zurückgesetzt.

`npm test` in `hooks/`: **1014 Tests, 32 Dateien, alle grün.**

## Geänderte Dateien

| Datei | Änderung |
|---|---|
| `hooks/session-start.ts` | neu — der Hook |
| `hooks/hooks.json` | dritter SessionStart-Befehl |
| `hooks/lib/__tests__/session-start-subdirectory.test.ts` | neu — sechs Fälle |
| `hooks/lib/__tests__/helpers/guard-harness.ts` | `sessionStartEntry()`, `runSessionStart()` |
| `hooks/lib/__tests__/hooks-wiring.test.ts` | zwei SessionStart-Verdrahtungsfälle |
| `hooks/dist/session-start.js` (+ `.d.ts`) | Build-Artefakt, committed wie die Geschwister |
| `README-hooks.md` | Architekturskizze, Hook-Konfiguration, Dateitabelle, neuer Abschnitt |
| `CLAUDE.md` | `hooks/`-Zeile, `bin/fusion-plugin-cwd`-Zeile, Regelladen-Konvention, Symptomtabelle |

## Offen

- **Version.** `.claude-plugin/plugin.json` steht auf `6.0.0`. Nicht angefasst — die
  Freigabeprozedur bündelt den Bump mit dem Release, und der Auftrag nannte ihn nicht.
- **`260804-2100` bleibt `_o_`.** Die Koordinaten-Asymmetrie der Vorab-Sperre besteht
  unverändert. Diese Arbeit ändert nur, ob der Nutzer davon erfährt.
