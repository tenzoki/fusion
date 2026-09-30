A crash of the scope or order entry exits 1, which the wrappers read as a caller's mistake
---
Node exits 1 on an uncaught exception or a failed module import. `hooks/scope.ts` and `hooks/order.ts` catch nothing around `main`, and 1 is a meaningful code on both routes: for `bin/fusion-paths <name> <item-dir>` it means "the item names no package" (caller's mistake), for `bin/fusion-claimed-package` (which `exec`s the entry) it means "stop", for `bin/fusion-work-order` it means "usage error". A fusion bug is thereby reported as the user's fault.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** 260929-1810_*_plan-fj03a-the-record-client-the-format-gate-and-scope-and-order-on-json.md

Evidence:
- `hooks/scope.ts` ends `process.exitCode = main(process.argv.slice(2));`; `hooks/order.ts` the same.
- `bin/fusion-paths`, the `<item-dir>` branch: `case "$ITEM_RC" in … 1) exit 1 ;;`, with no message of its own.
- `bin/fusion-claimed-package`: `exec node "$entry" claimed …`; its header defines 1 as the two stop causes only. `bin/fusion-paths` then prints "bin/fusion-claimed-package stopped".
- `hooks/lib/work-graph.ts` `orderOf` throws by design when an edge names no node ("a violation is a bug here"), which reaches the user as `bin/fusion-work-order` exit 1, documented there as "usage error".
- A realistic trigger besides a bug: an incomplete install whose `hooks/dist/scope.js` exists but an imported module (`hooks/dist/lib/stores.js`, `lib/record-client.js`) does not. The wrappers test only for the entry file.

`rules/fusion-workbench-conventions.md` `#### Exit codes` gives 4 to fusion's own faults, and `### Failure behaviour` says why exit 4 must not send the user to repair their workbench.

Fix direction: wrap each entry's `main` so an unexpected throw is reported as the entry's internal-error code (3 on the scope routes, which already means "unknown, never shared/"; 4 or a new code on the order route), with the stack on stderr.

Acceptance: a test injects a throw (or removes an imported dist module in a scratch install) and sees `bin/fusion-paths <name> <item-dir>` and `bin/fusion-claimed-package` exit 3, and `bin/fusion-work-order` exit neither 0 nor 1, each with nothing on stdout.

---
Resolved: `hooks/scope.ts` and `hooks/order.ts` import their modules inside a `try` and exit 3 on an internal error (a module missing from an install, or a throw), with the stack on stderr and nothing on stdout, never Node's own 1. On the scope routes 3 is "item in scope cannot be determined", which `bin/fusion-claimed-package` and `bin/fusion-paths <item-dir>` pass through; on the order route 3 is widened, on the coordinator's decision, to "the plugin itself could not run (compiled hooks or bundle missing, or an internal error in the order entry)" in the `bin/fusion-work-order` header and the `README-hooks.md` rows. Pinned by one case in `hooks/lib/__tests__/fusion-claimed-package.test.ts` that runs each compiled entry without its modules (exit 1 before, 3 after).
