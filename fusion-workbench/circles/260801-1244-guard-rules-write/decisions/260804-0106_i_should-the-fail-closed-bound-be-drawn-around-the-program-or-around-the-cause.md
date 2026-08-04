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
  escape of `260803-2338` and every entrance `260803-1835` accumulated. And it
  keeps the property `260801-1859` was really fixing: the rule is not looser on
  the visible case than on the invisible one, because `curl -o rules/x.md`
  denies on pass 1 either way.
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
3. **The visible/invisible consistency must hold.** `curl -o rules/x.md` denies,
   so a rule that allowed its invisible sibling would be the inconsistency
   `260801-1859` named.
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
Answered: this record, `## Answer` — the fail-closed bound is drawn around the CAUSE a target failed to resolve for, not around whether the program is in the verb table.
Implemented: `hooks/lib/bash-mutation-guard.ts` `classifyWords` pass 3 (task T7-1) — an unresolved target denies when `viaCwd`, whatever the program; a token-unresolvable target outside the verb table still allows.
Deferred:
Superseded by:
