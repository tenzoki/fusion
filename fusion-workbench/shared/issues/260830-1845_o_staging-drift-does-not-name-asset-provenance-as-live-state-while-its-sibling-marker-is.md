Staging drift does not name .asset-provenance as live state while its sibling marker is named
---
`LIVE_STATE` in `hooks/lib/staging-drift.ts` names `.fusion-setup` but not `.asset-provenance`. Both are class R3 in `rules/workbench-tracking.md`, so both are tracked and written by `/fusion:setup` in each checkout, so the two should classify the same way and do not. `.asset-provenance` falls through to `unclassified`.
---
**Filed by:** planner, Kai Stalmann <ks@qantr.com>

Evidence, at `cda72f71`: `git status --porcelain` in this repository lists `M fusion-workbench/.asset-provenance` beside `M fusion-workbench/.fusion-setup`. `classify()` returns `in-flight` for the second (its `LIVE_STATE` entry names `/fusion:setup` as the writer) and `unclassified` for the first, because no entry names it and it matches no store, no root record and no commit-message name. `rules/workbench-tracking.md:23` places both in class R3 with one reason covering the pair.

The consequence is mild and is why this is filed rather than fixed in passing: `unclassified` is never a fault, so nothing false is reported. What is lost is that a complete reading of a workbench prints a machine-written setup artifact under the heading that says nothing is claimed about it.

Adjacent but not the same mechanism: `260828-0853_*_setup-step-0j-misses-a-class-l-entry-that-is-untracked-but-not-ignored.md` is about the setup skill's own probe, not about the staging classifier.

Acceptance: `classify(".asset-provenance", "")` returns `in-flight` with a reason naming `/fusion:setup`, and `bin/fusion-staging-drift` prints it in the in-flight class over a workbench where it is modified.
