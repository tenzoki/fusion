# Session — der Regeltext-Ratchet wird ein Budget mit Meldung

**Agent:** coder
**Circle:** `260801-1244-guard-rules-write`
**Datum:** 2026-08-05, 17:53
**Status:** Complete
**Dispatch:** Orchestrator, Umbau nach Nutzerentscheid zu `260805-1559_*_…`

---

## Ergebnis in drei Sätzen

Die Schwelle ist **12 000 Bytes Luft über dem Rollenboden**, hergeleitet aus vier Tagen
nachgespielter `git log`-Historie über `rules/` und nicht geraten. Bei Überschreitung
**druckt** der Lauf, welche Dateien seit dem letzten Schnitt gewachsen sind und um wieviel,
sagt „a cleanup is due" und **fällt nicht**. Hart bleiben: die Emissionsmenge (das Golden),
die Rollendeckung, die Begründungspflicht und ein einziger, weit entfernter Deckel bei
145 144 — dem Stand, den die Flotte am 04.08. tatsächlich hatte.

Suite: `npx vitest run`, **1551 Tests in 27 Dateien, grün**. Eine Prüfung weniger als die
1552 zuvor: der Ratchet-Test ist weg, der Bericht ist dazugekommen, und
`keeps every agent under its role's cap` ist im Bericht aufgegangen.

**Berührte Dateien:** `hooks/lib/__tests__/rules-emission-golden.test.ts` (+297/−169),
`hooks/lib/__tests__/fixtures/rules-emission.golden` (2 Kopfzeilen). **Nicht** angefasst:
Version, `hooks/dist`, `rules/`, Commits.

---

## 1. Woher die Schwelle kommt

Der Auftrag verlangte messen statt raten. Ich habe die Historie nachgespielt: für jeden
Commit seit 2026-05-04, der `rules/`, `bin/fusion-rules` oder `agents/` berührt, einen
`git archive`-Schnappschuss ausgepackt und `bin/fusion-rules` gegen ihn laufen lassen — also
dieselbe Messung, die der Test macht, nur rückwärts durch die Geschichte. 128 Commits.

Was dabei herauskam:

| Zeitraum | Bewegung | Rate |
|---|---|---|
| ruhige Arbeit, 02.06. → 31.07. | 38 776 → 87 387 | rund **800 Byte/Tag**, in Schritten von 1 000–5 000 pro Commit |
| der schlimmste Lauf, 01.08. → 04.08. | 87 387 → 145 144 | rund **14 400 Byte/Tag** |
| schlimmster Einzeltag (03.08. → 04.08.) | 125 660 → 145 144 | **+19 484** |
| eine befundgetriebene Ergänzung | — | **430 Byte** (gemessen in `260805-1559_*_der-regeltext-ratchet-laesst-keine-erweiterung-zu-und-heute-war-die-erste-noetige.md`) |

`GROWTH_BUDGET = 12 000` ist so gewählt, dass vier Eigenschaften gleichzeitig gelten:

1. Es liegt **innerhalb** des schlimmsten gemessenen Tages (19 484). Ein Lauf wie der vom
   01.08. löst die Meldung an dem Tag aus, an dem er beginnt — nicht danach. Das ist die
   Eigenschaft, an der der ganze Auftrag hängt: „in vier Tagen wieder auf 145 kB, ohne dass
   es jemandem auffällt" wird unmöglich.
2. Es sind rund **24 befundgroße Ergänzungen**. Ehrliche Arbeit ist nie das, was es auslöst;
   der Fall aus `260805-1559_*_der-regeltext-ratchet-laesst-keine-erweiterung-zu-und-heute-war-die-erste-noetige.md` (430 Byte) landet, ohne dass irgendwer irgendetwas kürzt.
3. Bei der ruhigen Rate wird es **alle zwei bis drei Wochen** fällig. Das ist das „von Zeit
   zu Zeit bereinigt" des Nutzers, nicht ein Dauerton.
4. Die schlankste Rolle kann es **ganz ausgeben und liegt immer noch unter `RELEASE_CAP`**
   (89 896 + 12 000 = 101 896 < 105 354). Solange das Budget die offene Frage ist, zahlt
   kein konsumierendes Projekt mehr, als `origin/main` ohnehin schon berechnet hat.

