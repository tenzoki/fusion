# Protected-path guard — the measured forensics

**Circle:** `260801-1244-guard-rules-write`
**Kind:** analysis (evidence)
**Sources:** `rules/protected-path-discipline.md` at `git:98c9363`, sections
`### Illustrations, not a list` and `## Where this check does not reach`
**Decision:** `260805-0709_*_wohin-gehoert-die-forensik-aus-protected-path-discipline.md`

---

## Why this file exists, and why nothing loads it

Both sections below were written inside `rules/protected-path-discipline.md`, which every
one of the sixteen agents loads on every dispatch. They grew there because every Turn of
this Circle that measured the classifier wrote its measurement down where the claim it
corrected was standing. That was right for the claim and wrong for the file: the rule
file's addressee is an agent about to write a shell command, and neither section tells
that agent anything it has to do.

The three-layer split the user chose at the cut gate is by **addressee**, not by size:

| Layer | Addressee | Loaded by |
|---|---|---|
| `rules/protected-path-discipline.md` | an agent about to write a command | all sixteen agents |
| `rules/protected-path-internals.md` | someone changing or reviewing the classifier | `coder`, `coderev`, `bugfixer` |
| this file | someone auditing what the guard actually covers | nobody automatically |

Nothing was deleted. Both sections are reproduced below **verbatim** from the rule file
as it stood at `git:98c9363`, so a closed issue that cites either of them still has its
evidence, at this path. The core rule cites this file by path in
`## Where this check does not reach`, which is the commitment the decision record made:
citable, not vanished.

Read this when you are asking *what does the guard actually cover*. Do not read it in
order to write a command — the core rule answers that, and reaching into a residual
here to get around a deny is the one thing the core rule forbids, whatever the guard
happened to allow.

---

## 1. The measured illustration set

Reproduced from `### Illustrations, not a list`. The list is measured output, not a
specification: the rule it illustrates is `### The rule, so you can predict a case this
file does not list`, which stayed in the core file. The closing paragraphs of the
section — the two ways through a denial, the newline-after-`&&` rule, and the
give-up-respects-scope note — are behavioural instruction and stayed in the core file
too; they are not repeated here.

### Illustrations, not a list

Every row below is measured. They are **examples of the rule** stated in
`rules/protected-path-discipline.md` under `### The rule, so you can predict a case
this file does not list`, and the set is open — if you can answer that section's
numbered questions for a command you have not seen here, you have the rule; if you
cannot, re-read it rather than looking for your command in the table. The count is
deliberately not repeated here: it has been three and then four, and a back-reference
that names a length goes stale one commit after the list it names
(`260804-1220…`).

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
moved **ten of thirty** ordinary shapes (`260804-0840…`). The fix is not a longer
list — it is the rule in the core file.

**One honest edge, still open, and it costs rather than leaks.** The rule in the core file
is what the guard implements; the shell is slightly different in one place.

- **The guard over-denies a `cd` the shell does in fact guarantee.** A conditional body, a
  loop body, a brace group and a pipeline stage all reach their write on a condition the
  shell has already tested, so `if cd hooks; then rm -rf dist; fi`,
  `while cd build; do rm out.js; break; done` and `cd hooks && npx tsc | tee typecheck.log`
  are safe and denied anyway (`260804-0839…`). Cost, not hazard. `&&` or an absolute
  path clears them. The compound-command family is **not** uniform, which is why this is a
  model to be built rather than a list to be exempted: `until cd X; do W; done` runs its
  body when the `cd` *failed*, so its deny is correct and has to survive the fix.
  Only option 2 of `260804-0947_i…` — model the and-or list — closes it; the
  cheap option measured identically before and after. **The model that closes it is
  `260804-1205-shell-reachability-model`**, whose Directive is exactly this, so
  the issue stays open here and is answered there.

The edge that used to sit beside it — `&&` read as a stronger guarantee than bash gives —
is **closed**. `true || cd build && rm rules/x.md` and `echo hi | cd build && rm rules/x.md`
used to be allowed and did delete the rule in a real shell; the joiner is now consulted for
the segment that moves as well as for the one that writes, and both deny
(`260804-0836…`, `260804-0837_*_a-cd-inside-a-pipeline-runs-in-a-subshell-in-bash-and-the-model-follows-it-anyway.md…`, closed by `260804-0947…`).

---

## 2. The measured residual catalogue

Reproduced from `## Where this check does not reach`. Its opening qualification (*the
guard raises the cost from zero to deliberate; it does not make it impossible*) and its
closing sentence (*none of these is an invitation*) are the two behavioural paragraphs of
that section and stayed in the core file; everything between them is here.

