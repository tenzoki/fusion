# Session: Step 3 — the two git routes into the protected list, and the deny reasons around them

**Date:** 2026-08-04
**Agent:** coder
**Status:** Complete
**Circle:** `260801-1244-guard-rules-write`
**Plan:** `260804-1633_*_plan-c5b-remediation-and-ship.md`, Step 3
**Baseline:** `f82ac02` (Step 2). Not committed — the orchestrator commits after validation.

---

## The three sentences

**Nothing newly allows.** Measured, not argued: a generated cross-product of 181,115
commands classified twice, once by the pre-change classifier extracted from `f82ac02`
and once by this one. 0 newly allowed, 9,462 newly denied, every one of the newly denied
attributable to exactly one of the two intended causes.

**Two classes closed, one instance closed, one issue refused and routed.** The
write-through-the-root class is closed for all three rows that walk. The option-walk
class is closed for every well-formed invocation whose unrecognised global options each
take at most one separated value, and the bound outside that is asserted in the suite
rather than claimed away. `260804-1347_*_the-git-directory-fail-closed-deny-tells-the-agent-to-drop-a-cd-that-is-not-in-the-command.md`'s deny reason is closed outright.
`260804-1348_*_the-two-spellings-of-the-revert-strategy-still-disagree-at-head-and-checkouts-second-cost-is-unreachable.md`'s code half is refused with an argument and filed as a decision, because
taking it would have been this Circle's first new allow.

**The structural no-new-allow property survives, and survives structurally.** The
`writesThrough` change can only add a deny — `ancestorOfProtected` is byte-identical for
every non-root path and returns null at the root exactly as before unless the flag is
set. The resumed walk's candidate set is a provable superset of the old one, and a
resumed walk can only record more directories, which can only add a candidate base.
Neither mechanism has a path by which a fact removes reach.

---

## What was changed

`hooks/lib/bash-mutation-guard.ts`, four seams:

1. **`resolveGit` resumes the option walk** (`260804-1344_*_the-git-option-walk-stops-at-an-unknown-options-value-so-a-c-behind-it-is-invisible.md`). A bare word is tested
   against the subcommand table; matching, it is the invocation. Not matching with an
   unrecognised option in front of it, it is that option's value and the walk continues
   from the next index, recording `-C` and `--work-tree`. Not matching with no
   unrecognised option in front of it, it is git's real subcommand and the walk stops —
   which is what keeps the walk out of the subcommand's own arguments, where `-C` means
   something else (`git commit -C HEAD~1`).
2. **`VerbSpec.writesThrough`**, set on `checkout`, `restore` and `clean`, consulted by
   pass 2 to lift the project-root exclusion for those rows only (`260804-1345_*_git-checkout-treeish-dash-dash-dot-overwrites-the-whole-protected-list-and-allows.md`, code
   half of `260804-1346_*_git-clean-fdx-at-the-project-root-is-still-a-residual-and-its-residual-entry-was-deleted.md`).
3. **`gitEffectiveBase`** — the directory a git invocation actually runs in. The
   `writesThrough` lift applies only there. See "What turned out wrong", item 1.
4. **`CwdUnknownCause` gains `git-directory`**, with `gitDirectoryReason` and its own
   dispatch arm (`260804-1347_*_the-git-directory-fail-closed-deny-tells-the-agent-to-drop-a-cd-that-is-not-in-the-command.md`). Plus `writesThroughReason`, so a write-through deny
   stops describing the `rm -rf hooks` mechanism.

Three in-module docstrings that had become false were corrected in the same pass: the
module header's "the project root itself is NOT treated as an ancestor", the
`MUTATION_GIT_SUBCOMMANDS` note claiming the `git clean` residual was resolved, and
`gitCleanWrites`'s "the everyday `git clean -fdx` is unaffected".

`hooks/lib/__tests__/bash-mutation-guard.test.ts` and
`hooks/lib/__tests__/guard-bash-integration.test.ts`: 54 cases added (33 unit, 21
integration). One existing case flipped by design — `git clean -fdx` and `git clean -fd`
were pinned in "the accepted residual" and now deny; the entry is rewritten to say why
rather than deleted.

---

## What turned out wrong in the plan's Step 3, discovered by building it

