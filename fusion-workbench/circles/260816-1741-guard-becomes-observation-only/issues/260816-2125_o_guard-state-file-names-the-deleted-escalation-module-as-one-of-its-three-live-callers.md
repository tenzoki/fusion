`hooks/lib/guard-state-file.ts` names the deleted `escalation.ts` as one of its three live callers, and rests a design choice on it

---

`hooks/lib/escalation.ts` was deleted at `9c79202`. `hooks/lib/guard-state-file.ts`, which
survives and is not in any step's Files list, goes on describing it in the present tense in three
places. The third is load-bearing rather than decorative.

- `:34` — "Three modules use it today — `escalation.ts`, `review-coverage.ts` and
  `staging-drift.ts`. `churn.ts` and `state-drift.ts` were the fourth and fifth, both removed on
  2026-08-15." Two modules use it today, and `escalation.ts` belongs in the second sentence with
  the other removals, dated 2026-08-16.
- `:79` — "The files that DO route through here are `escalation.json` and the two measurement
  throttle records." `escalation.json` is written by nothing at this version.
- `:103` — "`escalation.ts` runs inside the hooks and has no root of its own, so it lets this walk
  up from the working directory — that walk is the no-workbench no-op above, and it must stay its
  default." **This is the stated reason the `root` parameter is optional**, and its only cited
  subject is gone. Both surviving callers pass a root explicitly (`review-coverage.ts`,
  `staging-drift.ts`), which the very next paragraph says. So the module now documents a default
  whose justification names a caller that does not exist, and the paragraph after it contradicts
  the paragraph before.

The `## What `escalation.ts` adds on top, rather than beside` section at `:55` is a worked account
of a module that is no longer in the tree; it reads as current design and is now history.

---

Context: found by `coderev` reviewing Turn 1 of this Circle, range `3d41d4a..3c2e1c6`, while
checking question 5 of the review dispatch — whether the historical accounts written into surviving
headers are accurate and whether any still claims something live that is not. The other headers
this Turn rewrote (`hooks/guard.ts`, `hooks/lib/events.ts`, `hooks/session-start.ts`,
`hooks/tracker.ts`, `hooks/lib/self-detect.ts`, the four `bin/` headers) were each checked against
the tree and each holds. This one was not rewritten because no step names the file.

Note that this file's own test, `guard-state-shape.test.ts`, is the file
`circles/260816-1741-guard-becomes-observation-only/issues/260816-1917_o_the-groundings-test-list-names-a-test-whose-subject-survives-the-removal.md`
argues must survive the removal. That argument stands and is not affected here: the seam is live
and tested, and only its header's account of who uses it has gone stale.

Proposed shape of the fix: add `hooks/lib/guard-state-file.ts` to step 11's Files list, or handle
it beside step 5's remaining `paths.ts` header rewrite, which is the same class of work on a
neighbouring module. The `:103` paragraph needs the most care — the optional `root` should be
re-justified on what is true now (a caller inside the hooks with no root of its own is the case the
default exists for, and none remains), or the parameter's optionality should be recorded as kept
without a current subject, the way `isFusionPluginRoot` is.

What it costs if it stands: the next reader deciding whether `root` may be made required reads a
justification naming a module they cannot find, and either keeps the default for a reason that no
longer holds or removes it without the argument that would have been needed.
