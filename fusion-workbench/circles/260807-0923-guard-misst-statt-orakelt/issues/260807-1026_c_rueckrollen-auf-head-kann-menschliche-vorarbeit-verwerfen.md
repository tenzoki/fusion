Das Rückrollen auf HEAD kann menschliche Vorarbeit an derselben Datei verwerfen

---

Die Messung kennt den Zustand einer geschützten Datei **vor dem Werkzeugaufruf**;
zurückgerollt wird aber auf **HEAD**. Beide sind fast immer dasselbe und in einem Fall
nicht: wenn ein Mensch an einer geschützten Datei bereits gearbeitet hatte — im
Arbeitsverzeichnis oder schon vorgemerkt (`git add`) — und der Agent im selben Aufruf
darüberschreibt. Dann stellt `git checkout HEAD -- <pfad>` den committeten Stand her und
verwirft die menschliche Fassung zusammen mit der des Agenten.

Das ist genau die Gattung Schaden, gegen die der Vorher-Fingerabdruck eingeführt wurde
(er verhindert bereits den häufigeren Fall: eine vorher veränderte Datei wird gar nicht
angefasst). Der Restfall bleibt, weil das Rückrollziel HEAD ist und nicht der
Fingerabdruck.

---

**Wo:** `hooks/tracker.ts`, `revertFromHead` — die Fundstelle trägt einen Verweis auf
diesen Befundsatz.

**Warum nicht sofort behoben:** Der Umsetzungsplan dieses Circles legt den Mechanismus
auf `git checkout HEAD -- <pfad>` fest (Schritt 2), einschließlich des benannten Zweigs
für Pfade, die git nicht kennt. Ein anderer Mechanismus ist keine Umsetzung dieses
Schritts, sondern eine Änderung an ihm.

**Denkbare Lösung, nicht entschieden:** Der Fingerabdruck speichert heute nur Hashes. Trüge
er den Inhalt (bei beschränkter Größe), wäre das Rückrollen exakt der Zustand vor dem
Aufruf, die Zuordnung wäre lückenlos, und der Zweig "git kennt diesen Pfad nicht" entfiele
ersatzlos — auch ein nicht versioniertes Konsumprojekt wäre dann abgedeckt. Kosten:
Speicherplatz je Werkzeugaufruf und eine Obergrenze, ab der doch auf HEAD zurückgefallen
werden muss.

**Dringlichkeit:** niedrig für die Freigabe, hoch genug, um vor der Freigabe entschieden
zu werden. Der Fall setzt voraus, dass Mensch und Agent im selben Zeitfenster dieselbe
geschützte Datei anfassen.

---
Resolved: Umgesetzt in der vorgeschlagenen Form, vom Nutzer am 260807 entschieden. Der
Fingerabdruck in `hooks/lib/protected-snapshot.ts` traegt jetzt den Dateiinhalt (base64,
byteweise gelesen und geschrieben); `ABSENT` bleibt ein eigener Wert und heisst beim
Zurueckschreiben "loeschen". `restore()` im selben Modul schreibt den Vorher-Zustand
zurueck, `hooks/tracker.ts` ruft es ueber `restorePath` auf; `revertFromHead` und der
`git checkout HEAD --`-Aufruf sind entfallen.

Die im Befund benannte Fallunterscheidung ist damit weg, nicht verkleinert: die fuenf
Zweige (in git und sauber / in git mit gestagter Arbeit / nicht versioniert / in diesem
Aufruf angelegt / gar kein Repository) sind ein Zweig geworden. Die Kosten, die der
Befund als moegliche Obergrenze nannte, sind nicht angefallen: es gibt keine
Groessenschwelle und keine Sonderbehandlung fuer Binaerdateien. Gemessene Grundlage —
der volle Satz geschuetzter Dateien umfasst im Plugin-Repo 53 Dateien mit 745 KB, und
das ist der schlechteste Fall; in einem Konsumprojekt bleiben das eigene `rules/` und
drei kleine JSON-Dateien. Eine Schwelle waere ein Sonderfall und ihr Rueckfall koennte
nur wieder HEAD sein.

Testfaelle in `hooks/lib/__tests__/protected-snapshot-integration.test.ts`, alle ueber
den Harness in einem echten Fremdprojekt: der im Befund beschriebene Fall der gestagten
menschlichen Vorarbeit ("restores the human's STAGED version, not the committed one"),
das byteweise Zurueckschreiben einer Binaerdatei, das Loeschen einer in diesem Aufruf
angelegten geschuetzten Datei, und das Zurueckschreiben in einem Projekt ganz ohne git.
