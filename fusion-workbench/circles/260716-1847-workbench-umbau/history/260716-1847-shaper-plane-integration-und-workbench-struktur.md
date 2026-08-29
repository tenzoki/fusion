# Shaper-Sitzung: Plane-Anbindung und Umstrukturierung der workbench

**Date:** 2026-07-16
**Agent:** shaper (user-direct mode)
**Status:** Complete

## Auftrag

Der Nutzer will fusion an Plane (https://plane.so) anbinden und zugleich die workbench umstrukturieren, weil die typspezifischen Ordner semantisch zusammengehörige Dateien verstreuen. Bindende Vorgabe: Kernfeatures und Hooks bleiben erhalten.

## Vorgehen

Research Gate vor jedem Vorschlag (`rules/critical-stance.md` §2):

1. Kopplungsfläche der workbench geprüft: `hooks/*.ts`, `hooks/lib/*.ts`, `hooks/config.json`, `hooks/hooks.json`, `bin/monitor`, `bin/fusion-rules`, `agents/*.md`, `skills/*/SKILL.md`, `rules/*.md`.
2. Plane-Schnittstelle recherchiert (developers.plane.so, makeplane/plane Issues).
3. Umfang der Prompt-Umstellung ausgezählt.

## Befunde

**Die Hooks kennen die Typ-Ordner nicht.** Die Namen der elf Typ-Ordner kommen in `hooks/` und `bin/` null Mal vor. Geschützt werden `agents/**`, `rules/**`, `skills/**`, Plugin-Konfiguration, `.guard-state/**` (`hooks/config.json:12-22`). Tracker und Dashboard lesen nur `orchestrator-live.md`, `orchestrator-events.jsonl`, `agentstate.yaml`, `.guard-state/events.jsonl` (`hooks/tracker.ts:33-36`, `bin/monitor:72-75`). Die Vorgabe des Nutzers schränkt den Umbau damit praktisch nicht ein. Dieser Befund war die wichtigste Entlastung der Anfrage.

**Die Kopplung liegt in der Prosa.** 549 Pfadnennungen: 15 Agenten-Prompts (`reconciler.md` 53, `playmaker.md` 47, `orchestrator.md` 42), 11 Skills (`archive/SKILL.md` 22), 3 Regel-Dokumente (`fusion-workbench-conventions.md` 62 und damit der Hebelpunkt).

**Plane trägt, mit zwei Einschränkungen.** Über 180 REST-Endpunkte, `X-API-Key`, Webhooks. Rate-Limit 60 Anfragen pro Minute. Pages-API bei Selbsthosting über die öffentliche REST-Schnittstelle nicht erreichbar (makeplane/plane#8986) — Prosa-Dokumente können dort nicht liegen. Bekannte Doppel-Webhooks (makeplane/plane#7249) relevant, falls Rücklesen gewählt wird.

**Der Circle ist die vorhandene Abstraktion.** fusion kennt den Begriff, der die verstreuten Dateien zusammenbindet, realisiert ihn aber nicht als Verzeichnis. Wiederverwendung statt Neuerfindung.

## Ergebnis

Spec: `260716-1847[o]-spec-plane-integration-und-workbench-struktur.md`

Vier Entscheidungssätze abgelegt:
- `260716-1847[o]-plane-rolle-source-of-truth.md` (D1, blockiert C3/C4)
- `260716-1847[o]-workbench-struktur-circle-container-vs-typ-ordner.md` (D2, blockiert C1/C2)
- `260716-1847[o]-offline-verhalten-bei-plane-ausfall.md` (D3)
- `260716-1847[o]-zuschnitt-umbau-und-plane-ein-oder-zwei-circles.md` (D4)

Vorschlag: zwei Circles, Umbau zuerst.

## Anmerkung

`AskUserQuestion` steht Subagenten nicht zur Verfügung. Die vier Entscheidungen wurden daher als Entscheidungssätze abgelegt und dem Orchestrator zum Nutzer-Gate zurückgegeben, statt in der Sitzung geklärt zu werden.
