Two demoted-name instances remain in README-agents, and the open record tracking them now lists a residual set that is empty

---
`642130f` swept ten instances of the three demoted skill names into the pipeline form. The two residuals its record named — `skills/setup/SKILL.md:60` and `skills/cleanup/SKILL.md:243` — were both closed later in the same session by `c0e179a` and `381f6d8`. So `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1633_o_eight-shipped-surfaces-still-present-the-three-demoted-skill-names-as-user-commands.md` is open with a "What is left" table whose every row is done. Meanwhile `README-agents.md:71,72` still present `/fusion:curate` as the surface that dispatches the curator, and the same file writes the pipeline form 175 lines later. That site was never surveyed: the record waves through `README-agents.md:239-246` as correct and lines 71-72 are outside it.

---

## Verified at `3a0408a`

Still standing, as user-facing prose naming a demoted skill as the acting surface:

| Site | Text |
|---|---|
| `README-agents.md:71` | "`/fusion:curate`, on both of its dispatches" |
| `README-agents.md:72` | "whoever held the gate, on the apply dispatch: `/fusion:curate`" |

Against `README-agents.md:246`, the same file, the pipeline form: *"**Cleanup Step 5** (`--only claude-md`), and the only path to `CLAUDE.md`."* And `agents/curator.md:3`, corrected by `3a0408a`: *"or via /fusion:cleanup --only claude-md."*

Deliberate and correctly left, for the record — do not sweep these:

- `CLAUDE.md:21` — names all three, labelled as pipeline steps; `derivable-enumerations-lint` requires this listing to name every skill directory.
- `README-agents.md:239,240,246` — slash-command table rows, each labelled "Cleanup Step N (`--only …`)".
- `CLAUDE.md` line warning against `--only curate` — removing the token would delete the sentence that stops a reader typing it.

Code comments in the same family, lower priority and a different owner: `hooks/lib/events.ts:70`, `hooks/lib/__tests__/monitor-warnings-panel.test.ts:508` and `.gitignore:69` each still write "`/fusion:archive`" where `rules/fusion-workbench-conventions.md:81` was rewritten to "the archive step of `/fusion:cleanup`".

## Fix direction

1. `README-agents.md:71,72` — replace `/fusion:curate` with the pipeline form used at `:246`, keeping the `skills/curate/SKILL.md` section citations, which are still correct.
2. Then reconcile `260815-1633_o_*`: its residual table is empty and its two named sites are closed, so it either closes or is rewritten around the sites above. This is a `reconciler` question, not a `coder` one — the record should not be closed by whoever edits the file.
3. The three code-comment sites are worth one sweep of their own; they are not user-facing and can wait.

**Found by:** coderev, reviewing `f4f01b0..3a0408a` (commit `642130f`), with the corpus grep run by a supporting analyst pass and re-verified.

---
Resolved: both halves are discharged.

**Part 1** — `f77633f` rewrote `README-agents.md:71` and `:72` to `/fusion:cleanup --only claude-md`,
the form the same file already used at `:246`, keeping the `skills/curate/SKILL.md` section citations.
Verified at HEAD: `grep -n '/fusion:curate' README-agents.md` returns `:246` only, which is the
labelled slash-command table row this record names as deliberately correct.

**Part 2** — the empty residual table on
`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1633_o_eight-shipped-surfaces-still-present-the-three-demoted-skill-names-as-user-commands.md`
was rewritten by the reconciler at 260816-0713, per this record's own fix direction step 2. That
record stays open around what actually stands — the three code-comment sources this record listed as
"lower priority and a different owner" (`hooks/lib/events.ts:70`, its two compiled mirrors,
`hooks/lib/__tests__/monitor-warnings-panel.test.ts:508`, `.gitignore:69`) — and now states why a
sweep is a scope question rather than a task.

Reconciled 260816-0713 (reconciler, HEAD `f77633f`).
