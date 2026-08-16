The write trace is now the guard's only product, and two of its four tools reach no integration case

---

After this Circle the hook has two products, and one of them is the `guard_allow` row
(`hooks/guard.ts:8-10`). The row's `file` field comes from `extractFilePath`
(`hooks/guard.ts:98-109`), which has two branches:

```ts
if (typeof toolInput.file_path === "string") return toolInput.file_path;      // Write, Edit, MultiEdit
if (typeof toolInput.notebook_path === "string") return toolInput.notebook_path;  // NotebookEdit
return null;                                                                  // Bash
```

Grepped across `hooks/lib/__tests__/**`: the strings `notebook_path`, `NotebookEdit` and
`MultiEdit` appear in exactly one file, `hooks-wiring.test.ts`, and only as matcher entries in
`hooks.json`. Every integration case that exercises the hook goes through `runWrite`
(`helpers/guard-harness.ts:747-755`), whose `toolName` defaults to `Edit` and which is called with
an explicit tool name in one place only (`legacy-halt-clearing.test.ts:125-129`, also `"Edit"`).

So: the `notebook_path` branch has no case at all, and `MultiEdit`/`NotebookEdit` never reach the
hook in any test. The `file_path`/`null` branches are covered
(`guard-bash-integration.test.ts` "allows a file_path and appends exactly one guard_allow naming
it", and the Bash silence cases).

**This is not a regression of this Turn** — the same grep over `3c2e1c6` returns the same single
file. It is filed here because this Circle is what changed its weight: until 2026-08-16 the write
path had denies, counters and a fingerprint on it and the row was one product among several;
`hooks/guard.ts:8-10` now calls the trace "the only record of what the write surface did", and
`bin/monitor` renders it. An untested branch of the only thing a mechanism produces is a different
proposition from an untested branch of one of five.

**Cheapest closure:** `runWrite` already takes a tool name. One case per tool in
`guard-bash-integration.test.ts`'s "the Edit write path allows and records" describe, asserting the
row's `file`, covers all four and the notebook branch with it.

**Severity:** Low. No defect is known to be behind it; what is missing is the evidence that there
is not.

**Scope:** the plugin's hook test surface.

**Cross-references:**
- `hooks/guard.ts:90-109`, `:197-208`
- `hooks/lib/__tests__/helpers/guard-harness.ts:747-755`
- `circles/260816-1741-guard-becomes-observation-only/planning/260816-1915_p_the-compliance-guard-becomes-observation-only.md` `## Testing Strategy`
