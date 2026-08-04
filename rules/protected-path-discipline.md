# Protected-Path Discipline (shell writes)

**Provenance:** circles/260801-1244-guard-bash-inspection

This rule is loaded for every agent. It is the shell half of the compliance guard's
protected-path policy, and it is enforced by the PreToolUse guard hook
(`hooks/guard.ts` → `hooks/lib/bash-mutation-guard.ts`), not by your goodwill. Every
`Bash` call is parsed before it runs, and a command whose written operands land on
`guard.protectedPaths` is denied.

The sibling rule `git-branch-discipline.md` covers the other `Bash` policy, which is
about moving HEAD. The two are independent: different verbs, different overrides,
different stand-down behaviour.

The point of this text is that you never meet the deny in the first place. It explains
what the guard denies, what stays allowed, and what to do when a task seems to need a
denied command.

## The rule

**Agents never write a protected path through a shell.** `guard.protectedPaths` in
`hooks/config.json` is the same list that already blocks `Write`, `Edit`, `MultiEdit`
and `NotebookEdit`. Before this check existed, `mv rules/x.md /tmp/` moved a protected
file with no tool the guard inspected. It no longer does.

The list is `agents/**`, `rules/**`, `skills/**`, `hooks/config.json`,
`hooks/hooks.json`, `settings.json`, `bin/monitor`, `.claude-plugin/plugin.json` and
`fusion-workbench/.guard-state/**`. It lives in the plugin's own `hooks/config.json`,
which the guard finds by walking up from the hook module, so every project on this
plugin gets the same list. The patterns are **project-relative**: in a consuming
project `rules/**` means that project's own `rules/` directory, not the plugin's.

### The match is textual, and case-insensitive

The comparison is on the path's **text** — no symlink is resolved on this side, and the
residual list at the end says what that costs — and it **folds case**. `rm AGENTS/coder.md`
denies exactly as `rm agents/coder.md` does, and so do `Edit HOOKS/config.json`,
`Edit Rules/x.md`, `echo x > Agents/coder.md` and `rm -rf RULES`. Until the fold landed,
the whole list was bypassable by shifting one letter on any case-insensitive filesystem,
which is every stock macOS install and a case-insensitive Windows volume.

The fold is **unconditional**, not conditional on the filesystem, so the boundary reads
the same on every platform rather than having to be looked up per machine. On a
case-sensitive filesystem that over-blocks: `AGENTS/coder.md` really is a second file
there, and it is denied anyway. Measured on a case-sensitive volume, with both files
present and different: `Edit AGENTS/coder.md` denies. That is the accepted cost, and it is
the direction the fail-closed rule below already chooses.

The **exemption does not fold**. With `FUSION_ALLOW_RULES_WRITE` set, `Edit rules/x.md` is
allowed while `Edit RULES/x.md` is denied — the protected set widened and the grant did
not, which is the only direction a guard may move. Spell a rule path the way the rule
directory spells it.

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
| `git clean -n rules` (dry run) | `git clean -fdx rules` |
| `git restore rules/x.md`, `git restore --staged rules/x.md` | `git restore --source=HEAD~1 rules/x.md` |
| `git stash`, `git stash pop`, `git stash show "$REF"`, `git stash push -m "$MSG"` | `git stash push rules/x.md`, `git stash -- rules/x.md` |
| `git checkout HEAD -- rules/x.md`, `git checkout -- rules/x.md`, `git checkout main` | `git checkout HEAD~5 -- rules/x.md`, `git checkout otherbranch -- rules/x.md` |

The `checkout` row and the `restore` row are the same operation in two spellings, and
until 2026-08-04 they returned opposite verdicts: `checkout` was in no table, so
`git checkout HEAD~5 -- rules/x.md` overwrote a protected rule while
`git restore --source=HEAD~1 rules/x.md` denied. Now they agree. **The revert strategy is
untouched** — `git checkout HEAD -- <paths>` restores a file to what is already committed,
which is the one thing an agent could have obtained by not touching the file, and fusion's
own recovery path depends on it.

Two costs come with the row, and both are rules rather than lists:

