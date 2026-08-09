# Git Branch Discipline

**Provenance:** No motivating record recoverable; introduced in `git:4950ffa`.

This rule is loaded for every agent. It is enforced **deterministically** by the PreToolUse guard hook (`hooks/guard.ts`), not by your goodwill — every `Bash` call is classified before it runs, and branch/worktree-moving git operations are denied. The rule text here exists so you understand *why* the deny happens and *what to do instead*; it is not the enforcement surface.

The guard runs a second, independent protection: every path in `guard.protectedPaths` is fingerprinted before a tool call and again after it, and a path that changed is written back to its pre-call content. That one has its own rule, `protected-path-discipline.md`, which every agent also loads. The two share a hook and nothing else — this one reads your command before it runs, that one measures the files afterwards, and they differ in their overrides and in their behaviour in the plugin's own repository.

## The rule

**Agents never switch git branches autonomously.** The following git operations are DENIED:

- `git switch …` — any form (including `-c`, `-C`, `--detach`, `-`)
- `git checkout` with `-b` / `-B` / `--detach` / `--orphan` / `-` — whatever follows them, a trailing `--` included
- `git checkout <branch/ref>` with no `--` separator (a branch/commit switch) — a valid ref is always denied, so a branch that merely shares a name with a file stays denied (git resolves the ref first)
- `git worktree add …`

The deny applies to the whole `Bash` call if **any** segment is a deny-case. The guard segments on `;`, `&&`, `||`, `|`, `&` and newlines, splices backslash line continuations before segmenting, strips `(…)` subshell parentheses, and inspects `$(…)` / backtick subshells. You cannot smuggle a branch switch inside a compound command.

Nor behind an extra word. The classifier resolves the command word before it reads it, so a leading `VAR=value` assignment, a compound-command head or body introducer (`if`, `elif`, `while`, `until`, `then`, `else`, `do`), a wrapper program (`sudo`, `env`, `exec`, `xargs`, `nohup`, `timeout`, `command`, `nice`, `time`, …), a path (`/usr/bin/git`), quoting (`"git"`) and a backslash escape (`\git`) all resolve to the same `git` the bare form does. `if git switch main; then :; fi`, `sudo git switch main`, `exec git switch main` and `\git switch main` are denied exactly as `git switch main` is.

## What stays allowed (HEAD does not move)

