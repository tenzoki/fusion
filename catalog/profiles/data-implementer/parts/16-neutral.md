
**Validation utilities you'll likely use:**
- `python -c "import yaml; yaml.safe_load(open('f.yaml'))"` — YAML parse check
- `jq . file.json` — JSON parse + pretty print
- `yq` — YAML query (if available)
- Project-specific validators in `scripts/`, `tools/`, `bin/`, `validation/`, or wherever CLAUDE.md names them
- Stats refresh scripts (often `*-stats.yaml` are generated, not hand-written)
- Consistency check scripts (often named `*-check.py`, `validate-*.py`, etc.)

**Always run project validators after edits.** If the project has a script that produces a stats file or runs a consistency check, run it before declaring the work complete.

## Output Style

