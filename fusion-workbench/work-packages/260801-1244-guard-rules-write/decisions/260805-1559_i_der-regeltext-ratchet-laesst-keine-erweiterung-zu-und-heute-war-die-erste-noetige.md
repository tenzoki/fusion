# Der Regeltext-Ratchet lässt keine Erweiterung zu — und heute stand die erste nötige an

---
**Domain:** code
**Status:** answered
**Filed by:** coder
**Cross-references:** `hooks/lib/__tests__/rules-emission-golden.test.ts` (`ROLE_CAPS`, `RELEASE_CAP`, die vier Cap-Tests). Die beiden Fixes, die daran gescheitert sind: `260805-1548_*_beim-filen-prueft-niemand-ob-der-store-denselben-defekt-schon-traegt.md` und `…_c_playmaker-liest-den-eingefrorenen-archiv-store-und-mischt-ihn-in-die-lebende-bestandsaufnahme.md`.

---

## Question

`ROLE_CAPS` ist als Ratchet gebaut: der Kommentar am Feld sagt "It may only ever be
LOWERED", und `pins every role cap to that role's high-water mark` verlangt, dass jede
Cap dem gemessenen Höchststand *gleich* ist. Beides zusammen ergibt null Spielraum: jedes
zusätzliche Byte in einer immer geladenen Regeldatei bricht die Suite, und der einzige
zugelassene Ausgang ist ein Schnitt gleicher Grösse an anderer Stelle. Die Assertion sagt
das ausdrücklich: "Cut the rule text, or record the reason — raising RELEASE_CAP is not
the third option."

Das ist heute (05.08.) entstanden, nach einer grossen Partitionierung, und es ist eine
gute Regel: Regeltext ist eine geteilte Last, die jedes konsumierende Projekt bei jedem
Dispatch bezahlt. Der Ratchet nimmt einzelnen Agenten die Entscheidung ab, ob "noch ein
nützlicher Absatz" das wert ist.

Heute stand zum ersten Mal eine Erweiterung an, die aus einem Befund kam und nicht aus
Bequemlichkeit. Zwei davon:

1. Ein Absatz in `## Issue and Decision Filing — MANDATORY`, der vor dem Filen einen
   Blick auf die vorhandenen offenen Records verlangt. Ohne ihn wurde derselbe Defekt in
   einem konsumierenden Projekt zweimal gefiled, 21 Stunden auseinander. Kürzeste
   tragfähige Fassung: rund 430 Bytes.
2. Ein Satz im Layout-Block, der `archive/`, `stashes/` und `.migration-v2-backup/` als
   eingefrorene Stores benennt, die kein Scan über den lebenden Stand liest. Ohne ihn
   haben zwei Konsumenten die Lücke unterschiedlich und beide falsch gefüllt. Kürzeste
   tragfähige Fassung: rund 60 Bytes, als Ergänzung vorhandener Kommentarzeilen.

Beide wurden geschrieben, gemessen (3936 Bytes in der ersten, ausführlichen Fassung, an
allen sechzehn Agenten) und wieder zurückgenommen. Der zweite Fix wurde stattdessen in
`agents/playmaker.md` gebunden, wo er nichts kostet, weil Agent-Prompts nicht gemessen
werden. Für den ersten gibt es keinen solchen Ort: die Filing-Pflicht gilt für jeden
Agenten, der filet.

Die Frage ist damit nicht, ob der Ratchet richtig war — er war es —, sondern was
passieren soll, wenn ein Befund Regeltext verlangt und kein ehrlicher Schnitt gleicher
Grösse danebenliegt. Heute war die Antwort "gar nichts, und der Defekt bleibt offen".
Das trägt nicht als Dauerzustand.

## Options

1. **So lassen: jede Erweiterung braucht einen Schnitt gleicher Grösse.**
   - Pro: hält die Last konstant, ohne Ausnahme und ohne Verhandlung. Zwingt dazu, vor
     dem Schreiben zu fragen, ob der Absatz vorhandenen Text ersetzen kann.
   - Contra: der Schnitt trifft dann fremde, begründete Prosa, weil eigener Text ja
     gerade als nötig befunden wurde. Wer unter Druck 400 Bytes sucht, schneidet die
     Begründung eines anderen — und der Ratchet-Kommentar warnt selbst davor, dass ein
     Schnitt eine Regel unverankert zurücklassen kann. Der Zwang erzeugt genau den
     Schaden, gegen den er sonst schützt.
2. **Ein Budget für Befund-getriebene Erweiterung**, etwa: eine Cap darf steigen, wenn
   der Anstieg in `ROLE_CAPS` mit dem Befund benannt wird, der ihn verlangt — dieselbe
   Form, die `overRelease` für die Überschreitung des Basiswerts schon hat.
   - Pro: nutzt einen Mechanismus, den die Datei bereits besitzt, statt einen neuen zu
     bauen. Der Anstieg bleibt eine festgehaltene Entscheidung statt eines Unfalls, was
     der erklärte Zweck der Caps ist.
   - Contra: weicht die Aussage "may only ever be LOWERED" auf. Ob "ein Befund verlangt
     es" in der Praxis eine Hürde bleibt oder zur Formel wird, entscheidet sich an der
     Disziplin der Anwender, nicht am Test.
