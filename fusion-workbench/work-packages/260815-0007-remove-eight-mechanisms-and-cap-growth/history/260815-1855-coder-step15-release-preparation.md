# Step 15 — release preparation

**Date:** 2026-08-15
**Agent:** coder
**Status:** Complete
**Task:** P-15
**Source:** `260815-0029_*_plan-remove-eight-mechanisms-and-cap-growth.md` step 15
**HEAD at start:** `9cde86c`

## What this step did

Prepared the v9.0.0 release as far as a working tree can go. It committed nothing, tagged
nothing, pushed nothing and did not touch the marketplace clone: those are the user's acts
and the orchestrator's Phase 4.

## The version, and what decided it

**9.0.0.** The plan already named the number; what follows is the check, because "it is a
breaking change so it is a major" is a rule of thumb and this project's own history is the
evidence that matters.

Every major bump since the v4.0.0 restructure is a removal or a vocabulary break, and every
removal of a user-visible shipped surface since then has been a major:

| Version | Commit | What earned the major |
|---|---|---|
| 8.0.0 | `fcf08be` | the protected-path *half* of the compliance guard removed |
| 7.0.0 | `7598073` | the branch policy deleted, skill files stop being protected |
| 6.0.0 | `e684eae` | the guard measures the result instead of predicting the intent |
| 5.0.0 | `79845f5` | marker delimiter, brackets to underscore |
| 4.0.0 | `cb5fa80` | workbench restructured to the Circle container |

`8.0.0` is the nearest precedent and the strongest one: removing **one half of one
mechanism** was a major, and its commit carries the Conventional Commits `!` breaking
marker, as `7.0.0`'s does. This release removes eight mechanisms, two agents, five skill
directories, three `bin/` helpers, one resolver key, two of four `**Domain:**` values and
four event types. Under this project's own practice that is not a borderline call.

**The counter-evidence, stated rather than hidden.** Two earlier removals shipped as minors:
`3.15.0` removed the bus protocol and `3.6.0` removed Path D. Both predate `4.0.0`, which
is where the practice above begins, and neither removed a surface a consuming project had
configured on disk. So the practice is consistent for the whole 4.x–8.x era and is not
unbroken across the project's whole history.

## The four version surfaces

Three are in this repository and were updated. The fourth is not, and is the user's:

| Surface | State |
|---|---|
| `.claude-plugin/plugin.json` | `8.2.0` → `9.0.0` |
| `install.sh:27` header pin example | `FUSION_REF=tags/v8.2.0` → `v9.0.0` |
| `README.md:26` pin example | same | 
| the marketplace clone's `marketplace.json` | **not touched** — another repository, and the plan's step 15 file list names it only so the release flow is complete |

**The marketplace entry needs more than a version bump, and this is the finding worth
carrying forward.** Read read-only at
`/Users/k1/Projects/productive/F03-CLAUDE-plugin-marketplace/claude-plugins/.claude-plugin/marketplace.json`,
the fusion entry's `description` still advertises five things the tree no longer has: `17
… agents` (15), `code/data/strategic/knowledge` (code/data), `investigator parameterised by
a project-supplied capture-layout rule` (the agent and the template are gone), `churn
detection` (gone), and `an optional push-only Plane work-queue mirror` (gone). Its
`keywords` array still carries `churn-detection`. The plugin's own `plugin.json`
description was corrected step by step as each mechanism left; the marketplace copy of it
was not, because no step could reach another repository. The clone is clean at
`259d58d chore: fusion 8.2.0`.

## Verification

| Command | Result |
|---|---|
| `cd hooks && npm test` | exit 0 — 40 files, 751 tests, green |
| `claude plugin validate .` | exit 0 — *passed with warnings* |
| `claude --plugin-dir . --agent fusion:orchestrator -p "reply SMOKE-OK"` | exit 0, printed `SMOKE-OK` |

The validate warning is the standing one and is correct: *"CLAUDE.md at the plugin root is
not loaded as project context."* `CLAUDE.md` here is dev-only and `install.sh` deliberately
never copies it.

The smoke test was run with `--plugin-dir` pointed at this repository from a **scratch
working directory**, not from the repo root as `CLAUDE.md` `## Release process` writes it.
The reason is side effects: run from the repo root, the orchestrator resolves this
project's workbench and begins Setup, writing session state and the dashboard. From a
directory with no workbench above it, the agent still has to load — which is the one thing
this test checks, since a bad agent name aborts Claude Code at startup — and nothing is
written. This matters more than usual for v9, which deletes two agent prompts and five
skill directories.

