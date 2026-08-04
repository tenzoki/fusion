# Should the guard degrade its directory model after a `cd` it cannot prove succeeded?

---
**Domain:** code
**Status:** open
**Filed by:** coder (task T6-1, `circles/260801-1244-guard-rules-write`)
**Cross-references:**
`issues/260803-2238_o_the-directory-model-assumes-every-cd-succeeds-so-a-cd-to-a-nonexistent-directory-is-a-one-segment-bypass.md`
(the finding this answers),
`issues/260803-1835_o_a-redirection-after-an-unmodellable-cd-overwrites-any-protected-file-with-no-flag.md`
(the reason option 1 does not close all four measured escapes on its own),
`reviews/260803-2240-coderev-turn5-wrapper-walk-and-pushd-rotation.md` `### Recommended sequencing`,
`hooks/lib/bash-mutation-guard.ts:1887-1914` (the `word` arm), `:1291-1303` (`resolveDir`),
`:2193-2245` (the segment loop), `hooks/lib/shell-parse.ts:102-112` (`ParsedSegment` — the
shape that would have to change),
`decisions/260803-1803_a_should-the-guard-degrade-its-working-directory-model-when-cdpath-is-set-in-the-ambient-environment.md`
(the same question, answered once already for a different cause).

---

## Question

The classifier models where the shell is standing so it can resolve a relative operand. It
has no filesystem access, so it cannot know whether a `cd` **succeeded** — and it assumes
success across every segment separator.

After `&&` the assumption is free: the shell enforces it, because a failed `cd` returns
non-zero and the rest of the segment chain never runs. After `;`, `||`, `&` or a newline the
shell runs the next segment **from where it never left**, and the guard runs it from a
directory that does not exist. That is a one-segment, no-flag, no-wrapper bypass of the whole
protected list — `cd nonexistent; rm rules/x.md` is allowed and the shell deletes the rule —
and it was on no residual list until this task added it.

It must be decided now because it is live and trivially constructible, and because the
obvious repair costs a shape agents genuinely write. **Every number below is measured**, not
estimated; the method is stated with each.

## Options

### 1. Condition the assumption on the separator

Keep the model exact after `&&`; call `unmodelled(state)` when a modelled `cd`/`pushd` is
followed by a segment the shell would run regardless.

- **Pros.** Closes three of the four measured escapes. Exact where the shell guarantees
  exactness, and gives up precisely where it does not — the same stance the rest of the
  directory model already takes. The give-up mechanism already exists and can only deny.
- **Cons, measured.**
  - **It needs a change to the shared lexer.** `parseCommand` discards the separator
    character entirely (`shell-parse.ts:654-670` — `;`, `|` and `&` all just call `flush()`),
    so `ParsedSegment` carries `text` and `depth` and nothing else. Direction 1 cannot be
    written without adding the joining operator to that type. `ParsedSegment` is referenced
    3× in `shell-parse.ts` and consumed by both Bash classifiers; the git classifier reads
    segments through the same call. This is the only option here that widens a shared type.
  - **The cost surface is larger than "a `;`-joined `cd`".** In `cd hooks && npm run build;
    rm -rf dist` the `cd` is `&&`-joined to the next segment, but `rm -rf dist` is reached
    unconditionally — so the degrade must fire for it. Measured verdict moves (real
    classifier, shipped protected list, the degrade simulated by forcing the same unknown
    state the option produces):

    ```
      today  degraded  command
      allow  DENY      cd build; rm out.js
      allow  DENY      cd docs; rm ../notes.txt
      allow  DENY      mkdir -p build && cd build; rm out.js
      allow  DENY      cd hooks && npm run build; rm -rf dist
      allow  DENY      cd build || exit 1; rm out.js
    ```
  - **It does not close the fourth escape.** `cd nope || true; echo pwned > rules/x.md`
    measures `allow` both before and after: the target is a **redirection** on a program
    outside the verb table, which is `260803-1835`, not this. Option 1 alone leaves the
    overwrite spelling of this bypass open.

### 2. Document it and leave the model alone

Add the row to both residual lists, say what `&&` buys, tell the agent that `cd X && …` is
the form the guard can follow.

- **Pros.** Costs nothing. Consistent with how `eval`, the alias family and the `case`-arm
  residual are handled. Already done as of this task — the row is now in
  `rules/protected-path-discipline.md` and `README-hooks.md`, marked as awaiting this
  decision, so option 2 is the current state and needs no further work.
