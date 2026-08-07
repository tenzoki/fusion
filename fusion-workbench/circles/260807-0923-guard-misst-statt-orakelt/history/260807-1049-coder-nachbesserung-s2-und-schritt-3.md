# Nachbesserung an Schritt 2 (Inhalt statt Digest) und Schritt 3 (Regel-Ausnahme auf der Messseite)

**Datum:** 2026-08-07
**Agent:** coder
**Status:** Complete
**Plan:** `circles/260807-0923-guard-misst-statt-orakelt/planning/260807-0931_o_plan-guard-misst-statt-orakelt.md`, Nachbesserung zu Schritt 2 und Schritt 3
**Nicht committet** — der Auftrag schließt das Committen aus.

## Teil 1 — der Fingerabdruck trägt den Inhalt

Vom Nutzer am 260807 entschieden, auf Vorschlag des Befundsatzes
`260807-1026_c_rueckrollen-auf-head-kann-menschliche-vorarbeit-verwerfen.md`.

| Datei | Art |
|---|---|
| `hooks/lib/protected-snapshot.ts` | `fingerprint` liefert base64-Inhalt statt sha256; `ProtectedChange.before`; neue Funktion `restore` |
| `hooks/tracker.ts` | `revertFromHead` → `restorePath`; Meldungstexte; Kopf nachgezogen |
| `hooks/lib/escalation.ts` | eine Kopfzeile, die noch "restored from git" sagte |
| `hooks/lib/__tests__/protected-snapshot-integration.test.ts` | zwei Fälle umgeschrieben, vier neue |
| `hooks/lib/__tests__/helpers/guard-harness.ts` | Docstring der `git`-Option — sie ist keine Voraussetzung der Messung mehr |

**Der Gewinn ist die Fallunterscheidung, nicht die Genauigkeit.** Vorher fünf Zweige — in
git und sauber, in git mit gestagter Arbeit, nicht versioniert, in diesem Aufruf angelegt,
gar kein Repository. Einer davon verwarf menschliche Arbeit, drei konnten überhaupt nichts
wiederherstellen. Jetzt einer: schreib zurück, was vorher da war. Nichtexistenz vorher
bleibt ein eigener Wert (`ABSENT`) und heißt beim Zurückschreiben "löschen". Der
Zweig-Schnitt in `restore` liest nur `before` und nicht `kind` — `kind` ist ein Etikett für
den Leser der Meldung, `before` ist der Wert, der entscheidet; auf beides zu verzweigen
wären zwei Kodierungen einer Tatsache.

**Keine Größenschwelle, keine Sonderbehandlung für Binärdateien**, wie beauftragt. Der
gemessene schlechteste Fall sind 53 Dateien mit 745 KB, und er tritt im Plugin-Repo auf,
wo die Messung stillsteht. Eine Schwelle wäre ein Sonderfall gewesen, und ihr Rückfall
oberhalb der Schwelle hätte nur wieder HEAD sein können — genau der Zweig, den diese
Änderung entfernt. Gelesen und geschrieben wird byteweise; base64 nur auf dem Weg durch
JSON. Damit ist `bin/monitor` kein Fall für sich, und ein Testfall hält das fest (die
Bytefolge enthält `0xc3 0x28`, kein gültiges utf-8 — ein Text-Umweg würde sie zerstören).

**Kollisionsfreiheit von `ABSENT`.** Das Argument des Vorgängers hing an der
Hex-Zeichenmenge des Digests und musste nachgezogen werden: base64 schöpft aus
`[A-Za-z0-9+/=]`, ein Wert mit `:` kann also mit keinem echten Inhalt kollidieren — auch
nicht mit dem der leeren Datei, deren Fingerabdruck der leere String ist.

**Der Befund ist geschlossen** (`Resolved:`-Zeile angehängt, Marker `_o_` → `_c_`). Sein
Testfall zur gestagten Arbeit ist in der Suite: ein Mensch schreibt und staged
`rules/x.md`, der Agent überschreibt im selben Aufruf, und die Messung stellt die
**gestagte** Fassung wieder her — nicht die committete. Der Fall prüft zusätzlich, dass der
Index unberührt bleibt, der Mensch also nichts verliert.

## Teil 2 — Schritt 3, die Regel-Ausnahme auf der Messseite

| Datei | Art |
|---|---|
| `hooks/lib/rules-write-exemption.ts` | neue exportierte Funktion `isObservedRulePath`; Kopf um die zwei Einstiege ergänzt |
| `hooks/tracker.ts` | `splitOffExempted`; `guard_advisory` mit `rulesWriteDetail`; der Zwischenzustands-Vermerk entfernt |
| `hooks/lib/__tests__/rules-write-exemption.test.ts` | neun Fälle |
| `hooks/lib/__tests__/protected-snapshot-integration.test.ts` | vier Fälle über den Harness |

`isObservedRulePath(path, projectProtected)` stellt Tor 1 (Regelpfad-Muster) und Tor 1b
(vom Projekt selbst deklarierter Pfad zieht die Ausnahme zurück) und sonst keins. Der
Docstring sagt für jedes weggelassene Tor, warum es hier **keinen Gegenstand** hat — nicht,
dass diese Seite großzügiger wäre:

- **Tor 0** vergleicht eine Schreibweise mit dem kollabierten Pfad, den sie erzeugt hat.
  Hier gibt es nur einen Pfad und niemand hat ihn geschrieben: `enumerateProtected` baut
  jeden aus `readdirSync`-Einträgen und dem eigenen Präfix des Laufs, die Literale kommen
  aus der Konfiguration. Keins von beidem kann ein `..`-Segment liefern, und es gibt keine
  zweite Schreibweise zum Vergleichen.
