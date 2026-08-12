# Raw observations, hand-written by the user: about a dozen distinct ideas in one dump, awaiting consolidation by the playmaker

 fusion-workbench/circles/260801-1244-curator/_a_circle.md


Die drei am häufigsten geänderten Dateien laut Churn-Ranking: hooks/lib/__tests__/rules-emission-golden.test.ts, hooks/lib/domain-cascade.ts, hooks/lib/__tests__/domain-cascade.test.ts.


Fusion:

- setup  dauert viel zu lange
- Fusion ist geschwätzig, viel zu viel Geschwafel (betrifft fast alle Agenten)
- sämtliche Operationen dauern unerträglich lange
- Regeln werden wirkungslos mit der Zeit (midsession)
- ETA wird nicht berechnet
- localhost funktioniert nicht mehr - gleich ip versuchen?


- Specs, Analysis, and other files: render as absolute path, use project specific enc var, pointing to project root <FUSION_PROJECT_ROOT>, which needs to be set per terminal,, ideally those giving fusion start script (pwd). Aim. allowing editor to directly open the file with default text/markdown editor.

Orchestrator:

- Zu ungenau, Anweisungen an andere Agenten oft fehlerhaft. 
Vermuteter Grund: Regeln etc werden einmal geladen, dann arbeiten Subagenten oft 30-200 Minuten und vergessen die Regeln. Vermutlich gilt das Geliche für Projektziele bzw. Circle Ziele.

- Fusion ist dauernd damit beschäftigt, die eigenen Fehler auszubessern. Die produktive Arbeit am Projekt tritt in den Hintergrund.

>>> Memory muss bei jedem Request mitgesendet werden. Die Agenten dürfen keine langen Operationen ausführen ohne zu Fusion zurückzukehren.

Beispiel 1 (von vielen):

```Der Korpus steht. 385 Titel, viermal dekodiert bis die Sache stimmte, jetzt Fließkomma, 51,8 GiB, null Kappungen über 13,9 Milliarden Abtastwerte gemessen. Die Abhängigkeit vom Google-Drive-Mount ist weg. 374 GiB frei.

Der Generierungs-Einstiegspunkt läuft und ist gegen die Referenzimplementierung bitgleich. Die Verkettung ist gemessen, nicht behauptet: Nahtstellen-Abstände 0,009 bis 0,170 gegen 0,229 bis 0,489 bei einem echten Neustart, ohne Überlappung der beiden Verteilungen.

Was ich aus diesem Turn mitnehme, und es ist unangenehm: von den bisher rund achtzehn gefundenen Mängeln stammt kein einziger aus dem Plan-Lesen. Alle kamen aus dem Ausführen. Der Plan war viermal überarbeitet, zweimal diagrammgeprüft, zweimal abgeglichen — und die Wirklichkeit hat trotzdem gefunden, dass 24 Bit die Kappung nicht beseitigt, dass jeder Clip auf Stille ausblendet, dass die Clip-Obergrenze 384 statt 380 Sekunden ist, und dass dreizehn Adapter das Modell unter seine eigene Abbruchgrenze drücken.

Zweimal habe ich dabei ungeprüfte Behauptungen an dich weitergegeben, und beide Male hat ein Agent sie beim Ausführen widerlegt. Ich prüfe inzwischen nach, aber das Muster ist meins, nicht deren.```


Beispiel 2:

```Die Verteilung deines Korpus, die ich dir in der ersten Sitzung genannt habe, war falsch. Ich hatte sie aus den Ordnernamen gezogen — das sind Interpretenangaben, nicht Komponisten. Die jetzt ausgelesenen Tags widersprechen ihr bei 262 von 385 Titeln.
```

Beispiel 3:

```## Schalter geworfen
  Netto-negativ: zwei Turns in Folge mehr Defekte erzeugt als geloest.
  Die Warteschlange ist zugleich konvergiert, 8 von 8 erledigt.```

Beispiel 4:
``` The discipline you bound in CLAUDE.md this session failed its first test. The reviewer filed four defect records immediately afterwards, and not one carries a Class: block. The bullet is an instruction, not a mechanism, and the next agent to file simply did not apply it.```


Beipiel 5:

Mein Request: "Ich suche die Abnahmekriterien von C3 und die von C1, C2 und C4"

