If `$FUSION_PLUGIN_ROOT` is not set or the copy fails, report it and continue.

## permissions — the project's permission file

A fresh consuming project has no permission source of its own, so every `Write`, every `Edit` and every non-sandboxed shell call a fusion session makes raises an approval dialog. This selector offers to write the file that stops that. It is the only one here that asks the user for a decision on a normal run, and it asks **once**.

### 1. Ask

One `AskUserQuestion`, in the project's chat language, naming the file and what the setting does in plain words rather than behind the term:

> fusion writes `.claude/settings.local.json` in this project so future sessions run without asking you to approve each tool. That setting is `bypassPermissions`: Claude Code stops prompting for file writes, edits and shell commands in this project. It still asks before catastrophic operations such as `rm -rf /`. Setup also granted Claude its intermediate-file directory and, without a sandbox, denied its `Write` and `Edit` in system temp directories, which hold Claude's scratchpad unless the session started with `fusion` (`bin/fusion-tmp` header). Under `bypassPermissions`, as under `fusion --yolo`, only those two were shown blocked; a Bash redirect got past. Write it?

Two options. **"Yes, write it" is the default and the recommended choice.** "No, keep the prompts" is the other; nothing is written and the run continues.

Read the target (§2) first if it exists. **A file that does not parse as JSON gets no question and no write**: report it in §3 as a file the user fixes by hand, naming the path, and continue. Otherwise note `permissions.defaultMode`. Already `bypassPermissions` — skip the question, still union the `allow` list (§2, items 3 and 4), and report the union (§3). Any **other** value — the question must name it and say plainly what happens to it: *this project currently sets `defaultMode: "<existing>"`; saying yes replaces it.* A replacement the question did not name is not a replacement the user consented to.

### 2. On "yes", write it

Target: the `settings=` file of `"$FUSION_PLUGIN_ROOT/bin/fusion-tmp" check`, the one `grant` writes; in a worktree, the main checkout's. A non-zero exit: report it, write nothing. Merge into any existing file; never overwrite one.

Desired contents:

```json
{
  "permissions": {
    "defaultMode": "bypassPermissions",
    "allow": ["Bash", "Read", "Edit", "Write", "WebFetch", "WebSearch", "Agent", "Glob", "Grep", "NotebookEdit"]
  }
}
```

**Bare tool names only** — no scoped path form may be written here under any wording, because none of them match.

1. `mkdir -p` its directory.
2. Read it if present. If absent, create it with the JSON above.
3. If present, parse it and union the `allow` list with the values above, **preserving every existing entry — only add, never remove**; that guarantee is about the `allow` list and reaches no other field. Set `permissions.defaultMode` to `"bypassPermissions"` only when the file carries no `defaultMode`, or when the question named the existing value the user agreed to replace — a scalar is replaced, not merged, so it is never set silently. Write back with two-space indentation and a trailing newline.
4. Run `"$FUSION_PLUGIN_ROOT/bin/fusion-tmp" grant`: it adds the intermediate-file grants, the deny entries and the file's ignore line, and removes nothing. `ignored=tracked`: the file is committed; report that it must be untracked.

**Never** write another settings file, and never touch `.claude/settings.json`, which is the shared checked-in file and not this one.

### 3. Report either way, in the Done report

- **Wrote it:** name the path, say the permission change takes effect **on the next session** — Claude Code reads permission settings only at startup, so this session still prompts — and say whether `.gitignore` was modified and `grant`'s `deny=` value. If a `defaultMode` was replaced, name the old value beside the new one. Do not claim the current session is now unlocked.
- **Declined:** say plainly that per-tool approval prompts stay on for this project, and that this check can seed the file on a later run.

If the project already had `defaultMode: "bypassPermissions"`, say so and that the `allow` list was unioned.
- **Malformed:** name the path, say the file did not parse and was left exactly as it was, and that the offer returns once it parses.