- **Tor 2, Symlinks.** Die Schreibwerkzeug-Tore fragen, wo ein Schreibvorgang landen
  *würde*. Hier hat er stattgefunden und seine Wirkung ist das Gemessene — und die
  Aufzählung steigt in keinen Symlink hinab und meldet keinen als geschützten Pfad. Ein in
  `rules/` gelegter Link auf `hooks/config.json` erzeugt also gar keine auszunehmende
  Regelpfad-Beobachtung; er erzeugt eine Beobachtung von `hooks/config.json` unter dessen
  eigenem Namen, die diese Funktion nicht ausnimmt.
- **Tor 2, Hardlinks.** Dasselbe, und das stärkere Argument. Ein Hardlink gibt einem
  geschützten Inode einen zweiten Namen in `rules/`; ein Schreibvorgang über einen der
  beiden ändert die Datei unter **beiden**. Die Messung beobachtet jeden geschützten Pfad
  unter dem Namen, den sein eigenes Muster ihm gibt, also wird die Änderung als
  `hooks/config.json` gesehen und zurückgeschrieben, ganz gleich als was sie in `rules/`
  außerdem gesehen wird.

`isProjectRulePath` mit demselben Pfad in beiden Argumenten wurde nicht aufgerufen. Das ist
die Aufrufform, die `guard.ts` als die benennt, die durchkompiliert und Tor 0 stillschweigend
wieder öffnet; eine zweite Aufrufstelle in dieser Form ist der Weg, auf dem die Form normal
wird. Hier käme dazu, dass zwei Dateisystem-Tore auf eine Frage angewandt würden, in der
kein Dateisystem vorkommt.

Ein Fall pinnt die tragende Eigenschaft über beide Oberflächen: **was die Messseite
ausnimmt, nimmt die Schreibwerkzeug-Seite auch aus.** Die Umkehrung darf scheitern (Tor 2
kann dort aus einem Grund verweigern, den es hier nicht gibt) und wird nicht zugesichert.

**Der Zwischenzustand ist beendet, geprüft statt angenommen.** Der Vorgänger hatte im
Quelltext vermerkt, dass die Messung bis zu diesem Schritt Schreibvorgänge zurückrollt, die
das Flag legitim erlaubt. Der Vermerk ist entfernt, und ein eigener Fall fährt die Route,
auf der der Widerspruch am sichtbarsten war: eine `Edit` auf `rules/x.md` unter gesetztem
Flag wird von `guard.ts` erlaubt **und** von `tracker.ts` stehengelassen, innerhalb eines
Werkzeugaufrufs.

Keine Eskalations-Zeile auf der Messseite, nur das `guard_advisory`-Ereignis: bei einem
Schreibwerkzeug-Aufruf hat `guard.ts` dieselbe Erlaubnis auf der PreToolUse-Seite desselben
Aufrufs bereits verbucht, ein zweiter Eintrag zählte eine Erlaubnis doppelt.

## Suite

| | Dateien rot | Fehlschläge | Tests gesamt |
|---|---|---|---|
| vorher | 10 | 38 | 1691 |
| nachher | 10 | 38 | 1707 |

**Die Zahl der Fehlschläge ist unverändert**, und es sind dieselben zehn Dateien mit
derselben Verteilung: `config.test.ts` 2, `bash-mutation-guard.test.ts` 1,
`derivable-enumerations-lint.test.ts` 1, `guard-bash-wiring.test.ts` 4,
`guard-halt-event.test.ts` 5, `guard-escalation-shape.test.ts` 1,
`reachability-corpus.test.ts` 1, `guard-case-folding.test.ts` 2,
`guard-bash-integration.test.ts` 10, `guard-rules-write-integration.test.ts` 11. Die drei
bekannten Ursachen (entfernter Schutzeintrag, entfallener Bash-Halt, neue Buchführung) sind
dieselben und werden von Schritt 5 und 6 abgeräumt. Keine bestehende Zusicherung ist
weggefallen.

Dazugekommen sind 16 Fälle:

- `protected-snapshot-integration.test.ts`: 14 → 21. Zwei Fälle umgeschrieben (der zu einer
  in diesem Aufruf angelegten Datei — sie wird jetzt gelöscht statt gemeldet; der zum
  Projekt ohne git — es wird jetzt zurückgeschrieben statt gemeldet), sieben neu: gestagte
  menschliche Vorarbeit, Binärdatei byteweise, vier zur Regel-Ausnahme, einer zur
  Übereinstimmung von Guard und Tracker im selben Aufruf.
- `rules-write-exemption.test.ts`: 145 → 154, alle zu `isObservedRulePath`.

Alle neuen Zusicherungen zur Messung laufen über `guard-harness.ts` in einem echten
Fremdprojekt, weil eine im Plugin-Repo geschriebene wegen der Stilllegung leer bestünde.
`npx tsc --noEmit` in `hooks/` ist grün.

## Was in diesem Schritt bewusst nicht angefasst wurde

- **Nichts am Klassifizierer.** Das ist Schritt 4.
- **Die Textschicht.** `README-hooks.md` und `rules/protected-path-*.md` beschreiben
  weiterhin `git checkout HEAD --` als das Rückrollen des Guards; das gehört zu Schritt 6.
  Die Stellen in diesen Dateien, die `git checkout HEAD -- <paths>` als *sanktionierte
  Schreibweise für den Agenten* nennen, sind davon nicht betroffen — das ist eine andere
  Aussage und bleibt richtig.
- **`dist/`.** Nicht neu gebaut; das Kompilat prüft Schritt 10 mit `FUSION_GUARD_ENTRY=dist`.
