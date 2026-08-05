# coderev — Inkrementalreview der Commits 21a72b7 + 373f5ed (Step-6-Template + Step-7-Doku-Durchgang)

**Datum:** 260805-2248
**Scope:** Nur die in diesem Turn geänderten Sätze in `templates/fusion-guard.json`, `fusion-guard.json`, `rules/protected-path-discipline.md`, `README-hooks.md`, `CLAUDE.md` (Basis 4a8fea0). Die 260805er Gesamtreview-Befunde sind ausgenommen.

## Urteil

Ein neuer Befund, als Issue gefiled. Alles andere ist gegen Loader, Guard und Tests geprüft und hält.

## Der Befund (hoch, neu gefiled)

`issues/260805-2248_o_readme-advisory-zeile-behauptet-fail-closed-steht-ab-obwohl-der-floor-ihn-am-leben-haelt.md` — README-hooks.md:137 ("Advisory-only"-Zeile, in 373f5ed umgeschrieben) behauptet weiter, eine leere `protectedPaths`-Liste stehe den Shell-Check "fail-closed rule included" ab. Der im selben Satz ergänzte Floor hält die effektive Liste aber bei zwei Einträgen (`hooks/lib/config.ts:687-692`), und der Fail-closed-Pass hängt an der effektiven Liste (`hooks/lib/bash-mutation-guard.ts:3112` via `hooks/guard.ts:403`). Per Ausführung gegen den kompilierten Klassifizierer bestätigt: `mv $A $B` verweigert mit Floor-only-Liste, erlaubt mit leerer Liste. Schwester des offenen `260805-1840_o_ppd-leere-liste…` (nennt nur die Regeldatei); der Step-7-Durchgang hat den betroffenen PPD-Absatz angefasst, den bekannten Halbsatz dort aber ebenfalls behalten — bewusst außerhalb des Step-7-Scopes gelassen (History 260805-2233, "Not worked, per scope"), darum dort nicht refiled.

## Geprüft und gehalten (Belege)

- **Byte-Identität** Wurzelkopie/Template: `cmp` identisch; Test `config.test.ts:1320` ("byte for byte"). CLAUDE.md-Zeile korrekt.
- **Leaf-Merge, alle Formulierungen** (`_override`, README §Per-project, PPD, CLAUDE.md-Zeile): `config.ts:628-650` (`pickGuard` u. a., `??` pro Leaf); Tests "keeps every protected pattern when …" (Integration 2380-2416), "a DECLARED empty list is the empty list" (config.test.ts:287).
- **Built-in-Default der Liste ist leer:** `config.ts:280`.
- **`guard.enabled`-Ausnahme + Diagnostic bei jedem guarded Call:** `config.ts:563-568` (Drop + Diagnose), `guard.ts:672` (Emission oberhalb des enabled-Checks, ein Prozess pro Tool-Call); Tests config.test.ts:461-516, Integration :2539. Die README-Fußnote "die früheren guard.enabled-Zeilen bleiben wahr (Plugin-Datei)" gedeckt durch "still reads the key from the PLUGIN layer" (config.test.ts:527).
- **Floor, beide Schreibweisen, Subdirectory:** `config.ts:684-692`; Integration 1788-1884 (Edit/Shell/listet-sich-selbst/leere-Liste/Flag) und 1904 ff. (Subdirectory).
- **Erzeugen erlaubt (Seeding):** Integration "does NOT block creating it" (1853-1867); Setup-Skill seedet real (skills/setup/SKILL.md:169).
- **Gemessene Reichweite des Residuums inkl. `.guard-state/**`:** Integration "MEASURES: one write unprotects the guard's own state" (2308-2346).
- **Halt blockt den Narrowing-Write:** `guard.ts` CHECK 1 (759-778) blockt jeden Write-Tool-Call, STEP 2a jede erkannte Shell-Mutation; Integration "MEASURES: a HALT still holds" (2350-2370).
- **Deklarierter Eintrag sticht `FUSION_ALLOW_RULES_WRITE`, Deny zitiert den Eintrag:** `config.ts:260-265` + `rules-write-exemption.ts` Gate 1b; Integration 2721-2790 (beide Surfaces, Reason nennt Eintrag und Datei). CLAUDE.md-Bullet und Symptomzeile konsistent damit.
- **Kaputte Datei wird auch im eigenen Repo gemeldet:** Diagnostics oberhalb von enabled- und Self-Detect-Gates (`guard.ts:650-677`); Integration :2682.
- **Unbekannte Keys ungemeldet durchgereicht:** `config.ts:545-551`; Test "accepts unknown keys, including the template's documentation keys" (config.test.ts:686) + Seeded-Template-Fall (diagnostics leer, 1237-1252).
- **Release-Checklisten-Satz (CLAUDE.md:70):** zutreffend — der Guard-Harness spawnt Wegwerf-Projektwurzeln (`withProject`), Self-Detect steht im Plugin-Repo real ab.

## Nicht refiled (bekannt offen, nur zitiert)

- `260805-1840_o_ppd-leere-liste-steht-den-check-nicht-ab.md` (PPD-Hälfte desselben Defekts; Circle 260805-2005).
- `260805-1839_o_der-tracker-steht-im-plugin-repo-nur-dann-still-wenn-cwd-exakt-die-repo-wurzel-ist.md` — betrifft die `_inFusionsOwnSourceTree`-Aussage "has no effect" nur über den bekannten cwd-Rest.
