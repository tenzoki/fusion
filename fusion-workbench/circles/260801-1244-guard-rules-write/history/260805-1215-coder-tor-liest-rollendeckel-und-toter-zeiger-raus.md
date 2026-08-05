# Session — das Release-Tor liest die Rollendeckel, und der tote Forensik-Zeiger ist raus

**Agent:** coder
**Circle:** `circles/260801-1244-guard-rules-write`
**Datum:** 2026-08-05, 12:15
**Status:** Complete
**Dispatch:** Orchestrator, zwei Änderungen vor dem Push von 5.9.0

---

## Ergebnis in drei Sätzen

Die Suite ist bei stehender Version **5.9.0 grün**: 1547 Tests in 27 Dateien, `npx vitest run`,
Testzahl unverändert gegenüber `f41c1f6`. Ich habe **fünf** Zeigerstellen gefunden, exakt die
fünf aus dem `Affects:`-Feld des Issues — eine eigene Suche über alle 141 verfolgten
Nicht-Workbench-Dateien fand keine sechste — und **eine Folgestelle**, die durch die Änderung
falsch geworden wäre. Die Emissionszahlen haben sich bewegt: jeder der sechzehn Agenten trägt
17 Bytes weniger, die drei Guard-Internals-Agenten 44 weniger; alle sechs Rollendeckel sind
entsprechend **gesenkt**.

---

## 1. Das Tor liest jetzt `ROLE_CAPS`

### Was vorher stand

`gates the version bump on the release cap` hatte zwei Zweige, entschieden über
`isAfter(manifest.version, PRE_CUT_VERSION)` mit `PRE_CUT_VERSION = "5.8.0"`:

- **unterhalb**: jeder Agent über `RELEASE_CAP` musste in einer Rolle mit `overRelease` sitzen —
  eine Notiz, kein Riegel;
- **oberhalb**: *kein* Agent durfte über `RELEASE_CAP` liegen, ohne Ansehen der Rolle.

Der zweite Zweig war der rote. Er sprach die Regel „eine Zahl für alle sechzehn" aus, die der
Nutzer am Gate vom 2026-08-05 durch die Rollendeckel ersetzt hat. Vier Agenten sind über dem
alten Einzelwert, alle vier mit im Quelltext hinterlegter Begründung — genau die Lage, die die
Entscheidung ausdrücklich erlaubt und die das Tor trotzdem als Regression las.

### Was jetzt steht

Der Test heißt `gates the release on the role caps, each read against the release baseline` und
liest dieselbe Quelle wie die beiden Rollenzusicherungen darüber. Ein Agent darf ausgeliefert
werden, wenn **beides** gilt:

1. seine gemessene Last liegt innerhalb des Deckels **seiner Rolle**, und
2. dieser Deckel liegt entweder innerhalb der Grundlinie `RELEASE_CAP` — dann kostet er ein
   konsumierendes Projekt nichts, was es nicht ohnehin zahlt — oder darüber **mit** in
   `overRelease` festgehaltenem Grund.

Beide Fehlarten melden getrennt, mit Rolle, Mitglied und Zahl:
`coder=111766 exceeds its role cap …` beziehungsweise
`coder=111766 is 6412 over the 105354 baseline and role '…' records no reason`.

### Was mit der Version passiert ist

`PRE_CUT_VERSION` und `isAfter()` sind entfallen. Die Version wird noch gelesen, aber nur, um
in der Fehlermeldung zu stehen: *„Version 5.9.0 may not be released."* Das ist eine bewusste
Verschärfung, und ich benenne sie als solche, weil sie über den Auftrag hinausgeht:

- Vorher band der strenge Zweig **erst oberhalb** eines handgepflegten Versionsliterals.
- Jetzt bindet das Tor **bei jedem Lauf**. Jeder Lauf ist ein potenzielles Release, und ein
  Versionsliteral, das jemand von Hand nachziehen muss, ist genau die zweite Quelle, deren
  Beseitigung der Auftrag war. Ein vergessener Nachzug hätte das Tor stumm gemacht.

Es ist nicht schwächer als vorher: die Bedingung des alten Vor-Release-Zweiges gilt weiter,
unverändert, und die des Nach-Release-Zweiges gilt in der Fassung, die die Rollenentscheidung
ausspricht.

### Die drei Eigenschaften, die erhalten bleiben mussten

**Der Ratschen-Charakter.** Unberührt. Er sitzt nicht im Tor, sondern in
`pins every role cap to that role's high-water mark`: ein Deckel muss dem gemessenen Höchstwert
**gleich** sein. Ein neu erzeugtes Golden kann ihn nicht anheben, weil der Deckel ein Literal im
Testquelltext ist und der Test bis zur Handänderung rot bleibt. Ich habe alle sechs Deckel in
dieser Session gesenkt, keinen angehoben.

**Die Begründungspflicht.** Unberührt und jetzt an zwei Stellen wirksam: in
`justifies in this source every role cap that stands above the release cap` wie bisher (leere
Begründung → rot; Begründung, die nicht jede Zusatzdatei der Rolle beim Dateinamen nennt → rot)
und zusätzlich im Tor selbst, das ohne Begründung das Release verweigert.

