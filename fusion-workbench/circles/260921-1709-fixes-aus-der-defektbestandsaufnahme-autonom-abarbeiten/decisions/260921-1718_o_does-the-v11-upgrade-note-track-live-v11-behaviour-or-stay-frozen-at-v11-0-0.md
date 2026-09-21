# Does the v11 upgrade note track live v11 behaviour, or stay frozen at v11.0.0?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260915-2145_*_the-v11-upgrade-note-is-maintained-as-live-in-one-commit-of-this-range-and-frozen-in-the-other.md (the defect this answers), 260921-1653-open-defect-survey-at-11-9-1.md (row 27), 260915-2028_*_a-fifth-status-value-for-work-items.md (the plan that declined to edit the note), 260921-1709-fixes-aus-der-defektbestandsaufnahme-autonom-abarbeiten.md

---

## Question

`docs/upgrading-to-v11.md` is what a project on v10.26 reads to reach any v11.x. Three commits (`950a606e`, `9d5b1e80`, `4d692c57`) edited it to describe the migration and the head fields as they behave now; one plan (`260915-2028_*_a-fifth-status-value-for-work-items.md` step 6) declined to touch it on the ground that it records what v11.0.0 did, so its `**Status:**` sentence still names four values where the set is five. Both positions are defensible; one file holding both is not, and every further edit tips it toward "live" without anyone having said so. The choice binds every future v11.x release, so it is a record.

## Options

1. **Live.** The note describes v11 as it stands at the release named in its own head, and every v11.x release that changes something the note describes edits the note in the same commit. `:25` names five values now. A sentence under the title says so, so a reader knows which v11 they are reading about.
   - Pros: matches what three of four commits already did; the reader arriving from v10.26 lands on the current v11.x and needs the current description; one file to keep true.
   - Cons: an obligation on every release, of the kind `skills/help/SKILL.md` `### 4. Update` already carries and missed twice (`260906-2014_*`); "what v11.0.0 did" is then recoverable only from git.
2. **Frozen at v11.0.0.** The note states in its head that it describes v11.0.0; `950a606e`'s and the later edits are re-framed as "since v11.x" clauses or moved to a per-release note.
   - Pros: history stays readable in place; no per-release obligation.
   - Cons: the reader is told the migration does something it no longer does, at the moment they run it; the three live-side edits have to be unpicked; a per-release note is a new file kind nobody has asked for.

## Constraints

- The file says which it is, where the reader meets it (the defect's acceptance).
- Whichever is chosen, `:25` and the migration description agree with each other and with `rules/fusion-workbench-conventions.md` `## Backlog entries — work items` at the release the note claims to describe.

## Recommendation

Option 1. A note read at upgrade time is read against the version being installed, and that version is the latest v11.x, not v11.0.0; the tree has already been maintained that way three times. The obligation it adds is written into `README-agents.md` `## Releasing` step 0 beside the help-topic one, which is the list a release runs.

---
Working answer (plan 260921-1726): option 1 — live; the note says so under its title, its `**Status:**` sentence names the five values with `paused`, and `README-agents.md` `## Releasing` step 0 carries the obligation that a release changing what the note describes edits it in the same commit; implemented in the commit that carries this line.
