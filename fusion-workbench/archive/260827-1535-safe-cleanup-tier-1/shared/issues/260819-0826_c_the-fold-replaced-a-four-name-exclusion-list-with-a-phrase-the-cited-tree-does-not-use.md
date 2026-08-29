The fold replaced a four-name exclusion list with a phrase the cited tree does not use

---

`260819-0042_*_the-move-turned-an-adjacent-duplicate-enumeration-of-the-root-entries-into-a-cross-file-one.md`
paid for its addition by folding out two restatements. The second fold, in
`rules/workbench-tracking.md:9`, replaced the four names that bound the split's scope with a citation
of the layout tree — and the tree labels two of those four as something other than an artifact store,
so the scope sentence no longer resolves against the thing it cites.

---

**Before** (`rules/workbench-tracking.md:9` at `5ec26b2`):

> the split below ranges over **every root entry outside the artifact and legacy stores**
> (`circles/`, `shared/`, `archive/`, `stilwerk/`, all simply tracked, and any `stashes/` or
> `.migration-v2-backup/` a workbench still carries, which follow `archive/`)

**After** (at `83488e9`):

> the split below ranges over **every root entry outside the artifact and legacy stores** (the layout
> tree names the artifact stores and the paragraph under it the two legacy ones; all of them are
> simply tracked)

**The legacy half resolves.** `rules/fusion-workbench-conventions.md:73` is the paragraph directly
under the tree and names both `stashes/` and `.migration-v2-backup/`. Clean.

**The artifact half does not, for two of four.** The tree at `:25-63` labels `circles/` as
"one directory per unit of work" and `shared/` as "everything with no Circle affiliation" — readable
as artifact stores. It labels `archive/` as "target of cleanup's archive step" and `stilwerk/` as
"stylometric profiles". Neither is an artifact store by the tree's own words, and `stilwerk/` holds
four voice profile files rather than artifacts at all. A reader asked to derive the exclusion set
from the tree has no criterion that picks out exactly those four and leaves the eight root files and
directories beneath them.

**The mitigation, stated so the severity is not overstated.** The set *is* recoverable from the other
end: the split's two groups name ten entries — `orchestrator-events.jsonl`,
`.guard-state/events.jsonl`, `portfolio.md`, `.fusion-setup`, `agentstate.yaml`,
`orchestrator-live.md`, `.guard-state/` otherwise, `.commit-lock/`, `.session-marker`,
`.active-circle`, `monitor` — which is every root entry in the tree except those four. Checked at
HEAD: the two groups tile the tree exactly, so the residual is the exclusion set and nothing falls
through in practice. What was lost is the ability to read the scope forward instead of inferring it
backward from the answer.

Verified at HEAD `83488e9` by reading `rules/workbench-tracking.md:9-12` against
`rules/fusion-workbench-conventions.md:24-73`, and by tiling the two groups against the tree's root
entries by hand.

**Fix direction.** Restore the four names, or make the tree carry the label the citation assumes —
one word in the tree's comment column for `archive/` and `stilwerk/`. The first is four tokens and
undoes the fold's saving; the second keeps it and puts the criterion where the citation points.

Found in the coderev pass over `5ec26b2..83488e9`, session `260818-2301-orchestrator-session.md`, Turn 2. No Circle active,
so it is filed in the shared store under the Origin Rule.

---
Resolved: fixed — verified at HEAD: the scope sentence no longer says 'artifact and legacy stores'; the four-class partition names circles/, shared/, archive/, stilwerk/ and the two frozen stores in its R1 row, so the scope reads forward again; rules/workbench-tracking.md:21
