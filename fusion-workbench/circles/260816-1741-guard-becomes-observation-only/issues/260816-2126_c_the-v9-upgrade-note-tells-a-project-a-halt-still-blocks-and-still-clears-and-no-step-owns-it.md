`docs/upgrading-to-v9.md` tells a consuming project that a halt still blocks and still clears, and no step owns the file

---

`docs/upgrading-to-v9.md:133-135`, under the heading `## What needs no action`:

> - **A halt raised by the old protected-path guard** still blocks and still clears exactly
>   as it did. v8 removed the mechanism; the halt value outlives it by design, and the block
>   message names the command that clears it.

All three clauses are false at `3c2e1c6`. Nothing blocks; `hooks/clear-halt.ts` and its compiled
output are deleted, so the command the sentence promises does not exist; and there is no block
message to name it, the guard having no block path left. The remedy is now `/fusion:setup`'s
deletion offer, which the file cannot mention because it predates it.

The file is not in step 11's Files list, nor in any other step's. It is shipped (`install.sh`
copies `docs`), it is pointed at from `README.md` `## Install` and from `/fusion:help`'s update
topic, and it is the surface a project upgrading over these removals reads first — the population
this sentence is most wrong for is exactly the population it was written for. It falls inside the
Directive's stated scope by property, "the shipped text that presents a blocking, halting guard as
a live property", the same reading
`circles/260816-1741-guard-becomes-observation-only/issues/260816-1917_o_the-groundings-text-surface-list-omits-three-surfaces-that-state-the-halt-as-live.md`
already applied to three other omissions.

**A second, smaller omission of the same kind, in a file step 11 does open.**
`docs/working-model.md:162` describes `README-hooks.md` as "the compliance guard in full: config
fields, sensitivities, thresholds, halt clearing". Step 11 names `:116-124` and `:136` of that file
and not `:162`, and all four of those nouns leave with the guard's configuration surface.

---

Context: found by `coderev` reviewing Turn 1 of this Circle, range `3d41d4a..3c2e1c6`, by grepping
`halt` across `agents/`, `skills/`, `rules/` and `docs/` and matching each hit against a step's
Files list. Everything else that came back is either owned (step 11), correct as history
(`skills/archive/SKILL.md:130`, `:132`, `:274`, which describe rows already in the event log and
which the plan deliberately leaves alone), or the curator's (`rules/`).

Proposed shape of the fix, for whoever sequences the remaining steps: add `docs/upgrading-to-v9.md`
and the `docs/working-model.md:162` line to step 11. The v9 note's correction is one bullet, and it
should point forward to `docs/upgrading-to-v10.md` (step 12) rather than restate the new remedy,
so the two notes do not both have to be maintained. Do **not** rewrite the v9 note's history — it
is a per-release record and its account of what v9 did is correct; what needs changing is the
present-tense promise in its `## What needs no action` section, which is a claim about now.

What it costs if it stands: a project upgrading from v8 straight to v10 reads a documented "no
action needed", goes looking for `hooks/dist/clear-halt.js` when it meets a halt flag, finds
nothing, and has been told by the plugin's own migration document that this is the expected state.

---

Resolved: `docs/upgrading-to-v9.md` keeps its v9 history untouched and corrects the two present-tense bullets under `## What needs no action`. The halt bullet now says the halt was enforced **at v9** and that v10 removed it, the escalation counter and the clearing script together, that a leftover flag blocks nothing and has no command to clear it, and that `/fusion:setup` offers to delete the file; it points a reader upgrading past v9 at fusion's v10 upgrade note. The `fusion-guard.json` bullet says the same in its own terms: unaffected at v9, not read at all at v10, and a Turn budget left in it silently not applied. The forward pointer is deliberately **prose and not a path** — `docs/upgrading-to-v10.md` does not exist until plan step 12, and citing it would be the very dangling reference this step exists to close; step 12 turns it into a link when it writes the file. The `:100` citation of the deleted `hooks/config.json` became "the plugin's own configuration file", which keeps the churn-check history true without a dangling path. The second omission this record named, `docs/working-model.md:162`, was fixed in the same change: the `README-hooks.md` pointer no longer promises config fields, sensitivities, thresholds and halt clearing. Landed with plan step 11.
