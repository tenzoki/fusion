# Wie soll ein Circle verschwinden dürfen, den jemand absichtlich löscht?

---
**Domain:** code
**Status:** open
**Filed by:** coder
**Cross-references:** externe Fundstelle, ausserhalb dieses Repositories: `.../shared/fusion-plugin-findings/260802-2220-shaper-throwaway-plane-bridge-smoke-test.md` (Abschnitt "What was written", letzter Absatz) sowie die beiden Playmaker-Protokolle `260803-1412-playmaker-user-fusion-next.md` und `260803-1840-playmaker-direct-dispatch.md` im selben Verzeichnis. Marker-Vokabular: `rules/circle-records.md` `## State Markers — circles`. Verwandter Mechanismus: `skills/archive/SKILL.md`.

---

## Question

Ein Shaper legte in einem konsumierenden Projekt einen Wegwerf-Circle an
(`260802-2220-throwaway-plane-bridge-smoke-test`), dessen vorgesehener Endzustand die
eigene Löschung war: Plane-Issues löschen, Map-Einträge vergessen, Circle-Verzeichnis
entfernen — als nummerierte Abnahmebedingung 9 im Record festgehalten. Der Record trug
zusätzlich zwei Anweisungen an spätere Läufe: ein Playmaker solle ihn nicht zur
Aktivierung ranken, und ein Reconciler solle sein Fehlen nicht als verwaisten Zustand
lesen.

Beide Anweisungen leben in der Datei, die planmässig gelöscht wird. Zwischen den zwei
Playmaker-Läufen vom 03.08. (14:12 und 18:40) ist der Circle verschwunden: der erste
zählt einen anticipated Circle, der zweite null, und dazwischen liegt kein terminaler
Marker. Der zweite Lauf schreibt schlicht "No anticipated Circle exists" — er hat nichts
zu bemerken, weil es nichts mehr zu lesen gibt.

Das ist die eigentliche Frage. Das Marker-Vokabular für Circles (`_a_ _t_ _c_ _b_ _s_ _d_`)
hat keinen Zustand für "absichtlich entfernt". Ein gelöschtes Verzeichnis und ein durch
Unfall verlorenes Verzeichnis sind für jeden späteren Agenten dieselbe Beobachtung:
nichts. Verweise aus `portfolio.md`, aus Session-Historien, aus den `## Dependencies`
anderer Circles zeigen danach ins Leere, ohne dass irgendwo steht, ob das in Ordnung ist.

Die Frage muss jetzt beantwortet werden, weil `docs/plane-setup.md` den Wegwerf-Circle
ausdrücklich als Vorgehen empfiehlt ("Push on a throwaway Circle first") und der Shaper
genau dieser Empfehlung gefolgt ist. Das Muster ist also keine Ausnahme, sondern
dokumentierter Weg — nur sein Ende ist ungeregelt.

## Options

1. **Ein terminaler Marker für "absichtlich entfernt"** — ein neuer Buchstabe im
   Circle-Vokabular, den der Record trägt, bevor er gelöscht wird.
   - Pro: bleibt im vorhandenen Vokabular, keine neue Mechanik.
   - Contra: inkohärent. Der Marker sitzt am Record, und der Record wird mitgelöscht.
     Ein Marker an einer Datei, die es danach nicht mehr gibt, hält nichts fest. Diese
     Option löst das Problem nur, wenn zusätzlich irgendein Rest zurückbleibt — womit
     sie zu Option 2 wird.
2. **Löschen verbieten, Archivieren verlangen** — ein Wegwerf-Circle erreicht einen
   vorhandenen terminalen Marker (`_d_` verworfen oder `_c_` geschlossen) und geht dann
   durch `/fusion:archive` aus dem lebenden Store.
   - Pro: nutzt den Mechanismus, den fusion für "aus dem Arbeitsstand nehmen, ohne den
     Record zu verlieren" bereits hat. Kein neues Vokabular. Die Anweisungen im Record
     überleben mit dem Record. Verweise aus `portfolio.md` und aus fremden
     `## Dependencies` behalten ein Ziel. Deckt sich mit dem Grundsatz, dass ein
     terminaler Circle sein Verzeichnis behält ("closure is not a move",
     `rules/circle-records.md`).
   - Contra: der Wegwerf-Circle hinterlässt Rückstand, und genau den wollte der Nutzer
     nicht — die Selbstlöschung war seine ausdrückliche Antwort auf die Rückfrage des
     Shapers ("Wer räumt auf?"). Ein Archiv-Eintrag ist weniger Rückstand als ein
     lebender Circle, aber mehr als nichts.
3. **Ausdrücklich als nicht unterscheidbar dokumentieren** — festhalten, dass fusion
   Löschung und Verlust nicht trennt, und dass ein gelöschter Circle für alle späteren
   Läufe stumm verschwindet.
   - Pro: null Aufwand, null neue Mechanik, und ehrlich.
   - Contra: verlagert die Kosten auf jeden späteren Leser. Der Shaper hat bereits
     versucht, die Lücke mit einer Anweisung im Record zu schliessen — dass er es
     versuchte, ist das Signal, dass "es ist eben so" als Antwort nicht trägt.

## Constraints

- Der Marker sitzt am Record, nicht am Verzeichnis (`rules/circle-records.md`, bindende
  Entscheidung `260716-1910_i_circle-marker-am-verzeichnis-oder-an-der-circle-datei.md`).
  Jede Antwort, die einen Marker als Träger benutzt, muss sagen, wo dieser Marker nach
  dem Verschwinden noch zu lesen ist.
- `_c_`, `_b_`, `_s_`, `_d_` sind terminal; ein Rückweg nach `_a_`/`_t_` ist untersagt.
- Der Wegwerf-Circle ist dokumentiertes Vorgehen (`docs/plane-setup.md`, Abschnitt
  "Push on a throwaway Circle first"), nicht eine Ausnahme, die man wegdefinieren kann.
- Was immer entschieden wird, muss ohne Zutun des Nutzers greifen. Eine Regel, die
  verlangt, dass jemand vor dem Löschen an etwas denkt, ist genau die Regel, die der
  Shaper schon in den Record geschrieben hat und die mit ihm verschwand.

## Recommendation

Option 2, mit einer Einschränkung, die ich nicht ausräumen kann.

Sie ist die einzige der drei, die einen vorhandenen Mechanismus wiederverwendet statt
einen neuen zu bauen: `/fusion:archive` ist bereits fusions Antwort auf "aus dem
Arbeitsstand nehmen, ohne den Record zu verlieren", und ein Wegwerf-Circle will genau
das. Sie ist auch die einzige, unter der die Anweisung des Shapers überlebt hätte,
statt mit ihrem Träger unterzugehen.

Die Einschränkung: der Nutzer hat auf die Rückfrage des Shapers ausdrücklich
Selbstlöschung geantwortet, nicht Archivierung. Option 2 überstimmt diese Antwort. Ob
der Unterschied zwischen "weg" und "im Archiv" den Preis wert ist, ist die eigentliche
Wahl, und sie gehört dem Nutzer — deshalb steht sie hier als Frage und nicht als
Änderung.

Was ich beim Prüfen ausschliessen konnte: Option 1 trägt in der vorliegenden Form nicht.
Der Marker sitzt am Record, der Record wird gelöscht; ein Marker, den niemand mehr lesen
kann, hält nichts fest. Wer Option 1 will, braucht zusätzlich einen Rest, der bleibt —
und hat damit Option 2 in anderer Verpackung.

---

**Herkunft.** Aufgenommen aus den Session-Protokollen eines konsumierenden Projekts, die
über ein geteiltes Verzeichnis bereitgestellt und nur lesend genutzt wurden. Niemand hat
den Punkt als Befund gemeldet; er stand als Beobachtung im Protokoll
`circles/260801-1244-guard-rules-write/history/260805-1440-coder-zwei-nachgeschobene-befunde-aus-einem-konsumierenden-projekt.md`
(Abschnitt "Beobachtungen aus den Protokollen, ohne eigenen Record", Punkt 1) und wurde
mit diesem Record erstmals als offene Frage geführt. Der beobachtete Circle liegt im
konsumierenden Projekt, nicht hier.

---
Answered: <set when status moves to _a_>
Implemented: <set when status moves to _i_>
Deferred: <set when status moves to _d_>
Superseded by: <set when status moves to _s_>
