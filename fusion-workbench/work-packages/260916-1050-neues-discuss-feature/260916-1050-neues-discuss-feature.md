# Neues discuss Feature

---
**Status:** done
**Claim:** 5e8248d7 — Kai Stalmann <ks@qantr.com>, 260917-1111
**Active spec/plan:** `260917-1119_*_spec-fusion-discuss-a-two-agent-discussion-loop.md` (spec), `260917-1124_*_implementation-fusion-discuss-a-two-agent-discussion-loop.md` (the plan drawn from it)
**Filed by:** user, Kai Stalmann <ks@qantr.com>
---

## Directive

1. Ablauf. Der Nutzer startet /fusion:discuss an einem Punkt im Chat, optional mit einem Satz dazu, was erörtert werden soll. Danach läuft eine Schleife zwischen dem gerade laufenden Agenten (Orchestrator oder Consultant) und einem zweiten, unabhängigen. Die Diskussion läuft im Chat, nicht in der Datei. Am Ende bekommt der Nutzer eine Zusammenfassung und entscheidet: mit eigenen Ergänzungen weiter, oder schließen.

2. Schalter. --begin <Bezug aus dem Chat> startet, --infer gibt die Schlüsse inline aus und lässt die Diskussion offen, --close schließt ab und finalisiert die Datei. --continue entfällt: innerhalb einer Sitzung zieht das Modell den Faden über operative Einschübe hinweg selbst.

3. Zweiter Agent: der Consultant. Die Zeile in seinem Prompt, die ihn auf Nutzeraufruf beschränkt, fällt. Grund ist seine Verpflichtung, Aussagen anderer Agenten als Beleg statt als Schluss zu behandeln und die zugrundeliegende Datei selbst zu prüfen — der Analyst verlangt Belege nur für die eigenen Aussagen. Kein zwölfter Agent, damit auch keine handgeschriebene Zeile in einer Bemessungsdatei ohne Spielraum.

4. Abbruch. Der zweite Agent liefert pro Behauptung ein Urteil: geprüft, widerlegt, oder aus den vorhandenen Eingaben nicht prüfbar. Schluss ist, wenn der dritte Topf leer ist und eine Runde keine neue Widerlegung bringt. Obergrenze 8 Runden, der Nutzer kann verlängern. „Nach N Runden nicht konvergiert" ist ein reguläres Ergebnis. Die tatsächliche Rundenzahl steht im Protokoll, damit deine 3 bis 4 irgendwann gemessen sind statt erinnert.

5. Nachgeben. Erlaubt und erwünscht. Wer eine Position aufgibt, benennt die Behauptung, die fällt, und den Beleg, der sie gekippt hat; ohne diese Angabe ist es Gefälligkeit. Was beide nicht auflösen, geht als offener Dissens ins Protokoll. Für den zweiten Agenten muss „hält stand" ein vollwertiges, kostenloses Ergebnis sein, sonst produziert er Einwände, um seinen Aufruf zu rechtfertigen.

6. Zustand. Ein Behauptungsregister trägt alles: es ist die Nutzlast jedes Auftrags an den zweiten Agenten (der hat keinen Chat), die Abbruchprüfung, die Ausgabe von --infer und am Ende die Datei. Keine Zeigerdatei. Geschrieben wird ab Runde eins, --close schließt nur ab — eine Datei, ein Ort, und ein Sitzungsabbruch verliert nichts.

7. Neue Datensatzart. Eigener Ordner discussions/. Der Schnitt liegt über der Aussage, nicht über dem Vorgang: bestrittene Begründung, was der Prüfung standhielt, was aufgegeben wurde, mündend in eine qualifizierte Empfehlung, die nichts bindet. Eine Entscheidung kann darauf beruhen. Zu ändern sind die Ablageliste und der Layoutbaum in den Konventionen, OUT_DISCUSSION in bin/fusion-paths, und discussions in der Ordnerliste der Pfadprüfung.

8. Zu zahlende Schranken. Die Skill-Dateien haben 612 Bytes Luft und eine neue Datei zählt in voller Größe, also brauchst du die Anhebung, der du schon zugestimmt hast — sie wird aufgeschrieben, die Basislinie bewegt sich nicht. Die Änderungen an Consultant-Prompt und Konventionen zahlen alle elf Aufrufpfade mit; der engste hat 24 384 Bytes Luft, das trägt.

Noch offen

- Ob die Ablage außerhalb der Werkbank (research/, logbook/) schon in die erste Fassung kommt. Sie kann nicht vom Auflöser kommen, also Argument oder Kopffeld, und die Zitatprüfung reicht dort nicht hin.
- Ob der erste Agent immer der gerade laufende ist, oder ob /fusion:discuss ihn benennen darf.

---

## Closure, 260917-1652

Landed over `13ac4194..9af8ee5a`, six commits of this checkout's own plus one from a
parallel session. `/fusion:discuss` exists: the command, the `discussions/` store it writes
into, the resolver key that finds it, and the release of the consultant so the orchestrator
may take him as the second discussion partner.

The directive's eight numbered points are realised, its two open questions were ruled by the
user on 260917 — storage stays inside the workbench for this version, and the first partner
is always the running agent — and two further questions the directive did not know it had
were ruled with them: the hook-test line bound it never named, and how much of each round
reaches the chat.

Both bounded surfaces were paid the way the user insisted: search for a cut first, record
what the search found. The hook-test surface yielded a real cut of 45 lines and took no
raise, leaving 26 lines of margin where it had stood at exactly zero. The skill surface
yielded none, measured rather than asserted, and took a raise of exactly 14 349 bytes
against an unmoved baseline. Both outcomes are in the log beside the seven before them.

The one review pass this work gets ran over `9084eed6..f7cd6d04` and found that the
mechanical half had landed and the substantive half had not: the consultant's dispatch ban
survived in five places beyond the three the spec named, because the acceptance criterion
asked for no sentence *excluding* him and a positive enumeration that omits him is not one.
All seven findings are closed.

Left open, and named rather than quietly carried: four defect records under this item, of
which the load-bearing one is that 85 KB of the dispatch bound's apparent slack is a cut's
own savings banked into a bound whose header says head-room is zero. The skill surface now
stands at 4 bytes of margin, and five bodies carry no baseline entry at all — a question
about the floor rather than the head-room, which nothing measures and which this work did
not answer. Two commits reach HEAD unreviewed, `9af8ee5a` and `5e6a6be8`, and one file,
`skills/cadence/SKILL.md`, is carried forward as opened only at its changed line.
