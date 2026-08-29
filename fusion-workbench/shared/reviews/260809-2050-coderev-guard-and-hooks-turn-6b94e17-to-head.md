# Code review — guard and hooks, `6b94e17..HEAD`

**Sender:** coderev
**Scope:** the ten fixes of one orchestrator Turn, `6b94e17..9c5b92b`, and nothing outside them
**Date:** 2026-08-09

---

## Summary

Nine of the ten commits do what their records claim. One does not: `69a2d00`'s
heredoc relaxation is correct about a real heredoc body and wrong wherever the
lexer takes a `<<WORD` for a redirect and bash does not — a comment naming a
heredoc, an arithmetic left shift. In those shapes it blanks lines the shell
executes, and a branch switch standing in the blanked region is now allowed
where it was denied before the commit. Both claims the Turn asked to be tested
independently — `15eacb0`'s fold and `378b80a`'s attached-value option — hold.
The remaining findings are two instances of one ordering defect the Turn has
already half-closed, and three documentation drifts the removal in `c353196`
left behind.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 3 |
| Low | 2 |

## Findings by theme

### The shell lexer

**H1 — a false heredoc opener blanks real commands.** High.
`hooks/lib/shell-parse.ts:376`. Issue
`260809-2044_*_a-false-heredoc-opener-blanks-real-commands-…`.

`69a2d00` changed an unquoted-delimiter body from *code* to *blanked except its
substitutions*. Right for a body; wrong when the region was never a body.
`stripData` models neither `#` comments nor arithmetic, so `<<WORD` in either
takes a pending heredoc, and the blanking then runs to the first line equal to
the parsed delimiter.

Measured, HEAD `dist` against the `dist` committed at `69a2d00^`:

```
# write config with <<EOF          echo $((1<<2))
git switch main                    git switch main
cat > cfg <<EOF                    2
value=1
EOF
```

Both `DENY` before, both `allow` at HEAD. With the switch replaced by
`touch RAN`, `bash 3.2` and `zsh 5.9` both create the marker — the blanked line
is executed. The `260809-1111_*_a-plain-line-in-an-unquoted-heredoc-body-is-classified-as-a-command.md` case the commit was written for still allows, and
`$(git switch main)` in a body still denies, so the fix's own target is intact.

Blast radius is the git branch policy alone. The protected paths are measured,
not read off the command, so nothing on that side moves.

This also falsifies two sentences in `rules/git-branch-discipline.md`, which
`9db884c` rewrote: line 18 ("blanks what bash does not execute") and line 20
("a compound command hides no segment from the classifier").

### Ordering: a report standing ahead of the verdict

Two sites, one shape, and `lib/fail-open.ts` already states the principle for
the top-level handlers.

**M1 — the churn half runs before the reply.** Medium.
`hooks/tracker.ts:717-721`. Issue
`260809-2045_*_the-churn-half-still-runs-before-the-reply-…`.

`9bf7ca1` removed one *cause* of the swallowed halt message (the `as` cast in
`loadChurn`). The structure that made it fatal is untouched: `respond(measured)`
still runs after `trackChurn`, so any throw in the advisory heatmap discards the
sentence naming the reverted file. Measured with `churn.json` replaced by a
non-empty directory: `{}` on stdout, file reverted, `haltActive: true`, agent
told nothing.

**M2 — the git branch deny is a fourth fail-open site.** Medium.
`hooks/guard.ts:350-368`. Issue
`260809-2046_*_the-git-branch-deny-is-a-fourth-fail-open-site-…`.

Open record `260809-1825_*_an-unwritable-guard-state-directory-turns-the-protected-path-deny-into-an-allow.md` states this defect correctly and enumerates three
sites, all on the write-tool path. `guardBashCommand` STEP 1 has the same
sequence and guards the one policy fusion documents as unconditional. Measured
with `.guard-state/` at `0555`: `Bash git switch main` returns `{}`. A fix that
satisfies `260809-1825_*_an-unwritable-guard-state-directory-turns-the-protected-path-deny-into-an-allow.md` as written would leave it.

### Documentation drift

**M3 — three shipped documents still promise ping-back detection.** Medium.
`docs/philosophy.md:17`, `docs/working-model.md:81`, `skills/help/SKILL.md:84`.
Issue `260809-2047_*_three-shipped-documents-still-describe-ping-back-…`.

`c353196`'s code removal is complete — module, tests, config keys, event types,
monitor membership and render branch all gone, and a repository-wide search
finds only retrospective mentions naming the decision. `README.md`,
`README-hooks.md` and `CLAUDE.md` were updated. These three were not, and
`/fusion:help` routes users to two of them. `docs/philosophy.md:17` additionally
attributes a halt to churn, which was never true.

**L1 — README-hooks describes the seam's callers as they stood two commits
earlier.** Low. `README-hooks.md:176`. Issue
`260809-2048_*_readme-hooks-says-escalation-keeps-its-own-load-and-save-…`.

