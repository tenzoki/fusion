# The campaign becomes the Claude-side frame for work spread over several checkouts

## Directive

The user's words, verbatim (2026-11-08):

> Auftrag: Erweiterung „Kampagne" anstoßen
>
> Bedarf: Eine Menge von Arbeitspaketen wird von mehreren Checkouts (4 bis 7) parallel abgearbeitet. Dafür fehlen in fusion drei Dinge:
> 1. Planung: Berechnung sinnvoller Gruppen von Arbeitspaketen über den ganzen Bestand (wie viele Gruppen, was jede enthält) und der Reihenfolge innerhalb jedes Checkouts. /fusion:wp-order liefert heute nur die Reihenfolge über alle Pakete, ohne Gruppen und ohne Halter.
> 2. Übergeordneter Ablaufmonitor über alle Checkouts, mit Meldungen, die ein Nutzer versteht.
> 3. Steuerung: Eingriff, wenn der Nutzer Diskrepanzen zwischen Agentengruppen erkennt und auflösen muss.
>
> Rahmen: Das Konzept heißt Kampagne. Es ist im geteilten Codec bereits typisiert (codec/schemas/campaign.schema.json, fusion.campaign/v1) und von Prior implementiert, auf der Claude-Seite aber von keinem Code genutzt. Es soll der eine Rahmen für diese Arbeit werden, kein zweites Konzept daneben. Die steuernde Rolle übernimmt der Orchestrator in einem eigenen Checkout, der selbst kein Paket hält.
>
> Grundlage: fusion-workbench/shared/consultations/261105-1156-campaign-as-the-frame-for-work-spread-over-several-checkouts.md (Status Complete; Abschnitte Analysis 1 bis 7, Recommendations 1 bis 6, acht offene Fragen).
>
> Erste Schritte, in dieser Reihenfolge:
> a) Entscheidungseintrag über den analyst (Typ 7): Die Kampagne wird auf der Claude-Seite der Rahmen für Arbeit über mehrere Checkouts. Im selben Eintrag werden drei Festlegungen als abgelöst festgehalten (Bericht, Abschnitt 6):
>    - Sichtbarkeit fremder Checkouts nur als Präsenz, kein Lesen fremden Laufzustands (260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md, Antworten 4 und 5, Out of scope).
>    - „Kein Agent behauptet eine Rangfolge, kein Feld hält eine" (fusion-workbench-conventions.md ## Work packages, aus 260909-1808_*_may-a-helper-compute-an-order-over-work-items-after-the-portfolio-layer-goes.md).
>    - Sitzungen tauschen Arbeit nur über den Nutzer aus (README-agents.md:391, Wegfall des Bus-Protokolls in v3.15.0).
> b) Arbeitspaket anlegen und den requirements-designer die Spezifikation schreiben lassen. Eingaben: der Bericht und die beiden Aufzeichnungen des Kundenprojekts ax-k2-3 (Spurenplan 261101-1006, Spurenanalyse 261031-1733). Fixpunkte aus Recommendation 4 übernehmen.
> c) Formatfragen vor dem Plan an Prior stellen (codec/fixtures/prior/REQUESTS.md): Feld für berührte Bereiche je Paket, Gruppenzugehörigkeit, ein Feld, das eine Sitzung anhalten kann.
> d) Baureihenfolge: zuerst die Übersicht (nur lesend), dann die Planung, dann die Steuerung.
>
> Zu klären mit mir: die acht offenen Fragen am Ende des Berichts, vor allem Gruppierungsebene, Lesepunkt einer laufenden Sitzung und Priors Zwei-Schreiber-Grenze.

The item is reached when the campaign is the one frame on the Claude side for work spread over several checkouts: a recorded decision adopting it and superseding the three rulings named above, a specification with the fixed points of the report's Recommendation 4, the format questions put to Prior before the plan, and the overview, the planning and the steering built in that order.

## Mode

The user's words, verbatim (2026-11-08, after approving the specification at its second review): „1, im automodus, und anschließend im automodus implementieren“ — plan now in autonomous mode, then implement in autonomous mode. `mode` is set to `autonomous` on this sentence.

**Cross-references:** `261105-1156-campaign-as-the-frame-for-work-spread-over-several-checkouts.md`, `foreign:ax-k2-3:261101-1006-three-checkouts-work-the-pipeline-lanes-in-parallel.md`, `foreign:ax-k2-3:261031-1733-pipeline-work-dissected-into-parallel-checkout-lanes.md`
