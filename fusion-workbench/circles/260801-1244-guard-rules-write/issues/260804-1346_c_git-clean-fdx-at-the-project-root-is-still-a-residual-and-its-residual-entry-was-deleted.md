# `git clean -fdx` at the project root is still a residual, and its residual entry was deleted rather than narrowed

---

**Severity:** Medium
**Domain:** code (documentation of a security control)
**Filed by:** coderev, review of `613d6fd`
**Affects:** `rules/protected-path-discipline.md:127-130` (the new claim) and `:655-662` (where the residual entry used to be); `README-hooks.md` (the same pair); `hooks/lib/bash-mutation-guard.ts:864-866` (`gitCleanWrites`) and `:1562` (the root exclusion)
**Kind:** NEW in `613d6fd`. The behaviour is unchanged at the project root; what changed is that the residual entry naming it was removed.
**Cross-references:**
`260804-1345_*_…` (the same root-pathspec hole on `checkout` / `restore`, where it fails open on TRACKED files — that one is the High),
`260804-1323_*_…` (`## Answer`, third bullet, where the old entry is called "wrong about git").

---

## What is wrong

`613d6fd` found that the residual entry

> A `git clean -fdx` with **no path operand** is allowed for the same reason `rm -rf *` is:
> it names no directory the ancestor check can compare.

was wrong, and it was — for `cd rules && git clean -fdx` and `git -C rules clean -fdx`, both
of which now deny correctly. But the commit **deleted the entry** and replaced it with a
sentence in the affirmative section:

> `rules/protected-path-discipline.md:129-130` — "while a plain `git clean -fdx` at the
> project root still allows."

At the project root the model's supplied `.` resolves to the root, the root is excluded from
the ancestor check on purpose (`:1562`), and the command deletes every untracked file in the
tree — including untracked files under `rules/**` and `agents/**`. That is the same residual
the deleted entry described, narrowed from "always" to "at the project root", and it is now
presented to the reader as a **cost control** rather than as a gap.

## Measured

Real guard subprocess, one fresh project per verdict; one fresh repository per effect with
`rules/untracked.md` and `build/untracked.js` present. bash 3.2 and zsh 5.9, git 2.49.0.

```
guard   bash   zsh    command                  watch
ALLOW   GONE   GONE   git clean -fdx .         rules/untracked.md
ALLOW   GONE   GONE   git clean -fdx           build/untracked.js
```

The controls that show the row does work once the directory is named:

```
block   GONE   GONE   cd rules && git clean -fdx     rules/untracked.md
block   GONE   GONE   git -C rules clean -fdx        rules/untracked.md
```

Note the first row: `git clean -fdx .` carries an **explicit** `.` positional, so
`gitCleanWrites` never supplies its implicit one — the explicit and implicit spellings of the
same command take different code paths to the same allow.

## Why it matters more than the delta suggests

The reach is untracked files only, which bounds it: `git clean` never removes a tracked file,
so a committed rule is safe. What is not bounded is a rule file an agent has just written
under `FUSION_ALLOW_RULES_WRITE` and not yet committed — exactly the workflow this Circle
exists to enable — which a later `git clean -fdx` in the same session removes with the guard
allowing.

The second cost is the one this Circle has been paying attention to: an honest residual list
is the thing the boundary sentence rests on. An entry that was half wrong should be narrowed,
not removed, or the next reader concludes the case is covered.

## Recommendation

Two edits, no code change required for the documentation half:

1. Restore the residual entry, narrowed and with the explicit spelling named:
   *"`git clean -fdx` and `git clean -fdx .` **at the project root** delete every untracked
   file in the tree, protected directories included, and allow — the root is excluded from
   the ancestor check on purpose (`cp x .`). From any other directory, and under any `-C`,
   the command denies."*
2. If the code half is taken, it is the same `writesThrough` field
   `260804-1345_*_…` recommends: `clean -f` writes through its pathspec, so the root
   exclusion should not apply to it either. Doing both in one pass is cheaper than twice, and
   they share the test.

## Test coverage this needs

- `git clean -fdx .` and `git clean -fdx` pinned with their **current** verdict and their
  real-shell effect, so the pair is visible in the suite rather than only in prose;
- if the code half lands, both as denies, with `git clean -fdx build` and `git -C build
  clean -fdx` pinned as allows.

## Anti-vacuity

Both rows allow at `613d6fd` and both delete the watched file in both shells. A
documentation-only fix cannot be pinned by a test; the two verdict rows above are what stops
the prose and the behaviour drifting again.

---

