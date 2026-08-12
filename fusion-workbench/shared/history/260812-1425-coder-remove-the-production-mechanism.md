# Coder — step 6 of the protected-path removal

**Date:** 2026-08-12 14:25
**Agent:** coder
**Status:** Complete
**Dispatched by:** orchestrator
**Plan:** `shared/planning/260812-1232_p_remove-the-protected-path-half-of-the-compliance-guard.md`, step 6

---

## What was asked

The production removal the first five steps were preparing: six modules and a shell wrapper
deleted, the before-fingerprint and CHECK 2 cut out of `guard.ts`, job 1 cut out of
`tracker.ts`, two functions cut out of `paths.ts`, and the file headers rewritten rather than
left describing a mechanism that no longer exists. Plus four loose ends the previous executor
handed over, none of which is on the plan's step-6 file list.

## Verification

`cd hooks && npm test` — exit 0.

| | Test files | Tests | Vitest duration | `npm test` wall clock |
|---|---|---|---|---|
| Baseline at `3a83133` | 48 | 1001 | 59.72 s | 61.68 s |
| After step 6 | 48 | 1000 | 89.82 s | 91.78 s |

One case fewer, and it is not a case this step chose to remove — see "The plan got this wrong",
item 1.

### The wall clock went UP by 30 s, and it is not this change

Reported as measured rather than explained away, then attributed, because a mechanism that ran
twice per guarded tool call was just deleted and the suite getting slower is the wrong direction.

Reproduced twice (84.02 s and 89.82 s) against a 59.72 s baseline. Per-file diff of the two runs
puts +29.97 s of the delta in ONE file, `fusion-plane.test.ts` — a bash-driven suite over
`bin/fusion-plane`, which imports nothing this step touched and is the suite's critical path, so
the wall clock is bounded by it. The next four movers (`state-drift`, `fusion-paths`,
`staging-drift`, `review-coverage`) are all git- and shell-spawn heavy and equally untouched. The
guard's own files did not move disproportionately.

Run alone and uncontended, `fusion-plane.test.ts` takes **52.43 s** — FASTER than the 58.92 s it
recorded inside the baseline run. `uptime` at the time of measurement reported load averages
5.18 / 9.62 / 7.07 on a machine with ten user sessions. CPU utilisation across the run fell from
514 % at baseline to 434 %, which is the signature of a busier machine rather than of more work.

So: the delta is host load, not this change. **No speedup is claimed either** — an uncontended
full-suite number was not obtainable, so the honest statement is that this step's effect on suite
time was not measured. The plan expected none from step 6; the 200 s it forecast was step 5's and
was already collected there.

Line counts, `hooks/` source only (`hooks/dist/` excluded; it is committed and was rebuilt):
**336 added, 3,449 removed.** The six deleted modules account for 2,464 of that
(`rules-write-exemption.ts` 838, `protected-snapshot.ts` 802, `fs-locator.ts` 268,
`protected-paths.ts` 268, `reverted-copy.ts` 188), `tracker.ts` for 555 and `guard.ts` for 298.
`bin/fusion-protected-paths` adds 100 lines outside `hooks/`.

The build was run before the suite, as the plan directs. `npm test` runs `rm -rf dist && tsc`
first, so the 20 compiled orphans under `hooks/dist/` went with their sources rather than
sitting there letting the suite pass against code the tree no longer holds.

## What was removed

Deleted outright: `hooks/lib/protected-snapshot.ts`, `hooks/lib/rules-write-exemption.ts`,
`hooks/lib/fs-locator.ts`, `hooks/lib/reverted-copy.ts`, `hooks/protected-paths.ts`,
`bin/fusion-protected-paths`.

`guard.ts` — the before-fingerprint, CHECK 2 with its exemption branch, `isExemptRulePath`,
`exemptionRefusalNote`, the `fsLocator` constant, and five imports.

`tracker.ts` — the whole "The measurement" section (466 lines: `measureProtectedPaths`,
`restorePath`, `preserve`, `describe`, `narrowingTarget`, `splitOffExempted`, `MeasuredOutcome`,
`Preserved`), its call site in `main`, and seven orphaned imports. The escalation import block
went entirely: `raiseHalt`, `loadEscalation`, `saveEscalation` and `clearHaltCommand` had no
other reader in this file. So did `projectDeclaredProtectedPaths`, the `GuardConfig` type and
`projectRelative`.

`paths.ts` — `matchesAnyFolded` and `canonicalise`.

## The `paths.ts` survivor check, which the plan asked for by name

Grepped across `hooks/` and `bin/`, excluding `dist/` and the test tree:

