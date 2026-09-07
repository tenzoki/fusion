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

Partly corrected 2026-09-07 alongside plan step 10, in the working tree and uncommitted at the time
of writing: `skills/cleanup/SKILL.md` now carries its Step 5 and Step 6 sections in numeric order,
`## Step 0`'s `--dry-run` sentence names Step 6's survey dispatch, Step 6's rejection clause sends
the reader to Step 7, and `## Notes for the assistant` names Step 6's gate. The first two clauses of
the acceptance test therefore hold. `README-agents.md` is untouched and still labels both the
`/fusion:log-activity` and the `/fusion:curate` row "Cleanup Step 6", because that task was bounded
to one file; the third clause is unmet and this record stays open on it.

---
Resolved: `README-agents.md` corrected against the pipeline as it now stands, completing the third
clause of the acceptance test. The `/fusion:log-activity` row of the skill table in
`README-agents.md`, under the heading "one file per slash command", now reads **Cleanup Step 5**; the
`/fusion:curate` row keeps **Cleanup Step 6**, so no two rows claim one number. A third drift site
the record did not name was found in the same pass and corrected with it: the `curator`
`**Scope:**` row of `README-agents.md` `## Dispatch parameters` said `--full` is passed at
`/fusion:cleanup` Step 5, and the `--full` flag belongs to Step 6 (`skills/cleanup/SKILL.md`
`## Arguments`, both the selector table and the flag list). Every remaining cleanup-step number in
the file was read against that selector table and matches: Step 3 reconciler, Step 4 archive,
Step 5 log-activity, Step 6 `claude-md`. The `## Step 2` / `## Step 6` citations in the three
`curator` parameter rows are steps of `skills/curate/SKILL.md`'s own body, not of the pipeline, and
were verified against that file rather than renumbered.

Not repaired, and named here rather than fixed silently: the `/fusion:cleanup` row of the same
skill table still describes the run order as "archives (tier-1), reconciles `CLAUDE.md` at a user
gate, logs activity", which reverses Steps 5 and 6. It names no step number, so it falls outside
this record's acceptance test, and the same sentence stands in `skills/cleanup/SKILL.md`'s own
frontmatter `description`, which this task was not scoped to touch — repairing one of the two alone
would put them out of sync. Worth a follow-up that corrects both together.
