# `LC_ALL=C` sits on the leaf git invocation, not on the test file's shared `git()` helper

---

**Severity:** Low — nothing is wrong today; the next prose assertion added through the helper reintroduces the same failure.
**Domain:** code
**Filed by:** coderev, reviewing `7342fdd` (`260813-1051-coderev-plane-curl-response-via-temp-file.md`)
**Affects:** `hooks/lib/__tests__/circle-stash-git-exclusion.test.ts:52` (the helper), `:205-212` (where the fix landed)
**Cross-references:** `260813-0828_*_three-tests-fail-at-head-in-two-files-and-no-open-record-names-them.md`

---

## The observation

The locale fix is correct and it is placed where the failure was:

```ts
{ cwd: p.projectRoot, encoding: "utf-8", env: { ...process.env, LC_ALL: "C" } },
```

`spawnSync` replaces the child environment wholesale when `env` is given, so the spread is
required and nothing is dropped. `LC_ALL=C` also outranks `LANGUAGE`, which GNU gettext
otherwise lets override `LC_ALL` — verified on this machine against git 2.49.0:

```
$ LANG=de_DE.UTF-8 git checkout -b
Fehler: switch `b' erfordert einen Wert.
$ LC_ALL=C LANGUAGE=de LANG=de_DE.UTF-8 git checkout -b
error: switch `b' requires a value
```

The same file's shared helper is untouched:

```ts
const git = (cwd: string, ...args: string[]) => {
  const r = spawnSync("git", args, { cwd, encoding: "utf-8" });   // :52
```

That is harmless now — every assertion routed through it reads machine-shaped output
(`stash@{0}`, diff bodies, file contents), not prose. It is harmless only for as long as that
stays true, and the invocation that just broke was in the same file.

## Suggested remedy

Put `env: { ...process.env, LC_ALL: "C" }` on the helper at `:52` as well, and keep it on the
leaf invocation (which deliberately bypasses the helper to drive the naive command). Two lines,
and the file stops depending on nobody ever asserting on git's wording through the helper.

Whether the same should apply to the other test files that spawn git (`fusion-count-sources`,
`record-counts-measurement`, `review-coverage`, `staging-drift`, `state-drift`,
`queue-ground-producer`, `queue-retirement-empty-key`, `guard-bash-integration`) is a separate
question — a sweep at the time of the fix found no prose assertion on git output in any of
them, and this review did not re-run that sweep exhaustively.

---
Resolved: moot, not fixed. The helper at `hooks/lib/__tests__/circle-stash-git-exclusion.test.ts:52` went with the whole file in `5d29b6d` (Circle `260815-0007-...`, step 6, which removed the stash and pop skill pair). The closing paragraph's separate question about the other git-spawning test files is unaffected and is not carried by this record; three of the eight it named (`state-drift`, `queue-ground-producer`, `queue-retirement-empty-key`) have since been deleted as well. Verified at HEAD `9306f0a` by the reconciliation pass of 260815-1913.