**In progress:** 2026-08-04, `coder`, plan Step 3. The **code half is done; the
documentation half is Step 7's and is not touched here.** The record stays open
until both land, because closing it on the code alone would repeat the mistake it
was filed about — a residual entry removed rather than narrowed.

Edit 2 of the recommendation, taken: `clean` carries the same `writesThrough`
field `260804-1345_*_git-checkout-treeish-dash-dash-dot-overwrites-the-whole-protected-list-and-allows.md` asked for, so the root exclusion does not apply to it either.
Both measured rows now deny with their real-shell effect asserted in bash and
zsh, and BOTH SPELLINGS are pinned — the explicit `git clean -fdx .` and the
implicit `git clean -fdx`, which took different code paths to the same allow.
Both allow-side controls this record names hold: `git clean -fdx build` and
`git -C build clean -fdx`, the second of which is what forced the design to
consult `writesThrough` only at the directory git actually runs in rather than at
every candidate base (see `260804-1345_*_git-checkout-treeish-dash-dash-dot-overwrites-the-whole-protected-list-and-allows.md`'s resolution note).

Two things the residual list now has to say, and Step 7 owns both:

1. The residual is **closed for `git clean` at the project root**, not narrowed —
   `git clean -fdx` and `git clean -fdx .` deny there now. Edit 1's suggested
   wording is therefore wrong as written, and the entry has to be **deleted for
   the right reason**, with that reason stated rather than left to be inferred
   (plan Step 7, obligation 9, which anticipates exactly this branch).
2. What survives and must NOT be dropped: `git clean -fdx` **from a directory the
   guard cannot place** still fails closed rather than allowing, and
   `GIT_WORK_TREE=rules git clean -fdx` in the ENVIRONMENT remains a live
   residual (`260804-1332_*_git-work-tree-in-the-environment-relocates-the-write-and-the-classifier-reads-no-variable.md`, deferred to
   `260804-1205-shell-reachability-model`). Deleting one residual entry
   while a sibling of the same shape is still open is how this record came to be
   filed.

The two verdict rows this record asked for are in the suite either way, so the
prose and the behaviour cannot drift again without a test moving.

---

**Documentation half taken: 2026-08-04, `coder`, out-of-band from plan Step 7, at the
user's explicit request.** Both edits this record's "In progress" note left for Step 7
are written. The record is complete on both halves as far as this coder can tell; the
orchestrator owns the marker move.

Measured at HEAD before writing anything, real guard subprocess, one fresh throwaway
project per case (`hooks/lib/__tests__/helpers/guard-harness.ts`, `tsx guard.ts`):

```
BLOCK  git clean -fdx          "writes THROUGH a directory that holds protected paths"
BLOCK  git clean -fdx .        same reason
BLOCK  git clean -fd           same reason
BLOCK  git clean -f            same reason
allow  git clean -fdx build
allow  git -C build clean -fdx
allow  cd build && git clean -fdx
allow  git clean -n rules      (still a read)
BLOCK  cd $D && git clean -fdx        fail-closed, directory unknowable
BLOCK  cd build; git clean -fdx       fail-closed, `;` does not guarantee the `cd`
```

So the branch this record's note point 1 anticipated is the one that obtains: the entry
is **deleted because the case closed**, not narrowed, and the deletion reason is now
written into both files instead of being left to be inferred
(`rules/protected-path-discipline.md`, "The git subcommands the check does not reach";
`README-hooks.md`, "`git clean` with no pathspec is no longer a residual"). Edit 1's
suggested wording is not used, exactly as the note says it should not be. The affirmative
sections that claimed the root "still allows" are corrected in both files.

Point 2 is taken, with one correction the note could not have known. The fail-closed
survivor is stated. The `GIT_WORK_TREE=` sibling is stated — but its shipped example has
stopped reproducing: **`GIT_WORK_TREE=rules git clean -fdx` now denies**, on the root's own
write-through rather than on the variable, so quoting it as evidence of the residual would
have shipped a fifth falsified sentence. Measured replacement, allowed by the guard and
verified against a real repository (git 2.49.0, zsh 5.9), where it deleted every file under
`rules/` including the tracked one:

```
allow  cd build && GIT_WORK_TREE=../rules git clean -fdx      → rules/ emptied
```

Both files now state that residual as a rule — any git invocation whose real working
directory came from the environment is checked against the wrong directory — with that row
as an example, and both warn that the root deny is not coverage of it.

No code was changed and none was needed. Plan Step 7's obligation list records this as
discharged early rather than dropped.
