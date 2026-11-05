  fi
  for p in .session-marker .cadence-anchors .check-stamps .commit-lock monitor .guard-state .json-state; do
    if git ls-files --error-unmatch "fusion-workbench/$p" >/dev/null 2>&1; then echo "gitignore: class L entry $p is tracked — not repaired, report it"
    elif [ -n "$(git ls-files --others --exclude-standard -- "fusion-workbench/$p")" ]; then echo "gitignore: class L entry $p is untracked and covered by no ignore rule — not repaired, report it"
    fi
  done
fi
```

Every line printed goes into the Done report verbatim; nothing printed means nothing to report. The tracking rule names `workbench.json` (R3) and `.json-state/` (class L) with the rest.

## upstream — whether this checkout is behind its upstream (advisory)

