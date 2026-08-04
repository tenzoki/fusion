# Turn 7, T7-1 — the separator degrade, the cause-shaped fail-closed bound, and a decision written after the fact

**Date:** 2026-08-04 01:40
**Agent:** coder
**Circle:** `circles/260801-1244-guard-rules-write`, Turn 4 of this session (the Circle's seventh)
**Task:** T7-1 — implement `decisions/260803-2338` option 1 together with `issues/260803-1835`
**Suite:** `npm test` — 1235 passed, 24 files, green (was 1197)
**Status:** Complete

---

## The three sentences

**The real cost is eight commands, and zero move the other way** — five from the
separator degrade (exactly the table the decision record showed the user, no sixth
shape) and three from the cause-shaped fail-closed bound, one more than the two T6-1
measured. **The git branch classifier did not move**: 98 commands × 4 override
combinations reproduce a gold file of its verdicts from the commit before this change,
byte for byte, and a source check pins the structural reason. **The fail-closed bound
survived** — `npm test > "$LOG"`, `curl -o $OUT https://x`, `make $TARGET` and
`cat report.md > ~/backup.md` all still allow, along with `echo x > "rules/$F"` and, the
row that shows the split is real, `cd build && echo x > "$F"`.

---

## Part 1 — the separator-conditioned degrade

### What changed

`ParsedSegment` gained a third field. `SegmentJoiner` is `"start" | "&&" | "||" | ";" |
"|" | "&" | "newline"`, and `scanSegments` now records which operator joined each segment
to the one before it at its own nesting level. `&&` and `||` are consumed as one operator
rather than as two flushes of which the second found an empty segment — the same
segmentation, and the only way to name the pair. The lookahead is on the repeated
character only, so `|&` is still `|` then `&` and `;;` is still two `;`.

`ShellState` gained `moved: boolean` — monotone, `true` is the don't-know, carried by
`cloneState` so it is per SCOPE. `applyDirEffect` sets it the moment a segment names a
directory builtin (not for `set`, which changes a mode rather than a directory).
`classifyBashMutation` calls `degradeUnprovenCd` at any segment boundary whose joiner is
not `&&` while `moved` holds.

**Three decisions inside that, each of which could have been made the other way:**

**The test is `!== "&&"`, not an enumeration of the others.** A joiner added to the type
later is unguaranteed until someone argues otherwise, which is the fail-closed direction.

**The give-up sits AFTER the subshell scope restore.** A `cd` bash itself discarded casts
no doubt forward, so `(cd nonexistent); rm x.md` still resolves `x.md` from the project
root and `$(cd build); rm rules/x.md` still denies for the right reason. Putting the check
before the restore would have made every subshell containing a `cd` poison its parent.

**`moved` is a `ShellState` field rather than a parallel boolean beside the saved scopes.**
The parallel form is a second fact that can disagree with the first, which is the exact
shape of `260803-2237` and of the defect the `DirStack` sum type was written to make
unwriteable. As a field it satisfies the invariant the module already states — a
monotone boolean whose `true` is the whole-field unknown — and `cloneState` scopes it for
free.

### It needed a new deny reason, and that was not optional

`unknownCwdReason` says an earlier `cd` moved somewhere only known at run time. In
`cd build; rm out.js` that reads as a bug: the `cd`'s operand is a literal and rewriting it
changes nothing. What is unknown is not where the `cd` went but whether the shell went
there, so `unprovenCdReason` names the separator and names `&&` as the way through — which
is also what makes the command correct in the shell.

A directory that was **already** unknown keeps its own cause untouched. `pushd -P x; rm y`
is still told about the `-P` and a bare-word `cd` under an ambient `CDPATH` still about the
variable, because neither is fixed by writing `&&`. I got this wrong on the first pass
(the separator cause displaced a plain `CWD_UNKNOWN`) and the suite caught it: a
`guard-rules-write-integration` case asserting the `-P` reason failed. The fix is one
condition, and the case that found it is why the condition is right.

### Measured — the cost, in both directions

Real classifier, shipped protected list, **HEAD's own test corpus** (4203 command strings
harvested from the 24 test files as they stand at HEAD, not as I left them — measuring
against my own new tests would have been circular). The two halves were attributed by
building each one separately with the other reverted.

**The degrade alone moves six verdicts. Five are the cost:**

```
  today  T7-1   command
  allow  DENY   cd build; rm out.js
  allow  DENY   cd docs; rm ../notes.txt
  allow  DENY   mkdir -p build && cd build; rm out.js
  allow  DENY   cd hooks && npm run build; rm -rf dist
  allow  DENY   cd build || exit 1; rm out.js
```

