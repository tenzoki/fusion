# Holderloser Reap kann einem lebenden, langsamen Acquirer den Lock unter den Füßen wegziehen — beide Seiten glauben danach, ihn zu halten

---

Die neue holderlose Alterung in `bin/fusion-commit-lock` (`is_stale_lock`, Zeilen 124–138) reapt ein Lock-Verzeichnis ohne `holder`-Datei, sobald dessen mtime 60 s alt ist. Ist der ursprüngliche Ersteller aber noch am Leben und nur zwischen `mkdir` und dem Holder-Write angehalten (SIGSTOP, System-Sleep, extreme Last), passiert Folgendes, empirisch nachgestellt mit dem echten Skript:

1. H führt `try_acquire` aus: `mkdir` gelingt, dann wird der Prozess vor dem Holder-Write ≥ 60 s angehalten.
2. Waiter W sieht das holderlose Verzeichnis gealtert, force-released es, `mkdir`t neu und schreibt seinen eigenen `holder` (`tag: waiter`). W kehrt mit Erfolg aus `do_acquire` zurück.
3. H läuft weiter und schreibt seinen Holder-Block per einfachem Redirect `> "$HOLDER_FILE"` (Zeile 179) — der **überschreibt Ws frische Holder-Datei** kommentarlos. H kehrt ebenfalls mit Erfolg zurück.

Ergebnis: beide Prozesse glauben, den Lock zu halten (genau die Race, gegen die der Lock verteidigt), die Holder-Datei nennt H. Ws späteres `release` wird verweigert, solange Hs Prozess lebt (`do_release`, Zeile 235) — im `with`-Pfad schluckt `do_release 2>/dev/null || true` das, und die Meldung "released commit lock" (Zeile 310) ist dann falsch.

---

Kontext: Gefunden im Inkrementalreview Turn 3–4 des Textschicht-Circles (Diff `81d4154..HEAD`, Commit `b37f13e`). Reproduziert im Scratchpad: Ersteller mit `sleep 4` zwischen `mkdir` und Holder-Write, Verzeichnis-mtime zurückdatiert; `acquire waiter` gelang mit rc=0, danach stand `tag: H` in der Holder-Datei, `check` meldete "held by H".

Der Fehler ist nicht der Reap (der ist die beabsichtigte Heilung des Ewig-Block-Defekts 260805-1839), sondern dass der Holder-Write **nicht exklusiv** ist: ein wiederbelebter Ersteller merkt nicht, dass ihm der Lock entzogen wurde. Billige Abdichtung in `try_acquire`: den Holder-Block mit noclobber schreiben — `(set -C; { printf … ; } > "$HOLDER_FILE") 2>/dev/null || return 1` — dann scheitert der verspätete Write an Ws existierender Holder-Datei, H behandelt die Acquisition als verloren und pollt weiter. Restfenster (H schreibt zwischen Ws `mkdir` und Ws Holder-Write) bleibt, schrumpft aber von "60 s + beliebig" auf Millisekunden; vollständig schließen kann das nur ein fcntl-Lock, was den POSIX-Portabilitätsanspruch des Skripts überstiege.

Schwere: Low — der Trigger verlangt einen ≥ 60-s-Stillstand exakt zwischen zwei benachbarten Shell-Statements. Die Konsequenz ist allerdings genau der Commit-Absorptions-Fall, den der Lock existiert zu verhindern.

---
Resolved: Der Holder-Write in `try_acquire` (bin/fusion-commit-lock) ist jetzt noclobber (`set -C`, auf die Subshell begrenzt): existiert die Holder-Datei bereits, schlägt der Write fehl, die Acquisition gilt als verloren und der Acquirer kehrt in die Poll-Schleife zurück, statt den frischen Holder des Waiters zu überschreiben. Race mit dem echten Skript nachgestellt (Ersteller mit injiziertem Sleep zwischen mkdir und Holder-Write, Verzeichnis zurückdatiert): Waiter reapt und acquiriert (rc=0, `tag: waiter`), der wiederbelebte Ersteller meldet "waiting for commit lock held by waiter..." und die Holder-Datei bleibt die des Waiters. Neuer Test in hooks/lib/__tests__/fusion-commit-lock.test.ts pinnt genau diesen Ablauf (gepatchte Skript-Kopie mit injiziertem Delay, Anker asserted). Das im Issue benannte Restfenster (Write zwischen mkdir und Holder-Write des Reapers, Millisekunden) bleibt wie erwartet — vollständig schließen könnte es nur fcntl, jenseits des POSIX-Anspruchs; im Skript-Kommentar dokumentiert.
