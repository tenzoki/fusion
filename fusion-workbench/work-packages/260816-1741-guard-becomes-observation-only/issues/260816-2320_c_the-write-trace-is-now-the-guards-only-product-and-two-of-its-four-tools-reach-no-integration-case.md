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
- `260816-1915_*_the-compliance-guard-becomes-observation-only.md` `## Testing Strategy`

---
Reconciliation 2026-08-17, Phase 3. **Left OPEN. Re-measured at HEAD and the gap is unchanged.**

`grep -rn 'NotebookEdit\|MultiEdit\|notebook_path' hooks/lib/__tests__/` returns exactly one hit
at HEAD: `hooks-wiring.test.ts:70`, and it is still the matcher-list assertion rather than a call
through the hook. So the `notebook_path` branch of `extractFilePath` has no case, and neither
`MultiEdit` nor `NotebookEdit` reaches `guard.ts` in any test. The record's own reading of the
severity holds: no defect is known to be behind it; what is missing is the evidence that there is
not.

The weight the record describes is now fully realised rather than anticipated. v10.0.0 shipped
(tag at `e331332`), so the `guard_allow` row is the released product's only output on the write
path, `bin/monitor` renders it, and `docs/working-model.md:118` presents it to users as "the only
record of what the write surface did" — naming all four tools while two of them reach no case.

The cheapest closure the record names is still available and still cheap: `runWrite` already
takes a tool name, so four cases in `guard-bash-integration.test.ts` asserting the row's `file`
cover all four tools and the notebook branch with them. That is an addition to the hook test
surface, which is the one surface whose growth baseline was re-armed this Circle and which
therefore has head-room.

---
Reconciliation 2026-08-17, second Phase-3 pass. **Left OPEN, re-measured at HEAD `d0f13fa`.**
`MultiEdit` and `NotebookEdit` still appear under `hooks/lib/__tests__/` in one file only,
`hooks-wiring.test.ts`, where they are matcher entries rather than integration cases; outside the
tests they appear in `hooks/guard.ts` and `hooks/tracker.ts` alone. Two of the four tools of the
guard's only remaining product still reach no integration case. Left open by explicit user decision.

---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass, third pass) — STAYS `_o_`. Re-measured at HEAD `e435f03`; the gap is unchanged and the surface around it moved without closing it.**

```
grep -rn 'NotebookEdit\|MultiEdit\|notebook_path' hooks/lib/__tests__/
  hooks/lib/__tests__/hooks-wiring.test.ts:70:
    for (const tool of ["Write", "Edit", "MultiEdit", "NotebookEdit"]) {
```

One hit, still the `hooks.json` matcher-list assertion rather than a call through the hook. The `notebook_path` branch of `extractFilePath` still has no case, and neither `MultiEdit` nor `NotebookEdit` reaches `guard.ts` in any test.

**`helpers/guard-harness.ts` was edited since the closure and the four cases were not added.** `git diff --stat d0f13fa..HEAD -- hooks/lib/__tests__/helpers/guard-harness.ts` is non-empty, so the file the record names as already holding the cheap remedy — `runWrite` takes a tool name — has been opened and worked in twice since, without anyone reaching for it. That is the second miss on this file.

**Live obligation, and of the eight open records in this Circle it is the one that most directly binds a deep change.** The record's own severity reading is Low and stays Low; what has risen is the consequence of being wrong. Three shipped releases now depend on the `guard_allow` row being the whole product of the write path (`hooks/guard.ts:7-10`, `README-hooks.md:9`, `CLAUDE.md`, `docs/working-model.md:118`), all four tools are named to the user as covered, and two of them have never been through the hook in a test. A change that touches `extractFilePath` or the `answer` call around it will be verified by a suite that exercises `Edit` and Bash and nothing else.

The remedy is still four cases in `guard-bash-integration.test.ts`'s existing describe, asserting the row's `file` — and the hook-test surface still has the head-room this Circle armed for it.

---
Resolved: the cheapest closure this record named, taken as written. `hooks/lib/__tests__/guard-bash-integration.test.ts` now puts all four write tools through the hook — `Write` and `MultiEdit` via `runWrite(root, path, "<tool>")`, `NotebookEdit` via `runGuard(root, "NotebookEdit", { notebook_path: path })` — and each of the four asserts the event list is exactly one `guard_allow`, that its `tool` is the name the case passed, and that its `file` names the path. The `tool` assertion was added to the pre-existing `Edit` case too, which pins the harness default as a side effect. 16 cases where there were 12.

Asserting `tool` and not only `file` is what makes the four cases worth having: a case asserting `file` alone would still pass if the harness fell back to its default tool name, which is the failure they exist to rule out.

The `notebook_path` branch was demonstrated failing, not only passing: removing it from `extractFilePath` in a detached worktree reddens exactly the new NotebookEdit case, on the `file` assertion at line 198, while its `guard_allow` and `tool` assertions stay green. That is the correct blast radius — the branch's removal costs the row its `file` field and nothing else.