The gaps come in three shapes, and the last two are the ones that surprise people:
writes the classifier cannot SEE; writes it sees in full and allows anyway, because the
path the command names is not the file the write reaches; and writes it sees in full and
allows because the LIST it matches them against is not the list the reader assumed. The
third shape was added on 2026-08-05 with the two entries that open the catalogue —
before that, every entry here was about a command, and the two ways the effective list
itself narrows had no home.

Known and accepted:

- **The effective protected list is the project's to narrow, and the narrowing reaches
  the guard's own state directory.** `fusion-guard.json` at a project root overrides the
  plugin's `hooks/config.json` per **leaf** — `pickGuard` in `hooks/lib/config.ts` is
  `project.raw.guard?.[key] ?? plugin.raw.guard?.[key] ?? DEFAULTS.guard[key]`, so a
  declared key wins, an omitted one falls through to the plugin's file, and only what
  neither declares reaches the built-in default. A declared
  `{"guard":{"protectedPaths":[]}}` therefore drops every entry — including
  `fusion-workbench/.guard-state/**`, where
  `escalation.json` holds `consecutiveBlocks` and `haltActive`. The residual therefore
  reaches the escalation machinery, one step past what
  `260802-1912_*_does-the-self-protection-floor-apply-before-the-config-file-exists.md`
  states it reaches. Measured, four tool calls, no flag, both surfaces: `Edit
  fusion-workbench/.guard-state/escalation.json` denies; `Write fusion-guard.json`
  allows, because the floor is not yet in force; the same `Edit` then allows, and
  `rm -rf fusion-workbench/.guard-state` allows with it; `Edit fusion-guard.json` denies,
  the floor having closed behind it. What bounds it, measured too: an *active halt*
  blocks the narrowing write itself, on both surfaces, so an agent can narrow its way out
  of halts it has not yet earned and not out of one it is already in. The wider bound is
  the one the decision record rests on — the file is git-tracked, so its creation is a
  diff. Whether the floor should grow a second entry is open at `260804-1427…`;
  the spec authorises exactly one (`260801-1122…:301`).
- **The patterns are matched against the session's working directory, not the project
  root, and the two halves of the policy then disagree.** From a session started one
  level below the root, every relative pattern is anchored there, so the project's real
  `rules/`, `agents/` and `bin/monitor` are outside it and match nothing — while
  fail-closed, which fires on the SHAPE of an operand before any question of which
  directory it names, still denies. Measured through the classifier with the shipped
  list, cwd `<project>/fusion-workbench`:

  ```
  rm <project>/rules/x.md                  allow      → the real rule file
  mv <project>/rules/x.md /tmp/            allow
  cd <project> && mv /tmp/y rules/         allow      → a protected-ancestor destination
  cd <project> && cp bin/monitor "$SP/x"   DENY       fail-closed, unresolvable operand
  rm rules/x.md                            DENY       → a `rules/` under the SESSION's cwd
  ```

  The last row is the shape of it: the guard protects a `rules/` that need not exist and
  does not protect the one that does. Observed live as well as measured — the session
  that split this rule file into three layers ran from `fusion-workbench/` and copied
  into `rules/` unremarked. `260804-1604_*_the-self-protection-floor-is-matched-cwd-relative-while-the-file-is-read-root-relative.md` closed the self-protection floor's half of this
  and argued the rest away on the ground that the list is documented as project-relative;
  that argument does not cover fail-closed, which is not project-relative at all. So in
  exactly the configuration where the list protects nothing, the policy is at its most
  obstructive, and an agent meeting that deny has no account of it. The two candidate
  fixes — scope fail-closed to the coordinate space the list can reach, or say it in the
  deny reason — are open at `260804-2100…`; the documentation half is discharged
  by the core rule's own statement of it and by this entry.
- **Operands that arrive on stdin are invisible.** `find rules -name '*.md' | xargs rm -rf`
  is allowed, because `xargs` receives its operands on the pipe rather than as words.
- **An unrecognised program that writes a protected path still writes it.**
  `curl -o rules/x.md …`, `python3 -c "…"`, `eval '…'`, `bash -c '…'`, `parallel`, and a
  project's own build script are all outside the table. `eval` and `bash -c` are outside
  it for a specific reason: they take a STRING that bash re-parses, so there is no
  argument list to walk the way there is for `sudo`.
