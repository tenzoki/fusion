
**Whether git preserves the bytes is the project's decision, not this workflow's.** fusion ships no `.gitignore` rule for the workbench, so a consuming project's workbench may be tracked, ignored, or neither (`rules/workbench-tracking.md`). Only where the project tracks it does a past commit still hold what a move relocated. Where it does not, the archive folder is the **only** copy of every artefact this workflow moves: Step 7's collision guard prevents an overwrite, and nothing after that prevents a loss.

## Where archives go

```
<archive store>/<YYMMDD-HHMM>-<slug>/
```

- `YYMMDD-HHMM` from `date +%y%m%d-%H%M` (never guess).
- `<slug>` is a short kebab-case label (lowercase, alphanumerics + dashes, ≤ 40 chars). For tier mode the slug is `safe-cleanup-tier-<n>`. For natural-language mode it's derived from the description.
- One archive folder per run of this procedure. Never reuse a folder.
- Inside the archive folder, preserve the original path relative to `$WORKBENCH`.

## Step 1 — Resolve paths, read the tracking rule

```bash
