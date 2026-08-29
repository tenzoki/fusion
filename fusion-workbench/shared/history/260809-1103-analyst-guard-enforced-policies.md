# Session: analysis of the guard's enforced policies

**Date:** 2026-08-09 11:03
**Agent:** analyst
**Domain:** code
**Status:** Complete
**Circle:** none active; artifacts landed in `shared/` per the Origin Rule

## Directive

Analyse what fusion's compliance guard enforces today, in the enforcement layer only: `hooks/guard.ts`, `hooks/tracker.ts`, `hooks/hooks.json` and the four library modules `protected-snapshot.ts`, `git-branch-guard.ts`, `shell-parse.ts`, `command-word.ts`. A parallel analysis covers the support layer; that scope was not touched.

Five questions: the full control flow of a tool call, where the guard can answer wrongly (split into false alarm, silent pass, data loss), where behaviour depends on something other than the tool call's inputs, how much of the retired classifier's machinery the surviving branch policy still needs, and three to six concrete consolidation targets.

## Method

Every behavioural claim was produced by running code. Two harnesses, both in the session scratchpad, both outside the fusion repository so the plugin-repo stand-down was not in play:

- the compiled classifier driven directly, for the branch policy;
- both hooks run as real subprocesses against scratch consuming projects carrying `fusion-workbench/.fusion-setup` and a `fusion-guard.json` declaring `"protectedPaths": ["rules/**"]`.

Where a git command's real effect is asserted, it was run against a throwaway repository. Two cases were deliberately left unmeasured rather than measured by working around a live deny, since `rules/git-branch-discipline.md:45` forbids that; both are marked `inference:` in the report.

## What was produced

One analysis report and eight defect files.

Report: `260809-1103-guard-enforced-policies.md`. Two Mermaid diagrams, one for the two-hook control flow and one for the lexer stack's dependency shape.

Issues, all `_o_`, all in `shared/issues/`:

| Stamp | Severity | Subject |
|---|---|---|
| 260809-1104_*_a-symlink-in-place-of-a-protected-file-writes-through-it-and-removes-the-path-from-the-watched-set.md | Critical | A symlink in place of a protected file writes through it and removes the path from the watched set |
| 260809-1105_*_a-trailing-separator-lifts-the-branch-deny-so-git-checkout-b-name-runs.md | High | A trailing `--` lifts the branch deny, so `git checkout -b <name> --` runs |
| 260809-1106_*_the-unknown-global-option-fix-was-deleted-with-the-mutation-classifier-and-the-branch-guard-never-had-it.md | High | The unknown-global-option fix was deleted with the mutation classifier |
| 260809-1107_*_any-writer-active-during-the-tool-call-window-is-attributed-to-the-agent-and-reverted.md | High | Any writer active during the tool-call window is attributed to the agent and reverted |
| 260809-1108_*_a-failed-snapshot-save-leaves-the-previous-one-in-place-so-the-next-call-reverts-to-an-older-state.md | High | A failed snapshot save leaves the previous one in place |
| 260809-1109_*_both-hooks-fail-silent-instead-of-open-when-the-guard-state-directory-is-unwritable.md | Medium | Both hooks fail silent instead of open when `.guard-state/` is unwritable |
| 260809-1110_*_the-command-word-comparison-is-case-sensitive-while-the-protected-path-match-folds.md | Medium | The command-word comparison is case-sensitive while the path match folds |
| 260809-1111_*_a-plain-line-in-an-unquoted-heredoc-body-is-classified-as-a-command.md | Medium | A plain line in an unquoted heredoc body is classified as a command |

## The three findings that shaped the report

**The symlink case.** Replacing a glob-protected file with a symbolic link does three things in one tool call: the restore follows the link and overwrites an arbitrary file outside the tree, the protected path stays a symlink while the guard reports it restored, and the path drops out of the watched set permanently. All three measured end to end, including a second call that changed the path freely with nothing measured. Wildcard-free protected entries survive the third consequence because `literalPaths` watches them regardless; against the shipped list that means `agents/**`, `rules/**` and `skills/**` lose protection while the five literal entries keep it.

**The lost fix.** `git --namespace ns switch other` is allowed and switches branches. That defect was found, recorded at High, and closed on 2026-08-04 as `260804-1333_*_an-unrecognised-git-global-option-swallows-the-subcommand-and-the-invocation-reads-as-an-unrecognised-program.md`, with a structural fix applied to `bash-mutation-guard.ts`. The module was deleted in v6.0.0 and the fix went with it; the surviving classifier carries the same eight lines. A process finding as much as a code one: nothing in the retirement asked whether the other copy of a shared defect was the one that survived.

**The attribution window.** The before-fingerprint makes a change attributable to an interval, not to a tool call. Measured with no agent write in the sequence at all: a human editor save between the two hooks is reverted, reported to the model as this call's doing, and halts the session. The rule's two conceded prices describe neither this nor the two other data-loss paths found.

## Falsified along the way

Two claims in the code's own comments do not hold, and both were checked rather than assumed.

`hooks/lib/protected-snapshot.ts:465-468` says a snapshot that cannot be written leaves the next comparison without a before-picture. The failing write is to the temporary file; the previous snapshot survives and is used. Measured: a revert to a state two calls old.

`hooks/lib/command-word.ts:13-15` says the module stays separate because "the suite tests them apart". No test file imports it. Verified by grep across all TypeScript outside `dist/`.

## Consolidation

Six targets in the report, ordered by benefit against risk. The two cheapest are pure deletions with no behaviour change: the placeholder and literal-table machinery in `shell-parse.ts`, unreachable because the only literal table in the system is an empty map, kept alive by three tests that synthesize its input and say so in their own comments; and `Invocation.reachesBuiltin`, whose documentation states outright that nothing reads it. About 157 lines between them, counting tests.

## Notes for the next session

The installed plugin copy at `$FUSION_PLUGIN_ROOT` is behind the work tree. Setup emitted `stilwerk/default-voice-de.yaml` for the long-form writing profile although `CLAUDE.md` declares `**Artifact language:** en`; the work-tree `bin/fusion-rules` resolves it correctly to `default-voice-en.yaml`. Not a defect in the tree, and the documented residual in `CLAUDE.md` covers it: run `fusion --update` before rule or guard work in this repository. The report was written in English against the correct profile.

Scratch harnesses were left in the session scratchpad and touch nothing in the project.
