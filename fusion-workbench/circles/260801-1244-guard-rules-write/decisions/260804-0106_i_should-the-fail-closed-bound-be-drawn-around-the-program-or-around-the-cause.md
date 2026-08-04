# Should the fail-closed bound be drawn around the PROGRAM or around the CAUSE?

---
**Domain:** code
**Status:** implemented
**Filed by:** coder (task T7-1, `circles/260801-1244-guard-rules-write`)
**Cross-references:**
`circles/260801-1244-guard-bash-inspection/issues/260801-1859_c_redirection-carries-fail-closed-into-unrecognised-programs-and-three-docs-deny-it.md`
(the record this supersedes — an issue whose `Resolved:` line carried the whole
argument, which is why this record exists),
`issues/260803-1835_c_a-redirection-after-an-unmodellable-cd-overwrites-any-protected-file-with-no-flag.md`
(the defect the program-shaped bound left open),
`decisions/260803-2338_i_should-the-guard-degrade-its-directory-model-after-a-cd-it-cannot-prove-succeeded.md`
(taken together with this one; neither closes the redirect spelling alone),
`hooks/lib/bash-mutation-guard.ts` `classifyWords` pass 3,
`hooks/lib/__tests__/bash-mutation-guard.test.ts`
("allows an unresolvable TOKEN on a program outside the table", "denies an
unresolvable WORKING DIRECTORY on the same programs", "DOES reach a redirection
whose program is outside the table").

---

## Why this record exists at all

The behaviour it reverses was decided deliberately, argued well, and recorded
**only** as the `Resolved:` line of a closed issue and two test comments. There
was no decision record to supersede, so a reader arriving at the reversal would
have found a test flipped from `expectAllAllow` to `expectAllDeny` and no trace
of the argument it overrode. This record is the one that should have existed;
the supersession is stated in both directions, here and on `260801-1859`.

## Question

The guard fails closed on a write it cannot place. Where does that rule stop?

Three documents and the module docstring have promised the same sentence since
the Bash surface was built: **an unrecognised program is allowed however
unparseable its arguments are.** `curl -o $OUT https://x` and `make $TARGET` are
untouched.

Redirection is scanned position-independently, because `>` makes any program a
mutation. So a redirect target lands in the written set whatever the program is,
and until `260801-1859` it carried the fail-closed rule with it — `npm test >
"$LOG"` denied, which is the sentence above being false.

`260801-1859` narrowed the code to match the sentence, **by program**: pass 3
runs only when the segment names a table verb. That is one of two ways to read
the sentence, and the question is which.

## What the two readings actually separate

Both readings allow `npm test > "$LOG"`. They differ on one row:

```
  cd $D && echo x > y.md
```

- Under the **program** bound: allowed. `echo` is not a table verb.
- Under the **cause** bound: denied. `y.md` is a literal relative path with
  nothing unparseable in it; what cannot be resolved is the working directory.

`Target` has carried the distinction since it was written —
`{ kind: "unresolved"; viaCwd: boolean }` — so the question is which of the two
the sentence was ever about.

## Options

### 1. Keep the bound around the PROGRAM (the status quo from `260801-1859`)

- **Pros.** Costs nothing to keep. Consistent with the sentence as literally
  written. Has an argued issue behind it.
- **Cons, measured.** It leaves a no-flag overwrite of the entire protected
  list open, and the entrance set grows with every future give-up on a
  directory. Measured with the real-shell effect at the time of filing:

  ```
    command                                                   flag  guard  effect
    pushd -n docs && echo pwned > agents/coder.md              --    allow  OVERWRITTEN
    cd docs && CDPATH=.. cd agents && echo pwned > coder.md    --    allow  OVERWRITTEN
    cd -P rules/L/.. && echo pwned > agents/coder.md           set   allow  OVERWRITTEN
  ```

  Six more entrances opened at `048f3db` when the wrapper walk became a
  give-up, and `260803-2338`'s option 1 would have opened one more. Every
  give-up on a directory feeds it: the moment the guard admits it cannot place
  the shell, a `>` target becomes unresolvable-because-of-the-directory and the
  bound lets it through.

### 2. Draw the bound around the CAUSE — chosen

Keep allowing a target unresolvable because of the **token** (`$`, backtick,
leading `~`); deny one unresolvable because the **working directory** is
unknown, whatever the program is.

- **Pros.** It is what the promised sentence says. "However unparseable its
  ARGUMENTS are" is a claim about the caller's text, and `y.md` is not
  unparseable text — the guard's own model is what failed. Closes the fourth
  escape of `260803-2338` and every entrance `260803-1835` accumulated.

  ~~And it keeps the property `260801-1859` was really fixing: the rule is not
  looser on the visible case than on the invisible one, because
  `curl -o rules/x.md` denies on pass 1 either way.~~ **Struck 2026-08-04
  (T8-1). This Pro was false.** `curl -o rules/x.md` **allows**, before and
  after, in one command's worth of checking. See `## The argument, corrected`.
- **Cons, measured** (real classifier, shipped protected list, HEAD's own
  4203-command test corpus, both directions):

  ```
    today  chosen  command
    allow  DENY    cd $D && echo x > y.md
    allow  DENY    cd $D && echo x > out.log
    allow  DENY    cd "$(pwd)" && npm test > out.log
  ```

  Three rows, all three pinned assertions of `260801-1859`, **zero** rows of
  the 119-command ordinary-agent corpus, and **zero** newly-allowing commands.
  The third row is a correction: T6-1 costed this direction at two assertions
  and missed it, because both live in one `expectAllAllow` array.

  **Annotation, 2026-08-04 (T8-1).** Read "zero rows of the 119-command
  ordinary-agent corpus" as a statement about that corpus, not about the
  change. It was assembled by the same author as the change and contained no
  `cd X; prog > log`, no `if cd`, and no `&&`-newline chain. A 30-row corpus
  written for the review without seeing either cost table moved 10 rows
  (`issues/260804-0840…`). The three rows above still reproduce; what does not
  survive is the implication that they are all there is.

### 3. Add `echo` / `printf` / `cat` to the verb table

Rejected on sight, and again here. The redirection scanner already covers what
those write, and a table row would drag the ancestor rule along with it
(`echo x > hooks` is not a directory delete). It also does not generalise: the
next program someone redirects through is not in the table either.

### 4. Leave it and say so louder

Already done — it has been on both residual lists since T4-2. The reason that is
not enough is that this residual grows: it is the single remaining
consumer-visible cost of the module's give-up mechanism, and the mechanism is
the one the last three Turns have been adding to.

## Constraints

1. **The idiom `260801-1859` protected must survive.** `npm test > "$LOG"`,
   `cat report.md > ~/backup.md`, `curl -o $OUT https://x`, `make $TARGET`.
2. **No fail-open.** No command may newly allow.
3. ~~**The visible/invisible consistency must hold.** `curl -o rules/x.md`
   denies, so a rule that allowed its invisible sibling would be the
   inconsistency `260801-1859` named.~~ **Struck 2026-08-04 (T8-1): this
   constraint rested on a false premise and was never met.** `curl -o
   rules/x.md` allows. Stated correctly, the consistency argument runs the
   other way and mildly favours option 1. It is replaced by constraint 3′
   below.
3′. **A write the guard has already recognised may not be allowed because the
   guard's own model failed.** That is the line option 2 draws, and it is the
   one the evidence supports. See `## The argument, corrected`.
4. **The supersession is stated on the superseded record**, not only here.

## Answer

**Option 2 — the bound is the CAUSE.**

Taken with `260803-2338` option 1 at the Turn 6 closing gate: the user was shown
that the two close together or not at all, and agreed. `260803-2338` closes
three of the four measured escapes and leaves the redirect spelling; this record
closes the redirect spelling and leaves the three verb escapes. Neither is worth
taking alone.

The argument that decides it is that `260801-1859` was right about the defect
and imprecise about the repair. Its own words — "an unrecognised program is
allowed however unparseable its ARGUMENTS are" — are a statement about the
caller's text. `cd $D && echo x > y.md` has no unparseable argument in it. The
program bound is a proxy for the cause bound that happens to agree on every row
`260801-1859` measured and to disagree on the one it did not: a literal operand
under a directory the guard has already admitted it cannot name.

Cost accepted: three commands that work today begin to deny, all three of them a
relative redirect target under an unknowable working directory, all three with
an absolute path or a dropped `cd` as the way through, and all three
diagnosable because the deny names the working directory as the cause. Against
that: an overwrite of any file on the protected list needing no flag, whose
entrance set grows with every future improvement to the directory model.

---

## The argument, corrected

**Appended 2026-08-04, task T8-1, after `reviews/260804-0845-coderev-turn7-…`
found the central fact inverted (`issues/260804-0841`).**

### The fact

`curl -o rules/x.md` **allows**. It always has. Measured again here, real
classifier, shipped protected list, at the pre-T8-1 tree and at HEAD:

```
  pre    now    command
  allow  allow  curl -o rules/x.md https://x
  allow  allow  curl -o rules/x.md
  allow  allow  curl --output rules/x.md https://x
  allow  allow  wget -O rules/x.md https://x
  DENY   DENY   curl -s https://x > rules/x.md      # the redirection sibling
  DENY   DENY   sort /tmp/a > rules/x.md
```

`curl` is not in `MUTATION_VERBS` and `-o` is not a redirection operator, so
nothing puts that operand in the written set and no pass ever sees it.
`260801-1859`'s own `Resolved:` line said this correctly — *"the table already
**allows** `curl -o rules/x.md`"* — and T7-1's supersession note, three
paragraphs below it on the same file, said the opposite.

### What the fact costs this record

The Pro under option 2 and constraint 3 both asserted that option 2 *keeps* a
visible/invisible consistency. It does not, and neither did option 1. Stated
correctly:

```
  allow   curl -o rules/x.md https://x            # visible, literal, PROTECTED target
  DENY    pushd -n docs && echo hi > notes.txt    # invisible, and the target is harmless
```

After option 2 the guard is looser on that visible case than on the invisible
one **by a wider margin than before**, because option 2 added denials on the
invisible side and nothing on the visible one. The consistency argument, read
honestly, is a point **for option 1** — the direction T7-1 reported it in was
backwards.

### Is the answer still option 2?

**Yes, and it now stands on one leg instead of two.** That is a real weakening
and it is stated rather than papered over.

What is left is the measured defect. `260803-1835` — `pushd -n docs && echo
pwned > agents/coder.md`, no flag, no wrapper, real bash, agent prompt
overwritten — is real, was reproduced, and is closed by option 2 and by nothing
else in the option set. Option 1's cost is that defect plus one new entrance
per future give-up on a directory; option 2's cost is three commands, all with
a named remedy in the deny reason. That comparison decides it without the
consistency argument, which is why the answer does not move.

### The line the bound actually draws

The distinction is not **visible vs invisible**. It is **inside the mechanism
vs outside it**:

- `curl -o rules/x.md` — the classifier never recognised a write. No verb row,
  no redirection operator, no operand in the written set. It is the standing
  unrecognised-program residual, shared with `python3 -c`, `eval` and
  `bash -c`, and the module has always documented it.
- `cd $D && echo x > y.md` — the classifier **did** recognise the write. The
  `>` put `y.md` in the written set; the operand is a literal; the only thing
  missing is a working directory the guard has itself admitted it lost.

Declining to model a program you never recognised is a bound on a mechanism.
Recognising a write, losing your own model of where it lands, and allowing it
anyway is that mechanism failing open on its own admission. That asymmetry is
what carries option 2, and unlike the consistency claim it is checkable against
the code (`classifyWords` pass 3, `Target.viaCwd`) rather than against a verdict
someone remembered.

### Method note

The claim was false and one command away from being checked. It was written
into a decision record, a supersession note, two code comments and
`README-hooks.md` without ever being run. Every other number in T7-1 reproduced
under review; this one was not a measurement at all, it was a recollection in
the shape of one. Both fixed here, and the corpus that would have caught it —
a cross-product generator rather than a harvest of the suite's own strings —
is now the method (see `history/260804-0940-turn8-…`).

---
Answered: this record, `## Answer` — the fail-closed bound is drawn around the CAUSE a target failed to resolve for, not around whether the program is in the verb table. The answer survives the correction in `## The argument, corrected`; one of its two supporting arguments does not.
Implemented: `hooks/lib/bash-mutation-guard.ts` `classifyWords` pass 3 (task T7-1) — an unresolved target denies when `viaCwd`, whatever the program; a token-unresolvable target outside the verb table still allows.
Deferred:
Superseded by:

---

**Reconciliation 260804-1021 (reconciler, domain `code`) — `_i_` confirmed. This is the best-formed record in the store, and the one worth copying.**

**The realisation is real and the bound is where the record says.** Verified at HEAD `cc012fc`: `sort /tmp/a > rules/x.md`, `curl -s https://x > rules/x.md`, `rm /tmp/a > "$F"` and `tee "$LOG"` all deny, while `curl -o $OUT …`, `make $TARGET` and `npm run $SCRIPT` all allow. An unresolved target denies when `viaCwd` whatever the program is; a token-unresolvable target outside the verb table still allows. Exactly as stated.

**Three properties this record has that the others in this store do not**, recorded because the Circle's recurring failure has been record integrity rather than code:

1. It exists *because* the behaviour it reverses was recorded only as the `Resolved:` line of a closed issue, and it says so in a section called `## Why this record exists at all`. That is the right instinct and it should become the rule: a reversal needs a record to supersede, and if there is none, write the one that should have existed.
2. Its supersession is stated in both directions, here and on `260801-1859`.
3. Its `## Method note` names its own false claim, says the claim was "a recollection in the shape of" a measurement, and states the method change that follows from it. A record that documents its author's error is worth more than one that reads clean.

**One convention note.** The `Implemented:` line names task T7-1 rather than a commit hash; `rules/fusion-workbench-conventions.md` asks for `Implemented: <short-hash>`. T7-1 is **`c9c44a3`**. Recorded here rather than edited into the line, so the original wording stands. Same note on `260803-2338_i_`.

**The `## Answer` survived the correction, and the record says so correctly.** One of its two supporting arguments (the consistency claim about `curl -o rules/x.md`) was inverted and is now struck; the measured defect `260803-1835` carries the conclusion alone. Re-checked: `curl -o rules/x.md https://x` does allow at HEAD, so the correction is right and the conclusion still stands on the remaining leg.
