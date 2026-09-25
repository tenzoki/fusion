# Session: Release 5.9.0 vorbereitet, Push beim Nutzer (Plan-Schritt 6)

**Status:** Complete
**Agent:** coder
**Circle:** `260801-1244-guard-rules-write`
**Plan:** `260804-2356_*_plan-ausstieg-kontextsteuer-und-auslieferung.md` → Schritt 6
**Auftrag:** Orchestrator-Dispatch, 2026-08-05. Ausdrücklich **bis unmittelbar vor den Push**:
kein Push, kein Tag, kein Marketplace-Repo, kein Commit.

---

## Ergebnis in drei Sätzen

`claude plugin validate .` besteht und der Smoke-Test antwortet `SMOKE-OK`; `install.sh`
nimmt `rules/` mit allen 15 und `hooks/dist` mit allen 36 Dateien mit, gemessen an einem
simulierten Installationspfad. Der Zuschnitt kommt dort auch inhaltlich an: alle sechzehn
Emissionszahlen treffen das Golden exakt. **Ausgeliefert werden kann trotzdem nicht** — der
Versionssprung auf `5.9.0` stellt das Release-Gate scharf, das Schritt 1 genau dafür gebaut
hat, und vier Agenten stehen über dem Deckel.

---

## Vorab nachgeholt

Zwei Dinge, die der Guard-Halt dem Vorgänger blockiert hatte.

**Die fehlende Session-Historie zu A5a und A5** ist als
`260805-1054-coder-rollendeckel-und-dist-build.md` nachgetragen, rekonstruiert aus
den Commit-Nachrichten `f41c1f6` und `199ef22` und aus dem heutigen Code. Sie ist im Kopf als
nachgetragen gekennzeichnet, nennt den Grund (Halt) und trennt Referiertes sauber von neu
Gemessenem — die dort behaupteten Falsifikationen sind **nicht** neu ausgeführt worden, die
sechzehn Emissionszahlen und die Import-Prüfung über `dist` schon.

**Die zwei Kommentarkorrekturen** in `hooks/lib/__tests__/rules-emission-golden.test.ts`:

- Zeile 242, Tabellenzeile: `workbench-stash-and-lock` → `workbench-stash-and-lock.md`. Der
  echte `ROLE_CAPS`-Schlüssel trägt die Endung, die Übersichtstabelle im Kopfkommentar nicht.
  Das ist mehr als Kosmetik: der Test spaltet den Schlüssel an `" + "` und verlangt, dass die
  Begründung jeden Dateinamen nennt — eine Tabelle, die den Schlüssel anders schreibt als der
  Code, führt beim nächsten Schnitt an der falschen Zeile.
- Zeile 262, `circle-records.md`-Eintrag: „which it needs because it transitions nothing" ist
  für `playmaker` **sachlich richtig** (`agents/playmaker.md:62` verbietet ihm das Umbenennen
  eines Markers ausdrücklich), steht aber quer zum Nachbarkommentar in `bin/fusion-rules`, der
  dieselben drei Agenten als „create, activate, close or rank a Circle" beschreibt. Neu
  formuliert, sodass beides zusammengeht: `playmaker` benennt als einziger der drei keinen
  Marker um, bleibt aber im Publikum, weil die Zugehörigkeit aus dem Benennen eines
  Circle-Schlüssels **abgeleitet** wird — und ein Aktivierungsvorschlag muss im Vokabular der
  Überführung geschrieben sein, die er vorschlägt.

