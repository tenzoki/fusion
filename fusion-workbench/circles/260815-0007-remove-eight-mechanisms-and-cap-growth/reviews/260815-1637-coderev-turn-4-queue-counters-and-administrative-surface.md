# Code review — Turn 4: the persisted queue, the session counters, the administrative surface

**Sender:** coderev
**Reviewed-range:** `518926d..1e29572`
**Not-opened:** `hooks/lib/state-drift.ts`, `hooks/state-drift.ts`, `bin/fusion-state-drift`, `settings.json`, `skills/unlock/SKILL.md`, `skills/revise-claude-md/SKILL.md`, `hooks/lib/__tests__/queue-ground-producer.test.ts`, `hooks/lib/__tests__/queue-ground-lint.test.ts`, `hooks/lib/__tests__/queue-commit-ownership-lint.test.ts`, `hooks/lib/__tests__/queue-retirement-empty-key.test.ts`, `hooks/lib/__tests__/state-drift.test.ts`, `hooks/lib/__tests__/state-drift-detection-lint.test.ts`, `hooks/lib/__tests__/fixtures/rules-emission.golden`, `hooks/dist/`
**Date:** 2026-08-15
**Circle:** `260815-0007-remove-eight-mechanisms-and-cap-growth`
**Steps:** P-10, P-11, P-12

**On the not-opened list.** The first twelve are files this range *deletes*; their diffs were read as deletions and their bodies were not opened at the parent commit. `rules-emission.golden` and everything under `hooks/dist/` are generated and were verified indirectly instead — the suite is green and `git status` was clean after the build ran. Every live source file the range touches was opened.

---

## The range, and why it is spelled this way

The dispatch named four uncovered commits: `9955e8f`, `dd312eb`, `f45f76a`, `1e29572`. A git range
excludes its start commit, so covering all four means anchoring one commit earlier:
`git rev-parse --short 9955e8f^` is `518926d`, and `git log --oneline 518926d..1e29572` returns
exactly those four and nothing else. That is the range above. It was derived from the hashes, not
from a Turn boundary.

## Summary

The three steps are clean work. The suite is green at HEAD (39 files, 739 tests, measured), the
growth bound held across all three without `RULE_BASELINE` being touched, `hooks/dist/` is in sync
with its sources, and the reference sweeps are unusually thorough — I could not find a dangling
path-shaped citation anywhere in the shipped tree, and `CLAUDE.md` is accurate on every claim these
three steps could have falsified. **Nothing here should block the user's gate.**

Twelve defects, none critical. The one worth reading first is a shell bug: the four-line block that
replaced the deleted drift check reports `turns=0` *and* `unavailable` on one path and an empty
`commits=` on another, in both resume paths, breaking the exact rule written directly beneath it.
The rest are documentation and vocabulary residuals of the kind these steps' own file lists could not
reach.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 8 |
| Low | 3 |

All twelve are filed as separate records under this Circle's `issues/` store, stamped `260815-1631`,
`-1633` and `-1635`.

---

## Findings by theme

### A. The replacement measurement (P-11)

**A1 — the resume shell prints a two-line figure and an empty one. High.**
`agents/orchestrator.md:88-92` and `skills/setup/SKILL.md:248-251` carry the same four lines.
`grep -c` prints `0` *and* exits 1 when it matches nothing, so the `|| echo unavailable` also fires
and the output is two lines: `turns=0` then `unavailable`. That is the state of every session
interrupted before its first `turn_start`. Separately, `[ -n "$A" ]` tests that the anchor was
*read*, not that it resolves, so an unresolvable hash yields a bare `commits=`. Both violate the
sentence one line below — "A figure that could not be taken is reported as `unavailable`, never as
`0`" — and both were verified in a scratch repository, not reasoned about. Record:
`260815-1631_*_the-resume-shell-that-replaced-the-drift-check-prints-a-two-line-figure-and-an-empty-one.md`.

**A2 — Setup's resume summary asks for rows nothing produces. Medium.**
`skills/setup/SKILL.md:260` still mandates "**Every diverging row from step 2**, each naming the
surface, what it says, and the record that contradicts it". Sub-step 2 now emits two `KEY=value`
lines and no rows; the surfaces it compared are gone. The orchestrator's equivalent bullet *was*
removed (`agents/orchestrator.md:95-100`), so the two resume paths now disagree about what the
summary contains. Record: `260815-1631_*_setups-resume-summary-still-asks-for-diverging-rows-that-no-step-produces.md`.

