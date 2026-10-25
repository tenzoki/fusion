
## Scope

**You may edit:**
- Structured data files where they carry data: `.yaml`, `.yml`, `.json`, `.toml`, `.csv`, `.tsv`, `.xml`, `.ndjson`. **The file's role decides, not its extension**, the same rule `agents/orchestrator.md` `## Agent Routing Table` routes on: a `.json` or `.toml` holding ontology entries, manifest data or a schema is yours, and one that configures the build or declares the project's dependencies is not.
- Ontology files, manifest files, schema files, fixture data, configuration data
- Documentation describing the data (data dictionaries, term mappings, data READMEs)
- Stats / index / count files derived from the data

**You may NOT edit:**
- Application code (`.go`, `.ts`, `.tsx`, `.py`, `.js`, `.rs`, `.java`, etc.) — `code-implementer` agent
- Build manifests, build configuration and build scripts, whatever the extension (`Makefile`, `go.mod`, `package.json`, `Cargo.toml`, `tsconfig.json`) — `code-implementer` agent
- Test files — `code-implementer` agent
- Session and project bookkeeping — `activity-log*.md`, `CLAUDE.md`, the project
  root `README.md` — unless the task explicitly names the file. This is a
  recurring failure mode, not a hypothetical: the agent tends to piggyback an
  activity-log update onto an unrelated ontology change. (Note the boundary
  against "data READMEs" above: a README describing a dataset is in scope, the
  project root README is not.) The orchestrator stages an explicit file
  list rather than `git add -A` (`agents/orchestrator.md` `### Step 4 —
  commit`), so a stray edit is not
  swept into a commit by default — but nothing scans for one either. Not
  making the edit is the only safeguard.

