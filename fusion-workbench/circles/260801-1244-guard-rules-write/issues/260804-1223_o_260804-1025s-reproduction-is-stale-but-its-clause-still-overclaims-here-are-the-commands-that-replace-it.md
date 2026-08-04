# `260804-1025`'s reproduction is stale but its clause still overclaims — the replacement commands

---

**Severity:** High (inherited — this is `260804-1025`'s evidence, not a second defect)
**Domain:** code (documentation of a security control)
**Filed by:** coderev, incremental review of `4f1007f`
**Affects:** `rules/protected-path-discipline.md:189-190` (question 3, formerly question 2 at `:172`)
**Kind:** `260804-1025_o_…` stays open. Its two reproduction commands stopped reproducing in `4f1007f`; five others take their place and the recommended fix is unchanged.
**Cross-references:** `260804-1025_o_…` (**close these two together — this is not a separate defect**); `260804-1220_o_…` (the same section, the stale count).

---

## Why this record exists

`4f1007f` inserted a new question 2 in front of the question `260804-1025` names. Run the
procedure now on that issue's two commands:

```
true || cd build && rm rules/x.md      Q1 yes → Q2 "the joiner in front of the builtin's
echo hi | cd build && rm rules/x.md         own segment" is `||` / `|` → STOP, unknown.
```

The procedure returns the correct answer for both, and both now DENY. So `260804-1025`'s
`## Measured` block no longer reproduces by its own steps.

**It must not be closed on that basis.** The clause the issue asks to delete — *"the model
stays exact"* — is still there, still unscoped, and still returns the reassuring answer for
commands that deny. Only the example set changed. Filed as its own record so that whoever
picks up `260804-1025` finds the corrected evidence attached to a live file rather than
discovering the staleness by trying the old steps and concluding the issue is fixed.

## Measured, at HEAD `4f1007f`

`classifyBashMutation`, shipped protected list, `env: {}` unless named. Every row passes
question 1 (a directory builtin is present), question 2 (its own segment's leading joiner is
`start`, which moves the calling shell) and question 3 (the only joiner between the builtin
and the write is `&&`) — so the document tells the reader **"the model stays exact and this
rule denies nothing"**:

```
DENY   cd -P build && rm out.js                      # `-P` — the model is NOT exact
DENY   cd -P build && rm rules/x.md
DENY   cd $D && rm out.js                            # unresolvable operand
DENY   command cd build && rm out.js                 # wrapper give-up
DENY   pushd -n build && rm out.js                   # `-n` pushes and stays put
DENY   cd build && rm out.js      env CDPATH=/tmp    # ambient CDPATH

allow  cd build && rm out.js                         # the control — Q3's answer IS right here
allow  pushd build && popd && rm out.js              # and here
```

Six rows reach the end of the procedure and are told the model stays exact. In all six the
model has given the directory up, and in all six the guard denies.

## The distinction that keeps this honest

Question 3 makes **two** claims and only one of them is scoped:

- *"…and this rule denies nothing"* — true in all six rows. The separator rule really is
  silent there; the deny comes from the modifier / wrapper / `CDPATH` / fail-closed rules,
  each of which the document states correctly in its own section.
- *"the model stays exact…"* — false in all six. It is a claim about the whole directory
  model, made inside a section scoped to one rule, and it is the half that tells the reader
  the outcome is *safe* rather than merely un-denied. That is precisely the reading
  `260804-1025` objects to.

So the defect is unchanged in kind and unchanged in fix; only the commands moved from a
leak-shaped set to a give-up-shaped one. It got milder — nothing in the replacement set
deletes a file — and it did not go away.

## Recommended fix

Unchanged from `260804-1025 § Recommended fix`: delete "the model stays exact and" from
question 3. The remainder is true, sufficient, and is what the question is about. Then add
the pointer that a "yes" at question 3 means *this rule* is silent, not that the command is
safe.

Close this record with `260804-1025`. One clause, one edit.

## Anti-vacuity

The check that would have caught both generations: run the document's own numbered procedure
against every DENY row in its own illustration block. Six of those rows reach the end of the
procedure today. That is a review instruction for the Step 9 documentation task, not a test,
and `260804-1025 § Anti-vacuity` already asks for its narrower form.

## Origin

Found by running the four-question procedure against the module's give-up families during
the incremental review of `4f1007f`, after the Turn 9 implementer reported that
`260804-1025` was "no longer reproducible by its own steps".