**A3 — `hooks/turn-budget.ts:14-18` still says the orchestrator carries the budget in
`agentstate.yaml`. Low.** P-11 removed `progress.max_turns` and corrected `CLAUDE.md:38` and the
near-verbatim copy of the same clause in `hooks/lib/__tests__/turn-budget-lint.test.ts`. The module
the test is about kept the old sentence. One phrase, two files, one copy fixed — inside a single
commit. Record: `260815-1635_*_turn-budget-ts-header-still-says-the-orchestrator-carries-the-budget-in-agentstate-yaml.md`.

### B. The event vocabulary (P-10, half-repaired by P-11)

**B1 — `queue_empty` left and was not restored with `queue_built`. Medium.**
P-10 deleted both event table rows and both emissions. P-11 restored `queue_built`, calling its
removal "the orchestrator's error" and arguing that the event log "is now the sole durable record of
a session's shape". That argument covers `queue_empty` exactly: it records the one shape in which
Phase 2 never runs. At HEAD the token appears nowhere in `agents/`, `skills/`, `bin/`, `hooks/`,
`rules/`, `docs/` or the READMEs, so a session that ends on "no routable tasks" is indistinguishable
in its log from one that died in Phase 1. Neither event was in step 10's plan text. Record:
`260815-1633_*_queue-empty-left-the-event-vocabulary-in-p-10-and-only-queue-built-was-restored.md`.

### C. The cleanup pipeline's new gate (P-12)

Three findings, all in one file, and together they answer the dispatch's question about whether
anything else still promises an unattended run. **Yes — one thing does.**

**C1 — the closing note still says "run it end to end". Medium.**
`skills/cleanup/SKILL.md:252`: "Run it end to end; report once at the end, not after every step
(unless a guardrail trips)." The rewritten `## Autonomy and safety` at `:57` explicitly separates
the gate from the guardrails ("Three hard guardrails hold on every run, gate or no gate"), and the
three it then lists are force-push, `git add -A` and secrets. So the parenthetical does not cover
the gate and the bullet reads as an instruction to pass through Step 5. The rewrite reached the
section it was about and not the eleven-lines-later restatement. Record:
`260815-1631_*_cleanups-notes-still-tell-the-assistant-to-run-it-end-to-end-after-the-gate-landed.md`.

**C2 — `--dry-run` promises "no writes, no dispatch" and Step 5 does both. Medium.**
`:38` and `:95` both state it as a blanket rule. `:188` has Step 5 dispatch the curator's survey
under `--dry-run`, and `agents/curator.md:174` says that pass writes the run file "on **every** run"
and may also create a decision record and a defect record. Step 3 at `:170` shows the rule genuinely
held before this step ("If `--dry-run`, skip the dispatch"), so this is a new, silent exception in
the flag a user reaches for precisely to avoid writes. Record:
`260815-1631_*_cleanup-dry-run-promises-no-writes-and-no-dispatch-and-step-5-does-both.md`.

**C3 — Step 8 still tells the user to run `/fusion:curate` for a pass Step 5 just performed.
Medium.** P-12 deleted the paragraph that justified naming the command and left the naming at
`:243`. On a full run the consolidation has already happened by the time that line is computed.
Record: `260815-1633_*_cleanup-step-8-tells-the-user-to-run-fusion-curate-for-a-pass-step-5-of-the-same-run-performs.md`.

**C4 — two report bullets under one label. Low.** `:218` and `:220` are both "Normative surfaces:",
for the applied entries and for the read-only staleness measurement. `rules/user-facing-output.md`
`## Vocabulary` forbids the inverse (many names for one thing); one name for two things in adjacent
bullets is the same defect from the other side. Record:
`260815-1635_*_cleanups-step-8-report-carries-two-different-bullets-under-one-label.md`.

### D. The administrative collapse is presentational, and the presentation is not uniform (P-12)

**The central claim is correct and I verified it.** `skills/archive/`, `skills/log-activity/` and
`skills/curate/` all exist with `description:` frontmatter, so all three remain typeable as
`/fusion:<name>`; only `skills/unlock/` and `skills/revise-claude-md/` are gone. `CLAUDE.md:21` and
`:51` say exactly that, in so many words, rather than claiming a collapse that did not happen. That
was the right call and it is well written.