`9bf7ca1` wrote "`escalation.ts` and `protected-snapshot.ts` still keep their
own"; `5f2cd56` folded escalation into the seam. Both source headers record the
change correctly, so the user-facing document is the one that disagrees.

### Concurrency

**L2 — clear-halt discards a halt raised inside its own window.** Low.
`hooks/lib/escalation.ts:287`, from `hooks/clear-halt.ts:87-88`. Issue
`260809-2049_*_clear-halt-discards-a-halt-raised-between-its-load-and-its-save-…`.

The "newly raised" test cannot separate the halt the human is clearing from an
unrelated one raised in the meantime. The second is written away while its
`recentEvents` entry survives, and the script prints its success line. The trade
is stated at `escalation.ts:236-242`; what is missing is any signal to the human.

## The two claims the Turn asked to be tested

**`15eacb0` — folding the command word cannot widen an allow. Confirmed.**
Two consumers read the folded name and no others (`grep` over `hooks/`, tests
excluded): the `invocation.name !== "git"` comparison in
`git-branch-guard.ts:274`, a deny table, and `row(WRAPPER_PROGRAMS, name)` in
`command-word.ts:366`, a skip table. `git` is not a `WRAPPER_PROGRAMS` key, so
no fold turns a classified program into a skipped one. Probed:
`GIT switch main`, `/usr/bin/GIT switch main`, `SUDO git switch main`,
`ENV -u X GIT --exec-path=/x worktree add ../w` all deny;
`TIMEOUT git switch main` allows both before and after the fold, because
`timeout`'s positional consumes the `git` either way — no verdict moved.

One thing the fold did **not** carry across, checked rather than assumed:
`BRANCH_SUBCOMMANDS` is still compared case-sensitively. That is not a live hole
here. Against git 2.49.0 on a case-insensitive volume, `git SWITCH feature`,
`git CHECKOUT -b x` and `git WORKTREE …` all fail with `fatal: cannot handle
SWITCH as a builtin` and move nothing — git finds the dashed external through
the folding filesystem and then refuses it. Worth recording as a measured bound,
not a residual to close.

**`378b80a` — not setting the unknown-option flag for a token containing `=`
allows nothing new. Confirmed, by reasoning rather than by the corpus number.**
The bare-word branch consults `BRANCH_SUBCOMMANDS` *before* it consults
`unknownOption` (`git-branch-guard.ts:325-334`). So the denies the change removes
are exactly those where the first bare word after the attached-value option is
**not** `switch`, `worktree` or `checkout` — which is precisely the position git
itself reads as the subcommand. An attached-value option has no separated word
to hide one behind. Probed: `git --exec-path=/x grep switch` allows,
`git --no-pager grep switch` denies, `git --namespace=ns switch other` and
`git --namespace ns switch other` both deny, `git -c foo=bar switch main` denies.

**`5f2cd56`'s merge — exercised directly, not read.** A halt raised
concurrently with a `guard.ts` save is adopted; events are append-merged with no
duplication and no loss beyond the 10-entry trim; a second save from the same
object appends only what was pushed after the first; a hand-built state with no
baseline treats all its events as appends. The one case that does not survive is
L2 above.

## Cross-cutting observations

- **One ordering defect, four sites, two records.** M1, M2 and open record
  `260809-1825_*_an-unwritable-guard-state-directory-turns-the-protected-path-deny-into-an-allow.md` are the same sentence — a record about a decision standing ahead
  of the decision — at four call sites across both hooks. `lib/fail-open.ts`
  fixed it at the top level and states the argument in full; nothing has yet
  applied that argument inside `main` on either side. These should be closed
  together, by one change, or the enumeration will go stale again.
- **The fixes reached the instance more often than the class.** `9bf7ca1` fixed
  one cause of a swallowed halt message rather than the ordering that made the
  cause fatal. `260809-1825_*_an-unwritable-guard-state-directory-turns-the-protected-path-deny-into-an-allow.md` names three sites rather than the shape. The Turn's
  own quality is high; what recurs is a scope drawn around what was measured.
- **`c353196` is the clean counter-example.** Its code removal is complete in
  every surface a search can find. What it missed is three documents no search
  for the identifier would have found, because they describe the feature in
  prose. A removal checklist that ends at `grep` ends one step early.

## Recommended sequencing

**Release blocker.** H1. It is a live deny→allow on a security boundary and a
regression inside the window this Turn opened; it should not ship in a tagged
release. The fix is contained (`#` comments in `stripData` covers the plausible
shape) and the acceptance criteria are in the issue.

**Before the next guard change.** M1 + M2, closed with `260809-1825_*_an-unwritable-guard-state-directory-turns-the-protected-path-deny-into-an-allow.md` as one
change across all four sites. Doing them separately is what produced two records
for one defect in the first place.

**Cleanup, any time.** M3, L1, L2.

## Not findings

Checked and correct, recorded so the next pass does not re-derive them:

