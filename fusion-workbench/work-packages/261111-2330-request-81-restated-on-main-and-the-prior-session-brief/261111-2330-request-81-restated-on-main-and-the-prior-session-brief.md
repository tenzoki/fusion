# Request 81 is restated on main, and the Prior session gets its brief for the re-pin

## Directive

Prior's re-pin to the codec that reads a campaign (request 81 in `codec/fixtures/prior/REQUESTS.md`) is asked and unanswered, and the request still says its commit stands on an unpushed local branch. This item does the fusion half and nothing in Prior's repository. It appends a short section to `REQUESTS.md` stating, from measurements, that `d3ad786d` is now on `main`, that `v13.4.4` is tagged, and that the bundle on `main` has the bytes request 81 names (`sha256:36570a7cafb3083a70b0386b337ac471357782b0d164b97fd28f2f7d740d8844`, 727 511 bytes), so the deferral ground under question 1 no longer exists. It then writes the brief for a session the user starts in Prior's own checkout, which performs the re-pin and answers the five questions there. The item is reached when the section is committed and pushed on `main`, the commit and the file's digest at it are reported to the user, and the brief for the Prior session is in the user's hands.

## The user's words

The session's opening, 2026-11-11: "Wie setzen die Integration zwischen diesem repo (fusion) und Prior fort (/projects/productive/F09-Prior)."

On the re-pin, after it was explained: "ok, mach das zuerst, als eigenes paket im autonomen modus durchführen"

On where the work runs, the user chose option 1 of the question put to them: "Hier nur die fusion-Seite: Ich trage in `REQUESTS.md` nach, dass der Stand auf `main` liegt, und schreibe dir den Auftrag für eine Prior-Sitzung, die du in Priors Klon startest." The answer given was "1".

## Out of scope

No file in Prior's repository is written from this checkout. No campaign is opened: with one working checkout the user ruled it unnecessary ("gut, bei einem arbeitsklon braucht man ja keine campaign").
