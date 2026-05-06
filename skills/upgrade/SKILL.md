---
description: Pull the local fusion marketplace clone so Claude Code's plugin system can see the latest fusion version. Diagnoses the upgrade path (uninstall+install vs. cache surgery) based on whether the current project enables fusion in .claude/settings.json.
allowed-tools: [Bash, Read]
---

# Fusion — upgrade

The user wants to upgrade fusion to whatever is published on the marketplace. Three facts about Claude Code's plugin system govern the procedure:

1. **`/plugin install` reads the local marketplace clone, not GitHub.** Without a `git pull` on `~/.claude/plugins/marketplaces/tenzoki-plugins/`, version bumps never reach local marketplace metadata.
2. **`/plugin install` is install-once, not auto-upgrade.** When fusion is already installed, `/plugin install fusion@tenzoki-plugins` reports *"already installed globally"* and does nothing. There is no `/plugin upgrade` or `/plugin update` command. The documented upgrade path is `/plugin uninstall` then `/plugin install` then `/reload-plugins`.
3. **`/plugin uninstall` is enablement-aware at TWO levels.** Claude Code intercepts the uninstall if fusion is enabled at *either*:
   - **Project level** — `<pwd>/.claude/settings.json` has `enabledPlugins["fusion@tenzoki-plugins"]: true`. Escape: `cd` to a directory without that.
   - **User level** — `~/.claude/settings.json` has the same. There is **no `cd` escape** — the user-level setting is in scope from every directory.

   In either case the prompt offers to *disable for this scope* (writing to `settings.local.json`) rather than actually uninstalling. The fix differs by case:
   - Project-level only → `cd` away, run the three slash commands.
   - User-level (or both) → no `cd` works. Either edit `~/.claude/settings.json` to remove the fusion entry first, or use **cache surgery** (preferred — keeps the user-level enablement intact for the new install).

This skill does the marketplace pull, detects the version delta, and tells the user the right command sequence given fact 3.

Slash commands cannot be invoked from inside a skill body, so the user has to type them — but you should give them the *exact* sequence that will work from where they are.

## Steps

### 1. Locate the marketplace clone

```bash
test -d ~/.claude/plugins/marketplaces/tenzoki-plugins || {
  echo "Marketplace not added. Run: /plugin marketplace add tenzoki-plugins https://github.com/tenzoki/claude-plugins"
  exit 1
}
```

### 2. Read the current marketplace-clone version

```bash
BEFORE="$(grep -A8 '"name": "fusion"' ~/.claude/plugins/marketplaces/tenzoki-plugins/.claude-plugin/marketplace.json | grep '"version"' | head -1 | sed -E 's/.*"version": *"([^"]+)".*/\1/')"
echo "Local marketplace says: $BEFORE"
```

### 3. Pull the marketplace clone

```bash
git -C ~/.claude/plugins/marketplaces/tenzoki-plugins pull origin main
```

If the pull fails (network, conflict, dirty tree), report the error and stop. Do not force-pull or destroy local state without asking.

### 4. Read the new marketplace-clone version

```bash
AFTER="$(grep -A8 '"name": "fusion"' ~/.claude/plugins/marketplaces/tenzoki-plugins/.claude-plugin/marketplace.json | grep '"version"' | head -1 | sed -E 's/.*"version": *"([^"]+)".*/\1/')"
echo "Local marketplace now says: $AFTER"
```

### 5. Read what's actually installed

```bash
INSTALLED="$(python3 - <<'PY' 2>/dev/null
import json, os
p = os.path.expanduser("~/.claude/plugins/installed_plugins.json")
try:
    d = json.load(open(p))
    entries = d.get("plugins", {}).get("fusion@tenzoki-plugins", [])
    print(entries[0].get("version", "") if entries else "")
except Exception:
    pass
PY
)"
echo "Currently installed: ${INSTALLED:-<none>}"
```

### 6. Decide what to tell the user

