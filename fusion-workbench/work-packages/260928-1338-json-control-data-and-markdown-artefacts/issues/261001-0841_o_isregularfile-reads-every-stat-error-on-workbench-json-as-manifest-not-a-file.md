isRegularFile reads every stat error on workbench.json as manifest-not-a-file
---
`codec/src/store.ts` `isRegularFile` returns `false` from a bare `catch` on any `statSync` failure. A manifest that cannot be read (`EACCES`), a symlink loop (`ELOOP`) or an I/O error is therefore diagnosed `schema-invalid/manifest-not-a-file`, which points the user at the wrong cause. `entryExists`, directly above it, rethrows everything but `ENOENT`. Initialize plan step 3 departure (d) intends only the dangling link to read as not-a-file.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260930-1654_*_plan-initialize-the-codec-creates-a-new-workbench-and-list-names-its-state.md (step 3 (d)), 261001-0837-reviewer-fj03b-initialize-and-fj03c.md

Severity: Low. Scope: `codec/src/store.ts`.

**Evidence:** `codec/src/store.ts`: `function isRegularFile(path: string): boolean { try { return statSync(path).isFile(); } catch { return false; } }`.

**Fix direction:** return `false` only for `ENOENT` (the dangling link). Rethrow or type every other code, as `entryExists` does.

**Acceptance:** a case in `codec/src/__tests__/store.test.ts` with a `chmod 000` directory holding `workbench.json`, or a self-referencing link at `workbench.json`. It is not reported `manifest-not-a-file`, and it is red against the current code. Recorded sessions replay unchanged.
