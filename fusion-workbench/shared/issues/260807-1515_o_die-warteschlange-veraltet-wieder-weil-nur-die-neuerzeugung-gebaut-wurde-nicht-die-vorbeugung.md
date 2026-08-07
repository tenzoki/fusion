Die Warteschlange ist wieder veraltet, weil aus dem Vorgängerbefund nur die Neuerzeugung gebaut wurde und nicht die Vorbeugung

---

**Severity:** Medium
**Domain:** code
**Filed by:** reconciler, Abschluss-Pass zu `circles/260807-0923-guard-misst-statt-orakelt`, 260807-1515
**Affects:** `agents/orchestrator.md` (Phase 4), `skills/setup/SKILL.md`, `skills/next/SKILL.md`
**Cross-references:**
`shared/issues/260801-2038_c_tasklist-holds-a-fully-closed-queue-from-a-circle-closed-two-weeks-ago.md` (der Vorgängerbefund, dessen Abschlussnotiz genau diesen Befund angefordert hat),
`shared/issues/260801-2038_o_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md` (dieselbe Klasse: Schreibvorgänge am Turn- und Circle-Rand, die eine Sitzung überspringen kann, ohne dass etwas bricht)

---

## Der Zustand

`fusion-workbench/tasklist.md` trägt im Kopf, gemessen am 260807-1515:

```
**Generated:** 2026-08-07 00:02
**Active Circle:** `circles/260804-1205-shell-reachability-model` (`_t_`)
**Source plan:**   `circles/260804-1205-shell-reachability-model/planning/260806-2353_*_plan-shell-reachability-model.md`
**Open tasks:** 44 (11 in the active Circle, 33 unaffiliated backlog)
```

Der genannte Circle trägt seit 260807-0923 den Marker `_s_` (abgelöst). `.active-circle` zeigt
auf `260807-0923-guard-misst-statt-orakelt`. Der genannte Plan gehört zu dem abgelösten Circle
und ist mit dem Mechanismuswechsel gegenstandslos geworden: seine Schritte 3 bis 11 bauen den
Klassifizierer aus, den `ba7ccda` gelöscht hat.

Die elf Einträge des Abschnitts A beschreiben damit Arbeit, die nicht nur unerledigt, sondern
**nicht mehr zu tun** ist. Mehrere Agenten haben die Datei im Lauf der Sitzung als veraltet
gemeldet; keiner konnte sie anfassen, weil `tasklist.md` allein dem taskplanner gehört.

## Warum das ein eigener Befund ist und keine Wiederholung

Der Vorgängerbefund `260801-2038_c_*` beschrieb denselben Zustand und ist am 260807-00:02
geschlossen worden — durch eine Neuerzeugung. Seine Abschlussnotiz sagt wörtlich, was dabei
nicht mitkam:

> **The preventive half is not carried by this closure.** Whoever wants it should file it as its
> own item against the orchestrator's Phase 4 and the two skills; it is a change to three
> prompts, not to the queue.

Genau das ist hiermit getan. Der Vorgänger ist zu Recht `_c_`: sein Gegenstand, die damals
konkret veraltete Datei, war beseitigt. Dass sie **sieben Stunden später** wieder veraltet war,
ist die Bestätigung seiner Diagnose und nicht deren Widerlegung.

## Warum die Neuerzeugung allein nicht trägt, gemessen an diesem Fall

Der Vorgänger nannte als Ursache, dass ein taskplanner-Lauf bei `_a_ → _t_` heute freiwillig
ist. Dieser Fall zeigt einen zweiten Weg in denselben Zustand, den der Vorgänger nicht kannte:

**Die Warteschlange kann veralten, ohne dass ein Circle schließt.** Hier wurde der aktive Circle
mitten in der Sitzung *abgelöst* (`_t_ → _s_`), nicht abgeschlossen. Option 2 des Vorgängers
("der Orchestrator löscht `tasklist.md` bei `_t_ → _c_/_b_`") hätte hier nicht gegriffen, weil
`_s_` in ihrer Aufzählung nicht vorkommt. Eine Vorbeugung, die nur am Abschluss hängt, hat für
den Ablösungsfall kein Ereignis.

## Was zu tun wäre

Die drei Optionen des Vorgängers, mit dem hier gemessenen Zusatz:

1. **Neuerzeugung verbindlich machen** bei jedem Wechsel des aktiven Circles — nicht nur bei
   `_a_ → _t_`, sondern auch bei einer Ablösung, die einen neuen Circle aktiv setzt.
2. **Löschen am Rand.** Der Orchestrator entfernt `tasklist.md`, wenn `.active-circle` gelöscht
   oder umgeschrieben wird. Die Kopplung an `.active-circle` statt an eine Marker-Liste deckt
   alle Übergänge ab, auch die, an die beim Schreiben der Regel niemand gedacht hat — genau die
   Lücke, die dieser Fall aufgedeckt hat.
3. **Stempeln und warnen.** `/fusion:setup` und `/fusion:next` vergleichen `**Generated:**` und
   `**Active Circle:**` gegen `.active-circle` und warnen bei Abweichung. Erkennt statt zu
   verhindern, kostet aber fast nichts und wirkt auch dann, wenn 1 und 2 einmal übersprungen
   werden.

Option 2 in der `.active-circle`-Fassung ist die billigste vollständige, weil sie an einer
Bedingung hängt statt an einer Ereignisliste. 1 und 3 ergänzen sie, sie konkurrieren nicht.

## Warum im geteilten Speicher

Aufgefallen beim Abschluss von `circles/260807-0923-guard-misst-statt-orakelt`, verursacht von
dessen Directive nicht: der Mangel ist eine Eigenschaft davon, wie der Orchestrator und die
beiden Skills eine Warteschlange am Circle-Rand behandeln, nicht der Guard-Arbeit, neben der er
gefunden wurde. Herkunftsregel, wie schon bei beiden `260801-2038`-Befunden.
