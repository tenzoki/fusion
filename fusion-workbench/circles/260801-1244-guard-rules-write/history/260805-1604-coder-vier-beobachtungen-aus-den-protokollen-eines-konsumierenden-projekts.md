# Coder-Session — vier Beobachtungen aus den Protokollen eines konsumierenden Projekts

**Datum:** 2026-08-05 15:44–16:05
**Agent:** coder
**Circle:** `260801-1244-guard-rules-write`
**Dispatch:** Orchestrator, Nachschub zu den beiden Befunden aus `ec0561a`
**Status:** Complete

---

## Auftrag

Vier Punkte aufnehmen, die der Vorgänger in den Session-Protokollen eines konsumierenden
Projekts gefunden und in seinem Protokoll notiert hatte, ohne dass jemand sie als Befund
gemeldet hätte. Jeder bekommt einen Record, Issue oder Decision je nach Art. Behoben wird
nur, was ein Defekt ist. Kein Versionsbump, kein Commit, kein Neubau von `hooks/dist`.

Die Quelldateien liegen ausserhalb dieses Repositories
(`.../shared/fusion-plugin-findings/`), nur lesend genutzt.

## Einstufung

| # | Punkt | Einstufung | Ergebnis |
|---|---|---|---|
| 1 | Der sich selbst löschende Circle | offene Frage | Decision, nicht entschieden |
| 2 | Archivierte Circles in Playmakers Bestandsaufnahme | **Defekt** | behoben am Ort, Rest benannt |
| 3 | Derselbe Defekt zweimal gefiled | **Defekt** | Fix entworfen, nicht angewandt |
| 4 | `config_valid` verspricht "non-placeholder-ish" | **Defekt** | behoben, der Code wich |

Zwei Abweichungen von der Einschätzung des Dispatches: Punkt 2 ist ein Defekt und keine
offene Frage, Punkt 3 liess sich nicht abschliessen. Beides unten begründet.

## 1 — Der selbstlöschende Circle: offene Frage, wie eingeschätzt

Einverstanden mit dem Dispatch. Ein Defekt hätte einen Fix; hier stehen drei Wege offen,
und die Wahl gehört dem Nutzer.

Beim Ausarbeiten liess sich eine der drei Optionen ausschliessen. Ein neuer terminaler
Marker für "absichtlich entfernt" trägt in der vorliegenden Form nicht: der Marker sitzt
am Record, der Record wird mitgelöscht, und ein Marker an einer Datei, die es danach nicht
mehr gibt, hält nichts fest. Wer diesen Weg will, braucht zusätzlich einen Rest, der
bleibt — und hat damit die Archivierungs-Option in anderer Verpackung. Die Empfehlung im
Record ist entsprechend die Archivierung, mit der ausdrücklichen Einschränkung, dass sie
die Antwort überstimmt, die der Nutzer dem Shaper auf genau diese Rückfrage gegeben hat.

`260805-1548_*_wie-soll-ein-circle-verschwinden-duerfen-den-jemand-absichtlich-loescht.md`

## 2 — Archiv im Portfolio: Defekt, nicht offene Frage

Hier widerspreche ich dem Dispatch. Drei Befunde tragen die Einstufung:

`archive/` steht in keiner Leseliste des Playmakers. Sein `You MAY read`-Block nennt
`$SCAN_CIRCLES`, `bin/fusion-paths:280` löst den Schlüssel auf `circles` auf, und seine
Schritt-1-Enumeration (`find "$WORKBENCH/$SCAN_CIRCLES" -mindepth 2 -maxdepth 2`) kann den
Archiv-Store gar nicht erreichen. Er wurde also ausserhalb der Enumeration gelesen.

Der Abschnitt, in dem die zwölf landeten, heisst `## Archived (_s_ / _d_)` und ist nach
den zwei Markern in seiner Überschrift benannt. Alle zwölf tragen `_c_`. Der Abschnitt
meint superseded und deferred an lebenden Records; mit dem `archive/`-Store hat er nichts
zu tun.

