# Code review — Turn 10 (`613d6fd`), plus the two commits that never got one (`048f3db`, `cc012fc`)

**Sender:** coderev
**Circle:** `260801-1244-guard-rules-write`
**Reviewed:** `d2962f3..613d6fd` excluding `fusion-workbench/`; and, as Job 2, `048f3db` and `cc012fc` as designs
**Suite at review time:** `npx vitest run` — 24 files, **1299 passed**, 0 failed. `hooks/dist/` was NOT rebuilt (`npx vitest run`, never `npm test`); `git status` on `hooks/` is unchanged by this review.
**Method:** `hooks/lib/__tests__/helpers/guard-harness.ts`, one fresh project per verdict, a second fresh project (and, for git rows, a fresh two-commit repository) per effect, bash 3.2 and zsh 5.9, git 2.49.0. No deny read `[HALTED]`. The measurement file was written under `hooks/lib/__tests__/`, run, and deleted; nothing else under `hooks/` was touched.

---

## Summary

The union rule is sound and the structural claim behind it holds: a candidate directory can
only add a resolution, so it can only add a deny, and nothing in the module treats a target
list as a single target incorrectly. What does not hold is the *reach* of two of the
commit's own closure claims. `git --namespace foo -C rules rm x.md` allows and deletes the
rule in both shells, so the class `260804-1333_*_an-unrecognised-git-global-option-swallows-the-subcommand-and-the-invocation-reads-as-an-unrecognised-program.md` says it closed structurally is still open one
word further along; and `git checkout HEAD~1 -- .` allows and overwrites every protected
file, so the `checkout` row `260804-1026_*_git-checkout-treeish-overwrites-a-protected-path-and-is-in-neither-the-verb-table-nor-the-residual-list.md` was closed by has a root-pathspec hole of exactly
the kind the same commit fixed for `git clean`. Two fail-open routes into `rules/**` and
`agents/**` remain, both measured.

