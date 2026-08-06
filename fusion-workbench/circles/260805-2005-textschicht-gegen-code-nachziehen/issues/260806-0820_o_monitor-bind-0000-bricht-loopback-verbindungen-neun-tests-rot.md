# Monitor: Bind auf 0.0.0.0 bricht Loopback-Verbindungen anderer Prozesse — neun Tests rot

---
**Filed by:** coder (bei der Verifikation von Plan-Schritt 8/16 entdeckt; Ursache liegt außerhalb dieses Circles)
**Assignee:** coder
**Severity:** high (die Suite ist auf dieser Maschine nicht mehr grün; der Dashboard-Zugriff per localhost ist betroffen)
**Cross-references:** Commit `8586ba3` — "fix(monitor): bind 0.0.0.0 so the dashboard is reachable on the LAN" (HEAD zum Filing-Zeitpunkt); `bin/monitor` (Zeile ~1148, `ReuseServer(("0.0.0.0", PORT), Handler)`); `hooks/lib/__tests__/monitor-warnings-panel.test.ts` (alle 9 Tests, je ~16 s Timeout in `startMonitor`)

---

## Befund

Seit Commit `8586ba3` bindet der Monitor-Server auf `0.0.0.0` statt `127.0.0.1`. Auf dieser Maschine (macOS, Darwin 24.6.0) erreicht danach **kein anderer Prozess** den Server mehr über `127.0.0.1:<port>` — `curl` und `fetch()` laufen in einen Connection-Timeout (nicht "refused"). Folge: alle 9 Tests in `monitor-warnings-panel.test.ts` scheitern mit "monitor did not come up" (je 15 s Polling-Deadline), die Suite ist rot.

## Evidenz (gemessen, 2026-08-06, mit und ohne Sandbox identisch)

Minimales Zwei-Prozess-Experiment, python3 `ThreadingHTTPServer` + `curl` von außen:

- Bind `127.0.0.1`, Connect `127.0.0.1` vom Zweitprozess: **ok**.
- Bind `0.0.0.0`, Connect `127.0.0.1` vom Zweitprozess: **Timeout**.
- Bind `0.0.0.0`, Connect aus **demselben** Prozess: ok — deshalb fällt es dem Server selbst nicht auf.

Zuordnung (Inferenz, nicht verifiziert): Das Muster passt zur macOS-Local-Network-Privacy-Filterung, die Nicht-Loopback-gebundene Sockets unbestätigter Prozesse abschirmt. Die gemessene Dichotomie oben ist unabhängig von dieser Deutung reproduzierbar.

## Abgrenzung

Kein Zusammenhang mit den Änderungen dieses Tasks (Plan-Schritt 8/16: `bin/fusion-rules`, `bin/fusion-paths`, `bin/fusion-plugin-cwd`, Golden) — keine dieser Dateien ist Input des Monitor-Tests; der Fehler reproduziert mit unverändertem `bin/monitor` auf HEAD. Alle übrigen 26 Test-Dateien (1550 Tests) sind grün.

## Lösungsrichtung (dem Fixer überlassen)

Das LAN-Ziel von `8586ba3` und die lokale Erreichbarkeit kollidieren. Optionen: Bind-Adresse als Flag (Default `127.0.0.1`, LAN opt-in); Dual-Bind (zwei Sockets); oder der Test startet den Server mit erzwungenem Loopback-Bind, falls das LAN-Bind Default bleiben soll — dann bleibt aber der lokale `curl`-Zugriff des Users betroffen, nicht nur der Test.

---
Resolved: <set when status moves to _c_>
