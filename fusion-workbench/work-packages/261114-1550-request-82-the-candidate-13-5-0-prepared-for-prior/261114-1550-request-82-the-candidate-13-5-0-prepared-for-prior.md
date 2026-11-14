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

## Closure, 2026-11-14

Closed as `done`, outcome `completed`. The plan was complete (all seven steps `done`), so the finish was answered by **Mode:** autonomous on this item; no question was put.

Commits on `origin/main`, the hashes as pushed:

- `7469e742b265ec8f4407cc42f432492e270cb80f` this item filed and claimed; decision `261114-1554` filed
- `6fce1cc3eb0e428463ee4d5a66693138e4e3fc32` decision `261114-1554` answered (option 1, build from the tag), discussion `261114-1608` closed
- `18af364a8e65e0f95bf67a88963a12e7bd4f25ce` plan `261114-1656` adopted, decision `261114-1651` filed
- `7ab231e9832c1c941ba390c57603ef3f49773e07` steps 1 and 2: the delta measured, the bundle `sha256:2ba70dbeba8662212ef8312801da1c8103e90bfe42cf6a1ac8e34b71352ad643` built from `v13.5.0` and delivered
- `49be22fb7d7013c43ab2084ea5a54ae8674990c5` step 3: the hook rows on the 13.5.0 payload
- `d0cd3b9c8be66abf37f4624185df259f825011ec` step 4: the request drafted outside the log
- `2fe7babaf41c2ee66584cacacc1f29578adc6aff` step 6: `campaign.json` as the fourth name in the Go copy's `Select`
- `c8241452d9138da1436f039ee6f2fb496790fec0` step 5: Prior's answer to question 1 of 81 at `bf6bb42` recorded
- `f7c6f14e36044df130facc3ce6c8c8af6296b212` step 7: request 82 filed, naming Prior's pin commit `bf6bb42`; decision `261114-1651` answered (option 1)
- `76e1f0f87453429d005950aaa21f455a272b0410` closing review filed, both decisions implemented
- `7ff7b3917b5865b440a1cec70463b975246d0c75` the review's two findings corrected in the request log

One departure from the plan's order: step 6 landed before step 5, which is what the review's second finding traced.

Closing review: `261114-2106-reviewer-closing-pass-over-request-82-and-the-select-fourth-name.md`, range `7469e742..ed472e4b`, verdict revise, two low issues, both fixed at `7ff7b391` and closed. A `succeeded` edge on this item stays unmet, the verdict not being accept. Not covered by any review: `7ff7b391` itself and the event and workbench commits after `ed472e4b`.

### The plan's stop conditions, not put

The clauses of `## Where this work stops` were not put to the user: answered by **Mode:** autonomous on this item. Verbatim, none marked as failing:

- The work is finished when request 82 is committed on `main` and pushed, names Prior's pin commit, and the user has been told its commit hash and the file's sha256 at that commit.
- Request 82 is filed only after the user has passed Prior's pin commit; a commit read from Prior's history and not passed by the user is no such input.
- Request 82 is filed only if `QualifiedCodecDigest` at the pin commit names `36570a7c…`; otherwise the work stops at step 5 and the value goes to the user.
- Request 82 is filed only after Prior's answer to question 1 of 81 is committed in its own section and the Go change is committed on `main`.
- Request 82 is filed only after decision `261114-1651-…` is answered.
- The bundle the request names is the tree of `v13.5.0`: `fusion_revision` `60639346…` without `+dirty`, built in clones, two builds byte-equal, conformance passed, delivered under `13.5.0/`. A difference between the builds or a conformance failure stops the work.
- `REQUESTS.md` takes insertions only, and its prefix hash holds at each of the two appends.
- No git command without a pathspec or a ref runs in the live tree, and the tag is never checked out there.
- Nothing is written in Prior's repository by any step.
- No hook comparison runs on 13.4.4, and the ruling on `v13.4.4` (`1f92185c`) is untouched.
- No tag is made or moved and the marketplace is not bumped in this work.
- `PRIOR_PIN` stays `08c57fb`; a build or test that needs it moved stops the work.
- No file under `agents/`, `skills/`, `rules/` or the hook tests is edited; a step that needs one stops and reports, and a red growth bound is answered by a cut and never a baseline edit (condition did not arise: no step plans such an edit).

### Left open

- Prior's answer to request 82. Fusion records it in the request log once the user names the Prior commit that holds it.
- Whether the campaign entry gets Prior support at all, and whether the campaign part of the user's goal needs a later candidate (claim C7 of discussion `261114-1608-which-commit-request-82-candidate-built-from.md`, second half).
- The stale sentence calling request 81 "asked and unanswered" in `docs/campaign.md`, `docs/upgrading-to-v13.md` and `catalog/profiles/skill-help/parts/21-prior.md`; request 82 states that the candidate keeps it.
- The two decisions request 79 tied its tag to, still `open`.
