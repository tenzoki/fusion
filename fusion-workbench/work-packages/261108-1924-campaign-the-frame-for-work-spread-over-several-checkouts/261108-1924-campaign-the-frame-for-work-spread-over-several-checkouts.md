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

## Rulings on the planner's decisions

The user's words, verbatim (2026-11-09, after the plan was bound): „ok, alles wie empfohlen, autonom weiter“ — every one of the three decision records the planner filed is answered with its recommended option 1: `261108-2301-where-does-the-campaign-record-live-in-the-workbench-layout.md` (root entry `campaigns/<id>/campaign.json`, class R1, one writer), `261108-2301-which-value-does-a-claude-side-writer-put-in-a-prior-revision-field.md` (interim rule: SHA-256 over fusion's canonical JSON, Prior asked in request 80), `261108-2301-how-does-a-working-session-rebase-pull-over-the-log-row-the-lock-just-appended.md` (commit, fetch, read at the fetched ref, append the row, settle the log, rebase, push; no stash).

## Where the work lands until 13.4.4 is tagged

Request 79 in `codec/fixtures/prior/REQUESTS.md` tells Prior that until a tag `main` takes no commit to a shipped file after `438df715` other than that file; no tag `v13.4.4` exists and no answer to 79 is recorded. Plan steps 2 to 8 change shipped files. Put to the user on 2026-11-09 with three options (build on a branch `campaign` and leave `main` untouched until the tag; build on `main` and give the statement up; stop until the tag or Prior's answer), the user answered „1“: the work from plan step 2 on lands on the branch `campaign`, cut from `bcb7133d`, and is brought to `main` after the tag.

## Rulings after Prior's answer to request 80

Three questions were put to the user on 2026-11-09, each with its options and, at the user's request („Frage A und B unklar, erläutern, Empfehlung“), with the orchestrator's recommendation. The user's words, verbatim: „alle wie empfohlen“. The recommended option was 1 in each.

- **A, the build route to Prior's hashes.** `261109-1238-by-which-build-route-does-the-claude-side-writer-produce-priors-charter-hash-and-state-revision.md` is answered with option 1: the codec computes `charterHash` and `stateRevision` read-only and returns them on `show` of a campaign. The earlier ruling for the interim rule, `261108-2301-which-value-does-a-claude-side-writer-put-in-a-prior-revision-field.md`, is superseded by it before any campaign was written. The answer to Prior's condition on question 4 was given to the user to relay: confirmed, the helper reaches `codec/src/prior` through the shipped bundle once plan steps 13 and 16 have landed, and the interim rule is withdrawn. One point stays undetermined and goes into a re-pin request if one is asked: whether Prior's host tolerates the added member on the `show` answer.
- **B, the measured case against the spec's C2 criterion.** The two deviations stand as the plan's `## Open Questions` names them: `cut` is fed the own-lane areas of the lane analysis and not the cross-lane files, and it names one hand-off, the route edge, and not the project-header edge. The limit on files several lanes share is stated in `docs/campaign.md` with plan step 20; the spec is not revised.
- **C, the intervention delay.** Plan step 18 measured the gaps between commits of autonomous sessions (`261109-1515-commit-cadence-of-autonomous-sessions.md`): the 90th percentile is 137.8 minutes in the consuming project's log, 146.1 in fusion's and 139.8 pooled, above the 60 minutes the plan had set. The user accepts the measured figure as the delay with which a pause or a lane change reaches a working session. The user-facing phrase stays "at the holding session's next commit", with no time given, and plan step 19 may be dispatched.

## Ruling on campaign records valid before `lanes`

Plan step 10 made `lanes` a required root key, and one test outside the plan's list of expected failures turned red: the case in `codec/src/__tests__/round-trip-cli-takeover.test.ts` that holds Prior's condition on request 62, part 7, that every record valid at `031645d2` still validates. The four campaign fixtures of that commit carry no `lanes`. Put to the user on 2026-11-09 with three options (`lanes` stays required and the case is restated for the four campaign records; `lanes` becomes optional; nothing lands until Prior rules on the case it left open), the user answered „1“. `261109-1811-does-lanes-stay-a-required-key-when-campaign-records-valid-before-it-stop-validating.md` is answered with option 1: `lanes` stays required as Prior admitted it, plan step 13 restates the case as 82 records valid and the four campaign records refused for exactly the missing key, and the sentence "all 86 still validate" is corrected towards Prior in a re-pin request if one is asked. A campaign file stored before the change needs `"lanes": null` added by hand; nothing migrates one.

## Ruling on the re-pin request

After plan step 11 landed (`d3ad786d`), the user was asked on 2026-11-09 whether a re-pin request goes to Prior, with three options (write it now as request 81; after steps 16b and 17, when the host question is concrete; none). The user answered „1“: request 81 is written into `codec/fixtures/prior/REQUESTS.md` now, carrying what the plan's `## API Changes` lists for it and the correction of the old-records statement (82 of 86, the four campaign records needing `"lanes": null`), and the user relays it to Prior.

**Cross-references:** `261105-1156-campaign-as-the-frame-for-work-spread-over-several-checkouts.md`, `foreign:ax-k2-3:261101-1006-three-checkouts-work-the-pipeline-lanes-in-parallel.md`, `foreign:ax-k2-3:261031-1733-pipeline-work-dissected-into-parallel-checkout-lanes.md`
