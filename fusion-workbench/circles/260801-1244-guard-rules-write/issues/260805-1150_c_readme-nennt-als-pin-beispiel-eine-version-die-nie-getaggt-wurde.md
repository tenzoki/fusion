# README nennt als Pin-Beispiel eine Version, die nie getaggt wurde

---

**Severity:** Low
**Domain:** code
**Filed by:** coder, während Schritt 6 des Ausstiegsplans (Release-Vorbereitung 5.9.0)
**Affects:** `README.md` Zeile 26
**Cross-references:**
`circles/260801-1244-guard-rules-write/planning/260804-2356_o_plan-ausstieg-kontextsteuer-und-auslieferung.md` Schritt 6,
`CLAUDE.md` → *Release process*, Schritt 5 und *HTTPS installer*

---

## Was falsch ist

`README.md:26` gibt als Beispiel für das Pinnen einer Release:

> Overrides: `FUSION_REF` (git ref, e.g. `FUSION_REF=tags/v5.3.0` to pin a release)

Es gibt kein Tag `v5.3.0`. Gemessen, lokal und am Remote:

```
v5.5.0  v5.5.1  v5.6.0  v5.7.0  v5.8.0
```

Das Taggen hat laut `CLAUDE.md` erst bei `v5.5.0` begonnen, und `v5.5.0` wurde nachträglich
auf seinen Release-Commit gesetzt. Alles darunter existiert als Tag nicht und hat nie
existiert. Wer die Zeile kopiert, bekommt einen fehlschlagenden Download, kein älteres
fusion.

## Warum das hier auffällt

Schritt 6 des Plans nennt genau diesen Defekt als Grund, `install.sh` mit anzufassen:
„weil dessen `FUSION_REF=tags/v<version>`-Beispiel sonst auf eine nie getaggte Version
zeigt". `install.sh` ist in dieser Session auf `v5.9.0` gezogen worden. `README.md` trägt
denselben Defekt, steht aber weder im Plan noch in der Drei-Flächen-Aufzählung von
`CLAUDE.md` (`plugin.json`, `marketplace.json`, `install.sh`-Kopfkommentar).

**Es sind also vier Versionsflächen, nicht drei.** Die Zählung in `CLAUDE.md` ist um eine zu
kurz, und weil `README.md` die Fläche ist, die ein Nutzer tatsächlich zuerst liest, ist es
die sichtbarste der vier.

## Was zu tun wäre

Zwei Änderungen, beide klein:

1. `README.md:26` auf die aktuelle Release-Version ziehen, mit demselben Rhythmus wie
   `install.sh`.
2. Die Aufzählung in `CLAUDE.md` (*Release process*, Absatz „drei Versionsflächen") auf
   vier erweitern, damit die Fläche beim nächsten Release nicht wieder übersehen wird.
   Andernfalls driftet sie garantiert erneut — sie ist zwei Jahre lang genau deshalb
   gedriftet.

## Warum nicht in dieser Session behoben

Der Dispatch benennt `plugin.json` und `install.sh` als die anzufassenden Dateien und
schließt mit „committe nichts". `README.md` und `CLAUDE.md` stehen nicht darauf; sie
unangekündigt in den Diff zu legen, den der Nutzer vor dem Push liest, wäre die falsche
Reihenfolge. Der Befund ist gemeldet, die Änderung ist eine Zeile plus ein Halbsatz.

---
Resolved: 2026-08-06 (reconciler, workbench-wide pass) — beide geforderten Änderungen liegen an HEAD `cde5319` vor. (1) `README.md:26` nennt `FUSION_REF=tags/v5.9.2`; der Tag existiert (`git tag -l`), Commits `4a8fea0` (install.sh + Tag) und `9a96466` (README, Textschicht Batch B; Duplikat-Befund `260805-1840_*_readme-fusion-ref-beispiel-zeigt-auf-ungetaggte-version.md` dort geschlossen). (2) `CLAUDE.md:94` zählt jetzt **vier** Versionsflächen, README.md eingeschlossen (ebenfalls `9a96466`).
