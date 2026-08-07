# `GIT_WORK_TREE=` in the environment relocates the write, and the classifier reads no variable

---

**Severity:** High
**Domain:** code (security control)
**Filed by:** coder, Turn 10 task T10-1, while closing `260804-1024`
**Affects:** `hooks/lib/bash-mutation-guard.ts` (`verbOperands` / `resolveGit`); `hooks/lib/command-word.ts` (`resolveInvocation`, which drops the assignments); the residual lists in `rules/protected-path-discipline.md` and `README-hooks.md`, which now name it
**Kind:** PRE-EXISTING. The environment has never been read for anything but `CDPATH`. Not caused by any commit in this Circle.
**Cross-references:**
`260804-1024_c_…` (the command-line spelling of the same fact, closed in T10-1),
`decisions/260804-1323_i_…` (`## Answer`, where `--work-tree` is recorded and this is not),
`decisions/260803-1803_i_…` (the `CDPATH` decision — the only variable the classifier reads, and why).

---

## What is wrong

`git --work-tree=rules clean -fdx` now denies. The same fact spelled as an environment
assignment does not:

```
  allow  GIT_WORK_TREE=rules git clean -fdx
  allow  env GIT_WORK_TREE=rules git clean -fdx
```

Both delete `rules/x.md`. Measured in a fresh repository, bash and zsh, git 2.49.0:

```
>>> GIT_WORK_TREE=rules git clean -fdx
    Removing junk.txt
    Removing x.md
    [rules/x.md=GONE]
>>> env GIT_WORK_TREE=rules git clean -fdx
    Removing junk.txt
    Removing x.md
    [rules/x.md=GONE]
```

The control, which proves the greps discriminate:

```
  DENY   git --work-tree=rules clean -fdx
```

A leading `VAR=value` assignment is VISIBLE to the classifier — `FOO=1 rm rules/x.md`
denies, because `findCommandWord` steps over the assignment to reach the verb. It steps
over it and discards it, so the value never reaches the git handling.

## Why it was not closed with its command-line sibling

Three reasons, and the third is the one that decided it:

1. It is a different mechanism. The classifier resolves no variable, ever — `resolveWord`
   is the single authority on what a word denotes, and `CDPATH` is a deliberate,
   argued exception (`decisions/260803-1803_i_…`). Reading a second variable is a change
   to that boundary, not an extension of the `-C` fix.
2. The direct spelling could be closed in ten lines by scanning the leading assignment run
   in `classifyWords`. The WRAPPER-hopped spelling could not: `skipWrapper` consumes
   `env FOO=1 git …`'s assignment inside `command-word.ts`, which the git BRANCH classifier
   shares, and T10-1's scope excludes moving anything the branch policy reads.
3. Closing one spelling and leaving the other recreates exactly the asymmetry
   `260804-1026` was filed about — same operation, different spelling, opposite verdict —
   at the same moment that finding is being closed.

So it is filed rather than half-closed, and it is on both residual lists at HEAD.

## Candidate directions

1. **Read `GIT_WORK_TREE` (and `GIT_DIR`) off the leading assignment run**, and extend
   `Invocation` to carry the assignments a wrapper consumed so the `env …` form is covered
   too. Closes both spellings. Touches `command-word.ts`, which the branch classifier
   shares — additive, but it needs the gold fixture re-checked.
2. **Read only the direct spelling.** Ten lines, no shared file. Leaves the wrapper form,
   which is the asymmetry above.
3. **Document as a residual.** Done at HEAD regardless of what follows; it is the floor,
   not the answer.

Direction 1 wants a decision record: "which environment variables does the classifier
read, and what makes one different from `$SRC` in `mv $SRC rules/`" is a boundary
question, not an implementation detail.

## Measured inert, and worth recording as such

`git -c core.worktree=rules clean -fdx` does NOT relocate at git 2.49.0 — it removed the
untracked files under the ordinary root and left `rules/x.md` alone. It is not a route
today and is not modelled. Recorded because "config can relocate the work tree" is a
plausible-sounding claim that a reader would otherwise have to re-measure.

