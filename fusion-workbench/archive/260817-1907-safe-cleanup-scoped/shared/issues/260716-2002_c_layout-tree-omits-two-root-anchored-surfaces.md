# Layout tree omits `.commit-lock/` and `.session-marker`, both root-anchored; "the four root-anchored surfaces" undercounts

**Filed:** 260716-2002
**Severity:** Low
**Domain:** code
**Filed by:** coderev
**Scope:** `rules/fusion-workbench-conventions.md`

## Problem

The rewritten layout tree ends with a labelled block:

```
│   # ── Root-anchored. The hooks and the monitor read these HERE. Do not move them. ──
├── agentstate.yaml
├── orchestrator-live.md
├── orchestrator-events.jsonl
└── .guard-state/
```

and the prose below it: *"**The four root-anchored surfaces are not negotiable.**"*

Two more root-anchored surfaces exist and are missing from both the tree and the count:

- **`.commit-lock/`** — the same document says so, 400 lines later: *"The lock is
  root-anchored, like the other project-wide state — it guards the project's git index,
  which no single Circle owns."* (`## Commit lock` → Mechanism, a sentence added by this
  same commit `6d4a88d`.) So the document knows; the tree does not show it.
- **`.session-marker`** — `bin/fusion-session-mark` reads and writes
  `fusion-workbench/.session-marker`, and `/fusion:setup` Step 0d depends on it. Nothing in
  the layout mentions it.

`stashes/` and `stilwerk/` are in the tree but not created by Step 0's `mkdir -p`; that is
correct and intentional in both cases (`stashes/` is annotated "created on first stash";
`stilwerk/` is populated by a later Setup step), so no change is needed there.

## Impact

Low, and purely a documentation-completeness matter — no code reads the tree. It earns a
filing because of what this document now claims to be. Commit `6d4a88d` opens with:

> **This document is the definition.** Layout, origin rule, and path resolution are defined
> here completely. [...] A path literal that names a store directory belongs in exactly two
> places: this file, and `bin/fusion-paths`.

An incomplete layout tree in a document that asserts completeness is the failure mode the
restructure exists to prevent, in miniature. The concrete risk is the one the tree's own
label warns about: an agent reading "the four root-anchored surfaces" and reasoning by
omission that `.commit-lock/` or `.session-marker` may live in a Circle. Both are
project-wide by construction — a commit lock guarding the git index and a
one-orchestrator-per-project marker are meaningless scoped to a unit of work.

## Recommendation

Add both to the root-anchored block of the tree, and replace the count with the property:

- "The root-anchored surfaces are not negotiable" rather than "the four" — a count is a
  thing that goes stale, and this one already has.
- Annotate each with its reader, as the existing prose does for the first four
  (`hooks/tracker.ts:33-36`, `bin/monitor:72-75`): `.commit-lock/` → `bin/fusion-commit-lock`,
  `.session-marker` → `bin/fusion-session-mark`.

Worth covering in **P-8's lint gate** if it is cheap to do: the gate already has to know
the set of legal workbench paths in order to reject type-folder literals, so asserting that
every root-anchored path a `bin/` helper touches also appears in the tree is close to free.

## Cross-references

- `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` (tree + "the four root-anchored surfaces")
- `rules/fusion-workbench-conventions.md` `## Commit lock` → Mechanism
- `bin/fusion-session-mark`, `bin/fusion-commit-lock`
- `skills/setup/SKILL.md` Step 0d
- Governing plan: `fusion-workbench/planning/260716-1910[p]-plan-workbench-umbau-circle-container.md` (P-8 lint gate)

---
Resolved: commit 6228391 (task T2-A). Verified by the orchestrator against the running system, not by reading.
