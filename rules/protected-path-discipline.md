# Protected-Path Discipline

**Provenance:** circles/260801-1244-guard-bash-inspection

This rule is loaded for every agent. It is enforced by **measurement**, not by your goodwill: the PreToolUse hook (`hooks/guard.ts`) fingerprints every protected path before your tool call, the PostToolUse hook (`hooks/tracker.ts`) fingerprints them again after it. A path whose fingerprint moved raises the halt, and you are told which path moved, what became of it — written back, or left standing where the guard can tell the change was not this call's — and where the bytes it carried were kept. The text here exists so you understand why that happens and what to do instead; it is not the enforcement surface.

The sibling rule `git-branch-discipline.md` covers the guard's other `Bash` policy, the one about moving HEAD. The two share a hook and nothing else: different verbs, different overrides, different behaviour in the plugin's own repository.

## The rule

**Agents never write a protected path.** `guard.protectedPaths` in `hooks/config.json` is the list — `agents/**`, `rules/**`, `skills/**`, `hooks/config.json`, `hooks/hooks.json`, `settings.json`, `bin/monitor` and `.claude-plugin/plugin.json` — and it is the plugin's **default**, not the answer for a given project. A project may ship `fusion-guard.json` at its own root, merged per **leaf** key: a declared `guard.protectedPaths` wins outright, and a declared empty list really is empty, which is how a project narrows. One floor survives every narrowing: once `fusion-guard.json` exists, the guard watches that file itself, whatever the list inside it says.

The match is on the path's **text**, and it **folds case** unconditionally on every platform, so `AGENTS/coder.md` is watched exactly as `agents/coder.md` is.

The patterns are read relative to the **project root** — the directory holding `fusion-workbench/`, the same one the configuration is loaded from — and not relative to wherever your session happens to have started. So `rules/**` means the project's own `rules/` directory whether the session began at the root or three levels below it, and a `rules/` that happens to sit inside your working directory is not protected by that pattern unless the project's own list names it. This is measured from a subdirectory in both directions, not assumed; it was not always true, and while it was not, a session started one directory down watched nothing the list named.

## The route to the file does not matter

Nothing reads your command any more, so there is nothing to phrase around. A protected path that changed during your tool call is **seen**, whichever way it got there: `Write`, `Edit`, `MultiEdit`, `NotebookEdit`, a shell command of any shape, a path assembled at run time, `eval`, an alias, a shell function, a script the command invoked, a program nobody ever put in a table. Creating a protected file and deleting one are changes like any other and are seen the same way.

That is why this rule carries no catalogue of command shapes. Its predecessor had to admit twenty-one documented ways past it, because it decided from a command's *text* which files the command would write, and that question is not decidable. What the measurement compares instead is what the path **is** — it does not exist, or it is a symbolic link pointing *there*, or it holds *these* bytes — and it asks that of the path itself, never of whatever the path may point at. So a link put in a protected path's place reads as the change it is, rather than quietly redirecting the guard onto a file nobody protected; and a write-back whose target would resolve through a link, in the final component or in any parent, refuses and reports the refusal instead of landing somewhere else (`shared/issues/260809-1104_*_a-symlink-in-place-of-a-protected-file-….md` and `shared/issues/260809-1231_*_the-restore-writes-through-a-symlinked-parent-….md`, both closed).

Read that as a claim about the question being asked, not as a promise about the machinery asking it. Every gap this rule has had to admit was found at the seam between the fingerprint and the filesystem it is taken from, not in a clever spelling of a command, and that seam is where the next one would be. Finding one is a defect to file, never a route to take: point 1 of `## What to do instead` holds whether the miss turned up by accident or by looking for it.

## What is written back, and what is only reported

Detection does not depend on the tool. The write-back does, in one narrow and deliberate way (`shared/decisions/260809-1527_*_should-the-revert-narrow-to-the-payload-path-….md`):

- **Under `Bash`, every changed protected path is written back.** A shell payload names no files, so there is no narrower question to ask and nothing here was narrowed. Fusion's own revert spelling is not an exception either: `git checkout HEAD -- rules/x.md` changes a protected path, so it is put back and halts like anything else. Restoring a protected file is a human act.
- **Under `Write`, `Edit`, `MultiEdit` and `NotebookEdit`, the payload names the path being written.** That path is written back if it moved. A *different* protected path that moved in the same window was moved by something that is not this tool call, so it is left standing. That is where the guard stops destroying a concurrent writer's work — not a seam to aim at, because a write tool writes the path its payload names and has no second write.

