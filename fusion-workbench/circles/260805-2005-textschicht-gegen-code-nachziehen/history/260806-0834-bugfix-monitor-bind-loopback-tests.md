# Bugfix: monitor 0.0.0.0-Bind macht die 9 Warnings-Panel-Tests rot

**Date:** 2026-08-06 08:34
**Status:** Complete
**Trigger:** User report (Issue `260806-0820_*_monitor-bind-0000-bricht-loopback-verbindungen-neun-tests-rot.md`)

## Error

Seit Commit `8586ba3` (Monitor bindet `0.0.0.0` statt `127.0.0.1`, absichtlich, für LAN-Erreichbarkeit) scheitern alle 9 Tests in `hooks/lib/__tests__/monitor-warnings-panel.test.ts` mit "monitor did not come up": der Cross-Prozess-`fetch` auf `http://127.0.0.1:<port>` läuft in einen Connection-Timeout. Die Suite war ~90 Minuten vor dem Kippen grün, dann konsistent rot.

## Root Cause

`bin/monitor:1148` (vor dem Fix): `ReuseServer(("0.0.0.0", PORT), Handler)`.

Gemessen (Zwei-Prozess-Experimente, mit und ohne Sandbox identisch):

- Bind `127.0.0.1` → Kernel-Socket-Zustand **LISTEN**, Cross-Prozess-Connect ok.
- Bind `0.0.0.0` → Kernel-Socket-Zustand **CLOSED** (nie LISTEN; `netstat -an` und `lsof` zeigen `*:<port> (CLOSED)`), eingehende SYNs werden verworfen → Timeout, auch von 127.0.0.1 und von der LAN-IP.
- Bind explizite LAN-IP (`192.168.178.126`) → ebenfalls **CLOSED**.
- Same-Process-Connect auf den 0.0.0.0-Bind funktioniert — deshalb merkt der Server selbst nichts.

Ausgeschlossen: Application Firewall (`socketfilterfw --getglobalstate`: disabled), System-/Network-Extensions (`systemextensionsctl list`: 0), Dritt-Filter-Daemons (keine). Die Sandbox des Bash-Tools ist es nicht (unsandboxed reproduziert identisch).

Der Kernel selbst weigert sich, einen Nicht-Loopback-Listener in LISTEN zu nehmen — das ist das dokumentierte Verhalten der macOS-Local-Network-Privacy-Schicht für Prozesse, deren verantwortliche App keine "Lokales Netzwerk"-Berechtigung (mehr) hat (Zuordnung zur TCC-Berechtigung: Inferenz; die CLOSED/LISTEN-Dichotomie und alle Ausschlüsse: gemessen). Das Grün-dann-Rot-Kippen passt zu einem Wechsel dieses Berechtigungszustands der Terminal-App (speculation: Prompt weggeklickt, Reset oder App-Neustart).

Konsequenz: kein Test-Harness kann einen Nicht-Loopback-Listener auf dieser Maschine zuverlässig erreichen; der Fix muss den Test-Bind auf Loopback bringen, ohne den LAN-Default anzutasten.

## Fix

Bind-Adresse konfigurierbar über die Umgebungsvariable `MONITOR_BIND`, Default `0.0.0.0` (LAN-Verhalten von `8586ba3` unverändert). Der Test-Harness startet den Monitor mit `MONITOR_BIND=127.0.0.1` — Loopback-Binds sind von der OS-Filterung ausgenommen, die Tests sind damit deterministisch, unabhängig vom Berechtigungszustand der Terminal-App.

| File | Change |
|------|--------|
| `bin/monitor:24-26` | Usage-Text: `MONITOR_BIND`-Hinweis (Default `0.0.0.0`, `127.0.0.1` für loopback-only) |
| `bin/monitor:74` | Python liest `BIND = sys.argv[6]` |
| `bin/monitor:1155-1177` | `ReuseServer((BIND, PORT), …)` statt hartem `"0.0.0.0"`; LAN-URL-Zeile entfällt bei Loopback-Bind (sie wäre gelogen); Begründungskommentar |
| `bin/monitor:1189` | Launcher übergibt `"${MONITOR_BIND:-0.0.0.0}"` als argv[6] |
| `hooks/lib/__tests__/monitor-warnings-panel.test.ts:97-115` | `startMonitor` spawnt mit `env: { ...process.env, MONITOR_BIND: "127.0.0.1" }`, mit Kommentar warum |

Kein weiterer Konsument betroffen: nur dieser Test spricht `bin/monitor` über HTTP an (geprüft per grep über `*.ts`/`*.md`/`*.sh`; alle anderen Treffer sind Protected-Path-Fixtures).

## Verification

- [x] Original error resolved — 9/9 Tests grün, zweimal hintereinander (2.96s / 2.53s statt 15s-Timeouts)
- [x] Full test suite passes — 27 Dateien, 1559/1559 grün
- [x] No regressions introduced — Default-Bind bleibt Wildcard: `lsof` zeigt `TCP *:47399` ohne `MONITOR_BIND`; mit `MONITOR_BIND=127.0.0.1`: `TCP 127.0.0.1:47398 (LISTEN)`, `curl` liefert HTTP 200

## Unrelated Issues Found

None. (Rest-Hinweis, kein Repo-Defekt: der LAN-Zugriff des echten Dashboards bleibt auf dieser Maschine blockiert, bis die Terminal-App unter Systemeinstellungen → Datenschutz & Sicherheit → Lokales Netzwerk freigegeben ist — im Resolved-Footer des Issues festgehalten.)
