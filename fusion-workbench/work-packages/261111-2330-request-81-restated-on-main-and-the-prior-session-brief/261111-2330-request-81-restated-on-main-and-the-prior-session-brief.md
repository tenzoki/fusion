# Request 81 is restated on main, and the Prior session gets its brief for the re-pin

## Directive

Prior's re-pin to the codec that reads a campaign (request 81 in `codec/fixtures/prior/REQUESTS.md`) is asked and unanswered, and the request still says its commit stands on an unpushed local branch. This item does the fusion half and nothing in Prior's repository. It appends a short section to `REQUESTS.md` stating, from measurements, that `d3ad786d` is now on `main`, that `v13.4.4` is tagged, and that the bundle on `main` has the bytes request 81 names (`sha256:36570a7cafb3083a70b0386b337ac471357782b0d164b97fd28f2f7d740d8844`, 727 511 bytes), so the deferral ground under question 1 no longer exists. It then writes the brief for a session the user starts in Prior's own checkout, which performs the re-pin and answers the five questions there. The item is reached when the section is committed and pushed on `main`, the commit and the file's digest at it are reported to the user, and the brief for the Prior session is in the user's hands.

## The user's words

The session's opening, 2026-11-11: "Wie setzen die Integration zwischen diesem repo (fusion) und Prior fort (/projects/productive/F09-Prior)."

On the re-pin, after it was explained: "ok, mach das zuerst, als eigenes paket im autonomen modus durchführen"

On where the work runs, the user chose option 1 of the question put to them: "Hier nur die fusion-Seite: Ich trage in `REQUESTS.md` nach, dass der Stand auf `main` liegt, und schreibe dir den Auftrag für eine Prior-Sitzung, die du in Priors Klon startest." The answer given was "1".

## Out of scope

No file in Prior's repository is written from this checkout. No campaign is opened: with one working checkout the user ruled it unnecessary ("gut, bei einem arbeitsklon braucht man ja keine campaign").

## Closure, 2026-11-12

Closed as `done`, outcome `completed`, on the user's word (the answer "1" to the question whether to close now, keep the item open until Prior answers, or stop).

Commits, all on `origin/main`, the hashes as pushed: `ee2df82e115cef756a9b53153fdb9c3ac30b73cc` (the passage `### The commit and the digest of 81, restated on `main`` in `codec/fixtures/prior/REQUESTS.md`, and this item filed), `e72f04b4227846ef68b90faf5308ed7efa044196` (the `bound=` expectation in `codec/src/__tests__/install.test.ts`), `b6d456559ca937063c4f67716cb398a6b01db1ce` (event log rows). The commit that carries this note, the review and the status follows them.

One correction to the directive above: it says `v13.4.4` is tagged as part of the ground. Measured, `v13.4.4` names `bcb7133d` and carries the old bundle; the first tag holding the codec of request 81 is `v13.5.0`. The passage in `REQUESTS.md` states it that way.

The brief for the Prior session was handed to the user as `/Users/kai/.fusion-tmp/114caf11/prior-session-brief-request-81.md`, outside the repository. Its paragraph on Prior's four uncommitted files overstated them: Prior's session reports they are that day's setup files.

Closing review: `reviews/261112-1827-reviewer-closing-review-of-the-install-test-sweep-expectation.md`, range `ee2df82e..b6d45655`, verdict accept, no issue filed. Gap named: `ee2df82e` itself is in no review's range; it changed Markdown and workbench records only, no code or data file.

Stop conditions: none were put. No plan was bound on this item and none was held by the session; the work was two dispatches from the directive.

Left open: the issue `issues/261112-0728-the-largest-store-migration-test-asserts-a-5-s-wall-clock-allowance-and-goes-red-under-the-suites-own-parallel-load.md` in this container. Prior's answer to request 81 is not part of this item; fusion records it in `REQUESTS.md` once the user names the Prior commit that holds it.
