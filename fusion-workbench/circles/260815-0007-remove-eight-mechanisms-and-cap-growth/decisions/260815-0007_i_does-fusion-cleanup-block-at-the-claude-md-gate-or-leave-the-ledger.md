# Does `/fusion:cleanup` block at the `CLAUDE.md` gate, or leave the curator's ledger for a later approval?

---
**Domain:** code
**Status:** answered
**Filed by:** shaper (anticipated-circle mode)
**Cross-references:** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/_a_circle.md` § Grounding snapshot → The administrative surface; `skills/cleanup/SKILL.md` § Autonomy and safety, Step 5; `skills/curate/SKILL.md`; `agents/curator.md`; `shared/analyses/260812-0303-the-largest-consumer-read-for-the-first-time.md` § 5

---

## Question

The user settled two things that meet here. `curate` replaces `revise-claude-md`, so the one
path to `CLAUDE.md` is the curator's evidence-tiered pass behind a user gate and the autonomous
three-pass is removed. The visible names stay three, `setup`, `cleanup` and `cadence`, so
`curate` keeps no slash name of its own and lands as the `CLAUDE.md` step of the cleanup
pipeline. Those two answers determine that `/fusion:cleanup` acquires exactly one gate, at that
step and nowhere else. They do not determine what the gate does to the run.

`skills/cleanup/SKILL.md` opens its `## Autonomy and safety` section by defining autonomous as
*no per-step confirmation gates*, and the whole point of the skill is that it can be typed at
the end of a session and left alone. A blocking gate ends that property. A non-blocking one
keeps it and moves the approval to a run that may not happen. The question must be answered
before the planner plans the `CLAUDE.md` step, because the acceptance criteria differ between
the options, and the sentence in the skill body that becomes false differs with them too.

## Options

1. **The gate blocks.** `/fusion:cleanup` runs the curator's survey, presents the change ledger,
   and waits for the user before applying anything. `--dry-run` surveys and stops as it does at
   every other step.
   - Pros: the approval happens in the run that produced the evidence, while the session is
     still in the user's head. Nothing is left half-done, and nothing lands unapproved. The
     skill already carries `AskUserQuestion` in its `allowed-tools`, so the gate is reachable
     today with no new mechanism.
   - Cons: it removes the property the skill's own first section names, that the pipeline runs
     end to end without per-step confirmation. An unattended `/fusion:cleanup` stops in the
     middle and the commit-and-push steps after it never run.
2. **The gate defers.** The curator's survey runs autonomously, the change ledger is written to
   the workbench, `CLAUDE.md` is not touched, and the run finishes. The user approves the ledger
   in a later invocation.
   - Pros: `/fusion:cleanup` stays a one-shot that can be walked away from, which is why it
     exists. Nothing lands unapproved either, since the ledger applies nothing on its own.
   - Cons: it creates a deferred artifact that has to be read later, and this project has
     measured what happens to those. `/fusion:log-activity` produced one surviving log with a
     last entry of 16 June. The `staging_drift` and `review_coverage` events go to a log nothing
     read until an analysis read it for the first time. `/fusion:revise-claude-md` ran three
     times against 275 recorded `CLAUDE.md` changes. A ledger nobody opens leaves `CLAUDE.md`
     maintained by neither path.
3. **`/fusion:cleanup` drops the `CLAUDE.md` step and `curate` keeps its own slash name.**
   - Pros: neither skill changes shape, and the gate stays where the curator already puts it.
   - Cons: four visible names, which contradicts the answer that fixed them at three. Listed
     for completeness and not proposed.

## Constraints

- Nothing may edit `CLAUDE.md` without a user gate. That is the substance of the answer already
  given and no option may weaken it.
- The visible names stay `setup`, `cleanup` and `cadence`.
- Whichever option is chosen, the `## Autonomy and safety` sentence in `skills/cleanup/SKILL.md`
  is rewritten in the same change rather than left standing. Under option 1 it is false as
  written; under option 2 it is true only because the approval left the run, which the section
  has to say.
- `--dry-run` behaviour must stay survey-only at this step, as at every other.

## Recommendation

Option 1, with low confidence, and the reasoning is worth reading before it is followed.

*Verified:* the deferred-artifact failures cited under option 2's cons are measured, each from
`shared/analyses/260812-0303-the-largest-consumer-read-for-the-first-time.md` § 5.

*Inference:* choosing the gated path over the autonomous one is a statement that `CLAUDE.md`
changes are worth a person's attention. A pipeline that defers that attention to a run this
project has measured not happening delivers neither the gated path nor the autonomous one, and
the file goes unmaintained while both mechanisms report success.

*Not established:* whether the user actually runs `/fusion:cleanup` unattended, or sits with it.
That fact decides this question and no record here answers it. If the pipeline is watched, option
1 costs nothing. If it is typed and left, option 1 costs the reason the skill exists, and the
honest answer may be option 2 with the ledger surfaced at the next `/fusion:setup` rather than
filed and forgotten.

---
Answered: shared/history/260814-2306-orchestrator-session.md:103 — Option 1, the gate blocks: /fusion:cleanup presents the curator's change ledger and waits for the user before touching CLAUDE.md. The deciding fact, that the user sits with the run rather than leaving it, was supplied by the user at the activation gate.
Implemented: skills/cleanup/SKILL.md `## Step 5 — Reconcile CLAUDE.md (the one gate)` and `## Autonomy and safety` — Step 5 now reads skills/curate/SKILL.md and runs its procedure inline, holding the gate itself; nothing reaches CLAUDE.md until the user answers, --dry-run stops after the survey dispatch, and the autonomy section states that an unattended run stops at Step 5 with Steps 6 to 8 unrun. No commit hash: the executor does not commit, and the orchestrator's commit for this step is what carries these paths.
Deferred:
Superseded by:
