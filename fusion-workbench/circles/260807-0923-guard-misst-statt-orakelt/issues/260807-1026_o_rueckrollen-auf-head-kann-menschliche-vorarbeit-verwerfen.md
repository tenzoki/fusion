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