- **Only the literal `HEAD` is proven inert.** The set of spellings that denote the same
  commit is open — `@`, `HEAD~0`, `HEAD^0` and the current branch's own name are examples
  of it, and all deny.
- **Without `--`, the first positional is read as the tree-ish**, the way git reads it, so
  `git checkout rules/a.md rules/b.md` denies on the second path.

Both have the same way through, and it is the documented spelling:
`git checkout HEAD -- <paths>`.

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
on the directory they do not spell, while a plain `git clean -fdx` at the project root
still allows.

One more shape of the same rule: **a git global option the guard cannot name is read both
ways**, because an option that takes a value can otherwise hide the subcommand behind it
(`git --namespace foo rm rules/x.md` reached `rules/**` that way). The cost is a false
deny of the shape `git <unknown-option> <non-subcommand> <mutation-verb> <protected>`;
`git --no-pager diff rm rules/x.md`, where `rm` is a file, is an example rather than the
case.

Only the operands a verb **writes** count. `cp rules/x.md /tmp/y` and
`dd if=rules/x.md of=/tmp/y` read a protected path and stay allowed; copying a protected
file's CONTENTS out is not the problem. Giving it a second NAME is a different act, and
the residual list below says what the guard does and does not do about it.

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

### An ancestor directory is covered, in both directions

An operand that is not itself protected still denies when it is a directory containing
a protected path.

- **Destroying or relocating it.** `rm -rf rules`, `rm -rf hooks` and `mv hooks /tmp`
  deny, because they would take `rules/**` and `hooks/config.json` with them.
- **Writing into it.** `cp /tmp/x hooks/` denies, because a destination directory is
  how a protected file gets overwritten without ever being named.

Ordinary build output is unaffected: `rm -rf node_modules`, `rm -rf dist` and
`rm -rf hooks/dist` all allow, because none of them is an ancestor of a protected
pattern. The project root is excluded on purpose, so `cp x .` allows.

### A `cd` is tracked

The guard carries a virtual working directory across a compound command's segments, so
a relative path after a `cd` still resolves. `cd fusion-workbench && rm -rf .guard-state`
denies and the reason names `fusion-workbench/.guard-state`. `cd build && rm -rf out`
allows. Walking out of the project is tracked as faithfully as walking in, so
`cd /tmp && rm -rf x` allows.

The tracking is scoped the way bash scopes it: a `cd` inside `(…)` or `$(…)` is
discarded when the scope closes, so `(cd rules && ls) && rm x.md` deletes `x.md` from
the project root and is allowed.

One consequence worth knowing: `rm -rf .` at the project root allows (the root is not
treated as an ancestor, and `rm` refuses it anyway), but `cd rules && rm -rf .` denies,
because the `cd` gave `.` a name.

**Write `&&`, not `;`.** The guard has no filesystem, so it cannot know whether a `cd`
*succeeded*. `&&` is the only joiner it accepts as an answer: bash will not run the
right-hand side unless the left-hand side returned zero. After `;`, `||`, `|`, `&` or a
bare newline the shell runs the next segment from where it never left — so
`cd nonexistent; rm rules/x.md` deletes the real rule while a guard that followed the `cd`
would be looking at `nonexistent/rules/x.md`. It used to follow it. It now gives the
directory up instead.

### The rule, so you can predict a case this file does not list

> Once a `cd`, `chdir`, `pushd` or `popd` is **written**, the working directory is unknown
> in every segment that is reachable without an `&&` from that point on — **and from the
> builtin itself, if the builtin's own segment is not one the shell both reaches and runs
> in the calling shell.** A mutation with a **relative** operand in such a segment is
> denied fail-closed, naming the joiner that caused it.

The rule asks the same question about the segment that **moves** as about the segment that
**writes**, because a joiner tells you two different things and both matter. Written out:

| The joiner in front of a segment | May a `cd` behind it be carried forward? | Does a `cd` **in** it move your shell? |
|---|---|---|
| start of the command, `&&` | yes | yes |
| `;`, a newline, `&` | no | yes |
| `\|\|`, `\|` | no | **no** |

`;`, a newline and `&` reach the segment, so a `cd` there really is attempted — whether it
*succeeded* is the first column's question. `||` may skip the segment entirely (`A || B && C`
is `(A || B) && C`, so reaching `C` proves nothing about `B`), and `|` runs it in a bash
subshell that cannot move its caller. Anything not in this table counts as **no** to both.

Four questions decide any command, in order:

1. **Does it contain a directory builtin at all?** No → this rule cannot touch it, whatever
   its joiners are. `ls; rm out.js` and `npm test; rm build/out.js` allow, and always did.
2. **Is the joiner in front of the builtin's own segment one that moves your shell?** No —
   it is a `||` or a `|` → the directory is unknown from there on, whatever follows.
3. **Is every joiner between that builtin and the write an `&&`?** Yes → the model stays
   exact and this rule denies nothing.
4. **Does the writing segment name a relative path** — an operand *or* a redirection
   target? No → nothing to place, nothing to deny.

Three words in the rule carry most of the surprises.

**"Reachable", not "next".** The give-up is not "a `;` right after the `cd`". It fires for
any segment reached **unconditionally**, however far down, and the `;` may be nowhere near
the `cd`:

```
cd hooks && npm run build; rm -rf dist      # denies — `rm -rf dist` runs whatever happened
cd hooks && npm run build && rm -rf dist    # allows — nothing reaches it unconditionally
```

**"Unknown", not "denied".** Losing the directory costs nothing by itself. A `pushd … ; popd`
idiom degrades and then writes nothing relative, so it allows; so does `cd hooks; npm test`,
and so does `cd hooks; rm /tmp/x`, whose target names itself.

**"Written", not "run".** The guard reads a `cd` that may never execute exactly as it reads
one that does. `true || cd build && rm out.js` and `echo hi | cd build && rm out.js` deny,
and so does `[ -d nope ] || cd build && rm out.js` — where the `cd` genuinely *does* run,
because its left operand failed. What separates that last row from the first is an exit
status, and no static classifier will ever have one. The over-deny is the price of not
allowing the first two, which delete a protected file in a real shell.

### Illustrations, not a list

Every row below is measured. They are **examples of the rule above**, and the set is open —
if you can answer the three questions for a command you have not seen here, you have the
rule; if you cannot, re-read it rather than looking for your command in the table.

```
DENY   cd build; rm out.js
DENY   cd docs; rm ../notes.txt
DENY   mkdir -p build && cd build; rm out.js
DENY   cd hooks && npm run build; rm -rf dist
DENY   cd build || exit 1; rm out.js
DENY   cd hooks; npm test > out.log              # a redirection target is an operand
DENY   cd hooks; npm ci > install.log 2>&1
DENY   cd build<newline>rm out.js                # a bare newline is a joiner like `;`
DENY   if cd hooks; then rm -rf dist; fi         # over-deny, see below
DENY   while cd build; do rm out.js; break; done # over-deny, see below
DENY   cd hooks && npx tsc | tee typecheck.log   # over-deny, see below
DENY   true || cd build; rm out.js               # the `cd` may never have run
DENY   true || cd build && rm out.js             # …and `&&` does not rescue it
DENY   echo hi | cd build && rm out.js           # bash runs a pipeline stage in a subshell
DENY   [ -d nope ] || cd build && rm out.js      # here the `cd` DOES run — over-deny, see below
DENY   cd rules && true || cd /tmp && rm x.md    # an absolute `cd` cannot re-prove it either
DENY   until cd build; do rm out.js; break; done # `until` runs its body when the `cd` FAILED

allow  cd build && rm out.js
allow  true; cd build && rm out.js               # `;` reaches the `cd`, `&&` carries it on
allow  ls & cd build && rm out.js                # `A & cd B` runs the `cd` in the foreground
allow  cd hooks && npm run build && rm -rf dist
allow  cd hooks &&<newline>  npm run build &&<newline>  rm -rf dist
allow  ls; rm out.js
allow  npm test; rm build/out.js
allow  pushd hooks && npm test; popd
allow  cd hooks; npm test
allow  cd hooks; rm /tmp/x
allow  cd hooks; npm test > /tmp/out.log
```

