# `DIR_BUILTINS` carries a shell-dependent fact about `chdir`, justified by a reason that is not why the row is right

---

**Severity:** Low
**Domain:** code (documentation of a security control)
**Filed by:** coderev, review of `048f3db` (Job 2 — "does the 'names it directly' condition have the same shape as the `runsBuiltins` mistake, one level down?")
**Affects:** `hooks/lib/bash-mutation-guard.ts:1788-1792` (`DIR_BUILTINS` and its comment)
**Kind:** PRE-EXISTING. `048f3db` did not touch this set; the review reached it by asking where else a name-keyed table carries a shell fact.
**Cross-references:**
`issues/260803-2236_c_…` (`runsBuiltins` — the same shape one table up, and the reason it was deleted),
`hooks/lib/command-word.ts:106-132` (the empty space where `runsBuiltins` was, and the sentence "the row cannot carry a claim about a shell").

---

## What is wrong

`DIR_BUILTINS` is commented:

> `chdir` is not a bash builtin at all, but it costs one set entry and **no program by that
> name does anything else**.

Measured, on this machine:

```
$ /bin/bash -c 'chdir /tmp && pwd'
  status 127   /bin/bash: chdir: command not found

$ /bin/zsh -c 'chdir /tmp && pwd'
  status 0     /tmp
```

**`chdir` IS a builtin in zsh**, and zsh is the shell the Bash tool runs
(`guard-bash-integration.test.ts:213-215` says so explicitly). So the row is not a
free-because-inert entry. It is load-bearing.

Measured, real guard subprocess for the verdict and a fresh project per shell for the effect:

```
guard   bash        zsh     command
block   present     GONE    chdir rules && rm x.md
block   UNCHANGED   GONE    chdir build && rm ../rules/x.md
ALLOW   UNCHANGED   UNCHANGED  chdir /tmp && rm rules/x.md
```

The first row is the one the entry buys, and it buys it alone: nothing else in the command
names a protected path, so without `chdir` in `DIR_BUILTINS` the model would resolve `x.md`
from the project root and allow — while zsh deletes `rules/x.md`, as the row shows.

The third row is safe, and it is safe **by accident of the joiner rules**, not by design: in
bash `chdir` returns 127, so `&&` short-circuits and the `rm` never runs; and after any
joiner that is not `&&` the model degrades and denies anyway.

## The shape

`command-word.ts` deleted `runsBuiltins` with the sentence *"the fact is therefore not a
property of the NAME this table is keyed on … and the row cannot carry a claim about a
shell."* `DIR_BUILTINS` is a table keyed on a name, and `chdir` is a claim about a shell —
true in zsh, false in bash. It is the same shape, one table down.

The difference that keeps it from being the same defect: `runsBuiltins`' true branch made the
model **follow** a `cd`, which is bidirectional and can move an operand off the protected
list. Here the pessimistic reading (treat it as a move) is what the classifier already takes,
and the shell that disagrees fails the command outright. So the verdict is right in both
shells today. What is wrong is only the recorded reason, and this Circle has spent several
Turns learning that a row justified by the wrong reason is a row the next editor removes.

`reachesBuiltin`'s own true branch (`command-word.ts:308` — no wrapper hop, no `/` in the
command word) is the same category of claim and is on firmer ground: its false branch is a
total give-up that can only deny, and its true branch was measured across `\cd`, `'cd'`,
`"cd"` and `/usr/bin/cd` in both shells. No counterexample was found for it in this review.
The residuals it leaves — a shell function named `cd`, an alias, `eval "cd …"`, a `source`d
script — are already documented at `:2380-2385`.

## Recommendation

Replace the comment with the measurement, in one or two lines:

> `chdir` is a builtin in **zsh** (measured: `zsh -c 'chdir /tmp && pwd'` prints `/tmp`) and
> is not one in bash (`command not found`, 127). The row is required for zsh, which is the
> shell the Bash tool runs; in bash it costs a false deny only after a non-`&&` joiner, since
> a failing `chdir` short-circuits `&&`.

And, so the class does not reappear: state next to the set that **every entry here is a claim
about a shell**, that the safe direction for such a claim is to include a name that only some
shells implement (over-deny), and that the unsafe direction — omitting one a shell does
implement — is what this row prevents. That is the generalisation `runsBuiltins`' removal
already reached for wrappers; `DIR_BUILTINS` never got it.

## Test coverage this needs

- `chdir build && rm ../rules/x.md` pinned as a deny with the **zsh** effect asserted, so the
  row cannot be removed as dead weight;
- `chdir /tmp && rm rules/x.md` pinned as an allow with the effect asserted UNCHANGED in both
  shells, so the row is not widened into a blanket give-up.

## Anti-vacuity

The deny row already denies through the `rm ../rules/x.md` operand, so it would pass with
`chdir` removed from the set — the assertion has to be paired with the zsh effect, or with a
variant whose protected reach exists only through the `chdir` (`chdir rules && rm x.md`).

---

**Step 3 disposition (coder, 2026-08-05) — A-shaped, foreign file. STAYS `_o_`.**

Branch A in kind: a recorded reason is false. The comment on `DIR_BUILTINS` says "no program
by that name does anything else", and `chdir` is a builtin in zsh, which is the shell the
`Bash` tool runs. It is a source comment in `hooks/lib/bash-mutation-guard.ts`, which step 3
does not own, and this step changes no source comment.

One of the six findings whose shape the plan's rule has no branch for; reported to the
orchestrator as such.

**Where it is answered.** `circles/260804-1205-shell-reachability-model` owns the tables the
directory model is keyed on, and this is the same shape as `runsBuiltins` one table up. This
issue's § Recommendation supplies both the replacement comment and the generalisation that
keeps the class from reappearing — state next to the set that every entry is a claim about a
shell, that including a name only some shells implement over-denies, and that omitting one a
shell does implement is the unsafe direction.

Recorded because it bounds the urgency: **the verdict is right in both shells today.** The
row is load-bearing and correct; what is wrong is the reason written beside it, and this
Circle has learned repeatedly that a row justified by the wrong reason is a row the next
editor removes.
