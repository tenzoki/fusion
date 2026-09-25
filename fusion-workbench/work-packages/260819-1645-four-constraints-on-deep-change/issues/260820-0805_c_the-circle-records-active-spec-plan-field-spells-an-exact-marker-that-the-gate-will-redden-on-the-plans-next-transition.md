# The Circle record's `Active spec/plan:` field spells an exact marker that the gate will redden on the plan's next transition

---

The active Circle's record carries its plan in the head field, with the plan's current marker
spelled out as a literal rather than as the wildcard the citation convention prescribes. The field
and its exact spelling are at
`260819-1645-four-constraints-on-deep-change:6`.

It resolves today, so no gate complains. It stops resolving the moment the plan transitions — which
is due now, since nine of the plan's ten steps are done and the tenth is struck. And a Circle record
is inside the corpus of the gate this Circle just armed
(`hooks/lib/__tests__/workbench-citation-lint.test.ts:81`, the Circle-record predicate, which selects
a record in **every** state). So the next legitimate act of housekeeping on this Circle turns
`npm test` red, in a file nobody edited, on a line nobody touched.

That is the gate working exactly as its decision says it will. It is a defect all the same, because
the wildcard form exists precisely so that a pointer survives its target's transitions, and this
pointer was written in the one form that does not.

---

**Severity:** Medium — one citation, unambiguous target, trivially repaired; it blocks two other
pieces of housekeeping until it is, and it is the first live instance of the coupling the new gate
creates.
**Domain:** code
**Filed by:** `coderev`, reviewing `b91c01c..bbfc912`
**Owner:** `orchestrator` (the head field is the orchestrator's write —
`agents/orchestrator.md` `## Circle head fields`)
**Affects:** the head field named above
**Cross-references:**
`260806-0015_*_zitierform-fuer-workbench-records.md`
(the wildcard form for a marker that moves); `rules/circle-records.md` `### Citation form in the
portfolio` (the pointer-versus-statement test — this is a pointer, so it stars)

**The rest of the tree is split, and the split is not a counter-example.** Of the eleven other Circle
records, four spell an exact marker in this field and all four name a plan that has already reached
its terminal state, so their spelling cannot go stale. The rest use the wildcard. This is the only
record whose field names a plan still able to move.

**Verified 2026-08-20 at HEAD `bbfc912`.** The gate is green: the citation resolves. Renaming the
plan to either the in-progress or the closed marker makes it a `stale-marker` violation of
`scanRecordCitations`, which is what `hooks/lib/__tests__/workbench-citation-lint.test.ts` asserts
zero of.

## Fix direction

Star the marker position in the head field. One character, and it removes the coupling permanently
rather than deferring it to the next transition.

---
Resolved: the head field now spells the marker position `_*_`, and so do the two citations of the plan in this Circle's decision records. The prediction was exact and arrived on the first transition after arming: the field was starred, the plan was closed, and the gate reddened anyway on a citation in `260819-2016` that this record had not named. The gate's message gave file, line, token, the marker that was there, the record that now exists and the wildcard form to write, and the fix took one command. Nothing was exempted.