An earlier version of this section said "the cost is these five shapes, and nothing else
measured moved". That was false in the context you read it in, and the way it was false is
worth knowing: the five came from a corpus harvested out of the guard's own test suite,
which can only ever reproduce what the suite already contains. A generated cross-product
moved **ten of thirty** ordinary shapes (`issues/260804-0840…`). The fix is not a longer
list — it is the rule above.

Each denial has two ways through, and the deny reason names both: join with `&&`, or name
the target absolutely. `&&` is usually the better one, because it is also what makes the
command correct in the shell — `mkdir -p build && cd build` is written that way for the
same reason.

**A newline after `&&` is part of the `&&`.** Bash's grammar puts the newlines inside the
operator, so a multi-line chain is its single-line form and the guard reads it that way:

```
cd hooks &&
  npm run build &&
  rm -rf dist            # allows, exactly as the one-line version does
```

For one commit this denied, with the reason *"Join the `cd` to what follows it with `&&`"* —
an instruction to do what the command already did (`issues/260804-0838…`, fixed). If you
ever meet a deny whose remedy you have already applied, that is a bug in the guard and not
a puzzle to solve by rewriting: report it.

The give-up respects scope. A `cd` bash itself discarded casts no doubt forward, so
`(cd nonexistent); rm x.md` still resolves `x.md` from the project root.

**One honest edge, still open, and it costs rather than leaks.** The rule above is what the
guard implements; the shell is slightly different in one place.

- **The guard over-denies a `cd` the shell does in fact guarantee.** A conditional body, a
  loop body, a brace group and a pipeline stage all reach their write on a condition the
  shell has already tested, so `if cd hooks; then rm -rf dist; fi`,
  `while cd build; do rm out.js; break; done` and `cd hooks && npx tsc | tee typecheck.log`
  are safe and denied anyway (`issues/260804-0839…`). Cost, not hazard. `&&` or an absolute
  path clears them. The compound-command family is **not** uniform, which is why this is a
  model to be built rather than a list to be exempted: `until cd X; do W; done` runs its
  body when the `cd` *failed*, so its deny is correct and has to survive the fix.

The edge that used to sit beside it — `&&` read as a stronger guarantee than bash gives —
is **closed**. `true || cd build && rm rules/x.md` and `echo hi | cd build && rm rules/x.md`
used to be allowed and did delete the rule in a real shell; the joiner is now consulted for
the segment that moves as well as for the one that writes, and both deny
(`issues/260804-0836…`, `260804-0837…`, closed by `decisions/260804-0947…`).

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

### The overrides waive only what they name

`FUSION_ALLOW_BRANCH_SWITCH` and `FUSION_ALLOW_WORKTREE` lift the branch and worktree
denies from `git-branch-discipline.md`. They say nothing about the protected paths.
With `FUSION_ALLOW_BRANCH_SWITCH=1`, `git switch main && rm rules/x.md` still denies,
and the reason names `rules/x.md` rather than the branch policy: each case reports the
permission you actually lack.

**There is no override for a protected-path shell write.** That is deliberate. The
answer is the Human Gate below.

## What stays allowed

- Reading anything: `cat`, `grep`, `jq`, `sed -n`, `wc`, `git diff`, `git log`.
- Copying *out of* a protected path: `cp rules/x.md /tmp/backup`,
  `cp -R rules /tmp/backup`.
- `git checkout HEAD -- rules/x.md` — fusion's own revert strategy, always allowed. It is
  the **literal `HEAD`** form that is allowed, not `git checkout` as such: any other
  tree-ish writes content from elsewhere over the path and denies. Restoring from the
  index (`git checkout -- rules/x.md`) is allowed too.
- Every mutation whose targets are outside the protected list: `rm -rf node_modules`,
  `sed -i '' 's/a/b/' notes.txt`, `mv build/out.js dist/`.