- `git checkout … -- <paths>` — file restore, as long as no branch-creating or detaching flag stands in front of the separator. The `--` settles the *ambiguous* form only; evidence that HEAD moves is unconditional, and no later token withdraws it (`shared/issues/260809-1105_*_a-trailing-separator-lifts-the-branch-deny-….md`, closed).
- `git checkout HEAD -- <files>` — **fusion's own revert strategy.** Always allowed.
- `git checkout -- <files>`, `git checkout <ref> -- <files>` — file restore from a ref.
- `git restore <files>` (incl. `--staged`) — file restore; never moves HEAD.
- `git checkout <file>` (bare, no `--`) — allowed **only** when every positional arg exists on disk **and** none is a valid git ref. This is the "I meant to restore a file" convenience form. A real branch (or a branch sharing a file's name) is a valid ref → still denied. A nonexistent target → denied (fail-closed). Resolution respects a leading `-C <dir>`; a `--git-dir` / `--work-tree` global forces a conservative deny.
- All read-only git (`status`, `log`, `diff`, `branch` listing, `worktree list`, …).
- `git branch <new>` — create a branch without switching to it.
- Everything that is not a git command.

## One deny you will not have expected: the unknown-global-option rule

Closing the option defect (`shared/issues/260809-1106_*_the-unknown-global-option-fix-was-deleted-….md`) has a price, and the price is a **rule with an open example set**, not a list to learn. When the walk over git's global options meets an option it does not recognise, it reads the following word as that option's value; if that word is not a subcommand either, the walk carries on and may find `switch`, `checkout` or `worktree` further along, standing where a verb would stand while actually being an argument. The shape is:

```
git <unrecognised-global-option> <non-subcommand> <switch|checkout|worktree> …
```

`git --no-pager grep switch` — searching the tree for the word "switch" with the pager off — is an example of it, and the one somebody plausibly types. These are examples and not the extent of it: the set moves as the option table and the walk change, so read the shape rather than counting the cases.

The bound, from the other side: with no unrecognised option in front, the walk stops at the first non-flag word exactly as it did before, so `git grep switch` and `git commit -m switch` are untouched. A deny of this shape is the classifier being fail-closed, not evidence that your command moves HEAD. Report it as what it is; do not take it as licence to go hunting for a spelling that gets past a deny, which is what point 1 below forbids wherever the deny is real.

## Why

A prose rule alone does not stop an LLM agent from switching branches under task pressure (cf. `CLAUDE.md` "Problem 11" — "MUST run Setup" was overridden by task urgency). Autonomous branch switching causes **branch-drift chaos**: work lands on the wrong branch, the orchestrator's revert strategy (`git checkout HEAD -- <files>`) targets the wrong tree, commits interleave across branches, and interrupted-session resume becomes unreliable. Git is reachable only via `Bash`, so the hook sees every attempt an agent can make: it is the cheapest place to make the failure hard rather than merely discouraged.

**It is a choke-point on the tool call, not a proof of impossibility.** The classifier reads the command text, so a command that hides the verb from its own text is not seen — `eval 'git switch main'` and `bash -c 'git switch main'` are both allowed today, as is a branch switch inside a script the agent invokes, inside a `case` arm (`main) git switch main;;`) or inside a function body. Nor is a hidden verb the only way through. One measured defect stands open in which the verb is in plain sight, the classifier reads it, and the call is allowed anyway: a capitalised command word on a filesystem that does not distinguish case (`shared/issues/260809-1110_*_the-command-word-comparison-is-case-sensitive-….md`). Two others of that kind — a trailing `--` behind a branch-creating flag, and an unrecognised global option whose value came to stand in subcommand position — were measured and are now closed. So the classifier can err inside the command form it does classify, not only outside it. Reaching for any of this to get past a deny is exactly the behaviour this rule forbids, whatever the guard happened to allow.

The classifier is **fail-closed**: for a bare `git checkout <target>` (no `--`), the allow requires positive proof that every target is an existing file that is *not* also a ref — proved via an on-disk + `git rev-parse` check. Anything short of that proof (a valid ref, a nonexistent target, an unresolvable `--git-dir`/`--work-tree` global, or no resolver at all) is denied. Over-blocking a weird construct is the correct direction; the user wants chaos prevented.

## What to do instead

If a task genuinely requires a different branch:

1. **STOP.** Do not work around the deny, and do not go looking for a phrasing that gets past it. Reaching for one is the act this rule forbids, whatever the guard happened to allow.
2. **Human Gate.** Surface the situation to the user and ask. Switching branches is a decision the user owns, not one an agent makes autonomously.
3. The user can deliberately allow the operation by setting an env override in the session (least-privilege, independent):
   - `FUSION_ALLOW_BRANCH_SWITCH=1` (or `true`) — lifts the deny for `git switch` and `git checkout <ref>` / `-b` etc.
   - `FUSION_ALLOW_WORKTREE=1` (or `true`) — lifts the deny for `git worktree add`.

   When an override allows a normally-denied command, the guard records an override-used note in `fusion-workbench/.guard-state/` for visibility.

   **Each override waives only what it names.** `FUSION_ALLOW_BRANCH_SWITCH` does not lift the worktree deny, `FUSION_ALLOW_WORKTREE` does not lift the branch deny, and neither says anything about the protected paths: with `FUSION_ALLOW_BRANCH_SWITCH=1`, `git switch main && rm rules/x.md` still denies, on the `rm`.

A secondary belt lives in `settings.json` (`Bash(git switch:*)` and `Bash(git worktree add:*)` deny rules); the hook handles the `git checkout` nuance that a blanket settings rule cannot (it would break the file-restore form).
