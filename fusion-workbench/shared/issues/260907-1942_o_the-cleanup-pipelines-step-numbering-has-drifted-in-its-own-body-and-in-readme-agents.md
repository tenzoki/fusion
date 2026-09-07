The cleanup pipeline's step numbering has drifted in its own body and in README-agents
---
`skills/cleanup/SKILL.md` carries its Step 6 section physically before its Step 5 section, and three
cross-references inside it name the wrong step. `README-agents.md` labels two different skills as
Cleanup Step 6.
---
**Filed by:** planner, Kai Stalmann <ks@qantr.com>

The selector table and `## Autonomy and safety` both fix the runtime order as 1–8 with
`log-activity` at 5 and `claude-md` at 6. The prose has come loose from that in four places.

Evidence, all at HEAD `abcaa823`:

- `skills/cleanup/SKILL.md` `## Step 6` stands above `## Step 5` in the file, so a reader executing
  the body top to bottom runs the gate before the activity log.
- `skills/cleanup/SKILL.md` `## Step 0`, in its `--dry-run` sentence, names "Step 5's survey
  dispatch"; the survey is Step 6's.
- `skills/cleanup/SKILL.md` `## Step 6` ends its rejection clause with "go on to Step 6" from
  inside Step 6.
- `skills/cleanup/SKILL.md` `## Notes for the assistant` says "ask at Step 5's gate"; the gate is
  Step 6's.
- `README-agents.md` labels the `/fusion:log-activity` row "**Cleanup Step 6**" while the
  `/fusion:curate` row carries the same label; log-activity is Step 5.

Found while planning `260907-0829-message-between-checkouts-read-before-pull`, which adds a half to
Step 6 and therefore reads these numbers closely. It did not arise from that Directive.

Acceptance test: the Step 5 and Step 6 sections stand in numeric order in the file, every step
reference in `skills/cleanup/SKILL.md` names the step the selector table names, and no two rows of
`README-agents.md`'s skill table claim the same cleanup step number.
