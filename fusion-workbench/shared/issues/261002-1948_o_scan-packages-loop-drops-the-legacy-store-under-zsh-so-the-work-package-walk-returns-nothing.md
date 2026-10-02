`for s in $SCAN_PACKAGES` returns no work package at all under zsh once the legacy container store exists
---
`bin/fusion-paths` emits `SCAN_PACKAGES=work-packages circles` while a `circles/` directory exists (`packages_value`, the v12 transition window). zsh does not word-split an unquoted parameter expansion, so `for s in $SCAN_PACKAGES` runs once with the whole string, `find "$WORKBENCH/work-packages circles"` fails, `2>/dev/null` hides it, and the walk yields nothing with exit 0. bash yields every container. The Bash tool's shell is zsh on this machine.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260806-0709_*_unquoted-scan-iteration-in-drei-schwester-skills-zsh.md, 261002-1723_*_archive-moves-a-done-work-package-whole-and-takes-an-open-issue-inside-it-out-of-every-scan.md

Severity: Medium. Pre-existing since `2c05cd6b` (v12.0), not introduced by v12.2.2; the 12.2.2 archive fix extends the affected block and its new zsh test exercises only a single-valued `SCAN_PACKAGES`, so the case that fails is the one left untested.

Sites (same construct, shell variables are the designed mode: `agents/orchestrator.md` tests `[ -n "$SCAN_PACKAGES" ]` one line above):

- `skills/archive/SKILL.md` `## Process` step 3, the work-package selection block (`for s in $SCAN_PACKAGES; …`). Effect: no container is selected and no live-record exclusion is printed. Fails safe for data, silently.
- `skills/archive/SKILL.md` `## Process` step 3, the head-field block (`**Then check the two head fields**`). Same construct.
- `skills/archive/SKILL.md` Step 1, the paragraph that starts `**A SCAN_* value may name several directories**`, prescribes `for p in $SCAN_PLANS; do …` for every tier glob. The same split fails for `SCAN_PLANS` when a legacy `planning/` store exists. The two later "Step 1's split rule" references point at this paragraph, which says nothing about zsh.
- `agents/orchestrator.md` Setup, `**Read the work packages, and find the one this checkout has claimed.**` block. Effect: the orchestrator sees no work package, including the one this checkout claimed.

Evidence (measured 261002, scratch workbench with `work-packages/{a,b,c}` and a `circles/` dir):

```
WORKBENCH=$wb SCAN_PACKAGES="work-packages circles" bash blk.sh   # 3 lines
WORKBENCH=$wb SCAN_PACKAGES="work-packages circles" zsh  blk.sh   # 0 lines
```

Same result for the orchestrator line (bash 3 rows, zsh 0). With `SCAN_PACKAGES=work-packages` both shells agree.

Fix direction: the construct the earlier fix used at the sibling sites, `for s in $(printf '%s\n' "$SCAN_PACKAGES")` (both shells field-split an unquoted command substitution; store names carry no whitespace), applied at every site above and stated once in the Step 1 paragraph. `agents/orchestrator.md` is under the growth bounds; the change is a few bytes per site.

Acceptance: `hooks/lib/__tests__/archive-filter-key.test.ts` runs the selection block under zsh with `SCAN_PACKAGES="work-packages circles"` and a legacy container present, and gets the same lines as bash; a test or lint covers the orchestrator block the same way; `grep -rnE 'for [a-z]+ in \$SCAN_' skills agents` finds no bare form.