## The two things the release owed its installed base

Neither was owned by a plan step. Both were raised in review and left for step 15.

### 1. The orphaned project-local rule file — filed as a decision, not fixed

`260815-1501-coderev-turn-3-…:155` named it and deliberately did not file it: a
consuming project that had the investigator configured now holds
`./rules/investigator-capture-layout.md` that nothing loads, because `analyst` sits in
`bin/fusion-rules`' `PATTERNS=""` arm and draws no project-local rule by filename pattern.

Split in two, because only one half is a decision:

- **The fact** — the file is orphaned and there is a route to re-register it — is
  mechanical and was documented, in `docs/upgrading-to-v9.md` §4 and in
  `skills/help/SKILL.md` §5, which now names `analyst` as the case the context manifest
  exists for.
- **The question** — should `analyst` instead gain a `PATTERNS` arm of its own — is a
  design choice with real options and was filed as
  `260815-1845_*_does-analyst-get-a-project-local-rule-pattern-now-that-the-investigator-fold-orphaned-one.md`.
  The recommendation is option 1 (the manifest is the successor, nothing changes) and it is
  deliberately weak: the missing input is how many consuming projects ever filled the
  template in. In this repository the answer is zero — `rules/investigator-capture-layout.md`
  has never existed here, checked with `git log --all --diff-filter=A`.

Making this call unilaterally inside a release-prep step would have been the wrong shape:
it changes an emission set the growth bound guards, one step after that bound was armed.

### 2. The upgrade note — judged necessary, and written

**Judgement: yes, the release owes one.** The test applied was not "is this a major bump"
but "did the release delete something a consuming project **configured on disk**", because
only that leaves residue an upgrade cannot clean up. Six things pass that test: the Plane
bridge's three workbench files, a `**Domain:** strategic|knowledge` line, the retired
`tasklist.md`, the orphaned capture-layout rule, a `stashes/` directory, and five slash
commands in a user's muscle memory.

Written as `docs/upgrading-to-v9.md`, pointed at from `README.md` `## Install` and from
`/fusion:help`'s update topic. It is the first per-release note this repository has ever
shipped; there is no changelog convention here, and `docs/` is the home CLAUDE.md defines
for standalone reading that a skill points at.

**Four claims in it were measured rather than assumed, and two came back the opposite of
what the step's framing suggested:**

- **A leftover `churn` block in a project's `fusion-guard.json` is a non-issue.** The
  template never carried one — checked with `git log -p --all -- templates/fusion-guard.json`,
  where every `churn` hit is prose in the `_gitTracked` note, never a key. Churn lived in
  the plugin's `hooks/config.json`. So unless a project hand-wrote the block there is
  nothing to delete, and a hand-written one is carried through untouched and reported
  nowhere, because `churn` was removed outright rather than retired (`hooks/lib/config.ts`
  `RETIRED_CONTAINER_LEAVES` holds `guard.protectedPaths` alone).
- **The leftover Plane files raise no alarm and never did.** They were classified
  `unclassified` by `bin/fusion-staging-drift` before the removal too — step 2 only edited
  the doc-comment that named them as the worked case. Nothing regressed for a project
  holding them.
- **A stale `**Domain:** strategic` is silent, not an error.** `agents/taskplanner.md:38`
  and its two siblings fall back to `code` on an unrecognised value with no diagnostic. The
  note says so plainly and gives the grep, because a silent fallback is the failure a user
  cannot see.
- **Three of the "removed" slash commands were demoted, not deleted.** `archive`,
  `log-activity` and `curate` still have their skill directories, so their commands still
  resolve; only their presentation went. The first draft of the note said all eight were
  gone and would have told users to stop typing commands that work. Five were actually
  deleted.

