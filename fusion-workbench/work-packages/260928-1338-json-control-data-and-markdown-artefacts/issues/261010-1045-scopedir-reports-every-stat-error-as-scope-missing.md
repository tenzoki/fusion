scopeDir reports every stat error as scope-missing
---
**Severity:** Low. An EACCES or ELOOP on a `list` or `reconcile` scope is answered as "is not a directory", the wrong cause.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Defect.** `codec/src/cli/ops.ts`, `scopeDir`:

```ts
try {
  isDir = statSync(abs.value).isDirectory();
} catch {
  isDir = false;
}
if (!isDir) return { ok: false, response: fail("unknown-scope", "scope-missing", `${scope} is not a directory in ${wb.root}`) };
```

**Evidence.** Read at 468d8e87.

**Acceptance test.** Only ENOENT and ENOTDIR map to `scope-missing`; any other stat error answers its own typed reason naming the error code. A test pins a mode-000 parent directory.
