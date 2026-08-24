# Shaper session: C3 captured as an anticipated Circle

**Date:** 2026-08-24
**Agent:** shaper, anticipated-circle mode
**Draft:** "auf c3 der Multi-User-Spezifikation."
**Domain:** code
**Result:** `circles/260824-0530-record-attribution-and-circle-claim/`, record `_a_circle.md`

## What the draft was

One line naming capability `### C3` of `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`. The specification already carried seven acceptance criteria and two binding user conditions for that capability, so the shaping work was not to invent scope but to settle the one question the specification had deliberately left open at C3's planning gate, and to fix the Circle's boundary.

## Clarification rounds

Three questions, all answered.

**1. Which identity does an attributed record carry.** The three options in `shared/decisions/260822-1136_*_which-identity-does-an-attributed-record-carry-when-the-transport-is-git.md` were `$USER`, the git identity, or both. The user rejected the whole option set: neither `$USER` nor the git identity is unique when one person runs several instances on one machine or works from several computers. He proposed an alias registry and asked for a better proposal. The answer taken separates attribution from claim, since they are different questions. Attribution is the git identity, which answers "who wrote this" completely and travels for free. The claim is the git identity plus a checkout identifier minted once at Setup, held in class L of the partition in `rules/workbench-tracking.md`, which never travels and is unique by construction. The registry was declined on a cost statement: it would be a second tracked multi-writer file, the previous Circle spent a full pass on the first one, an unregistered person could file nothing, and an entry goes stale silently. What the user gives up is a stable alias across a change of git mail, and that was named before he agreed. A tree with no git configuration halts rather than substituting a value.

**2. One Circle or two.** One. Both halves touch the same three record templates and both hang on the same activation rename, so a second Circle would pay a full pass for a boundary one field wide. Recommendation accepted.

**3. Does the filename question belong here.** Yes. `shared/decisions/260822-1556_*_does-the-record-filename-convention-hold-when-several-checkouts-file-into-one-store.md` is placed at C3's planning gate by both the specification and the record itself, because C3 is the last cheap moment to change what a record is named. Recommendation accepted.

## What was carried into the Grounding from the standing state rather than from the answers

- The identity decision record still carries `_o_` and no `Answered:` line. The answer above exists in chat and not on disk, and closing it is work for the Circle's first Turn.
- `shared/issues/260822-2045_*_a-circles-head-fields-end-up-in-different-states-depending-on-which-of-the-two-activation-routes-ran.md` binds the claim field, because the claim rides the same activation rename the two performers write differently. The defect's 260823 correction narrowed it to a case with no measured instance, and the Grounding states it in the narrowed form.
- The closure note of `circles/260823-0023-settle-what-travels-between-checkouts/` names nine records that leave every scan set at closure. Two are C4 inputs and are named in the Grounding as read and set aside.

## Placement

Nothing was written before the Circle existed, and every write of this run landed inside it. Paths were re-resolved against the new directory immediately after creation. No backlog entry was involved, so none was closed. No existing Circle was modified. No spec was written: in anticipated-circle mode the Circle record is the artifact.

## Next step

Activation is the user's separate act, through `/fusion:next`.
