Vier EXAMPLE_PATHS-Einträge im Referenz-Lint sind nach Schritt 6 tote Ausnahmen
---
`hooks/lib/__tests__/reference-resolution-lint.test.ts` fällt in der Zusicherung "every EXAMPLE_PATHS entry is still referenced somewhere — no dead weight": `rules/a.md`, `rules/b.md`, `rules/gen.pl` und `rules/junk.txt` werden noch ausgenommen, aber von keiner ausgelieferten Textstelle mehr genannt. Der Haupt-Gate ("no dangling reference of any class") ist grün — die fünf gemeldeten Fundstellen sind erledigt.

Zu tun: die vier Schlüssel aus `EXAMPLE_PATHS` streichen. Die übrigen sechs Einträge (`rules/x.md`, `rules/old.md`, `rules/retired/old.md`, `rules/relevant-file.md`, `bin/fu`, `rules/context-manifest.yaml`) bleiben zitiert und tragen.
---
Ursache: die vier Pfade waren erfundene Befehlsoperanden der Klassifizierer-Beschreibung. `rules/gen.pl` stand ausschließlich in `rules/protected-path-internals.md` (in Schritt 6 gelöscht), `rules/a.md` und `rules/b.md` standen in der Klassifizierer-Prosa von `rules/protected-path-discipline.md` und `README-hooks.md`, `rules/junk.txt` im `git clean`-Absatz von `README-hooks.md`. Alle vier Fundstellen sind mit dem Klassifizierer gefallen.

Nicht in Schritt 6 behoben, weil der Auftrag ausdrücklich verbietet, unter `hooks/lib/__tests__/` etwas anderes als `rules-emission-golden.test.ts` anzufassen — Schritt 5 arbeitet parallel an der Suite. Der Eintrag gehört zu Schritt 5 (Testsuite) oder zu einem Nachzug danach; die Änderung ist eine Streichung von vier Zeilen und berührt keine Zusicherung sonst.

Gemessen am 260807-1133: `npx vitest run lib/__tests__/reference-resolution-lint.test.ts` → 22 grün, 1 rot (nur diese Zusicherung).

---
Resolved: Die vier Schlüssel `rules/a.md`, `rules/b.md`, `rules/gen.pl` und `rules/junk.txt` sind aus `EXAMPLE_PATHS` in `hooks/lib/__tests__/reference-resolution-lint.test.ts` gestrichen. Die sechs übrigen Einträge stehen unverändert. Gegenprobe am Baum vor der Streichung: die vier Pfade kommen auf der gescannten Fläche (`rules/`, `agents/`, `docs/`, `templates/`, `skills/`, READMEs, `CLAUDE.md`, `bin/`-Skripte, `install.sh`, `hooks/lib/*.ts`) nirgends mehr vor; die verbliebenen Treffer liegen sämtlich unter `hooks/lib/__tests__/`, das nicht Teil der Fläche ist. Gemessen am 260807-1201: `npx vitest run lib/__tests__/reference-resolution-lint.test.ts` → 23 grün, 0 rot (vorher 22 grün, 1 rot). Die Textstellen selbst fielen mit `436d78c` (Textschicht) und `ba7ccda` (Klassifizierer).
