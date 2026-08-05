Die Dateitabelle in README-hooks kennt drei lib-Module nicht — darunter die zwei neuen dieses Circles
---
Die „Files"-Tabelle (`README-hooks.md:106-127`) listet 12 `lib/`-Module, aber `hooks/lib/` enthält 15. Es fehlen:

- `lib/fs-locator.ts` — der Filesystem-Resolver des zweiten Exemption-Gates (neu in diesem Circle)
- `lib/rules-write-exemption.ts` — das Modul der FUSION_ALLOW_RULES_WRITE-Grenze (neu in diesem Circle; im Fließtext Z.148 erwähnt, in der Tabelle nicht)
- `lib/project-relative.ts` — die Pfad-Normalisierung, die guard.ts und der Mutation-Classifier teilen

Gemessen: `ls hooks/lib/*.ts` (15 Dateien ohne `__tests__`) gegen die Tabellenzeilen.
---
Schweregrad: Low. Genau die Lückenklasse dieses Reviews: die vier Tage haben zwei Module hinzugefügt, und die Inventar-Tabelle des ausgelieferten READMEs wurde nicht nachgezogen. Fix: drei Tabellenzeilen.
