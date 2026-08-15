# What permission grant does Setup seed when `unlock` becomes a Setup step, and what becomes of the inert `settings.json`?

---
**Domain:** code
**Status:** answered
**Filed by:** planner
**Cross-references:** `shared/issues/260810-0326_*_setup-must-seed-claude-settings-because-the-plugin-settings-json-is-not-a-permission-source.md` (fix items 2 and 3, both filed there as decisions); `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/_t_circle.md` § Grounding snapshot → The administrative surface; `skills/unlock/SKILL.md`; `skills/setup/SKILL.md`; `install.sh`

---

## Question

Item 9 of this Circle folds `/fusion:unlock` into Setup, which closes the open defect
`260810-0326`. That defect does not merely ask for the fold — it names two choices it
deliberately left open, and says of the first that it "is a decision, not an executor's call".
Both have to be answered before Setup can be edited.

**(a) What does Setup write?** `/fusion:unlock` writes `permissions.defaultMode:
"bypassPermissions"` plus a list of bare tool names. That is a deliberately permissive grant
which a user asks for by typing a command. Setup runs once at the start of a project and is not
that request. The same defect measured that a narrower grant cannot be expressed at all in this
Claude Code version: `Write(fusion-workbench/**)` and every other scoped path form was denied
even from a settings file that *is* read, and only the bare tool name was honoured. So "narrow"
is not on the table as a third grant — the choice is about *consent*, not about scope.

**(b) What becomes of `settings.json` at the plugin root?** It is inert: a plugin's own
`settings.json` is not a permission source under `--plugin-dir`, measured on Claude Code 2.1.226.
Its sixteen scoped entries grant nothing, and every one of them uses the path form that was
measured not to match. `install.sh:81` still copies it. The defect's fix item 3 asks for a
decision because leaving it "invites the next reader to conclude from its contents what a session
is allowed to do".

## Options

Part (a) — what Setup writes:

1. **Seed the `/fusion:unlock` grant unconditionally.** Setup performs the merge that skill
   performs, every run, with no prompt.
   - Pros: a fresh consuming project completes an orchestrator Turn without an approval dialog,
     which is the defect's own acceptance criterion, met with nothing for the user to do.
   - Cons: `bypassPermissions` is written into a project without the user ever asking for it. The
     command that used to write it existed precisely so the user asked.
2. **Seed it behind one Setup confirmation, defaulting to yes.** Setup names the file, names
   `bypassPermissions` in plain words, and writes on the user's answer. Declining leaves the
   project with per-tool prompts and Setup says so.
   - Pros: the consent that the slash command carried survives the fold, at the cost of one
     question in a procedure that is already interactive at Step 0. The user learns the file
     exists, which matters when they later wonder why nothing prompts.
   - Cons: one more gate in Setup, and a user who declines gets the approval-dialog experience the
     defect was filed about.
3. **Seed nothing; document the manual step.** Setup reports that permissions are unseeded and
   what to write.
   - Pros: no file written on the user's behalf at all.
   - Cons: it does not close `260810-0326`, which is the reason the fold is in this Circle.
     Listed for completeness and not proposed.

Part (b) — the inert `settings.json`:

1. **Delete it, and its `install.sh` copy entry.** Nothing reads it; `CLAUDE.md` already records
   that it grants nothing.
   - Pros: a file that cannot do what it looks like it does stops existing. One fewer shipped
     asset.
   - Cons: if a future Claude Code version starts reading plugin settings, the file has to be
     written again — from a record, since nothing would remain.
2. **Keep it with a `_comment` saying it is not read.** JSON has no comments, but the file already
   has room for an underscore-prefixed key, the way `fusion-guard.json` uses `_what`.
   - Pros: the sixteen entries survive as a record of what fusion would grant if it could.
   - Cons: it keeps a permission-shaped file in the tree whose entries were measured not to match
     even from a source that is read, so the record it preserves is of a grant that never worked.

## Constraints

- Whatever is chosen for (a), the merge procedure is `/fusion:unlock`'s and is not re-implemented:
  the defect's acceptance says so, and a second implementation of a settings merge is the
  duplication `rules/critical-stance.md` §2 forbids.
- The gitignore step of `/fusion:unlock` (step 5) travels with the merge. A seeded
  `settings.local.json` that lands in a commit is a worse outcome than an unseeded one.
- Bare tool names only. The scoped path forms fusion ships were measured not to match, so no
  option may seed them under any wording.
- Whatever is chosen for (b), no shipped document may claim the plugin-root `settings.json`
  grants permissions. That half is already true in `CLAUDE.md` and must stay true.

## Recommendation

(a) option 2, and (b) option 1. Moderate confidence on (a), high on (b).

*Verified:* the measurement behind "only the bare tool name was honoured" is recorded in
`260810-0326` with its probe table, and `install.sh:81` was read and does copy `settings.json`.

*Inference:* that writing `bypassPermissions` into a project unasked is worse than one question.
This is a judgement about consent, not a measured fact, and it is the half of the answer most
worth the user overriding — a user who runs `/fusion:setup` on many projects will experience the
question as friction, and they are the person who knows how often that happens.

*Not established:* whether the approval-dialog problem still exists at all. The same defect
records that a `fusion:playmaker` dispatch was *permitted* with no `.claude/` present, and offers
two readings it could not separate. If the dialogs are gone, part (a) is answering a dead
question and option 3 becomes honest. Re-measuring on the current Claude Code version costs one
scratch project and settles it.

---
Answered: shared/history/260814-2306-orchestrator-session.md:153 — Part (a) option 2: Setup asks once, defaulting to yes, naming the file and bypassPermissions in plain words, and writes on the answer. Part (b) option 1: the inert settings.json is deleted together with its install.sh copy entry. Answered by the user at the plan gate.
Implemented: skills/setup/SKILL.md `## Step 0g — Offer to seed the project's permission file` (part a option 2: one AskUserQuestion defaulting to yes, naming .claude/settings.local.json and bypassPermissions in plain words, bare tool names only, the unlock body's merge and gitignore steps carried over verbatim as the single implementation, and a declined answer reported in the Done report); settings.json deleted and its copy entry removed from install.sh, with CLAUDE.md's installer bullet rewritten to state the measurement without naming the file (part b option 1). No commit hash: the executor does not commit, and the orchestrator's commit for this step is what carries these paths.
Deferred:
Superseded by:
