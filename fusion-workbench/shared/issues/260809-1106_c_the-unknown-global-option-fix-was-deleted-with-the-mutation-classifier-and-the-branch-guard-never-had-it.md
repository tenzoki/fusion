# The unknown-global-option fix was deleted with the mutation classifier, and the branch guard never had it

---

**Severity:** High — a known, previously closed defect class is live again in the one classifier that survived
**Domain:** code (security control)
**Filed by:** analyst, during the guard-enforced-policies analysis
**Affects:** `hooks/lib/git-branch-guard.ts` (`classifySegment`, the global-option walk at `:179-202`)
**Cross-references:**
`circles/260801-1244-guard-rules-write/issues/260804-1333_c_an-unrecognised-git-global-option-swallows-the-subcommand-and-the-invocation-reads-as-an-unrecognised-program.md` (closed; the same defect, found and fixed in `bash-mutation-guard.ts`),
`circles/260801-1244-guard-rules-write/issues/260804-1344_c_the-git-option-walk-stops-at-an-unknown-options-value-so-a-c-behind-it-is-invisible.md` (closed; the follow-on in the same walk),
`fusion-workbench/shared/analyses/260809-1103-guard-enforced-policies.md` §Findings 2b-2

---

## What is wrong

`classifySegment` walks git's global options looking for the subcommand. It consumes the value of the four options it knows (`-C`, `-c`, `--git-dir`, `--work-tree`, at `:182-196`) and treats every other `-`-prefixed token as valueless (`:197-200`). A global option that does take a separated value therefore leaves its value standing in subcommand position, where it matches neither `switch` nor `worktree` nor `checkout`, and the whole call allows.

This is verbatim the defect recorded and closed on 2026-08-04 as `260804-1333`, severity High, marked there as pre-existing and structural. That record's fix was applied to `resolveGit` in `hooks/lib/bash-mutation-guard.ts`. When the mutation classifier was retired in v6.0.0, the module went and the fix went with it. The git branch classifier has the identical eight lines and never received the correction.

`260804-1333` says it plainly: "`--namespace` is the instance git 2.49 happens to ship. It is not the defect. Every option the table does not carry has this shape, including options git has not shipped yet, which is why it was not closed by adding a row."

## Measured

Classifier, work-tree build:

```
allow   git --namespace ns switch main
allow   git --attr-source HEAD switch main
allow   git --config-env x=Y switch main
DENY    git --no-pager switch main        (control: a valueless unknown option)
DENY    git --literal-pathspecs switch main   (control)
DENY    git switch main                   (control)
```

Real git 2.49.0, fresh repository with branches `t1`, `other`:

```
$ git --namespace ns switch other
Switched to branch 'other'

$ git --attr-source HEAD switch t1
Switched to branch 't1'
```

Two options, two real branch switches, both allowed by the guard.

## Suggested direction

Take the fix that already exists rather than inventing a second one. `260804-1333` closed this structurally: when the word in subcommand position matches no known subcommand **and** an unrecognised option stands immediately in front of it, try the next word as a subcommand too. A second candidate can only add a match, so it can only add a deny.

`260804-1344` then found the residual in that same fix: it tries two adjacent words but does not *resume* the option walk, so a `-C` standing behind an unknown option's value stays invisible. Resuming the walk is the shape that covers both, and it is what the branch guard should receive — the sibling record's remedy, not its first attempt.

The stated cost carries over unchanged: a false deny of the shape `git <unknown-option> <non-subcommand> switch`, which is not a shape anyone writes on purpose.

Worth recording separately, because it is the more general lesson: a fix applied to one of two modules that shared a defect was lost when the other module was deleted. Nothing in the retirement checked whether the surviving classifier carried the same eight lines.

## Acceptance criteria

- [x] `git --namespace ns switch main` and `git --attr-source HEAD switch main` both deny.
- [x] `git --namespace foo -C sub switch main` denies (the `260804-1344` residual, resumed walk).
- [x] `git diff` and `git commit -m switch` still allow — the walk stops at the first non-flag word when no unrecognised option precedes it.
- [x] The cost is stated as a rule with an open example set, matching the wording `260804-1333` settled on, in `rules/git-branch-discipline.md`.
- [x] A test names the sibling record, so a future retirement of one classifier surfaces the shared fix.

---
Resolved: `9716ee5` — the global-option walk in `classifySegment` now resumes
rather than stopping: a bare word matching no subcommand row, with an
unrecognised option standing in front of it, is that option's separated value
and the walk continues from the next index, recording `-C` and `--work-tree` on
the way; with no unrecognised option in front it is git's real subcommand and
the walk stops there, which keeps the walk out of the subcommand's own
arguments. The remedy taken is `260804-1344`'s resumed walk, not `260804-1333`'s
first two-adjacent-candidate attempt. Pinned by the describe block "an
unrecognised global option no longer hides the subcommand (260804-1333,
260804-1344)" in `hooks/lib/__tests__/git-branch-guard.test.ts` — the test name
carries the sibling records, which is this issue's own acceptance criterion —
plus the real-branch-switch rows in `guard-bash-integration.test.ts` in bash and
zsh. The no-new-allow direction is measured, not argued: the corpus in
`fixtures/git-corpus-451a07e.json` was recorded against the unmodified
classifier at `451a07e`, and no verdict that denied there allows now. Step 6 of
`shared/planning/260809-1229_*_plan-five-severe-guard-defects.md` carried the
cost into `rules/git-branch-discipline.md` as a rule with an open example set,
in the wording `260804-1333` settled on.
