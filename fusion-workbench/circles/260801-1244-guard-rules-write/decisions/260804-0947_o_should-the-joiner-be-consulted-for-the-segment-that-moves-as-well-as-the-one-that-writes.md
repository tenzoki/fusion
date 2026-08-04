# Should the joiner be consulted for the segment that MOVES, as well as for the one that WRITES?

---
**Domain:** code
**Status:** open
**Filed by:** coder (task T8-1, `circles/260801-1244-guard-rules-write`)
**Cross-references:**
`issues/260804-0836_o_…` (`X || cd DIR && <write>` — the `cd` may have been skipped),
`issues/260804-0837_o_…` (`X | cd DIR && <write>` — bash subshells the `cd`),
`issues/260804-0839_o_…` (the over-deny in the other direction: a conditional body,
a loop body, a brace group and a pipeline stage all degrade although the shell
guarantees the `cd`),
`reviews/260804-0845-coderev-turn7-separator-degrade-and-the-cause-bound.md`
(where all three were measured),
`decisions/260803-2338_i_should-the-guard-degrade-its-directory-model-after-a-cd-it-cannot-prove-succeeded.md`
(the decision that introduced the joiner and consulted it on one side only),
`hooks/lib/bash-mutation-guard.ts` — `ShellState.moved` (`:1564`),
`applyDirEffect`, `degradeUnprovenCd`, and the joiner test in the segment walk,
`hooks/lib/shell-parse.ts` — `SegmentJoiner`.

---

## Question

`260803-2338` gave every segment the operator that joins it to the one before it,
and taught the model to give the working directory up at any joiner that is not
`&&`. It consults that operator **for the segment that writes** and never **for
the segment that moves**.

`ShellState.moved` is set the moment a directory builtin is *seen*, whatever
brought its segment into reach. Nothing asks whether that segment was itself
guaranteed to run. Two families fall through the gap, and both write files on the
protected list in a real shell with no flag, no wrapper and no environment
variable:

```
  guard   bash          zsh           command
  allow   GONE          GONE          true || cd build && rm rules/x.md
  allow   GONE          intact        echo hi | cd build && rm rules/x.md
```

Measured again for this record, fresh throwaway project per row, `rules/x.md`
seeded and watched:

```
  bash  GONE     true || cd build && rm rules/x.md
  bash  GONE     echo hi | cd build && rm rules/x.md
  zsh   GONE     true || cd build && rm rules/x.md
  zsh   intact   echo hi | cd build && rm rules/x.md
  bash  intact   [ -d nope ] || cd build && rm rules/x.md      # the control
  zsh   intact   [ -d nope ] || cd build && rm rules/x.md      # the control
```

Both are **pre-existing** — they allow at `048f3db` and allow now — and both are
live. The `zsh: intact` row is not a reprieve: zsh runs the last element of a
pipeline in the calling shell, so there the model happens to be right; bash
subshells it, and bash is the shell that writes the file.

Why the premise leaks, in two sentences. `&&` guarantees that the **and-or list
to its left** returned zero, not that the segment immediately before it ran — a
flat list evaluates left to right, so `A || B && C` is `(A || B) && C` and
reaching `C` proves nothing about `B`. And `|` binds tighter than `&&`, so a
pipeline stage is not an and-or list member at all; in bash it runs in a
subshell that cannot move the caller.

The control row is the whole difficulty. `[ -d nope ] || cd build && rm
rules/x.md` is the same text with a failing left operand: there the `cd` really
does run, the model is right, and the guard returns the same verdict for both,
because what separates them is an exit status the guard will never have.

**Why now.** Every claim this Circle can make about the boundary depends on it.
The sentence the review wants to be able to put in front of the user —

> The guard's model of where the shell is standing is exact for every `cd`
> written in the command text and reached by a path the shell guarantees, and
> blind to every `cd` that is neither.

— is one decision away from true and is not true yet.

## What the two findings have in common

One fact, stated once: **the joiner is consulted for the segment that writes and
never for the segment that moves.** `260804-0836` is that fact met through `||`;
`260804-0837` is the same fact met through `|`. One decision closes both, and no
option below closes one without the other.

`260804-0839` is the same asymmetry seen from the other side — a segment the
shell *does* guarantee that the flat model degrades anyway — which is why it is
costed here rather than separately.

## Options

### 1. Consult the joiner for the moving segment too

When a directory builtin's own segment is joined by an operator that may have
skipped it (`||`) or that runs it in a subshell (`|`), the model may not follow
the `cd`: the directory goes **unknown** instead of moving, exactly as it does
for an unmodelled `cd` flag. Everything else is untouched.

