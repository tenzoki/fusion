The review-coverage fix ships only as TypeScript, because no commit since f45f76a carries hooks/dist

---
`736e276` rewrote `hooks/lib/review-coverage.ts` and `hooks/tracker.ts` so the coverage measurement
reads only the two mandated senders and stops reporting retired `conceptrev` files as `UNUSABLE`
forever. The compiled output that actually ships was never committed with it. At HEAD,
`git show HEAD:hooks/dist/lib/review-coverage.js | grep -c REVIEW_SENDERS` returns `0` and
`git show HEAD:hooks/dist/tracker.js | grep -c isMeasuredReview` returns `0`, while the two sources
carry three and two occurrences. The rebuilt artifacts sit uncommitted in the working tree.

---

## What is on disk at HEAD `f77633f`

```
$ git status --porcelain -- hooks/dist
 M hooks/dist/lib/review-coverage.d.ts
 M hooks/dist/lib/review-coverage.js
 M hooks/dist/tracker.js

$ git log -1 --format='%h %ad %s' --date=short -- hooks/dist
f45f76a 2026-08-15 refactor(drift): the counters go, and so does the machinery whose only subject they were

$ git diff --name-only f45f76a HEAD -- 'hooks/*.ts' 'hooks/lib/*.ts' | grep -v __tests__
hooks/lib/review-coverage.ts
hooks/tracker.ts
```

Exactly two non-test sources have changed since `hooks/dist` was last committed, and exactly their
three compiled artifacts are dirty. The set is closed: no other compiled file is stale.

## Why it matters rather than being bookkeeping

`CLAUDE.md` `### HTTPS installer` states the invariant plainly: *"Compiled hooks must be committed.
`hooks/dist/*.js` are in git … the tarball is runnable with no `npm`/`node_modules`."* The installer
copies `hooks/` from the GitHub tarball, which carries committed bytes and nothing else. So at HEAD:

- a fresh `install.sh` run, or a `/plugin install` from the marketplace, gets `review-coverage.js`
  without the sender filter and `tracker.js` without `isMeasuredReview`;
- `bin/fusion-review-coverage` and `bin/fusion-staging-drift` are thin wrappers over `hooks/dist/`,
  resolved relative to themselves, so the installed copy runs the old measurement;
- the defect the fix closed (`shared/issues/260811-1145_c_*`) is closed in this repository's working
  tree and open in every consuming project.

The three defect records the commit closed — `260811-1145_*_conceptrev-review-files-are-scanned-and-trigger-the-coverage-report-though-no-mandate-covers-them.md`, `260811-1147_*_both-reviewer-prompts-place-the-mandated-fields-beside-a-sender-field-neither-prompt-defines.md`, `260811-1148_*_parse-not-opened-misreads-a-prose-value-as-a-file-list-or-as-a-declared-none.md` — are
correctly closed against the **source**. This record is about the shipping half, not about them.

## Why nothing caught it

Three mechanisms could have and each is out of scope by construction:

- `bin/fusion-staging-drift` ranges over `fusion-workbench/` only. It reported `verdict=clean` at
  HEAD, and that verdict is correct for what it measures. It is what the session read.
- `npm test` does not build. Running the suite at HEAD leaves the three files dirty exactly as they
  were, so a green suite says nothing here.
- No test compares a committed `dist/` artifact against its source. The four growth bounds read
  `agents/`, `skills/`, the always-on rules and the hook tests; none reads `hooks/dist/`.

`hooks/dist` was last committed by `f45f76a` in the *previous* session, which is why this is a
standing gap rather than one this session opened — but this session is the one that made it bite.

## Fix direction

1. Build and commit the three artifacts. That is the whole correction, and it is one commit.
2. Separately worth deciding, and not part of 1: whether anything should assert that
   `hooks/dist/<x>.js` is the compilation of `hooks/<x>.ts` at every commit. A gate would have to run
   the compiler, which is a different kind of test from the four that exist. File a decision record
   rather than growing a bound if this is taken up.

**Filed by:** reconciler, session `260815-2147-orchestrator-session.md`. Filed in
`shared/` per the Origin Rule: no Circle is active, and the gap predates this session's Directive.

Also seen: 260816-0713-coderev-turn-5-6-range-3a0408a-f77633f.md by coderev — confirmed for the whole of `736e276`: `git show HEAD:hooks/dist/lib/review-coverage.js` and `HEAD:hooks/dist/tracker.js` contain neither `reviewSender` nor `isMeasuredReview`, so the `##` header bound, the sender filter, the `parseNotOpened` rewrite and the narrowed tracker trigger all ship as TypeScript only. Last commit to touch `hooks/dist` is `f45f76a`.

---
Resolved: `71e97f4 fix(dist): the compiled hooks carry the review-coverage fix that shipped without
them` committed the three artifacts. Verified at HEAD `787010f`:
`git show HEAD:hooks/dist/lib/review-coverage.js | grep -c REVIEW_SENDERS` returns `3` and
`git show HEAD:hooks/dist/tracker.js | grep -c isMeasuredReview` returns `2`, against `0` and `0`
before. `git status --porcelain -- hooks/dist` is empty, so committed and working tree agree. Fix
direction item 1 is done.

**A correction to this record's own reasoning, and it is mine.** The section *"Why nothing caught
it"* says *"`npm test` does not build."* That is false. `hooks/scripts/run-tests.mjs:2` opens with
*"`npm test` — compile, then run vitest against a build no other run can touch"*, and the build is
what produced the dirty artifacts in the first place. What I actually observed was that running the
suite left the three files dirty exactly as they had been, and I inferred "does not build" from it
without opening the script. The correct statement is narrower and still holds: **`npm test` builds
into a staging tree and syncs it, but nothing asserts that the *committed* `hooks/dist` matches the
committed source**, so a build that runs and is never staged leaves the repository in exactly this
state and no gate objects. The other two reasons in that section stand as written.

Found independently by `coderev` in the same window, reviewing `3a0408a..f77633f`, which cited this
record rather than refiling it (`260816-0713-coderev-turn-5-6-range-3a0408a-f77633f.md:48`).

**Fix-direction item 2 is not done and now has its own record**, so that it does not close inside
this one: `260816-0719_*_should-anything-assert-that-the-committed-hooks-dist-is-the-compilation-of-the-committed-source.md`.

Reconciled 260816-0720_*_phase-2-step-1-states-the-check-in-absolutely-while-step-3d-exempts-turn-1.md (reconciler, HEAD `787010f`).
