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

Resolved: `isRegularFile` in `codec/src/store.ts` now returns not-a-file only for `ENOENT`, the dangling link. Every other `stat` failure is returned as its error code, and `openWorkbench` answers it `unsupported` with `schema-invalid/manifest-unreadable`, detail `workbench.json in <root> cannot be examined (<code>)`, never a throw (request 41 as the archive-revision plan states it). `entryExists` is unchanged, so a `chmod 000` workbench root still fails there, before this function. The tested cases are therefore the two link cases. `codec/src/__tests__/store.test.ts` covers a self-referencing `workbench.json` link (`ELOOP`) and a link into a `chmod 000` directory (`EACCES`), each `manifest-unreadable` with its code. The dangling link stays `manifest-not-a-file` (existing case). `ops.test.ts` runs the link loop through the bundle (`inspect`, exit 0). Red against the base: the loop read `manifest-not-a-file` in source and bundle, and so did the `EACCES` link through the base bundle in a probe. Recorded sessions and the handback replay unchanged. `codec/README.md` `## The CLI` names the reason. Archive-revision plan step 2 (`261001-1030_*_plan-the-archive-revision-archive-leaves-json-control-and-json-archival-follows-its-qualification.md`); bundle `sha256:381666bce9c00d72b41acbcca632ee5b924ce9affb99722bde77c64617e95ced`.
