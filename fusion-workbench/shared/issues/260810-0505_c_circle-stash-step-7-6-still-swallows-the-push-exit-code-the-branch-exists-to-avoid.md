# `circle-stash` step 7.6 still swallows the push exit code that the branch exists to avoid

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, review of `8960e1a..HEAD` (session `260810-0241`, Turn 1)
**Affects:** `skills/circle-stash/SKILL.md` Step 7.6 — both `|| true` terminators; the "Why the branch, and why that probe" paragraph
**Cross-references:** commit `b6bbae7`; `shared/issues/260717-0030_c_git-stash-include-untracked-can-sweep-the-stash-directory.md` (closed)

---

## What is right, verified first

The fix works. Step 7.6 was extracted and run verbatim against four scratch repositories:

| Configuration | Branch taken | Stash directory | Source freed |
|---|---|---|---|
| workbench not ignored, nothing tracked in it | pathspec | survives | yes |
| workbench not ignored, tracked files inside | pathspec | survives | yes |
| workbench gitignored | fallback | survives | yes |
| workbench gitignored + force-added tracked files | fallback | survives | yes |
| **pre-fix command, workbench not ignored** | — | **destroyed** | — |

The probe's premise is confirmed too: `git add --dry-run --all -- ':/' ':(exclude)fusion-workbench'`
exits 0 against a non-ignored workbench and 1 against an ignored one, with git 2.49.0. The documented
residual is real and behaves as documented — in the force-added configuration the tracked workbench
file's uncommitted change does travel in the git stash, and the stash directory still survives.

## The defect

The stated reason for branching is that a swallowed failure reports a freeze that did not happen:

> measured, the entry is created, the working tree is left untouched, and `|| true` would have
> swallowed it and reported a freeze that did not happen.

Both branches still end in `|| true`:

```bash
if (cd "$PROJECT_ROOT" && git add --dry-run --all -- ':/' ":(exclude)$WB_NAME" >/dev/null 2>&1); then
  cd "$PROJECT_ROOT" && git stash push --include-untracked -m "…" -- ':/' ":(exclude)$WB_NAME" || true
else
  cd "$PROJECT_ROOT" && git stash push --include-untracked -m "…" || true
fi
```

So the defence against that failure mode is entirely the probe's accuracy. If the probe ever
mispredicts, the identical failure returns, silently — and the `STASH_COUNT_BEFORE`/`AFTER` check
cannot catch it, because in the measured failure mode the stash **entry is created** while the working
tree is not freed. The count goes up, the skill reports a successful freeze, and the user's changes are
still in the tree when they switch branches.

The probe is faithful today: I checked that `git add -n` (the spelling `git stash push` actually uses
with `--include-untracked`) and `git add -n --all` (the spelling the probe uses) give the same answer
on an ignored path — both exit 1. But that equivalence is a coincidence of the current `--include-untracked`
form, and `git add -n -u` exits 0, so dropping `--include-untracked` in future would silently break it.

## Second, smaller: the stated mechanism is wrong

The skill and the commit message both say `git stash push <pathspec> --include-untracked` "runs
`git add --all -- <pathspec>` internally". With `--include-untracked`, git runs `git add -- <pathspec>`
— no `--all`; the `-u` form is the one used *without* `--include-untracked`. The conclusion is
unaffected (both spellings refuse an ignored pathspec), but a maintainer reasoning from the stated
mechanism would get the `-u` case wrong, which is the one case where the answers differ.

## Fix direction

Capture the push's exit code instead of discarding it, and treat a non-zero exit as a failed freeze:
report it to the user and do not write the manifest as though the working tree were saved. The
before/after count stays useful for the "no local changes" branch; it just cannot be the only check.
Correct the `--all` wording while there.

---
Resolved: 72b798e — the push exit code is captured and a non-zero exit halts the freeze before the manifest is written. Both checks kept, and they fail in opposite directions: the exit code catches a push git refused (indistinguishable from success to the count), the count catches a push git accepted that saved nothing (exit 0, needs the sentinel pop reads). Driven against five scratch repositories including a forced probe misprediction and an unmerged index. The --all wording corrected at both places, with the measurement that git add -n -u is the one spelling that disagrees.
