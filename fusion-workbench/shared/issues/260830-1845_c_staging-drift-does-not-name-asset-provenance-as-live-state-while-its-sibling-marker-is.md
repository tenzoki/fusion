Staging drift does not name .asset-provenance as live state while its sibling marker is named
---
`LIVE_STATE` in `hooks/lib/staging-drift.ts` names `.fusion-setup` but not `.asset-provenance`. Both are class R3 in `rules/workbench-tracking.md`, so both are tracked and written by `/fusion:setup` in each checkout, so the two should classify the same way and do not. `.asset-provenance` falls through to `unclassified`.
---
**Filed by:** planner, Kai Stalmann <ks@qantr.com>

Evidence, at `cda72f71`: `git status --porcelain` in this repository lists `M fusion-workbench/.asset-provenance` beside `M fusion-workbench/.fusion-setup`. `classify()` returns `in-flight` for the second (its `LIVE_STATE` entry names `/fusion:setup` as the writer) and `unclassified` for the first, because no entry names it and it matches no store, no root record and no commit-message name. `rules/workbench-tracking.md:23` places both in class R3 with one reason covering the pair.

The consequence is mild and is why this is filed rather than fixed in passing: `unclassified` is never a fault, so nothing false is reported. What is lost is that a complete reading of a workbench prints a machine-written setup artifact under the heading that says nothing is claimed about it.

Adjacent but not the same mechanism: `260828-0853_*_setup-step-0j-misses-a-class-l-entry-that-is-untracked-but-not-ignored.md` is about the setup skill's own probe, not about the staging classifier.

Acceptance: `classify(".asset-provenance", "")` returns `in-flight` with a reason naming `/fusion:setup`, and `bin/fusion-staging-drift` prints it in the in-flight class over a workbench where it is modified.

---
Reconciled 260905-2015 (reconciler, HEAD `5b84b13a`): still open, and reproduced rather than inferred.

`LIVE_STATE` in `hooks/lib/staging-drift.ts:178-187` holds eight entries and `.asset-provenance` is
not among them; `.fusion-setup` is, at `:186`. Running `bin/fusion-staging-drift` over this
repository's own dirty tree prints the pair side by side, which is the acceptance's negative:

- `unclassified    M .asset-provenance  (not a record store and not live state — nothing is claimed about it)`
- `in-flight       M .fusion-setup  (the setup marker — written by /fusion:setup)`

The consequence is still mild for the reason the record gives: `unclassified` is never a fault and the
verdict reads `clean`.

---
Resolved: 12dee877 — LIVE_STATE gained .asset-provenance beside .fusion-setup, so both class R3 entries classify the same way and neither falls through to unclassified. The list doc comment no longer counts its own members, which is what went stale when an entry was added; it names the classes it holds in full, so the property to check when the layout gains a root-anchored entry is stated rather than implied.
