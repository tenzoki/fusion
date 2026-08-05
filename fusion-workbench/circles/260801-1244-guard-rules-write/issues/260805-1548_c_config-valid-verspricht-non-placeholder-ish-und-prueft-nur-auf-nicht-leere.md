config_valid verspricht "non-placeholder-ish" und prüft nur auf Nicht-Leere

---

`bin/fusion-plane:203` trug den Kommentar "Returns 0 if the required scalars are present
and non-placeholder-ish", und der Rumpf darunter testete drei Felder mit `[ -n … ]`. Eine
workbench, in der `templates/plane.config.yaml` unverändert liegt, hat drei nicht-leere
Felder und wurde damit als gültig gemeldet.

Gemessen, nicht angenommen. Eine Wegwerf-workbench mit der unveränderten Vorlage, gegen
`bin/fusion-plane doctor` vor der Änderung:

```
config valid:     yes (base=https://plane.example.com ws=your-workspace-slug project=00000000-0000-0000-0000-000000000000)
```

`config_valid` steht an fünf Stellen: dem Live-Zweig von `push` (`:1061`), `states`
(`:1161`), `map --prune` (`:1206`), `doctor` (`:1288`) und dem Live-Lesezweig von `seed`
(`:1448`). Der Dry-Run-Pfad (`--plan`) ruft es nicht auf. Alle vier nicht-`doctor`-Stellen
gehen unmittelbar in einen Netzaufruf über, den eine unausgefüllte Konfiguration nicht
bestehen kann — und die Fehlermeldung, die dann entsteht, nennt "unreachable" oder
"HTTP 404" und damit die falsche Ursache.

---

**Welche Seite weicht: der Code.** Der Kommentar beschreibt, was die Funktion tun muss,
damit der Vorfall aus `260805-1436` nicht passiert. Dort hielten zwei Agenten eine
ausgefüllte Konfiguration für eine leere, weil sie die `← REPLACE`-Kommentare in der Datei
lasen statt `doctor` zu fragen; einmal mit manueller Umgehung an einer echten Story.
`260805-1436` hat die Marker entfernt und die Vorlage darauf umgestellt, ihre eigenen
Auslieferungswerte zu benennen — damit steht jetzt fest, welche drei Zeichenketten eine
unausgefüllte Vorlage trägt, und der Kommentar wird erfüllbar.

**Die Prüfung ist ein Gleichheitstest, keine Heuristik.** Das ist der Kern, und die
Verwechslung wäre der teure Fehler: `http://localhost:9999` und ein vierbuchstabiger
Workspace-Slug *sehen aus* wie Platzhalter und sind eine echte, laufende Konfiguration.
Genau diese Lesart hat `260805-1436` Geld gekostet. Der Test vergleicht deshalb gegen die
drei bekannten Zeichenketten der Vorlage und gegen nichts sonst.

Geprüft: die drei Auslieferungswerte stehen seit `eb9cf59` (Anlage der Vorlage)
unverändert; `ec0561a` hat nur die Kommentare daneben geändert. Der Gleichheitstest deckt
damit jede je ausgelieferte Vorlagenversion ab.

---

**Resolved:** 260805-1548 — behoben.

- `bin/fusion-plane`: drei Konstanten (`TEMPLATE_BASE_URL`, `TEMPLATE_WORKSPACE_SLUG`,
  `TEMPLATE_PROJECT_ID`) und drei Ungleichheitsprüfungen in `config_valid`, jede mit
  eigener Meldung, die das Feld benennt. Die Meldung in `doctor` heisst nicht mehr
  "required fields missing" — das traf für den neuen Fall nicht zu — sondern verweist auf
  die `config:`-Zeilen darüber.
- `hooks/lib/__tests__/fusion-plane.test.ts`: fünf Tests. Der Drift-Lint hält die drei
  Konstanten an den tatsächlichen Werten von `templates/plane.config.yaml` fest — das ist
  die einzige Kopplung, die der Fix einführt, und ohne den Lint würde sie still veralten.
  Dazu je ein Test für die unveränderte Vorlage auf dem Live-Pfad und in `doctor`, einer
  für ein einzelnes unausgefülltes Feld neben zwei gefüllten, und einer für den
  Falsch-Positiv, der nie zurückkommen darf: localhost plus kurzer Slug bleibt gültig.

**Zwei Nebenwirkungen, beide bewusst.**

Der UUID-Lint (`fusion-plane lint guards: no hardcoded state UUID in the helper`) schlug
auf `TEMPLATE_PROJECT_ID` an. Er bekam eine Ausnahme für die Null-UUID, mit Begründung im
Code: sie löst auf keiner Instanz ein Projekt auf und kann deshalb nie die fest verdrahtete
Kennung sein, die der Lint verbietet. Die Ausnahme ist auf diese eine Zeichenkette
begrenzt, und der Kommentar sagt, dass sie nicht ausgeweitet werden darf.

Das Test-Fixture `hooks/lib/__tests__/fixtures/plane/workbench/plane.config.yaml` trägt
selbst die Null-UUID als `project_id` und wurde damit von der neuen Prüfung zu Recht
abgelehnt — vier Live-Pfad-Tests kippten von Exit 10 (deferred) auf Exit 1 (config). Das
Fixture ist eine `.yaml` und gehört `ontocoder`; es wurde nicht angefasst. Stattdessen
füllt `freshWorkbench()` in der Test-Datei das Feld in der tmp-Kopie. Der Ersatz für die
richtige Behebung steht als eigener Befund derselben Charge
(`260805-1548_o_der-plane-testfixture-traegt-den-platzhalter-den-config-valid-jetzt-ablehnt.md`).

**Gemessen nach der Änderung**, dieselbe Wegwerf-workbench:

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

---

**Herkunft.** Aufgenommen aus der Arbeit an `260805-1436` in einem konsumierenden
Kontext; der Punkt stand als Beobachtung ohne eigenen Record im Protokoll
`circles/260801-1244-guard-rules-write/history/260805-1440-coder-zwei-nachgeschobene-befunde-aus-einem-konsumierenden-projekt.md`
(Abschnitt "Beobachtungen aus den Protokollen, ohne eigenen Record", letzter Absatz).
