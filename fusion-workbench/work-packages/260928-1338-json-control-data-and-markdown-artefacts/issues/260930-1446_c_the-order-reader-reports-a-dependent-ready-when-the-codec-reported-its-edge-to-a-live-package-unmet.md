The order reader reports a dependent `ready` when the codec reported its edge to a live package unmet
---
When a live prerequisite has any `reconcile` `records` finding, `hooks/lib/work-graph.ts` `readWorkGraph` removes it from the nodes and turns every `dependency-unmet` edge naming it into `unresolved=… target-unreadable`. The dependent's readiness is then left untouched and reads `ready`, although the codec evaluated the edge and said `unmet`. The mandated `note=` line then says these are "entries the codec could not resolve to a package", which is false for this reason.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** Medium
**Cross-references:** 260929-1810_*_plan-fj03a-the-record-client-the-format-gate-and-scope-and-order-on-json.md, 260930-1446_*_scope-resolves-a-package-the-codecs-own-validation-refuses-while-the-order-reader-names-it-unreadable.md

Evidence: `hooks/lib/work-graph.ts` `readWorkGraph`, the last `else` of the dependency loop (`unresolved.push(… "target-unreadable" …)`). Reproduced 2026-09-30 on a scratch workbench written by the committed bundle: package `a` open and claimed, package `b` `depends_on` `a` under `terminal`, `a`'s narrative deleted. `node hooks/dist/order.js` prints `ready=1`, the row `1 0 0 ready 260930-1001-b`, `unresolved=260930-1001-b wants <a's id>: target-unreadable`, `unreadable=260930-1000-a: unresolved-reference/narrative-missing`. The codec's own rule says `b` may not start: `a` is `open`.

Contract: the plan's `## Data Structures` table puts `unmet`, reason `dependency-unmet`, on a live package's row into "a resolved edge", and keeps `unresolved` for a target that is "none, or no package". The target here is a listed live package. Step 4's Done note (1) records the behaviour and calls it "over-strict for `narrative-missing`"; in effect it is over-permissive for the dependent. The pinning test asserts it (`hooks/lib/__tests__/work-graph.test.ts`, "places each edge entry by the table", `{ from: tip, target: "6", reason: "target-unreadable" }`), with `tip` blocked anyway by another row, so the test never shows the dependent's readiness under this path alone.

Fix direction: an edge the codec reported `unmet` with reason `dependency-unmet` blocks its dependent whatever this reader concluded about the target. Where the target left the graph, place it like the terminal case (an `unmet=` row that blocks), or keep the node in the graph and name the finding beside it. `unresolved=` stays for entries the codec itself could not resolve.

Acceptance: over the reproduction above, `b` reads `blocked`, `ready=0`, and no `note=` sentence claims the codec could not resolve `b`'s entry. A test case with a dependent whose only prerequisite is a live package carrying a finding, red against the current reader.

---
Resolved: `hooks/lib/work-graph.ts` `readWorkGraph`: a `dependency-unmet` entry is a resolved edge when its target is a node and an `unmet=` row that blocks the dependent otherwise (terminal, unreadable or unlisted); `unresolved=` holds only entries the codec could not resolve, so the `note=` sentence is true again. `hooks/lib/__tests__/work-graph.test.ts` "places each edge entry by the table" now carries a dependent whose only prerequisite is a live package with a finding, red against the old reader (`ready`) and green after. The reproduction prints `ready=0`, `b` blocked, no `note=`.