| Function | Production callers after the removal | Verdict |
|---|---|---|
| `matchesAny` | 3 — `config.ts findRelevantDecisions`, `churn.ts` noise filter, `tracker.ts` noise filter | keeps its subject |
| `foldCase` | 1 — the review-coverage store comparison at `tracker.ts` | keeps its subject |
| `collapseSegments` | 1 — `guard.ts`, above CHECK 3 | keeps its subject |
| `matchesPattern` | **0** | see below |

**`matchesPattern` lost its last external caller to this removal and it was not predicted.** At
`3a83133` it had one outside its own module: the exemption's ancestor pass at
`rules-write-exemption.ts:404-405`. What is left is `matchesAny` calling it from three lines
below, plus `paths.test.ts`, which covers it directly. It is not dead and it was not deleted —
the plan lists it as staying, and unit coverage of the glob compiler is worth more than the
narrowed visibility. A note saying exactly this now sits on the function, so the next reader
does not have to re-derive it. `globToRegex` is in the same position and always was; that one
this removal did not change.

## The headers, rewritten rather than cut around

Six files. In each the deleted mechanism is *named* rather than silently dropped, because its
absence is what a reader of an older tree, an older README or an existing `events.jsonl` comes
looking for.

- **`guard.ts` header** — "three things" became two, with a paragraph on what the third was and
  why it went.
- **`guard.ts` `isFusionPluginCwd()` stand-down** — the plan's own instruction, and the one that
  needed the most care. The comment said the stand-down exists because the protected paths are
  what a fusion developer edits. It now says what the branch actually stands down: CHECK 1, the
  halt, and CHECK 3, the decision-governed check — neither of which was ever its reason, and one
  of which (CHECK 3) is inert in every shipped layer, so standing it down is currently standing
  down nothing. It cites
  `shared/decisions/260812-1232_o_does-the-write-guards-fusion-repo-stand-down-survive-the-loss-of-its-subject.md`
  and says in as many words that the branch's continued existence is not that record's answer.
- **`guard.ts` Bash branch** — Bash reached this hook for the before-fingerprint and for nothing
  else. It now allows immediately. The comment also records the cost that got worse: a halted
  session's shell was never blocked, and until today the measurement caught what it did to a
  protected path. It does not any more.
- **`tracker.ts` header** — job 1 is described as removed, in place, with a sentence saying
  nothing replaced it. The numbering deliberately keeps its gap (0, 0b, 0c, 2).
- **`session-start.ts` docstring** — the protected-list bullet was the sharpest of the three
  cwd-anchored checks it warns about and is gone; the remaining two are restated. The residual
  issue `260804-2100_o` is still cited and described as **open and now moot** rather than as
  closed, because closing it is a reconciler's act.
- **`paths.ts` header** and its three surviving docstrings — the two-matched-sets asymmetry is
  recorded as history, because it is why `collapseSegments` keeps a trailing separator and
  someone re-deriving that from the one surviving caller would find no argument either way.

