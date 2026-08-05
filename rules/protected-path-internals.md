# Protected-Path Discipline — how the classifier reads a command

**Provenance:** circles/260801-1244-guard-rules-write/decisions/260805-0709_i_wohin-gehoert-die-forensik-aus-protected-path-discipline.md

The reference half of `rules/protected-path-discipline.md`, loaded by `coder`, `coderev`
and `bugfixer` only. The addressee is what separates the two files: the core rule tells
an agent how to behave, this one tells whoever changes or reviews the classifier
(`hooks/lib/bash-mutation-guard.ts`) how it works. Nothing here is needed in order to
write a command that does not trip the guard.

The measured residual catalogue and the measured illustration set are the third layer,
outside `rules/` entirely because they are evidence for a review rather than instruction
for a behaviour: `fusion-workbench/circles/260801-1244-guard-rules-write/analyses/260805-0717-protected-path-forensics.md`.

## How the classifier reads a command

### The verb families

Recognition is table-driven (`MUTATION_VERBS` in `hooks/lib/bash-mutation-guard.ts`).
Three families:

| Family | Commands |
|---|---|
| Relocate or destroy | `mv`, `rm`, `cp`, `ln`, `install`, `git mv`, `git rm`, `git clean -f`, `git stash push` |
| In-place rewrite | `sed -i`, `perl -i`, `truncate`, `tee`, `dd of=…`, `git restore --source=…`, `git checkout <treeish> --` |
| Redirection | `>`, `>>`, `>|`, `N>`, glued (`>file`) or separated (`> file`) |

Redirection is scanned position-independently, because a redirection binds to the whole
simple command wherever it appears. `>` makes any program a mutation, including
`printf '' > rules/x.md` and `cat > rules/x.md <<'EOF'`. An operator inside a quoted
string is not one — bash redirects nothing there — so
`git commit -m "docs: rules/a.md -> rules/b.md"` is prose and is allowed.

Four of the git rows are conditional, which is what keeps their read and revert forms
allowed. `clean` and `restore` mutate only under a flag. `stash` is discriminated by its
**sub-subcommand** instead: only `git stash push` names working-tree paths, so a stash
ref, a `-m` message and the sub-subcommand word itself are never read as paths — from any
directory. `checkout` is discriminated by its **tree-ish**, which is where `restore`
carries a flag: restoring from `HEAD` is the revert strategy, restoring from anywhere
else is an overwrite.

| Allowed | Denied on a protected path |
|---|---|
| `git clean -n rules` (dry run) | `git clean -fdx rules`, and `git clean -fdx` at the project root |
| `git restore rules/x.md`, `git restore --staged rules/x.md` | `git restore --source=HEAD rules/x.md`, `git restore --source=HEAD~1 rules/x.md` |
| `git stash`, `git stash pop`, `git stash show "$REF"`, `git stash push -m "$MSG"` | `git stash push rules/x.md`, `git stash -- rules/x.md` |
| `git checkout HEAD -- rules/x.md`, `git checkout -- rules/x.md` | `git checkout HEAD~5 -- rules/x.md`, `git checkout otherbranch -- rules/x.md` |

The `checkout` row and the `restore` row are the same operation in two spellings, and
until 2026-08-04 they returned opposite verdicts everywhere: `checkout` was in no table, so
`git checkout HEAD~5 -- rules/x.md` overwrote a protected rule while
`git restore --source=HEAD~1 rules/x.md` denied. They now agree for every source **except
the literal `HEAD`**. **The revert strategy is untouched** — `git checkout HEAD -- <paths>`
restores a file to what is already committed, which is the one thing an agent could have
obtained by not touching the file, and fusion's own recovery path depends on it.