3. **Regeltext einfrieren und den Bedarf woanders binden** — Befunde landen in
   Agent-Prompts und Skill-Bodies, die nicht gemessen werden.
   - Pro: kostet nichts und hat heute für den Playmaker-Fix funktioniert.
   - Contra: für eine Regel, die *alle* Agenten betrifft, heisst das sechzehn Kopien
     statt einer Aussage — die Duplikation, gegen die `HYG-SOT` und die
     Single-Authoring-Home-Regel dieser Datei stehen. Und die Prompts sind ungemessen
     nur deshalb, weil niemand sie gemessen hat; die Last verschwindet nicht, sie wird
     unsichtbar.

## Constraints

- `RELEASE_CAP` bleibt, wo es ist. Es anzuheben würde jede vorhandene
  `overRelease`-Begründung in einer Bearbeitung entwerten; das steht so in der Assertion
  und ist richtig.
- Jede Antwort muss ohne Vertrauensvorschuss auskommen. Der Ratchet wirkt, weil ein Test
  ihn durchsetzt, nicht weil jemand ihn beachtet.
- Der Kommentarblock über `ROLE_CAPS` führt jeden Schritt mit Grund und Zahl. Was immer
  entschieden wird, muss dort in derselben Form landen.

## Recommendation

Keine. Ich habe die Frage aufgeworfen, indem ich gegen die Wand gelaufen bin, und die
Antwort ist eine Budget-Entscheidung über eine Last, die jedes konsumierende Projekt
trägt — die gehört dem Nutzer.

Was ich beitragen kann, ist die Messung: die ausführliche Fassung beider Absätze wog 3936
Bytes an jedem der sechzehn Agenten. Auf das Nötige gekürzt wären es rund 490 gewesen,
davon 430 für die Filing-Regel allein. Die Grössenordnung, um die es geht, ist damit
klein — aber sie ist nicht null, und null ist, was heute erlaubt war.

## Answer

**Keine der drei Optionen — der Block kommt weg, die Messung bleibt.** Wachstum ganz zu
unterdrücken trägt nicht; stattdessen wird von Zeit zu Zeit bereinigt, und der Test sagt,
wann das fällig ist. Messung und Sperre waren im Ratchet zusammengebaut, und das war der
Fehler: ohne Messung driftet der Bestand in vier Tagen wieder auf 145 kB, ohne dass es
jemandem auffällt.

Umgesetzt am 05.08. um 17:53 in `hooks/lib/__tests__/rules-emission-golden.test.ts`:

- `ROLE_CAPS` (sechs Handdeckel, Ratchet) → `RULE_BASELINE` (elf Dateigrößen nach dem
  letzten Schnitt) plus `GROWTH_BUDGET = 12 000`. Der Rollenboden ist daraus abgeleitet,
  kein zweiter Speicher.
- Bei Überschreitung **druckt** der Lauf die gewachsenen Dateien mit Deltas und fällt nicht.
- Die Schwelle ist aus vier Tagen nachgespielter `git log`-Historie hergeleitet, nicht
  geraten.
- Hart bleiben: Emissionsmenge (Golden), Rollendeckung, Begründungspflicht, und **ein**
  Deckel bei `DRIFT_CEILING = 145 144` — dem Stand vom 04.08.
- `RELEASE_CAP = 105 354` bleibt unverändert und gattert nichts mehr; es ist die Grundlinie,
  an der sich die Begründungspflicht entzündet.

Suite grün: 1551 Tests in 27 Dateien. Die Änderung liegt **uncommittet** im Arbeitsbaum;
der Commit gehört dem Orchestrator, und mit ihm der Übergang `_a_` → `_i_`.

**Offener Folgeschritt:** die beiden Ergänzungen, an denen der Ratchet sich zeigte — vor
allem der Absatz zur Filing-Konvention (rund 430 Byte) — sind jetzt landbar, wurden hier
aber bewusst **nicht** mitgeliefert. Eine Konventionsänderung gehört nicht in einen
Testumbau; sie braucht einen eigenen Durchgang.

Belege: `260805-1753-coder-ratchet-wird-budget-mit-meldung.md`.

---
Answered: 2026-08-05 — Nutzerentscheid über den Orchestrator; umgesetzt im selben Turn.
---
Implemented: `3163281` — Schwelle 12 000 Byte Luft ueber dem Rollenboden, aus 128 nachgespielten Commits hergeleitet. Bei Ueberschreitung nennt der Lauf die gewachsenen Dateien mit Betrag und faellt nicht. Der Bezugspunkt ist der umgewidmete Handspeicher (`RULE_BASELINE`), kein zweiter. Hart bleiben die Emissionsmenge, die Rollenableitung, die Begruendungspflicht und ein Deckel bei 145 144.