Both branches raise the same halt, and neither is silent: a path left standing is still named in the message you receive and still recorded as its own `guard_block` event.

## What the measurement costs

Three prices come with it, and they are stated here rather than left to be discovered:

- **The change happens before it is seen.** Your tool call runs, the file is written, and only afterwards is the previous content put back. Whatever the write set off in the meantime — a watcher that reloaded, a build that started, a process that read the new bytes — is not undone with it.
- **A read is not a change.** A protection list watches files for changes, so a command that reads a protected file and carries its content somewhere else trips nothing. That is true of any list-based guard and is not a gap this one could close.
- **The window is the whole tool call, and it is not exclusively yours.** Anything that writes a protected path between the two fingerprints is measured, including writers that are not you: the user saving in their own editor, a file watcher, a build you started in an earlier call, a second Claude session. Measured, with no agent write anywhere in the sequence — during one `Bash` call the user saved a rule file, the save was written back over, and the session halted (`shared/issues/260809-1107_*_any-writer-active-during-the-tool-call-….md`). A long call, a test suite or a build, holds that window open for minutes. So a halt naming a path you never touched is a case that really happens, and the answer to it is to report, not to reapply anything.

The bytes a write-back overwrites are **preserved first**, under `fusion-workbench/.guard-state/reverted/`, and the message names that file exactly. Only the most recent copies are kept, so if a write-back took something that was not yours, hand the user the named path while it is still there instead of reconstructing the content from memory.

## The one exemption

`FUSION_ALLOW_RULES_WRITE`, set by the user for a session, exempts the project's rule directories and the `retired/` destination inside them — and nothing else on the list. A change to an exempted path is left standing and recorded as a `guard_advisory` event, so the user reads afterwards what the permission bought. The flag does not switch the guard off and does not clear a halt.

**A protected entry the project itself declares outranks the flag.** A path named in the project's own `fusion-guard.json` under `guard.protectedPaths` is subtracted from the exempt set, so a project that declares `rules/**` has withdrawn the flag from its whole rule directory, `retired/` included.

**For every protected path the flag does not name, there is no override.** That is deliberate. The answer is the Human Gate below.

## What to do instead

1. **STOP.** Do not reapply the change, and do not go looking for a route the measurement misses. Reaching for one is the act this rule forbids, whatever the guard happened to allow.
2. **Do not re-route through another tool.** The write tools and the shell are measured against one list, so switching surfaces changes nothing — and the narrowing above is not a re-route either, since a write tool's payload path is exactly the path that does get written back.
3. **Human Gate.** Surface the situation to the user: name the file, say what you were trying to do and why. The hooks only ever see an agent's tool calls, so the user can make the change in their own terminal, adjust `guard.protectedPaths` in the project's `fusion-guard.json`, or tell you to do something else entirely.

The shape of the alternative, concretely. Retiring a rule file with `mv rules/old.md rules/retired/old.md` runs and is then undone. What you do instead is propose the retirement — name the file, say why it should go, say where it should land — and then continue with the work that depended on it.

### What a halt costs you

A measured change to a protected path raises the halt outright, rather than counting toward the three-block threshold: a protected path really was written, so there is no "two more of these" to wait for. A halt blocks every `Write`, `Edit`, `MultiEdit` and `NotebookEdit` call until a human clears it:

```
[HALTED] All write operations blocked. The guard has been halted after
repeated violations. The halt is recorded per project and the clearing script
finds it by walking up from its working directory, so the `cd` is part of the
command: cd <project-root> && node <plugin-root>/hooks/dist/clear-halt.js
```

The live message names both directories in full. Report it to the user as it
came, `cd` included: run from anywhere else the script finds no workbench, says
so, and exits non-zero without clearing anything.

Shell commands and reading still run under a halt, deliberately, so you can find out what happened and tell the user how to clear it. Clearing it is a human act. Do not try to route around a halt; report it.