Roughly ten lines at the one call site: remember `state.moved` before
`applyDirEffect`, and degrade immediately afterwards when the builtin is new and
the segment's joiner is `||` or `|`.

**Measured, both directions** — real classifier, shipped protected list, the
option simulated in a materialised copy of `hooks/lib`:

| Corpus | rows | option 1 newly DENIES | newly ALLOWS |
|---|---|---|---|
| every quoted string in the 24 test files | 3,373 | **0** | 0 |
| generated cross-product (heads × joiners × 10 directory builtins × joiners × 10 writes) | 25,200 | **940** | 0 |
| the 30-row ordinary-agent corpus the review wrote | 30 | **0** | 0 |

All eleven measured leak rows close. Zero commands newly allow, in any corpus.
Of the 940 cost rows in the generated corpus, **940 carry a `||` or a `|`
immediately before the directory builtin** — i.e. the cost is exactly the shape
the option is aimed at, and it does not spill.

- **Pros.** Closes both findings, and nothing else. Zero cost on ordinary agent
  work and zero cost on the suite's own corpus — this is the cheapest measured
  change in the Circle. Same shape as every other give-up the module already
  makes, so it needs no new concept and no new state: a joiner the model cannot
  read becomes an unknown directory, not a guessed one. It is also the
  fail-closed direction, which is the direction every earlier decision here
  took.
- **Cons, measured.** It cannot tell the control row apart from the leak row —
  `[ -d nope ] || cd build && rm rules/x.md` is a `cd` that genuinely runs, and
  it will deny. That is an over-deny on a shape almost nobody writes (`0` rows
  in both non-generated corpora), with the usual two ways through named in the
  deny reason. It also does **not** address `260804-0839`: the 84 generated
  `if` / `while` / brace-group / pipeline rows that degrade although the shell
  guarantees the `cd` still degrade, measured identically before and after.
- **Residual it leaves.** The model still cannot read an exit status, so it
  still cannot distinguish "reached" from "reached and succeeded". This option
  makes the *reachability* half right and leaves the *success* half where
  `260803-2338` left it.

### 2. Model the and-or list instead of a flat joiner sequence

Replace "each segment carries the operator before it" with a real reachability
model: parse the and-or lists, the pipelines and the compound commands, and
carry per segment whether it is **guaranteed reached given that the command
started**. The directory model then asks that question for the `cd` and for the
write, instead of asking about one adjacent operator each time.

- **Pros.** It is the correct model rather than a proxy for it, and it is the
  only option that also closes `260804-0839` — the over-deny where the shell
  *does* guarantee the `cd`. Measured relief: **84 of 84** generated rows of the
  `if cd X; then W; fi` / `while cd X; do W; done` / `{ cd X; } && W` /
  `cd X && Y | tee W` family deny today and should allow under a reachability
  model. It also makes the `|` half of `260804-0837` fall out of the model as a
  scope fact (a pipeline stage is a subshell, like `(…)` and `$(…)` already are)
  rather than as a special case.
- **Cons.** Much the largest change in the module's history. The lexer is a
  segmenter, not a parser: it emits a flat list with a depth for `$(…)` bodies
  and nothing else, so `if`/`then`/`fi`, `while`/`do`/`done`, `{ … }` and
  pipeline grouping would all have to become structure the segmenter does not
  currently produce. The git classifier consumes the **separate flat
  segmenter** and is structurally insulated (pinned by the gold fixture plus the
  `expect(src).not.toMatch(/\bparseCommand\b/)` source check), so the blast
  radius is bounded to the mutation side — but inside that side it is total.
- **Cost, honestly not measured.** Its deny set on the `||`/`|` rows must equal
  option 1's — a correct reachability model says the same thing about a `cd` the
  shell may have skipped — and its allow set gains the 84-row `260804-0839`
  family. Beyond those two ends, its cost **cannot be measured without
  implementing it**, and this record does not claim a number it did not run.
  Stating a number here is exactly the failure the last two Turns were spent
  correcting.
- **The control row does not improve.** `[ -d nope ] || cd build && rm
  rules/x.md` still denies: reachability is a static property, the exit status
  is not, and no parser recovers it.
- **`until` is the counter-example that keeps this honest.**
  `until cd X; do W; done` runs its body when the `cd` **failed**, so its degrade
  is correct today. Measured: 12 of 12 generated `until` rows deny, and a
  reachability model must keep every one of them denying. The compound-command
  family is not uniform, and an implementation that treats it as uniform
  re-opens the class in a new place — which is what happened in Turns 5 and 7.

