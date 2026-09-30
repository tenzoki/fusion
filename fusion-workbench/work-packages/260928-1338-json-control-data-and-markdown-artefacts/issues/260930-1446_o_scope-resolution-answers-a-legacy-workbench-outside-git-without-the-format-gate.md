Scope resolution answers a legacy workbench outside a git work tree without the format gate
---
`bin/fusion-claimed-package` exits 0 with no output when `bin/fusion-identity` exits 4 (not a git work tree), before `hooks/dist/scope.js` and its `inspect` gate run. So in a project without git a legacy or unsupported workbench is never refused: `bin/fusion-paths <agent>` resolves into `shared/`, exit 0.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** 260929-1810_*_plan-fj03a-the-record-client-the-format-gate-and-scope-and-order-on-json.md, 260929-1810_*_list-answers-a-legacy-workbench-with-an-empty-list-and-names-no-state.md

Evidence: `bin/fusion-claimed-package`, the `case "$id_rc"` branch `4)` (`exit 0`) precedes `exec node "$entry" claimed …`. The header's "Exit 3 is unknown scope, and a tree that is not a git work tree is not it" argues that no claim is held there, and says "the codec is not asked at all". It argues about the claim, not about the workbench's format.

Contract: the plan's `## Directive` ("a workbench that is not JSON-controlled is refused by name"); Prior's ruling on request 28 at Prior `ad21e58`, recorded in `codec/fixtures/prior/REQUESTS.md` `## FJ03a (the first consumers)` at `cb7ea19f`: "a consumer that derives scope, work order or dispatch calls `inspect` at its start and proceeds only on `json-control`". `hooks/lib/scope.ts` `claimedBy` and `isPackage`, and `hooks/lib/work-graph.ts` `readWorkGraph`, all gate first. This branch is the one scope path that does not.

Fix direction: run the gate before the not-a-work-tree answer (for example a `scope.js` subcommand that gates only), keeping exit 0 and no output for a JSON-controlled workbench outside git. Or record a decision that the format gate does not apply where no claim can be held, and state it in the header.

Acceptance: `bin/fusion-claimed-package` and `bin/fusion-paths <agent>` in a project that is not a git work tree, with a workbench lacking `workbench.json`, exit 3 with `legacy` on stderr and nothing on stdout; the same project with a manifest still exits 0 with no output.
