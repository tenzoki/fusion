# `git -C DIR` supplies a directory the model skips, so a relative operand resolves off the protected list and allows

---

**Severity:** High
**Domain:** code (security control)
**Filed by:** reconciler, closing pass of session `260803-1737-orchestrator-session.md` (Circle Turns 4 to 8)
**Affects:** `hooks/lib/bash-mutation-guard.ts:1081-1096` (`resolveGit`); `rules/protected-path-discipline.md` and `README-hooks.md`, whose residual lists do not name it
**Kind:** PRE-EXISTING, and older than this Circle. `resolveGit` has skipped `-C` since it was written. Not caused by any commit in `6c447eb..cc012fc`.
**Cross-references:**
`260804-0836_*_…` and `260804-0837_*_…` (the same family — the model believes the shell is somewhere it is not — but a different mechanism and a different fix; see `## Why this is not those two`),
`hooks/lib/__tests__/bash-mutation-guard.test.ts:196` (the only `-C` case in the suite, which pins the opposite direction),
`260801-1905-coderev-guard-bash-inspection.md:53` (the only prior mention anywhere, a coverage list).

---

## What is wrong

`resolveGit` walks `git`'s own flags to find the subcommand. To do that it must skip `-C` **and its value**, which it does:

```ts
// hooks/lib/bash-mutation-guard.ts:1084-1087
if (t === "-C" || t === "-c") {
  i += 2;
  continue;
}
```

`--git-dir` and `--work-tree` are skipped the same way at `:1088-1091`. The value is stepped over and **never recorded**. So the subcommand's operands are then resolved against the model's current working directory, which is the project root, and a relative operand that names a file inside a protected directory resolves to a path outside it.

`git -C rules rm x.md` deletes `rules/x.md`. The guard resolves the operand as `x.md`, matches it against the protected list, finds nothing, and allows.

This is the class the Circle has spent eight Turns on — the classifier asserting a working directory the shell is not standing in. It is the eighth instance, and it differs from the other seven in the direction of the error. Every `cd` / `pushd` / `popd` form the module cannot model now **degrades and denies** (`applyDirEffect` yields the unknown-directory state). `git -C` does not degrade. It resolves confidently against the wrong directory and **fails open**.

The document itself names this exact failure mode, at `rules/protected-path-discipline.md:305-306`: *"Asserting a move you cannot prove is **not** a safe over-deny: it relocates every later relative operand, which denies when it lands on the protected list and *allows* when it lands off it."* That sentence is about `cd`. It describes `git -C` and nothing in the module applies it there.

## Measured

`classifyBashMutation` at HEAD `cc012fc`, shipped `hooks/config.json` protected list, the suite's own `normalize` shim, `env: {}`. Re-run by the reconciler rather than taken from the audit that surfaced it.

```
  allow  git -C rules rm x.md
  allow  git -C rules clean -fdx
  allow  git -C rules mv a.md b.md
  allow  git -C rules restore --source=HEAD~1 x.md
  allow  git -C agents rm coder.md
  allow  git --work-tree=rules rm x.md
  allow  git --git-dir=.git --work-tree=rules rm x.md
```

Controls, which prove the greps discriminate and that the subcommands themselves are wired:

```
  DENY   git rm rules/x.md
  DENY   git -C /repo mv rules/x.md docs/
  DENY   git clean -fdx rules
```

The middle control is the one already in the suite (`bash-mutation-guard.test.ts:196`). It pins the case where the protected path is the **operand** and `-C` is incidental. The case where `-C` **supplies** the protected directory has no row anywhere.

`git -C agents rm coder.md` is the sharpest row: it reaches `agents/**`, which no flag exempts and which the Circle's own Directive lists as staying blocked.

## Why this is not `260804-0836_*_a-cd-skipped-by-an-earlier-double-pipe-is-still-modelled-as-made-so-the-and-guarantee-leaks.md` or `260804-0837_*_a-cd-inside-a-pipeline-runs-in-a-subshell-in-bash-and-the-model-follows-it-anyway.md`

Those two are reachability defects: the `cd` is in the command text, the model sees it, applies it, and is wrong about whether the shell ever ran it. The fix is to consult the joiner for the moving segment, and one decision (`260804-0947_*_`) closes both.

This one is not about reachability. The directory is in the command text and the model **never looks at it**. `git -C` runs unconditionally; there is no joiner question. Answering `260804-0947_*_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md` in any of its options leaves every row above allowing. It needs its own change in `resolveGit`, and the three candidate directions below are unrelated to that decision's options.