**The prediction was exact.** The decision record produced that table by simulating the
degrade; the real implementation moves those five and no others. The sixth is
`cd nonexistent; rm rules/x.md` — the bypass.

**Newly allowing: none.**

The sharp edge held. `cd hooks && npm run build; rm -rf dist` has an `&&`-joined `cd` and
still reaches `rm -rf dist` unconditionally, so the degrade had to fire for it; testing the
joiner of the segment *before the write* rather than the one right after the `cd` is what
covers it. `cd hooks && npm run build && rm -rf dist` stays exact, and both are pinned.

The `pushd … ; popd` idioms are most of why the cost is five rows rather than fifty: they
degrade, and then write nothing relative.

---

## Part 2 — the fail-closed bound, redrawn around the cause

### The supersession, which was the part to get right

`260801-1859` was an **issue**, not a decision record. Its whole argument lived in a
`Resolved:` line and two test comments. So there was nothing to rename `_i_` → `_s_`, and
a reader arriving at the reversal would have found a test flipped from `expectAllAllow` to
`expectAllDeny` with no trace of what it overrode.

I wrote the record that should have existed:
`decisions/260804-0106_i_should-the-fail-closed-bound-be-drawn-around-the-program-or-around-the-cause.md`.
It states the original argument as it was, both readings of the promised sentence, the
measured cost of each, and why option 2 wins. `260801-1859` carries a note pointing at it
that separates what stands (the defect was real; the sentence is now true; the
visible/invisible consistency argument still decides it) from what was superseded (the
bound was drawn around the program).

**The two tests that pinned the old bound were inverted, not deleted.**
`"does NOT carry fail-closed into a program outside the table"` became
`"allows an unresolvable TOKEN on a program outside the table"` plus a sibling
`"denies an unresolvable WORKING DIRECTORY on the same programs"`, and
`"does NOT reach a redirection whose program is outside the table"` became
`"DOES reach a redirection whose program is outside the table"`. Each carries a comment
naming what it replaced and why — including that the old test's own comment called the
give-up "the sharpest form", which is the argument for reversing it rather than against.

### The argument, in one paragraph

`260801-1859` was right about the defect and imprecise about the repair. Its own words —
*an unrecognised program is allowed however unparseable its ARGUMENTS are* — are a claim
about the caller's text. `cd $D && echo x > y.md` has no unparseable argument in it: `y.md`
is an ordinary literal relative path. What failed to resolve is the guard's own working
directory. The program bound is a proxy for the cause bound that agrees on every row
`260801-1859` measured and disagrees on the one it did not.

The implementation is two lines of condition in pass 3: it now runs whenever the protected
list is non-empty, and skips a target that is unresolved with `viaCwd: false` on a segment
with no recognised verb. `Target` has carried that distinction since it was written.

### Measured — and a correction to the number this Circle recorded

**The cause split alone moves eleven verdicts. Three are the cost:**

```
  today  T7-1   command
  allow  DENY   cd $D && echo x > y.md
  allow  DENY   cd $D && echo x > out.log
  allow  DENY   cd "$(pwd)" && npm test > out.log
```

**T6-1 costed this at two and it is three.** The third lives in the same
`expectAllAllow` array as the second, so counting *failing `it` blocks* found two while
counting *moved rows* finds three. Both my earlier measurement and the issue's record
inherited the error; the issue now carries the correction. It does not change the decision
— all three are pinned assertions of `260801-1859`, so the cost is the decision itself
rather than a false-positive budget — but "exactly two" was a claim I made without
checking the right thing, which is the failure this Circle exists to correct.

**I also found the reason it was missed, and it was in my own method.** My first harvest
regex read only double-quoted TypeScript literals. `'cd "$(pwd)" && npm test > out.log'` is
single-quoted in the source, so it was invisible to the corpus. Fixing the harvester is
what surfaced the third row.

**Newly allowing: none.**

The other eight rows are escapes closed: the three `260803-1835` was filed on, the six that
newly allowed at `048f3db` (one of which overlaps), and T6-1's eleventh row
`command cd build && echo pwned > rules/x.md`.

### The bound that survives

```
  echo x > "$F"                    allow — the TOKEN is unknowable, the directory is not
  echo x > "rules/$F"              allow
  npm test > "$LOG"                allow
  cat report.md > ~/backup.md      allow
  curl -o $OUT https://x           allow
  make $TARGET                     allow
  cd build && echo x > "$F"        allow — same command, directory known
  cd $D && echo x > y.md           DENY  — literal operand, directory unknown
```

