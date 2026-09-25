# Wie soll ein Circle verschwinden dürfen, den jemand absichtlich löscht?

---
**Domain:** code
**Status:** open
**Filed by:** coder
**Cross-references:** externe Fundstelle, ausserhalb dieses Repositories: `.../shared/fusion-plugin-findings/260802-2220-shaper-throwaway-plane-bridge-smoke-test.md` (Abschnitt "What was written", letzter Absatz) sowie die beiden Playmaker-Protokolle `260803-1412-playmaker-user-fusion-next.md` und `260803-1840-playmaker-direct-dispatch.md` im selben Verzeichnis. Marker-Vokabular: `rules/circle-records.md` `## State Markers — circles`. Verwandter Mechanismus: `skills/archive/SKILL.md`.

---

## Question

Ein Shaper legte in einem konsumierenden Projekt einen Wegwerf-Circle an.
Deliberately deleted 260805: Circle `260802-2220`, `throwaway-plane-bridge-smoke-test`.
Sein vorgesehener Endzustand war die eigene Löschung: Plane-Issues löschen, Map-Einträge
vergessen, Circle-Verzeichnis entfernen — als nummerierte Abnahmebedingung 9 im Record
festgehalten. Der Record trug
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
  Entscheidung `260716-1910_*_circle-marker-am-verzeichnis-oder-an-der-circle-datei.md`).
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
`260805-1440-coder-zwei-nachgeschobene-befunde-aus-einem-konsumierenden-projekt.md`
(Abschnitt "Beobachtungen aus den Protokollen, ohne eigenen Record", Punkt 1) und wurde
mit diesem Record erstmals als offene Frage geführt. Der beobachtete Circle liegt im
konsumierenden Projekt, nicht hier.

## Antwort

**Ein absichtlich gelöschter Circle verschwindet vollständig aus der workbench. Es gibt keinen
Marker dafür.**

Vom Nutzer entschieden am 2026-08-05, auf die Rückfrage, ob gelöscht oder archiviert gemeint
sei. Die beiden sind verschiedene Vorgänge und bleiben es:

- **Archiviert** heißt, der Circle zieht nach `archive/` um. Er behält seinen terminalen
  Marker, bleibt zitierbar, und `/fusion:archive` ist der Weg dorthin. Eingefrorener Inhalt,
  der von keiner lebenden Enumeration mehr gelesen wird — das war der Defekt in
  `260805-1548` (Playmaker) und in `ec0561a` (Setup).
- **Gelöscht** heißt weg. Kein Verzeichnis, kein Record, kein Marker. Ein Zustand „absichtlich
  entfernt" im Marker-Vokabular wäre ohnehin nicht darstellbar, weil der Marker am Record
  sitzt und der Record mitgelöscht wird. Dieser Weg blieb dem Circle-Autor schon vorher offen
  und ist jetzt als gewollt bestätigt.

**Die Verpflichtung liegt bei den Referenzen, nicht beim Gelöschten.** Wer einen Circle löscht,
versieht vorhandene Verweise auf ihn mit einem Zusatz — falls es welche gibt. Der Zusatz sagt,
dass das Ziel absichtlich entfernt wurde, und wann. Damit unterscheidet ein späterer Leser
Löschung von Verlust an der Stelle, an der die Frage tatsächlich auftaucht: beim toten Verweis.
Am verschwundenen Objekt selbst ist sie nicht zu beantworten.

Der auslösende Fall zeigt die Grenze der Alternative. Der Shaper hatte die Anweisung, sein
Fehlen nicht als Orphan zu lesen, in den Record geschrieben, der gelöscht wird. Eine Anweisung
im Objekt kann dessen Verschwinden nicht überleben; nur der Verweis kann es.

Offen und nicht Teil dieser Antwort: ob ein Skill diesen Vorgang unterstützen sollte, statt ihn
von Hand zu verlangen. Ein `/fusion:circle-delete`, das die Verweise sucht und den Zusatz
anbringt, wäre die naheliegende Form. Ohne ein solches Werkzeug hängt die Verpflichtung an der
Sorgfalt dessen, der löscht.

---
Answered: dieser Record, `## Antwort` — Nutzerentscheidung; gelöscht heißt weg, und die Zusatzpflicht liegt bei den Verweisen.

