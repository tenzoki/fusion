# Coder-Session — Turn 5 des Textschicht-Circles: die vier Low-Befunde des Abschluss-Reviews

**Agent:** coder
**Status:** Complete
**Grundlage:** reviews/260806-03-coderev-inkrementalreview-turn3-4-lock-aging-lints-doku.md, vier Issues `260806-1030`/`260806-1031` (alle vier geschlossen)

## Was getan wurde

1. **Noclobber Holder-Write** (`bin/fusion-commit-lock`, Issue holderloser-reap): der Holder-Write in `try_acquire` läuft jetzt unter `set -C` in einer Subshell; existiert die Holder-Datei, scheitert der Write, die Acquisition gilt als verloren (return 1, zurück in die `do_acquire`-Poll-Schleife). Skript-Header (Mechanism-Absatz) und Inline-Kommentar nachgezogen, inkl. des dokumentierten Millisekunden-Restfensters. Race mit dem echten Skript nachgestellt (Sleep zwischen mkdir und Write injiziert, Verzeichnis zurückdatiert): Waiter reapt und hält, wiederbelebter Ersteller verliert und pollt. Neuer Test "the holder write is noclobber" in `hooks/lib/__tests__/fusion-commit-lock.test.ts` (gepatchte Skript-Kopie, Anker asserted, keine Wall-Clock-Waits außer dem injizierten Delay).
2. **Lock-Regel nachgezogen** (`rules/workbench-stash-and-lock.md`, Issue lock-regel-mechanism): `### Mechanism` beschreibt beide Reap-Pfade und den noclobber Write; `### Failure modes` ergänzt um den mkdir-bis-Holder-Write-Crash und beide Release-Verweigerungs-Meldungen. Emission-Golden regeneriert (nur orchestrator: workbench-stash-and-lock.md 9847 → 11180, total 112605), Lauf ohne Flag grün.
3. **`e.g.`-Ausnahme verengt** (`hooks/lib/__tests__/reference-resolution-lint.test.ts`, Issue referenz-lint): neue Funktion `inAnnouncedIllustration()` — Befreiung nur innerhalb der vom letzten `e.g.` eröffneten Klausel (`)`, `;`, `. ` beenden sie). Header-Kommentar angepasst, neuer Testfall für die False-Negative-Form. Auf HEAD keine neuen Verletzungen (23/23 grün).
4. **Vollständigkeits-Buchung** (`hooks/lib/__tests__/derivable-enumerations-lint.test.ts`, Issue enumerations-lint): neuer Test "accounts for every emit_if_exists line" — dummer Zähler über alle `emit_if_exists "$PLUGIN_RULES_DIR/…"`-Zeilen, eingerückte gegen `conditionalEmissions()`, uneingerückte gegen `alwaysOnList()`; Fehlbetrag nennt die Datei und die Fix-Richtung. Falsifiziert mit temporärem `IS_NEWFANGLED_FLAG`-Block (schlug laut fehl, `probe-unparseable.md` benannt), Probe rückstandsfrei entfernt.

## Verifikation

- Volle Suite: **1611 Tests, 30 Dateien, alle grün** (Baseline 1608 + 3 neue Tests).
- `bin/fusion-rules` unverändert gegenüber HEAD (Probe revertiert, git diff leer).
- Nicht committet (Vorgabe des Dispatches; der Orchestrator committet).

## Geänderte Dateien

- `bin/fusion-commit-lock`
- `hooks/lib/__tests__/fusion-commit-lock.test.ts`
- `rules/workbench-stash-and-lock.md`
- `hooks/lib/__tests__/fixtures/rules-emission.golden`
- `hooks/lib/__tests__/reference-resolution-lint.test.ts`
- `hooks/lib/__tests__/derivable-enumerations-lint.test.ts`
- vier Issue-Dateien unter `circles/260805-2005-textschicht-gegen-code-nachziehen/issues/` (Resolved-Footer, `_o_` → `_c_`)