- `c353196`'s removal in `hooks/lib/events.ts`, `bin/monitor` (panel membership
  and render branch), `hooks/config.json`, `hooks/config.example.json`, the
  deleted `lib/cross-file.ts` and its test, and the deleted workbench state file.
- `b2e3d12`'s `.claude/rules/**` entry and the `RULE_DIR_PATTERNS` comment that
  went live with it. The rule text's stale enumeration is already filed as
  `260809-1942`.
- `hooks/dist/` is byte-identical to a fresh `tsc` of `hooks/lib` and
  `hooks/*.ts`, so the committed build matches the sources the installer ships.
- Every other claim in `rules/git-branch-discipline.md` probed against the
  classifier: `parallel git switch main` allows, `\git switch main` denies,
  `git checkout -b bar --` denies, `git --namespace foo bar -C d switch main`
  allows (the stated unproven bound), a spliced line continuation in
  `git worktree \<nl>add ../wt x` denies.

## Cross-references — open records this review does not refile

- `260809-1825_*_an-unwritable-guard-state-directory-turns-the-protected-path-deny-into-an-allow.md` — extended by M2.
- `260809-1942_*_protected-path-discipline-enumerates-the-shipped-list-and-now-omits-one-entry.md` — the `.claude/rules/**` omission.
- `260809-2023_*_the-churn-map-is-keyed-by-the-sessions-cwd-and-never-pruned-so-setups-thrashing-read-ranks-dead-paths.md` — the surviving `thrashingScore` reader in `agents/orchestrator.md:113` and `skills/setup/SKILL.md:226` sits on top of this.

---

## Reconciliation 260809-2252 (reconciler, domain `code`) — disposition of the six findings

Annotation only. No finding above is rewritten; each line below records what the tree at HEAD
says about it, re-derived rather than read off the closing commits.

| Finding | Record | Disposition at HEAD |
|---|---|---|
| H1 — false heredoc opener | `260809-2044_*_a-false-heredoc-opener-blanks-real-commands-so-a-branch-switch-in-the-blanked-region-is-allowed.md` | Closed by `6fae676`. See the note below. |
| M1 — churn half before the reply | `260809-2045_*_the-churn-half-still-runs-before-the-reply-so-any-failure-there-discards-the-protected-path-halt-sentence.md` | Closed by `f9c4214`. See the note below. |
| M2 — branch deny is a fourth fail-open site | `260809-2046_*_the-git-branch-deny-is-a-fourth-fail-open-site-and-is-not-in-the-open-records-scope.md` | Closed by `f9c4214`. See the note below. |
| M3 — three shipped documents promise ping-back | `260809-2047_*_three-shipped-documents-still-describe-ping-back-detection-as-a-live-guard-feature.md` | **CONFIRMED fixed** by `97d5846`, both criteria re-derived at HEAD. One site the review did not reach survives — see below. |
| L1 — README-hooks describes the seam's callers stale | `260809-2048_*_readme-hooks-says-escalation-keeps-its-own-load-and-save-two-commits-after-it-stopped.md` | **CONFIRMED fixed** by `97d5846`, both criteria re-derived at HEAD. |
| L2 — clear-halt discards a halt in its own window | `260809-2049_*_clear-halt-discards-a-halt-raised-between-its-load-and-its-save-and-tells-the-human-it-cleared.md` | Correctly still `_o_`. The review's own sequencing put it under "cleanup, any time"; nothing in Turn 2 touched it. |

**M3's removal was one site short, and the review's own cross-cutting observation predicted the
shape of the miss.** "A removal checklist that ends at `grep` ends one step early" holds one
step further than this review took it: `hooks/tracker.ts:92-94`, the header comment on
`TRACKER_NOISE_FILES`, still reads "Tracking them as churn or ping-back produces pure noise —
exclude from both metrics". There is no second metric; the constant has one reader at HEAD
(`hooks/tracker.ts:674`, the churn path). It says "ping-back", not "cross-file", so neither the
identifier sweep in `c353196` nor the prose sweep in `97d5846` — which searched the three
*documents* — would have found it. Filed as
`260809-2252_*_the-tracker-noise-list-still-says-it-excludes-two-metrics-when-only-churn-reads-it.md`.

Everything else this review recorded under "Not findings" was re-checked and holds. In
particular `hooks/dist/` is still byte-identical to a fresh `npm run build` at HEAD (the build
is `rm -rf dist && tsc`, and `git status` reports no tracked change after a full run), so the
compiled hooks the installer ships still match the sources — the claim survives the three Turn 2
commits that changed both.

**One caveat this review could not carry, recorded here because it is the reconciliation's
main reservation: no `coderev` pass was run over Turn 2.** The three commits it left unreviewed
include a fourteen-site change to the fail-open ordering of the security boundary and the fix
for the regression this review itself caught. The verifications behind the H1, M1 and M2 lines
above are the reconciler's, against the acceptance criteria in the records — they are not a
review, and they did not look for new defects outside those criteria.
