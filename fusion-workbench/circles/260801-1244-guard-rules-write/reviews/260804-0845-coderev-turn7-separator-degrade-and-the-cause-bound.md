# Turn 7 code review — the separator-conditioned degrade and the cause-shaped fail-closed bound

**Date:** 2026-08-04 08:45
**Agent:** coderev
**Circle:** `260801-1244-guard-rules-write`, Turn 7
**Scope:** `048f3db..c9c44a3`, excluding `fusion-workbench/` — 9 files, 3,855 added lines
**Suite at review time:** `npm test` — 1235 passed, 24 files, green
**Shells measured:** bash 3.2.57 and zsh 5.9. The `Bash` tool's shell in this session is
**zsh** (`SHELL=/bin/zsh`). Every row where the two disagree is reported twice.
**Method:** real guard subprocess through `helpers/guard-harness.ts`, one fresh throwaway
project per case, real-shell effect asserted wherever a verdict claims a file would be
touched, no deny read `[HALTED]`. Before/after verdicts came from `hooks/lib` at
`048f3db` materialised out of git and loaded alongside the working tree.

---

## Summary

The two changes do what they say and the "zero newly allowing" half of the claim is the
strongest measurement in this Circle so far — I could not find a single command that
allows at HEAD and denied at `048f3db`, across 222,319 generated commands. The git
classifier really did not move, and I verified that independently of the gold file.

The premise leaks. `&&` guarantees that the **and-or list to its left** returned zero,
not that the previous segment ran, and it does not reach into a pipeline. Two families
survive in which the shell stands somewhere the model does not: a `cd` skipped by an
earlier `||`, and a `cd` inside a pipeline. Both are pre-existing — allow at `048f3db`,
allow at HEAD — and both delete or overwrite files on the protected list in the real
shell, with no flag and no wrapper.

The other direction cost more than the Turn measured. A newline after `&&` is downgraded
to `newline` by the lexer, so an ordinary multi-line `&&` chain now denies with a reason
that tells the agent to do what it already did.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 4 |
| Medium | 2 |
| Low | 1 |

Two of the four Highs are pre-existing escapes; two are regressions of this commit (one
in the lexer, one in the record). Every finding was measured before it was filed.

---

## Answers to the five questions

### 1. Is the `&&` guarantee actually a guarantee? — No. It leaks twice, and both leaks are live

**The direction that does not matter.** A segment that the model reaches but the shell
skips is harmless: the guard denies a write that never happens. `set -e`, a trap, a
function body and `&& ` inside `$(…)` all fall here, and I checked each. `echo $(cd nope
&& rm rules/x.md)` allows and is correct — the subshell's `&&` is a real guarantee inside
its own scope, and the scope restore discards it afterwards.

**The direction that does.** In a flat and-or list bash evaluates left to right, so
`A || B && C` is `(A || B) && C`. Reaching `C` proves the *list* returned zero — it does
not prove `B` ran. When `B` is the `cd`, the model follows a move the shell never made.

`state.moved` (`bash-mutation-guard.ts:1990`) is set the moment a directory builtin is
*seen*, whatever brought its segment into reach; the degrade at `:2465` then only asks
about the joiner of the segment that **writes**. Nothing asks whether the `cd`'s own
segment was guaranteed to run.

Measured, real guard, real shells, one project per row:

```
  guard   bash          zsh           command
  allow   GONE          GONE          true || cd build && rm rules/x.md
  allow   OVERWRITTEN   OVERWRITTEN   true || cd build && echo pwned > rules/x.md
  allow   GONE          GONE          true || cd build && rm -rf rules
  allow   GONE          GONE          true || cd build && mv rules/x.md /tmp/
  allow   OVERWRITTEN   OVERWRITTEN   true || cd build && sed -i '' s/a/b/ rules/x.md
  allow   GONE          GONE          true || cd build && rm agents/coder.md
  allow   OVERWRITTEN   OVERWRITTEN   true || cd build && echo pwned > skills/demo/SKILL.md
  allow   GONE          GONE          mkdir -p build || cd build && rm rules/x.md
```

