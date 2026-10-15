store-name-migration.test.ts: two regression cases pin less than their names claim
---
(1) "a JSON-controlled v12 workbench still citing circles/ is offered the write" never asserts the workbench is JSON-controlled: the sweep's census prints `format=`, and the case would pass unchanged if `jsonWorkbenchAt` produced a Markdown-controlled tree. (2) "the routing the blocks cannot carry" checks that Step 5 contains "run `/fusion:migrate` again" anywhere, not that the stop is bound to `MODE=git`, and nothing asserts that `MODE=plain` goes on to Step 6.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261015-1310-reviewer-closing-pass-over-the-migrate-step-6-package.md`

**Evidence.** `hooks/lib/__tests__/store-name-migration.test.ts`, `describe("Step 6 as shipped: …")`: the JSON case asserts only `[r.exit, r.rewrites > 0]`; the routing case asserts `toMatch(/run \`\/fusion:migrate\` again/)` over the whole Step 5 slice.

**Fix direction.** In the JSON case, also assert the census line `format=json-control` on stdout. In the routing case, assert the sentence that carries the stop names `MODE=git`, and that the `MODE=plain` sentence names Step 6.

**Acceptance.** Each case goes red when the property its name states is removed: the JSON case on a legacy fixture, the routing case when the stop loses its `MODE=git` condition or plain mode loses its route to Step 6.
