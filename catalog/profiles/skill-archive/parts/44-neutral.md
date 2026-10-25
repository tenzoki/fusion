```

Step 5 names every `candidate=` unit, and every `held=` and `refused=` line with what it gives (the binding's source, pointer and target, or the state), as a safety filter in the manifest too. Exit 6 means every unit is held; any other non-zero exit moves no record unit this run, and Step 5 says why from stderr. A changed scope at Step 6 re-runs this block.

**Step 7, before the `mv` of `$KEEP`:**

```bash
