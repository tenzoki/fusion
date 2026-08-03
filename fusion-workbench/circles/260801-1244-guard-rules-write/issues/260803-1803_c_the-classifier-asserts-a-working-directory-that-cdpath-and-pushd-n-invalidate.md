# The classifier asserts a working directory that `CDPATH` and `pushd -n` invalidate, and both reach the whole protected list with no flag

---

**Severity:** High
**Domain:** code (security control)
**Filed by:** analyst, task T4-1 of `circles/260801-1244-guard-rules-write`
**Affects:** `hooks/lib/bash-mutation-guard.ts` (Bash surface only; the write-tool surface has
no working-directory model and is unaffected)
**Cross-references:**
`issues/260803-1431_o_gate-0-misses-the-dotdot-in-a-cd-p-operand-so-a-planted-link-still-spends-the-grant.md`
(the same defect, third known entrance, and the fix proposed there covers these two if it is
taken at its general form),
`analyses/260803-1803-guard-path-model-root-cause.md` (the analysis that found these),
`decisions/260803-1803_o_should-the-guard-degrade-its-working-directory-model-when-cdpath-is-set-in-the-ambient-environment.md`
(the residual this issue does not close),
`hooks/lib/bash-mutation-guard.ts:1227-1239` (`firstDirArg`), `:1245-1308` (`applyDirEffect`),
`:1133-1144` (`resolveDir`), `:24` (the leading-assignment skip in `findCommandWord`),
`rules/protected-path-discipline.md` (the residual list that names neither of these)

---

## What is wrong

`applyDirEffect` models a directory change and then asserts a `Cwd` of kind `known`. Two
tokens that decide where bash actually lands are discarded before it decides, so the assertion
is wrong and every relative operand afterwards is matched against the wrong path.

**`CDPATH`.** `findCommandWord` skips a leading `VAR=value` assignment, so a `CDPATH=` prefix
never reaches `applyDirEffect`. Bash consults `CDPATH` when a `cd` operand is a bare word, and
resolves the operand against each `CDPATH` entry in turn, landing outside the directory the
classifier joined.

**`pushd -n DIR`.** `firstDirArg` skips `-n` as an ordinary flag
(`bash-mutation-guard.ts:1232`, the same blanket skip that hides `-P`). `pushd -n DIR` pushes
`DIR` onto the directory stack and **does not change directory**. `applyDirEffect` models it as
a change.

Both are the defect named in `260803-1431`: the classifier asserts a working directory it
cannot compute. Neither involves a symlink or a `..`, so gate 0 is not in the picture and no
part of the rules-write exemption is either. These are protection-side and need **no flag**.

## Measured

Real guard subprocess through `hooks/lib/__tests__/helpers/guard-harness.ts`, one throwaway
project per row, shipped `hooks/config.json` protected list, **`FUSION_ALLOW_RULES_WRITE`
unset**. `effect` is the same command run through `bash` in the same project.

**`CDPATH`, the mechanism and its control:**

```
  command                                                  guard   effect
  cd docs && CDPATH=.. cd agents && rm coder.md            allow   agents/coder.md deleted
  cd docs && export CDPATH=.. && cd agents && rm coder.md  allow   agents/coder.md deleted
  cd docs && cd agents && rm coder.md          (control)   allow   agents/coder.md intact
```

The control is the point: the same command without the assignment allows too, but bash leaves
the file alone, because `docs/agents/coder.md` does not exist. `CDPATH` is what makes the
allow consequential.

**Reach, one fresh project per row:**

```
  cd docs && CDPATH=.. cd agents && rm coder.md                               allow  deleted
  cd docs && CDPATH=.. cd hooks && rm config.json                             allow  deleted
  cd docs && CDPATH=.. cd skills/demo && rm SKILL.md                          allow  deleted
  cd docs && CDPATH=.. cd rules && rm x.md                                    allow  deleted
  cd docs && CDPATH=../fusion-workbench cd .guard-state && rm escalation.json allow  deleted
  cd docs && CDPATH=.. cd agents && echo pwned > coder.md                     allow  OVERWRITTEN
  cd docs && CDPATH=.. cd agents && cp /dev/null coder.md                     allow  OVERWRITTEN
```