- **An alias to a protected file can be created BY YOU, in one allowed command, and
  written through.** This is not the pre-existing-symlink case and it is not a gap in what
  the classifier can see: unlike the two above, the guard sees the whole command and
  resolves every operand. It allows them anyway, because only the operands a verb
  **writes** count and `ln`, `ln -s` and `cp -l` write the alias, not the file it aliases.
  No flag is involved, and both surfaces are open at every step. Measured:

  ```
  ln -s ../agents/coder.md build/alias      allow
  ln agents/coder.md build/hardalias        allow
  cp -l agents/coder.md build/hardalias     allow
  echo pwned > build/alias                  allow   → agents/coder.md reads "pwned"
  Edit build/alias                          allow   (the write-tool surface too)
  ```

  The protection side decides on the TEXT of a path (`lib/paths.ts`), so any shell can
  manufacture a second, unprotected name for a protected file. **The invariant is kept on
  purpose, and the residual is its stated price** — the user chose this in
  `260803-1402_*_should-the-mutation-classifier-inspect-a-read-operand-…`.
  "Only written operands count" is what keeps every legitimate read of a protected file
  allowed (`cp rules/x.md /tmp/backup`, `cp -R rules /tmp/backup`, `dd if=… of=/tmp/y`), it
  is one sentence you can hold in your head, and denying a read operand would close one
  spelling of the class at the price of that regularity: an agent that has learned reads
  are always fine, and then meets a denied `cp -l`, is in exactly the position the core rule
  exists to prevent — an unexplained deny, followed by a rephrasing that works. Closing it
  properly means resolving every guarded path through the filesystem, which is a different
  design with a different cost. Until then it is the cheapest route around the guard there
  is, and reaching a protected file this way is the same denial you would have got by
  naming it: the guard raises the cost of a deliberate act, and routing around a deny is
  what this rule forbids regardless of mechanism.
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
  is tracked" in the core file describes. What is left on the residual side is the ordinary give-up
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
  here too, and its entry is **deleted rather than narrowed, because the case closed** —
  stated so it is not read as an entry that was quietly dropped. It closed in two steps.
  First the reading was wrong about git rather than about the check: `clean` with no
  pathspec deletes from the *current directory* down, so the model supplies the `.` it does
  not spell. Then the root itself stopped being a way out, because `clean` writes *through*
  its pathspec and the project-root exclusion does not apply to a verb that does. Both
  spellings deny at the root now, the explicit `git clean -fdx .` and the implicit
  `git clean -fdx`, which reached the same allow by different code paths. What is NOT
  closed is the environment route in the next entry, and a `clean` from a directory the
  guard cannot place denies fail-closed rather than allowing.
- **git's directory ENVIRONMENT variables are not read**, and this is the live half of the
  `clean` story above. `GIT_WORK_TREE=` and `GIT_DIR=` move git exactly as `-C` and
  `--work-tree` do, and the classifier resolves no variable, so it reads only the directory
  the *command text* names. Measured allowed, and measured deleting every file under
  `rules/` in a real repository — tracked files included, because with the work tree moved
  git considers them untracked:

  ```
  cd build && GIT_WORK_TREE=../rules git clean -fdx      allow  → rules/ emptied
  cd build && env GIT_WORK_TREE=../rules git clean -fdx  allow  (the wrapper-hopped form)
  cd build && git --work-tree=../rules clean -fdx        DENY   (the control)
  ```

  The wrapper-hopped row was asserted from the mechanism when this entry was written and
  is measured as of 2026-08-05; the control is what proves the classifier discriminates
  rather than giving up on every `git clean` behind a `cd`.

  The rule, not the row: **any git invocation whose real working directory was set by the
  environment is checked against the wrong directory**, so an assignment behind a wrapper
  (`env GIT_WORK_TREE=… git …`) or in front of any other subcommand is the same case. What
  narrows it is that the guard still checks the directory it *can* see, which is why
  `GIT_WORK_TREE=rules git clean -fdx` denies at the project root — on the root's own
  write-through, not because the variable was read. Do not read that deny as coverage. The
  command-line spellings of the same fact are read exactly (`git -C rules clean -fdx`,
  `git --work-tree=rules clean -fdx` both deny), which is the boundary this sits on rather
  than an oversight (`260804-1332…`, deferred to
  `260804-1205-shell-reachability-model`).
- **A redirect target whose TOKEN cannot be read is still not denied**, on a program
  outside the table. `echo x > "$F"`, `echo x > "rules/$F"` and `npm test > "$LOG"` are
  allowed, and `$F` may of course be `rules/x.md`. This is the fail-closed bound in
  `rules/protected-path-internals.md` seen from the residual side, and it is the deliberate half: an unrecognised program is allowed
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