**1. `writesThrough` cannot be consulted at every candidate base, and the plan's
description implies it is.** The plan says the root exclusion "does not apply" for those
rows. A git invocation is checked against a UNION of directories — the shell's own plus
whatever `-C`/`--work-tree` name — so `git -C build clean -fdx` resolves its modelled
`.` to the project root at the shell's base. Lifting the exclusion there denies a
command that cleans `build` and nothing else, and that command is pinned as an allow in
`guard-bash-integration.test.ts` and named as a control in `260804-1346_*_git-clean-fdx-at-the-project-root-is-still-a-residual-and-its-residual-entry-was-deleted.md`. So the lift is
gated on `gitEffectiveBase`.

The alternative I rejected, and why it matters that I rejected it: dropping the shell's
own directory from the base set for model-supplied implicit operands would have been
tidier, and it **newly allows** `cd rules && git -C build clean -fdx`, which denies
today. That is the shape of `9aacab5`'s regression — a directory fact removing reach —
and it was one design decision away.

**2. "The class is closed" is again not what was built, and this time it is said so.**
The resumed walk closes every well-formed invocation whose unrecognised global options
take at most one separated value each. It does not close an option taking two, nor a
second bare word standing between the value and the subcommand
(`git --namespace foo bar -C rules rm x.md`, which resolves to nothing). Neither is a
fail-open in practice — git reads that second bare word as the subcommand and refuses
the command — but "not a fail-open in practice" is a different claim from "closed", and
`260804-1344_*_the-git-option-walk-stops-at-an-unknown-options-value-so-a-c-behind-it-is-invisible.md` exists because those two were conflated last time. The bound is a test
(`states the BOUND of the resumed walk rather than claiming the class closed`), not a
sentence in a docstring.

**3. `260804-1348_*_the-two-spellings-of-the-revert-strategy-still-disagree-at-head-and-checkouts-second-cost-is-unreachable.md` cannot be closed by this step, and the plan's Step 3 says it can.**
The plan: "`checkout` and `restore` are one operation with two flag grammars, and the
pass that adds a field to both rows is the pass that can make them agree." There is no
reconciliation a coder step may take. Teaching `restore` the `HEAD` exception newly
allows `git restore --source=HEAD <protected>` — the issue itself calls this "a first
for this Circle" and says it is worth a decision rather than a patch. Denying
`git checkout HEAD -- <path>` instead breaks fusion's own revert strategy. So:
- the test coverage the record asks for is delivered (the pair pinned with current
  verdicts, and `git checkout rules/a.md rules/b.md` pinned as a branch-policy block
  with its reason asserted);
- the code half is now
  `260804-1815_*_should-git-restore-source-head-become-inert-the-way-git-checkout-head-already-is.md`,
  recommending option 1;
- the two documentation halves are in `rules/protected-path-discipline.md`, Step 7's
  file — **and Step 7's `Closes` line does not name `260804-1348_*_the-two-spellings-of-the-revert-strategy-still-disagree-at-head-and-checkouts-second-cost-is-unreachable.md`**, so as the plan
  stands nothing owns them. Flagged on the issue.

**4. `260804-1346_*_git-clean-fdx-at-the-project-root-is-still-a-residual-and-its-residual-entry-was-deleted.md` is half-closed, and marking it `_c_` would repeat what it was filed
about.** The code half landed. The residual entry is Step 7 obligation 9, and the branch
that obligation anticipates is now decided: the entry is deleted for the right reason
(the root case is closed, not narrowed), while the two siblings that survive —
`git clean -fdx` from an unplaceable directory, and `GIT_WORK_TREE=` in the environment
(`260804-1332_*_git-work-tree-in-the-environment-relocates-the-write-and-the-classifier-reads-no-variable.md`) — must not go with it. Both records are `_p_`.

---

## What a consuming project loses, stated as the plan asks

`git clean -fdx` and `git clean -fdx .` at the project root, `git checkout <treeish> --
.` and `./`, and `git restore --source=<commit> .`. The rule: a `writesThrough` verb
whose pathspec resolves to the directory the invocation runs in, when that directory is
the project root, denies. The examples are an open set and the tests say so. The way
through is the literal file list, or the Human Gate. `git checkout HEAD -- .` stays
allowed and the suite proves it still reverts.

