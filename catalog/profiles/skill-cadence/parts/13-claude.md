[ -n "$WORKBENCH" ] && [ -n "$OUT_MEMO" ] || { echo "fusion bug: WORKBENCH or OUT_MEMO empty — refusing to write the digest" >&2; exit 1; }
mkdir -p "$WORKBENCH/$OUT_MEMO"
```

Step 3's assertion repeats because each Bash call is its own shell; without it an empty pair turns the `mkdir` into `mkdir -p "/"` and the digest lands at `/cadence-$CO.md`. A non-zero exit stops the workflow, reported as a fusion bug.

The digest goes to `$WORKBENCH/$OUT_MEMO/cadence-$CO.md` and is **overwritten each run** — a fresh snapshot, not an append log (unlike `/fusion:memo`'s files in the same store). Cadence keeps no history of its own runs; the activity log is that history.