That is `agents/**`, `hooks/config.json`, `skills/**`, `rules/**` and the guard's own halt
record, by delete and by write, on one surface, with no flag.

**`pushd -n`:**

```
  pushd -n docs && rm agents/coder.md              allow  agents/coder.md deleted
  pushd -n docs && echo pwned > agents/coder.md    allow  agents/coder.md OVERWRITTEN
```

**What bounds the `CDPATH` fix**, verified against real bash on a temporary tree rather than
against the guard, because it is a property of bash and not of this code:

```
  CDPATH=.. cd agents         -> lands outside the current directory
  CDPATH=.. cd ./agents       -> lands inside  (CDPATH not consulted)
  CDPATH=.. cd ../junk/agents -> lands inside  (CDPATH not consulted)
```

`CDPATH` is consulted only for a bare-word operand. An operand beginning with `/`, `./` or
`../` is immune, so the classifier's model stays correct for those and only the bare-word case
has to degrade.

## Severity, argued rather than asserted

**High, not Critical**, on the same reasoning `260803-1431` recorded for itself, and the second
half of that reasoning is what holds it down.

- Reach is the whole protected list, on both the delete and the write route, which is Critical
  reach.
- No flag is needed, which is **worse** than `260803-1431` on that axis.
- But an agent that wanted the same effect already has it, through the planted-alias residual
  this Circle documented as known and accepted in `ce7a125`
  (`ln -s ../agents/coder.md build/alias; echo pwned > build/alias`, measured allowed). Writing
  `CDPATH=..` in front of a `cd` is a deliberate route around the guard in exactly the way
  planting an alias is, and it does not extend an attacker's ceiling past an accepted residual.

What it does break is the claim in `rules/protected-path-discipline.md` that a protected-path
deny cannot be rephrased around, since that document loads into every agent's context in every
consuming project. The residual list there names the planted alias and does not name either of
these.

## Direction

Not decided here, but the two entrances have one fix and it is already on the table.
`260803-1431` direction 2 proposed treating `-P` as un-modellable and setting `CWD_UNKNOWN`.
Taken at its general form, that closes all three entrances at once: **invert `firstDirArg` from
a blanket flag skip to an allow-list of the flags the classifier actually models, and yield
`CWD_UNKNOWN` for anything else, including a `CDPATH` assignment ahead of a bare-word `cd`.**
The reasoning is in `analyses/260803-1803-guard-path-model-root-cause.md`.

`CWD_UNKNOWN` already exists, already means "the shell's location cannot be computed", and
already produces a fail-closed deny with a diagnosable reason. Measured on the same harness:
`cd $D && rm notes.txt` denies today with "this Bash command mutates a relative path from a
working directory the guard cannot determine". Nothing new has to be built.

Measured cost of the general form, the two command shapes that change verdict:

```
  cd -P docs && rm ../notes.txt     allow today   would deny
  cd -P build && rm out.js          allow today   would deny
```

`260803-1431` direction 1 (a `walkedUp` bit on `Cwd`) does **not** close either entrance here:
both need no `..` and both are protection-side, so neither gate 0 nor the grant is involved.

## Test coverage this needs

The suite is green at 1080 with both of these open. In the existing style:

- one case per row of the reach table above, asserting the deny and asserting the file survives
  a real `bash` run;
- the `CDPATH` control (no assignment) asserting the allow stays an allow, so the case cannot
  pass for the wrong reason;
- the three operand forms (`agents`, `./agents`, `../x/agents`) so the bare-word bound is pinned
  rather than described;
- `pushd -n DIR` followed by a relative write, and the `pushd DIR` control which must keep
  working.

## Reproduction

`probe-cwd.ts`, `probe-cwd2.ts` and `probe-cwd3.ts` from the T4-1 analysis session, each about
thirty lines against `guard-harness.ts`, with the `bash` execution inline so the guard verdict
and the effect on disk are read from one run. Every table above is their verbatim output. One
fresh project per row: three denials halt the guard and mask everything after.

## Origin

`circles/260801-1244-guard-rules-write`, task T4-1, while testing whether `cd -P` is the last
entrance into the class that has now been found four times in this Circle. It is not.
