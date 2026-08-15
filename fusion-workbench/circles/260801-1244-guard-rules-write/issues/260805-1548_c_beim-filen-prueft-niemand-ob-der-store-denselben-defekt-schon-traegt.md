Beim Filen prüft niemand, ob der Store denselben Defekt schon trägt

---

Derselbe Defekt wurde in einem konsumierenden Projekt zweimal gefiled, 21 Stunden
auseinander: `260801-0113_o_setup-pre-v4-detector-scans-archive-and-migration-backup.md`
und `260801-2257_c_fusion-setup-pre-v4-check-false-positive-on-archive.md`. Die
Zusammenlegung machte später ein Reconciler von Hand. Der meldende Store hielt zum
Zeitpunkt der zweiten Meldung 64 offene Issues — das ist keine Ausnahmesituation, sondern
der Normalzustand eines Projekts, das die Filing-Pflicht ernst nimmt.

Die Konvention verlangte bis jetzt nur die eine Richtung. `## Issue and Decision Filing —
MANDATORY` beginnt mit "Every defect ... MUST be written as a separate defect file. No
exceptions." und regelt danach ausschliesslich *wohin* die Datei geht (Origin Rule),
*wie* sie heisst und *was* drinsteht. Kein Satz verlangte einen Blick auf das, was schon
da liegt. Ein Agent, der die Regel wörtlich befolgte, filete korrekt und erzeugte das
Duplikat.

---

**Warum es ein Defekt in der Konvention ist und nicht bloss Nutzerdisziplin.** Die beiden
Slugs oben teilen drei Wörter (`setup`, `pre-v4`, `archive`) und beschreiben denselben
Fehlschlag. Ein Agent, der vor dem Schreiben die Namen der offenen Records gelesen hätte,
hätte den Treffer gesehen. Er hat sie nicht gelesen, weil ihn nichts dazu aufforderte.

**Warum die naheliegende Formulierung nicht taugt.** "Prüf vorher, ob es das schon gibt"
ist als Anweisung wertlos und potenziell schädlich: sie ist unbegrenzt (64 Dateien lesen?
alle?), sie ist nicht zuverlässig zu erfüllen, und sie kippt in die falsche Richtung — ein
Agent, der die Regel ernst nimmt und unsicher ist, schreibt am Ende gar nichts. Ein
verschluckter Defekt kostet mehr als ein Duplikat. Eine Dedup-Regel ohne ausdrückliche
Gegenrichtung baut genau diesen Fehler ein.

---

**Status:** offen. Der Fix ist entworfen und gemessen, aber nicht angewandt — die
Begründung steht unten unter "Warum er nicht drinsteht".

Der Absatz gehört nach `rules/fusion-workbench-conventions.md`
`## Issue and Decision Filing — MANDATORY`, vor den NEVER-Block, mit drei Eigenschaften,
die die Regel bezahlbar und ungefährlich halten:

- **Budget.** Ein `ls` über die offenen Records im Zielstore (plus `shared/`, wenn ein
  Circle aktiv ist), Namen lesen, Dateien nicht. Konstante Kosten, unabhängig von der
  Store-Grösse.
- **Ausgang bei Treffer.** Eine Zeile an den vorhandenen Record anhängen
  (`Also seen: YYMMDD-HHMM by <agent> — <ein Nebensatz>`), kein zweiter Record. Marker,
  Zustand und Zuständigkeit des getroffenen Records bleiben unangetastet.
- **Gegenrichtung, ausdrücklich.** Bei Zweifel wird der neue Record geschrieben. Der
  Absatz sagt beides beim Namen: ein Duplikat kostet einen Reconciler einen Merge, ein
  nicht gefileter Defekt kostet den Defekt. Und: dieser Schritt darf nie damit enden,
  dass nichts geschrieben wurde.

Die Grenze gehört mit in den Text, statt weggelassen zu werden: der Abgleich über
Dateinamen fängt denselben Defekt in ähnlichen Worten und verfehlt denselben Defekt in
anderen Worten. Der Reconciler bleibt der Auffang für das, was durchrutscht — er war es
im beobachteten Fall auch, nur 21 Stunden später als nötig.

