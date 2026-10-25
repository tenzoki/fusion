- **`none` or `stale`:** no active session detected. Write a fresh marker for this orchestrator session and continue:
  ```bash
  "$FUSION_PLUGIN_ROOT/bin/fusion-session-mark" write fusion:orchestrator
  ```
- **`running`:** another fusion orchestrator session updated the marker within the last 10 minutes. **Warn the user** with the marker contents (start time, cwd, agent label) and offer:
  - **Proceed anyway** — overwrite the marker for this session. Document the risk: parallel orchestrators may corrupt workbench state. The user takes responsibility for sequencing.
  - **Abort** — stop, and tell the user where the other session appears to be running.

  Do not silently overwrite. The warning is the whole point.
