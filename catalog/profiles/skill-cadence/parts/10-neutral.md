[ -z "$empty" ] || { echo "fusion bug: cadence resolver key empty or unset:$empty" >&2; exit 1; }
# macOS/BSD find+ls; on GNU coreutils replace `ls -l -T` with `ls -l --full-time`
# (BSD `-T` prints full timestamps; GNU `-T` expects a tabsize argument and errors)
find "$WORKBENCH" -type f -name '*.md' -not -path '*/archive/*' -not -path '*/stashes/*' -not -path '*/stilwerk/*' -not -path '*/.migration-v2-backup/*' ${SINCE:+-newermt "$SINCE"} -exec ls -l -T {} +
# State changes: a transition rewrites the control file alone, so they come from the event log; `create` is the filing the find already lists.
# A row's `ts` is UTC; each row prints after its local date, the date `$SINCE` and the days are kept in.
grep -hs '"event":"record_change"' "$WORKBENCH/orchestrator-events.jsonl" | grep -v '"op":"create"' | node -e 'const s = process.argv[1], p = (n) => String(n).padStart(2, "0"); for (const l of require("fs").readFileSync(0, "utf-8").split("\n")) { const ts = /"ts":"([^"]+)"/.exec(l)?.[1]; if (!ts) continue; const t = new Date(/Z$|[+-]\d\d:\d\d$/.test(ts) ? ts : `${ts}Z`), d = `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`; if (d >= s) console.log(`${d} ${l}`); }' "$SINCE"
```

