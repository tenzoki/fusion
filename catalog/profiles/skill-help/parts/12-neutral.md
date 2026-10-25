
1. **Use the launcher.** If you installed via the HTTPS installer, `fusion` runs an agent: bare `fusion` invokes the orchestrator; `fusion code-implementer`, `fusion implementation-planner`, etc. dispatch a specific agent directly. Add `--yolo` to clear permission prompts (`fusion --yolo code-implementer`). If you installed via the Claude Code marketplace, start an agent directly with `claude --agent fusion:orchestrator`.

2. **Pick the right entry point** depending on what you're doing:
   - Multi-task batch session → **orchestrator**
   - Vague request that needs scoping → **requirements-designer**, then implementation-planner
   - Concrete change with a clear ask → **implementation-planner** directly
   - One bug to fix → **code-implementer** or **data-implementer**, whichever owns the file; a task naming an error takes the diagnose-before-editing route in its own prompt
   - Customer-ready deliverable, branded deck, or en↔de translation → **document-editor**