- Everything the guard does not recognise as a mutation, whatever its arguments.
- `echo hi 2>&1` and `>&2`, which name a file descriptor rather than a file.
- Quoted text that is not a command: `echo 'rm -rf rules/'` is inert, as is a
  **quoted-delimiter** heredoc body (`<<'EOF'`). Double quotes are inert too as long as
  there is nothing in them for bash to expand, which is what makes
  `git commit -m "moves rules/a.md -> rules/b.md"` an ordinary commit. A double-quoted
  span carrying `$`, a backtick or an escape stays code, so `echo "$(rm rules/x.md)"` is
  still denied.

One practical consequence of that last point. An **unquoted** heredoc delimiter (`<<EOF`)
leaves the body as code, because bash still expands there, so a heredoc body that happens
to contain `rm rules/x.md` is classified and denied. This is deliberate. When you write a
heredoc whose body contains shell-looking text, quote the delimiter: `<<'EOF'`.

## What to do instead

If a task genuinely requires writing a protected path from a shell:

1. **STOP.** Do not rephrase the command. The guard segments on `;`, `&&`, `||`, `|`,
   `&` and newlines, splices backslash line continuations, inspects `$(…)` and backtick
   subshells, reads single- and double-quoted operands as the paths they are, removes
   backslash escapes, and sees through grammar words and wrappers. A differently-worded
   command is the same command.
2. **Do not re-route through `Edit` or `Write`.** They are guarded on the same list.
   Routing around one surface to reach the other is the failure this rule exists to
   prevent.
3. **Human Gate.** Surface the situation to the user and ask. The hook only ever sees
   an agent's tool calls, so the user can perform the move in their own terminal, or
   adjust `guard.protectedPaths` in the plugin's `hooks/config.json`, or tell you to do
   something else entirely.

The shape of the alternative, concretely. Retiring a rule file with
`mv rules/old.md rules/retired/old.md` denies on both operands. What you do instead is
propose the retirement: name the file, say why it should go, say where it should land,
and let the user move it. Then continue with the work that depended on it.

### What a halt costs you

Three consecutive guard denials put the guard into halt mode, and a halt blocks **both**
surfaces until a human clears it: every `Write`, `Edit`, `MultiEdit` and `NotebookEdit`
call, and every `Bash` command the classifier recognises as a mutation. On the shell it is
broader than the protected-path check it sits above, because it asks only whether the
command writes a file at all. `rm notes.txt` and `echo hi > out.txt` are denied under a
halt although neither goes near a protected path.

The deny you meet on the shell is not the protected-path message. It reads:

```
[HALTED] All file-mutating shell commands are blocked. The guard has been halted
after repeated violations. Read-only commands still run.
Run: node <plugin-root>/hooks/dist/clear-halt.js to reset.
```

That is not a new or unfamiliar policy, and there is nothing in the command to rephrase.
A write tool under the same halt says `[HALTED] All write operations blocked.` instead —
same halt, different surface. A protected-path shell write under a halt reports the halt
rather than the path, because the halt is the condition that has to be cleared first.

Reading still works, on purpose: `cat`, `ls`, `git status` and `git diff` all run under a
halt, so you can find out what happened and tell the user how to clear it. Clearing it is
a human act. Do not try to route around a halt; report it.

So retrying a denied command twice more costs you the write tools **and** every mutating
shell command for the rest of the session, not just the one call.

## Where this check does not reach

The guard raises the cost of writing a protected path from zero to deliberate. **It does
not make it impossible, and no claim that `protectedPaths` is enforced should be made
without that qualification.** A shell can construct a path at run time, and fail-closed
covers the constructible cases the classifier can see, not every case. Completeness is
not the target.

The gaps come in two shapes, and the second is the one that surprises people: writes the
classifier cannot SEE, and writes it sees in full and allows anyway, because the path the
command names is not the file the write reaches.

Known and accepted:

- **Operands that arrive on stdin are invisible.** `find rules -name '*.md' | xargs rm -rf`
  is allowed, because `xargs` receives its operands on the pipe rather than as words.
- **An unrecognised program that writes a protected path still writes it.**
  `curl -o rules/x.md …`, `python3 -c "…"`, `eval '…'`, `bash -c '…'`, `parallel`, and a
  project's own build script are all outside the table. `eval` and `bash -c` are outside
  it for a specific reason: they take a STRING that bash re-parses, so there is no
  argument list to walk the way there is for `sudo`.
