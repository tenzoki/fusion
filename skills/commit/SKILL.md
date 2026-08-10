---
description: Commit changes with AI-generated message
argument-hint: "[--all] [--amend]"
allowed-tools: [Bash, Read, Glob, AskUserQuestion]
---

# Commit Command

When the user invokes `/fusion:commit`, help them commit their changes with a well-crafted commit message.

## Process

1. **Check current state**
   ```bash
   git status
   git diff --cached --stat
   git diff --stat
   ```

2. **Select what to commit — do NOT stage yet**
   - Anything already staged when the skill starts is part of the commit; note it.
   - Show the unstaged changes and ask which to include: all, specific files, or cancel
   - If `--all` flag provided, include all changes automatically
   - Record the selected paths as a list. Run **no** `git add` here — staging
     happens inside the locked step 6. Parallel sessions share one `.git/index`,
     and `git commit` commits the whole index: files staged now would sit
     unprotected across the confirmation window below, where any parallel
     committer holding the lock would absorb them into its own commit.

3. **Analyze changes**
   - Read what will be committed: `git diff --cached` for anything already
     staged, plus `git diff -- <selected paths>` (and the content of selected
     untracked files) for the rest
   - Understand what was modified, added, deleted
   - Identify the type: feature, fix, refactor, docs, test, chore, etc.

4. **Generate commit message**

   Follow conventional commits format:
   ```
   <type>(<scope>): <subject>

   <body>

   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

   Types:
   - `feat`: New feature
   - `fix`: Bug fix
   - `refactor`: Code change that neither fixes a bug nor adds a feature
   - `docs`: Documentation only
   - `test`: Adding or updating tests
   - `chore`: Maintenance, dependencies, config
   - `style`: Formatting, whitespace

   Subject line:
   - Imperative mood ("Add feature" not "Added feature")
   - No period at end
   - Max 50 characters

   Body:
   - Explain what and why (not how)
   - Wrap at 72 characters

5. **Show message and confirm**
   - Display the proposed commit message
   - Ask user to confirm, edit, or cancel

6. **Stage and commit as one held pair**

   Write the confirmed message to a scratch file, then run stage and
   commit as a single command under the project's commit lock — it serialises
   access to the shared git index against any parallel session's agents
   (`rules/workbench-stash-and-lock.md` `## Commit lock`; the `with` form
   acquires, runs, and releases on any exit). The pair must be held together:
   the lock only defends against commit absorption if no path is staged
   outside it.

   Write the scratch file with a **quoted** heredoc delimiter, so the shell
   expands nothing in the message — a body written under a bare `<<EOF` still
   substitutes `$var` and runs backtick commands.

The block below sits at column 0 deliberately, and a copy of it must too. A
here-document opened with `<<` ends only at a terminator that is the whole
line, at column 0, with nothing before it — `<<-` strips leading **tabs**
only, never spaces, so there is no operator that rescues an indented copy.
An indented terminator is never matched and the heredoc runs to EOF; an
indented body line puts those same leading spaces on that line of the commit
message, subject line included.

```bash
cat > <msg-file> <<'FUSION_MSG_EOF'
<the confirmed message, verbatim>
FUSION_MSG_EOF
```

   The message reaches `git` only as `-F <msg-file>`. It is never an argument
   on a command line, so apostrophes in it cannot end a quoted string.

   ```bash
   "$FUSION_PLUGIN_ROOT/bin/fusion-commit-lock" with commit -- bash -c 'git add <path> <path> && git commit -F <msg-file>'
   ```

   Only when there is nothing to stage (everything to commit was already
   staged before the skill started) does the bare form apply:

   ```bash
   "$FUSION_PLUGIN_ROOT/bin/fusion-commit-lock" with commit -- git commit -F <msg-file>
   ```

7. **Show result**
   - Display commit hash
   - Show `git log -1 --oneline`

## Examples

**Single file fix:**
```
fix(auth): handle expired token gracefully

Previously, expired tokens caused a crash. Now returns 401 with
clear error message.

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Multiple file feature:**
```
feat(api): add user search endpoint

- GET /api/users/search with query parameters
- Supports filtering by name, email, role
- Includes pagination

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Flags

- `--all`: Include all changes (staged inside the locked step 6, not earlier)
- `--amend`: Amend the previous commit (use with caution)

## Safety

- Never force push
- Never commit sensitive files (.env, credentials)
- Always show message for approval before committing
- If amending, warn user about implications