- **Cons.** Leaves a trivially constructible bypass of the entire protected list open with
  only prose against it. Unlike the `eval`/alias family, this one needs the classifier to
  **see** the `cd` — it is not a limit of textual classification, it is an assumption the
  classifier chose to make.

### 3. Degrade only where the assumption is load-bearing

Degrade only for an unconditionally-reached segment whose operand is **relative** and whose
resolution depends on a `cd` earlier in the same command.

- **Pros.** In principle keeps `cd build; rm out.js` (which resolves against a `cd` whose
  target the guard can name) while denying `cd nonexistent; rm rules/x.md`.
- **Cons.** The distinction does not survive contact: both commands are a modelled `cd`
  followed by a relative operand, and the guard cannot tell `build` from `nonexistent`
  without asking the filesystem. To separate them it would have to ask **whether the
  directory exists** — which is option 4 under another name. Costed and found to be option 4
  with extra machinery.

### 4. Ask the filesystem whether the `cd` target exists

`CWD_UNKNOWN` when the operand does not resolve to an existing directory.

- **Pros.** Would keep `cd build; rm out.js` exact and deny `cd nonexistent; rm rules/x.md`,
  which is the ideal split. Closes the fourth escape too, because the redirect target's
  directory becomes known.
- **Cons.** Makes a classifier that is **textual by design** touch the filesystem. That
  design property is load-bearing three ways: it is what makes the module pure and
  unit-testable without the hook firing (`command-word.ts` states this as a module
  invariant); it is the stated reason the ambient-`CDPATH` degrade does not probe per entry
  (`260803-1803`, already decided against a filesystem probe); and it introduces a
  time-of-check/time-of-use gap — the guard's `stat` and the shell's `chdir` are different
  moments, so `mkdir -p build && cd build; …` would be judged against a directory that does
  not exist yet at check time. That last one is not hypothetical: it is exactly the shape
  the review named as the thing not to break.

## Constraints

Any answer must satisfy:

1. **No fail-open.** Whatever is chosen, no command may newly *allow* a write the shell
   performs on a protected path.
2. **`cd X && …` must stay exact.** It is the dominant form (measured below) and the guard's
   modelling of it is what makes the whole directory model worth having.
3. **The classifier stays pure**, or the decision explicitly and knowingly reverses that —
   `260803-1803` decided the same question one way already, and reversing it here without
   saying so would make two decisions disagree.
4. **The four measured escapes must be closed, or the survivors named.** Option 1 closes
   three; the fourth belongs to `260803-1835`.

## Measured: how ordinary is the shape this would degrade?

The review asked for the frequency of `mkdir -p build && cd build && …` specifically. Method:
every `cd`/`chdir`/`pushd` in command position, classified by the separator that follows,
across three corpora — the repository's own shell scripts, and the guard's own test corpus
(1299 extracted command strings).

**A. This repository's shell scripts** (`bin/*`, `install.sh`) — 8 directory builtins:

| Form | Count |
|---|---|
| `cd … && …` | 4 (all `SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd -P)"`) |
| `cd "$root"` on its own line, unguarded | 4 (all in `bin/fusion-commit-lock`) |
| `mkdir … && cd …` or `mkdir …; cd …` | **0** |

The four unguarded ones cost nothing under any option: their operand is `"$root"`, which is
already unresolvable, so the guard already treats the directory as unknown.

**B. The guard's own test corpus** — 308 of 1299 command strings carry a directory builtin:

| Separator after the directory builtin | Count | Under option 1 |
|---|---|---|
| `&&` | 272 (88%) | untouched — the shell guarantees it |
| end of command | 28 (9%) | degrade fires, **0** have a later relative operand |
| `;` | 8 (3%) | degrade fires, 7 have a later relative operand |
| `\|\|`, `\|`, `&` | 0 | — |

Counting an unconditional separator **anywhere** after the builtin rather than immediately
after it — the true cost surface, per `cd hooks && npm run build; rm -rf dist` — raises it to
**20 of 308 (6.5%)**. Most of those 20 still move no verdict, because the unconditionally
reached segment writes nothing relative (`pushd hooks >/dev/null && npm test; popd`).

**And the shape the review named is not at risk.** Both occurrences of it in the corpus are
written `&&` throughout:

```
  mkdir -p build && cd build && rm out.js
  cd /tmp && mkdir -p work && cd work && rm -rf out
```