Und die Frage "gehören eingefrorene Circles ins Portfolio" war schon beantwortet, als
jemand sie mit `/fusion:archive` aus dem Arbeitsstand nahm. Ungeschrieben war nur, was
dieser Akt für spätere Leser bedeutet.

**Die Wurzel ist dieselbe wie beim Setup-Lockout**, wie der Dispatch vermutet hat, aber
sie zeigt sich in die andere Richtung. Das Layout führte `archive/` mit genau einem
Kommentar: "`/fusion:archive` target". Setup las den Store und schloss aus 1146
eingefrorenen Dateinamen auf ein veraltetes Format — Fehlalarm. Playmaker las denselben
Store und schrieb seinen Inhalt in ein lebendes Briefing — Verunreinigung. Zwei
Konsumenten, dieselbe unausgesprochene Konvention, gegenläufige Fehler.

Behoben in `agents/playmaker.md`: die drei eingefrorenen Stores stehen im
`You may NOT`-Block, und der Portfolio-Abschnitt sagt jetzt, wonach er benannt ist.

**Der Rest, benannt statt weggelassen:** die allgemeine Aussage gehört in die
Konventionsdatei, die Autorenheimat des Layouts. Sie wurde geschrieben und wieder
zurückgenommen — siehe unten. Die Regel steht damit an zwei Orten als Prosa und nirgends
als Konvention.

`260805-1548_*_playmaker-liest-den-eingefrorenen-archiv-store-und-mischt-ihn-in-die-lebende-bestandsaufnahme.md`

## 3 — Doppeltes Filen: Defekt mit brauchbarer Formulierung, aber nicht anwendbar

Der Dispatch hat gefragt, ob es eine Formulierung gibt, die mehr nützt als sie kostet. Es
gibt sie, und sie hat drei Eigenschaften: ein `ls` über die offenen Records im Zielstore
(Namen lesen, Dateien nicht, konstante Kosten), bei Treffer eine angehängte Zeile statt
eines zweiten Records, und — die entscheidende — die ausdrückliche Gegenrichtung. Bei
Zweifel wird gefiled. Eine Dedup-Regel ohne diesen Satz baut den teureren Fehler ein: ein
verschluckter Defekt kostet mehr als ein Duplikat.

Belegt am eigenen Fall: dieser Record wurde nach der entworfenen Regel gefiled, die
Auflistung kostete einen Befehl und fand einen verwandten Befund
(`260801-1020_*_scan-keys-never-reach-the-archive-store.md`), kein Duplikat.

**Nicht angewandt.** `hooks/lib/__tests__/rules-emission-golden.test.ts` pinnt jede
Role-Cap auf den gemessenen Höchststand und lässt kein zusätzliches Byte in einer immer
geladenen Regeldatei zu. Ausführliche Fassung beider Absätze: 3936 Bytes an jedem der
sechzehn Agenten. Kürzeste tragfähige Fassung dieses Absatzes allein: rund 430. Beide
brechen die Suite. Der vom Test genannte Ausweg — ein Schnitt gleicher Grösse an anderer
Stelle — hätte begründeten Regeltext anderer Bearbeitungen getroffen; das ist ein
schlechterer Tausch als den Befund offen zu lassen.

Anders als bei Punkt 2 gibt es keinen kostenfreien Ort: die Filing-Pflicht gilt für jeden
Agenten, der filet.

`260805-1548_*_beim-filen-prueft-niemand-ob-der-store-denselben-defekt-schon-traegt.md`

## 4 — `config_valid`: der Code wich, nicht der Kommentar

Gemessen vor der Entscheidung, wie der Dispatch verlangt hat. Eine Wegwerf-workbench mit
der unveränderten Vorlage, `doctor` davor:

```
config valid:     yes (base=https://plane.example.com ws=your-workspace-slug project=00000000-0000-0000-0000-000000000000)
```

