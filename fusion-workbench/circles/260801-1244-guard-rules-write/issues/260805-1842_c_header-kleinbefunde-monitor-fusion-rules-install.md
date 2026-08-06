Drei Header-Kleinbefunde: monitor nennt sich "monitor.sh" und unterschlägt zwei servierte Dateien; fusion-rules-Header nutzt Klammer-Marker; install.sh kopiert ein Phantom-Asset LICENSE
---
Schweregrad: niedrig (kosmetisch). (1) bin/monitor:2-3: nennt sich "monitor.sh" (Datei heißt monitor) und listet nur orchestrator-live.md + agentstate.yaml; serviert werden zusätzlich orchestrator-events.jsonl und .guard-state/events.jsonl (bin/monitor:72-75). (2) bin/fusion-rules:34-35: Marker in Klammer-Notation "[o]→[a]→[i]" — die v4-Vokabulare sind Unterstrich-Form, /fusion:migrate schafft die Klammerform ab. (3) install.sh:81: Kopierliste enthält LICENSE; die Datei existiert im Repo nicht (durch [ -e ]-Guard harmlos).
---
Klasse 5/2, verifiziert. Analyse: circles/260801-1244-guard-rules-write/analyses/260805-1840-doku-gesamtpruefung-gegen-code.md
---
Resolved: 2026-08-06 — Punkte (1) und (2) behoben: der monitor-Header nennt sich `monitor` und listet alle vier servierten Dateien (`bin/monitor:2-4`); der fusion-rules-Header nutzt die Unterstrich-Form. Commit 9a96466, Circle 260805-2005-textschicht-gegen-code-nachziehen (Plan-Schritt 12, Batch C). Punkt (3), der install.sh-LICENSE-Eintrag, bleibt bewusst offen als User-Entscheidung im Schwester-Record `260805-1839_o_install-sh-will-eine-license-kopieren-die-das-repo-nicht-hat.md` (Plan-Schritt 17).
