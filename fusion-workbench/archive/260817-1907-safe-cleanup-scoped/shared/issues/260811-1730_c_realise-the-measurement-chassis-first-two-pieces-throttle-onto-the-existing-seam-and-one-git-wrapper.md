# Realise the measurement chassis, first two pieces: the throttle onto the existing seam, and one git wrapper

---
**Severity:** Medium
**Domain:** code
**Filed by:** orchestrator, session 260811-0752-orchestrator-session.md, realising an answered decision
**Affects:** `hooks/lib/state-drift.ts:512-531`, `hooks/lib/review-coverage.ts:560-579`, `hooks/lib/staging-drift.ts:449-466` (the three throttle copies); `hooks/lib/review-coverage.ts:315-326`, `hooks/lib/staging-drift.ts:260-271`, `hooks/lib/state-drift.ts:280-288` (the git wrapper, twice verbatim and once inline); `hooks/lib/guard-state-file.ts` (the seam all three bypassed)
**Cross-references:** `260811-1146_*_does-the-measurement-family-get-a-shared-chassis-before-the-fourth-module.md` — the answer this realises

---

Option 2 of the answered decision. Move the throttle store onto `hooks/lib/guard-state-file.ts`,
whose own header names this exact failure class and which two other modules already use, and
extract the `execFileSync` git wrapper into one `lib/git.ts`.

**Explicitly out of scope, by the same answer:** the tracker's three `measure…ForModel` bodies,
the three CLI mains and the three `bin/` wrappers stay as they are. The full chassis is taken at
the fourth module, not now. Do not widen this record into option 1.

Also from that answer: write the **trigger** down as the thing that decides whether a new
measurement is a sibling at all. The three triggers differ (every guarded tool call, a review file
landing, HEAD having moved) and that difference is what made siblings the right relation.

**Acceptance:** three throttle copies become one call to the existing seam; one `lib/git.ts` with
no second copy anywhere; the trigger criterion is written where the next author will read it; the
tracker, CLIs and wrappers are untouched; suite green.

---

**Resolved:** coder, session 260811-0752-orchestrator-session.md, task 2 of the queue. Both pieces landed, the bound held.

- **The throttle.** `hooks/lib/guard-state-file.ts` widened by one optional `root?: string` on
  `guardStatePath` / `loadGuardState` / `saveGuardState`; the walk still runs when no root is
  given, so `escalation.ts` and `churn.ts` are untouched in signature and behaviour. The three
  hand-rolled pairs became six calls plus one total coercion each — `coerceThrottle`
  (`lib/state-drift.ts`), `coerceCoverageThrottle` (`lib/review-coverage.ts`), `coerceStagingState`
  (`lib/staging-drift.ts`, two fields coerced separately so a corrupt `reported` does not also
  discard a usable `head`). The three modules no longer know where `.guard-state/` is:
  `STATE_DIR_REL`, `THROTTLE_REL` and `COVERAGE_THROTTLE_REL` are gone, each module names only its
  file name. Two behaviour changes, both toward the seam's own contract — the write is now atomic
  (`.tmp` + `rename`, where all three used a bare `writeFileSync`) and the read can no longer
  throw. No consumer outside the three modules reads these files, so the format change reaches
  nothing.
- **The git wrapper.** `hooks/lib/git.ts`, `git(root, args, timeoutMs?)`. `execFileSync` now appears
  exactly once in the hooks source and `"git"` as a command word in exactly one file. The timeout
  was **not** verbatim across the three: 5 s twice, 10 s in `staging-drift.ts`. The 10 s belongs to
  `git status --untracked-files=all` — the one call in the family that walks a working tree — so
  the module defaults to 5 s and `staging-drift.ts` keeps `GIT_STATUS_TIMEOUT_MS` and passes it at
  that single call site. Its two `rev-parse` calls now take the default.
- **The trigger criterion.** Written into `hooks/tracker.ts`, in a documented section immediately
  above the three `measure…ForModel` bodies — the one file a fourth measurement must touch. It
  names the three existing triggers, gives three checkable questions that decide whether a proposal
  is a sibling (a nameable moment where the answer turns from "not yet" to "wrong"; firing at that
  moment reports **nothing** on the commonest path; the condition is read, never predicted from a
  command's text), says what each failure means, and carries the trip-wire verbatim: when a fourth
  measurement is proposed, the chassis is built first.
- **The bound held.** The tracker's three `measure…ForModel` bodies, the three CLI mains and the
  three `bin/` wrappers are unchanged — the `tracker.ts` change is a doc block above the section
  divider and no statement inside any of the three functions moved. The `signature` contract, the
  third repeated thing, was left alone; moving the throttle changed only the read's failure mode
  (`""` from a total coercion where it used to be `""` from a `catch`), not what any signature
  contains or how it is compared.
- **One thing the acceptance did not anticipate:** `derivable-enumerations-lint.test.ts` requires
  every `hooks/lib/*.ts` to carry a row in `README-hooks.md`'s files table, so `lib/git.ts` got one.

**Verification:** `cd hooks && npm test` — exit 0, 49 files, 1284 passed, the same count that was
green at HEAD `b261d83`. Plus a scratch project root driven through `dist/tracker.js` over stdin:
first-sighting arm, both drifts reported once and then throttled, the review-coverage trigger firing
on its own path alone, all three throttle files corrupted (`null`, an array, unparseable text) with
tracker exit 0 and each measurement re-reporting once, and the three `bin/` wrappers running
unchanged. `hooks/dist/**` rebuilt and re-checked self-contained — every import is relative or a
`node:` builtin. `dist/lib/git.js` and `dist/lib/git.d.ts` are new and must be staged.

**History:** `260811-1806-coder-task2-throttle-seam-and-git-wrapper.md`