- **An alias to a protected file can be created, and written through.** Unlike the two
  above, the guard sees the whole command and resolves every operand. Measured:
  `ln -s ../agents/coder.md build/alias` and `cp -l agents/coder.md
  build/hardalias` are both allowed, because `ln` and `cp` write only `build/alias` and
  `build/hardalias` and neither of those is protected — the source is a read. Afterwards
  `echo pwned > build/alias` is allowed too, on both surfaces, and `agents/coder.md` now
  reads `pwned`. The protection side decides on the TEXT of a path (`lib/paths.ts`), so
  any shell can manufacture a second, unprotected name for a protected file. Closing this
  means resolving every guarded path through the filesystem, which is a different design
  with a different cost. Until then it is the cheapest route around the guard there is,
  and reaching a protected file this way is the same denial you would have got by naming
  it: the guard raises the cost of a deliberate act, and routing around a deny is what
  this rule forbids regardless of mechanism.
- **Shell grammar that puts an ordinary-looking word in command position is not seen.**
  A `case` arm (`build) rm rules/x.md;;`) and a function definition
  (`f() { rm rules/x.md; }`) both leave a word the classifier cannot tell apart from a
  program name, so the verb behind it is never reached.
- **A `cd` the classifier cannot see as a `cd` still moves the shell.** Same mechanism as
  the row above, aimed at the directory model rather than at a verb: `eval "cd rules"`
  hides the builtin inside a string bash re-parses, a shell function or an alias named `cd`
  puts an ordinary word in command position, and `source script.sh` runs a `cd` written in
  another file. None of the three is reachable by a textual classifier, and after any of
  them the guard is modelling a directory the shell has left. A wrapper (`command cd`) and
  a path spelling (`/usr/bin/cd`) *are* seen, and give up rather than guess; these are what
  is left, and no enumeration closes them.
- **A `cd` that FAILS is no longer followed, and that is a cost rather than a gap.** The
  classifier still has no filesystem access and still cannot know whether a `cd` succeeded;
  what changed is that it stops claiming to know the directory instead of assuming success.
  So `cd nonexistent; rm rules/x.md` denies, and so does every shape the rule under "A `cd`
  is tracked" describes. What is left on the residual side is the ordinary give-up
  behaviour: after a non-`&&` joiner the guard denies relative writes it cannot place, which
  over-denies whenever the `cd` would in fact have succeeded. `&&` is the way through, and
  it is also the correct shell.
- **A `cd` the shell may never have made is no longer followed, and that is a cost too.**
  This used to be the live hole in the directory model — `&&` guarantees that the and-or
  list to its **left** returned zero rather than that the segment before it ran, and `|`
  binds tighter than `&&`, so `true || cd build && rm rules/x.md` and
  `echo hi | cd build && rm rules/x.md` were allowed and deleted a protected rule with no
  flag, no wrapper and no environment variable. Both deny now. What is left is the ordinary
  give-up behaviour in a second place: a `cd` on a `||`- or `|`-joined segment makes the
  directory unknown even where the shell would in fact have made the move, so
  `[ -d nope ] || cd build && rm out.js` denies although its `cd` runs. Naming the target
  absolutely, or moving the `cd` off the `||`, is the way through.
- **Verbs deliberately not in the table**: `mkdir`, `chmod`, `chown`, `touch`, `tar`,
  `rsync`, `patch`, `gzip`. Each was left out because its operands are usually
  directories and a row would carry the ancestor rule with it.
- **The git subcommands the check does not reach.** `git apply` and `git am` name their
  targets inside the patch file rather than on the command line, so they sit here with
  `patch`, and so does any `--pathspec-from-file` list. A bare `git clean -fdx` used to sit
  here too — that entry was wrong about git rather than about the check, since `clean`
  with no pathspec deletes from the *current directory* down, and the model now supplies
  the `.` it does not spell.