Job 2 found no defect in behaviour. `048f3db` and `cc012fc` are good work; three of their
recorded claims over-reach, and one of them (the cost rule's question 1) was silently
falsified by `613d6fd` two commits later.

**Verdict, Job 1 — `613d6fd`: not clean. The design call is right; the closure claims are
not.** The union is the correct answer to `260804-1024_*_git-c-supplies-a-directory-the-model-skips-so-a-relative-operand-resolves-off-the-protected-list.md` and it is argued honestly. Two High
findings sit inside the same eight lines the commit was working in.

**Verdict, Job 2 — `048f3db` and `cc012fc`: sound as designs, with three narrowed claims.**
No behavioural defect found in either. The `DirStack` sum type does close the hole it was
built for; it does not make the invariant compiler-checked, and the docstring says it does.
The cost rule is genuinely a rule and not an enumeration in prose clothing — but it is not
predictive, because two of its four questions are individually false. `048f3db`'s
"names it directly" condition is the same *shape* as `runsBuiltins` with the failure
direction inverted, and no counterexample was found; the shape does reappear untouched one
table down, in `DIR_BUILTINS`.

---

## Totals

| Severity | Count | Records |
|---|---|---|
| Critical | 0 | — |
| High | 2 | `260804-1344_*_the-git-option-walk-stops-at-an-unknown-options-value-so-a-c-behind-it-is-invisible.md`, `260804-1345_*_git-checkout-treeish-dash-dash-dot-overwrites-the-whole-protected-list-and-allows.md` |
| Medium | 4 | `260804-1346_*_git-clean-fdx-at-the-project-root-is-still-a-residual-and-its-residual-entry-was-deleted.md`, `260804-1347_*_the-git-directory-fail-closed-deny-tells-the-agent-to-drop-a-cd-that-is-not-in-the-command.md`, `260804-1348_*_the-two-spellings-of-the-revert-strategy-still-disagree-at-head-and-checkouts-second-cost-is-unreachable.md`, `260804-1349` |
| Low | 2 | `260804-1350_*_the-dirstack-docstring-claims-the-compiler-enforces-a-depth-invariant-it-does-not-enforce.md`, `260804-1351_*_dir-builtins-carries-a-shell-dependent-fact-about-chdir-justified-by-the-wrong-reason.md` |

---

## Findings by theme

### Theme 1 — two fail-open routes remain, both in the code this commit edited

**`260804-1344_*_the-git-option-walk-stops-at-an-unknown-options-value-so-a-c-behind-it-is-invisible.md` (High) — the git option walk stops at an unrecognised option's VALUE.**
`resolveGit` breaks on the first non-flag word (`bash-mutation-guard.ts:1312`). `613d6fd`'s
fix widens the *candidate list* to two adjacent indices (`:1317`); it does not resume the
option walk. So every global option standing behind an unrecognised option's value is
invisible — including `-C` and `--work-tree`, the two facts this commit added.

```
guard   bash   zsh    command
ALLOW   GONE   GONE   git --namespace foo -C rules rm x.md
ALLOW   GONE   GONE   git --namespace foo -C agents rm coder.md
ALLOW   GONE   GONE   git --namespace foo --work-tree=rules clean -fdx

block   GONE   GONE   git -C rules rm x.md                      (control)
block   GONE   GONE   git --literal-pathspecs -C rules rm x.md  (control: no value)
block   GONE   GONE   git --namespace foo rm rules/x.md         (260804-1333's own row)
```

The discriminator is exactly whether the unrecognised option takes a **separated value**.
`260804-1333_*_an-unrecognised-git-global-option-swallows-the-subcommand-and-the-invocation-reads-as-an-unrecognised-program.md` is correctly closed for its own instance and must not be reopened; what is
wrong is the sentence around it — *"Every option the table does not carry has this shape"* —
because the shape is "the walk terminates on a word that is not the subcommand", not "the
value lands in subcommand position". The recommended fix resumes the walk rather than adding
a third candidate index, which keeps the add-only property intact.

**`260804-1345_*_git-checkout-treeish-dash-dash-dot-overwrites-the-whole-protected-list-and-allows.md` (High) — `git checkout <treeish> -- .` overwrites the whole protected list.**
`gitCheckoutWrites` returns `["."]`, and `ancestorOfProtected` excludes the project root on
purpose (`:1562`) because `cp x .` must stay allowed. That exclusion is right for verbs that
write the named entry and wrong for verbs that write *through* it.

```
guard   bash      zsh       command                            watch
ALLOW   CHANGED   CHANGED   git checkout HEAD~1 -- .           rules/x.md
ALLOW   CHANGED   CHANGED   git checkout HEAD~1 -- ./          rules/x.md
ALLOW   CHANGED   CHANGED   git restore --source=HEAD~1 .      rules/x.md   (pre-existing sibling)

block   CHANGED   CHANGED   git checkout HEAD~1 -- rules       rules/x.md   (control)
ALLOW   UNCHANGED UNCHANGED git checkout HEAD -- .             rules/x.md   (correct)
```

This is the same defect `613d6fd` fixed for `clean`, approached from the other side: `clean`
did not spell its `.` and the commit supplied it; `checkout` and `restore` spell it and the
ancestor check throws it away. The recommended fix is one `VerbSpec` field
(`writesThrough`) on the three rows that need it, rather than a fourth special case.

### Theme 2 — a residual that was deleted instead of narrowed

**`260804-1346_*_git-clean-fdx-at-the-project-root-is-still-a-residual-and-its-residual-entry-was-deleted.md` (Medium).** The old residual entry for `git clean -fdx` with no path operand
was wrong for `cd rules && git clean -fdx`, and `613d6fd` fixed that. But it removed the
entry rather than narrowing it, and replaced it with an affirmative line at
`rules/protected-path-discipline.md:129-130` presenting the root case as a cost control.
Measured, `git clean -fdx` and `git clean -fdx .` at the project root still delete untracked
files under `rules/**` and allow. The reach is bounded (untracked files only), and the
workflow it bites is precisely this Circle's: a rule file written under
`FUSION_ALLOW_RULES_WRITE` and not yet committed.

Note the explicit spelling takes a different code path to the same allow: `git clean -fdx .`
carries a positional, so `gitCleanWrites` never supplies its implicit one.

### Theme 3 — the deny reason, which is the control's only user interface

**`260804-1347_*_the-git-directory-fail-closed-deny-tells-the-agent-to-drop-a-cd-that-is-not-in-the-command.md` (Medium).** The union added a fourth source of `CWD_UNKNOWN` (`stepDir`,
`:1666`) and gave it no `CwdUnknownCause`, so it falls through to `unknownCwdReason`:

```
$ git -C $D rm build/out.js
block — "An earlier `cd` in this command moved somewhere only known at run time … drop the
`cd` and write the path from the project root."
```

There is no `cd`. This is exactly the failure `CwdUnknownCause` was introduced to prevent —
its own docstring says both members "earn their place by being invisible in the place a
reader would look". `git --work-tree=$W clean -fdx` compounds it by naming `` `.` `` as the
written token, which the command also does not contain. Both denies are correct; only the
explanation is wrong, and this Circle's stated failure mode is an agent that meets an
unexplained deny and works around it.

### Theme 4 — claims that do not survive measurement

**`260804-1348_*_the-two-spellings-of-the-revert-strategy-still-disagree-at-head-and-checkouts-second-cost-is-unreachable.md` (Medium) — "Now they agree" is false at `HEAD`.**

```
ALLOW   git checkout HEAD -- rules/x.md
block   git restore --source=HEAD rules/x.md
block   git restore --source HEAD rules/x.md
```

Same operation, two spellings, opposite verdicts — which is `260804-1026_*_git-checkout-treeish-overwrites-a-protected-path-and-is-in-neither-the-verb-table-nor-the-residual-list.md`'s own complaint,
surviving at the one spelling the revert-strategy promise is about. There is an honest
architectural cause (`mutatesOnlyWhen` receives the flag token and never sees a separated
flag's value), and it should be written down instead of the claim that the two agree. The
same record carries a second point: the `checkout` row's documented "without `--`" cost
(`git checkout rules/a.md rules/b.md`) is unreachable through the hook — the **branch**
policy blocks it first, with the branch reason.

**`260804-1349` (Medium) — the cost rule's question 1 is now false.**
`rules/protected-path-discipline.md:240` says *"Does it contain a directory builtin at all?
No → this rule cannot touch it, whatever its joiners are."* At `613d6fd`,
`git -C $D rm build/out.js` and `git --work-tree=$W clean -fdx` have no directory builtin, no
joiner, and deny with this rule's own reason. This is the **third** clause of the same
four-question block to be falsified — question 3 by `260804-1025_*_the-decision-procedure-tells-an-agent-the-model-stays-exact-for-the-two-commands-that-delete-a-rule-file.md` / `260804-1223_*_260804-1025s-reproduction-is-stale-but-its-clause-still-overclaims-here-are-the-commands-that-replace-it.md`, the count
by `260804-1220_*_the-illustration-block-still-points-at-three-questions-in-a-procedure-that-now-has-four.md`, question 1 here. All four are one paragraph and should be one edit.

### Theme 5 — the two Job-2 design questions, answered

**`260804-1350_*_the-dirstack-docstring-claims-the-compiler-enforces-a-depth-invariant-it-does-not-enforce.md` (Low) — the `DirStack` sum type buys one of the two facts the claim needs.**
The compiler proves a give-up is total: the `unknown` arm has no `entries`, so the
zeroed-but-still-N-deep value of `260803-2237_*_unmodelled-zeroes-the-stack-values-but-not-its-depth-so-an-absolute-cd-re-proves-a-shifted-stack.md` is not writable and `popd` cannot read the
model's emptiness as bash's. It does **not** prove that a `known` stack's depth tracks bash's
— that still rests on reaching `entries.push` only where bash pushes (`:2510`, `:2527`,
`:2540`), which is a reachability argument, and reachability is what was wrong in *both*
prior depth defects. So: the invalid state that produced the bug is genuinely unrepresentable;
the invariant is not compiler-enforced, and the docstring's "the compiler enforces what the
previous wording could only ask a reader to check" should be narrowed to the half it earns.

**`260804-1351_*_dir-builtins-carries-a-shell-dependent-fact-about-chdir-justified-by-the-wrong-reason.md` (Low) — the `runsBuiltins` shape does reappear, one table down.**
`reachesBuiltin`'s true branch (no wrapper hop, no `/`) is still a positive claim about shell
behaviour read off segment text, so structurally it is the same kind of assertion. Two things
make it materially safer and no counterexample was found: its false branch is a total give-up
that can only deny, and its true branch was measured across `\cd`, `'cd'`, `"cd"` and
`/usr/bin/cd` in both shells. The shape that *is* untreated is `DIR_BUILTINS`, whose comment
says `chdir` "costs one set entry and no program by that name does anything else". Measured:
`chdir` is command-not-found in bash (127) and **is a builtin in zsh**, the shell the Bash
tool runs.

```
guard   bash      zsh    command
block   present   GONE   chdir rules && rm x.md
ALLOW   UNCHANGED UNCHANGED  chdir /tmp && rm rules/x.md
```

The row is load-bearing for zsh, not free, and the third row is safe by accident of the
joiner rules rather than by design. Verdicts are right in both shells today; the recorded
reason is not the reason.

**Is the cost rule predictive?** It is a rule and not an enumeration — the three (now four)
questions do decide most commands, and the `pushd … ; popd` and `cd hooks; rm /tmp/x` rows
show the "unknown, not denied" distinction really is derivable. But the promise at `:216`
("so you can predict a case this file does not list") is not met: question 1 is false for the
git directory flags (`260804-1349`) and question 3 is false for `cd -P`, `pushd -n`, a wrapper
hop and an ambient `CDPATH` (`260804-1025_*_the-decision-procedure-tells-an-agent-the-model-stays-exact-for-the-two-commands-that-delete-a-rule-file.md` / `260804-1223_*_260804-1025s-reproduction-is-stale-but-its-clause-still-overclaims-here-are-the-commands-that-replace-it.md`, already filed and re-confirmed at
`613d6fd`). Each of those is covered in a *different* section, so the reader has to know which
section their command belongs to — which is the thing the procedure was meant to remove.

**Confirmed correct in `cc012fc`, on measurement:** the `&&`-plus-newline fix is exact and
narrow. `cd hooks &&\n npm run build &&\n rm -rf dist` allows; the downgrade still fires for a
real second operator, pinned by `shell-parse.test.ts:291-298` (`a &&\n; b`, `a &&\n| b`). The
inverted `curl -o rules/x.md` fact is now consistent across `bash-mutation-guard.ts`,
`README-hooks.md`, `rules/protected-path-discipline.md` and the suite; the only stale copies
are in `hooks/dist/`, which Plan Step 10 owns.

---

## The two carried items from Turn 10, confirmed

- **`260804-1332_*_git-work-tree-in-the-environment-relocates-the-write-and-the-classifier-reads-no-variable.md` (High, GIT_WORK_TREE) is genuinely open and correctly out of reach.**
  Measured at `613d6fd`: `GIT_WORK_TREE=rules git clean -fdx` allows and deletes
  `rules/untracked.md` in both shells. The issue's reason 3 is the load-bearing one — closing
  the direct spelling and leaving the `env …` spelling would recreate the very asymmetry
  `260804-1026_*_git-checkout-treeish-overwrites-a-protected-path-and-is-in-neither-the-verb-table-nor-the-residual-list.md` was filed about, at the moment that finding is being closed — and it is
  sound. One correction for whoever picks it up: `rules/protected-path-discipline.md`'s
  residual entry says *"the classifier resolves no variable, which is the boundary this sits
  on rather than an oversight"*, and that is loose for the direct spelling. The value `rules`
  is a **literal in the command text**; `assignsCdpath` (`:2243-2256`) already reads leading
  assignments in this module without touching `command-word.ts`. The issue itself says so
  (its reason 2), so the record is honest where it counts — the rule file is not.
- **`260804-1333_*_an-unrecognised-git-global-option-swallows-the-subcommand-and-the-invocation-reads-as-an-unrecognised-program.md` (the `--namespace` finding) is closed for its own instance and not for its
  class.** See `260804-1344_*_the-git-option-walk-stops-at-an-unknown-options-value-so-a-c-behind-it-is-invisible.md`. Do not reopen `1333`; the row it pins still passes.

---

## Cross-cutting observations

1. **Every High in this review is the same mechanical fact seen twice: a directory the
   classifier can compute and does not compare.** The option walk stops before it computes
   one (`1344`); the ancestor check refuses to compare the one it has (`1345`); the residual
   list stopped naming the one it never compares (`1346`). The union's structural property —
   a directory fact may only ever add reach — is right, and all three findings are places
   where a directory fact was available and not added.
2. **The commit's honest-cost discipline is holding, and its closure claims are not.** Every
   *cost* in `613d6fd` is stated as a rule with an open example set, and each one I tested
   held. Every *closure* claim ("closed structurally", "now they agree", "was a wrong
   residual") over-reaches. The pattern is worth naming: the Circle has taught itself to
   state costs carefully and has not applied the same discipline to the sentence that says a
   class is shut.
3. **Documentation defects in this module are security defects, and they now outnumber the
   code ones.** Four of the eight records are prose (`1346`, `1348`, `1349`, `1350`, plus
   `1351`'s comment). `rules/protected-path-discipline.md` loads into every agent's context in
   every consuming project, and its four-question block has now been falsified three times
   independently. It needs one edit that fixes the block at the level that stops it going
   stale — restating question 1 over the *causes the module enumerates* rather than over
   syntax — not a fifth question.
4. **The one testable generalisation this review would add:** a test that every reachable
   constructor of `Cwd`'s `unknown` arm has a named cause and a distinct reason string. It
   fails today for the git-directory route, and it would have caught `1347` at the moment the
   union landed.

---

## Recommended sequencing

1. **`260804-1344_*_the-git-option-walk-stops-at-an-unknown-options-value-so-a-c-behind-it-is-invisible.md` and `260804-1345_*_git-checkout-treeish-dash-dash-dot-overwrites-the-whole-protected-list-and-allows.md` together, one pass in `resolveGit` / the verb table.**
   Both fail open into `rules/**` and `agents/**`, both need the same measured-with-effect
   test shape, and the boundary sentence this Circle wants is false while either is open.
   These are release blockers for Plan Step 10.
2. **`260804-1346_*_git-clean-fdx-at-the-project-root-is-still-a-residual-and-its-residual-entry-was-deleted.md` with `1345`** if the `writesThrough` field is taken — they share the field
   and the test. Otherwise the documentation half alone, as its own small edit.
3. **`260804-1347_*_the-git-directory-fail-closed-deny-tells-the-agent-to-drop-a-cd-that-is-not-in-the-command.md`** — one constructor, one reason function, one dispatch arm. Cheap, and it
   is the thing an agent actually meets.
4. **One edit to `rules/protected-path-discipline.md`'s four-question block**, closing
   `260804-1349`, `260804-1025_*_the-decision-procedure-tells-an-agent-the-model-stays-exact-for-the-two-commands-that-delete-a-rule-file.md`, `260804-1223_*_260804-1025s-reproduction-is-stale-but-its-clause-still-overclaims-here-are-the-commands-that-replace-it.md` and `260804-1220_*_the-illustration-block-still-points-at-three-questions-in-a-procedure-that-now-has-four.md` at once. Four separate edits
   to one paragraph is how `1220` went stale.
5. **`260804-1348_*_the-two-spellings-of-the-revert-strategy-still-disagree-at-head-and-checkouts-second-cost-is-unreachable.md`** — documentation now; the `restore --source=HEAD` code half is a decision
   (it would newly ALLOW, a first for this Circle) and should not be taken inside another
   task.
6. **`260804-1350_*_the-dirstack-docstring-claims-the-compiler-enforces-a-depth-invariant-it-does-not-enforce.md` and `260804-1351_*_dir-builtins-carries-a-shell-dependent-fact-about-chdir-justified-by-the-wrong-reason.md`** — wording, with the Low tail.

Unchanged in position: **Plan Steps 6 to 8 remain the largest open item**, and they are not
below these findings — they are the other half of the Directive.
