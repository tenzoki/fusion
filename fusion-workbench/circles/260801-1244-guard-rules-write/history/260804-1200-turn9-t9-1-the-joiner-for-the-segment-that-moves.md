# Turn 9, T9-1 — the joiner consulted for the segment that MOVES

**Status:** Complete
**Agent:** coder
**Circle:** `circles/260801-1244-guard-rules-write`
**Task:** implement `decisions/260804-0947_o_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md`, option 4 (take option 1 now; the reachability model gets its own Circle)
**Closes:** `issues/260804-0836_p_…` (`||`) and `issues/260804-0837_p_…` (`|`) — one fact seen twice
**Does NOT touch:** `260804-0839` (the over-deny), `260804-1024` (`git -C`), `260804-1025` (the clause at the decision procedure), `hooks/lib/shell-parse.ts`, `paths.ts`, `fs-locator.ts`, `rules-write-exemption.ts`

---

## The three headline answers

**Nothing newly allows.** 0 rows on all three corpora the record used and 0 on a generated
cross-product of 41,656 commands built for this change, in both quoting modes, with the git
classifier's verdicts compared under all four override combinations (0 differences there
too). Structurally that is what the change can do: it only ever calls `degradeUnprovenCd`,
which can only make the directory unknown, and an unknown directory only denies.

**`until cd X; do W; done` still denies**, asserted as its own case with a comment saying
why (its body runs when the `cd` *failed*, so the degrade is correct and must survive the
later reachability work). Measured in both shells: the body runs and the file goes.

**The one-fact-not-two property is checkable, in one line.**
`grep -c '\.joiner' hooks/lib/bash-mutation-guard.ts` returns **1** in code — the single
occurrence is `joinerFacts(segment.joiner)`. Both give-ups read a *field* off the record
that lookup returns; neither compares a joiner to anything. A test
(`the joiner table > keeps one fact about a joiner in one place`) strips comments from the
module source and asserts both halves, so a third comparison cannot be added quietly. The
sixth anti-vacuity mutation adds exactly such a third comparison and that test fails.

---

## What changed

### `hooks/lib/bash-mutation-guard.ts`

One table and two call sites.

`JoinerFacts` / `JOINER_FACTS` / `joinerFacts` (exported, as `MUTATION_VERBS` and
`WRAPPER_PROGRAMS` are, because it is the review surface) carry **one row per joiner** with
two fields:

| joiner | `carriesCdForward` | `movesCallingShell` |
|---|---|---|
| `start`, `&&` | true | true |
| `;`, newline, `&` | false | true |
| `\|\|`, `\|` | false | **false** |

The lookup is a **safe-list**: a joiner with no row answers `false` to both. That is the
inversion the record asked for — the condition reads *"the joiner is one of the safe ones"*,
not *"the joiner is `||` or `|`"* — so a joiner added to `SegmentJoiner` later is unsafe on
both counts until someone argues otherwise and adds a row. It is the same stance
`firstDirArg` takes for flags and `260803-2338` took for the write side.

In the segment walk:

- the existing write-side give-up became `if (!joiner.carriesCdForward && state.moved)`,
  behaviour-identical to the `!== "&&" && !== "start"` it replaced (safe set `{&&, start}`);
- a second give-up runs **after** `applyDirEffect` and **before** the paren restore:
  `if (!joiner.movesCallingShell && state.moved) degradeUnprovenCd(state);`

Placement is load-bearing in both directions. After `applyDirEffect`, because the move has
to have happened before it can be doubted. Before the paren restore, because a `cd` bash
itself discards must take the doubt with it — `(true || cd rules); rm x.md` still resolves
from the project root, and there is a test for it.

**One deliberate departure from the record's sketch.** The record proposed *"remember
`state.moved` before `applyDirEffect` and degrade when the builtin is NEW and the joiner is
`||` or `|`"*. The shipped condition is stated over `state.moved` alone, with no
`movedBefore`. The weaker form leaves a live sibling of the same defect open:

```
cd rules && true || cd /tmp && rm x.md      # bash deletes rules/x.md — measured GONE in both shells
```

Here the write-side give-up correctly takes the directory away at the `||`, and then the
absolute `cd /tmp` **re-proves** it — from a segment bash skipped. With `!movedBefore` the
second give-up does not fire and the row allows. Measured difference between the two forms
on the generated corpus: **8 rows, all of this shape, 0 newly allowing either way** (1,418
vs 1,410 newly denying). Taking the stronger form is the same fact, stated over the model's
state rather than over one segment's novelty. Anti-vacuity mutation 4 reverts it and the
test `denies a cd that RE-PROVES the directory after the model gave it up` fails.

### Tests — `hooks/lib/__tests__/bash-mutation-guard.test.ts`

Eleven new cases in two describe blocks. `npm test`: **1252 passed, 24 files** (1241 at
HEAD, so +11). No test was deleted, weakened or inverted.

