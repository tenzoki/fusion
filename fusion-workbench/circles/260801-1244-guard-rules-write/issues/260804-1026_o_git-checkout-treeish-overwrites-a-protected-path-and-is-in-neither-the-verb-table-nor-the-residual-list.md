# `git checkout <treeish> -- <protected>` overwrites a protected file and is in neither the verb table nor the residual list

---

**Severity:** Medium
**Domain:** code (security control)
**Filed by:** reconciler, closing pass of session `history/260803-1737-orchestrator-session.md`
**Affects:** `hooks/lib/bash-mutation-guard.ts` (`MUTATION_GIT_SUBCOMMANDS`); `rules/protected-path-discipline.md:429`; `README-hooks.md`
**Kind:** PRE-EXISTING, older than this Circle.
**Cross-references:**
`260804-1024_o_…` (`git -C`, the sibling gap in the same verb's handling, found in the same pass),
`rules/protected-path-discipline.md:77-81` (the git allow/deny table, which is accurate for every row it lists),
`rules/protected-path-discipline.md:429` (the line that names the allowed form).

---

## What is wrong

`MUTATION_GIT_SUBCOMMANDS` has exactly five keys: `clean`, `mv`, `restore`, `rm`, `stash`. `checkout` is not among them, so no `git checkout` invocation is classified as a mutation whatever its operands are.

`rules/protected-path-discipline.md:429` names one form and calls it allowed:

> `git checkout HEAD -- rules/x.md` — fusion's own revert strategy, always allowed.

That row is true and the reason for it is good: fusion's own recovery path needs to restore a file to its committed state, and restoring `rules/x.md` to what is already in HEAD writes nothing an agent could not have obtained by not touching it.

The row is stated as a property of `git checkout HEAD --`. It is a property of `checkout` full stop. Any tree-ish works:

```
  allow  git checkout HEAD -- rules/x.md        <- documented, intended
  allow  git checkout HEAD~5 -- rules/x.md      <- undocumented
  allow  git checkout otherbranch -- rules/x.md <- undocumented
```

The second and third overwrite a protected rule file with arbitrary historical or divergent content. `agents/**`, `skills/**` and `hooks/config.json` are reachable the same way.

## The asymmetry is what makes it worth filing

The identical operation spelled with the subcommand that *is* in the table denies:

```
  DENY   git restore --source=HEAD~1 rules/x.md
  allow  git checkout HEAD~5 -- rules/x.md
```

Both write `rules/x.md` from a non-HEAD tree-ish. One is denied and one is allowed, and the difference is which spelling the agent reached for. A reader has both halves of that in the document — the deny at `:80`, the allow at `:429` — and nothing that lets them see the pair. `checkout` appears in neither `MUTATION_GIT_SUBCOMMANDS` nor the residual list, so an agent that meets the `git restore` deny and tries `git checkout` is not routing around the guard deliberately; the document gave it no reason to think the two differ.

That is precisely the failure `rules/protected-path-discipline.md` exists to prevent, stated in its own opening: an agent must never meet an unexplained deny and work around it.

## Measured

`classifyBashMutation` at HEAD `cc012fc`, shipped protected list, suite `normalize`, `env: {}`:

```
  allow  git checkout HEAD -- rules/x.md
  allow  git checkout HEAD~5 -- rules/x.md
  allow  git checkout otherbranch -- rules/x.md
  DENY   git restore --source=HEAD~1 rules/x.md
```

## Candidate directions

1. **Add `checkout` to `MUTATION_GIT_SUBCOMMANDS` and carve out the HEAD form.** Preserves the revert strategy explicitly rather than by omission. Needs a rule for what counts as "the HEAD form" (`HEAD`, and `HEAD --` with a path; not `HEAD~n`, not a branch name, not a bare `git checkout <branch>` which is the branch policy's business, not this one). The interaction with `git-branch-guard.ts`, which already handles `git checkout <branch>`, must be checked rather than assumed — two policies would then read the same command.
2. **Add `checkout` unconditionally** and let fusion's revert use `git restore --source=HEAD` or `git checkout` under an explicit human step. Simplest classifier change; costs the documented recovery path, which is load-bearing during a failed session.
3. **Document it as a residual.** One bullet naming `git checkout <treeish> -- <protected>` beside the existing `git apply` / `git am` row, and a correction at `:429` saying only the HEAD form is intended. Cheapest, honest, and leaves the route open.

Direction 1 is the one that matches what `:429` says it wants, and it is the one with a real design question in it (which tree-ishes are inert), so it wants a decision record if taken.

## Test coverage this needs

- the three `checkout` rows above, in whichever direction the decision chooses;
- `git checkout HEAD -- rules/x.md` pinned as an allow under directions 1 and 3, because it is the documented recovery path and a fix that broke it would be worse than the gap;
- `git checkout main` kept as the branch policy's case, asserting the two policies still report the permission the agent actually lacks (the pattern `rules/protected-path-discipline.md:417-419` already pins for `FUSION_ALLOW_BRANCH_SWITCH`).

## Anti-vacuity

`git checkout HEAD -- rules/x.md` must stay an allow and be asserted as one in the same test, or a blanket addition of `checkout` to the table passes the suite while breaking the revert path silently.

## Origin

Found by the reconciler's documentation audit during the closing pass of session `history/260803-1737-orchestrator-session.md`, while verifying that each row of the document's "what stays allowed" section is true as a general claim and not only for the spelling it prints.
