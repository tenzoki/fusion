Step 0j appends a negation a nested .gitignore overrides, and appends it again on every run

---
`skills/setup/SKILL.md:370` repairs an excluded R2/R3 entry by appending `!fusion-workbench/<p>` to the root `.gitignore`. When the exclusion comes from `fusion-workbench/.gitignore` or `.git/info/exclude`, the root negation loses (the deeper file wins), `git check-ignore -q` still exits 0 on the next run, and the line is appended again, every run, while the Done report says the entry was repaired. Measured against a scratch repository: two runs, two identical negation lines, the file still excluded.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>
**Cross-references:** `shared/issues/260825-1019_*_nothing-checks-that-a-tracked-workbenchs-gitignore-matches-the-four-class-partition.md` (closed by this step); `shared/decisions/260825-1030_a_does-setup-repair-a-gitignore-that-departs-from-the-four-class-partition.md`; commit `abb0238`

## Evidence

Scratch repo with `fusion-workbench/.gitignore` containing `orchestrator-events.jsonl`, the Step 0j block run twice at `e9dc9b2`:

```
gitignore: orchestrator-events.jsonl was excluded — negation appended to …/.gitignore   (twice)
.gitignore: !fusion-workbench/orchestrator-events.jsonl   (twice)
git check-ignore -v: fusion-workbench/.gitignore:1:orchestrator-events.jsonl
```

## Fix direction

Use `git check-ignore -v` to learn which file carries the exclusion and append the negation to that file (or below it), then re-run `check-ignore` and report a repair only when it now exits 1; when it still excludes, report "excluded by <file>:<line>, not repaired". Skip the append when the negation line is already present.

## Acceptance

Against the scratch shape above, one run leaves the entry un-excluded and a second run prints nothing; a root `.gitignore` never gains a duplicate line.
