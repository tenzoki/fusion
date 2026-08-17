#!/usr/bin/env bash
#
# fusion installer — macOS / Linux
#
# Installs fusion as a Claude Code plugin WITHOUT git, without SSH, and without
# Claude Code's plugin marketplace cache. It downloads the plugin over plain
# HTTPS, drops it in ~/.fusion, and installs a `fusion` launcher that loads the
# plugin straight from that directory on every run.
#
#   Install / update:  curl -fsSL https://raw.githubusercontent.com/tenzoki/fusion/main/install.sh | bash
#   Run:               fusion
#   Update later:      fusion --update
#   Remove:            fusion --uninstall
#
# Why this exists: the marketplace path clones over git (breaks when a user's
# git is configured for SSH or has no key) and its cache is not reliably
# replaced on update/uninstall. This path avoids all of that — it is just a
# download into a folder plus a one-line launcher.
#
# fusion ships compiled hooks (hooks/dist/*.js, committed to the repo) and
# executable helpers under bin/. The tarball carries both; no build step, no
# npm, no node_modules are required at install time.
#
# Overrides (optional env vars):
#   FUSION_REF   git ref to fetch (default: heads/main). Every release is
#                tagged v<version>, so pin one with FUSION_REF=tags/v<version>
#                — e.g. FUSION_REF=tags/v10.0.0 for the current release.
#   FUSION_HOME  install dir (default: ~/.fusion)
#   FUSION_BIN   launcher dir (default: ~/.local/bin)

set -euo pipefail

REPO="tenzoki/fusion"
REF="${FUSION_REF:-heads/main}"
INSTALL_DIR="${FUSION_HOME:-$HOME/.fusion}"
BIN_DIR="${FUSION_BIN:-$HOME/.local/bin}"
LAUNCHER="$BIN_DIR/fusion"
TARBALL_URL="https://github.com/$REPO/archive/refs/$REF.tar.gz"

say()  { printf '\033[1m%s\033[0m\n' "$*"; }
warn() { printf '\033[33m%s\033[0m\n' "$*" >&2; }
die()  { printf '\033[31m%s\033[0m\n' "$*" >&2; exit 1; }

# --- 1. Preconditions ---------------------------------------------------------
command -v curl >/dev/null 2>&1 || die "curl is required but not found."
command -v tar  >/dev/null 2>&1 || die "tar is required but not found."
if ! command -v claude >/dev/null 2>&1; then
  die "The Claude Code CLI ('claude') was not found on your PATH.
Install Claude Code first, then re-run this installer:
  https://docs.claude.com/en/docs/claude-code"
fi
if ! command -v node >/dev/null 2>&1; then
  warn "Node.js ('node') was not found on your PATH."
  warn "fusion's compliance guard runs as a Node hook; without node it will not fire."
  warn "Agents still work, but install Node.js to get the guard: https://nodejs.org"
fi

# --- 2. Download + extract over HTTPS (no git, no SSH) ------------------------
say "Downloading fusion ($REF) over HTTPS..."
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
curl -fsSL "$TARBALL_URL" -o "$TMP/fusion.tar.gz" \
  || die "Download failed: $TARBALL_URL
Check your internet connection and that the ref exists."
tar -xzf "$TMP/fusion.tar.gz" -C "$TMP" || die "Could not extract the archive."

SRC="$(find "$TMP" -maxdepth 1 -type d -name 'fusion-*' | head -1)"
[ -n "$SRC" ] && [ -f "$SRC/.claude-plugin/plugin.json" ] \
  || die "Downloaded archive does not look like the fusion plugin (no .claude-plugin/plugin.json)."