Die Alternativen, die ich verworfen habe: **prozentual** (z. B. Boden × 1,10) gibt der
fettesten Rolle die meiste absolute Luft, also genau der, die schon über der Grundlinie
liegt — und Wachstum passiert überwiegend im geteilten Kern, den alle gleich zahlen. Ein
**absoluter, für alle gleicher** Betrag lässt deshalb alle Rollen zugleich anschlagen, was
die ehrliche Aussage ist: die Meldung ist eine Aussage über die Flotte.

---

## 2. Der Bezugspunkt — kein zweiter Speicher

Der Auftrag warnte davor, einen zweiten Speicher zu bauen, wenn der erste reicht. Ich habe
geprüft, ob die Golden-Fixture den Bezugspunkt tragen kann: **sie kann es nicht.** Die
Fixture wird bei jeder absichtlichen Änderung neu erzeugt und ist damit per Konstruktion
immer der *aktuelle* Stand. Ein Bezugspunkt, der der Messung folgt, misst nichts.

Ich habe deshalb **keinen neuen Speicher angelegt, sondern den vorhandenen umgewidmet**:
`ROLE_CAPS` war schon der nicht-regenerierbare Bezugspunkt im Quelltext — sechs Zahlen, nur
per Handedit beweglich. An seine Stelle tritt `RULE_BASELINE`, elf Zahlen (eine je Regeldatei,
die Größe nach dem letzten Schnitt). Der Rollenboden ist **daraus abgeleitet**: die Summe der
Baseline-Größen genau der Dateien, die diese Rolle lädt.

Das ist unterm Strich weniger und nicht mehr Zustand:

- vorher: 6 Rollendeckel **plus** die Notwendigkeit, Wachstum pro Datei aus dem Golden-Diff
  von Hand herauszulesen;
- jetzt: 11 Dateizahlen, aus denen sich Boden *und* Aufschlüsselung ergeben — **eine
  Tatsache statt zweier, die sich widersprechen können.**

Der Nebeneffekt ist der, den der Auftrag verlangt hat: der Bericht kann sagen, *welche* Datei
gewachsen ist, weil derselbe Speicher die Dateigrößen führt.

Zwei Randfälle, bewusst so:

