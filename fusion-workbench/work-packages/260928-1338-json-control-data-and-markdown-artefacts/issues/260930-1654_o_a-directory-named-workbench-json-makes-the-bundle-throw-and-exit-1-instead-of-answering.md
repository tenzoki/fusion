A directory named `workbench.json` makes the bundle throw and exit 1 instead of answering
---
`openWorkbench` in `codec/src/store.ts` tests the manifest with `existsSync` and then reads it with `readFileSync`. When `workbench.json` is a directory the read throws `EISDIR`, `dispatch` does not catch it, and `codec/dist/fusion-record.js` prints a stack trace on stderr and exits 1. Every operation is affected, `inspect` included. `codec/README.md` `## The CLI` promises exit 0 for every answered request, and 2 and 3 only for usage errors and uncompilable schemas.
---
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260930-1654_*_plan-initialize-the-codec-creates-a-new-workbench-and-list-names-its-state.md

Evidence: measured on 2026-09-30 through the bundle at fusion `57c5ac7c` (`sha256:5f116c6436175a6b8e1cb08aa2625d2e2f68ef193657b00eb1891ea8d3b965bd`). Over a scratch directory holding only a directory `workbench.json`, `{"op":"inspect","workbench":"<dir>"}` printed `fusion-record: Error: EISDIR: illegal operation on a directory, read … at openWorkbench …` on stderr and exited 1.

Acceptance: a manifest entry that is not a regular file makes `openWorkbench` answer `unsupported` with a named diagnosis; `inspect` shows it with exit 0; every other read refuses with it; `initialize` refuses such a target `conflict/manifest-present`. A case in `codec/src/__tests__/store.test.ts` pins it. Executor: `code-implementer`, in step 3 of the plan cited above.
