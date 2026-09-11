The Origin Rule names a work item's `**Cross-references:**` header, and the item template does not define one
---
`rules/fusion-workbench-conventions.md` `## Origin Rule (Herkunftsregel)`, corollary 2, instructs: "If one item's decision binds a later item, the later item references it by basename in its `**Depends-on:**` or `**Cross-references:**` header." The work-item template in `## Backlog entries — work items` of the same file defines five head fields (`**Domain:**`, `**Status:**`, `**Claim:**`, `**Depends-on:**`, `**Filed by:**`) and closes with "Every other field is always written", which is a statement over those five. `**Cross-references:**` is not among them. A writer following the corollary writes a field the grammar does not define; a writer following the template has no head-field home for a citation that is not an ordering edge.
---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>

The two readings are not distinguished by the text. Under the narrow one the corollary means a decision record's header, which does carry `**Cross-references:**` (`## Decision Record Template`), and the sentence is merely loose about which record it is describing. Under the plain one a work item carries the field and the template omits it.

It bears on an open choice rather than only on tidiness: `260911-1916-re-grounding-three-open-decisions.md` `### F2` puts an option before the user that would give the non-blocking citation its own work-item field, and that option's cost depends on whether the field is already asserted to exist.

Neither `bin/fusion-paths` nor any hook test reads a work item's `**Cross-references:**`; grepped over `hooks/lib/` and `hooks/lib/__tests__/` at `a3977760`, nothing reads a work item head field beyond `**Status:**` and `**Claim:**`, so nothing fails today either way.

**Acceptance test:** `rules/fusion-workbench-conventions.md` states in one place whether a work item carries `**Cross-references:**`. Either the template defines the field and says when it is written, or the Origin Rule's corollary names the record kind it means, and a reader of either section reaches the same answer.
