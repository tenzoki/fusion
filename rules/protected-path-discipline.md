# Protected-Path Discipline (shell writes)

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

### The verb families

Recognition is table-driven (`MUTATION_VERBS` in `hooks/lib/bash-mutation-guard.ts`).
Three families:

| Family | Commands |
|---|---|
| Relocate or destroy | `mv`, `rm`, `cp`, `ln`, `install`, `git mv`, `git rm` |
| In-place rewrite | `sed -i`, `perl -i`, `truncate`, `tee`, `dd of=…` |
| Redirection | `>`, `>>`, `>|`, `N>`, glued (`>file`) or separated (`> file`) |

Redirection is scanned position-independently, because a redirection binds to the whole
simple command wherever it appears. `>` makes any program a mutation, including
`printf '' > rules/x.md` and `cat > rules/x.md <<'EOF'`.

Only the operands a verb **writes** count. `cp rules/x.md /tmp/y` and
`dd if=rules/x.md of=/tmp/y` read a protected path and stay allowed; copying *out of*
a protected directory is never the problem.

### Wrappers are seen through

A leading wrapper program is skipped and the command underneath it is classified.
`sudo rm rules/x.md`, `xargs rm rules/x.md` and `sudo env rm rules/x.md` are all the
`rm` row. The wrapper list covers `sudo`, `doas`, `env`, `command`, `nice`, `ionice`,
`timeout`, `xargs`, `time`, `nohup`, `setsid` and `stdbuf`. **`sudo` is not an escape**,
and neither is chaining wrappers.

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
```

The bound is exactly this: **an unrecognised program is allowed however unparseable its
arguments are.** `curl -o $OUT https://x`, `make $TARGET` and `npm run $SCRIPT` are
untouched. The fail-closed rule never applies to ordinary shell work; it applies only
once a table verb has been recognised.

When a fail-closed deny is wrong for your case, the way through is to write the path out
literally, or to name it absolutely, or to drop the `cd`. The deny reason says which.

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
- `git checkout HEAD -- rules/x.md` — fusion's own revert strategy, always allowed.
- Every mutation whose targets are outside the protected list: `rm -rf node_modules`,
  `sed -i '' 's/a/b/' notes.txt`, `mv build/out.js dist/`.
- Everything the guard does not recognise as a mutation, whatever its arguments.
- `echo hi 2>&1` and `>&2`, which name a file descriptor rather than a file.
- Quoted text that is not a command: `echo 'rm -rf rules/'` is inert, as is a
  **quoted-delimiter** heredoc body (`<<'EOF'`).

One practical consequence of that last point. An **unquoted** heredoc delimiter (`<<EOF`)
leaves the body as code, because bash still expands there, so a heredoc body that happens
to contain `rm rules/x.md` is classified and denied. This is deliberate. When you write a
heredoc whose body contains shell-looking text, quote the delimiter: `<<'EOF'`.

## What to do instead

If a task genuinely requires writing a protected path from a shell:

1. **STOP.** Do not rephrase the command. The guard segments on `;`, `&&`, `||`, `|`,
   `&` and newlines, splices backslash line continuations, inspects `$(…)` and backtick
   subshells, reads single- and double-quoted operands as the paths they are, and sees
   through wrappers. A differently-worded command is the same command.
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

Three consecutive guard denials put the guard into halt mode, which blocks every
`Write`, `Edit`, `MultiEdit` and `NotebookEdit` call until a human clears it. So retrying
a denied command twice more costs you the write tools for the rest of the session, not
just the one call.

## Where this check does not reach

The guard raises the cost of writing a protected path from zero to deliberate. **It does
not make it impossible, and no claim that `protectedPaths` is enforced should be made
without that qualification.** A shell can construct a path at run time, and fail-closed
covers the constructible cases the classifier can see, not every case. Completeness is
not the target.

Known and accepted:

- **Operands that arrive on stdin are invisible.** `find rules -name '*.md' | xargs rm -rf`
  is allowed, because `xargs` receives its operands on the pipe rather than as words.
- **An unrecognised program that writes a protected path still writes it.**
  `curl -o rules/x.md …`, `python3 -c "…"`, `eval '…'`, `bash -c '…'`, `parallel`, and a
  project's own build script are all outside the table.
- **Verbs deliberately not in the table**: `mkdir`, `chmod`, `chown`, `touch`, `tar`,
  `rsync`, `patch`, `gzip`. Each was left out because its operands are usually
  directories and a row would carry the ancestor rule with it.
- **The classifier cannot walk out and back by name.** `cd .. && cd fusion && rm rules/x.md`
  is allowed: the guard is given a path normaliser, not the project directory's own name.
- **Two sibling `$(…)` substitutions inside one outer segment share a directory**, so
  `$(cd /tmp) $(rm rules/x.md)` is allowed. The same pair in separate segments is
  correctly independent.
- **No backslash escape is processed inside a word.** A backslash-escaped closing
  parenthesis in a filename (`rm x\)`) loses the paren. It can only shorten a word, so it
  costs no allow and buys no false deny.
- **Glob and brace expansion are matched as literal text**, not expanded. `rm -rf *` and
  `rm -rf {rules,agents}` are allowed, because neither names a directory the ancestor
  check can compare.
- **The whole check stands down in the fusion plugin's own repository**, where the
  protected paths are exactly the files a fusion developer's agents legitimately edit.
  The write tools stand down there for the same reason. The branch policy does not.

None of these is an invitation. An agent that reaches for one of them to get around a
deny has done the thing this rule forbids, whatever the guard happened to allow.
