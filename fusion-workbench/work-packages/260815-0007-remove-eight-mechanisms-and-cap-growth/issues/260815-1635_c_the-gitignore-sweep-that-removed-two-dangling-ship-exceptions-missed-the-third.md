The `.gitignore` sweep that removed two dangling ship-exceptions missed the third

---

P-11's commit swept `.gitignore` for `!bin/` exceptions naming deleted helpers and removed two of
them, its own and step 2's. A third, `!bin/fusion-churn-rank`, was left: the helper was deleted at
step 4 of this same Circle. `.gitignore:38` still carries it.

---

## Context

P-11's commit message (`f45f76a`):

> And the gitignore carried ship-exceptions for this step's deleted helper and for step 2's, three
> lines apart, invisible to every gate because the reference lint does not scan that file. Both
> removed.

Measured at HEAD, the `!bin/` list against the directory:

```
$ diff <(grep -o '^!bin/.*' .gitignore | sed 's|^!bin/||' | sort) <(ls bin/ | sort)
1d0
< fusion-churn-rank
```

`bin/fusion-churn-rank` was deleted at step 4 (`a69d56e`, the churn removal). The line has therefore
outlived its file by eight commits, through a sweep of the same file that named its subject as
"ship-exceptions for deleted helpers".

`.gitignore`'s own header (`:22-25`) says the list has no checker:

> WARNING: every shipped helper MUST be listed here as `!bin/<name>` or it gets silently dropped from
> the plugin distribution. New helper added? Add the exception line here AND verify with
> `git ls-files bin/`. Helper REMOVED? Take its line out too — nothing checks that this list matches
> `bin/`.

**Impact is inert but the class is not.** An exception for a file that does not exist changes
nothing about what git tracks. What it does is leave a stale name in the one packaging file that
decides whether a helper ships, in a repository where three helpers were deleted in four days and a
fourth may be added at step 13. The failure the header warns about is the *other* direction — a new
helper with no line, silently dropped — and a list that already disagrees with `bin/` is a list
nobody trusts enough to check the other way.

`hooks/lib/__tests__/derivable-enumerations-lint.test.ts` already re-derives the `bin/` helper roster
in `CLAUDE.md`'s Layout table in both directions. This list is the same enumeration in a file that
lint does not scan.

## Suggested direction

Delete `.gitignore:38`. Separately worth considering: the `bin/` roster is now asserted in
`CLAUDE.md` and unasserted here, which is one enumeration with two homes and one gate — extending
the existing lint to `.gitignore`'s `!bin/` list is a smaller change than it looks and would close
the class rather than this instance. That second half is a suggestion, not part of the defect.

---
Resolved: `!bin/fusion-churn-rank` deleted from `.gitignore` (it was line 38; the file is now 112
lines). The list was then re-measured against the directory in **both** directions rather than the
count being trusted:

```
$ diff <(grep -o '^!bin/.*' .gitignore | sed 's|^!bin/||' | sort) <(ls bin/ | sort)
$ echo $?
0
```

No fourth dangling `!bin/` exception exists, and no helper in `bin/` is missing its line — the two
sets are now equal, which is the stronger of the two properties the header warns about. Twelve
helpers, twelve exceptions.

One other exception in the file names a path the tree does not carry: `!.env.example` at line 51,
under `.env` / `.env.*`. It is deliberately left alone. It is not this defect's class — not a
ship-exception for a deleted helper, but a standing allowance for a placeholder file this repository
has never had, of the kind a `.gitignore` carries pre-emptively. Removing it would change behaviour
the day someone adds the file.

The suggested second half — extending `derivable-enumerations-lint` to this list so the `bin/` roster
has one gate across both of its homes — was **not** done. The record marks it a suggestion rather
than part of the defect, and adding a gate is not this dispatch's scope.
