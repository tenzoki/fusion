
Prompt body:

```
**Mode:** survey
```

Add `**Scope:** full` on its own line when the user passed `--full` — the unbounded evidence pass (decision `260827-0745_*_may-the-curators-evidence-pass-be-bounded-by-its-own-previous-run.md`). Add `**Edges:** on` when the user passed `--edges`, and `**Placement:** on` when the user passed `--placement` (`agents/policy-curator.md` `## Dispatch parameters`). The apply dispatch takes no `**Scope:**` or `**Edges:**` line. `survey` is the agent's default; passing it anyway is deliberate — the dispatch says which pass it wants. The agent resolves its own paths at its Setup, reads its evidence sources bounded by its anchor, and writes the run file. It writes to no normative surface in this pass. Wait for it.

## Step 3 — Read what the survey returned

The agent's report carries three things this workflow needs, and they are the approval question it could not put itself:

1. **The run file's path**, workbench-relative.
2. **The count per consequence group** (`agents/policy-curator.md` `### The approval`) plus the number of candidates, which are never offered for approval.
3. **The blast-radius check** — whether proposed deletions exceed 20 percent of any single surface's bytes; with it, each surface's net byte delta.

