# The tracker's noise-file list still says it excludes two metrics, when only churn reads it

---

**Severity:** Low — a stale present-tense comment on a live constant, in the file the removal edited
**Domain:** code
**Filed by:** reconciler (reconciliation of `6b94e17..HEAD`, 260809-2252)
**Affects:** `hooks/tracker.ts:92-94`, and its compiled twin `hooks/dist/tracker.js:71-73`
**Cross-references:**
`c353196` (removed the cross-file ping-back tracker and left this comment standing);
`260809-2004_*_should-the-latching-churn-and-cross-file-criticals-be-bounded-or-dropped.md` (the decision that removed it);
`260809-2047_*_three-shipped-documents-still-describe-ping-back-detection-as-a-live-guard-feature.md` (the same drift in three shipped documents, closed by `97d5846` — this is the fourth site, in code rather than prose);
`260809-2050-coderev-guard-and-hooks-turn-6b94e17-to-head.md` ("`c353196` is the clean counter-example … a removal checklist that ends at `grep` ends one step early" — this record is that observation holding one step further than the review took it)

---

## What is wrong

The header comment on `TRACKER_NOISE_FILES` reads:

> Workbench dashboard/state files that the orchestrator continuously
> rewrites by design. Tracking them as churn or ping-back produces
> pure noise — exclude from **both metrics**.

There is no second metric. The constant has exactly one reader at HEAD,
`hooks/tracker.ts:674`, on the churn path. The ping-back tracker, its state file, its
event types and its config block all left with `c353196`; the exclusion list did not
change, but the sentence describing why it exists still describes the two-consumer
shape it had before.

This is not a search miss of the kind an identifier grep would have caught: the
comment says "ping-back", not "cross-file", which is exactly the class of drift
`260809-2047_*_three-shipped-documents-still-describe-ping-back-detection-as-a-live-guard-feature.md` was filed for — three shipped *documents* describing a removed feature
in prose. This is the same drift one layer down, in the source file the removal
itself edited.

There is an irony worth recording, because it is the reason a reader will not
notice: the rest of this same comment block argues at length that the
`.guard-state/**` entry must not be deleted merely because a sibling entry
elsewhere was retired. The opening sentence is about the sibling that was retired.

## Suggested direction

Reduce the sentence to one metric — "Tracking them as churn produces pure noise —
exclude from the metric" — and rebuild (`npm run build` in `hooks/`) so
`hooks/dist/tracker.js` follows. Nothing about the list's membership changes; only
the reason given for it.

## Acceptance criteria

- [ ] `hooks/tracker.ts` names one metric in the `TRACKER_NOISE_FILES` header, and
      the word "ping-back" does not appear in it.
- [ ] `hooks/dist/tracker.js` is rebuilt from that source (the committed `dist/`
      is byte-identical to a fresh `tsc` today; keep it so).
- [ ] `git grep -in 'ping-back\|pingback' -- hooks/ bin/ rules/ agents/ skills/ docs/ README*.md`
      returns only past-tense mentions that name decision `260809-2004_*_should-the-latching-churn-and-cross-file-criticals-be-bounded-or-dropped.md`.

---
Resolved: The header now names one metric and the word "ping-back" does not appear in it. The
constant also moved: it lives at `hooks/lib/churn.ts` rather than in `hooks/tracker.ts`,
because task 12 (`260810-1632`) needed the churn READ path to apply the same list and a hook
entry point cannot be imported from — so the corrected comment travelled with it, exactly as
the queue entry asked. The header now reads "One metric, two readers" and says which two
(`tracker.ts` on the write path, `rankThrashing` on the read path); the "This list is not a
protection statement" argument below it is intact, with only "(step 1 of this Circle)" dropped
as unresolvable from its new home. `hooks/dist/` rebuilt with `npm run build`, not hand-edited.
`git grep -in 'ping-back\|pingback' -- hooks/ bin/ rules/ agents/ skills/ docs/ README*.md`
returns three past-tense mentions naming decision `260809-2004_*_should-the-latching-churn-and-cross-file-criticals-be-bounded-or-dropped.md` and nothing else.