- If `$INSTALLED == $AFTER`: already on the latest. Tell the user, stop.
- If `$INSTALLED == ""` (no install record): instruct `/plugin install fusion@tenzoki-plugins` and `/reload-plugins` (no uninstall needed). Stop after the user types those.
- Otherwise the install needs to be replaced. Diagnose the project-enablement state for the user's current directory.

### 7. Detect enablement at both project and user levels

```bash
check_enabled() {
  local f="$1"
  [ -f "$f" ] || return 1
  python3 - "$f" <<'PY' >/dev/null 2>&1
import json, sys
d = json.load(open(sys.argv[1]))
sys.exit(0 if d.get("enabledPlugins", {}).get("fusion@tenzoki-plugins") else 1)
PY
}

PROJECT_ENABLED="no"
USER_ENABLED="no"
check_enabled "$(pwd)/.claude/settings.json" && PROJECT_ENABLED="yes"
check_enabled "$HOME/.claude/settings.json"  && USER_ENABLED="yes"

echo "Project (pwd) enables fusion: $PROJECT_ENABLED"
echo "User (~)     enables fusion: $USER_ENABLED"
```

### 8. Present the right path to the user

Three cases based on the detection in step 7:

**Case A — neither project nor user enables fusion (`PROJECT_ENABLED=no`, `USER_ENABLED=no`):** the simple sequence works. Tell the user to type, in order:

```
/plugin uninstall fusion@tenzoki-plugins
/plugin install fusion@tenzoki-plugins
/reload-plugins
```

**Case B — only the current project enables it (`PROJECT_ENABLED=yes`, `USER_ENABLED=no`):** the project-level guard intercepts the uninstall. Recommend the user `cd` to a non-fusion-enabled directory first (e.g. `~`, or the fusion repo, or any non-fusion-using project), then run the three commands above. A `cd` escape *does* work in this case.

**Case C — user-level enables it (`USER_ENABLED=yes`), regardless of project:** the user-level setting is in scope everywhere. **No `cd` escape works.** Two paths:

**Option C1 (recommended for upgrade): cache surgery.** Bypasses the plugin manager entirely. Modifies `~/.claude/plugins/` directly — this is Claude-Code-internal state, so confirm with the user before running. When confirmed:

```bash
OLD_VER="$INSTALLED"
rm -rf "$HOME/.claude/plugins/cache/tenzoki-plugins/fusion/$OLD_VER"
python3 -c "
import json
p = '$HOME/.claude/plugins/installed_plugins.json'
d = json.load(open(p))
d.get('plugins', {}).pop('fusion@tenzoki-plugins', None)
json.dump(d, open(p, 'w'), indent=2)
"
```

After surgery, the user types only:

```
/plugin install fusion@tenzoki-plugins
/reload-plugins
```

(No uninstall needed — there's no install record after the surgery. The user-level enablement in `~/.claude/settings.json` stays as-is, so the new install is auto-enabled.)

**Option C2 (alternative): edit `~/.claude/settings.json`** to remove or false-out fusion's entry, run the three slash commands, then restore the entry. More steps; more risk of leaving the file in a half-state. Cache surgery is simpler.

## Notes for the assistant

- **Slash commands cannot be invoked from a skill body.** Always tell the user the exact sequence to type.
- **The marketplace clone pull is always safe** (fast-forward `git pull` on a dedicated read-mostly clone). Do it without confirmation.
- **The cache surgery (option B2) is NOT routine.** It modifies Claude Code's own plugin state under `~/.claude/plugins/`. Confirm with the user before running it. If the user has not explicitly opted in to surgery, default to recommending option B1 (cd elsewhere).
- If the marketplace clone has uncommitted local changes (`git status` non-empty), report and stop; don't stash or reset without explicit user direction.
- This skill is fusion-specific. It does not touch other plugins or other marketplaces.

## Tone

Concise. Show the version diff (before → after), the detected enablement state, and the exact command sequence the user should type. Don't editorialize. The user invoked this because they wanted a one-shot upgrade — match that energy.