## Two edits the gates could not have demanded, both named per the standing rule

- **`CLAUDE.md`'s `docs/` Layout row** now names `upgrading-to-v9.md`. That row writes bare
  filenames, so no lint reads it — it is narrative and would ordinarily be the curator's at
  gate G1, which has already passed. Adding a file to `docs/` without it makes the row's
  "Currently:" list false where nothing can see it, so the edit landed here.
- **`skills/help/SKILL.md`** gained two paragraphs, 897 bytes, which moved the `skills`
  surface total from 220 439 to 221 336 bytes. `hooks/lib/__tests__/fixtures/surface-growth.golden`
  was regenerated with `UPDATE_SURFACE_GOLDEN=1`; the baseline did **not** move, so the
  growth is recorded and not absolved. 897 bytes against 20 000 of head-room.

## The growth cap and the two lints, working

Two of the three edits above were caught by a gate rather than by review, which is worth
recording since step 13 armed the cap two commits ago:

1. `reference-resolution-lint` failed on `rules/analyst-capture-layout.md` inside the
   note's YAML example — a path in the **consuming** project spelled the way the manifest's
   own documentation spells its examples. Fixed to `./rules/…`, the spelling the lint's
   failure message names.
2. `surface-growth-bound` failed on the help-skill edit until the golden was regenerated.
   Correct behaviour: the instrument makes a byte increase visible and requires an explicit
   act to record it.
3. One thing the note **could not** say because a gate forbids it: the phantom-skill check
   in `derivable-enumerations-lint` scans every `docs/*.md` for `/fusion:<name>` tokens and
   fails on any that no skill directory backs. An upgrade note naming removed commands is
   exactly the legitimate exception it cannot distinguish, so the five deleted commands are
   written as bare names (`unlock`, `circle-stash`, …) rather than in slash form. The gate
   is right in general and the workaround costs nothing; noted so a later reader does not
   "fix" the formatting and turn the suite red.

## Plan bookkeeping

- Step 15 marked `[DONE]`.
- **Step 14 was also marked `[DONE]`**, by this step rather than its own executor. It
  landed as `9cde86c` and the plan still carried no marker for it. This is the second
  occurrence in this Circle — `260815-0804_*_three-plan-steps-have-landed-…` recorded
  the same defect for steps 1–3 and was closed by adding the markers, which fixed the
  instances and not the class. The recurrence is filed as
  `260815-1848_*_step-14-landed-without-its-done-marker-…`.
- **The plan's `**Status:**` and filename marker were left alone.** With 14 and 15 marked,
  every step is `[DONE]`, and `rules/fusion-workbench-conventions.md` `## Inline State Tracking`
  says that is when `**Status:** Complete` and the `_o_`→`_c_` rename happen. Two reasons
  to leave it: the plan's `## Open Questions` still carries one unanswered `[ ]` entry, and
  the rename belongs with Circle closure at Phase 4, where that entry is disposed of
  anyway. Named here so the orchestrator can override rather than inherit a silent choice.

## What a human still has to do

1. Review the working tree and commit it.
2. `git -C /Users/k1/Projects/productive/F03-CLAUDE-plugin-marketplace/claude-plugins pull --rebase origin main`.
3. In that clone's `.claude-plugin/marketplace.json`: set the fusion `version` to `9.0.0`,
   rewrite the stale `description` (five false claims, listed above), and drop the
   `churn-detection` keyword.
4. Push both repositories.
5. Tag: `git tag -a v9.0.0 -m "fusion v9.0.0" && git push origin v9.0.0`. Without it the
   `FUSION_REF=tags/v9.0.0` example now in `install.sh` and `README.md` names a tag that
   does not exist.
6. Optional, for the local marketplace path only: the cache clone at
   `~/.claude/plugins/marketplaces/tenzoki-plugins` **does not exist on this machine**, so
   `/plugin install` cannot see the release locally at all. This is the same state v6.0.0
   shipped in. `install.sh` reads the GitHub tarball and is unaffected.
