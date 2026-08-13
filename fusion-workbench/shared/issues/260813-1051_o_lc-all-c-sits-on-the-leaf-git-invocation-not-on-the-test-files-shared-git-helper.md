# `LC_ALL=C` sits on the leaf git invocation, not on the test file's shared `git()` helper

---

**Severity:** Low — nothing is wrong today; the next prose assertion added through the helper reintroduces the same failure.
**Domain:** code
**Filed by:** coderev, reviewing `7342fdd` (`shared/reviews/260813-1051-coderev-plane-curl-response-via-temp-file.md`)
**Affects:** `hooks/lib/__tests__/circle-stash-git-exclusion.test.ts:52` (the helper), `:205-212` (where the fix landed)
**Cross-references:** `shared/issues/260813-0828_c_three-tests-fail-at-head-in-two-files-and-no-open-record-names-them.md`

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
