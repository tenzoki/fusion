fusion-commit-lock-Header: release-Ablehnungsregel widerspricht dem Code, Abhängigkeitsliste unterschlägt sed und awk
---
Schweregrad: niedrig. (1) bin/fusion-commit-lock:29-31: release schlage fehl, wenn der Lock von einem anderen PID gehalten wird. Der Code (Zeilen 179-184) lehnt nur ab, wenn der fremde Halter-Prozess LEBT; release über einen toten Halter gelingt (ausgeführt: acquire, Prozessende, release aus neuem Prozess → exit 0). Der Code dokumentiert das als Absicht. (2) Zeilen 43-44: "Dependencies: mkdir, rmdir, rm, kill, date, printf, sleep, cat, head, grep" — das Skript nutzt zusätzlich sed (Z.87) und awk (Z.163).
---
Klasse 4/3, verifiziert (Ausführung + Code). Der tote Issue-Verweis im selben Header ist im Record "stash-lock-drei-tote-record-zitate" miterfasst. Analyse: circles/260801-1244-guard-rules-write/analyses/260805-1840-doku-gesamtpruefung-gegen-code.md
---
Resolved: 2026-08-06 — die Release-Regel im Header nennt die Live-Holder-Bedingung (Release über einen toten Halter gelingt, `bin/fusion-commit-lock:33`); die Abhängigkeitsliste führt `sed` und `awk` (:46-47); der tote Issue-Verweis im selben Header ist durch die Substanz ersetzt (miterfasst im geschlossenen Record `260805-1841_c_stash-lock-drei-tote-record-zitate`). Commit 9a96466, Circle 260805-2005-textschicht-gegen-code-nachziehen (Plan-Schritt 12, Batch C).