**D1 — eight shipped surfaces still present the three demoted names as the user's route. Medium.**
`agents/orchestrator.md:1289`, `agents/curator.md:3`/`:57`/`:344`, `agents/playmaker.md:61`,
`skills/cadence/SKILL.md:255`, `rules/fusion-workbench-conventions.md:47`/`:79`,
`docs/philosophy.md:15`, `README.md:150`. None is false — that is why no lint sees them — but
`agents/orchestrator.md:1289` ("the ordinary surface for it is `/fusion:curate`") directly
contradicts `README-agents.md:246`, which P-12 rewrote to make `--only claude-md` the surface. Both
ship, both are read by the orchestrator. `agents/orchestrator.md` was in the file lists for steps 10
and 11 and not for 12. Record:
`260815-1633_*_eight-shipped-surfaces-still-present-the-three-demoted-skill-names-as-user-commands.md`.

**D2 — the one selector that differs from its skill name is the one nowhere spelled beside it.
Medium.** `archive` and `log-activity` spell `--only <name>` in their own descriptions and their
names match. `curate`'s selector is `claude-md` and its description gives no selector.
`CLAUDE.md:21` calls all three "reachable alone as `/fusion:cleanup --only <step>`" without the
substitution, so a reader who does what works for the other two types `--only curate`, which
`skills/cleanup/SKILL.md:53` requires be rejected as an error. Record:
`260815-1633_*_the-claude-md-steps-only-selector-is-claude-md-and-the-documents-that-say-reachable-alone-never-spell-it.md`.

### E. Permission seeding (P-12)

**E1 — Setup Step 0g silently replaces an existing `defaultMode`. Medium.**
`skills/setup/SKILL.md:225` unconditionally sets `permissions.defaultMode` to `"bypassPermissions"`.
The "only add, never remove" guarantee beside it attaches to the `allow` list; `defaultMode` is a
scalar that is set. The skip condition at `:235` covers only a project already at
`bypassPermissions`, so a project that deliberately chose `acceptEdits` or `plan` is asked a question
that describes writing a file, not replacing a setting, and the report at `:231` does not name the
old value. Every other instruction in this step is explicitly protective — "never overwrite one",
"**Never** write this file outside `pwd`" — and the scalar is the one thing that escapes that care.
Record: `260815-1633_*_setup-step-0g-silently-replaces-a-project-s-existing-defaultmode.md`.

### F. Packaging

**F1 — `.gitignore:38` still carries `!bin/fusion-churn-rank`. Low.**
P-11's commit says it swept this file for ship-exceptions naming deleted helpers and removed two,
its own and step 2's. It missed step 4's. Measured:

```
$ diff <(grep -o '^!bin/.*' .gitignore | sed 's|^!bin/||' | sort) <(ls bin/ | sort)
1d0
< fusion-churn-rank
```

Inert in effect — an exception for a file that does not exist changes nothing — but this is the one
packaging file that decides whether a helper ships, its own header says nothing checks the list, and
step 13 may add a helper to it. Record:
`260815-1635_*_the-gitignore-sweep-that-removed-two-dangling-ship-exceptions-missed-the-third.md`.

---

## What I checked and found correct

Stated because a review that lists only faults misrepresents a Turn this careful.

- **`hooks/lib/state-file.ts` — all three traps cleared.** It is under `hooks/lib/`, inside
  `tsconfig.json` `include`, and compiled to `hooks/dist/lib/state-file.{js,d.ts}`. It has its row in
  `README-hooks.md:183`, which `derivable-enumerations-lint` holds in exact set equality both ways.
  Both importers point at it — `hooks/lib/staging-drift.ts:129` and `hooks/lib/review-coverage.ts:111`
  — and no third copy of the pair exists.
- **The `control:` rename is complete and its three survivors all have live subjects.**
  `turn_start_head` is written at Turn start and read by Step 3c and 3c-bis; `paused_at_task` by the
  Rebalance Revise-Grounding sub-flow; `directive_revisions_this_session` by the once-per-session cap.
  The derivation table at `agents/orchestrator.md:1013-1018` names, per removed field, the record it
  is now read from, and all four sources are un-freezable.
- **Both resume paths report an untakeable figure as `unavailable` rather than `0`** — as an
  instruction. The shell under the instruction is where A1 lives; the instruction itself is right in
  both files.
- **`RULE_BASELINE` was not touched across the whole range** (`git diff 518926d..1e29572 --
  hooks/lib/__tests__/rules-emission-golden.test.ts` is empty). The golden moved three times, which
  is the documented behaviour — regenerating it pins per-file sizes and never clears the bound. The
  core-only role now measures 86 897 bytes against a floor of 86 573 and a 12 000 budget: green with
  the head-room untouched, exactly as the plan required of a Circle whose every rule edit is a
  deletion.
