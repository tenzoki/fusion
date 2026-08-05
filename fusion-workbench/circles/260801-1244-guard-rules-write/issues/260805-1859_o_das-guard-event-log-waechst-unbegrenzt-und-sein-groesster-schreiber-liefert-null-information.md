Das Guard-Event-Log wächst unbegrenzt, und sein größter Schreiber liefert null Information
---
`fusion-workbench/.guard-state/events.jsonl` ist append-only ohne Rotation, Trimmung oder Obergrenze. Niemand räumt auf: `skills/archive/SKILL.md:82` führt `$WORKBENCH/.guard-state/` ausdrücklich in der Nicht-Anfassen-Liste, `emitEvent` (`hooks/lib/events.ts:44-64`) hängt nur an, `saveEscalation` trimmt nur `recentEvents` in `escalation.json` (`hooks/lib/escalation.ts:154-156`) — nicht das Log.

Der Monitor liest bei JEDEM Refresh die ganze Datei und parst jede Zeile (`bin/monitor:984-991` `_read_file` → `f.read()`, `_read_warnings` iteriert über alle Zeilen), Default-Intervall 2 Sekunden (`bin/monitor:31`).

Gemessen am realen Log dieses Repos:

    Zeilen=11142  Größe=4.9 MB  Zeit/Refresh=61 ms  bei 2s-Intervall = 3.0% Dauerlast

Zusammensetzung (`grep -o '"event":"[a-z_]*"' | sort | uniq -c`):

    3649 tracker_record     davon 2420 reine "Bash command observed"
    2764 guard_allow
    1182 churn_warning      1166 churn_critical
    1164 cross_file_critical 1139 cross_file_warning
      41 guard_block          19 guard_halt

Der größte Einzelposten ist `{"event":"tracker_record","tool":"Bash","detail":"Bash command observed"}` (`hooks/tracker.ts:99`) — ein Ereignis ohne Datei, ohne Kommando, ohne Ergebnis. Es sagt „ein Bash-Aufruf fand statt", was aus jedem anderen Signal folgt. Der Monitor filtert es weg (`WARNING_EVENT_TYPES`), gelesen wird es von niemandem. 22 % des Logs.

Projektion (abgeleitet, Annahme linear fortgeschriebener Nutzung): Das Log deckt 07-07 bis 08-05, also rund einen Monat für 11 k Zeilen. Ein Jahr ergibt ~130 k Zeilen / ~60 MB / ~700 ms pro Refresh — bei 2-Sekunden-Takt gut ein Drittel eines Kerns im Dauerbetrieb, nur um dieselben Zeilen erneut zu parsen.
---
Schweregrad: Low heute, wachsend. Verifiziert (Messung oben) bis auf die ausdrücklich als Projektion markierte Fortschreibung. Zwei unabhängige Fixe: (a) `tracker_record` für Bash ersatzlos streichen oder mit Inhalt füllen — es ist die billigste Halbierung; (b) eine Rotation einführen (Größen- oder Zeilenkappe in `emitEvent`, oder `.guard-state/events.jsonl` in `/fusion:archive` aufnehmen) und den Monitor nur den Schwanz lesen lassen, statt bei jedem Refresh von vorn. Die Nicht-Anfassen-Liste des Archivs ist dabei nicht falsch — sie schützt Zustandsdateien; ein append-only-Log ist keine Zustandsdatei und gehört als eigener Fall behandelt.