Keeping them separate matters because `260804-0947_*_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md` is currently described as the release blocker for any claim about the boundary. It is not sufficient for that claim while this is open.

## Candidate directions

1. **Give up, like every other unmodelled directory change.** `resolveGit` returns a marker that makes the whole invocation resolve against the unknown-directory state, so every relative operand denies fail-closed. Consistent with `applyDirEffect`'s stance and with the module's own stated rule that an unprovable directory is a deny. Cost: `git -C build clean -fdx` and similar ordinary work start denying. Unmeasured.
2. **Model it.** Record the `-C` value as the invocation's base directory when it is a literal, and resolve the subcommand's operands against it; give up when it is not literal. More precise, and it is the same shape as the `cd` allow-list the Circle already built. Larger, and `--work-tree` / `--git-dir` interact in ways worth checking rather than assuming.
3. **Document it as a residual and do nothing.** Cheapest, and defensible only if the cost of 1 or 2 turns out high — but it puts a no-flag route to `agents/**` and `rules/**` in the accepted column, which is a weaker position than this Circle has held anywhere else.

Direction 1 or 2 is a design choice with a measurable cost on both sides and wants a decision record, the way `260803-2238_*_the-directory-model-assumes-every-cd-succeeds-so-a-cd-to-a-nonexistent-directory-is-a-one-segment-bypass.md` and `260803-1835` each got one before code moved. That has been this Circle's rule and it has worked.

## Test coverage this needs

`bash-mutation-guard.test.ts` has one `-C` row and it pins the other direction, so a fix cannot be distinguished from a coincidence today. Needed:

- each of the seven rows above as a deny (or as a modelled deny under direction 2);
- `git -C build clean -fdx` and `git -C /tmp rm junk` as the cost controls, whichever way they land;
- the existing `git -C /repo mv rules/x.md docs/` row kept, since it must not change;
- `git -C rules rm x.md` measured through the real guard subprocess with the real-shell effect asserted, because a verdict alone has been wrong about this family before.

## Anti-vacuity

All seven rows allow today, so they cannot pass vacuously. When they close, `git -C build clean -fdx` must be pinned in whichever direction the decision chooses — a test that only pinned the protected rows would not distinguish a fix from a blanket give-up on every `git` invocation carrying a flag.

## Origin

Found by the reconciler's documentation audit during the closing pass of session `260803-1737-orchestrator-session.md`, while checking `rules/protected-path-discipline.md`'s residual list for residuals that are real at HEAD and not listed. It is not in that list, not in `README-hooks.md`'s, and not in the tracker.

---

Resolved: Turn 10, task T10-1 — `hooks/lib/bash-mutation-guard.ts` (`resolveGit`, `gitRedirectedBases`, `classifyWords`). **Neither direction 1 nor direction 2 as filed**: both were built and measured against `HEAD` over one generated cross-product of 811,210 commands × 2 environments, and direction 2 **newly allowed 21,420 evaluations** — `git -C /repo mv rules/x.md docs/` and its family, including this suite's own row at `bash-mutation-guard.test.ts:196`. Direction 1 held constraint 1 but denied 173,610 commands that ordinary work needs (`git -C build rm out.js`, `git -C build clean -fdx`, `git -C /tmp rm junk`). What shipped is a fourth option argued and costed in `260804-1323_*_…`: a **union** — an operand is checked against every directory the guard can attribute to the invocation, so a directory fact may only ever add reach, never remove it. Measured: 138,860 newly deny, **0 newly allow**.

All seven rows this issue lists now deny. Each was measured through the real guard subprocess and separately in a real shell, one fresh repository per assertion, bash and zsh, git 2.49.0 (`guard-bash-integration.test.ts`, "a git directory flag reaches the protected list, and is denied"). The cost control this issue asked for is pinned in both suites: `git -C build clean -fdx` allows AND is asserted to delete `build/untracked.js` while leaving `rules/untracked.md` alone.

Two facts the issue did not name were found in the same eight lines and are recorded rather than folded in silently: `--work-tree` relocates pathspec resolution where `--git-dir` does not (measured — `git --work-tree=rules clean -fdx` deleted `rules/x.md`), and an unrecognised global option swallowed the subcommand entirely (`git --namespace foo rm rules/x.md`, closed with this and filed as `260804-1333_*_…`). The environment spelling of the same relocation stays open and is now on both residual lists: `260804-1332_*_…`.
