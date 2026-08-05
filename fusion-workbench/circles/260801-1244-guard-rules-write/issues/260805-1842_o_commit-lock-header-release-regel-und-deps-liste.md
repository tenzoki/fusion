fusion-commit-lock-Header: release-Ablehnungsregel widerspricht dem Code, Abhängigkeitsliste unterschlägt sed und awk
---
Schweregrad: niedrig. (1) bin/fusion-commit-lock:29-31: release schlage fehl, wenn der Lock von einem anderen PID gehalten wird. Der Code (Zeilen 179-184) lehnt nur ab, wenn der fremde Halter-Prozess LEBT; release über einen toten Halter gelingt (ausgeführt: acquire, Prozessende, release aus neuem Prozess → exit 0). Der Code dokumentiert das als Absicht. (2) Zeilen 43-44: "Dependencies: mkdir, rmdir, rm, kill, date, printf, sleep, cat, head, grep" — das Skript nutzt zusätzlich sed (Z.87) und awk (Z.163).
---
Klasse 4/3, verifiziert (Ausführung + Code). Der tote Issue-Verweis im selben Header ist im Record "stash-lock-drei-tote-record-zitate" miterfasst. Analyse: circles/260801-1244-guard-rules-write/analyses/260805-1840-doku-gesamtpruefung-gegen-code.md
