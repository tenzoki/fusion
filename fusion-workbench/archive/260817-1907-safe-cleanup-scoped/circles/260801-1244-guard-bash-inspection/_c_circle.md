# The guard checks file-mutating shell commands against the protected paths

---
**Domain:** code
**Status:** closed
**Filed by:** shaper (anticipated-circle mode)
**Active spec/plan:** 260801-1253_*_plan-guard-bash-inspection.md (per-Circle plan; the spec covering all four Circles is `260801-1122_*_spec-normative-consolidation.md`)
**Active session history:** 260801-0936-orchestrator-session.md

---

## Directive

Every path in the guard's `protectedPaths` list means what it says for all sixteen agents, not only for the four write tools. A `Bash` call is classified for file mutation before it runs, and a mutation whose target matches the effective protected paths is denied with the offending command segment and the path named. Three classes of mutation are recognised: verbs that relocate or destroy a path (`mv`, `rm`, `cp`, `ln`, `install`), verbs that rewrite a file in place (`sed -i`, `perl -i`, `truncate`, `dd`, `tee`), and shell output redirection (`>`, `>>`, `>|`), which carries no verb and is the shortest route to an emptied rule file. A recognised mutating command whose operands cannot be resolved is denied too, because a recognised mutation with no resolvable operand is the ambiguity the guard exists to catch; ordinary unparseable shell work is not blocked, so agents have no reason to route around the guard. An unrecognised program that writes a protected path still writes it, and the guard's own documentation states that residual rather than claiming an enforcement it does not have. The bookkeeping settled by two earlier issues is unchanged: an allowed `Bash` call resets no counter and emits no event, and only a denial records a block. In the fusion plugin's own repository the new path check stands down alongside the rest of the write protection, while the git branch policy sitting above it stays active.

**Capabilities carried:** C5c. The spec holds the remit, the fail-closed bound, the self-detect interaction, and the ten acceptance criteria under `### C5: Guard changes` and its `*C5c — Bash inspection:*` criteria block. They are not restated here, so the spec stays the single source of detail.

## Grounding snapshot

The defect is verified and filed, not inferred. `260801-1156_*_bash-bypasses-the-protected-path-check-entirely.md` states the control flow: the guard reaches the protected-path check only from `Write`, `Edit`, `MultiEdit`, and `NotebookEdit`, while a `Bash` call is classified for git branch and worktree operations and then returns unconditionally (`hooks/guard.ts:265-268`), never reaching the check at `hooks/guard.ts:309`. `Edit rules/x.md` is blocked and `mv rules/x.md /tmp/` is allowed. This Circle closes that issue.

The scope is wider than the work that surfaced it. The bypass affects all sixteen agents today, and the sharpest case is `fusion-workbench/.guard-state/**`: an agent can delete its own escalation counter through a shell, which defeats the halt the counter exists to drive.

**Verification cannot happen in this repository, and that is the most likely way this Circle ships broken.** The write guard stands down in the fusion plugin's own source tree (`hooks/lib/self-detect.ts:18-33`, reached from `hooks/guard.ts:274-283`), so a shell mutation of `rules/` here is allowed by design and proves nothing about the new check. Every acceptance criterion that asserts a denial has to run against a consuming project or a fixture directory that is not the plugin repo. Whether a fixture suffices or a real consuming project is required is an open question the spec hands to the planner. The one criterion this repo can carry is the inverse: that the Bash path check stands down here while `git switch` on the same call remains denied.

The ordering of the two guards is load-bearing and easy to get backwards. The `Bash` branch sits *above* the plugin-repo stand-down deliberately, so the branch policy stays active while fusion is developed. The new path check is a write-guard concern and must stand down here instead, or a fusion developer's agent loses shell access to the plugin's own `rules/`.

Most of the hard part already exists. `hooks/lib/git-branch-guard.ts` is a pure, exported, unit-testable classifier that solves the same shell-parsing problem: `stripDataRegions` (line 169), `extractCommandSegments` (line 335), and `tokenize` (line 409), all fail-closed. The mutation classifier is a sibling consuming that segmentation, not a second parser. Scale calibration from the spec's third pass: the branch classifier is 649 lines with an 84-case, 512-line suite, for one command family with two verbs.

**Spec and its prior decisions** (cited where they live, per the Origin Rule, not copied):

