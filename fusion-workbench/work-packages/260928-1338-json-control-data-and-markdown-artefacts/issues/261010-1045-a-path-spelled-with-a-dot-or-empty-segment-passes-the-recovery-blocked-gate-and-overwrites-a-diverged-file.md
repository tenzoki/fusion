A path spelled with a dot or empty segment passes the recovery-blocked gate and overwrites a diverged file
---
**Severity:** Medium. Breaks the kernel invariant "Nothing here ever overwrites a diverged file" (`codec/src/kernel.ts` header) for any caller that spells a path non-canonically.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Defect.** `codec/schemas/common.schema.json` `$defs.workbench_path` refuses `..` segments but admits `.` and empty segments (`shared/./issues/x.record.json`, `shared//issues/x.record.json`). `resolveInside` (`codec/src/store.ts`) normalises only for its containment check and hands the caller's spelling on. The kernel then compares paths as strings:

```ts
const blockedOn = (blocked: readonly Blocked[], path: string): Blocked | undefined => blocked.find((b) => b.paths.includes(path));
```

and the duplicate-write check `named` compares `x.path === path` the same way. A blocked intent names the canonical path, so an alias spelling is not recognised as blocked.

**Evidence.** Pattern read at 468d8e87. Run against the shipped bundle on a scratch workbench, with a hand-made blocked intent on a control file in the shared issues store and that file diverged: `transition` on the canonical path is refused `operation-unknown/recovery-blocked`; the same request with a `/./` segment inserted between the shared root and the issues store answers `ok:true` and writes `in_progress` over the diverged file. The answer echoes the non-canonical path.

**Acceptance test.** Either the schema refuses `.` and empty segments in `workbench_path` (with invalid fixtures for both), or the codec canonicalises once at entry and every comparison, journal entry and answer uses only the canonical form. The run above is refused `recovery-blocked` under both spellings.
