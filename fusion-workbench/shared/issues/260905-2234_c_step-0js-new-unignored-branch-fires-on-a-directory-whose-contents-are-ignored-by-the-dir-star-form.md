Step 0j's new unignored branch fires on a directory whose contents are ignored by the `dir/*` form

---
The `elif` added to `skills/setup/SKILL.md` Step 0j asks `git check-ignore -q` about the class L entry's own path. Two entries in the roster are directories, `.commit-lock` and `.guard-state`, and the ignore form this project mandates for them is `dir/*`, which covers the contents and not the directory path. So `check-ignore` exits 1 on the directory, the branch reports a departure, and both statements the report rests on are false in that state: `git status --untracked-files=all` is silent, and a `git add` of the directory or of `fusion-workbench` stages nothing.
---
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>

**Checkout:** 5e8248d7

**Severity:** Low. It reports where nothing is wrong, at Setup, in every session of a project that follows the convention. Nothing is repaired and nothing is staged, so the cost is a false line the user has to dismiss and a check that stops being read.

**Cross-references:** `260828-0853_*_setup-step-0j-misses-a-class-l-entry-that-is-untracked-but-not-ignored.md` (the record whose repair introduced this; its own acceptance names `.cadence-anchors`, a file, and is met).

## Evidence

`skills/setup/SKILL.md` Step 0j, the class L loop, at `ea819262`:

```
elif [ -e "fusion-workbench/$p" ] && ! git check-ignore -q "fusion-workbench/$p"; then
```

`CLAUDE.md` `## Conventions`, the `.gitignore` entry, mandates the `dir/*` form for a shipped path inside an excluded directory, and this repository applies it: `.gitignore:95` is `fusion-workbench/.guard-state/*` and `:96` is `fusion-workbench/.commit-lock/*`.

Run verbatim in this repository at `4db7dddb`, the block prints one line:

```
gitignore: class L entry .guard-state is untracked and covered by no ignore rule — not repaired, report it
```

`.commit-lock` does not print only because it does not exist between commits; the `[ -e ]` test is what suppresses it, and it prints whenever a commit is in flight.

Reproduced minimally in a scratch root holding one `.gitignore` line, `fusion-workbench/.guard-state/*`:

- `git check-ignore -v fusion-workbench/.guard-state`: exit 1, no output
- `git check-ignore -v fusion-workbench/.guard-state/events.jsonl`: exit 0, names the pattern
- `git status --short --untracked-files=all`: empty
- `git add fusion-workbench/.guard-state`, then `git add fusion-workbench`: stage nothing

## Acceptance test

For an entry that is a directory on disk, Step 0j reports only when something inside it is neither tracked nor ignored, and not when the directory path alone fails `check-ignore` while every file under it is covered. Run verbatim in this repository, the class L loop prints nothing for `.guard-state` and nothing for `.commit-lock` while a commit is in flight; run against a directory with no ignore rule at all, it still prints.

---
Resolved: The branch no longer asks whether the entry path is ignored; it asks git what it would pick up under that path, with git ls-files --others --exclude-standard. That question reaches an entry contents, which is where the dir-star form does its work, and it reads the same exclude sources as before, so the ignore semantics are unchanged. The existence test the previous branch needed is gone with the question that needed it: check-ignore answers for a path that does not exist, ls-files --others lists nothing for one. So the repair removes a test rather than adding one. Verified by extracting the block verbatim and running it over ten scratch roots, including this repository gitignore reproduced entirely with all nine roster entries present and a lock file in flight: silent there, where the previous branch printed two false lines. Not covered: an empty directory with no ignore rule at all is now silent where the previous branch printed. That is the one behaviour difference which is not a false positive removed, and it is correct on its own terms, because git cannot stage an empty directory and there is nothing it would pick up.
