# Die Lock-Regel beschreibt den Stale-Detektor ohne die neue holderlose Alterung — Textschicht-Drift, vom eigenen Circle erzeugt

---

`rules/workbench-stash-and-lock.md` ist das Authoring-Home des Commit-Lock-Protokolls. Sein `### Mechanism` (Zeile 111) sagt: "Stale-lock detection at 60 seconds: if the holder PID is no longer running AND the lock is older than the threshold, the next acquirer force-releases it." Commit `b37f13e` hat in `bin/fusion-commit-lock` einen zweiten Reap-Pfad eingeführt — ein holderloses Lock-Verzeichnis wird auf seiner eigenen Verzeichnis-mtime gealtert und nach 60 s force-released, ganz ohne PID-Prüfung — und die Release-Verweigerung um eine neue Variante erweitert ("lock directory exists but records no holder; refusing to guess"). Beides steht im Skript-Header, nichts davon in der Regel.

Auch `### Failure modes` ist unvollständig geworden: "Release-not-held → non-zero exit with `not currently held by anyone`" nennt nur eine der zwei Meldungen, die `do_release` jetzt hat, und der Crash-mid-commit-Punkt ("force-releases after 60 seconds if the recorded PID is dead") deckt den Crash **zwischen mkdir und Holder-Write** nicht, der gerade der Anlass des Fixes war.

---

Kontext: Gefunden im Inkrementalreview Turn 3–4 (Diff `81d4154..HEAD`). Derselbe Commit, der das Verhalten geändert hat, hat die Regel nur an anderer Stelle angefasst (Manifest-Feldzählung, tote Zitate) — exakt die Defektklasse, die dieser Circle ("Textschicht gegen Code nachziehen") schließt. Fix: die zwei Absätze in `### Mechanism` und `### Failure modes` um den holderlosen Pfad ergänzen (Alterung auf Verzeichnis-mtime, Release-Verweigerung mit Verweis auf den nächsten acquire). Schwere: Low.

---
Resolved: `rules/workbench-stash-and-lock.md` nachgezogen, auf dem Stand des Skripts NACH dem Noclobber-Fix. `### Mechanism` beschreibt jetzt beide Reap-Pfade (Holder-Datei: PID tot UND älter als 60 s; holderlos: Alterung auf der Verzeichnis-mtime) und den noclobber Holder-Write (verspäteter Write scheitert, Acquisition verloren, zurück in die Poll-Schleife). `### Failure modes` ergänzt um den Crash/Stillstand zwischen mkdir und Holder-Write und nennt beide Release-Verweigerungs-Meldungen (`not currently held by anyone` ohne Lock-Verzeichnis; `lock directory exists but records no holder; refusing to guess` beim holderlosen Verzeichnis, Reap dem nächsten acquire überlassen). Emission-Golden per dokumentierter Prozedur regeneriert (UPDATE_RULES_GOLDEN=1, dann Lauf ohne Flag grün): nur orchestrator, workbench-stash-and-lock.md 9847 -> 11180.
