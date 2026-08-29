# Nothing pins the `.gitignore` `bin/` exception list against the contents of `bin/`, and the failure is a helper missing from the tarball

---

**Severity:** Medium — a silent, shipping-affecting failure whose only guard is a comment asking the author to check by hand; two lines had to be added by hand in this range alone
**Domain:** code
**Filed by:** coderev (Turn 4 review, range `b261d83..951c809`)
**Affects:** `.gitignore:20-37`, `install.sh` (the consumer of the tracked set)
**Cross-references:**
`260810-0510_*_two-of-the-queue-ground-lints-negative-controls-re-implement-the-logic-instead-of-calling-it.md`, `260811-1614_*_the-drift-checks-turn-row-is-satisfied-by-a-turn-start-alone…md` (the standing theme of gates that do not measure)

---

## What is wrong

`.gitignore:20` excludes all of `bin/` and re-includes each helper by name:

```
# gets silently dropped from the plugin distribution. New helper added?
# Add the exception line here AND verify with `git ls-files bin/`.
bin/*
!bin/monitor
!bin/fusion-rules
… 13 more
```

The comment states the consequence correctly — a helper without its line "gets silently dropped from the plugin distribution", because `install.sh` ships the git tree — and then names the guard as a manual step the author has to remember.

This range needed that step twice: `9f84254` added `!bin/fusion-source-root`, `61bd21f` added `!bin/fusion-turn-budget`. Both were remembered. **Verified at HEAD**: all 15 files in `bin/` are tracked and none is ignored, so there is no live defect.

What is missing is the measurement. The failure is invisible at author time (the file works in the work tree, `npm test` passes, the skill body calling it works locally) and surfaces only for an end user, as a `[ -x ]` guard silently taking its absent branch — which every call site now has, so the helper's absence degrades quietly instead of erroring. The `[ -x ]` convention that decision `260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md` introduced makes this defect *quieter*, not louder.

## Fix direction

One test, no new mechanism:

```ts
// every executable in bin/ is tracked by git
const listed = execFileSync("git", ["ls-files", "bin/"], …).trim().split("\n").sort();
const onDisk = readdirSync(join(pluginRoot, "bin")).sort();
expect(listed.map(p => p.slice(4))).toEqual(onDisk);
```

`git ls-files` is the right question because it answers what actually ships, rather than re-reading `.gitignore` and re-implementing its precedence rules — which is the re-implementation defect `260810-0510_*_two-of-the-queue-ground-lints-negative-controls-re-implement-the-logic-instead-of-calling-it.md` is open against. The failure message should name the missing file and the exact line to add.

The same shape covers the mirror case a `git ls-files` comparison also catches for free: a `!bin/x` exception for a file that no longer exists, which is dead and misleading.

## Acceptance criteria

- A test compares `git ls-files bin/` against `ls bin/` and fails naming the offending file and the `.gitignore` line to add or remove.
- Verified non-vacuous by deleting one `!bin/…` line and confirming the test fails with that helper named.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: No test compares `git ls-files bin/` against the directory. The twelve `!bin/` exception lines currently match the twelve helpers, which is coincidence rather than a gate: nothing catches the next helper added without its line. Marker stays open. Log: `260817-1836-reconciliation.md`.

---
Resolved: fixed — one case in `hooks/lib/__tests__/committed-dist.test.ts` compares `git ls-files bin/` against `readdirSync(bin)` and names the file and the `.gitignore` line to add or remove, shown failing on an untracked `bin/zz-untracked`; `cd hooks && npx vitest run lib/__tests__/committed-dist.test.ts`
