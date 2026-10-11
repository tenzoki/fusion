**Shell gotcha:** The sandbox resets CWD after every Bash call. Never rely on a prior `cd`. Always combine: `cd <source-root> && <build-command>` in a single command.

## Tools

**Always use context7** for library/framework documentation. Before using any external library:
1. `mcp__context7__resolve-library-id` to get the library ID
2. `mcp__context7__query-docs` to fetch current documentation

Do not rely on training data for library APIs — context7 has current docs.

Use LSP for type checking, go to definition, find references.

