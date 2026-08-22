# What travels between checkouts is settled, and the one file two people both write merges without a hand on it

---
**Domain:** code
**Filed by:** shaper (anticipated-circle mode)
**Active spec/plan:** (none yet)
**Active session history:** (none yet)

---

## Directive

After this Circle, a person reading `.gitignore` and `rules/workbench-tracking.md` sees which workbench entries git carries between checkouts and which it does not, and the two agree with each other and with the layout tree. `portfolio.md` is no longer among them: it is regenerated on demand, and `/fusion:next` says when the ranking was generated and that it reflects only what this checkout has pulled. `fusion-workbench/orchestrator-events.jsonl`, the only file two checkouts both append to, carries a union merge driver declared in a root `.gitattributes` that `/fusion:setup` creates or amends, so two people can each run a session, push, and pull the other's work with every line surviving and no conflict reaching a person. The generator that renders the session sequence diagram sorts by the `ts` field rather than trusting file order, because after a union merge the log is no longer chronological. The setup marker `fusion-workbench/.fusion-setup` stops producing a diff on every Setup: it is written only when the file is missing or the plugin version changes, and it no longer publishes the absolute path of the checkout it was written in. Setup reports, without acting on it, when the workbench holds a Circle record marked active that this checkout never activated, and offers activation as the user's own act.

## Grounding snapshot

**Where this Circle comes from.** It is capability C2 of the approved specification `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`, whose `### C2` section carries seven acceptance criteria and whose `## The state partition` section defines the four-class split the Directive above makes visible. C1 ran and closed coherent as `circles/260822-1921-measure-what-two-checkouts-share/`, so the premise the whole sequence rests on is measured rather than assumed: two checkouts do get isolated workbench state, in both arrangements the user intends to use, on the precondition that each tree carries its own setup marker.

**The blocking decision is answered, and the answer is option 1.** `shared/decisions/260822-1136_*_how-does-the-tracked-event-log-behave-when-two-checkouts-both-appended-to-it.md` asked what happens when two checkouts have both appended to the one tracked log. The user chose a union merge driver, one line in a root `.gitattributes`. The evidence is not an argument but a measurement: the C1 pass ran the case end to end in `circles/260822-1921-measure-what-two-checkouts-share/analyses/260822-2219-what-two-checkouts-of-one-project-actually-share.md` `## Findings` section 7. Without the driver the merge produced conflict markers inside a machine-written log. With it the merge went clean and both lines survived, and the output came back out of order, a line stamped `11:01` standing before one stamped `11:00`. Both halves were confirmed, the benefit and the cost.

**The cost of that choice is accepted and named.** The log is no longer chronological after a merge, so every reader that depends on order must sort by the `ts` field each line already carries. This Circle repairs one such reader and deliberately not the other, which is the substance of the sixth answer below.

**The second-checkout activation question is answered, and the answer is option 3.** `circles/260822-1921-measure-what-two-checkouts-share/decisions/260822-2219_*_what-does-a-second-checkout-do-with-a-circle-record-marked-active-that-it-never-activated.md` records the divergence that makes the isolation work: a Circle record travels with its state marker, and `.active-circle` never does. The user chose to have `/fusion:setup` report the state and offer activation as the user's own act. The accepted cost is one more gate in `skills/setup/SKILL.md`, on a surface whose head-room C0 has just paid a whole Circle to clear, and a gate that informs without preventing: two checkouts may still activate one Circle.

**The setup marker is repaired at its cause, in the write rather than in the classification.** `circles/260822-1921-measure-what-two-checkouts-share/issues/260822-2219_*_the-tracked-setup-marker-is-rewritten-by-every-setup-and-carries-the-checkouts-absolute-path.md` measured that `skills/setup/SKILL.md:94` writes the marker with a truncating redirect on every run, and that the content includes `setup_pwd`, the absolute path of the checkout. The user chose to change the write: emit it only when the file is missing or when the plugin version changes, and drop `setup_pwd` entirely. That contradicts nothing in `rules/workbench-tracking.md`, which calls the file "written once, never rewritten" and is right about what should happen rather than about what does. The accepted cost is bytes on the skill surface.

**One residual on the marker, stated rather than solved.** `setup_at` stays in the file. Because the write still fires when the plugin version changes, two checkouts that both run Setup after a fusion release will both rewrite the marker with different timestamps and can conflict on a one-line file. That is once per release rather than once per Setup, and the user accepted it as a residual risk rather than reaching for a mechanism.

**The merge driver reaches other projects through Setup, and that is an expansion of what Setup touches.** The user chose to have `/fusion:setup` create the root `.gitattributes` or amend it, against the shaper's own suggestion that a consuming project's maintainer write the line themselves. Two costs were accepted. The first is bytes on the skill surface, from the same head-room C0 bought and from which the activation gate above and the marker change also draw. The second is not a byte question and is recorded here as its own fact: **this is the first time `/fusion:setup` writes a file outside `fusion-workbench/`.** Every write it performs today lands inside the workbench it creates, which is what makes the skill safe to run in a directory whose other contents nobody has looked at. A write to the project root changes that property. Whoever plans this Circle should treat the amend path as the load-bearing case, since a project may already have a `.gitattributes` carrying rules of its own, and an idempotent amend that never duplicates the line and never disturbs a neighbouring one is a different piece of work from a create.

**Which event-log readers this Circle repairs.** The user chose the driver plus the sequence-diagram generator, and left the Turn count where its defect already lies. `agents/orchestrator.md:876` and its format in the Observability section render a Mermaid sequence diagram at Phase 4 by reading the log, and a sequence diagram is order in visual form, so an unsorted read produces a picture that is wrong rather than merely untidy. The Turn count is a separate fault with a separate record, `shared/issues/260822-1136_*_two-definitions-of-the-turn-count-disagree-and-the-resume-snippet-counts-every-session-in-the-log.md`, and the specification already assigns its repair to C4. The accepted cost is that `agents/orchestrator.md` is opened twice, by this Circle and again by C4.

**What this Circle deliberately does not carry.** `shared/decisions/260822-1556_*_does-the-record-filename-convention-hold-when-several-checkouts-file-into-one-store.md` stays open and outside. The user placed it before C3, where the record templates are opened anyway, so answering it there costs one visit to those files instead of two.

**Two defects close with this Circle**, both named by the specification's C2 criteria: `shared/issues/260816-1049_*_the-split-calls-portfolio-md-not-machine-refreshed-and-the-playmaker-regenerates-it-in-full.md`, and `shared/issues/260822-1028_*_the-gitignore-kept-list-names-three-tracked-records-and-the-rule-it-cites-names-four.md`. The second is visible in the tree today: the `KEPT:` comment at `.gitignore:69` names three entries while `rules/workbench-tracking.md:11` names five.

**Two records are answered in this Grounding and still stand open on disk.** Neither the event-log decision nor the second-checkout activation decision carries its answer in its own `Answered:` line, because this shaping pass writes only inside this Circle. Closing both, each citing this record, is work for the Circle's first Turn rather than a fact a later reader may assume. Until then the disk states the questions and this section states the answers, and the disk is what a reconciler will find.

**What the growth bounds allow.** Three of the changes land on `skills/` and one on `agents/`, and those are two separate budgets in `hooks/lib/__tests__/surface-growth-bound.test.ts`. C0 bought head-room on both. Whether what it bought covers what this Circle adds is a planning question and is not settled here.

## Dependencies

- `260822-1921-measure-what-two-checkouts-share` — closed coherent. It measured the isolation premise this Circle builds on, and it left both open questions this Circle answers.

Artifacts outside this Circle that bind it, cited rather than copied per the Origin Rule:

- `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`, capability `### C2`, the section `## The state partition`, and the `## Constraints` list
- `shared/decisions/260822-1136_*_how-does-the-tracked-event-log-behave-when-two-checkouts-both-appended-to-it.md`
- `circles/260822-1921-measure-what-two-checkouts-share/decisions/260822-2219_*_what-does-a-second-checkout-do-with-a-circle-record-marked-active-that-it-never-activated.md`
- `circles/260822-1921-measure-what-two-checkouts-share/issues/260822-2219_*_the-tracked-setup-marker-is-rewritten-by-every-setup-and-carries-the-checkouts-absolute-path.md`
- `circles/260822-1921-measure-what-two-checkouts-share/analyses/260822-2219-what-two-checkouts-of-one-project-actually-share.md`, `## Findings` sections 7 and 8
- `rules/workbench-tracking.md`
- `shared/issues/260816-1049_*_the-split-calls-portfolio-md-not-machine-refreshed-and-the-playmaker-regenerates-it-in-full.md`
- `shared/issues/260822-1028_*_the-gitignore-kept-list-names-three-tracked-records-and-the-rule-it-cites-names-four.md`

## Turn log
