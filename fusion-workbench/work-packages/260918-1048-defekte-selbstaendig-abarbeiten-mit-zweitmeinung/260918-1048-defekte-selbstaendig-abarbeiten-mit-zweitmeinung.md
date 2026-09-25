# Offene Defekte selbständig abarbeiten, mit Lösungskonzept und Zweitmeinung je Defekt

---
**Domain:** code
**Status:** done
**Claim:** 5e8248d7 — Kai Stalmann <ks@qantr.com>, 260918-1102
**Active spec/plan:** 260918-1124_*_autonomous-defect-package-fifteen-fixes-with-a-second-opinion-each.md (the plan; no spec, planned from the directive)
**Filed by:** user, Kai Stalmann <ks@qantr.com>
---

## Directive

Auftrag. Arbeite offene Defekte selbständig ab, einen nach dem anderen, drei Tage ohne Rückfrage.

Auswahl. Im Arbeitsordner stehen heute 110 offene Defekte. Wähl daraus eine begrenzte Liste, 10 bis 15, und schreib sie als erstes in das Arbeitspaket. Ausgeschlossen ist alles, dessen Behebung Ontologie oder Strukturdaten anfasst, also YAML, JSON, TOML, CSV, Schemata, Manifeste. Die Defekte tragen dafür kein Feld, genau einer von 110 hat eine Domänenangabe, also musst du jeden lesen und je Defekt in einem Satz festhalten, warum er drin oder draußen ist. Ebenfalls draußen: was ohne eine Zustimmung des Nutzers gar nicht entschieden werden kann.

Je Defekt, in dieser Reihenfolge. Erst ein Lösungskonzept: Ursache, die vertretbaren Optionen, die gewählte, und woran man erkennt, dass es behoben ist. Dann die Zweitmeinung, bevor eine Zeile Code fällt: dispatch fusion:consultant auf das Konzept. Steht mehr als eine Option ernsthaft zur Wahl, nimm stattdessen /fusion:discuss. Trägt das Konzept die Prüfung nicht, überarbeite es, nicht den Code. Erst danach fixen, prüfen, den Defekt mit seiner Auflösungszeile schließen. Ein Commit je Defekt.

Entscheiden und Buch führen. Alles, was die Lösung selbst betrifft, entscheidest du und hältst es nicht auf. Sobald ein späterer Leser die Begründung sonst neu herleiten müsste, leg einen Beschluss an und schreib hinein, wer entschieden hat, nämlich du. Was dagegen Zustimmung ist und keine Konstruktion, entscheidest du nicht: Ontologie, das Entfernen oder Umbauen von etwas Bestehendem, ein Auftrag, der mehrdeutig ist. Dort legst du den Beschluss offen an, überspringst den Defekt und machst weiter. Rate nicht, und schreib keine Zustimmung auf, die niemand gegeben hat.

Abbruch. Hör auf, wenn die Liste durch ist, oder wenn die Zweitmeinung drei Konzepte hintereinander zurückweist. Das zweite heißt, dass die Auswahl falsch war, und dann ist Weiterarbeiten teurer als Warten.

Fertig heißt. Alles lokal verbucht in nachvollziehbaren Schritten, nichts gepusht. Lass /fusion:cleanup nicht laufen, das pusht. Zum Schluss ein Bericht mit vier Teilen: was behoben ist, was übersprungen wurde und warum, jede nicht-triviale Entscheidung mit einem Satz Begründung, und die Liste dessen, was auf deine Rückkehr wartet.

---
Closed 260920-2222: done. Commit range `1aeb3679..b30ec2ea`; the plan `260918-1124_*_autonomous-defect-package-fifteen-fixes-with-a-second-opinion-each.md` is complete at 15 of 15 steps, each defect closed with one commit. The range is tiled by two reviews, `260918-1409-reviewer-closing-pass-over-the-fifteen-defect-fixes.md` (`1aeb3679..f7545a4c`) and `260920-2216-reviewer-closing-pass-over-the-narrowed-work-item-bound.md` (`f7545a4c..b30ec2ea`), both with `**Not-opened:** none`. All eight clauses of `## Where this work stops` hold, confirmed by the user at the closing gate. Left behind for follow-on work: the seven defects the first review filed, taken up by `260920-2151-sieben-neue-defekte-selbstaendig-abarbeiten.md`; the two text defects the second review filed, `260920-2216_*_the-scope-bullet-says-the-work-item-operations-and-nothing-else-then-permits-a-filing-the-operations-table-does-not-list.md` and `260920-2217_*_the-who-filed-it-enumeration-omits-the-work-item-whose-template-carries-filed-by-and-now-has-a-second-writer.md`; and the eighteen records the plan lists under `## Already resolved at HEAD`, whose marker moves wait on a closing pass. Ruled by user, Kai Stalmann <ks@qantr.com>.
