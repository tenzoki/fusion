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

Two companion files carry the detail, and you need neither in order to write a command
that does not trip the guard: `rules/protected-path-internals.md` says how the
classifier reads a command, and is loaded by `coder`, `coderev` and `bugfixer` —
the agents that change or review it. `fusion-workbench/circles/260801-1244-guard-rules-write/analyses/260805-0717-protected-path-forensics.md`
holds the measured residual catalogue and the measured illustration set; it is evidence
for a review of the guard rather than instruction for a behaviour, so nothing loads it.

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

One clause of the rule is the deny most likely to surprise you, so it belongs here
rather than in the reference: **a recognised verb whose written operand cannot be
resolved to a literal is denied rather than guessed at** — an operand still carrying a
`$`, a backtick or a leading `~` after quote handling, or a relative operand after a
`cd` the guard could not place. The bound is the token, not the program: an
*unrecognised* program is allowed however unparseable its arguments are, so
`curl -o $OUT …` and `make $TARGET` are untouched. The deny reason names the way
through; `rules/protected-path-internals.md` works the case out in full.

### The match is textual, and case-insensitive

The comparison is on the path's **text** — no symlink is resolved on this side, and the
residual catalogue named at the end says what that costs — and it **folds case**. `rm AGENTS/coder.md`
denies exactly as `rm agents/coder.md` does, and so do `Edit HOOKS/config.json`,
`Edit Rules/x.md`, `echo x > Agents/coder.md` and `rm -rf RULES`. Until the fold landed,
the whole list was bypassable by shifting one letter on any case-insensitive filesystem,
which is every stock macOS install and a case-insensitive Windows volume.

The fold is **unconditional**, not conditional on the filesystem, so the boundary reads
the same on every platform rather than having to be looked up per machine. On a
case-sensitive filesystem that over-blocks: `AGENTS/coder.md` really is a second file
there, and it is denied anyway. Measured on a case-sensitive volume, with both files
present and different: `Edit AGENTS/coder.md` denies. That is the accepted cost, and it is
the direction the fail-closed clause above already chooses.

The **exemption does not fold**. With `FUSION_ALLOW_RULES_WRITE` set, `Edit rules/x.md` is
allowed while `Edit RULES/x.md` is denied — the protected set widened and the grant did
not, which is the only direction a guard may move. Spell a rule path the way the rule
directory spells it.

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

Each denial has two ways through, and the deny reason names both: join with `&&`, or name
the target absolutely. `&&` is usually the better one, because it is also what makes the
command correct in the shell — `mkdir -p build && cd build` is written that way for the
same reason.

The give-up respects scope. A `cd` bash itself discarded casts no doubt forward, so
`(cd nonexistent); rm x.md` still resolves `x.md` from the project root.

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

Twenty residuals are catalogued, each with the command that measured it and the record
that argued it, in `fusion-workbench/circles/260801-1244-guard-rules-write/analyses/260805-0717-protected-path-forensics.md`.

None of these is an invitation. An agent that reaches for one of them to get around a
deny has done the thing this rule forbids, whatever the guard happened to allow. That
holds for a residual you found in the catalogue and for one you discovered yourself.