**The one source that still disagrees, and the spelling to write instead.**
`git checkout HEAD -- rules/x.md` allows. `git restore --source=HEAD rules/x.md` denies,
and so do `--source HEAD` and `-s HEAD`. Same operation, opposite verdicts, on purpose.
**Write `git checkout HEAD -- <paths>`.** That is the sanctioned spelling of the revert, it
is allowed everywhere this rule is loaded, and it is what a `restore` deny expects you to
reach for — reaching for anything else is rephrasing past a deny, which is the one thing
the core rule forbids. The cause is architectural rather than a judgement about the two
commands: `restore` is discriminated by the flag TOKEN, which never carries the value of a
separated `--source HEAD` at all, while `checkout` takes its source as a positional the
model sees in every spelling. Closing the gap by teaching `restore` the exception would make
a command **newly allow**, which nothing in this guard's history has done, so it is a
decision at the Human Gate rather than a patch
(`decisions/260804-1815_a_should-git-restore-source-head-become-inert-…`).

Two costs come with the `checkout` row, and both are rules rather than lists:

- **Only the literal `HEAD` is proven inert.** The set of spellings that denote the same
  commit is open — `@`, `HEAD~0`, `HEAD^0` and the current branch's own name are examples
  of it, and all deny.
- **Without `--`, the first positional is read as the tree-ish**, the way git reads it, so
  every later path is a written operand: `git checkout rules/x.md agents/coder.md` denies
  on `agents/coder.md`, and `git checkout docs rules/x.md` denies on `rules/x.md`.

Both have the same way through, and it is the documented spelling:
`git checkout HEAD -- <paths>`.

**Which of the two policies answers a bare `git checkout` is not this rule's choice**, and
the table above is only this classifier's verdicts. `git-branch-discipline.md` sees the
command first and lets the `--`-less form through only when the first operand names a file
that exists on disk and is not also a ref. So `git checkout rules/a.md rules/b.md` (no such
file) and `git checkout HEAD rules/x.md` (a ref) are **branch-policy** denies carrying a
branch-policy reason, and never reach the paragraph above; `git checkout main` and
`git checkout -b feature` move HEAD, name no path here, and belong to that rule entirely. A
command allowed by one of the two policies can be denied by the other, and each deny reports
the permission you actually lack.

### git carries its own working directory

`git -C <dir>` and `git --work-tree=<dir>` say where git runs, and an operand after one of
them is not the path it looks like: `git -C rules rm x.md` deletes `rules/x.md`. Each `-C`
composes onto the last, and `--work-tree` composes onto the result.

An operand is checked **against every directory the guard can attribute to the
invocation** — the shell's own, and each directory a global option redirects git to. Both
readings have to be clear before the write runs, so:

| Allowed | Denied |
|---|---|
| `git -C build rm out.js`, `git -C /tmp rm junk` | `git -C rules rm x.md`, `git -C agents rm coder.md` |
| `git -C build clean -fdx`, `git -C rules status` | `git -C rules clean -fdx`, `git --work-tree=rules clean -fdx` |
| `git -C $D rm /tmp/junk` (absolute operand) | `git -C $D rm x.md` (relative, unknown directory) |

`git -C /repo mv rules/x.md docs/` **denies**, although `-C` says the operand belongs to
another repository. That is deliberate: the guard does not use a flag to argue a
spelled-out protected path away, the same way `mv $SRC rules/` denies on the visible
target. `--git-dir` names where the repository metadata lives, moves no pathspec, and
changes nothing.

`git clean` with no pathspec deletes **from the current directory down**, not from the
repository root — so `cd rules && git clean -fdx` and `git -C rules clean -fdx` both deny
on the directory they do not spell. **A plain `git clean -fdx` at the project root denies
too**, which is the other half of the same rule: `clean` writes *through* the directory it
is given rather than to it, so the project-root exclusion that lets `cp x .` past does not
apply to it. `git clean -fdx`, `git clean -fdx .`, `git clean -fd` and `git clean -f` all
deny at the root, on a reason that says the command "writes THROUGH a directory that holds
protected paths". Naming an unprotected directory is what stays allowed:
`git clean -fdx build`, `git -C build clean -fdx`, `cd build && git clean -fdx`. A `clean`
the guard cannot place at all — `cd $D && git clean -fdx`, or `cd build; git clean -fdx` —
fails closed rather than allowing, exactly as any other relative operand does.

