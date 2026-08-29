# Setup sperrt sich selbst aus, weil die Klammer-Sonde eingefrorene Stores mitliest

---

**Severity:** High
**Domain:** code
**Filed by:** coder, aus einem Befund eines konsumierenden Projekts (Nachschieben nach v5.9.0)
**Affects:** `skills/setup/SKILL.md` Schritt 0, dritte Sonde des Pre-v4-Blocks
**Herkunft:** Extern gemeldet. Quelldateien liegen ausserhalb dieses Repositories unter
`.../shared/fusion-plugin-findings/`:
`260801-0113_*_setup-pre-v4-detector-scans-archive-and-migration-backup.md`
(der ueberlebende Record) und `260801-2257_*_fusion-setup-pre-v4-check-false-positive-on-archive.md`
(als Duplikat geschlossen, Inhalt in den ersten eingefaltet).
**Cross-references:** `skills/log-activity/SKILL.md:79` (Praezedenz der Ausschlussmenge),
`skills/migrate/SKILL.md:52,85` (bereits korrekt auf `shared/` und `circles/` begrenzt)

---

## Was falsch war

Die dritte Sonde des Pre-v4-Blocks durchsuchte den gesamten workbench-Baum nach Dateinamen
im alten Klammer-Marker-Format, ohne jede Ausnahme:

```
BM="$(find "$WB" -type f -name '*[[]*[]]*.md' 2>/dev/null | head -1)"
```

Eingefrorene Stores tragen die Dateinamen weiter, die sie beim Einfrieren hatten. Ein
Projekt, das jemals `/fusion:archive` auf Inhalt vor der Unterstrich-Umstellung laufen
liess, traegt Klammer-Marker dauerhaft — und keiner davon ist lebend.

Im meldenden Projekt: 1146 Treffer, 941 unter `archive/`, 205 unter
`.migration-v2-backup/`, null ausserhalb. Die lebende workbench war vollstaendig im
Container-Layout, die anderen beiden Sonden feuerten nicht. Zweimal beobachtet, an zwei
Tagen, beide Male Plugin-Version 5.7.0 — ein stehender Defekt, kein transienter Zustand.

## Warum es schwerer wiegt als seine Groesse

`/fusion:setup` ist der verpflichtende erste Schritt jeder Orchestrator-Session, und die
Sonde laeuft **vor** dem `mkdir`. Ein Projekt, das hier haengenbleibt, startet keine
Session sauber. Die Begruendung der Verweigerung ("die workbench waere ueber zwei Layouts
verteilt") trifft in diesem Fall nicht zu.

Die Weiterleitung schliesst den Kreis zur Sackgasse: `/fusion:migrate` begrenzt seine
eigene Suche laengst auf `shared/` und `circles/` (`skills/migrate/SKILL.md:52,85`) und
meldet folgerichtig "nichts — bereits im aktuellen Format". Setup verweigert beim naechsten
Lauf erneut. Beide beobachtenden Sessions kamen nur heraus, indem sie die Verweigerung von
Hand uebergingen.

Haette die Migration auf diesen Treffern gearbeitet, haette sie archivierte Dateinamen
umgeschrieben — genau das, was ein Archiv ausschliesst.

## Die anderen beiden Sonden

Geprueft, mitgemessen, kein Handlungsbedarf. Die Typordner-Sonde testet `$WB/<ordner>`
direkt, also greift ein archiviertes `archive/<batch>/planning/` nie. Die Circle-Datei-Sonde
laeuft mit `-mindepth 1 -maxdepth 1` unter `circles/`, waehrend eingefrorene Circles unter
`archive/<batch>/circles/…` oder `stashes/<id>/circle/` liegen. Beide sind durch ihre
Konstruktion begrenzt. Die Klammer-Sonde war die einzige der drei, die den ganzen Baum
laeuft.

---

Resolved: Die Sonde nimmt jetzt `archive/`, `stashes/` und `.migration-v2-backup/` aus,
nach dem Vorbild von `/fusion:log-activity` Schritt 3. `stashes/` steht aus demselben Grund
in der Liste wie die beiden gemeldeten: ein Stash ist ein eingefrorener Schnappschuss, und
einer, der vor der Marker-Umstellung genommen wurde, loeste dieselbe falsche Verweigerung
aus. `.migration-v2-backup/` ist ein fusion-eigenes Artefakt — die zurueckgezogene
`/fusion:migrate-workbench-v2` (v2.3–v2.5) legte es als Rollback-Kopie an.

Der Fix traegt seine Begruendung im Text: `skills/setup/SKILL.md` erklaert vor dem Block,
warum die drei Stores ausgenommen sind und warum die anderen beiden Sonden keine Ausnahme
bekommen duerfen. Ohne diese Begruendung nimmt der naechste Umbau die Ausschluesse wieder
heraus.

Gemessen an einer Wegwerf-workbench (eingefrorene Klammer-Dateien unter `archive/`,
`stashes/` und `.migration-v2-backup/`, daneben eine saubere lebende Struktur), Block
verbatim aus dem Skill extrahiert, die Vorher-Variante daraus durch Entfernen der drei
Ausschluesse abgeleitet:

| Fall | vorher | nachher |
|---|---|---|
| nur eingefrorene Stores tragen Klammer-Marker (der gemeldete Fall) | `OLD=1` | `OLD=0` |
| Klammer-Marker im lebenden `shared/` | — | `OLD=1` |
| Klammer-Marker in einem lebenden Circle | — | `OLD=1` |
| flache Circle-Datei im alten Format (Sonde 2) | — | `OLD=1` |
| Typordner in der Wurzel (Sonde 1) | — | `OLD=1` |
| archivierter Typordner, sonst sauber | — | `OLD=0` |
| gar keine workbench | — | `OLD=0` |

Die Sonde ist geschaerft, nicht abgeschaltet. `npx vitest run`: 1547 Tests in 27 Dateien,
gruen.
