
## gitattributes — the union merge driver for the event log

`fusion-workbench/orchestrator-events.jsonl` is the one workbench file every checkout appends to, so git's default text merge turns two checkouts' sessions into a conflict nobody should resolve by hand. This step asks git whether a merge driver already applies there and declares `merge=union` only where none does. `rules/workbench-tracking.md` `## The event log carries a union merge driver` holds the reasoning, including why the question is `git check-attr` and never a text search of `.gitattributes`; do not restate it here.

Like `config` and `permissions`, the write lands at the project root: `./.gitattributes` in the directory `pwd` reports, outside `fusion-workbench/` and never in a subfolder. **This selector asks the user nothing**, which is what keeps `permissions` the only one that asks on a normal run.

```bash
if [ "$(git rev-parse --is-inside-work-tree 2>/dev/null)" = "true" ]; then
  D=$(git check-attr merge -- fusion-workbench/orchestrator-events.jsonl | sed 's/.*: //')
  case "$D" in
    union) echo "gitattributes: a union merge driver already applies — nothing written" ;;
    unspecified)
      [ -s ./.gitattributes ] && [ -n "$(tail -c1 ./.gitattributes)" ] && printf '\n' >> ./.gitattributes
      printf '# fusion: the orchestrator event log is append-only and two checkouts both append to it.\nfusion-workbench/orchestrator-events.jsonl merge=union\n' >> ./.gitattributes
      echo "gitattributes: union merge driver written to $(pwd)/.gitattributes" ;;
    set) echo "gitattributes: left alone — this path takes git's default text merge (a bare 'merge'), the case this check exists to prevent; fusion does not overrule it" ;;
    unset) echo "gitattributes: left alone — merging is switched off for this path ('-merge')" ;;
    *) echo "gitattributes: left alone — this path already has merge driver '$D'" ;;
  esac
else
  echo "gitattributes: not a git work tree — nothing written"
fi
```

## identity — this checkout's identity

**One condition here asks**, at most once per checkout: a checkout with no registry entry.

A second stood beside it and went with the unit-of-work container it was about. That container's record travelled between checkouts while the local pointer naming the running one did not, so a clone taken mid-run held a record that said "running" with no pointer beside it, and this selector offered to write one. No record carries a running state now and no such pointer is read anywhere, so the condition is unreachable rather than unchecked: a work package's `package.json` names the checkout that holds it (`claim.checkout_id`), which is a fact every checkout reads the same way off the file it pulled.

