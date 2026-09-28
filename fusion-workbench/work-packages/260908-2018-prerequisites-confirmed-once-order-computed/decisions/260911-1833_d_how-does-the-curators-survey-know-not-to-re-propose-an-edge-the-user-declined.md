# How does the curator's survey know not to re-propose an edge the user declined?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:**
`260911-1528_*_spec-prerequisites-confirmed-once-order-computed.md` `### C3` (the criterion this
question is filed against, sixth bullet);
`260911-1833_*_implementation-prerequisites-confirmed-once-order-computed.md` (the plan that
surfaced it, step D3);
`260908-2018-prerequisites-confirmed-once-order-computed.md` (the work item)

---

## Question

The spec's `### C3` requires that "an edge the user declined carries that outcome in the run file and
is not proposed again on the next run", and states that the curator's existing loop supplies this
because "the run file records what was proposed and what the user did with it". Read against the
prompt at `a78d017f`, it does not.

Two things are missing and they are separate.

**Nothing in the survey pass reads a prior run file.** `agents/curator.md` `### Pass 1 — survey`
reads the seven evidence sources and writes the run file. Prior run files are reachable through
source 4, reviews and analyses, since the run file lives at `$OUT_ANALYSIS`, but no instruction tells
the survey to read them for outcomes, and the anchor in `### The seven evidence sources` bounds the
pass by commit and date rather than by what has already been asked. An item nobody has touched since
the last run is out of an anchored pass by that bound alone, so the suppression looks to hold. It
fails on the one case that matters: `**Scope:** full`, which the same paragraph says "read
everything", and which is exactly what a user runs after a decline to see whether anything changed.

**The outcome vocabulary cannot express a decline.** `## The run file` item 7 gives four values:
`applied`, `skipped` (not approved), `stale`, `failed`. A user who approves group `tier-1` and not
the graph-edge group leaves every edge entry `skipped`, and so does a user who read each edge and
refused it. Suppressing on `skipped` therefore suppresses edges the user never saw, which is a worse
outcome than re-asking. The spec's own criterion that a proposed edge "is counted at the gate under a
group of its own" makes the group-level case ordinary rather than rare.

It must be settled before `agents/curator.md` is written, because the answer decides whether the
change is one added instruction in the survey pass or an added value in a vocabulary every curator
run writes.

## Options

1. **A fifth outcome value, `declined`, written only on an entry the user refused by id or by
   refusing its group with that group on offer.** The survey suppresses on `declined` alone and
   re-proposes a `skipped` entry.
   - Pros: it says the thing it means, and it partitions the two cases the current vocabulary
     conflates. It reaches every surface, so a declined rule-file change stops being re-proposed too,
     which is the same defect one subject over.
   - Cons: it widens a vocabulary shared by three surfaces for a criterion one subject asked for, and
     it needs the gate to report back which groups were on offer, which the apply pass is not given
     today: `**Approved:**` carries the approved ids and nothing about what was refused.
2. **No vocabulary change. The survey reads prior run files and suppresses any edge entry it finds
   there, whatever its outcome.** Proposed once is proposed.
   - Pros: no change to any shared vocabulary, and one added instruction in the survey pass carries
     it. It is the cheapest thing that satisfies the criterion as written.
   - Cons: an edge the user simply did not get to is never offered again, and nothing says so. The
     failure is silent and the remedy is to write the edge by hand, which is the loop this pass
     exists to replace.
3. **Suppression is not the curator's at all: a declined edge is recorded on the dependent item and
   the survey skips an item that carries the annotation.** The state lives with the subject rather
   than in a run file.
   - Pros: it survives an archived run file and a checkout that never had one, and it is readable by
     a person opening the item.
   - Cons: it writes into a work item for a proposal that was refused, which is a write the apply
     pass's own criterion forbids ("rejecting everything leaves every item byte-identical"), and it
     invents a second machine-read field on the item after this whole work exists to keep the item's
     head to one.
4. **The criterion is dropped and the pass re-asks.** A second run offers the same edge again.
   - Pros: nothing is added anywhere, and no mechanism can suppress a question wrongly.
   - Cons: it makes the second run cost the same as the first, which is what the first stopping
     condition in the spec already says is not worth invoking.

## Constraints

- The apply pass's input is the run file plus the approval set, and it never re-derives a proposal
  (`### Pass 2 — apply`). Any answer that needs to know what was refused must obtain it at the gate
  and not by inference in the apply pass.
- Rejecting everything leaves every item byte-identical (spec `### C3`, fifth criterion). No answer
  writes into a work item on a rejection.
- The curator's eight exclusions stay intact, and the fourth subject adds one gated write target and
  removes nothing (spec `## Constraints`).
- Whatever is chosen is written in the prompt that declares the vocabulary, not in a second place:
  `agents/curator.md` `## The run file` is the single authoring home for the outcome values, and
  `README-agents.md` `## Dispatch parameters` for the lines.
- The change is charged to the curator dispatch path, 9 867 bytes of room at `a78d017f`, measured by
  running `bin/fusion-rules curator` from the repository root and summing against
  `hooks/lib/__tests__/fixtures/dispatch-path.baseline`.

## Recommendation

Option 1, with one qualification the plan cannot settle alone. It is the only option that
distinguishes the two cases, and the conflation is what makes option 2 unsafe rather than merely
coarse. The qualification is its stated cost: the gate today hands the apply pass the approved ids
and nothing about what was refused, so option 1 is not one added value but a value plus one added
field on the apply dispatch naming the groups that were on offer. If the user judges that too much
for a criterion one subject asked for, option 4 is the honest fallback and is preferable to option 2,
because a silent suppression of an unasked question is the failure mode this project's own defect
records keep meeting.

---
Deferred: the session that builds the curator's proposal pass — the pass was not built, because the candidate survey returned one edge against a stopping threshold of three, so there is no survey to suppress a declined edge for and no run file to read a prior outcome from. The question returns unchanged when the store carries enough items to make the pass worth building, and the plan that builds it inherits this record as an input rather than rediscovering the gap. Nothing about the answer depends on the wait: the defect it names, that the run file's four outcome values cannot separate an edge the user refused from one he never saw, is a property of the vocabulary and not of the corpus; ruled by user, Kai Stalmann <ks@qantr.com>.