---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_a_`. The answer is recorded and nothing on disk realises it.**

`_a_` → `_i_` requires code or data that reflects the decision. Measured at HEAD `e435f03`:

- `grep -rn 'gelöscht\|deleted\|deliberately removed' rules/circle-records.md` returns nothing. The rule file that owns the Circle vocabulary and its transitions says nothing about deletion, and nothing about the reference obligation this answer places.
- `ls skills/` returns twelve directories and none is a circle-delete. The answer's own closing paragraph left that open — *"ob ein Skill diesen Vorgang unterstützen sollte"* — so its absence is expected rather than a gap.
- No agent prompt carries the obligation either: the party the answer binds is *whoever deletes*, and no shipped surface tells them.

**The answer's operative half is therefore unwritten.** The decision has two parts. Part one — *gelöscht heißt weg, es gibt keinen Marker dafür* — needs nothing built; it is a statement that the vocabulary deliberately has no case, and the vocabulary already has no case. Part two — *die Verpflichtung liegt bei den Referenzen*, whoever deletes annotates the surviving citations with the fact and the date — is an obligation on a human that appears in no rule file, no prompt and no skill. An obligation recorded only in the decision record that answers it is reachable by nobody who is about to delete a Circle.

**One constraint of the question has since expired.** It rested partly on `docs/plane-setup.md` recommending the throwaway Circle as documented practice ("Push on a throwaway Circle first"). That file went with the Plane mirror on 2026-08-15 and `ls docs/` no longer holds it, so the pattern is no longer documented anywhere. **This does not moot the answer** — the answer is about deletion in general, and a user may delete a Circle for any reason — but it removes the urgency the question was filed with, and a reader should not go looking for that document.

**This pass measured the cost the answer accepts, and it is real.** Six citations from live Circle records were broken by the `260817-1907` archive sweep, which is the neighbouring operation to deletion and preserves the target; deletion preserves nothing. Nothing detected those six. See `260819-1400-reconciliation-circles.md` `## Dangling citations`.

---
Implemented: `rules/circle-records.md:67` `### Deletion is outside the vocabulary, and the annotation sits on the references` — the operative half of this answer is written down. It states that a deliberately deleted Circle leaves no directory, record or marker; that the vocabulary's lack of a seventh letter is deliberate, because a marker on a deleted file holds nothing; and that the obligation therefore sits on the surviving references, since an instruction inside the object cannot survive the object.

The annotation is a stated literal, `Deliberately deleted YYMMDD: Circle \`<stamp>\`, \`<directive-slug>\`.`, and it **replaces** the dead citation rather than standing beside it: a surviving path resolves to nothing whatever sentence accompanies it, and neither a reader nor the citation gate can tell such a path from an accident. Stamp and slug sit in separate spans so no store path is left behind, and the spelling is chosen against the parser so the form itself contributes to no count.

The reachability residual this record's closing paragraph raised is stated in the new section rather than closed: `rules/circle-records.md` is emitted to `orchestrator`, `playmaker` and `shaper` only, so a human deleting a Circle by hand reads none of it, and a `/fusion:circle-delete` skill remains an open question.

---
**Reconciliation 260820-0830-reconciliation.md** (reconciler, domain `code`, HEAD `04db0b0`) — **marker stays `_i_`;
the implementation is on disk and the record's own citations are not.** The `Implemented:` block
above resolves: `rules/circle-records.md:67` carries the section, `:97` the literal form and `:103`
the worked example, and the example annotates the very Circle this record was filed about. Verified
line by line.

What this pass found beside it: three `stamp-name` citations in this record are dangling at HEAD —
two on line 7 and one on line 14. One of them is the deleted Circle itself, which the new annotation
form was written for and was not applied to; the other two name files in another repository, which
the record says on the same line and which the scanner cannot see. They went unrepaired because the
`_a_` → `_i_` transition in `ad7ffed` took this record out of the citation gate's corpus in the same
commit that armed the work. Filed as
`260820-0906_*_the-deletion-annotation-form-was-not-applied-to-the-surviving-reference-of-the-circle-it-uses-as-its-worked-example.md`.
