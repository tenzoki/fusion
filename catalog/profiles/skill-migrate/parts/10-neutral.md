```

**`READS_V12=no`: stop here**, before surveying, and tell the user the `REFUSED` line.

**Then the survey. Detection is by artefact presence, not by version** (not `.fusion-setup`'s `plugin_version`). The pass is due while a legacy store exists: `circles/`, `shared/planning/`, `shared/consult/`, or a `planning/` directly inside a container under either store, which is where a refused fold leaves one. Each is something the apply removes, so the filesystem is the only state and a refused or interrupted move is found again next run. Nothing the pass merely inspects enters the trigger, or the question would fire forever.

Run this second. It is read-only:

```bash
WB=./fusion-workbench; FOUND=0; LEGACY=0; COLLISIONS=0; UNTRACKED=0; DIRTY=0; UNKNOWN=0; LEFT=0
if git rev-parse --is-inside-work-tree >/dev/null 2>&1 && [ -n "$(git ls-files "$WB" | head -1)" ]; then MODE=git; else MODE=plain; fi
for d in planning issues decisions history analyses investigations consult memos codereview ontoreview conceptreview; do [ -d "$WB/$d" ] && { echo "  LEGACY: $d/ (root type folder)"; LEGACY=1; }; done
F="$(find "$WB/circles" -mindepth 1 -maxdepth 1 -type f -name '*.md' 2>/dev/null | grep -E '/[0-9]{6}-[0-9]{4}\[[a-z]\][^/]*\.md$' | head -1)"; [ -n "$F" ] && { echo "  LEGACY: ${F#"$WB"/} (v4-era work item as a flat file)"; LEGACY=1; }
F="$({ [ -d "$WB/shared" ] && find "$WB/shared" -type f -name '*[[]*[]]*.md' 2>/dev/null; [ -d "$WB/circles" ] && find "$WB/circles" -mindepth 2 -type f -name '*[[]*[]]*.md' 2>/dev/null; } | grep -E '\[[oatcibspd]\]-[^/]*$' | head -1)"; [ -n "$F" ] && { echo "  LEGACY: ${F#"$WB"/} (bracket marker in the name)"; LEGACY=1; }
F="$(find "$WB/circles" -mindepth 2 -maxdepth 2 -type f -name '_[at]_circle.md' 2>/dev/null | head -1)"; [ -n "$F" ] && { echo "  LEGACY: ${F#"$WB"/} (live Circle record)"; LEGACY=1; }
