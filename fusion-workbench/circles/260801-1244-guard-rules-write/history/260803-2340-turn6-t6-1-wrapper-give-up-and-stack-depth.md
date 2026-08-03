# Turn 6, T6-1 — the wrapper give-up, the stack's depth, and a decision instead of a third fix

**Date:** 2026-08-03 23:40
**Agent:** coder
**Circle:** `circles/260801-1244-guard-rules-write`, Turn 3 of this session (the Circle's sixth)
**Task:** T6-1 — close `260803-2236` (High, regression), `260803-2237` (High, pre-existing);
file `260803-2238` (High) as a decision rather than a patch
**Source review:** `reviews/260803-2240-coderev-turn5-wrapper-walk-and-pushd-rotation.md`
**Suite:** `npm test` — 1197 passed, 24 files, green (was 1182)
**Status:** Complete

---

## The three sentences

**Fix shape for finding 1: the stricter one** — `runsBuiltins` is deleted outright, and the
directory model follows a `cd` only when the segment names it **directly**: no wrapper hop at
all, and no path separator in the command word. **Yes, six commands newly allow**, all of
them redirections, all of them `260803-1835` reached by one more route — measured in both
trees, not argued. **The `pushd` half of `9aacab5` survives**: every depth row re-measured in
bash and zsh, every verdict unchanged, and the four surviving idioms still allow.

---

## Finding 1 — `runsBuiltins`

### What I did and why

The issue offered two directions. I took the second (give up on every wrapper) and added a
clause neither direction named (give up on a path-spelled builtin). `WrapperSpec.runsBuiltins`
is gone; `Invocation.reachesBuiltin` is now

```ts
return { name, args, reachesBuiltin: !viaWrapper && !raw.includes("/") };
```

`raw`, not `name`, because `programName` has already thrown the path away and the path is the
whole question.

**Why not direction 1** (keep `builtin`, which no shell and no spelling disagrees about).
Direction 1 is cheaper — it would have kept two of the six newly-allowing rows denying. I
rejected it because it keeps one shell-dependent modelling assertion alive, and the review's
own generalisation is that "the same sentence would be wrong for any future
`runsBuiltins`-shaped fact". Keeping one such row keeps the shape as precedent: the next
maintainer reads "we mark the wrappers that run builtins" and adds a row. After direction 2,
`command-word.ts` carries no claim about any shell at all, which is a much smaller review
surface than one correct claim plus a warning not to add a second.

**Why not a revert.** The task invited it and it is the wrong answer. Reverting the wrapper
walk restores `command cd rules && rm x.md` → allow, which is `260803-2038`, a measured High.
Direction 2 is not a revert: the walk stays, so the model still *sees* the directory builtin
behind the wrapper — it just declines to say where the shell went. That closes `2038` in the
fail-closed direction and `2236` in the same motion.

**The general lesson, stated where it will be read.** A give-up can only deny. Modelling is
bidirectional, because an asserted move relocates every later relative operand and can move it
*off* the protected list as easily as onto it. Turn 5 added both in one commit and tested with
one probe shape. That sentence is now in the `applyDirEffect` give-up comment, in the module
header, and in the test that replaced the one asserting the opposite.

### The twelfth row, found while bounding

`/usr/bin/cd` is a real binary on macOS. It changes its own process's directory and exits; the
shell never moves. `programName` mapped it to `cd` and the model followed it. Measured in both
shells:

```
  /usr/bin/cd sub    bash -> did NOT move    zsh -> did NOT move
  \cd sub            bash -> moved           zsh -> moved
  'cd' sub / "cd"    bash -> moved           zsh -> moved
```

So the clause is worded over the **slash**, not over quoting: quoting suppresses alias
expansion and reserved-word recognition, and `cd` is a builtin rather than a reserved word, so
it is still found. `time` is the opposite — it *is* a reserved word, which is why `'time'` and
`\time` demote it to `/usr/bin/time`. Reading that asymmetry backwards is what produced the
regression.

`/usr/bin/cd build && rm rules/x.md` allowed at `cb2c8ad` as well (I read `applyDirEffect` at
that commit: same `programName(raw)` erasure), so it is **pre-existing**, not part of the
regression.

### Measured — the eleven regression rows

Real guard subprocess through the harness, one fresh throwaway project per row, shipped
protected list, no flag, no deny reading `[HALTED]`. `effect` is the same command in a
*second* fresh project through the named real shell.

```
  9aacab5  T6-1   shell  effect  command
  allow    DENY   zsh    GONE    command cd build && rm rules/x.md
  allow    DENY   zsh    GONE    command cd docs && rm agents/coder.md
  allow    allow  zsh    OVERW.  command cd build && echo pwned > rules/x.md   <-- NOT CLOSED
  allow    DENY   zsh    GONE    command command cd build && rm rules/x.md
  allow    DENY   zsh    GONE    command cd build; rm rules/x.md
  allow    DENY   bash   GONE    /usr/bin/time cd build && rm rules/x.md
  allow    DENY   zsh    GONE    /usr/bin/time cd build && rm rules/x.md
  allow    DENY   bash   GONE    \time cd build && rm rules/x.md
  allow    DENY   zsh    GONE    \time cd build && rm rules/x.md
  allow    DENY   bash   GONE    'time' cd build && rm rules/x.md
  allow    DENY   bash   GONE    "time" cd build && rm agents/coder.md
```

Plus the twelfth-row class, all newly denying:

```
  DENY  bash/zsh  GONE   /usr/bin/cd build && rm rules/x.md
  DENY  zsh       GONE   /bin/cd build; rm agents/coder.md
```

Controls, unmoved: `command cd rules && rm x.md` DENY, `sudo cd rules && rm x.md` DENY,
`/usr/bin/env cd build && rm rules/x.md` DENY, `(command cd build) && rm rules/x.md` DENY
(subshell scoping discards the `cd`), `builtin cd rules && rm x.md` DENY,
`time cd agents && rm coder.md` DENY, `command cd skills/demo && rm SKILL.md` DENY.

### The eleventh row, stated plainly

**`command cd build && echo pwned > rules/x.md` is not closed by this task.** After the fix it
is held open by `260803-1835` alone: the working directory is *admitted* unknown, and the
fail-closed pass stops at the verb table's edge, so a `>` target on `echo` is never reached.
Its wrapper-free siblings behave identically —

```
  allow  bash  OVERWRITTEN  pushd -n docs && echo pwned > agents/coder.md
  allow  bash  intact       cd $D && echo pwned > rules/x.md
```

— which is what shows the cause is 1835 and not the wrapper walk. I did not close 1835:
the issue itself says doing so reverses a documented decision (`260801-1859`) with a pinned
test and an agent-facing doc line, and that "taking it silently inside another task is what
the Circle has been correcting for four Turns". I costed it instead, below.

### Newly ALLOWING — the direction `9aacab5` claimed without checking

Six rows. Measured by checking out HEAD's two source files, running the rows, restoring mine,
and running them again — not inferred from the code:

```
  9aacab5  T6-1   shell  effect       command
  DENY     allow  bash   OVERWRITTEN  command cd rules && echo pwned > x.md
  DENY     allow  bash   OVERWRITTEN  builtin cd rules && echo pwned > x.md
  DENY     allow  zsh    OVERWRITTEN  builtin cd rules && echo pwned > x.md
  DENY     allow  bash   OVERWRITTEN  time cd agents && echo pwned > coder.md
  DENY     allow  zsh    OVERWRITTEN  time cd agents && echo pwned > coder.md
  DENY     allow  bash   OVERWRITTEN  command cd skills/demo && printf '' > SKILL.md
```

(`/usr/bin/cd rules && echo pwned > x.md` also moves DENY→allow, but the real shell leaves
`rules/x.md` intact, so nothing is lost there.)

Every one is a redirection, and every one is `260803-1835`. **Its reach does not grow** — it
was already the whole protected list with no flag, through `pushd -n docs && echo pwned >
agents/coder.md`, which allowed before this Turn and allows now. What grows is its entrance
set. The verb spelling of all six still denies.

This is the honest trade: ten verb-route escapes closed, six redirect-route entrances opened
into a hole that was already fully open and that one change closes entirely. I would not have
taken it if 1835's reach had grown, and it does not.

**And it is structural, not a slip.** *Any* give-up on a directory feeds 1835 — the moment the
guard admits it cannot place the shell, a `>` target becomes unresolvable-because-of-the-cwd
and the bound lets it through. Every future give-up will add entrances too. That makes 1835
the single remaining consumer-visible cost of the module's give-up mechanism, which is a
reason to raise its priority rather than a reason not to give up.

### Cost of closing 1835, measured so the next Turn does not have to

I applied its direction 1 (reach a redirect target that is unresolvable **via the working
directory**; keep allowing one unresolvable via the **token**, which is the `> "$LOG"` idiom
`260801-1859` protected) and ran the suite. Exactly **two** assertions move, and **zero** rows
of the 119-command ordinary-agent corpus:

```
  cd $D && echo x > y.md        allow -> DENY
  cd $D && echo x > out.log     allow -> DENY
```

Both are the pinned statement of the `260801-1859` decision. So the cost is not a
false-positive budget — it is the decision itself. Reverted; recorded on the issue.

---

## Finding 2 — the stack's depth

**Neither candidate direction. A type.**

```ts
type DirStack =
  | { kind: "known"; entries: Cwd[] }   // depth exactly the shell's
  | { kind: "unknown" };                // contents AND depth unknowable
```

`unmodelled()` assigns `STACK_UNKNOWN`, so there is no length left to preserve and the
`.map(() => CWD_UNKNOWN)` shape cannot be written back. `popd` on an unknown stack yields
`CWD_UNKNOWN` rather than reading its own emptiness as bash's stay-put no-op; `pushd` onto one
leaves it unknown.

Direction 1 (a `stackUnknown` boolean beside the array) is a second fact that can disagree
with the first — the same shape as the defect. Direction 2 (sink the whole state) would stop
an absolute `cd` re-proving the CWD, which is correct and costs real work; only the **stack**
needs to be permanently unknown.

Measured, one fresh project per row, `{ROOT}` substituted identically into both runs:

```
  DENY  bash  rules/x.md GONE  cd docs && pushd -n .. && cd {ROOT}/build && popd && rm rules/x.md
  DENY  bash  coder.md GONE    cd docs && pushd -n .. && cd {ROOT}/build && popd && rm agents/coder.md
  DENY  bash                   cd docs && popd -n; cd {ROOT}/build && popd && rm rules/x.md   (the mirror)
```

Discriminator, still allowing: `cd docs && pushd .. && cd {ROOT}/build && popd && rm
rules/x.md` — with a *modelled* `pushd` the model and bash both end in `docs/`, and the
give-up did not become a blanket. `cd $D && cd /abs/build && rm out.js` and `pushd -n docs &&
cd /abs/build && rm out.js` also still allow: an absolute `cd` still re-proves the working
directory.

**Newly allowing: none**, and by construction — the change replaces a known stack with an
unknown one, and an unknown stack can only make a later `popd` less certain.

### The recipe, answered rather than rewritten

The audit recipe has been wrong twice, both times because it enumerated **writes to fields**
while the invariant is a property of the **state** — and a recipe with a gap reads exactly
like a recipe without one, which makes a third attempt worse than none. So there is no third
recipe. The `applyDirEffect` docstring now states what the **types** carry:

> Every field of `ShellState` has an "I don't know" value covering the WHOLE field rather than
> its contents. `cwd`/`prev` are `Cwd`, whose `unknown` arm carries no directory; `dirStack` is
> `DirStack`, whose `unknown` arm carries no entries **and no depth**; `physical`/`cdpath` are
> monotone booleans where `true` IS the don't-know.

A reviewer checks four type declarations; the compiler checks them on every build. And the
question to ask of a future field is written down: what is its whole-field unknown, and does
`unmodelled` assign it? The two things types cannot certify are named in the same docstring —
that the function is REACHED, and that a proven directory is where the shell is standing —
because those are where findings 1 and 3 live.

I argued this both ways before choosing. The recipe's virtue was that it caught a write the
prose had forgotten; its vice is that it runs when someone remembers, over a function that
grows, and it has now shipped with a gap twice. The type runs on every build and cannot ship
with this gap at all. That is not a general claim that types beat recipes — it is that *this*
property is a property of a field's shape, which is exactly what a type expresses.

---

## Finding 3 — deliberately not implemented

`decisions/260803-2338_o_should-the-guard-degrade-its-directory-model-after-a-cd-it-cannot-prove-succeeded.md`.
Four options, each costed by measurement. The three results that change the question:

1. **The shape the review worried about is not at risk.** Both occurrences of
   `mkdir -p X && cd X && …` in the guard's corpus are written `&&` throughout and measure
   `allow` before and after a simulated degrade — because `&&` is what makes the idiom correct
   in the shell too. The at-risk variant `mkdir -p build && cd build; …` occurs **0** times in
   this repository's scripts or in the test corpus. Of 308 directory builtins in the corpus,
   272 (88%) are `&&`-joined; 28 sit at end-of-command with no later relative operand; 8 are
   `;`-joined. The repository's own four unguarded `cd`s are all `cd "$root"` in
   `bin/fusion-commit-lock`, already unknown to the guard for an unrelated reason — cost zero.
2. **Direction 1's cost surface is larger than the issue states.** `cd hooks && npm run build;
   rm -rf dist` has an `&&`-joined `cd` and an unconditionally reached later segment, so the
   degrade must fire for it. Counting an unconditional separator anywhere after the builtin:
   20 of 308 (6.5%). Measured verdict moves: `cd build; rm out.js`, `cd docs; rm ../notes.txt`,
   `mkdir -p build && cd build; rm out.js`, `cd hooks && npm run build; rm -rf dist`,
   `cd build || exit 1; rm out.js`.
3. **Direction 1 closes only three of the four measured escapes.** `cd nope || true; echo pwned
   > rules/x.md` measures `allow` before and after — it is a redirection, so it is 1835 again.
   The two decisions should be taken together.

Direction 3 as filed was costed and collapses into direction 4: the guard cannot tell
`cd build` from `cd nonexistent` without asking the filesystem. Direction 4 is the one that
looks best and should still be refused — it costs the module's textual-by-design property,
contradicts the already-answered `260803-1803`, and fails on `mkdir -p build && cd build` by
construction (check time is not chdir time).

Recommendation recorded: direction 1, taken together with 1835, with the lexer change filed as
its own step. `ParsedSegment` carries `text` and `depth` only — `parseCommand` discards the
separator character entirely — so direction 1 cannot be written without widening a type both
Bash classifiers consume. That is a cost the decision now names.

The residual is meanwhile documented in both shipped documents, marked as awaiting the
decision. That is also exactly option 2, so choosing option 2 requires no further work.

---

## Tests

`npm test` — **1197 passed, 24 files, green.** Up 15 from 1182.

**Anti-vacuity, by breaking each fix and watching its own tests fail** — not by reading them:

| Mutation | Failures |
|---|---|
| a wrapper may reach `cd` again (the `9aacab5` shape) | **8** — 2 unit, 6 integration |
| the path-spelling clause dropped (`/usr/bin/cd` is a builtin again) | **2** — 1 unit, 1 integration |
| `unmodelled()` zeroes values and keeps depth (the pre-existing defect) | **4** — 3 unit, 1 integration |
| `popd` on a given-up stack is a no-op again | **4** — 3 unit, 1 integration |

Each mutation fails only its own tests, so the two fixes are independently pinned. The
standing guard still holds: `rm -f rules/x.md` must block in a throwaway project or every
denial assertion is vacuous, and each new integration case asserts its deny is not `[HALTED]`
**and** that the named real shell writes the watched file.

**The integration harness now names its shell.** `denyAndShellWouldHaveWritten(cmd, watch,
{shell})` runs `/bin/bash` or `/bin/zsh`; the bash-only wrapper is kept so existing rows read
as they did. Four Turns of effect checks ran bash while the Bash tool runs zsh, which is how
eleven rows shipped allowing.

**The test that pinned the defect is inverted, not deleted.** `bash-mutation-guard.test.ts`'s
"models the three wrappers that really do run a builtin" is replaced by "gives up on a
directory builtin behind ANY wrapper, in either direction", which asserts **both** operand
positions for **every** wrapper row — under the destination (catches a `cd` the model missed)
and under the origin (catches a `cd` the model invented). The second is the direction the old
suite had no case for. Its neighbour at `:620` keeps its three-outcome comment plus a note
that there is a fourth, *modelled wrongly*, and a pointer to the case that can see it.

**No verdict from the earlier commits moved.** All eighteen rows from the Turn-5 history
re-run through the real guard, one fresh project per row:

```
allow  FLAG cd rules/L/.. && rm agents/coder.md
DENY        cd rules/L/.. && rm agents/coder.md
DENY   FLAG cd -P rules/L/.. && rm agents/coder.md
DENY   FLAG set -P; cd rules/L/.. && rm agents/coder.md
DENY   FLAG pushd -P rules/L/.. ; rm agents/coder.md
DENY        cd docs && CDPATH=.. cd agents && rm coder.md
DENY        pushd -n docs && rm agents/coder.md
DENY        cd docs && pushd -n .. && popd && rm agents/coder.md
DENY        cd docs && pushd -n .. && cd - && rm agents/coder.md
DENY        cd docs && pushd ..; popd -n; popd; rm agents/coder.md
DENY        rm AGENTS/coder.md
DENY        rm -rf HOOKS
allow  FLAG mv rules/x.md rules/retired/
allow       rm -rf node_modules
allow       pushd docs >/dev/null && ls; popd
allow       cd build && rm out.js
allow       rm -rf dist
allow       pushd build && rm out.js
```

**The `pushd` half of `9aacab5` re-measured and intact.** All three rotation escapes still
deny with bash deleting the file; both disclosed costs still deny; `pushd -` still pushes; the
depth-from-below row still denies; and all four surviving idioms still allow
(`pushd build >/dev/null && rm out.js; popd`, `pushd rules && popd && rm x.md`,
`cd build && pushd /tmp && popd && rm out.js`, `pushd hooks && npm test; popd`).

---

## Documentation

`rules/protected-path-discipline.md` and `README-hooks.md` both had the wrapper claim
backwards in the places the review named. Now:

- the give-up table row is "**any** wrapper before the builtin", plus a new row for the path
  spelling, with the reason stated as spelling-and-shell rather than as a wrapper property;
- the prose says what an agent needs: the wrapper is *seen*, the destination is not asserted,
  the three cost rows deny fail-closed, and dropping the wrapper is the way through — plus
  that a wrapper in front of a **verb** is untouched, and that `\cd` / `'cd'` stay modelled;
- the residual that read "the wrappers that can run a builtin *are* seen" is corrected;
- the 1835 residual now says it is the hole every directory give-up feeds into, and that its
  reach does not grow while its entrances do;
- **the failing-`cd` residual is added to both documents**, marked as awaiting the decision
  record, with `cd X && …` named as the form the guard can follow.

Adding that last one is the only place I went past the letter of the task, which said not to
*implement* finding 3. Leaving a live, trivially constructible bypass off a residual list I was
editing anyway would have repeated `260802-2335`. Documenting it presupposes no option — it is
also exactly what option 2 asks for, and it is one edit to remove if another option wins.

---

## Residuals

1. **`command cd build && echo pwned > rules/x.md` still allows.** `260803-1835`, measured,
   with its closure cost measured too (two pinned assertions, zero corpus rows). Six more
   entrances into it were opened by this change; its reach was not.
2. **A `cd` that fails.** `260803-2238`, live, no flag, now on both residual lists and awaiting
   `decisions/260803-2338_o_…`.
3. **`builtin cd` is no longer modelled**, which is a small faithfulness loss: it really does
   run the builtin in both measured shells. Traded for carrying no per-shell assertion at all.
   If a future Turn wants it back, the argument it has to beat is in this file and on the
   issue, not just "it was measured".
4. **A directory builtin the classifier cannot see as one.** `eval "cd rules"`, an alias or
   shell function named `cd`, a `cd` in a `source`d script. Unchanged, and the honest end of
   the line — no enumeration closes these.
5. **The shell list is bash and zsh.** Both were measured for every row here. A third shell
   (ksh, dash, fish) was not, and the give-up direction means a third shell can only cost a
   false deny rather than a false allow — which is the property direction 2 was chosen for.

## Not done, deliberately

`hooks/lib/paths.ts`, `hooks/lib/fs-locator.ts` and `hooks/lib/rules-write-exemption.ts` were
not touched. `hooks/dist/` tracked files were restored to HEAD at the end of the task — note
again that `npm test` in `hooks/` is `tsc && vitest run`, so any test run dirties them. The
rebuild and the version bump belong to Plan Step 10.