One more shape of the same rule: **a git global option the guard cannot name is read both
ways**, because an option that takes a value can otherwise hide the subcommand behind it
(`git --namespace foo rm rules/x.md` reached `rules/**` that way). The cost is a false
deny of the shape `git <unknown-option> <non-subcommand> <mutation-verb> <protected>`;
`git --no-pager diff rm rules/x.md`, where `rm` is a file, is an example rather than the
case.

Only the operands a verb **writes** count. `cp rules/x.md /tmp/y` and
`dd if=rules/x.md of=/tmp/y` read a protected path and stay allowed; copying a protected
file's CONTENTS out is not the problem. Giving it a second NAME is a different act, and
the residual catalogue named at the end of the core rule says what the guard
does and does not do about it.

### Clustered short flags are read letter by letter

`sed` and `perl` mutate only in place, and the in-place flag is usually buried in a
cluster. The guard reads the cluster the way the tool does, which means knowing which
letters swallow the rest of the token as their own value and which do not:

| Denied — the `i` is a flag | Allowed — the `i` is inside a value |
|---|---|
| `perl -lpi -e 's/a/b/' rules/x.md` | `perl -Ilib rules/gen.pl` (`-I` takes a directory) |
| `perl -0pi -e '…' rules/x.md` | `perl -Mstrict rules/gen.pl` (`-M` takes a module) |
| `sed -ni 's/a/b/p' rules/x.md` | `sed -fscript.sed rules/x.md` (`-f` takes a file) |

`-lpi` is three flags because perl's `-l` takes at most a digit run, so the `p` and the
`i` after it are flags in their own right. `-Ilib` is one flag because `-I`'s directory
runs to the end of the token. Both spellings are everyday, which is why the distinction
is drawn per letter rather than per tool — and why `perl -Ci`, `-Di` and `-xi` are
*allowed*: those letters take a value too, so perl never sees an in-place flag there.

### The command word is resolved, not just read

Whatever stands between the start of a segment and its verb is skipped, so the verb
underneath is classified:

- a leading `VAR=value` **environment assignment** — `FOO=1 rm rules/x.md`;
- a **shell grammar word** — the compound-command heads and body introducers (`if`,
  `elif`, `while`, `until`, `then`, `else`, `do`), `!`, `{`, `(` and `coproc`. Both
  `if rm -rf rules; then :; fi` and `while :; do rm rules/x.md; done` are the `rm` row;
- a **wrapper program** that runs another program — `sudo`, `doas`, `env`, `command`,
  `builtin`, `exec`, `nice`, `ionice`, `timeout`, `xargs`, `time`, `nohup`, `setsid`,
  `stdbuf`. **`sudo` is not an escape**, and neither is chaining wrappers:
  `sudo env rm rules/x.md` is the `rm` row;
- a **path, quoting or a backslash escape** — `/bin/rm`, `'rm'`, `"rm"` and `\rm` all
  name `rm`. `\rm` is the idiom for suppressing an alias, and it runs the same program.

### Only the plain forms of a directory builtin are tracked

**Only the plain forms are tracked, and the rest admit they are untracked.** The
tracking is exact for bash's default `cd`, which resolves `..` against `$PWD` textually.
Several bash modifiers change that rule, and the guard models none of them — it does not
guess, it stops claiming to know where the shell is standing:

| Written | Why it is not modelled |
|---|---|
| `cd -P x`, `pushd -P x` | physical resolution — the kernel resolves a symlink component before `..` is taken |
| `set -P`, `set -o physical` | the same, for every later `cd` in the command |
| `pushd -n x`, `popd -n` | edit the directory stack **without** changing directory |
| `CDPATH=.. cd x`, `export CDPATH=..` | a bare-word operand may be found under a `CDPATH` entry instead |
| `CDPATH` set in the **environment** | the same, with nothing in the command to show for it |
| `pushd` with no operand, `pushd +2`, `pushd -2` | these **rotate** the directory stack; they do not push, and the guard does not model a rotation |
| **any** wrapper before the builtin — `command cd x`, `builtin cd x`, `time cd x`, `sudo cd x`, `env cd x`, `xargs cd x` | whether a wrapper runs a *builtin* depends on the wrapper, on the spelling and on which shell you are in, and the guard can read none of that off the text |
| a **path**-spelled builtin — `/usr/bin/cd x`, `/bin/pushd x`, `./cd x` | a path names an external program. `/usr/bin/cd` is a real binary; it changes its own process's directory and exits, and your shell stays put |
| any other flag on `cd` / `chdir` / `pushd` / `popd` | it has not been taught what the flag does |

After one of those, a relative operand of a table verb denies fail-closed and the reason
names the working directory. `cd -L`, `cd --` and every flagless form are unaffected, and
so is an operand that anchors itself: with a `CDPATH` in play, `cd ./x`, `cd ../x`, `cd .`,
`cd ..` and `cd /abs/x` still resolve exactly.

The cost is real and small: `cd -P build && rm out.js` and `cd -P docs && rm ../notes.txt`
denied nothing before and deny now. Write the path absolutely, or drop the `-P`.

**A `cd` behind a wrapper is seen, and then given up on.** The wrapper is walked, so the
guard knows a directory builtin is there — `command cd rules && rm x.md` does not slip past
as an unrecognised program. What it will not do is say *where the shell went*, because that
answer is not a property of the wrapper's name:

- `command cd x` moves **bash** and is inert in **zsh**, whose `command` forces an external
  lookup. Your `Bash` tool runs your login shell, which on this machine is zsh.
- `time cd x` moves the shell only as the bare reserved word. `\time`, `'time'`, `"time"`
  and `/usr/bin/time` all select the external program, which cannot run a builtin at all.
- `sudo cd x`, `env cd x` and the rest are external programs and never move the shell.

An earlier version of this guard modelled the first three as real moves, and that allowed
eleven commands the shell then executed against a protected file. Asserting a move you
cannot prove is **not** a safe over-deny: it relocates every later relative operand, which
denies when it lands on the protected list and *allows* when it lands off it.

So `command cd build && rm out.js`, `builtin cd build && rm out.js` and
`time cd build && rm out.js` now deny fail-closed, naming the working directory. Nothing is
lost — reaching a directory builtin through a wrapper does not make it do anything a bare
`cd` does not. **Drop the wrapper**, or name the path absolutely.

Two things are *not* affected, and both are the ordinary case. A wrapper in front of a
**verb** is walked exactly as before (`sudo rm rules/x.md` denies, `time npm test` and
`timeout 60 npm test` allow). And quoting or escaping the **builtin itself** is not the same
as spelling it as a path: `\cd build` and `'cd' build` were measured moving the shell in
both shells — `cd` is a builtin, not a reserved word — so they stay modelled exactly.

**The `pushd` rows are the ones to read twice**, because they cost a shape that used to
work. `pushd` with an operand pushes, and `pushd DIR … popd` is unaffected. `pushd` with
**no** operand swaps the top two stack entries and `pushd +N` / `pushd -N` rotate — none of
them changes the stack's depth, so the guard stops tracking rather than pushing an entry
bash does not have. Everything after one of them denies fail-closed until the command names
a directory again. Name the directory: `pushd ../build` instead of `pushd`.

**The environment row is the one you cannot read off the command.** Your shell is
initialised from the user's profile, so an `export CDPATH=…` there sends every bare-word
`cd` down a search list — bash and zsh both take the first entry that has the name, which
need not be the current directory. When that variable is set, `cd build && rm out.js`
denies although every word in it is a literal. That deny says so in its own words:

```
fusion policy: CDPATH is set in this shell's environment, so the guard cannot
determine the working directory. […] Two things clear it: anchor the `cd` operand
(`./x`, `../x` or an absolute path — CDPATH is not consulted for any of those), or
unset CDPATH in the environment.
```

