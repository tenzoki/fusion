log-activity scannt den Migrations-Backup-Ordner mit, und setup behauptet eine Store-Gleichheit, die nicht besteht
---
Zwei zusammenhängende Hälften:

1. `skills/setup/SKILL.md:36` begründet den Ausschluss eingefrorener Stores mit einem Präzedenzfall: „the precedent … `/fusion:log-activity` Step 3, which drops the same stores". Die Mengen sind nicht dieselben — `skills/log-activity/SKILL.md:79` schließt `archive/`, `stashes/` und `stilwerk/` aus, Setup schließt `archive/`, `stashes/` und `.migration-v2-backup/` aus. Der zitierte Präzedenzfall trägt die Aussage nicht.

2. Substanziell: log-activity scannt `.migration-v2-backup/` mit. Die Backup-Kopien einer v2-Migration tragen die Zeitstempel der Originale, also erscheinen alte Arbeitstage im Activity-Log ein zweites Mal. Dass solche Backups real existieren und Sonden fluten, ist genau der in `setup/SKILL.md:36` dokumentierte Messfall (1146 Treffer, unter anderem dort).
---
Schweregrad: Low. Punkt 1 verifiziert (Zitatvergleich beider Skill-Zeilen), Punkt 2 abgeleitet aus dem Scan-Mechanismus — die Prämisse (Backup-Ordner wird nicht ausgeschlossen) ist verifiziert, die Doppelzählung selbst nicht an einem echten Backup gemessen. Befund des Skill-Workstreams (Analyst). Fix: eine Zeile `-not -path '*/.migration-v2-backup/*'` in log-activity Schritt 3 — das schließt die Lücke und macht den Satz in setup:36 nebenbei wahr.
---
Resolved: 2026-08-06 — `.migration-v2-backup/` ist vom Scan ausgeschlossen und die Ausschluss-Prosa erweitert (`skills/log-activity/SKILL.md:81,88`); der Setup-Präzedenzsatz nennt die reale Relation (dieselben eingefrorenen Stores "plus stilwerk/, which for that skill is configuration rather than activity", `skills/setup/SKILL.md:36`). Commit 9a96466, Circle 260805-2005-textschicht-gegen-code-nachziehen (Plan-Schritt 12, Batch C).
