
The rest: that helper's header.

## gitignore — a tracked workbench against the four-class partition

`rules/workbench-tracking.md` `## The four classes` says which root entries travel and which stay; decisions `260825-1030_*_may-a-project-depart-from-the-four-class-partition-deliberately-and-say-so-once.md` and `260825-1030_*_does-setup-repair-a-gitignore-that-departs-from-the-four-class-partition.md` say what fusion does when a tracked workbench's `.gitignore` departs from it: repair an excluded R2/R3 entry with a negation line, report a tracked class L entry, repair `.checkout-id` alone (the one whose tracking gives a wrong answer, not noise), never touch an R1 exclusion, ask nothing. Only in a git work tree that already tracks `fusion-workbench/`; the choice not to track is the project's. The question is `git check-ignore -q`, never a text read of `.gitignore`, for the reason the rule gives for `git check-attr`. A class L entry that is neither tracked nor ignored is reported as well: no rule covers it, so it stands as `??` in `git status` from the moment it holds a byte, and the next `git add` of a directory commits it. **That entry is found with `git ls-files --others --exclude-standard` over it** — what git would actually pick up — and never with `check-ignore` on the entry's own path, which is the wrong question for a directory covered by the `dir/*` form (defect `260905-2234_*_step-0js-new-unignored-branch-fires-on-a-directory-whose-contents-are-ignored-by-the-dir-star-form.md`). The existence test that stood in front of it went with the question it guarded. Reported and not repaired, because nothing is tracked yet and the direction-B criterion repairs a wrong answer, not a risk (defect `260828-0853_*_setup-step-0j-misses-a-class-l-entry-that-is-untracked-but-not-ignored.md`).

```bash
if [ "$(git rev-parse --is-inside-work-tree 2>/dev/null)" = "true" ] && git ls-files --error-unmatch fusion-workbench >/dev/null 2>&1; then
  for p in orchestrator-events.jsonl .fusion-setup .asset-provenance workbench.json; do
    git check-ignore -q "fusion-workbench/$p" || continue
    grep -qxF "!fusion-workbench/$p" ./.gitignore 2>/dev/null || { [ -s ./.gitignore ] && [ -n "$(tail -c1 ./.gitignore)" ] && printf '\n' >> ./.gitignore; printf '!fusion-workbench/%s\n' "$p" >> ./.gitignore; }
    if git check-ignore -q "fusion-workbench/$p"; then echo "gitignore: $p still excluded by a nested ignore file, $(git check-ignore -v "fusion-workbench/$p" | cut -f1) — not repaired"; else echo "gitignore: $p was excluded — negation appended to $(pwd)/.gitignore"; fi
  done
  if git ls-files --error-unmatch fusion-workbench/.checkout-id >/dev/null 2>&1; then
