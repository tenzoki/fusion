
> This project still carries leftover files in `fusion-workbench/.guard-state/` (`escalation.json`, halt flag present; `churn.json`). The mechanisms that wrote them are no longer part of fusion and no current version reads them, so nothing is being blocked. Delete the leftover files?

Two options. **"Delete them" is the default and the recommended choice:**

```bash
rm -f ./fusion-workbench/.guard-state/escalation.json ./fusion-workbench/.guard-state/churn.json ./fusion-workbench/.guard-state/state-drift.json
```

"Keep them" is the other: nothing is written, the run continues, and the offer comes back the next time this selector runs.

**Name the effect exactly, and claim nothing beyond it.** Deleting the files removes leftovers. It does not clear a halt, unblock writes or restore write access, because at this version nothing is blocked and nothing was taken away. Report it in those terms: which files were deleted and nothing about what is allowed changed, or the files were left in place.

## claude-md — where `CLAUDE.md` carries its weight

```bash
