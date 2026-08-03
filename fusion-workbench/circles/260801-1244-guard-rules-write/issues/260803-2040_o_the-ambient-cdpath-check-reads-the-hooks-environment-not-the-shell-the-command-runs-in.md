# The ambient-`CDPATH` check reads the hook's environment, not the shell the command runs in

---

**Severity:** Low
**Domain:** code (security control) / documentation accuracy
**Filed by:** coderev, Turn 4 incremental review of `circles/260801-1244-guard-rules-write`
**Affects:** `hooks/lib/bash-mutation-guard.ts`, `hooks/guard.ts`
**Cross-references:**
`hooks/lib/bash-mutation-guard.ts:1618-1647` (`ambientCdpathIsSet` and its docstring),
`hooks/guard.ts:386-392` (`env: process.env`),
`decisions/260803-1803_a_should-the-guard-degrade-its-working-directory-model-when-cdpath-is-set-in-the-ambient-environment.md`,
`history/260803-2023-turn4-t4-5-ambient-cdpath.md`

---

## What is wrong

Not a bypass and not a regression — an unnamed residual sitting behind a docstring that
states the mechanism more confidently than the code implements it.

`ambientCdpathIsSet(env)` reads `opts.env`, which `guard.ts:391` fills with `process.env` —
the environment of the **PreToolUse hook process**. The docstring justifies the check like
this:

> The Bash tool's shell is initialised from the user's profile, so `export CDPATH=…` in a
> `.zshrc` puts every bare-word `cd` on a search list with nothing in the command to give it
> away.

That describes the environment of the **shell the command will run in**, which is not the
environment the code reads. They are two different processes assembled two different ways:

- The Bash tool's shell sources the user's profile **per invocation**.
- The hook is spawned directly by Claude Code (node, non-interactive, non-login) and
  inherits a frozen snapshot of Claude Code's own launch environment. Nothing in that path
  ever reads a shell profile.

They coincide only when Claude Code was itself launched from a shell that had already
sourced the profile. When they diverge, `CDPATH` is in force for the command and invisible
to the check, and the degrade silently does not fire — in exactly the configuration the
feature was built for.

## Measured

The Bash tool's shell **does** source `~/.zshrc`: `FLIGHT_FILE_PREFIX`, defined only at
`~/.zshrc:34`, is set in the tool shell (`[%y%m%d-%H%M]`), and `PATH` carries the
`~/tools/bin` entry appended there.

In *this* session the two environments agree — `ps eww` on the parent `claude` process
shows `FLIGHT_FILE_PREFIX` and `FUSION_PLUGIN_ROOT` in its environment, so Claude Code was
started from a profile-sourcing shell and a hook would inherit an ambient `CDPATH` if one
existed. So the gap is not open here, today.

The two configurations where it opens, both from the same mechanism:

1. **Claude Code launched other than from an interactive shell** — a GUI launcher, an IDE
   extension host, a `launchd`/systemd unit. The launch environment carries no `.zshrc`
   exports; the Bash tool's shell still sources them.
2. **The profile is edited mid-session.** The tool shell picks up a new `export CDPATH=…`
   on the next command. The hook's environment was fixed at process start and never will.

Neither was measured against a live Claude Code start — I have one launch configuration to
hand. This is an argument from the two process-assembly paths plus the measurement that the
tool shell really does source the profile, and it is offered as that rather than as a
measured bypass.

## Why file it at all

Because the class this Circle has re-found four times is *a docstring asserting a boundary
the code does not have*, and this is one. `ambientCdpathIsSet` reads like it inspects the
command's shell. It inspects the hook's. A later reader deciding whether the ambient
entrance is closed will read that paragraph and stop.

The remedy is small and is probably prose rather than code — the alternative (asking the
command's own shell what `CDPATH` is) costs a subprocess per Bash call inside a classifier
that is textual by design, and would be the same rejected shape as option 2 in the decision
record.

## Candidate direction

1. **Restate the docstring** to say what is actually read: the hook process's environment,
   which is Claude Code's launch environment, which equals the command's shell environment
   only when Claude Code was launched from a shell that had sourced the profile. Name the
   two divergent configurations.
2. **Add the residual to `rules/protected-path-discipline.md`**, whose residual list already
   carries the ambient-`CDPATH` entry from T4-2 — that entry now says the degrade exists,
   and should say what the degrade can and cannot see.
3. Optionally amend the decision record's `## Realisation` to record the bound, so the
   `_a_`→`_i_` transition does not claim more than landed.

No code change is proposed. If one is ever wanted, the only honest source is the shell
itself, and its cost has already been rejected in kind.

## Origin

Turn 4 incremental code review, answering the review brief's question 5 — "does the ambient
`CDPATH` change cost more than measured?". The measured cost is right. What is unstated is
the reach.
