# The churn stand-down still asks cwd, and the comment justifying that was falsified by the same commit

---

`hooks/tracker.ts:770-771` states, as the reason the churn stand-down asks a different
directory than the protected-path measurement does: *"Churn is keyed on paths relativized
against `process.cwd()`, so cwd is the directory it must ask about."* Commit `25c5454`
made that false in the same file. Churn is now keyed against the workbench root
(`churnKey(rawFilePath, process.cwd(), findWorkbenchRoot())`, `hooks/tracker.ts:680`), so
the one fact the two-gate split rests on no longer holds.

---

## Evidence

`hooks/tracker.ts:766-781`:

```ts
  // Self-detect: cwd is fusion's own repo, so CHURN stands down — plugin
  // development edits are not meaningful churn signal.
  //
  // This gate is no longer what stands the MEASUREMENT down, and the two are
  // separated on purpose. Churn is keyed on paths relativized against
  // `process.cwd()`, so cwd is the directory it must ask about. The measurement
  // is anchored at the workbench root, so it has to ask about THAT directory,
  // and it does — `measurementRoot()` folds its own plugin-repo stand-down in.
  if (isFusionPluginCwd()) {
```

`hooks/tracker.ts:680` is the line that falsifies it:

```ts
  const filePath = churnKey(rawFilePath, process.cwd(), findWorkbenchRoot());
```

`hooks/lib/churn.ts:224-232` confirms the anchor: `projectRelative(resolve(cwd, rawFilePath), root)`,
where `root` is `findWorkbenchRoot()`. `KEY_ANCHOR = "workbench-root"` (`hooks/lib/churn.ts:59`).

## The behavioural half, measured

`bin/fusion-plugin-cwd` and its TS twin `isFusionPluginCwd()` check `./.claude-plugin/plugin.json`
at cwd with no upward walk. Verified in this checkout:

```
$ (cd fusion-workbench && bin/fusion-plugin-cwd); echo $?   → 1   (does NOT stand down)
$ bin/fusion-plugin-cwd; echo $?                            → 0   (stands down)
```

So in the fusion plugin's own repository:

- a session started at the repo root records no churn at all, and never migrates the
  state file;
- a session started in `fusion-workbench/` — which `CLAUDE.md` calls "the ordinary case
  here" — records churn, **and** triggers the on-disk migration that rewrites
  `fusion-workbench/.guard-state/churn.json`. Measured against the live file: 592 entries
  in, 415 out.

That is the same shape as the defect `25c5454` closed: what gets counted depends on which
directory the session started in. The protected-path measurement does not have it, because
`measurementRoot()` (`hooks/lib/protected-snapshot.ts:678-683`) asks `isFusionPluginRoot(root)`
about the root it walked up to.

## Scope

`hooks/tracker.ts` only. No consuming project is affected — `isFusionPluginCwd()` is false
in every project that is not this one, so the gate never fires there. The cost is confined
to the plugin's own repository and to the correctness of the comment, which `CLAUDE.md`'s
"both halves stand down here" doctrine leans on when a reader asks why there are three
gates and not two.

## Recommendation

Either change the gate to ask the root (`isFusionPluginRoot(findWorkbenchRoot())`, the
same question `measurementRoot()` already answers), which makes churn stand down uniformly
here and removes the cwd dependence; or keep `isFusionPluginCwd()` and rewrite the comment
to state the reason that actually holds. Do not leave the comment as written: it argues
from a premise the file below it contradicts.

## Cross-references

- `fusion-workbench/shared/issues/260809-2023_c_the-churn-map-is-keyed-by-the-sessions-cwd-and-never-pruned-so-setups-thrashing-read-ranks-dead-paths.md`
- `fusion-workbench/shared/decisions/260810-0920_i_what-should-a-churn-key-be-anchored-to-and-what-happens-to-the-535-entries-already-recorded.md`
- Filed by `coderev`, review `shared/reviews/260810-1632-coderev-turn-1-range-430d73a-to-head.md`