## Test coverage this needs

- both spellings above as denies, with the real-shell effect asserted, in bash and zsh;
- `GIT_WORK_TREE=build git clean -fdx` as the cost control;
- `GIT_WORK_TREE=$D git clean -fdx` fail-closed;
- the `-c core.worktree=` row pinned as an ALLOW with a comment naming the measurement, so
  a later reader does not add it on plausibility.

## Anti-vacuity

Both rows allow at HEAD, so neither can pass vacuously. When they close,
`GIT_WORK_TREE=build git clean -fdx` must be pinned as an allow — a test that only pinned
the protected rows could not tell a fix from a blanket give-up on every git invocation
carrying an assignment.

---

**Step 3 disposition (coder, 2026-08-05) — branch B, the gap written down. STAYS `_o_`.**

Not fixed, deliberately. Reading a second environment variable reopens the boundary
question this issue's own § "Why it was not closed with its command-line sibling" names,
and that is the course the user stopped. The honest treatment of a real bypass is the
residual plus an open marker, which is what the plan
(`planning/260804-2356_o_…ausstieg…`, step 3, branch B) prescribes for exactly this
finding, High severity included.

**What landed instead, and the check that makes it more than a claim.** The plan's second
falsification test for this step is whether any sentence in either rule layer still asserts
a coverage this issue refutes. **One did.**
`rules/protected-path-internals.md` `### git carries its own working directory` said an
operand is checked "**against every directory the guard can attribute to the
invocation**" — a sentence an agent can only read as coverage. It now says "each directory
a global option **on the command line** redirects git to, plus the shell's own", and the
paragraph that follows draws the boundary explicitly with the control that separates the
two spellings:

```
cd build && GIT_WORK_TREE=../rules git clean -fdx        allow   → rules/ emptied
cd build && env GIT_WORK_TREE=../rules git clean -fdx    allow
cd build && git --work-tree=../rules clean -fdx          DENY    → rules
```

The wrapper-hopped row was argued from the mechanism when this issue was filed and is now
**measured**; the forensics catalogue carries the same three rows. Both files also carry
the warning this issue's § "Measured inert" asks for in a different shape:
`GIT_WORK_TREE=rules git clean -fdx` **does** deny at the project root, on the root's own
write-through rule and not because the variable was read, so that deny must not be read as
coverage.

**The core rule names the residual too**, in its closing pointer, so an agent knows the
route exists without opening a catalogue nothing loads.

**Where it goes is not decided here.** The plan's own open question asks whether this
belongs in `circles/260804-1205-shell-reachability-model` or in a Circle of its own and
answers *probably its own* — it is an environment-variable problem, not a reachability
problem. That is a user decision. Meanwhile the residual is citable from both rule layers
and from the forensics analysis, which is the bound the plan's risk table relies on: a
residual in a document is findable, a closed issue is not.

---
Resolved: Der Gegenstand existiert nicht mehr, in beiden Hälften. Der Erkenner, der die Umgebung nicht las (`verbOperands`, `resolveGit` in `hooks/lib/bash-mutation-guard.ts`), ist mit `ba7ccda` gelöscht; `command-word.ts` bleibt zwar, löst aber nur noch das Programmwort für die Branch-Politik auf und entscheidet über keinen geschriebenen Pfad. Die Residuen-Listen in `rules/protected-path-discipline.md` und `README-hooks.md`, die diesen Fall namentlich führten, sind mit `436d78c` neu geschrieben: die Regeldatei steht bei 53 Zeilen und beschreibt die Messung, nicht mehr 21 Löcher. Am Baum nachgeprüft in der Reconciliation 260807-1515 gegen HEAD `e684eae`. Sachlich ist der Fall damit gelöst und nicht nur weggeräumt: `GIT_WORK_TREE=` verlegt den Schreibvorgang weiterhin, aber die Messung sieht die veränderte Datei danach, gleich auf welchem Weg sie verändert wurde.
