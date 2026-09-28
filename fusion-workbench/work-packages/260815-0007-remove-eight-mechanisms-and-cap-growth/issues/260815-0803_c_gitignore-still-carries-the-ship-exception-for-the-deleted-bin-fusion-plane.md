.gitignore still carries the ship exception for the deleted bin/fusion-plane

---

**Severity:** Medium
**Domain:** data
**Filed by:** ontorev, review of `9a7da8e..7c12d6a` (structured-data half), review file `260815-0803-ontorev-plane-structured-data-removal.md`
**Owner:** `ontocoder`
**Affects:** `.gitignore:30`
**Cross-references:** commit `d0ddabb` (deleted `bin/fusion-plane`); the WARNING comment at `.gitignore:14-20`, which states the obligation this violates.

---

`d0ddabb` deleted `bin/fusion-plane` and left `!bin/fusion-plane` standing in `.gitignore`. The block's own comment names the obligation, the failure mode and the fact that nothing checks it.

---

**Verified 2026-08-15 at HEAD `7c12d6a`.** The exception list differs from the tree in exactly one entry, and it is this one:

```
$ comm -3 <(grep '^!bin/' .gitignore | sed 's|^!bin/||' | sort) <(ls bin/ | sort)
fusion-plane
```

Nothing else is missing in either direction: all fourteen files under `bin/` have an exception, and no other exception names a file that is gone.

The comment three lines above it says what to do and why:

```
.gitignore:14-20
# WARNING: every shipped helper MUST be listed here as `!bin/<name>` or it
# gets silently dropped from the plugin distribution. New helper added?
# Add the exception line here AND verify with `git ls-files bin/`. Helper
# REMOVED? Take its line out too — nothing checks that this list matches `bin/`,
# so a stale exception sits here naming a file that does not exist and reads to
# the next editor as a helper that failed to ship.
```

**What it costs.** Nothing at runtime: a re-inclusion exception for a path that does not exist is inert, and no installer or packaging step reads the list for an inventory. The cost is the one the comment predicts. The list is the only written record of which helpers ship, and a reader comparing it against `bin/` finds a name with no file, which reads as a helper that was dropped from the distribution rather than one that was deleted on purpose.

**Why it was missed.** Step 2's file list names `bin/fusion-plane` and does not name `.gitignore`, and there is no gate: the comment states outright that nothing checks the list against the tree. That is the same shape as the two uncovered `CLAUDE.md` inventory rows filed in `260815-0803_*_two-claude-md-inventory-rows-went-stale-and-neither-lint-gate-can-see-them.md`, and a reader closing both may want to close them with one mechanism. This record does not propose one; the one-line deletion below is not blocked on that question.

**The fix.** Delete line 30 of `.gitignore`. Re-run the `comm` above and confirm it prints nothing.

---
Resolved: fixed. The `bin/` re-inclusion block was swept in `5f2171e`. Verified at HEAD `9306f0a` by the reconciliation pass of 260815-1913, by set comparison rather than by reading the diff: `grep '^!bin/' .gitignore | sed 's/^!//' | sort` and `ls bin/ | sed 's|^|bin/|' | sort` are identical, twelve entries each. No exception names a file the tree does not carry, and no shipped file lacks one. The `!.env.example` exception at `:51` is deliberately left, per the closing note on `260815-1635_*_the-gitignore-sweep-that-removed-two-dangling-ship-exceptions-missed-the-third.md`: it is a standing allowance for a placeholder, not a ship exception for a deleted helper.
