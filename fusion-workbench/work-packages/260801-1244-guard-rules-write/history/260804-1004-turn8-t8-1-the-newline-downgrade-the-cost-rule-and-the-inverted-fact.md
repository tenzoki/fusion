# Turn 8, T8-1 — the newline downgrade, the cost stated as a rule, the inverted fact, and a decision for the two leaks

**Date:** 2026-08-04 10:04
**Agent:** coder
**Circle:** `260801-1244-guard-rules-write`, Turn 5 of this session (the Circle's eighth)
**Task:** T8-1 — three fixes from `260804-0845-coderev-turn7-…` plus one decision draft
**Suite:** `npm test` — 1241 passed, 24 files, green (was 1235)
**Status:** Complete

---

## The three sentences

**No verdict moved except the intended ones.** Across a 41,400-row generated
cross-product, a 4,424-row harvest of the test suite and the review's own 30-row
ordinary-agent corpus: **zero newly denying, in every corpus**; every newly-allowing row
carries an `&&` followed by a newline; segmentation is byte-identical in both quoting modes
and the git classifier is identical across four override combinations. **The corrected cost
statement is a rule**, stated in a block quote with three ordered questions that decide any
command, followed by illustrations explicitly labelled as an open set. **The corrected
supersession argument still supports its conclusion, on one leg instead of two** — the
consistency argument it rested on was not merely mis-stated but points the other way, and
the record now says the decision stands on the measured defect alone.

---

## Fix 1 — `&&` followed by a newline (`260804-0838_*_a-newline-after-and-is-downgraded-to-newline-so-a-multi-line-and-chain-denies-with-an-unactionable-reason.md`, High, regression)

### The change

One condition in `flush` (`hooks/lib/shell-parse.ts`). The give-up that downgrades a
pending `&&` to whatever operator follows it no longer fires when that operator is a
newline. Bash's grammar is `and_or : and_or AND_AND newline_list pipeline`, so the newlines
sit *inside* the operator; the operator is still `&&`.

A real second operator after the newlines still wins, because the flush it causes finds
`pending === "&&"` again and takes the same branch: `a &&\n; b` joins on `;`. I got this
wrong on the first pass — I replaced the branch body with a comment and dropped the
`pending = next` assignment, so `a &&\n; b` reported `&&`. My own probe row caught it
before any test ran, which is the argument for probing the discriminating neighbour rather
than only the headline row.

### Measured, both directions

`old` = the working tree as it stood at the start of this Turn (HEAD plus Turn 7's
uncommitted work), materialised into a separate directory and loaded alongside.

| Corpus | rows | newly DENYING | newly ALLOWING | segmentation diffs | git diffs |
|---|---|---|---|---|---|
| generated cross-product | 41,417 | **0** | 2,164 | 0 | 0 |
| test-suite harvest | 4,424 | **0** | 8 | 0 | 0 |
| ordinary-agent 30 (the review's) | 30 | **0** | 1 | 0 | 0 |

Every newly-allowing row contains an `&&`+newline — checked by predicate, not by eye. The
8 in the harvest are the five distinct rows my own new tests added; the 1 in the ordinary
corpus is the review's `cd hooks &&\n npm run build &&\n rm -rf dist`.

**The acceptance criterion, asserted directly.** For all 8,600 multi-line `&&` rows of the
generated corpus, the verdict **and the reason string** are identical to the same command
with each `&&`+newline flattened to `&& `: **0 mismatches**.

414 rows keep their verdict and gain a better reason — `cd rules &&\n rm x.md` used to deny
for "a `cd` the shell does not guarantee" and now denies for "writes a protected path",
which is what it was always doing. All 414 carry an `&&`+newline.

### The shells

One throwaway project per row, both shells:

```
  bash  cd build &&\nrm out.js         build/out.js GONE, root out.js present
  bash  cd nonexistent &&\nrm out.js   nothing touched
  zsh   cd build &&\nrm out.js         build/out.js GONE, root out.js present
  zsh   cd nonexistent &&\nrm out.js   nothing touched
```

So the multi-line form is the single-line form in both directions: the write runs in the
new directory when the `cd` succeeds, and does not run at all when it fails. That second
half is why following the `cd` across the newline is sound rather than merely convenient.

### `||` and `&&` are now consistent

`||` was never downgraded on this path — that asymmetry is what told the review the
downgrade was accidental rather than argued. Both operators now keep their identity across
a following newline, and the shell-parse suite pins the pair
(`cd build ||\n rm out.js` → `||`, `cd build &&\n rm out.js` → `&&`).

---

## Fix 2 — the cost statement (`260804-0840_*_the-shipped-cost-statement-five-shapes-and-nothing-else-measured-moved-is-false-in-every-agents-context.md`, Medium, highest reach)

The shipped sentence was *"The cost is these five shapes, and nothing else measured
moved"*, in the file loaded into every agent's context in every consuming project. Ten of
thirty ordinary shapes move and three families were in neither cost table.

**I did not replace it with a longer enumeration.** `rules/protected-path-discipline.md`
now opens the section with the rule in a block quote:

> Once a `cd`, `chdir`, `pushd` or `popd` has run, the working directory is unknown in
> every segment that is reachable without an `&&` from that point on — and a mutation with
> a **relative** operand in such a segment is denied fail-closed, naming the joiner.

followed by three ordered questions that decide any command (is there a directory builtin
at all; is every joiner between it and the write an `&&`; does the writing segment name a
relative path), then the two words that carry the surprises — "reachable, not next" and
"unknown, not denied" — and only then a deny/allow block headed **"Illustrations, not a
list"** which says in its own words that the set is open and that a reader who cannot
answer the three questions should re-read the rule rather than look for their command.

Every illustration row was measured through the real classifier before it was written down.
The three missing families are all in it: the redirection-to-a-literal-relative-target rows
(`cd hooks; npm test > out.log`), the `260804-0839_*_the-flat-joiner-model-ignores-shell-precedence-so-a-pipeline-and-an-if-body-degrade-a-cd-the-shell-guarantees.md` over-denies, and the bare newline.

The same rule replaces the same enumeration in `README-hooks.md` and in the module
docstring, and the test formerly titled *"costs exactly these five ordinary shapes"* is now
*"costs these ordinary shapes, which are examples of the rule"*, with a docstring saying
that adding a row is expected and the rule is what must not drift. Five of the review's
rows joined it.

**The method changed, which is the part that generalises.** The five came from a corpus
harvested out of the guard's own test files. A harvest measures reproduction, not cost — it
can only contain what the suite already contains. Cost is now measured with a generated
cross-product (heads × joiners × directory builtins × joiners × writes, plus the multi-line
and compound shapes a flat product cannot reach). It is about forty lines and it found all
three missing families in one run.

I also added the two live leaks (`260804-0836_*_a-cd-skipped-by-an-earlier-double-pipe-is-still-modelled-as-made-so-the-and-guarantee-leaks.md`, `260804-0837_*_a-cd-inside-a-pipeline-runs-in-a-subshell-in-bash-and-the-model-follows-it-anyway.md`) to the residual list as an
entry that errs toward ALLOW, with both commands and the real-shell effect, and a sentence
saying the "the model is exact" claim is **not** true yet and nothing in the file should be
read as making it.

---

## Fix 3 — the inverted fact (`260804-0841_*_the-supersession-inverts-the-fact-the-original-argument-rested-on-curl-o-rules-x-md-allows.md`, High)

### Verified before repeating

`curl -o rules/x.md` **allows**. Measured myself, real classifier, shipped protected list,
at the pre-Turn tree and at HEAD, rather than taken from the review:

```
  pre    now    command
  allow  allow  curl -o rules/x.md https://x
  allow  allow  curl -o rules/x.md
  allow  allow  curl --output rules/x.md https://x
  allow  allow  wget -O rules/x.md https://x
  DENY   DENY   curl -s https://x > rules/x.md
  DENY   DENY   sort /tmp/a > rules/x.md
  DENY   DENY   pushd -n docs && echo hi > notes.txt      # invisible, harmless target
```

### Found by grep, not by fixing the three the review named

Six occurrences, all corrected:

1. `bash-mutation-guard.ts` module docstring;
2. `bash-mutation-guard.ts` pass-3 comment — which now says explicitly that an earlier
   comment asserted the opposite seven lines from its own correction;
3. `README-hooks.md`, the fail-closed redirection paragraph;
4. `260804-0106` — the Pro under option 2 and constraint 3, **struck** with the
   strike dated rather than edited away;
5. `260801-1859_*_…` — the supersession
   note I wrote last Turn;
6. `260804-0140-turn7-…` — my own history, struck in place with a dated correction
   block, so a reader inherits the correction with the claim.

### The argument, rebuilt rather than restated

The decision's answer does not move — `260803-1835`, a measured no-flag overwrite of
`agents/coder.md`, carries it alone. But **it now stands on one leg instead of two, and the
record says so.** The consistency argument was not merely mis-stated: read correctly it
favours option 1, because after the change the guard is looser on `curl -o rules/x.md` than
on `pushd -n docs && echo hi > notes.txt`, whose target is harmless.

What replaces it is not visible-vs-invisible but **inside the mechanism vs outside it**.
`curl -o` puts no operand in the written set at all — no verb row, no redirection operator —
so it is the standing unrecognised-program residual. A `>` puts its target in the written
set whatever the program is, so the guard has already recognised the write and holds the
operand; the only thing missing is a working directory it has itself admitted it lost.
Declining to model a program you never recognised is a bound on a mechanism. Recognising a
write and then allowing it because your own model failed is that mechanism failing open.

A new `## The argument, corrected` section on `260804-0106_*_should-the-fail-closed-bound-be-drawn-around-the-program-or-around-the-cause.md` carries the measurement, the
strike, the rebuilt argument and a method note. One new test —
*"is LOOSER on the visible curl case than on the invisible redirect one"* — asserts both
sides of the pair in one place, so the next reader inherits a measurement instead of a
recollection.

---

## Draft 4 — the decision for the two leaks (not implemented)

`260804-0947_*_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md`.

One record for `260804-0836_*_a-cd-skipped-by-an-earlier-double-pipe-is-still-modelled-as-made-so-the-and-guarantee-leaks.md` and `260804-0837_*_a-cd-inside-a-pipeline-runs-in-a-subshell-in-bash-and-the-model-follows-it-anyway.md`, because they are one fact: **the joiner is
consulted for the segment that writes and never for the segment that moves.**

**Reproduced first**, one throwaway project per row, `rules/x.md` seeded and watched:

```
  bash  GONE     true || cd build && rm rules/x.md
  bash  GONE     echo hi | cd build && rm rules/x.md
  zsh   GONE     true || cd build && rm rules/x.md
  zsh   intact   echo hi | cd build && rm rules/x.md
  bash  intact   [ -d nope ] || cd build && rm rules/x.md     # the control
  zsh   intact   [ -d nope ] || cd build && rm rules/x.md     # the control
```

**Option 1 (consult the joiner for the moving segment) was simulated and measured, both
directions**, in a materialised copy of `hooks/lib`:

| Corpus | rows | option 1 newly DENIES | newly ALLOWS |
|---|---|---|---|
| test-suite harvest | 3,373 | **0** | 0 |
| generated cross-product | 25,200 | **940** | 0 |
| ordinary-agent 30 | 30 | **0** | 0 |

All eleven measured leak rows close. Of the 940 cost rows, **940 carry a `||` or a `|`
immediately before the directory builtin** — checked by predicate — so the cost is exactly
the shape the option targets and does not spill. It does **not** address `260804-0839_*_the-flat-joiner-model-ignores-shell-precedence-so-a-pipeline-and-an-if-body-degrade-a-cd-the-shell-guarantees.md`:
measured identically before and after.

**Option 2 (model the and-or list)** is the only one that also closes `260804-0839_*_the-flat-joiner-model-ignores-shell-precedence-so-a-pipeline-and-an-if-body-degrade-a-cd-the-shell-guarantees.md`.
Measured relief: **84 of 84** generated `if` / `while` / brace-group / pipeline rows deny
today and should allow. Its cost beyond those two ends **is not stated**, because it cannot
be measured without implementing it — and inventing a number there is precisely the failure
the last two Turns were spent correcting. The counter-example that keeps an implementation
honest is `until cd X; do W; done`, whose body runs when the `cd` **failed**: 12 of 12
generated rows deny today and must keep denying.

**Recommendation: option 4** — take option 1 now (ten lines at an existing call site, zero
measured cost on real work), and give the reachability model its own Circle. The record
carries two implementation notes so nothing has to be re-derived: write the condition as
"the joiner is one of the safe ones" rather than as "`||` or `|`" (a leading `&` is safe —
`A & cd B` backgrounds `A` and runs the `cd` in the foreground shell), and put the give-up
after the scope restore.

---

## Tests

`npm test` — **1241 passed, 24 files, green.** Up 6 from 1235.

**Anti-vacuity by mutation** — each fix broken in turn, full suite run, failures counted.
Not by reading the tests.

| Mutation | Failures |
|---|---|
| the unconditional `&&` downgrade restored (the regression returns) | **4** across 3 files — 2 lexer, 1 unit, 1 integration |
| the `&&` is NEVER given up, whatever follows (the fix over-applied) | **2** — both lexer, including the pre-existing `a && ; b` row |
| `curl` added to `MUTATION_VERBS` (the false claim made true) | **9** across 2 files |

Mutations 1 and 2 fail **disjoint** sets, which is the point: the fix has to keep the `&&`
across a newline *and* give it up at a real second operator, and each direction is pinned
by its own case.

The standing guard holds: every denial assertion runs in a throwaway project where
`rm -f rules/x.md` blocks, every new integration deny asserts it is not `[HALTED]`, and the
new multi-line case asserts the real-shell effect in bash **and** zsh — including the
negative half (a failing `cd` writes nothing), which is the half that makes the fix sound
rather than merely convenient.

---

## Workbench

- `260804-0838` → `_c_`, with the both-directions measurement and the shell rows.
- `260804-0840` → `_c_`, listing every surface the enumeration was removed from and
  the method change that replaces it.
- `260804-0841` → `_c_`, listing all six occurrences and the rebuilt argument.
- `260804-0836`, `260804-0837_*_a-cd-inside-a-pipeline-runs-in-a-subshell-in-bash-and-the-model-follows-it-anyway.md`, `260804-0839_*_the-flat-joiner-model-ignores-shell-precedence-so-a-pipeline-and-an-if-body-degrade-a-cd-the-shell-guarantees.md` stay `_o_`, each with a pointer to the
  new decision record and what it costs their option.
- `260804-0947` filed `_o_`.
- `260804-0106` — Pro and constraint 3 struck and dated, `## The argument,
  corrected` appended, the 119-command-corpus claim annotated.
- `260801-1859_*_…` — supersession note
  corrected.
- `260804-0140-turn7-…` — the false sentence struck in place with a dated block.

---

## Not done, deliberately

`hooks/dist/` tracked files restored to HEAD after the final run (`npm test` is
`tsc && vitest run`, so any run dirties them). Four **untracked** files under `hooks/dist/`
predate this session and were left alone. The rebuild and the version bump belong to Plan
Step 10. Nothing was committed; the orchestrator commits after validation.

---

## What the next session inherits, in the order I would take it

1. **`260804-0947` — answer it.** It is the release blocker for any claim about
   the boundary. Two no-flag writes to `rules/**`, `agents/**` and `skills/**` are live in
   bash right now, both pre-existing, both reproduced this Turn in both shells. The record
   costs three options by measurement and recommends option 4 (the ten-line give-up now,
   the reachability model as its own Circle). Option 1's cost is measured at **zero** on
   every corpus of real work, so this is cheap — but it is a decision, and this Circle's
   rule has been that a design record comes before the code moves.

2. **Plan Step 10 — rebuild `hooks/dist/` and bump `plugin.json`.** Nothing in this Circle
   is live for a consuming project yet. The committed `dist/` at HEAD carries none of
   Turns 5–8, and `plugin.json` is still 5.8.0. Everything else here is moot until this
   happens.

3. **`260804-0839_*_the-flat-joiner-model-ignores-shell-precedence-so-a-pipeline-and-an-if-body-degrade-a-cd-the-shell-guarantees.md` — the over-deny.** 84 of 84 generated rows. An agent meets it on
   ordinary work (`if cd hooks; then rm -rf dist; fi`, `cd hooks && npx tsc | tee log`).
   It is a cost, not a hazard, and only option 2 of the new decision closes it — which is
   the argument for planning that model properly rather than bolting it on.

4. **`260804-0842_*_the-git-gold-fixture-carries-no-double-pipe-pipe-or-ampersand-joiner-and-no-allow-only-row.md` — the git gold fixture.** Low. It carries no `||`, `|` or `&` joiner and
   no allow-only row, so it cannot catch a drift in the families this Circle has been
   widening. Do it whenever the fixture is next touched; the source check
   (`expect(src).not.toMatch(/\bparseCommand\b/)`) is what actually carries the weight and
   is unaffected.

5. **The three older open decisions** in this Circle — `260803-1314` (may a project protect
   a path inside its own rule directory against the flag), `260803-1402` (should the
   classifier inspect a read operand to close the planted alias), `260802-1912_*_does-the-self-protection-floor-apply-before-the-config-file-exists.md` (the
   self-protection floor before the config file exists). None is blocking; all three are
   older than the Turn-5-to-8 sequence and have been queued behind it.

**One method note to carry forward, because it has now cost three Turns.** Every number
this Circle's implementer reported has reproduced under review. What has failed, three
times running, is one inference laid over correct data — "mis-marking a wrapper is an
over-deny", "`&&` means the previous segment succeeded", "`curl -o rules/x.md` denies". All
three were one command away from being checked and none of them was run. The generated
cross-product is now the method for cost; the equivalent discipline for a *claim* is to run
it before writing it down, especially when it is the premise of an argument rather than its
conclusion.