- **`hooks/dist/` is in sync.** `npm test` runs the build; `git status` was clean afterwards, and a
  scripted orphan check found no `dist/` entry without a `.ts` source and no `.ts` source without a
  `dist/` entry.
- **The reference sweeps hold.** `TASKLIST`, `tasklist`, `state-drift`, `fusion-state-drift`,
  `revise-claude-md`, `skills/unlock` and `settings.json` return nothing dangling across `agents/`,
  `skills/`, `rules/`, `bin/`, `docs/`, the READMEs, `CLAUDE.md`, `install.sh` and `templates/`.
  Surviving mentions are all explicitly historical and annotated as such.
- **`CLAUDE.md` is accurate on everything these three steps could have falsified.** The
  `bin/fusion-state-drift` row is gone, the `bin/fusion-turn-budget` row was rewritten to say the
  field no longer exists, the `bin/fusion-review-coverage` row's "the anchor already recorded for the
  drift check" became "an anchor rather than a tally", the installer bullet dropped `settings.json`
  in step with `install.sh`, and the concurrency bullet lost its `tasklist.md`. I found no false
  statement.
- **The two re-pointed suites are not vacuous.** `guard-state-shape.test.ts` and
  `hook-fail-open.test.ts` both assert `COVERAGE_SENTENCE_MARKERS` positively, the harness names the
  payload path centrally so a wrong one cannot pass silently, and
  `openCoverageWindowWithNoGap` exists specifically so the throttle-load case reaches the load rather
  than returning on the `why` branch before it. The reason staging drift cannot serve as the probe —
  its throttle holds the HEAD its own trigger compares against, so seeding it malformed disarms the
  trigger — is structural and correct.
- **`bin/monitor` keeping its three `state_drift` sites is right**, and the deviation from step 11's
  file list is argued rather than silent: the monitor reads an append-only log that still holds real
  rows, and a renderer styles for data that exists.

## The closed permission defect (`260810-0326_*_…`)

Asked for a judgement, so: **closing it was defensible, and the closure states as fact one thing it
did not measure.**

Defensible, because the third criterion as written — a fresh project completing an orchestrator Turn
without a dialog after only running Setup — genuinely cannot be met by any Setup-time seeding.
Claude Code reads permission settings at startup, so a file written mid-run does not govern that run.
That is a property of the harness, not a shortfall of the fix, and a criterion no mechanism can reach
should not hold a record open forever. The footer states all three verdicts separately instead of
claiming three of three, and the residual is filed rather than buried
(`260815-1617_*_re-measure-whether-a-fresh-project-still-raises-approval-dialogs-before-setup-keeps-asking.md`).
That is the honest shape.

The thin part: the record's own body sets a standard the closure does not meet. It says "Enforcement
was confirmed live before anything was concluded from a *missing* denial", and every verdict in it is
tied to a probe. The closure's claim that the criterion "holds from the next session onward" is an
inference from documented behaviour, not a measured one — nobody ran Setup in a scratch project and
started a second session. It is very likely right. It is not the same kind of statement as the rest
of the record, and one sentence saying so would have cost nothing.

One item in the record's body is not addressed by the closure and is not in the residual either: the
observation that under `--agent fusion:orchestrator`, three `Bash` calls were denied that ran fine
under the default agent, with the note that "an agent with an explicit `tools:` allowlist appears to
lose the sandbox path that makes read-only shell calls permission-free". `bypassPermissions` plausibly
covers it, but that is an inference and the orchestrator is the one agent with such a list. Worth
folding into the re-measurement issue rather than filing separately.

## Cross-cutting observations

1. **Two of the twelve are the two-copies-drift pattern arriving inside a single commit.** A1 is the
   same four-line shell in two prompts with no shared owner; A3 is the same sentence in a module and
   its lint, with the lint's copy fixed and the module's not. This project created
   `bin/fusion-source-root` to end exactly this class (decision `260810-2145_*_should-a-repeated-skill-body-snippet-become-a-bin-helper-now-that-one-fact-lives-in-four-executable-copies.md`), and both instances
   were introduced by careful commits that swept broadly elsewhere.

2. **Every finding is in the class the plan's `**Decidability:**` head already declared unreachable.**
   Not one is a dangling path-shaped citation in shipped text — the linted class is clean across all
   four commits. All twelve are bare names, prose claims, shell semantics, a scalar merge, or a file
   the reference lint does not scan. The head narrowed the claim honestly and the Turn's residue lands
   precisely where it said it would.