The `git clean -fdx` loss is the point rather than a side effect: the same command
deletes a rule file an agent has just written under `FUSION_ALLOW_RULES_WRITE` and not
yet committed, which is the workflow this Circle exists to enable.

The failure mode to watch is the one `260804-1347_*_the-git-directory-fail-closed-deny-tells-the-agent-to-drop-a-cd-that-is-not-in-the-command.md` is about — a deny whose reason does
not name the alternative sends an agent to a program outside the verb table, which the
guard does not see at all. Both new reasons name their own cause and their own way
through, and both are asserted on the string rather than on the verdict.

---

## Verification

`npx vitest run` (not `npm test` — Step 8 owns `hooks/dist/`): **1448 passed, 25 files**,
up from 1394. `npx tsc --noEmit` clean.

Every git row that claims a file is touched is asserted through a real guard subprocess
against a throwaway project root, then run through a real shell in a SECOND fresh
repository, in **bash 3.2 and zsh 5.9**. Every deny asserts its reason does not contain
`[HALTED]`.

**Cost, measured in both directions against a generated cross-product** — 11 command
prefixes × 25 git global-option strings × 22 operands × 32 git forms, plus 20 non-git
verb forms over the same operands and prefixes, de-duplicated to 181,115 commands.
Classified by the `f82ac02` module and by this one:

| | count |
|---|---|
| denied by both | 43,502 |
| allowed by both | 128,151 |
| **newly allowed** | **0** |
| newly denied | 9,462 |

The newly-denied set has exactly two causes, read off the deny reason rather than
guessed: 1,174 are a `writesThrough` verb at the project root (672 of them with no
unrecognised global option in the command); the remaining 8,288 all carry an
unrecognised global option and are the resumed walk resolving an invocation that
previously resolved to nothing. No row landed in an "other" bucket.

**Anti-vacuity by mutation.** Four, each applied to a checksummed copy and reverted with
the checksum re-verified:

| mutation | fails | is that what was predicted? |
|---|---|---|
| drop `writesThrough` from the `checkout` row | 8 — every one a `checkout` row, plus the table-shape assertion | yes: `260804-1345_*_git-checkout-treeish-dash-dash-dot-overwrites-the-whole-protected-list-and-allows.md` says "the `checkout HEAD~1 -- .` row and no other". No `restore` row, no `clean` row, no allow row moved |
| remove the root exclusion outright | 18, including `cp build/out.js .` and `mv build/out.js .` | yes: `260804-1345_*_git-checkout-treeish-dash-dash-dot-overwrites-the-whole-protected-list-and-allows.md` names the `cp x .` row. It also breaks `git -C build clean -fdx`, which is what the `effective` gate is for |
| revert the walk resumption to the two-adjacent-candidate fix | 8 — the three measured rows in both shells, plus two unit assertions | yes: `260804-1344_*_the-git-option-walk-stops-at-an-unknown-options-value-so-a-c-behind-it-is-invisible.md` says it "must fail at least the `--namespace foo -C rules` row and must NOT fail the `-C build` allow row". The allow row held |
| delete the `git-directory` cause | 3 — one unit, two integration, all reason assertions | yes: `260804-1347_*_the-git-directory-fail-closed-deny-tells-the-agent-to-drop-a-cd-that-is-not-in-the-command.md` says "the two reason assertions must fail and nothing else" |

---

## Files changed

- `hooks/lib/bash-mutation-guard.ts`
- `hooks/lib/__tests__/bash-mutation-guard.test.ts`
- `hooks/lib/__tests__/guard-bash-integration.test.ts`
- `260804-1344_*_…` (renamed `_o_`→`_c_`)
- `260804-1345_*_…` (renamed `_o_`→`_c_`)
- `260804-1346_*_…` (renamed `_o_`→`_p_`)
- `260804-1347_*_…` (renamed `_o_`→`_c_`)
- `260804-1348_*_…` (renamed `_o_`→`_p_`)
- `260804-1815_*_…` (new)
- `260804-1633_*_plan-c5b-remediation-and-ship.md` (Step 3 marked `[DONE]`)

Nothing outside Step 3's scope was touched: `hooks/lib/config.ts`, `bin/monitor`,
`templates/`, `README-hooks.md`, `rules/protected-path-discipline.md` and
`hooks/lib/rules-write-exemption.ts` are unchanged, and `hooks/dist/` was not rebuilt.
