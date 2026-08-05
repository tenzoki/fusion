Der Circle-Datensatz dieses Circles widerspricht seinem eigenen Marker und führt keinen Turn log

---

`circles/260801-1244-guard-rules-write/_t_circle.md` trägt an HEAD `**Status:** anticipated` (Zeile 5) auf einem `_t_`-Record, `**Active session history:** (none yet)` neben 57 History-Dateien im eigenen Verzeichnis, und einen leeren `## Turn log` nach mindestens elf Turns, zwei Plänen und einem Release. Das Konventions-Template verlangt einen Append-only-Turn-log und einen bei Aktivierung nachgeführten Status (`rules/circle-records.md`).

---

Der Kontrast macht den Befund scharf: krk hat dieselbe Defektklasse in seinem eigenen Circle binnen Stunden gefilt und behoben (`260802-1417_c_circle-datensatz-status-widerspricht-dem-marker.md`). Im Plugin-Repo, wo der Schreib-Guard stillsteht und der Sitzungsdruck hoch war, hielt die Konvention nicht. Wer diesen Circle später liest, findet die Turn-Geschichte nur über die History-Dateien, nicht über den Record, der genau dafür da ist.

Behebung vor der Schließung des Circles: Status nachziehen, Active spec/plan auf den Ausstiegsplan zeigen lassen, Turn log aus den Orchestrator-Histories rekonstruieren (mindestens die Turn-Grenzen mit Commit-Spannen und Coherence-Verdikten).

Quelle: Analyse `analyses/260805-1830-zweck-nutzung-und-stand-des-plugins.md`, Befund 7.
