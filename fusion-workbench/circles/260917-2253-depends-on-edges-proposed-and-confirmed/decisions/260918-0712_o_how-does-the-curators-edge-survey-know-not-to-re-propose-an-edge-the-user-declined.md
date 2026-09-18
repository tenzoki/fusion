# How does the curator's edge survey know not to re-propose an edge the user declined?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:**
`260911-1833_*_how-does-the-curators-survey-know-not-to-re-propose-an-edge-the-user-declined.md`
(the terminal record this question returns from, and the source of options 1 to 4);
`260917-2256_*_spec-depends-on-edges-proposed-and-confirmed.md` `### C4`;
`260917-2258_*_spec-depends-on-edges-zero-yield.md` (claim E4, which refuted shipping the
fallback);
`260918-0712_*_implementation-depends-on-edges-proposed-and-confirmed.md` (the plan built
against this record);
`260917-2253-depends-on-edges-proposed-and-confirmed.md` (the work item)

---

## Question

The curator's edge survey runs more than once over a store that keeps growing. An edge the
user refused must not be put again; an edge nobody ever answered must be. Which mechanism
separates those two cases was deferred on 2026-09-11 and the record carrying it is terminal
(`_d_`), so the question returns here as a new record rather than as a rename, carrying that
record's four options forward unchanged.

It must be answered because the pass is being built now. The plan named above implements an
answer so that the pass works; this record is what puts that answer to the user, and a ruling
against it is a small follow-on edit to one prompt rather than a rebuild.

**One finding moves the question, and it was not available in 2026-09-11.** The earlier record
rejected suppressing on the existing `skipped` outcome because "a user who approves group
`tier-1` and not the graph-edge group leaves every edge entry `skipped`, and so does a user who
read each edge and refused it", so suppressing on `skipped` "suppresses edges the user never
saw". Read against the gate as it is actually built, that conflation does not occur:

- `agents/curator.md` `### The gate` shows **the count of every non-empty consequence group**,
  and `skills/curate/SKILL.md` `## Step 5 — The gate` puts one multiSelect option per non-empty
  group. So there is no group that is proposed and not offered. A group the user did not mark
  was a group he was shown and did not take.
- An outcome line exists in a run file **only** where an apply dispatch ran, and an apply
  dispatch runs only where a gate was put and answered with at least one approval
  (`skills/curate/SKILL.md` `## Step 6`). So the **presence** of an outcome line already carries
  the fact the fifth value was invented to carry: this entry was offered at a gate that was
  answered.

Under option 1's own definition — `declined` is written on an entry the user refused by id or by
refusing its group *with that group on offer* — every group is always on offer, so `declined`
and `skipped` name the same set of entries. A fifth value co-extensive with a fourth is not a
distinction; it is the overlap `rules/critical-stance.md` §4 calls a defect.

## Options

Options 1 to 4 are carried forward from
`260911-1833_*_how-does-the-curators-survey-know-not-to-re-propose-an-edge-the-user-declined.md`
in the words that record used, condensed. Option 5 is new and is what the plan built.

1. **A fifth outcome value, `declined`**, written only on an entry the user refused by id or by
   refusing its group with that group on offer. The survey suppresses on `declined` alone.
   - Pros: it says the thing it means; it reaches every surface, so a declined rule-file change
     stops being re-proposed too.
   - Cons: it widens a vocabulary shared by three surfaces for a criterion one subject asked
     for; the record's own qualification is that it needs a further field on the apply dispatch
     naming the groups that were on offer. **And, per the finding above, the value it adds is
     co-extensive with `skipped`, so it buys no separation at all.**
2. **No vocabulary change; the survey suppresses any edge entry it finds in a prior run file,
   whatever its outcome.** Proposed once is proposed.
   - Pros: cheapest thing that satisfies the criterion as written.
   - Cons: an edge the user never got to is never offered again, silently.
3. **A declined edge is annotated on the dependent work item and the survey skips it.**
   - Cons: it writes into a work item for a proposal that was *refused*, which the pass's own
     criterion forbids, and it invents a second machine-read field on the item.
4. **Drop the criterion; the pass re-asks.**
   - Cons: its own stated con is that it makes the second run cost the same as the first.
5. **Suppress on the outcome line, not on a new value.** The survey reads every prior curator run
   file across the whole workbench, unbounded by the evidence anchor, and for each edge entry it
   finds:
   - `applied` — suppressed (and suppressed anyway, because the field now carries the basename);
   - `skipped` — **suppressed**: an outcome line exists, so a gate was put and answered, and the
     entry's group was on offer and not taken;
   - `stale` or `failed` — **re-proposed**: the user approved it and the write did not land;
   - **no outcome line at all** — **re-proposed**: no apply dispatch ran, so no gate was answered.
   - Pros: it delivers option 1's separation with option 2's cost — one added instruction in the
     survey pass, no change to a vocabulary three surfaces share, no new dispatch field. The
     branches are disjoint and cover every way an edge entry can end a run.
   - Cons: **one residual, named rather than hidden.** Where the user rejects *everything* at the
     gate, the skill dispatches nothing, no outcome line is ever written, and the next run puts
     the same edges again. The mechanism errs toward re-asking rather than toward silent
     suppression, which is the direction the 2026-09-11 record itself preferred, but it is a
     real case in which a refusal is not remembered. Closing it means dispatching the apply pass
     on a rejection purely to record the answer, which contradicts
     `skills/curate/SKILL.md` `## Step 6` ("dispatch nothing at all") and is not proposed here.

## Constraints

Any answer must satisfy all of these; they are inherited from the earlier record and from the
spec, and none of them moved.

- The apply pass's input is the run file plus the approval set, and it never re-derives a
  proposal (`agents/curator.md` `### Pass 2 — apply`). An answer that needs to know what was
  refused obtains it at the gate, never by inference in the apply pass.
- Rejecting everything leaves every work item byte-identical. No answer writes into a work item
  on a rejection.
- The curator's eight exclusions stay intact. The fourth subject adds two gated write targets
  and removes nothing.
- The outcome vocabulary is authored in exactly one place, `agents/curator.md` `## The run file`,
  and the dispatch-parameter roster in `README-agents.md` `## Dispatch parameters`. Whatever is
  chosen is written there and not in a second copy.
- The suppression read may not be bounded by the curator's evidence anchor. A run file older
  than the anchor still records a refusal, and `**Scope:** full` is precisely what a user runs
  after a decline.
- The suppression read may not be bounded by `$SCAN_ANALYSES` either. That key resolves to the
  claimed item's container plus `shared/`, so a run file written while another item was claimed
  sits outside it and its refusals would be lost silently.

## Recommendation

**Option 5**, which is what the plan implements, and the user's ruling is what settles it.

The reasoning is the finding at the head of this record: option 1 is the right *behaviour* and
the wrong *mechanism*, because the separation it pays a shared vocabulary for is already carried
by whether an outcome line exists. Option 5 buys the same separation for one instruction in the
survey pass. `inference:` the co-extension claim rests on reading the gate's own text in
`agents/curator.md` `### The gate` and `skills/curate/SKILL.md` `## Step 5` — it is a reading of
two prompts, not a run of the pass, because the pass does not exist yet.

**If the user rules for option 1 anyway**, the follow-on is small and bounded: `declined`
replaces `skipped` on an entry whose group was on offer, written in `agents/curator.md`
`## The run file` and `### Pass 2 — apply`, and the survey's suppression key changes from
`skipped` to `declined`. It is one prompt, two sections, and no other surface moves. That is why
the pass was built rather than held: the answer is cheap to change and expensive to wait for.
