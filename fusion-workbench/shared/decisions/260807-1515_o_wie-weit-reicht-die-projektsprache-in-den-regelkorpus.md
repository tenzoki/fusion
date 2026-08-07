# Wie weit reicht die Projektsprache in den Regelkorpus, und was gilt in einem Repository, das seine eigenen Regeln ausliefert?

---
**Domain:** code
**Status:** open
**Filed by:** reconciler, Abschluss-Pass zu `circles/260807-0923-guard-misst-statt-orakelt`, 260807-1515
**Cross-references:**
`rules/fusion-workbench-conventions.md` `## Project language` (die einzige Stelle, die die Deklaration definiert),
`rules/user-facing-output.md` (die Stelle, die sie anwendet),
`bin/fusion-rules` (der einzige Leser im Code),
`CLAUDE.md:3` (`**Language:** de`),
`shared/decisions/260706-1902_i_consultant-chat-longform-boundary.md` (die letzte Entscheidung über Sprachprofile)

---

## Question

`CLAUDE.md` dieses Projekts deklariert `**Language:** de`. Der Regelkorpus unter `rules/` ist
durchgehend englisch. Die Frage ist, ob das ein Bruch ist oder der beabsichtigte Zustand — und
falls letzteres, warum keine Regel das sagt.

**Der Widerspruch ist nicht offensichtlich, deshalb ausgeschrieben.** Nach der Definition in
`rules/fusion-workbench-conventions.md` `## Project language` steuert die Deklaration
ausschließlich, welche stilometrischen Profile unter `fusion-workbench/stilwerk/` gelten:

> Projects declare the language of their prose output in `CLAUDE.md` […] The declaration governs
> which stylometric profiles under `./fusion-workbench/stilwerk/` apply.

Gemessen am 260807-1515 ist das auch die einzige Verwendung im Code: `bin/fusion-rules` ist der
einzige Leser der Zeile, und er benutzt sie nur, um `chat-voice-<lang>.yaml` und
`default-voice-<lang>.yaml` auszuwählen. Nach dem Buchstaben der Regel gibt es also **keinen
Bruch**: die Regeldateien sind kein Prosa-Ausgabekanal eines Agenten, sondern Eingabe an ihn.

Trotzdem steht der Bruch beobachtbar da, und zwar an drei Stellen, die die Regel nicht abdeckt:

1. **Der ausgelieferte Regeltext gegen die eigene Arbeitssprache.** Dieses Repository ist die
   Quelle des Plugins. Seine `rules/*.md` werden an Konsumprojekte jeder Sprache ausgeliefert;
   englisch ist dafür die vertretbare Wahl. Gleichzeitig ist es selbst ein `de`-Projekt, dessen
   Workbench, Commit-Nachrichten und Sitzungsprotokolle deutsch sind. Ein Autor, der eine
   Regeldatei bearbeitet, hat keine Regel, die ihm sagt, welche der beiden Rollen gilt.
2. **Zweisprachige Einzeldateien.** Gemessen: `rules/critical-stance.md`,
   `rules/user-facing-output.md`, `rules/fusion-workbench-conventions.md` und
   `rules/circle-records.md` tragen deutsche Fragmente in englischem Fließtext — teils als
   Beispiel ausgewiesen, teils nicht. Der in diesem Circle hinzugefügte MECE-Abschnitt ist
   englisch und schreibt eine deutsche Pflichtzeile vor (`**Entscheidbarkeit:**` bei
   `**Language:** de`). Das ist in sich stimmig, aber es ist die vierte ungeschriebene Konvention
   in Folge.
3. **Die Kopf-Label von Artefakten.** Der MECE-Abschnitt sagt "Like every other head label it is
   written in the project's language". Diese Aussage über *alle* Kopf-Label steht in keiner
   Regel; sie steht nur in dem Nebensatz, der sie voraussetzt.

Die Frage lautet daher: **welche Textflächen erfasst die Sprachdeklaration, und welche sind von
ihr ausdrücklich ausgenommen?**

## Options

1. **Die Deklaration bleibt auf Prosa-Ausgabe beschränkt, und die Regel sagt das ausdrücklich.**
   `## Project language` bekommt einen Satz, der die ausgenommenen Flächen aufzählt: Regeldateien,
   Agenten-Prompts, Skill-Bodies, Code-Kommentare und READMEs sind englisch, weil sie an
   Konsumprojekte jeder Sprache ausgeliefert werden.
   - Pro: Beschreibt den heutigen Zustand ohne eine Zeile Arbeit am Bestand. Die Auslieferung an
     ein `en`-Konsumprojekt bleibt unberührt.
   - Contra: Schreibt die Zweisprachigkeit der vier gemessenen Dateien fest, ohne sie zu ordnen.
     Löst Punkt 2 und 3 oben nicht.

2. **Wie 1, plus eine Regel für die Kopf-Label und die Beispiele.** Zusätzlich wird festgelegt,
   dass Kopf-Label von Workbench-Artefakten in der Projektsprache stehen und dass ein
   fremdsprachiges Fragment in einer Regeldatei nur als ausgewiesenes Beispiel vorkommt.
   - Pro: Deckt alle drei beobachteten Stellen ab. Macht die Aussage des MECE-Abschnitts zu einer
     Regel statt zu einem Nebensatz.
   - Contra: Erfordert einen Durchgang durch die vier gemessenen Dateien.

3. **Die Projektsprache auf `en` setzen und die Workbench-Prosa umstellen.** Der Bruch
   verschwindet, indem die deutsche Seite aufgegeben wird.
   - Pro: Ein Sprachraum, keine Grenzfrage mehr.
   - Contra: Kostet die Arbeitssprache des Nutzers. Der Grund, aus dem `de` deklariert wurde, ist
     durch diesen Befund nicht widerlegt, und die stilometrischen `-de`-Profile existieren und
     werden benutzt.

4. **Nichts festlegen.** Der Zustand bleibt, wie er ist, und jeder Autor entscheidet im Einzelfall.
   - Pro: Keine Arbeit.
   - Contra: Das ist der heutige Zustand, und er hat in diesem Circle dazu geführt, dass eine
     Konvention über *alle* Kopf-Label in einem Nebensatz einer Regel über etwas anderes gelandet
     ist. Die nächste ungeschriebene Konvention landet an einer ähnlichen Stelle.

## Constraints

- Jede Antwort muss ein `en`-Konsumprojekt unverändert lassen. Der Regelkorpus wird ausgeliefert;
  eine Regel, die ihn deutsch machte, verlöre die Konsumenten.
- Sie darf `bin/fusion-rules` nicht dazu zwingen, mehr als die Profilauswahl aus der Zeile zu
  lesen. Der Fallback bei fehlender Zeile ist `en` und still; das ist gesetzt.
- Sie muss die Doppelrolle dieses Repositories benennen, statt sie zu übergehen: es ist zugleich
  Quelle des ausgelieferten Regeltexts und ein `de`-Projekt mit eigener Workbench.
- Sie darf nicht verlangen, dass Fließtext und Zitate in einer Datei dieselbe Sprache haben. Ein
  deutsches Beispiel in einer englischen Stilregel ist der Zweck des Beispiels.

## Recommendation

Keine gewogene Empfehlung, aber eine Einordnung: Option 1 ist die Untergrenze, weil sie den
heutigen Zustand nur aufschreibt und nichts kostet, und Option 4 ist sie deshalb nicht wert. Ob
darüber hinaus Option 2 lohnt, hängt an einer Frage, die dieser Befund nicht beantwortet hat —
ob die zweisprachigen Stellen in den vier gemessenen Dateien Leser tatsächlich stören oder nur
beim Zählen auffallen. Wer die Frage aufnimmt, sollte das zuerst prüfen, statt es zu vermuten.

## Warum im geteilten Speicher

Der Bruch ist älter als jeder Circle und erfasst den ganzen Regelkorpus. Aufgefallen ist er beim
Abschluss von `circles/260807-0923-guard-misst-statt-orakelt`, verursacht hat ihn dessen
Directive nicht. Herkunftsregel: neben der Arbeit gefunden, nicht von ihr verursacht.

---
Answered:
Implemented:
Deferred:
Superseded by:
