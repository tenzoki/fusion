# Reconciliation — session 260818-2301, final pass

**Date:** 2026-08-19
**Agent:** reconciler
**Domain:** code
**Range:** `52b1d95..83488e9` (5 commits)
**HEAD verified against:** `83488e9`
**Active Circle:** none — every store resolved to `shared/`
**Status:** Complete

## Verdict

Every marker in the workbench is correct at HEAD. The four decision records the session moved to
implemented are implemented, the thirteen defects it closed are fixed, and the record it renamed by
accident stands reverted with its body untouched. What is not right is the **prose** of some closure
notes: four of the thirteen `Resolved:` notes state a guarantee wider than their edit delivered. The
Turn-2 review found three of them and named the pattern as the Turn's dominant one; this pass re-did
the check on the other ten and found a fourth, on the closure with the widest reach.

## What was verified, and how

Nothing below was taken from a header or a history file. Each line names what was run.

| Claim | Verified by | Result |
|---|---|---|
| `rules/workbench-tracking.md` exists, provenance cites both records | `ls`, `head -12` | holds — 5 382 bytes, `:3` cites `260816-0711` and `260816-1707` |
| It is emitted to no agent | `grep -n 'workbench-tracking' bin/fusion-rules` | holds — empty; the five unindented `emit_if_exists` lines at `:384-388` are unchanged |
| Pointer left in the conventions file | `grep -n` | holds — `rules/fusion-workbench-conventions.md:15` (header table) and `:75` |
| The archive skill reads it | read `skills/archive/SKILL.md:33-45`, `:160` | holds — Step 1 `cat`s it, `## Process` step 1 names both halves |
| Always-on floor 101 393 → 97 977 | `git show <rev>:<file> \| wc -c` over the five unindented files plus `stilwerk/chat-voice-de.yaml`, at `52b1d95` and `b200902` | holds to the byte |
| Turn-2 floor 98 796 → 98 733 | same, at `5ec26b2` and `83488e9` | holds to the byte |
| `## Where this Circle stops` in the plan output format | read `agents/planner.md:131`, `:160` | holds, with the enforcement-honesty paragraph |
| Phase 4 step 2b, before the closure rename | read `agents/orchestrator.md:865-871`, `:924` | holds; reason string fixed at `Circle stop conditions`, `gate_response` per clause |
| `**Status:**` out of both templates | `grep -n '\*\*Status:\*\*' rules/fusion-workbench-conventions.md rules/decision-record-examples.md` | holds — no template hit remains |
| Suite green | `cd hooks && npx vitest run` | 36 files, 672 tests, exit 0 |
| Committed `dist/` is the compilation of the committed source | `npm run build`, then `git status --short -- hooks/dist` | empty — faithful build |
| Review coverage over the range | `bin/fusion-review-coverage --since 52b1d95` | `commits=5 reviews=2 uncovered=0 verdict=covered carried=none` |
| The bystander record was reverted | `git log --follow`, `git diff --stat 52b1d95..HEAD`, `git status` | untouched in the range and clean in the worktree; stands at `_a_` |

## The four decision records moved to implemented

All four hold and keep the `_i_` marker. Each carries a reconciliation note in its own body.

| Record | Footer accuracy |
|---|---|
| `260816-1707_i_to-whom-is-the-new-workbench-tracking-rule-emitted…` | Accurate in every clause. The mid-session correction is honest: the earlier figures were the `[analyst]` dispatch block, the corrected 101 393 → 97 977 is the floor as `CLAUDE.md` defines it, and it reproduces exactly. The commit message of `b200902` keeps the wrong wording and says so, which is right — a commit message is history. |
| `260816-0711_i_where-does-the-tracked-workbench-split-live…` | Accurate except one word. The footer says the subsection moved out **verbatim**; its lede was rewritten in the same change, replacing a four-name exclusion list with a phrase the cited tree does not use for half of it. The two record-versus-live-state bullets did move unchanged and nothing normative was lost. Already carried as `shared/issues/260819-0826_o_*`. |
| `260817-1613_i_does-a-plan-stated-precondition-get-any-mechanism…` | Accurate. One residue is filed and open: the section was made mandatory for plans with no Circle active, whose only stated reader is a Phase 4 that runs solely on a Circle closure (`shared/issues/260819-0828_o_*`). |
| `260818-2212_i_should-the-decision-records-status-field-exist-at-all…` | Accurate for what it claims. Two surfaces the closure did not reach are filed and open (`260819-0821_o_*`, `260819-0028_o_*`). The record itself still carries `**Status:** open` and the unfilled footer stub, both correctly left — it is a member of the population its own answer says not to hand-correct. |

## The thirteen closures, re-checked

Twelve of the thirteen were re-checked against disk rather than read. Nine hold as written. Three
were already found overstated by the Turn-2 review and are filed (`260819-0821`, `260819-0824`,
`260819-0827`); the `260819-0041_c_*` closure already carries its `Revised by:` line. **One more was
found in this pass.**

### New finding — `260811-2146_c_*` was closed on one of its two halves

