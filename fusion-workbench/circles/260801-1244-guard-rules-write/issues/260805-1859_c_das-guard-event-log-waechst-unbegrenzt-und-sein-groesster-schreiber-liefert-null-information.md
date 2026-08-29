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

---
Resolved: Half (a) landed. Half (b) is a decision, not an implementation, and was filed as one
rather than guessed at — this record closes with that split stated, not hidden.

**(a) The contentless writer is gone.** `hooks/tracker.ts` no longer emits
`{"event":"tracker_record","tool":"Bash","detail":"Bash command observed"}`. Measured against
this repository's log before the change: 4 226 of 17 524 lines, 24 %. The other option this
record offered — filling it with content — was considered and refused: the only content
available at that point is the command text, and the guard stopped reading command text in
v6.0.0 on purpose. Copying every shell command into an append-only log would be a new surface,
not a fix for this one. The three surviving `tracker_record` details each name a path, which
is exactly what made the Bash one the one carrying nothing. Verified against a throwaway
project root (`churn-key-anchor.test.ts`, "writes nothing to the event log for a Bash call",
with its counterpart pinning that the write-tool records stay).

**(b) The bound was NOT implemented, and deliberately.** Every way of bounding this file
discards something: a line or size cap throws away the oldest lines first, and the oldest
lines include the 99 `guard_block` / `guard_halt` / `halt_cleared` events that are the record
of the guard actually enforcing something — 0.6 % of the file and the part nobody would choose
to lose. Reading only the tail in `bin/monitor` has the same shape from the reader's side: the
panel caps each event class separately, so a fixed tail window can contain no `guard_halt`
while the whole file does, and the one event meaning "the guard stopped an agent" would
silently leave the dashboard. The choice needs a human, so it is
`260811-1534_*_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md`
— four options, with this record's own measurement re-taken, and the recommendation of
archiving rather than truncating.

This record's other observation stands and is carried into that decision: the archive's
never-touch list is not wrong, it protects state files, and an append-only log deserves its
own case rather than an exception carved into that rule.