Damit war die Sache entschieden. `doctor` druckte die drei Werte und fasste sie als "yes"
zusammen; die vier nicht-`doctor`-Aufrufstellen (`:1061`, `:1161`, `:1206`, `:1448`)
gingen unmittelbar in einen Netzaufruf über, den diese Konfiguration nicht bestehen kann,
und meldeten dann "unreachable" oder "HTTP 404" — die falsche Ursache. Der Dry-Run-Pfad
ruft `config_valid` nicht auf.

Der Kommentar beschreibt, was die Funktion können muss, damit `260805-1436_*_die-replace-marker-im-plane-template-behaupten-nach-dem-ausfuellen-das-gegenteil.md` nicht
passiert. Und seit `260805-1436_*_die-replace-marker-im-plane-template-behaupten-nach-dem-ausfuellen-das-gegenteil.md` die Vorlage auf benannte Auslieferungswerte umgestellt
hat, ist er erfüllbar: es steht fest, welche drei Zeichenketten eine unausgefüllte Vorlage
trägt.

**Gleichheitstest, keine Heuristik** — das ist der Kern. `http://localhost:9999` und ein
vierbuchstabiger Slug *sehen aus* wie Platzhalter und sind eine laufende Konfiguration;
genau diese Lesart hat `260805-1436_*_die-replace-marker-im-plane-template-behaupten-nach-dem-ausfuellen-das-gegenteil.md` Geld gekostet. Der Test vergleicht gegen drei
bekannte Zeichenketten und gegen nichts sonst. Geprüft: die drei stehen seit `eb9cf59`
unverändert, `ec0561a` hat nur die Kommentare daneben geändert — der Test deckt jede je
ausgelieferte Vorlagenversion ab.

Nachher, dieselbe Wegwerf-workbench:

```
fusion-plane: config: base_url is still the template value 'https://plane.example.com' — set it to your Plane instance root
fusion-plane: config: workspace_slug is still the template value 'your-workspace-slug' — set it to your workspace slug
fusion-plane: config: project_id is still the template's all-zero UUID — set it to the target project's UUID
config valid:     NO — see the config: lines above
```

Und gegen die ausgefüllte Konfiguration dieses Repositories, unverändert gültig:

```
config valid:     yes (base=http://localhost:9999 ws=fusion-local project=8f0fc1f4-5efe-41ef-b1d8-fbc4194ca240)
```

`260805-1548_*_config-valid-verspricht-non-placeholder-ish-und-prueft-nur-auf-nicht-leere.md`

### Zwei Nebenwirkungen von Punkt 4

Der UUID-Lint schlug auf `TEMPLATE_PROJECT_ID` an. Ausnahme für die Null-UUID, mit
Begründung im Code: sie löst auf keiner Instanz ein Projekt auf und kann deshalb nie die
fest verdrahtete Kennung sein, die der Lint verbietet. Auf diese eine Zeichenkette
begrenzt, mit einem Kommentar, der die Ausweitung untersagt.

Das Test-Fixture trägt selbst die Null-UUID und wurde von der neuen Prüfung zu Recht
abgelehnt; vier Live-Pfad-Tests kippten von Exit 10 auf Exit 1. Das Fixture ist eine
`.yaml` und gehört `ontocoder` — nicht angefasst, stattdessen füllt `freshWorkbench()`
das Feld in der tmp-Kopie. Als Befund an `ontocoder` gefiled:
`260805-1548_*_der-plane-testfixture-traegt-den-platzhalter-den-config-valid-jetzt-ablehnt.md`

## Der Ratchet, als eigener Record

Zwei der vier Fixes sind am selben Mechanismus hängengeblieben, und das ist ein Befund für
sich. `ROLE_CAPS` ist heute (05.08.) als Ratchet entstanden, nach einer grossen
Partitionierung, und ist eine gute Regel: Regeltext ist eine Last, die jedes konsumierende
Projekt bei jedem Dispatch trägt. Aber Cap gleich Höchststand plus "may only ever be
LOWERED" heisst null Spielraum, und heute stand zum ersten Mal eine Erweiterung an, die
aus einem Befund kam statt aus Bequemlichkeit.