The record's title states two defects and its body gives the second one a heading of its own:
`## The second half: the template stub is left standing beside its own answer`. The `Resolved:` note
addresses only the first, the `**Status:**` head field, and does not mention the second.

Removing `**Status:**` does nothing to the second. At HEAD, `rules/fusion-workbench-conventions.md`
`## Decision Record Template` still prescribes the unfilled placeholder block, now five lines rather
than the four the record quoted, `Retired:` having been added since. Three live decision records
still carry it verbatim, measured by grepping `^Answered: <set when status moves to _a_>` across
`shared/decisions/` and `circles/*/decisions/`:

- `shared/decisions/260818-0814_i_what-covers-the-plugin-repo-shaped-exempt-surface-record…md`
- `shared/decisions/260818-1512_a_does-the-shapers-third-mode-keep-the-name-portfolio-activation…md`
- `shared/decisions/260818-2212_i_should-the-decision-records-status-field-exist-at-all…md`

The third is the decision record that authorised the closure: it carries the stub at `:146-150`
while its real `Answered:` and `Implemented:` annotations sit at `:167` and `:170`. Twelve became
three because the population moved, not because the mechanism did.

Filed as `shared/issues/260819-0836_o_*`; a `Revised by:` line was appended to the closed record and
the marker left at `_c_`, per `## Inline State Tracking`.

**Why this one matters more than the other three.** M1, L1 and L2 each overstate the reach of an edit
that was itself correct. This one closes a record whose *second stated defect* was never worked, and
the mechanism that produces it is still shipped in an always-on rule file. A later reader grepping
for the stub problem finds a closed record and stops.

## The open store, measured

Counts below were taken with `ls` over the markers, not read from the session record.

| Store | Measured at HEAD + this pass |
|---|---|
| `shared/issues/` open (`_o_`) | **98** |
| `shared/issues/` closed (`_c_`) | **127** |
| `shared/issues/` total | 225 |
| Open issues whose body names `coderev` or `ontorev` | 50 |
| `shared/decisions/` | 0 open, 21 answered, 28 implemented, 2 deferred, 1 superseded — **52** |
| Decisions workbench-wide | 3 open, 22 answered, 65 implemented, 3 deferred, 2 superseded — **95** |
| `shared/planning/` | 4 files, all `_c_`; no plan was written for this session (mode `custom`) |

The arithmetic closes exactly. The session opened at 87 open defects. It filed 22 (twelve in
`5ec26b2`, `260818-2343` filed and closed inside `b200902`, `260819-0756` in `83488e9`, eight
uncommitted from the Turn-2 review) and closed 13, and this pass filed 2 more:
87 + 22 − 13 + 2 = 98.

All three remaining open decision records live in closed Circles and are outside this Directive's
reach. `shared/decisions/` holds no open record for the first time in this sequence of sessions — the
three the session opened with are the three it realised.

## Decisions checked and deliberately not moved

- `260810-2145_a_should-a-repeated-skill-body-snippet-become-a-bin-helper…` stays `_a_` although its
  first half is implemented. Its own footer says why, at length: it bundles two questions, the second
  is held in reserve by the answer itself, and `_i_` is terminal. This is correct and is not a
  reconciliation gap.
- `260816-1707_a_which-install-path-is-the-authoritative-one-for-end-users.md` stands at `_a_`. It is
  the record a glob renamed by accident during Turn 1. `git log --follow` shows no commit in the
  range touching it, `git diff --stat 52b1d95..HEAD` over it is empty, and the worktree is clean for
  the whole decisions store. The revert was complete and the body is untouched.
- The 21 answered records in `shared/` were read by name against the five commits in the range. None
  is realised by them.

## Also filed

`shared/issues/260819-0837_o_an-untracked-zero-byte-test-txt-sits-at-the-repository-root…` — a
0-byte `Test.txt` at the repository root, written one minute after `06ab15b`, referenced by nothing,
and not covered by any ignore rule. The Turn-2 review saw it and recorded it under "filed nowhere",
which is the one place the filing rule names as not a filing home. Fix is `rm`. The review's second
working-tree observation, a detached worktree under another session's scratchpad, belongs to that
session and was correctly left alone.

## Tracking files updated

- `shared/decisions/` — reconciliation notes appended to the four `_i_` records. No marker moved.
- `shared/issues/260811-2146_c_*` — `Revised by:` line appended. Marker stays `_c_`.
- `shared/issues/260819-0836_o_*`, `shared/issues/260819-0837_o_*` — filed.
- `shared/reviews/260819-0044-coderev-turn-1-*` and `shared/reviews/260819-0832-coderev-turn-2-*` —
  confirmation notes appended. No finding rewritten.
- `shared/history/260818-2301-orchestrator-session.md` — `## Coherence` section appended.

## Two things left for the orchestrator

1. **The session history file's head is still unwritten.** `**Directive:**` reads
   "(not yet stated — Setup ran ahead of the user's task)" and `**Status:**` reads "In progress",
   while `agentstate.yaml` has carried the Directive since Setup. Both are Phase-4 fields and are
   outside this agent's write scope, which for that file is the `## Coherence` section alone.
2. **Nothing is committed by this pass.** Ten workbench files are modified or new and are the
   orchestrator's to stage.
