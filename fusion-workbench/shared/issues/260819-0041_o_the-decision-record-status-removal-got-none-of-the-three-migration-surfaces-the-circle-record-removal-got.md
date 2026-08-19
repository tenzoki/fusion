The decision-record `**Status:**` removal got none of the three migration surfaces the identical Circle-record removal got

---

`b54ace5` removed `**Status:**` from the decision-record template. The identical removal from the
Circle-record template, seventeen days of decision history apart but one day of calendar time,
shipped in v10.2.0 with three consuming-project-facing surfaces announcing it. This one has none, and
v10.2.0 is already tagged, so the change lands in a version an installed base will upgrade into.

---

What the Circle-record removal got, all three still at HEAD and all three naming only the Circle
record:

- `docs/upgrading-to-v10-2.md:4-6` — "The `**Status:**` head field is gone from the template", scoped
  in its opening line to "what a Circle record holds", plus a table row at `:45` telling the reader
  their existing records keep the field and nothing reads it.
- `README.md:28` — "v10.2 changes what a Circle record holds: the `**Status:**` head field leaves the
  template".
- `skills/help/SKILL.md:101` — the update topic's "Coming from a v10.0 or v10.1 install" paragraph,
  same scope.

The decision-record removal appears in none of them. A reader on v10.2.0 who upgrades past this
commit gets a template change to a second record kind, announced nowhere.

**It is not an oversight of the answering decision.** `260818-2212`'s `Answered:` footer states the
change surface as "two rule files" and the realisation held to it exactly, which is correct
discipline. The gap is that nothing carries the release-time obligation forward: `CLAUDE.md`'s
`docs/` row says a migration note is "written only when a release removes something an installed base
already has on disk", and this removal meets that condition while no record names it as owed.

**Why it will be missed.** The version surfaces are checked at release (release process step 1 and
the four-surface note in `CLAUDE.md`); the migration-note obligation is not one of the four, has no
gate, and is triggered by a property of the diff rather than by a step. The precedent is fresh enough
that the asymmetry is visible today and will not be in a month.

Verified at HEAD `b54ace5`: `.claude-plugin/plugin.json` reads `10.2.0`; `git rev-list -n1 v10.2.0`
is `e14b6ca`, an ancestor of this range; `grep -rn "Status" docs/ README.md skills/help/SKILL.md`
returns Circle-record scope only.

**Fix direction.** Either extend `docs/upgrading-to-v10-2.md` if this ships as part of the same
release line and its scope line is widened to say so, or open the next `docs/upgrading-to-vN.md` with
this change in it and add the README and `/fusion:help` lines beside it. Which of the two depends on
the version this ships in, which is not decided yet — so this is a release-time task, not an
immediate edit, and it needs to be visible at that moment rather than now.

This is the second half of the same cause as
`shared/issues/260819-0038_o_the-gitignore-comment-still-says-…`: a change realised precisely inside
a stated change surface, with the surfaces *outside* it that describe the same fact left standing.

Found in the coderev pass over `52b1d95..b54ace5`, session `260818-2301`. No Circle active, so it is
filed in the shared store under the Origin Rule.
