# FUSION_PLUGIN_ROOT propagation unverified for marketplace / --plugin-dir installs (non-launcher)

---
**Status:** open
**Filed by:** orchestrator (follow-up during the 3.25.1 release)
---

## Symptom

`dbf98f6` fixed FUSION_PLUGIN_ROOT propagation for the **HTTPS-installer / `fusion` launcher**
path: the generated `~/.local/bin/fusion` launcher runs `export FUSION_PLUGIN_ROOT="$FUSION_DIR"`
before `exec claude … --plugin-dir` (verified: `install.sh:151`). That path is correct.

The **non-launcher path** — a session started via `claude --plugin-dir <dir>` or a marketplace
plugin load, without the `fusion` launcher — still relies only on the SessionStart-hook fallback:

```
echo 'export FUSION_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}' >> "$CLAUDE_ENV_FILE"
```

(`hooks/hooks.json` SessionStart). `dbf98f6`'s own commit message states this mechanism "did not
propagate" and demoted it to a fallback. It is **unverified** whether a real marketplace /
`--plugin-dir` session actually ends up with a non-empty `FUSION_PLUGIN_ROOT` in agent Bash tool
subprocesses.

## Evidence (this session)

Observed in the orchestrator's Bash tool subprocess (a dev session in the plugin source tree,
started with plain `claude`, not via the launcher):

```
FUSION_PLUGIN_ROOT = (empty)
CLAUDE_PLUGIN_ROOT = (empty)
CLAUDE_ENV_FILE    = (empty)
```

With `CLAUDE_PLUGIN_ROOT` and `CLAUDE_ENV_FILE` both empty in the tool subprocess, the SessionStart
fallback writes nothing usable. This session is not itself a marketplace install, so it does not
prove the marketplace case is broken — but it shows the fallback mechanism is not self-evidently
working, and the marketplace case was never verified.

## Impact

If FUSION_PLUGIN_ROOT is empty in a marketplace/`--plugin-dir` session, every agent's Setup step
that calls `"$FUSION_PLUGIN_ROOT/bin/fusion-rules"` etc. resolves to `/bin/...` and fails; agents
would halt or misbehave. Severity depends entirely on whether the fallback actually fires in that
install shape — currently unknown.

## What to do

1. **Verify the launcher path (positive control):** after `fusion --update`, start via `fusion`,
   run `echo $FUSION_PLUGIN_ROOT` in an agent Bash call — expect `~/.fusion`. If empty here, the
   launcher fix itself regressed (reopen `dbf98f6`).
2. **Verify the marketplace path:** install fusion via the marketplace (`/plugin install
   fusion@tenzoki-plugins`), start a session NOT via the launcher, and check FUSION_PLUGIN_ROOT
   in an agent Bash call.
3. If the marketplace path is empty: fix the SessionStart→CLAUDE_ENV_FILE propagation, or add a
   deterministic fallback (e.g. every agent's Setup derives the plugin root from
   `bin/fusion-workbench-root` + a known-relative path, or from CLAUDE_PLUGIN_ROOT read inside the
   hook and written to a project-local dotfile at SessionStart).

## Cross-reference

- Launcher fix: commit `dbf98f6`, `install.sh:147-152`.
- Historical: closed issue `260707-0616[c]-fusion-plugin-root-unset-in-agent-bash.md` (the symptom
  recurred in this session, which is what surfaced the residual gap).

---
Resolved (260709, session 260709-0816): Root cause found and fixed. The SessionStart hook wrote the echo payload in SINGLE quotes, so the literal `${CLAUDE_PLUGIN_ROOT}` landed in `$CLAUDE_ENV_FILE` and was re-expanded at Bash-tool-source time (where CLAUDE_PLUGIN_ROOT is empty) to `export FUSION_PLUGIN_ROOT=` — clobbering the launcher's correct value to empty. This affected BOTH the launcher path (empty override) and the marketplace/--plugin-dir path.

Fix (commit 7f72dfe): expand CLAUDE_PLUGIN_ROOT at hook time (double quotes) + `[ -n ... ]` empty-guard:
  [ -n "${CLAUDE_PLUGIN_ROOT}" ] && echo "export FUSION_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}" >> "$CLAUDE_ENV_FILE" || true

Behaviorally verified in-session: populated case writes the resolved literal path and sources correctly in a shell with CLAUDE_PLUGIN_ROOT unset; empty case writes nothing and exits 0. Live install `~/.fusion/hooks/hooks.json` patched directly (same one-liner) for immediate effect. Final live confirmation = user restarts fusion and checks `echo $FUSION_PLUGIN_ROOT` in an agent Bash call (expect the plugin dir).