**Der alte Einzelwert.** `RELEASE_CAP = 105_354` steht unverändert im Quelltext, und der
Doc-Block sagt jetzt sichtbar, was er ist: die **Grundlinie**, die `origin/main` heute
undifferenziert allen sechzehn Agenten zumutet. Nicht mehr die Decke.

### „NEVER RAISE THIS"

Die Zeile ist geblieben, weil sie weiter gilt — aber ihre Begründung hat sich geändert, und der
Kommentar sagt das ausdrücklich. Vorher las sie sich als *„das Ziel, auf das jeder Rollendeckel
herunterratscht"*. Diese Ratsche ist in die Rollendeckel gewandert, die an ihren eigenen
gemessenen Höchstwerten hängen. Jetzt liest sie sich als: eine Anhebung würde in einer einzigen
Änderung jede Begründung stillegen, die nur deshalb existiert, weil eine Rolle über der
Grundlinie steht. Die Zahl ist eine historische Tatsache darüber, was `origin/main` ausliefert,
und eine Tatsache wird nicht angehoben — Senken wäre aus demselben Grund sinnlos. Die
Fehlermeldung des Tors schließt den dritten Ausweg ausdrücklich aus: *„raising RELEASE_CAP is
not the third option."*

### Falsifiziert, nicht nur grün gelesen

Zwei gezielte Fälschungen auf der Arbeitskopie, jede zurückgenommen:

| Fälschung | Erwartet | Gemessen |
|---|---|---|
| `overRelease` der Internals-Rolle entfernt | Begründungstest **und** Tor fallen | beide rot, das Tor mit drei benannten Agenten |
| `(core only)`-Deckel auf 89 000 gesenkt | Tor meldet die Rollendeckel-Verletzung | rot, `consultant=89896 exceeds its role cap 89000` und drei weitere |

Die Versionsunabhängigkeit habe ich **nicht** durch Herabsetzen von `plugin.json` gemessen — der
Dispatch verbietet, die Version anzufassen. Sie ist stattdessen strukturell abzulesen: es gibt
keinen Versionszweig mehr, die Version wird nur noch in die Meldung interpoliert. Das ist eine
Ableitung aus dem Quelltext, keine Messung.

---

## 2. Der Forensik-Zeiger

`260805-1145`, jetzt `_c_`. Der Nutzer entschied: **Zeiger entfernen, Herkunft nennen**, also
weder Weg 1 noch Weg 2 des Issues, sondern die vierte Möglichkeit. Entscheidung `260805-0709`
bleibt unberührt; die Forensik liegt weiterhin im Analysespeicher dieses Circles.

**Fünf Stellen, alle geändert** — `rules/protected-path-discipline.md` (2),
`rules/protected-path-internals.md` (1), `README-hooks.md` (2). Die Formulierung ist überall
dieselbe Aussage: die Messungen liegen in fusions eigenem Entwicklungs-Repository, und keine
Installation trägt sie. Kein Pfad, keine Zusage.

**Plus eine Folgestelle, die der Auftrag nicht nannte.** `README-hooks.md` sagte unter der
Schichtentabelle: *„The other two are reference and evidence, **cited by path from the first**."*
Nach der Änderung stimmte das für die Evidenz nicht mehr. Der Satz nennt jetzt den Unterschied
und den Grund — Referenz mit Pfad, Evidenz ohne, weil eine Installation sie nicht trägt.

**Die Suche.** Der Auftrag warnte, sich nicht auf die Zahl fünf zu verlassen. Ich habe nicht
die Zahl geprüft, sondern die Menge: `git ls-files` ohne `fusion-workbench/` und ohne
`hooks/dist/` ergibt 141 Dateien; darüber `protected-path-forensics`,
`guard-rules-write/analyses` und `circles/26` gegriffen. Nach der Änderung findet
`protected-path-forensics` in dieser Menge **nichts** mehr.

**Was ich gefunden und nicht angefasst habe.** Dieselbe Nichtauflösbarkeit trifft eine zweite,
größere Gattung: Zitate von Entscheidungs- und Issue-Records im ausgelieferten Text. Vier in den
beiden Regeldateien (`protected-path-internals.md` Zeilen 70, 133, 332;
`protected-path-discipline.md` Zeile 129), rund sieben in `README-hooks.md`, dazu Quellkommentare
in `hooks/lib/config.ts`, `shell-parse.ts` und `paths.ts`. Sie sind eine andere Gattung — sie
belegen eine Behauptung, statt eine Fundstelle zu versprechen, und alle bis auf
`protected-path-internals.md:332` sind ohnehin mit `…` abgeschnitten, also gar nicht als
öffnbarer Pfad gemeint. Die `**Provenance:**`-Kopfzeilen sind eine dokumentierte Konvention
(`rules/rule-file-provenance.md`) und nennen eine Herkunft, keinen Fundort. Ob die Zitate
ebenso weichen sollen, gehört zum Nutzer; es ist nicht in Entscheidung `260805-1145` enthalten.

---

