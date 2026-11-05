
```bash
if [ "$(git rev-parse --is-inside-work-tree 2>/dev/null)" = "true" ] && git ls-files --error-unmatch fusion-workbench >/dev/null 2>&1; then
  for p in orchestrator-events.jsonl .fusion-setup .asset-provenance workbench.json; do
    git check-ignore -q "fusion-workbench/$p" || continue
    grep -qxF "!fusion-workbench/$p" ./.gitignore 2>/dev/null || { [ -s ./.gitignore ] && [ -n "$(tail -c1 ./.gitignore)" ] && printf '\n' >> ./.gitignore; printf '!fusion-workbench/%s\n' "$p" >> ./.gitignore; }
    if git check-ignore -q "fusion-workbench/$p"; then echo "gitignore: $p still excluded by a nested ignore file, $(git check-ignore -v "fusion-workbench/$p" | cut -f1) — not repaired"; else echo "gitignore: $p was excluded — negation appended to $(pwd)/.gitignore"; fi
  done
  if git ls-files --error-unmatch fusion-workbench/.checkout-id >/dev/null 2>&1; then
