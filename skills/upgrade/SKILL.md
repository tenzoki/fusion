---
description: Pull the local fusion marketplace clone so /plugin install picks up the latest fusion version. One-step replacement for the manual git pull on the marketplace cache.
allowed-tools: [Bash, Read]
---

# Fusion — upgrade

The user wants to upgrade fusion to whatever's published on the marketplace. Claude Code's `/plugin install` reads the **local marketplace clone**, not the GitHub remote. Without a `git pull` on that clone, version bumps don't propagate locally even after uninstall/reinstall.

This skill does that pull and reports the result. The user still has to run `/plugin install` and `/reload-plugins` from Claude Code itself — slash commands cannot be invoked from inside a skill body.

## Steps

1. **Locate the marketplace clone.** It lives at `~/.claude/plugins/marketplaces/tenzoki-plugins/`. Confirm it exists. If it doesn't, the user has not added the marketplace yet — direct them to `/plugin marketplace add tenzoki-plugins https://github.com/tenzoki/claude-plugins` and stop.

2. **Read the current local fusion version** before pulling, so we can report the change:

   ```bash
   grep -A6 '"name": "fusion"' ~/.claude/plugins/marketplaces/tenzoki-plugins/.claude-plugin/marketplace.json | grep '"version"' | head -1
   ```

3. **Pull the marketplace clone:**

   ```bash
   git -C ~/.claude/plugins/marketplaces/tenzoki-plugins pull origin main
   ```

   If the pull fails (network, conflict, dirty tree), report the error and stop. Do not force-pull or destroy local state without asking.

4. **Read the new local fusion version** after pulling, same grep as step 2.

5. **Report.** Tell the user, in this order:
   - The local version before vs. after the pull (e.g. *"fusion: 2.3.0 → 2.3.2"*).
   - If they're already up to date, say so and stop — no need to reinstall.
   - If a new version landed, instruct them to run **both** of these from inside Claude Code (the user must type them — you cannot invoke slash commands from a skill):
     - `/plugin install fusion@tenzoki-plugins`
     - `/reload-plugins`

## Notes for the assistant

- **Do not** attempt to call `/plugin install` or `/reload-plugins` yourself — they only work when typed by the user in Claude Code's prompt.
- **Do not** modify the marketplace clone beyond a fast-forward pull. If the clone has local changes (`git status` non-empty), report and stop; don't stash or reset without explicit user direction.
- This skill is fusion-specific. It does not touch other plugins or other marketplaces.
- If `~/.claude/plugins/marketplaces/` doesn't exist, the user is on a Claude Code version without the plugin system or has never used it. Say so plainly.

## Tone

Concise. Show the command output that matters (version before/after, any errors). Don't editorialize. The user invoked this because they wanted a one-shot upgrade — match that energy.
