One git override lifts the deny for the OTHER git class, because the classifier stops scanning at the first deny-case segment

---

`classifyGitCommand` (`hooks/lib/git-branch-guard.ts:309-336`) loops over the command's
segments and **returns on the first segment that classifies as a deny-case**. When the
matching env override is active for that segment, it returns `{deny: false, overrideUsed:
true}` immediately — so every later segment goes unclassified, including a deny-case of the
*other* class, which the user never authorised.

Verified by probe against the source (`tsx hooks/guard.ts`, temp cwd, no workbench):

```
FUSION_ALLOW_WORKTREE=1       git worktree add ../wt f && git switch main       -> {}   ALLOWED
FUSION_ALLOW_BRANCH_SWITCH=1  git switch main && git worktree add ../wt f       -> {}   ALLOWED
(no override)                 git worktree add ../wt f && git switch main       -> block
```

The two overrides are documented as independent, least-privilege grants
(`git-branch-guard.ts:291`, `rules/git-branch-discipline.md:39-41`). They are not: either one
grants both classes for the rest of the command.

---

**Context.**

Found while closing the adjacent override hole in `guard.ts` (plan step 6, Circle
`260801-1244-guard-bash-inspection`). That fix makes the *protected-path* check run on the
override route, so an override no longer waives the mutation policy. This issue is the same
failure one layer down and is **not** covered by it: the leak here is git-class to git-class,
entirely inside the classifier, and the hook cannot see it — the verdict it receives already
says "allowed".

Not introduced by this Circle. The early return has been there since the override mechanism
was added.

**Exposure.** Requires an override to be set, which is a deliberate user act, so this is not a
zero-consent bypass. But it defeats the least-privilege property the two-variable design
exists for: a user who allows a worktree add for one task also silently allows every branch
switch in any compound command for the rest of the session.

**Where the fix belongs.** `classifyGitCommand`, one file, no hook change:

Keep scanning after an override-allowed segment instead of returning. Remember that an
override was used (kind + segment) and only return the override verdict once the whole segment
list is exhausted with no un-overridden deny. A deny found later wins over an earlier
override — the deny is the more restrictive verdict and the one the user did not waive.

Two details the fix must settle:

1. **Which segment the override note names** when several segments were overridden. Simplest
   honest answer: the first, as today.
2. **Whether both classes can be overridden in one command** (`FUSION_ALLOW_WORKTREE=1
   FUSION_ALLOW_BRANCH_SWITCH=1 git worktree add … && git switch main`). With per-segment
   scanning this allows, and should — both permissions were granted explicitly.

The 84-case suite in `hooks/lib/__tests__/git-branch-guard.test.ts` is single-verdict-shaped
and will need cases for the multi-segment mixed-class forms above.

**Out of scope for step 6.** Step 6's task fixed `guard.ts` and its wiring test only, and
explicitly ruled `git-branch-guard.ts` out of bounds. Filed rather than fixed.

---
Resolved: `classifyGitCommand` no longer returns at the first deny-case segment. An
overridden segment is remembered and the walk continues, so a later un-overridden
deny-case of the other class still denies; the override verdict is returned only once
the whole segment list is exhausted. Both classes overridden in one command allows —
each op was individually authorised. The verdict SHAPE is unchanged: `overrideUsed` is
still set only on an allow return, so `guard.ts` never records an override-used note for
a call that was blocked. Where several segments were overridden, `overrideSegment` names
the first, as before. `hooks/lib/git-branch-guard.ts` only; no hook change.
Pinned by the describe block "one override never waives the other class" in
`hooks/lib/__tests__/git-branch-guard.test.ts` (7 cases, both orders, both single and
combined overrides).
