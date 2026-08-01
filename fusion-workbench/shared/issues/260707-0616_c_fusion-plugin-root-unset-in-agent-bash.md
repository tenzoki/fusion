# FUSION_PLUGIN_ROOT unset in agent Bash calls — SessionStart env-file mechanism unreliable

---
**Status:** closed
**Filed by:** orchestrator
---

## Symptom

`$FUSION_PLUGIN_ROOT` was empty in a live orchestrator session's Bash tool calls (observed at
Setup: the marker-write and monitor-refresh commands could not resolve
`$FUSION_PLUGIN_ROOT/...` and had to fall back to `pwd`). Agents rely on this variable to
locate `bin/fusion-rules`, `bin/monitor`, `bin/fusion-session-mark`, `bin/fusion-commit-lock`,
and the plugin `rules/` directory.

## Scope note (not the guard)

This is SEPARATE from the guard-not-firing defect
(`260707-0616[o]-guard-hook-not-wired-to-bash-matcher.md`). The guard hook command uses
`${CLAUDE_PLUGIN_ROOT}` (set by Claude Code for hook execution), NOT `FUSION_PLUGIN_ROOT`, so
the guard is unaffected by this issue. `FUSION_PLUGIN_ROOT` matters only for agent Bash calls.

## Root cause (partly inferred)

The only mechanism setting the variable is the SessionStart hook in `hooks/hooks.json`:
`echo 'export FUSION_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}' >> "$CLAUDE_ENV_FILE"`. This depends on
Claude Code sourcing `$CLAUDE_ENV_FILE` into every subsequent Bash tool call. In the observed
session that did not happen (variable stayed empty). Exact cause not fully pinned —
candidates: the `$CLAUDE_ENV_FILE` env-injection contract not applying to Bash tool calls in
this Claude Code version, SessionStart not firing for this launch, or `CLAUDE_PLUGIN_ROOT`
empty at hook time. INFERENCE, not verified to a single cause.

## Fix (recommended)

Make the global launcher export the variable itself, since it already knows the plugin dir it
passes to `--plugin-dir`. In `install.sh` (which generates `~/.local/bin/fusion`), add before
the final exec:

```bash
export FUSION_PLUGIN_ROOT="$FUSION_DIR"
exec claude $SKIP --plugin-dir "$FUSION_DIR" --agent "$TARGET" "$@"
```

The `claude` process then carries the variable in its environment and every Bash tool
subprocess inherits it — no dependency on the `$CLAUDE_ENV_FILE` mechanism, and always the
exact dir passed to `--plugin-dir` (correct even with multiple installs on one machine).

Keep the SessionStart `$CLAUDE_ENV_FILE` hook as a fallback for marketplace-installed
(non-launcher) sessions where no launcher exists to export it.

REJECTED alternative: writing `export FUSION_PLUGIN_ROOT=...` to `~/.zshrc`. It is global to
all shells, hardcodes one path (dangerous with multiple installs: ~/.fusion + marketplace
cache + dev repo — bin/ and rules/ would resolve against a version that may not match the
loaded agents), and non-interactive shells may skip `~/.zshrc` entirely.

## Follow-up

Consider a defensive agent-side fallback: if `FUSION_PLUGIN_ROOT` is unset, agents currently
must improvise (this session used `pwd` because it happened to be the plugin repo — not valid
in a consuming project). A robust fallback is hard because the agent does not otherwise know
the plugin's install path; the launcher-export fix is the real remedy. File a separate issue
only if the launcher fix proves insufficient.

## Verification

After the launcher fix, in a fresh `fusion`-launched session run `echo "$FUSION_PLUGIN_ROOT"`
in a Bash tool call — it must print the plugin dir (`~/.fusion`), not empty.

---
Resolved: commit dbf98f6 — guard PreToolUse matcher now includes Bash (guard fires on git ops); launcher exports FUSION_PLUGIN_ROOT; hooks-wiring.test.ts regression added; 91 tests pass
