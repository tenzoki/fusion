# Gesamtreview fusion-Plugin v5.9.1

**Absender:** coderev
**Datum:** 260805-1905
**Circle:** `circles/260801-1244-guard-rules-write`
**Umfang:** ganzes Plugin, kein Diff — 16 Agenten, 16 Skills, 15 Regeldateien, 7 bin-Helfer, 15 TypeScript-Module plus Hooks, Monitor, Installer
**Grundlage:** 1551 Tests in 27 Dateien grün (`npx vitest run`, 169 s); `hooks/dist` byte-identisch zu einem frischen `tsc`-Lauf; vier parallele Lese-Workstreams (Verweis-Integrität, Werkzeug-gegen-Prompt, Skills, Agenten-Kohärenz), deren Kernbefunde coderev selbst nachgemessen hat

---

## Zusammenfassung

Der Guard ist in Ordnung. Vier Tage Änderung, 1551 grüne Tests, ein reproduzierbarer Build, und die Schicht, an der am meisten gearbeitet wurde, hält, was sie behauptet.

Was auseinandergerissen wurde, liegt eine Ebene darüber: in den Texten, die niemand kompiliert, und in dem Mechanismus, der sie an die Agenten ausliefert. Der schwerste Befund ist kein Fehler in einer Datei, sondern eine Eigenschaft der Entwicklungsumgebung — im eigenen Repo lesen alle Agenten die Regeln der installierten Vorversion. Die vier Tage Regelarbeit sind bei den Agenten, die sie befolgen sollen, nie angekommen. Das erklärt die unproduktiven Extraschleifen besser als jeder Einzelbefund.

Die Antwort auf die Ausgangsfrage: **das Plugin passt zusammen, aber es weiß es nicht.** Die Umsetzungen sind überwiegend korrekt im Sinne der Intention. Was fehlt, ist die Rückkopplung, die einem Agenten mitteilt, wie der heutige Stand aussieht.

## Zahlen

| Schweregrad | Anzahl |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 6 |
| Low | 14 |
| **Gesamt** | **21** |

Alle 21 liegen als Einzel-Records unter `circles/260801-1244-guard-rules-write/issues/`, Zeitstempel `260805-1839`, `-1859` und `-1904`. Vier davon sind Sammel-Records für mechanische Kleinigkeiten; das ist Absicht — zwanzig einzelne Low-Records kosten mehr Triage, als sie wert sind.

## Befunde nach Thema

### 1. Auslieferung der Regeln an die Agenten

**`260805-1859` — Im eigenen Repo laden alle Agenten die Regeln der installierten Vorversion. High.**

`FUSION_PLUGIN_ROOT` zeigt auf `~/.fusion` (v5.8.0), nicht auf die Quelle (v5.9.1). Jeder Agent führt in Setup Schritt 2 `"$FUSION_PLUGIN_ROOT/bin/fusion-rules" <self>` aus und liest damit die Regeln einer anderen Version. Der installierten Kopie fehlen alle fünf Shards dieses Circles vollständig:

    FEHLT: circle-records.md
    FEHLT: protected-path-internals.md
    FEHLT: rule-file-provenance.md
    FEHLT: workbench-path-resolution.md
    FEHLT: workbench-stash-and-lock.md

Die Konventionsdatei, die ein Agent hier liest, hat 698 Zeilen; die Quelle hat 449. Für `coder` gemessen: die installierte Kopie emittiert sieben Regeln, die Quelle dieselben sieben plus `protected-path-internals.md` — der Guard-Interna-Shard, den dieser Circle für genau coder/coderev/bugfixer geschrieben hat, erreicht im Repo keinen von ihnen.

Das ist der Mechanismus hinter „warum hat das niemand gemerkt". Jede umgelenkte Zitatstelle, jede neue Konvention, jeder Shard war für die ausführenden Agenten unsichtbar. Mein eigenes coderev-Setup in dieser Session eingeschlossen — ich habe die 698-Zeilen-Version gelesen und musste den Unterschied erst messen.

