---
description: Commit changes with AI-generated message
argument-hint: "[--all] [--amend]"
allowed-tools: [Bash, Read, Glob]
---

# Commit Command

When the user invokes `/commit`, help them commit their changes with a well-crafted commit message.

## Process

1. **Check current state**
   ```bash
   git status
   git diff --cached --stat
   git diff --stat
   ```

2. **If no staged changes, ask about staging**
   - Show unstaged changes
   - Ask if user wants to stage all, specific files, or cancel
   - If `--all` flag provided, stage all changes automatically

3. **Analyze changes**
   - Read the staged diff: `git diff --cached`
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

6. **Execute commit**
   ```bash
   git commit -m "<message>"
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

- `--all`: Stage all changes before committing
- `--amend`: Amend the previous commit (use with caution)

## Safety

- Never force push
- Never commit sensitive files (.env, credentials)
- Always show message for approval before committing
- If amending, warn user about implications
