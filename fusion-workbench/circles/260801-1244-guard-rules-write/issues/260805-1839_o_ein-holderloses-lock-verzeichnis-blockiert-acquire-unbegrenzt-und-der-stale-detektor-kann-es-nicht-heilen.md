Ein holderloses Lock-Verzeichnis blockiert acquire unbegrenzt, und der Stale-Detektor kann es nicht heilen
---
`bin/fusion-commit-lock`: Stirbt der Halter zwischen `mkdir "$LOCK_DIR"` (Z.131) und dem Schreiben der Holder-Datei (Z.132-136) — oder wird das Verzeichnis anderweitig ohne Holder-Datei erzeugt — entsteht ein Lock, das kein Akquirierender je wieder löst:

- `is_stale_lock` (Z.93-94) beginnt mit `[ ! -f "$HOLDER_FILE" ] && return 1` — ohne Holder-Datei gilt das Lock als NICHT stale, egal wie alt.
- `do_acquire` (Z.147-168) pollt daher endlos; die einzige Meldung ist „waiting for commit lock held by ?..." (Tag-Fallback `?`, Z.157).
- `do_release` (Z.172-175) verweigert mit „not currently held by anyone" und lässt das Verzeichnis stehen.
- `check` (Z.201-212) meldet „held by ?/pid ? since ?".

Messung (Sandbox-Workbench, leeres `fusion-workbench/.commit-lock/` angelegt): `acquire testtag` hing nach 65 Sekunden — jenseits der 60s-Stale-Schwelle — weiterhin; einzige stderr-Zeile: `fusion-commit-lock: waiting for commit lock held by ?...`; `check` → `held by ?/pid ? since ?`, exit 0.
---
Schweregrad: Medium. Verifiziert (Messung oben). Der Stale-Detektor existiert genau für abgestürzte Halter und verfehlt diesen Fall; alle Commits des Projekts hängen dann unbegrenzt mit einer nicht handlungsleitenden Meldung. Fix-Richtung: in `is_stale_lock` den holderlosen Fall über das mtime des Lock-VERZEICHNISSES altern lassen (Verzeichnis älter als Schwelle + keine Holder-Datei → force-release), und die `waiting`-Meldung im `?`-Fall um einen Hinweis auf `check`/manuelles `rmdir` ergänzen.
