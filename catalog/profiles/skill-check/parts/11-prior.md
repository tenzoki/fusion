- **`none` or `stale`:** no active session detected. An entry run is no orchestrator session, so write no session marker for it, and continue.
- **`running`:** another fusion orchestrator session updated the marker within the last 10 minutes. **Warn the user** with the marker contents (start time, cwd, agent label), and continue. This run starts no orchestrator session, so there is no marker to overwrite and nothing to proceed past or abort: the marker stays exactly as it is.

  Do not pass over it silently. The warning is the whole point.