**Residuum, bewusst nicht angefasst:** der ungenauere Satz steht in `bin/fusion-rules`
(„The three agents that create, activate, close or rank a Circle" plus „An agent that names
no Circle key cannot transition a Circle"). Der Auftrag benannte die Testdatei; eine
Änderung an `bin/fusion-rules` unmittelbar vor einem Release, das der Nutzer selbst pusht,
gehört nicht unangekündigt in dessen Diff.

---

## Schritt 6 selbst

### Was geändert wurde

| Datei | Änderung |
|---|---|
| `.claude-plugin/plugin.json` | `"version": "5.8.0"` → `"5.9.0"` |
| `install.sh` Zeile 27 | `FUSION_REF=tags/v5.7.0` → `tags/v5.9.0` |

Das Marketplace-Repo ist unberührt. Nichts ist committet.

### Die beiden Vor-Push-Zusicherungen

`claude plugin validate .` → **Validation passed with warnings**. Die eine Warnung ist
bekannt und strukturell: `CLAUDE.md` im Plugin-Root wird nicht als Projektkontext geladen.
Sie betrifft eine Datei, die `install.sh` ohnehin nie kopiert.

`claude --plugin-dir . --agent fusion:orchestrator -p "reply SMOKE-OK"` → **`SMOKE-OK`**.
Der Agentenname löst also unter dem Installationsmechanismus auf, was der eigentliche Zweck
dieses Tests ist.

### Der Installationspfad, gemessen statt angenommen

Der Auftrag verlangte, `install.sh` nicht zu unterstellen, sondern zu prüfen. Ich habe die
Kopierliste aus den Zeilen 80–82 in ein Wegwerfverzeichnis nachvollzogen und dagegen
gemessen.

| Prüfung | Ergebnis |
|---|---|
| `rules/` vollständig | 15 von 15, `diff` gegen die Quelle leer |
| die fünf neuen Regeldateien dabei | ja — `circle-records.md`, `protected-path-internals.md`, `rule-file-provenance.md`, `workbench-path-resolution.md`, `workbench-stash-and-lock.md` |
| `hooks/dist` vollständig | 36 von 36, `diff` gegen die Quelle leer |
| die vier neuen `dist`-Module dabei | ja — `fs-locator.{js,d.ts}`, `project-relative.{js,d.ts}` |
| Index gegen Arbeitsverzeichnis | 36 verfolgt, 36 auf der Platte, keine Abweichung in beide Richtungen |
| `guard.js` vorhanden (die Prüfung, die `install.sh` selbst macht) | ja |
| `+x` auf `bin/` durch `cp -R` erhalten | ja |
| externe `require`/`import` in `dist` | keiner — alles relativ oder `node:` |

**Warum das gut geht:** `install.sh` kopiert `rules` und `hooks` als **ganze Verzeichnisse**,
nicht als Dateiliste. Neue Dateien darin kommen ohne Zutun mit. Der Auftrag vermutete hier
eine explizite Liste; sie ist explizit auf der Ebene der Verzeichnisse, nicht der Dateien.
Die einzige Bedingung ist, dass die Dateien eingecheckt sind, denn der Tarball ist der
GitHub-Archivstand — und das ist geprüft.

**Vier statt fünf.** Der Auftrag sprach von „den vier neuen Regeldateien". Gegen `origin/main`
sind es **fünf** (`git diff --name-status` zeigt fünf `A`). Vermutlich zählt der Auftrag die
vier aus den Schritten 4 und 4a und lässt `protected-path-internals.md` aus Schritt 2 aus.
Für das Ergebnis macht es keinen Unterschied — alle fünf kommen an.

### Das zweite Falsifikat, soweit vor dem Push prüfbar

Gegen den simulierten Installationspfad, `FUSION_PLUGIN_ROOT` darauf gerichtet, gefiltert
auf Pfade unterhalb von `$FUSION_PLUGIN_ROOT/rules`:

| Byte | Agenten |
|---|---|
| 89 913 | `ontocoder`, `ontorev`, `reconciler`, `consultant`, `editor` |
| 95 586 | `conceptrev`, `planner`, `taskplanner`, `analyst`, `investigator` |
| 99 215 | `playmaker` |
| 104 888 | `shaper` |
| 108 465 | `orchestrator` |
| 111 810 | `coder`, `coderev`, `bugfixer` |

Sechzehn von sechzehn treffen die Vorhersage des Goldens **exakt**. Das Falsifikat lautet:
„der Zuschnitt ist im Plugin-Repo passiert und im Installationspfad nicht angekommen". Für
den Installationspfad, wie `install.sh` ihn herstellt, ist es **nicht** eingetreten.

**Die Grenze dieser Messung, ehrlich:** sie prüft die Kopierlogik, nicht den Transport.
Nicht geprüft sind der GitHub-Tarball selbst, das Auspacken und der Zustand nach einem
echten `fusion --update` auf der konsumierenden Maschine. Der Lauf dort bleibt offen und ist
die vierte offene Frage des Plans.

**Nebenbefund zur Ausgangslage:** die heute installierte Kopie unter `~/.fusion` trägt zehn
Regeldateien und emittiert 105 354 Byte. Sie ist der Stand von `origin/main`. Der Auftrag
beschreibt das richtig.

---

## Warum Schritt 6 trotzdem nicht ausgeführt werden kann

Der Versionssprung selbst stellt das Gate scharf.

`hooks/lib/__tests__/rules-emission-golden.test.ts` → `gates the version bump on the release
cap` verzweigt an `isAfter(manifest.version, PRE_CUT_VERSION)` mit `PRE_CUT_VERSION = "5.8.0"`:

- bei `5.8.0` prüft es nur, dass jeder Agent über dem Deckel in einer Rolle mit hinterlegter
  Begründung sitzt — das gilt, also grün;
- ab der ersten höheren Version wird daraus eine Sperre.

`RELEASE_CAP = 105 354` ist der Wert, den `origin/main` heute schon ausliefert, und trägt im
Quelltext den Kommentar **„NEVER RAISE THIS"**. Über dem Deckel stehen `orchestrator` mit
108 465 (3 111 darüber) und `coder`/`coderev`/`bugfixer` mit je 111 810 (6 456 darüber).

**Suite: 1 546 von 1 547 grün, 27 Dateien, genau diese eine Zusicherung rot.** Ausgeführt mit
`npx vitest run` wie beauftragt, nicht mit `npm test` — `hooks/dist` wurde nicht neu gebaut,
der Index ist unverändert.

Ich habe das Gate **nicht angehoben, nicht umgangen und nicht umformuliert.** Es ist der
Mechanismus, den Schritt 1 gebaut hat, um genau diese Frage zu stellen, und die Antwort
„nein, noch nicht" ist eine Antwort und kein Defekt. Schritt 4a hat die Entscheidung bereits
dem Nutzer zugewiesen: „Wer ihn für alle sechzehn will, muss an `protected-path-internals.md`
oder an die immer-an-Dateien heran. Das ist eine Entscheidung für den Nutzer, keine
Fortsetzung dieses Schritts."

---

## Ist `5.9.0` die richtige Zahl

Der zweite Halbsatz der Begründung — „bricht keine dokumentierte Schnittstelle" — ist
geprüft, und er hält.

**Die entscheidende Messung:** `git diff --name-status --find-renames origin/main..HEAD --
rules/` liefert **kein einziges `D` und kein einziges `R`**. Zehn Dateien geändert, fünf neu.
Jeder Regeldateipfad, den ein konsumierendes Projekt gegen `origin/main` zitieren konnte,
löst an HEAD unverändert auf. Der Kandidat aus dem Auftrag — „ein konsumierendes Projekt,
das eine Regeldatei direkt zitiert, findet sie nicht mehr am alten Ort" — trifft also nicht
zu, weil der Zuschnitt **additiv** war: er hat Inhalt herausgezogen und neue Dateien angelegt,
aber keine Datei entfernt oder umbenannt.

**Was tatsächlich gewandert ist, ist Inhalt innerhalb bestehender Dateien.** Ein Zitat, das
auf einen Abschnitt zeigt (`fusion-workbench-conventions.md` `## Stashes`), findet dort jetzt
eine Zeigerzeile statt des Textes. Die Konventionsdatei führt die fünf Definitionsstellen in
einer Tabelle in ihrem Kopf. Ob eine Abschnittsüberschrift in einer Regeldatei eine
*dokumentierte* Schnittstelle ist, entscheide ich nicht: sie ist nirgends als solche
zugesagt, und öffentlich zitieren `README*.md` und `docs/` nur Dateipfade, keine Anker. Nach
dieser Prüfung trägt `5.9.0`.

Weitere Flächen geprüft und unverändert: `bin/fusion-rules` (Aufrufform, drei Suchwurzeln,
Exit-Codes 0/1/2/3), `bin/fusion-paths` (`KEY=value`, Exit 0/1/2/3/4), das
Manifest-Verhalten bei `./rules/context-manifest.yaml`. Die offene Planfrage, ob
`fusion-guard.json` als neue Nutzerfläche `6.0.0` rechtfertigt, bleibt offen — eine neue
*optionale* Konfigurationsdatei fügt hinzu und bricht nichts, wäre nach Semver also `minor`.

---

## Befunde, abgelegt und nicht behoben

**`260805-1145_*_der-forensik-zeiger-im-ausgelieferten-regeltext-zeigt-auf-eine-datei-die-der-installer-nie-mitnimmt.md`, Medium.** Fünf Stellen in ausgelieferten Dateien
(`rules/protected-path-discipline.md` 2×, `rules/protected-path-internals.md`,
`README-hooks.md` 2×) nennen die Forensik-Analyse bei einem Pfad unterhalb von
`fusion-workbench/`. `install.sh` kopiert `fusion-workbench` nicht und darf es nicht — es ist
das Laufzeitartefakt des Konsumenten. Der Pfad trägt zusätzlich den Namen *dieses* Circles
und löste beim Konsumenten auch dann nicht auf, wenn er mitkäme. Das ist die Fehlerklasse,
gegen die Schritt 3 geschrieben wurde: ein ausgelieferter Satz, der beim Leser falsch ist.

**`260805-1150_*_readme-nennt-als-pin-beispiel-eine-version-die-nie-getaggt-wurde.md`, Low.** `README.md:26` gibt als Pin-Beispiel `FUSION_REF=tags/v5.3.0`. Tags
existieren erst ab `v5.5.0`; `v5.3.0` hat es nie gegeben. Damit sind es **vier**
Versionsflächen, nicht die drei, die `CLAUDE.md` aufzählt — und `README.md` ist die, die ein
Nutzer zuerst liest.

---

## Was der Nutzer beim Push zu tun hat

Die Reihenfolge steht im Bericht an den Orchestrator. Kern: zuerst die Deckel-Entscheidung,
denn sie bestimmt, ob überhaupt gepusht wird.