`virtual cwd — a cd the shell may never have made`: the `||` family (8 rows), the `|` family
(4 rows, with the zsh row pinned in its own block and a comment saying why — zsh runs the
last pipeline element in the calling shell, so a future edit that special-cased it would
pass a zsh-shaped test and re-open bash), the re-prove sibling, the control row, `until`,
the safe joiners (`;`, `&`, newline, `start`) with their protected-target neighbours so the
allow rows cannot pass vacuously, the subshell-scope case, and six rows of ordinary work.

`the joiner table`: the one-fact source assertion, the unknown-joiner behaviour, and the
table read cell by cell (so a flipped cell fails with the joiner named rather than in
whichever behavioural case happened to depend on it).

### `rules/protected-path-discipline.md` and `README-hooks.md`

Both carried these two leaks as **live, open residuals**. That has stopped being true in
both. The cost is stated as a rule with labelled examples, never as a closed list:

- the rule statement now asks the same question of the moving segment as of the writing one,
  with the joiner table written out in prose and *"anything not in this table counts as no
  to both"* stated explicitly;
- the decision procedure gained a question — *"is the joiner in front of the builtin's own
  segment one that moves your shell?"* — **in front of** the existing ones, which are
  unchanged in wording (see the note on `260804-1025` below);
- a third surprising word joins "reachable" and "unknown": **"written", not "run"** — the
  guard reads a `cd` that may never execute exactly as it reads one that does, which is why
  the control row `[ -d nope ] || cd build && rm out.js` denies although its `cd` runs;
- six rows added to the illustration block, which already says the set is open;
- "two honest edges, both open" became "one honest edge, still open, and it costs rather
  than leaks" (`260804-0839`), with `until` named there as the reason that edge needs a
  model rather than an exemption;
- the residual bullet that stated the `&&` premise as a live hole now states what is left of
  it: the ordinary give-up behaviour in a second place, erring toward deny.

Every illustration row in both documents was run through the classifier: **35 of 35 behave
as documented**.

---

## The measured cost, both directions

| Corpus | rows | newly DENY | newly ALLOW |
|---|---|---|---|
| A. every quoted string in the 24 test files **at HEAD** | 4,424 | **0** | **0** |
| A′. the same harvest **after** this Turn's tests | 4,489 | 15 | 0 |
| B. generated cross-product built for this change | 41,656 | **1,420** | **0** |
| C. 30 rows of ordinary agent work | 30 | **0** | **0** |

A′'s 15 are the rows this Turn's own tests introduce, which is the point corpus A cannot
escape: a harvest reproduces what the suite contains and can never measure a cost. It is
reported because omitting it would look like the harvest was chosen for its answer.

**The shape of the 1,420, checked structurally rather than by regex.** Every newly-denying
row was re-parsed with `parseCommand` and asked whether it contains a segment that both
names a directory builtin and carries `||` or `|` as its own leading joiner. On the shape
probe's corpus (41,648 rows — the same generator minus eight hand-written extras):
**1,418 of 1,418**, zero rows whose moving segment carries any other joiner. The two rows
making up the difference to 1,420 are the extras `true || cd build && rm rules/x.md` and
`echo hi | cd build && rm rules/x.md`, which are the leak rows themselves. The cost is
exactly the shape the rule names and does not spill.

**Cost stated as a rule.** A `cd`, `chdir`, `pushd` or `popd` on a `||`- or `|`-joined
segment gives the working directory up from that point, so any later *relative* write denies
fail-closed. Two families of example, both open sets:

```
DENY   true || cd build && rm out.js            # the cd may never have run
DENY   echo hi | cd build && rm out.js          # bash subshells a pipeline stage
DENY   [ -d nope ] || cd build && rm out.js     # the cd DOES run here — the over-deny
DENY   cd rules && true || cd /tmp && rm x.md   # an absolute cd cannot re-prove it either

allow  true; cd build && rm out.js              # `;` reaches the cd, `&&` carries it on
allow  ls & cd build && rm out.js               # `A & cd B` runs the cd in the foreground
```

The over-deny is unavoidable and it is named as such in both documents: what separates the
control row from the leak row is an exit status, and no static classifier will ever have
one. It cost **0** rows in either non-generated corpus.

---

## Real shell, real guard