- **Eine neu hinzugekommene Regeldatei hat keinen Baseline-Eintrag** und zählt deshalb mit
  ihrer *vollen* Größe als Wachstum. Richtig: niemand hat ihr ein Budget zugesprochen. Das
  ersetzt die alte Begründung für die Rollendeckel („eine neue Immer-Datei taucht in keiner
  Golden-Zeile auf") — nur ohne Sperre. Nachgewiesen, siehe § 5.
- **Ein Adressatenwechsel** (ein Agent bekommt eine Regeldatei dazu) hebt den Boden dieser
  Rolle um die Baseline-Größe der Datei und lässt ihr die volle Luft. Absichtlich: das Budget
  misst *Textwachstum*. Ein Adressatenwechsel wird vom Golden (hart) und von der
  Begründungspflicht (hart) regiert, nicht vom Budget.

---

## 3. Was hart bleibt

| Prüfung | Verhalten | Warum |
|---|---|---|
| **Golden** — Pfadmenge, Reihenfolge, Größe, Summe | **fällt** | Die Emissionsmenge ist der Kern des Auftrags: verschwindet oder erscheint eine Datei ohne Zutun der Fixture, ist das ein Fehler. Regenerieren ist ein Befehl und sperrt nichts — der Zweck ist, dass jede Bewegung in einem Diff landet, den jemand liest. |
| **Rollendeckung** — unbekannte oder verwaiste Rolle | **fällt** | Ein Adressatenwechsel in `bin/fusion-rules` ist eine Entscheidung und darf nicht still passieren. |
| **Begründungspflicht** — Rollenboden über `RELEASE_CAP` | **fällt** | siehe § 4 |
| **Drift-Deckel** bei 145 144 | **fällt** | siehe § 4 |
| **Budget** — Boden + 12 000 | **meldet** | der Umbau selbst |

Zur Größenfrage im Golden habe ich mich **gegen** Nachsicht entschieden, und das ist die eine
Stelle, an der ich den Auftragstext ausgelegt habe. „Nur die Größe wird nachsichtig" liest
sich, als solle auch das Golden Größen nicht mehr prüfen. Dagegen sprechen zwei Dinge:

1. Das Golden hat **nie** blockiert. Was blockiert hat, war `ROLE_CAPS`. Eine Größenänderung
   kostet dort einen Regenerationslauf und **nie einen Schnitt** — der Weg, der in
   `260805-1559_*_der-regeltext-ratchet-laesst-keine-erweiterung-zu-und-heute-war-die-erste-noetige.md` fehlte, ist damit offen. Ich habe genau das nachgespielt (§ 5, Fall A): die
   430-Byte-Ergänzung landet in vier Schritten, ohne dass irgendwo Text weicht.
2. Nähme man die Größen aus dem Golden heraus, verrottet die Größenspalte still — und genau
   sie ist es, aus der beim nächsten Schnitt `RULE_BASELINE` neu geschnitten wird. Die
   Anleitung dafür steht jetzt im Kopf der Datei unter `## Re-baselining after a cleanup`.

Wenn der Nutzer das anders sieht, ist die Änderung klein: die Golden-Zeile würde nur noch
Pfadmenge und Reihenfolge vergleichen. Ich halte das für schlechter und habe es deshalb nicht
gemacht — aber es ist eine Auslegung, keine Ableitung, und sie gehört gesagt.

---

## 4. Begründungspflicht und Release-Tor

### Die Begründungspflicht bleibt — und trägt jetzt mehr als vorher

Die Frage war, ob sie ohne Sperre noch etwas trägt. Sie trägt, weil sie **nie eine Frage über
Textgröße war**. Sie fragt: *wenn eine Rolle mehr kostet als das, was `origin/main` ohnehin
ausliefert, welche Datei kauft sie sich dafür, und warum braucht gerade diese Rolle sie?*
Das ist eine Frage über den **Adressatenschnitt**, und sie wird durch **Prosa** erfüllt,
nie durch einen Schnitt. Sie hat also nie das getan, was der Nutzer abgeschafft hat.

Zwei Dinge daran sind neu:

- Der Auslöser liest jetzt den **abgeleiteten Rollenboden** statt eines Handdeckels. Der
  Boden bewegt sich nur beim Neuschnitt von `RULE_BASELINE`, also genau dann, wenn jemand
  bereinigt hat. Damit fällt die Frage „was kostet diese Flotte, und wer zahlt den
  Aufschlag?" genau in den Moment, in dem sie ohnehin ansteht — und nicht bei jedem Byte.
- Ein latenter Fehler ist raus: für die Rolle `(core only)` hätte die Verankerungsprüfung
  verlangt, dass die Begründung die Zeichenfolge `"(core only)"` enthält
  (`key.split(" + ")` auf einem Schlüssel ohne Zusatzdateien). Der Fall konnte bisher nicht
  eintreten, weil der Kern unter der Grundlinie lag; unter einem Budget kann er es. Eine
  Rolle ohne Zusatzdateien hat keine Datei zu benennen — ihr Aufschlag ist der geteilte Kern,
  und der ist Sache der Flotte, nicht dieser Rolle.

`RELEASE_CAP = 105 354` bleibt unverändert und behält sein „NEVER RAISE THIS". Es gattert
jetzt nichts mehr; es ist die Grundlinie, an der sich die Begründungspflicht entzündet.

### Das Release-Tor bleibt — mit einem anderen Anschlag

Der Auftrag stellt es genau richtig: ein Tor, das nie sperrt, ist keins, und ein Tor, das bei
jedem Byte sperrt, ist das Abgeschaffte. Das alte Tor las die Rollendeckel und war damit die
zweite Hälfte des Ratchets — es hätte ein Release wegen eines einzigen Bytes verweigert.
Es einfach zu löschen wäre auch falsch gewesen: es hätte nur drei Prüfungen wiederholt, die
ohnehin schon fallen (Golden, Rollendeckung, Begründungspflicht) — dann wäre es überflüssig,
nicht nachsichtig.

Was geblieben ist, ist **ein** Anschlag: `DRIFT_CEILING = 145 144`, der Stand, den die Flotte
am 04.08. tatsächlich erreicht hatte, bevor der Zuschnitt sie herunterholte. Ein Agent, der
ihn erreicht, lässt die Suite fallen.

Warum diese Zahl und keine gewählte:

- Sie ist wie `RELEASE_CAP` eine **historische Tatsache**, kein geschätzter Wert — und eine
  Tatsache hebt man nicht an. Dieselbe Logik, dieselbe Formulierung in der Fehlermeldung.
- Sie liegt **33 378 Bytes über dem heute schlechtesten Agenten**: Wochen bei ruhiger Rate,
  rund zwei Tage im schlimmsten gemessenen Lauf. Keine befundgetriebene Ergänzung erreicht
  sie je.
- Zwischen Meldung und Deckel liegt eine breite Beratungszone. Das ist der Punkt: die Meldung
  fragt früh und oft, der Deckel fängt nur den Fall, in dem *jede einzelne* dieser Meldungen
  ignoriert wurde — bis zurück in den schlechtesten Zustand, den dieses Projekt je hatte.

Es bindet weiterhin bei jeder Version, nicht erst ab einer Literalzahl: jeder Lauf ist ein
mögliches Release, und eine handgepflegte Versionszahl im Test wäre genau die zweite Quelle,
die dieses Tor loswerden sollte.

---

## 5. Nachweis am laufenden Objekt

Nicht durch Nachdenken, sondern auf einer Wegwerfkopie des Plugins unter
`$SCRATCH/probe` (`rules/`, `agents/`, `bin/`, `.claude-plugin/`, `hooks/lib/`; `node_modules`
als Symlink). Der Test löst `pluginRoot` relativ zu seiner eigenen Lage auf, misst in der
Kopie also die Kopie. Kontrolllauf vor jeder Manipulation: **7 grün, keine Meldung.**

| Fall | Eingriff | Beobachtet |
|---|---|---|
| **A** — befundgroße Ergänzung landet | +430 Byte in `fusion-workbench-conventions.md` | Golden fällt („Rule emission for 'analyst' changed"); nach `UPDATE_RULES_GOLDEN=1` **7 grün, keine Meldung**. Kein Schnitt nötig — der Fall aus `260805-1559_*_der-regeltext-ratchet-laesst-keine-erweiterung-zu-und-heute-war-die-erste-noetige.md`, jetzt landbar. |
| **B** — eine Rolle über Budget, die anderen nicht | zusätzlich +8 000 in `protected-path-internals.md`, +5 000 in `critical-stance.md` | Meldung **nur** für `bugfixer, coder, coderev` (125 196, Budget 123 766), mit allen drei gewachsenen Dateien und Deltas, absteigend sortiert. Suite **grün**. |
| **C** — Kernwachstum trifft alle | zusätzlich +9 000 in `user-facing-output.md` | Meldung für **alle sechs** Rollen, jede mit eigenem Boden und Budget, nach Überschreitung sortiert (schlimmste zuerst). Suite **grün**. |
| **D** — Drift-Deckel | zusätzlich +11 000 in `git-branch-discipline.md` | Tor **fällt**: „`coder` loads 145 196, at or past the 145 144 drift ceiling … 52 over", für alle drei Agenten der Rolle. |
| **E** — Datei tritt in die Emission ein | neue `new-always-on.md` (6 000) **plus** `emit_if_exists`-Zeile | Golden **fällt** vor jeder Regeneration. Nach Regeneration grün — und als ich die Datei auf 13 000 wachsen ließ, erschien sie mit `+13 000` im Bericht: kein Baseline-Eintrag, volle Größe als Wachstum. |
| **F** — Datei verlässt die Emission | `decision-record-examples.md` gelöscht | Noch härter als erwartet: `bin/fusion-rules` selbst bricht ab, die Suite fällt schon beim Sammeln. Die Immer-Liste ist eine explizite `emit_if_exists`-Kette, kein Mustertreffer. |

Fall B und C zusammen sind der eigentliche Nachweis: die Meldung erscheint **rollengenau**,
nicht pauschal, und sie erscheint **nicht**, wenn das Wachstum ins Budget passt.

Die Formatierung habe ich nach Fall B zweimal nachgezogen: die Kopfzeile hieß erst
„bugfixer, coder, coderev **loads** …" (Numerus falsch bei Mehrzahl) und nannte die Rolle
nicht; und bei Kernwachstum standen sechs gleich aussehende Blöcke in beliebiger Reihenfolge.
Jetzt: Rollenschlüssel und Mitglieder in der Kopfzeile, Blöcke nach Überschreitung
absteigend, damit oben steht, wo zu schneiden ist.

Beispielausgabe (Fall B):

```
──────────────────────────────────────────────────────────────────────────────
RULE-TEXT BUDGET — a cleanup is due. This does not fail the suite.

role 'protected-path-internals.md' — bugfixer, coder, coderev
  125 196 bytes, budget 123 766 (floor 111 766 + 12 000)
grown since the last cut:
  protected-path-internals.md      +8 000
  critical-stance.md               +5 000
  fusion-workbench-conventions.md  +430

-> cut where the growth is, then re-baseline RULE_BASELINE in
   hooks/lib/__tests__/rules-emission-golden.test.ts from the regenerated
   golden. Until then this report stands; it is not a blocker.
──────────────────────────────────────────────────────────────────────────────
```

---

## 6. Was ich bewusst nicht getan habe

- **Die blockierte Ergänzung aus `260805-1559_*_der-regeltext-ratchet-laesst-keine-erweiterung-zu-und-heute-war-die-erste-noetige.md` nicht mitgelandet.** Sie ist jetzt möglich
  (Fall A beweist es), aber sie ist eine Konventionsänderung und gehört in einen eigenen
  Durchgang mit eigenem Bericht — nicht in einen Testumbau. Der Decision-Record steht
  entsprechend auf `_a_` und nennt sie als offenen Folgeschritt.
- **Version nicht angehoben** (5.9.1 steht), **nicht committet**, **`hooks/dist` nicht neu
  gebaut**. Deshalb `npx vitest run` und nicht `npm test` — letzteres würde `tsc` mitziehen.
- **Die historischen Absätze in `RULE_BASELINE` nicht umgeschrieben.** Sie sagen an mehreren
  Stellen „über dem Deckel" und meinen den damaligen `RELEASE_CAP`. Das sind datierte
  Einträge; sie halten fest, was zu diesem Zeitpunkt galt, und wären als Gegenwartsaussage
  umgeschrieben schlicht falsch.
- **Nichts außerhalb der Testdatei angefasst.** Ich habe das Repo nach `ROLE_CAPS` und
  `RELEASE_CAP` durchsucht: außer den Workbench-Aufzeichnungen dieses Circles (Historie,
  Plan, Decision) verweist kein Plugin-Quelltext und keine Doku darauf. Die zwei geänderten
  Zeilen in der Fixture sind der Kopfkommentar, den der Test selbst schreibt — die
  Messwerte sind Byte für Byte unverändert, was zugleich bestätigt, dass sich an der
  Emission nichts bewegt hat.

---

## 7. Was offen bleibt

- **Die Meldung erscheint auf `stderr` eines grünen Laufs.** Das ist die einzige Fläche, die
  ein Test hat, der nicht fallen darf, und sie ist übersehbar. Wenn das in der Praxis
  untergeht, wäre der nächste Schritt, sie zusätzlich irgendwohin zu schreiben, wo sie
  jemand findet — das Dashboard oder ein Workbench-Artefakt. Ich habe das **nicht** gebaut:
  es ist eine Vermutung über Nutzungsverhalten, keine gemessene Lücke, und es hätte den
  Diff über die Testdatei hinaus getragen.
- **`RULE_BASELINE` altert absichtlich.** Zwischen zwei Schnitten wird der Abstand zur
  Wirklichkeit größer — das *ist* die Messung. Wer beim nächsten Schnitt vergisst, neu zu
  schneiden, bekommt eine Meldung, die zu früh kommt. Der Kopf der Datei sagt das unter
  `## Re-baselining after a cleanup`; erzwungen ist es nicht, und mit Absicht nicht, weil
  jede Erzwingung wieder eine Sperre wäre.
