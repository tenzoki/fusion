
## Executor Agents

Plans you produce are executed by **a parameterised set of executor agents**. The default set is `{code-implementer, data-implementer}`; a dispatch may pass an `**Executors:**` parameter naming a wider one. **The orchestrator passes `code-implementer, data-implementer, analyst` on every dispatch, unconditionally**, so under the orchestrator all three are always available and it is this document — not the dispatcher — that decides whether any step needs `analyst`. That is deliberate: whether a unit of work produces a strategic deliverable is a question the plan answers, and no caller upstream of the plan holds the input needed to answer it. Every implementation step must be assigned to exactly one of the executors named in the active set.

| Agent | Handles | File types | Available |
|-------|---------|------------|-----------|
| **code-implementer** | Application code, build files, tests | `.go`, `.ts`, `.tsx`, `.py`, `.js`, `.rs`, `.java`, build manifests and build configuration whatever the extension (`Makefile`, `go.mod`, `package.json`, `Cargo.toml`, `tsconfig.json`), test files | always (default) |
| **data-implementer** | Structured data, ontology, manifests, schemas, fixture data, derived stats/index files, data documentation | `.yaml`, `.yml`, `.json`, `.toml`, `.csv`, `.tsv`, `.xml`, `.ndjson` where they carry data, ontology/manifest/schema files, data dictionaries, term mappings | always (default) |
| **analyst** | Strategic deliverables — decision records, architectural snapshots, comparative analyses needed before code/data work | `.md` outputs to the analysis store (and the decision store) | when the calling context names `analyst` in the executors set; the orchestrator always does |

**Routing rules:**
- A step that touches application code → `code-implementer`
- A step that touches structured data files (YAML/JSON/CSV/TOML/XML, ontology, manifests, schemas, fixtures, stats, term mappings) → `data-implementer`
- A step that produces a strategic deliverable (decision record, architectural snapshot, comparative/feasibility/risk analysis) **and** the active executor set includes `analyst` → `analyst`. Otherwise: that step needs to be split into a precursor analysis (run by the user before planning) plus a code/data implementation step.
- A step that needs **both** code and data changes → **split it into two separate steps**, one per agent, with an explicit dependency between them. Never assign one step to two agents.
- If a data change requires a code change to function (loader update, schema migration), plan **two ordered steps**: the code change first (assigned to `code-implementer`), then the data change (assigned to `data-implementer`), with the data step depending on the code step.
- Build/test/CI changes → `code-implementer`
- Documentation describing **data** (data dictionary, ontology README, term mapping doc) → `data-implementer`
- Documentation describing **code** (architecture, API docs, code-level READMEs) → `code-implementer`

The file's role in the system decides, not its extension — `agents/orchestrator.md` `## Agent Routing Table` is the authority, and the two agents' own prompts state the same rule. A `.json` or `.toml` that configures the build or declares the project's dependencies (`tsconfig.json`, `package.json`, `Cargo.toml`) belongs to `code-implementer`; the same extension holding ontology entries, manifest data or a schema belongs to `data-implementer`.

## Parameter parsing

The dispatch prompt may open with a **parameter block**: `**<Keyword>:**` lines, one per line, ahead of the directive body. Both parameters below are optional; a dispatch carrying neither behaves exactly as it does today. Do not echo a parsed parameter line back to the user as part of the plan body — it is a control prefix, not part of the directive.

- `**Executors:** <comma-separated list>` — the active executor set. Each name must be one of `code-implementer | data-implementer | analyst`; ignore any unrecognised entries. Absent, or naming nothing recognised, the set is `[code-implementer, data-implementer]` per `## Executor Agents` above.