- Spec: `260801-1122_*_spec-normative-consolidation.md`. C5c, its constraints block, and `## Circle structure`.
- Gap analysis: `260801-1020-normative-surface-drift-gap-analysis.md`.
- **D1** — `260801-1020_*_where-does-normative-consistency-live.md`. A writing consolidation agent rather than a report-only detector. Context for why the guard question arose; this Circle does not depend on the answer.
- **D2** — `260801-1020_*_may-any-fusion-writer-touch-rules.md`. Rule-file writes are permitted through an environment-gated exemption plus project-level guard configuration. This Circle is what makes that exemption a control rather than a decoration, and Circle `260801-1244-guard-rules-write` realises the exemption itself.
- **D3** — `260801-1020_*_provenance-header-on-rule-files.md`. Answered by the spec's D-e. Unrelated to this Circle's work; cited so the three open normative decisions are visible from every record in the set.
- **D-i**, the decision that produced this Circle, is recorded in the spec's `## Decisions taken`: fix the guard rather than constrain one agent to guarded tools. Enforcement over instruction, and it protects all sixteen agents rather than one.

## Dependencies

**(none)** — this Circle depends on no other. It is independently valuable and independently revertable: it closes a live defect whether or not the curator is ever built.

Depended on by `260801-1244-guard-rules-write`, which should not ship before it. Recorded here so the direction is legible from either end.

## Turn log

- **Turn 1** (session 260801-0936-orchestrator-session.md): commits `56a41c4..e31c0f3`, eleven tasks against eight planned steps. The three extra came from gates the work itself opened: the verb-table review widened the deny surface three ways (wrappers, ancestor directories, substitution operands), a backslash line continuation was found to split a command and hide its operands in the *shipped* git classifier, and the git override was found to short-circuit the new check. Closed five issues opened within the Circle. Shipped v5.8.0 with a rebuilt `hooks/dist/`, which the integration harness proved had been stale since 2026-07-19. Coherence verdict `ok`; `coderev` filed seven findings, two High.
- **Turn 2** (same session): commits `5d9bbcc`, `18e2e4f`. Closed both High findings with one change on the argument that they are the same defect in two spellings, extracting the shared `hooks/lib/command-word.ts` and closing four bypasses of the git branch policy in the process. Closed all five Medium findings, three of which were false positives. `coderev` returned **not ready to close**: the flag-truncation fix had regressed `perl -lpi`, the canonical one-liner, from deny to allow.
- **Turn 3** (same session): commit `9ab5a2a`. Closed the self-inflicted regression and one Medium. Flag grammar was measured against perl 5.34.1, BSD sed, GNU sed and git 2.53.0 rather than inferred, which established that the filed issue was itself wrong on three letters. `coderev` confirmed the fix with a 14,317-command differential grid, zero unexplained changes. 753 tests green.

Sixteen commits total. Fifteen issues filed in the Circle, fourteen closed within it; the one open is a Low finding about four classifier behaviours that a green suite would not catch. Four of the sixteen commits closed pre-existing holes in the shipped git branch classifier, which this Circle was only supposed to borrow a parser from.

## Closure note

**Closed coherent.** Reconciliation at `260801-2038-reconciliation.md`; the three-edge verdict is appended to `260801-0936-orchestrator-session.md` under `## Coherence`.

The Directive is delivered. Every path in `protectedPaths` now means what it says for all sixteen agents rather than only for the four write tools, the three mutation classes are recognised, the fail-closed bound holds and is documented rather than overclaimed, the two bookkeeping invariants are preserved and asserted rather than intended, and the check stands down in this repository while the git branch policy above it stays active.

Two things are recorded rather than softened. This Circle was the *prerequisite* in a four-Circle body of work, and it consumed the session: three Turns and sixteen commits where eight steps were planned, including two self-inflicted regressions caught only by review. And the first rule file authored after the provenance decision was answered, `rules/protected-path-discipline.md`, shipped **without a provenance header** — the exact decay the parent Directive attacks, occurring hours after the decision that named it, inside the session that took it.

What remains between here and the parent Directive is planned distance, not drift. `260801-1244-guard-rules-write` is now activatable; `260801-1244-rule-provenance-header` and `260801-1244-curator` carry the substance and are untouched.