### 3. Document both as residuals and change nothing

- **Pros.** Zero cost, zero risk, and the residual list already carries four
  entries of exactly this kind.
- **Cons.** These two are not like the other residuals. `eval "cd rules"`, an
  alias named `cd` and a `source`d script are **out of reach of a textual
  classifier** — no enumeration closes them, and saying so is the honest end of
  the line. `X || cd DIR && <write>` is fully visible: the guard has the whole
  command, resolves every operand, and gets the answer wrong because it asked
  the wrong segment. Documenting a visible, cheap, measured, no-flag bypass is
  the one thing `rules/protected-path-discipline.md` tells agents not to do, and
  it would leave the Circle's summary sentence permanently hedged.
- It is also **already partly done**: this Turn added both to the residual list
  in `rules/protected-path-discipline.md`, marked live and open, precisely so
  nothing ships claiming otherwise while the decision is pending. So option 3 is
  the status quo, not a proposal.

### 4. Option 1 now, option 2 as a separate Circle

Take the ten-line give-up, close both findings, keep the measured zero-cost
result — and file `260804-0839` plus the reachability model as their own unit of
work with its own Grounding, rather than as the tail of a Circle that has run
seven Turns.

- **Pros.** The two findings that are **hazards** close in the same commit as
  the fixes around them, at a cost measured at zero on real work. The one that
  is a **cost** (`260804-0839`, over-deny, no security consequence) waits for
  the change that can do it properly. It also keeps the property every Turn of
  this Circle has kept: no command newly allows.
- **Cons.** The module keeps two facts about a joiner in two places until the
  reachability work happens, which is a shape this Circle has been burned by
  (`260803-2237`, `260803-2039`). Mitigated by writing the give-up as one
  condition at the existing call site rather than as a second model.

## Constraints

Any answer must satisfy all five:

1. **No command may newly allow.** Every Turn of this Circle has held this and
   it is the only reason the boundary claims are worth anything.
2. **Both findings close together or neither does.** They are one fact seen
   twice; closing `||` and leaving `|` would leave the same sentence false.
3. **The shell list is bash *and* zsh**, and a row must be measured in the shell
   that performs its write. `echo hi | cd build && rm rules/x.md` writes in bash
   and not in zsh; a bash-only measurement would have missed
   `260804-0837`'s reach and a zsh-only one would have missed the finding.
4. **The cost is stated as a rule, with measured examples — never as a closed
   list.** Two enumerations shipped in this Circle and both were falsified
   within a day (`issues/260804-0840`). Measure with a generated cross-product,
   not with a corpus harvested from the suite: a harvest can only reproduce what
   the tests already contain.
5. **`until` stays denying.** It is the member of the compound-command family
   whose body runs when the `cd` failed, and it is the cheapest available check
   that an implementation modelled reachability rather than pattern-matched
   `if`.

## Recommendation

**Option 4 — take option 1 now, and give option 2 its own Circle.**

The measurements say this plainly. Option 1 closes eleven measured no-flag
writes to `rules/**`, `agents/**` and `skills/**`, costs **zero** commands on the
suite's own corpus and **zero** on the thirty-row ordinary-agent corpus, and its
940 generated cost rows all carry the `||` or `|` it is aimed at. Nothing newly
allows. Ten lines at a call site that already exists.

Option 2 is the right model and should be built, but not as the eighth Turn of a
Circle whose lesson has been that a large change to this module opens something
elsewhere. It also has a real prize attached — the 84-row `260804-0839` family
is a live over-deny an agent meets on ordinary work (`if cd hooks; then rm -rf
dist; fi`) — which is an argument for planning it properly, not for bolting it
on.

Two notes for whoever implements option 1:

- **Write the condition as "the joiner is one of the safe ones", not as "the
  joiner is `||` or `|`".** `;`, a newline and `start` are safe leading joiners
  (the segment runs unconditionally, and whether the `cd` *succeeded* is already
  the write-side degrade's job); `&&` is safe; `&` as a **leading** joiner is
  safe, because `A & cd B` backgrounds `A` and runs the `cd` in the foreground
  shell. A joiner added to `SegmentJoiner` later is then unsafe by default,
  which is the direction `260803-2338` chose for the write side and the reason
  that test reads `!== "&&"`.
- **The give-up belongs after the scope restore**, for the same reason the
  write-side one does: a `cd` bash itself discarded casts no doubt forward.

---
Answered:
Implemented:
Deferred:
Superseded by:
