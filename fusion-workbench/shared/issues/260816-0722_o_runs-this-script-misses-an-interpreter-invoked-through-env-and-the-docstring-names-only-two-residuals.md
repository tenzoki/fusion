`_runs_this_script` misses an interpreter invoked through `env`, and the docstring names only two residuals
---
`94683c9` narrowed the monitor's port-clearing predicate from a substring test to a token walk, and its
docstring enumerates the two kills the narrowing costs. There is a third of the same class, unnamed.
---
**Severity:** Low — it loses a kill rather than gaining a wrong one, like the two that are documented, and
the first question's listener kill is untouched. It is filed because the docstring presents its list as
complete, and a reader checking whether their case is covered will conclude wrongly.
**Domain:** code
**Filed by:** coderev, session `260816-0713`, reviewing range `3a0408a..f77633f`
**Owner:** coder
**Affects:** `bin/monitor` (`_runs_this_script`, ~:1261-1291)

## Evidence

```python
for token in cmd.split()[1:]:
    if token.startswith("-"):
        continue
    return os.path.basename(token) == SERVER_SCRIPT
return False
```

The loop returns on the **first** non-option token after argv[0]. For `env python3 /tmp/x/monitor-server.py`
that token is `python3`, so the function returns False for a process that is running the script.

The documented residuals are "an interpreter or script path containing a space" and "an interpreter invoked
as `-c`". The `env` form is neither, and `env` is a common way to reach an interpreter on PATH.

Two further shapes behave correctly and are worth recording so a fix does not break them: an empty or
unreadable `ps` output returns False (`cmd.split()[1:]` is empty), and a browser command line whose argv[1]
is an unrelated path returns False on the basename compare.

## Bound on the risk

`bin/monitor:1478` launches as `python3 "$TMPFILE" …`, so a monitor started by the shipped wrapper always
has the script at argv[1] and is matched. The gap reaches only a monitor started some other way.

## Fix

Either scan all tokens for a basename match instead of returning on the first, or name `env` as a third
residual. The first is not free — scanning all tokens re-admits the argv-mention kill that
`260816-0131` was filed for — so the cheap and honest move is to name it.

## Related

- `shared/issues/260816-0131_*` — the defect this predicate was narrowed to fix