Do what it says and nothing else. Rewriting the operand cannot help — the operand was
never the problem — and this is the deny most likely to look arbitrary, because the cause
is in a file you did not write and cannot see from here. If neither remedy fits the task,
that is a Human Gate: the user owns their profile.

A `CDPATH` that is empty or all whitespace counts as unset, so `export CDPATH=` costs
nothing. A `CDPATH` starting with `.` does **not** buy an exemption: bash falls through to
the next entry whenever the current directory does not hold the name, which is exactly the
case a relative `cd` is usually written for.

### Fail-closed, and its bound

**A recognised verb whose written operand cannot be resolved to a literal is denied.**
An operand is unresolved when it survives quote handling still carrying `$`, a
backtick, or a leading `~`, or when an earlier `cd` moved somewhere only known at run
time and the operand is relative.

This is the rule most likely to surprise you. All of these deny:

```
rm -rf ~/.cache/fusion          # the leading ~ is not resolved
sed -i "s/$A/$B/" notes.txt     # sed treats every positional as a target, script included
mv $A $B                        # nothing resolves
mv $SRC rules/                  # the visible protected target names the deny
cd $D && rm -rf out             # the directory `out` hangs off is unknowable
rm -rf "$(pwd)/build"           # a command substitution is an unresolved operand
cd -P build && rm out.js        # a `cd` modifier the guard does not model
pushd -n docs && rm ../x.md     # `-n` pushes without moving, so the base is unknown
pushd ../build && pushd && popd && rm out.js   # a bare `pushd` rotates, it does not push
sudo cd build && rm out.js      # `sudo` cannot run a builtin, so bash never moved
cd build; rm out.js             # `;` does not guarantee the `cd` succeeded
cd build && rm out.js           # ONLY with CDPATH set in the environment
```

The last one is the odd row out: with no `CDPATH` set — which is almost everyone, and the
environment fusion itself runs in — it allows, and nothing about this rule has changed for
you. It is listed because when it does deny, every word in it is a literal and there is
nothing to rephrase.

The bound is exactly this: **an unrecognised program is allowed however unparseable its
arguments are.** `curl -o $OUT https://x`, `make $TARGET` and `npm run $SCRIPT` are
untouched. The fail-closed rule never applies to ordinary shell work.

That includes a **redirection target**. `npm test > "$LOG"`, `npm test > "$TMPDIR/x.log"`,
`cat report.md > ~/backup.md`, `echo x > "$F"` and `echo x > "rules/$F"` are all allowed:
the program is outside the table and the *token* is what cannot be read.

**The bound is the token, not the program.** That distinction is the whole of it, and it
is the one thing to get right about this rule. A redirect target the guard cannot place
because it does not know **where the shell is standing** is a different case, and it
denies whatever the program is:

```
echo x > "$F"                    # allows — the TOKEN is unknowable, the directory is not
cd $D && echo x > y.md           # denies — `y.md` is literal; the DIRECTORY is unknowable
cd build && echo x > "$F"        # allows — same command, and here the directory IS known
```

The reason is that `y.md` has nothing unparseable in it. Nothing about the caller's text
is in doubt; the guard's own model of the working directory is. Left allowed, that route
overwrote `agents/coder.md` with no flag at all
(`pushd -n docs && echo pwned > agents/coder.md`), and every directory the guard learns to
give up on adds another entrance to it. It denies now — a reversal of half of an earlier
decision, argued in
`circles/260801-1244-guard-rules-write/decisions/260804-0106_i_should-the-fail-closed-bound-be-drawn-around-the-program-or-around-the-cause.md`.

What the bound also does *not* cover is a target that resolves: `sort /tmp/a > rules/x.md`
and `curl -s https://x > rules/x.md` are denied, and so is any redirection once the
segment names a table verb (`rm /tmp/a > "$F"`, `tee "$LOG"`).

When a fail-closed deny is wrong for your case, the way through is to write the path out
literally, to name it absolutely, to join the `cd` with `&&`, or to drop the `cd`. The deny
reason says which.
