Setup's interrupted-session summary still asks for "every diverging row from step 2" and no step produces rows

---

`skills/setup/SKILL.md:260` requires the resume summary to present "**Every diverging row from step
2**, each naming the surface, what it says, and the record that contradicts it." Step P-11 replaced
sub-step 2 with a shell block that emits two `KEY=value` lines and no rows. The bullet was not
edited; the orchestrator's equivalent bullet was removed.

---

## Context

Before P-11, sub-step 2 ran `bin/fusion-state-drift`, which printed "one line per surface: what the
surface says, what the record that can contradict it says, and `DRIFT` or `UNCHECKED (<reason>)`
where either applies". The bullet at what is now line 260 was written against exactly that output.

After P-11, sub-step 2 (`skills/setup/SKILL.md:248-253`) emits:

```
commits=<n|unavailable>
turns=<n|unavailable>
```

There is no surface, no contradicting record, and nothing that can diverge — the two figures are
*derived from* the un-freezable records rather than compared against them. The bullet asks for
output that cannot exist, inside Setup's Step 1, which the file labels "CRITICAL — do not skip".

**The other resume path was corrected and this one was not.** `agents/orchestrator.md:95-100` carries
the same summary list; P-11 rewrote its "Progress" line and dropped the diverging-rows bullet
entirely. So the two resume paths — which the P-11 commit message says both carry the same
replacement — now disagree about what the summary contains. A reader following the skill will either
invent rows or silently skip a mandated bullet.

## Suggested direction

Delete the bullet, or replace it with whatever the new sub-step 2 can honestly support. Note that
what the bullet was *for* — "the user is deciding whether to trust the file" — is a purpose P-11
removed rather than relocated: the state file no longer carries a figure that can be distrusted.
Saying that, once, is probably better than deleting the bullet silently.

---
Resolved: The bullet is deleted from `skills/setup/SKILL.md`, bringing the skill's resume summary to the same shape `agents/orchestrator.md` already carried. Deleted rather than reworded: what the record asked to be said once — that the saved state no longer carries a figure that can be distrusted — is already said in this same file, at sub-step 2 ("The saved state carries no counters — it never carries a number that could be stale"), which is the step that produces the two figures. A second statement of it inside the summary list would restate the point where the list should only name what the step emits. Net -190 bytes on a growth-bounded surface.
