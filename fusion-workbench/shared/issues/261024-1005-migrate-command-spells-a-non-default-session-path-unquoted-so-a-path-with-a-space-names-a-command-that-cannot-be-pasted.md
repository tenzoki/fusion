migrate: `command()` spells a non-default session path unquoted, so a path with a space names a command that cannot be pasted
---
Since 408bd58e every command a `/fusion:migrate` message names under a non-default session goes through `command()`, which appends `--session ${session}` with no quoting. `retry()` in the same commit quotes each argument it carries, so the two halves of one named command follow different rules.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** commit 408bd58e; 261023-1846-migrate-eight-messages-still-name-a-helper-command-without-the-session-flag-and-the-13-3-3-note-says-every-one-does.md

**Evidence.** `hooks/migrate.ts` `function command`: `` `\`bin/fusion-migrate ${sub}${session === sessionDir(wb, undefined) ? "" : ` --session ${session}`}\`` ``. `function retry` quotes with `/^[\w./:=@%+-]+$/` and `'…'`. Reproduced at 8280c372 with `--session "<scratch>/home/my own"`:

```
`bin/fusion-migrate repair --list --session <scratch>/home/my own` names the current ones.
```

Pasted, that is `--session <scratch>/home/my` plus a stray `own`, which `main` refuses as a usage error (`repair takes no "own"`). `sessionDir` resolves the flag with `resolve()`, so any directory with a space or a shell metacharacter in its absolute path is affected; the default session is not, because `command()` omits the flag for it.

The tests cannot see it: `runNamed` in `hooks/lib/__tests__/migrate.test.ts` splits the named command on `" "`, and every session in the suite is `join(home, "own")`.

**Fix direction.** Quote the session in `command()` with the same rule `retry()` uses, from one shared helper, so every message site inherits it.

**Acceptance.**
- One quoting helper serves `command()` and `retry()`.
- A test runs a blocking `run` under `--session` with a space in its path, takes the command the message names, executes it through a shell (`bash -c`), and gets the `repair --list` answer for that session. Red on 8280c372.