Three of the four protected roots, four verb families and the redirection spelling. The
discriminating control is the same command with a failing left operand — `[ -d nope ] ||
cd build && rm rules/x.md` — where the `cd` really does run and the model is right. The
guard returns the same verdict for both, because the difference is an exit status.

The second leak is the pipeline. `|` does not reach past `&&`, and a pipeline element
runs in a subshell:

```
  guard   bash          zsh        command
  allow   GONE          intact     echo hi | cd build && rm rules/x.md
  allow   OVERWRITTEN   intact     ls | cd build && echo pwned > rules/x.md
  allow   GONE          intact     ls | cd build && rm -rf agents
```

`zsh: intact` is the two shells disagreeing, not a reprieve: zsh runs the last element of
a pipeline in the current shell, so the `cd` moves it and the model happens to be right
there. bash subshells it, and bash is where the protected file is written.

Both filed: `260804-0836_*_a-cd-skipped-by-an-earlier-double-pipe-is-still-modelled-as-made-so-the-and-guarantee-leaks.md` (`||`), `260804-0837_*_a-cd-inside-a-pipeline-runs-in-a-subshell-in-bash-and-the-model-follows-it-anyway.md` (pipeline). **High**, pre-existing.

The shipped sentence that is now false as written, in every consuming project
(`rules/protected-path-discipline.md:152-158`, and again in `README-hooks.md`, the module
docstring and `ShellState.moved`'s comment):

> After `&&` it does not need to: bash will not run what follows unless the `cd` returned
> zero.

### 2. Did the git branch classifier really not move? — No, and the gold file is honest but is not why I believe it

**The provenance claim holds.** I materialised `hooks/lib` at `048f3db` out of git and ran
the **pre-change** classifier over the fixture's 98 commands × 4 override combinations:
**98/98 reproduce byte for byte**. The current classifier also reproduces 98/98. It is a
real before/after, not a fixture generated by the code it pins.

**Its inputs miss the affected paths.** Counted over the 98 rows: `&&` 13, `;` 9, newline
13, and **`||` 0, `|` 0, `&` 0**. A fixture built to pin a joiner widening contains no
`||`, no pipe and no background operator. Every row also denies or overrides in at least
one combination (0 all-allow rows), so an allow → deny drift outside the 98 is out of
reach. The describe block's docstring claims the gold covers "every command string in the
whole test suite"; it covers the filtered subset, which the history states accurately and
the test does not.

**What actually carries the weight** is the source check —
`expect(src).not.toMatch(/\bparseCommand\b/)` — and it is the right assertion, for the
reason the comment gives.

**Independent confirmation, since the gold could not give it.** 25,845 git-shaped commands
(every `git` row of my generated corpus plus a joiner sweep) × 4 override combinations
through both classifiers: **zero differences**. And both segmenters produce byte-identical
output over 222,319 commands in both quoting modes, so the `&&`/`||` pair-consumption
really did not change the segmentation.

Filed `260804-0842_*_the-git-gold-fixture-carries-no-double-pipe-pipe-or-ampersand-joiner-and-no-allow-only-row.md`, **Low** — a fixture-quality issue, not a behavioural one.

### 3. Did the fail-closed bound survive at its stated width? — Yes, exactly, and the boundary is where the record says

All six named rows survive, and so do the flag-value forms and every `$`-carrying
redirect on a program outside the table:

```
  allow   npm test > "$LOG"              allow   curl -o $OUT https://x
  allow   make $TARGET                   allow   cat report.md > ~/backup.md
  allow   echo x > "rules/$F"            allow   echo x > "$F"
  allow   npm run $SCRIPT                allow   node build.js > "$(pwd)/x.log"
  allow   echo x > $HOME/backup.md       allow   python3 -c 'x' > out.log
```

The split is exactly `viaCwd`, and it survives an unknown directory in the same command:

```
  allow   cd $D && npm test > "$LOG"       allow   cd $D && curl -o $OUT https://x
  allow   cd $D && echo x > ~/backup.md    allow   cd $D && npm test > /tmp/abs.log
  DENY    cd $D && echo x > y.md           DENY    cd $D && npm test > out.log
```

**A target that resolves only because of an earlier `cd`**, both sides of the boundary:

```
  DENY    cd rules && echo x > y.md      # resolves INTO the protected list
  allow   cd build && echo x > y.md      # resolves outside it
  DENY    cd build; echo x > y.md        # same tokens, directory now unproven
  allow   cd build && echo x > "$F"      # same directory, token unreadable
```

The two rows the record calls "the whole change" behave as claimed and are pinned
together.

One factual error sits inside this half, and it is load-bearing — see question 5.

### 4. Is the cost really 18 denying and 0 allowing? — The 0 is solid. The 18 is a property of the corpus, not of the change

**Zero newly allowing, and I looked hard.** A generated cross-product of **222,319**
commands (16 heads × 8 joiners × 12 directory builtins × 8 joiners × 19 writes, plus
`if` / `while` / brace-group / subshell / newline / backslash-continuation shapes) run
through both classifiers: **0 newly allowing**, 0 segmentation differences, 0 git
differences. Structurally that is what the types promise — the degrade can only make the
directory unknown, and unknown only denies — and the measurement agrees.

**The 18 is corpus-bound and the corpus is derived from the tests.** Same generated
corpus: **78,986 newly deny.** That number is inflated by the generator's weighting, so
here is the honest version — a curated 30-row corpus of ordinary agent work, written
without looking at either cost table:

```
  10 of 30 newly deny, including:
  allow -> DENY   cd hooks &&\n  npm run build &&\n  rm -rf dist
  allow -> DENY   cd hooks; npm test > out.log
  allow -> DENY   cd hooks; npm ci > install.log 2>&1
  allow -> DENY   if cd hooks; then rm -rf dist; fi
  allow -> DENY   while cd build; do rm out.js; break; done
  allow -> DENY   cd hooks && npx tsc | tee typecheck.log
```

Three families are in **neither** shipped cost table:

1. **A newline after `&&`.** The lexer downgrades a pending `&&` to `newline`
   (`shell-parse.ts:662-669`). Bash's grammar is `and_or : and_or AND_AND newline_list
   pipeline` — a newline after `&&` is part of the operator, and I verified in both shells
   that `cd build &&\nrm out.js` runs as one and-or list and deletes `build/out.js`. The
   downgrade also applies **only** to `&&`; `||` survives the identical path untouched.
   The resulting deny reads *"Join the `cd` to what follows it with `&&`"* — which the
   agent already did. That is the unfollowable deny `rules/protected-path-discipline.md`
   exists to prevent, on one of the most common shapes an agent writes.
   Filed `260804-0838_*_a-newline-after-and-is-downgraded-to-newline-so-a-multi-line-and-chain-denies-with-an-unactionable-reason.md`, **High**, a regression of this commit.

2. **A conditional body or a pipeline inside an `&&` chain.** `if cd X; then W; fi`,
   `while cd X; do W; done`, `{ cd X; } && W` and `cd X && Y | tee log` all degrade
   although the shell guarantees the `cd`. (`until cd X; do W; done` degrades correctly —
   its body runs when the `cd` failed — so the family is not uniform.) Filed `260804-0839_*_the-flat-joiner-model-ignores-shell-precedence-so-a-pipeline-and-an-if-body-degrade-a-cd-the-shell-guarantees.md`,
   **Medium**, a regression of this commit.

3. **A redirection to a literal relative target after an unproven `cd`.** This is the
   cross product of the Turn's two halves. The degrade table has no redirection row; the
   cause-split table has three rows and every one carries a `$`. So `cd hooks; npm test >
   out.log` — every word a literal — appears in neither, and it is the shape most likely
   to be met. This one is a correct policy cost. It is simply unstated.

The shipped sentence "The cost is these five shapes, and nothing else measured moved"
(`rules/protected-path-discipline.md:168`) is therefore false in the context an agent
reads it in. Filed `260804-0840_*_the-shipped-cost-statement-five-shapes-and-nothing-else-measured-moved-is-false-in-every-agents-context.md`, **Medium**.

The implementer's own instinct here was right — they corrected their count from two to
three this Turn after finding their harvest regex read only double-quoted literals. The
correction fixed the regex. The remaining error is one level up: **a corpus harvested
from the tests cannot measure a cost, only reproduce one.**

### 5. Was the supersession of `260801-1859_*_redirection-carries-fail-closed-into-unrecognised-programs-and-three-docs-deny-it.md` handled honestly? — The shape is fair. The central fact is inverted

**What is right.** The record that should have existed now exists, is filed `_i_`, states
both readings, costs each, and names the superseded record in both directions. Option 1
is stated on its merits ("Costs nothing to keep. Consistent with the sentence as literally
written. Has an argued issue behind it") rather than as a straw man. The two pinned tests
were **inverted with comments naming what they replaced**, including that the old test's
own comment called the give-up "the sharpest form" — and that is used as the argument for
reversing it rather than against, which is the honest use of it. Both inversions genuinely
pin the new behaviour: I mutated pass 3 back to the program bound and the suite fails.

**What is wrong.** Four places now assert:

> `curl -o rules/x.md` still denies on pass 1 — so the rule is not looser on the visible
> case than on the invisible one.

It allows. Measured through the real guard, fresh project, shipped list:

```
  allow   curl -o rules/x.md https://x
  allow   curl -o rules/x.md
  allow   curl --output rules/x.md https://x
  DENY    curl -s https://x > rules/x.md      # the redirection sibling, correctly denied
```

`curl` is not in `MUTATION_VERBS` and `-o` is not a redirection operator. Both `048f3db`
and HEAD agree.

The same docstring contradicts itself seven lines apart: `bash-mutation-guard.ts:167` says
it denies, `:174` lists it as a residual that "still writes it". And the supersession note
inverts the `Resolved:` line of the very file it is appended to — `260801-1859_*_redirection-carries-fail-closed-into-unrecognised-programs-and-three-docs-deny-it.md` says *"the
table already **allows** `curl -o rules/x.md`"*, and the note three paragraphs below says
*"`curl -o rules/x.md`, which **still denies** on pass 1"*. `260801-1859_*_redirection-carries-fail-closed-into-unrecognised-programs-and-three-docs-deny-it.md` was right.

The consequence is that `260804-0106`'s **constraint 3** was never met, and
after the change the guard is looser on that visible case than on the invisible one by a
wider margin than before:

```
  allow   curl -o rules/x.md https://x            # visible, literal, PROTECTED path
  DENY    pushd -n docs && echo hi > notes.txt    # invisible, and the target is harmless
```

This does not overturn the decision. `260803-1835` — an agent prompt overwritten with no
flag — is real, measured and now closed, and carries the decision on its own. What is
wrong is that a constraint and a Pro were argued from a fact that is false and checkable
in one command. Filed `260804-0841_*_the-supersession-inverts-the-fact-the-original-argument-rested-on-curl-o-rules-x-md-allows.md`, **High**, on record integrity.

---

## Findings by theme

### Theme: the model asserts a directory the shell is not standing in

The Circle's recurring class. Both rows are pre-existing and both are live.

| # | Severity | Kind | Finding |
|---|---|---|---|
| `260804-0836_*_a-cd-skipped-by-an-earlier-double-pipe-is-still-modelled-as-made-so-the-and-guarantee-leaks.md` | High | pre-existing | `&&` guarantees the and-or list to its left, not the previous segment; a `cd` skipped by an earlier `||` is modelled as made, and eight measured commands reach `rules/**`, `agents/**` and `skills/**` |
| `260804-0837_*_a-cd-inside-a-pipeline-runs-in-a-subshell-in-bash-and-the-model-follows-it-anyway.md` | High | pre-existing | a `cd` in a pipeline runs in a bash subshell and does not move the calling shell; the model follows it, and four measured commands write the protected file in bash |

### Theme: the joiner is a separator list, and the shell's reachability is not

Both regressions of `c9c44a3`, both over-denying, both with a deny reason whose remedy is
already applied.

| # | Severity | Kind | Finding |
|---|---|---|---|
| `260804-0838_*_a-newline-after-and-is-downgraded-to-newline-so-a-multi-line-and-chain-denies-with-an-unactionable-reason.md` | High | regression | `flush` downgrades a pending `&&` on a newline, so a multi-line `&&` chain denies; bash's grammar puts a `newline_list` inside the operator, and `||` is not downgraded by the same code |
| `260804-0839_*_the-flat-joiner-model-ignores-shell-precedence-so-a-pipeline-and-an-if-body-degrade-a-cd-the-shell-guarantees.md` | Medium | regression | `|` binds tighter than `&&` and a conditional body is reached on a condition; `cd X && Y \| tee log`, `if cd X; then W; fi`, `while cd X; do W; done` and `{ cd X; } && W` all degrade although the shell guarantees the `cd` |

### Theme: what was measured, and what the measurement was said to be

| # | Severity | Kind | Finding |
|---|---|---|---|
| `260804-0841_*_the-supersession-inverts-the-fact-the-original-argument-rested-on-curl-o-rules-x-md-allows.md` | High | regression (record) | `curl -o rules/x.md` allows; three code comments, the decision's constraint 3 and the supersession note say it denies, and the note contradicts the `Resolved:` line of its own host file |
| `260804-0840_*_the-shipped-cost-statement-five-shapes-and-nothing-else-measured-moved-is-false-in-every-agents-context.md` | Medium | regression (docs) | "The cost is these five shapes, and nothing else measured moved" ships into every agent's context; 10 of 30 ordinary shapes moved, and three families are in neither cost table |
| `260804-0842_*_the-git-gold-fixture-carries-no-double-pipe-pipe-or-ampersand-joiner-and-no-allow-only-row.md` | Low | new | the git gold fixture carries no `\|\|`, `\|` or `&` joiner and no allow-only row; its provenance is genuine and the source check is what carries the weight |

---

## Cross-cutting observations

**The measurements are trustworthy; one inference on top of them is not — again.** This is
the same shape as Turn 5. Every number the implementer reported reproduced when I re-ran
it: the five-row degrade table, the three-row cause-split table, the eighteen moved
verdicts, the gold file's 98 rows from the pre-change classifier, all fourteen acceptance
rows, and all five anti-vacuity mutations. What is wrong is one step of reasoning laid
over correct data — last Turn "mis-marking a wrapper is an over-deny", this Turn "`&&`
means the previous segment succeeded". Both are one word away from true.

**A corpus harvested from the tests measures reproduction, not cost.** The implementer
found and fixed a harvest bug this Turn and reported the corrected number honestly. The
deeper problem survived the fix: 4,203 strings from 24 test files contained no `if cd`,
no `&&`-newline chain and no `cd X; prog > log`, so none of them could move. The
cross-product generator that found all three took twenty lines. It belongs in the method,
not in a review.

**Both halves of a directory model are needed for one command to come out right.** `cd
hooks && npx tsc | tee typecheck.log` needs `|` to stop meaning "reached unconditionally"
(for the write) *and* to start meaning "does not move the shell" (for a `cd`). `260804-0837_*_a-cd-inside-a-pipeline-runs-in-a-subshell-in-bash-and-the-model-follows-it-anyway.md`
and `260804-0839_*_the-flat-joiner-model-ignores-shell-precedence-so-a-pipeline-and-an-if-body-degrade-a-cd-the-shell-guarantees.md` are the two halves; fixing either alone leaves the other wrong in the
opposite direction. That is the generalisable lesson of this Circle: every joiner carries
two independent facts, and the module has so far modelled one of them.

**A give-up is still the only safe move, and this Turn respected that.** `degradeUnprovenCd`
delegates to `unmodelled` and then only *narrows* the cause; the placement after the scope
restore is right and I could not break it (`(cd nonexistent); rm x.md` allows, `$(cd
build); rm rules/x.md` denies, `{` groups and nested parens all restore correctly). The
`moved` field satisfies the module's stated monotone-boolean invariant and `cloneState`
scopes it. Zero newly-allowing commands across 222,319 is that discipline showing up as a
measurement.

**Shipping state.** The committed `hooks/dist/` at HEAD carries neither this Turn's change
nor the earlier ones (`grep -c degradeUnprovenCd` = 0, `grep -c joiner` = 0), and
`plugin.json` is still 5.8.0. Disclosed and deferred to Plan Step 10 — noted, not filed.
Nothing in this Circle is live for a consuming project yet. (My `npm test` run rebuilt
`hooks/dist/` from current source; it was already dirty at session start and the content
is a build of the same tree.)

---

## Recommended sequencing

**Release blocker for any claim about the boundary:** `260804-0836_*_a-cd-skipped-by-an-earlier-double-pipe-is-still-modelled-as-made-so-the-and-guarantee-leaks.md` and `260804-0837_*_a-cd-inside-a-pipeline-runs-in-a-subshell-in-bash-and-the-model-follows-it-anyway.md`.
They are the class this Circle exists to close, they are live in both shells, and they
need one design decision between them — whether a `cd` must be *proven-reached* before it
may set a directory. That decision closes both. It should get a record before code moves,
the way `260803-2238_*_the-directory-model-assumes-every-cd-succeeds-so-a-cd-to-a-nonexistent-directory-is-a-one-segment-bypass.md` did.

**Same commit, cheap, and it is a regression:** `260804-0838_*_a-newline-after-and-is-downgraded-to-newline-so-a-multi-line-and-chain-denies-with-an-unactionable-reason.md`. One condition in `flush`.
It is the finding most likely to be met by an agent tomorrow, and the deny it produces is
unfollowable.

**Same commit, free:** `260804-0841_*_the-supersession-inverts-the-fact-the-original-argument-rested-on-curl-o-rules-x-md-allows.md`. Three comment lines, one constraint annotation, one
supersession paragraph. Nothing behavioural. Leaving a false fact in `bash-mutation-guard.ts`
seven lines from its own correction is how the next reader inherits it.

**Next:** `260804-0840_*_the-shipped-cost-statement-five-shapes-and-nothing-else-measured-moved-is-false-in-every-agents-context.md` — the cost statement an agent reads. Best done together with
`260804-0839_*_the-flat-joiner-model-ignores-shell-precedence-so-a-pipeline-and-an-if-body-degrade-a-cd-the-shell-guarantees.md`, since fixing the pipeline row shrinks the table it has to state.

**Whenever the fixture is next touched:** `260804-0842_*_the-git-gold-fixture-carries-no-double-pipe-pipe-or-ampersand-joiner-and-no-allow-only-row.md`.

---

## The plain verdict

**Yes. The class has returned a seventh time — and this time it did not move, it stayed.**

That distinction is worth being exact about, because it is the first time in this Circle
it applies. Turns 1 through 6 each closed one construct and each opened or revealed
another; Turn 5's fix caused its own regression. Turn 7 opened nothing: **zero** commands
allow at HEAD that denied at `048f3db`, across 222,319 generated commands, two quoting
modes and 25,845 git rows. The bypass it was written for (`cd nonexistent; rm rules/x.md`)
is closed in both shells, the redirect spelling closed with it, and the fail-closed bound
survives at exactly the width the record claims.

What survives is not new and was not caused here. It is the same premise, stated one word
too strongly. `&&` does not guarantee that the previous *segment* ran, and it does not
reach into a pipeline — so `true || cd build && rm rules/x.md` and `echo hi | cd build &&
rm rules/x.md` still delete a protected rule, with no flag, no wrapper and no env
variable. Both allowed at `048f3db`; both allow now.

### The boundary, by coverage

Measured at HEAD, not claimed.

**Closed — the directory model gives up rather than guess:**

- any flag on `cd` / `chdir` / `pushd` / `popd` outside the two-member allow-list (`-P`,
  `-n`, `-q`, `-e`, `-@` and anything not yet invented);
- `set -P` / `set -o physical`;
- a `CDPATH` assigned in the command, and a `CDPATH` in the hook's environment (with the
  reach residual the Circle documented);
- `pushd` with no operand, `pushd +N`, `pushd -N` — the rotation forms;
- a directory builtin behind **any** wrapper (`command`, `builtin`, `time`, `sudo`, `env`,
  `xargs`, …) and any path-spelled one (`/usr/bin/cd`);
- a stack whose depth the model and the shell disagree about;
- an operand the guard cannot resolve to a literal;
- a `cd` that **fails**, on `;`, `||`, `&` and a bare newline;
- a write the guard cannot place, **whatever the program is** — the redirect route every
  directory give-up used to feed.

**Not closed, live, and reachable with no flag:**

- a `cd` reached through a joiner that may have skipped it — `X || cd DIR && <write>`
  (`260804-0836_*_a-cd-skipped-by-an-earlier-double-pipe-is-still-modelled-as-made-so-the-and-guarantee-leaks.md`);
- a `cd` inside a pipeline, which bash subshells — `X | cd DIR && <write>`
  (`260804-0837_*_a-cd-inside-a-pipeline-runs-in-a-subshell-in-bash-and-the-model-follows-it-anyway.md`).

Both are one fact: **the joiner is consulted for the segment that writes and never for
the segment that moves.** One decision closes both.

**Out of reach of a textual classifier, by nature, and no further Turn should be spent on
them:**

- `eval "cd rules"`, `bash -c '…'`, `source script.sh` — a string the shell re-parses;
- an alias or shell function named `cd`, a `case` arm, a function body — an ordinary word
  in command position;
- a `cd` whose operand is computed at run time;
- an operand arriving on stdin (`find … | xargs rm -rf`);
- a second, unprotected **name** for a protected file (`ln -s`, `cp -l`), which the guard
  sees in full and correctly allows because protection is decided on a path's text;
- a `trap` body, whose command is a quoted string and whose working directory at exit is
  unknowable.

No enumeration closes that last group, and the value of saying so is that the day
`260804-0836_*_a-cd-skipped-by-an-earlier-double-pipe-is-still-modelled-as-made-so-the-and-guarantee-leaks.md` and `260804-0837_*_a-cd-inside-a-pipeline-runs-in-a-subshell-in-bash-and-the-model-follows-it-anyway.md` are shut, this sentence becomes true, checkable, and
worth putting in front of the user:

> The guard's model of where the shell is standing is exact for every `cd` written in the
> command text and reached by a path the shell guarantees, and blind to every `cd` that is
> neither.

It is one decision away. It is not true yet, and the six previous hedges are the reason to
say that plainly rather than to round up.

---

**Reconciliation 260804-1021-reconciliation.md (reconciler, domain `code`) — every finding re-checked at HEAD `cc012fc`. The review holds; three of its seven findings closed in `cc012fc` and four are open. One thing it missed.**

| Finding | State at HEAD | Evidence |
|---|---|---|
| `260804-0836_*_a-cd-skipped-by-an-earlier-double-pipe-is-still-modelled-as-made-so-the-and-guarantee-leaks.md` `\|\|` skips the `cd` | **open, live** | `true \|\| cd build && rm rules/x.md` allows |
| `260804-0837_*_a-cd-inside-a-pipeline-runs-in-a-subshell-in-bash-and-the-model-follows-it-anyway.md` pipeline subshells the `cd` | **open, live** | `echo hi \| cd build && rm rules/x.md` allows |
| `260804-0838_*_a-newline-after-and-is-downgraded-to-newline-so-a-multi-line-and-chain-denies-with-an-unactionable-reason.md` newline after `&&` | closed `cc012fc` | pinned in `shell-parse.test.ts` and both integration suites |
| `260804-0839_*_the-flat-joiner-model-ignores-shell-precedence-so-a-pipeline-and-an-if-body-degrade-a-cd-the-shell-guarantees.md` flat joiner over-denies | **open** | `if cd hooks; then rm -rf dist; fi` still denies |
| `260804-0840_*_the-shipped-cost-statement-five-shapes-and-nothing-else-measured-moved-is-false-in-every-agents-context.md` the false cost statement | closed `cc012fc` | replaced by a rule, not a list |
| `260804-0841_*_the-supersession-inverts-the-fact-the-original-argument-rested-on-curl-o-rules-x-md-allows.md` the inverted fact | closed `cc012fc` | `curl -o rules/x.md` re-measured, allows; the correction is right |
| `260804-0842_*_the-git-gold-fixture-carries-no-double-pipe-pipe-or-ampersand-joiner-and-no-allow-only-row.md` git gold fixture | **open** | fixture unchanged |

**The review's headline measurement is confirmed and is worth restating precisely, because it has been repeated in a stronger form than it supports.** Zero commands allow at HEAD that denied at `048f3db`, across 222,319 generated commands: true, and it is a statement about the **security** direction only. In the cost and accuracy directions `c9c44a3` introduced four regressions (`260804-0838_*_a-newline-after-and-is-downgraded-to-newline-so-a-multi-line-and-chain-denies-with-an-unactionable-reason.md`, `260804-0839_*_the-flat-joiner-model-ignores-shell-precedence-so-a-pipeline-and-an-if-body-degrade-a-cd-the-shell-guarantees.md`, `260804-0840_*_the-shipped-cost-statement-five-shapes-and-nothing-else-measured-moved-is-false-in-every-agents-context.md`, `260804-0841_*_the-supersession-inverts-the-fact-the-original-argument-rested-on-curl-o-rules-x-md-allows.md`) plus one new coverage gap (`260804-0842_*_the-git-gold-fixture-carries-no-double-pipe-pipe-or-ampersand-joiner-and-no-allow-only-row.md`). Turn 7 opened no hole and did cost accuracy. Both halves are true; the second is the one that gets dropped.

**What this review did not reach, found in the reconciler's own pass.** The review answered five questions about the joiner and the fail-closed bound, thoroughly. It did not sweep the `git` verb's own directory handling, and there is a live no-flag route there in the same family: `git -C rules rm x.md` allows and deletes the file, because `resolveGit` (`hooks/lib/bash-mutation-guard.ts:1084-1087`) skips `-C` **and its value** to find the subcommand and never applies the directory. It has no joiner in it, so no option of `260804-0947_*_` touches it. Filed as `260804-1024_*_`; `git checkout <treeish> --` as `260804-1026_*_`.

That matters for this review's `### The boundary, by coverage` section, which is otherwise the most useful thing written in this Circle. Its "Not closed, live, and reachable with no flag" list has two entries and should have three, and the sentence it offers as the prize — *"The guard's model of where the shell is standing is exact for every `cd` written in the command text and reached by a path the shell guarantees"* — is still not reachable by closing `260804-0836_*_a-cd-skipped-by-an-earlier-double-pipe-is-still-modelled-as-made-so-the-and-guarantee-leaks.md` and `260804-0837_*_a-cd-inside-a-pipeline-runs-in-a-subshell-in-bash-and-the-model-follows-it-anyway.md` alone.

**And one finding inside the review's own subject that it read past.** `rules/protected-path-discipline.md:172`, in the section this Turn added, tells an agent that when every joiner between the builtin and the write is `&&`, "the model stays exact". Run that on `true || cd build && rm rules/x.md`: question 2 answers yes. The document's decision procedure returns the safe answer for the two commands this review rates as the release blocker. Filed as `260804-1025_*_`.
