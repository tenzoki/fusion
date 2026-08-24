# Every record names the person who wrote it, and an active Circle names the checkout that holds it

---
**Domain:** code
**Filed by:** shaper (anticipated-circle mode)
**Active spec/plan:** circles/260824-0530-record-attribution-and-circle-claim/planning/260824-0613_o_c3-attribution-on-records-and-a-claim-on-the-circle.md
**Active session history:** circles/260824-0530-record-attribution-and-circle-claim/history/260824-0539-orchestrator-session.md

---

## Directive

See `**Active spec/plan:**` above. The cited spec or plan states the Directive in force.

## Grounding snapshot

**Where this Circle comes from.** It is capability C3 of the approved specification `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`, whose `### C3` section carries seven acceptance criteria and the two conditions the user attached to answer 8. Both conditions bind here and are not re-opened: the identifier goes in the record body and never in a filename, and the record-to-session join is weak and is not made load-bearing. C0, C1 and C2 have all closed coherent, so the head-room, the isolation premise and the transport are settled behind this Circle rather than assumed by it.

**The identity question is answered, and the answer replaces the option set rather than choosing from it.** `shared/decisions/260822-1136_*_which-identity-does-an-attributed-record-carry-when-the-transport-is-git.md` offered `$USER`, the git identity, or both. The user rejected all three on one measurement of his own working arrangement: `$USER` is not unique across several instances on one machine, and the git identity is not unique either when one person works from several checkouts or several computers. He proposed a registry, `fusionusers.jsonl` with alias, `user@host`, git name and git mail, beside a gitignored local `fusionuser.jsonl` checked against the git configuration, and asked for a better proposal. The answer taken is that attribution and claim are different questions and do not need the same identity.

- **Attribution**, which is `**Filed by:**` and what C3 adds to the three record templates, is the git identity: `user.name` and `user.email`. It answers "who wrote this record" completely, across several machines, because it is the same person at each of them. It travels with the work, it is already visible on every commit, and it needs no new file.
- **The claim**, which is the field on the Circle record and the refusal in `/fusion:next`, is the git identity **plus a checkout identifier**. The identifier is generated once at Setup, lives in class L of the partition in `rules/workbench-tracking.md`, therefore never travels, and is unique by construction. It is what distinguishes two checkouts of one person, which the git identity alone cannot do, and that collision is exactly what the claim field exists to prevent.

**Why no registry, and this is an accepted cost statement rather than a preference.** `fusionusers.jsonl` would be a tracked file with many writers. The Circle that closed immediately before this one spent a full pass on leaving exactly one such file behind, `fusion-workbench/orchestrator-events.jsonl`, class R2 of the same partition, and that file now carries a union merge driver to survive it. Opening a second one costs the same work again. Two further costs attach: a person not yet in the registry can file nothing, and an entry goes stale silently when somebody changes their git configuration.

**What the user gives up by that choice, and he saw it before agreeing.** A stable alias that survives a change of git mail. In a long-lived history that is a real loss, and it was named to him before he answered.

**With no git configuration the run halts rather than guessing.** A tree without `user.email` cannot commit and does not take part in the multi-checkout arrangement at all, so the correct handling is a halt with a reason and never a substitute value.

**The decision record is still open on disk, and closing it is the first Turn's work.** `shared/decisions/260822-1136_*_which-identity-does-an-attributed-record-carry-when-the-transport-is-git.md` carries `_o_` and no `Answered:` line, because the answer above was given in chat on 260824 and this shaping pass writes only inside this Circle. A later reader may not presume it closed. The record's own options do not contain the answer, so closing it means recording an answer that supersedes the option set rather than selecting one of the three.

**The filename question comes into this Circle, by the user's decision.** `shared/decisions/260822-1556_*_does-the-record-filename-convention-hold-when-several-checkouts-file-into-one-store.md` asks whether the settled answer in `shared/decisions/260807-0158_*_how-is-a-unique-record-filename-obtained.md` survives several writers filing into one store, and both the specification and that record place it at C3's planning gate, because C3 is the last cheap moment to change what a record is named. Its option 3, a per-author filename component, is foreclosed by the user's round-3 condition and is listed only to record that it was considered. Its measured failure mode is already observed once under a single writer, in `shared/issues/260819-1511_*_a-bare-stamp-citation-is-ambiguous-when-two-records-share-it-and-one-turn-log-resolves-to-the-wrong-record.md`, and the corpus already holds 84 stamps shared by two or more files.

