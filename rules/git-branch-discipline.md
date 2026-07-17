# Git Branch Discipline

This rule is loaded for every agent. It is enforced **deterministically** by the PreToolUse guard hook (`hooks/guard.ts`), not by your goodwill — every `Bash` call is classified before it runs, and branch/worktree-moving git operations are denied. The rule text here exists so you understand *why* the deny happens and *what to do instead*; it is not the enforcement surface.

## The rule

**Agents never switch git branches autonomously.** The following git operations are DENIED:

- `git switch …` — any form (including `-c`, `-C`, `--detach`, `-`)
- `git checkout` with `-b` / `-B` / `--detach` / `--orphan` / `-`
- `git checkout <branch/ref>` with no `--` separator (a branch/commit switch) — a valid ref is always denied, so a branch that merely shares a name with a file stays denied (git resolves the ref first)
- `git worktree add …`

The deny applies to the whole `Bash` call if **any** segment is a deny-case — the guard segments on `;`, `&&`, `||`, `|` and inspects `$(…)` / backtick subshells, so you cannot smuggle a branch switch inside a compound command.

## What stays allowed (HEAD does not move)

- `git checkout … -- <paths>` — file restore. The `--` separator is the primary, unambiguous discriminator.
- `git checkout HEAD -- <files>` — **fusion's own revert strategy.** Always allowed.
- `git checkout -- <files>`, `git checkout <ref> -- <files>` — file restore from a ref.
- `git restore <files>` (incl. `--staged`) — file restore; never moves HEAD.
- `git checkout <file>` (bare, no `--`) — allowed **only** when every positional arg exists on disk **and** none is a valid git ref. This is the "I meant to restore a file" convenience form. A real branch (or a branch sharing a file's name) is a valid ref → still denied. A nonexistent target → denied (fail-closed). Resolution respects a leading `-C <dir>`; a `--git-dir` / `--work-tree` global forces a conservative deny.
- All read-only git (`status`, `log`, `diff`, `branch` listing, `worktree list`, …).
- `git branch <new>` — create a branch without switching to it.
- Everything that is not a git command.

## Why

A prose rule alone does not stop an LLM agent from switching branches under task pressure (cf. `CLAUDE.md` "Problem 11" — "MUST run Setup" was overridden by task urgency). Autonomous branch switching causes **branch-drift chaos**: work lands on the wrong branch, the orchestrator's revert strategy (`git checkout HEAD -- <files>`) targets the wrong tree, commits interleave across branches, and interrupted-session resume becomes unreliable. Git is reachable only via `Bash`, so the guard hook is a complete choke-point — the cheapest place to make the failure impossible rather than merely discouraged.

The classifier is **fail-closed**: for a bare `git checkout <target>` (no `--`), the allow requires positive proof that every target is an existing file that is *not* also a ref — proved via an on-disk + `git rev-parse` check. Anything short of that proof (a valid ref, a nonexistent target, an unresolvable `--git-dir`/`--work-tree` global, or no resolver at all) is denied. Over-blocking a weird construct is the correct direction; the user wants chaos prevented.

## What to do instead

If a task genuinely requires a different branch:

1. **STOP.** Do not work around the deny (do not try to phrase the command differently — the guard segments and inspects subshells).
2. **Human Gate.** Surface the situation to the user and ask. Switching branches is a decision the user owns, not one an agent makes autonomously.
3. The user can deliberately allow the operation by setting an env override in the session (least-privilege, independent):
   - `FUSION_ALLOW_BRANCH_SWITCH=1` (or `true`) — lifts the deny for `git switch` and `git checkout <ref>` / `-b` etc.
   - `FUSION_ALLOW_WORKTREE=1` (or `true`) — lifts the deny for `git worktree add`.

   When an override allows a normally-denied command, the guard records an override-used note in `fusion-workbench/.guard-state/` for visibility.

A secondary belt lives in `settings.json` (`Bash(git switch:*)` and `Bash(git worktree add:*)` deny rules); the hook handles the `git checkout` nuance that a blanket settings rule cannot (it would break the file-restore form).