Dann der absurde Reply: 
```
  Ran 1 shell command

41 Kriterien insgesamt. Nützlicher als die Liste ist die Aufteilung — welche du am Bündel prüfen musst und welche die Proben schon halten. Die führt der Plan.

  Ran 1 shell command

Die praktisch nützliche Aufteilung: von den 41 Kriterien musst du 10 am Bündel prüfen. Die übrigen 31 hängen an S1 bis S3 und werden von Proben gehalten — die siehst du beim Durchlesen der erzeugten Datei ohnehin mit.

Was nur du prüfen kannst

Vorbereitung: make bundle && open target/KRK.app

┌─────┬─────────────────────────────────────────────────────────────────────────────────────────┬─────────────┐
│  #  │                                        Zu prüfen                                        │  Fähigkeit  │
├─────┼─────────────────────────────────────────────────────────────────────────────────────────┼─────────────┤
│ 1   │ Der Eintrag steht im Menü KRK, vor dem Beenden, und rechts vom Titel steht nichts       │ C1          │
├─────┼─────────────────────────────────────────────────────────────────────────────────────────┼─────────────┤
│ 2   │ Ein Klick schreibt die Datei und meldet den vollen Pfad in der Statuszeile              │ C1, C4      │
├─────┼─────────────────────────────────────────────────────────────────────────────────────────┼─────────────┤
│ 3   │ Der Aufruf hält die Oberfläche nicht an: danach bewegt sich die Auswahl, ein Tabwechsel │ Zeitzusagen │
│     │  geschieht                                                                              │             │
├─────┼─────────────────────────────────────────────────────────────────────────────────────────┼─────────────┤
│ 4   │ Der Eintrag ist auch auswählbar, wenn kein Dateifenster den Fokus hält                  │ C1          │
├─────┼─────────────────────────────────────────────────────────────────────────────────────────┼─────────────┤
│ 5   │ Der Eintrag ist auswählbar, während die Belegungsansicht als Blatt steht                │ C1          │
├─────┼─────────────────────────────────────────────────────────────────────────────────────────┼─────────────┤
│ 6   │ In dieser Lage: die Datei trägt den gesicherten Stand, nicht deine ungesicherte         │ C3          │
│     │ Zuweisung                                                                               │             │
├─────┼─────────────────────────────────────────────────────────────────────────────────────────┼─────────────┤
│ 7   │ In dieser Lage: ist die Meldung überhaupt sichtbar, oder verdeckt das Blatt die         │ C4          │
│     │ Statuszeile?                                                                            │             │
├─────┼─────────────────────────────────────────────────────────────────────────────────────────┼─────────────┤
│ 8   │ Zeigt macOS beim ersten Schreiben eine TCC-Rückfrage, und wie sieht sie aus?            │ C2          │
├─────┼─────────────────────────────────────────────────────────────────────────────────────────┼─────────────┤
│ 9   │ Wenn du sie ablehnst: keine Datei, ein Grund in der Statuszeile, kein Absturz, keine    │ C2          │
│     │ stumme Rückkehr                                                                         │             │
├─────┼─────────────────────────────────────────────────────────────────────────────────────────┼─────────────┤
│ 10  │ Keine der zehn Zeitzusagen aus C8 ist berührt                                           │ Zeitzusagen │
└─────┴─────────────────────────────────────────────────────────────────────────────────────────┴─────────────┘

Punkt 5 und 7 hängen zusammen und sind die interessantesten. Sagt Punkt 5 „nicht auswählbar", dann ist der ganze Abweichungsfall bei offener Belegungsansicht gar nicht erreichbar, und die Punkte 6 und 7 entfallen — der Spec sagt das ausdrücklich und verlangt, es zu prüfen statt anzunehmen. Sagt Punkt 7 „das Blatt verdeckt die Statuszeile", dann bist du nach einem Aufruf aus dieser Lage ohne jede Rückmeldung, und der Spec verlangt, das vor der Abnahme zu berichten statt hinzunehmen.

Punkt 8 ist neu belegt. KRK löst die Downloads-Rückfrage vermutlich schon beim Anzeigen des Ordners aus, seit Runde 1 — dann siehst du sie beim Schreiben gar nicht mehr. Das ist kein Fehlschlag, sondern der erwartete Fall; wichtig ist, dass der Text jetzt das Schreiben mitnennt.

Beim Durchlesen der Datei

Am ehesten fallen dir hier Abweichungen auf: drei Spalten je Zeile, neun Abschnitte nach Funktionsbereich, Kombinationen in der Form Shift+Cmd+K und F3, und in der dritten Spalte die Dreiteilung — Alles auswählen leer, Rückgängig/Wiederholen „Editor", die drei übrigen Textbefehle „Textfelder und Editor".

Zwei Mängel in der Zuordnungstabelle des Plans, die mir dabei aufgefallen sind:

- Sie führt 40 Zeilen, der Spec hat 41 Kriterien. Es fehlt das neue über die fünfte Zelle („von KRK nicht eingeordnet"), das mit der Berichtigung von C3 dazugekommen ist.
- Eine Zeile trägt noch den Wortlaut vor der Berichtigung: „Die sechs Textbefehle tragen ‚Textfelder und Editor'". Genau das ist widerlegt.

Soll ich beides nachziehen, bevor du S4 fährst?

Details: Spec planning/260811-0753_o_spec-*.md, Kriterien unter ### C1 bis ### C4. Zuordnung im Plan planning/260811-0838_o_plan-*.md unter „Welcher Schritt welches Abnahmekriterium bedient".

✻ Brewed for 1m 15s

```

Die richtige und angemessene Antwort hätte etwa so ausgesehen:
"fusion-workbench/circles/260809-2040-tastenbelegung-als-markdown-in-downloads/planning/260811-0753_o_spec-tastenbelegung-als-markdown-in-downloads.md
Abschnitte ### C1 bis ### C4."



----

Ist Fusion ein token- und zeitfressendes Monster geworden, das sich nur noch um sich selbst dreht?
Wie können wir fusion radikal vereinfachen?
Wie können wir sicher stellen, dass die innerhalb der Modelle laufenden loops kürzer werden, so dass die Agenten durch immer wieder neu injizierte Regeln und Ziele nicht entgleisen?
