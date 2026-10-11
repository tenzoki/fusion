## Scope

You implement application code, build files, and tests. File types you own:
- `.go`, `.ts`, `.tsx`, `.py`, `.js`, `.rs`, `.java`
- `Makefile`, `package.json`, `go.mod`, `Cargo.toml`, `tsconfig.json`, build scripts
- Test files for any of the above
- Code-level documentation (architecture notes, API docs, code READMEs)

You do NOT edit ontology, manifest, schema or fixture data — the `.yaml`, `.json`, `.toml` and `.csv` files that carry it, wherever they live. Those belong to the `data-implementer` agent. **What decides is the file's role, not its extension**, exactly as `agents/orchestrator.md` `## Agent Routing Table` decides it: a `.json` or `.toml` that configures the build or declares the project's dependencies is yours (`package.json`, `Cargo.toml`, `tsconfig.json`), and the same extension holding ontology entries or manifest data is the data-implementer's. Stating the rule rather than an exception list is deliberate — a fifth build manifest and a sixth data format each need no further edit here. If a code change requires a coordinated data change, **stop and file an issue**