- **git's directory ENVIRONMENT variables are not read.**
  `GIT_WORK_TREE=rules git clean -fdx` deletes `rules/x.md` and is allowed, as is the same
  assignment behind a wrapper (`env GIT_WORK_TREE=rules git …`). The command-line
  spellings of the same fact (`-C`, `--work-tree`) *are* read; the classifier resolves no
  variable, which is the boundary this sits on rather than an oversight
  (`issues/260804-1332…`).
- **A redirect target whose TOKEN cannot be read is still not denied**, on a program
  outside the table. `echo x > "$F"`, `echo x > "rules/$F"` and `npm test > "$LOG"` are
  allowed, and `$F` may of course be `rules/x.md`. This is the fail-closed bound above seen
  from the residual side, and it is the deliberate half: an unrecognised program is allowed
  however unparseable its arguments are, and that promise is worth more than the case it
  gives up. What used to sit here alongside it — the same target unresolvable because the
  *directory* was unknown — is closed, so a give-up on a directory no longer opens a
  redirect route. `pushd -n docs && echo pwned > agents/coder.md` denies.
- **A `#` comment is not stripped**, so a redirect operator in a trailing comment is read
  as code: `ls -la # writes > rules/x.md` is denied on the write its comment only
  describes. This one errs toward deny; the way through is to drop the comment.
- **The classifier cannot walk out and back by name.** `cd .. && cd fusion && rm rules/x.md`
  is allowed: the guard is given a path normaliser, not the project directory's own name.
- **A `CDPATH` whose entries could not actually divert still degrades the model.** This is
  one of two residuals left by closing the ambient case above, and it errs toward DENY: the
  guard asks whether the variable is set, not whether any entry on it holds the name being
  looked for, because answering that means a filesystem probe per entry inside a classifier
  that is textual by design. So a user whose profile sets `CDPATH=.` gets denials for
  bare-word `cd`s that would have landed exactly where the guard modelled them. Anchoring
  the operand clears every one of them.
- **The ambient `CDPATH` check reads the hook's environment, not your shell's.** The other
  residual, and it errs toward ALLOW. The guard runs as a hook process that Claude Code
  spawns directly, so what it inspects is a frozen snapshot of Claude Code's own launch
  environment — nothing on that path ever sources a shell profile, while your `Bash` shell
  sources one per command. The two agree whenever Claude Code was started from a shell that
  had already sourced the profile, which is the ordinary case. They diverge when Claude Code
  was launched some other way (a GUI launcher, an IDE extension host, a `launchd` unit) and
  when the profile is edited mid-session: the `CDPATH` is then in force for your commands
  and invisible to the check, and the degrade does not fire. The only faithful source is the
  command's own shell, and asking it costs a subprocess per `Bash` call, so this is stated
  rather than closed. If a bare-word `cd` lands somewhere you did not expect, `CDPATH` is
  the first thing to check.
- **Two sibling `$(…)` substitutions inside one outer segment share a directory**, so
  `$(cd /tmp) $(rm rules/x.md)` is allowed. The same pair in separate segments is
  correctly independent.
- **A backslash-escaped closing parenthesis in a filename loses the paren.** `rm x\)`
  resolves to `x`, because the tokenizer peels a `(…)` subshell's parentheses before the
  escape is read. It can only shorten a word, so it costs no allow and buys no false
  deny. (Every OTHER escape is removed the way bash removes it: `\rm` is `rm`, and
  `rm hooks/config\.json` writes `hooks/config.json`. The one deliberate exception is a
  backslash before a `$` — `rm \$FOO` denies fail-closed rather than resolving to a file
  named `$FOO`, because the expansion check runs first and over-blocking is the safe
  direction.)
- **Glob and brace expansion are matched as literal text**, not expanded. `rm -rf *` and
  `rm -rf {rules,agents}` are allowed, because neither names a directory the ancestor
  check can compare.
- **The whole check stands down in the fusion plugin's own repository**, where the
  protected paths are exactly the files a fusion developer's agents legitimately edit.
  The write tools stand down there for the same reason, and the halt stands down with
  them on both surfaces rather than on one. The branch policy does not.

None of these is an invitation. An agent that reaches for one of them to get around a
deny has done the thing this rule forbids, whatever the guard happened to allow.
