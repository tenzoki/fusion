Two descriptions of the cleanup run order reverse its last two steps

---

`README-agents.md`'s `/fusion:cleanup` row and the `description` in
`skills/cleanup/SKILL.md`'s frontmatter both describe the run as archiving, then reconciling
`CLAUDE.md` at a user gate, then logging activity. The pipeline runs the other way round: the
activity log is step 5 and the `CLAUDE.md` gate is step 6, which the selector table in that
skill's own `## Arguments` states.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Why it is filed rather than fixed.** The two sentences say the same thing in two files, so
correcting one alone puts them out of sync and makes the drift harder to see, not easier. They
want one edit together. Neither file was in scope of the task that found this, and the skill body
is a byte-bounded surface that had just been measured to within three bytes of its allowance, so a
further edit would have perturbed a measurement another step depends on.

**Why it matters more than a typo.** The gate ordering is the property
`260827-1311_*_where-in-the-cleanup-pipeline-does-the-one-gate-stand.md` was decided on: the one
stop stands last so a run typed and walked away from completes everything but that answer. A
description saying the gate comes before the activity log describes a pipeline that would not have
that property, and it is the sentence a reader meets first.

**Evidence.** Found by the agent closing
`260907-1942_*_the-cleanup-pipelines-step-numbering-has-drifted-in-its-own-body-and-in-readme-agents.md`,
which corrected three wrong step numbers and reported this one as outside that record's acceptance
test, since it names no step number at all. That is also why no gate catches it: the enumeration
lint checks that each skill has a row, not that the row's prose describes the right order.

**Acceptance.** Both sentences describe the run in the order the selector table gives, and they
agree with each other.

---
Reconciled 260908-0027 (reconciler, HEAD `9d99b19d`): still open. Both sentences still read
"reconciles `CLAUDE.md` at a user gate, logs activity" — the `README-agents.md` skill-table row and
the `description` in `skills/cleanup/SKILL.md`'s frontmatter — while the body has run the activity
log first since `4c421f29`, which physically reordered the two sections. So the drift widened rather
than closed in this session: the pipeline moved and the two descriptions did not.
