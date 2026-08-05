`protected-path-internals.md` erreicht in Konsumprojekten einen Adressaten, den es dort nicht gibt

---

`bin/fusion-rules` emittiert `rules/protected-path-internals.md` (21 870 B) an coder, coderev und bugfixer, in jedem Projekt. Die Datei adressiert laut eigenem Schnittkriterium "whoever changes or reviews the classifier" (`bin/fusion-rules:58-64`, Entscheidung `decisions/260805-0709_i_wohin-gehoert-die-forensik-aus-protected-path-discipline.md`). In einem konsumierenden Projekt ändert und reviewt kein Agent den Klassifizierer: die Quellen liegen unter `$FUSION_PLUGIN_ROOT` außerhalb des Projektbaums und sind über `protectedPaths` zusätzlich geschützt. Die Zielgruppe ist dort leer, die Last fällt trotzdem an.

---

Gemessene Folge im aktiv genutzten Konsumprojekt krk (Event-Log, 80 Agent-Dispatches): coder ist mit 37 Dispatches der meistgenutzte Agent und lädt nach dem Update auf v5.9.x 111 766 B statt 105 354 B (+6,1 %), während die selten dispatchten Agenten sparen. Gewichtet mit dem echten Mix schrumpft die Ersparnis des gesamten Zuschnitts auf rund 3 % pro Dispatch. coder/coderev/bugfixer sind zudem drei der vier Rollen über dem `RELEASE_CAP` von 105 354.

Mechanisch begrenzbares Kriterium existiert: `hooks/lib/self-detect.ts` beantwortet bereits "ist cwd das Plugin-Repo". Emittiert `bin/fusion-rules` die Referenzdatei nur dort (oder zusätzlich, wenn ein Projekt sie per `context-manifest.yaml` anfordert), behalten die Fusion-Entwickler-Agenten alles und Konsumenten-coder verlieren nichts, was sie anwenden könnten; die Kerndatei behält ihre Zeigerzeile, die Datei bleibt auffindbar (S4-Diskoverierbarkeit).

Quelle: Analyse `analyses/260805-1830-zweck-nutzung-und-stand-des-plugins.md`, Befund 2 und 6.
