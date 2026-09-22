`fusion-work-order.test.ts` creates a bare temp directory for its exit-2 case and never removes it
---
`hooks/lib/__tests__/fusion-work-order.test.ts:52` (since `01a4a5bb`, plan step 28): `expect(run(mkdtempSync(join(tmpdir(), "fusion-work-order-bare-"))).status).toBe(2);`. Every other fixture goes through `scratch()`, which pushes its root onto `roots` for the `afterAll` at `:15`; this one is created inline and pushed nowhere, so one `fusion-work-order-bare-*` directory is left under the OS temp directory per suite run.

Acceptance: the exit-2 case's directory is pushed onto `roots` (or created through a helper that is), so a run leaves no `fusion-work-order-bare-*` directory behind: `ls "$TMPDIR" | grep -c fusion-work-order-bare` prints `0` after `npx vitest run fusion-work-order`; `cd hooks && npm test` exits 0 (hook-test head-room is 15 lines at `bf515cad`, so the edit is line-neutral).
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
Executor: `coder`. Found in the closing review `260922-1208-reviewer-closing-pass-over-the-51-issue-package-451bb312-to-bf515cad.md`.

---
Resolved: a one-line `bare()` helper beside `scratch()` in `hooks/lib/__tests__/fusion-work-order.test.ts` makes the directory, pushes it onto `roots` and returns it, and the exit-2 case calls it, so the `afterAll` removes it with every other fixture. Measured: `npx vitest run fusion-work-order` exits 0 and `ls "$TMPDIR" | grep -c fusion-work-order-bare` prints `0` after it, against 48 directories the defect had already left under the OS temp directory, which were removed by hand in the same pass. The line-neutral in-place form the acceptance assumed is not taken: step 3 of this package freed 44 hook-test lines, so the readable helper is funded at +2 lines and a test whose cleanup is legible is the point of the fix.
