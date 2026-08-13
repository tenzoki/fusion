# The playmaker maintains the backlog store it is charged with

---
**Domain:** code
**Status:** anticipated
**Filed by:** shaper (anticipated-circle mode)
**Active spec/plan:** (none yet)
**Active session history:** (none yet)

---

## Directive

The playmaker maintains the shared backlog store rather than only describing it. A run
renames an entry's marker on its own judgement, and, once the user has confirmed inside
that same run, splits a multi-idea entry into one entry per idea, merges duplicates into a
single consolidated entry, and closes an entry that is no longer live. A split leaves the
original in place with its marker moved to closed and an appended line naming the entries
it became. The path resolver emits a backlog write key for the playmaker, because the
agent's own prompt now names the write, and the five surfaces that state the old no-write
boundary agree with the new one instead of contradicting it. Filing stays outside the
agent: no agent originates a backlog entry, playmaker included, and the
recommended-for-promotion marker (`_p_` in an entry's filename) ends this Circle with
exactly one named writer.

## Grounding snapshot

**Where this came from.** The decision record
`shared/decisions/260812-2043_*_who-writes-the-recommended-marker-on-a-backlog-entry.md`
asked who writes the recommended-for-promotion marker, offered four options, and
recommended declining the one that hands the write to the playmaker. The user answered it
by choosing exactly that option and widening it to full maintenance. The record's own
recommendation was overruled rather than met, which the record now states in its answered
line. The defect that follows from the answer is filed as
`shared/issues/260813-0825_*_the-playmaker-is-charged-with-backlog-upkeep-and-holds-no-write-key-to-the-store.md`.

**The surfaces that move together** are enumerated in that issue record under
`## Surfaces the fix has to reach`, with line citations into `agents/playmaker.md`,
`rules/fusion-workbench-conventions.md`, `CLAUDE.md` and the key-set tests. They are cited
here rather than restated, so that one list stays authoritative. The mechanical point
worth carrying forward is that the key set is *derived* by grepping the agent's own prompt
(`rules/workbench-path-resolution.md`), so the prompt has to name the write before the
resolver will emit the key. Prompt and key cannot be changed independently.

**The standing bound this Circle works against.**
`rules/fusion-workbench-conventions.md` `## Backlog entries` states two bounds, and only
one of them is in scope here. The backlog is not the work queue, and that stays untouched.
The other bound says no agent files a backlog entry, and the Directive above keeps it.

**Four questions were settled with the user in one round.**

1. *How much autonomy does a run have?* Mixed. Marker renames are autonomous within a run.
   Splitting, merging and closing happen only after the user confirms in that same run.
2. *What happens to an entry that gets split?* The original stays. Its marker moves to
   closed and a line is appended naming the entries it became. The form follows the
   shaper's existing `Promoted:` precedent for an entry that became a Circle.
3. *What does a merge produce?* One consolidated entry, written by the playmaker, rather
   than both bodies stacked into one file. The user chose this over the two options that
   kept the playmaker out of authorship.
4. *Does an undo mechanism belong in scope?* No. This repository has tracked its workbench
   since `e8988d9`, so git is the undo, and no before-state is written to the history log.

**The sharpest open edge this Circle carries.** Answer 3 brushes against the standing rule
that no agent originates a backlog entry. A merge that produces new prose is authorship,
and the rule was written to keep authorship with the user. The two are reconcilable, since
consolidating two entries that already exist is not the same act as introducing an idea
nobody filed, but nothing on disk states where that line falls. The plan has to state it
precisely and in the same words the conventions file uses, or the next reader will read
the merge as a violation of a rule the same document asserts. This is recorded, not
re-opened: the user has answered which behaviour he wants, and what remains is saying
exactly what it is.

**Accepted residual.** A consuming project that does not track its workbench in git has no
undo for a playmaker maintenance run at all. That is accepted rather than solved, and the
plan should not spend steps on it.

**Deferred question.** The playmaker is dispatched two ways: interactively through
`/fusion:next`, and non-interactively by the orchestrator at Phase 4 after a Circle closes
(`agents/playmaker.md`, `## Who dispatches playmaker`). Answer 1 gates splitting, merging
and closing on a confirmation inside the same run, and the Phase 4 dispatch has no
confirmation channel. Whether such a run performs those operations at all is filed as
`circles/260813-0858-playmaker-maintains-backlog-store/decisions/260813-0858_o_does-a-non-interactive-playmaker-run-perform-the-confirm-gated-backlog-operations.md`.

**The store as it stands.** `shared/backlog/` holds one entry,
`260811-0826_o_observations.md`, a hand-written dump of about a dozen distinct ideas. It is
the exact input the split behaviour exists for, and it makes a usable acceptance case: a
run against it should propose a split, obtain confirmation, and leave one entry per idea
plus the closed original.

## Dependencies

- **Blocks a documentation Circle created in the same session.** That Circle rewrites the
  playmaker's backlog role in `README-agents.md`, `CLAUDE.md` and `docs/working-model.md`.
  All three describe the behaviour this Circle changes, so documenting them first would
  document a behaviour that is about to be replaced. This Circle lands first. The
  documentation Circle's directory name is to be added here by the orchestrator once it
  exists; the ordering is stated as a named relationship so that it is visible from
  whichever of the two records a reader opens first.
- Binding records, cited rather than copied per the Origin Rule:
  `shared/issues/260813-0825_*_the-playmaker-is-charged-with-backlog-upkeep-and-holds-no-write-key-to-the-store.md`
  and
  `shared/decisions/260812-2043_*_who-writes-the-recommended-marker-on-a-backlog-entry.md`.

## Turn log
