# A trailing `--` lifts the branch deny, so `git checkout -b <name> --` runs

---

**Severity:** High — a two-character suffix defeats the branch policy's primary case
**Domain:** code (security control)
**Filed by:** analyst, during the guard-enforced-policies analysis
**Affects:** `hooks/lib/git-branch-guard.ts` (`classifyCheckout`)
**Cross-references:**
`fusion-workbench/shared/analyses/260809-1103-guard-enforced-policies.md` §Findings 2b-1,
`rules/git-branch-discipline.md:24-28` (the allow-list this over-reads),
`hooks/lib/__tests__/git-branch-guard.test.ts:85-94` (the tests that cover the flags without the separator)

---

## What is wrong

`classifyCheckout` treats the presence of a `--` token anywhere in the argument list as proof that the call is a file restore, and returns *allow* before it looks at anything else:

```
hooks/lib/git-branch-guard.ts:246
  if (args.includes("--")) return null; // pathspec form → ALLOW
```

The branch-creating and detaching flags are only examined afterwards, at `:249-259`. So `-b`, `-B`, `--detach`, `--orphan` and `-` are all invisible whenever a `--` follows them.

The design comment two screens up states the intended reading, and it is the correct one: "A `--` separator is the primary, unambiguous discriminator: everything after it is a pathspec, so HEAD cannot move" (`:24-26`). That is true of `git checkout <ref> -- <paths>`. It is not true when a branch-creating flag is also present, and git resolves the flag first.

## Measured

Classifier, work-tree build, resolver that denies everything (the worst case for the ambiguous form):

```
allow   git checkout -b bar --
allow   git checkout -B bar --
allow   git checkout --detach HEAD --
allow   git checkout --orphan o --
DENY    git checkout -b feature          (the control, no separator)
```

Real git 2.49.0, fresh repository, HEAD on `master`:

```
$ git checkout -b bar --
Switched to a new branch 'bar'
HEAD=bar

$ git checkout -B bar --
Switched to a new branch 'bar'
HEAD=bar
```

The `-b` and `-B` rows are verified end to end: guard allows, git moves HEAD. The `--detach` and `--orphan` rows are verified on the classifier only; they take the identical code path, and re-measuring them through real git would have meant working around a live deny, which `rules/git-branch-discipline.md:45` forbids. Treat those two as `inference:` until someone measures them in a sandbox.

## Why no test caught it

`git-branch-guard.test.ts` covers each flag on its own (`:85` `-b`, `:89` `-B`, `:93` `--detach`) and covers the separator on its own (the file-restore family). No case combines them. The suite's shape encodes the same assumption the code does: that the separator and the flags are alternatives rather than co-occurring tokens.

## Suggested direction

Reorder, and say why in the code. The flag scan at `:249-259` moves above the separator check at `:246`. A branch-creating flag is unconditional evidence that HEAD moves, and no later token withdraws it; the separator only settles the *ambiguous* form, which is what the rest of the function is for.

The change can only add denies, never remove one, so the "nothing newly allows" direction needs no measurement. What does need measuring is the other direction: confirm that `git checkout HEAD -- <files>`, fusion's own revert spelling, is untouched.

## Acceptance criteria

- [x] `git checkout -b foo --`, `-B foo --`, `--detach HEAD --` and `--orphan o --` all deny.
- [x] `git checkout HEAD -- rules/x.md` still allows (fusion's revert strategy).
- [x] `git checkout -- file`, `git checkout <ref> -- file`, `git restore file` still allow.
- [x] A test pins the flag-plus-separator combination for each of the five flags, with a comment naming why the two are not alternatives.

---
Resolved: `9716ee5` — in `classifyCheckout` the branch-creating and detaching
flag scan now runs *above* the separator check, so `-b`, `-B`, `--detach`,
`--orphan` and `-` deny whatever follows them. The design comment states the
invariant the reorder rests on: evidence that HEAD moves is unconditional, no
later token withdraws it, and the `--` settles the ambiguous form only. Pinned
by the describe block "a trailing `--` does not withdraw a HEAD-moving flag" in
`hooks/lib/__tests__/git-branch-guard.test.ts` — all five flags with a trailing
separator, the same with pathspecs behind it, the same through wrappers and
subshells, and the same against a resolver that would resolve every operand —
plus the real-git rows in `guard-bash-integration.test.ts`. Fusion's own revert
spelling is covered from the other side by "leaves fusion's own revert spelling
allowed". Step 6 of
`shared/planning/260809-1229_*_plan-five-severe-guard-defects.md` corrected the
allow-list entry in `rules/git-branch-discipline.md`, which had presented the
`--` separator as the primary, unambiguous discriminator without qualification.

**Reconciliation 260809-1651 (reconciler, domain `code`) — closure confirmed against the tree.**
All four acceptance criteria verified at HEAD `fb262d8`. The five HEAD-moving flags (`-b`, `-B`, `--detach`, `--orphan`, `-`) are scanned at `hooks/lib/git-branch-guard.ts:372-383`, above the `args.includes("--")` allow at `:384`. `git checkout HEAD -- <file>` falls through to the separator check unchanged. The describe block "a trailing `--` does not withdraw a HEAD-moving flag" (`hooks/lib/__tests__/git-branch-guard.test.ts:448`) and "leaves fusion's own revert spelling allowed" (`:496`) both pass. `rules/git-branch-discipline.md` `## What stays allowed` now qualifies the separator form with "as long as no branch-creating or detaching flag stands in front of the separator" and cites this record.