The last two rows are the whole change, and they are pinned together in one test so the
distinction cannot be read as an accident. ~~`curl -o rules/x.md` still denies on pass 1, so
the rule is not looser on the visible case than on the invisible one — the property
`260801-1859` was really protecting.~~

> **Correction, 2026-08-04, task T8-1.** The struck sentence is false and was never
> measured. `curl -o rules/x.md` **allows** — `curl` is not a table verb and `-o` is not a
> redirection operator — and this history inherited the error from the supersession note it
> was describing. The corrected argument is in
> `decisions/260804-0106…` `## The argument, corrected`; the decision itself stands.
> Filed `issues/260804-0841`.

Not `npm test 2>&1 | tee "$LOG"`, which I briefly asserted as an allow and which denies
both before and after: `tee` is a table verb, so its operand fails closed as a verb operand
and never reaches the redirection bound. Noted in the test rather than quietly dropped.

---

## Together — 18 moves, and one that needed both

Applied together the two halves move **18** verdicts and **zero** the other way. That is
6 + 11 + 1: `cd nope || true; echo pwned > rules/x.md` allows under either change alone and
denies under both, which is precisely the claim the decision was answered on.

A second corpus, independent of the tests: every command-looking line inside a fenced code
block of all 100 markdown files across this Circle and its predecessor — 274 rows, which is
where the measured-but-not-pinned verdicts of `a79ff1a`, `86a437a`, `7cf9693`, `b85f6a0`,
`9aacab5` and `048f3db` live. Same result: nothing newly allows, and every newly-denying
row is one of the 18.

---

## The git classifier, asserted rather than assumed

This is the only option in the decision that widened a shared type, and `ParsedSegment` is
reachable from both Bash classifiers. Two assertions, because they fail for different
reasons:

1. **A gold file.** `lib/__tests__/fixtures/git-verdicts-head.json` holds the git
   classifier's verdicts **at the commit before this change** — 98 commands (every one in
   the suite that produces a deny or an override) × all four override combinations, whole
   verdict objects including reason strings, `offendingSegment`, `kind` and `overrideUsed`.
   It was generated by running HEAD's classifier from a copy of `lib/` materialised out of
   git, so it is a real before/after and not the code asserting itself. The current
   classifier reproduces all 392 verdicts byte for byte.
2. **A source check.** `git-branch-guard.ts` still segments through
   `extractCommandSegments(stripDataRegions(command))` and never names `parseCommand`,
   `ParsedSegment` or `joiner`. That is the structural reason the gold file stays green: the
   flat segmenter is a separate function retained verbatim, so a field added to
   `ParsedSegment` cannot reach a caller that does not call `parseCommand`. Without this,
   a future edit could route the git classifier through the parser and the gold file would
   only catch it for the 98 commands that happen to be in it.

The gold file also has a floor assertion, so a fixture that silently emptied fails rather
than passing vacuously.

---

## Tests

`npm test` — **1235 passed, 24 files, green.** Up 38 from 1197.

**Anti-vacuity by mutation** — each fix broken in turn, full suite run, failures counted.
Not by reading the tests.

| Mutation | Failures |
|---|---|
| the separator give-up never fires (the `260803-2238` bypass returns) | **10** — 5 unit, 5 integration |
| it fires for EVERY joiner, `&&` included (the model stops being exact) | **51** across 4 files |
| pass 3 bounded by the PROGRAM again (`260801-1859` unreversed) | **16** — 4 unit, 12 integration |
| pass 3 unbounded (the idiom `260801-1859` protected denies again) | **10** |
| the separator degrade displaces a stronger cause (`-P`, ambient `CDPATH`) | **2** |

Mutations 1 and 3 fail **near-disjoint** sets — the degrade's own five rows against the
cause split's twelve — and the four they share are exactly the rows that need both halves
(`cd nope || true; echo pwned > rules/x.md` in bash and zsh, and the two unit cases that
carry it). That overlap is the decision's claim showing up in the failure list rather than
a weakness in the pinning.

The standing guard still holds: `rm -f rules/x.md` must block in a throwaway project or
every denial assertion is vacuous. Every new integration case asserts its deny is not
`[HALTED]` **and** that the named real shell writes the watched file, one fresh project per
row.

**Acceptance rows, measured through the real guard subprocess:**

