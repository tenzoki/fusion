   - "What should I work on next?" → read the work-package store yourself; the portfolio briefing and the session work queue both went at v11 with the agents that built them
   - Tracking files feel stale → **state-auditor**
   - Strategic advice or second opinion → **consultant**
   - Deep document/problem study before work, or a forensic look at a captured failed run → **analyst**

3. **The workbench is the project's cross-session memory.** `fusion-workbench/` holds one store per artefact kind (plans for the approach, issues for "go fix it", decisions for "decide and record", plus reviews, analyses and the frozen history corpus) in two places: each work package's own container in the `work-packages` store, and `shared/` for work belonging to no package. **The Origin Rule makes the placement decision**: an artefact belongs to the package whose brief caused it, and to `shared/` when no package is in scope.

