Die Dateitabelle in README-hooks kennt drei lib-Module nicht — darunter die zwei neuen dieses Circles
---
Die „Files"-Tabelle (`README-hooks.md:106-127`) listet 12 `lib/`-Module, aber `hooks/lib/` enthält 15. Es fehlen:

- `lib/fs-locator.ts` — der Filesystem-Resolver des zweiten Exemption-Gates (neu in diesem Circle)
- `lib/rules-write-exemption.ts` — das Modul der FUSION_ALLOW_RULES_WRITE-Grenze (neu in diesem Circle; im Fließtext Z.148 erwähnt, in der Tabelle nicht)
- `lib/project-relative.ts` — die Pfad-Normalisierung, die guard.ts und der Mutation-Classifier teilen

Gemessen: `ls hooks/lib/*.ts` (15 Dateien ohne `__tests__`) gegen die Tabellenzeilen.
---
Schweregrad: Low. Genau die Lückenklasse dieses Reviews: die vier Tage haben zwei Module hinzugefügt, und die Inventar-Tabelle des ausgelieferten READMEs wurde nicht nachgezogen. Fix: drei Tabellenzeilen.
---
Resolved: 2026-08-06 — Dateitabelle um `lib/project-relative.ts`, `lib/rules-write-exemption.ts` und `lib/fs-locator.ts` ergänzt (`README-hooks.md:117-119`); der Enumerations-Lint (a1b7872) prüft die Tabelle künftig gegen den Baum. Commit 9a96466, Circle 260805-2005-textschicht-gegen-code-nachziehen (Plan-Schritt 11, Batch B).