```
  shell  effect       command
  bash   GONE         cd nonexistent; rm rules/x.md
  zsh    GONE         cd nonexistent; rm rules/x.md
  bash   OVERWRITTEN  cd nope || true; echo pwned > rules/x.md
  zsh    OVERWRITTEN  cd nope || true; echo pwned > rules/x.md
  bash   OVERWRITTEN  command cd rules && echo pwned > x.md
  bash   OVERWRITTEN  builtin cd rules && echo pwned > x.md
  zsh    OVERWRITTEN  builtin cd rules && echo pwned > x.md
  bash   OVERWRITTEN  time cd agents && echo pwned > coder.md
  zsh    OVERWRITTEN  time cd agents && echo pwned > coder.md
  bash   TRUNCATED    command cd skills/demo && printf '' > SKILL.md
  zsh    OVERWRITTEN  command cd build && echo pwned > rules/x.md
  bash   OVERWRITTEN  pushd -n docs && echo pwned > agents/coder.md
  bash   OVERWRITTEN  cd docs && CDPATH=.. cd agents && echo pwned > coder.md
  bash   OVERWRITTEN  cd -P rules/L/.. && echo pwned > agents/coder.md   (FUSION_ALLOW_RULES_WRITE=1)
```

All fourteen deny, none reads `[HALTED]`, each in its own throwaway project.

---

## Documentation

Both shipped documents were read in their current state (five edits today) and updated to
what is true after the change.

`rules/protected-path-discipline.md` — this is the main artifact of the Circle, and it
loads into every agent's context in every consuming project, so the two new facts are
stated where an agent will hit them rather than only in the residual list:

- a new **"Write `&&`, not `;`"** block under "A `cd` is tracked", with the
  reached-unconditionally edge shown as a two-line before/after, the five-row cost table,
  and the two ways through named in the order an agent should try them;
- the fail-closed section now says **the bound is the token, not the program**, with the
  three-row `echo x > "$F"` / `cd $D && echo x > y.md` / `cd build && echo x > "$F"` block
  that makes the split visible in one glance, and a citation to the new decision record;
- the **failing-`cd` residual is rewritten from a live bypass into a stated cost** — the
  give-up over-denies whenever the `cd` would have succeeded;
- the **redirect residual is narrowed** to the half that remains (an unreadable token) and
  no longer claims to be the hole every directory give-up feeds into, because it is not.

`README-hooks.md` — the `lib/shell-parse.ts` module row now names the joiner and says the
git classifier does not come through `parseCommand`; the `cd`-is-tracked bullet carries the
separator condition and the cost table; the fail-closed bound paragraph is redrawn around
the cause; and both residual sentences in the long residual paragraph are corrected.

---

## Workbench

- `decisions/260803-2338` → `_i_`, with an "after implementation" section recording that
  the simulated cost table was exact and that the fourth escape closed only once
  `260803-1835` closed with it.
- `decisions/260804-0106` filed `_i_` — the record `260801-1859` never had.
- `issues/260803-1835` → `_c_`, `issues/260803-2238` → `_c_`, both with a `Resolved:`
  section carrying the measured numbers rather than a claim.
- `260801-1859` (in the sibling Circle) carries a supersession note pointing at the new
  record and separating what stands from what does not.

---

## Residuals

1. **The degrade over-denies whenever the `cd` would in fact have succeeded.** That is the
   five-row cost and it is the whole of what option 1 buys against. `&&` clears every one.
2. **A redirect target whose TOKEN cannot be read is still allowed** on a program outside
   the table — `echo x > "$F"` where `$F` may be `rules/x.md`. This is the deliberate half
   of the bound and the promise `260801-1859` was filed to make true. It no longer grows:
   a give-up on a directory does not open a redirect route any more.
3. **A directory builtin the classifier cannot see as one.** `eval "cd rules"`, an alias or
   shell function named `cd`, a `cd` in a `source`d script. Unchanged, and the honest end
   of the line.
4. **The shell list is bash and zsh.** Every acceptance row was measured in the shell that
   performs its write, and the rows where the two disagree appear twice. A third shell was
   not measured; the give-up direction means it can only cost a false deny.
5. **`moved` is set for `popd` on an empty stack too**, where bash stays put and nothing
   asserted could have failed. A marginal over-deny, taken for a simpler rule.

## Not done, deliberately

`hooks/dist/` tracked files were restored to HEAD after the final run — `npm test` in
`hooks/` is `tsc && vitest run`, so any run dirties them. The rebuild and the version bump
belong to Plan Step 10. Nothing was committed; the orchestrator commits after validation.
