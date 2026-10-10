A narrative that is a directory or unreadable makes the codec throw and exit 1 for every workbench-wide read
---
**Severity:** Medium. One stray directory or one `chmod 000` narrative answers no JSON for `list`, `validate`, `reconcile`, `show`, and for `set-dependencies` on any package; through `hooks/lib/scope.ts` it halts every agent's Setup.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Defect.** `codec/src/store.ts` `narrativeOf` checks existence, not file type or readability:

```ts
if (!abs.ok || !existsSync(abs.value)) return { path: n.path, sha256: null };
return { path: n.path, sha256: revisionOf(readFileSync(abs.value)) };
```

`existsSync` is true for a directory and for an unreadable file, so `readFileSync` throws `EISDIR`/`EACCES` out of the bundle. `storedHash` four lines above already guards with `statSync(...).isFile()`; `narrativeOf` does not. The same unguarded read stands in `readPair` (`store.ts`, rethrows all but ENOENT), `resolveRecordId` (`kernel.ts`), `narrativeEntries` and `indexedContext.build` (`codec/src/cli/ops.ts`). `controlFiles` (`store.ts`) silently drops a directory it cannot list.

This breaks the contract in the `bin/fusion-record` header and `codec/src/cli/main.ts` ("every answer is on stdout with exit 0") and `ops.ts`'s "Never throws for a state of the request or the workbench".

**Evidence (run 261010 against `codec/dist/fusion-record.js` at 468d8e87).** A scratch copy of `codec/fixtures/protocol-session-takeover/base` with the fixture's open package narrative (in the container store, under the package `260928-1200-open-package`) replaced by a directory: `{"op":"list"}` prints `fusion-record: Error: EISDIR: illegal operation on a directory, read` and a stack, nothing on stdout, exit 1. `validate`, `reconcile`, `show` and `set-dependencies` on another package do the same; `chmod 000` gives `EACCES`. With an imported package's narrative made a directory, `claimedBy` in `hooks/dist/lib/scope.js` answers `unknown/unanswered`, so `bin/fusion-paths` and `bin/fusion-claimed-package` exit 3.

Same class as the closed `260930-1654_*_a-directory-named-workbench-json-makes-the-bundle-throw-and-exit-1-instead-of-answering.md` and `261001-0841_*_inspect-throws-and-exits-1-when-json-state-or-its-journal-is-not-a-directory.md`, whose fixes reached only `workbench.json` and `.json-state/`.

**Acceptance test.** With a narrative (and separately a control file) replaced by a directory, and with one at mode 000, `list`, `validate`, `reconcile`, `show` and `set-dependencies` each answer JSON on stdout with exit 0: a typed refusal or a finding naming the path, never a stack. An unlistable store directory is reported, not skipped. Fixtures pin each case.
