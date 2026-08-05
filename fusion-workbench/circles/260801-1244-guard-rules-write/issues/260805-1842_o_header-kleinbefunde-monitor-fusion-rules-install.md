Drei Header-Kleinbefunde: monitor nennt sich "monitor.sh" und unterschlägt zwei servierte Dateien; fusion-rules-Header nutzt Klammer-Marker; install.sh kopiert ein Phantom-Asset LICENSE
---
Schweregrad: niedrig (kosmetisch). (1) bin/monitor:2-3: nennt sich "monitor.sh" (Datei heißt monitor) und listet nur orchestrator-live.md + agentstate.yaml; serviert werden zusätzlich orchestrator-events.jsonl und .guard-state/events.jsonl (bin/monitor:72-75). (2) bin/fusion-rules:34-35: Marker in Klammer-Notation "[o]→[a]→[i]" — die v4-Vokabulare sind Unterstrich-Form, /fusion:migrate schafft die Klammerform ab. (3) install.sh:81: Kopierliste enthält LICENSE; die Datei existiert im Repo nicht (durch [ -e ]-Guard harmlos).
---
Klasse 5/2, verifiziert. Analyse: circles/260801-1244-guard-rules-write/analyses/260805-1840-doku-gesamtpruefung-gegen-code.md
