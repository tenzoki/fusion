[ -n "$WORKBENCH" ] && [ -n "$OUT_MEMO" ] || { echo "fusion bug: WORKBENCH or OUT_MEMO empty — refusing to write the digest" >&2; exit 1; }
node -e 'require("fs").mkdirSync(process.argv[1],{recursive:true})' "$WORKBENCH/$OUT_MEMO"
```

Step 3's assertion repeats because each `host.exec.v1` call is a fresh process; without it an empty pair makes that call name `/` and the digest lands at `/cadence-$CO.md`. A non-zero exit stops the workflow, reported as a fusion bug.

The digest goes to `$WORKBENCH/$OUT_MEMO/cadence-$CO.md` and is **overwritten each run** — a fresh snapshot, not an append log (unlike the memo entry's files in the same store). Cadence keeps no history of its own runs; the activity log is that history.
