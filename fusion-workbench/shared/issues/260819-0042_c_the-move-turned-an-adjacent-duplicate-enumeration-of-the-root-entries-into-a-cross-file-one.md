The move turned an adjacent duplicate enumeration of the root entries into a cross-file one

---

`rules/workbench-tracking.md` classifies the workbench's root entries and, to do it, names them all
over again. The tree it ranges over stayed behind in `rules/fusion-workbench-conventions.md`. The two
lists agree today; nothing keeps them agreeing, and the project has a recorded instance of this exact
pair going out of step.

---

`rules/fusion-workbench-conventions.md:21-72` holds the layout tree, whose root-anchored block names
ten entries and closes with the discipline that keeps it true:

> The list is exhaustive as written, and it is a list rather than a count on purpose … When a `bin/`
> helper or a hook adds a root-anchored surface, it lands in this tree in the same commit.

`rules/workbench-tracking.md:11-12` re-enumerates the same ten across its two groups —
`orchestrator-events.jsonl`, `.guard-state/events.jsonl`, `portfolio.md`, `.fusion-setup` as records;
`agentstate.yaml`, `orchestrator-live.md`, `.guard-state/` minus its log, `.commit-lock/`,
`.session-marker`, `.active-circle`, `monitor` as live state — plus the parenthesis naming
`circles/`, `shared/`, `archive/`, `stilwerk/`, `stashes/` and `.migration-v2-backup/` as out of
scope. Checked at HEAD `b54ace5`: the two groups tile the tree's ten exactly, with `.guard-state/`
split per file. No present error.

**The risk is recorded, not speculative.** The closed defect
`fusion-workbench/archive/260817-1907-safe-cleanup-scoped/shared/issues/260810-0504_c_the-tracked-workbench-section-re-enumerates-a-closed-list-and-leaves-one-surface-unclassified.md`
part 2 objected to this duplication when the two lists sat ten lines apart:

> It is a second enumeration of a closed list ten lines below the first, so a helper adding a
> root-anchored surface now has two places to land instead of one — the exact failure the paragraph
> above was written to prevent, arriving from inside the same document.

Its part 3 asked for the move that has now happened, and the move answers the audience objection
while making the duplication objection worse: the second place to land is no longer ten lines below
the first, it is a different file, emitted to nobody, that a coder adding a root-anchored surface has
no reason to open. `circles/260801-1244-curator/issues/260814-1419_c_*` is the recorded instance of
the pair drifting — three Plane files entered the tree and neither the per-surface argument nor the
tracked/untracked split was extended.

**What would have caught it and does not.** `derivable-enumerations-lint` has cases for the skill
roster, the agent counts, the always-on rule list, the conditional emission sets, the `hooks/lib`
table and the `bin/` roster. It has none for the layout tree, and none for its classification. Both
lists are prose in rule files and neither is derived from the other.

**Fix direction — a decision, not an edit.** Three shapes, and the choice is not obvious enough to
make in a fix:

1. Leave the duplication and extend the tree's own discipline sentence to name the second landing
   site by path, so the obligation is written where the person adding a surface is already reading.
   Cheapest, and it is the mechanism the tree already relies on.
2. Make the classification derive from the tree — the split file names groups, not entries, and the
   tree carries a per-row marker. Removes the second list; costs a format change to the tree and an
   argument about whether a rule file should carry machine-readable columns.
3. Add a lint case comparing the tree's root-anchored rows against the two groups. Answers it
   mechanically; adds a shipped test to a project whose last two Circles removed eight mechanisms,
   and both surfaces are prose so the parser is the fragile part.

Option 1 is the one that fits the project's stated preference and the one this record recommends, at
low confidence.

Found in the coderev pass over `52b1d95..b54ace5`, session `260818-2301`. No Circle active, so it is
filed in the shared store under the Origin Rule.

---
Resolved: Option 1: the layout tree's discipline sentence now names both landing sites by path, so a new root-anchored surface lands in the tree and in the record-or-live-state split in the same commit, and the obligation is written where the person adding a surface already reads. Two restatements were folded out while doing it: the emission-audience paragraph under the pointer, which the header table already carried verbatim, and the out-of-scope store list in `rules/workbench-tracking.md`, replaced by a citation of the tree. The ten root entries stay enumerated in their two groups, because that enumeration is the classification.
