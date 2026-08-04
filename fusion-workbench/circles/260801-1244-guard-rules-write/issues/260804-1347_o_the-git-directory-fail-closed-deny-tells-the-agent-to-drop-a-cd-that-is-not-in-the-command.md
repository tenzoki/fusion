# The git-directory fail-closed deny tells the agent to drop a `cd` that is not in the command

---

**Severity:** Medium
**Domain:** code (security control — the deny reason, which is the control's only user interface)
**Filed by:** coderev, review of `613d6fd`
**Affects:** `hooks/lib/bash-mutation-guard.ts:1661-1668` (`stepDir` returns the causeless `CWD_UNKNOWN`), `:1628` (`CwdUnknownCause`), `:1033-1043` (`unknownCwdReason`), `:3076-3082` (the reason dispatch)
**Kind:** NEW in `613d6fd`. It added a fourth way to lose the working directory and did not give it a cause.
**Cross-references:**
`decisions/260803-1803_i_…` (the `CDPATH` decision, which established that a cause a reader cannot find in the command needs its own reason),
`issues/260803-2238_c_…` and `decisions/260803-2338_i_…` (the same argument for `unproven-cd`),
`rules/protected-path-discipline.md:118` (the doc row that gets this right: "`git -C $D rm x.md` (relative, unknown directory)").

---

## What is wrong

`stepDir` yields `CWD_UNKNOWN` for a `-C` or `--work-tree` value that does not resolve
(`:1666`). `CWD_UNKNOWN` carries no `cause`, so `denyVerdict` falls through to
`unknownCwdReason`, whose text is:

> An earlier `cd` in this command moved somewhere only known at run time … Name the target as
> an absolute path, or **drop the `cd`** and write the path from the project root.

There is no `cd` in the command. The agent is told to remove a construct it did not write.

This is precisely the failure `CwdUnknownCause` was introduced to prevent. Its own docstring
(`:1610-1626`) says both members "earn their place by being invisible in the place a reader
would look", and the `ambient-cdpath` member exists because "a reason naming only the working
directory would send them looking through a command that contains no cause". A `git -C $D` is
the same situation with a different cause, and it arrived after the vocabulary was written.

## Measured

Real guard subprocess, one fresh project per case.

```
$ git -C $D rm build/out.js
block — "fusion policy: this Bash command mutates a relative path from a working directory
the guard cannot determine. An earlier `cd` in this command moved somewhere only known at
run time, so the segment `git -C $D rm build/out.js` writes `build/out.js` at an unknowable
location and it is denied (fail-closed). Name the target as an absolute path, or drop the
`cd` and write the path from the project root."

$ git --work-tree=$W clean -fdx
block — same reason, and the named token is `.`, an operand the command does not contain
either.
```

The second row compounds it: the reason names `` `.` `` as the thing being written, which is
the model's supplied implicit pathspec (`gitCleanWrites`, `:864`). An agent reading that
looks for a `.` in a command that has none, and then for a `cd` that has none.

The deny itself is right in both rows and must stay. Only the explanation is wrong.

## Why it matters

The Circle's stated failure mode is an agent that meets an unexplained deny and works around
it. `rules/protected-path-discipline.md` says so in its own opening: *"The point of this text
is that you never meet the deny in the first place."* A reason whose remedy cannot be applied
is the worst case of that — three of them puts the guard into halt mode, and the agent has
followed the instruction each time.

## Recommendation

Add a third `CwdUnknownCause` member — `git-directory` — set by `stepDir` when the token does
not resolve, and a reason function that names the real cause and the real remedy:

> *"A `-C` or `--work-tree` on this `git` invocation names a directory the guard cannot
> resolve before the command runs, so it cannot place the operand `<token>` (fail-closed).
> Write the directory out literally, or name the operand as an absolute path."*

Two details worth getting right in the same edit:

- `stepDir` also returns `CWD_OUTSIDE` for a leading `~` (`:1664`); that path allows and needs
  nothing.
- For `git clean` the named token is the model's implicit `.`. Either name the invocation
  rather than the token in that reason, or say "the directory `git clean` would run in" — the
  bare `` `.` `` is not findable in the command.

The precedent is exactly `unprovenCdReason` and `ambientCdpathReason`: one function, one
constructor, one dispatch arm, and the suite pins the string.

## Test coverage this needs

- `git -C $D rm build/out.js` and `git --work-tree=$W clean -fdx` deny with a reason that
  does **not** contain the substring `` `cd` ``, and does contain `-C` / `--work-tree`;
- the three existing causes keep their own reasons unchanged (`cd $D`, `cd build; rm out.js`,
  ambient `CDPATH`), so the new arm cannot swallow them;
- `git -C $D rm /tmp/junk` stays an allow — an absolute operand needs no directory.

## Anti-vacuity

Both rows already deny, so a test asserting `decision === "block"` would pass vacuously. The
assertion has to be on the **reason string**, and the mutation that proves it is: delete the
new cause and let the rows fall back to `unknownCwdReason` — the two reason assertions must
fail and nothing else.
