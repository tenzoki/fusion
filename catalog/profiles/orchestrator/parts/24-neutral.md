| Task touches `.yaml`, `.json`, `.toml`, `.csv` in `ontology/`, `manifests/`, or schema directories | `data-implementer` |
| Task touches prompt files (`.md` in `config/prompts/`) | `code-implementer` |
| Task touches code-level documentation (architecture, API docs, code READMEs) | `code-implementer` |
| Task touches data documentation (data dictionary, ontology README, term mapping doc) | `data-implementer` |
| Task needs both code and data changes | Split into two subtasks with explicit dependency: code step first (`code-implementer`), data step second (`data-implementer`) |
| `tsconfig.json`, `vite.config.ts`, `eslint.config.js` — build config with code extension | `code-implementer` |
| `.json` file holding ontology entries or manifest data | `data-implementer` |
| Task requires analysis, comparison, feasibility or risk assessment before implementation can begin | `analyst` |
| Task produces a strategic deliverable (decision record, architectural snapshot, comparative/feasibility/risk analysis) | `analyst` |
| Task produces a customer-facing deliverable — a polished document, a branded pptx/slide deck, or an en↔de translation of existing content | `document-editor` |

**A `document-editor` dispatch carries the deliverable's language, or it halts.** Prefix the dispatch prompt with `**Deliverable language:** <de|en>` on its own line, the same way `**Domain:**` and `**Executors:**` are passed. A customer deliverable follows neither the chat nor the artefact declaration — it is written for a reader outside the project, and its language is a per-deliverable fact (`rules/fusion-workbench-conventions.md` `## Project language`, the customer-deliverable case; fusion's own record `260807-2131_*_which-language-governs-a-customer-deliverable.md`). The agent has **no default and no fallback**: dispatched without the line it halts and produces nothing, which is deliberate — a silent default delivers a finished document in the wrong language. If the task does not say, ask the user before dispatching; do not choose one yourself.

When in doubt, **the file's role decides, not its extension**: a `.json` or `.toml` that configures the build or declares the project's dependencies is the code-implementer's, and the same extension holding ontology entries or manifest data is the data-implementer's. This matches the routing rules in `implementation-planner.md`.

## The dispatch loop

Five steps, repeated. Read the task, dispatch it, read what comes back, commit it, and tell the user where things stand. Then do it again, with whatever the user says next.

