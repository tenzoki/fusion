# The staging-shape lint misses a directory argument that has no trailing slash

---
**Severity:** Medium
**Domain:** code
**Filed by:** coderev, review of `7785330..cac41ef` (Turn 1)
**Affects:** `hooks/lib/__tests__/queue-commit-ownership-lint.test.ts:123-137`, `:241-256`
**Cross-references:** commit `cac41ef`; `agents/orchestrator.md` Step 3b step 4; repair commit `f38f37d`

---

## The defect

`weakenedStaging()` classifies a `git add` token as a directory argument only when it **ends with a
slash**:

```ts
} else if (token.endsWith("/")) {
  bad.push(`a directory argument \`${token}\` in \`git add ${args}\``);
}
```

`git add fusion-workbench` is a directory argument and passes. Measured against the lint's own
helpers:

```
gitAddArgs("```bash\ngit add fusion-workbench\n```")  →  ["fusion-workbench"]
weakenedStaging(same)                                  →  []
```

## Why this is the assertion that matters

The file's own header calls this the load-bearing one:

> The third assertion is the one that matters most, and it is the reason this is a gate rather than
> a paragraph: **the cheapest way to make an unstaged-record report go away is to widen the staging
> command, and that trade is forbidden.**

The forbidden form is stated in `agents/orchestrator.md` Step 3b step 4 as "No `-A`, no `-u`, **no
directory argument**". A directory written without a trailing slash is the ordinary spelling — it is
how the `f38f37d` defect was written (`git add -u <directory>`), and it is what a hand would type.

## Why the negative control did not catch it

The control at `:244` is

```ts
expect(weakenedStaging(fenced("git add -u fusion-workbench"))).toHaveLength(1);
```

which passes on the `-u` token alone. The directory half is never exercised on its own, so the
control witnesses the flag rule and nothing about the directory rule. A control that asserts the
count is 1 cannot tell which of two rules produced it.

## Fix direction

The lint cannot decide from a prompt's text whether `<absolute-path>` is a file or a directory, and
should not try — but it does not have to. Every legitimate token in this repository's prompts is
either a literal placeholder (`<absolute-path>`, `<old>`, `<new>`) or a `/tmp/…` message path. Cut
it the other way: **allow-list the placeholder shapes and flag everything else**, rather than
blacklisting slash-suffixed tokens. That is decidable from the text and closes the class instead of
one spelling of it.

Whichever cut is taken, add a control that exercises the directory rule alone:

```ts
expect(weakenedStaging(fenced("git add fusion-workbench"))).toHaveLength(1);
```

---
Resolved: moot, not fixed. `weakenedStaging()` lived in `hooks/lib/__tests__/queue-commit-ownership-lint.test.ts`, one of the four queue tests deleted in `dd312eb` (Circle `260815-0007-...`, step 10). Verified at HEAD `9306f0a` by the reconciliation pass of 260815-1913: `grep -rn weakenedStaging hooks/` returns nothing, so no surviving lint carries the trailing-slash test the record was about. `agents/orchestrator.md` Step 3b's staging discipline survives with no lint behind it, which is a wider question than this record and is not carried forward by it.