## Emissionszahlen

Das Golden wurde bewusst mit `UPDATE_RULES_GOLDEN=1` neu erzeugt, der Diff gelesen. Er berührt
**ausschließlich** die zwei Dateigrößen und die davon abhängigen Summen — keine Pfadmenge, keine
Emissionsreihenfolge, keine Rollenzugehörigkeit. Das belegt unabhängig, dass die Textänderung
keine Emission verschoben hat.

| Datei | vorher | nachher |
|---|---|---|
| `rules/protected-path-discipline.md` (alle 16) | 19 960 | 19 943 |
| `rules/protected-path-internals.md` (3) | 21 897 | 21 870 |

| Rolle | Agenten | Deckel vorher | Deckel jetzt |
|---|---|---|---|
| `(core only)` | 5 | 89 913 | **89 896** |
| `design-diagrams.md` | 5 | 95 586 | **95 569** |
| `circle-records.md` | 1 | 99 215 | **99 198** |
| `circle-records.md + design-diagrams.md` | 1 | 104 888 | **104 871** |
| `circle-records.md + workbench-stash-and-lock.md` | 1 | 108 465 | **108 448** |
| `protected-path-internals.md` | 3 | 111 810 | **111 766** |

Dreizehn von sechzehn Agenten liegen unter der Grundlinie. Über ihr: der Orchestrator mit 3 094
(vorher 3 111) und die drei Guard-Internals-Agenten mit 6 412 (vorher 6 456) — beide mit
unveränderter, jetzt zahlenrichtiger Begründung. Die Byteangaben **in** den Begründungstexten
habe ich mitgezogen (`21 897` → `21 870`), sonst wäre die Begründung still veraltet, was genau
die Fehlerklasse ist, gegen die die Anker-Zusicherung geschrieben wurde.

Der Verlauf im Kopfkommentar hat eine Zeile bekommen: `111 766 — 2026-08-05, at release
preparation`, ausdrücklich als **kein Schnitt** gekennzeichnet, mit Ursache (Issue `260805-1145`)
und Aufteilung.

---

## Was ein späterer Zuschnitt tun muss, damit das Tor weiter trägt

1. **Golden bewusst neu erzeugen**, Diff lesen. Der Lauf mit dem Flag fällt absichtlich; das ist
   die Bremse, nicht der Fehler.
2. **Jeden betroffenen Rollendeckel auf den neuen gemessenen Höchstwert senken.** Erzwungen von
   `pins every role cap …` — der Deckel muss *gleich* dem Höchstwert sein, nicht nur größer.
3. **Wenn eine Rolle unter die Grundlinie fällt**: `overRelease` entfernen. *Das ist heute die
   einzige nicht mechanisch erzwungene Stelle.* `justifies …` überspringt Einträge mit
   `cap <= RELEASE_CAP`, also überlebt eine Begründung, die keinen Grund mehr hat, unbemerkt.
   Ich habe das nicht geschlossen, weil der Auftrag die Begründungspflicht erhalten und nicht
   erweitern hieß — es ist ein Befund, keine erledigte Arbeit.
4. **Wenn eine Rolle über die Grundlinie steigt**: `overRelease` schreiben, und darin **jede**
   Zusatzdatei der Rolle beim Dateinamen nennen. Sonst rot.
5. **Wenn sich die Zielgruppe einer Regeldatei in `bin/fusion-rules` ändert**, entsteht oder
   verschwindet eine Rolle. Beides meldet
   `assigns every agent a role derived from what it actually loads` mit Namen. Ein Agentenname
   steht nirgends als Schlüssel; die Zugehörigkeit wird gemessen.
6. **Die Byteangaben in den Begründungstexten mitziehen.** Nicht erzwungen — der Test prüft den
   Dateinamen, nicht die Zahl daneben.
7. **`RELEASE_CAP` bleibt, wo es ist.** Es ist kein Ziel mehr, das man erreicht und dann
   nachzieht, sondern die Grundlinie, gegen die begründet wird.

---

## Nicht getan, wie beauftragt

- **Nicht committet, nicht getaggt, nicht gepusht.** Marketplace-Repo nicht berührt.
- **`.claude-plugin/plugin.json` und `install.sh` unangetastet** — beide stehen weiter
  uncommitted auf 5.9.0, wie vorgefunden.
- **`hooks/dist` nicht neu gebaut.** `git status` zeigt es unverändert. Geprüft wurde mit
  `npx vitest run` und einem reinen `npx tsc --noEmit` (Exit 0), der nichts nach `dist`
  schreibt.

## Geänderte Dateien

- `hooks/lib/__tests__/rules-emission-golden.test.ts` — Tor, Deckel, Kommentare
- `hooks/lib/__tests__/fixtures/rules-emission.golden` — bewusst neu erzeugt
- `rules/protected-path-discipline.md` — 2 Stellen
- `rules/protected-path-internals.md` — 1 Stelle
- `README-hooks.md` — 2 Stellen + 1 Folgesatz
- `fusion-workbench/.../issues/260805-1145_c_…` — Auflösung angehängt, `_o_` → `_c_`