3. **The gap that produced most of them is the same one three times: a step's file list is the sweep.**
   `agents/orchestrator.md` was not in step 12's list and holds D1's contradiction.
   `hooks/turn-budget.ts` was not in step 11's list and holds A3. `.gitignore` is in no list and holds
   F1. Each was found by grepping for a token rather than by opening a listed file.

## Recommended sequencing

**Release blockers: none.** Nothing in this range prevents the gate, and nothing prevents step 13.

**Before step 13** (which arms a failing bound and wants a settled tree): A1, the resume shell.
It is a correctness bug in the mechanism that replaced a deleted measurement, it is duplicated, and
it is four lines.

**Fold into the curator's gate at G1** rather than fixing by hand: D1's prose sweep — the eight
surfaces are exactly the drift the curator's pass is for, and one of the eight
(`rules/fusion-workbench-conventions.md`) is one of its three surfaces. `agents/orchestrator.md:1289`
is the exception: it is a contradiction against a document P-12 edited, not narrative drift, and
should be fixed directly.

**Ordinary cleanup, any time before the release:** B1, C1–C4, D2, E1, A2, A3, F1.

## Explicitly: does anything block the user's gate?

**No.** The gate is the curator's `CLAUDE.md` pass, and what that pass meets is a `CLAUDE.md` these
three steps left accurate. I checked every claim in it that P-10, P-11 or P-12 could have falsified —
the two deleted `bin/` rows, the turn-budget row, the review-coverage row, the installer bullet, the
skill listing, the layout row, the concurrency bullet — and found none false. The step that carried
the most risk here, P-12, went further than the plan asked and wrote the presentational nature of the
collapse into `CLAUDE.md` rather than leaving a later reader to discover it.

Twelve defects are filed. None of them is in `CLAUDE.md`, none is a correctness fault in shipped
code, and the one High finding is in a shell block the curator's pass does not touch. Proceed.

---

## Reconciliation annotation — 260815-1913, reconciler, HEAD `9306f0a`

Confirmed against the tree, not against the markers on the records.

**A1 (High) — the resume shell.** Repaired by `5f2171e`, record
`260815-1631_*_the-resume-shell-that-replaced-the-drift-check-prints-a-two-line-figure-and-an-empty-one.md`.
Verified: `agents/orchestrator.md:93` reads `echo "turns=${T:-unavailable}"`, each figure is captured
into a variable and reported on its own emptiness rather than on the exit code of the command that
took it, and `:96` states the reason in prose. Both copies carry the repaired form. The residual the
repair named — that the two copies are independent with nothing holding them identical — was put to
the user at gate G1 and answered "accept two copies", recorded on
`260815-1712_*_the-resume-shell-is-two-independent-copies-and-nothing-holds-them-identical.md`.

**D1 (Medium) — the eight surfaces presenting demoted names.** Two of the nine rows are discharged by
`e8052e7`, the curator's approved pass; seven stand, and two line numbers have drifted. The row this
review singled out as more than presentational, `agents/orchestrator.md:1289`, is untouched at
`:1292` and still contradicts `README-agents.md:246`. Per-row evidence is appended to
`260815-1633_*_eight-shipped-surfaces-still-present-the-three-demoted-skill-names-as-user-commands.md`.

**F1 (Low) — `.gitignore`'s `!bin/fusion-churn-rank`.** Swept in `5f2171e`. Verified by set
comparison rather than by reading the diff: the twelve `!bin/` exceptions and the twelve entries of
`bin/` are identical. Both records closed —
`260815-0803_*_gitignore-still-carries-the-ship-exception-for-the-deleted-bin-fusion-plane.md`
and `260815-1206_*_three-churn-references-survive-step-4-in-files-the-step-does-not-name.md`.

**A3, C1–C4, D2, E1, B1** — records still open at their filed markers, each re-checked as present in
the tree at HEAD. `hooks/turn-budget.ts`'s header still says the orchestrator carries the budget in
`agentstate.yaml` where `progress.max_turns` had a home (A3). Two test fixtures still build the
retired `progress:` block. `install.sh:83` still names a `LICENSE` the tree has never shipped.

**The review's own closing verdict held.** "Release blockers: none" — the gate was taken, step 13
armed, and the suite is green at 40 files / 751 tests as run by this pass.