Every row below: the guard verdict from the **real hook subprocess** in one fresh throwaway
project, and the shell effect from a **second** fresh project per shell — the verdict and the
effect are never measured in the same tree. Seeded `rules/x.md`, `agents/coder.md`,
`skills/demo/SKILL.md`. **No deny read `[HALTED]`** (each row gets its own project, so no
row can inherit another's escalation count).

```
GUARD  bash effect                     zsh effect       command
DENY   rules/x.md:GONE                 GONE             true || cd build && rm rules/x.md
DENY   rules/x.md:OVERWRITTEN          OVERWRITTEN      true || cd build && echo pwned > rules/x.md
DENY   rules/x.md + rules/:GONE        GONE             true || cd build && rm -rf rules
DENY   rules/x.md:GONE                 GONE             true || cd build && mv rules/x.md /tmp/…
DENY   rules/x.md:OVERWRITTEN          OVERWRITTEN      true || cd build && sed -i '' s/…/…/ rules/x.md
DENY   agents/coder.md:GONE            GONE             true || cd build && rm agents/coder.md
DENY   skills/demo/SKILL.md:OVERWRITTEN OVERWRITTEN     true || cd build && echo pwned > skills/demo/SKILL.md
DENY   rules/x.md:GONE                 GONE             mkdir -p build || cd build && rm rules/x.md
DENY   rules/x.md:GONE                 intact           echo hi | cd build && rm rules/x.md
DENY   rules/x.md:GONE                 intact           true | cd build && rm rules/x.md
DENY   rules/x.md:OVERWRITTEN          intact           ls | cd build && echo pwned > rules/x.md
DENY   agents/coder.md + agents/:GONE  intact           ls | cd build && rm -rf agents
DENY   rules/x.md:GONE                 GONE             cd rules && true || cd /tmp && rm x.md
DENY   intact                          intact           [ -d nope ] || cd build && rm rules/x.md   # the control
DENY   rules/x.md:GONE                 GONE             until cd nope; do rm rules/x.md; break; done
ALLOW  intact                          intact           cd hooks && npm test
ALLOW  intact                          intact           cd build && rm -rf out
ALLOW  intact                          intact           rm -rf node_modules
```

Twelve leak rows measured, all closed; the issues' own tables carry eight and four. Each row
is measured in the shell that performs its write: the four `|` rows write in bash and not in
zsh, so a zsh-only measurement would have called them harmless and a bash-only one would
have missed that the disagreement exists. The classifier takes bash's answer for both, which
is why the zsh rows are pinned separately in the suite.

The thirteenth row is not from either issue — it is the re-prove sibling this
implementation's stronger condition closes, and it deletes the file in **both** shells.

---

## Anti-vacuity, by mutation

Six mutations, each the plausible wrong version of one claim. Every one is caught, by the
test that states the claim:

| Mutation | Tests that fail |
|---|---|
| the move-side give-up removed (the pre-fix module) | 4 — the `\|\|` family, the `\|` family, the re-prove row, the control row |
| `\|` marked as moving the calling shell (zsh's answer, not bash's) | 3 — the `\|` family, the re-prove row, the table cell |
| the unknown joiner falls through as **safe** | 1 — `answers a joiner it has never heard of with 'neither'` |
| the condition stated over "a builtin new in this segment" | 1 — `denies a cd that RE-PROVES the directory…` |
| `;` marked as carrying a `cd` forward | 7 — including `keeps until … denying` and five pre-existing separator cases |
| a third place compares a joiner literal | 3 — including `keeps one fact about a joiner in one place` |

`tsc --noEmit` clean after the battery restored the file.

---

## Findings to report, none of them fixed here

- **`260804-0839` is unrelieved, as required.** The 84 generated `if` / `while` / brace-group
  / pipeline rows that degrade although the shell guarantees the `cd` deny identically before
  and after. Nothing in this change touches them; they need the reachability model.
- **`260804-1025` (not mine, a later session owns it) is no longer reproducible by its own
  steps, and its cited clause is untouched.** That issue reports that the decision procedure
  answers "the model stays exact" for the two commands that delete a rule. Its question 2 is
  verbatim as it was — it is now question 3, and the new question 2 in front of it stops both
  commands first, so the procedure returns the correct answer. The clause the issue names is
  still loosely worded on its own; whoever owns it should re-read it against the new
  ordering rather than assume it is closed.
- **`hooks/lib/shell-parse.ts:129-131` now carries a false sentence** — the `SegmentJoiner`
  docstring says of the two shapes *"both are open and argued in [the decision record]"*.
  They are closed. That file was explicitly out of scope for this task ("beyond reading it"),
  so it is reported rather than edited. It is a comment, with no behavioural effect, and the
  fix is one clause.
- **`260804-1024` (`git -C rules rm x.md`) is untouched and still allows.** The boundary
  sentence this Circle wants needs it as well as this change; the reconciliation note on the
  decision record already says so.

---

## Housekeeping

- `hooks/dist/` **tracked** files restored to HEAD with `git checkout -- hooks/dist` after
  the final measurement run. Plan Step 10 owns the rebuild and the version bump; neither was
  done here. The four **untracked** `dist/` files (`fs-locator`, `rules-write-exemption`)
  predate this session and were left where they were.
- Nothing was committed. The decision record is left at `_o_` for the orchestrator to move to
  `_i_` with the commit hash — this Circle has already produced one unresolvable citation, so
  no hash is guessed here. The two issues carry a `Resolved:` note and are renamed `_p_` →
  `_c_`, with the same reason for not citing a hash.
- Measurement scripts, the materialised HEAD baseline and the weak-condition variant are in
  the session scratchpad (`t9-measure.ts`, `t9-shape.ts`, `t9-shell.sh`, `t9-antivac.sh`,
  `t9-doccheck.ts`).

## Files changed

```
hooks/lib/bash-mutation-guard.ts                  +141 -18   one table, two call sites, three docstrings
hooks/lib/__tests__/bash-mutation-guard.test.ts   +194  -0   11 cases in 2 describe blocks, nothing removed
rules/protected-path-discipline.md                 +61 -36   the rule, the four questions, the illustrations, the edges, the residual
README-hooks.md                                     +1  -1   the `cd` paragraph: the second question, the measured cost, what stays open
```