**One open defect binds the claim field directly.** `shared/issues/260822-2045_*_a-circles-head-fields-end-up-in-different-states-depending-on-which-of-the-two-activation-routes-ran.md` records that the two sanctioned activation performers, the orchestrator and `/fusion:next`, write a Circle's head fields differently. The claim field is specified to ride that same rename, so whatever is built here inherits the divergence unless the Circle addresses it. The defect's own correction of 260823 narrowed it: the two routes agree on both Circles measured, and the divergence stands without a measured instance. That is weaker evidence than the record originally claimed, and it is stated here in the narrowed form rather than the filed one.

**What C2's closure left in view, and what it did not.** `circles/260823-0023-settle-what-travels-between-checkouts/` closed coherent on 260823 and its closure note names nine records that stay open while falling out of every agent's scan set, because a closed Circle leaves those sets. Two of them are C4 inputs and not C3's: `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1110_*_the-merge-driver-unsorts-a-second-event-log-reader-whose-repair-direction-is-positional.md` and `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1302_*_the-monitor-attributes-a-merged-event-log-to-one-session-and-reports-another-checkouts-state.md`. They are named here so that whoever plans this Circle can see they were read and set aside rather than missed.

**Scope: one Circle carries both halves.** Attribution on records and the claim on a Circle record touch the same three templates and hang on the same activation rename. A second Circle would pay a full pass for a boundary one field wide. The user accepted that reasoning.

**What the growth bounds allow.** The changes land on `rules/` as always-on rule text, on `agents/` where every filing agent is instructed, and on `skills/` for `/fusion:next` and for the Setup step that mints the checkout identifier. Those are three separate budgets in `hooks/lib/__tests__/surface-growth-bound.test.ts` and `hooks/lib/__tests__/rules-emission-golden.test.ts`, and the always-on rule set is the one C0 deliberately did not spend. Whether what remains covers what this Circle adds is a planning question and is not settled here.

**One classification obligation the Circle inherits.** The checkout identifier is a new root-anchored surface if it lands in its own file. `rules/workbench-tracking.md` states that every entry of the layout tree falls in exactly one class and that a new entry joins a class in the same commit that creates it, so the partition in that file and the tree in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` are both opened by this work.

## Dependencies

- `260823-0023-settle-what-travels-between-checkouts`, closed coherent. It settled the transport and the four-class partition this Circle's checkout identifier is placed into, and it left the filename decision deliberately out, for this Circle.
- `260822-1921-measure-what-two-checkouts-share`, closed coherent. It measured the isolation premise on which a per-checkout identifier is meaningful at all.

Artifacts outside this Circle that bind it, cited rather than copied per the Origin Rule:

- `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`, capability `### C3`, and the `## Constraints` list
- `shared/decisions/260822-1136_*_which-identity-does-an-attributed-record-carry-when-the-transport-is-git.md`
- `shared/decisions/260822-1556_*_does-the-record-filename-convention-hold-when-several-checkouts-file-into-one-store.md`
- `shared/decisions/260807-0158_*_how-is-a-unique-record-filename-obtained.md`
- `shared/issues/260822-2045_*_a-circles-head-fields-end-up-in-different-states-depending-on-which-of-the-two-activation-routes-ran.md`
- `shared/issues/260819-1511_*_a-bare-stamp-citation-is-ambiguous-when-two-records-share-it-and-one-turn-log-resolves-to-the-wrong-record.md`
- `rules/workbench-tracking.md`, the four-class partition and its class L
- `rules/circle-records.md`, `## Circle record template`
- `rules/fusion-workbench-conventions.md`, `## Decision Record Template`, the defect file format under `## Issue and Decision Filing — MANDATORY`, and `## fusion-workbench Layout`
- `skills/memo/SKILL.md`, the one place a person already appears in a fusion filename, which stays as it is
- `skills/next/SKILL.md` and `agents/orchestrator.md` `## Circle head fields`, the two activation performers

## Turn log