Three more that the plan did not list but that cited the deleted modules in load-bearing prose:
`lib/self-detect.ts` (its whole reason-for-existing paragraph, plus a citation of the deleted
`protected-snapshot-subdirectory.test.ts`), `lib/guard-state-file.ts` (its "what is NOT routed
through here" section named exactly one module, now deleted), and four comments inside `guard.ts`
and `tracker.ts` that cited deleted test files or described the fingerprint as a live thing.

### One case-folding claim inherited a falsified premise

`paths.ts` `matchesAny` now carries the only path match in the guard. The deferred decision
`circles/260801-1244-guard-rules-write/decisions/260804-1632_d_should-findrelevantdecisions-fold-case-…`
rests on two grounds, and the second — "this is CHECK 3, not CHECK 2; `guard.protectedPaths` is
matched folded and is unaffected either way" — has no other side left. The docstring says so and
says the record is the user's to re-open. The behaviour is unchanged. The plan predicted this in
its Open Questions; this records that the code now states it too.

## The four loose ends

1. **`.gitignore`** — the `!bin/fusion-protected-paths` exception is gone. The comment above the
   block only told an editor to ADD a line when a helper arrives; it now also says to remove one
   when a helper goes, and says why (nothing checks the list against `bin/`, so a stale exception
   reads as a helper that failed to ship). The gate was not built, as directed. It was checked by
   hand instead: `diff <(git ls-files bin/ | sort) <(grep '^!bin/' .gitignore | sed 's/^!//' | sort)`
   is now empty.
2. **`childEnv`'s `FUSION_ALLOW_RULES_WRITE` strip** — **kept**, docstring rewritten. The file
   already held the precedent, in `CDPATH`: a variable that once moved a verdict is not handed
   back to the child on the strength of the mechanism having gone. Both entries are now inert and
   the paragraph says so for both, along with the reason the strip is cheap and the cost of being
   wrong is not (a suite green on two machines while one of them checks nothing).
3. **`runGovernedWrite`** — **removed.** Not by rights this step's, and the previous executor said
   so; it also said the helper "should go with the harness's next edit", and this is that edit.
   Re-verified uncalled anywhere before removing. Taking it now costs one line of diff; leaving it
   costs a third handover of the same three sentences.
4. **`rules/retired/.keep` and `.claude/rules/local.md`** — **removed** from `SEED_FILES`. They
   were the exemption suite's operands and the exemption is now deleted. Re-grepped first: every
   remaining mention of those paths in the test tree is a string literal in an event payload, a
   lint fixture or a comment, and none is a filesystem write into a harness project. The comment
   above the map now also states the rule that makes the map worth guarding: a file here is paid
   for by every project in the suite, so a single case's operand belongs in that case's own
   `files` option.

## What the plan got wrong

Three things, and the second is the one that would have stopped this step.

1. **`config.test.ts` had to be touched in step 6, and the plan assigns it to step 7.** Line 19
   imported `RULE_DIR_PATTERNS` from `rules-write-exemption.js`, and deleting that module made the
   whole file fail to load — not one case red, the suite unable to collect. The case it fed
   ("protects every rule root the FUSION_ALLOW_RULES_WRITE flag exempts") is not one of step 7's
   `protectedPaths` cases at all: its subject is the exemption, not the loader. Removed here, with
   a comment in its place recording what it asserted, which defect it came from, and why it was
   deleted a step early. The two cases that ARE step 7's — the shipped list's contents and
   `projectDeclaredProtectedPaths` — are untouched and still pass. **This is the −1 in the test
   count**, so the suite is otherwise unchanged case-for-case.

2. **Step 6 cannot be green without editing `README-hooks.md`, which the plan reserves for step
   9.** Two lint gates inside `hooks/`'s own suite read it:
   - `derivable-enumerations-lint.test.ts` re-derives the `hooks/lib` file table from the files
     that actually exist and diffs it against the documented list. Four rows named deleted modules.
   - `reference-resolution-lint.test.ts` flagged `README-hooks.md:251`, a citation of
     `hooks/lib/rules-write-exemption.ts`.

   Both failed on the first run of this step: 2 files, 2 cases, everything else green. Step 9's
   own line in the plan explicitly claims "the protected-path rows of the `hooks/lib` file table"
   — which is precisely the edit step 6's gate forces. The plan filed a step-6-gated edit three
   steps late.

   **What was done, and deliberately no more:** the four table rows, and the one paragraph
   carrying the dangling citation (the hard-link refusal, which names both the deleted module and
   its `REFUSAL_NOTES["hard-link"]` constant). Everything else in `README-hooks.md` — the whole
   "Protected paths are measured, not predicted" section, the ASCII diagram at lines 46-55, the
   tuning table, the per-project configuration section, "three things cause a block" — is left
   exactly as it was, for step 9. Six lines removed in total.

   **Step 9 must not treat the file as already handled.** It is now *more* internally inconsistent
   than it was, not less: a section describing the measurement in full detail, above a file table
   that no longer lists any of its modules.

3. **A gap in `reference-resolution-lint`, found by accident and not closed.** It caught
   `hooks/lib/rules-write-exemption.ts` at line 251 and missed the same module at line 293, and
   `lib/protected-snapshot.ts` at lines 151 and 174, because those are spelled `lib/…` without the
   `hooks/` prefix and the lint does not recognise that as a path token. Not fixed here — it is not
   this step's, and the surviving citations are step 9's to remove anyway. Worth a record: the lint
   that exists to stop dangling citations does not see the spelling this repository's own hook
   modules use most.

## Not done, and deliberately

- **Configuration untouched.** `hooks/lib/config.ts` still declares and merges
  `guard.protectedPaths`; `hooks/config.json` still ships the eight patterns. Nothing reads either
  any more. That is the intended intermediate state (steps 7 and 8).
- **`rules/protected-path-discipline.md` still ships and `bin/fusion-rules` still emits it.**
  Step 9.
- **No verification against a non-fusion project root.** Step 10, and the release process requires
  it before any guard change ships: the stand-down in this repository makes a green suite here
  necessary and not sufficient. The suite's own integration cases do spawn throwaway roots that are
  not this repository, which is what carries the risk for now.
- **No commit.** The orchestrator commits.

## For the reconciler, when step 10 is done

`circles/260801-1244-guard-rules-write/issues/260804-2100_o_from-a-subdirectory-cwd-the-protected-list-matches-nothing-while-fail-closed-still-denies.md`
is open and its subject was deleted today. It is not in the plan's closing list. `session-start.ts`
cites it and says it is moot; nothing has closed it.
