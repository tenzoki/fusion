Playmaker liest den eingefrorenen Archiv-Store und mischt ihn in die lebende Bestandsaufnahme

---

Beide Playmaker-Läufe vom 03.08. in einem konsumierenden Projekt zählen zwölf
geschlossene Circles unter `archive/260730-1400-safe-cleanup-tier-1/circles/` und nehmen
sie in die Bestandsaufnahme auf. Der zweite Lauf begründet es mit "listed in the portfolio
for reference". Der Abschnitt, in dem sie landen, heisst `## Archived (_s_ / _d_)` und
meint die beiden Marker in seiner Überschrift — superseded und deferred, an lebenden
Circle-Records. Keiner der zwölf trägt einen davon; alle sind `_c_` (closed coherent) und
liegen ausserhalb des lebenden Stores.

`archive/` stand in keiner Leseliste des Playmakers. Sein `You MAY read`-Block nennt
`$SCAN_CIRCLES`, und `bin/fusion-paths` löst diesen Schlüssel auf `circles` auf. Seine
Schritt-1-Enumeration (`find "$WORKBENCH/$SCAN_CIRCLES" -mindepth 2 -maxdepth 2`) kann den
Archiv-Store gar nicht erreichen — er wurde also ausserhalb der Enumeration gelesen.

---

**Wurzel, und sie ist dieselbe wie beim Setup-Lockout.** Das Layout in
`rules/fusion-workbench-conventions.md` führte `archive/` mit genau einem Kommentar:
"`/fusion:archive` target". Was ein eingefrorener Store für einen Leser bedeutet, stand
nirgends. Zwei Konsumenten haben die Lücke unterschiedlich gefüllt, und beide falsch:

- `/fusion:setup` (Befund `260805-1435_*_setup-sperrt-sich-selbst-aus-weil-die-klammer-sonde-eingefrorene-stores-mitliest.md`, behoben in `ec0561a`) las `archive/` und
  `.migration-v2-backup/` und schloss aus 1146 eingefrorenen Klammer-Marker-Dateien, die
  workbench stehe im alten Format. Es verweigerte dauerhaft.
- Playmaker las denselben Store und schrieb seinen Inhalt in ein lebendes Briefing.

Ein Fehlalarm in die eine Richtung, eine Verunreinigung in die andere, aus derselben
unausgesprochenen Konvention. `ec0561a` hat den ersten Fall lokal im Skill-Body behoben
und die Begründung dort als Prosa hinterlegt — richtig für den akuten Fall, aber es ist
eine Punktlösung an einer Stelle, an der die Aussage allgemein ist.

**Der Defekt ist damit die fehlende Aussage, nicht die Lesart des Playmakers allein.**
Deshalb ist das hier ein Befund und keine offene Frage: es ist nicht zu entscheiden, ob
eingefrorene Circles ins Portfolio gehören — das war schon entschieden, als jemand sie
mit `/fusion:archive` aus dem Arbeitsstand nahm. Ungeschrieben war nur, was dieser Akt
für spätere Leser bedeutet.

**Nicht mitbeantwortet.** Ob irgendein Konsument je einen aufgelösten *Lesepfad* in
`archive/` bekommen soll — etwa ein Reconciler, der superseded decisions sehen muss —
ist eine andere Frage und bleibt offen; sie steht in diesem Repository als
`260801-1020_*_scan-keys-never-reach-the-archive-store.md` und nennt genau
zwei Kandidaten, von denen dieser Fix nur den einen berührt: die Ausschluss-Regel für
Scans über den lebenden Stand. Ein künftiger `SCAN_ARCHIVE` bleibt möglich.

---

**Resolved:** 260805-1548 — am beobachteten Ort behoben, mit einem benannten Rest.

`agents/playmaker.md`: die drei eingefrorenen Stores stehen im `You may NOT`-Block, jeder
mit dem Skill benannt, der ihn füllt, mit dem beobachteten Fall als Begründung und mit
dem Hinweis, dass kein `SCAN_*`-Schlüssel dorthin auflöst — die Zeile bindet also genau
den Fall, in dem der Agent den Baum selbst abläuft. Der Portfolio-Abschnitt
`## Archived (_s_ / _d_)` sagt jetzt, dass er nach den zwei Markern in seiner Überschrift
benannt ist und mit dem `archive/`-Store nichts zu tun hat.

**Der Rest, und er ist bewusst so.** Die allgemeine Aussage gehört nach
`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` — dort ist die
Autorenheimat des Layouts, und die Aussage gilt für jeden künftigen Konsumenten, nicht
nur für den Playmaker. Sie wurde geschrieben und wieder zurückgenommen: der
Byte-Ratchet in `hooks/lib/__tests__/rules-emission-golden.test.ts` pinnt jede Role-Cap
auf den gemessenen Höchststand und lässt kein zusätzliches Byte in einer immer geladenen
Regeldatei zu. Selbst die kürzeste Fassung (rund 60 Bytes als Ergänzung der vorhandenen
Kommentarzeilen im Layout-Baum) hätte die Suite gebrochen. Aufgenommen als
`260805-1559_*_der-regeltext-ratchet-laesst-keine-erweiterung-zu-und-heute-war-die-erste-noetige.md`.

Damit steht die Regel an zwei Orten als Prosa (`skills/setup/SKILL.md` aus `ec0561a`,
`agents/playmaker.md` aus dieser Charge) und nirgends als Konvention. Der nächste
Konsument, der den Baum abläuft, hat weiterhin nichts zu lesen. Das ist der Preis, den
die Byte-Entscheidung fordert, und er gehört sichtbar hierher statt in eine Fussnote.

Nicht angefasst: `skills/setup/SKILL.md` behält seine Ausschlüsse und seine Prosa aus
`ec0561a` unverändert.

---

**Herkunft.** Aufgenommen aus den Session-Protokollen eines konsumierenden Projekts, die
über ein geteiltes Verzeichnis bereitgestellt und nur lesend genutzt wurden
(`260803-1412-playmaker-user-fusion-next.md`, `260803-1840-playmaker-direct-dispatch.md`).
Niemand hat den Punkt als Befund gemeldet; er stand als Beobachtung im Protokoll
`260805-1440-coder-zwei-nachgeschobene-befunde-aus-einem-konsumierenden-projekt.md`
(Punkt 2). Die beobachteten Läufe liegen im konsumierenden Projekt, nicht hier.
