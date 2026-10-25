   [ -n "$FUSION_SRC" ] || echo "  filter 3 skipped: source root unresolved (FUSION_PLUGIN_ROOT unset)"
   set --; for c in CLAUDE.md rules .claude/rules "$FUSION_SRC"/CLAUDE.md "$FUSION_SRC"/rules "$FUSION_SRC"/agents "$FUSION_SRC"/skills "$FUSION_SRC"/hooks/lib "$FUSION_SRC"/bin "$FUSION_SRC"/docs $({ find "$FUSION_SRC" -maxdepth 1 -name 'README*.md'; find "$FUSION_SRC/hooks" -maxdepth 1 -name '*.ts'; } 2>/dev/null); do [ -n "$FUSION_SRC" ] && [ -e "$c" ] && set -- "$@" "$c"; done
   KEEP=""; for f in <candidates>; do rel="${f#"$WORKBENCH"/}"; key="$(basename "$f" | sed -E 's/[][\\.^$*+?(){}|]/\\&/g; s/^([0-9]{6}-[0-9]{4})_[a-z]_/\1_[a-z*]_/')"; hit="$(grep -r -l -E -e "$key" "$@" 2>/dev/null | head -1)"; if [ -n "$hit" ]; then echo "  kept (cited in $hit): $rel"; else KEEP="$KEEP$f
   "; fi; done
   ```
   `$KEEP` is the surviving list; a cited file is reported as kept, naming the citing file, never dropped silently.

5. **Propose.** Print to the user:
   - Mode (tier-N + threshold, or the natural-language description verbatim).
   - Resolved slug + target archive path.
   - Per-bucket counts. Name the work packages individually — an item is a whole unit of work and the user should see which ones by basename, with their brief line, not just a count. Everything else may be counted in bulk.
   - Total file count and total bytes.
   - **The guard event log**, on its own line: whether it will be rolled, and its current line count and size. Say nothing when the live log is absent or empty — a skipped roll is not news.
   - Anything dropped by the safety filters, with a one-line summary; a terminal item excluded because a live item depends on it is named individually, together with the item that names it, and one excluded for a live record inside it with each such record.
   - In natural-language mode, list `[ACTIVE]`-flagged hits explicitly.

