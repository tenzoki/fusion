# Reconciliation — 260804-1021-reconciliation.md

**Agent:** reconciler
**Domain:** `code`
**Circle:** `260801-1244-guard-rules-write` (active, `_t_`)
**Session reconciled:** `260803-1737-orchestrator-session.md` — five Turns, the Circle's fourth through eighth, `6c447eb..cc012fc`, exited on the max-Turns circuit breaker
**Suite at HEAD:** `npx vitest run` — 1241 passed, 24 files, 0 failed, exit 0
**Coherence verdict:** `review-needed` (written to the session history file's `## Coherence` section)

---

## Scope

Read every file under both stores for plans, issues, decisions, reviews, analyses and history. Verified against the codebase at HEAD `cc012fc` by measurement — 190 probe commands through `classifyBashMutation` in the documentation audit, plus a nine-command four-commit differential for the regression, plus the reconciler's own nineteen-row confirming probe. `npm test` was deliberately not run: it builds first and rewrites the `hooks/dist/` that Plan Step 10 owns, and the working tree already carries one uncommitted build-and-revert cycle from this session.

| Store | Reviewed | Updated |
|---|---|---|
| Plans | 5 (1 Circle, 4 shared) | 1 |
| Issues | 79 (34 Circle, 45 shared) | 10 annotated, 4 newly filed |
| Decisions | 17 (8 Circle, 9 shared) | 8 annotated, 3 header fields corrected |
| Reviews | 10 (5 Circle, 5 shared) | 2 annotated |
| Analyses | 8 (1 Circle, 7 shared) | 0 |

---

## A. The counts in the dispatch brief were both wrong, from two different stale surfaces

The brief said nine issues closed and eleven filed. Measured against the filesystem and against `orchestrator-events.jsonl`:

| | Brief | Measured |
|---|---|---|
| Issues closed this session | 9 | **14** |
| Issues filed this session | 11 | **16** (15 in the Circle, 1 shared) |
| Open findings remaining in the Circle | 7 | **6** at the start of this pass, **10** after the four filed today |

**Where the nine came from.** `fusion-workbench/orchestrator-live.md` is frozen at Turn 6. It reads `**Turn:** 3/5 | Commits: 9`, its last `[DONE]` line is T6-1 `048f3db`, and its Ledger says `Issues closed: 9 Filed: 8`. Turns 7 and 8 never reached it. The nine is a mid-session snapshot presented as a session total.

**Where the eleven came from.** No surface carries it. The closest true statement is that eleven issues were both filed and closed within the session.

**The measured breakdown**, from `git log --diff-filter=A` and `git log -M --find-renames=50%` over both issue stores across `6c447eb..HEAD`, cross-checked against the five `turn_end` events:

- Filed and closed in the same session: 11 (`260803-1803`, `1835`, `2038`, `2039`, `2040`, `2236`, `2237`, `2238`, `260804-0838_*_a-newline-after-and-is-downgraded-to-newline-so-a-multi-line-and-chain-denies-with-an-unactionable-reason.md`, `0840`, `0841`)
- Closed this session, filed earlier: 3 (`260803-1431`, `260802-2320_*_case-folding-bypasses-the-entire-protected-list-on-a-case-insensitive-filesystem.md`, `260803-1251`)
- Filed this session, still open: 5 (`260804-0836_*_a-cd-skipped-by-an-earlier-double-pipe-is-still-modelled-as-made-so-the-and-guarantee-leaks.md`, `0837`, `0839`, `0842`, and `260803-1837`)

`orchestrator-events.jsonl` is the one bookkeeping surface that kept up, and its per-Turn sum is 14 closed — correct. Its 14 filed undercounts by two, because Turn 4's event omits the analyst's own already-closed finding and the shared Circle-routing issue.

**This is the third session in a row** in which `agentstate.yaml` and `orchestrator-live.md` froze while the work ran. `agentstate.yaml` still reads `progress.turn: 1`, `commits: 0`, `current_task: T4-1 running`, against five Turns and eleven commits. The divergence check that `260801-2038_*_` proposes — compare `progress.commits` against `git rev-list --count <git_head_at_start>..HEAD` — computes to 0 against 11 here. Second demonstration on two consecutive sessions that the check works and that nothing runs it.

Not repaired, for the reason the predecessor gave: the reconciler's scope excludes `agentstate.yaml` and Circle records, and widening it would put two writers on the session-state surfaces.

---

## B. Nine closures verified; three had no evidence in the file and one contradicted itself

Every one of the 14 closures is supported by a commit. None is claimed without one. But three were made by renaming the file with **zero content change**, which leaves a closed issue carrying only its open-state text.

| Issue | How it closed | State of the file before this pass |
|---|---|---|
| `260802-2320_*_case-folding-bypasses-the-entire-protected-list-on-a-case-insensitive-filesystem.md` case folding, High | `86a437a`, rename only (`R100`) | Body still said *"stays `_o_`, deliberately. The bypass is live at HEAD `fa81589`"* and *"the code change … belong[s] to a later Circle"*. Both false at HEAD. |
| `260803-1431` `cd -P` gate 0, High | `a79ff1a`, rename only (`R100`) | Body still listed three docstrings as "unamended". All three are amended at HEAD. |
| `260803-1803` working-directory model, High | filed already carrying `_c_` in `a79ff1a` | No open-to-closed transition and no closure evidence at all. |

All three closures are substantively correct and were verified in code rather than taken from the commit messages: `foldCase` at `hooks/lib/paths.ts:89-90` consumed by `matchesAnyFolded` at `:148-149` and by the classifier at `:1307`/`:1311`; the gate-0 bound rewritten at `hooks/lib/rules-write-exemption.ts:73-87` with the false version quoted in place; `applyDirEffect`'s allow-list and the `CDPATH` degrade measured directly. A `## Resolved` section reconstructing each was appended to all three.

The remaining eleven closures carry proper resolution notes. Two of them (`260803-2236_*_runsbuiltins-is-asserted-about-a-name-so-the-model-now-moves-the-shell-where-the-shell-did-not-move.md`, `260803-2237_*_unmodelled-zeroes-the-stack-values-but-not-its-depth-so-an-absolute-cd-re-proves-a-shifted-stack.md`) use a `## Resolved — task Tn-1` heading rather than a `Resolved:` line, which reads fine and is worth standardising rather than flagging.

**The practice that made this verifiable is worth naming.** Each of the three amended docstrings keeps its false version in place and marks it, rather than replacing it. `hooks/lib/bash-mutation-guard.ts:461` carries the line `IT IS WRITTEN AS A LIST BECAUSE EACH SHORTER VERSION OF IT WAS FALSE`, followed by both earlier false versions verbatim. That is why the closure could be checked without the issue file's help.

### The two duplicate pairs: both distinctions survive

**`260803-1251` vs `260803-1431`** — argued during the session to be the same class but different defects, each needing its own fix. Correct, and now demonstrable: both are closed at HEAD by different commits touching different files (`a79ff1a` in the classifier, `7cf9693` in `fs-locator.absolute()` via `joinUncollapsed`). Two fixes, no overlap.

**`260804-0836_*_a-cd-skipped-by-an-earlier-double-pipe-is-still-modelled-as-made-so-the-and-guarantee-leaks.md` vs `260804-0837_*_a-cd-inside-a-pipeline-runs-in-a-subshell-in-bash-and-the-model-follows-it-anyway.md`** — also correct. `0836` is a short-circuit defect (`||` skips the `cd`); `0837` is a scoping defect (bash subshells every pipeline element). They share a root cause in the tracker's sense and one decision closes both, but the shells differ: zsh runs the last pipeline element in the current shell, so `0837`'s rows are bash-only while `0836`'s reproduce in both. A fix special-casing the last pipeline element would close `0837` in zsh's terms and leave bash open — which is exactly why `0837`'s own anti-vacuity section asks for the zsh row to be pinned separately.

No two open issues describe the same defect. Checked pairwise across all ten.

---

## C. The regression and its closure

`9aacab5` (Turn 5) made eleven measured rows allow that previously denied. Those eleven rows are **nine distinct command texts** — rows 6/7 and 8/9 are one text each, measured in bash and in zsh, and the classifier is shell-agnostic.

Each text was run through `classifyBashMutation` at four commits, with `hooks/lib` materialised out of git read-only at each. Result: every row denies at `cb2c8ad`, allows at `9aacab5`, and denies at HEAD. The claimed sequence reproduces exactly.

`048f3db` closed **eight of the nine**. The ninth, the redirect spelling `command cd build && echo pwned > rules/x.md`, closed later in `c9c44a3` with `260803-1835`. The closure record understates itself relative to HEAD rather than overstating.

**The closure did not restore the defect `9aacab5` was written to fix.** All eight rows of `260803-2038_*_command-cd-and-builtin-cd-move-the-shell-past-a-directory-model-that-never-sees-them.md`'s own measurement table deny at HEAD, including the redirect spelling that briefly re-allowed at `048f3db`. The mechanism changed — the rows now deny by give-up (`unknownCwdReason`) rather than by modelling — and the discriminating controls confirm the give-up did not become a blanket: `cd rules && rm x.md` denies with the *protected-path* reason, `cd build && rm out.js` still allows, and `rm -rf node_modules`, `rm -rf dist`, `pushd build && rm out.js` are untouched.

### The regression accounting is larger than one

Two of the five code commits introduced regressions, and the second introduced four:

| Commit | Introduced | At HEAD |
|---|---|---|
| `9aacab5` (Turn 5) | `260803-2236_*_runsbuiltins-is-asserted-about-a-name-so-the-model-now-moves-the-shell-where-the-shell-did-not-move.md` — nine texts flipped deny to allow | closed |
| `c9c44a3` (Turn 7) | `260804-0838_*_a-newline-after-and-is-downgraded-to-newline-so-a-multi-line-and-chain-denies-with-an-unactionable-reason.md` behaviour, `260804-0839_*_the-flat-joiner-model-ignores-shell-precedence-so-a-pipeline-and-an-if-body-degrade-a-cd-the-shell-guarantees.md` behaviour, `260804-0840_*_the-shipped-cost-statement-five-shapes-and-nothing-else-measured-moved-is-false-in-every-agents-context.md` accuracy, `260804-0841_*_the-supersession-inverts-the-fact-the-original-argument-rested-on-curl-o-rules-x-md-allows.md` accuracy, `260804-0842_*_the-git-gold-fixture-carries-no-double-pipe-pipe-or-ampersand-joiner-and-no-allow-only-row.md` new coverage gap | 0838/0840/0841 closed; **0839 and 0842 open** |

Five regressions plus one coverage gap, four closed inside the session, two open. The Turn 7 review's headline — zero commands allow at HEAD that denied at `048f3db`, across 222,319 generated commands — is true and is a statement about the **security** direction only. Turn 7 opened no hole and did cost accuracy and over-deny. Both halves are true and the second is the one that gets dropped when the first is repeated.

---

## D. `rules/protected-path-discipline.md` — the Circle's main artifact, audited claim by claim

628 lines at HEAD, up from 275 at `origin/main`. Edited in six commits this session. Loaded into every agent's context on every dispatch in every consuming project.

**The audit's headline: the document is accurate on the large majority of what it claims.** All 20 rows of its illustration block, all 12 rows of its fail-closed block, the whole verb table, the whole ancestor section, the whole `CDPATH` section, the halt section with both quoted messages byte-accurate against `guard.ts:453-456` and `:705-707`, and 17 of its 18 residual bullets measured exactly as written. The `## Reconciliation` note on the Turn 7 review lists what was checked.

Three things are wrong, and one of them is the worst kind.

### D1 — the decision procedure returns the safe answer for the two commands that delete a rule file

`:168` opens **"The rule, so you can predict a case this file does not list"** — the block the document hands an agent as its reasoning tool. Question 2 reads: *"Is every joiner between that builtin and the write an `&&`? Yes → **the model stays exact** and this rule denies nothing."*

Run it on `true || cd build && rm rules/x.md`. Every joiner between the `cd` and the write is `&&`, so question 2 answers yes, and the document says the model stays exact. It is not: the `cd` never runs, and the `rm` deletes `rules/x.md` in both shells. Same for `echo hi | cd build && rm rules/x.md`.

The file contradicts itself. `:568` says the exactness sentence *"is **not** true, and nothing in this file should be read as claiming it."* `:172` claims it, 396 lines earlier, in the affirmative, in the section an agent is told to reason from. A disclaimer in the appendix does not repair an assertion in the decision procedure, and the agent reaching for the procedure is the one who has not read to the end.

`README-hooks.md:184` states the same rule without the exactness claim and names both open leaks four sentences later. The two documents diverged. Filed as `260804-1025_*_`, High.

### D2 — the cost rule that replaced the falsified five-shape list is sound

`cc012fc` replaced the enumeration (`260804-0840_*_the-shipped-cost-statement-five-shapes-and-nothing-else-measured-moved-is-false-in-every-agents-context.md`) with a general rule stated as three ordered questions plus illustrations explicitly labelled an open set. Probed with commands the rule predicts will deny and commands it predicts will allow, across recognised verbs with unresolvable operands, unrecognised programs with unresolvable operands, redirections, wrappers, `sed -i`, and a `cd` into an unprovable directory. **The rule and the code agree everywhere except question 2**, which is D1 above. The method change behind it — a generated cross-product rather than a harvest of the suite's own string literals — is the right correction and found all three missing families in one run.

### D3 — the residual list is honest about what it names and is missing two real routes

Every one of the 18 named residuals is real; each was constructed and shown to allow (or, for the two that deny, to deny). The `&&`-read-too-strongly entry at `:551-568` states both open leaks correctly and calls them live hazards.

Two write routes are real at HEAD and on no list:

- **`git -C DIR` supplies a directory the model skips.** `resolveGit` (`hooks/lib/bash-mutation-guard.ts:1084-1087`) steps over `-C` **and its value** to find the subcommand and never applies it. Measured: `git -C rules rm x.md`, `git -C agents rm coder.md`, `git -C rules clean -fdx`, `git --work-tree=rules rm x.md` all allow, while the controls `git rm rules/x.md`, `git clean -fdx rules` and `git -C /repo mv rules/x.md docs/` all deny. This is the eighth instance of the Circle's class and the first that **fails open** rather than degrading — the document names that exact failure mode at `:305-306` about `cd` and nothing applies it to `git`. Untested: the suite's only `-C` row (`bash-mutation-guard.test.ts:196`) pins the opposite direction. Filed as `260804-1024_*_`, High.
- **`git checkout <treeish> -- <protected>`.** `checkout` is in neither `MUTATION_GIT_SUBCOMMANDS` nor the residual list. `git checkout HEAD~5 -- rules/x.md` and `git checkout otherbranch -- rules/x.md` allow, while `git restore --source=HEAD~1 rules/x.md` denies — the same operation, different spelling, opposite verdict, and both halves are in the document with nothing joining them. Filed as `260804-1026_*_`, Medium.

### D4 — the false sentence, and why it is not as bad as it looks today

`:421` states **"There is no override for a protected-path shell write. That is deliberate."** False at HEAD: `hooks/guard.ts:410-412` passes the exemption predicate into the Bash classifier and `guard.ts:399-403` states the intent. With the flag set, `rm rules/x.md`, `mv rules/x.md rules/retired/x.md`, `sed -i '' 's/a/b/' rules/x.md` and `echo x > rules/x.md` all flip to allow while `agents/**`, `hooks/config.json` and the bare `rules` directory stay denied. `README-hooks.md:199` and `CLAUDE.md:113` carry the same sentence.

It has been false since `45f53d4` — Plan Step 4, landed in the Circle's first Turn — and Plan Step 9 was written to correct it. Step 9 is unstarted. **What is new this session** is that `86a437a` added `:49`, which names `FUSION_ALLOW_RULES_WRITE` in order to say the exemption does not fold. So the same file now names the flag and denies it exists, 372 lines apart, which is precisely the self-contradiction task T3-7 declined to ship. Tracked on `260803-1402_*_`, annotated today with the drifted line numbers and the third file.

**The bound that limits the damage, and it is a real bound.** No consuming project reads any of this yet. `~/.fusion/rules/protected-path-discipline.md` — the copy `bin/fusion-rules` actually emits — is 275 lines and hashes identical to `origin/main`. In that copy the "no override" sentence is **true**, because the installed guard has no exemption. The installed pair is self-consistent. The self-contradictory pair exists only in the unshipped working tree.

---

## E. Nothing in this Circle is live for a consuming project, and the claim is stronger than it was stated

The last coder's handover rests on this. It holds, and understates the gap.

| | Committed at HEAD | Working tree | Fresh compile of current source |
|---|---|---|---|
| `foldCase` | absent | absent | present |
| `matchesAnyFolded` | absent | in two orphan files only | present |
| `ambientCdpathIsSet` | absent | absent | present |
| the `cc012fc` deny string | absent | absent | present |
| `resolveInvocation` (pre-Circle control) | present | present | present |

`hooks/dist/` was last touched by `9ab5a2a`, **thirteen commits before** this Circle's first (`6b3aa5c`). `git log --oneline 6c447eb..HEAD -- hooks/dist` is empty. Every tracked dist file in the working tree is byte-identical to HEAD (`git diff --stat HEAD -- hooks/dist` empty). The two untracked files (`lib/fs-locator.js`, `lib/rules-write-exemption.js`) are byte-identical to a fresh compile and are untracked only because no commit ever added them.

**Would a fresh install crash?** No. The committed `dist/guard.js` imports seven local modules, all present in the committed tree, and `grep -rn "fs-locator\|rules-write-exemption"` across the whole committed `dist` returns nothing. It is a coherent snapshot from before the new modules existed. A consuming project gets a **working old guard**, not a crash — which matters, because the guard fails open on error.

**And the gap is wider than `dist`.** `origin/main` is `e8988d9`, **36 commits** behind HEAD. The HTTPS installer pulls `refs/heads/main`. At `origin/main` the *source* for this feature does not exist either: no `fs-locator.ts`, no `rules-write-exemption.ts`, and `FUSION_ALLOW_RULES_WRITE` appears only in workbench planning documents. The local install confirms it end to end — `~/.fusion/hooks/dist/guard.js` hashes identical to the committed HEAD blob.

So none of the eleven commits' behaviour is live anywhere, including on the machine this Circle is being developed on. It fails safely rather than loudly.

**One thing that happened in the working tree and should be known.** Somebody ran a build at ~10:07 and reverted the tracked files at ~10:09: dist mtimes are newer than source, tracked files match HEAD exactly, and the two untracked files match a fresh compile because git had nothing to restore them to. The Turn 8 log says so explicitly (*"`hooks/dist/` tracked files restored to HEAD after the final run"*). Recorded because the mtimes alone read as a stale rebuild.

---

## F. Decisions: five moved, all five verified, and a record-integrity pattern

| Record | Marker | Verified at HEAD |
|---|---|---|
| `260803-1419_*_how-should-the-protected-path-check-treat-the-case-of-a-path.md` case folding | `_i_` | `86a437a` correct — `foldCase`/`matchesAnyFolded` measured on both surfaces |
| `260803-1803` ambient `CDPATH` | `_i_` | `b85f6a0` correct — bare-word `cd` degrades under `CDPATH`, anchored operands stay exact, `CDPATH=` and whitespace change nothing |
| `260803-2338_*_should-the-guard-degrade-its-directory-model-after-a-cd-it-cannot-prove-succeeded.md` unproven `cd` | `_i_` | realised in `c9c44a3` — `cd nonexistent; rm rules/x.md` denies, `cd build && rm out.js` still allows |
| `260804-0106_*_should-the-fail-closed-bound-be-drawn-around-the-program-or-around-the-cause.md` fail-closed bound | `_i_` | realised in `c9c44a3` — cause-shaped bound holds at exactly its stated width |
| `260804-0947_*_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md` the joiner question | `_o_` | genuinely unanswered; both defects it closes measured live at HEAD |

Each cites what its marker claims. Four record-integrity findings:

1. **Three `**Status:**` header fields disagreed with their own filename markers** — `260803-1419_*_how-should-the-protected-path-check-treat-the-case-of-a-path.md` said `answered`, `260803-1803` and `260803-2338_*_should-the-guard-degrade-its-directory-model-after-a-cd-it-cannot-prove-succeeded.md` said `open`, all three at `_i_` with filled transition lines. Corrected, and the correction noted in place. Same root cause as `260802-0920_*_` (a field maintained by attention rather than by procedure), which that issue's own annotation already argues is the case for dropping the field.
2. **Two records carry stale pre-answer text above their real answer.** `260803-2338_*_should-the-guard-degrade-its-directory-model-after-a-cd-it-cannot-prove-succeeded.md` had an empty `Answered:`/`Implemented:` template block at its midpoint; `260803-1803` has two `## Answer` headings, the first still reading "Not yet answered. This needs the user" with a `## Realisation — Not implemented` beneath it. Both are records that reached `_i_` inside one Turn, and in both the answer was appended at the closing gate while the pre-gate text was left. Annotated, not deleted.
3. **Two `Implemented:` lines name a task rather than a commit.** `260803-2338_*_should-the-guard-degrade-its-directory-model-after-a-cd-it-cannot-prove-succeeded.md` and `260804-0106_*_should-the-fail-closed-bound-be-drawn-around-the-program-or-around-the-cause.md` both cite task T7-1; the convention asks for a short hash. T7-1 is **`c9c44a3`**. Recorded on both rather than edited into the lines.
4. **`260803-1419_*_how-should-the-protected-path-check-treat-the-case-of-a-path.md`'s `Answered:` citation, flagged by the previous reconciliation, was not corrected.** It still points at `260803-1038-orchestrator-session.md`, whose `## Per-Turn Log` still reads "(No Turn started yet in this session.)". Re-checked today. That a flag survives a whole session untouched is itself the finding: the reconciler annotates and nothing in the loop acts on the annotation.

**`260804-0106_*_should-the-fail-closed-bound-be-drawn-around-the-program-or-around-the-cause.md` is the best-formed record in the store and worth copying.** It exists because the behaviour it reverses was recorded only as the `Resolved:` line of a closed issue, and it says so under a heading called `## Why this record exists at all`. Its supersession is stated in both directions. Its `## Method note` names its author's own false claim, calls it "a recollection in the shape of" a measurement, and states the method change that follows. A record that documents its author's error is worth more than one that reads clean.

**Grounding↔Directive, checked across both stores.** Seven active or open decisions: four in the Circle (`260802-1912_*_does-the-self-protection-floor-apply-before-the-config-file-exists.md_a`, `260803-1314_o`, `260803-1402_o`, `260804-0947_*_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md_o`) and three shared (`260719-2141_a`, `260801-1020_a` × 2). **None conflicts with the Directive.** Three are waiting on plan Step 6, one is the Directive's own open question, and the three shared ones are the upstream decisions this Circle implements.

---

## G. Two of five code commits carry no review

| Turn | Commit | Review |
|---|---|---|
| 4 | `a79ff1a` `86a437a` `7cf9693` `b85f6a0` | `260803-2041-coderev-turn4-working-directory-allow-list.md`, scope `6c447eb..b85f6a0` |
| 5 | `9aacab5` | `260803-2240-coderev-turn5-wrapper-walk-and-pushd-rotation.md`, scope `cb2c8ad..9aacab5` |
| 6 | `048f3db` | **none** — Turn 7's review used it as the baseline, which measures what came after it |
| 7 | `c9c44a3` | `260804-0845-coderev-turn7-separator-degrade-and-the-cause-bound.md`, scope `048f3db..c9c44a3` |
| 8 | `cc012fc` | **none** — the circuit breaker fired in the same commit |

`048f3db` is the commit that closed the Turn 5 regression, and `cc012fc` is the commit that rewrote the rule file loaded into every agent's context. Both were verified here by measurement, which is not the same as a review: this pass checked whether the claims are true, not whether the design is right. The two findings filed against `cc012fc`'s own subject (`260804-1025_*_the-decision-procedure-tells-an-agent-the-model-stays-exact-for-the-two-commands-that-delete-a-rule-file.md`, and the `git` gaps at `260804-1024_*_git-c-supplies-a-directory-the-model-skips-so-a-relative-operand-resolves-off-the-protected-list.md`/`260804-1026_*_git-checkout-treeish-overwrites-a-protected-path-and-is-in-neither-the-verb-table-nor-the-residual-list.md`) are the kind a Turn 8 review would have been likely to catch.

---

## H. Filed by this reconciliation

| Issue | Severity | Why it is not a duplicate |
|---|---|---|
| `260804-1024_*_git-c-supplies-a-directory-the-model-skips-so-a-relative-operand-resolves-off-the-protected-list.md` `git -C` supplies a directory the model skips | High | No joiner in it. No option of `260804-0947_*_` touches it. Fails open where every `cd` form degrades. |
| `260804-1025_*_the-decision-procedure-tells-an-agent-the-model-stays-exact-for-the-two-commands-that-delete-a-rule-file.md` the decision procedure says the model stays exact | High | A documentation defect that survives whichever way `260804-0947_*_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md` goes, and costs one clause to fix now. |
| `260804-1026_*_git-checkout-treeish-overwrites-a-protected-path-and-is-in-neither-the-verb-table-nor-the-residual-list.md` `git checkout <treeish> --` | Medium | Different subcommand, different fix, and it carries a design question (which tree-ishes are inert) that `260804-1024_*_git-c-supplies-a-directory-the-model-skips-so-a-relative-operand-resolves-off-the-protected-list.md` does not. |
| `260804-1027_*_the-replacement-audit-recipe-went-stale-in-the-turn-after-it-was-written-and-omits-moved.md` the replacement audit recipe omits `moved` | Low | Record integrity. The third generation of a recipe that has now been wrong three times, and the one that was supposed to be structurally incapable of going wrong. |

**Nothing was misfiled as an issue that should be a decision.** `260804-1024_*_git-c-supplies-a-directory-the-model-skips-so-a-relative-operand-resolves-off-the-protected-list.md` and `260804-1026_*_git-checkout-treeish-overwrites-a-protected-path-and-is-in-neither-the-verb-table-nor-the-residual-list.md` each name a design choice in their candidate directions and each says a decision record is wanted if that direction is taken — which is this Circle's established practice and has worked.

---

## I. What the next session inherits

The last coder recommended answering `260804-0947_*_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md` first, then plan Step 10. **Agreed on the order, with one correction to what answering it buys.**

1. **Answer `260804-0947_*_`.** Two no-flag writes to `rules/**`, `agents/**` and `skills/**` are live at HEAD. Option 1's cost is measured at zero on every corpus of real work, which makes it the cheapest thing on the board. It is a decision and this Circle's rule has been that a record comes before the code moves.
2. **`260804-1024_*_` — `git -C`.** New today, High, and it is the correction to the sequencing: `260804-0947_*_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md` has been called *the* release blocker for any claim about the boundary, and it is necessary rather than sufficient. `git -C rules rm x.md` allows and deletes the file whichever way `0947` goes. Both must close before the sentence the Turn 7 review names as the prize is true.
3. **Plan Step 10 — rebuild `hooks/dist/`, bump `plugin.json`, push.** Nothing here is live until this happens, and `origin/main` is 36 commits behind. Everything else is moot for a consuming project until it lands. It should go *after* 1 and 2, not before: shipping the current tree ships the self-contradictory rule file described in section D.
4. **`260804-1025_*_` — the false clause at `rules/protected-path-discipline.md:172`.** One clause, no behaviour, and it is the sentence steering agents wrong in the meantime. Cheap enough to take with anything.
5. **Plan Step 9, rescoped.** Three files carry the false "no override" sentence, not two. Add `CLAUDE.md` to `260803-1402_*_`'s `**Affects:**`.
6. **`260804-0839_*_`** (the over-deny this session caused and did not close) and **`260804-0842_*_the-git-gold-fixture-carries-no-double-pipe-pipe-or-ampersand-joiner-and-no-allow-only-row.md`** (the git gold fixture). Only option 2 of `260804-0947_*_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md` closes the first.
7. **The three older open decisions** — `260803-1314`, `260803-1402`, `260802-1912_*_does-the-self-protection-floor-apply-before-the-config-file-exists.md`. None blocking; all three wait on plan Step 6.

---

## J. Two process notes

**The method note the Turn 8 handover wrote is correct and now has a fourth instance.** Every number this Circle's implementers reported has reproduced under review. What has failed — four times now — is one inference laid over correct data: "mis-marking a wrapper is an over-deny", "`&&` means the previous segment succeeded", "`curl -o rules/x.md` denies", and now "the model stays exact" at `rules/protected-path-discipline.md:172`. All four were one command away from being checked. The generated cross-product is now the method for measuring cost; the equivalent discipline for a *claim* is to run it before writing it down, and it is most needed when the claim is the premise of an argument rather than its conclusion.

**Reconciliation annotations are not acted on.** Three findings from reconciliation 260803-1516 survive untouched: `260803-1419_*_how-should-the-protected-path-check-treat-the-case-of-a-path.md`'s unresolvable `Answered:` citation, `260803-1402`'s two wrong cross-references, and `260802-1912_*_does-the-self-protection-floor-apply-before-the-config-file-exists.md`'s citation-form note. All were re-verified today and all still stand. The reconciler writes into files nobody re-reads before the next session starts. That is worth a decision rather than a fourth annotation, and it is the reason this log leads with the corrections rather than burying them.