`CLAUDE.md` dokumentiert den korrekten Entwicklungspfad (`claude --plugin-dir /path/to/this/repo`). Nichts erzwingt oder meldet ihn, und der bequeme `fusion`-Launcher führt am Repo vorbei.

### 2. Zusammenhalt über Dateigrenzen — die übersehenen Zitatstellen

Das Sharding hat 21 Zitatstellen umgelenkt. Die Suche nach den übersehenen hat drei Klassen gefunden, alle Low, alle mechanisch, zusammengefasst in drei Sammel-Records:

- **`260805-1839` — acht Workbench-Records, die nirgends existieren.** Vier in `agents/playmaker.md` (Zeilen 12, 124, 133, 198, 199), vier in `rules/workbench-stash-and-lock.md` (79, 97, 98, 142). Zwei tragen zusätzlich positiv falsche Ortsangaben („now under `shared/`"). Gemessen per `find` über den ganzen Workbench inklusive `archive/` — alle acht leer.
- **`260805-1839` — acht Zitate mit verfallenen Decision-Markern.** Der zitierte Record existiert, aber unter anderem Marker, so dass ein grep auf den Namen nichts findet. Zwei davon sind mehr als tote Pfade: `hooks/lib/paths.ts:72` behauptet wörtlich, eine Entscheidung sei „deliberately not taken" — sie ist inzwischen gefallen (`_d_`). Und `rules/rule-file-provenance.md:48` ist die `Binding decision:`-Zeile ausgerechnet der Datei, die die Zitierformen definiert. Deren Begründung für die Pfadform deckt den `_a_→_i_`-Übergang erkennbar nicht: schon der Normalfall „implementiert" bricht jeden markertragenden Verweis. Das ist keine Schlamperei, sondern ein Konstruktionsfehler der empfohlenen Zitierform.
- **`260805-1839` — playmakers Setup schickt den Leser für „State Markers — circles" in die Konventionsdatei**, aus der der Abschnitt ausgezogen ist. Der Nachbar-Bullet direkt darunter wurde bei der Umlenkung repariert, dieser nicht.

Zur Ehrenrettung des Shardings: die Nicht-Emission von `workbench-path-resolution.md` und `rule-file-provenance.md` an keinen einzigen Agenten ist **kein** Befund. Sie ist in `bin/fusion-rules:370-382` ausführlich begründet und die Zeiger aus der Konventionsdatei existieren und stimmen. Das ist bewusste Arbeit, und sie hält.

### 3. Prozessbrüche zwischen Prompts, Skills und Regeln

Die zwei ernstesten Kohärenzbefunde hängen zusammen und beschreiben dieselbe Lücke von zwei Seiten:

**`260805-1839` — Die Circle-Aktivierung gehört drei Parteien, und keine hat einen vollständigen Ablauf. Medium.**
`rules/fusion-workbench-conventions.md:75` sagt „the orchestrator writes it … Nothing else touches it". `skills/next/SKILL.md` Schritte 6.2/6.3 führen `mv` und `printf > .active-circle` selbst aus — der einzige ausformulierte Aktivierungspfad läuft nicht durch den Orchestrator, die Invariante ist bereits gebrochen. Der Orchestrator wiederum beansprucht die Aktivierung (samt Plane-Call-Point 1), hat aber in seinem Phasenmodell keinen Schritt, der sie ausführt.

**`260805-1839` — Der shaper-Modus `portfolio-activation` hat keinen erreichbaren Dispatcher mehr. Medium.**
`agents/shaper.md:3,47` nennt playmaker und `/fusion:next`. Playmaker dispatcht per Selbstbeschreibung nie einen Agenten; `/fusion:next` hat shaper nicht in der Allowlist und erwähnt ihn nicht. Praktische Folge: bei einer Aktivierung wird der Grounding-Snapshot nicht befüllt und die Directive nicht verfeinert — das Circle-Record-Template verspricht einen Schritt, den niemand ausführt.

Dazu:

- **`260805-1839` — Die Lock-Regel sagt „Always, when any party is about to commit", und `/fusion:commit` wie `/fusion:cleanup` committen ohne Lock.** Medium. Genau der Fall, den der Lock abdecken soll: ein Nutzer ruft `/fusion:commit` im zweiten Fenster auf, während der Orchestrator committet.
- **`260805-1839` — Die Selbstbeschreibung des Orchestrators driftet an drei Stellen hinter seinem eigenen Body her.** Low. `conceptrev` und `editor` fehlen in der Scope-Liste, `playmaker` und `editor` in der Agenten-Tabelle, und „Bundle B" benennt einen playmaker-Schritt, der so nicht heißt.

### 4. Die Skills

Elf von sechzehn sind solide. Der Setup-Fix aus v5.9.1 hat einen Rest, und der Archive-Skill hat einen still fehlschlagenden Defekt:

**`260805-1904` — `shared_of` verliert unter zsh alle Shared-Stores, sobald ein Circle aktiv ist. Medium.**
`skills/archive/SKILL.md:48` nutzt `for p in $1` und setzt damit Wortteilung voraus, die zsh nicht macht. Gemessen: `zsh → []`, `bash → [shared/planning]`. Die Bash-Tool-Umgebung ist zsh. Folge: Tier 1–3 archivieren nur noch terminale Circles und überspringen jede geschlossene Shared-Datei — still, weil ein leerer Bucket von „nichts zu archivieren" nicht zu unterscheiden ist. `/fusion:cleanup` Schritt 4 führt tier-1 autonom und ohne Gate aus und erbt das.

**`260805-1904` — Der Setup-Lockout hat einen Rest. Medium.**
Der v5.9.1-Fix hat den Geltungsbereich der Klammer-Sonde eingeschränkt, ihre Form aber nicht. Jeder Dateiname mit Klammerpaar, dessen Inhalt kein Marker ist, erzeugt denselben geschlossenen Kreis: Setup verweigert → migrate fragt und verschiebt nichts → meldet „Migration vollständig" → Setup verweigert erneut. Gemessen an `notes [draft].md`: Sonde trifft, Executor-sed ändert nichts. Migrate bricht damit seine eigene Regel „the detector must only look for things the executor can remove".

Dazu zwei Low-Records (`260805-1904`): log-activity scannt `.migration-v2-backup/` mit und setup zitiert dafür einen Präzedenzfall, der die Aussage nicht trägt; `/fusion:help` verweist auf eine `CLAUDE.md`, die der Installer nie ausliefert. Sowie ein Sammel-Record mit sechs Kleinbefunden, unter denen `/fusion:commit` ohne `AskUserQuestion` in der Allowlist der einzige mit realem Ausfallmodus ist.

### 5. Die Hooks als System

Hier ist wenig zu melden, und das ist das Ergebnis.

- `hooks/dist` ist **byte-identisch** zu einem frischen `tsc`-Lauf (`diff -r`, leer). Die Drift, die vier Tage unbemerkt lag, ist geschlossen.
- Die Auswertungsreihenfolge in `guardBashCommand` (git-deny → halt → mutation-deny → exemption-note → override-note) ist konsistent mit der Write-Tool-Seite (halt → protected → decision), und die Eigenschaft „höchstens ein Block pro Aufruf" hält an beiden Flächen.
- Die Fail-Open-Politik ist an beiden `main().catch`-Stellen identisch und wird seit `coerceState` nicht mehr durch ein formgültiges JSON ausgelöst.
- Zustand über Aufrufe hinweg: `loadEscalation`/`saveEscalation` werden auf jedem Pfad genau einmal persistiert; die zwei Notiz-Pfade, die zweimal laden, tun es nachweislich absichtlich und in der richtigen Reihenfolge.

Zwei Befunde am Rand:

- **`260805-1839` — Der Tracker steht im Plugin-Repo nur still, wenn cwd exakt die Repo-Wurzel ist.** Low. Das Log trägt frische `tracker_record`-Zeilen, obwohl der Self-Detect-Ausstieg oben steht: bei einem Unterverzeichnis als cwd findet `isFusionPluginCwd()` kein Manifest, `findWorkbenchRoot()` läuft aber aufwärts und findet das Log doch. Geschwister des offenen Guard-Issues `260804-2100` — gleiche Wurzel, andere Fläche. Beide gehören mit demselben Schnitt gefixt, sonst heilt der Guard und der Tracker bleibt schief.
- **`260805-1859` — Das Guard-Event-Log wächst unbegrenzt, und sein größter Schreiber liefert null Information.** Low heute, wachsend. Gemessen: 11 142 Zeilen, 4,9 MB, 61 ms pro Monitor-Refresh, bei 2-Sekunden-Takt 3 % Dauerlast. 22 % des Logs sind `"Bash command observed"` — ein Ereignis ohne Datei, ohne Kommando, ohne Ergebnis, das der Monitor wegfiltert und niemand liest. Ein Jahr linearer Fortschreibung ergibt rund ein Drittel eines Kerns im Dauerbetrieb.

### 6. Der Installer

`install.sh` liefert alles aus, was ein laufendes Plugin braucht. Die kompilierten Hooks sind eingecheckt und in sich geschlossen, die `+x`-Bits überleben, `settings.json` ist dabei, `node_modules` und `CLAUDE.md` werden korrekt weggelassen. Ein Befund:

- **`260805-1839` — `install.sh:81` will eine `LICENSE` kopieren, die das Repo nicht hat.** Low. Der `[ -e ]`-Guard schluckt es still. Für ein per `curl | bash` öffentlich installierbares Projekt ist das über die Listenpflege hinaus eine Entscheidung, die dem Nutzer gehört.

### 7. Doku-Drift

- **`260805-1839` — Die Dateitabelle in `README-hooks.md` kennt drei `lib/`-Module nicht**, darunter beide neuen dieses Circles (`fs-locator.ts`, `rules-write-exemption.ts`). Low, aber symptomatisch: Module hinzugefügt, Inventar nicht nachgezogen.
- **`260805-1839` — `CLAUDE.md` trägt vier veraltete Angaben.** Low. Darunter ein Symptomtabellen-Eintrag, der ein behobenes Monitor-TZ-Problem als offen führt und auf eine Issue-Datei zeigt, die es nicht gibt.
- **`260805-1839` — Kommentar-Drift in `bin/fusion-rules` und `bin/fusion-paths`.** Low. Zwei Stellen nutzen die Klammer-Schreibweise für Marker — ausgerechnet die Form, deren Glob-Falle die Konventionen verbieten und die nirgends mehr als Vorbild lesbar sein sollte.

## Querschnittsbeobachtungen

**Die Zitierform ist der eigentliche Schuldige, nicht die Zitate.** Sechzehn tote Verweise in zwei Klassen, und beide folgen aus derselben Entscheidung: einen Workbench-Record mit vollem Dateinamen zu zitieren, obwohl der Dateiname den Zustand trägt. Jeder `_o_→_a_→_i_`-Übergang bricht jeden Verweis auf den Record, und zwar lautlos. Die Regel, die diese Form empfiehlt, zitiert ihre eigene bindende Entscheidung unter einem Namen, den es nicht mehr gibt — das ist der Beweis am lebenden Objekt. Eine markerlose Form (`260801-1020_*_slug`) würde die ganze Klasse eliminieren. Das ist eine Entscheidung, kein Fix, und sie sollte vor dem mechanischen Auffrischen der 16 Stellen fallen, sonst frischt man zweimal auf.

**Der Text ist ungetestet, wo der Code getestet ist.** 1551 Tests decken die Klassifizierer bis in die Verb-Tabellen. Für die Frage „zeigt dieser Verweis auf etwas, das es gibt" existiert kein einziger Test, obwohl sie mechanisch prüfbar ist und obwohl es bereits vier Lint-Tests für andere Texteigenschaften gibt (`path-literal-lint`, `marker-format-lint`, `glob-nomatch-lint`, `provenance-header-lint`). Ein fünfter — Verweise auf `rules/`-Dateien, Abschnittsüberschriften und Workbench-Records auflösen — hätte alle 16 Befunde aus Thema 2 gefunden, bevor sie ausgeliefert wurden. Das ist die billigste Struktur-Investition in dieser Liste.

**Zwei Skill-Defekte scheitern still, und beide auf dieselbe Weise:** ein leeres Ergebnis, das von einem legitimen leeren Ergebnis nicht zu unterscheiden ist. `shared_of` liefert keinen Store, der Archive-Vorschlag zeigt null Treffer, und niemand kann sehen, ob das stimmt. Die Konventionen kennen das Prinzip (`HYG-NO-SILENT-FAIL`) und wenden es im Guard konsequent an — in den Skills nicht.

**Die Umgebungs-Rückkopplung fehlt an drei Stellen gleichzeitig.** Agenten lesen fremde Regeln (Thema 1); der Tracker läuft im Dev-Repo, wo er nicht sollte, weil cwd nicht die Wurzel ist; das Event-Log wächst, ohne dass jemand hinsieht. Alle drei sind Varianten desselben Musters: eine Annahme über die Umgebung, die niemand prüft und deren Verletzung sich nicht meldet.

## Empfohlene Reihenfolge

**Zuerst diese drei:**

1. **`260805-1859` — FUSION_PLUGIN_ROOT im eigenen Repo.** High, und Voraussetzung für alles andere. Solange Agenten hier die Regeln von v5.8.0 lesen, arbeitet jede Regelkorrektur ins Leere und jede Extraschleife wiederholt sich. Die Maschinerie ist da: `isFusionPluginCwd()` weiß bereits, dass wir im Plugin-Repo sind. Eine Warnung bei Abweichung ist billig; die Helfer die Repo-eigenen `rules/` bevorzugen zu lassen ist der saubere Schnitt. Und die Prüfung gehört in die Release-Prozedur — sie ist wiederholbar und dauert eine Sekunde.
2. **`260805-1904` — `shared_of` unter zsh.** Der einzige Befund mit stillem Datenverlust-Charakter: `/fusion:cleanup` archiviert autonom und ohne Gate und übergeht dabei jede geschlossene Shared-Datei. Der Fix ist eine Zeile plus eine Nicht-leer-Prüfung.
3. **`260805-1904` — der Setup-Lockout-Rest.** Dieselbe Deadlock-Form, die vier Tage lang Projekte ausgesperrt hat, mit lebendem Auslöser. Sie kam beim ersten Mal als Befund von außen; das sollte sie nicht noch einmal.

**Danach:** Die beiden Circle-Aktivierungs-Befunde (`260805-1839`) gehören zusammen entschieden, nicht getrennt gepatcht — es ist eine Frage, wem der Übergang gehört, und vier Dateien folgen der Antwort. Die Lock-Regel und die zwei Skills ohne Lock im selben Zug.

**Als Aufräumen:** Die vier Sammel-Records mit Doku-Drift, tote Zitate und Kommentar-Relikte. Vorher die Entscheidung zur Zitierform, sonst wird zweimal angefasst. Und der Lint-Test aus den Querschnittsbeobachtungen — er ist der Grund, warum dieses Aufräumen das letzte seiner Art sein könnte.

**Keine Release-Blocker.** v5.9.1 ist ausgeliefert und funktionsfähig. Der High-Befund betrifft die Entwicklung des Plugins, nicht seinen Betrieb beim Nutzer.
