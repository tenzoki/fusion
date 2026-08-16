# Where does the tracked-workbench split live, now that the home it was meant to move to is gone?

---
**Domain:** code
**Status:** open
**Filed by:** reconciler
**Cross-references:** `shared/issues/260810-0504_c_the-tracked-workbench-section-re-enumerates-a-closed-list-and-leaves-one-surface-unclassified.md` (part 3, closed as moot-by-circumstance and untracked until this record); `rules/fusion-workbench-conventions.md` `### Which of them a tracked workbench tracks`; `shared/issues/260816-0136_p_the-tracked-workbench-splits-declared-scope-reaches-two-legacy-stores-neither-group-classifies.md`

---

## Question

`rules/fusion-workbench-conventions.md:72-85` — the subsection `### Which of them a tracked workbench
tracks`, about 4 800 bytes — is on the always-on rule surface, loaded by every agent on every
dispatch. Its content is consumed by whoever writes a project's `.gitignore` and by the archive step
of `/fusion:cleanup`. No executor agent applies it.

Defect `260810-0504` part 3 said so and named the remedy the file's own header table records four
times over: partition the topic into its own authoring home and emit it to a derived audience. That
remedy is unavailable as written. The proposed home, `rules/workbench-stash-and-lock.md`, no longer
exists — the commit lock became `rules/commit-lock.md` and the stash half left with the two stash
skills on 2026-08-15. The defect was closed with parts 1 and 2 fixed and part 3 disclosed as standing
"unaddressed by design", and nothing has carried it since.

It is worth answering now rather than later for two reasons. The subsection is still being edited —
`0a514e6` and `f73dfe4` both rewrote it this session, and `260816-0136` is open against a third
sentence in it — so every edit pays the always-on multiplier. And the always-on rule set carries a
growth bound with finite head-room, measured this session, which makes "where does this text live" a
question with a price attached rather than a matter of taste.

## Options

1. **Leave it where it is.** The status quo since the defect closed.
   - Pros: no work, and the text is correct where it stands. A reader of the layout section meets the
     tracking rule beside the tree it ranges over, which is where it makes sense.
   - Cons: about 4 800 bytes on every dispatch of every agent, for a rule the executors never apply.
     Every future edit to it is charged at the same multiplier.
2. **Give it its own file and a derived audience.** A new `rules/workbench-tracking.md`, emitted to
   the consumers that actually apply it, with a one-line pointer left in the conventions file.
   - Pros: the remedy the header table already records four times, applied a fifth. Removes the text
     from fifteen dispatches and keeps it available to the ones that need it.
   - Cons: a fifth partition of one document is a cost of its own — a reader now has five places to
     look. And the derived audience has to be *derivable*: the archive step is a skill, not an agent,
     and `bin/fusion-rules` emits to agents only, so the emission target needs settling before the
     move rather than after.
3. **Cut it to the rule and drop the reasoning.** Keep the two-bucket classification and the
   consequences; drop the paragraphs explaining why `.guard-state/` splits and why the archive roll
   is what preserves the log, citing the decisions that hold them instead.
   - Pros: cheapest by bytes, no new file, no audience question. The reasoning survives in the
     decision records it came from.
   - Cons: this document's stated design is that it *is* the definition of what it states, and
     stripping reasoning out of a definition is how the next reader re-derives it wrongly. The
     project has been burned by exactly that.

## Constraints

- Whatever is chosen must keep the split reachable by whoever writes a `.gitignore`, which is a human
  reading a file rather than an agent receiving an emission.
- `hooks/lib/__tests__/rules-emission-golden.test.ts` bounds the always-on set. Option 2 moves bytes
  off it; options 1 and 3 do not add any, so no baseline moves under any of the three.
- Option 2 must not create a file emitted to nobody. `rules/workbench-path-resolution.md` and
  `rules/rule-file-provenance.md` are already emitted to no agent by design, and a third such file
  needs a positive reason rather than an inherited pattern.

## Recommendation

None from the filing agent. The byte case for option 2 is real and the fifth-partition case against
it is also real, and this project has stated both principles as binding without ever ranking them.
Recorded here so that part 3 of `260810-0504` stops living inside a closed defect, which is the same
filing gap the reconciler found on `260810-2149` in the same pass.

---
Answered:
Implemented:
Deferred:
Superseded by:
Retired:
