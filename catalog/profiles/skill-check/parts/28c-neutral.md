
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

