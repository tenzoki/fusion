circle-pop-Skill verweist in der Hand-Recovery auf "original_circle_filename" — das Manifest-Schema kennt nur original_circle_dirname und original_circle_record
---
Schweregrad: niedrig (nur der manuelle Rettungspfad betroffen). skills/circle-pop/SKILL.md:158 nennt original_circle_filename; das Schema (rules/workbench-stash-and-lock.md:55-66, skills/circle-stash/SKILL.md:351-361) kennt dieses Feld nicht. Vermutlich Rest der Prä-Container-Ära, als der Circle eine Datei war.
---
Klasse 2, verifiziert. Analyse: 260805-1840-doku-gesamtpruefung-gegen-code.md
---
Resolved: 2026-08-06 — die Hand-Recovery nennt das Schemafeld `original_circle_dirname` und beschreibt den Legacy-Dateinamen-Fallback (Zeitstempel + Slug, ohne Marker und `.md`; `skills/circle-pop/SKILL.md:158`). Commit 9a96466, Circle 260805-2005-textschicht-gegen-code-nachziehen (Plan-Schritt 12, Batch C).
