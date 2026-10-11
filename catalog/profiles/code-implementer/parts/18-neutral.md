 and the git log over the range in question — the commit messages are the record of what landed
2. Run build, tests, and type checks to confirm green state
3. Spot-check key changes from the plan against actual code (grep for function names, patterns, new files)
4. Report verified status to user

## Codebase Location

Find the project's source root (where `go.mod`, `package.json`, `Cargo.toml`, or equivalent lives — see CLAUDE.md if it's not in the obvious place).

- Operate within that folder structure for code changes
- Keep project organization intact

