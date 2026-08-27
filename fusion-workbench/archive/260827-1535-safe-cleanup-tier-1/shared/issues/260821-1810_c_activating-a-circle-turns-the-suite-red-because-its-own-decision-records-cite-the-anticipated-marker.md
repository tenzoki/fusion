Activating a Circle turns the suite red, because its own decision records cite the anticipated marker

---
`cd hooks && npx vitest run lib/__tests__/workbench-citation-lint.test.ts` fails at HEAD `e764637`
with four dangling citations, and nobody wrote a bad citation. The four records were correct when
they were filed and were broken by the Circle's activation.

---

**Witness:** planner, while running the gate against a plan it had just written into
`circles/260821-1042-reply-bounded-whole-question-answered/planning/`. The plan's own citations all
resolve; the four failures are pre-existing.

**Severity:** medium. It is a red `npm test` that no author can attribute to their own change, which
is the failure mode `hooks/lib/__tests__/workbench-citation-lint.test.ts` accepted deliberately for
newly filed records, and this is a different cause: a rename nobody performed by hand.

**Affected:** the four records under
`circles/260821-1042-reply-bounded-whole-question-answered/decisions/`, all filed `260821-1108`. Each
carries, on line 6, a `**Cross-references:**` field naming that Circle's record with the anticipated
marker in the filename position rather than the wildcard. The dangling token is not reproduced here:
the gate reads this file too, and quoting a bad citation would file a second instance of the defect.

## The mechanism

A Circle record's state marker sits on the filename, `_a_circle.md` while anticipated and
`_t_circle.md` once active. The orchestrator filed these four decision records during the Circle's
anticipated state and cited the record by its exact filename, which was correct at the time.
`/fusion:next` then renamed the record on activation. The citations now name a file that does not
exist, and the wildcard form `_*_circle.md` is what the gate asks for.

The loop is general rather than particular to this Circle. Any record filed against an anticipated
Circle with an exact-marker citation of that Circle's record goes dangling at the moment the Circle
starts, which is exactly the moment the next agent runs the suite.

## What resolves it

Rewriting the four citations to `circles/260821-1042-reply-bounded-whole-question-answered/_*_circle.md`
clears the four failures. That is a repair rather than a fix: the next anticipated Circle with
scoping decisions filed against it reproduces the condition. The fix is that whoever writes a
citation of a Circle record writes the wildcard form, which
`circles/260805-2005-textschicht-gegen-code-nachziehen/decisions/260806-0015_*_zitierform-fuer-workbench-records.md`
already ratified, and which `rules/circle-records.md` and the agent prompts that file against an
anticipated Circle do not currently say in the place the writer is looking.

Adjacent and not the same:
`shared/issues/260811-2105_*_circle-records-carry-the-same-silent-citation-form-and-a-third-of-their-citations-are-stale.md`
measures stale citations written *inside* Circle records. This one is about citations *of* a Circle
record from elsewhere, and about the rename that breaks them all at once.

---
Resolved: fixed — the four citations were already in the wildcard form at HEAD; the decision-filing instruction now says a citation of a Circle record uses `_*_circle.md` because activation renames the file; agents/orchestrator.md:1014
