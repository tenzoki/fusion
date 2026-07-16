---
description: Revise CLAUDE.md with this session's learnings while actively pruning obsolete, outdated, redundant, or unimportant content. Three-pass edit (add / update / prune), verified, reported as a diff.
argument-hint: [section name | "prune-only" | "add-only"]
allowed-tools: [Read, Edit, Bash, Glob, Grep]
---

# Revise CLAUDE.md

CLAUDE.md is **auto-loaded into every Claude Code session** in this project. Every line costs context budget on every invocation. The discipline of this skill is therefore not just *what should be added* but **what should leave** — to keep the file lean and load-bearing.

A CLAUDE.md that grows monotonically is a CLAUDE.md that drifts: it accumulates obsolete file paths, retired skill names, stale version counts, decisions superseded long ago, and historical narrative that no longer informs decisions. The skill makes three passes (**add → update → prune**), each justified, and reports a diff at the end.

## Argument

- empty / `--full` (default) — all three passes
- `<section name>` — focus passes on the named section only
- `prune-only` — skip add/update; just prune
- `add-only` — skip prune (use sparingly; the point of this skill is the prune pass)

## Inputs

Before editing:

1. **Read** `CLAUDE.md` in full. Note its current line count.
2. **Read this session's context.** What was changed, added, removed, or learned? If the conversation is available, scan it. Otherwise:
   - `git log --oneline --since='2 days ago'` for recent commits
   - `git diff HEAD~5 -- CLAUDE.md` to see how CLAUDE.md has evolved
   - `git status` for uncommitted changes
3. **Spot-check what CLAUDE.md says** against current ground truth. For each non-trivial claim that names a path / file / command / version / count, verify it still holds.

## Pass 1 — Add (what's new)

Identify what this session learned that future sessions will need. Candidates:

- New commands, helpers, or scripts discovered
- New architectural invariants or design decisions
- Non-obvious gotchas — workarounds, ordering constraints, hidden coupling
- Newly-added agents, skills, templates, or tools
- New project conventions that emerged
- Hidden state files or runtime artefacts the user should know about

**Bar for inclusion:** would a future session, working from CLAUDE.md alone, fail without this fact? If not, it doesn't belong here. If a doc file already covers it, link instead of duplicate.

## Pass 2 — Update (what changed)

For each existing line that names a path / file / command / version / count / state, verify it still holds. Common drift patterns:

- A path that has moved or been renamed
- A version number now lower than current
- A count (of agents, skills, etc.) that no longer matches reality
- A skill/agent that has been retired
- A "where to look when X breaks" entry whose pointer file no longer exists
- A decision recorded as open that has since been resolved

For each, edit in place. Don't add a new line *and* leave the old — replace.

## Pass 3 — Prune (what should leave)

This is the hardest and most important pass. Apply each criterion below; if a line fits any of them, propose it for removal.

### 3a — Obsolete (the thing it describes is gone)

- Refers to a file/directory that no longer exists
- Names an agent/skill that has been retired
- Describes a configuration field no longer read
- Lists a step in a workflow that has been removed

**Verification:** before removing, actually check. `test -e <path>`, `grep -l <name> agents/ skills/`, etc.

### 3b — Outdated (contradicts current state)

- Version number is wrong
- Count is wrong
- "Latest" / "currently" / "as of <date>" markers that have passed
- Status pointers (e.g. "in v1.x" when the project is past v1.x)
- Deadlines that have passed without the entry being updated

**Verification:** compare against current ground truth (file system, git log, recent state).

### 3c — Redundant (covered better elsewhere)

- Duplicates content of `README.md`, `README-agents.md`, `rules/*.md`, `docs/*.md` — replace with a one-line pointer
- Says the same thing twice in different sections of CLAUDE.md itself (consolidate)
- Restates a well-known convention (e.g. semver) — drop, don't keep

### 3d — Unimportant (true but doesn't decide anything)

- Historical narrative: "this used to work via X, then we changed it to Y" — once Y is the only path, the prehistory is git-log material, not CLAUDE.md material
- Decorative section dividers, mission statements, "this is fusion" framings (CLAUDE.md is for the AI working on the codebase, not for marketing)
- Personal commentary that doesn't translate to a decision rule
- "Future work" lists — those belong in the workbench, as a plan or an issue, not here

**Verification:** would removing this line cause a future session to make a worse decision? If you can't name a concrete failure mode, the line isn't load-bearing.

## Pass guard — what to PRESERVE

Some content looks prunable but is actually load-bearing. Don't remove:

- **Critical procedures** — release flow, setup invariants, "do not do X" rules. Even if obvious, repetition is cheap and the cost of forgetting is high.
- **Hidden coupling** — anything an outsider would have to discover the hard way (e.g. "the marketplace clone must be `git pull`-ed manually for new versions to land locally").
- **Non-obvious failure modes** — "if you see X, the cause is Y" rows of the troubleshooting table.
- **Authoritative pointers** — paths to source-of-truth files (rules, normative material). These are the spine of the file.
- **User-authored content** that doesn't fall under any of 3a-3d. When in doubt about user intent, leave it.

## Process

1. **Read CLAUDE.md and measure.** Record current line count.
2. **Run the three passes.** For each proposed change, write it down with a one-line justification (which criterion: 3a/3b/3c/3d, or which Add/Update bar).
3. **Apply edits** (only after the candidate list is complete — don't edit incrementally; you may flip-flop).
4. **Re-read** CLAUDE.md after edits to verify it still reads cleanly.
5. **Report** the diff:
   - Lines before → after
   - Bytes before → after
   - Net additions: <count>
   - Net updates: <count>
   - Net removals: <count> (broken down by criterion 3a/3b/3c/3d)
   - One-line summary of each change

## Soft size budget

CLAUDE.md should usually fit in **150–250 lines** for a project of fusion's size. If yours is much larger:

- Prefer pruning over adding in this pass
- Surface the size in the report and note which sections are growing
- Suggest extracting a section to a separate file (under `docs/`) and replacing it with a one-line pointer

If after this skill runs the file grew, that's a signal to be more aggressive next time.

## What this skill must NOT do

- **Do not silently rewrite tone or structure** beyond what's needed for the targeted edits. CLAUDE.md is the user's voice on their project; preserve it.
- **Do not commit.** The user decides when to `git add CLAUDE.md`.
- **Do not touch `README.md`, `README-agents.md`, `rules/`, or `docs/`** — those have their own update flows.
- **Do not invent gotchas or invariants** to fill the file. Every Add must be grounded in something that actually happened this session or is verifiably true now.
- **Do not prune content you can't verify is obsolete.** If you're not sure, leave it and surface it in the report as "candidate, but unverified".