Both measure `allow` before and after the simulated degrade. The `mkdir` idiom is written
with `&&` because that is what makes it correct in the shell too — the `cd` must not run if
the `mkdir` failed. The at-risk variant is `mkdir -p build && cd build; …`, which occurs
**0 times** in either corpus.

## Recommendation

**Option 1, and file the lexer change as its own step rather than smuggling it in.**

The frequency measurement does not support the worry that motivated deferring this. The shape
the review named is written with `&&` in 100% of its measured occurrences, because `&&` is
what makes it correct in the shell as well; 88% of all directory builtins in the corpus are
`&&`-joined; and the repository's own unguarded `cd`s are already unknown to the guard for an
unrelated reason. The real cost is `cd build; rm out.js` and `cd hooks && npm run build;
rm -rf dist` — two shapes an agent does write, both with an absolute path or an `&&` as the
way through, and both diagnosable because the deny names the working directory.

Against that: a no-flag, no-wrapper, one-segment bypass of the entire protected list.

Two things the answer should be explicit about, because they are the parts a later reader
will stop at:

- **Option 1 leaves the redirect spelling open** (`cd nope || true; echo pwned >
  rules/x.md`). It is `260803-1835`, it is already the residual every other directory give-up
  feeds into, and this decision should be taken **with** it rather than before it. Measured
  separately: closing `260803-1835` in its own direction 1 (deny a redirect target that is
  unresolvable *because of the working directory*, keep allowing one unresolvable because of
  the *token*) moves exactly **two** pinned assertions in the whole suite — `cd $D && echo x
  > y.md` and `cd $D && echo x > out.log` — and **zero** rows of the 119-command
  ordinary-agent corpus.
- **Option 4 is the one that looks best and should still be refused.** It gives the ideal
  split, and it costs the property that makes this module reviewable at all, contradicts an
  answered decision, and fails on `mkdir -p build && cd build` by construction. If it is ever
  taken, it must be taken as a change to the module's design premise, in the open.

---
Answered:
Implemented:
Deferred:
Superseded by:

## Answer

**Option 1, taken together with `260803-1835`.**

Chosen by the user at the Turn 6 closing gate, 2026-08-04, on the coder's reading that the two
close together or not at all: option 1 leaves the redirection escape open, and `260803-1835`
alone leaves the three verb escapes open.

The trade accepted: five measured commands that work today begin to deny, none of them present
in this repository's own scripts, against a bypass of the entire protected list that needs no
flag, no symlink and one extra segment. The user was shown the cost table and the caveat that
option 1 closes three of four escapes on its own.

The `&&` asymmetry is the reason this is worth the cost rather than a blanket give-up: after
`&&` the shell guarantees the `cd` succeeded, so the model stays exact for the form agents
overwhelmingly write, and gives up only where the shell itself guarantees nothing.

## Measured after implementation (task T7-1)

The cost table above was produced by simulating the degrade. Re-measured against
the real classifier with option 1 applied, over HEAD's own 4203-command test
corpus, **the five rows are exactly right** — no sixth shape moved, and nothing
newly allows. Option 1 in isolation moves six verdicts: the five costs above,
plus `cd nonexistent; rm rules/x.md`, the bypass it was written to close.

The fourth escape closed as predicted only once `260803-1835` was closed with
it: `cd nope || true; echo pwned > rules/x.md` allows under either change alone
and denies under both, which is the claim this record was answered on.

The separator degrade gets its own deny reason (`unprovenCdReason`), because the
advice the existing unknown-directory reason gives — rewrite the operand, drop
the `cd` — is not the one that helps here. The `cd`'s operand is already a
literal; `&&` is the way through. A directory that was ALREADY unknown for a
stronger reason (`pushd -P`, an ambient `CDPATH`) keeps that reason.

---
Answered: this record, `## Answer` — user chose option 1 plus `260803-1835` at the Turn 6 closing gate; the model may assume a `cd` succeeded only where the shell guarantees it.
Implemented: `hooks/lib/shell-parse.ts` (`SegmentJoiner`, `ParsedSegment.joiner`) + `hooks/lib/bash-mutation-guard.ts` (`ShellState.moved`, `degradeUnprovenCd`, the segment-boundary check in `classifyBashMutation`), task T7-1 — the directory model is given up at any joiner that is not `&&` once a directory builtin has run in the current scope.