Die Frage — was passieren soll, wenn ein Befund Regeltext verlangt und kein ehrlicher
Schnitt danebenliegt — ist eine Budget-Entscheidung über eine geteilte Last und gehört dem
Nutzer. Ohne Empfehlung aufgenommen, mit der Messung als Beitrag.

`260805-1559_*_der-regeltext-ratchet-laesst-keine-erweiterung-zu-und-heute-war-die-erste-noetige.md`

## Geändert

| Datei | Änderung |
|---|---|
| `bin/fusion-plane` | drei Vorlagen-Konstanten, drei Ungleichheitsprüfungen in `config_valid`, präzisere `doctor`-Meldung |
| `hooks/lib/__tests__/fusion-plane.test.ts` | fünf neue Tests (Drift-Lint plus vier Verhaltenstests), Null-UUID-Ausnahme im UUID-Lint, `project_id`-Füllung in `freshWorkbench()` |
| `agents/playmaker.md` | eingefrorene Stores im `You may NOT`-Block; `## Archived (_s_ / _d_)` als markerbenannt klargestellt |

Geschrieben, gemessen und zurückgenommen: zwei Absätze in
`rules/fusion-workbench-conventions.md` (Layout, Filing). Begründung oben.

Nicht angefasst: Version (steht auf v5.9.1), `hooks/dist`, `templates/plane.config.yaml`,
das Plane-Test-Fixture, `skills/setup/SKILL.md`, die eigene
`fusion-workbench/plane.config.yaml`. Kein Commit, kein Push.

## Records

Sechs, für vier Auftragspunkte plus zwei bei der Arbeit entstandene:

| Datei | Art | Marker |
|---|---|---|
| `260805-1548_*_wie-soll-ein-circle-verschwinden-duerfen-den-jemand-absichtlich-loescht.md` | Decision | offen |
| `260805-1548_*_playmaker-liest-den-eingefrorenen-archiv-store-und-mischt-ihn-in-die-lebende-bestandsaufnahme.md` | Issue | geschlossen |
| `260805-1548_*_beim-filen-prueft-niemand-ob-der-store-denselben-defekt-schon-traegt.md` | Issue | offen |
| `260805-1548_*_config-valid-verspricht-non-placeholder-ish-und-prueft-nur-auf-nicht-leere.md` | Issue | geschlossen |
| `260805-1548_*_der-plane-testfixture-traegt-den-platzhalter-den-config-valid-jetzt-ablehnt.md` | Issue | offen, für `ontocoder` |
| `260805-1559_*_der-regeltext-ratchet-laesst-keine-erweiterung-zu-und-heute-war-die-erste-noetige.md` | Decision | offen |

**Zur Ablage.** Alle sechs liegen im Circle-Store, obwohl keiner aus dessen Directive
(guard-rules-write) stammt — die Herkunftsregel führte streng genommen nach `shared/`.
Der Vorgänger hat seine beiden Records derselben externen Charge im Circle abgelegt, und
eine Charge über zwei Stores zu verteilen wäre für den nächsten Reconciler teurer als die
Ablage-Feinheit. Die externe Herkunft steht in jedem Record im Text.

## Prüfung

`npx vitest run`: 1552 Tests in 27 Dateien, grün. Zuvor 1547; die fünf neuen liegen alle
in `fusion-plane.test.ts`, das damit von 55 auf 60 Tests geht.

`bin/fusion-plane` hat keine eigene Testdatei ausser dieser — die Angabe im Dispatch,
dort gebe es keine Abdeckung, trifft nicht zu: `hooks/lib/__tests__/fusion-plane.test.ts`
fährt das echte Skript über `child_process` gegen Wegwerf-workbenches. Die Messungen oben
sind zusätzlich von Hand gegen die echte Datei gelaufen, gegen zwei Konfigurationen: die
unveränderte Vorlage in einer Wegwerf-workbench und die ausgefüllte dieses Repositories.
