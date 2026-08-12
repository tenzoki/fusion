`.fusion-setup` is gitignored in a consumer, so a fresh clone silently has no fusion at all

---
Measured on 260812 in `/Users/k1/Projects/productive/unite-co-creator`. Every file in that working
copy carries mtime `2026-08-12 02:43`, so the tree was cloned or reset tonight. Its `.gitignore`
line 49 excludes `**/fusion-workbench/.fusion-setup`, and the marker is therefore **absent**.

---
**Witness:** the working copy, read tonight
**Severity:** high — fusion is currently inert in that project and nothing says so
**Affected:** `bin/fusion-workbench-root`, `hooks/lib/workbench-root.ts`, `skills/setup/SKILL.md`,
`rules/fusion-workbench-conventions.md` `## Which of them a tracked workbench tracks`

## What follows from the marker being absent

Every agent and every hook locates the workbench by walking up for `fusion-workbench/.fusion-setup`.
With it gone:

- the hooks **no-op silently** — no guard, no protected-path measurement, no churn, no escalation;
- `bin/fusion-workbench-root` exits 1, so an agent halts at Setup with "run `/fusion:setup`".

So the project has a 36 MB workbench, twelve Circles, 1 148 records — and no fusion. The halt is at
least loud. The hooks standing down is not: a session that never reaches an agent's Setup, or a
tool call arriving before one, runs with no guard and says nothing.

Five root-anchored surfaces are gone from that copy for the same reason: `.fusion-setup`,
`.guard-state/`, `orchestrator-events.jsonl`, `agentstate.yaml`, `.session-marker`. Four of those
are live state and their loss is correct by fusion's own split. **`orchestrator-events.jsonl` is
not** — the conventions classify it as a record, append-only across sessions, read cross-session.
Ignoring it means the richest evidence a consumer produces cannot leave the machine, which is
exactly what the 260812 consumer analysis found when it went looking for it.

## Why this is fusion's defect and not the project's .gitignore

Queue entry 44 already records that **`.fusion-setup` has no classification** in
`rules/fusion-workbench-conventions.md` `## Which of them a tracked workbench tracks`. It is
neither in the record list nor in the live-state list. A consuming project asked to decide for
itself, with no guidance, chose the reading that makes fusion silently inert after a clone — and
that reading is defensible, because the marker does record a moment ("setup ran here, at this
version") rather than a state.

It is not a free choice, though, and the conventions do not say so. The marker is what every hook
resolves against, so ignoring it converts a clone into a project where the guard does not run.
Whatever the classification turns out to be, that consequence has to be stated where the decision
is made.

## Cheapest thing that would have caught it

The SessionStart hook already warns when a workbench root is found *above* the working directory.
It says nothing when no marker is found at all — the one case where fusion is doing nothing.
