# Referenz-Lint: die `e.g.`-Ausnahme ist breiter als ihr eigener Kommentar behauptet — ein totes Zitat hinter einem beliebigen `e.g.` auf derselben Zeile bleibt unsichtbar

---

Der Header von `hooks/lib/__tests__/reference-resolution-lint.test.ts` (Zeile 57) begrenzt die Ausnahme auf "a class-(c) token preceded by `e.g.` on its own line" — eine angekündigte Illustration. Der Code (Zeile 432) prüft aber `/\be\.g\./.test(text.slice(0, idx))`: **irgendein** `e.g.` irgendwo früher auf der Zeile befreit **jedes** spätere Record-Zitat derselben Zeile, auch eines, das gar nicht die Illustration ist.

Konkret: eine Zeile der Form "…(e.g. `en`) … per decision `260806-9999_o_nie-existiert.md`" trägt ein totes Zitat, das der Lint stumm passieren lässt, weil das `e.g.` vier Wörter davor eine ganz andere Klammer eröffnet. Das ist genau die Sorte False-Negative, vor der die Exemption-Design-Notiz im selben Header warnt ("an allowlist that swallows real defects").

---

Kontext: Gefunden im Inkrementalreview Turn 3–4 (Commit `a1b7872`). Fix-Richtung: die Ausnahme an die dokumentierte Form binden — z. B. nur greifen lassen, wenn das `e.g.` **unmittelbar** vor dem Token steht (`/\be\.g\.\s*[`(]*$/` auf dem Präfix), oder den Kommentar an das implementierte Verhalten anpassen und den Preis benennen. Die erste Variante ist die ehrlichere; der bestehende Testfall (Zeile 751, `"cite paths (e.g. decision …)"`) passiert sie unverändert. Schwere: Low — der Lint bleibt auf dem gesamten Bestand grün, das Fenster betrifft nur künftige Zitate, die zufällig hinter einem `e.g.` derselben Zeile landen.

---
Resolved: Die Ausnahme ist verengt (die ehrlichere der beiden Fix-Richtungen): `inAnnouncedIllustration()` in reference-resolution-lint.test.ts befreit ein Zitat nur noch, solange die vom letzten `e.g.` eröffnete Klausel offen ist — ein `)`, ein `;` oder ein Satzende (`. `) zwischen `e.g.` und Token beendet die Ankündigung. Der Header-Kommentar beschreibt jetzt exakt diese Klausel-Grenze. Neuer Testfall pinnt die False-Negative-Form des Issues ("(e.g. `en`) ... per decision `990101-0101_o_never-existed.md`" feuert jetzt); der bestehende Fall "cite paths (e.g. decision ...)" passiert unverändert. Auf HEAD nachgeprüft: der gesamte Bestand bleibt grün (23/23 Tests, keine neuen Verletzungen durch die Verengung).
