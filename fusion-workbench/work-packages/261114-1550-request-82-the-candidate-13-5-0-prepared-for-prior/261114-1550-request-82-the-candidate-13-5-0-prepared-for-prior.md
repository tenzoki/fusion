# Request 82, the candidate 13.5.0, is prepared for Prior and filed once Prior's pin commit is named

## Directive

Prior has answered requests 79 and 81; its codec pin moves next, and after that move Prior's host refuses every bundle carrying the old codec. This item prepares fusion's request 82 to Prior: the bundle of fusion 13.5.0, built from the tag `v13.5.0`, with its digest, what changed from 13.4.4 (the campaign first), the items Prior is asked to rule on, the hook comparison deferred at 13.4.4, and what fusion does with the answer. The request is prepared here and filed in `codec/fixtures/prior/REQUESTS.md` only after Prior's pin commit has been named by the user, and it names that commit. When the user passes Prior's pin commit, the item also records it in the request log, which closes question 1 of request 81, and fusion's Go copy takes `campaign.json` as the fourth control-file name. The item is reached when request 82 is committed and pushed on `main`, naming Prior's pin commit, and its commit and the file's digest are reported to the user. Nothing in Prior's repository is written from this checkout.

## The user's words

Pasted into the session on 2026-11-14, verbatim:

> Stand 14.11. Entscheidungen des Users zu Prior und dem nächsten Kandidaten:
>
> 1. Option 1 aus der letzten Sitzung: Anfrage 82 für den Kandidaten 13.5.0 vorbereiten.
>    - Gebaut wird aus dem Tag v13.5.0, nicht aus HEAD. Seit dem Tag haben sich außerhalb des Workbench nur codec/fixtures/prior/REQUESTS.md, zwei Testdateien unter codec/src/__tests__, codec/vitest.config.mjs und codec/vitest.workspace.mjs geändert. Nichts Ausgeliefertes ist betroffen, und codec/dist/fusion-record.js ist bei v13.5.0 und HEAD gleich (36570a7c…). Bitte selbst nachmessen.
>    - Inhalt nach dem Muster von 79: Paket mit Digest; Änderungen 13.4.4 → 13.5.0, Kampagnen zuerst (/fusion:campaign, campaign.json, Lanes, set-resources); die Punkte, zu denen Prior urteilen soll; der bei 13.4.4 zurückgestellte Hook-Vergleich; was fusion mit der Antwort tut.
>    - Anfrage 82 enthält einen Hinweis: Prior zieht seine Testbasis auf 13.5.0 um und nimmt die Aufzeichnungen unter Claude Code neu auf, Kampagnen-Aufgaben eingeschlossen. Wie eine Kampagnen-Aufgabe über mehrere Checkouts aufgebaut wird, klärt Prior gerade. Falls fusion dazu Material hat, etwa Fixtures für Kampagnen über mehrere Checkouts, in der Anfrage nennen.
>    - Vorbereiten ja, einreichen erst nach Priors Pin-Commit (Antwort auf Frage 1 von 81). Die Anfrage soll diesen Commit nennen.
>
> 2. Wenn ich Priors Pin-Commit weitergebe:
>    - Den Commit in REQUESTS.md eintragen. Damit ist Frage 1 von Anfrage 81 geschlossen.
>    - fusions Go-Kopie nimmt campaign.json als vierten Namen einer Verwaltungsdatei auf, wie angekündigt.
>
> 3. Keine Hook-Prüfung auf 13.4.4 anstoßen. Die Entscheidung, dass der Tag v13.4.4 bleibt (1f92185c), gilt weiter.
>
> Ziel des Ganzen: fusions Funktionsumfang auf Prior testen, zuerst über das Claude-Abonnement, dann mit dem Open-Weight-Modell qwen3.6:35b. Anfrage 82 ist der einzige Weg dahin, denn nach Priors Umstellung lehnt Priors Programm jedes Paket mit dem alten Codec ab.
> Nichts in Priors Repository schreiben.

## Mode

The session asked whether to file the work as an item of its own and offered, as option 1: "Ja, als eigene Aufgabe anlegen und reservieren, im selbstständigen Modus wie bei Anfrage 81." The user answered: "1".

## Measured when filed

At fusion `637b189c` plus event rows, 2026-11-14: `git diff --stat v13.5.0 HEAD -- . ':!fusion-workbench'` lists five files, `codec/fixtures/prior/REQUESTS.md`, `codec/src/__tests__/install.test.ts`, `codec/src/__tests__/migration.test.ts`, `codec/vitest.config.mjs` and `codec/vitest.workspace.mjs`; `codec/dist/fusion-record.js` hashes to `36570a7c…` at `v13.5.0` and at HEAD. Whether none of the five is a shipped file is not yet measured against the installer's copy list.

## Out of scope

No hook comparison on the 13.4.4 bundle. No change to the tag `v13.4.4` or its ruling (`1f92185c`). No file in Prior's repository.