Dieser Record ist selbst nach der entworfenen Regel gefiled: die offenen Issues in
`circles/260801-1244-guard-rules-write/issues/` und `shared/issues/` wurden vor dem
Schreiben aufgelistet. Ein verwandter, aber anderer Befund kam dabei zum Vorschein
(`shared/issues/260801-1020_o_scan-keys-never-reach-the-archive-store.md`, zitiert vom
Playmaker-Record derselben Charge); kein Duplikat. Der Schritt kostete eine
Verzeichnisauflistung und fand etwas — das ist der Beleg, den die Regel braucht.

---

**Warum er nicht drinsteht.** Der Absatz wurde geschrieben, gemessen und wieder
zurückgenommen. `hooks/lib/__tests__/rules-emission-golden.test.ts` pinnt jede Role-Cap
auf den gemessenen Höchststand des jeweiligen Rollenprofils und lässt kein zusätzliches
Byte in einer immer geladenen Regeldatei zu; das Feld trägt den Kommentar "It may only
ever be LOWERED". Die ausführliche Fassung dieses Absatzes und des Layout-Satzes aus dem
Schwester-Befund wogen zusammen 3936 Bytes an jedem der sechzehn Agenten, die kürzeste
tragfähige Fassung dieses Absatzes allein rund 430. Der Ratchet erlaubt beide nicht.

Der vom Test genannte Ausweg ist ein Schnitt gleicher Grösse an anderer Stelle derselben
Datei. Ich habe ihn gesucht und keinen gefunden, den ich ohne Auftrag machen würde: was
dort steht, ist begründeter Regeltext anderer Bearbeitungen, und der Ratchet-Kommentar
warnt selbst davor, dass ein Schnitt eine Regel unverankert zurücklässt. Fremde
Begründung zu kürzen, um eigene Prosa unterzubringen, ist ein schlechterer Tausch als
dieser Befund offen zu lassen.

Anders als beim Schwester-Befund gibt es hier auch keinen kostenfreien Ort: die
Filing-Pflicht gilt für jeden Agenten, der filet, und sie in sechzehn Prompts zu
kopieren wäre genau die Duplikation, gegen die die Single-Authoring-Home-Regel steht.

Die Frage, die daraus folgt — was passieren soll, wenn ein Befund Regeltext verlangt und
kein ehrlicher Schnitt danebenliegt — ist aufgenommen als
`decisions/260805-1559_o_der-regeltext-ratchet-laesst-keine-erweiterung-zu-und-heute-war-die-erste-noetige.md`.
Dieser Befund bleibt offen, bis sie beantwortet ist.

---

**Herkunft.** Aufgenommen aus den Session-Protokollen eines konsumierenden Projekts, die
über ein geteiltes Verzeichnis bereitgestellt und nur lesend genutzt wurden. Niemand hat
den Punkt als Befund gemeldet; er stand als Beobachtung im Protokoll
`circles/260801-1244-guard-rules-write/history/260805-1440-coder-zwei-nachgeschobene-befunde-aus-einem-konsumierenden-projekt.md`
(Punkt 3). Die beiden doppelt gefileten Records liegen im konsumierenden Projekt, nicht
hier.

---

**Resolved: 260816-0112 by coder.** Der Absatz steht in
`rules/fusion-workbench-conventions.md`, `## Issue and Decision Filing — MANDATORY`, vor
dem NEVER-Block, mit allen drei Eigenschaften: `ls` nur über Namen, `Also seen:`-Zeile bei
Treffer ohne zweiten Record und ohne Markerwechsel, und die ausdrückliche Gegenrichtung
("In doubt, write the new record", plus der Satz, dass dieser Schritt nie damit endet,
dass nichts geschrieben wurde). Kosten: +490 Bytes auf einer immer geladenen Regeldatei.

Der Blocker ist weg: der Ratchet aus
`decisions/260805-1559_o_der-regeltext-ratchet-laesst-keine-erweiterung-zu-und-heute-war-die-erste-noetige.md`
ist implementiert — die immer geladene Regelmenge wird weiter gemessen, blockt aber nicht
mehr, sondern meldet innerhalb eines Head-rooms. Ein Schnitt an fremdem Regeltext war
damit nicht nötig.

Zwei Sätze wurden für das Budget gestrichen und stehen nur hier: die Grenze des
Namensabgleichs (derselbe Defekt in ähnlichen Worten wird gefangen, in anderen Worten
verfehlt; der Reconciler bleibt der Auffang) und die ausführliche Fassung von
"Zustand und Zuständigkeit bleiben unangetastet".

Protokoll: `shared/history/260816-0112-coder-duplicate-check-before-filing.md`
