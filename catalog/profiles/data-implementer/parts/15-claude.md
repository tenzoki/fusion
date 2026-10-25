**Shell gotcha:** The sandbox resets CWD after every Bash call. Never rely on a prior `cd`. Always combine: `cd <data-root> && <validation-command>` in a single command.

## Tools

**Always use context7** for library/framework documentation — schema libraries, parsers, validators, format specs:
1. `mcp__context7__resolve-library-id`
2. `mcp__context7__query-docs`
