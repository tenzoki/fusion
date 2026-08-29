# Deleting the git branch policy, and taking skill files off the protected list

**Agent:** coder
**Date:** 2026-08-09
**Status:** Complete
**Task:** user-direct — delete the branch policy outright (Part A) and remove `skills/**` from
`guard.protectedPaths` (Part B). Not committed: left in the working tree by instruction.

**Governing decision:** `260809-2310_*_should-the-branch-policy-fall-the-way-the-write-classifier-fell.md`
— answered by the user with a fifth option that none of the four on the record carried: delete,
do not re-engineer.

---

## What went

Ten files, deleted whole, **8 690 lines**:

| File | Lines |
|---|---|
| `hooks/lib/__tests__/fixtures/git-verdicts-head.json` | 2 864 |
| `hooks/lib/__tests__/git-branch-guard.test.ts` | 1 467 |
| `hooks/lib/__tests__/fixtures/git-corpus-451a07e.json` | 1 409 |
| `hooks/lib/shell-parse.ts` | 786 |
| `hooks/lib/__tests__/shell-parse.test.ts` | 592 |
| `hooks/lib/git-branch-guard.ts` | 572 |
| `hooks/lib/__tests__/guard-bash-wiring.test.ts` | 439 |
| `hooks/lib/command-word.ts` | 378 |
| `hooks/lib/__tests__/helpers/git-corpus.ts` | 102 |
| `rules/git-branch-discipline.md` | 81 |

Across the whole source tree (`hooks/dist` and the workbench excluded), the change is
**257 insertions, 9 488 deletions** in 44 files — the difference between that and the table
above being the edits to the sites that referenced the policy. `hooks/dist` rebuilt to
136/2 287.

`guard.ts` lost its Bash inspection branch: `guardBashCommand`, the `checkoutResolver`, the
`CheckoutResolver` type, `effectiveCwd`, `forEvent`/`EVENT_DETAIL_MAX` (used by nothing else),
the `git_branch_switch` and `git_branch_switch_override` triggers, and the two env overrides
`FUSION_ALLOW_BRANCH_SWITCH` / `FUSION_ALLOW_WORKTREE`. `settings.json` lost its `deny` block
(the two rules were its only entries, so the key went with them).

**Bash is still wired to the hook, and must stay wired.** It is where the before-fingerprint of
the protected paths is taken; drop it from the PreToolUse matcher and a shell write to a
protected path has no `before` for `tracker.ts` to compare an `after` against. That is now the
stated reason in `hooks/lib/__tests__/hooks-wiring.test.ts`, which previously gave the branch
classifier as the reason Bash was there.

**The one survivor:** `isEnvFlagSet` (three lines) was imported by
`hooks/lib/rules-write-exemption.ts`, which is the half that stays. It moved into that file as a
module-local function rather than into a new module — one caller, three lines.

## Part B — skill files

`skills/**` removed from `hooks/config.json`, `hooks/config.example.json` and the shipped-list
assertion in `config.test.ts`, where it is now asserted as an ABSENCE so a re-add has to be
deliberate. Every other entry stands. In the test harness `skills/demo/SKILL.md` moved from the
protected seed group to the unprotected one; four cases that used it as "a protected path
outside the rule directories" were repointed at `.claude-plugin/plugin.json`, `agents/coder.md`
or `.claude/rules/local.md`.

This changes nothing in this repository — the measurement stands down here — and everything for
a consuming project.

## Verification

`npm test` from `hooks/`: **898 passed, 31 files.** It was 1 154; **256 tests went**, all of
them cases about the deleted policy. The split is measured, not inferred: the run taken
immediately after the ten file deletions and before any case-level edit reported 929 collected,
so **225 came from the three deleted suites** and **31 from cases removed by hand**:

- three suites deleted whole (`git-branch-guard`, `shell-parse`, `guard-bash-wiring`);
- `guard-escalation-shape`: the "denies on the Bash surface" block (6 cases) — the shell has no
  deny left to make fail open, so there is no coercion for it to survive;
- `guard-bash-integration`: the three-Bash-denials escalation block and the two "forms that used
  to slip past" blocks;
- `guard-halt-event`, `guard-rules-write-integration`, `hook-fail-open`: one to three
  branch-specific cases each.

The four behavioural acceptance claims were **measured through the shipped hooks** against a
throwaway consuming project (a real workbench marker, no plugin manifest, so nothing stands
down), one PreToolUse → mutate → PostToolUse cycle per row:

| Row | Result |
|---|---|
| shell write to `skills/x/SKILL.md` | not measured, not written back, no halt |
| shell write to `rules/x.md` | written back, halt raised |
| shell write to `.claude/rules/x.md` | written back, halt raised |
| `Edit rules/x.md` | denied, full protected-path sentence |
| `Edit skills/x/SKILL.md` | allowed (`{}`) |
| `Bash git switch main` | allowed (`{}`) |

The tracker's halt message was captured in full and still carries every clause: which path, that
it was restored, where the overwritten bytes are kept, that the window is not exclusively the
agent's, the halt, the Human Gate, and the `cd`-prefixed clearing command.

The claim that the measurement does not import the lexer was **checked, not trusted**: `dist/lib`
after a clean rebuild contains no `shell-parse`, `command-word` or `git-branch-guard`, and the
import graph of `tracker.js`, `guard.js`, `protected-snapshot.js` and `rules-write-exemption.js`
names none of them.

`claude plugin validate .` passes (one pre-existing warning about `CLAUDE.md` at the plugin
root). `.claude-plugin/plugin.json` bumped 6.1.0 → **7.0.0**: a user-visible policy is gone and
two env variables no longer do anything.

## Records

- `260809-2310` `_o_`→`_a_`. The answer is recorded as a fifth option, with the
  record's own recommendation (option 1, measure HEAD) left standing unedited above it.
- `260809-2300` `_o_`→`_c_`, by deletion rather than by a fix — the seventh
  entrance, which stayed open on purpose waiting for exactly this decision.
- `260809-1942` `_o_`→`_c_`. Its substance is closed: the rule's enumeration now
  matches the shipped list on both counts, the `.claude/rules/**` it was filed about and the
  `skills/**` this change removed.

## Left open, deliberately

`260809-2255` — the live `.guard-state/escalation.json` in this repository still
reads `haltActive: true, consecutiveBlocks: 24`, left by the deleted policy denying the agents'
own verification commands. The cause can no longer recur, and the halt is inert here (the write
guard stands down before the halt check is reached), but clearing it is a state change nobody
asked for and it is entangled with `260809-2049_*_clear-halt-discards-a-halt-raised-between-its-load-and-its-save-and-tells-the-human-it-cleared.md`, an open defect in `clear-halt` itself. The
user's call.