VERSION="$(sed -n 's/.*"version" *: *"\([^"]*\)".*/\1/p' "$SRC/.claude-plugin/plugin.json" | head -1)"

# --- 3. Install into ~/.fusion (atomic replace) ------------------------------
say "Installing to $INSTALL_DIR ..."
rm -rf "$INSTALL_DIR"
mkdir -p "$INSTALL_DIR"
# Copy the plugin assets. No permission file is among them: a plugin's own
# permission settings were measured not to be read under --plugin-dir, so
# fusion ships none and /fusion:setup seeds the project's own file instead.
# Never dev cruft (no node_modules, CLAUDE.md, .gitignore). cp -R preserves the
# +x bit on bin/ and hook scripts.
for item in .claude-plugin agents skills rules hooks bin stilwerk templates docs \
            README.md README-agents.md README-hooks.md LICENSE; do
  [ -e "$SRC/$item" ] && cp -R "$SRC/$item" "$INSTALL_DIR/"
done
[ -f "$INSTALL_DIR/.claude-plugin/plugin.json" ] || die "Install copy failed."
# Defensive: drop any dev cruft that a non-pristine source might carry. The
# GitHub tarball never contains node_modules (gitignored), but a local source
# might — the compiled hooks under hooks/dist are self-contained, so node_modules
# is never needed at runtime.
rm -rf "$INSTALL_DIR/hooks/node_modules"
# Compiled hooks must be present — the guard runs from hooks/dist.
[ -f "$INSTALL_DIR/hooks/dist/guard.js" ] \
  || warn "hooks/dist/guard.js missing — the compliance guard will not run."

# --- 4. Launcher --------------------------------------------------------------
mkdir -p "$BIN_DIR"
cat > "$LAUNCHER" <<EOF
#!/usr/bin/env bash
# fusion launcher — loads the plugin directly from a folder (no cache, no git).
set -euo pipefail
FUSION_DIR="$INSTALL_DIR"
case "\${1:-}" in
  --update)
    curl -fsSL "https://raw.githubusercontent.com/$REPO/main/install.sh" -o /tmp/fusion-install.sh \
      && bash /tmp/fusion-install.sh
    exit \$?
    ;;
  --uninstall)
    rm -rf "\$FUSION_DIR" "$LAUNCHER"
    echo "fusion removed."
    exit 0
    ;;
  --where)
    echo "\$FUSION_DIR"
    exit 0
    ;;
  -h|--help)
    cat <<'USAGE'
fusion — launch Claude Code with a fusion agent (loads ~/.fusion via --plugin-dir)

  fusion                  orchestrator (default)
  fusion coder            --agent fusion:coder
  fusion consultant       --agent fusion:consultant
  fusion fusion:planner   already-namespaced names pass through
  fusion --yolo [agent]   add --dangerously-skip-permissions (no prompts)
  fusion [agent] -p "..." extra args after the agent go straight to claude

  fusion --update         re-download the latest over HTTPS
  fusion --uninstall      remove ~/.fusion and this launcher
  fusion --where          print the install dir
USAGE
    exit 0
    ;;
esac

# Optional --yolo (must come first): clear permission prompts for this run.
SKIP=""
if [ "\${1:-}" = "--yolo" ]; then SKIP="--dangerously-skip-permissions"; shift; fi

# First non-flag argument is the agent name (default: orchestrator). Anything
# after it is passed straight through to claude (e.g. -p "prompt").
AGENT="orchestrator"
if [ \$# -gt 0 ] && [ "\${1#-}" = "\$1" ]; then AGENT="\$1"; shift; fi
case "\$AGENT" in
  *:*) TARGET="\$AGENT" ;;
  *)   TARGET="fusion:\$AGENT" ;;
esac

# Export the plugin dir so agent Bash tool calls inherit FUSION_PLUGIN_ROOT
# without depending on the SessionStart \$CLAUDE_ENV_FILE mechanism (which does
# not reliably propagate into Bash tool calls). Always the exact dir passed to
# --plugin-dir, so bin/ and rules/ resolve correctly even with multiple installs.
export FUSION_PLUGIN_ROOT="\$FUSION_DIR"
exec claude \$SKIP --plugin-dir "\$FUSION_DIR" --agent "\$TARGET" "\$@"
EOF
chmod +x "$LAUNCHER"

# --- 5. PATH check ------------------------------------------------------------
say "fusion ${VERSION:-} installed."
case ":$PATH:" in
  *":$BIN_DIR:"*)
    echo "Start a session any time with:  fusion"
    ;;
  *)
    warn "$BIN_DIR is not on your PATH yet."
    echo "Add it once (zsh):"
    echo "  echo 'export PATH=\"$BIN_DIR:\$PATH\"' >> ~/.zshrc && source ~/.zshrc"
    echo "Then start fusion with:  fusion"
    echo "(Or run it now with the full path: $LAUNCHER)"
    ;;
esac
echo
echo "Update later:  fusion --update     Remove:  fusion --uninstall     Path:  fusion --where"
