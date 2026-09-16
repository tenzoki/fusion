# Neues discuss Feature

---
**Status:** open
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
