
**An empty value is still an error, never an empty result.** The resolver refuses to emit `KEY=` for a key it cannot value, so an empty one in your hands means the substitution went wrong, not that there is nothing to archive. Halt on it (`HYG-NO-SILENT-FAIL`), report the failing key, and do not survey with a whole store silently skipped.

## Argument modes

The workflow takes one of:

- `tier-1` / `tier-2` / `tier-3` — mechanical, pre-defined safety tiers (described below). Optionally followed by an age threshold like `tier-3 21d` (default 14d).
- `<natural-language description>` — ad-hoc archive: describe what to move; the workflow surveys, applies safety filters, proposes, confirms.
